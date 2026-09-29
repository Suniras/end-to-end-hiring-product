/* ============================================================================
   seed.js  ·  the demo dataset, built by replaying people through the engine

   One tenant, five stores, fifteen requisitions and thirty-six people. Every
   one of them invented. Sunfield Markets does not exist and neither does
   anybody in here. The tenant record carries `fictional: true` so the
   demonstration marker on the careers page is rendered FROM THE RECORD and
   cannot be removed by editing a template. U-55.

   EIGHT OF THE FIFTEEN REQUISITIONS ARE OPEN and seven are filled and closed.
   That split is the fix for the worst thing the review found in this file: ten
   seats were declared across eight requisitions and fourteen people were
   committed against them, six of them on one Cashier requisition for two, and
   nothing in the product ever closed a job. A requisition that stays open after
   it is filled reports nothing about filling an opening, and filling openings
   is what a retailer is buying. The rule is `holdsASeat` below, there is one
   copy of it, and the self-check refuses to boot a dataset that breaks it.

   WHAT THIS FILE DOES NOT DO, and it is the point of it. It writes no events,
   no durations, no funnel counts and no metrics. It creates each candidate and
   then REPLAYS them through the real workflow engine with the clock wound back
   to the day they applied, stepping it forward as they move. Every event on
   every timeline was produced by the same code path a button uses, through the
   same guards and the same actor allowlist.

   That is why the reports screen can be trusted. When it says the median
   application to offer is 3.9 days, that number came out of arithmetic over
   recorded events, not out of this file. Change a candidate's pace here and
   every reported median moves, because there is no second copy of a duration
   anywhere.

   WITHOUT THIS FILE the product boots to an empty database: no stores, no
   requisitions, and therefore no careers page, no decide queue, no reports and
   no compliance surface. It is also the only place that proves the engine can
   carry an application through all twenty steps, because it is the only thing
   that drives one the whole way.

   DETERMINISTIC, and this is a hard property rather than a nicety. There is no
   Math.random and no read of the wall clock in the replay. Spread comes from
   `CONN.spread`, an FNV-1a hash, so the same key gives the same answer on every
   boot. The one wall-clock read here is the real-time anchor the running clock
   needs, and it is injectable as `opts.now`.

   ONE FIELD BREAKS THAT AND IT IS NOT THIS FILE'S. Seeding twice with the same
   `now` produces output that differs only in `latencyMs`, on the evaluation
   metadata and on the llmCalls rows, 192 fields of it. `screening.js` measures
   how long its own rubric took with `Date.now()`, and on a fast machine that
   lands on 0 or 1 depending on where the millisecond falls. Measured by seeding
   three times and comparing: identical once `latencyMs` is masked, different
   without. A deterministic fallback has no model latency to report, so the fix
   belongs in that file rather than here, and until it lands the claim is that
   everything except that one field is byte identical.

   THE SCREENING CONVERSATION IS NOT OURS. Assembling a transcript from a
   candidate's answers and scoring it against the store's phrase bank belongs to
   `screening.js`, which the live screening path also uses. This file asks for
   it through one named collaborator and drives the state changes itself. Pass
   `opts.screening` to inject one. Without it the seed refuses to run rather
   than quietly producing a different dataset, because a demo whose candidates
   silently stopped one state short is worse than a boot that fails loudly.
   ============================================================================ */

import * as EV from './events.js';
import * as WF from './engine.js';
import * as RULES from './rules.js';
import * as CONN from './connectors.js';
import * as COMPLY from './compliance.js';
import * as MET from './metrics.js';
import * as SLOTS from '../../web/js/slots.js';
import { DISCLOSURE, careers as careersPayload } from './publicview.js';
import { ANCHOR, MIN, HOUR, DAY, addBusinessDays, fmtDate } from './clock.js';

/* Imported for its side effect, which is registering the eighteen effects into
   the engine's registry. Without it the first automatic transition throws on an
   unregistered effect name. The server imports it too and ES modules are
   evaluated once, so this cannot double-register. */
import './effects.js';

export const TENANT = 'tn_sunfield';
export const TENANT_NAME = 'Sunfield Markets';

/* ------------------------------------------------------------- the org --- */

export const ORG = {
  id: TENANT,
  name: TENANT_NAME,
  kind: 'Regional grocery and general merchandise',
  stores: 412,
  states: 14,
  hourly: 38000,
  district: 'District 12',
  districtStores: 18,
  /* Read by the careers page to render the demonstration marker. U-55. */
  fictional: true,
  note: 'Invented. Deliberately mid-market rather than big-box, because big-box is a different problem.'
};

/* `home: true` is not decoration. The careers page store filter defaults to it
   under U-84, and the deck, decide, screening and flag surfaces are all scoped
   to this store under U-43. Move the flag and five of the eight browsable jobs
   lead to an application the work surfaces cannot display. */
/* NO `openings` FIELD HERE, and that is a fix rather than an omission. A store's
   open headcount is the sum of what its own requisitions still have left, and a
   second hand-written copy of it went stale the moment anybody was hired: the
   five stores declared 4, 3, 2, 3 and 2 while their requisitions committed
   fourteen people against ten seats. The number is computed onto the store row
   at the end of seeding, from the requisitions, so there is one copy of it. */
export const STORES = [
  { key: 'ridgeway',   name: '#0417 Ridgeway',   city: 'Ridgeway',   state: 'OH', county: 'Franklin',
    manager: 'Marcus Hale',    fieldHR: 'Dana Whitfield', headcount: 84, home: true },
  /* NOT Priya Raman. `contextFor` in server/index.js gives that name to the
     DISTRICT manager, and this store's five approvals were recorded against it
     with byRole "Store manager", so the audit trail said one person held two
     jobs. U-06 switches the acting viewer to the district on stage, which is
     the exact moment somebody in the room reads both. */
  { key: 'northgate',  name: '#0392 Northgate',  city: 'Northgate',  state: 'OH', county: 'Hamilton',
    manager: 'Rhonda Kingsley', fieldHR: 'Dana Whitfield', headcount: 96 },
  { key: 'lakeside',   name: '#0455 Lakeside',   city: 'Lakeside',   state: 'OH', county: 'Cuyahoga',
    manager: 'Tomas Rivera',   fieldHR: 'Dana Whitfield', headcount: 71 },
  { key: 'brookfield', name: '#0488 Brookfield', city: 'Brookfield', state: 'IN', county: 'Marion',
    manager: 'Ada Okonkwo',    fieldHR: 'Leon Barrett',   headcount: 63 },
  { key: 'stonewell',  name: '#0501 Stonewell',  city: 'Stonewell',  state: 'KY', county: 'Jefferson',
    manager: 'Ruth Delgado',   fieldHR: 'Leon Barrett',   headcount: 58 }
];

export const HOME_STORE_KEY = 'ridgeway';

/** The one place a store id is spelled, because two spellings of it drift. */
export function storeIdOf(key) { return 'str_' + key; }

/* Field HR by hand, store managers derived from STORES, so a manager's name
   exists once. Five of the twenty-one seeded decisions were recorded against a
   store manager who had no entry here at all, which left the audit trail naming
   somebody the product could not describe. */
export const PEOPLE = (() => {
  const out = {
    dana: { key: 'dana', name: 'Dana Whitfield', role: 'Field HR', scope: 'District 12, 18 stores', type: 'human' },
    leon: { key: 'leon', name: 'Leon Barrett',   role: 'Field HR', scope: 'District 14, 15 stores', type: 'human' }
  };
  STORES.forEach((s) => {
    out[s.key] = { key: s.key, name: s.manager, role: 'Store manager',
                   scope: s.name, storeId: storeIdOf(s.key), type: 'human' };
  });
  return out;
})();

/* ===========================================================================
   THE SCORED LANGUAGE

   Two rules hold this whole section together and both of them are here because
   the product broke them once.

   S-02. The availability question is generated per requisition from that
   requisition's own requiredSlots, AND SO IS THE PHRASE BANK THAT SCORES IT. A
   phrase only enters the bank if the requisition genuinely needs that part of
   the week, so no requisition can score an answer about hours it does not want.

   S-01 and the 7 September family-status defect. NOTHING IN A SCORED PHRASE
   BANK MAY NAME A PROTECTED CHARACTERISTIC. Not childcare, not family, not an
   impairment. There is an assertion at the bottom of this section that walks
   every bank and throws at import if one appears, and it also walks the seeded
   answers, because a bank that no longer names a characteristic still quotes
   the whole answer on screen as the evidence for a downgrade.
   ======================================================================== */

/** "Monday, Tuesday and Thursday" */
function joinDays(days) {
  if (days.length === 1) return days[0];
  return days.slice(0, -1).join(', ') + ' and ' + days[days.length - 1];
}

/** The parts of the week one slot list touches, in table order. */
function partsOf(slots) {
  const seen = [];
  (slots || []).forEach((s) => {
    const p = SLOTS.partOf(s);
    if (p && seen.indexOf(p.key) < 0) seen.push(p.key);
  });
  return seen;
}

function daysOf(slots) {
  const seen = [];
  (slots || []).forEach((s) => {
    const d = SLOTS.dayOf(s);
    if (d && seen.indexOf(d.key) < 0) seen.push(d.key);
  });
  return seen;
}

/**
 * requiredSlots to a sentence a person would actually say.
 *
 * Returns null rather than a broken sentence. An empty or missing list used to
 * render "The role needs , plus undefined." An unknown key is dropped rather
 * than rendered raw, because a typo in a slot key reached a live candidate's
 * ear once.
 */
export function slotPhrase(slots) {
  if (!slots || !slots.length) return null;
  const groups = [];
  slots.forEach((s) => {
    const day = SLOTS.dayOf(s), part = SLOTS.partOf(s);
    if (!day || !part) return;
    let g = groups.find((x) => x.part === part.key);
    if (!g) { g = { part: part.key, noun: part.noun, days: [] }; groups.push(g); }
    g.days.push(day.name);
  });
  if (!groups.length) return null;
  const parts = groups.map((g) => {
    const plural = g.days.length > 1 ? g.noun + 's' : g.noun;
    return joinDays(g.days) + ' ' + plural;
  });
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(', ') + ', plus ' + parts[parts.length - 1];
}

/* The per-part phrases. `rubric()` matches by substring, so every positive is
   checked against the negatives for containment: 'i can do overnights' is not a
   substring of 'cannot do overnights', which is why the positives are written
   'i can do X' rather than 'i can'. */
const SLOT_POS = {
  open:    ['i can do early', 'early is fine', 'early opening is fine', 'mornings are fine', 'i can open'],
  evening: ['evenings are fine', 'i can do evenings', 'evenings work'],
  night:   ['overnights are fine', 'i can do overnights', 'nights are fine', 'i can do nights']
};
const SLOT_NEG = {
  open:    ['cannot do early', 'no early starts', 'no mornings'],
  evening: ['no evenings', 'cannot do evenings'],
  night:   ['no overnights', 'cannot do overnights', 'no nights', 'cannot do nights']
};
const WEEKEND_DAYS = ['sat', 'sun'];
const WEEKDAY_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];

/* The phrases each half of the week contributes, named rather than written
   inline, because the check at the bottom of this file has to test membership
   of exactly these lists. Substring-matching the word "weekend" was wrong in
   both directions: 'only weekends' is a legitimate concern on a weekday role,
   and it is the weekday branch that adds it. */
const WEEKEND_POS = ['weekends work', 'i can do weekends', 'weekends are fine'];
const WEEKEND_NEG = ['cannot do weekends', 'no weekends', 'only weekdays'];
const WEEKDAY_NEG = ['only weekends'];

/**
 * The positive and concern phrases for one requisition's shift pattern.
 *
 * Weekend and weekday language enters only when that half of the week is
 * genuinely required. That is the whole of S-02: before it, eleven of thirty
 * evaluations scored availability as met on a requisition needing no weekend,
 * because the answer said "weekends work", and a candidate who said "I can only
 * do weekdays" was forced to not_met on an overnight job that never wanted a
 * weekend.
 */
export function slotPhraseBank(slots) {
  const parts = partsOf(slots);
  const days = daysOf(slots);
  const pos = ['i am free', 'flexible', 'that works for me'];
  const neg = [];
  parts.forEach((p) => {
    (SLOT_POS[p] || []).forEach((x) => pos.push(x));
    (SLOT_NEG[p] || []).forEach((x) => neg.push(x));
  });
  if (WEEKEND_DAYS.some((d) => days.indexOf(d) >= 0)) {
    WEEKEND_POS.forEach((x) => pos.push(x));
    WEEKEND_NEG.forEach((x) => neg.push(x));
  }
  if (WEEKDAY_DAYS.some((d) => days.indexOf(d) >= 0)) {
    WEEKDAY_NEG.forEach((x) => neg.push(x));
  }
  return { positivePhrases: pos, concernPhrases: neg };
}

/**
 * The whole availability question for one requisition.
 *
 * S-03. THERE IS NO DEFAULT TEXT. The sentence this replaced survived as a
 * default value, so any requisition built without an override got the defective
 * one straight back, and B-11 makes requisitions creatable at runtime rather
 * than only in the seed. A requisition with no required slots asks an open
 * question and scores nothing, because there is no shift pattern to score
 * against.
 */
export function availabilityQuestion(slots) {
  const phrase = slotPhrase(slots);
  const base = { key: 'availability', criterion: 'availability_fit' };
  if (!phrase) {
    return Object.assign(base, {
      text: 'What days and times are you able to work?',
      positivePhrases: [], concernPhrases: [],
      concernLabel: 'No shift pattern is recorded against this role'
    });
  }
  return Object.assign(base, slotPhraseBank(slots), {
    text: 'The role needs ' + phrase + '. Does that work with everything else you have on?',
    concernLabel: 'Availability may not cover the shift pattern'
  });
}

/* The questions that are the same whatever the shift pattern. The customer owns
   these and edits them. */
export const QUESTIONS = {
  reliability: {
    key: 'reliability', criterion: 'reliability',
    text: 'Tell me about a time you had to get somewhere on time when it was difficult.',
    positivePhrases: ['i left early', 'i planned', 'never been late', 'i always', 'i made sure', 'set two alarms'],
    /* TWO PHRASES DELETED HERE, 'transport is a problem' and 'no car and no bus',
       and the check at the end of this section now refuses to let them back.

       They scored how a person gets to work rather than whether they got there.
       Vehicle access is a long-established disparate impact proxy in US hiring,
       so the employer would be defending job relatedness and business necessity
       under 42 U.S.C. 2000e-2(k) with a less discriminatory alternative sitting
       in the same answer: score the lateness, which is what the two phrases
       below do. It also read badly on screen. Three seeded candidates carried
       "no car and no bus that runs early" as the quoted adverse evidence, and
       `quoteFor` keeps only the sentences that matched, so deleting the phrases
       takes the sentence off the record as evidence while leaving it in the
       transcript where the candidate's own words belong. */
    concernPhrases: ['i overslept', 'i was late a lot'],
    concernLabel: 'Getting to shifts on time may be difficult'
  },
  customer: {
    key: 'customer', criterion: 'customer_manner',
    text: 'A customer is angry about something that is not your fault. Walk me through what you do.',
    positivePhrases: ['listen', 'apologise', 'apologize', 'stay calm', 'find a manager', 'sort it out', 'let them finish'],
    concernPhrases: ['argue', 'tell them they are wrong', 'walk away', 'not my problem', 'ignore'],
    concernLabel: 'Response to an angry customer is a concern'
  },
  physical: {
    key: 'physical', criterion: 'physical_requirements',
    /* The words "with or without reasonable accommodation" are the clause that
       makes this an essential-job-function question rather than a health
       question. They are not optional decoration. */
    text: 'This role requires standing for a full shift and lifting up to 25 pounds. ' +
          'Can you perform those duties, with or without reasonable accommodation?',
    /* S-01. The criterion is scored on one thing: whether the person affirms
       they can perform the essential duties. A concern fires only on an
       unambiguous statement that they cannot, and never on the reason. An
       unclear answer scores partly_met and goes to a person, which is what the
       accommodation conversation is.

       'i can' is deliberately absent as a positive, because `rubric()` matches
       by substring and it matched inside 'i cannot'. */
    positivePhrases: ['yes', 'i can do', 'i can lift', 'i can stand', 'no problem',
                      'used to it', 'done that before', 'that is fine'],
    /* TWO PHRASES DELETED HERE, 'i cannot lift' and 'i cannot stand', and the
       case that killed them was produced live by a reviewer rather than found in
       the seeded data.

       Answer: "I cannot stand for eight hours straight because I had spinal
       surgery last year. With a stool at the till I can do a full shift no
       problem, I did exactly that at my last store."

       That is a yes with an accommodation, which is precisely what the question
       invites when it says "with or without reasonable accommodation". The old
       bank scored it not_met on 'i cannot stand' and quoted the sentence naming
       the operation as the adverse evidence, because one concern hit outranks
       any number of positives and the quote keeps only the sentences that
       matched. An answer disclosing a disability used as the basis for a
       downgrade is 42 U.S.C. 12112(d) and 29 CFR 1630.13, and the sentence
       where she confirms she can do the job never appeared on the record at all.

       So a concern here fires only on an unambiguous statement that they cannot
       do the JOB. A limitation with no accommodation named hits no phrase at
       all, scores partly_met and goes to a person, which is the accommodation
       conversation and the whole of S-01.

       WHAT THIS DOES NOT FIX, and it is recorded so nobody thinks it does. The
       rubric in screening.js still lets one concern hit outrank any number of
       positives, still quotes only the matching sentences, and still has no
       route for an accommodation request. Those are that file's to fix. */
    concernPhrases: ['i cannot perform', 'i cannot do that', 'i cannot do the job', 'i could not do that'],
    concernLabel: 'Did not confirm they can perform the essential duties'
  },
  food: {
    key: 'food', criterion: 'food_safety',
    text: 'Have you handled fresh food at work before, and do you hold a food handler card?',
    positivePhrases: ['food handler', 'servsafe', 'yes i have', 'deli', 'kitchen', 'i held'],
    concernPhrases: ['never', 'no idea', 'what is that'],
    concernLabel: 'No food handling background stated'
  }
};

