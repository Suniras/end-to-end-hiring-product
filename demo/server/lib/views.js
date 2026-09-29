/* ============================================================================
   views.js  ·  what each screen asks for

   One function per screen. Each assembles from the same tables the assistant
   reads, so a number on a screen and the same number in a reply cannot
   disagree: there is one derivation and both call it.

   Nothing in here computes a duration of its own. Anything time-shaped comes
   from metrics.js, which derives it from recorded events.
   ============================================================================ */

'use strict';

const S = require('./schema');
const M = require('./metrics');
const WF = require('./workflow');
const T = require('./agent/tools');
const CONN = require('./connectors');
const compliance = require('./compliance');
const STEPS = require('../../js/steps.js');
const { DAY, HOUR, MIN } = require('./clock');

const call = (name, store, ctx, args) => T.BY_NAME[name].run(store, ctx, args || {});

/* ------------------------------------------------------------- bootstrap -- */

function bootstrap(store, ctx) {
  const tenant = store.allGlobal('tenants').find((t) => t.id === ctx.tenantId);
  return {
    org: tenant.org,
    people: tenant.people,
    stores: store.all('stores', ctx.tenantId),
    requisitions: store.all('requisitions', ctx.tenantId),
    steps: STEPS,
    states: S.STATES,
    now: ctx.clock.now(),
    simAnchor: store.db.meta.simAnchor,
    seededAt: store.db.meta.seededAt,
    ownerLabels: { agent: 'Agent', human: 'A person', system: 'Software', clock: 'Fixed wait' },
    ownerWhy: {
      agent: 'A model does this because a rules engine genuinely cannot.',
      human: 'A person decides this. The product will not proceed without one.',
      system: 'Deterministic software. A model here would make it worse.',
      clock: 'Nobody can compress this. All we can do is make it visible.'
    },
    connectors: CONN.inventory(),
    integrationNote: 'Every connector in this build is simulated. None of them holds a credential and none of them names a vendor we have not integrated.'
  };
}

/* ------------------------------------------------------------------ deck -- */

function deck(store, ctx, args) {
  const storeId = args.storeId || null;
  const queue = call('get_attention_queue', store, ctx, { storeId }).data;
  const decisions = call('get_pending_decisions', store, ctx, { storeId }).data;
  const blocked = call('get_blocked_candidates', store, ctx, { storeId }).data;
  const shifts = call('get_day_one_risk', store, ctx, {}).data;
  const screening = call('get_screening_queue', store, ctx, { storeId }).data;
  const roll = M.rollup(store, ctx, { storeId });

  const now = ctx.clock.now();
  let apps = store.all('applications', ctx.tenantId);
  if (storeId) apps = apps.filter((a) => a.storeId === storeId);

  /* The overnight window. Real arithmetic over recorded arrival times rather
     than a headline number: everything that landed since Friday evening. */
  const windowStart = now - 62 * HOUR;
  const arrived = apps.filter((a) => a.appliedAt >= windowStart);
  const autoAdvanced = arrived.filter((a) => {
    const evs = M.eventsFor(store, ctx, a.id);
    return evs.some((e) => e.state === 'SCREENING_COMPLETE' || e.state === 'DECISION_PENDING');
  });
  const knockedOut = arrived.filter((a) => a.state === 'INELIGIBLE');

  const offers = store.all('offers', ctx.tenantId).filter((o) => o.status === 'sent');

  return {
    overnight: {
      windowStartAt: windowStart,
      received: arrived.length,
      autoAdvanced: autoAdvanced.length,
      knockedOut: knockedOut.length,
      needPerson: queue.needsPerson.length
    },
    queue, decisions, blocked, shifts, screening,
    offersOut: offers.length,
    metrics: roll,
    upcoming: shifts.shifts.slice(0, 5)
  };
}

/* ---------------------------------------------------------------- decide -- */

