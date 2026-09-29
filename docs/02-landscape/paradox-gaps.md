# Gaps in Paradox that we are trying to solve

Written 27 August 2026. Assembled from the Paradox teardown in gap-claims.md, the twenty-step funnel map, and
four verification rounds.

**Read the caution before the list.** A weakness in what somebody else built is not automatically an opening for
us. Several of these gaps exist for good reasons rather than through neglect. Where that is true it says so.

Every claim here comes from Paradox's own shipped product, their own documentation, or Workday's filings.
Nothing is sourced from a review site, because neither Paradox nor Fountain has a public issue tracker, forum or
feedback board, which caps review-based claims at tentative.

---

## The structural gap, and it is the only one that is really a strategy

**Paradox does not sell the steps where the waiting happens.**

Across the twenty steps from application to day ninety, Paradox sells or ships fifteen. The ones it does not
cover are steps 5, 8, 10, 16, 18 and 20:

| Step | What it is | What kind of step |
|---|---|---|
| 5 | The interview happens, or the candidate does not turn up | A wait, on the candidate's side |
| 8 | The offer is accepted, or the candidate goes quiet | A wait, on the candidate's side |
| 10 | The background check comes back | A wait, on a third party |
| 16 | Day one: the person shows up, or does not | A wait, on the candidate |
| 18 | Ramp to working unsupervised | A wait, on the store |
| 20 | Still employed at day ninety | The outcome nobody claims |

**Every single one is a wait.** Not one is a decision or a task.

That is not a coincidence and it is not neglect. A wait does not demonstrate well in a sales meeting. There is
nothing to click. The vendor cannot compress it, because the elapsed time belongs to a candidate, a county court
or a store rota. So both incumbents build for the steps they can show working, and the gaps between those steps
are unowned by anyone.

**What we do about it.** We do not claim to make those waits shorter, because nobody can. We claim to make them
visible and to stop losing the person during them. That is the whole product argument and it is why this is a
connector across all twenty steps rather than a better screening tool.

*Source: our own funnel map, built from Paradox's published product surface. Assumption tier on the coverage
column, because absence of a marketed feature is not proof of an absent capability.*

---

## The gap that is not really a gap, so nobody claims it by accident

**Paradox ships four of the post-hire steps and does not market them.** Steps 13 training, 14 employer tax
information, 17 week-one, and 19 recognition and rewards all have shipped but unmarketed routes.

So a claim that Paradox stops at the offer, or does not do onboarding, is **wrong**. Their post-hire surface
exists. Fountain's is four times its hiring surface.

**That is our activate stage, and it is occupied.** Worth knowing before anyone builds a pitch on owning
post-hire.

---

## Gaps that are real, verified, and worth building against

### A customer cannot configure their own system

Paradox's own knowledge base states that access to Assistant Messaging is limited and requires contacting a
customer success representative, and that stage transitions are configured on the backend by that
representative.

**So part of the deployed product is a Paradox employee.** For a retailer without a dedicated recruiting
operations team, every change costs a support ticket and a wait.

**What we do.** Self-serve configuration. This is one of the two things we decided "better" actually means, and
it is the half aimed at Paradox specifically.

*Verified from their own material.*

### An integrator cannot build against the thing they sell

Their public API has 53 operations behind one unlabelled link, and **exposes no AI operation at all.** No
general webhook system, no realtime, no jobs, workflows or approvals. Credentials are issued by a human. No SDK,
no public code.

The conversational product they sell is the one part their published interface does not let you touch.

**What we do.** We are a connector layer, so integration surface is not a feature for us, it is the product.

*Verified from their shipped product and documentation.*

### Thirteen products, one engine

Paradox markets thirteen conversational products. Verification across three independent runtime lanes found one
engine with thirteen skins: two supposedly different products serving near-identical content, one router in the
admin console where the products are settings sections, one entity set in the public API with no per-product
namespace, and a status page monitoring thirteen components that map to none of the thirteen products sold.

**Where the honesty matters.** Modularity is real commercially, since each customer licenses one to four of
them. It is just not separately engineered. **So this is a procurement observation rather than a product
weakness**, and overstating it would be easy and wrong.

*Verified from their shipped product.*

### The bias methodology is deferred to somebody else

Their ethical-AI page claims alignment with a US federal AI risk framework and then defers its bias-evaluation
methodology to Workday's evolving standards.

For a product that screens job applicants, deferring how you evaluate bias to another company's evolving
standards is a governance gap rather than a citation.

