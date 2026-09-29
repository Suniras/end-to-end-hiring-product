/* ============================================================================
   livecall.js  ·  the seven stages of a screening call

   WHAT THIS IS FOR. U-34 says the live view shows stages rather than content:
   invited, opened, connected, in progress with a running timer, ended, scoring,
   scored. That is the screen's whole job for the three to five minutes the call
   takes, and it needs somewhere for the stages to live. This is that place.

   IT IS NOT A SECOND WORKFLOW ENGINE and it must never become one. The twenty
   seven application states are untouched, step 3 still has three of them, and a
   stage here is a transport sub-state INSIDE step 3. Two stages hand to the one
   engine and no more: `connected`, because a call somebody answered genuinely
   is a screening in progress and the state table has no edge from queued to
   complete, and `scored`, because that is the end of the call.

   THE DEFECT THIS FILE WAS REBUILT TO FIX. U-34's stages existed in an earlier
   build and were lost when the app was rebuilt. What was left was one status,
   `invited`, assigned inline in a route, so the live view had one thing to show
   and no order to show it in. Nothing else in the product set any of the other
   six. Do not delete this file again: the screening page is where the demo
   happens and the stages are what it renders.

   THE OTHER DEFECT, and it is the reason `advance` refuses more than it looks
   like it should. An independent review pointed the product at a host serving a
   maintenance page, and the product recorded a live screening call, under the
   agent's name, in the audit trail, for a call that was never placed. So the
   three stages that assert the provider said something (`connected`,
   `in_progress`, `ended`) will not be written without the provider's own status
   string passed in as evidence. A stage nobody can trace to a provider read is
   refused with a reason.

   THE CONTRACT, copied from engine.js deliberately, because a second mechanism
   with different manners is how a product starts lying in one corner.
   A refused move RETURNS A REASON and writes an audit entry. It never silently
   does nothing. Every stage writes a workflow event, so the timeline and the
   metrics see the call. Every stage carries the transport that actually ran, so
   a simulated call can never read as a live one.

   TIME. Every `at` written here comes from the product's own clock. The
   provider's start_time and end_time are real wall clock, and the product's
   present is anchored in August 2026, so mixing them puts events weeks apart
   and every derived duration becomes nonsense. Provider timestamps are kept
   under `provider` on the stage entry and are never used as event times.
   ============================================================================ */

import * as EV from './events.js';
import * as WF from './engine.js';
import * as AGENTX from './agentx.js';

/* ------------------------------------------------------------- the table ---
   In order. `status` is what goes on `screening.status`, because the product
   has one status field and U-34 asked for the sequence to live in it.

   `scored` writes 'complete' rather than 'scored', and that is not a typo. The
   engine's `allRequiredScreeningsDone` guard tests `status !== 'complete'`, so
   a terminal status by any other name strands every live application at
   SCREENING_IN_PROGRESS for ever. The stage keeps its own name for the view.
   -------------------------------------------------------------------------- */

export const STAGES = [
  {
    key: 'invited', status: 'invited',
    label: 'Invited',
    means: 'The call has been asked for. Nothing has happened at the provider yet.',
    from: ['pending', null],
    by: ['system', 'agent', 'human'],
    needsProviderEvidence: false
  },
  {
    key: 'opened', status: 'opened',
    label: 'Opened',
    means: 'The candidate has opened the call, or the provider has started dialling.',
    from: ['invited'],
    by: ['system', 'agent', 'external'],
    needsProviderEvidence: false
  },
  {
    key: 'connected', status: 'connected',
    label: 'Connected',
    means: 'The provider reports somebody is on the call.',
    from: ['invited', 'opened'],
    by: ['system', 'agent'],
    needsProviderEvidence: true,
    /* The one place other than the final stage that touches the application. */
    enters: 'SCREENING_IN_PROGRESS'
  },
  {
    key: 'in_progress', status: 'in_progress',
    label: 'In progress',
    means: 'The conversation is running.',
    from: ['connected'],
    by: ['system', 'agent'],
    needsProviderEvidence: true,
    timer: true
  },
  {
    key: 'ended', status: 'ended',
    label: 'Ended',
    means: 'The call is over. Nothing has been read back yet.',
    /* From anywhere before it, because a call can fail, ring out or be hung up
       at any point, and pretending it can only end from in progress would make
       a ring-no-reply unrecordable. */
    from: ['invited', 'opened', 'connected', 'in_progress'],
    by: ['system', 'agent'],
    needsProviderEvidence: true
  },
  {
    key: 'scoring', status: 'scoring',
    label: 'Scoring',
    means: 'Reading the transcript back and running both readers.',
    from: ['ended', 'awaiting_evaluation'],
    by: ['system', 'agent'],
    needsProviderEvidence: false
  },
  {
    key: 'scored', status: 'complete',
    label: 'Scored',
    means: 'Both readings are stored and a person can read them.',
    from: ['scoring'],
    by: ['system', 'agent'],
    needsProviderEvidence: false,
    enters: 'SCREENING_COMPLETE',
    terminal: true
  }
];

