---
AUTHOR: Claude. The extraction, the classification and the recommendations are mine. Every recommendation on an
  open row is a recommendation and not a decision, and section 3 says whose each one is
WHAT THIS IS: the single source of truth for what is settled before implementation starts, what is genuinely
  open, and who owns each open item. Plus the list of things not to alter casually while building
WHAT THIS IS NOT: a decision-making document. It does not decide anything that belongs to somebody else, and it
  does not reinterpret a settled decision
DATE: 2 September 2026
METHOD: five parallel readers over DECISIONS.md (all 31), OPEN-QUESTIONS.md (Q-001 to Q-042 plus its index),
  PRD-v0.1.md, the nine 05-strategy documents, and the demo honesty rules in CLAUDE.md, demo/README.md,
  UPDATE_29_AUG.md and the code headers. Ninety-seven settled decisions found. Cross-checked against the
  13-agent code audit of 2 September
COMPANIONS: retail-demo-vs-platform-boundary.md and retail-implementation-sequence.md.
  The three 2 September architecture documents are the input to section 4
---

# Retail implementation decision register

## How to read this

**Settled means settled.** Section 1 does not reinterpret anything. Where a decision carries a "what would
change my mind" line and that condition has since been met, the row is marked `fragile` and says why. Fragile is
not the same as open: it is settled until somebody reopens it deliberately.

**Nine decisions were reversed and are not listed as current.** The most consequential is D-015, we are the
system of record, reversed by D-020 on 18 August. A list of every reversal is in section 6, because keeping
withdrawn claims visible is how a reversal stays traceable.

**One conflict is left standing on purpose.** D-017 records success as time to hire and number of hires.
Suniras's stated goals on 26 August are time to hire, number of people involved, and least manual work. **D-017
is not superseded**, because nothing reversed it. So it is the decision of record and the conflict is an open
item, not a quiet substitution.

---

## 1. Settled decisions

### Architecture

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| Connector layer, not system of record | Retailers above $2B run entrenched systems that would be expensive to replace, so we connect rather than replace | D-020, 18 Aug. Reverses D-015 | settled and evidenced | Never build an applicant tracking system. Never require a migration of applicant history. We see events passing through rather than owning the record |
| Tenant isolation at the data layer | "Tenant isolation has to be enforced at the data layer rather than in application logic, because the whole value of this decision is that it cannot be undone by a query somebody writes in a hurry" | D-030, 27 Aug. Explicit design instruction | settled and evidenced | Scope every read at the persistence layer. Never rely on a service-layer filter or on a reviewer catching a missing clause. Already done in `store.js`, and it must survive the move to real persistence verbatim |
| Per-account integrators first | "If we're able to land a client such as Walmart or anything $2B plus then we can build a separate integrator with their existing system of record" | D-028, 26 Aug | **fragile** | Build the first bespoke and design as though a second will exist. Keep the field mapping between the retailer's schema and ours declarative rather than in code. Fragile because its own changer is an unchecked fact: whether two or three systems cover most of the market, which nobody has checked |
| One model boundary | `llm.js` is the only place a model is called | CLAUDE.md, `llm.js:2-5` | settled and evidenced | Never call a model from anywhere else. Two providers behind one interface |
| Zero dependencies | No bundler, no framework, no package manager, no `node_modules`. Node's own http and test runner | CLAUDE.md, demo/README.md | settled and evidenced | Add no package. Note that section 4 flags this as the one settled decision phase 1 cannot satisfy |
| Server holds the secrets | Configuration and the API key are read in the server process only and never reach a response | `llm.js:7, 23-25, 52-65` | settled and evidenced | The browser never holds a key. `publicStatus()` returns provider and model and never the key |

