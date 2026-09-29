/* ============================================================================
   metrics.js  ·  every number the product reports, and nothing it was told

   No duration in this product is written into a screen. Every one is computed
   here from the recorded workflow events. If the data produces 4.7 days the
   interface says 4.7 days. If it produces 8.3 it says 8.3. Nothing is rounded
   towards a better story and there is no floor under an ugly number.

   THE PROPERTY THIS FILE HAS TO KEEP: delete an application's workflow events
   and every number about it changes. A figure that survives its events being
   deleted was written down somewhere it should not have been. So every
   timestamp in here comes off an event. None of them comes off an application,
   an offer, a shift or an exception row.

   THERE IS EXACTLY ONE EXCEPTION and it is marked on every row that carries it.
   `fill` reads `requisition.openedAt`, because nothing writes an event when a
   job opens, and without it there is no such thing as time to cover an opening.
   Every row it appears on says `daysOpenRestsOnStoredField: true`. When
   whatever creates requisitions writes an opened event, this reads that instead
   and the exception goes.

   The old module leaked on that property in three places, and each one is fixed
   with the reason named at the site:
     · `blockedMs` was summed from exception rows, so it survived the events
       being deleted intact.
     · `offerAcceptedAt` was read off the offer row and `firstShiftAt` off the
       shift row, so two of the eight spans were reading stored fields.
     · `acceptanceToFirstShift` ended at the shift's scheduled start, which is a
       plan rather than an observation. A candidate who never turned up still
       reported a duration.

   THE SPLIT BETWEEN TIMESTAMPS AND STATE. Every instant comes from an event.
   The classification of an application, whether it is open, lost or still
   running, comes from its state, because the state machine is the record of
   that and events are the record of when. Reading a state, or a task's status,
   is not reading a stored duration. There is no second copy of a duration
   anywhere.

   WORK AGAINST QUEUE is the distinction the whole product rests on.
     work   somebody or something was doing the thing. Recorded as durationMs
            on the event that did it.
     queue  the span that nothing was happening in. Derived, never recorded.

   THE THREE PRIMARY METRICS are time to hire, the number of people involved,
   and manual work. That is settled and this file does not add a fourth. It does
   add time to cover an opening, which is a different question and is marked as
   supporting rather than primary. Ninety-day retention is deliberately not
   among them, and there is no trend, no historical series and no benchmark
   comparison in here, because the data cannot support one and manufacturing one
   would be a fabrication.

   EVERY MEDIAN CARRIES ITS SAMPLE SIZE. `summarise` returns an object, so a
   median cannot reach an interface without n attached, and it also carries
   `smallSample` so a caller cannot render a median of one without being told it
   is one. There is no exported function that returns a bare median, on purpose.

   ------------------------------------------------------------------------
   FIVE THINGS A REVIEW FOUND WRONG IN HERE. Each fix is named at its site as
   well, because three of these had already been reintroduced once.

   1. TIME TO HIRE HAD TWO PEER READINGS SIXTEEN TIMES APART, and nothing said
      which one was the headline. On the seeded data applied to offer accepted
      is 1.71 days and applied to first shift worked is 26.96 days. Whichever
      went on the metrics strip, the other was one click away. `TIME_TO_HIRE`
      below names the headline and the reason. The short reading stays, as a
      component of the long one rather than as its equal.

   2. AN APPLICATION THAT ARRIVED SECONDS AGO REPORTED A HARD ZERO on queue
      share and slipped into the population unannounced. It was created, the
      form fill time was recorded as work, and its wall clock span was a few
      milliseconds, so work exceeded elapsed and the share came out 0.00 rather
      than "not computable yet". A demo where the candidate you just created
      reads as a zero in the distribution falls apart on stage. Now: a share is
      null when recorded work exceeds the measured span, `mostRecent` names the
      newest application and says why it is not in the headline, and every
      headline carries the count of applications still in flight behind it.

   3. THE APPLICANT WAS COUNTED AS ONE OF THE PEOPLE INVOLVED. Six events carry
      actorType 'human' with the actor 'Candidate', so every completed hire read
      as two people, one of whom was the person being hired. People involved is
      one of the three locked metrics. `peopleFrom` now excludes the applicant
      by name and reports `applicantTouches` separately, so the exclusion is
      visible rather than silent. The events themselves are still mistyped and
      that is a fix in effects.js, not here.

   4. QUEUE SHARE FLATTERED US THREE WAYS AT ONCE. See the block above
      `attributeWait`. It is the flagship number and it went UP when a candidate
      was neglected, so it is now split by who was being waited on and measured
      over the hiring span rather than over the whole life of the record.

   5. A STEP WHOSE END WAS NEVER RECORDED BORROWED A LATER STEP'S START. Step 12
      is E-Verify. Its only event is the entry, so the old rule ended it at the
      first later-numbered event, which for a post-start step is the day thirty
      check-in. That produced a 29.04 day median for a check that clears in
      seconds for most people, and it carried a fifth of the bottleneck ranking.
      Step numbering is not time order after somebody starts work, so the rule
      is not repairable by arithmetic. Every step row now says where its end
      came from, medians are reported twice, once over observed ends and once
      over all of them, and the bottleneck ranks on observed ends only.

   ------------------------------------------------------------------------
   FIELD HR ASKED WHETHER ANY OF THE THREE PRIMARY METRICS MOVES IF THEY DO
   THEIR JOB BETTER. On this data, measured rather than argued:

     time to hire       Yes. Offer accepted to first shift worked is 88.8 to
                        94.1 per cent of the whole span on the six people who
                        started, and that window is theirs.
     people involved    No. Every completed hire touches exactly one member of
                        staff once the applicant is excluded, so the metric has
                        no room to fall. It can only rise, by adding a person.
                        `people.perCompletedHire` reports the range so this is
                        visible on the page rather than only in this comment.
     manual work        Barely. Ninety per cent of the recorded minutes on a
                        started hire is one four hour constant on the badge
                        task, and the recorded human durations take seven
                        distinct values in total.
                        `manual.concentrationPerCompletedHire` and
                        `manual.distinctDurations` report both, so the number
                        cannot be shown as measured effort.

   EVERY FIGURE QUOTED IN THE COMMENTS BELOW IS A SNAPSHOT of the seeded data,
   taken on 8 September 2026. They move: the demo clock advances in real time, so
   the elapsed span of every open application grows while somebody watches, and
   any percentage written into a decision record was true of one moment. Read
   them as the shape of the defect being described rather than as a figure to
   quote.

   WHAT THIS FILE CANNOT FIX, and each one is handed to the file that owns it:
   the six mistyped applicant events (effects.js), the missing completion event
   on steps 12, 13, 16, 17 and 18 (effects.js), the four hour badge constant and
   the single manager who does everything (seed.js), and the invented `at` and
   `drop` columns on the step table (domain/steps.js).
   ============================================================================ */

import { STEPS } from '../../domain/steps.js';
import { stepOf, isTerminal, isLost, actability } from '../../domain/states.js';

/** Ranked bottlenecks returned. Carried across from the old module, which
    returned the top six. Not a statistical threshold, just how many fit. */
const BOTTLENECK_ROWS = 6;

/**
 * Below this many observations a median is flagged rather than hidden.
 *
 * THIS NUMBER HAS NO SOURCE. It came out of a review that found five store rows
 * carrying medians of one person each, and it is a display rule rather than a
 * statistical one. Nothing is dropped for being under it. Every summary says
 * `smallSample` and every caller can decide, which is the same reason no
 * minimum was enforced before: a minimum with no source, applied silently, is
 * worse than a flag.
 */
export const MIN_REPORTABLE_N = 5;

/**
 * The first step that happens after somebody is on the floor.
 *
 * STARTED maps to step 16, so 17 onwards is week one, the ramp, the check-ins
 * and day ninety. That is retention rather than hiring, and it is not a
 * threshold anybody chose: it is read off the step table, where the Activate
 * stage begins at 17. It exists because sixty days of the queue on this data is
 * the wait between the day thirty and day ninety check-ins, and a page ranking
 * hiring delays has to be able to take that out.
 */
const FIRST_POST_START_STEP = (STEPS.find((s) => s.stage === 'Activate') || { n: 17 }).n;

/**
 * Which reading of time to hire leads, and why.
 *
 * The project settled that time to hire is a primary metric. It had not settled
 * where the clock stops, so the old module reported both endpoints as peers and
 * left the choice to whichever screen rendered first. Two numbers sixteen times
 * apart with no ranking is not a definition, so the headline is named here, in
 * the module every screen reads, rather than in each screen.
 *
 * The long reading leads because it is the one a store manager can check. A
 * hire is not a hire until somebody is on the floor, and the twenty five days
 * between an accepted offer and a first shift is the part of the funnel this
 * product claims to be about. Leading with the short reading would claim the
 * two days every incumbent already sells and stay quiet about the rest.
 */
export const TIME_TO_HIRE = {
  headline: 'appliedToStarted',
  headlineLabel: 'Application to first shift worked',
  component: 'appliedToOfferAccepted',
  componentLabel: 'Application to offer accepted',
  remainder: 'acceptToStart',
  remainderLabel: 'Offer accepted to first shift worked',
  definition: 'From the APPLICATION_RECEIVED event to the STARTED event. It ends when ' +
              'somebody turned up, not when a shift was scheduled for them.',
  note: 'The component reading ends at an accepted offer and is a part of the headline, ' +
        'not an alternative to it. Both are reported with their own sample size.'
};

/**
 * The store rows come back worst first, and the page has to say so.
 *
 * A review found the store table sorted by queue share descending with nothing
 * on the row saying which direction is good, so the worst served store read as
 * the leader. The order is kept, because the first row is where the time is
 * going, and this sentence exists to be printed above the table.
 */
export const STORE_ROLLUP_ORDER =
  'Ordered by the share of time spent waiting, highest first. The top row is where the most ' +
  'time is being lost, not the best run store.';

/**
 * The actor name the seed writes for the person being hired.
 *
 * Six events carry actorType 'human' with this name, which is what made the
 * applicant count as staff. The name test catches those six and also the fifty
 * three the seed types correctly as 'external', so the count does not depend on
 * the type being right.
 */
