# Open questions

Everything we don't know, who can answer it, and whether it stops us moving forward.

Every question needs a person's name against it. A question with no name never gets answered. "Someone should
look into this" is how a question survives all the way into the PRD.

**Structure.** Open questions first, then everything answered, closed or deferred at the bottom as a record.
Question numbers never change, so a reference written in another document keeps working. Restructured 11 Aug
2026.

Three levels for the open ones:

- **Blocking.** We cannot finish a phase until this is answered.
- **Shapes the build.** We can keep going, but answering it late means having built the wrong thing.
- **Track.** Worth knowing. Safe to carry for a while.

**Index, updated 18 Aug 2026 after meeting 2.**
Open and blocking: Q-027, Q-030.
Open and shaping: Q-032 (mostly dissolved), Q-012, Q-001, Q-025, Q-024, Q-023, Q-026, Q-028.
Closed or answered: Q-002 to Q-011, Q-013 to Q-022, Q-029, Q-031, Q-033.

---

# OPEN

## Blocking

### Q-027. Is there an organisational level between store manager and central TA where volume and authority both exist? PARTIALLY ANSWERED 11 Aug 2026

**Answer so far: a level exists, but it is split into two roles and neither holds both on its own.** Written up
in 04-segmentation/field-structure.md. Tentative sourcing, see the caveat at the top of that file.

**District manager.** Operations. Kohl's says 15 to 20 stores. Accountable for "driving sales, profit and
productivity while meeting payroll, expense and shortage goals." So this role **owns the payroll budget**,
which is the constraint store managers name. On hiring they hire store managers and only assist with hourly
hiring.

**Field HR business partner.** Titles vary, and Walmart appears to use Market HR Manager. Covers a group of
stores, is the primary HR contact for them, and supports hiring and onboarding of hourly associates in
partnership with talent acquisition and retail operations. Also partners on scheduling, workforce planning and
seasonal staffing.

**Why the split matters.** The person who owns the constraint is not the person who owns the process. A hiring
product would sit with field HR while the thing limiting hiring sits with the district manager.

And the district manager's stated measures are sales, profit, productivity, payroll and shrink. Hiring appears
there as a cost line. A product that fills roles faster does not obviously improve anything this person is paid
on. That is my inference rather than a sourced claim, and if it holds it is a sharper version of the adoption
risk than the store-manager version, because it means the operations chain has a reason to be indifferent
rather than merely being busy.

**Still unknown, and the first two are the ones that decide it:**

- How many stores a field HR business partner actually covers. Nothing found. This number decides whether the
  volume is enough for a tool to be worth using.
- What field HR is measured on. Not established anywhere.
- Whether either role holds budget, as opposed to process ownership or influence.
- **Whether mid-market retailers have this level at all.** Everything found describes large chains. A
  400-store retailer may run three regions with no field HR function. Since NuAisle does not sell to big-box,
  the whole finding may describe a structure our actual customer does not have.

**To firm it up:** read the careers pages and 10-K filings of three or four named mid-market US retailers
directly and count what field roles exist and what they own. Several fetches failed on network errors during
this pass, so the primary sourcing is thinner than it should be.

### Q-022. Is the seasonal surge shrinking, and if so does that kill or move the opportunity? CLOSED 18 Aug 2026

**Closed by Nishant in the second meeting, on judgement rather than on data.** Recorded as D-021.

He said the decline does not affect us, and gave two causes: economic pressure, with the same staff asked to
manage more, and tighter rules on hiring and firing inside a three-month window, so retailers hire fewer and pay
overtime to existing staff instead. Both are about how retailers respond to cost and regulation, not about
wanting the capability less.

His value proposition: the platform helps a large retailer hire four thousand people in ninety days with seamless
transitions between steps, and handles the scale, volume and handoffs whatever the absolute number is.

**Honest about what this closure is.** It is a decision, not a finding. The underlying numbers still stand and
the 2026 forecast could still make this a trend rather than a soft patch. Reversal condition is in D-021. The
original reasoning is kept below.

**Original question, kept as record.**

**Needed for:** Phase 1 scope, then Phase 5.
**Owner:** Suniras.

NRF primary data: 442,000 seasonal retail hires in 2024, forecast 265,000 to 365,000 for 2025, while
holiday sales crossed a trillion dollars for the first time. Press coverage called it the lowest
seasonal hiring in at least 15 years.

