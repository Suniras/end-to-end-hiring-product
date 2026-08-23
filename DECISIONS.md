# Decisions

Every decision we make: the date, what we decided, why, and what would change my mind.
Newest first.

Always write the "what would change my mind" line. Months later it is the only way to tell whether
a decision still holds or whether the world moved.

---

## D-022, 18 Aug 2026: I-9 and E-Verify are an embedded vendor, not something we own

**What we decided.** In the meeting Nishant named the two compliance requirements as I-9 and E-Verify, and
answered the question of how we handle them himself: third-party tools already do the compliance checks, and we
integrate to them rather than replacing them.

**CORRECTED 18 Aug 2026, and this matters.** The transcript rendered a vendor name as "green light or something
like that" and I recorded it as GreenLight, a background check and I-9 provider. **That was wrong.** GreenLight
is a worker classification company. Its own site describes determining W2 versus 1099 status with legal logic
from Littler Mendelson, and it mentions I-9, E-Verify and background checks zero times. So either Nishant meant
a different company, or the transcript garbled a different name entirely. Either way GreenLight is not the
comparable and should not appear in a vendor conversation.

**The vendor that does answer the requirement is WorkBright.** Research on 18 Aug tested the whole field against
the one question that decides this: can an integrator read that a case is being contested and how many days are
left. WorkBright is the only vendor that publicly documents both, exposing a status enum, a deadline field, and a
tentative-nonconfirmation action field. Symmetry I-9 is WorkBright white-labelled under a commercial partnership
announced June 2025. Equifax Guardian exposes a due date and nothing about the contest. Checkr, Sterling, First
Advantage, HireRight and Fragomen keep it inside their own interface with no integrator surface. Detail in
01-diagnosis/research-2026-08-18.md.

**This closes Q-033.** That question asked whether we own E-Verify, embed a vendor, or leave it out. The answer
is embed, and it follows from D-020 rather than standing on its own.

**Why this is the right answer and not just the easy one.** Owning E-Verify means enrolling directly with the
Department of Homeland Security, passing a certification test against DHS-supplied test data, and then a
standing obligation to update our systems within six months of every new interface version, with access denial
as the stated penalty. It also means every retailer client signs a DHS memorandum as part of onboarding.
Embedding a vendor removes all of that.

**What still has to be true, corrected 18 Aug.** The mismatch state machine is the part that matters. Three
corrections to how I described it:

There are **three** clocks, not two. The third is DHS and SSA having ten federal working days from referral to
update the result, and DHS's own instruction is to check periodically, which means any workable design polls.

**There is no status that says "contesting".** E-Verify publishes six case results and none of them is a
countdown. The employer records the contest, and E-Verify confirms it indirectly through Case in Continuance,
which means the employee has contacted DHS or visited SSA. So enforcing the bar depends on state we write
ourselves plus a downstream signal, not on a single readable flag.

**Nobody publishes a push event** telling us somebody is contesting with N days left. Every design polls.

**One thing to design around rather than assume.** A vendor that says "business days" where DHS says "federal
government working days" will compute a different deadline on every federal holiday. At least one vendor's
documentation does exactly that.

**What would change my mind.** WorkBright turning out not to serve retail at scale, which would leave nobody
exposing the fields we need and force us to own the DHS relationship after all. Worth noting the barrier to
owning it is lower than I previously wrote: the six-month upgrade window runs from the date DHS notifies rather
than being a standing rebuild, and at least one release gave three months and required no acceptance testing.

---

## D-021, 18 Aug 2026: the declining seasonal hiring trend is not a blocker. Q-022 is closed

**What we decided.** Nishant's call, asked directly and answered directly.

Suniras raised the trend: roughly 450,000 seasonal retail hires in 2022 falling to about 100,000 fewer in 2023,
and asked whether that undermines the product.

Nishant said no, and gave two reasons for the decline. Economic pressure, with the same staff being asked to
manage more. And tighter rules, in his words that they cannot hire and fire a given number of people within
three months, so they hire fewer and incentivise existing staff with overtime instead. He was explicit that he
was reasoning rather than quoting, and both reasons are about how retailers respond to cost and regulation, not
about needing the capability less.

**His value proposition, in his words.** This product helps a large retailer hire four thousand people in ninety
days with seamless transitions between the steps. For a five billion dollar retailer the number might be five
hundred in a month. Either way the platform handles the scale, the volume, the transaction data and all the
handoffs. He also noted the same pattern holds in India at Flipkart and Reliance and at Amazon, so it is an
industry norm rather than a US anomaly.

**This closes Q-022,** which has been marked blocking since 9 Aug and was waiting on the 2026 NRF forecast. It
is now closed on a judgement call rather than on data, and that is worth being honest about.

**What it costs to close it this way.** The underlying figures still stand and they are not small: 442,000
seasonal hires in 2024 against a forecast of 265,000 to 365,000 for 2025, while holiday sales passed a trillion
dollars. If the decline is structural rather than cyclical, the addressable volume shrinks even though the
capability is still wanted. Nishant's answer is that scale handling is the value regardless of the absolute
number, which is a reasonable position and not a proven one.

**What would change my mind.** A 2026 forecast showing a third consecutive fall, which would make this a trend
rather than a soft patch, plus any sign that retailers are moving to a permanent smaller workforce with overtime
rather than a seasonal surge at all.

---

## D-020, 18 Aug 2026: we are a connector layer, not the system of record. This reverses D-015

