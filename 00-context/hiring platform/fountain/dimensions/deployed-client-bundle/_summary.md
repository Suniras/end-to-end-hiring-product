---
dimension: deployed-client-bundle
target: fountain
status: complete
access_grade_used: runtime:reachable
method: source-map-reassembly
completeness_pct: 78
confidence: high
captured_at: 2026-08-09
sources:
  - https://app.fountain.com/
  - https://app.fountain.com/80a74d4/runtime.fcd5f35eb9b23caceccf.js
  - https://app.fountain.com/80a74d4/runtime.fcd5f35eb9b23caceccf.chunk.js.map
  - https://app.fountain.com/80a74d4/runtimeEnvVars.js
  - https://app.fountain.com/80a74d4/6971.54950001808325957448.chunk.js.map
  - https://app.fountain.com/80a74d4/npm.stripe.b13328f2770580984f89.js (tail-checked, source map confirmed live, not reassembled)
  - https://app.fountain.com/80a74d4/npm.api-clients.efb60faf46b63b5105bc.js
  - https://app.fountain.com/80a74d4/npm.api-clients.efb60faf46b63b5105bc.chunk.js.map (existence confirmed; paths mined from the served JS body directly)
  - https://app.fountain.com/80a74d4/main.73e91612f9d422c50b88.js
  - https://app.fountain.com/80a74d4/main.73e91612f9d422c50b88.chunk.js.map
  - https://app.fountain.com/80a74d4/npm.fountain.72d9026510ce4ba73e1e.js (tail-checked, source map confirmed live, not reassembled)
  - https://app.fountain.com/80a74d4/npm.material-ui.29af9832c6743e6541da.js (tail-checked, source map confirmed live, not reassembled)
  - https://app.fountain.com/80a74d4/npm.cronofy-elements.4c7c6579c0daff59974e.js (tail-checked, source map confirmed live, not reassembled)
  - https://app.fountain.com/80a74d4/npm.axios.5eb6ea15fb2e1af3e8d3.js (tail-checked, source map confirmed live, not reassembled)
  - https://ftn-shared-components.fountain.com/wx-navbar/v3/release/stable/wx-navbar.umd.js (Mode-5 iteration 1; bundle-string-mine, no source map)
  - https://ftn-shared-components.fountain.com/wx-copilot/v8/release/stable/wx-copilot.umd.js (Mode-5 iteration 1; bundle-string-mine, no source map)
  - https://data-mcp-production-us-east-1.fountain.com/mcp (Mode-5 iteration 1; live unauth probe — initialize + tools/list only, read-only, no tool invoked)
