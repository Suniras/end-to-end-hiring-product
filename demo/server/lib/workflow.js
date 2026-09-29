/* ============================================================================
   workflow.js  ·  the engine

   One function moves an application: transition(). Everything else is a guard
   it consults or an effect it runs. There is no other way to change an
   application's state, which is what makes the two rules below enforceable
   rather than aspirational.

   Rule one. The actor type is checked against the transition table on every
   move. APPROVED and REJECTED are by:['human'], so an agent, a rule, a batch
   action or the assistant asking nicely all get the same refusal. The
   assistant reaches this function through exactly the same door as a button.

   Rule two. A refused move returns a reason and writes an audit entry. It never
   silently does nothing. A silent refusal teaches nobody anything and cannot be
   audited afterwards.

   settle() runs the moves marked auto in the transition table until nothing
   more can move by itself. That is where the parallelism lives: after an offer
   is accepted, everything with no unmet dependency starts at the same moment
   instead of each team waiting for the one before it.
   ============================================================================ */

'use strict';

const S = require('./schema');
const EV = require('./events');
const CONN = require('./connectors');
const { evaluateEligibility, matchPriorEmployment } = require('./rules');
const { addBusinessDays, businessDaysBetween, MIN, HOUR, DAY } = require('./clock');

/* ------------------------------------------------------------- helpers --- */

function app(store, ctx, id) { return store.byId('applications', ctx.tenantId, id); }
function cand(store, ctx, id) { return store.byId('candidates', ctx.tenantId, id); }
function req(store, ctx, id) { return store.byId('requisitions', ctx.tenantId, id); }
function storeRow(store, ctx, id) { return store.byId('stores', ctx.tenantId, id); }

function tasksFor(store, ctx, appId) {
  return store.where('onboardingTasks', ctx.tenantId, (t) => t.applicationId === appId);
}
function screeningsFor(store, ctx, appId) {
  return store.where('screenings', ctx.tenantId, (s) => s.applicationId === appId);
}
function checkFor(store, ctx, appId) {
  return store.where('backgroundChecks', ctx.tenantId, (c) => c.applicationId === appId)[0] || null;
}
function offerFor(store, ctx, appId) {
  return store.where('offers', ctx.tenantId, (o) => o.applicationId === appId)[0] || null;
}

/* -------------------------------------------------------------- guards --- */

const GUARDS = {
  eligibilityPassed: (store, ctx, a) => !!(a.eligibility && a.eligibility.passed && !a.eligibility.holdForPerson),
  /* A hold is not a failure. It is an application that stopped and is waiting
     for a person, so the automatic move to INELIGIBLE must not fire on it. */
  eligibilityFailed: (store, ctx, a) => !!(a.eligibility && !a.eligibility.passed && !a.eligibility.holdForPerson),

  allRequiredScreeningsDone: (store, ctx, a) => {
    const list = screeningsFor(store, ctx, a.id).filter((s) => s.required);
    return list.length > 0 && list.every((s) => s.status === 'complete');
  },

  allSearchesReturned: (store, ctx, a) => {
    const c = checkFor(store, ctx, a.id);
    return !!c && c.searches.every((s) => s.returnedAt != null);
  },

  preShiftTasksDone: (store, ctx, a) => {
    const list = tasksFor(store, ctx, a.id).filter((t) => S.PRE_SHIFT_TASKS.indexOf(t.key) >= 0);
    return list.length > 0 && list.every((t) => t.status === 'done');
  },

  thirtyDaysElapsed: (store, ctx, a) => a.startedAt != null && ctx.clock.now() - a.startedAt >= 30 * DAY,
  sixtyDaysElapsed:  (store, ctx, a) => a.startedAt != null && ctx.clock.now() - a.startedAt >= 60 * DAY,
  ninetyDaysElapsed: (store, ctx, a) => a.startedAt != null && ctx.clock.now() - a.startedAt >= 90 * DAY
};

/* ------------------------------------------------------------- effects --- */

