/* ============================================================================
   api.js  ·  the browser's half of the boundary

   Every number on every screen comes through here. The browser holds no seed
   data, computes no duration and decides no state change. It asks, it renders
   what comes back, and when the server refuses something it renders the
   refusal rather than the thing it wanted to happen.

   That split is the point. Rules that live in the browser are suggestions,
   because anyone can open the console. Rules that live behind this line hold.
   ============================================================================ */

window.API = (function () {
  'use strict';

  var BASE = '/api';
  var listeners = [];

  function onError(fn) { listeners.push(fn); }
  function fail(where, err) {
    listeners.forEach(function (f) { f(where, err); });
    return Promise.reject(err);
  }

  function qs(params) {
    var out = [];
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] == null || params[k] === '') return;
      out.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    });
    return out.length ? '?' + out.join('&') : '';
  }

  function get(path, params) {
    return fetch(BASE + path + qs(params), { headers: { accept: 'application/json' } })
      .then(function (r) {
        return r.json().then(function (body) {
          if (!r.ok) throw new Error(body.error || ('HTTP ' + r.status));
          return body;
        });
      })
      .catch(function (e) { return fail('GET ' + path, e); });
  }

  /**
   * Returns the parsed body whether the server said yes or no, because a
   * refusal is a result. Only a transport failure rejects.
   */
  function post(path, body) {
    return fetch(BASE + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().then(function (parsed) {
        parsed.httpStatus = r.status;
        return parsed;
      });
    }).catch(function (e) { return fail('POST ' + path, e); });
  }

  return {
    get: get, post: post, onError: onError,
    view: function (name, params) { return get('/view/' + name, params); },
    health: function () { return get('/health'); },
    llmStatus: function () { return get('/llm/status'); }
  };
})();