const APPLICANT_MARKER = 'Candidate';

/* ---------------------------------------------------------------- reading --- */

/**
 * One application's events, oldest first.
 *
 * Sorted by id after time, because a replay through the engine writes several
 * events on the same millisecond and an unstable order made the first event of
 * a step change between two reads of the same data.
 */
export function eventsFor(store, ctx, applicationId) {
  return store.where('workflowEvents', ctx.tenantId, (e) => e.applicationId === applicationId)
    .sort((a, b) => a.at - b.at || String(a.id).localeCompare(String(b.id)));
}

/**
 * Every number that is a set of observations rather than one reading.
 *
 * The whole return shape exists so an interface cannot render a median without
 * knowing how many observations are behind it. `values` travels too, so a
 * caller that wants to show the spread does not have to ask for the data twice
 * and cannot recompute it differently.
 *
 * `smallSample` was added after a review found five store rows each printing a
 * median of one person as though it were a distribution. Nothing is dropped for
 * being small. The flag travels with the median so the row can say so.
 */
export function summarise(values) {
  const v = (values || []).filter((x) => x != null && !Number.isNaN(x)).slice().sort((a, b) => a - b);
  if (!v.length) return { median: null, mean: null, min: null, max: null, n: 0, smallSample: false, values: [] };
  const i = Math.floor(v.length / 2);
  return {
    median: v.length % 2 ? v[i] : (v[i - 1] + v[i]) / 2,
    mean: v.reduce((a, b) => a + b, 0) / v.length,
    min: v[0],
    max: v[v.length - 1],
    n: v.length,
    smallSample: v.length < MIN_REPORTABLE_N,
    values: v
  };
}

/* ------------------------------------------------------------ milestones --- */

/**
 * The instant an application first entered a state, from the events.
 *
 * `enter` events are what a transition writes. A `work` or `note` event can
 * carry the same state name without the application having moved, so kind is
 * checked. Without that check a work event logged against
 * SCREENING_IN_PROGRESS could date the start of screening earlier than the
 * move that began it.
 */
function firstEntry(evs, states) {
  const want = Array.isArray(states) ? states : [states];
  const e = evs.find((x) => x.kind === 'enter' && want.indexOf(x.state) >= 0);
  return e ? e.at : null;
}

/**
 * The milestones, each one an event and nothing else.
 *
 * `appliedAt` falls back to the first event of any kind, because an application
 * created without an APPLICATION_RECEIVED enter event would otherwise have no
 * start and therefore no elapsed time at all. The fallback is a safety net, not
 * a licence: whatever creates an application has to write that event, and both
 * the seed and the careers form do.
 */
export function milestones(store, ctx, applicationId) {
  const evs = eventsFor(store, ctx, applicationId);
  return milestonesFrom(evs);
}

function milestonesFrom(evs) {
  const applied = firstEntry(evs, 'APPLICATION_RECEIVED');
  const stateEvents = evs.filter((e) => e.kind === 'enter' && e.state);
  const last = stateEvents.length ? stateEvents[stateEvents.length - 1] : null;
  const closed = last && isTerminal(last.state) ? last : null;
  return {
    appliedAt: applied != null ? applied : (evs.length ? evs[0].at : null),
    eligibilityAt: firstEntry(evs, ['ELIGIBLE', 'INELIGIBLE']),
    screenStartedAt: firstEntry(evs, 'SCREENING_IN_PROGRESS'),
    screenCompleteAt: firstEntry(evs, 'SCREENING_COMPLETE'),
    /* The decision is the APPROVED or REJECTED event, not the decision row. The
       row carries the same instant and reading it there meant the figure
       survived the events being deleted. */
    decisionAt: firstEntry(evs, ['APPROVED', 'REJECTED']),
    offerSentAt: firstEntry(evs, 'OFFER_SENT'),
    offerAcceptedAt: firstEntry(evs, 'OFFER_ACCEPTED'),
    checkOrderedAt: firstEntry(evs, 'BACKGROUND_CHECK_IN_PROGRESS'),
    checkReturnedAt: firstEntry(evs, 'BACKGROUND_CHECK_COMPLETE'),
    readyAt: firstEntry(evs, 'READY_FOR_SHIFT'),
    firstShiftScheduledAt: firstEntry(evs, 'FIRST_SHIFT_SCHEDULED'),
    startedAt: firstEntry(evs, 'STARTED'),
    closedAt: closed ? closed.at : null,
    closedState: closed ? closed.state : null
  };
}

/* ----------------------------------------------------------------- spans --- */

/**
 * The five named spans, signed, plus the two readings of time to hire.
 *
 * A NEGATIVE SPAN IS RETURNED WITH ITS SIGN. That is the opposite of the queue
 * clamp lower down and the difference is deliberate. Queue share is a derived
 * proportion that means nothing below zero, so it is clamped. A negative span
 * is a data defect that has to stay visible.
 *
 * This is not hypothetical. In the old build the decision was timed at a fixed
 * offset from the screening conversation, so for a role needing a manager
 * interview six candidates got an APPROVED event twelve to sixteen hours before
 * the SCREENING_COMPLETE they were approved on. At tenant level the median
 * absorbed it. At store level it dominated, and two of five stores reported a
 * negative duration on a page whose whole argument is duration. Clamping would
 * have hidden the bug instead of showing it.
 *
 * `acceptToStart` ends at the STARTED event, which is somebody turning up. The
 * old module ended it at the first shift's scheduled start, so a candidate who
 * never appeared still produced a duration.
 *
 * THE KEYS OF THIS OBJECT ARE FIXED. The seed asserts that no span on any
 * application is negative by walking every key it finds here, so a key added
 * here that can legitimately go negative would fail the seed's own check.
 */
export function spans(store, ctx, applicationId) {
  return spansFrom(milestonesFrom(eventsFor(store, ctx, applicationId)));
}

function spansFrom(m) {
  const gap = (a, b) => (m[a] != null && m[b] != null ? m[b] - m[a] : null);
  return {
    appliedToScreen: gap('appliedAt', 'screenStartedAt'),
    screeningToDecision: gap('screenCompleteAt', 'decisionAt'),
    decisionToOffer: gap('decisionAt', 'offerSentAt'),
    offerToAccept: gap('offerSentAt', 'offerAcceptedAt'),
    acceptToStart: gap('offerAcceptedAt', 'startedAt'),

    /* Both readings of time to hire, with the endpoint in the name. Which one
       leads is settled in `TIME_TO_HIRE` at the top of this file rather than
       left to the screen. */
    appliedToOfferAccepted: gap('appliedAt', 'offerAcceptedAt'),
    appliedToStarted: gap('appliedAt', 'startedAt')
  };
}

/**
 * The path from an application to a first shift, milestone by milestone, for
 * the cover projection.
 *
 * It is written as consecutive pairs rather than reusing the five named spans
 * because those five leave a gap: nothing spans the screening conversation
 * itself, from screening started to screening complete. Projecting across the
 * gap would quietly drop that time, which is small on this data and would not
 * be on a role that needs a manager interview.
 */
const COVER_PATH = [
  { from: 'appliedAt', to: 'screenStartedAt', label: 'application to screening started' },
  { from: 'screenStartedAt', to: 'screenCompleteAt', label: 'the screening itself' },
  { from: 'screenCompleteAt', to: 'decisionAt', label: 'screening to decision' },
  { from: 'decisionAt', to: 'offerSentAt', label: 'decision to offer sent' },
  { from: 'offerSentAt', to: 'offerAcceptedAt', label: 'offer sent to accepted' },
  { from: 'offerAcceptedAt', to: 'startedAt', label: 'accepted to first shift worked' }
];

/* ---------------------------------------------------------- waiting time --- */

/**
 * Who was being waited on, for every minute nothing was happening.
 *
 * WHY THIS EXISTS. Queue share is the flagship number and a review found it
 * flattering us three ways at once, all three of which are still true of the
 * raw figure and are reported beside it rather than fixed by wishing:
 *
 *   1. IT RISES WHEN THE PRODUCT SERVES SOMEBODY WORSE. Queue is elapsed minus
 *      recorded work, so an application nobody has looked at for four days has
 *      a higher share than one that was carried all the way to a first shift.
 *      On the seeded data the three highest per-application shares are all
 *      candidates sitting unattended at a pending decision, and the lowest is
 *      the person furthest along. Pointing at the biggest number and asking
 *      what happened to that person is the obvious thing to do on stage, and
 *      the honest answer was that nobody looked at them.
 *   2. UNRECORDED WORK COUNTS AS QUEUE. Fewer than half the events carry a
 *      duration at all, so the share is an upper bound on idle time and not a
 *      measurement of it. `durationCoverage` says how much is measured.
 *   3. THE NINETY DAY RETENTION WINDOW WAS IN IT. Measured over the whole life
 *      of a record, half of all queue time on this data is the wait between
 *      day thirty and day ninety, which nobody can compress and which has
 *      nothing to do with hiring anybody. That is why the headline share is
 *      measured over the hiring span and the whole life figure is named
 *      `includingRetention`.
 *
 * AND IT CAN BE GAMED, in three directions, which is the same list read the
 * other way. Record fewer durations and the share goes up. Leave a candidate
 * alone and the share goes up. Keep an application open longer and the share
 * goes up. A number that improves when you do less is not a number to put a
 * target on, so it is reported as the shape of the funnel and never as a score.
 * The three primary metrics stay the three primary metrics.
 *
 * So the number is split by who was being waited on. Waiting on a person is the
 * queue this product removes. Waiting on the world is the queue it makes
 * visible. Saying we can fix the county court would be the more impressive
 * claim and it would be false.
 *
 * HOW IT IS DERIVED, and it is an exact partition rather than an estimate. Walk
 * the events in order. The span from one event to the next is time the
 * application sat in whatever state the last state-carrying event left it in,
 * so it is attributed by `actability` of that state. Work recorded on an event
 * is subtracted from the span that follows it, and any work that does not fit
 * carries forward. The buckets therefore sum to elapsed minus work, which is
 * the same queue figure reported everywhere else. Summing per-step queue
 * instead was the other option and it double counts, because steps 11 to 14 run
 * in parallel: on one application the step sum came to 130 days against a 91
 * day life.
 *
 * `workBeyondHorizonMs` is work recorded with no span left to hold it. It is
 * the same defect `overRecorded` flags and it is reported rather than absorbed.
 */
