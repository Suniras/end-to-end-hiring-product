/* ============================================================================
   screening.js  ·  the screening conversation and its evaluation

   The conversation is synthetic: the candidate's answers come from the seed,
   because we obviously do not have a real retailer's applicants to ring up.
   Everything done TO that conversation is real. The transcript is assembled and
   stored, it is sent to whichever model is configured, the reply is validated
   against a schema before anybody sees it, and the whole call is written to the
   audit trail with its prompt version, model and latency.

   With no key configured, a deterministic rubric runs instead. It is a real
   feature, not a stand-in: it matches each answer against the phrase bank the
   customer owns and can edit, which is exactly what step 3 of the funnel says
   the product does. But it is not a model, so nothing here ever labels it as
   one. Every screen that shows a fallback evaluation prints "No model ran."

   The ceiling on all of this: the evaluation is evidence and a recommendation.
   It advances a candidate to a person. It cannot reject anybody, and the schema
   in llm.js has no value that would let it.
   ============================================================================ */

'use strict';

const LLM = require('./llm');
const EV = require('./events');
const CONN = require('./connectors');
const WF = require('./workflow');

/* ---------------------------------------------------- run the conversation - */

/**
 * Assembles the transcript from the candidate's seeded answers and stores it.
 * Returns the screening row.
 */
function runConversation(store, ctx, screening) {
  const c = store.byId('candidates', ctx.tenantId, screening.candidateId);
  const now = ctx.clock.now();

  const transcript = [];
  const responses = [];
  transcript.push({ speaker: 'Agent', text: 'Hi ' + c.firstName + ', thanks for applying. This takes about six minutes. Nothing you say here is a decision, a person makes that.' });

  screening.questions.forEach((q) => {
    const answer = (c.answers && c.answers[q.key]) || null;
    transcript.push({ speaker: 'Agent', text: q.text });
    transcript.push({ speaker: c.firstName, text: answer || '(no answer given)' });
    responses.push({ questionKey: q.key, question: q.text, answer: answer || null,
                     answeredAt: now, channel: screening.channel });
  });
  transcript.push({ speaker: 'Agent', text: 'That is everything. Someone from the store will be in touch.' });

  const durationMs = 4 * 60000 + CONN.spread(screening.id, 30000, 210000);

  if (screening.channel === 'voice') {
    /* The transport for an outbound call exists as an adapter and is not wired
       up. Recorded honestly rather than drawn as a live call. */
    CONN.call(store, ctx, 'messaging', 'voice',
      { to: c.phone, applicationId: screening.applicationId, candidateId: c.id,
        script: 'screen-v4', durationS: Math.round(durationMs / 1000) });
  }

  Object.assign(screening, {
    status: 'awaiting_evaluation',
    startedAt: screening.startedAt || now,
    completedAt: now + durationMs,
    durationMs,
    transcript,
    responses
  });
  store.markDirty();

  EV.workflowEvent(store, ctx, {
    applicationId: screening.applicationId, candidateId: c.id,
    kind: 'work', state: 'SCREENING_IN_PROGRESS', step: screening.step,
    owner: screening.owner, actorType: screening.owner === 'agent' ? 'agent' : 'human',
    actor: screening.owner === 'agent' ? 'Screening agent' : ctx.actor.name,
    durationMs,
    detail: screening.kind === 'agent_screen'
      ? 'Screening conversation, ' + Math.round(durationMs / 60000) + ' minutes, ' + responses.length + ' questions.'
      : 'Manager interview, ' + Math.round(durationMs / 60000) + ' minutes.'
  });
  return screening;
}

/* ------------------------------------------------------------ evaluation - */

/**
 * Sends the transcript to the configured model and stores the result.
 * Every path through this function writes an llmCalls row, including failures.
 */
