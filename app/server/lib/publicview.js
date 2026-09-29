/* ============================================================================
   publicview.js  ·  what a candidate is allowed to see

   Everything here is served to somebody who is not logged in and who is about
   to be scored by this product. That makes it the only module in the build with
   a hostile reader, so it is an ALLOWLIST and not a set of deletions.

   THE LEAK THIS CLOSES. A requisition row carries `criteria`,
   `screeningQuestions`, `positivePhrases` and `concernPhrases`. Rendering one
   raw on a careers page publishes the store's scoring answer key to the person
   about to be interviewed against it. U-85.

   Why an allowlist. A blocklist is correct only until somebody adds a field.
   Every projection names the fields it emits, and `assertClean` walks whatever
   came out and throws if a banned name appears at ANY depth, so a new field
   cannot ride along by accident.

   WHAT IS DELIBERATELY ABSENT, and it is the more important half:
     no candidate lookup by name, phone or date of birth
     no application status by any key a candidate could guess
     no rehire or prior-employment signal of any kind, at any depth, and that
       now includes the eligibility booleans, because exactly one rule holds an
       application for a person and the boolean saying so was a working
       do-not-rehire lookup for anybody with a name and a birthday
     no call id, because the provider's transcript endpoint needs no auth at
       all, so anybody holding a call id can read that call
     no room name and no participant name, because either may be derived from
       the call id and no recorded example proves otherwise

   The rehire one is U-93 and worth stating twice. The soft match is last name,
   first name and date of birth with the phone digits dropped, so a status page
   would let anybody who knows a name and a birthday read somebody else's
   do-not-rehire flag.
   ============================================================================ */

import { createHash } from 'node:crypto';
import * as SLOTS from '../../web/js/slots.js';

/* Names that may never appear in a candidate-facing payload, at any depth. */
export const BANNED = [
  'criteria', 'screeningQuestions', 'positivePhrases', 'concernPhrases', 'concernLabel',
  'answers', 'evaluation', 'evaluationMeta', 'recommendation', 'confidence', 'rubric',
  'priorEmployment', 'rehireEligible', 'rehire', 'score', 'verdict', 'evidence',
  'ssn', 'dob', 'notes', 'internalNotes', 'adverseBar', 'transcript',
  'call_id', 'callId', 'participantToken', 'identityKey',
  /* THE REHIRE ORACLE. Exactly one of the five rules sets holdForPerson, so the
     boolean by itself says a prior employment record held this application, and
     the partial branch matches on a name and a date of birth alone. A reviewer
     applied twice as Trevor Boone, once with his real last four digits and once
     with digits nobody has, and got the same `heldForPerson: true` both times.
     That is a working do-not-rehire lookup for anybody who knows a name and a
     birthday, which is the disclosure U-93 removed the status page to prevent.
     The neutral sentence beside it was correct and the boolean gave it away. */
  'heldForPerson', 'holdForPerson', 'holdReason', 'failedKeys',
  /* The room and the participant name may be derived from the call id, and the
     call id reads that call's transcript out of the provider with no auth at
     all. Nothing on a candidate screen needs either: a LiveKit token already
     carries its own room grant. Verified: no recorded example of a real agentX
     room name exists in this repository, so the derivation is unknown rather
     than known to be safe, and unknown is the reason to withhold it. */
  'roomName', 'participantName', 'providerCallId'
];

export function assertClean(value, where) {
  const path = where || 'payload';
  if (Array.isArray(value)) { value.forEach((v, i) => assertClean(v, path + '[' + i + ']')); return value; }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((k) => {
      if (BANNED.indexOf(k) >= 0) {
        throw new Error('publicview refused to emit "' + k + '" at ' + path +
                        '. That field is internal and a candidate may not see it.');
      }
      assertClean(value[k], path + '.' + k);
    });
  }
  return value;
}

function rate(cents) { return '$' + (cents / 100).toFixed(2) + ' an hour'; }

