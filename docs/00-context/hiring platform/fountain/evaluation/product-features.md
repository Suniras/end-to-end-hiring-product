# Fountain — Product Features & Capabilities

> Cross-dimension rollup (Mode 3). Every claim is anchored `(dimension: artifact · method · confidence)`.
> **Read the confidence ledger in "Cross-dimension reconciliation" before quoting any number from this
> document** — three of Fountain's loudest claims are marketing-only, one is provably false, and the
> entire *execution behavior* of the AI layer is unobserved this run.

---

## What it does

Fountain (legal entity **OnboardIQ, Inc.**, founded 2014) sells a modular, end-to-end software platform for
**high-volume hourly/frontline hiring and workforce operations** — the frontline-worker lifecycle from paid
sourcing → applicant tracking → onboarding/compliance (I-9/E-Verify) → shift scheduling/attendance →
post-hire engagement and rehire. Its own plainest self-description is "an ATS for hourly workers"
(website: raw/home-and-positioning.md · crawl-clip · medium), but that undersells the built surface: the
published developer API documents **575 endpoints across 14 service families**, of which the legacy Hire
ATS — the product Fountain is known for — accounts for only **108**, while the twelve post-hire
Worker-Experience services account for **~467**: a single one of them, WFM/attendance, is **81 endpoints,
three-quarters the size of the entire ATS API on its own** (api: raw/endpoint-catalog.md ·
docs-reconstructed · medium). *(Corrected, Mode-5 it. 2: earlier drafts of this sentence and its sibling
in `competitive-positioning.md` read "81 … is larger than … 108", which is arithmetically false. The real
and stronger point is the ratio 108 : 467 — the ATS is under a quarter of the documented platform.)*
Since April 2026 the company has repositioned the whole suite as "Frontline
Superintelligence" — an agentic operating system fronted by four named AI personas (**Anna** screening,
**Emma** candidate support, **Sam** retention, **Cue** orchestration) (website: raw/ai-agents-and-cue.md ·
crawl-clip · medium). Commercially it is sold as separately-licensed modules with negotiated,
quote-gated pricing — no price is published anywhere (website: raw/pricing.md · crawl-clip · medium,
verified across 6+ locations) — plus **Assist**, a human-delivered managed/RPO service billed per hire, which
means Fountain competes as *both* software and outsourced recruiting.

---

## Feature map

**Maturity legend:** `GA` = shipped and gated only by license/flag · `GA-recent` = shipped within ~6 months,
still churning · `flag-gated` = present in production client code behind a per-tenant flag · `docs-only` =
documented API surface with no corroborating client surface found this run · `marketed-only` = claimed on
the website with no independent technical backing found · `service` = delivered by humans, not software.

**Independence note (governs every "Confidence" cell — identical to the lane map in
`technology-architecture.md`):** `docs` and `api` both mine the *same artifact* (`developer.fountain.com`)
— per evaluation.md's same-artifact rule they are **one source**, never corroboration of each other. And
per evaluation.md `website` is **not independent of that docs corpus for feature claims** (docs restate
marketing), so a marketing claim plus a developer-portal claim is still **one lane**, not two. The
genuinely independent lanes are: **[A — marketing + served developer-docs corpus (`website`/`docs`/`api`),
one source for feature claims]**, **[B — app source-map (`deployed-client-bundle`)]**, **[C —
infra/CT/CSP (`infra-backend-fingerprint`)]**, **[D — changelog/status page (`community`)]**, **[E —
registry/store absence oracles (`packages`, `distribution-artifacts`, `codebase`)]**.

> **Lane-B upgrade propagated from Mode-5 it. 1 (landed here in it. 2).** The shipped `wx-navbar` /
> `wx-copilot` micro-frontends yielded **466 `/api/service*` paths across 15 client-consumed
> microservices**, of which **seven appear in no documentation at all** — and four of the seven are
> *product* signals this feature map was previously blind to: **`servicesupport`** (18 paths; a `Support`
> D0 destination at `/support/tickets` + `/support/workflows` — an entire ticketing/workflow product),
> **`servicecommunicate`** (3; `/communicate/campaigns` + SMS Usage — see the over-claim reversal below),
> **`serviceintegrations`** (26; a real **data-pipeline / ETL builder** with field discovery, JSON-path
> detection, file parse/transform/preview, one-time import, plus **SCIM**), and **`servicesegmentation`**
> (3; `/settings/segments`). The other three are platform plumbing: **`serviceauthorization`** (27 — a
> full RBAC service), **`servicemessaging`** (5), **`servicescheduler`** (3). **So the fleet is ≥19
> `service*` families, not the documented 12** (`deployed-client-bundle: _shared/api-path-catalog.md`
> §Addendum · `bundle-string-mine` · medium; per-family reconciliation in
> `data-model-api-surface.md` §Spine 2). **Single-lane ⇒ the capability reads below are tentative** — the
> path slugs are verbatim, the product framing is inferred from them, and none was walked.

### Core hiring lifecycle

