# Gaps

Everything this project does not know or has not decided, as of 27 August 2026, ordered by how much it costs to
leave open.

Written for a meeting, so it is short. Each item says who can close it and what closing it takes.

---

## The one that is the parent of most of the others

**Nobody outside this company has told us the problem is real.**

Zero of the five conversations Phase 3 requires. The colleagues who have described the problem, Anuj and Joy,
both work at NuPlay. Four rounds of desk research and four verification rounds do not substitute, and the
verification rounds keep proving why: no retailer publishes how its hiring works, and every vendor publishes an
unsourced version.

**What it costs, concretely.** Nine of the twenty-one rows in the PRD timing table are our own estimate. The
champion persona has no candidate. The buyer is a group rather than a person. All three of those are downstream
of the same absence.

**How to close it.** One conversation. The live route is Anuj, who met US clients in person a couple of months
ago and whose PRD came out of those meetings. His competitor research carries 229 links. His PRD documents carry
none, so the client material was either never written down or lives outside that repository. Nobody has asked
him who he met. **That is one message and it is the cheapest thing on this page.**

Open since 9 August. It is the oldest unmanaged risk in the project.

---

## Two that block the next phase

**Who signs.** The user is decided, the store manager. The buyer is "top management", which is a group. A chief
HR officer buys a talent story, a chief operating officer buys store productivity, a chief financial officer
buys a cost line, a VP of talent acquisition buys their own team's workload. Four different first slides, and
the reporting layer differs too, because the buyer is central and the user is in a store. **Suniras, and Nishant
may simply know from the rooms he has been in.**

**Which success metrics win.** One decision says time to hire and number of hires. The goals as stated on 26
August are time to hire, number of people involved, and least manual work. Number of hires is absent from the
second list. Two of the three are absent from the first. **The metric tree gets built from whichever is true, so
one of them has to give.** Suniras.

---

## The core mechanism has never been measured by anyone

The product's central argument is that you cannot shorten a legal deadline, so you start it earlier and run it
alongside something else.

**No published source gives an elapsed-time saving from doing that.** The only structured source found is the US
Office of Personnel Management's end-to-end hiring roadmap from March 2017, which budgets a fully sequential
fourteen-step federal process at 80 calendar days and shows the security check starting at tentative offer. It
states a time-saving rationale and publishes no measured result.

So we know the shape of the mechanism and not its size. Every attempt to find a measured case failed, and five
of the candidate sources turned out to quote text that does not exist on the page cited.

**How to close it.** Only by measuring it in the first deployment. This is not a research gap.

---

## Nine numbers the product has to produce itself

These are the estimated rows in the timing table. Each one is a duration nobody publishes.

Interview scheduling latency. Our figure is one to three days and there is no independent source. Both
competitors lead with this feature, which is indirect evidence it is slow and is not a measurement.

Eligibility screening, offer issuing and check ordering. All deterministic, so what takes time is the queue
rather than the work, and the queue length is unmeasured.

Training scheduling, badge and systems provisioning, and rota placement. The rota is the wait nobody names:
somebody cleared on a Wednesday can still sit until the next weekly rota is published.

Week one training and ramp to working unsupervised. No published figure exists for retail on either.

**Two related holes worth naming separately.**

**How long an application takes to complete, in minutes.** The figure everybody quotes, 12.47% completion under
five minutes against 3.61% over fifteen, comes from a page published in November 2017. Roughly nine-year-old
data, no sample size, no denominator definition.

**The duplicate applicant rate.** No credible published measurement exists at all. Appcast, CareerPlug and
Greenhouse never compute a unique-person denominator. **This is the number the identity feature's headline
depends on**, and the demo's 176 applications to 141 people is an invented 20% that says so on screen.

---

## One legal question still open, and it decides a design

**Whether federal immigration enforcement guidance warns employers away from I-9 software that requires a Social
Security number to onboard.** If it does, an SSN-keyed identity model is not merely unnecessary, it is named as
a hazard.

This is unverified because the verification agent died when the machine slept mid-run. **It is the
highest-value single thing left to check** and it decides whether the product stores Social Security numbers or
passes them straight through to the embedded I-9 vendor.

Two other sections also have one verification pass instead of two, for the same reason: the hiQ Labs scraping
litigation, and the SSN custody cluster. Both are labelled in place.

---

## Two facts about the buying organisation that four rounds could not find

**How many stores one field HR business partner covers.** No employer-owned posting states a store count for
the role. Walmart's own text says only "in multiple facilities."

**What field HR is measured on.** The single attempt to extract metric language from a live posting was refuted
unanimously, so even the earlier inference does not stand.

Both matter less now that the store manager is the user, but they are the reason the field level was never
resolvable.

---

## Four decisions that are open on purpose

**Pricing.** Deferred deliberately, with two guardrails: the demo shows no price, and nothing is framed per
hire, because the best study of large US retailers finds gross hiring falls when retention improves. There are
now three models on the table rather than one, including charging nothing for the software and making the margin
on employee insurance.

**Job board distribution.** A recommendation exists and a decision does not. Take the free routes, because
Google for Jobs and several aggregators need no agreement and nobody can refuse them. Buy wider reach only if a
customer asks. Do not build it.

**Contingent and temporary staffing.** Raised twice by Joy and relayed twice. Probably no for version 1, but it
needs an answer rather than silence.

**The addressable rehire population.** Known to be smaller than the 8.9% of retail hires that are returning
workers, because four things all have to be true at once. That funnel cannot be computed yet.

---

## Two things that need rewriting rather than deciding

**What must come over from the old applicant tracking system.** It used to be one thing, a do-not-rehire flag.
Under the rehire reframe the ask is a full prior employment record including training completion and attendance.
Nishant confirmed the data persists at large retailers, which is the segment we sell to. **He answered whether
the data exists. He did not answer whether an outside system can read it**, and that is the harder question and
the most likely place this design gets refused.

**Acceptance criteria for the first slice.** Nishant's order was research, then wireframes, then high fidelity,
then check the screens solve the problem, then build. The demo jumped ahead of that, so what is missing is not a
screen. It is the acceptance criteria, and those are Suniras's to draft.

---

## What is not a gap

Worth stating so nobody spends time here again.

**Desk research.** Closed after four rounds. Three verification rounds since have confirmed the pattern: legal
deadlines are all published because they are written into regulations, and operating durations are published by
nobody. A fifth round produces more of the same.

**Whether the problem is worth solving.** Closed on 14 August with the cost of closing it early written into the
decision. The mitigation is that version 1 instruments the funnel it touches, and that mitigation is now a
requirement in the PRD rather than an intention.

**The scope.** All twenty steps, connector rather than system of record, human decides after the score, checks
ordered but never performed, I-9 and E-Verify through an embedded vendor. All decided, all with reversal
conditions recorded.