/* ---------------------------------------- what a decision reason must say ---
   These two lists exist for the self-check at the bottom of the file and for
   nothing else. They are how it tells a reason that engages with the evidence
   from a reason that is decoration.

   The first is the vocabulary a manager would use about each criterion. If a
   screening left a criterion partly met or not met and the person hired or
   rejected them anyway, the reason has to say something about that criterion,
   using one of these words. Nineteen of twenty-one decisions once carried one
   sentence about "screening evidence" and "the shift pattern", which engaged
   with nothing.

   The second is the vocabulary of an override. Where the decision goes against
   the recommendation, the reason has to say so in writing, because an
   unexplained departure from the process is exactly what a plaintiff points at,
   and because a manager overriding an assessment is a good demo beat as long as
   the record shows it happening.
   -------------------------------------------------------------------------- */

const CRITERION_WORDS = {
  reliability:           ['reliab', 'late', 'oversl', 'turn up', 'turning up', 'on time', 'alarm'],
  customer_manner:       ['customer', 'shopper', 'complaint', 'angry'],
  availability_fit:      ['avail', 'hours', 'shift', 'rota', 'evening', 'early', 'overnight', 'weekend'],
  physical_requirements: ['stand', 'lift', 'feet', 'duties', 'accommodat', 'twenty five'],
  food_safety:           ['food', 'card', 'servsafe', 'allergen', 'temperature', 'hygiene']
};

const OVERRIDE_WORDS = [
  'overrid', 'not taking it', 'taking her anyway', 'taking him anyway', 'taking them anyway',
  'against the recommendation', 'came back as review', 'despite', 'even though',
  'my call', 'my judgement'
];

export const CRITERIA = {
  reliability:           { key: 'reliability',           description: 'Evidence they turn up when they said they would.' },
  customer_manner:       { key: 'customer_manner',       description: 'How they handle a customer who is upset, in their own words.' },
  availability_fit:      { key: 'availability_fit',      description: 'Whether the hours they offer match the hours the role needs.' },
  physical_requirements: { key: 'physical_requirements', description: 'Whether they can stand a full shift and lift to 25 pounds.' },
  food_safety:           { key: 'food_safety',           description: 'Any prior fresh food handling, and a food handler card if they hold one.' }
};

/* ===========================================================================
   THE REQUISITIONS

   OPENINGS ARE A REAL COUNT NOW, and this is the fix a retail operations person
   asked for in the review. What was here before declared ten seats across eight
   requisitions and then committed fourteen people to them: six people past the
   decision on a Cashier requisition for two, three on a Deli Associate role for
   one, and a Bakery Assistant role that had been filled in April still on the
   careers page. Their words: if the product is about to put six cashiers into
   two slots then it does not understand what a requisition is, and every number
   downstream of it is measuring the wrong object.

   Two things changed and both were needed.

   The seat counts below are at least as large as the number of people
   committed against them, which is the property that was broken. The counts
   themselves are invented, like everything else in here, and no source says a
   front end hires four cashiers at a time while a service desk hires one. They
   are sized so no requisition is over-committed and so at least one seat is
   left at the home store for somebody to be hired into on stage.

   And the people hired weeks or months ago sit on the requisition they were
   actually hired against, not on the one that is open now. Those earlier rounds
   are in EARLIER_ROUNDS, they are full, and the driver closes them. That is why
   there are three Cashier requisitions at Ridgeway: the store filled two, then
   opened another when people left. A requisition that stays open after it is
   filled cannot report anything about filling an opening, which is the only
   thing the buyer said they buy.
   ======================================================================== */

const OPEN_REQUISITIONS = [
  { key: 'cashier_ridgeway', storeKey: 'ridgeway', title: 'Cashier', openings: 4,
    minAge: 16, rateCents: 1650, hoursPerWeek: 28,
    requiredSlots: ['sat_evening', 'sun_evening', 'wed_open'], maxDistanceMiles: 20,
    requiresManagerInterview: false,
    criteria: ['reliability', 'customer_manner', 'availability_fit'],
    questions: ['availability', 'reliability', 'customer'],
    summary: 'Front-end tills, customer queries, some stocking during quiet periods.' },

  { key: 'stocker_ridgeway', storeKey: 'ridgeway', title: 'Overnight Stocker', openings: 2,
    minAge: 18, rateCents: 1810, hoursPerWeek: 32,
    requiredSlots: ['mon_night', 'tue_night', 'thu_night'], maxDistanceMiles: 25,
    requiresManagerInterview: false,
    criteria: ['reliability', 'physical_requirements', 'availability_fit'],
    questions: ['availability', 'reliability', 'physical'],
    summary: 'Overnight replenishment, pallet work, equipment use. Eighteen and over for the equipment.' },

  { key: 'deli_ridgeway', storeKey: 'ridgeway', title: 'Deli Associate', openings: 2,
    minAge: 18, rateCents: 1740, hoursPerWeek: 30,
    requiredSlots: ['sat_open', 'sun_open'], maxDistanceMiles: 20,
    requiresManagerInterview: true,
    criteria: ['reliability', 'customer_manner', 'food_safety', 'availability_fit'],
    questions: ['availability', 'reliability', 'customer', 'food'],
    summary: 'Fresh counter, slicing, food safety records. A manager interview is required for fresh food roles.' },

  { key: 'cashier_northgate', storeKey: 'northgate', title: 'Cashier', openings: 2,
    minAge: 16, rateCents: 1650, hoursPerWeek: 24,
    requiredSlots: ['fri_evening', 'sat_evening'], maxDistanceMiles: 20,
    requiresManagerInterview: false,
    criteria: ['reliability', 'customer_manner', 'availability_fit'],
    questions: ['availability', 'reliability', 'customer'],
    summary: "Front-end tills at the district's busiest store." },

  { key: 'curbside_northgate', storeKey: 'northgate', title: 'Curbside Picker', openings: 2,
    minAge: 16, rateCents: 1690, hoursPerWeek: 26,
    requiredSlots: ['sat_open', 'sun_open', 'wed_open'], maxDistanceMiles: 15,
    requiresManagerInterview: false,
    criteria: ['reliability', 'physical_requirements', 'availability_fit'],
    questions: ['availability', 'reliability', 'physical'],
    summary: 'Picking online orders and loading cars. Outdoors in all weather.' },

  { key: 'bakery_lakeside', storeKey: 'lakeside', title: 'Bakery Assistant', openings: 2,
    minAge: 18, rateCents: 1780, hoursPerWeek: 30,
    requiredSlots: ['mon_open', 'wed_open', 'fri_open'], maxDistanceMiles: 20,
    requiresManagerInterview: true,
    criteria: ['reliability', 'food_safety', 'physical_requirements', 'availability_fit'],
    questions: ['availability', 'reliability', 'food', 'physical'],
    summary: 'Early starts, oven work, allergen labelling.' },

  { key: 'meat_brookfield', storeKey: 'brookfield', title: 'Meat Clerk', openings: 2,
    minAge: 18, rateCents: 1920, hoursPerWeek: 34,
    requiredSlots: ['tue_open', 'thu_open', 'sat_open'], maxDistanceMiles: 25,
    requiresManagerInterview: true,
    criteria: ['reliability', 'food_safety', 'physical_requirements', 'availability_fit'],
    questions: ['availability', 'reliability', 'food', 'physical'],
    summary: 'Cutting room, cold environment, strict temperature records.' },

  { key: 'service_stonewell', storeKey: 'stonewell', title: 'Customer Service Desk', openings: 1,
    minAge: 18, rateCents: 1760, hoursPerWeek: 28,
    requiredSlots: ['fri_evening', 'sat_open', 'sun_open'], maxDistanceMiles: 20,
    requiresManagerInterview: false,
    criteria: ['reliability', 'customer_manner', 'availability_fit'],
    questions: ['availability', 'customer', 'reliability'],
    summary: 'Returns, complaints, money services. The hardest customer conversations in the building.' }
];

/**
 * Is one application holding a seat on its requisition.
 *
 * ONE COPY OF THIS RULE, because two copies of a counting rule is how a page
 * and a guard come to disagree about whether a job is full.
 *
 * Approved, and not ended since. The seat is taken from the moment a person
 * approves the hire and not when the offer is accepted, because sending more
 * offers than there are jobs is how two people accept for one slot and one of
 * them has already resigned somewhere else. It comes back when the application
 * ends, which is why Northgate is still hiring after Silas Marchetti took a
 * job elsewhere.
 *
 * `lost` is read off the state table, so a state added later is classified by
 * the table rather than by a list kept in here.
 *
 * The engine needs this same rule at runtime, so that an approval cannot
 * over-commit a requisition and a fill closes it. That is a change in files
 * this one does not own and it is recorded as a handoff rather than guessed at
 * from here.
 */
export function holdsASeat(store, tenantId, app) {
  if (!app || !app.decisionId) return false;
  const dec = store.byId('decisions', tenantId, app.decisionId);
  if (!dec || dec.outcome !== 'approved') return false;
  const state = WF.STATES[app.state];
  return !(state && state.lost);
}

/**
 * The requisitions these stores already filled.
 *
 * Same job, earlier round, and every seat on them is taken, so the driver
 * closes them and the careers page stops advertising them. `publicview.careers`
 * already filters on status, and `intake.js` already refuses an application to
 * a requisition that is not open, so closing one is enough to stop both.
 *
 * The role definition is shared with the open requisition rather than copied,
 * because it is the same job. Only the seat count and the key differ.
 */
const EARLIER_ROUNDS = [
  { key: 'cashier_ridgeway_r1',  sameRoleAs: 'cashier_ridgeway',  openings: 1 },
  { key: 'cashier_ridgeway_r2',  sameRoleAs: 'cashier_ridgeway',  openings: 2 },
  { key: 'stocker_ridgeway_r1',  sameRoleAs: 'stocker_ridgeway',  openings: 1 },
  { key: 'deli_ridgeway_r1',     sameRoleAs: 'deli_ridgeway',     openings: 2 },
  { key: 'cashier_northgate_r1', sameRoleAs: 'cashier_northgate', openings: 1 },
  { key: 'bakery_lakeside_r1',   sameRoleAs: 'bakery_lakeside',   openings: 1 },
  { key: 'service_stonewell_r1', sameRoleAs: 'service_stonewell', openings: 1 }
];

export const REQUISITIONS = OPEN_REQUISITIONS.concat(EARLIER_ROUNDS.map((r) => {
  const base = OPEN_REQUISITIONS.find((x) => x.key === r.sameRoleAs);
  if (!base) {
    throw new Error('earlier round "' + r.key + '" says it is the same role as "' + r.sameRoleAs +
                    '", and there is no open requisition with that key.');
  }
  return Object.assign({}, base, { key: r.key, openings: r.openings });
}));

/* Where applications come from. `kind` is the channel and it lives here rather
   than on each cast row, so the sources page reads one classification. */
export const SOURCES = [
  { name: 'Career site, mobile',        kind: 'owned'  },
  { name: 'Career site, desktop',       kind: 'owned'  },
  { name: 'Indeed',                     kind: 'board'  },
  { name: 'Google for Jobs',            kind: 'board'  },
  { name: 'Adzuna',                     kind: 'board'  },
  { name: 'Jooble',                     kind: 'board'  },
  { name: 'Referral from a colleague',  kind: 'direct' },
  { name: 'QR code in store',           kind: 'direct' },
  { name: 'Walk-in',                    kind: 'direct' }
];

export const BOARDS = ['Careers site', 'Indeed', 'Google for Jobs', 'Adzuna', 'Jooble'];

/* ===========================================================================
   THE ANSWER LIBRARY

   The availability answer is GENERATED from the requisition's own slots, the
   same way the question and the phrase bank are. In the previous build it was
   one fixed sentence about weekend evenings, which is true of the Ridgeway
   Cashier and of nothing else, so a candidate on the Overnight Stocker was
   scored on an answer about hours the role never wanted.

   Everything in here is written so that no seeded answer names a protected
   characteristic. The bank no longer scores on one, but `rubric()` quotes the
   WHOLE answer as the evidence for a concern, so an answer that gives a reason
   would put that reason on screen next to a downgrade. The unavailability is
   therefore stated as hours and never as a reason.
   ======================================================================== */

const PART_YES = {
  open:    'Early is fine, I am usually up anyway.',
  evening: 'Evenings work, I would rather have the evenings.',
  night:   'Overnights are fine, I have done nights before.'
};
const PART_MAYBE = {
  open:    'The early opening I would need to check but I think it would work.',
  evening: 'Evenings should be all right most weeks.',
  night:   'Overnights I could do, I would want to try one first.'
};
const PART_NO = {
  open:    'No early starts.',
  evening: 'No evenings after six.',
  night:   'No overnights.'
};

/**
 * The availability answer for one requisition, at one of three levels.
 *
 * `yes` is written to hit at least two phrases from that requisition's own
 * bank, so every `met` verdict on availability in the seeded data is supported
 * by two or more phrases the store owns. That is the property S-02 was verified
 * against and the reason the answer is generated rather than fixed.
 */
function availabilityAnswer(slots, level) {
  const parts = partsOf(slots);
  const days = daysOf(slots);
  const weekend = WEEKEND_DAYS.some((d) => days.indexOf(d) >= 0);
  if (!parts.length) return 'I am fairly open. Tell me what the hours are and I will say.';
  if (level === 'no') {
    return 'I can only do weekdays really. ' + parts.map((p) => PART_NO[p]).join(' ');
  }
  if (level === 'maybe') {
    return parts.map((p) => PART_MAYBE[p]).join(' ');
  }
  return parts.map((p) => PART_YES[p]).join(' ') +
         (weekend ? ' Weekends work for me too.' : '') +
         ' That works for me.';
}

/* THE ANSWERS ARE GROUPED BY WORK HISTORY, and that is a fix rather than a
   flourish.

   Before this there was one `good` set, so fifteen of the twenty-one people the
   manager approves gave word for word the same four answers, and the experience
   line on the candidate record came from a hash of their name. The record
   contradicted itself in public: Bianca Osei's history read "No paid work yet,
   finishing school" beside her own answer about a year on a deli counter. A
   buyer who opens two candidate records and finds the same transcript twice, or
   one record arguing with itself, stops reading.

   So a set is one coherent person: their history, and the four answers that
   history would produce. `experience` lives in the set for that reason. A cast
   row may override it with `exp` where the person's story is more specific,
   such as a returning worker.

   Every set is written against the phrase banks above, and the counts matter.
   A `met` verdict needs two positive hits, so each good set hits at least two
   on the criteria its roles score. Where a set genuinely cannot answer a
   criterion, it hits nothing and scores partly_met, which is the honest result
   and goes to a person: the warehouse picker has no food handler card and the
   Meat Clerk needs one. */
const ANSWER_SETS = {
  good_garden: {
    avail: 'yes',
    experience: 'Two years at a garden centre, front of house.',
    reliability: 'At the garden centre I left early every day so I would be there twenty minutes before ' +
                 'the shift started. I have never been late in two years.',
    customer: 'I would let them finish first, then apologise for the situation even if it is not my ' +
              'doing, and sort it out if I can. If it is above me I find a manager rather than leave ' +
              'them standing there.',
    physical: 'Yes, I can do a full shift on my feet. Bags of compost weigh more than twenty five ' +
              'pounds and I was carrying those all day, so I am used to it.',
    food: 'Not fresh food, no. I handled bagged compost and seed, and I would sit the food handler ' +
          'course if the role needs it.'
  },

  good_warehouse: {
    avail: 'yes',
    experience: 'Warehouse picking, eighteen months, mostly nights.',
    reliability: 'I planned the night before every shift and I set two alarms. Eighteen months of it ' +
                 'and I made sure I was on the floor before the pick started.',
    customer: 'I would stay calm and listen until they have finished, then say sorry for the trouble ' +
              'and sort it out. If it needs signing off I find a manager.',
    physical: 'Yes I can lift that. We had a twenty five pound cap on a single box and I was moving ' +
              'those all night. Standing is no problem.',
    food: 'I picked chilled and frozen orders in the warehouse and I know the temperature rules. No ' +
          'card of my own yet, and I would sit the course.'
  },

  good_deli: {
    avail: 'yes',
    experience: 'Supermarket deli counter, one year.',
    reliability: 'I always came in for the counter set up before the store opened and I made sure the ' +
                 'case was full before the first customer. I have never been late for an opening shift.',
    customer: 'Let them finish, apologise, then fix what I can. On the counter it is usually a wrong ' +
              'weight or a missing order, so I sort it out at the scale, and if it is a refund I find ' +
              'a manager.',
    physical: 'Yes. A deli shift is standing the whole time and the meat boxes are about that weight, ' +
              'so I have done that before.',
    food: 'Yes I have, a year on the deli counter, and I held a food handler card. It may have lapsed ' +
          'and I would renew it.'
  },

  good_fastfood: {
    avail: 'yes',
    experience: 'Fast food, one year, closing shifts.',
    reliability: 'I set two alarms and I planned the night before. I was on the closing rota so ' +
                 'somebody was waiting on me, and I have never been late for one.',
    customer: 'I stay calm and let them finish. Then I apologise for the wait and sort it out, and if ' +
              'they want somebody above me I find a manager.',
    physical: 'Yes, a closing shift is eight hours on your feet and I did five of those a week, so I ' +
              'am used to it. Twenty five pounds is fine.',
    food: 'Yes I have, a year in a kitchen on the fryers and the grill, and I did the food handler ' +
          'training there.'
  },

  good_care: {
    avail: 'yes',
    experience: 'Care work, three years, nights.',
    reliability: 'Handover does not wait, so I always got there early enough to take it properly. ' +
                 'Three years of nights and I have never been late for one.',
    customer: 'Let them finish, then apologise and stay calm even if they are shouting. In care you ' +
              'learn to sort it out without taking it personally, and if it is above me I find a manager.',
    physical: 'Yes I can stand a full shift, that is what a night in care is. We used a hoist for ' +
              'anything heavy, and twenty five pounds I can lift on my own.',
    food: 'I plated and served meals on the unit and filled in the allergen sheets. No card of my own, ' +
          'and I would take the course.'
  },

  good_school: {
    avail: 'yes',
    experience: 'No paid work yet, finishing school.',
    reliability: 'I have not missed a day of school this year. I planned my exam mornings the same way ' +
                 'and I made sure I was there before the register.',
    customer: 'I would listen and let them finish, say sorry for the trouble, then find a manager, ' +
              'because I would not know the refund rules yet.',
    physical: 'Yes, I can do that. I am on my feet all day at school and I play five a side twice a ' +
              'week, so standing is no problem.',
    food: 'No, I have not worked with food. I would get the food handler card if it is needed.'
  },

  ok: {
    avail: 'maybe',
    experience: 'One year in a shop, part time.',
    reliability: 'I try to plan ahead. I set two alarms. There was one morning I was cutting it close ' +
                 'and I called ahead straight away.',
    customer: 'Stay calm and listen. Then find a manager if it is above me.',
    physical: 'Yes I can do that, I have done that before at a previous job.',
    food: 'I have done kitchen work before, yes. No card but I would get one.'
  },

  /* THE WEAK RELIABILITY ANSWER NO LONGER MENTIONS A CAR OR A BUS, and the
     reason is the same one that took those phrases out of the bank above. Three
     seeded people carried "no car and no bus that runs early" and it reached the
     screen as the quoted adverse evidence for a downgrade. The words are ours,
     not a real person's, so there is no record being falsified by writing the
     answer about the thing the role actually cares about, which is whether they
     got there. The lateness is still here and still scores. */
  weak: {
    avail: 'maybe',
    experience: 'Six months in a warehouse, then out of work.',
    reliability: 'I overslept a couple of times at my last place and I got a warning for it. I have ' +
                 'been better since, but that is the honest answer.',
    customer: 'Stay calm and listen. Then find a manager if it is above me.',
    physical: 'Yes I can do that, I have done that before at a previous job.',
    food: 'I have done kitchen work before, yes. No card but I would get one.'
  },

  bad: {
    avail: 'no',
    experience: 'Fast food, three months.',
    reliability: 'I overslept a couple of times at my last place and I got a warning for it. Mornings ' +
                 'are not my strong point.',
    customer: 'Honestly if they are being rude I would tell them they are wrong. It is not my problem ' +
              'if head office made a mistake.',
    /* Deliberately unclear rather than a disclosure. It scores partly_met with no
       concern raised and nothing quoted as adverse evidence, which is the S-01
       behaviour, and it invites the accommodation conversation without putting a
       condition on the record. */
    physical: 'I am not sure. A full shift standing would be a stretch and I would want to talk about it.',
    food: 'Never done food. What is a food handler card?'
  },

  thin: {
    avail: 'thin',
    experience: 'Nothing stated.',
    reliability: 'Yeah.',
    customer: 'I would rather talk about that in person.',
    physical: 'Yeah.',
    food: 'Yeah.'
  }
};

