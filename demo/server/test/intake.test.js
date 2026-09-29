/* The candidate-facing side: the careers page, the apply form, the application
   it creates, and the seven stages of a live call.

   These are the only surfaces in the build with a reader who is not logged in
   and who is about to be scored by the product, so most of what is asserted
   here is what must NOT be in a payload. */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { fresh } = require('./helper');
const PUB = require('../lib/public');
const INTAKE = require('../lib/intake');
const LIVE = require('../lib/livecall');
const SLOTS = require('../../js/slots');

function form(over) {
  return Object.assign({
    firstName: 'Ada', lastName: 'Okonjo', email: 'ada@example.com',
    phone: '+1-614-555-9001', dateOfBirth: '2001-04-11', rightToWork: true,
    availability: ['sat_evening', 'sun_evening', 'wed_open'], commuteBand: 'from_5'
  }, over || {});
}

/* ------------------------------------------------ the public projection --- */

test('the careers page never carries the store scoring answer key', async () => {
  const env = await fresh();
  const out = PUB.careers(env.store, env.ctx(), {});
  const blob = JSON.stringify(out);
  ['positivePhrases', 'concernPhrases', 'screeningQuestions', 'criteria',
   'weekends work', 'only weekdays', 'availability_fit'].forEach((bad) => {
    assert.ok(blob.indexOf(bad) < 0, 'the careers payload contains "' + bad + '"');
  });
});

test('the projection throws rather than emit an internal field, at any depth', () => {
  assert.throws(() => PUB.assertClean({ a: { b: [{ concernPhrases: ['x'] }] } }),
    /refused to emit "concernPhrases"/);
  assert.throws(() => PUB.assertClean({ rehireEligible: false }),
    /refused to emit "rehireEligible"/);
  // A raw requisition must not survive the guard.
  assert.throws(() => PUB.assertClean({ criteria: [], title: 'Cashier' }));
});

test('a raw requisition row cannot be served as a job', async () => {
  const env = await fresh();
  const raw = env.store.all('requisitions', env.TENANT)[0];
  assert.throws(() => PUB.assertClean(raw), /refused to emit/);
  // The projection of the same row is clean and still useful.
  const projected = PUB.job(env.store, env.ctx(), raw, {});
  assert.ok(projected.title && projected.rate && projected.slotLabels.length);
});