const BY_KEY = {};
STAGES.forEach((s) => { BY_KEY[s.key] = s; });

/* A replayed seeded screening never had a transport, so it never had an
   invitation, an opening or a connection. Its two statuses are read as the
   stages they are equivalent to, so the live view can render a replay without
   inventing three stages that did not happen. */
const REPLAY_EQUIVALENT = { awaiting_evaluation: 'ended', complete: 'scored', in_progress: 'in_progress' };

/** Which stage a screening is at, or null when it has not been invited. */
export function stageOf(screening) {
  const st = screening && screening.status;
  if (!st || st === 'pending') return null;
  const direct = STAGES.find((s) => s.status === st);
  if (direct) return direct.key;
  return REPLAY_EQUIVALENT[st] || null;
}

function indexOfStage(key) {
  return STAGES.findIndex((s) => s.key === key);
}

/* ------------------------------------------------------------- advancing --- */

/**
 * Move one screening to one stage. The only way a live stage changes.
 *
 * Returns { ok: true, stage, entry } or { ok: false, reason, allowed }, where
 * `allowed` is the stages this actor could move to from here, because a refusal
 * that does not say what is possible sends somebody hunting.
 *
 * `opts.evidence` is where the claim came from, and it is required for the
 * three stages that assert the provider said something. Pass the provider's own
 * status string, for example 'provider_status:CONNECTED', or 'replay' for a
 * seeded conversation. Anything else is refused.
 */
export function advance(store, ctx, screening, toKey, opts) {
  const o = opts || {};
  const target = BY_KEY[toKey];
  const at = o.at != null ? o.at : ctx.clock.now();
  const actorType = (ctx.actor && ctx.actor.type) || 'system';
  const current = stageOf(screening);

  if (!target) {
    return refuse(store, ctx, screening, toKey,
      'There is no live call stage called ' + toKey + '. The stages are: ' +
      STAGES.map((s) => s.key).join(', ') + '.', current);
  }

  if (current === toKey) {
    return refuse(store, ctx, screening, toKey,
      'The call is already at ' + target.label + '.', current);
  }

  /* Order, checked against the stage's own `from` list rather than by index, so
     a stage added later is constrained by construction. */
  const fromStatus = (screening && screening.status) || null;
  const fromOk = target.from.indexOf(current) >= 0 || target.from.indexOf(fromStatus) >= 0;
  if (!fromOk) {
    return refuse(store, ctx, screening, toKey,
      'A call at ' + (current ? BY_KEY[current].label : 'queued') + ' cannot go to ' + target.label +
      '. ' + target.label + ' follows: ' + target.from.filter(Boolean).join(', ') + '.', current);
  }

  if (target.by.indexOf(actorType) < 0) {
    return refuse(store, ctx, screening, toKey,
      target.label + ' can only be set by: ' + target.by.join(', ') + '. This request came from ' +
      actorType + '.', current);
  }

  /* The maintenance-page defect. No provider read, no stage that claims one. */
  if (target.needsProviderEvidence && !o.evidence) {
    return refuse(store, ctx, screening, toKey,
      target.label + ' says the provider reported something, so it cannot be written without the ' +
      'provider read it came from. Pass the provider status as evidence.', current);
  }

  const transport = o.transport || (screening.call && screening.call.transport) || AGENTX.mode();
  const entry = {
    stage: target.key,
    at,
    /* live, fixture or simulated, on the row rather than worked out later from
       the environment, so a stage cannot change what it claims after the fact. */
    transport,
    evidence: o.evidence || null,
    detail: o.detail || null,
    /* Provider clock, kept apart from ours on purpose. See the header. */
    provider: o.provider || null
  };

  screening.live = screening.live || { stages: [] };
  screening.live.stages.push(entry);
  screening.live.stage = target.key;
  screening.live.transport = transport;
  /* The `scored` stage may find 'complete' already written, because evaluate()
     owns that word and the engine guard reads it. Recording the stage rather
     than fighting over the field is the point. */
  screening.status = target.status;
  if (target.key === 'connected' && !screening.startedAt) screening.startedAt = at;
  if (target.key === 'ended') {
    screening.endedAt = screening.endedAt || at;
    /* Measured from our own clock across the call, not taken from the
       provider's duration field. The provider's clock is real wall time and the
       product's present is anchored in August 2026, so its number would be
       right and useless. The provider's own figure is kept on the entry. */
    if (screening.durationMs == null && screening.startedAt != null) {
      screening.durationMs = Math.max(0, at - screening.startedAt);
    }
  }
  store.markDirty();

  EV.workflowEvent(store, ctx, {
    applicationId: screening.applicationId, candidateId: screening.candidateId,
    at, kind: 'work', state: stateForStage(target.key), step: 3, owner: 'agent',
    actorType, actor: (ctx.actor && ctx.actor.name) || 'agentX voice agent',
    /* Null on purpose. These are transport milestones, not measured work, and a
       made-up duration here would land in the manual-work metric. */
    durationMs: null,
    detail: 'Call stage: ' + target.label + ' [' + transport + ' transport]' +
            (o.detail ? '. ' + o.detail : '.'),
    ref: screening.id
  });

  EV.auditEvent(store, ctx, {
    at, action: 'screening.call.stage',
    actorType, actor: (ctx.actor && ctx.actor.name) || 'agentX voice agent',
    subjectType: 'screening', subjectId: screening.id,
    applicationId: screening.applicationId, candidateId: screening.candidateId,
    why: o.detail || target.means,
    detail: { from: current, to: target.key, transport, evidence: o.evidence || null },
    source: 'connector'
  });

  /* The hand-off to the one engine. Two stages do this and no others. */
  let moved = null;
  if (target.enters) {
    const app = store.byId('applications', ctx.tenantId, screening.applicationId);
    if (app && app.state !== target.enters) {
      const sys = Object.assign({}, ctx, { actor: { type: 'agent', name: 'agentX voice agent' } });
      const r = WF.transition(store, sys, app.id, target.enters, {
        at, source: 'connector',
        reason: 'The screening call reached ' + target.label + '.'
      });
      moved = r.ok ? { to: r.to } : { refused: r.reason };
    }
  }

  /* THIS DOES NOT SETTLE, and the order matters enough to write down. The
     engine refuses any non-human move while a blocking exception is open, so
     raising a score disagreement before this transition would strand the
     application at "screening in progress" while its screening said complete.
     U-13 is explicit that a disagreeing candidate parks at screening complete.
     So the caller advances to `scored` first, raises the exceptions second, and
     calls `settleAfter` third, where the open exception stops the automatic
     advance to the decision queue. That is B-07 working as written. */
  return { ok: true, stage: target.key, label: target.label, entry, moved };
}