const THIN_ANSWER = ANSWER_SETS.thin.reliability;

/**
 * The answer map one candidate carries, built against their own requisition.
 *
 * `overrides` swaps one question's answer for the same question out of another
 * set. It exists so one person in the decision queue can carry the unclear
 * answer to the physical question. Without somebody doing that, the S-01
 * behaviour is not present anywhere in the seeded data and the first live
 * candidate on 20 September is the first thing to exercise it.
 *
 * There is no `in_person` answer here any more. The manager's interview note
 * used to live in the answer set, so seven people carried the identical note,
 * and it sat in the candidate's answer map as though the candidate had said it.
 * It is the manager's own words, it is the whole record of steps 4 and 5
 * because no model reads it and no model scores it, and it now travels on the
 * cast row and goes in through the INTERVIEW_COMPLETE transition.
 */
function answersFor(ansKey, slots, overrides) {
  const set = ANSWER_SETS[ansKey];
  if (!set) throw new Error('no answer set called "' + ansKey + '"');
  const availability = set.avail === 'thin' ? THIN_ANSWER : availabilityAnswer(slots, set.avail);
  const out = {
    availability,
    reliability: set.reliability,
    customer: set.customer,
    physical: set.physical,
    food: set.food
  };
  Object.keys(overrides || {}).forEach((q) => {
    const from = ANSWER_SETS[overrides[q]];
    if (!from) throw new Error('answer override for "' + q + '" names set "' + overrides[q] + '", which does not exist');
    if (q === 'availability') {
      out.availability = from.avail === 'thin' ? THIN_ANSWER : availabilityAnswer(slots, from.avail);
    } else {
      if (from[q] === undefined) throw new Error('answer set "' + overrides[q] + '" has no answer for "' + q + '"');
      out[q] = from[q];
    }
  });
  return out;
}

/* --------------------------------------------------- the fairness assertion --
   Every one of these has been in a scored phrase bank or a seeded answer at
   some point in this project, and each time the product then quoted it on
   screen as the evidence for marking somebody down. The check runs at import,
   so putting one back is a boot failure rather than a screen nobody looked at.
   -------------------------------------------------------------------------- */

const PROTECTED_LANGUAGE = [
  'childcare', 'child care', 'children', 'kids', 'family', 'spouse', 'husband', 'wife',
  'pregnan', 'disab', 'my back', 'i would struggle', 'wheelchair', 'medication',
  'church', 'religio', 'married', 'immigrant', 'my accent', 'my age', 'my race',
  /* Added after review. A live applicant answering the physical question with a
     medical fact is the case this list was written for and none of these words
     were on it, so an answer naming an operation or a treatment could still be
     quoted on screen as the evidence for a downgrade. */
  'surgery', 'spinal', 'chemo', 'my hip', 'sclerosis', 'diagnos', 'therapy',
  'my condition', 'my illness'
];

/* A SECOND AND DIFFERENT RULE, and the difference is the whole reason it is a
   separate list.

   These name no protected characteristic. They are PROXIES: facts that stand in
   for one closely enough that scoring them produces the same outcome without
   ever saying so. How somebody gets to work, who they live with, and how far
   away they live are the three that turn up in frontline hiring.

   So this list is checked against the SCORED BANKS ONLY and never against the
   answers. A candidate who volunteers that they have no car has said something
   about their life, and their words stay in the transcript. What may not happen
   is the product turning that sentence into a score or quoting it as the
   evidence for a concern.

   Matched on whole words, because substrings were wrong in both directions:
   'car' sits inside 'care', and 'lift' means a ride in one sense and twenty
   five pounds in another, so 'lift' is deliberately absent and 'i can lift'
   stays a legitimate positive on the physical question. */
const PROXY_LANGUAGE = [
  'car', 'cars', 'bus', 'buses', 'train', 'trains', 'subway', 'metro', 'taxi',
  'bike', 'bicycle', 'moped', 'scooter', 'carpool', 'ride', 'rides', 'licence',
  'license', 'commute', 'commuting', 'transport', 'transportation',
  'mile', 'miles', 'far', 'distance', 'household', 'roommate', 'partner',
  'babysitter', 'sitter', 'zip', 'neighbourhood', 'neighborhood'
];

function scanForProtectedLanguage(text, where, found) {
  const low = String(text || '').toLowerCase();
  PROTECTED_LANGUAGE.forEach((w) => {
    if (low.indexOf(w) >= 0) found.push(where + ': "' + w + '" in "' + text + '"');
  });
}

function scanForProxyLanguage(phrase, where, found) {
  const words = String(phrase || '').toLowerCase().split(/[^a-z]+/).filter(Boolean);
  PROXY_LANGUAGE.forEach((w) => {
    if (words.indexOf(w) >= 0) {
      found.push(where + ': scored phrase "' + phrase + '" names "' + w + '", which is a proxy for a ' +
                 'protected characteristic rather than a fact about the job');
    }
  });
}

export function assertNothingScoresAProtectedCharacteristic() {
  const found = [];

  Object.keys(QUESTIONS).forEach((k) => {
    const q = QUESTIONS[k];
    (q.positivePhrases || []).forEach((p) => scanForProtectedLanguage(p, 'question ' + k + ' positive', found));
    (q.concernPhrases || []).forEach((p) => scanForProtectedLanguage(p, 'question ' + k + ' concern', found));
    (q.positivePhrases || []).forEach((p) => scanForProxyLanguage(p, 'question ' + k + ' positive', found));
    (q.concernPhrases || []).forEach((p) => scanForProxyLanguage(p, 'question ' + k + ' concern', found));
  });

  REQUISITIONS.forEach((r) => {
    const bank = availabilityQuestion(r.requiredSlots);
    (bank.positivePhrases || []).forEach((p) => scanForProtectedLanguage(p, r.key + ' availability positive', found));
    (bank.concernPhrases || []).forEach((p) => scanForProtectedLanguage(p, r.key + ' availability concern', found));
    (bank.positivePhrases || []).forEach((p) => scanForProxyLanguage(p, r.key + ' availability positive', found));
    (bank.concernPhrases || []).forEach((p) => scanForProxyLanguage(p, r.key + ' availability concern', found));
    /* The answers too. The bank scoring nothing protected is only half the fix,
       because the evidence quoted on screen is the whole answer. */
    Object.keys(ANSWER_SETS).forEach((set) => {
      const answers = answersFor(set, r.requiredSlots);
      /* Every override any cast member uses, checked against every requisition,
         because an override is a phrase reaching a screen like any other. */
      CAST.forEach((spec) => {
        if (!spec.answerOverrides) return;
        const over = answersFor(spec.ans, r.requiredSlots, spec.answerOverrides);
        Object.keys(over).forEach((qk) => {
          scanForProtectedLanguage(over[qk], r.key + ' override ' + qk, found);
        });
      });
      Object.keys(answers).forEach((qk) => {
        scanForProtectedLanguage(answers[qk], r.key + ' ' + set + ' answer ' + qk, found);
      });
    });
  });

  /* The prose the cast rows carry, because all three of these render. A work
     history sits on the candidate record, an interview note is the whole
     record of steps 4 and 5, and a decision reason is the audit trail. None of
     them is scored, so the proxy rule does not apply to them, but a protected
     characteristic in any of them is on screen beside a decision. */
  CAST.forEach((spec) => {
    const who = spec.first + ' ' + spec.last;
    scanForProtectedLanguage(spec.exp, who + ' work history', found);
    scanForProtectedLanguage(spec.interviewNote, who + ' interview note', found);
    scanForProtectedLanguage(spec.decidedBecause, who + ' decision reason', found);
    scanForProtectedLanguage(spec.persona, who + ' persona', found);
  });
  Object.keys(ANSWER_SETS).forEach((k) => {
    scanForProtectedLanguage(ANSWER_SETS[k].experience, 'answer set ' + k + ' work history', found);
  });

  /* Substring matching means a positive contained inside a concern silently
     never fires. 'i can' inside 'i cannot' cost a real defect. */
  const overlaps = [];
  const banks = Object.keys(QUESTIONS).map((k) => ({ where: k, q: QUESTIONS[k] }))
    .concat(REQUISITIONS.map((r) => ({ where: r.key + ' availability', q: availabilityQuestion(r.requiredSlots) })));
  banks.forEach(({ where, q }) => {
    (q.positivePhrases || []).forEach((p) => {
      (q.concernPhrases || []).forEach((n) => {
        if (n.indexOf(p) >= 0) overlaps.push(where + ': positive "' + p + '" is inside concern "' + n + '"');
      });
    });
  });

  if (found.length || overlaps.length) {
    throw new Error(
      'seed.js refuses to load. ' +
      (found.length ? found.length + ' scored phrase(s) or seeded answer(s) name a protected ' +
        'characteristic, or a scored phrase names a proxy for one: ' + found.join('; ') + '. ' : '') +
      (overlaps.length ? overlaps.length + ' positive phrase(s) sit inside a concern phrase, so the ' +
        'positive can never fire: ' + overlaps.join('; ') + '.' : '')
    );
  }
}

/* ===========================================================================
   THE CAST

   `stage` is where each person is meant to end up. The driver replays them
   there through the real engine rather than writing the state directly, so a
   stage that the state machine will not allow is a crash and not a wrong row.

   `daysAgo` is how long ago they applied. For the stages past the first day of
   work it is sized so the whole journey plus the tenure lands BEFORE the
   demo's present. The previous build sized these by eye and dated the day 30
   check-in of one candidate after the present, which is an event about the past
   with a future timestamp. There is an assertion at the end that no event is
   dated after the present.
   ======================================================================== */

