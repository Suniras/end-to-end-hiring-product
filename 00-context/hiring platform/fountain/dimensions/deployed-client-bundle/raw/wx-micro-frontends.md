<!-- source: https://ftn-shared-components.fountain.com/{wx-navbar/v3/release/stable/wx-navbar.umd.js, wx-copilot/v8/release/stable/wx-copilot.umd.js} + one live unauth probe of https://data-mcp-production-us-east-1.fountain.com/mcp (initialize + tools/list only) · captured_at: 2026-08-09 · method: bundle-string-mine (no source map on either UMD file; the live MCP probe is a direct runtime observation, not a string-mine) -->

# Fountain — `wx-navbar` + `wx-copilot` micro-frontends (Mode-5 iteration 1 follow-up)

Closes `information-architecture.md` Open Questions #1–#2 and `feature-coverage.md` re-walk-queue items
1–2. Both files were fetched unauthenticated per the original dimension's own recorded fix ("one
unauthenticated curl"). Both are live (200), fresh (`Last-Modified: 2026-08-08`, one day before this
capture), and **carry no `sourceMappingURL`** — checked via tail-grep on both files, zero hits — so this
capture stays `bundle-string-mine` / medium confidence for these two artifacts specifically (the main
`app.fountain.com` capture's `source-map-reassembly`/high does not extend to these two, separately-built,
separately-deployed files).

## 0. Build identity

- Both ship the classic **Rollup/Vite UMD banner** (`typeof exports=="object"&&typeof module<"u"?...`),
  not CRA/webpack's runtime — confirmed by the injected env-var naming convention
  (`ui.VITE_WX_SERVICE_BASE_URL`, `VITE_STAGE`, `VITE_EMPLOYER_BASE_PATH`, `VITE_EMPLOYER_BASE_URL`,
  `VITE_FOUNTAIN_AI_BASE_URL`) — a genuinely **different build tool** from the main `recruiter_ui`
  app's CRA/webpack, independent confirmation of a real polyglot micro-frontend architecture (not just
  a separately-versioned folder in the same build).
- Both bundles print `console.debug("<name> version","07942ec")` at load — **the same git short-hash**,
  confirming `wx-navbar` v3 and `wx-copilot` v8 are cut from one commit / one release train, matching the
  "sibling deploy" note already on file.
- Sizes: `wx-navbar.umd.js` 2,059,702 bytes (2.06 MB); `wx-copilot.umd.js` 6,770,826 bytes (6.77 MB).
- `wx-copilot.umd.js` self-locates its asset base from `document.currentScript.src` at load
  (`window.__WX_COPILOT_ASSET_BASE__`) — a relative-asset-loading pattern for whatever it lazy-loads next.
- **Redaction check:** pattern-scanned both files for every §7 secret shape (Stripe/OpenAI/Slack/AWS/
  GitHub/Google key prefixes, JWTs) — **zero hits**. No secrets found; nothing redacted.

## 1. `wx-navbar.umd.js` — the mount-time contract + the full Frontline OS destination catalog

### 1a. Mount-time config (the mechanism behind the "second application")

The host app calls `window.WxNavbarComponent.render(container, config)`. Reverse-engineered from the
`xbe(t)` config-setter, `config` accepts (at least): `wxServiceBaseUrl`, `stage`, `employerBasePath`,
`employerDomain`, `fountainAiBaseUrl`, `featureFlags`, `hireAccountBaseUrl`, `unifiedAuth`. This is the
single mechanism answer this run was missing:

- **`wxServiceBaseUrl`** is the base URL of the "Worker Experience" / "wx" services frontend — injected
  by the host app at mount time, not a static literal (dev fallback observed: `http://localhost:8990`).
  This is the strongest direct evidence yet that the previously-inferred **second application is real,
  has its own base URL, and is wired into the same shared nav component** `app.fountain.com` mounts —
  it is simply not statically discoverable by grep because it's passed as a runtime prop, not baked in.
- **`unifiedAuth`** (boolean) is a literal config flag on the navbar — independent, code-level
  corroboration of the changelog's "Unified login across Fountain" claim (`feature-coverage.md` row 51).
- **`featureFlags`** is passed IN (not independently evaluated by the navbar via its own LaunchDarkly
  SDK) — i.e. the host app computes flags once (from `whoami`) and hands the navbar a pre-resolved map.

