/* ============================================================================
   screening.js  ·  the conversation, its evaluation, and the two readers

   Three things live here and the differences between them are the whole design.

   THE CONVERSATION. For a seeded candidate it is replayed from answers written
   into the seed, because we obviously do not have a real retailer's applicants
   to ring up. For a live applicant it is a REAL agentX call and this module
   never assembles one: a live candidate has no `answers` map, intake refuses to
   write one, and `runConversation` throws rather than inventing a transcript
   for somebody who took a real call. That is U-94 and it is the single worst
   thing that could happen on stage.

   THE READ BACK. `collectResult` is what turns a placed call into a screening
   record. It polls the provider, takes the transcript, lines the candidate's
   answers up against the question bank, stores the platform's own analysis, and
   runs our rubric over the same words.

   THE DEFECT IT WAS BUILT TO FIX, recorded so nobody removes it as unused
   again. Until this pass nothing in the product read a call result back. The
   spine ended at "call placed": every collecting function in agentx.js had zero
   callers, `crossCheck` had zero callers, and a live applicant who took a real
   call got no transcript, no evaluation and no state change. The person in the
   room applied, the phone rang, and then they never appeared anywhere.

   THE EVALUATION, and it is scored twice by two independent readers that are
   never averaged.

     ours     a per-criterion verdict from the phrase bank the store owns, or
              from a model where one is genuinely configured and answers
     agentX   a per-criterion verdict extracted by the platform after the call

   Both use the SAME criterion keys and the SAME four verdicts, because the
   platform has no numeric score of any kind and inventing a scale for it would
   have been the fake common scale the brief forbids. So a disagreement is a
   mismatch on a named criterion, which a manager can act on. Under B-07 a
   disagreement raises a blocking exception and a person decides.

   THE HONESTY RULE, and this file broke it until this pass. `mode` used to be
   set from the presence of LLM_API_KEY, so the day somebody set a key every
   screen would have printed "model" over phrase-bank output and the sentence
   "No model ran" would have disappeared, with no model call anywhere in the
   product. The flag now follows what actually produced the reading. A key on
   its own changes nothing and says so.

   THE CEILING ON ALL OF IT. An evaluation is evidence and a recommendation. It
   moves somebody TO a person. It cannot reject anybody and the schema has no
   value that would let it.
   ============================================================================ */

import * as EV from './events.js';
import * as CONN from './connectors.js';
import * as AGENTX from './agentx.js';
import * as LIVE from './livecall.js';
import { MIN } from './clock.js';

/* The four verdicts, shared with the agentX metric properties by construction
   rather than by coincidence. Anything outside this list is a bug. */
export const VERDICTS = ['met', 'partly_met', 'not_met', 'not_covered'];

/* What a recommendation may be. There is deliberately no 'reject'. */
export const RECOMMENDATIONS = ['advance', 'review', 'insufficient_evidence'];

/* The seven properties the agent is configured to extract, five per criterion
   and two about the call. Named here so the reader below looks for exactly what
   was configured and nothing else. There is no numeric score on the platform,
   so this list never grows one. */
export const PLATFORM_PROPERTIES = [
  'availability_fit', 'reliability', 'customer_manner', 'physical_requirements', 'food_safety'
];

/**
 * Words that mean somebody has disclosed something that may never be scored.
 *
 * This screens text the PLATFORM returns, which our phrase bank never saw. It
 * matters because this product has printed a disclosure on screen as the
 * adverse evidence for marking somebody down twice, once for childcare and once
 * for a back condition, and both were caught by review rather than by a test.
 * The platform picks its own quote out of the transcript with a model we do not
 * control, so its quote gets the same screen the bank got.
 *
 * SECOND COPY. seed.js declares the same list for its import-time assertion
 * over the phrase bank. Two copies of one list is how they diverge, and the
 * merge into one module is written up as a handoff rather than done here,
 * because seed.js belongs to somebody else this pass.
 */
export const PROTECTED_LANGUAGE = [
  'childcare', 'child care', 'children', 'kids', 'family', 'spouse', 'husband', 'wife',
  'pregnan', 'disab', 'my back', 'i would struggle', 'wheelchair', 'medication',
  'church', 'religio', 'married', 'immigrant', 'my accent', 'my age', 'my race'
];

function tripsProtectedLanguage(text) {
  const low = String(text || '').toLowerCase();
  return PROTECTED_LANGUAGE.filter((w) => low.indexOf(w) >= 0);
}

/* ------------------------------------------------------- the conversation --- */

/**
 * Replay a seeded candidate's screening. Returns the screening row.
 *
 * Throws for a live applicant, on purpose. A transcript is a record of what
 * somebody said, and manufacturing one is falsifying a record.
 */
export function runConversation(store, ctx, screening) {
  const c = store.byId('candidates', ctx.tenantId, screening.candidateId);
  if (!c) throw new Error('no candidate on screening ' + screening.id);
  if (!c.answers) {
    throw new Error('candidate ' + c.id + ' has no seeded answers, so there is nothing to replay. ' +
                    'A live applicant takes a real agentX call and this function must never ' +
                    'assemble a transcript for them.');
  }
  const now = ctx.clock.now();
  const transcript = [];
  const responses = [];

  /* THE RECORDING NOTICE IS PART OF THE OPENING TURN AND IT IS NOT OPTIONAL.
     B-26 keeps roughly a dozen all-party recording consent states in scope and
     rests that on the disclosure being spoken in the call. The opening turn had
     no recording notice at all, here or in the agent prompt, so the one
     disclosure B-26 assigned to the call was the one missing, and it is the half
     that carries a criminal statute in some states. The provider returns a
     recording url on the call record, so there genuinely is a recording. Any
     edit of this opening keeps this clause. */
  transcript.push({ speaker: 'Agent', at: now, text:
    'Hi ' + c.firstName + ', this is the screening assistant for ' + (ctx.tenantName || 'the store') +
    '. This is an automated call and it takes about five minutes. This call is recorded so the ' +
    'store can review it. Nothing here is a decision, a person at the store makes that. ' +
    'Ready to start?' });
  transcript.push({ speaker: c.firstName, at: now, text: 'Yes, go ahead.' });

  (screening.questions || []).forEach((q) => {
    const answer = (c.answers && c.answers[q.key]) || null;
    transcript.push({ speaker: 'Agent', at: now, text: q.text });
    transcript.push({ speaker: c.firstName, at: now, text: answer || '(no answer given)' });
    responses.push({ questionKey: q.key, question: q.text, answer: answer || null,
                     answeredAt: now, channel: screening.channel });
  });

  transcript.push({ speaker: 'Agent', at: now, text:
    'That is everything I needed, ' + c.firstName + '. Someone from the store will look at this and be ' +
    'in touch. Anything you would like to ask before we finish?' });
  transcript.push({ speaker: c.firstName, at: now, text: 'No, that is all. Thank you.' });
  transcript.push({ speaker: 'Agent', at: now, text:
    'Thanks for your time, ' + c.firstName + '. Have a good day.' });

  /* Deterministic, from a hash of the screening id, so the same run produces
     the same duration every time. A demo whose numbers move cannot be tested. */
  const durationMs = 4 * MIN + CONN.spread(screening.id, 30000, 210000);

  Object.assign(screening, {
    status: 'awaiting_evaluation',
    startedAt: screening.startedAt || now,
    completedAt: now + durationMs,
    durationMs, transcript, responses,
    /* Replayed, and the record says so. Nothing may render this as a live
       call, which is what a mode field on the row is for. */
    conversationMode: 'replayed'
  });
  store.markDirty();

  EV.workflowEvent(store, ctx, {
    applicationId: screening.applicationId, candidateId: screening.candidateId,
    at: now, kind: 'work', state: 'SCREENING_IN_PROGRESS', step: 3, owner: 'agent',
    actorType: 'agent', actor: 'Screening agent', durationMs,
    detail: responses.length + ' questions asked and answered [replayed conversation].',
    ref: screening.id
  });
  return screening;
}