CLAUDE.md says peak-season surge is a core driver of this product. The most recent data says that surge
is contracting.

Two readings, leading to different products:

1. Retailers need fewer seasonal staff, so a product for hiring seasonal cohorts faster is aimed at a
   shrinking market.
2. Retailers are avoiding seasonal hiring because it is painful and expensive, and squeezing existing
   staff instead. The pain moved rather than disappeared, from hiring more people to keeping and
   deploying the ones they have.

**Why it blocks.** This decides what Phase 1 investigates. Getting it wrong means diagnosing a problem
that is going away.

**How to answer it:** the 2026 NRF forecast when it publishes, usually September or October. Retail
earnings calls discussing labour. And a practitioner, which loops back to Q-001.

---

## Shapes the build

### Q-032. What must come over from the old applicant tracking system? MOSTLY DISSOLVED 18 Aug 2026

**D-020 removes most of this question.** As a connector we do not ask anybody to leave their applicant tracking
system, so there is no cutover and nothing to migrate. The export problem that made this blocking on 16 Aug is
gone.

**One part survives, and it is the part that always mattered.** The do-not-hire list. A connector still has to
read it, because the whole point of that list is catching a NEW application, and Nishant confirmed in the second
meeting that this belongs in an exception-handling bucket with a central candidate database behind it. Reading a
flag through a connector is a much smaller ask than exporting a candidate history, so the question shrinks from
"can they export everything" to "can we read the rehire flag".

Still worth asking a Target contact, and it is question 5 on the short list in QUESTIONS-FOR-TARGET.md.

**Original question, kept as record.**

**Was:** what can a retailer export from their existing system, treated as blocking every deal.

**Narrowed after Suniras challenged it:** we only take new applicants, so why care about the old system at all?

He is right about the deployment model, and it has a name. A **cutover**: the old system goes read-only and
keeps the history for its retention window, and we take every new applicant from a start date. Nothing migrates
on day one. That is a standard, sellable shape, and it dissolves most of the original question, including the
Workday approval-chain problem and the bulk-export unknowns.

**What it does not dissolve.** The do-not-hire and not-eligible-for-rehire list exists to catch **new**
applicants. Somebody terminated for theft in 2024 applies again in 2027. To us they are a brand-new applicant.
Without the old system's flag we score them, pass them forward, and a store rehires them. Frontline retail runs
on repeat and returning applicants, so this is not a corner case. That one list must be imported, and whether it
is exportable was verified for zero vendors.

Second remainder: the transition year's EEO-1 and, for federal contractors, applicant flow reporting spans both
systems. Who stitches that year is a services question rather than a product question, but it will be asked in
every deal.

So the question shrinks to two things: can the do-not-hire list be exported from each major vendor, and who
stitches the transition-year reporting. A vendor sales engineer can answer the first in one call.

**For the demo: irrelevant.** Though seeded data could include a returning applicant caught by an imported
flag. That would be a strong scene.

### Q-030. Does our pricing model survive succeeding? RAISED 14 Aug 2026

**Needed for:** Phase 5, and it affects Phase 7 because a metric tree built on hire volume would be wrong.
**Owner:** Suniras.

Retention improving reduces hiring volume. That is not a hypothesis, it is the cleanest finding in the 14 Aug
research.

Derenoncourt and Weil, NBER w32546, looked at 20 voluntary wage-floor events at five US retailers each employing
over 150,000 people, using credit bureau payroll data on about 18 million hourly workers between 2014 and 2023.
Total headcount rose, 1.25% across all events and 4.62% at the $15 events. Year-on-year growth in new hires
**fell**, with coefficients of -0.860, -0.798 and -1.123, all significant at 1%. Headcount up, gross hiring down,
because fewer people left.

**Why this is our problem and not an academic one.** If we price per hire, per requisition or per applicant, then
the better we work the less we earn, and the buyer notices that before we do. It also means a business case built
on hiring volume is built on a number our own product should shrink.

Both incumbents are enterprise-quote-only with no published pricing, verified across six or more probe points at
Fountain and nine at Paradox, so we cannot see how they handle this.

**ESCALATED 16 Aug 2026. This is now blocking, and it is no longer only about pricing.**

Question 5 of 05-strategy/v1-slice.md was answered with three metrics: time to hire, number of hires, and
quality of hire as the goal.

