/* Workflow: eligibility, screening, decisions, offers, checks, onboarding,
   the first shift, and the two rules that are not product opinions. */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { fresh, byName, inState } = require('./helper');
const WF = require('../lib/workflow');
const SC = require('../lib/screening');
const M = require('../lib/metrics');
const S = require('../lib/schema');
const { DAY, HOUR } = require('../lib/clock');

test('eligibility is deterministic and names the rule that failed', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Shantel Ruiz');
  assert.equal(application.state, 'INELIGIBLE');
  assert.equal(application.eligibility.passed, false);
  assert.deepEqual(application.eligibility.failedKeys, ['availability']);
  const rule = application.eligibility.results.find((r) => r.key === 'availability');
  // The basis has to be actionable, not just "failed".
  assert.match(rule.basis, /Not offered:/);
  assert.ok(rule.values.missing.length > 0);
});

test('eligibility runs the same way twice', async () => {
  const a = await fresh();
  const b = await fresh();
  const one = byName(a.store, a.TENANT, 'Shantel Ruiz').application.eligibility;
  const two = byName(b.store, b.TENANT, 'Shantel Ruiz').application.eligibility;
  assert.deepEqual(one.failedKeys, two.failedKeys);
  assert.deepEqual(one.results.map((r) => r.passed), two.results.map((r) => r.passed));
});

test('a do-not-rehire match holds the application rather than rejecting it', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Trevor Boone');
  assert.equal(application.state, 'ELIGIBILITY_REVIEW', 'it should stop, not end');
  assert.equal(application.eligibility.holdForPerson, true);
  const exc = store.where('exceptions', TENANT, (e) => e.applicationId === application.id && !e.resolvedAt);
  assert.equal(exc.length, 1);
  assert.equal(exc[0].kind, 'rehire_flag');
  assert.equal(exc[0].blocksProgress, true);
  assert.equal(exc[0].owner, 'human');
});

test('the rehire hold has two ways out, both by a person, both needing a reason', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Trevor Boone');

  // An agent may not clear it.
  const agent = WF.transition(store, ctx({ type: 'agent', name: 'Screening agent' }),
    application.id, 'ELIGIBLE', { reason: 'looks fine' });
  assert.equal(agent.ok, false);
  assert.equal(agent.refused, 'actor_not_permitted');

  const person = WF.transition(store, ctx(), application.id, 'ELIGIBLE',
    { reason: 'Spoke to the previous manager. The note was about a rota dispute.' });
  assert.equal(person.ok, true);
  assert.equal(application.rehireReview.outcome, 'overridden');
  assert.equal(application.rehireReview.by, 'Marcus Hale');
  // Clearing the hold lets the settle chain run on.
  assert.ok(['SCREENING_PENDING', 'SCREENING_IN_PROGRESS'].indexOf(application.state) >= 0);
});

test('the rehire lookup reads one retailer\'s own records and computes the I-9 window', async () => {
  const { store, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Teresa Alvarado');
  const r = application.rehire;
  assert.equal(r.matched, true);
  assert.equal(r.confidence, 'exact');
  assert.match(r.scope, /own records only/);
  assert.equal(r.rehireEligible, true);
  // 8 CFR 274a.2(c)(1)(i): three years from INITIAL EXECUTION of the previous form.
  assert.equal(r.i9.reusable, true);
  assert.match(r.i9.rule, /initial execution/);
  const reuse = {};
  r.reusable.forEach((x) => { reuse[x.key] = x.reuse; });
  assert.equal(reuse.i9_s1, 'update-and-reverify');
  assert.equal(reuse.everify, 'never', 'a new E-Verify case is always required');
  assert.equal(reuse.bgcheck, 'fresh-order');
});

test('screening produces a stored evaluation and advances to a decision', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Alicia Reyes');
  assert.equal(application.state, 'SCREENING_PENDING');

  const out = await SC.runFullScreening(store, ctx(), application.id, {});
  assert.equal(out.ok, true);
  assert.equal(application.state, 'DECISION_PENDING');

  const sc = WF.screeningsFor(store, ctx(), application.id).find((x) => x.evaluation);
  assert.ok(sc.transcript.length > 4, 'a transcript was stored');
  assert.ok(sc.responses.length > 0);
  assert.ok(['advance', 'review', 'insufficient_evidence'].indexOf(sc.evaluation.recommendation) >= 0);
  assert.ok(sc.evaluation.criteria.length > 0);
  assert.ok(sc.evaluationMeta.mode);
});