/** One job, as a candidate sees it. */
export function job(store, ctx, req) {
  const st = store.byId('stores', ctx.tenantId, req.storeId);
  return assertClean({
    id: req.id, key: req.key, title: req.title, summary: req.summary,
    /* NO `openings`. It published `req.openings`, which is the requisition's
       total size and not what is left, so the careers page advertised "4
       openings" on a Cashier requisition with one seat free. The seat rule
       lives in seed.js as holdsASeat and seed.js imports this file, so pulling
       it in here would be a cycle, and writing it again would be a second copy
       of the one rule that decides whether a job is still available. A number
       this module cannot compute correctly is a number it does not publish. */
    rate: rate(req.rateCents), rateCents: req.rateCents,
    hoursPerWeek: req.hoursPerWeek, minAge: req.minAge,
    /* The hours come from the same table the screening question reads, so the
       careers page and the voice agent describe one shift pattern. U-89. */
    requiredSlots: (req.requiredSlots || []).filter(SLOTS.valid),
    slotLabels: (req.requiredSlots || []).filter(SLOTS.valid).map(SLOTS.label),
    /* Shown because it is a rule the applicant is about to be measured
       against. U-87 shows the constraints rather than validating afterwards. */
    maxDistanceMiles: req.maxDistanceMiles,
    managerInterview: !!req.requiresManagerInterview,
    postedAt: req.openedAt,
    store: st ? { id: st.id, name: st.name, city: st.city, state: st.state } : null
  }, 'job');
}

/** The careers page. U-55 and U-84. */
export function careers(store, ctx, args) {
  const a = args || {};
  const tenant = store.all('tenants', ctx.tenantId)[0] || {};
  const org = tenant.org || {};
  let reqs = store.where('requisitions', ctx.tenantId, (r) => r.status === 'open');
  if (a.storeId) reqs = reqs.filter((r) => r.storeId === a.storeId);
  if (a.role) {
    const want = String(a.role).toLowerCase();
    reqs = reqs.filter((r) => r.title.toLowerCase().indexOf(want) >= 0);
  }
  /* Newest first. Not by any measure of the job, because ranking eight jobs on
     anything the store knows would be ranking its own stores against each
     other on a page candidates read. */
  reqs = reqs.slice().sort((x, y) => (y.openedAt || 0) - (x.openedAt || 0));

  const stores = store.all('stores', ctx.tenantId)
    .map((s) => ({ id: s.id, name: s.name, city: s.city, state: s.state }));
  const home = store.all('stores', ctx.tenantId).find((s) => s.home);
  const all = store.where('requisitions', ctx.tenantId, (r) => r.status === 'open');

  return assertClean({
    org: {
      name: org.name || tenant.name || null,
      /* Rendered from the record, so removing the marker means editing the
         tenant rather than editing a template. U-55. */
      fictional: org.fictional !== false,
      marker: org.fictional === false ? null
        : 'This is a demonstration environment. ' + (org.name || tenant.name || 'This retailer') +
          ' is not a real company and no application here reaches a real employer.'
    },
    jobs: reqs.map((r) => job(store, ctx, r)),
    stores,
    /* U-84. Defaults to the store the work surfaces are scoped to, so a job
       browsed here is a job the rest of the demo can show being worked. */
    defaultStoreId: (home || stores[0] || {}).id || null,
    roles: Array.from(new Set(all.map((r) => r.title))).sort(),
    total: all.length
  }, 'careers');
}

/* The commute bands. A band and not an address, because there is no geocoding
   anywhere in this build and a mile figure we did not compute must not render
   as one. U-88. */
export const COMMUTE_BANDS = [
  { key: 'under_5', label: 'Under 5 miles',  miles: 3 },
  { key: 'from_5',  label: '5 to 10 miles',  miles: 8 },
  { key: 'from_10', label: '10 to 20 miles', miles: 15 },
  { key: 'from_20', label: '20 to 30 miles', miles: 25 },
  { key: 'over_30', label: 'Over 30 miles',  miles: 40 }
];

export function milesForBand(key) {
  const b = COMMUTE_BANDS.find((x) => x.key === key);
  return b ? b.miles : null;
}

/* The whole form as a record rather than as markup, so the field list is
   reviewable. Everything here is read by an eligibility rule or needed to reach
   the person. Nothing else is collected.

   NO SSN AT INTAKE, and the old note on this line got the reason wrong. It said
   I-9 section 1 is post-offer so no social security number is needed. Section 1
   being post-offer is true, and needing no number is not: this employer runs
   E-Verify at step 12, so the Form I-9 at step 11 requires a social security
   number and every hired candidate will be asked for one. What is true is that
   nothing in the five eligibility rules needs one, so collecting it to APPLY
   would create a custody problem for no gain. The scope is the whole point,
   which is why the disclosure paragraph now carries it too. */
