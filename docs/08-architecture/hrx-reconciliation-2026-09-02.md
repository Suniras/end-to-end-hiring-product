---
AUTHOR: Claude. The audit, the verification and the technical recommendation are mine. The business half of
  the merge decision is Suniras's and Nishant's, and section 12 says which half is which.
WHAT THIS IS: a read-only architecture audit of the retail hiring demo as it stands on 2 Sep 2026, reconciled
  against the hrX greenfield build plan handed over by Srikanth
WHAT THIS IS NOT: an implementation plan, an estimate, or a commitment to build anything. Nothing here is
  scheduled. No code was changed to produce it
DATE: 2 September 2026
METHOD: nine parallel read-only subsystem audits, then four adversarial verifiers instructed to refute rather
  than confirm the four claims that decide the answer. One claim survived intact. Three were corrected. The
  corrections are in the text, not in a footnote
---

# Can the retail product and hrX be two configurations of one platform

## The short answer

**Partially merge.** The engine can be shared and most of it already exists on our side. The compliance layer
cannot be shared and should not be attempted. The two products overlap on a narrower span than either document
suggests, and the overlap is the middle of the funnel rather than the whole of it.

The one number that matters: **our workflow engine is a table-walking interpreter with string-keyed guards and
effects, and its body contains no state names.** That is the hard part of hrX's section 12 already built. What
is missing is not table-driven design. It is a persistence layer and a tenant scope for the table.

Two things found during the audit need attention regardless of what is decided about platforms, and they are in
section 12 under "found while auditing".

---

## 1. Current repo architecture

### The shape

One Node process. No dependencies, no `node_modules`, no bundler. `node:http` serves the browser and the API,
`node:test` runs the suite, `fetch` calls the model. The browser is plain JavaScript in classic script tags.
This is a standing rule in the repository and it is what makes the demo runnable by anybody with Node and
nothing else.

```
demo/
  server/index.js          HTTP, routing, static serving, the .env loader
  server/lib/
    store.js               persistence, and where tenant isolation is enforced
    schema.js              the state machine: 27 states, 50 transitions
    workflow.js            the only way an application changes state
    tick.js                the clock-driven advance, and the task cascade
    rules.js               deterministic eligibility, and the rehire lookup
    compliance.js          five US statutory clocks, recomputed on every read
    metrics.js             every duration the product reports
    llm.js                 the only place a model is called
    screening.js           the AI screening stage
    connectors/index.js    eight simulated adapters behind one call log
    events.js              three append-only logs plus the outbox
    views.js               server-side view assembly, one function per screen
    seed.js                36 people, replayed through the real engine
    agent/tools.js         25 tools, the only things that can change data
    agent/runtime.js       one assistant turn, two routes, one tool registry
  js/                      the browser: router, eleven screens, the assistant panel, the classifier
  js/steps.js              the canonical 20-step funnel table, read by server, browser and tests
```

### Persistence

One JSON file, `demo/server/data/state.json`, written atomically to a temp name and renamed over the target.
Writes are coalesced on a 25ms dirty flag. Twenty-one tables, declared as one string array at
`store.js:33`. No schema, no DDL, no migration, no index. Every query is a full `Array.filter`.

Live contents: 1 tenant, 5 stores, 8 requisitions, 36 candidates, 36 applications, 41 screenings, 165
onboarding tasks, 702 workflow events, 284 audit events, 194 connector calls, 30 model-call records.

### Tenancy

**Real, structural, and single.** `store.all()` throws without a tenantId. `insert()` throws without one.
`where` and `find` are derived from `all` so they cannot be widened. `byId` returns null across a tenant
boundary. All 166 store call sites in `server/lib` honour it, including the prior-employment lookup that D-030
makes a legal boundary rather than a preference.

The gate is genuine. Multi-tenancy is not implemented above it. `TENANT` is a module constant at `seed.js:34`
and `index.js:88` sets it on every request, so there is exactly one tenant and no request path to a second.

### The process model

`STATES` is an object literal of 27 keys at `schema.js:34`. `TRANSITIONS` is an array of 29 edges plus 21
withdrawal edges generated at module load, 50 in total. Neither is a row in a table. There is no `pipelines`
table, no process version, and no field on an application naming the process it started under.

What is genuinely data-driven, and it is more than it first looks:

- Guards and effects are referenced by string name and resolved through two registries, `GUARDS` at
  `workflow.js:54` and `EFFECTS` at `workflow.js:82`. Eight guards, eighteen effects.
- Permissions are an actor allowlist carried on the transition row and checked generically at `workflow.js:495`.
  Two rows may share the same from and to and differ only in who may take them.
- `settle()` scans the transition table for auto edges rather than following a scripted chain.
- Onboarding parallelism is an eleven-task `needs` dependency graph at `schema.js:207`.
- Per-requisition variation already exists as row data. `requiresManagerInterview` decides whether funnel steps
  4 and 5 happen at all for a role. Eligibility thresholds come from the requisition row.

