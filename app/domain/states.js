/* ============================================================================
   states.js  ·  the state machine, as data

   Thirty-two states and sixty-six transitions. This is the part of the product
   that has to be right, because some of what is in it is not a product opinion.
   The two counts are printed by `/api/health`, so they are checked rather than
   remembered.

   THE TWO RULES THAT ARE NOT OURS TO CHANGE. An AI model may screen, summarise,
   cite evidence, flag a concern and recommend. It may move a candidate FORWARD
   to a decision. It may never approve and it may never reject. Those two
   transitions carry by: ['human'] and the engine refuses every other actor,
   including the assistant confirming on its own behalf. There is a test that
   tries all four ways round.

   Twelve transition rows carry by: ['human']: the two ways out of a rehire
   hold, the ineligibility override, the two ways to record a manager interview,
   the two decisions, extending an offer, closing a lapsed one, and the three
   terminations. A machine does not end somebody's employment either.

   TEN of those are pairs no other actor can reach at all, which is what
   HUMAN_ONLY at the foot of this file lists. The two that are not are the ways
   out of a rehire hold, where the same from and to also exist as a system row
   under a guard, and the difference is exactly which of them is running.

   THE STATE CONTENT WAS CARRIED ACROSS VERBATIM from the previous build. It was
   derived from the funnel map and the compliance work, it is covered by a test
   suite that tried to break it, and re-typing a fifty-row employment state
   table by hand is how a wrong `by` list gets shipped.

   WHAT WAS ADDED 8 SEPTEMBER 2026, and each one closes a hole review found:

   · INTERVIEW_PENDING, INTERVIEW_SCHEDULED and INTERVIEW_COMPLETE, steps 4 and
     5. Three of the eight requisitions require a manager interview, and the
     machine had no way to record one. An application for the first job on the
     careers page parked at "Screening in progress" for ever, refused with
     "Waiting on the manager interview", and no state, transition, effect or
     surface anywhere could complete that interview. Steps 4 and 5 also had no
     state at all, so two funnel steps had zero observations across all
     thirty-six seeded people.
   · OFFER_EXPIRED and OFFER_LAPSED, step 8. `expiresAt` was written by the
     offer effect and read by nothing, so an offer whose window had passed still
     read as live pipeline. Software may now notice the window passed. Only a
     person may close the application, which is why OFFER_EXPIRED is not
     terminal and OFFER_LAPSED is by: ['human'] with a reason required.

   WHAT WAS DELIBERATELY NOT ADDED. Review proposed a RAMPING state spanning
   steps 17 and 18, week one on the floor and the ramp to working unsupervised.
   Three reasons it is not here. A state carries ONE step number and every
   reader of it reads one, so a state cannot span two. Putting a manager
   sign-off between STARTED and DAY_30 would put a person in front of a calendar
   fact, which is the manager-interview deadlock in a new place. And entering
   either step on a timer would assert that floor training is happening when the
   product records nothing about it, which is the same dishonesty as drawing a
   bar from an invented median. The two steps stay honestly empty and the
   effects that used to stamp events with step 17 and step 18 were mislabelled,
   which is fixed in effects.js.

   step is which of the twenty funnel steps the state sits in. Several states
   share a step, which is correct: offer sent and offer accepted are both step
   8, they are the two ends of one wait.

   waitingOn marks the states where the thing being waited for is outside the
   building: the candidate, the screening agency, or a government department.
   Those are not product failures and no surface may draw them as though they
   were.

   humanNeeds is the sentence the engine gives when an application is sitting in
   a human-owned state. Without it every one of them said "A person has to act",
   which does not tell the person which act.

   needsReason on a transition makes the engine refuse the move without one.
   Before it existed a rejection could be recorded with reason null beside an
   assessment recommending the candidate advance, which is the strongest
   plaintiff exhibit a hiring product can generate.
   ============================================================================ */

