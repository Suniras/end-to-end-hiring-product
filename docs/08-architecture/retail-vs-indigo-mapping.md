---
AUTHOR: Claude. A mapping between two implementations, with a reuse call on each row. The calls are
  engineering ones. Where a row turns on a product or commercial decision it says so and names it
WHAT THIS IS: for every concept in the IndiGo HRSS implementation, the retail equivalent and whether we should
  reuse it, adapt it, or reject it
WHAT THIS IS NOT: an implementation plan. Nothing here is scheduled and no code was changed
DATE: 2 September 2026
READS: docs from srikanth/solutioning.md, verified against a4274fc on 2026-09-02. Our repository, audited
  2 September. docs from srikanth/hrX-build-plan.md for the third column where it differs
COMPANIONS: retail-workflow-v0.1.yaml is the definition this mapping supports.
  retail-workflow-contract-gaps.md is what writing the definition exposed.
  indigo-compatibility-2026-09-02b.md is the audit that led to all three
---

# Reference implementation against retail, row by row

## How to read the calls

**Reuse** means take it as it is. The concept is right, the name is right, and nothing about retail changes it.

**Adapt** means the concept is right and something about it is theirs. Usually the name, sometimes the scope.

**Reject** means it should not enter the retail product, either because it is one tenant's domain or because
taking it would cost us something specific. A reject is not a criticism of their build. Most of these are
correct for them.

**Contribute** means we have it and they do not, and it belongs in a shared contract.

Every row names where the thing actually lives, so a reader can check.

---

## 1. Orchestration and the workflow contract

| Reference implementation | Retail equivalent | Call | Reason |
|---|---|---|---|
| **Ten node types.** `START`, `END`, `CANDIDATE_TASK`, `HRSS_TASK`, `EVENT_WAIT`, `ACTIVITY`, `TIMER`, `DECISION`, `PARALLEL_SPLIT`, `PARALLEL_JOIN`. `core/…/workflow/*` | The complete set our repository lacks. Our 27 states carry an `owner` of `agent`, `human`, `system` or `clock`, and our transitions carry `by` of `system`, `human`, `agent` or `external` | **Reuse** | Nineteen of our twenty steps express in these ten. The set is genuinely generic and it is the single most valuable thing in their build. Our `clock` owner dissolves into the node type, which is a simplification: a fixed wait is a `TIMER` and a wait on somebody else is an `EVENT_WAIT` |
| `HRSS_TASK` as a **type name** | Our step 6, the hire-or-reject decision, and the badge task | **Adapt.** Rename to `STAFF_TASK` | HRSS is an IndiGo job title, not a concept. The distinction it draws against `CANDIDATE_TASK` is exactly right and worth keeping. The word is not. This is the only rename this mapping asks for |
| **Versioned insert-only definitions.** Editing a published YAML is a no-op; a graph change is a new version file, which is why v7 exists rather than a v6 edit. `V22__workflow_definition_versions`, `V23__archive_workflow_definitions` | **Absent.** Editing `schema.js` silently re-bases every in-flight application, and there is no way to answer which process a person was hired under | **Reuse, verbatim** | This is the discipline the hrX plan calls the single most important rule in its section 12, shipped. It costs nothing now and it cannot be retrofitted, because the applications that needed a pin have already gone through |
| **Per-application binding.** `ApplicationWorkflowBinding`: which application runs which definition version, and its status. `V21__dynamic_workflow_bindings` | **Absent** | **Reuse** | The pin, and separately the seam that makes an incremental engine cutover possible without a flag day |
| **Per-requisition selection.** `WorkflowRequisitionConfig` | Partly ours already. `requisition.requiresManagerInterview` decides whether funnel steps 4 and 5 happen at all for a role, which is a per-requisition process branch expressed as row data | **Reuse** | We arrived at per-requisition process variation independently and at one branch point. Theirs generalises it to workflow selection, which is the same idea with more room |
| **Workflow editor.** `/workflow` and `/workflow/editor` | **Absent** | **Reject for now** | A canvas before there is a definition to edit is a screen with nothing behind it. Their own section 8.4 records the trap it creates: a green tick means "entered", not "happened", and a never-raised background check once read as complete. Revisit when definitions are rows |
| **`WorkflowMode` per application.** `LEGACY` is the compatibility default, `DYNAMIC` is explicit opt-in | **Absent, and it should stay absent** | **Reject** | This is the right answer to their problem and the wrong answer to ours. It exists to protect live candidate traffic during a cutover. We have no production traffic, so we can make our one engine the dynamic one and never have two. That advantage expires the day we have a customer |
| **Two engines.** Legacy `DispatcherService` + `TransitionRules` in production, dynamic engine opt-in | **One engine**, and it is structurally their legacy FSM: a transition table, a dispatcher, named guards and effects, a settle loop | **Reject the duality. Reuse the dynamic engine's contract** | We are where they were before the FSM shipped. Adding a second engine to reach a shape we can reach by moving a table into rows would be paying their migration cost without their reason for it |
| **Two reconcilers.** `startPendingApplications` every 5s, `reconcilePreJoiningApplications` every 60s, observing durable state and signalling the matching `EVENT_WAIT` | **Absent.** `settle()` runs in process and the database is what it wrote | **Reject** | The reconcilers are the price of two authorities over one truth. A single-authority engine does not reconcile against its own database. If we keep one engine we never need them, and needing them would be the signal that we accidentally built two |
| **Temporal.** `TemporalRuntime`, wired when `DYNAMIC_WORKFLOW_TEMPORAL_ENABLED=true`. Production default is `false` | **Absent** | **Reject for now** | Three reasons, and none is about Temporal being wrong. It is a cluster, a datastore and a visibility store to operate. It is not a primitive, it is one implementation of durable orchestration, and the primitive is the interpreter we already have. And their own production has it off, so adopting it would mean betting our demo on the half of their engine they have not yet trusted with their traffic |
| **`aocs-hire` v7 graph.** 11 stages, 10 parallel tracks, 5 gates | `retail-frontline-hire@1`. 20 steps, 41 nodes, 3 parallel splits, 1 join | **Contribute** | Their roadmap section 19 says the second workflow type is the forcing function that proves the engine is generic. This is that second workflow |

