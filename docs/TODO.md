# Suniras's to-do list

Created 9 Aug 2026, updated 2 Sep. Things only you can do. Everything here is either a decision that is
yours to make or an answer that has to come from a person.

Claude keeps this updated. If something moves to DECISIONS.md it comes off this list.

**The premise question is closed.** D-012, 14 Aug. We are building. The cost of closing it early is written
into that decision, and the mitigation is a design requirement rather than more research: v1 instruments the
funnel it touches.

## Two architecture audits landed, 2 Sep. One decision is yours, and it got cheaper

Two documents, same day. **08-architecture/hrx-reconciliation-2026-09-02.md** answered the question against the
hrX plan. **08-architecture/indigo-compatibility-2026-09-02b.md** answered it again against the IndiGo
`solutioning.md`, which is a shipped implementation rather than a proposal, so where the two disagree the second
is later and better grounded. The technical answers are in there. The half that is not mine is here.

**1. One product or two, and who staffs it. The second audit narrows this usefully.** The question is no longer
"do we fund a shared platform". It is **"do we fund a shared contract with two implementations"**, which is a
much smaller thing. Retail cannot become a second workflow on the IndiGo platform yet, for two structural
reasons rather than any matter of taste: zero of their nineteen entities carry a tenant, and their pipeline row
is minted at offer-accept, so our steps 1 to 6 have nowhere to exist. Both are fixable and neither is fixable by
us. Meanwhile convergence in our direction is about an order of magnitude cheaper: seven changes inside one
repository, six of which were already on our critical path, against seven changes across nineteen entities,
thirty-six controllers and an RBAC matrix on a team with two unclosed release gates.

So the recommendation is share the contract, not the runtime: take their ten workflow node types, their
versioned insert-only definitions and their per-application bindings, and keep our own engine. **What that
means commercially is still yours and Nishant's.** A shared contract is the cheap answer to the question D-028
already put on the record, that a per-account integrator is services revenue wearing product clothing and that
somebody will eventually ask which company this is.

**1b. And there is a cheap thing that proves the whole thesis, which Srikanth's team has explicitly asked for.**
Their roadmap says the second workflow type is the forcing function that proves their engine is genuinely
generic. Writing our twenty-step retail funnel as an `aocs-hire`-style definition in their ten node types is a
day of writing, no code either side. The first pass is already in section 5 of the second audit: nineteen of
twenty steps express cleanly, and the one that does not is **the adverse action bar**, because a prohibition on
an edge is not a gate on a path. That finding is worth more to their genericity claim than a month of
abstraction. **Worth offering him.**

**2. The strongest argument for merging is already yours, from five weeks ago.** D-028, 26 Aug: "The thing that
would make it compound is a normalisation layer underneath the bespoke adapters, so the second Workday customer
is cheap even though the first was not." That is the shared platform argument, reached from the retail side,
from a commercial premise, before hrX arrived.

**3. The overlap is narrower than either document suggests, and there are now three data points.** hrX runs
requisition to day ninety. We run application to day ninety. The genuinely shared span is offer through
joining, our steps 7 to 16. **The IndiGo SOP Srikanth actually shipped covers the same eight steps.** Three
builds, two countries, three buyers, same middle. Both ends of the funnel diverge by decision rather than by
accident, so the platform should be scoped to the middle.

**4. Consent and retention is a gap against our own PRD, not against hrX.** There is no consent table, no
retention field, no data class, and no deletion path anywhere in the demo. The PRD commits to California's four
year retention of inputs, to TCPA consent wording that may not carry from one job to another, and to honouring
Washington opt-outs inside ten business days. hrX's argument for doing this in phase zero is correct: adding it
later means reprocessing every record. **This one is mine to build, not yours to decide, but you should know it
is the largest gap in the product against its own PRD.**