const EFFECTS = {

  recordEligibility(store, ctx, a) {
    if (a.eligibility) return;
    a.eligibility = runEligibility(store, ctx, a);
    store.markDirty();
  },

  /* One agent screening always. A manager interview as well where the
     requisition asks for one, which is what fills steps 4 and 5 of the funnel
     for those roles and leaves them honestly marked not required for the rest. */
  createScreening(store, ctx, a) {
    if (screeningsFor(store, ctx, a.id).length) return;
    const r = req(store, ctx, a.requisitionId);
    makeScreening(store, ctx, a, 'agent_screen', true);
    if (r.requiresManagerInterview) makeScreening(store, ctx, a, 'manager_interview', true);
  },

  startScreening(store, ctx, a, opts) {
    const s = screeningsFor(store, ctx, a.id).find((x) => x.status === 'scheduled' || x.status === 'pending');
    if (!s) return;
    s.status = 'in_progress';
    s.startedAt = ctx.clock.now();
    store.markDirty();
  },

  completeScreening(store, ctx, a) { /* set by screening.js when the evaluation lands */ },

  /* Clearing a rehire hold. Whichever way it goes, the reason is required and
     the exception is closed against the person who closed it. */
  resolveHold(store, ctx, a, opts) {
    const open = store.where('exceptions', ctx.tenantId,
      (e) => e.applicationId === a.id && e.kind === 'rehire_flag' && !e.resolvedAt);
    open.forEach((e) => {
      e.resolvedAt = ctx.clock.now();
      e.resolution = (opts.to === 'ELIGIBLE' ? 'Overridden. ' : 'Upheld. ') + (opts.reason || 'No reason given.');
      e.resolvedBy = ctx.actor.name;
    });
    a.rehireReview = {
      outcome: opts.to === 'ELIGIBLE' ? 'overridden' : 'upheld',
      by: ctx.actor.name, at: ctx.clock.now(), reason: opts.reason || null
    };
    store.markDirty();
  },

  recordDecision(store, ctx, a, opts) {
    const d = {
      id: store.nextId('dec'),
      tenantId: ctx.tenantId,
      applicationId: a.id,
      candidateId: a.candidateId,
      at: ctx.clock.now(),
      outcome: opts.to === 'APPROVED' ? 'approved' : 'rejected',
      decidedBy: ctx.actor.name,
      decidedByRole: ctx.actor.role || null,
      actorType: 'human',
      reason: opts.reason || null,
      // What the agent had recommended, kept next to what the person decided,
      // so an override is visible rather than inferable.
      agentRecommendation: latestEvaluation(store, ctx, a.id),
      overrodeAgent: null,
      source: opts.source || 'ui'
    };
    if (d.agentRecommendation) {
      d.overrodeAgent = (d.agentRecommendation.recommendation === 'advance' && d.outcome === 'rejected') ||
                        (d.agentRecommendation.recommendation !== 'advance' && d.outcome === 'approved');
    }
    store.insert('decisions', d);
    a.decisionId = d.id;
    store.markDirty();
  },

  createOffer(store, ctx, a) {
    if (offerFor(store, ctx, a.id)) return;
    const r = req(store, ctx, a.requisitionId);
    const c = cand(store, ctx, a.candidateId);
    const o = {
      id: store.nextId('off'),
      tenantId: ctx.tenantId,
      applicationId: a.id,
      candidateId: a.candidateId,
      createdAt: ctx.clock.now(),
      status: 'draft',
      conditional: true,
      rateCents: r.rateCents,
      hoursPerWeek: r.hoursPerWeek,
      title: r.title,
      storeId: a.storeId,
      proposedStartAt: null,
      sentAt: null, respondedAt: null, expiresAt: null,
      templateId: 'offer-hourly-conditional-v3',
      // The offer is conditional on the check, and the order matters: California
      // Gov. Code 12952(a)(2) reaches the conduct of the check itself, so the
      // conditional offer comes first and the check follows it.
      conditions: ['Background check', 'Right to work verified on Form I-9'],
      to: c.email
    };
    store.insert('offers', o);
    a.offerId = o.id;
    store.markDirty();
  },

  sendOffer(store, ctx, a, opts) {
    const o = offerFor(store, ctx, a.id);
    const c = cand(store, ctx, a.candidateId);
    const now = ctx.clock.now();
    o.status = 'sent';
    o.sentAt = now;
    o.expiresAt = now + 3 * DAY;
    o.proposedStartAt = opts.proposedStartAt || nextMonday(now + 5 * DAY);

    const res = CONN.call(store, ctx, 'messaging', 'email', {
      to: c.email, templateId: o.templateId, subject: 'Your offer from ' + ctx.tenantName,
      applicationId: a.id, candidateId: c.id
    });
    EV.communication(store, ctx, {
      channel: 'email', to: c.email, candidateId: c.id, applicationId: a.id,
      templateId: o.templateId, subject: 'Your offer from ' + ctx.tenantName,
      body: offerBody(ctx, o, c), status: res.ok ? 'delivered' : 'failed',
      providerRef: res.externalRef, provider: 'development mail adapter, nothing left this machine',
      error: res.error || null
    });
    CONN.call(store, ctx, 'messaging', 'sms', {
      to: c.phone, templateId: 'offer-sms-v1', applicationId: a.id, candidateId: c.id
    });
    EV.communication(store, ctx, {
      channel: 'sms', to: c.phone, candidateId: c.id, applicationId: a.id,
      templateId: 'offer-sms-v1', body: 'Your offer from ' + ctx.tenantName + ' is ready. Open the link to accept.',
      status: 'delivered', provider: 'development SMS adapter, nothing left this machine'
    });
    store.markDirty();
  },

  acceptOffer(store, ctx, a, opts) {
    const o = offerFor(store, ctx, a.id);
    o.status = 'accepted';
    o.respondedAt = ctx.clock.now();
    a.acceptedAt = o.respondedAt;
    // Acceptance is where the candidate signs the FCRA disclosure and the
    // separate authorisation. The disclosure has to be a document that consists
    // solely of the disclosure, so it is two documents and not one page.
    a.fcra = { disclosureSignedAt: o.respondedAt, authorisationSignedAt: o.respondedAt,
               standaloneDisclosure: true,
               rule: 'FCRA 15 U.S.C. 1681b(b)(2)(A). The disclosure must be in a document that consists solely of the disclosure.' };
    store.markDirty();
  },

  declineOffer(store, ctx, a, opts) {
    const o = offerFor(store, ctx, a.id);
    o.status = 'declined';
    o.respondedAt = ctx.clock.now();
    o.declineReason = opts.reason || null;
    store.markDirty();
  },

  /* The parallelisation. Everything below has no dependency on anything else
     below, so all of it starts now. The sequential cost is recorded next to the
     actual cost so the claim can be checked rather than asserted. */
  fanOutParallelWork(store, ctx, a) {
    if (tasksFor(store, ctx, a.id).length) return;
    const now = ctx.clock.now();
    const rehire = a.rehire && a.rehire.matched ? a.rehire : null;
    const reuse = {};
    if (rehire) (rehire.reusable || []).forEach((r) => { reuse[r.key] = r; });

    S.ONBOARDING_TASKS.forEach((def) => {
      const skip = reuse[def.key];
      const carried = skip && (skip.reuse === 'carry-forward' || skip.reuse === 'reactivate');
      store.insert('onboardingTasks', {
        id: store.nextId('tsk'),
        tenantId: ctx.tenantId,
        applicationId: a.id,
        candidateId: a.candidateId,
        key: def.key,
        name: def.name,
        step: def.step,
        owner: def.owner,
        actor: def.actor,
        needs: def.needs,
        afterStart: !!def.afterStart,
        law: def.law || null,
        note: def.note || null,
        estMs: def.estMs,
        createdAt: now,
        // A task with no unmet dependency starts the moment the fan-out runs.
        startedAt: def.needs.length === 0 && !def.afterStart ? now : null,
        status: carried ? 'done' : (def.needs.length === 0 && !def.afterStart ? 'in_progress' : 'blocked'),
        doneAt: carried ? now : null,
        blockedBy: def.afterStart ? 'first day of work for pay' : (def.needs.length ? def.needs.join(', ') : null),
        reusedFrom: carried ? skip.why : null,
        externalRef: null
      });
    });

    a.parallel = {
      fannedOutAt: now,
      startedTogether: S.ONBOARDING_TASKS.filter((t) => t.needs.length === 0 && !t.afterStart).length,
      totalTasks: S.ONBOARDING_TASKS.length,
      // Two honest numbers. The sum is what it would cost if every task waited
      // for the one before it. The critical path is the longest chain of tasks
      // that genuinely depend on each other. The gap between them is the claim.
      sequentialMs: S.ONBOARDING_TASKS.reduce((n, t) => n + t.estMs, 0),
      criticalPathMs: criticalPath(S.ONBOARDING_TASKS)
    };
    store.markDirty();
  },

  orderBackgroundCheck(store, ctx, a, opts) {
    if (checkFor(store, ctx, a.id)) return;
    const c = cand(store, ctx, a.candidateId);
    const now = ctx.clock.now();
    const counties = c.counties || [{ name: 'Unknown', state: '--' }];
    const searches = [
      { key: 'ssn_trace', name: 'SSN trace and address history', orderedAt: now,
        expectedMs: 4 * HOUR, returnedAt: null, result: null, venue: 'National' },
      { key: 'natl_db', name: 'National criminal database scan', orderedAt: now,
        expectedMs: 6 * HOUR, returnedAt: null, result: null, venue: 'National',
        note: 'A scan, not a search. There is no national criminal database available to employers, so anything it surfaces has to be confirmed at the county.' },
      { key: 'sex_offender', name: 'Sex offender registry', orderedAt: now,
        expectedMs: 3 * HOUR, returnedAt: null, result: null, venue: 'National' }
    ].concat(counties.map((co, i) => ({
      key: 'county_' + i,
      name: 'County criminal, ' + co.name + ', ' + co.state,
      orderedAt: now,
      // The wait is the county court, and courts differ. Deterministic per
      // county so the same demo produces the same numbers every time.
      expectedMs: CONN.spread(co.name + co.state, 18, 132) * HOUR,
      returnedAt: null, result: null, venue: co.name + ', ' + co.state
    })));

    const res = CONN.call(store, ctx, 'background_check', 'order',
      { applicationId: a.id, candidateId: c.id, searches: searches.map((s) => s.key), at: now });

    const chk = {
      id: store.nextId('bgc'),
      tenantId: ctx.tenantId,
      applicationId: a.id,
      candidateId: a.candidateId,
      orderedAt: now,
      orderedBy: ctx.actor.name,
      externalRef: res.externalRef,
      provider: 'screening agency, simulated',
      mode: 'simulated',
      status: 'in_progress',
      searches,
      closedAt: null,
      outcome: null,
      adverseProcess: null,
      lastPolledAt: now,
      disclosure: a.fcra || null
    };
    store.insert('backgroundChecks', chk);
    a.backgroundCheckId = chk.id;
    store.markDirty();
  },

  closeBackgroundCheck(store, ctx, a) {
    const c = checkFor(store, ctx, a.id);
    if (!c || c.closedAt) return;
    c.closedAt = ctx.clock.now();
    const adverse = c.searches.filter((s) => s.result === 'record_found');
    c.outcome = adverse.length ? 'adverse_possible' : 'clear';
    if (adverse.length) {
      /* FCRA requires a pre-adverse notice, a reasonable gap, then an adverse
         notice. It cannot be collapsed and it is never automated here: a person
         reviews anything adverse, individually. */
      c.adverseProcess = {
        stage: 'pre_adverse_pending',
        rule: 'FCRA 15 U.S.C. 1681b(b)(3). Pre-adverse notice with a copy of the report and the summary of rights, a reasonable gap, then the adverse notice.',
        owner: 'human',
        automated: false
      };
      EV.raiseException(store, ctx, {
        applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
        kind: 'adverse_review', severity: 'crit', owner: 'human', blocksProgress: true,
        title: 'A background check returned a record. A person must review it.',
        detail: adverse.map((s) => s.name).join('; '),
        nextAction: 'Review the report individually. Nothing adverse happens automatically and no notice goes out without a person sending it.'
      });
    }
    store.markDirty();
  },

  scheduleFirstShift(store, ctx, a, opts) {
    const now = ctx.clock.now();
    const startsAt = opts.startsAt || nextMonday(now + 3 * DAY);
    const noticeDays = Math.round((startsAt - now) / DAY);
    const res = CONN.call(store, ctx, 'scheduling', 'write_shift',
      { applicationId: a.id, candidateId: a.candidateId, startsAt, noticeDays });

    const sh = {
      id: store.nextId('shf'),
      tenantId: ctx.tenantId,
      applicationId: a.id,
      candidateId: a.candidateId,
      storeId: a.storeId,
      startsAt,
      endsAt: startsAt + 6 * HOUR,
      kind: 'first_shift',
      externalRef: res.externalRef,
      noticeDays,
      premiumPayable: !!(res.data && res.data.premiumPayable),
      fairWorkweek: 'Covered cities require roughly 14 days of advance schedule notice, with a premium payable to change inside that window. A first shift is not ours to place freely.',
      confirmState: 'sent',
      confirmedAt: null,
      attendedAt: null
    };
    store.insert('shifts', sh);
    a.firstShiftId = sh.id;

    const c = cand(store, ctx, a.candidateId);
    CONN.call(store, ctx, 'messaging', 'sms', { to: c.phone, templateId: 'first-shift-confirm-v2', applicationId: a.id, candidateId: c.id });
    EV.communication(store, ctx, {
      channel: 'sms', to: c.phone, candidateId: c.id, applicationId: a.id,
      templateId: 'first-shift-confirm-v2', status: 'delivered',
      body: 'Your first shift is ' + new Date(startsAt).toUTCString() + '. Reply YES to confirm.',
      provider: 'development SMS adapter, nothing left this machine'
    });
    store.markDirty();
  },

  recordStart(store, ctx, a, opts) {
    const now = opts.at || ctx.clock.now();
    a.startedAt = now;
    /* Steps 17 and 18 are a person on a shop floor. No state in the machine
       maps to them, which had left them permanently blank on every timeline
       even for somebody who started six weeks ago. The product tracks them, it
       does not do them, and a blank is a worse answer than saying so. */
    EV.workflowEvent(store, ctx, {
      applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
      at: now, kind: 'enter', step: 17, owner: 'human', actorType: 'human',
      actor: opts.actor || ctx.actor.name,
      detail: 'Week one on the floor begins. Trained by a person, tracked here.'
    });
    const sh = store.byId('shifts', ctx.tenantId, a.firstShiftId);
    if (sh) { sh.attendedAt = now; }
    // The two tasks that genuinely could not start earlier now can.
    tasksFor(store, ctx, a.id).forEach((t) => {
      if (t.afterStart && t.status === 'blocked') {
        const unmet = t.needs.filter((k) => {
          const dep = tasksFor(store, ctx, a.id).find((x) => x.key === k);
          return !dep || dep.status !== 'done';
        });
        if (!unmet.length) { t.status = 'in_progress'; t.startedAt = now; t.blockedBy = null; }
      }
    });
    store.markDirty();
  },

  checkIn(store, ctx, a, opts) {
    if (opts.to === 'DAY_30') {
      EV.workflowEvent(store, ctx, {
        applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
        kind: 'enter', step: 18, owner: 'human', actorType: 'human',
        actor: 'Store manager',
        detail: 'Ramp to working unsupervised. A person judges that somebody is ready. No signal we hold can make that call.'
      });
    }
    EV.workflowEvent(store, ctx, {
      applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
      kind: 'note', state: opts.to, actorType: 'agent', actor: 'Screening agent',
      detail: 'Structured check-in conversation completed.'
    });
  },

  recordTermination(store, ctx, a, opts) {
    a.terminatedAt = ctx.clock.now();
    a.terminationReason = opts.reason || null;
    a.terminatedBy = ctx.actor.name;
    store.markDirty();
  },

  recordWithdrawal(store, ctx, a, opts) {
    a.withdrawnAt = ctx.clock.now();
    a.withdrawReason = opts.reason || null;
    store.markDirty();
  }
};