### Workflow and automation

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| All twenty steps, no slice | Cover steps 1 to 20. Humans handle some. Automate most of what can be automated. The spanning view is the claim, parity is the ticket | D-013, 16 Aug | settled by fiat | Never silently drop a step. Seventeen of nineteen classifiable steps are a wait or a handoff, and that ratio is the product argument |
| Four owner types and nothing else | agent, human, system, clock | `schema.js:14-19`, `steps.js` | settled and evidenced | No fifth owner. In the workflow contract `clock` dissolves into TIMER and EVENT_WAIT |
| The four automation categories | A deterministic automation, B AI earns its place, C human required, D fixed clock. Applied to all twenty steps | automation-breakdown.md, applying Suniras's 16 Aug rule | settled by fiat | This is the closest thing to a per-step specification the repository has. Category D steps are where showing the state is the whole product |
| No model on step 2 | Eligibility is deterministic. "Nothing, deliberately" for AI | automation-breakdown.md, `rules.js` | settled and evidenced | A test reads the source to prove no model runs in the eligibility engine. Keep it |
| One authority for state change | `transition()` is the only path, and a refused move returns a reason and writes an audit entry | `workflow.js`, UPDATE_29_AUG | settled and evidenced | Never mutate an application state outside the engine. Never let a refusal silently do nothing |
| Parallel work fans out at acceptance | Everything after acceptance that has no dependency starts together | `fanOutParallelWork`, the eleven-task graph | settled and evidenced | Nine of eleven tasks gate the first shift. Two are deferred until after day one because they cannot lawfully be discharged earlier |
| Blocking exceptions stop the loop, never a person | `blocksProgress` halts `settle()` and never halts a human action | `workflow.js` `hasBlockingException` | settled and evidenced | Keep the semantic. It is half the exception-based operating model |

### Human decision points and safety

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| Step 6 produces a score, a human decides | AI ranks and summarises. It never rejects. A person decides | D-016, 16 Aug | settled and evidenced | `APPROVED` and `REJECTED` are `by: ['human']`. Note D-016's stated reason, that scoring gives a competitive edge, does not survive, because both competitors already score. The decision stands; the reason is parity |
| That makes us a regulated automated employment decision tool | New York City, and California since 1 Oct 2025, where a system that merely facilitates a human decision is in scope | D-016, PRD requirements | settled and evidenced | Annual independent bias audit with a published summary. Ten business days of candidate notice in NYC. An alternative path for disabled candidates. Four years of retention of system inputs in California |
| No reject value in the model schema | The recommendation enum is advance, review, insufficient evidence | `llm.js:71-74`, enforced twice | settled and evidenced | Never add a reject value. This is one of three independent guards on the same rule |
| The agent's ceiling is a decision queue | It may advance a candidate to a decision. It stops there | `schema.js` transition comment | settled and evidenced | `SCREENING_COMPLETE → DECISION_PENDING` is the last edge an agent may take |
| Three confirmation levels | none, confirm, human_decision, where confirming is itself the human act | `agent/tools.js` | settled and evidenced | 25 tools, 14 read and 11 write. Never let the assistant satisfy a human_decision on its own behalf |
| Chain of thought is never stored | Not requested and not stored. The evaluation, the cited evidence and the confidence are kept | `llm.js:27-28` | settled and evidenced | Never store reasoning traces |
| A model may not invent a criterion | Validated before anybody sees it | `llm.js:87-88` | settled and evidenced | An invalid reply is a visible failure and an exception, not a half-populated evaluation |
| Fallback confidence capped at 0.62 | A deterministic rubric cannot present as confident as a model | UPDATE_29_AUG | settled and evidenced | Keep the cap |
| A do-not-rehire match does not auto-reject | It parks the application in front of a person. Both exits are human-only and both require a reason | `schema.js`, D-030 | settled and evidenced | Never auto-reject on a prior record. The record may be wrong |

