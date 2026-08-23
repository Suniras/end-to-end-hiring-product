---
dimension: api
target: paradox
status: complete
access_grade_used: runtime:reachable
method: openapi-verbatim
completeness_pct: 75
confidence: high
captured_at: 2026-08-09
sources:
  - https://api.paradox.ai/ (+ /ping, /docs, /v1, /health, /status, /graphql, /webhooks, and 14 other probed paths)
  - https://www.paradox.ai/partners/integrations
  - https://www.paradox.ai/partners/workday
  - https://www.paradox.ai/partners/sap
  - https://www.paradox.ai/partners/indeed
  - https://readme.paradox.ai/ (the API Developer Hub — 55 reference/doc/changelog pages fetched)
  - https://readme.paradox.ai/llms.txt
  - https://readme.paradox.ai/docs/iframe-usage
  - https://readme.paradox.ai/mcp
  - https://readme.paradox.ai/.well-known/agent-skills/index.json
  - https://readme.paradox.ai/.well-known/oauth-protected-resource/mcp
gaps:
  - "No single consolidated OpenAPI/Swagger spec file is served anywhere — the 53-operation catalog was reconstructed by merging 53 separate per-operation OpenAPI 3.1 JSON fragments (one per readme.paradox.ai/reference page); each fragment is individually verbatim and machine-parseable, but no single canonical file exists to fetch."
  - "No credentials available (auth:none this batch) — every endpoint's request/response shape is taken from the docs' own examples, never live-called. All shapes should be treated as 'documented' not 'observed-live'."
  - "The webhook callback PAYLOAD shape for POST /reporting/reports's callbackUrl invocation is not documented on the page that documents the request — only that it fires once the report is ready."
  - "The JWT-minting mechanism behind the iframe-embed contract (docs/iframe-usage) is not documented — unclear which endpoint/flow generates a jwt_token for a given OID/account_id pair."
  - "No public listing of the 'SAP SuccessFactors browser extension' Paradox mentions was confirmed on the Chrome Web Store during this pass — flagged as a distribution-artifacts follow-up, not resolved here."
  - "Rate-limit headers / quota documentation not found anywhere in the recovered doc set — an explicit absence, not a miss (checked all 55 pages + the llms.txt index)."
  - "The internal api.paradox.ai/docs/docs/ Swagger/ReDoc UI is confirmed to exist (HTTP Basic Auth-gated) but its contents were never seen — no credential guessing attempted, per ethics."
---

# Paradox — api dimension capture

## Method

Three-pronged: (1) direct unauth path-probing of `api.paradox.ai` (root + ~20 candidate paths, with
header-level analysis to distinguish "API-Gateway-level reject" from "reached-the-backend-then-404" from
"real-but-gated-endpoint"); (2) a website-crawl detour that started as an embeddable-widget search and
instead surfaced a linked **third-party-hosted API Developer Hub** (`paradox.readme.io` →
`readme.paradox.ai`, a ReadMe.io-platform docs site invisible to subdomain enumeration because it's not a
`*.paradox.ai` DNS-A-record pattern most probes would guess) — that hub was then mined exhaustively (all
55 doc/reference/changelog pages, each individually fetched via ReadMe.io's `.md`-suffix raw-markdown
convention, no auth required); (3) the three named partner-integration pages (Workday/SAP/Indeed) for
webhook/integration-mechanism claims. Total: ~75 HTTP requests, all read-only, all unauthenticated, well
under the ingestion §8 fan-out bound.

## Findings

### 1. `api.paradox.ai` — confirmed live AWS backend, Python/gunicorn, three response classes

Direct probing (see `raw/auth-wall-probe.md`) distinguishes, by response headers alone, three classes of
path: (a) **`/` → 403** "Missing Authentication Token" — API Gateway's own rejection, no backend reached;
(b) **~18 candidate paths → 404**, but carrying an `x-amzn-remapped-server: gunicorn` header — these
requests DO reach a live **Python/gunicorn** backend, which itself 404s them (confirming the real prefix
is `/api/v1/public/*`, not bare `/v1` etc.); (c) **`/ping` → 200 `healthy`** — a genuine unauthenticated
health-check endpoint, apparently served at the gateway level (no remapped-backend headers). A fourth
case, **`/docs` → (2 redirects) → `/docs/docs/` → 401 Basic Auth**, `WWW-Authenticate: Basic realm="Have
a good day !"`, confirms a real **internal Swagger/ReDoc UI** exists on the production API host itself,
gated behind Basic Auth (never attempted past the 401).

### 2. The public API Developer Hub: `readme.paradox.ai` (ReadMe.io-hosted, ~53 operations recovered)