So the topology is code and the parameters are data.

### The event model

Three purpose-separated logs, each with exactly one writer, all in `events.js`:

- `workflowEvents`, 18 fields, what moved and how long the work took
- `auditEvents`, 14 fields, who did what and why, with `outcome` of ok, refused or failed
- `agentActions`, 16 fields, every assistant turn including refusals and confirmations

Plus `communications` (the outbox), `connectorCalls`, `llmCalls`, and two deliberately mutable case tables,
`exceptions` and `pendingActions`.

Nothing in the shipped code mutates a stored workflow, audit, agent or model event. That property is a
convention, not an invariant. See section 7.

### The model boundary

`llm.js` is the only file that opens a connection to a model. Two providers, Anthropic and OpenAI, both with
forced structured output. Every reply passes a hand-written validator before it can reach a screen, and an
invalid reply becomes a visible failure rather than a half-populated evaluation.

The strongest property in the file: `recommendation` is an enum of `advance`, `review`,
`insufficient_evidence`. There is no reject value, enforced in the schema and again in the validator.

With no key, a deterministic phrase-bank rubric runs, stamped `mode: 'deterministic-fallback'` with the literal
sentence "No model ran." The browser keys its provenance line on whether a model ran, so a fallback cannot
render as a model result.

### The integration boundary

Eight adapters: `ats`, `background_check`, `everify`, `hris`, `scheduling`, `identity`, `learning`,
`messaging`. Every one is a pure function of its payload returning a content-hashed external reference and a
declared latency. Every attempt lands in `connectorCalls` stamped `mode: 'simulated'`. `vendor` is `null` by
construction, and the adapter registry has no vendor field to fill in, which is what makes "Connected to
Workday" impossible to write by accident.

Request payloads are redacted on the way in. Responses are stored raw.

### The assistant

Twenty-five tools in a flat array: 14 read, 11 write. Three confirmation levels, `none`, `confirm` and
`human_decision`. Both routes to a tool call, the local classifier and the model, converge on one registry via
`T.BY_NAME`. Eight of the eleven write tools route their mutation through `WF.transition`.

### Surfaces

Eleven routes, registered in a plain object at `views.js:1485`: deck, decide, screening, pipeline, candidate,
funnel, flag, compliance, checks, sources, store. Every screen is server-assembled: the router fetches
`GET /api/view/<route>` and the server returns the whole payload from one function per screen. The browser
holds one variable of state and nine of eleven screens do nothing but format it.

There is a twelfth server view, `audit`, that is routed and has no screen.

There is a second, independent surface: `demo/index.html`, the overview page. It loads only `motion.js` and
`landing.js`, makes zero API calls, and its figures are literal arrays.

### Tests

62 server cases across five files, plus a 2-case API walk that spawns a real server and restarts it to prove
state survived, plus 222 classifier cases in three JSON files, plus 4 opt-in Playwright tests.

The most valuable thing in the suite is five tests that enforce architecture by reading source text rather than
calling functions. One asserts no model runs in the eligibility engine. One asserts the tool table's
confirmation metadata. One asserts `reject_batch` does not exist. Those cannot be satisfied by a code path that
has drifted.

---

## 2. What hrX gets right

Six things, and they are the six worth taking.

**Process as versioned data, with the reasoning attached.** hrX's section 12 does not just assert that the
process should be data. It explains why the naive Temporal implementation defeats the goal: a candidate
workflow runs for weeks, so at any moment thousands of instances are in flight under older code, which is the
worst case for Temporal's replay versioning. The conclusion, keep the workflow code thin and frozen and put the
process in rows, is correct and it is correct for reasons that apply to us too.

**Version pinning per application.** hrX calls it "the single most important rule in this section" and it is
right. Each application pins the definition version it started under. Editing a definition creates a new
version. Migrating in-flight candidates is an explicit audited action with a preview of who is affected, never
a side effect of saving a form. We have no field for this and it is the cheapest thing on the list to add now
and the most expensive to add later.

**Three governance tiers on configuration.** Most knobs are free to edit. Auto-advance thresholds need
approval. Auto-reject thresholds and integrity rules need approval and write an immutable record of who changed
what from what to what. That distinction is the difference between a dynamic process and an incident.

**Consent and retention as a phase-zero dependency.** "Adding consent records and decision logs later means
reprocessing every candidate you have already touched, and possibly deleting data you cannot lawfully hold."
That is exactly right and it is our largest gap. See section 7.

**Auto-advance freely, auto-reject almost never.** hrX arrives independently at the rule our state machine
already enforces, and adds a better argument for it than ours has: a wrong rejection is invisible, because you
never learn about the candidate you lost. It also extends the rule to integrity flags with no threshold that
ever relaxes it, on the grounds that a false accusation of cheating is worse and less recoverable than a missed
one.

**Naming what is not being built, with a replacement for each.** "A decision not to build something is
incomplete until you can say what fills the hole." Sixteen rows, each with its replacement. Our own
non-goals list in the PRD says what is out and does not always say what fills the gap.