/**
 * Follow the automatic edges after the call. Called once the exceptions the
 * call raised are in place, so a blocking one genuinely blocks.
 */
export function settleAfter(store, ctx, screening) {
  const app = store.byId('applications', ctx.tenantId, screening.applicationId);
  if (!app) return { moved: [], stoppedBecause: 'No application on this screening.' };
  const s = WF.settle(store, ctx, app.id);
  return { moved: s.moved.map((m) => m.to), stoppedBecause: s.stoppedBecause, blockedBy: s.blockedBy || null };
}

function refuse(store, ctx, screening, toKey, reason, current) {
  EV.auditEvent(store, ctx, {
    action: 'screening.call.stage',
    actorType: (ctx.actor && ctx.actor.type) || 'system',
    actor: (ctx.actor && ctx.actor.name) || null,
    subjectType: 'screening', subjectId: screening ? screening.id : null,
    applicationId: screening ? screening.applicationId : null,
    candidateId: screening ? screening.candidateId : null,
    why: reason,
    detail: { from: current, to: toKey },
    outcome: 'refused', source: 'connector'
  });
  return { ok: false, reason, allowed: allowedFrom(current, (ctx.actor && ctx.actor.type) || 'system') };
}

function allowedFrom(current, actorType) {
  return STAGES
    .filter((s) => s.key !== current && s.by.indexOf(actorType) >= 0 && s.from.indexOf(current) >= 0)
    .map((s) => ({ key: s.key, label: s.label, needsProviderEvidence: !!s.needsProviderEvidence }));
}

/** Which application state a stage sits inside, for the event row. */
function stateForStage(key) {
  if (key === 'invited' || key === 'opened') return 'SCREENING_PENDING';
  if (key === 'scored') return 'SCREENING_COMPLETE';
  return 'SCREENING_IN_PROGRESS';
}

/* ------------------------------------------------- reading the provider --- */

/* CallStatus from the live OpenAPI: RNR, CONNECTED, INITIATED, QUEUED, FAILED,
   IN_PROGRESS. Mapped to stages here and nowhere else, so one table decides
   what a provider word means to this product.

   RNR is ring no reply. FAILED and RNR are both ends, and neither of them ever
   reached a conversation, which is why the end reason is carried forward: a
   candidate who was never reached needs chasing, not scoring. */
const FROM_PROVIDER = {
  QUEUED: 'invited',
  INITIATED: 'opened',
  CONNECTED: 'connected',
  IN_PROGRESS: 'in_progress',
  RNR: 'ended',
  FAILED: 'ended'
};

function stageForProviderStatus(status) {
  return FROM_PROVIDER[String(status || '').toUpperCase()] || null;
}

