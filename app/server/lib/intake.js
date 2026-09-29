/* ============================================================================
   intake.js  ·  a real application, from a real form

   The ONLY thing in this build that creates an application. U-90.

   It writes a candidate and an application at APPLICATION_RECEIVED and then
   hands to the engine, which carries it on by itself: the table already has
   APPLICATION_RECEIVED to ELIGIBILITY_REVIEW as by system, auto true. There is
   no new transition and no bespoke path, which is the whole point. An
   application that arrives from the careers page takes exactly the same twenty
   steps as the thirty-six that were seeded.

   WHAT IS DELIBERATELY NOT SET. `answers`. Every seeded candidate carries a map
   of what they said, and the screening replay assembles a transcript from it. A
   live applicant must never have one, or the product could manufacture a
   synthetic transcript for the person who just took a real call. U-94. There is
   a thrown assertion at the end rather than a comment alone.

   IT IS IDEMPOTENT, AND IT HAS TO BE. Two reviewers pressed send twice, one on
   purpose and one because the connection was slow, and got two applications for
   one person, which becomes two screening calls to one phone. A repeated submit
   is a legitimate thing for a person to do and the client cannot fix it: a busy
   flag only covers the window the request is in flight. So this checks twice
   before it writes, once on the consent and once on the identity key, and it
   returns the application that already exists.
   ============================================================================ */

import * as WF from './engine.js';
import * as EV from './events.js';
import * as PUB from './publicview.js';
import * as RULES from './rules.js';
import * as SLOTS from '../../web/js/slots.js';

/* `commuteBand` is NOT required. The distance rule is advisory by design, so a
   required field whose answer changes no outcome reads to the applicant as a
   bar they have to clear. publicview.FIELDS says the same thing on the form and
   the two have to agree. */
const REQUIRED = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
                  'rightToWork', 'availability'];

