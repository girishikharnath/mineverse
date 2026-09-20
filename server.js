// Ministry of Coal website: one server for the site, the Compliance Tracker and Inspections.
//   /                      static site (public/)
//   /api/compliance/...    Compliance Tracker API (login, PDF uploads, admin verification)
//   /api/inspections/...   Inspections API (organizations, mines, inspection reports)
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
const app = express();
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.use(express.static(path.join(__dirname, 'public')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Ministry of Coal site running at http://localhost:${PORT}`);
    console.log(`  Compliance Tracker: http://localhost:${PORT}/page.html?p=compliance-tracker`);
    console.log(`  Inspections:        http://localhost:${PORT}/page.html?p=inspections`);
  });
}

module.exports = app;
