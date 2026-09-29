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

**Index, updated 26 Aug 2026 after Suniras answered the 25 Aug questions.**
Open and blocking: Q-030 only.
Open and shaping: Q-036, Q-037, Q-041, Q-034, Q-032 (needs rewriting, see Q-037), Q-012, Q-001, Q-025, Q-024,
Q-023, Q-026, Q-028.
Track: Q-042, Q-040, Q-039, Q-038, Q-035.
Closed or answered: Q-002 to Q-011, Q-013 to Q-022, Q-027, Q-029, Q-031, Q-033.

**26 Aug cleared three of the seven raised on 25 Aug.** Q-027 closed, and the answer is no: there is no single
level where hiring volume and hiring authority both sit. Q-035 was wrong as written and is reframed, because
Anuj's claim was about manager capacity rather than application volume, so it never was a conflict. Q-037 was
reframed by Suniras from a compliance guard into a speed feature, which is the strongest single idea added to
this project by anyone other than him.

**Q-041 and Q-042 are new on 26 Aug.** Q-041 pushes back on a standing decision: job board distribution, which
D-009 excluded and which the 25 Aug meeting raised as a major point. **Its recommendation was corrected the same
day** after research found a free unilateral tier that should ship before anything is bought. Q-042 closes the
employment freshness lookup and records the three independent reasons it fails, the most important of which is
that doing it for an employer makes us a consumer reporting agency.

**Two verification runs landed on 26 Aug** and both are in 01-diagnosis/. The first settled the rehire law and the
size of the rehire population. The second re-verified LinkedIn on Suniras's instruction and found the
alternatives. Between them they corrected three things Claude had written down and two things in DECISIONS.md.

**Only one blocking question is left.** Q-030, pricing, and it is deferred by Suniras's own call with two
guardrails. So nothing in this file blocks the problem statement Nishant asked for.

---

# OPEN

## Blocking

### Q-035. What are the actual funnel numbers? REFRAMED 26 Aug 2026, no longer a conflict

**This question was wrong when it was written on 25 Aug, and Suniras corrected it.** It claimed Joy and Anuj
contradicted each other on whether the problem is too many applications or too few. They do not. The two
claims are about different things and both can be true at once.

**What Anuj actually said.** The store manager is buried because they already work twelve to fourteen hour
days, and hiring on top of that is hectic. **That is a claim about the manager's total capacity, not about
application volume.** Reading it as a volume claim is what manufactured the conflict.

**What Joy actually said.** The US job-to-application ratio is not high compared with India, the Middle East
and Southeast Asia. That is a claim about funnel width.

**Suniras's position, 26 Aug.** "I'm not saying that volumes are less either. It's a complete problem and the
solution's main aim would be to reduce time to hire, number of people involved, and the least amount of
manual work."

**So the question changes from which one is true to what the numbers actually are**, and that lands on the
measurement list D-023 already created rather than on the research list. Nothing here blocks the problem
statement.

### The consequence that does matter

If the burden is manager **capacity** rather than application volume, then the value of the product is
measured in hours returned to a person who has none, not in applications sifted. Those are different demo
opening screens, different first slides, and different renewal arguments. A screen that says "we handled 340
applications for you" speaks to a volume problem. A screen that says "this took you eleven hours last month
and forty minutes this month" speaks to the problem Anuj described.

**And it exposes a mismatch with D-017 that needs settling.** D-017 records success as time to hire and number
of hires. Suniras's three objectives on 26 Aug are time to hire, **number of people involved**, and **least
manual work**. Number of hires does not appear in his list, and two of his three do not appear in D-017.
Number of people involved is the handoff count, which was his original question to Nishant and which no
research run could answer. So the recorded success metric and the stated objective are not the same thing.
That is a real gap and it is flagged in TODO.md rather than resolved here, because metrics are his to set.

**What is still genuinely unknown, and it is measurement rather than research.** Applications per opening in
a normal week. Openings a manager covers at once. Hours a manager spends on hiring per week. Handoff count.
Four runs found none of them and D-023 already moved that class of question to the first deployment.

**Who answers it.** The first deployment, by instrumenting it. A practitioner could give rough numbers sooner,
which is Q-036, and the questions are written as 15 and 16 in
03-discovery/practitioner-questions.md.

---

### Q-027. Is there an organisational level between store manager and central TA where volume and authority both exist? CLOSED 26 Aug 2026, and the answer is no

**Closed on Suniras's delegation, 26 Aug: "your call."** Closing the factual question, which is what this
question asks. Not choosing the persona, which is a different thing and is still his. The difference matters
and it is set out at the end of this entry.

**The answer is no.** There is no single level where hiring volume and hiring authority both sit. The level
exists but it is split across two roles, and neither one holds both. That has been the finding since 11 Aug
and four research runs have not moved it. What kept this question open was two sub-facts, and D-023 already
moved both of them off the research list onto the measurement list, so there is nothing left here that more
searching can close.

**Why closing it is safe rather than convenient.** A negative answer is still an answer, and this one is
load-bearing in a useful direction: it means the persona problem cannot be solved by finding the right layer of
the org chart. There is no layer. Anybody who keeps looking for one is looking for something the evidence says
is not there.

### What the three candidate levels are actually good for

Assembled from what is already recorded, against the three objectives Suniras stated on 26 Aug. This is a map
of the evidence, not a recommendation.

| | Store manager | District manager | Field HR business partner |
|---|---|---|---|
| Feels the pain daily | **Yes.** Twelve to fourteen hour days, hiring on top, E-061 and E-062 | No | Partly |
| Owns the payroll budget | No | **Yes.** Payroll, expense and shortage goals | No |
| Owns the hiring process | Does the work | Only for store manager roles | **Yes**, across a group of stores |
| Would notice time to hire improving | **Yes, immediately** | Only as a cost line | Yes, it is their measure |
| Would notice fewer people involved | Yes | No | **Yes, it is their coordination burden** |
| Would notice less manual work | **Yes, in their own hours** | No | Yes |
| Can sign a contract | No | Maybe | No |
| Span, evidenced | One store | Kohl's says 15 to 20 stores, operations role | **Unknown after four runs** |