### Compliance

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| We never perform background checks | We order them, track them, and run the required notice sequence | D-014, 16 Aug | settled and evidenced | Never become the screener. Ordering plus tracking plus the FCRA notice sequence is the whole scope |
| FCRA disclosure is a standalone document | Not a clause inside another form | PRD requirements, 15 U.S.C. 1681b(b)(2)(A) | settled and evidenced | A combined form is a statutory violation. Capture it at step 8, which is what lets step 9 start at acceptance |
| Pre-adverse then a gap then adverse | And the gap cannot be collapsed. The statute sets no number of days | PRD, `compliance.js` | settled and evidenced | The gap duration is tenant policy, because hardcoding a number would be inventing law |
| I-9 and E-Verify through an embedded vendor | One hard requirement: the vendor must expose the E-Verify case state | D-022, 18 Aug | settled and evidenced | Without case state we cannot drive the clocks or enforce the adverse action bar, which makes a vendor unusable regardless of anything else. Recorded on the adapter itself. Note GreenLight was named in D-022 and corrected the same day; it is a worker classification company |
| The adverse action bar | Nothing adverse is lawful while an E-Verify mismatch is contested. Termination, suspension, withheld or lowered pay, delayed training and removed shifts are all barred | `workflow.js` `adverseActionBlock`, `blockShiftRemoval` | settled and evidenced | Two enforcement surfaces today: transitions and the scheduling action. Every blocked attempt is recorded with who tried and why |
| Single-tenant matching, and why | The protection is the furnishing-to-third-parties element of 15 U.S.C. 1681a(f), not the transactions-and-experiences exclusion | D-030, 27 Aug, FTC commentary 603(f)-4A, 4G, 4H | settled and evidenced | Designing against the wrong element produces a design that fails. Scoring and ranking are not the boundary; pooling is |
| The three-year I-9 rehire window | Three years from the **initial execution** of the previous form, not from separation | `rules.js`, 8 CFR 274a.2(c)(1)(i) | settled and evidenced | Getting the datum wrong in either direction is a paperwork violation |
| Two matchers, and no SSN at intake | Post-hire and rehire on SSN, exact. Intake dedup on name, date of birth, email, phone and address, probabilistic, tuned to under-merge, with a human path for the middle band | D-029, 26 Aug | **fragile** | Never require an SSN to apply. Show the operator what was merged and let them split it. Fragile for two reasons in section 2 |
| Fair workweek notice is reported, not absorbed | Roughly fourteen days in covered cities, with a premium payable inside the window | `connectors/index.js` scheduling adapter | settled and evidenced | The adapter reports the constraint rather than silently writing the shift |
| Compliance and security were deprioritised, and that is now dead in practice | D-007 deferred them on Suniras's call, 9 Aug | D-007, and then D-016, D-022, D-030 | **effectively superseded, not formally** | Treat compliance as in scope. D-016, D-022 and D-030 all impose obligations that postdate D-007, and the PRD commits to them. This should be recorded as a formal reversal rather than left as an inference |

### Integrations

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| Every adapter is simulated and says so | `mode: 'simulated'` on every call row and every response, and the interface prints it | `connectors/index.js:4-6` | settled and evidenced | Never describe a simulated adapter as a real integration |
| No unintegrated vendor may be named | The adapter registry has no vendor field to fill in | `connectors/index.js:14-16` | settled and evidenced | No "Connected to Workday". This is enforced by the shape of the registry, not by discipline |
| Deterministic latency | Derived from a hash of the payload, not a random number | `connectors/index.js` | settled and evidenced | Nothing fails at random. A demo that produces different numbers each run cannot be tested |
| Four connector postures per step | System read, system write, system both, or ours already. Twelve of twenty steps need something from an existing system and eight need nothing | connector-map.md | settled by fiat | Four of the six steps neither incumbent sells into need no integration, so they are available on day one |
| Payload redaction on the way in | ssn, password, secret, token and api key are redacted | `connectors/index.js` `redact` | settled and evidenced | Responses are stored raw today, which is a gap rather than a decision |

### Data model

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| Candidate and application are separate | Two tables with a foreign key | `store.js`, and the reference build's "because one person can hold two" | settled and evidenced | No runtime writer exists yet, so 1:1 in practice. Phase 2 |
| Every duration is derived, never stored | Metrics come from the event log and from nothing else | `metrics.js`, and a test that deletes an application's events | settled and evidenced | If it produces 8.3 days, show 8.3 days. Never store a duration |
| Work time separated from queue time at capture | `durationMs` is work. Elapsed is the gap between events. The difference is the queue | `events.js:33-37` | settled and evidenced | Cannot be reconstructed later. It is the product argument |
| Three append-only logs | Workflow events, audit events, agent actions. One writer each | `events.js` | settled and evidenced | Never mutate a recorded event. Note this is convention rather than construction today |
| Refusals are recorded | Four kinds, each with a human-readable reason and an audit entry | `workflow.js` | settled and evidenced | A refusal writes to the audit log only, so it is currently invisible to metrics. Closing that is phase 2 |