export function waitAttribution(store, ctx, applicationId) {
  const evs = eventsFor(store, ctx, applicationId);
  const m = milestonesFrom(evs);
  const horizon = m.closedAt != null ? m.closedAt : ctx.clock.now();
  return attributeWait(evs, horizon);
}

function attributeWait(evs, horizon, from) {
  const stop = horizon;
  const start = from != null ? from : null;
  const out = { productMs: 0, personMs: 0, externalMs: 0, unattributedMs: 0, workBeyondHorizonMs: 0 };
  let carried = 0;
  let held = null;
  for (let i = 0; i < evs.length; i++) {
    const e = evs[i];
    if (e.at > stop) break;
    /* An event with no state does not move the application, so the state during
       the span that follows it is still the last one an event named. Without
       this carry, every gap after a task event was unattributable and thirty one
       of the ninety one days on one application fell into that bucket. */
    if (e.state) held = e.state;
    const next = evs[i + 1] && evs[i + 1].at <= stop ? evs[i + 1] : null;
    const end = next ? next.at : stop;
    const gap = Math.max(0, end - e.at);
    let work = (e.durationMs || 0) + carried;
    carried = 0;
    if (work > gap) { carried = work - gap; work = gap; }
    let q = gap - work;
    /* A window narrower than the whole life, for the post-accept breakdown. The
       events before the window still set the held state, so the walk cannot
       start at the window or the first bucket would be unattributed. */
    if (start != null) {
      const qStart = Math.max(e.at + work, start);
      const qEnd = Math.min(end, stop);
      q = Math.max(0, Math.min(q, qEnd - qStart));
    }
    if (q <= 0) continue;
    const cls = held ? actability(held) : null;
    if (cls === 'person') out.personMs += q;
    else if (cls === 'external') out.externalMs += q;
    else if (cls === 'product') out.productMs += q;
    else out.unattributedMs += q;
  }
  out.workBeyondHorizonMs = carried;
  out.totalMs = out.productMs + out.personMs + out.externalMs + out.unattributedMs;
  return out;
}

/* -------------------------------------------------- people, and handoffs --- */

/**
 * Primary metric two. How many people this application took.
 *
 * PEOPLE AND HANDOFFS ARE TWO DIFFERENT CLAIMS and they are counted separately.
 * Five handoffs between two people is not five people. The old module did keep
 * them apart at application level, but the step rows conflated them: `actors`
 * there was every event's actor name with no filter on actor type, so
 * "Workflow engine" and "Screening agent" were counted as people involved. A
 * named piece of software is not a person, and the number this metric exists to
 * report is how many humans a hire pulls in.
 *
 * THE APPLICANT IS NOT ONE OF THEM, and this is the defect a review found.
 * Six events carry actorType 'human' with the actor 'Candidate', all of them
 * the person's own first shift. So every completed hire read as two people
 * involved and the second one was the person being hired. Ridgeway read "two
 * people involved" where the truth was one manager. The count now excludes the
 * applicant by name and `applicantTouches` reports how many were excluded, so
 * the exclusion is visible instead of being a silent filter. The events are
 * still mistyped and that is a fix in effects.js.
 *
 * A handoff is counted from the `handoff` flag the engine sets when ownership
 * changes hands between two states. It counts changes of owner, which includes
 * a change from software to a person, so it is not a count of human effort.
 * That is why `handoffsByHuman` is beside it: eight handoffs sounds like eight
 * people and on this data the human figure is under two per application.
 */
export function peopleInvolved(store, ctx, applicationId) {
  const app = store.byId('applications', ctx.tenantId, applicationId);
  return peopleFrom(eventsFor(store, ctx, applicationId), applicantNameFor(store, ctx, app));
}

function applicantNameFor(store, ctx, app) {
  if (!app || !app.candidateId) return null;
  const c = store.byId('candidates', ctx.tenantId, app.candidateId);
  return c ? c.name : null;
}

function isApplicant(actor, applicantName) {
  if (!actor) return false;
  if (actor === APPLICANT_MARKER) return true;
  return applicantName != null && actor === applicantName;
}

function peopleFrom(evs, applicantName) {
  const names = [];
  let applicantTouches = 0;
  evs.forEach((e) => {
    if (e.actorType !== 'human' || !e.actor) return;
    if (isApplicant(e.actor, applicantName)) { applicantTouches++; return; }
    if (names.indexOf(e.actor) < 0) names.push(e.actor);
  });
  /* An event by a person with no name recorded is a real touch by somebody we
     cannot count. It is surfaced rather than dropped, because a large number
     here means the count of people is understated. */
  const anonymous = evs.filter((e) => e.actorType === 'human' && !e.actor).length;
  const handoffs = evs.filter((e) => e.handoff);
  return {
    count: names.length,
    names,
    anonymousTouches: anonymous,
    /* Kept so a page can say the applicant was excluded rather than leaving a
       reader to wonder why the number fell. */
    applicantTouches,
    handoffs: handoffs.length,
    handoffsByHuman: handoffs.filter((e) => e.actorType === 'human' && !isApplicant(e.actor, applicantName)).length,
    handoffsByMachine: handoffs.filter((e) => e.actorType !== 'human').length
  };
}

/* ----------------------------------------------------------- manual work --- */

/**
 * Primary metric three. Manual work.
 *
 * WHAT THIS FIGURE CAN CLAIM: the work time recorded against events whose actor
 * was a member of staff, and the number of times one of them had to touch this
 * application.
 *
 * WHAT IT CANNOT CLAIM, and the caveat travels on the object so no screen can
 * show the number without it:
 *
 *   1. It is a floor, not a total. durationMs is only present where the code
 *      that wrote the event recorded one. A human event with no duration counts
 *      zero minutes, so the true figure is higher. `coverage` says how much of
 *      it is measured.
 *   2. It counts nothing that happened outside this product. The phone call the
 *      manager made, the spreadsheet, the walk to the back office. None of it
 *      is here and none of it is small.
 *   3. It is not a measure of burden. A two minute decision that arrives at
 *      seven in the evening costs more than two minutes.
 *   4. It is not a headcount. That is `peopleInvolved`.
 *   5. THE RECORDED DURATIONS ARE A HANDFUL OF CONSTANTS, and this is the
 *      defect a review found. Across the seeded data the human events take
 *      seven distinct duration values, and one of them, four hours on the badge
 *      task, is ninety per cent of the total on a started hire. So the number
 *      is a sum of chosen constants rather than measured effort.
 *      `distinctDurations`, `largestTouchMs` and `concentration` report that
 *      from the data instead of asserting it in prose, so a page can print "one
 *      event is ninety per cent of this figure" and be right whatever the seed
 *      later becomes.
 *
 * The applicant's own touches are excluded for the same reason as in
 * `peopleFrom`. The time the person being hired spends is not the retailer's
 * manual work, and counting it would flatter a number the product promises to
 * reduce.
 *
 * Reducing this number is a goal of the product, which is exactly why the
 * caveats are stated rather than smoothed over. A metric the product is judged
 * on has to be the one figure nobody is allowed to flatter.
 */
export function manualWork(store, ctx, applicationId) {
  const app = store.byId('applications', ctx.tenantId, applicationId);
  return manualFrom(eventsFor(store, ctx, applicationId), applicantNameFor(store, ctx, app));
}

function manualFrom(evs, applicantName) {
  const all = evs.filter((e) => e.actorType === 'human');
  const staff = all.filter((e) => !isApplicant(e.actor, applicantName));
  const timed = staff.filter((e) => e.durationMs != null);
  const recordedMs = timed.reduce((n, e) => n + e.durationMs, 0);
  const byValue = {};
  timed.forEach((e) => { byValue[e.durationMs] = (byValue[e.durationMs] || 0) + 1; });
  const largest = timed.reduce((n, e) => Math.max(n, e.durationMs), 0);
  return {
    recordedMs,
    touches: staff.length,
    timedTouches: timed.length,
    untimedTouches: staff.length - timed.length,
    coverage: staff.length ? timed.length / staff.length : null,
    applicantTouches: all.length - staff.length,
    /* The three fields that stop this being read as measured effort. */
    largestTouchMs: timed.length ? largest : null,
    concentration: recordedMs > 0 ? largest / recordedMs : null,
    distinctDurations: Object.keys(byValue).length,
    isFloor: true,
    caveat: 'Recorded work time on events a member of staff made, inside this product only. ' +
            'An event with no duration recorded counts as zero, so this is a floor and not a total. ' +
            'It excludes every minute spent outside the product, it excludes the applicant\'s own ' +
            'time, and it is not a headcount. The recorded durations are a small set of chosen ' +
            'constants rather than measured effort: see distinctDurations and concentration.'
  };
}

/* ------------------------------------------------------- blocked, if known --- */

/**
 * Time an application spent explicitly blocked.
 *
 * Paired from `blocked` and `unblock` events. The old module summed this from
 * the exception rows instead, which is why it survived an application's events
 * being deleted while every figure around it changed. That is the one bug this
 * whole file is arranged to prevent, so the figure is derived from events or it
 * is not reported at all.
 *
 * Nothing in the current build writes a `blocked` event, so on this data it
 * returns measurable: false rather than a zero that reads like an answer.
 */
function blockedFrom(evs, horizon) {
  let openAt = null, total = 0, pairs = 0;
  evs.forEach((e) => {
    if (e.kind === 'blocked' && openAt == null) openAt = e.at;
    else if (e.kind === 'unblock' && openAt != null) { total += e.at - openAt; pairs++; openAt = null; }
  });
  const stillBlocked = openAt != null;
  if (stillBlocked && horizon != null) total += horizon - openAt;
  return {
    measurable: pairs > 0 || stillBlocked,
    ms: pairs > 0 || stillBlocked ? total : null,
    episodes: pairs + (stillBlocked ? 1 : 0),
    stillBlocked
  };
}

/* ------------------------------------------------------------ step rows --- */

