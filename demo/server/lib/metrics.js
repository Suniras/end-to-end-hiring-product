/* ============================================================================
   metrics.js  ·  everything the product reports, derived from what happened

   No duration in this product is written into a screen. Every one of them is
   computed here from the recorded events, which is the point: the PRD says the
   product has to become the instrument that measures the process, and an
   instrument that reports a number somebody typed in is not one.

   So if the demo dataset produces 4.7 days, the interface says 4.7 days. If it
   produces 8.3, it says 8.3. Nothing is rounded towards a better story and
   there is no floor under an ugly number.

   The distinction that matters most in here is queue against work.
     work   somebody or something was doing the thing. Recorded as durationMs
            on the event that did it.
     queue  the gap between one event and the next, when nothing was happening.
   Seventeen of the nineteen classifiable steps in this funnel are waits or
   handoffs, so the queue is the product. It is measured, never estimated.
   ============================================================================ */

'use strict';

const S = require('./schema');
const STEPS = require('../../js/steps.js');
const { DAY, HOUR } = require('./clock');

const STEP_BY_N = {};
STEPS.forEach((s) => { STEP_BY_N[s.n] = s; });

/* ------------------------------------------------------------- indexing --- */

function eventsFor(store, ctx, applicationId) {
  return store.where('workflowEvents', ctx.tenantId, (e) => e.applicationId === applicationId)
    .sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
}

/* ------------------------------------------------------------- timeline --- */

/**
 * All twenty steps for one application, whether it has reached them or not.
 *
 * The steps it has not reached are not blanks. Each says who will own it, what
 * has to happen first, and whether the product can move it or is waiting on
 * somebody outside. That visibility is the strongest thing this product does:
 * one system sees the whole journey, including the parts it does not control.
 */
