# Fountain — Technology & Architecture

> Reconciliation rollup (Mode 3). Every claim is anchored `(dimension: artifact · method · confidence)`
> using the source dimension's own `_summary.md` provenance frontmatter. Weighting per `evaluation.md`:
> max-of-sources, promoted one band only on ≥2 **independent** dimensions, single-source capped at source
> confidence, conflicts flagged not averaged.

**Source-independence map for this target** (decided once, applied throughout):

| Lane | Dimensions | Independent of |
| --- | --- | --- |
| **A — the served docs corpus** | `docs` + `api` | both mine the *same artifact* (`developer.fountain.com`'s `llms.txt` + its ReadMe reference pages). Per `evaluation.md` "same artifact ⇒ ONE source", **docs+api agreeing is one source, never a band-bump**; their divergent counts (593 vs 594 indexed pages; 12 vs "13" microservices) are a **reported range, not a conflict**. |
| **B — the production client** | `deployed-client-bundle` | genuinely independent of A (different artifact, machine-verbatim method: a live production source map, not prose). The **strongest lane in this run.** |
| **C — the network/DNS/header layer** | `infra-backend-fingerprint` | independent of A and B. |
| **D — first-party non-marketing telemetry** | `community` (Statuspage JSON API, changelog) | independent of A, B, C for *infra/component* claims. |
| **E — marketing** | `website` | **not** independent of A for feature claims; used here only for lineage/positioning context, never to promote a stack claim. |
| **F — registry / store absence oracles** | `packages`, `distribution-artifacts`, `codebase` | independent, high-confidence *absence* evidence. |

**The run-wide observation gap, stated once (per `evaluation.md`'s write-side cap):**
`session` is `status: absent` and `wire-capture` is `status: folded` into it — `write_side_observed: false`
(`session: _summary.md · inferred · high`; `wire-capture: _summary.md · inferred · high`). **No live
request/response of the product's own API was observed by any dimension in this run.** Every architecture
claim below therefore rests on static artifacts (source maps, docs-embedded OpenAPI fragments,
DNS/CT/headers, a public status page). Consequence: *existence, wiring, and shape* of a subsystem can
reach fact; ***execution behaviour* of the AI agents (Anna / Emma / Sam / Cue) cannot, and is rendered
tentative everywhere it appears below.**

> **One exception, added by Mode-5 iteration 1 (2026-08-09).** A read-only unauthenticated probe of
> `data-mcp-production-us-east-1.fountain.com/mcp` (`initialize` + `tools/list` only) *is* a direct
> runtime observation — the single live wire response in this run. It, plus the string-mine of the
> previously-unfetched `wx-copilot`/`wx-navbar` UMD micro-frontends, **resolved two of this document's
> longest-standing open questions** (Cue's LLM backend; the "no live MCP server" negative). Both are
> corrected in place below and flagged **UPDATED (Mode-5 it. 1)**. The write-side cap is **unchanged**:
> no agent was ever seen producing output.

---

## TL;DR

Fountain is a **decade-old Ruby-on-Rails multi-tenant monolith with a newer LoopBack/Node microservice
fleet grafted alongside it**, both fronted by Cloudflare over a DuploCloud-provisioned AWS footprint —
and the single most distinctive structural fact is that **it runs two entirely separate API surfaces on
two different hosts**: the published developer API at `services.fountain.com` (575 documented endpoints,
OAuth2) and the app's *own* API — `web.fountain.com` under `/internal_api/*` + `/api_self_serve/*` (300
paths, dual-tier JWT) plus a WX service-tier of **466** `/api/service*` paths, **766 declared app-own
paths in total** — the recruiter-console half of which is near-disjoint from the published surface
(`api: raw/published-vs-app-own-note.md ·
docs-reconstructed · medium` × `deployed-client-bundle: _shared/api-path-catalog.md ·
source-map-reassembly · high`). The whole platform is visibly **mid-consolidation** — a dated,
still-running migration of every legacy per-tenant/per-region API host onto one gateway, mirrored inside
the client by side-by-side old/new subsystems (`Auth_old`, `workflow_editor_v2`, `opening_approvals` vs
`approval_rules`, `hiring-goals-v2/v3/v4`) — which reads as a suite assembled by acquisition and internal
product proliferation now being unified, not a platform designed as one. On the AI question the run's
strongest *architectural* finding is not the marketing: Fountain ships a **genuinely separate, versioned,
per-tenant-release-channelled micro-frontend** for the "Cue" copilot, a dedicated `agent_integrations` /
`ai_builder` API namespace, an AI-change audit-log service, **and** an in-house **intent-classifier NLU**
microservice. **Mode-5 iteration 1 then named the model layer:** the shipped `wx-copilot.umd.js` carries a
verbatim model-selection enum — **`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`,
the AWS Bedrock cross-region inference-profile naming convention** — inside a multi-provider config schema
(`llmProvider: openai | anthropic | anthropic_direct`, **default `openai`**), and a **live,
unauthenticated MCP server** (`fountain-data-mcp v1.27.2`, Cube.js + ClickHouse, 6 tools) backs it. So
Cue is genuine, multi-provider LLM orchestration whose client **declares** Claude-on-Bedrock as its
Anthropic option — *which provider actually serves a production call was never observed* (re-graded
Mode-5 it. 3) — while the **Emma** FAQ-bot surface remains a *separate*, intent-classifier/NLU mechanism
that this finding does not touch. Finally, the recruiter SPA ships **complete, unauthenticated production source maps on every
chunk** — 1,757 first-party files recoverable by anyone with `curl` — alongside a CSP that is still
Report-Only: a security posture measurably mid-hardening.

---

## Stack

| Layer | Technology | Anchor · method · confidence | Weighting note |
| --- | --- | --- | --- |
| **Edge / CDN** | Cloudflare (AS13335) across the whole `fountain.com` zone; Cloudflare APO active (`cf-apo-via`) | `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium` | **Fact** — ASN + `server: cloudflare` on every main-zone response is a direct observation, not an inference. |
| **Core app framework** | **Ruby / Rack — Rails-shaped** | `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium` (`x-runtime` + `x-request-id` on `api.`, `internal.`, and unmapped tenant slugs) **×** `deployed-client-bundle: raw/route-table.md · source-map-reassembly · high` (source comments referencing "Rails endpoints" + a `ReviewQuestionnaire::Validator` Ruby class; `/users/sign_in` = Devise) **×** `api: raw/webhooks.md · docs-reconstructed · medium` (webhook event types named `Webhooks::Settings::ApplicantSave` — Ruby `::` module paths) | **Fact.** Three lanes (B, C, A) independently. Lane B is a *direct* source-comment observation and outranks any inference per the tiebreaker. |
| **Microservice fleet framework** | **LoopBack 3/4 (Node.js)** behind `services.fountain.com` | `docs: raw/api-reference.md · crawl-clip · medium-high` + `api: raw/openapi-digest.md · docs-reconstructed · medium` | **Strongly evidenced, single-lane.** Verbatim LoopBack filter grammar (`filter[where][field][eq]=`, `filter[limit]`, `filter[skip]`) identical across all 12 services + LoopBack's autogenerated CRUD doc titles ("find one X", "replace one X which exists or not"). Machine-derived within lane A, so credible — but docs+api are **one source**, so **no promotion to fact**; stated as high-evidence, uncorroborated by an independent lane. |
| **Client SPA** | React + Redux + `redux-saga` + `connected-react-router` (react-router **v5**), webpack/CRA-flavored build; internal app name `recruiter_ui` | `deployed-client-bundle: raw/bundle-map.md · source-map-reassembly · high` | **Fact** (verbatim reassembled source). |
| **Design system** | `@fountain/ripple` + `@fountain/fountain-ui-components` (in-house, "Ripple"), Material-UI as a vendor chunk (3.39 MB) | same anchor · high | Fact. |
| **i18n** | `react-intl` / `formatjs` + a real `translationMessages` layer | same anchor · high | Fact — backs the shipped "Translation Settings" / `custom-terminologies` features rather than being UI chrome. |
| **Realtime** | **Pusher**, 4-region (`ws-{mt1,us2,ap2,eu}.pusher.com`) | `deployed-client-bundle: raw/bundle-map.md · source-map-reassembly · high` (CSP + `REACT_APP_PUSHER_APP_KEY/CLUSTER`) **×** `community: raw/status-page-architecture.md · crawl-clip · medium` (Pusher monitored as a first-class Statuspage component) | **Fact** — lanes B and D independently. No in-house socket layer, no GraphQL subscriptions. |
| **LLM layer (Cue) — *declared* configuration** | Multi-provider LLM config in Cue's shipped client: `llmProvider: enum(openai \| anthropic \| anthropic_direct)` (**default `openai`**) + `llmServiceVersion` + a Bedrock-knowledge-base-shaped field, with declared Anthropic models `us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6` (Bedrock cross-region inference profiles) | `deployed-client-bundle: raw/wx-micro-frontends.md · bundle-string-mine · medium` (verbatim enum in the shipped UMD bundle) | **Fact that the config declares this** — a direct read of a shipped artifact, **single-lane, not promoted a band** (re-graded Mode-5 it. 3, defect E2). **NOT a fact that Cue's production inference runs on Claude** — that stays **tentative**: the schema default is `openai`, no inference call was observed (`write_side_observed: false`), and the apex `anthropic-domain-verification` TXT record is **not** an independent lane for a product-level claim (this doc grades it ambiguous — it sits among internal-tooling SaaS verifications). **Scope:** *Cue* only; not Emma (intent-classifier NLU, below), Anna or Sam. |
| **Agent tool transport** | **MCP** — a live server `data-mcp-production-us-east-1.fountain.com/mcp` (`fountain-data-mcp v1.27.2`, protocol `2025-06-18`), 6 tools over a **Cube.js** semantic layer + **ClickHouse**; client declares 4 MCP base-URL headers (`wx`, `hire`, `data`, `fountain-ai`) | `deployed-client-bundle: raw/wx-micro-frontends.md` §2d · **live unauth read-only probe · high** | **Fact** — a verbatim machine artifact from a direct runtime observation. **Supersedes** this document's earlier "no MCP server is live". **Second server (Mode-5 it. 2):** `mcp.fountain.com/` — `fountain-hire-mcp-server v1.0.0`, **127** JSON-Schema'd tools to an unauthenticated `tools/list`, all tagged `exposeAsMcpTool`; **no tool was invoked**. |
| **Origin cloud** | **AWS** (S3 origin headers on the SPA; AWS Transfer Family at `ups-ftp`; region-coded internal hosts) | `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium` **×** `community: raw/status-page-architecture.md · crawl-clip · medium` (AWS compute monitored in `us-east-1/2`, `ap-south-1`, `eu-central-1`; S3 in 4 regions) | **Fact** — two independent lanes; promoted from infra's own "inference from four converging signals". |
| **Second cloud** | **Azure** — "frontend application and API servers", monitored since 2021 | `community: raw/status-page-architecture.md · crawl-clip · medium` | **Tentative, single-source — but a real finding.** See the multi-cloud reconciliation below. |
| **Infra orchestration** | **DuploCloud** (AWS provisioning SaaS) | `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium` — a `duploservices-prod01-*` S3 bucket in the Vanta trust-center CSP | **Tentative.** One naming-convention tell, single lane. |
| **Object storage** | S3 fleet: `onboardiq-secure-{us-west-1,eu-west-1,ap-southeast-1,sa-east-1}` + `pr-onboardiq-secure-*` + `fountain-applicant-uploads` | `deployed-client-bundle: raw/bundle-map.md · source-map-reassembly · high` (CSP) **×** `infra: raw/sub-processors.md · dns-ct-fingerprint · medium` | **Fact.** Regionally sharded for data residency of candidate onboarding documents. |
| **Feature flags** | **LaunchDarkly** (50 flag keys, 3 client-side env IDs) **+** 27 `whoami.*_enabled` server-issued tenant gates **+** PostHog app-wide | `deployed-client-bundle: _shared/feature-flags.md · source-map-reassembly · high`; self-hosted **LD relay proxies** in 4 regions (`ld-production-{aps1,euc1,use1,use2}`) `infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium` | Flag inventory = fact (verbatim source). The relay-proxy fleet is lane C, single-source but a resolving-host observation → credible. |
| **Embedded BI** | **Looker** | `deployed-client-bundle: _shared/feature-flags.md · source-map-reassembly · high` (`looker_custom_reports_enabled`) | Fact for presence; the Analytics Dashboard route (`/analytics_dashboard/:dashboardId?`) is the surface. |
| **APM / RUM / analytics** | Datadog RUM, FullStory, PostHog, Google Analytics, Heap, Appcues | `deployed-client-bundle: raw/bundle-map.md · source-map-reassembly · high` (CSP + wired source) **×** `infra: raw/sub-processors.md · dns-ct-fingerprint · medium` | Fact (two lanes, same CSP artifact for some rows — treated as one source where so; presence is not in doubt). |
| **Email / DNS ops** | Google Workspace (MX + SPF); Cloudflare DNS (`ernest`/`dee`.ns.cloudflare.com) | `infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium` | **Well-evidenced, single-lane — stated at `medium`, not "Fact"** *(re-graded Mode-5 it. 3, defect E8b: a direct MX/NS read is a strong observation, but one dimension reading one artifact does not promote a band).* |
| **Docs portal** | ReadMe.io, hosted on Render.com (**the vendor's** infra, not Fountain's) | `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium` | **Well-evidenced, single-lane — `medium`** *(re-graded it. 3, defect E8b)*. It remains an explicit correction of a naive "Fountain runs on Render" read, and a direct header observation outranks that inference — but it is one lane, so it is not stated as fact. |
| **Blog / trust / privacy / support** | WordPress on WP Engine (`/blog` path only); Vanta (`trust.`); Transcend (`privacy.`); Intercom Help Center + **Fin AI** (`support.`/`help.`) | `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium` **×** `docs: raw/help-center.md · crawl-clip · low` (Intercom/Fin) | Fact for vendor identity (header/CSP-derived). **Fin is the help-center chat AI; the "Emma = Fin" hypothesis is weakly supported at most** (it. 2 reconciliation — see below). |
| **Published client SDKs** | **None, in any language** | **Primary:** `packages: raw/registry-sweep.json · registry-metadata · high` — 23 npm + 14 PyPI direct GETs, every hit disambiguated as a namesake. **Supporting (not independent):** `docs: _summary.md · crawl-clip · medium-high`, zero SDK mentions across the index (described as ~185–200 titles by `packages`, 593–594 pages by `docs`/`api` — one artifact, a range). Basis aligned across all four rollups, Mode-5 it. 2. | **Fact.** REST + curl only. |
| **Public source presence** | **None** | `codebase: _summary.md · inferred · high` (`github.com/Fountain` is a verified namesake — org created 2009-03-17, five years pre-founding; three alternate slugs 404) | **Fact** (corroborated absence: 4-slug sweep + marketing-site silence). |
| **Downloadable / native client** | **None shipped publicly** — no iOS, Android, extension, or installable PWA | `distribution-artifacts: raw/store-and-pwa-sweep.md · binary-extract · high` (4-surface sweep; manifest/`sw.js` 200s proven SPA-catch-all false positives by content-type) | Fact for *public distribution* — **but see the flagged conflict with the bundle's mobile-app route comment.** |

---

## Architecture

### 1. Two backend generations behind one brand (the load-bearing shape)

Fountain does not run one backend. It runs (at least) two independently-built generations, and the docs
corpus shows them as two *separately generated* OpenAPI documents, not one
(`api: raw/openapi-digest.md · docs-reconstructed · medium`):

| | **Generation 1 — "Hire" (legacy)** | **Generation 2 — "Fountain One" / Worker Experience** |
| --- | --- | --- |
| OpenAPI `info.title` | `Hire Public API`, v2, OpenAPI 3.0.1 | `Worker Experience Public API`, v1.0.0, OpenAPI 3.0.3 |
| Framework tell | Rails/Rack (`x-runtime`, Devise `/users/sign_in`, `Webhooks::Settings::*` Ruby module paths) | LoopBack (`filter[where][field][eq]`, autogenerated CRUD titles) |
| Declared server | `api.fountain.com` | `services.fountain.com` |
| Auth | `X-ACCESS-TOKEN` static API key (Primary + Secondary pair) | OAuth2 `client_credentials` → 60-min Bearer |
| Success envelope | flat resource JSON | JSON:API-flavored `{data, meta}` — `meta` carries `timestamp/verb/path/jti/rid/count/status/duration/size` |
| Error envelope | `{"error":{"msg","name"}}` | JSON:API array `[{rid,status,code,title,detail,meta}]` |
| Pagination | page-number **and** cursor on the same endpoint | LoopBack offset (`filter[limit]`/`filter[skip]`) + sibling `/count` endpoints |
| Rate limit | documented 120 req/min, doublable via the secondary key, `X-Api-Ratelimit-*` headers | **undocumented for all 12 services** |
| Deprecation signal | RFC 8594 `Sunset:`/`Link:` headers | none observed |

*(all rows: `api: raw/rate-limits-and-pagination.md` + `raw/openapi-digest.md` · docs-reconstructed ·
medium; the sampled per-operation fragments within those pages are verbatim generator output, which is
what makes the envelope/auth rows credible despite the dimension's overall `docs-reconstructed` grade.)*

A **third, narrower** surface exists: a partner-scoped `v1` API on `partners.fountain.com`
(`/v1/partners/{id}/applicants/{applicant_id}/...`), separate from both
(`docs: raw/integrations-partners.md · crawl-clip · medium-high`; **not independently crawled this run** —
recorded gap in both `docs` and `api`).

**The 12 *documented* microservices — but at least 19 exist** (`docs: raw/doc-map.md` + `api:
raw/endpoint-catalog.md` · one source · medium-high / medium), with the published endpoint counts that
make the *product* shape legible:
`serviceattendance` (81) · `serviceworkforce` (77) · `serviceorganizations` (60) · `servicetodo` (57) ·
`servicepulse` (43) · `serviceemployment` (39) · `servicepool` (28) · `servicemedia` (19) ·
`servicesecurity` (16) · `servicecompliancev2` (16) · `servicereferral` (14) · `servicestaff` (11) —
plus Hire v2 (108) and a 6-endpoint `hire-api-v2-misc` family. **Count divergence, reported as a range,
not a conflict:** lane A reports the index at 593 (`docs`) vs 594 links / 575 endpoint operations (`api`)
— one source read twice, so **~575 endpoint operations across ~593–594 indexed pages**, never
corroboration. The **12-vs-13 "`service*` microservices" slip is resolved, not left as a range**
(reconciled in `data-model-api-surface.md` §Count reconciliation): there are **12 Worker-Experience
microservices** plus a **13th `service*`-shaped gateway prefix, `servicehire`**
(`services.fountain.com/api/servicehire/v2/...`), which fronts the legacy Hire monolith rather than being
a microservice. `api`'s prose count of 13 and its own 12-row table are each right about different things.

> **The fleet is larger than the docs say — seven client-only services (Mode-5 it. 1, propagated it. 2).**
> The shipped `wx-navbar` / `wx-copilot` micro-frontends embed generated OpenAPI clients calling **466
> `/api/service*` paths across 15 families**, of which **seven appear in no documentation**:
> `serviceauthorization` (27 paths — roles, permissions, matrices, role templates, an `is-authorized`
> check, a self-serve `kybStatus`), `serviceintegrations` (26 — data pipelines, mappings, SCIM,
> automations), `servicesupport` (18), `servicemessaging` (5), `servicescheduler` (3),
> `servicesegmentation` (3), `servicecommunicate` (3). So the fleet is **≥19 `service*` families**, not
> 12. For the eight families both lanes see, live counts diverge in **both** directions
> (`servicesecurity` 16→113, `serviceorganizations` 60→121, `servicepool` 28→50; `servicetodo` 57→12,
> `serviceworkforce` 77→57) (`deployed-client-bundle: _shared/api-path-catalog.md` §Addendum ·
> `bundle-string-mine` · medium; full per-family table and the three readings in
> `data-model-api-surface.md` §Spine 2). **Architecturally the most consequential of the seven is
> `serviceauthorization`:** a real RBAC service the published API does not expose at all, which is the
> concrete mechanism behind the app-vs-API authorization asymmetry noted below.
>
> Architecturally the service split is a real product-shape signal, not just plumbing: the legacy Hire
> ATS is **108 of the 575 documented endpoints — under a quarter of the documented platform** — while
> `serviceattendance` alone (81 endpoints, WFM/timesheets/shifts) is three-quarters the size of the whole
> ATS surface in one service, and `servicepulse` (engagement surveys), `servicepool` (talent CRM + vector
> job-matching) and `servicereferral` have no ATS analogue at all (`docs: _summary.md · crawl-clip ·
> medium-high`). *(Wording corrected it. 2: two sibling docs previously asserted "81 … larger than …
> 108", which is false; the ratio 108 : 467 is the real, and stronger, finding.)* Detail belongs in
> `product-features.md`; noted here because the service topology *is* the product topology.

### 2. The two-host split — the published API is not the API the app runs on

The strongest cross-lane finding in the run, because the two lanes are genuinely independent:

| | **Published developer API** | **App's own API** |
| --- | --- | --- |
| Host | `services.fountain.com` (gateway) | `web.fountain.com` — **same origin as the SPA** (`monolithOrigin`) — **plus** the injected `wxServiceBaseUrl` origin the WX micro-frontends mount against |
| Paths | `/api/<serviceName>/...` + legacy `/v2/...` | `/internal_api/*` (267) + `/api_self_serve/{v1,v2}` (33) + `/api/service*/*` (**466**, WX tier) |
| Size | 575 documented endpoints | **766 unique paths** — 300 / 358 method+path pairs (recruiter console) **+ 466** (WX service-tier, Mode-5 it. 1) |
| Auth | OAuth2 bearer / `X-ACCESS-TOKEN` | dual-tier JWT (`token_employer_*` / `token_enterprise_*`) |
| Anchor | `api: raw/endpoint-catalog.md · docs-reconstructed · medium` | `deployed-client-bundle: _shared/api-path-catalog.md · source-map-reassembly · **high**` (extracted from the *generated* API client `npm.api-clients.*.js`, not from usage sites) |

The two sets are **near-disjoint on the recruiter-console lane** (`api:
raw/published-vs-app-own-note.md`). Whole app subsystems have **no published equivalent at all**:
sourcing/ad-spend (52 paths), the chatbot/FAQ-bot admin surface (29), the workflow editor (28), the
agent-integration namespace (11), approval rules (4+8), the AI workflow builder (2) — and, from the WX
lane, the **27-path `serviceauthorization` RBAC service** (it. 2). **Scoping correction (it. 2):**
"near-disjoint" is a fact about the *recruiter console's* `/internal_api/*` surface, **not** about
Fountain's client tier as a whole — the WX micro-frontends' 466 `/api/service*` paths share the published
surface's path family, and diverge from it by count rather than by shape. **Because both lanes are
independent and both are direct artifact reads, "two parallel API surfaces on two hosts" is a fact**, not
an inference. The path-level diff itself is owned by
`data-model-api-surface.md`; what belongs *here* is the architectural implication: **the published API is
an integration/data-sync contract, not a mirror of the running system** — anyone planning a Fountain
integration is building against a deliberately narrower surface than the product itself uses.

> Caveat on the diff's inputs, stated honestly: the app-own lane came from a **generated client**, not a
> live wire tap (`session` absent). It is complete for whatever the generated client covers — verified
> against the entry bundle's own route/container list with no material gap — but a live session could
> still surface paths the generated client omits.

### 3. Client/server split and the micro-frontend seam

- **The recruiter SPA (`app.fountain.com`)** is a static bundle served from **S3 behind Cloudflare**
  (`x-amz-*` on the shell response — `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium`),
  which calls the Rails monolith cross-subdomain at `web.fountain.com`. 48 chunks: 1 runtime, 1 dedicated
  `runtimeEnvVars` config chunk, a 9.23 MB `main` entry, and **45 `npm.*` vendor chunks named one-per-package**
  — an unusually granular `splitChunks` strategy that reads as a deliberately tuned long-term-caching
  design (`deployed-client-bundle: raw/bundle-map.md · source-map-reassembly · high`).
- **Route topology:** 3 top-level routes (`/landing`, `/ccpa`, `/:accountSlug` catch-all) fanning into
  **~50 nested authenticated routes** under the tenant slug, each recovered with its exact
  feature-flag/RBAC gate (`deployed-client-bundle: raw/route-table.md · source-map-reassembly · high`).
- **A separately-deployed micro-frontend pair.** The "Cue" AI copilot and the nav bar are **not** part of
  the SPA build: they are versioned UMD bundles loaded from `ftn-shared-components.fountain.com`
  (`wx-copilot/v8/release/<channel>/wx-copilot.umd.js`, `wx-navbar` v3), mounted **once outside the
  router** via `<WxCueRootHost/>` and toggled through a shared Zustand store inside the UMD bundle, with
  **per-tenant release-channel pinning** (`stable`/`main`, tenant-overridable) and the *capability* for an
  independent LaunchDarkly project — currently unset, so it falls back to the main app's client-side ID
  (`deployed-client-bundle: raw/route-table.md` + `_shared/feature-flags.md` · source-map-reassembly ·
  high). **Fact** — verbatim from reassembled source, including the internal ticket refs (HRAI-1928/1929).
- **A second candidate-facing client app** exists: `REACT_APP_HIRE_GO_BASE_URL` → `go.fountain.com`
  ("Fountain Go"), gated by a `go_enabled` tenant flag and a `hire-go-enable-live-video-interview` LD flag
  (`deployed-client-bundle: raw/env-config.md` + `_shared/feature-flags.md` · source-map-reassembly ·
  high). Not crawled this run.

### 4. Multi-tenancy — hybrid, not uniform

Four lanes converge, at least three of them independent, so this is **fact**:

- **Subdomain-per-tenant, with the monolith doing Host-header routing.** `app.<tenant>.fountain.com` →
  monolith origin `https://<tenant>.fountain.com`; prod tenant `fountain` → `web.fountain.com`
  (`deployed-client-bundle: raw/route-table.md · source-map-reassembly · high`). Unmapped tenant Hosts
  301-redirect to `www.fountain.com` **carrying the same Rack headers** — i.e. one Ruby origin app fields
  every tenant Host (`infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium`).
- **CT logs name the tenants and their sandbox twins.** 144 unique subdomains recovered via CertSpotter
  (crt.sh 502'd 3×): `aimbridge`, `amazon-na`/`amazon-us`/`ms-amazon-portal`, `brandsafway`, `ceracare`,
  `doordash`, `ontrac`, `staples` — **each with a paired `sandbox.<tenant>`**
  (`infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium`).
- **The largest accounts run on isolated, separately-scheduled deployments.** Statuspage "planned
  downtime" windows name environments outside the shared region pools — `amazon-mm`, `amazon-eu-dsp`,
  `ceracare` (`community: raw/status-page-architecture.md · crawl-clip · medium`) — and the client config
  itself records `aimbridge` as having a dedicated Helm-provisioned "hire cluster"
  (`apps/hire/helm/tenants/aimbridge-na/values.yaml`) while `ups` "runs on shared infra"
  (`deployed-client-bundle: raw/route-table.md · source-map-reassembly · high`). **Two named enterprise
  tenants are baked into client-shipped config and into flag names** (`aimbridge-hiring-goals-improvements`,
  `ups-functionality`; `TENANT_WX_RELEASE_CHANNELS = {aimbridge, ups}`).
- **The gateway is retiring the per-tenant URL model.** Post-consolidation, `services.fountain.com`
  resolves tenancy **from the credential, not the URL**, while every legacy form still works
  (`api: raw/tenant-model.md · docs-reconstructed · medium`).

**Read:** hybrid multi-tenancy — a shared Rails monolith with Host-based tenant routing for the body of
the customer base, plus genuinely isolated deployments for a handful of the largest logistics/hospitality
accounts. That is an operational-cost and roadmap fact worth carrying into any competitive read.

### 5. Auth — two systems, one platform

- **Published API (3 coexisting schemes):** Fountain One OAuth2 `client_credentials` (HTTP Basic
  `client_id:secret` → 60-min bearer, personal-scoped or role-scoped integration keys) · legacy Hire
  `X-ACCESS-TOKEN` static key (Primary + Secondary, *not* deprecated) · a restricted Trusted-Party key
  limited to create-applicant (`api: raw/auth-model.md · docs-reconstructed · medium`).
- **App's own auth (independent lane, higher confidence):** JWTs stored as `token_employer_<stage>` /
  `token_enterprise_<stage>` in **both** localStorage **and** sessionStorage, with the JWT `aud` claim
  (`EnterpriseIdentity`, `SuperUser`) selecting which key is used — two auth *tiers* sharing one token
  shape, disambiguated **client-side** (`deployed-client-bundle: raw/route-table.md ·
  source-map-reassembly · high`). Sign-in is Devise (`/users/sign_in`). A legacy `containers/Auth_old/*`
  still ships alongside the current flow — a mid-migration auth system by its own naming.
- Per the `tradecraft.md` token-location taxonomy this is **token-in-localStorage → XSS-reachable**, which
  is worth naming given the same app ships full production source maps (below). Scope/tenancy expression
  detail belongs in `data-model-api-surface.md`.
- **Unresolved (recorded, not guessed):** the docs show both `Authorization: Bearer` (via
  `securitySchemes.jwt`) and a literal `Application: Bearer` in a worked curl example. Only a live probe
  settles it; `session` was absent (`api: _summary.md` gaps).

### 6. Data/document pipeline and the "OnboardIQ" lineage

Candidate onboarding documents flow into a **regionally-sharded S3 bucket fleet literally named
`onboardiq-secure-*`** (4 regions + a PR/preview bucket) — a codename that appears **nowhere** in
marketing (`deployed-client-bundle: raw/bundle-map.md · source-map-reassembly · high`). Lane A finds the
same lineage three more times, independently: the `X-OBIQ-SIGNATURE-V2` webhook signature header, the
`connecting-a-custom-form-to-the-onboardiq-applicant-portal` doc slug, and the Intercom help-center
workspace id `onboardingiq` (`docs: raw/help-center.md` + `raw/webhooks.md` · crawl-clip · medium-high).
Lane E adds that **Fountain's legal entity is "OnboardIQ, Inc."**, a Delaware corporation
(`website: raw/trust-security-ethics-legal.md · crawl-clip · medium`, WebSearch-secondary with two
third-party corroborations — flagged as secondary in that dimension). **Two independent lanes (B and A)
plus corporate-registry corroboration ⇒ fact: "OnboardIQ" is Fountain's own pre-rebrand identity, still
load-bearing in production infrastructure**, not an acquired third-party product.

### 7. Webhooks and integration transport — four subsystems, one blocking decision-gate

Fountain has no single webhook product; four independently-built notification systems coexist, each with
its own payload shape, signing convention and SLA — Hire Screening/Post-Hire (14 named event types,
HMAC-SHA256 via `X-OBIQ-SIGNATURE-V2`, 2 retries then auto-disable after 10 failures/24 h, 15 documented
static egress IPs) · Automation Webhooks (customer-chosen signing key *or* a custom `Authorization`
header) · Custom Attribute Webhooks (**hard 3-second response SLA**, vs the legacy system's "process
async" advice) · Universal Tasks Webhooks (a third custom-attribute key convention)
(`api: raw/webhooks.md · docs-reconstructed · medium`). The fifth is **not** a webhook: the compliance
**External Processing URL** is a *synchronous* call that Fountain **blocks on**, letting a partner
**override** the auto-approve/manual-review decision after Fountain's own OCR+AI-confidence pipeline has
scored a document — with the docs proactively warning about the fail-open footgun. That is a genuine
architectural seam (a customer-owned decision node inside a compliance state machine), and unusually
candid documentation for a background-screening product.

### 8. Transport, protocol and what is *not* there

REST throughout — **no GraphQL, no gRPC, no tRPC** anywhere across 575 documented endpoints, the **766**
app-own paths (300 recruiter-console + 466 WX service-tier), the reassembled client, or either `wx-*`
micro-frontend (`api: _summary.md · docs-reconstructed · medium` ×
`deployed-client-bundle: _shared/api-path-catalog.md · source-map-reassembly · high` — two independent
lanes, so the negative is solid). Realtime is Pusher only.

**UPDATED (Mode-5 it. 1) — MCP: a live server exists.** This section previously read "**No MCP server is
live**", on the strength of six candidate paths across three hosts all returning genuine 404s, with one
`app.fountain.com` 200 verified as an SPA-shell false positive via a control-path comparison (`api:
raw/tool-catalog.md · docs-reconstructed · medium` — correct §7-rule-10 discipline, and those six 404s
still stand for those hosts). **The negative was scoped wrong, not sloppy:** the real host is discoverable
only from the `wx-copilot` client bundle's per-tenant `dataMcpBaseUrl` map. A read-only unauthenticated
probe confirmed **`data-mcp-production-us-east-1.fountain.com/mcp`** — `fountain-data-mcp v1.27.2`,
protocol `2025-06-18`, **6 JSON-Schema'd tools** wrapping a **Cube.js** semantic layer over **ClickHouse**
(`list_cubes`, `get_cube_detail`, `execute_cube_sql_v2`, `execute_raw_sql`, `query_dataset`,
`list_datasets`) (`deployed-client-bundle: raw/wx-micro-frontends.md` §2d · **live probe · high**).
Direct observation outranks the earlier inference per `evaluation.md`'s tiebreaker. **Scope held
honestly:** this is an **internal analytics / NL-to-SQL server for Cue**, not a demonstrated
customer-facing agent API — the client declares three further MCP hosts (`wx`, `hire`, `fountain-ai`)
that were not probed. Architecturally the notable part is `execute_raw_sql`'s own `product` docstring,
which routes `"hire"` to a **`FDEPLOY_RULES`** ClickHouse database and all WX products to
**`FDEPLOY_RULES_WX`** — a third independent lane confirming the Hire-vs-Worker-Experience split.

---

## The AI/agent layer — what the architecture actually supports

Treated separately because it is the run's most contested claim and the one most exposed to the
write-side cap. **What follows is what the *plumbing* shows; no agent was ever executed or observed.**

**Confirmed to exist (fact — lanes B and A independently):**

| Surface | Evidence |
| --- | --- |
| Dedicated AI/agent **frontend** surfaces | routes `/fountain_ai` (`ChatAgent`, gated `whoami.cai_agent_enabled`), `/ai_interviewers` (`AIInterviewersManagement`), `/openings/:funnelSlug/ai_workflow_builder` (gated `whoami.ai_workflow_builder_enabled`), `/chatbot` (+`/chatbot/upsell`) — `deployed-client-bundle: raw/route-table.md · source-map-reassembly · high` |
| Dedicated AI **API namespaces** | `/internal_api/ai_builder/workflow/{chat,get_latest_message}`; `/internal_api/agent_integrations/agent/*` (11 paths incl. `create_rx_agent`, `create_rx_thread_and_signature`, `fetch_access_token`, `publish_chat_agent`, `conversation_report`, `wx_i9_bot_thread_signature`); `/internal_api/chatbot/*` (29 paths) — `deployed-client-bundle: _shared/api-path-catalog.md · source-map-reassembly · high` |
| A **Copilot authoring lifecycle** on the backend | `servicetodo`: `createForCopilot → cloneForCopilot → publishForCopilot → applyTestChangesToDraftForCopilot → deleteForCopilot`; `servicepool`: Copilot-generated audiences; `serviceorganizations`: a dedicated **`copilotAuditLogs`** resource — `docs: raw/api-reference.md · crawl-clip · medium-high` + `api: _summary.md · docs-reconstructed · medium` (one lane) |
| An **AI document classifier** + OCR/auto-approval pipeline | `servicecompliancev2`: `post_api-servicecompliancev2-ai-documenttypes`; glare/focus detection, AI confidence score, auto-approval logic with the synchronous partner override — same lane |
| **Vector-similarity matching** | `servicepool`: `GET .../talents/{id}/jobmatches` — "based on aggregate vector match" — same lane |
| **10 tenant-level AI capability gates** | `fountain_ai_enabled`, `cai_agent_enabled`, `ai_workflow_builder_enabled`, `is_faq_bot_enabled`, `chatbot_automated_response_enabled`, `fountain_ai_career_site_enabled`, `fountain_ai_upsell_enabled`, … — `deployed-client-bundle: _shared/feature-flags.md · source-map-reassembly · high` |
| An **AI-native docs/tooling posture** | an `exposeAsMcpTool` OpenAPI tag baked into the build pipeline (10/36 stratified Hire-v2 sample = 28%, curated onto core-entity primary ops: Applicants, Locations, Positions, Funnels) + a genuine `.well-known/agent-skills/index.json` (`schemas.agentskills.io/discovery/0.2.0`) — `api: raw/tool-catalog.md` + `docs: raw/agent-skill-manifest.md` (one lane, verbatim JSON) |

**The one genuinely promotable *mechanism* finding — the chatbot layer is intent-classification NLU, not
(only) an LLM.** Two independent lanes agree:

- Lane B (high): the chatbot API is **intent- and model-name-scoped** — `automated_response_models`,
  `automated_responses/get_intents_with_bot_reply/{model_name}`, `automated_responses/update_intent/{faqbot_log_id}`,
  `chatbot_logs/intents` (`deployed-client-bundle: _shared/api-path-catalog.md · source-map-reassembly · high`).
  That is the canonical shape of a trained intent-classifier with per-tenant models and human intent
  correction — not a prompt-completion API.
- Lane C (medium): **`euw3-ms-nlu.internal.fountain.com`** — an in-house **NLU microservice** on AWS
  eu-west-3, confirmed resolving and confirmed *not* a DNS-wildcard artifact via a nonsense-subdomain
  control probe (`infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium`).
- Lineage context (lane E, secondary/low): the **June 2023 acquisition of Clevy**, "an international
  provider of AI conversational technologies" (`website: raw/ai-agents-and-cue.md · crawl-clip · medium`,
  WebSearch-secondary) — consistent with an in-house NLU stack predating the 2026 "agentic" rebrand.

⇒ **Fact: at least part of Fountain's AI surface is a classic, in-house, per-tenant intent-classification
NLU system.** This does not mean *all* of it is.

**The Anthropic signal — UPDATED (Mode-5 it. 1), RE-GRADED (Mode-5 it. 3, defect E2).** This paragraph
originally read **"org-level fact, product-level unconfirmed"**; iteration 1 promoted it to a flat
product-level fact ("Cue runs on Claude"). **Iteration 3 splits it back into the two claims it always
was**, because the promotion rested on a lane this same document disqualifies two paragraphs earlier.

- **Lane B (`deployed-client-bundle`, medium, the load-bearing lane):** the shipped `wx-copilot.umd.js`
  carries a verbatim model-selection enum — **`us.anthropic.claude-opus-4-6-v1`** and
  **`us.anthropic.claude-sonnet-4-6`** — where the `us.anthropic.*` prefix is the exact **AWS Bedrock
  cross-region inference-profile** naming convention, alongside `customPrompt`, a strictness enum
  (`strict|relaxed|custom`), an `llmProvider: enum(["openai","anthropic","anthropic_direct"])`
  (default `"openai"`), an `llmServiceVersion`, and a Bedrock-knowledge-base-shaped field
  (`deployed-client-bundle: raw/wx-micro-frontends.md` §2c · bundle-string-mine · medium).
- **Lane C (`infra`, medium) — NOT an independent lane for the product-level claim.** The apex zone
  carries an `anthropic-domain-verification-*` TXT record among 21 verification/SPF entries
  (`infra: raw/dns-and-subdomains.md` + `raw/sub-processors.md` · dns-ct-fingerprint · medium). This
  document already grades that record **ambiguous**, because it sits in a block of **internal-tooling
  SaaS verifications** alongside Cursor, Linear, Notion, Miro, 1Password, Atlassian and Rippling — so
  what it evidences is **"Fountain holds an Anthropic account"** (an org-level fact), *not* "Cue's
  inference runs on Claude". **A lane cannot be disqualified in one paragraph and counted as
  corroboration in the next**; it is recorded here as consistent context, and it does **not** promote.

**The two claims, graded separately:**

| Claim | Grade | Basis |
| --- | --- | --- |
| **Cue's shipped client *declares* Claude Opus 4.6 / Sonnet 4.6 via AWS Bedrock**, inside multi-provider LLM configuration that also wires OpenAI and the Anthropic direct API | **Fact** — a *declared configuration* read verbatim from production client code | Lane B alone: a direct read of a shipped artifact. **Single-lane, capped at its source confidence** (`bundle-string-mine · medium` for the mine; the literal itself is verbatim). Not promoted a band — no second independent lane exists. |
| **Cue's production inference *runs on* Claude** | **Tentative — explicitly NOT promoted to fact** | Would require observing an inference call. The schema's **default provider is `openai`**; `write_side_observed: false`, so no agent was seen producing output; and lane C evidences an org relationship, not a request path. |

So the residual unknown is **which provider actually serves a given production request** — and, strictly,
*whether the declared config is the one production runs*. What is settled is that **real, multi-provider
LLM orchestration is configured in Cue's shipped client, with Claude-on-Bedrock as the named
non-default option** — which is enough to retire "it's a relabeled rules engine" for Cue, and is a
weaker claim than "Cue runs on Claude."

**Three scope limits, so this does not over-swing:**

1. **It does not extend to Emma.** The FAQ-bot surface is a separate subsystem with its own,
   independently-evidenced mechanism — `automated_response_models` /
   `get_intents_with_bot_reply/{model_name}` / `chatbot_logs/intents` (lane B) plus
   `euw3-ms-nlu.internal.fountain.com` (lane C) — i.e. **intent classification with per-tenant trained
   models**, unchanged by this finding. Anna and Sam remain unconfirmed either way.
2. **The earlier grep negative was correct and stays on the record:** *no* `anthropic`/`claude`/`openai`/
   `bedrock` literal exists in the **1,757 reassembled first-party files of the main `recruiter_ui`
   bundle**. The literals live in a **different artifact** — the separately-built, separately-deployed
   `wx-copilot` UMD micro-frontend, which the original pass never fetched. The negative was scoped to the
   wrong bundle, not wrong about the bundle it scanned.
3. **Nothing is disclosed publicly.** No LLM vendor is named on any marketing, security, ethical-AI or
   trust page (`website: raw/trust-security-ethics-legal.md · crawl-clip · medium`). That remains a real
   *disclosure* finding — it is now "undisclosed to customers", no longer "unknown to this recon".

Adjacent and independent: `browserbase.com` + `*.onkernel.com` (agent-sandbox / headless-browser-for-agents
vendors) appear in the trust-center CSP `frame-src` — a real agentic-tooling signal, still unattributed to
a specific product feature.

**Inference (not fact), flagged as such:** the `agent_integrations/agent/{fetch_access_token,
thread_signature, create_rx_thread_and_signature}` naming is the shape of a **brokered client-side
integration with an external hosted agent service** (fetch a scoped token, sign a thread, then talk to the
vendor directly) rather than a purely in-house server-side orchestrator. Path names are observed at high
confidence; **this reading of them is an inference from naming convention and is single-lane.**

**What cannot be concluded, and why (the write-side cap, applied once):** with `write_side_observed:
false`, **no dimension in this run observed an agent produce output.** So "Anna screens candidates by
voice", "Cue autonomously orchestrates multi-agent workflows", "Emma answers 24/7 across four channels"
remain **marketing claims with real backing infrastructure and unverified execution semantics**. The
honest formulation this run supports: *Fountain has built dedicated, separately-deployed, audited,
feature-gated AI infrastructure — a micro-frontend copilot, an agent-integration namespace, an
AI-change audit log, a vector matcher, a document classifier and an in-house intent NLU — which is
materially more than a rules engine wearing an "agentic" label.* **UPDATED (Mode-5 it. 1, re-graded
it. 3):** the trailing clause of that formulation — *"whether the reasoning layer on top is an LLM, and
whose, is unresolved"* — is **half-resolved for Cue**: *that* a real multi-provider LLM layer exists is
settled (declared config + a live MCP tool server); *whose model serves production* is **not** — the
client declares Claude Opus 4.6 / Sonnet 4.6 via AWS Bedrock while the schema's own default is `openai`,
and no inference call was observed. What the write-side cap still withholds is **behaviour**, not the
existence of the **mechanism**: no agent was seen producing output, so quality, autonomy and the
marketing performance claims stay unverified — and Anna / Emma / Sam keep their own, separately-evidenced (and for Emma,
non-LLM) mechanisms.

> **Open naming ambiguities carried forward** (lane E / lane D): Sam ↔ "Fountain Pulse"; Cue ↔ "Fountain
> Copilot" ↔ the `servicetodo` "Copilot" endpoints — **but the Emma↔Fin question is not one of them.**
> *(Reconciled Mode-5 it. 2 down to `product-features.md`'s level, which carries the actual evidence;
> this doc previously held it at "materially open" while its sibling had already graded it "weakly
> supported at most" — a sibling contradiction, not a genuine disagreement.)* **"Emma is Intercom Fin"
> is weakly supported at most.** The single supporting datum is that Fin is present on the **worker help
> center** (`docs: raw/help-center.md · crawl-clip · low`) — Fountain's own support surface, not the
> in-product candidate agent. Against it stand two independent lanes: the app's 29-path first-party
> chatbot admin stack (intents, per-tenant automated-response models, scraped knowledge base — `bundle` ·
> high) and the `euw3-ms-nlu.internal.fountain.com` in-house NLU host (`infra` · medium). The correct
> reading is **Fin on the help center and an in-house intent/NLU stack for Emma**, with the residual
> open question narrowed to *branding* (does the in-product widget reuse the Fin persona?), not
> architecture.

---

## How it's built

- **Repo/source posture:** fully closed. No public org, no SDK, no OSS presence
  (`codebase` + `packages`, both `high`). The one thing that *is* public is unintentional (below).
- **Build:** webpack, CRA-flavored (`internals/webpack/webpack.prod.babel.js` referenced in source),
  per-package vendor chunking (45 named `npm.*` chunks), `NODE_ENV=production`, asset prefix `/80a74d4/`
  (`deployed-client-bundle: raw/bundle-map.md · source-map-reassembly · high`).
- **Runtime config injection by design:** `runtimeEnvVars.js` is deliberately isolated into its own
  `splitChunks` cacheGroup **so ops can swap the file at deploy time without a rebuild** — source-commented
  as such. 21 `REACT_APP_*` fields recovered, values redacted per §7; **no live secret-shaped value
  (`pk_live_`, `sk_live_`, `phc_`, `AIza…`) was found in any fetched chunk — zero hits on a pattern scan**
  (`deployed-client-bundle: raw/env-config.md · source-map-reassembly · high`).
- **Environment fleet:** a `NONPROD_SUBDOMAIN_MAP` naming `faut-01/02/03`, `uat-01`, `dev-01/02`, and
  **100 auto-generated `staging-use-NN` slots** ("standard Dropship domain" convention) in client config
  (lane B, high) — independently corroborated by CT logs showing `staging-use-01`…`-30`, `uat`, `demo`,
  `perf-01`, `wxp-01`–`15` live enough to have been issued certificates (lane C, medium). **Two
  independent lanes ⇒ fact: an unusually large, numbered pre-production fleet** — a release-engineering-heavy
  organization.
- **Release cadence:** bi-weekly release-note roundups (3–10 items each) back to July 2022, self-reported
  at ~4–6 updates/month across Hire/Source/Pool/Shift/Onboard/Referrals/Platform/Hire Go/CRM/AI-agent
  categories, published at **`new.fountain.com` — which is not linked from the main site at all**
  (verified by raw-HTML grep) (`community: raw/changelog-digest.md · crawl-clip · medium`).
- **Reliability baseline:** 39 monitored Statuspage components across 6 groups; 50 incidents over ~8.5
  months (≈5.9/month; 12 of 50 major-or-worse, 2 critical — both in June 2026). "Cue agent service
  disruption" appears 3× in Cue's first live month, then not again in the remaining 2.5-month sample
  (`community: raw/status-page-architecture.md · crawl-clip · medium`).
- **Mid-migration is visible from inside the client** — an independent corroboration of lane A's dated
  consolidation story: `containers/Auth_old/*` beside the live auth flow; `workflow_editor_v2_enabled`
  gating a v2 editor; `/opening_approvals` (legacy) running **side-by-side** with `/approval_rules` during
  cutover (source comment cites ticket AXHE-3945); `hiring-goals-v2`/`-v4` + `hiring_goals_v3_enabled`;
  a component-swap flag (`opening-attributes-management`) choosing new-vs-legacy at runtime
  (`deployed-client-bundle: raw/route-table.md · source-map-reassembly · high`).
- **A production-source disclosure, not a design choice:** every chunk checked (8/8) ships a live
  `sourceMappingURL` resolving to a 200 `.map`. The entry map alone reassembled **1,962 source files,
  1,757 of them first-party** — effectively the complete recruiter SPA source tree, unauthenticated
  (`deployed-client-bundle: raw/route-table.md · source-map-reassembly · high`). It also leaked internal
  ticket IDs (AXHE-3945, HRAI-1928/1929), named enterprise tenants, a "sales demo only" route comment, and
  the internal `staging-use-NN` naming convention. Paired with a **Report-Only (not enforcing) CSP**
  (`infra: raw/security-headers.md · dns-ct-fingerprint · medium`) and `img-src`/`frame-src` left wildcard
  even in the draft policy, the security posture reads as **measurably mid-hardening**: strong preloaded
  HSTS everywhere, Vanta-run compliance automation, but the client tier not yet locked down.
- **Prod-bundle dead weight / demo tooling:** `@testing-library` (98 KB) and `faker-js` (**3.26 MB**) ship
  in the production bundle alongside a `REACT_APP_FAKER_SEED` env var — most likely deliberate
  client-side demo/sandbox data seeding rather than an accident, but 3.26 MB either way (lane B, high).
  The `/sourcing_dashboard` route carries the verbatim comment *"only used for sales demo — not the actual
  dashboard customers use."*

---

## Notable design choices (the ones worth stealing)

1. **A swappable runtime-config chunk.** Isolating `runtimeEnvVars.js` into its own webpack cacheGroup so
   ops can replace one small file per environment/tenant at deploy time — no rebuild, no bake-in — is a
   clean answer to per-tenant SPA configuration (lane B, high).
2. **The copilot as a versioned, release-channelled micro-frontend.** Shipping "Cue" as an independently
   deployed UMD bundle, mounted once outside the router, with **per-tenant release-channel pinning** and
   the capability for its own LaunchDarkly project, lets the AI layer iterate on its own cadence and roll
   out per-account without touching the core app's release train. For anyone bolting an agent onto an
   existing SaaS, this is the pattern to copy (lane B, high).
3. **An audit log scoped specifically to AI-made changes.** `copilotAuditLogs` as a first-class resource
   in `serviceorganizations`, paired with a draft → test → publish → apply lifecycle for Copilot-generated
   task flows, is a governance primitive most "AI features" skip entirely — and it is the single strongest
   architectural argument against the "relabeled rules engine" hypothesis, because nobody builds an audit
   trail for a rules engine's own rules (lane A, medium-high).
4. **A synchronous, customer-overridable decision gate inside a compliance state machine.** The External
   Processing URL — Fountain blocks on the partner's response and lets it override the AI auto-approval
   verdict — is a genuinely well-shaped seam for a regulated workflow, and the docs' explicit fail-open
   warning is the right kind of candour (lane A, medium).
5. **Two-tier gating: rollout flags vs entitlement gates.** 50 LaunchDarkly keys for progressive delivery
   *plus* 27 server-issued `whoami.*_enabled` booleans for tenant entitlement, cleanly separated, with
   **self-hosted LD relay proxies in 4 regions** so flag evaluation doesn't take a transatlantic hop
   (lane B high × lane C medium).
6. **Agent-readiness baked into the API build pipeline — and MCP already running in production.** An
   `exposeAsMcpTool` OpenAPI tag curated onto exactly the core-entity primary operations (Applicants,
   Locations, Positions, Funnels) and deliberately *excluding* sub-resource/process ops, plus a served
   `.well-known/agent-skills` discovery manifest (lane A, medium) — **and, confirmed by direct probe, a
   live production MCP server** (`fountain-data-mcp v1.27.2`) exposing a Cube.js/ClickHouse analytics
   toolset to Cue, with the client wired for four MCP hosts (lane B / live probe, high). The
   architecturally interesting choice is what they made agent-callable *first*: **not** the CRUD API, but
   a **semantic-layer + SQL analytics surface with server-side dataset caching so "no row data enters the
   calling context"** — i.e. the agent queries a governed semantic model rather than the raw domain API.
   That is the pattern to copy.

---

## Cross-dimension reconciliation

| # | Question | Verdict | Basis |
| --- | --- | --- | --- |
| **1** | **Rails or LoopBack?** `bundle`+`infra` say Rack/Rails; `docs`+`api` say LoopBack. | **Not a conflict — two coexisting backend generations.** Rails is the **Hire monolith** serving `web.fountain.com` / `api.fountain.com` / every tenant Host, and therefore also the app's own `/internal_api` + `/api_self_serve` surface. LoopBack is the **Fountain One / Worker Experience microservice fleet** behind `services.fountain.com`. The docs corpus itself distinguishes them as **two separately generated OpenAPI documents** with different `info.title`, security scheme, envelope, pagination and error shape. | Rails: lane B (source comments + Devise path, high) × lane C (`x-runtime`/`x-request-id`, medium) × lane A (`Webhooks::Settings::*` Ruby module paths, medium) ⇒ **fact**. LoopBack: lane A only (filter grammar + autogenerated titles, machine-derived) ⇒ **strongly evidenced, uncorroborated by an independent lane**, stated as such. |
| **2** | **One cloud or two?** `infra` concludes AWS from four converging signals; `community` finds **Azure** ("frontend application and API servers") monitored since 2021 alongside AWS. | **Not a conflict — both are real; it is a genuine multi-cloud footprint, most likely a legacy Azure tier alongside an AWS build-out.** Timing supports this: the Azure components date to 2021, while the AWS compute components were **all added in one batch on 2025-10-20**. `infra`'s method (DNS + headers behind Cloudflare) structurally *cannot* see a second origin cloud, so its AWS-only read is a limit of the method, not a refutation. | AWS: lane C × lane D ⇒ **fact**. Azure: lane D only, but from a first-party machine artifact (Statuspage JSON API) ⇒ **tentative-but-credible**; flagged as the highest-value cheap follow-up for a re-run. |
| **3** | **Does a Fountain mobile app exist?** `distribution-artifacts` proves a clean 4-surface negative; the `bundle` route table carries a verbatim source comment: *"LEGACY route, DO NOT REMOVE — used only for Fountain Mobile App homepage (w/ Tasks) and Settings, only accessible by GlobalDrawer in mobile app."* | **FLAGGED — genuine tension, both sides are direct observations of *different things*.** Most probable reconciliation: the comment refers to a **retired, unlisted, or MDM/enterprise-distributed** client, or to a webview surface of the separate **"Fountain Go"** app (`go.fountain.com`, `go_enabled` flag, `hire-go-enable-live-video-interview`) which `distribution-artifacts` did not search for by that name. **No lane resolves it**; the "mobile-first" marketing claim is safest read as responsive mobile web. | `distribution-artifacts: raw/store-and-pwa-sweep.md · binary-extract · high` vs `deployed-client-bundle: raw/route-table.md · source-map-reassembly · high`. Equal method confidence, no tiebreaker applies ⇒ flagged, not resolved. |
| **4** | **Is the published API a mirror of the product?** | **No — fact.** Two independent lanes, near-disjoint path sets, whole app subsystems (sourcing spend, chatbot admin, workflow editor, agent integrations, AI builder) with **no published equivalent at all**. | lane A (medium) × lane B (**high**) ⇒ fact. Path-level diff owned by `data-model-api-surface.md`. |
| **5** | **Are the AI agents real infrastructure or a relabel?** | **UPDATED (it. 1), RE-GRADED (it. 3, defect E2). Real dedicated infrastructure — fact. Cue's LLM layer exists and is multi-provider — fact. *Which* model serves production — tentative. Autonomy and the other agents — still open.** Existence/wiring/gating corroborated by lanes A and B independently. **Cue:** the `wx-copilot` bundle's verbatim `us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6` (Bedrock) enum + multi-provider `llmProvider` schema (lane B, a direct artifact read) ⇒ **a declared Claude-on-Bedrock configuration, fact**; a live `fountain-data-mcp` MCP tool server corroborates the agentic plumbing by direct probe. **"Cue runs on Claude" is NOT promoted** — the schema default is `openai`, no inference was observed, and the apex `anthropic-domain-verification` TXT is an org-level signal this doc itself grades ambiguous, so it is not an independent lane for a product-level claim. **Emma:** lanes B+C still positively identify **in-house intent-classification NLU**, not an LLM — a *different subsystem*, unchanged. **Anna / Sam:** unconfirmed either way. **Autonomy** remains capped tentative (`write_side_observed: false`; the API shape is draft→test→human-publish). | Existence: lane B (high) × lane A (medium-high) ⇒ fact. Cue's declared config: lane B alone (medium), **single-lane, not promoted**. Which provider runs: **unobserved ⇒ tentative**. Execution *behaviour*: still capped per the write-side cap. |
| **6** | **How many published endpoints / microservices?** `docs` 593 pages / 12 services; `api` 594 links, 575 endpoints, prose says "13" but its table names 12. | **Page counts: a reported range, not a conflict** — docs and api mine the *same artifact*, so **~575 endpoint operations across ~593–594 indexed reference pages**. **Service count: resolved** — **12 Worker-Experience microservices + a 13th gateway prefix `servicehire`** fronting the legacy Hire monolith; both lane-A numbers are right about different things (full working in `data-model-api-surface.md` §Count reconciliation). | `evaluation.md` "same artifact ⇒ one source" for the page counts; the service count is settled by a direct path observation (`services.fountain.com/api/servicehire/v2/...`), which outranks the prose slip. |
| **7** | **"Fountain runs on Render.com"** (a plausible misread of Discovery's header finding). | **Refuted.** `x-render-origin-server: Render` appears only on `developer.` / `partners.` — **ReadMe.io's** own hosting choice for the docs portal it operates as a vendor. Fountain's own origins are S3 + the Rack app. | `infra: raw/cloud-cdn-fingerprint.md · dns-ct-fingerprint · medium` — a direct observation correcting an inference. Recorded so no later dimension re-trusts it. |
| **8** | **Coverage honesty: is the app-own path count a floor or a ceiling?** | **A floor — and Mode-5 proved it empirically.** The 300 paths come from a *generated client*, complete for what that client covers but silent on anything reached by hand-written call sites — one such path was already found outside it (`${REACT_APP_GLOBAL_API_BASE_URL_V2}/jobs/{jobId}/stages`). **Iteration 1 then raised the count to 766 (+155%) with two unauthenticated GETs** of the `wx-*` micro-frontends, and **iteration 2's MCP probe surfaced a whole `/api/go/*` family absent from both catalogs.** Still unfetched: lazy route chunks (incl. the WorkflowEditor's 525 files), 44 of 48 vendor chunks — notably `npm.fountain.*` (772 KB, Fountain's own internal package) — and the WX product SPAs. | `deployed-client-bundle: _summary.md` gaps · high, + `raw/wx-micro-frontends.md`. Recorded as a bounded gap per ingestion §8, not a completeness claim. |
| **9** | **A sibling dimension deviated from its dispatch brief.** `api` was told to append to `_shared/api-path-catalog.md` but declined, citing ingestion §6's contributor allowlist (`bundle`/`session`/`wire`/`distribution` only) and left a citation instead. | **The deviation was correct and is endorsed here.** `api` is a published/non-runtime-observed surface; appending would have forked the seam and made the published-vs-app-own diff read as corroboration between two views of different artifacts. The shared catalog correctly carries exactly one `## source: bundle` section. | `api: _summary.md` "Deviation from the dispatch brief" · flagged for Evaluation, reviewed, upheld. |

**Dimensions that contributed nothing to this rollup, and why (absences are findings):** `session`
(absent — `auth:none`, batch default, user unreachable to authorize), `wire-capture` (folded into
`session`), `codebase` (absent — verified namesake org), `packages` (present but its finding *is* an
absence: no SDK exists). No dimension was silently dropped.

---

## Open questions

1. **Is the Azure tier live production or legacy?** Single-source (Statuspage). The cheapest highest-value
   follow-up in the whole run — it changes the cloud story from "AWS" to "AWS + a 2021-era Azure tier".
2. **Is any customer-facing agent actually LLM-backed, and by whom?** — **PARTLY ANSWERED for Cue
   (it. 1; re-graded it. 3).** *Backed by an LLM layer:* yes — the client declares
   `us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6` via AWS Bedrock inside a
   multi-provider (`openai`/`anthropic`/`anthropic_direct`) config schema. *By whom, in production:*
   **still open** — a declared configuration is not an observed inference call, and the schema's own
   default is `openai`. **Also still open:**
   (a) which provider serves a given production request (the schema defaults to `openai`); (b) **Anna** and
   **Sam** (unconfirmed); (c) **Emma**, whose evidence points the *other* way (in-house intent NLU). Would
   close with one read-only authenticated Pass-1 session watching
   `/internal_api/ai_builder/workflow/chat` and `/internal_api/agent_integrations/agent/fetch_access_token`.
   Note the literals sit in the `wx-copilot` UMD bundle, **not** in the 1,757 reassembled `recruiter_ui`
   files — the original grep negative was scoped to a different artifact and remains true of it.
2a. ~~**(it. 1) Are the other three declared MCP hosts live?**~~ **ANSWERED (Mode-5 it. 2): one of three
   is, and it is the important one.** `x-hire-mcp-base-url` resolves to **`https://mcp.fountain.com/`** —
   a live `fountain-hire-mcp-server v1.0.0` that returns **127 fully JSON-Schema'd tools to an
   unauthenticated `tools/list`**, every one tagged `exposeAsMcpTool`. So yes: the customer-facing agent
   API the tag implied is running in production. It also exposes a **previously-uncataloged `/api/go/*`
   ("Hire Go") API family** — 56 of the 127 tools. `x-wx-mcp-base-url` and `x-fountain-ai-mcp-base-url`
   were **not located** (16-candidate DNS sweep, all NXDOMAIN; CT enumeration is blind here because
   Fountain serves a wildcard `*.fountain.com` cert). Absence is scoped to the names probed. Full
   transcript and scope caveats: `data-model-api-surface.md` §MCP; **no tool was invoked.**
3. **Is "Emma" Intercom Fin under a custom persona?** **Narrowed to a branding question (it. 2), not an
   architecture one** — see the ambiguities note above: Fin is confirmed on the *help center* only, while
   two independent lanes (the 29-path first-party chatbot admin stack + the in-house NLU host) point to
   an in-house intent/NLU Emma. **Weakly supported at most.** Resolvable by inspecting the live
   in-product support widget's branding and network calls.
4. **What is `agent_integrations/agent/create_rx_agent` / `fetch_access_token` brokering?** The naming
   suggests an external hosted agent vendor ("Rx"), unidentified.
5. **Does `npm.fountain.*` (772 KB, Fountain's own internal shared package, confirmed source-mappable)
   hold additional API/flag/architecture signal?** Not reassembled — the single highest-yield remaining
   bundle-lane action.
6. ~~**Do the ~537 `service*` doc pages carry embedded OpenAPI fragments like the v2 pages do?**~~
   **ANSWERED (Mode-5 it. 2): they do.** Five pages from five *different* families
   (`serviceattendance`, `servicepulse`, `servicetodo`, `serviceorganizations`, `servicepool`) were
   fetched raw — **5/5 embed a complete OpenAPI 3.0.3 per-operation fragment**, each declaring
   `"Worker Experience Public API" v1.0.0` / `servers: services.fountain.com` / `securitySchemes.jwt =
   http bearer`, identical to the two `serviceworkforce` pages already sampled (**7 of 12 families now
   confirmed**). Stated honestly: this raises lane A's method **ceiling** for the 467-page family to
   `openapi-verbatim`-on-demand (one GET per operation), not the current grade — 46 of 575 pages have
   actually been fetched. `exposeAsMcpTool` was **absent from all five**, corroborating its Hire-only
   scope.
7. **`Authorization: Bearer` vs the docs' literal `Application: Bearer`** — unresolvable without a live
   authenticated probe.
8. **Rate limits for all 12 documented microservices** (and for the 7 client-only ones, which have no
   docs at all) — genuinely undocumented, not confirmed absent.
9. **What is `partners.fountain.com`'s v1 contract?** A third API generation, never independently crawled.
10. **`PAPI`** (referenced in `servicesecurity` and a `hirePapiProfile` payload field) is never expanded
    anywhere in 593 doc pages.
11. **Is the "Fountain Go" app (`go.fountain.com`) a distinct client tier**, and does it explain the
    legacy mobile-app route comment? Unvisited by any dimension.
12. **What is `internal.fountain.com`** (resolves, returns a bare 403 from the same-shaped Rack origin;
    confirmed *not* a DNS-wildcard artifact) — a blocked-host handler or a real internal surface?
13. **`gist-queue-consumer-api.cloud.gist.build` and Vouch (`vouch.us`)** — present in CSP, purpose
    unidentified.
