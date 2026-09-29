# Project context

**Internal only. Contains client names and contact details. Do not copy any of this into
customer-facing material.**

Last updated 27 Aug 2026.

**Folder change, 27 Aug.** Everything written for somebody outside this repo moved to `shared/`. The five
working records stay at the root: this file, DECISIONS.md, EVIDENCE.md, OPEN-QUESTIONS.md and TODO.md. The
reason for the split is in shared/README.md, and it is that a snapshot taken for an audience goes stale while
a working record does not.

## If you are a new session, read this first

CLAUDE.md holds the rules and a map of every file. **It went missing from the repository root and was rebuilt
on 27 August 2026** from the rules recorded in this file and in the project's own history. Read it before this
one. It also carries a section on how this project has gone wrong, which is worth reading before doing anything
that involves a number.

This file holds the current state. Read it, then OPEN-QUESTIONS.md, then TODO.md. That is enough to pick up
work.

**This file never overrides CLAUDE.md.** Where they disagree, CLAUDE.md wins and the disagreement is flagged
below so Suniras can decide.

**Reading order for the full picture:**

0. CLAUDE.md. The rules, the file map, and the list of ways this project has been wrong before.
1. CONTEXT.md, this file. State.
2. TODO.md. What Suniras owes, and what is waiting on a person.
3. DECISIONS.md. Twenty-six decisions, each with a reason and a reversal condition. Newest first. D-013 to
   D-017 are from 16 Aug and they define the product. D-018 and D-019 are the demo. **D-020 to D-022 are from
   the second meeting with Nishant on 18 Aug, and D-020 reverses D-015, so read it before anything else.
   D-023 is from 24 Aug and closes desk research. D-024 to D-026 are from 25 Aug: Joy's feature list is out of
   scope, the demo standard, and the gate Nishant set for closing discovery.**
4. 02-landscape/anuj-prd-assessment.md. **NEW 25 Aug.** Anuj Jain's retail frontline PRD, read and verified.
   What transfers, where the two designs conflict, and the evidence verdict on his numbers. Read the auto-reject
   section and the evidence verdict before reusing anything from that folder.
5. 03-discovery/synthesis/internal-inputs-2026-08-25.md. **NEW 25 Aug.** What the Anuj and Joy conversations
   actually contain, claim by claim, with the four things in them that look wrong. Read it with item 4, not
   apart from it. The raw sources are in 03-discovery/raw/internal/, in a separate folder because colleagues
   do not count toward the discovery gate.
6. 05-strategy/problem-statement.md. **NEW 26 Aug, and it is the live deliverable.** A scaffold, empty below
   each heading, for the problem statement and persona list D-026 requires. Each section lists what is already
   available to fill it and what is not. Written by Claude, to be filled by Suniras.
7. 01-diagnosis/verification-2026-08-26.md. **NEW 26 Aug.** Twelve agents on six questions: the I-9 and
   E-Verify rehire rules, background-check reuse, the 72-hour claim, the size of the rehire population, and job
   board distribution. 133 claims survived, 19 killed, 45 narrowed. **Read it before designing anything to do
   with rehire or job boards**, and read section 3 and section 5, which correct two things Claude got wrong.
8. 01-diagnosis/verification-2026-08-26b.md. **NEW 26 Aug.** LinkedIn access re-verified on Suniras's
   instruction, plus the alternatives. Contains the finding that an employment lookup done for an employer makes
   us a consumer reporting agency, the free job-distribution tier, and corrections to D-016 on Colorado and
   California. Section 2 on the hiQ litigation has had one pass, not two, because an agent died.
9. 05-strategy/v1-slice.md. The seven scope questions, Suniras's answers, and my challenges kept separate.
10. 05-strategy/automation-breakdown.md. All twenty steps sorted into deterministic, AI, human-required and
   fixed-clock.
11. OPEN-QUESTIONS.md. Forty-two questions with owners. Read the index at the top first: it says what is
   blocking and what closed. Q-034 to Q-040 added 25 Aug, Q-041 added 26 Aug.
