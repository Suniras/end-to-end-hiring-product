/* ============================================================================
   events.js  ·  the record of what happened

   Three logs, and the difference between them matters.

   workflowEvents  what moved, when, and how long the work took. The metrics are
                   computed from this and from nothing else. If a duration is on
                   a screen, it was derived here.
   auditEvents     who did what and why. An employment workflow has to be able
                   to answer that question months later, to a person who was not
                   in the room.
   agentActions    everything the assistant did, including what it refused and
                   what it asked about before doing. An assistant you cannot
                   audit is one you have to take on trust.

   Nothing here stores model reasoning. The evaluation, the evidence it cited
   and the confidence are kept. The chain of thought is not.
   ============================================================================ */

'use strict';

const { stepOf, ownerOf } = require('./schema');

/* One place to work out which store a row belongs to.

   Fixed 7 Sep 2026. Only the seed was passing storeId when raising an
   exception; every runtime raise omitted it, so two of five exceptions carried
   null and any per-store grouping keyed on that field silently dropped them. */
function storeOf(store, ctx, applicationId) {
  if (!applicationId) return null;
  const app = store.byId('applications', ctx.tenantId, applicationId);
  return app ? app.storeId : null;
}

/**
 * One movement through the workflow.
 *
 * kind:
 *   'enter'   the application arrived in this state
 *   'work'    somebody or something did a measurable piece of work
 *   'blocked' it stopped, and why
 *   'unblock' it started again
 *   'note'    something worth recording that moved nothing
 *
 * durationMs is WORK time, not elapsed time. Elapsed is derived from the gap
 * between events. The difference between the two is the queue, which is the
 * thing this product exists to remove, so it is never guessed.
 */
function workflowEvent(store, ctx, o) {
  const ev = {
    id: store.nextId('wev'),
    tenantId: ctx.tenantId,
    applicationId: o.applicationId || null,
    candidateId: o.candidateId || null,
    /* Derive the store from the application when the caller does not pass it,
       so a per-store grouping cannot silently drop rows. Added 7 Sep 2026
       alongside the same fix in raiseException below, where the problem was
       actually observed. */
    storeId: o.storeId || storeOf(store, ctx, o.applicationId),
    requisitionId: o.requisitionId || null,
    at: o.at != null ? o.at : ctx.clock.now(),
    kind: o.kind || 'enter',
    state: o.state || null,
    fromState: o.fromState || null,
    step: o.step != null ? o.step : (o.state ? stepOf(o.state) : null),
    owner: o.owner || (o.state ? ownerOf(o.state) : 'system'),
    actorType: o.actorType || 'system',      // agent | human | system | external
    actor: o.actor || null,                  // a name, where there is one
    handoff: !!o.handoff,                    // did ownership change hands here
    durationMs: o.durationMs != null ? o.durationMs : null,
    detail: o.detail || null,
    ref: o.ref || null
  };
  store.insert('workflowEvents', ev);
  return ev;
}

/**
 * Who did what, when, and why.
 * `why` is not decoration. A decision without a reason is not auditable.
 */
function auditEvent(store, ctx, o) {
  const ev = {
    id: store.nextId('aud'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    action: o.action,
    actorType: o.actorType || 'system',
    actor: o.actor || null,
    subjectType: o.subjectType || null,
    subjectId: o.subjectId || null,
    applicationId: o.applicationId || null,
    candidateId: o.candidateId || null,
    why: o.why || null,
    detail: o.detail || null,
    outcome: o.outcome || 'ok',              // ok | refused | failed
    source: o.source || 'ui'                 // ui | assistant | connector | workflow
  };
  store.insert('auditEvents', ev);
  return ev;
}

/**
 * Everything the assistant did. Recorded whether it succeeded, was refused, or
 * was only asked about, because the interesting failures are the ones where an
 * assistant did something it was merely asked a question about.
 */
function agentAction(store, ctx, o) {
  const ev = {
    id: store.nextId('act'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    utterance: o.utterance || null,
    route: o.route || null,                  // 'nlu' | 'llm'
    intent: o.intent || null,
    confidence: o.confidence != null ? o.confidence : null,
    tool: o.tool || null,
    args: o.args || null,
    needsConfirmation: !!o.needsConfirmation,
    confirmed: o.confirmed != null ? o.confirmed : null,
    outcome: o.outcome || 'ok',              // ok | refused | failed | pending | cancelled
    error: o.error || null,
    resultSummary: o.resultSummary || null,
    actor: o.actor || null
  };
  store.insert('agentActions', ev);
  return ev;
}

/** A communication that actually left the building, or tried to. */
function communication(store, ctx, o) {
  const c = {
    id: store.nextId('comm'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    channel: o.channel,                      // email | sms | voice
    direction: o.direction || 'outbound',
    to: o.to,
    candidateId: o.candidateId || null,
    applicationId: o.applicationId || null,
    templateId: o.templateId || null,
    subject: o.subject || null,
    body: o.body || null,
    status: o.status || 'queued',            // queued | sent | delivered | failed
    providerRef: o.providerRef || null,
    provider: o.provider || null,
    error: o.error || null
  };
  store.insert('communications', c);
  return c;
}

/** Something is stuck, and a person needs to know. */
function raiseException(store, ctx, o) {
  const ex = {
    id: store.nextId('exc'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    applicationId: o.applicationId || null,
    candidateId: o.candidateId || null,
    storeId: o.storeId || storeOf(store, ctx, o.applicationId),
    kind: o.kind,                            // rehire_flag | everify_mismatch | check_delay | quiet | offer_expiry | connector_error
    severity: o.severity || 'warn',          // info | warn | crit
    title: o.title,
    detail: o.detail || null,
    owner: o.owner || 'human',
    blocksProgress: !!o.blocksProgress,
    nextAction: o.nextAction || null,
    resolvedAt: null,
    resolution: null
  };
  store.insert('exceptions', ex);
  return ex;
}

function notify(store, ctx, o) {
  const n = {
    id: store.nextId('ntf'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    to: o.to,                                // a person key
    kind: o.kind,
    title: o.title,
    detail: o.detail || null,
    applicationId: o.applicationId || null,
    readAt: null
  };
  store.insert('notifications', n);
  return n;
}

module.exports = { workflowEvent, auditEvent, agentAction, communication, raiseException, notify };
