/* ============================================================================
   tick.js  ·  the outside world, moving on its own

   Time passes whether anybody is looking or not. A county court returns a
   search, an offer expires, a candidate stops replying, a government department
   updates a case. None of that waits for somebody to press a button in this
   product, and modelling it as though it did would be the exact lie this file
   exists to avoid.

   So: every task and every external search carries the time it is expected to
   take, and this runs on a timer and on every read. When the simulated clock
   passes an expected time, the thing happens. Nothing is random, so the same
   demo produces the same results twice.

   What this does NOT do is move anything a person owns. A decision that has
   been waiting four days keeps waiting. That is the whole argument of the
   product and quietly clearing it overnight would destroy it.
   ============================================================================ */

'use strict';

const WF = require('./workflow');
const EV = require('./events');
const CONN = require('./connectors');
const S = require('./schema');
const { DAY, HOUR, MIN, addBusinessDays, businessDaysBetween } = require('./clock');

function tick(store, ctx) {
  const now = ctx.clock.now();
  const changed = [];
  const sysCtx = Object.assign({}, ctx, { actor: { type: 'external', name: 'External system' } });

  returnSearches(store, sysCtx, now, changed);
  completeTasks(store, sysCtx, now, changed);
  expireOffers(store, sysCtx, now, changed);
  chaseQuiet(store, sysCtx, now, changed);
  pollEverify(store, sysCtx, now, changed);
  advanceTenure(store, sysCtx, now, changed);

  if (changed.length) store.markDirty();
  return changed;
}

/* ------------------------------------------------- the county courts ------ */

function returnSearches(store, ctx, now, changed) {
  store.all('backgroundChecks', ctx.tenantId)
    .filter((c) => c.status === 'in_progress')
    .forEach((c) => {
      let moved = false;
      c.searches.forEach((s) => {
        if (s.returnedAt != null) return;
        if (s.orderedAt + s.expectedMs > now) return;
        s.returnedAt = s.orderedAt + s.expectedMs;
        // A seeded record hit stays a hit. Everything else comes back clear.
        s.result = s.seedResult || 'clear';
        moved = true;
        CONN.call(store, ctx, 'background_check', 'poll',
          { externalRef: c.externalRef, applicationId: c.applicationId, status: 'partial' },
          { at: s.returnedAt });
        EV.workflowEvent(store, ctx, {
          applicationId: c.applicationId, candidateId: c.candidateId,
          at: s.returnedAt, kind: 'note', state: 'BACKGROUND_CHECK_IN_PROGRESS', step: 10,
          owner: 'clock', actorType: 'external', actor: 'Screening agency',
          detail: s.name + ' returned ' + s.result.replace('_', ' ') + '.',
          ref: c.externalRef
        });
      });
      if (moved) {
        c.lastPolledAt = now;
        changed.push({ kind: 'search_returned', applicationId: c.applicationId });
      }
      // A single county running long is the thing worth surfacing, because it is
      // the one number a person can actually chase.
      const open = c.searches.filter((s) => !s.returnedAt);
      if (open.length && !c.delayFlagged) {
        const slowest = open.reduce((a, b) => (b.orderedAt + b.expectedMs > a.orderedAt + a.expectedMs ? b : a), open[0]);
        if (now - c.orderedAt > 5 * DAY) {
          c.delayFlagged = true;
          EV.raiseException(store, ctx, {
            applicationId: c.applicationId, candidateId: c.candidateId,
            kind: 'check_delay', severity: 'warn', owner: 'human', blocksProgress: false,
            title: 'A background check has been open longer than five days',
            detail: slowest.name + ' has not returned. The wait is the county court, not the agency and not us.',
            nextAction: 'Nothing to do but see it. Chasing the agency does not move a county clerk.'
          });
          changed.push({ kind: 'check_delayed', applicationId: c.applicationId });
        }
      }
      if (c.searches.every((s) => s.returnedAt != null)) {
        const a = store.byId('applications', ctx.tenantId, c.applicationId);
        if (a && a.state === 'BACKGROUND_CHECK_IN_PROGRESS') {
          WF.transition(store, ctx, a.id, 'BACKGROUND_CHECK_COMPLETE',
            { source: 'connector', reason: 'Every search returned.' });
          changed.push({ kind: 'check_complete', applicationId: a.id });
        }
      }
    });
}

/* ------------------------------------------- onboarding, running itself --- */