### 1b. The full nav/product catalog (function `Mye(t)`, the main array)

This is the **complete Frontline OS destination catalog** shipped in this navbar release — every
top-level product + its children, each with a literal `pathname` and a static default `enabled` value.
**Read this as a catalog/ceiling, not a live-rendered nav** — the overwhelming majority default to
`enabled:!1` (false) in this generic, shared release; the *actually-visible* subset for any one tenant is
selected at mount time from the `featureFlags` config above (§1a), which this run did not capture (no
session). What follows is nonetheless a categorical upgrade over Discovery's route-shape guesses: every
`D0?` in `information-architecture.md` is now either a confirmed catalog member or resolved against one.

| Key | Label | Pathname | Default enabled | Children |
| --- | --- | --- | --- | --- |
| `cue` | Cue | `/cue` | false (container) | New chat ✅true `/cue` · Chats ✅true (dynamic) · Scheduled ✅true `/cue/scheduled` · Setup assistant ✅true `/cue/setup-assistant` · Skills & Connectors ❌false `/cue/marketplace` |
| `talentAgents` | Talent Agents | `/talent-agents` | false | none (`children:[]` — scaffolded, not populated); searchKeywords `["sam","ai agent","agents"]`, `searchPathnameOverride:"/talent-agents/sam"` — **this is "Sam"** |
| `home` | Home | `/home` | **true** | — |
| `dashboard` | Dashboard | `/dashboard` | false | — |
| `hire` | Hire | `/hire-redirect` | false | — (redirect stub into the legacy recruiter console) |
| `hire_go` | Hire Go | `/hire-go-redirect` | false | — (redirect stub — this is "Fountain Go" / the Assist pairing) |
| `source` | Source | `/source-redirect` | false | Dashboard · Openings · Settings (all unrouted placeholders — redirect stub) |
| `onboard` | Onboard | `/onboard` | false | Dashboard `/onboard/dashboard` · Workers `/onboard/workers` · Flows and tasks `/onboard/flows` · Document signing `/onboard/documents` |
| `i9` | I-9 Center | `/onboard/i9` | false | I-9 Forms · W-4 Forms `/onboard/w4` · Employees `/onboard/employees` · Calendar `/calendar` · Reports `/onboard/reports` · Settings `/settings/i9` · Internal Controls `/onboard/internal-controls` |
| `i9_v2` | I-9 Center | `/employment/i9` | false | same children, `/employment/*` paths — **a v1/v2 path-family pair, same pattern as `/opening_approvals`↔`/approval_rules`** |
| `compliancev2` | Compliance | `/complianceV2/dashboard` | false | Dashboard · Workers `/complianceV2/workers` · Requirements `/complianceV2/requirements` |
| `communicate` | Communicate | `/communicate/campaigns` | false | Campaigns · SMS Usage `/communicate/sms-usage` |
| `pool` | Pool | `/pool/talent` | false | Dashboard `/pool/dashboard` · Talent `/pool/talent` · Audiences `/pool/audiences` · Campaigns `/pool/campaigns` · Jobs `/pool/jobs` · Settings `/pool/settings` |
| `pulse` | Pulse | `/pulse` | false | Dashboard `/pulse/dashboard` · Checks `/pulse/checks` · Settings `/pulse/settings` |
| `referral` | Referrals | `/referral` | false | Pipeline · Campaigns · Incentives · Settings |
| `shift` | Shift | `/shift` | false | Dashboard(overview) `/shift/overview` · Schedule `/shift/schedule` · Timesheets `/shift/timesheets` (+ `timesheetsV2` sibling `/shift/timesheetsv2`) · Rules `/shift/rules` · Settings `/shift/settings` |
| `assist` | Assist | `/assist` | false | none |
| `pay` | Pay | `/pay` | false | none |
| `support` | Support | `/support` | false | Tickets `/support/tickets` · Workflows `/support/workflows` |
| `learn` | Learn | `/learn` | false | none |
| `reach` | Reach | `/reach` | false | none |