**5. The voice claim needs settling before it reaches Nishant, and it is now in two places.** `demo/README.md`
and `connectors/index.js` both say Nurix has shipped a live voice screening agent on another build. IndiGo's
five voice agents are all notify, nudge, capture and confirm. If the claim means Unifi it may hold, but that
slide is on record here as self-contradictory. **Question 14 in the Srikanth list settles it.**

---

## The LinkedIn re-verification landed, 26 Aug. Five results

You asked for it to be checked independently and for alternatives. Eleven of twelve agents finished; the hiQ
verifier died to the machine sleeping, so that one section has had one pass not two and is labelled. Full
write-up in **01-diagnosis/verification-2026-08-26b.md**.

**1. The LinkedIn finding holds, from their own current page, and it understated the case.** Verbatim, updated 3
June 2026: "We are currently not accepting new partnerships for LinkedIn's Job Posting API." **Apply with
LinkedIn is also closed** and has been since September 2023. SNAP is closed. Referrals closed in 2018. Easy Apply
is deprecated. Talent Hub was retired. One correction against me: three self-serve things do exist, and none
solves the problem. **And no LinkedIn API of any kind takes a named person and returns their employer.**

**2. The important finding is not about LinkedIn.** Doing an employment lookup for an employer makes us a
**consumer reporting agency**. The FTC's own commentary: the same lookup is unregulated when the employer does it
and regulated when a vendor does it for them. No route was found that avoids FCRA. And **frontline hourly workers
are largely absent from the profile databases anyway**, so the data is not there for our population. None of
Fountain, Paradox, iCIMS, Greenhouse or SmartRecruiters does this; **Greenhouse's own FAQ rules third-party data
out.** The feature is out three times over. Q-042.

**3. My "buy the distribution layer" recommendation was premature, and this is better.** There is a **free,
unilateral tier**: Google for Jobs via schema.org plus free aggregator feeds to Adzuna, Jooble, Careerjet,
Talent.com, Jora and WhatJobs. **Zero cost, no contract, no approval, two to four developer weeks**, and a
truthful reach claim at the end of it. Then Indeed's Job Sync API, free in fees but a signed agreement and six
weeks, **now the only route to free organic Indeed placement since single-source feeds went sponsored-only on 31
March 2026.** Then JobTarget if a customer wants a destination count: revenue share to us, no fees, and **$5 per
posting** to the customer, which is one of only two published prices in the whole category. Q-041.

**4. Two corrections to DECISIONS.md.** D-016 listed Colorado as a live obligation. **Colorado has nothing in
force**; SB 26-189 lands 1 January 2027. And California's FEHA rules, in force since 1 October 2025, define an
automated decision system to include a tool that **merely facilitates** a human decision, so keeping a human in
the loop does not take us outside the definition there. They also require **four years of retention of inputs**.

**5. A concrete constraint on the five to six day target.** A criminal-only hourly background package returns in
24 to 48 hours. **Adding employment verification adds one to three days on top.** That is very likely why hourly
packages are criminal-only, and it means any design that adds verification spends the speed budget D-027 depends
on. Checkr charges $12.50 for a current-employer check; The Work Number is about $105 to $109 per match, three to
four times the whole hourly package.

---

## Read this before the PRD, 26 Aug

**Do not put 19% in the PRD.** It is a Ceridian/Dayforce marketing blog figure, 850,000 records volunteered by
its own clients through an optional feature, no sampling frame, no year, and grocery rather than retail. Claude
put it in front of you and withdrew it in the same session, so it is easy to have missed the retraction.

**Use 8.9% instead and it is a stronger sentence, not a weaker one.** US Census Quarterly Workforce Indicators,
retail recall hires, 2024. Government payroll data. Nobody can attack it. Two things to say yourself before
anyone says them to you: it is a lower bound because it only sees returns within four quarters, and **retail sits
below the all-private average of 12.7% with no Q4 spike**, so it cannot be used to imply seasonality.

The full comparison of the three available numbers, with what each can carry and how each gets attacked, is now
in section 3 of **05-strategy/problem-statement.md**. The short version: **a floor plus a range survives
questioning, a single percentage does not.** Roughly one in eleven by government data, undercounted, and one in
three at Macy's in a holiday season.