12. EVIDENCE.md. Every claim with its tier, plus a list of circulating numbers that must not be used. **E-076
    to E-112 added 26 Aug are the first verified primary-source facts this project has on rehire mechanics.**
13. 01-diagnosis/funnel-map.md. The twenty steps from application to day 90, filled in, with a read-back
   counting what the answers add up to.
14. 01-diagnosis/compliance-steps-explained.md. What the background check, the I-9 and E-Verify actually are.
15. 02-landscape/gap-claims.md. Competitor weaknesses with an evidence tier on each.
16. 02-landscape/paradox-gaps.md. **NEW 27 Aug.** The Paradox gaps we are actually building against, the ones
    that only look like gaps, and a table of claims about them we must not make. Read that last table before any
    competitive conversation.
17. 01-diagnosis/research-2026-08-14.md. The last research run. One angle of six survived, audited hard.
18. 03-discovery/practitioner-questions.md. The fourteen questions desk research cannot answer.
19. ../demo/demo/. The working demo. Double-click index.html. Its README explains what is real,
    what is invented and what is simulated.
20. ../demo/DEMO-SCRIPT.docx. Thirteen scenes, the narration written out to read aloud.
21. shared/meeting-2-todo.md. What the second meeting asked for and how I read a garbled transcript.
22. 05-strategy/connector-map.md. Which of the twenty steps need a system and which are just email and phone.
    This answers the most concrete question Nishant asked.
23. 05-strategy/exception-register.md. The edge-case laundry list he asked for.
24. shared/QUESTIONS-FOR-TARGET.md. Send-able questions for his Target colleagues.
25. shared/STATUS-FOR-NISHANT.md. **Updated 27 Aug and current.** Structured as a memo rather than an essay,
    after Nishant said the previous one read as randomly constructed. Covers the connector reversal, the size
    of the prize, all four research runs, what is blocked, and a retraction of four claims that a mid-run
    snapshot had put in the previous version. Has not been sent yet.

## Two working rules that matter more than they look

**Write in plain simple English.** Short sentences, everyday words, define a term the first time it appears,
no em dashes, use bold rarely. Suniras rejected an entire set of documents as unreadable on 9 Aug and asked
for a rewrite. Do not drift back.

**Suniras does the thinking.** Never produce a problem statement, persona, competitive teardown, PRD,
positioning statement, metric tree or acceptance criteria that Suniras has not drafted first. Ask the question
that exposes the gap instead. Research, file scaffolding, assembly of already-recorded material, and code are
fine. This has been tested repeatedly and it holds.

---

## Where we are

**Phase 5, strategy.** Moved out of diagnosis on 16 Aug 2026 when the scope decision was taken.

Phase 0 closed 9 Aug against its own criteria. Phase 1 ran on public evidence only, by D-005, and closed with
two things it could not deliver: no traceable step-level funnel timing exists publicly, and there is still no
practitioner access.

**16 August was the day this became a product.** Five decisions, D-013 to D-017, and all seven questions in
05-strategy/v1-slice.md answered. Read that file and DECISIONS.md before anything else.

**Nishant has v1 of the status doc and has not replied.** v2 was written on 18 Aug, rewritten again on
24 Aug, and is still unsent. It leads with the demo rather than with what is missing, because that changed.
The two MEETING- files are stale prep material.

**25 August set a deadline.** Nishant relayed his conversations with Anuj Jain and Joy, and defined the exit
condition for discovery himself: a problem statement and a persona list that Suniras is convinced by, then
specs, data model, information architecture, engineering high level design, build. D-026. Check-in on the
evening of 26 Aug, or Thursday 27 Aug. So the two sentences owed since 16 Aug are now the deliverable rather
than a loose end.

**What that call changed.** Most of Joy's material is a feature request for a different product and is out of
scope, D-024. The demo standard is now written down, D-025. One new practitioner route opened, Q-036, and it is
the best one this project has had: Anuj met US clients in person and nobody has asked him who they were. And
Nishant confirmed he has no practitioner connections of his own, E-073, so the internal route to Q-001 is
exhausted.