### Scope

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| Attract and advertising are out | We have no data advantage there | D-009, 9 Aug | settled by fiat | Note Q-041 pushes back on the job board half of this. See section 2 |
| Management-role hiring is out for v1 | Hourly hiring is volume. Management hiring is a low-volume quality decision. A product serving both is two products sharing a name | D-010, 9 Aug | settled by fiat | One flow |
| Nothing from NuAnchor transfers at product level | | D-011, 9 Aug | settled and evidenced | A pattern and a platform, not a product |
| Desk research is closed | Four rounds. The remaining unknowns became measurement requirements | D-023, 24 Aug | settled and evidenced | Do not open a fifth research round to answer an operating duration. The product is the instrument |
| The premise question is closed | Stop asking whether the problem is worth solving | D-012, 14 Aug | settled by fiat | The mitigation is a design requirement: v1 instruments the funnel it touches |
| Store manager is the user | "Clearly the store manager" | D-031, 27 Aug | settled by fiat | Exactly one designed workspace, laid out around their day. The buyer gets a report, the champion an argument, the blocker an audit trail. No district-manager surface, and the product has to survive that role's indifference |
| Four personas, one workspace | | D-031, 27 Aug | partly settled | The user slot is filled. Buyer and champion are open. See section 2 |
| Skill graphs, sourcing marketplaces, job board aggregation as a platform | Out. A different product with a different buyer | PRD non-goals | settled by fiat | |
| Third-party current-employer lookup | Out, three times over. No interface exists, doing it for an employer makes us a consumer reporting agency, and frontline workers are absent from those databases anyway | PRD non-goals, Q-042 | settled and evidenced | Never build it |

### Demo behaviour

| Decision | Current decision | Evidence | Confidence | Implementation consequence |
|---|---|---|---|---|
| Synthetic data, real computation, simulated connectors | The data can be synthetic. The computation, workflows, transitions, filtering, scoring, timestamps, audit trail and model calls must be real | D-025, 25 Aug | settled and evidenced | The governing rule for the whole build |
| A fallback is never described as a model | `mode: 'deterministic-fallback'` and the literal sentence "No model ran." The browser keys its provenance line on whether a model ran | `llm.js:15-21`, CLAUDE.md | settled and evidenced | The single most important honesty rule in the build |
| No credential in a repository file | Including the sandbox key that has never been opened and whose contents are recorded nowhere | CLAUDE.md | settled and evidenced | Keep it unopened |
| The demo cannot open from `file://` | Reversed on 29 Aug when it got a backend | UPDATE_29_AUG | settled and evidenced | The browser holds no data of its own and the key lives where a browser cannot reach it |
| The seed replays through the real engine | Thirty-six people, clock wound back. No second copy of where they ended up | `seed.js`, D-025 | settled and evidenced | Change a candidate's pace and every reported median moves. Never write down an end state |
| Everything is UTC | Because the compliance deadlines are computed in UTC | UPDATE_29_AUG, CLAUDE.md | settled and evidenced | Rendering in viewer-local time put the opening screen in a different hour of the working day |
| The test baseline may not fall | Server 62, end to end 2, training 133, held out 32, safety 57 | UPDATE_29_AUG | settled and evidenced | A reduction is a failure, not a trade |
| Five tests enforce architecture by reading source | No model in the eligibility engine, the tool confirmation metadata, `reject_batch` does not exist, and two more | UPDATE_29_AUG | settled and evidenced | Never satisfy one of these by changing the test |

---

## 2. Open decisions

Only genuinely open items. Where the repository names an owner, that name is used rather than a guess.

