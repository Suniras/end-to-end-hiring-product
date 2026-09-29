/* ============================================================================
   engine.js  ·  the only way an application changes state

   THE ONE ENGINE. There is exactly one of these in the product and there will
   not be a second. The seven stages of a live screening call are a transport
   sub-state inside step 3, not a second engine: only their final stage calls
   into `transition` here, and the thirty-two application states stay
   thirty-two.

   THE CONTRACT, and all six parts of it have been load bearing at some point:

   1. A refused move RETURNS A REASON and writes an audit entry. It never
      silently does nothing. An interface that offers a button which quietly
      fails is worse than one that does not offer it.
   2. The actor allowlist is checked generically against the `by` list on the
      transition, not by special-casing the two that matter. So a transition
      added later is protected by construction.
   3. A guard that fails says WHAT IS OUTSTANDING, because "not allowed" is
      useless to somebody trying to unblock a real person.
   4. A blocking exception stops `settle`. It does not stop a human making a
      deliberate move, because the whole point of a blocking exception is that a
      person looks at it and decides.
   5. The actor picks the transition row, not the table order. Two rows may
      share a from and a to and differ in who may make the move. Taking the
      first row made both human ways out of a rehire hold unreachable while
      `allowedFor` in this same file offered them.
   6. A move the table marks needsReason is refused without one, before
      anything is written. A rejection with reason null next to an assessment
      recommending the candidate advance is the exhibit, and the product used to
      produce it.

   THE RULE THAT IS NOT OURS. A model may screen, summarise, cite evidence and
   recommend. It may move somebody forward TO a decision. It may never approve
   and it may never reject. Those transitions carry by: ['human'] in the table
   and this file has no path around them.
   ============================================================================ */

import { STATES, TRANSITIONS, findTransitions, movesFrom, movesFor,
         stepOf, ownerOf, label, isTerminal,
         ONBOARDING_TASKS, PRE_SHIFT_TASKS } from '../../domain/states.js';
import * as EV from './events.js';
import { HOUR } from './clock.js';

/* A reason has to be a sentence rather than a keystroke. Twelve characters is a
   floor to stop "ok" and "no", it is a product choice with NO SOURCE behind the
   number, and it is not a legal threshold for anything. */
const MIN_REASON_CHARS = 12;

/* How far ahead of an offer expiring the product starts asking somebody to
   chase. A product choice with no source. The window it counts back from is
   itself tenant policy rather than a statutory period, which is recorded on
   every offer row as expiryBasis. */
const CHASE_LEAD_MS = 24 * HOUR;

/* --------------------------------------------------------------- guards ---
   A guard answers one question: may this move happen yet. It returns true, or
   a sentence saying what is still outstanding. Never a bare false.
   ------------------------------------------------------------------------- */