**26 August cleared most of it, and the project is not blocked.** Suniras answered the open questions and
corrected two of my errors. Q-027 closed with the answer no. Q-035 was reframed after I had manufactured a
contradiction that was not there. Q-037 was reframed from a compliance guard into a speed feature, which is the
strongest single idea anybody other than Suniras has added to this project. **Only Q-030 is still blocking, and
it is deferred by his own call with two guardrails. So nothing in OPEN-QUESTIONS.md blocks the problem statement
Nishant asked for.** The scaffold for it is 05-strategy/problem-statement.md, empty by design.

### What is settled about scope, updated 16 Aug

- **All twenty funnel steps are in scope.** No slice, no wedge. D-013. Parity with the incumbents is the ticket
  and the spanning view across all twenty, including the steps we never automate, is the claim.
- **We are a connector layer, not the system of record. CHANGED 18 Aug.** Nishant accepted the connector
  approach in the second meeting, which reverses D-015. We connect to whatever the retailer already runs rather
  than replacing it. D-020. This removes the rip-and-replace sale and puts us back on the architecture Nurix
  actually shipped at Unifi. What it loses: owning the record would eventually have given us the dataset nobody
  publishes, which was the route by which attract might have come back into scope.
- **I-9 and E-Verify are an embedded vendor.** D-022, and it closes Q-033. The requirement that survives is that
  the vendor must expose the E-Verify case state, or we cannot enforce the bar on adverse action.
- **The declining seasonal trend is not a blocker.** D-021, Nishant's call, which closes Q-022 after nine days
  as a blocking question. Closed on judgement rather than on data, and the reversal condition is recorded.
- **Step 6 produces a score** off the interview the agent conducted. A human still decides. D-016. This makes
  us a regulated automated employment decision tool, which brings a bias audit, published summary, candidate
  notice and an ADA alternative path.
- **We never perform background checks.** We order them, track them and run the adverse action sequence. D-014.
- **Success is time to hire and number of hires.** Quality of hire dropped. D-017.
- **Better means both** self-serve configuration, which Paradox customers cannot do, and real connectors, which
  Fountain does not ship.
- **Attract as a category is still out.** D-009. But step 1, application capture, is now firmly IN. Under
  D-020 we do not own the intake, we connect to it: applications arrive through a connector from the job
  portals and the retailer's own careers site. Capture is not attract and the earlier exclusion of step 1 is
  dead either way.
- **Management roles remain a non-goal for v1.** D-010. **Nothing from NuAnchor transfers.** D-011. Unifi is
  a different matter since 18 Aug: it was an overlay on Avature, which is the shape D-020 has now chosen, so
  the architecture is a precedent rather than a contrast. What still does not transfer is the domain, the
  geography and the compliance regime.
- **A demo for Nishant comes before the product.** D-018, 17 Aug. Every external system is simulated in it.
  Pricing is deferred, and the demo shows no pricing and frames nothing per hire. We never replace payroll,
  workforce management or point of sale; the integrate-versus-export choice per system is deferred to S1.

### The three answers that are recorded but still weak

Written here because they will otherwise look settled.

- **There is no primary user.** Question 2 was answered as hiring managers, store managers and anyone involved.
  The test still to apply: whose week gets measurably worse if this disappears on Monday.
- **Nobody knows what the user stops doing.** Question 4 answers what it replaces for the company, a complete
  candidate database. That sentence is the demo and we do not have it.
- **The buyer is "top management".** Not one person, and a chief HR officer, a chief operating officer and a
  chief financial officer each buy a different pitch.

### The premise problem: CLOSED 14 Aug 2026

Do not reopen this. Suniras closed it twice and it is recorded as D-012.

The short version of what it was. Research on 9 Aug found central talent acquisition and store managers
describing different problems, with store managers pointing at payroll hours and pay rather than hiring speed.
That sat at the centre of this file for five days.

**It is retired.** The evidence behind it was public employee reviews, the CEO has mandated the problem, and
the argument had become unfalsifiable without practitioner access. We are building.