test('only a person can approve or reject, whoever is asking', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Marisol Ferreira');

  ['agent', 'system', 'external'].forEach((type) => {
    ['APPROVED', 'REJECTED'].forEach((to) => {
      const r = WF.transition(store, ctx({ type, name: type + ' actor' }), application.id, to, {});
      assert.equal(r.ok, false, type + ' was allowed to ' + to);
      assert.equal(r.refused, 'actor_not_permitted');
      assert.match(r.reason, /named person/);
    });
  });
  assert.equal(application.state, 'DECISION_PENDING', 'nothing moved');

  const ok = WF.transition(store, ctx(), application.id, 'APPROVED', { reason: 'Good fit.' });
  assert.equal(ok.ok, true);
});

test('a refusal is recorded, never silent', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Marisol Ferreira');
  const before = store.all('auditEvents', TENANT).length;
  WF.transition(store, ctx({ type: 'agent', name: 'Screening agent' }), application.id, 'APPROVED', {});
  const after = store.all('auditEvents', TENANT);
  assert.equal(after.length, before + 1);
  const last = after[after.length - 1];
  assert.equal(last.action, 'transition.refused');
  assert.equal(last.outcome, 'refused');
  assert.ok(last.why && last.why.length > 20, 'the refusal has to say why');
});

test('an illegal move is refused and lists the moves that are legal', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Alicia Reyes');
  const r = WF.transition(store, ctx(), application.id, 'DAY_90', {});
  assert.equal(r.ok, false);
  assert.equal(r.refused, 'illegal_transition');
  assert.ok(Array.isArray(r.allowed) && r.allowed.length > 0);
  assert.match(r.reason, /the only moves are/);
});

test('a guard that fails explains what is outstanding', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Bianca Osei');
  assert.equal(application.state, 'BACKGROUND_CHECK_IN_PROGRESS');

  // A manager cannot declare a check finished. That is an external fact, and the
  // actor rule is checked before the guard, so this is the refusal you get.
  const person = WF.transition(store, ctx(), application.id, 'BACKGROUND_CHECK_COMPLETE', {});
  assert.equal(person.refused, 'actor_not_permitted');

  const r = WF.transition(store, ctx({ type: 'system', name: 'Workflow engine' }),
    application.id, 'BACKGROUND_CHECK_COMPLETE', {});
  assert.equal(r.ok, false);
  assert.equal(r.refused, 'guard_failed');
  assert.match(r.reason, /county court/);
});

test('approval generates an offer but does not send it', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Marisol Ferreira');
  WF.transition(store, ctx(), application.id, 'APPROVED', { reason: 'Good fit.' });

  assert.equal(application.state, 'OFFER_PENDING', 'sending is a separate, confirmed act');
  const offer = WF.offerFor(store, ctx(), application.id);
  assert.equal(offer.status, 'draft');
  assert.equal(offer.conditional, true);
  assert.equal(store.where('communications', TENANT, (c) => c.applicationId === application.id).length, 0);

  WF.transition(store, ctx(), application.id, 'OFFER_SENT', {});
  assert.equal(offer.status, 'sent');
  const comms = store.where('communications', TENANT, (c) => c.applicationId === application.id);
  assert.equal(comms.length, 2, 'an email and an SMS were actually recorded');
  assert.ok(comms.every((c) => c.providerRef || c.status === 'delivered'));
  assert.match(comms[0].provider, /development/);
});