export const STATES = {
  APPLICATION_RECEIVED:         { step: 1,  owner: 'system', label: 'Application received' },
  ELIGIBILITY_REVIEW:           { step: 2,  owner: 'system', label: 'Eligibility running' },
  ELIGIBLE:                     { step: 2,  owner: 'system', label: 'Eligible' },
  /* Terminal, and a person can still reopen it. The rules end an application
     here with no human in the path, and the sharpest case is somebody who holds
     a work permit, asylum status or TPS and does not read themselves as
     "authorised". INELIGIBLE to ELIGIBLE, by: ['human'] with a reason, is the
     path back. Software closes it, only a person reopens it. */
  INELIGIBLE:                   { step: 2,  owner: 'system', label: 'Not eligible', terminal: true, lost: true },
  SCREENING_PENDING:            { step: 3,  owner: 'agent',  label: 'Screening queued' },
  SCREENING_IN_PROGRESS:        { step: 3,  owner: 'agent',  label: 'Screening in progress' },
  /* Step 3 is the behavioural screening, so this means the CALL is done. On a
     role that needs a manager interview it is not the end of screening, and the
     transition out of here goes to the interview rather than to a decision. */
  SCREENING_COMPLETE:           { step: 3,  owner: 'agent',  label: 'Screening complete' },

  /* Steps 4 and 5, the manager interview. The label matters as much as the
     state: while this is outstanding the application used to read "Screening in
     progress", which reads as the AI still talking to the candidate, so the one
     person who could clear it did not know they were the blocker. */
  INTERVIEW_PENDING:            { step: 4,  owner: 'human',  label: 'Interview to arrange',
                                  humanNeeds: 'Waiting for you to arrange the manager interview.' },
  INTERVIEW_SCHEDULED:          { step: 4,  owner: 'human',  label: 'Interview booked',
                                  humanNeeds: 'Waiting for you to interview them and write up the notes.' },
  INTERVIEW_COMPLETE:           { step: 5,  owner: 'human',  label: 'Interview done',
                                  humanNeeds: 'The interview is recorded. This moves to your decision by itself.' },

  DECISION_PENDING:             { step: 6,  owner: 'human',  label: 'Awaiting your decision',
                                  humanNeeds: 'Waiting for you to hire or reject, with a reason.' },
  APPROVED:                     { step: 6,  owner: 'human',  label: 'Approved' },
  REJECTED:                     { step: 6,  owner: 'human',  label: 'Rejected', terminal: true, lost: true },
  OFFER_PENDING:                { step: 7,  owner: 'system', label: 'Offer ready to send' },
  OFFER_SENT:                   { step: 8,  owner: 'agent',  label: 'Offer sent', waitingOn: 'candidate' },
  OFFER_ACCEPTED:               { step: 8,  owner: 'agent',  label: 'Offer accepted' },
  OFFER_DECLINED:               { step: 8,  owner: 'agent',  label: 'Offer declined', terminal: true, lost: true },
  /* The offer window passed with no answer. NOT terminal and NOT lost, on
     purpose. The window is tenant policy rather than any statutory period, so
     software noticing it has passed is a fact, and software closing somebody's
     application on the strength of it is a decision. The application waits here
     in a named person's queue until they extend it, honour a late answer, or
     close it. */
  OFFER_EXPIRED:                { step: 8,  owner: 'human',  label: 'Offer window passed',
                                  humanNeeds: 'Waiting for you to extend this offer, take a late answer, or close it.' },
  OFFER_LAPSED:                 { step: 8,  owner: 'human',  label: 'Offer closed, no answer',
                                  terminal: true, lost: true },
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

export const TRANSITIONS = [
  /* The rules run on the way IN to the review, not on the way out of it. The
     guards below read the result, so evaluating it as an exit effect would ask
     each guard to consult an answer that had not been produced yet. */
  { from: 'APPLICATION_RECEIVED', to: 'ELIGIBILITY_REVIEW', by: ['system'], auto: true,
    effect: 'recordEligibility',
    reason: 'Every application goes through the rules. Nothing skips it.' },

  { from: 'ELIGIBILITY_REVIEW', to: 'ELIGIBLE', by: ['system'], auto: true, guard: 'eligibilityPassed' },
  { from: 'ELIGIBILITY_REVIEW', to: 'INELIGIBLE', by: ['system'], auto: true, guard: 'eligibilityFailed',
    effect: 'notifyIneligible',
    reason: 'A hard rule failed. Deterministic, and the failing rule is named on the record.' },

  /* A match against a do-not-rehire record does NOT auto-reject. It stops the
     application where it stands and puts it in front of a person, because the
     record may be wrong and the only way to find out is to ask somebody who was
     there. Both ways out are by:['human'] and both require a reason. */
  /* THESE TWO SHARE A from AND A to WITH THE TWO SYSTEM ROWS ABOVE, and that
     was a live deadlock until 8 September. The engine looked the move up with
     the first row that matched the pair, which is the system row, so a manager
     upholding or overriding a prior record was refused with "this move can only
     be made by: system" while the same engine's own `allowed` list told them
     they could. Both ways out of a rehire hold were unreachable, on the one
     story the product calls its differentiator. The lookup now picks the row
     that matches the actor, so a from and a to may legitimately appear more
     than once. */
  { from: 'ELIGIBILITY_REVIEW', to: 'INELIGIBLE', by: ['human'], effect: 'resolveHold', needsReason: true,
    reason: 'A person read the prior record and upheld it.' },
  { from: 'ELIGIBILITY_REVIEW', to: 'ELIGIBLE', by: ['human'], effect: 'resolveHold', needsReason: true,
    reason: 'A person read the prior record and overrode it, with a reason on the audit trail.' },

  /* The way back from a decision software made by itself. There is no guard,
     because the eligibility result is exactly what is being overridden, and the
     original result is kept beside the override rather than rewritten. */
  { from: 'INELIGIBLE', to: 'ELIGIBLE', by: ['human'], effect: 'overrideIneligibility', needsReason: true,
    reason: 'A person read the failing rule, decided it does not apply to this candidate, and said why.' },

  { from: 'ELIGIBLE', to: 'SCREENING_PENDING', by: ['system'], auto: true, effect: 'createScreening' },

  { from: 'SCREENING_PENDING', to: 'SCREENING_IN_PROGRESS', by: ['system', 'agent', 'human'],
    effect: 'startScreening' },
  /* 'human' belongs here. A manager pressing "run the screening" is not doing
     the screening, they are asking the agent to, and leaving them off this list
     meant the product refused its own button. The restriction that matters is
     two rows below, on the decision. */
  /* The guard is the CALL rather than every required screening, and auto: true
     was added with it. Both halves of that fixed the same deadlock. The old
     guard asked for the manager interview too, so on a role that needs one the
     call finishing could not move the application anywhere at all, and because
     the edge was not automatic nothing tried. Now a finished call settles
     forward by itself, and the row below decides whether that is an interview
     or a decision. */
  { from: 'SCREENING_IN_PROGRESS', to: 'SCREENING_COMPLETE', by: ['system', 'agent', 'human'], auto: true,
    guard: 'callScreeningDone', effect: 'completeScreening' },

  /* ORDER MATTERS HERE. settle() takes the first automatic edge whose guard
     passes, so the interview row has to come before the decision row. The
     decision row's guard would refuse anyway, but relying on that would mean a
     candidate needing an interview sat still instead of moving to it. */
  { from: 'SCREENING_COMPLETE', to: 'INTERVIEW_PENDING', by: ['system', 'agent', 'human'], auto: true,
    guard: 'managerInterviewOutstanding', effect: 'openManagerInterview',
    reason: 'This role needs a manager interview, so the AI screening hands to a person here.' },

  // The agent's ceiling. It can put somebody in front of a person. It stops there.
  { from: 'SCREENING_COMPLETE', to: 'DECISION_PENDING', by: ['system', 'agent', 'human'], auto: true,
    guard: 'allRequiredScreeningsDone',
    reason: 'The agent may advance a candidate to a decision. That is as far as it goes.' },

  /* Steps 4 and 5. Arranging the interview and holding it are two different
     waits, so they are two states, and a candidate who does not turn up goes
     back to needing a slot rather than being ended by software.

     Nothing here is automatic and nothing here is a machine's move. The one
     exception is who may record a no-show: the agent chases and escalates at
     step 5 by design, and recording that somebody did not appear neither
     advances nor ends the application. */
  { from: 'INTERVIEW_PENDING', to: 'INTERVIEW_SCHEDULED', by: ['human', 'system'],
    effect: 'scheduleManagerInterview',
    reason: 'A slot exists. Written on the screening record, so the interview has a time somebody can be held to.' },
  { from: 'INTERVIEW_PENDING', to: 'INTERVIEW_COMPLETE', by: ['human'], needsReason: true,
    effect: 'completeManagerInterview',
    reason: 'A walk-in interview, held without a booked slot. Step 4 is recorded as not having happened rather than backfilled.' },
  { from: 'INTERVIEW_SCHEDULED', to: 'INTERVIEW_COMPLETE', by: ['human'], needsReason: true,
    effect: 'completeManagerInterview',
    reason: 'The manager held the interview and wrote the notes. No model reads them and no model scores them.' },
  { from: 'INTERVIEW_SCHEDULED', to: 'INTERVIEW_PENDING', by: ['human', 'agent'],
    effect: 'recordInterviewNoShow',
    reason: 'They did not turn up. The slot is cleared and the interview needs arranging again.' },
  { from: 'INTERVIEW_COMPLETE', to: 'DECISION_PENDING', by: ['system', 'agent', 'human'], auto: true,
    guard: 'allRequiredScreeningsDone',
    reason: 'Every required screening is done, so this goes in front of the person who decides.' },

  /* needsReason is not decoration. A rejection recorded with reason null, next
     to an assessment that recommended advancing with every criterion met, is
     affirmative evidence of an unexplained departure from the process. The
     employer's burden under McDonnell Douglas is to articulate a legitimate
     non-discriminatory reason, and the product used to generate rows that
     cannot. */
  { from: 'DECISION_PENDING', to: 'APPROVED', by: ['human'], effect: 'recordDecision', needsReason: true,
    reason: 'A named person hires. No model, no rule and no bulk action without one.' },
  { from: 'DECISION_PENDING', to: 'REJECTED', by: ['human'], effect: 'recordDecision', needsReason: true,
    reason: 'A named person rejects. The agent cannot reject anybody at all.' },

  { from: 'APPROVED', to: 'OFFER_PENDING', by: ['system'], auto: true, effect: 'createOffer' },
  { from: 'OFFER_PENDING', to: 'OFFER_SENT', by: ['system', 'human'], effect: 'sendOffer',
    reason: 'Sending an offer is an external communication, so it is confirmed rather than automatic.' },
  { from: 'OFFER_SENT', to: 'OFFER_ACCEPTED', by: ['external', 'human'], effect: 'acceptOffer' },
  { from: 'OFFER_SENT', to: 'OFFER_DECLINED', by: ['external', 'human'], effect: 'declineOffer' },

  /* THE OFFER WINDOW. `expiresAt` was written on every offer and read by
     nothing, so three of the seeded offers expire inside a day of the opening
     screen and all three still read as live pipeline for ever. This is the edge
     that notices. It is automatic because a date passing is a fact, and it
     stops at a person because closing an application is not.

     A late answer is still an answer, so accept and decline both stay open from
     here. That is the honest shape: the candidate rang back the next morning
     and the manager still wants them. */
  { from: 'OFFER_SENT', to: 'OFFER_EXPIRED', by: ['system'], auto: true, guard: 'offerWindowPassed',
    effect: 'recordOfferExpiry',
    reason: 'The window on the offer passed with no answer. Tenant policy, not a statutory period.' },
  { from: 'OFFER_EXPIRED', to: 'OFFER_SENT', by: ['human'], effect: 'extendOffer', needsReason: true,
    reason: 'A person gave them longer. The new window and who granted it are both recorded.' },
  { from: 'OFFER_EXPIRED', to: 'OFFER_ACCEPTED', by: ['external', 'human'], effect: 'acceptOffer',
    reason: 'They answered late and it was honoured.' },
  { from: 'OFFER_EXPIRED', to: 'OFFER_DECLINED', by: ['external', 'human'], effect: 'declineOffer',
    reason: 'They answered late and said no.' },
  { from: 'OFFER_EXPIRED', to: 'OFFER_LAPSED', by: ['human'], effect: 'closeLapsedOffer', needsReason: true,
    reason: 'A named person closed it. OFFER_DECLINED would put words in the candidate mouth, because nobody declined anything.' },

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

  /* Only a person ends somebody's employment, and only with a reason. The
     reason half of that sentence was a comment and nothing more until
     needsReason existed to enforce it. */
  { from: 'STARTED', to: 'TERMINATED', by: ['human'], effect: 'recordTermination', needsReason: true },
  { from: 'DAY_30',  to: 'TERMINATED', by: ['human'], effect: 'recordTermination', needsReason: true },
  { from: 'DAY_60',  to: 'TERMINATED', by: ['human'], effect: 'recordTermination', needsReason: true },

  /* auto: true, added 8 September. These three carry an elapsed-days guard and
     nothing else, and without the flag settle() would not follow them, so a
     started employee could never reach day thirty at all. The seeded history
     called each one explicitly, which hid it. The guard is what keeps this
     honest: the move happens because thirty days have genuinely passed, not
     because somebody wound a clock. */
  { from: 'STARTED', to: 'DAY_30', by: ['system'], auto: true, guard: 'thirtyDaysElapsed', effect: 'checkIn' },
  { from: 'DAY_30', to: 'DAY_60', by: ['system'], auto: true, guard: 'sixtyDaysElapsed', effect: 'checkIn' },
  { from: 'DAY_60', to: 'DAY_90', by: ['system'], auto: true, guard: 'ninetyDaysElapsed', effect: 'checkIn' }
];

/* Withdrawing is legal from anywhere that has not already ended, so those
   transitions are generated rather than typed out. Twenty-five of them, which
   with the forty-one typed above makes sixty-six. Generating them means a state
   added later cannot accidentally become one a candidate is trapped in, and it
   is why the five states added on 8 September needed no withdrawal rows of
   their own. */
const WITHDRAWABLE_FROM = Object.keys(STATES).filter((s) => !STATES[s].terminal);
WITHDRAWABLE_FROM.forEach((from) => {
  TRANSITIONS.push({ from, to: 'WITHDRAWN', by: ['external', 'human'], effect: 'recordWithdrawal' });
});

export const ONBOARDING_TASKS = [
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

/* The nine of eleven that must be done before a first shift. Derived from the
   `afterStart` flag rather than listed, so the two that legitimately run after
   the start date, I-9 section 2 and the E-Verify case, cannot drift out of the
   pre-shift gate by hand. */
export const PRE_SHIFT_TASKS = ONBOARDING_TASKS.filter((t) => !t.afterStart).map((t) => t.key);

/* ---------------------------------------------------------------- lookups --- */

export function stateOf(name) { return STATES[name] || null; }
export function label(name)   { const s = STATES[name]; return s ? s.label : name; }
export function stepOf(name)  { const s = STATES[name]; return s ? s.step : null; }
export function ownerOf(name) { const s = STATES[name]; return s ? s.owner : 'system'; }
export function isTerminal(name) { const s = STATES[name]; return !!(s && s.terminal); }
export function waitingOn(name)  { const s = STATES[name]; return (s && s.waitingOn) || null; }

/** Every move legal out of a state, whoever is asking. */
export function movesFrom(name) {
  return TRANSITIONS.filter((t) => t.from === name);
}

/** Every move a given actor type may make out of a state. */
export function movesFor(name, actorType) {
  return movesFrom(name).filter((t) => t.by.indexOf(actorType) >= 0);
}

/**
 * Every transition row for one move. There is usually one. There are two where
 * the same move means different things depending on who makes it: the two ways
 * out of a rehire hold are the system following the rules and a person
 * overruling them, and they carry different effects.
 */
export function findTransitions(from, to) {
  return TRANSITIONS.filter((t) => t.from === from && t.to === to);
}

/**
 * The transition row for one move, or null if the move does not exist.
 *
 * PASS THE ACTOR TYPE. Without it this returns the first row for the pair,
 * which is what shipped, and on the rehire hold the first row is the system's.
 * A manager was then refused their own move with "this move can only be made
 * by: system" while `movesFor` told them it was theirs. Callers that only want
 * to know whether a move exists at all may still omit it.
 */
export function findTransition(from, to, actorType) {
  const rows = findTransitions(from, to);
  if (!rows.length) return null;
  if (!actorType) return rows[0];
  return rows.find((t) => t.by.indexOf(actorType) >= 0) || null;
}

/* The states no machine may enter. Derived from the table rather than listed,
   so a new human-only transition is protected the moment it is added and a
   `by` list edited by mistake shows up as a change here.

   EVERY row for the pair has to be human-only, not just one of them. The old
   version filtered row by row, so the human row of a duplicated pair made the
   pair look human-only while a system row for the same pair sat two lines
   above it. Nothing consumed that yet, and a safety test reading it would have
   passed on a false reading. */
export const HUMAN_ONLY = Array.from(
  new Set(TRANSITIONS.map((t) => t.from + '>' + t.to)))
  .filter((pair) => {
    const [from, to] = pair.split('>');
    const rows = findTransitions(from, to);
    return rows.every((t) => t.by.length === 1 && t.by[0] === 'human');
  })
  .map((pair) => ({ from: pair.split('>')[0], to: pair.split('>')[1] }));

/**
 * Can the product move this on by itself, or is it waiting on somebody?
 *
 * Three answers, mapped onto hues that already exist rather than introducing a
 * fourth vocabulary. This is the producer for the control axis U-41 and U-45
 * both read, which previously had none.
 *
 *   product   we can act now
 *   person    a named human has to
 *   external  a candidate, a vendor or a government department has to, and
 *             that is not a product failure
 */
export function actability(name) {
  const s = STATES[name];
  if (!s) return 'product';
  if (s.waitingOn) return 'external';
  if (s.owner === 'clock') return 'external';
  if (s.owner === 'human') return 'person';
  return 'product';
}

export function isLost(name) { const s = STATES[name]; return !!(s && s.lost); }

/** The onboarding graph as edges, for the dependency drawing on the timeline. */
export function taskEdges() {
  const out = [];
  ONBOARDING_TASKS.forEach((task) => {
    (task.needs || []).forEach((n) => out.push({ from: n, to: task.key }));
  });
  return out;
}