**Number of hires and quality of hire move in opposite directions.** That is exactly what the paper above
measures. Fewer people leave, so fewer people need hiring. If the product succeeds at the stated goal, one of
its own stated success metrics gets worse, and the customer sees that in a renewal conversation holding a chart
showing they hired fewer people after buying us.

**The metric half is RESOLVED 16 Aug.** Quality of hire is dropped. Metrics are time to hire and number of
hires, recorded as D-017. Number of hires only conflicted with quality of hire, so removing one removes the
conflict.

**The pricing half is DEFERRED, 17 Aug 2026, by Suniras's call.** His reasoning: pricing can be changed later,
and the immediate goal is a demo for Nishant. Fair sequencing, and pricing genuinely is one of the more
reversible decisions.

Two guardrails that keep the deferral safe, both in D-018. The demo shows no pricing and frames nothing per
hire, because a shown price anchors and per-hire is the one model that fights our own product. And this
question reopens the day anyone drafts a commercial conversation, a pilot agreement included.

### Q-033. E-Verify: own it, embed a vendor, or leave it out? ANSWERED 18 Aug 2026

**Answer: embed a vendor.** Nishant, in the second meeting. Third-party tools already do the compliance checks,
and we connect to them rather than replacing them. He named a vendor which the transcript renders as "green light
or something like that", almost certainly GreenLight. Recorded as D-022.

This follows from D-020 rather than standing alone: once we are a connector layer, owning a direct DHS
relationship would be the only place in the product where we replaced something instead of connecting to it.

**One requirement survives and it is the important one.** Whichever vendor we embed has to expose the mismatch
state, or we cannot enforce the bar on adverse action, which is the single most distinctive thing in the demo.

**Original question, kept as record.**

**Needed for:** S1. Nothing in the demo depends on it, because the demo simulates it.
**Owner:** Suniras, with Aman on the build side.

Three postures.

**Own it.** Enrol with DHS as a web services employer agent. The technical specification is issued only after
enrolment, there is a certification test, and then a permanent obligation: six months to update every time DHS
ships a new version, with access denial as the stated penalty. Every retailer client also signs a DHS
memorandum as part of onboarding. Heavy, and it is permanent headcount.

**Embed a vendor.** LawLogix Guardian publishes an open API for a bidirectional I-9 and E-Verify integration
returning status, resolution code, next step and next step due date. That is exactly the state machine step 12
needs. Symmetry I-9 also has public docs, but its E-Verify handling is embedded interface rather than API.
Buying this means we never touch DHS directly.

**Leave it out.** Tempting, and it breaks the product claim twice. Florida mandates E-Verify for private
employers with 25 or more staff and Arizona mandates it for every employer, so any national retailer runs it,
and an onboard stage that skips it has a hole where a legal requirement sits. And the remote I-9 examination
procedure is lawful only for employers enrolled in E-Verify and in good standing, so excluding E-Verify also
forces every I-9 to be examined in person on day one.

My recommendation, labelled as mine: embed a vendor. Decide at S1.

For the demo: simulate the mismatch flow, and consider showing it. The product blocking a store from quietly
dropping a contested new hire is compliance depth neither incumbent shows anywhere.

### Q-012. Why has nobody fixed frontline hiring already?

**Needed for:** Phase 1.
**Owner:** Suniras.

This is not a gap in the material. It is the main question Phase 1 exists to answer. Fountain,
Paradox and others have had ten years and real money. Something structural is stopping this from
being fixed.

Logged now so we do not discover it late. The answer usually contains the opportunity.

### Q-001. Can we find five people who hire retail staff in the US and don't work at Nurix?

**Downgraded 9 Aug 2026 from blocking to shaping.** Suniras decided Phase 1 runs on second-hand
evidence, so this no longer stops Phase 1. See D-005 in DECISIONS.md.

It still blocks Phase 3, whose gate is exactly this, and it still means every Phase 1 claim carries the
assumption label rather than the verified one.

**Needed for:** end of Phase 3. Phase 1 now proceeds without it.
**Owner:** Suniras.
**Answer by:** no date set yet.

On 8 Aug 2026 Suniras said this is "maybe, unproven." It might happen through Nurix sales, LinkedIn,
or personal network, but nothing is arranged.