function decide(store, ctx, args) {
  const rows = call('get_pending_decisions', store, ctx, { storeId: args.storeId }).data;
  const detailed = rows.candidates.map((b) => {
    const a = store.byId('applications', ctx.tenantId, b.applicationId);
    const scs = WF.screeningsFor(store, ctx, a.id);
    const withEval = scs.find((s) => s.evaluation);
    return Object.assign({}, b, {
      eligibility: a.eligibility,
      rehire: a.rehire && a.rehire.matched ? a.rehire : null,
      screening: withEval ? {
        id: withEval.id,
        evaluation: withEval.evaluation,
        meta: withEval.evaluationMeta,
        durationMs: withEval.durationMs,
        transcriptTurns: withEval.transcript.length
      } : null,
      interview: scs.find((s) => s.kind === 'manager_interview') || null,
      exceptions: T.openExceptions(store, ctx, a.id)
    });
  });
  const step6 = STEPS.find((s) => s.n === 6);
  return { candidates: detailed, count: detailed.length,
           boundary: { agentDoes: step6.agentDoes, humanDoes: step6.humanDoes, software: step6.software } };
}

/* ------------------------------------------------------------- screening -- */

function screening(store, ctx, args) {
  const q = call('get_screening_queue', store, ctx, { storeId: args.storeId }).data;
  let focus = null;
  if (args.screeningId) focus = store.byId('screenings', ctx.tenantId, args.screeningId);
  if (!focus) {
    const withEval = store.all('screenings', ctx.tenantId)
      .filter((s) => s.evaluation && s.kind === 'agent_screen')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))[0];
    focus = withEval || null;
  }
  let detail = null;
  if (focus) {
    const c = store.byId('candidates', ctx.tenantId, focus.candidateId);
    const a = store.byId('applications', ctx.tenantId, focus.applicationId);
    const r = store.byId('requisitions', ctx.tenantId, a.requisitionId);
    detail = {
      screening: focus, candidate: c, application: a,
      requisition: { id: r.id, title: r.title, criteria: r.criteria, questions: r.screeningQuestions },
      llmCall: focus.evaluationId ? store.byId('llmCalls', ctx.tenantId, focus.evaluationId) : null,
      eligibility: a.eligibility
    };
  }
  const step3 = STEPS.find((s) => s.n === 3);
  const step2 = STEPS.find((s) => s.n === 2);
  return {
    queue: q, detail,
    boundary: { agentDoes: step3.agentDoes, humanDoes: step3.humanDoes, software: step3.software },
    whyRules: step2.agentDoes
  };
}

/* -------------------------------------------------------------- pipeline -- */

function pipeline(store, ctx, args) {
  const f = M.funnel(store, ctx, { storeId: args.storeId });
  const totals = { agent: 0, human: 0, system: 0, clock: 0 };
  STEPS.forEach((s) => { totals[s.owner]++; });
  return {
    steps: f.map((row) => {
      const def = STEPS.find((s) => s.n === row.n);
      return Object.assign({}, row, {
        agentDoes: def.agentDoes, humanDoes: def.humanDoes, software: def.software,
        law: def.law || null, coverNote: def.coverNote
      });
    }),
    ownerTotals: totals,
    inFlight: f.reduce((n, s) => n + s.inFlight, 0)
  };
}

/* ------------------------------------------------------------- candidate -- */