/**
 * A step is not finished while a task inside it is outstanding.
 *
 * THE DEFECT THIS FIXES, named because it was found unwired twice. The old
 * module read the onboarding task rows here. This module reads events, so the
 * knowledge came in through `opts.stepStillWorking` instead, and no caller ever
 * passed it. So a step whose events had moved on reported itself done while the
 * work inside it was outstanding, and its median was understated.
 *
 * Now the hook defaults to this, and a caller has to pass `stepStillWorking:
 * null` on purpose to turn it off. Measured effect on the seeded data: step 11,
 * the I-9 and payroll paperwork, drops from nine finished observations to six
 * and its median rises from 25.09 to 25.29 days, because Section 2 is
 * outstanding on three applications that read as finished. Step 14, the badge,
 * does not move, because every application whose badge is outstanding has not
 * reached the end of step 14 by any measure. The original report expected the
 * opposite and it was right about the hole and wrong about which step falls in
 * it.
 *
 * Reading a task's status is reading state, not a stored duration, so this does
 * not breach the property at the top of the file. Delete an application's
 * events and its steps have no entry instant, so every figure about them is
 * still null.
 */
function defaultStillWorking(store, ctx) {
  const cache = new Map();
  return function stillWorking(applicationId, n) {
    let open = cache.get(applicationId);
    if (!open) {
      open = new Set();
      store.where('onboardingTasks', ctx.tenantId, (t) => t.applicationId === applicationId)
        .forEach((t) => { if (t.status !== 'complete' && t.step != null) open.add(t.step); });
      cache.set(applicationId, open);
    }
    return open.has(n);
  };
}

/**
 * The twenty steps for one application, with the time in each.
 *
 * Derived from events alone. Where a step ends is the hard part and the rules
 * below are carried across from the old module, which learned each of them from
 * a defect:
 *
 *   · Steps 11 to 14 run in parallel, so a later numbered step routinely
 *     finishes first. Reading "the next step's start" as this step's end
 *     produced negative durations that then clamped to zero, silently deleting
 *     real time. A step with a history of its own ends at its own last event.
 *   · A step with a single event was only entered and left, so it ends when the
 *     next step begins.
 *
 * TWO CORRECTIONS ON THE OLD RULES, both from the same parallel-step problem:
 *
 *   · The old module took the first later-numbered event in the whole sorted
 *     list without checking it came after this step entered. For steps 11 to 14
 *     that could be an event from before the step started, giving a negative
 *     span that the outer clamp then swallowed. Only later events at or after
 *     the entry count.
 *   · A step on a closed application used to run to now, so a rejected
 *     candidate's step 6 grew forever. A step cannot still be running after the
 *     application ended, so the horizon is the closing event.
 *
 * AND THE THIRD, which a review found and which the two above cannot fix.
 * BORROWING A LATER STEP'S START IS NOT A MEASUREMENT. Step 12 is E-Verify and
 * its only event is the entry. The nearest later-numbered event after it is the
 * day thirty check-in, because step numbering stops following the clock once
 * somebody starts work: E-Verify legitimately happens after step 17. So step 12
 * reported a 29.04 day median for a check that clears in seconds for most
 * people, on four observations, and it carried a fifth of the bottleneck
 * ranking. Reading that page, a buyer concludes they have a systemic violation.
 *
 * There is no arithmetic that repairs this, because the end was never recorded.
 * So every row now says where its end came from in `completionSource`, and
 * `inferredFromStep` names the step it was borrowed from. `stepMedians` reports
 * observed ends separately and `bottleneck` ranks on them only. The real fix is
 * a completion event on steps 12, 13, 16, 17 and 18, which belongs in
 * effects.js.
 */
export function stepDurations(store, ctx, applicationId, opts) {
  const app = store.byId('applications', ctx.tenantId, applicationId);
  if (!app) return null;
  const o = opts || {};
  const evs = eventsFor(store, ctx, applicationId);
  const m = milestonesFrom(evs);
  const now = ctx.clock.now();
  const horizon = m.closedAt != null ? m.closedAt : now;
  const applicant = applicantNameFor(store, ctx, app);

  const hook = o.stepStillWorking === undefined ? defaultStillWorking(store, ctx)
    : (typeof o.stepStillWorking === 'function' ? o.stepStillWorking : null);

  /* State says which step the application is sitting in. Events say when. */
  const mappedStep = stepOf(app.state);
  const appTerminal = isTerminal(app.state);

  return STEPS.map((def) => {
    const own = evs.filter((e) => e.step === def.n);
    const entered = own.length ? own[0].at : null;
    const lastOwn = own.length ? own[own.length - 1].at : null;
    const later = entered == null ? null
      : evs.find((e) => e.step != null && e.step > def.n && e.at >= entered);

    const stillWorking = hook ? !!hook(applicationId, def.n) : false;
    const isCurrentStep = mappedStep === def.n && !appTerminal;

    let completedAt = null;
    let completionSource = null;
    let inferredFromStep = null;
    if (stillWorking) {
      completedAt = null;
    } else if (own.length > 1) {
      if (later || !isCurrentStep) { completedAt = lastOwn; completionSource = 'observed'; }
    } else if (own.length === 1) {
      if (later) {
        completedAt = later.at;
        completionSource = 'inferred_from_later_step';
        inferredFromStep = later.step;
      } else if (appTerminal) {
        completedAt = m.closedAt;
        completionSource = 'inferred_from_close';
      }
    }

    const workMs = own.reduce((n, e) => n + (e.durationMs || 0), 0);
    const endFor = completedAt != null ? completedAt : (entered != null ? horizon : null);
    /* A step took at least as long as the work recorded inside it. This clamp
       is what stopped the parallel steps reporting less time than they were
       observed doing. */
    const elapsedMs = entered != null ? Math.max(endFor - entered, workMs) : null;
    /* THE CLAMP. Queue is a SUBTRACTION of summed work from an elapsed span, and
       this Math.max is the only thing keeping it above zero. Removing it
       reintroduces negative durations, which shipped once already. */
    const queueMs = elapsedMs != null ? Math.max(0, elapsedMs - workMs) : null;

    let status;
    if (entered == null) status = appTerminal ? 'never_reached' : 'pending';
    else if (completedAt != null) status = 'done';
    else status = 'current';

    return {
      n: def.n,
      stage: def.stage,
      name: def.name,
      owner: def.owner,
      actability: stepActability(def.owner),
      status,
      enteredAt: entered,
      completedAt,
      /* 'observed' means the step recorded its own last event. Anything else
         means the end was borrowed and the duration is not a measurement. */
      completionSource,
      inferredFromStep,
      stillWorking,
      elapsedMs,
      workMs,
      queueMs,
      queueShare: elapsedMs > 0 ? queueMs / elapsedMs : null,
      people: peopleFrom(own, applicant),
      events: own.length
    };
  });
}

/**
 * The three way split on who has to move a step, in the same three words the
 * state level `actability` uses, so the product has one vocabulary for it.
 * A clock step is external because nobody can compress it. A human step is a
 * person. Everything else is ours.
 */
function stepActability(owner) {
  if (owner === 'clock') return 'external';
  if (owner === 'human') return 'person';
  return 'product';
}

/* ---------------------------------------------------- one application --- */

/**
 * Everything measured about one candidate's journey.
 *
 * elapsedMs is the span from applied to closed, or to now while it is open.
 * workMs is the sum of durationMs across the events. queueMs is elapsed minus
 * work with the clamp. Nothing here is stored and nothing is estimated.
 *
 * TWO THINGS A REVIEW FOUND HERE.
 *
 * A SHARE IS NULL WHEN IT CANNOT BE COMPUTED, not zero. An application created
 * seconds ago has a wall clock span of milliseconds and a form fill time
 * recorded as work, so recorded work exceeds the measured span. The old code
 * clamped queue to zero and divided, which reported a hard 0.00 per cent queue
 * share for the candidate who had just walked on stage, and that zero then
 * entered the tenant distribution as an observation. The same shape hits anybody
 * refused instantly on a hard rule: Shantel Ruiz is ineligible in the same
 * millisecond she applied. Both now report null with `overRecorded` true, and
 * `summarise` drops nulls, so the distribution says n = 35 of 36 rather than
 * quietly averaging in a zero.
 *
 * THE HIRING SPAN IS SEPARATE FROM THE WHOLE LIFE OF THE RECORD. `hiring` stops
 * at the first shift worked. Measured over the whole life, half of all queue
 * time on this data is the wait between day thirty and day ninety, which is a
 * fixed calendar wait and not a hiring delay. The tenant share falls from 95.55
 * to 91.28 per cent once it comes out, so this correction makes the headline
 * worse, which is the point.
 */
