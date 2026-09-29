/* ============================================================================
   schema.js  ·  the state machine

   Twenty-six states, and a transition table that says who is allowed to make
   each move. This is the part of the product that has to be right, because two
   of the rules in it are not product opinions.

   The agent may screen, summarise, flag a concern and recommend. It may move a
   candidate FORWARD to a decision. It may never approve and it may never
   reject. Those two transitions carry by:['human'] and the workflow engine
   refuses any other actor. There is a test for it.

   The four owner types are the ones already on screen and there are no others:
     agent   an AI model does it
     human   a named person decides it
     system  deterministic software, no judgement in it
     clock   a fixed wait nobody owns

   waitingOn marks the states where the thing we are waiting for is outside the
   building: the candidate, the screening agency, or a government department.
   Those are not product failures and the interface must not draw them as
   though they were.
   ============================================================================ */

'use strict';

/* ------------------------------------------------------------- the states --

   step is which of the twenty funnel steps the state sits in. Several states
   share a step, which is correct: "offer sent" and "offer accepted" are both
   step 8, they are just different ends of the same wait.
   -------------------------------------------------------------------------- */

const STATES = {
  APPLICATION_RECEIVED:         { step: 1,  owner: 'system', label: 'Application received' },
  ELIGIBILITY_REVIEW:           { step: 2,  owner: 'system', label: 'Eligibility running' },
  ELIGIBLE:                     { step: 2,  owner: 'system', label: 'Eligible' },
  INELIGIBLE:                   { step: 2,  owner: 'system', label: 'Not eligible', terminal: true, lost: true },
  SCREENING_PENDING:            { step: 3,  owner: 'agent',  label: 'Screening queued' },
  SCREENING_IN_PROGRESS:        { step: 3,  owner: 'agent',  label: 'Screening in progress' },
  SCREENING_COMPLETE:           { step: 3,  owner: 'agent',  label: 'Screening complete' },
  DECISION_PENDING:             { step: 6,  owner: 'human',  label: 'Awaiting your decision' },
  APPROVED:                     { step: 6,  owner: 'human',  label: 'Approved' },
  REJECTED:                     { step: 6,  owner: 'human',  label: 'Rejected', terminal: true, lost: true },
  OFFER_PENDING:                { step: 7,  owner: 'system', label: 'Offer ready to send' },
  OFFER_SENT:                   { step: 8,  owner: 'agent',  label: 'Offer sent', waitingOn: 'candidate' },
  OFFER_ACCEPTED:               { step: 8,  owner: 'agent',  label: 'Offer accepted' },
  OFFER_DECLINED:               { step: 8,  owner: 'agent',  label: 'Offer declined', terminal: true, lost: true },
  BACKGROUND_CHECK_PENDING:     { step: 9,  owner: 'system', label: 'Check ready to order' },
  BACKGROUND_CHECK_IN_PROGRESS: { step: 10, owner: 'clock',  label: 'Check with the agency', waitingOn: 'agency' },
  BACKGROUND_CHECK_COMPLETE:    { step: 10, owner: 'clock',  label: 'Check returned' },
  ONBOARDING_PENDING:           { step: 11, owner: 'system', label: 'Onboarding ready to start' },
  ONBOARDING_IN_PROGRESS:       { step: 11, owner: 'system', label: 'Onboarding running' },
  /* Step 15, not 14. Ready-for-shift means everything in 11 to 14 is finished
     and nothing has been placed yet, so the step it belongs to is the one that
     has not happened. Mapping it to 14 left candidates reading as though the
     badge were still outstanding when it had been done for days. */
  READY_FOR_SHIFT:              { step: 15, owner: 'system', label: 'Ready for a first shift' },
  FIRST_SHIFT_SCHEDULED:        { step: 15, owner: 'system', label: 'First shift scheduled' },
  STARTED:                      { step: 16, owner: 'agent',  label: 'Started' },
  DAY_30:                       { step: 19, owner: 'agent',  label: 'Day 30 passed' },
  DAY_60:                       { step: 19, owner: 'agent',  label: 'Day 60 passed' },
  DAY_90:                       { step: 20, owner: 'clock',  label: 'Day 90, still employed', terminal: true },
  WITHDRAWN:                    { step: null, owner: 'clock', label: 'Withdrew', terminal: true, lost: true },
  /* Added 29 Aug 2026. The adverse action bar names termination first, and the
     machine had no way to represent one, so the most important thing the bar
     forbids was not a move anybody could make. A product that tracks people to
     day 90 has to be able to record that somebody left. */
  TERMINATED:                   { step: null, owner: 'human', label: 'Employment ended', terminal: true, lost: true }
};