function timeline(store, ctx, applicationId) {
  const a = store.byId('applications', ctx.tenantId, applicationId);
  if (!a) return null;
  const evs = eventsFor(store, ctx, applicationId);
  const r = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  const tasks = store.where('onboardingTasks', ctx.tenantId, (t) => t.applicationId === a.id);
  const excs = store.where('exceptions', ctx.tenantId, (e) => e.applicationId === a.id && !e.resolvedAt);
  const now = ctx.clock.now();

  const currentStep = S.stepOf(a.state);
  const reached = {};
  evs.forEach((e) => { if (e.step != null) reached[e.step] = true; });

  const rows = STEPS.map((def) => {
    const mine = evs.filter((e) => e.step === def.n);
    const later = evs.filter((e) => e.step != null && e.step > def.n);

    const notRequired = (def.n === 4 || def.n === 5) && !r.requiresManagerInterview;
    const enteredAt = mine.length ? mine[0].at : null;
    const lastOwnAt = mine.length ? mine[mine.length - 1].at : null;

    /* When a step finished is not "when the next step started". Steps 11 to 14
       run in parallel, so a later-numbered step routinely finishes first, and
       reading the next step's start as this step's end produced negative
       durations that then clamped to zero. A step with a history of its own ends
       at its own last event. A step with a single event, which is a step that
       was only ever entered and left, ends when the next one begins.

       And a step with work still outstanding is not finished, whatever the
       events say. Step 14 was reporting itself done while the badge nobody had
       provisioned was still sitting on the critical path, because three of its
       four tasks had completed and no later step had started. */
    const myTasks = tasks.filter((t) => t.step === def.n);
    /* A task that cannot legally start yet is a future obligation, not
       outstanding work. Form I-9 Section 2 sits in step 11 and cannot happen
       before the first day of work for pay, so counting it against step 11 left
       every candidate permanently parked there and buried the step that was
       actually holding them up. */
    const tasksOutstanding = myTasks.some((t) =>
      t.status !== 'done' && !(t.afterStart && !a.startedAt));

    const completedAt = tasksOutstanding ? null : (mine.length > 1
      ? (later.length || !isOpen(a, def.n) ? lastOwnAt : null)
      : (later.length ? later[0].at : null));

    const workMs = mine.reduce((n, e) => n + (e.durationMs || 0), 0);
    const endFor = completedAt != null ? completedAt : (enteredAt != null ? now : null);
    // A step took at least as long as the work recorded inside it.
    const elapsedMs = enteredAt != null ? Math.max(endFor - enteredAt, workMs) : null;
    const queueMs = elapsedMs != null ? Math.max(0, elapsedMs - workMs) : null;

    let status;
    if (notRequired) status = 'not_required';
    // A step with no events of its own has not happened, whatever came after
    // it. Reading a later step's start as proof this one finished marked
    // E-Verify complete for people who have not had a first day yet.
    else if (enteredAt == null) status = S.isTerminal(a.state) ? 'never_reached' : 'pending';
    else if (completedAt != null) status = 'done';
    else status = 'current';

    const stepExcs = excs.filter((e) => stepOfException(e, tasks) === def.n);
    const blocked = stepExcs.filter((e) => e.blocksProgress);

    return {
      n: def.n,
      stage: def.stage,
      name: def.name,
      owner: def.owner,
      ownerWhy: ownerWhy(def.owner),
      lawClock: !!def.clock,
      law: def.law || null,
      status,
      notRequiredReason: notRequired
        ? 'This requisition uses the screening conversation in place of an interview, so steps 4 and 5 do not apply to it.'
        : null,
      enteredAt, completedAt, elapsedMs, workMs, queueMs,
      actors: uniq(mine.filter((e) => e.actor).map((e) => e.actor)),
      handoffs: mine.filter((e) => e.handoff).length,
      // The honest three-way split. Colour comes from owner and nothing new is
      // introduced: an external wait is already amber.
      actability: def.owner === 'clock' ? 'external' : (def.owner === 'human' ? 'person' : 'product'),
      canAct: def.owner !== 'clock' && status !== 'not_required',
      isCurrent: false,      // set below, once every row exists
      blocker: blocked.length ? blocked[0].title : null,
      blockerDetail: blocked.length ? blocked[0].detail : null,
      nextAction: null,
      tasks: tasks.filter((t) => t.step === def.n).map((t) => ({
        key: t.key, name: t.name, status: t.status, owner: t.owner, actor: t.actor,
        startedAt: t.startedAt, doneAt: t.doneAt, blockedBy: t.blockedBy,
        reusedFrom: t.reusedFrom, law: t.law, note: t.note
      }))
    };
  });

  /* Which step is actually "here now".

     The state maps to a step, but steps 11 to 14 run in parallel, so the step
     the state points at can be finished while a later one is still running. An
     application sitting on a badge nobody has provisioned was reporting itself
     as both done at step 11 and currently at step 11, which is two answers to
     one question.

     So: the first step still open wins. If none is open, fall back to the step
     the state maps to. */
  /* A blocking exception outranks everything. Somebody stopped on a background
     check that returned a record is not "at step 14 doing onboarding", even
     though onboarding tasks are genuinely running in the background: the answer
     to "where are they" is the thing that stopped them. */
  let effective = rows.find((r) => r.blocker)
    || rows.find((r) => r.status === 'current')
    // Everything up to and including the mapped step is finished, so the honest
    // answer is the next thing that has not happened yet.
    || rows.find((r) => r.n >= currentStep && r.status === 'pending')
    || rows.find((r) => r.n === currentStep);

  if (effective) {
    effective.isCurrent = true;
    effective.nextAction = nextAction(store, ctx, a,
      STEPS.find((x) => x.n === effective.n), tasks,
      excs.filter((e) => e.blocksProgress && stepOfException(e, tasks) === effective.n));
  }

  return { applicationId: a.id, state: a.state,
           currentStep: effective ? effective.n : currentStep,
           mappedStep: currentStep, steps: rows };
}

/** Is the application still sitting in this step right now? */
function isOpen(a, n) { return S.stepOf(a.state) === n && !S.isTerminal(a.state); }

function stepOfException(e, tasks) {
  const map = { rehire_flag: 2, screening_concern: 3, evaluation_failed: 3,
                offer_quiet: 8, adverse_review: 10, check_delay: 10,
                everify_mismatch: 12, day_one_risk: 16, connector_error: 14 };
  return map[e.kind] != null ? map[e.kind] : null;
}