**What we decided.** Suniras put the approach to Nishant in the meeting and Nishant accepted it: retailers above
two billion in revenue already run entrenched systems that would be difficult and expensive to replace, so
instead of replacing them we build connectors into whatever we ship, so nothing has to be torn out and the
customer still gets one place to run the whole thing.

Nishant did not argue with it. His immediate next question assumed it: which of the twenty steps have those
existing systems playing a large role, and which are just email and phone. Later in the meeting he confirmed the
same shape unprompted, describing Workday at Target as covering recruitment, training, appraisals, payroll,
security and IT training, and saying "we are only focusing on that hiring layer."

**So D-015 is reversed.** That decision, taken on 16 Aug, said we are the system of record and every applicant
is fed into our system. It is superseded, not deleted, because the reasoning in it is still the best statement of
what we are giving up.

**What we gain, and it is a lot.** D-015 recorded its own cost in full and every line of it now goes away. No
rip-and-replace sale. No IT, procurement, security review and CIO in the deal. No migration of years of
applicant history. No inheriting the record-keeping obligations of an applicant tracking system. And it puts us
back on the architecture Nurix has actually shipped in this domain, since the Unifi build was an overlay on
Avature across two instances. Under D-015 that precedent transferred nothing. Now it transfers directly.

**What we lose, and this is the part to keep visible.** D-015 had one genuinely strong argument behind it and it
dies with this reversal. If every applicant and every lifecycle event lived with us, we would eventually hold
the dataset that does not exist publicly, and the reason attract was ruled out in D-009 would stop applying.
As a connector we hold much less. We see events passing through rather than owning the record.

That matters because D-012 requires v1 to instrument the funnel it touches, on the grounds that no public
source has these numbers. A connector can still measure the handoffs it sits across, which is the thing we most
want to measure, but it cannot measure what happens entirely inside somebody else's system. The instrumentation
requirement survives in a reduced form and should be re-read with that in mind.

**Two consequences to work through rather than assume.** Being a connector makes the sale easier and the product
weaker at the edges, so the spanning view from D-013 is now doing all of the work rather than sharing it with
ownership of the record. And step 1, application capture, was ruled back into scope by D-015 specifically
because being the record meant owning the intake. That reason is gone, though Nishant separately said new
applicants should come in through a direct connector from the job portals, so step 1 stays in on his instruction
rather than on the old logic.

**What would change my mind.** A customer asking us to be their applicant tracking system, or a finding that
the connector surface at a given retailer is so closed that an overlay cannot see enough to be useful.

---

## D-019, 17 Aug 2026: the demo is built, and it reuses NuAnchor's design tokens rather than imitating them

**What we decided.** Suniras, 17 Aug: build a landing page first, like NuAnchor's, then click through to
the demo. Use NuAnchor's design language. Clean UI with none of the visual tells of AI-generated design.
Functionality must actually work.

Built at 06-validation/demo/. Opens on index.html, the overview page. app.html is the product, ten screens.

**The reuse is literal, and that is the point.** The NuAnchor demo pack in 00-context/nuaisle-v0.0/ carries
a comment saying its colour tokens were lifted from the live product at nuanchor.nustack.tech. Those exact
tokens, names and values are now in css/tokens.css, along with the two variable fonts extracted from the
same file. So this is the same house design language rather than a copy of its appearance.

**This does not reopen D-011.** D-011 says nothing from NuAnchor transfers at product level, and that still
holds: no domain logic, no data model, no architecture. What transfers is the visual system and the demo
form, both of which D-002 already records as the craft reference. A palette is not a product.

**The one idea worth carrying forward into the real build.** NuAnchor ships a dedicated agent purple that
is separate from its primary blue, so machine action and human action are different hues. The demo extends
that to four owners, taken straight from the automation breakdown: purple for a model, blue for a person
deciding, slate for deterministic software, amber for a fixed wait nobody owns. The colour system is the
analysis. That is worth keeping whatever else changes.

**What is real in it, because this is what Nishant will probe.** The twenty steps and their owners, the
business-day arithmetic behind every compliance clock, the refusal when somebody tries to remove a
contested new hire's shift, the state changes when you hire somebody, and the funnel maths. All running in
the browser. Every external system is simulated and labelled as simulated on screen, per D-018. The
retailer and every person in it are invented.

**What would change my mind.** Nishant asking for a live integration, or a design direction of his own. The
build is deliberately cheap to redo: no build step, no dependencies, and the tokens are one file.

---

## D-018, 17 Aug 2026: a demo for Nishant comes before the product. Everything external is simulated until it lands

**What we decided.** Suniras, 17 Aug. The near-term goal is a demo Nishant can see and criticise, not a working
product. No real connectors get built for it. Pricing is consciously deferred until after the demo, with Q-030
known and accepted as unresolved. The actual product build starts once the demo has settled what the product is.

**Why this is the right order rather than just expedient.** It is the house method. NuAnchor v0.0 was exactly
this: a working demo with three surfaces and a sales pack, shipped in weeks, shown before a full product
existed. D-002 records it as the craft reference. This is what "something to show" means at Nurix.

A demo also forces the two questions this project has dodged twice. A demo opens on somebody's screen, so the
primary user finally has to be named. And every scene shows a person not doing something they used to do, so
"what does this replace for the user" gets answered scene by scene.

And a demo is a discovery instrument. Cold practitioner outreach has produced nothing since 8 Aug. A concrete
thing to react to opens doors that a question list has not.