This is the biggest risk to the whole project. Without these conversations we cannot say we know
what the real problem is. We can only say we think we know. Phase 3 cannot pass as written.

**Who might help:** Nurix sales leadership, since they know which US retail companies are already in
conversation. Nishant Yadav for access to the companies NuAisle is approaching.

**If the answer is no:** Phase 1 runs on second-hand evidence instead. That means reviews of
Fountain and Paradox on G2 and Capterra, retail company earnings calls, US government data on staff
turnover, job adverts that hint at competitor roadmaps, and forums where recruiters talk. Every
claim after that gets labelled as an assumption, and the PRD says so plainly.

Decide this deliberately if it happens. Do not slide into it by default.

### Q-025. Where can we get real hiring funnel numbers?

**Owner:** Suniras.

Desk research produced plenty of funnel statistics and not one with a traceable source. They are listed
in section D of 01-diagnosis/research-inputs.md as numbers not to use.

Interview no-show rate, application completion rate, day-one no-show rate and 90-day retention are the
metrics this project needs baselines for. They have to come from a practitioner's own reporting or a
named study. There is no shortcut.

### Q-024. Does scheduling law enforcement make hiring speed newly expensive?

**Owner:** Suniras, then a practitioner.

A hypothesis, not a finding. Nobody in the sources connects these two things.

Fair workweek laws require posting schedules around 14 days ahead and paying a premium to change them
inside that window. Enforcement became expensive recently: Chipotle settled with New York City for $20
million covering about 13,000 workers, and Starbucks for about $39 million in December 2025 covering
more than 15,000.

If a retailer must commit to a schedule two weeks out and pay to change it, then an unfilled shift or a
no-show becomes a priced compliance event rather than an inconvenience. That would make hiring speed
newly expensive, in named cities, from a known date.

That is the shape of a "what changed" answer, which is what this project has been missing. It needs
someone who actually operates under one of these laws to confirm or kill it.

**Weakened 14 Aug 2026, and this matters.** The enforcement half stands. The settlements are real. But the link
from schedule stability to retention is a null in the only US retail experiment that tested it.

The Gap Inc. randomised trial, 28 stores across San Francisco and Chicago, Nov 2015 to Aug 2016, found overall
turnover and retention **unchanged.** Turnover fell among more experienced staff and average tenure at quitting
dropped 10.8 months from a 25.5-month base, which is a composition shift rather than an improvement. Separately,
Seattle's Secure Scheduling Ordinance evaluation found measurable gains in predictability and wellbeing and no
effect on turnover, quits or tenure. An auditor tested that negative specifically and it held.

What is left is observational panel data whose own abstract hedges to "these associations."

So this hypothesis is not dead, but it must not be load-bearing in any pitch. Detail in
01-diagnosis/research-2026-08-14.md.

### Q-023. Is the supervisor pipeline a real bottleneck on current data? PARTLY ANSWERED 9 Aug 2026

**Answer: no 2025 or 2026 retail turnover data found. The most recent is Nov 2023, and it points the
other way.**

Korn Ferry ran the same survey in Oct 2023, more than 100 US retailers, $500 million to $20 billion plus.
Headline: "Retail Revolving Door Slows as More Hourly Workers Stay Put." 30% of respondents said hourly
store turnover was down 10% or more year on year. It gives no breakdown by role, so there is no 2023
figure for assistant store managers.

Also in that survey: 33% of retailers had restricted hiring for new positions, double the 18% in 2022.

**So the picture is:** hourly turnover spiked in 2022, eased in 2023, and we have nothing after that.
The 29.2% assistant store manager figure that makes the supervisor hypothesis interesting is a
single-year 2022 data point with no follow-up.

The hypothesis is not dead. It is unsupported on current data, which is different. To carry it you need
either a newer survey from a named firm or a practitioner. See TODO.md item 3.

### Q-026. Which roles are in scope, and does the funnel differ enough per role to matter?

**Needed for:** Phase 1, then Phase 5 scope.
**Owner:** Suniras.

Raised by Suniras 9 Aug 2026: this is not only hourly shop floor staff. It includes store managers,
floor managers, and other roles.

CLAUDE.md already lists associates, floor managers, store managers and operations managers, and notes
they have different requirements, different hiring owners and different lifecycles. So the scope was
always multi-role. What has not been done is working out whether the funnels differ enough that one
product cannot serve them.