/* ---------------------------------------------------------- transition --- */

/**
 * The only way an application changes state.
 *
 * Returns { ok, state, refused, reason }. A refusal is a normal return value
 * with a reason attached, never an exception and never a silent no-op.
 */
function transition(store, ctx, applicationId, toState, opts) {
  opts = opts || {};
  const a = app(store, ctx, applicationId);
  if (!a) return { ok: false, refused: 'not_found', reason: 'No such application in this customer\'s data.' };

  const from = a.state;
  /* Two transitions can share a from and a to and differ only in who may make
     the move: a rehire hold is cleared by a person, the same edge is otherwise
     taken automatically by the engine. Pick the one that matches this actor, so
     a person is not refused on the grounds that the system's copy exists. */
  const candidates = S.transitionsFrom(from).filter((x) => x.to === toState);
  const t = candidates.find((x) => x.by.indexOf(ctx.actor.type) >= 0) || candidates[0] || null;

  if (!t) {
    const allowed = S.transitionsFrom(from).map((x) => x.to);
    const reason = 'A candidate at ' + label(from) + ' cannot move to ' + label(toState) + '. ' +
                   (allowed.length ? 'From here the only moves are: ' + allowed.map(label).join(', ') + '.'
                                   : 'This is a final state.');
    EV.auditEvent(store, ctx, {
      action: 'transition.refused', actorType: ctx.actor.type, actor: ctx.actor.name,
      applicationId: a.id, candidateId: a.candidateId, outcome: 'refused',
      why: reason, detail: { from, to: toState }, source: opts.source || 'ui'
    });
    return { ok: false, refused: 'illegal_transition', reason, from, allowed };
  }

  const actorType = ctx.actor.type;
  if (t.by.indexOf(actorType) < 0) {
    /* This is the guard that matters. An agent asking to approve somebody gets
       the same answer as a rule asking, or the assistant asking on a manager's
       behalf without the manager. */
    const reason = t.by.indexOf('human') >= 0 && t.by.length === 1
      ? 'Only a named person can do this. ' + (t.reason || '') +
        ' The assistant can put the candidate in front of you and show you everything it found. It cannot make the call.'
      : 'A ' + actorType + ' actor cannot perform this move. It is reserved for: ' + t.by.join(', ') + '.';
    EV.auditEvent(store, ctx, {
      action: 'transition.refused', actorType, actor: ctx.actor.name,
      applicationId: a.id, candidateId: a.candidateId, outcome: 'refused',
      why: reason.trim(), detail: { from, to: toState, requiredActor: t.by }, source: opts.source || 'ui'
    });
    return { ok: false, refused: 'actor_not_permitted', reason: reason.trim(), requiredActor: t.by };
  }

  if (t.guard && !GUARDS[t.guard](store, ctx, a)) {
    const reason = guardReason(t.guard, store, ctx, a);
    EV.auditEvent(store, ctx, {
      action: 'transition.refused', actorType, actor: ctx.actor.name,
      applicationId: a.id, candidateId: a.candidateId, outcome: 'refused',
      why: reason, detail: { from, to: toState, guard: t.guard }, source: opts.source || 'ui'
    });
    return { ok: false, refused: 'guard_failed', reason, guard: t.guard };
  }

  // Adverse action bar. Not a clock, a prohibition, and it outranks the table.
  const barred = adverseActionBlock(store, ctx, a, toState);
  if (barred) {
    EV.auditEvent(store, ctx, {
      action: 'transition.refused', actorType, actor: ctx.actor.name,
      applicationId: a.id, candidateId: a.candidateId, outcome: 'refused',
      why: barred, detail: { from, to: toState }, source: opts.source || 'ui'
    });
    return { ok: false, refused: 'unlawful', reason: barred };
  }

  const started = ctx.clock.now();
  if (t.effect) EFFECTS[t.effect](store, ctx, a, Object.assign({ to: toState, from }, opts));

  a.state = toState;
  a.stateSince = started;
  a.updatedAt = started;
  if (S.isTerminal(toState)) a.closedAt = started;
  store.markDirty();

  const ownerChanged = S.ownerOf(from) !== S.ownerOf(toState);
  EV.workflowEvent(store, ctx, {
    applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
    requisitionId: a.requisitionId,
    at: started, kind: 'enter', state: toState, fromState: from,
    actorType, actor: ctx.actor.name, handoff: ownerChanged,
    durationMs: opts.workMs != null ? opts.workMs : null,
    detail: opts.detail || null
  });
  EV.auditEvent(store, ctx, {
    action: 'transition', actorType, actor: ctx.actor.name,
    applicationId: a.id, candidateId: a.candidateId,
    why: opts.reason || t.reason || null,
    detail: { from, to: toState }, source: opts.source || 'ui'
  });

  const chain = settle(store, ctx, a.id);
  return { ok: true, from, state: a.state, auto: chain, application: a };
}