**The pattern in that table is the whole problem.** The person who feels all three objectives is the person who
cannot buy. The person who can buy has stated measures of sales, profit, productivity, payroll and shrink,
where hiring appears as a cost line, so a product that fills roles faster does not obviously improve anything
they are paid on. That is the adoption risk in its sharpest form and it is not new, it is recorded above.

**Field HR is the only role whose own measures line up with two of the three objectives**, and it is also the
role we know least about. Its span is the one number four research runs could not find.

### What I am not deciding, and why it is not a formality

The persona choice is not "which of these three is most important". It is a bet about who signs, who adopts,
and who renews, and those can be three different people. Making that bet is what CLAUDE.md reserves for
Suniras, and there is a practical reason beyond the rule: the bet determines the opening screen of the demo,
the first sentence of the pitch, and what the product measures, and the person who has to defend all three
should be the person who chose. The table above is meant to make choosing faster, not to choose.

**One thing worth noting before he chooses.** Nothing in the 25 Aug dump favoured field HR. Anuj said store
manager. Joy implied a recruiter. Neither had met a field HR business partner as far as we can tell. So the
role our own structural analysis points at is the one nobody we have spoken to has mentioned, and that is
either a genuine insight or a sign the analysis is detached from how these companies actually work. Q-036 is
the cheapest way to find out which.

**Original entry from 11 Aug follows, unchanged.**

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

- How many stores a field HR business partner actually covers. **Still nothing found after four research
  runs.** No employer-owned posting that loads states a store count for a field HR role. Walmart's own Market
  Human Resource Manager text says only "in multiple facilities".
- **The volume half is still open, 24 Aug 2026.** An earlier note here claimed it was answerable from a TJX
  requisition stating 10 or more stores and 300 to 600 non-exempt team members. **That claim was refuted.**
  TJX's careers page quantifies the District Manager role only in sales dollars, and converting $100M of
  annual sales into a store count is an inference the source does not make. Retracted.
- **Kohl's 15 to 20 stores is the only first-party multi-unit span figure that survived**, and it carries three
  limits: it is a district **operations** role rather than field HR, the page is evergreen recruitment-template
  copy so the number is a stated design span rather than a measured average, and the dated requisition itself
  returns 410. It must not be repurposed as field HR span.
- What field HR is measured on. **Still not established after four runs.** The single attempt to extract
  metric language from a live posting was **refuted unanimously**, so the earlier inference that hiring speed
  appears nowhere in their measures does not stand either. Two traps recorded for whoever tries next: Walmart
  reuses "(USA) Human Resource Manager" across Stores, Sam's Club and Supply Chain, so title-matching without
  checking the division field produces false positives, and the "1.3M associates" string on those pages is
  company-wide boilerplate rather than a span figure.
- **The untried route.** Archived job postings are the most promising remaining source for a field HR span
  figure, and the research environment could not reach the archive at all. One manual retrieval is worth
  doing before concluding the number does not exist anywhere.
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

### Q-041. Job board distribution: does D-009 have to be amended? RAISED 26 Aug 2026

**Suniras's position, 26 Aug.** "Since the funnel is very thin, it would be desirable to have job board
integrators, which increase the attraction and visibility of that job. This was also one of the major points
raised in the meeting at the end."

**Why this is filed as a question rather than written up as a decision.** It pushes against D-009, which has
been standing since 9 Aug and which made attract an explicit non-goal. Reversing a standing decision should be
done deliberately and on the record, the way D-020 reversed D-015, not absorbed quietly into a scope list. The
material for that call is below.

### It contradicts D-009's headline but not D-009's reasoning

Worth separating, because the two point different ways.

**D-009's stated reason was a data advantage argument**, in Suniras's own words at the time: "I don't know how
we're going to get data which nobody else has." The reasoning that followed was about attract
**enablement**, meaning telling a customer which channels produced people who stayed. That needs downstream
outcome data we would not have, and it would put us in competition with the incumbent's own analytics.

**Job board distribution is not that.** Posting one job to several boards is plumbing and reach. It needs no
privileged data and it makes no analytic claim. So it fails D-009's headline and passes D-009's actual test.

**And half of it is already in scope.** D-020 records that step 1, application capture, is in, and that
"applications arrive through a connector from the job portals and the retailer's own careers site." So the
**inbound** direction was settled on 18 Aug. What is new here is the **outbound** direction, pushing the
opening out to the boards. That is a narrower change than it first looks.

**Suniras said the same thing himself on 25 Aug**, before this: "the main aim of job board integration is also
sort of visibility only right?" So the position is consistent across both calls.

### The argument for it

The thin funnel is the best-evidenced fact in this project. Roughly 6% of people who click a frontline job
finish applying, verified from two independent sources. A thin funnel makes reach worth more than sifting, and
it makes an extra board a bigger lever than a better filter.

Joy's version of the commercial logic also survives here even though D-024 excluded most of his list: a
retailer will not hold subscriptions to three or four boards, so somebody has to fan out for them. Note that
Joy's own conclusion was that this is a **European** problem because the US market is organised and LinkedIn
dominant, E-068. Suniras is reaching the opposite conclusion for the US, and both of them cannot be right about
how fragmented US retail sourcing is. That is checkable.

**And distribution is the one part of attract where being a connector layer helps rather than hurts.** For
everything else in attract, not owning the record is what disqualified us. For fan-out, being the thing in the
middle is the entire product.

### The argument against it, and it is not weak

**It may be parity rather than differentiation.** If Fountain and Paradox already post out to multiple boards,
this is table stakes, and shipping it wins nothing except not losing. Being verified now.

**There is an established industry that already does exactly this.** Programmatic job advertising and
multi-posting are existing vendor categories with incumbents. Entering it means competing with specialists on
their own ground, which is the opposite of the position D-020 chose.

**The access model may not permit it.** Q-040 flags the claim that any recruiter can use LinkedIn's APIs as
probably wrong. If the major boards are partner-gated or paid, the feature's cost is a commercial negotiation
rather than an engineering task, and that is a different kind of commitment. This is the load-bearing unknown
and it is in verification now.

**It widens scope at the exact moment Nishant asked for it to narrow.** D-026 set the gate as a problem
statement and a persona list. Adding a scope item the day before that gate is worth doing consciously.

### What deciding it does not require

