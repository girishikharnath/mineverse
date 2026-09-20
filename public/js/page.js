/* Inner pages: page.html?p=<path>. Looks the path up in the menu and renders a page around it. */
(function () {
  'use strict';
  const S = window.SITE;
  const { esc, href, linkAttrs, find } = S.util;
  const $ = (s) => document.getElementById(s);

  const raw = new URLSearchParams(location.search).get('p') || '';
  if (!raw) { location.replace('index.html'); return; }
  /* Menu items that simply open their first sub-page */
  const alias = { 'compliance-tracker': 'compliance-tracker/compendium' };
  const p = alias[raw] || raw;

  /* Pages that are not in the main menu */
  const extra = {
    'whats-new': "What's New",
    'contact-us': 'Contact Us',
    'sitemap': 'Sitemap',
    'feedback': 'Feedback',
    'help': 'Help',
    'website-policy': 'Website Policy',
    'terms-and-conditions': 'Terms and Conditions',
    'web-information-manager': 'Web Information Manager',
    'disclaimer': 'Disclaimer',
    'minister/shri-g-kishan-reddy': 'Shri G. Kishan Reddy',
    'minister/shri-satish-chandra-dubey': 'Shri Satish Chandra Dubey'
  };

  const node = find(p);
  let title = node ? node.it.t : extra[p];
  if (!title) title = p.split('/').pop().replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase());

  /* ---------- breadcrumbs ---------- */
  const crumbs = [`<a href="index.html">Home</a>`];
  if (node) node.chain.forEach((c) => crumbs.push(c.p ? `<a href="${href(c)}">${esc(c.t)}</a>` : `<span>${esc(c.t)}</span>`));
  crumbs.push(`<span aria-current="page">${esc(title)}</span>`);
  $('crumbs').innerHTML = crumbs.join('<span class="sep" aria-hidden="true">/</span>');
  $('page-title').textContent = title;
  document.title = `${title} | Ministry of Coal, Government of India`;

  /* ---------- side menu (siblings within the top-level section) ---------- */
  if (node) {
    const top = node.chain[0] || node.it;
    if (top.c && top.c.length) {
      const list = (items) => `<ul>${items.map((it) => `
        <li><a href="${href(it)}"${linkAttrs(it)}${it.p === p ? ' aria-current="page" class="on"' : ''}>${esc(it.t)}</a>${it.c ? list(it.c) : ''}</li>`).join('')}</ul>`;
      $('side').innerHTML = `<h2>${esc(top.t)}</h2>${list(top.c)}`;
      $('side').hidden = false;
    }
  }
  if ($('side').hidden) document.querySelector('.page-grid').classList.add('no-side');

  /* ---------- content ---------- */
  const el = $('content');
  const docRow = (r, i) => `<tr>
    <td>${i + 1}</td>
    <td><a href="${S.files + r[1]}" target="_blank" rel="noopener">${esc(r[0])}</a></td>
    <td class="nowrap">${esc(r[2])}</td><td class="nowrap">${esc(r[3])}</td></tr>`;

  function docTable(rows) {
    el.innerHTML = `
      <label class="filter" for="flt">Filter this list</label>
      <input id="flt" type="search" placeholder="Type a word from the title">
      <div class="table-wrap"><table class="docs">
        <thead><tr><th scope="col">#</th><th scope="col">Title</th><th scope="col">Size</th><th scope="col">Date</th></tr></thead>
        <tbody>${rows.map(docRow).join('')}</tbody></table></div>
      <p class="note">Files open from the original coal.gov.in website.</p>`;
    $('flt').addEventListener('input', (e) => {
      const t = e.target.value.trim().toLowerCase();
      el.querySelectorAll('tbody tr').forEach((tr) => { tr.hidden = t && !tr.textContent.toLowerCase().includes(t); });
    });
  }

  function childLinks(items) {
    return `<h2 class="sub-h">In this section</h2><ul class="child-list">${items.map((c) => `<li><a href="${href(c)}"${linkAttrs(c)}>${esc(c.t)}</a></li>`).join('')}</ul>`;
  }

  function sitemap() {
    const list = (items) => `<ul>${items.map((it) => `<li><a href="${href(it)}"${linkAttrs(it)}>${esc(it.t)}</a>${it.c ? list(it.c) : ''}</li>`).join('')}</ul>`;
    el.innerHTML = `<div class="sitemap">${list(S.menu.slice(1))}</div>`;
  }

  function feedback() {
    el.innerHTML = `
      <form id="fb" class="form" novalidate>
        <p class="note">Demo form: nothing is sent anywhere. Connect it to your own backend or a form service.</p>
        <label for="fb-name">Name</label><input id="fb-name" required autocomplete="name">
        <label for="fb-mail">Email</label><input id="fb-mail" type="email" required autocomplete="email">
        <label for="fb-msg">Your feedback</label><textarea id="fb-msg" rows="6" required></textarea>
        <p id="fb-err" class="err" role="alert" hidden></p>
        <button class="btn" type="submit">Send feedback</button>
      </form>
      <p id="fb-ok" class="ok" role="status" hidden>Thank you. Your feedback has been recorded (demo only).</p>`;
    $('fb').addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $('fb-err');
      const bad = ['fb-name', 'fb-mail', 'fb-msg'].find((id) => !$(id).value.trim() || ($(id).type === 'email' && !$(id).checkValidity()));
      if (bad) {
        err.textContent = bad === 'fb-mail' ? 'Enter a valid email address.' : 'Fill in all fields before sending.';
        err.hidden = false;
        $(bad).focus();
        return;
      }
      err.hidden = true;
      $('fb').hidden = true;
      $('fb-ok').hidden = false;
    });
  }

  function contact() {
    el.innerHTML = `
      <div class="contact">
        <h2 class="sub-h">Ministry of Coal</h2>
        <address>Shastri Bhawan, Dr. Rajendra Prasad Road<br>New Delhi – 110001, India</address>
        <p class="note">Replace this address and add phone numbers and emails from the official contact page: <a href="${S.original}contact-us" target="_blank" rel="noopener">coal.gov.in/contact-us</a>.</p>
      </div>`;
  }

  function about() {
    el.innerHTML = `
      <p>The Ministry of Coal has the overall responsibility of determining policies and strategies in respect of exploration and development of coal and lignite reserves, sanctioning of important projects of high value and for deciding all related issues. Under the administrative control of the Ministry, these key functions are exercised through the Public Sector Undertakings, namely, Coal India Ltd. and its subsidiaries and Neyveli Lignite Corporation India Limited (NLCIL).</p>
      <p>Other than Coal India Ltd. and Neyveli Lignite Corporation India Ltd., the Ministry of Coal also has a joint venture with Government of Telangana called Singareni Collieries Company Limited. Government of Telangana holds 51% equity and Government of India holds 49% equity.</p>`;
  }

  /* ---------- built-in modules (need the Node server: see README) ---------- */
  const loadCss = (href) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  };
  const loadJs = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load ' + src));
    document.body.appendChild(s);
  });
  const moduleError = (e) => {
    el.innerHTML = `<p class="err" role="alert">${esc(e.message)}</p>`;
  };

  /* Compliance Tracker: page.html?p=compliance-tracker/<compendium|reports|upload|admin> */
  function complianceTracker() {
    const view = p.split('/')[1];
    el.innerHTML = '<p class="note">Loading…</p>';
    loadCss('modules/compliance/compliance.css');
    loadJs('modules/compliance/compliance.js')
      .then(() => window.ComplianceTracker.mount(view, el, {
        title,
        setTitle: (t) => { $('page-title').textContent = t; document.title = `${t} | Ministry of Coal, Government of India`; }
      }))
      .catch(moduleError);
  }

  /* Inspections: page.html?p=inspections. The module draws its own breadcrumb and heading,
     so the page heading is hidden and the content area is made full width. */
  function inspections() {
    document.querySelector('.page-head').hidden = true;
    const grid = document.querySelector('.page-grid');
    grid.classList.remove('wrap');
    grid.classList.add('full');
    el.classList.add('bare');
    el.innerHTML = '<div id="inspection-app" aria-live="polite"></div>';
    loadCss('modules/inspection/inspection.css');
    ['config.js', 'storage.js', 'app.js']
      .reduce((chain, f) => chain.then(() => loadJs('modules/inspection/' + f)), Promise.resolve())
      .catch(moduleError);
  }

  function placeholder() {
    if (node && node.it.isNew) {
      el.innerHTML = `
        <p class="lead"><strong>${esc(title)}</strong> <sup class="new-badge">New</sup></p>
        <p>This is a new module and does not exist on the original coal.gov.in website. Build its content here by editing <code>js/page.js</code>, or create a dedicated HTML file and point the menu item to it in <code>js/data.js</code>.</p>`;
      return;
    }
    const kids = node && node.it.c && node.it.c.length ? childLinks(node.it.c) : '';
    el.innerHTML = `
      <p class="lead">This is a placeholder for the <strong>${esc(title)}</strong> page.</p>
      <p>Add your own content here by editing <code>js/page.js</code>, or create a dedicated HTML file for this page and point the menu item to it in <code>js/data.js</code>.</p>
      <p>The original page is at <a href="${S.original}${esc(p)}" target="_blank" rel="noopener">coal.gov.in/${esc(p)}</a>.</p>
      ${kids}`;
  }

  if (p === 'whats-new') docTable(S.whatsNew);
  else if (p === 'media/press-release') docTable(S.press);
  else if (p === 'sitemap') sitemap();
  else if (p === 'feedback') feedback();
  else if (p === 'contact-us') contact();
  else if (p === 'about-us/about-ministry') about();
  else if (p.indexOf('compliance-tracker/') === 0) complianceTracker();
  else if (p === 'inspections') inspections();
  else placeholder();
})();