/* ---------------------------------------------------------- the evaluation --- */

/**
 * The deterministic rubric. Not a model, and every surface that shows its
 * output has to print that no model ran.
 *
 * It is a real feature rather than a stand-in: it matches each answer against
 * the phrase bank the customer owns and can edit, which is exactly what step 3
 * of the funnel says the product does.
 *
 * TWO PROPERTIES THAT ARE NOT NEGOTIABLE, both of which were defects once.
 *
 * A concern quotes only the SENTENCE it matched, never the whole answer. The
 * previous build quoted the entire answer as the evidence for a concern, so a
 * candidate who mentioned childcare while declining weekends had a childcare
 * disclosure printed on their rejection screen as the adverse evidence. The
 * phrase bank no longer scores it, and now the quote cannot carry it either.
 *
 * And an unmatched criterion is `not_covered`, not a low verdict. A question
 * that was never asked has no answer, and scoring it would manufacture one.
 */
export function rubric(store, ctx, screening, requisition) {
  const answers = {};
  (screening.responses || []).forEach((r) => { if (r.answer) answers[r.questionKey] = r.answer; });

  const criteria = ((requisition && requisition.criteria) || []).map((crit) => {
    const qs = (screening.questions || []).filter((q) => q.criterion === crit.key);
    let best = { verdict: 'not_covered', evidence: null, hits: 0 };
    qs.forEach((q) => {
      const ans = answers[q.key];
      if (!ans) return;
      const low = String(ans).toLowerCase();
      const pos = (q.positivePhrases || []).filter((p) => low.indexOf(String(p).toLowerCase()) >= 0);
      const neg = (q.concernPhrases || []).filter((p) => low.indexOf(String(p).toLowerCase()) >= 0);
      const verdict = neg.length ? 'not_met' : (pos.length >= 2 ? 'met' : 'partly_met');
      const rank = { met: 3, partly_met: 2, not_met: 1, not_covered: 0 };
      if (best.verdict === 'not_covered' || rank[verdict] > rank[best.verdict]) {
        best = { verdict, evidence: quoteFor(ans, neg.length ? neg : pos), hits: pos.length,
                 questionKey: q.key };
      }
    });
    return {
      key: crit.key, name: crit.name || crit.key,
      verdict: best.verdict, evidence: best.evidence, questionKey: best.questionKey || null,
      note: best.verdict === 'not_covered'
        ? 'No question in this role bank covers this, or it went unanswered.'
        : 'Matched ' + best.hits + ' phrase(s) from the bank the store owns.'
    };
  });

  const concerns = [];
  (screening.questions || []).forEach((q) => {
    const ans = answers[q.key];
    if (!ans) return;
    const low = String(ans).toLowerCase();
    (q.concernPhrases || []).forEach((p) => {
      if (low.indexOf(String(p).toLowerCase()) < 0) return;
      concerns.push({
        concern: q.concernLabel || 'A phrase on the store concern list',
        /* The matched sentence only. */
        evidence: quoteFor(ans, [p]),
        questionKey: q.key, severity: 'medium'
      });
    });
  });

  const unanswered = (screening.questions || [])
    .filter((q) => !answers[q.key]).map((q) => q.text);

  const met = criteria.filter((c) => c.verdict === 'met').length;
  const notCovered = criteria.filter((c) => c.verdict === 'not_covered').length;
  const notMet = criteria.filter((c) => c.verdict === 'not_met').length;

  /* The recommendation rule is shared with the model reader rather than written
     twice. Two copies would mean a candidate's outcome depended on which reader
     ran, and the difference would be invisible on screen. */
  const rec = recommendFrom(criteria, concerns, unanswered);

  return {
    recommendation: rec.recommendation,
    summary: 'Phrase bank match: ' + met + ' of ' + criteria.length + ' criteria met' +
             (notMet ? ', ' + notMet + ' not met' : '') +
             (notCovered ? ', ' + notCovered + ' not covered by this role bank' : '') + '.',
    criteria, concerns, unansweredQuestions: unanswered,
    /* A count of phrase matches is not a probability and must never render as
       one. Null, because the rubric genuinely does not produce a confidence. */
    confidence: null,
    recommendedNextAction: rec.recommendedNextAction
  };
}

/**
 * The sentences a verdict actually rests on, and only those.
 *
 * TWO REQUIREMENTS THAT PULL AGAINST EACH OTHER, and the resolution is the
 * whole point of this function.
 *
 * It must not quote the whole answer. The previous build did, so a candidate
 * who declined weekends and mentioned childcare in the same answer had a
 * childcare disclosure printed on their rejection screen as the evidence for
 * the concern. The phrase bank no longer scores it and the quote must not
 * carry it either.
 *
 * But it must quote ENOUGH TO SUPPORT THE VERDICT. Returning only the first
 * matching sentence broke that: `met` needs two phrase hits, and when those sat
 * in two different sentences the single quote on screen supported one of them.
 * A verdict whose displayed evidence does not carry it is a verdict nobody can
 * check, which is worse than a long quote.
 *
 * So: every sentence that contributed a match, in the order they were said, and
 * nothing else. Sentences that matched nothing are dropped, which is what keeps
 * the volunteered reason out.
 */
function quoteFor(answer, phrases) {
  const text = String(answer);
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (!phrases || !phrases.length) return sentences[0] || text;
  const low = sentences.map((s) => s.toLowerCase());
  const kept = [];
  for (let i = 0; i < sentences.length; i++) {
    if (phrases.some((p) => low[i].indexOf(String(p).toLowerCase()) >= 0)) kept.push(sentences[i]);
  }
  if (!kept.length) return sentences[0] || text;
  return kept.join(' ');
}

