# Review: the visibility framing

**AUTHOR: Suniras drafted the four-point visibility framing on 26 Aug 2026. This file is Claude's reaction to it.**
The draft is in the conversation record. What follows is what is strong, what contradicts itself, and what it
does not account for. Nothing here replaces the draft.

---

## The thing the draft does not notice about itself

**Points 1 and 4 are the same feature, and only one of them is at a workable altitude.**

Point 1 says: tell the employer which sources produce hires for this store. Point 4 says: tell the employer that
this store is getting 60% fewer unique applicants than comparable stores.

Point 1 needs enough hiring events at one store to distinguish four or five sources from each other. **A store
hiring twenty to forty people a year cannot do that**, and pooling across stores to get the numbers up means the
claim is about the chain rather than the store, which is what point 4 already is. So point 1 as written and point
4 as written pull in opposite directions: one asserts the claim is local, the other asserts the comparison is
across sites.

**Resolve it in point 4's favour and both work.** At the chain level, with hundreds of stores, source performance
becomes measurable, and the unit of the claim becomes **"for stores like this one"** rather than "for this store".
That is a weaker sentence and a true one, and it is the only version the data can support.

### And that resolution answers the question this project has been stuck on

**Point 4 is the first idea anybody has produced that gives the district manager or field HR a reason to buy.**

Q-027 closed with the answer no: there is no organisational level where hiring volume and hiring authority both
sit. The table in that entry set out the problem. The person who feels all three objectives is the store manager,
and they cannot buy. The person who can buy is the district manager, whose stated measures are sales, profit,
productivity, payroll and shrink, where hiring appears as a cost line.

**A cross-store comparison is useless to a store manager and it is exactly what a district manager does all day.**
They do not run store B, so knowing store B does better is noise to them. The district manager runs fifteen to
twenty stores, per the only first-party span figure we have, and their entire job is spotting the outlier and
intervening. Field HR, covering a group of stores, is the same shape.

So point 4 is not a fourth feature on a list. **It is the feature that makes the buyer's problem the same as the
user's problem**, which is the gap the persona table exposed and nothing else in this project has closed.

**Two consequences to accept with it.** It cannot be sold bottom-up from a single store, because a single store
cannot generate the comparison. And it means the primary user of the highest-value screen is not the person doing
the hiring, which has to be resolved in the persona list rather than left ambiguous.

---

## Point by point

### 1. Which sources produce hires. The weakest of the four, and it needs demoting

**One thing in its favour that the draft does not claim.** D-009 excluded attract analytics because "we have no
data advantage there", and the reasoning was that telling a customer which channels produced people who stayed
requires downstream outcome data we would not have. **That reason is weaker now than when it was written.** D-013
puts all twenty steps in scope and D-020 puts us across the intake, so for our own customers we would see who
completed, who turned up and who was still there. The D-009 objection was about position, and the position changed.

**Three problems remain and they are not small.**

**The statistics.** Covered above. Being verified: what annual hire volume a per-store, per-source claim actually
needs.

**Attribution is unreliable in principle**, not just in practice. A candidate sees a job on Indeed, searches the
company, and applies on the careers site. Last-touch attribution credits the careers site and the money was spent
on Indeed. Self-reported "how did you hear about us" is worse. This is a known hard problem, not an engineering
gap.

**And it is somebody else's core competence.** Appcast, Joveo, PandoLogic, Recruitics and Radancy exist to do
exactly this and they buy the media as well, which gives them attribution data we would never see. Competing on
their ground was the reason Q-041 concluded we should buy distribution rather than build it. The same logic applies
to the analytics on top of it.

**What survives.** A chain-level statement about source mix, framed as "for stores like this one", and honest about
attribution being approximate. That is worth having and it is not worth leading with.

### 2. Unique people, not applications. The strongest technical claim, with three cautions

**"You think you received 165 applicants. You actually reached 132 unique people."** That is the best line in the
draft. It is concrete, it is checkable, and it reframes the buyer's own number in a way they cannot get anywhere
else. It is also the capability that follows directly from being a connector layer, so it is earned rather than
bolted on.

