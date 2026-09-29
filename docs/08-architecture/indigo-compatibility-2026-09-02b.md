---
AUTHOR: Claude. The audit, the mapping and the technical verdict are mine. Section 14 says which questions
  are Suniras's and Nishant's rather than mine
WHAT THIS IS: a compatibility audit asking whether the US retail hiring product can become a second workflow
  on the architecture the IndiGo HRSS implementation actually ships
WHAT THIS IS NOT: an implementation plan or a commitment. Nothing here is scheduled and no code was changed
DATE: 2 September 2026
READS: docs from srikanth/solutioning.md (verified against a4274fc on 2026-09-02), read end to end.
  docs from srikanth/hrX-build-plan.md, read end to end. Our own repository, audited earlier the same day
COMPANION: 08-architecture/hrx-reconciliation-2026-09-02.md answered the same question against the hrX plan.
  Where the two disagree, this one is later and has an implementation to read rather than a proposal
---

# Can retail be the second workflow on the IndiGo platform

## The short answer

**Share selected platform primitives. Share the contract, not the runtime.**

The IndiGo build has the ten workflow node types we lack, versioned insert-only definitions, per-application
bindings and a workflow editor. Those are real and they are the thing worth taking.

It also has no tenant. Zero of nineteen entities carry one. And its pipeline row is minted at offer-accept,
which means our steps 1 to 6, the differentiated half of our product, have no place to live in its domain
model. Not unimplemented. Structurally absent.

The decisive finding is a comparison of two lists. **Making our product a configurable workflow requires seven
changes inside one repository, six of which are already on our own critical path. Making their platform host a
second tenant requires seven changes across nineteen entities, thirty-six controllers, an RBAC matrix and three
unclosed release gates, on a team with a hundred-day token expiry and a capacity gate that has never run.**

So the cheaper convergence is ours moving toward their contract, not ours moving onto their platform. And it
puts nothing of theirs at risk.

---

## 1. Current retail architecture

Audited earlier today with nine parallel subsystem reads and four adversarial verifiers. Full detail in the
companion document. What matters for this comparison:

**Stack.** One Node process. No dependencies, no `node_modules`, no bundler, no build step. `node:http` serves
both the browser and the API. Twenty-one tables as flat arrays in one JSON file, written atomically. Plain
browser JavaScript in classic script tags. It runs with `node server/index.js` and no credentials.

**Domain model.** Twenty-one tables. `candidates` and `applications` are separate with a foreign key, but no
code path creates either at runtime, so the relationship is 1:1 in the seed and "applies twice" is unreachable
rather than handled. `requisitions` carry the eligibility thresholds and the phrase bank. `stores` carry a US
postal code used for display only.

**Process model.** Twenty-seven states and fifty transitions as module-level `const` literals in `schema.js`.
The topology is code. The parameters are data. What is genuinely data-driven is real: guards and effects resolve
by string name through two registries, permissions are an actor allowlist checked generically, `settle()` scans
the transition table rather than following a scripted chain, and the engine body contains no state names.
Onboarding parallelism is an eleven-task `needs` dependency graph.

**Refusals are first-class.** `transition()` returns four distinct structured refusals, `not_found`,
`illegal_transition`, `actor_not_permitted` and `guard_failed`, each with a human-readable reason and each
writing an audit entry. It never silently does nothing.

**Event model.** Three purpose-separated append-only logs: `workflowEvents` (what moved, and the substrate every
duration derives from), `auditEvents` (who did what and why, with an `outcome` of ok, refused or failed), and
`agentActions` (every assistant turn including refusals). One writer each, no mutation anywhere in shipped code.

**Model boundary.** `llm.js` is the only file that opens a connection to a model. Two providers, forced
structured output, a hand-written validator. The `recommendation` enum is `advance`, `review`,
`insufficient_evidence`. There is no reject value, enforced twice. With no key a deterministic rubric runs,
stamped `mode: 'deterministic-fallback'` and printing "No model ran."

**Integrations.** Eight simulated adapters behind one `call()` that logs every attempt to `connectorCalls` with
`mode: 'simulated'`. `vendor` is `null` by construction. **`call()` is synchronous and there are thirteen inline
call sites.** There is no outbox, no idempotency key, no retry loop and no credential store.

**Assistant.** Twenty-five tools, fourteen read and eleven write, three confirmation levels. Both routes to a
tool call converge on one registry. Eight of eleven write tools route their mutation through `WF.transition`.

**Authorization.** None. Zero hits for any role or permission check outside tests. Identity is an
unauthenticated `?as=` query parameter and `actor.type` is the literal `'human'` at `index.js:92`.

**Surfaces.** Eleven routes, all server-assembled. The browser holds one variable of state and nine of eleven
screens only format it.

**Tests.** Sixty-two server cases, a two-case API walk that restarts the process to prove state survived, two
hundred and twenty-two classifier cases, four opt-in Playwright tests. Five tests enforce architecture by
reading source text rather than calling functions.

**What is genuinely functional.** Every state change, every guard, every refusal, every duration, the whole
assistant loop including confirmation and audit, tenant isolation, the twenty-step timeline, the parallel task
graph, persistence across a restart.

**What is simulated and says so.** All eight connectors. The screening evaluation when no key is set.

**What is neither.** The overview page at `demo/index.html` makes zero API calls and presents invented figures
with no label. And `savedPct` is 19.0063 per cent for every application because both of its inputs are sums of
the same constants.

---

## 2. What the IndiGo implementation actually gives us

Nine things, and the first is the reason this audit exists.

**A workflow node vocabulary that is genuinely generic.** Ten node types: `START`, `END`, `CANDIDATE_TASK`,
`HRSS_TASK`, `EVENT_WAIT`, `ACTIVITY`, `TIMER`, `DECISION`, `PARALLEL_SPLIT`, `PARALLEL_JOIN`. That is the
complete set our repository lacks, and it is not a proposal. It has a validator, a condition evaluator, three
published graph versions and a canvas.

**Versioned insert-only definitions.** Editing a published YAML is a no-op. A graph change requires a new
version file, which is why v7 exists rather than a v6 edit. `V22__workflow_definition_versions` and
`V23__archive_workflow_definitions` carry versions and archival. This is the discipline the hrX plan calls the
single most important rule in its section 12, shipped.