One more thing worth noting because it is unusual in a build plan: hrX is honest about its own cost. The twelve
added modules section opens with "This moves the timeline, and pretending otherwise would be dishonest" and
puts a number on it.

---

## 3. What we should not copy

**Temporal, for now.** Temporal is the right engine for hrX: multi-week waits, human approvals, parallel vendor
branches, retries against flaky vendors, at SaaS scale across many tenants. It is also a cluster, a datastore
and a visibility store to operate. Our demo runs on Node and nothing else, deliberately.

More importantly, Temporal is not a primitive. It is one implementation of durable orchestration. The primitive
is the interpreter, and we already have the interpreter. Adopting Temporal before the process is data would be
building the durable half of something whose configurable half does not exist.

**The comp engine.** A CTC breakup with PF, gratuity, ESI and state professional tax as first-class slabs is
India statutory law. US hourly retail has a rate and a shift pattern. There is no CTC breakup to compute. The
versioning discipline around it, that a generated offer stores its plan version, its inputs, its resolved
outputs and the hash of the rendered PDF, does transfer. The slabs do not.

**Interview integrity and proctoring.** hrX needs identity verification, liveness, speaker verification across
calls and prosody anomaly detection because it runs scored AI interviews at volume where impersonation is the
standard failure mode. Our step 6 is a human decision on a score produced by a phrase-bank conversation. It is
a different threat model.

If this leaks in we build a proctoring product we do not need and inherit biometric consent and retention
obligations we currently do not have. hrX says so itself: "a voice print is biometric data, so it needs its own
consent purpose and retention rule."

**The AI video interview.** Out of scope by D-009 and D-010. Ten engineer-weeks against a requirement we do not
have.

**Job board partnership and per-tenant board credentials.** D-009 puts advertising and attraction out of scope
because we have no data advantage there. Q-041 on job board distribution is still undecided. The per-tenant
credential vault is worth taking as a primitive. What it holds is not.

**The L2 role-play as an assessment.** hrX's L2 is a scored role-play that beats a text ATS because the
assessment is a phone conversation and the job is a phone conversation. That argument does not carry to a
grocery deli clerk, and scoring more deeply is the direction that increases our AEDT exposure rather than
reducing it.

**Post-joining ramp as an LMS-adjacent product.** Our steps 17 to 20 are in scope by D-013, but as visibility
over someone else's learning system through the `learning` adapter. hrX's P8 builds tracks, a quiz engine,
practice calls and certification gates. That is a product surface, and the PRD's non-goals already exclude it.

**The plan shape itself.** 36 modules, 9 phases, 45 weeks, 4 engineers. Ours is a demo one person built. Reading
hrX's phase table as a roadmap for this project would be adopting a resourcing assumption along with the
architecture.

---

## 4. Shared platform primitives

Fourteen things both products need. The middle column says what we already have, because in eleven of the
fourteen the answer is "most of it".

| Primitive | What exists on our side today | Why both need it |
|---|---|---|
| Tenant isolation at the data layer | Enforced in `store.js`, throws without a tenantId, 166 call sites honour it | D-030 makes it our legal boundary under FCRA. Multi-tenant SaaS makes it hrX's. Same mechanism |
| Person and application as separate entities | Two tables with a foreign key. No runtime create path, so 1:1 in practice | The same person arrives twice, or at two stores. hrX calls dedupe the thing that makes "one platform" true rather than aspirational |
| Append-only event log as the single spine | Three purpose-separated logs, one writer each, no mutation in shipped code | Audit, analytics and engagement triggers all fall out of it instead of being three more features |
| Four actor types on a stage | `owner: agent, human, system, clock` on states and steps. `by: [system, human, agent, external]` on transitions | Arrived at independently by both. This is the strongest convergence in the comparison |
| Named guard and effect registries, walked by an interpreter | `GUARDS` and `EFFECTS` string-keyed. `settle()` scans the table. Engine body has no state names | This is hrX's section 12 mechanism. We have it in memory |
| Human-only negative decisions | `by:['human']` on APPROVED and REJECTED. Enum with no reject value. 57-case safety suite | Arrived at independently by both, for the same regulatory reason and one better argument on their side |
| Immutable model-call record | `llmCalls` with purpose, mode, provider, model, promptVersion, inputRefs, recommendation, confidence, output. No chain of thought | hrX: "an immutable decision record on every score and every stage transition." Every AI hiring regulation assumes you can produce one |
| Typed connector interface with a call log | Eight adapters, one `call()`, every attempt logged with status, externalRef, retryable, attempt | "Adding the tenth board should be a config file and a mapper, not a project" |
| External-async marking | `waitingOn: candidate, agency, government` on states. `clock` owner type | A wait on a government department is not a product failure and the interface must not draw it as one. We name who we are waiting on. hrX's plan does not |
| Parallel branch fan-out with a dependency graph | Eleven-task `needs` graph, `fanOutParallelWork`, critical-path arithmetic | "One blocked branch does not stall the others." Identical requirement |
| Exception queue as a first-class object | `exceptions` with kind, severity, owner, `blocksProgress`, nextAction, resolution. Blocks `settle()`, never blocks a person | Ours is the more general primitive and it is the retail product's whole operating model. hrX has the specific case, a human review queue for integrity flags |
| Communication outbox across channels | `communications` with channel, direction, templateId, status, providerRef | "One outbox behind one template store." We have the outbox. Not the template store |
| Metrics derived from the log, not stored | `metrics.js` derives at read time. A test deletes an application's events and checks the numbers move | Both products claim provable ROI. Both need the numbers to come from the record |
| A tool registry as the only write path | 25 tools, three confirm levels, both routes converge on one registry | hrX has nothing like this. It is ours to contribute |