**The demo does not need it built.** D-025 records Nishant's standard: show where the integration goes and
simulate it, do not build a live connection. His own example was "Greenhouse access capability exists to
simulate." So the visibility story can be demonstrated at zero integration cost, and the decision about
whether to actually build it can wait for a customer to ask.

### VERIFIED 26 Aug 2026: it is not a differentiator, and the choice is buy or skip

Full detail in 01-diagnosis/verification-2026-08-26.md.

**Indeed posting is table stakes.** Fountain's own page states that job listings created or updated in Fountain
are automatically sent to Indeed.com. Paradox has native toggle-level Indeed distribution. **Indeed claims over
350 ATS integrations globally.** So this is a thing everybody has.

**Neither incumbent owns multi-board distribution. Both buy it.** Fountain's current integrations page lists
Programmatic Job Advertising as a category supplied by **Recruitics and VONQ**. Paradox's "thousands of job
boards" claim is **explicitly attributed to programmatic advertising** rather than to anything it owns.
Workday's LinkedIn integration set is three single-channel LinkedIn products, not general distribution. And VONQ
sells its HAPI product to applicant tracking vendors precisely as a way to add distribution without building it.

**So the decision is not build or skip. It is buy or skip.** Building means competing with programmatic
advertising and multi-posting specialists on their own ground, which is the opposite of the position D-020 chose.
Buying puts us level with the incumbents cheaply, and level is all that is available here because nobody is
differentiated on it.

**Every destination is gated, and the largest one is switching off the cheap route right now.** Indeed needs a
signed developer agreement and an issued token, and reserves the right to exclude jobs failing its quality
rules, so transmission is not visibility. LinkedIn is closed, see Q-040. And Indeed is retiring single-source
feeds: **organic delivery ended 31 March 2026** and sponsored delivery ends by the end of 2026. **Anybody costing
a feed-based Indeed integration today is costing infrastructure that is already half retired.**

**Joy and Suniras disagreed about US fragmentation and Joy was closer to right, for a different reason.** The US
destination market is not fragmented, it is concentrated and **closed**. That is worse for a build and better for
a buy, because the specialists hold the partner agreements we would have to negotiate from scratch.

**Who decides.** Suniras, and it is now a cheap decision either way. **Per D-025 the demo needs neither.**
Nishant's standard is to show where the integration goes and simulate it, so the visibility story costs nothing
to demonstrate and the buy decision can wait for a customer to ask.

### Claude's recommendation, asked for on 26 Aug: buy the outbound, own the inbound, and buy nothing yet

Suniras asked directly whether we should do what the incumbents do. The recommendation is yes on the outbound
half, no on the inbound half, and not now on either.

**Buy the outbound fan-out, when a customer asks for it.** Three reasons and none of them is cost. **The gate on
every destination is commercial, not technical.** Indeed needs a signed developer agreement, ZipRecruiter an
issued key, LinkedIn is closed. So building means negotiating three or more partner relationships from a standing
start with nothing to offer, while the specialists already hold them. **The plumbing is a moving target**: Indeed
retired organic single-source feeds on 31 March 2026 with sponsored ending this year, so whatever we built would
need maintaining against a destination that is actively changing its interface. And **there is nothing to win**,
because Fountain and Paradox both have it, Indeed claims 350-plus applicant tracking integrations, and a
capability everybody has cannot differentiate anybody.

**A consequence that has to be accepted with the decision.** If we buy the same layer the incumbents buy, we get
parity and no advantage. **So distribution must not appear in our positioning at all.** It is a checkbox we can
tick in a procurement document, not a reason anybody chooses us. Any deck that leads with reach is leading with a
commodity.

**Own the inbound normalisation, and this is the part worth arguing for.** The two directions are not the same
kind of problem. Outbound is media buying and feed formatting, which is commodity work sold by specialists.
Inbound is **identity resolution across sources**: the same person applying through Indeed, the careers site and
a walk-in, arriving in three shapes with three partial records, plus matching them against former employees for
the Q-037 rehire path. That is genuinely hard, nobody was found doing it well, and it is exactly the position
D-020 chose when it made us a connector layer rather than a system of record.

**And it serves the objectives directly.** Deduplicating one candidate across three boards removes manual work,
which is the third objective stated on 26 Aug, and it reduces the number of people who touch a hire, which is the
second. A fan-out to more boards does neither. **It makes the funnel wider, and the stated problem is not that
the funnel is narrow, it is that the manager has no hours.** Widening the top of a funnel that a person with no
time has to process makes their day worse, not better.

**That last point is the honest tension in this whole question** and it should be resolved before anything is
bought. The argument for distribution was that the funnel is thin, at roughly 6% click-to-apply. The argument
against is that more applications arriving to the same overloaded person is not obviously an improvement. Both
follow from things we believe. Whichever way it resolves belongs in the problem statement, because it is the same
question as whether the product is about capacity or about reach.

### CORRECTED 26 Aug 2026: "buy it" was premature. There is a free tier and it should ship first

The research came back and it improved on the recommendation above. **There is a tier that costs nothing, needs
no partner, no agreement and no approval, and no gatekeeper can refuse it.** That should ship before anything is
bought. Full detail and the full ranking in 01-diagnosis/verification-2026-08-26b.md.

**Tier 0, free and unilateral, two to four developer weeks.**

**Google for Jobs through schema.org JobPosting.** JSON-LD on each job detail page with five required fields,
plus an XML sitemap. **Zero cost, no contract, no application, no approval for eligibility.** Two traps: the
structured data must sit on the single job page rather than a listing page, and expiry has to be implemented or
the site risks a manual action.

**Free aggregator feeds, one file and several submissions.** Adzuna states it first-party: "Provide us with an XML
feed of all of the organic jobs on your platform and we'll advertise them for free." Jooble takes the same feed.
Careerjet, Talent.com, Jora, WhatJobs and Trovit run the same pattern. **Zero cost for organic placement.**

**So for nothing but engineering time the truthful claim becomes: your jobs appear on Google for Jobs, Adzuna,
Jooble, Careerjet, Talent.com, Jora and WhatJobs.** That is a real answer to the thin-funnel argument with no
commercial dependency attached.

