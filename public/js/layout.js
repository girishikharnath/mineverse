/* Renders the header (top bar, logo bar, main navigation) and footer on every page. */
(function () {
  'use strict';
  const S = window.SITE;
  S.menu = S.menu.filter((m) => !m.hidden); // items marked `hidden: true` in data.js are left out

  /* ---------- helpers shared with the other scripts ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const href = (it) => (it.u ? it.u : it.p ? 'page.html?p=' + encodeURIComponent(it.p) : 'index.html');
  const isExternal = (it) => !!it.u && !/^https:\/\/coal\.gov\.in/.test(it.u);
  const linkAttrs = (it) => (it.u ? ' target="_blank" rel="noopener"' : '');
  const i18n = (en, hi) => (hi ? ` data-en="${esc(en)}" data-hi="${esc(hi)}"` : '');

  const flat = [];
  (function walk(items, chain) {
    items.forEach((it) => {
      flat.push({ it, chain });
      if (it.c) walk(it.c, chain.concat(it));
    });
  })(S.menu, []);
  const find = (p) => flat.find((n) => n.it.p === p && !n.it.u && p !== '');

  function applyLang(l) {
    document.documentElement.lang = l;
    document.querySelectorAll('[data-en]').forEach((el) => {
      const v = l === 'hi' ? el.dataset.hi : el.dataset.en;
      if (v) el.textContent = v;
    });
    const sel = document.getElementById('lang');
    if (sel) sel.value = l;
  }

  S.util = { esc, store, href, linkAttrs, i18n, flat, find, applyLang };

  /* ---------- icons ---------- */
  const ico = {
    search: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    a11y: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="4.5" r="2"/><path d="M4 8.5h16M12 8.5V15M12 15l-3.5 6M12 15l3.5 6"/></g></svg>',
    share: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="5.5" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4"/></g></svg>',
    sitemap: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2.5" width="6" height="5" rx="1"/><rect x="2" y="16.5" width="6" height="5" rx="1"/><rect x="9" y="16.5" width="6" height="5" rx="1"/><rect x="16" y="16.5" width="6" height="5" rx="1"/><path d="M12 7.5v9M5 16.5v-4.5h14v4.5"/></g></svg>',
    menu: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
  };

  /* ---------- navigation ---------- */
  const here = location.pathname.split('/').pop() || 'index.html';
  const qp = new URLSearchParams(location.search).get('p');
  let activeTop = null;
  if (here === 'index.html') activeTop = S.menu[0];
  else if (here === 'page.html' && qp) {
    const n = find(qp);
    if (n) activeTop = n.chain[0] || n.it;
  }

  function navItem(it, level) {
    const kids = it.c && it.c.length;
    const cls = [];
    if (kids) cls.push('has-sub');
    if (level === 0 && it === activeTop) cls.push('active');
    const a = `<a href="${href(it)}"${linkAttrs(it)}${isExternal(it) ? ' title="External link that opens in a new tab"' : ''}${i18n(it.t, it.hi)}>${esc(it.t)}${it.isNew ? '<sup class="new-badge">New</sup>' : ''}</a>`;
    let out = `<li${cls.length ? ` class="${cls.join(' ')}"` : ''}>${a}`;
    if (kids) {
      out += `<button class="caret" type="button" aria-expanded="false" aria-label="Show submenu for ${esc(it.t)}"></button>`;
      out += `<ul class="sub${it.wide ? ' cols' : ''}">${it.c.map((c) => navItem(c, level + 1)).join('')}</ul>`;
    }
    return out + '</li>';
  }

  /* ---------- header ---------- */
  function headerHTML() {
    const logos = S.headerLogos
      .map((l) => `<li><a href="${l.u}" target="_blank" rel="noopener" title="${esc(l.t)}"><img src="${S.theme + l.img}" alt="${esc(l.t)}" height="48"></a></li>`)
      .join('');
    const social = S.social
      .map((s) => `<li><a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`)
      .join('');
    return `
<a class="skip" href="#skipCont">Skip to main content</a>
<div class="tricolor" aria-hidden="true"></div>
<div class="topbar">
  <div class="wrap topbar-in">
    <div class="gov"><span lang="hi">भारत सरकार</span><span class="bar" aria-hidden="true"></span><span>Government of India</span></div>
    <ul class="utils">
      <li class="hide-sm"><a href="page.html?p=help">Screen Reader Access</a></li>
      <li class="hide-sm"><a href="#skipCont">Skip Main Content</a></li>
      <li class="dd" id="dd-search">
        <button class="ico" type="button" aria-expanded="false" aria-controls="search-panel" aria-label="Search on website">${ico.search}</button>
        <div class="dd-panel search-panel" id="search-panel">
          <label for="q" class="sr">Search the website</label>
          <input id="q" type="search" placeholder="Search menus, notices, press releases" autocomplete="off">
          <ul id="q-res" aria-live="polite"></ul>
        </div>
      </li>
      <li class="dd" id="dd-a11y">
        <button class="ico" type="button" aria-expanded="false" aria-controls="a11y-panel" aria-label="Accessibility options">${ico.a11y}</button>
        <ul class="dd-panel a11y-panel" id="a11y-panel">
          <li><button type="button" data-fs="+" aria-label="Increase text size" title="Increase text size">A+</button></li>
          <li><button type="button" data-fs="0" aria-label="Normal text size" title="Normal text size">A</button></li>
          <li><button type="button" data-fs="-" aria-label="Decrease text size" title="Decrease text size">A-</button></li>
          <li><button type="button" class="sw-default" data-theme="default" aria-label="Default contrast" title="Default contrast">A</button></li>
          <li><button type="button" class="sw-hc" data-theme="hc" aria-label="High contrast" title="High contrast">A</button></li>
        </ul>
      </li>
      <li class="dd" id="dd-social">
        <button class="ico" type="button" aria-expanded="false" aria-controls="social-panel" aria-label="Social media links">${ico.share}</button>
        <ul class="dd-panel social-panel" id="social-panel">${social}</ul>
      </li>
      <li><a class="ico" href="page.html?p=sitemap" aria-label="Sitemap" title="Sitemap">${ico.sitemap}</a></li>
      <li class="lang">
        <label class="sr" for="lang">Select your language</label>
        <select id="lang"><option value="en">English</option><option value="hi">हिन्दी</option></select>
      </li>
    </ul>
  </div>
</div>

<div class="brand">
  <div class="wrap brand-in">
    <a class="logo" href="index.html" title="Home">
      <img src="assets/emblem.svg" alt="National emblem placeholder" width="64" height="64">
      <span class="logo-text"><span class="hi" lang="hi">कोयला मंत्रालय</span><span class="en">Ministry of Coal</span></span>
    </a>
    <ul class="brand-logos">${logos}</ul>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">${ico.menu}<span>Menu</span></button>
  </div>
</div>

<nav class="navbar" id="nav" aria-label="Main navigation">
  <div class="wrap">
    <ul class="nav">${S.menu.map((m) => navItem(m, 0)).join('')}</ul>
  </div>
</nav>`;
  }

  /* ---------- footer ---------- */
  function footerHTML() {
    const fm = S.footerMenu.map((f) => `<li><a href="${href(f)}">${esc(f.t)}</a></li>`).join('');
    return `
<footer class="footer">
  <div class="wrap">
    <ul class="footer-menu" aria-label="Footer menu">${fm}</ul>
    <div class="footer-meta">
      <p class="visitors">Total Visitors: <strong>${S.visitors}</strong> <span>Since: ${S.visitorsSince}</span></p>
      <p>Practice clone of the Ministry of Coal website (<a href="${S.original}" target="_blank" rel="noopener">coal.gov.in</a>). Not an official website.</p>
      <p>Last Updated: <strong>${S.lastUpdated}</strong></p>
    </div>
  </div>
</footer>
<button id="toTop" class="to-top" type="button" aria-label="Back to top" hidden>&#8593;</button>`;
  }

  const hostH = document.getElementById('site-header');
  const hostF = document.getElementById('site-footer');
  if (hostH) hostH.innerHTML = headerHTML();
  if (hostF) hostF.innerHTML = footerHTML();

  // header logos load from coal.gov.in; hide any that fail instead of showing broken-image text
  document.querySelectorAll('.brand-logos img').forEach((img) => {
    const hide = () => { img.closest('li').hidden = true; };
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* ---------- top-bar dropdowns ---------- */
  const dds = document.querySelectorAll('.dd');
  function closeDropdowns(except) {
    dds.forEach((d) => {
      if (d === except) return;
      d.classList.remove('open');
      const b = d.querySelector(':scope > button');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  dds.forEach((d) => {
    const b = d.querySelector(':scope > button');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !d.classList.contains('open');
      closeDropdowns(d);
      d.classList.toggle('open', open);
      b.setAttribute('aria-expanded', String(open));
      if (open && d.id === 'dd-search') document.getElementById('q').focus();
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dd')) closeDropdowns();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdowns();
      closeMobileNav();
    }
  });

  /* ---------- accessibility: text size + contrast ---------- */
  let fs = parseInt(store.get('fs') || '100', 10);
  function setFs(v) {
    fs = Math.max(80, Math.min(140, v));
    document.documentElement.style.fontSize = fs + '%';
    store.set('fs', String(fs));
  }
  function setTheme(t) {
    document.body.classList.toggle('hc', t === 'hc');
    store.set('theme', t);
  }
  setFs(fs);
  setTheme(store.get('theme') || 'default');
  document.getElementById('a11y-panel').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.fs === '+') setFs(fs + 10);
    if (b.dataset.fs === '-') setFs(fs - 10);
    if (b.dataset.fs === '0') setFs(100);
    if (b.dataset.theme) setTheme(b.dataset.theme);
  });

  /* ---------- language (labels marked with data-en / data-hi) ---------- */
  const langSel = document.getElementById('lang');
  langSel.addEventListener('change', () => {
    store.set('lang', langSel.value);
    applyLang(langSel.value);
  });
  applyLang(store.get('lang') === 'hi' ? 'hi' : 'en');

  /* ---------- main navigation behaviour ---------- */
  const nav = document.getElementById('nav');
  const toggle = document.querySelector('.nav-toggle');

  function closeMobileNav() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // mobile: caret button opens/closes a submenu
  nav.addEventListener('click', (e) => {
    const c = e.target.closest('.caret');
    if (!c) return;
    const li = c.parentElement;
    const open = !li.classList.contains('open');
    li.classList.toggle('open', open);
    c.setAttribute('aria-expanded', String(open));
  });

  // desktop: flip a dropdown to the other side if it would leave the screen
  function place(li) {
    const sub = li.querySelector(':scope > .sub');
    if (!sub) return;
    sub.classList.remove('flip');
    if (sub.getBoundingClientRect().right > window.innerWidth - 8) sub.classList.add('flip');
  }
  nav.addEventListener('mouseover', (e) => { const li = e.target.closest('li.has-sub'); if (li) place(li); });
  nav.addEventListener('focusin', (e) => { const li = e.target.closest('li.has-sub'); if (li) place(li); });
  // hidden dropdowns still take up layout space, so position every one up front (parents before children)
  function placeAll() { nav.querySelectorAll('li.has-sub').forEach(place); }
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(placeAll, 120); });
  placeAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAll);

  // keyboard: Escape inside a dropdown closes it and returns focus to its parent link
  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const li = e.target.closest('li.has-sub');
    if (li) { const a = li.querySelector(':scope > a'); if (a) a.focus(); }
  });

  /* ---------- site search (menus, notices, press releases) ---------- */
  const q = document.getElementById('q');
  const res = document.getElementById('q-res');
  const index = [];
  flat.forEach(({ it, chain }) => {
    if (it.p === '' ) return;
    index.push({ t: it.t, h: href(it), ext: !!it.u, ctx: chain.map((c) => c.t).join(' › ') || 'Menu' });
  });
  S.whatsNew.forEach((r) => index.push({ t: r[0], h: S.files + r[1], ext: true, ctx: "What's New" }));
  S.press.forEach((r) => index.push({ t: r[0], h: S.files + r[1], ext: true, ctx: 'Press Release' }));

  q.addEventListener('input', () => {
    const term = q.value.trim().toLowerCase();
    if (term.length < 2) { res.innerHTML = ''; return; }
    const hits = index.filter((r) => r.t.toLowerCase().includes(term)).slice(0, 8);
    res.innerHTML = hits.length
      ? hits.map((r) => `<li><a href="${r.h}"${r.ext ? ' target="_blank" rel="noopener"' : ''}>${esc(r.t)}<small>${esc(r.ctx)}</small></a></li>`).join('')
      : '<li class="none">No results found. Try a different word.</li>';
  });

  /* ---------- back to top ---------- */
  const top = document.getElementById('toTop');
  window.addEventListener('scroll', () => { top.hidden = window.scrollY < 400; }, { passive: true });
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