/** Runs every move marked auto until nothing else can move by itself. */
function settle(store, ctx, applicationId, depth) {
  depth = depth || 0;
  if (depth > 24) return [];
  const a = app(store, ctx, applicationId);
  if (!a || S.isTerminal(a.state)) return [];

  /* An open exception that blocks progress stops the automatic moves and only
     the automatic moves. A person can still act: that is the whole point of
     putting it in front of them. */
  if (hasBlockingException(store, ctx, a.id)) return [];

  const next = S.transitionsFrom(a.state).find((t) => {
    if (!t.auto) return false;
    if (t.guard && !GUARDS[t.guard](store, ctx, a)) return false;
    return true;
  });
  if (!next) return [];

  const sysCtx = Object.assign({}, ctx, { actor: { type: 'system', name: 'Workflow engine' } });
  if (next.effect) EFFECTS[next.effect](store, sysCtx, a, { to: next.to, from: a.state });

  const from = a.state;
  a.state = next.to;
  a.stateSince = ctx.clock.now();
  a.updatedAt = a.stateSince;
  if (S.isTerminal(next.to)) a.closedAt = a.stateSince;
  store.markDirty();

  EV.workflowEvent(store, sysCtx, {
    applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
    requisitionId: a.requisitionId, kind: 'enter', state: next.to, fromState: from,
    actorType: 'system', actor: 'Workflow engine',
    handoff: S.ownerOf(from) !== S.ownerOf(next.to)
  });

  return [next.to].concat(settle(store, ctx, applicationId, depth + 1));
}