**Tier 1, free API but a signed agreement.** The Indeed Job Sync API costs nothing in fees but needs a Developer
Agreement, a formal partner application, about six weeks, and an obligation to post all public jobs for every
client. **It is now non-optional to reach the largest destination**, because single-source feeds went
sponsored-only on 31 March 2026 and are being switched off through 2026 wherever an integrated applicant tracking
system exists. Being an integrated ATS is the only remaining route to free organic Indeed placement at scale.
ZipRecruiter is a free key with the best documentation of any destination, but no meaningful free organic tier, so
the employer needs a paid plan.

**Tier 2, buy breadth, and there is one clear answer.** **JobTarget** is the only vendor in the category with
public prices: revenue share plus co-marketing with "no added costs or fees" to the ATS partner, 25,000-plus
destinations, 80-plus existing integrations, and **$5 per posting** to the end customer on zero-cost boards.
Everything else is demo-gated with nothing published. VONQ reaches 5,000-plus channels and is already inside
Fountain. eQuest claims 35,000-plus across 183 countries with an unlimited-postings annual option and no numbers.
**Recruitics is the weakest: its partner pages 404 and it appears only in third-party directories.**

**What not to do: build direct integrations to individual boards.** Worst return on engineering available. The
aggregator and reseller layers exist to absorb exactly that work.

**The revised recommendation.** Ship Tier 0 because it is free and nobody can stop it. Open the Indeed
conversation early because it is slow and free. Treat JobTarget as the buy-side answer for breadth if a customer
asks for a destination count. **And keep distribution out of the positioning either way**, for the reason above:
everybody has it.

**The tension in this question is unchanged and still unresolved.** More applications arriving to the same
overloaded person is not obviously an improvement. Tier 0 being free makes that easier to live with, because a
free capability that turns out not to matter has cost only engineering time. It does not make the question go
away.

---

### Q-036. Who did Anuj meet in the USA, and did anybody write it down? RAISED 25 Aug 2026

**Why this matters more than it looks.** This is the best practitioner route this project has ever had, and
it was sitting in plain sight. Nishant said on 25 Aug that Anuj "was in USA couple of months ago. He was
meeting with a bunch of clients, internal team members. So yes, this software is needed somewhere." The PRD
came out of those meetings.

**And the meetings are not in the PRD.** The competitor teardowns in his repo carry 229 URLs. The PRD
documents carry zero. So the client-visit material was either never written down or it lives somewhere
outside that repo. Either of those is worth finding out, because Anuj is one hop from actual practitioners and
he sits next to Nishant.

**The four things to ask.**

- Who did he meet: role, seniority, and whether they touch hourly hiring or only sit above it.
- What kind of retailer: size, format, and whether any of them are above the $2B revenue line we target.
- What did they actually say, as close to their words as he can get, rather than his conclusion from it.
- Do notes, a deck, a call recording or a Slack thread exist.

**Then the four questions D-023 could not answer go straight to them**, plus Q-035, which is now the sharpest
one on the list.

**Who answers it.** Nishant, by asking Anuj, and he offered: "let me know which questions are those, we can
continue conversation." Or Suniras directly. Cheap either way, so there is no reason to wait.

**Why this is not filed under Q-001.** Q-001 asks for five people outside Nurix. Anuj is inside Nurix, so he
does not count toward that gate. He is a route to people who do.

**The risk to name.** A second-hand account of a client meeting, months later, with no notes, is a weak
source and it will be tempting to treat it as strong because it is the only one we have. Per D-003 it stays
assumption tier. What it is genuinely good for is producing names.

---

### Q-037. Rehire. REFRAMED 26 Aug 2026 by Suniras, from a guard into an accelerator

**The reframe, in his words.** "Our approach to rehire was that there might be someone who should not be
rehired, due to them breaking some rules. But why should we not use the same rehire for someone who stopped
working at the same place four years ago? If we already have all their details, then the process of background
checks and everything else is expedited. That helps making the rehire happen very quickly, almost
instantaneous."

**Why this is a better idea than the one it replaces.** Our framing was defensive: read the
not-eligible-for-rehire flag so we do not put somebody back into a store the company deliberately excluded.
That is a risk control, and a risk control is always an edge case to whoever is not carrying the risk, which
is why Nishant called it one. His framing is the opposite. **A returning worker is the fastest hire available,
because the expensive parts of the funnel have already been done once for that person.** That serves the first
of the three objectives he stated on 26 Aug directly, and it turns the same data read into a feature that
sells rather than a feature that protects.

**And it answers Nishant without arguing with him.** He is right that catching a barred rehire is an edge
case. He was not shown the other half.

### The legal boundary. VERIFIED 26 Aug 2026, and it cuts against the four year example

Verified against primary sources, written up in full in 01-diagnosis/verification-2026-08-26.md.

**The I-9 window is three years, and the anchor is the date the original Form I-9 was first executed.** Not the
original hire date, not the rehire date. 8 CFR 274a.2(c)(1)(i), confirmed word for word against the GPO's
official CFR text and Cornell LII, and restated in the Form I-9 instructions edition 01/20/25 at page 5. **So a
four year gap requires a complete new Form I-9.** The design target is the worker who left inside three years.

**Using the shortcut is optional.** M-274 section 6.2 lets an employer complete a new Form I-9 instead. The
field is Supplement B, not the old Section 3.

**A second constraint can bite before the first one does.** The I-9 retention rule is three years after hire or
one year after employment ends, whichever is later. For a short-tenure worker the old form may lawfully have
been destroyed while the rehire window is still open, so the shortcut can be legally available and practically
impossible at once.

**E-Verify: no new case in one branch, but reaching that branch needs three conditions.** Relying on the
previous I-9 through Supplement B means no new case. But it requires the rehire to be inside three years of the
original I-9's execution, **and** a case to have been created from that I-9, **and** that case to have returned
employment authorized. A retailer that adopted E-Verify recently has former employees whose original I-9 never
produced a case, so **whether the shortcut applies depends on the customer's own adoption history.** That is a
configuration input, not something we can hard-code.

**Where a case is required, the deadline is the third business day after the employee starts work for pay.**
There is no rehire-specific deadline anywhere in the Manual. Duplicate cases are permitted and rehire is the
Manual's own example of when to create one, with a 365-day duplicate alert and a requirement to close open
duplicates first. Federal contractors run the other way: an employee already confirmed and continuing in
employment is exempt and **must not** be re-run.