/* ------------------------------------------------------------- our model ---
   B-01 wants a real model reading of the transcript. This is the only place a
   model is called, and it is off unless a base and a key are both set.

   WHY A BASE IS REQUIRED, and this is the honesty fix rather than a
   configuration preference. A key on its own used to flip the mode field to
   'model' with no model call anywhere in the product. Requiring the endpoint
   means the mode can only say 'model' when there was somewhere to call.

   THE WIRE FORMAT IS AN ASSUMPTION. No provider has been chosen for this, so
   the request is the widely implemented chat-completions shape and the endpoint
   is whatever LLM_BASE names. It has never run against a named provider and the
   comment says so rather than the mode field implying otherwise.

   WHAT THE MODEL MAY NOT DO. It may not invent a criterion: every key it
   returns is checked against the requisition's own criteria and dropped
   otherwise. It may not return a verdict outside the four. It may not return a
   recommendation of its own, because the recommendation is derived from the
   verdicts by the same rule the rubric uses, and a model that could write
   'advance' directly would be one prompt injection away from deciding.
   -------------------------------------------------------------------------- */

export const PROMPT_VERSION = 'screen-v1';

function modelConfigured() {
  return !!(process.env.LLM_API_KEY && process.env.LLM_BASE);
}

export async function modelRead(screening, requisition, opts) {
  const o = opts || {};
  if (!modelConfigured()) {
    return { ok: false, error: 'No model is configured. Both LLM_BASE and LLM_API_KEY are needed.' };
  }
  const criteria = (requisition && requisition.criteria) || [];
  if (!criteria.length) return { ok: false, error: 'The requisition declares no criteria, so there is nothing to read against.' };

  const turns = (screening.transcript || [])
    .map((t) => t.speaker + ': ' + t.text).join('\n');
  if (!turns.trim()) return { ok: false, error: 'The screening has no transcript, so there is nothing to read.' };

  const model = process.env.LLM_MODEL || null;
  if (!model) return { ok: false, error: 'LLM_MODEL is not set, so no model was named.' };

  const instruction =
    'You are reading the transcript of one completed job screening call and giving a verdict on each ' +
    'criterion listed. You are not making a hiring decision and nothing you write is one. A named person ' +
    'decides later. For each criterion give exactly one of: met, partly_met, not_met, not_covered. Use ' +
    'not_covered where the call does not cover it, and never infer a verdict from an answer to a different ' +
    'question. Quote the applicant\'s own words as the evidence for each verdict. Score nothing on ' +
    'children, childcare or dependants, marital or family status, pregnancy, age, health, disability, ' +
    'medication or an accommodation request, religion, immigration status, nationality, accent or ' +
    'language, race, sex, gender, criminal history, credit, union activity, military discharge or pay ' +
    'history, whoever raised it. Reply with JSON only: ' +
    '{"criteria":[{"key":"...","verdict":"...","evidence":"..."}]}';

  const body = {
    model,
    max_tokens: 1200,
    temperature: 0,
    messages: [
      { role: 'system', content: instruction },
      { role: 'user', content:
          'Criteria: ' + criteria.map((c) => c.key + ' (' + (c.name || c.key) + ')').join('; ') +
          '\n\nTranscript:\n' + turns }
    ]
  };

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), o.timeoutMs || 20000);
  let raw = null;
  try {
    const res = await fetch(String(process.env.LLM_BASE).replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        /* The key goes in a header and never into a stored row, a log line or a
           response body. */
        'authorization': 'Bearer ' + process.env.LLM_API_KEY
      },
      body: JSON.stringify(body),
      signal: ctl.signal
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: 'The model endpoint returned HTTP ' + res.status + '.' };
    }
    raw = text;
  } catch (e) {
    /* Passed through as it is. Inventing a friendlier reason for a failed call
       is the specific dishonesty this product forbids. */
    return { ok: false, error: e.name === 'AbortError'
      ? 'The model call timed out after ' + ((o.timeoutMs || 20000) / 1000) + ' seconds.'
      : String(e.message || e) };
  } finally {
    clearTimeout(timer);
  }

  const parsed = parseModelReply(raw);
  if (!parsed) return { ok: false, error: 'The model reply was not JSON in the shape asked for.' };

  const allowed = {};
  criteria.forEach((c) => { allowed[c.key] = c.name || c.key; });
  const rows = [], rejected = [];
  (parsed.criteria || []).forEach((r) => {
    const key = r && r.key;
    if (!allowed[key]) { rejected.push({ key: key || null, why: 'not a criterion on this requisition' }); return; }
    if (VERDICTS.indexOf(r.verdict) < 0) { rejected.push({ key, why: 'verdict outside the four' }); return; }
    if (rows.some((x) => x.key === key)) { rejected.push({ key, why: 'the model returned it twice' }); return; }
    rows.push({
      key, name: allowed[key], verdict: r.verdict,
      evidence: r.evidence ? String(r.evidence) : null,
      questionKey: null,
      note: 'Read from the transcript by ' + model + ', prompt ' + PROMPT_VERSION + '.'
    });
  });

  /* Every declared criterion appears, so a model that answered four of five
     produces not_covered on the fifth rather than a shorter list that reads as
     a clean sheet. */
  criteria.forEach((c) => {
    if (rows.some((x) => x.key === c.key)) return;
    rows.push({ key: c.key, name: c.name || c.key, verdict: 'not_covered', evidence: null,
                questionKey: null, note: 'The model returned no verdict on this criterion.' });
  });

  if (!rows.some((r) => r.verdict !== 'not_covered')) {
    return { ok: false, error: 'The model returned no usable verdict on any criterion.' };
  }

  return {
    ok: true,
    meta: { model, promptVersion: PROMPT_VERSION, rejected },
    reading: Object.assign(recommendFrom(rows, [], []), {
      criteria: rows, concerns: [], unansweredQuestions: [], confidence: null
    })
  };
}

/** The reply, whether or not the provider wrapped it in a chat envelope. */
function parseModelReply(raw) {
  let text = String(raw || '');
  try {
    const env = JSON.parse(text);
    const inner = env && env.choices && env.choices[0] && env.choices[0].message &&
                  env.choices[0].message.content;
    if (typeof inner === 'string') text = inner;
    else if (env && Array.isArray(env.criteria)) return env;
  } catch (e) { /* not an envelope, so it may be the object itself */ }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    return obj && Array.isArray(obj.criteria) ? obj : null;
  } catch (e) { return null; }
}

/**
 * The recommendation, derived from verdicts by ONE rule whoever read them.
 *
 * Shared on purpose. Two rules, one for the rubric and one for the model, would
 * mean a candidate's outcome depended on which reader ran, and the difference
 * would be invisible on screen.
 */
