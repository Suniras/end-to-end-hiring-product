# Fountain — Feature Coverage

---
coverage_scorecard:
  features_claimed: 66              # union of website + docs + changelog feature claims, de-duplicated (Mode-5 iter.3: +1 — "Hire Go / Fountain Go", a changelog + status-page claim the original catalog missed; see row 66)
  features_located: 45              # STRICT: an in-product route is known (route + depth) — 31 at Mode 4, +12 wx-navbar catalog + 1 live MCP server (iter.1), +1 Hire Go (iter.3)
  features_walked: 0                # nothing was walked — no browser tool in this session, and auth:none (every Mode-5 iteration was a static curl/mine pass, not a walk)
  feature_location_rate: 68         # 45 ÷ 66 = 68.2 (was 48 at Mode 4, 68 after iter.1) — iter.3 raised numerator AND denominator by 1, so the rate is genuinely flat, not padded
  flow_coverage: 89                 # 8 of 9 identified journeys diagrammed (all as INFERRED) — unchanged since Mode 4
  ia_surfaces_mapped: 31            # surface cards in information-architecture.md — unchanged (new locations came from the nav catalog, not new formal surface cards)
  ia_nav_complete: false            # see ia_nav_coverage below for the RECOMPUTED term (Mode-5 iter.3, defect C1)
  ia_nav_coverage: 0.20             # 4 ÷ 20 — CORRECTED (iter.3). Top-level nav destinations = the 20 distinct products in the wx-navbar Frontline-OS catalog; those with >=1 surface card = 4 (Hire, Source, Cue, Pay*). Was scored 14 ÷ 14 = 1.00 in this document and estimated 14 ÷ 19 = 0.74 in the Mode-5 proposal; BOTH flattered it. Cartography mapped the interior of ONE of 20 top-level products.
  screenshot_coverage: 0            # ZERO screenshots exist this run — genuine gap, unchanged (no browser capability in this session)
# --- run-specific fields (additive; not part of the standard schema) ---
  features_backend_located_only: 16 # 25 at Mode 4 — 9 rows promoted to located (3,4,5,6,7,8,9,12,16)
  features_not_located_at_all: 5    # 9 at Mode 4 — 4 rows promoted to located (10,11,22,63)
  features_located_any_lane: 61     # 45 route-located + 16 backend-located = 92% of claims have SOME located evidence
  claimed_but_not_located_undispositioned: 0
  walk_blocked_by: ["no-browser-tool-in-session", "auth:none"]
  ia_method: source-map-reassembly + bundle-string-mine (iter.1: wx-navbar/wx-copilot; iter.3: npm.fountain source map)  # NOT live-walked — see information-architecture.md banner + Mode-5 update blocks
  scorecard_recomputed_at: mode-5-iteration-3   # closes defects C1 (stale denominator) + C2 (stale banner numbers)
---

<!-- Cartography (Mode 4), artifact 3 of 3 · governed by .claude/rules/cartography-coverage.md
     compiled 2026-08-09 -->