**And the more useful number is not a percentage at all.** The population you can serve fast is gated by four
constraints at once: inside three years of the original Form I-9's execution, that I-9 still retained, an
E-Verify case having existed and returned authorized, and the customer's own background-check policy. **A funnel
down from 8.9% through those four gates is worth more in a PRD than any single figure**, because it is what the
product actually has to handle.

**On the target: D-027 records five to six days, and it carries a warning.** Against the 40 to 42 day baseline
it is an 85 to 88% reduction. Against **Paradox's published average of three and a half days** it is slower, so
speed cannot be the positioning. The claim that survives is the connector position from D-020 and the spanning
view from D-013. And measure application to first shift, the way they measure it, because comparing our
days-to-offer to their days-to-first-shift would be cheating.

**Q-032 got its answer from Nishant and it lands on the right side of our ICP.** He is confident the full prior
employee record persists at large retailers and unsure about small ones, and we sell above $2B revenue. Two
things his answer does not settle, both recorded in Q-032: **the employee record persisting is not the same as
the Form I-9 persisting**, and US employers often purge I-9s at the retention deadline on purpose to stay out of
audit scope. And existing is not the same as readable by a connector, which was always the real question. Put
both to whoever answers next, because the two questions sound identical and only one is the one we need.

---

## Verification landed, 26 Aug. Four things changed

A twelve-agent run on the rehire law, the 72-hour claim and job board distribution. 133 claims survived, 19
killed, 45 narrowed. Full write-up in **01-diagnosis/verification-2026-08-26.md**. Four results change what you
were about to write.

**1. Your four year example is outside the legal window, and the design target is three.** The I-9 rehire
shortcut runs **three years from the date the original Form I-9 was first executed**, verified against 8 CFR
274a.2(c)(1)(i) itself. A four year gap needs a complete new form. Two useful extras: the retention rule can
destroy the old form before the window closes, and the E-Verify shortcut additionally requires that a case was
created from the original I-9 and returned authorized, **which depends on when the customer adopted E-Verify**.
That last one is a configuration input, not a rule we can hard-code.

**2. I was wrong about background checks, and the correction helps you.** I said a prior check is very unlikely
to be reusable. **Federal law imposes no shelf life on a delivered report**, and the FTC's 1998 advisory opinion
says no fresh authorisation is needed per report. The real constraints are the untested scope boundary after
separation, state law where **Massachusetts closes it outright**, and employer policy, which is where the
operative rule actually lives. **So the check is a per-customer configuration field, not a legal blocker**, and
the honest product claim is "we apply your policy and show which one applied".

**3. The rehire population is smaller than I told you, and one of my numbers was a vendor blog.** I said 19% of
grocery hires are returners and called one in five not an edge case. **That figure is a Ceridian/Dayforce blog
built on client-volunteered records with no sampling frame. Withdrawn.** Census QWI puts retail recall at
**8.9% of hires in 2024**, below the all-private 12.7% and below five other hourly-heavy sectors, **and retail
does not spike in Q4**, which kills the seasonal hypothesis I built on top of it. The one peer-reviewed retail
study is lower still at 4%, and it found **rehires turned over more than external hires, 36.6% against 33.5%**.
Macy's says 33% for holiday 2024, first-party but one retailer and one season.

**What this means for the plan.** Rehire stays worth building and stops being a wedge. Nishant's edge-case
instinct was closer to the data than my enthusiasm. The value argument survives: cheapest and fastest hire
available, timing centres inside the legal window at a mean 1.77 years away, nobody found doing it. **The
quality argument is dead** and must not be used.

