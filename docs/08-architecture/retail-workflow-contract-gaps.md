---
AUTHOR: Claude. The definition, the gap analysis and the scorecard are mine. Section "Not mine to decide"
  names the four questions that are Suniras's and Nishant's
WHAT THIS IS: what writing the retail funnel as a declarative workflow definition exposed about the shared
  contract. Four buckets, then a scorecard on whether the funnel is actually expressible
WHAT THIS IS NOT: an implementation plan. Nothing is scheduled and no code was changed
DATE: 2 September 2026
METHOD: drafted the definition, then had five independent reviewers attack it with instructions to refute
  rather than confirm. Draft 1 did not survive. This document reflects draft 2, and the corrections are
  recorded rather than absorbed, because two of them reverse claims I made confidently
COMPANIONS: retail-workflow-v0.1.yaml is the definition. retail-vs-indigo-mapping.md is the row-by-row reuse
  call. indigo-compatibility-2026-09-02b.md is the audit that led to all three
---

# Shared contract gaps exposed by retail

## The headline, and it changed under review

**The retail funnel is expressible. It needs a smaller contract extension than I first claimed, and the
extension it needs is not the one I named.**

Draft 1 argued that the E-Verify adverse action bar required a new shared primitive, a `policies` block
evaluated across the whole graph. That argument had three legs and all three broke:

**Visibility.** I wrote that a guard local to the termination edge could not see a condition established
elsewhere in the graph. That is false. Guards receive `(store, ctx, application)` at `workflow.js:517`, and the
bar reads `application.everify.decision`, a field on the application row. A guard on the termination edge has
exactly the same visibility as `adverseActionBlock()` does. I was wrong.

**Actor sensitivity.** I wrote that a transition guard could not express "barred when the employer does it,
allowed when the candidate does it". It can. Our transitions carry a `by` allowlist checked generically at
`workflow.js:496`, and two edges may share a from and a to and differ only in `by`. That pattern is already in
production for the rehire hold. Worse, **draft 1 dropped `by` from the definition entirely**, which made my
translation less expressive than the code it was describing. That was the most damaging thing in it.

**Non-edge effects.** I wrote that barring a shift removal, which is not a state change, forced an effect-class
taxonomy. It does not. `preconditions:` on the activity does it, and draft 1 used that field elsewhere in the
same file.

The arithmetic was also a strawman. I said "a guard on every edge is a policy with worse ergonomics". Twenty-five
transitions reach an adverse state, **none of them carries a guard today**, and the twenty-one withdrawal edges
come from one loop, so there are four declaration sites rather than twenty-five.

What survives is real but much smaller: **the predicate needs a name, because it is enforced at five places and
five copies drift.** Our `GUARDS` registry already is a named-predicate map. So the extension is a name for a
thing both systems have.

And in the process of losing that argument I found the gap that is genuine, structural, and was hiding in plain
sight. It is in bucket one.

---

## Bucket 1: must-have shared primitives

Two. Both argued from the twenty steps rather than from architecture.

### 1a. Named conditions

A map of name to predicate, referenced by `guard:` on an edge and `preconditions:` on an activity.

**Why it must be shared rather than local.** The adverse action bar is one rule enforced at five points: the
rejection edge, the termination edge, the employer half of the withdrawal edge, the shift-removal activity, and
three further effect classes the law bars that we do not model at all. Written inline five times, the five
copies are five things to keep in step, and the failure mode is silent: one of them gets missed and the product
does something unlawful while four other places say it does not.

**Why it is nearly free.** Both systems have it already under other names. Ours is `GUARDS` at
`workflow.js:54`, where `guard: 'eligibilityPassed'` is a string key resolved from a map. Theirs is the
condition evaluator in `core/…/workflow/*`. The contract needs to say that conditions are first-class,
addressable and reusable, which neither vocabulary currently states.

**The smallest form.** A `conditions:` map with the same resolution rule as `activities:`.

### 1b. A parallel region whose members may depend on each other

**This is the genuine structural gap and it is not about compliance at all.**

Steps 11 to 14 are eleven onboarding tasks with four dependency edges: I-9 Section 2 needs Section 1; the
E-Verify case needs Section 2; the payroll record needs both the W-4 and the direct deposit details; store
systems access needs the payroll record.

That is an arbitrary directed acyclic graph. `PARALLEL_SPLIT` and `PARALLEL_JOIN` express fork and join, which
is a strictly weaker shape. You cannot draw "these four start together, this fifth waits on two of them, this
sixth waits on the fifth" in nested fork-join without inventing intermediate join nodes that correspond to
nothing anybody in a store would recognise.