**Per-application workflow binding, and per-requisition selection.** `ApplicationWorkflowBinding` says which
application runs which definition version and what its status is. `WorkflowRequisitionConfig` says which
workflow a requisition uses. `V21__dynamic_workflow_bindings` carries both. This is the version pin we do not
have, and it is also the seam that makes an incremental engine cutover possible.

**Ports and adapters with mode switching, enforced by the build.** Every external system is a `core` port with
`@ConditionalOnProperty` mock and live implementations. An ArchUnit `ModuleBoundaryTest` fails the build if a
service reaches an adapter implementation or an adapter drags an entity across a boundary. Going live is an
environment variable.

**The resolved mode published on an endpoint.** `/api/_actuator/info` reports what every adapter actually
resolved to, on the stated grounds that "the env var is set" and "the vendor accepts us" are different facts.
This is better than ours. We hardcode `mode: 'simulated'` at three literals, so swapping in a real transport
means making `call()` async and touching thirteen call sites.

**A transactional outbox.** The state change, the `StageEvent`, the `ActionLog` and the `Outbox` row commit in
one transaction. A relay polls every five seconds, batch fifty, retry thirty seconds doubling to a one-hour cap,
and exhaustion raises an `ExceptionItem` a human sees. We call connectors inline and synchronously, so a crash
between the state change and the vendor call loses the side effect silently.

**Four entities we do not have.** `ApprovalRequest` (kind, payload, decision). `ExceptionItem` (failures needing
human resolution). `WorkflowRun` (with `parentRunId` for sub-runs). `Outbox`. Our nearest equivalents are
`pendingActions`, which exists only for the assistant, and `exceptions`, which we do have and which is close.

**Real authorization.** Five roles, backend-enforced on every `/api/v1/**` call, with the frontend's checks
explicitly presentational only. Two separate session schemes because the two audiences share no screens.
Non-human principals gated by header token. We have none of this.

**PII encrypted at rest with a shredding handle.** AES-256-GCM over the profile, the application data and the
draft, with a per-record `encKeyId` so a single record's key can be destroyed. That is the mechanism a DPDP or
GDPR erasure request actually needs, and it is the primitive our own consent-and-retention gap would be built
on.

Three of their principles are worth quoting because they match ours and arrived independently:

> **Automation never auto-rejects.** Every automatic path either advances a candidate or routes them to a human
> queue. Rejection is a human act.

> **Fail loud over fail plausible.** A missing voice-agent id fails the call naming the variable rather than
> falling back to another agent.

> **Going live is configuration.** Mode flips are environment variables, and the resolved mode of every adapter
> is published.

The first of those is now the strongest convergence across all three documents. Our enum has no reject value and
our `APPROVED` and `REJECTED` transitions are `by:['human']`. hrX says auto-advance freely and auto-reject
almost never. IndiGo ships it as principle seven and repeats it at gate G-DOC: "Nothing here ever auto-rejects."
**Three independent teams, two countries, three buyers, same rule.** That is no longer a product opinion.

---

## 3. What hrX adds beyond IndiGo

The IndiGo build is the better technical reference. hrX still adds four things it does not have.

**Multi-tenancy as a first-class decision.** hrX puts `tenant_id` on every table with Postgres row-level
security, "not by remembering to filter in every query", plus a per-tenant credential vault. The IndiGo
implementation has no tenant at all. This is the single largest gap between the shipped thing and the platform
either document describes.

**Governance tiers on configuration.** hrX splits the editable knobs three ways: most are open, auto-advance
thresholds require approval, and auto-reject thresholds and integrity rules require approval and write an
immutable record of who changed what from what to what. IndiGo's definitions are versioned and insert-only,
which is the mechanism, but there is no tier on who may publish which change.

**Consent and retention as a phase-zero dependency, with the reason.** "Adding consent records and decision
logs later means reprocessing every candidate you have already touched, and possibly deleting data you cannot
lawfully hold." IndiGo has the crypto-shredding handle and states plainly that the retention purge and the
right-to-erasure job are designed and not built. Neither has the consent table.

**A jurisdiction seam without an abstraction layer.** hrX's version is precise and cheap: a `jurisdiction` field
on tenant, requisition, comp plan, document checklist, consent record and retention policy, with statutory
components and verification vendors as rows rather than code. IndiGo's India posture is wired as deployment
reality, single region and `ap-south-1` storage, not as a selectable pack.

And one thing hrX adds that we already have and neither of them does: **a tool-registry assistant**. hrX's
thirty-six modules have a recruiter dashboard and no assistant. IndiGo has Ask Maya, which is a candidate-facing
FAQ answerer scoped to one person's own journey, not an operator that can act. Our twenty-five tools with three
confirmation levels and a fifty-seven-case safety suite have no counterpart in either document.

---

## 4. Compatibility matrix

Legend for the last column. **Config** means the difference is a value, not a design. **Terminology** means the
same thing under two names. **Missing** means somebody has to build it and nothing prevents it. **Domain**
means the behaviours genuinely differ and should. **Incompatible** means a structural conflict that a decision
has to resolve.