/* The alphabet for the reference somebody reads out over the phone. No 0 or O
   and no 1 or I, because they are the two pairs people get wrong out loud. */
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function validate(form) {
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
 * Create the candidate and the application, run the rules, and return what the
 * confirmation needs.
 *
 * Eligibility runs SYNCHRONOUSLY, because the screening invitation is gated on
 * it passing and the confirmation branches on the result. An applicant cannot
 * be offered a call before we know whether there is one. U-91.
 */
export function apply(store, ctx, args) {
  const a = args || {};
  const req = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  if (!req) return { ok: false, error: 'No such job.' };
  if (req.status !== 'open') return { ok: false, error: 'That job is no longer open.' };

  const problems = validate(a.form);
  if (problems.length) return { ok: false, error: 'The form is not complete.', problems };

  const f = a.form;
  const now = ctx.clock.now();
  const first = String(f.firstName).trim();
  const last = String(f.lastName).trim();
  const st = store.byId('stores', ctx.tenantId, req.storeId);

  /* FIRST GUARD: THE CONSENT. One consent record belongs to one application. A
     reviewer created one consent and applied three times with it as three
     different people, and because the binding was written by overwriting the
     consent, the record ended up naming the last of the three and the first two
     cited a notice record belonging to somebody else. */
  const key = RULES.identityKey({ firstName: first, lastName: last, dob: f.dateOfBirth, phone: f.phone });
  const sameHand = (app0) => {
    const c0 = store.byId('candidates', ctx.tenantId, app0.candidateId);
    return !!c0 && RULES.identityKey(c0) === key;
  };

  const cs = a.consentId ? store.byId('consents', ctx.tenantId, a.consentId) : null;
  if (a.consentId && !cs) return { ok: false, error: 'That consent record does not exist.' };
  if (cs && cs.usedByApplicationId) {
    const prior = store.byId('applications', ctx.tenantId, cs.usedByApplicationId);
    /* The same person on the same job is a double press and gets their own
       application back. ANYBODY ELSE IS REFUSED, and that check is not
       optional: without it a second person submitting on a used consent was
       handed the first person's reference and first name, which is a different
       disclosure and a worse one. */
    if (prior && prior.requisitionId === req.id && sameHand(prior)) {
      return existing(store, ctx, prior, req);
    }
    return { ok: false, error: 'That consent has already been used for an application. ' +
                               'Applying starts with the notice again.' };
  }

  /* SECOND GUARD: THE PERSON. The identity key is the same one the rehire
     lookup uses, so a repeat submit with the same name, date of birth and phone
     is recognised even when the consent is a fresh one, which is what a page
     reload produces. Only an application that is still running counts: somebody
     rejected in March may apply again in September. */
  const twin = store.first('applications', ctx.tenantId,
    (x) => x.requisitionId === req.id && !x.closedAt && sameHand(x));
  if (twin) return existing(store, ctx, twin, req);

  const c = {
    id: store.nextId('cand'), tenantId: ctx.tenantId,
    firstName: first, lastName: last, name: first + ' ' + last,
    initials: (first[0] || '?') + (last[0] || '?'),
    dob: String(f.dateOfBirth),
    phone: String(f.phone).trim(),
    email: String(f.email).trim().toLowerCase(),
    city: st ? st.city : null, state: st ? st.state : null,
    /* No county data comes from a form. The rule that reads counties is the
       background check scope, which is post-offer. */
    counties: [],
    experience: f.experience ? String(f.experience).trim() : null,
    persona: null, origin: 'careers_page',
    /* U-94, and there is an assertion below rather than trust in this line. */
    answers: null,
    createdAt: now
  };
  store.insert('candidates', c, ctx.tenantId);

  const app = {
    id: store.nextId('app'), tenantId: ctx.tenantId,
    /* SIX CHARACTERS SOMEBODY CAN READ OUT, and the id is not that. `app_0042`
       is a row count: it tells the applicant and anybody standing behind them
       how many applications this store has taken, and it is not a code you can
       say down a phone. The id stays internal, this is what goes on the
       confirmation. */
    reference: reference(store, ctx),
    candidateId: c.id, requisitionId: req.id, storeId: req.storeId,
    appliedAt: now,
    /* What the applicant said, which is exactly why the sources page labels its
       counts a declaration rather than a measurement. */
    source: f.source || 'Career site',
    sourceKind: f.source ? 'declared' : 'owned',
    state: 'APPLICATION_RECEIVED', stateSince: now, updatedAt: now,
    rightToWorkDeclared: f.rightToWork === true || f.rightToWork === 'true',
    availability: (f.availability || []).filter(SLOTS.valid),
    /* U-88. The midpoint of the band they chose, marked as declared, because
       there is no geocoding here and it may not render as a computed distance. */
    distanceMiles: PUB.milesForBand(f.commuteBand),
    distanceSource: 'declared_band',
    commuteBand: f.commuteBand || null,
    consentId: a.consentId || null,
    /* THE NOTICE STAMP IS COPIED ONTO THE APPLICATION and not read off the
       consent later. The consent row is a separate record that a bug or a
       second writer could move, and the application has to be able to say for
       itself which words its applicant accepted. The digest is over the text,
       so an edit to the notice cannot make an old consent look like a new
       one. */
    disclosureId: cs ? cs.disclosureId : null,
    disclosureVersion: cs ? cs.disclosureVersion : null,
    disclosureDigest: cs ? cs.disclosureDigest : null,
    eligibility: null, rehire: null,
    decisionId: null, offerId: null, backgroundCheckId: null, firstShiftId: null,
    startedAt: null, acceptedAt: null, closedAt: null, parallel: null,
    everify: null, fcra: null,
    /* Read by the retention sweep, which will not delete a record on hold.
       Nothing sets it yet and that is the honest state: there is no screen for
       putting an application on legal hold, so the sweep is written to honour a
       field that is always null rather than written as if holds do not exist. */
    legalHold: null,
    assignedTo: st ? st.manager : null
  };
  store.insert('applications', app, ctx.tenantId);

  EV.workflowEvent(store, ctx, {
    applicationId: app.id, candidateId: c.id, storeId: app.storeId, requisitionId: req.id,
    at: now, kind: 'enter', state: 'APPLICATION_RECEIVED',
    actorType: 'external', actor: 'Careers page',
    /* Measured from when the page was opened where the client tells us, and
       left null otherwise rather than invented. */
    durationMs: a.formMs != null ? a.formMs : null,
    detail: 'Applied through the careers page for ' + req.title + '.'
  });
  EV.auditEvent(store, ctx, {
    action: 'application.created', actorType: 'external', actor: 'Careers page',
    subjectType: 'application', subjectId: app.id,
    applicationId: app.id, candidateId: c.id,
    why: 'Submitted by the applicant through the hosted apply form.',
    detail: { requisition: req.key, store: req.storeId, source: app.source, consentId: app.consentId },
    source: 'ui'
  });

  /* The consent written at the gate is bound to the application here, so the
     retention record and the thing being retained point at each other, and it
     is marked USED so nothing can re-point it afterwards. The guard at the top
     of this function is what enforces that; this is where the mark is set. */
  if (cs) {
    cs.candidateId = c.id;
    cs.applicationId = app.id;
    cs.usedByApplicationId = app.id;
    cs.usedAt = now;
    store.markDirty();
  }

  const settled = WF.settle(store, ctx, app.id);
  const fresh = store.byId('applications', ctx.tenantId, app.id);

  const written = store.byId('candidates', ctx.tenantId, c.id);
  if (written.answers) {
    throw new Error('intake wrote an answers map onto a live applicant, which would let the product ' +
                    'manufacture a transcript for somebody who took a real call.');
  }

  return {
    ok: true,
    applicationId: app.id,
    reference: app.reference,
    candidateId: c.id,
    firstName: c.firstName,
    state: fresh.state,
    stateLabel: WF.label(fresh.state),
    /* THE SETTLE RESULT IS GENERALISED, and this was a real leak found by
       review before it shipped.

       `settle` returns stoppedBecause and blockedBy, and on a rehire hold those
       read "A prior employment record needs a person to look at it" with the
       exception kind attached. Two fields below, publicEligibility correctly
       withholds exactly that. So the payload said the quiet part out loud in
       one field while carefully withholding it in another, to whoever is
       standing at the terminal, about a record that under a partial match may
       not even be theirs. U-91 and U-93.

       Only the count of automatic moves survives. `waitingOnAPerson` went with
       the same review pass that took `heldForPerson` out of the eligibility
       projection: it was the identical bit under a second name. */
    settled: { moves: (settled.moved || []).length },
    eligibility: publicEligibility(fresh),
    job: PUB.job(store, ctx, req)
  };
}

/**
 * The reference an applicant reads out.
 *
 * Six characters from an alphabet with no 0 or O and no 1 or I. It is checked
 * against the ones already issued, because two applicants holding one reference
 * is worse than a slightly longer function.
 */
function reference(store, ctx) {
  for (let attempt = 0; attempt < 40; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
    }
    if (!store.first('applications', ctx.tenantId, (x) => x.reference === code)) return code;
  }
  /* Thirty-two to the sixth is a billion, so forty collisions in a row is a
     broken random source rather than a full space, and it is not something to
     paper over with a longer code. */
  throw new Error('could not mint an unused application reference in forty attempts.');
}