**4. Q-041 is now a cheap decision, and the answer is buy or skip rather than build.** Indeed posting is table
stakes: Fountain and Paradox both do it natively and **Indeed claims 350-plus ATS integrations**. Neither
incumbent owns multi-board distribution, both buy it, Fountain from Recruitics and VONQ. **LinkedIn's Job
Posting API is closed to new partners**, only three consumer permissions are self-serve, and the free feed route
carries no ingestion guarantee. And **Indeed retired organic single-source feeds on 31 March 2026** with
sponsored ending this year, so a feed-based integration is already half obsolete. Per D-025 the demo needs none
of it.

**One thing to strike from anything you write.** **There is no source for "Paradox does 72 hours."** Their
published average is **three and a half days, 84 hours**, and the Chipotle flagship is 4 days, **confirmed twice
as application to first day worked**. Chipotle's own release calls the 75% an expectation, not a result. The
72-hour number most likely comes from back-computing that inconsistent 75% headline, since a true 75% cut from
12 days is exactly 3 days.

---

## Top of the list, 26 Aug: nothing blocks the problem statement now

You answered the 25 Aug questions and corrected two of my errors. The position after that:

**Only one blocking question is left in OPEN-QUESTIONS.md**, Q-030 on pricing, and it is deferred by your own
call with two guardrails. Q-027 closed with the answer no. Q-035 was reframed after I had manufactured a
contradiction that was not there. Q-037 you reframed yourself. **So the gate D-026 set is reachable.**

The scaffold is **05-strategy/problem-statement.md**. Seven sections, empty below each heading, each one listing
what is already available to fill it and what is not. Read it before writing anything.

**A. Write the problem statement and the persona list.** This is the deliverable. One genuinely missing input,
and it is the persona choice. Q-027 proved there is no organisational level where volume and authority both
sit, so it cannot be found, only chosen. The comparison table is in Q-027, mapping the three candidates against
your three objectives. **You do not need certainty. Name the bet and write down what would make you abandon
it**, which is what every other entry in DECISIONS.md does.

**B. Decide Q-041 before you write section 6.** Job board distribution. You said a thin funnel makes it
desirable and that it was a major point at the end of the meeting. D-009 made attract a non-goal. Q-041 sets out
why it contradicts D-009's headline while passing D-009's actual reasoning, and why the inbound half was already
in scope under D-020. It either is or is not an exclusion, and the problem statement needs to say which.
Verification on whether the incumbents already do it, and on the LinkedIn access model, is running now.

**C. Reconcile your three objectives with D-017.** D-017 records time to hire and number of hires. Your
objectives are time to hire, **number of people involved**, and **least manual work**. Number of hires is not in
your list and two of your three are not in D-017. Number of people involved is the handoff count, the question
you first put to Nishant, which no research run could answer. If it is a success metric then v1 has to count it,
which is a design requirement. Either amend D-017 or restate the objectives, but not both.

**D. Ask Anuj who he met in the USA. Still the cheapest high-value action available.** Q-036. He met US clients
a couple of months ago, the PRD came out of it, he sits next to Nishant, and Nishant offered to carry questions.
Four things to ask: who, what kind of retailer, what they actually said in their own words, and whether notes
exist. **This is the only thing on the list that could change the problem statement rather than just inform it**,
and it could land before the check-in.

**E. The rehire reframe has three follow-ons, and one of them is a real problem.**

Your reframe is recorded in Q-037. Direction settled, and it turns a compliance guard into a speed feature that
serves your first objective directly. Three things follow.

**One, the four year example probably falls the wrong side of a legal line.** Our understanding is that the I-9
rehire shortcut has a three year limit, which would make a four year gap require a full new I-9. There is a
second trap: the I-9 **retention** rule is three years after hire or one year after termination, so the old form
may lawfully have been destroyed before the window closes. Both are in verification and Q-037 gets updated when
it lands. **The likely conclusion is good news**, because retail's seasonal returners sit inside three years,
which is very likely where the legal shortcut also lives. Build for last season's leaver, not for the four year
one.

**Two, Q-032 is now wrong and needs rewriting.** It concluded that exactly one thing must come over from the old
system: the not-eligible-for-rehire flag. Under your reframe the ask is a full prior employment record including
training completion and attendance. That is a much larger read, it is the hardest kind for a connector layer, and
**it is the single most likely place this design gets refused by a customer.** Worth testing in a conversation
before it is designed.

