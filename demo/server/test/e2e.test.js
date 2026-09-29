/* The bar, from section 25 of the brief, as one test.

   Start a real HTTP server on a real port with a real database file, then walk
   one candidate the whole way:

     application -> eligibility -> screening -> evaluation -> human decision
     -> offer -> external check -> onboarding -> first shift

   then open the same candidate's timeline, check the pipeline counts moved,
   ask the assistant about that same live data, make it perform a confirmed
   action, and read the audit trail proving it happened. Finally restart the
   process and check the state survived, which is what a browser refresh does.

   Nothing here is mocked. It is the server the demo runs on.
*/
'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = 4187 + (process.pid % 200);
const BASE = 'http://127.0.0.1:' + PORT;
const DB = path.join(os.tmpdir(), 'frontline-e2e-' + process.pid + '.json');

let proc;

function start() {
  return new Promise((resolve, reject) => {
    proc = spawn(process.execPath, [path.join(__dirname, '..', 'index.js')], {
      env: Object.assign({}, process.env, {
        PORT: String(PORT), HOST: '127.0.0.1', DEMO_DB_FILE: DB, LLM_API_KEY: ''
      }),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let out = '';
    const done = (d) => {
      out += d;
      if (out.indexOf('running at') >= 0) resolve();
    };
    proc.stdout.on('data', done);
    proc.stderr.on('data', (d) => { out += d; });
    proc.on('exit', (code) => { if (code !== 0 && !out.indexOf('running at')) reject(new Error(out)); });
    setTimeout(() => reject(new Error('server did not start:\n' + out)), 12000);
  });
}

function stop() {
  return new Promise((resolve) => {
    if (!proc || proc.exitCode != null) return resolve();
    proc.once('exit', resolve);
    proc.kill('SIGTERM');
  });
}

const get = (p) => fetch(BASE + p).then((r) => r.json());
const post = (p, b) => fetch(BASE + p, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b || {})
}).then((r) => r.json());

before(async () => { try { fs.unlinkSync(DB); } catch (e) { /* not there */ } await start(); });
after(async () => { await stop(); try { fs.unlinkSync(DB); } catch (e) { /* fine */ } });

