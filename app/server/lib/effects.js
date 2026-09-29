/* ============================================================================
   effects.js  ·  what actually happens when an application moves

   The engine resolves effects by name out of a registry, so the transition
   table stays data and a typo in an effect name is a loud failure rather than a
   silent no-op. This file is the registry's contents and the only place that
   registers into it.

   AN EFFECT NEVER DECIDES ANYTHING. It records what a move implies: a screening
   row appears, an offer is generated, the parallel onboarding work fans out.
   Whether the move was allowed was settled before it got here, by the actor
   allowlist and the guards. Keeping that separation is what makes the human-only
   rule hold in one place instead of eighteen.

   ONE EFFECT MAY RAISE A BLOCKING EXCEPTION and two of them do. That is not a
   decision either: it stops the automatic chain and puts a person in front of
   the thing. The engine's settle() returns immediately on a blocking exception,
   so an effect raising one is how the product refuses to proceed without
   somebody looking.
   ============================================================================ */

import * as EV from './events.js';
import * as RULES from './rules.js';
import * as CONN from './connectors.js';
import * as COMPLY from './compliance.js';
import { ONBOARDING_TASKS, PRE_SHIFT_TASKS, stepOf } from '../../domain/states.js';
import { HOUR, DAY, MIN, nextMonday, addBusinessDays } from './clock.js';
import { registerEffects, GUARDS } from './engine.js';

const sys = (ctx) => Object.assign({}, ctx, { actor: { type: 'system', name: 'Workflow engine' } });

function work(store, ctx, app, o) {
  return EV.workflowEvent(store, ctx, Object.assign({
    applicationId: app.id, candidateId: app.candidateId, storeId: app.storeId,
    requisitionId: app.requisitionId, kind: 'work', state: app.state
  }, o));
}

/* ------------------------------------------------------------- step 2 --- */

/**
 * Run the deterministic rules and record the result.
 *
 * rules.js never writes anything, deliberately, so that a recorded eligibility
 * decision can be re-run for an audit without changing state. This is where the
 * writing happens.
 */
function recordEligibility(store, ctx, app, o) {
  const candidate = store.byId('candidates', ctx.tenantId, app.candidateId);
  const match = RULES.matchPriorEmployment(store, ctx, candidate, o.at);
  app.rehire = match;

  const out = RULES.evaluateEligibility(store, ctx, { application: app, candidate });
  app.eligibility = out;
  store.markDirty();

  work(store, ctx, app, {
    at: o.at, state: 'ELIGIBILITY_REVIEW', step: 2, owner: 'system',
    actorType: 'system', actor: 'Rules engine',
    durationMs: 900 + CONN.spread(app.id, 100, 1800),
    detail: out.passed ? 'All hard rules passed.'
      : (out.holdForPerson ? 'Held for a person: ' + out.holdReason
                           : 'Failed: ' + (out.failedKeys || []).join(', '))
  });

  EV.auditEvent(store, ctx, {
    at: o.at, action: 'eligibility.evaluated',
    actorType: 'system', actor: 'Rules engine',
    subjectType: 'application', subjectId: app.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: 'Deterministic rules, version ' + RULES.VERSION + '. No model was involved.',
    detail: { passed: out.passed, failedKeys: out.failedKeys, holdForPerson: out.holdForPerson },
    source: 'workflow'
  });

  /* A do-not-rehire record refuses nobody. It stops here and a person looks at
     it, because the record may be wrong and under a partial match it may not
     even be theirs. The exception blocks, which is what stops settle(). */
  if (out.holdForPerson) {
    EV.raiseException(store, ctx, {
      at: o.at, applicationId: app.id, candidateId: app.candidateId,
      kind: 'rehire_flag', severity: 'crit', blocksProgress: true,
      title: 'A prior employment record needs a person to look at it',
      detail: out.holdReason + (match && match.confidence === 'partial'
        ? ' The match is PARTIAL: the name and date of birth agree and the phone number has changed, so this may be a different person.'
        : ''),
      owner: 'human',
      nextAction: 'Confirm whether this is the same person and whether the record still stands.'
    });
  }
}

/** Somebody looked at the hold and cleared it. */
function resolveHold(store, ctx, app, o) {
  EV.auditEvent(store, ctx, {
    at: o.at, action: 'eligibility.hold.cleared',
    actorType: (ctx.actor && ctx.actor.type) || 'human', actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'application', subjectId: app.id, applicationId: app.id,
    why: o.reason || 'Cleared by a person.', source: o.source || 'ui'
  });
  /* The blocking exception is what stopped settle(), so leaving it open would
     leave the application stuck one line after a person unstuck it. */
  const held = store.where('exceptions', ctx.tenantId,
    (e) => e.applicationId === app.id && e.kind === 'rehire_flag' && !e.resolvedAt);
  held.forEach((e) => EV.resolveException(store, ctx, e.id, {
    resolution: o.to === 'ELIGIBLE' ? 'overridden' : 'upheld',
    reason: o.reason || 'Cleared by a person.', source: o.source || 'ui'
  }));
}

/**
 * A person read the failing rule and decided it does not apply.
 *
 * WHY THIS EXISTS. The rules end an application at step 2 with no human in the
 * path, and INELIGIBLE is terminal. So the one place in this product where
 * software actually ends an application was the one place with no way back, and
 * the sharpest case is right to work: somebody holding a work permit, asylum
 * status or TPS who does not read themselves as "authorised" is refused by a
 * checkbox. Whether the rules themselves should refuse terminally is a question
 * for rules.js and the apply form. This is the door.
 *
 * THE RULES' OWN FINDING IS NOT REWRITTEN. Every rule keeps its verdict and its
 * basis in `results`. The top level answer becomes the person's, and who they
 * are, when they did it and why sit beside it in `overridden`.
 */
function overrideIneligibility(store, ctx, app, o) {
  const before = app.eligibility || {};
  app.eligibility = Object.assign({}, before, {
    passed: true,
    failedKeys: [],
    overridden: {
      at: o.at,
      by: (ctx.actor && ctx.actor.name) || null,
      byRole: (ctx.actor && ctx.actor.role) || null,
      reason: o.reason || null,
      was: { passed: before.passed === true, failedKeys: (before.failedKeys || []).slice() }
    }
  });
  /* The engine stamped closedAt on the way into a terminal state. Reopening
     without clearing it leaves an application that is open and closed at once,
     and every duration measured from a closing event stays frozen. */
  app.closedAt = null;
  store.markDirty();

  work(store, ctx, app, {
    at: o.at, state: 'ELIGIBLE', step: 2, owner: 'human',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null, handoff: true,
    detail: 'Reopened by a person. The rules failed on ' +
            ((before.failedKeys || []).join(', ') || 'no named rule') + ' and that finding is kept.'
  });
  EV.auditEvent(store, ctx, {
    at: o.at, action: 'eligibility.overridden',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'application', subjectId: app.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: o.reason || null,
    detail: { was: (before.failedKeys || []).slice(), rulesVersion: before.version || null },
    source: o.source || 'ui'
  });
}