| Capability | Our retail repo | IndiGo implementation | hrX plan | Shared? | Recommendation |
|---|---|---|---|---|---|
| Candidate | `candidates` table, no runtime writer, no identity link across applications | `CandidateRegistration`, email-keyed, encrypted profile, no password | Candidate aggregation and identity resolution | **Yes** | **Missing** both sides. Ours has no writer, theirs has no cross-tenant scope. Same target shape |
| Application | `applications`, per requisition, 1:1 in practice | `JobApplication`, "because one person can hold two", carries offer, medical, BGV, travel, DOJ | Application row carries current stage | **Yes** | **Terminology.** Theirs is the better-developed version of ours. Adopt the shape |
| Requisition | `requisitions` with thresholds, phrase bank, `requiresManagerInterview` | `JobRequisition`, careers catalog, `req_id` as public join key, band, expiry | Requisition with approval, headcount, salary band | **Yes** | **Config.** Ours already carries per-role process variation. Theirs already carries per-req workflow selection. Merge the two field sets |
| Stage | 27 states as a `const`, mapped to 20 funnel steps | `Stage`, 11 values, a **backend enum**, advances only as a consequence of a track terminating | Stages as rows in a versioned pipeline definition | Partly | **Incompatible as enums.** Both hardcode. Neither can host the other's stages. Must become data on both sides |
| Track / parallel work | 11-task `needs` dependency graph, `fanOutParallelWork`, critical path | `Track`, 10 values, parallel sub-states with named gate-clearing states | Parallel branches, independent status | **Yes** | **Terminology.** Their Track and our task graph are the same primitive at different granularity |
| Workflow definition | **Absent.** No table, no file, no config | ✅ YAML definitions, `aocs-hire` v5/v6/v7, validator, condition evaluator, editor UI | Planned, as Postgres rows | **Yes** | **Missing on our side.** This is the single most valuable thing to take |
| Workflow versioning | **Absent.** Editing `schema.js` silently re-bases every in-flight application | ✅ Insert-only. Editing a published YAML is a no-op. `V22`, `V23` | Planned, "the single most important rule" | **Yes** | **Missing on our side.** Adopt the insert-only rule verbatim |
| Workflow binding | **Absent.** No field names the process an application started under | ✅ `ApplicationWorkflowBinding` + `WorkflowRequisitionConfig` | Planned as a version pin | **Yes** | **Missing on our side.** Cheap now, expensive later |
| Decision nodes | Guards on transitions, string-keyed, 8 of them | ✅ `DECISION` node type with a condition evaluator | Branch conditions as data | **Yes** | **Terminology.** Our guard registry is a decision evaluator without a node wrapper |
| Human tasks | `by:['human']` on a transition. No task object | ✅ `CANDIDATE_TASK` and `HRSS_TASK` as distinct node types | Human interview stage as a first-class stage type | **Yes** | **Missing on our side.** Their two-audience split is the right distinction and we do not have it |
| External waits | `waitingOn: candidate, agency, government` on a state | ✅ `EVENT_WAIT`, signalled by reconcilers from durable state | External async with independent status | **Yes** | **Terminology**, and ours adds who we are waiting on, which theirs does not carry |
| Timers | Elapsed-time guards, `thirtyDaysElapsed` and siblings. Business-day arithmetic in `compliance.js` | ✅ `TIMER` node type, plus fourteen scheduled pollers | SLA timers as data | **Yes** | **Terminology** for the node. **Config** for the durations, which are literals on both sides |
| Parallel split / join | `fanOutParallelWork` effect, `needs` graph, AND-gate by guard | ✅ `PARALLEL_SPLIT` and `PARALLEL_JOIN` node types, plus five named gates | Parallel branches | **Yes** | **Terminology.** Same primitive, theirs named |
| Event log | `workflowEvents`, 18 fields, one writer, work-versus-queue separated | ✅ `StageEvent`, append-only | One append-only event table | **Yes** | **Terminology.** Ours separates work time from queue time, which is our product argument and theirs does not need |
| Audit log | `auditEvents`, 14 fields, records **refusals** with a reason | ✅ `ActionLog`, append-only, application-scoped, `manual_override` distinguished from `stage_changed` | Immutable decision record | **Yes** | **Terminology.** Both good. Ours records refusals, theirs distinguishes overrides. Take both |
| Exception queue | `exceptions` with kind, severity, owner, `blocksProgress`, nextAction, resolution | ✅ `ExceptionItem`, raised by outbox exhaustion, resolved by leads | Human review queue for integrity flags | **Yes** | **Terminology.** Ours blocks automatic progress and never blocks a person, which is a semantic worth keeping |
| Notifications / outbox | `communications` table with channel, template id, status. **No transactional outbox.** `notifications` table has zero writers | ✅ `Outbox` in the same transaction, relay with backoff, exhaustion to `ExceptionItem`. `OutboundEmail` audit | One outbox behind one template store | **Yes** | **Missing on our side.** Their outbox is the correct shape and we call connectors inline |
| AI activities | `screening.js` orchestrated **outside** the engine, with an empty `completeScreening` effect left as a placeholder | ✅ `ACTIVITY` nodes: `documents.evaluate`, `application.autoApprove`, medical report classification, CV extraction | AI stages in the pipeline definition | **Yes** for the node type | **Missing on our side.** They have no `AI_ACTIVITY` type either: AI work is an `ACTIVITY` with an AI implementation, which is the right call |
| Voice activities | An adapter op that records the intent and does not dial. Honestly labelled | ✅ Seven agent kinds, one per purpose, no fallback between them, placed as Mozart workflows. Dispositions on webhooks, `VoiceCall` rows, routing test | Voice as one channel among four | **No** | **Domain.** Theirs is real telephony we do not need. The `ACTIVITY`-plus-webhook-disposition shape transfers. The seven agents do not |
| Document activities | An adapter op. No OCR, no extraction | ✅ Anthropic doc extractor, CV extractor, medical report classifier, each with a `Mock*` twin | LLM extraction into a structured schema | Partly | **Domain** for what is extracted. **Missing** for the pattern of a mock twin per AI capability, which we should copy |
| External vendor adapters | Eight simulated adapters, one `call()`, every attempt logged, `vendor: null` by construction | ✅ Eleven ports, live implementations for all, mock twins, mode published on an endpoint, boundary enforced by ArchUnit | Typed connector per vendor with idempotency keys | **Yes** | **Config.** Their pattern is strictly better than ours. Adopt the resolved-mode endpoint and the ArchUnit rule |
| Approval requests | **Absent.** `pendingActions` exists for the assistant only | `ApprovalRequest` entity, `approver` role, dedicated queue outside the shell. ⬜ **Nothing in production creates one** | Offer approval chain, band-breach escalation | **Yes** | **Missing on both.** Theirs is an entity with no producer. Ours is not modelled. Same gap, differently shaped |
| RBAC | **Absent.** Zero role checks outside tests. `?as=` query parameter, `actor.type` hardcoded `'human'` | ✅ Five roles, method-level, backend-enforced, two session schemes, non-human principals gated | RBAC plus OIDC | **Yes** | **Missing on our side**, and it is the reason our human-only rules are currently asserted rather than enforced |
| Tenant configuration | Gate enforced structurally in `store.js`, throws without a tenantId. One tenant, a module constant | **Absent.** Zero of nineteen entities carry a tenant. Package and config namespace are `indigo` | `tenant_id` everywhere with row-level security, plus a credential vault | **Yes** | **Incompatible.** We have the boundary and not the dimension. They have neither. This is the largest blocker to hosting retail on their platform |
| Integration configuration | Adapter registry is a module `const`, identical for every tenant. No credential field | ✅ ~200 `SF_FIELD_*` keys, per-kind ServiceNow routing tokens, mode matrix in `application.yml` | Per-tenant credential vault and mapper | **Yes** | **Config**, and theirs proves the point: field mapping is deliberately externalised because a wrong value fails the whole merge |
| AI assistant | 25 tools, 3 confirm levels, two routes to one registry, 57 safety cases | Ask Maya: Anthropic call, ported prompt, scoped to the candidate's own journey, canned reply with no key. **Read-only** | Nothing comparable | **No** | **Ours to contribute.** An operator assistant that can act, under confirmation, exists in neither |
| Analytics | Derived at read time from the event log. Work versus queue, handoffs, people involved, critical path | Dashboard KPIs `@Cacheable`, analytics screen. Funnel measures the **post-acceptance** pipeline only | Free from the event log | Partly | **Domain.** Their funnel cannot see the pre-acceptance journey because the pipeline row does not exist yet |
| Cost metering | `usage` stored on screening model calls and never read. Assistant usage dropped entirely | Not described. No price table, no per-tenant rollup | Planned in P2, per-call and per-requisition caps | **Yes** | **Missing on all three.** Nobody meters |
| Consent / retention | **Absent.** No consent table, no retention field, no data class, and `store.js` has no delete method | 🟡 AES-256-GCM with a per-record key handle for shredding. ⬜ Retention purge and erasure designed, not built | Consent rows per purpose, retention per data class, deletion that reaches object storage | **Yes** | **Missing on all three**, and theirs is furthest along because the shredding handle exists |
| Human override | `StageService` equivalent absent. Rehire hold has two human-only exits, both requiring a reason | ✅ `StageService.advance` is the deliberate override path. Rejects a non-adjacent jump unless `override=true` and audits it as `manual_override` | Overrides are events with a reason attached | **Yes** | **Missing on our side.** Their explicit override path with a distinct audit action is cleaner than ours |
| Automation rules | `auto: true` on ten transitions, `settle()` loop, `blocksProgress` stops the loop and never a person | `DispatcherService` + `TransitionRules` as the single authority. Idempotent: a no-op returns `changed=false` | Auto-advance thresholds as governed config | **Yes** | **Terminology.** These are the same design. See section 8 |