function recommendFrom(criteria, concerns, unanswered) {
  const met = criteria.filter((c) => c.verdict === 'met').length;
  const notCovered = criteria.filter((c) => c.verdict === 'not_covered').length;
  const notMet = criteria.filter((c) => c.verdict === 'not_met').length;
  let recommendation;
  if (notCovered >= Math.ceil(criteria.length / 2) || unanswered.length >= 3) {
    recommendation = 'insufficient_evidence';
  } else if (notMet > 0 || concerns.length > 0) {
    recommendation = 'review';
  } else if (met >= Math.ceil(criteria.length * 0.6)) {
    recommendation = 'advance';
  } else {
    recommendation = 'review';
  }
  return {
    recommendation,
    summary: met + ' of ' + criteria.length + ' criteria met' +
             (notMet ? ', ' + notMet + ' not met' : '') +
             (notCovered ? ', ' + notCovered + ' not covered' : '') + '.',
    recommendedNextAction: recommendation === 'advance'
      ? 'Put this in front of the manager for a decision.'
      : 'A person should read the transcript before deciding.'
  };
}

/* ------------------------------------------------------------- evaluate --- */

/**
 * Score a screening and close it.
 *
 * `mode` is resolved from WHAT ACTUALLY RAN and it is the whole honesty
 * contract. It says 'model' only when a model returned verdicts this product
 * could use. Otherwise it is the deterministic rubric and the note says no
 * model ran, whether or not a key is sitting in the environment.
 *
 * `opts.keepStatus` leaves the screening's status alone, for the live path,
 * where livecall.js owns the status field and its `scored` stage writes it.
 * Without that the two would fight over one field and the stage would be
 * refused as already reached.
 */
export async function evaluate(store, ctx, screening, opts) {
  const o = opts || {};
  const app = store.byId('applications', ctx.tenantId, screening.applicationId);
  const req = app ? store.byId('requisitions', ctx.tenantId, app.requisitionId) : null;
  const now = ctx.clock.now();

  const started = Date.now();
  let modelError = null, modelMeta = null, reading = null;
  if (!o.forceFallback && modelConfigured()) {
    const m = await modelRead(screening, req);
    if (m.ok) { reading = m.reading; modelMeta = m.meta; }
    else modelError = m.error;
  }
  const isModel = !!reading;
  const evaluation = reading || rubric(store, ctx, screening, req);
  /* Whatever ran, including a model attempt that failed before the rubric ran.
     A latency that excluded the failed attempt would under-report the wait the
     candidate actually had. */
  const latencyMs = Date.now() - started;

  const meta = {
    mode: isModel ? 'model' : 'deterministic-fallback',
    isModel,
    model: isModel ? modelMeta.model : null,
    /* The sentence a screen must print when no model ran. Owned here so no page
       can soften it, and it names the reason rather than being one string for
       three different situations. */
    note: isModel ? null : fallbackNote(modelError),
    promptVersion: isModel ? modelMeta.promptVersion : null,
    latencyMs, at: now,
    /* Our reading. The platform's is a separate object and the two are never
       averaged, because there is no scale they share. */
    reader: 'ours'
  };

  store.insert('llmCalls', {
    id: store.nextId('llm'), tenantId: ctx.tenantId,
    at: now, applicationId: screening.applicationId, candidateId: screening.candidateId,
    screeningId: screening.id,
    mode: meta.mode, model: meta.model, latencyMs,
    /* The evaluation, the evidence and the confidence are kept. The chain of
       thought is not, and there is nowhere here to put one. */
    recommendation: evaluation.recommendation,
    criteria: evaluation.criteria.map((c) => ({ key: c.key, verdict: c.verdict })),
    /* A failed model attempt is recorded as a failed attempt. It used to be
       impossible for this row to say ok:false, because nothing was ever
       attempted. */
    ok: !modelError, error: modelError
  });

  const patch = {
    completedAt: screening.completedAt || now,
    evaluation, evaluationMeta: meta
  };
  if (!o.keepStatus) patch.status = 'complete';
  Object.assign(screening, patch);
  store.markDirty();

  EV.workflowEvent(store, ctx, {
    applicationId: screening.applicationId, candidateId: screening.candidateId,
    at: now, kind: 'work', state: 'SCREENING_COMPLETE', step: 3, owner: 'agent',
    actorType: 'agent', actor: isModel ? 'Screening model' : 'Phrase bank rubric',
    durationMs: Math.max(latencyMs, 800),
    detail: evaluation.summary + ' [' + meta.mode + ']',
    ref: screening.id
  });
  EV.auditEvent(store, ctx, {
    at: now, action: 'screening.evaluated',
    actorType: 'agent', actor: isModel ? 'Screening model' : 'Phrase bank rubric',
    subjectType: 'screening', subjectId: screening.id,
    applicationId: screening.applicationId, candidateId: screening.candidateId,
    why: 'Produced a recommendation and cited evidence. It cannot approve or reject anybody.',
    detail: { mode: meta.mode, recommendation: evaluation.recommendation, modelError },
    source: 'workflow'
  });

  return { ok: true, evaluation, meta };
}

function fallbackNote(modelError) {
  if (modelError) {
    return 'No model ran. The model call failed and this is the deterministic phrase bank the store ' +
           'owns and edits. The reason given was: ' + modelError;
  }
  if (process.env.LLM_API_KEY && !process.env.LLM_BASE) {
    return 'No model ran. This is the deterministic phrase bank the store owns and edits. A model key is ' +
           'set and LLM_BASE is not, so no model call was attempted and the key on its own changes nothing.';
  }
  return 'No model ran. This is the deterministic phrase bank the store owns and edits.';
}

/* ------------------------------------------------- the platform's reading ---
   The second reader. Five per-criterion verdicts, plus how many bank questions
   were asked and whether the agent broke its own ban list.

   WHERE IT COMES FROM. The properties are extracted by the platform after the
   call and read back through the post-conversation endpoints. Three payloads
   could carry them and the reader looks in all three, recording which one it
   found them in. That is not defensive padding: the exact home of an
   agent-defined property has not been seen on a real completed call, and
   guessing one and finding nothing would look identical to a call that produced
   no analysis.

   WHAT IT WILL NOT DO. It will not coerce a value into a verdict. A property
   that comes back outside the four is recorded as rejected with the value, and
   the criterion counts as unread. A cross-check that quietly treated an
   unreadable value as agreement would be worse than no cross-check.
   -------------------------------------------------------------------------- */

