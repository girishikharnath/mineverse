// Compliance Tracker database (used by routes/compliance.js and seed-admin.js).
// Everything the server stores lives in ./data (created on first run):
//   data/tracker.db      Compliance Tracker accounts + document records (SQLite)
//   data/uploads/        Compliance Tracker PDFs (never served directly)
//   data/inspections.json  Inspections module data
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.NETLIFY
  ? path.join('/tmp', 'coal-ministry-data')
  : path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'tracker.db'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','mine')),
  mine_name TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('compendium','report')),
  file_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected')),
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = { db, DATA_DIR, UPLOAD_DIR };
