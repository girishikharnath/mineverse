// Compliance Tracker API  ->  mounted at /api/compliance
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { db, UPLOAD_DIR } = require('../db');

let secret = process.env.SESSION_SECRET;
if (!secret) {
  secret = crypto.randomBytes(32).toString('hex');
  console.warn('SESSION_SECRET not set: using a random one (everyone is logged out on restart).');
}

const router = express.Router();
router.use(express.json({ limit: '10kb' }));
router.use(session({
  name: 'moc.sid',
  secret, resave: false, saveUninitialized: false,
  cookie: {
    httpOnly: true, sameSite: 'lax', path: '/api/compliance',
    secure: process.env.COOKIE_SECURE === 'true', maxAge: 8 * 3600 * 1000,
  },
}));

// ---------- helpers ----------
const requireLogin = (req, res, next) =>
  req.session.user ? next() : res.status(401).json({ error: 'Please log in first.' });
const requireAdmin = (req, res, next) =>
  req.session.user && req.session.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access only.' });

function startSession(req, res, u) {
  req.session.regenerate(() => {
    req.session.user = { id: u.id, role: u.role, mine_name: u.mine_name, email: u.email };
    res.json({ user: req.session.user });
  });
}

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, message: { error: 'Too many attempts. Try again in 15 minutes.' } });

// ---------- auth ----------
router.get('/me', (req, res) => res.json({ user: req.session.user || null }));

router.post('/register', loginLimiter, async (req, res) => {
  const mine_name = String(req.body.mine_name || '').trim().slice(0, 150);
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!mine_name) return res.status(400).json({ error: 'Enter the coal mine name.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email))
    return res.status(400).json({ error: 'This email is already registered. Log in instead.' });
  const hash = await bcrypt.hash(password, 10);
  const info = db.prepare("INSERT INTO users (role, mine_name, email, password_hash) VALUES ('mine', ?, ?, ?)").run(mine_name, email, hash);
  startSession(req, res, { id: info.lastInsertRowid, role: 'mine', mine_name, email });
});

router.post('/login', loginLimiter, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const ok = u && (await bcrypt.compare(String(req.body.password || ''), u.password_hash));
  // "as: admin" forms only accept admin accounts
  if (!ok || (req.body.as === 'admin' && u.role !== 'admin'))
    return res.status(401).json({ error: 'Incorrect email or password.' });
  startSession(req, res, u);
});

router.post('/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));

// ---------- public lists (approved only) ----------
router.get('/documents', (req, res) => {
  const category = req.query.category === 'compendium' ? 'compendium' : 'report';
  res.json(db.prepare(`
    SELECT d.id, d.title, d.created_at, CASE WHEN u.role = 'mine' THEN u.mine_name END AS mine_name
    FROM documents d JOIN users u ON u.id = d.uploaded_by
    WHERE d.category = ? AND d.status = 'approved' ORDER BY d.id DESC`).all(category));
});

// Approved files are public; pending/rejected only for the owner and admins
router.get('/files/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  const u = req.session.user;
  const allowed = d && (d.status === 'approved' || (u && (u.role === 'admin' || u.id === d.uploaded_by)));
  if (!allowed) return res.sendStatus(404);
  const safeName = encodeURIComponent(d.title).replace(/['()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  res.type('application/pdf');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${safeName}.pdf`);
  res.sendFile(path.join(UPLOAD_DIR, d.file_name));
});

// ---------- upload ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + '.pdf'),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
});

router.post('/upload', requireLogin, (req, res) => {
  upload.single('pdf')(req, res, (err) => {
    const f = req.file;
    const fail = (msg) => { if (f) fs.unlink(f.path, () => {}); return res.status(400).json({ error: msg }); };
    if (err) return fail(err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Maximum size is 20 MB.' : 'Upload failed. Try again.');
    if (!f) return fail('Choose a PDF file to upload.');

    const head = Buffer.alloc(5);
    const fd = fs.openSync(f.path, 'r');
    fs.readSync(fd, head, 0, 5, 0);
    fs.closeSync(fd);
    if (head.toString() !== '%PDF-') return fail('This file is not a valid PDF.');

    const title = String(req.body.title || '').trim().slice(0, 200);
    if (!title) return fail('Enter a title for the document.');

    // The server decides category and status from the role; never trust the client.
    const isAdmin = req.session.user.role === 'admin';
    const category = isAdmin && req.body.category === 'compendium' ? 'compendium' : 'report';
    const status = isAdmin ? 'approved' : 'pending';
    db.prepare('INSERT INTO documents (title, category, file_name, status, uploaded_by) VALUES (?, ?, ?, ?, ?)')
      .run(title, category, f.filename, status, req.session.user.id);
    res.json({ ok: true, status });
  });
});

router.get('/my-documents', requireLogin, (req, res) =>
  res.json(db.prepare('SELECT id, title, status, created_at FROM documents WHERE uploaded_by = ? ORDER BY id DESC').all(req.session.user.id)));

// ---------- admin ----------
router.get('/admin/pending', requireAdmin, (req, res) =>
  res.json(db.prepare(`
    SELECT d.id, d.title, d.created_at, u.mine_name, u.email
    FROM documents d JOIN users u ON u.id = d.uploaded_by
    WHERE d.status = 'pending' ORDER BY d.id`).all()));

router.post('/admin/documents/:id/:action', requireAdmin, (req, res) => {
  const status = { approve: 'approved', reject: 'rejected' }[req.params.action];
  if (!status) return res.status(400).json({ error: 'Unknown action.' });
  const r = db.prepare("UPDATE documents SET status = ? WHERE id = ? AND status = 'pending'").run(status, req.params.id);
  res.json({ ok: r.changes > 0 });
});

// List approved/rejected documents so the admin can manage (delete) them
router.get('/admin/documents', requireAdmin, (req, res) =>
  res.json(db.prepare(`
    SELECT id, title, category, status, created_at
    FROM documents WHERE status != 'pending' ORDER BY id DESC`).all()));

// Delete the database row and the PDF file itself
router.delete('/admin/documents/:id', requireAdmin, (req, res) => {
  const d = db.prepare('SELECT file_name FROM documents WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Document not found.' });
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  fs.unlink(path.join(UPLOAD_DIR, d.file_name), () => {});
  res.json({ ok: true });
});

module.exports = router;