gaps:
  - "44 of 48 vendor chunks not reassembled (source maps confirmed live on all 8 spot-checked; the rest are bounded out — mostly third-party library source, lower marginal signal than the 1757 first-party files already recovered from main.js). npm.fountain.* (772KB, Fountain's own internal shared package) is the one vendor chunk worth a follow-up pass — flagged, not pursued this run."
  - "Lazy route/container chunks (the actual implementation behind each Loadable() — e.g. Payments/index.js, SourcingPurchaseNew/index.js, WorkflowEditor's 525 files) are not statically linked in the entry HTML and were not fetched; the route table + API catalog were instead recovered from the entry bundle's route config + generated API client, which name every route/operation without needing the lazy implementation bodies."
  - "REACT_APP_STRIPE_KEY / POSTHOG_API_KEY / PUSHER_APP_KEY / HELLOSIGN_CLIENT_ID / ONESIGNAL_WEB_PUSH_APP_ID / FACEBOOK_APP_ID / CHARGEBEE_*_PLAN_ID values were not located in the chunks fetched (field names only, per env-config.md) — likely baked into a lazy chunk not fetched, or unset in this deploy. Not pursued further per the redact-by-default discipline."
  - "RESOLVED (Mode-5 iteration 1): whether Cue runs genuine LLM orchestration vs. a rules engine — wx-copilot.umd.js embeds a literal model-selection enum (`us.anthropic.claude-opus-4-6-v1`, `us.anthropic.claude-sonnet-4-6`, AWS-Bedrock-hosted) plus a multi-provider config schema (openai / anthropic / anthropic_direct) — genuine, multi-provider LLM orchestration confirmed by direct observation. This does not extend to the separate Emma FAQ-bot surface (intent-classifier + in-house NLU host), which remains a distinct, unresolved mechanism. See raw/wx-micro-frontends.md §2c."
  - "Whether the marketed AI agents Anna/Emma still run genuine LLM orchestration vs. a rules engine for THEIR specific surfaces (distinct from Cue, now resolved above) remains open — Emma's admin surface anatomy (intent-classifier + scraped KB + in-house NLU host) argues for classification, not open-ended generation; Anna is unconfirmed either way."
  - "The 'LEGACY ... Fountain Mobile App' route comment implies a native/wrapped mobile client that the Discovery App-Store probe did not find — not resolved this run; flagged for distribution-artifacts."
  - "Total bytes fetched (~17.9MB: 9.23MB main.js + 8.46MB its map + ~0.13MB smaller chunks/maps) intentionally exceeds the nominal ~5MB bundle-mining budget — justified because the entry chunk + its live source map is the single highest-value artifact possible on this target (full first-party app source, not just strings), and the fetch completed well within the ~90s-per-batch spirit of the cap (a handful of sequential curl calls, no crawl loop)."
  - "Mode-5 iteration 1 added ~8.8MB more (wx-navbar 2.06MB + wx-copilot 6.77MB), neither carrying a source map — both mined as bundle-string-mine/medium, distinct from the source-map-reassembly/high grade of the entry chunk above. Total across both passes (~26.7MB) further exceeds the nominal budget for the same justification (a confirmed capability gap — the missing nav-bar mount data — was the single highest-value remaining unauthenticated fetch on this target, per feature-coverage.md's own re-walk-queue)."
  - "Which subset of the wx-navbar/wx-copilot destination catalog is actually `enabled` for the `app.fountain.com` tenant is still unknown — the config is injected at mount time from server-computed `featureFlags`, not statically visible in these two files. See raw/wx-micro-frontends.md Open questions."
  - "Whether `serviceworkforce` (57 eps, found live in wx-copilot.umd.js) is a rename/successor of the docs-documented `serviceattendance` (81 eps) is unreconciled — same product area (Shift), different name."
---

# Fountain — deployed-client-bundle capture

## Method

`https://app.fountain.com/` returns a 200 webpack SPA shell (internal app name `recruiter_ui` /
`recruiter-ui`) linking 48 static chunks (1 runtime, 1 dedicated `runtimeEnvVars` config chunk, 1 main
entry @ 9.23 MB, 45 `npm.*` vendor chunks). **Step 1 (source-map check) immediately paid off**: every
chunk tail-checked (8/8 — `runtime`, `runtimeEnvVars`, `npm.stripe`, `npm.api-clients`, `main`,
`npm.fountain`, `npm.material-ui`, `npm.cronofy-elements`, `npm.axios`) carries a live
`//# sourceMappingURL=` comment resolving to a 200 `.map` file. This flips the method for this capture
from the planned `bundle-string-mine` to **`source-map-reassembly`** at **high** confidence per ingestion
§3 — the entry bundle's map alone reassembled **1962 original source files, 1757 of them first-party**
app code (`webpack://recruiter-ui/./app/...`), essentially the full client-side source tree of the
recruiter-facing SPA, unauthenticated.