/**
 * Tell somebody the rules closed their application.
 *
 * Two applications sat in REJECTED for six and seven days and one in INELIGIBLE
 * for nearly two, and not one of the three had a single communication row. A
 * product that hires at volume and never declines anybody generates its own
 * inbound: the candidate rings the store, and the store says ring HR.
 *
 * WHAT IS WITHHELD. A prior employment record is never a reason given to a
 * candidate, and under a partial match it may not even be theirs. That path
 * cannot reach this function, because a hold does not satisfy the guard on the
 * automatic edge, and `rehire_eligibility` is filtered out below as well rather
 * than relying on that. U-91 and U-93.
 */
function notifyIneligible(store, ctx, app, o) {
  const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
  const req = store.byId('requisitions', ctx.tenantId, app.requisitionId);
  if (!cand || !cand.email) return;

  const elig = app.eligibility || {};
  const named = (elig.results || [])
    .filter((r) => !r.passed && !r.advisory && r.key !== 'rehire_eligibility')
    .map((r) => r.name);
  const subject = 'Your application for ' + ((req && req.title) || 'the role');
  const body = named.length
    ? 'This role has fixed requirements set before anybody applied, and your application did not ' +
      'meet ' + (named.length === 1 ? 'one of them' : named.length + ' of them') + ': ' +
      named.join('; ') + '. Nothing about this is a judgement of you and no interview took place.'
    : 'This role has a fixed requirement your application did not meet. Nothing about this is a ' +
      'judgement of you and no interview took place.';

  const r = CONN.call(store, ctx, 'messaging', 'email', {
    to: cand.email, templateId: 'ineligible_v1',
    applicationId: app.id, candidateId: cand.id, subject
  });
  EV.communication(store, ctx, {
    at: o.at, channel: 'email', to: cand.email,
    candidateId: cand.id, applicationId: app.id,
    templateId: 'ineligible_v1', subject, body,
    status: r && r.ok ? 'sent' : 'failed',
    providerRef: r && r.externalRef ? r.externalRef : null,
    mode: (r && r.mode) || 'simulated',
    error: r && r.error ? r.error : null
  });
  work(store, ctx, app, {
    at: o.at, state: 'INELIGIBLE', step: 2, owner: 'system',
    actorType: 'system', actor: 'Workflow engine',
    detail: 'Told the candidate, naming the requirement that was not met.'
  });
}

/* ------------------------------------------------------------- step 3 --- */

function createScreening(store, ctx, app, o) {
  const req = store.byId('requisitions', ctx.tenantId, app.requisitionId);
  const row = {
    id: store.nextId('scr'), tenantId: ctx.tenantId,
    applicationId: app.id, candidateId: app.candidateId,
    kind: 'call', required: true, status: 'pending',
    channel: 'voice', owner: 'agent', step: 3,
    /* The bank is snapshotted at creation, which is what a screening record has
       to do, and it is the exact thing that went stale once: a fix to the
       requisition did not reach records already created. There is now a test
       asserting no stored screening carries a bank its requisition no longer
       has. */
    questions: (req && req.screeningQuestions) || [],
    responses: [], transcript: [],
    scheduledAt: o.at, startedAt: null, completedAt: null, durationMs: null,
    evaluationId: null, call: null
  };
  store.insert('screenings', row);

  /* A manager interview is a second required screening on the roles that ask
     for one, and it is never evaluated by a model. The notes are the record. */
  if (req && req.requiresManagerInterview) {
    store.insert('screenings', {
      id: store.nextId('scr'), tenantId: ctx.tenantId,
      applicationId: app.id, candidateId: app.candidateId,
      kind: 'manager_interview', required: true, status: 'pending',
      channel: 'in_person', owner: 'human', step: 5,
      questions: (req && req.interviewQuestions) || [],
      responses: [], transcript: [],
      scheduledAt: null, startedAt: null, completedAt: null, durationMs: null,
      evaluation: null,
      evaluationMeta: { mode: 'human',
        note: 'A manager interview is not evaluated by a model. The notes are the record.' }
    });
  }

  work(store, ctx, app, {
    at: o.at, state: 'SCREENING_PENDING', step: 3, owner: 'agent',
    actorType: 'system', actor: 'Workflow engine', durationMs: 300,
    detail: 'Screening queued with ' + row.questions.length + ' questions from the store bank.',
    ref: row.id
  });
}

function startScreening(store, ctx, app, o) {
  const scr = store.first('screenings', ctx.tenantId,
    (s) => s.applicationId === app.id && s.kind === 'call');
  if (!scr) return;
  scr.status = scr.status === 'pending' ? 'in_progress' : scr.status;
  scr.startedAt = scr.startedAt || o.at;
  store.markDirty();
  work(store, ctx, app, {
    at: o.at, state: 'SCREENING_IN_PROGRESS', step: 3, owner: 'agent',
    actorType: 'agent', actor: o.actor || null, handoff: true,
    detail: 'Screening conversation started.', ref: scr.id
  });
}

function completeScreening(store, ctx, app, o) {
  const scrs = store.where('screenings', ctx.tenantId, (s) => s.applicationId === app.id && s.required);
  const done = scrs.filter((s) => s.status === 'complete');
  work(store, ctx, app, {
    at: o.at, state: 'SCREENING_COMPLETE', step: 3, owner: 'agent',
    actorType: 'agent', actor: o.actor || null, handoff: true,
    detail: done.length + ' of ' + scrs.length + ' required screenings complete.'
  });
}

/* ---------------------------------------------------------- steps 4-5 ---
   THE MANAGER INTERVIEW. Three of the eight requisitions require one, the
   careers page tells the candidate so in writing, and until 8 September the
   product created the interview as a required screening, correctly refused to
   skip it, and then gave nobody any way to say it had happened. An application
   for the first job on the default store's careers page parked at "Screening in
   progress" for ever.

   NOTHING HERE IS SCORED. A manager interview is a person in a room and the
   notes are the record. No model reads them, no verdict is derived from them,
   and the screening row's evaluation stays null with evaluationMeta.mode
   'human'. That is what the four functions below are careful about.
   ------------------------------------------------------------------------- */

/** The one required interview that is still outstanding, or null. */
function openInterview(store, ctx, app) {
  return store.first('screenings', ctx.tenantId,
    (s) => s.applicationId === app.id && s.required &&
           s.kind === 'manager_interview' && s.status !== 'complete');
}