**Caution one: the claim's power is entirely a function of the duplication rate, and we do not know it.** At 20%
duplication the line lands. At 4% it is a rounding error and repeating it makes us look like we are inflating a
small finding. Being verified.

**Caution two, and it is a direct consequence of the SSN decision.** D-029 records that SSN is the right key for
post-hire matching and **cannot be the key at intake**, because it is collected at hire rather than at application.
So the dedup at the top of the funnel runs on name, email, phone and address. That is probabilistic matching, and
**a false merge attaches one person's prior rejection or another person's do-not-rehire flag to a different
applicant.** In a hiring context that is a discrimination complaint, not a bug. The feature needs a confidence
threshold, a bias toward under-merging, and a visible way for the operator to split a merge. That is more
engineering than the draft implies, and it should be in the design rather than discovered.

**Caution three is about the sales conversation, not the product.** "You reached fewer people than you thought" is
a statement about the buyer's own wasted spend. That is an excellent second-meeting hook and a poor first slide,
because the first reaction to being told your numbers are wrong is to defend them.

### 3. Re-engage people you already know. The best fit for our position

**Why this is the right shape for us specifically.** The data is the customer's own, sitting in the customer's own
system. So there is no third-party access problem, which is what killed the freshness lookup in Q-042, and
probably no consumer reporting agency problem, which is what would have killed it even if the access existed.
Being verified, because the boundary between processing a client's own records and assembling a consumer report is
the pivotal legal question and it should not be assumed.

It also attacks the thin funnel without buying reach, which is the honest answer to the tension in Q-041. And it
connects directly to Q-037, where the rehire reframe already established that a returning worker is the fastest
hire available.

**Two things the draft does not name.**

**Texting a previous applicant about a different, later role is a consent-scope question under TCPA.** Whether an
application for one job is prior express consent for outreach about another, months later, is not obvious, and
recruiting text messages have been litigated. Our repo already logs TCPA as a live constraint. Being verified, and
the answer determines whether this feature ships with an outbound channel or only as an in-product list.

**Re-surfacing someone previously rejected carries a specific risk.** If the original rejection was flawed, or
worse, if it correlated with a protected characteristic, then a system that surfaces them and rejects them again
has entrenched the first decision and multiplied it. And under the California rules in force since October 2025, a
tool that merely **facilitates** a human decision is an automated decision system, so the ranking that surfaces
them is itself in scope, with four years of input retention. The mitigation is to surface the person without
surfacing the prior outcome, and to make the prior rejection reason visible only where a human asks for it.

**One honest unknown.** Talent pools and candidate rediscovery are common at enterprise level, iCIMS, Phenom,
Beamery and Avature all sell some version. So the general idea is probably table stakes. **The differentiated
version is the narrow one**: former employees as a distinct category, gated by rehire eligibility, with the legal
window from Q-037 computed. Being verified.

### 4. Location-based visibility. See the top of this file

The strongest idea in the draft and the one with the largest implication, which is that it changes who we are
selling to.

**One thing to add.** The draft's example is a store getting 60% fewer unique applicants than comparable stores.
That is a good example because **it depends on point 2 rather than point 1**. Comparing unique people across stores
needs the deduplication and nothing else. Comparing source effectiveness across stores needs the attribution, which
is the weak part. So point 4 is buildable on the strong half alone, and that is the order to build it in.

---

## The positioning line

The draft's own words:

> "We show you where your candidates are actually coming from, connect duplicate identities across every source,
> and help you find the people you already have access to before paying to find more."

**Reacting rather than rewriting, because positioning is Suniras's to write.**

**The third clause is the strongest and it should probably lead.** "Before paying to find more" is a cost claim
against a budget line that already exists and already has an owner. Recruitment advertising spend is a real line
item that somebody defends every year, and telling them they can spend less of it is a conversation they will take.
The first two clauses describe capabilities; the third describes a saving.

**The second clause is the moat.** It is the one a competitor cannot copy quickly, because it needs the connector
position plus a matching engine plus the willingness to tell a customer their number is wrong.

**The first clause is the weakest and it is doing the most work in the sentence.** It is the attribution claim, and
it is the one with the statistics problem, the last-touch problem, and the specialist competitors.

