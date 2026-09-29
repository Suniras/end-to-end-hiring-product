---
AUTHOR: Claude. Assembled from decisions already taken, chiefly D-025 and D-018, and from honesty rules already
  written into the code and into CLAUDE.md. Where a row is not covered by an existing decision it says so and
  names the owner
WHAT THIS IS: the boundary between what the demo must genuinely do, what it may simulate, what it may only
  depict, and what it must never fake
WHAT THIS IS NOT: new policy. Almost every row here is an existing rule restated in one place so that "good
  enough for the demo" is a decision taken in advance rather than under pressure at the end
DATE: 2 September 2026
COMPANIONS: retail-implementation-decision-register.md and retail-implementation-sequence.md.
  Phase 5 validates against this document
---

# Demo against platform: the four buckets

## The rule this whole document serves

D-025, 25 August 2026: **the demo standard is synthetic data with real computation and simulated connectors.**

The distinction that makes it work, in the standing brief's own words: *"Synthetic data does not equal mocked
product behavior. The data can be synthetic. The computation, workflows, state transitions, filtering, scoring,
timestamps, audit trail and LLM calls must be real."*

So the four buckets are not four levels of quality. They are four different claims, and the failure mode is
making the wrong claim rather than building the wrong thing.

| Bucket | The claim being made |
|---|---|
| **1. Genuinely functional** | This works. Press it and the system changes. |
| **2. Simulated behind an honest adapter** | The shape is real, the far end is not, and the screen says so. |
| **3. Depicted only** | You are looking at a record of something that did not happen here, and the screen says so. |
| **4. Must not be faked** | Any version of this is a false statement about the product. |

---

## Bucket 1: must be genuinely functional

Nothing in this bucket may be stubbed, hardcoded or short-circuited. Most of it already works; the rows marked
otherwise are phase 1 and phase 2 work.

| Capability | Status today | Why it cannot be faked |
|---|---|---|
| Every state change | Works. `transition()` is the only path | If the state machine is fake, nothing built on it means anything |
| Actor permissions on every transition | Works, generically checked | This is what makes the human-only rules enforceable rather than decorative |
| Refusals, with a reason | Works. Four kinds, each writing an audit entry | A product that silently does nothing is worse than one that refuses |
| Guards | Works. Eight named guards | A gate that does not actually gate is the exact failure their section 16.3 opens with |
| The auto-advance loop | Works. `settle()` scans the transition table | The parallelisation claim depends on work starting when it can |
| Blocking exceptions | Works. Stops the loop, never a person | Half of the exception-based operating model |
| Every duration reported | Works, derived at read time from events | Named in the standing brief: "If it produces 8.3 days, show 8.3 days" |
| Work time separated from queue time | Works, captured at the event | Cannot be reconstructed later, and it is the product argument |
| The eleven-task dependency graph | Works | This is where the compression is |
| Deterministic eligibility, with no model in it | Works, and a test reads the source to prove it | D-016 and the automation breakdown both put step 2 in category A with "nothing, deliberately" for AI |
| The rehire lookup, scoped to one tenant | Works, enforced in the query layer | D-030. The whole value of the rule is that it cannot be undone by a query written in a hurry |
| Tenant isolation | Works. `all()` and `insert()` throw without a tenantId | Same |
| Statutory clock arithmetic | Works, recomputed on every read from a date on the record | A compliance deadline that is a hardcoded string is a lie about a legal obligation |
| The adverse action bar | Works, two enforcement surfaces | Making regulatory behaviour less conservative for demo convenience is on the do-not-change list |
| The whole assistant loop | Works. Ask, confirm, execute, audit | Named in the standing brief: the assistant must never fabricate that it performed an action |
| Confirmation levels, including human decision | Works, and 57 safety cases guard it | |
| Persistence across a restart | Works, verified by a test that restarts the process | Named in the standing brief: refreshing must not erase the workflow |
| The model call, when a key is set | Works. Two providers, forced structured output, validated | |
| The AI decision record | Works. `llmCalls`, no chain of thought stored | Every AI hiring regulation assumes you can produce one per decision |
| Consent, retention, deletion | **Absent.** Phase 1 | Committed to in the PRD. A demo that shows a retention clock and computes nothing is bucket 4 |
| Authentication and a real actor type | **Absent.** Phase 1 | Until it exists, `by: ['human']` protects the test suite rather than the product |
| An application intake writer | **Absent.** Phase 2 | Step 1 is currently a schema with no code path |
| The FCRA path as a graph path | **Enforced by a blocking exception, not a branch.** Phase 2 | It works today. It is not legible in the definition |