**Three, the demo currently tells the old story.** Scene 6 is the rehire flag framed as a guard. Under your
framing it should be the fastest hire in the product. Say the word and I will rewrite the screen and the
narration in DEMO-SCRIPT.docx. Not doing it unilaterally because it changes the pitch, and that is yours.

**F. Tell Nishant two things from Anuj's PRD, because he has not read it.** E-072, his own words: "I have not run
any cloud code session of myself into baselining that." Two findings need saying out loud rather than sitting in
a document. The design self-reports work authorisation over SMS and wires it to an automatic decline, which sits
on the anti-discrimination provision at 8 U.S.C. 1324b. And it auto-rejects three ways while his own exec
summary, his own prd-v1 principles and his own competitor teardowns all argue against auto-rejection. Neither is
a criticism of Anuj. Both are things you would want to know before building on it.

**G. Still unsent: shared/STATUS-FOR-NISHANT.md.** It now predates two days of substantial change. Either send it with
a covering note or fold in the 25 and 26 Aug material first.

**H. Still unposted: the Slack intro request**, with the "current or former" change.

### One thing to stop repeating

**There is no source for "Paradox does 72 hours."** Joy said only that some companies claim a 72 hour close and
labelled his own explanation a thesis with no proof point. Nishant floated Paradox and said in the same breath
"no proof point." Paradox's strongest published number is Chipotle at four days, which is 96 hours, from
Workday's own acquisition release. If a 72 hour benchmark goes into the problem statement it is an unattributed
number, and it is the exact category rule 1 of EVIDENCE.md exists to catch.

---

## Carried over from 25 Aug: Nishant set a gate and a date

**The gate, in his words.** "By end of your research and discovery you are convinced that this is the problem
statement we are going after, these are the personas." Then specs, then data model, then information
architecture, then engineering high level design, then build. Recorded as D-026.

**The date.** Check in tomorrow evening, 26 Aug, if there is reasonable progress. Otherwise Thursday 27 Aug.

So the two sentences you have owed since 16 Aug are no longer a loose end with no deadline. They are the
deliverable, and they are due in one to two days. Everything below is ordered by whether it helps you write
them.

**1. Ask Anuj who he met in the USA. Do this first, today.** Q-036. He was there a couple of months ago
meeting clients, and his PRD came out of those meetings. His competitor teardowns carry 229 URLs and his PRD
documents carry zero, so the client material either was never written down or lives outside that repo. He is
one hop from real practitioners and he sits next to Nishant, who offered to carry questions: "let me know
which questions are those, we can continue conversation."

Four things to ask: who, at what kind of retailer, what did they actually say in their own words, and do
notes exist. This is the cheapest high-value action available and it could put a real practitioner in front
of you before the gate rather than after. It is also the only thing on this list that might change the
problem statement rather than just inform it.

**2. Decide how the problem statement handles Q-035, because it splits two ways.** Joy says the US
job-to-application ratio is not high. Anuj says the store manager is buried in screening. Both cannot be the
primary pain, and everything we have built assumes the second one. There is a reading where both are true,
written up in Q-035 and in 03-discovery/synthesis/internal-inputs-2026-08-25.md, and it turns on the roughly
6% click-to-apply rate. You do not have to resolve this to write the statement. You do have to write down
which reading you picked and that it is an assumption, because if it is wrong the demo opens on the wrong
screen.

**3. The persona half of the gate has three candidates and no evidence.** Anuj says store manager. Our own
Q-027 work says the payroll constraint sits with the district manager and the process sits with field HR, and
neither of those is the store manager. Joy's material implies a recruiter or a sourcing team. Three primary
users in one dump. Pick one, name it, and write down what made you pick it. That is what Nishant is asking
for and no further research produces it.