test('no candidate name reaches a candidate-facing payload', async () => {
  const env = await fresh();
  const names = env.store.all('candidates', env.TENANT).map((c) => c.name);
  const blob = JSON.stringify(PUB.careers(env.store, env.ctx(), {})) +
               JSON.stringify(PUB.applyForm(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway' }));
  names.forEach((n) => assert.ok(blob.indexOf(n) < 0, n + ' appears in a public payload'));
});

test('the careers page filters to the store the work surfaces are scoped to', async () => {
  const env = await fresh();
  const all = PUB.careers(env.store, env.ctx(), {});
  const scoped = PUB.careers(env.store, env.ctx(), { storeId: all.defaultStoreId });
  assert.ok(all.defaultStoreId, 'no default store, so U-84 cannot hold');
  assert.ok(scoped.jobs.length > 0 && scoped.jobs.length < all.jobs.length);
  scoped.jobs.forEach((j) => assert.equal(j.store.id, all.defaultStoreId));
});

test('the apply form offers exactly the thirteen slots and marks the required ones', async () => {
  const env = await fresh();
  const f = PUB.applyForm(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway' });
  const cells = f.slotGrid.reduce((n, row) => n + row.cells.filter((c) => c.exists).length, 0);
  assert.equal(cells, SLOTS.KEYS.length);
  assert.ok(f.requiredSlots.length > 0);
  f.requiredSlots.forEach((s) => assert.ok(SLOTS.valid(s)));
});

test('the form asks for no social security number', async () => {
  const env = await fresh();
  const f = PUB.applyForm(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway' });
  const keys = f.fields.map((x) => x.key.toLowerCase()).join(' ');
  ['ssn', 'social', 'security'].forEach((bad) => assert.ok(keys.indexOf(bad) < 0));
});

/* ---------------------------------------------------------------- intake --- */

test('an incomplete form creates nothing', async () => {
  const env = await fresh();
  const before = env.store.all('applications', env.TENANT).length;
  const r = INTAKE.apply(env.store, env.ctx(), {
    requisitionId: 'req_cashier_ridgeway', form: { firstName: 'Ada' } });
  assert.equal(r.ok, false);
  assert.ok(r.problems.length >= 6);
  assert.equal(env.store.all('applications', env.TENANT).length, before);
});

test('a complete form creates a real application and the engine carries it on', async () => {
  const env = await fresh();
  const before = env.store.all('applications', env.TENANT).length;
  const r = INTAKE.apply(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway', form: form() });
  assert.equal(r.ok, true);
  assert.equal(env.store.all('applications', env.TENANT).length, before + 1);
  // It did not stop where it was written. The auto edge ran.
  assert.notEqual(r.state, 'APPLICATION_RECEIVED');
  assert.equal(r.state, 'SCREENING_PENDING');
  // And it is a real row, with real events behind it.
  const app = env.store.byId('applications', env.TENANT, r.applicationId);
  assert.ok(app.eligibility && app.eligibility.passed);
  const evs = env.store.where('workflowEvents', env.TENANT, (e) => e.applicationId === app.id);
  assert.ok(evs.length >= 2, 'an application with no events cannot appear on any timeline');
});

test('a live applicant is never given an answers map', async () => {
  const env = await fresh();
  const r = INTAKE.apply(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway', form: form() });
  const c = env.store.byId('candidates', env.TENANT, r.candidateId);
  assert.ok(!c.answers, 'a synthetic transcript could be assembled for a real person');
});

test('a failed rule is told to the applicant, and named', async () => {
  const env = await fresh();
  const r = INTAKE.apply(env.store, env.ctx(), {
    requisitionId: 'req_cashier_ridgeway',
    form: form({ availability: ['mon_open', 'tue_open'] }) });
  assert.equal(r.ok, true);
  assert.equal(r.state, 'INELIGIBLE');
  assert.equal(r.eligibility.passed, false);
  assert.ok(/shifts/.test(r.eligibility.reason), r.eligibility.reason);
});

test('the rehire rule holds the application and the applicant is told nothing about it', async () => {
  const env = await fresh();
  const no = env.store.all('priorEmployment', env.TENANT).find((p) => p.rehireEligible === false);
  assert.ok(no, 'the seed has no do-not-rehire record, so this path is untested');
  const [names, dob] = no.identityKey.split('#');
  const [last, first] = names.split('|');
  // A different phone number, which is the partial-match path.
  const r = INTAKE.apply(env.store, env.ctx(), {
    requisitionId: 'req_cashier_ridgeway',
    form: form({ firstName: first, lastName: last, dateOfBirth: dob, phone: '+1-614-555-0000' }) });
  assert.equal(r.ok, true);
  assert.equal(r.eligibility.canScreenNow, false);
  const blob = JSON.stringify(r.eligibility);
  ['rehire', 'prior', 'previous', 'record', 'eligib'].forEach((w) => {
    assert.ok(blob.toLowerCase().indexOf(w) < 0 || w === 'eligib',
      'the applicant is told about a prior employment record: ' + blob);
  });
  assert.ok(!new RegExp(first, 'i').test(blob), 'a name from the records table reached the applicant');
});

/* ------------------------------------------------------------- live call --- */

test('the seven stages run in order and nothing else is allowed', async () => {
  const env = await fresh();
  const r = INTAKE.apply(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway', form: form() });
  const sc = env.store.where('screenings', env.TENANT, (s) => s.applicationId === r.applicationId)[0];
  assert.ok(sc, 'no screening was created');

  // Cannot advance a call that was never invited.
  assert.equal(LIVE.advance(env.store, env.ctx(), sc, 'connected').ok, false);

  assert.equal(LIVE.invite(env.store, env.ctx(), sc, { method: 'browser' }).ok, true);
  assert.equal(LIVE.stateOf(sc), 'invited');

  // Skipping a stage is refused, and the refusal says what was allowed.
  const skip = LIVE.advance(env.store, env.ctx(), sc, 'in_progress');
  assert.equal(skip.ok, false);
  assert.ok(/cannot move to/.test(skip.reason), skip.reason);

  ['opened', 'connected', 'in_progress', 'ended', 'scoring', 'scored'].forEach((stage) => {
    assert.equal(LIVE.advance(env.store, env.ctx(), sc, stage).ok, true, 'stage ' + stage);
  });
  assert.equal(LIVE.stateOf(sc), 'scored');

  // A finished call refuses everything and says so plainly.
  const after = LIVE.advance(env.store, env.ctx(), sc, 'connected');
  assert.equal(after.ok, false);
  assert.ok(/finished/.test(after.reason), after.reason);
});

test('every call stage is stamped with the transport that actually ran', async () => {
  const env = await fresh();
  const r = INTAKE.apply(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway', form: form() });
  const sc = env.store.where('screenings', env.TENANT, (s) => s.applicationId === r.applicationId)[0];
  LIVE.invite(env.store, env.ctx(), sc, { method: 'outbound' });
  LIVE.advance(env.store, env.ctx(), sc, 'opened');
  const expected = LIVE.transportMode();
  LIVE.stagesOf(sc).forEach((s) => assert.equal(s.mode, expected, 'stage ' + s.stage));
  // With no transport configured, nothing may claim to be live.
  if (expected === 'simulated') {
    const status = LIVE.transportStatus();
    assert.equal(status.configured, false);
    assert.ok(/simulated/.test(status.note));
  }
});

test('the live payload carries no transcript while the call is running', async () => {
  const env = await fresh();
  const r = INTAKE.apply(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway', form: form() });
  const sc = env.store.where('screenings', env.TENANT, (s) => s.applicationId === r.applicationId)[0];
  LIVE.invite(env.store, env.ctx(), sc, {});
  LIVE.advance(env.store, env.ctx(), sc, 'opened');
  LIVE.advance(env.store, env.ctx(), sc, 'connected');
  LIVE.advance(env.store, env.ctx(), sc, 'in_progress');
  const pub = LIVE.publicCall(sc, env.clock.now());
  assert.equal(pub.live, true);
  assert.ok(!('transcript' in pub), 'the live payload can show a transcript the provider does not stream');
  // It says what it is waiting for rather than showing an empty row.
  const pending = pub.sequence.filter((s) => !s.reached);
  assert.ok(pending.length > 0 && pending.every((s) => s.label));
});

test('each call stage writes an event, so the timeline and the metrics see it', async () => {
  const env = await fresh();
  const r = INTAKE.apply(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway', form: form() });
  const sc = env.store.where('screenings', env.TENANT, (s) => s.applicationId === r.applicationId)[0];
  const before = env.store.where('workflowEvents', env.TENANT, (e) => e.applicationId === r.applicationId).length;
  LIVE.invite(env.store, env.ctx(), sc, {});
  ['opened', 'connected', 'in_progress', 'ended'].forEach((s) => LIVE.advance(env.store, env.ctx(), sc, s));
  const after = env.store.where('workflowEvents', env.TENANT, (e) => e.applicationId === r.applicationId).length;
  assert.equal(after - before, 5, 'one event per stage');
});

test('a failed call records the provider reason and never invents one', async () => {
  const env = await fresh();
  const r = INTAKE.apply(env.store, env.ctx(), { requisitionId: 'req_cashier_ridgeway', form: form() });
  const sc = env.store.where('screenings', env.TENANT, (s) => s.applicationId === r.applicationId)[0];
  LIVE.invite(env.store, env.ctx(), sc, { method: 'outbound' });
  LIVE.advance(env.store, env.ctx(), sc, 'failed', { error: 'SIP 486 Busy Here' });
  assert.equal(LIVE.stateOf(sc), 'failed');
  assert.equal(sc.call.error, 'SIP 486 Busy Here');
  // With no reason from the provider, it says exactly that.
  const r2 = INTAKE.apply(env.store, env.ctx(), {
    requisitionId: 'req_cashier_ridgeway', form: form({ email: 'b@example.com', phone: '+1-614-555-9002' }) });
  const sc2 = env.store.where('screenings', env.TENANT, (s) => s.applicationId === r2.applicationId)[0];
  LIVE.invite(env.store, env.ctx(), sc2, {});
  LIVE.advance(env.store, env.ctx(), sc2, 'failed', {});
  assert.ok(/no reason/.test(sc2.call.error), sc2.call.error);
});