/**
 * The answer to a repeat submit: the application that already exists, in the
 * same shape a fresh one returns.
 *
 * It writes an audit row, because two submits for one person is a thing worth
 * being able to see afterwards, and because the alternative is a second
 * application and a second screening call to one phone.
 */
function existing(store, ctx, app, req) {
  const c = store.byId('candidates', ctx.tenantId, app.candidateId);
  EV.auditEvent(store, ctx, {
    action: 'application.duplicate_submit', actorType: 'external', actor: 'Careers page',
    subjectType: 'application', subjectId: app.id,
    applicationId: app.id, candidateId: app.candidateId,
    why: 'The same person submitted the same job again. The existing application was returned rather ' +
         'than a second one created, which would have been a second screening call to one phone.',
    detail: { requisition: req.key },
    source: 'ui'
  });
  return {
    ok: true,
    applicationId: app.id,
    reference: app.reference || null,
    candidateId: app.candidateId,
    firstName: c ? c.firstName : null,
    state: app.state,
    stateLabel: WF.label(app.state),
    duplicate: true,
    settled: { moves: 0 },
    eligibility: publicEligibility(app),
    job: PUB.job(store, ctx, req)
  };
}

/**
 * What the applicant is told about their own eligibility.
 *
 * U-91. The reason is withheld when the rehire rule is what held it. Telling
 * somebody a prior employment record stopped their application discloses an
 * employment history to whoever is standing there, and under a partial match it
 * may not even be theirs. U-93 is why there is no status page at all.
 *
 * `heldForPerson` IS GONE, and it was a working do-not-rehire lookup. Exactly
 * one of the five rules sets holdForPerson, so the boolean by itself named the
 * rule, and the partial branch matches on a name and a date of birth with the
 * phone digits dropped. A reviewer applied twice as Trevor Boone, once with his
 * real last four digits and once with digits nobody has, and got
 * `heldForPerson: true` both times. Anybody who knew a name and a birthday
 * could test whether that person was barred from rehire at this retailer. The
 * neutral sentence beside it was right; the boolean gave it away. It is on the
 * publicview BANNED list now, so it cannot come back by accident.
 *
 * `outcome` REPLACES IT, and it is honest about what it still carries. A
 * surface needs to tell three screens apart: through to the call, with a
 * person, and not a match. Nothing here says WHY an application is with a
 * person. But an application that clears all four typed rules and is still not
 * offered a call was held, so one bit survives, and it survives in
 * `canScreenNow` too. That bit cannot be removed here: it exists because U-91
 * runs the rehire match synchronously and branches the confirmation on it. The
 * fix is at the decision, and until then the apply route is rate limited so the
 * bit cannot be walked name by name.
 */