**The boundary that comes with it.** In the demo, every external system is simulated: payroll, workforce
management, identity, the background check agency, E-Verify, learning. Simulated means a faked state machine
over seeded data, honest about being fake when shown to Nishant, and never shown to a customer as live.

**Two clarifications recorded here because the integration map was misread once.**

We never replace payroll, workforce management or point of sale. Not in the demo, not in the product. Nobody
proposed that. The map's six to eight systems are systems we talk to. The only system we replace is the
applicant tracking system, which is D-015.

For each external system the product-phase choice is integrate over an API or export a file the customer's own
team imports. That choice is deferred to S1, per system. Ignore is not on the list for payroll, because a new
hire who never reaches payroll does not get paid, and day-90 employment status has to be read from somewhere.

**The pricing guardrail.** Deferring pricing is reversible, which is what makes the deferral safe. A price shown
in a demo is not, because it anchors. So the demo shows no pricing, and nothing in it is framed per hire.

**What would change my mind.** A design partner ready to pilot before the demo is finished, or Nishant asking
for a live integration in the first conversation.

---

## D-017, 16 Aug 2026: success is time to hire and number of hires. Quality of hire is dropped

**What we decided.** Suniras, 16 Aug, resolving the conflict raised in Q-030. Two metrics: time to hire and
number of hires. Quality of hire is out.

**It does resolve the conflict, cleanly.** Number of hires only fought quality of hire because improving
retention shrinks hiring volume. With quality of hire dropped, nothing in our own metric set works against
anything else. The problem raised in Q-030 is genuinely closed by this.

**Two consequences, stated once and then left alone.**

Our metric story is now the same as the incumbents'. The single best-supported finding in this project, reached
independently by two unrelated research methods, is that every claim in this category is about time to hire and
none is about tenure. We have now joined that pattern rather than broken it. That is a legitimate choice, since
quality of hire is unclaimed because it is genuinely hard to prove and the buyer may hold no baseline, and D-013
already says parity is the plan. It does mean the metric is not where any differentiation will come from.

Number of hires is not a number we cause. A retailer hires as many people as their growth and their churn
require, and neither is ours to move. What a hiring product can actually move is the share of open roles that
get filled, and how quickly. Worth revisiting the wording before it reaches a pitch or a metric tree, because a
buyer will ask how we take credit for a number their own turnover sets.

**What would change my mind.** A customer asking, in a first meeting, what this does to retention. If that
question comes up unprompted more than once, quality of hire is what they are buying and the metric set is
wrong.

---

## D-016, 16 Aug 2026: step 6 produces a score. AI ranks, a human still decides

**What we decided.** Suniras, 16 Aug: a score, because it is what gives us a competitive edge, and it might not
be much but it is something.

The score is a suggestion off the interview the agent conducted. A human still makes the hire or reject call.

**The reason given is wrong, and the decision can still be right.** Both competitors already score. Fountain
markets explainable scoring on its ethical-AI page. Paradox returns a pass or review outcome. Scoring is table
stakes in this category, not an edge.

So this is a parity decision, which is entirely consistent with D-013, where parity is the stated plan. It just
is not the differentiator. Worth being clear about, because a decision held for a reason that does not survive
contact tends to get reopened at the worst moment.

**What it costs, and this is real engineering rather than paperwork.** A score that substantially assists a
hiring decision is an automated employment decision tool. That brings an annual independent bias audit with a
published summary, ten business days of notice to candidates in New York City, obligations under Colorado's AI
Act, EEOC disparate impact exposure if the score correlates with race, sex or age, and an ADA requirement for an
alternative path, since a model reading interview behaviour can screen out disabled candidates on speech or
processing time. Mobley v. Workday establishes that the vendor can be liable, not only the employer.

It also spends the one position we had that neither competitor has. Unifi deliberately did not score. It returned
pass or in-review and could never reject. That design passed a client's legal review and it was the only thing
in the project we could say that they could not.

**One consequence that works in our favour.** Once step 6 makes us an automated employment decision tool, the
regulatory cost of putting a model on step 2 largely disappears, because we are already inside the regime. The
argument against AI on eligibility was that it dragged us into rules a deterministic engine avoided. That
argument is now spent. Eligibility can be revisited on its merits.

**What would change my mind.** A bias audit that cannot be passed, or a customer's counsel refusing the score
where they would have accepted pass and review. Either would send us back to the Unifi shape, and that is a
cheap reversal early and an expensive one after the model is trained and the audit is published.

---

## D-015, 16 Aug 2026: we are the system of record. All applicants are fed to our system

> **SUPERSEDED 18 Aug 2026 by D-020.** Nishant accepted a connector architecture in the second meeting, so we
> are an overlay and not the record. This decision is kept in full rather than deleted, because the cost it
> writes out is the best available statement of what the reversal buys us, and because the one strong argument
> in it, that owning the record would eventually give us data nobody else has, is a real loss that should stay
> visible. Read D-020 next.

**What we decided.** Suniras, 16 Aug, answering Q-031. We are the system of record, not an overlay. Every
applicant enters our system.

**The coherent long-run argument for it, which is stronger than the one Suniras gave.** D-012 requires v1 to
instrument the funnel it touches, because no public source contains the numbers this project needs. D-009 rules
attract out specifically because we have no way to hold outcome data nobody else has.

