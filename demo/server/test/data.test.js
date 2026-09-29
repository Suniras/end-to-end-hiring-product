/* Data: the seed, persistence, filtering, tenant isolation and the metrics. */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { fresh, byName, inState } = require('./helper');
const M = require('../lib/metrics');
const { Store } = require('../lib/store');

test('the seed produces a coherent dataset', async () => {
  const { store, TENANT } = await fresh();
  assert.equal(store.all('candidates', TENANT).length, 36);
  assert.equal(store.all('applications', TENANT).length, 36);
  assert.ok(store.all('workflowEvents', TENANT).length > 500, 'events were replayed, not written');
  assert.ok(store.all('auditEvents', TENANT).length > 200);
  // Every application has an eligibility result, because nothing skips the rules.
  store.all('applications', TENANT).forEach((a) => {
    assert.ok(a.eligibility, a.id + ' has no eligibility result');
    assert.equal(a.eligibility.engine, 'deterministic-rules');
  });
});

test('every demo persona is present and in the state it was written for', async () => {
  const { store, TENANT } = await fresh();
  const expect = {
    'Alicia Reyes': 'SCREENING_PENDING',
    'Marisol Ferreira': 'DECISION_PENDING',
    'Trevor Boone': 'ELIGIBILITY_REVIEW',        // a hold, not a rejection
    'Shantel Ruiz': 'INELIGIBLE',
    'Owen Castellano': 'OFFER_SENT',
    'Silas Marchetti': 'OFFER_DECLINED',
    'Bianca Osei': 'BACKGROUND_CHECK_IN_PROGRESS',
    'Kwame Adjei': 'ONBOARDING_IN_PROGRESS',
    'Teresa Alvarado': 'ONBOARDING_IN_PROGRESS', // the rehire
    'Gus Petrakis': 'READY_FOR_SHIFT',
    'Ingrid Solberg': 'FIRST_SHIFT_SCHEDULED',
    'Kayla Brennan-Ross': 'STARTED',             // the E-Verify mismatch
    'Felix Ntamack': 'DAY_30',
    'Renata Vasquez': 'DAY_60',
    'Obi Chukwuma': 'DAY_90',
    'Casey Mbeki': 'REJECTED',
    'Simone Achterberg': 'WITHDRAWN'
  };
  Object.keys(expect).forEach((name) => {
    const { application } = byName(store, TENANT, name);
    assert.equal(application.state, expect[name], name + ' is not where the seed says');
  });
});

test('state survives being written and read back', async () => {
  const { store, file, TENANT } = await fresh();
  const before = byName(store, TENANT, 'Marisol Ferreira').application.state;
  store.flushNow();
  assert.ok(fs.existsSync(file), 'nothing was written to disk');

  const reopened = new Store(file);
  reopened.load();
  const after = reopened.all('applications', TENANT)
    .find((a) => a.id === byName(store, TENANT, 'Marisol Ferreira').application.id);
  assert.equal(after.state, before);
  assert.equal(reopened.all('candidates', TENANT).length, 36);
});

test('a read for one tenant never returns another tenant\'s rows', async () => {
  const { store, TENANT } = await fresh();
  // Plant a row belonging to somebody else, then try every way in.
  store.insert('candidates', { id: 'cand_other', tenantId: 'tn_someone_else',
    firstName: 'Other', lastName: 'Retailer', name: 'Other Retailer' });

  assert.equal(store.all('candidates', TENANT).filter((c) => c.id === 'cand_other').length, 0);
  assert.equal(store.byId('candidates', TENANT, 'cand_other'), null,
    'byId reached across the tenant boundary');
  assert.equal(store.find('candidates', TENANT, (c) => c.name === 'Other Retailer'), null);
  // And a read with no tenant is a programming error rather than a wide open door.
  assert.throws(() => store.all('candidates', null), /requires a tenantId/);
  assert.throws(() => store.insert('candidates', { id: 'x' }), /requires a tenantId/);
});

test('filtering by state, store and waiting time', async () => {
  const { store, ctx, TENANT } = await fresh();
  const T = require('../lib/agent/tools');
  const c = ctx();

  const pending = T.BY_NAME.search_candidates.run(store, c, { state: 'DECISION_PENDING' });
  assert.equal(pending.data.candidates.length, inState(store, TENANT, 'DECISION_PENDING').length);

  const oneStore = T.BY_NAME.search_candidates.run(store, c, { storeId: 'str_ridgeway' });
  assert.ok(oneStore.data.candidates.every((b) => b.storeId === 'str_ridgeway'));

  const waited = T.BY_NAME.search_candidates.run(store, c, { waitingLongerThanHours: 48 });
  assert.ok(waited.data.candidates.every((b) => b.waitingMs > 48 * 3600000));
});

test('metrics are derived from events, not stored', async () => {
  const { store, ctx, TENANT } = await fresh();
  const c = ctx();
  const { application } = byName(store, TENANT, 'Obi Chukwuma');

  const m = M.applicationMetrics(store, c, application.id);
  assert.ok(m.elapsedMs > 0);
  assert.ok(m.workMs > 0);
  assert.equal(m.queueMs, Math.max(0, m.elapsedMs - m.workMs));
  assert.ok(m.queueShare > 0 && m.queueShare <= 1);
  assert.ok(m.handoffs > 0, 'a journey through four owner types has handoffs');

  // Deleting the events must change the numbers. If it does not, they were stored.
  const kept = store.db.workflowEvents.filter((e) => e.applicationId !== application.id);
  store.db.workflowEvents = kept;
  const after = M.applicationMetrics(store, c, application.id);
  assert.notEqual(after.workMs, m.workMs, 'work time did not come from the events');
  assert.equal(after.handoffs, 0);
});

test('the funnel counts what actually reached each step', async () => {
  const { store, ctx } = await fresh();
  const f = M.funnel(store, ctx(), {});
  assert.equal(f.length, 20);
  assert.equal(f[0].entered, 36, 'every application reached step 1');
  // Entering is monotonic down the funnel for the steps everybody passes through.
  assert.ok(f[1].entered <= f[0].entered);
  assert.ok(f[5].entered <= f[2].entered);
  // A step nobody has reached reports no data rather than a zero that reads as fast.
  const unreached = f.filter((s) => s.entered === 0);
  unreached.forEach((s) => assert.equal(s.medianMs, null));
});

test('the timeline covers all twenty steps for everybody', async () => {
  const { store, ctx, TENANT } = await fresh();
  const c = ctx();
  store.all('applications', TENANT).forEach((a) => {
    const tl = M.timeline(store, c, a.id);
    assert.equal(tl.steps.length, 20, a.id + ' is missing steps');
    // Exactly one step is "here now", unless the application has ended.
    const current = tl.steps.filter((s) => s.isCurrent);
    assert.ok(current.length <= 1, a.id + ' claims to be in ' + current.length + ' places at once');
    tl.steps.forEach((s) => {
      if (s.elapsedMs != null) assert.ok(s.elapsedMs >= 0, 'negative duration on step ' + s.n);
      if (s.queueMs != null) assert.ok(s.queueMs >= 0, 'negative queue on step ' + s.n);
      if (s.status === 'done') assert.ok(s.enteredAt != null, 'step ' + s.n + ' is done but never entered');
    });
  });
});