/** The AI part is done and this role needs a person in a room. */
function openManagerInterview(store, ctx, app, o) {
  const iv = openInterview(store, ctx, app);
  work(store, ctx, app, {
    at: o.at, state: 'INTERVIEW_PENDING', step: 4, owner: 'human',
    actorType: 'system', actor: 'Workflow engine', handoff: true,
    detail: 'This role requires a manager interview. The screening call is done and this is now ' +
            'waiting on a person to arrange one.',
    ref: iv ? iv.id : null
  });
  /* The manager is told rather than left to find it. An application waiting on
     somebody who does not know they are the blocker is the whole defect. */
  EV.notify(store, ctx, {
    at: o.at, to: app.assignedTo || null, kind: 'interview_to_arrange',
    applicationId: app.id,
    title: 'A manager interview needs arranging',
    detail: 'The screening call is complete. This role does not go to a decision until you have ' +
            'interviewed them.'
  });
}

/**
 * A slot exists.
 *
 * The time comes from the caller. Where none is given the product proposes the
 * next working day at the same hour and SAYS SO on the record, in the same
 * shape scheduleFirstShift already uses for a start date. An invented time
 * presented as a booked one is the thing to avoid.
 */
function scheduleManagerInterview(store, ctx, app, o) {
  const iv = openInterview(store, ctx, app);
  if (!iv) return;
  const given = o.scheduledAt != null ? o.scheduledAt : (o.startsAt != null ? o.startsAt : null);
  const startsAt = given != null ? given : addBusinessDays(o.at, 1);
  iv.scheduledAt = startsAt;
  iv.status = 'scheduled';
  iv.slotBasis = given != null
    ? 'A time somebody chose.'
    : 'No time was given, so the next working day was proposed. Not confirmed with the candidate.';
  iv.scheduledBy = (ctx.actor && ctx.actor.name) || null;
  store.markDirty();

  work(store, ctx, app, {
    at: o.at, state: 'INTERVIEW_SCHEDULED', step: 4, owner: 'human',
    actorType: (ctx.actor && ctx.actor.type) || 'system', actor: (ctx.actor && ctx.actor.name) || null,
    detail: 'Manager interview set for ' + new Date(startsAt).toISOString() + '. ' + iv.slotBasis,
    ref: iv.id
  });
  EV.auditEvent(store, ctx, {
    at: o.at, action: 'interview.scheduled',
    actorType: (ctx.actor && ctx.actor.type) || 'system', actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'screening', subjectId: iv.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: iv.slotBasis, detail: { scheduledAt: startsAt }, source: o.source || 'ui'
  });
}

/**
 * The manager held the interview and wrote it up.
 *
 * The notes are required by the transition, which carries needsReason, so this
 * is never called without them. They are stored as notes and NOT as an
 * evaluation: a note is what a person said, an evaluation is a scored verdict,
 * and this product does not let anything score an interview.
 */
function completeManagerInterview(store, ctx, app, o) {
  const iv = openInterview(store, ctx, app);
  if (!iv) return;
  const notes = String(o.notes || o.reason || '').trim();
  const heldWithoutSlot = iv.scheduledAt == null;
  Object.assign(iv, {
    status: 'complete',
    startedAt: iv.startedAt != null ? iv.startedAt : (iv.scheduledAt != null ? iv.scheduledAt : o.at),
    completedAt: o.at,
    durationMs: o.workMs != null ? o.workMs : null,
    notes,
    notesBy: (ctx.actor && ctx.actor.name) || null,
    notesByRole: (ctx.actor && ctx.actor.role) || null,
    heldWithoutSlot,
    evaluation: null,
    evaluationMeta: { mode: 'human',
      note: 'A manager interview is not evaluated by a model. The notes are the record.' }
  });
  store.markDirty();

  work(store, ctx, app, {
    at: o.at, state: 'INTERVIEW_COMPLETE', step: 5, owner: 'human',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    durationMs: o.workMs != null ? o.workMs : null,
    detail: 'Manager interview held and written up' +
            (heldWithoutSlot ? ', without a booked slot, so step 4 never happened.' : '.'),
    ref: iv.id
  });
  EV.auditEvent(store, ctx, {
    at: o.at, action: 'interview.recorded',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'screening', subjectId: iv.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: notes,
    detail: { scored: false, heldWithoutSlot },
    source: o.source || 'ui'
  });
}

/**
 * They did not turn up.
 *
 * THIS ENDS NOTHING. Step 5 is named "interview happens, or no-show" and it
 * carries the largest drop in the hire stage, so it has to be recordable, and
 * recording it must not be a rejection. The slot is cleared, the interview goes
 * back to needing one, and a person decides what to do next.
 */
function recordInterviewNoShow(store, ctx, app, o) {
  const iv = openInterview(store, ctx, app);
  if (!iv) return;
  const missed = iv.scheduledAt;
  iv.noShows = (iv.noShows || []).concat([{ at: o.at, slotWas: missed,
                                            recordedBy: (ctx.actor && ctx.actor.name) || null }]);
  iv.scheduledAt = null;
  iv.status = 'pending';
  store.markDirty();

  work(store, ctx, app, {
    at: o.at, state: 'INTERVIEW_PENDING', step: 5, owner: 'human',
    actorType: (ctx.actor && ctx.actor.type) || 'human', actor: (ctx.actor && ctx.actor.name) || null,
    detail: 'Did not turn up to the interview' + (missed ? ' booked for ' + new Date(missed).toISOString() : '') +
            '. Recorded as a no-show, which is not a rejection. The slot is cleared.',
    ref: iv.id
  });
  EV.raiseException(store, ctx, {
    at: o.at, applicationId: app.id, candidateId: app.candidateId,
    kind: 'interview_no_show', severity: 'warn', blocksProgress: false,
    title: 'No-show at the manager interview' + (iv.noShows.length > 1 ? ' (' + iv.noShows.length + ' so far)' : ''),
    detail: 'The interview slot passed with nobody in the room. Nothing has been decided about this ' +
            'application and nothing has been sent to the candidate.',
    owner: 'human',
    nextAction: 'Arrange another slot, or decide with a reason on the record.'
  });
}

/* ------------------------------------------------------------- step 6 --- */

/**
 * The decision. This runs AFTER the engine has already established that the
 * actor is a named human, because the transition carries by: ['human'] and
 * there is no path around it, and that the reason exists, because the
 * transition carries needsReason.
 *
 * THE REASON USED TO BE OPTIONAL and the row this produced was the strongest
 * plaintiff exhibit in the product: outcome rejected, reason null, next to an
 * evaluation snapshot recommending advance with every criterion met and no
 * concerns. Under McDonnell Douglas the employer has to articulate a legitimate
 * non-discriminatory reason and that row cannot.
 */