**Background checks: I was wrong about this on 26 Aug, and the correction helps.** I said a prior check is very
unlikely to be reusable. **Federal law imposes no shelf life on a delivered report**, and the FTC's 1998
advisory opinion to James says FCRA does not require a fresh disclosure and authorisation for each report,
because a blanket authorisation is valid. FCRA section 605 limits the age of adverse information inside a
report, not how long a report may be relied on.

**So the constraint is not federal law. It is three other things.** The scope boundary, because the FTC bounded
blanket authorisation to the consumer's tenure of employment and never said what happens after separation,
which leaves a former employee's authorisation in untested space. State law, and **Massachusetts closes it
outright**: a CORI acknowledgement is valid one year or until employment ends, whichever comes first, so a
former employee's authorisation has necessarily lapsed. California's ICRAA frames authorisation in the singular
with no blanket-authorisation counterpart, so evergreen consent is untested there too. And employer policy,
which is where the operative rule actually lives.

**The product consequence.** The check is not a legal blocker on fast rehire. **It is a per-customer policy
variable**, so it is a configuration field, and the honest product claim is "we apply your policy and we show
which one applied", never "we skip the check". No published retailer policy was found. The only concrete shelf
lives located anywhere are university policies: 31 days at Florida State, twelve months at Brandeis, one year
at Kansas State.

**And one finding that inverts an intuition.** California caps the lookback for investigative consumer reports
at seven years from disposition, release or parole, measured to the report date. **A fresh check can lawfully
return less than the old one did.** Any rehire flow that assumes newer means more complete has it backwards.

### The size of the population. VERIFIED 26 Aug 2026, and it is smaller than I claimed

**Retraction.** I wrote that roughly 19% of grocery hires are returning workers and called one in five not an
edge case. **That figure is from a Ceridian/Dayforce vendor blog**, built on 850,000 records volunteered by its
own clients through an optional feature, with no sampling frame and no years attached. Withdrawn. The 21% and
24% figures from the same source go with it.

**The best primary measurement says roughly 9%, and retail is below average.** Census Quarterly Workforce
Indicators put recall hires at **8.9% of retail hires in 2024** and 8.5% in 2023. Retail sits below all private
industry at 12.7%, and below construction, transportation and warehousing, health care, manufacturing and
accommodation and food services. **And retail does not spike in Q4**, which kills the seasonal-returner
hypothesis I built on top of the wrong figure.

**QWI is a lower bound**, because it sees returns only within four quarters. Fujita and Moscarini put QWI recall
at about 17% of all hires against roughly 40% of completed jobless spells ending in a return in survey data. How
much of that gap applies to retail is unknown.

**The one peer-reviewed retail study is the least encouraging source of all.** Arnold and colleagues, Journal of
Management 2021, in a US retail chain: rehires were **4% of manager-trainee placements** and 5.9% of
outside-sourced hires. **And rehires turned over more than either comparison: 36.6% against 33.5% for external
and 20.9% for internal.** On par in year one, improving less over time. Only those who had left voluntarily
outperformed in year one.

**One finding does support the design, and it is the timing.** Mean time away in that chain was 1.77 years,
n=1,317. **The centre of the distribution sits inside the three-year window.** The paper publishes no
percentiles and the standard deviation of 1.86 is large, so a substantial minority will be outside it.

**The highest retail figure is first-party, and it is one retailer for one season.** Macy's head of talent said
33% of recent hires for the 2024 holiday season were former colleagues returning. An executive statement rather
than audited data, but first-party, and it suggests the variation between retailers is very large.

**Nishant's instinct was closer to the data than my enthusiasm was.** Rehire is a meaningful minority of retail
hiring, not a core flow. What survives is the **value** argument: a returner is still the cheapest and fastest
hire available, the timing centres inside the legal window, and nobody has been found doing it. **What does not
survive is selling it as a quality play**, because the only peer-reviewed retail evidence says rehires quit more
than external hires.

### What this does to Q-032 and D-020, and it is not free

Q-032 concluded that exactly one thing must come over from the old applicant tracking system: the
not-eligible-for-rehire flag. **That is no longer the ask.** Reading a full prior employment record, including
training completion and attendance, is a much larger read than one boolean, and it is the hardest kind of read
for a connector layer to get. D-020 made us a connector rather than the system of record, so we are asking a
retailer's incumbent system for its richest data about its own former staff. That is the single most likely
place this design gets refused, and it should be tested in a conversation before it is designed.

**Status.** The direction is Suniras's call and it is made. What is open is the legal boundary and the
population size, both in verification. **Nothing here blocks the problem statement**, and it strengthens it,
because it converts a compliance feature into a speed feature.

---

### Q-042. The employment freshness lookup is out. What did the buyer actually want? ANSWERED AND REOPENED 26 Aug 2026

**The feature is dead, and not for the reason we thought.** Joy's proposal was to find where a candidate works
now, because the last employer on a resume is often stale. Q-040 established that LinkedIn offers no route to it.
The re-verification found two further reasons, and the second one is the real one.
01-diagnosis/verification-2026-08-26b.md.

**Reason one: no API exists anywhere on LinkedIn that takes a named person and returns their employer.** Not
partner-gated, absent. Established route by route in Q-040.

**Reason two, and this is the finding that matters: doing it for an employer makes us a consumer reporting
agency.** The FTC's own commentary in "40 Years of Experience with the FCRA" draws the line in the worst possible
place for a product. Comment 603(d)-1: a communication to an employer about an applicant from a source that is not
a consumer reporting agency, such as a prior employer, is **not** a consumer report. Comment 603(o)-2: **a vendor
doing the same thing on the employer's behalf is a screening service, and a screening service is a consumer
reporting agency.**

**So the identical lookup is unregulated when the employer does it and regulated when we do it for them.** The
research found no route by which a vendor can sell an employer a candidate's current employer for a hiring
decision and stay outside FCRA. Building the feature does not mean adding an integration. It means taking on
permissible-purpose certification, standalone disclosure, written authorisation and the two-step adverse action
sequence, for every lookup.