The last row is worth pausing on. hrX's plan has a recruiter dashboard and no assistant. Our assistant, with
its confirmation levels and its 57-case safety suite, is the single most transferable asset we hold and it does
not appear anywhere in their 36 modules.

---

## 5. US retail specific layer

Eleven things that stay ours because they come from the use case, the population, the operating model or the
regulatory environment.

**The twenty-step funnel table and its ratio.** Seventeen of nineteen classifiable steps are a wait or a
handoff. That ratio is the product argument (D-013) and it is a claim about this funnel, not about hiring.

**Five US statutory clocks, with the citation inline.** I-9 Section 2 within three business days of first day
of work for pay, 8 CFR 274a.2(b)(1)(ii). E-Verify case creation by the third business day. Tentative
nonconfirmation, ten federal working days, one shared window. FCRA pre-adverse, eight days. Adverse, ten.
Recomputed on every read from a date on the record. For India these are deleted, not translated.

**The adverse action bar.** A contested E-Verify mismatch may not become grounds for adverse treatment, so
`REJECTED` and `TERMINATED` are blocked while `everify.decision === 'contesting'`, and every blocked attempt is
recorded with who tried and why. This cannot be expressed as a row in a stage table. It is a rule with its own
state.

**The FCRA single-tenant matching boundary.** D-030. The reason is the furnishing-to-third-parties element of
15 U.S.C. 1681a(f), not the transactions-and-experiences exclusion, and designing against the wrong element
produces a design that fails. Enforced in the query layer, with a test that plants a rival retailer's
do-not-rehire record and proves the lookup will not see it.

**The three-year I-9 rehire window.** 8 CFR 274a.2(c)(1)(i), measured from initial execution. Drives the rehire
path where the journey genuinely collapses.

**Fair workweek fourteen-day notice.** The scheduling adapter reports `premiumPayable` when notice is under
fourteen days rather than silently writing the shift.

**Deterministic eligibility with no model in it.** `rules.js` has five rules and there is a test that reads the
source to confirm no model runs there. Step 2 in the automation breakdown says "Nothing, deliberately."

**No rejection by model, in three independent places.** The enum, the transition allowlist, and the confirm
level. Because step 6 producing a score makes us a regulated automated employment decision tool in New York
City and, since October 2025, in California, where a system that merely helps a human decide is in scope.

**The store manager's day as the shape of the interface.** D-031. The deck, the work queue, the per-store view.
The buyer gets a report, the champion an argument, the blocker an audit trail, and none of them gets a
workspace.

**The exception-based operating model.** BAU runs in the background, humans handle exceptions. This follows
from the seventeen-of-nineteen ratio: in a funnel dominated by external waits, the product is the queue, not the
step.

**The connector postures and the bespoke-integrator sequencing.** Read, write, both, or ours-already, per step.
Twelve of twenty steps need something from an existing system and eight need nothing. D-028 says the first
integrator is bespoke and should be built as though a second will exist.

---

## 6. India and JustDial specific layer

Eleven things that should reach the retail product through configuration or an adapter, or not at all.

Configuration or adapter only: Aadhaar eSign, DigiLocker, PAN and UAN employment history, the Indian identity
verification vendor, the medical partner, DLT registration and calling windows, WhatsApp as the primary
channel, regional languages and code-switching, DPDP 2023 and India-only residency.

Not at all, unless a decision reopens: the CTC comp engine with statutory slabs, the interview integrity and
proctoring suite, the AI video interview and the WebRTC build, the L2 scored role-play, job board partnership
economics, renege-risk scoring as a distinct product surface, and the P8 ramp, quiz and certification stack.

Two of those deserve a note rather than a line.

**Renege risk.** hrX is right that post-accept drop-off is the largest recoverable loss, and right that
engagement should follow a risk score rather than a fixed drip. Our funnel already has both ends of it: step 8
is "offer accepted, or goes quiet" and step 16 is "day one: shows up, or does not", and both already have
exception kinds. So this is not a new surface for us. It is a scoring input on a path we already model.

**Post-joining ramp.** hrX's argument for it is strong and worth reading: it is the only phase that tells you
whether the eight before it worked, because ninety-day retention is the label that validates the interview
scores. Our version of that argument is already in the PRD, as measurement rather than as content. Steps 17 to
20 are in scope. Building the tracks and the quizzes is not.