| Decision needed | Why it matters | Options | Recommended | Who decides |
|---|---|---|---|---|
| **Which success metric set governs** | The metric tree, the demo opening screen and the renewal argument all differ. D-017 says time to hire and number of hires. The 26 Aug goals are time to hire, number of people involved, and least manual work. Q-035 records the consequence: "we handled 340 applications" speaks to a volume problem, "this took you eleven hours last month and forty minutes this month" speaks to the capacity problem Anuj described | (a) D-017 stands (b) the 26 Aug three (c) a merged set with a stated primary | (b). Number of hires is a demand outcome we do not control, and the other two are things the product visibly changes | **Suniras** |
| **Pricing** | Every model shrinks as the product works. It is the one item the index calls blocking, and it is deferred by Suniras with two guardrails | Per hire, per requisition, per applicant, per seat, or platform fee | Keep the deferral. It does not block implementation | **Suniras.** Deferred deliberately, Q-030 |
| **Which of the twenty steps ships first** | D-013 says the scope is all twenty and then says "scope is not sequence... That order is still undecided and it has to be settled before S1." What ships first decides what gets funded second | Screening to offer, or the onboarding parallelisation, or the spanning view | Screening to offer, per the standing brief calling it the near-term core | **Suniras** |
| **Who the buyer is, as a person** | "Top management" is a group. A chief HR officer buys a talent story, a chief operating officer buys store productivity, a chief financial officer buys a cost line, a VP of talent acquisition buys their own team's workload. Four different first slides and four different reporting layers | The four above | Not mine to recommend. Nishant may simply know from the rooms he has been in | **Suniras and Nishant** |
| **Who the champion is** | The slot is empty on purpose, because nobody outside Nurix has said the problem is real. Filling it with a guess would be the worst kind of invention | | Leave empty until a practitioner conversation happens | **Needs customer validation** |
| **Whether we store the SSN at all** | D-029's own changer names a better design: never store it, pass it through to the D-022 vendor, hold only a token. The decision calls this "the single most useful architectural question raised so far" and says it should go to whoever does the high level design. Storing it triggers Massachusetts 201 CMR 17.04 and makes it a breach-notification element almost universally | (a) store it (b) token only, via the embedded vendor | (b). It keeps the join without the custody | **Engineering decision**, with the design |
| **Verify the DOJ and ICE guidance on I-9 software requiring an SSN** | If real, an SSN-keyed onboarding design is a named federal hazard. **It has had one verification pass and not two, because the adversarial verifier died when the machine slept** | | Re-run the verification before the design lands | **Needs legal or compliance validation** |
| **Practitioner access** | Zero of the five conversations P3 requires. It is the parent of most other open items: nine of twenty-one PRD timing rows are our own estimate, the champion slot has no candidate, and the buyer is a group | (a) keep pursuing (b) accept going without, and say so | (a), and the cheapest route is one message to Anuj, Q-036 | **Suniras** |
| **Ask Anuj who he met in the USA** | His competitor research carries 229 links and his PRD documents carry none, so the client material was either never written down or lives elsewhere. Nobody has asked. One message | | Ask | **Suniras or Nishant**, Q-036 |
| **Job board distribution, and whether D-009 is amended** | D-009 put attraction out. The 25 Aug meeting raised it as a major point. A free unilateral tier exists: Google for Jobs plus free aggregator feeds, zero cost, no contract, two to four developer weeks | (a) hold D-009 (b) free tier only (c) buy reach | (b). It is free, unilateral and truthful, and the recommendation to buy was corrected the same day it was made | **Suniras**, Q-041 |
| **Contingent and temporary staffing** | In scope or a different product | | Out for v1, consistent with D-010's reasoning | **Suniras**, Q-034 |
| **Rewrite Q-032 around the larger ask** | It asks whether one boolean comes across from the incumbent system. Q-037 reframed the real ask as the full prior employment record, which is a speed feature rather than a compliance guard | | Rewrite, then it becomes a customer question | **Suniras** to rewrite, then **needs customer validation** |
| **Whether an incumbent system will expose the full prior employment record** | The rehire path is where the journey genuinely collapses, and it depends entirely on what a connector can read | | Cannot be answered from here | **Needs customer validation**, Q-037 |
| **Counsel sign-off on the published legal deadlines** | The demo asserts statutory deadlines with citations. That material is right as far as desk research goes and has never been reviewed by a lawyer | | Obtain before any of it goes in front of a customer | **Needs legal validation** |
| **E8: who has the claim when one person applies to several stores at once** | Two stores can both be recruiting the same person, and the data model has no answer | | Needs a rule, and it is a product rule | **Suniras** |
| **E10: the alternative path for a candidate who cannot do a voice interview** | This is an accessibility obligation under D-016's alternative-path requirement, not a nice-to-have | | Must exist before the screening stage is customer-facing | **Needs legal validation**, then engineering |
| **E11: whether compliance rules key to the store's location or to the customer** | Fair workweek and ban-the-box are city and state rules. A national retailer spans both | (a) per store (b) per customer | (a). The obligation follows the worksite | **Engineering decision** |
| **E18: bulk revocation of work authorisation for the existing workforce** | The register flags it as the case that most deserves a second look | | Out of v1, named rather than absorbed | **Suniras** |
| **Steps 17 and 18 instrumentation** | They are in scope under D-013 and are `OBSERVED`: a manager does them in the store. Without a signal they are permanently blank | (a) manager records it (b) infer from the learning system (c) leave uninstrumented and say so | (a) | **Engineering decision** |
| **Whether the model path works against a live provider** | It has been exercised against error paths and the fallback, not against a real key end to end | | Test before the demo, with a key, once | **Engineering decision** |
| **Whether we fund a shared contract with two implementations** | The narrowed version of one-product-or-two. Much smaller than a shared platform, and it is the answer to the question D-028 already put on the record about margin profile | (a) fund it (b) fork and reconcile later (c) keep separate | (a), scoped to the two extensions | **Suniras and Nishant** |