export const CAST = [
  /* ---- fresh, sitting in the screening queue. The live model demo runs on
     these, so they are deliberately left unevaluated. */
  { first: 'Alicia',  last: 'Reyes',       req: 'cashier_ridgeway',   stage: 'SCREENING_PENDING', daysAgo: 0.4, src: 0,
    ans: 'good_school', age: 17,
    persona: 'Eligible and queued for screening, with nothing scored on her yet. This is the one to run a live screening against.' },
  { first: 'Devon',   last: 'Whitaker',    req: 'stocker_ridgeway',   stage: 'SCREENING_PENDING', daysAgo: 0.6, src: 2,
    ans: 'good_care',
    persona: 'Three years of night work applying for a night job. Queued, not scored.' },
  { first: 'Nia',     last: 'Okafor',      req: 'curbside_northgate', stage: 'SCREENING_PENDING', daysAgo: 0.3, src: 3,
    ans: 'ok', exp: 'Six months in a corner shop, weekends.',
    persona: 'The newest application in the queue.' },
  { first: 'Bram',    last: 'Halloway',    req: 'cashier_northgate',  stage: 'SCREENING_PENDING', daysAgo: 0.9, src: 4,
    ans: 'thin',
    persona: 'Answers are one word long. A model should say insufficient evidence rather than guess.' },

  /* ---- the decision queue. This is what the store manager opens on a Monday. */
  { first: 'Marisol', last: 'Ferreira',    req: 'cashier_ridgeway',   stage: 'DECISION_PENDING', daysAgo: 2.1, src: 0,
    ans: 'good_fastfood',
    persona: 'Every criterion met and waiting on a person. The straightforward approve, and the requisition has one seat left for her.' },
  { first: 'Jerome',  last: 'Kettleworth', req: 'stocker_ridgeway',   stage: 'DECISION_PENDING', daysAgo: 3.4, src: 2,
    ans: 'ok', exp: 'Fast food, one year, closing shifts.',
    persona: 'Middling. One phrase hit on reliability and an unclear answer about the overnights. Nothing is wrong with it and nothing in it is convincing.' },
  { first: 'Priya',   last: 'Anand',       req: 'cashier_northgate',  stage: 'DECISION_PENDING', daysAgo: 1.2, src: 6,
    ans: 'good_garden',
    persona: 'Referred by somebody already on the payroll, and every criterion met.' },
  { first: 'Cody',    last: 'Brennan',     req: 'service_stonewell',  stage: 'DECISION_PENDING', daysAgo: 4.6, src: 5,
    ans: 'weak',
    persona: 'Weak screening. One concern, about turning up on time, and a person has to read the transcript before deciding.' },
  { first: 'Yusuf',   last: 'Demirci',     req: 'curbside_northgate', stage: 'DECISION_PENDING', daysAgo: 2.8, src: 7,
    ans: 'ok', exp: 'Warehouse work, two years.',
    answerOverrides: { physical: 'bad' },
    persona: 'Walk-in via the in-store QR code. His answer on the physical requirement is unclear rather ' +
             'than a refusal, so it scores partly met, raises no concern and goes to a person. That is the ' +
             'accommodation conversation, and it is the one thing the product must never score down.' },
  { first: 'Hattie',  last: 'Lombard',     req: 'bakery_lakeside',    stage: 'DECISION_PENDING', daysAgo: 5.2, src: 1,
    ans: 'good_deli',
    interviewNote: 'Ten minutes early. Asked about the training before she asked about the pay. No commercial ' +
                   'oven experience and she said so straight out rather than talking round it.',
    persona: 'Screening call and manager interview both done, so steps 4 and 5 are used on this one.' },
  /* Ines and Ryan are named by roughly a dozen cases in the assistant test
     suites, including the two that check a singular action aimed at two people
     at once. Keeping them in the cast keeps those cases testing what they were
     written to test rather than a name that no longer resolves. */
  { first: 'Ines',    last: 'Duarte',      req: 'cashier_ridgeway',   stage: 'DECISION_PENDING', daysAgo: 2.4, src: 1,
    ans: 'good_warehouse',
    persona: 'Waiting on a decision, and named by the assistant test suites as the approve target. One seat ' +
             'is left on her requisition, so she and Marisol Ferreira cannot both be taken on it.' },
  { first: 'Ryan',    last: 'Kettle',      req: 'curbside_northgate', stage: 'DECISION_PENDING', daysAgo: 3.9, src: 4,
    ans: 'weak', exp: 'Retail seasonal, one winter.',
    persona: 'Waiting on a decision. Named by the assistant test suites as the reject target.' },

  /* ---- the two the rules stopped, and they were stopped in different ways. */
  { first: 'Trevor',  last: 'Boone',       req: 'stocker_ridgeway',   stage: 'BLOCKED_REHIRE', daysAgo: 1.1, src: 2,
    ans: 'ok', exp: 'Overnight stocking at Northgate in 2022, eight months.',
    persona: 'Matches a prior employment record marked not eligible for rehire. Stopped where it stands and in front of a person, because the record may be wrong.' },
  { first: 'Shantel', last: 'Ruiz',        req: 'meat_brookfield',    stage: 'INELIGIBLE', daysAgo: 1.6, src: 3,
    ans: 'bad', avail: 'weekdayOnly',
    persona: 'Availability does not cover the required shifts. A hard rule, deterministic, and the failing rule is named on the record.' },

  /* ---- offers out */
  { first: 'Owen',    last: 'Castellano',  req: 'cashier_ridgeway',   stage: 'OFFER_SENT', daysAgo: 3.0, src: 0,
    ans: 'good_care', chases: 1,
    decidedBecause: 'Three years of nights in care work, so turning up at an awkward hour is not the question ' +
                    'with him. He wants the evening tills and that is the half of the week I cannot cover. ' +
                    'Nothing in the screening is thin.',
    persona: 'Offer out and unanswered, with one chase recorded rather than implied.' },
  { first: 'Ruthie',  last: 'Nakamura',    req: 'bakery_lakeside',    stage: 'OFFER_SENT', daysAgo: 4.7, src: 1,
    ans: 'good_fastfood', chases: 2,
    interviewNote: 'Knows a kitchen. Asked what time the bake starts and whether the ovens are gas. Her ' +
                   'shifts have all been closes, so I walked her through a six in the morning start and she was fine with it.',
    decidedBecause: 'A year in a kitchen and she has done the food handler training, which is what the ' +
                    'allergen labelling needs. Her shifts have all been closes rather than opens, so I took ' +
                    'her through a six in the morning start at the interview and she was fine with it.',
    persona: 'Gone quiet. Two chases recorded rather than implied, and she is the case for what the ' +
             'product does when an offer window runs out.' },
  { first: 'Silas',   last: 'Marchetti',   req: 'cashier_northgate',  stage: 'OFFER_DECLINED', daysAgo: 7.2, src: 2,
    ans: 'good_deli',
    decidedBecause: 'A year on a deli counter at a competitor, so a till and a queue will not be new to him. ' +
                    'Friday and Saturday evenings are the two shifts I lose people on and he said both were fine.',
    persona: 'Took another job. Recorded rather than deleted, and his seat went back on the requisition, which is why Northgate is still hiring.' },

  /* ---- checks running */
  { first: 'Bianca',  last: 'Osei',        req: 'deli_ridgeway',      stage: 'CHECK_RUNNING', daysAgo: 5.8, src: 0,
    ans: 'good_deli',
    interviewNote: 'Talked about the temperature log at her last counter without being asked, which is the ' +
                   'part people forget. Quiet, and I do not mind quiet on a fresh counter.',
    decidedBecause: 'She held a food handler card on a deli counter for a year, and at the interview she ' +
                    'talked about the temperature log without being asked. The fresh counter needs somebody ' +
                    'who does the records without being chased.',
    persona: 'Background check with the agency. Counties still open.' },
  { first: 'Marcus',  last: 'Pennington',  req: 'stocker_ridgeway',   stage: 'CHECK_SLOW', daysAgo: 9.3, src: 4,
    ans: 'good_warehouse',
    decidedBecause: 'Eighteen months of warehouse picking on nights, so the pallet work and the overnight ' +
                    'hours are both known quantities. He set two alarms for a night shift, which is the ' +
                    'answer I want on that question.',
    persona: 'One county running long. Nothing on our side is holding it up and the screen has to say so.' },
  /* B-29. Ridgeway, not Stonewell. The compliance surface is scoped to one
     store under U-43 and the default acting viewer is Marcus Hale at Ridgeway,
     so on any other store this beat is invisible on the page it exists for. */
  { first: 'Dara',    last: 'Simmons',     req: 'cashier_ridgeway',   stage: 'CHECK_ADVERSE', daysAgo: 8.1, src: 5,
    ans: 'ok', exp: 'Care work, three years, nights.',
    /* THE ONE APPROVAL THAT GOES AGAINST THE RECOMMENDATION. A manager
       overriding an assessment is a good beat and not a defect, but only if the
       reason says so. Nineteen of the twenty-one decisions used to carry one
       identical sentence, this one included, so the record claimed the evidence
       supported a decision the evidence had flagged for review. */
    decidedBecause: 'The screening came back as review and I am taking her anyway. Two answers are thin ' +
                    'rather than bad: I set two alarms on reliability, and evenings should be all right most ' +
                    'weeks on the hours. Three years of nights in care work tells me more about turning up ' +
                    'than either of those, and I only need her on the Saturday and Sunday evenings. My call, ' +
                    'with my name on it.',
    persona: 'A county returned a record. The pre-adverse notice has gone out and the gap is running. Owned ' +
             'by a person, never automated. She is also the one approval in the data made against the ' +
             'recommendation, and the reason says so.' },

  /* ---- onboarding, in parallel */
  { first: 'Kwame',   last: 'Adjei',       req: 'cashier_northgate',  stage: 'ONBOARDING', daysAgo: 13.4, src: 0,
    ans: 'good_school', age: 17,
    decidedBecause: 'First job, so the reliability answer is about school rather than about work, and on the ' +
                    'front end I am fine with that. He was clear about the Friday and Saturday evenings. He ' +
                    'will need somebody on the till beside him for the first week and I have said so on the rota.',
    persona: 'Every onboarding task with no prerequisite started at once. The two that need a first day of work cannot start yet.' },
  { first: 'Elodie',  last: 'Fournier',    req: 'curbside_northgate', stage: 'ONBOARDING', daysAgo: 12.8, src: 3,
    ans: 'good_garden',
    decidedBecause: 'Two years outdoors at a garden centre, which is the part of curbside that puts people ' +
                    'off in February. Compost bags are heavier than the twenty five pound limit and she was ' +
                    'carrying them all day. The weekend mornings suit her.',
    persona: 'Badge and till access is the human task holding the critical path.' },
  { first: 'Gus',     last: 'Petrakis',    req: 'cashier_ridgeway_r2', stage: 'READY_FOR_SHIFT', daysAgo: 14.6, src: 1,
    ans: 'good_school', age: 18,
    decidedBecause: 'No paid work yet and the answers were straight rather than rehearsed. The front end is ' +
                    'where somebody learns this job, and he was specific about the weekend evenings he can do.',
    persona: 'Everything before day one is done and he is waiting on a shift being placed. One of the two hires that filled the earlier cashier requisition.' },

  /* ---- the rehire that holds, and it is the good kind */
  { first: 'Teresa',  last: 'Alvarado',    req: 'deli_ridgeway_r1',   stage: 'ONBOARDING_REHIRE', daysAgo: 13.0, src: 0,
    ans: 'good_deli', exp: 'Deli Associate here from 2024 until she relocated in 2025.',
    interviewNote: 'She worked this counter for a year before she moved away and she knew two of the team by ' +
                   'name. Nothing here needed testing.',
    decidedBecause: 'She worked this counter for a year and left to relocate, and the record says eligible ' +
                    'for rehire. Her Form I-9 is inside the three year window and the food safety course has ' +
                    'not expired, so several onboarding steps do not have to be done twice. Easiest decision on the list.',
    persona: 'Worked here before, left on good terms, inside the three-year I-9 window. Several onboarding ' +
             'steps do not have to be done twice and the record says why. Her approval took the last seat on ' +
             'that requisition and closed it.' },

  /* ---- shifts placed, and one of them inside the notice window */
  { first: 'Ingrid',  last: 'Solberg',     req: 'cashier_ridgeway_r2', stage: 'SHIFT_SCHEDULED', daysAgo: 15.4, src: 0,
    ans: 'good_fastfood', notice: 16,
    decidedBecause: 'A year of closing shifts in fast food, so the weekend evening tills are her own hours ' +
                    'rather than a compromise. She gave the Wednesday open as well, which is the shift nobody wants.',
    persona: 'First shift placed with the advance notice satisfied. One of the two hires on the earlier cashier requisition.' },
  { first: 'Aaron',   last: 'Delacroix',   req: 'meat_brookfield',    stage: 'SHIFT_SCHEDULED', daysAgo: 15.2, src: 2,
    ans: 'good_warehouse', notice: 5,
    interviewNote: 'Straight about the cold room, which is the part that puts people off this job. Eighteen ' +
                   'months of chilled picking behind him. No food handler card and he knows the cutting room needs one.',
    decidedBecause: 'Eighteen months picking chilled and frozen orders, so the cold room and the temperature ' +
                    'records will not be a surprise. He has no food handler card and the cutting room needs ' +
                    'one, so that is booked for his first week. The only shift I could give him is inside the ' +
                    'notice window, so the premium is payable and I have taken that on the rota.',
    persona: 'Shift inside the fourteen-day notice window, so a premium is payable and the screen says which.' },

  /* ---- started, and the E-Verify story */
  { first: 'Kayla',   last: 'Brennan-Ross', req: 'deli_ridgeway_r1',  stage: 'EVERIFY_MISMATCH', daysAgo: 36.0, src: 0,
    ans: 'good_fastfood',
    interviewNote: 'Came in on her day off to do this. Fryers and grills for a year and she has done the ' +
                   'food handler training. Ready for the counter.',
    decidedBecause: 'A year in a kitchen on the fryers and the grill and she has done the food handler ' +
                    'training, so the fresh counter is a step across rather than a step up. She came in on ' +
                    'her day off for the interview.',
    persona: 'Started, then an E-Verify mismatch. Contesting. Every adverse action is barred until the case closes, and two attempts to cut her shifts were refused.' },
  { first: 'Noor',    last: 'Haddad',      req: 'cashier_northgate_r1', stage: 'STARTED', daysAgo: 33.0, src: 6,
    ans: 'good_warehouse',
    decidedBecause: 'Referred by somebody who works the same shift she has asked for. Eighteen months of ' +
                    'picking on nights, and she wants the Friday and Saturday evenings, which are the two ' +
                    'hardest to fill here.',
    persona: 'On the floor, week one. She took the one seat on the earlier Northgate cashier requisition, which closed when she was approved.' },

  /* ---- the long tail. Sized so the tenure events land in the past. */
  { first: 'Felix',   last: 'Ntamack',     req: 'stocker_ridgeway_r1', stage: 'DAY_30', daysAgo: 64.0, src: 2,
    ans: 'good_care',
    decidedBecause: 'Three years of nights in care work, so the overnight pattern is not a novelty, and the ' +
                    'handover answer told me more about turning up than the rest of it. Pallet work he has ' +
                    'not done, and the equipment training covers that in week one.',
    persona: 'Past day 30. The check-in ran and nothing was flagged.' },
  { first: 'Renata',  last: 'Vasquez',     req: 'cashier_ridgeway_r1', stage: 'DAY_60', daysAgo: 94.0, src: 0,
    ans: 'good_garden', exp: 'A season on the tills at Lakeside in 2021, then two years at a garden centre.',
    decidedBecause: 'She was on the tills at Lakeside for a season, so this is not new work to her. That ' +
                    'spell is outside the three year window, so the Form I-9 has to be done again and the ' +
                    'point of sale course has expired and has to be retaken. Both are on her onboarding list ' +
                    'and neither is a reason to say no.',
    persona: 'Past day 60. A second returning worker, and this time the prior training has expired so it has to be retaken.' },
  { first: 'Obi',     last: 'Chukwuma',    req: 'bakery_lakeside_r1',  stage: 'DAY_90', daysAgo: 124.0, src: 1,
    ans: 'good_deli',
    interviewNote: 'Asked about the rota and about the allergen labelling, in that order. Held a food ' +
                   'handler card at his last counter. I would take him.',
    decidedBecause: 'A year on a deli counter and he held a food handler card, which is what the allergen ' +
                    'labelling needs. At the interview he asked about the rota and about the labelling, in that order.',
    persona: 'Ninety days and still employed. The measurement neither incumbent claims. The requisition he ' +
             'filled is closed, and the careers page has not advertised it since.' },
  { first: 'Wren',    last: 'Castellanos', req: 'service_stonewell_r1', stage: 'DAY_90', daysAgo: 138.0, src: 0,
    ans: 'good_care',
    decidedBecause: 'The service desk is the hardest conversation in the building, and three years of care ' +
                    'work is the best preparation for it I am going to see on an application form. She lets ' +
                    'the customer finish before she does anything else, which is most of the job.',
    persona: 'A second person past day 90, so the retention number is not a sample of one.' },

  /* ---- the ones that ended */
  { first: 'Casey',   last: 'Mbeki',       req: 'cashier_ridgeway',   stage: 'REJECTED', daysAgo: 6.9, src: 4,
    ans: 'bad',
    decidedBecause: 'No. He says no evenings after six and no early starts, and the role is the Saturday and ' +
                    'Sunday evening tills plus the Wednesday open. He also told us he had overslept more than ' +
                    'once and got a warning for it. The answer about an angry customer settles it: telling a ' +
                    'customer they are wrong is not something I can put on the front end.',
    persona: 'Rejected by a person after a weak screening. Who decided and why is on the record.' },
  { first: 'Lorne',   last: 'Fitzgerald',  req: 'curbside_northgate', stage: 'REJECTED', daysAgo: 8.4, src: 5,
    ans: 'good_care',
    /* The rejection against an advance recommendation. The reason has to admit
       that it is not in the evidence, because a rejection recorded next to an
       assessment that recommended advancing every criterion is the exhibit if
       nobody wrote down why. */
    decidedBecause: 'The screening recommends advancing him and I am overriding it. Nothing in the answers ' +
                    'is wrong and I am not disputing any of it. My reason is the rota and it is not in the ' +
                    'evidence: this is the weekend openings in a car park in all weather, every week, and ' +
                    'three years of his work are indoors on nights. I would rather leave the seat open than ' +
                    'fill it with somebody who asks to move off it in a month. That is my judgement and it ' +
                    'is recorded as mine.',
    persona: 'Rejected against a recommendation to advance. The override is visible rather than inferable, ' +
             'and the manager says in writing that it is his judgement and not the evidence.' },
  { first: 'Simone',  last: 'Achterberg',  req: 'cashier_northgate',  stage: 'WITHDRAWN', daysAgo: 5.5, src: 3,
    ans: 'ok',
    persona: 'Withdrew during screening. Recorded, because a withdrawal is a funnel fact.' },

  /* ---- unusually fast, and it is the comparison case for everybody else */
  { first: 'Zach',    last: 'Oyelaran',    req: 'cashier_ridgeway',   stage: 'FAST_TRACK', daysAgo: 2.6, src: 6,
    ans: 'good_deli',
    decidedBecause: 'Referred by somebody already on the front end, a year on a deli counter, and the ' +
                    'weekend evenings and the Wednesday open all came back clean. I am not sitting on this ' +
                    'one for three days.',
    persona: 'Applied, screened, decided and offered inside a day. The comparison case for everybody else.' }
];

/* Every one of the thirteen slots, and the weekday-only list that fails a hard
   rule. Availability is a fact about the person and not a consequence of how
   well they interviewed, which is what lets one candidate fail a hard rule and
   another be rejected by a person after a weak screening. */
const AVAILABILITY = {
  full: SLOTS.KEYS.slice(),
  weekdayOnly: ['mon_open', 'tue_open', 'wed_open', 'thu_open', 'fri_open']
};

/* ------------------------------------- this retailer's own employment records --
   Read by the rehire lookup, one tenant only, never pooled. Pooling employment
   history across customers is what a consumer reporting agency does under
   15 U.S.C. 1681a(f), which is a different company.
   -------------------------------------------------------------------------- */

export const PRIOR_EMPLOYMENT = [
  /* Teresa is the rehire the demo turns on, so her previous Form I-9 has to sit
     INSIDE the three-year window 8 CFR 274a.2(c)(1)(i) opens. */
  { first: 'Teresa', last: 'Alvarado', dob: '1991-04-17', phone: '+1-614-555-0182',
    employeeId: 'E-448120', role: 'Deli Associate', storeName: '#0417 Ridgeway',
    startedOn: '2024-05-13T00:00:00.000Z', separatedOn: '2025-08-29T00:00:00.000Z',
    separationReason: 'Resigned, relocation', rehireEligible: true,
    i9ExecutedOn: '2024-05-13T00:00:00.000Z',
    training: [
      { code: 'FS-101', name: 'Food safety, level 1', completedOn: '2024-05-15T00:00:00.000Z', expiresOn: '2028-05-15T00:00:00.000Z' },
      { code: 'HAR-02', name: 'Harassment prevention', completedOn: '2024-05-16T00:00:00.000Z', expiresOn: null }
    ] },

  /* The one marked not eligible. It refuses nobody by itself: it holds the
     application and puts it in front of a person. */
  { first: 'Trevor', last: 'Boone', dob: '1996-11-02', phone: '+1-614-555-0117',
    employeeId: 'E-390451', role: 'Overnight Stocker', storeName: '#0392 Northgate',
    startedOn: '2022-05-16T00:00:00.000Z', separatedOn: '2023-01-11T00:00:00.000Z',
    separationReason: 'Ended for cause. Note on file, no detail attached to this record.',
    rehireEligible: false, i9ExecutedOn: '2022-05-16T00:00:00.000Z', training: [] },

  /* Outside the I-9 window and with a lapsed course, so the reuse map has to
     say retake rather than carry forward. */
  { first: 'Renata', last: 'Vasquez', dob: '1999-07-23', phone: '+1-614-555-0143',
    employeeId: 'E-411009', role: 'Cashier', storeName: '#0455 Lakeside',
    startedOn: '2021-03-01T00:00:00.000Z', separatedOn: '2021-11-19T00:00:00.000Z',
    separationReason: 'Seasonal end', rehireEligible: true,
    i9ExecutedOn: '2021-03-01T00:00:00.000Z',
    training: [{ code: 'POS-01', name: 'Point of sale basics', completedOn: '2021-03-03T00:00:00.000Z', expiresOn: '2023-03-03T00:00:00.000Z' }] }
];

/* ===========================================================================
   THE DRIVER
   ======================================================================== */

/**
 * Build the whole dataset.
 *
 * opts:
 *   now         the real-time anchor, defaulting to the wall clock. Passing it
 *               makes the seed byte-identical across runs, which is how the
 *               determinism test works.
 *   anchor      the simulated present, defaulting to the clock module's ANCHOR.
 *   screening   the screening collaborator. See the header.
 *   useLLM      seed the evaluations with the configured model instead of the
 *               deterministic rubric. Off by default, because a fresh boot
 *               should cost nothing and produce the same result every time.
 *               With it on the output is no longer reproducible, which is the
 *               operator's explicit choice.
 */