Draft 1 hid this by putting a `tasks:` list with `needs:` edges inside one node, which is a second graph wearing
a field name. A reviewer caught it and was right to.

**Why it matters more than it sounds.** This is where our product's central claim lives. The compression is not
"we run two branches at once", which fork-join handles. It is "we start the nine things that have no dependency
the moment the offer is accepted, and the two that do have dependencies start the instant their dependency
clears". A vocabulary that can only fork and join cannot describe the difference, and the difference is the
product.

**Why it is also genuinely shared.** Their `G-PREONB` gate is conditional on whether the hire is experienced,
their tracks clear on named sub-states, and their travel leg counts back from the first itinerary hop rather
than the joining date. All three are dependency reasoning. They express it in code around the graph rather than
in the graph. Both builds need the same thing.

**The smallest form.** A parallel region whose members may declare dependencies on each other, rather than a
split whose branches are independent by construction. The join half already exists on both sides, as their five
gates and our AND guards. The dependency half has no expression anywhere.

---

## Bucket 2: retail-specific configuration

These stay in our layer. Each is a product or jurisdiction concern rather than a workflow concern, and putting
any of them in a shared core would be generalising from one implementation.

**The `control` axis.** `CONTROLLABLE`, `EXTERNAL`, `OBSERVED`. This is the retail product's framing of where
value sits, and it belongs in the funnel map, not in execution semantics. It is in the definition because the
business distinction was required, and it now has three values because two of them made me classify our own
user's in-store work as external, which called the customer external. Steps 17 and 18 are `OBSERVED`: a store
manager does them, we surface state, we do not drive.

**The five US statutory clocks and their citations.** I-9 Section 2 within three business days,
`8 CFR 274a.2(b)(1)(ii)`. E-Verify case creation by the third business day. Tentative nonconfirmation, ten
federal working days as one shared window. FCRA pre-adverse, eight days. Adverse, ten. These belong in a
jurisdiction rule pack that a tenant selects. For India they are deleted, not translated.

**The adverse action bar itself.** The mechanism is shared. The rule is `us-federal`.

**The FCRA pre-adverse sequence.** Notice with two named enclosures, a gap the statute does not quantify, then
the notice. The gap duration is tenant policy precisely because the statute sets none, so hardcoding a number
would be inventing law.

**The single-tenant matching boundary.** D-030. The reason is the furnishing-to-third-parties element of
15 U.S.C. 1681a(f), and it has to be enforced at the data layer because the whole value of the rule is that it
cannot be undone by a query somebody writes in a hurry.

**Deterministic eligibility with a model forbidden.** Five rules, thresholds from the requisition row, and a
test that reads the source to prove no model runs there.

**The recommendation enum with no reject value.** Ours, and it is one of three independent guards on the same
rule.

**Work time separated from queue time at capture.** Their `StageEvent` records transitions. Ours records work
duration and derives queue from the gap between events. That distinction cannot be reconstructed later and it is
our entire product argument, so it is captured rather than computed.

**Fair workweek notice as a reported constraint.** The scheduling adapter returns whether a premium is payable
rather than silently writing the shift.

**Three retail staff roles, kept distinct.** Store manager, field HR, manager. Draft 1 flattened all three into
`HRSS_TASK`, which is how a borrowed job title quietly answers a question about your own product.

---

## Bucket 3: IndiGo-specific concepts to avoid

Not "India-specific because it appears in their document". Each of these is correct for them, and each would
cost us something specific.

**`HRSS_TASK` as a type name.** The distinction it draws against `CANDIDATE_TASK` is exactly right and worth
keeping. The word is a desk title at one airline. **`STAFF_TASK`, plus a required `actor` field**, is the same
contract without one company's org chart in it. This is the only rename worth asking for.

**`WorkflowMode` and the dual-engine seam.** The right answer to their problem and the wrong answer to ours. It
exists to protect live candidate traffic during a cutover. We have none, so we can make our one engine the
dynamic one and never have two.

**Their two reconcilers.** `reconcilePreJoiningApplications` runs every sixty seconds to observe durable state
and signal the matching `EVENT_WAIT`. A single-authority engine does not reconcile against its own database.
The reconcilers are the price of two authorities over one truth, and needing them would be the signal that we
accidentally built two engines.

**Temporal.** Not a primitive. One implementation of durable orchestration, and the primitive is the interpreter
we already have. Their own production runs with it off.