---

## 3. Authority

**Suniras decides:** the success metric set; the build sequence inside the twenty steps; job board distribution; contingent staffing; E8; E18; whether to keep pursuing practitioners; rewriting Q-032; pricing, which he has already deferred with guardrails.

**Suniras and Nishant together:** who the buyer is as a person; whether to fund a shared contract.

**Srikanth and team decide:** whether to accept the `STAFF_TASK` rename; whether to accept a dependency-aware parallel region into the contract; whether their activity registry becomes pluggable; whether `Stage` and `Track` stop being compiled enums; when Temporal goes on in production; whether a tenant is ever scoped. None of these is ours, and none of them blocks us.

**Needs customer validation:** the champion persona; whether an incumbent system exposes the prior employment record, Q-037; whether the eight email-and-phone steps really are email and phone at a target retailer; what a pilot has to prove, Q-028.

**Needs legal or compliance validation:** the DOJ and ICE guidance on I-9 software requiring an SSN; counsel sign-off on the published deadlines; E10, the alternative selection path, which is an accessibility obligation.

**Engineering decides:** whether the SSN is stored or tokenised; E11, whether compliance keys to store or customer; the steps 17 and 18 signal; whether the live model path works; and every item in section 4 marked engineering.

**Already decided, no further discussion:** everything in section 1. Specifically, and because these get relitigated: we are a connector layer and not the system of record; a human decides at step 6; we never perform background checks; all twenty steps are in scope; matching is single-tenant; the fallback is never described as a model; the test baseline does not fall.

---

## 4. The contract questions, resolved

Every item the task named, with a decision or a named owner.

| Question | Position | Authority |
|---|---|---|
| **`STAFF_TASK` vs `HRSS_TASK`** | Ask for `STAFF_TASK`. The distinction against `CANDIDATE_TASK` is right; the word is a job title at one airline, and importing it flattens store manager, field HR and manager into one role | **Srikanth's team** to accept. Ours to ask |
| **Required `actor` semantics** | `owner` is the accountable party under our four-type classification. `actor` is who performs. They disagree on purpose: an I-9 Section 1 is `owner: system, actor: candidate`, because software drives the form and the candidate fills it. Require `actor` on every staff node | **Engineering**, and flag the collision to Srikanth because his vocabulary implies owner and actor are the same |
| **Named conditions** | Adopt. It is a name for something both systems already have: our `GUARDS` registry and their condition evaluator. One of the two genuine extensions | **Engineering** |
| **Dependency-aware parallel regions** | Adopt, and it is the one genuine structural gap. Eleven tasks with four dependency edges is a DAG, and fork-join is strictly weaker. Both builds need it | **Engineering** to build, **Srikanth's team** to accept into a shared contract |
| **Versioned workflow definitions** | Adopt verbatim, including insert-only. Editing a published definition is a no-op; a change is a new version | **Engineering** |
| **Per-application workflow binding** | Adopt. The pin is the point: an in-flight application is never re-based by an edit, and migrating one is an explicit audited action with a preview of who is affected | **Engineering** |
| **Definitions move from code into rows** | Yes, and it is phase 1 item 6. Our topology is already a declarative table with string-keyed guards and effects and no state names in the engine body, so this is a migration | **Engineering**, but it depends on the zero-dependency answer below, which is not engineering's |
| **Whether the zero-dependency demo architecture is preserved** | **It cannot survive phase 1.** One JSON file cannot carry versioned tenant-scoped definitions, and three of our id namespaces are not tenant-qualified so a second tenant's own rows would resolve to null. This is the one settled decision that implementation cannot satisfy | **Suniras.** It is a settled decision and reopening it is his call, not a consequence of an implementation choice |
| **One engine becomes declarative, rather than a dual-engine architecture** | Yes. We are where the reference build was before its FSM shipped, with no production traffic to protect, so we can make our one engine the dynamic one and skip the coexistence phase they now pay for every sixty seconds in a reconciler. That advantage expires the day we have a customer | **Engineering.** On the do-not-change list |
| **Temporal out of scope for the demo** | Yes. It is a cluster, a datastore and a visibility store to operate; it is not a primitive but one implementation of durable orchestration; and their own production runs with it off, so adopting it would mean betting on the half of their engine they have not yet trusted | **Engineering** |
| **Tenant model timing** | Phase 1, item 2, alongside real persistence. The gate already exists and must survive verbatim. A second tenant is not needed, but the dimension is, because D-030 is structural | **Engineering** |
| **RBAC timing** | Phase 1, item 3. Small, and until it exists `by: ['human']` protects the seed replay and the test suite rather than the product, because every HTTP request builds `actor.type: 'human'` | **Engineering** |
| **Outbox timing** | Phase 2, and only when a connector becomes real. Pointless while every adapter is a pure function that cannot fail except on request. If adopted, adopt lease semantics from the start rather than inheriting the reference build's known single-replica limitation | **Engineering** |
| **Consent and retention timing** | **Phase 1, item 1, before anything else.** The only item where waiting is strictly more expensive: adding it later means reprocessing every record already touched. It is a gap against our own PRD, which commits to four years of retention of inputs in California. `store.js` has no delete method at all | **Engineering** to build. The retention periods themselves need legal validation |
| **Approval entity** | Phase 2. Adopt the reference build's entity shape and give it a producer, which we have and they do not: the pay-rate-above-band case at step 7 | **Engineering** |
| **Adverse-action behaviour** | Unchanged, and stays as conservative as it is. It becomes a named condition on four enforcement slots rather than two bespoke functions. It does not need a new primitive, which reverses what the compatibility audit concluded on 2 September morning | **Engineering.** The rule itself is settled and on the do-not-change list |
| **Human-only employment decisions** | Unchanged. Rejection behind a named person is evidenced across three builds. Termination behind a named person is our position alone, because the reference funnel ends at induction with no employment to end. Both become `by: [human]` plus a governance tier on who may edit that list | **Engineering** to implement. Whether termination survives a customer is **customer validation** |
| **Rehire behaviour** | Unchanged. A conditional acceleration, not a separate graph. Detection on this customer's records only. A match parks in front of a person and never auto-rejects. Six reuse verbs already in the code, and the threshold stays tenant and jurisdiction configuration because the source material does not establish one | **Engineering.** The threshold is **customer or legal validation** |
| **External checks: what the platform owns** | We order, track, and run the notice sequence. We never perform a check and we are not a consumer reporting agency. An external step completes when the outside world returns, never when we initiated it | **Already decided.** D-014, and on the do-not-change list |