Linked from `www.paradox.ai/partners/integrations` ("Learn more about APIs" → `paradox.readme.io` → 301 →
`readme.paradox.ai`). This is a real, actively-maintained **partner/customer API reference** — "olivia-
public-api-docs" v1.0 — for the **Olivia Recruiting** product (`api.paradox.ai/api/v1/public/*`). Full
catalog in `raw/endpoint-catalog.md`; highlights:

| Family | Ops | Notes |
|---|---|---|
| Auth | 1 | OAuth2 `client_credentials` (preferred) or HTTP Basic — credential pair issued by "the Paradox Integrations Team," **not self-serve** |
| Candidates | 8 | full CRUD + messaging + unsubscribe + attribute patch/replace; 37-field entity schema |
| Users / roles / location-permissions | 12 | full CRUD, incl. an `employee_id`-addressed alias path family |
| Locations | 7 | full CRUD (+ one endpoint marked `deprecated`, replaced by a deactivate-not-delete pattern — a real API-evolution signal) |
| Areas | 4 | grouping construct over Locations |
| Rooms | 5 | interview rooms, tied to Locations |
| Interview (settings/history/alerts/rooms) | 4 | incl. the one documented **inbound 3rd-party-integrator** endpoint (`PUT /interview/interview_alerts`) |
| Reporting | 3 | async job + the one documented **webhook callback** (`POST /reporting/reports`, requires `callbackUrl`) |
| Scheduling / company (groups, conversations, AI branding) | 4 | — |

**Auth model:** OAuth2 client_credentials against `POST /auth/token` (5 documented environment hosts: US
prod/stg/test/dev2 + **a separate EU region**, `api.eu1.paradox.ai` / `api.stg.eu1.paradox.ai` —
confirming a real US/EU data-residency split), or equivalent HTTP Basic Auth. **Response envelope:**
offset/limit pagination (`{limit, count, offset, <resource>: [...]}`); **error envelope:** a hand-rolled
numeric app-error-code taxonomy (`{"errors":[{"code":1015,"message":"Invalid request.","field":""}]}`),
not a generated-framework default. **No rate-limit headers documented anywhere** in the 55-page set — an
explicit absence.

### 3. Webhook / inbound-integration contracts (the task's specific ask)

- **Outbound (Paradox → partner):** `POST /reporting/reports` requires a `callbackUrl`; Paradox invokes
  it once an async report job completes. This is the one clean, documented webhook contract found — the
  payload shape delivered TO that callback is not itself documented (open question).
- **Inbound (partner → Paradox):** `PUT /interview/interview_alerts` is explicitly billed as "This API
  allows 3rd party integrators to send Interview Requests to Paradox" and can even create a Candidate
  record that doesn't yet exist — a real, current (doc updated 2026-07-24 with a new opt-in validation
  toggle) inbound-integration surface.
- **No generic webhook-subscription system** (no `/webhooks` CRUD, no event-type catalog, no signature-
  verification docs) was found — Paradox's "webhook" surface is these two narrow, purpose-built contracts,
  not a general pub/sub event bus.

### 4. The embeddable surface — a signed-URL IFrame contract, not a `<script>` widget

The task's embed-widget hypothesis is **confirmed present but in a different shape than expected**: no
`<script src="widget.js">` tag or `data-paradox-*` attribute exists anywhere in `paradox.ai`'s or
`careers.paradox.ai`'s markup (checked both). Instead, `readme.paradox.ai/docs/iframe-usage` documents
four `olivia.paradox.ai/{demo/sf-iframes, external/convo, external/scheduling, external/settings}` URLs,
each taking `OID` + `jwt_token` + `account_id` query params, meant to be embedded in an `<iframe>` inside
a **partner's own UI** — this is the mechanism behind the SAP SuccessFactors browser-extension
integration (see below), not a DIY-embed for arbitrary customer career sites. Full detail in
`raw/embed-iframe-contract.md`.

### 5. Partner integration mechanisms differ per partner (a real architecture finding)

