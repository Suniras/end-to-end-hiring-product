# Meeting pack: Nishant, 10 Aug 2026

**Internal. Contains client names. Do not reuse externally.**

Prepared 9 Aug 2026. Sections 1 to 6 are written by Claude and are research, decisions already recorded, or
factual decomposition. **Sections 7 and 8 are blank and are Suniras's to write.** They are the problem
statement and the customer definition, and a version written by Claude would be worthless as a signal of
what Suniras actually thinks, which is the only thing this meeting can usefully establish.

Questions for Nishant are in QUESTIONS-FOR-NISHANT.md.

---

## 1. Read this before anything else

**The research has just challenged the project's core premise, and that is the most important thing to say
tomorrow.**

A six-angle research sweep ran today on the question "why has US retail frontline hiring not been fixed."
Every finding was then audited by a separate agent instructed to refute it and to fetch every source. The
audits found real errors in the research, which is why the surviving findings are worth something.

The headline: **store managers and central talent acquisition describe different problems, and the industry
sells to the one that is not binding.**

Central TA describes latency. A named 7-Eleven talent leader is quoted saying they could not reach people
fast enough and candidates were hired down the street first. That is exactly what Fountain, Paradox and Cue
are built to fix, which is why speed tooling keeps being bought.

Store managers, who actually do the hiring, describe something else entirely. In their own reviews they say
they needed more employees but could not hire because they were not given enough payroll hours, that they
work alone because of the hours allocated each week, and that pay makes roles unfillable. **None of them say
applications were too slow.**

If that holds, then hiring speed is not the binding constraint at store level. Payroll-hour allocation and
wage floor are. And a product that makes hiring faster would improve a number nobody at store level is
short of.

Supporting this from a separate angle: across the verticals where churn genuinely fell, the mechanism was
never hiring software. It was wages or schedule stability. California's fast-food wage floor cut
separations. A Gap Inc. randomised trial found schedule stability raised sales about 7%. Referrals cut
quits. Amazon's answer to very high warehouse turnover was raising pay and deleting the resume.

And the sharpest line in the entire sweep: **every vendor claim in this category is about time-to-hire, and
not one claims tenure.**

**Two cautions before this is presented as settled.** The store-manager evidence is drawn from public
employee reviews, which self-select toward complaint. And one audit found that part of the practitioner
evidence had read distribution-centre and warehouse hiring as store frontline hiring, which is a different
funnel. So this is a strong signal, not a proof. It is exactly the thing five practitioner conversations
would settle, which is Q-001.

---

## 2. What we have decided, and the full reason for each

Eleven decisions are recorded in DECISIONS.md. The four that matter for scope:

### 2.1 Attract is out of scope

Three reasons, and the first one is the one that was missing when this was first written.

**The unique-data slot is already occupied.** NuAnchor works because it fuses the customer's own
sell-through history with external signals the customer does not have wired up: search interest, social,
live duty rates. The external half is what makes the output something the customer could not produce
themselves. For hiring attraction, the equivalent external slot holds local labour supply, competitor wage
levels and applicant availability by geography. That slot belongs to Lightcast, Indeed, LinkedIn Talent
Insights and ADP, companies whose entire business is that data. We would enter with less of it than they
have.

**The output is advice with no forcing function.** NuAnchor produces a purchase order, which is a document
the buyer is already obliged to produce, so the product slots into an existing obligation. Attract
enablement produces a recommendation to move spend between locations. Whoever receives it can ignore it and
nothing breaks.

**A customer spreadsheet is retrospective and non-exclusive.** It describes a past we did not observe, and
the applicant tracking vendor holds the same records. Being inside the hiring flow produces data that did
not exist before we were there: where a candidate dropped off, what they said, why they abandoned.

**What data would have been required**, since the question was asked specifically. To tell an attraction
team where to spend, you need per-channel outcome data joined all the way through: which source produced an
application, which of those completed, which were screened out and why, which attended interview, which
accepted, which turned up on day one, and which were still employed at 90 days. Joined across locations and
over at least one full seasonal cycle. Nobody hands that over in a spreadsheet, because in most retailers it
does not exist in one place. It only exists if you were in the flow while it happened.

**The counterargument, which is real:** land with low-friction analytics that need no integration, then
expand into the flow. A well-used go-to-market pattern. It turns on whether landing as a reporting tool gets
you into the flow or gets you budgeted as a reporting tool permanently.

