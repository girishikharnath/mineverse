/*
 * Compliance Tracker (front end)
 * ------------------------------
 * Used by page.html?p=compliance-tracker/<view>. page.js calls:
 *     ComplianceTracker.mount(view, container, { setTitle })
 * where view is one of: compendium | reports | upload | admin.
 * All data comes from the server API at /api/compliance.
 */
(function () {
  'use strict';

  var API = '/api/compliance';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var fmtDate = function (s) {
    var d = new Date(String(s).replace(' ', 'T') + 'Z');
    return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  var PAGE = 'page.html?p=compliance-tracker/';

  var me = null;          // logged-in user, or null
  var root = null;        // container the current view renders into
  var currentView = '';
  var setTitle = function () {};
  var defaultTitle = '';

  function api(url, opts) {
    return fetch(API + url, Object.assign({ credentials: 'same-origin' }, opts)).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Something went wrong. Try again.');
        return data;
      });
    });
  }
  function post(url, body) {
    return api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  }
  function say(el, text, ok) { el.textContent = text; el.className = 'ct-msg ' + (ok ? 'good' : 'err'); }

  /* ---------- shared pieces ---------- */
  function docTable(rows, showMine) {
    if (!rows.length) return '<p class="ct-empty">No documents have been published here yet.</p>';
    var body = rows.map(function (d, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(d.title) + '</td>' +
        (showMine ? '<td>' + esc(d.mine_name || 'Ministry of Coal') + '</td>' : '') +
        '<td class="nowrap"><a href="' + API + '/files/' + d.id + '" target="_blank" rel="noopener">Download Pdf</a><span class="ct-pdf">PDF</span></td></tr>';
    }).join('');
    return '<div class="ct-table-wrap"><table class="ct-table"><thead><tr><th scope="col">S.N</th><th scope="col">Title</th>' +
      (showMine ? '<th scope="col">Coal mine</th>' : '') + '<th scope="col">Attachment</th></tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function whoBar(el) {
    el.insertAdjacentHTML('afterbegin',
      '<div class="ct-who"><span>Logged in as <strong>' + esc(me.mine_name || me.email) + '</strong> (' +
      (me.role === 'admin' ? 'admin' : 'coal mine') + ')</span><button class="ct-btn ghost sm" type="button" id="ct-logout">Log out</button></div>');
    $('#ct-logout', el).onclick = function () {
      post('/logout').then(function () { me = null; render(); });
    };
  }

  function authView(el, as) {
    var mode = 'login';
    var canReg = as === 'mine';
    el.innerHTML =
      '<p class="ct-hint">' + (canReg
        ? 'Register your coal mine or log in to upload a clearance report. Your report is published after the admin verifies it.'
        : 'This area is for authorised administrators only.') + '</p>' +
      (canReg ? '<div class="ct-tabs"><button type="button" data-m="login" class="on">Login</button><button type="button" data-m="reg">Register</button></div>' : '') +
      '<form class="ct-form" novalidate>' +
      '<label id="ct-mn" hidden>Coal mine name<input name="mine_name" autocomplete="organization"></label>' +
      '<label>Email<input type="email" name="email" required autocomplete="username"></label>' +
      '<label>Password<input type="password" name="password" required autocomplete="current-password"></label>' +
      '<button class="ct-btn" type="submit">Log in</button><p class="ct-msg" role="alert"></p></form>';
    var form = $('form', el), msg = $('.ct-msg', el), btn = $('.ct-btn', el);
    el.querySelectorAll('.ct-tabs button').forEach(function (b) {
      b.onclick = function () {
        mode = b.dataset.m;
        el.querySelectorAll('.ct-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
        $('#ct-mn', el).hidden = mode !== 'reg';
        btn.textContent = mode === 'reg' ? 'Register' : 'Log in';
        form.password.autocomplete = mode === 'reg' ? 'new-password' : 'current-password';
        say(msg, '');
      };
    });
    form.onsubmit = function (e) {
      e.preventDefault();
      btn.disabled = true;
      var body = {};
      new FormData(form).forEach(function (v, k) { body[k] = v; });
      body.as = as;
      post(mode === 'reg' ? '/register' : '/login', body)
        .then(function (r) { me = r.user; render(); })
        .catch(function (err) { say(msg, err.message); btn.disabled = false; });
    };
  }

  function uploadForm(isAdmin, onDone) {
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<form class="ct-form" novalidate>' +
      '<label>Title<input name="title" maxlength="200" required></label>' +
      (isAdmin ? '<label>Upload to<select name="category"><option value="report">Clearance report for coal mines</option><option value="compendium">Clearance compendium</option></select></label>' : '') +
      '<label>PDF file (max 20 MB)<input type="file" name="pdf" accept="application/pdf" required></label>' +
      '<button class="ct-btn" type="submit">Upload PDF</button><p class="ct-msg" role="status"></p></form>';
    var form = $('form', wrap), msg = $('.ct-msg', wrap), btn = $('.ct-btn', wrap);
    form.onsubmit = function (e) {
      e.preventDefault();
      btn.disabled = true;
      api('/upload', { method: 'POST', body: new FormData(form) })
        .then(function (r) {
          form.reset();
          say(msg, r.status === 'pending' ? 'Uploaded. Your report will be published after the admin verifies it.' : 'Uploaded and published.', true);
          if (onDone) onDone();
        })
        .catch(function (err) { say(msg, err.message); })
        .then(function () { btn.disabled = false; });
    };
    return wrap;
  }

  /* ---------- views ---------- */
  var views = {
    compendium: function (el) {
      return api('/documents?category=compendium').then(function (rows) { el.innerHTML = docTable(rows, false); });
    },

    reports: function (el) {
      return api('/documents?category=report').then(function (rows) { el.innerHTML = docTable(rows, true); });
    },

    upload: function (el) {
      if (!me) return authView(el, 'mine');
      whoBar(el);
      if (me.role === 'admin') {
        el.insertAdjacentHTML('beforeend', '<p class="ct-hint">Admins upload from the <a href="' + PAGE + 'admin">admin dashboard</a>, where documents are published instantly.</p>');
        return;
      }
      el.appendChild(uploadForm(false, loadMine));
      el.insertAdjacentHTML('beforeend', '<h3>My submissions</h3><div id="ct-mine"></div>');
      function loadMine() {
        return api('/my-documents').then(function (rows) {
          var label = { pending: 'Awaiting verification', approved: 'Published', rejected: 'Rejected' };
          $('#ct-mine', el).innerHTML = rows.length
            ? '<div class="ct-table-wrap"><table class="ct-table"><thead><tr><th scope="col">S.N</th><th scope="col">Title</th><th scope="col">Submitted</th><th scope="col">Status</th></tr></thead><tbody>' +
              rows.map(function (d, i) {
                return '<tr><td>' + (i + 1) + '</td><td><a href="' + API + '/files/' + d.id + '" target="_blank" rel="noopener">' + esc(d.title) + '</a></td><td>' + fmtDate(d.created_at) +
                  '</td><td><span class="ct-badge ' + esc(d.status) + '">' + label[d.status] + '</span></td></tr>';
              }).join('') + '</tbody></table></div>'
            : '<p class="ct-empty">You have not uploaded any reports yet.</p>';
        });
      }
      return loadMine();
    },

    admin: function (el) {
      if (!me || me.role !== 'admin') return authView(el, 'admin');
      setTitle('Admin dashboard');
      whoBar(el);
      el.insertAdjacentHTML('beforeend', '<h3>Reports awaiting verification</h3><div id="ct-pending"></div><h3>All documents</h3><div id="ct-all"></div><h3>Upload a document</h3>');
      el.appendChild(uploadForm(true, refresh));

      function loadPending() {
        return api('/admin/pending').then(function (rows) {
          $('#ct-pending', el).innerHTML = rows.length
            ? '<div class="ct-table-wrap"><table class="ct-table"><thead><tr><th scope="col">S.N</th><th scope="col">Title</th><th scope="col">Coal mine</th><th scope="col">Submitted</th><th scope="col">Action</th></tr></thead><tbody>' +
              rows.map(function (d, i) {
                return '<tr><td>' + (i + 1) + '</td><td>' + esc(d.title) + '</td><td>' + esc(d.mine_name) + '<br><small>' + esc(d.email) + '</small></td><td>' + fmtDate(d.created_at) + '</td>' +
                  '<td><div class="ct-actions"><a class="ct-btn ghost sm" href="' + API + '/files/' + d.id + '" target="_blank" rel="noopener">View PDF</a>' +
                  '<button class="ct-btn ok sm" type="button" data-id="' + d.id + '" data-act="approve">Approve</button>' +
                  '<button class="ct-btn bad sm" type="button" data-id="' + d.id + '" data-act="reject">Reject</button></div></td></tr>';
              }).join('') + '</tbody></table></div>'
            : '<p class="ct-empty">No reports are waiting for verification.</p>';
        });
      }
      function loadAll() {
        return api('/admin/documents').then(function (rows) {
          var where = { compendium: 'Clearance compendium', report: 'Clearance report' };
          $('#ct-all', el).innerHTML = rows.length
            ? '<div class="ct-table-wrap"><table class="ct-table"><thead><tr><th scope="col">S.N</th><th scope="col">Title</th><th scope="col">Section</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>' +
              rows.map(function (d, i) {
                return '<tr><td>' + (i + 1) + '</td><td>' + esc(d.title) + '</td><td>' + where[d.category] + '</td>' +
                  '<td><span class="ct-badge ' + esc(d.status) + '">' + esc(d.status) + '</span></td>' +
                  '<td><div class="ct-actions"><a class="ct-btn ghost sm" href="' + API + '/files/' + d.id + '" target="_blank" rel="noopener">View PDF</a>' +
                  '<button class="ct-btn bad sm" type="button" data-del="' + d.id + '">Delete</button></div></td></tr>';
              }).join('') + '</tbody></table></div>'
            : '<p class="ct-empty">No documents yet.</p>';
        });
      }
      function refresh() { return Promise.all([loadPending(), loadAll()]); }

      $('#ct-pending', el).onclick = function (e) {
        var b = e.target.closest('button[data-act]');
        if (!b) return;
        b.disabled = true;
        post('/admin/documents/' + b.dataset.id + '/' + b.dataset.act)
          .then(refresh)
          .catch(function (err) { alert(err.message); b.disabled = false; });
      };
      $('#ct-all', el).onclick = function (e) {
        var b = e.target.closest('button[data-del]');
        if (!b || !confirm('Delete this PDF permanently? This cannot be undone.')) return;
        b.disabled = true;
        api('/admin/documents/' + b.dataset.del, { method: 'DELETE' })
          .then(loadAll)
          .catch(function (err) { alert(err.message); b.disabled = false; });
      };
      return refresh();
    }
  };

  /* ---------- mount ---------- */
  function render() {
    if (defaultTitle) setTitle(defaultTitle);
    root.innerHTML = '<div class="ct"><div id="ct-body"></div></div>';
    var body = $('#ct-body', root);
    var done;
    try { done = views[currentView](body); } catch (err) { done = Promise.reject(err); }
    return Promise.resolve(done).catch(function (err) {
      body.innerHTML = '<p class="ct-msg err">' + esc(err.message) + '</p>';
    });
  }

  window.ComplianceTracker = {
    mount: function (view, container, opts) {
      if (!views[view]) view = 'compendium';
      currentView = view;
      root = container;
      setTitle = (opts && opts.setTitle) || function () {};
      defaultTitle = (opts && opts.title) || '';
      return api('/me').then(function (r) { me = r.user; }).catch(function () { me = null; }).then(render);
    }
  };
})();