A second, smaller "core"/quick-access catalog (`Nye(t)`/`jye(t)`, two near-duplicate variants) supplies:
`platformCopilot` (label **"Cue"**, `pathname:"/platform-copilot"` — an internal alias for Cue, direct
corroboration that `feature-coverage.md` row 17's "Fountain Copilot" is a **naming alias, not a distinct
product** — no code anywhere names a second orchestrator), `omniAnalytics` (Analytics, `/analytics_beta`),
`inbox` (Applicants Inbox `/hire-inbox-redirect` + Workers Inbox `/inbox`), `notifications`
(**enabled:true**), `jobs` `/jobs`, `locations` `/locations`, `segments` `/settings/segments`,
`applicants` `/hire-applicants-redirect`, `workers` `/workers`.

### 1c. This IS a global-search / command-palette index

Every item above carries `searchGroup` (`"Core"`/`"Products"`), `searchIconKey`, and (on many)
`searchKeywords` / `searchPathnameOverride` fields. This is a real, shipped **global-search / command-
palette catalog** — it answers `information-architecture.md` Open Question #5 ("Does a global search /
command palette exist?") with **yes, the mechanism is real and shipped**; whether it is currently
surfaced (a `⌘K`-style trigger) for the `app.fountain.com` tenant was not observed this run (still needs
a walk to confirm the trigger UI itself).

### 1d. The navbar embeds its own generated API client (four services, 280 paths)

Independent of the nav catalog, `wx-navbar.umd.js` ships a full generated OpenAPI client for
`serviceauthorization` (19), `serviceorganizations` (121), `servicesecurity` (113), `servicesupport` (18)
— 280 unique `/api/*` paths (271 after dedup with copilot's overlapping set — see the shared catalog
append). Corroborating UI strings confirm what these power: `"Choose a company"`, `"Enterprise
Companies"`, `"Enterprise settings"`, `"Super User Access"`, `"Viewing as {workerName}"` — i.e. the
navbar itself renders the **company-switcher / enterprise super-user chrome**, not just links.

### 1e. Third independent corroboration of the two named enterprise tenants

A per-tenant `dataMcpBaseUrl` override map (see §2d below) includes explicit `aimb` (Aimbridge
Hospitality) and `ups` (UPS) keys — a **third**, wholly independent confirmation of these two named
custom-deploy tenants (after the `apps/hire/helm/tenants/aimbridge-na` source comment and the
`aimbridge-hiring-goals-improvements`/`ups-functionality` feature flags already on file).

---

## 2. `wx-copilot.umd.js` — the Cue client surface

### 2a. Panels (cross-referenced against the navbar's `cue` children, §1b)

New chat (`/cue`) · Chats/history (dynamic route helpers) · **Scheduled** (`/cue/scheduled`, confirmed
live — see §2b) · Setup assistant (`/cue/setup-assistant`) · Skills & Connectors / "marketplace"
(`/cue/marketplace`, currently `enabled:false`) — this last one is a genuine **agent-skill builder +
test playground**, evidenced by UI strings `"Create a skill"`, `"Help me create a skill"`, `"Invoke a
skill"`, `"Ask anything or type '/' to invoke a skill…"`, `"Copy playground URL"`, `"Pop out panel"`.

### 2b. Scheduled Tasks in Cue — CONFIRMED PRESENT (closes feature-coverage row 22)