function completeTasks(store, ctx, now, changed) {
  const byApp = {};
  store.all('onboardingTasks', ctx.tenantId).forEach((t) => {
    (byApp[t.applicationId] = byApp[t.applicationId] || []).push(t);
  });

  Object.keys(byApp).forEach((appId) => {
    const tasks = byApp[appId];
    const a = store.byId('applications', ctx.tenantId, appId);
    if (!a) return;
    let moved = false;

    /* The graph is walked until it stops changing, rather than one level per
       tick. Winding the clock forward ten days used to finish the tasks that
       had already started, unblock the next level, and then stop, because the
       newly started tasks were dated "now". So a chain of three dependencies
       needed three separate clock advances to resolve, which is not how ten
       days work. */
    for (let pass = 0; pass < 12; pass++) {
      let changedThisPass = false;

      tasks.forEach((t) => {
        if (t.status !== 'in_progress' || t.startedAt == null) return;
        if (t.startedAt + t.estMs > now) return;
        // A person's task does not complete itself. Badge and till access is
        // owned by a human, and pretending it finished on a timer would hide the
        // one step on the critical path with no vendor documentation anywhere.
        if (t.owner === 'human') return;
        t.status = 'done';
        t.doneAt = t.startedAt + t.estMs;
        moved = changedThisPass = true;
        runTaskConnector(store, ctx, a, t);
        EV.workflowEvent(store, ctx, {
          applicationId: a.id, candidateId: a.candidateId, at: t.doneAt,
          kind: 'work', step: t.step, owner: t.owner,
          actorType: t.actor === 'candidate' ? 'external' : 'system',
          actor: t.actor === 'candidate' ? 'Candidate' : 'Onboarding',
          durationMs: t.estMs, detail: t.name + ' completed.'
        });
      });

      tasks.forEach((t) => {
        if (t.status !== 'blocked') return;
        if (t.afterStart && a.startedAt == null) return;
        const deps = t.needs.map((k) => tasks.find((x) => x.key === k));
        const unmet = t.needs.filter((k, i) => !deps[i] || deps[i].status !== 'done');
        if (unmet.length) { t.blockedBy = unmet.join(', '); return; }
        /* It became startable when its last dependency finished, not when
           somebody happened to look at the screen. */
        const readyAt = deps.length
          ? Math.max.apply(null, deps.map((d) => d.doneAt || t.createdAt))
          : t.createdAt;
        t.status = 'in_progress';
        t.startedAt = Math.min(now, Math.max(readyAt, t.createdAt,
          t.afterStart && a.startedAt ? a.startedAt : 0));
        t.blockedBy = null;
        moved = changedThisPass = true;
      });

      if (!changedThisPass) break;
    }

    if (moved) {
      changed.push({ kind: 'onboarding_moved', applicationId: a.id });
      if (a.state === 'ONBOARDING_IN_PROGRESS') WF.settle(store, ctx, a.id);
    }
  });
}

function runTaskConnector(store, ctx, a, t) {
  const c = store.byId('candidates', ctx.tenantId, a.candidateId);
  const at = t.doneAt;
  if (t.key === 'payroll') {
    const prior = a.rehire && a.rehire.matched && a.rehire.rehireEligible ? a.rehire.record.employeeId : null;
    const res = prior
      ? CONN.call(store, ctx, 'hris', 'reactivate_employee', { priorEmployeeId: prior, candidateId: c.id, applicationId: a.id }, { at })
      : CONN.call(store, ctx, 'hris', 'create_employee', { candidateId: c.id, applicationId: a.id, employeeId: 'E' + c.id.slice(-6) }, { at });
    t.externalRef = res.externalRef;
  } else if (t.key === 'systems') {
    const res = CONN.call(store, ctx, 'identity', 'provision',
      { candidateId: c.id, applicationId: a.id, account: (c.firstName[0] + c.lastName).toLowerCase() }, { at });
    t.externalRef = res.externalRef;
  } else if (t.key === 'training') {
    const res = CONN.call(store, ctx, 'learning', 'assign',
      { candidateId: c.id, applicationId: a.id, courses: ['food-safety', 'harassment', 'pos-basics'] }, { at });
    t.externalRef = res.externalRef;
  } else if (t.key === 'everify') {
    const res = CONN.call(store, ctx, 'everify', 'create_case',
      { applicationId: a.id, candidateId: c.id, caseStatus: (a.everify && a.everify.seedStatus) || 'EMPLOYMENT_AUTHORIZED' }, { at });
    t.externalRef = res.externalRef;
    a.everify = Object.assign({ caseRef: res.externalRef, createdAt: at,
      status: res.data.caseStatus }, a.everify || {});
  }
}