function recordDecision(store, ctx, app, o) {
  const outcome = o.to === 'APPROVED' ? 'approved' : 'rejected';
  const snapshot = snapshotEvaluation(store, ctx, app);
  const row = {
    id: store.nextId('dec'), tenantId: ctx.tenantId,
    applicationId: app.id, candidateId: app.candidateId, storeId: app.storeId,
    at: o.at, outcome,
    /* Recorded against a name, not a role. "Approved by the store manager" is
       not an audit trail. */
    by: (ctx.actor && ctx.actor.name) || null,
    byRole: (ctx.actor && ctx.actor.role) || null,
    reason: o.reason || null,
    /* What the person was looking at when they decided. An evaluation that
       changes later must not change what the decision was made on. */
    evaluationSnapshot: snapshot,
    /* Whether the person went against the assessment, computed here rather than
       left for somebody to notice later. A departure from the recommendation is
       exactly the row that gets read out, and it is a perfectly legitimate
       thing for a manager to do, so what matters is that it is visible and
       explained rather than that it is rare. */
    contradictsRecommendation: contradicts(snapshot, outcome),
    /* The interview notes, where the role had one. A decision made after an
       interview should not read as though it were made on the call alone. */
    interviewNotes: interviewNotesFor(store, ctx, app)
  };
  store.insert('decisions', row);
  app.decisionId = row.id;
  store.markDirty();

  work(store, ctx, app, {
    at: o.at, state: o.to, step: 6, owner: 'human',
    actorType: 'human', actor: row.by, handoff: true,
    durationMs: o.workMs != null ? o.workMs : 40 * MIN,
    detail: (outcome === 'approved' ? 'Approved by ' + row.by + '.' : 'Rejected by ' + row.by + '.') +
            (row.contradictsRecommendation ? ' Against the assessment, with a reason recorded.' : ''),
    ref: row.id
  });

  if (outcome === 'rejected') notifyRejected(store, ctx, app, o, row);
}

/**
 * Did the person go against the assessment.
 *
 * Two ways round, and both are worth recording. Rejecting somebody the
 * assessment recommended advancing is the obvious one. Approving on
 * insufficient evidence is the other, and it matters because the evidence, not
 * the outcome, is what the decision has to be explained by later.
 */
function contradicts(snapshot, outcome) {
  if (!snapshot || !snapshot.recommendation) return false;
  if (outcome === 'rejected') return snapshot.recommendation === 'advance';
  return snapshot.recommendation === 'insufficient_evidence';
}

function interviewNotesFor(store, ctx, app) {
  const iv = store.first('screenings', ctx.tenantId,
    (s) => s.applicationId === app.id && s.kind === 'manager_interview' && s.status === 'complete');
  if (!iv) return null;
  return { screeningId: iv.id, completedAt: iv.completedAt || null,
           notes: iv.notes || null, by: iv.notesBy || null, scored: false };
}

/**
 * Tell them.
 *
 * Two rejected applications sat for six and seven days with no communication
 * of any kind, which is how a hiring product generates its own inbound: the
 * candidate rings the store and the store says ring HR.
 *
 * THE REASON THE MANAGER TYPED IS NOT FORWARDED. It is written for the record
 * and for the employer, and posting it to the candidate verbatim would publish
 * an internal note nobody wrote for them. The message says a decision was made
 * and by whom it can be queried, and the reason stays on the decision row.
 *
 * This cannot collide with the FCRA notice sequence. A rejection is only
 * reachable from step 6, before any report is ordered, and the adverse action
 * bar in the engine refuses REJECTED outright while an adverse review is open.
 */
function notifyRejected(store, ctx, app, o, decision) {
  const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
  const req = store.byId('requisitions', ctx.tenantId, app.requisitionId);
  if (!cand || !cand.email) return;
  const subject = 'Your application for ' + ((req && req.title) || 'the role');
  const r = CONN.call(store, ctx, 'messaging', 'email', {
    to: cand.email, templateId: 'decline_v1',
    applicationId: app.id, candidateId: cand.id, subject
  });
  EV.communication(store, ctx, {
    at: o.at, channel: 'email', to: cand.email,
    candidateId: cand.id, applicationId: app.id,
    templateId: 'decline_v1', subject,
    body: 'A person at the store has read your application and the screening and decided not to take it ' +
          'further this time. The decision was made by a named person on ' +
          new Date(o.at).toISOString() + ' and is recorded. You can apply for other roles at any time.',
    status: r && r.ok ? 'sent' : 'failed',
    providerRef: r && r.externalRef ? r.externalRef : null,
    mode: (r && r.mode) || 'simulated',
    error: r && r.error ? r.error : null
  });
  EV.auditEvent(store, ctx, {
    at: o.at, action: 'decision.candidate_told',
    actorType: 'system', actor: 'Workflow engine',
    subjectType: 'decision', subjectId: decision.id,
    applicationId: app.id, candidateId: cand.id,
    why: 'A rejection the candidate is never told about becomes a phone call to the store.',
    detail: { templateId: 'decline_v1', reasonForwarded: false }, source: 'workflow'
  });
}

function snapshotEvaluation(store, ctx, app) {
  const scr = store.first('screenings', ctx.tenantId,
    (s) => s.applicationId === app.id && s.kind === 'call' && s.evaluation);
  if (!scr || !scr.evaluation) return null;
  const e = scr.evaluation;
  return {
    screeningId: scr.id,
    recommendation: e.recommendation,
    confidence: e.confidence != null ? e.confidence : null,
    criteria: (e.criteria || []).map((c) => ({ key: c.key, verdict: c.verdict })),
    concerns: (e.concerns || []).length,
    mode: (scr.evaluationMeta && scr.evaluationMeta.mode) || null
  };
}

/* ------------------------------------------------------------ steps 7-8 --- */

function createOffer(store, ctx, app, o) {
  const req = store.byId('requisitions', ctx.tenantId, app.requisitionId);
  const row = {
    id: store.nextId('off'), tenantId: ctx.tenantId,
    applicationId: app.id, candidateId: app.candidateId, storeId: app.storeId,
    createdAt: o.at, sentAt: null, respondedAt: null,
    rateCents: req ? req.rateCents : null,
    hoursPerWeek: req ? req.hoursPerWeek : null,
    title: req ? req.title : null,
    /* Three days, and it is tenant policy rather than law. Anything that
       renders it has to be able to say which. */
    expiresAt: o.at + 3 * DAY,
    expiryBasis: 'tenant policy, not a statutory period',
    templateId: 'offer_email_v1',
    status: 'draft'
  };
  store.insert('offers', row);
  app.offerId = row.id;
  store.markDirty();
  work(store, ctx, app, {
    /* OFFER_PENDING. This said OFFER_READY, which is not one of the states. */
    at: o.at, state: 'OFFER_PENDING', step: 7, owner: 'system',
    actorType: 'system', actor: 'Workflow engine', durationMs: 2 * MIN,
    detail: 'Offer generated. It is NOT sent until somebody confirms that separately.',
    ref: row.id
  });
}

