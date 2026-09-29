# Fountain — Information Architecture

<!-- Cartography (Mode 4), artifact 1 of 3 · governed by .claude/rules/cartography-ia.md
     compiled 2026-08-09 · DEGRADED MODE: no live walk (see "How this IA was built") -->

> ## ⚠️ How this IA was built — read before using any depth number
>
> **Nothing in this document was walked.** The normal Mode-4 method (main session re-enters the live
> product via the browser singleton, clicks section to section, measures nav depth, screenshots each
> surface) was **not executable on this run for two independent reasons**:
>
> | # | Blocker | Nature |
> | --- | --- | --- |
> | 1 | **`auth:none`** — no authenticated session was ever established (`session: _summary.md · status: absent · write_side_observed: false`). The user was unreachable to authorize a login. | The standing constraint on this whole run. |
> | 2 | **No browser-driving tool exists in this session at all** — the Chrome MCP surface is absent, confirmed by tool search. | A **capability gap**, discovered at Mode 4. Distinct from (1): even a public, unauthenticated walk of `cue.fountain.com` or the career site was impossible. |
>
> Per `cartography.md`'s degraded-mode rule, Cartography therefore maps the **public surfaces plus the
> unauthenticated app shell** and records the authed-surface gap — it does **not** fabricate an IA it
> could not navigate. What makes this run unusual is the quality of the substitute: the
> `deployed-client-bundle` dimension performed a **full source-map reassembly** of
> `app.fountain.com` (1,962 files, 1,757 first-party), recovering the recruiter console's **entire React
> Router route table verbatim, with each route's exact feature-flag / RBAC gate**
> (`deployed-client-bundle: raw/route-table.md · source-map-reassembly · high`). So the authenticated
> IA below is **route-complete and gate-exact** — it is simply **not nav-observed**.
>
> **The precise thing this costs, stated once:** a route table gives you *what routes exist*; it does
> **not** give you *what the navigation chrome promotes*. On this target that gap is unusually sharp,
> because **the nav bar is itself a separately-deployed micro-frontend** (`wx-navbar` v3 UMD, served
> from `ftn-shared-components.fountain.com`, `deployed-client-bundle: raw/env-config.md · high`) that
> **this run did not fetch**. Consequently every **D0 assignment below is route-shape-derived, not
> nav-membership-observed**, and every card is tagged `located via source-map-reassembly · NOT
> live-walked`. Fetching `wx-navbar.umd.js` is an **unauthenticated static GET** — the single cheapest
> fix available to Mode 5, and it would convert most `D0?` marks into observed nav membership without
> any login at all.

---

