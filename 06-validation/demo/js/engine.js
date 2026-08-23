/* ============================================================================
   engine.js  ·  state, clocks, formatting, actions

   The demo runs against a fixed simulated present so the countdown clocks
   always read the same on any day it is shown. That date is a Monday, which
   is the whole premise of the opening screen.

   Business-day arithmetic here counts Monday to Friday and ignores federal
   holidays. Real E-Verify deadlines are in federal government working days,
   which do exclude holidays. Called out rather than hidden, because getting
   this wrong in the real product is a compliance event.
   ============================================================================ */

window.E = (function () {
  'use strict';

  var D = window.DEMO;

  /* --------------------------------------------------------- fixed 'now' --- */
  var NOW = new Date('2026-08-17T07:04:00');

  /* --------------------------------------------------------------- state --- */

  function initial() {
    return {
      role: 'dana',
      route: 'deck',
      presenter: false,
      scene: 1,
      // step number -> delta applied to its live count
      stepDelta: {},
      decided: {},          // candidate name -> 'hired' | 'rejected'
      resolvedQueue: {},     // queue id -> true
      reviewed: {},          // in-review name -> true
      blocked: [],           // extra blocked attempts made live in the demo
      flagOutcome: null,     // 'upheld' | 'overridden'
      openStep: null,
      openCheck: null,
      sheet: null
    };
  }

  var state = initial();
  var listeners = [];

  function sub(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (f) { f(state); }); }

  function set(patch) { Object.assign(state, patch); emit(); }

  function reset() {
    var theme = document.documentElement.getAttribute('data-theme');
    state = initial();
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    emit();
  }

  /* ---------------------------------------------------------- formatting --- */

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function d(v) { return v instanceof Date ? v : new Date(v); }

  function fmtDate(v) {
    var x = d(v);
    return x.getDate() + ' ' + MONTHS[x.getMonth()];
  }

  function fmtDateTime(v) {
    var x = d(v);
    return x.getDate() + ' ' + MONTHS[x.getMonth()] + ', ' + pad(x.getHours()) + ':' + pad(x.getMinutes());
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  /** A duration in ms as the shortest honest string. */
  function dur(ms) {
    if (ms == null) return '';
    var s = ms / 1000;
    if (s < 90) return Math.round(s) + ' s';
    var m = s / 60;
    if (m < 90) return round1(m) + ' min';
    var h = m / 60;
    if (h < 40) return round1(h) + ' h';
    var days = h / 24;
    return round1(days) + ' d';
  }

  function round1(n) { return (Math.round(n * 10) / 10).toString().replace(/\.0$/, ''); }

  function pct(n) { return round1(n) + '%'; }

  function n(v) { return Number(v).toLocaleString('en-US'); }

  /* --------------------------------------------------- business day maths --- */

  function isWorkday(x) { var w = x.getDay(); return w !== 0 && w !== 6; }

  /** Add n business days to a date. Day 0 is the next business day after from. */
  function addBusinessDays(from, count) {
    var x = new Date(d(from).getTime());
    var added = 0;
    while (added < count) {
      x.setDate(x.getDate() + 1);
      if (isWorkday(x)) added++;
    }
    return x;
  }

  /** Business days from a to b, not counting a itself. Negative if b precedes a. */
  function businessDaysBetween(a, b) {
    var s = new Date(d(a).getTime()), e = new Date(d(b).getTime());
    var sign = 1;
    if (e < s) { var t = s; s = e; e = t; sign = -1; }
    s.setHours(0, 0, 0, 0); e.setHours(0, 0, 0, 0);
    var c = 0;
    var x = new Date(s.getTime());
    while (x < e) {
      x.setDate(x.getDate() + 1);
      if (isWorkday(x)) c++;
    }
    return c * sign;
  }

  /* --------------------------------------------------------- live clocks --- */

  /**
   * The compliance clocks on Kayla's case, computed rather than hardcoded so
   * they stay internally consistent if the seed dates are edited.
   */
  function clocks() {
    var mm = D.mismatch;
    var out = [];

    // I-9 Section 2: within 3 business days of the first day of work for pay.
    var i9Due = addBusinessDays(mm.started, 3);
    var i9Left = businessDaysBetween(NOW, i9Due);
    out.push({
      key: 'i9',
      t: 'Form I-9, Section 2 examined and signed',
      s: 'Due within 3 business days of the first day of work for pay. A named person must examine the original documents. No model can sign this.',
      law: '8 CFR 274a.2',
      due: i9Due,
      left: i9Left,
      unit: 'business days',
      tone: i9Left <= 0 ? 'crit' : (i9Left <= 1 ? 'warn' : 'clock'),
      state: 'Section 1 done on the start date. Section 2 booked with Dana for this afternoon.'
    });

    // E-Verify case creation: no later than the 3rd business day after start.
    var evDue = addBusinessDays(mm.started, 3);
    out.push({
      key: 'ev',
      t: 'E-Verify case created',
      s: 'Due no later than the third business day after the employee starts work for pay.',
      law: 'E-Verify user manual',
      due: evDue,
      left: 0,
      unit: 'done',
      tone: 'good',
      state: 'Created ' + fmtDateTime(mm.caseCreated) + ', on the start date. Two business days ahead of the deadline.'
    });

    // Mismatch: 10 federal working days from issuance for the employee to give
    // their decision to the employer. She gave it the same day.
    var tncDue = addBusinessDays(mm.tncIssued, 10);
    out.push({
      key: 'tnc',
      t: 'Notify, refer, and get the employee decision',
      s: '10 federal working days from issuance. This window is SHARED: the employer must notify the employee ' +
         'and complete the referral inside it, and the employee decision falls due on the same tenth day.',
      law: 'E-Verify, tentative nonconfirmation',
      due: tncDue,
      left: 0,
      unit: 'done',
      tone: 'good',
      state: 'Notified and referred the same day. She told us she is contesting at ' + fmtDateTime(mm.decisionAt) + '.'
    });

    // After referral: 8 federal working days to contact DHS or visit SSA.
    var refDue = addBusinessDays(mm.referred, 8);
    var refLeft = businessDaysBetween(NOW, refDue);
    out.push({
      key: 'ref',
      t: 'Employee contacts SSA to resolve',
      s: '8 federal working days after the case is referred. E-Verify notes that this window has been extended for some mismatch types, so a hardcoded value would be wrong.',
      law: 'E-Verify, referral',
      due: refDue,
      left: refLeft,
      unit: 'working days',
      tone: refLeft <= 2 ? 'crit' : (refLeft <= 4 ? 'warn' : 'clock'),
      state: 'Referred ' + fmtDateTime(mm.referred) + '. She has an SSA appointment on the 19th.'
    });

    // Clock three, which was missing until 18 Aug 2026. DHS and SSA get their own
    // ten working days from referral to update the result, and DHS's own
    // instruction is to check periodically. So the design polls: there is no
    // notification coming, and anything waiting for one waits forever.
    var govDue = addBusinessDays(mm.referred, 10);
    var govLeft = businessDaysBetween(NOW, govDue);
    out.push({
      key: 'gov',
      t: 'DHS and SSA update the case result',
      s: 'They get 10 federal working days from referral. E-Verify publishes no notification and instructs ' +
         'employers to check periodically, so this is polled rather than pushed.',
      law: 'E-Verify, referral',
      due: govDue,
      left: govLeft,
      unit: 'working days',
      tone: govLeft <= 2 ? 'warn' : 'clock',
      state: 'Last polled ' + fmtDateTime(NOW) + '. Still Case in Continuance, which is E-Verify confirming ' +
             'she has contacted SSA. There is no case status that says "contesting", so we hold that ourselves.'
    });

    return out;
  }

  /** The bar. Not a clock, a prohibition. */
  function adverseBar() {
    var mm = D.mismatch;
    return {
      active: mm.decision === 'Contesting',
      since: mm.tncIssued,
      barred: [
        'Termination',
        'Suspension',
        'Withholding or lowering pay',
        'Delaying training',
        'Removing scheduled shifts'
      ],
      attempts: D.mismatch.blockedAttempts.concat(state.blocked)
    };
  }

  /* ------------------------------------------------------ derived counts --- */

  function stepCount(step) {
    var delta = state.stepDelta[step.n] || 0;
    return Math.max(0, step.at + delta);
  }

  function totalInFlight() {
    return D.steps.reduce(function (a, s) { return a + stepCount(s); }, 0);
  }

  function queueOpen() {
    return D.queue.filter(function (q) { return !state.resolvedQueue[q.id]; });
  }

  function needPerson() {
    return queueOpen().reduce(function (a, q) { return a + q.count; }, 0);
  }

  function decisionsOpen() {
    return D.decisions.filter(function (c) { return !state.decided[c.name]; });
  }

  function reviewOpen() {
    return D.inReview.filter(function (c) { return !state.reviewed[c.name]; });
  }

  function alertCount() {
    var c = 0;
    if (!state.resolvedQueue['q-flag'] && !state.flagOutcome) c++;
    if (!state.resolvedQueue['q-tnc']) c++;
    return c;
  }

  /* -------------------------------------------------------------- actions --- */

  function bump(stepN, by) {
    var m = Object.assign({}, state.stepDelta);
    m[stepN] = (m[stepN] || 0) + by;
    state.stepDelta = m;
  }

  function decide(name, outcome) {
    if (state.decided[name]) return;
    var m = Object.assign({}, state.decided);
    m[name] = outcome;
    state.decided = m;
    bump(6, -1);
    if (outcome === 'hired') bump(7, 1);
    emit();
  }

  function review(name) {
    var m = Object.assign({}, state.reviewed);
    m[name] = true;
    state.reviewed = m;
    emit();
  }

  function resolveQueue(id) {
    var m = Object.assign({}, state.resolvedQueue);
    m[id] = true;
    state.resolvedQueue = m;
    emit();
  }

  function setFlagOutcome(v) { state.flagOutcome = v; emit(); }

  /**
   * The attempt that gets refused. Returns the refusal so the caller can show
   * it, rather than silently doing nothing, because a silent refusal teaches
   * nobody anything.
   */
  function attemptShiftRemoval(who) {
    var bar = adverseBar();
    if (!bar.active) {
      return { allowed: true, reason: '' };
    }
    state.blocked = state.blocked.concat([{
      at: NOW.toISOString(),
      who: who || D.people.marcus.name,
      what: 'Tried to remove ' + D.mismatch.name + ' from the rota',
      outcome: 'Blocked'
    }]);
    emit();
    return {
      allowed: false,
      reason: 'Removing a scheduled shift is an adverse action. ' + D.mismatch.name.split(' ')[0] +
        ' is contesting an E-Verify mismatch, so nothing adverse is lawful until the case reaches a Final Nonconfirmation. ' +
        'She has ' + businessDaysBetween(NOW, addBusinessDays(D.mismatch.referred, 8)) +
        ' working days left to resolve it, and an SSA appointment on the 19th.'
    };
  }

  /* ------------------------------------------------------------- helpers --- */

  var OWNER_LABEL = {
    agent: 'Agent',
    human: 'A person',
    system: 'Software',
    clock: 'Fixed wait'
  };

  var OWNER_WHY = {
    agent: 'A model does this because a rules engine genuinely cannot.',
    human: 'A person decides this. The product will not proceed without one.',
    system: 'Deterministic software. A model here would make it worse.',
    clock: 'Nobody can compress this. All we can do is make it visible.'
  };

  function ownerClass(owner) { return 'own-' + (owner === 'human' ? 'human' : owner); }

  function stagesOf() {
    var out = [], seen = {};
    D.steps.forEach(function (s) {
      if (!seen[s.stage]) { seen[s.stage] = { name: s.stage, steps: [] }; out.push(seen[s.stage]); }
      seen[s.stage].steps.push(s);
    });
    return out;
  }

  function person() { return D.people[state.role]; }

  return {
    NOW: NOW,
    state: function () { return state; },
    sub: sub, set: set, emit: emit, reset: reset,
    fmtDate: fmtDate, fmtDateTime: fmtDateTime, dur: dur, pct: pct, n: n, round1: round1,
    addBusinessDays: addBusinessDays, businessDaysBetween: businessDaysBetween,
    clocks: clocks, adverseBar: adverseBar,
    stepCount: stepCount, totalInFlight: totalInFlight,
    queueOpen: queueOpen, needPerson: needPerson, decisionsOpen: decisionsOpen,
    reviewOpen: reviewOpen, alertCount: alertCount,
    decide: decide, review: review, resolveQueue: resolveQueue,
    setFlagOutcome: setFlagOutcome, attemptShiftRemoval: attemptShiftRemoval,
    OWNER_LABEL: OWNER_LABEL, OWNER_WHY: OWNER_WHY, ownerClass: ownerClass,
    stagesOf: stagesOf, person: person
  };
})();