/* -------------------------------------------------------- the transitions --

   by      which actor types may perform the move. 'human' means a named person
           and nothing else. There is no 'any'.
   auto    the workflow engine performs it without being asked, as soon as the
           guard passes. Everything else waits to be triggered.
   guard   named guard, resolved in workflow.js where the database is in scope.
   effect  named side effect, same.
   -------------------------------------------------------------------------- */

const TRANSITIONS = [
  /* The rules run on the way IN to the review, not on the way out of it. The
     guards below read the result, so evaluating it as an exit effect would ask
     each guard to consult an answer that had not been produced yet. */
  { from: 'APPLICATION_RECEIVED', to: 'ELIGIBILITY_REVIEW', by: ['system'], auto: true,
    effect: 'recordEligibility',
    reason: 'Every application goes through the rules. Nothing skips it.' },

  { from: 'ELIGIBILITY_REVIEW', to: 'ELIGIBLE', by: ['system'], auto: true, guard: 'eligibilityPassed' },
  { from: 'ELIGIBILITY_REVIEW', to: 'INELIGIBLE', by: ['system'], auto: true, guard: 'eligibilityFailed',
    reason: 'A hard rule failed. Deterministic, and the failing rule is named on the record.' },

  /* A match against a do-not-rehire record does NOT auto-reject. It stops the
     application where it stands and puts it in front of a person, because the
     record may be wrong and the only way to find out is to ask somebody who was
     there. Both ways out are by:['human'] and both require a reason. */
  { from: 'ELIGIBILITY_REVIEW', to: 'INELIGIBLE', by: ['human'], effect: 'resolveHold',
    reason: 'A person read the prior record and upheld it.' },
  { from: 'ELIGIBILITY_REVIEW', to: 'ELIGIBLE', by: ['human'], effect: 'resolveHold',
    reason: 'A person read the prior record and overrode it, with a reason on the audit trail.' },

  { from: 'ELIGIBLE', to: 'SCREENING_PENDING', by: ['system'], auto: true, effect: 'createScreening' },

  { from: 'SCREENING_PENDING', to: 'SCREENING_IN_PROGRESS', by: ['system', 'agent', 'human'],
    effect: 'startScreening' },
  /* 'human' belongs here. A manager pressing "run the screening" is not doing
     the screening, they are asking the agent to, and leaving them off this list
     meant the product refused its own button. The restriction that matters is
     two rows below, on the decision. */
  { from: 'SCREENING_IN_PROGRESS', to: 'SCREENING_COMPLETE', by: ['system', 'agent', 'human'],
    guard: 'allRequiredScreeningsDone', effect: 'completeScreening' },

  // The agent's ceiling. It can put somebody in front of a person. It stops there.
  { from: 'SCREENING_COMPLETE', to: 'DECISION_PENDING', by: ['system', 'agent', 'human'], auto: true,
    guard: 'allRequiredScreeningsDone',
    reason: 'The agent may advance a candidate to a decision. That is as far as it goes.' },

  { from: 'DECISION_PENDING', to: 'APPROVED', by: ['human'], effect: 'recordDecision',
    reason: 'A named person hires. No model, no rule and no bulk action without one.' },
  { from: 'DECISION_PENDING', to: 'REJECTED', by: ['human'], effect: 'recordDecision',
    reason: 'A named person rejects. The agent cannot reject anybody at all.' },

  { from: 'APPROVED', to: 'OFFER_PENDING', by: ['system'], auto: true, effect: 'createOffer' },
  { from: 'OFFER_PENDING', to: 'OFFER_SENT', by: ['system', 'human'], effect: 'sendOffer',
    reason: 'Sending an offer is an external communication, so it is confirmed rather than automatic.' },
  { from: 'OFFER_SENT', to: 'OFFER_ACCEPTED', by: ['external', 'human'], effect: 'acceptOffer' },
  { from: 'OFFER_SENT', to: 'OFFER_DECLINED', by: ['external', 'human'], effect: 'declineOffer' },

  // Conditional offer first, then the check. That order is not a preference:
  // California Gov. Code 12952(a)(2) reaches the conduct of the check itself,
  // not just the question on the form.
  { from: 'OFFER_ACCEPTED', to: 'BACKGROUND_CHECK_PENDING', by: ['system'], auto: true,
    effect: 'fanOutParallelWork',
    reason: 'Acceptance is the point where independent work can start in parallel.' },
  { from: 'BACKGROUND_CHECK_PENDING', to: 'BACKGROUND_CHECK_IN_PROGRESS', by: ['system', 'human'],
    effect: 'orderBackgroundCheck' },
  { from: 'BACKGROUND_CHECK_IN_PROGRESS', to: 'BACKGROUND_CHECK_COMPLETE', by: ['external', 'system'],
    guard: 'allSearchesReturned', effect: 'closeBackgroundCheck' },

  { from: 'BACKGROUND_CHECK_COMPLETE', to: 'ONBOARDING_PENDING', by: ['system'], auto: true },
  { from: 'ONBOARDING_PENDING', to: 'ONBOARDING_IN_PROGRESS', by: ['system'], auto: true },
  { from: 'ONBOARDING_IN_PROGRESS', to: 'READY_FOR_SHIFT', by: ['system'], auto: true,
    guard: 'preShiftTasksDone' },

  { from: 'READY_FOR_SHIFT', to: 'FIRST_SHIFT_SCHEDULED', by: ['system', 'human'], effect: 'scheduleFirstShift' },
  { from: 'FIRST_SHIFT_SCHEDULED', to: 'STARTED', by: ['external', 'human'], effect: 'recordStart' },

  /* Only a person ends somebody's employment, and only with a reason. */
  { from: 'STARTED', to: 'TERMINATED', by: ['human'], effect: 'recordTermination' },
  { from: 'DAY_30',  to: 'TERMINATED', by: ['human'], effect: 'recordTermination' },
  { from: 'DAY_60',  to: 'TERMINATED', by: ['human'], effect: 'recordTermination' },

  { from: 'STARTED', to: 'DAY_30', by: ['system'], guard: 'thirtyDaysElapsed', effect: 'checkIn' },
  { from: 'DAY_30', to: 'DAY_60', by: ['system'], guard: 'sixtyDaysElapsed', effect: 'checkIn' },
  { from: 'DAY_60', to: 'DAY_90', by: ['system'], guard: 'ninetyDaysElapsed', effect: 'checkIn' }
];

