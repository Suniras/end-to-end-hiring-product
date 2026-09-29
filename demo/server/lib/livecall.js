/* ============================================================================
   livecall.js  ·  the seven stages of one screening call

   U-34 asks the screening page to show a live call as it happens: invited,
   opened, connected, in progress, ended, scoring, scored. The screening row
   carried `pending` and `complete` and nothing in between, so a live call had
   no state to render.

   THIS IS NOT A SECOND WORKFLOW ENGINE. The application state machine in
   schema.js still owns every move a candidate makes through the funnel, and it
   is untouched. What lives here is the transport's own progress inside one
   step. Only the last stage touches the workflow, by handing back to
   WF.transition, and the three application states for step 3 stay three.
   Adding seven application states for one step would put seven rows in a
   twenty-row funnel U-40 sizes by duration.

   HONESTY. B-08 makes the voice call real and agentX the transport. This module
   does not decide whether that is true today, it reports it. `transportMode()`
   resolves to 'live' only when a transport is actually configured, and to
   'simulated' otherwise, in exactly the way llm.js resolves a model key. Every
   stage records the mode it ran under, so a call that was simulated is stamped
   simulated in the record and stays that way. Nothing here can label a
   simulated call live.

   Every stage writes a workflowEvent, so the candidate timeline and the metrics
   see a live call the same way they see everything else. Nothing is stored that
   is not derived from something that happened.
   ============================================================================ */

'use strict';

const EV = require('./events');

/* The sequence, in order. `next` is what may follow, and nothing else may.
   A refused move returns a reason and writes an audit entry, which is the same
   contract workflow.js holds. */
const STAGES = {
  invited:     { label: 'Invited',      next: ['opened', 'failed', 'expired'],  owner: 'agent'  },
  opened:      { label: 'Link opened',  next: ['connected', 'failed', 'expired'], owner: 'external' },
  connected:   { label: 'Connected',    next: ['in_progress', 'failed'],        owner: 'agent'  },
  in_progress: { label: 'In progress',  next: ['ended', 'failed'],              owner: 'agent'  },
  ended:       { label: 'Call ended',   next: ['scoring'],                      owner: 'agent'  },
  scoring:     { label: 'Scoring',      next: ['scored', 'failed'],             owner: 'agent'  },
  scored:      { label: 'Scored',       next: [],                               owner: 'agent'  },
  failed:      { label: 'Call failed',  next: ['invited'],                      owner: 'human'  },
  expired:     { label: 'Invitation expired', next: ['invited'],                owner: 'human'  }
};

/* The stamp that goes on each stage. `at` is when, `mode` is what was actually
   running. A stage list is a record, so it is append-only. */
const ORDER = ['invited', 'opened', 'connected', 'in_progress', 'ended', 'scoring', 'scored'];

/** 'live' only when a transport is genuinely configured. Otherwise 'simulated'. */
function transportMode() {
  return (process.env.AGENTX_API_KEY && process.env.AGENTX_AGENT_ID) ? 'live' : 'simulated';
}

/** What the interface needs in order to say what is running, without guessing. */
function transportStatus() {
  const mode = transportMode();
  return {
    mode,
    configured: mode === 'live',
    agentId: mode === 'live' ? process.env.AGENTX_AGENT_ID : null,
    /* The sentence the interface prints. Written here so no page can invent a
       friendlier one, which is the same reason llm.js owns "No model ran". */
    note: mode === 'live'
      ? 'Voice runs through agentX. The transcript and the post-call analysis come back from the provider.'
      : 'No voice transport is configured, so the call sequence runs against our own timing and the provider returns nothing. Every stage below is stamped simulated.'
  };
}

function stagesOf(screening) {
  return (screening.call && screening.call.stages) || [];
}

function stateOf(screening) {
  const s = stagesOf(screening);
  return s.length ? s[s.length - 1].stage : null;
}

/** Has this call reached at least `stage`? Reads the record, never a flag. */
function reached(screening, stage) {
  return stagesOf(screening).some((s) => s.stage === stage);
}

/**
 * Start a call. `method` is 'browser' or 'outbound', which is U-92: the
 * confirmation offers both and the demo script can use either.
 */
function invite(store, ctx, screening, opts) {
  const o = opts || {};
  const method = o.method === 'outbound' ? 'outbound' : 'browser';
  if (screening.call && stateOf(screening) && ['invited', 'opened', 'connected', 'in_progress'].indexOf(stateOf(screening)) >= 0) {
    return refuse(store, ctx, screening, 'invited', 'A call is already open on this screening, at ' + stateOf(screening) + '.');
  }
  screening.call = {
    method,
    transport: transportMode(),
    /* The token the browser call opens with. It identifies the screening and
       nothing else, so it carries no candidate detail. */
    token: 'call_' + screening.id.replace(/^scr_/, ''),
    providerRef: null,
    error: null,
    stages: []
  };
  screening.status = 'invited';
  store.markDirty();
  return advance(store, ctx, screening, 'invited', { detail: 'Invited by ' + method + ' call.' });
}

/**
 * Move the call on one stage. Refuses anything the sequence does not allow and
 * says what was allowed, rather than silently doing nothing.
 */