async function evaluate(store, ctx, screening, opts) {
  opts = opts || {};
  const a = store.byId('applications', ctx.tenantId, screening.applicationId);
  const c = store.byId('candidates', ctx.tenantId, screening.candidateId);
  const r = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  const st = store.byId('stores', ctx.tenantId, a.storeId);

  const input = {
    role: {
      title: r.title,
      storeName: st.name,
      summary: r.summary,
      criteria: r.criteria
    },
    eligibility: a.eligibility || { results: [] },
    candidate: {
      appliedAt: new Date(a.appliedAt).toISOString(),
      source: a.source,
      experience: c.experience,
      priorEmployment: a.rehire && a.rehire.matched
        ? a.rehire.record.role + ' at ' + a.rehire.record.storeName + ', to ' + a.rehire.record.separatedOn.slice(0, 10)
        : null
    },
    transcript: screening.transcript
  };

  const out = await LLM.evaluateScreening(input, (i) => rubric(i, r), { forceFallback: !!opts.forceFallback });

  const callRow = {
    id: store.nextId('llm'),
    tenantId: ctx.tenantId,
    at: ctx.clock.now(),
    purpose: 'screening_evaluation',
    mode: out.mode,
    provider: out.provider,
    model: out.model,
    promptVersion: out.promptVersion,
    latencyMs: out.latencyMs,
    // Reference ids rather than a second copy of the transcript.
    inputRefs: { applicationId: a.id, candidateId: c.id, screeningId: screening.id,
                 requisitionId: r.id, transcriptTurns: screening.transcript.length },
    ok: out.ok,
    error: out.error || null,
    recommendation: out.ok ? out.data.recommendation : null,
    confidence: out.ok ? out.data.confidence : null,
    usage: out.usage || null,
    // Chain of thought is neither requested nor stored. This is the evaluation.
    output: out.ok ? out.data : null
  };
  store.insert('llmCalls', callRow);

  EV.auditEvent(store, ctx, {
    action: 'screening.evaluated',
    actorType: out.mode === 'llm' ? 'agent' : 'system',
    actor: out.mode === 'llm' ? (out.model || 'model') : 'Phrase bank rubric',
    applicationId: a.id, candidateId: c.id,
    subjectType: 'screening', subjectId: screening.id,
    outcome: out.ok ? 'ok' : 'failed',
    why: out.mode === 'llm'
      ? 'Model evaluation, prompt ' + out.promptVersion + ', ' + out.latencyMs + 'ms.'
      : 'No model configured. Deterministic phrase bank match, ' + out.promptVersion + '.',
    detail: { mode: out.mode, provider: out.provider, model: out.model,
              llmCallId: callRow.id, error: out.error || null },
    source: 'workflow'
  });

  if (!out.ok) {
    screening.status = 'evaluation_failed';
    screening.evaluationError = out.error;
    screening.evaluationMeta = { mode: out.mode, provider: out.provider, model: out.model,
                                 promptVersion: out.promptVersion, latencyMs: out.latencyMs,
                                 llmCallId: callRow.id, note: out.note };
    store.markDirty();
    EV.raiseException(store, ctx, {
      applicationId: a.id, candidateId: c.id, storeId: a.storeId,
      kind: 'evaluation_failed', severity: 'warn', owner: 'human', blocksProgress: true,
      title: 'The screening evaluation did not complete',
      detail: out.error,
      nextAction: 'Read the transcript and decide without the evaluation, or run it again. Nothing was written to the record beyond the error.'
    });
    return { ok: false, error: out.error, meta: screening.evaluationMeta };
  }

  screening.status = 'complete';
  screening.evaluation = out.data;
  screening.evaluationError = null;
  screening.evaluationMeta = {
    mode: out.mode, provider: out.provider, model: out.model,
    promptVersion: out.promptVersion, latencyMs: out.latencyMs,
    llmCallId: callRow.id,
    note: out.note ||
      (out.mode === 'llm' ? 'Generated by ' + out.model + '.' : null),
    isModel: out.mode === 'llm'
  };
  screening.evaluationId = callRow.id;
  store.markDirty();

  EV.workflowEvent(store, ctx, {
    applicationId: a.id, candidateId: c.id, kind: 'work',
    state: 'SCREENING_IN_PROGRESS', step: screening.step, owner: 'agent',
    actorType: out.mode === 'llm' ? 'agent' : 'system',
    actor: out.mode === 'llm' ? (out.model || 'model') : 'Phrase bank rubric',
    durationMs: out.latencyMs,
    detail: 'Recommendation: ' + out.data.recommendation + ', confidence ' +
            Math.round(out.data.confidence * 100) + '%.'
  });

  // A concern the model rated high goes in front of a person by name, rather
  // than sitting inside an evaluation nobody opens.
  (out.data.concerns || []).filter((x) => x.severity === 'high').forEach((x) => {
    EV.raiseException(store, ctx, {
      applicationId: a.id, candidateId: c.id, storeId: a.storeId,
      kind: 'screening_concern', severity: 'warn', owner: 'human', blocksProgress: false,
      title: x.concern, detail: x.evidence,
      nextAction: 'Read the transcript before deciding.'
    });
  });

  return { ok: true, evaluation: out.data, meta: screening.evaluationMeta };
}

/* ------------------------------------------------------- the fallback ----- */

/**
 * The deterministic rubric. Runs when no key is configured.
 *
 * It matches each answer against the phrase bank on the requisition, which is
 * the thing the customer owns and edits. Same output shape as the model so the
 * rest of the product does not branch, but the mode field says exactly what
 * produced it and nothing labels it as a model.
 */