/**
 * The stages to walk to catch up with the provider, in order.
 *
 * A poll every few seconds misses stages, and a live view that jumps from
 * invited to ended has lost the call's shape, so the gap is filled.
 *
 * BUT A FILLED STAGE MUST STILL BE TRUE, and this is a defect that was written
 * and caught in the same afternoon. The first version filled every stage
 * between where we were and where the provider said we are. On a ring-no-reply
 * that walked the call through `connected` and `in_progress` on the way to
 * `ended`, so a call nobody answered was recorded as connected, the application
 * moved to screening in progress, and the audit trail said a conversation
 * happened. A status that says the call never connected fills nothing: it goes
 * straight to `ended`, which is legal from anywhere before it.
 */
export function pathTo(current, providerStatus) {
  const target = stageForProviderStatus(providerStatus);
  if (!target) return [];
  const keys = STAGES.map((s) => s.key);
  const a = current ? keys.indexOf(current) : -1;
  const b = keys.indexOf(target);
  if (b < 0 || b <= a) return [];
  const v = String(providerStatus || '').toUpperCase();
  if (v === 'RNR' || v === 'FAILED') return ['ended'];
  return keys.slice(a + 1, b + 1);
}

/* True when the provider says this call is over, whatever happened on it.
   Delegated, because the provider's own status vocabulary belongs to the module
   that talks to the provider. A second copy of the terminal list here is how the
   two would come to disagree. */
export function providerSaysEnded(status) {
  return AGENTX.isTerminalStatus(status);
}

/**
 * Did the call ever reach a conversation. A ring-no-reply and a failure did
 * not, and the difference decides whether there is anything to score.
 */
export function reachedConversation(screening) {
  const stages = (screening && screening.live && screening.live.stages) || [];
  return stages.some((s) => s.stage === 'connected' || s.stage === 'in_progress');
}

/* ------------------------------------------------------------ the payload ---
   What the live view renders. U-34: least text, most signal, and the stages not
   yet reached are included so a live call says what it is waiting for rather
   than showing an empty row.
   -------------------------------------------------------------------------- */

export function sequence(store, ctx, screening) {
  const now = ctx.clock.now();
  const stages = (screening && screening.live && screening.live.stages) || [];
  const reachedAt = {};
  stages.forEach((s) => { if (reachedAt[s.stage] == null) reachedAt[s.stage] = s.at; });

  const current = stageOf(screening);
  const currentIndex = current ? indexOfStage(current) : -1;
  const replayed = screening && screening.conversationMode === 'replayed';

  /* A replay reached no transport stage, because no call was placed. Marking
     invited, opened and connected as reached on a replayed row would be the one
     dishonest element on the live view, so a replay starts at `ended`. */
  const firstReplayStage = indexOfStage('ended');

  const rows = STAGES.map((s, i) => {
    const at = reachedAt[s.key] != null ? reachedAt[s.key] : null;
    const isCurrent = s.key === current;
    return {
      key: s.key, label: s.label, means: s.means,
      reached: at != null || (replayed && i >= firstReplayStage && i <= currentIndex),
      at,
      current: isCurrent,
      /* Derived, never stored, and only for the stage that is running. A timer
         on a finished stage is a number nobody can check. */
      elapsedMs: isCurrent && s.timer && at != null ? Math.max(0, now - at) : null,
      transport: at != null ? (stages.find((x) => x.stage === s.key) || {}).transport || null : null
    };
  });

  const next = currentIndex >= 0 && currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : null;
  const transport = (screening && screening.live && screening.live.transport) ||
                    (screening && screening.call && screening.call.transport) || null;

  return {
    screeningId: screening ? screening.id : null,
    stage: current,
    label: current ? BY_KEY[current].label : 'Queued',
    stages: rows,
    waitingFor: next ? next.means : null,
    transport,
    replayed: !!replayed,
    /* The honesty line the live view has to print. Owned here so no page can
       soften it. */
    note: replayed
      ? 'This conversation was replayed from the seeded dataset. No call was placed.'
      : transport === 'live'
        ? 'This call ran through agentX. Stages come from the provider status, not from our timing.'
        : transport === 'fixture'
          ? 'This ran against a recorded stand-in on this machine. No call was placed and no ' +
            'provider was involved.'
          : 'No voice transport is configured, so no call was placed and every stage is stamped simulated.',
    /* Only after the platform reading arrives. U-34 wanted "answered three of
       five" mid-call and the provider does not report progress through the
       script, so guessing it would be the one made-up number on the screen. */
    questionsAsked: (screening && screening.platformReading &&
                     screening.platformReading.questionsAsked != null)
      ? screening.platformReading.questionsAsked : null,
    questionsInBank: screening && screening.questions ? screening.questions.length : null
  };
}