> ## ⚠️ Read the scorecard against the method that produced it
>
> **`features_walked: 0` is the honest headline.** Two independent blockers, and they are different in
> kind:
>
> 1. **`auth:none`** — no authenticated session was established all run (`session: status: absent`,
>    `write_side_observed: false`). This was known from Mode 1.
> 2. **No browser-driving tool exists in this session at all** — the Chrome MCP surface is absent
>    (confirmed by tool search). This is a **capability gap discovered at Mode 4**, and it is strictly
>    worse than (1): it also blocked the *unauthenticated* walks that `auth:none` alone would have left
>    open — `cue.fountain.com`, the tenant career site, the public chat widget, the Intercom help center.
>
> **What replaced the walk was unusually strong for a degraded mode.** `deployed-client-bundle` performed
> a **full source-map reassembly** of `app.fountain.com` (1,962 files, 1,757 first-party) and recovered
> the recruiter console's **entire route table with each route's exact feature-flag / RBAC gate**
> (`source-map-reassembly · high`). So "located" here is a **verbatim machine artifact**, not a guess —
> it is simply not a *walk*. Nothing in this document was seen rendering.
>
> **Why `feature_location_rate` is deliberately strict.** A feature counts as **located** only when an
> in-product **route** is known, per `cartography-coverage.md` ("locate it in the actual product by route
> + depth"). A backing API family or a feature flag is *evidence the capability exists*, not knowledge of
> *where it lives* — those rows are counted separately as `features_backend_located_only` and each is
> dispositioned. Reporting the any-lane figure would overstate what Cartography actually established.
>
> > ⏳ **Historical figures, superseded — do not read as current** *(marked Mode-5 iteration 3, defect
> > C2).* This paragraph originally read "**deliberately strict (48, not 86)** … those **25** rows are
> > counted separately". Those were the **Mode-4 (iteration-0)** numbers. Current: the rate is **68**
> > (any-lane 92%), and `features_backend_located_only` is **16**. The frontmatter is authoritative.
>
> ## ✅ Mode-5 iteration 1 update (2026-08-09, same day) — closes re-walk-queue items 1 and 2
>
> `wx-navbar.umd.js` and `wx-copilot.umd.js` were fetched and mined (unauthenticated, no source map,
> `bundle-string-mine · medium` — `raw/wx-micro-frontends.md`). This is **still not a walk** (no browser
> tool exists in this session; `features_walked` stays 0), but it is a second, independent **static
> machine artifact** (a live, shipped nav-config catalog + generated API clients), which is exactly the
> evidentiary tier `feature_location_rate` already credits for the original 31. Concretely:
>
> - **12 rows promoted to ✅ located** (routes 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 22) — the wx-navbar
>   catalog names a literal top-level `pathname` for each. `feature_location_rate` moves **48 → 68**.
> - **1 more row (63) promoted to ✅** via a live, unauthenticated MCP server discovered from the same
>   bundle pair — a direct observation, not a route-catalog entry, but equally load-bearing.
> - **Row 11 ("Communicate") is a genuine correction, not just an upgrade**: it was previously dispositioned
>   a **marketing over-claim** (no route/docs/flag found); a real, routed, named product now exists
>   (`/communicate/campaigns`, backed by `servicecommunicate`). See the correction note below the matrix.
> - `ia_nav_complete` stays **false**, but the reason is now narrower: the destination *catalog* is fully
>   known; only the per-tenant *promoted subset* remains unconfirmed (a runtime config, not a static gap).
> - `screenshot_coverage` and `features_walked` are **unchanged** — nothing here substitutes for a walk;
>   they need the same browser capability this whole document has been honest about lacking.
>
> ## ✅ Mode-5 iteration 3 update (2026-08-09) — the scorecard is RECOMPUTED, and it goes *down*
>
> This iteration was the coverage-gate recompute the two previous rounds deferred (proposal item **W7**),
> plus one bounded static mine (**W10**). Four changes, and the honest headline is that **the corrected
> nav-coverage term is much worse than what this document previously reported**:
>
> 1. **`ia_nav_complete`'s term was computed against the wrong denominator — twice.** This document
>    scored it `2 × (14 ÷ 14)` = **full credit**, while its own iteration-1 block had already established
>    that the real top-level nav is the `wx-navbar` **Frontline-OS catalog**. The Mode-5 proposal then
>    estimated `14 ÷ 19`. **Both are wrong.** Counted directly from `raw/wx-micro-frontends.md` §1b, the
>    catalog holds **21 rows = 20 distinct top-level products** (the two `I-9 Center` rows are one product
>    on two path generations). Of those 20, exactly **4** have a surface card in
>    `information-architecture.md`: **Hire** (the whole reassembled recruiter console), **Source**, **Cue**,
>    and **Pay** — and even Pay is generous, since the card is the console's `/payments` route while the
>    nav destination is `/pay`. ⇒ **`ia_nav_coverage: 4 ÷ 20 = 0.20`**, term = **0.40 / 2.00**.
>    *This is not a new failure — it is the accurate measure of the finding this document has led with all
>    along:* **Cartography mapped the interior of one of twenty top-level products.** Reporting 14/14 said
>    the opposite.
> 2. **One missing claimed feature added: row 66, "Hire Go / Fountain Go."** It is a genuine *claim*
>    (changelog: "Hire Go / Assist — Shared Dashboard, Unified login"; a first-class **status-page
>    component** since 2024-09-27) that the original claimed-feature catalog never rowed. It is **located**
>    (`/hire-go-redirect` D0 in the nav catalog, `go.fountain.com` in env config, and — new in iteration 2
>    — a **`/api/go/{v1,v2}` API family of ≥56 operations**). Numerator **and** denominator both +1, so
>    `feature_location_rate` stays **68** — the catalog got more honest without the score moving.
> 3. **`/api/go/*` is NOT added as a claimed feature.** It is an *undocumented, unmarketed* API family —
>    nobody claimed it. It belongs in **Unmarketed depth** (added below), and adding it to the matrix
>    would have inflated `features_claimed` with something the marketing never said.
> 4. **W10 executed, half-successfully.** `npm.fountain.*` (772 KB) was fetched and its source map
>    reassembled — **no new API paths, routes or flags** (a recorded negative), but it yielded
>    `@fountain/universal-search`: a shipped **⌘K command palette**, closing `information-architecture.md`
>    Open Question #5. The **lazy route chunks** (`Payments`, `WorkflowEditor`, `SourcingPurchaseNew`) were
>    re-checked and are **confirmed not statically addressable** — the live shell links exactly 48 chunks
>    and none is a route chunk. So *what `/payments` is* stays open as a **capability** gap, not an effort
>    one.
>
> `features_walked` and `screenshot_coverage` remain **0**. Nothing in this iteration touched them, and
> nothing static can.

**Legend for the matrix**

| Mark | Meaning |
| --- | --- |
| ✅ | **Located** — an in-product route is known (route + depth from `information-architecture.md`) |
| ⚠ | **Backend-located only** — the API family / flag / documented contract exists, but no route in any *mapped* client surface (almost always: it lives in the second, unmapped Worker-Experience application) |
| ❌ | **Not located** — no route, no API family, no flag. **Every ❌ row is dispositioned below.** |

**Sources:** `website: raw/products.md`, `raw/ai-agents-and-cue.md`, `raw/home-and-positioning.md`
(crawl-clip · medium) · `docs: raw/doc-map.md`, `raw/api-reference.md`, `raw/webhooks.md`,
`raw/integrations-partners.md` (docs-reconstructed · medium-high) · `community:
raw/changelog-digest.md` (crawl-clip · medium). **Located-against:** `deployed-client-bundle:
raw/route-table.md` + `_shared/api-path-catalog.md` + `_shared/feature-flags.md`
(source-map-reassembly · **high**). **(Mode-5 iteration 1 addendum:) also located-against**
`deployed-client-bundle: raw/wx-micro-frontends.md` (`bundle-string-mine · medium` for the nav/API
catalog; the MCP-server finding is a **direct live observation**, not a string-mine).

---

## Coverage matrix

### A — Marketed product modules

| # | Feature (claimed) | Source | Located? | Route · depth | Walked? | Edition-gated? | Conf. | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Fountain Hire** (ATS core) | website, docs | ✅ | `/applicants` D0? · `/openings` D0? · `/jobs/:jobId/v2/stages/:stageExternalId?` D1 | ❌ | no | high | The deepest, oldest surface; ~50 routes hang off it |
| 2 | **Fountain Source** (sourcing-spend mgmt) | website | ✅ | `/sourcing` D0? · `/sourcing_dashboard` D0? (demo-only) | ❌ | no | high | 52 app-own paths — the largest single family |
| 3 | **Fountain Reach** (Meta/Google programmatic) | website | ✅ | `/reach` D0 (Mode-5 iter.1: wx-navbar catalog) | ❌ | likely add-on | medium | Route now known (catalog, `enabled:false` default); **no Meta/Google endpoint family located in any lane** — the route names the product, not yet the mechanism |
| 4 | **Fountain Pool** (rehire CRM) | website, docs | ✅ | `/pool/talent` D0 (+Dashboard/Audiences/Campaigns/Jobs/Settings) (Mode-5 iter.1) | ❌ | flag-gated | medium | `servicepool` now confirmed **50 eps live** (up from 28 documented) — second application, route now known |
| 5 | **Fountain Onboard** (task flows) | website, docs | ✅ | `/onboard` D0 (+Dashboard/Workers/Flows and tasks/Document signing) (Mode-5 iter.1) | ❌ | module-licensed | medium | Second application, route now known; `servicetodo`'s *live* client scope was narrower than docs (i9Profiles-only — see raw/wx-micro-frontends.md §2e) |
| 6 | **Fountain Shift** (scheduling/attendance) | website, docs | ✅ | `/shift` D0 (+Dashboard/Schedule/Timesheets×2/Rules/Settings) (Mode-5 iter.1) | ❌ | module-licensed | medium | Route now known; docs' `serviceattendance` (81 eps) vs. the live `serviceworkforce` (57 eps) naming mismatch is unreconciled (open question) |
| 7 | **Fountain Compliance** (doc checks) | website, docs | ✅ | `/complianceV2/dashboard` D0 (+Workers/Requirements) (Mode-5 iter.1) | ❌ | module-licensed | medium | Route now known (label literally "Compliance"); best-documented flow, still not walked |
| 8 | **Fountain I-9 Center** (I-9/E-Verify) | website, docs | ✅ | `/onboard/i9` (v1) + `/employment/i9` (v2, newer path family) D0 (Mode-5 iter.1) | ❌ | module-licensed | medium | Two coexisting path generations, same pattern as approvals/workflows elsewhere in the product; candidate-portal side (`i9_forms`) still unmapped |
| 9 | **Fountain Referrals** | website, changelog | ✅ | `/referral` D0 (+Pipeline/Campaigns/Incentives/Settings) (Mode-5 iter.1) | ❌ | flag-gated | medium | Route now known |
| 10 | **Fountain Assist** (managed RPO service) | website | ✅ | `/assist` D0, no children (Mode-5 iter.1) | ❌ | service, not licence | medium | **Human-delivered service now WITH a real nav destination** — the "integrated into your dashboard" claim is a route, not just a `go.fountain.com` guess; distinct from `hire_go` (`/hire-go-redirect`), which is a separate catalog entry |
| 11 | **Communicate** ("right worker, right time") | website (enterprise-ats page only) | ✅ | `/communicate/campaigns` D0 (+SMS Usage) (Mode-5 iter.1) | ❌ | — | medium | **Correction, not a re-assertion:** a real, named, routed product WAS found (`servicecommunicate`, 3 eps) — the prior "marketing over-claim" disposition is REVERSED. See the correction note below the matrix |
| 12 | **Pulse** (sentiment analytics) | website, changelog | ✅ | `/pulse` D0 (+Dashboard/Checks/Settings) (Mode-5 iter.1) | ❌ | module-licensed | medium | Route now known; naming overlap with "Sam"/Talent Agents (row 16) still unresolved — they are confirmed as SEPARATE catalog entries, not the same feature |

### B — AI personas, Cue, and AI surfaces

| # | Feature (claimed) | Source | Located? | Route · depth | Walked? | Edition-gated? | Conf. | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 13 | **Cue** (orchestration copilot) | website (Apr 2026 launch) | ✅ | `<WxCueRootHost />` **global, outside the router** · `/fountain_ai` D0? · full panel set now known (`/cue`, `/cue/scheduled`, `/cue/setup-assistant`, `/cue/marketplace`) | ❌ | `cai_agent_enabled` + upsell route | high (existence + declared mechanism) | **(Mode-5 iter.1)** `wx-copilot.umd.js` fetched and mined — a **declared** LLM config (Claude Opus/Sonnet 4.6 via Bedrock, multi-provider schema defaulting to `openai`) and a live MCP tool server confirmed. *Which provider serves production is unobserved (re-graded it. 3).* See `raw/wx-micro-frontends.md` |
| 14 | **Anna** (AI recruiter / voice screening) | website | ✅ | `/ai_interviewers` D0? (**ungated in the route table**) | ❌ | — | high (existence) | Status page added an "AI Interviews" component 2026-07-06 (independent lane) |
| 15 | **Emma** (AI candidate support) | website (no dedicated page) | ✅ | `/chatbot` D0? (+ `/chatbot/upsell` D1) · widget endpoints | ❌ | 5 chatbot/AI booleans | high (existence) | Located surface is an **intent-classifier FAQ bot** admin, not an open agent |
| 16 | **Sam** (post-hire satisfaction agent) | website, changelog (25 Jun 2026) | ✅ | `/talent-agents` D0, `children:[]` — a scaffold, not yet populated (Mode-5 iter.1) | ❌ | new / configurable instances | medium | Nav item literally carries `searchKeywords:["sam","ai agent","agents"]` and `searchPathnameOverride:"/talent-agents/sam"` — **confirms "Sam" is the in-product name for "Talent Agents"**, currently disabled + unbuilt-out; Day 1/10/30/60 (site) vs Day 1/7/30 (changelog) divergence still unresolved |
| 17 | **"Fountain Copilot"** — the super agent orchestrating every layer | website (`/frontline-os`) | ❌ | — | ❌ | — | medium | **No distinct surface — strengthened (Mode-5 iter.1):** the nav catalog's `platformCopilot` key is literally labeled **"Cue"** (`pathname:"/platform-copilot"`) — direct code-level confirmation this is a naming alias, not a second orchestrator |
| 18 | **AI workflow builder** | website (`/agentic-ai`), bundle | ✅ | `/openings/:funnelSlug/ai_workflow_builder` **D3** | ❌ | `ai_workflow_builder_enabled` | high | ★ **The buried flagship** |
| 19 | **AI jobs directory / AI career site** | website, bundle | ✅ | `/ai_jobs_directory_career_site` D0? | ❌ | `fountain_ai_career_site_enabled` | high | |
| 20 | **Chat Apply** (web / SMS / WhatsApp) | website | ⚠ | — (`/internal_api/chatbot/widget/*` 9 paths) | ❌ | `get_more_text_to_apply_enabled` | medium | Candidate surface, routes unmapped |
| 21 | **Cue industry variants** (Retail / Logistics / Restaurants / Outsourced Services) | press release (Apr 2026) | ❌ | — | ❌ | — | low | No standalone marketing URL found; no route, no flag |
| 22 | **Scheduled Tasks in Cue** (recurring automated work) | changelog (23 Jul 2026) | ✅ | `/cue/scheduled`, `enabled:true` by default (Mode-5 iter.1) | ❌ | — | high | **CONFIRMED PRESENT** — full CRUD+lifecycle method set (`createScheduledTask`…`triggerScheduledTask`) found verbatim in `wx-copilot.umd.js`; closes re-walk-queue item 2 |
| 23 | **Cue identifies at-risk openings + action plans** | changelog (11 Jun 2026) | ✅ | `/sourcing` D0? → `/internal_api/sourcing/dashboard/openings_at_risk(_count)` | ❌ | — | high | A rare changelog claim with an exact matching endpoint |

### C — Hiring-workflow features

| # | Feature (claimed) | Source | Located? | Route · depth | Walked? | Edition-gated? | Conf. | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 24 | **Workflow customization per role / location** | website (`/hire`) | ✅ | `/openings/:funnelSlug/workflow/:stageSlug?` **D3** | ❌ | `workflow_editor_v2_enabled` | high | ★ Buried flagship; mid-rollout (v1 sibling `/workflows` D0? still ships) |
| 25 | **Logic jumps / conditional stages** | bundle, docs | ✅ | `/brands/:brandSlug/stages/:stageId/logic` **D3** (+ an alternate-origin twin) | ❌ | — | high | Two routes, one component — an IA smell |
| 26 | **Auto-screening** ("AI that handles questions and tasks") | website | ✅ | `/jobs/:jobExternalId/stages/:stageExternalId/workflow` **D3** (`DistributeApplicantsRuleStage`) | ❌ | — | medium | A *rule stage*, not a platform agent |
| 27 | **Self-service interview rescheduling** | website (`/hire`) | ⚠ | — (`/internal_api/portal/…/schedule_slots/{slot_id}/reschedulable`) | ❌ | — | medium | Candidate-portal capability; route unmapped |
| 28 | **Interview scheduling / calendar** | website, docs | ✅ | `/schedule` D0? · `/calendar/new` D2 · `/calendar/:id/edit` D2 | ❌ | `calendar_event_creation_enabled` | high | **Vendor-brokered (Cronofy)** |
| 29 | **Async / live video interview** | website, docs (schema), bundle | ⚠ | — (portal `…/video_recordings`; CameraTag vendor; flag `hire-go-enable-live-video-interview`) | ❌ | flag-gated | medium | `video_url_objects[]` is a first-class schema field |
| 30 | **Offer letters + templates** | bundle, docs | ✅ | `/offer_letter_templates` (settings) · `/offer_letter_templates/:templateId` D2 | ❌ | flag `offer-letter-templates` | high | |
| 31 | **Offer / opening approval rules** | bundle | ✅ | `/approval_rules` (settings) + legacy `/opening_approvals` | ❌ | `offer-approval-control` + `policies.manage_account` | high | **Two generations shipping side-by-side** (ticket AXHE-3945) |
| 32 | **Multi-channel candidate messaging** (SMS / WhatsApp / in-app) | website, bundle | ✅ | `/messenger` D0? (+2 nested) · `/whatsapp_message_templates` (settings) | ❌ | `whats_app_enabled`, `account_sms_enabled` | high | Dual SMS vendors (Twilio + Bird) |
| 33 | **Bulk applicant actions** | website, changelog (iterated ≥3×) | ✅ | within `/applicants` D0? (+ published `bulk-advance`) | ❌ | — | medium | Recurring changelog churn = ongoing UX friction |
| 34 | **Hiring goals** | website, docs, bundle | ⚠ | — (`/internal_api/hiring_goals`; flags `hiring-goals-v2/v4`, `hiring_goals_v3_enabled`) | ❌ | flag-gated | medium | No dedicated route; surfaced inside openings. **Three coexisting versions** |

### D — Onboarding, compliance, workforce

| # | Feature (claimed) | Source | Located? | Route · depth | Walked? | Edition-gated? | Conf. | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 35 | **Digital forms / document collection** | website (`/onboard`) | ⚠ | — (`/internal_api/portal/…/{application_forms,file_upload_requests}`) | ❌ | — | medium | |
| 36 | **E-signature** (HelloSign + DocuSign) | website, docs | ✅ | `/internal_api/workflow_editor/document_signing_settings` reached from the **D3** workflow editor | ❌ | flag `embedded-docusign` | high | Tagged-union vendor abstraction — deliberately swappable |
| 37 | **Background checks** (8 named vendors) | website, docs | ✅ | workflow-editor `stages/{id}/partner_integrations` **D3**; portal `…/background_checks` | ❌ | — | high | Entirely brokered (Checkr/Onfido tagged union) |
| 38 | **Document OCR + auto-approval + override** | docs (verbatim contract) | ⚠ | — (External Processing URL; `ai-documenttypes` classifier) | ❌ | per-document-type toggle | medium-high | **The single best-specified AI contract on the platform, with no located UI** |
| 39 | **E-Verify integration + status tracking** | website, docs | ⚠ | — (`everify` state machine on `Applicant`; E-Verify monitored on the status page) | ❌ | module-licensed | medium | |
| 40 | **Task tracking + automated reminders** | website (`/onboard`) | ⚠ | — (`servicetodo` assignedTasks; Universal Tasks webhooks) | ❌ | module-licensed | medium | Second application |
| 41 | **Audit logs / audit trails** | website, bundle | ✅ | `/openings/:funnelExternalId/activities` D2 | ❌ | flag `audit-trails-display` | high | Plus `copilotAuditLogs` for AI-made changes |
| 42 | **Multi-language / translation** | website, changelog | ✅ | `/translation_settings` (settings) · portal `…/funnels/{id}/translation` | ❌ | flag `custom-terminologies` | high | Touched 3× in six months |
| 43 | **Location-verified clock-ins** (geofenced time clock) | website (`/shift`) | ❌ | — | ❌ | module-licensed | low | **No clock-event or geofence endpoint located in any lane** — the most specific unlocated technical claim in the run |
| 44 | **Shift self-service pickup / drop** | website (`/shift`) | ⚠ | — (`serviceattendance` workerRequests / shift rules) | ❌ | module-licensed | medium | Second application |
| 45 | **Coverage-gap agent** ("identifies gaps and recommends fixes") | website (`/shift`) | ❌ | — | ❌ | module-licensed | low | No recommendation endpoint in `serviceattendance`'s documented resources |
| 46 | **LMS integrations** (Lessonly / Northpass / WorkRamp) | website, bundle | ✅ | workflow-editor `stages/learning_stages/{lessonly_content,northpass_courses}` **D3** | ❌ | flag `workramp-help-center-sso` | high | |

### E — Analytics, platform, admin

| # | Feature (claimed) | Source | Located? | Route · depth | Walked? | Edition-gated? | Conf. | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 47 | **Live dashboards / analytics** | website | ✅ | `/analytics_dashboard/:dashboardId?` D0? · `/analytics_dashboard_beta` D0? | ❌ | `looker_custom_reports_enabled` | high | **Embedded Looker**, not in-house |
| 48 | **Warehouse Connections** (data-warehouse export) | changelog (Mar 2026) | ⚠ | — (`/internal_api/openings/{id}/export`; published `(Timestamped)Exports`) | ❌ | — | medium | 3 analytics incidents in the 5 weeks after launch |
| 49 | **Role-based views / enterprise permissions** | website | ✅ | `/user_groups` (settings) · `/api_self_serve/v2/users/{id}/features` | ❌ | `policies.manage_user_groups` | high | |
| 50 | **Multi-brand / multi-EIN tenancy** | website, docs | ✅ | `/brands/:brandSlug/*` route family · `serviceorganizations` (60 eps) | ❌ | — | high | Genuine franchise/multi-employer support |
| 51 | **Unified login across Fountain** | changelog (Mar 2026) | ⚠ | — (implied by the two-login "Sign In" menu; `Auth_old` container still ships) | ❌ | — | medium | Implies users previously re-authenticated per product |
| 52 | **"50+ integrations out of the box. APIs for everything else."** | website (`/frontline-os`) | ⚠ | partial | ❌ | — | medium | **Docs contradict "out of the box":** HRIS sync is **DIY webhooks** with no certified connector, Slack is **Zapier-only** — over-claim flag |

### F — Developer / integration surface (a documented capability is a claim)

| # | Feature (claimed) | Source | Located? | Route · depth | Walked? | Edition-gated? | Conf. | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 53 | **Hire v2 public REST API** (108 eps) | docs | ✅ | `developer.fountain.com` (flat, single-section, 593 pages) | ❌ | **"Fountain Hire Package Required"** | high | 41 rows `openapi-verbatim` |
| 54 | **Fountain One microservice API** (12 services, ~467 eps) | docs | ✅ | same portal, `services.fountain.com` | ❌ | OAuth2 client-credentials | medium | **No documented rate limit at all** |
| 55 | **Partner `v1` API** | docs | ✅ | `partners.fountain.com` (own `llms.txt`, 14 pages) | ❌ | partner agreement | medium | A **third** API generation |
| 56 | **Webhooks** (4 independent mechanisms) | docs | ✅ | `/webhooks` (settings) + 3 other config points | ❌ | — | medium-high | Different retry/SLA per mechanism ⇒ **not one event bus** |
| 57 | **OAuth2 webhooks / OAuth configuration** | docs, bundle | ✅ | `/oauth_configuration` (settings) | ❌ | flag `oauth2-webhooks` | high | |
| 58 | **HRIS sync** (ADP / Workday / UKG named on product pages) | website, docs | ⚠ | — (docs: **DIY webhooks, no certified connector catalog**) | ❌ | — | medium | Feeds over-claim on #52 |
| 59 | **Slack integration** | docs | ⚠ | — (**Zapier-only**, per the docs page) | ❌ | — | medium | |
| 60 | **Embeddable worker portal / custom form embed** | docs | ⚠ | — (impersonation-URL generation in `servicesecurity`) | ❌ | — | medium-high | Portal routes unmapped |
| 61 | **Partner tasks** | docs, bundle | ✅ | workflow-editor `stages/{stage_external_id}/partner_integrations` **D3** | ❌ | flag `workflow-editor-partner-stage-preview` | high | |
| 62 | **Vector-similarity job matching** ("aggregate vector match") | docs | ⚠ | — (`GET …/talents/{id}/jobmatches`) | ❌ | Pool module | medium | **One of only two concretely-described ML mechanisms — and no client surface consumes it in any mapped lane** |
| 63 | **`exposeAsMcpTool` agent-callable API** | docs, api | ✅ | **`https://mcp.fountain.com/`** (Mode-5 iter. 2) — plus `https://data-mcp-production-us-east-1.fountain.com/mcp` (iter. 1, a host discoverable only from `wx-copilot.umd.js`'s config) | ❌ | — | high | **FULLY CLOSED by direct observation (it. 2).** Iteration 1 revised this row from "roadmap-not-shipped" to ✅ on the *data* server (`fountain-data-mcp v1.27.2`, 6 Cube.js/ClickHouse tools) but had to caveat that it was an internal analytics surface, not the Hire tool surface the docs' tag implies. **Iteration 2 found the Hire surface:** `fountain-hire-mcp-server v1.0.0` at `mcp.fountain.com` returns **127 tools to an unauthenticated `tools/list`, every one tagged `exposeAsMcpTool`** — the tag is traced end-to-end from docs → build pipeline → live server. Also reveals a previously-uncatalogued **`/api/go/{v1,v2}`** API family (56 tools). **No tool was invoked.** See `deployed-client-bundle: raw/wx-micro-frontends.md` §3 |
| 64 | **`.well-known/agent-skills` discovery manifest** | docs | ✅ | `developer.fountain.com/.well-known/agent-skills/index.json` (served, verbatim) | ❌ | — | high | A single "read the docs" pointer, not a tool catalog |
| 65 | **Bulk APIs** | docs FAQ | ❌ | — | ❌ | — | high | Fountain states plainly they are **"in the process of being built"** |
| 66 | **Hire Go / "Fountain Go"** (the paired Hire-Go + Assist surface — "Shared Dashboard, Unified login") | changelog, community (status page), bundle env | ✅ | `/hire-go-redirect` D0 (wx-navbar catalog) · `go.fountain.com` (`REACT_APP_HIRE_GO_BASE_URL`) · gate `go_enabled` | ❌ | tenant flag `go_enabled` | medium-high | **NEW ROW (Mode-5 iter. 3) — a claimed feature the original catalog missed.** It is claimed in **two** non-website lanes: the changelog pairs "Hire Go / Assist — Shared Dashboard, Unified login", and `status.fountain.com` has carried a first-class **"Hire Go / Assist"** component since **2024-09-27** (`community: raw/status-page-architecture.md` · crawl-clip · medium). Located in three: the nav destination, the env-config base URL (`deployed-client-bundle: raw/env-config.md` · source-map-reassembly · **high**), and — **new in iter. 2** — its own **`/api/go/{v1,v2}` API family, ≥56 operations** recovered from the live Hire MCP catalog. **Not walked**: `go.fountain.com` needs a renderer. Distinct from row 10 (`Assist`, `/assist`) — the nav catalog confirms two separate destinations |

---

## Located-but-not-walked — the re-walk queue

**All 45 located features are in this queue** (31 at Mode 4, +13 in iteration 1, +1 in iteration 3).
`features_walked: 0` — this run has still walked nothing, so the queue is the entire located set. The run
now knows *where* 45 capabilities live and has seen **none** of them render.

**However — the queue is still NOT actionable by the standard Mode-5 within-run re-walk.** The
self-correction loop's Cartography fix is "re-enter the live product (read-only nav) and walk the queue."
That requires the browser singleton, which **does not exist in this session**. Re-walking is therefore
**blocked by a capability gap, not by effort**, and Mode 5 must record it as such rather than iterating.

**What Mode 5 *can* do, in cost order (all read-only, no login, no browser) — items 1 and 2 are now DONE:**

| # | Action | Cost | What it closes | Status |
| --- | --- | --- | --- | --- |
| 1 | ~~`curl` `ftn-shared-components.fountain.com/wx-navbar/v3/release/stable/wx-navbar.umd.js`~~ | one GET | Converted 12 `D0?` route-shape guesses into confirmed catalog members; the full Frontline OS destination catalog is now known | **✅ DONE (Mode-5 iter.1)** |
| 2 | ~~`curl` `…/wx-copilot/v8/release/stable/wx-copilot.umd.js`~~ | one GET | The entire Cue client surface, Scheduled Tasks confirmation, LLM-backend confirmation, live MCP-server discovery | **✅ DONE (Mode-5 iter.1)** |
| 3 | Fetch the **unfetched lazy route chunks** (`Payments`, `SourcingPurchaseNew`, `WorkflowEditor`'s 525 files) | bounded | Resolves what `/payments` actually is; the workflow-editor sub-IA | **⛔ CONFIRMED BLOCKED (iter. 3)** — the live shell links exactly **48** chunks and **none** is a route chunk; route chunks carry webpack numeric-hash names emitted only at `Loadable()`-resolution time, so they are **not statically addressable**. Needs a renderer. Re-verified by grepping the live shell HTML for `payments`/`workfloweditor`/`sourcingpurchase`: zero hits |
| 4 | Reassemble **`npm.fountain.*`** (772 KB Fountain-internal package) | one GET + map | The one vendor chunk flagged as worth a follow-up | **✅ DONE (iter. 3)** — 233 sources reassembled. **No new API paths / routes / flags** (a recorded negative), but it yielded **`@fountain/universal-search`**: a shipped **⌘K / Ctrl-K command palette**, closing `information-architecture.md` OQ #5 |
| 5 | Fetch **one `service*` docs page raw** to check for an embedded OpenAPI fragment | one GET | Would lift 467 endpoints from `docs-reconstructed` to `openapi-verbatim` | **✅ DONE (iter. 2)** — 5 pages across 5 families; **5/5 carry a complete OpenAPI 3.0.3 fragment** (7 of 12 families now confirmed). Recorded as a **method ceiling** on `docs/_summary.md`, **not** a grade upgrade — only ~29 of 593 pages were actually fetched |
| 6 | **(New)** Fetch the `main.js` call site that builds the navbar's `featureFlags` mount config | bounded | Would answer which of the 20 top-level nav items are actually `enabled` for this tenant | open — **the single highest-value remaining no-browser action** |
| 7 | **(New, iter. 2)** Probe the remaining declared MCP hosts / a `/api/go/*` reference page | 1–2 GETs | Whether `/api/go/*` is undocumented-by-omission or documented on an unfound surface | open |

Items 6–7 could still raise `feature_location_rate` / `ia_nav_coverage` **without a browser and without a
login**. Item 3 **cannot** be done without a renderer. Screenshots and `features_walked` **cannot** be
raised by any of them — those need either the browser capability restored or a live session.

---

## Claimed-but-not-located — every row dispositioned

**Updated (Mode-5 iteration 1):** rows 10, 11, 22, and 63 moved from ❌ to ✅ (routes/a live server found
via `wx-navbar.umd.js`/`wx-copilot.umd.js`); rows 3, 4, 5, 6, 7, 8, 9, 12, 16 moved from ⚠ to ✅ (same
source). **Five rows remain ❌**, **sixteen rows remain ⚠**. None is left blank.

### The 5 remaining ❌ rows

| # | Feature | Disposition | Why · routes to |
| --- | --- | --- | --- |
| 17 | **"Fountain Copilot"** | **marketing over-claim (naming)** | Two top-level orchestrators are marketed (`Cue` on `/agentic-ai`, `Fountain Copilot` on `/frontline-os`) and exactly one exists in code. **Strengthened (Mode-5 iter.1):** the nav catalog's `platformCopilot` key is itself labeled "Cue" — direct code confirmation. → **over-claim/naming flag**; already recorded as an unresolved naming ambiguity by `website`. |
| 21 | **Cue industry variants** | **roadmap-not-shipped / press-only** | Present only in the April-2026 press release; the sitemap crawl found no `/cue-retail`-class URL and the client has no per-industry flag. **Corroborated (Mode-5 iter.1):** grepped both new bundles for retail/logistics/restaurant/hospitality — zero hits. → recorded gap. |
| 43 | **Location-verified clock-ins** | **edition/plan-gated → recorded gap** *(with an over-claim watch)* | `serviceattendance` (81 eps, docs) / `serviceworkforce` (57 eps, live — naming unreconciled) covers shifts, timesheets and clock events, but **no geofence/location-verification resource is documented or found live anywhere** (checked again in `wx-navbar.umd.js`/`wx-copilot.umd.js` this iteration — zero hits). The module has no console route. Most likely it exists in the unmapped Shift app; but as the most *specific* technical claim in the run with zero corroboration in any lane, it carries an over-claim watch. → recorded gap + watch. |
| 45 | **Coverage-gap agent** (Shift) | **edition/plan-gated → recorded gap** | Same module, same reasoning; re-checked this iteration, still zero hits for a recommendation endpoint. → recorded gap. |
| 65 | **Bulk APIs** | **roadmap-not-shipped** | Fountain states it first-party in its own FAQ. → recorded gap (and a real cost for large-dataset integrators). |

### The disposition CORRECTION — row 11, "Communicate" (Mode-5 iteration 1)

Row 11 was previously dispositioned a **marketing over-claim** ("no product page, no docs, no route, no
flag and no API family"). `wx-navbar.umd.js`'s destination catalog names a literal top-level nav entry
`communicate` → `/communicate/campaigns` (label "Communicate", children: Campaigns/SMS Usage), and
`wx-copilot.umd.js`'s generated API client confirms a matching backend family (`servicecommunicate`, 3
eps: `campaignTemplates`). **This reverses the over-claim finding** — Communicate is a real, named,
routed (if currently `enabled:false`) product, not an over-claim. The corresponding over-claim flag in
`evaluation/product-features.md` should be revisited by a future Evaluation pass (out of this
Cartography-only iteration's scope to edit that document directly).

### The 16 remaining ⚠ rows — one disposition covers 12 of them

**Disposition: deeper-than-looked — a second, unmapped application.** Rows 20, 27, 29, 35, 38, 39, 40,
44, 48, 51, 60, 62 all share one cause: **the recruiter console (`app.fountain.com`) is the *hiring*
application, and the *workforce* half of the platform — Shift, Onboard, Pulse, Compliance, the
candidate/worker portal — renders in a different client this run never located.** (Rows 4, 5, 6, 7, 8, 9,
12, 16 — previously in this same disposition group — are now ✅ located, per the Mode-5 iteration 1
update; the underlying "second application" finding they corroborated is unchanged, just promoted from
inferred to route-confirmed.) The evidence is triangulated and strong — now a **fourth** independent lane
on top of the three below: the MCP tool `execute_raw_sql`'s own docstring routes `"hire"` to
`FDEPLOY_RULES` and all WX products to `FDEPLOY_RULES_WX` (`raw/wx-micro-frontends.md` §2d):

- **197 documented endpoints** across `serviceattendance` (81), `servicetodo` (57), `servicepulse` (43)
  and `servicecompliancev2` (16) have **zero routes** in the 1,757-file reassembled console.
- The marketing site's own **Sign In menu offers two logins** — "Fountain Hire" and "Worker Experience
  Platform" (`website: raw/home-and-positioning.md · medium`).
- The console contains explicit **bridge** paths into that other world: `/internal_api/wx/*` (8 paths),
  `/internal_api/wx/pool/create_campaign_from_hire`.
- `wxp-01`…`wxp-15` + `wxp-staging` appear in certificate-transparency logs as a distinct 15-host
  environment fleet (`infra: raw/dns-and-subdomains.md · medium`).

This is **not** a coverage failure to apologize for — it is a *finding*: **"Frontline OS" ships as at
least two applications**, and locating the SECOND app's own hostname/route table (as opposed to its
front-door destination in the shared nav, now known) is the highest-value Cartography action available
to any future run. It cannot be fully done from static artifacts alone; it needs either a renderer or a
session.

**Row 3 ("Fountain Reach") is now ✅ located** (moved out of this individual-disposition list this
iteration — see the matrix update above); its underlying finding is unchanged (no Meta/Google campaign
*mechanism* located in any lane, only the *route*).

**The remaining 4 ⚠ rows disposition individually:**

| # | Feature | Disposition |
| --- | --- | --- |
| 34 | **Hiring goals** | **deeper-than-looked** — surfaced *inside* openings rather than at its own route; three flag generations (`hiring-goals-v2`, `hiring_goals_v3_enabled`, `hiring-goals-v4`) coexist. |
| 52 | **"50+ integrations out of the box"** | **marketing over-claim (partial)** — the docs' own HRIS page describes **DIY webhooks with no certified connector**, and Slack is **Zapier-only**. The 27-partner catalog is real; "out of the box" is the overstated part. → over-claim flag. |
| 58 | **HRIS sync** | same as 52 — the concrete instance of it. |
| 59 | **Slack integration** | same as 52 — Zapier-only is a materially weaker claim than "integration." |

---

## Buried flagships

Marketing-promoted capabilities that sit at **≥D2/D3** in the product (from
`information-architecture.md`'s promoted-vs-buried reconciliation):

| Marketed as (verbatim) | Lives at | Depth | Gate |
| --- | --- | --- | --- |
| "Cue orchestrates agents to run hiring, onboarding, and support workflows **end to end, without manual work**" | `/openings/:funnelSlug/ai_workflow_builder` — inside **one** opening | **D3** | `ai_workflow_builder_enabled` |
| "**Tailor every hiring workflow** to fit different roles, locations, and compliance needs" | `/openings/:funnelSlug/workflow/:stageSlug?` | **D3** | `workflow_editor_v2_enabled` (mid-rollout) |
| "Keep candidates moving with **AI that handles questions and tasks**" (auto-screening) | `/jobs/:jobExternalId/stages/:stageExternalId/workflow` (rule stage) | **D3** | — |
| "**Automatic** budget adjustments based on performance" | `/sourcing` → per-opening `budget_recommendation` → `accept_recommendation` | D1–D2 | — |
| "Increase applicant volume with fewer drop-offs" (offer/approval velocity) | offer templates + approval rules, split across **two coexisting generations** | settings + D2 | 2 flags + 1 RBAC policy |

> **The structural read:** Fountain's configuration power is genuinely deep, and it is uniformly reached
> **through an Opening**, one requisition and one feature flag at a time. The marketing sells
> platform-level autonomy; the product organizes that power per-requisition. Both halves are true, and
> the gap between them is the most useful positioning finding Cartography produced on this target.

---

## Unmarketed depth

Powerful surfaces the marketing never mentions (the inverse finding). These are **not** matrix rows —
they are claims the marketing never made.

| Surface / capability | Where | Why it matters |
| --- | --- | --- |
| **`/payments` + `/brands/:brandSlug/payments`** | D0? route pair | A **top-level money surface with zero marketing presence anywhere on the site**. Adjacent evidence (Branch = "applicant pay card" partner; an `iban/check_validity` portal path) suggests worker pay, not billing — unresolved. |
| **Hiring events + rosters** | `/internal_api/events` (8), `events_rosters` (2), `/schedule` | An entire event-based hiring modality (job fairs, open houses) — exactly the ICP's world, never sold. |
| **`/standard_attributes` concept mapping** | settings, flag `fountain-concept-mapping` | Fountain **building a unifier over its own four parallel custom-attribute systems** — the strongest evidence the fragmentation is real and known internally. |
| **Duplicate-applicant management, bulk location import, applicant-search settings** | 3 settings routes | Serious high-volume data-hygiene tooling for exactly the frontline use case. Unsold. |
| **Worker/employer impersonation-URL generation** | `servicesecurity` | The support/embedding primitive behind the embeddable worker portal. |
| **Vector-similarity job matching** | `GET …/talents/{id}/jobmatches` | One of **two** concretely-described ML mechanisms on the platform — and it is documented in a developer portal, not marketed, with **no located client consumer**. |
| **`exposeAsMcpTool` + `.well-known/agent-skills`** | build pipeline + a served manifest + (Mode-5 it. 1) **a live internal MCP server** | Agent-callable-API investment **shipped ahead of any *customer-facing* product**, entirely unhyped, by a company otherwise maximally loud about AI. Sharper after Mode-5 it. 1: MCP is not merely staged — `fountain-data-mcp v1.27.2` is live in production (Cube.js + ClickHouse), it is just pointed **inward** at Cue rather than out at integrators. The single sharpest contrast in the run. |
| **`copilotAuditLogs`** | `serviceorganizations` | A governance audit trail built specifically for AI-made changes. Nobody builds one for a relabeled rules engine — and nobody markets it either. |
| **(iter. 2) The `/api/go/{v1,v2}` "Hire Go" API family — ≥56 operations** | recovered from the live Hire MCP `tools/list`; **absent from all 575 documented endpoints AND all 766 app-own paths** | An entire published API generation — dashboards, applicants, funnels, users, recurring-availability schedules (UAS), calendars, WhatsApp templates, labor-union codes — that appears in **no documentation and no client bundle** this run mined. The *product* (Hire Go) is claimed (row 66); **its API surface is not**, and it is the largest single undocumented surface in the corpus |
| **(iter. 2) Four `service*` families that are products, not plumbing** — `servicesupport` (18 eps, `/support/tickets` + `/support/workflows`), `servicesegmentation` (3), `serviceintegrations` (26, ETL/SCIM), `serviceauthorization` (27, a full RBAC service) | client-mined only; named in no documentation | Seven `service*` families exist that the docs never name; **four of them back user-facing products with their own nav destinations** (Support, Segments, plus the Integrations and Segmentation back-ends). A support-ticketing product and a SCIM/ETL integration service are real capabilities Fountain sells nowhere on its site |
| **(iter. 3) `@fountain/universal-search` — a ⌘K command palette shipped as its own first-party package** | `npm.fountain.*` source map | A keyboard-triggered, two-section (nav + people) command palette with its own analytics event — modern-product-grade navigation chrome that appears in **no marketing copy and no docs page**. The inverse of the buried-flagship finding: real UX investment, zero positioning value extracted |

**And the anti-finding:** `/sourcing_dashboard` ships in the production client carrying the verbatim
comment **"only used for sales demo — not the actual dashboard customers use."** A maintained
sales-demo screen inside the shipped bundle is its own kind of coverage finding.

---

## Scorecard derivation (so Mode 5 can reproduce it)

| Field | Computation | Mode 4 (iter.0) | post iter.1 | **post iter.3 (current)** |
| --- | --- | --- | --- | --- |
| `features_claimed` | rows in the matrix (A 12 + B 11 + C 11 + D 12 + E 6 + F 14) | 65 | 65 | **66** (+ row 66, Hire Go — a changelog + status-page claim the original catalog missed) |
| `features_located` | ✅ rows only (route + depth known) | 31 | 44 | **45** (+12 wx-navbar catalog, +1 live MCP server, +1 Hire Go) |
| `feature_location_rate` | `100 × features_located ÷ features_claimed` | 48 | 68 | **68** (45 ÷ 66 = 68.2 — numerator *and* denominator each +1, so this is flat by construction, not padded) |
| `features_walked` | nothing walked — no browser tool, `auth:none` | 0 | 0 | **0** |
| `flow_coverage` | `100 × 8 diagrammed ÷ 9 identified` (realtime identified, not diagrammable) | 89 | 89 | **89** |
| `ia_surfaces_mapped` | surface cards in `information-architecture.md` | 31 | 31 | **31** |
| `ia_nav_complete` | every top-level nav destination has a surface card | false | false | **false** |
| **`ia_nav_coverage`** | **top-level nav destinations with ≥1 surface card ÷ all top-level nav destinations** — see the derivation immediately below | *(scored 14 ÷ 14 = 1.00 — wrong)* | *(1.00 carried forward; the Mode-5 proposal estimated 14 ÷ 19 = 0.74 — also wrong)* | **4 ÷ 20 = 0.20** |
| `screenshot_coverage` | `100 × 0 ÷ 16 primary surfaces` | 0 | 0 | **0** |

### `ia_nav_coverage` — the corrected derivation (defect C1, fixed iteration 3)

**Denominator — 20.** Counted directly from the `wx-navbar` destination catalog
(`deployed-client-bundle: raw/wx-micro-frontends.md` §1b): **21 catalog rows**, which reduce to **20
distinct top-level products** because the two `I-9 Center` rows (`/onboard/i9`, `/employment/i9`) are one
product on two path generations. *(A second "quick access" catalog — Analytics, Inbox, Notifications,
Jobs, Locations, Segments, Workers + a `platformCopilot` alias for Cue — is deliberately excluded: those
are utility entries, not products, and including them would only lower the ratio further.)*

**Numerator — 4.** Top-level destinations with at least one surface card in
`information-architecture.md`: **Hire** (`/hire-redirect` → the entire reassembled recruiter console, ~24
of the 31 cards), **Source** (`/source-redirect` → the 3 sourcing cards), **Cue** (`/cue` → the
Cue/ChatAgent card), and **Pay** (`/pay` → *generously* matched to the console's `/payments` card, which
is a different path family). The other 16 — Talent Agents, Home, Dashboard, Hire Go, Onboard, I-9 Center,
Compliance, Communicate, Pool, Pulse, Referrals, Shift, Assist, Support, Learn, Reach — have **route
knowledge but no surface card**, because they render in the second, unmapped Worker-Experience
application.

**Why this is the right number even though it looks punitive.** It is the numeric statement of this
document's own headline: *the recruiter console is the hiring application; the workforce half of
"Frontline OS" is a different client this run never saw.* Scoring `14 ÷ 14` asserted the IA was
nav-complete; it never was.

**Mode-5 axis 2, post-iteration-3:**
`8 × 0.68 + 6 × 0.89 + 4 × 0.00 + 2 × 0.20` = `5.44 + 5.34 + 0.00 + 0.40` ≈ **11.2 / 20**, with **no −2
penalties** (0 un-dispositioned claimed-but-not-located rows).

> **This supersedes the 13.8 figure this document previously reported *and* the 12.3 the Mode-5 proposal
> used.** All three iterations sit at **11.2** on the corrected basis — so the corpus's coverage did not
> regress; **the measurement did, toward the truth.** The two terms holding it down —
> `screenshot_coverage: 0` and `features_walked: 0` — are direct consequences of the missing browser
> capability plus `auth:none`, not of effort. If the browser capability is ever restored, the highest-value
> single action is the live walk of the 45-item re-walk queue, followed by confirming which of the 20 nav
> destinations are actually promoted for this tenant.
