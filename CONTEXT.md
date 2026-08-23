# Project context

**Internal only. Contains client names and contact details. Do not copy any of this into
customer-facing material.**

Last updated 18 Aug 2026, after the second meeting with Nishant.

## If you are a new session, read this first

CLAUDE.md holds the rules and the plan. Suniras wrote it and it rarely changes.

This file holds the current state. Read it, then OPEN-QUESTIONS.md, then TODO.md. That is enough to pick up
work.

**This file never overrides CLAUDE.md.** Where they disagree, CLAUDE.md wins and the disagreement is flagged
below so Suniras can decide.

**Reading order for the full picture:**

1. CONTEXT.md, this file. State.
2. TODO.md. What Suniras owes, and what is waiting on a person.
3. DECISIONS.md. Twenty-two decisions, each with a reason and a reversal condition. Newest first. D-013 to
   D-017 are from 16 Aug and they define the product. D-018 and D-019 are the demo. **D-020 to D-022 are from
   the second meeting with Nishant on 18 Aug, and D-020 reverses D-015, so read it before anything else.**
4. 05-strategy/v1-slice.md. The seven scope questions, Suniras's answers, and my challenges kept separate.
5. 05-strategy/automation-breakdown.md. All twenty steps sorted into deterministic, AI, human-required and
   fixed-clock.
6. OPEN-QUESTIONS.md. Thirty-three questions with owners. Many are answered or closed, kept as record.
7. EVIDENCE.md. Every claim with its tier, plus a list of circulating numbers that must not be used.
8. 01-diagnosis/funnel-map.md. The twenty steps from application to day 90, filled in, with a read-back
   counting what the answers add up to.
9. 01-diagnosis/compliance-steps-explained.md. What the background check, the I-9 and E-Verify actually are.
10. 02-landscape/gap-claims.md. Competitor weaknesses with an evidence tier on each.
11. 01-diagnosis/research-2026-08-14.md. The last research run. One angle of six survived, audited hard.
12. 03-discovery/practitioner-questions.md. The fourteen questions desk research cannot answer.
13. 06-validation/demo/. The working demo. Double-click index.html. Its README explains what is real,
    what is invented and what is simulated.
14. 06-validation/DEMO-SCRIPT.docx. Twelve scenes, the narration written out to read aloud.
15. meeting-2-todo.md. What the second meeting asked for and how I read a garbled transcript.
16. 05-strategy/connector-map.md. Which of the twenty steps need a system and which are just email and phone.
    This answers the most concrete question Nishant asked.
17. 05-strategy/exception-register.md. The edge-case laundry list he asked for.
18. QUESTIONS-FOR-TARGET.md. Send-able questions for his Target colleagues.
15. STATUS-FOR-NISHANT.md. **Version 2, 18 Aug, and it is current.** Leads with the demo, records the seven
    decisions that define the product, and states the three weak answers plainly. v1 went to Nishant on
    11 Aug and got no reply. v2 has not been sent yet.

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

**Nishant has v1 of the status doc and has not replied.** v2 was written on 18 Aug and is ready to send. It
leads with the demo rather than with what is missing, because that changed. Suniras is working alone and
nothing on the current list is blocked on Nishant. The two MEETING- files are stale prep material.

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
- **Attract as a category is still out.** D-009. But step 1, application capture, is now firmly IN, because
  being the system of record means owning the intake. Capture is not attract and the earlier exclusion of step
  1 is dead.
- **Management roles remain a non-goal for v1.** D-010. **Nothing from NuAnchor transfers.** D-011. And nothing
  architectural from Unifi transfers either, since Unifi was an overlay on Avature and we have chosen the
  opposite shape.
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

**This is now the live design problem rather than a research question.** D-015 makes us the system of record
for every applicant, which means central talent acquisition is where the data sits, while the funnel map says
seventeen of nineteen steps are waits and handoffs, which is what a store manager experiences. The unnamed
primary user in v1-slice.md question 2 is exactly this unresolved split.

### What to do next

Full list in TODO.md. The near-term goal is the demo, per D-018.

**The second meeting happened on 18 Aug and reset the near-term plan.** Nishant set a time box: three to four
days to lock the research, then wireframes, then build. Research locked by Friday 21 or Monday 24 August.

1. **Nishant is asking his Target colleagues** in the next two or three days. QUESTIONS-FOR-TARGET.md is written
   and ready to send him. That is the highest-value thing outstanding, because two research runs have already
   failed to find the funnel timing anywhere public.
2. **Research he asked for is running:** size of the prize, how many teams touch one hire, the outsourcing share,
   and whether a compliance vendor exposes the E-Verify case state.
3. **Then the needle-mover ranking.** He asked which of the twenty steps to solve first in the first 30 to 60
   days. Claude proposes, Suniras decides.
4. **Still owed by Suniras, unchanged by this meeting:** the primary user, and what that person stops doing on a
   Monday. Those two sentences have been outstanding since 16 Aug.
3. **Deferred on purpose by D-018:** pricing (Q-030), the do-not-hire export (Q-032), E-Verify posture (Q-033),
   build order, and every integrate-versus-export choice. Each reopens at S1 or at the first commercial
   conversation.
4. **Not deferred: practitioner access.** Q-001, still the biggest unmanaged risk. The demo is also the best
   door-opener this project has had.

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
- **Anuj Modi**. Named in the compliance sheet as the person to consult on Colorado obligations.

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

- **Unifi volume.** 70,000 hires on the case study slide against 30,000 offers in the internal notes.
- **Chipotle.** Workday's acquisition release credits Paradox with cutting Chipotle time-to-hire 75%, from 12
  days to 4. Separate research reported Chipotle turnover rose in 2025, the first full year the tool was live.
  Both need checking, and together they are the sharpest available test of the time-to-hire versus tenure
  finding.

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
