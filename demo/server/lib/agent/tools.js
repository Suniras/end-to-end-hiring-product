/* ============================================================================
   agent/tools.js  ·  what the assistant can actually do

   Every tool runs against the real database and returns what the backend
   actually did. There is no path through this file that lets the assistant
   report an action it did not perform: the reply the user reads is rendered
   from the tool result, so if the workflow engine refused, the reply says
   refused and gives the engine's reason.

   Three confirmation levels, and the difference between the last two matters.

     none            reading. Answer and stop.
     confirm         changes something, or sends something outside the building.
                     The assistant says what it is about to do, to whom, and
                     waits.
     human_decision  a hiring decision. Same wait, but the confirmation IS the
                     human act, and it is recorded as such: the named person
                     approved, via the assistant, at this time. The workflow
                     engine still enforces by:['human'] underneath, so an
                     unconfirmed call is refused by the engine as well as here.

   The assistant cannot reject in bulk and there is no tool for it. That is not
   an oversight. A bulk rejection is the one action where a wrong classification
   is unrecoverable, and there is no queue of people it would save enough time
   to be worth it.
   ============================================================================ */

'use strict';

const WF = require('./../workflow');
const SC = require('./../screening');
const M = require('./../metrics');
const EV = require('./../events');
const S = require('./../schema');
const { DAY, HOUR, MIN } = require('./../clock');

/* ------------------------------------------------------------- resolving --- */

/* Punctuation becomes a space rather than nothing. Stripping it turned
   "Brennan-Ross" into one token "brennanross", which then failed to match
   "Brennan" and made a genuinely ambiguous surname look unique. A near miss
   that resolves to the wrong person is the worst failure this product has,
   because it looks like a success. */
function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Finds one candidate by name.
 *
 * Returns exactly one, or nobody with the reason. A near-miss resolving to the
 * wrong person is the worst failure this product has, because it looks like a
 * success. Two people matching is refused rather than guessed.
 */
function resolveCandidate(store, ctx, name) {
  if (!name) return { ok: false, error: 'No name given.' };
  const q = norm(name);
  const all = store.all('candidates', ctx.tenantId);

  const exact = all.filter((c) => norm(c.name) === q);
  if (exact.length === 1) return { ok: true, candidate: exact[0], how: 'exact' };
  if (exact.length > 1) return { ok: false, error: 'More than one person is called ' + name + '.', ambiguous: exact };

  const parts = q.split(' ').filter(Boolean);
  const contains = all.filter((c) => {
    const n = norm(c.name);
    return parts.every((p) => n.split(' ').some((w) => w === p));
  });
  if (contains.length === 1) return { ok: true, candidate: contains[0], how: 'partial' };
  if (contains.length > 1) {
    return { ok: false, error: 'More than one person matches "' + name + '": ' +
             contains.map((c) => c.name).join(', ') + '. Which one?', ambiguous: contains };
  }
  return { ok: false, error: 'Nobody called ' + name + ' is in this store group\'s data.' };
}

function appFor(store, ctx, candidateId) {
  return store.where('applications', ctx.tenantId, (a) => a.candidateId === candidateId)
    .sort((a, b) => b.appliedAt - a.appliedAt)[0] || null;
}

/** The compact shape every list of people uses, so replies are consistent. */
function brief(store, ctx, a) {
  const c = store.byId('candidates', ctx.tenantId, a.candidateId);
  const r = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  const st = store.byId('stores', ctx.tenantId, a.storeId);
  const now = ctx.clock.now();
  const sc = WF.screeningsFor(store, ctx, a.id).find((x) => x.evaluation);
  return {
    candidateId: c.id, applicationId: a.id, name: c.name, initials: c.initials,
    role: r.title, store: st.name, storeId: st.id,
    state: a.state, stateLabel: WF.label(a.state), step: S.stepOf(a.state),
    owner: S.ownerOf(a.state), actability: S.actability(a.state),
    waitingOn: S.waitingOn(a.state),
    appliedAt: a.appliedAt, source: a.source,
    waitingMs: now - (a.stateSince || a.appliedAt),
    totalMs: now - a.appliedAt,
    recommendation: sc ? sc.evaluation.recommendation : null,
    confidence: sc ? sc.evaluation.confidence : null,
    evaluationMode: sc && sc.evaluationMeta ? sc.evaluationMeta.mode : null,
    rehire: !!(a.rehire && a.rehire.matched),
    assignedTo: a.assignedTo
  };
}

function openExceptions(store, ctx, applicationId) {
  return store.where('exceptions', ctx.tenantId,
    (e) => (!applicationId || e.applicationId === applicationId) && !e.resolvedAt);
}

/* =============================================================== the tools = */

