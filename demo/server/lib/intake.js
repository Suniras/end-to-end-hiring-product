/* ============================================================================
   intake.js  ·  a real application, from a real form

   Until 8 September 2026 nothing in this build created an application. The
   workflow engine exported `transition`, `settle` and `runEligibility` and no
   create function, and the seed wrote its thirty-six rows directly into the
   tables. So the demo's own spine started at step 2.

   This is the entry point. U-90. It writes a candidate and an application at
   APPLICATION_RECEIVED and then hands to the engine, which already carries it
   on: schema.js has APPLICATION_RECEIVED to ELIGIBILITY_REVIEW as
   `by: ['system'], auto: true`. There is no new transition and no bespoke path,
   which is the point. An application that arrives from the careers page goes
   through exactly the same twenty steps as the thirty-six that were seeded.

   WHAT IS DELIBERATELY NOT SET. `answers`. Every seeded candidate carries a map
   of what they said, and `runConversation` assembles a transcript from it. A
   live applicant must never have one, because the product would then be able to
   manufacture a synthetic transcript for the person who just took a real call.
   U-94. There is an assertion below rather than a comment alone.
   ============================================================================ */

'use strict';

const WF = require('./workflow');
const EV = require('./events');
const RULES = require('./rules');
const PUB = require('./public');
const SLOTS = require('../../js/slots');

/** Everything the form must give us before an application can exist. */
const REQUIRED = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
                  'rightToWork', 'availability', 'commuteBand'];

function validate(store, ctx, form) {
  const f = form || {};
  const problems = [];

  REQUIRED.forEach((k) => {
    const v = f[k];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) {
      problems.push({ field: k, why: 'This is required.' });
    }
  });

  if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(f.email))) {
    problems.push({ field: 'email', why: 'That does not look like an email address.' });
  }
  if (f.phone && String(f.phone).replace(/\D/g, '').length < 10) {
    problems.push({ field: 'phone', why: 'A mobile number needs at least ten digits.' });
  }
  if (f.dateOfBirth && isNaN(Date.parse(f.dateOfBirth))) {
    problems.push({ field: 'dateOfBirth', why: 'That date could not be read.' });
  }
  if (f.commuteBand && PUB.milesForBand(f.commuteBand) == null) {
    problems.push({ field: 'commuteBand', why: 'Pick one of the distances offered.' });
  }
  (f.availability || []).forEach((s) => {
    if (!SLOTS.valid(s)) problems.push({ field: 'availability', why: 'Unknown shift: ' + s });
  });

  return problems;
}

/**
 * Create the candidate and the application, run eligibility, and return what
 * the confirmation page needs.
 *
 * Eligibility runs synchronously, because U-37 gates the screening invitation
 * on it passing and U-91 makes the confirmation branch on the result. An
 * applicant cannot be offered a call before we know whether there is one.
 */