export const GUARDS = {
  /* BOTH of these carry holdForPerson, and the reason is a real defect that was
     caught by review before it shipped.

     A do-not-rehire record sets passed:false with failedKeys ['rehire_eligibility']
     AND holdForPerson:true. Without the hold check, eligibilityFailed returns
     true, settle() follows the automatic edge, and the application is
     auto-moved to INELIGIBLE. That is a machine rejecting somebody on a prior
     employment record, which is precisely the outcome the hold mechanism
     exists to prevent, and the record may be wrong or may not even be theirs
     under a partial match.

     So a hold satisfies NEITHER guard. The automatic chain stops, the effect
     raises a blocking exception, and a person looks at it. */
  eligibilityPassed(store, ctx, app) {
    if (!app.eligibility) return 'Eligibility has not run yet.';
    if (app.eligibility.holdForPerson) {
      return 'Held for a person: ' + (app.eligibility.holdReason || 'a rule requires somebody to look at this') + '.';
    }
    return app.eligibility.passed === true ? true
      : 'Eligibility did not pass: ' + (app.eligibility.failedKeys || []).join(', ') + '.';
  },

  eligibilityFailed(store, ctx, app) {
    if (!app.eligibility) return 'Eligibility has not run yet.';
    if (app.eligibility.holdForPerson) {
      return 'Held for a person, so nothing may auto-reject this: ' +
             (app.eligibility.holdReason || 'a rule requires somebody to look at this') + '.';
    }
    return app.eligibility.passed === false ? true : 'Eligibility passed, so this move does not apply.';
  },

  allRequiredScreeningsDone(store, ctx, app) {
    const req = store.where('screenings', ctx.tenantId, (s) => s.applicationId === app.id && s.required);
    if (!req.length) return 'No required screening exists on this application yet.';
    const open = req.filter((s) => s.status !== 'complete');
    if (!open.length) return true;
    return open.length === 1
      ? 'Waiting on the ' + describeScreening(open[0]) + '.'
      : 'Waiting on ' + open.length + ' screenings: ' + open.map(describeScreening).join(', ') + '.';
  },

  /* THE CALL, and only the call. This guard exists because
     allRequiredScreeningsDone was on the way out of SCREENING_IN_PROGRESS,
     where it also asked for the manager interview, and three of the eight
     requisitions require one. An application for the first job on the careers
     page could therefore not leave SCREENING_IN_PROGRESS at all: the move was
     refused with "Waiting on the manager interview", and nothing in the product
     could complete a manager interview. Step 3 is the behavioural screening, so
     the honest question on the way out of it is whether the call is done. */
  callScreeningDone(store, ctx, app) {
    const calls = store.where('screenings', ctx.tenantId,
      (s) => s.applicationId === app.id && s.required && s.kind === 'call');
    if (!calls.length) return 'No screening call exists on this application yet.';
    const open = calls.filter((s) => s.status !== 'complete');
    if (!open.length) return true;
    return 'Waiting on the ' + describeScreening(open[0]) + '.';
  },

  /* Is a manager interview the thing that is left. Answering yes is what sends
     the application to steps 4 and 5 instead of to a decision. */
  managerInterviewOutstanding(store, ctx, app) {
    const open = store.where('screenings', ctx.tenantId,
      (s) => s.applicationId === app.id && s.required &&
             s.kind === 'manager_interview' && s.status !== 'complete');
    if (!open.length) return 'No manager interview is outstanding on this application.';
    return true;
  },

  /* The offer window. Read off the offer row, because expiresAt is written
     there with the basis beside it, and for months nothing read either. */
  offerWindowPassed(store, ctx, app) {
    const off = store.byId('offers', ctx.tenantId, app.offerId);
    if (!off) return 'There is no offer on this application.';
    if (off.expiresAt == null) return 'This offer has no expiry on it.';
    if (off.respondedAt != null) return 'The candidate has already answered.';
    const now = ctx.clock.now();
    if (now >= off.expiresAt) return true;
    const left = Math.max(0, off.expiresAt - now);
    return 'The offer has ' + Math.round(left / HOUR) + ' hours left on it.';
  },

  allSearchesReturned(store, ctx, app) {
    const chk = store.first('backgroundChecks', ctx.tenantId, (c) => c.applicationId === app.id);
    if (!chk) return 'No background check has been ordered.';
    const out = (chk.searches || []).filter((s) => s.status !== 'returned' && s.status !== 'clear' && s.status !== 'record');
    if (!out.length) return true;
    return out.length + ' of ' + chk.searches.length + ' searches have not returned: ' +
           out.map((s) => s.name || s.kind).join(', ') + '.';
  },

  /**
   * Is the FCRA paperwork on file before a consumer report is procured.
   *
   * 15 U.S.C. 1681b(b)(2)(A) requires a clear and conspicuous written
   * disclosure in a document consisting solely of the disclosure, and the
   * consumer's written authorisation, before the report is procured. Nothing in
   * this build has a signing step, so nothing satisfies this yet.
   *
   * NOT ATTACHED TO A TRANSITION, DELIBERATELY, and this comment is the reason
   * so nobody attaches it by accident. The signing step needs a route and a
   * screen that are not in this file, and the seeded history replays fifteen
   * checks through the real engine, so putting it on
   * BACKGROUND_CHECK_PENDING to BACKGROUND_CHECK_IN_PROGRESS today stops the
   * dataset building at the first one. It is live code rather than a comment
   * because orderBackgroundCheck calls it to write the gap into the audit
   * trail, which is also how attaching it later becomes a one word change.
   */
  fcraAuthorisationOnFile(store, ctx, app) {
    const f = app.fcra || {};
    if (!f.authorisationSignedAt) {
      return 'The candidate has not signed the written authorisation, so no report may be ordered. ' +
             'FCRA 15 U.S.C. 1681b(b)(2)(A).';
    }
    if (!f.disclosureSignedAt) {
      return 'The standalone disclosure has not been signed, so no report may be ordered. ' +
             'FCRA 15 U.S.C. 1681b(b)(2)(A) requires a document consisting solely of the disclosure.';
    }
    return true;
  },

  preShiftTasksDone(store, ctx, app) {
    const tasks = store.where('onboardingTasks', ctx.tenantId, (t) => t.applicationId === app.id);
    const pre = tasks.filter((t) => PRE_SHIFT_TASKS.indexOf(t.key) >= 0);
    if (!pre.length) return 'No onboarding tasks exist on this application yet.';
    /* A carried-forward task is written as complete with the carry recorded
       beside it, so this test is right. It is stated explicitly because the
       first version of the fan-out wrote 'carried_forward' as a status, this
       guard counted it as open, and a returning worker could then never reach a
       first shift. Either the writer or this guard had to change and the writer
       did, because the work genuinely is done. */
    const open = pre.filter((t) => t.status !== 'complete');
    if (!open.length) return true;
    return open.length + ' of ' + pre.length + ' pre-shift tasks are open: ' +
           open.map((t) => t.name || t.key).join(', ') + '.';
  },

  thirtyDaysElapsed: (s, c, a) => elapsedSinceStart(c, a, 30),
  sixtyDaysElapsed:  (s, c, a) => elapsedSinceStart(c, a, 60),
  ninetyDaysElapsed: (s, c, a) => elapsedSinceStart(c, a, 90)
};