### The mismatches that are not merely terminology

Five, and only two of them are structural.

**Stage as an enum, on both sides.** Ours is twenty-seven `const` keys, theirs is an eleven-value Java enum plus
a ten-value `Track` enum. Neither can host the other's stages, and adding retail stages to `Stage.java` would
put a US grocery funnel inside an airline's compiled vocabulary. **Both must become data.** This is
architectural, not cosmetic.

**No tenant in the IndiGo implementation.** This is the blocker. It is not a missing column. Nineteen entities,
thirty-six controllers, an RBAC matrix and a `Role` enum all assume one customer, and the `indigo.*`
configuration namespace assumes it in about eleven hundred and ninety lines of YAML.

**The pipeline row starts at offer-accept.** Their own section 6.1: the `Candidate` row is minted at
offer-accept, so "before acceptance there is no stage, no exception queue and no audit feed", the `DOC` and
`OFFER` tracks are "effectively vestigial in production", and the analytics funnel measures the post-acceptance
pipeline. **Our steps 1 through 6 have nowhere to live.** That is domain behaviour on their side and it is
correct for them, because IndiGo selects candidates by verbal callout on a physical drive day. It is not
extensible to us without moving where the row is minted.

**Voice.** Domain. Seven purpose-specific agents against real Indian telephony, with a WAF that terminates the
handshake for cloud egress so calls are placed as Mozart workflows. None of that is our problem. The pattern
that does transfer is narrower and worth naming: an `ACTIVITY` node that starts an external conversation, a
webhook that returns a disposition, and a table that maps dispositions to state effects.

**Analytics span.** Domain, downstream of the row-minting point above.

---

## 5. Shared platform kernel

The smallest set justified by two implementations rather than by one plan.

### Core entities: eleven

Only concepts that exist, under some name, in at least two of the three.

| Entity | Justified by |
|---|---|
| `Tenant` | Ours structurally, hrX by design. **Not** IndiGo, which is why this is the first thing to add rather than the first thing to share |
| `Requisition` | All three. Ours carries process variation, theirs carries workflow selection |
| `Person` | All three. Their `CandidateRegistration`, our `candidates`, hrX's candidate aggregation |
| `Application` | All three, and theirs is the reference: one person can hold two |
| `WorkflowDefinition` + `WorkflowVersion` | IndiGo shipped, hrX planned. Insert-only |
| `WorkflowBinding` | IndiGo shipped. Which application runs which version |
| `Node` | IndiGo shipped, as ten types |
| `Event` | All three, append-only. Their `StageEvent`, our `workflowEvents` |
| `Action` | All three. Their `ActionLog`, our `auditEvents`. Ours records refusals, theirs distinguishes overrides |
| `Task` | IndiGo as two node types, ours as onboarding tasks, hrX as a stage type |
| `Exception` | Ours and theirs, both first-class |

Four more are justified by one implementation each and should be in the kernel because the gap is real on the
other side: `Approval` (IndiGo entity, no producer), `Outbox` (IndiGo shipped, we have none), `Integration`
(both, ours weaker), `AiActionRecord` (our `llmCalls`, they have no equivalent record of a model verdict).

Deliberately **not** in the kernel: `WorkflowRun`. IndiGo has it because Temporal and Mozart runs need
tracking. We run `settle()` in process. Adding a run object before there is a durable runtime to track would be
a speculative abstraction.

### Core workflow primitives: their ten, unchanged

`START` · `END` · `CANDIDATE_TASK` · `HRSS_TASK` · `EVENT_WAIT` · `ACTIVITY` · `TIMER` · `DECISION` ·
`PARALLEL_SPLIT` · `PARALLEL_JOIN`

I tried to break this set against our twenty steps and it holds for nineteen of twenty. The mapping:

| Ours | Theirs |
|---|---|
| 9 `system` steps | `ACTIVITY` with a deterministic implementation |
| 5 `agent` steps | `ACTIVITY` with an AI implementation. Correctly **not** a separate node type |
| Step 6, hire or reject | `HRSS_TASK` with three outcomes. Their v7 document-review node has exactly this shape |
| Step 8, offer accepted or goes quiet | `CANDIDATE_TASK` plus a `TIMER` |
| 3 `clock` steps | `EVENT_WAIT` where a verdict returns, `TIMER` where a period elapses |
| Steps 11 to 14, the task graph | `PARALLEL_SPLIT` over `ACTIVITY` and `HRSS_TASK`, then `PARALLEL_JOIN` |
| Steps 19 and 20, tenure | A `TIMER` chain |

