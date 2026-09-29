/* ============================================================================
   events.js  ·  the record of what happened

   Four logs, and the difference between them is the point.

   workflowEvents  what moved, when, and how long the work took. EVERY duration
                   the product reports is computed from this and from nothing
                   else. If a number is on a screen, it was derived here.
   auditEvents     who did what and why. An employment workflow has to answer
                   that months later, to somebody who was not in the room.
   agentActions    everything the assistant did, including what it refused and
                   what it only asked about. An assistant you cannot audit is
                   one you have to take on trust.
   consents        what somebody was shown and agreed to, and when it may be
                   deleted. This is new. The previous build had no consent
                   table, no retention class and no delete path, which made
                   every claim about retention unbacked.

   Nothing here stores model reasoning. The evaluation, the evidence it cited
   and the confidence are kept. The chain of thought is not.

   ONE RULE THAT COST A DAY. Every row that can be grouped per store derives
   its storeId from the application when the caller does not pass one. In the
   previous build only the seed passed it, so every runtime raise wrote null and
   any per-store grouping silently dropped those rows while looking complete.
   The helper is at the top and both writers use it.
   ============================================================================ */

import { stepOf, ownerOf } from '../../domain/states.js';
import { HOUR } from './clock.js';

/**
 * The same instant this many whole calendar years later.
 *
 * NOT A MULTIPLICATION, and this is a defect that shipped. Four years as
 * 4 * 365 * 86400000 from 17 August 2026 lands on 16 August 2030, because 2028
 * has a leap day. On a retention floor the breach is deleting EARLY, so an
 * undercount is the dangerous direction, and this one deleted a day inside the
 * period the disclosure promises.
 *
 * compliance.js reasons its way to the same helper for the I-9 floor and keeps
 * it private. Two copies of nine lines is worth less than a circular import
 * between the record layer and the rules layer, and the handoff to export one
 * of them is filed.
 */
function addCalendarYears(ms, years) {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), d.getUTCDate(),
                  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
}

/* How long an exception may sit before somebody is expected to have picked it
   up, and when nobody having picked it up becomes its own problem.

   PRODUCT CHOICES WITH NO SOURCE BEHIND THE NUMBERS. They are defaulted from
   the severity rather than written per kind, because a critical exception that
   stops a candidate cannot wait as long as a warning that does not, and a table
   of ten hand-picked hour counts is ten things to get wrong. They are not legal
   deadlines.

   The statutory deadlines are clocks in compliance.js and they are the only
   dated obligations in this product. A row whose real deadline is one of those
   carries dueBy null and names the clock instead, so an invented hour count
   never renders beside a real one. */
const EXCEPTION_SLA = {
  crit: { dueMs: 4 * HOUR, escalateMs: 8 * HOUR },
  warn: { dueMs: 24 * HOUR, escalateMs: 48 * HOUR },
  info: { dueMs: 72 * HOUR, escalateMs: null }
};

/* Kinds whose deadline is somebody else's, with the clock that owns it. */
const GOVERNED_BY_CLOCK = {
  adverse_review: 'The FCRA pre-adverse sequence in compliance.js, which is law and not policy.',
  everify_mismatch: 'The E-Verify tentative nonconfirmation clocks in compliance.js, which are the ' +
                    'program agreement and not policy.'
};

/** Which store a row belongs to, worked out once. */
function storeOf(store, ctx, applicationId, given) {
  if (given) return given;
  if (!applicationId) return null;
  const app = store.byId('applications', ctx.tenantId, applicationId);
  return app ? app.storeId : null;
}

/**
 * One movement through the workflow.
 *
 * kind:
 *   'enter'    the application arrived in this state
 *   'work'     somebody or something did a measurable piece of work
 *   'blocked'  it stopped, and why
 *   'unblock'  it started again
 *   'note'     something worth recording that moved nothing
 *
 * durationMs is WORK time, not elapsed time. Elapsed is derived from the gap
 * between events. The difference between the two is the queue, which is the
 * thing this product exists to remove, so it is never guessed and never stored.
 */
export function workflowEvent(store, ctx, o) {
  const ev = {
    id: store.nextId('wev'),
    tenantId: ctx.tenantId,
    applicationId: o.applicationId || null,
    candidateId: o.candidateId || null,
    storeId: storeOf(store, ctx, o.applicationId, o.storeId),
    requisitionId: o.requisitionId || null,
    at: o.at != null ? o.at : ctx.clock.now(),
    kind: o.kind || 'enter',
    state: o.state || null,
    fromState: o.fromState || null,
    step: o.step != null ? o.step : (o.state ? stepOf(o.state) : null),
    owner: o.owner || (o.state ? ownerOf(o.state) : 'system'),
    actorType: o.actorType || 'system',    // agent | human | system | external
    actor: o.actor || null,                // a name, where there is one
    handoff: !!o.handoff,                  // did ownership change hands here
    durationMs: o.durationMs != null ? o.durationMs : null,
    detail: o.detail || null,
    ref: o.ref || null
  };
  store.insert('workflowEvents', ev);
  return ev;
}

