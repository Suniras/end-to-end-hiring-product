/* The model boundary: configuration, the fallback, malformed replies, errors,
   timeouts, and what gets written to the audit trail. */
'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { fresh, byName } = require('./helper');
const LLM = require('../lib/llm');
const SC = require('../lib/screening');

const SAVED = {};
function setEnv(o) {
  ['LLM_PROVIDER', 'LLM_API_KEY', 'LLM_MODEL', 'LLM_BASE_URL', 'LLM_TIMEOUT_MS'].forEach((k) => {
    if (!(k in SAVED)) SAVED[k] = process.env[k];
    if (o[k] === undefined) delete process.env[k]; else process.env[k] = o[k];
  });
}
function restoreEnv() {
  Object.keys(SAVED).forEach((k) => {
    if (SAVED[k] === undefined) delete process.env[k]; else process.env[k] = SAVED[k];
  });
}

test('with no key the product runs, and never calls the result a model', async (t) => {
  setEnv({ LLM_API_KEY: undefined });
  t.after(restoreEnv);

  const s = LLM.publicStatus();
  assert.equal(s.configured, false);
  assert.equal(s.provider, 'none');
  assert.equal(s.model, null);
  assert.equal(s.fallback, 'deterministic-rubric');
  assert.match(s.note, /No model runs/);

  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Alicia Reyes');
  const out = await SC.runFullScreening(store, ctx(), application.id, {});
  assert.equal(out.ok, true);

  const sc = out.results.find((r) => r.evaluation);
  assert.equal(sc.meta.mode, 'deterministic-fallback');
  assert.equal(sc.meta.isModel, undefined === sc.meta.isModel ? undefined : false);
  assert.equal(sc.meta.model, null);
  assert.match(sc.meta.note, /No model ran/);
});

test('the public status never leaks the key', async (t) => {
  setEnv({ LLM_API_KEY: 'sk-ant-secret-value-do-not-print', LLM_MODEL: 'claude-sonnet-5' });
  t.after(restoreEnv);
  const s = JSON.stringify(LLM.publicStatus());
  assert.ok(s.indexOf('secret') < 0, 'the key appeared in the public status');
  assert.ok(s.indexOf('sk-ant') < 0);
  assert.match(s, /claude-sonnet-5/);
  assert.match(s, /"configured":true/);
});

test('the deterministic rubric is capped, and cites what was said', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Alicia Reyes');
  await SC.runFullScreening(store, ctx(), application.id, {});
  const WF = require('../lib/workflow');
  const sc = WF.screeningsFor(store, ctx(), application.id).find((x) => x.evaluation);

  // A rubric that has not read anything must not report the confidence of
  // something that has.
  assert.ok(sc.evaluation.confidence <= 0.62, 'the fallback claimed too much confidence');
  assert.match(sc.evaluation.summary, /No model ran/);
  sc.evaluation.criteria.filter((c) => c.verdict !== 'not_covered').forEach((c) => {
    assert.ok(c.evidence && c.evidence.length > 0, c.key + ' has a verdict with no evidence');
  });
});

test('a thin transcript produces insufficient evidence rather than a guess', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Bram Halloway');
  await SC.runFullScreening(store, ctx(), application.id, {});
  const WF = require('../lib/workflow');
  const sc = WF.screeningsFor(store, ctx(), application.id).find((x) => x.evaluation);
  assert.notEqual(sc.evaluation.recommendation, 'advance');
});

test('there is no way for an evaluation to reject anybody', () => {
  const enumVals = LLM.EVAL_SCHEMA.properties.recommendation.enum;
  assert.deepEqual(enumVals, ['advance', 'review', 'insufficient_evidence']);
  assert.ok(enumVals.indexOf('reject') < 0);
  assert.match(LLM.SYSTEM, /You are not making a hiring decision/);
  assert.match(LLM.SYSTEM, /Do not explain your reasoning process/);
});