Being the system of record eventually reverses both. If every applicant and every lifecycle event lives with us,
we hold exactly the dataset that does not exist publicly, and the reason attract was excluded stops applying.
That is a real strategic logic and it is the best case for this decision.

**What it costs, and none of this is optional.**

The sale changes shape. Every target already runs Workday, SAP SuccessFactors, iCIMS or Avature. Replacing an
applicant tracking system is an enterprise rip-and-replace: IT, procurement, security review, data migration,
a CIO. An overlay could have been bought by an HR leader out of a departmental budget. This cannot.

The teardown's warning applies, correctly read. It says "Fountain is an ATS we can out-build" is the mistake most
likely to cost us, and the reason is scale rather than strategy: Fountain's hiring ATS alone is 108 published
endpoints and its post-hire surface is four times larger. Being the record means building all of that.

Step 1 is now load-bearing. Applicants arrive from Indeed, job boards and career sites, and those pipes point at
the incumbent system today. To be the record we must own the intake. That is the step Suniras first wanted
excluded, so the exclusion is now definitively reversed.

We inherit the record-keeping obligations. I-9 retention of three years or one year past termination, California
FEHA automated decision system retention of four years, EEOC retention, audit reconstruction months later,
e-discovery. These are engineering, not policy.

And history migrates or is lost. Years of applicant data, silver-medallist pools, re-application rules,
do-not-hire flags. A retailer will not hand over the funnel and drop that.

**It contradicts our one shipped precedent.** Unifi was integrated with Avature across two instances. Overlay.
The only thing Nurix has shipped in this domain is the opposite architecture, which does not make the decision
wrong but does mean nothing built there transfers to this shape.

**What would change my mind.** A named target retailer saying they will not move off their applicant tracking
system at any price, which is the answer I would expect from most large chains, or an engineering estimate for
intake plus record-keeping plus migration that pushes first ship beyond the point where the funding survives.

---

## D-014, 16 Aug 2026: we never perform background checks. We order them and we show their state

**What we decided.** Suniras, 16 Aug: background checking is out of scope because it is a completely different
product.

Correct, and nobody should reopen it. A background check is performed by a regulated consumer reporting agency
under the Fair Credit Reporting Act. Sterling, Checkr, HireRight and the rest are a different business with a
different licence, and building one would be an absurd use of this team.

**The boundary, which is the part that matters and which needs Suniras to confirm.** Out of scope cannot mean
steps 9 and 10 disappear from the product, because D-013 commits us to all twenty steps and the spanning view is
the actual claim. Dropping these two would leave a hole in the middle of the pipeline at precisely the longest
wait in the funnel.

So the reading recorded here is:

- **Out.** Performing any part of a background check. Searching records. Deciding whether a record disqualifies
  anyone, which is a human individualised assessment by law in several jurisdictions anyway.
- **In.** Placing the order with whichever agency the customer already uses. Capturing the standalone FCRA
  disclosure and authorisation correctly. Tracking the case and surfacing what is slow. Chasing the candidate
  when they have not booked a drug screen. Running the pre-adverse and adverse action sequence so it cannot be
  skipped.

That last list is all deterministic software, it is the longest single wait in the funnel, and neither
competitor sells into step 10.

**Why the boundary needs stating rather than assuming.** This is the second time a scope line has been drawn for
a reason slightly off from the real one. Step 1 was excluded as attract when it is actually capture. A boundary
drawn on the wrong reason moves the first time somebody pushes on it, usually in a customer meeting.

**What would change my mind.** A customer who wants us to become their screening provider, which would be a
different company, or a finding that every target retailer's existing agency has no usable API, which would
make the ordering half undeliverable.

---

## D-013, 16 Aug 2026: all twenty steps, no slice. Parity is the ticket, the spanning view is the claim

**What we decided.** Suniras, in his own words: cover steps 1 through 20, it is fine for humans to handle some
in between, automate most of what can be automated, use AI wherever it makes sense. Match what Fountain and
Paradox already do, then do it better. For the steps neither of them sells into, many need a human anyway, and
the value is showing them in one pipeline so everything is in one place.

So there is no wedge. The scope is the whole funnel.

**The part of this that is the actual strategy.** Two claims were made together and they are not equal.

"Do what they do but better" is a parity race against a company Workday owns. Fountain publishes 575 endpoints
and its post-hire surface is four times its hiring surface. Parity is a cost of entry, not a position.

"A single place where everyone can see the whole pipeline, including the steps we never automate" is different.
It is a claim about the handoffs and the waits rather than the steps, and it is supported by the funnel map:
seventeen of the nineteen marked steps are a wait or a handoff, and every step neither incumbent occupies is
one of those.

These depend on each other in one direction. You cannot be the single view over twenty steps while owning three
of them. So parity buys the right to make the claim, and the claim is the reason to buy us rather than them.

**Why this is defensible rather than reckless.** The funnel map says the loss sits in the gaps between steps,
and nobody sells into the gaps because a gap is not a feature. A product scoped to one slice cannot address a
problem that lives between slices. That is a real argument for full coverage and it came out of the evidence
rather than out of ambition.

**What it costs, written down now so it is not a surprise.**

Twenty steps against two funded incumbents is the most expensive shape available. The likeliest failure is not
losing on any one step. It is shipping twenty things at 70% and losing to a competitor that does five at 100%.

Scope is not sequence. Something ships first and what ships first decides what gets funded second. That order is
still undecided and it has to be settled before S1.