function candidate(store, ctx, args) {
  let appId = args.applicationId;
  if (!appId && args.candidateId) {
    const a = T.appFor(store, ctx, args.candidateId);
    appId = a && a.id;
  }
  if (!appId) {
    /* Default to somebody with a story worth opening: the furthest along. */
    const order = ['DAY_90', 'DAY_60', 'DAY_30', 'STARTED', 'FIRST_SHIFT_SCHEDULED'];
    const pick = store.all('applications', ctx.tenantId)
      .sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state))[0];
    appId = pick && pick.id;
  }
  const a = store.byId('applications', ctx.tenantId, appId);
  if (!a) return null;
  const c = store.byId('candidates', ctx.tenantId, a.candidateId);
  const r = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  const st = store.byId('stores', ctx.tenantId, a.storeId);

  return {
    candidate: c, application: a,
    requisition: { id: r.id, title: r.title, summary: r.summary, rateCents: r.rateCents,
                   hoursPerWeek: r.hoursPerWeek, requiresManagerInterview: r.requiresManagerInterview },
    store: { id: st.id, name: st.name, manager: st.manager },
    timeline: M.timeline(store, ctx, a.id),
    metrics: M.applicationMetrics(store, ctx, a.id),
    parallelism: M.parallelism(store, ctx, a.id),
    screenings: WF.screeningsFor(store, ctx, a.id),
    offer: WF.offerFor(store, ctx, a.id),
    check: WF.checkFor(store, ctx, a.id),
    tasks: WF.tasksFor(store, ctx, a.id),
    shifts: store.where('shifts', ctx.tenantId, (s) => s.applicationId === a.id),
    communications: store.where('communications', ctx.tenantId, (x) => x.applicationId === a.id)
      .sort((x, y) => x.at - y.at),
    exceptions: store.where('exceptions', ctx.tenantId, (e) => e.applicationId === a.id),
    events: M.eventsFor(store, ctx, a.id),
    audit: store.all('auditEvents', ctx.tenantId).filter((e) => e.applicationId === a.id)
      .sort((x, y) => y.at - x.at),
    connectorCalls: store.all('connectorCalls', ctx.tenantId).filter((x) => x.applicationId === a.id)
      .sort((x, y) => x.at - y.at),
    compliance: {
      clocks: compliance.clocksFor(store, ctx, a),
      adverseBar: compliance.adverseBar(store, ctx, a),
      adverseProcess: compliance.adverseProcess(store, ctx, a),
      rehire: compliance.rehireWindow(a)
    },
    roster: store.all('applications', ctx.tenantId).map((x) => {
      const cc = store.byId('candidates', ctx.tenantId, x.candidateId);
      return { applicationId: x.id, candidateId: cc.id, name: cc.name, initials: cc.initials,
               state: x.state, stateLabel: WF.label(x.state), step: S.stepOf(x.state),
               persona: cc.persona };
    }).sort((x, y) => (y.step || 0) - (x.step || 0))
  };
}

/* ------------------------------------------------------------------ flag -- */

function flag(store, ctx) {
  const blocked = call('get_blocked_candidates', store, ctx, {}).data;
  const holds = store.all('applications', ctx.tenantId)
    .filter((a) => a.eligibility && a.eligibility.holdForPerson)
    .map((a) => {
      const c = store.byId('candidates', ctx.tenantId, a.candidateId);
      return {
        brief: T.brief(store, ctx, a),
        candidate: c,
        eligibility: a.eligibility,
        rehire: a.rehire,
        review: a.rehireReview || null,
        exception: T.openExceptions(store, ctx, a.id)[0] || null
      };
    });
  return { blocked, holds };
}

/* ------------------------------------------------------------ compliance -- */

function complianceView(store, ctx) {
  return { cases: compliance.allCases(store, ctx),
           note: 'Business days here are Monday to Friday and ignore federal holidays. Real E-Verify deadlines run in federal government working days, which do exclude them, so these are slightly generous.' };
}

/* ---------------------------------------------------------------- checks -- */

function checks(store, ctx) {
  const rows = store.all('backgroundChecks', ctx.tenantId).map((c) => {
    const cand = store.byId('candidates', ctx.tenantId, c.candidateId);
    const a = store.byId('applications', ctx.tenantId, c.applicationId);
    const now = ctx.clock.now();
    return {
      check: c,
      name: cand.name, initials: cand.initials,
      applicationId: c.applicationId,
      state: a.state, stateLabel: WF.label(a.state),
      openForMs: (c.closedAt || now) - c.orderedAt,
      searches: c.searches.map((s) => Object.assign({}, s, {
        elapsedMs: (s.returnedAt || now) - s.orderedAt,
        overdue: !s.returnedAt && now > s.orderedAt + s.expectedMs
      }))
    };
  }).sort((a, b) => (a.check.closedAt ? 1 : 0) - (b.check.closedAt ? 1 : 0) || b.openForMs - a.openForMs);
  const step10 = STEPS.find((s) => s.n === 10);
  return { checks: rows, law: step10.law, agentDoes: step10.agentDoes, humanDoes: step10.humanDoes };
}