export async function seed(store, opts) {
  const o = opts || {};
  const useLLM = o.useLLM != null ? o.useLLM : process.env.SEED_USE_LLM === '1';
  const SCR = await resolveScreening(o);

  const anchorSim = o.anchor != null ? o.anchor : ANCHOR;
  const anchorReal = o.now != null ? o.now : Date.now();
  const NOW = anchorSim;

  store.reset();
  store.db.meta.anchors = { sim: anchorSim, real: anchorReal };
  store.db.meta.seededAt = new Date(anchorReal).toISOString();
  store.db.meta.simAnchor = new Date(anchorSim).toISOString();

  /* A clock the seed drives by hand. Every event lands at the moment it would
     really have happened, so the durations that come out the far end are real
     arithmetic over real gaps. Nothing here reads the wall clock. */
  let cursor = anchorSim;
  const clock = { now: () => cursor, iso: () => new Date(cursor).toISOString() };
  const at = (ms) => { cursor = ms; };

  const ctx = (actor) => ({
    tenantId: TENANT, tenantName: TENANT_NAME, clock,
    actor: actor || { type: 'system', name: 'Workflow engine' }
  });
  const sys   = () => ctx({ type: 'system',   name: 'Workflow engine' });
  const agent = () => ctx({ type: 'agent',    name: 'Screening agent' });
  const ext   = () => ctx({ type: 'external', name: 'Candidate' });
  const mgr   = (st) => ctx({ type: 'human', name: st.manager, role: 'Store manager' });

  /* ------------------------------------------------------ reference rows --- */

  store.insert('tenants', {
    id: TENANT, tenantId: TENANT, name: TENANT_NAME, org: ORG, people: PEOPLE,
    /* The FCRA gap is tenant policy and the statute sets no number, so it lives
       on the tenant where a customer can change it. Left unset here, which
       makes `fcraGap` report the product default and say that it is one. */
    policy: {}
  });

  const storeByKey = {};
  STORES.forEach((s) => {
    const row = Object.assign({ id: storeIdOf(s.key), tenantId: TENANT, home: !!s.home }, s);
    store.insert('stores', row);
    storeByKey[s.key] = row;
  });

  /* The earliest application against each requisition, worked out before the
     requisitions are written, because a requisition may not be younger than an
     application to it. The previous build spread openedAt over the last six
     weeks while one candidate had applied a hundred and eighteen days earlier,
     so five requisitions carried an application that arrived before the job
     existed. */
  const earliestApplication = {};
  CAST.forEach((spec) => {
    const t = NOW - Math.round(spec.daysAgo * DAY);
    if (earliestApplication[spec.req] == null || t < earliestApplication[spec.req]) {
      earliestApplication[spec.req] = t;
    }
  });

  const reqByKey = {};
  REQUISITIONS.forEach((r) => {
    const st = storeByKey[r.storeKey];
    /* Spread deterministically off the key, then pushed back further if an
       application predates it. Every requisition therefore reports its own age
       rather than the same figure printed eight times. */
    /* Spread in HOURS rather than in whole days. With fifteen requisitions and
       forty seven possible day values, two of them landed on the same instant
       and the self-check below caught it: a page reporting how long each
       requisition has been open would have printed one number twice.

       AND EVERY POSTING IS AT LEAST TWENTY ONE DAYS OLD, with at least fifteen
       days of lead before the first application to it. That is not decoration
       either. Local Law 144 needs not less than ten business days of notice
       before an automated employment decision tool is used, the clock in this
       product starts at consent, and consent is the moment somebody applies, so
       no seeded candidate could ever satisfy it and the product computed the
       violation and screened them anyway.

       Where the notice belongs is on the job posting, which is where a
       candidate can read it ten business days before they apply. Moving the
       clock start is a change in compliance.js, which this file does not own.
       What this file can do is make the dataset able to satisfy it either way,
       and the self-check at the bottom holds it there: ten business days from
       the posting have elapsed before every single application in the seed.

       The twenty one days and the fifteen day lead are OURS and have no source.
       The ten business days is the rule and it is cited where the clock is
       defined. These two only have to be larger than it. */
    const spreadOpen = NOW - CONN.spread('openedAt|' + r.key, 21 * 24, 58 * 24) * HOUR;
    const lead = CONN.spread('lead|' + r.key, 15 * 24, 25 * 24) * HOUR;
    const openedAt = Math.min(spreadOpen, (earliestApplication[r.key] || spreadOpen) - lead);
    const row = {
      id: 'req_' + r.key, tenantId: TENANT, key: r.key,
      storeId: st.id, storeName: st.name,
      title: r.title, openings: r.openings, summary: r.summary,
      minAge: r.minAge, rateCents: r.rateCents, hoursPerWeek: r.hoursPerWeek,
      requiredSlots: r.requiredSlots.slice(),
      maxDistanceMiles: r.maxDistanceMiles,
      requiresManagerInterview: r.requiresManagerInterview,
      criteria: r.criteria.map((k) => Object.assign({}, CRITERIA[k])),
      /* The availability question is rebuilt from this requisition's own
         requiredSlots, and so is the bank that scores the answer, so the hours
         the agent asks about and the hours eligibility scores against cannot
         drift apart. S-02 and S-03. */
      screeningQuestions: r.questions.map((k) => (
        k === 'availability' ? availabilityQuestion(r.requiredSlots) : Object.assign({}, QUESTIONS[k])
      )),
      interviewQuestions: r.requiresManagerInterview
        ? [{ key: 'in_person', criterion: r.criteria[0], text: 'Manager interview, in store.' }]
        : [],
      openedAt,
      postedTo: BOARDS.slice(),
      status: 'open'
    };
    store.insert('requisitions', row);
    reqByKey[r.key] = row;
  });

  /* The postings, out through the simulated distribution adapter. Every one of
     them is recorded and every one carries the mode the adapter reports. */
  REQUISITIONS.forEach((r) => {
    const row = reqByKey[r.key];
    row.postedTo.forEach((dest, di) => {
      at(row.openedAt + di * 40 * MIN);
      CONN.call(store, sys(), 'ats', 'post_opening',
        { requisitionId: row.id, destination: dest }, { at: cursor });
    });
  });

  /* One connector failure and its retry, kept in on purpose. An integration
     surface with no errors in it has never been near a real vendor. The error
     string comes from the op rather than from here, so the page prints the
     vendor's words and not ours. */
  at(NOW - 3 * DAY);
  const failed = CONN.call(store, sys(), 'ats', 'post_opening',
    { requisitionId: reqByKey.meat_brookfield.id, destination: 'Jooble' },
    { at: cursor, fail: 'feed_rejected' });
  at(NOW - 3 * DAY + 12 * MIN);
  CONN.call(store, sys(), 'ats', 'post_opening',
    { requisitionId: reqByKey.meat_brookfield.id, destination: 'Jooble' },
    { at: cursor, attempt: 2, retryOf: failed.call.id });

  PRIOR_EMPLOYMENT.forEach((p, i) => {
    store.insert('priorEmployment', {
      id: 'pri_' + String(i + 1).padStart(4, '0'), tenantId: TENANT,
      identityKey: RULES.identityKey({ firstName: p.first, lastName: p.last, dob: p.dob, phone: p.phone }),
      firstName: p.first, lastName: p.last, dob: p.dob,
      employeeId: p.employeeId, role: p.role, storeName: p.storeName,
      startedOn: p.startedOn, separatedOn: p.separatedOn,
      separationReason: p.separationReason, rehireEligible: p.rehireEligible,
      i9ExecutedOn: p.i9ExecutedOn, training: p.training.map((t) => Object.assign({}, t))
    });
  });

  /* ------------------------------------------------------------- the cast --- */

  for (let i = 0; i < CAST.length; i++) {
    const spec = CAST[i];
    const def = REQUISITIONS.find((x) => x.key === spec.req);
    if (!def) throw new Error(spec.first + ' ' + spec.last + ' is on requisition "' + spec.req + '", which does not exist.');
    const req = reqByKey[spec.req];
    const st = storeByKey[def.storeKey];
    const appliedAt = NOW - Math.round(spec.daysAgo * DAY);

    const prior = PRIOR_EMPLOYMENT.find((p) => p.first === spec.first && p.last === spec.last);
    const dob = prior ? prior.dob : dobFor(spec, def.minAge, anchorSim);
    const phone = prior ? prior.phone : '+1-614-555-' + String(1000 + i).slice(-4);
    const source = SOURCES[spec.src % SOURCES.length];

    /* The candidate row is the same shape intake.js writes for a live
       applicant, plus the two fields only a seeded person has. */
    const cand = {
      id: store.nextId('cand'), tenantId: TENANT,
      firstName: spec.first, lastName: spec.last,
      name: spec.first + ' ' + spec.last,
      initials: spec.first[0] + spec.last[0],
      dob, phone,
      email: (spec.first + '.' + spec.last.replace(/[^a-z]/gi, '')).toLowerCase() + '@example.com',
      city: st.city, state: st.state,
      counties: countiesFor(st, i),
      /* From the answer set, or from the cast row where the person's story is
         more specific. It used to come from a hash of their name, which put
         "No paid work yet, finishing school" on the record of somebody whose
         own answer described a year on a deli counter. A record that argues
         with itself is the first thing a buyer stops believing. */
      experience: experienceFor(spec),
      /* U-94. A live applicant must never carry one of these, because the
         product could then manufacture a synthetic transcript for somebody who
         took a real call. intake.js throws rather than write one.

         No `in_person` answer in here. The manager's interview note is not the
         candidate's answer to anything, it is the manager's own words, and it
         goes on the record through the INTERVIEW_COMPLETE transition instead. */
      answers: answersFor(spec.ans, def.requiredSlots, spec.answerOverrides),
      persona: spec.persona,
      origin: 'seed',
      createdAt: appliedAt
    };
    store.insert('candidates', cand);

    const app = {
      id: store.nextId('app'), tenantId: TENANT,
      candidateId: cand.id, requisitionId: req.id, storeId: st.id,
      appliedAt,
      source: source.name,
      sourceKind: source.kind,
      state: 'APPLICATION_RECEIVED', stateSince: appliedAt, updatedAt: appliedAt,
      rightToWorkDeclared: true,
      availability: (spec.avail === 'weekdayOnly' ? AVAILABILITY.weekdayOnly : AVAILABILITY.full).slice(),
      /* U-88. A declared band and not a computed distance. There is no ZIP,
         address or geocoding anywhere in this build and the five towns are
         invented, so a mile figure we did not compute may not render as one. */
      distanceMiles: 3 + (CONN.hash(cand.id) % 17),
      distanceSource: 'declared_band',
      commuteBand: null,
      consentId: null,
      eligibility: null, rehire: null,
      decisionId: null, offerId: null, backgroundCheckId: null, firstShiftId: null,
      startedAt: null, acceptedAt: null, closedAt: null, parallel: null,
      everify: null, fcra: null,
      assignedTo: st.manager
    };
    store.insert('applications', app);

    /* The disclosure gate, which is where the consent and the retention clock
       begin. U-86. It is a few minutes before the form, because somebody reads
       it and then fills the form in. */
    const consentAt = appliedAt - CONN.spread('consent|' + cand.id, 2, 9) * MIN;
    at(consentAt);
    const consent = EV.recordConsent(store, ctx({ type: 'external', name: 'Applicant' }), {
      at: consentAt,
      candidateId: cand.id, applicationId: app.id,
      disclosureId: DISCLOSURE.id, disclosureVersion: DISCLOSURE.version,
      accepted: true,
      dataClass: 'aedt_input', retentionClass: 'aedt_4y',
      /* The fact sits next to the record rather than on a page, because the ten
         business days of notice are a NYC residency rule and no seeded store or
         candidate is in a jurisdiction that requires it. The retailer applies it
         tenant-wide as policy. Any surface showing the clock has to be able to
         say that, and the sentence is here so it reads the record. */
      basis: 'Shown before the apply form. This retailer applies the strictest rule tenant-wide as ' +
             'policy. No seeded store or candidate sits in a jurisdiction that requires it.'
    });
    app.consentId = consent.id;
    store.markDirty();

    at(appliedAt);
    EV.workflowEvent(store, sys(), {
      applicationId: app.id, candidateId: cand.id, storeId: st.id, requisitionId: req.id,
      at: appliedAt, kind: 'enter', state: 'APPLICATION_RECEIVED',
      actorType: 'external', actor: 'Application intake',
      durationMs: CONN.spread('form|' + app.id, 4 * MIN, 14 * MIN),
      detail: 'Arrived from ' + app.source + '.'
    });
    EV.auditEvent(store, sys(), {
      at: appliedAt, action: 'application.created',
      actorType: 'external', actor: 'Application intake',
      subjectType: 'application', subjectId: app.id,
      applicationId: app.id, candidateId: cand.id,
      why: 'Application received via ' + app.source + '.',
      detail: { requisition: req.key, store: st.id, consentId: consent.id },
      source: 'connector'
    });

    /* Settle runs the rules, which is where eligibility and the rehire lookup
       actually happen, and carries the application to wherever it stops. */
    at(appliedAt + 90 * 1000);
    WF.settle(store, sys(), app.id);

    await drive(spec, app, cand, req, st, def);
  }

  /* ======================================================= the replay ===== */

  async function drive(spec, app, cand, req, st, def) {
    /* Deterministic, 1.00 to 1.59. Every duration below is multiplied by it, so
       no two candidates move at the same speed and the medians have a spread to
       be a median of. */
    const pace = 1 + CONN.spread('pace|' + cand.id, 0, 59) / 100;
    const fast = spec.stage === 'FAST_TRACK';
    const stage = spec.stage;

    /* Both of these were already stopped during settle and for different
       reasons. INELIGIBLE failed a hard rule. BLOCKED_REHIRE matched a
       do-not-rehire record and is sitting in front of a person, which is not
       the same thing at all. */
    if (stage === 'INELIGIBLE' || stage === 'BLOCKED_REHIRE') return;

    /* Left in the screening queue on purpose, so there is always somebody to
       run a real screening against during a demo. */
    if (stage === 'SCREENING_PENDING') return;

    /* --------------------------------------------------------- step 3 ---- */

    const screenAt = app.appliedAt + Math.round((fast ? 22 * MIN : 3.2 * HOUR) * pace);
    at(screenAt);
    must(WF.transition(store, agent(), app.id, 'SCREENING_IN_PROGRESS', { source: 'workflow' }),
         cand.name + ' into screening');

    const call = store.first('screenings', TENANT, (s) => s.applicationId === app.id && s.kind === 'call');
    if (!call) throw new Error('no screening row was created for ' + cand.name);
    SCR.runConversation(store, agent(), call);
    /* The evaluation happens when the call ends, not when it started. */
    at(call.completedAt != null ? call.completedAt : cursor);
    const evaluated = await SCR.evaluate(store, agent(), call, { forceFallback: !useLLM });
    if (!evaluated || evaluated.ok === false) {
      throw new Error('the screening evaluation failed for ' + cand.name + ': ' +
                      ((evaluated && evaluated.error) || 'no reason given') +
                      '. A seed that leaves an unevaluated screening behind is a different dataset.');
    }

    if (stage === 'WITHDRAWN') {
      at(cursor + Math.round(9 * HOUR * pace));
      must(WF.transition(store, ext(), app.id, 'WITHDRAWN',
        { reason: 'Took a job elsewhere before the decision.' }), cand.name + ' withdrawing');
      return;
    }

    must(WF.transition(store, agent(), app.id, 'SCREENING_COMPLETE', {
      reason: def.requiresManagerInterview
        ? 'Screening call complete. This role needs a manager interview before a decision.'
        : 'Screening call complete.'
    }), cand.name + ' completing screening');
    /* Settle carries an interview role to INTERVIEW_PENDING and everybody else
       to DECISION_PENDING, because that fork is in the transition table. */
    WF.settle(store, sys(), app.id);

    /* --------------------------------------------------------- steps 4-5 --
       THE MANAGER INTERVIEW IS DRIVEN THROUGH THE ENGINE, arranged and then
       held, because as of 8 September those are two states and two waits.

       This used to write the interview row complete by hand, so neither state
       ever appeared in a timeline, no slot was ever arranged, and the notes
       were one identical sentence on all seven people, sitting in the
       candidate's own answer map as though the candidate had said them. Steps 4
       and 5 are the largest drop in the hire stage and the careers page tells
       the candidate in writing that a manager will interview them, so the demo
       has to be able to show both.

       The notes are the record. They come from the cast row, they are this
       manager's own words about this person, and the transition carries
       needsReason so a person who wrote nothing cannot complete an interview. */
    if (def.requiresManagerInterview) {
      const note = spec.interviewNote;
      if (typeof note !== 'string' || note.trim().length < 40) {
        throw new Error(cand.name + ' is on ' + def.key + ', which requires a manager interview, and the ' +
                        'cast row carries no interviewNote worth recording. The note is the whole record ' +
                        'of steps 4 and 5, so there is no default for it.');
      }
      /* Four in the afternoon on the next day, and the write-up half an hour
         after the slot. Both are OUR demo constants with no source behind them:
         nobody publishes how long a store manager takes to arrange a frontline
         interview. Every duration the product reports is derived from these
         events, so a page showing one has to be able to say whose number it is. */
      const slotAt = sixAmUTC(screenAt + Math.round(20 * HOUR * pace)) + 10 * HOUR;
      at(screenAt + Math.round(3 * HOUR * pace));
      must(WF.transition(store, mgr(st), app.id, 'INTERVIEW_SCHEDULED',
        { scheduledAt: slotAt, workMs: 4 * MIN }), cand.name + ' having an interview arranged');
      at(slotAt + 26 * MIN);
      must(WF.transition(store, mgr(st), app.id, 'INTERVIEW_COMPLETE',
        { reason: note, workMs: 22 * MIN }), cand.name + ' having an interview recorded');
      WF.settle(store, sys(), app.id);
    }

    /* --------------------------------------------------------- step 6 ----
       The decision follows the ACTUAL last screening event rather than a fixed
       offset from the conversation. On a role needing a manager interview the
       fixed offset put the approval twelve to sixteen hours BEFORE the
       screening it was made on, which made screeningToDecision negative. At
       tenant level the median absorbed it. At store level it dominated, and two
       of five stores reported a negative duration on a page whose whole
       argument is duration.
       -------------------------------------------------------------------- */

    const decideAt = lastEventAt(app.id) + Math.round((fast ? 40 * MIN : 14 * HOUR) * pace);
    if (stage === 'DECISION_PENDING') return;
    at(decideAt);

    /* THE REASON IS THIS PERSON'S OWN, and this is the defect a buyer found in
       the review and will find again if it comes back.

       Nineteen of the twenty-one recorded decisions carried the identical
       sentence, "Screening evidence supports it and the shift pattern matches",
       including one approval the assessment had flagged for review with two
       criteria only partly met. Anybody who opens two candidate records sees
       the same sentence twice and stops believing the audit trail, and the one
       record where the decision did not follow the evidence was the one the
       sentence was least true of.

       So the reason comes off the cast row, where it was written next to that
       person's own answers, and there is no default. Where a manager is going
       against the recommendation the reason says so in writing, because that is
       a good beat rather than a defect: what makes it defensible is that the
       override is stated rather than inferred. */
    const because = decisionReason(spec, cand);

    if (stage === 'REJECTED') {
      must(WF.transition(store, mgr(st), app.id, 'REJECTED', { reason: because, workMs: 6 * MIN }),
           cand.name + ' being rejected');
      return;
    }

    must(WF.transition(store, mgr(st), app.id, 'APPROVED', { reason: because, workMs: 5 * MIN }),
         cand.name + ' being approved');
    WF.settle(store, sys(), app.id);

    /* --------------------------------------------------------- steps 7-8 -- */

    const sendAt = decideAt + Math.round((fast ? 8 * MIN : 2.4 * HOUR) * pace);
    at(sendAt);
    must(WF.transition(store, mgr(st), app.id, 'OFFER_SENT', { workMs: 90 * 1000 }),
         cand.name + ' being sent an offer');

    /* A chase is a real communication and it is what the funnel calls step 8
       going quiet. Recorded rather than implied. */
    for (let n = 1; n <= (spec.chases || 0); n++) {
      const chaseAt = sendAt + Math.round((n === 1 ? 14 : 30) * HOUR * pace);
      at(chaseAt);
      const r = CONN.call(store, agent(), 'messaging', 'sms', {
        to: cand.phone, templateId: 'offer_chase_v1',
        applicationId: app.id, candidateId: cand.id
      }, { at: chaseAt });
      EV.communication(store, agent(), {
        at: chaseAt, channel: 'sms', to: cand.phone,
        candidateId: cand.id, applicationId: app.id, templateId: 'offer_chase_v1',
        subject: 'Reminder about your offer',
        status: r.ok ? 'sent' : 'failed',
        providerRef: r.externalRef || null,
        mode: r.mode,
        error: r.error || null
      });
      EV.workflowEvent(store, agent(), {
        applicationId: app.id, candidateId: cand.id, at: chaseAt,
        kind: 'note', state: 'OFFER_SENT', step: 8, owner: 'agent',
        actorType: 'agent', actor: 'Offer agent', durationMs: 20 * 1000,
        detail: 'Reminder ' + n + ' sent. Still waiting on the candidate, which is not a product failure.'
      });
    }

    if (stage === 'OFFER_SENT' || fast) return;

    if (stage === 'OFFER_DECLINED') {
      at(sendAt + Math.round(19 * HOUR * pace));
      must(WF.transition(store, ext(), app.id, 'OFFER_DECLINED',
        { reason: 'Accepted a role somewhere else with more hours.' }), cand.name + ' declining');
      return;
    }

    const acceptAt = sendAt + Math.round(11 * HOUR * pace);
    at(acceptAt);
    must(WF.transition(store, ext(), app.id, 'OFFER_ACCEPTED', {}), cand.name + ' accepting');
    /* Acceptance is the point the parallel work fans out, so settle here is
       what creates the eleven onboarding tasks. */
    WF.settle(store, sys(), app.id);

    /* -------------------------------------------------------- steps 9-10 --
       The conditional offer comes first and then the check. That order is not a
       preference: California Gov. Code 12952(a)(2) reaches the conduct of the
       check itself and not only the question on the form.
       -------------------------------------------------------------------- */

    const orderAt = acceptAt + 26 * MIN;
    at(orderAt);
    must(WF.transition(store, sys(), app.id, 'BACKGROUND_CHECK_IN_PROGRESS', {}),
         cand.name + ' having a check ordered');

    const chk = store.byId('backgroundChecks', TENANT, app.backgroundCheckId);
    if (!chk) throw new Error('no background check row was created for ' + cand.name);

    if (stage === 'CHECK_SLOW') {
      /* One county running long. Real courts differ by a lot and this is one of
         them. The number is OUR expectation and no page may present it as the
         vendor's or as a legal deadline. */
      const counties = chk.searches.filter((s) => String(s.key).indexOf('county_') === 0);
      const last = counties[counties.length - 1];
      if (last) {
        last.expectedMs = Math.round(8.6 * DAY);
        last.expectationIsOurs = true;
        store.markDirty();
      }
    }

    if (stage === 'CHECK_RUNNING' || stage === 'CHECK_SLOW') {
      /* Whatever has genuinely had time to come back has come back. A screen
         that shows five outstanding searches when four are done says nothing is
         moving, and the point of the slow case is that one venue is the holdup
         and nothing on our side is. */
      const returned = returnElapsedSearches(chk, NOW);
      if (returned.length) {
        at(returned[returned.length - 1].returnedAt);
        EV.workflowEvent(store, ext(), {
          applicationId: app.id, candidateId: cand.id, at: cursor, kind: 'note',
          state: 'BACKGROUND_CHECK_IN_PROGRESS', step: 10, owner: 'clock',
          actorType: 'external', actor: 'Screening agency',
          detail: returned.length + ' of ' + chk.searches.length + ' searches returned clear. Still out: ' +
                  chk.searches.filter((x) => x.status === 'pending').map((x) => x.venue || x.name).join(', ') +
                  '. Nothing on our side is holding this up.',
          ref: chk.id
        });
      }
      at(NOW);
      return;
    }

    const backAt = orderAt + Math.round(4.4 * DAY * pace);
    const adverse = stage === 'CHECK_ADVERSE';
    returnSearches(chk, backAt, adverse);
    at(backAt);
    EV.workflowEvent(store, ext(), {
      applicationId: app.id, candidateId: cand.id, at: backAt, kind: 'note',
      state: 'BACKGROUND_CHECK_IN_PROGRESS', step: 10, owner: 'clock',
      actorType: 'external', actor: 'Screening agency',
      detail: adverse
        ? 'One of ' + chk.searches.length + ' searches returned a record. The rest are clear.'
        : 'All ' + chk.searches.length + ' searches returned clear.',
      ref: chk.id
    });
    must(WF.transition(store, ext(), app.id, 'BACKGROUND_CHECK_COMPLETE', {}),
         cand.name + ' having a check returned');

    if (adverse) {
      openAdverseSequence(app, cand, st, chk, backAt);
      return;
    }

    /* Onboarding starts by itself once the check is back. */
    WF.settle(store, sys(), app.id);

    /* -------------------------------------------------------- steps 11-14 - */

    /* Clamped to just before the present. A completed task is a record of work
       that was done, so it may never carry a future date, and a candidate whose
       replay stops inside onboarding is by definition still onboarding now. */
    const onboardEnd = Math.min(backAt + Math.round(2.6 * DAY * pace), NOW - HOUR);
    if (onboardEnd <= backAt) {
      throw new Error(cand.name + ' applied ' + spec.daysAgo + ' days ago, which is not long enough to ' +
                      'reach onboarding at their pace. The check came back ' +
                      Math.round((backAt - NOW) / HOUR) + 'h relative to the present. Increase daysAgo.');
    }
    if (stage === 'ONBOARDING' || stage === 'ONBOARDING_REHIRE') {
      /* Only the candidate's own tasks are done. The software and human tasks
         are still running, which is what the parallel picture is meant to show,
         and for the rehire the carried-forward rows stay visible as carried
         forward. */
      completeTasks(app, st, backAt, onboardEnd, {
        only: ['i9_s1', 'w4', 'direct_dep', 'policies'], afterStart: false
      });
      at(onboardEnd);
      return;
    }

    completeTasks(app, st, backAt, onboardEnd, { afterStart: false });
    at(onboardEnd);
    WF.settle(store, sys(), app.id);

    if (stage === 'READY_FOR_SHIFT') return;

    /* --------------------------------------------------------- step 15 ---- */

    const scheduledAt = onboardEnd + 40 * MIN;
    const noticeDays = spec.notice != null ? spec.notice : 16;
    const startAt = sixAmUTC(scheduledAt + noticeDays * DAY);
    if (stage !== 'SHIFT_SCHEDULED' && startAt > NOW) {
      throw new Error(cand.name + ' would start ' + Math.round((startAt - NOW) / DAY) + ' days after the ' +
                      'present, so nothing past step 16 can be replayed for them. They applied ' +
                      spec.daysAgo + ' days ago and the journey to a first shift took ' +
                      Math.round((startAt - app.appliedAt) / DAY) + ' days at their pace. Increase daysAgo.');
    }
    at(scheduledAt);
    must(WF.transition(store, mgr(st), app.id, 'FIRST_SHIFT_SCHEDULED',
      { startsAt: startAt, workMs: 4 * MIN }), cand.name + ' having a first shift placed');
    const shift = store.byId('shifts', TENANT, app.firstShiftId);
    if (shift) {
      shift.kind = 'first_shift';
      /* The instant the shift was written, which is what the advance-notice
         rule actually runs from. Without it the clock reconstructs the instant
         from the notice days, which is a reconstruction of something we know. */
      shift.noticeAt = scheduledAt;
      shift.confirmState = 'confirmed';
      shift.confirmedAt = scheduledAt + 5 * HOUR;
      store.markDirty();
    }

    if (stage === 'SHIFT_SCHEDULED') return;

    /* --------------------------------------------------------- step 16 ---- */

    at(startAt);
    must(WF.transition(store, ext(), app.id, 'STARTED', { at: startAt }), cand.name + ' starting');

    /* The two tasks that genuinely could not happen earlier: Form I-9 section 2
       and the E-Verify case. Both are due from the first day of work for pay. */
    completeTasks(app, st, startAt, startAt + 2 * DAY, { afterStart: true });
    openEverifyCase(app, cand, startAt, stage === 'EVERIFY_MISMATCH');

    if (stage === 'EVERIFY_MISMATCH') {
      applyMismatch(app, cand, st, startAt, NOW);
      return;
    }
    if (stage === 'STARTED') return;

    /* ------------------------------------------------------- steps 17-20 -- */

    const target = { DAY_30: 30, DAY_60: 60, DAY_90: 90 }[stage];
    if (target == null) throw new Error('no replay is written for stage "' + stage + '"');
    const chain = [['STARTED', 'DAY_30', 30], ['DAY_30', 'DAY_60', 60], ['DAY_60', 'DAY_90', 90]];
    chain.forEach(([from, to, days]) => {
      if (days > target) return;
      /* The guards are date based, so the cursor moves and the guard fires for
         the real reason. A day 30 event is written because thirty days have
         genuinely passed on this clock. */
      at(startAt + days * DAY + 9 * HOUR);
      const live = store.byId('applications', TENANT, app.id);
      if (live.state !== from) return;
      must(WF.transition(store, ctx({ type: 'system', name: 'Check-in agent' }), app.id, to, {}),
           cand.name + ' reaching ' + to);
    });
  }

  /* ============================================================ helpers === */

  /**
   * The manager's words for one decision, off the cast row.
   *
   * The floor is forty characters and the engine's own floor is twelve. The
   * difference is deliberate: the engine's floor stops a decision row with
   * nothing in the reason field, which is the thing a plaintiff's expert asks
   * for. This floor stops a decision row with a TEMPLATE in it, which is the
   * thing a buyer notices on the second candidate record they open.
   */
  function decisionReason(spec, cand) {
    const given = typeof spec.decidedBecause === 'string' ? spec.decidedBecause.trim() : '';
    if (given.length < 40) {
      throw new Error(cand.name + ' reaches a decision at stage ' + spec.stage + ' and the cast row has ' +
                      (given ? 'a reason too short to be one: "' + given + '"' : 'no decidedBecause on it') +
                      '. Every decision in the seeded data is written for that person against that ' +
                      'person\'s own evidence, and there is no default, because one shared sentence across ' +
                      'nineteen decisions is what the review found.');
    }
    return given;
  }

  /** When the seat was taken, which is when somebody approved the hire. */
  function decisionAt(app) {
    const dec = store.byId('decisions', TENANT, app.decisionId);
    return dec ? dec.at : 0;
  }

  function nameOf(app) {
    const c = store.byId('candidates', TENANT, app.candidateId);
    return c ? c.name : app.candidateId;
  }

  function managerOf(reqRow) {
    const s = store.byId('stores', TENANT, reqRow.storeId);
    return s ? s.manager : null;
  }

  /** A refused move during the seed is a defect in the seed, not a data point. */
  function must(result, what) {
    if (!result || !result.ok) {
      throw new Error('the engine refused ' + what + ': ' +
                      ((result && result.reason) || 'no reason returned') +
                      '. The seed replays through the real engine, so a refusal here is a seed bug.');
    }
    return result;
  }

  /** The last instant anything was recorded against one application. */
  function lastEventAt(applicationId) {
    const evs = store.where('workflowEvents', TENANT, (e) => e.applicationId === applicationId);
    return evs.reduce((n, e) => (e.at > n ? e.at : n), 0);
  }

  /**
   * Wind the agency's searches in.
   *
   * A search returns no later than its own expected time, so the county running
   * long is still out when everybody else is back. Three field names are set
   * because three modules read three different ones, which is a defect worth
   * naming rather than working around silently: the engine guard reads `status`,
   * the effect that closes the check reads `status` or `outcome`, and the FCRA
   * sequence reads `result`.
   */
  function returnSearches(chk, backAt, adverse) {
    const counties = chk.searches.filter((s) => String(s.key).indexOf('county_') === 0);
    const recordOn = adverse ? counties[0] : null;
    chk.searches.forEach((s) => {
      const expected = s.expectedMs != null ? s.expectedMs : 24 * HOUR;
      s.orderedAt = chk.orderedAt;
      s.returnedAt = Math.min(backAt, chk.orderedAt + expected);
      const isRecord = recordOn && s.key === recordOn.key;
      s.status = isRecord ? 'record' : 'clear';
      s.result = isRecord ? 'record_found' : 'clear';
    });
    store.markDirty();
  }

  /**
   * Return only the searches whose expected time has genuinely elapsed.
   *
   * The expectation is OURS. It is the previous build's demo constant, carried
   * unchanged, and it is not measured court turnaround. Legal deadlines are all
   * published and operating durations are published by nobody, which is exactly
   * why a page showing this has to say whose number it is.
   */
  function returnElapsedSearches(chk, upTo) {
    const done = [];
    chk.searches.forEach((s) => {
      if (s.status !== 'pending') return;
      const expected = s.expectedMs != null ? s.expectedMs : 24 * HOUR;
      const due = chk.orderedAt + expected;
      s.orderedAt = chk.orderedAt;
      if (due > upTo) return;
      s.returnedAt = due;
      s.status = 'clear';
      s.result = 'clear';
      done.push(s);
    });
    store.markDirty();
    return done.sort((a, b) => a.returnedAt - b.returnedAt);
  }

  /**
   * The FCRA notice sequence, mid-flight.
   *
   * The pre-adverse notice has gone out and the gap is running, which is the
   * state that shows the sequence cannot be collapsed. The gap number is TENANT
   * POLICY and never law: 15 U.S.C. 1681b(b)(3) requires a reasonable period
   * and sets no number at all.
   */
  function openAdverseSequence(app, cand, st, chk, backAt) {
    const gap = COMPLY.fcraGap(store, sys());
    const sentAt = backAt + 3 * HOUR;
    chk.adverseProcess = {
      stage: 'pre_adverse_sent',
      owner: 'human',
      rule: 'FCRA 15 U.S.C. 1681b(b)(3). Pre-adverse notice with a copy of the report and the summary ' +
            'of rights, a reasonable gap, then the adverse notice.',
      preAdverseSentAt: sentAt,
      preAdverseSentBy: st.manager,
      adverseSentAt: null,
      gapDays: gap.days,
      gapUnit: gap.unit,
      gapBasis: gap.basis
    };
    store.markDirty();

    at(sentAt);
    const r = CONN.call(store, mgr(st), 'messaging', 'email', {
      to: cand.email, templateId: 'pre_adverse_v1',
      applicationId: app.id, candidateId: cand.id,
      subject: 'About your background check'
    }, { at: sentAt });
    EV.communication(store, mgr(st), {
      at: sentAt, channel: 'email', to: cand.email,
      candidateId: cand.id, applicationId: app.id, templateId: 'pre_adverse_v1',
      subject: 'About your background check',
      status: r.ok ? 'sent' : 'failed',
      providerRef: r.externalRef || null, mode: r.mode, error: r.error || null
    });
    EV.workflowEvent(store, mgr(st), {
      applicationId: app.id, candidateId: cand.id, at: sentAt,
      kind: 'work', state: 'BACKGROUND_CHECK_COMPLETE', step: 10, owner: 'human',
      actorType: 'human', actor: st.manager, durationMs: 11 * MIN,
      detail: 'Pre-adverse notice sent with a copy of the report and the summary of rights. ' +
              'The gap of ' + gap.days + ' ' + gap.unit + ' is this customer\'s policy, not a statutory period.'
    });
    EV.auditEvent(store, mgr(st), {
      at: sentAt, action: 'fcra.pre_adverse.sent',
      actorType: 'human', actor: st.manager,
      subjectType: 'backgroundCheck', subjectId: chk.id,
      applicationId: app.id, candidateId: cand.id,
      why: 'A county search returned a record. The person is owed a copy of the report and a ' +
           'reasonable period to dispute it before any adverse action.',
      detail: { gapDays: gap.days, gapUnit: gap.unit, isLaw: false },
      source: 'ui'
    });

    /* An attempt to reject, refused, because the gap is still open. The refusal
       is the thing worth showing and it should be on the record before the demo
       starts rather than produced live. */
    at(sentAt + 26 * HOUR);
    const refused = WF.transition(store, mgr(st), app.id, 'REJECTED',
      { reason: 'Tried to close this out on the report alone.' });
    if (refused.ok) {
      throw new Error('the engine allowed a rejection while the pre-adverse gap was open. ' +
                      'That is the one thing the adverse action bar exists to stop.');
    }
    at(NOW);
  }

  /**
   * Create the E-Verify case at the point the task completes.
   *
   * A new case is required for every new hire and it is never reused, which is
   * why a returning worker gets one as well. E-Verify User Manual section 2.
   */
  function openEverifyCase(app, cand, startAt, mismatch) {
    const task = store.first('onboardingTasks', TENANT,
      (t) => t.applicationId === app.id && t.key === 'everify');
    const createdAt = task && task.completedAt != null ? task.completedAt : startAt + 3 * HOUR;
    at(createdAt);
    const r = CONN.call(store, sys(), 'everify', 'create_case', {
      applicationId: app.id, candidateId: cand.id,
      caseStatus: mismatch ? 'TENTATIVE_NONCONFIRMATION' : 'EMPLOYMENT_AUTHORIZED'
    }, { at: createdAt });
    app.everify = {
      caseRef: r.externalRef,
      createdAt,
      status: r.data ? r.data.caseStatus : null,
      source: mismatch ? 'SSA' : null,
      tncIssuedAt: null, decision: null, decisionAt: null,
      referredAt: null, contactedAt: null, resolvedAt: null,
      lastPolledAt: createdAt,
      likelyCause: null, appointment: null, note: null
    };
    store.markDirty();
  }

  /**
   * The mismatch, contested.
   *
   * Every clock on this case is computed from these dates and none of them is
   * written down anywhere as a duration. There is no E-Verify case result that
   * means "contesting": E-Verify publishes six results and none of them is a
   * countdown, so the product holds the contest itself and watches for Case in
   * Continuance.
   */
  function applyMismatch(app, cand, st, startAt, now) {
    const created = app.everify ? app.everify.createdAt : startAt + 3 * HOUR;
    const tncIssued = addBusinessDays(startAt, 1) + 2 * HOUR;
    const decisionAt = tncIssued + Math.round(5.7 * HOUR);
    Object.assign(app.everify, {
      status: 'CASE_IN_CONTINUANCE',
      seedStatus: 'TENTATIVE_NONCONFIRMATION',
      source: 'SSA',
      tncIssuedAt: tncIssued,
      decision: 'contesting',
      decisionAt,
      referredAt: decisionAt + 8 * MIN,
      /* Deliberately null. Case in Continuance is supposed to mean the employee
         has been in touch, but the appointment is still ahead, so inferring
         contact from the case status would report a resolved clock for somebody
         who has not been yet. */
      contactedAt: null,
      resolvedAt: null,
      lastPolledAt: now,
      likelyCause: 'Surname hyphenated after marriage in March. The SSA record still holds the earlier ' +
                   'name. This is the most common cause of a mismatch and it has nothing to do with the ' +
                   'right to work.',
      appointment: 'SSA appointment booked for ' + fmtDate(now + 2 * DAY) + '.',
      note: 'There is no E-Verify case status that means contesting, so the product holds that itself.'
    });
    store.markDirty();

    at(tncIssued);
    EV.raiseException(store, sys(), {
      at: tncIssued, applicationId: app.id, candidateId: cand.id, storeId: app.storeId,
      kind: 'everify_mismatch', severity: 'crit', owner: 'human',
      /* It does not block progress. She is employed and working, and stopping
         her progress would itself be one of the barred actions. */
      blocksProgress: false,
      title: 'E-Verify mismatch, contested. Every adverse action is barred.',
      detail: COMPLY.EVERIFY_BAR_RULE + ' Termination, suspension, withheld or lowered pay, delayed ' +
              'training and removed shifts are all unlawful until the case reaches a Final Nonconfirmation.',
      nextAction: 'Nothing. Let the case run. The employee has an SSA appointment booked.'
    });
    EV.auditEvent(store, sys(), {
      at: tncIssued, action: 'everify.mismatch',
      actorType: 'system', actor: 'E-Verify connector',
      subjectType: 'application', subjectId: app.id,
      applicationId: app.id, candidateId: cand.id,
      why: 'Tentative nonconfirmation issued by SSA. The employee was notified privately and referred ' +
           'the same day.',
      detail: { source: 'SSA', caseRef: app.everify.caseRef },
      source: 'connector'
    });

    /* Two attempts to cut her shifts, both refused. Three of the five barred
       actions happen in systems this product does not own, so the bar has to be
       VISIBLE before somebody acts rather than only refused when they try. */
    [-2 * DAY, -6 * HOUR].forEach((offset) => {
      const tryAt = now + offset;
      at(tryAt);
      EV.auditEvent(store, ctx({ type: 'human', name: st.manager, role: 'Store manager' }), {
        at: tryAt, action: 'shift.remove',
        actorType: 'human', actor: st.manager,
        subjectType: 'application', subjectId: app.id,
        applicationId: app.id, candidateId: cand.id,
        outcome: 'refused',
        why: COMPLY.EVERIFY_BAR_RULE + ' The case has not reached a Final Nonconfirmation, so removing ' +
             'scheduled shifts is one of the five barred actions.',
        detail: { attempted: 'Remove scheduled shifts' },
        source: 'ui'
      });
    });
    at(now);
  }

  /**
   * Complete onboarding tasks inside a window.
   *
   * Prerequisites are enforced rather than assumed. The task table is already
   * ordered so that a task follows everything it needs, and this refuses to
   * complete one whose prerequisite is still open, so a reordering of that
   * table is a crash here instead of a payroll record created before the W-4
   * that feeds it.
   *
   * A carried-forward task is satisfied at the moment of the fan-out, because
   * the work was genuinely done in a previous spell. It keeps `carriedForward`
   * and the sentence explaining it, so the screen can still say so.
   */
  function completeTasks(app, st, from, to, filter) {
    const f = filter || {};
    const rows = store.where('onboardingTasks', TENANT, (t) => t.applicationId === app.id);
    const wanted = rows.filter((t) => {
      if (!!t.afterStart !== !!f.afterStart) return false;
      if (f.only && f.only.indexOf(t.key) < 0) return false;
      return true;
    });
    const span = Math.max(1, to - from);

    wanted.forEach((t, n) => {
      if (t.status === 'complete') return;
      const doneAt = t.carriedForward ? from : from + Math.round(span * ((n + 1) / (wanted.length + 1)));
      const open = (t.needs || []).filter((k) => {
        const dep = rows.find((x) => x.key === k);
        return !dep || dep.status !== 'complete';
      });
      if (open.length) {
        throw new Error('cannot complete "' + t.key + '" on ' + app.id + ' because ' +
                        open.join(', ') + ' is not complete. The onboarding table has been reordered.');
      }
      t.status = 'complete';
      t.startedAt = t.startedAt || (t.carriedForward ? from : from);
      t.completedAt = doneAt;
      t.durationMs = t.carriedForward ? 0 : null;
      store.markDirty();

      at(doneAt);
      EV.workflowEvent(store, sys(), {
        applicationId: t.applicationId, candidateId: t.candidateId, at: doneAt,
        kind: 'work', state: null, step: t.step, owner: t.owner,
        actorType: t.carriedForward ? 'system'
          : t.owner === 'human' ? 'human'
          : t.actor === 'candidate' ? 'external' : 'system',
        actor: t.carriedForward ? 'Rehire carry-forward'
          : t.owner === 'human' ? st.manager
          : t.actor === 'candidate' ? 'Candidate' : 'Onboarding',
        durationMs: t.carriedForward ? 0 : taskEstimate(t.key),
        detail: t.carriedForward
          ? t.name + ' carried forward. ' + (t.carriedWhy || '')
          : t.name + ' completed.'
      });
    });
  }

  /* ------------------------------------------- seats, and closing a job ---
     A REQUISITION THAT NEVER CLOSES CANNOT REPORT A FILLED OPENING, which is
     the thing the buyer in the review said is the only thing they buy. Before
     this, all eight requisitions were status 'open' for ever, six people were
     committed against two seats on one of them, and the careers page was still
     advertising a Bakery Assistant role filled in April.

     The seat rule is written once, here, and the engine needs the same one at
     runtime so an approval cannot over-commit a requisition. That is a change
     in engine.js and effects.js, which this file does not own, so it is a
     handoff rather than a second copy: what the seed does is arrange the data
     so no requisition is over-committed and close the ones that are full.
     ---------------------------------------------------------------------- */

  const seatHolders = {};
  store.all('applications', TENANT).forEach((a) => {
    if (!holdsASeat(store, TENANT, a)) return;
    (seatHolders[a.requisitionId] = seatHolders[a.requisitionId] || []).push(a);
  });

  REQUISITIONS.forEach((r) => {
    const row = reqByKey[r.key];
    const held = (seatHolders[row.id] || []).slice()
      .sort((x, y) => decisionAt(x) - decisionAt(y));
    if (held.length > row.openings) {
      throw new Error(row.key + ' has ' + row.openings + ' opening(s) and ' + held.length +
                      ' people committed against it: ' +
                      held.map((a) => nameOf(a)).join(', ') +
                      '. Move somebody to another requisition or open more seats. A demo that commits ' +
                      'more people than there are jobs is the first thing a store operator notices.');
    }
    if (held.length < row.openings) return;

    const last = held[held.length - 1];
    const closedAt = decisionAt(last);
    row.status = 'closed';
    row.closedAt = closedAt;
    row.closedBy = managerOf(row);
    row.closedBecause = 'Filled: ' + held.length + ' of ' + row.openings + ' openings covered. Closed to ' +
                        'new applications when ' + nameOf(last) + ' was approved.';
    store.markDirty();

    at(closedAt);
    EV.auditEvent(store, ctx({ type: 'human', name: row.closedBy, role: 'Store manager' }), {
      at: closedAt, action: 'requisition.closed',
      actorType: 'human', actor: row.closedBy,
      subjectType: 'requisition', subjectId: row.id,
      why: row.closedBecause,
      detail: { openings: row.openings, covered: held.length,
                filledBy: held.map((a) => a.candidateId) },
      source: 'ui'
    });
  });

  /* The store's open headcount, computed from its own requisitions rather than
     written down twice. See the comment on STORES. */
  STORES.forEach((s) => {
    const row = storeByKey[s.key];
    const open = store.where('requisitions', TENANT, (r) => r.storeId === row.id && r.status === 'open');
    row.openings = open.reduce(
      (n, r) => n + Math.max(0, r.openings - ((seatHolders[r.id] || []).length)), 0);
    store.markDirty();
  });

  /* --------------------------------------------------------- finish up --- */

  at(NOW);
  store.db.meta.seededCandidates = CAST.length;
  store.db.meta.seedEvaluationMode = useLLM ? 'llm' : 'deterministic-fallback';
  store.db.meta.tenantId = TENANT;

  proveTheDemo(store, ctx, NOW);

  store.flushNow();

  return {
    tenantId: TENANT,
    tenantName: TENANT_NAME,
    stores: store.all('stores', TENANT).length,
    requisitions: store.all('requisitions', TENANT).length,
    candidates: store.all('candidates', TENANT).length,
    applications: store.all('applications', TENANT).length,
    priorEmployment: store.all('priorEmployment', TENANT).length,
    workflowEvents: store.all('workflowEvents', TENANT).length,
    auditEvents: store.all('auditEvents', TENANT).length,
    consents: store.all('consents', TENANT).length,
    evaluationMode: store.db.meta.seedEvaluationMode
  };
}