function hasBlockingException(store, ctx, applicationId) {
  return store.where('exceptions', ctx.tenantId,
    (e) => e.applicationId === applicationId && e.blocksProgress && !e.resolvedAt).length > 0;
}

/* --------------------------------------------------- the adverse action bar -

   While an E-Verify mismatch is being contested, nothing adverse is lawful
   until the case reaches a Final Nonconfirmation. Termination, suspension,
   withholding or lowering pay, delaying training and removing scheduled shifts
   are all adverse. This is checked before any state change and before the
   scheduling adapter is allowed to remove anything.
   ------------------------------------------------------------------------- */

/* Termination and rejection are adverse whoever performs them. A withdrawal is
   adverse only when the EMPLOYER records it, because a candidate choosing to
   walk away is their own decision, and a manager marking somebody withdrawn is
   the obvious back door out of this rule. */
const ADVERSE_STATES = ['REJECTED', 'TERMINATED'];
const ADVERSE_IF_EMPLOYER = ['WITHDRAWN'];

function adverseActionBlock(store, ctx, a, toState) {
  if (!a.everify || a.everify.decision !== 'contesting') return null;
  const adverse = ADVERSE_STATES.indexOf(toState) >= 0 ||
    (ADVERSE_IF_EMPLOYER.indexOf(toState) >= 0 && ctx.actor.type === 'human');
  if (!adverse) return null;
  const c = cand(store, ctx, a.candidateId);
  const left = businessDaysBetween(ctx.clock.now(), addBusinessDays(a.everify.referredAt, 8));
  return 'Nothing adverse is lawful here yet. ' + c.firstName +
    ' is contesting an E-Verify mismatch, and until the case reaches a Final Nonconfirmation, termination, suspension, ' +
    'withheld or lowered pay, delayed training and removed shifts are all barred. ' +
    left + ' working days remain for the case to resolve.';
}