/** Withdrawing is legal from anywhere that has not already ended. */
const WITHDRAWABLE_FROM = Object.keys(STATES).filter((s) => !STATES[s].terminal);
WITHDRAWABLE_FROM.forEach((from) => {
  TRANSITIONS.push({ from, to: 'WITHDRAWN', by: ['external', 'human'], effect: 'recordWithdrawal' });
});

/* -------------------------------------------------------------- lookups --- */

const BY_FROM = {};
TRANSITIONS.forEach((t) => { (BY_FROM[t.from] = BY_FROM[t.from] || []).push(t); });

function transitionsFrom(state) { return BY_FROM[state] || []; }

function findTransition(from, to) {
  return transitionsFrom(from).find((t) => t.to === to) || null;
}

function isTerminal(state) { return !!(STATES[state] && STATES[state].terminal); }
function isLost(state) { return !!(STATES[state] && STATES[state].lost); }
function stepOf(state) { return STATES[state] ? STATES[state].step : null; }
function ownerOf(state) { return STATES[state] ? STATES[state].owner : 'system'; }
function waitingOn(state) { return (STATES[state] && STATES[state].waitingOn) || null; }

/**
 * Can the product move this on by itself, or is it waiting on somebody?
 * Three answers, and they map onto colours that already exist rather than
 * introducing a fourth vocabulary.
 */