**4. Decide the rehire conflict before Nishant sees the demo.** Q-037. He considers rehire an edge case not
worth solving now. Scene 6 of your demo is the rehire flag, and the script says scenes 6 and 7 are the two
that must never be cut. Q-032's one surviving import is that same flag. Either the scene stays and you have
an answer ready for why a high-churn funnel makes reapplication routine, or the scene goes and the import
goes with it. Do not find this out live.

**5. Tell Nishant two things from Anuj's PRD, because he has not read it.** E-072, his own words: "I have not
run any cloud code session of myself into baselining that." So the assessment is new information to him. Two
findings need saying out loud rather than being left in a document. First, the design self-reports work
authorisation over SMS and wires it to an automatic decline, which sits on the anti-discrimination provision
at 8 U.S.C. 1324b. Second, the design auto-rejects three ways while his own exec summary, his own prd-v1
principles and his own competitor teardowns all argue against auto-rejection. Neither is a criticism of Anuj.
Both are things you would want to know before building on it.

**6. Still unsent: shared/STATUS-FOR-NISHANT.md.** Rewritten and quality-checked. It now predates the 25 Aug call, so
either send it with a short covering note about what changed or fold the changes in first. Sending it before
the check-in is better than after.

**7. Still unposted: the Slack intro request**, with the "current or former" change. Q-001's remaining routes
are Anuj's contacts and former employees, and this message works the second one.

---

## Carried over from 24 Aug: the Target route is closed

**Nishant could not arrange the Target conversation.** That was the route to seven facts nothing published
answers, and it is now gone. shared/QUESTIONS-FOR-TARGET.md keeps its value only if a different practitioner is
found, so it is no longer a send-and-wait item.

**Research is finished.** Four runs. The fourth one went after the questions the Target conversation was
meant to close. What it reached and what it could not is in 01-diagnosis/. Desk research has a ceiling and
this project has now hit it four times, so the remaining unknowns move from "things to research" to
**things the first deployment has to measure**. That is a design requirement, not a research task.

**A. Two sentences, still owed since 16 Aug.** Who the primary user is, and what that person stops doing on a
Monday. This is now the binding constraint on everything else, not a loose end. The tier ranking, the pricing
question, the demo's opening screen and Q-027 all resolve differently depending on the answer, and no amount
of further research produces it. Write it and the next four items unlock.

**B. Decide the tier 1 ranking.** 05-strategy/first-30-days.md proposes steps 5, 8 and 16. The proposal is
Claude's; the decision is yours. The honest counter is written next to it: three steps is a build order, not
an end-to-end hiring platform, and it should not be sold as one.

**C. Choose a practitioner route, or decide to go without.** The options are written out with what each costs
in 03-discovery/. The one that has not been tried is **former** employees rather than current ones, because a
current employee cannot discuss internal process with an outside vendor and a former one has no such
constraint. Going without is a legitimate choice as long as it is a choice, and it means the first deployment
carries the measurement burden.

**D. Then wireframes for the tier 1 slice, then acceptance criteria.** Nishant's order was research,
wireframes, high fidelity, check the screens solve the thing, then build. The demo already jumped ahead of
that, so what is actually missing is not a screen. It is the acceptance criteria for the three tier 1 steps,
and per the working rule those are yours to draft.

---

## Carried over from 17 Aug: the demo

The goal changed shape on 17 Aug. **D-018: a demo for Nishant comes before the product.** Everything external
is simulated. Pricing is deferred with a guardrail. Q-032 narrowed to one import. E-Verify posture is Q-033,
decided at S1. The metric conflict is resolved by D-017.

**1. DONE 17 Aug. The demo is built.** Open ../demo/index.html by double-clicking it. Overview
page first, then click through to the product. Eleven screens, presenter notes on P, reset on R. The
read-aloud script is ../demo/DEMO-SCRIPT.docx, thirteen scenes with the narration written out.