Two renames worth arguing for if the vocabulary is ever shared: `HRSS_TASK` is an IndiGo job title, not a
concept. `STAFF_TASK` and `CANDIDATE_TASK` are the same distinction without the tenant's org chart in it.

**The one thing that does not express, and it matters.** Our adverse action bar is a rule that forbids a
specific edge, `REJECTED` and `TERMINATED`, for as long as `everify.decision === 'contesting'`, and records
every blocked attempt with who tried. Their vocabulary has `DECISION`, which routes, and five gates, which are
AND-joins that hold a path until conditions clear. **A gate says you may not proceed yet. The bar says you may
never take this particular edge while this is true.** That is a negative constraint on an edge and there is no
node type for it, because a node cannot express a prohibition on a transition it is not part of.

This is not a criticism of their design. It is the specific place where our regulatory position needs something
their domain never required, and it means an adopted node vocabulary needs an eleventh concept that is not a
node: **a graph-level edge constraint with its own audit action.** Worth naming now, because discovering it
after adopting the vocabulary would mean either weakening the bar to fit or bolting it on outside the engine,
and the bar is the thing that keeps a contested E-Verify mismatch from becoming grounds for adverse treatment.

### Core lifecycle

The proposed one is nearly right. One insertion, from their code rather than from theory:

```
Requisition
  → Application
  → Workflow binding            (pins the definition version, and never silently re-bases)
  → Node execution
  → Event append                (before the side effect, in the same transaction)
  → Outbox                      <- THE INSERTION
  → Human / AI / external action
  → Exception or continuation
  → Completion
```

The outbox belongs between the event and the action because that is what makes the two survive a crash
together. Their sequence diagram in section 11.4 is explicit: one transaction writes the state, the
`StageEvent`, the `ActionLog` and the `Outbox` row, returns 202, and the relay dispatches afterwards. Our
thirteen inline connector calls are the version of this that loses work.

---

## 6. Retail-specific layer

What stays ours, and why each is a product decision rather than an unported feature.

**The twenty-step funnel and its ratio.** Seventeen of nineteen classifiable steps are a wait or a handoff. That
ratio is the argument for the product (D-013) and it is a claim about this funnel.

**Steps 1 to 6, the whole pre-decision half.** Application capture, deterministic eligibility with no model in
it, phrase-bank screening, and a human decision on a score. This is where our differentiation is and it is the
part IndiGo's domain model cannot currently hold. Keeping it retail-specific is not a concession; it is the
product.

**Five US statutory clocks with the citation inline.** I-9 Section 2 within three business days,
8 CFR 274a.2(b)(1)(ii). E-Verify case creation by the third business day. Tentative nonconfirmation, ten federal
working days as one shared window. FCRA pre-adverse, eight days. Adverse, ten.

**The adverse action bar,** for the reason in section 5.

**The FCRA single-tenant matching boundary.** D-030. The protection comes from the furnishing-to-third-parties
element of 15 U.S.C. 1681a(f), not the transactions-and-experiences exclusion. Enforced in the query layer with
a test that plants a rival retailer's do-not-rehire record.

**The three-year I-9 rehire window** and the rehire path, which is where the journey genuinely collapses.

**Fair workweek fourteen-day notice** on a shift write, reported as a constraint rather than silently applied.

**No rejection by a model, in three independent places,** because step 6 producing a score makes us a regulated
automated employment decision tool in New York City and, since October 2025, in California, where a system that
merely facilitates a human decision is in scope.

**The store manager's day as the shape of the interface.** D-031. The work queue, the deck, the per-store view.
The buyer gets a report, the champion an argument, the blocker an audit trail.

**The exception-based operating model.** This follows arithmetically from the seventeen-of-nineteen ratio. In a
funnel dominated by external waits the queue is the product, not the step. Note the difference from IndiGo:
their unified pending queue with an age on it is the same idea, and it exists because silence rather than error
is their failure mode too. **The idea is shared. The reason it dominates our product is the ratio, which is
ours.**

**Work time separated from queue time, at capture.** Their `StageEvent` records transitions. Ours records
`durationMs` as work and derives queue from the gap, because that distinction cannot be reconstructed later and
it is the whole product argument.

**The operator assistant.** Twenty-five tools, three confirmation levels, `human_decision` where confirming is
itself the human act. Neither other document has an assistant that can act. This is the piece most worth
protecting from a generic-ATS drift, because it is the tracker-plus-assistant-plus-automation-hub claim made
concrete.

**The connector postures.** Read, write, both, or ours-already, per step. Twelve of twenty steps need something
from an existing system and eight need nothing, which is why four of the six steps neither incumbent sells into
are available on day one without asking anybody's IT department.

---

## 7. IndiGo-specific layer

Not "India-specific because it appears in the document". Each row says why it belongs in a tenant
implementation or behind an adapter.

| Thing | Why it is not platform |
|---|---|
| SuccessFactors as coarse system of record | About two hundred `SF_FIELD_*` keys, numerically pinned status ids because a *name* resolves against the current item's status set, five distinct write surfaces, and a headless-Chrome sidecar because the career portal's Accept control is a ui5 custom element with no selector. **Every line of that is one tenant's configuration of one vendor.** The reusable part is the port and the mode switch |
| ServiceNow 6eSkai | Six case kinds with per-kind subcategory and routing tokens, category `6eHRTech`. And the vendor has **no state field, no close endpoint and no list endpoint**, so Nurix cannot close a case it opened. Those constraints shape their code and exist nowhere else |
| AuthBridge BGV | Token expiry surfacing as HTTP 400 rather than 401. Attachments silently dropped without a numeric `documentType`. A wrong `LOCATION_ID` raising real cases in the wrong place. Adapter knowledge, correctly held in an adapter |
| India identity and document flows | Aadhaar, UAN, education certificates against a blacklisted-institutions list. Adapter and config |
| DPDP and `ap-south-1` residency | A jurisdiction pack, and theirs. Ours is I-9, E-Verify, FCRA, ban-the-box and fair workweek. Neither translates into the other; they are alternatives |
| Medical orchestration | A pre-employment medical with a Chief Medical Officer escalation, verdicts arriving as coloured mail replies, and a rule that more than three dropped appointments drops the candidate. **We have no equivalent step at all** |
| Travel and hotel, and the itinerary model | Induction in one city, training in another, joining in a third, hops ordered with joining last, and travel timed back from the **first** hop rather than the joining date. This is airline-network logic. Our step 15 is a shift on a schedule in one store |
| IndiGo roles | `hrss_agent`, `hrss_lead`, `approver` with `ApproverKind` of HR Leader, TA Leader, C&B and Ethics & Compliance, `auditor` with decrypted-PII read access. One company's org chart, compiled into a `Role` enum |
| Two session schemes | Dozens of staff on Entra SSO, thousands of candidates on SF-relayed credentials through a browser sidecar. The **split** is a genuinely good platform idea. The mechanisms are theirs |
| Seven voice agents | Real Indian telephony, DLT rules, a WAF that terminates TLS for cloud egress IPs so calls go via Mozart workflows that bake their own agent id. Domain and infrastructure |
| The eleven-stage, ten-track vocabulary | An AO&CS post-selection journey. Correct for them, and it is the thing that must become data before anything else can share it |
| `MedicalBgvTrackMapping` | A translation layer between three copies of the same journey state with non-identical vocabularies. This is a **workaround for a data model problem**, named as "split-brain" in their own section 6.1. Do not port the workaround. Learn from the diagnosis: one authority per fact |