---

## 2. Domain model

| Reference implementation | Retail equivalent | Call | Reason |
|---|---|---|---|
| **`JobRequisition`.** Careers catalog posting, `req_id` as the public join key carried by careers links and QR codes, band, sub-band, expiry | `requisitions`, carrying the eligibility thresholds, the phrase bank, `requiresManagerInterview` and the pay rate | **Adapt** | Same entity, different field sets, and both sets are legitimate. Theirs carries the public-facing catalog concern, ours carries the process-variation concern. Merge, do not choose |
| **`CandidateRegistration`.** The person, email-keyed, encrypted profile, no password stored, plus a candidate-level mirror of their journey | `candidates`. No encryption, no runtime writer, no identity link across applications | **Adapt** | The entity is right and theirs is further along. **Reject the journey mirror.** Their own section 6.1 names it: the same journey state lives in up to three places with non-identical vocabularies, `MedicalBgvTrackMapping` is the translation layer, and writing only one copy is the split-brain defect class that stranded candidates historically. One authority per fact |
| **`JobApplication`.** This person applied to that job, "because one person can hold two". Carries offer, medical, BGV, travel, joining date | `applications`. Separate table with a foreign key, but no runtime writer, so 1:1 in the seed and "applies twice" is unreachable rather than handled | **Reuse the shape** | Theirs is the better-developed version of a separation we already made. The `one person can hold two` justification is the right one and our implementation cannot currently demonstrate it |
| **`Candidate`.** The internal pipeline row HRSS works: one global `Stage` plus ten parallel `Track` sub-states. **Minted at offer-accept, not at registration** | Our `applications` row carries the state from step 1 | **Reject the minting point** | This is the structural reason retail cannot be a second workflow on their current runtime. Before acceptance there is no stage, no exception queue and no audit feed, their `DOC` and `OFFER` tracks are "effectively vestigial in production", and their analytics funnel measures only the post-acceptance pipeline. Our steps 1 to 6 are the differentiated half of our product and they would have nowhere to live |
| **`Stage`, 11 values, a backend Java enum.** Advances only as a consequence of a track reaching a terminal state | 27 states as a module `const`, mapped onto 20 funnel steps | **Reject as an enum on both sides** | Neither can host the other's stages, and adding retail stages to `Stage.java` would put a US grocery funnel inside an airline's compiled vocabulary. Both have to become data. The *rule* that the global stage advances as a consequence rather than on its own is worth reusing: it is why their stage cannot drift from their tracks |
| **`Track`, 10 values, with named gate-clearing states** | The 11-task `needs` dependency graph, `fanOutParallelWork`, `PRE_SHIFT_TASKS` | **Adapt** | Same primitive at different granularity. Theirs is coarser and named; ours is finer and computes a critical path. **Reuse the gate-clearing-state idea**: naming exactly which sub-states clear a gate, and stating that some states are deliberately not terminal, is clearer than a guard function |
| **Two-level stage plus track model** | Two levels already: 27 states mapped onto 20 steps | **Reuse the idea, reject the vocabulary** | We independently have two levels and ours is the finer-grained. Renaming to match a vocabulary that is itself due to become data would be churn |
| **`JobRequisition` to `JobApplication` as a soft string ref** | Foreign key | **Reject** | A soft ref exists in their build for integration reasons. It is not a property worth copying |

