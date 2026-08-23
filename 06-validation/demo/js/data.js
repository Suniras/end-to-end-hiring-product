/* ============================================================================
   data.js  ·  the seed
   Classic script, no modules, so this works from file:// by double-click.

   EVERYTHING HERE IS INVENTED except the legal clocks and the competitor
   coverage, which are sourced.

   Invented: the retailer, every store, every person, every count, every
   duration. Sunfield Markets does not exist. Per the demo spec, no real
   company appears in the seed data, and the retailer is deliberately
   mid-market rather than big-box because big-box is out of our target.

   Sourced, and verified against primary government text on 16 Aug 2026. Full
   table with URLs in 05-strategy/integration-surface-map.md section 5:
     I-9 Section 1        on or before the first day of work for pay
     I-9 Section 2        within 3 business days of that first day
     E-Verify case        no later than the 3rd business day after start
     E-Verify mismatch    10 federal working days from issuance for the
                          employee to tell the employer their decision
     After referral       8 federal working days to contact DHS or visit SSA
     Adverse action bar   nothing adverse until Final Nonconfirmation
     I-9 retention        3 years after hire or 1 year after termination,
                          whichever is later
     NYC Local Law 144    bias audit conducted within 1 year of EACH use,
                          plus 10 business days notice to in-city candidates
     FCRA                 disclosure in a document consisting solely of it;
                          pre-adverse notice, a reasonable gap, then adverse

   Sourced from the teardown in 00-context/hiring platform/: which of the two
   incumbents sells anything at each step.
   ============================================================================ */