export function publicEligibility(app) {
  const elig = app.eligibility || {};
  if (elig.passed && !elig.holdForPerson) {
    return { passed: true, canScreenNow: true, outcome: 'screening', reasons: [], reason: null };
  }
  if (elig.holdForPerson) {
    return { passed: false, canScreenNow: false, outcome: 'with_the_team', reasons: [],
             reason: 'Your application is with the hiring team at this store. They will be in touch.' };
  }
  /* One sentence per rule, written here rather than derived from the rule's own
     `basis`, which is written for the store. Three of the four are things the
     applicant just typed, so stating them discloses nothing.
     `rehire_eligibility` is absent on purpose and is handled above. */
  const SAY = {
    min_age: 'This role has a minimum age and the date of birth you gave is below it.',
    /* "Authorisation" was the British spelling of the standard US question, and
       the form now asks it the way every US employer asks it. */
    right_to_work: 'This role needs authorization to work in the United States.',
    availability: 'This role needs shifts that are not among the ones you ticked.',
    distance: 'This store is further away than the role allows.'
  };
  const failed = (elig.results || []).filter((r) => !r.passed && !r.advisory);
  const reasons = failed.map((r) => SAY[r.key]).filter(Boolean);
  return {
    passed: false, canScreenNow: false,
    /* With no listed reason there is nothing to show a candidate, so it reads
       as being with a person rather than as a refusal nobody will explain. That
       is also the branch a hold lands in, which is deliberate: the two are the
       same screen. */
    outcome: reasons.length ? 'not_a_match' : 'with_the_team',
    /* Every reason, not the first, because telling somebody they missed the age
       bar when they also missed the hours sends them away to fix one thing. */
    reasons,
    reason: reasons.length ? reasons.join(' ')
      : 'Your application is with the hiring team at this store. They will be in touch.'
  };
}