And "better" is not yet defined. Two documented weaknesses are available as definitions: Paradox customers
cannot self-configure, since a customer success representative sets up stage transitions on the backend, and
Fountain markets ADP, Workday, UKG and SAP integrations while documenting a do-it-yourself webhook and shipping
no certified connector in a 593-page index. Both are from the vendors' own material. Choosing between them is
Phase 5 work still owed.

**What would change my mind.** A build estimate showing that reaching parity on the nine deterministic steps
takes longer than a competitor takes to close the visibility gap. Parity is copyable and a spanning view is
copyable, so the whole thing rests on getting there before somebody notices.

---

## D-012, 14 Aug 2026: the premise question is closed. Stop asking whether the problem is worth solving

**What we decided.** Suniras's instruction, twice. End-to-end hiring for US frontline retail is the problem
we are building for. Mukesh Bansal, the CEO, has recommended it be solved. Payroll hours are not the problem
we are working on. The project moves on to defining a solution.

So the premise problem that has sat at the centre of CONTEXT.md since 9 Aug is retired as a live issue.

**Why this is reasonable rather than a shortcut.** Three reasons stand on their own.

The evidence that started it was public employee reviews, which lean toward complaint and are not a sample.
Part of that same research angle mixed warehouse hiring into store hiring, so it was already discounted.

A CEO mandate is a real input in a real company. It is not proof the problem is binding, and it is a
legitimate reason to stop debating and start building.

And the debate had become unfalsifiable from a desk. Nobody publishes step-level funnel time for frontline
retail, and both incumbents publish speed claims with no baselines. Continuing to argue it without
practitioner access would have burned weeks for no new information.

**What this costs us, written down so it is not a surprise later.** If speed genuinely is not what binds at
store level, the failure mode is not losing a deal to Fountain. It is winning a deal and finding nobody logs
in. Renewal is where that shows up, not the pilot.

So the mitigation is a design requirement rather than more research. **V1 must instrument the funnel it
touches.** Time per step, drop-off per step, who acted and when. Not for a dashboard. Because it is the only
way this project ever gets the baseline that public sources do not contain, and it turns the first deployment
into the evidence we could not buy.

**What would change my mind.** Nothing from desk research, by design. Only a practitioner at a named target
retailer saying they will not use a faster hiring flow because something else binds first. If that happens in
a discovery call, it goes to DECISIONS.md as a reversal, not to a debate.

---

## D-011, 9 Aug 2026: nothing from NuAnchor transfers to the product

**What we decided.** Suniras's instruction: "don't take any inspiration from nuanchor."

So the answer to the "what transfers" question is nothing, at product level. NuAnchor was included as a
reference for the standard products are expected to be built to, and that is where its usefulness ends.

**Why this holds up.** Taking the three tiers in turn:

- **Domain logic transfers at zero.** Demand forecasting, import duties, factory minimum order sizes,
  landed cost. None of it has a hiring equivalent. Established since D-001.
- **Pattern is the weakest tier and not an advantage.** The "agent owns / you decide" line, the typed
  handoffs between steps, the volume triage screen. Any competent competitor can copy a design pattern
  without our code, so copying our own does not put us ahead of anyone.
- **Craft is process, not product.** How Nurix ships a first version with a sales pack attached is useful
  to how this project runs. It contributes nothing to what gets built.
- **Platform is the only tier that could be a real head start**, and it is an engineering question for
  Phase S1 rather than a product question. It gets decided there, against NuStack and NuPlay, not by
  looking at NuAnchor.

**One narrow thing worth keeping.** Nurix has internal precedent for stating an AI boundary explicitly and
per step. NuAnchor does it in the interface, Unifi did it in the screening design. That is not inspiration
for the product. It is evidence that the question has been faced and answered here before, which matters
at Phase 5 when we draw our own boundary and at Phase 7 when we have to defend it.

**What would change my mind.** A Phase 1 diagnosis that independently arrives at a problem shape which
NuAnchor's platform genuinely fits. In that case the reuse argument comes from the diagnosis, which is the
only direction it is allowed to come from.

---

## D-010, 9 Aug 2026: one flow, and management roles are an explicit non-goal for v1

**What we decided.** Suniras chose the third option from TODO item 1. One flow. Management roles are not in
v1 and that is written down rather than implied.

Suniras's reasoning: "once we're able to figure out what we can do for hiring, onboarding and activating
for staff, maybe we can figure out how to do the same for management."

**Why it is the right shape of decision.** The three options were one configurable flow, two separate
products, or one flow with management excluded. The third is the narrowest and the only one that produces a
written non-goal, which is what Phase 5 asks for.

It also matches the evidence. Hourly and management hiring are different jobs done by different people on
different timescales. Hourly is volume and throughput. Management is a low-volume quality decision made by
a district manager who does a handful a year and cannot afford a bad one. A product that serves both well
is two products wearing one name.

**The cost, stated plainly.** Management roles are where the money usually is. Store manager searches are
slower, more expensive per hire, and more painful when they fail. Excluding them means excluding the
higher-value half of the problem. That is a real sacrifice and it is the correct kind of sacrifice for a
v1, but it should not be mistaken for a free choice.

**What would change my mind.** Phase 1 finding that the management bottleneck is the one that actually
costs retailers money, and that fixing hourly hiring does not relieve it. The supervisor pipeline question
(Q-023) sits exactly on this line, and it is currently unsupported on 2025 data rather than dismissed.