> ## ✅ Mode-5 iteration 1 update (2026-08-09, same day) — `wx-navbar.umd.js` + `wx-copilot.umd.js` fetched
>
> The cheapest fix named above was executed. Both files are live, unauthenticated, fetched, and mined
> (`bundle: raw/wx-micro-frontends.md · bundle-string-mine · medium` — neither ships a source map, so this
> stays a string-mine, not a reassembly). **What this closes, precisely:**
>
> - **The full Frontline OS destination catalog is now known** — every top-level product (Cue, Talent
>   Agents/"Sam", Home, Hire, Hire Go, Source, Onboard, I-9 Center ×2, Compliance, Communicate, Pool,
>   Pulse, Referrals, Shift, Assist, Pay, Support, Learn, Reach) with its literal `pathname`, plus a
>   second "quick access" catalog (Analytics, Inbox, Notifications, Jobs, Locations, Segments, Workers).
>   Every `D0?` below can now be read against a **confirmed catalog member**, not a route-shape guess.
> - **What is still NOT known**: which of these is actually rendered/promoted for the `app.fountain.com`
>   tenant. The catalog ships with almost every item defaulting to `enabled:false` in this generic shared
>   release; the live per-tenant subset is selected at mount time from a `featureFlags` config object the
>   host app (`main.js`) builds and passes in — not statically visible in either UMD file. **So this is a
>   ceiling, not a walk**: `ia_nav_complete` in `feature-coverage.md` stays `false`, but for a
>   qualitatively better reason than before (unconfirmed *promotion*, not unconfirmed *existence*).
> - **The navbar's mount-time config is now known** (`{wxServiceBaseUrl, hireAccountBaseUrl, unifiedAuth,
>   featureFlags, ...}`) — this is the actual mechanism behind the "second application" finding: the host
>   app injects a `wxServiceBaseUrl` (the Worker Experience app's own base URL) into the shared navbar at
>   render time. The hostname itself remains unrecovered (it's a runtime value, not a literal).
> - **A global-search/command-palette catalog is confirmed present** (every nav item carries
>   `searchGroup`/`searchKeywords`/`searchIconKey` fields) — resolves Open Question #5 to "exists,
>   trigger-UI unconfirmed."
> - Full detail, including the Cue client surface, the live MCP-server discovery, and the LLM-backend
>   confirmation, is in `raw/wx-micro-frontends.md` (cited from `feature-coverage.md` and `ux-flows.md`
>   where relevant to those docs).

---

## TL;DR

Fountain is **not one application** — it is **at least five separately-deployed client surfaces** behind
one brand, and this run mapped exactly one of them exhaustively. The mapped one, `app.fountain.com`
(internal name `recruiter_ui`), is a single-page recruiter/admin console with **~50 authenticated routes
all nested under a `/:accountSlug` tenant catch-all** — roughly 16 top-level work surfaces, a
12-route settings family, and a deep `openings/funnels` sub-tree where the product's most-marketed
configuration power actually lives. **The organizing spine is the *Opening* (a.k.a. Funnel), not the
Applicant**: the workflow editor, the AI workflow builder, job descriptions, custom attributes, activity
logs and approval flow all hang off `/openings/:funnelSlug/*`, at D2–D3.

Two reconciliations dominate. **The buried flagship is Cue's own authoring surface**: "Cue orchestrates
agents to run hiring end to end" is the April-2026 homepage claim, but the AI workflow builder is at
`/openings/:funnelSlug/ai_workflow_builder` — **D3, reachable only from inside one specific opening**,
behind a per-tenant `ai_workflow_builder_enabled` gate. The copilot's *chat* surface, by contrast, is the
most promoted thing in the product: a micro-frontend mounted **once, outside the router**, that survives
every navigation. **The unmarketed depth is larger than the buried flagship**: a whole `/payments`
surface, a hiring-events/roster engine, duplicate-applicant management, bulk location import, a
standard-attribute concept-mapping layer, and worker/employer impersonation-URL generation appear nowhere
in any marketing copy.

And the largest IA finding is an **absence**: four of the nine marketed product modules — **Shift,
Onboard, Pulse, Compliance** — have **zero routes in the recruiter console** despite backing
services totalling 197 documented endpoints. They live in a second, unmapped Worker-Experience app. The
recruiter console is the *hiring* console; the *workforce* half of "Frontline OS" is a different
application this run never saw.

---

## The client-surface inventory (what "the product" actually is)

| # | Surface | Host / artifact | Mapped this run? | How |
| --- | --- | --- | --- | --- |
| 1 | **Recruiter/admin console** (`recruiter_ui`) | `app.fountain.com` | ✅ **route-complete** | source-map reassembly of `main.js` (`bundle: raw/route-table.md · high`) |
| 2 | **"Cue" AI-copilot micro-frontend** | `ftn-shared-components.fountain.com/wx-copilot/v8/…/wx-copilot.umd.js` | ✅ **client mined (Mode-5 iter. 1)** | fetched + string-mined unauthenticated (no source map); panel set, LLM backend, and a live MCP server confirmed — `bundle: raw/wx-micro-frontends.md · bundle-string-mine · medium` |
| 3 | **Nav-bar micro-frontend** | `…/wx-navbar/v3/…/wx-navbar.umd.js` | ✅ **catalog mined (Mode-5 iter. 1)** | fetched + string-mined unauthenticated; the full Frontline-OS destination catalog recovered — see the Mode-5 update block below. **Still not live-walked**: per-tenant `enabled` subset is injected at runtime and remains unconfirmed |
| 4 | **Worker Experience portal** (candidate / new-hire) | embeddable; `/internal_api/portal/*` (39 paths) | ⚠ **API-only** | endpoint family recovered; no client route table |
| 5 | **"Fountain Go"** (candidate/SMS app) | `go.fountain.com` (`REACT_APP_HIRE_GO_BASE_URL`) | ❌ **not probed** | named in env config only |
| 6 | **`cue.fountain.com`** | own subdomain | ❌ **JS-gated, unreadable** | `website` got a bare `<title>` via WebFetch; needed a browser |
| 7 | **Tenant career site / AI jobs directory** | tenant-hosted | ⚠ **config surface only** | `/internal_api/career_site/*` (9 paths) + the recruiter-side settings route |

**Surfaces 3, 5 and 6 are all reachable unauthenticated** — they are blocked by the *missing browser
tool*, not by `auth:none`. That distinction matters for Mode 5: (3) is a plain `curl`, (5) and (6) need a
renderer.

---

## Nav tree — the recruiter console (`app.fountain.com`)

Depth key per `cartography-ia.md`: **D0** top-level destination · **D1** list/index · **D2** detail or
editor · **D3+** sub-panel / nested tab. **Every `D0?` is route-shape-derived** (single path segment
under the tenant slug + a list/dashboard-class component), *not* confirmed nav membership — see the
banner. Gates are verbatim from the recovered `<Switch>`.

```
/landing                                             D0  [public]
/ccpa                                                D0  [public]  CCPA privacy-rights flow
/:accountSlug                                        —   tenant catch-all (auth-gated shell)
│
├── HIRING WORK SURFACES
│   ├── /applicants                                  D0? [promoted]  MasterApplicantsView
│   │   └── /applicants/:externalApplicantId/edit    D2  [buried]    EditApplicant
│   ├── /openings                                    D0? [promoted]  Openings
│   │   ├── /openings/:funnelSlug/description        D2  flag opening-job-description
│   │   ├── /openings/:funnelSlug/customer_attributes D2 flag opening-attributes-management (picks new|legacy component)
│   │   ├── /openings/:funnelExternalId/activities   D2  flag audit-trails-display
│   │   ├── /openings/:funnelSlug/workflow/:stageSlug? D3 whoami.workflow_editor_v2_enabled  ← WorkflowEditor v2
│   │   └── /openings/:funnelSlug/ai_workflow_builder D3 whoami.ai_workflow_builder_enabled  ← ★ BURIED FLAGSHIP (Cue)
│   ├── /jobs/:jobId/v2/stages/:stageExternalId?     D1  [promoted]  ApplicantsV2 — the stage board
│   │   └── /brands/:brandSlug/locations/:locationId/jobs/:jobId/v2/stages/:stageExternalId?  D2 (brand/location-scoped twin)
│   ├── /brands/:brandSlug/stages/:stageId/logic     D3  LogicJumps
│   ├── /:logicJumpOrigin/:stageId/logic             D3  LogicJumps (alternate origin)
│   ├── /jobs/:jobExternalId/stages/:stageExternalId/workflow  D3  DistributeApplicantsRuleStage
│   ├── /workflows                                   D0? WorkflowTable
│   └── /messenger                                   D0? [promoted]  Messenger 2.0
│       ├── /messenger/applicants/:applicantId?      D1
│       └── /messenger/location_groups/:locationGroupId/jobs/:jobId/applicants/:applicantId?  D2
│
├── SOURCING & SPEND
│   ├── /sourcing                                    D0? [promoted]  Sourcing
│   ├── /sourcing_dashboard                          D0? ⚠ DEMO-ONLY — source comment: "only used for
│   │                                                    sales demo — not the actual dashboard customers use"
│   ├── /jobs/:jobId/sourcing/new                    D2  SourcingPurchaseNew (Stripe SetupIntent)
│   └── /jobs/:jobId/post_to_indeed/new              D2  PostToIndeed
│
├── SCHEDULING
│   ├── /schedule                                    D0? Calendar
│   ├── /calendar/new                                D2  whoami.calendar_event_creation_enabled
│   └── /calendar/:eventExternalId/edit              D2  whoami.calendar_event_creation_enabled
│
├── AI SURFACES
│   ├── /fountain_ai                                 D0? whoami.cai_agent_enabled — ChatAgent
│   │   └── /fountain_ai/upsell                      D1  ChatAgentUpsell
│   ├── /chatbot                                     D0? any of chatbot_admin_enabled | fountain_ai_enabled |
│   │   │                                                fountain_ai_faq_enabled | chatbot_review_enabled |
│   │   │                                                chatbot_automated_response_enabled
│   │   └── /chatbot/upsell                          D1  whoami.fountain_ai_upsell_enabled
│   ├── /ai_interviewers                             D0? [promoted, UNGATED] AIInterviewersManagement
│   └── /ai_jobs_directory_career_site               D0? whoami.fountain_ai_career_site_enabled
│
├── MONEY & ANALYTICS
│   ├── /payments                                    D0? PaymentsWrapper  ← ★ UNMARKETED
│   ├── /brands/:brandSlug/payments                  D1  PaymentsWrapper (brand-scoped)
│   ├── /analytics_dashboard/:dashboardId?           D0? AnalyticsDashboard (embedded Looker)
│   └── /analytics_dashboard_beta                    D0? AnalyticsDashboardBeta
│
├── SETTINGS FAMILY  (all single-segment routes; almost certainly reached via a Settings menu ⇒
│   │                 recorded as D1-under-Settings **inferred**, not D0 — the nav would settle it)
│   ├── /approval_rules                 flag offer-approval-control + policies.manage_account  (AXHE-3945)
│   ├── /opening_approvals              whoami.opening_approval_enabled  ⚠ LEGACY, kept side-by-side during cutover
│   ├── /offer_letter_templates         flag offer-letter-templates
│   │   └── /offer_letter_templates/:templateId   D2 OfferLetterTemplateEditor
│   ├── /opening_details_settings       flag additional-opening-details
│   ├── /standard_attributes            flag fountain-concept-mapping        ← ★ UNMARKETED
│   ├── /duplicate_applicant_settings   —                                     ← ★ UNMARKETED
│   ├── /applicant_search_settings      whoami.applicant_search_settings_enabled
│   ├── /whatsapp_message_templates     whoami.whats_app_enabled
│   ├── /translation_settings           flag custom-terminologies
│   ├── /bulk_locations                 —                                     ← ★ UNMARKETED
│   ├── /user_groups                    policies.manage_user_groups
│   ├── /oauth_configuration            flag oauth2-webhooks
│   ├── /webhooks                       —
│   └── /:notifiableType/:notifiableId/notification_preferences   flag custom-user-notification
│
└── /*  (fallback)                                   LegacyDashboardHome
        source comment: "LEGACY route, DO NOT REMOVE — used only for Fountain Mobile App homepage
        (w/ Tasks) and Settings, only accessible by GlobalDrawer in mobile app"
        ⚠ contradicts distribution-artifacts' verified no-public-app finding — flagged conflict #8
        in evaluation/product-features.md, NOT resolved here.

GLOBAL (outside the router entirely — see "Global affordances")
    <WxCueRootHost />   the "Cue" copilot, mounted once in app.js, survives every route change,
                        toggled via a shared Zustand store inside the wx-system UMD bundle
                        (tickets HRAI-1928/1929)
```

**Route count reconciliation:** the `<Switch>` yields **~50 nested authenticated routes** + 3 top-level
(`/landing`, `/ccpa`, `/:accountSlug`). No route in this table has been shown to *render* — the lazy
`Loadable()` implementation chunks behind each route were deliberately not fetched
(`bundle: _summary.md` gaps).

---

## Surface cards

Every card carries the same provenance stamp, so it is never mistaken for a walked observation:
**`located via source-map-reassembly · NOT live-walked · screenshot: gap (no browser tool + auth:none)`**.
Entities link to `data-model-api-surface.md`; endpoints to `dimensions/_shared/api-path-catalog.md`.

### Applicants (master view) — `/applicants` · D0? · promoted
- **Capability:** read/search/filter the whole applicant book; bulk actions; column customization.
- **Entities:** `Applicant`, `Label`, `Stage`, `Transition`, `ApplicantSearchSetting`.
- **Endpoints:** `/api_self_serve/v2/applicants/{external_id}` + `…/email_conversations`, `…/follow_ups`, `…/transitions/completed_stages`, `…/telephony/initiate_call`; `/internal_api/applicants/*`.
- **Gate:** none (core surface). **Screenshot:** gap.

### Applicant editor — `/applicants/:externalApplicantId/edit` · D2 · buried
- **Capability:** edit a single applicant record (the schema with SSN/bank/passport/I-9/E-Verify secure fields).
- **Entities:** `Applicant` (secure-field allowlist), `i9`, `everify`, `background_checks[]`, `document_signatures[]`, `partner_data[]`.
- **Endpoints:** `/api_self_serve/v2/applicants/{external_id}`; offer-letter sub-surface at `/internal_api/applicants/{id}/offer_letter_form`.
- **Screenshot:** gap.

### Stage board (ApplicantsV2) — `/jobs/:jobId/v2/stages/:stageExternalId?` · D1 · promoted
- **Capability:** the core recruiter work surface — work applicants through a stage graph; advance/reject/bulk-advance.
- **Entities:** `Applicant`, `Stage`, `Funnel/Opening`, `Transition`, `RejectionReason`, `ArchivedReason`.
- **Endpoints:** `${GLOBAL_API_BASE_URL_V2}/jobs/{jobId}/stages` (the one hand-written call site in the entire client); `/internal_api/stages`, `/internal_api/stages/{id}`.
- **Note:** a brand+location-scoped twin route exists at D2 — multi-brand tenants reach the same board through a longer path.
- **Screenshot:** gap.

### Openings — `/openings` · D0? · promoted
- **Capability:** the requisition list; import/export; workflow reassignment; approvals entry point.
- **Entities:** `Opening`/`Funnel`, `Workflow`, `HiringGoal`, `OpeningApproval`, `CustomerAttribute`.
- **Endpoints:** `/api_self_serve/v2/openings*` (9 paths incl. `status_v2`, `owners`, `workflows`), `/internal_api/openings/{csvs,import,workflow_reassignment,{id}/activities,{id}/approvals,{id}/export}`.
- **Screenshot:** gap.

### Workflow editor v2 — `/openings/:funnelSlug/workflow/:stageSlug?` · **D3** · **buried**
- **Capability:** author the per-opening stage graph — stage types, rule stages, partner-integration stages, learning (LMS) stages, document-signing settings, clone stages.
- **Entities:** `Workflow` (stage graph), `Stage`, `StageType`, `RuleStageType`, `PartnerIntegration`.
- **Endpoints:** `/internal_api/workflow_editor/*` (28 paths).
- **Gate:** `whoami.workflow_editor_v2_enabled` — **a live migration, not a finished rollout**; `WorkflowTable` at `/workflows` is the flat sibling.
- **Positioning note:** "Tailor every hiring workflow to fit different roles, locations, and compliance needs" is a `/hire` homepage bullet; the editor is three levels down, inside one opening, behind a per-tenant flag.
- **Screenshot:** gap.

### AI workflow builder — `/openings/:funnelSlug/ai_workflow_builder` · **D3** · **buried flagship**
- **Capability:** chat with the agent; it drafts a workflow; the human tests and publishes it.
- **Entities:** `AIBuilder workflow chat`, `TaskFlow` draft/test copies, `CopilotAuditLog`.
- **Endpoints:** `/internal_api/ai_builder/workflow/chat`, `/internal_api/ai_builder/workflow/get_latest_message` — **a request/poll pair, not a stream**.
- **Gate:** `whoami.ai_workflow_builder_enabled`.
- **Positioning note:** this is the concrete in-product realization of the Cue launch claim. **It sits at D3 inside a single opening.** See "Promoted vs buried".
- **Screenshot:** gap.

### Logic jumps — `/brands/:brandSlug/stages/:stageId/logic` (+ `/:logicJumpOrigin/:stageId/logic`) · D3 · buried
- **Capability:** conditional branching between stages.
- **Endpoints:** `/internal_api/workflow_editor/rules_edit_data/{stage_external_id}`, `…/job_matcher_condition_options`.
- **Note:** **two** routes reach the same component from different origins — an IA smell (the same capability has two addresses).
- **Screenshot:** gap.

### Rule-stage / distribute applicants — `/jobs/:jobExternalId/stages/:stageExternalId/workflow` · D3 · buried
- **Capability:** the auto-screening / auto-distribution rule stage — the concrete surface behind the "auto-screening" marketing claim.
- **Endpoints:** `/internal_api/workflow_editor/funnels/{funnel_slug}/rule_stage_types`.
- **Screenshot:** gap.

### Messenger 2.0 — `/messenger` (+ 2 nested) · D0? · promoted
- **Capability:** multi-channel candidate messaging (in-app, SMS, WhatsApp); per-applicant and per-job-scoped threads.
- **Entities:** `SmsMessage`, `WhatsAppMessageTemplate`, `EmailConversation`.
- **Endpoints:** `/internal_api/message_template/default_whats_app_message_templates/*` (6), `/api_self_serve/v2/message_templates/deliver`, `…/applicants/{id}/email_conversations`.
- **Gates:** `whats_app_enabled`, `account_sms_enabled`, flags `message-applicant-from-any-channel`, `sms-length-limited`.
- **Screenshot:** gap.

### Sourcing — `/sourcing` · D0? · promoted
- **Capability:** channel analytics, spend aggregation, openings-at-risk, budget & sourcing recommendations, VONQ contract browsing.
- **Entities:** `SourcingPurchase`, `SourcingChannel`, `VonqContract`, budget/spend recommendation objects.
- **Endpoints:** `/internal_api/sourcing/*` — **52 paths**, the single largest app-own family.
- **Over-claim link:** the endpoints are `budget_recommendation` / `accept_recommendation` / `reject_recommendation` — **recommend-then-human-accept**, not the marketed "automatic budget adjustments" (see `product-features.md` over-claim #7).
- **Screenshot:** gap.

### Sourcing dashboard — `/sourcing_dashboard` · D0? · **demo-only**
- **Capability:** *none for customers.* Verbatim source comment: **"only used for sales demo — not the actual dashboard customers use."**
- **Finding:** a demo-specific screen maintained inside the production client. Recorded as a **dormant/non-customer surface**, not a product capability.
- **Screenshot:** gap.

### Job-ad purchase — `/jobs/:jobId/sourcing/new` · D2 · buried
- **Capability:** buy paid distribution for one job — Stripe **SetupIntent** (card-on-file), a coupon path, and an "invoiced" alternative.
- **Entities:** `SourcingPurchase`, `VonqContract`, `SourcingChannel`.
- **Endpoints:** `/internal_api/sourcing/sourcing_purchases/*`, `/internal_api/sourcing/vonq/contracts/*`, `/internal_api/job_boards/vonq*`.
- **Note:** this is the **only money-taking write surface in the recruiter console**. Fountain's own SaaS billing is a separate vendor (Chargebee).
- **Screenshot:** gap.

### Indeed campaign — `/jobs/:jobId/post_to_indeed/new` · D2 · buried
- **Endpoints:** `/internal_api/job_boards/{indeed_campaign, indeed_campaign_predictions/{funnel_external_id}, indeed_integration, indeed_integration/unlink}`.
- **Screenshot:** gap.

### Schedule / Calendar — `/schedule`, `/calendar/new`, `/calendar/:id/edit` · D0? + D2
- **Capability:** interview scheduling, availability rules, hiring-event creation.
- **Entities:** `Event`, `EventRoster`, `Calendar`, `AvailabilityRule`, `AvailableSlot`/`BookedSlot`/`Session`.
- **Endpoints:** `/internal_api/scheduler/*` (5, incl. `cronofy_information`), `/internal_api/events/*` (8), `/internal_api/events_rosters` (2).
- **Note:** scheduling is **vendor-brokered (Cronofy)**; the hiring-**events + rosters** engine is unmarketed.
- **Gate:** `whoami.calendar_event_creation_enabled` on the create/edit routes.
- **Screenshot:** gap.

### Cue / ChatAgent — `/fountain_ai` (+ `/fountain_ai/upsell`) · D0? · promoted
- **Capability:** the copilot's own full-page chat surface.
- **Endpoints:** `/internal_api/agent_integrations/agent/*` (11 — `create_rx_agent`, `create_rx_thread_and_signature`, `fetch_access_token`, `publish_chat_agent`, `conversation_report`, `wx_i9_bot_thread_signature`).
- **Gate:** `whoami.cai_agent_enabled`. The `/upsell` twin is the tell that this is a **paid add-on**.
- **Screenshot:** gap.

### Chatbot admin — `/chatbot` (+ `/chatbot/upsell`) · D0? · promoted
- **Capability:** administer the candidate-facing FAQ/support bot — intent models, automated responses, knowledge base, career-site scraping, chat logs, widget config.
- **Entities:** `ChatbotSettings`, `AutomatedResponse`, `AutomatedResponseModel`, `Intent`, `ChatbotLog`.
- **Endpoints:** `/internal_api/chatbot/*` — **29 paths**, incl. `automated_response_models`, `get_intents_with_bot_reply/{model_name}`, `chatbot_logs/intents`, `refresh_knowledge_base_status`.
- **Mechanism note:** this is the anatomy of an **intent-classifier bot with a scraped knowledge base** — corroborated independently by `euw3-ms-nlu.internal.fountain.com` (`infra · medium`). It is the in-product surface behind the "Emma" persona.
- **Gate:** any of five `chatbot_*` / `fountain_ai_*` booleans. **Screenshot:** gap.

### AI interviewers — `/ai_interviewers` · D0? · promoted, **ungated**
- **Capability:** configure AI interviewers — the in-product surface behind the "Anna" persona.
- **Corroboration:** `status.fountain.com` added an **"AI Interviews"** component on 2026-07-06 (`community · medium`) — an independent, non-marketing lane.
- **Unresolved:** the `Applicant` schema documents a `partner_data[]` example partner literally named **"AI Interview"** — whether this surface configures a first-party agent or a third-party vendor slot is **open**.
- **Screenshot:** gap.

### AI jobs directory / career site — `/ai_jobs_directory_career_site` · D0? 
- **Endpoints:** `/internal_api/career_site/*` (9).
- **Gates:** `fountain_ai_career_site_enabled`; flags `internal-career-site`, `career-site-interdependent-filters`, `career-site-translation`.
- **Screenshot:** gap.

### Payments — `/payments`, `/brands/:brandSlug/payments` · D0? · **UNMARKETED**
- **Capability:** unclear from the route table alone (the `PaymentsWrapper` implementation lives in an unfetched lazy chunk). Adjacent evidence: **Branch** (applicant pay card) is a named integration partner, and the candidate portal has an `iban/check_validity` path.
- **Finding:** a **top-level money surface with no marketing page anywhere** — the strongest single item of unmarketed depth in the run.
- **Open question:** worker pay / pay-card enrolment vs. employer billing. **Not resolvable without a walk or the lazy chunk.**
- **Screenshot:** gap.

### Analytics dashboards — `/analytics_dashboard/:dashboardId?`, `/analytics_dashboard_beta` · D0?
- **Capability:** embedded **Looker** BI (`whoami.looker_custom_reports_enabled`), plus a beta variant.
- **Reliability note:** three analytics incidents in a 5-week window shortly after "Warehouse Connections" launched (`community · medium`).
- **Screenshot:** gap.

### Workflows (flat table) — `/workflows` · D0?
- **Endpoints:** `/internal_api/workflows` (+ `import`, `{id}/export`), `/internal_api/workflow_editor/workflows/*`.
- **Note:** coexists with the D3 per-opening editor — two addresses for workflow management, one flat and one nested.
- **Screenshot:** gap.

### Approval rules — `/approval_rules` · settings-family · flag `offer-approval-control` + `policies.manage_account`
- **Entities:** `ApprovalRule`, `ApproverGroup`, `OpeningApproval`.
- **Endpoints:** `/internal_api/approvals/*` (4) **and** `/internal_api/opening_approval/*` (8) — **two generations of the same feature live simultaneously**; the legacy `/opening_approvals` route is kept side-by-side during cutover (source comment cites ticket **AXHE-3945**).
- **Screenshot:** gap.

### Offer letter templates — `/offer_letter_templates` (+ `/:templateId` D2) · settings-family · flag `offer-letter-templates`
- **Endpoints:** `/internal_api/workflow_editor/offer_letter_templates/*` (6 incl. `clone`, `preview`, per-field `conditions`), `/internal_api/offer_letters/{external_id}/{download,submit_for_approval}`.
- **Screenshot:** gap.

### User groups / RBAC — `/user_groups` · settings-family · `policies.manage_user_groups`
- **Endpoints:** `/internal_api/wx/users/*` (incl. `{user_id}/accessible_openings`), `/internal_api/users_pack/*`, `/api_self_serve/v2/users/{id}/features`.
- **Note:** `…/users/{id}/features` is the **entitlement read** — the client-side half of the 27 `whoami.*_enabled` gate model.
- **Screenshot:** gap.

### Webhooks — `/webhooks` · settings-family
- **Capability:** configure outbound webhooks (the recruiter-visible half of four separate webhook mechanisms documented in `docs: raw/webhooks.md`).
- **Endpoints:** `/internal_api/webhooks/notifications`; published side `POST /v2/webhook_settings` (14 event types).
- **Screenshot:** gap.

### OAuth2 configuration — `/oauth_configuration` · settings-family · flag `oauth2-webhooks`
- **Endpoints:** `/internal_api/oauth_2_configurations` (+ `show_latest`, `{id}`). **Screenshot:** gap.

### Attribute / taxonomy settings (a four-way cluster) · settings-family
`/standard_attributes` (flag `fountain-concept-mapping`) · `/opening_details_settings` (flag
`additional-opening-details`) · `/openings/:funnelSlug/customer_attributes` (D2, flag
`opening-attributes-management`) · `/translation_settings` (flag `custom-terminologies`).
- **Endpoints:** `/internal_api/customer_attributes/*` (9), `/internal_api/concepts`, `/internal_api/merge_keys/*` (3), `/internal_api/custom_terminologies/*` (3), `/internal_api/fountain/opening_attributes`.
- **Finding:** this cluster is the **client-side face of the quadruplicated custom-attribute model** named in `data-model-api-surface.md` — and `/standard_attributes` ("concept mapping") is Fountain **building the unifier**. Unmarketed. **Screenshot:** gap.

### Data-hygiene & bulk settings · settings-family · **UNMARKETED**
`/duplicate_applicant_settings` (DuplicateApplicantManagement; `/api_self_serve/v2/duplicate_applicant_settings` + `…/rejection_reasons`) · `/bulk_locations` (BulkLocations) · `/applicant_search_settings` (`whoami.applicant_search_settings_enabled`).
**Screenshot:** gap.

### Notification preferences — `/:notifiableType/:notifiableId/notification_preferences` · flag `custom-user-notification`
- **Endpoints:** `/internal_api/{notifiable_type}/{notifiable_id}/notification_preferences/*` (4). **Screenshot:** gap.

### WhatsApp message templates — `/whatsapp_message_templates` · `whoami.whats_app_enabled`
- **Endpoints:** `/internal_api/message_template/default_whats_app_message_templates/*` (6, incl. `whats_app_usage_stats`, `fetch_latest_status` — Meta template-approval state). **Screenshot:** gap.

### Legacy dashboard (fallback) — `/*` · dormant
- Component `LegacyDashboardHome`; comment says it serves "the Fountain Mobile App homepage (w/ Tasks) and Settings, only accessible by GlobalDrawer in mobile app."
- **Status:** an actively-preserved route for a client whose public existence `distribution-artifacts` disproved across 4 store/PWA surfaces. **Conflict, flagged not resolved.** **Screenshot:** gap.

---

## Promoted vs buried — the headline reconciliation

### Buried flagships (marketing-promoted, ≥D2/D3 in the product)

| Marketed as | Where it actually lives | Depth | Gate |
| --- | --- | --- | --- |
| **"Cue orchestrates agents to run hiring, onboarding and support workflows end to end"** (Apr 2026 launch) | `/openings/:funnelSlug/ai_workflow_builder` — inside **one** opening | **D3** | `ai_workflow_builder_enabled` (per-tenant) |
| **"Tailor every hiring workflow to fit different roles, locations, and compliance needs"** (`/hire`) | `/openings/:funnelSlug/workflow/:stageSlug?` | **D3** | `workflow_editor_v2_enabled` (mid-rollout) |
| **"AI that handles questions and tasks" / auto-screening** | `/jobs/:jobExternalId/stages/:stageExternalId/workflow` (rule stage) | **D3** | — |
| **"Automatic budget adjustments based on performance"** (`/source`) | `/sourcing` → per-opening `budget_recommendation` → `accept_recommendation` | D1–D2 | — (and it is *recommend*, not *automatic* — over-claim #7) |
| **Offer letters / approval control** | settings family, two coexisting generations | D1–D2 | 2 flags + an RBAC policy |

> **The pattern:** Fountain's *configuration power* — which is genuinely deep — is uniformly reached
> **through an Opening**, not from a top-level destination. The marketing promises platform-level agentic
> operation; the product organizes that power per-requisition, one flag at a time. That is not a
> contradiction, but it is a materially different operating model from the one sold.

### Unmarketed depth (built, never mentioned)

| Surface | Why it matters |
| --- | --- |
| **`/payments` + `/brands/:brandSlug/payments`** | a top-level money surface with **zero** marketing presence |
| **Hiring events + rosters** (`/internal_api/events`, `events_rosters`) | a whole event-based hiring modality (job fairs / open houses) never marketed |
| **`/standard_attributes` concept mapping** | Fountain building the unifier over its own four parallel attribute systems |
| **`/duplicate_applicant_settings`, `/bulk_locations`, `/applicant_search_settings`** | real high-volume data-hygiene tooling — exactly what the ICP needs, never sold |
| **Worker/employer impersonation-URL generation** (`servicesecurity`) | the support/embedding primitive behind the embeddable worker portal |
| **Vector job matching** (`GET …/talents/{id}/jobmatches`, "aggregate vector match") | one of only **two** concretely-described ML mechanisms on the platform — **and it has no located client surface at all** |
| **`exposeAsMcpTool` + `.well-known/agent-skills`** | agent-callable API investment shipped **ahead of any *customer-facing* product**. **TWO live MCP servers** (Mode-5 it. 1 + it. 2): `fountain-data-mcp v1.27.2` (Cube.js + ClickHouse, 6 tools — Cue's internal analytics surface) and **`fountain-hire-mcp-server v1.0.0` at `mcp.fountain.com`, returning 127 fully JSON-Schema'd tools to an unauthenticated `tools/list`, every one tagged `exposeAsMcpTool`** — including an entire undocumented `/api/go/{v1,v2}` family. Built, live, and **documented to integrators nowhere** |

### The demo-only surface (neither promoted nor buried — an anti-finding)

`/sourcing_dashboard` ships in the production client carrying **"only used for sales demo — not the
actual dashboard customers use."** A maintained sales-demo screen inside the shipped bundle is an IA
finding in its own right.

---

## Admin / settings depth

Twelve settings-family routes, each **single-segment** (so structurally D0-shaped) yet all
configuration surfaces — which is exactly why the missing nav bar matters: without `wx-navbar` we cannot
tell whether Fountain promotes these as top-level destinations or folds them behind a Settings menu.
**Recorded as D1-under-Settings (inferred).** Two structural observations survive that ambiguity:

1. **Gating is per-surface and granular.** Of ~50 routes, **26 carry an explicit gate** — 13
   LaunchDarkly-style flags, 11 `whoami.*_enabled` tenant booleans, 2 `policies.*` RBAC checks. The
   settings family is the most heavily gated cluster.
2. **Two generations coexist in three places** — approvals (`/approval_rules` vs `/opening_approvals`),
   workflow editing (`/workflows` vs the v2 per-opening editor), attributes (`NewCustomerAttributes` vs
   `CustomerAttributes`, selected by flag). The settings IA is **mid-migration in public**.

---

## Global affordances

- **The Cue copilot is the one true global affordance.** `<WxCueRootHost />` is mounted **once in
  `app.js`, outside the router**, and — per the verbatim source comment — "survives every route
  change… toggles via a shared Zustand store inside the wx-system UMD bundle" (tickets HRAI-1928/1929).
  Architecturally this is the most promoted thing in the product: present on every surface, deployed on
  its own cadence, independently version- and channel-pinned per tenant, with its own overridable
  LaunchDarkly client ID.
- **The nav bar is also a micro-frontend** (`wx-navbar` v3) — so the global navigation is not part of the
  app this run reassembled. **(Mode-5 iteration 1: fetched and mined** — see the update block above and
  `raw/wx-micro-frontends.md`; the destination catalog is now known, live per-tenant promotion is not.)
- **Command palette / global search / create-anywhere:** **(Mode-5 iteration 1) CONFIRMED PRESENT as a
  mechanism.** `wx-navbar.umd.js`'s full destination catalog carries `searchGroup`/`searchKeywords`/
  `searchIconKey`/`searchPathnameOverride` fields on every entry — a real, shipped global-search index
  spanning the whole Frontline OS product set (including a `searchPathnameOverride:"/talent-agents/sam"`
  entry, confirming "Sam" is the in-product name for the Talent Agents surface).
  **(Mode-5 iteration 3) The trigger UI is now CONFIRMED SHIPPED, from a second independent artifact.**
  Reassembling `npm.fountain.*`'s live source map recovered **`@fountain/universal-search`** — a
  first-party package exporting `UniversalSearch` / `UniversalSearchDialog` / `filterNavItems` whose root
  component installs a **global `keydown` listener firing on `(metaKey || ctrlKey) && key === "k"`** —
  i.e. a literal **⌘K / Ctrl-K command palette**, with a full injected stylesheet (`.fn-us-overlay`,
  `.fn-us-dialog`, `.fn-us-kbd-group`, `.fn-us-result-icon--nav` / `--person`, `.fn-us-enter-hint`) and a
  named analytics event `universal_search:bar_open`. It searches **two** result classes: **nav
  destinations** (fed by the navbar catalog through `filterNavItems`) and **people** (an injected async
  `searchPeople`). What still needs a walk is only whether the host app **mounts** it for a given tenant
  — a materially narrower gap than "does a palette exist at all"
  (`deployed-client-bundle: raw/bundle-map.md` §Mode-5 it. 3 · source-map-reassembly · **high**).
  `/applicant_search_settings` (a distinct, applicant-scoped search configuration surface) is unaffected
  by this finding.
- **Realtime presence:** `REACT_APP_PUSHER_APP_KEY` / `REACT_APP_PUSHER_CLUSTER` are wired into the
  client (`bundle: raw/env-config.md · high`), so a Pusher channel exists — but **zero frames, channels
  or events were observed** (no session). See `ux-flows.md` § Realtime.

---

## Cross-dimension reconciliation

### Nav-as-walked vs the bundle route table
**Not performable this run.** The normal diff (walked nav vs `route-table.md`) needs a walk; there was
none. What *is* performable, and was:

| Check | Result |
| --- | --- |
| Routes present in the bundle but with **no marketing claim** | 7 surfaces — see *Unmarketed depth*. |
| Routes present in the bundle but **explicitly non-customer** | 1 — `/sourcing_dashboard` (verbatim demo-only comment). |
| Routes present in the bundle for a **client that may not exist** | 1 — the `/*` `LegacyDashboardHome` mobile-app fallback (conflict #8). |
| Routes **superseded but retained** | 2 pairs — `/opening_approvals`↔`/approval_rules`, `/workflows`↔per-opening editor; plus the `Auth_old` container. |
| **Marketed modules with zero routes** | **4** — Shift, Onboard, Pulse, Compliance (below). |

### The four marketed modules with no recruiter-console route (the biggest IA finding)

| Module | Backing service (documented endpoints) | Routes in the mapped console |
| --- | --- | --- |
| **Fountain Shift** (scheduling/attendance) | `serviceattendance` — **81**, the largest single family | **0** |
| **Fountain Onboard** (task flows) | `servicetodo` — **57** | **0** (only the *candidate-side* `/internal_api/portal` paths) |
| **Pulse / Sam** (engagement surveys) | `servicepulse` — **43** | **0** |
| **Fountain Compliance** (doc OCR/requirements) | `servicecompliancev2` — **16** | **0** |

**197 documented endpoints with no client surface in the app this run mapped.** *(Updated Mode-5 it. 2:
reading (a) is now the answer, not the favourite.)* All four modules have **first-class D0 destinations
in the shipped `wx-navbar` product catalog** — `Shift` `/shift` (Dashboard/Schedule/Timesheets/Rules/
Settings), `Onboard` `/onboard` (Dashboard/Workers/Flows/Documents), `Pulse` `/pulse`
(Dashboard/Checks/Settings), `Compliance` `/complianceV2/dashboard`
(Dashboard/Workers/Requirements) — i.e. they live in the **second, Worker-Experience application**, whose
shared nav and copilot components this run mined but whose product SPAs it never walked. Reading (b)
(back-office/API-only) is **refuted**. So: **197 documented endpoints with no route in the *recruiter
console*, all four modules located at D0 in the WX application, none walked** (no browser). Either way,
**"Frontline OS" is
delivered as at least two distinct applications, and this run mapped the hiring one.** Recorded as the
primary re-walk target for Mode 5.

**Update (Mode-5 iteration 1):** reading (a) is now confirmed, not just favoured. `wx-navbar.umd.js`'s
destination catalog carries live top-level entries for exactly these four modules — `shift`
(`/shift`), `onboard` (`/onboard`), `pulse` (`/pulse`), `compliancev2` (`/complianceV2/dashboard`, labeled
"Compliance") — each with its own sub-nav, and the navbar's mount-time config confirms the mechanism (a
`wxServiceBaseUrl`-injected Worker Experience frontend). The MCP tool server found in the same pass
independently corroborates the split a third way: `execute_raw_sql`'s own docstring routes `"hire"` to
`FDEPLOY_RULES` and all WX products to a separate `FDEPLOY_RULES_WX` database. **Still unresolved:** the
hostname the WX frontend renders at, and whether any of these routes actually render (none walked).
Full detail: `raw/wx-micro-frontends.md`.

### RSC / server-rendered read check
Not applicable in the usual way — `recruiter_ui` is a **classic client-rendered CRA/webpack SPA**
(React + Redux + redux-saga + react-router v5), not Next.js/RSC, so the bundle's route table is a fair
inventory of the *client* surface. There is no server-rendered read path that would make the route count
overstate the client surface (`bundle: raw/bundle-map.md · high`).

### Docs IA vs product IA
`developer.fountain.com` is a **flat 593-page single-section index** (`## API Reference` only — guides,
webhooks, HRIS sync and FAQ are all folded into the same list as per-endpoint references)
(`docs: raw/doc-map.md · crawl-clip · medium-high`). Two consequences: the docs IA gives **no product
navigation signal** (it mirrors services, not screens), and a developer has **no task-oriented path**
through it — the only structure is the service prefix. Two sibling doc surfaces exist and are separately
navigated: `partners.fountain.com` (own `llms.txt`, `## Guides` + `## API Reference`, 14 pages) and the
Intercom-hosted `help.`/`support.fountain.com` worker help center (9 collections, client-rendered, **not
recovered** — it too needed a browser).

### Marketing IA vs product IA
The marketing nav (`Solutions ▸ Products | AI Agents | Cue`, `Use Cases ▸ By Industry | By Role`,
`Resources`, `Company`, `Sign In`) organizes by **persona and outcome**; the product organizes by
**Opening**. Three specific mismatches:

1. The marketing nav lists **5** products (Source, CRM, ATS, Onboarding, Shift & Scheduling); the site
   actually ships **9+** product pages (adding Reach, Assist, Compliance, I-9 Center, Referrals, plus
   named-but-page-less Communicate and Pulse) — **the marketing IA is out of date with its own site**.
2. The **Sign In** menu itself exposes the two-application split: two distinct logins, "Fountain Hire"
   and "Worker Experience Platform" (`website: raw/home-and-positioning.md · medium`) — independent
   corroboration of the missing-modules finding above.
3. **Cue has a dedicated marketing subdomain** (`cue.fountain.com`) and, in the product, no top-level
   destination of its own beyond `/fountain_ai` — its real presence is the always-mounted copilot host.

---

## Open questions

1. ~~**What does `wx-navbar` promote?**~~ **RESOLVED (Mode-5 iteration 1)** — the full destination catalog
   is now known (see the update block near the top of this document + `raw/wx-micro-frontends.md`).
   **Narrowed remainder:** which subset is `enabled` for this tenant — needs a session or the `main.js`
   config-building call site.
2. ~~**What is inside `wx-copilot.umd.js`?**~~ **RESOLVED (Mode-5 iteration 1)** — panels (New chat,
   Chats, Scheduled, Setup assistant, Skills & Connectors), the **declared** LLM config (Claude
   Opus/Sonnet 4.6 via Bedrock inside a multi-provider schema that defaults to `openai` — a declared
   configuration, not an observed inference call; re-graded it. 3), and a live MCP tool server are all
   confirmed. See `raw/wx-micro-frontends.md`.
3. **Where do Shift / Onboard / Pulse / Compliance actually render?** **Partially narrowed (Mode-5
   iteration 1):** their nav destinations are now known (`/shift`, `/onboard`, `/pulse`,
   `/complianceV2/dashboard`) and the mechanism is confirmed (a `wxServiceBaseUrl`-configured Worker
   Experience frontend, injected into the shared navbar at mount time) — but the **hostname itself**
   remains unrecovered, and none of these routes has been walked/rendered. Still the primary re-walk
   target, now much better characterized.
4. **What is `/payments`?** Worker pay-card enrolment (Branch) vs employer billing — unresolved.
5. ~~**Does a global search / command palette exist?**~~ **FULLY RESOLVED (it. 1 mechanism → it. 3
   trigger).** Iteration 1 found the *index* (`searchGroup`/`searchKeywords` on every navbar
   destination); **iteration 3 found the palette itself** — `@fountain/universal-search`, reassembled
   from `npm.fountain.*`'s source map, binds `⌘K`/`Ctrl-K` globally and renders a two-section
   (nav-destinations + people) dialog. **Residual:** whether the host app mounts it for a given tenant —
   a mount question, not an existence question. See Global affordances above.
6. **Is `/ai_interviewers` configuring a first-party agent or the `partner_data[]` "AI Interview" vendor slot?**
7. **What does `go.fountain.com` (Fountain Go) look like, and is it the "Assist"/interviewer surface** the changelog pairs it with ("Hire Go / Assist — Shared Dashboard, Unified login")? **Note (Mode-5 iteration 1):** the nav catalog confirms `hire_go` (`/hire-go-redirect`) and `assist` (`/assist`) as two DISTINCT top-level destinations, not one — narrows but does not close this question.
8. **Does the `/*` legacy mobile route correspond to a live client?** Conflict #8, unresolved by any lane.
9. **(New, Mode-5 iteration 1)** Which subset of the wx-navbar catalog is actually promoted for this
   tenant, and does the navbar itself render inside `app.fountain.com`'s own DOM (as Cue does, via
   `<WxCueRootHost/>`) or is it the top-bar chrome for a still-unseen unified shell? Not resolved by a
   static mine alone.