**2. Walk it yourself, twice, before he sees it.** Once with presenter notes on to learn the beats, once
with them off at the real pace. The two scenes that matter are 6 and 7, the rehire flag and the E-Verify
refusal. If you are short on time, cut scene 3 or 8, never 6 or 7.

**3. Send him shared/STATUS-FOR-NISHANT.md, v2 as of 18 Aug.** Rewritten from scratch, because v1 said there was no
problem statement and no v1 and that our premise was in question, and all three of those are now resolved. It
leads with the demo, records the seven decisions that define the product, and is honest about the three
answers that are still weak. Three asks in section 6: tear the demo apart, practitioner access again, and
whether this sits on the NuAisle shelf at all now that we have chosen to replace the applicant tracking
system.

**4. The defence pack behind it is DECISIONS.md,** D-009 to D-019, each with reasons and a reversal condition,
plus the short form in the appendix of the demo script.

**5. Deferred by D-018, on purpose:** pricing (Q-030), the do-not-hire export question (Q-032), the E-Verify
posture (Q-033), the build order, and every integrate-versus-export choice.

**6. Not deferred: practitioner access. Q-001.** Still the biggest unmanaged risk. The demo helps rather than
waits, because a concrete thing to react to opens doors that a question list has not.

Item 12 below, the one-sentence problem statement, falls out of the demo spec: scene 1 names the user, and the
scene list names what they stop doing.

---

## Big decisions, blocking Phase 5

### 1. SETTLED 9 Aug 2026

One flow. Management roles are an explicit non-goal for v1. Recorded as D-010 with the cost written next to
it, because management roles are where the money usually is.

### 2. How broad does the horizon stay, and how does that not become v1 scope?

**Partly settled 9 Aug 2026.** Attract is now an explicit non-goal. See D-009. Three stages left in scope
for the horizon: hire, onboard, activate. The v1 cut among those is still a Phase 5 decision.

Nishant's guidance, 9 Aug 2026: "yes keep the horizon broad, we can cut down the scope later. we also
want to create solution to attract the talent. not the ads/marketing part like social media website
publications those will be job of other teams but enabling those teams will be a dimension we need to
address."

So attract is in the long-term picture, and specifically the enabling layer rather than running the
advertising. That is a useful boundary and it is narrower than "attract."

What you owe here: the difference between a broad horizon and a broad v1, written down. A broad horizon
is a roadmap. A broad v1 is how products fail. Recorded as D-008.

---

## Answers that have to come from a person

### 3. Find five people who hire retail staff in the US and do not work at Nurix

Phase 1 now runs without them by your decision. Phase 3 cannot. Its gate is exactly this.

No date set and no name against it except yours. Ask Nurix sales this week which US retail companies
are already in conversation. Q-001.

### 4. Does scheduling law enforcement make hiring speed newly expensive?

This is currently my hypothesis and it needs someone who operates under one of these laws.

Fair workweek rules require posting schedules about 14 days ahead and paying a premium to change them.
Chipotle settled with New York City for $20 million, Starbucks for about $39 million in December 2025.
If a retailer must commit to a schedule two weeks out and pay to change it, an unfilled shift stops
being an inconvenience and becomes a priced compliance event.

If true, it is the "what changed" answer this project has been missing. If false, drop it. Either way
it needs a practitioner. Q-024.

**Weakened 14 Aug.** The settlements are real. The link from schedule stability to retention is not. The one US
retail randomised trial that tested it, at Gap Inc., came back as a null on aggregate turnover, and Seattle's
own evaluation of its scheduling law found no effect on quits or tenure. So keep the question, and do not let it
carry weight in a pitch. Detail in 01-diagnosis/research-2026-08-14.md.

### 5. Get real hiring funnel numbers

Interview no-show rate, application completion rate, day-one no-show rate, 90-day retention.

Desk research produced plenty of these figures and not one with a traceable source. They are listed in
section D of 01-diagnosis/research-inputs.md as numbers not to use.

These have to come from a practitioner's own reporting or a named study. There is no shortcut and the
PRD needs them as baselines. Q-025.