export function readPlatformAnalysis(collected, criteriaKeys) {
  const keys = criteriaKeys && criteriaKeys.length ? criteriaKeys : PLATFORM_PROPERTIES;
  const sources = [];
  const ex = collected && collected.extracted;
  if (ex && ex.runtime && Object.keys(ex.runtime).length) sources.push(['runtime_variables', ex.runtime]);
  if (ex && ex.input && Object.keys(ex.input).length) sources.push(['input_variables', ex.input]);
  if (collected && collected.postCall && collected.postCall.raw) sources.push(['post_call', collected.postCall.raw]);

  const verdicts = {}, rejected = [];
  let source = null, evidence = {}, questionsAsked = null, bannedTopicRaised = null;

  for (const [name, bag] of sources) {
    let used = false;
    keys.forEach((k) => {
      if (verdicts[k] != null) return;
      const v = bag[k];
      if (v == null || v === '') return;
      const s = String(v).trim().toLowerCase();
      if (VERDICTS.indexOf(s) >= 0) { verdicts[k] = s; used = true; }
      else rejected.push({ key: k, value: String(v), source: name, why: 'not one of the four verdicts' });
    });
    if (bag.questions_asked != null && questionsAsked == null) {
      const n = Number(bag.questions_asked);
      if (Number.isFinite(n)) { questionsAsked = n; used = true; }
      else rejected.push({ key: 'questions_asked', value: String(bag.questions_asked), source: name, why: 'not a number' });
    }
    if (bag.banned_topic_raised != null && bannedTopicRaised == null) {
      const s = String(bag.banned_topic_raised).trim().toLowerCase();
      if (['no', 'yes_acknowledged', 'yes_pursued'].indexOf(s) >= 0) { bannedTopicRaised = s; used = true; }
      else rejected.push({ key: 'banned_topic_raised', value: String(bag.banned_topic_raised), source: name, why: 'not one of the three values' });
    }
    if (bag.evidence != null && !Object.keys(evidence).length) {
      const e = asEvidenceMap(bag.evidence);
      if (e) { evidence = e; used = true; }
    }
    if (used && !source) source = name;
  }

  const found = Object.keys(verdicts).length > 0 || bannedTopicRaised != null || questionsAsked != null;

  /* The platform's quote is chosen by a model we do not control, out of what an
     applicant said. Where it carries something that may never be scored, the
     quote is withheld from every surface and the reason is recorded. The
     verdict still stands and is still comparable. */
  const screened = {};
  Object.keys(evidence).forEach((k) => {
    const hits = tripsProtectedLanguage(evidence[k]);
    screened[k] = hits.length
      ? { quote: null, withheld: true,
          why: 'The platform quoted something that may never be scored, so the quote is not shown. ' +
               'This product has printed a disclosure on screen as adverse evidence twice.' }
      : { quote: String(evidence[k]), withheld: false, why: null };
  });

  return {
    reader: 'agentx',
    found,
    source,
    verdicts,
    evidence: screened,
    questionsAsked,
    bannedTopicRaised,
    rejected,
    /* Passed through with the platform's own names, deliberately. call_outcome
       is about the call and never about the candidate, and renaming it to
       something that sounds like a score is how a POSITIVE turns into a
       recommendation about a person. */
    callOutcome: collected && collected.postCall ? collected.postCall.callOutcome : null,
    summary: collected && collected.postCall ? collected.postCall.summary : null,
    at: collected ? collected.at : null,
    why: found ? null
      : 'The platform has returned no per-criterion analysis for this call. The second reader is ' +
        'configured and has not returned, so there is nothing to compare.'
  };
}

/** The evidence map, whether it arrives as an object or as a JSON string. */
function asEvidenceMap(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v;
  if (typeof v !== 'string') return null;
  try {
    const o = JSON.parse(v);
    return o && typeof o === 'object' && !Array.isArray(o) ? o : null;
  } catch (e) { return null; }
}

/**
 * Compare our reading with the platform's, per criterion.
 *
 * Never averaged, never normalised, never reduced to one number. A disagreement
 * is a named criterion where the two readers differ, and under B-07 it raises a
 * blocking exception so a person looks rather than the product picking a side.
 *
 * The agreement state is a CONCLUSION and never a subtraction. U-36. When the
 * platform has not returned, the state is 'not_comparable' with the reason, and
 * no surface may compute an agreement from one reader.
 */
export function crossCheck(ours, theirs) {
  if (!ours || !theirs || !theirs.found) {
    return {
      comparable: false,
      agreement: 'not_comparable',
      why: !ours ? 'Our evaluation has not run yet.'
        : (theirs && theirs.why) || 'The platform analysis has not arrived yet, so there is nothing to compare.',
      rows: [], disagreements: [], conductFlag: null, questionsAsked: null
    };
  }
  const mine = {};
  (ours.criteria || []).forEach((c) => { mine[c.key] = c; });

  const rows = Object.keys(mine).map((key) => {
    const a = mine[key].verdict;
    const b = theirs.verdicts[key] || null;
    const ev = theirs.evidence[key] || null;
    return {
      key, name: mine[key].name || key,
      ours: a, theirs: b,
      oursEvidence: mine[key].evidence || null,
      theirsEvidence: ev && !ev.withheld ? ev.quote : null,
      theirsEvidenceWithheld: !!(ev && ev.withheld),
      /* not_covered on either side is not a disagreement. One reader saw that
         the question was never asked and the other agreed or said nothing. */
      agree: b == null ? null : (a === b),
      material: b != null && a !== b && a !== 'not_covered' && b !== 'not_covered'
    };
  });

  const disagreements = rows.filter((r) => r.material);
  const compared = rows.filter((r) => r.theirs != null).length;

  return {
    comparable: compared > 0,
    /* Three states and no fourth. A criterion the platform did not read is not
       agreement. */
    agreement: compared === 0 ? 'not_comparable'
      : (disagreements.length ? 'disagreed' : 'agreed'),
    why: compared === 0 ? theirs.why : null,
    rows,
    comparedCount: compared,
    disagreements,
    /* The platform reported that the agent pursued a protected characteristic.
       That is an incident about the AGENT and it may never feed a hiring
       decision, so it is surfaced separately from the comparison. */
    conductFlag: theirs.bannedTopicRaised === 'yes_pursued'
      ? { severity: 'crit',
          what: 'The call analysis reports that the agent asked a follow-up about a protected characteristic.',
          note: 'This is about the agent and not about the applicant. It may not affect any hiring decision.' }
      : null,
    questionsAsked: theirs.questionsAsked
  };
}

/* --------------------------------------------------- lining up the answers ---
   A live transcript is speaker turns, and the rubric needs answers keyed by
   question. This puts them together and it never guesses.

   FIRST CHOICE IS THE PROVIDER'S OWN PROVENANCE. A DerivedVariableCapture
   carries the key, the value and the user turn it came from, which is exactly
   what a regulated hiring record needs. Where the agent is configured to
   capture per question, that is used and nothing is inferred.

   SECOND CHOICE IS ALIGNMENT. The agent asks the bank in order, so each
   question is matched to the agent turn that carries it and the candidate's
   next turn is the answer. Matching is word overlap against the question text.

   THE THRESHOLD IS CHOSEN, NOT MEASURED, and it is set so that a miss is
   visible. A question that matches nothing is left unanswered, the rubric marks
   that criterion not_covered, and enough of those make the recommendation
   'insufficient_evidence', which a person has to read. The opposite failure,
   attaching the wrong answer to a question, would look like a clean result and
   is the one this must not do.
   -------------------------------------------------------------------------- */

