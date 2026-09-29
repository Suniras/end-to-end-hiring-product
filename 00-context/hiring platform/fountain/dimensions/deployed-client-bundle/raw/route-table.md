<!-- source: https://app.fountain.com/80a74d4/main.73e91612f9d422c50b88.js + its live source map (main.73e91612f9d422c50b88.chunk.js.map) · captured_at: 2026-08-09 · method: source-map-reassembly -->

# Fountain — Route Table (recovered from a live production source map)

`app.fountain.com` ships **complete, unminified TypeScript/JSX source** via a live `sourceMappingURL`
on every chunk checked (8/8). The webpack internal app name is `recruiter_ui` (`self.webpackChunkrecruiter_ui`).
Reassembling `main.js`'s map recovered **1962 original source files**, of which **1757 are first-party
app code** under `webpack://recruiter-ui/./app/...` (the rest are `node_modules` library source, not
reproduced here). This is a near-total, unauthenticated disclosure of the recruiter-facing SPA's source.

## Top-level routes (`app/containers/App/index.js`)

| Path | Component | Notes |
| --- | --- | --- |
| `/landing` | `LandingPage` | public |
| `/ccpa` | `CCPA` | public — CCPA privacy-rights flow |
| `/:accountSlug` | `Account` (auth-gated) | catch-all; all authenticated app routes nest under the tenant account slug |

## Nested routes under `/:accountSlug/*` (`app/containers/Account/components/index.js`)

Recovered verbatim from the React Router `<Switch>` in the account shell. Each row also carries the
**gating condition** found in the same JSX (a `whoami.feature_flags['...']` LaunchDarkly-style flag, a
`whoami.*_enabled` boolean, or a `policies.*` RBAC check) — this doubles as a live feature-flag catalog
(see the shared `feature-flags.md` append for the full flag list).

| Route (relative to `/:accountSlug`) | Component | Gate |
| --- | --- | --- |
| `/applicants/:externalApplicantId/edit` | EditApplicant | — |
| `/applicants` (exact) | MasterApplicantsView | — |
| `/standard_attributes` | ConceptMappingTable | flag `fountain-concept-mapping` |
| `/jobs/:jobId/post_to_indeed/new` | PostToIndeed | Indeed campaign creation |
| `/jobs/:jobId/sourcing/new` | SourcingPurchaseNew | paid job-ad boost purchase (Stripe SetupIntent — see bundle-map.md) |
| `/sourcing` | Sourcing | global sourcing nav |
| `/sourcing_dashboard` | SourcingDashboard | comment: "only used for sales demo — not the actual dashboard customers use" |
| `/duplicate_applicant_settings` | DuplicateApplicantManagement | — |
| `/whatsapp_message_templates` | WhatsAppMessageTemplate | `whoami.whats_app_enabled` |
| `/applicant_search_settings` | ApplicantSearchSetting | `whoami.applicant_search_settings_enabled` |
| `/opening_approvals` | OpeningApproval | `whoami.opening_approval_enabled` (legacy) |
| `/approval_rules` | ApprovalRules | flag `offer-approval-control` + `policies.manage_account` — new approval-rules editor (comment cites ticket AXHE-3945; replaces `/opening_approvals`, kept side-by-side during cutover) |
| `/opening_details_settings` | OpeningDetailsSettings | flag `additional-opening-details` |
| `/offer_letter_templates` (exact) | OfferLetterTemplates | flag `offer-letter-templates` |
| `/offer_letter_templates/:templateId` (exact) | OfferLetterTemplateEditor | flag `offer-letter-templates` |
| `/oauth_configuration` | OAuth2Configuration | flag `oauth2-webhooks` |
| `/chatbot/upsell` | Chatbot Upsell | `whoami.fountain_ai_upsell_enabled` |
| `/chatbot` | Chatbot | any of `chatbot_admin_enabled`/`fountain_ai_enabled`/`fountain_ai_faq_enabled`/`chatbot_review_enabled`/`chatbot_automated_response_enabled` |
| `/openings` (exact) | Openings | — |
| `/bulk_locations` (exact) | BulkLocations | — |
| `/jobs/:jobId/v2/stages/:stageExternalId?` | ApplicantsV2 | — |
| `/analytics_dashboard/:dashboardId?` (exact) | AnalyticsDashboard | — |
| `/analytics_dashboard_beta` (exact) | AnalyticsDashboardBeta | — |
| `/brands/:brandSlug/stages/:stageId/logic` | LogicJumps | — |
| `/:logicJumpOrigin/:stageId/logic` | LogicJumps | — |
| `/brands/:brandSlug/locations/:locationId/jobs/:jobId/v2/stages/:stageExternalId?` | ApplicantsV2 | — |
| `/user_groups` | UserGroupsManagement | `policies.manage_user_groups` |
| `/ai_interviewers` | AIInterviewersManagement | — (AI interviewer config surface) |
| `/jobs/:jobExternalId/stages/:stageExternalId/workflow` | DistributeApplicantsRuleStage | — |
| `/brands/:brandSlug/payments` | PaymentsWrapper | — |
| `/payments` | PaymentsWrapper | — |
| `/messenger/location_groups/:locationGroupId/jobs/:jobId/applicants/:applicantId?` | Messenger | "Messenger 2.0" |
| `/messenger/applicants/:applicantId?` | Messenger | |
| `/messenger` | Messenger | |
| `/openings/:funnelSlug/workflow/:stageSlug?` | WorkflowEditor (v2) | `whoami.workflow_editor_v2_enabled` |
| `/workflows` | WorkflowTable | — |
| `/openings/:funnelSlug/customer_attributes` | NewCustomerAttributes or CustomerAttributes | flag `opening-attributes-management` picks new vs legacy component |
| `/openings/:funnelExternalId/activities` | OpeningActivities | flag `audit-trails-display` |
| `/openings/:funnelSlug/description` | EditOpeningJobDescription | flag `opening-job-description` |
| `/schedule` | Calendar | — |
| `/webhooks` | Webhooks | — |
| `/openings/:funnelSlug/ai_workflow_builder` | AIWorkflowBuilder | `whoami.ai_workflow_builder_enabled` |
| `/calendar/new` | CreateEvent | `whoami.calendar_event_creation_enabled` |
| `/calendar/:eventExternalId/edit` | EditEvent | `whoami.calendar_event_creation_enabled` |
| `/fountain_ai` | ChatAgent | `whoami.cai_agent_enabled` |
| `/fountain_ai/upsell` | ChatAgentUpsell | — |
| `/ai_jobs_directory_career_site` | AIJobsDirectoryCareerSite | `whoami.fountain_ai_career_site_enabled` |
| `/:notifiableType/:notifiableId/notification_preferences` | ManageNotificationPreference | flag `custom-user-notification` |
| `/translation_settings` | TranslationSettings | flag `custom-terminologies` |
| `*` (fallback) | LegacyDashboardHome | comment: "LEGACY route, DO NOT REMOVE — used only for Fountain Mobile App homepage (w/ Tasks) and Settings, only accessible by GlobalDrawer in mobile app" — **contradicts the Discovery hypothesis of "no native app"; see Open questions** |

