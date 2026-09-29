/* Module pages: page.html?p=<compliance-tracker/<view> | inspections | ...> */
(function () {
  'use strict';
  var S = window.SITE, esc = S.util.esc, $ = function (s) { return document.getElementById(s); };
  var raw = new URLSearchParams(location.search).get('p') || '';
  if (!raw) { location.replace('index.html'); return; }
  var p = raw === 'compliance-tracker' ? 'compliance-tracker/compendium' : raw;
  var top = p.split('/')[0], item = S.util.find(top);
  var title = item ? item.t : 'Page not found';
  var el = $('pg');
  var setTitle = function (t) { $('page-title').textContent = t; document.title = t + ' | KhanDrishti'; };
  setTitle(title);

  var loadCss = function (h) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; document.head.appendChild(l); };
  var loadJs = function (s) { return new Promise(function (ok, no) { var e = document.createElement('script'); e.src = s; e.onload = ok; e.onerror = function () { no(new Error('Could not load ' + s)); }; document.body.appendChild(e); }); };
  var fail = function (e) { el.innerHTML = '<p class="err" role="alert">' + esc(e.message) + '</p>'; };

  if (top === 'compliance-tracker') {
    var tabs = [['compendium', 'Clearance compendium'], ['reports', 'Clearance report for coal mines'], ['upload', 'Upload clearance report'], ['admin', 'Login as admin']];
    var view = p.split('/')[1];
    $('tabs').hidden = false;
    $('tabs').innerHTML = tabs.map(function (t) { return '<a href="page.html?p=compliance-tracker/' + t[0] + '"' + (t[0] === view ? ' class="on" aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join('');
    el.innerHTML = '<p class="note">Loading…</p>';
    loadCss('modules/compliance/compliance.css');
    loadJs('modules/compliance/compliance.js')
      .then(function () { window.ComplianceTracker.mount(view, el, { title: title, setTitle: setTitle }); })
      .catch(fail);
  } else if (top === 'inspections') {
    /* the Inspections module draws its own breadcrumb and heading */
    $('pg-head').hidden = true;
    el.innerHTML = '<div id="inspection-app" aria-live="polite"></div>';
    loadCss('modules/inspection/inspection.css');
    ['config.js', 'storage.js', 'app.js'].reduce(function (c, f) { return c.then(function () { return loadJs('modules/inspection/' + f); }); }, Promise.resolve()).catch(fail);
  } else {
    el.innerHTML = item
      ? '<div class="ph"><h2>' + esc(title) + '</h2><p>This module is not built yet. Add its content in <code>js/page.js</code>, or create a dedicated HTML file and link the sidebar item to it in <code>js/data.js</code>.</p></div>'
      : '<div class="ph"><h2>Page not found</h2><p><a href="index.html">Back to Overview</a></p></div>';
  }
})();