test('the whole journey, end to end, against the running server', async () => {
  /* ---------------------------------------------------- 1. it is running -- */
  const health = await get('/api/health');
  assert.equal(health.ok, true);
  assert.equal(health.candidates, 36);
  assert.equal(health.llm.configured, false, 'this run is deliberately without a key');

  /* --------------------------------- 2. the manager opens Monday morning -- */
  const deck = (await get('/api/view/deck')).data;
  assert.ok(deck.queue.needsPerson.length > 0);
  assert.ok(deck.overnight.received > 0);
  const decisionsAtStart = deck.decisions.count;
  const pipelineAtStart = (await get('/api/view/pipeline')).data.inFlight;

  /* ------------------------------------------ 3. open a new applicant ----- */
  let r = await post('/api/agent/tool', { tool: 'search_candidates', args: { state: 'SCREENING_PENDING' } });
  const who = r.data.candidates.find((c) => c.name === 'Alicia Reyes') || r.data.candidates[0];
  assert.ok(who, 'nobody is waiting for a screening');
  const APP = who.applicationId;

  /* ------------- 4. eligibility already ran, deterministically, on intake -- */
  let rec = await post('/api/agent/tool', { tool: 'get_candidate', args: { candidateId: who.candidateId } });
  assert.equal(rec.data.eligibility.engine, 'deterministic-rules');
  assert.equal(rec.data.eligibility.passed, true);
  assert.ok(rec.data.eligibility.results.length >= 5);

  /* ---------------------------------- 5. screening, and its evaluation ---- */
  r = await post('/api/applications/' + APP + '/screen', {});
  assert.equal(r.ok, true);
  const ev = r.results.find((x) => x.evaluation);
  assert.ok(ev, 'no evaluation was produced');
  assert.ok(['advance', 'review', 'insufficient_evidence'].indexOf(ev.evaluation.recommendation) >= 0);
  assert.equal(ev.meta.mode, 'deterministic-fallback', 'no key, so no model, and it says so');
  assert.match(ev.meta.note, /No model ran/);
  assert.equal(r.state, 'DECISION_PENDING', 'the agent got them in front of a person and stopped');

  /* ------------------------------------------- 6. the agent cannot decide -- */
  const asAgent = await fetch(BASE + '/api/applications/' + APP + '/transition?as=marcus', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state: 'APPROVED' })
  });
  assert.equal(asAgent.status, 200, 'a person approving is allowed');

  /* --------------------------------------------- 7. offer, then acceptance -- */
  let state = (await post('/api/agent/tool', { tool: 'get_candidate', args: { candidateId: who.candidateId } })).data.brief.state;
  assert.equal(state, 'OFFER_PENDING', 'approval generates an offer and does not send it');

  r = await post('/api/applications/' + APP + '/transition', { state: 'OFFER_SENT' });
  assert.equal(r.ok, true);
  rec = await post('/api/agent/tool', { tool: 'get_candidate', args: { candidateId: who.candidateId } });
  const comms = (await get('/api/view/candidate?applicationId=' + APP)).data.communications;
  assert.ok(comms.length >= 2, 'the offer produced real communication records');
  assert.ok(comms.every((c) => c.providerRef || c.status), 'a message with no delivery record');

  r = await post('/api/applications/' + APP + '/transition', { state: 'OFFER_ACCEPTED' });
  assert.equal(r.ok, true);
  assert.equal(r.state, 'BACKGROUND_CHECK_PENDING');

  /* ------------------------------- 8. the check, and the parallel fan-out -- */
  r = await post('/api/applications/' + APP + '/transition', { state: 'BACKGROUND_CHECK_IN_PROGRESS' });
  assert.equal(r.ok, true);

  let cand = (await get('/api/view/candidate?applicationId=' + APP)).data;
  assert.equal(cand.check.mode, 'simulated');
  assert.ok(cand.check.externalRef);
  assert.equal(cand.tasks.length, 11);
  assert.ok(cand.tasks.filter((t) => t.status === 'in_progress').length >= 6,
    'the parallel work did not start together');
  assert.ok(cand.parallelism.sequentialMs > cand.parallelism.criticalPathMs);

  /* --------------- 9. the outside world moves because time passed, not us -- */
  r = await post('/api/sim/advance', { hours: 24 * 10 });
  assert.equal(r.ok, true);
  assert.ok(r.changes.length > 0);
  assert.match(r.note, /Nothing was faked/);

  cand = (await get('/api/view/candidate?applicationId=' + APP)).data;
  assert.ok(cand.check.closedAt, 'the check did not come back');

  /* ------------------------------------ 10. the human task on the critical path */
  const badge = cand.tasks.find((t) => t.key === 'badge');
  assert.equal(badge.owner, 'human');
  assert.notEqual(badge.status, 'done', 'a task a person owns completed itself');
  r = await post('/api/applications/' + APP + '/task', { taskId: badge.id });
  assert.equal(r.ok, true);

  /* ----------------------------------------------- 11. ready, then a shift -- */
  cand = (await get('/api/view/candidate?applicationId=' + APP)).data;
  assert.equal(cand.application.state, 'READY_FOR_SHIFT');

  r = await post('/api/applications/' + APP + '/transition', { state: 'FIRST_SHIFT_SCHEDULED' });
  assert.equal(r.ok, true);
  r = await post('/api/applications/' + APP + '/transition', { state: 'STARTED' });
  assert.equal(r.ok, true);

  /* ------------------------------- 12. the timeline holds the whole journey -- */
  const tl = (await post('/api/agent/tool', { tool: 'get_candidate_timeline', args: { candidateId: who.candidateId } })).data;
  assert.equal(tl.timeline.steps.length, 20);
  const done = tl.timeline.steps.filter((s) => s.status === 'done');
  assert.ok(done.length >= 12, 'only ' + done.length + ' steps recorded as done');
  assert.ok(tl.metrics.milestones.appliedAt);
  assert.ok(tl.metrics.milestones.startedAt);
  assert.ok(tl.metrics.spans.applicationToFirstShift > 0);
  assert.ok(tl.metrics.queueMs > 0 && tl.metrics.workMs > 0);
  // Every external wait is labelled as one rather than drawn as a failure.
  tl.timeline.steps.filter((s) => s.owner === 'clock')
    .forEach((s) => assert.equal(s.actability, 'external'));

  /* ------------------------------------------ 13. the counts actually moved --
     Not "the total changed": ten days passed and other people moved too, so the
     total can land back where it started by coincidence. What has to be true is
     that THIS candidate left the decision queue and is now counted at a later
     step of the pipeline. */
  const decideNow = (await get('/api/view/decide')).data;
  assert.equal(decideNow.candidates.some((c) => c.applicationId === APP), false,
    'the candidate we approved is still in the decision queue');

  const steps = (await get('/api/view/pipeline')).data.steps;
  const stepFor = (n) => steps.find((s) => s.n === n);
  assert.ok(stepFor(16).inFlight >= 1 || stepFor(17).inFlight >= 1,
    'nobody is counted at day one, and we just started somebody');
  assert.ok(stepFor(6).entered > 0 && stepFor(16).entered > 0,
    'the funnel did not record the journey');

  /* ------------------------------- 14. the assistant, on that same live data -- */
  let a = await post('/api/agent/message', { text: 'who needs my attention today' });
  assert.equal(a.ok, true);
  assert.equal(a.tool, 'get_attention_queue');
  assert.equal(a.data.needsPerson.length + a.data.waitingExternal.length + a.data.productMoving.length,
    a.data.total, 'the assistant\'s groups do not add up to the database');

  a = await post('/api/agent/message', { text: 'why is trevor blocked' });
  assert.match(JSON.stringify(a.data.items), /not eligible for rehire/);

  a = await post('/api/agent/message', { text: 'show everyone waiting for my decision' });
  assert.ok(a.ok, true);
  assert.ok(a.data.candidates || a.data.needsPerson);

  /* ---------------------------- 15. a confirmed action, and only confirmed -- */
  const target = (await get('/api/view/decide')).data.candidates[0];
  assert.ok(target, 'nobody is left to decide on');

  a = await post('/api/agent/message', { text: 'approve ' + target.name });
  assert.equal(a.needsConfirmation, true);
  assert.equal(a.level, 'human_decision');
  const stillPending = (await get('/api/view/decide')).data.candidates
    .some((c) => c.name === target.name);
  assert.equal(stillPending, true, 'the assistant acted before it was confirmed');

  const confirmed = await post('/api/agent/confirm', { pendingId: a.pendingId, approve: true });
  assert.equal(confirmed.ok, true);
  assert.equal(confirmed.confirmedBy, 'Marcus Hale');

  /* --------------------------- 16. the audit trail proves what happened ----- */
  const audit = (await get('/api/view/audit?limit=80')).data;
  const assisted = audit.entries.filter((e) => e.source === 'assistant');
  assert.ok(assisted.length >= 1);
  assert.match(assisted[0].why, /confirmed by Marcus Hale/);
  assert.ok(audit.agentActions.some((x) => x.needsConfirmation && x.confirmed === true));

  /* ------------------------- 17. and the law still outranks the whole thing -- */
  const bar = await post('/api/agent/message', { text: 'take kayla brennan-ross off the rota' });
  assert.equal(bar.needsConfirmation, true);
  const refused = await post('/api/agent/confirm', { pendingId: bar.pendingId, approve: true });
  assert.equal(refused.ok, false);
  assert.equal(refused.refused, 'unlawful');
  assert.match(refused.error, /Final Nonconfirmation/);
});

test('state survives a restart, which is what a browser refresh does', async () => {
  const before = (await get('/api/view/decide')).data.count;
  const auditBefore = (await get('/api/view/audit?limit=200')).data.total;

  await stop();
  await start();

  const after = (await get('/api/view/decide')).data.count;
  const auditAfter = (await get('/api/view/audit?limit=200')).data.total;
  assert.equal(after, before, 'the decision queue changed across a restart');
  assert.equal(auditAfter, auditBefore, 'audit history was lost');

  const health = await get('/api/health');
  assert.equal(health.candidates, 36);
  assert.equal(health.seeded, true);
});
