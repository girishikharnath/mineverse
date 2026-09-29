/* Home page: banner slider, scrolling notice lists, quick links, gallery, logo strip. */
(function () {
  'use strict';
  const S = window.SITE;
  const { esc } = S.util;
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mark an <img> as failed so CSS can show a text fallback instead. */
  function watchImages(root, failClass) {
    root.querySelectorAll('img').forEach((img) => {
      const fail = () => img.closest('[data-imgwrap]').classList.add(failClass);
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
  }

  /* ---------- banner slider ---------- */
  (function slider() {
    const track = $('#slides');
    const dots = $('#dots');
    const n = S.slides.length;
    let i = 0, timer = null, playing = !reduceMotion;

    track.innerHTML = S.slides.map((s, k) => {
      const img = `<img src="${S.files + s.img}" alt="${esc(s.alt)}" loading="${k ? 'lazy' : 'eager'}">`;
      const inner = s.u ? `<a href="${s.u}" target="_blank" rel="noopener">${img}</a>` : img;
      return `<div class="slide" data-imgwrap role="group" aria-roledescription="slide" aria-label="${k + 1} of ${n}">${inner}<div class="cap">${esc(s.alt)}</div></div>`;
    }).join('');
    watchImages(track, 'noimg');

    dots.innerHTML = S.slides.map((s, k) => `<button type="button" aria-label="Go to slide ${k + 1}"></button>`).join('');
    const dotBtns = [...dots.children];

    function go(k) {
      i = (k + n) % n;
      track.style.transform = `translateX(${-i * 100}%)`;
      dotBtns.forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
      [...track.children].forEach((el, j) => el.setAttribute('aria-hidden', String(j !== i)));
    }
    function start() { stop(); if (playing) timer = setInterval(() => go(i + 1), 5000); }
    function stop() { clearInterval(timer); }

    $('.s-btn.prev').addEventListener('click', () => { go(i - 1); start(); });
    $('.s-btn.next').addEventListener('click', () => { go(i + 1); start(); });
    dotBtns.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));

    const pp = $('.s-pp');
    pp.textContent = playing ? 'Pause' : 'Play';
    pp.addEventListener('click', () => {
      playing = !playing;
      pp.textContent = playing ? 'Pause' : 'Play';
      pp.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
      start();
    });
    const box = $('.slider');
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    box.addEventListener('focusin', stop);
    box.addEventListener('focusout', start);

    go(0);
    start();
  })();

  /* ---------- Prime Minister / Ministers ---------- */
  $('#officials').innerHTML = S.officials.map((o) => {
    const link = o.u ? o.u : 'page.html?p=' + encodeURIComponent(o.p);
    const ext = o.u ? ' target="_blank" rel="noopener"' : '';
    return `<article class="official card" data-imgwrap>
      <div class="photo"><img src="${S.files + o.img}" alt="${esc(o.role)}" loading="lazy"></div>
      <h3>${esc(o.name)}</h3>
      <p>${esc(o.role)}</p>
      <a href="${link}"${ext}>View Portfolio<span class="sr"> of ${esc(o.name)}</span></a>
    </article>`;
  }).join('');
  watchImages($('#officials'), 'noimg');

  /* ---------- scrolling lists ---------- */
  function listItem(r, hidden) {
    const attrs = hidden ? ' tabindex="-1"' : '';
    return `<li${hidden ? ' aria-hidden="true"' : ''}>
      <a href="${S.files + r[1]}" target="_blank" rel="noopener"${attrs}>${esc(r[0])}</a>
      <span class="meta"><span class="pdf">PDF</span>${esc(r[2])} &bull; ${esc(r[3])}</span>
    </li>`;
  }
  function ticker(id, rows) {
    const el = document.getElementById(id);
    el.innerHTML = `<ul style="--dur:${rows.length * 6}s">${rows.map((r) => listItem(r, false)).join('')}${rows.map((r) => listItem(r, true)).join('')}</ul>`;
    const btn = document.querySelector(`.pp[data-target="${id}"]`);
    const base = btn.getAttribute('aria-label').replace(/^(Pause|Play) /, '');
    btn.addEventListener('click', () => {
      const paused = el.classList.toggle('paused');
      btn.textContent = paused ? 'Play' : 'Pause';
      btn.setAttribute('aria-label', (paused ? 'Play ' : 'Pause ') + base);
    });
  }
  ticker('ticker-new', S.whatsNew);
  ticker('ticker-press', S.press);

  /* ---------- quick links ---------- */
  $('#tiles').innerHTML = S.quickLinks.map((l) => `
    <li><a class="tile" href="${l.u}" target="_blank" rel="noopener" title="External link that opens in a new tab">
      <span class="badge" aria-hidden="true">${esc(l.badge)}</span>
      <span class="tile-t">${esc(l.short || l.t)}</span>
      ${l.short ? `<span class="tile-s">${esc(l.t)}</span>` : ''}
    </a></li>`).join('');

  /* ---------- photo gallery ---------- */
  $('#photos').innerHTML = S.gallery.map((g) => `
    <figure data-imgwrap>
      <img src="${S.files + g.img}" alt="${esc(g.alt)}" loading="lazy">
      <figcaption>${esc(g.alt)}</figcaption>
    </figure>`).join('');
  watchImages($('#photos'), 'noimg');

  /* ---------- related-site logos (duplicated for a seamless loop) ---------- */
  const logo = (l, hidden) => `<a class="logo-chip" data-imgwrap href="${l.u}" target="_blank" rel="noopener" title="${esc(l.t)}"${hidden ? ' aria-hidden="true" tabindex="-1"' : ''}>
    <img src="${S.files + l.img}" alt="${esc(l.t)}" loading="lazy"><span class="chip-t">${esc(l.t)}</span></a>`;
  $('#logos').innerHTML = `<div class="marquee-track">${S.footerLogos.map((l) => logo(l, false)).join('')}${S.footerLogos.map((l) => logo(l, true)).join('')}</div>`;
  watchImages($('#logos'), 'noimg');

  // re-apply the saved language to elements created after layout.js ran
  S.util.applyLang(document.documentElement.lang === 'hi' ? 'hi' : 'en');
})();