export function applicationMetrics(store, ctx, applicationId, opts) {
  const app = store.byId('applications', ctx.tenantId, applicationId);
  if (!app) return null;
  const evs = eventsFor(store, ctx, applicationId);
  const m = milestonesFrom(evs);
  const now = ctx.clock.now();
  const applicant = applicantNameFor(store, ctx, app);

  const workMs = evs.reduce((n, e) => n + (e.durationMs || 0), 0);
  const end = m.closedAt != null ? m.closedAt : now;
  const elapsedMs = m.appliedAt != null ? end - m.appliedAt : null;
  /* Same clamp, same reason as the step rows. See the comment there. */
  const queueMs = elapsedMs != null ? Math.max(0, elapsedMs - workMs) : null;
  const overRecorded = elapsedMs != null && workMs > elapsedMs;

  /* The hiring span. It stops when somebody turned up, or when the application
     closed, or at now while it is still moving. */
  const hiringStop = m.startedAt != null ? m.startedAt : end;
  const hiringWork = evs.filter((e) => e.at <= hiringStop).reduce((n, e) => n + (e.durationMs || 0), 0);
  const hiringElapsed = m.appliedAt != null ? hiringStop - m.appliedAt : null;
  const hiringOver = hiringElapsed != null && hiringWork > hiringElapsed;

  return {
    applicationId: app.id,
    candidateId: app.candidateId,
    storeId: app.storeId,
    requisitionId: app.requisitionId,
    state: app.state,
    step: stepOf(app.state),
    open: !isTerminal(app.state),
    lost: isLost(app.state),
    /* Settled means the record is finished, so a figure about it is a result
       rather than a snapshot of something still moving. */
    settled: isTerminal(app.state),
    /* With no events there is no measurement, and that reads as null rather
       than as zero. This is the field a caller checks before trusting the rest,
       and it is also the field that changes when events are deleted. */
    measured: evs.length > 0,
    events: evs.length,
    milestones: m,
    spans: spansFrom(m),
    elapsedMs,
    ageMs: m.appliedAt != null ? now - m.appliedAt : null,
    workMs,
    queueMs,
    /* Null, not zero, when work exceeds the span it sits in. See the block
       comment above: a hard zero on a seconds-old application is how the
       candidate created on stage vanished into the distribution. */
    queueShare: elapsedMs > 0 && !overRecorded ? queueMs / elapsedMs : null,
    /* Recorded work exceeding the elapsed span is a defect in whatever wrote
       the durations, not a hundred per cent utilisation. The clamp keeps queue
       sane, this flag keeps the cause visible, and the overflow gives it a
       size. */
    overRecorded,
    workBeyondElapsedMs: overRecorded ? workMs - elapsedMs : 0,
    hiring: {
      stopAt: hiringStop,
      stopReason: m.startedAt != null ? 'first shift worked'
        : (m.closedAt != null ? 'application closed' : 'still moving'),
      elapsedMs: hiringElapsed,
      workMs: hiringWork,
      queueMs: hiringElapsed != null ? Math.max(0, hiringElapsed - hiringWork) : null,
      queueShare: hiringElapsed > 0 && !hiringOver
        ? Math.max(0, hiringElapsed - hiringWork) / hiringElapsed : null,
      overRecorded: hiringOver
    },
    waiting: attributeWait(evs, end),
    people: peopleFrom(evs, applicant),
    manual: manualFrom(evs, applicant),
    blocked: blockedFrom(evs, end),
    steps: stepDurations(store, ctx, applicationId, opts)
  };
}

/* --------------------------------------------------------------- rollups --- */

/**
 * Which applications a report covers. The same object also carries the
 * `stepStillWorking` hook down to the step rows, so a caller that wants a
 * different rule passes it once and every figure below respects it.
 */
function population(store, ctx, filter) {
  const f = filter || {};
  let apps = store.all('applications', ctx.tenantId);
  if (f.storeId) apps = apps.filter((a) => a.storeId === f.storeId);
  if (f.requisitionId) apps = apps.filter((a) => a.requisitionId === f.requisitionId);
  return apps;
}

const SPAN_KEYS = ['appliedToScreen', 'screeningToDecision', 'decisionToOffer',
                   'offerToAccept', 'acceptToStart',
                   'appliedToOfferAccepted', 'appliedToStarted'];

/**
 * Everything the reports screen shows, for one store, one requisition, or the
 * whole tenant.
 *
 * Every duration is a `summarise` object, so n and `smallSample` travel with
 * the median everywhere. There is no bare median in the return value.
 *
 * THE APPLICATION THAT JUST ARRIVED IS VISIBLE HERE. A review created one
 * through the careers form and watched it change nothing: the population went
 * from thirty six to thirty seven, every headline stayed exactly where it was,
 * and nothing on the payload said a new person was in the building. That is
 * correct arithmetic and a bad demo. So `timeToHire.headline` carries the count
 * of applications in flight behind it, and `mostRecent` names the newest one,
 * where it is, and why it is not in the median yet.
 */