test('acceptance fans out the parallel work with real dependencies', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Owen Castellano');
  assert.equal(application.state, 'OFFER_SENT');

  WF.transition(store, ctx({ type: 'external', name: 'Candidate' }), application.id, 'OFFER_ACCEPTED', {});
  assert.equal(application.state, 'BACKGROUND_CHECK_PENDING');

  const tasks = WF.tasksFor(store, ctx(), application.id);
  assert.equal(tasks.length, 11);
  const started = tasks.filter((t) => t.status === 'in_progress');
  assert.ok(started.length >= 6, 'everything with no unmet dependency starts at once');

  // The two that genuinely cannot happen before day one are blocked, and say so.
  const afterStart = tasks.filter((t) => t.afterStart);
  assert.equal(afterStart.length, 2);
  afterStart.forEach((t) => {
    assert.equal(t.status, 'blocked');
    assert.match(t.blockedBy, /first day of work for pay/);
  });

  const p = M.parallelism(store, ctx(), application.id);
  assert.ok(p.sequentialMs > p.criticalPathMs, 'the parallel path is shorter than the serial one');
  assert.equal(p.savedMs, p.sequentialMs - p.criticalPathMs);
});

test('the check is ordered after the conditional offer, and FCRA papers are separate', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Owen Castellano');
  WF.transition(store, ctx({ type: 'external', name: 'Candidate' }), application.id, 'OFFER_ACCEPTED', {});

  // The disclosure has to be a document consisting solely of the disclosure.
  assert.equal(application.fcra.standaloneDisclosure, true);
  assert.match(application.fcra.rule, /consists solely of the disclosure/);

  WF.transition(store, ctx(), application.id, 'BACKGROUND_CHECK_IN_PROGRESS', {});
  const chk = WF.checkFor(store, ctx(), application.id);
  assert.equal(chk.mode, 'simulated');
  assert.ok(chk.externalRef, 'an external reference was stored');
  assert.ok(chk.searches.length >= 4);
  assert.ok(chk.searches.some((s) => s.key.indexOf('county_') === 0), 'county searches exist');
  const natl = chk.searches.find((s) => s.key === 'natl_db');
  assert.match(natl.note, /no national criminal database/);
});

test('the outside world moves on its own, and only the outside world', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { tick } = require('../lib/tick');
  const c = ctx();

  const decisionsBefore = inState(store, TENANT, 'DECISION_PENDING').length;
  store.db.meta.anchors.sim += 10 * DAY;
  const changes = tick(store, c);

  assert.ok(changes.length > 0, 'ten days should move something');
  // A decision that has been waiting keeps waiting. Clearing it overnight would
  // destroy the whole argument of the product.
  assert.equal(inState(store, TENANT, 'DECISION_PENDING').length, decisionsBefore,
    'the ticker moved something that belongs to a person');
});

test('a human-owned onboarding task never completes itself', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { tick } = require('../lib/tick');
  const { application } = byName(store, TENANT, 'Kwame Adjei');

  store.db.meta.anchors.sim += 30 * DAY;
  tick(store, ctx());

  const badge = WF.tasksFor(store, ctx(), application.id).find((t) => t.key === 'badge');
  assert.equal(badge.owner, 'human');
  assert.notEqual(badge.status, 'done', 'the ticker completed a task a person owns');
  assert.match(badge.note, /no public vendor documentation/);
});

test('a first shift records the fair workweek notice rather than ignoring it', async () => {
  const { store, ctx, TENANT } = await fresh();
  const { application } = byName(store, TENANT, 'Gus Petrakis');
  assert.equal(application.state, 'READY_FOR_SHIFT');

  const soon = ctx().clock.now() + 2 * DAY;
  const r = WF.transition(store, ctx(), application.id, 'FIRST_SHIFT_SCHEDULED', { startsAt: soon });
  assert.equal(r.ok, true);
  const shift = store.byId('shifts', TENANT, application.firstShiftId);
  assert.ok(shift.noticeDays <= 2);
  assert.equal(shift.premiumPayable, true, 'inside the 14-day window a premium is payable');
  assert.match(shift.fairWorkweek, /14 days of advance schedule notice/);
});