/** Called by the scheduling action. Same rule, different surface. */
function blockShiftRemoval(store, ctx, applicationId) {
  const a = app(store, ctx, applicationId);
  if (!a || !a.everify || a.everify.decision !== 'contesting') return null;
  const c = cand(store, ctx, a.candidateId);
  const left = businessDaysBetween(ctx.clock.now(), addBusinessDays(a.everify.referredAt, 8));
  return 'Removing a scheduled shift is an adverse action. ' + c.firstName +
    ' is contesting an E-Verify mismatch, so nothing adverse is lawful until the case reaches a Final Nonconfirmation. ' +
    'She has ' + left + ' working days left to resolve it.';
}

/* ------------------------------------------------------------ eligibility - */

function runEligibility(store, ctx, a) {
  const c = cand(store, ctx, a.candidateId);
  const r = req(store, ctx, a.requisitionId);
  const st = storeRow(store, ctx, a.storeId);
  const rehire = matchPriorEmployment(store, ctx.tenantId, c, ctx.clock.now());
  a.rehire = rehire;

  const started = ctx.clock.now();
  const out = evaluateEligibility({
    now: started, candidate: c, application: a, requisition: r, store: st,
    rehire, tenantName: ctx.tenantName
  });

  EV.workflowEvent(store, ctx, {
    applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
    kind: 'work', state: 'ELIGIBILITY_REVIEW', step: 2, owner: 'system',
    actorType: 'system', actor: 'Rules engine',
    durationMs: 900 + CONN.spread(a.id, 100, 1800),
    detail: out.passed ? 'All hard rules passed.' : 'Failed: ' + out.failedKeys.join(', ')
  });
  EV.auditEvent(store, ctx, {
    action: 'eligibility.evaluated', actorType: 'system', actor: 'Rules engine',
    applicationId: a.id, candidateId: a.candidateId,
    why: 'Deterministic rules, version ' + out.version + '. No model involved.',
    detail: { passed: out.passed, failedKeys: out.failedKeys, holdForPerson: out.holdForPerson },
    source: 'workflow'
  });

  if (out.holdForPerson) {
    EV.raiseException(store, ctx, {
      applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
      kind: 'rehire_flag', severity: 'crit', owner: 'human', blocksProgress: true,
      title: 'Matched a prior employment record marked not eligible for rehire',
      detail: out.holdReason,
      nextAction: 'A person reviews the record and either upholds it or overrides it with a reason. The application does not move either way until they do.'
    });
  }
  return out;
}