The cost is written into D-012 rather than forgotten, and it converts into one design requirement that must
survive into the PRD: **v1 instruments the funnel it touches.** Time per step, drop-off per step, who acted
and when. That is how this project gets the baseline no public source contains.

### The single sharpest observation in the project

Suniras's, on 9 Aug. Aviation concentrates half its recruiting in twenty of two hundred stations, so a central
team can own it. US retail spreads volume roughly evenly across hundreds of stores.

So a store manager has authority over how their store hires but too little volume for a tool to be worth their
attention, while central talent acquisition has the volume but no authority over what a store does day to day.
Nobody holds both.

That may be the reason the store manager is the real adopter, rather than a separate fact. Q-027 asks whether
a level exists in between and is partly answered: a level exists but splits into a district manager who owns
the payroll budget and a field HR partner who runs hourly hiring, so neither holds both.

**This is now the live design problem rather than a research question.** Under D-020 we do not hold the
record, so the data sits wherever the retailer's own system already keeps it, usually with central talent
acquisition. The funnel map says seventeen of nineteen steps are waits and handoffs, which is what a store
manager experiences. So the person who owns the data and the person who feels the pain are still two different
people, and the connector reversal does not fix that. The unnamed primary user in v1-slice.md question 2 is
exactly this unresolved split.

### What to do next

Full list in TODO.md.

**The Target conversation is not happening.** Nishant could not arrange it, confirmed 24 Aug. That route was
carrying seven facts nothing published answers, and losing it is the most consequential thing to happen since
the meeting. shared/QUESTIONS-FOR-TARGET.md keeps its value only if a different practitioner is found, and the
options are written out in 03-discovery/practitioner-routes.md.

**Research is finished.** Four runs. The fourth went specifically after the questions the Target conversation
was meant to close. Nishant's time box put the research lock at 21 or 24 August and it is met.

1. **The two sentences Suniras owes are now the binding constraint,** not a loose end. Who the primary user is,
   and what that person stops doing on a Monday. Outstanding since 16 Aug. The tier ranking, the pricing
   question, the demo's opening screen and Q-027 all resolve differently depending on the answer, and no
   further research produces it.
2. **The tier 1 ranking.** 05-strategy/first-30-days.md proposes steps 5, 8 and 16, with the counter-argument
   written next to it. Claude proposes, Suniras decides.
3. **Practitioner access, or a decision to go without.** Q-001, open since 9 Aug and now the oldest unmanaged
   risk. The untried route is former employees rather than current ones, because a current employee cannot
   discuss internal process with an outside vendor. Going without is legitimate as long as it is chosen, and it
   has three consequences that are written down.
4. **Then wireframes for the tier 1 slice, then acceptance criteria.** The demo already jumped ahead of
   Nishant's stated order, so what is missing is not a screen. It is the acceptance criteria for the three
   tier 1 steps, and those are Suniras's to draft.
5. **Deferred on purpose:** pricing (Q-030), build order, and every integrate-versus-export choice. Each
   reopens at S1 or at the first commercial conversation. Q-032 mostly dissolved under D-020 and Q-033 is
   answered by D-022.

**The measurement problem, which still shapes everything.** Two independent attempts failed to find traceable
step-level timing for US frontline retail hiring. So D-012 stands: v1 instruments the funnel it touches, and
the first deployment produces the baseline no public source contains.

**Still blocked on practitioners:** any metric with a real baseline. Q-001, still no date against it, and it is
the biggest unmanaged risk in the project. The fourteen questions to ask are written and waiting in
03-discovery/practitioner-questions.md.

---

## Where CLAUDE.md needs updating

Flagged for Suniras, not changed unilaterally.