---

## 5. DO NOT CHANGE

Binding during implementation. Every line has a source. If one of these has to move, it moves by a decision
recorded in DECISIONS.md, not by an implementation convenience.

**Architecture**

1. **Do not introduce a second workflow engine.** One authority for state change. No compatibility mode, no
   opt-in engine, no reconciler.
2. **Do not weaken tenant isolation, or move it out of the data layer.** D-030's design instruction.
3. **Do not pool candidate records across tenants**, however it is framed. It is a change of legal status.
4. **Do not call a model from anywhere except the one model boundary.**
5. **Do not put a secret anywhere the browser can reach**, and do not open or transcribe the sandbox key.

**IndiGo concepts**

6. **Do not copy IndiGo domain concepts into retail.** Not `WorkflowMode`, not the journey mirror with three
   copies of one fact, not their stage and track enums, not the non-adjacency override rule, not medical, travel
   or itinerary orchestration, not their role names.
7. **Do not mint the pipeline row late.** Their `Candidate` is created at offer-accept, which is why their own
   document says two tracks are vestigial and their funnel measures only the post-acceptance pipeline. Our steps
   1 to 6 are the differentiated half of the product.

**Honesty**

8. **Do not describe a deterministic fallback as a model call.** Ever.
9. **Do not name a vendor we have not integrated.**
10. **Do not mark an external step complete because we initiated it.** The check completes when every search
    returns. The E-Verify case completes at a terminal state. Day one completes when attendance is recorded.
11. **Do not let a button change state without recording the action.** Send to Sent with no audit entry is a
    named prohibition.
12. **Do not put a fabricated duration on screen**, and do not present a constant as a measurement.
13. **Do not mix an estimate with a measurement in one comparison.** Subtracting observed wall clock from an
    estimate once produced a number that looked like a saving and was not.
14. **Do not use any figure on the EVIDENCE.md prohibited list.** It currently includes "Paradox does 72 hours",
    which has no source anywhere; 19 per cent of grocery hires as returning workers, which was withdrawn the
    same day it was used and whose real value is 8.9 per cent from Census data; the 33 and 35 per cent boomerang
    figures; the UKG 20 per cent; the Spirit Halloween 11.8 per cent; and any staffing-vendor 72-hour figure
    quoted as a time to hire. **Read the list before quoting any number.**