---

## D-009, 9 Aug 2026: attract is out of scope, because we have no data advantage there

**What we decided.** We are not scoping for attract. It stays in the long-term horizon per Nishant, but
it is an explicit non-goal for what we build.

**Why, in Suniras's words.** "i don't know how we're going to get data which nobody else has."

That is the right test and it is worth spelling out. Attract-enablement means telling the people who spend
money on attraction where to spend it: which channels produced people who actually got hired and stayed,
which locations need staff and how urgently, what a realistic fill time is.

Every one of those answers requires knowing what happened downstream. Who completed the application, who
turned up, who was still there after 90 days. If we are not in the hiring and onboarding flow, that data
belongs to the applicant tracking system, and we would be reporting on someone else's records while
competing with that vendor's own analytics. Nothing we could show a customer would be something a
competitor could not also show them.

So the non-goal is not "attract is unimportant." It is "we have no privileged position there yet."

**Reason restated 9 Aug 2026, after Suniras challenged it.** The original reason above was too narrow.
Suniras pointed out that NuAnchor takes a CSV of internal company data, so a hiring product could take a
CSV of hiring numbers the same way. That is correct, and the CSV mechanism was never the objection.

Three better reasons:

1. **The unique-data slot is already occupied.** NuAnchor's transformation is real because it fuses the
   customer's sell-through history with external signals the customer does not have wired up: search
   interest, social, live duty rates. For hiring attraction, the equivalent external slot holds local labour
   supply, competitor wages and applicant availability by geography. That is Lightcast, Indeed, LinkedIn
   Talent Insights and ADP, companies whose entire business is that data. We would be entering with less.
2. **The output is advice with no forcing function.** NuAnchor produces a purchase order, a document the
   buyer is already obliged to produce, so the product slots into an existing obligation. Attract-enablement
   produces a recommendation to shift spend. The recipient can ignore it and nothing breaks. Screening, by
   contrast, produces a state change: a person moved through a stage.
3. **A customer CSV is retrospective and non-exclusive.** It describes a past we did not observe and the
   applicant tracking vendor holds the same records. Being in the flow produces data that did not exist
   before we were there: where a candidate dropped off, what they said, why they abandoned.

Also worth noting: Suniras's own example CSV included "which store is in losses due to manpower being
lesser there, where hiring needs to be sped up." If a customer can supply that, they already know it, and
the product would be returning their own conclusion to them.

**The counterargument, recorded rather than dismissed.** Land with low-friction analytics that need no
integration, then expand into the flow. A well-established go-to-market pattern. It turns on whether
landing as a reporting tool gets you into the flow or gets you budgeted as a reporting tool permanently.
That is a Phase 5 argument to have, not a settled question.

**What would change my mind.** Suniras's own condition: if we actually did get data nobody else has. That
happens by being in the hiring or onboarding flow and accumulating outcome data as a byproduct. It does not
happen by being handed a spreadsheet. In that case attract stops being a weak analytics play and becomes
something only we can do, and this decision should be reopened rather than inherited.

**Note on timing.** This is a Phase 5 scope decision made during Phase 0. That is normally a thing to
resist. Two reasons it is acceptable here: it is a non-goal rather than a scope commitment, and non-goals
made early with a stated reason are far safer than features chosen early. And it has a reopening trigger
written into it, so it is provisional rather than frozen.

---

## D-008, 9 Aug 2026: the horizon stays broad, and attract means enabling not advertising

**What we decided.** Guidance from Nishant, quoted by Suniras: "yes keep the horizon broad, we can cut
down the scope later. we also want to create solution to attract the talent. not the ads/marketing part
like social media website publications those will be job of other teams but enabling those teams will be
a dimension we need to address."

So all four stages stay in the long-term picture: attract, hire, onboard, activate. Attract has a
boundary drawn through it. Running the advertising belongs to other teams. Enabling those teams is ours.

Also decided, from Suniras: the target is every role in retail segments with repeated high-volume
hiring. Associates, floor managers, store managers, operations managers.

**Why the boundary on attract is useful.** "Attract" as a whole is a category with established players in
advertising and job distribution. "Enabling the teams who do the attracting" is a narrower and more
defensible thing to be. It is closer to giving those teams information they lack than to competing with
them.

**The cost, and it is the standard one.** A broad horizon and a broad v1 are different objects, and the
second is how products fail. CLAUDE.md's own standing challenge is "vision creeping into v1 scope."
Nishant said cut the scope later, which means somebody has to actually cut it, at Phase 5, deliberately.

The specific risk here is that four stages times four role types is sixteen combinations, and nothing
about a broad horizon tells you which one to build first.

**Three consequences nobody had noticed, added 9 Aug 2026.**

First, **attract is now a different kind of product.** With advertising and publishing removed, what is
left is feeding downstream outcomes back to the people spending money upstream: which channels produced
people who stayed, which locations need staff and how urgently, what a realistic fill time is. That is an
information product, not a workflow product, and it is not a smaller version of attract. It is a
different one.

Second, **that probably rules attract out as v1**, which is the opposite of how the guidance sounds. To
tell an attraction team which channels produced 90-day survivors you have to know who survived 90 days,
which means being in the hiring and onboarding flow or reading someone else's record of it. So attract
sits downstream of the other stages rather than beside them. The fork is in TODO.md item 2c.