| Partner | Mechanism | Evidence |
|---|---|---|
| **Workday** | server-to-server status-sync (Workday Certified badge); scheduling auto-updates candidate status in Workday | `partners/workday`; corroborated by a separate press release found via sitemap |
| **SAP SuccessFactors** | a **client-side browser extension** injecting Paradox UI into SuccessFactors, using the iframe-embed contract above (`sf-iframes` demo path name = SuccessFactors) | `partners/sap` |
| **Indeed** | candidate applications completed **inside Indeed Apply itself** (an Indeed-side embed, not documented from Paradox's side) | `partners/indeed` |

Three genuinely different technical mechanisms, not one uniform connector — see `raw/partner-
integrations.md`.

### 6. MCP / agent-tool surface — present, but it's ReadMe.io's, not Paradox's

`readme.paradox.ai/mcp` is a real, auth-gated (401, standard JSON-RPC `-32001 Authorization required`)
MCP endpoint, with OAuth discovery (`/.well-known/oauth-protected-resource/mcp`) pointing to
**`dash.readme.com/oidc`** — ReadMe.io's own SaaS-account issuer, not Paradox's. This is a platform
feature every ReadMe-hosted docs site gets in 2026 (a docs-search/"Ask AI" tool), not a Paradox-built
agent-tool surface. Full detail + the generic `agent-skills` manifest in `raw/tool-catalog.md`.

### 7. Independent cross-checks that held up

- **Language support:** the API docs enumerate **57 language/locale codes** for `language_preference`,
  exceeding (and corroborating) the Workday partner page's marketing claim of "30+ languages."
- **HireVue / Pymetrics / ADP fields baked into the Candidate schema** (`hirevue_link`, `pymetrics_link`,
  `adp_link`) confirm assessment-vendor and payroll-system integrations beyond the three named ATS
  partners — a broader integration surface than the marketing partner pages alone suggest.

## Inferences

- Paradox's public-API posture is **partner-API, not self-serve-developer-platform**: real, current,
  reasonably thorough documentation (57 pages, several with 2026 update timestamps — actively
  maintained), but credentials are issued by a human team, not a signup form. This matches Discovery's
  read exactly, but the *depth* of the recovered catalog (53 operations, full entity schemas) is far
  richer than the "docs-reconstructed, low-confidence" grade Discovery pre-assigned — the method should
  be upgraded to `openapi-verbatim` (high confidence) because every recovered fragment IS a real, served,
  machine-parseable OpenAPI document, even though no single consolidated file exists.
- The three-different-mechanisms-per-partner pattern (server-sync / browser-extension / embedded-in-
  partner) suggests Paradox does **bespoke integration engineering per major partner** rather than
  investing in one generalized integration framework — plausible given the partner tiers are Workday/SAP/
  Indeed specifically (the biggest possible partners), where bespoke effort is worth it, vs. a long tail
  of smaller ATSs that presumably use the plain REST API directly.
- The backend is confirmed Python/gunicorn (header-level fingerprint) sitting behind AWS API Gateway —
  independent, HTTP-observed corroboration of the AWS finding Discovery already made from the error-
  string tell, adding the language runtime that a pure DNS/cert view can't see.

## Open questions

- What payload does the `POST /reporting/reports` callback deliver (headers, signature scheme, retry
  policy)? Not documented on the one page that documents the request side.
- What mints a `jwt_token` for the iframe-embed contract, and what is its expiry/claims shape?
- Does a public SAP SuccessFactors browser-extension listing exist (Chrome Web Store)? Not confirmed in
  this pass — a `distribution-artifacts` follow-up.
- Is there a rate limit? Not documented anywhere in the 55-page set — either genuinely unlimited for
  partner-issued keys, or simply undocumented; can't distinguish without a live key.
- What's actually served behind the Basic-Auth-gated `api.paradox.ai/docs/docs/`? Presumably the same
  spec (or a superset, incl. internal-only operations) as `readme.paradox.ai` — unconfirmed.

## Artifacts

- `raw/openapi.json` — digest: all 53 recovered operations' OpenAPI 3.1 fragments merged into one
  document (36 distinct paths), with a `_note` field documenting the reconstruction method. **One
  redaction applied:** a documented example response embedded a real-shaped AWS presigned-S3-URL
  (an `AKIA...` access-key-id + `X-Amz-Signature`) from Paradox's own 2021 doc example — redacted to
  `<REDACTED:AWS_KEY_ID>`/`<REDACTED:SIG>` per ingestion §7 rule 3 despite being a stale/expired example;
  logged in the file's own `_redactions` field.
- `raw/endpoint-catalog.md` — the full 53-operation table + auth model + envelope shapes + the Candidate
  37-field schema + the webhook/inbound-integrator contracts, with commentary.
- `raw/tool-catalog.md` — the MCP/agent-skills surface at `readme.paradox.ai`, correctly attributed to
  the ReadMe.io platform rather than to Paradox.
- `raw/auth-wall-probe.md` — the `api.paradox.ai` path-probing log + the three-response-class analysis
  (gateway-reject vs. backend-404 vs. health-check vs. gated-internal-docs).
- `raw/embed-iframe-contract.md` — the four `olivia.paradox.ai` iframe-embed URLs + params.
- `raw/partner-integrations.md` — the Workday/SAP/Indeed page mines, each partner's distinct mechanism.