Some reasons to think they do differ:

- An hourly associate is hired in days, often by a store manager, at high volume, with the main losses
  at application completion and day-one attendance.
- A store manager is hired over weeks, by a district or regional manager, at low volume, with real
  interviewing and reference checking, and the main loss being a bad hire rather than a slow one.
- Korn Ferry's 2022 data shows the two behave differently once hired: 75.8% turnover for hourly
  in-store against 17.7% for store managers.

A product that screens for safety and reliability at volume is not the same product as one that
assesses whether someone can run a store. Deciding whether v1 serves one role or several is a Phase 5
call, but Phase 1 has to diagnose per role rather than treating "frontline hiring" as one funnel.

**Connects to:** Q-023, the supervisor pipeline question, which sits exactly at the boundary between
these two funnels.

---

## Track

### Q-029. Has Workday acquired Paradox, or not? ANSWERED 11 Aug 2026

**Yes. Workday owns Paradox.** Announced 21 August 2025 in Workday's own newsroom. Expected to close in
Workday's fiscal Q3 2026, the quarter ending 31 October 2025. Press reports put the price at about $1 billion
in cash, but **Workday did not disclose a price**, so treat that figure as a press report rather than a fact.

So my original web research was right and the technical teardown was wrong.

**Why the teardown got it wrong, which is worth understanding.** It scraped what Paradox publishes about
itself. Paradox's own Workday page still describes the relationship as a partnership, with no acquisition
language anywhere on it, nearly a year after the deal. The teardown saw every symptom of ownership, roughly 24
Workday legal entities listed as sub-processors, the Paradox careers site redirecting to workday.com, the
knowledge base written in Workday's partner format, and the ethical-AI page deferring to Workday's standards,
and read all of it as an unusually deep partnership.

A teardown of shipped technical artifacts cannot see a corporate event. Worth remembering before trusting any
single method again.

**What it changes, and this is the part that matters.**

The competitive map is not two independent specialists. It is Fountain, independent and placed as a Gartner
Niche Player, against Workday, which now owns both the system of record and the conversational frontline
layer on top of it.

It also kills the teardown's headline go-to-market recommendation. That recommendation was to copy Paradox's
approach and embed into Workday through certification. You cannot embed into Workday to compete with
Workday's own frontline hiring product. If partner-embed is still the right route, the remaining surfaces are
SAP SuccessFactors, Indeed and iCIMS.

Josh Bersin, quoted in HR Dive on 26 Aug 2025, on what the deal does: "This establishes Workday as a leader in
high-volume, front-line hiring, which covers 70% of the jobs in the world." Analyst opinion, not measured
market data.