| Capability | Primary user | Maturity | Evidence lanes | Confidence | Note |
| --- | --- | --- | --- | --- | --- |
| **Applicant tracking (Fountain Hire)** — applicants, stages/transitions, funnels/openings, positions, locations, labels, notes, bulk actions, exports | Recruiter / TA ops | GA | marketing (website: raw/products.md · crawl-clip · medium) + API 108 endpoints (api: raw/endpoint-catalog.md · docs-reconstructed · medium) + ~50 recruiter-SPA routes (bundle: raw/route-table.md · source-map-reassembly · high) | **high (fact)** | **Two** independent lanes (A: marketing + developer portal, one source · B: app source-map) — and lane B alone carries it: ~50 shipped, flag-gated routes are a direct observation. The oldest, deepest surface. |
| **Workflow / stage editor** (per-location, per-role hiring workflows; logic jumps; rule stages) | TA ops / admin | GA | 28 `/internal_api/workflow_editor` paths + `WorkflowEditor` v2 route behind `workflow_editor_v2_enabled` (bundle: _shared/api-path-catalog.md · source-map-reassembly · high) + marketing (website · medium) | **high (fact)** | v2 editor is flag-gated — a live migration, not a finished rollout. |
| **Paid sourcing spend management (Fountain Source)** — channel analytics, budget recommendations, openings-at-risk, historical conversion, spend aggregation | Recruiter / finance | GA | 52 `/internal_api/sourcing` paths incl. `budget_recommendation`, `openings_at_risk`, `suggested_target_budget` (bundle · high) + marketing (website · medium) | **high (fact)** for existence; **tentative** for the "24/7 agentic optimization" framing | The API names *recommendation* endpoints, not autonomous-execution endpoints — see over-claim #7. |
| **Paid job-ad purchase (Stripe card-on-file)** | Recruiter with budget authority | GA | `SourcingPurchaseNew` route + Stripe `SetupIntent` scoped to `/jobs/:jobId/sourcing/new`, coupon path, "invoiced" alternative (bundle: raw/bundle-map.md · source-map-reassembly · high) | **high (fact)** | Resolves the Discovery Stripe question: employer ad-spend, **not** candidate fees or payroll. Fountain's own SaaS billing runs on Chargebee — two decoupled money flows. |
| **Programmatic/paid-channel sourcing (Fountain Reach)** — Meta/Google campaign generation | Recruiter | GA (as vendor-brokered) | marketing (website · medium) + VONQ/Indeed/Recruitics in the client vendor stack + `PostToIndeed` route + 7 `/internal_api/job_boards` paths (bundle · high) | **medium** | Existence corroborated; the "AI agents generate & optimise campaigns" mechanism is unobserved. Carries a self-contradicting claim (over-claim #3). |
| **Talent pool / rehire CRM (Fountain Pool)** — talents, audiences, unified jobs | Recruiter | GA | 28-endpoint `servicepool` (api · medium) + `pool-in-hire` flag (bundle · high) + marketing (website · medium) | **high (fact)** | |
| **Vector-similarity job matching** — `GET .../talents/{id}/jobmatches`, "based on aggregate vector match" | System (surfaced to recruiter) | GA (docs-verified) | `servicepool` endpoint, verbatim description (docs: raw/api-reference.md · docs-reconstructed · medium-high) | **medium — real ML, single lane** | **One of only two concretely-described ML mechanisms in the entire run.** Embedding-based matching, not a keyword filter. No client surface located — the recruiter-facing consumer of this endpoint was not found in the bundle. |
| **Employee referrals** | Recruiter / worker | flag-gated GA | 14-endpoint `servicereferral` (api · medium) + `referral-product` flag (bundle · high) + changelog `Referrals` category (community: raw/changelog-digest.md · crawl-clip · medium) | **high (fact)** | |
| **Interview scheduling / calendar** (self-service rescheduling, slot availability, event creation) | Candidate + recruiter | GA | `/schedule`, `/calendar/*` routes + 5 `/internal_api/scheduler` paths (bundle · high) + Cronofy in the vendor stack (infra: raw/security-headers.md · dns-ct-fingerprint · medium) | **high (fact)** | Scheduling is **vendor-brokered (Cronofy)**, not built in-house. |
| **Offer letters + offer approval rules** | Hiring manager / approver | flag-gated GA (mid-migration) | `offer-letter-templates`, `offer-approval-control` flags; `/approval_rules` replacing legacy `/opening_approvals`, kept side-by-side during cutover (bundle: raw/route-table.md · high) | **high (fact)** | The source comment names the internal ticket driving the cutover — a genuinely mid-flight migration. |
| **Messenger 2.0 / multi-channel candidate messaging** (SMS, WhatsApp, in-app) | Recruiter | GA | `/messenger/*` routes, `whats_app_enabled`, `account_sms_enabled`, `message-applicant-from-any-channel`, `sms-length-limited` flags (bundle · high) + Twilio **and** Bird/MessageBird monitored on the status page (community: raw/status-page-architecture.md · crawl-clip · medium) | **high (fact)** | Dual SMS vendors (Bird added across 4 regions 2026-03-30) — redundancy or an in-flight migration. |
| **Career site / AI jobs directory** | Candidate | flag-gated GA | 9 `/internal_api/career_site` paths + `fountain_ai_career_site_enabled`, `internal-career-site`, `career-site-translation` flags (bundle · high) | **high (fact)** | |

### Onboarding, compliance, workforce

| Capability | Primary user | Maturity | Evidence lanes | Confidence | Note |
| --- | --- | --- | --- | --- | --- |
| **Onboarding task flows (Fountain Onboard)** — assigned tasks, W-4 profiles, universal tasks, partner tasks | New hire + admin | GA | 57-endpoint `servicetodo` (api · medium) + 39 `/internal_api/portal` paths incl. `i9_forms`, `background_checks`, `worker_token` (bundle · high) + marketing (website · medium) | **high (fact)** | |
| **Document OCR + auto-approval pipeline** — glare/focus detection, field extraction, `aiConfidenceLevel`, auto-approve verdict | System (compliance admin oversees) | GA (docs-verified) | Verbatim contract in `external-processing-api-compliance` (docs: raw/webhooks.md · docs-reconstructed · medium-high) + `ai-documenttypes` classifier endpoint in `servicecompliancev2` (api · medium) | **medium-high — real, single artifact lane** | **The single most concretely-specified AI capability Fountain has.** Fountain OCRs the document, scores confidence, forms a tentative verdict, then **synchronously calls the customer's URL** which can return `{forceAutoApprove, forceManualReview}` to override it. 10-second timeout; on timeout Fountain silently falls back to its own logic and *does not notify the customer's team in the UI* — documented candidly by Fountain itself, including the fail-open footgun. |
| **I-9 / E-Verify automation (I-9 Center)** | New hire + compliance admin | GA | marketing (website · medium) + `serviceemployment`/`servicecompliancev2` (api · medium) + `i9_forms` portal paths + `wx_i9_bot_thread_signature` (bundle · high) + E-Verify monitored on the status page (community · medium) | **high (fact)** | An "I-9 bot" thread exists in the client — the compliance flow has a conversational front end. |
| **E-signature** | New hire | GA (dual-vendor) | HelloSign + a DocuSign flag `embedded-docusign` (bundle · high) + `servicemedia` `signDocs` (api · medium) + DropboxSign monitored (community · medium) | **high (fact)** | Tagged-union vendor abstraction in the `Applicant` schema (docs · medium-high) — Fountain deliberately kept e-sign swappable. |
| **Background checks** | Compliance admin | GA (vendor-brokered) | 8 named BGC vendors (website: raw/products.md · medium) + Checkr/Onfido tagged union in the `Applicant` schema + `CheckrStatus`/`OnfidoStatus` webhook events (docs/api · medium-high) + Checkr monitored (community · medium) | **high (fact)** | Entirely brokered — Fountain is the orchestrator, not the screener. |
| **Shift & scheduling / attendance (Fountain Shift)** — shifts, timesheets, clock events, time-off, break/holiday rule engines, demand-based bulk shift generation | Frontline manager + worker | GA, **but not in the recruiter console** | 81-endpoint `serviceattendance` — the largest single family (api: raw/endpoint-catalog.md · medium) + marketing incl. "location-verified clock-ins" (website · medium) | **medium** | **Structural finding:** no shift/attendance route exists in the 1757-file recruiter SPA (bundle · high). Shift lives in a separate Worker-Experience app surface this run never enumerated. Its execution behavior is entirely unobserved. |
| **Engagement / pulse surveys** — surveys, question banks, themes, participants, notification templates | HR / worker | GA (backend), **UI surface now located** (not walked) | 43-endpoint `servicepulse` (api · medium) + `Sam`/`Pulse` marketing (website · medium) + `Sam` changelog category from Jun 2026 (community · medium) + **a `Pulse` D0 destination at `/pulse` with Dashboard / Checks / Settings children in the shipped `wx-navbar` product catalog** (`deployed-client-bundle: raw/wx-micro-frontends.md` §1b · bundle-string-mine · medium) | **medium** | **RESOLVED (Mode-5 it. 1, propagated it. 2) — and reconciled to one wording across all three docs.** `api` originally flagged that `servicepulse` has no matching `/internal_api/*` family in the recruiter console's 300-path catalog, and this cell recorded it as an open gap while `data-model` called it a coverage artifact and `information-architecture` had already located `/pulse` at D0 — three states of one question. All three now read: **the surface exists at `/pulse` (D0) in the Worker-Experience application; the recruiter-console miner simply never reached it.** Not walked (no browser). Same resolution applies to `servicereferral` → `/referral` (D0). |
| **Multi-brand / multi-EIN tenancy** (companies → brands → EINs → locations/location-groups/trees) | Enterprise admin | GA | `serviceorganizations` (121 live eps) + `serviceworkforce` (`api: raw/endpoint-catalog.md` · docs-reconstructed · **medium**) **plus** the client's `/brands/:brandSlug/*` route family (`deployed-client-bundle: raw/route-table.md` · source-map-reassembly · **high**) | **medium-high** *(re-graded Mode-5 it. 3, defect E8a — was "high (fact)")* | Multiple EINs per company reads as genuine franchise/multi-employer support, not a bolt-on. **Why not promoted:** the entity *hierarchy* rests on lane A (medium) plus a client route family; `infra`'s per-tenant subdomains + paired sandbox twins (`raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium) corroborate **per-tenant deployment isolation**, which is a *different* claim, so it cannot band-bump this one. |
| **Analytics dashboards + data-warehouse export** | TA leadership | GA (+ beta variant) | `/analytics_dashboard`, `/analytics_dashboard_beta` routes + `looker_custom_reports_enabled` (bundle · high) + "Warehouse Connections" launch Mar 2026 (community · medium) | **high (fact)** | BI is **embedded Looker**, not in-house. Three analytics incidents in a 5-week window post-launch (community · medium). |
| **Audit trails / governance** (`audit-trails-display`, opening activities, `copilotAuditLogs`) | Compliance / admin | GA | flag + route (bundle · high) + `copilotAuditLogs` resource (api · medium) | **high (fact)** | A **dedicated audit trail for AI-driven changes** is the strongest governance signal in the run — see the AI section. |

### The AI layer (the section that most needs its confidence read carefully)

| Claimed capability | Marketed as | What the evidence actually supports | Confidence |
| --- | --- | --- | --- |
| **Cue** — "autonomous frontline intelligence," multi-agent orchestration, launched Apr 14 2026 (website: raw/ai-agents-and-cue.md · crawl-clip · medium) | A re-architected agentic core running hiring end-to-end without manual work | **Existence: fact.** Two independent lanes: (a) the app ships a **separately-deployed, independently-versioned micro-frontend** `wx-copilot.umd.js` v8 with per-tenant release channels, mounted once outside the router, plus `/openings/:funnelSlug/ai_workflow_builder` (gated `ai_workflow_builder_enabled`), `/fountain_ai` ChatAgent (gated `cai_agent_enabled`), and `/internal_api/ai_builder/workflow/{chat,get_latest_message}` (bundle: raw/route-table.md + _shared/api-path-catalog.md · source-map-reassembly · high); (b) the published API carries a full **Copilot authoring lifecycle** — `createForCopilot` → `cloneForCopilot` → `publishForCopilot` → `applyTestChangesToDraftForCopilot`, plus Copilot-generated audiences, plus `copilotAuditLogs` (api/docs · medium-high). **UPDATED (Mode-5 it. 1) — the mechanism is now settled.** The shipped `wx-copilot.umd.js` carries a verbatim model-selection enum **`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`** (the AWS Bedrock cross-region inference-profile naming convention) inside a multi-provider config schema `llmProvider: enum(["openai","anthropic","anthropic_direct"])` (default `"openai"`) + `llmServiceVersion` + a Bedrock-knowledge-base field, plus a `customPrompt` and a strictness enum (`strict` / `relaxed` / `custom`) (bundle: raw/wx-micro-frontends.md §2c · bundle-string-mine · medium). **RE-GRADED (Mode-5 it. 3, defect E2): that is a *declared configuration*, and it is fact at that scope — but "Cue *runs on* Claude" is NOT promoted.** The apex `anthropic-domain-verification` TXT record (infra · dns-ct-fingerprint · medium) is an **org-level signal**, not an independent lane for a product-level claim (`technology-architecture.md` grades it ambiguous — it sits among internal-tooling SaaS verifications), the schema's own default is `openai`, and no inference call was observed. A **live, unauthenticated MCP server** (`fountain-data-mcp v1.27.2` — Cube.js semantic layer + ClickHouse, 6 tools) backs the agent plumbing, confirmed by direct read-only probe (**high**). Also confirmed shipped: **Scheduled Tasks** (full `createScheduledTask`…`triggerScheduledTask` CRUD+lifecycle, incl. `proposeScheduledTasks` — the same AI-drafts/human-approves shape) and a **skill builder + test playground** at `/cue/marketplace`. | **Existence: high (fact).** **Mechanism: high (fact) at the scope of *declared configuration* — Cue is genuine, multi-provider LLM orchestration with Claude-on-Bedrock named in its shipped client, not a relabeled rules engine. Single lane (the client bundle), NOT promoted a band** — the DNS record is org-level context, not a second lane (re-graded it. 3). **Which provider serves production: tentative/unobserved** (schema default `openai`). **Autonomy: still tentative, unchanged** — the API shape remains draft → test → human-publish (and `proposeScheduledTasks` repeats it), i.e. human-in-the-loop, *narrower* than "runs operations without manual work." **Output quality/behaviour: unobserved** (`write_side_observed: false`). |
| **Anna** — 24/7 voice AI recruiter that screens and qualifies (website · medium) | Autonomous voice screening + structured note generation | **Partial.** A real `/ai_interviewers` config route exists (ungated in the route table, bundle · high); `status.fountain.com` added a dedicated **"AI Interviews"** component on 2026-07-06 (community · medium — an independent, non-marketing lane); `hire-go-enable-live-video-interview` flag + CameraTag vendor present. **But** the `Applicant` schema's `partner_data[]` documents an example partner literally named **"AI Interview"** (docs · medium-high) — i.e. a third-party AI-interview vendor slot exists in the core data model. Whether Anna is first-party or a branded partner integration is **unresolved**. | **Existence: high. Mechanism & ownership: low/tentative.** |
| **Emma** — 24/7 candidate support across voice/SMS/chat/WhatsApp (website · medium; no dedicated product page exists — assembled from search snippets, the weakest marketing source in the run) | An agentic support AI | **The most concrete counter-evidence in the run.** The app ships a full first-party chatbot admin stack — 29 `/internal_api/chatbot` paths including `automated_response_models`, `get_intents_with_bot_reply/{model_name}`, `update_intent/{faqbot_log_id}`, `chatbot_logs/intents`, knowledge-base + career-site-scraping refresh (bundle · high) — plus `is_faq_bot_enabled` / `fountain_ai_faq_enabled` / `chatbot_automated_response_enabled` gates. That is the anatomy of an **intent-classifier FAQ bot with a scraped knowledge base**, not an open-ended LLM agent. It is independently corroborated by **`euw3-ms-nlu.internal.fountain.com` — an in-house NLU microservice** on AWS eu-west-3 (infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium). | **Two independent lanes (app source + CT/DNS) point to intent/NLU machinery ⇒ the "agentic" framing for the support layer is tentative at best.** A separate single-lane hypothesis that Emma is Intercom Fin (docs: raw/help-center.md · medium) is **weakly supported at most** — Fin was found on Fountain's *worker help center*, which is Fountain's own support surface, not the in-product candidate agent; the bundle's first-party chatbot stack argues against wholesale vendor-wrapping. **Non-bleed note (Mode-5 it. 1):** the Claude/Bedrock confirmation for **Cue** does **not** transfer here. Emma is a structurally different subsystem — per-tenant trained intent models + a scraped knowledge base + a dedicated NLU host — and the `wx-copilot` bundle that carried the model enum is Cue's client, not Emma's. Emma's mechanism stays **open**, with the evidence still pointing at classification rather than open-ended generation. |
| **Sam** — post-hire sentiment at Day 1/10/30/60 (website · medium; the changelog says Day 1/7/30 — `community: raw/changelog-digest.md` · medium — a first-party divergence flagged, not averaged), retention-risk flagging | Proactive voice retention agent | **Existence: corroborated.** Introduced 25 Jun 2026 as its own changelog category, with "Customer Configuration for Sam" (customizable instances pre-loaded with Fountain defaults) shipping 23 Jul 2026 (community: raw/changelog-digest.md · crawl-clip · medium) — an independent, dated, non-marketing lane. The plausible backend is the 43-endpoint `servicepulse` survey engine (api · medium), whose documented resources are **generic survey CRUD with nothing AI-specific**. | **Existence: high. "AI-driven retention intelligence" vs. "scheduled survey + threshold alerting": unresolved, tentative.** Also unresolved: whether **Sam and "Fountain Pulse" are the same product under two names** (website · medium) — flagged, not answered. |
| **Brokered agent runtime** (unmarketed — found only in code) | — | 11 `/internal_api/agent_integrations/agent/*` paths: `create_rx_agent`, `create_rx_thread_and_signature`, `applicant_thread_signature`, `fetch_access_token`, `publish_chat_agent`, `conversation_report`, `wx_i9_bot_thread_signature` (bundle · high). The shape — per-thread HMAC signatures + short-lived access tokens + a "publish agent" action — is the standard handshake of an **externally-hosted conversational-agent runtime embedded via a client SDK**, not of an agent served from Fountain's own Rails monolith. | **Inference from path shape, single lane ⇒ tentative.** The vendor is not named anywhere. Adjacent (non-conclusive) signals: `browserbase.com` + `*.onkernel.com` (headless-browser / agent-sandbox infra) in the trust-center CSP (infra · medium). |
| **`exposeAsMcpTool` — an agent-callable API surface** | Not marketed at all | A genuine OpenAPI tag on a **curated** subset of Hire v2 operations — 10/36 in a stratified sample (28%), concentrated on primary CRUD for Applicants/Locations/Positions/Funnels and deliberately excluding sub-resource operations (api: raw/tool-catalog.md · docs-reconstructed · medium). ~~**No live MCP server exists**~~ — **CORRECTED (Mode-5 it. 1): a live MCP server does exist.** `https://data-mcp-production-us-east-1.fountain.com/mcp` answers unauthenticated as `fountain-data-mcp v1.27.2` with **6 JSON-Schema'd tools** over a Cube.js semantic layer + ClickHouse (bundle: raw/wx-micro-frontends.md §2d · **live read-only probe · high**). The earlier negative held only for the 6 guessed paths on `app.`/`services.`/`developer.fountain.com`; this host is discoverable only from the `wx-copilot` bundle. **Scope:** the confirmed server is an *internal analytics / NL-to-SQL* surface for Cue — **not** shown to be the customer-facing agent API the `exposeAsMcpTool` tag implies; three further declared MCP hosts (`wx`, `hire`, `fountain-ai`) were not probed. A real `.well-known/agent-skills` discovery manifest is served, but it is a single "read the docs" pointer, not a tool catalog. | **medium for the tag; high for the live server.** Real, deliberate, pipeline-level investment in agent-consumable APIs — and MCP is **already in production internally**, ahead of any *customer-facing* agent API. This is *unmarketed depth*, the inverse of the AI over-claim. |

### Not software / not built

| Item | Finding | Confidence |
| --- | --- | --- |
| **Fountain Assist** | A **managed RPO service** — Fountain's own team sources and screens, billed "transparent per-hire pricing, no upfront costs," with a replacement guarantee. Its own copy says "our team uses AI to source, screen and schedule" — explicitly human-team-plus-AI, not autonomous agents (website: raw/products.md · crawl-clip · medium) | **medium (single lane, but self-described)** |
| **Official SDK / client library** | **None exists. Primary basis: the direct-registry sweep** — 23 npm + 14 PyPI candidate names probed by direct registry GET (37 GETs), every hit a verified unrelated namesake (`packages: raw/registry-sweep.json` · registry-metadata · **high**, `gaps: []`). Supporting, non-independent: the docs index greps zero for `sdk\|client librar\|npm\|pypi\|pip install`. *(Basis wording aligned across all four rollups, Mode-5 it. 2 — the registry sweep is the finding; the docs grep corroborates it. The index the grep ran over is described as ~185–200 reference-page titles by `packages` and 593–594 pages by `docs`/`api`: **one artifact read twice ⇒ a range, not a third basis**.)* | **high (fact — verified absence)** |
| **Native mobile app / browser extension / installable PWA** | **None publicly distributed.** iOS (3 queries) + Google Play (3) + Chrome Web Store (2) + Firefox AMO (1) + a manifest/service-worker probe on the live shell, all negative; the `/manifest.json` 200s are SPA catch-all false positives verified by content-type (distribution-artifacts: raw/store-and-pwa-sweep.md · binary-extract · **high**) | **high (fact)** — but see conflict **#8**: the SPA route table carries a *legacy* comment naming a "Fountain Mobile App" *(cross-reference corrected it. 2 — this read "#6", which is the badge-inflation row)* |
| **Public source / open-core** | `github.com/Fountain` is a verified namesake org predating the company by 5 years (codebase: inferred · high) | **high (fact)** |

---

## User-facing surfaces

1. **`app.fountain.com` — the recruiter/admin SPA** (internal name `recruiter_ui`): React + Redux + redux-saga + react-router v5, Fountain's own `@fountain/ripple` design system, ~50 authenticated routes nested under a `/:accountSlug` tenant catch-all (bundle: raw/route-table.md · source-map-reassembly · high). **It ships complete unminified source via live production source maps on every chunk checked (8/8)** — 1962 files reassembled, 1757 first-party.
2. **The "Cue" AI copilot micro-frontend** — `wx-copilot.umd.js` v8 + a sibling `wx-navbar` v3, served from `ftn-shared-components.fountain.com` with per-tenant release-channel pinning and its own independently-overridable LaunchDarkly client ID; mounted once outside the router so it survives navigation (bundle · high). Shipped on a separate cadence from the main SPA.
3. **The Worker Experience (WX) portal** — candidate/new-hire facing, **embeddable in the customer's own site** via documented impersonation-URL generation (`servicesecurity`) and a custom-form embed (docs: raw/integrations-partners.md · docs-reconstructed · medium-high); 39 `/internal_api/portal` paths cover I-9 forms, background checks and worker tokens (bundle · high).
4. **Candidate chat / "Chat Apply" widget** — `/internal_api/chatbot/widget/*` (`chat`, `faq_chat`, `close_handoff_session`, `configuration`, feedback logging) across web, SMS and WhatsApp (bundle · high). Note the explicit **human-handoff session** endpoint: the bot is designed to escalate.
5. **Career site / AI jobs directory** — tenant-hosted job listings with translation and interdependent filters (bundle · high).
6. **Analytics dashboards** — embedded Looker, plus a beta variant and a warehouse-export path (bundle · high).
7. **Developer portal** (`developer.fountain.com`, ReadMe) + a **separate partner portal** (`partners.fountain.com`, its own `v1` partner-scoped API) + an Intercom-hosted **worker help center** (`help.`/`support.fountain.com`, branded "Worker Experience Help Center", workspace id `onboardingiq`) (docs · medium-high).
8. **A sales-demo-only surface**: `/sourcing_dashboard` carries the verbatim source comment *"only used for sales demo — not the actual dashboard customers use"* (bundle: raw/route-table.md · high). A demo-specific screen maintained in the production client is a real, unflattering finding about how the product is sold.

**Not surfaces:** no CLI, no desktop app, no publicly distributed mobile app, no PWA, no SDK (see above; the legacy-mobile-client route comment is a flagged, unresolved conflict — conflict #8). "Mobile-first" is a responsive-web claim, not a public-distribution claim.

---

## User journeys

> **All three journeys below are RECONSTRUCTED from static evidence — routes, generated API-client paths,
> and documented endpoint contracts — not observed.** `session` is `status: absent` with
> `write_side_observed: false`, so no step here was seen executing. Step *existence* is well-supported;
> step *behavior* is not. (See the write-side cap in the reconciliation section.)

### 1. Requisition → hire (the core recruiter loop)

Open a requisition (`/openings`, `serviceworkforce` openings) → optionally mark it for sourcing and buy
distribution (`/internal_api/sourcing/openings/mark_for_sourcing` → `suggested_target_budget` /
`budget_recommendation` → `/jobs/:jobId/sourcing/new` Stripe SetupIntent, or `PostToIndeed`) → candidates
apply via the career site or the Chat-Apply widget → auto-screening + AI-interview stage
(`/ai_interviewers`, the "AI Interviews" status component) → recruiter works the stage board
(`ApplicantsV2`, `Messenger`, WhatsApp/SMS templates) → interview scheduling via Cronofy → background check
via Checkr/Onfido (webhook events `CheckrStatus`/`OnfidoStatus`) → offer letter from a template → approval
via `/approval_rules` → transition to hired (Hire v2 `Transition` webhook). Anchors: bundle:
raw/route-table.md + _shared/api-path-catalog.md · high; api: raw/endpoint-catalog.md + raw/webhooks.md ·
medium.

### 2. Hired → day one (onboarding + compliance — the most technically specified flow)

Hired applicant enters a `servicetodo` task flow → uploads documents through the WX portal → **Fountain's
OCR engine scores the document** (glare, focus, field extraction, `aiConfidenceLevel`) → auto-approval logic
forms a tentative verdict → **Fountain synchronously calls the customer's External Processing URL** with that
verdict and blocks on the response (10s timeout) → the customer's service may return
`{forceAutoApprove, forceManualReview}`; `forceManualReview` wins ties; on timeout Fountain silently reverts
to its own decision **without surfacing that in the UI** → final status recorded → I-9 + E-Verify state
machine advances → e-signature via HelloSign/DocuSign → W-4 profile → LMS assignment (Lessonly / Northpass /
WorkRamp) → day one. Anchors: docs: raw/webhooks.md · docs-reconstructed · medium-high; api:
raw/endpoint-catalog.md · medium; bundle: `/internal_api/portal` paths · high.

**This is the flow worth studying for a build decision** — it is the only journey in the run whose AI
component has a *published, precise contract* (inputs, confidence score, override semantics, timeout,
failure mode) rather than a persona name.

### 3. AI-authored workflow (the "Cue" loop)

Recruiter opens the AI workflow builder (`/openings/:funnelSlug/ai_workflow_builder`, gated
`ai_workflow_builder_enabled`) → chats with the agent (`POST /internal_api/ai_builder/workflow/chat`, polled
via `get_latest_message` — a request/poll pattern, not a stream) → the agent drafts a task flow
(`createForCopilot`) → the draft is cloned to a test copy (`cloneForCopilot`) → the human reviews, applies
test changes back to the draft (`applyTestChangesToDraftForCopilot`) → the human publishes
(`publishForCopilot`) → every step lands in `copilotAuditLogs`. Anchors: bundle: raw/route-table.md +
_shared/api-path-catalog.md · high; api/docs: raw/api-reference.md · medium-high.

**The loop's own API shape is the finding:** draft → test → human-publish → audit. That is meaningfully
*less* autonomous than "Cue orchestrates agents to run hiring, onboarding, and support workflows end to end,
without manual work" (website · medium), and meaningfully *more* real than a relabeled rules engine. Both
halves of that sentence matter — and **Mode-5 iteration 1 hardened the second half from inference to fact
while leaving the first half exactly as it was.** The agent in this loop is **configured** for Claude
(`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`) served via AWS Bedrock — a
declared config inside a multi-provider schema that **defaults to `openai`**, so *which* model actually
answers a production request is unobserved (re-graded it. 3) — with a live `fountain-data-mcp` MCP server
giving it Cube.js/ClickHouse analytics tools (bundle: raw/wx-micro-frontends.md · medium / live probe ·
high). The **human-in-the-loop gate is unchanged**: the
same draft-then-approve shape recurs in the newly-confirmed Scheduled Tasks surface
(`proposeScheduledTasks` / `proposeScheduledTasksUpdate`). Real LLM, gated autonomy — and the *quality* of
what it drafts is still unobserved.

---

## Gaps & rough edges

**Confidence cap on this section:** Fountain has a first-party changelog (`new.fountain.com`, unlinked from
the main site) but **no public issue tracker, roadmap board, or forum** — `canny` unclaimed, Zendesk not
public, every `feedback./roadmap./updates.` subdomain DNS-fails (community: raw/issue-themes.md · crawl-clip ·
medium). Per evaluation.md's closed-feedback rule, every user-pain theme below is **inferred from changelog
churn and incident logs, never from a counted user report, and is capped low/tentative.** `community`
formally recommends running the deferred `external-reputation` dimension to corroborate — **endorsed here as
the single highest-value follow-up for this target.**

- **Candidate-side AI trust is a self-acknowledged gap — and Fountain published the number itself.** Its own
  commissioned survey (1,014 US frontline workers, Jun 2026) found **62% of applicants report being
  "ghosted" after multiple interview rounds**, with the top complaints being lack of communication (20%) and
  **"unexplained AI screening rejections"** (community: raw/issue-themes.md · crawl-clip · **high for the
  acknowledgment**, since Fountain published it). Fountain's stated mitigations — pre-notification before AI
  interaction, "explainable scoring," opt-in human review, full AI-action logging — are **unverified**
  (no session; `explainable scoring` has no corresponding endpoint or client surface in the 575
  published paths, the **766** app-own paths, or the 127 live Hire-MCP tools — a negative now checked
  across four artifacts). *A vendor publishing the strongest available criticism of its
  own category is unusual and reads as deliberate positioning; the mitigation claims are the part to
  discount.*
- **The new AI layer is still stabilizing.** "Cue agent service disruption" appears **3× in Cue's first live
  month** (Apr 28 minor, May 6 minor, May 12 major) and never again in the following 2.5 months
  (community: raw/status-page-architecture.md · medium). Read against "production-grade agentic system."
- **Analytics/warehouse reliability:** two June 2026 criticals (Analytics Service Degradation; Platform
  Severely Degraded) plus stale EU warehouse data in July — three analytics incidents in a 5-week window,
  shortly after Warehouse Connections launched (community · medium). Overall incident rate ≈5.9/month with
  12 of 50 major-or-worse over 8.5 months.
- **Bulk/mass-action friction** was fixed at least 3 separate times across Hire and Shift (community · low-medium).
- **Cross-product login fragmentation** — "Unified login across Fountain" shipped Mar 2026, which implies
  users previously re-authenticated per product (community · medium). Corroborated structurally by the
  bundle's surviving `containers/Auth_old/*` legacy auth container (bundle · high).
- **Localization/translation** touched three times in six months (community · low-medium).
- **Platform inconsistency is real and self-inflicted:** two API generations behind one gateway with **two
  error envelopes, two pagination styles, and rate limits documented for only the legacy API** — the 12
  Worker-Experience `service*` microservices have **no documented rate limit at all** (api:
  raw/rate-limits-and-pagination.md · medium; `api`'s prose says "13", which counts the `servicehire`
  gateway prefix — see `data-model-api-surface.md` §Count reconciliation). For anyone integrating, this is the concrete cost of the acquisition/proliferation history.
- **Naming debt is visible to customers:** Sam vs Pulse, Cue vs "Fountain Copilot," Source vs Reach vs Pool,
  duplicate industry URLs (`/industry/retail` vs `/industry/retail-hiring-7`) (website · medium) — plus
  "OnboardIQ"/"OBIQ" still embedded in production infrastructure (webhook signature header
  `X-OBIQ-SIGNATURE-V2`, an S3 bucket fleet literally named OnboardIQ, the Intercom workspace id) across
  two independent lanes — three tells inside the one docs corpus (lane A · medium-high) plus the S3
  bucket naming in reassembled client source (lane B · high).
- **Market position, self-reported:** first-ever Gartner MQ inclusion (May 2026) as a **Niche Player** — the
  lowest of the four quadrants — promoted heavily as a milestone (community: raw/review-badges-traced.md ·
  medium).

---

## Cross-dimension reconciliation

### The one claim this run REFUTES

**"Fountain was acquired by Porch Group on June 5, 2025" — FALSE / data-aggregator error.** Sourced only
from a WebSearch aggregator, uncorroborated by any primary source, and directly contradicted by Fountain's
own 2026 newsroom publishing independent-company product launches (the April 2026 Cue launch with its own
named C-suite exec) (website: raw/trust-security-ethics-legal.md · crawl-clip · medium). Recorded explicitly
so no downstream reader re-trusts it. Fountain's real corporate facts: legal entity **OnboardIQ, Inc.**
(Delaware), and one verified acquisition — **Clevy, June 2023**, "an international provider of AI
conversational technologies," IP + talent, terms undisclosed.

### Over-claims and inconsistencies (ordered by how load-bearing they are)

| # | Claim | Status | Evidence |
| --- | --- | --- | --- |
| 1 | **"The first scaled SaaS provider to transition its core architecture into a production-grade agentic system"** | **Over-claim (unsupported superlative + contradicted in shape)** | Unfalsifiable as stated. What the evidence shows is *additive*, not architectural: Cue is a **separately-deployed micro-frontend** bolted onto an unchanged React/Redux SPA (bundle · high), and the Copilot capability lives as extra endpoints **inside the pre-existing services** (`servicetodo`, `servicepool`) with an audit table (api · medium). "Embedded multi-agent orchestration into the platform" is the fair reading; "transitioned its core architecture" is not supported. |
| 2 | **No LLM/foundation-model vendor is named anywhere Fountain's *customers* can see it** — not on the marketing site, not in the docs portal | **UPDATED (Mode-5 it. 1) — still a real disclosure gap, but no longer a verification gap** | Zero mentions of GPT/Claude/Gemini/Llama, or even "large language model", on any customer-facing surface (website · medium). **That remains true and is the finding: Fountain does not disclose its model vendor.** What has changed is that the vendor is no longer *unknown to this recon.* The shipped `wx-copilot.umd.js` micro-frontend carries a verbatim model-selection enum — **`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`**, the AWS Bedrock cross-region inference-profile convention — inside an `llmProvider: enum(["openai","anthropic","anthropic_direct"])` config schema (bundle: raw/wx-micro-frontends.md §2c · bundle-string-mine · medium). **⇒ fact (declared configuration): Cue's shipped client declares Claude-on-Bedrock inside multi-provider LLM infrastructure. RE-GRADED (it. 3, defect E2): "Cue *runs on* Claude" is NOT promoted** — the apex `anthropic-domain-verification` TXT record (infra: raw/sub-processors.md · dns-ct-fingerprint · medium) is an org-level signal, not an independent lane for a product-level claim. The earlier "no `anthropic`/`claude`/`bedrock` literal in the bundle" negative was scoped to the **1,757 reassembled `recruiter_ui` files** and stays true of them — the literals live in the separately-built `wx-copilot` UMD bundle, which that pass never fetched. **Two limits held:** the finding covers **Cue only** — `euw3-ms-nlu.internal.fountain.com` + the intent-model chatbot API still point at in-house NLU for **Emma** — and the schema's *default* provider is `openai`, so which provider serves a given production call is unobserved. |
| 3 | **Fountain Reach: "Get 3x more applicants — without job boards or paid ads"** | **Self-contradicting on its own page** | The same page says Reach works across "Meta, Google, and more" — which are paid ads (website: raw/ai-agents-and-cue.md · medium). A straightforward copy inconsistency, not a technical finding, but it sits next to the site's only concrete unit-economics number ($2.60 cost-per-applicant), which should therefore be treated as unverified marketing. |
| 4 | **"SOC 2 certified"** stated bare on `/hire` and `/onboard` | **Unverified — not refuted** | The dedicated `/security` page names only "third-party security audits," never SOC 2 (website · medium), and `infra` independently confirms `/security` and `/ethical-ai` **name no certification and no vendor at all** (infra: raw/sub-processors.md · medium) — two lanes agreeing the dedicated pages are certification-free. The real Trust Center is a **Vanta**-powered JS-gated page (infra · medium): Vanta's presence corroborates *"runs a formal compliance program"*, not *"holds a SOC 2 Type II"*. Genuinely open; do not treat the badge as verified. |
| 5 | **Compliance-framework claims (EEOC / GDPR / ISO 42001)** appear on `/agentic-ai` only | **Real documentation inconsistency** | The dedicated `/ethical-ai` page is purely qualitative and names **zero** frameworks (website · medium; corroborated by infra's independent fetch · medium). The strongest AI-governance claims live on a marketing page, not the governance page. |
| 6 | **Recognition badges** — G2 "High Performer," Rectec "Certified Partner," SoftwareSuggest "High Performer," all at equal visual weight on the homepage | **Badge inflation — traced to weaker real sources** | (community: raw/review-badges-traced.md · crawl-clip · medium, each traced to its live source page — an independent, non-marketing lane): the G2 profile is real (4.3/5, 126 reviews) but the displayed badge is **pinned to Fall 2023, ~2.5 years stale**; Rectec is a **fee-free vendor directory certification**, not a competitive ranking; the SoftwareSuggest badge rests on **one review** (5/5, Nov 2023). None of the three is fabricated; all three are presented as stronger than they are. |
| 7 | **Quantified outcome claims** — 10x hiring speed, 20% spend reduction, 40% faster onboarding, 91M applicants, 14M hires, $2.60 CPA, 800+ recruiter hours saved | **All single-source marketing, no methodology** | Every number comes from Fountain's own product pages (website: raw/products.md · crawl-clip · medium) with no independent lane. Per the weighting rule they stay **tentative**; none is promoted. Scale claims (91M/14M) are at least *directionally* consistent with the infra evidence of named enterprise tenants on dedicated deployments. |
| 8 | **"Mobile-first"** | **Conflict — FLAGGED, not resolved** (the safe residual claim: responsive web, no public app-store presence) | `distribution-artifacts` proves no publicly-distributed app across 4 store/PWA surfaces (binary-extract · **high**). But the SPA route table's fallback route carries the verbatim comment *"LEGACY route, DO NOT REMOVE — used only for Fountain Mobile App homepage (w/ Tasks) and Settings, only accessible by GlobalDrawer in mobile app"* (bundle · **high**). Both are direct observations at equal method confidence, so neither can override the other. **Flagged, not resolved** — the only claim both sides support is **no currently public app-store / extension / PWA presence**; whether the comment points at a retired client, an MDM/enterprise-distributed client, or a webview of the separate "Fountain Go" surface is unresolved by any lane. A store-only sweep cannot see an MDM-distributed app. |
| 9 | **"AI trained on structured logic, not personal data"** (Anna) | **Neither confirmed nor refuted — but internally coherent** | The claim implies a hybrid (conversational front end + structured scoring layer), which is *consistent* with the in-house NLU host and the intent-model chatbot stack found in two independent lanes. It is also unfalsifiable from outside: the `Applicant` schema natively carries SSN, bank, passport and driver's-license secure fields, and webhooks carry an explicit `send_secure_data` opt-in (docs · medium-high) — so PII is unquestionably *present*; what feeds the scoring model is unobservable without a session. |

### Where marketing and the build actually agree (promoted to fact)

- **The suite breadth is real, and is broader than the marketing nav.** Source, Hire, Onboard, Shift, Pool,
  Reach, Compliance, I-9 Center, Referrals, Communicate, Pulse are all marketed; the API surface
  independently documents attendance/WFM (81 endpoints), pulse surveys (43), pool/CRM with vector matching
  (28), referrals (14) and organizations/multi-EIN tenancy (60). **`Communicate` specifically is confirmed
  a real, routed product, not marketing padding** (Mode-5 it. 1, propagated it. 2): the `wx-navbar`
  catalog ships it at `/communicate/campaigns` with an `SMS Usage` child, backed by a live
  `servicecommunicate` (3 client-called paths, `campaignTemplates` CRUD) — this **reverses** an earlier
  marketing-over-claim disposition recorded in `feature-coverage.md` (row 11). **Two** independent lanes agree on the
  *shape* of the platform (lane A — marketing + developer portal, one source for feature claims — and
  lane B, the app source map); the endpoint counts are lane A's, i.e. a documented inventory, not an
  observed one. **Fountain is not "an ATS" — the ATS is one of ~8
  modules and no longer the largest.**
- **The product is modular and commercially gated, module by module.** Two independent lanes: the docs
  portal's **"Fountain Hire Package Required"** gate on the legacy Hire API (`docs: raw/api-reference.md`
  · **crawl-clip · medium-high** — a reading of a served docs page; *re-tagged Mode-5 it. 3, defect E8c,
  which had it as `registry-metadata · high` — that method belongs to the `packages` registry sweep, a
  different artifact entirely*), and the client's **27
  `whoami.*_enabled` tenant capability booleans + 50 LaunchDarkly flags**, including a dedicated
  **`/chatbot/upsell` route gated on `fountain_ai_upsell_enabled`** and a `/fountain_ai/upsell` twin
  (bundle: _shared/feature-flags.md · source-map-reassembly · high). ⇒ **Fact: the AI layer is sold as a
  paid add-on with in-product upsell, not as a bundled platform capability.** This is the most
  commercially actionable feature-map finding in the run.
- **Fountain's moat is orchestration, not components.** Effectively every specialized capability is
  vendor-brokered: background checks (8 vendors), e-signature (HelloSign + DocuSign), scheduling (Cronofy),
  BI (Looker), LMS (Lessonly/Northpass/WorkRamp), SMS (Twilio + Bird), job distribution (VONQ/Indeed/
  Recruitics), video (CameraTag), flags (LaunchDarkly, self-hosted relays in 4 regions), billing (Chargebee),
  payments (Stripe), trust/privacy (Vanta/Transcend). Corroborated across three independent lanes — the
  client vendor stack + CSP (bundle · high), the status page's directly-monitored vendor components
  (community · medium), and CT/DNS + CSP (infra · medium). **The product is the system of record and the
  workflow layer over a brokered stack.**
- **Enterprise tenancy is real, with named accounts.** Per-tenant subdomains with paired sandbox twins for
  `aimbridge`, `amazon-na`/`amazon-us`, `brandsafway`, `ceracare`, `doordash`, `ontrac`, `staples`
  (infra: raw/dns-and-subdomains.md · medium), a Helm-provisioned dedicated hire cluster for Aimbridge and
  named `ups-functionality` / `aimbridge-hiring-goals-improvements` flags in shipped client code
  (bundle · high), and separately-scheduled maintenance windows for `amazon-mm` / `amazon-eu-dsp` / `ceracare`
  (community · medium). **Three independent, non-marketing lanes ⇒ fact: Fountain runs large logistics/retail
  accounts on isolated deployments, beyond the 15 logos it names publicly.**

### The write-side gap (stated once, per the evaluation cap)

`session` is `status: absent`, `write_side_observed: false`, `pass2: not-applicable` — the batch-wide
`auth:none` default applied and no authenticated runtime was entered (session: _summary.md · inferred · high).
`wire-capture` folded into it, so **no live request or response of the product's own API was observed
anywhere in this run** (the sole exception is Mode-5 it. 1's read-only, unauthenticated MCP capability
probe — a different host, a different protocol, and no write); every
API claim rests on documentation and reassembled client source. Consequently:

- Feature **existence and gating** claims are well-supported (three independent static lanes).
- Feature **execution behavior** — what Anna actually asks and how it scores, what Emma actually answers,
  what Sam actually detects, what Cue actually drafts and how good it is, whether "explainable scoring" and
  "opt-in human review" exist as shipped controls — is **unobserved and stays tentative throughout this
  document.** No mechanism claim about the AI layer is promoted to fact on marketing or docs alone.
- A single read-only Pass-1 session would close most of it: exercising the chatbot widget and the AI workflow
  builder while tapping the wire would resolve the remaining LLM-vs-NLU questions (**Emma, Anna, Sam** —
  Cue's *declared* config is settled; **which provider actually serves its calls is not**), the
  Anna-first-party-vs-partner question, and the `agent_integrations` vendor
  identity in one pass.
- **What Mode-5 iteration 1 did close, without a session:** the *declared* mechanism for Cue (a
  multi-provider LLM schema naming Claude Opus 4.6 / Sonnet 4.6 via AWS Bedrock — **not** which provider
  serves production, which stays open), the live `fountain-data-mcp` MCP server, and the shipped
  status of Scheduled Tasks. Those came from one unauthenticated `curl` of the `wx-copilot`/`wx-navbar`
  micro-frontends plus one read-only MCP capability probe — i.e. the write-side cap was never touched.

### Recommended follow-ups (in value order)

1. **A read-only authenticated session** — closes the remaining AI-mechanism questions (Emma / Anna / Sam,
   autonomy, and output quality) **and the one Cue question a static mine cannot answer: which
   configured provider actually serves a production inference call**. Cue's *declared* mechanism no
   longer needs a session; its *runtime* provider does.
2. **`external-reputation`** (formally recommended by `community` under the closed-feedback trigger) — the
   G2 review corpus, Glassdoor, Reddit — to convert the inferred pain themes into counted user voice.
3. **The Worker Experience app surface** — Shift/attendance (81 endpoints) and pulse (43) have no located
   client surface in this run; the WX portal and `cue.fountain.com` are both JS-gated and unmapped.
4. **`partners.fountain.com`** — a third documented API generation (partner-scoped `v1`), never crawled.
