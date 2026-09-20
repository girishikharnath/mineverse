/*
 * Storage layer — shared/networked version
 * -----------------------------------------
 * Talks to the bundled Node.js server (see /server) instead of the browser's
 * IndexedDB, so every officer's browser reads and writes the same shared
 * data. The rest of the app (app.js) is unchanged: it still only touches
 * IAStore.data and calls IAStore.save(...).
 *
 *   IAStore.data.orgs         [{ id, name, code, createdAt }]
 *   IAStore.data.mines        [{ id, orgId, name, location, createdAt, createdBy }]
 *   IAStore.data.inspections  [{ id, mineId, orgId, status, createdBy, ... }]
 *   IAStore.data.photos       { photoId: "data:image/jpeg;base64,..." }
 *
 * Trade-off: api.save() replaces the *whole* collection for a key, the same
 * way the old IndexedDB version did. Two people saving that same collection
 * at the exact same instant can overwrite each other (last write wins). For
 * typical single-officer-at-a-time editing this is not an issue in practice
 * — see server/README.md for more on this.
 *
 * If the server can't be reached, the app keeps working with whatever was
 * last loaded, entirely in memory: nothing will be visible to anyone else,
 * and nothing survives a page reload, until the server is back.
 */
(function () {
  "use strict";

  // The Ministry site's server hosts this API at /api/inspections (same origin
  // as the page). Set window.IA_API_BASE before this loads only if the API
  // lives on a different address.
  var API = (window.IA_API_BASE || "") + "/api/inspections";
  var KEYS = ["orgs", "mines", "inspections", "photos"];

  var api = {
    data: { orgs: [], mines: [], inspections: [], photos: {} },
    persistent: true, // kept for compatibility with app.js's storage-blocked banner
    online: true,
    uid: function (prefix) {
      return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
  };

  function req(method, path, body) {
    return fetch(API + path, {
      method: method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error("Server responded " + res.status);
      return res.status === 204 ? null : res.json();
    });
  }

  function applyState(state) {
    api.data.orgs = state.orgs || [];
    api.data.mines = state.mines || [];
    api.data.inspections = state.inspections || [];
    api.data.photos = state.photos || {};
  }

  // Load current shared state (or seed starting organizations on first run
  // for the whole server, not just this browser).
  api.init = function (seedOrgs) {
    return req("GET", "/state").then(function (state) {
      api.online = true;
      applyState(state);
      if (!state.orgs || !state.orgs.length) {
        api.data.orgs = seedOrgs();
        return api.save("orgs");
      }
    }).catch(function () {
      api.online = false;
      api.persistent = false;
      if (!api.data.orgs.length) api.data.orgs = seedOrgs();
    });
  };

  // Re-fetch the shared state from the server. Used on navigation and by
  // startPolling below, so people see what others have added/submitted.
  api.refresh = function () {
    if (!api.online) return Promise.resolve(false);
    return req("GET", "/state").then(function (state) {
      applyState(state);
      return true;
    }).catch(function () {
      api.online = false;
      return false;
    });
  };

  // Persist one or more of: "orgs", "mines", "inspections", "photos".
  api.save = function () {
    var keys = Array.prototype.slice.call(arguments);
    if (!api.online) return Promise.resolve();
    return Promise.all(keys.map(function (k) {
      return req("PUT", "/state/" + k, api.data[k]);
    }));
  };

  // Poll the server every `ms` milliseconds and call `onChange()` when fresh
  // data actually differs from what's on screen. `shouldSkip()` lets the
  // caller pause polling — e.g. while someone is mid-way through a form, so
  // an incoming refresh can't overwrite what they're typing.
  api.startPolling = function (ms, shouldSkip, onChange) {
    setInterval(function () {
      if (shouldSkip && shouldSkip()) return;
      var before = JSON.stringify(api.data);
      api.refresh().then(function (ok) {
        if (ok && JSON.stringify(api.data) !== before) onChange();
      });
    }, ms);
  };

  window.IAStore = api;
})();