**Reason three: the data is not there for our people.** Public-profile enrichment is the only category that
advertises knowing where somebody works now. SeekOut, hireEZ, LinkedIn Recruiter, Apollo, Clay, over a billion
profiles. It is an outbound sourcing tool for professional and technical hiring, **and frontline hourly workers
are largely absent from those datasets.** None of the five major applicant tracking platforms resells it.

**And nobody in the market does this.** Asked plainly whether Fountain, Paradox and Workday, iCIMS, Greenhouse or
SmartRecruiters advertise determining a current employer from third-party data, the answer is that none of them
do. Fountain's integration taxonomy has no enrichment category at all. **Greenhouse's own FAQ affirmatively rules
third-party data out.** What they all use instead is self-reported application data and parsing of the
candidate's own resume, neither of which verifies anything, plus employment verification bought as a priced
add-on when a role warrants it.

**The economics close the door even if the law and the data allowed it.** Checkr publishes $12.50 for a
current-employer verification. Equifax's The Work Number is about $105 to $109 per verified match, **three to
four times the entire criminal-only screening package used for hourly roles.** The instant capability exists and
works. It is priced for mortgage lending, not for hiring forty thousand associates a year.

**One honest gap, and it is the one that would matter if anybody wanted to revisit this.** Nothing on point
exists for the narrow version, where the output is limited to the current employer's name. No enforcement action,
no advisory opinion, no rulemaking, no appellate holding either way. **The narrow feature is genuinely uncharted**,
which is a reason for caution rather than an opening.

### The part that is genuinely open

**If this capability is not what the buyer wants, what were they asking for?** Joy raised it because resumes go
stale, and staleness is a real problem. The candidates for what actually sits underneath it:

- **Identity.** Is this the person they say they are. Different problem, different vendors, and it is a real one
  in high-volume hourly hiring.
- **Right to work.** Already decided: D-022 makes I-9 and E-Verify an embedded vendor.
- **Rehire eligibility.** Q-037, and it is the one where the data is genuinely ours to read because it lives in
  the customer's own system rather than in a third party's.
- **Nothing.** It may simply have been a feature idea from a market where the data supply is different.

**Who answers it.** A practitioner, in one question: when you look at an application, what do you not believe?
Worth adding to the Q-036 conversation. Filed rather than guessed, because the honest position today is that
**the capability is a solution looking for a problem in this segment.**

**What is settled.** The feature is out. It was already out under D-009 and D-024, and this adds three
independent reasons it would have failed even if it had been in scope. Nothing here needs a new decision.

---

### Q-034. Is contingent and on-demand staffing in scope, or a different product? RAISED 25 Aug 2026

**Where this came from.** Joy specifically asked us to double-click on contingent hiring, meaning temporary
and short-assignment staffing rather than permanent hires. He pointed at how the industry changed before and
after COVID, and named Beeline as the reference vendor. Note that the transcript renders this as "Vline" and
the machine summary wrote it down as "Vline AI", which is not a company. See Q-040.

**The part that is genuinely interesting.** Reputation and credentialing. If a worker has done short stints
across several employers, that history is a signal: attendance, punctuality, conduct, and references from
past placements. Joy said this carries very high weight in medical and nursing and is debatable for cashier
work.

**Why it is worth a question rather than a straight no.** It is the only item in Joy's list that is not
already excluded by D-009, D-010 or D-020. It is not attract, it is not a management capability, and a
reputation record is a connector-layer read rather than a system of record. It also touches something our
own funnel map treats as a dead end: what happens to a candidate who was good but was not hired this time.

**Why the answer is probably still no for v1.** D-024 recorded that Joy's material describes a different
product with a different buyer. Contingent staffing is bought by a different function, is usually mediated by
staffing agencies, and pulls us toward the marketplace model that D-020 rules out. And a credentialing layer
needs data from employers who have no reason to give it to us.

**Who decides.** Suniras. Not urgent, but it needs an answer rather than silence, because Joy asked twice and
Nishant relayed it twice.

---

### Q-032. What must come over from the old applicant tracking system? PARTLY ANSWERED BY NISHANT 26 Aug 2026

**Nishant's answer, in his words.** "I'm not sure for smaller players but for big players like Walmart and
Target and flipkart/amazon, it always sticks in their database. For example if I go and join Target again or
Flipkart again, they'll pretty much have all my information: my previous employee ID, PAN card, Aadhar card if
it was available, stuff like that. For smaller retailers I am not fully sure."

**The useful part, and it lands on the right side of our ICP.** He is confident the full prior employee record
persists at large retailers and unsure about small ones. **Our target is retailers above $2B revenue**, which is
exactly the segment he is confident about. So the asymmetry he flags does not bite for us, and the rehire read
that Q-037 depends on has data behind it at the companies we are selling to. That is the single most useful
thing anybody has told us about Q-032.

**Three caveats, and the second one is the one that matters.**

**One. His examples are Indian.** PAN card and Aadhaar are Indian identity documents and Flipkart is an Indian
company. The US equivalents are the Social Security number, the I-9 identity and authorisation documents, and
the W-4. Retention practice is governed by different rules, so the intuition is sound and the specifics do not
transfer.

**Two. The employee record persisting is not the same as the Form I-9 persisting, and the I-9 is the one that
unlocks the shortcut.** US employers may destroy an I-9 three years after hire or one year after employment
ends, whichever is later, E-080. Many deliberately purge at the deadline, because retaining an I-9 longer than
required keeps it inside the scope of an audit. **So the personnel record can survive while the specific document
that makes a fast rehire legal has been destroyed on purpose.** A retailer answering "yes we still have all their
details" may be talking about the employee master record and not about the I-9. That distinction has to be put
explicitly to whoever answers this next, because the two questions sound identical and only one of them is the
one we need.

**Three. Existing is not the same as readable by us**, and that was always the real question here. Under D-020 we
are a connector layer asking a retailer's incumbent system for its richest data about its own former staff.
Nishant answered whether the data exists. He did not answer whether an outside system can read it, at what
granularity, or through what interface. That remains the most likely place this design gets refused.

**What changes.** This stops being a research question and becomes a question for a customer or for the Q-036
conversation. Tier: assumption, because it is a colleague's belief about what retailers' systems hold rather than
anything observed, and he flagged his own uncertainty, which is good hygiene.

