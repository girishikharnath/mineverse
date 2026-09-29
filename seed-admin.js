// Usage: node seed-admin.js admin@example.com "YourStrongPassword"
const bcrypt = require('bcryptjs');
const { db } = require('./db');

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error('Usage: node seed-admin.js <email> <password (min 8 characters)>');
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 10);
const e = email.trim().toLowerCase();
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(e);
if (existing) {
  db.prepare("UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?").run(hash, existing.id);
  console.log('Admin password updated for', e);
} else {
  db.prepare("INSERT INTO users (role, mine_name, email, password_hash) VALUES ('admin', 'Ministry of Coal', ?, ?)").run(e, hash);
  console.log('Admin created:', e);
}