export const FIELDS = [
  { key: 'firstName',   label: 'First name',    type: 'text',  required: true,  group: 'you',   why: 'To address you.' },
  { key: 'lastName',    label: 'Last name',     type: 'text',  required: true,  group: 'you',   why: 'To address you.' },
  { key: 'email',       label: 'Email',         type: 'email', required: true,  group: 'you',   why: 'Where the offer and the paperwork go.' },
  { key: 'phone',       label: 'Mobile number', type: 'tel',   required: true,  group: 'you',   why: 'Where the screening call goes.' },
  /* "Nothing else uses it" was false, and it was false about a protected
     characteristic on a written notice. identityKey in rules.js builds its key
     from the normalised name plus the date of birth plus the last four phone
     digits, and matchPriorEmployment uses that key to search this retailer's
     own prior employment table, where a record marked not eligible for rehire
     stops the application until a person looks at it. */
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date',  required: true,  rule: 'min_age', group: 'eligibility',
    why: 'This role has a minimum age. It is also used to check whether you have worked for us before.' },
  /* The standard US wording. "Authorised" was the last British spelling on the
     candidate page and this is the question every US employer asks. */
  { key: 'rightToWork', label: 'Are you legally authorized to work in the United States?', type: 'boolean',
    required: true, rule: 'right_to_work', group: 'eligibility', why: 'A yes or no. No documents at this stage.' },
  /* The grid is no longer the question. The shifts this role needs are asked as
     yes or no rows above it and the grid is what else you could do. */
  { key: 'availability', label: 'Which shifts can you work?', type: 'slots', required: true, rule: 'availability',
    group: 'availability',
    why: 'Answer yes or no to the shifts this role needs, then add any others you could work.' },
  /* NOT REQUIRED, because the distance rule is advisory by design: a long
     commute is a reason to talk to somebody rather than to refuse them. A
     required field whose answer changes no outcome is a field that reads as a
     bar, and making the rule blocking to justify the asterisk would be the
     wrong way round. */
  { key: 'commuteBand', label: 'How far are you from the store?', type: 'band', required: false, rule: 'distance',
    group: 'availability',
    why: 'A rough band is enough, and it does not decide anything on its own. We do not ask for your address.' },
  /* Two fields no rule reads, kept for reasons outside the rules. Experience
     gives the voice agent something to open on rather than starting cold.
     Source is the only honest input to the sources page, which is exactly why
     that page labels its counts a declaration. */
  /* NO `why` ON EITHER OF THESE. The group note above them already says they
     are optional and what they are for, and the label carries its own
     "(optional)". "Optional. A sentence is plenty." under a label ending in
     "(optional)" above a box whose placeholder read "A sentence is plenty."
     was the same sentence three times in eighty pixels. */
  { key: 'experience', label: 'Any retail or customer-facing experience?', type: 'textarea', required: false,
    group: 'experience' },
  { key: 'source', label: 'How did you hear about us?', type: 'select', required: false,
    group: 'experience' }
];

/* Four groups, because ten questions in one column is a wall and because the
   questions are about four different things: who you are, what the law
   requires, when you can work, and what you have done. The eligibility group
   is named so that a person can see which answers are the ones a fixed rule
   will be run against, which is the same honesty the disclosure gate gives. */
export const FIELD_GROUPS = [
  /* NOT "Your details". That is the name of the page this form is on, and the
     heading appearing twice, once as an h1 and once as an h3 forty pixels
     under it, read as a mistake. */
  { key: 'you', label: 'How we reach you',
    note: 'The screening call goes to the mobile number, and the offer goes to the email.' },
  { key: 'eligibility', label: 'Eligibility',
    note: 'Two questions fixed rules are run against. No AI model reads either of them.' },
  { key: 'availability', label: 'Availability',
    note: 'The shifts this role needs, and how far you are travelling.' },
  { key: 'experience', label: 'Experience',
    note: 'Optional. It gives the screening call somewhere to start.' }
];