function advance(store, ctx, screening, stage, opts) {
  const o = opts || {};
  if (!STAGES[stage]) return { ok: false, reason: 'There is no call stage called ' + stage + '.' };
  const from = stateOf(screening);

  if (from === null) {
    if (stage !== 'invited') {
      return refuse(store, ctx, screening, stage, 'The call has not been invited yet, so it cannot move to ' + stage + '.');
    }
  } else if (STAGES[from].next.indexOf(stage) < 0) {
    return refuse(store, ctx, screening, stage,
      STAGES[from].next.length
        ? 'A call at ' + STAGES[from].label + ' cannot move to ' + STAGES[stage].label +
          '. It can only move to: ' + STAGES[from].next.join(', ') + '.'
        : 'This call is finished at ' + STAGES[from].label + '. Nothing follows it. ' +
          'A new call has to be invited.');
  }

  const at = o.at != null ? o.at : ctx.clock.now();
  screening.call.stages.push({
    stage, at,
    mode: screening.call.transport,
    detail: o.detail || null,
    actorType: o.actorType || (stage === 'opened' ? 'external' : 'agent')
  });
  if (o.providerRef) screening.call.providerRef = o.providerRef;
  if (stage === 'failed') screening.call.error = o.error || 'The call failed and the provider returned no reason.';
  screening.status = stage === 'scored' ? 'awaiting_evaluation' : stage;
  store.markDirty();

  /* The timeline and the metrics read workflowEvents and nothing else, so a
     stage that is not written here is a stage the product cannot show. */
  EV.workflowEvent(store, ctx, {
    applicationId: screening.applicationId,
    candidateId: screening.candidateId,
    at,
    kind: stage === 'failed' ? 'blocked' : 'work',
    state: 'SCREENING_IN_PROGRESS',
    step: 3,
    owner: STAGES[stage].owner,
    actorType: o.actorType || (stage === 'opened' ? 'external' : 'agent'),
    actor: o.actor || (screening.call.transport === 'live' ? 'agentX voice agent' : null),
    durationMs: durationOfStage(screening, stage),
    detail: STAGES[stage].label + (o.detail ? '. ' + o.detail : '') +
            ' [' + screening.call.transport + ' transport]',
    ref: screening.id
  });

  EV.auditEvent(store, ctx, {
    action: 'screening.call.' + stage,
    actorType: o.actorType || 'agent',
    actor: o.actor || null,
    subjectType: 'screening', subjectId: screening.id,
    applicationId: screening.applicationId,
    candidateId: screening.candidateId,
    why: o.why || o.detail || null,
    detail: 'transport=' + screening.call.transport + ' method=' + screening.call.method,
    source: 'workflow'
  });

  return { ok: true, stage, state: stateOf(screening), call: publicCall(screening) };
}

function refuse(store, ctx, screening, stage, reason) {
  EV.auditEvent(store, ctx, {
    action: 'screening.call.' + stage,
    actorType: 'system',
    subjectType: 'screening', subjectId: screening.id,
    applicationId: screening.applicationId,
    candidateId: screening.candidateId,
    why: reason, outcome: 'refused', source: 'workflow'
  });
  return { ok: false, reason };
}

/** Work time inside one stage, measured from the stage before it. */
function durationOfStage(screening, stage) {
  const s = stagesOf(screening);
  if (s.length < 2) return null;
  const last = s[s.length - 1], prev = s[s.length - 2];
  if (last.stage !== stage) return null;
  return Math.max(0, last.at - prev.at);
}

/** The elapsed call, for U-34's running timer. Derived, never stored. */
function elapsedMs(screening, now) {
  const s = stagesOf(screening);
  const start = s.find((x) => x.stage === 'connected') || s.find((x) => x.stage === 'invited');
  if (!start) return null;
  const end = s.find((x) => x.stage === 'ended');
  return Math.max(0, (end ? end.at : now) - start.at);
}

/**
 * What a page may render. Note what is absent: no transcript. U-34 says the
 * transcript does not appear while the call is happening unless the provider
 * genuinely streams one, and ours does not, so there is nothing to show and
 * this shape cannot accidentally show it.
 */
function publicCall(screening, now) {
  if (!screening.call) return null;
  const c = screening.call;
  const state = stateOf(screening);
  return {
    method: c.method,
    transport: c.transport,
    token: c.token,
    providerRef: c.providerRef,
    error: c.error,
    state,
    label: state ? STAGES[state].label : null,
    owner: state ? STAGES[state].owner : null,
    live: ['invited', 'opened', 'connected', 'in_progress'].indexOf(state) >= 0,
    elapsedMs: elapsedMs(screening, now != null ? now : 0),
    /* The whole sequence with the ones not yet reached marked, so the page can
       show what it is waiting for rather than an empty row. That is item 31 of
       the build brief: a live state has to say what it is waiting on. */
    sequence: ORDER.map((stage) => {
      const hit = stagesOf(screening).find((x) => x.stage === stage);
      return { stage, label: STAGES[stage].label, at: hit ? hit.at : null,
               mode: hit ? hit.mode : null, reached: !!hit,
               current: state === stage };
    }),
    stages: stagesOf(screening)
  };
}

module.exports = { STAGES, ORDER, invite, advance, stateOf, reached, publicCall,
                   elapsedMs, transportMode, transportStatus, stagesOf };