function apply(store, ctx, args) {
  const a = args || {};
  const req = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  if (!req) return { ok: false, error: 'No such job.' };
  if (req.status !== 'open') return { ok: false, error: 'That job is no longer open.' };

  const problems = validate(store, ctx, a.form);
  if (problems.length) return { ok: false, error: 'The form is not complete.', problems };

  const f = a.form;
  const now = ctx.clock.now();
  const first = String(f.firstName).trim();
  const last = String(f.lastName).trim();
  const st = store.byId('stores', ctx.tenantId, req.storeId);

  const c = {
    id: store.nextId('cand'), tenantId: ctx.tenantId,
    firstName: first, lastName: last,
    name: first + ' ' + last,
    initials: (first[0] || '?') + (last[0] || '?'),
    dob: String(f.dateOfBirth),
    phone: String(f.phone).trim(),
    email: String(f.email).trim().toLowerCase(),
    city: st ? st.city : null,
    state: st ? st.state : null,
    /* No county data comes from a form. The eligibility rule that reads
       counties is the background-check scope, which is post-offer. */
    counties: [],
    experience: f.experience ? String(f.experience).trim() : null,
    /* U-94. A live applicant has no seeded answers, so no synthetic transcript
       can be assembled for them. The assertion at the end of this function
       enforces it rather than trusting this line. */
    answers: null,
    persona: null,
    origin: 'careers_page',
    createdAt: now
  };
  store.insert('candidates', c);

  const app = {
    id: store.nextId('app'), tenantId: ctx.tenantId,
    candidateId: c.id, requisitionId: req.id, storeId: req.storeId,
    appliedAt: now,
    /* The source is what the applicant said, which is exactly why U-50 labels
       the sources page a declaration rather than a measurement. */
    source: f.source || 'Careers site',
    sourceKind: f.source ? 'declared' : 'owned',
    state: 'APPLICATION_RECEIVED', stateSince: now, updatedAt: now,
    rightToWorkDeclared: f.rightToWork === true || f.rightToWork === 'true',
    availability: (f.availability || []).filter(SLOTS.valid),
    /* U-88. There is no geocoding in this build, so this is the midpoint of the
       band the applicant chose and it is marked as such. It may not render as a
       computed distance anywhere. */
    distanceMiles: PUB.milesForBand(f.commuteBand),
    distanceSource: 'declared_band',
    commuteBand: f.commuteBand,
    eligibility: null, rehire: null,
    decisionId: null, offerId: null, backgroundCheckId: null, firstShiftId: null,
    startedAt: null, acceptedAt: null, closedAt: null, parallel: null,
    everify: null, fcra: null,
    assignedTo: st ? st.manager : null
  };
  store.insert('applications', app);

  EV.workflowEvent(store, ctx, {
    applicationId: app.id, candidateId: c.id, storeId: app.storeId, requisitionId: req.id,
    at: now, kind: 'enter', state: 'APPLICATION_RECEIVED',
    actorType: 'external', actor: 'Careers page',
    /* The form submission is the work. Measured from when the page was opened
       where the client tells us, and otherwise left null rather than invented. */
    durationMs: a.formMs != null ? a.formMs : null,
    detail: 'Applied through the careers page for ' + req.title + '.'
  });
  EV.auditEvent(store, ctx, {
    action: 'application.created', actorType: 'external', actor: 'Careers page',
    subjectType: 'application', subjectId: app.id,
    applicationId: app.id, candidateId: c.id,
    why: 'Submitted by the applicant through the hosted apply form.',
    detail: { requisition: req.key, store: req.storeId, source: app.source },
    source: 'ui'
  });

  /* The engine takes it from here. `settle` follows the auto edges, which runs
     eligibility and stops wherever a person or a clock is needed. */
  const settled = WF.settle(store, ctx, app.id);

  const fresh = store.byId('applications', ctx.tenantId, app.id);
  const elig = fresh.eligibility || {};

  /* U-94, enforced. */
  const written = store.byId('candidates', ctx.tenantId, c.id);
  if (written.answers) {
    throw new Error('intake wrote an answers map onto a live applicant, which would let the product manufacture a transcript for them.');
  }

  return {
    ok: true,
    applicationId: app.id,
    candidateId: c.id,
    state: fresh.state,
    stateLabel: WF.label(fresh.state),
    settled,
    eligibility: publicEligibility(fresh, elig),
    job: PUB.job(store, ctx, req, { withInterviewNote: true })
  };
}

/**
 * What the applicant is told about their own eligibility.
 *
 * U-91. The reason is withheld when the rehire rule is what held it. Telling
 * somebody that a prior employment record stopped their application discloses
 * an employment history to whoever is standing there, and under a partial match
 * it may not even be theirs. See U-93 for why there is no status page at all.
 */
function publicEligibility(app, elig) {
  const heldByRehire = !!(app.rehire && app.rehire.matched && app.rehire.rehireEligible === false)
    || (elig.holdForPerson === true);
  if (elig.passed) {
    return { passed: true, canScreenNow: true, reason: null };
  }
  if (heldByRehire) {
    return {
      passed: false, canScreenNow: false, heldForPerson: true,
      reason: 'Your application is with the hiring team at this store. They will be in touch.'
    };
  }
  /* One sentence per rule, written here rather than derived from the rule's own
     `basis`, which is written for the store. Three of the four are things the
     applicant just typed, so stating them is not a disclosure, it is telling
     somebody what they already know. `rehire_eligibility` is absent on purpose
     and is handled above. */
  const CANDIDATE_REASON = {
    min_age: 'This role has a minimum age and the date of birth you gave is below it.',
    right_to_work: 'This role needs authorisation to work in the United States.',
    availability: 'This role needs shifts that are not among the ones you ticked.',
    distance: 'This store is further away than the role allows.'
  };
  const failed = (elig.results || []).filter((r) => !r.passed && !r.advisory);
  const shown = failed
    .filter((r) => CANDIDATE_REASON[r.key])
    .map((r) => CANDIDATE_REASON[r.key]);
  return {
    passed: false, canScreenNow: false, heldForPerson: false,
    /* Every reason, not the first one, because telling somebody they missed the
       age bar when they also missed the hours sends them away to fix the wrong
       thing. */
    reasons: shown,
    reason: shown.length ? shown.join(' ')
      : 'This role has a requirement your application does not meet. The hiring team can still review it.'
  };
}

module.exports = { apply, validate, REQUIRED, publicEligibility };