---

## Bucket 2: may be simulated behind an honest adapter

The shape is real: a call goes out, it takes time, it comes back with a reference the far end owns, it can fail,
and a failure is retryable or it is not. All of that is recorded whether it succeeded or not.

**The three rules that make this bucket honest, and all three are already in the code.**

1. **`mode: 'simulated'` on every call row and every response**, and the interface prints it.
2. **`vendor: null` by construction.** The adapter registry has no vendor field to fill in, which is what makes
   "Connected to Workday" impossible to write by accident.
3. **Latency is derived from a hash of the payload, not a random number**, so the same order takes the same time
   on every run. A demo that produces different numbers each time cannot be tested.

| Adapter | What it stands in for | Simulates |
|---|---|---|
| `ats` | The retailer's applicant tracking system and job boards | Posting an opening, pulling applications |
| `background_check` | The screening agency | Ordering, polling. D-014: we order and track, we never perform |
| `everify` | The embedded I-9 and E-Verify vendor | Creating a case, polling case state. D-022's hard requirement is recorded on the adapter itself |
| `hris` | Payroll and the human resources system of record | Creating an employee, reactivating a prior one |
| `scheduling` | Workforce management | Writing a shift, and reporting whether a fair workweek premium is payable rather than silently writing it |
| `identity` | The directory and store systems access | Provisioning |
| `learning` | The learning management system | Assigning training |
| `messaging` | Email and SMS | Recording the message and marking it delivered. Nothing leaves the machine |

**Two things this bucket is allowed to do that look like cheating and are not.** Inject a deterministic failure
when the caller asks for one, so at least one connector error and its retry are visible on screen. And return a
plausible external reference, because the product's job is to hold that reference and show it, not to have
invented it.

**One thing it is not allowed to do.** Fail at random. Nothing fails at random, because a demo that behaves
differently each run cannot be tested and cannot be trusted.

---

## Bucket 3: depicted, without performing the external operation

The narrower bucket, and the one most easily abused. A row belongs here only when the *record* is the product
and the *act* is somebody else's.

| Thing | What appears | What does not happen | How it is labelled today |
|---|---|---|---|
| The outbound voice screening call | A transcript with per-turn content, a duration, and an evaluation against the phrase bank | No number is dialled. No audio exists | The adapter carries an `unimplemented` string on the voice op |
| The screening conversation itself | Seeded transcripts, replayed through the real engine with the clock wound back | No candidate said these words | Synthetic data under D-025 |
| Email and SMS bodies | The message, its template id, its status, its recipient | Nothing is delivered | `mode: 'simulated'`, and the record exists rather than a button changing from Send to Sent |
| The background check report contents | Which searches ran, which returned, which found a record | No agency ran a search | `mode: 'simulated'` |
| E-Verify case status | The case reference and its state, driving the clocks | No case exists at any government department | `mode: 'simulated'` |
| Uniform, badge and systems provisioning | The task, its owner, its dependency, its completion | Nothing is ordered or provisioned | Task rows with estimates marked as estimates |
| The thirty-six people | Names, applications, answers, prior employment | None of them exists | Invented, and the tenant row carries `fictional: true` |
| The retailer | Sunfield Markets, 412 stores, 14 states | Does not exist | The org row says so, with a note that it is deliberately mid-market rather than big-box |

**The test for this bucket.** If a viewer could reasonably believe the external act occurred, the row is in
bucket 4 instead. The voice call sits here rather than in bucket 4 only because the interface says the transport
is not wired up. Remove that label and it moves.

**One row here needs a correction, and it is in the code as well as the README.** The voice op's
`unimplemented` string says Nurix has shipped a live voice screening agent on another build. IndiGo's seven
voice agents are all notify, nudge, capture and confirm; none holds an open conversation or scores an answer. If
the claim means Unifi it may hold, but that slide is on record here as self-contradictory. **Settle it or remove
it before the demo.**

---

## Bucket 4: must not be faked

Every row is a false statement about the product rather than a simplification of it. Several of these have
already happened, which is why they are written down.

### About the model