/* ===========================================================================
   THE SELF CHECK

   Every one of these is a demo beat that has broken at some point, or a
   property the seed's whole claim rests on. They run at the end of seeding and
   throw, because a demo dataset that is quietly missing its most interesting
   case is worse than a boot that fails.
   ======================================================================== */

function proveTheDemo(store, ctx, NOW) {
  const c = ctx({ type: 'system', name: 'Seed self check' });
  const fail = [];
  const check = (ok, why) => { if (!ok) fail.push(why); };
  const person = (name) => {
    const cand = store.first('candidates', TENANT, (x) => x.name === name);
    if (!cand) return null;
    return store.first('applications', TENANT, (a) => a.candidateId === cand.id);
  };

  const apps = store.all('applications', TENANT);
  check(apps.length === CAST.length, 'expected ' + CAST.length + ' applications, found ' + apps.length);
  check(store.all('requisitions', TENANT).length === REQUISITIONS.length,
        'expected ' + REQUISITIONS.length + ' requisitions, found ' + store.all('requisitions', TENANT).length);
  check(store.all('stores', TENANT).length === 5, 'there are not five stores');
  check(store.all('priorEmployment', TENANT).length === 3, 'there are not three prior employment rows');
  check(store.where('priorEmployment', TENANT, (p) => p.rehireEligible === false).length === 1,
        'exactly one prior employment row must be marked not eligible for rehire');
  check(store.where('stores', TENANT, (s) => s.home).length === 1,
        'exactly one store must be the home store, because the careers page filter defaults to it');
  check(store.all('consents', TENANT).length === CAST.length,
        'every application needs a consent, because the retention clock starts there');

  /* No event may be dated after the present. An event about the past with a
     future timestamp is how the previous build reported a day 30 check-in that
     had not happened. */
  const future = store.all('workflowEvents', TENANT).filter((e) => e.at > NOW);
  check(future.length === 0, future.length + ' workflow events are dated after the present: ' +
        future.map((e) => e.applicationId + ' ' + (e.state || e.kind) + ' +' +
                          Math.round((e.at - NOW) / 3600000) + 'h').join(', '));

  /* Nor before the application it belongs to. */
  const early = [];
  apps.forEach((a) => {
    store.where('workflowEvents', TENANT, (e) => e.applicationId === a.id)
      .forEach((e) => { if (e.at < a.appliedAt) early.push(a.id); });
  });
  check(early.length === 0, early.length + ' workflow events predate the application they belong to');

  /* No requisition may be younger than an application to it. */
  const backdated = apps.filter((a) => {
    const r = store.byId('requisitions', TENANT, a.requisitionId);
    return r && a.appliedAt < r.openedAt;
  });
  check(backdated.length === 0, backdated.length + ' applications arrived before their requisition opened');

  /* TEN BUSINESS DAYS FROM THE POSTING, before every application in the data.
     The notice under Local Law 144 has to be given before the tool is used and
     the tool is used on the day somebody applies, so a clock that starts at
     consent can never be satisfied. Whichever instant the compliance module
     ends up starting from, this dataset supports it, and the check is here so a
     later change to daysAgo or to the posting spread cannot quietly take that
     away. */
  const tooSoon = apps.filter((a) => {
    const r = store.byId('requisitions', TENANT, a.requisitionId);
    return r && addBusinessDays(r.openedAt, 10) > a.appliedAt;
  });
  check(tooSoon.length === 0, tooSoon.length + ' application(s) arrived less than ten business days after ' +
        'their job was posted, so notice served on the posting could not cover them: ' +
        tooSoon.map((a) => a.id).join(', '));
  const opens = new Set(store.all('requisitions', TENANT).map((r) => r.openedAt));
  check(opens.size === REQUISITIONS.length,
        'two requisitions share an openedAt, so the age figure is one number printed twice');

  /* No negative span. The whole argument of the product is duration. */
  const negative = [];
  apps.forEach((a) => {
    const s = MET.spans(store, c, a.id);
    Object.keys(s).forEach((k) => { if (s[k] != null && s[k] < 0) negative.push(a.id + ' ' + k); });
  });
  check(negative.length === 0, 'negative durations: ' + negative.join(', '));

  /* The rehire that holds a person. */
  const trevor = person('Trevor Boone');
  check(!!trevor && trevor.state === 'ELIGIBILITY_REVIEW',
        'Trevor Boone must be held at eligibility review rather than refused by a machine');
  check(!!trevor && !!(trevor.eligibility && trevor.eligibility.holdForPerson),
        'Trevor Boone must carry a hold for a person');
  check(!!trevor && store.where('exceptions', TENANT,
        (e) => e.applicationId === trevor.id && e.kind === 'rehire_flag' && e.blocksProgress && !e.resolvedAt).length === 1,
        'Trevor Boone must have one open blocking rehire exception');

  /* The hard rule that refuses deterministically. */
  const shantel = person('Shantel Ruiz');
  check(!!shantel && shantel.state === 'INELIGIBLE', 'Shantel Ruiz must be ineligible');
  check(!!shantel && (shantel.eligibility.failedKeys || []).indexOf('availability') >= 0,
        'Shantel Ruiz must fail on availability by name');

  /* The rehire that carries work forward. */
  const teresa = person('Teresa Alvarado');
  check(!!teresa && !!(teresa.rehire && teresa.rehire.matched && teresa.rehire.i9.reusable),
        'Teresa Alvarado must match a prior spell inside the three-year I-9 window');
  check(!!teresa && store.where('onboardingTasks', TENANT,
        (t) => t.applicationId === teresa.id && t.carriedForward).length > 0,
        'Teresa Alvarado must have at least one carried-forward onboarding task');

  /* The background check that returned a record, at the home store. B-29. */
  const dara = person('Dara Simmons');
  const home = store.first('stores', TENANT, (s) => s.home);
  check(!!dara && dara.storeId === home.id,
        'Dara Simmons must be at the home store, or the FCRA beat is invisible to the default viewer');
  check(!!dara && dara.state === 'BACKGROUND_CHECK_COMPLETE', 'Dara Simmons must be at check returned');
  check(!!dara && store.where('exceptions', TENANT,
        (e) => e.applicationId === dara.id && e.kind === 'adverse_review' && !e.resolvedAt).length === 1,
        'Dara Simmons must have one open adverse review exception');
  if (dara) {
    const seq = COMPLY.fcraSequence(store, c, dara);
    check(!!seq, 'Dara Simmons must have an FCRA sequence to show');
    check(!!seq && seq.mayTakeAdverseAction === false,
          'the FCRA gap on Dara Simmons must still be running, or the sequence looks collapsible');
    const bar = COMPLY.adverseBar(store, c, dara);
    check(!!bar && bar.attempts.length >= 1,
          'the refused attempt on Dara Simmons is the demonstration and it must be on the record');
  }

  /* The E-Verify mismatch, also at the home store. */
  const kayla = person('Kayla Brennan-Ross');
  check(!!kayla && kayla.storeId === home.id, 'Kayla Brennan-Ross must be at the home store');
  check(!!kayla && !!(kayla.everify && kayla.everify.decision === 'contesting'),
        'Kayla Brennan-Ross must be contesting an E-Verify mismatch');
  if (kayla) {
    const bar = COMPLY.adverseBar(store, c, kayla);
    check(!!bar && bar.active, 'the adverse action bar must be up on Kayla Brennan-Ross');
    check(!!bar && bar.attempts.filter((x) => x.what === 'Remove scheduled shifts').length === 2,
          'both refused attempts to remove Kayla Brennan-Ross shifts must be on the record');
  }

  /* The offer that went quiet, still answerable. */
  const ruthie = person('Ruthie Nakamura');
  if (ruthie) {
    const off = store.byId('offers', TENANT, ruthie.offerId);
    check(!!off && off.status === 'sent', 'Ruthie Nakamura must have an unanswered offer');
    check(!!off && off.expiresAt > NOW && off.expiresAt - NOW < 2 * DAY,
          'Ruthie Nakamura offer must be close to expiring and not already past it');
    check(store.where('communications', TENANT,
          (x) => x.applicationId === ruthie.id && x.templateId === 'offer_chase_v1').length === 2,
          'Ruthie Nakamura must have been chased twice');
  }

  /* The weak screening a person rejected, and the override of an advance. */
  const casey = person('Casey Mbeki');
  check(!!casey && casey.state === 'REJECTED', 'Casey Mbeki must be rejected by a person');
  if (casey) {
    const dec = store.byId('decisions', TENANT, casey.decisionId);
    check(!!dec && dec.by === 'Marcus Hale' && !!dec.reason,
          'the rejection of Casey Mbeki must name the person and carry a reason');
    check(!!dec && !!dec.evaluationSnapshot,
          'the decision on Casey Mbeki must snapshot what the person was looking at');
  }
  const lorne = person('Lorne Fitzgerald');
  if (lorne) {
    const dec = store.byId('decisions', TENANT, lorne.decisionId);
    check(!!dec && dec.evaluationSnapshot && dec.evaluationSnapshot.recommendation === 'advance',
          'Lorne Fitzgerald must have been rejected against an advance recommendation, ' +
          'or the override beat has nothing to override');
  }

  /* Advance notice, both ways. */
  const ingrid = person('Ingrid Solberg');
  const aaron = person('Aaron Delacroix');
  [[ingrid, true, 'Ingrid Solberg'], [aaron, false, 'Aaron Delacroix']].forEach(([a, satisfied, who]) => {
    if (!a) { fail.push(who + ' is missing'); return; }
    const clocks = COMPLY.clocksFor(store, c, a);
    const fw = clocks.find((x) => x.key === 'fair_workweek');
    check(!!fw, who + ' must have a fair workweek clock');
    check(!!fw && fw.satisfied === satisfied,
          who + ' advance notice must be ' + (satisfied ? 'satisfied' : 'inside the window and payable'));
    const sh = store.first('shifts', TENANT, (s) => s.applicationId === a.id);
    check(!!sh && sh.startsAt > NOW, who + ' first shift must still be ahead of the present');
  });

  /* Every started candidate got through the pre-shift gate. */
  const started = apps.filter((a) => a.startedAt != null);
  check(started.length >= 6, 'at least six people must have started, found ' + started.length);
  started.forEach((a) => {
    const open = store.where('onboardingTasks', TENANT,
      (t) => t.applicationId === a.id && t.preShift && t.status !== 'complete');
    check(open.length === 0, a.id + ' started with ' + open.length + ' pre-shift tasks still open');
  });

  /* Nothing stored may carry a bank its requisition no longer has. That is the
     drift S-04 closed, and a stored screening is exactly where it hid. */
  const stale = [];
  store.all('screenings', TENANT).forEach((s) => {
    if (s.kind !== 'call') return;
    const a = store.byId('applications', TENANT, s.applicationId);
    const r = a && store.byId('requisitions', TENANT, a.requisitionId);
    if (!r) return;
    if (JSON.stringify(s.questions) !== JSON.stringify(r.screeningQuestions)) stale.push(s.id);
  });
  check(stale.length === 0, stale.length + ' stored screenings carry a bank their requisition no longer has');

  /* Availability may only be scored against hours the role needs. */
  const wrongHours = [];
  store.all('requisitions', TENANT).forEach((r) => {
    const q = (r.screeningQuestions || []).find((x) => x.key === 'availability');
    if (!q) return;
    const bank = (q.positivePhrases || []).concat(q.concernPhrases || []);
    const inBank = (x) => bank.indexOf(x) >= 0;
    const days = daysOf(r.requiredSlots);
    const parts = partsOf(r.requiredSlots);

    if (!WEEKEND_DAYS.some((d) => days.indexOf(d) >= 0) &&
        WEEKEND_POS.concat(WEEKEND_NEG).some(inBank)) {
      wrongHours.push(r.key + ' scores weekend language with no weekend slot');
    }
    if (!WEEKDAY_DAYS.some((d) => days.indexOf(d) >= 0) && WEEKDAY_NEG.some(inBank)) {
      wrongHours.push(r.key + ' scores weekday language with no weekday slot');
    }
    ['open', 'evening', 'night'].forEach((p) => {
      if (parts.indexOf(p) >= 0) return;
      if ((SLOT_POS[p] || []).concat(SLOT_NEG[p] || []).some(inBank)) {
        wrongHours.push(r.key + ' scores ' + p + ' shifts it does not have');
      }
    });
  });
  check(wrongHours.length === 0, 'availability is scored against hours the role does not need: ' + wrongHours.join(', '));

  /* Every met verdict on availability must be supported by two or more phrases
     from that requisition's own bank. */
  const unsupported = [];
  store.all('screenings', TENANT).forEach((s) => {
    if (s.kind !== 'call' || !s.evaluation) return;
    const crit = (s.evaluation.criteria || []).find((x) => x.key === 'availability_fit');
    if (!crit || crit.verdict !== 'met') return;
    const a = store.byId('applications', TENANT, s.applicationId);
    const r = a && store.byId('requisitions', TENANT, a.requisitionId);
    const q = r && (r.screeningQuestions || []).find((x) => x.key === 'availability');
    if (!q) return;
    const low = String(crit.evidence || '').toLowerCase();
    const hits = (q.positivePhrases || []).filter((p) => low.indexOf(p) >= 0);
    if (hits.length < 2) unsupported.push(s.id + ' (' + hits.length + ' phrase hits)');
  });
  check(unsupported.length === 0,
        'availability scored met on thin evidence: ' + unsupported.join(', '));

  /* ------------------------------------------------- openings and seats ---
     THE CHECK THE BUYER IN THE REVIEW ASKED FOR. Six people were committed
     against two seats on one requisition, a bakery role filled in April was
     still on the careers page, and no requisition in the product had ever
     closed. All three are data properties, so all three are checked here.
     ---------------------------------------------------------------------- */
  const seatsOn = (reqRow) => apps.filter(
    (a) => a.requisitionId === reqRow.id && holdsASeat(store, TENANT, a));
  const PRE_DECISION = ['APPLICATION_RECEIVED', 'ELIGIBILITY_REVIEW', 'ELIGIBLE', 'SCREENING_PENDING',
                        'SCREENING_IN_PROGRESS', 'SCREENING_COMPLETE', 'INTERVIEW_PENDING',
                        'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETE', 'DECISION_PENDING'];
  const reqs = store.all('requisitions', TENANT);
  let closedCount = 0, homeClosed = 0, openSeatsLeft = 0, homeSeatsLeft = 0;

  reqs.forEach((r) => {
    const held = seatsOn(r);
    check(held.length <= r.openings,
          r.key + ' has ' + r.openings + ' opening(s) and ' + held.length + ' people committed against it');
    if (r.status === 'closed') {
      closedCount++;
      if (r.storeId === home.id) homeClosed++;
      check(held.length === r.openings,
            r.key + ' is closed with ' + held.length + ' of ' + r.openings + ' openings covered, so it was ' +
            'closed for a reason nobody recorded');
      check(r.closedAt != null && !!r.closedBecause && !!r.closedBy,
            r.key + ' is closed with no closedAt, no reason and nobody named against it');
      const waiting = apps.filter((a) => a.requisitionId === r.id && PRE_DECISION.indexOf(a.state) >= 0);
      check(waiting.length === 0,
            r.key + ' is closed and ' + waiting.length + ' application(s) are still waiting to be ' +
            'screened or decided on it. That is the mess the closing rule exists to prevent.');
    } else {
      check(r.status === 'open', r.key + ' carries status "' + r.status + '", which is neither open nor closed');
      check(held.length < r.openings,
            r.key + ' is open with every seat committed, so it is advertising a job that is gone');
      openSeatsLeft += r.openings - held.length;
      if (r.storeId === home.id) homeSeatsLeft += r.openings - held.length;
    }
  });
  check(closedCount >= 2, 'no requisition in the seeded data has been filled and closed, so the product ' +
                          'can report nothing about filling an opening, found ' + closedCount);
  check(homeClosed >= 1, 'no closed requisition at the home store, so the beat is invisible to the default viewer');
  check(openSeatsLeft > 0, 'every open requisition is fully committed, so nobody in the decide queue can be hired');
  check(homeSeatsLeft > 0, 'the home store has no seat left, so approving anybody on stage over-commits a requisition');

  /* The careers page must not advertise a requisition that is closed. Checked
     through the real payload rather than by reading `status`, because the
     careers page is what a candidate sees. */
  const careersNow = careersPayload(store, c, {});
  const advertisedClosed = (careersNow.jobs || []).filter((j) => {
    const r = store.byId('requisitions', TENANT, j.id);
    return r && r.status !== 'open';
  });
  check(advertisedClosed.length === 0,
        advertisedClosed.length + ' closed requisition(s) are still on the careers page: ' +
        advertisedClosed.map((j) => j.key).join(', '));

  /* ------------------------------------------------------- the decisions ---
     ONE SENTENCE ON NINETEEN OF TWENTY-ONE DECISIONS is what the review found,
     and the buyer's words were that they stop believing the audit trail. So
     every reason has to be this person's, and where the decision does not
     follow the evidence the reason has to say so.
     ---------------------------------------------------------------------- */
  const decs = store.all('decisions', TENANT);
  const seenReasons = {};
  decs.forEach((d) => {
    const who = store.byId('candidates', TENANT, d.candidateId);
    const name = who ? who.name : d.candidateId;
    const reason = String(d.reason || '');
    const low = reason.toLowerCase();
    check(reason.trim().length >= 40,
          'the decision on ' + name + ' carries no reason worth reading: "' + reason + '"');
    check(!seenReasons[reason],
          'the decision on ' + name + ' repeats the reason recorded on ' + (seenReasons[reason] || '') +
          '. A shared sentence across two records is what made the audit trail unbelievable.');
    seenReasons[reason] = name;

    const snap = d.evaluationSnapshot;
    if (!snap) return;
    (snap.criteria || []).forEach((crit) => {
      if (crit.verdict === 'met' || crit.verdict === 'not_covered') return;
      const words = CRITERION_WORDS[crit.key] || [];
      check(words.some((w) => low.indexOf(w) >= 0),
            'the screening left ' + crit.key + ' at ' + crit.verdict + ' on ' + name + ' and the decision ' +
            'reason does not engage with it at all');
    });
    const wentAgainst = (d.outcome === 'approved' && snap.recommendation !== 'advance') ||
                        (d.outcome === 'rejected' && snap.recommendation === 'advance');
    if (!wentAgainst) return;
    check(OVERRIDE_WORDS.some((w) => low.indexOf(w) >= 0),
          name + ' was ' + d.outcome + ' against a recommendation of ' + snap.recommendation +
          ' and the reason does not say so. An unexplained departure from the process is the exhibit.');
  });
  const overrides = decs.filter((d) => d.evaluationSnapshot &&
    ((d.outcome === 'approved' && d.evaluationSnapshot.recommendation !== 'advance') ||
     (d.outcome === 'rejected' && d.evaluationSnapshot.recommendation === 'advance')));
  check(overrides.length >= 2,
        'the data holds ' + overrides.length + ' decisions that go against the recommendation. A product ' +
        'whose whole argument is that a person decides needs both directions in it.');

  /* -------------------------------------------------- steps 4 and 5 ----- */
  const interviewRoles = reqs.filter((r) => r.requiresManagerInterview);
  const notesSeen = {};
  interviewRoles.forEach((r) => {
    apps.filter((a) => a.requisitionId === r.id && a.decisionId).forEach((a) => {
      const iv = store.first('screenings', TENANT,
        (s) => s.applicationId === a.id && s.kind === 'manager_interview');
      const name = (store.byId('candidates', TENANT, a.candidateId) || {}).name || a.id;
      check(!!iv && iv.status === 'complete',
            name + ' was decided on ' + r.key + ', which requires a manager interview, and the interview ' +
            'is not recorded as held');
      if (!iv) return;
      check(!!iv.notes && iv.notes.length >= 40 && !!iv.notesBy,
            'the manager interview for ' + name + ' has no notes worth reading against a named person');
      check(iv.evaluation === null,
            'the manager interview for ' + name + ' carries an evaluation. Nothing may score an interview.');
      check(!notesSeen[iv.notes],
            'the interview note on ' + name + ' repeats the note on ' + (notesSeen[iv.notes] || '') + '.');
      notesSeen[iv.notes] = name;
    });
  });
  check(interviewRoles.length > 0 && Object.keys(notesSeen).length >= 4,
        'fewer than four manager interviews are recorded, and steps 4 and 5 carry the largest drop in the ' +
        'hire stage, so the demo has nothing to show there');

  /* ------------------------------------------------------ the personas ---
     A persona renders on a candidate surface, so prose in it about how long ago
     something happened is wrong the moment the +4h or +3d control is pressed.
     Owen Castellano's read "Offer sent yesterday" against an offer sent two
     days earlier.
     ---------------------------------------------------------------------- */
  const STALE = [/\b(yesterday|today|tomorrow|tonight)\b/,
                 /\b(this|last|next)\s+(morning|afternoon|evening|week|month)\b/,
                 /\bago\b/,
                 /\bwaiting\s+\w+\s+days?\b/,
                 /\bfor\s+\w+\s+days\b/];
  store.all('candidates', TENANT).forEach((cand) => {
    const p = String(cand.persona || '');
    STALE.forEach((rx) => {
      check(!rx.test(p), cand.name + ' carries a persona that talks about when something happened: "' + p +
                         '". It is wrong as soon as the clock moves.');
    });
  });

  /* ------------------------------------- the phrases that were deleted ---
     The lesson of 7 September: the fix reached the requisitions and missed
     thirty four stored screening records, which snapshot the bank when they are
     created. So this looks in the stored records and in the stored evaluations,
     not at the source list.
     ---------------------------------------------------------------------- */
  const PROXY_EVIDENCE = ['no car', 'no bus', 'transport is a problem'];
  const proxied = [];
  store.all('screenings', TENANT).forEach((s) => {
    (s.questions || []).forEach((q) => {
      (q.concernPhrases || []).concat(q.positivePhrases || []).forEach((p) => {
        if (PROXY_EVIDENCE.some((x) => String(p).toLowerCase().indexOf(x) >= 0)) {
          proxied.push(s.id + ' scores "' + p + '"');
        }
      });
    });
    const ev = s.evaluation;
    if (!ev) return;
    (ev.concerns || []).forEach((k) => {
      if (PROXY_EVIDENCE.some((x) => String(k.evidence || '').toLowerCase().indexOf(x) >= 0)) {
        proxied.push(s.id + ' quotes "' + k.evidence + '" as a concern');
      }
    });
    (ev.criteria || []).forEach((cr) => {
      if (cr.verdict === 'met') return;
      if (PROXY_EVIDENCE.some((x) => String(cr.evidence || '').toLowerCase().indexOf(x) >= 0)) {
        proxied.push(s.id + ' quotes "' + cr.evidence + '" as the evidence for ' + cr.verdict);
      }
    });
  });
  check(proxied.length === 0,
        proxied.length + ' stored screening record(s) still score or quote how somebody gets to work: ' +
        proxied.join('; '));

  if (fail.length) {
    throw new Error('the seeded dataset is missing ' + fail.length + ' of the things it exists to show:\n  ' +
                    fail.join('\n  '));
  }
}