function describeScreening(s) {
  return (s.kind === 'manager_interview' ? 'manager interview' : 'screening call') +
         (s.status && s.status !== 'pending' ? ' (' + s.status.replace(/_/g, ' ') + ')' : '');
}

function elapsedSinceStart(ctx, app, days) {
  if (!app.startedAt) return 'They have not started work yet.';
  const due = app.startedAt + days * 86400000;
  const now = ctx.clock.now();
  if (now >= due) return true;
  const left = Math.ceil((due - now) / 86400000);
  return 'Day ' + days + ' is ' + left + ' day' + (left === 1 ? '' : 's') + ' away.';
}

/* --------------------------------------------------------------- effects ---
   An effect is what actually happens when a move is made. Effects are resolved
   by name from this registry, so the transition table stays data and a typo in
   an effect name is a loud failure rather than a silent no-op.
   ------------------------------------------------------------------------- */

export const EFFECTS = {};

/** Registered from the modules that own them, so this file does not grow to
    hold the whole domain. An unregistered effect throws when it fires. */
export function registerEffects(map) {
  Object.keys(map).forEach((k) => {
    if (EFFECTS[k]) throw new Error('effect "' + k + '" is already registered. Two owners for one effect is how they diverge.');
    EFFECTS[k] = map[k];
  });
}

/* ------------------------------------------------------------ the checks --- */

/** Every open exception on an application that stops progress. */
export function blockingExceptions(store, ctx, applicationId) {
  return store.where('exceptions', ctx.tenantId,
    (e) => e.applicationId === applicationId && e.blocksProgress && !e.resolvedAt);
}

/**
 * The adverse action bar.
 *
 * While somebody is contesting a background check finding or an E-Verify
 * mismatch, five things may not happen to them. Two of the five happen in this
 * product and are guarded here. The other three happen in the retailer's own
 * systems, which we connect to rather than own, which is why the bar also has
 * to be VISIBLE before an action is attempted rather than only refused when it
 * is. U-46.
 */