function actability(state) {
  const s = STATES[state];
  if (!s) return 'product';
  if (s.waitingOn) return 'external';
  if (s.owner === 'clock') return 'external';
  if (s.owner === 'human') return 'person';
  return 'product';
}

/* --------------------------------------------------- the onboarding graph --

   The parallelisation story, written as dependencies rather than asserted in
   prose. Everything with no unmet dependency starts at the same moment.

   afterStart marks the tasks that genuinely cannot happen before the first day
   of work for pay. I-9 Section 2 is one: a person examines original documents.
   The E-Verify case is another. Neither is a queue we created, and neither can
   be pulled forward however good the software is.
   -------------------------------------------------------------------------- */

const ONBOARDING_TASKS = [
  { key: 'i9_s1',      step: 11, owner: 'system', actor: 'candidate',
    name: 'Form I-9, Section 1', needs: [], estMs: 12 * 60000,
    law: 'On or before the first day of work for pay. 8 CFR 274a.2(b)(1)(i)(A).' },
  { key: 'w4',         step: 11, owner: 'system', actor: 'candidate',
    name: 'Form W-4', needs: [], estMs: 6 * 60000 },
  { key: 'direct_dep', step: 11, owner: 'system', actor: 'candidate',
    name: 'Direct deposit details', needs: [], estMs: 5 * 60000 },
  { key: 'policies',   step: 11, owner: 'system', actor: 'candidate',
    name: 'Policy sign-offs', needs: [], estMs: 9 * 60000 },

  { key: 'i9_s2',      step: 11, owner: 'human', actor: 'manager', afterStart: true,
    name: 'Form I-9, Section 2 examined and signed', needs: ['i9_s1'], estMs: 10 * 60000,
    law: 'Within 3 business days of the first day of work for pay. A named person examines the original documents. No model can sign this.' },
  { key: 'everify',    step: 12, owner: 'system', actor: 'system', afterStart: true,
    name: 'E-Verify case created', needs: ['i9_s2'], estMs: 4 * 60000,
    law: 'No later than the third business day after the employee starts work for pay.' },

  { key: 'training',   step: 13, owner: 'system', actor: 'candidate',
    name: 'Required training assigned', needs: [], estMs: 2.4 * 86400000 },
  { key: 'uniform',    step: 14, owner: 'system', actor: 'system',
    name: 'Uniform ordered', needs: [], estMs: 6 * 3600000 },
  { key: 'badge',      step: 14, owner: 'human', actor: 'manager',
    name: 'Badge and till access provisioned', needs: [], estMs: 4 * 3600000,
    note: 'The one part of this map with no public vendor documentation anywhere, and it sits on the critical path to day one.' },
  { key: 'payroll',    step: 14, owner: 'system', actor: 'system',
    name: 'Payroll record created', needs: ['w4', 'direct_dep'], estMs: 45 * 60000 },
  { key: 'systems',    step: 14, owner: 'system', actor: 'system',
    name: 'Store systems access', needs: ['payroll'], estMs: 2 * 3600000 }
];

/** The tasks that must be finished before a first shift can be scheduled. */
const PRE_SHIFT_TASKS = ONBOARDING_TASKS.filter((t) => !t.afterStart).map((t) => t.key);

module.exports = {
  STATES, TRANSITIONS, ONBOARDING_TASKS, PRE_SHIFT_TASKS,
  transitionsFrom, findTransition, isTerminal, isLost,
  stepOf, ownerOf, waitingOn, actability
};