export function rollup(store, ctx, filter) {
  const f = filter || {};
  const apps = population(store, ctx, f);
  const metrics = apps.map((a) => applicationMetrics(store, ctx, a.id, f));
  const measured = metrics.filter((x) => x.measured);
  const settled = measured.filter((x) => x.settled);
  const inFlight = measured.filter((x) => !x.settled);
  const started = measured.filter((x) => x.milestones.startedAt != null);

  const spanSummary = {};
  SPAN_KEYS.forEach((k) => { spanSummary[k] = summarise(measured.map((x) => x.spans[k])); });

  const totalWorkMs = measured.reduce((n, x) => n + x.workMs, 0);
  const totalQueueMs = measured.reduce((n, x) => n + (x.queueMs || 0), 0);
  const totalElapsedMs = measured.reduce((n, x) => n + (x.elapsedMs || 0), 0);

  const hiringWorkMs = measured.reduce((n, x) => n + x.hiring.workMs, 0);
  const hiringQueueMs = measured.reduce((n, x) => n + (x.hiring.queueMs || 0), 0);

  const wait = { productMs: 0, personMs: 0, externalMs: 0, unattributedMs: 0, workBeyondHorizonMs: 0 };
  measured.forEach((x) => {
    wait.productMs += x.waiting.productMs;
    wait.personMs += x.waiting.personMs;
    wait.externalMs += x.waiting.externalMs;
    wait.unattributedMs += x.waiting.unattributedMs;
    wait.workBeyondHorizonMs += x.waiting.workBeyondHorizonMs;
  });
  const waitTotal = wait.productMs + wait.personMs + wait.externalMs + wait.unattributedMs;

  const ids = new Set(apps.map((a) => a.id));
  const evs = store.all('workflowEvents', ctx.tenantId).filter((e) => ids.has(e.applicationId));
  const timedEvents = evs.filter((e) => e.durationMs != null).length;

  const st = f.storeId ? store.byId('stores', ctx.tenantId, f.storeId) : null;
  const newest = measured.slice().sort((a, b) =>
    (b.milestones.appliedAt || 0) - (a.milestones.appliedAt || 0))[0] || null;

  const headline = spanSummary[TIME_TO_HIRE.headline];
  const staffNames = uniq(flatten(measured.map((x) => x.people.names)));

  /* The wait inside the offer-accepted to first-shift segment, split by who was
     being waited on. Only the applications that finished the segment are in it,
     so the split and the segment median rest on the same observations. */
  const postAccept = { productMs: 0, personMs: 0, externalMs: 0, unattributedMs: 0, n: 0 };
  started.forEach((x) => {
    if (x.milestones.offerAcceptedAt == null || x.milestones.startedAt == null) return;
    const w = attributeWait(eventsFor(store, ctx, x.applicationId),
                            x.milestones.startedAt, x.milestones.offerAcceptedAt);
    postAccept.productMs += w.productMs;
    postAccept.personMs += w.personMs;
    postAccept.externalMs += w.externalMs;
    postAccept.unattributedMs += w.unattributedMs;
    postAccept.n++;
  });
  const postAcceptTotal = postAccept.productMs + postAccept.personMs +
                          postAccept.externalMs + postAccept.unattributedMs;
  postAccept.totalMs = postAcceptTotal;
  postAccept.productShare = postAcceptTotal > 0 ? postAccept.productMs / postAcceptTotal : null;
  postAccept.personShare = postAcceptTotal > 0 ? postAccept.personMs / postAcceptTotal : null;
  postAccept.externalShare = postAcceptTotal > 0 ? postAccept.externalMs / postAcceptTotal : null;

  return {
    scope: f.storeId ? 'store' : (f.requisitionId ? 'requisition' : 'tenant'),
    storeId: f.storeId || null,
    storeName: st ? st.name : null,
    requisitionId: f.requisitionId || null,

    applications: apps.length,
    /* Only applications with events contribute a duration. Reporting both
       counts means a median over four of forty cannot look like a median over
       forty. */
    measuredApplications: measured.length,
    open: metrics.filter((x) => x.open).length,
    settled: settled.length,
    started: started.length,
    lost: metrics.filter((x) => x.lost).length,
    lostBreakdown: countBy(apps.filter((a) => isLost(a.state)).map((a) => a.state)),

    /* Primary metric one. Which endpoint leads is settled in TIME_TO_HIRE at
       the top of this file, and both readings are here with their own n. The
       long one is the headline and the short one is a part of it. */
    timeToHire: {
      headline: {
        key: TIME_TO_HIRE.headline,
        label: TIME_TO_HIRE.headlineLabel,
        definition: TIME_TO_HIRE.definition,
        summary: headline,
        /* The two counts that stop a median of six looking like a median of
           thirty six, and that make a new arrival visible. */
        ofApplications: apps.length,
        inFlight: inFlight.length,
        note: headline.n + ' of ' + apps.length + ' application' + (apps.length === 1 ? '' : 's') +
              ' ' + (apps.length === 1 ? 'has' : 'have') + ' a first shift worked. ' +
              inFlight.length + ' ' + (inFlight.length === 1 ? 'is' : 'are') +
              ' still moving and cannot have a time to hire yet.'
      },
      component: {
        key: TIME_TO_HIRE.component,
        label: TIME_TO_HIRE.componentLabel,
        summary: spanSummary[TIME_TO_HIRE.component],
        note: TIME_TO_HIRE.note
      },
      remainder: {
        key: TIME_TO_HIRE.remainder,
        label: TIME_TO_HIRE.remainderLabel,
        summary: spanSummary[TIME_TO_HIRE.remainder],
        /* The one number that decides whether the headline is honest. On the
           six who started, this segment is 88.8 to 94.1 per cent of the whole
           span, so leading with the component would have claimed the two days
           and stayed quiet about the twenty five. */
        shareOfHeadline: headline.median > 0 && spanSummary[TIME_TO_HIRE.remainder].median != null
          ? spanSummary[TIME_TO_HIRE.remainder].median / headline.median : null,
        /* Broken down by who was being waited on, because the segment is
           somebody's week. Field HR asked what the twenty five days is made of
           and this is the answer the data can give: the wait inside it, split
           the same three ways as the tenant queue. */
        byWaitedOn: postAccept
      },
      /* Kept under their old names so nothing that already reads them breaks.
         They are the same two summaries as above. */
      toOfferAccepted: spanSummary.appliedToOfferAccepted,
      toStarted: spanSummary.appliedToStarted,
      ratio: spanSummary.appliedToOfferAccepted.median > 0 && spanSummary.appliedToStarted.median != null
        ? spanSummary.appliedToStarted.median / spanSummary.appliedToOfferAccepted.median : null
    },
    spans: spanSummary,

    queue: {
      totalWorkMs,
      totalQueueMs,
      totalElapsedMs,
      /* THE HEADLINE SHARE, measured over the hiring span. Everything after the
         first shift is out of it, because the day thirty to day ninety wait is
         half the queue time on this data and nobody can compress it. */
      headline: {
        share: (hiringWorkMs + hiringQueueMs) > 0 ? hiringQueueMs / (hiringWorkMs + hiringQueueMs) : null,
        basis: 'Recorded work against derived queue, from the application to the first shift worked.',
        totalQueueMs: hiringQueueMs,
        totalWorkMs: hiringWorkMs,
        n: measured.length
      },
      /* The same computation over the whole life of the record. It is higher,
         and the difference is the retention window. Named so a page cannot pick
         it up by accident and call it a hiring figure. */
      includingRetention: {
        share: (totalWorkMs + totalQueueMs) > 0 ? totalQueueMs / (totalWorkMs + totalQueueMs) : null,
        basis: 'The same computation over the whole life of the record, so it includes the ' +
               'ninety day retention window after somebody starts.',
        n: measured.length
      },
      /* Two denominators are defensible and they answer different questions, so
         both are named rather than one being picked and left ambiguous. Over
         work plus queue is the share of accounted-for time. Over elapsed is the
         share of wall clock, and the two differ only where work was
         over-recorded. Summed elapsed across applications double counts wall
         clock that ran in parallel, which is why the per-application share
         below is the honest per-hire figure. */
      queueShareOfAccounted: (totalWorkMs + totalQueueMs) > 0
        ? totalQueueMs / (totalWorkMs + totalQueueMs) : null,
      queueShareOfElapsed: totalElapsedMs > 0 ? totalQueueMs / totalElapsedMs : null,
      perApplication: summarise(measured.map((x) => x.queueShare)),
      /* Split, because a share over open applications is a current state and a
         share over closed ones is a result. Mixing them is how a four day
         neglect and a finished hire ended up in one median. */
      perSettledApplication: summarise(settled.map((x) => x.queueShare)),
      perApplicationInFlight: summarise(inFlight.map((x) => x.queueShare)),
      notComputable: measured.filter((x) => x.queueShare == null).length,
      /* Who was being waited on. An exact partition of the queue, so these sum
         to totalQueueMs. See the block above attributeWait. */
      byWaitedOn: {
        productMs: wait.productMs,
        personMs: wait.personMs,
        externalMs: wait.externalMs,
        unattributedMs: wait.unattributedMs,
        totalMs: waitTotal,
        productShare: waitTotal > 0 ? wait.productMs / waitTotal : null,
        personShare: waitTotal > 0 ? wait.personMs / waitTotal : null,
        externalShare: waitTotal > 0 ? wait.externalMs / waitTotal : null,
        /* THE IDENTITY THAT HOLDS, exactly, and it is written down because the
           first version of this comment got it wrong and made the sum look
           broken by twenty four minutes:

             buckets + (totalWorkMs - workBeyondHorizonMs) = totalElapsedMs

           Work recorded on an event needs a span after it to sit in. Work on
           the last event of a closed application has none, and work on an
           application decided in the same millisecond it arrived has none
           either, so it cannot be subtracted from any gap. That leftover is
           this field. It is the same defect `overRecorded` flags and it is
           reported rather than pushed into a bucket where it would read as
           waiting time. */
        workBeyondHorizonMs: wait.workBeyondHorizonMs,
        absorbedWorkMs: totalWorkMs - wait.workBeyondHorizonMs,
        note: 'Waiting on a named person is the queue this product removes. Waiting on the ' +
              'world is the queue it makes visible. Waiting on the product covers the steps ' +
              'the software owns, and on this data that bucket also holds the days a ' +
              'candidate\'s own paperwork sits unfinished, so it is an upper bound on what ' +
              'automation could take out rather than a promise.'
      },
      /* How much of the elapsed time is accounted for by anything at all. Queue
         is a subtraction, so every minute nobody recorded lands in it. */
      durationCoverage: {
        events: evs.length,
        timedEvents,
        share: evs.length ? timedEvents / evs.length : null
      },
      caveat: 'Queue is elapsed time minus recorded work, so unrecorded work counts as queue and ' +
              'this is an upper bound on idle time rather than a measurement of it. It also rises ' +
              'when an application is left alone, so a high share on an open application is a ' +
              'backlog and not an achievement. Three things push it up: recording fewer ' +
              'durations, leaving somebody alone, and keeping a record open. It is the shape of ' +
              'the funnel and not a score to be targeted.'
    },

    /* Primary metric two. People and handoffs, kept apart, and the applicant is
       not one of the people. */
    people: {
      perApplication: summarise(measured.map((x) => x.people.count)),
      /* The figure the strip should carry. A median over the whole population
         includes twelve applications that have not reached a human at all, so
         the tenant median was 1 with a mean below 1 and a minimum of 0. Nobody
         hires with zero people. */
      perCompletedHire: summarise(started.map((x) => x.people.count)),
      distinct: staffNames.length,
      names: staffNames,
      staffNames,
      /* Kept visible so a page can say the applicant was taken out. */
      applicantTouches: measured.reduce((n, x) => n + x.people.applicantTouches, 0),
      handoffsPerApplication: summarise(measured.map((x) => x.people.handoffs)),
      totalHandoffs: measured.reduce((n, x) => n + x.people.handoffs, 0),
      /* A handoff is a change of owner, so most of them are software passing to
         software. Reporting the total alone reads as people. */
      handoffsByHuman: measured.reduce((n, x) => n + x.people.handoffsByHuman, 0),
      handoffsByMachine: measured.reduce((n, x) => n + x.people.handoffsByMachine, 0),
      humanHandoffsPerApplication: summarise(measured.map((x) => x.people.handoffsByHuman)),
      anonymousTouches: measured.reduce((n, x) => n + x.people.anonymousTouches, 0)
    },

    /* Primary metric three, with the caveat carried through from the
       per-application object so a rollup cannot lose it. */
    manual: {
      totalRecordedMs: measured.reduce((n, x) => n + x.manual.recordedMs, 0),
      perApplication: summarise(measured.map((x) => x.manual.recordedMs)),
      perCompletedHire: summarise(started.map((x) => x.manual.recordedMs)),
      touchesPerApplication: summarise(measured.map((x) => x.manual.touches)),
      totalTouches: measured.reduce((n, x) => n + x.manual.touches, 0),
      untimedTouches: measured.reduce((n, x) => n + x.manual.untimedTouches, 0),
      applicantTouches: measured.reduce((n, x) => n + x.manual.applicantTouches, 0),
      /* The two figures that stop this reading as measured effort. On the
         seeded data the recorded human durations take seven distinct values and
         one four hour constant is ninety per cent of the total on a started
         hire. */
      distinctDurations: uniq(flatten(measured.map((x) =>
        evsWithDuration(store, ctx, x.applicationId)))).length,
      largestTouchMs: measured.reduce((n, x) => Math.max(n, x.manual.largestTouchMs || 0), 0) || null,
      concentration: summarise(measured.map((x) => x.manual.concentration)),
      /* The population that matters for this claim. Over every application the
         concentration median is meaningless, because most of them have one or
         two recorded touches. Over the hires that finished it says what it is
         meant to say: on this data a single four hour constant is 89.9 per cent
         of the 267 recorded minutes on a completed hire. */
      concentrationPerCompletedHire: summarise(started.map((x) => x.manual.concentration)),
      isFloor: true,
      caveat: manualFrom([], null).caveat
    },

    blocked: {
      measurable: measured.some((x) => x.blocked.measurable),
      totalMs: measured.reduce((n, x) => n + (x.blocked.ms || 0), 0),
      applications: measured.filter((x) => x.blocked.measurable).length
    },

    overRecorded: measured.filter((x) => x.overRecorded).length,

    /* The newest application, so the person created on stage is somewhere in
       the payload rather than only in the row count. */
    mostRecent: newest ? {
      applicationId: newest.applicationId,
      candidateId: newest.candidateId,
      state: newest.state,
      step: newest.step,
      appliedAt: newest.milestones.appliedAt,
      ageMs: newest.ageMs,
      inHeadline: newest.milestones.startedAt != null,
      why: newest.milestones.startedAt != null
        ? 'Counted in the headline time to hire.'
        : 'Not in the headline time to hire yet. It ends at a first shift worked and this one has not started.'
    } : null
  };
}

/** The distinct duration values recorded on one application's human events. */
function evsWithDuration(store, ctx, applicationId) {
  return eventsFor(store, ctx, applicationId)
    .filter((e) => e.actorType === 'human' && e.durationMs != null)
    .map((e) => e.durationMs);
}

/**
 * One row per store. Queue share is the figure the buyer report is built on, so
 * it is on every row with the sample size beside it and no store is dropped for
 * being small. A store with one application shows n equal to 1 and says
 * `smallSample`, and the caller decides what to say about it.
 *
 * THE ORDER IS WORST FIRST and the page has to print `STORE_ROLLUP_ORDER`
 * beside the table. A review found the table sorted by queue share descending
 * with nothing on the row saying which direction was good, so the store losing
 * the most time read as the leader. `rank` is on the row for the same reason.
 *
 * TWO SHARES, BOTH NAMED. `queueShare` is the whole-life figure the spec's
 * recorded percentages were computed from, so it stays under that name.
 * `queueShareOfHiring` excludes the ninety day retention window and is the one
 * to render. Any percentage written into a decision record is a snapshot: these
 * move every second the demo clock runs, because the denominator of an open
 * application grows in real time.
 */