export function adverseActionBlock(store, ctx, app, toState) {
  const open = store.where('exceptions', ctx.tenantId,
    (e) => e.applicationId === app.id && !e.resolvedAt &&
           (e.kind === 'adverse_review' || e.kind === 'everify_mismatch'));
  if (!open.length) return null;
  /* OFFER_LAPSED is on this list because closing somebody's application is an
     adverse action under another name, and a route that could not reject them
     must not be able to close them instead. The two states cannot meet today,
     since a check is only ordered after acceptance, and a bar that depends on
     an unreachable path staying unreachable is not a bar. */
  const BARRED = ['REJECTED', 'TERMINATED', 'OFFER_LAPSED'];
  if (BARRED.indexOf(toState) < 0) return null;
  const e = open[0];
  return {
    barred: true,
    because: e.kind,
    exceptionId: e.id,
    reason: e.kind === 'everify_mismatch'
      ? 'While a tentative nonconfirmation is being contested, the person may not be dismissed, ' +
        'suspended, have their pay cut, have training withheld, or be taken off the rota. ' +
        'E-Verify User Manual section 2. This move is one of those, so it is refused.'
      : 'The pre-adverse notice has been sent and the statutory gap has not elapsed. ' +
        'Under 15 U.S.C. 1681b(b)(3) the adverse action may not be taken until the person has had ' +
        'a reasonable period to dispute the report. This move is that action, so it is refused.'
  };
}

/**
 * The shift removal check. The second half of the same bar.
 *
 * Taking somebody off the rota while they are contesting a tentative
 * nonconfirmation is one of the five things the E-Verify User Manual forbids,
 * and compliance.js is right that it is the quiet version of the violation: a
 * manager who does not understand a mismatch simply stops scheduling the
 * person. Removing a shift is not a state change, so `transition` above never
 * sees it and the bar there cannot catch it.
 *
 * WHY THIS FUNCTION EXISTS AT ALL. compliance.js declares shift removal
 * `guarded: true, guardedBy: 'the shift removal check, which the scheduling
 * action and the remove_shift tool both call'`, and review found that the check
 * did not exist anywhere in the product. A screen that tells a manager an
 * action is guarded, when it is not, induces reliance and is worse than a
 * screen that says nothing. So the check is written here, beside the bar it
 * belongs to, and the two callers named in that claim have to call it. Until
 * they do, the claim is still wrong and the honest fix in the meantime is
 * `guarded: false` with a whyNot. See the handoff.
 *
 * Returns null when the removal is allowed, or the refusal with its reason.
 */
export function shiftRemovalBlock(store, ctx, applicationId) {
  const app = store.byId('applications', ctx.tenantId, applicationId);
  if (!app) return null;
  const open = store.where('exceptions', ctx.tenantId,
    (e) => e.applicationId === app.id && !e.resolvedAt &&
           (e.kind === 'everify_mismatch' || e.kind === 'adverse_review'));
  if (!open.length) return null;
  const e = open[0];
  return {
    barred: true,
    because: e.kind,
    exceptionId: e.id,
    reason: e.kind === 'everify_mismatch'
      ? 'This person is contesting a tentative nonconfirmation. Taking them off the rota is one of the ' +
        'five things barred until the case reaches a Final Nonconfirmation, and holding back a first ' +
        'shift counts as taking them off it. E-Verify User Manual section 2. So this removal is refused.'
      : 'The pre-adverse notice has been sent and the statutory gap has not elapsed. Removing scheduled ' +
        'shifts is adverse action taken before the person has had a reasonable period to dispute the ' +
        'report, under 15 U.S.C. 1681b(b)(3). So this removal is refused.'
  };
}

/* ----------------------------------------------------------- transition --- */

/**
 * Move one application. The only way state changes.
 *
 * Returns { ok: true, from, to, app, events } or
 *         { ok: false, reason, allowed } where `allowed` is what this actor
 *         could do instead, because a refusal that does not say what is
 *         possible sends somebody hunting.
 */