| CLAUDE.md says | Status |
|---|---|
| "Peak-season surge is a core driver" | **Under question.** NRF: 438,000 seasonal retail hires in 2024, forecast 265,000 to 365,000 for 2025, while holiday sales passed a trillion dollars. Not a straight decline, since it rose in 2023. The 2026 forecast, usually September or October, decides. D-006, Q-022 |
| Fountain is "recognised in the 2026 Gartner MQ" | True but incomplete. It is a **Niche Player** placement, first-ever inclusion, lowest of four quadrants |
| Unifi is "deployed, live" with "70k+ annual hires" | Live confirmed by Suniras. The volume figure is unreconciled: internal notes say 30,000 offers a year. The case study slide is not a source, per Q-015 |
| Unifi is the customer | The contract is with **TalentOS**. Unifi, ERMC and Prospect are covered by it. D-004 |
| Implies competing with Fountain as an ATS | **Wrong shape.** Fountain's hiring ATS is 108 of 575 published endpoints. The post-hire half is four times larger |

---

## Who's who

### Client side, Unifi and TalentOS

- **Akshay Loomba**, akshay.loomba@unifiservice.com. Primary contact. Heads TalentOS, the recruitment arm
  being spun out of Unifi, which intends to resell the solution.
- **Gautam Thakkar**. Executive sponsor, CEO.
- **Srinivasulu Mallampooty (Srini)**, srini@abrightlab.com. CEO of Abrightlabs, CTO for the Argenbright
  Group. Recorded in the sales handover as the internal champion, and as the reason the deal was won.
- **Thomas Russo**, thomas.russo@unifiservice.com. Owned the Avature integration endpoints.
- **Jennifer**. Ran client-side testing of the voice agent and wrote the feedback log.

### Nurix side

- **Nishant Yadav**. Owns NuAnchor and NuAisle. The person this project reports to. Not on Unifi.
- **Liton Das**. Account executive on Unifi.
- **Taruna Uppala**. Technical programme manager on Unifi.
- **Abhishek Jain**. Solutions lead on Unifi.
- **Aman**. Engineering lead.
- **Stephanie Johnson**. Wrote the June 2025 legal memo on voice AI in recruitment.
- **Anuj Modi**. Named in the compliance sheet as the person to consult on Colorado obligations. **Not the
  same person as Anuj Jain below.**
- **Anuj Jain**. Product lead at NuPlay. Was in the USA a couple of months before 25 Aug 2026 meeting clients,
  and wrote the retail frontline PRD in retail-hiring-agent-main/ off the back of it. Assessed in
  02-landscape/anuj-prd-assessment.md. He is the live practitioner route, Q-036, because he is one hop from
  people who actually hire.
- **Joy**. NuPlay colleague with hands-on experience of staffing software. His input is platform and feature
  oriented and it describes a sourcing and matching product, which is out of scope by D-024. He asked us twice
  to look at contingent hiring, which is Q-034.

### Companies

- **Unifi Service.** Aviation ground handling. 42,000 to 45,000 employees, about $1.2B revenue.
- **TalentOS.** Signed the contract. Intends to resell.
- **ERMC** and **Prospect.** Unifi subsidiaries on the same contract, differing only on pay packages.
- **Abrightlabs**, **Argenbright Group.** Srini's companies.
- **Avature.** The applicant tracking system Unifi runs, two instances.
- **Fountain.** The independent leader. Legal entity OnboardIQ, Inc. Founded 2014, about $219M raised.
  Gartner placed it as a Niche Player in 2026, lowest of four quadrants.
- **Paradox.** Founded around 2016, Scottsdale. **Owned by Workday since 2025.** Announced 21 Aug 2025,
  expected close by 31 Oct 2025. Its own website still describes the relationship as a partnership. Q-029.
  **Price confirmed 25 Aug 2026: $1.1 billion, $1.0 billion of it cash**, from Workday's 10-Q for the quarter ended 31 Oct 2025. Completion announced 1 Oct 2025. Goodwill is $781M of a $1,063M allocation against $253M of identifiable intangibles, so Workday paid for the frontline position rather than the codebase. It also already held a $20M stake.
- **Workday.** Now owns the system of record and the conversational frontline layer on top of it. Also
  acquired HiredScore. This is the shape of the competition, not Paradox as a standalone.

---