**Reopens if:** we end up in the hiring or onboarding flow and accumulate that outcome data as a byproduct.

### 2.2 Management roles are a non-goal for v1

**Why.** Hourly and management hiring are different jobs done by different people on different timescales.
Hourly is volume and throughput, done by a store manager, in days. Management is a low-volume quality
decision made by a district manager who does a handful a year and cannot afford a bad one. A product serving
both well is two products wearing one name.

Korn Ferry's 2022 survey of 100-plus US retailers supports the split on behaviour after hire: 75.8% annual
turnover for hourly in-store against 17.7% for store managers. Those populations do not behave alike.

**The cost, stated plainly.** Management roles are where the money usually is. Store manager searches are
slower, cost more per hire, and hurt more when they fail. Excluding them means excluding the higher-value
half. That is the correct sacrifice for a v1 and it is not a free one.

**Reopens if:** Phase 1 finds the management bottleneck is the one that actually costs retailers money and
that fixing hourly hiring does not relieve it. Q-023 sits on this line and is currently unsupported on 2025
data rather than dismissed.

### 2.3 Nothing from NuAnchor transfers to the product

Domain logic transfers at zero. Patterns are copyable by any competitor so reusing ours puts us ahead of
nobody. Craft affects how this project runs, not what it builds. Platform is the only tier that could be a
real head start and that is a Phase S1 engineering decision against NuStack and NuPlay, not a product one.

### 2.4 Phase 1 runs on second-hand evidence

By choice, to keep moving. The cost is that the Phase 1 gate as written cannot be passed, because it
requires a US retail TA leader recognising the problem in their own words. Everything in the diagnosis
carries an assumption label until then.

Worth being straight about this in the meeting rather than letting it be discovered.

---

## 3. Competitors, from today's research

Verified where marked. Vendor marketing is never treated as verified.

### 3.1 CORRECTED 10 Aug 2026, read this before using section 3

A full technical teardown of Fountain and Paradox already existed in the repo and I had not read it when I
wrote the first version of this section. It is far better sourced than my web research: it reassembled 1,962
files from Fountain's own production source maps, which ship unauthenticated.

**Three things I had here are now withdrawn or downgraded. Do not say them.**

| What I had | Status |
|---|---|
| Workday now owns Paradox and HiredScore | **Withdrawn pending check.** The teardown, dated Aug 2026, treats a Workday acquisition of a conversational hiring layer as a future risk to Paradox rather than a completed event. One source is wrong. Q-029 |
| Fountain resells its AI Recruiter from another company | **Withdrawn.** The teardown finds Fountain's own shipped model configuration and a 2023 acquisition of a conversational AI company. Not supported |
| Fountain's engine is linear and per-opening; its pricing meters applicants and locations with guaranteed uplifts | **Downgraded to tentative.** Both came from review sites. Fountain has no public issue tracker or forum, so every user-complaint claim from that route is capped at tentative, and my review search returned results contaminated with a different product |

Full detail in 02-landscape/fountain.md and 02-landscape/paradox.md.

### 3.2 Three Fountain weaknesses that do hold up

**They published the category's trust problem themselves and did not answer it.** Fountain commissioned a
survey of 1,014 US frontline workers in June 2026. It found 62% of applicants report being ghosted, with
unexplained AI screening rejections among the top complaints. Their own ethical-AI page names zero compliance
frameworks, zero methodology, zero audit cadence and no third-party auditor, and their stated mitigations have
no matching endpoint anywhere in 575 published paths or 127 live agent tools.

This is the strongest thing available because every part of it is their own material. You are not asserting
they have a trust problem, you are quoting their survey and noting the absence.

**No certified integration with the systems retailers actually run on.** Marketing names ADP, Workday, UKG and
SAP. The documentation covers HRIS sync as a two-paragraph do-it-yourself webhook pattern, with no named or
certified connector in a 593-page index. The teardown struck the word "certified" from its own findings for
lack of evidence. For retail, where the applicant tracking system is the system of record, "build your own
webhook" is not an answer an IT function accepts.

**Gartner placed them in the lowest quadrant.** The 2026 Magic Quadrant inclusion that gets promoted heavily
is a Niche Player placement, first-ever inclusion, lowest of four. Worth raising because CLAUDE.md says
"recognised in the 2026 Gartner MQ" without saying where, and Nishant may have the same impression.