**And the scope of the ask has grown since this question was written.** The original conclusion was that exactly
one thing must come over: the not-eligible-for-rehire flag. Under the Q-037 reframe the ask is the prior
employment record including training completion and attendance. This entry needs rewriting around that larger
ask rather than the single boolean, and that rewrite is pending the answer to caveat three.

**Original entry from 18 Aug follows.**

### Q-032 as written on 18 Aug: what must come over from the old applicant tracking system? MOSTLY DISSOLVED

**D-020 removes most of this question.** As a connector we do not ask anybody to leave their applicant tracking
system, so there is no cutover and nothing to migrate. The export problem that made this blocking on 16 Aug is
gone.

**One part survives, and it is the part that always mattered.** The do-not-hire list. A connector still has to
read it, because the whole point of that list is catching a NEW application, and Nishant confirmed in the second
meeting that this belongs in an exception-handling bucket with a central candidate database behind it. Reading a
flag through a connector is a much smaller ask than exporting a candidate history, so the question shrinks from
"can they export everything" to "can we read the rehire flag".

Still worth asking a Target contact, and it is question 5 on the short list in shared/QUESTIONS-FOR-TARGET.md.

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

**UPDATE 25 Aug 2026: this question now has more than one model in it, from Joy via Nishant.** All of it is
second hand and none of it is verified, so it is a list of options to check rather than facts. It is recorded
because the question as written above only ever contained one model, per hire, and spent its whole length
explaining why that model is dangerous. Knowing there are alternatives changes the shape of the answer.

- **Placement commission.** Joy's figure is 4 to 8% of annual pay, with the Indian agency standard being one
  month of salary, which is roughly 8%. High in dollar terms in the US even at the same percentage.
- **Commission plus insurance.** Some vendors charge nothing at all for the hiring software and make their
  money as the employee insurance provider, because insurance margin is larger and it recurs. Joy said that
  bundle is what lets others charge 14 to 15% commission. He named Zenefits and Gusto. Both are real payroll
  and benefits platforms, and Zenefits was acquired, so neither is a live standalone comparable without
  checking.
- **Per unit cost, which is the input side rather than the price side.** Joy's cost checklist: per minute
  pricing on AI calls, screening cost, resume parsing cost, third-party integration cost, lead generation and
  cost per conversion. He also said the cost of processing a single application is low relative to the
  commission earned. **This is the one part of his material that lands squarely inside our scope**, because
  the demo has a voice screening step and we have never costed it. Recorded in D-024.

**Note the trap.** Commission per placement is a per-hire model, so it fails the same test the top of this
question fails it on. If retention improves, placements fall, and revenue falls with them. The insurance
bundle is the only one of the three that does not, because it is priced per employed head rather than per
hire, which means it earns more when people stay. That is worth thinking about properly rather than filing.

**Still deferred, still Suniras's, still reopens the day a commercial conversation gets drafted.**

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

**UPDATE 24 Aug 2026: the Target route is closed.** Nishant could not arrange the conversation with his
colleagues in hiring at Target. That was the only named route that existed, and it was carrying seven facts
nothing published answers: the handoff count, the elapsed time from application to first shift and its spread,
the split between time that cannot be compressed and time nobody owns, which steps run in a system rather than
over email, the rehire control, who owns time-to-hire, and how many stores one field HR person covers.

**UPDATE 25 Aug 2026: the internal route is confirmed exhausted, and one new route opened.**

Nishant said plainly that he has no practitioner connections of his own. On the people around him: "folks
around me are a bit limited over here." On sitting next to Joy and Anuj: "black hole, I don't know why."
So this is not a matter of him not having got round to it. The internal network does not contain the person
we need, and the Target attempt was the whole of it.

**The new route is Anuj Jain, and it is the best one so far.** He was in the USA a couple of months ago
meeting clients, and his PRD came out of those meetings. He is inside Nurix so he does not count toward this
question's own gate of five outside people, but he is one hop from people who do. Filed separately as
**Q-036**, with the four things to ask him. Nishant offered to carry questions: "let me know which questions
are those, we can continue conversation."

**And the conversations on 25 Aug do not count toward this gate.** Anuj and Joy are both NuPlay colleagues.
The count of people outside Nurix who have described this pain to us is still zero. Worth stating because the
dump reads like domain knowledge and is not, and a folder full of internal notes can quietly start to feel
like discovery.

**Four research runs have now failed on the timing questions.** The fourth went after them specifically. This
is not a gap in the searching, it is a property of the market: no retailer gains by publishing it and every
vendor gains by quoting an unsourced version of it.

**The options are written out in 03-discovery/practitioner-routes.md**, with what each costs and what it
returns. The route that has never been tried is **former** employees rather than current ones, because a
current employee discussing internal process with an outside vendor has a confidentiality problem and a
former one does not. That is also the most likely reason the Target route failed, which matters, because it
predicts which of the other routes work.

**Still Suniras's decision, and now it needs a date.** Going without is legitimate, but the three consequences
have to be accepted explicitly: no success metric can carry a real baseline, the first deployment carries the
measurement burden, and the tier 1 ranking rests on inference rather than observation.

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

### Q-040. Are Greenhouse, the LinkedIn API and Beeline being described accurately? RAISED 25 Aug 2026

**Three factual claims from the 25 Aug call that look wrong, and each one would send somebody down a wrong
path if it got copied forward.** None of them is load-bearing today. All three are cheap to check and worth
checking before any competitive map or integration plan uses them.

**One. Greenhouse was described as a candidate-side aggregator.** The claim was that candidates already have
their resumes on Greenhouse, that it tells you which candidates are looking and where, and that you can post
jobs to it. Greenhouse is an applicant tracking system sold to employers. It does not hold an open searchable
candidate pool that other employers browse. The machine summary of the same call says "Greenhouse is an
aggregator/ATS, not a direct competitor", which puts two different things in one phrase. **If a competitive
map gets built on the aggregator reading it will be wrong about both what the competitor sells and who they
sell it to.**

**Two. "Any recruiter can access LinkedIn APIs" is REFUTED, 26 Aug 2026, and it is worse than gated.** Full
detail in 01-diagnosis/verification-2026-08-26.md.