Third, **the buying committee gained a member.** "Other teams" is a stakeholder CLAUDE.md does not name.
At a retailer that function may sit under HR, under marketing, or be outsourced. TODO.md item 2b.

**A claim I made here and then withdrew, 9 Aug 2026.**

I originally recorded that attract-enablement had "the same shape as NuAnchor" and flagged it as
solution-first reasoning arriving unnoticed. That was wrong and it is worth keeping the correction visible
rather than deleting the claim.

Two things were wrong with it.

I wrote the description that produced the resemblance. Having spent two days inside the NuAnchor material,
I characterised an unfamiliar product shape using the structure I had been reading, then treated the match
as a finding about the project rather than an artefact of my own phrasing.

And the resemblance carries almost no information. Measure, recommend, let a human approve, score against
outcome, correct. That describes every forecasting and planning tool in existence, including the
competitors NuAnchor is positioned against. A resemblance that broad is not evidence of anything.

Nobody in this project proposed reusing NuAnchor. Suniras has stated twice that both NuAnchor and Unifi
were included as reference points, NuAnchor for how products are expected to be built and Unifi to assess
how similar the use cases are. Both are legitimate reasons and neither is solution-first.

**The residual risk, which is real but different.** The evidence base is currently lopsided. There is far
more detail available about NuAnchor and Unifi than about retail hiring, so analogies drawn now are more
likely to come from what is at hand than from the problem. That corrects itself as Phase 1 builds
comparable material, and until then any analogy I offer should be checked for which direction it came
from.

**What would change my mind.** Nothing on the guidance itself. This is direction from the person who owns
the product line. Recorded so that at Phase 5 the difference between horizon and scope is visible rather
than argued about, and so the resemblance above is a flagged risk rather than an unexamined assumption.

---

## D-007, 9 Aug 2026: compliance and security are deprioritised, on Suniras's call

**What we decided.** Suniras's instruction: "we can take care of security. all compliances will mostly
pass. you don't have to worry about it." Security and compliance stop being tracked as blockers.
Q-017 and Q-018 move to deferred rather than answered.

**Why recorded rather than just accepted.** CLAUDE.md lists "deferring regulatory past the point where
it changes the spec" as a standing challenge, so this decision has to be visible rather than implicit.

**The cost, written down.** At Unifi, compliance did not "pass" after the fact. It shaped the product:

- The team considered not launching in New York at all because of Local Law 144.
- The entire design of the screening logic exists because of compliance. Hard rules for eligibility, a
  client-owned phrase bank for open answers, and an agent that can pass a candidate forward but never
  reject one. That is a compliance decision wearing an architecture costume.
- The compliance spreadsheet's own internal notes record unresolved gaps: ISO 42001 not held, nobody
  had answered how discrimination would be detected, nobody owned the impact assessment.
- The vendor checklist answered "EEOC is not applicable" while Nurix's own legal memo says vendors face
  liability and cites Mobley v. Workday as the case testing exactly that.

So the risk is not that compliance fails a review at the end. It is that a requirement which should
have shaped the build arrives after the build.

**What would change my mind.** Nothing needed. This is Suniras's call and it is recorded as made. It
will be raised again only if a Phase 7 requirement turns out to depend on it, which the Unifi
precedent suggests is likely.

---

## D-006, 9 Aug 2026: use current market size, revisit when the 2026 forecast lands

**What we decided.** The shrinking seasonal hiring trend is noted and set aside. Suniras's reasoning:
"though the market is shrinking slightly, it still is a pretty big chunk for now for us to get into."

For the record, the shrinkage is not slight. Seasonal hires went from 442,000 in 2024 to a forecast of
265,000 to 365,000 in 2025, which is roughly a third at the midpoint, while holiday sales rose above a
trillion dollars for the first time. Even so, several hundred thousand hires a year is a real market.

**What would change my mind.** The 2026 NRF forecast, usually published September or October. If it
shows a second consecutive large fall, the trend is structural rather than one soft year, and the
seasonal framing needs rethinking rather than noting. Q-022 stays open for that reason.

---

## D-005, 9 Aug 2026: Phase 1 runs on second-hand evidence

**What we decided.** Phase 1 proceeds without practitioner interviews. Suniras's instruction: "For now
lets run phase 1 on second hand evidence only."

**What that means in practice.** The diagnosis will be built from reviews of Fountain and Paradox,
retail earnings calls, government labour data, named industry research, competitor job adverts, and
practitioner forums. Every resulting claim carries the assumption label, and the PRD says so plainly.

**Two costs, written down.**

First, the Phase 1 gate as CLAUDE.md words it cannot be passed. "Would a US retail TA leader recognise
this as their own problem, in their own words?" needs a US retail TA leader. Without one we can say the
diagnosis is consistent with public evidence. We cannot say it is recognised.

Second, and this is the part worth arguing about: Suniras's reasoning was "since there are already
competitors incumbent stack existing, we can assume that the problem is worth solving."

That inference proves a market exists. It does not prove a gap exists. Fountain, Paradox, Harri and
Phenom existing is evidence that retailers pay for frontline hiring software, and simultaneously
evidence that they already have some. The unanswered question is not whether the problem is worth
solving. It is what remains unsolved after twelve years of well-funded companies solving it. That is
Q-012, and competitor existence makes it more urgent rather than less.

**What would change my mind.** Practitioner access appearing. Q-001 stays open, downgraded from
blocking to shaping, because Phase 3 still needs it even though Phase 1 now proceeds without it.

---