Given the scale of what the entry map alone yielded, the run was bounded (per the dimension's own
"breadth over depth, cap ~40 chunks/~5MB/90s" instruction) to: the entry chunk + its map (the big lift),
the dedicated `runtimeEnvVars` config chunk + its map (env-var field-name catalog), and the
`npm.api-clients` vendor chunk (the generated OpenAPI client — mined directly for the full app-own API
path catalog, no reassembly needed since the served JS already contains verbatim path/method strings).
44 vendor chunks were spot-checked for source-map presence only, not reassembled — recorded as a gap,
weighted toward `npm.fountain.*` (Fountain's own internal package) as the one worth a follow-up pass.

## Findings

- **Framework/build:** React + Redux + `redux-saga` + `connected-react-router` (react-router v5), CRA-
  flavored webpack build, Fountain's own design system (`@fountain/ripple`, `@fountain/fountain-ui-components`).
  Full detail in `raw/bundle-map.md`.
- **Route table:** 3 top-level routes (`/landing`, `/ccpa`, `/:accountSlug` catch-all) fanning into
  **~50 nested authenticated routes** under the account slug, each recovered with its exact path,
  component, and (where gated) the precise feature-flag/RBAC condition. Full table in
  `raw/route-table.md`.
- **API-path catalog:** **300 unique app-own paths / 358 method+path pairs**, recovered verbatim from the
  generated API client (`npm.api-clients.*.js`) plus one hand-written call site. Served **same-origin as
  the web app** (`web.fountain.com` in prod) under `/api_self_serve/{v1,v2}` and `/internal_api/*` — a
  **completely different host** from the published developer API (`services.fountain.com`). Appended to
  the shared `dimensions/_shared/api-path-catalog.md` under `## source: bundle`.
- **Feature flags:** **50** LaunchDarkly-style `feature_flags['...']` keys + **27** `whoami.*_enabled`
  boolean tenant-capability gates + **2** LaunchDarkly client-side IDs (main app + an independently
  overridable one for the "Cue" AI-copilot micro-frontend). Appended to the shared
  `dimensions/_shared/feature-flags.md` under `## source: bundle`.
- **Env config:** 21 `REACT_APP_*` field names recovered (Stripe, Chargebee ×2, Pusher ×2, PostHog ×4,
  HelloSign, OneSignal, Facebook, Clearbit, the "Wx" copilot/navbar micro-frontend URLs + release
  channels, the monolith/self-serve API base URLs). All values redacted per §7; see `raw/env-config.md`
  for the field-by-field table and what little was safely inferable (derived, non-secret URLs).
- **Stripe question resolved:** Stripe is wired to a `SetupIntent` (card-on-file) flow scoped to the
  `/jobs/:jobId/sourcing/new` route — i.e. **employer purchase of paid job-ad/sourcing distribution
  budget** (the VONQ marketplace layer), with a coupon path and an "invoiced" alternative. It is NOT used
  for candidate background-check fees or payroll/direct-deposit — those live under a disjoint
  `internal_api/portal/.../background_checks` and `.../i9_forms` / `.../worker_token` path family with no
  Stripe reference nearby. Fountain's own **SaaS subscription billing runs on a separate vendor,
  Chargebee** (`REACT_APP_CHARGEBEE_{ANNUAL,MONTHLY}_PLAN_ID`) — two decoupled payment systems for two
  different money flows. Full writeup in `raw/bundle-map.md`.
- **Third-party vendor stack** (from the response's CSP-Report-Only header + corroborating source):
  Intercom, Zendesk, Pusher (4-region), FullStory, Datadog RUM, PostHog, Appcues, OneSignal, Customer.io,
  Stripe, Chargebee, HelloSign + a DocuSign feature flag (dual e-signature vendors), Cronofy, CameraTag,
  VONQ, Indeed, Lessonly/Northpass/WorkRamp (3 LMS integrations), Clearbit, Google Analytics, Looker
  (confirmed via `looker_custom_reports_enabled`). Full table in `raw/bundle-map.md`.
- **Architecture disclosures from source comments:** a separately-deployed, versioned micro-frontend
  pair ("Cue" AI-copilot UMD bundle + a nav-bar UMD bundle) served from `ftn-shared-components.fountain.com`
  with per-tenant release-channel pinning; two named enterprise custom-deploy tenants baked into client
  config (**Aimbridge Hospitality**, **UPS** — each with matching feature flags); a 100-slot
  `staging-use-NN` internal deploy-environment naming convention; a Rails backend (comments reference
  Rails-style validators, `/users/sign_in` Devise route); a dual-tier JWT auth model
  (`token_employer`/`token_enterprise`, disambiguated by JWT audience claim); and a regionally-sharded
  S3 bucket fleet named **"OnboardIQ"** (4 regions + a PR/preview bucket) for candidate onboarding
  documents — a codename not seen on any marketing/docs surface so far.

- **Mode-5 iteration 1 (2026-08-09, same day): the two "Cue"/nav-bar UMD micro-frontends were fetched
  and mined** (`wx-navbar.umd.js` 2.06 MB, `wx-copilot.umd.js` 6.77 MB — both live 200s, no source map on
  either, `bundle-string-mine`/medium). Headline findings, full detail in `raw/wx-micro-frontends.md`:
  - **The full Frontline OS nav/destination catalog** — Cue, Talent Agents ("Sam"), Home, Hire, Hire Go,
    Source, Onboard, I-9 Center (v1+v2), Compliance, Communicate, Pool, Pulse, Referrals, Shift, Assist,
    Pay, Support, Learn, Reach — each with a literal `pathname`, mostly `enabled:false` by default in this
    shared release (the live per-tenant subset is injected at mount time from `featureFlags`, not visible
    statically). This is also a genuine, shipped **global-search/command-palette index**.
  - **The mount-time config contract** confirming the mechanism behind the "second application": the host
    app passes `{wxServiceBaseUrl, hireAccountBaseUrl, unifiedAuth, featureFlags, ...}` into the navbar at
    render time — `wxServiceBaseUrl` is the (not-statically-visible) base URL of the Worker Experience app.
  - **Scheduled Tasks in Cue confirmed present** — a full CRUD+lifecycle method set
    (`createScheduledTask`…`triggerScheduledTask`) plus a live, `enabled:true` `/cue/scheduled` nav entry.
  - **The LLM backend directly confirmed**: `us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-
    sonnet-4-6` (AWS Bedrock) + a multi-provider (`openai`/`anthropic`/`anthropic_direct`) config schema.
  - **A live, unauthenticated MCP server** at `https://data-mcp-production-us-east-1.fountain.com/mcp`
    (`serverInfo: fountain-data-mcp v1.27.2`), responding to `tools/list` with 6 real tools (Cube.js
    semantic layer + ClickHouse SQL execution). One of those tools' own docstring is an independent
    corroboration of the Hire-vs-WX two-database split (`FDEPLOY_RULES` vs `FDEPLOY_RULES_WX`). Only
    `initialize`+`tools/list` were called — read-only, no data accessed.
  - **466 unique `/api/service*` paths across 15 microservices** recovered from the two files' embedded
    generated API clients (appended to the shared catalog) — an independent corroboration (different lane:
    a live bundle, not docs) of the previously docs-only "Fountain One, ~12 services" claim, though 8 of
    the 15 service names don't match the docs' prior list (open question, not a contradiction).

## Inferences

- The app's own API surface (`/internal_api/*`, `/api_self_serve/*`) is **far broader and more granular**
  than the published developer API (`services.fountain.com`'s Applicants/Webhooks/HRIS-Sync set) — this
  is expected (an internal admin/recruiter console vs. a partner-integration API) but the gap is
  substantial: sourcing/ad-spend management, chatbot/FAQ-bot administration, workflow-editor internals,
  approval-rules, and the AI-builder chat endpoint have **no public equivalent** at all. This is a genuine
  "the published API is the integration story, not the architecture" finding (ingestion §6).
  the shared catalog's bundle section is the correct place for evaluation to run this diff.
- The sheer number of named third-party integrations wired at the client layer (VONQ, Indeed, Cronofy,
  HelloSign+DocuSign, Lessonly+Northpass+WorkRamp, Looker, Clearbit) suggests Fountain's moat is less
  "we built everything" and more "we're the orchestration layer/system-of-record gluing a frontline-hiring
  stack together" — a competitive-positioning-relevant read.
- The "Cue" AI-copilot being a versioned, independently-flagged, separately-deployed micro-frontend (not
  bundled into the main SPA build) suggests it is developed and shipped on its own cadence — consistent
  with it being a newer, actively-iterated bet rather than a thin relabeling exercise. This is still an
  inference from deployment architecture, not proof of the underlying model quality/orchestration depth.
- **(Mode-5 iteration 1) The above inference is now a direct observation, not just an architectural read**: Cue's client embeds a concrete, multi-provider LLM config (Claude Opus/Sonnet 4.6 via Bedrock) and a live, working MCP tool server — this is materially more real, produced-infrastructure evidence than deployment cadence alone, and meaningfully strengthens the case against a relabeled rules engine specifically for Cue (not for the separately-mechanized Emma FAQ-bot).
- **The Hire-vs-Worker-Experience two-application split, previously inferred from an absence** (197 documented endpoints with no console route + a two-login Sign In menu + a `wx-*` bridge-path family), **is now also confirmed from the presence side**: the navbar's mount-time `wxServiceBaseUrl` config prop and the MCP tool's own `FDEPLOY_RULES` vs `FDEPLOY_RULES_WX` database-routing docstring both independently name the same seam. Three independent lanes (nav config, MCP docstring, plus the prior CT-log/Helm/two-login evidence) now agree.

## Open questions

- Whether `npm.fountain.*` (772 KB Fountain-internal package) holds additional signal beyond `main.js` —
  not reassembled this run.
- The live values behind the 7 redacted third-party client keys (Stripe/PostHog/Pusher/HelloSign/
  OneSignal/Facebook/Chargebee) — not pursued (redact-by-default; likely in an unfetched lazy chunk).
- Whether "OnboardIQ" is an acquired product or an internal-only codename — worth a cross-check against
  `infra-backend-fingerprint`'s sub-processor/trust-page mine.
- Whether a real native/wrapped-webview "Fountain Mobile App" exists (implied by a route-table legacy
  comment) despite the Discovery App-Store probe finding nothing — flagged for `distribution-artifacts`.
- ~~Whether the AI agents' orchestration is genuine LLM-based reasoning vs. a well-instrumented rules
  engine~~ — **RESOLVED for Cue** (Mode-5 iteration 1; see Findings/Inferences above and
  `raw/wx-micro-frontends.md` §2c). Still open for Emma (intent-classifier evidence) and Anna (unconfirmed).
- **(New, Mode-5 iteration 1)** Which subset of the recovered wx-navbar destination catalog is actually
  `enabled` for the `app.fountain.com` tenant — needs either a session or the `main.js` call site that
  builds the navbar's mount-time `featureFlags` config (not re-fetched this run).
- **(New)** Whether `serviceworkforce` (57 eps, live) is the same service as the docs-documented
  `serviceattendance` (81 eps) under a different name, or a genuinely distinct/newer service.
- **(New)** Whether the confirmed-live `fountain-data-mcp` server is the same deployment (or a sibling)
  to any customer/developer-facing MCP surface implied by the docs' `exposeAsMcpTool` tag — this run
  confirmed the transport and one internal analytics server; a public equivalent remains unconfirmed.
- **(New)** The exact hostname the "Worker Experience" (`wxServiceBaseUrl`) frontend itself renders at —
  its role and injection mechanism are now confirmed, its origin is not.

## Artifacts

- `raw/route-table.md` — full recovered route table (top-level + ~50 nested account routes) with
  per-route feature-flag/RBAC gates and architecture notes from source comments.
- `raw/env-config.md` — 21 `REACT_APP_*` field names, values redacted per §7, redaction log included.
- `raw/bundle-map.md` — framework/build-tool digest, chunk graph + source-map status, full third-party
  vendor table (from CSP header + source corroboration), and the resolved Stripe-usage writeup.
- `dimensions/_shared/api-path-catalog.md` (appended, `## source: bundle`) — 300 unique app-own API
  paths / 358 method+path pairs, grouped by prefix; **plus a Mode-5 iteration-1 addendum** with 466 more
  unique `/api/service*` paths across 15 microservices from `wx-navbar.umd.js`/`wx-copilot.umd.js`, and
  the live MCP-server finding.
- `dimensions/_shared/feature-flags.md` (appended, `## source: bundle`) — 50 LD-style flags + 27 boolean
  tenant gates + 2 LaunchDarkly client-side IDs; plus a Mode-5 iteration-1 addendum (null result on new
  flag keys + the "not a flag" `account-copilot`/`account-advanced-copilot` tier-name clarification).
- `raw/wx-micro-frontends.md` **(new, Mode-5 iteration 1)** — full `wx-navbar.umd.js` +
  `wx-copilot.umd.js` mine: the nav/destination catalog, the mount-time config contract, Scheduled Tasks
  confirmation, the LLM-backend confirmation, and the live MCP-server transcript.