const TOOLS = [

  /* ------------------------------------------------------------- reading --- */

  {
    name: 'search_candidates',
    kind: 'read', confirm: 'none',
    description: 'Find candidates by name, state, store, role, source, or how long they have been waiting. Use this for any "show me everyone who..." question.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full or partial name.' },
        state: { type: 'string', description: 'One workflow state, for example DECISION_PENDING.' },
        storeId: { type: 'string' },
        role: { type: 'string' },
        source: { type: 'string' },
        waitingLongerThanHours: { type: 'number', description: 'Only those who have been in their current state longer than this.' },
        blockedOnly: { type: 'boolean' },
        openOnly: { type: 'boolean', description: 'Exclude applications that have ended. Defaults to true.' },
        limit: { type: 'number' }
      }
    },
    run(store, ctx, args) {
      let apps = store.all('applications', ctx.tenantId);
      const now = ctx.clock.now();
      if (args.openOnly !== false) apps = apps.filter((a) => !S.isTerminal(a.state));
      if (args.state) apps = apps.filter((a) => a.state === String(args.state).toUpperCase());
      if (args.storeId) apps = apps.filter((a) => a.storeId === args.storeId);
      if (args.name) {
        const q = norm(args.name);
        apps = apps.filter((a) => {
          const c = store.byId('candidates', ctx.tenantId, a.candidateId);
          return norm(c.name).indexOf(q) >= 0;
        });
      }
      if (args.role) {
        apps = apps.filter((a) => {
          const r = store.byId('requisitions', ctx.tenantId, a.requisitionId);
          return norm(r.title).indexOf(norm(args.role)) >= 0;
        });
      }
      if (args.source) apps = apps.filter((a) => norm(a.source).indexOf(norm(args.source)) >= 0);
      if (args.waitingLongerThanHours != null) {
        apps = apps.filter((a) => now - (a.stateSince || a.appliedAt) > args.waitingLongerThanHours * HOUR);
      }
      if (args.blockedOnly) {
        const blocked = {};
        openExceptions(store, ctx).filter((e) => e.blocksProgress).forEach((e) => { blocked[e.applicationId] = true; });
        apps = apps.filter((a) => blocked[a.id]);
      }
      apps.sort((a, b) => (now - (a.stateSince || a.appliedAt)) < (now - (b.stateSince || b.appliedAt)) ? 1 : -1);
      const rows = apps.slice(0, args.limit || 25).map((a) => brief(store, ctx, a));
      return { ok: true, summary: rows.length + ' candidate' + (rows.length === 1 ? '' : 's') + ' match.',
               data: { count: apps.length, shown: rows.length, candidates: rows } };
    }
  },

  {
    name: 'get_candidate',
    kind: 'read', confirm: 'none',
    description: 'Everything on one candidate: application, eligibility result, screening evaluation, offer, background check, onboarding tasks and any block.',
    input_schema: { type: 'object', properties: { name: { type: 'string' }, candidateId: { type: 'string' } } },
    run(store, ctx, args) {
      const found = args.candidateId
        ? { ok: true, candidate: store.byId('candidates', ctx.tenantId, args.candidateId) }
        : resolveCandidate(store, ctx, args.name);
      if (!found.ok || !found.candidate) return { ok: false, error: found.error || 'Not found.', data: { ambiguous: found.ambiguous || null } };
      const c = found.candidate;
      const a = appFor(store, ctx, c.id);
      if (!a) return { ok: false, error: c.name + ' has no application on file.' };
      return {
        ok: true,
        summary: c.name + ' is at ' + WF.label(a.state) + '.',
        data: {
          candidate: c, application: a,
          brief: brief(store, ctx, a),
          eligibility: a.eligibility,
          rehire: a.rehire,
          screenings: WF.screeningsFor(store, ctx, a.id),
          offer: WF.offerFor(store, ctx, a.id),
          backgroundCheck: WF.checkFor(store, ctx, a.id),
          tasks: WF.tasksFor(store, ctx, a.id),
          exceptions: openExceptions(store, ctx, a.id),
          metrics: M.applicationMetrics(store, ctx, a.id)
        }
      };
    }
  },

  {
    name: 'get_candidate_timeline',
    kind: 'read', confirm: 'none',
    description: 'All twenty steps for one candidate, with who owns each, how long it took, how much of that was queue, and what is next.',
    input_schema: { type: 'object', properties: { name: { type: 'string' }, candidateId: { type: 'string' } } },
    run(store, ctx, args) {
      const found = args.candidateId
        ? { ok: true, candidate: store.byId('candidates', ctx.tenantId, args.candidateId) }
        : resolveCandidate(store, ctx, args.name);
      if (!found.ok || !found.candidate) return { ok: false, error: found.error || 'Not found.' };
      const a = appFor(store, ctx, found.candidate.id);
      const tl = M.timeline(store, ctx, a.id);
      const done = tl.steps.filter((s) => s.status === 'done').length;
      return { ok: true, summary: found.candidate.name + ': ' + done + ' of 20 steps done, currently at step ' + tl.currentStep + '.',
               data: { name: found.candidate.name, timeline: tl,
                       metrics: M.applicationMetrics(store, ctx, a.id),
                       parallelism: M.parallelism(store, ctx, a.id) } };
    }
  },

  {
    name: 'get_pending_decisions',
    kind: 'read', confirm: 'none',
    description: 'Everyone waiting on a hiring decision from a person, longest wait first.',
    input_schema: { type: 'object', properties: { storeId: { type: 'string' } } },
    run(store, ctx, args) {
      let apps = store.where('applications', ctx.tenantId, (a) => a.state === 'DECISION_PENDING');
      if (args.storeId) apps = apps.filter((a) => a.storeId === args.storeId);
      const now = ctx.clock.now();
      apps.sort((a, b) => (a.stateSince || 0) - (b.stateSince || 0));
      const rows = apps.map((a) => brief(store, ctx, a));
      const longest = rows.length ? Math.round((now - apps[0].stateSince) / HOUR) : 0;
      return { ok: true,
               summary: rows.length + ' waiting on you' + (rows.length ? ', the longest for ' + longest + ' hours' : '') + '.',
               data: { count: rows.length, longestWaitHours: longest, candidates: rows } };
    }
  },

  {
    name: 'get_blocked_candidates',
    kind: 'read', confirm: 'none',
    description: 'Everything that has stopped and why, including whether the block is ours to clear or somebody else\'s.',
    input_schema: { type: 'object', properties: { storeId: { type: 'string' } } },
    run(store, ctx, args) {
      let excs = openExceptions(store, ctx);
      if (args.storeId) excs = excs.filter((e) => e.storeId === args.storeId);
      const rows = excs.map((e) => {
        const a = e.applicationId ? store.byId('applications', ctx.tenantId, e.applicationId) : null;
        return {
          exceptionId: e.id, kind: e.kind, severity: e.severity, title: e.title,
          detail: e.detail, nextAction: e.nextAction, owner: e.owner,
          blocksProgress: e.blocksProgress, since: e.at,
          openForMs: ctx.clock.now() - e.at,
          candidate: a ? brief(store, ctx, a) : null
        };
      }).sort((a, b) => (b.blocksProgress - a.blocksProgress) || (a.since - b.since));
      const hard = rows.filter((r) => r.blocksProgress).length;
      return { ok: true,
               summary: rows.length + ' open, ' + hard + ' of them actually stopping progress.',
               data: { count: rows.length, blocking: hard, items: rows } };
    }
  },

  {
    name: 'get_attention_queue',
    kind: 'read', confirm: 'none',
    description: 'The one answer to "who needs me first". Groups everything outstanding by whether a person has to act, the product can act, or we are waiting on somebody outside.',
    input_schema: { type: 'object', properties: { storeId: { type: 'string' } } },
    run(store, ctx, args) {
      let apps = store.all('applications', ctx.tenantId).filter((a) => !S.isTerminal(a.state));
      if (args.storeId) apps = apps.filter((a) => a.storeId === args.storeId);
      const now = ctx.clock.now();
      const blocked = {};
      openExceptions(store, ctx).filter((e) => e.blocksProgress).forEach((e) => { blocked[e.applicationId] = e; });

      const groups = { person: [], external: [], product: [] };
      apps.forEach((a) => {
        const b = brief(store, ctx, a);
        b.blockedBy = blocked[a.id] ? blocked[a.id].title : null;
        groups[blocked[a.id] ? 'person' : S.actability(a.state)].push(b);
      });
      Object.keys(groups).forEach((k) => groups[k].sort((x, y) => y.waitingMs - x.waitingMs));

      const over48 = apps.filter((a) => now - (a.stateSince || a.appliedAt) > 48 * HOUR).length;
      const parts = [];
      if (groups.person.length) parts.push(groups.person.length + ' waiting on a person');
      if (over48) parts.push(over48 + ' of everything open has been waiting more than 48 hours');
      if (groups.external.length) parts.push(groups.external.length + ' waiting on somebody outside');
      return {
        ok: true,
        summary: parts.length ? parts.join(', ') + '.' : 'Nothing outstanding.',
        data: {
          needsPerson: groups.person, waitingExternal: groups.external, productMoving: groups.product,
          over48h: over48, total: apps.length
        }
      };
    }
  },

  {
    name: 'get_pipeline',
    kind: 'read', confirm: 'none',
    description: 'Live counts for all twenty steps, with who owns each step and how many people are sitting in it right now.',
    input_schema: { type: 'object', properties: { storeId: { type: 'string' } } },
    run(store, ctx, args) {
      const f = M.funnel(store, ctx, { storeId: args.storeId });
      const live = f.reduce((n, s) => n + s.inFlight, 0);
      return { ok: true, summary: live + ' candidates in progress across twenty steps.',
               data: { inFlight: live, steps: f } };
    }
  },

  {
    name: 'get_store_metrics',
    kind: 'read', confirm: 'none',
    description: 'Measured timings for one store or for every store: application to offer, offer to acceptance, acceptance to first shift, queue against work, handoffs, people involved. Every number is computed from recorded events.',
    input_schema: { type: 'object', properties: { storeId: { type: 'string' }, compareStores: { type: 'boolean' } } },
    run(store, ctx, args) {
      if (args.compareStores) {
        const rows = store.all('stores', ctx.tenantId).map((st) =>
          Object.assign({ storeId: st.id, storeName: st.name, manager: st.manager },
            M.rollup(store, ctx, { storeId: st.id })));
        return { ok: true, summary: 'Comparison across ' + rows.length + ' stores.', data: { stores: rows } };
      }
      const r = M.rollup(store, ctx, { storeId: args.storeId });
      const st = args.storeId ? store.byId('stores', ctx.tenantId, args.storeId) : null;
      const toOffer = r.spans.applicationToOffer.median;
      return {
        ok: true,
        summary: (st ? st.name : 'All stores') + ': ' + r.applications + ' applications, median application to offer ' +
                 (toOffer != null ? (toOffer / HOUR).toFixed(1) + ' hours' : 'not measurable yet') + '.',
        data: Object.assign({ storeName: st ? st.name : 'All stores' }, r)
      };
    }
  },

  {
    name: 'get_bottleneck',
    kind: 'read', confirm: 'none',
    description: 'What is actually slowing a store down, ranked by total time lost, separating what we can act on from what we cannot.',
    input_schema: { type: 'object', properties: { storeId: { type: 'string' } } },
    run(store, ctx, args) {
      let apps = store.all('applications', ctx.tenantId);
      if (args.storeId) apps = apps.filter((a) => a.storeId === args.storeId);
      const totals = {};
      apps.forEach((a) => {
        M.timeline(store, ctx, a.id).steps.forEach((s) => {
          if (s.queueMs == null) return;
          const t = totals[s.n] = totals[s.n] || { n: s.n, name: s.name, owner: s.owner,
            actability: s.actability, queueMs: 0, count: 0 };
          t.queueMs += s.queueMs; t.count++;
        });
      });
      const rows = Object.values(totals).sort((a, b) => b.queueMs - a.queueMs).slice(0, 6)
        .map((t) => Object.assign({}, t, { avgQueueMs: t.queueMs / t.count }));
      const top = rows[0];
      return {
        ok: true,
        summary: top
          ? 'Most time is lost at step ' + top.n + ', ' + top.name + '. ' +
            (top.actability === 'external'
              ? 'That is an external wait, so it is visible rather than fixable.'
              : top.actability === 'person'
                ? 'That one is a queue in front of a person, which is the kind we can remove.'
                : 'The product owns that step.')
          : 'Not enough recorded history to say.',
        data: { steps: rows }
      };
    }
  },

  {
    name: 'get_screening_queue',
    kind: 'read', confirm: 'none',
    description: 'Who has been screened and what the evaluation said, and who is still waiting for a screening.',
    input_schema: { type: 'object', properties: { completedOnly: { type: 'boolean' }, storeId: { type: 'string' } } },
    run(store, ctx, args) {
      let apps = store.all('applications', ctx.tenantId);
      if (args.storeId) apps = apps.filter((a) => a.storeId === args.storeId);
      const done = [], waiting = [];
      apps.forEach((a) => {
        const scs = WF.screeningsFor(store, ctx, a.id);
        if (!scs.length) return;
        const withEval = scs.find((s) => s.evaluation);
        const b = brief(store, ctx, a);
        if (withEval) {
          done.push(Object.assign(b, {
            screeningId: withEval.id,
            recommendation: withEval.evaluation.recommendation,
            confidence: withEval.evaluation.confidence,
            summaryText: withEval.evaluation.summary,
            concerns: withEval.evaluation.concerns.length,
            mode: withEval.evaluationMeta.mode,
            model: withEval.evaluationMeta.model,
            isModel: !!withEval.evaluationMeta.isModel
          }));
        } else if (scs.some((s) => s.status === 'pending' || s.status === 'scheduled')) {
          waiting.push(b);
        }
      });
      return { ok: true,
               summary: done.length + ' screened, ' + waiting.length + ' still waiting for a screening.',
               data: { completed: done, waiting: args.completedOnly ? [] : waiting } };
    }
  },

  {
    name: 'get_compliance',
    kind: 'read', confirm: 'none',
    description: 'Live compliance clocks and any restriction in force: I-9 deadlines, E-Verify case state, the adverse action bar, and the FCRA pre-adverse process.',
    input_schema: { type: 'object', properties: {} },
    run(store, ctx) {
      const compliance = require('./../compliance');
      const rows = compliance.allCases(store, ctx);
      const urgent = rows.filter((r) => r.clocks.some((c) => c.left != null && c.left <= 2));
      return { ok: true,
               summary: rows.length + ' case' + (rows.length === 1 ? '' : 's') + ' with a live clock' +
                        (urgent.length ? ', ' + urgent.length + ' inside two working days' : '') + '.',
               data: { cases: rows } };
    }
  },

  {
    name: 'get_slow_checks',
    kind: 'read', confirm: 'none',
    description: 'Background checks still open, broken down by search and county, showing which specific court is holding it up.',
    input_schema: { type: 'object', properties: {} },
    run(store, ctx) {
      const now = ctx.clock.now();
      const rows = store.all('backgroundChecks', ctx.tenantId)
        .filter((c) => c.status === 'in_progress' || !c.closedAt)
        .map((c) => {
          const cand = store.byId('candidates', ctx.tenantId, c.candidateId);
          const open = c.searches.filter((s) => !s.returnedAt);
          return {
            checkId: c.id, applicationId: c.applicationId, name: cand.name,
            externalRef: c.externalRef, mode: c.mode,
            orderedAt: c.orderedAt, openForMs: now - c.orderedAt,
            searches: c.searches.length, openSearches: open.length,
            slowest: open.length ? open.reduce((a, b) => (b.expectedMs > a.expectedMs ? b : a), open[0]).name : null,
            actability: 'external'
          };
        }).sort((a, b) => b.openForMs - a.openForMs);
      return { ok: true,
               summary: rows.length + ' check' + (rows.length === 1 ? '' : 's') + ' still open. The wait is the county court, not us.',
               data: { checks: rows } };
    }
  },

  {
    name: 'get_day_one_risk',
    kind: 'read', confirm: 'none',
    description: 'First shifts coming up and whether each new hire has actually confirmed, with the signal that tells us.',
    input_schema: { type: 'object', properties: {} },
    run(store, ctx) {
      const now = ctx.clock.now();
      const rows = store.all('shifts', ctx.tenantId)
        .filter((s) => s.kind === 'first_shift' && !s.attendedAt)
        .map((s) => {
          const c = store.byId('candidates', ctx.tenantId, s.candidateId);
          const st = store.byId('stores', ctx.tenantId, s.storeId);
          return {
            shiftId: s.id, applicationId: s.applicationId, name: c.name, store: st.name,
            startsAt: s.startsAt, inMs: s.startsAt - now,
            confirmState: s.confirmState, confirmedAt: s.confirmedAt,
            noticeDays: s.noticeDays, premiumPayable: s.premiumPayable,
            signal: s.confirmState === 'confirmed'
              ? 'Tapped their link and pressed confirm.'
              : 'Message delivered. Nobody has opened the link. A delivery receipt is not a person.'
          };
        }).sort((a, b) => a.startsAt - b.startsAt);
      const unconfirmed = rows.filter((r) => r.confirmState !== 'confirmed').length;
      return { ok: true,
               summary: rows.length + ' first shift' + (rows.length === 1 ? '' : 's') + ' coming up, ' +
                        unconfirmed + ' not confirmed by the person themselves.',
               data: { shifts: rows } };
    }
  },

  {
    name: 'get_audit',
    kind: 'read', confirm: 'none',
    description: 'The audit trail: who did what, when, and why. Filter by candidate or by action.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, action: { type: 'string' }, limit: { type: 'number' } }
    },
    run(store, ctx, args) {
      let rows = store.all('auditEvents', ctx.tenantId);
      if (args.name) {
        const found = resolveCandidate(store, ctx, args.name);
        if (!found.ok) return { ok: false, error: found.error };
        rows = rows.filter((e) => e.candidateId === found.candidate.id);
      }
      if (args.action) rows = rows.filter((e) => e.action.indexOf(args.action) >= 0);
      rows = rows.sort((a, b) => b.at - a.at).slice(0, args.limit || 30);
      return { ok: true, summary: rows.length + ' audit entries.', data: { entries: rows } };
    }
  },

  /* -------------------------------------------------------------- acting --- */

  {
    name: 'approve_candidate',
    kind: 'write', confirm: 'human_decision',
    description: 'Approve one candidate for hire. This is a hiring decision, so it requires an explicit confirmation from the person making it. The assistant cannot do this on its own.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, reason: { type: 'string' } },
      required: ['name']
    },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return f.error;
      const a = appFor(store, ctx, f.candidate.id);
      const sc = WF.screeningsFor(store, ctx, a.id).find((x) => x.evaluation);
      return 'Approving ' + f.candidate.name + ' is a hiring decision recorded against your name. ' +
             (sc ? 'The screening evaluation says ' + sc.evaluation.recommendation + '. ' : '') +
             'An offer is generated straight afterwards but is not sent until you confirm that separately.';
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error, data: { ambiguous: f.ambiguous || null } };
      const a = appFor(store, ctx, f.candidate.id);
      const t = WF.transition(store, ctx, a.id, 'APPROVED', {
        reason: args.reason || 'Approved via the assistant, confirmed by ' + ctx.actor.name + '.',
        source: 'assistant', workMs: 30000
      });
      if (!t.ok) return { ok: false, error: t.reason, refused: t.refused, data: { brief: brief(store, ctx, a) } };
      return { ok: true, summary: f.candidate.name + ' approved. State is now ' + WF.label(t.state) + '.',
               data: { brief: brief(store, ctx, a), state: t.state, auto: t.auto,
                       decision: store.byId('decisions', ctx.tenantId, a.decisionId) } };
    }
  },

  {
    name: 'reject_candidate',
    kind: 'write', confirm: 'human_decision',
    description: 'Reject one candidate. A hiring decision, so it requires an explicit confirmation and a reason. The assistant cannot reject anybody on its own and there is no bulk version of this tool.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, reason: { type: 'string' } },
      required: ['name']
    },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return f.error;
      return 'Rejecting ' + f.candidate.name + ' ends their application. It is recorded against your name with the reason you give, and it is not reversible from here.';
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error, data: { ambiguous: f.ambiguous || null } };
      const a = appFor(store, ctx, f.candidate.id);
      const t = WF.transition(store, ctx, a.id, 'REJECTED', {
        reason: args.reason || 'Rejected via the assistant, confirmed by ' + ctx.actor.name + '.',
        source: 'assistant', workMs: 30000
      });
      if (!t.ok) return { ok: false, error: t.reason, refused: t.refused };
      return { ok: true, summary: f.candidate.name + ' rejected.',
               data: { brief: brief(store, ctx, a), decision: store.byId('decisions', ctx.tenantId, a.decisionId) } };
    }
  },

  {
    name: 'approve_batch',
    kind: 'write', confirm: 'human_decision',
    description: 'Approve several candidates at once, optionally only those whose screening recommendation is advance. Every name is listed before anything happens and anybody blocked is excluded and named. There is deliberately no bulk reject.',
    input_schema: {
      type: 'object',
      properties: {
        names: { type: 'array', items: { type: 'string' } },
        recommendationIs: { type: 'string', enum: ['advance'] },
        minConfidence: { type: 'number' },
        storeId: { type: 'string' }
      }
    },
    consequence(store, ctx, args) {
      const sel = selectBatch(store, ctx, args);
      if (!sel.eligible.length) return 'Nothing matches, so there is nothing to confirm.';
      return 'This approves ' + sel.eligible.length + ' people in one action, each recorded against your name: ' +
             sel.eligible.map((b) => b.name).join(', ') + '.' +
             (sel.excluded.length ? ' Excluded: ' + sel.excluded.map((e) => e.name + ' (' + e.why + ')').join('; ') + '.' : '');
    },
    run(store, ctx, args) {
      const sel = selectBatch(store, ctx, args);
      const done = [], failed = [];
      sel.eligible.forEach((b) => {
        const t = WF.transition(store, ctx, b.applicationId, 'APPROVED', {
          reason: 'Approved in a batch via the assistant, confirmed by ' + ctx.actor.name + '.',
          source: 'assistant', workMs: 15000
        });
        (t.ok ? done : failed).push({ name: b.name, error: t.ok ? null : t.reason });
      });
      return {
        ok: failed.length === 0,
        summary: done.length + ' approved' + (failed.length ? ', ' + failed.length + ' refused' : '') +
                 (sel.excluded.length ? ', ' + sel.excluded.length + ' excluded before it ran' : '') + '.',
        error: failed.length ? failed.map((f) => f.name + ': ' + f.error).join(' ') : null,
        data: { approved: done, failed, excluded: sel.excluded }
      };
    }
  },

  {
    name: 'send_offer',
    kind: 'write', confirm: 'confirm',
    description: 'Send the offer for an approved candidate. This sends an email and an SMS to a real person, so it is confirmed first.',
    input_schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return f.error;
      return 'This sends an email and an SMS to ' + f.candidate.name + ' at ' + f.candidate.email +
             '. It is an external communication and it cannot be unsent.';
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error };
      const a = appFor(store, ctx, f.candidate.id);
      const t = WF.transition(store, ctx, a.id, 'OFFER_SENT', { source: 'assistant', workMs: 20000 });
      if (!t.ok) return { ok: false, error: t.reason, refused: t.refused };
      const comms = store.where('communications', ctx.tenantId, (c) => c.applicationId === a.id)
        .sort((x, y) => y.at - x.at).slice(0, 2);
      return { ok: true, summary: 'Offer sent to ' + f.candidate.name + '.',
               data: { brief: brief(store, ctx, a), offer: WF.offerFor(store, ctx, a.id), communications: comms } };
    }
  },

  {
    name: 'initiate_background_check',
    kind: 'write', confirm: 'confirm',
    description: 'Order the background check for a candidate who has accepted a conditional offer. Places an order with the screening agency.',
    input_schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return f.error;
      return 'This places an order with the screening agency for ' + f.candidate.name +
             '. We order and track it. We never perform the check and we are not a consumer reporting agency.';
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error };
      const a = appFor(store, ctx, f.candidate.id);
      const t = WF.transition(store, ctx, a.id, 'BACKGROUND_CHECK_IN_PROGRESS', { source: 'assistant' });
      if (!t.ok) return { ok: false, error: t.reason, refused: t.refused };
      return { ok: true, summary: 'Check ordered for ' + f.candidate.name + '.',
               data: { check: WF.checkFor(store, ctx, a.id), brief: brief(store, ctx, a) } };
    }
  },

  {
    name: 'schedule_screening',
    kind: 'write', confirm: 'confirm',
    description: 'Run the screening conversation for one candidate, or for everybody who is eligible and waiting. This calls the configured model to evaluate each transcript.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, allEligible: { type: 'boolean' }, storeId: { type: 'string' } }
    },
    consequence(store, ctx, args) {
      if (args.allEligible) {
        const n = store.where('applications', ctx.tenantId, (a) => a.state === 'SCREENING_PENDING' &&
          (!args.storeId || a.storeId === args.storeId)).length;
        return 'This runs a screening conversation for ' + n + ' candidates and sends each transcript to the configured model for evaluation.';
      }
      const f = resolveCandidate(store, ctx, args.name);
      return f.ok ? 'This runs the screening conversation for ' + f.candidate.name + ' and evaluates the transcript.' : f.error;
    },
    async run(store, ctx, args) {
      let targets = [];
      if (args.allEligible) {
        targets = store.where('applications', ctx.tenantId, (a) => a.state === 'SCREENING_PENDING' &&
          (!args.storeId || a.storeId === args.storeId));
      } else {
        const f = resolveCandidate(store, ctx, args.name);
        if (!f.ok) return { ok: false, error: f.error };
        const a = appFor(store, ctx, f.candidate.id);
        if (!a) return { ok: false, error: 'No application on file.' };
        targets = [a];
      }
      if (!targets.length) return { ok: true, summary: 'Nobody is waiting for a screening.', data: { results: [] } };

      const results = [];
      for (const a of targets) {
        const c = store.byId('candidates', ctx.tenantId, a.candidateId);
        const out = await SC.runFullScreening(store, ctx, a.id, { source: 'assistant' });
        results.push({ name: c.name, applicationId: a.id, ok: out.ok,
                       error: out.error || null, state: out.state || a.state,
                       evaluations: (out.results || []).filter((r) => r.evaluation)
                         .map((r) => ({ recommendation: r.evaluation.recommendation,
                                        confidence: r.evaluation.confidence,
                                        mode: r.meta.mode, model: r.meta.model, isModel: !!r.meta.isModel })) });
      }
      const good = results.filter((r) => r.ok).length;
      return { ok: good > 0, summary: good + ' of ' + results.length + ' screened.',
               data: { results } };
    }
  },

  {
    name: 'update_candidate_stage',
    kind: 'write', confirm: 'confirm',
    description: 'Move a candidate to a specific workflow state. The workflow engine validates it, so an illegal move is refused with the reason and the moves that ARE legal from where they are.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, state: { type: 'string' }, reason: { type: 'string' } },
      required: ['name', 'state']
    },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return f.error;
      const a = appFor(store, ctx, f.candidate.id);
      /* Guard the target label. Fixed 7 Sep 2026: with no state in args this
         rendered "moves X from Onboarding running to UNDEFINED", and under the
         sidebar design that sentence is the entire confirmation a person is
         asked to approve. */
      const raw = args.state ? String(args.state).toUpperCase() : null;
      if (!raw) {
        return 'No target state was given, so there is nothing to confirm. ' +
               f.candidate.name + ' is at ' + WF.label(a.state) + '.';
      }
      /* label() falls back to returning the raw state when it does not know
         it, so an equal result means the state does not exist. */
      const target = WF.label(raw);
      if (target === raw) {
        return 'There is no workflow state called ' + raw + ', so there is nothing to confirm. ' +
               f.candidate.name + ' is at ' + WF.label(a.state) + '.';
      }
      return 'This moves ' + f.candidate.name + ' from ' + WF.label(a.state) + ' to ' + target + '.';
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error };
      const a = appFor(store, ctx, f.candidate.id);
      const t = WF.transition(store, ctx, a.id, String(args.state).toUpperCase(),
        { reason: args.reason || null, source: 'assistant' });
      if (!t.ok) return { ok: false, error: t.reason, refused: t.refused, data: { allowed: t.allowed || null } };
      return { ok: true, summary: f.candidate.name + ' is now at ' + WF.label(t.state) + '.',
               data: { brief: brief(store, ctx, a) } };
    }
  },

  {
    name: 'assign_candidate',
    kind: 'write', confirm: 'confirm',
    description: 'Assign a candidate to a named person so it is clear who is holding it.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, assignTo: { type: 'string' } },
      required: ['name']
    },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      return f.ok ? 'This assigns ' + f.candidate.name + ' to ' + (args.assignTo || ctx.actor.name) + '.' : f.error;
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error };
      const a = appFor(store, ctx, f.candidate.id);
      const to = args.assignTo || ctx.actor.name;
      const was = a.assignedTo;
      a.assignedTo = to;
      store.markDirty();
      EV.auditEvent(store, ctx, {
        action: 'application.assigned', actorType: ctx.actor.type, actor: ctx.actor.name,
        applicationId: a.id, candidateId: f.candidate.id, source: 'assistant',
        why: 'Reassigned from ' + was + ' to ' + to + '.'
      });
      return { ok: true, summary: f.candidate.name + ' is now assigned to ' + to + '.',
               data: { brief: brief(store, ctx, a), from: was, to } };
    }
  },

  {
    name: 'add_note',
    kind: 'write', confirm: 'none',
    description: 'Add a note to a candidate record. Notes change nothing and go straight onto the audit trail, so they do not need confirming.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, note: { type: 'string' } },
      required: ['name', 'note']
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error };
      const a = appFor(store, ctx, f.candidate.id);
      EV.workflowEvent(store, ctx, {
        applicationId: a.id, candidateId: f.candidate.id, storeId: a.storeId,
        kind: 'note', state: a.state, actorType: ctx.actor.type, actor: ctx.actor.name,
        detail: args.note
      });
      EV.auditEvent(store, ctx, {
        action: 'note.added', actorType: ctx.actor.type, actor: ctx.actor.name,
        applicationId: a.id, candidateId: f.candidate.id, source: 'assistant',
        why: 'Note added by ' + ctx.actor.name + '.', detail: { note: args.note }
      });
      return { ok: true, summary: 'Note added to ' + f.candidate.name + '.', data: { note: args.note } };
    }
  },

  {
    name: 'resolve_rehire_hold',
    kind: 'write', confirm: 'human_decision',
    description: 'Clear a do-not-rehire hold, either by upholding the prior record or by overriding it. Both need a reason and both are recorded against the person who decided.',
    input_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, outcome: { type: 'string', enum: ['uphold', 'override'] }, reason: { type: 'string' } },
      required: ['name', 'outcome']
    },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return f.error;
      return args.outcome === 'override'
        ? 'Overriding the prior do-not-rehire record on ' + f.candidate.name + ' lets the application continue. Your name and your reason go on the audit trail.'
        : 'Upholding it ends ' + f.candidate.name + '\'s application. Your name and your reason go on the audit trail.';
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error };
      const a = appFor(store, ctx, f.candidate.id);
      const to = args.outcome === 'override' ? 'ELIGIBLE' : 'INELIGIBLE';
      const t = WF.transition(store, ctx, a.id, to, {
        reason: args.reason || (args.outcome === 'override' ? 'Overridden.' : 'Upheld.'),
        source: 'assistant'
      });
      if (!t.ok) return { ok: false, error: t.reason, refused: t.refused };
      return { ok: true,
               summary: args.outcome === 'override'
                 ? f.candidate.name + ' continues. The override is on the record.'
                 : f.candidate.name + '\'s application is closed.',
               data: { brief: brief(store, ctx, a) } };
    }
  },

  {
    name: 'remove_shift',
    kind: 'write', confirm: 'confirm',
    description: 'Remove somebody\'s scheduled shift. Refused outright while an E-Verify mismatch is being contested, because removing a shift is an adverse action and nothing adverse is lawful until the case reaches a Final Nonconfirmation.',
    input_schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
    consequence(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return f.error;
      const a = appFor(store, ctx, f.candidate.id);
      const bar = WF.blockShiftRemoval(store, ctx, a.id);
      return bar ? 'This will be refused. ' + bar : 'This removes a scheduled shift for ' + f.candidate.name + '.';
    },
    run(store, ctx, args) {
      const f = resolveCandidate(store, ctx, args.name);
      if (!f.ok) return { ok: false, error: f.error };
      const a = appFor(store, ctx, f.candidate.id);
      const bar = WF.blockShiftRemoval(store, ctx, a.id);
      if (bar) {
        EV.auditEvent(store, ctx, {
          action: 'shift.remove', actorType: ctx.actor.type, actor: ctx.actor.name,
          applicationId: a.id, candidateId: f.candidate.id, outcome: 'refused',
          why: bar, source: 'assistant'
        });
        return { ok: false, error: bar, refused: 'unlawful',
                 data: { barred: ['Termination', 'Suspension', 'Withholding or lowering pay',
                                  'Delaying training', 'Removing scheduled shifts'] } };
      }
      const sh = store.where('shifts', ctx.tenantId, (s) => s.applicationId === a.id && !s.attendedAt)[0];
      if (!sh) return { ok: false, error: f.candidate.name + ' has no upcoming shift to remove.' };
      sh.removedAt = ctx.clock.now();
      store.markDirty();
      EV.auditEvent(store, ctx, {
        action: 'shift.remove', actorType: ctx.actor.type, actor: ctx.actor.name,
        applicationId: a.id, candidateId: f.candidate.id, source: 'assistant',
        why: 'Shift removed via the assistant.'
      });
      return { ok: true, summary: 'Shift removed for ' + f.candidate.name + '.', data: { shiftId: sh.id } };
    }
  }
];