## D-004, 9 Aug 2026: the Unifi work is a channel deal through TalentOS, not a direct customer

**What we decided.** Record that the contract Nurix signed is with **TalentOS**, not with Unifi
directly. Unifi and its subsidiaries ERMC and Prospect are covered by it. TalentOS is a recruitment
company being spun out of Unifi, and it intends to resell the solution to its own customers.

This is not a small labelling point. The statement of work splits responsibilities like a partnership,
not a customer relationship. TalentOS owns "the marketing, positioning, and commercial offering of the
solution to third-party customers" and will "manage and front-end customer relationships." Nurix
provides and maintains the technology and supports TalentOS with demos and troubleshooting.

**Why this matters to this project.** Three reasons.

First, it means Nurix may already have a route to market in US frontline hiring, and that route is a
partner who owns the customer. Any strategy for a retail hiring product has to say whether it goes
direct or through a partner like this, because the two need completely different things built.

Second, it changes what the Unifi numbers mean. "70,000 hires a year" is a description of the volume
flowing through a partner's client, not a measure of anything Nurix sold or delivered.

Third, the reason the deal was won is written down in the sales handover, and it was not the product.
It says: "The agility we have shown / multiple discussions / follow up and the most important, we have
an internal champion (Srini)." Srini is CEO of Abrightlabs and CTO of the Argenbright Group. The deal
was won on relationship and responsiveness. Worth remembering before assuming a retail deal gets won
on features.

**What would change my mind.** If the TalentOS arrangement has since been replaced by a direct Unifi
contract, or if TalentOS never actually took it to market. Either would change what this proves about
Nurix's route to market. Both are worth checking.

---

## D-003, 8 Aug 2026, corrected 9 Aug 2026: which source wins when sources disagree

**What we decided.** When two sources say different things, believe them in this order:

1. Screenshots of the running app
2. The demo script and the walkthrough documents
3. The two decks
4. The release note
5. **What the presenter actually says in the demo recording**

**Correction made 9 Aug 2026.** The first version of this decision put "Suniras's written summary of
the video" at the bottom, and justified the whole ordering on the grounds that the summary had got the
supplier countries wrong.

That justification was wrong. The full transcript arrived on 9 Aug and shows the summary was accurate:
the presenter does say Vietnam and China. The app screenshot shows Vietnam and India. So the conflict
was never between the summary and the documents. It was between **the demo narration and the
product itself**, and the summary reported the narration faithfully.

The ordering above survives the correction, because a screenshot of the running app still beats
someone describing it. But the reason changed, and so did what sits at the bottom of the list. It is
the spoken narration, not the retelling of it.

**Why this matters beyond bookkeeping.** A demo recording that contradicts the product is a live sales
risk, not a filing problem. Anyone who watches that video and then sees the app will notice.

**What would change my mind.** If the app changed after 31 July 2026 and the narration was correct at
the time it was recorded, then the screenshots are the stale source, not the video. Worth checking
which came first.

---

## D-002, 8 Aug 2026: the NuAnchor demo is a style reference, not a blueprint

**What we decided.** The NuAnchor demo video shows how Nurix builds and packages a product. It does
not tell us what the hiring product should look like. What v1 of the hiring product actually
includes is still a Phase 5 decision, and nothing about it has been decided.

**Why.** I asked Suniras directly what role the video played. The answer: "its a craft reference,
and also a demo to show you capabilities that have been built."

I am writing this down because this is the kind of decision that gets forgotten. CLAUDE.md warns
about solution-first thinking, meaning: we have a product already, so we start looking for a
problem that fits it. If nobody records that the NuAnchor shape was never chosen, by Phase 5
everyone will assume it was.

**What would change my mind.** Suniras decides the NuAnchor shape genuinely is right for v1. That
is allowed. But it has to happen in Phase 5, with a reason based on the diagnosis, and it has to be
written here as a new decision that replaces this one.

**How this gets enforced.** If a proposal shows up that copies NuAnchor's structure without a
diagnosis explaining why, I question it rather than accept it.

---

## D-001, 8 Aug 2026: what NuAnchor and NuAisle actually are

**What we decided.**

NuAisle is an app store. It lives at apps.nuplay.ai. It is not a retail strategy and not a set of
documents. It is a shelf that products sit on.

NuAnchor is the first product on that shelf. It does retail buying, also called assortment
planning. A retailer uploads a file showing what has been selling. NuAnchor works out how much to
order for next season, prices it across different factories including shipping and import taxes,
and produces a draft purchase order for a person to approve.

None of this overlaps with hiring. What NuAnchor gives this project is a way of building things and
a platform underneath. It does not give us a product.

**Why.** All seven source files agree. The release note states the app store part directly. Both
decks, the demo script, the walkthrough and four screenshots agree on what the product does. This
answers two of the open questions listed in CLAUDE.md.

**What would change my mind.** Nothing about what NuAnchor is. That part is settled.

What is still open is how big a company NuAisle is meant to sell to. That is Q-002 in
OPEN-QUESTIONS.md and it is a question, not a decision.

**What this means going forward.** Whenever someone says "we already have this built," they have to
say which of these three they mean:

- **Platform.** Actual code and infrastructure we can reuse. This is a real head start.
- **Pattern.** A design idea someone could copy without our code. Any competent competitor can copy
  a pattern, so it is not an advantage on its own.
- **Craft.** How we write decks and run demos. This helps us sell. It does not help the product
  work.