**Never describe the deterministic fallback as a model call.** With no key, a phrase-bank rubric runs, and the
response carries `mode: 'deterministic-fallback'` with the literal sentence "No model ran." The browser keys its
provenance line on whether a model ran, so a fallback cannot render as a model result. This is the single most
important honesty rule in the build and it exists because the brief demanded it explicitly.

**Never store chain of thought.** Not requested and not stored. The evaluation, the cited evidence and the
confidence are kept.

**Never let a model produce a rejection.** The recommendation enum is advance, review, insufficient evidence.
There is no reject value, enforced twice.

### About integrations

**Never name a vendor we have not integrated.** No "Connected to Workday", no logo wall. The adapter registry
has no vendor field precisely so this cannot be written by accident.

**Never mark an external step complete because we initiated it.** The check completes when every search has
returned, not when the order was placed. The E-Verify case completes when it reaches a terminal state, not when
it was created. Day one completes when a manager records attendance, not when the shift was written.

**Never let a button change state without recording the action.** Send to Sent with no audit entry is named in
the standing brief as a specific prohibition.

### About numbers

**Never put a fabricated duration on screen.** From the brief: do not put fabricated values into the interface
just because they make the demo look good.

**Never present a constant as a measurement.** This one is live: `savedPct` is 19.0063 per cent for every
application, because both of its inputs are sums of the same per-task constants. The code comment is honest and
the screen is not. Either label it as a hypothetical or derive it.

**Never mix an estimate with a measurement in one comparison.** Sequential estimate against critical path
estimate is arithmetic about the shape of the work. Observed wall clock is not comparable to either, and
subtracting it from an estimate once produced a number that looked like a saving and was not.

**Never use any number on the EVIDENCE.md prohibited list.** It is load-bearing and it is there because these
have all circulated. The list currently includes: "Paradox does 72 hours", which has no source anywhere; 19 per
cent of grocery hires being returning workers, which was put in front of Suniras and withdrawn the same day, the
real figure being 8.9 per cent from Census data; 33 per cent and 35 per cent boomerang figures; the UKG
20 per cent; the Spirit Halloween 11.8 per cent; and any staffing-vendor 72-hour figure quoted as a time to
hire. **Read that list before quoting any figure.**

### About regulation

**Never make regulatory behaviour less conservative for demo convenience.** The adverse action bar stays on. The
three-business-day I-9 clock is not widened because it makes a screen look better. The FCRA gap is not
collapsed, because the statute's word is reasonable and it cannot be collapsed.

**Never let the assistant approve or reject anybody.** Three independent guards, and 57 safety cases. Two of the
fourteen cases added during the August rebuild found real holes: a singular send acting on one of two named
people, and "clear out everyone under 50" resolving to a bulk approval of the weakest candidates.

**Never pool candidate records across tenants.** D-030. It is a change of legal status, not a feature.

**Never write a credential into a repository file.** Including the sandbox key at
`docs/00-context/unifi/.../Nurix Test API key - Sandbox.txt`, which has never been opened and whose contents are
recorded nowhere.

### About the funnel

**Never silently change the twenty steps.** Same twenty, same four owners, same classification. D-013 puts all
of them in scope and the seventeen-of-nineteen ratio is the product argument.

**Never remove auditability.** Three append-only logs. A refusal is recorded. An override is distinguishable
from normal progression.

---

## The one place the demo currently breaks its own boundary

The overview page at `demo/index.html` makes zero API calls and presents invented figures with no label:
applications counted, a number screened over a weekend, an agent score. The product pages label provenance
rigorously; this page does not.

That is a bucket 4 violation on the page a reader sees first, and it needs a decision rather than a design.
Three options, and the choice is Suniras's:

1. **Wire it to the API**, so its figures are the real derived ones.
2. **Label it as illustrative**, plainly, in the same way every other simulated element is labelled.
3. **Remove it**, and let `app.html` be the front door.

---

## What phase 5 checks against this document

- Every screen showing a connector result shows the simulated mode.
- No screen describes a fallback as a model.
- No screen names an unintegrated vendor.
- No external step reads as complete on initiation.
- Every action recorded, every override distinguishable, every refusal auditable.
- Every number on screen traces to an event or carries an estimate label.
- No prohibited figure anywhere.
- The overview page resolved one of the three ways above.

A screen that fails any of these does not pass because the demo is soon. That is the entire reason this document
exists before phase 3 rather than after phase 4.