function sendOffer(store, ctx, app, o) {
  const off = store.byId('offers', ctx.tenantId, app.offerId);
  const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
  if (!off || !cand) return;
  off.sentAt = o.at;
  off.status = 'sent';
  store.markDirty();

  const r = CONN.call(store, ctx, 'messaging', 'email', {
    to: cand.email, templateId: off.templateId,
    applicationId: app.id, candidateId: cand.id,
    subject: 'Your offer from ' + (ctx.tenantName || 'the store')
  });

  EV.communication(store, ctx, {
    at: o.at, channel: 'email', to: cand.email,
    candidateId: cand.id, applicationId: app.id,
    templateId: off.templateId,
    subject: 'Your offer from ' + (ctx.tenantName || 'the store'),
    status: r && r.ok ? 'sent' : 'failed',
    providerRef: r && r.externalRef ? r.externalRef : null,
    /* Read off the connector result, never asserted here. The previous build
       hardcoded this in the view layer, so the honesty label was written by the
       page rather than reported by the thing it described. */
    mode: (r && r.mode) || 'simulated',
    error: r && r.error ? r.error : null
  });

  work(store, ctx, app, {
    at: o.at, state: 'OFFER_SENT', step: 8, owner: 'clock',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null, handoff: true,
    durationMs: 90000,
    detail: 'Offer sent. Waiting on the candidate, which is not a product failure.',
    ref: off.id
  });
}

function acceptOffer(store, ctx, app, o) {
  const off = store.byId('offers', ctx.tenantId, app.offerId);
  if (off) { off.respondedAt = o.at; off.status = 'accepted'; }
  app.acceptedAt = o.at;
  store.markDirty();
  work(store, ctx, app, {
    at: o.at, state: 'OFFER_ACCEPTED', step: 8, owner: 'system',
    actorType: 'external', actor: 'Candidate', handoff: true,
    detail: 'Offer accepted.', ref: off ? off.id : null
  });
}

function declineOffer(store, ctx, app, o) {
  const off = store.byId('offers', ctx.tenantId, app.offerId);
  if (off) { off.respondedAt = o.at; off.status = 'declined'; }
  store.markDirty();
  work(store, ctx, app, {
    at: o.at, state: 'OFFER_DECLINED', step: 8, owner: 'system',
    actorType: 'external', actor: 'Candidate',
    detail: o.reason || 'Offer declined.'
  });
}

/* ------------------------------------------------------- the offer window ---
   `expiresAt` was written on every offer by createOffer above and read by
   NOTHING. Three seeded offers close inside a day of the opening screen and all
   three still counted as live pipeline, with the showcase candidate carrying
   eight hours and no chase. An expired offer that reads as open is the most
   expensive kind of wrong for the person holding the requisition: the candidate
   has taken another job and the manager thinks the slot is covered.
   ------------------------------------------------------------------------- */

/** Whatever is still open on this application, of one kind. */
function openExceptions(store, ctx, app, kind) {
  return store.where('exceptions', ctx.tenantId,
    (e) => e.applicationId === app.id && e.kind === kind && !e.resolvedAt);
}

/**
 * The window closed with no answer.
 *
 * Not a decision and not an ending. The state it moves into is not terminal,
 * because a date passing is a fact and closing somebody's application is a
 * judgement. The exception does NOT block progress: the application is already
 * sitting in a human-owned state, so blocking would record the same stop twice.
 */
function recordOfferExpiry(store, ctx, app, o) {
  const off = store.byId('offers', ctx.tenantId, app.offerId);
  if (off) { off.status = 'expired'; off.expiredAt = o.at; store.markDirty(); }

  /* The "expires in N hours" warning is now wrong rather than merely old. */
  openExceptions(store, ctx, app, 'offer_expiring').forEach((e) =>
    EV.resolveException(store, sys(ctx), e.id, {
      resolution: 'superseded',
      reason: 'The window closed. Replaced by the expiry itself.', source: 'workflow'
    }));

  work(store, ctx, app, {
    at: o.at, state: 'OFFER_EXPIRED', step: 8, owner: 'human',
    actorType: 'system', actor: 'Workflow engine', handoff: true,
    detail: 'The offer window passed with no answer. Three days, which is tenant policy and not a ' +
            'statutory period. Nothing has been closed and nothing has been sent.',
    ref: off ? off.id : null
  });
  EV.raiseException(store, ctx, {
    at: o.at, applicationId: app.id, candidateId: app.candidateId,
    kind: 'offer_expired', severity: 'warn', blocksProgress: false,
    title: 'An offer window closed with no answer',
    detail: 'The candidate has not answered inside the window on the offer. They may still answer, and ' +
            'a late answer can be honoured. Nobody has declined anything.',
    owner: 'human',
    nextAction: 'Extend it, take a late answer, or close it with a reason.'
  });
  EV.notify(store, ctx, {
    at: o.at, to: app.assignedTo || null, kind: 'offer_expired',
    applicationId: app.id,
    title: 'An offer expired with no answer',
    detail: 'This is out of the live pipeline until you extend it or close it.'
  });
}

/** A person gave them longer. */
function extendOffer(store, ctx, app, o) {
  const off = store.byId('offers', ctx.tenantId, app.offerId);
  const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
  if (!off) return;
  /* The same three days as the original window, and it is tenant policy in
     exactly the same way. A caller may pass its own. */
  const until = o.expiresAt != null ? o.expiresAt : o.at + 3 * DAY;
  off.extensions = (off.extensions || []).concat([{
    at: o.at, by: (ctx.actor && ctx.actor.name) || null,
    byRole: (ctx.actor && ctx.actor.role) || null,
    reason: o.reason || null, was: off.expiresAt, until
  }]);
  off.expiresAt = until;
  off.expiredAt = null;
  off.status = 'sent';
  store.markDirty();

  openExceptions(store, ctx, app, 'offer_expired').forEach((e) =>
    EV.resolveException(store, ctx, e.id, {
      resolution: 'extended', reason: o.reason || 'Extended by a person.', source: o.source || 'ui'
    }));

  if (cand && cand.email) {
    const subject = 'Your offer has been extended';
    const r = CONN.call(store, ctx, 'messaging', 'email', {
      to: cand.email, templateId: 'offer_extended_v1',
      applicationId: app.id, candidateId: cand.id, subject
    });
    EV.communication(store, ctx, {
      at: o.at, channel: 'email', to: cand.email,
      candidateId: cand.id, applicationId: app.id,
      templateId: 'offer_extended_v1', subject,
      body: 'The offer is open again until ' + new Date(until).toISOString() + '.',
      status: r && r.ok ? 'sent' : 'failed',
      providerRef: r && r.externalRef ? r.externalRef : null,
      mode: (r && r.mode) || 'simulated',
      error: r && r.error ? r.error : null
    });
  }

  work(store, ctx, app, {
    at: o.at, state: 'OFFER_SENT', step: 8, owner: 'clock',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    detail: 'Offer extended to ' + new Date(until).toISOString() + '. ' +
            'Extension ' + off.extensions.length + ' on this offer.',
    ref: off.id
  });
  EV.auditEvent(store, ctx, {
    at: o.at, action: 'offer.extended',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'offer', subjectId: off.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: o.reason || null, detail: { until, count: off.extensions.length }, source: o.source || 'ui'
  });
}