---

## 3. Activities and external work

| Reference implementation | Retail equivalent | Call | Reason |
|---|---|---|---|
| **14 registered activity types.** `documents.evaluate`, `application.autoApprove`, `offer.prepare`, `sf.extendOffer`, `prejoining.release`, `medical.initiate`, `bgv.initiate`, `prejoining.documents.request`, `nuplay.startCall`, `doj.confirmation.call`, `travel.request`, `hotel.request`, `travel-hotel.request`, `travel-hotel.complete` | 21 retail activities in the definition, resolved from a registry the way our named effects already resolve from `EFFECTS` | **Reject the registry. Reuse the pattern** | All fourteen of theirs are IndiGo verbs. **The generic part of their engine is the node types. The registry is not generic at all**, and that is the correct design: a shared `ACTIVITY` node with a per-tenant registry is exactly right |
| **No `AI_ACTIVITY` node type.** AI work is an `ACTIVITY` with an AI implementation | Our screening is orchestrated outside the engine by `screening.js`, with an empty `completeScreening` effect left behind as a placeholder | **Reuse** | Their call is the right one and ours is the accident. An AI stage is not a different kind of stage, it is a stage whose implementation calls a model. Collapsing our four execution paths into one activity contract is the fix |
| **`EVENT_WAIT`, signalled by a reconciler from durable state** | `waitingOn: candidate, agency, government` on a state | **Reuse the node. Contribute `waiting_on`** | Their `EVENT_WAIT` does not record who is being waited on. Ours does, and it is what lets the interface say a wait on a government department is not a product failure. That field is small, cheap and belongs in the shared contract |
| **`PARALLEL_SPLIT` and `PARALLEL_JOIN`, plus five named gates** | `fanOutParallelWork`, the `needs` graph, `preShiftTasksDone` as an AND guard, critical path against sequential sum | **Reuse** | Same primitive. Theirs names the gates, which is better documentation. Ours computes what the parallelism bought, which they do not need and we do |
| **Gate semantics: some states deliberately not terminal.** BGV `escalated` and vendor `wip` do not clear the gate | Our guards return a boolean and do not enumerate the near-misses | **Reuse** | Writing down which states look done and are not is how a gate stops lying. Their section 16.3 first row is a candidate stuck with everything looking green |
| **`G-PREONB` conditional gating.** Medical always, background verification only for experienced hires, and an unknown value counts as not experienced | Our pre-shift gate is unconditional across nine tasks | **Reuse the pattern** | A conditional gate with a stated default for the unknown case is a good shape, and the reason given is the right kind: gating a fresher whose check can only come back empty parks them for weeks for nothing |
| **Medical orchestration.** Vendor, coloured mail verdicts, Chief Medical Officer escalation, dropped-appointment rule | **No equivalent step exists** | **Reject** | We have no medical step in the funnel at all |
| **Travel, hotel, and the itinerary model.** Hops of induction, training and joining, joining last, travel timed back from the **first** hop | Step 15 is a shift on a schedule in one store | **Reject** | Airline network logic. The general lesson is worth one sentence though: they had a real incident because travel was timed off the joining date rather than the first itinerary stop, which is a reminder to time a deadline off the event that actually constrains it |
| **Voice: seven purpose-specific agents, no fallback between them.** Placed as Mozart workflows because agentX's WAF terminates the handshake for cloud egress IPs | One adapter op that records the intent and does not dial, honestly labelled | **Reject the implementation. Reuse two rules** | The telephony is theirs. Two rules transfer exactly. **One agent per purpose with no fallback**, because a silent fallback produces a working call reading the wrong script, which is how a travel reminder once went out as the offer-reject pitch. And **dispositions returning on a webhook into a table that maps them to state effects**, which is the right shape for any external conversation |
| **Document AI with a `Mock*` twin per capability.** Doc extractor, CV extractor, medical report classifier | No OCR, no extraction | **Reuse the pattern** | A mock twin per AI capability, selected by mode, is how their journey runs end to end with no credentials at all. Ours achieves the same thing for screening with a phrase-bank rubric. The pattern is the same and theirs is more systematic |
| **Ask Maya.** Anthropic call, ported prompt, scoped to the candidate's own journey, canned reply with no key | 25 tools, 14 read and 11 write, three confirmation levels, two routes converging on one registry, 57 safety cases | **Contribute** | Theirs is a read-only FAQ answerer for candidates. An operator assistant that can act, under confirmation, with `human_decision` where confirming is itself the human act, exists in neither their build nor the hrX plan |