**The journey mirror.** Their own section 6.1 names the cost: the same journey state lives in up to three places
with non-identical vocabularies, `MedicalBgvTrackMapping` is the translation layer, and writing one copy and not
the others is the split-brain defect class that stranded candidates historically. One authority per fact.

**Minting the pipeline row at offer-accept.** The structural reason retail cannot be a second workflow on their
current runtime. Our steps 1 to 6 would have nowhere to live.

**`Stage` and `Track` as compiled enums.** On both sides. Ours is a module `const` and theirs is a Java enum,
and neither can host the other's stages.

**The non-adjacency override rule.** Worth having the audit distinction, worth dropping the rule. Their
`StageService.advance` rejects a non-adjacent stage jump unless overridden, which is a concept from a linear
enum. A graph has no adjacency. The graph equivalent is narrower: an override is an edge taken with a failing
guard, or an edge taken that the definition does not contain.

**Medical, travel, hotel and the itinerary model.** We have no medical step and step 15 is a shift in one store.

**The seven voice agents and their telephony.** Two rules transfer and the rest does not. One agent per purpose
with no fallback between them, because a silent fallback produces a working call reading the wrong script. And
dispositions returning on a webhook into a table that maps them to state effects.

**Their vendor adapters.** Around two hundred SuccessFactors field keys, numerically pinned status ids, six
ServiceNow case kinds, AuthBridge token expiry surfacing as HTTP 400. Adapter knowledge, correctly held in
adapters.

**One instance of their own principle, which they have already flagged.** `OfferService` mails when the vendor
call cannot be made, hiding the error behind a successful mail. That contradicts their principle eight, fail
loud over fail plausible, and their runbook says so. The principle is worth copying. That instance is not.

---

## Bucket 4: existing primitives that are sufficient

The largest bucket, and the reason the verdict is what it is. Nothing below needs any change.

| Primitive | Sufficient because |
|---|---|
| The ten node types | Nineteen of twenty steps land in them. The twentieth is the task DAG, which is bucket 1b, not a missing node type |
| `ACTIVITY` for AI work | Their choice not to have an `AI_ACTIVITY` type is correct. An AI stage is a stage whose implementation calls a model |
| `EVENT_WAIT` | Covers the check return, the E-Verify case state and day-one attendance. Our `waiting_on` field is an addition worth contributing and the contract works without it |
| `TIMER` | Covers the offer chase, the offer expiry, the delay surfacing, the FCRA gap and the 30/60/90 chain. Business-day-in-UTC arithmetic is a property of the rule pack, not of the node |
| `DECISION` | Covers eligibility routing and check-outcome routing. Our guard registry is a condition evaluator without a node wrapper |
| `CANDIDATE_TASK` and `HRSS_TASK` | The right distinction. Only the second name is wrong |
| Versioned insert-only definitions | Verbatim. Nothing about retail changes it |
| Per-application binding and version pinning | Verbatim, and it is the thing we most lack |
| Per-requisition workflow selection | We independently have a per-requisition process branch in `requiresManagerInterview` |
| `guard` on an edge | Free slots on all twenty-five adverse transitions today. This is what draft 1 tried to replace with a policy engine |
| `preconditions` on an activity | Solves the non-edge half of the bar |
| `by` on an edge | Ours. Solves the actor-sensitive half, and the two-edges-differing-only-in-`by` pattern is in production |
| Append-only event and action logs | Both have them. Ours adds refusals as first-class, theirs adds application scoping. Take both |
| `ExceptionItem` | Both have it. Ours adds a blocking semantic |
| Ports and adapters with mock and live twins | Theirs is more rigorous than ours and needs nothing from retail |
| The immutable AI decision record | Ours. `llmCalls` with provider, model, prompt version, input refs and no chain of thought |

Two things about our own implementation that the exercise confirmed rather than exposed. **The refusal path is
better than I gave it credit for**: four distinct refusal kinds, each with a human-readable reason, each writing
an audit entry, and none of them moving the candidate. That is exactly the behaviour the adverse action bar
needs, and it already exists. And **the exception mechanism is doing more work than the state machine**: the
FCRA adverse path is enforced today by a blocking `adverse_review` exception rather than by a branch in the
graph, which is why draft 1 accused our code of a fault it does not have.

---

## The adverse action bar, resolved

The requirement, exactly:

> `REJECTED` and `TERMINATED` are prohibited while `everify.decision === 'contesting'`. So is an
> employer-recorded `WITHDRAWN`, and so is removing a scheduled shift. Every blocked attempt is recorded.

**Where it belongs: a named condition, referenced from four existing enforcement slots.** Not a policy engine,
not an authorization constraint, and not a node type.

| Enforcement point | Mechanism | Exists today |
|---|---|---|
| `end_rejected` | `guard: noAdverseActionBar` on the edge | The slot exists and is empty |
| `end_terminated` | `guard: noAdverseActionBar` on the edge | The slot exists and is empty |
| `end_withdrawn` | **Two edges.** `by: [external]` unguarded, `by: [human]` guarded | The pattern is in production for the rehire hold |
| `shift.remove` | `preconditions: [noAdverseActionBar]` | The field is already in use elsewhere |

**Why not an authorization constraint.** Tempting, because the withdrawal case is actor-sensitive and we already
have an actor allowlist. But the bar is conditional on external state that changes over time, and an allowlist
that is edited as a case progresses is a configuration change masquerading as runtime state. The condition
belongs in a guard where it is evaluated, not in an allowlist where it is stored.

**Why not a `DECISION` node before each adverse edge.** A decision routes, and every branch has to go
somewhere. The bar needs to refuse the acting actor and leave the candidate exactly where they are. A failed
guard already does that: it returns `guard_failed` with a reason from `guardReason()` and changes no state.

**Why not a gate.** A gate parks the candidate. The bar refuses the actor.

**And why the gate-versus-policy distinction I drew was empty.** I wrote that a gate says "not yet" and a policy
says "never while this is true", then wrote `lifts_when` two lines later. Those are the same claim. A
prohibition with a lift condition is a hold.

**The audit requirement needs nothing new.** `transition.refused` with outcome `refused` already records the
actor, the actor type, the from and to, the guard and the reason. Four refusal kinds already exist. One honest
note: a refusal writes to the action log only, and no workflow event is written, so **a refused action is
currently invisible to the funnel and to metrics.** That is a gap to close by adding an event, not by adding a
primitive.

**Three effect classes the law bars and we do not model at all:** withholding or reducing pay, suspension, and
delaying training. They are named in the definition and attached to nothing, because attaching a bar to an
effect that does not exist is how draft 1 ended up with a node whose bar barred nothing.

---

## Parallelisation, which is the point

Three regions, and what each buys.

**The screening set, steps 3 to 5.** Not sequential, and draft 1 had this wrong. `createScreening` makes an
agent screening always, plus a manager interview where the requisition asks for one, and one AND guard
(`allRequiredScreeningsDone`) joins them. So the interview is a second member of a parallel set, not a stage that
follows the screening. Where a role does not need one, steps 4 and 5 are honestly marked not-required rather
than silently skipped.

**The post-acceptance fan-out, steps 9 to 14.** The load-bearing one. Two branches start the moment the offer is
accepted:

- The background check may be ordered at acceptance **because the FCRA standalone disclosure and authorisation
  were captured at step 8**. That precondition is why the ordering is lawful and it is on the node.
- The onboarding forms may be issued at acceptance **because none of them requires the check to have returned**.
- Inside the onboarding branch, nine of eleven tasks have no dependency and start together. Two do:
  the payroll record waits on the W-4 and the direct deposit details, and store systems access waits on the
  payroll record.
- Two more are deferred entirely, because I-9 Section 2 and the E-Verify case cannot lawfully be discharged
  before the first day of work for pay. Excluding them from the pre-shift gate is correctness, not convenience,
  and including them parked every candidate at step 11.

**What happens when one branch finishes and the other has not.** Nothing. The interface shows which one is
outstanding with an age on it. A branch that finishes early does not make the candidate ready and must not read
as though it did, which is the same trap their section 8.4 records as a green tick meaning "entered" rather than
"happened".

**What blocks and what does not.** A slow agency raises `check_delay` at warning severity and does **not** block,
because a slow vendor is no reason to stop an onboarding branch that has nothing to do with it. A check that
returns a record raises `adverse_review` at critical severity and **does** block. And one honest correction:
`blocksProgress` stops `settle()`, and `settle()` only fires edges marked auto, so a blocking exception on a node
with no auto edge out is a queue-priority flag rather than a block. `offer_quiet` is one of those.

**The two post-start regions do not converge.** The statutory track ends at a settled E-Verify case state. The
activation track ends at day ninety. Forcing a join would make day ninety wait on a government department, so
`split_after_start` is `mode: ANY` with no join. Draft 1 had `mode: ALL`, no join, and the two branches running
into each other, which was malformed.