15. **Do not describe a simulated connector as a real integration.**

**Regulation and safety**

16. **Do not turn an AI recommendation into an autonomous employment decision.** No reject value in the schema.
    Both decision edges human-only. Three independent guards, and the assistant cannot satisfy a human decision
    on its own behalf.
17. **Do not make regulatory behaviour less conservative for demo convenience.** The adverse action bar stays
    on. The three-business-day I-9 clock does not widen. The FCRA gap does not collapse.
18. **Do not auto-reject on a prior employment record.** It parks in front of a person, and both exits need a
    reason.
19. **Do not require an SSN to apply.**
20. **Do not put a model on step 2.** There is a test that reads the source, and satisfying it by editing the
    test is a violation of rule 24.

**The funnel and the record**

21. **Do not silently change the twenty steps.** Same twenty, same four owners, same classification.
22. **Do not remove auditability.** Three append-only logs, refusals recorded, overrides distinguishable.
23. **Do not store a duration.** Every one is derived from events.
24. **Do not lower the test baseline**, and do not satisfy an architecture test by changing the test. Five tests
    enforce a rule by reading source text rather than calling a function, and that is deliberate.
25. **Do not reintroduce the three NLU traps**: lowering the fuzzy-match threshold on concepts costs nine cases
    because "fire" is one edit from "hire"; a person-name match landing just under the gate approves nobody
    rather than the wrong person, which looks like a pass; and a runner-up intent that can never fire eats the
    margin and takes a valid question down with it.
26. **Hard reload before believing a change did not take.** Browser caching produced false measurements
    repeatedly during the August rebuild.

---

## 6. Reversals kept visible

Nine, so a reversal stays traceable rather than looking like a contradiction.

| Withdrawn | Replaced by |
|---|---|
| D-015, we are the system of record and all applicants are fed to our system | D-020, connector layer, 18 Aug |
| Q-031, are we the system of record | Same reversal. Current answer is the overlay |
| Quality of hire as a success metric | Dropped by D-017 the same day it was stated |
| Step 1 marked out as an attract feature, 14 Aug | Back in under D-013 |
| The demo running from `file://` | The 29 Aug rebuild. It cannot, and the reason is the key |
| The human-only rule as a browser function | `by: ['human']` in the transition table, with a four-actor bypass test |
| The parallel screen subtracting wall clock from an estimate | Removed. Two estimates, and observed time reported separately |
| Q-032's conclusion that one boolean is what must come across | Q-037's reframing: the full prior employment record, as a speed feature |
| Q-041's recommendation to buy distribution | Corrected the same day. The free tier ships first |

Plus four claim-level corrections that did not change a decision: the 85 to 88 per cent time-to-hire reduction
inside D-027, withdrawn by its own 27 Aug correction; GreenLight as the I-9 vendor comparable, corrected the
same day in D-022; a TJX requisition offered as evidence on volume, retracted; and D-016's stated reason, that
scoring gives a competitive edge, which does not survive because both competitors already score.

---

## VERDICT

### BLOCKED ON DECISIONS

Three, and only three. Everything else in section 2 either has a recommendation that engineering can proceed
under, or is a deferral with a guardrail, or belongs to a phase later than the one we would start.

**1. Does the zero-dependency rule survive?** Phase 1 cannot be done without breaking it, and it is a settled
decision recorded in CLAUDE.md and the demo README. It is what makes the demo runnable by anybody with Node and
no credentials. Proceeding without an answer means either quietly violating a settled decision or building phase
1 twice.

**2. Which success metric set governs?** D-017 says time to hire and number of hires. The 26 August goals say
time to hire, number of people involved, and least manual work. This is not a reporting detail: it decides what
the deck computes, what the first screen says, and what phase 3 asks about on every page. Q-035 states the
consequence directly, and the conflict has been open since 26 August.

**3. Is the demo still targeted at 20 September?** If it is, phases 1 and 2 do not fit inside it and the
sequence has to fork into a demo track and a platform track. If it is not, the sequence runs in order. This
changes the shape of everything downstream and it cannot be inferred.

**What is not blocking, despite appearing on lists.** Pricing, Q-030, is deferred deliberately with two
guardrails and does not touch implementation. The buyer persona shapes the reporting layer and not the engine.
Practitioner access is the oldest risk in the project and it does not stop code being written. The DOJ and ICE
verification blocks the SSN design decision, which sits in phase 2, not phase 1.

Answer those three and the architecture can be frozen.