One thing in their build is tempting to copy and should not be, for their own stated reason.
`OfferService` deliberately mails when the AuthBridge call cannot be made, which their own runbook says "hides
the AuthBridge error behind a successful mail." That contradicts their principle eight, fail loud over fail
plausible, and they have documented it as such. **The principle is worth copying. That instance of it is not.**

---

## 8. Dual-engine and workflow migration analysis

### Why two engines exist

The legacy FSM shipped first and carries production. The dynamic engine was built to a separate design brief and
is opt-in per application through `WorkflowMode`, where `LEGACY` is the compatibility default. Their roadmap
says migrate AO&CS "application by application, then retire the FSM path."

### Debt, migration strategy, or legitimate coexistence

**A migration strategy that has not started, which is turning into debt on a clock.**

The evidence that it is a real strategy is strong. `WorkflowMode` per application is exactly the right seam for
an incremental cutover, because it lets one candidate move without moving anybody else. Definitions are
insert-only and versioned. Two reconcilers keep durable state and workflow state in step. The roadmap names the
retirement rather than leaving it implied.

The evidence that it is becoming debt is also concrete. `DYNAMIC_WORKFLOW_TEMPORAL_ENABLED` defaults to `false`
in production, so the durable half of the durable engine is not exercised where it matters. Their own section 8.4
records that a green tick on the canvas means "entered", not "happened", and that a never-raised BGV once read as
complete. And section 6.1 already names split-brain as the historical defect class.

**The reconcilers are the tell.** `reconcilePreJoiningApplications` runs every sixty seconds to observe durable
medical, BGV and document state and signal the matching `EVENT_WAIT`. A single-authority engine does not
reconcile against its own database, because the database is what it wrote. Reconciliation exists because two
things both believe they own progression, and that cost is being paid every sixty seconds for as long as both
engines live.

Being fair to them: coexistence is the right call *given production traffic*. The alternative was a flag-day
cutover on a system with a live candidate pipeline and three unclosed release gates. Nobody should do that.

### Which model our product is already closer to

**Ours is the legacy FSM, almost line for line.**

| IndiGo legacy FSM | Ours |
|---|---|
| `DispatcherService` as the single authority for automated state change | `workflow.js transition()`, and nothing else changes state |
| `TransitionRules` computing downstream effects | `TRANSITIONS` plus the `GUARDS` and `EFFECTS` registries |
| A no-op transition returns `changed=false`; an unknown sub-state is rejected before any write | Four structured refusals, each audited, each naming the legal moves |
| Parallel forks enqueued through the outbox atomically | `fanOutParallelWork` and the `needs` graph, in process, no outbox |
| `StageService.advance` as the deliberate manual override, `override=true`, audited as `manual_override` | **Absent.** We have no distinguished override path |
| `SimService` walks in-flight runs through the **real** dispatcher, no state machine reimplemented for demos | `seed.js` replays 36 people through the real engine with the clock wound back |

That last row is the same decision, made independently, for the same reason. Worth noting because it is the
reason both demos can be trusted.

### Whether to adopt the dynamic engine concept

**Adopt the concept and the contract. Do not adopt a second engine.**

We are in the position they were in before the FSM shipped, and that position expires the moment we have a
customer. We have no production traffic to protect, so we can skip the dual-engine phase entirely by making our
one engine the dynamic one. That means moving `STATES` and `TRANSITIONS` into versioned rows with a binding,
rather than standing up a second runtime beside them.

### Whether to avoid reproducing the dual-engine problem

**Yes, and the way to avoid it is a rule rather than a plan:** there is one authority for state change, and if a
definition moves into rows then the rows are it. No `WorkflowMode`, no compatibility default, no reconciler. The
seed drives the definition rather than walking the sequence in straight-line code, which also closes the
existing duplication where `tick.js` carries its own successor map for the tenure chain.

### The clean end state

One engine, reading versioned tenant-scoped definitions, with the application pinning the version it started
under. Node execution through one activity contract. Side effects through an outbox. Overrides as a
distinguished, audited action. Durability added when there is something durable to protect, and Temporal
considered then rather than now.

Their end state is the same picture with the FSM deleted. **Ours can arrive there without ever having two.**

---

## 9. The "second workflow" analysis

Their section 19 asks for this directly: "the second workflow type (beyond `aocs-hire`) is the forcing function
that proves the engine is genuinely generic." So the question is welcome on both sides. Here are the two lists.

### What would have to change in the IndiGo architecture

1. **A tenant, on everything.** Zero of nineteen entities carry one. This reaches every table, every
   repository, every query, thirty-six controllers, the RBAC matrix, and about eleven hundred and ninety lines
   of `indigo.*` configuration. It is also a Flyway migration across a live database.
2. **The pipeline row has to exist before offer-accept.** While `Candidate` is minted at acceptance, our steps 1
   to 6 have no stage, no exception queue and no audit feed. Their own note that the `DOC` and `OFFER` tracks
   are vestigial is the same problem seen from inside.
3. **`Stage` and `Track` have to stop being Java enums.** Otherwise a US grocery funnel goes into an airline's
   compiled vocabulary.
4. **The activity registry has to become pluggable per tenant.** All fourteen registered types are IndiGo verbs:
   `sf.extendOffer`, `medical.initiate`, `bgv.initiate`, `travel.request`, `doj.confirmation.call`. The generic
   part of their engine is the node types. The registry is not generic at all.