/* --------------------------------------------------------------- helpers - */

function makeScreening(store, ctx, a, kind, required) {
  const r = req(store, ctx, a.requisitionId);
  const s = {
    id: store.nextId('scr'),
    tenantId: ctx.tenantId,
    applicationId: a.id,
    candidateId: a.candidateId,
    kind,
    required: !!required,
    status: 'pending',
    channel: kind === 'agent_screen' ? 'voice' : 'in_person',
    owner: kind === 'agent_screen' ? 'agent' : 'human',
    step: kind === 'agent_screen' ? 3 : 5,
    questions: (kind === 'agent_screen' ? r.screeningQuestions : r.interviewQuestions) || [],
    responses: [],
    transcript: [],
    scheduledAt: null, startedAt: null, completedAt: null,
    durationMs: null,
    evaluationId: null
  };
  store.insert('screenings', s);
  return s;
}

function latestEvaluation(store, ctx, appId) {
  const s = screeningsFor(store, ctx, appId)
    .filter((x) => x.evaluation)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))[0];
  if (!s) return null;
  return {
    screeningId: s.id,
    recommendation: s.evaluation.recommendation,
    confidence: s.evaluation.confidence,
    mode: s.evaluationMeta ? s.evaluationMeta.mode : null,
    model: s.evaluationMeta ? s.evaluationMeta.model : null
  };
}