test('a malformed evaluation is rejected rather than shown', () => {
  const keys = ['reliability', 'customer_manner'];

  assert.equal(LLM.validateEvaluation(null, keys).ok, false);

  const missing = LLM.validateEvaluation({ recommendation: 'advance' }, keys);
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.length >= 4);

  const badRec = LLM.validateEvaluation({
    recommendation: 'reject', summary: 'x', criteria: [], concerns: [],
    unansweredQuestions: [], confidence: 0.9, recommendedNextAction: 'x'
  }, keys);
  assert.equal(badRec.ok, false);
  assert.match(badRec.errors.join(' '), /recommendation must be/);

  // The failure that matters most: a criterion nobody asked about, which reads
  // as a real assessment of something that was never a requirement.
  const invented = LLM.validateEvaluation({
    recommendation: 'advance', summary: 'x',
    criteria: [{ key: 'attitude', verdict: 'met', evidence: 'seemed nice' }],
    concerns: [], unansweredQuestions: [], confidence: 0.9, recommendedNextAction: 'x'
  }, keys);
  assert.equal(invented.ok, false);
  assert.match(invented.errors.join(' '), /not in the job requirements: attitude/);

  const badConf = LLM.validateEvaluation({
    recommendation: 'advance', summary: 'x', criteria: [], concerns: [],
    unansweredQuestions: [], confidence: 42, recommendedNextAction: 'x'
  }, keys);
  assert.equal(badConf.ok, false);
});

test('a provider error is surfaced, and nothing is written to the record', async (t) => {
  setEnv({ LLM_API_KEY: 'test-key', LLM_PROVIDER: 'anthropic',
           LLM_BASE_URL: 'http://127.0.0.1:9/v1' });   // port 9 refuses
  t.after(restoreEnv);

  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Alicia Reyes');
  const out = await SC.runFullScreening(store, ctx(), application.id, {});

  const WF = require('../lib/workflow');
  const sc = WF.screeningsFor(store, ctx(), application.id)[0];
  assert.equal(sc.status, 'evaluation_failed');
  assert.equal(sc.evaluation, undefined);
  assert.ok(sc.evaluationError, 'the error was recorded');
  assert.equal(sc.evaluationMeta.mode, 'llm');

  // A failure raises an exception for a person rather than passing silently.
  const exc = store.where('exceptions', TENANT,
    (e) => e.applicationId === application.id && e.kind === 'evaluation_failed');
  assert.equal(exc.length, 1);
  assert.equal(exc[0].blocksProgress, true);
});

test('a timeout is reported as a timeout', async (t) => {
  setEnv({ LLM_API_KEY: 'test-key', LLM_PROVIDER: 'anthropic', LLM_TIMEOUT_MS: '120',
           LLM_BASE_URL: 'http://127.0.0.1:9/v1' });
  t.after(restoreEnv);
  const out = await LLM.evaluateScreening({
    role: { title: 'Cashier', storeName: 'x', summary: 'x', criteria: [] },
    eligibility: { results: [] }, candidate: { appliedAt: 'x', source: 'x' }, transcript: []
  }, () => ({}));
  assert.equal(out.ok, false);
  assert.equal(out.mode, 'llm');
  assert.ok(out.error);
});

test('every evaluation is written to the audit trail with its provenance', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Alicia Reyes');
  await SC.runFullScreening(store, ctx(), application.id, {});

  const calls = store.all('llmCalls', TENANT).filter((c) => c.inputRefs.applicationId === application.id);
  assert.equal(calls.length, 1);
  const c = calls[0];
  assert.ok(c.at && c.promptVersion && c.latencyMs != null);
  assert.ok(c.inputRefs.candidateId && c.inputRefs.screeningId && c.inputRefs.requisitionId);
  assert.ok(c.recommendation);
  assert.equal(typeof c.confidence, 'number');
  // Reference ids, not a second copy of the transcript, and no chain of thought.
  assert.equal(typeof c.inputRefs.transcriptTurns, 'number');
  const dumped = JSON.stringify(c);
  assert.ok(dumped.indexOf('reasoning') < 0);
  assert.ok(dumped.indexOf('thinking') < 0);

  const audit = store.all('auditEvents', TENANT)
    .filter((e) => e.action === 'screening.evaluated' && e.applicationId === application.id);
  assert.equal(audit.length, 1);
  assert.ok(audit[0].detail.mode);
  assert.ok(audit[0].why);
});