export function transition(store, ctx, applicationId, toState, opts) {
  const o = opts || {};
  const app = store.byId('applications', ctx.tenantId, applicationId);
  if (!app) return refuse(store, ctx, null, toState, 'No such application.', []);

  const from = app.state;
  const actorType = (ctx.actor && ctx.actor.type) || 'system';

  if (!STATES[toState]) {
    return refuse(store, ctx, app, toState, 'There is no workflow state called ' + toState + '.', allowedFor(from, actorType));
  }
  if (from === toState) {
    return refuse(store, ctx, app, toState, 'It is already at ' + label(from) + '.', allowedFor(from, actorType));
  }

  /* ROWS, PLURAL, AND THE ACTOR PICKS ONE. A from and a to may appear twice
     where the same move means different things depending on who makes it: the
     system following the eligibility rules, and a person overruling them. This
     used to take the first matching row, which is the system's, so both human
     ways out of a rehire hold were refused with "this move can only be made by:
     system" while allowedFor() in this same file listed them as the manager's
     to make. Trevor Boone sat in that hold with no way out of it. */
  const rows = findTransitions(from, toState);
  if (!rows.length) {
    const legal = movesFrom(from).map((x) => label(x.to));
    return refuse(store, ctx, app, toState,
      label(from) + ' cannot move to ' + label(toState) + '. ' +
      (legal.length ? 'The legal moves from here are: ' + legal.join(', ') + '.' : 'Nothing follows this state.'),
      allowedFor(from, actorType));
  }

  /* The allowlist, checked generically, against every row for the move. */
  const t = rows.find((r) => r.by.indexOf(actorType) >= 0);
  if (!t) {
    const by = Array.from(new Set(rows.reduce((acc, r) => acc.concat(r.by), [])));
    const who = by.length === 1 && by[0] === 'human'
      ? 'Only a named person can make this move, and this request came from ' + describeActor(ctx) + '. ' +
        'That is not a configuration choice: a hiring decision made by software is an automated ' +
        'employment decision, which this product is built not to make.'
      : 'This move can only be made by: ' + by.join(', ') + '. This request came from ' + describeActor(ctx) + '.';
    return refuse(store, ctx, app, toState, who, allowedFor(from, actorType));
  }

  /* THE REASON, where the table asks for one. Refused before anything is
     written, because a decision row with reason null is the exhibit. The
     employer's burden under McDonnell Douglas is to articulate a legitimate
     non-discriminatory reason, and a rejection recorded with no reason beside
     an assessment recommending the candidate advance cannot. */
  if (t.needsReason) {
    const given = typeof o.reason === 'string' ? o.reason.trim() : '';
    if (given.length < MIN_REASON_CHARS) {
      return refuse(store, ctx, app, toState,
        'This move needs a reason in writing, and ' +
        (given ? 'what was given is too short to be one' : 'none was given') + '. ' +
        'It goes on the record against ' + describeActor(ctx) + ' and it is what the decision has to be ' +
        'explained by later. At least ' + MIN_REASON_CHARS + ' characters.',
        allowedFor(from, actorType));
    }
  }

  /* The adverse action bar, before the guard, because it is a prohibition
     rather than a precondition and the distinction matters in the reason. */
  const bar = adverseActionBlock(store, ctx, app, toState);
  if (bar) return refuse(store, ctx, app, toState, bar.reason, allowedFor(from, actorType), { bar });

  if (t.guard) {
    const g = GUARDS[t.guard];
    if (!g) throw new Error('transition ' + from + ' -> ' + toState + ' names guard "' + t.guard + '" which is not registered.');
    const verdict = g(store, ctx, app);
    if (verdict !== true) {
      return refuse(store, ctx, app, toState, String(verdict), allowedFor(from, actorType));
    }
  }

  /* A deliberate human move past a blocking exception is allowed, because that
     is what a person looking at it is for. An automatic move is not, and
     `settle` never gets this far. Either way it is recorded. */
  const blocked = blockingExceptions(store, ctx, app.id);
  if (blocked.length && actorType !== 'human') {
    return refuse(store, ctx, app, toState,
      'Blocked by ' + (blocked.length === 1 ? 'an exception' : blocked.length + ' exceptions') + ': ' +
      blocked.map((e) => e.title).join('; ') + '. A person has to look at that first.',
      allowedFor(from, actorType));
  }

  const at = o.at != null ? o.at : ctx.clock.now();
  app.state = toState;
  app.stateSince = at;
  app.updatedAt = at;
  if (isTerminal(toState) && !app.closedAt) app.closedAt = at;
  store.markDirty();

  const events = [];
  events.push(EV.workflowEvent(store, ctx, {
    applicationId: app.id, candidateId: app.candidateId, storeId: app.storeId,
    requisitionId: app.requisitionId,
    at, kind: 'enter', state: toState, fromState: from,
    step: stepOf(toState), owner: ownerOf(toState),
    actorType, actor: (ctx.actor && ctx.actor.name) || null,
    handoff: ownerOf(from) !== ownerOf(toState),
    durationMs: o.workMs != null ? o.workMs : null,
    detail: o.reason || null
  }));

  EV.auditEvent(store, ctx, {
    action: 'application.transition', at,
    actorType, actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'application', subjectId: app.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: o.reason || null,
    detail: { from, to: toState, auto: !!o.auto },
    source: o.source || 'ui'
  });

  if (blocked.length) {
    EV.auditEvent(store, ctx, {
      action: 'application.transition.overrode_block', at,
      actorType, actor: (ctx.actor && ctx.actor.name) || null,
      subjectType: 'application', subjectId: app.id, applicationId: app.id,
      why: 'A person moved this on with ' + blocked.length + ' blocking exception(s) open: ' +
           blocked.map((e) => e.id).join(', ') + '.',
      source: o.source || 'ui'
    });
  }

  if (t.effect) {
    const fn = EFFECTS[t.effect];
    if (!fn) throw new Error('transition ' + from + ' -> ' + toState + ' names effect "' + t.effect + '" which is not registered.');
    fn(store, ctx, app, Object.assign({ at, from, to: toState }, o));
  }

  return { ok: true, from, to: toState, app, events, label: label(toState) };
}