---

## 7. Architectural gaps in our current product

This section answers section 4 of the brief question by question, and then lists what neither product has.

### Can our current product become a tenant-configurable orchestration platform without a rewrite?

**The engine, yes. The storage layer, no.**

The engine is already the right pattern. What has to change is where the transition table lives and what mints
it. The JSON file store and the zero-dependency rule are what would have to go, and replacing them is a
replacement, not a refactor.

### Are we accidentally hardcoding the retail hiring process?

**Retail, only shallowly. The US, completely.**

Retail reaches the code mostly as data and copy: the twenty steps are a data table in `steps.js`, requisitions
are grocery-shaped rows, the phrase bank is a requisition field. The exception is the onboarding task list,
which is a code constant with US federal keys, `i9_s1`, `i9_s2`, `everify`, `w4`.

The US is not a configuration of this system, it is the system. Across the whole of `demo/`, grep returns zero
hits for `jurisdiction`, zero for `country`, zero for `timezone` and zero for `Intl.`. The one field named
`state` is a two-letter postal code used for display and for naming county court venues, and no code branches
on it. The business-day calendar is a single Monday-to-Friday predicate with no holiday table and no locale
parameter. Deadline day counts are literal arguments at the call site with the CFR cite as a sibling string, so
the rule and its citation live in the same expression and neither can be swapped without editing the function
body.

### Are candidate states represented as code branches instead of data?

**No, and this distinction is the whole basis of the recommendation.** The topology is a declarative table
walked generically, not a switch statement. The engine body contains no state names. Moving that table into
rows is a migration. Rewriting a switch statement would have been a rewrite.

Two qualifications. The seed replays the same sequence again as straight-line code, so the process is expressed
twice. And `tick.js:266` carries its own successor map for the tenure chain, so there are three places, not
two.

### Do we have an append-only event and audit model?

**In practice yes, by construction no.** Verified by adversarial read: `workflowEvents`, `auditEvents`,
`agentActions` and `llmCalls` each have one writer and nothing anywhere in the shipped code mutates, deletes or
reorders a stored row.

Three corrections to the blunt version, all of which came out of the verify pass:

1. It is a convention. `store.update()` will `Object.assign` any patch onto any row in any table including an
   event table. It has zero call sites and no test locks the property down. There is no hash chain, no freeze,
   and no server-authoritative timestamp: `at` is caller-supplied, which is what lets the seed backdate history.
2. `connectorCalls` is a log served to the audit screen and it is rewritten in place. A row is inserted
   `pending` with a null latency and then patched with status, latency and response. No response row is
   appended.
3. Not every reported duration is event-derived. `workMs`, `handoffs`, `peopleInvolved` and the per-step
   timeline durations are. `elapsedMs` is `(closedAt || now) - appliedAt` read off the application row, which
   drags `queueMs` and `queueShare` with it, and those are the product's headline numbers.

### Can a stage be AI, human or external without the rest of the system caring?

**The authorization can. The execution cannot.**

The actor allowlist is genuinely polymorphic and generically checked. But whether a stage is AI, human or
external decides which of four different code paths runs its work. A human decision is a transition effect. The
AI screening is orchestrated outside the engine by `screening.js`, with an empty `completeScreening` effect left
behind as a placeholder. An external order is an effect while the external return is a bespoke loop in
`tick.js`. Externally-fulfilled onboarding tasks are dispatched by an if-else on the task key.

So `owner` is a data field for colour and copy, not for execution. Making the manager interview AI-conducted
means editing four ternaries in `workflow.js` and one line in `screening.js`.

### Can a customer have a different pipeline without us forking code?

**No.** And they would need two edits, because the seed walks the sequence again.

### Can the same candidate move through asynchronous external checks?

**Yes, and this is the strongest thing in the codebase.** `waitingOn` names who we are waiting on. The `needs`
graph fans out eleven onboarding tasks. `blocksProgress` on an exception stops the automatic advance and never
stops a person. Critical path against sequential sum is computed for the parallelisation claim, with observed
wall clock reported separately and labelled as not comparable.

### Can an AI action recommend without becoming the final employment decision?

**Yes, structurally, in three independent places.** The enum has no reject value. The transitions to `APPROVED`
and `REJECTED` are `by:['human']`. The confirm level `human_decision` means confirming is itself the human act.

One caveat found in the verify pass and it matters. Every HTTP request builds `actor.type: 'human'` at
`index.js:92`, because identity is an unauthenticated `?as=` query parameter. So `by:['human']` currently
protects against the seed replay and the test suite rather than against a live agent caller. The protection that
actually holds in the running product is the confirmation gate.

### Can the assistant operate against the same underlying workflow and state model?

**Yes for state changes.** Eight of eleven write tools go through `WF.transition`, and the assistant and the UI
converge on it. Three write directly: `assign_candidate`, `remove_shift`, `add_note`.