/* ============================================================== helpers === */

/**
 * The screening collaborator.
 *
 * Injected, or imported from `./screening.js` where that module exists. It is
 * required and the seed refuses to run without it, because assembling a
 * transcript and scoring it against the store's phrase bank is that module's
 * job and a second copy of the rubric here is exactly how the question and the
 * bank drifted apart in the first place.
 */
async function resolveScreening(opts) {
  const given = opts.screening;
  const mod = given || await import('./screening.js').catch(() => null);
  if (!mod) {
    throw new Error(
      'seed.js needs a screening collaborator and found none. Pass opts.screening, or add ' +
      'server/lib/screening.js exporting runConversation(store, ctx, screening) and ' +
      'evaluate(store, ctx, screening, { forceFallback }). It is not duplicated here on purpose: ' +
      'a second copy of the rubric is how the question and the bank that scores it drifted apart.'
    );
  }
  const runConversation = mod.runConversation;
  const evaluate = mod.evaluate;
  if (typeof runConversation !== 'function' || typeof evaluate !== 'function') {
    throw new Error(
      'the screening collaborator must export runConversation and evaluate. It exports: ' +
      Object.keys(mod).join(', ') + '.'
    );
  }
  return { runConversation, evaluate };
}

/**
 * A plausible date of birth, two years clear of the role's minimum.
 *
 * Eligibility scores age on the day somebody APPLIED and not today, so a
 * candidate sitting exactly on the boundary now was under it four months ago.
 * That is the rule behaving correctly, so the seed moves rather than the rule.
 * The month is kept in the first half of the year because the demo's present is
 * in August and a later birthday would make the person a year younger than
 * intended.
 */