## Architecture notes recovered from source comments

- **Micro-frontend AI copilot ("Cue").** `app.js` mounts a `<WxCueRootHost />` ONCE outside the router
  ("survives every route change... toggles via a shared Zustand store inside the wx-system UMD bundle",
  citing internal tickets HRAI-1928/1929). `runtimeEnvVars.js` confirms this is loaded from
  `https://ftn-shared-components.fountain.com/wx-copilot/v8/release/<channel>/wx-copilot.umd.js` and a
  sibling `wx-navbar` UMD bundle — both versioned (v8 / v3) and release-channel'd (`stable`/`main`,
  overridable per-tenant). This is a genuinely separate micro-frontend deploy pipeline from the main SPA.
- **Two named enterprise custom-deploy tenants baked into the client config:** `aimbridge` (Aimbridge
  Hospitality — has a dedicated Helm-provisioned "hire cluster", comment cites
  `apps/hire/helm/tenants/aimbridge-na/values.yaml`) and `ups` (UPS — "runs on shared infra"). Both
  corroborated independently by feature-flag names `aimbridge-hiring-goals-improvements` and
  `ups-functionality` (see feature-flags.md).
- **Multi-tenant subdomain model confirmed:** `app.<tenant>.fountain.com` → monolith origin
  `https://<tenant>.fountain.com`; prod tenant `fountain` → `https://web.fountain.com`. A
  `NONPROD_SUBDOMAIN_MAP` names internal environments: `faut-01`→uat, `uat-01`→uat, `dev-01`/`dev-02`/
  `faut-02`/`faut-03`→dev, and **100 numbered `staging-use-NN` slots** (`staging-use-01`..`staging-use-100`)
  auto-generated for a "standard Dropship domain" convention — an internal deploy-tooling name.
- **Rails backend confirmed** — `utils/axios.js` comments reference "Rails endpoints" and a
  `ReviewQuestionnaire::Validator` Ruby class; the sign-in path is `/users/sign_in` (Devise convention).
- **Auth token model** (`utils/wxJwtToken.js`): JWTs stored under `token_employer_<stage>` /
  `token_enterprise_<stage>` in BOTH localStorage and sessionStorage; the JWT `audience`/`aud` claim
  (`EnterpriseIdentity`, `SuperUser`) picks which key is used — i.e. two auth tiers (regular employer
  users vs. enterprise/super-admin) share one token shape, disambiguated client-side by claim.
- **A separate legacy `Auth_old` container** still exists (`containers/Auth_old/*`) alongside the current
  auth flow — a mid-migration auth system, per the naming.

## Cross-dimension reconciliation

- `services.fountain.com` (the published developer API, per `docs`/`api` dimensions) is a **completely
  different host** from what the app itself calls. The app's own API lives on the **same origin as the
  web app** (`web.fountain.com` in prod, i.e. `monolithOrigin`), under `/api_self_serve/v1|v2` and
  `/internal_api/*` — see the shared `api-path-catalog.md` append and
  `evaluation/data-model-api-surface.md`'s published-vs-app-own diff.
- The `/fountain_ai` route + `ai_builder` API paths + the `AIWorkflowBuilder`/`ChatAgent` containers
  substantiate that Fountain's AI features are backed by real dedicated frontend surfaces and API
  namespaces (`internal_api/ai_builder/workflow/chat`, `.../agent_integrations/agent/*`) — genuine
  product surface, not just marketing copy. Whether the underlying agent orchestration is LLM-based
  (vs. a rules-engine) remains unconfirmed from client-side evidence alone (open question).