/* --------------------------------------------------------------- batching - */

function selectBatch(store, ctx, args) {
  let apps = store.where('applications', ctx.tenantId, (a) => a.state === 'DECISION_PENDING');
  if (args.storeId) apps = apps.filter((a) => a.storeId === args.storeId);

  if (args.names && args.names.length) {
    const wanted = args.names.map(norm);
    apps = apps.filter((a) => {
      const c = store.byId('candidates', ctx.tenantId, a.candidateId);
      return wanted.some((w) => norm(c.name).indexOf(w) >= 0);
    });
  }

  const eligible = [], excluded = [];
  apps.forEach((a) => {
    const b = brief(store, ctx, a);
    const blocking = openExceptions(store, ctx, a.id).filter((e) => e.blocksProgress);
    if (blocking.length) { excluded.push({ name: b.name, why: blocking[0].title }); return; }
    if (args.recommendationIs && b.recommendation !== args.recommendationIs) {
      excluded.push({ name: b.name, why: 'recommendation is ' + (b.recommendation || 'not yet produced') }); return;
    }
    if (args.minConfidence != null && (b.confidence == null || b.confidence < args.minConfidence)) {
      excluded.push({ name: b.name, why: 'confidence ' + (b.confidence == null ? 'unknown' : Math.round(b.confidence * 100) + '%') +
                      ' is under the bar you set' }); return;
    }
    eligible.push(b);
  });
  return { eligible, excluded };
}

/* ---------------------------------------------------------------- lookup -- */

const BY_NAME = {};
TOOLS.forEach((t) => { BY_NAME[t.name] = t; });

/** The schema list handed to a model. Descriptions only, no handlers. */
function schemas() {
  return TOOLS.map((t) => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
}

module.exports = { TOOLS, BY_NAME, schemas, resolveCandidate, brief, appFor, selectBatch, openExceptions };