5. **Roles have to become tenant-scoped.** `Role` and `ApproverKind` are backend enums holding one company's
   org chart.
6. **A jurisdiction pack layer.** Their India posture is deployment reality, not a selectable pack, and our five
   US clocks with their citations have nowhere to go.
7. **Gate 2 and Gate 3 closed, and Temporal on in production.** Today the outbox relay is in-process and unsafe
   for a second replica, document storage is single-pod `local`, and the capacity gate has never run at target.
   A second customer's traffic cannot land on that.

An eighth, which is not architecture but is real: **it is not our repository.** Every one of those changes
competes with closing Gate 1, and their register already carries a ServiceNow refresh token that expires in
about a hundred days.

### What would have to change in ours

1. **`STATES` and `TRANSITIONS` into versioned, tenant-scoped rows, with a per-application binding.** Everything
   else is easier afterwards.
2. **One stage-execution contract.** Today AI, human, external-order and external-task run down four different
   code paths, and `screening.js` orchestrates the AI stage outside the engine with an empty effect left as a
   placeholder. Their `ACTIVITY` node plus a registry is the target.
3. **Real persistence.** The JSON file cannot carry a second tenant, because `str_`, `req_` and `pri_` ids are
   not tenant-qualified and `byId` resolves id-first, and it cannot survive concurrent writers.
4. **Authentication and a real actor type.** `?as=` and a hardcoded `'human'` are why our human-only rules are
   currently asserted rather than enforced.
5. **An outbox.** Thirteen inline synchronous connector calls lose their side effect on a crash.
6. **Consent, retention, a data class and a deletion path.** We have none of the four and `store.js` has no
   delete method.
7. **Approval as an entity, and a distinguished override path.**

### The comparison, which is the answer

Our list is **seven changes inside one repository**. Six of the seven were already on our own critical path
before this document arrived, and five of them appear in the 2 September audit as gaps against our own PRD
rather than as concessions to a platform. Nothing on the list requires another team's calendar.

Their list is **seven changes across nineteen entities, thirty-six controllers, an RBAC matrix and a Flyway
chain**, plus two unclosed release gates, on a team whose own roadmap has four sequenced priorities ahead of
platform leverage.

**So convergence is roughly an order of magnitude cheaper in our direction, and it is cheaper in the direction
that also happens to be work we owe anyway.** That is the whole finding.

And there is a version of the second-workflow experiment that costs neither team anything and proves most of
what both want to know. **Express our twenty-step retail funnel as an `aocs-hire`-style definition using their
ten node types, and see what breaks.** It is a document, not code. Section 5 above is the first pass at it and
it already found the one real gap: nineteen of twenty steps express cleanly, and the adverse action bar does not,
because it is a negative constraint on an edge and their vocabulary has only positive gates on a path. That
single finding is worth more to their genericity claim than a month of speculative abstraction, and it is worth
more to us than adopting a vocabulary and discovering the hole afterwards.

---

## 10. Target architecture

Adapted to both codebases. Backticked names exist today, on the side the column indicates.

```
                        SHARED CONTRACT                     (a specification, not a deployment)
                        ├── 10 node types + 1 edge constraint    <- their 10, plus the adverse-action shape
                        ├── definition + version + binding       <- their V21/V22/V23, verbatim
                        ├── activity contract                    <- their ACTIVITY + registry
                        ├── event / action append-only shape      <- their StageEvent + our refusal record
                        ├── exception + approval + outbox shapes
                        └── port + mode-switch + resolved-mode endpoint
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
        RETAIL IMPLEMENTATION                          INDIGO IMPLEMENTATION
        Node, one process, no deps                     Java 21 / Spring Boot 3 / Postgres
                 │                                             │
   ┌─────────────┼─────────────┐                 ┌─────────────┼─────────────┐
   │             │             │                 │             │             │
 TENANT      JURISDICTION   RETAIL             (no tenant     INDIA        AO&CS
 `store.js`  PACK           DEFINITION          today)        PACK         DEFINITION
 gate real   `compliance.js` 20 steps                        DPDP          aocs-hire v7
 dimension   5 US clocks     27 states                       ap-south-1    11 stages
 missing     adverse bar     as rows                                       10 tracks
   │             │             │                 │             │             │
   └─────────────┴──────┬──────┘                 └─────────────┴──────┬──────┘
                        │                                             │
                 ONE ENGINE EACH                              TWO ENGINES TODAY
                 `transition()` + `settle()`                   legacy FSM (production)
                 reading rows, not consts                      + dynamic engine (opt-in)
                        │                                      converging on one
                        └──────────────────┬────────────────────────┘
                                           │
                        ACTIVITY / TASK / WAIT / TIMER / DECISION / SPLIT / JOIN
                                           │
                   ┌───────────────────────┼───────────────────────┐
                   │                       │                       │
              AI ACTIVITY            HUMAN TASK              EXTERNAL ACTIVITY
        ours: `llm.js` + `llmCalls`  ours: `by:['human']`    ours: 8 sim adapters
        theirs: doc/CV/medical AI    theirs: HRSS + CANDIDATE theirs: 11 live ports
                   └───────────────────────┼───────────────────────┘
                                           │
                                   OUTBOX  <- ours missing, theirs shipped
                                           │
                              PORTS → customer systems and vendors
                                   mock or live, resolved mode published
```

Two things this diagram says that the proposed one does not.

**The shared thing is a contract, not a running platform.** Two implementations of one specification is not
duplicate engineering in the way that matters, because the definitions, the vocabulary, the integration
contracts and the audit shape all port between them. Two implementations of two different specifications is.
Given that one side is Java on Postgres with Temporal and the other is a single Node process with no
dependencies, and given that both need to keep working while this is decided, the contract is the only thing
that can actually be shared this quarter.

**The jurisdiction pack is a sibling of the tenant, not a child of it.** For the reason in the companion
document: a rule with its own state and its own prohibition cannot be a row in a table every tenant shares.

---

## 11. Minimum migration path

Eight steps. The order is derived from what unblocks what, and the first three change no architecture at all.

**1. Write the retail funnel as a definition, on paper.** Twenty steps and twenty-seven states in their ten node
types, in the `aocs-hire` YAML shape. No code. It costs a day, it tests their genericity claim with a real
second workflow, and it tells us what does not fit before we adopt anything. Section 5 is the first pass and it
already found the edge-constraint gap.