Full CRUD + lifecycle method surface found verbatim in the bundle: `createScheduledTask`,
`deleteScheduledTask`/`deleteScheduledTasks`, `getScheduledTask`, `getScheduledTaskRun`,
`listScheduledTaskTemplates`, `listScheduledTasks`, `pauseScheduledTask`/`pauseScheduledTasks`,
`proposeScheduledTasks`/`proposeScheduledTasksUpdate` (an AI-drafted-then-human-reviewed pattern, same
shape as the workflow-builder's draft→test→publish loop), `resumeScheduledTask`/`resumeScheduledTasks`,
`triggerScheduledTask`, `updateScheduledTask`, `useScheduledTaskTools`. Paired with the navbar's live,
`enabled:true` `/cue/scheduled` nav entry (label "Scheduled", `searchKeywords:["scheduled tasks"]`).
**This is a complete, shipped feature as of the 9 Aug 2026 capture** — the 23 Jul 2026 changelog claim
is confirmed, not merely plausible.

### 2c. The LLM backend — DIRECT CONFIRMATION (the run's longest-standing open question)

A model-selection enum found verbatim: `Wt(["us.anthropic.claude-opus-4-6-v1",
"us.anthropic.claude-sonnet-4-6"])` — the `us.anthropic.*` prefix is the exact AWS Bedrock cross-region
inference-profile naming convention, i.e. **Cue is backed by real Claude models served via AWS Bedrock**,
selectable per config (`customPrompt`, a strictness enum `["strict","relaxed","custom"]`). A broader
config schema also declares `llmProvider: enum(["openai","anthropic","anthropic_direct"])` (default
`"openai"`) + `llmServiceVersion` + a `bedrockKnow[ledgeBase]`-shaped field — i.e. Cue's platform is
**multi-provider LLM infrastructure** (OpenAI direct + Anthropic via Bedrock + Anthropic direct API),
not a single hardcoded call. **This directly answers** the open question repeated across
`ux-flows.md`/`information-architecture.md`/the dimension's own Inferences: Cue is genuine LLM
orchestration, not a relabeled rules engine. (The FAQ-bot "Emma" surface — intent classifier + in-house
NLU host — is architecturally distinct and this finding does not extend to it.)

### 2d. A live, unauthenticated MCP server — direct observation, contradicts the prior negative

`wx-copilot.umd.js` embeds a genuine MCP (Model Context Protocol) client: the standard protocol-version
negotiation list `["2025-11-25","2025-06-18","2025-03-26","2024-11-05","2024-10-07"]`, Anthropic
Messages-API-shaped content blocks `server_tool_use`/`mcp_tool_use`, a `mcpServerName`/`toolName` result
schema, and **four** distinct MCP base-URL request headers: `x-wx-mcp-base-url`, `x-hire-mcp-base-url`,
`x-data-mcp-base-url`, `x-fountain-ai-mcp-base-url`. A resolved per-tenant `dataMcpBaseUrl` map is
present in the client:

```
localhost   → http://localhost:8000
production  → https://data-mcp-production-us-east-1.fountain.com
staging     → https://data-mcp-staging-us-...fountain.com
aimb (Aimbridge) → https://data-mcp-production-...internal.fountain.com  (dedicated per-tenant override)
ups (UPS)        → https://data-mcp-production-...fountain.com          (dedicated per-tenant override)
```

**This run then live-probed the production host, read-only, unauthenticated, capability-negotiation
only** (per ingestion §7 rule 11 / the tradecraft MCP-probe recipe — `initialize` + `tools/list` ONLY, no
tool was ever invoked, no query executed, no data read):

```
POST https://data-mcp-production-us-east-1.fountain.com/mcp
Accept: application/json, text/event-stream
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"0.0.1"}}}

→ 200, text/event-stream:
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-06-18",
  "capabilities":{"experimental":{},"prompts":{"listChanged":false},
                  "resources":{"subscribe":false,"listChanged":false},
                  "tools":{"listChanged":false}},
  "serverInfo":{"name":"fountain-data-mcp","version":"1.27.2"}}}
```

A follow-up `tools/list` (still read-only, no auth header sent, no state change) returned **6 fully
JSON-Schema'd tools**, unauthenticated:

| Tool | What it does |
| --- | --- |
| `list_cubes` | lists all Cube.js semantic-layer cubes/views (name, title, measure/dimension counts) |
| `get_cube_detail` | full cube metadata (measures/dimensions/segments), TOON-encoded |
| `execute_cube_sql_v2` | runs a Cube.js semantic query against **ClickHouse**, with server-side dataset caching (materializes to Parquet, returns a `dataset_id` — "no row data enters the calling context") |
| `execute_raw_sql` | runs caller-supplied raw ClickHouse SQL **"with RBAC applied"**; the `product` param docstring explicitly states: `"hire"` routes through **`FDEPLOY_RULES`** (Hire ClickHouse DB) while **all WX products (onboard, shift, etc.) route through `FDEPLOY_RULES_WX`** |
| `query_dataset` | follow-up SQL/structured queries against a cached dataset |
| `list_datasets` | lists cached datasets for the current conversation thread |

**This is a decisive, direct-observation finding that revises `feature-coverage.md` row 63** ("no live
MCP server exists… roadmap-not-shipped"). The prior negative was correct for the 6 candidate paths it
tried (3 hosts, all guessed from the docs' `exposeAsMcpTool` tag / `.well-known/agent-skills` manifest —
`app.fountain.com`, `services.fountain.com`, `developer.fountain.com`); it never had this host, because
`data-mcp-production-us-east-1.fountain.com` is only discoverable from this now-fetched client bundle's
config map. Per evaluation's own tiebreaker rule (direct observation beats inference), the row is
corrected. **Scope note, stated precisely so this isn't over-claimed either:** this confirmed server is
an **internal analytics/natural-language-to-SQL tool server for Cue's own use** (Cube.js semantic layer +
ClickHouse), not necessarily the same surface the docs-side `exposeAsMcpTool`-tagged **Hire domain**
endpoints (applicants/openings/etc.) would use if exposed publicly — that broader "is there a
customer/developer-facing agent-callable Hire API" question is *narrowed* by this finding (the
underlying MCP transport plumbing is real and live) but not fully closed. **The `execute_raw_sql` tool's
own docstring is an independent, load-bearing corroboration of the Hire-vs-WX two-application/two-
database split** (`data-model-api-surface.md` / `information-architecture.md`'s biggest finding) — a
third database-layer confirmation, on top of the nav catalog (§1) and the pre-existing
certificate-transparency/Helm evidence. **No tool was invoked; only `initialize`+`tools/list` were
called — zero customer data was read or could have been read by this probe.**

### 2e. Generated API client — 14 microservices, 382 paths (independent corroboration of the docs' "12 services")

`wx-copilot.umd.js` embeds its own full generated OpenAPI client, spanning: `serviceauthorization` (19),
`servicecommunicate` (3), `serviceemployment` (14), `serviceintegrations` (26), `servicemedia` (10),
`servicemessaging` (5), `serviceorganizations` (87), `servicepool` (50), `servicescheduler` (3),
`servicesecurity` (90), `servicesegmentation` (3), `servicestaff` (3), `servicetodo` (12, scoped entirely
to `i9Profiles` in this curated client — not the full onboarding task-flow surface `docs` describes;
flagged as an open question, not a contradiction), `serviceworkforce` (57).

> **CORRECTION (Mode-5 iteration 2, 2026-08-09).** This paragraph originally read *"Eight of these
> fourteen service names (`serviceemployment`, `serviceintegrations`, `servicemedia`, `servicemessaging`,
> `servicescheduler`, `servicesegmentation`, `servicestaff`, `serviceworkforce`) do not appear anywhere
> in this run's prior docs/api capture."* **That list was wrong.** Four of the eight —
> `serviceemployment`, `servicemedia`, `servicestaff`, `serviceworkforce` — **are** among the documented
> 12 (`data-model-api-surface.md` §Spine 2). The correct set of **undocumented** families is **six** from
> `wx-copilot` (`serviceauthorization`, `servicecommunicate`, `serviceintegrations`, `servicemessaging`,
> `servicescheduler`, `servicesegmentation`) **plus `servicesupport`** from `wx-navbar` = **seven
> client-only families**, for **≥19 `service*` families in production** (12 documented + 7). Caught while
> propagating this mine into the Evaluation rollups; the propagated tables carry the corrected set.

**Seven of the fifteen client-consumed service names do not appear anywhere in this run's prior docs/api
capture of "Fountain One, 12 microservices"** — either the real backend has
more than 12 services, or some are renames of previously-documented services
(`serviceworkforce`'s 57 endpoints is suspiciously close in scale to the docs' `serviceattendance` 81 —
open question, not asserted as the same service). This is nonetheless an **independent corroboration**
of the docs-reconstructed "Fountain One" claim via a completely different lane (a live shipped client
bundle, not documentation) — a promotion candidate for Evaluation's confidence banding, not actioned
here (bundle-mine ↔ docs-mine on the *same underlying services* is the kind of cross-dimension agreement
the evaluation rules reward, though the service-name mismatch needs reconciling first).

### 2f. Client-side "UI tool" framework (a distinct mechanism from the MCP server above)

Separately from the MCP client, the bundle exposes a page-embeddable tool-registration API:
`setPageUiTools`/`setGlobalUiTools`/`getUiToolDefs`/`clearPageUiTools`, `callTool`/`callToolStream`,
`submitUiToolResult`/`submitUiToolResultStream`, `cancelUiToolCall`, `exposeAsPromptContextTool`,
`useArtifactTools`. This lets a HOST PAGE register typed "tools" Cue can call and render structured
results for — concretely evidenced by ~150 embedded I-9/E-Verify-specific UI strings (`"Complete Section
2"`, `"Click to override the E-Verify for this profile."`, `"Case Tags"`, `"Closed authorized"`, `"Closed
non-confirmation"`) — i.e. Cue can drive an **embedded I-9/E-Verify case-management panel** as one such
UI tool. This is the client-side half of the cross-surface agent-orchestration story; the name
`exposeAsPromptContextTool` also echoes (but is a distinct mechanism from) the docs-side
`exposeAsMcpTool` tag — worth a future cross-check, not conflated here.

### 2g. Negative check — Cue industry variants (row 21)

Grepped both bundles for `retail|logistics|restaurant|hospitality` — **zero hits**. Corroborates (does
not newly prove) the existing "roadmap-not-shipped / press-only" disposition for row 21.

### 2h. Negative check — Shift clock-in / geofencing / coverage-gap agent (rows 43, 45)

Grepped both bundles for `clock|geofence|coverage[-_]?gap` in path/label context — **zero hits** (only
unrelated code, e.g. an animation/dataflow scheduler's internal `_clock` counter). No change to rows 43/45.

---

---

## 3. The three unprobed MCP hosts — probed (Mode-5 iteration 2, 2026-08-09)

<!-- method: live read-only unauth MCP capability probe (initialize + tools/list ONLY — no tool invoked,
     no argument supplied, nothing executed) + DNS candidate sweep · confidence: high for what responded -->

§2d left three of the client's four declared MCP base-URL headers unprobed. Iteration 2 probed them.
**Result: one of the three is live, and it is the one that mattered.**

| Header | Host found | Status |
| --- | --- | --- |
| `x-data-mcp-base-url` | `data-mcp-production-us-east-1.fountain.com` | ✅ live (it. 1) — `fountain-data-mcp v1.27.2`, 6 tools |
| **`x-hire-mcp-base-url`** | **`mcp.fountain.com`** | ✅ **LIVE — `fountain-hire-mcp-server v1.0.0`, 127 tools** |
| `x-wx-mcp-base-url` | — | ❌ **not located** (16-candidate DNS sweep, all NXDOMAIN) |
| `x-fountain-ai-mcp-base-url` | — | ❌ **not located** (same sweep) |

### 3a. How the host was found (the client never spells it out)

The bundle declares only *header names*, not the `wx` / `hire` / `fountain-ai` URLs (unlike
`dataMcpBaseUrl`, which ships a resolved per-tenant map). So the hosts were **searched for**, not read:

- **DNS candidate sweep, 16 names** under `fountain.com` — `wx-mcp`, `hire-mcp`, `data-mcp`,
  `fountain-ai-mcp`, `ai-mcp`, `mcp-wx`, `mcp-hire`, `mcp-ai`, `cue-mcp`, `copilot-mcp`, `mcp`,
  `mcp-production`, `mcp-staging`, plus the `*-mcp-production-us-east-1` pattern of the known data host.
  **Two resolved:** `data-mcp-production-us-east-1` (known) and **`mcp`** (new). Also resolving:
  `data-mcp-staging-us-east-1` — a staging twin, **deliberately not probed** (a staging surface adds
  nothing a production one has not shown).
- **Certificate transparency is blind here.** A full CertSpotter sweep of `fountain.com` returns 144
  names and **zero containing `mcp`** — because Fountain serves a wildcard `*.fountain.com` certificate.
  This is worth recording as method knowledge: *CT enumeration cannot find any subdomain covered by a
  wildcard cert, so a CT-negative is never evidence a host is absent.* It is exactly why iteration 0's
  host guesses missed both real MCP servers.

### 3b. `mcp.fountain.com` — transport (all read-only)

```
GET  /            → 409 {"jsonrpc":"2.0","error":{"code":-32000,
                          "message":"Conflict: Only one SSE stream is allowed per session"}}
GET  /health      → 200 {"status":"healthy","server":"fountain-mcp-server","version":"1.0.0",
                          "timestamp":"2026-08-09T…","uptime":…,"memory":{…}}
POST /            → 200 text/event-stream
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18",
    "capabilities":{},"clientInfo":{"name":"probe","version":"0.0.1"}}}
 → {"result":{"protocolVersion":"2025-06-18","capabilities":{"tools":{"listChanged":true}},
      "serverInfo":{"name":"fountain-hire-mcp-server","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
POST /mcp, GET /sse, POST /messages, GET /api/mcp, GET /v1/mcp → 404 (Express "Cannot POST /mcp")
```

Notes: the server is mounted at the **root**, not `/mcp` — the iteration-0 probe convention
(`<host>/mcp`) would have missed it even with the right host. `x-powered-by: Express`,
`access-control-allow-origin: *`, Cloudflare in front. **No `mcp-session-id` header is issued**, and a
`tools/list` with no prior session succeeds — the transport is effectively stateless for read methods.
The `/health` endpoint reports the generic `fountain-mcp-server` while the MCP handshake reports the
specific `fountain-hire-mcp-server`; one Express process, two names.

### 3c. `tools/list` — 127 tools, unauthenticated, complete (no `nextCursor`)

Every tool carries `_meta.apiTags` **including `"exposeAsMcpTool"` — all 127 of them.** This is the
end-to-end trace of the tag the `api` dimension found in the docs build pipeline: it is the switch that
promotes an endpoint to an agent-callable MCP tool.

**By path family** (derived from the tool names, which encode `<verb><PathInCamelCase>`):

| Family | Tools | Examples |
| --- | --- | --- |
| **`/api/go/v1`** | 33 | `getApiGoV1Applicants`, `getApiGoV1ApplicantsIdMessages`, `postApiGoV1ApplicantsIdMessages`, `patchApiGoV1ApplicantsIdReject`, `getApiGoV1Funnels`, `getApiGoV1Shifts`, `getApiGoV1WhatsAppMessageTemplates`, `postApiGoV1Calendars`, `getApiGoV1CompanySettingsLaborUnionCodes` |
| **`/api/go/v2`** | 23 | `getApiGoV2DashboardCounts`, `…UpcomingInterviews`, `…VideoReviews`, `…InterviewFeedback` (+ `Shared*` org-wide variants), `getApiGoV2Uas` / `putApiGoV2Uas` (recurring availability), `getApiGoV2UsersWhoami` |
| `/internal_api/sourcing/*` | 28 | `getInternalApiSourcingDashboardOpenings`, `getOpeningHistoricalConversionData`, `acceptSourcingPurchaseRecommendation`, `postInternalApiSourcingVonqContractsNew`, `patchInternalApiSourcingSourcingSettings` |
| `/v2/*` (Hire public) | 15 | `getV2Applicants`, `postV2Applicants`, `putV2ApplicantsIdAdvance`, `deleteV2ApplicantsId`, `getV2Locations`, `putV2FunnelsId`, `postV2Positions` |
| **`getTools*` / `postTools*`** (agent composites) | 21 | `postToolsApplicants` ("search/find by name, email, phone…"), `postToolsWorkflowEditorStages`, `postToolsUsers`, `postToolsAvailabilityManagement`, `getToolsLlmContext` ("stage schemas and custom data keys"), `postToolsHireGoUrl`, `postToolsAiRecruiterJobs`, `getToolsDashboard`, `postToolsSignatureTemplates`, `postToolsPartnerIntegrations`, `getToolsWorkflowTemplates` |
| other | 7 | `getApiSelfServeV2Openings`, `getInternalApiWxCompanySettingsFeatureFlags`, … |

**`apiTags` distribution** (multi-tag): `exposeAsMcpTool` 127 · `Go API` 56 · `Internal API` 36 ·
`Sourcing` 35 · `Unknown API` 19 · `External API` 16 · `Go Dashboard` 13 · `Go Applicants` 11 ·
`Applicants` 7 · `Go Users` 6 · `Go Openings` 5 · `Workflows` 5 · `Go UAS` 4 ·
`Locations and Location Groups` 4 · `Positions` 4 · `Go Availability` 3 · `Go Locations` 3 · plus
singleton tags (`Support`, `Funnels`×2, `MessageTemplates`×2, `LLM Context`, `Document Signing`,
`Partner Integrations`, `AiRecruiterJobs`, `Hire Go URLs`, `Dashboard`, `Source`, …).

**Schema conventions** (each tool is a full JSON-Schema draft-07 object):

- Inputs namespaced as `pathParams` / `queryParams` / `bodyParams`.
- **Every tool additionally requires a `uiMeta` object** with `label` — *"User-facing one-sentence
  non-technical summary of what you're doing with this tool call and why"* (1–200 chars) — and
  `actionType: "create" | "delete" | "update" | "view"`, *"used to determine the appropriate icon to
  display in the UI."* **The agent is contractually required to narrate its own action.**
- MCP `annotations`: **73 `readOnlyHint: true`**, **4 `destructiveHint: true`**.
- `execution: {taskSupport: "forbidden"}` on **all 127** — no long-running/task-mode calls.
- `_meta` also carries `outputSchema`, `inputExamples`, `usageInfo`, `toolName`, `toolDescription`, and
  an `exposeAsPromptContextTool` boolean — the server-side counterpart of `wx-copilot`'s client-side
  `exposeAsPromptContextTool` API (§2f).

### 3d. What this establishes — and the three things it does not

**Establishes (direct observation · high):** a second live MCP server; it is the **Hire** one; it serves
the `exposeAsMcpTool`-tagged operations; its **tool catalog is readable with no credential**; and it
reveals **`/api/go/{v1,v2}`** — a real API family absent from all 575 documented endpoints *and* all 766
app-own paths, i.e. the API behind "Fountain Go" / Hire Go, which this run had otherwise seen only as a
`/hire-go-redirect` nav stub.

**Does NOT establish:**

1. **That any tool executes unauthenticated.** **No tool was invoked** — not once, with no arguments,
   on either server. `tools/list` is capability metadata. Whether a `tools/call` succeeds without a
   credential was **deliberately not tested**: invoking a tool is a state/data action outside the
   read-only boundary (ingestion §7 rules 4–5). Recorded as a **security question, not a finding**.
2. **That this is a supported customer/developer integration surface.** It is undocumented across all
   593 reference pages; its known first-party consumer is Cue (`wx-copilot` sends
   `x-hire-mcp-base-url`). "Agent-callable in production" is fact; "a published integration product" is
   not established.
3. **That `wx` and `fountain-ai` MCP servers do not exist.** Per ingestion §7 rule 10 the negative is
   **artifact-scoped**: absent from the 16 candidate names probed, over a namespace CT cannot enumerate.

---

## Open questions this capture leaves (new or refined)

1. Which subset of the §1b catalog is actually `enabled` for the `fountain`/`app.fountain.com` tenant —
   the config is injected at mount time from server-computed `featureFlags`/`whoami`, not statically
   knowable from this file alone. Needs either a session or the `main.js` call site that constructs the
   config object (not re-fetched this run).
2. Whether `serviceworkforce` (57 eps, found live here) is a rename/successor of the docs-documented
   `serviceattendance` (81 eps) — same product (Shift) area, different name, unreconciled.
3. ~~Whether the confirmed-live `fountain-data-mcp` server is reachable from, or is the same deployment
   as, any customer/developer-facing MCP surface implied by the docs' `exposeAsMcpTool` tag.~~
   **ANSWERED (it. 2, §3): a separate `fountain-hire-mcp-server` at `mcp.fountain.com` serves 127
   `exposeAsMcpTool`-tagged tools unauthenticated.** What remains open is narrower — whether it is a
   *supported customer* surface (undocumented in 593 pages) and whether any tool executes without a
   credential (deliberately untested).
5. **(New, it. 2) How large is `/api/go/{v1,v2}` really?** 56 MCP tools map to it, but MCP exposure is a
   curated subset, so 56 is a floor. The "Fountain Go" client is the artifact that would settle it — and
   it is a separate SPA this run never located.
6. **(New, it. 2) Where do `x-wx-mcp-base-url` and `x-fountain-ai-mcp-base-url` point?** 16 DNS
   candidates all NXDOMAIN; the wildcard cert makes CT enumeration useless. The likely answer is a
   runtime-injected internal host (same pattern as `wxServiceBaseUrl`), i.e. **not statically
   recoverable** — this is the AdCreative-SignalR class of dead end (`tradecraft.md` §2.27): record
   presence as declared, URL as open.
4. The exact hostname/origin the "Worker Experience" (`wxServiceBaseUrl`) frontend renders at — still
   unknown; only its role and injection mechanism are now confirmed.