export function storeRollups(store, ctx) {
  return store.all('stores', ctx.tenantId).map((st) => {
    const r = rollup(store, ctx, { storeId: st.id });
    return {
      storeId: st.id,
      storeName: st.name,
      manager: st.manager || null,
      applications: r.applications,
      measuredApplications: r.measuredApplications,
      queueShare: r.queue.queueShareOfAccounted,
      queueShareIncludesRetention: true,
      queueShareOfHiring: r.queue.headline.share,
      queueShareN: r.queue.perApplication.n,
      smallSample: r.queue.perApplication.n < MIN_REPORTABLE_N,
      totalQueueMs: r.queue.totalQueueMs,
      totalWorkMs: r.queue.totalWorkMs,
      byWaitedOn: r.queue.byWaitedOn,
      timeToHire: r.timeToHire,
      people: r.people.perApplication,
      peoplePerCompletedHire: r.people.perCompletedHire,
      handoffs: r.people.handoffsPerApplication,
      /* U-77 names the handoff TOTAL as one of the two figures that carry the
         store page, and the row only carried the per-application summary, so
         the page had to sum it itself or quote a stale number. */
      totalHandoffs: r.people.totalHandoffs,
      handoffsByHuman: r.people.handoffsByHuman,
      manualRecordedMs: r.manual.totalRecordedMs,
      lost: r.lost,
      started: r.started
    };
  /* Sorted on the figure the page renders, which is the hiring share. Sorting
     on the whole-life figure instead put the store with the highest hiring
     share third, so the rank and the printed number disagreed on the same
     row. */
  }).sort((a, b) => (b.queueShareOfHiring || 0) - (a.queueShareOfHiring || 0))
    .map((row, i) => Object.assign(row, { rank: i + 1, order: STORE_ROLLUP_ORDER }));
}

/**
 * Per-step medians across the tenant, for the funnel.
 *
 * `n` travels with every median. `entered` is beside it on purpose: a median
 * over two observations of a step thirty people reached is a different claim
 * from a median over thirty, and the pair says which one it is.
 *
 * Only steps with a finished duration contribute. A step still running would
 * pull the median towards however long ago the page was opened.
 *
 * OBSERVED ENDS ARE REPORTED SEPARATELY. `elapsed` counts every finished
 * observation, including the ones whose end was borrowed from a later step.
 * `elapsedObserved` counts only the steps that recorded their own end. Where the
 * two differ, the difference is inference and not measurement: step 12 has four
 * finished observations and zero observed ends, which is how E-Verify came to
 * report a 29.04 day median. `inferredEnds` says how many, so a page can size a
 * bar on the honest figure and print "end not recorded" on the rest.
 *
 * DROP OFF IS COUNTED, NOT ESTIMATED. `lostHere` is the number of applications
 * whose terminal lost state sits on this step, and `dropOff` is that over the
 * number that reached it. On this data that is one at step 2, two at step 6 and
 * one at step 8, from a population of thirty six. The step table also carries a
 * `drop` column with figures up to 47.2 per cent that are invented and carry no
 * disclaimer, and nothing may render those as measurements. This is the field
 * to use instead.
 */
export function stepMedians(store, ctx, filter) {
  const f = filter || {};
  const apps = population(store, ctx, f);
  const rows = new Map();
  STEPS.forEach((def) => {
    rows.set(def.n, {
      n: def.n, stage: def.stage, name: def.name, owner: def.owner,
      actability: stepActability(def.owner), lawClock: !!def.clock,
      entered: 0, inFlight: 0, stillWorking: 0,
      observedEnds: 0, inferredEnds: 0, lostHere: 0,
      elapsed: null, queue: null, work: null,
      _elapsed: [], _queue: [], _work: [], _elapsedObs: [], _queueObs: [], _shareObs: []
    });
  });

  let lostWithNoStep = 0;
  apps.forEach((a) => {
    const steps = stepDurations(store, ctx, a.id, f) || [];
    const mapped = stepOf(a.state);
    if (isLost(a.state)) {
      const row = mapped != null ? rows.get(mapped) : null;
      if (row) row.lostHere++; else lostWithNoStep++;
    }
    steps.forEach((s) => {
      const row = rows.get(s.n);
      if (!row) return;
      if (s.enteredAt != null) row.entered++;
      if (mapped === s.n && !isTerminal(a.state)) row.inFlight++;
      if (s.stillWorking) row.stillWorking++;
      if (s.status !== 'done') return;
      row._elapsed.push(s.elapsedMs);
      row._queue.push(s.queueMs);
      row._work.push(s.workMs);
      if (s.completionSource === 'observed') {
        row.observedEnds++;
        row._elapsedObs.push(s.elapsedMs);
        row._queueObs.push(s.queueMs);
        if (s.queueShare != null) row._shareObs.push(s.queueShare);
      } else {
        row.inferredEnds++;
      }
    });
  });

  return STEPS.map((def) => {
    const row = rows.get(def.n);
    const out = Object.assign({}, row, {
      elapsed: summarise(row._elapsed),
      queue: summarise(row._queue),
      work: summarise(row._work),
      elapsedObserved: summarise(row._elapsedObs),
      queueObserved: summarise(row._queueObs),
      /* The share of each observation that was queue, summarised over the
         observations rather than divided between two medians. This is the
         measured version of the product's central claim, and it is here because
         the claim itself is not in the data anywhere: the step table asserts
         that seventeen of nineteen classifiable steps are a wait or a handoff
         and carries no field saying which. This does say it, per step, with n.
         Seven of the eleven steps with an observed end are over ninety per
         cent queue on the seeded data. Counting every finished observation
         instead, including the ends borrowed from a later step, it is nine of
         fifteen. Both are measurements. Neither is seventeen of nineteen. */
      queueShareObserved: summarise(row._shareObs),
      dropOff: row.entered > 0 ? row.lostHere / row.entered : null,
      dropOffN: row.entered,
      endNotRecorded: row.inferredEnds > 0 && row.observedEnds === 0,
      lostWithNoStep
    });
    delete out._elapsed; delete out._queue; delete out._work;
    delete out._elapsedObs; delete out._queueObs; delete out._shareObs;
    return out;
  });
}

/**
 * Which step is losing the most time. Computed, not asserted.
 *
 * Ranked by total queue time rather than by median, because the question the
 * buyer is asking is where the hours are going in aggregate, and a step that
 * fifty people wait two days in matters more than one step that took a week
 * once. The median and n are on every row so a rank that rests on a single
 * observation is visible as one.
 *
 * IT RANKS ON OBSERVED ENDS ONLY, and this is the fix for a real defect. When
 * it ranked on every finished observation, step 12 came third with a fifth of
 * all queue time on a figure that was entirely inferred: its four observations
 * all borrowed their end from the day thirty check-in, so E-Verify appeared to
 * take 29.04 days. A pure artifact carrying a fifth of the central argument is
 * worse than a gap, so the steps whose ends were never recorded are listed in
 * `endNotRecorded` and left out of the ranking.
 *
 * The sentence differs by actability because the two cases are not the same
 * claim. An external wait is visible rather than fixable. A queue in front of a
 * person is the kind this product removes. Saying "we can fix the county court"
 * would be the more impressive answer and it would be false.
 */
export function bottleneck(store, ctx, filter) {
  const steps = stepMedians(store, ctx, filter);
  const sum = (xs) => xs.reduce((x, y) => x + y, 0);
  const totalQueueMs = sum(steps.map((s) => sum(s.queueObserved.values)));

  const ranked = steps
    .map((s) => ({
      n: s.n, name: s.name, stage: s.stage, owner: s.owner, actability: s.actability,
      /* Steps after the first shift are retention, not hiring. Step 19 ranks
         third on this data with sixty days of queue over two observations, and
         all sixty of them are the wait between the day thirty and day ninety
         check-ins. It is on the row rather than filtered out, because a
         retention wait is a real thing this product tracks, but a page ranking
         hiring delays has to be able to take it out. */
      postStart: s.n >= FIRST_POST_START_STEP,
      totalQueueMs: sum(s.queueObserved.values),
      queue: s.queueObserved,
      elapsed: s.elapsedObserved,
      entered: s.entered,
      observedEnds: s.observedEnds,
      inferredEnds: s.inferredEnds,
      shareOfQueue: null
    }))
    .filter((s) => s.queue.n > 0)
    .sort((a, b) => b.totalQueueMs - a.totalQueueMs)
    .slice(0, BOTTLENECK_ROWS);

  ranked.forEach((s) => { s.shareOfQueue = totalQueueMs > 0 ? s.totalQueueMs / totalQueueMs : null; });

  const excluded = steps.filter((s) => s.endNotRecorded).map((s) => ({
    n: s.n, name: s.name, finishedObservations: s.elapsed.n,
    inferredMedianMs: s.elapsed.median,
    inferredFrom: 'a later step, because this step never records its own end',
    why: 'Left out of the ranking. Its duration is the gap to whatever ran next, not a measurement.'
  }));

  const top = ranked[0] || null;
  return {
    totalQueueMs,
    basis: 'Queue time on steps that recorded their own end. Steps whose end was inferred from a ' +
           'later step are listed in endNotRecorded and are not ranked.',
    worst: top,
    steps: ranked,
    endNotRecorded: excluded,
    summary: top
      ? 'Most time is lost at step ' + top.n + ', ' + top.name + '. ' +
        (top.actability === 'external'
          ? 'That is an external wait, so it is visible rather than fixable.'
          : top.actability === 'person'
            ? 'That one is a queue in front of a person, which is the kind we can remove.'
            : 'The product owns that step.') +
        ' Measured over ' + top.queue.n + ' observation' + (top.queue.n === 1 ? '' : 's') +
        ' that recorded ' + (top.queue.n === 1 ? 'its' : 'their') + ' own end.'
      : 'Not enough recorded history to say.'
  };
}

/**
 * Who actually did the work, counted across the four actor types. This is the
 * supporting figure behind the manual work metric: it says what proportion of
 * recorded movements a person had to make, which is a different question from
 * how many minutes they spent.
 *
 * `applicantEvents` is on every row because six events are typed 'human' with
 * the actor 'Candidate', so the human share overstates staff involvement until
 * effects.js types them 'external'. The figure is reported rather than quietly
 * subtracted, because the row count and the people count have to agree about
 * what happened.
 */
