/* Overview: KPI strip + mines under monitoring. */
(function () {
  'use strict';
  var S = window.SITE, esc = S.util.esc, $ = function (s) { return document.querySelector(s); };
  var risk = function (m) { return m.sc < 75 ? ['HIGH', 'high'] : ['MEDIUM', 'med']; };
  var tone = function (v) { return v >= 80 ? 'good' : v >= 50 ? 'mid' : 'bad'; };
  var num = function (v) { return (Math.round(v * 10) / 10) + '%'; };

  $('#kpis').innerHTML = S.kpis.map(function (k) {
    return '<li><a href="' + k.h + '"><span>' + esc(k.l) + '</span><b class="' + k.c + '">' + k.v + '</b><small class="' + k.c + '">' + esc(k.s) + '</small></a></li>';
  }).join('');

  var mine = S.mines[0], cat = 'Licensing', open = null;
  var fromHash = location.hash.match(/mine-(\w+)/);
  if (fromHash) S.mines.forEach(function (m) { if (m.k === fromHash[1]) mine = m; });

  function status(m, c, i, r) {
    var o = m.o[r[0]]; if (o) return o;
    return (i + 1) / 3 <= m.cs[S.cats.indexOf(c)] / 100 + 0.0001 ? 'PASS' : 'FAIL';
  }
  var evidence = {
    PASS: 'Document verified against the register during the latest inspection.',
    FAIL: 'Non-compliance recorded in the latest inspection report; corrective action is open.',
    UNCERTAIN: 'Evidence submitted is incomplete; pending review by the compliance officer.'
  };

  function list() {
    $('#mine-list').innerHTML = S.mines.map(function (m) {
      var r = risk(m);
      return '<li><button type="button" data-k="' + m.k + '"' + (m === mine ? ' class="on"' : '') + '><b>Mine ' + m.k + ' — ' + esc(m.name) + '</b>' +
        '<small>' + esc(m.st) + ' · Coal · Lic. ' + esc(m.lic) + '</small>' +
        '<span><i class="tag ' + r[1] + '">' + r[0] + '</i> ' + num(m.sc) + ' · ' + m.v + ' violations</span></button></li>';
    }).join('');
  }
  function detail() {
    var r = risk(mine);
    var cats = S.cats.map(function (c, i) {
      var v = mine.cs[i];
      return '<button type="button" data-c="' + c + '" class="cat' + (c === cat ? ' on' : '') + '"><small>' + c + '</small><b class="' + tone(v) + '">' + num(v) + '</b><u><s class="' + tone(v) + '" style="width:' + v + '%"></s></u></button>';
    }).join('');
    var reqs = S.reqs[cat].map(function (q, i) {
      var st = status(mine, cat, i, q), key = mine.k + q[0];
      return '<li><button type="button" data-r="' + key + '" aria-expanded="' + (open === key) + '"><code>' + q[0] + '</code><span>' + esc(q[1]) + (q[2] ? ' <em>CRITICAL</em>' : '') + '</span><i class="st ' + st.toLowerCase() + '">' + st + '</i></button>' +
        (open === key ? '<p>' + evidence[st] + '</p>' : '') + '</li>';
    }).join('');
    $('#mine-detail').innerHTML =
      '<header><div><h2>Mine ' + mine.k + ' — ' + esc(mine.name) + '</h2><small>Mine ID ' + mine.n + ' · Compliance computed from 19 requirements</small></div>' +
      '<div class="sc"><small class="' + r[1] + '">' + r[0] + ' RISK</small><b>' + num(mine.sc) + '</b><small>' + mine.v + ' violations · ' + mine.w + ' warnings · ' + mine.pr + ' pending review</small></div></header>' +
      '<div class="cats">' + cats + '</div><h3>' + cat + ' requirements</h3><p class="hint">Click a requirement to see the evidence behind its status.</p><ul class="reqs">' + reqs + '</ul>';
  }
  function draw() { list(); detail(); }
  $('#mine-list').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    S.mines.forEach(function (m) { if (m.k === b.dataset.k) mine = m; });
    open = null; draw();
  });
  $('#mine-detail').addEventListener('click', function (e) {
    var c = e.target.closest('[data-c]'), r = e.target.closest('[data-r]');
    if (c) { cat = c.dataset.c; open = null; }
    else if (r) open = open === r.dataset.r ? null : r.dataset.r;
    else return;
    detail();
  });
  draw();
})();