window.DEMO = (function () {
  'use strict';

  /* ------------------------------------------------------------ company --- */

  var org = {
    name: 'Sunfield Markets',
    kind: 'Regional grocery and general merchandise',
    stores: 412,
    states: 14,
    hourly: 38000,
    district: 'District 12',
    districtStores: 18,
    store: '#0417 Ridgeway',
    fictional: true
  };

  var people = {
    dana: {
      id: 'dana',
      name: 'Dana Whitfield',
      initials: 'DW',
      role: 'Field HR Manager',
      scope: 'District 12 · 18 stores',
      view: 'district'
    },
    marcus: {
      id: 'marcus',
      name: 'Marcus Iyer',
      initials: 'MI',
      role: 'Store Manager',
      scope: 'Sunfield #0417 Ridgeway',
      view: 'store'
    }
  };

  /* -------------------------------------------------------------- steps ---
     owner: which of four things holds the step. This drives the colour.
       agent  = an AI model does it            (breakdown category B)
       human  = a person decides it            (breakdown category C)
       system = deterministic software          (breakdown category A)
       clock  = a fixed wait nobody owns        (breakdown category D)
     clock: true where a legal or vendor clock also applies to the step.
     cover: how many of the two incumbents sell anything here, 0, 1 or 2.
     medianMs is the median time a candidate spends in the step. Invented.
  ------------------------------------------------------------------------- */

  var HOUR = 3600000, DAY = 86400000, MIN = 60000;

  var steps = [
    { n: 1, stage: 'Hire', name: 'Application captured', owner: 'system', clock: false, cover: 2,
      agentDoes: 'Nothing. No model touches this step.',
      humanDoes: 'Nothing. It is a form and an intake pipe.',
      software: 'Career site form, job board intake, deduplication against every prior application.',
      medianMs: 45 * 1000, at: 96, drop: 0,
      coverNote: 'Both sell here. One of them embeds into a job board so the application completes inside it.' },

    { n: 2, stage: 'Hire', name: 'Eligibility on hard rules', owner: 'system', clock: false, cover: 2,
      agentDoes: 'Nothing, deliberately. A model here adds no capability and would pull us into automated-decision rules a deterministic engine avoids.',
      humanDoes: 'Sets the rules once. Does not review each pass.',
      software: 'Age, right to work declared, availability matched against the shift pattern. Yes or no, no judgement.',
      medianMs: 40 * 1000, at: 41, drop: 22.4,
      coverNote: 'Both sell here.' },

    { n: 3, stage: 'Hire', name: 'Behavioural screening', owner: 'agent', clock: false, cover: 2,
      agentDoes: 'Runs an open conversation by voice or message. Matches each answer against a phrase bank the client owns and can edit.',
      humanDoes: 'Reviews every answer the phrase bank did not clear. The agent can pass a candidate forward. It can never reject one.',
      software: 'Records the call, writes the audit entry, stores the transcript against the retention clock.',
      medianMs: 6.4 * MIN, at: 213, drop: 0,
      coverNote: 'Both sell here. One launched an agentic screener in April 2026.' },

    { n: 4, stage: 'Hire', name: 'Interview scheduled', owner: 'system', clock: false, cover: 2,
      agentDoes: 'Optional conversational front end only. The matching itself is not a model.',
      humanDoes: 'Nothing, unless they want to override a slot.',
      software: 'Availability matching, calendar write, self-serve reschedule, cancellation.',
      medianMs: 1.4 * HOUR, at: 88, drop: 4.1,
      coverNote: 'Both sell here. It is the best known feature of one of them.' },

    { n: 5, stage: 'Hire', name: 'Interview happens, or no-show', owner: 'agent', clock: false, cover: 0,
      agentDoes: 'Confirms, reminds, offers a one-tap reschedule, and calls when a candidate goes quiet before the slot.',
      humanDoes: 'Runs the interview.',
      software: 'Escalates to the store when silence passes a threshold.',
      medianMs: 2.1 * DAY, at: 62, drop: 27.5,
      coverNote: 'Neither sells anything here. It is a step where the software waits on a person to turn up.' },

    { n: 6, stage: 'Hire', name: 'Hire or reject', owner: 'human', clock: false, cover: 2,
      agentDoes: 'Produces a score off the interview it conducted, and shows the reasoning behind every point of it.',
      humanDoes: 'Decides. Absolutely. The score is a suggestion and the product will not proceed without a named person.',
      software: 'Assembles everything the decider needs on one screen and logs who decided and when.',
      medianMs: 19 * HOUR, at: 34, drop: 47.2,
      coverNote: 'Both do a partial version of this.' },

    { n: 7, stage: 'Hire', name: 'Offer made', owner: 'system', clock: false, cover: 2,
      agentDoes: 'Nothing needed.',
      humanDoes: 'Approves the pay rate where policy requires it.',
      software: 'Generates from a template, sends, tracks opening and expiry.',
      medianMs: 3.5 * HOUR, at: 27, drop: 1.2,
      coverNote: 'Both sell here.' },

    { n: 8, stage: 'Hire', name: 'Offer accepted, or goes quiet', owner: 'agent', clock: false, cover: 0,
      agentDoes: 'Follows up by voice or message, answers questions about pay, hours and the first shift, and reports back what the hesitation was.',
      humanDoes: 'Accepts. Nothing on our side can do that for them.',
      software: 'Chase schedule, expiry, automatic escalation, alternate-candidate trigger.',
      medianMs: 1.2 * DAY, at: 21, drop: 8.5,
      coverNote: 'Neither sells anything here.' },

    { n: 9, stage: 'Hire', name: 'Background check ordered', owner: 'system', clock: false, cover: 2,
      agentDoes: 'Nothing. Answers candidate questions about the process only.',
      humanDoes: 'Nothing routine.',
      software: 'Orders with the agency the customer already holds the contract with. Captures the disclosure as a standalone document and the authorisation separately.',
      medianMs: 12 * MIN, at: 18, drop: 0,
      law: 'FCRA: the disclosure must be in a document that consists solely of the disclosure. It cannot share a page with an application or a waiver.',
      coverNote: 'Both sell here, through partners.' },

    { n: 10, stage: 'Hire', name: 'Check comes back clear', owner: 'clock', clock: true, cover: 0,
      agentDoes: 'Nothing. Chases a candidate who has not booked their screen.',
      humanDoes: 'Reviews anything adverse, individually. Required by law in several places and never automated here.',
      software: 'Polls the agency, decomposes the report into its per-county searches, and shows which county is slow.',
      medianMs: 4.8 * DAY, at: 16, drop: 2.9,
      law: 'The wait is the county court, not us. There is no national criminal database available to employers. If anything adverse returns, FCRA requires a pre-adverse notice, a reasonable gap, then an adverse notice. It cannot be collapsed.',
      coverNote: 'Neither sells anything here. The order goes in and the candidate hears nothing for days.' },

    { n: 11, stage: 'Onboard', name: 'I-9, W-4, direct deposit, policy sign-offs', owner: 'system', clock: true, cover: 2,
      agentDoes: 'Nothing goes near an I-9. Explains the document lists without ever steering which document to bring, because steering is an unfair documentary practice.',
      humanDoes: 'Examines the original documents and signs Section 2, under penalty of perjury. No model can sign that.',
      software: 'Pre-fill, format validation, the three-business-day clock, retention for the full period.',
      medianMs: 1.1 * DAY, at: 14, drop: 0,
      law: 'Section 1 on or before the first day of work for pay. Section 2 within 3 business days of that day. Retain 3 years after hire or 1 year after termination, whichever is later.',
      coverNote: 'Both sell here.' },

    { n: 12, stage: 'Onboard', name: 'E-Verify submitted and cleared', owner: 'clock', clock: true, cover: 1,
      agentDoes: 'Nothing in the check itself, there is nothing to infer. It explains a mismatch to the new hire in their own language, and separately tells the store manager what they are not allowed to do.',
      humanDoes: 'Decides whether to contest, which is the employee. The employer notifies, privately and promptly.',
      software: 'Creates the case, drives both clocks, and blocks any adverse action while a mismatch is contested.',
      medianMs: 1.3 * DAY, at: 11, drop: 0.9,
      law: 'Case created no later than the 3rd business day after start. 10 federal working days from issuance for the employee to give their decision. 8 federal working days after referral to contact DHS or visit SSA. No termination, suspension, delayed training, withheld pay or lost shifts until Final Nonconfirmation.',
      coverNote: 'One sells here, and its own documentation says that if the verification service times out it silently falls back to its own decision without showing that in the interface.' },

    { n: 13, stage: 'Onboard', name: 'Training and certifications', owner: 'system', clock: false, cover: 2,
      agentDoes: 'Answers questions about the content. Nothing more.',
      humanDoes: 'Anything a state-mandated certification body requires in person.',
      software: 'Assigns, delivers, tracks completion, chases what is overdue.',
      medianMs: 2.4 * DAY, at: 12, drop: 0,
      coverNote: 'One sells it. The other ships it and does not market it.' },

    { n: 14, stage: 'Onboard', name: 'Uniform, badge, systems access, payroll record', owner: 'system', clock: false, cover: 1,
      agentDoes: 'Nothing.',
      humanDoes: 'Hands over the physical badge and uniform.',
      software: 'Provisioning triggers into payroll, the identity directory and the store systems.',
      medianMs: 1.9 * DAY, at: 9, drop: 0,
      law: 'Badge and till provisioning is the one part of this map with no public vendor documentation anywhere. It sits on the critical path to day one and it is currently unscoped.',
      coverNote: 'Neither sells this. One ships part of it without marketing it. It is four different systems wearing one step, and badge and till provisioning has no public vendor documentation anywhere.' },

    { n: 15, stage: 'Onboard', name: 'First shift scheduled', owner: 'system', clock: true, cover: 1,
      agentDoes: 'Nothing.',
      humanDoes: 'Nothing routine.',
      software: 'Writes to the workforce management system and respects the local advance-notice rule before it does.',
      medianMs: 6.2 * HOUR, at: 8, drop: 0,
      law: 'Fair workweek rules in covered cities require roughly 14 days of advance schedule notice, with a premium payable to change inside that window. So a first shift is not ours to place freely.',
      coverNote: 'One sells a scheduling module.' },

    { n: 16, stage: 'Onboard', name: 'Day one: shows up, or does not', owner: 'agent', clock: false, cover: 0,
      agentDoes: 'Confirms the day before. Says where to park, which door, who to ask for. Calls if the confirmation goes unanswered.',
      humanDoes: 'Turns up.',
      software: 'Escalates silence to the store manager while there is still time to act.',
      medianMs: 5.5 * DAY, at: 7, drop: 9.7,
      coverNote: 'Neither sells anything here, and it is one of the largest drops in the funnel.' },

    { n: 17, stage: 'Activate', name: 'Week one training on the floor', owner: 'human', clock: false, cover: 2,
      agentDoes: 'Nothing.',
      humanDoes: 'Trains them. A person on a shop floor, which is the only thing that works.',
      software: 'Tracks it, prompts the manager, records completion.',
      medianMs: 5 * DAY, at: 24, drop: 3.4,
      coverNote: 'Both have something here, one unmarketed.' },

    { n: 18, stage: 'Activate', name: 'Ramp to working unsupervised', owner: 'human', clock: false, cover: 0,
      agentDoes: 'Nothing yet.',
      humanDoes: 'Judges that somebody is ready. No signal we hold can make that call.',
      software: 'Measures, but only if the customer has any signal worth measuring.',
      medianMs: 12 * DAY, at: 31, drop: 5.1,
      coverNote: 'Neither sells anything here.' },

    { n: 19, stage: 'Activate', name: '30, 60 and 90 day check-ins', owner: 'agent', clock: true, cover: 2,
      agentDoes: 'Runs a short structured check-in and flags a risk answer to a person the same day.',
      humanDoes: 'Has the conversation when one gets flagged.',
      software: 'Schedules, prompts, captures, escalates.',
      medianMs: 30 * DAY, at: 88, drop: 11.2,
      coverNote: 'Both have something here, one unmarketed.' },

    { n: 20, stage: 'Activate', name: 'Still employed at day 90', owner: 'clock', clock: true, cover: 0,
      agentDoes: 'Nothing. This is a measurement, not a step.',
      humanDoes: 'Nothing. It either happened or it did not.',
      software: 'Reads employment status and holds the baseline, because the buyer may not have one.',
      medianMs: 90 * DAY, at: 201, drop: 0,
      law: 'Not a legal clock, a calendar one. Worth knowing that the best public retention disclosure in US retail excludes anyone with under a year of service, which is exactly where the churn sits. So a customer may have no baseline to hold us to.',
      coverNote: 'Claimed by neither. Not one case study metric at either company is retention or 90-day attrition.' }
  ];

  /* ---------------------------------------------------------- the spine ---
     Alicia Reyes, cashier, store 0417. Applies, is screened, is hired, is
     onboarded, starts, and is still there at day 90. One person through all
     twenty steps, because a dashboard tour does not prove the claim and a
     single lifecycle does.
  ------------------------------------------------------------------------- */

  var spine = {
    id: 'alicia',
    name: 'Alicia Reyes',
    initials: 'AR',
    role: 'Cashier',
    store: '#0417 Ridgeway',
    req: 'REQ-0417-2291',
    applied: '2026-07-14T19:42:00',
    source: 'Career site, mobile',
    score: 82,
    scoreBand: [74, 88],
    status: 'Employed, day 94',
    events: [
      { step: 1, at: '2026-07-14T19:42', who: 'System', title: 'Application captured', owner: 'system',
        note: 'Mobile career site. 8 fields. Checked against every prior application under the retention window: no match.' },
      { step: 2, at: '2026-07-14T19:42', who: 'System', title: 'Eligibility cleared on hard rules', owner: 'system',
        note: 'Age 18 or over: yes. Right to work declared: yes. Availability covers the posted shift pattern of evenings and weekends: yes. Deterministic. No model involved, and the rule trace is stored.' },
      { step: 3, at: '2026-07-14T22:55', who: 'Screening agent', title: 'Screening call completed, 6 min 12 s', owner: 'agent',
        note: 'Outbound voice, answered on the second attempt. Three behavioural questions. Every answer matched against the phrase bank Sunfield owns. Outcome: pass. The agent cannot reject, only pass forward or hold for a person.' },
      { step: 4, at: '2026-07-15T08:10', who: 'System', title: 'Interview booked for 17 Jul, 14:00', owner: 'system',
        note: 'Matched her stated availability against the store manager calendar. She moved it once herself, from the 16th, without anyone being asked.' },
      { step: 5, at: '2026-07-17T14:02', who: 'Marcus Iyer', title: 'Interview happened', owner: 'agent',
        note: 'Reminder sent 24 hours out, confirmed. Second nudge 2 hours out, no reply, so a call went at 12:30 and she confirmed she was coming. She arrived.' },
      { step: 6, at: '2026-07-18T09:14', who: 'Marcus Iyer', title: 'Hire decision: proceed', owner: 'human',
        note: 'Agent score 82, band 74 to 88. Marcus read the reasoning, agreed, and decided. His name is on the record, not the model\'s.' },
      { step: 7, at: '2026-07-18T12:40', who: 'System', title: 'Offer sent, $16.75/hr, 28 hrs', owner: 'system',
        note: 'Generated from the Sunfield cashier template. Pay rate inside the band, so no separate approval was needed.' },
      { step: 8, at: '2026-07-19T18:05', who: 'Alicia Reyes', title: 'Offer accepted', owner: 'agent',
        note: 'She went quiet for 20 hours. The agent followed up, she asked whether the 28 hours were guaranteed, the agent answered from the Sunfield policy text, and she accepted 40 minutes later.' },
      { step: 9, at: '2026-07-19T18:17', who: 'System', title: 'Background check ordered', owner: 'system',
        note: 'Ordered with the agency Sunfield already contracts. FCRA disclosure captured as its own document, signed separately from the authorisation. Conditional offer already made, which is what ban-the-box rules require.' },
      { step: 10, at: '2026-07-24T11:33', who: 'Screening agency', title: 'Report returned clear, 4.7 days', owner: 'clock',
        note: 'Three county searches. Two returned in under an hour. Maricopa took 4.6 days and that was the whole wait. Alicia could see that the whole time.' },
      { step: 11, at: '2026-07-28T09:02', who: 'Dana Whitfield', title: 'I-9 completed, Section 2 signed', owner: 'system',
        note: 'Section 1 done the evening before her start date. Section 2 examined and signed by Dana on day one, inside the three-business-day window. Alicia chose a passport, which is a List A document. Nobody suggested it to her.' },
      { step: 12, at: '2026-07-28T09:20', who: 'System', title: 'E-Verify: employment authorised', owner: 'clock',
        note: 'Case created on the start date, well inside the third-business-day deadline. Cleared first pass with no mismatch.' },
      { step: 13, at: '2026-07-30T16:40', who: 'System', title: 'Required training complete', owner: 'system',
        note: 'Four modules. Food handler certification booked for the county in which store 0417 sits, because that requirement is local and not national.' },
      { step: 14, at: '2026-07-29T14:12', who: 'System', title: 'Badge, till login and payroll record created', owner: 'system',
        note: 'Payroll record written. Till login provisioned. Badge printed in store and handed over by a person, because a badge is a physical object.' },
      { step: 15, at: '2026-07-25T10:00', who: 'System', title: 'First shift placed for 28 Jul, 15:00', owner: 'system',
        note: 'Written to the scheduling system 14 days ahead, which is what the advance-notice rule requires in this city. Placing it sooner would have cost a premium.' },
      { step: 16, at: '2026-07-28T14:51', who: 'Alicia Reyes', title: 'Day one: arrived, 9 min early', owner: 'agent',
        note: 'Confirmation the evening before said which door, where to park and to ask for Marcus. She opened it. No nudge needed after that.' },
      { step: 17, at: '2026-08-02T18:00', who: 'Marcus Iyer', title: 'Week one floor training signed off', owner: 'human',
        note: 'Five shifts alongside a trained cashier. Signed off by Marcus.' },
      { step: 18, at: '2026-08-14T20:30', who: 'Marcus Iyer', title: 'Cleared to work a till unsupervised', owner: 'human',
        note: 'Day 17. Two days ahead of the store median of 19. Marcus made the call, as he should.' },
      { step: 19, at: '2026-10-26T11:00', who: 'Check-in agent', title: 'Day 90 check-in: no risk flagged', owner: 'agent',
        note: 'Day 30 and 60 also clear. On day 60 she asked about picking up weekend hours and that went to Marcus the same day.' },
      { step: 20, at: '2026-10-26T11:00', who: 'System', title: 'Still employed at day 90', owner: 'clock',
        note: 'The number nobody in this category claims. We hold the baseline because the customer probably does not.' }
    ],
    transcript: [
      { who: 'Agent', side: 'agent', text: 'Hi, is that Alicia? This is the hiring assistant calling for Sunfield Markets about the cashier role at Ridgeway. It takes about six minutes. Is now alright, or shall I call back?' },
      { who: 'Alicia', side: 'person', text: 'Now is fine.' },
      { who: 'Agent', side: 'agent', text: 'Before anything else: this call is recorded and an assistant is running it, not a person. A person makes the hiring decision, not me. You can ask for a human at any point and you can ask for a written version instead. Happy to go on?' },
      { who: 'Alicia', side: 'person', text: 'Yes, go ahead.' },
      { who: 'Agent', side: 'agent', text: 'The posting is evenings and weekends, around 28 hours. Does that work with everything else you have on?' },
      { who: 'Alicia', side: 'person', text: 'Yes. I do a college course Tuesday and Thursday mornings but I am free from two onwards, and weekends are completely fine.',
        match: 'Phrase bank: availability confirmed, no conflict with posted pattern', matchKind: 'good' },
      { who: 'Agent', side: 'agent', text: 'Tell me about a time a customer was upset with you about something that was not your fault. What did you actually do?' },
      { who: 'Alicia', side: 'person', text: 'At my last job the card machine went down and a man had a full trolley. He was really annoyed. I said sorry, told him exactly what was happening rather than pretending, and asked the supervisor to open the other till so he did not have to queue again. He was still cross but he did not leave the shop.',
        match: 'Phrase bank: acknowledged, informed, escalated appropriately, kept the sale', matchKind: 'good' },
      { who: 'Agent', side: 'agent', text: 'Last one. A colleague asks you to clock them in ten minutes early because they are running late. What do you do?' },
      { who: 'Alicia', side: 'person', text: 'I would not do that. It is their hours, not mine to sign for. I would tell them to speak to the manager.',
        match: 'Phrase bank: refused, gave a reason, routed to a manager', matchKind: 'good' },
      { who: 'Agent', side: 'agent', text: 'That is everything. Someone from the Ridgeway store will look at this and come back to you. You will hear either way, and if it is a no you will be told, not left waiting.' }
    ]
  };

  /* ------------------------------------------------ moment one: the flag ---
     A returning applicant. He is a brand-new applicant to us, which is
     exactly why the imported flag has to exist.
  ------------------------------------------------------------------------- */

  var flagged = {
    id: 'trevor',
    name: 'Trevor Boone',
    initials: 'TB',
    role: 'Stocker',
    store: '#0417 Ridgeway',
    applied: '2026-08-17T06:12',
    score: 79,
    scoreBand: [71, 86],
    flag: {
      kind: 'Not eligible for rehire',
      raised: '2024-11-08',
      raisedBy: 'Sunfield Markets, store #0311 Kestrel Way',
      reason: 'Terminated for cause. Inventory loss investigation closed with a finding.',
      source: 'Read from the retailer\'s applicant tracking system through the rehire connector',
      matchedOn: 'Social security number and date of birth. Name is spelled differently on this application, and the address, phone and email are all new.'
    }
  };

  /* --------------------------------------- moment two: the mismatch bar ---
     Kayla is a US citizen. Her SSA record still carries her maiden name after
     a marriage, which is the single most common real cause of a mismatch. It
     is an administrative error, not an immigration problem, and the product
     has to make everyone involved understand that before somebody quietly
     drops her off the rota.
  ------------------------------------------------------------------------- */

  var mismatch = {
    id: 'kayla',
    name: 'Kayla Brennan-Ross',
    initials: 'KB',
    role: 'Deli Associate',
    store: '#0417 Ridgeway',
    started: '2026-08-13',
    caseCreated: '2026-08-13T10:04',
    tncIssued: '2026-08-14T09:31',
    tncSource: 'SSA',
    likelyCause: 'Surname hyphenated after marriage in March. The SSA record still holds the maiden name. This is the most common cause of a mismatch and it has nothing to do with the right to work.',
    citizen: true,
    decision: 'Contesting',
    decisionAt: '2026-08-14T15:12',
    referred: '2026-08-14T15:20',
    shiftsScheduled: 4,
    blockedAttempts: [
      { at: '2026-08-15T07:41', who: 'Marcus Iyer', what: 'Tried to remove Kayla from the week 34 rota', outcome: 'Blocked' },
      { at: '2026-08-16T18:22', who: 'Shift lead, #0417', what: 'Tried to mark Kayla unavailable indefinitely', outcome: 'Blocked' }
    ]
  };

  /* ------------------------------------------------------- triage queue ---
     Monday morning. What the overnight run left for a person.
  ------------------------------------------------------------------------- */

  var overnight = {
    read: 312,
    autoAdvanced: 247,
    needPerson: 65,
    knockedOut: 71,
    moves: 4,
    window: 'Friday 18:00 to Monday 07:00',
    /* Split so the 247 can be stated precisely rather than as "advanced".
       213 had a screening conversation with the agent. 34 cleared the
       deterministic rules and were routed onward without needing one. */
    agentScreened: 213,
    ruleCleared: 34
  };

  var queue = [
    { id: 'q-flag', kind: 'crit', owner: 'human', bucket: 'Blocked, needs a person',
      person: flagged.name, initials: flagged.initials, sub: 'Stocker · #0417 · scored 79, then stopped',
      line: 'Matched an imported not-eligible-for-rehire flag on SSN and date of birth. Name spelled differently, all contact details new.',
      chip: 'Do not hire', chipKind: 'is-crit', act: 'Review flag', route: 'flag', count: 1 },

    { id: 'q-tnc', kind: 'crit', owner: 'human', bucket: 'Blocked, needs a person',
      person: mismatch.name, initials: mismatch.initials, sub: 'Deli Associate · #0417 · started 13 Aug',
      line: 'E-Verify mismatch being contested. Two attempts to drop her shifts have been blocked. Eight working days left to resolve.',
      chip: 'Adverse action barred', chipKind: 'is-crit', act: 'Open compliance', route: 'compliance', count: 1 },

    { id: 'q-review', kind: 'warn', owner: 'human', bucket: 'Agent held for judgement',
      person: '19 candidates', initials: '19', sub: 'Across 6 stores · screened overnight',
      line: 'The phrase bank did not clear an answer. The agent held each one rather than deciding. Bundled into one pass.',
      chip: 'In review', chipKind: 'is-warn', act: 'Review 19', route: 'screening', count: 19 },

    { id: 'q-decide', kind: 'plain', owner: 'human', bucket: 'Waiting on your decision',
      person: '34 candidates', initials: '34', sub: 'Interviewed, scored, waiting',
      line: 'Every one has an interview, a score and the reasoning behind it. The oldest has been waiting 2 days 4 hours.',
      chip: 'Decide', chipKind: 'is-plain', act: 'Open decisions', route: 'decide', count: 34 },

    { id: 'q-slow', kind: 'plain', owner: 'human', bucket: 'Slower than it should be',
      person: '6 background checks', initials: '6', sub: 'Past the 5-day median',
      line: 'All six are waiting on one county that is running slow. Nothing to chase with the agency. Worth telling the six candidates.',
      chip: 'County delay', chipKind: 'is-plain', act: 'Open checks', route: 'checks', count: 6 },

    { id: 'q-day1', kind: 'warn', owner: 'human', bucket: 'Starting soon',
      person: '4 new hires', initials: '4', sub: 'First shift within 72 hours',
      line: 'Three have opened the day-one confirmation. One has not, on a second attempt. The agent calls that one at 10:00 unless you would rather.',
      chip: 'Day one risk', chipKind: 'is-warn', act: 'Open starts', route: 'starts', count: 4 }
  ];

  /* -------------------------------------------------------- 19 in review --- */

  var inReview = [
    { name: 'Devon Marsh', initials: 'DM', role: 'Cashier', store: '#0417', why: 'Answer on the shift-cover question did not match any approved phrase. Agent held it rather than guessing.', score: 68, band: [58, 77] },
    { name: 'Priya Anand', initials: 'PA', role: 'Curbside Picker', store: '#0288', why: 'Said she can work "most weekends". The phrase bank has no entry for a conditional availability, so a person reads it.', score: 74, band: [66, 81] },
    { name: 'Luis Ferrer', initials: 'LF', role: 'Stocker', store: '#0417', why: 'Mentioned a lifting restriction. Routed to a person because that is an accommodation conversation, not a screening one.', score: 71, band: [62, 79] },
    { name: 'Bex Odell', initials: 'BO', role: 'Deli Associate', store: '#0355', why: 'Asked for a written interview instead of a call. Granted automatically, and flagged so nobody treats it as a non-response.', score: null, band: null },
    { name: 'Tomasz Nowak', initials: 'TN', role: 'Cashier', store: '#0288', why: 'Call dropped twice at 4 minutes. Partial transcript only, so the agent will not score it.', score: null, band: null }
  ];

  /* --------------------------------------------------- decisions waiting --- */

  var decisions = [
    { name: 'Alicia Reyes', initials: 'AR', role: 'Cashier', store: '#0417', score: 82, band: [74, 88], waited: '19h', top: 'Handled an upset customer by informing rather than deflecting, and escalated correctly', flagged: false },
    { name: 'Marcus Hale', initials: 'MH', role: 'Stocker', store: '#0417', score: 77, band: [69, 84], waited: '1d 2h', top: 'Clear availability, prior warehouse experience, one vague answer on reliability', flagged: false },
    { name: 'Trevor Boone', initials: 'TB', role: 'Stocker', store: '#0417', score: 79, band: [71, 86], waited: 'Blocked', top: 'Scored well. Then matched a not-eligible-for-rehire flag read from Sunfield\'s own records.', flagged: true },
    { name: 'Ines Duarte', initials: 'ID', role: 'Curbside Picker', store: '#0355', score: 85, band: [78, 90], waited: '2d 4h', top: 'Strongest phrase-bank match this week. Oldest item in the queue, which is the thing to fix.', flagged: false },
    { name: 'Ryan Kettle', initials: 'RK', role: 'Cashier', store: '#0288', score: 61, band: [50, 71], waited: '8h', top: 'Two answers matched negative phrases on reliability. Agent did not reject. It never does.', flagged: false }
  ];

  /* --------------------------------------------------- background checks --- */

  var checks = [
    { name: 'Alicia Reyes', initials: 'AR', ordered: '2026-07-19', days: 4.7, status: 'clear',
      searches: [
        { what: 'SSN trace', where: '', done: true, ms: 40 * MIN },
        { what: 'County criminal', where: 'Ridgeway County', done: true, ms: 52 * MIN },
        { what: 'County criminal', where: 'Maricopa County', done: true, ms: 4.6 * DAY },
        { what: 'County criminal', where: 'Pinal County', done: true, ms: 3.1 * HOUR },
        { what: 'Employment verification', where: '2 employers', done: true, ms: 2.2 * DAY }
      ] },
    { name: 'Sasha Bell', initials: 'SB', ordered: '2026-08-09', days: 8.2, status: 'pending',
      searches: [
        { what: 'SSN trace', where: '', done: true, ms: 35 * MIN },
        { what: 'County criminal', where: 'Ridgeway County', done: true, ms: 44 * MIN },
        { what: 'County criminal', where: 'Cole County', done: false, ms: 8.2 * DAY, note: 'Court requires a physical records visit. No digital access. This is the whole delay.' },
        { what: 'Employment verification', where: '1 employer', done: false, ms: 6.0 * DAY, note: 'Previous employer has not returned the call. Third attempt today.' }
      ] },
    { name: 'Owen Pike', initials: 'OP', ordered: '2026-08-11', days: 6.1, status: 'pending',
      searches: [
        { what: 'SSN trace', where: '', done: true, ms: 38 * MIN },
        { what: 'County criminal', where: 'Cole County', done: false, ms: 6.1 * DAY, note: 'Same court as Sasha Bell. Same backlog.' },
        { what: 'Drug screen', where: 'Collection site', done: false, ms: 5.4 * DAY, note: 'Candidate has not attended. Agent has nudged twice and calls today. This one is ours to fix.' }
      ] }
  ];

  /* --------------------------------------------------------- day one risk --- */

  /* --- first shifts, and how we know whether somebody is coming ---
     HOW THE SIGNAL WORKS, because "confirmation opened" on its own is not a
     claim anybody should accept.

     Each new hire gets one SMS carrying a link that is unique to them. That
     link asks them to confirm three things: the date, the store and who to ask
     for. Three states, and only three, because only three are honest:

       confirmed    they tapped the link and pressed confirm. This is the only
                    state that means a human read it.
       delivered    the carrier accepted the message and we have a delivery
                    receipt. It tells us the phone got it. It does not tell us
                    anybody looked.
       undelivered  the carrier rejected it. Wrong number, or the phone is off.

     What we deliberately do NOT use: email open pixels, which are blocked by
     most mail clients and report false negatives constantly, and SMS read
     receipts, which are not available on US carriers. A link tap is the only
     signal that survives scrutiny.
  --------------------------------------------------------------------------- */

  var CONFIRM = {
    confirmed:   { label: 'Confirmed',        tone: 'is-good', how: 'Tapped their link and pressed confirm' },
    delivered:   { label: 'Delivered, no reply', tone: 'is-warn', how: 'Carrier delivery receipt only. Nobody has opened the link' },
    undelivered: { label: 'Not delivered',    tone: 'is-crit', how: 'Carrier rejected the message. Number may be wrong' }
  };

  var starts = [
    { name: 'Kayla Brennan-Ross', initials: 'KB', role: 'Deli Associate', store: '#0417', start: '2026-08-13',
      state: 'started', confirm: 'confirmed', sent: 2, tappedAt: '2026-08-12T19:40',
      note: 'Working since 13 Aug. E-Verify mismatch open and being contested, so her shifts cannot be changed.' },
    { name: 'Noor Haddad', initials: 'NH', role: 'Cashier', store: '#0417', start: '2026-08-19',
      state: 'soon', confirm: 'confirmed', sent: 1, tappedAt: '2026-08-16T08:12',
      note: 'Confirmed Wednesday 15:00. Knows which door, and to ask for Marcus.' },
    { name: 'Eli Fontaine', initials: 'EF', role: 'Stocker', store: '#0288', start: '2026-08-19',
      state: 'soon', confirm: 'confirmed', sent: 1, tappedAt: '2026-08-16T21:03',
      note: 'Confirmed. Asked one question about where to park, answered by the agent.' },
    { name: 'Dax Whitmore', initials: 'DX', role: 'Curbside Picker', store: '#0355', start: '2026-08-20',
      state: 'risk', confirm: 'delivered', sent: 2, tappedAt: null,
      note: 'Two messages delivered, neither link opened. Starts in 3 days. The agent places a call at 10:00 today unless somebody would rather do it.' }
  ];

  /* ------------------------------------------------------------- funnel ---
     District 12, trailing 30 days. Invented. Day 90 is deliberately a
     different cohort, and labelled as one, because it has to be.
  ------------------------------------------------------------------------- */

  var funnel = [
    { n: 1, label: 'Applications captured', v: 2847 },
    { n: 2, label: 'Cleared hard-rule eligibility', v: 2209 },
    { n: 3, label: 'Screened by the agent', v: 2209 },
    { n: 4, label: 'Interview booked', v: 1102 },
    { n: 5, label: 'Interview happened', v: 799 },
    { n: 6, label: 'Hire decision made', v: 421 },
    { n: 7, label: 'Offer sent', v: 416 },
    { n: 8, label: 'Offer accepted', v: 381 },
    { n: 10, label: 'Background check cleared', v: 370 },
    { n: 12, label: 'E-Verify cleared', v: 367 },
    { n: 15, label: 'First shift placed', v: 352 },
    { n: 16, label: 'Turned up on day one', v: 318 }
  ];

  var cohort90 = { started: 341, still: 201, window: 'Started 90 or more days ago, cohort of 341' };

  var actors = [
    { who: 'The agent', kind: 'agent', actions: 8912, share: 71.4 },
    { who: 'Deterministic rules', kind: 'system', actions: 2740, share: 21.9 },
    { who: 'A named person', kind: 'human', actions: 836, share: 6.7 }
  ];

  /* ----------------------------------------------------- the store view --- */

  var storeView = {
    openings: [
      { role: 'Cashier', req: 'REQ-0417-2291', open: 12, filled: 5, stage: '2 candidates waiting for your decision' },
      { role: 'Stocker', req: 'REQ-0417-2288', open: 19, filled: 3, stage: '1 applicant blocked on a rehire record' },
      { role: 'Deli Associate', req: 'REQ-0417-2301', open: 4, filled: 4, stage: 'Fully staffed. 1 starts Thursday' }
    ],
    /* Each row states the restriction and why it exists. A row that just says
       "warning" makes the reader guess, and the person reading this is a store
       manager between two other jobs. */
    thisWeek: [
      { name: 'Kayla Brennan-Ross', role: 'Deli Associate', since: 'Working since 13 Aug',
        kind: 'crit',
        restriction: 'Do not change or remove her shifts',
        why: 'Her E-Verify check came back mismatched and she is contesting it, which she is entitled to do. Until that case closes, removing shifts is an adverse action and it is unlawful. This is not a preference and the system will refuse it.',
        until: 'Her SSA appointment is on 19 Aug. Expected to clear after that.' },
      { name: 'Noor Haddad', role: 'Cashier', since: 'Starts Wed 19 Aug, 15:00',
        kind: 'good',
        restriction: 'Nothing needed from you',
        why: 'She tapped her confirmation link on 16 Aug and confirmed the date, the store and who to ask for.',
        until: null }
    ],
    asks: 2
  };

  /* -------------------------------------------------------- the scenes ---
     Presenter notes. The narration to read out loud, per scene, in the
     house format from the NuAnchor demo pack: what to say, what to do, and
     the one number to land.
  ------------------------------------------------------------------------- */

  var scenes = [
    { id: 1, route: 'deck', t: 'Monday morning', secs: 40, land: '65 of 312',
      say: 'This is Dana. She runs hourly hiring across eighteen stores. It is Monday, 7am, and over the weekend three hundred and twelve people applied. Two hundred and forty-seven of them moved through without her. Sixty-five need a person, and the product has already sorted them into four things to do rather than sixty-five.',
      act: 'Land on the deck. Let the numbers count up before you say anything.' },

    { id: 2, route: 'pipeline', t: 'All twenty steps', secs: 70, land: '20 steps, four owners',
      say: 'Here is the whole thing. Twenty steps from somebody applying to somebody still being there at ninety days. Every step is coloured by who owns it. Purple is the agent. Blue is a person deciding. Grey is plain software with no judgement in it. Amber is a wait nobody can compress, like a county court. Notice how much of this is grey. Most of a working hiring system is not AI, and the steps nobody in this market sells into are almost all the waits.',
      act: 'Hover a couple of rows. Click step 6 to show the boundary label: what the agent owns, what you decide.' },

    { id: 3, route: 'candidate', t: 'One person, end to end', secs: 60, land: '19 days, 20 steps',
      say: 'One person, all twenty steps, with a timestamp and a name against every one. Alicia applied on a Saturday night at twenty to eight. She was screened three hours later, interviewed on the Thursday, decided on the Friday, and she is still there at day ninety. Every entry says who acted. Where it says the agent, it says exactly what the agent was allowed to do.',
      act: 'Scroll the timeline slowly. Stop on step 6 and read the note out loud.' },

    { id: 4, route: 'screening', t: 'The call, and the phrase bank', secs: 75, land: 'Pass or hold, never reject',
      say: 'This is the screening call. Six minutes twelve. The first thing the agent says is that it is an assistant, that a person decides, and that she can ask for a human or a written version instead. Then three questions. Every answer is matched against a phrase bank that Sunfield writes and owns, not us. The agent can pass somebody forward. It cannot reject anybody. Nineteen people this weekend had an answer the phrase bank did not cover, and every one of them went to a person instead of being guessed at.',
      act: 'Read the opening disclosure line out loud, it is the one people ask about. Then show the phrase-bank match under an answer.' },

    { id: 5, route: 'decide', t: 'The score, and who decides', secs: 60, land: '82, band 74 to 88',
      say: 'Here is the score. Eighty-two, and a band of seventy-four to eighty-eight, because a single number to two decimal places would be a lie. Under it is the reasoning. And the only way out of this screen is a person clicking. Watch what happens when I approve: her name leaves the queue, the pipeline count moves, and the timeline gains an entry with my name on it, not the model\'s.',
      act: 'Approve Alicia. Point at the queue count dropping and the toast naming who decided.' },

    { id: 6, route: 'flag', t: 'The one nobody catches', secs: 80, land: 'Matched on SSN, not on name',
      say: 'Now the one I actually want your opinion on. Trevor applied on Monday and scored seventy-nine. Good candidate on paper. He was also terminated for cause at another Sunfield store in 2024 and marked not eligible for rehire. He spelled his name differently this time and every contact detail is new. To any new system he is a brand-new applicant. We caught him because when Sunfield left their old system we imported one list: the do-not-hire list. That is the whole reason we insist on it. Screen faster and you rehire this man faster.',
      act: 'Open the flag. Read the matched-on line. Let the room sit with it.' },

    { id: 7, route: 'compliance', t: 'The one that keeps them out of court', secs: 95, land: '8 working days, 2 blocks',
      say: 'And the other one. Kayla started on the thirteenth. E-Verify came back with a mismatch, which sounds alarming and almost never is. She is a US citizen. She got married in March, hyphenated her surname, and the government record still has the old one. She is contesting it, which she is entitled to do. Now the important part. While she contests, the law says you cannot do anything adverse. Not fire her, not suspend her, not delay her training, and not quietly leave her off the rota. Her store manager tried to drop her from next week twice. The product stopped him both times and told him why. Nobody was being malicious. He just did not know. That is how retailers break this law.',
      act: 'Show both clocks. Then click the blocked attempts and read one out.' },

    { id: 8, route: 'checks', t: 'Making the wait visible', secs: 55, land: 'One county, 8.2 days',
      say: 'This is the bit that is honest rather than clever. A background check takes as long as the slowest county court, and there is no national database to go and read. We cannot make this faster. What we can do is stop it being a black hole. Sasha has been waiting eight days and it is one county that needs somebody to physically walk into a courthouse. Two things follow. Nobody chases the agency pointlessly, and Sasha gets told. Right now, in this market, she would just go quiet and take another job.',
      act: 'Expand Sasha. Point at the one row that is the whole delay.' },

    { id: 9, route: 'funnel', t: 'It measures itself', secs: 60, land: '71% agent, 6.7% human',
      say: 'Last screen. Every number in this product came out of the product. Time in each step, where people drop, and who acted. Seventy-one percent of actions were the agent, twenty-two percent were plain rules, and just under seven percent were a person. We built this because nobody publishes where the time goes in frontline hiring. We looked hard, twice. So the first deployment has to produce the number instead of quoting somebody else\'s.',
      act: 'Switch to the store view at the end to show the same data from Marcus\'s side.' },

    { id: 10, route: 'deck', t: 'The assistant', secs: 70, land: 'It refuses, and it shows its working',
      say: 'One last thing, bottom right. This is not a language model and I am not going to pretend it is. It is an intent classifier running on this machine, no network call, no API key. It knows eighteen things and it does them. Watch two of them. First I ask it to hire somebody, and notice it asks before it acts and puts my name on the record rather than its own. Then I ask it to take Kayla off next week rota, in my own words, and it refuses, explains which law, tells me how many working days are left, and logs the attempt in the same place the store manager attempts appear. And under every reply there is a line you can open that shows exactly which words it matched and how confident it was. You should be able to audit it, not just trust it.',
      act: 'Open it with the button or press C. Type "hire ines duarte" and approve. Then type "take kayla off next weeks rota" and let it refuse. Then open the working line under that refusal.' },

    { id: 11, route: 'store', t: 'The ask', secs: 45, land: 'Feedback, not approval',
      say: 'That is the demo. Everything outside our own product is simulated and labelled as simulated, so no real integration exists yet. What I want from you is feedback and a lot of it. Is this what you meant by end to end hiring? Which parts of the funnel have I got wrong? Is there anything here we should not be doing at all? And what have I left out that you expected to see?',
      act: 'Stop clicking. Ask the four questions and write down the answers.' }
  ];

  return {
    org: org, people: people, steps: steps, spine: spine, flagged: flagged,
    mismatch: mismatch, overnight: overnight, queue: queue, inReview: inReview,
    decisions: decisions, checks: checks, starts: starts, funnel: funnel,
    cohort90: cohort90, actors: actors, storeView: storeView, scenes: scenes, CONFIRM: CONFIRM,
    HOUR: HOUR, DAY: DAY, MIN: MIN
  };
})();