export function actorSplit(store, ctx, filter) {
  const f = filter || {};
  const apps = population(store, ctx, f);
  const ids = new Set(apps.map((a) => a.id));
  const applicantByApp = new Map();
  apps.forEach((a) => applicantByApp.set(a.id, applicantNameFor(store, ctx, a)));
  const evs = store.all('workflowEvents', ctx.tenantId).filter((e) => ids.has(e.applicationId));
  const counts = countBy(evs.map((e) => e.actorType));
  const total = evs.length;
  return Object.keys(counts).map((k) => {
    const mine = evs.filter((e) => e.actorType === k);
    return {
      actorType: k,
      events: counts[k],
      share: total > 0 ? counts[k] / total : null,
      recordedMs: mine.reduce((n, e) => n + (e.durationMs || 0), 0),
      applicantEvents: mine.filter((e) => isApplicant(e.actor, applicantByApp.get(e.applicationId))).length
    };
  }).sort((a, b) => b.events - a.events);
}

/* ------------------------------------------------------------------ fill --- */

/**
 * Whether the openings are getting covered, which is the buyer's question.
 *
 * WHY THIS EXISTS. A review put it plainly: my problem is not that one
 * candidate took a long time, it is that a store has had a Customer Service Desk
 * open for a hundred and forty three days and my Saturday evening is short.
 * Every applicant tracking system reports time to hire and none of them made a
 * store less short, because time to hire measures the winners. Nothing in this
 * module answered the question at all, so on the seeded data ten openings, six
 * people started and zero requisitions closed were all invisible.
 *
 * TIME TO COVER is from the requisition opening to the day somebody turned up
 * on it, which on this data is a median of 31 days over six observations against
 * a time to hire of 26.96 days. It is longer than time to hire because the clock
 * starts when the opening appears rather than when the person who eventually
 * filled it applied. That gap is the whole point of reporting it.
 *
 * ONE FIGURE IN HERE IS NOT EVENT DERIVED and it is marked on every row.
 * `openedAt` is a field the seed wrote on the requisition, not an event, so
 * `daysOpen` and `timeToCover` rest on a stored constant. The rest of this
 * module refuses to read stored fields for exactly this reason, and the note
 * exists because a previous build rendered "open 35 days" from a seeded constant
 * as though it were a measurement. Whoever writes requisitions should write an
 * opened event, and then this reads it instead.
 *
 * THE PROJECTION IS A SUM OF MEDIANS AND SAYS SO. A sum of medians is not the
 * median of a sum, the spans it adds have samples as small as six, and it
 * assumes the furthest-along candidate does not drop out. It carries the
 * weakest sample size behind it and the number of spans it had to add, so a page
 * can print the caveat rather than a date on its own.
 */
export function fill(store, ctx, filter) {
  const f = filter || {};
  const now = ctx.clock.now();
  const apps = population(store, ctx, f);
  const reqs = store.all('requisitions', ctx.tenantId)
    .filter((r) => (!f.storeId || r.storeId === f.storeId) &&
                   (!f.requisitionId || r.id === f.requisitionId));

  /* The medians the projection leans on, over the whole tenant and computed
     once. Tenant rather than store, because a store with two applications has
     no leg with more than one observation in it. */
  const legs = coverPathMedians(population(store, ctx, {})
    .map((a) => milestonesFrom(eventsFor(store, ctx, a.id))));

  const rows = reqs.map((r) => {
    const mine = apps.filter((a) => a.requisitionId === r.id);
    const met = mine.map((a) => applicationMetrics(store, ctx, a.id, f));
    const coveredBy = met.filter((x) => x.milestones.startedAt != null)
      .sort((a, b) => a.milestones.startedAt - b.milestones.startedAt);
    /* Only somebody who has not started can cover an opening that is still
       uncovered. The first version projected off anybody still open, so an
       application that started two months ago produced a cover date sixty seven
       days overdue for an opening it had already filled. */
    const candidates = met.filter((x) => !x.settled && x.milestones.startedAt == null);
    const openings = r.openings || 0;
    const covered = Math.min(coveredBy.length, openings);
    const uncovered = Math.max(0, openings - covered);
    const toCover = coveredBy.map((x) => x.milestones.startedAt - r.openedAt);

    return {
      requisitionId: r.id,
      title: r.title,
      storeId: r.storeId,
      storeName: r.storeName || null,
      status: r.status,
      openings,
      coveredOpenings: covered,
      uncoveredOpenings: uncovered,
      /* Two counts, because a requisition with nine live applications and one
         opening is a different problem from one with none. */
      applications: mine.length,
      openApplications: candidates.length,
      openedAt: r.openedAt || null,
      openedAtSource: 'requisition.openedAt, a field the seed wrote. Not an event.',
      daysOpenRestsOnStoredField: true,
      openMs: r.openedAt != null ? now - r.openedAt : null,
      timeToCover: summarise(toCover),
      projected: uncovered > 0 ? projectCover(candidates, legs, now)
        : { at: null, why: 'Every opening on this requisition is covered.', legsAdded: 0, weakestN: null }
    };
  });

  const coveredStarts = [];
  apps.forEach((a) => {
    const m = milestonesFrom(eventsFor(store, ctx, a.id));
    if (m.startedAt != null) coveredStarts.push(m.startedAt);
  });
  coveredStarts.sort((a, b) => a - b);
  const spanMs = coveredStarts.length > 1 ? coveredStarts[coveredStarts.length - 1] - coveredStarts[0] : null;

  return {
    scope: f.storeId ? 'store' : (f.requisitionId ? 'requisition' : 'tenant'),
    requisitions: rows.length,
    openings: rows.reduce((n, x) => n + x.openings, 0),
    coveredOpenings: rows.reduce((n, x) => n + x.coveredOpenings, 0),
    uncoveredOpenings: rows.reduce((n, x) => n + x.uncoveredOpenings, 0),
    requisitionsClosed: rows.filter((x) => x.status !== 'open').length,
    timeToCover: summarise(flatten(rows.map((x) => x.timeToCover.values))),
    /* The legs the projection is built from, each with its own n, so a page can
       show the working rather than a date on its own. */
    coverPath: legs.map((l) => ({ from: l.from, to: l.to, label: l.label, summary: l.summary })),
    /* A rate over the window it was actually observed in, with the window
       reported, because a rate with no window is a number somebody chose. */
    coverRate: {
      covered: coveredStarts.length,
      firstAt: coveredStarts[0] != null ? coveredStarts[0] : null,
      lastAt: coveredStarts.length ? coveredStarts[coveredStarts.length - 1] : null,
      windowMs: spanMs,
      perWeek: spanMs > 0 ? coveredStarts.length / (spanMs / 604800000) : null,
      note: 'Openings covered per week over the span between the first and last first shift ' +
            'worked in this data. It rests on ' + coveredStarts.length + ' observations.'
    },
    rows: rows.sort((a, b) => (b.openMs || 0) - (a.openMs || 0))
  };
}

/**
 * The median of every consecutive pair on the cover path, once per report.
 *
 * Computed from milestones rather than from the five named spans, so the
 * screening conversation itself is in the path. See COVER_PATH.
 */
function coverPathMedians(mileRows) {
  return COVER_PATH.map((leg) => {
    const values = mileRows
      .map((m) => (m[leg.from] != null && m[leg.to] != null ? m[leg.to] - m[leg.from] : null))
      .filter((v) => v != null);
    return Object.assign({}, leg, { summary: summarise(values) });
  });
}

/**
 * The earliest date somebody could be on the floor for this opening.
 *
 * Anchored on the LAST MILESTONE THAT ACTUALLY HAPPENED, which is the defect
 * the first version of this had. It anchored every projection at now, so a
 * candidate who accepted an offer fifteen days ago and is already scheduled for
 * a first shift projected another twenty five days out, and every opening
 * returned the same date. Anchoring on the milestone and clamping to now gives
 * a date that moves as the candidate moves, and says `overdueMs` when the
 * median has already been passed.
 *
 * Every live application on the opening is projected and the earliest wins,
 * which is what "the furthest along candidate" means in practice and does not
 * need a separate ranking.
 *
 * It deliberately does not use per-step medians. After somebody starts work the
 * step numbers stop following the clock, so a projection built from them
 * inherits the E-Verify artifact and adds thirty days that are not there.
 */
function projectCover(candidates, legs, now) {
  if (!candidates.length) {
    return { at: null, why: 'No live application on this opening.', legsAdded: 0, weakestN: null };
  }
  let best = null;
  candidates.forEach((x) => {
    /* The last leg whose start has happened. Everything from there on is what
       is left to do. */
    let anchorAt = null, anchorFrom = null, startIndex = -1;
    for (let i = 0; i < legs.length; i++) {
      const at = x.milestones[legs[i].from];
      if (at != null) { anchorAt = at; anchorFrom = legs[i].from; startIndex = i; }
    }
    if (startIndex < 0) return;
    let addMs = 0, added = 0, weakest = null;
    const missing = [];
    for (let i = startIndex; i < legs.length; i++) {
      const s = legs[i].summary;
      if (s.median == null) { missing.push(legs[i].label); continue; }
      addMs += s.median; added++;
      weakest = weakest == null ? s.n : Math.min(weakest, s.n);
    }
    const raw = anchorAt + addMs;
    const row = {
      at: Math.max(raw, now),
      overdueMs: raw < now ? now - raw : 0,
      fromApplication: x.applicationId,
      fromMilestone: anchorFrom,
      anchoredAt: anchorAt,
      addedMs: addMs,
      legsAdded: added,
      missingLegs: missing,
      weakestN: weakest,
      complete: missing.length === 0
    };
    if (!best || row.at < best.at) best = row;
  });
  if (!best) return { at: null, why: 'No live application has reached a milestone yet.', legsAdded: 0, weakestN: null };
  best.why = 'The live application closest to a first shift, anchored on the last milestone it ' +
             'actually reached, plus the tenant median of each leg it has left. A sum of medians ' +
             'is not the median of a sum, the weakest of those legs rests on ' +
             (best.weakestN == null ? 'no' : best.weakestN) + ' observations, and it assumes this ' +
             'candidate does not drop out.' +
             (best.overdueMs > 0 ? ' This one has already passed the median, so the projection is now.' : '');
  return best;
}

/* --------------------------------------------------------------- helpers --- */

function uniq(xs) { return Array.from(new Set(xs)); }
function flatten(xs) { return [].concat.apply([], xs); }
function countBy(xs) {
  const o = {};
  xs.forEach((x) => { o[x] = (o[x] || 0) + 1; });
  return o;
}