**The Job Posting API is closed to new partners.** New applicants are redirected to Apply Connect. Access
requires being a LinkedIn-approved developer meeting undisclosed criteria, under a data-restricted API agreement
negotiated through a LinkedIn relationship manager. **Only three consumer-scoped permissions are self-serve for
any developer**: profile, email and w_member_social. Every Talent Solutions program needs explicit approval, and
LinkedIn does not commit to granting it. Reading applications and scoring them inside a product through Apply
Connect additionally requires **the customer** to hold a paid Recruiter Corporate or Recruiter Professional
Services licence. Job Wrapping is a LinkedIn-side service sold through an account manager, not an API.

**There is one free route and it cannot be sold as reliable.** An XML feed for Basic Jobs, free to ingest and
host, but LinkedIn **explicitly refuses to guarantee ingestion**, there is no external test environment, and
feed-ingested Basic Jobs get materially worse distribution than paid Job Slots.

**The consequence is bigger than the feature.** The freshness lookup that finds where a candidate works now was
the mechanism underneath the entire skill-graph proposal. **It has no supply.** That does not narrow the idea, it
removes its foundation.

**RE-VERIFIED INDEPENDENTLY 26 Aug 2026 on Suniras's instruction. The finding holds and understated the case.**
Full detail in 01-diagnosis/verification-2026-08-26b.md.

**More is closed than the Job Posting API.** Apply with LinkedIn is closed to new partners and has been since
September 2023. The Sales Navigator Application Platform is closed. LinkedIn Referrals has been closed since
March 2018. Easy Apply is fully deprecated as of release 202603. Talent Hub was retired on 31 December 2024.

**One correction against me: "no self-serve path" was too absolute.** Three self-serve things exist and none
solves the problem. Free manual posting in the interface, which is one active post at a time for 14 days with an
application cap around 10 to 30. Job Wrapping, where setup can be self-serve but **the customer must own paid
Job Slots** and the vendor gets no API. And Member Data Portability, which is genuinely request-access but
returns **only the consenting member's own data and only in the EEA**.

**The lookup itself does not exist by any route.** Established one by one: Profile API position fields are
partner-gated and scoped to the authenticated member, so they return the user's own employer and nobody else's.
The People Search API was withdrawn years ago. Sales Navigator Profile Associations returns a profile URL, a
member URN and a photo, with **no employer and no title**, and needs CRM Sync plus SNAP partnership which is
closed. Talent Solutions shows candidate data only for a paying Recruiter customer's own candidates.

**And the important finding turned out not to be about LinkedIn at all.** See Q-042.

**One gap.** LinkedIn publishes no price for any Talent Solutions programme, nor list prices for Recruiter
Corporate, Recruiter Professional Services or Job Slots. All quoted by sales. The only cost statement in its own
documentation is that Basic Jobs ingestion is free.

**Three. "Vline AI" is not a company. The name is Beeline.** Nishant's own written notes say Beeline. The
transcript renders it as "V lining" and the machine summary wrote down "Vline AI mentioned as a reference
startup". Beeline is a long-established vendor management system company in contingent workforce, not an AI
startup, so the description is probably wrong as well as the spelling. Anybody researching "Vline AI" finds
nothing. Also in the notes and absent from both retellings: **Simplify VMS**, named next to the resume parsing
item, which is a second real product name worth a look.

**Who answers it.** Claude can check all three from public sources in one pass. Filed as a question rather
than done immediately because none of it changes a decision today and D-023 closed the research runs.

**What would make this urgent.** Any of these three entering a document, a deck or an integration list.

---

### Q-039. Should staffing forecast visibility be in scope? RAISED 25 Aug 2026

**Where this came from.** Nishant, on 25 Aug, thinking out loud about warehouse staffing and management
visibility. The analogy was Flipkart's Big Billion Days, where finance, staffing, incentive planning and
demand forecasting get discussed across multiple years. His question was how you turn that forecast
visibility into week on week staffing and hiring decisions. He also noted that Walmart and Amazon are public
companies that announce seasonal hiring numbers, so those announcements are a readable industry signal about
when the sector is gearing up.

**He labelled it himself.** "Again making things up." Recorded that way on purpose.

**Where it lands against existing decisions.** D-010 makes management-role capability an explicit non-goal
for v1, and a forecast-to-headcount planning surface is squarely a management capability. D-021 already
decided the declining seasonal trend is not a blocker. So most of this is already out, and the honest answer
is probably "yes, later, and not in v1".

**The one part worth keeping.** The public seasonal hiring announcements are real and free. They are a
demand signal we could read without any customer data at all, which is unusual in this project. Whether that
is a product feature or just a sales input is the actual question.

**Who decides.** Suniras, and it can wait. Raised so it does not resurface as a surprise scope request.

---

### Q-038. Does Anuj's PRD cover through to close, or stop at offer acceptance? RAISED 25 Aug 2026

**The discrepancy.** Nishant, relaying Anuj: "He also talked about key hiring cycle. Go to close that hiring.
Not just attract part of thing." Our read of all sixteen documents in his repo is that the product ends at
offer acceptance, which is written up in 02-landscape/anuj-prd-assessment.md. Two of our three proposed tier 1
steps sit past that point, so this is not a trivia question.

**Per D-003 the documents win over a recollection.** So the assessment stands as written. This stays open
because there are two innocent explanations and they have different consequences. Either Anuj did the
downstream thinking and did not write it down, in which case asking him is worth doing and folds into Q-036.
Or Nishant is describing intent rather than content, in which case the gap between his understanding of the
work and the work itself is worth knowing about before anybody presents from it.

**Who answers it.** Nishant or Anuj, and it is one question inside the Q-036 conversation rather than a
separate errand.

---

### Q-029. Has Workday acquired Paradox, or not? ANSWERED 11 Aug 2026

**Yes. Workday owns Paradox, for $1.1 billion.** Announced 21 August 2025 in Workday's own newsroom, completed 1 October 2025, and the consideration is disclosed in Workday's 10-Q for the quarter ended 31 Oct 2025: $1.1 billion total, $1.0 billion cash, plus a $20M equity interest Workday already held. **Corrected 25 Aug 2026, having previously recorded the price as undisclosed.** Expected to close in
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