function ownerWhy(owner) {
  return {
    agent: 'A model does this because a rules engine genuinely cannot.',
    human: 'A person decides this. The product will not proceed without one.',
    system: 'Deterministic software. A model here would make it worse.',
    clock: 'Nobody can compress this. All we can do is make it visible.'
  }[owner];
}

function nextAction(store, ctx, a, def, tasks, blocked) {
  if (blocked.length) return blocked[0].nextAction;
  const next = S.transitionsFrom(a.state).filter((t) => t.to !== 'WITHDRAWN');
  if (!next.length) return null;
  const t = next[0];
  if (t.by.length === 1 && t.by[0] === 'human') return 'Waiting on you. ' + (t.reason || '');
  if (t.by.indexOf('external') >= 0) {
    return 'Waiting on ' + (S.waitingOn(a.state) || 'an external party') + '. Nothing on our side is holding this up.';
  }
  /* A guard that is currently failing is the real answer, and it is more useful
     than "the product can move this on". A tenure milestone in particular is a
     date rather than a queue, and saying so is the whole point of separating
     the two. */
  if (t.guard) {
    const WF = require('./workflow');
    if (!WF.GUARDS[t.guard](store, ctx, a)) return WF.guardReason(t.guard, store, ctx, a);
  }
  if (t.auto) return 'The product will move this on by itself once the preconditions are met.';
  return 'The product can move this on.';
}

/* -------------------------------------------------------- per-application - */

/**
 * The numbers for one candidate's journey. Milestones, and the split between
 * time spent working and time spent queued.
 */
function applicationMetrics(store, ctx, applicationId) {
  const a = store.byId('applications', ctx.tenantId, applicationId);
  if (!a) return null;
  const evs = eventsFor(store, ctx, applicationId);
  const now = ctx.clock.now();
  const dec = a.decisionId ? store.byId('decisions', ctx.tenantId, a.decisionId) : null;
  const off = a.offerId ? store.byId('offers', ctx.tenantId, a.offerId) : null;
  const shift = a.firstShiftId ? store.byId('shifts', ctx.tenantId, a.firstShiftId) : null;
  const excs = store.where('exceptions', ctx.tenantId, (e) => e.applicationId === a.id);

  const firstOf = (state) => { const e = evs.find((x) => x.state === state); return e ? e.at : null; };

  const m = {
    appliedAt: a.appliedAt,
    eligibilityAt: firstOf('ELIGIBLE') || firstOf('INELIGIBLE'),
    screeningStartedAt: firstOf('SCREENING_IN_PROGRESS'),
    screeningCompleteAt: firstOf('SCREENING_COMPLETE'),
    decisionAt: dec ? dec.at : null,
    offerSentAt: off ? off.sentAt : null,
    offerAcceptedAt: off && off.status === 'accepted' ? off.respondedAt : null,
    checkOrderedAt: firstOf('BACKGROUND_CHECK_IN_PROGRESS'),
    checkReturnedAt: firstOf('BACKGROUND_CHECK_COMPLETE'),
    readyAt: firstOf('READY_FOR_SHIFT'),
    firstShiftAt: shift ? shift.startsAt : null,
    startedAt: a.startedAt
  };

  const span = (from, to) => (m[from] != null && m[to] != null) ? m[to] - m[from] : null;

  const workMs = evs.reduce((n, e) => n + (e.durationMs || 0), 0);
  const endMs = a.closedAt || now;
  const elapsedMs = endMs - a.appliedAt;

  const blockedMs = excs.reduce((n, e) => {
    if (!e.blocksProgress) return n;
    return n + ((e.resolvedAt || now) - e.at);
  }, 0);

  return {
    applicationId: a.id,
    milestones: m,
    spans: {
      applicationToScreening: span('appliedAt', 'screeningStartedAt'),
      screeningToDecision: span('screeningCompleteAt', 'decisionAt'),
      decisionToOffer: span('decisionAt', 'offerSentAt'),
      offerToAcceptance: span('offerSentAt', 'offerAcceptedAt'),
      acceptanceToFirstShift: span('offerAcceptedAt', 'firstShiftAt'),
      applicationToOffer: span('appliedAt', 'offerSentAt'),
      applicationToFirstShift: span('appliedAt', 'firstShiftAt'),
      applicationToStart: span('appliedAt', 'startedAt')
    },
    elapsedMs,
    workMs,
    queueMs: Math.max(0, elapsedMs - workMs),
    // The one-line version of the whole argument.
    queueShare: elapsedMs > 0 ? Math.max(0, elapsedMs - workMs) / elapsedMs : null,
    blockedMs,
    handoffs: evs.filter((e) => e.handoff).length,
    peopleInvolved: uniq(evs.filter((e) => e.actorType === 'human' && e.actor).map((e) => e.actor)),
    events: evs.length,
    lost: S.isLost(a.state),
    open: !S.isTerminal(a.state)
  };
}