Sources: [Workday newsroom, 21 Aug 2025](https://newsroom.workday.com/2025-08-21-Workday-Signs-Definitive-Agreement-to-Acquire-Paradox,-the-AI-Company-Redefining-the-Frontline-Candidate-Experience) and [HR Dive, 26 Aug 2025](https://www.hrdive.com/news/workday-pushes-ai-branding-in-strategic-paradox-acquisition/758574/).

### Q-028. What would a pilot have to prove, and can that be proved without hiring anyone?

**Needed for:** Phase 6. Logged now because the answer constrains Phase 5.
**Owner:** Suniras.

Suniras proposed a pilot: the client supplies candidates who have already applied, scattered across the US,
we run the product over all of them and show the results.

Problems with that design, recorded so the next version avoids them:

- **It tests the wrong risk.** Processing a batch tests whether the technology works, which Unifi already
  settled. It contains no store manager, so it tests nothing about adoption, which is the live risk.
- **Scattered is the expensive option.** NYC Local Law 144, Illinois, Colorado and California impose
  different obligations, so a scattered candidate set means operating under several regimes at once. The
  Unifi team considered skipping New York entirely for this reason.
- **Aged candidates are a different product.** Calling people who applied weeks ago is re-engagement, not
  screening, and response rates are worse. The pilot would underperform for reasons unrelated to the
  product.
- **It cannot generate the metrics that justify a purchase.** Time-to-fill, day-one show rate and 90-day
  retention all require someone actually being hired. A batch run produces throughput, which is a feature
  metric.

Suniras's own fallback, concentrating two or three high-volume metros, is the stronger design: enough volume
to be meaningful, fewer regulatory regimes, and a comparison group in the areas left untouched. A pilot
without a control is hard to argue from.

**Note on sequencing.** This is Phase 6 thinking during Phase 1. Kept because it surfaced a real Phase 4
question (Q-027), but the pilot design itself should be rebuilt after the diagnosis rather than before it.

---

# RESOLVED

Kept as a record rather than deleted. Several of these answers changed what other questions mean, and a few
were closed as a deliberate decision rather than because we found out. Numerical order.

### Q-031. Are we the system of record, or an overlay on top of it? ANSWERED 16 Aug, REVERSED 18 Aug 2026

> **The answer changed.** On 16 Aug this was answered as system of record (D-015). On 18 Aug Nishant accepted a
> connector architecture in the second meeting, so the answer is now **overlay**, recorded as D-020. The third
> option listed below, an overlay that owns the state of the steps nobody else does, is the shape we have landed
> on. Read D-020.

**Original answer, kept as record: we are the system of record. All applicants are fed to our system.** Suniras,
16 Aug. Recorded as D-015 with the full cost written next to it, including the rip-and-replace sale, the record-keeping
obligations, the migration of a retailer's applicant history, and the fact that it contradicts the overlay
architecture Nurix actually shipped at Unifi.

The question below is left as it was written, because the reasoning is what makes the decision reviewable.

**Blocks:** the schema, which means it blocks S1. Answer it before anyone draws a data model.
**Owner:** Suniras, with Aman.

D-013 commits us to a single place where everyone sees all twenty steps. That sounds like a system of record.
The applicant tracking system already is one. Both cannot be true without a fight we would lose.

**Why this is the most expensive question to get wrong.** Paradox solved it with a day-one schema decision.
Every entity across eight entity families carries dual identity, an internal object ID plus an external ID, and
on top sits a status-map triplet translating their stages into the customer's applicant tracking vocabulary.
That is what lets them deploy next to Workday or SAP instead of starting a replacement argument. The teardown
is explicit that retrofitting this later is expensive.

The teardown is also blunt that "Fountain is an ATS we can out-build" is the mistake most likely to cost us.

**The three possible answers, and none is obviously right.**

Overlay. We sync with the customer's applicant tracking system and never claim to replace it. Cheapest to sell,
hardest to make feel like one place, and it makes us dependent on integrations we do not control.

System of record. We replace it. Longest sales cycle in enterprise software, and it means competing with
Workday on its own ground.

Overlay that owns the steps nobody else does. The applicant tracking system stays the record for hire, and we
own the state of the waits and handoffs around it. This is the shape D-013 implies, and it still needs the dual
identity schema on day one.

Unifi is relevant here and does not settle it. Nurix integrated with Avature, two instances, so the precedent is
overlay. But Unifi is one aviation customer with a known system, not a product decision.

### Q-002. Does NuAisle sell to big retailers like Walmart, or not? ANSWERED 9 Aug 2026

**Answer from Suniras: no. NuAisle does not sell to big-box or mass retail.** The decks are right and
the demo narration is wrong.

**The consequence, which is now a constraint rather than a question.** High-volume frontline hiring
concentrates in exactly the segment NuAisle skips. Walmart, Target and Kroger are where hiring tens of
thousands of people a year happens. So one of two things has to be true, and Phase 4 has to say which:

1. The hiring product does not sit on the NuAisle shelf. It is a separate line with its own customer
   type.
2. It does sit on the shelf, and the target is mid-market retail. A few hundred stores rather than a few
   thousand, hiring thousands a year rather than tens of thousands.

Option 2 is the more likely reading given NuAisle's stated customer size, and it changes the product
substantially. A retailer with 400 stores has different problems from one with 4,000: less central
recruiting capacity, no dedicated hiring team per region, and the store manager doing more of the work
themselves. That last part makes the store manager even more clearly the adopter.

Not a decision yet. Phase 5 makes it. But the option space just narrowed.

### Q-003. Who is Unifi, which country, and under whose rules? ANSWERED 9 Aug 2026

**Answer.** Unifi Service. Aviation ground handling, 42,000 to 45,000 employees, about $1.2B revenue,
North America's largest aviation services provider. The deployment is US, across 200+ airport
stations. The rules mapped in the compliance spreadsheet are NYC Local Law 144, California FEHA
automated-decision rules, and Colorado SB 24-205.

The contract is actually with TalentOS, not Unifi. See D-004 in DECISIONS.md.

Source: the 47-file delivery archive. Kept here as a record rather than deleted, because the answer
changed what several other questions mean.

### Q-004. Does Unifi cover all of hiring, or only the first screening step? ANSWERED 9 Aug 2026

**Answer.** The first screening step only, and a narrow version of it: three behavioural questions on
safety, reliability and teamwork, 90 seconds each, producing Pass or In-Review.

So the case study slide's headline claim that Nurix "automated the entire hiring lifecycle" is wrong,
and the customer quote on the same slide is right. The April 2025 proposal was much wider (chat agent,
resume parsing, scheduling, onboarding, post-offer engagement), so the likely explanation is that the
headline describes the proposal and the quote describes what shipped.

**Consequence: do not use that headline anywhere.** It is contradicted by Nurix's own delivery
documents.

### Q-005. Is the autonomy setting real, and what does a customer actually control? ANSWERED 9 Aug 2026

**Answer: it is not a confidence dial. It is a set of hard limits the agent cannot cross.**

The product page states it plainly: "Limits you set: allowed factories, budget, minimum orders. The
agents can't cross them."

So autonomy is bounded by named constraints rather than a tolerance slider. Inside the limits the agent
can act, and when it does the action is logged. Priya's home screen shows "Agent handled: 2" with
"Approved Merino Base Layer Crew 15:42" and "Rejected Rain Shell Pant 11:08."

**Worth noticing for a hiring product.** Constraints are easier to defend to a regulator than a
confidence threshold, because a limit is auditable and a threshold is a judgement about the model. The
Unifi build reached the same conclusion by a different route: hard yes/no rules and a client-owned
phrase bank rather than model confidence.

### Q-006. Do the persona dashboards run off the same numbers? ANSWERED 9 Aug 2026

**Answer: yes. One shared calculation, several role-specific views.**

The screenshots settle it. There are six personas, not two: Priya Nair (merchandise planner), Maya, Sam,
Dana, Dev Patel (VP ops and sourcing), and Lena. The tooltip reads "Switch persona. The left nav
re-scopes to that role's workspaces and workflows."

The right rail carries identical figures on both Priya's and Dev's home screens: 84 decisions need a
planner, 1 sign-off pending, 26 styles rising, 14 styles below MOQ, and the same two agent-handled
actions with the same timestamps. Different navigation, same underlying numbers.

The work surfaces differ sharply by role. Priya has nine, including OTB Plan, Assortment, Buy Sheet,
Allocation, In-season, Tariff Watch and Learning Loop. Dev has two: Control Tower and Tariff Watch.

There is also an approval chain across personas. The buy sheet has a button reading "Submit 108 lines to
Maya."

**Why this matters here.** Role-differentiated views over one calculation is a real platform capability,
and the hiring analogue is direct: central recruiting and a store manager need very different views of
the same candidate decisions, and a store manager should see two things rather than ninety.

### Q-007. What is in the downloadable audit file? MOVED TO TODO 9 Aug 2026

Not visible in the screenshots. The screenshots do show the reasoning display, which was the related
question: a "Why" expander giving the signal detail ("search +84%/6wk, social 3.2x, sell-through 92%"),
and a note that "full reasoning for this step leads the page in the agent panel."

The audit export itself is still unseen. Moved to TODO.md item 7, low priority.

### Q-008. What does NuAnchor cost and how long does it take to set up? MOVED TO TODO 9 Aug 2026

Out of scope per Suniras. Moved to TODO.md item 6.

### Q-009. Where are pitch-kit.md and deck.html? ANSWERED 9 Aug 2026

**Answer: they are the same documents already in the NuAisle folder, under different names.** Nothing
is missing. Closed.

### Q-010. Which NuAnchor claims are approved for showing to customers? CLOSED 9 Aug 2026

Closed as not relevant. Suniras: "why are we worried about showing nuanchor to customers? lets focus
on the problem we want to solve."

Fair. NuAnchor is not this project's product and we are not selling it. If this project later produces
customer-facing material about its own product, the question returns in that form.

### Q-011. Is there any proof behind "gets better the more you use it"? ANSWERED 9 Aug 2026

**Answer: the mechanism is now specified, and there is a dedicated screen for it.**

The product page describes stage four as: "Read vs actual, every style scored once the season closes."
"The misses too, where the agents over-read or under-read, shown not hidden." "Next season, those
corrections carry into the next buy."

Priya's navigation includes a work surface called Learning Loop.

So it is a scoring-and-correction loop at season close, not continuous model retraining. Showing the
misses rather than hiding them is the more interesting half.

**Still not proven to work**, because by its nature it cannot be until a season closes. The pack's own
objection handling says this honestly: do not sell accuracy you can only prove a season later.

### Q-013. Did the Unifi agent actually go live, and when? ANSWERED 9 Aug 2026

**Answer from Suniras: yes, it went live.** The exact date is not recorded, but the project plan
scheduled go-live readiness for 26 to 30 Jan 2026, so that window is the best estimate.

**What this changes.** The Unifi work moves from "built and tested" to a live production deployment.
That is a materially stronger claim, and it makes the archive genuine delivery evidence rather than
project documentation.

CLAUDE.md was right to describe it as deployed and live. The correction flagged in CONTEXT.md is
withdrawn.

**Still not resolved by this:** the four numbers on the case study slide. Going live does not supply the
baselines behind "20% time reduction" or "500+ hours a month," and those measurements appear nowhere in
47 files. See Q-015 and Q-016.

### Q-014. Why is a sandbox API key in a project folder? CLOSED 9 Aug 2026

Closed. Suniras has no visibility on it and Unifi is not the focus. The file remains unopened and its
contents are not recorded anywhere in this repo.

### Q-015. Where does "70,000+ annual hires" come from? CLOSED 9 Aug 2026

Closed. Suniras: "you can ignore the case study for now, it might've been a sales inflated doc too.
for now just go based on the official docs that i've uploaded."

**Standing rule from this:** the Unifi case study slide is not a source. The delivery archive is. Where
they disagree, the archive wins.

### Q-016. What are the baselines behind the Unifi metrics? CLOSED 9 Aug 2026

Closed for the same reason as Q-015. The case study slide is not a source.

### Q-017. Can "100% regulatory compliance" be defended? DEFERRED 9 Aug 2026 on Suniras's call, see D-007

**Owner:** Suniras, then Anuj Modi.

The archive shows a real compliance framework, which is far more than the slide suggested. But the
compliance spreadsheet's own internal notes say ISO 42001 certification would be needed and is not
held, ask "how will we detect discrimination, will it be flagged by customer," and ask "who will do
this and when" about the impact assessment.

A framework with open items in it is not 100% compliance. The claim as written is not supportable.

### Q-018. Which security certifications does Nurix actually hold, today? DEFERRED 9 Aug 2026 on Suniras's call, see D-007

**Owner:** Suniras, then Aman.

Three documents say three different things. The vendor checklist says Nurix is ISO 27001 and SOC 2 Type
II certified. The statement of work says only "aligned to" those standards. The compliance sheet says
ISO 42001 would be needed and is not held.

A buyer's security team asks for the certificate, not the claim. Get the real answer before any of
this goes near a retail prospect.

### Q-019. Is the TalentOS channel still active? CLOSED 9 Aug 2026

Closed. Suniras: "how does this bother us?"

Fair question. The reason I raised it was that a partner who owns the customer relationship also owns
the learning, which would matter if this project went to market the same way. But that is a Phase 5
question about our own route to market, not something the Unifi arrangement decides. It will come back
in that form if it needs to.

### Q-020. Who measures adverse impact, us or the customer? DEFERRED 9 Aug 2026

Deferred, not closed. Suniras wants the problem statement settled first, which is a reasonable
sequencing argument.

It returns at Phase 7, because it is a requirement rather than a review item. See D-007.

### Q-021. Does the NuAnchor demo recording need re-recording? CLOSED 9 Aug 2026

Closed. It was recorded for internal use and does not go to prospects, so the inconsistencies do not
matter for this project.

**One rule survives from it, and Suniras stated it directly: trust the transcript, never the summary.**
Recorded in D-003.

The screenshots also settle two of the four inconsistencies. The product page says "getting data in: a
spreadsheet today, your systems next," so the narration's claim about sitting on existing ERP systems
was wrong and the product is honest about it. And Tariff Watch is a dedicated work surface, so tariffs
are prominent in the product even though the narration never mentioned them.