**Two failed attempts as of 14 Aug.** A research run with strict source rules, fetch everything and drop any
claim whose page does not load, found no traceable number for the duration of any stage of US frontline retail
hiring. That is the second attempt to fail. More searching is not the answer.

The questions to ask instead are written out in 03-discovery/practitioner-questions.md, ready for the day you
have access. That makes item 3 above, finding five people, the biggest unmanaged risk in the project.

### 6. What does NuAnchor cost, and how long does it take to set up?

You said this is out of scope, so it sits here rather than blocking anything.

It matters only as a precedent. If products on the NuAisle shelf have a standard price and setup shape,
a hiring product inherits it. Ask Nishant when convenient. Q-008.

### 7. What is in the downloadable audit file?

Low priority. The screenshots show the reasoning display and the per-step ownership, but not the audit
export.

It matters because in US hiring, being able to reconstruct a decision months later without the app is a
legal requirement rather than a nice feature. Worth knowing what shape Nurix already produces. Q-007.

---

## Still owed by you, added 11 Aug

### 12. Your problem statement: WRITTEN 18 Aug 2026, and it is good

You wrote it yourself and it is now the spine of section 1 of shared/STATUS-FOR-NISHANT.md, quoted verbatim with the
work behind each clause underneath it.

"US frontline retailers lack a single system that manages and connects the entire hiring journey, from
application through the first 90 days, leaving critical handoffs, waiting periods, compliance steps, and
post-hire follow-through fragmented across multiple systems and teams. This makes it difficult to see where
candidates are getting stuck, act on exceptions, and ultimately hire people quickly and compliantly."

It holds up against the recorded work. Handoffs and waiting periods is exactly what the funnel map found,
seventeen of nineteen. Compliance steps maps to the six clocked steps. Post-hire follow-through is the four
activate steps. Quickly and compliantly is the two metrics and nothing more.

**One half of it is still open.** It names the problem and not the person. Whose screen does this open on, and
what does that person stop doing on a Monday. Everything downstream, the design and the pitch both, waits on
those two.

If the honest answer today is "I do not know which step yet," write that sentence instead and say what would
tell you. That is a legitimate position six days in.

### 13. Send Nishant the status doc, and get the three answers in it

shared/STATUS-FOR-NISHANT.md. The three asks are practitioner access, whether a hiring product sits on the NuAisle
shelf or outside it, and his read on the premise challenge.

The first one is the biggest risk in the project and has had no date against it since 8 Aug.

---

## Phase 0: CLOSED 9 Aug 2026

All three remaining items answered in conversation and transcribed into the files.

- **Item 8, what transfers from NuAnchor.** Answered: nothing. See D-011.
- **Item 9, what does not carry over from Unifi.** Answered, and it is the strongest structural
  observation made in this project so far. Transcribed into 00-context-notes/unifi-one-pager.md.
- **Item 10, the four-sentence test.** Passed. Transcribed into 00-context-notes/nuanchor-one-pager.md
  with a note on the two things missing.

---

## Diary

### 11. Check the 2026 NRF seasonal hiring forecast when it publishes

Usually September or October. It settles whether the 2025 drop was one soft year or the start of a
trend.

The 2022 to 2025 numbers are not a straight decline, so one more data point genuinely decides this.
Q-022 and D-006.

---

## A note on what the screenshots gave us

Worth reading before you write item 8.

NuAnchor now shows, per step, a line saying what the agent owns and what the human decides. On the
demand step: "AGENT OWNS: sensing and fusing demand signals into a directional range. YOU DECIDE:
whether this product is worth a buy."

Separately, the Unifi build answered the same question a different way: hard yes/no rules for
eligibility, a client-owned phrase bank for open answers, and an agent that can pass a candidate
forward but never reject one.

So Nurix has two independent, shipped answers to the hardest question in this project, which is where
AI belongs in a decision about a person. That is more useful to you than either the retail domain
logic or the demo polish, and it is what item 8 should be about.