Neither surface is a subset of the other. The assistant cannot complete an onboarding task or resolve an
exception, because no tool exists. The UI has no button for `WITHDRAWN` or `TERMINATED` and never receives the
transition table, so its move menu is a hardcoded if-chain in the browser while the assistant's
`update_candidate_stage` is fully general.

### Missing platform primitives: neither product has these

1. **Process definition as persisted, tenant-scoped, versioned rows.** hrX has it as a plan. Nobody has it as
   code.
2. **Version pinning per application.** No field exists. Editing `schema.js` silently re-bases every in-flight
   application, and there is no way to answer "which process was this person hired under".
3. **A uniform stage-execution contract.** hrX assumes one. Ours has four paths.
4. **Consent and retention primitives.** This is our largest gap against our own PRD. There is no consent
   table, no retention field, no data-class field, no purpose field in the lawful-basis sense, and no deletion
   path: `store.js` has no delete method at all. Meanwhile the PRD commits to California's four-year retention
   of system inputs, to TCPA consent wording that may not carry from one job to another months later, and to
   honouring Washington opt-outs within ten business days. `steps.js` prints "3 years after hire or 1 year
   after termination" as display copy and nothing computes it.
5. **Idempotency keys.** Zero hits repo-wide. `retryable` and `attempt` are recorded and no retry loop exists.
6. **A credential store.** Zero hits for `vault`. An adapter definition has no auth, base URL or credential
   reference field, so there is no place to put one. That is currently a feature and it becomes a gap the day a
   connector is real.
7. **Cost and usage metering per event.** `usage` is stored on screening model calls and never read. The
   assistant's own model calls drop usage entirely. No price table, no per-tenant rollup, no cost per hire.
8. **Authentication, and a seam for a non-human HTTP actor.** See above. This is the difference between the
   safety model being enforced and being asserted.
9. **A template store.** Both have template IDs. Neither has a registry. Ours are string literals at the call
   site: `offer-hourly-conditional-v3`, `offer-chase-v1`, `first-shift-confirm-v2`.
10. **Schema self-consistency validation.** No startup check that every `guard:` and `effect:` name resolves,
    that `TRANSITIONS` references declared `STATES`, or that `stepOf` maps onto the twenty rows in `steps.js`. A
    typo becomes a runtime error rather than a refusal.
11. **An authoring surface.** Neither has one.

---

## 8. Target architecture

Adapted to what is actually in this repository. Names in backticks exist today.

```
JURISDICTION RULE PACK                          TENANT CONFIGURATION
(a plugin, not config)                          (versioned rows, tenant-scoped)
├── statutory clocks + citations                ├── process definition  <- STATES/TRANSITIONS, moved
│     `compliance.js` = the US pack             ├── stage templates
├── blocking rules with their own state         ├── rubrics + phrase bank  <- requisition.criteria today
│     the adverse action bar                    ├── eligibility rule set   <- `rules.js` RULES, moved
├── business-day calendar + holidays            ├── SLA + escalation policy
├── consent purposes + retention classes        ├── message templates
└── document checklist                          ├── approval policy
      `ONBOARDING_TASKS`, US keys today         └── connector config + credential ref
                    │                                        │
                    └────────────────┬───────────────────────┘
                                     ↓
                        HIRING ORCHESTRATOR
                        `workflow.js` transition() + settle()
                        table-walking, no state names in the body
                        + version pin per application   <- MISSING
                                     ↓
                   ONE STAGE-EXECUTION CONTRACT         <- MISSING
                   { key, owner, executor, guard, effect, sla, needs[] }
                                     ↓
        ┌─────────────┬──────────────┼──────────────┬─────────────┐
        ↓             ↓              ↓              ↓             ↓
      agent         human          system         clock       external
   `screening.js`  decision      deterministic   fixed wait   `connectors/`
   `llm.js`        + approval     `rules.js`     `waitingOn`  8 adapters
        └─────────────┴──────────────┼──────────────┴─────────────┘
                                     ↓
                        PERSON  ·  APPLICATION
                        `candidates`  ·  `applications`
                        tenant-gated in `store.js`
                                     ↓
                        APPEND-ONLY EVENT SPINE
                        `workflowEvents` `auditEvents` `agentActions`
                        `llmCalls` `connectorCalls` `communications`
                        + server-stamped time, + no update path   <- MISSING
                                     ↓
        ┌─────────────────┬──────────┼──────────┬──────────────────┐
        ↓                 ↓          ↓          ↓                  ↓
   EXCEPTION QUEUE   DECISION    ASSISTANT   METRICS          COMPLIANCE
   `exceptions`      SURFACES    25 tools    `metrics.js`     `compliance.js`
   blocksProgress    decide      3 confirm   derived at       rendered from
   the operating     deck        levels      read time        the rule pack
   model             flag
```

Two things the brief's example diagram places differently, and I think it has them in the wrong place.