**2. Fix the two live defects from the 2 September audit.** `checkCard` is undefined and breaks the candidate
screen for fifteen of thirty-six candidates. `savedPct` is a constant presented as a measurement. Neither is
architecture and both are visible in a demo.

**3. Adopt their adapter discipline, which is the cheapest real win available.** Make `call()` async, give every
adapter an explicit resolved mode rather than three hardcoded literals, and publish the resolved modes on a
status endpoint. This is one file, it is strictly better than what we have, and it is the change that makes a
real connector a transport swap rather than a refactor. Their own reason is the good one: the env var being set
and the vendor accepting us are different facts.

**4. Consent, retention, a data class and a deletion path.** Before the definitions move, because this is the
only item where waiting is strictly more expensive, and because it is a gap against our own PRD. Their
per-record `encKeyId` for crypto-shredding is the pattern to copy.

**5. Authentication and a real actor type.** Small, and it converts the human-only rules from asserted to
enforced.

**6. One stage-execution contract.** Collapse the four paths into one activity interface resolved from a
registry, the same way guards and effects already resolve. This is the prerequisite for definitions being
meaningful, because a definition that names an activity needs one shape of thing to name.

**7. Definitions into versioned rows, with a per-application binding.** Now it is a migration rather than a
redesign, because the table is already declarative and the interpreter already walks it. Persistence has to
become real in the same pass, since the JSON file cannot carry a second tenant's ids.

**8. Only then consider extracting anything shared.** Their `SDK-EXTRACTION-PLAN.md` is nought of eleven done
and their own `core` module still fuses ports with the app FSM. Extracting shared packages across two languages
before either side has one clean engine would produce a lowest-common-denominator abstraction that neither
codebase wants.

The outbox sits between six and seven, whenever a connector becomes real. It is pointless while every adapter is
a pure function that cannot fail except on request.

**What is not on this list, deliberately:** Temporal, a second engine, a tenant provisioning flow, a workflow
editor, an approval producer, and anything in Java. Also not on the list: building the platform before the
demo. The 20 September date is a real constraint and steps one to three are the only ones that touch it.

---

## 12. What we should build next

Steps one to three above, in that order, and step four started.

Step one is the highest-value single item and it is a writing task. It is also the thing Srikanth's team has
explicitly asked for, so it converts an internal audit into something both sides get to use.

---

## 13. What we should not build yet

Temporal. A second orchestration engine. Anything in Java. Multi-tenant provisioning, before there is a second
tenant. A workflow editor UI, before there is a definition to edit. India-specific anything. Medical, travel or
itinerary orchestration, none of which we have a step for. Voice telephony. Shared packages or an SDK, before
either side has one clean engine. Cost metering. And the whole hrX module list.

One that is tempting because it looks like alignment: **do not adopt `Stage` and `Track` as two levels.** We
already have two levels, twenty-seven states mapped onto twenty funnel steps, and ours is the finer-grained of
the two. Renaming to match a vocabulary that is itself due to become data would be churn.

---

## 14. Open questions

### Ours to answer, and they are technical

- **Does the retail funnel express in their ten node types?** Section 5 says nineteen of twenty. Step one of the
  migration path settles the rest.
- **Where does the adverse action bar live** if the node vocabulary is adopted? It cannot be a node.
- **Does the zero-dependency rule survive definitions in rows?** Probably not, and that is the moment the rule
  has to be reopened on purpose rather than quietly. It is the rule that makes the demo runnable by anyone with
  Node, so it has earned an explicit decision.

### Theirs to answer, and worth asking Srikanth

- **When does Temporal go on in production?** Today `DYNAMIC_WORKFLOW_TEMPORAL_ENABLED` is `false` and `LEGACY`
  is the default `WorkflowMode`. The dynamic engine's durability is the part we would be relying on.
- **Is there a plan to make `Stage` and `Track` data rather than enums?** Without it the engine is generic and
  the vocabulary is not.
- **Is the activity registry intended to become pluggable?** All fourteen types are IndiGo verbs.
- **Has a tenant ever been scoped?** Nineteen entities, no tenant, and it is the blocker.
- **Would they take the retail definition as their second-workflow test case?** Their roadmap asks for one.

### Suniras's and Nishant's, and not mine

- **One product or two, and who staffs a shared platform.** Already on the to-do list from the 2 September
  audit. This document narrows it: the question is now whether to fund a shared *contract* with two
  implementations, which is much cheaper than a shared platform and much less than nothing.
- **Whether the 20 September demo date survives any of this.** Steps one to three are compatible with it. Step
  seven is not.
- **Whether the zero-dependency rule is a principle or a convenience.** Mine to flag, not to decide.

### Two things to carry across from the earlier audits

The voice-screening claim is still unresolved and now appears in our code as well as our README, while IndiGo's
seven voice agents are all notify, nudge, capture and confirm. Question 14 in the Srikanth list settles it.

And the P3 gate is still at zero. Nothing in either of these documents is a practitioner telling us the problem
is real.

---

## VERDICT

### SHARE SELECTED PLATFORM PRIMITIVES

- **Their ten node types, versioned insert-only definitions and per-application bindings are exactly what our
  repository lacks, and they are shipped rather than proposed.** Take the contract. Our engine is already a
  table-walking interpreter with string-keyed guards and effects and no state names in its body, so adopting the
  shape is a migration, not a rewrite.

- **Retail cannot be the second workflow on their platform yet, for two structural reasons rather than any
  matter of taste.** Zero of nineteen entities carry a tenant, and the pipeline row is minted at offer-accept,
  so our steps 1 to 6 have no place to exist. Both are fixable and neither is fixable by us.

- **Convergence is about an order of magnitude cheaper in our direction.** Seven changes in one repository,
  six already on our critical path, against seven changes across nineteen entities, thirty-six controllers, an
  RBAC matrix and two unclosed release gates on someone else's calendar.

- **Do not put a second engine in our repo.** We are where they were before the FSM shipped, with no production
  traffic to protect, so we can make our one engine the dynamic one and skip the coexistence phase they are
  now paying for every sixty seconds in a reconciler. That advantage expires when we get a customer.

- **The cheapest thing that proves the whole thesis is a document, and it is also what they asked for.** Write
  the retail funnel as an `aocs-hire`-style definition in their ten node types. The first pass is in section 5,
  it fits for nineteen of twenty steps, and the one thing that does not fit is the adverse action bar, because a
  prohibition on an edge is not a gate on a path.
