/* ============================================================================
   seed.js  ·  the demo dataset

   Thirty-four people, five stores, eight open requisitions. Every one of them
   invented. Sunfield Markets does not exist and neither does anybody in here.

   The important thing about this file is what it does NOT do: it does not write
   events, durations, funnel counts or metrics. It creates the candidates and
   then REPLAYS each of them through the real workflow engine with the clock
   wound back to the day they applied, stepping it forward as they move. Every
   event on every timeline was produced by the same code path a button uses.

   That is why the reports screen can be trusted. When it says the median
   application-to-offer is 3.9 days, that number came out of arithmetic over
   recorded events, not out of this file. Change a candidate's pace here and the
   reported median moves, because there is no second copy of it anywhere.

   Seeded screening evaluations use the deterministic rubric rather than the
   model, so a fresh boot costs nothing and produces the same result every time.
   Several candidates are deliberately left at SCREENING_PENDING so there is
   always somebody to run a real model evaluation against during a demo. Set
   SEED_USE_LLM=1 to seed with the model instead.
   ============================================================================ */

'use strict';

const WF = require('./workflow');
const SC = require('./screening');
const EV = require('./events');
const CONN = require('./connectors');
const { emptyDb } = require('./store');
const { freshAnchors, SIM_ANCHOR_ISO, MIN, HOUR, DAY, addBusinessDays } = require('./clock');

const TENANT = 'tn_sunfield';
const TENANT_NAME = 'Sunfield Markets';

/* ------------------------------------------------------------- the org --- */

const ORG = {
  id: TENANT, name: TENANT_NAME,
  kind: 'Regional grocery and general merchandise',
  stores: 412, states: 14, hourly: 38000,
  district: 'District 12', districtStores: 18,
  fictional: true,
  note: 'Invented. Deliberately mid-market rather than big-box, because big-box is a different problem.'
};

const STORES = [
  { key: 'ridgeway',  name: '#0417 Ridgeway',  city: 'Ridgeway',  state: 'OH', county: 'Franklin',  manager: 'Marcus Hale',    fieldHR: 'Dana Whitfield', headcount: 84, openings: 4, home: true },
  { key: 'northgate', name: '#0392 Northgate', city: 'Northgate', state: 'OH', county: 'Hamilton',  manager: 'Priya Raman',    fieldHR: 'Dana Whitfield', headcount: 96, openings: 3 },
  { key: 'lakeside',  name: '#0455 Lakeside',  city: 'Lakeside',  state: 'OH', county: 'Cuyahoga',  manager: 'Tomas Rivera',   fieldHR: 'Dana Whitfield', headcount: 71, openings: 2 },
  { key: 'brookfield',name: '#0488 Brookfield',city: 'Brookfield',state: 'IN', county: 'Marion',    manager: 'Ada Okonkwo',    fieldHR: 'Leon Barrett',   headcount: 63, openings: 3 },
  { key: 'stonewell', name: '#0501 Stonewell', city: 'Stonewell', state: 'KY', county: 'Jefferson', manager: 'Ruth Delgado',   fieldHR: 'Leon Barrett',   headcount: 58, openings: 2 }
];

const PEOPLE = {
  dana:   { key: 'dana',   name: 'Dana Whitfield', role: 'Field HR', scope: 'District 12, 18 stores', type: 'human' },
  marcus: { key: 'marcus', name: 'Marcus Hale',    role: 'Store manager', scope: '#0417 Ridgeway', type: 'human' },
  leon:   { key: 'leon',   name: 'Leon Barrett',   role: 'Field HR', scope: 'District 14, 15 stores', type: 'human' }
};

/* ------------------------------------------------------- the phrase bank ---
   The questions and the phrase bank belong to the customer, who edits them.
   positivePhrases and concernPhrases are what the deterministic rubric matches
   against when no model is configured. A model gets the criteria instead and is
   told not to invent any.
   ------------------------------------------------------------------------- */

/* ---------------------------------------------------- shift slot phrasing ---
   Added 7 Sep 2026 to fix a defect worth naming, because it was spoken aloud.

   The availability question used one fixed sentence for every requisition:
   "The role needs weekend evenings and one early opening a week." That is true
   of the Ridgeway Cashier and of nothing else. The Overnight Stocker needs
   Monday, Tuesday and Thursday nights. The Bakery needs weekday mornings.

   So the agent asked a candidate about hours that were not the job's hours,
   and eligibility then scored the answer against requiredSlots, which were
   different. A candidate could truthfully say yes to weekend evenings and be
   assessed against Monday nights. On a live call that is a misstatement of the
   terms of employment, not a copy error.

   The question text is now generated from each requisition's own slots, so the
   two can no longer disagree.
   -------------------------------------------------------------------------- */

/* The day and part names come from the canonical slot table in js/slots.js, so
   the sentence the voice agent reads out and the grid the apply form draws
   cannot describe the same shift in two different ways. Added 8 Sep 2026, per
   U-89. These two maps used to be declared here, which made this file the
   second copy. */
const SLOTS = require('../../js/slots');

/** "Monday, Tuesday and Thursday" */
function joinDays(days) {
  if (days.length === 1) return days[0];
  return days.slice(0, -1).join(', ') + ' and ' + days[days.length - 1];
}