const ALIGN_MIN_OVERLAP = 0.5;

const STOPWORDS = ['the', 'a', 'an', 'and', 'or', 'to', 'of', 'is', 'are', 'do', 'does', 'you', 'your',
  'that', 'this', 'it', 'in', 'on', 'for', 'with', 'be', 'can', 'could', 'would', 'we', 'our', 'i',
  'at', 'as', 'if', 'so', 'up', 'any', 'about', 'what', 'how', 'have', 'has'];

function words(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter((w) => w && w.length > 2 && STOPWORDS.indexOf(w) < 0);
}

/* Which side of the call a turn came from. The provider's speaker values have
   not been seen on a completed call, so this matches the words a provider is
   likely to use and treats everything else as the candidate. A misread here
   produces unanswered questions rather than wrong answers. */
function isAgentTurn(t) {
  return /agent|assistant|bot|\bai\b|system/i.test(String((t && t.speaker) || ''));
}

export function alignTranscript(screening, turns, captures) {
  const questions = screening.questions || [];
  const rows = [], notes = [];
  const byKey = {};
  (captures || []).forEach((c) => { if (c && c.key != null) byKey[String(c.key)] = c; });

  let searchFrom = 0;
  questions.forEach((q) => {
    const cap = byKey[q.key];
    if (cap && cap.value != null && String(cap.value).trim()) {
      rows.push({ questionKey: q.key, question: q.text, answer: String(cap.value),
                  answeredAt: null, channel: screening.channel,
                  source: 'provider_capture', turnIndex: cap.turnIndex != null ? cap.turnIndex : null });
      return;
    }
    const qw = words(q.text);
    let best = -1, bestScore = 0;
    for (let i = searchFrom; i < turns.length; i++) {
      if (!isAgentTurn(turns[i])) continue;
      const tw = words(turns[i].text);
      if (!qw.length) break;
      const shared = qw.filter((w) => tw.indexOf(w) >= 0).length;
      const score = shared / qw.length;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    if (best < 0 || bestScore < ALIGN_MIN_OVERLAP) {
      rows.push({ questionKey: q.key, question: q.text, answer: null,
                  answeredAt: null, channel: screening.channel, source: 'unmatched', turnIndex: null });
      notes.push('No turn in the transcript matched the question "' + q.text.slice(0, 60) + '".');
      return;
    }
    /* The answer is the candidate's turns after that question and before the
       next agent turn, joined, because people answer in more than one breath. */
    const parts = [];
    let j = best + 1;
    for (; j < turns.length && !isAgentTurn(turns[j]); j++) {
      if (turns[j].text) parts.push(String(turns[j].text));
    }
    searchFrom = Math.max(searchFrom, j);
    rows.push({
      questionKey: q.key, question: q.text,
      answer: parts.length ? parts.join(' ') : null,
      answeredAt: turns[best + 1] ? turns[best + 1].at || null : null,
      channel: screening.channel,
      source: parts.length ? 'aligned' : 'no_answer',
      turnIndex: best + 1,
      matchScore: Number(bestScore.toFixed(2))
    });
    if (!parts.length) notes.push('The question "' + q.text.slice(0, 60) + '" was asked and nothing followed it.');
  });

  return { responses: rows, notes };
}

/* ------------------------------------------------------------ the read back ---
   What turns a placed call into a screening record. This is the piece that did
   not exist.
   -------------------------------------------------------------------------- */

/**
 * Read one finished call back, run both readers, and compare them.
 *
 * Returns { ok, stage, evaluation, platform, crossCheck, exceptions } or
 * { ok: false, reason }. It never throws for a provider failure, because a
 * provider failure is something the interface has to render.
 */
export async function collectResult(store, ctx, screening, opts) {
  const o = opts || {};
  const call = screening.call || {};
  if (!call.providerCallId) {
    return { ok: false, reason: 'This screening has no provider call id, so there is nothing to read back.' };
  }
  if (screening.status === 'complete') {
    return { ok: false, reason: 'This screening is already scored.' };
  }

  /* The conversation id is passed as the call id. The two are believed to be
     the same identifier and that has not been confirmed on a completed call, so
     the reader treats a missing extraction as "not returned" rather than as a
     failure. */
  const collected = o.collected ||
    await AGENTX.collect(call.providerCallId, call.conversationId || call.providerCallId);

  const providerStatus = collected.call ? collected.call.status : null;
  const evidence = 'provider_status:' + (providerStatus || 'unknown');

  /* Stage first, so the live view moves even when the analysis is late. */
  if (LIVE.stageOf(screening) !== 'ended' && LIVE.stageOf(screening) !== 'scoring') {
    const e = LIVE.advance(store, ctx, screening, 'ended', {
      evidence,
      detail: collected.call && collected.call.endReason ? 'Provider end reason: ' + collected.call.endReason : null,
      provider: providerStatus ? { status: providerStatus,
        startTime: collected.call.startTime, endTime: collected.call.endTime,
        duration: collected.call.duration } : null
    });
    if (!e.ok) return { ok: false, reason: e.reason };
  }

  const turns = (collected.transcript && collected.transcript.turns) || [];
  const captures = (collected.transcript && collected.transcript.captures) || [];

  /* A call that nobody answered has nothing to score. Scoring it would produce
     a set of not_covered verdicts that read like a poor candidate rather than
     an unreached one, so it stops here and a person picks it up. */
  if (!LIVE.reachedConversation(screening)) {
    const ex = noResultException(store, ctx, screening,
      'The provider reports ' + (providerStatus || 'no status') +
      (collected.call && collected.call.endReason ? ' and end reason ' + collected.call.endReason : '') +
      '. The call never reached a conversation, so neither reader has anything to read. Nothing ' +
      'about the applicant follows from this.');
    return { ok: false, reason: 'The call produced no conversation to score.',
             stage: LIVE.stageOf(screening), exceptions: [ex.id] };
  }

  /* THE TRANSCRIPT IS WRITTEN SOME SECONDS AFTER THE CALL ENDS, so an empty one
     on the first read is normal and is not a failure. Raising an exception here
     would put a false "no conversation" flag on a candidate who talked for five
     minutes. The caller retries, and if it never arrives the watch raises the
     exception when it gives up. */
  if (!turns.length) {
    const tr = (collected.errors || []).find((e) => e.part === 'transcript');
    return { ok: false, retry: true, stage: LIVE.stageOf(screening),
             reason: 'The call is over and the transcript has not been written yet' +
                     (tr && tr.error ? ': ' + tr.error : '.') };
  }

  const s = LIVE.advance(store, ctx, screening, 'scoring', { detail: turns.length + ' turns returned.' });
  if (!s.ok) return { ok: false, reason: s.reason };

  /* The transcript is stored as the provider gave it. It is a record of what
     somebody said and this module does not tidy it. */
  const aligned = alignTranscript(screening, turns, captures);
  Object.assign(screening, {
    transcript: turns.map((t) => ({ speaker: t.speaker, at: t.at, text: t.text,
                                    interrupted: !!t.interrupted, confidence: t.confidence })),
    responses: aligned.responses,
    /* The transport that actually ran, not the word 'live'. A fixture run
       recorded as a live conversation would be the same lie as a simulated call
       recorded as a real one, one layer up. */
    conversationMode: (screening.live && screening.live.transport) || AGENTX.mode(),
    transcriptNotes: aligned.notes,
    providerCall: collected.call ? {
      status: collected.call.status, disposition: collected.call.disposition,
      endReason: collected.call.endReason, duration: collected.call.duration,
      /* Provider wall clock, kept apart from our clock deliberately. */
      startTime: collected.call.startTime, endTime: collected.call.endTime
    } : null
  });
  store.markDirty();

  const app = store.byId('applications', ctx.tenantId, screening.applicationId);
  const req = app ? store.byId('requisitions', ctx.tenantId, app.requisitionId) : null;
  const criteriaKeys = ((req && req.criteria) || []).map((c) => c.key);

  const platform = readPlatformAnalysis(collected, criteriaKeys);
  screening.platformReading = platform;
  store.markDirty();

  const ours = await evaluate(store, ctx, screening, { keepStatus: true });
  const cross = crossCheck(ours.evaluation, platform);
  screening.crossCheck = cross;
  store.markDirty();

  EV.auditEvent(store, ctx, {
    action: 'screening.result.collected',
    actorType: 'system', actor: 'agentX result reader',
    subjectType: 'screening', subjectId: screening.id,
    applicationId: screening.applicationId, candidateId: screening.candidateId,
    why: 'Read the transcript and the platform analysis back and compared the two readers.',
    detail: { turns: turns.length, platformFound: platform.found, platformSource: platform.source,
              agreement: cross.agreement, disagreements: cross.disagreements.length,
              pending: collected.pending, errors: collected.errors.map((e) => e.part) },
    source: 'connector'
  });

  /* THREE STEPS IN THIS ORDER, and the order is the whole of B-07.
     The stage goes to scored first, which moves the application to screening
     complete while nothing is blocking it. The exceptions are raised second.
     The automatic edges are followed third, where an open blocking exception
     stops the advance to the decision queue and the candidate parks at
     screening complete, which is what U-13 says happens. Raise before advance
     and the engine refuses the move, because it refuses every non-human move
     while an exception is open, and the candidate is stranded a state early. */
  const fin = LIVE.advance(store, ctx, screening, 'scored', {
    detail: cross.agreement === 'agreed' ? 'Both readers agree.'
      : cross.agreement === 'disagreed' ? cross.disagreements.length + ' criteria disagree.'
      : 'One reader only. The platform analysis has not returned.'
  });
  const raised = raiseCrossCheckExceptions(store, ctx, screening, cross);
  const settled = LIVE.settleAfter(store, ctx, screening);

  return {
    ok: true,
    stage: LIVE.stageOf(screening),
    moved: fin.moved || null,
    settled,
    evaluation: ours.evaluation, meta: ours.meta,
    platform, crossCheck: cross,
    exceptions: raised.map((e) => e.id),
    providerErrors: collected.errors
  };
}

/**
 * Nothing came back, so a person has to pick this candidate up.
 *
 * One writer for both ways it happens, a call nobody answered and a result that
 * never arrived, because the thing a manager has to do about it is the same and
 * two texts would drift apart.
 */
function noResultException(store, ctx, screening, detail) {
  const ex = EV.raiseException(store, ctx, {
    applicationId: screening.applicationId, candidateId: screening.candidateId,
    /* Warn rather than crit, and it blocks anyway. A call nobody answered is
       routine chasing, not an emergency, and a register where every row is crit
       tells a manager nothing about what to do first. What it must not be is
       silent, because nothing else in the product would ever move this person
       again. */
    kind: 'failed_evaluation', severity: 'warn', blocksProgress: true, owner: 'human',
    title: 'The screening call produced no conversation to score',
    detail,
    nextAction: 'Try the call again or send the browser call link, and do not hold this against the applicant.'
  });
  store.markDirty();
  return ex;
}

/**
 * The two exceptions the cross-check can raise, and they are different things.
 *
 * A DISAGREEMENT is about the candidate's answers and it blocks progress, which
 * is B-07 exactly: neither reader wins, the automatic advance stops, and a
 * person resolves it. It follows the rehire-hold pattern: blocksProgress true,
 * severity crit, owner human, and a reason required whichever way it goes.
 *
 * A CONDUCT INCIDENT is about the AGENT. `banned_topic_raised: yes_pursued`
 * means the agent followed up on a protected characteristic, which is a failure
 * of ours and not a fact about the applicant. It is a separate kind so that
 * nothing which reads hiring signal can ever pick it up, and its text says
 * plainly that it may not affect the decision.
 */
function raiseCrossCheckExceptions(store, ctx, screening, cross) {
  const out = [];

  if (cross.conductFlag) {
    out.push(EV.raiseException(store, ctx, {
      applicationId: screening.applicationId, candidateId: screening.candidateId,
      kind: 'agent_conduct', severity: 'crit', blocksProgress: true, owner: 'human',
      title: 'The screening agent followed up on a protected characteristic',
      detail: cross.conductFlag.what + ' ' + cross.conductFlag.note +
              ' The call is an incident to review and the applicant is not at fault. Nothing in any ' +
              'hiring decision may read this flag.',
      nextAction: 'Read the transcript, record what the agent did, and decide whether this screening ' +
                  'can be used at all. Do not score the applicant on it.'
    }));
  }

  if (cross.disagreements.length) {
    const named = cross.disagreements
      .map((d) => d.name + ': we say ' + d.ours.replace(/_/g, ' ') + ', the call analysis says ' +
                  d.theirs.replace(/_/g, ' '))
      .join('. ');
    out.push(EV.raiseException(store, ctx, {
      applicationId: screening.applicationId, candidateId: screening.candidateId,
      kind: 'score_disagreement', severity: 'crit', blocksProgress: true, owner: 'human',
      title: cross.disagreements.length === 1
        ? 'The two readings of this call disagree on one criterion'
        : 'The two readings of this call disagree on ' + cross.disagreements.length + ' criteria',
      detail: named + '. Neither reading wins and neither is a decision. The quoted evidence for each ' +
              'sits on the screening.',
      nextAction: 'Read the evidence behind both readings and record which you accept, with a reason.'
    }));
  }

  if (out.length) store.markDirty();
  return out;
}

/* --------------------------------------------------------------- polling ---
   No public address is needed. The result is collected by polling, which is why
   the demo works from anywhere that can make outbound requests.
   -------------------------------------------------------------------------- */

/**
 * One provider read. Moves the stage, and does the whole read back once the
 * provider says the call is over. Never blocks for longer than one request.
 */
export async function pollCall(store, ctx, screening) {
  const call = screening.call || {};
  if (!call.providerCallId) return { ok: false, reason: 'No provider call id on this screening.' };
  if (screening.status === 'complete') return { ok: true, done: true, stage: 'scored' };

  const rec = await AGENTX.getCall(call.providerCallId);
  if (!rec.ok) {
    return { ok: false, reason: rec.error, stage: LIVE.stageOf(screening), retryable: true };
  }

  /* Which stages the provider's status genuinely implies, worked out by the
     stage machine rather than here. A status that says the call never connected
     fills no intermediate stages. */
  let moved = null;
  for (const key of LIVE.pathTo(LIVE.stageOf(screening), rec.status)) {
    const r = LIVE.advance(store, ctx, screening, key, {
      evidence: 'provider_status:' + rec.status,
      provider: { status: rec.status, duration: rec.duration }
    });
    if (!r.ok) break;
    moved = key;
  }

  if (!LIVE.providerSaysEnded(rec.status)) {
    return { ok: true, done: false, stage: LIVE.stageOf(screening), providerStatus: rec.status, moved };
  }

  const result = await collectResult(store, ctx, screening, {});
  /* Not done when the transcript has not been written yet. The call is over and
     the words are still coming, so the next tick tries again. */
  return { ok: result.ok, done: !result.retry, stage: LIVE.stageOf(screening),
           providerStatus: rec.status, reason: result.reason || null, result };
}

/**
 * Poll one call until it is over, in the background.
 *
 * Returns a handle immediately, so a request never waits on a phone call.
 * Bounded, and it records why it stopped rather than going quiet: a live view
 * stuck on 'connected' with no explanation is the failure this replaces.
 *
 * The screening row is re-read every tick. A reseed replaces every row in the
 * database, and a loop still writing to the old object would be writing into
 * nothing.
 */
export function watchCall(store, ctx, screening, opts) {
  const o = opts || {};
  const everyMs = o.everyMs || 4000;
  const upToMs = o.upToMs || 15 * 60 * 1000;
  const id = screening.id;
  const started = Date.now();
  const sys = Object.assign({}, ctx, { actor: { type: 'system', name: 'agentX result reader' } });
  let stopped = false;
  let timer = null;

  async function tick() {
    if (stopped) return;
    const row = store.byId('screenings', sys.tenantId, id);
    if (!row) { stopped = true; return; }
    let r = null;
    try {
      r = await pollCall(store, sys, row);
    } catch (e) {
      /* A crash in a background loop must not take the process with it, and it
         must not disappear either. */
      EV.auditEvent(store, sys, {
        action: 'screening.result.poll', actorType: 'system', actor: 'agentX result reader',
        subjectType: 'screening', subjectId: id, applicationId: row.applicationId,
        why: 'The result poll threw: ' + String(e.message || e), outcome: 'failed', source: 'connector'
      });
      stopped = true;
      return;
    }
    if (r && r.done) { stopped = true; store.flushNow(); return; }
    if (Date.now() - started >= upToMs) {
      stopped = true;
      const why = 'Gave up after ' + Math.round(upToMs / 60000) + ' minutes. The provider last reported ' +
                  ((r && r.providerStatus) || 'nothing') + ' and the call is at ' +
                  (LIVE.stageOf(row) || 'queued') + '.';
      EV.auditEvent(store, sys, {
        action: 'screening.result.poll', actorType: 'system', actor: 'agentX result reader',
        subjectType: 'screening', subjectId: id, applicationId: row.applicationId,
        why, outcome: 'failed', source: 'connector'
      });
      /* Giving up quietly is how a candidate disappears. A screening that never
         got a result gets the same exception a call nobody answered gets, so
         somebody sees them. */
      if (row.status !== 'complete') noResultException(store, sys, row, why);
      store.flushNow();
      return;
    }
    timer = setTimeout(tick, everyMs);
    /* Unreferenced so a pending poll cannot hold the process open. */
    if (timer && timer.unref) timer.unref();
  }

  timer = setTimeout(tick, o.startAfterMs != null ? o.startAfterMs : everyMs);
  if (timer && timer.unref) timer.unref();

  return {
    screeningId: id,
    stop() { stopped = true; if (timer) clearTimeout(timer); }
  };
}

/* ---------------------------------------------------------- the payload ---
   The two readings, in their own terms, for the surfaces that show them. One
   function so that U-04's drawer, U-15's row and U-36's screening page cannot
   drift into three different answers about the same screening.

   THERE IS NO SCORE IN HERE. The platform has no numeric score, our rubric
   produces no number, and U-36's "ours numeric" cannot be honoured without
   inventing one. Per-criterion verdicts from both readers, and an agreement
   state that is a conclusion rather than a subtraction.
   -------------------------------------------------------------------------- */

export function readings(store, ctx, screening) {
  const ours = screening.evaluation || null;
  const platform = screening.platformReading || null;
  const cross = screening.crossCheck ||
    crossCheck(ours, platform || { found: false, why: 'The platform analysis has not been read for this screening.' });

  return {
    screeningId: screening.id,
    applicationId: screening.applicationId,
    stage: LIVE.stageOf(screening),
    conversationMode: screening.conversationMode || null,
    ours: ours ? {
      reader: 'ours',
      mode: screening.evaluationMeta ? screening.evaluationMeta.mode : null,
      isModel: screening.evaluationMeta ? !!screening.evaluationMeta.isModel : false,
      /* The sentence every surface has to print when no model ran. */
      note: screening.evaluationMeta ? screening.evaluationMeta.note : null,
      recommendation: ours.recommendation,
      summary: ours.summary,
      criteria: ours.criteria,
      concerns: ours.concerns
    } : null,
    theirs: platform && platform.found ? {
      reader: 'agentx',
      source: platform.source,
      verdicts: platform.verdicts,
      evidence: platform.evidence,
      questionsAsked: platform.questionsAsked,
      questionsInBank: (screening.questions || []).length,
      /* Never a hiring signal. It is about the call. */
      callOutcome: platform.callOutcome,
      rejected: platform.rejected
    } : null,
    theirsWhy: platform && !platform.found ? platform.why
      : (!platform ? 'The platform analysis has not been read for this screening.' : null),
    agreement: cross.agreement,
    agreementWhy: cross.why,
    rows: cross.rows,
    disagreements: cross.disagreements,
    conductFlag: cross.conductFlag
  };
}