/* ----------------------------------------------- offers, and the silence -- */

function expireOffers(store, ctx, now, changed) {
  store.all('offers', ctx.tenantId)
    .filter((o) => o.status === 'sent' && o.expiresAt && o.expiresAt <= now)
    .forEach((o) => {
      o.status = 'expired';
      EV.raiseException(store, ctx, {
        applicationId: o.applicationId, candidateId: o.candidateId,
        kind: 'offer_quiet', severity: 'crit', owner: 'human', blocksProgress: true,
        title: 'An offer expired without an answer',
        detail: 'Sent ' + new Date(o.sentAt).toISOString() + ', open for three days, no reply.',
        nextAction: 'Extend it, or move to the next candidate. Neither is automatic.'
      });
      changed.push({ kind: 'offer_expired', applicationId: o.applicationId });
    });
}

function chaseQuiet(store, ctx, now, changed) {
  store.all('offers', ctx.tenantId)
    .filter((o) => o.status === 'sent' && o.sentAt && now - o.sentAt > 24 * HOUR && !o.chasedAt)
    .forEach((o) => {
      const c = store.byId('candidates', ctx.tenantId, o.candidateId);
      o.chasedAt = now;
      /* The agent chases. It answers questions about pay, hours and the first
         shift, and it reports back what the hesitation was. It does not decide
         anything and it does not withdraw the offer. */
      CONN.call(store, ctx, 'messaging', 'sms',
        { to: c.phone, templateId: 'offer-chase-v1', applicationId: o.applicationId, candidateId: c.id });
      EV.communication(store, ctx, {
        channel: 'sms', to: c.phone, candidateId: c.id, applicationId: o.applicationId,
        templateId: 'offer-chase-v1', status: 'delivered',
        body: 'Hi ' + c.firstName + ', your offer is still open. Any questions about pay, hours or the first shift, just reply here.',
        provider: 'development SMS adapter, nothing left this machine'
      });
      EV.workflowEvent(store, ctx, {
        applicationId: o.applicationId, candidateId: c.id, kind: 'work',
        state: 'OFFER_SENT', step: 8, owner: 'agent', actorType: 'agent', actor: 'Follow-up agent',
        durationMs: 40000, detail: 'Chased an unanswered offer after 24 hours.'
      });
      changed.push({ kind: 'offer_chased', applicationId: o.applicationId });
    });
}

/* --------------------------------------------------- E-Verify, polled ----- */

function pollEverify(store, ctx, now, changed) {
  store.all('applications', ctx.tenantId)
    .filter((a) => a.everify && a.everify.decision === 'contesting' && !a.everify.closedAt)
    .forEach((a) => {
      if (a.everify.lastPolledAt && now - a.everify.lastPolledAt < 4 * HOUR) return;
      a.everify.lastPolledAt = now;
      /* E-Verify publishes no notification and instructs employers to check
         periodically, so this is polled rather than pushed. Anything waiting for
         a webhook here waits forever. */
      CONN.call(store, ctx, 'everify', 'poll_case',
        { externalRef: a.everify.caseRef, applicationId: a.id, caseStatus: a.everify.status });
      changed.push({ kind: 'everify_polled', applicationId: a.id });
    });
}

/* --------------------------------------------- thirty, sixty, ninety ------ */

function advanceTenure(store, ctx, now, changed) {
  const sysCtx = Object.assign({}, ctx, { actor: { type: 'system', name: 'Check-in agent' } });
  store.all('applications', ctx.tenantId)
    .filter((a) => ['STARTED', 'DAY_30', 'DAY_60'].indexOf(a.state) >= 0)
    .forEach((a) => {
      const next = { STARTED: 'DAY_30', DAY_30: 'DAY_60', DAY_60: 'DAY_90' }[a.state];
      const t = S.findTransition(a.state, next);
      if (!t || (t.guard && !WF.GUARDS[t.guard](store, sysCtx, a))) return;
      WF.transition(store, sysCtx, a.id, next, { source: 'workflow', reason: 'Tenure milestone reached.' });
      changed.push({ kind: 'tenure', applicationId: a.id, state: next });
    });
}

module.exports = { tick };