**And here is the tension the sentence creates, which is worth resolving deliberately rather than later.** All
three clauses are about **visibility and efficiency**. None of them is about **speed**. But D-027 sets a five to
six day time-to-hire target, D-017 makes success time to hire and number of hires, and the tier 1 argument in
first-30-days.md is about compressing elapsed time.

**So this positioning and the recorded metrics are about different things.** That is not fatal and it may even be
right, since Q-041 already raised the possibility that the real problem is capacity rather than reach. But it
cannot stay unresolved, because the metric tree in Phase 7 gets built from whichever one is true, and a product
measured on days that is sold on visibility will fail one of the two audiences.

---

## VERIFIED 27 August 2026. Three of the conclusions above were wrong

The verification came back. Full detail in 01-diagnosis/verification-2026-08-27.md. Three corrections, and the
net effect is that the draft's ranking of its own four points was better than mine.

**Point 1 is worse than "demote it". It is dead on arithmetic.** A store hiring 20 to 40 people across 4 to 6
sources gets 3.3 to 10 hires per source per year. Under simulation with unequal true shares, the observed top four
matches the true top four **28 to 33% of the time**, so the recommendation would be wrong two times in three. And
the instrument is broken independently: the only large concordance study, 15,276 candidates, found **17% agreement**
between system metadata, candidate self-report and recruiter record on what the source was. No programmatic vendor
makes the per-store claim either; they all pool across employers at enormous scale.

**But the same data has a use I missed.** Federal contractor record-keeping under VEVRAA and Section 503 requires
an applicant source record, and **those obligations survived the rescission of Executive Order 11246.** So a
per-store source record is a compliance artefact with a legal driver, and it does not have to predict anything.
That is what point 1 should become.

**Point 3 is table stakes and I was wrong to call it our best fit.** All ten vendors checked ship past-applicant
rediscovery, and Greenhouse, Fountain, Phenom and Workday with HiredScore have a named feature for it. Duplicate
detection and merge is near-universal too, as data hygiene. **Pitching talent rematch as novel would not survive a
vendor bake-off.**

**Point 4 is claimed by Fountain, in its own words**: "Compare performance across sites. Identify bottlenecks and
slow locations instantly." So my line about it being the first thing aimed at somebody who can sign survives as a
statement about our own product and fails as a claim about the market.

### What actually survives, and it is narrower and better than what I wrote

**Two things are genuinely rare and both are point 2.**

**Reporting unique people as a first-class metric.** No vendor advertises it anywhere the search could find.
**They all deduplicate for hygiene and then still count applications.** That is the gap.

**And the combination.** Fountain compares sites on applications. Nobody compares sites on unique people. Each
half exists; together they do not. **So the differentiated thing is not the district view and not the dedup. It is
the district view measured in people.**

**One caution that got worse.** The duplication rate has no published measurement at all. Appcast, CareerPlug and
Greenhouse never compute a unique-person denominator, and the only figure in circulation traces to a content farm.
Worse, the strongest primary source on frontline application behaviour points away from the premise: Faberman and
Kudlyak, 4.77 million job seekers and 17.26 million applications, found the average hourly job seeker sent **1.9
applications per week** and **40.3% applied to only one job ever.** That contradicts the claim relayed from Anuj
that frontline candidates apply everywhere indiscriminately, E-060, though the data is from 2010 to 2011 and
predates a measured 111% rise in applications per job between 2022 and 2025.

**And point 3 ships, with a consent design rather than a consent afterthought.** Re-contacting a past applicant is
lawful. What is unsettled is whether consent given for one job covers a **different, later** opening, and the only
standard is that the message be "closely related to the purpose for which the number was originally provided."
**So the consent wording at intake is a product decision.** Washington State must be gated: RCW 19.190.060 plus
Aaland v. CRST, September 2025, which held recruitment texts are commercial. STOP honoured within 10 business days.

**One thing became a decision.** D-030: single-tenant matching only. Reading one customer's own records keeps us
outside consumer reporting agency status. **Pooling across customers and surfacing a candidate from customer A to
customer B makes us one.** That is the boundary, and it is not scoring or AI, it is the tenancy.
