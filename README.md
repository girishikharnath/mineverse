# Ministry of Coal website (with Compliance Tracker and Inspections)

The practice Ministry of Coal site, with the **Compliance Tracker** and **Inspections**
modules built into its menu. One Node.js server runs everything.

## Run it

1. Install Node.js 18 or newer from https://nodejs.org
2. In this folder:

   ```
   npm install
   node seed-admin.js admin@yourdomain.gov.in "ChooseAStrongPassword"
   npm start
   ```
3. Open http://localhost:3000

Open the site through this address. Double-clicking `public/index.html` still shows the
static pages, but Compliance Tracker and Inspections need the server to log in, upload
and save.

## Deploy to Netlify

The repository includes `netlify.toml` and a Netlify Function at
`netlify/functions/api.js`. Connect the repository in Netlify and deploy from the
project root; Netlify will publish `public/` and route `/api/*` to the Function.

Set `SESSION_SECRET` in the Netlify environment variables. Set `COOKIE_SECURE=true`
when using the HTTPS site.

Netlify Function storage is ephemeral. The SQLite database, uploaded PDFs and
`data/inspections.json` may be lost when a Function is redeployed or moved between
instances. Use a managed database and object storage before using this deployment for
real records.

## Where things are in the menu

| Menu item | Page | What it is |
|---|---|---|
| Compliance Tracker > Clearance compendium | `page.html?p=compliance-tracker/compendium` | Public list of PDFs the admin published |
| Compliance Tracker > Clearance report for coal mines | `.../reports` | Public list of reports the admin approved |
| Compliance Tracker > Upload clearance report | `.../upload` | A coal mine registers or logs in, uploads a PDF, tracks its status |
| Compliance Tracker > Login as admin | `.../admin` | Approve or reject pending reports, delete PDFs, upload directly |
| Inspections | `page.html?p=inspections` | Organizations > coal mine > inspection form > submitted report |

Clicking "Compliance Tracker" itself opens the Clearance compendium.

## Folder layout

```
server.js                   starts the site + both APIs
db.js                       Compliance Tracker database setup (SQLite)
seed-admin.js               creates or resets the admin account
routes/compliance.js        /api/compliance/...   login, PDF upload, admin rules
routes/inspections.js       /api/inspections/...  shared inspection data
public/                     the website itself (served as static files)
  index.html, page.html     home page and the inner-page template
  js/data.js                menu (Compliance Tracker now has its 4 sub-items)
  js/page.js                loads each module into page.html
  css/style.css
  modules/compliance/       compliance.js, compliance.css
  modules/inspection/       config.js, storage.js, app.js, inspection.css
data/                       created on first run (not public): tracker.db, uploads/, inspections.json
```

## Things you may want to change

- **Compliance Tracker admin account**: `node seed-admin.js <email> "<password>"` (run again to reset the password). There is no admin sign-up page.
- **Inspection organizations, types and checklist**: `public/modules/inspection/config.js`. Starting organizations load only when the server has no inspection data yet.
- **Menu wording / Hindi labels**: `public/js/data.js`.
- **Reset inspection test data**: stop the server, delete `data/inspections.json`, start again.

## Before going live

- Set `SESSION_SECRET` (a long random string). When serving over HTTPS also set `COOKIE_SECURE=true`, and `TRUST_PROXY=1` if you are behind nginx or a similar proxy.
- Serve the site over HTTPS.
- Back up the `data/` folder regularly.
- Compliance Tracker sessions are kept in memory, so restarting the server logs everyone out.
- **Inspections has no login.** Anyone who can reach the server can read and change inspection data through `/api/inspections`; the "signed in as" name inside the module is a label, not a password. Compliance Tracker does have real accounts. If Inspections will hold real data, put it behind a login (for example by reusing the Compliance Tracker accounts) before exposing the server beyond a trusted network.

## Rules enforced by the Compliance Tracker server

- PDFs only (checked by type and file header), up to 20 MB, saved under random names outside the public folder.
- A coal mine's upload is always a "report" with status "pending"; category and status are set by the server from the user's role.
- Pending and rejected files can be opened only by the admin and by the mine that uploaded them.
- Login and registration are limited to 15 attempts per 15 minutes per IP.