function rubric(input, requisition) {
  const answers = {};
  input.transcript.forEach((t, i) => {
    if (t.speaker === 'Agent') return;
    const q = input.transcript[i - 1];
    if (q) answers[q.text] = t.text;
  });

  const byQuestion = {};
  (requisition.screeningQuestions || []).forEach((q) => { byQuestion[q.text] = q; });

  const criteria = input.role.criteria.map((crit) => {
    const qs = (requisition.screeningQuestions || []).filter((q) => q.criterion === crit.key);
    let best = { verdict: 'not_covered', evidence: '', hits: 0 };
    qs.forEach((q) => {
      const ans = answers[q.text];
      if (!ans || ans === '(no answer given)') return;
      const low = ans.toLowerCase();
      const pos = (q.positivePhrases || []).filter((p) => low.indexOf(p.toLowerCase()) >= 0);
      const neg = (q.concernPhrases || []).filter((p) => low.indexOf(p.toLowerCase()) >= 0);
      let verdict;
      if (neg.length) verdict = 'not_met';
      else if (pos.length >= 2) verdict = 'met';
      else if (pos.length === 1) verdict = 'partly_met';
      else verdict = 'partly_met';
      const rank = { met: 3, partly_met: 2, not_met: 1, not_covered: 0 };
      if (rank[verdict] > rank[best.verdict] || best.verdict === 'not_covered') {
        best = { verdict, evidence: ans, hits: pos.length, negs: neg };
      }
    });
    return {
      key: crit.key,
      verdict: best.verdict,
      evidence: best.evidence,
      note: best.verdict === 'not_covered'
        ? 'No question in the bank covers this criterion, or it went unanswered.'
        : 'Matched ' + (best.hits || 0) + ' phrase(s) from the bank the store owns.'
    };
  });

  const concerns = [];
  (requisition.screeningQuestions || []).forEach((q) => {
    const ans = answers[q.text];
    if (!ans) return;
    (q.concernPhrases || []).forEach((p) => {
      if (ans.toLowerCase().indexOf(p.toLowerCase()) >= 0) {
        concerns.push({ concern: q.concernLabel || ('Phrase "' + p + '" is on the store\'s concern list'),
                        evidence: ans, severity: 'medium' });
      }
    });
  });

  const unanswered = (requisition.screeningQuestions || [])
    .filter((q) => !answers[q.text] || answers[q.text] === '(no answer given)')
    .map((q) => q.text);

  const met = criteria.filter((c) => c.verdict === 'met').length;
  const notCovered = criteria.filter((c) => c.verdict === 'not_covered').length;
  const notMet = criteria.filter((c) => c.verdict === 'not_met').length;

  let recommendation;
  if (notCovered >= Math.ceil(criteria.length / 2) || unanswered.length >= 3) recommendation = 'insufficient_evidence';
  else if (notMet > 0 || concerns.length > 0) recommendation = 'review';
  else if (met >= Math.ceil(criteria.length * 0.6)) recommendation = 'advance';
  else recommendation = 'review';

  return {
    recommendation,
    summary: 'Phrase bank match: ' + met + ' of ' + criteria.length + ' criteria met, ' +
             notMet + ' not met, ' + notCovered + ' not covered. No model ran.',
    criteria,
    concerns,
    unansweredQuestions: unanswered,
    // Deliberately capped. A rubric that has not read anything should not report
    // the confidence of something that has.
    confidence: Math.min(0.62, 0.3 + (met / Math.max(1, criteria.length)) * 0.4),
    recommendedNextAction: recommendation === 'advance'
      ? 'Put in front of the store manager for a decision.'
      : 'A person should read the transcript before deciding.'
  };
}

/* ------------------------------------------------------------- the flow --- */

/**
 * Start to finish: move the application into screening, run the conversation,
 * evaluate it, and move it to a decision. Every step goes through the workflow
 * engine, so the actor rules apply here exactly as they do to a button.
 */
async function runFullScreening(store, ctx, applicationId, opts) {
  opts = opts || {};
  const a = store.byId('applications', ctx.tenantId, applicationId);
  if (!a) return { ok: false, error: 'no such application' };

  if (a.state === 'SCREENING_PENDING') {
    const t = WF.transition(store, ctx, applicationId, 'SCREENING_IN_PROGRESS', { source: opts.source });
    if (!t.ok) return { ok: false, error: t.reason, refused: t.refused };
  }
  if (a.state !== 'SCREENING_IN_PROGRESS') {
    return { ok: false, error: 'This candidate is at ' + WF.label(a.state) + ', not in screening.' };
  }

  const pending = WF.screeningsFor(store, ctx, applicationId)
    .filter((s) => s.status === 'pending' || s.status === 'in_progress' || s.status === 'scheduled');

  const results = [];
  for (const s of pending) {
    if (s.kind === 'manager_interview' && !opts.includeInterview) {
      // A manager interview is a person in a room. The product schedules it and
      // waits, it does not conduct it.
      s.status = 'scheduled';
      s.scheduledAt = ctx.clock.now() + 26 * 3600000;
      store.markDirty();
      results.push({ screeningId: s.id, kind: s.kind, status: 'scheduled' });
      continue;
    }
    runConversation(store, ctx, s);
    const ev = await evaluate(store, ctx, s, { forceFallback: !!opts.forceFallback });
    results.push({ screeningId: s.id, kind: s.kind, status: s.status,
                   ok: ev.ok, evaluation: ev.evaluation || null, meta: ev.meta, error: ev.error || null });
  }

  const done = WF.transition(store, ctx, applicationId, 'SCREENING_COMPLETE',
    { source: opts.source, reason: 'All required screenings complete.' });

  return {
    ok: true,
    results,
    advanced: done.ok,
    advanceRefusal: done.ok ? null : done.reason,
    state: store.byId('applications', ctx.tenantId, applicationId).state
  };
}

module.exports = { runConversation, evaluate, rubric, runFullScreening };