function describeActor(ctx) {
  const a = ctx.actor || {};
  if (a.type === 'agent') return 'the AI assistant';
  if (a.type === 'system') return 'the system';
  if (a.type === 'external') return 'an outside system';
  return a.name ? a.name : 'a person';
}

/* needsReason travels with the move so a surface can ask for the reason before
   offering the button, rather than offering it and being refused. */
function allowedFor(from, actorType) {
  return movesFor(from, actorType).map((t) => ({
    to: t.to, label: label(t.to), needs: t.guard || null, needsReason: !!t.needsReason
  }));
}

function refuse(store, ctx, app, toState, reason, allowed, extra) {
  if (app) {
    EV.auditEvent(store, ctx, {
      action: 'application.transition',
      actorType: (ctx.actor && ctx.actor.type) || 'system',
      actor: (ctx.actor && ctx.actor.name) || null,
      subjectType: 'application', subjectId: app.id,
      applicationId: app.id, candidateId: app.candidateId,
      why: reason,
      detail: { from: app.state, to: toState },
      outcome: 'refused', source: 'ui'
    });
  }
  return Object.assign({ ok: false, reason, allowed: allowed || [] }, extra || {});
}

/* -------------------------------------------------------------- settle ---
   Follow the automatic edges until something needs a person, a clock or the
   outside world. This is how an application arrives somewhere useful rather
   than sitting one state behind where it should be.
   ------------------------------------------------------------------------- */

