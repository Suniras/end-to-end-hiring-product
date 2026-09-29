/* ============================================================================
   engine.js  ·  the client's cache, its formatting, and its actions

   This file used to hold the state machine, the compliance clocks and the
   business-day arithmetic. All of that moved to the server on 29 August 2026,
   because rules a browser owns are rules anybody can edit from the console.

   What is left is three things and nothing else:

     the cache    whatever the current screen last received from the API
     formatting   turning a millisecond count into "4.7 d"
     actions      ask the server to do something, then reload

   No duration is computed here. If a screen shows a number, the server derived
   it from recorded events. The one exception is fmt: turning 406800000 into
   "4.7 d" is presentation, not measurement.
   ============================================================================ */

window.E = (function () {
  'use strict';

  var boot = null;          // reference data, fetched once
  var data = null;          // the current screen's payload
  var llm = null;           // whether a model is configured
  var pending = [];         // assistant actions waiting on a person
  var listeners = [];
  var loading = false;
  var lastError = null;

  var ui = {
    role: 'marcus',
    route: 'deck',
    storeId: null,
    presenter: false,
    scene: 1,
    focusApplication: null,
    focusScreening: null
  };

  /* ----------------------------------------------------------- lifecycle -- */

  function sub(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (f) { f(); }); }

  function bootstrap() {
    return Promise.all([
      API.view('bootstrap', { as: ui.role }),
      API.llmStatus()
    ]).then(function (r) {
      boot = r[0].data;
      llm = r[1];
      return boot;
    });
  }

  /** Fetches one screen. Params vary by route and are assembled here. */
  function load(route) {
    loading = true;
    lastError = null;
    var params = { as: ui.role };
    if (ui.storeId) params.storeId = ui.storeId;
    if (route === 'candidate' && ui.focusApplication) params.applicationId = ui.focusApplication;
    if (route === 'screening' && ui.focusScreening) params.screeningId = ui.focusScreening;
    return API.view(route, params).then(function (r) {
      data = r.data;
      ui.now = r.now;
      ui.actor = r.actor;
      loading = false;
      return data;
    }).catch(function (err) {
      loading = false;
      lastError = err;
      throw err;
    });
  }

  function refresh() { return load(ui.route).then(emit); }

  function loadPending() {
    return API.get('/pending', { as: ui.role }).then(function (r) {
      pending = r.pending || [];
      return pending;
    });
  }

  /* ---------------------------------------------------------- formatting -- */

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function d(v) { return v instanceof Date ? v : new Date(v); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  /* Everything is formatted in UTC, deliberately.

     The simulated present is a fixed UTC instant and every business-day
     deadline on the server is computed in UTC. Rendering the same instant in
     the viewer's local time made the opening screen read "Monday 17 Aug 12:35"
     on a machine five and a half hours ahead, which is a different hour of the
     working day from the one the compliance clocks were counted against. The
     demo is set in a US retailer, not in the room it is being shown in. */
  function fmtDate(v) { var x = d(v); return x.getUTCDate() + ' ' + MONTHS[x.getUTCMonth()]; }
  function fmtDateTime(v) {
    var x = d(v);
    return x.getUTCDate() + ' ' + MONTHS[x.getUTCMonth()] + ', ' + pad(x.getUTCHours()) + ':' + pad(x.getUTCMinutes());
  }
  function fmtDay(v) {
    var x = d(v);
    return DAYS[x.getUTCDay()] + ' ' + x.getUTCDate() + ' ' + MONTHS[x.getUTCMonth()];
  }

  /** The shortest honest string for a duration. */
  function dur(ms) {
    if (ms == null) return '--';
    var neg = ms < 0;
    ms = Math.abs(ms);
    var s = ms / 1000, out;
    if (s < 90) out = Math.round(s) + ' s';
    else {
      var m = s / 60;
      if (m < 90) out = round1(m) + ' min';
      else {
        var h = m / 60;
        if (h < 40) out = round1(h) + ' h';
        else out = round1(h / 24) + ' d';
      }
    }
    return neg ? '-' + out : out;
  }

  /** For "waiting 3 days", where minutes are noise. */
  function coarse(ms) {
    if (ms == null) return '--';
    var h = ms / 3600000;
    if (h < 1) return Math.max(1, Math.round(ms / 60000)) + ' min';
    if (h < 48) return round1(h) + ' h';
    return round1(h / 24) + ' d';
  }

  function round1(n) { return (Math.round(n * 10) / 10).toString().replace(/\.0$/, ''); }
  function pct(n) { return n == null ? '--' : round1(n) + '%'; }
  function num(v) { return v == null ? '--' : Number(v).toLocaleString('en-US'); }
  function money(cents) { return '$' + (cents / 100).toFixed(2); }

  /* ------------------------------------------------------------- lookups -- */

  function step(n) {
    if (!boot) return null;
    for (var i = 0; i < boot.steps.length; i++) if (boot.steps[i].n === n) return boot.steps[i];
    return null;
  }
  function stateLabel(s) { return (boot && boot.states[s] && boot.states[s].label) || s; }
  function ownerLabel(o) { return (boot && boot.ownerLabels[o]) || o; }
  function ownerWhy(o) { return (boot && boot.ownerWhy[o]) || ''; }
  function ownerClass(o) { return 'own-' + o; }
  function person() {
    if (!boot) return { name: '', role: '' };
    return boot.people[ui.role] || boot.people.marcus;
  }
  function storeById(id) {
    if (!boot) return null;
    for (var i = 0; i < boot.stores.length; i++) if (boot.stores[i].id === id) return boot.stores[i];
    return null;
  }

  /* ------------------------------------------------------------- actions --
     Every one of these is a request. The server decides, and a refusal comes
     back with a reason that the caller shows rather than swallows.
     ---------------------------------------------------------------------- */

  function transition(applicationId, state, opts) {
    return API.post('/applications/' + applicationId + '/transition?as=' + ui.role,
      Object.assign({ state: state }, opts || {}));
  }

  function runScreening(applicationId, opts) {
    return API.post('/applications/' + applicationId + '/screen?as=' + ui.role, opts || {});
  }

  function completeTask(applicationId, taskId) {
    return API.post('/applications/' + applicationId + '/task?as=' + ui.role, { taskId: taskId });
  }

  function resolveException(exceptionId, resolution) {
    return API.post('/exceptions/' + exceptionId + '/resolve?as=' + ui.role, { resolution: resolution });
  }

  function tool(name, args, confirmed) {
    return API.post('/agent/tool?as=' + ui.role, { tool: name, args: args || {}, confirmed: !!confirmed });
  }

  function advanceClock(hours) {
    return API.post('/sim/advance?as=' + ui.role, { hours: hours });
  }

  function reseed() { return API.post('/reset?as=' + ui.role, {}); }

  return {
    // cache
    boot: function () { return boot; },
    data: function () { return data; },
    llm: function () { return llm; },
    pendingActions: function () { return pending; },
    ui: ui,
    now: function () { return ui.now || Date.now(); },
    loading: function () { return loading; },
    lastError: function () { return lastError; },
    sub: sub, emit: emit, bootstrap: bootstrap, load: load, refresh: refresh, loadPending: loadPending,

    // formatting
    fmtDate: fmtDate, fmtDateTime: fmtDateTime, fmtDay: fmtDay,
    dur: dur, coarse: coarse, round1: round1, pct: pct, n: num, money: money,

    // lookups
    step: step, stateLabel: stateLabel, ownerLabel: ownerLabel, ownerWhy: ownerWhy,
    ownerClass: ownerClass, person: person, storeById: storeById,

    // actions
    transition: transition, runScreening: runScreening, completeTask: completeTask,
    resolveException: resolveException, tool: tool, advanceClock: advanceClock, reseed: reseed
  };
})();