**One thing not to claim.** The two figures the fan-out records, sequential estimate and critical path estimate,
are sums of the same per-task constants over the same eleven tasks. Their ratio therefore does not vary between
applications, and neither figure is a measurement. Observed wall clock is recorded separately and is not
comparable to either.

---

## The human decision boundary

Made explicit at four nodes, and the enforceable form is `by:` rather than prose.

| Node | Rule |
|---|---|
| `s6_decision`, hire or reject | Both exits `by: [human]`. No model, no rule and no bulk action without a named person |
| `h2_rehire_review`, prior record review | Both exits `by: [human]`, and both require a reason |
| `branch_i9_s2`, I-9 Section 2 | `by: [human]`. Signed under penalty of perjury, so no model can sign it |
| `h12_tnc`, the mismatch decision | `by: [human]` |

What the AI does: screens, scores, cites evidence, summarises, prioritises, flags exceptions, initiates
workflows, and advances a candidate as far as a decision. Its ceiling is written into the state machine, not
into a comment: the recommendation enum has no reject value, and `SCREENING_COMPLETE → DECISION_PENDING` is the
last edge an agent may take.

**One correction to how I stated the evidence.** Draft 1 said three independent implementations put this rule
behind a person. That is true of **candidate rejection** and overstated on two counts. hrX is the weakest of the
three: it says auto-reject almost never and then provides an auto-reject threshold as a governed configuration
knob, which governs the thing rather than prohibiting it. And **termination has only one implementation, ours**,
because their funnel ends at induction and has no employment to end.

So: rejection behind a person is well evidenced across three builds. Termination behind a person is our position
alone. Neither is a platform primitive.

**What is not configuration is who may change it.** The rule is `by: [human]` on four edges, which anybody with
edit rights could widen. So the definition carries a `governance` block, borrowed from hrX section 12: editing
`by` on an edge reaching rejection, termination or withdrawal requires approval and writes an immutable record
of who changed what, from what, to what. A silently widened allowlist is an incident, and the tier is what makes
it a visible one.

---

## Rehire

A conditional acceleration, not a separate graph. It changes what the onboarding tasks **do**, not which nodes
exist, which is why it is a task-level reuse plan.

**Detection** reads this customer's own records only, per D-030. The identity key is normalised name plus date of
birth plus the last four digits of the phone number, and it deliberately excludes a social security number: an
I-9 does not require one unless the employer uses E-Verify, it does not exist at application time, and
collecting it earlier creates a custody problem for no gain. Two match confidences, and a partial match is a
suggestion for a person to confirm rather than a fact, tuned to under-merge because wrongly joining two people
attaches one applicant's rejection to somebody it does not belong to.

**A do-not-rehire match does not auto-reject.** It parks the application in front of a person with a blocking
exception, and both exits require a reason, because the record may be wrong and the only way to find out is to
ask somebody who was there.

**The reuse plan already has six verbs in our code**, which is the answer to "skip only what the rule permits":

| Item | Verb | Basis |
|---|---|---|
| I-9 Section 1 | `update-and-reverify` | Within three years of the **initial execution** of the previous form, `8 CFR 274a.2(c)(1)(i)`. Not from separation, and getting that wrong in either direction is a paperwork violation |
| Training | `carry-forward`, else `retake` | Whether the certification has expired |
| Payroll record | `reactivate` | A prior employee id exists |
| E-Verify case | `never` | A new case is required for every new hire |
| Background check | `fresh-order` | FCRA sets no shelf life, so a prior report is not unusable. **This customer's policy says order fresh, and policy is the constraint here, not the law** |

The threshold is not stated as a number anywhere the source material does not establish one. It is tenant and
jurisdiction configuration.

**Every shortened path carries why it was shortened.** A collapsed journey with no record of the reason is
indistinguishable from a skipped obligation.

---

## Scorecard: is the workflow actually expressible

Judged against the twenty real steps, twenty-seven states, fifty transitions and eleven tasks, not against
architectural theory.