---

## 4. Events, audit and exceptions

| Reference implementation | Retail equivalent | Call | Reason |
|---|---|---|---|
| **`StageEvent`, append-only** | `workflowEvents`, 18 fields, one writer | **Adapt** | Same log. **Contribute the duration semantics:** ours records `durationMs` as work time and derives elapsed from the gap between events, so the difference is the queue. That distinction cannot be reconstructed later and it is our entire product argument |
| **`ActionLog`, append-only, application-scoped** (`V13`, so a two-application candidate does not blend) | `auditEvents`, 14 fields, with `outcome` of ok, refused or failed | **Reuse, and contribute the refusal** | Their application scoping is a fix we would have needed. **Ours records refusals as first-class**, with four distinct types each carrying a human-readable reason: `illegal_transition`, `actor_not_permitted`, `guard_failed`, `not_found`. A refused action is the most interesting thing an audit log holds |
| **`manual_override` distinguished from `stage_changed`.** `StageService.advance` rejects a non-adjacent jump unless `override=true` | **Absent** | **Reuse** | An override that reads like normal progression is an override nobody can find later. This is a small, clean idea we do not have |
| **`ExceptionItem`, raised by outbox exhaustion, resolved by leads** | `exceptions` with kind, severity, owner, `blocksProgress`, nextAction, resolution | **Adapt** | Same entity. **Contribute `blocksProgress`:** ours stops the automatic advance and never stops a person, which is the semantic that keeps a stuck branch from becoming a stuck candidate |
| **Unified pending-action queue with an age on it** | The deck and the work queue | **Reuse the idea** | Independently arrived at, for the same reason, and their statement of it is the better one: the failure mode is not error, it is silence. An offer nobody answered sat in no queue |
| **`ApprovalRequest`.** Kind, payload, decision, an `approver` role and a queue outside the shell. **Nothing in production creates one** | Not modelled. `pendingActions` exists for the assistant only | **Adapt** | Their entity has no producer and ours does not exist. Same gap, differently shaped. Take their entity shape and give it a producer: our pay-rate-above-band case at step 7 |
| **`VoiceCall` rows recording every call, with dispositions mapped to track effects** | `communications` with channel, direction, template id, status | **Adapt** | Ours generalises across email, SMS and voice, which is the better shape. Theirs records the disposition mapping, which ours has no need for yet |
| **`Outbox`.** The state change, the `StageEvent`, the `ActionLog` and the outbox row in one transaction. Relay every 5s, batch 50, retry 30s doubling to a 1h cap, exhaustion raises an `ExceptionItem` | **Absent.** `CONN.call` is synchronous with thirteen inline call sites | **Reuse** | A crash between our state change and the vendor call loses the side effect silently. Their shape is correct and the exhaustion-to-exception path is the part people forget. **Not urgent while every adapter is a pure function that cannot fail except on request**, and required the day one becomes real |
| **In-process relay, unsafe for a second replica** (their gap E6, Gate 2) | Not applicable | **Note, do not copy** | If we adopt the outbox, adopt it with lease semantics from the start rather than inheriting the known limitation |