/**
 * Who did what, when, and why.
 * `why` is not decoration. A decision with no reason is not auditable.
 */
export function auditEvent(store, ctx, o) {
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
    outcome: o.outcome || 'ok',            // ok | refused | failed
    source: o.source || 'ui'               // ui | assistant | connector | workflow
  };
  store.insert('auditEvents', ev);
  return ev;
}

/** Everything the assistant did, including what it refused. */
export function agentAction(store, ctx, o) {
  const ev = {
    id: store.nextId('act'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    utterance: o.utterance || null,
    route: o.route || null,                // 'nlu' | 'llm'
    intent: o.intent || null,
    confidence: o.confidence != null ? o.confidence : null,
    tool: o.tool || null,
    args: o.args || null,
    needsConfirmation: !!o.needsConfirmation,
    confirmed: o.confirmed != null ? o.confirmed : null,
    outcome: o.outcome || 'ok',            // ok | refused | failed | pending | cancelled
    error: o.error || null,
    resultSummary: o.resultSummary || null,
    actor: o.actor || null,
    /* Which page the turn was typed on. The suggestions are per page, so
       without this the assistant cannot be measured per surface. */
    surface: o.surface || null
  };
  store.insert('agentActions', ev);
  return ev;
}

/** A communication that actually left the building, or tried to. */
export function communication(store, ctx, o) {
  const c = {
    id: store.nextId('comm'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    channel: o.channel,                    // email | sms | voice
    direction: o.direction || 'outbound',
    to: o.to,
    candidateId: o.candidateId || null,
    applicationId: o.applicationId || null,
    templateId: o.templateId || null,
    subject: o.subject || null,
    body: o.body || null,
    status: o.status || 'queued',          // queued | sent | delivered | failed
    providerRef: o.providerRef || null,
    provider: o.provider || null,
    /* Real or simulated, on the row rather than inferred from the provider
       name, so a page cannot get it wrong. */
    mode: o.mode || 'simulated',
    error: o.error || null
  };
  store.insert('communications', c);
  return c;
}

/**
 * Something is stuck, and a person needs to know.
 *
 * THE ROW CARRIES A DEADLINE. It used to carry `at` and nothing else, so a
 * rehire hold that had been open twenty-nine and a half hours had nothing
 * counting on it and no list could rank one exception above another. The
 * defaults are set here rather than at each of the nine raise sites, so a new
 * raise site gets them without remembering to.
 */
export function raiseException(store, ctx, o) {
  const at = o.at != null ? o.at : ctx.clock.now();
  const severity = o.severity || 'warn';
  const sla = EXCEPTION_SLA[severity] || EXCEPTION_SLA.warn;
  const governed = GOVERNED_BY_CLOCK[o.kind] || null;
  const ex = {
    id: store.nextId('exc'),
    tenantId: ctx.tenantId,
    at,
    applicationId: o.applicationId || null,
    candidateId: o.candidateId || null,
    storeId: storeOf(store, ctx, o.applicationId, o.storeId),
    kind: o.kind,
    severity,                              // info | warn | crit
    title: o.title,
    detail: o.detail || null,
    owner: o.owner || 'human',
    blocksProgress: !!o.blocksProgress,
    nextAction: o.nextAction || null,
    /* Null where a law or a program agreement owns the deadline. The clock is
       named so a surface can go and get the real one. */
    dueBy: governed ? null : (o.dueBy != null ? o.dueBy : at + sla.dueMs),
    escalateAt: governed ? null
      : (o.escalateAt != null ? o.escalateAt
        : (sla.escalateMs == null ? null : at + sla.escalateMs)),
    dueBySource: governed ? 'compliance-clock' : 'tenant-policy',
    dueByNote: governed
      || 'A working target with no source behind the hours. It is not a legal deadline.',
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
    resolutionReason: null
  };
  store.insert('exceptions', ex, ctx.tenantId);
  return ex;
}

/**
 * Resolving one. The reason is required, because U-29 puts the decision, the
 * reason, the actor and the timestamp on every resolved row and a reason
 * collected later is a reason invented later.
 */
export function resolveException(store, ctx, id, o) {
  const ex = store.byId('exceptions', ctx.tenantId, id);
  if (!ex) return { ok: false, reason: 'No such exception.' };
  if (ex.resolvedAt) return { ok: false, reason: 'That exception was already resolved.' };
  if (!o || !o.reason || !String(o.reason).trim()) {
    return { ok: false, reason: 'A reason is required. A resolved exception with no reason is not a record.' };
  }
  ex.resolvedAt = ctx.clock.now();
  ex.resolvedBy = ctx.actor ? ctx.actor.name : null;
  ex.resolution = o.resolution || 'resolved';
  ex.resolutionReason = String(o.reason).trim();
  store.markDirty();

  workflowEvent(store, ctx, {
    applicationId: ex.applicationId, candidateId: ex.candidateId,
    kind: 'unblock', state: null, owner: 'human',
    actorType: ctx.actor ? ctx.actor.type : 'human',
    actor: ctx.actor ? ctx.actor.name : null,
    detail: 'Resolved: ' + ex.title + '. ' + ex.resolutionReason,
    ref: ex.id
  });
  auditEvent(store, ctx, {
    action: 'exception.resolved',
    actorType: ctx.actor ? ctx.actor.type : 'human',
    actor: ctx.actor ? ctx.actor.name : null,
    subjectType: 'exception', subjectId: ex.id,
    applicationId: ex.applicationId, candidateId: ex.candidateId,
    why: ex.resolutionReason,
    detail: { kind: ex.kind, resolution: ex.resolution },
    source: o.source || 'ui'
  });
  return { ok: true, exception: ex };
}

export function notify(store, ctx, o) {
  const n = {
    id: store.nextId('ntf'),
    tenantId: ctx.tenantId,
    at: o.at != null ? o.at : ctx.clock.now(),
    to: o.to,
    kind: o.kind,
    title: o.title,
    detail: o.detail || null,
    applicationId: o.applicationId || null,
    readAt: null
  };
  store.insert('notifications', n);
  return n;
}

/**
 * A consent, and the retention it starts.
 *
 * NEW. The disclosure gate is where this begins. U-86. California's rule since
 * 1 October 2025 requires four years of retention of the inputs to an automated
 * decision system, counted from the point of collection, and a system that
 * merely facilitates the decision is in scope. So the class and the delete date
 * are written at the moment of consent rather than worked out later.
 */
export function recordConsent(store, ctx, o) {
  const now = o.at != null ? o.at : ctx.clock.now();
  const c = {
    id: store.nextId('csn'),
    tenantId: ctx.tenantId,
    at: now,
    candidateId: o.candidateId || null,
    applicationId: o.applicationId || null,
    /* What they were actually shown, by version, so the record says which words
       were on the screen rather than which words are on it today. */
    disclosureId: o.disclosureId,
    disclosureVersion: o.disclosureVersion || '1',
    /* AND BY DIGEST, which is the half the version number cannot do. A version
       string says which notice was meant to be on screen. This says which words
       were. Review found the route stamping the current version onto a consent
       for a page that had rendered none of the six paragraphs, which made the
       record a false attestation, and a false attestation is worse than no
       record because it is the document that gets produced as proof. */
    disclosureDigest: o.disclosureDigest || null,
    accepted: o.accepted !== false,
    /* The classes the retention rules actually distinguish. */
    dataClass: o.dataClass || 'application',      // application | aedt_input | fcra
    retentionClass: o.retentionClass || 'aedt_4y',
    /* Four CALENDAR years. See addCalendarYears: the multiplication this
       replaces deleted a day inside the period the notice promises. */
    deleteAfter: o.deleteAfter != null ? o.deleteAfter : addCalendarYears(now, 4),
    basis: o.basis || null,
    /* ONE CONSENT, ONE APPLICATION. A reviewer created one consent and applied
       three times with it as three different people, and the record ended up
       naming the last writer, so the first two applications cited a notice
       record belonging to somebody else. The binding is written once, by
       intake, and the field is declared here so there is one shape for it. */
    usedByApplicationId: null,
    usedAt: null
    /* NO ip AND NO userAgent. They were here as two permanent nulls, which
       reads on an export as evidence that was collected and lost rather than
       evidence that was never taken. Neither is needed: the notice is served to
       everybody identically and the record proves what was shown, not from
       where. */
  };
  store.insert('consents', c, ctx.tenantId);
  auditEvent(store, ctx, {
    action: 'consent.recorded', actorType: 'external', actor: 'Applicant',
    subjectType: 'consent', subjectId: c.id,
    applicationId: c.applicationId, candidateId: c.candidateId,
    why: 'Shown ' + c.disclosureId + ' version ' + c.disclosureVersion +
         (c.disclosureDigest ? ', digest ' + c.disclosureDigest : '') + ' before the form.',
    detail: { dataClass: c.dataClass, retentionClass: c.retentionClass,
              deleteAfter: c.deleteAfter, disclosureDigest: c.disclosureDigest },
    source: 'ui'
  });
  return c;
}