| Category | What falls in it |
|---|---|
| **Fully expressible with existing primitives** | The graph shape: 42 nodes across all twenty steps in the ten node types. All four human decision points. The three parallel regions and both joins. Every external wait. Every timer. The two routing decisions. The withdrawal fan. Append-only events, actions and the AI decision record. The exception queue. The refusal semantics, which turn out to be exactly what the adverse bar needs |
| **Expressible with configuration** | Every eligibility threshold, already on the requisition row. Per-role process variation, already `requiresManagerInterview`. The five statutory deadlines and their citations, as a jurisdiction rule pack. The FCRA gap duration, as tenant policy. The rehire reuse verbs and their threshold. The human-only rule, as `by: [human]` plus a governance tier on who may edit it. Message templates. SLA thresholds |
| **Requires a small contract extension** | **Two things.** `conditions`, a named-predicate map, which is a name for something both systems already have. And a parallel region whose members may declare dependencies on each other, which neither has |
| **Requires a fundamentally new primitive** | **Nothing.** Draft 1 said the adverse action bar did. It does not |

**One node type name should change and it is not a primitive question.** `HRSS_TASK` to `STAFF_TASK`, plus a
required `actor` field so three retail staff roles are not flattened into one airline desk title.

**Twelve field additions beyond those two are declared in the definition as convenience rather than contract**,
including `control`, `waiting_on`, `provenance` and the law fields. Draft 1 claimed one extension and made about
a dozen, which for a document whose purpose is to state the contract delta was the worst kind of error.

---

## Not mine to decide

**Whether to ask Srikanth's team for the `STAFF_TASK` rename and the dependency-region extension.** Both are
small. Asking now rather than after either side builds is the difference between a contract and a fork. But they
have three unclosed release gates and a hundred-day token expiry, so the cost of asking is not zero.

**Whether adopting versioned definitions in rows is worth reopening the zero-dependency rule.** The JSON file
cannot carry versioned tenant-scoped definitions or a second tenant's ids. That rule is what makes the demo
runnable by anybody with Node and no credentials, and it has earned an explicit decision rather than a quiet
erosion.

**The 20 September demo date.** This definition is compatible with it, because it is a document. Implementing it
is not.

**Whether termination behind a named person survives contact with a customer.** It is our position and only
ours. A retailer's employment counsel may want it, or may want the opposite.

---

## What the review process found, recorded because it will happen again

Five reviewers, instructed to refute rather than confirm. Draft 1 did not survive, and the two worst findings
were not the architectural ones.

**A fabricated provenance tag.** I marked `everify.create_case` as implemented in the IndiGo build. E-Verify
appears **zero times** in their document. The field exists specifically to prevent claiming a capability exists
because it appears in a YAML file, and it was the field carrying the error. The first correction then
over-corrected to `neither`; it is in fact ours, a simulated adapter op at `connectors/index.js:81` actually
called from `tick.js:190`.

**An accusation against our own code that was a misreading.** Draft 1 said our implementation auto-advances a
background check that comes back with a record found, and used it as the one place the definition caught us out.
`closeBackgroundCheck` sets the outcome to `adverse_possible` and raises `adverse_review` with
`blocksProgress: true`, and `settle()` returns immediately when a blocking exception exists. The advance is
stopped. The narrower true observation survives: the enforcement is an exception rather than a branch, so the
FCRA sequence is not a path anybody can read off the definition, which is what writing it as nodes fixes.

Both errors point the same way. **The confident claims were the wrong ones.** The parts of draft 1 that survived
were the boring transcriptions: the eleven tasks matched the source field by field, the state and transition
counts were right, the law citations were right, and the external-wait modelling held up under the hardest
attack because it was copied rather than reasoned.

---

## VERDICT

### CONTRACT IS READY FOR SRIKANTH REVIEW

Three artifacts, and the contract question they were written to answer has a defensible answer:

- **The retail funnel is expressible.** Forty-two nodes, all twenty steps, in their ten node types. Nothing
  needs a fundamentally new primitive.
- **The extension needed is two things, both small.** A named-conditions map, which is a name for something both
  systems already have. And a parallel region whose members may depend on each other, which is the one genuine
  structural gap and which both builds need.
- **The adverse action bar does not need a new primitive**, which reverses what the compatibility audit
  concluded three days ago and what draft 1 of this definition argued at length. A named condition on four
  existing enforcement slots covers it, and our existing refusal semantics already provide exactly the
  behaviour it requires.
- **One rename is worth asking for**, `HRSS_TASK` to `STAFF_TASK` with a required actor.
- **Every claim carries its provenance, and the two that were wrong are recorded as wrong** rather than quietly
  fixed, because a reviewer needs to know which parts of this document have already failed once.

The one thing to say out loud in the review: this is a document, and the definition being expressible is not the
same as the definition being implemented. Six activities in it are implemented by nobody on either side.