### 3.2b Two corrections to our own scope thinking

**Fountain is not an ATS, and treating it as one is a category error.** It publishes 575 endpoints. The hiring
ATS is 108 of them, under a quarter. The twelve post-hire services carry about 467. One attendance service
alone is 81 endpoints. Its internal navigation names about twenty products.

So a v1 scoped as applicant tracking gets benchmarked against the wrong thing.

**Activate is not open ground.** Both incumbents are already building the retention half and neither markets
it. Fountain's post-hire surface is four times its hiring surface. Paradox has unmarketed routes for
microlearning, employee recognition, employee rewards and employee chat. That is our activate stage.

### 3.2c The finding that is now double-sourced

**Quality of hire is unclaimed by both incumbents.** Every Paradox case-study metric in the teardown corpus is
speed or cost. Not one is quality of hire, retention or 90-day attrition.

That independently corroborates the separate web research finding that every vendor claim in this category is
about time-to-hire and none claims tenure. Two unrelated methods, same conclusion. This is now the
best-supported finding in the project.

The teardown adds the caution that matters: it is unclaimed **because it is hard to prove**. So it is an
opening and a trap at the same time, which reinforces section 6.

### 3.3 The competitor nobody lists

Doing nothing. A store manager with a stack of applications and a phone. Given section 1, this competitor is
currently winning for a rational reason.

### 3.4 What the accountability layer actually looks like

Relevant because it cuts against the assumption that regulation forces adoption of auditable tools.

New York City's bias-audit law produced a small number of published audit reports relative to the number of
covered employers, and the research found no study of retail among them. Colorado repealed its
algorithmic-discrimination duty before it took effect. HireVue removed facial analysis after finding it
contributed a fraction of a percent of predictive power.

So the compliance obligation exists and the enforcement pressure is weaker than the statute suggests. That
partly supports the decision to defer compliance work, and it also means compliance is not a moat.

---

## 4. What the three stages actually contain

Factual decomposition, because "hire, onboard, activate" is three words hiding about fifteen steps. This is
not a scope proposal.

### Hire

Application completion. Screening. Scheduling an interview. Interview attendance. Offer. Background check
clearance.

Six sub-stages, each with its own drop-off, each potentially owned by a different person.

**On re-engaging aged candidates**, which was asked specifically: yes, it belongs here rather than in
attract, and it is worth noticing why. Candidates already in the applicant tracking system are people we can
reach without buying any advertising. That is attraction using data that sits inside the flow rather than
outside it, which is exactly the test D-009 set. So re-engagement may be the one piece of attract that
survives the decision to drop attract. Worth deciding deliberately rather than inheriting.

One caution from the pilot discussion: calling someone who applied weeks ago is a different act from
screening someone who applied this morning, and response rates differ.

### Onboard

I-9 employment eligibility verification. Tax forms. Direct deposit. Background check and drug screen
clearance where applicable. Uniform and equipment. Availability capture. Required training modules. System
and badge access. Work permits for 16 and 17 year olds.

**The instinct that this is one thin flow is probably wrong.** It is a checklist with legal gates, and it
spans the point where an accepted offer either becomes a person at work or evaporates. If the largest leak
in hourly hiring is between offer and day one, then onboarding is not a small stage, it is where the money
is. That is currently a hypothesis and it needs the funnel numbers in Q-025.

### Activate

First shift scheduling. Manager introduction. Training completion. Early check-ins through the first 90 days.

Also not one flow, and this is where the research bites hardest. If 90-day retention is driven mainly by
wages and schedule stability, then activation is the stage where a hiring product has the least control over
its own success metric. See section 6.

---

## 5. What is missing from the hire side

Things no source in this project has covered, listed because absence is easy to miss.

- **Assessment.** Whether any skills or behavioural assessment is used, and by whom.
- **Compliance-driven candidate communication.** Notices, consent, opt-out to a human path.
- **Multi-language.** Unifi shipped English only with Spanish as a future contractual right. US retail
  cannot defer that the same way.
- **A non-voice path.** In US hiring this is an accessibility obligation rather than a feature.
- **Fraud and duplicate applicants.** Named as an unaddressed Fountain complaint, which makes it a candidate
  gap rather than an afterthought.
- **The handoff into workforce scheduling.** Someone hired but never scheduled has not been hired.

---

## 6. The metrics problem, and what would have to be true