## Words used in this project

- **ATS.** Applicant tracking system. The software a company runs hiring in. The system of record.
- **AEDT.** Automated employment decision tool. New York City's legal term for hiring software.
- **Adverse impact.** When a tool rejects one protected group at a much higher rate than another. Illegal in
  the US regardless of intent.
- **Disposition.** The outcome recorded against a call. At Unifi, Pass or In-Review.
- **Phrase bank.** A client-supplied list of approved positive and negative phrases the agent matches answers
  against. The mechanism that keeps judgement out of the AI.
- **HITL.** Human in the loop.
- **SOP.** Standard operating procedure. The written rules the agent follows.
- **Requisition.** One open job.
- **Station.** An airport location. Unifi's equivalent of a store.
- **Time-to-fill, day-one show rate, 90-day retention.** The three metrics a buyer actually cares about.
- **Feature metric versus business metric.** "Screening takes three minutes" describes the product. "Roles
  fill four days faster" describes what changed for the customer.
- **Assortment planning.** What NuAnchor does. Nothing to do with hiring.

---

## Facts worth carrying

Detail and sources in EVIDENCE.md.

- **NuAnchor is retail buying software, not hiring software.** NuAisle is an app store at apps.nuplay.ai.
- **Nurix has shipped a real US frontline hiring voice agent**, live, integrated with Avature, with a worked
  legal framework and client testing behind it. Three behavioural questions producing Pass or In-Review. The
  agent can pass a candidate forward but never reject one.
- **The Unifi design deliberately keeps AI out of the judgement.** Hard yes/no rules for eligibility, a
  client-owned phrase bank for open answers, a human deciding every flagged case. It survived a client's legal
  review.
- **Fountain already ships agentic screening.** Cue launched April 2026. Any strategy amounting to catching up
  is a losing one.
- **The category is consolidating into the system of record.** Workday bought Paradox in 2025 and HiredScore
  before it. So the frontline conversational layer now belongs to the applicant tracking incumbent. This
  closes the partner-embed-into-Workday route that a teardown in the repo recommends. Any surviving
  partner-embed play points at SAP SuccessFactors, Indeed or iCIMS instead.
- **Neither leader claims tenure or quality of hire.** Every claim in the category is time-to-hire. Found
  independently by two unrelated research methods, which makes it the best-supported finding here. Unclaimed
  because it is hard to prove, so it is an opening and a trap at once.
- **Neither leader names its model vendor** anywhere a buyer or candidate can see. Both license through AWS
  Bedrock.
- **Both leaders are already building the retention half** and neither markets it. That is our activate stage.
- **Two independent attempts have failed to find how long any stage of US frontline retail hiring takes.** 9 Aug
  broad search, 14 Aug strict-sourcing run. Not proof of absence, since the angle built to hunt it died before
  reporting, but enough to stop searching. The route is a practitioner, or a deployment that measures itself. See
  01-diagnosis/research-2026-08-14.md.
- **Improving retention shrinks hiring volume.** Derenoncourt and Weil, NBER w32546, 18 million hourly workers
  at five large US retailers. Headcount rose, new hires fell, coefficients significant at 1%. So any price or
  business case built on hire volume works against us. Q-030.
- **The buyer may hold no baseline.** Walmart's FY2026 10-K discloses no turnover figure at all. Costco's 94%
  retention excludes anyone with under a year of service, which is where the churn is. If v1 promises anything
  about retention, we may have to establish the baseline ourselves.

---

## Unresolved conflicts

- **Who the primary user is.** The one that is still genuinely open. Three candidates from three sources. Anuj
  says store manager. Our own Q-027 work says the payroll constraint sits with the district manager and the
  process with field HR. Joy's material implies a recruiter or a sourcing team. **Q-027 closed 26 Aug with the
  answer no**: there is no single level where hiring volume and hiring authority both sit, so this cannot be
  resolved by finding the right layer of the org chart. Q-027 carries a table mapping the three candidates
  against Suniras's three objectives. The choice is his.
