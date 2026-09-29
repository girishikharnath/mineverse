// Inspections API  ->  mounted at /api/inspections
// Stores the four collections the front-end needs (orgs, mines, inspections,
// photos) in one JSON file: data/inspections.json.
// Same-origin only (the site and this API are served by the same server), so
// there is no CORS header here.
'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const { DATA_DIR } = require('../db');

const DATA_FILE = path.join(DATA_DIR, 'inspections.json');
const KEYS = ['orgs', 'mines', 'inspections', 'photos'];

const router = express.Router();
router.use(express.json({ limit: '25mb' })); // photos are base64 data URLs

function emptyState() {
  return { orgs: [], mines: [], inspections: [], photos: {} };
}

function readState() {
  try {
    return Object.assign(emptyState(), JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  } catch (e) {
    return emptyState();
  }
}

// Writes are queued one after another so two saves can never corrupt the file.
let writeQueue = Promise.resolve();
function writeState(state) {
  const job = writeQueue.catch(() => {}).then(() => new Promise((resolve, reject) => {
    const tmp = DATA_FILE + '.tmp';
    fs.writeFile(tmp, JSON.stringify(state), (err) => {
      if (err) return reject(err);
      fs.rename(tmp, DATA_FILE, (err2) => (err2 ? reject(err2) : resolve()));
    });
  }));
  writeQueue = job;
  return job;
}

router.get('/state', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(readState());
});

router.put('/state/:key', (req, res) => {
  const key = req.params.key;
  if (KEYS.indexOf(key) === -1) return res.status(400).json({ error: 'Unknown key: ' + key });
  if (typeof req.body !== 'object' || req.body === null) return res.status(400).json({ error: 'Body must be JSON' });
  const state = readState();
  state[key] = req.body;
  writeState(state)
    .then(() => res.json({ ok: true }))
    .catch((err) => res.status(500).json({ error: 'Could not save: ' + err.message }));
});

module.exports = router;