/**
 * A named person closed it because nobody ever answered.
 *
 * This is why OFFER_DECLINED is not reused for a silence. Declined means the
 * candidate said no, and recording that of somebody who said nothing at all
 * puts words in their mouth on a record they can later ask to see.
 */
function closeLapsedOffer(store, ctx, app, o) {
  const off = store.byId('offers', ctx.tenantId, app.offerId);
  if (off) { off.status = 'lapsed'; off.closedAt = o.at; store.markDirty(); }

  ['offer_expired', 'offer_expiring'].forEach((kind) =>
    openExceptions(store, ctx, app, kind).forEach((e) =>
      EV.resolveException(store, ctx, e.id, {
        resolution: 'closed', reason: o.reason || 'Closed by a person.', source: o.source || 'ui'
      })));

  work(store, ctx, app, {
    at: o.at, state: 'OFFER_LAPSED', step: 8, owner: 'human',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    detail: o.reason || 'Closed with no answer from the candidate.',
    ref: off ? off.id : null
  });
  EV.auditEvent(store, ctx, {
    at: o.at, action: 'offer.lapsed',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'offer', subjectId: off ? off.id : null,
    applicationId: app.id, candidateId: app.candidateId,
    why: o.reason || null,
    detail: { closedWithNoAnswer: true }, source: o.source || 'ui'
  });
}

/* ------------------------------------------------------- steps 9 to 16 --- */

/**
 * The fan-out. This is the thing the product is actually about: at acceptance,
 * everything that can run in parallel starts, and everything with a
 * prerequisite waits until the prerequisite is done.
 *
 * The dependency edges are real and live in the domain table, not here, so the
 * candidate timeline draws the actual graph rather than a picture of one.
 */
function fanOutParallelWork(store, ctx, app, o) {
  const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
  /* reuseMap wants the RECORD, and this passed it the MATCH, so it returned
     only the two never-reused entries and a returning worker's carried-forward
     work was recreated as work to do. matchPriorEmployment has already computed
     the right answer, so read that and only fall back to recomputing. */
  const reuse = (app.rehire && app.rehire.matched)
    ? (app.rehire.reusable || RULES.reuseMap(app.rehire.record, {
        at: o.at, i9Reusable: !!(app.rehire.i9 && app.rehire.i9.reusable) }))
    : null;

  const created = [];
  ONBOARDING_TASKS.forEach((def) => {
    /* A returning worker does not redo everything. What may be carried forward
       is decided in rules.js, and canSkipTask exists because the previous build
       matched reuse entries against task keys itself and a course keyed
       "training:FS-101" never matched a task named "training", so carried
       work was recreated as work to do. */
    /* canSkipTask returns { skip, why, row } rather than a boolean, because
       "carried forward" needs the reason on screen next to it. */
    const carry = reuse ? RULES.canSkipTask(reuse, def.key) : { skip: false, why: null };
    const skip = !!carry.skip;
    const row = {
      id: store.nextId('tsk'), tenantId: ctx.tenantId,
      applicationId: app.id, candidateId: app.candidateId, storeId: app.storeId,
      key: def.key, name: def.name, step: def.step,
      owner: def.owner, needs: def.needs || [],
      afterStart: !!def.afterStart,
      preShift: PRE_SHIFT_TASKS.indexOf(def.key) >= 0,
      /* Written as complete, with the carry recorded beside it.

         It used to be status 'carried_forward', and the preShiftTasksDone guard
         tests for 'complete', so a carried-forward task counted as OPEN and a
         returning worker could never reach a first shift. Complete is also the
         truer shape: the work is genuinely done, it was just done during a
         previous spell, and the reason is preserved so a surface can say so. */
      status: skip ? 'complete' : 'pending',
      carriedForward: skip,
      carriedWhy: skip ? carry.why : null,
      /* completedAt WAS WRITTEN TWICE, here and again two lines down as null,
         and the second one won. So the three carried-forward tasks in the
         dataset came out status complete with completedAt null, the only three
         of a hundred and sixty-five rows that broke the pattern, and anything
         sorting or filtering on a completion date dropped them silently. The
         rehire payoff line is "she did this last time, on this date".

         WHAT THE DATE MEANS on a carried task is the instant it was carried
         forward, NOT the instant the work was done. The prior record holds no
         machine-readable date for it, so inventing one would be worse than
         this. Where the prior record does say when, it is in carriedWhy in
         words, and `carriedAt` is here so no surface has to guess which kind of
         date it is holding. */
      completedAt: skip ? o.at : null,
      carriedAt: skip ? o.at : null,
      startedAt: null, durationMs: null,
      /* Eligible means every prerequisite is done and it is not gated on the
         start date. Recomputed rather than stored, but stamped here so the
         first render is right. */
      eligibleAt: (def.needs && def.needs.length) || def.afterStart ? null : o.at
    };
    store.insert('onboardingTasks', row);
    created.push(row);
  });

  work(store, ctx, app, {
    /* ONBOARDING_PENDING. This said ONBOARDING, which is not one of the states. */
    at: o.at, state: 'ONBOARDING_PENDING', step: 11, owner: 'system',
    actorType: 'system', actor: 'Workflow engine', durationMs: 4000,
    detail: created.length + ' onboarding tasks created. ' +
            created.filter((t) => t.eligibleAt).length + ' can start now, ' +
            created.filter((t) => !t.eligibleAt).length + ' are waiting on a prerequisite' +
            (reuse ? ', ' + created.filter((t) => t.carriedForward).length + ' carried forward from a prior spell' : '') + '.'
  });

  /* The FCRA disclosure is a separate signed document and it is signed BEFORE
     the report is ordered, not bundled with anything else. 15 U.S.C.
     1681b(b)(2)(A) requires it to stand alone. */
  app.fcra = COMPLY.fcraSequence
    ? { startedAt: o.at, disclosureSignedAt: null, reportOrderedAt: null,
        preAdverseSentAt: null, adverseSentAt: null }
    : null;
  store.markDirty();
}