/** Longest chain of tasks that genuinely depend on each other. */
function criticalPath(defs) {
  const byKey = {};
  defs.forEach((d) => { byKey[d.key] = d; });
  const memo = {};
  function cost(k, seen) {
    if (memo[k] != null) return memo[k];
    const d = byKey[k];
    if (!d) return 0;
    if (seen.indexOf(k) >= 0) return 0;
    const deps = d.needs.map((n) => cost(n, seen.concat([k])));
    const v = d.estMs + (deps.length ? Math.max.apply(null, deps) : 0);
    memo[k] = v;
    return v;
  }
  return Math.max.apply(null, defs.filter((d) => !d.afterStart).map((d) => cost(d.key, [])));
}

function nextMonday(from) {
  const d = new Date(from);
  d.setUTCHours(9, 0, 0, 0);
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1);
  return d.getTime();
}

function label(state) {
  return (S.STATES[state] && S.STATES[state].label) || state;
}

function guardReason(guard, store, ctx, a) {
  switch (guard) {
    case 'allRequiredScreeningsDone': {
      const pending = screeningsFor(store, ctx, a.id).filter((s) => s.required && s.status !== 'complete');
      return 'Screening is not finished. Still outstanding: ' +
             pending.map((s) => s.kind === 'agent_screen' ? 'the screening conversation' : 'the manager interview').join(' and ') + '.';
    }
    case 'allSearchesReturned': {
      const c = checkFor(store, ctx, a.id);
      const open = c ? c.searches.filter((s) => !s.returnedAt) : [];
      return 'The background check has not come back. ' + open.length + ' of ' +
             (c ? c.searches.length : 0) + ' searches are still open, the slowest being ' +
             (open.length ? open[0].name : 'none') + '. The wait is the county court, not us.';
    }
    case 'preShiftTasksDone': {
      const open = tasksFor(store, ctx, a.id)
        .filter((t) => S.PRE_SHIFT_TASKS.indexOf(t.key) >= 0 && t.status !== 'done');
      return 'Onboarding is not finished. Still open: ' + open.map((t) => t.name).join(', ') + '.';
    }
    case 'eligibilityPassed':
      return 'Eligibility has not passed. ' + (a.eligibility ? a.eligibility.holdReason || ('Failed on ' + a.eligibility.failedKeys.join(', ')) : 'It has not been run yet.');
    case 'thirtyDaysElapsed': case 'sixtyDaysElapsed': case 'ninetyDaysElapsed':
      return 'The calendar has not got there yet. This is a date, not a queue.';
    default:
      return 'A precondition for this move is not met: ' + guard + '.';
  }
}

function offerBody(ctx, o, c) {
  return [
    'Hi ' + c.firstName + ',',
    '',
    'We would like to offer you the ' + o.title + ' role at ' + ctx.tenantName + '.',
    'Rate: $' + (o.rateCents / 100).toFixed(2) + ' an hour. Around ' + o.hoursPerWeek + ' hours a week.',
    '',
    'This offer is conditional on a background check and on your right to work being verified on Form I-9.',
    'Open the link to accept. The offer is open for three days.'
  ].join('\n');
}

module.exports = {
  transition, settle, GUARDS, EFFECTS, runEligibility, hasBlockingException, guardReason,
  blockShiftRemoval, adverseActionBlock, criticalPath, nextMonday,
  tasksFor, screeningsFor, checkFor, offerFor, label
};