**The jurisdiction rule pack is not tenant configuration.** "US retail equals one configuration" is false as
stated. You cannot express "a contested E-Verify mismatch may not become grounds for adverse treatment" as a row
in a stage table. It is a rule with its own state, its own blocking semantics and its own audit requirement.
Treating it as config would mean either weakening it to fit the schema or smuggling US law into a table every
tenant shares. It belongs in a plugin layer that a tenant selects, alongside the calendar, the consent purposes
and the retention classes.

**The exception queue is a peer of the dashboard, not a widget on it.** In a funnel where seventeen of nineteen
steps are a wait, the queue is the product.

---

## 9. Migration and refactor plan

Not scheduled. Ordered by whether the thing after it depends on it.

### Keep as it is

`events.js` and its three-log split. `metrics.js` and derivation at read time. The connector call-log pattern
and the redaction. `rules.js` as the US eligibility pack. `compliance.js` as the US rule pack. The tool
registry and the three confirm levels. The five source-reading architecture tests. `steps.js` as one canonical
copy. The `waitingOn` and `blocksProgress` semantics. The recommendation enum with no reject value.

### Refactor

- `STATES` and `TRANSITIONS` into rows, with a tenant scope and a version, and a version pin on the application.
  Everything else on this list is easier after it.
- The four stage-execution paths into one contract with a named executor resolved from a registry, the same way
  guards and effects already resolve.
- `store.js` into a real database with the same tenant gate. This is where the zero-dependency rule gives way,
  and the gate is the part that must survive verbatim.
- The seed, so it drives the definition rather than walking the sequence again, and `tick.js`'s private
  successor map, so the graph has one source of truth.
- The browser's move menu, so it reads permitted transitions from the server instead of an if-chain.
- Server-stamp event time and remove `update()`'s reach into event tables.

### Delete

- `notifications`. A declared table whose only writer has zero call sites. Permanently empty, and its id
  sequence has never been minted.
- `allGlobal()`. An ungated escape hatch, whose own comment says only `tenants` qualifies, which nothing
  enforces.
- The `?as=` identity and the hardcoded `actor.type: 'human'`, replaced by a real actor with a type.
- `body.workMs` at `index.js:243`. The client can currently supply the work half of the work-versus-queue
  split, which is the number the whole product argument rests on.
- The `checkCard(d.check)` call at `views.js:682`. See section 12.

### Add, in this order

1. Consent, retention class, data class, and a deletion path that reaches every table. Before anything else,
   for hrX's stated reason: retrofitting means reprocessing every record.
2. Authentication and an actor type, so the human-only rules are enforced rather than asserted.
3. Process definition rows plus version pinning.
4. The stage-execution contract.
5. Idempotency keys and a credential reference on the connector interface.
6. A template registry.
7. Schema self-consistency validation at startup.
8. Cost metering per event.

---

## 10. What we should build next

Four things, and only the first two are about the platform.

**Fix the two live defects in section 12.** Both are small and one of them breaks a screen for 15 of 36
candidates.

**Consent, retention and a deletion path.** This is the only item on the whole list where waiting makes it
strictly more expensive, and it is a gap against our own PRD rather than against hrX. It is also the one an IT
security review will find, and D-031 names IT security as a blocker persona.

**Process definition as rows, with version pinning.** Not because a second tenant is coming. Because every
transition built on the old shape is a transition that has to be rewritten, and because the pin is the only way
to answer "which process was this person hired under" months later.

**A named first customer, or the decision to proceed without one.** hrX's own open questions section says
building multi-tenant SaaS without one named customer means guessing at every configuration boundary, and
configuration boundaries are the expensive thing to get wrong. Our version of that problem is worse: the P3
gate is five practitioners outside Nurix and it is still at zero.

---

## 11. What we should not build yet

Temporal. A second jurisdiction. Any India-specific functionality. Multi-tenant provisioning, before there is a
second tenant to provision. Interview integrity or proctoring. Video anything. The comp engine. An admin
authoring UI, before the definition is data. A learning surface. Cross-tenant anything, ever, without reopening
D-030 on purpose.

And one that is tempting because it looks like tidying: do not collapse the three event logs into one table to
match hrX's shape. The split is doing work. `auditEvents` records refusals with a reason and `workflowEvents`
does not, which is why a refused action is currently invisible to metrics and to the funnel. That is a gap to
close by adding, not by merging.

---

## 12. Risks and open questions

### The business half of this decision is not mine

The technical answer is in this document. The half that is not: whether Nurix is one product or two, who owns
and staffs a shared platform team, and what a shared platform does to the margin profile. D-028 already put
that question on the record for connectors: "A per-account integrator is services revenue wearing product
clothing... investors and Nishant will both eventually ask which one this is." A shared platform is the answer
to that question. Whether to give it is Suniras's and Nishant's call.

### The strongest argument for merging is already in our own decision log

D-028, 26 August, written before hrX arrived: "The thing that would make it compound is a normalisation layer
underneath the bespoke adapters, so the second Workday customer is cheap even though the first was not. That is
a specific instruction for the high level design rather than a hope."