function orderBackgroundCheck(store, ctx, app, o) {
  const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
  /* backgroundSearchScope returns an ARRAY of searches, not an object carrying
     one. Reading `scope.searches` wrote every check with ZERO searches, and
     that is worse than empty: the allSearchesReturned guard then finds nothing
     outstanding and vacuously passes, closing a check that searched nothing.

     The callback is also handed the county OBJECT, not a string, so hashing it
     directly gave hash('[object Object]') and every county got an identical
     expected duration. Both found by review. */
  const scope = RULES.backgroundSearchScope(cand, (co) => CONN.spread(
    co && co.name ? co.name + ',' + (co.state || '') : String(co), 18 * HOUR, 132 * HOUR));
  const row = {
    id: store.nextId('bgc'), tenantId: ctx.tenantId,
    applicationId: app.id, candidateId: app.candidateId, storeId: app.storeId,
    orderedAt: o.at, closedAt: null,
    /* We never perform a check. We order one, track it and run the notice
       sequence. The distinction is the difference between being a consumer
       reporting agency and not. */
    performedBy: 'a licensed consumer reporting agency',
    searches: (Array.isArray(scope) ? scope : (scope.searches || []))
      .map((s) => Object.assign({ status: 'pending', outcome: null, result: null }, s)),
    outcome: null, status: 'in_progress',
    /* THE FCRA PAPERWORK, ON THE ROW. 15 U.S.C. 1681b(b)(2)(A) requires a clear
       and conspicuous written disclosure in a document consisting solely of the
       disclosure, plus the consumer's written authorisation, BEFORE the report
       is procured. compliance.js has carried the rule as a constant since it
       was written and nothing imported it, and the check row had no field for
       any of this: not the disclosure, not the authorisation, not a consent id.
       Every field is written here even when it is null, so the absence is
       visible in the data instead of being an undefined nobody queries. */
    disclosure: fcraPaperwork(app)
  };
  store.insert('backgroundChecks', row);
  app.backgroundCheckId = row.id;
  if (app.fcra) app.fcra.reportOrderedAt = o.at;
  store.markDirty();

  CONN.call(store, ctx, 'background_check', 'order', {
    searches: row.searches.map((s) => s.kind || s.name),
    applicationId: app.id, candidateId: cand ? cand.id : null, at: o.at
  });

  work(store, ctx, app, {
    at: o.at, state: 'BACKGROUND_CHECK_IN_PROGRESS', step: 9, owner: 'clock',
    actorType: 'system', actor: 'Workflow engine', handoff: true,
    detail: row.searches.length + ' searches ordered from an agency. Waiting on them, which nobody can compress.',
    ref: row.id
  });

  /* SAID OUT LOUD RATHER THAN LEFT AS AN ABSENCE. The order is not refused here
     because refusing it needs a signing step that does not exist yet, in a
     route and a screen this file does not own, and the seeded history would
     stop building the moment the guard went on. What this file can do is make
     the gap impossible to miss and impossible to describe as an oversight.
     Attaching `fcraAuthorisationOnFile` as the guard on
     BACKGROUND_CHECK_PENDING to BACKGROUND_CHECK_IN_PROGRESS is a one line
     change once the signing step lands. */
  const paperwork = GUARDS.fcraAuthorisationOnFile(store, ctx, app);
  if (paperwork !== true) {
    EV.auditEvent(store, ctx, {
      at: o.at, action: 'background_check.ordered_without_authorisation',
      actorType: 'system', actor: 'Workflow engine',
      subjectType: 'backgroundCheck', subjectId: row.id,
      applicationId: app.id, candidateId: app.candidateId,
      why: String(paperwork) + ' There is no signing step in this build, so every order in it has ' +
           'this gap and the audit trail says so rather than leaving it to be noticed.',
      detail: { disclosure: row.disclosure, rule: COMPLY.FCRA_DISCLOSURE.rule },
      outcome: 'gap', source: 'workflow'
    });
  }
}

/** What is on file about the disclosure and the authorisation. Nulls included. */
function fcraPaperwork(app) {
  const f = app.fcra || {};
  return {
    citation: COMPLY.FCRA_DISCLOSURE.citation,
    /* Two documents, never one page. The disclosure may not share a page or a
       signature with an application, an at-will acknowledgement or a release. */
    standaloneDocument: true,
    disclosureVersion: f.disclosureVersion || null,
    disclosureShownAt: f.disclosureShownAt != null ? f.disclosureShownAt : null,
    disclosureSignedAt: f.disclosureSignedAt != null ? f.disclosureSignedAt : null,
    authorisationSignedAt: f.authorisationSignedAt != null ? f.authorisationSignedAt : null,
    authorisationMethod: f.authorisationMethod || null,
    consentId: app.consentId || null
  };
}

/**
 * Record that the candidate was shown the standalone disclosure and signed the
 * authorisation.
 *
 * NOT AN EFFECT, and it is exported instead. Signing is not a change of state:
 * the application stays where it is, at "check ready to order", so there is no
 * transition for this to hang off. It lives in this file because it writes the
 * fields orderBackgroundCheck above reads, and splitting the writer from the
 * reader is how a field like this drifts.
 *
 * A caller has to have actually shown the documents. This records what
 * happened. It does not make it happen, and passing it a time nobody signed at
 * is falsifying a record.
 */
export function recordFcraAuthorisation(store, ctx, app, o) {
  const opts = o || {};
  const at = opts.at != null ? opts.at : ctx.clock.now();
  app.fcra = Object.assign({}, app.fcra || {}, {
    disclosureVersion: opts.disclosureVersion || COMPLY.FCRA_DISCLOSURE.citation,
    disclosureShownAt: opts.disclosureShownAt != null ? opts.disclosureShownAt : at,
    disclosureSignedAt: opts.disclosureSignedAt != null ? opts.disclosureSignedAt : at,
    authorisationSignedAt: opts.authorisationSignedAt != null ? opts.authorisationSignedAt : at,
    authorisationMethod: opts.authorisationMethod || 'e-signature on the hosted form'
  });
  store.markDirty();

  EV.auditEvent(store, ctx, {
    at, action: 'fcra.authorisation.recorded',
    actorType: (ctx.actor && ctx.actor.type) || 'external', actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'application', subjectId: app.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: 'The standalone disclosure was shown and the written authorisation signed, before any report ' +
         'was ordered. ' + COMPLY.FCRA_DISCLOSURE.citation + '.',
    detail: { disclosureVersion: app.fcra.disclosureVersion, method: app.fcra.authorisationMethod },
    source: opts.source || 'ui'
  });
  return app.fcra;
}

/**
 * The check came back.
 *
 * A returned record does NOT auto-reject and does not auto-advance. It raises a
 * blocking exception, which stops the automatic chain, and the notice sequence
 * begins. That is the FCRA sequence and it cannot be collapsed.
 */
