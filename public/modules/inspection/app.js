/*
 * Inspection module – application
 * Flow: Inspections → Organization → Coal mine (register if missing) →
 *       inspection cards → new inspection form → submitted report.
 * Routes use the URL hash, so it can live inside page.html?p=inspections.
 */
(function () {
  "use strict";

  var CFG = window.INSPECTION_CONFIG;
  var Store = window.IAStore;
  if (!CFG || !Store) return;

  // Wait for the mount point, in case your page injects its content with JavaScript.
  function start() {
    var found = document.getElementById("inspection-app");
    if (found) return boot(found);
    var tries = 0;
    var timer = setInterval(function () {
      var el = document.getElementById("inspection-app");
      if (el) { clearInterval(timer); boot(el); }
      else if (++tries > 100) clearInterval(timer);
    }, 100);
  }

  function boot(root) {

  /* ---------- helpers ---------- */

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function svg(path, size) {
    var s = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
  }
  var ICON = {
    ext: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', 16),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    chevron: svg('<path d="M9 5l7 7-7 7"/>', 22),
    camera: svg('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>'),
    pin: svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
    print: svg('<path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><path d="M7 14h10v6H7z"/>'),
    back: svg('<path d="M15 5l-7 7 7 7"/>'),
    trash: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"/>', 16),
    lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', 16)
  };

  var dtf = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  function fmt(ts) { return ts ? dtf.format(new Date(ts)) : "-"; }
  function clock(ts) {
    return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  }

  function orgTitle(o) { return o.code ? o.name + " (" + o.code + ")" : o.name; }
  function findBy(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function norm(s) { return String(s || "").trim().replace(/\s+/g, " ").toLowerCase(); }
  function truncate(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  /* ---------- issues ---------- */

  function getIssues(insp) {
    var out = [];
    var submitted = insp.status === "submitted";
    insp.items.forEach(function (it) {
      if (!submitted && !it.touched) return; // draft: ignore questions not yet answered
      var flagged = it.issueWhen === "checked" ? it.checked : !it.checked;
      if (flagged) {
        out.push({
          label: it.issueWhen === "checked" ? it.label : "Not confirmed: " + it.label,
          obs: (it.obs || "").trim(),
          photos: it.photos.length
        });
      }
    });
    var o = insp.other;
    if (o && ((o.obs || "").trim() || o.photos.length)) {
      out.push({ label: "Other issue", obs: (o.obs || "").trim(), photos: o.photos.length });
    }
    return out;
  }

  function issueSummary(insp) {
    var issues = getIssues(insp);
    if (!issues.length) {
      if (insp.status !== "submitted") return '<span class="ia-muted">No issues recorded so far</span>';
      return '<span class="ia-none">No issues reported</span>';
    }
    var shown = issues.slice(0, 2).map(function (i) {
      return i.label === "Other issue" && i.obs ? "Other issue: " + truncate(i.obs, 70) : i.label;
    });
    var more = issues.length - shown.length;
    return esc(shown.join("; ")) + (more > 0 ? ' <span class="ia-muted">and ' + more + " more</span>" : "");
  }

  /* ---------- shell ---------- */

  root.classList.add("ia");
  root.innerHTML =
    '<div class="ia-view"></div>' +
    '<dialog class="ia-dialog" id="ia-dialog"></dialog>' +
    '<dialog class="ia-lightbox" id="ia-lightbox"></dialog>' +
    '<div class="ia-toast" id="ia-toast" role="status" aria-live="polite"></div>';

  var view = root.querySelector(".ia-view");
  var dlg = document.getElementById("ia-dialog");
  var box = document.getElementById("ia-lightbox");
  var toastEl = document.getElementById("ia-toast");

  var ui = { search: "", flash: null };

  /* ---------- identity (who is using this device) ---------- */
  /* No login exists in this offline, single-browser tool, so this is an
     honour-system check only: it stops accidental deletes from the
     Inspections UI, it is not real access control. Anyone with browser
     devtools can change the stored name. For real per-user permissions,
     replace this with server-side authentication in storage.js. */
  var ID_KEY = "ia-identity";
  function getIdentity() {
    try { return (localStorage.getItem(ID_KEY) || "").trim(); } catch (e) { return ""; }
  }
  function setIdentity(name) {
    try { localStorage.setItem(ID_KEY, name); } catch (e) { /* ignore */ }
  }
  function ensureIdentity(promptMsg) {
    var id = getIdentity();
    if (id) return id;
    var name = (window.prompt(promptMsg || "Enter your name. Only you will be able to delete the coal mines and inspections you register.") || "").trim();
    if (name) setIdentity(name);
    return name;
  }
  // Unclaimed records (created before this identity check existed, or by
  // someone who skipped the name prompt) stay deletable by anyone, so old
  // demo data is never permanently locked.
  function canDelete(record) {
    if (!record || !record.createdBy) return true;
    var id = getIdentity();
    return !!id && norm(id) === norm(record.createdBy);
  }
  var current = null;   // inspection open in the form
  var saveTimer = null;
  var photosDirty = false;
  var rendered = false;
  var toastTimer = null;
  var keepToast = false;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 4500);
  }

  function baseCrumbs() {
    return [{ label: "Home", href: CFG.homeUrl || "#/" }, { label: "Inspections", href: "#/" }];
  }

  function page(crumbs, title, body) {
    var trail = crumbs.map(function (c, i) {
      var last = i === crumbs.length - 1;
      return last
        ? '<span aria-current="page">' + esc(c.label) + "</span>"
        : '<a href="' + esc(c.href) + '">' + esc(c.label) + "</a>";
    }).join('<span class="ia-sep" aria-hidden="true">/</span>');
    var warn = !Store.online
      ? '<p class="ia-banner" role="alert">Can\u2019t reach the shared server right now &ndash; showing local data only. Other officers won\u2019t see this until the connection is back.</p>'
      : (Store.persistent ? "" : '<p class="ia-banner" role="alert">Browser storage is blocked, so anything you enter will be lost when this page closes.</p>');
    var id = getIdentity();
    var idBar = '<div class="ia-identity">' +
      (id ? "Signed in as <strong>" + esc(id) + "</strong>" : "Not signed in") +
      ' &ndash; <button type="button" class="ia-link-btn" data-action="switch-identity">' + (id ? "switch" : "set your name") + "</button>" +
      '<span class="ia-identity-hint">Only you can delete what you register</span></div>';
    view.innerHTML =
      '<nav class="ia-crumbs" aria-label="Breadcrumb">' + trail + "</nav>" +
      idBar +
      '<h1 class="ia-title" tabindex="-1">' + esc(title) + "</h1>" + warn + body;
  }

  function notFound(msg) {
    page(baseCrumbs(), "Inspections",
      '<section class="ia-panel"><div class="ia-empty"><h3>' + esc(msg) + '</h3><p>It may have been removed or the link is incomplete.</p>' +
      '<a class="ia-btn ia-btn-primary" href="#/">Back to organizations</a></div></section>');
  }

  /* ---------- 1. organizations ---------- */

  function viewOrgs() {
    var rows = Store.data.orgs.map(function (o, i) {
      return '<tr class="' + (ui.flash === o.id ? "is-new" : "") + '">' +
        "<td>" + (i + 1) + "</td><td>" + esc(orgTitle(o)) + "</td>" +
        '<td class="ia-c"><a class="ia-select" href="#/org/' + esc(o.id) + '" aria-label="Select ' + esc(orgTitle(o)) + '">select ' + ICON.ext + "</a></td></tr>";
    }).join("");
    ui.flash = null;

    page(baseCrumbs(), "Inspections",
      '<section class="ia-panel">' +
      '<div class="ia-panel-head"><h2>Organizations</h2>' +
      '<button type="button" class="ia-btn ia-btn-primary" data-action="add-org">' + ICON.plus + " Add organization</button></div>" +
      '<div class="ia-table-wrap"><table class="ia-table"><thead><tr><th class="ia-w-sno" scope="col">S.No.</th><th scope="col">Title</th><th class="ia-w-act" scope="col"><span class="ia-sr">Action</span></th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table></div></section>");
  }

  /* ---------- 2. coal mines ---------- */

  function minesTable(org) {
    var q = norm(ui.search);
    var all = Store.data.mines.filter(function (m) { return m.orgId === org.id; });
    var list = all.filter(function (m) { return !q || norm(m.name).indexOf(q) > -1 || norm(m.location).indexOf(q) > -1; });

    if (!all.length) {
      return '<div class="ia-empty"><h3>No coal mines registered under ' + esc(org.code || org.name) + ' yet</h3>' +
        "<p>Register the mine with its name and location. It stays saved for every future inspection.</p>" +
        '<button type="button" class="ia-btn ia-btn-primary" data-action="register-mine" data-org="' + esc(org.id) + '">' + ICON.plus + " Register coal mine</button></div>";
    }
    if (!list.length) {
      return '<div class="ia-empty"><h3>No registered mine matches “' + esc(ui.search) + "”</h3>" +
        "<p>If this mine is not on the list, register it now.</p>" +
        '<button type="button" class="ia-btn ia-btn-primary" data-action="register-mine" data-org="' + esc(org.id) + '" data-prefill="' + esc(ui.search) + '">' + ICON.plus + " Register “" + esc(truncate(ui.search, 30)) + "” as a new coal mine</button></div>";
    }
    var rows = list.map(function (m, i) {
      var n = Store.data.inspections.filter(function (x) { return x.mineId === m.id; }).length;
      var del = canDelete(m)
        ? '<button type="button" class="ia-icon-btn" data-action="delete-mine" data-mine="' + esc(m.id) + '" aria-label="Delete ' + esc(m.name) + '" title="Delete coal mine">' + ICON.trash + "</button>"
        : '<span class="ia-icon-btn is-locked" aria-hidden="true" title="Only ' + esc(m.createdBy) + ", who registered this mine, can delete it\">" + ICON.lock + "</span>";
      return '<tr class="' + (ui.flash === m.id ? "is-new" : "") + '"><td>' + (i + 1) + "</td><td>" + esc(m.name) + "</td><td>" + esc(m.location) + '</td><td class="ia-c ia-hide-sm">' + n +
        '</td><td class="ia-c"><a class="ia-select" href="#/mine/' + esc(m.id) + '" aria-label="Select ' + esc(m.name) + '">select ' + ICON.ext + "</a>" + del + "</td></tr>";
    }).join("");
    return '<div class="ia-table-wrap"><table class="ia-table"><thead><tr><th class="ia-w-sno" scope="col">S.No.</th><th scope="col">Coal mine</th><th scope="col">Location</th><th class="ia-c ia-hide-sm" scope="col">Inspections</th><th class="ia-w-act" scope="col"><span class="ia-sr">Action</span></th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }

  function viewMines(orgId) {
    var org = findBy(Store.data.orgs, orgId);
    if (!org) return notFound("Organization not found");
    var hasMines = Store.data.mines.some(function (m) { return m.orgId === org.id; });
    page(baseCrumbs().concat([{ label: org.code || org.name }]), "Inspections",
      '<section class="ia-panel">' +
      '<div class="ia-panel-head"><div><h2>Select coal mine</h2><p class="ia-sub">' + esc(orgTitle(org)) + "</p></div>" +
      '<div class="ia-tools">' +
      (hasMines ? '<label class="ia-search"><span class="ia-sr">Search coal mines</span><input type="search" id="ia-search" placeholder="Search by name or location" value="' + esc(ui.search) + '" autocomplete="off"></label>' : "") +
      (hasMines ? '<button type="button" class="ia-btn ia-btn-primary" data-action="register-mine" data-org="' + esc(org.id) + '">' + ICON.plus + " Register coal mine</button>" : "") + "</div></div>" +
      '<div id="ia-mines-list" data-org="' + esc(org.id) + '">' + minesTable(org) + "</div></section>");
    ui.flash = null;
  }

  /* ---------- 3. inspections for a mine ---------- */

  function viewMine(mineId) {
    var mine = findBy(Store.data.mines, mineId);
    if (!mine) return notFound("Coal mine not found");
    var org = findBy(Store.data.orgs, mine.orgId) || { name: "Unknown organization", id: "" };
    var list = Store.data.inspections.filter(function (x) { return x.mineId === mine.id; })
      .sort(function (a, b) { return b.startedAt - a.startedAt; });

    var cards = list.map(function (x) {
      var href = x.status === "submitted" ? "#/inspection/" + x.id : "#/inspection/" + x.id + "/edit";
      var who = [x.officer, x.type].filter(Boolean).join(", ");
      var del = canDelete(x)
        ? '<button type="button" class="ia-icon-btn" data-action="delete-inspection" data-insp="' + esc(x.id) + '" aria-label="Delete this inspection" title="Delete inspection">' + ICON.trash + "</button>"
        : '<span class="ia-icon-btn is-locked" aria-hidden="true" title="Only ' + esc(x.createdBy) + ", who registered this inspection, can delete it\">" + ICON.lock + "</span>";
      return '<a class="ia-card" href="' + esc(href) + '">' +
        '<div class="ia-card-main">' +
        '<div class="ia-card-time">Inspection at: <strong>' + esc(fmt(x.startedAt)) + '</strong>' + (x.status === "submitted" ? "" : ' <span class="ia-auto">(auto saved)</span>') + "</div>" +
        '<div class="ia-card-issues"><span class="ia-issues-label' + (getIssues(x).length ? "" : " is-none") + '">Issues:</span> ' + issueSummary(x) + "</div>" +
        (who ? '<div class="ia-card-meta">' + esc(who) + "</div>" : "") +
        "</div>" +
        '<div class="ia-card-side"><span class="ia-badge ' + (x.status === "submitted" ? "is-submitted" : "is-draft") + '">' + (x.status === "submitted" ? "Submitted" : "Draft") + "</span>" +
        del +
        ICON.chevron + "</div></a>";
    }).join("");

    var body = list.length ? '<div class="ia-cards">' + cards + "</div>" :
      '<div class="ia-empty"><h3>No inspections recorded for this mine</h3><p>Start the first inspection. Your entries save automatically as you go.</p>' +
      '<button type="button" class="ia-btn ia-btn-primary" data-action="new-inspection" data-mine="' + esc(mine.id) + '">' + ICON.plus + " Add new inspection</button></div>";

    page(baseCrumbs().concat([{ label: org.code || org.name, href: "#/org/" + org.id }, { label: mine.name }]), "Inspections",
      '<section class="ia-panel">' +
      '<div class="ia-panel-head"><div><h2>' + esc(mine.name) + '</h2><p class="ia-sub">' + esc(orgTitle(org)) + " &ndash; " + esc(mine.location) + "</p></div>" +
      (list.length ? '<button type="button" class="ia-btn ia-btn-primary ia-btn-pill" data-action="new-inspection" data-mine="' + esc(mine.id) + '">Add new inspection</button>' : "") +
      "</div>" + body + "</section>");
  }

  /* ---------- 4. inspection form ---------- */

  function newInspection(mine) {
    var t = Date.now();
    var last = "";
    try { last = localStorage.getItem("ia-last-officer") || ""; } catch (e) { /* ignore */ }
    return {
      id: Store.uid("insp"), mineId: mine.id, orgId: mine.orgId,
      startedAt: t, updatedAt: t, submittedAt: null, status: "draft",
      officer: last, type: "", gps: { lat: "", lng: "", accuracy: null },
      createdBy: ensureIdentity("Enter your name to start this inspection. Only you will be able to delete it later."),
      items: CFG.checklist.map(function (c) {
        return { id: c.id, label: c.label, hint: c.hint || "", issueWhen: c.issueWhen || "unchecked", checked: false, obs: "", photos: [], touched: false };
      }),
      other: { label: CFG.otherIssueLabel || "Report any other issue", obs: "", photos: [] }
    };
  }

  function thumbs(list, key, editable) {
    return list.map(function (pid) {
      var src = Store.data.photos[pid];
      if (!src) return "";
      return '<figure class="ia-thumb"><button type="button" class="ia-thumb-img" data-action="open-photo" data-photo="' + esc(pid) + '" aria-label="View photo"><img src="' + src + '" alt="Attached photo"></button>' +
        (editable ? '<button type="button" class="ia-thumb-x" data-action="remove-photo" data-key="' + esc(key) + '" data-photo="' + esc(pid) + '" aria-label="Remove photo">&times;</button>' : "") + "</figure>";
    }).join("");
  }

  function photoField(key, list) {
    return '<div class="ia-photos">' +
      '<label class="ia-btn ia-btn-ghost ia-btn-sm ia-file">' + ICON.camera + " Add photo" +
      '<input type="file" accept="image/*" multiple class="ia-sr" data-field="photo" data-key="' + esc(key) + '"></label>' +
      '<div class="ia-thumbs" data-thumbs="' + esc(key) + '">' + thumbs(list, key, true) + "</div></div>";
  }

  function viewForm(insp, mine, org) {
    var typeOpts = '<option value="">Select inspection type</option>' + CFG.inspectionTypes.map(function (t) {
      return '<option value="' + esc(t) + '"' + (insp.type === t ? " selected" : "") + ">" + esc(t) + "</option>";
    }).join("");

    var items = insp.items.map(function (it, i) {
      return '<div class="ia-item"><label class="ia-check"><input type="checkbox" data-field="checked" data-key="' + i + '"' + (it.checked ? " checked" : "") + ">" +
        "<span>" + esc(it.label) + (it.hint ? "<small>" + esc(it.hint) + "</small>" : "") + "</span></label>" +
        '<div class="ia-item-body"><label class="ia-field ia-field-inline"><span>Observation <em>(optional)</em></span>' +
        '<input type="text" data-field="obs" data-key="' + i + '" value="' + esc(it.obs) + '" autocomplete="off"></label>' +
        photoField(String(i), it.photos) + "</div></div>";
    }).join("");

    page(baseCrumbs().concat([{ label: org.code || org.name, href: "#/org/" + org.id }, { label: mine.name, href: "#/mine/" + mine.id }, { label: "New inspection" }]), "Inspection",
      '<section class="ia-panel">' +
      '<div class="ia-panel-head"><div><h2>' + esc(mine.name) + '</h2><p class="ia-sub">' + esc(orgTitle(org)) + " &ndash; started " + esc(fmt(insp.startedAt)) + "</p></div>" +
      '<p class="ia-savestate" id="ia-savestate">Changes save automatically</p></div>' +

      '<div class="ia-grid">' +
      '<div class="ia-field"><label for="ia-officer">Inspecting officer</label><input id="ia-officer" type="text" data-field="officer" value="' + esc(insp.officer) + '" autocomplete="name"><p class="ia-error" data-error="officer" hidden></p></div>' +
      '<div class="ia-field"><label for="ia-type">Inspection type</label><select id="ia-type" data-field="type">' + typeOpts + '</select><p class="ia-error" data-error="type" hidden></p></div>' +
      "</div>" +

      '<fieldset class="ia-gps"><legend>Location: GPS coordinates</legend>' +
      '<div class="ia-grid ia-grid-3">' +
      '<div class="ia-field"><label for="ia-lat">Latitude</label><input id="ia-lat" type="text" inputmode="decimal" data-field="lat" value="' + esc(insp.gps.lat) + '" placeholder="e.g. 23.6850"></div>' +
      '<div class="ia-field"><label for="ia-lng">Longitude</label><input id="ia-lng" type="text" inputmode="decimal" data-field="lng" value="' + esc(insp.gps.lng) + '" placeholder="e.g. 87.0700"></div>' +
      '<div class="ia-field ia-field-btn"><button type="button" class="ia-btn ia-btn-ghost" data-action="gps">' + ICON.pin + " Use current location</button></div></div>" +
      '<p class="ia-hint" id="ia-gps-note"></p><p class="ia-error" data-error="gps" hidden></p></fieldset>' +

      '<div class="ia-section-head"><h3>Checklist</h3><p class="ia-hint">Tick each item that is done. Unticked items are recorded as issues.</p></div>' +
      items +

      '<div class="ia-item ia-item-other"><h3 class="ia-other-title">' + esc(insp.other.label) + "</h3>" +
      '<div class="ia-item-body ia-item-body-flush"><label class="ia-field ia-field-inline"><span>Observation <em>(optional)</em></span>' +
      '<textarea rows="3" data-field="obs" data-key="other">' + esc(insp.other.obs) + "</textarea></label>" +
      photoField("other", insp.other.photos) + "</div></div>" +

      '<p class="ia-error ia-error-block" data-error="form" role="alert" hidden></p>' +
      '<div class="ia-actions"><button type="button" class="ia-btn ia-btn-primary ia-btn-pill" data-action="submit">Submit inspection</button>' +
      '<button type="button" class="ia-btn ia-btn-danger" data-action="discard" data-mine="' + esc(mine.id) + '">Discard draft</button></div>' +
      '<p class="ia-hint">A submitted report cannot be edited. Submit only when the inspection is finished.</p>' +
      "</section>");
  }

  function setSaveState(msg) {
    var el = document.getElementById("ia-savestate");
    if (el) el.textContent = msg;
  }

  function scheduleSave() {
    setSaveState("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 450);
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!current || current.status === "submitted" && !current.__submitting) return Promise.resolve();
    current.updatedAt = Date.now();
    var list = Store.data.inspections;
    if (list.indexOf(current) === -1) {
      list.push(current);
      history.replaceState(null, "", "#/inspection/" + current.id + "/edit");
    }
    try { localStorage.setItem("ia-last-officer", current.officer || ""); } catch (e) { /* ignore */ }
    var keys = photosDirty ? ["inspections", "photos"] : ["inspections"];
    photosDirty = false;
    return Store.save.apply(Store, keys).then(function () {
      setSaveState("Auto-saved at " + clock(current ? current.updatedAt : Date.now()));
    }).catch(function () {
      setSaveState("Could not save. Check that browser storage has free space.");
      toast("Could not save your changes. Browser storage may be full.");
    });
  }

  function captureGps(manual) {
    var note = document.getElementById("ia-gps-note");
    if (!navigator.geolocation) {
      if (note) note.textContent = "This browser cannot provide a location. Enter the coordinates by hand.";
      return;
    }
    if (note) note.textContent = "Getting your location…";
    var target = current;
    navigator.geolocation.getCurrentPosition(function (pos) {
      if (current !== target) return;
      target.gps = { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6), accuracy: Math.round(pos.coords.accuracy) };
      var la = document.getElementById("ia-lat"), ln = document.getElementById("ia-lng");
      if (la) la.value = target.gps.lat;
      if (ln) ln.value = target.gps.lng;
      if (note) note.textContent = "Location captured, accurate to about " + target.gps.accuracy + " m.";
      if (manual || Store.data.inspections.indexOf(target) > -1) scheduleSave();
    }, function (err) {
      if (!note) return;
      note.textContent = err && err.code === 1
        ? "Location permission was denied. Enter the coordinates by hand or allow location access."
        : "Could not get your location. Enter the coordinates by hand.";
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }

  function compress(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = 1280, w = img.naturalWidth, h = img.naturalHeight;
        var s = Math.min(1, max / Math.max(w, h));
        w = Math.round(w * s); h = Math.round(h * s);
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
      img.src = url;
    });
  }

  function photoTarget(key) { return key === "other" ? current.other : current.items[Number(key)]; }

  function refreshThumbs(key) {
    var el = view.querySelector('[data-thumbs="' + key + '"]');
    if (el) el.innerHTML = thumbs(photoTarget(key).photos, key, true);
  }

  function addPhotos(input) {
    var key = input.getAttribute("data-key");
    var files = Array.prototype.slice.call(input.files || []);
    input.value = "";
    if (!files.length || !current) return;
    var target = current;
    setSaveState("Adding photo…");
    files.reduce(function (chain, f) {
      return chain.then(function () {
        return compress(f).then(function (dataUrl) {
          var pid = Store.uid("ph");
          Store.data.photos[pid] = dataUrl;
          photosDirty = true;
          photoTarget(key).photos.push(pid);
        }).catch(function () { toast("One file could not be read as an image."); });
      });
    }, Promise.resolve()).then(function () {
      if (current !== target) return;
      refreshThumbs(key);
      persist();
    });
  }

  function removePhoto(key, pid) {
    var t = photoTarget(key);
    t.photos = t.photos.filter(function (p) { return p !== pid; });
    delete Store.data.photos[pid];
    photosDirty = true;
    refreshThumbs(key);
    persist();
  }

  function showErrors(errs) {
    var first = null;
    view.querySelectorAll("[data-error]").forEach(function (el) {
      var k = el.getAttribute("data-error");
      if (errs[k]) { el.textContent = errs[k]; el.hidden = false; if (!first) first = el; }
      else { el.hidden = true; el.textContent = ""; }
    });
    if (first) {
      var field = first.parentElement.querySelector("input,select");
      if (field && first.getAttribute("data-error") !== "form") field.focus(); else first.scrollIntoView({ block: "center" });
    }
  }

  function submitInspection() {
    if (!current) return;
    var errs = {};
    if (!(current.officer || "").trim()) errs.officer = "Enter the inspecting officer's name.";
    if (!current.type) errs.type = "Select the inspection type.";
    var lat = parseFloat(current.gps.lat), lng = parseFloat(current.gps.lng);
    if (isNaN(lat) || isNaN(lng)) errs.gps = "Enter the GPS latitude and longitude, or use your current location.";
    else if (lat < -90 || lat > 90 || lng < -180 || lng > 180) errs.gps = "Latitude must be between -90 and 90, and longitude between -180 and 180.";
    if (Object.keys(errs).length) {
      errs.form = "Complete the highlighted fields to submit this inspection.";
      showErrors(errs);
      return;
    }
    showErrors({});
    current.officer = current.officer.trim();
    current.status = "submitted";
    current.__submitting = true;
    current.submittedAt = Date.now();
    var done = current;
    persist().then(function () {
      delete done.__submitting;
      Store.save("inspections").then(function () {
        toast("Inspection submitted.");
        keepToast = true;
        location.hash = "#/inspection/" + done.id;
      });
    });
  }

  function discardDraft(mineId) {
    var inList = current && Store.data.inspections.indexOf(current) > -1;
    if (inList && !window.confirm("Discard this draft? Its notes and photos will be deleted.")) return;
    if (current && inList) {
      var pids = current.other.photos.slice();
      current.items.forEach(function (it) { pids = pids.concat(it.photos); });
      pids.forEach(function (p) { delete Store.data.photos[p]; });
      Store.data.inspections = Store.data.inspections.filter(function (x) { return x !== current; });
      Store.save("inspections", "photos");
    }
    clearTimeout(saveTimer); saveTimer = null;
    current = null;
    location.hash = "#/mine/" + mineId;
  }

  function deleteInspectionRecord(insp) {
    var pids = insp.other.photos.slice();
    insp.items.forEach(function (it) { pids = pids.concat(it.photos); });
    pids.forEach(function (p) { delete Store.data.photos[p]; });
    Store.data.inspections = Store.data.inspections.filter(function (x) { return x !== insp; });
  }

  function deleteInspection(inspId) {
    var insp = findBy(Store.data.inspections, inspId);
    if (!insp) return;
    if (!canDelete(insp)) { window.alert("Only " + insp.createdBy + ", who registered this inspection, can delete it."); return; }
    var label = insp.status === "submitted" ? "this submitted inspection report" : "this draft inspection";
    if (!window.confirm("Delete " + label + "? Its notes and photos will be permanently deleted. This cannot be undone.")) return;
    var mineId = insp.mineId;
    if (current === insp) { clearTimeout(saveTimer); saveTimer = null; current = null; }
    deleteInspectionRecord(insp);
    Store.save("inspections", "photos").then(function () {
      toast("Inspection deleted.");
      if (location.hash.indexOf("#/inspection/" + inspId) === 0) location.hash = "#/mine/" + mineId;
      else route();
    });
  }

  function deleteMine(mineId) {
    var mine = findBy(Store.data.mines, mineId);
    if (!mine) return;
    if (!canDelete(mine)) { window.alert("Only " + mine.createdBy + ", who registered this coal mine, can delete it."); return; }
    var related = Store.data.inspections.filter(function (x) { return x.mineId === mineId; });
    var warn = "Delete “" + mine.name + "”?" + (related.length ? " This will also delete " + related.length + " inspection" + (related.length === 1 ? "" : "s") + " recorded for it." : "") + " This cannot be undone.";
    if (!window.confirm(warn)) return;
    related.forEach(deleteInspectionRecord);
    if (current && current.mineId === mineId) { clearTimeout(saveTimer); saveTimer = null; current = null; }
    Store.data.mines = Store.data.mines.filter(function (m) { return m.id !== mineId; });
    Store.save("mines", "inspections", "photos").then(function () {
      toast(mine.name + " deleted.");
      if (location.hash.indexOf("#/mine/" + mineId) === 0) location.hash = "#/org/" + mine.orgId;
      else route();
    });
  }

  /* ---------- 5. submitted report ---------- */

  function viewReport(insp) {
    var mine = findBy(Store.data.mines, insp.mineId) || { name: "Unknown mine", location: "-", id: "" };
    var org = findBy(Store.data.orgs, insp.orgId) || { name: "Unknown organization", id: "" };
    var issues = getIssues(insp);
    var lat = insp.gps.lat, lng = insp.gps.lng;
    var mapLink = lat && lng
      ? '<a href="https://www.openstreetmap.org/?mlat=' + encodeURIComponent(lat) + "&amp;mlon=" + encodeURIComponent(lng) + "#map=16/" + encodeURIComponent(lat) + "/" + encodeURIComponent(lng) + '" target="_blank" rel="noopener">View on map</a>' : "";

    var issueBox = issues.length
      ? '<div class="ia-issuebox is-bad"><h3>Issues reported (' + issues.length + ")</h3><ul>" + issues.map(function (i) {
          return "<li><strong>" + esc(i.label) + "</strong>" + (i.obs ? ": " + esc(i.obs) : "") + (i.photos ? ' <span class="ia-muted">(' + i.photos + (i.photos > 1 ? " photos" : " photo") + ")</span>" : "") + "</li>";
        }).join("") + "</ul></div>"
      : '<div class="ia-issuebox is-ok"><h3>No issues reported</h3><p>Every checklist item was confirmed and no other issue was raised.</p></div>';

    var results = insp.items.map(function (it) {
      var flagged = it.issueWhen === "checked" ? it.checked : !it.checked;
      return '<article class="ia-result' + (flagged ? " is-issue" : "") + '"><div class="ia-result-head"><span class="ia-chip ' + (flagged ? "is-bad" : "is-ok") + '">' + (it.checked ? "Yes" : "No") + "</span><h4>" + esc(it.label) + "</h4></div>" +
        (it.obs ? '<p class="ia-obs"><span class="ia-muted">Observation:</span> ' + esc(it.obs) + "</p>" : "") +
        (it.photos.length ? '<div class="ia-thumbs">' + thumbs(it.photos, "", false) + "</div>" : "") + "</article>";
    }).join("");

    var o = insp.other, hasOther = (o.obs || "").trim() || o.photos.length;
    var other = '<article class="ia-result' + (hasOther ? " is-issue" : "") + '"><div class="ia-result-head"><h4>' + esc(o.label) + "</h4></div>" +
      (hasOther ? ((o.obs || "").trim() ? '<p class="ia-obs">' + esc(o.obs) + "</p>" : "") + (o.photos.length ? '<div class="ia-thumbs">' + thumbs(o.photos, "", false) + "</div>" : "")
        : '<p class="ia-muted">None reported.</p>') + "</article>";

    page(baseCrumbs().concat([{ label: org.code || org.name, href: "#/org/" + org.id }, { label: mine.name, href: "#/mine/" + mine.id }, { label: "Report" }]), "Inspection report",
      '<section class="ia-panel">' +
      '<div class="ia-panel-head"><div><h2>Inspection at: ' + esc(fmt(insp.startedAt)) + '</h2><p class="ia-sub">' + esc(mine.name) + " &ndash; " + esc(orgTitle(org)) + "</p></div>" +
      '<div class="ia-tools ia-noprint"><button type="button" class="ia-btn ia-btn-ghost" data-action="print">' + ICON.print + " Print report</button>" +
      '<a class="ia-btn ia-btn-primary" href="#/mine/' + esc(mine.id) + '">' + ICON.back + " All inspections</a></div></div>" +
      '<dl class="ia-facts">' +
      "<div><dt>Coal mine</dt><dd>" + esc(mine.name) + "</dd></div>" +
      "<div><dt>Mine location</dt><dd>" + esc(mine.location) + "</dd></div>" +
      "<div><dt>Inspecting officer</dt><dd>" + esc(insp.officer) + "</dd></div>" +
      "<div><dt>Inspection type</dt><dd>" + esc(insp.type) + "</dd></div>" +
      "<div><dt>Started</dt><dd>" + esc(fmt(insp.startedAt)) + "</dd></div>" +
      "<div><dt>Submitted</dt><dd>" + esc(fmt(insp.submittedAt)) + "</dd></div>" +
      "<div><dt>GPS coordinates</dt><dd>" + esc(lat) + ", " + esc(lng) + (mapLink ? "<br>" + mapLink : "") + "</dd></div>" +
      "</dl>" + issueBox +
      '<div class="ia-section-head"><h3>Checklist</h3></div>' + results + other + "</section>");
  }

  /* ---------- dialogs ---------- */

  function openOrgDialog() {
    dlg.setAttribute("data-kind", "org");
    dlg.innerHTML =
      '<form novalidate><h2>Add organization</h2><p class="ia-hint">The organization appears in the list and can be selected for inspections.</p>' +
      '<label class="ia-field"><span>Organization name</span><input name="name" type="text" maxlength="120" autocomplete="off" placeholder="e.g. Singareni Collieries Company Limited"></label>' +
      '<label class="ia-field"><span>Short name <em>(optional)</em></span><input name="code" type="text" maxlength="12" autocomplete="off" placeholder="e.g. SCCL"></label>' +
      '<p class="ia-error" role="alert" hidden></p>' +
      '<div class="ia-dialog-actions"><button type="button" class="ia-btn ia-btn-ghost" data-action="close-dialog">Cancel</button><button type="submit" class="ia-btn ia-btn-primary">Add organization</button></div></form>';
    dlg.showModal();
    dlg.querySelector("input").focus();
  }

  function openMineDialog(orgId, prefill) {
    var org = findBy(Store.data.orgs, orgId);
    if (!org) return;
    dlg.setAttribute("data-kind", "mine");
    dlg.setAttribute("data-org", org.id);
    dlg.innerHTML =
      '<form novalidate><h2>Register coal mine</h2><p class="ia-hint">This mine will be added under ' + esc(orgTitle(org)) + " and stay available for future inspections.</p>" +
      '<label class="ia-field"><span>Coal mine name</span><input name="name" type="text" maxlength="120" autocomplete="off" placeholder="e.g. Jhanjra Colliery" value="' + esc(prefill || "") + '"></label>' +
      '<label class="ia-field"><span>Location</span><input name="location" type="text" maxlength="200" autocomplete="off" placeholder="e.g. Raniganj, Paschim Bardhaman, West Bengal"></label>' +
      '<p class="ia-error" role="alert" hidden></p>' +
      '<div class="ia-dialog-actions"><button type="button" class="ia-btn ia-btn-ghost" data-action="close-dialog">Cancel</button><button type="submit" class="ia-btn ia-btn-primary">Register coal mine</button></div></form>';
    dlg.showModal();
    dlg.querySelector(prefill ? 'input[name="location"]' : "input").focus();
  }

  function dialogError(msg, field) {
    var p = dlg.querySelector(".ia-error");
    p.textContent = msg; p.hidden = false;
    var f = dlg.querySelector('input[name="' + field + '"]');
    if (f) f.focus();
  }

  dlg.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var kind = dlg.getAttribute("data-kind");
    var name = f.elements.name.value.trim().replace(/\s+/g, " ");

    if (kind === "org") {
      var code = f.elements.code.value.trim().toUpperCase();
      if (!name) return dialogError("Enter the organization name.", "name");
      var dupOrg = Store.data.orgs.some(function (o) { return norm(o.name) === norm(name) || (code && norm(o.code) === norm(code)); });
      if (dupOrg) return dialogError("An organization with this name or short name is already listed.", "name");
      var org = { id: Store.uid("org"), name: name, code: code, createdAt: Date.now() };
      Store.data.orgs.push(org);
      Store.save("orgs");
      ui.flash = org.id;
      dlg.close();
      viewOrgs();
      toast(orgTitle(org) + " added.");
    } else if (kind === "mine") {
      var orgId = dlg.getAttribute("data-org");
      var loc = f.elements.location.value.trim().replace(/\s+/g, " ");
      if (!name) return dialogError("Enter the coal mine name.", "name");
      if (!loc) return dialogError("Enter the location of the coal mine.", "location");
      var dup = Store.data.mines.some(function (m) { return m.orgId === orgId && norm(m.name) === norm(name); });
      if (dup) return dialogError("“" + name + "” is already registered under this organization. Close this window and select it from the list.", "name");
      var mine = { id: Store.uid("mine"), orgId: orgId, name: name, location: loc, createdAt: Date.now(), createdBy: ensureIdentity("Enter your name to register this coal mine. Only you will be able to delete it later.") };
      Store.data.mines.push(mine);
      Store.save("mines");
      ui.flash = mine.id; ui.search = "";
      dlg.close();
      viewMines(orgId);
      toast(mine.name + " registered. Select it to start an inspection.");
    }
  });

  /* ---------- events ---------- */

  root.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var a = el.getAttribute("data-action");
    if (a === "delete-mine" || a === "delete-inspection") { e.preventDefault(); e.stopPropagation(); }
    if (a === "add-org") openOrgDialog();
    else if (a === "switch-identity") {
      var cur = getIdentity();
      var name = (window.prompt("Enter your name" + (cur ? " (currently \"" + cur + "\")" : "") + ". This is used only to control who can delete records on this device.", cur) || "").trim();
      if (name) { setIdentity(name); route(); }
    }
    else if (a === "delete-mine") deleteMine(el.getAttribute("data-mine"));
    else if (a === "delete-inspection") deleteInspection(el.getAttribute("data-insp"));
    else if (a === "register-mine") openMineDialog(el.getAttribute("data-org"), el.getAttribute("data-prefill"));
    else if (a === "close-dialog") dlg.close();
    else if (a === "new-inspection") location.hash = "#/mine/" + el.getAttribute("data-mine") + "/new";
    else if (a === "gps") captureGps(true);
    else if (a === "submit") submitInspection();
    else if (a === "discard") discardDraft(el.getAttribute("data-mine"));
    else if (a === "print") window.print();
    else if (a === "remove-photo") removePhoto(el.getAttribute("data-key"), el.getAttribute("data-photo"));
    else if (a === "open-photo") {
      box.innerHTML = '<button type="button" class="ia-btn ia-btn-primary ia-btn-sm" data-action="close-lightbox">Close</button><img alt="Inspection photo" src="' + Store.data.photos[el.getAttribute("data-photo")] + '">';
      box.showModal();
    } else if (a === "close-lightbox") box.close();
  });

  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  view.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "ia-search") {
      ui.search = t.value;
      var list = document.getElementById("ia-mines-list");
      var org = list && findBy(Store.data.orgs, list.getAttribute("data-org"));
      if (org) list.innerHTML = minesTable(org);
      return;
    }
    var field = t.getAttribute("data-field");
    if (!field || !current || field === "photo") return;
    var key = t.getAttribute("data-key");
    if (field === "officer") current.officer = t.value;
    else if (field === "type") current.type = t.value;
    else if (field === "lat" || field === "lng") { current.gps[field] = t.value.trim(); current.gps.accuracy = null; }
    else if (field === "checked") { var it = current.items[Number(key)]; it.checked = t.checked; it.touched = true; }
    else if (field === "obs") {
      if (key === "other") current.other.obs = t.value;
      else { var it2 = current.items[Number(key)]; it2.obs = t.value; if (t.value.trim()) it2.touched = true; }
    }
    var errKey = { officer: "officer", type: "type", lat: "gps", lng: "gps" }[field];
    if (errKey) clearError(errKey);
    scheduleSave();
  });

  function clearError(key) {
    var el = view.querySelector('[data-error="' + key + '"]');
    if (el) { el.hidden = true; el.textContent = ""; }
    var any = view.querySelectorAll('[data-error]:not([data-error="form"]):not([hidden])').length;
    var form = view.querySelector('[data-error="form"]');
    if (form && !any) { form.hidden = true; form.textContent = ""; }
  }

  view.addEventListener("change", function (e) {
    var t = e.target;
    if (t.getAttribute("data-field") === "photo") addPhotos(t);
  });

  document.addEventListener("visibilitychange", function () { if (document.hidden && saveTimer) persist(); });
  window.addEventListener("pagehide", function () { if (saveTimer) persist(); });

  /* ---------- router ---------- */

  function route() {
    if (saveTimer) persist();
    if (dlg.open) dlg.close();
    if (box.open) box.close();
    if (!keepToast) toastEl.classList.remove("show");
    keepToast = false;
    current = null;

    var p = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    var kind = p[0], id = p[1], sub = p[2];

    if (!kind) viewOrgs();
    else if (kind === "org") { ui.search = ""; viewMines(id); }
    else if (kind === "mine" && !sub) viewMine(id);
    else if (kind === "mine" && sub === "new") {
      var mine = findBy(Store.data.mines, id);
      if (!mine) return notFound("Coal mine not found");
      current = newInspection(mine);
      viewForm(current, mine, findBy(Store.data.orgs, mine.orgId) || { name: "Unknown organization", id: "" });
      captureGps(false);
    } else if (kind === "inspection") {
      var insp = findBy(Store.data.inspections, id);
      if (!insp) return notFound("Inspection not found");
      if (insp.status === "submitted") {
        if (sub === "edit") history.replaceState(null, "", "#/inspection/" + id);
        viewReport(insp);
        return afterRender();
      }
      if (sub !== "edit") {
        history.replaceState(null, "", "#/inspection/" + id + "/edit");
        return route();
      }
      current = insp;
      var m2 = findBy(Store.data.mines, insp.mineId);
      if (!m2) return notFound("Coal mine not found");
      viewForm(insp, m2, findBy(Store.data.orgs, insp.orgId) || { name: "Unknown organization", id: "" });
    } else notFound("Page not found");

    afterRender();
  }

  function afterRender() {
    if (rendered) window.scrollTo(0, 0);
    rendered = true;
  }

  Store.init(function () {
    return (CFG.organizations || []).map(function (o) {
      return { id: Store.uid("org"), name: o.name, code: o.code || "", createdAt: Date.now() };
    });
  }).then(function () {
    function isEditing() { return /\/(new|edit)(\/|$)/.test(location.hash); }
    window.addEventListener("hashchange", function () { Store.refresh().then(route, route); });
    if (Store.startPolling) Store.startPolling(6000, isEditing, route);
    route();
  });
  }

  start();
})();