/** requiredSlots to a sentence a person would actually say. */
function slotPhrase(slots) {
  /* Returns null rather than a broken sentence. Before 8 Sep 2026 an empty or
     missing list rendered "The role needs , plus undefined." */
  if (!slots || !slots.length) return null;
  const groups = [];
  (slots || []).forEach((s) => {
    const day = SLOTS.dayOf(s), part = SLOTS.partOf(s);
    /* An unknown key is dropped rather than rendered raw. Before this it fell
       through as the key itself, so a typo reached a live candidate's ear. */
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

/* Phrases that score the availability answer, generated from the same
   requiredSlots that generate the question.

   Fixed 8 Sep 2026, completing the 7 September fix, which regenerated the
   question text and left this bank global. The consequence was measurable and
   went both ways. Eleven of thirty stored evaluations scored availability as
   met on a requisition needing no weekend and no evening, because the answer
   said "weekends work". And a candidate answering "I can only do weekdays"
   was forced to not_met on an overnight job running Monday, Tuesday and
   Thursday, marked down for declining shifts the role never needed.

   Two rules hold this together. A phrase only enters the bank if the
   requisition actually needs that part of the week, so no requisition can
   score an answer about hours it does not want. And nothing here records the
   reason a person is unavailable, only the hours themselves, which is the same
   rule that removed childcare from this list on 7 September. */
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
const WEEKEND = ['sat', 'sun'];
const WEEKDAY = ['mon', 'tue', 'wed', 'thu', 'fri'];

/* Positive and concern phrases for one requisition's slot pattern.

   Substring matching is what `rubric()` does, so every phrase here is checked
   against the opposite list for containment. 'i can do overnights' is not a
   substring of 'cannot do overnights', which is why the positives are written
   'i can do X' rather than 'i can'. */
function slotPhraseBank(slots) {
  const list = slots || [];
  const parts = [], days = [];
  list.forEach((s) => {
    const [d, p] = s.split('_');
    if (parts.indexOf(p) < 0) parts.push(p);
    if (days.indexOf(d) < 0) days.push(d);
  });
  const pos = ['i am free', 'flexible', 'that works for me'];
  const neg = [];
  parts.forEach((p) => {
    (SLOT_POS[p] || []).forEach((x) => pos.push(x));
    (SLOT_NEG[p] || []).forEach((x) => neg.push(x));
  });
  /* Weekend and weekday language only enters the bank when that half of the
     week is genuinely required. This is the whole fix. */
  if (WEEKEND.some((d) => days.indexOf(d) >= 0)) {
    pos.push('weekends work', 'i can do weekends', 'weekends are fine');
    neg.push('cannot do weekends', 'no weekends', 'only weekdays');
  }
  if (WEEKDAY.some((d) => days.indexOf(d) >= 0)) {
    neg.push('only weekends');
  }
  return { positivePhrases: pos, concernPhrases: neg };
}

/* The whole availability question for one requisition.

   There is deliberately no default text. The wrong sentence that this replaced
   survived 7 September as `Q.availability.text`, so any requisition built
   without the override got it straight back, and B-11 makes requisitions
   creatable at runtime rather than only in the seed. With no default there is
   nothing to fall back to.

   A requisition with no required slots asks an open question and scores
   nothing, because there is no shift pattern to score against. */
function availabilityQuestion(slots) {
  const phrase = slotPhrase(slots);
  const base = { key: 'availability', criterion: 'availability_fit',
                 concernLabel: 'Availability may not cover the shift pattern' };
  if (!phrase) {
    return Object.assign(base, {
      text: 'What days and times are you able to work?',
      positivePhrases: [], concernPhrases: [],
      concernLabel: 'No shift pattern is recorded against this role'
    });
  }
  return Object.assign(base, slotPhraseBank(slots), {
    text: 'The role needs ' + phrase + '. Does that work with everything else you have on?'
  });
}

const Q = {
  reliability: {
    key: 'reliability', criterion: 'reliability',
    text: 'Tell me about a time you had to get somewhere on time when it was difficult.',
    positivePhrases: ['i left early', 'i planned', 'never been late', 'i always', 'i made sure', 'set two alarms'],
    concernPhrases: ['i overslept', 'i was late a lot', 'transport is a problem', 'no car and no bus'],
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
    /* Fixed 7 Sep 2026. Previously "Is that something you can do?", which is an
       ability question and therefore a health question. A physical requirement
       may only be put as an essential job function with the accommodation
       clause built in. The words "with or without reasonable accommodation"
       are the clause, and they are not optional decoration: without them this
       sentence is asked of a live candidate and is an ADA exposure. */
    text: 'This role requires standing for a full shift and lifting up to 25 pounds. Can you perform those duties, with or without reasonable accommodation?',
    /* Fixed 8 Sep 2026, completing the 7 September fix, which changed the
       question and left this bank alone.

       The question now invites an accommodation disclosure. The bank scored
       one. 'my back' and 'i would struggle' are disclosures of a physical
       impairment, and a single hit forces not_met and forces the whole
       recommendation to 'review', quoting the disclosure on screen as the
       evidence for the downgrade. That is the childcare defect again with
       disability in place of family status, and no seeded answer trips it, so
       it would have fired first on a live candidate on 20 September.

       The criterion is now scored on one thing only: whether the person
       affirms they can perform the essential duties. A concern fires only on
       an unambiguous statement that they cannot, and never on the reason. An
       unclear answer scores partly_met and goes to a person, which is what the
       accommodation conversation is.

       'i can' was also removed as a positive: `rubric()` matches by substring,
       so it matched inside 'i cannot'. Every phrase below was checked against
       the other list for containment. */
    positivePhrases: ['yes', 'i can do', 'i can lift', 'i can stand', 'no problem',
                      'used to it', 'done that before', 'that is fine'],
    concernPhrases: ['i cannot perform', 'i cannot do that', 'i cannot lift', 'i cannot stand'],
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

const CRITERIA = {
  reliability:          { key: 'reliability', description: 'Evidence they turn up when they said they would.' },
  customer_manner:      { key: 'customer_manner', description: 'How they handle a customer who is upset, in their own words.' },
  availability_fit:     { key: 'availability_fit', description: 'Whether the hours they offer match the hours the role needs.' },
  physical_requirements:{ key: 'physical_requirements', description: 'Whether they can stand a full shift and lift to 25 pounds.' },
  food_safety:          { key: 'food_safety', description: 'Any prior fresh food handling, and a food handler card if they hold one.' }
};

const REQS = [
  { key: 'cashier_ridgeway', storeKey: 'ridgeway', title: 'Cashier', openings: 2, minAge: 16, rateCents: 1650, hoursPerWeek: 28,
    requiredSlots: ['sat_evening', 'sun_evening', 'wed_open'], maxDistanceMiles: 20, requiresManagerInterview: false,
    criteria: ['reliability', 'customer_manner', 'availability_fit'], questions: ['availability', 'reliability', 'customer'],
    summary: 'Front-end tills, customer queries, some stocking during quiet periods.' },
  { key: 'stocker_ridgeway', storeKey: 'ridgeway', title: 'Overnight Stocker', openings: 1, minAge: 18, rateCents: 1810, hoursPerWeek: 32,
    requiredSlots: ['mon_night', 'tue_night', 'thu_night'], maxDistanceMiles: 25, requiresManagerInterview: false,
    criteria: ['reliability', 'physical_requirements', 'availability_fit'], questions: ['availability', 'reliability', 'physical'],
    summary: 'Overnight replenishment, pallet work, equipment use. Eighteen and over for the equipment.' },
  { key: 'deli_ridgeway', storeKey: 'ridgeway', title: 'Deli Associate', openings: 1, minAge: 18, rateCents: 1740, hoursPerWeek: 30,
    requiredSlots: ['sat_open', 'sun_open'], maxDistanceMiles: 20, requiresManagerInterview: true,
    criteria: ['reliability', 'customer_manner', 'food_safety', 'availability_fit'], questions: ['availability', 'reliability', 'customer', 'food'],
    summary: 'Fresh counter, slicing, food safety records. A manager interview is required for fresh food roles.' },
  { key: 'cashier_northgate', storeKey: 'northgate', title: 'Cashier', openings: 2, minAge: 16, rateCents: 1650, hoursPerWeek: 24,
    requiredSlots: ['fri_evening', 'sat_evening'], maxDistanceMiles: 20, requiresManagerInterview: false,
    criteria: ['reliability', 'customer_manner', 'availability_fit'], questions: ['availability', 'reliability', 'customer'],
    summary: 'Front-end tills at the district\'s busiest store.' },
  { key: 'curbside_northgate', storeKey: 'northgate', title: 'Curbside Picker', openings: 1, minAge: 16, rateCents: 1690, hoursPerWeek: 26,
    requiredSlots: ['sat_open', 'sun_open', 'wed_open'], maxDistanceMiles: 15, requiresManagerInterview: false,
    criteria: ['reliability', 'physical_requirements', 'availability_fit'], questions: ['availability', 'reliability', 'physical'],
    summary: 'Picking online orders and loading cars. Outdoors in all weather.' },
  { key: 'bakery_lakeside', storeKey: 'lakeside', title: 'Bakery Assistant', openings: 1, minAge: 18, rateCents: 1780, hoursPerWeek: 30,
    requiredSlots: ['mon_open', 'wed_open', 'fri_open'], maxDistanceMiles: 20, requiresManagerInterview: true,
    criteria: ['reliability', 'food_safety', 'physical_requirements', 'availability_fit'], questions: ['availability', 'reliability', 'food', 'physical'],
    summary: 'Early starts, oven work, allergen labelling.' },
  { key: 'meat_brookfield', storeKey: 'brookfield', title: 'Meat Clerk', openings: 1, minAge: 18, rateCents: 1920, hoursPerWeek: 34,
    requiredSlots: ['tue_open', 'thu_open', 'sat_open'], maxDistanceMiles: 25, requiresManagerInterview: true,
    criteria: ['reliability', 'food_safety', 'physical_requirements', 'availability_fit'], questions: ['availability', 'reliability', 'food', 'physical'],
    summary: 'Cutting room, cold environment, strict temperature records.' },
  { key: 'service_stonewell', storeKey: 'stonewell', title: 'Customer Service Desk', openings: 1, minAge: 18, rateCents: 1760, hoursPerWeek: 28,
    requiredSlots: ['fri_evening', 'sat_open', 'sun_open'], maxDistanceMiles: 20, requiresManagerInterview: false,
    criteria: ['reliability', 'customer_manner', 'availability_fit'], questions: ['availability', 'customer', 'reliability'],
    summary: 'Returns, complaints, money services. The hardest customer conversations in the building.' }
];

const SOURCES = [
  'Career site, mobile', 'Career site, desktop', 'Indeed', 'Google for Jobs',
  'Adzuna', 'Jooble', 'Referral from a colleague', 'QR code in store', 'Walk-in'
];

/* ------------------------------------------------------- answer library --- */

const A = {
  good_avail:  'Weekends work fine for me, evenings especially. I am free from Thursday onwards and an early opening is no problem, I am usually up anyway.',
  ok_avail:    'Weekends work, yes. The early opening I would need to check but I think it is fine.',
  bad_avail:   'I can only do weekdays really. I cannot do weekends because of childcare and no evenings after six.',
  good_rel:    'When I was at the garden centre I had a bus that was often late, so I left early every day and got there twenty minutes before. I have never been late for a shift in two years.',
  ok_rel:      'I try to plan ahead. I set two alarms. There was one time my car would not start and I called ahead straight away.',
  bad_rel:     'Transport is a problem for me, I have no car and no bus that runs early. I overslept a couple of times at my last place.',
  good_cust:   'I would let them finish, then apologise for the situation even if it is not my doing, and try to sort it out. If I cannot fix it I find a manager rather than leave them standing there.',
  ok_cust:     'Stay calm and listen. Then find a manager if it is above me.',
  bad_cust:    'Honestly if they are being rude I would tell them they are wrong. It is not my problem if head office made a mistake.',
  good_phys:   'Yes, I can. I was on my feet all day at the warehouse and lifting boxes heavier than that, so I am used to it.',
  ok_phys:     'Yes I can do that, I have done that before at a previous job.',
  bad_phys:    'I am not sure. My back is not great and I would struggle with a full shift standing.',
  good_food:   'Yes, I worked the deli counter at a supermarket for a year and I held a food handler card, though it may have lapsed.',
  ok_food:     'I have done kitchen work before, yes. No card but I would get one.',
  bad_food:    'Never done food. What is a food handler card?',
  thin:        'Yeah.',
  evasive:     'I would rather talk about that in person.'
};

/* ------------------------------------------------------------- the cast ---
   stage is where each person is meant to end up. The driver replays them there
   through the real engine rather than writing the state directly.
   ------------------------------------------------------------------------- */

const CAST = [
  // ---- fresh, sitting in the screening queue. The live model demo runs on these.
  { first: 'Alicia',  last: 'Reyes',      req: 'cashier_ridgeway',   stage: 'SCREENING_PENDING', daysAgo: 0.4, src: 0, ans: 'good', persona: 'Applied overnight. Eligible, queued for screening. This is the one to run a live screening against.' },
  { first: 'Devon',   last: 'Whitaker',   req: 'stocker_ridgeway',   stage: 'SCREENING_PENDING', daysAgo: 0.6, src: 2, ans: 'good', persona: 'Overnight applicant, strong on paper.' },
  { first: 'Nia',     last: 'Okafor',     req: 'curbside_northgate', stage: 'SCREENING_PENDING', daysAgo: 0.3, src: 3, ans: 'ok',   persona: 'Applied this morning.' },
  { first: 'Bram',    last: 'Halloway',   req: 'cashier_northgate',  stage: 'SCREENING_PENDING', daysAgo: 0.9, src: 4, ans: 'thin', persona: 'Answers are very short. A model should say insufficient evidence rather than guess.' },

  // ---- the decision queue. This is what the manager opens on a Monday.
  { first: 'Marisol', last: 'Ferreira',   req: 'cashier_ridgeway',   stage: 'DECISION_PENDING', daysAgo: 2.1, src: 0, ans: 'good', persona: 'Strong screening, waiting on a person. The straightforward approve.' },
  { first: 'Jerome',  last: 'Kettleworth',req: 'stocker_ridgeway',   stage: 'DECISION_PENDING', daysAgo: 3.4, src: 2, ans: 'ok',   persona: 'Middling. Has been waiting three days, which is the point.' },
  { first: 'Priya',   last: 'Anand',      req: 'cashier_northgate',  stage: 'DECISION_PENDING', daysAgo: 1.2, src: 6, ans: 'good', persona: 'Referral, fast mover.' },
  { first: 'Cody',    last: 'Brennan',    req: 'service_stonewell',  stage: 'DECISION_PENDING', daysAgo: 4.6, src: 5, ans: 'weak', persona: 'Weak screening. The evaluation raises a concern and a person has to read it.' },
  { first: 'Yusuf',   last: 'Demirci',    req: 'curbside_northgate', stage: 'DECISION_PENDING', daysAgo: 2.8, src: 7, ans: 'ok',   persona: 'Walk-in via the in-store QR code.' },
  { first: 'Hattie',  last: 'Lombard',    req: 'bakery_lakeside',    stage: 'DECISION_PENDING', daysAgo: 5.2, src: 1, ans: 'good', persona: 'Manager interview done as well as the screening. Steps 4 and 5 are used on this one.' },
  /* Ines and Ryan are named by roughly a dozen cases in the assistant's three
     test suites, including the two that check a singular action aimed at two
     people at once. Keeping them in the cast keeps those cases testing what
     they were written to test, rather than testing a name that no longer
     resolves. */
  { first: 'Ines',    last: 'Duarte',     req: 'cashier_ridgeway',   stage: 'DECISION_PENDING', daysAgo: 2.4, src: 1, ans: 'good', persona: 'Waiting on a decision. Named by the assistant test suites as the approve target.' },
  { first: 'Ryan',    last: 'Kettle',     req: 'curbside_northgate', stage: 'DECISION_PENDING', daysAgo: 3.9, src: 4, ans: 'weak', persona: 'Waiting on a decision. Named by the assistant test suites as the reject target.' },

  // ---- the exceptions
  { first: 'Trevor',  last: 'Boone',      req: 'stocker_ridgeway',   stage: 'BLOCKED_REHIRE',   daysAgo: 1.1, src: 2, ans: 'ok',   persona: 'Matches a prior employment record marked not eligible for rehire. Stopped, and in front of a person.' },
  { first: 'Shantel', last: 'Ruiz',       req: 'meat_brookfield',    stage: 'INELIGIBLE',       daysAgo: 1.6, src: 3, ans: 'bad', avail: 'weekday', persona: 'Availability does not cover the required slots. A hard rule, deterministic, and the failing rule is named.' },

  // ---- offers out
  { first: 'Owen',    last: 'Castellano', req: 'cashier_ridgeway',   stage: 'OFFER_SENT',       daysAgo: 3.0, src: 0, ans: 'good', persona: 'Offer sent yesterday, no answer yet. Agent has chased once.' },
  { first: 'Ruthie',  last: 'Nakamura',   req: 'bakery_lakeside',    stage: 'OFFER_SENT',       daysAgo: 6.4, src: 1, ans: 'good', persona: 'Gone quiet. The offer is close to expiring.' },
  { first: 'Silas',   last: 'Marchetti',  req: 'cashier_northgate',  stage: 'OFFER_DECLINED',   daysAgo: 7.2, src: 2, ans: 'good', persona: 'Took another job. Recorded rather than deleted, because the reason is the useful part.' },

  // ---- checks running
  { first: 'Bianca',  last: 'Osei',       req: 'deli_ridgeway',      stage: 'CHECK_RUNNING',    daysAgo: 5.8, src: 0, ans: 'good', persona: 'Background check with the agency. Counties still open.' },
  { first: 'Marcus',  last: 'Pennington', req: 'stocker_ridgeway',   stage: 'CHECK_SLOW',       daysAgo: 9.3, src: 4, ans: 'good', persona: 'One county running long. Nothing on our side is holding it up and the screen has to say so.' },
  { first: 'Dara',    last: 'Simmons',    req: 'service_stonewell',  stage: 'CHECK_ADVERSE',    daysAgo: 8.1, src: 5, ans: 'ok',   persona: 'A county returned a record. Pre-adverse process, owned by a person, never automated.' },

  // ---- onboarding, in parallel
  { first: 'Kwame',   last: 'Adjei',      req: 'cashier_northgate',  stage: 'ONBOARDING',       daysAgo: 11.0, src: 0, ans: 'good', persona: 'Onboarding tasks running in parallel. Eleven tasks, everything with no dependency started at once.' },
  { first: 'Elodie',  last: 'Fournier',   req: 'curbside_northgate', stage: 'ONBOARDING',       daysAgo: 10.2, src: 3, ans: 'good', persona: 'Badge and till access is the human task holding the critical path.' },
  { first: 'Gus',     last: 'Petrakis',   req: 'cashier_ridgeway',   stage: 'READY_FOR_SHIFT',  daysAgo: 12.4, src: 1, ans: 'good', persona: 'Everything before day one is done. Waiting on a shift being placed.' },

  // ---- rehire, the good kind
  { first: 'Teresa',  last: 'Alvarado',   req: 'deli_ridgeway',      stage: 'ONBOARDING_REHIRE',daysAgo: 9.6, src: 0, ans: 'good', persona: 'Worked here before, left on good terms, inside the three-year I-9 window. Several onboarding steps do not have to be done twice.' },

  // ---- shifts scheduled and started
  { first: 'Ingrid',  last: 'Solberg',    req: 'cashier_ridgeway',   stage: 'SHIFT_SCHEDULED',  daysAgo: 13.8, src: 0, ans: 'good', persona: 'First shift placed. Fair workweek notice satisfied.' },
  { first: 'Aaron',   last: 'Delacroix',  req: 'meat_brookfield',    stage: 'SHIFT_SCHEDULED',  daysAgo: 14.6, src: 2, ans: 'good', persona: 'Shift inside the fourteen-day notice window, so a premium is payable and the screen says so.' },
  { first: 'Kayla',   last: 'Brennan-Ross',req:'deli_ridgeway',      stage: 'EVERIFY_MISMATCH', daysAgo: 21.0, src: 0, ans: 'good', persona: 'Started, then an E-Verify mismatch. Contesting. Every adverse action is barred until it closes.' },
  { first: 'Noor',    last: 'Haddad',     req: 'cashier_northgate',  stage: 'STARTED',          daysAgo: 19.4, src: 6, ans: 'good', persona: 'Started, week one on the floor.' },

  // ---- the long tail
  { first: 'Felix',   last: 'Ntamack',    req: 'stocker_ridgeway',   stage: 'DAY_30',  daysAgo: 44.0, src: 2, ans: 'good', persona: 'Past day 30. The check-in ran and nothing was flagged.' },
  { first: 'Renata',  last: 'Vasquez',    req: 'cashier_ridgeway',   stage: 'DAY_60',  daysAgo: 74.0, src: 0, ans: 'good', persona: 'Past day 60.' },
  { first: 'Obi',     last: 'Chukwuma',   req: 'bakery_lakeside',    stage: 'DAY_90',  daysAgo: 104.0, src: 1, ans: 'good', persona: 'Ninety days and still employed. The measurement neither incumbent claims.' },
  { first: 'Wren',    last: 'Castellanos',req: 'service_stonewell',  stage: 'DAY_90',  daysAgo: 118.0, src: 0, ans: 'good', persona: 'A second person past day 90, so the retention number is not a sample of one.' },

  // ---- the ones that ended
  { first: 'Casey',   last: 'Mbeki',      req: 'cashier_ridgeway',   stage: 'REJECTED',  daysAgo: 6.9, src: 4, ans: 'bad',  persona: 'Rejected by a person after a weak screening. Who decided and why is on the record.' },
  { first: 'Lorne',   last: 'Fitzgerald', req: 'curbside_northgate', stage: 'REJECTED',  daysAgo: 8.4, src: 5, ans: 'weak', persona: 'Rejected against an advance recommendation. The override is visible rather than inferable.' },
  { first: 'Simone',  last: 'Achterberg', req: 'cashier_northgate',  stage: 'WITHDRAWN', daysAgo: 5.5, src: 3, ans: 'ok',   persona: 'Withdrew during screening. Recorded, because a withdrawal is a funnel fact.' },

  // ---- unusually fast
  { first: 'Zach',    last: 'Oyelaran',   req: 'cashier_ridgeway',   stage: 'FAST_TRACK', daysAgo: 2.6, src: 6, ans: 'good', persona: 'Applied, screened, decided and offered inside a day. The comparison case for everybody else.' }
];

const ANSWER_SETS = {
  good: { availability: A.good_avail, reliability: A.good_rel, customer: A.good_cust, physical: A.good_phys, food: A.good_food },
  ok:   { availability: A.ok_avail,   reliability: A.ok_rel,   customer: A.ok_cust,   physical: A.ok_phys,   food: A.ok_food },
  weak: { availability: A.ok_avail,   reliability: A.bad_rel,  customer: A.ok_cust,   physical: A.ok_phys,   food: A.ok_food },
  bad:  { availability: A.bad_avail,  reliability: A.bad_rel,  customer: A.bad_cust,  physical: A.bad_phys,  food: A.bad_food },
  thin: { availability: A.thin,       reliability: A.thin,     customer: A.evasive,   physical: A.thin,      food: A.thin }
};

const AVAIL = {
  full: ['sat_evening', 'sun_evening', 'wed_open', 'mon_night', 'tue_night', 'thu_night',
         'fri_evening', 'sat_open', 'sun_open', 'mon_open', 'tue_open', 'thu_open', 'fri_open'],
  weekdayOnly: ['mon_open', 'tue_open', 'wed_open', 'thu_open', 'fri_open']
};

/* ============================================================================
   the driver
   ========================================================================= */

async function seed(store, opts) {
  opts = opts || {};
  const useLLM = opts.useLLM != null ? opts.useLLM : process.env.SEED_USE_LLM === '1';

  const db = emptyDb();
  db.meta.anchors = freshAnchors();
  db.meta.seededAt = new Date().toISOString();
  db.meta.simAnchor = SIM_ANCHOR_ISO;
  store.replace(db);

  // A clock the seed drives by hand. Every event lands at the moment it would
  // really have happened, so the metrics that come out the far end are real.
  let cursor = db.meta.anchors.sim;
  const clock = { now: () => cursor, nowISO: () => new Date(cursor).toISOString() };
  const at = (ms) => { cursor = ms; };
  const NOW = db.meta.anchors.sim;

  const ctx = (actor) => ({
    tenantId: TENANT, tenantName: TENANT_NAME, clock,
    actor: actor || { type: 'system', name: 'Workflow engine' }
  });
  const sys   = () => ctx({ type: 'system', name: 'Workflow engine' });
  const agent = () => ctx({ type: 'agent',  name: 'Screening agent' });
  const ext   = () => ctx({ type: 'external', name: 'Candidate' });
  const mgr = (storeRow) => ctx({ type: 'human', name: storeRow.manager, role: 'Store manager' });
  const hr  = (storeRow) => ctx({ type: 'human', name: storeRow.fieldHR, role: 'Field HR' });

  /* --------------------------------------------------------- reference --- */

  store.insert('tenants', { id: TENANT, tenantId: TENANT, name: TENANT_NAME, org: ORG, people: PEOPLE });

  const storeById = {};
  STORES.forEach((s) => {
    const row = Object.assign({ id: 'str_' + s.key, tenantId: TENANT }, s);
    store.insert('stores', row);
    storeById[s.key] = row;
  });

  const reqById = {};
  REQS.forEach((r, ri) => {
    const row = {
      id: 'req_' + r.key, tenantId: TENANT, key: r.key,
      storeId: storeById[r.storeKey].id, storeName: storeById[r.storeKey].name,
      title: r.title, openings: r.openings, summary: r.summary,
      minAge: r.minAge, rateCents: r.rateCents, hoursPerWeek: r.hoursPerWeek,
      requiredSlots: r.requiredSlots, maxDistanceMiles: r.maxDistanceMiles,
      requiresManagerInterview: r.requiresManagerInterview,
      criteria: r.criteria.map((k) => CRITERIA[k]),
      /* The availability question is rebuilt per requisition from that
         requisition's own requiredSlots, so the hours the agent asks about and
         the hours eligibility scores against cannot drift apart. Everything
         else comes from the shared bank unchanged. */
      screeningQuestions: r.questions.map((k) => (
        k === 'availability' ? availabilityQuestion(r.requiredSlots) : Q[k]
      )),
      interviewQuestions: r.requiresManagerInterview
        ? [{ key: 'in_person', criterion: r.criteria[0], text: 'Manager interview, in store.' }]
        : [],
      /* Varied 7 Sep 2026. Every requisition shared one openedAt, so every one
         reported the same age and "open for 26 days" was a constant printed
         eight times. Spread deterministically so the figure differs per row
         and still reproduces exactly on every boot. */
      openedAt: NOW - Math.round((14 + ri * 4.5) * DAY),
      postedTo: ['Careers site', 'Indeed', 'Google for Jobs', 'Adzuna', 'Jooble'],
      status: 'open'
    };
    store.insert('requisitions', row);
    reqById[r.key] = row;
  });

  // The job postings, out through the simulated distribution adapter.
  Object.values(reqById).forEach((r) => {
    r.postedTo.forEach((dest) => {
      CONN.call(store, sys(), 'ats', 'post_opening',
        { requisitionId: r.id, destination: dest }, { at: r.openedAt });
    });
  });
  /* One connector failure, kept in on purpose. An integration surface with no
     errors in it has never been near a real vendor. */
  CONN.call(store, sys(), 'ats', 'post_opening',
    { requisitionId: reqById.meat_brookfield.id, destination: 'Jooble' },
    { at: NOW - 3 * DAY, failWith: 'HTTP 502 from the aggregator. Feed rejected, no listing created.', retryable: true });
  CONN.call(store, sys(), 'ats', 'post_opening',
    { requisitionId: reqById.meat_brookfield.id, destination: 'Jooble' },
    { at: NOW - 3 * DAY + 12 * MIN, attempt: 2 });

  /* ------------------------------------------- this retailer's own records --
     Prior employment. Read by the rehire lookup, one tenant only, never pooled.
     -------------------------------------------------------------------------- */

  const priors = [
    /* Teresa is the rehire the demo turns on, so her previous Form I-9 has to
       sit INSIDE the three-year window that 8 CFR 274a.2(c)(1)(i) opens. It was
       originally dated February 2023, which is three and a half years before
       the demo's present, and the rule correctly answered no. The rule was
       right and the date was wrong, so the date moved. */
    { first: 'Teresa', last: 'Alvarado', dob: '1991-04-17', phone: '+1-614-555-0182',
      employeeId: 'E-448120', role: 'Deli Associate', storeName: '#0417 Ridgeway',
      startedOn: '2024-05-13T00:00:00.000Z', separatedOn: '2025-08-29T00:00:00.000Z',
      separationReason: 'Resigned, relocation', rehireEligible: true,
      i9ExecutedOn: '2024-05-13T00:00:00.000Z',
      training: [
        { code: 'FS-101', name: 'Food safety, level 1', completedOn: '2024-05-15T00:00:00.000Z', expiresOn: '2028-05-15T00:00:00.000Z' },
        { code: 'HAR-02', name: 'Harassment prevention', completedOn: '2024-05-16T00:00:00.000Z', expiresOn: null }
      ] },
    { first: 'Trevor', last: 'Boone', dob: '1996-11-02', phone: '+1-614-555-0117',
      employeeId: 'E-390451', role: 'Overnight Stocker', storeName: '#0392 Northgate',
      startedOn: '2022-05-16T00:00:00.000Z', separatedOn: '2023-01-11T00:00:00.000Z',
      separationReason: 'Ended for cause. Note on file, no detail attached to this record.',
      rehireEligible: false, i9ExecutedOn: '2022-05-16T00:00:00.000Z', training: [] },
    { first: 'Renata', last: 'Vasquez', dob: '1999-07-23', phone: '+1-614-555-0143',
      employeeId: 'E-411009', role: 'Cashier', storeName: '#0455 Lakeside',
      startedOn: '2021-03-01T00:00:00.000Z', separatedOn: '2021-11-19T00:00:00.000Z',
      separationReason: 'Seasonal end', rehireEligible: true,
      i9ExecutedOn: '2021-03-01T00:00:00.000Z',
      training: [{ code: 'POS-01', name: 'Point of sale basics', completedOn: '2021-03-03T00:00:00.000Z', expiresOn: '2023-03-03T00:00:00.000Z' }] }
  ];
  const { identityKey } = require('./rules');
  priors.forEach((p, i) => {
    store.insert('priorEmployment', {
      id: 'pri_' + String(i + 1).padStart(4, '0'), tenantId: TENANT,
      identityKey: identityKey({ firstName: p.first, lastName: p.last, dob: p.dob, phone: p.phone }),
      firstName: p.first, lastName: p.last, dob: p.dob,
      employeeId: p.employeeId, role: p.role, storeName: p.storeName,
      startedOn: p.startedOn, separatedOn: p.separatedOn,
      separationReason: p.separationReason, rehireEligible: p.rehireEligible,
      i9ExecutedOn: p.i9ExecutedOn, training: p.training
    });
  });

  /* ------------------------------------------------------------- the cast -- */

  for (let i = 0; i < CAST.length; i++) {
    const spec = CAST[i];
    const r = reqById[spec.req];
    const st = storeById[REQS.find((x) => x.key === spec.req).storeKey];
    const appliedAt = NOW - Math.round(spec.daysAgo * DAY);

    const prior = priors.find((p) => p.first === spec.first && p.last === spec.last);
    const dob = prior ? prior.dob : dobFor(spec, r.minAge);
    const phone = prior ? prior.phone : '+1-614-555-' + String(1000 + i).slice(-4);

    const c = {
      id: store.nextId('cand'), tenantId: TENANT,
      firstName: spec.first, lastName: spec.last,
      name: spec.first + ' ' + spec.last,
      initials: spec.first[0] + spec.last[0],
      dob, phone,
      email: (spec.first + '.' + spec.last.replace(/[^a-z]/gi, '')).toLowerCase() + '@example.com',
      city: st.city, state: st.state,
      counties: countiesFor(st, i),
      experience: experienceFor(spec),
      answers: ANSWER_SETS[spec.ans],
      persona: spec.persona,
      createdAt: appliedAt
    };
    store.insert('candidates', c);

    const a = {
      id: store.nextId('app'), tenantId: TENANT,
      candidateId: c.id, requisitionId: r.id, storeId: st.id,
      appliedAt, source: SOURCES[spec.src % SOURCES.length],
      sourceKind: spec.src <= 1 ? 'owned' : (spec.src >= 6 ? 'direct' : 'board'),
      state: 'APPLICATION_RECEIVED', stateSince: appliedAt, updatedAt: appliedAt,
      rightToWorkDeclared: spec.stage !== 'INELIGIBLE_RTW',
      // Availability is a fact about the person, not a consequence of how well
      // they interviewed. Keeping them separate is what lets one candidate fail
      // a hard rule and another be rejected by a person after a weak screening.
      availability: spec.avail === 'weekday' ? AVAIL.weekdayOnly : AVAIL.full,
      distanceMiles: 3 + (CONN.hash(c.id) % 17),
      eligibility: null, rehire: null,
      decisionId: null, offerId: null, backgroundCheckId: null, firstShiftId: null,
      startedAt: null, acceptedAt: null, closedAt: null, parallel: null,
      everify: null, fcra: null,
      assignedTo: st.manager
    };
    store.insert('applications', a);

    at(appliedAt);
    EV.workflowEvent(store, sys(), {
      applicationId: a.id, candidateId: c.id, storeId: st.id, requisitionId: r.id,
      at: appliedAt, kind: 'enter', state: 'APPLICATION_RECEIVED',
      actorType: 'system', actor: 'Application intake', durationMs: 45000,
      detail: 'Arrived from ' + a.source + '.'
    });
    EV.auditEvent(store, sys(), {
      action: 'application.created', actorType: 'system', actor: 'Application intake',
      applicationId: a.id, candidateId: c.id, source: 'connector',
      why: 'Application received via ' + a.source + '.'
    });
    // Settle pushes it through the rules engine, which is where eligibility and
    // the rehire lookup actually run.
    at(appliedAt + 90 * 1000);
    WF.settle(store, sys(), a.id);

    await drive(spec, a, c, r, st);
  }

  /* --------------------------------------------------------- the driver --- */

  async function drive(spec, a, c, r, st) {
    const pace = 1 + (CONN.hash(c.id) % 60) / 100;   // deterministic, 1.00 to 1.59
    const stage = spec.stage;

    // Both of these were already stopped by the rules engine during settle.
    // INELIGIBLE failed a hard rule. BLOCKED_REHIRE matched a do-not-rehire
    // record and is sitting in front of a person, which is not the same thing.
    if (stage === 'INELIGIBLE' || stage === 'BLOCKED_REHIRE') return;

    // Left in the screening queue on purpose, so there is always somebody to
    // run a real model evaluation against during a demo.
    if (stage === 'SCREENING_PENDING') return;

    const screenAt = a.appliedAt + Math.round((stage === 'FAST_TRACK' ? 22 * MIN : 3.2 * HOUR) * pace);
    at(screenAt);
    const res = await SC.runFullScreening(store, agent(), a.id,
      { source: 'workflow', forceFallback: !useLLM });
    /* A screening that did not complete leaves the candidate where they are
       rather than taking the rest of the replay down with it. Note that a
       requisition needing a manager interview legitimately sits at
       SCREENING_IN_PROGRESS at this point: the agent conversation is done and
       the interview has not happened yet. Treating that as a failure quietly
       stranded every fresh-food candidate in the cast. */
    if (!res.ok) return;

    if (stage === 'WITHDRAWN') {
      at(screenAt + Math.round(9 * HOUR * pace));
      WF.transition(store, ext(), a.id, 'WITHDRAWN', { reason: 'Took a job elsewhere before the decision.' });
      return;
    }

    /* When screening actually finished, which is not always screenAt.

       Fixed 7 Sep 2026. decideAt used to be a fixed offset from screenAt, so
       for a role needing a manager interview the decision was timed at
       screenAt + 14h while SCREENING_COMPLETE had been written at
       screenAt + 26h. Six candidates ended up with an APPROVED event twelve to
       sixteen hours BEFORE the screening they were approved on, which made
       screeningToDecision negative. At tenant level the outliers were absorbed
       in the median. At store level they dominated it, so two of five stores
       reported a negative duration on a page whose whole argument is duration.

       The decision now follows whatever the last screening event actually was. */
    let screeningDoneAt = screenAt;

    // A manager interview is a person in a room, so it happens on its own clock
    // and it is what fills steps 4 and 5 for the roles that require one.
    if (r.requiresManagerInterview) {
      const iv = WF.screeningsFor(store, sys(), a.id).find((s) => s.kind === 'manager_interview');
      if (iv && iv.status !== 'complete') {
        screeningDoneAt = screenAt + Math.round(26 * HOUR * pace);
        at(screeningDoneAt);
        SC.runConversation(store, mgr(st), iv);
        iv.status = 'complete';
        iv.evaluation = null;
        iv.evaluationMeta = { mode: 'human', note: 'A manager interview is not evaluated by a model. The notes are the record.' };
        store.markDirty();
        WF.transition(store, sys(), a.id, 'SCREENING_COMPLETE', { reason: 'Screening and manager interview both complete.' });
      }
    }

    if (stage === 'DECISION_PENDING') return;

    const decideAt = screeningDoneAt + Math.round((stage === 'FAST_TRACK' ? 40 * MIN : 14 * HOUR) * pace);
    at(decideAt);

    if (stage === 'REJECTED') {
      WF.transition(store, mgr(st), a.id, 'REJECTED', {
        reason: spec.ans === 'weak'
          ? 'Screening looked passable but the reliability answers do not match what this shift pattern needs.'
          : 'Not a fit for the shift pattern and the customer answers were a concern.',
        workMs: 6 * MIN
      });
      return;
    }

    WF.transition(store, mgr(st), a.id, 'APPROVED', {
      reason: 'Screening evidence supports it and the shift pattern matches.', workMs: 5 * MIN
    });

    const sendAt = decideAt + Math.round((stage === 'FAST_TRACK' ? 8 * MIN : 2.4 * HOUR) * pace);
    at(sendAt);
    WF.transition(store, mgr(st), a.id, 'OFFER_SENT', { workMs: 90 * 1000 });

    if (stage === 'OFFER_SENT' || stage === 'FAST_TRACK') return;

    if (stage === 'OFFER_DECLINED') {
      at(sendAt + Math.round(19 * HOUR * pace));
      WF.transition(store, ext(), a.id, 'OFFER_DECLINED', { reason: 'Accepted a role somewhere else with more hours.' });
      return;
    }

    const acceptAt = sendAt + Math.round(11 * HOUR * pace);
    at(acceptAt);
    WF.transition(store, ext(), a.id, 'OFFER_ACCEPTED', {});

    // The check goes in after the conditional offer, which is the order the
    // California rule requires, and the parallel work has already fanned out.
    const orderAt = acceptAt + 26 * MIN;
    at(orderAt);
    if (stage === 'CHECK_ADVERSE') {
      WF.transition(store, sys(), a.id, 'BACKGROUND_CHECK_IN_PROGRESS', {});
      applySeedResults(a, 'record_found');
    } else if (stage === 'CHECK_SLOW') {
      WF.transition(store, sys(), a.id, 'BACKGROUND_CHECK_IN_PROGRESS', {});
      const chk = WF.checkFor(store, sys(), a.id);
      // One county running long. Real courts differ by a lot and this is one.
      chk.searches[chk.searches.length - 1].expectedMs = 8.6 * DAY;
    } else {
      WF.transition(store, sys(), a.id, 'BACKGROUND_CHECK_IN_PROGRESS', {});
    }

    if (stage === 'CHECK_RUNNING' || stage === 'CHECK_SLOW' || stage === 'CHECK_ADVERSE') return;

    // Everything past here needs the check back, so wind the searches in.
    const chk = WF.checkFor(store, sys(), a.id);
    const backAt = orderAt + Math.round(4.4 * DAY * pace);
    chk.searches.forEach((s) => { s.returnedAt = Math.min(backAt, s.orderedAt + s.expectedMs); s.result = 'clear'; });
    at(backAt);
    EV.workflowEvent(store, ext(), {
      applicationId: a.id, candidateId: c.id, at: backAt, kind: 'note',
      state: 'BACKGROUND_CHECK_IN_PROGRESS', step: 10, owner: 'clock',
      actorType: 'external', actor: 'Screening agency',
      detail: 'All ' + chk.searches.length + ' searches returned clear.', ref: chk.externalRef
    });
    WF.transition(store, sys(), a.id, 'BACKGROUND_CHECK_COMPLETE', {});

    // Onboarding runs on the tick, so wind the candidate-owned and software
    // tasks forward here and leave the human ones for a person.
    const tasks = WF.tasksFor(store, sys(), a.id);
    const onboardEnd = backAt + Math.round(2.6 * DAY * pace);
    if (stage === 'ONBOARDING' || stage === 'ONBOARDING_REHIRE') {
      finishTasks(tasks, backAt, onboardEnd, ['i9_s1', 'w4', 'direct_dep', 'policies']);
      at(onboardEnd);
      return;
    }
    finishTasks(tasks, backAt, onboardEnd, null);
    at(onboardEnd);
    WF.settle(store, sys(), a.id);

    if (stage === 'READY_FOR_SHIFT') return;

    const startAt = WF.nextMonday(onboardEnd + 3 * DAY);
    at(onboardEnd + 40 * MIN);
    WF.transition(store, mgr(st), a.id, 'FIRST_SHIFT_SCHEDULED', { startsAt: startAt, workMs: 4 * MIN });
    const sh = store.byId('shifts', TENANT, a.firstShiftId);
    if (sh) { sh.confirmState = 'confirmed'; sh.confirmedAt = onboardEnd + 5 * HOUR; }

    if (stage === 'SHIFT_SCHEDULED') return;

    at(startAt);
    WF.transition(store, ext(), a.id, 'STARTED', { at: startAt });

    // The two tasks that genuinely could not happen earlier.
    const post = WF.tasksFor(store, sys(), a.id);
    finishTasks(post, startAt, startAt + 2 * DAY, null, true);

    if (stage === 'EVERIFY_MISMATCH') {
      applyMismatch(a, c, startAt);
      return;
    }
    if (stage === 'STARTED') return;

    // Tenure. The guards are date-based, so move the cursor and let them fire.
    const target = { DAY_30: 31, DAY_60: 61, DAY_90: 91 }[stage];
    if (target) {
      const chain = [['STARTED', 'DAY_30', 31], ['DAY_30', 'DAY_60', 61], ['DAY_60', 'DAY_90', 91]];
      chain.forEach(([from, to, days]) => {
        if (days > target) return;
        at(startAt + days * DAY);
        if (store.byId('applications', TENANT, a.id).state === from) {
          WF.transition(store, ctx({ type: 'system', name: 'Check-in agent' }), a.id, to, {});
        }
      });
    }
  }

  /* ------------------------------------------------------------- helpers -- */

  function applySeedResults(a, seedResult) {
    const chk = WF.checkFor(store, sys(), a.id);
    const county = chk.searches.filter((s) => s.key.indexOf('county_') === 0)[0];
    if (county) county.seedResult = seedResult;
  }

  function finishTasks(tasks, from, to, onlyKeys, afterStartOnly) {
    const span = Math.max(1, to - from);
    tasks.forEach((t, i) => {
      if (t.status === 'done') return;
      if (afterStartOnly && !t.afterStart) return;
      if (!afterStartOnly && t.afterStart) return;
      if (onlyKeys && onlyKeys.indexOf(t.key) < 0) return;
      const doneAt = from + Math.round(span * ((i + 1) / (tasks.length + 1)));
      t.status = 'done';
      t.startedAt = t.startedAt || from;
      t.doneAt = doneAt;
      t.blockedBy = null;
      at(doneAt);
      EV.workflowEvent(store, sys(), {
        applicationId: t.applicationId, candidateId: t.candidateId, at: doneAt,
        kind: 'work', step: t.step, owner: t.owner,
        actorType: t.owner === 'human' ? 'human' : (t.actor === 'candidate' ? 'external' : 'system'),
        actor: t.owner === 'human' ? storeManagerFor(t.applicationId) : (t.actor === 'candidate' ? 'Candidate' : 'Onboarding'),
        durationMs: t.estMs, detail: t.name + ' completed.'
      });
    });
    store.markDirty();
  }

  function storeManagerFor(appId) {
    const a = store.byId('applications', TENANT, appId);
    const s = store.byId('stores', TENANT, a.storeId);
    return s ? s.manager : 'Store manager';
  }

  /* The E-Verify case that comes back a mismatch. She is contesting, and every
     adverse action is barred until the case reaches a Final Nonconfirmation.
     The clocks are computed from these dates, never written down. */
  function applyMismatch(a, c, startAt) {
    const caseCreated = startAt + 3 * HOUR;
    const tncIssued = addBusinessDays(startAt, 1) + 2 * HOUR;
    const decisionAt = tncIssued + 5.7 * HOUR;
    a.everify = {
      caseRef: CONN.ref('EV', a.id),
      createdAt: caseCreated,
      status: 'CASE_IN_CONTINUANCE',
      seedStatus: 'TENTATIVE_NONCONFIRMATION',
      source: 'SSA',
      tncIssuedAt: tncIssued,
      decision: 'contesting',
      decisionAt,
      referredAt: decisionAt + 8 * MIN,
      lastPolledAt: NOW,
      likelyCause: 'Surname hyphenated after marriage in March. The SSA record still holds the maiden name. This is the most common cause of a mismatch and it has nothing to do with the right to work.',
      appointment: 'SSA appointment booked for the 19th.',
      note: 'There is no E-Verify case status that means "contesting", so the product holds that itself.'
    };
    at(tncIssued);
    EV.raiseException(store, sys(), {
      applicationId: a.id, candidateId: c.id, storeId: a.storeId,
      kind: 'everify_mismatch', severity: 'crit', owner: 'human', blocksProgress: false,
      title: 'E-Verify mismatch, contested. Every adverse action is barred.',
      detail: 'Termination, suspension, withheld or lowered pay, delayed training and removed shifts are all unlawful until the case reaches a Final Nonconfirmation.',
      nextAction: 'Nothing. Let the case run. The employee has an SSA appointment booked.'
    });
    EV.auditEvent(store, sys(), {
      action: 'everify.mismatch', actorType: 'system', actor: 'E-Verify connector',
      applicationId: a.id, candidateId: c.id, source: 'connector',
      why: 'Tentative nonconfirmation issued by SSA. Employee notified privately and referred the same day.'
    });
    // Two attempts to cut her shifts, both refused. Seeded because the refusal
    // is the thing worth showing and it should be there before the demo starts.
    [-2 * DAY, -6 * HOUR].forEach((off) => {
      at(NOW + off);
      const blocked = WF.blockShiftRemoval(store, sys(), a.id);
      EV.auditEvent(store, ctx({ type: 'human', name: 'Marcus Hale', role: 'Store manager' }), {
        action: 'shift.remove', actorType: 'human', actor: 'Marcus Hale',
        applicationId: a.id, candidateId: c.id, outcome: 'refused',
        why: blocked, detail: { attempted: 'Remove scheduled shifts' }, source: 'ui'
      });
    });
    at(NOW);
  }

  function dobFor(spec, minAge) {
    const h = CONN.hash(spec.first + spec.last);
    /* Two years of margin over the minimum. Eligibility evaluates age on the
       day somebody applied, not today, so a candidate who applied four months
       ago and sits exactly on the boundary now was under it then. That is the
       rule behaving correctly, so the seed moves rather than the rule. */
    const age = minAge + 2 + (h % 24);
    const y = 2026 - age;
    // The demo's present is 17 August, so a birthday later in the year would
    // make the person a year younger than intended and fail the age rule.
    const m = (h % 7) + 1, d = (h % 28) + 1;
    return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0') + 'T00:00:00.000Z';
  }

  function countiesFor(st, i) {
    const extra = [{ name: 'Delaware', state: 'OH' }, { name: 'Clark', state: 'IN' }, { name: 'Boone', state: 'KY' }];
    const list = [{ name: st.county, state: st.state }];
    if (i % 3 === 0) list.push(extra[i % extra.length]);
    return list;
  }

  function experienceFor(spec) {
    const bank = ['Two years at a garden centre, front of house.', 'Warehouse picking, eighteen months.',
      'Fast food, one year, closing shifts.', 'No paid work yet, finishing school.',
      'Supermarket deli counter, one year.', 'Care work, three years, nights.',
      'Retail seasonal, two winters.', 'Nothing stated.'];
    return bank[CONN.hash(spec.first + spec.last) % bank.length];
  }

  /* ------------------------------------------------------------ finish up -- */

  at(NOW);
  store.db.meta.seededCandidates = CAST.length;
  store.db.meta.seedEvaluationMode = useLLM ? 'llm' : 'deterministic-fallback';
  store.flushNow();

  return {
    tenantId: TENANT,
    candidates: store.all('candidates', TENANT).length,
    applications: store.all('applications', TENANT).length,
    events: store.all('workflowEvents', TENANT).length,
    audit: store.all('auditEvents', TENANT).length
  };
}

/* slotPhrase and availabilityQuestion are exported so the careers page and the
   apply form describe the same hours from the same function. Two independent
   descriptions of one shift pattern is how the question and requiredSlots
   drifted apart in the first place. */
module.exports = { seed, TENANT, TENANT_NAME, ORG, PEOPLE, CAST, SOURCES,
                   slotPhrase, availabilityQuestion, slotPhraseBank };