function closeBackgroundCheck(store, ctx, app, o) {
  const chk = store.byId('backgroundChecks', ctx.tenantId, app.backgroundCheckId);
  if (!chk) return;
  const record = (chk.searches || []).some((s) => s.status === 'record' || s.outcome === 'record');
  chk.closedAt = o.at;
  chk.status = 'complete';
  chk.outcome = record ? 'adverse_possible' : 'clear';
  store.markDirty();

  work(store, ctx, app, {
    at: o.at, state: app.state, step: 10, owner: 'system',
    actorType: 'external', actor: 'Screening agency', handoff: true,
    detail: record ? 'A search returned a record. Nothing advances on this until a person has run the notice sequence.'
                   : 'All searches returned clear.',
    ref: chk.id
  });

  if (record) {
    EV.raiseException(store, ctx, {
      at: o.at, applicationId: app.id, candidateId: app.candidateId,
      kind: 'adverse_review', severity: 'crit', blocksProgress: true,
      title: 'A background check returned a record',
      detail: 'Under 15 U.S.C. 1681b(b)(3) a pre-adverse notice with a copy of the report and the summary ' +
              'of rights goes out first, then a reasonable period passes, and only then may adverse action ' +
              'be taken. That gap is tenant policy because the statute sets no number.',
      owner: 'human',
      nextAction: 'Send the pre-adverse notice, or clear the flag if the record does not bear on the role.'
    });
  }
}

function scheduleFirstShift(store, ctx, app, o) {
  const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
  const startsAt = o.startsAt || nextMonday(o.at);
  const noticeDays = Math.floor((startsAt - o.at) / DAY);
  /* This used to call COMPLY.noticeGate(noticeDays), which threw, so NO first
     shift could ever be placed. noticeGate is the automated-decision notice
     gate and takes a whole application: it has nothing to do with scheduling.

     Fourteen days is a GENERALISATION across the covered cities rather than one
     rule, and the string says so, because fair workweek notice periods differ
     by jurisdiction and none of our five stores is in one of them. */
  const FAIR_WORKWEEK_DAYS = 14;
  const premiumPayable = noticeDays < FAIR_WORKWEEK_DAYS;
  const row = {
    id: store.nextId('shf'), tenantId: ctx.tenantId,
    applicationId: app.id, candidateId: app.candidateId, storeId: app.storeId,
    startsAt, createdAt: o.at, noticeDays,
    /* A premium may be payable if the notice is short. Recorded rather than
       ignored, because ignoring it is the failure mode a fair workweek rule
       exists to catch. */
    kind: 'first_shift',
    noticeAt: o.at,
    premiumPayable,
    noticeBasis: 'Fourteen days, which is a generalisation across the cities that have a fair workweek ' +
                 'rule rather than any single one of them. None of the five stores in this dataset is in ' +
                 'a covered city, so this is tenant policy and not law here.',
    confirmState: 'not_confirmed'
  };
  store.insert('shifts', row);
  app.firstShiftId = row.id;
  store.markDirty();

  CONN.call(store, ctx, 'scheduling', 'write_shift', {
    startsAt, noticeDays, applicationId: app.id, candidateId: cand ? cand.id : null
  });

  work(store, ctx, app, {
    at: o.at, state: app.state, step: 15, owner: 'human',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    detail: 'First shift placed with ' + noticeDays + ' days notice' +
            (premiumPayable ? ', inside the fair workweek window, so a premium is payable.' : '.'),
    ref: row.id
  });
}

/* ----------------------------------------------------------- steps 17-20 --- */

/* STEP 16, NOT 17. This said 17, "Week one training on the floor", for an event
   whose own words are about the two post-start tasks. Six people had a step 17
   observation that was really their first day, and step 18 got the day-30
   check-in the same way, so the two funnel steps a manager owns after day one
   showed measured medians for work nothing in the product records. That is
   worse than an empty row: it is a number with nothing behind it.

   Both steps are now honestly empty. See the note in states.js on why there is
   no state for them either. */
function recordStart(store, ctx, app, o) {
  app.startedAt = o.at;
  store.markDirty();
  work(store, ctx, app, {
    at: o.at, state: 'STARTED', step: 16, owner: 'system',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null, handoff: true,
    detail: 'Started work. The two post-start tasks, I-9 section 2 and the E-Verify case, become due now.'
  });
}

/* The step comes from the state rather than a hand-typed map, which is what got
   DAY_30 stamped as step 18. One source for it. */
function checkIn(store, ctx, app, o) {
  work(store, ctx, app, {
    at: o.at, state: o.to, step: stepOf(o.to),
    owner: 'clock', actorType: 'system', actor: 'Workflow engine',
    detail: 'Still employed at ' + (o.to || '').replace('DAY_', 'day ') + '.'
  });
}

function recordTermination(store, ctx, app, o) {
  app.closedAt = o.at;
  store.markDirty();
  work(store, ctx, app, {
    at: o.at, state: 'TERMINATED', owner: 'human',
    actorType: 'human', actor: (ctx.actor && ctx.actor.name) || null,
    detail: o.reason || 'Employment ended.'
  });
}

function recordWithdrawal(store, ctx, app, o) {
  app.closedAt = o.at;
  store.markDirty();
  work(store, ctx, app, {
    at: o.at, state: 'WITHDRAWN', owner: 'system',
    actorType: o.actorType || 'external', actor: o.actor || 'Candidate',
    detail: o.reason || 'The candidate withdrew.'
  });
}

/* ------------------------------------------------------------ register --- */

registerEffects({
  recordEligibility, resolveHold, overrideIneligibility, notifyIneligible,
  createScreening, startScreening, completeScreening,
  openManagerInterview, scheduleManagerInterview, completeManagerInterview, recordInterviewNoShow,
  recordDecision,
  createOffer, sendOffer, acceptOffer, declineOffer,
  recordOfferExpiry, extendOffer, closeLapsedOffer,
  fanOutParallelWork, orderBackgroundCheck, closeBackgroundCheck, scheduleFirstShift,
  recordStart, checkIn, recordTermination, recordWithdrawal
});

/* Every effect the transition table names has to exist, and this checks it at
   load rather than at the moment a real candidate hits the one that is missing.
   It runs on import, so importing this file is the check. */
import { EFFECTS } from './engine.js';
import { TRANSITIONS } from '../../domain/states.js';

const named = Array.from(new Set(TRANSITIONS.map((t) => t.effect).filter(Boolean)));
const missing = named.filter((n) => !EFFECTS[n]);
if (missing.length) {
  throw new Error('the transition table names ' + missing.length + ' effect(s) that are not registered: ' +
                  missing.join(', ') + '. An unregistered effect is a move that silently does nothing.');
}

export const REGISTERED = Object.keys(EFFECTS).sort();
export const NAMED_BY_TABLE = named.sort();