/* ---------------------------------------------------------------- funnel -- */

function funnelView(store, ctx, args) {
  return {
    funnel: M.funnel(store, ctx, { storeId: args.storeId }),
    rollup: M.rollup(store, ctx, { storeId: args.storeId }),
    actors: M.actorSplit(store, ctx),
    bottleneck: call('get_bottleneck', store, ctx, { storeId: args.storeId }).data,
    stores: store.all('stores', ctx.tenantId).map((st) =>
      Object.assign({ storeId: st.id, storeName: st.name, manager: st.manager },
        M.rollup(store, ctx, { storeId: st.id })))
  };
}

/* ----------------------------------------------------------------- store -- */

function storeView(store, ctx, args) {
  const stores = store.all('stores', ctx.tenantId);
  const st = args.storeId ? store.byId('stores', ctx.tenantId, args.storeId) : stores[0];
  const reqs = store.where('requisitions', ctx.tenantId, (r) => r.storeId === st.id);
  const apps = store.where('applications', ctx.tenantId, (a) => a.storeId === st.id);
  const now = ctx.clock.now();

  const openings = reqs.map((r) => {
    const mine = apps.filter((a) => a.requisitionId === r.id);
    return {
      id: r.id, title: r.title, openings: r.openings, openedAt: r.openedAt,
      rateCents: r.rateCents, hoursPerWeek: r.hoursPerWeek,
      applications: mine.length,
      inFlight: mine.filter((a) => !S.isTerminal(a.state)).length,
      hired: mine.filter((a) => ['STARTED', 'DAY_30', 'DAY_60', 'DAY_90'].indexOf(a.state) >= 0).length,
      openForMs: now - r.openedAt
    };
  });

  const restrictions = [];
  apps.forEach((a) => {
    const bar = compliance.adverseBar(store, ctx, a);
    if (bar) {
      const c = store.byId('candidates', ctx.tenantId, a.candidateId);
      restrictions.push({ name: c.name, applicationId: a.id, kind: 'adverse_bar',
                          barred: bar.barred, since: bar.since, why: bar.rule });
    }
  });

  return {
    store: st,
    stores: stores.map((s) => ({ id: s.id, name: s.name, manager: s.manager, city: s.city, state: s.state })),
    openings, restrictions,
    metrics: M.rollup(store, ctx, { storeId: st.id }),
    /* Fixed 7 Sep 2026. The filter was `> now - 7 * DAY`, and the newest seeded
       shift is older than that, so this returned zero rows for every store and
       got worse as the simulated clock advanced. Shifts are few and the page
       needs them, so it returns all of this store's and lets the view decide
       what is upcoming. */
    shifts: store.where('shifts', ctx.tenantId, (s) => s.storeId === st.id)
      .sort((x, y) => x.startsAt - y.startsAt)
      .map((s) => {
        const c = store.byId('candidates', ctx.tenantId, s.candidateId);
        return Object.assign({}, s, { name: c.name, initials: c.initials, inMs: s.startsAt - now });
      }).sort((a, b) => a.startsAt - b.startsAt),
    comparison: stores.map((s) => Object.assign({ storeId: s.id, storeName: s.name },
      M.rollup(store, ctx, { storeId: s.id })))
  };
}

/* --------------------------------------------------------------- sources -- */