That is the shared platform argument, reached from the retail side, from a commercial premise, five weeks ago.

### The overlap is narrower than either document suggests, and the evidence for it is now threefold

hrX runs requisition through day ninety. We run application through day ninety. The genuinely shared span is
offer through joining, our steps 7 to 16.

hrX's front end is out of our scope by decision. Advertising and attraction are out under D-009. AI interview
rounds increase the AEDT exposure that D-016 already accepted once. Our front end is deliberately shallower
than theirs for the same reason.

The third piece of evidence arrived on 31 August. IndiGo's automated SOP, the one Srikanth built, starts after
the hiring decision and covers offer, medical, background verification, documents, day-one confirmation and
travel. That is our steps 7 to 16 as well.

**Three builds, two countries, three buyers, and all three converge on the same eight steps.** That is a better
argument for a shared platform than any module-list comparison, and it also says which eight steps the platform
should cover first.

### Two things found while auditing, neither of which is about platforms

**`checkCard` is called and never defined.** `demo/js/views.js:682` reads
`if (d.check) wrap.appendChild(checkCard(d.check));`. Nothing in the repository defines `checkCard`. Fifteen of
thirty-six applications have a background check row, so the candidate screen throws for fifteen of thirty-six
candidates and renders the error card instead of the record. This contradicts the 29 August report in
`docs/UPDATE_29_AUG.md`, which said all eleven routes render with zero console errors. Either it regressed after
that check or the verification did not open a candidate with a check on file. It is one line to fix and I have
not fixed it, because this pass is an audit.

**`savedPct` is 19.0063 percent for every application, always.** `sequentialMs` and `criticalPathMs` are both
sums of the same hardcoded per-task estimates over the same fixed eleven-task graph, so their ratio cannot vary.
The code comment is honest about what the two numbers are, and `actualMs` is correctly separated with a note
saying it is not comparable. But on screen it is a figure that looks measured, is not, and never moves. Against
D-025's standard of real computation, and against the brief's own instruction not to put fabricated values in
the interface because they make the demo look good, this is the closest thing in the build to a decorative
number.

### The honesty asymmetry between the two surfaces

The product labels provenance rigorously: every screening evaluation carries whether a model ran, and the
fallback prints "No model ran." The overview page at `demo/index.html` makes zero API calls and presents
invented figures with no such label. That is a live inconsistency against this project's own evidence
discipline and it is the one a reader would notice first.

### The test runner cannot fail

`demo/tools/test.sh` sets `-e` and then ends both `node --test` pipelines with `|| true`, and the classifier
loop has no exit-code handling. The script always exits 0. The output still prints failures, so a human reading
it sees them, but nothing automated could gate on it. The suite is good and the runner does not let it be
load-bearing.

### The claim about voice appears in the code as well as the README

`connectors/index.js` carries, on the voice op: "Nurix has shipped a live voice screening agent on another
build." IndiGo's five voice agents are notification, document nudge, check-in, day-before confirmation and
induction reminder. None holds an open conversation or scores an answer. If the claim refers to Unifi it may
hold, but that slide is recorded in this repository as self-contradictory with everything in it tagged as
assumption. This should be resolved before it reaches Nishant.

### Documentation drift, small but worth fixing in the same pass

`CLAUDE.md` and `demo/README.md` say 26 states and 48 transitions. The code has 27 and 50. They say seventeen
assistant tools. The code has twenty-five.

### Still open, and unchanged by this audit

Which success metrics win, where D-017 conflicts with the goals stated on 26 August. Who signs, at the level of
a person. Pricing. And the P3 gate at zero, which is the parent of most of the rest.

---

## The recommendation

**PARTIALLY MERGE.**

- **The engine merges and most of it already exists.** Our workflow layer is a table-walking interpreter with
  string-keyed guards and effects, an actor allowlist checked generically, a dependency graph for parallel work,
  and an append-only spine. That is hrX's section 12 mechanism, built. The gap is a persistence layer and a
  tenant scope for the table, not a redesign.

- **The compliance layer does not merge and should not be attempted.** The US pack and an India pack are
  different rules with different arithmetic and different blocking state. Make jurisdiction a plugin the tenant
  selects, not a column in a config table. This is the one place where the brief's proposed shape needs
  correcting.

- **The shared span is offer through joining, our steps 7 to 16.** Three independent builds converge there:
  ours, hrX's, and the IndiGo SOP Srikanth actually shipped. Both ends of the funnel diverge by decision, not by
  accident. Scope the common platform to the middle and let each product own its own ends.

- **Four primitives are missing from both and one of them is urgent.** Consent and retention, version pinning,
  a uniform stage-execution contract, and an authenticated actor. Consent and retention is the one where waiting
  is strictly more expensive, and it is a gap against our own PRD before it is a gap against hrX.

- **Do not adopt Temporal, the comp engine, or interview integrity.** Each is correct for hrX and each would
  cost us something specific: an operations burden we have no team for, India statutory law we have no use for,
  and a biometric consent regime we currently do not touch.
