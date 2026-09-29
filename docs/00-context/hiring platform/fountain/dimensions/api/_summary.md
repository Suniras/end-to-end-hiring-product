---
dimension: api
target: fountain
status: complete
access_grade_used: presence:rich (developer.fountain.com is a genuinely served ReadMe docs portal; no runtime auth was used)
method: docs-reconstructed
completeness_pct: 85
confidence: medium
captured_at: 2026-08-09
revised_at: 2026-08-09
superseded_by: # partial supersession only — see the banners in Findings §MCP and raw/tool-catalog.md
  - claim: "No MCP server is live" (asserted at product scope)
    corrected_to: "Two live MCP servers — fountain-data-mcp v1.27.2 at data-mcp-production-us-east-1.fountain.com/mcp (6 tools) and fountain-hire-mcp-server v1.0.0 at mcp.fountain.com (127 tools), both answering unauthenticated initialize + tools/list"
    by: [evaluation/data-model-api-surface.md#mcp, dimensions/deployed-client-bundle/raw/wx-micro-frontends.md#2d-and-3]
    when: Mode-5 iterations 1-2
    note: "The original negative remains CORRECT for the 6 paths on 3 hosts this dimension probed; the defect was its scope of assertion, not the probe. The dimension's positive finding (the curated exposeAsMcpTool tag) is confirmed and strengthened — it is the pipeline switch that makes an endpoint agent-callable."
sources:
  - https://developer.fountain.com/llms.txt
  - https://developer.fountain.com/reference/overview.md
  - https://developer.fountain.com/reference/hire-api-overview.md
  - https://developer.fountain.com/reference/webhooks.md
  - https://developer.fountain.com/reference/rate-limitations.md
  - https://developer.fountain.com/reference/frequently-asked-questions.md
  - https://developer.fountain.com/reference/deprecations.md
  - https://developer.fountain.com/reference/wx-api-deprecations.md
  - https://developer.fountain.com/reference/tenant-api-urls.md
  - https://developer.fountain.com/reference/custom-integrations.md
  - https://developer.fountain.com/reference/slack-integration.md
  - https://developer.fountain.com/reference/sync-with-hris.md
  - https://developer.fountain.com/reference/connecting-a-custom-form-to-the-onboardiq-applicant-portal.md
  - https://developer.fountain.com/reference/webhooks-and-external-api-calls.md
  - https://developer.fountain.com/reference/automation-webhooks.md
  - https://developer.fountain.com/reference/custom-attribute-webhooks.md
  - https://developer.fountain.com/reference/universal-tasks-webhooks-onboard.md
  - https://developer.fountain.com/reference/external-processing-api-compliance.md
  - https://developer.fountain.com/reference/embedding-the-worker-portal.md
  - https://developer.fountain.com/reference/partner-tasks.md
  - "41 individual endpoint reference pages (.md, incl. full embedded OpenAPI JSON) — see raw/endpoint-catalog.md for the full 575-page catalog assembled from llms.txt link titles"
  - https://developer.fountain.com/.well-known/agent-skills/index.json
  - https://developer.fountain.com/.well-known/mcp (404, verified absent)
  - https://services.fountain.com/.well-known/mcp (404, verified absent)
  - https://app.fountain.com/.well-known/mcp (200 but confirmed SPA-shell false-positive via control-path comparison)
gaps:
  - "Only 41 of 575 documented endpoint pages had their full OpenAPI JSON fetched and inspected (8 initial cross-family samples + 36 stratified within the 108-endpoint Hire-v2 family); the other 534 pages' exact request/response schemas were NOT individually verified — the catalog's path/method/summary columns come from llms.txt link titles + slug reconstruction, which is a lower-confidence source than a fetched schema for those rows."
  - "exposeAsMcpTool OpenAPI tag prevalence is only sized within Hire-v2 (28% of a 36-page stratified sample) and 2 serviceworkforce pages (0%); the other 12 service* microservices (467 pages) were not checked for the tag at all."
  - "No live session/auth was available this run, so the OAuth Bearer header name inconsistency (docs show both 'Authorization: Bearer' implied by the OpenAPI securitySchemes.jwt AND a literal 'Application: Bearer' in a worked curl example) could not be resolved by a live probe."
  - "No rate-limit documentation was found for the 13 service* microservices (only the Hire v2 legacy API documents a 120 req/min limit) — genuinely undocumented, not confirmed unlimited."
  - "servicepulse and servicereferral (published-only microservices) have no obviously-matching /internal_api/* family in the deployed-client-bundle's 300-path sample — open whether the app UI truly has no matching surface or the bundle miner didn't reach those routes."
  - "partners.fountain.com (the partner-integration guide host referenced from the docs) was NOT independently crawled this run — flagged in the recon plan as a second docs surface to check; not covered here (would need a partners-focused website/docs pass)."
---

# Fountain — API dimension capture

## Method

Fountain's developer portal (`developer.fountain.com`, ReadMe-hosted) has **no single served OpenAPI/
Swagger spec file** (`openapi.json`/`swagger.json`/`.well-known/api-catalog` all confirmed 404, including
a retry of `.well-known/api-catalog` — no served spec exists at any guessed path). However, `llms.txt`
links **594 reference pages** (575 individual endpoint operations + 19 guide/integration pages), and
**every individual endpoint page embeds the complete, genuine, machine-generated per-operation OpenAPI
3.0 JSON** (visible via the page's `.md` mirror, e.g. `https://developer.fountain.com/reference/
get_v2-applicants.md`). So while there is no single spec to grade `openapi-verbatim`, the underlying
schema data for any sampled page IS verbatim generator output, not docs prose. Method is graded
`docs-reconstructed` for the overall capture (narrative + slug-based path reconstruction for the
un-sampled majority of the 575-page catalog), with the explicit caveat that **41 of the 575 rows are
schema-verbatim** (marked in `raw/endpoint-catalog.md`).

Steps taken: (1) fetched `llms.txt` (180 KB, 594 links) and parsed it into a title+slug index;
(2) fetched all 19 guide pages (auth overview, Hire API overview, webhooks ×6 variants, rate limits,
FAQ, deprecations ×2, tenant URLs, custom integrations, Slack, HRIS sync, custom-form, external-
processing-compliance, embedding-worker-portal, partner-tasks); (3) fetched 8 endpoint pages across 2
service families (Hire v2 Applicants/webhook-settings, serviceworkforce Workers) for verbatim schema/
envelope/pagination/error shapes; (4) ran a bounded 36-page stratified re-sample within the Hire-v2
family specifically to size the `exposeAsMcpTool` tag's prevalence; (5) probed for a live MCP server at
6 candidate paths across 3 hosts (all 404, one false-positive SPA-shell 200 verified via a control-path
comparison per ingestion §7 rule 10); (6) reconstructed the full 575-endpoint catalog by classifying
every `llms.txt` link's slug into one of 14 service-family prefixes and converting the slug back to an
approximate REST path. Total: ~65 HTTP requests, well within the ingestion §8 bounded-fan-out discipline.

## Findings

### Auth model — three coexisting schemes across an active platform-unification migration

| Scheme | Header/mechanism | Scope | Status |
|---|---|---|---|
| **"Fountain One" OAuth2** (current, preferred, all products) | `POST .../servicesecurity/processes/apikey/oauth/token` (client_credentials, HTTP Basic client_id:secret) → 60-min Bearer token | Personal keys (user-scoped) or Integration keys (role-scoped) | current default |
| **Hire legacy API key** | `X-ACCESS-TOKEN: <key>` — static, no token exchange, Primary+Secondary key pair | Hire product only | fully supported, not deprecated |
| **Trusted Party key** | Same header, restricted to create-applicant only | Third-party ingestion | fully supported |

The base URL itself completed a **multi-year consolidation** on 2025-11-14: all Hire + Worker Experience
APIs are now served from one host, `services.fountain.com`, gateway-resolving tenancy from the credential
rather than the URL — while **every prior legacy URL form still works** (main-tenant `api.fountain.com`,
regional `<region>.fountain.com`, single-tenant `<instance>.fountain.com`, WX-dedicated `services.
<instance>.fountain.com`). See `raw/auth-model.md` and `raw/tenant-model.md` for the full migration
timeline and a nuance the recon-plan hypothesis didn't anticipate (the per-tenant URL model is being
retired toward a unified gateway, not the current steady-state design).

### Envelope, pagination, errors — confirms a genuine microservices split (≥2 backend generations)

| | Hire v2 (legacy monolith) | `service*` microservices (13 services) |
|---|---|---|
| **Pagination** | page-number (`?page=N`, `Pagination{first,last,previous,current,next}`) AND cursor (`pagination.next_cursor`) on the same endpoint | LoopBack-style `filter[limit]/filter[skip]/filter[where][field][op]` offset pagination; sibling `/count` endpoints |
| **Success envelope** | flat resource JSON | JSON:API-flavored `{data, meta}`; `meta` carries `timestamp/verb/path/jti/rid/count/status/duration/size` (server APM surfaced in the response) |
| **Error envelope** | `{"error":{"msg","name"}}` | JSON:API-style array `[{rid,status,code,title,detail,meta}]` |
| **Rate limit** | documented: 120 req/min, doublable via a secondary key, `X-Api-Ratelimit-*` headers | **undocumented** — no rate-limit page found for any `service*` microservice |
| **Deprecation signal** | RFC 8594 `Sunset:`/`Link:` headers | not observed |

This — plus the two distinct `info.title` values seen in embedded OpenAPI fragments ("Hire Public API"
v2 vs "Worker Experience Public API" v1.0.0) — is strong, direct (not inferred) evidence that Fountain
runs at least two independently-built backend generations behind one gateway: a legacy Rails-flavored
Hire monolith, and a newer fleet of LoopBack-flavored Node microservices. See `raw/openapi-digest.md`
and `raw/rate-limits-and-pagination.md`.

### Endpoint-family overview (575 documented endpoints across 14 service prefixes)

| Family | Endpoints | What it covers |
|---|---|---|
| **Hire v2** (`/v2/...`) | 108 | Applicants CRUD, stages/transitions, labels, notes, SMS, GDPR anonymize, secure documents, funnels/openings, positions, locations, users, exports, webhook-settings, sessions |
| **serviceattendance** | 81 | Timesheets, time-off, shifts, shift tags, attendance policies, allowances, demands |
| **serviceworkforce** | 77 | Workers (core), jobs, locations/location-groups/trees, openings, custom attributes, audience-* read models |
| **serviceorganizations** | 60 | Companies, brands, EINs, company attributes/sets, **Copilot audit logs** |
| **servicetodo** | 57 | Onboarding task flows (incl. **Copilot-generated** task flows), assigned tasks, W-4 profiles |
| **servicepulse** | 43 | Engagement/pulse surveys, question banks, participants, themes, notification templates |
| **serviceemployment** | 39 | Employment profiles, employer notes, tags, log notes |
| **servicepool** | 28 | Talent pool/audiences, unified jobs, **Copilot-generated audiences** |
| **servicemedia** | 19 | E-signature documents, stored files |
| **servicesecurity** | 16 | API keys, OAuth token issuance, worker/employer impersonation, open signups |
| **servicecompliancev2** | 16 | Document types (incl. **AI-classified** `ai-documenttypes`), submissions, requirements, worker compliance profiles |
| **servicereferral** | 14 | Referral campaigns |
| **servicestaff** | 11 | Employer/staffing records |
| **hire-api-v2-misc** | 6 | Opening workflow reassignment |

Full method×path×summary table (all 575 rows): `raw/endpoint-catalog.md`.

### Webhooks — at least 4 independently-built subsystems + 1 synchronous decision-gate

Fountain has no single webhook product; webhooks are configured in 4+ separate places with different
payload shapes, signing conventions, and SLAs (full detail in `raw/webhooks.md`):

1. **Hire Screening/Post-Hire webhooks** (14 named event types — `Webhooks::Settings::ApplicantSave`,
   `Transition`, `CheckrStatus`, `OnfidoStatus`, `FunnelSave`, `HiringGoalChange`, `PartnerStatus`,
   `FileStatus`, `PosthireDataCollectionApproval`, `PosthireWorkerActivation`,
   `PosthireWorkerDeactivation`, `PosthireDocumentUploaded`, `LocationSave`, `ApplicantStateChange`),
   HMAC-SHA256 signed via `X-OBIQ-SIGNATURE-V2` keyed by the account's own API token, 2 retries then
   auto-disable after 10 failures/24h, 15 static egress IPs documented for allowlisting.
2. **Automation Webhooks** (newer no-code automation builder) — customer-chosen signing key OR custom
   `Authorization` header.
3. **Custom Attribute Webhooks** — fires on any worker custom-attribute change, hard 3-second response
   SLA (vs the legacy system's "process async" recommendation — a real implementation-boundary tell).
4. **Universal Tasks Webhooks** (Onboard flow builder) — fires on task completion/flow-end, a third
   distinct custom-attribute key convention (human-readable label, not UUID).
5. **External Processing URL** (compliance) — NOT a notification webhook: Fountain **blocks** on the
   response and lets the partner **override** the auto-approve/manual-review decision for a submitted
   compliance document, after Fountain's own OCR+AI-confidence pipeline has already scored it. The docs
   proactively warn about a fail-open footgun (a buggy integration force-approving every document with
   no human review) — notable candor for a background-screening product.

### MCP / tool-catalog surface — ~~no live server~~ **TWO live servers (superseded)**, plus a real agent-tooling signal in the spec itself

> **⚠️ SUPERSEDED IN PART (2026-08-09, Mode-5 iterations 1–2).**
> `superseded_by: evaluation/data-model-api-surface.md §MCP` · `raw/tool-catalog.md` (banner) ·
> `deployed-client-bundle: raw/wx-micro-frontends.md §2d`.
> Two live MCP servers were later confirmed by read-only unauthenticated probes (no tool invoked):
> **`fountain-data-mcp v1.27.2`** at `data-mcp-production-us-east-1.fountain.com/mcp` (6 Cube.js/ClickHouse
> tools) and **`fountain-hire-mcp-server v1.0.0`** at `mcp.fountain.com/` (**127 tools, every one tagged
> `exposeAsMcpTool`**). This capture's negative was **correct for the 6 paths on 3 hosts it probed** and
> is retained below for that scope; the defect was asserting it at product scope. The positive finding
> below — the curated `exposeAsMcpTool` tag — is **confirmed and strengthened**: it is the pipeline
> switch that makes an endpoint agent-callable in production.

No MCP server was found on the hosts this capture probed (6 candidate paths across 3 hosts, all genuinely
absent — one `app.fountain.com` 200 was verified as an SPA-shell false positive via a control-path
comparison; the two real hosts were reachable from neither). BUT: a
subset of Hire v2 operations' embedded OpenAPI JSON carries an extra tag, `"exposeAsMcpTool"`, alongside
the normal resource tag. A bounded 36-page stratified sample within the 108-endpoint Hire v2 family found
**10/36 (28%) tagged** — concentrated on core-entity primary operations (list/create/get/update/delete on
**Applicants, Locations, Positions, Funnels**), explicitly excluding sub-resource/process operations
(notes, documents, exports, activation). This reads as a deliberate, curated first agent-tool-surface
already baked into Fountain's API build pipeline, not a live product yet. Separately, `developer.
fountain.com/.well-known/agent-skills/index.json` serves a genuine `agentskills.io`-schema discovery
manifest — but it's a single "read the docs" pointer-skill, not a tool catalog. Full detail + the false-
positive verification trail: `raw/tool-catalog.md`.

### AI/Copilot backend surface — corroborates the recon-plan's "genuine vs relabeled AI" hypothesis (partially)

The recon plan flagged as an unverified hypothesis whether Fountain's marketed AI agents (Anna, Emma,
Sam, Cue) are genuine LLM orchestration or a relabeled rules engine. This dimension found **real,
dedicated backend endpoints** for AI/Copilot-driven actions — `servicetodo` has
`createforcopilot`/`cloneforcopilot`/`publishforcopilot`/`applytestchangestodraftforcopilot` task-flow
operations, `servicepool` has `copilot/audiences` creation/patch, `serviceorganizations` has a dedicated
`copilotauditlogs` resource (an audit trail specifically for AI-driven changes — a governance control
that wouldn't exist for a relabeled rules engine), and `servicecompliancev2` has an AI document-type
classifier (`post_api-servicecompliancev2-ai-documenttypes`). This is genuine evidence of **real backend
investment in an AI/Copilot layer with its own audit trail** — it does NOT confirm the underlying
orchestration is LLM-based (could still be templated/rules-assisted "AI"), but it moves the hypothesis
from "unverified" to "at minimum a real, audited, dedicated backend capability, not just a marketing
relabel of an existing rules engine." Cross-check against `session`/`website` dimensions if re-run.

### Published-vs-app-own diff (cross-dimension citation, not duplicated here)

`deployed-client-bundle` independently mined 300 app-own API paths (`web.fountain.com`, `/internal_api/*`
+ `/api_self_serve/*`) — almost **entirely disjoint** from this dimension's 575 published paths
(`services.fountain.com`). The app's own AI chatbot (29 `/internal_api/chatbot/*` paths), sourcing-spend
engine (52 paths), and AI workflow builder "Cue" (`/internal_api/ai_builder/workflow/{chat,
get_latest_message}`) have **no published API equivalent at all** — the public developer API is an
integration/data-sync surface, not a mirror of the product. Full diff: `raw/published-vs-app-own-note.md`
(this dimension deliberately did NOT append to the shared `_shared/api-path-catalog.md` — see that file
for why, and see the note on deviating from the dispatch brief below).

## Inferences

- **API generation/style:** REST throughout (no GraphQL, no gRPC observed anywhere in 575 documented
  endpoints or the app-own bundle catalog) — but NOT one REST style: a legacy Rails-flavored monolith
  (Hire v2) + a LoopBack-flavored Node microservice fleet (13 `service*` services), unified behind one
  API gateway host as of late 2025.
- **Maturity:** high maturity on backward compatibility (RFC 8594 Sunset headers, a genuinely
  non-breaking multi-year URL migration) but notably immature on cross-service consistency (2 error
  envelope shapes, 2 pagination styles, undocumented rate limits outside the legacy API) — consistent
  with a platform that grew by acquiring/absorbing distinct products (Hire = ATS/screening, Worker
  Experience = onboarding/attendance/compliance) rather than being built API-first from one team.
  (Inference from convention/envelope-shape observation, not confirmed against a company history source.)
  `servicecompliancev2` (the "v2" suffix) plus the deprecation-URL rename history
  (`wxp-services`→`services.fountain.com`) both point to at least one prior full API rewrite within the
  Worker Experience line alone.
- **Versioning posture:** endpoint-level (`v2` in the Hire path, `compliancev2` for one microservice)
  rather than whole-API versioning; deprecation is handled per-endpoint via Sunset headers, not via a
  version-sunset date for an entire API generation.
- **Agent/AI-tooling direction:** the `exposeAsMcpTool` tag + the `agentskills.io` discovery manifest
  together suggest Fountain is building toward agent/LLM-consumable API access as a forward-looking
  investment, ahead of shipping a live MCP endpoint — worth watching in a future re-run.

## Open questions

- Exact OAuth Bearer header name (`Authorization` vs the docs' own literal `Application: Bearer` example)
  — needs a live authenticated probe to resolve; not resolvable from docs alone (recorded, not guessed).
- Rate limits for the 13 `service*` microservices — genuinely undocumented.
- `exposeAsMcpTool` tag prevalence across the other 12 `service*` families (467 pages) — unsampled.
- Whether `partners.fountain.com` documents a materially different (e.g. more permissive, or webhook-
  push-only) contract than the general developer docs — not crawled this run.
- Whether `servicepulse`/`servicereferral` truly lack an `/internal_api/*` UI-facing equivalent, or the
  bundle miner simply didn't reach those routes.

## Deviation from the dispatch brief (flagged, not silent)

The dispatch brief asked me to append a `## source: api` section to `dimensions/_shared/
api-path-catalog.md`. Per `ingestion.md` §6, that shared file's contributor allowlist is `bundle` /
`session` / `wire` / `distribution` only — `api` (a published/non-runtime-observed surface) is
explicitly analogous to the host-level-dimension pattern the rule calls out ("cite, don't append"). I
followed the more specific governing rule instead and left a citation in `raw/
published-vs-app-own-note.md` rather than forking the shared seam file. Flagging this explicitly for the
orchestrator/Evaluation to review.

## Artifacts

- `raw/openapi-digest.md` — why there's no single spec file; the two distinct embedded OpenAPI source
  documents (Hire v2, Worker Experience) with their security schemes.
- `raw/endpoint-catalog.md` — the full 575-endpoint method×path×summary table, grouped into 14 service
  families, with the 41 schema-verbatim rows marked.
- `raw/auth-model.md` — the three auth schemes + the OAuth flow + the tenant-URL migration timeline.
- `raw/tenant-model.md` — the "Tenant API URLs" model verified against the recon-plan hypothesis
  (current unified-gateway model vs the still-functioning legacy per-region/per-tenant URL forms).
- `raw/webhooks.md` — all 5 webhook/decision-gate subsystems, the 14-event-type Hire webhook catalog,
  signing conventions, and the synchronous compliance decision-gate contract.
- `raw/rate-limits-and-pagination.md` — rate limits, the two pagination styles, the two error envelopes,
  the `service*` response-metadata envelope.
- `raw/tool-catalog.md` — the MCP live-probe results (all negative, one false positive verified), the
  `exposeAsMcpTool` OpenAPI tag finding + its 28%-of-sample prevalence and entity-curation pattern, and
  the agent-skills discovery manifest.
- `raw/published-vs-app-own-note.md` — the citation-not-copy cross-reference into `deployed-client-
  bundle`'s shared-seam catalog, plus the headline near-total-disjointness finding.