export function settle(store, ctx, applicationId, depth) {
  const d = depth || 0;
  /* Bounded, because a cycle of AUTOMATIC edges would otherwise be an infinite
     loop in a request. The table has no such cycle and this makes sure a new
     one is a loud failure rather than a hung request.

     Two pairs of states do go both ways as of 8 September, and neither is a
     problem here because settle only ever follows an automatic edge. A no-show
     sends a booked interview back to needing a slot, and extending an offer
     sends an expired one back to sent. Both of those moves are a person's. */
  if (d > 24) {
    return { moved: [], stoppedBecause: 'The automatic chain ran past twenty-four moves, which means the transition table has a cycle.' };
  }

  const app = store.byId('applications', ctx.tenantId, applicationId);
  if (!app) return { moved: [], stoppedBecause: 'No such application.' };

  /* A blocking exception stops the automatic chain dead. It does not stop a
     person. */
  const blocked = blockingExceptions(store, ctx, app.id);
  if (blocked.length) {
    return { moved: [], stoppedBecause: 'Blocked: ' + blocked.map((e) => e.title).join('; ') + '.',
             blockedBy: blocked.map((e) => ({ id: e.id, kind: e.kind, title: e.title })) };
  }

  const auto = movesFrom(app.state).filter((t) => t.auto && t.by.indexOf('system') >= 0);
  if (!auto.length) {
    return { moved: [], stoppedBecause: whyStopped(store, ctx, app) };
  }

  /* Try each automatic edge in table order. The first whose guard passes wins,
     which is how eligibility passing and failing share a source state. */
  const sys = Object.assign({}, ctx, { actor: { type: 'system', name: 'Workflow engine' } });
  for (const t of auto) {
    if (t.guard) {
      const g = GUARDS[t.guard];
      if (!g) throw new Error('guard "' + t.guard + '" is not registered');
      if (g(store, sys, app) !== true) continue;
    }
    const r = transition(store, sys, app.id, t.to, { auto: true, source: 'workflow' });
    if (!r.ok) continue;
    const rest = settle(store, ctx, app.id, d + 1);
    return { moved: [{ from: r.from, to: r.to }].concat(rest.moved),
             stoppedBecause: rest.stoppedBecause, blockedBy: rest.blockedBy };
  }
  return { moved: [], stoppedBecause: whyStopped(store, ctx, app) };
}

/**
 * Why it is sitting here. This is the sentence the whole product is about, so
 * it is derived rather than written per surface.
 */
function whyStopped(store, ctx, app) {
  const s = STATES[app.state];
  if (!s) return 'Unknown state.';
  if (s.terminal) {
    /* A terminal state a person can still move out of is not the same as one
       nobody can. INELIGIBLE is closed by software and reopened by a person,
       and saying only "this is the end" hides the one thing left to do. */
    const out = movesFor(app.state, 'human').filter((t) => t.to !== 'WITHDRAWN');
    return label(app.state) + ' is the end of this application.' +
      (out.length ? ' A person can still move it to ' + out.map((t) => label(t.to)).join(' or ') + '.' : '');
  }
  if (s.waitingOn) {
    return 'Waiting on ' + (s.waitingOn === 'candidate' ? 'the candidate'
      : s.waitingOn === 'agency' ? 'the screening agency'
      : s.waitingOn === 'government' ? 'a government department' : s.waitingOn) + '.';
  }
  /* The state's own sentence where it has one. "A person has to act" was true
     of every human-owned state and told nobody which act, which is how an
     application waiting on a manager interview read as the AI still working. */
  if (s.owner === 'human') return s.humanNeeds || 'A person has to act.';
  if (s.owner === 'clock') return 'A fixed wait that nobody can compress.';

  /* Something is automatic but its guard is not satisfied, and the guard's own
     sentence is the best answer available. */
  const auto = movesFrom(app.state).filter((t) => t.auto);
  for (const t of auto) {
    if (!t.guard) continue;
    const v = GUARDS[t.guard](store, ctx, app);
    if (v !== true) return String(v);
  }
  return 'Nothing automatic follows ' + label(app.state) + '.';
}

/* ----------------------------------------------------------------- tick ---
   What the passing of time does.

   settle() is per application and only runs when somebody asks about that one
   application. So every guard that reads the clock, the offer window and the
   thirty, sixty and ninety day marks, could only fire if a request happened to
   touch that person. Three seeded offers expire inside a day of the opening
   screen and all three read as live pipeline for ever, because nothing ever
   asked.

   This is the one place that asks for everybody. It moves nothing by itself: it
   raises the warning that something is about to lapse and then calls settle,
   which follows the same automatic edges under the same guards as always.
   Nothing here fakes anything, which is the same rule the clock controls carry.
   ------------------------------------------------------------------------- */

export function tick(store, ctx) {
  const apps = store.where('applications', ctx.tenantId, (a) => !isTerminal(a.state));
  const raised = [];
  const moved = [];

  apps.forEach((app) => {
    const warn = offerAboutToExpire(store, ctx, app);
    if (warn) raised.push(warn);
    const slow = searchesRunningLate(store, ctx, app);
    if (slow) raised.push(slow);
    const r = settle(store, ctx, app.id);
    if (r.moved && r.moved.length) moved.push({ applicationId: app.id, moved: r.moved });
  });

  return { checked: apps.length, raised, moved };
}