/* -------------------------------------------------------------- rollups --- */

function median(xs) {
  const v = xs.filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  const i = Math.floor(v.length / 2);
  return v.length % 2 ? v[i] : (v[i - 1] + v[i]) / 2;
}

function mean(xs) {
  const v = xs.filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/**
 * Everything the reports screen shows, for one store or for all of them.
 * `n` is on every number, because a median of two is not a median.
 */
function rollup(store, ctx, filter) {
  filter = filter || {};
  let apps = store.all('applications', ctx.tenantId);
  if (filter.storeId) apps = apps.filter((a) => a.storeId === filter.storeId);
  if (filter.requisitionId) apps = apps.filter((a) => a.requisitionId === filter.requisitionId);

  const metrics = apps.map((a) => applicationMetrics(store, ctx, a.id));
  const pick = (k) => metrics.map((m) => m.spans[k]).filter((x) => x != null);

  const started = metrics.filter((m) => m.milestones.startedAt != null);
  const lost = metrics.filter((m) => m.lost);

  const spans = {};
  ['applicationToScreening', 'screeningToDecision', 'decisionToOffer', 'offerToAcceptance',
   'acceptanceToFirstShift', 'applicationToOffer', 'applicationToFirstShift', 'applicationToStart']
    .forEach((k) => {
      const v = pick(k);
      spans[k] = { median: median(v), mean: mean(v), n: v.length };
    });

  const totalWork = metrics.reduce((n, m) => n + m.workMs, 0);
  const totalQueue = metrics.reduce((n, m) => n + m.queueMs, 0);

  return {
    scope: filter.storeId ? 'store' : 'all stores',
    storeId: filter.storeId || null,
    applications: apps.length,
    open: metrics.filter((m) => m.open).length,
    started: started.length,
    lost: lost.length,
    lostBreakdown: countBy(apps.filter((a) => S.isLost(a.state)).map((a) => a.state)),
    spans,
    queue: {
      totalWorkMs: totalWork,
      totalQueueMs: totalQueue,
      queueShare: (totalWork + totalQueue) > 0 ? totalQueue / (totalWork + totalQueue) : null
    },
    handoffs: { median: median(metrics.map((m) => m.handoffs)), total: metrics.reduce((n, m) => n + m.handoffs, 0) },
    peopleInvolved: {
      median: median(metrics.map((m) => m.peopleInvolved.length)),
      distinct: uniq([].concat.apply([], metrics.map((m) => m.peopleInvolved))).length
    },
    blockedMs: metrics.reduce((n, m) => n + m.blockedMs, 0)
  };
}

/**
 * The funnel. Entered, left, and dropped, counted per step from the events.
 *
 * "Dropped" means an application that reached this step and then ended in a
 * state that loses the candidate. It is not a rate somebody typed in.
 */
function funnel(store, ctx, filter) {
  filter = filter || {};
  let apps = store.all('applications', ctx.tenantId);
  if (filter.storeId) apps = apps.filter((a) => a.storeId === filter.storeId);
  const ids = {};
  apps.forEach((a) => { ids[a.id] = a; });

  const evs = store.all('workflowEvents', ctx.tenantId).filter((e) => ids[e.applicationId]);
  const byStep = {};
  STEPS.forEach((s) => { byStep[s.n] = { entered: {}, durations: [] }; });

  evs.forEach((e) => {
    if (e.step == null || !byStep[e.step]) return;
    byStep[e.step].entered[e.applicationId] = true;
  });

  apps.forEach((a) => {
    const tl = timeline(store, ctx, a.id);
    tl.steps.forEach((s) => {
      if (s.status === 'done' && s.elapsedMs != null) byStep[s.n].durations.push(s.elapsedMs);
    });
  });

  return STEPS.map((def) => {
    const entered = Object.keys(byStep[def.n].entered);
    const lostHere = entered.filter((id) => {
      const a = ids[id];
      if (!S.isLost(a.state)) return false;
      return S.stepOf(a.state) === def.n;
    });
    const durations = byStep[def.n].durations;
    return {
      n: def.n, stage: def.stage, name: def.name, owner: def.owner,
      clock: !!def.clock, cover: def.cover,
      entered: entered.length,
      lost: lostHere.length,
      dropPct: entered.length ? (lostHere.length / entered.length) * 100 : 0,
      medianMs: median(durations),
      n_durations: durations.length,
      inFlight: apps.filter((a) => S.stepOf(a.state) === def.n && !S.isTerminal(a.state)).length
    };
  });
}

/** Who actually did the work, split by the four owner types. */
function actorSplit(store, ctx) {
  const evs = store.all('workflowEvents', ctx.tenantId);
  const counts = countBy(evs.map((e) => e.actorType));
  const total = evs.length || 1;
  return Object.keys(counts).map((k) => ({
    actorType: k, actions: counts[k], pct: (counts[k] / total) * 100
  })).sort((a, b) => b.actions - a.actions);
}

/**
 * The parallelisation, measured. Sequential is what it would have cost if every
 * task waited for the one before it. Actual is the critical path. The gap is
 * the claim, and it is arithmetic rather than a slogan.
 */
function parallelism(store, ctx, applicationId) {
  const a = store.byId('applications', ctx.tenantId, applicationId);
  if (!a || !a.parallel) return null;
  const tasks = store.where('onboardingTasks', ctx.tenantId, (t) => t.applicationId === a.id);
  const done = tasks.filter((t) => t.doneAt != null);
  const actualMs = done.length
    ? Math.max.apply(null, done.map((t) => t.doneAt)) - a.parallel.fannedOutAt
    : null;
  /* Two comparisons, kept apart on purpose.

     The saving is sequential against critical path. Both are sums of the SAME
     estimates, so subtracting one from the other is arithmetic about the shape
     of the work: what it costs if every team waits for the one before it,
     against what it costs when everything that can start does.

     actualMs is observed wall clock from the fan-out to the last completed
     task. It includes real waiting on real people and it is NOT comparable to
     either of the other two. Subtracting it from the sequential estimate was
     mixing estimated minutes with elapsed days and it produced a number that
     looked like a saving and was not one. */
  return {
    fannedOutAt: a.parallel.fannedOutAt,
    startedTogether: a.parallel.startedTogether,
    totalTasks: a.parallel.totalTasks,
    sequentialMs: a.parallel.sequentialMs,
    criticalPathMs: a.parallel.criticalPathMs,
    savedMs: Math.max(0, a.parallel.sequentialMs - a.parallel.criticalPathMs),
    savedPct: a.parallel.sequentialMs > 0
      ? (a.parallel.sequentialMs - a.parallel.criticalPathMs) / a.parallel.sequentialMs * 100 : null,
    actualMs,
    actualNote: 'Observed wall clock, including waiting on people. Not comparable to the two estimates above.',
    tasks: tasks.map((t) => ({
      key: t.key, name: t.name, step: t.step, owner: t.owner, actor: t.actor,
      status: t.status, needs: t.needs, afterStart: t.afterStart,
      startedAt: t.startedAt, doneAt: t.doneAt, estMs: t.estMs,
      actualMs: t.doneAt && t.startedAt ? t.doneAt - t.startedAt : null,
      blockedBy: t.blockedBy, reusedFrom: t.reusedFrom, law: t.law, note: t.note
    }))
  };
}

/* --------------------------------------------------------------- helpers - */

function uniq(xs) { return Array.from(new Set(xs)); }
function countBy(xs) {
  const o = {};
  xs.forEach((x) => { o[x] = (o[x] || 0) + 1; });
  return o;
}

module.exports = {
  timeline, applicationMetrics, rollup, funnel, actorSplit, parallelism,
  median, mean, eventsFor, STEPS, STEP_BY_N
};