/** One job plus everything the form needs to render itself. U-87. */
export function applyForm(store, ctx, args) {
  const req = store.byId('requisitions', ctx.tenantId, (args || {}).requisitionId);
  if (!req) return { ok: false, error: 'No such job.' };
  return assertClean({
    ok: true,
    job: job(store, ctx, req),
    /* The canonical grid, so a tick box exists for exactly the thirteen slots a
       requisition can require and no more. U-89. */
    slotGrid: SLOTS.grid(),
    requiredSlots: (req.requiredSlots || []).filter(SLOTS.valid),
    fields: FIELDS,
    /* The groups, in the order they are asked, with a line each saying why the
       group exists. The browser renders headings from this rather than
       inventing four names of its own, so what is collected and how it is
       explained stay one reviewable record. */
    fieldGroups: FIELD_GROUPS,
    commuteBands: COMMUTE_BANDS,
    sources: sourceOptions()
  }, 'applyForm');
}

function sourceOptions() {
  return ['Career site', 'Indeed', 'Google for Jobs', 'A referral from a colleague',
          'A QR code in store', 'Somewhere else'];
}

/* ---------------------------------------------------- the disclosure gate ---
   U-86. Before the form, applying the strictest rule tenant-wide and saying so.

   Why tenant-wide. The tenant record asserts a footprint including New York
   City and California. All five seeded stores are elsewhere, in Ohio, Indiana
   and Kentucky. Applying the strictest rule everywhere is defensible. Implying
   a store in a jurisdiction we do not have is not.
   -------------------------------------------------------------------------- */

export const DISCLOSURE = {
  id: 'aedt_notice',
  version: '1',
  title: 'Before you apply, how this hiring process works',
  /* Each paragraph is here because a specific rule requires it, and the rule is
     named on the paragraph so nobody edits it into something shorter without
     seeing what it was for. */
  paragraphs: [
    { basis: 'NYC Local Law 144, and California FEHA since 1 October 2025',
      text: 'Part of this process uses an automated tool. After you apply, an AI voice assistant calls you and asks the questions this role asks everybody. It records what you say and produces an assessment.' },
    { basis: 'The human decision boundary, which is this product design',
      text: 'The assistant does not decide anything. It cannot hire you and it cannot reject you. A named person at the store reads what you said and makes the decision.' },
    /* THREE FALSE STATEMENTS CAME OUT OF THIS PARAGRAPH, all measured on
       8 September 2026, and a false sentence in a statutory notice is worse
       than a missing one because the notice is the document that gets produced
       as proof.

       One, it said the candidate was being told this at least ten business days
       before the assessment. The tool had run on all thirty seeded
       applications and every one of them ran inside the notice period, and a
       live applicant is called minutes after applying. The period is now stated
       without claiming it was honoured, and the honest sentence about this
       demonstration is next to it.

       Two, it promised a different way to be assessed. 6 RCNY 5-303(e) says
       nothing in the subchapter requires an employer to provide an alternative
       selection process, so the promise was one this employer never made.

       Three, 6 RCNY 5-303(c) requires the notice to carry INSTRUCTIONS for
       making the request, which is the part that was missing, and it named
       email as the channel while nothing in the product sends one. */
    { basis: 'NYC Local Law 144 notice requirement, 6 RCNY 5-303(c) and 5-303(e)',
      text: 'The law says you should be told at least ten business days before an automated tool is used to assess you. In this demonstration the call happens the same day, so that period is not honoured here and we are not claiming it was. To ask for an accommodation, or to ask to be assessed a different way, say so to the person from the store when they contact you, and the request goes on your record. The law does not require an employer to provide a different process, so this is a request rather than a right.' },
    /* It said the audit is published and the link is below. The link was a 404
       and no audit exists, so the notice asserted a document nobody could
       produce. It now says what is actually behind the link, and the link is
       served. */
    { basis: 'NYC Local Law 144 bias audit publication',
      text: 'The law requires an employer using a tool like this to publish a summary of its most recent independent bias audit. No audit has been done on this tool, because this is a demonstration and it is not being used to hire anybody. The link below says that in full rather than showing you an audit that does not exist.' },
    /* It promised deletion at four years and two request channels, and the
       product had a delete path with no caller, no retention sweep, no access
       route and no email. The four year figure was also computed as
       4 * 365 days, which deletes a day EARLY, and early is the direction that
       breaches a retention floor. */
    { basis: 'California FEHA, four years of retention of the inputs to an automated decision system',
      text: 'What you tell us is kept for at least four years, because that is the retention the rules on automated hiring tools require, and it is deleted after that unless a longer legal duty or a legal hold applies. Nothing in this demonstration sends you email, so there is no channel here for asking for a copy or asking for deletion. In a real deployment those requests go to the store, and the four year floor is not something the store can shorten.' },
    /* "We do not ask for a social security number" is true of applying and was
       false as an unscoped statement. This employer runs E-Verify at step 12,
       so the Form I-9 at step 11 requires one and every hired candidate is
       asked. The background check sentence beside it already scoped itself with
       "only if you are offered the job", and this one now does the same. */
    { basis: 'What is NOT collected, stated because it is the question people ask',
      text: 'To apply we do not ask for a social security number, a photograph, or your address. If you are hired, the Form I-9 does ask for a social security number, because this employer uses E-Verify. A background check happens only if you are offered the job, it is run by a licensed agency, and it has its own separate notice.' }
  ],
  auditUrl: '/public/bias-audit',
  /* The demonstration marker on the gate too, because this is the page where
     somebody might otherwise believe they are applying for a real job. */
  demoNote: 'This is a demonstration environment. No application here reaches a real employer.'
};

