/* ============================================================================
   public.js  ·  what a candidate is allowed to see

   Everything in this file is served to somebody who is not logged in and who is
   about to be scored by this product. That makes it the only module in the
   build with a hostile reader, so it is built as an allowlist and not as a set
   of deletions.

   THE LEAK THIS CLOSES. A requisition row carries `criteria`,
   `screeningQuestions`, `positivePhrases` and `concernPhrases`. Rendering one
   raw on a careers page publishes the store's scoring answer key to the person
   about to be interviewed against it. U-85.

   Why an allowlist rather than a blocklist. A blocklist is correct only until
   somebody adds a field. Every projection here names the fields it emits, and
   `assertClean` walks whatever came out and throws if a banned name appears at
   any depth, so a future field cannot ride along by accident. The test suite
   asserts the same property against live data.

   What is NOT here, deliberately:
     no candidate lookup by name, phone or date of birth
     no application status by any key a candidate could guess
     no rehire or prior-employment signal of any kind, at any depth

   The last one is U-93 and it is worth stating twice. The soft rehire match is
   last name, first name and date of birth with the phone digits dropped, so a
   status page would let anybody who knows a name and a birthday read somebody
   else's do-not-rehire flag. There is no candidate-facing status surface and
   this file is where that stays true.
   ============================================================================ */

'use strict';

const SLOTS = require('../../js/slots');

/* Names that may never appear in a candidate-facing payload, at any depth.
   Matched on the key, so nesting does not help. */
const BANNED = [
  'criteria', 'screeningQuestions', 'positivePhrases', 'concernPhrases', 'concernLabel',
  'answers', 'evaluation', 'evaluationMeta', 'recommendation', 'confidence', 'rubric',
  'priorEmployment', 'rehireEligible', 'rehire', 'score', 'verdict', 'evidence',
  'ssn', 'dateOfBirth', 'dob', 'notes', 'internalNotes', 'adverseBar', 'adverseActionBlock'
];

/**
 * Walks a projection and throws on any banned key. Called on the way out of
 * every function here, so the guarantee is enforced rather than documented.
 */
function assertClean(value, where) {
  const path = where || 'payload';
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertClean(v, path + '[' + i + ']'));
    return value;
  }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((k) => {
      if (BANNED.indexOf(k) >= 0) {
        throw new Error('public.js refused to emit "' + k + '" at ' + path +
                        '. That field is internal and a candidate may not see it.');
      }
      assertClean(value[k], path + '.' + k);
    });
  }
  return value;
}

/** Money, as a person reads it. */
function rate(cents) {
  return '$' + (cents / 100).toFixed(2) + ' an hour';
}

/**
 * One job, as a candidate sees it. Everything here is either something a real
 * retailer prints on a careers page or something the applicant needs in order
 * to answer honestly.
 */
function job(store, ctx, req, opts) {
  const o = opts || {};
  const st = store.byId('stores', ctx.tenantId, req.storeId);
  const out = {
    id: req.id,
    key: req.key,
    title: req.title,
    summary: req.summary,
    openings: req.openings,
    rate: rate(req.rateCents),
    rateCents: req.rateCents,
    hoursPerWeek: req.hoursPerWeek,
    minAge: req.minAge,
    /* The hours, from the same table the screening question reads, so the
       careers page and the voice agent describe one shift pattern. U-89. */
    requiredSlots: (req.requiredSlots || []).filter(SLOTS.valid),
    slotLabels: (req.requiredSlots || []).filter(SLOTS.valid).map(SLOTS.label),
    /* The commute band is shown because it is an eligibility rule the applicant
       is about to be measured against. U-87 shows the constraints rather than
       validating after submission. */
    maxDistanceMiles: req.maxDistanceMiles,
    postedAt: req.openedAt,
    store: st ? { id: st.id, name: st.name, city: st.city, state: st.state } : null
  };
  if (o.withInterviewNote) {
    /* Whether a manager interview follows is a fact about the process, not a
       scoring criterion, and a real careers page says so. */
    out.managerInterview = !!req.requiresManagerInterview;
  }
  return assertClean(out, 'job');
}