---

## 5. Integrations

| Reference implementation | Retail equivalent | Call | Reason |
|---|---|---|---|
| **Ports and adapters, `@ConditionalOnProperty` mock and live twins, mode per adapter** | Eight simulated adapters behind one `call()`, every attempt logged, `vendor: null` by construction | **Reuse** | The same idea and theirs is more rigorous. Ours hardcodes `mode: 'simulated'` at three literals, so a real transport means making `call()` async and touching thirteen call sites |
| **`ModuleBoundaryTest` (ArchUnit) fails the build** if a service reaches an adapter implementation, or an adapter drags an entity across a boundary | Five of our tests enforce architecture by reading source text rather than calling functions | **Reuse** | Same conviction, different mechanism, both good. Ours already proves no model runs in the eligibility engine and that `reject_batch` does not exist |
| **Resolved mode published on `/api/_actuator/info`,** because "the env var is set" and "the vendor accepts us" are different facts | **Absent** | **Reuse, and it is the cheapest real win available** | One endpoint, and it converts a configuration claim into an observed fact. This is the single most directly adoptable thing in their codebase |
| **"Going live is configuration."** Mode flips are environment variables | "There is no Connected to Workday anywhere in this product. Naming a vendor we have not integrated is the specific dishonesty this file is designed to make impossible" | **Reuse** | Two statements of the same principle from two directions |
| **SuccessFactors as coarse system of record.** ~200 `SF_FIELD_*` keys, numerically pinned status ids because a *name* resolves against the current item's status set, five write surfaces, a headless-Chrome sidecar because the career portal's Accept control is a ui5 custom element with no selector | Our `ats` adapter, one port, simulated | **Reject the adapter. Reuse the posture** | Every line of theirs is one tenant's configuration of one vendor. Two things transfer. **Field mapping externalised as config rather than compiled in**, because a wrong date format fails the whole merge. And the posture itself, which independently corroborates D-020: "Nurix functions as orchestrator; SF remains the system-of-record" |
| **ServiceNow 6eSkai.** Six case kinds, per-kind subcategory and routing tokens. No state field, no close endpoint, no list endpoint, so Nurix cannot close a case it opened | No equivalent | **Reject** | Vendor constraints that shape their code and exist nowhere else. The general lesson is worth recording: an integration that cannot close what it opens needs a reconciliation story, and they do not have one |
| **AuthBridge BGV.** Token expiry as HTTP 400 rather than 401. Attachments silently dropped without a numeric `documentType`. A wrong location raising real cases in the wrong place | Our `background_check` adapter, simulated. D-014: we never perform checks, we order them, track them and run the notice sequence | **Reject the adapter. Confirm the posture** | Adapter knowledge, correctly held in an adapter. Their posture matches D-014 exactly |
| **`OfferService` mails when the vendor call cannot be made,** hiding the AuthBridge error behind a successful mail | Not applicable | **Reject explicitly** | This contradicts their own principle eight, fail loud over fail plausible, and their runbook says so. **The principle is worth copying. That instance of it is not**, and it is worth naming so nobody copies the pattern along with the principle |
| **Inbound mail, at-least-once, acked only after handling** | No inbound surface at all | **Reuse if we ever have one** | Their durable-ack fix and the instruction that every inbound handler must therefore be idempotent is the right pairing |
| **Idempotency key on outbox dispatch** (`candidateId/action/eventId`) | **Absent.** Zero hits repo-wide | **Reuse** | Ours records `attempt` and `retryable` and has no retry loop, so the fields are currently decoration |
| **Per-variable credential configuration, secrets typed as secrets** | No credential store. "None of them holds a credential" | **Adapt** | Currently a feature and a gap the day a connector is real |

