/* App shell: sidebar + top bar on every page. */
(function () {
  'use strict';
  var S = window.SITE;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var href = function (it) { return it.p ? 'page.html?p=' + encodeURIComponent(it.p) : 'index.html'; };
  var ICON = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12l3 3 5-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.4 3.5 6"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
    file: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>'
  };
  var svg = function (n, s) { return '<svg viewBox="0 0 24 24" width="' + (s || 20) + '" height="' + (s || 20) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>'; };

  var all = S.menu.concat([S.settings]);
  var find = function (p) { for (var i = 0; i < all.length; i++) if (all[i].p === p) return all[i]; return null; };
  var here = location.pathname.split('/').pop() || 'index.html';
  var qp = (new URLSearchParams(location.search).get('p') || '').split('/')[0];
  var activeP = here === 'page.html' ? qp : '';
  S.util = { esc: esc, find: find };

  var link = function (it) {
    return '<a href="' + href(it) + '"' + (it.p === activeP ? ' class="on" aria-current="page"' : '') + '>' + svg(it.i) + '<span>' + esc(it.t) + '</span>' +
      (it.badge ? '<em class="badge">' + it.badge + '</em>' : '') + '</a>';
  };
  var u = S.user;
  document.getElementById('shell').innerHTML =
    '<a class="skip" href="#content">Skip to main content</a>' +
    '<aside class="side" id="side" aria-label="Main navigation">' +
      '<a class="brand" href="index.html"><svg viewBox="0 0 24 24" width="26" height="24" aria-hidden="true"><path d="M1 21L9 5l4 7 3-4 7 13z" fill="#e8a020"/></svg><b>KhanDrishti</b>' +
      '<small>Statutory Compliance &amp; Field Governance</small></a>' +
      '<nav><ul>' + S.menu.map(function (m) { return '<li>' + link(m) + '</li>'; }).join('') + '</ul></nav>' +
      '<div class="side-foot"><ul><li>' + link(S.settings) + '</li></ul></div>' +
    '</aside>' +
    '<div class="scrim" id="scrim"></div>' +
    '<header class="top">' +
      '<button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false">' + svg('grid') + '</button>' +
      '<div class="wm">Smart Coal Governance</div>' +
      '<div class="srch"><span class="srch-i">' + svg('search', 17) + '</span>' +
        '<input id="q" type="search" placeholder="Search mine, inspection ID, contractor..." autocomplete="off" aria-label="Search">' +
        '<ul id="q-res" aria-live="polite"></ul></div>' +
      '<a class="bell" href="page.html?p=reports-escalations" aria-label="' + S.notifications + ' notifications">' + svg('bell', 20) + '<em>' + S.notifications + '</em></a>' +
      '<div class="user"><span class="av">' + esc(u.ini) + '</span><span><b>' + esc(u.name) + '</b><small>' + esc(u.role) + '</small></span></div>' +
    '</header>';

  var side = document.getElementById('side'), burger = document.getElementById('burger');
  function nav(open) { side.classList.toggle('open', open); document.getElementById('scrim').classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); }
  burger.onclick = function () { nav(!side.classList.contains('open')); };
  document.getElementById('scrim').onclick = function () { nav(false); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { nav(false); res.innerHTML = ''; } });

  /* search: menu items and mines */
  var q = document.getElementById('q'), res = document.getElementById('q-res');
  var idx = all.map(function (m) { return { t: m.t, h: href(m), c: 'Menu' }; })
    .concat(S.mines.map(function (m) { return { t: 'Mine ' + m.k + ' — ' + m.name, h: 'index.html#mine-' + m.k, c: m.st + ' · ' + m.lic }; }));
  q.addEventListener('input', function () {
    var t = q.value.trim().toLowerCase();
    if (t.length < 2) { res.innerHTML = ''; return; }
    var hits = idx.filter(function (r) { return (r.t + ' ' + r.c).toLowerCase().indexOf(t) > -1; }).slice(0, 7);
    res.innerHTML = hits.length ? hits.map(function (r) { return '<li><a href="' + r.h + '">' + esc(r.t) + '<small>' + esc(r.c) + '</small></a></li>'; }).join('') : '<li class="none">No match. Try another word.</li>';
  });
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = res.querySelector('a'); if (a) location.href = a.getAttribute('href'); } });
  document.addEventListener('click', function (e) { if (!e.target.closest('.srch')) res.innerHTML = ''; });
})();