function dobFor(spec, minAge, anchorSim) {
  const h = CONN.hash(spec.first + spec.last);
  /* An explicit age where the cast row sets one, because three people answer
     the reliability question about school and the hash was giving them any age
     between eighteen and forty. A record saying "I have not missed a day of
     school this year" beside a date of birth in 1994 is a record that argues
     with itself. */
  if (spec.age != null) {
    if (spec.age < minAge) {
      throw new Error(spec.first + ' ' + spec.last + ' is given age ' + spec.age + ' and the role has a ' +
                      'minimum of ' + minAge + ', so eligibility would refuse them for a reason the cast ' +
                      'row invented rather than for anything about the demo.');
    }
  }
  const age = spec.age != null ? spec.age : minAge + 2 + (h % 24);
  const year = new Date(anchorSim).getUTCFullYear() - age;
  const month = (h % 7) + 1;
  const day = (h % 28) + 1;
  return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0') + 'T00:00:00.000Z';
}

/** The counties a background check has to cover. Read by the search scope. */
function countiesFor(st, i) {
  const extra = [{ name: 'Delaware', state: 'OH' }, { name: 'Clark', state: 'IN' }, { name: 'Boone', state: 'KY' }];
  const list = [{ name: st.county, state: st.state }];
  if (i % 3 === 0) list.push(extra[i % extra.length]);
  return list;
}

/**
 * One line of history, so the voice agent has something to open on.
 *
 * From the answer set, or from the cast row where the person's story is more
 * specific than the set: a returning worker, or somebody whose history is the
 * reason they are in the dataset. It used to be picked out of a bank of eight
 * lines by a hash of the person's name, which had nothing to do with what they
 * then said in their own answers, so the record contradicted itself on screen.
 */
function experienceFor(spec) {
  if (typeof spec.exp === 'string' && spec.exp.trim()) return spec.exp.trim();
  const set = ANSWER_SETS[spec.ans];
  if (!set || !set.experience) {
    throw new Error('no work history for ' + spec.first + ' ' + spec.last + '. Answer set "' + spec.ans +
                    '" carries no `experience` line and the cast row has no `exp`. The history and the ' +
                    'answers have to come from the same place or they contradict each other.');
  }
  return set.experience;
}

/* The work each onboarding task takes, read off the domain table so there is
   one copy of it. A task with no estimate contributes no work time rather than
   a guessed one. */
function taskEstimate(key) {
  const def = WF.ONBOARDING_TASKS.find((t) => t.key === key);
  return def && def.estMs != null ? def.estMs : null;
}

/** Six in the morning UTC on the day an instant falls, which is when a store opens. */
function sixAmUTC(ms) {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 6, 0, 0);
}

/* The import-time check. It is called here rather than where it is written,
   because it reads CAST and a const is not initialised until its declaration is
   reached. Importing this file still runs it, and a boot failure is the right
   outcome: a phrase bank that scores a protected characteristic must not be
   reachable from a running product. */
assertNothingScoresAProtectedCharacteristic();

export default seed;