/** The careers page: the whole open list, filterable. U-55 and U-84. */
function careers(store, ctx, args) {
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
     anything the store knows would be ranking the stores against each other on
     a candidate-facing page. */
  reqs = reqs.slice().sort((x, y) => (y.openedAt || 0) - (x.openedAt || 0));

  const stores = store.all('stores', ctx.tenantId)
    .map((s) => ({ id: s.id, name: s.name, city: s.city, state: s.state }));

  const out = {
    org: {
      name: org.name || tenant.name || null,
      /* The demonstration marker is rendered from the record rather than
         written into the page, so removing it means editing the tenant. U-55. */
      fictional: org.fictional !== false,
      marker: org.fictional === false ? null
        : 'This is a demonstration environment. ' + (org.name || 'This retailer') +
          ' is not a real company and no application here reaches a real employer.'
    },
    jobs: reqs.map((r) => job(store, ctx, r, { withInterviewNote: true })),
    stores,
    /* U-84: the filter defaults to the store the work surfaces are scoped to,
       so a job browsed here is a job the demo can then show being worked. */
    defaultStoreId: (store.all('stores', ctx.tenantId).find((s) => s.home) || stores[0] || {}).id || null,
    roles: Array.from(new Set(reqs.map((r) => r.title))).sort()
  };
  return assertClean(out, 'careers');
}

/** The slot grid and the constraints one job puts on an applicant. U-87. */
function applyForm(store, ctx, args) {
  const a = args || {};
  const req = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  if (!req) return { ok: false, error: 'No such job.' };
  const out = {
    ok: true,
    job: job(store, ctx, req, { withInterviewNote: true }),
    /* The grid is the canonical one, so a tick box exists for exactly the
       thirteen slots a requisition can require. U-89. */
    slotGrid: SLOTS.grid(),
    /* Named so the form can mark the required cells rather than making the
       applicant guess which ones matter. */
    requiredSlots: (req.requiredSlots || []).filter(SLOTS.valid),
    fields: FIELDS
  };
  return assertClean(out, 'applyForm');
}

/* The whole form, in one place, so the field list is a record rather than
   markup. Everything here is either read by an eligibility rule or needed to
   reach the person. Nothing else is collected.

   No SSN. Nothing in the eligibility rules needs it and I-9 section 1 is
   post-offer, so collecting it at intake creates a retention obligation for no
   purpose. U-87. */
const FIELDS = [
  { key: 'firstName',   label: 'First name',    type: 'text',  required: true,  why: 'To address you.' },
  { key: 'lastName',    label: 'Last name',     type: 'text',  required: true,  why: 'To address you.' },
  { key: 'email',       label: 'Email',         type: 'email', required: true,  why: 'Where the offer and the paperwork go.' },
  { key: 'phone',       label: 'Mobile number', type: 'tel',   required: true,  why: 'Where the screening call goes.' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date',  required: true,
    why: 'This role has a minimum age. Nothing else uses it.', rule: 'minimum_age' },
  { key: 'rightToWork', label: 'Are you authorised to work in the United States?',
    type: 'boolean', required: true, why: 'A yes or no. No documents at this stage.', rule: 'right_to_work' },
  { key: 'availability', label: 'Which shifts can you work?', type: 'slots', required: true,
    why: 'Tick every shift you could work. The ones this role needs are marked.', rule: 'availability' },
  { key: 'commuteBand', label: 'How far are you from the store?', type: 'band', required: true,
    why: 'A rough band is enough.', rule: 'commute' },
  /* Two fields that no eligibility rule reads, kept for reasons outside the
     rules. Experience gives the voice agent something to open on rather than
     starting cold. Source is the only honest input to the sources page, which
     U-50 labels a declaration precisely because this is where it comes from. */
  { key: 'experience',  label: 'Any retail or customer-facing experience?',
    type: 'textarea', required: false, why: 'Optional. A sentence is plenty.' },
  { key: 'source',      label: 'How did you hear about us?', type: 'select', required: false,
    why: 'Optional.' }
];

/* The commute bands. A band rather than an address, because there is no
   geocoding anywhere in this build and a mile figure we did not compute must
   not render as one. U-88. */
const COMMUTE_BANDS = [
  { key: 'under_5',  label: 'Under 5 miles',  miles: 3 },
  { key: 'from_5',   label: '5 to 10 miles',  miles: 8 },
  { key: 'from_10',  label: '10 to 20 miles', miles: 15 },
  { key: 'from_20',  label: '20 to 30 miles', miles: 25 },
  { key: 'over_30',  label: 'Over 30 miles',  miles: 40 }
];

function milesForBand(key) {
  const b = COMMUTE_BANDS.find((x) => x.key === key);
  return b ? b.miles : null;
}

module.exports = { careers, applyForm, job, assertClean, BANNED,
                   FIELDS, COMMUTE_BANDS, milesForBand, rate };
