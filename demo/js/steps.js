/* ============================================================================
   steps.js  ·  the twenty steps, and who owns each one

   THE canonical step table. The server requires it, the browser script-tags it,
   the test harness evals it. One copy, so the client and the server cannot
   drift apart on what step 12 is called or who owns it.

   owner: which of four things holds the step. This drives the colour.
     agent  = an AI model does it
     human  = a person decides it
     system = deterministic software
     clock  = a fixed wait nobody owns

   clock: true where a legal or vendor clock also applies to the step.
   cover: how many of the two incumbents sell anything here, 0, 1 or 2.

   medianMs was the invented median time in the step. It is kept ONLY as the
   duration the simulated connectors take and as the label on the step
   reference page. Every duration the product reports is now measured from
   recorded events instead. See server/lib/metrics.js.
   ============================================================================ */

(function (root, factory) {
  var v = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = v;
  if (root) root.STEPS = v;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

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

  return steps;
});