---

## 6. Security, tenancy and data

| Reference implementation | Retail equivalent | Call | Reason |
|---|---|---|---|
| **Tenant isolation** | Enforced structurally in `store.js`: `all()` and `insert()` throw without a tenantId, `byId` returns null across the boundary, 166 call sites honour it. One tenant, a module constant | **Contribute** | **They have none.** Zero of nineteen entities carry a tenant. We have the boundary and not the dimension; they have neither. D-030 makes ours a legal requirement rather than a preference, because pooling records across customers makes us a consumer reporting agency under 15 U.S.C. 1681a(f) |
| **RBAC.** Five roles, method-level, backend-enforced on every `/api/v1/**` call, frontend checks explicitly presentational only | **Absent.** Zero role checks outside tests. Identity is an unauthenticated `?as=` query parameter and `actor.type` is the literal `'human'` | **Reuse** | This is why our human-only rules are currently asserted rather than enforced: `by:['human']` protects against the seed replay and the test suite, not against a live agent caller |
| **Role names:** `hrss_agent`, `hrss_lead`, `approver` with `ApproverKind` of HR Leader, TA Leader, C&B, Ethics & Compliance, `auditor` | Store manager, field HR | **Reject** | One company's org chart, compiled into an enum. **Reuse the shape:** roles, an approver kind, and a read-only auditor who can see decrypted personal data as a deliberate and logged capability |
| **Two session schemes,** because dozens of staff and thousands of candidates share no screens and no session mechanism | One surface, no auth | **Reuse the reasoning** | Their statement that this is "the most load-bearing decision in the product" is worth taking seriously if we ever build a candidate surface |
| **Non-human principals gated by header token, failing closed** | No seam for a non-human HTTP actor at all | **Reuse** | And note their own open question: webhooks fail open while internal endpoints fail closed, and they have it on the register to reconcile |
| **PII encrypted at rest, AES-256-GCM, with a per-record `encKeyId` handle for crypto-shredding** | **Absent** | **Reuse** | The per-record key handle is the mechanism an erasure request actually needs, and it is the primitive our consent-and-retention gap would be built on. Their caution is worth carrying too: single-key with no rotation, a key change orphans previously encrypted data, and it has happened once in production |
| **Retention purge and right-to-erasure.** Designed, **not built** | **Absent.** `store.js` has no delete method | **Reuse when they build it, or build it first** | Same gap on both sides, and theirs is further along because the shredding handle exists. Ours is a gap against our own PRD, which commits to California's four-year retention of system inputs |
| **Consent records** | **Absent on both sides** | **Contribute from hrX** | Neither implementation has a consent table. hrX's argument is the right one: adding it later means reprocessing every candidate already touched |
| **DPDP posture, single region, `ap-south-1` storage** | I-9, E-Verify, FCRA, ban-the-box, fair workweek | **Reject** | These are alternatives, not layers. Neither translates into the other. This is the argument for a jurisdiction rule pack as a sibling of the tenant rather than a column in it |
| **Append-only audit including decrypted-PII read access as a deliberate, logged capability** | Three append-only logs | **Reuse** | Naming a powerful read as deliberate and logging it is better than leaving it implicit |

---

## 7. Testing, operations and honesty