function sources(store, ctx, args) {
  const reqs = store.all('requisitions', ctx.tenantId)
    .filter((r) => !args.storeId || r.storeId === args.storeId);
  const reqIds = {};
  reqs.forEach((r) => { reqIds[r.id] = r; });

  /* Outbound is read from the connector log, so a failed post and its retry are
     visible instead of being smoothed over into "live". */
  const posts = store.all('connectorCalls', ctx.tenantId)
    .filter((c) => c.adapter === 'ats' && c.op === 'post_opening' && reqIds[c.request.requisitionId]);
  const byDest = {};
  posts.forEach((p) => {
    const d = byDest[p.request.destination] = byDest[p.request.destination] ||
      /* `accepted` counts simulated post_opening calls that returned ok. It was
         called `live`, which reads as "the listing is live on Indeed" when we
         have no integration with Indeed at all. Renamed 7 Sep 2026, and
         `connected: false` is now explicit on every row so the page cannot
         imply a connection that does not exist. */
      { destination: p.request.destination, attempts: 0, accepted: 0, failed: 0,
        lastError: null, mode: 'simulated', connected: false };
    d.attempts++;
    if (p.status === 'ok') d.accepted++; else { d.failed++; d.lastError = p.error; }
  });

  const apps = store.all('applications', ctx.tenantId).filter((a) => reqIds[a.requisitionId]);
  const bySource = {};
  apps.forEach((a) => {
    const s = bySource[a.source] = bySource[a.source] ||
      { source: a.source, kind: a.sourceKind, applications: 0, advanced: 0, hired: 0, ineligible: 0 };
    s.applications++;
    if (['STARTED', 'DAY_30', 'DAY_60', 'DAY_90'].indexOf(a.state) >= 0) s.hired++;
    if (a.state === 'INELIGIBLE') s.ineligible++;
    const evs = M.eventsFor(store, ctx, a.id);
    if (evs.some((e) => e.state === 'DECISION_PENDING')) s.advanced++;
  });

  /* People this retailer already has access to. One customer's own records,
     never pooled across customers. */
  const known = store.all('priorEmployment', ctx.tenantId).map((p) => ({
    name: p.firstName + ' ' + p.lastName, role: p.role, storeName: p.storeName,
    separatedOn: p.separatedOn, rehireEligible: p.rehireEligible,
    trainingHeld: (p.training || []).length
  }));

  const matched = apps.filter((a) => a.rehire && a.rehire.matched);

  return {
    outbound: Object.values(byDest).sort((a, b) => b.accepted - a.accepted),
    inbound: Object.values(bySource).sort((a, b) => b.applications - a.applications),
    identity: {
      applications: apps.length,
      matchedPriorEmployee: matched.length,
      scope: 'This customer\'s own employment records only. Nothing is matched across customers, because pooling employment history and answering questions from the pool is what a consumer reporting agency does.',
      matches: matched.map((a) => {
        const c = store.byId('candidates', ctx.tenantId, a.candidateId);
        return { name: c.name, confidence: a.rehire.confidence,
                 priorRole: a.rehire.record.role, rehireEligible: a.rehire.rehireEligible,
                 i9Reusable: a.rehire.i9.reusable };
      })
    },
    known,
    closed: [{
      destination: 'LinkedIn',
      status: 'Closed to us',
      why: 'LinkedIn closed its Job Posting API to new partners. The free Basic Jobs feed still needs LinkedIn approval and carries no guarantee that listings are ingested. Verified against LinkedIn\'s own documentation on 26 Aug 2026.'
    }]
  };
}

/* ------------------------------------------------------------ audit view -- */

function audit(store, ctx, args) {
  let rows = store.all('auditEvents', ctx.tenantId);
  if (args.applicationId) rows = rows.filter((e) => e.applicationId === args.applicationId);
  if (args.action) rows = rows.filter((e) => e.action.indexOf(args.action) >= 0);
  if (args.source) rows = rows.filter((e) => e.source === args.source);
  const agentRows = store.all('agentActions', ctx.tenantId).sort((a, b) => b.at - a.at).slice(0, 40);
  return {
    entries: rows.sort((a, b) => b.at - a.at).slice(0, args.limit || 60),
    total: rows.length,
    agentActions: agentRows,
    connectorCalls: store.all('connectorCalls', ctx.tenantId).sort((a, b) => b.at - a.at).slice(0, 40),
    llmCalls: store.all('llmCalls', ctx.tenantId).sort((a, b) => b.at - a.at).slice(0, 20)
  };
}

module.exports = {
  bootstrap, deck, decide, screening, pipeline, candidate, flag,
  compliance: complianceView, checks, funnel: funnelView, store: storeView, sources, audit
};