/**
 * A digest of the notice as it stands, over the words rather than over the
 * object.
 *
 * WHY A DIGEST AND NOT JUST THE VERSION. A version string records which notice
 * was meant to be on the screen. Review found a consent stamped
 * `aedt_notice version 1` for a page that had rendered none of the six
 * paragraphs, because the client read them off the wrong level of the payload.
 * The record was then a false attestation, and a false attestation is worse
 * than a missing one: it is the document the employer would produce as proof
 * and it proved the wrong thing.
 *
 * It is the id, the version, and every paragraph's basis and text, in order.
 * Editing a single word changes the digest, so a consent taken before the edit
 * can be told apart from one taken after.
 */
export function disclosureDigest() {
  const canonical = [DISCLOSURE.id, DISCLOSURE.version, DISCLOSURE.title]
    .concat(DISCLOSURE.paragraphs.map((p) => p.basis + '\n' + p.text))
    .join('\n--\n');
  return createHash('sha256').update(canonical, 'utf8').digest('hex').slice(0, 16);
}

/* ------------------------------------------------------ the bias audit ---
   The link the notice promises, which was a 404 for as long as the notice
   promised it. Local Law 144 requires the employer using the tool to publish a
   summary of its most recent independent bias audit, and there has not been
   one, so this says that plainly instead.

   It is a record rather than markup for the same reason the notice is: the
   words are reviewable here, and the route renders them.
   ------------------------------------------------------------------------ */

export const BIAS_AUDIT = {
  title: 'Bias audit: none has been performed',
  updated: '8 September 2026',
  requirement: 'A summary of the most recent bias audit, published on the employer\'s website before ' +
               'the tool is used.',
  citation: 'NYC Admin. Code section 20-871(a)',
  paragraphs: [
    'This page exists because the notice on the apply form links to it. New York City requires an ' +
    'employer using an automated employment decision tool to publish a summary of the tool\'s most ' +
    'recent bias audit before the tool is used.',
    'No bias audit has been performed on this tool. This is a demonstration environment. No ' +
    'application made here reaches a real employer, nobody is hired or rejected through it, and the ' +
    'tool is not in use for employment decisions.',
    'An audit has to be done, and its summary published on this page, before this tool assesses a real ' +
    'candidate for a real job. Until then this page says so rather than showing an audit that does not ' +
    'exist.',
    'What the tool does today, stated so the absence of an audit is not the only thing on this page. An ' +
    'automated voice assistant asks every applicant for a role the same questions and records the ' +
    'answers. Fixed rules with no model in them check age for the role, authorisation to work, the ' +
    'shifts the applicant ticked, and a distance band the applicant chose. A named person at the store ' +
    'reads the answers and makes the hiring decision. The software cannot approve anybody and it cannot ' +
    'reject anybody.'
  ]
};