| Reference implementation | Retail equivalent | Call | Reason |
|---|---|---|---|
| **104 backend test classes.** Dispatcher, transition rules, workflow definition validation, the bundled graphs, voice agent routing, adapter mode selection | 62 server cases, a 2-case API walk that restarts the process, 222 classifier cases, 4 opt-in browser tests | **Reuse two specifically** | **Workflow definition validation**, so a definition cannot be published if it references an undeclared node or an unregistered activity. We have no startup check that every `guard:` and `effect:` name resolves. And **their routing test**, which exists because an unmapped agent kind failed only in live mode and used to be swallowed |
| **Zero `@SpringBootTest`.** Nothing boots the context in CI, so Flyway and config binding are unverified. Their own section 17 calls one boot test "the single highest-value test investment" | Our suite boots a real server for the end-to-end walk | **Note** | We have the thing they say they most need, for free, because our whole product is one process |
| **`SimService` walks in-flight runs through the real dispatcher.** No state machine reimplemented for demos | `seed.js` replays 36 people through the real engine with the clock wound back | **Reuse the rule** | Same decision, made independently, for the same reason. It is why either demo can be trusted, and it is worth stating as a shared rule rather than leaving as a coincidence |
| **Principle 7: automation never auto-rejects.** Repeated at gate G-DOC: "Nothing here ever auto-rejects" | Recommendation enum with no reject value, both decision edges `by:['human']`, 57 safety cases | **Reuse, and promote to platform core** | Three independent implementations, two countries, three buyers, same rule. hrX says auto-advance freely and auto-reject almost never. This is no longer a product opinion |
| **Principle 8: fail loud over fail plausible** | `mode: 'simulated'` on every adapter response. "No model ran." on every fallback | **Reuse** | The same principle from two directions, and both have been earned |
| **A green tick means "entered", not "happened".** Read the durable state, not the node decoration | Not applicable yet, and it will be the moment there is a canvas | **Note, and design against it** | The most useful warning in their document. Their fix is a diagnostic instruction. The better fix is for the node decoration to derive from durable state so it cannot disagree |
| **Metrics endpoint with no collector, no tracing, no dashboards, no alerts** (their gap E5) | Metrics derived at read time from the event log | **Note** | Different problem. Theirs is observability of the system; ours is measurement of the funnel, which is the thing v1 has to instrument because no public source has it |

---

## 8. Where the two products actually meet

Three independent data points now say the same thing, and the third is the one that matters because it is a
shipped entity model rather than a process description.

Their `Candidate` pipeline row, the thing their stage machine and their gates and their exception queue all
operate on, **is minted at offer-accept**. Their tracks are document, offer, medical, background verification,
pre-onboarding, date of joining, travel, hotel, onboarding handoff and induction. Their analytics funnel
measures the post-acceptance pipeline and their own document says so.

That is our steps 7 to 16.

The hrX plan's genuinely shared span is the same. The IndiGo process summary read on 31 August said the same
from the outside. **Three builds, two countries, three buyers, and the overlap is the middle of the funnel in
every case.**

So the shared platform, if it is ever built, should be scoped to offer through joining first, and each product
should keep its own ends. Ours diverge upward into application capture, deterministic eligibility and a scored
screening with a human decision. Theirs diverge upward into a physical drive day where selection is a verbal
callout, and downward into medical, travel and induction.

---

## 9. The rows that are not engineering calls

Four of the rows above turn on something that is not mine to decide, and they are marked here so nobody reads
a technical recommendation as a settled question.

**Adopting versioned definitions in rows means reopening the zero-dependency rule.** The JSON file cannot carry
versioned tenant-scoped definitions or a second tenant's ids. That rule is what makes the demo runnable by
anybody with Node and no credentials, so it has earned an explicit decision rather than a quiet erosion.

**The 20 September demo date.** The resolved-mode endpoint and the definition itself are compatible with it.
Definitions in rows are not.

**Whether we fund a shared contract at all,** which is the narrowed version of the one-product-or-two question
already on the to-do list.

**Whether the `STAFF_TASK` rename is worth asking for.** It is a small thing to ask of a team with three
unclosed release gates, and asking for it now rather than later is the difference between a contract and a
fork.