The three metrics that matter to a buyer are time-to-fill, day-one show rate and 90-day retention. Suniras
asked how we can solve for them. This section deliberately does not answer that, because the honest answer
is that nobody can until the diagnosis says where the loss is. What it does is set out what each metric is
made of, so the answer can be reasoned rather than guessed.

**Time-to-fill is not one number.** It is the sum of six sub-stage durations from section 4. Improving it
requires knowing which sub-stage holds the delay, and that differs by role and probably by retailer. A
product that speeds up screening when the delay is in interview scheduling moves nothing.

**Day-one no-show has causes, and they are not all addressable.** A competing offer, a forgotten shift, a
transport problem, a better schedule elsewhere, or a decision made and never communicated. Some of those a
product can act on and some it cannot. The split matters, because claiming the whole metric means claiming
causes we do not control.

**90-day retention is the dangerous one.** Today's research says retention responds to wages and schedule
stability, with named studies behind both, and that no vendor in this category claims tenure improvement.
There is also a reported case of a major chain whose turnover rose during the first full year an AI hiring
tool was live, which needs verifying but is exactly the kind of fact that ends a sales conversation.

**So a warning worth carrying into the meeting.** If we adopt 90-day retention as a success metric, we are
promising to move something largely driven by pay and scheduling, which we do not control. The result would
be either an unmet promise or an unfalsifiable claim. That does not mean ignoring retention. It means being
precise about which part of it a hiring product can own, and saying the rest out loud.

The one thing today's research does suggest is worth investigating: constraining store-manager discretion
appears to matter. Research across service-sector firms found that managers given a validated screen and
freedom to override it overrode it systematically and hired worse, and firms kept the override anyway. One
audit flagged that this study may not be about retail store jobs specifically, so it needs checking before
being relied on. But if it holds, it points somewhere uncomfortable and interesting: the value may be in
removing discretion rather than in adding speed, and the person whose discretion you would be removing is
the person who has to adopt the tool.

---

## 7. The problem statement

**BLANK. This is Suniras's to write, and Claude has declined to draft it.**

The reason is not procedural. CLAUDE.md names the problem statement as the first thing Claude must never
produce first, and the reason is that this document exists to show Nishant what Suniras thinks. A problem
statement written by Claude tells him nothing he needs.

There is also a substantive reason not to write a detailed one tonight. Phase 1 opened today. Section 1 says
the premise may be wrong. A confident problem statement written now would be confidence we have not earned,
and it will not survive Nishant asking why.

**The smaller version, which is achievable tonight.** Instead of a full problem statement, write one
sentence of this shape:

> Which specific step, for which specific role, costs what, and to whom.

Not "hiring is slow." Something closer to: at this kind of retailer, for this role, the loss happens at this
step, it costs roughly this, and the person who carries the cost is this one.

If the honest version is "I do not yet know which step, and here is how I will find out," that is a
legitimate thing to present and it is stronger than a guess. Nishant will be able to tell the difference.

<!-- write here -->

---

## 8. Who buys, who uses, who blocks

**BLANK. Suniras's to write.**

What a good answer contains, in the abstract: a job title for each of user, champion, economic buyer,
technical evaluator and blocker, at a named or at least specifically described company, with a note on which
of them can kill it quietly rather than loudly.

What makes this hard here, and it is worth saying rather than hiding: a store manager has authority over how
their store hires but too few candidates for a tool to be worth their attention. Central talent acquisition
has the volume but no authority over what a store does day to day. Both are true at once. Q-027 asks whether
a level exists in between where volume and authority coexist, and that question is still open.

Section 1 adds a harder version of the same problem. If the store manager's binding constraint is payroll
hours rather than hiring speed, then the person who has to adopt this may not want it at any price, and the
person who wants it cannot make them use it.

<!-- write here -->

---

## 9. What is honestly presentable tomorrow

Not a finished problem statement. What we do have is a defensible position:

- Four scope decisions with reasons and reopening conditions, not preferences
- A research sweep that challenges the project's own premise, found and reported rather than buried
- Three specific candidate weaknesses in the market leader
- A named structural reason the category may be hard, with evidence
- A list of what we do not know, with owners against each item
- An honest statement that the diagnosis is one day old and built on public evidence by choice

A meeting that presents that is a better meeting than one presenting a confident problem statement built in
an evening. The second kind unravels under the first hard question.