/**
 * The chase, before the window closes rather than after.
 *
 * One exception per offer, and it does NOT block progress: a chase is work to
 * do, not a reason to stop. Blocking here would stop the automatic chain for an
 * application whose only problem is that somebody has not rung the candidate.
 */
function offerAboutToExpire(store, ctx, app) {
  if (app.state !== 'OFFER_SENT') return null;
  const off = store.byId('offers', ctx.tenantId, app.offerId);
  if (!off || off.expiresAt == null || off.respondedAt != null) return null;
  const now = ctx.clock.now();
  const left = off.expiresAt - now;
  if (left <= 0 || left > CHASE_LEAD_MS) return null;

  const already = store.first('exceptions', ctx.tenantId,
    (e) => e.applicationId === app.id && e.kind === 'offer_expiring' && !e.resolvedAt);
  if (already) return null;

  const hours = Math.max(1, Math.round(left / HOUR));
  return EV.raiseException(store, ctx, {
    at: now, applicationId: app.id, candidateId: app.candidateId,
    kind: 'offer_expiring', severity: 'warn', blocksProgress: false,
    title: 'An offer expires in ' + hours + ' hour' + (hours === 1 ? '' : 's'),
    detail: 'The offer window is three days and it is tenant policy rather than a statutory period. ' +
            'It closes at ' + new Date(off.expiresAt).toISOString() + '. Nobody has answered yet.',
    owner: 'human',
    nextAction: 'Chase the candidate, or extend the offer and record who extended it.'
  });
}

/**
 * A county search that has taken longer than we expected it to.
 *
 * THE EXPECTATION IS OURS AND THE WORDING SAYS SO. There is no statutory
 * deadline on a county court and no vendor publishes one, so `expectedMs` is a
 * deterministic figure this build spreads per county and nothing more. It gets
 * visibly weaker treatment than a legal deadline: a warning, not a block, and a
 * sentence that names whose expectation it is. U-45.
 *
 * One open exception per application rather than per search. The action is the
 * same whether one county is slow or three, and the searches themselves carry
 * which is which.
 */
function searchesRunningLate(store, ctx, app) {
  if (app.state !== 'BACKGROUND_CHECK_IN_PROGRESS') return null;
  const chk = store.byId('backgroundChecks', ctx.tenantId, app.backgroundCheckId);
  if (!chk || chk.orderedAt == null) return null;
  const now = ctx.clock.now();
  const late = (chk.searches || []).filter((s) =>
    s.status !== 'returned' && s.status !== 'clear' && s.status !== 'record' &&
    s.expectedMs != null && (now - chk.orderedAt) > s.expectedMs);
  if (!late.length) return null;

  const already = store.first('exceptions', ctx.tenantId,
    (e) => e.applicationId === app.id && e.kind === 'check_delayed' && !e.resolvedAt);
  if (already) return null;

  const names = late.map((s) => s.name || s.kind);
  const worst = Math.max.apply(null, late.map((s) => (now - chk.orderedAt) - s.expectedMs));
  return EV.raiseException(store, ctx, {
    at: now, applicationId: app.id, candidateId: app.candidateId,
    kind: 'check_delayed', severity: 'warn', blocksProgress: false,
    title: names.length === 1
      ? 'A search is slower than we expected'
      : names.length + ' searches are slower than we expected',
    detail: names.join(', ') + '. Over our own expectation by ' + Math.round(worst / HOUR) + ' hours. ' +
            'That expectation is ours: no statute sets a time for a county court and no agency publishes ' +
            'one, so this is a prompt to chase rather than a deadline anybody has missed.',
    owner: 'human',
    nextAction: 'Chase the agency for the outstanding searches.'
  });
}

/* --------------------------------------------------------------- lookups --- */

export { label, stepOf, ownerOf, isTerminal, STATES, TRANSITIONS, ONBOARDING_TASKS, PRE_SHIFT_TASKS };
export { movesFrom, movesFor } from '../../domain/states.js';