**What we do.** Our product scores candidates and a person decides, which makes it a regulated automated
employment decision tool in New York City and California. That brings a published annual bias audit as a
requirement, not a choice. Doing it properly is table stakes for us and is the thing employment counsel will ask
about first.

*Verified from their own material.*

### They published their own reliability problem

A dated Paradox postmortem traces roughly 13 of 45 public incidents to console slowness from legacy synchronous
endpoints inside an async architecture, with the conversion still in progress.

Quotable because they wrote it, and checkable against a status page they publish themselves.

*Verified from their own material.*

### Every case study metric is speed or cost, never quality

Not one Paradox case study metric in the corpus is quality of hire, retention or ninety-day attrition. All of
them are speed or cost.

**This is an opening and a trap at the same time, and the trap is the more important half.** Nobody claims
tenure because tenure is genuinely hard to prove. Two unrelated research methods found this independently, which
makes it the best-supported finding in this project. **Do not promise quality of hire without an evaluation
design.** Our own success measures deliberately dropped quality of hire for this reason.

*Verified from their own material.*

---

## Gaps found in the 2026 verification rounds

### Their multi-board reach is bought, not built

Paradox's native outbound job distribution is **Indeed-specific** on its own product pages. The "thousands of job
boards" reach claim is explicitly attributed to programmatic advertising rather than to any layer Paradox owns.

**What this means for us, and it is not what it looks like.** This is not an opening. It tells us distribution is
a bought commodity for everyone, which is why we should take the free routes and buy the rest rather than build
it, and why distribution must not appear in our positioning.

*Verified from their own product pages.*

### Nobody, including Paradox, reports unique people

Every major platform in this category deduplicates candidate records for hygiene and then still counts
applications. A search across ten vendors found none advertising unique people as a metric.

Paradox also does not offer cross-site comparative benchmarking, where one location's funnel is scored against
comparable locations. Only Fountain states that plainly, and Phenom partially.

**What we do.** Unique people as a first-class number, and cross-store comparison measured in people rather than
applications. Fountain compares sites on applications. Nobody compares sites on people. Each half exists
somewhere and the combination does not.

*Verified across ten vendors' own documentation. Absence of a marketed feature is weaker evidence than presence
of one, so treat this as strong assumption rather than proof.*

---

## The competitive fact that changes the shape of all of this

**Workday owns Paradox.** Announced 21 August 2025, completed 1 October 2025, for approximately $1.1 billion,
about $1.0 billion of it cash, per Workday's own quarterly filing.

The allocation is the interesting part. **Goodwill is $781 million of a $1,063 million allocation, against only
$253 million of identifiable intangibles.** Workday paid for the frontline position, not the codebase.

**So Paradox is not a standalone competitor and treating it as one is the mistake most likely to cost us.** The
thing across the table is Workday, which owns the system of record and now owns the conversational frontline
layer that sits on top of it, and separately acquired HiredScore.

That cuts both ways and both ways matter.

**Against us**, a customer already running Workday has a native path and we are the third-party option.

**For us**, Workday is a rip-and-replace vendor by nature, and our position is that the retailer keeps whatever
they already run. For a retailer on SAP, on a heavily configured legacy system, or on two applicant tracking
systems at once, Workday's answer is a migration and ours is a connector.

One oddity worth knowing: **Paradox's own website still describes the relationship as a partnership.**

---

## What we must not say

| Claim | Why not |
|---|---|
| Paradox stops at the offer, or does not do onboarding | Wrong. It ships training, employer tax information, week-one and recognition, all unmarketed |
| Paradox is slow | Their published average is three and a half days, application to first day worked. Our target is five to six. **We are slower on the only comparable figure** |
| We beat them on speed | See above. The positioning is the connector layer and the span across all twenty steps, not speed |
| Paradox does 72 hours, and we will beat it | There is no source for the 72 hour figure anywhere in Paradox's material, Workday's newsroom or Chipotle's releases |
| Their thirteen products are fake | Overstated. One engine, thirteen skins, and the modularity is commercially real |
| We will deliver quality of hire where they do not | Not without an evaluation design. It is unclaimed because it is hard, not because nobody thought of it |
| Anything from a review site about user complaints | Capped at tentative. Neither company has a public issue tracker or forum, so that route is unreliable here |

---

## The one-sentence version

Paradox is excellent at the two steps where a decision gets made and absent from the six where somebody is
waiting, its customers cannot change their own configuration, its published interface does not expose the
product it sells, and it is now a Workday feature rather than a company. **We are not trying to be a faster
Paradox. We are trying to own the parts of the journey that neither incumbent will build, because those parts do
not demo.**