- **The stated objectives and the recorded success metrics are not the same. NEW 26 Aug.** D-017 says time to
  hire and number of hires. Suniras's objectives on 26 Aug are time to hire, **number of people involved**, and
  **least manual work**. Number of hires is absent from his list. Two of his three are absent from D-017.
  Number of people involved is the handoff count, which four research runs could not answer.
- **Does job board distribution reopen D-009. NEW 26 Aug.** Suniras says a thin funnel makes job board
  integration desirable, and that it was a major point at the end of the meeting. D-009 made attract a non-goal.
  Q-041 sets out why it contradicts D-009's headline but passes D-009's actual reasoning, and why half of it was
  already in scope under D-020.
- **Does Anuj's PRD reach close, or stop at offer acceptance.** Nishant says close. The sixteen documents say
  offer acceptance. Per D-003 the documents win, so the assessment stands, but the gap itself is worth knowing
  about. Q-038.
- **The rehire population is a meaningful minority, not a core flow. SETTLED 26 Aug.** Census QWI puts retail
  recall at 8.9% of hires in 2024, below the all-private 12.7%, with no Q4 spike. The one peer-reviewed retail
  study says 4% and that rehires turn over **more** than external hires. Macy's says 33% for one holiday season.
  So the value argument for fast rehire survives and the quality argument is dead. Claude's 19% grocery figure
  was a vendor blog and is withdrawn. E-093 to E-099.
- **RESOLVED 26 Aug, kept visible.** "Too many applications or too few" was recorded here as the sharpest
  conflict in the project. It was not a conflict. Anuj's claim was about manager capacity, not application
  volume, and reading it as a volume claim was my error. See the correction in Q-035. And rehire is no longer a
  conflict either: Suniras reframed it from a compliance guard into a speed feature, Q-037.
- **Unifi volume.** 70,000 hires on the case study slide against 30,000 offers in the internal notes.
- **Chipotle.** Workday's acquisition release credits Paradox with cutting Chipotle time-to-hire 75%, from 12
  days to 4. Separate research reported Chipotle turnover rose in 2025, the first full year the tool was live.
  Together they are the sharpest available test of the time-to-hire versus tenure finding. **The endpoints are
  settled as of 26 Aug: application to first day worked, confirmed independently by Workday's customer story and
  Paradox's own case study, which says "apron on". The 75% is arithmetically inconsistent with 12 to 4, which is
  66.7%. And Chipotle's own release states the figure as an expectation, not a result.** E-110 to E-112. The
  turnover half still needs checking.

## Withdrawn claims, kept visible

- Fountain resells its AI recruiter from another company. Not supported.
- Fountain's workflow engine is linear and per-opening, and its pricing meters applicants and locations.
  Review-sourced, and both competitors have no public issue tracker, so that route is capped at tentative.
- Attract-enablement has "the same shape as NuAnchor." Withdrawn 9 Aug. That resemblance was an artefact of my
  own phrasing, and the shape describes every planning tool ever built. See D-008.
- Fair workweek enforcement is "the what changed answer this project has been missing." **Weakened 14 Aug.** The
  settlements are real. The link from schedule stability to retention is a null in the one US retail randomised
  trial that tested it, and Seattle's own evaluation of its scheduling law found no effect on quits or tenure.
  Keep the question, do not let it carry weight. Q-024.
- About twenty further claims were killed by adversarial audit on 14 Aug, including several a reasonable person
  would repeat. They are listed in section D2 of 01-diagnosis/research-inputs.md.

---

## How to keep this file useful

At the end of a session update: where we are, the cast, any new term, anything contradicting CLAUDE.md, and
any new withdrawn claim. Keep it under roughly 250 lines.

Decisions go in DECISIONS.md with reasoning. Open questions go in OPEN-QUESTIONS.md with an owner. This file
is state, not argument.

**Never write credentials into any repo file.** The Unifi archive contains a sandbox API key at
00-context/unifi/Unifi - Abrightlabs 10.40.18/Docs Shared by Client/. It has not been opened and its contents
are recorded nowhere.
