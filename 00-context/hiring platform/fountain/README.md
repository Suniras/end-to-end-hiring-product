# Fountain — Recon Run

> **Fountain** (fountain.com; legal entity **OnboardIQ, Inc.**, Delaware, founded 2014) sells a modular
> platform for **high-volume hourly/frontline hiring and workforce operations** — paid sourcing →
> applicant tracking → onboarding/compliance (I-9/E-Verify) → shift scheduling/attendance → post-hire
> engagement and rehire. Since April 2026 it markets the whole suite as "Frontline Superintelligence," an
> agentic OS fronted by four named AI personas (Anna, Emma, Sam, Cue). We ran the `discover` harness on it
> as the anchor of a paired competitive teardown for a **build-vs-buy read on a frontline hiring
> platform**: how deep is the product actually built, how much of the "agentic" story is load-bearing
> engineering, and where are the exploitable seams.

---

## ⚠️ Three run-level flags — read before quoting anything

**1. No authenticated session was run, and — with two Mode-5 exceptions — no live wire was observed.** The
exceptions are both **read-only, unauthenticated MCP capability probes** (`initialize` + `tools/list`
only, **no tool ever invoked**): iteration 1 probed `data-mcp-production-us-east-1.fountain.com` (found in
the `wx-copilot` bundle), and iteration 2 probed `mcp.fountain.com` (`fountain-hire-mcp-server`, 127
tools) plus a DNS candidate sweep for the two remaining declared MCP hosts, which were **not located**.
Those are the only live responses in the run; everything about the product's *own* REST API remains
declared. `session` is
`status: absent` (`auth:none` — the batch-wide outside-only default applied and **the user was
unreachable to authorize a login**), and `wire-capture` is `status: folded` into it. The session
frontmatter carries **`write_side_observed: false`, `pass2: not-applicable`**. Consequence, stated once
and applied throughout the corpus: **every request/response shape in this run is *declared* (by docs or
by a generated client), never *observed*.** Feature **existence and gating** are well-evidenced by three
static lanes; feature **execution behavior** — what Anna actually asks, what Emma answers, what Sam
detects, what Cue drafts — is **unobserved and stays tentative everywhere.** A single read-only Pass-1
session is the highest-value follow-up in the run and would convert most of this corpus from *declared*
to *observed*.

**2. A second, separate blocker hit at Mode 4: no browser-driving tool existed in this session at all.**
Distinct from `auth:none`, and strictly worse — it also blocked the *unauthenticated* walks that
`auth:none` alone would have left open (`cue.fountain.com`, the tenant career site, the public chat
widget, the Intercom help center, the login shell). Cartography therefore ran in its **degraded,
static-reconstruction mode**: it produced a route-complete IA (31 surface cards), 8 inferred flows and a
66-row coverage matrix, but **`features_walked: 0` and `screenshot_coverage: 0`** — and Fountain has
**no visual surrogate** (no App Store / Play / extension / PWA listing, verified absent). Recorded, never
worked around; see
[`dimensions/session/captures/screens/_index.md`](dimensions/session/captures/screens/_index.md).

**3. The paired target (Paradox) was an AGENT-SELECTED SUBSTITUTION, not a user-named target.** The user
asked for a second, similar USA-market frontline-hiring player and was unreachable to confirm a pick; the
agent chose **Paradox (paradox.ai)** as the closest head-to-head analog. That choice was never confirmed.
See [`research/paradox/00-scope-verdict.md`](../paradox/00-scope-verdict.md) — the substitution and the
rejected alternatives (Harri, Workstream, Jobvite/Talroo, iCIMS) are recorded there. Treat any
Fountain-vs-Paradox comparison as resting on an unconfirmed target selection.

---

## Access grade (the resolved vector)

| Axis | Value | Confidence | Evidence |
| --- | --- | --- | --- |
| **source** | `none` | high | `github.com/Fountain` is a verified **namesake** — org created 2009-03-17, five years pre-founding; blog field points at an unrelated `fountain.engineering`; one near-empty repo; three alternate slugs 404. Verified from full org JSON, not a bare 404. |
| **runtime** | `reachable` | high | `app.fountain.com` serves a real webpack SPA (un-single-bundled, named vendor chunks); `developer.fountain.com` serves a real ReadMe portal with a genuine `llms.txt`. |
| **auth** | `none` | high | Batch-wide outside-only default; **user unreachable to provide a session for this run**. No live probe of an authenticated surface was ever attempted. |
| **presence** | `rich` | high | Full marketing site, a genuinely rich developer-docs portal, a live Statuspage, Trust/Security/Ethical-AI pages, a first-party changelog at `new.fountain.com`. |

**Matched case:** Case-2-like (`runtime:reachable` + `source:none`) — but with an unusually rich
`docs`+`api` surface that is closer to Case-1 richness on those two dimensions specifically, despite a
fully namesake-blocked codebase. The run's strongest lane turned out to be one Discovery only flagged as
a "check for `sourceMappingURL`" note: **the SPA ships complete, unauthenticated production source maps.**

**The source-independence map used throughout Evaluation** (decided once, applied in all four rollups):

| Lane | Dimensions | Note |
| --- | --- | --- |
| **A** | `docs` + `api` (+ `website` for *feature* claims) | All read the **same served artifact** (`developer.fountain.com`) / restate each other — **ONE source**, never a band-bump. Divergent counts are a **range**, not a conflict. |
| **B** | `deployed-client-bundle` | Genuinely independent, machine-verbatim (`source-map-reassembly`). **The strongest lane in this run.** |
| **C** | `infra-backend-fingerprint` | DNS / CT / headers / CSP. Independent of A and B. |
| **D** | `community` | Statuspage JSON + changelog — first-party but non-marketing. Independent for infra/component claims. |
| **E** | `packages`, `distribution-artifacts`, `codebase` | High-confidence **absence** oracles. |

---

## Dimensions covered

| # | Dimension | Status | Method | Conf. | Compl. | Headline finding |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `codebase` | ❌ **absent** | `inferred` | high | 100% | No public source of any kind. `github.com/Fountain` disambiguated as a **namesake** (2009 org, 5 years pre-founding) via full org JSON + a 4-slug sweep — a verified absence, not a failed search. |
| 2 | `docs` | ✅ complete | `crawl-clip` | med-high | 75% | **593-page `llms.txt`** enumerated and classified in full; **two separately generated OpenAPI documents** (Hire v2 / Worker Experience v1) — the docs corpus itself distinguishes the two backend generations. |
| 3 | `packages` | ✅ complete | `registry-metadata` | high | 100% | **No official SDK in any language** — 23 npm + 14 PyPI direct registry GETs, every hit disambiguated as an unrelated namesake. REST + curl only. |
| 4 | `api` | ✅ complete | `docs-reconstructed` (41/575 rows `openapi-verbatim`) | medium | 85% | **575 documented endpoints across 14 prefixes**; **no served spec file** (all guessed paths 404) but **every ReadMe reference page embeds a verbatim per-operation OpenAPI fragment**. `exposeAsMcpTool` tag found. Its "**no live MCP server**" negative was **superseded in Mode-5 it. 1** — correct for the 6 paths it probed, but the real host lives only in the `wx-copilot` bundle. |
| 5 | `website` | ✅ complete | `crawl-clip` | medium | 85% | **Zero published pricing** (verified across 6+ locations); the 2026 "Frontline Superintelligence" repositioning; **no LLM vendor named anywhere**; the Porch-Group acquisition claim **refuted**. |
| 6 | `community` | ✅ complete | `crawl-clip` | medium | 75% | The real changelog lives at **`new.fountain.com` — unlinked from fountain.com** (raw-HTML verified). 39 Statuspage components, 50 incidents/8.5 months. **No public issue tracker, roadmap, or forum** → closed-feedback cap fires. |
| 7 | `session` | ❌ **absent** | `inferred` | high | 0% | `auth:none`, user unreachable. **`write_side_observed: false`, `pass2: not-applicable`.** The single largest hole in the run — recorded, never worked around. |
| 8 | `deployed-client-bundle` | ✅ complete | **`source-map-reassembly`** | **high** | 70% | **Live production source maps on every chunk checked (8/8)** → **1,962 files reassembled, 1,757 first-party**. Recovered the route table, the 300-path app-own API catalog, 50 LD flags + 27 tenant gates, and 21 `REACT_APP_*` fields. **Mode-5 it. 1** added the `wx-navbar`/`wx-copilot` UMD micro-frontends (`bundle-string-mine` · medium): the full Frontline OS destination catalog, +466 `/api/service*` paths, **Cue's Claude/Bedrock model enum**, and **a live MCP server**. **Mode-5 it. 3** reassembled the last flagged chunk, `npm.fountain.*` (`source-map-reassembly` · high): the in-house design system (230 files) + **`@fountain/universal-search`, a shipped ⌘K command palette** — and **zero** new API paths/routes/flags, a recorded negative that closes that gap. |
| 9 | `infra-backend-fingerprint` | ✅ complete | `dns-ct-fingerprint` | medium | 80% | **144 subdomains via CT** (per-tenant + paired sandbox twins naming Amazon/DoorDash/Staples/…); Cloudflare→AWS via DuploCloud; **report-only CSP**; the `anthropic-domain-verification` TXT record; `euw3-ms-nlu.internal` (in-house NLU). |
| 10 | `wire-capture` | ⏸ **folded** → `session` | `inferred` | high | 0% | No non-browser client exists; rung-1 is a browser tap owned by `session`, which was absent. Recorded as `status: folded`, contributing **0 rows** to the shared path catalog — correctly, not padded. |
| 11 | `distribution-artifacts` | ❌ **absent** | `binary-extract` | high | 100% | **No native client anywhere** — iOS (3 queries) + Play (3) + Chrome Web Store (2) + Firefox AMO (1) + a manifest/`sw.js` probe, all negative; the `/manifest.json` 200s **proved SPA-shell false positives by content-type**. |

**Absences are findings here, not gaps in the write-up:** 3 absent + 1 folded, each with its own
`_summary.md`. No dimension was silently dropped.

---

## Headline findings

1. **Fountain ships its complete recruiter SPA source to anyone with `curl`.** Every chunk checked (8/8)
   carries a live `sourceMappingURL` resolving to a 200 `.map`; the entry map alone reassembled **1,962
   source files, 1,757 of them first-party** — effectively the whole recruiter front end, unauthenticated.
   It also leaked internal ticket IDs (AXHE-3945, HRAI-1928/1929), named enterprise tenants, the
   `staging-use-NN` environment convention, and a verbatim *"only used for sales demo — not the actual
   dashboard customers use"* comment on `/sourcing_dashboard`. Paired with a **Report-Only (not enforcing)
   CSP**, the security posture reads as measurably mid-hardening.
   (`deployed-client-bundle: raw/route-table.md · source-map-reassembly · high` × `infra:
   raw/security-headers.md · dns-ct-fingerprint · medium`)

2. **The published developer API is not the API the product runs on — and on the recruiter-console lane
   they are near-disjoint.** 575 documented endpoints on `services.fountain.com` (OAuth2) vs **766
   declared app-own paths**: **300 unique paths / 358 method+path pairs** on same-origin
   `web.fountain.com` under `/internal_api/*` + `/api_self_serve/*` (dual-tier JWT), **plus 466
   `/api/service*` paths across 15 families** recovered from the `wx-navbar` / `wx-copilot`
   micro-frontends at Mode-5 iteration 1. Whole app subsystems have **no published equivalent at all**:
   sourcing/ad-spend (52 paths), the chatbot admin surface (29), the workflow editor (28), agent
   integrations (11), the AI workflow builder (2) — and a **27-path `serviceauthorization` RBAC service**,
   one of **seven `service*` families the docs never mention** (so the fleet is **≥19 microservices, not
   12**). **The published API is an integration/data-sync contract, not a mirror of the system.** Two
   genuinely independent lanes ⇒ fact.
   (`api: raw/published-vs-app-own-note.md · docs-reconstructed · medium` × `deployed-client-bundle:
   _shared/api-path-catalog.md · source-map-reassembly · high`)

3. **Two backend generations coexist behind one brand — and it is a migration, not a contradiction.** A
   Rails/Rack Hire monolith (Devise `/users/sign_in`, `x-runtime`, `Webhooks::Settings::*` Ruby module
   paths, `X-ACCESS-TOKEN`, flat JSON, 120 req/min) alongside a LoopBack-flavored Node fleet of **12
   Worker-Experience microservices** (+ a 13th `servicehire` gateway prefix fronting the monolith) with
   OAuth2, `filter[where][field][op]` grammar, JSON:API `{data, meta}` envelopes and **no documented rate
   limits at all**. The docs corpus itself carries them as **two separately generated OpenAPI documents**.
   Rails ⇒ fact (lanes B × C × A); the **LoopBack** identification is lane-A-only — strongly evidenced,
   not promoted. Mid-migration is visible from inside the client too: `Auth_old`, `workflow_editor_v2`,
   `/opening_approvals` beside `/approval_rules`, `hiring-goals-v2/v3/v4`.
   (`api: raw/openapi-digest.md` + `raw/rate-limits-and-pagination.md · medium` × `deployed-client-bundle:
   raw/route-table.md · high` × `infra: raw/cloud-cdn-fingerprint.md · medium`)

4. **The AI layer is real, dedicated infrastructure — and it is not one mechanism but (at least) two:
   Cue is genuine LLM orchestration, the chatbot layer is classic intent-classification NLU.**
   *(Mechanism split confirmed in Mode-5 it. 1 — see finding 5.)* Two independent lanes confirm existence: a separately-deployed,
   per-tenant release-channelled **`wx-copilot` micro-frontend**, an `/internal_api/agent_integrations`
   namespace, `/internal_api/ai_builder/workflow/chat`, and — the tell that matters — a **`copilotAuditLogs`
   resource**, an audit trail built specifically for AI-made changes. Nobody builds a governance audit log
   for a relabeled rules engine. But the chatbot API is **intent- and model-name-scoped**
   (`automated_response_models`, `get_intents_with_bot_reply/{model_name}`, `chatbot_logs/intents`) and
   `euw3-ms-nlu.internal.fountain.com` is an **in-house NLU microservice** — so **Emma's** "AI" is a
   trained intent classifier, a structurally different subsystem from Cue's Claude/Bedrock stack, and the
   finding in #5 deliberately does **not** extend to it. With `write_side_observed: false`, **no agent
   was ever seen producing output** — so *behaviour* (autonomy, quality, the marketed outcome claims)
   stays unverified even where *mechanism* is now settled.
   (`deployed-client-bundle: _shared/api-path-catalog.md · high` × `infra: raw/dns-and-subdomains.md ·
   medium` × `api/docs: raw/api-reference.md · medium-high`)

5. **Cue's LLM backend is *declared* in shipped client code: Claude Opus 4.6 / Sonnet 4.6 via AWS
   Bedrock — and Fountain names it nowhere its customers can see.** *(Added in Mode-5 iteration 1;
   **re-graded in iteration 3**, defect E2 — see the wording caveat at the end of this finding.)* Fetching the
   previously-unmined `wx-copilot.umd.js` micro-frontend — **one unauthenticated `curl`** — surfaced a
   verbatim model-selection enum, **`us.anthropic.claude-opus-4-6-v1`** and
   **`us.anthropic.claude-sonnet-4-6`**, the exact AWS Bedrock cross-region inference-profile naming
   convention, inside a multi-provider config schema
   (`llmProvider: enum(["openai","anthropic","anthropic_direct"])`, default `openai`) with
   `llmServiceVersion`, a Bedrock-knowledge-base field, a `customPrompt` and a strictness enum. This is
   a direct read of a production artifact ⇒ **fact that Cue is real, configured, multi-provider LLM
   orchestration, not a relabeled rules engine.** **Re-graded (it. 3):** it is *not* a fact that **Cue's
   production inference runs on Claude** — that stays **tentative**. The apex
   `anthropic-domain-verification` TXT record is an **org-level** signal
   (`technology-architecture.md` grades it ambiguous: it sits among internal-tooling SaaS verifications
   alongside Cursor, Linear, Notion, Miro, 1Password, Atlassian and Rippling), so it is **not** a second
   independent lane for a product-level claim; the schema's own default is `openai`; and no inference
   call was ever observed (`write_side_observed: false`).
   Four limits held: **which provider serves production is unobserved**; it covers **Cue only** (Emma is still an in-house intent-classifier NLU per
   `automated_response_models` + `euw3-ms-nlu.internal.fountain.com`; Anna/Sam unconfirmed); the
   **autonomy** claim is unchanged (the shipped shape is draft → test → human-publish); and the earlier
   grep negative remains true of **the artifact it scanned** — no such literal exists in the 1,757
   reassembled `recruiter_ui` files, because the model layer ships in a *separately built* UMD bundle.
   The disclosure finding stands and sharpens: **no LLM vendor is named on any marketing, security,
   ethical-AI or trust page** — now "undisclosed to customers", no longer "unknown to this recon".
   (`deployed-client-bundle: raw/wx-micro-frontends.md · bundle-string-mine · medium` — **single lane,
   not band-promoted**; `infra: raw/dns-and-subdomains.md + raw/sub-processors.md · dns-ct-fingerprint ·
   medium` is recorded as consistent org-level context, **not** as corroboration)

5a. **A live, unauthenticated MCP server is running in production — `fountain-data-mcp v1.27.2`.**
   *(Added in Mode-5 iteration 1; **corrects** this run's earlier "no live MCP server exists" verdict.)*
   The `wx-copilot` bundle carries a per-tenant `dataMcpBaseUrl` map; a read-only probe of the production
   host (`initialize` + `tools/list` only — no tool invoked, no data read) returned **6 fully
   JSON-Schema'd tools** over a **Cube.js semantic layer + ClickHouse**: `list_cubes`, `get_cube_detail`,
   `execute_cube_sql_v2` (server-side dataset caching, so "no row data enters the calling context"),
   `execute_raw_sql` ("with RBAC applied"), `query_dataset`, `list_datasets`. The prior negative was
   **correct for the six paths it tried** (`app.`/`services.`/`developer.fountain.com`, guessed from the
   `exposeAsMcpTool` tag) — it simply never had this host, which is discoverable only from the client
   bundle. **Scope held:** this particular server is an *internal analytics / NL-to-SQL surface for Cue*,
   not a CRUD agent API. Two side findings: `execute_raw_sql`'s own
   `product` docstring routes `"hire"` → **`FDEPLOY_RULES`** and all WX products →
   **`FDEPLOY_RULES_WX`**, a **third independent confirmation of the Hire-vs-Worker-Experience
   two-application split**; and the architecturally interesting choice is *what* they made agent-callable
   first — a governed semantic layer, not the CRUD API.
   (`deployed-client-bundle: raw/wx-micro-frontends.md` §2d · **live read-only unauth probe · high**)

5b. **A SECOND live MCP server — and this one *is* the Hire agent surface: `fountain-hire-mcp-server
   v1.0.0` at `mcp.fountain.com`, serving 127 tools to an unauthenticated `tools/list`.**
   *(Added in Mode-5 iteration 2 — it closes iteration 1's largest surviving scope caveat, which was
   exactly "is any MCP surface the `exposeAsMcpTool` Hire surface?")* The other two declared MCP hosts
   (`x-wx-`, `x-fountain-ai-mcp-base-url`) were **searched for and not located** — a 16-candidate DNS
   sweep returned NXDOMAIN on every name, and CT enumeration is blind here because Fountain serves a
   wildcard `*.fountain.com` certificate. Three things make the Hire server the most consequential
   artifact in the run after the source maps:
   - **`exposeAsMcpTool` is now traced end-to-end.** All 127 tools carry it in `_meta.apiTags`. The
     OpenAPI tag the `api` dimension found in the docs is **the build-pipeline switch that promotes an
     endpoint to an agent-callable tool** — corroborated across three artifacts (docs, live server,
     `wx-copilot` client literal) ⇒ **fact**.
   - **It reveals a published API family nobody had catalogued: `/api/go/{v1,v2}` ("Hire Go"), 56 of the
     127 tools** — dashboards, applicants, funnels, users, recurring-availability schedules, calendars,
     WhatsApp templates. Absent from all 575 documented endpoints *and* all 766 app-own paths.
   - **21 tools are hand-authored agent composites** (`postToolsApplicants`, `postToolsWorkflowEditorStages`,
     `getToolsLlmContext`, `postToolsHireGoUrl`, …), not generated REST wrappers, and every tool requires
     a **`uiMeta.label`** — "a user-facing one-sentence non-technical summary of what you're doing with
     this tool call and why" — plus an `actionType`. Fountain built a deliberate agent-tool product layer
     with narration and action-typing baked into the contract.
   **Boundary held: no tool was invoked, no argument supplied, nothing executed** — only `initialize` and
   `tools/list`. Whether any tool *executes* unauthenticated was deliberately not tested and is recorded
   as a **security question, not a finding** (the catalog does disclose 4 `destructiveHint: true` tools
   with full input schemas). It is also **not** established that this is a *supported* customer
   integration surface: it is undocumented across all 593 reference pages.
   (`evaluation/data-model-api-surface.md` §MCP · **live read-only unauth probe · high**)

6. **Fountain published the strongest available criticism of its own category — and has not built the
   governance surface to answer it.** Its own commissioned survey (1,014 US frontline workers, Jun 2026)
   found **62% of applicants report being "ghosted"** after multiple interview rounds, with lack of
   communication (20%) and **"unexplained AI screening rejections"** as top complaints. Meanwhile the
   dedicated `/ethical-ai` page names **zero** compliance frameworks (no methodology, no audit cadence, no
   named bias auditor) — the single EEOC/GDPR/ISO-42001 citation on the whole site sits on the *marketing*
   `/agentic-ai` page. The stated mitigations ("explainable scoring", opt-in human review) have **no
   corresponding endpoint or client surface** in the 575 published paths, the 766 app-own paths, or the
   127 live Hire-MCP tools.
   (`community: raw/issue-themes.md · crawl-clip · high for the acknowledgment` × `website:
   raw/trust-security-ethics-legal.md · crawl-clip · medium`)

7. **The AI layer is sold as a paid add-on, with in-product upsell — the most commercially actionable
   finding in the run.** The client ships a dedicated **`/chatbot/upsell` route gated on
   `fountain_ai_upsell_enabled`** and a `/fountain_ai/upsell` twin, alongside **27 `whoami.*_enabled`
   tenant entitlement gates** (10 of them AI-specific) and **50 LaunchDarkly flags**. Combined with the
   docs' "Fountain Hire Package Required" gate, the entitlement model is real and granular in code — and
   it is the closest thing to a pricing model this run recovered, since **no price is published anywhere**
   (verified across 6+ locations). Two independent lanes ⇒ fact.
   (`deployed-client-bundle: _shared/feature-flags.md · source-map-reassembly · high` × `docs:
   raw/getting-started.md · crawl-clip · medium-high`)

8. **CT logs name a materially larger enterprise base than the marketing site does.** The site names 15
   customers; certificate-transparency logs surface **144 subdomains** on a per-tenant model with **paired
   `sandbox.<tenant>` twins** — `aimbridge`, `amazon-na`/`amazon-us`/`ms-amazon-portal`, `brandsafway`,
   `ceracare`, `doordash`, `ontrac`, `staples`. Statuspage independently names **separately-scheduled
   maintenance windows** for `amazon-mm`, `amazon-eu-dsp`, `ceracare`, and the client bundle bakes in
   `aimbridge` (a Helm-provisioned dedicated hire cluster) and `ups`. **Three independent non-marketing
   lanes ⇒ fact:** large logistics/big-box accounts run on isolated deployments.
   (`infra: raw/dns-and-subdomains.md · medium` × `community: raw/status-page-architecture.md · medium` ×
   `deployed-client-bundle: raw/route-table.md · high`)

9. **The compliance pipeline hides the single best-specified AI contract on the platform — a synchronous,
   customer-overridable decision gate.** Fountain OCRs an uploaded document (glare/focus detection, field
   extraction, an `aiConfidenceLevel`), forms a tentative auto-approve verdict, then **blocks on a
   synchronous call to the customer's External Processing URL**, which may return
   `{forceAutoApprove, forceManualReview}` to override it (`forceManualReview` wins ties; on timeout
   Fountain silently falls back to its own decision **without surfacing that in the UI**). Fountain
   documents the fail-open footgun itself. Unusual candour, and a genuinely well-shaped seam.
   (`docs: raw/webhooks.md` + `api: raw/webhooks.md · docs-reconstructed · medium-high`)

10. **Agent-readiness is not forward investment — it is shipped, and `exposeAsMcpTool` is the switch.**
    An `exposeAsMcpTool` OpenAPI tag is **curated** onto core-entity primary operations (Applicants,
    Locations, Positions, Funnels — 10/36 in a stratified sample, deliberately skipping
    sub-resource/process ops), plus a served `.well-known/agent-skills/index.json` discovery manifest.
    ~~while no live MCP server exists~~ — **corrected in Mode-5 it. 1** (a live `fountain-data-mcp`
    analytics server, finding 5a) **and completed in it. 2** (a live `fountain-hire-mcp-server` serving
    **127 `exposeAsMcpTool`-tagged tools**, finding 5b). The six original 404s remain correct for the
    three hosts they probed. **The claim that survived two corrections and is now the finding:** the tag
    is the production pipeline switch, and the Hire domain *is* agent-callable today. What remains
    genuinely unestablished is the **commercial** half — the server is undocumented in 593 reference
    pages, so "agent-callable" ≠ "a supported customer integration surface." Unmarketed, unhyped — the
    inverse of the AI over-claim, and the single most under-sold thing this teardown found.
    (`api: raw/tool-catalog.md · docs-reconstructed · medium` + `docs: raw/agent-skill-manifest.md`
    × `deployed-client-bundle: raw/wx-micro-frontends.md` × `evaluation/data-model-api-surface.md` §MCP
    · **live probes · high**)

**Also recorded, deliberately:** the "Fountain acquired by Porch Group, June 5 2025" aggregator claim is
**REFUTED** (uncorroborated by any primary source; contradicted by Fountain's own 2026 newsroom publishing
independent-company launches). The one verified acquisition is **Clevy, June 2023** — "an international
provider of AI conversational technologies," consistent with the in-house NLU stack predating the agentic
rebrand.

---

## How to navigate

| Path | What's in it |
| --- | --- |
| [`00-scope-verdict.md`](00-scope-verdict.md) | Gate trace A–E → `accept` (clean, single product). |
| [`00-recon-plan.md`](00-recon-plan.md) | The `access_grade` vector, the 11-dimension availability table, the collection plan, and **three labelled hypotheses** (tenant-URL model · "genuine AI vs relabeled rules engine" · no native mobile app) seeded `verify:` so collectors re-derived rather than echoed them. |
| `dimensions/<dim>/_summary.md` | Per-dimension capture with **provenance frontmatter** (method · confidence · completeness · gaps) + Findings + Inferences + Open questions. |
| `dimensions/<dim>/raw/` | Dimension-private verbatim artifacts (endpoint catalog, route table, DNS/CT sweep, pricing, changelog digest, store sweep…). |
| [`dimensions/_shared/api-path-catalog.md`](dimensions/_shared/api-path-catalog.md) | The single-copy seam file — **exactly one `## source: bundle` section**, **766 paths** (300 source-map-reassembled from the recruiter console + a 466-path Mode-5 it. 1 addendum from the `wx-*` micro-frontends). `session`/`wire`/`distribution` contributed 0 rows; `api` correctly **cited rather than appended** (published surfaces are not on the §6 allowlist). |
| [`dimensions/_shared/feature-flags.md`](dimensions/_shared/feature-flags.md) | 50 LaunchDarkly keys + 27 `whoami.*_enabled` tenant gates + 3 LD client-side environment IDs. |
| [`evaluation/technology-architecture.md`](evaluation/technology-architecture.md) | Stack, the two-generation architecture, multi-tenancy, auth, the AI/agent layer, 9 reconciliation verdicts. |
| [`evaluation/product-features.md`](evaluation/product-features.md) | The feature map with per-capability maturity + confidence, three reconstructed user journeys, and **9 traced over-claims**. |
| [`evaluation/data-model-api-surface.md`](evaluation/data-model-api-surface.md) | Three entity spines (Applicant / Worker / app-own), the **published-vs-app-own diff**, webhooks (5 subsystems), auth & tenancy, the API-path diff + count reconciliation. |
| [`evaluation/competitive-positioning.md`](evaluation/competitive-positioning.md) | Positioning vs build, pricing/packaging, the real moat, alternatives, strategic read, and a decision-oriented "what to take from this" section. |
| [`evaluation/information-architecture.md`](evaluation/information-architecture.md) | **Mode 4 (Cartography), degraded but substantial.** Nav tree + **31 surface cards** for the recruiter console, each with route, depth, capability, entities, endpoints and its exact flag/RBAC gate — reconstructed from the **source-map reassembly**, explicitly **NOT live-walked**. Headlines: the AI workflow builder (Cue's flagship) sits at **D3 inside one opening**; 7 unmarketed surfaces incl. a whole `/payments` destination; and **4 marketed modules (Shift, Onboard, Pulse, Compliance — 197 endpoints) have zero routes in this app**, i.e. "Frontline OS" ships as at least two applications and this run mapped one. |
| [`evaluation/ux-flows.md`](evaluation/ux-flows.md) | 8 primary journeys as mermaid sequence diagrams — **every hop drawn dashed and marked INFERRED**, because zero wire was observed (`write_side_observed: false`). Traced from client call sites + documented contracts. The realtime lifecycle is identified but **not diagrammable** (Pusher keys present, zero frames) — recorded, not faked. |
| [`evaluation/feature-coverage.md`](evaluation/feature-coverage.md) | The claimed-vs-located-vs-walked matrix: **65 claims · 31 route-located · 25 backend-located-only · 9 not located (all 9 dispositioned) · 0 walked.** Scorecard: `feature_location_rate: 48` · `flow_coverage: 89` · `screenshot_coverage: 0` · `ia_nav_complete: false` (reason recorded). |
| [`dimensions/session/captures/screens/_index.md`](dimensions/session/captures/screens/_index.md) | **Zero screenshots — and the record of why.** Two independent blockers: `auth:none`, **and no browser-driving tool in the session at all** (a capability gap that also blocked the *public* walks `auth:none` alone would have left open). Fountain has **no visual surrogate** either — no App Store / Play / extension / PWA listing (verified absent). Nothing fabricated. |
| [`05-self-correction-proposal.md`](05-self-correction-proposal.md) | Mode 5 output (produced after this README). |

---

## Lessons (candidate methodology learnings → feed self-correction)

1. **Concurrently-drafted sibling rollups need an explicit reconciliation pass — it caught real defects
   here.** Four rollups drafted in parallel produced: one **independence-rule violation** (`api`+`docs`
   counted as two independent dimensions in a promotion-to-fact), **inconsistent confidence framing on the
   same fact** (LoopBack promoted to fact in one doc, correctly capped in another), a **conflict resolved
   in one doc and flagged in another** (the mobile-app tension), and **four numeric divergences** carried
   inconsistently. Each was fixable by editing the weaker doc to the stronger one — none needed new
   collection. This is a recurring, predictable defect class, not bad luck.
2. **A same-artifact source read by N dimensions produces N slightly different counts.** `docs` 593 pages
   vs `api` 594 vs `packages` "~185"; 12 vs 13 `service*` services. The same-artifact rule handled the
   first two as a **range**; the third (12 vs 13) was **genuinely resolvable** — `servicehire` is a gateway
   prefix, not a microservice — which is worth noting: *"report a range"* is the floor, not the ceiling.
   Try to resolve first; range only when the artifact truly can't settle it.
3. **Discovery's cheapest note can be the run's strongest lane.** "Check for `sourceMappingURL` before
   assuming no source maps" was one clause in the plan; it produced 1,757 first-party files and the
   highest-confidence dimension in the run. On any `source:none` target, promote the source-map probe from
   a note to a first-class Discovery check.
4. **A negative needs a control probe, and both collectors that ran one were right to.** `api` disproved a
   `/.well-known/mcp` 200 by byte-comparing a nonsense control path (SPA shell); `distribution-artifacts`
   disproved `/manifest.json` + `/sw.js` 200s by content-type; `infra` disproved a wildcard-DNS artifact
   with a nonsense subdomain. Three clean applications of §7 rule 10 — this discipline is working.
5. **A collector that deviates from its dispatch brief with a cited reason can be right.** `api` was told
   to append to `_shared/api-path-catalog.md`, declined on ingestion §6's contributor allowlist, and
   flagged the deviation. Evaluation reviewed and **upheld** it. Worth scoring as correct judgement, not
   as an unfollowed instruction.
6. **The `auth:none` batch default is now the dominant cost of these runs.** It zeroes `session`, folds
   `wire-capture` to nothing, empties the realtime event catalog, leaves the app-own auth *transport*
   unverifiable, and makes the dormant-route half of the seam rule unavailable (zero observed rows).
   Worth surfacing to the user as a standing choice per batch rather than an inherited silent default.
7. **A generated API client is a credible substitute for a wire tap on completeness — and useless on
   liveness.** `npm.api-clients.*.js` gave 300 declared paths (better coverage than a click-driven tap
   would), but proves nothing fires. Naming that trade explicitly, rather than presenting it as an
   equivalent lane, is what kept the diff honest. **Corollary earned the hard way (Mode-5 it. 1):** a
   declared count from *one* client is a floor, not a ceiling — two more unauthenticated GETs of the
   sibling micro-frontends raised it from 300 to 766 (+155%), and an MCP probe then surfaced an
   `/api/go/*` family absent from both catalogs.
8. **A degraded Cartography is not an absent one — and the two blockers must be reported separately.**
   Mode 4 ran on static material and produced a route-complete IA (31 surface cards), 8 inferred flows
   and a 66-row coverage matrix. What it could not produce was anything *walked* or *screenshotted* — and
   the cause there was **two independent blockers, not one**: `auth:none` (planned, from Mode 1) **and no
   browser-driving tool in the session at all** (an unplanned capability gap, discovered at Mode 4, which
   also blocked the *unauthenticated* walks `auth:none` alone would have left open). Collapsing those two
   into "Cartography is unavailable" would have hidden a real, separately-fixable gap — and would have
   thrown away a substantial deliverable. **Generalizable rule: on a `source:none` target with live
   source maps, Cartography should default to the static-reconstruction path rather than declaring
   itself blocked.** Corollary worth promoting: a nav bar / copilot shipped as a **separate UMD
   micro-frontend** is a first-class Cartography input — fetching it is one unauthenticated `curl` and it
   is the difference between derived and observed nav depth.
9. **A negative must be scoped to the artifact it was run against, or it will be read as a claim about the
   product.** Two of this run's confidently-stated negatives were **artifact-scoped, not product-scoped**,
   and Mode-5 iteration 1 overturned both with one `curl` each: *"no `anthropic`/`claude`/`bedrock` literal
   exists"* was true of the **1,757 reassembled `recruiter_ui` files** and false of the separately-built
   `wx-copilot` UMD bundle; *"no live MCP server exists"* was true of the **six guessed paths on three
   hosts** and false of a host discoverable only from that same bundle. Neither collector was sloppy —
   both ran correct §7-rule-10 control probes. The defect is in the **write-up**: state a negative as
   *"absent from artifact X / hosts Y"*, never as *"absent"*. **Generalizable rule: before promoting any
   absence to a run-level finding, enumerate the artifacts that were NOT searched** — here, a
   separately-deployed micro-frontend named in the client's own env config, which every dimension knew
   about and none fetched until Mode 5.
10. **The cheapest unmined artifact was the highest-yield one in the entire run.** Two unauthenticated
   `curl`s of `ftn-shared-components.fountain.com` (~8.8 MB, no login, no browser) resolved the run's
   single longest-standing open question (Cue's LLM backend), corrected a headline negative (live MCP),
   confirmed a feature's shipped status (Scheduled Tasks), and added a third independent lane for the
   two-application split. **On any `source:none` target, fetch every separately-deployed client artifact
   the main bundle's env config names, before concluding anything about the AI/agent layer.**

---

## Reproduction

```bash
# 1. Scope + access vector (Mode 1) — cheap, read-only
curl -sI https://app.fountain.com/                      # SPA shell, S3+Cloudflare
curl -s  https://developer.fountain.com/llms.txt        # 180 KB, ~594 links — the docs spine
curl -s  https://api.github.com/orgs/Fountain            # namesake check: created 2009-03-17

# 2. The strongest lane — source maps (deployed-client-bundle)
curl -s https://app.fountain.com/ | grep -o '/80a74d4/[^"]*\.js'
curl -sI https://app.fountain.com/<chunk>.js.map         # 200 ⇒ source-map-reassembly
#   → route table, generated API client (300 paths), 50 LD flags + 27 whoami gates, 21 REACT_APP_* fields
curl -s https://ftn-shared-components.fountain.com/wx-navbar/v3/release/stable/wx-navbar.umd.js
curl -s https://ftn-shared-components.fountain.com/wx-copilot/v8/release/stable/wx-copilot.umd.js
#   → +466 /api/service* paths across 15 families, the 20-product destination catalog, Cue's LLM + MCP config

# 3. Infra (infra-backend-fingerprint)
dig +short TXT fountain.com                              # 21 verification records incl. anthropic-domain-verification
curl -s 'https://api.certspotter.com/v1/issuances?domain=fountain.com&include_subdomains=true&expand=dns_names'
curl -sI https://app.fountain.com/ | grep -i content-security-policy-report-only
curl -s  https://status.fountain.com/api/v2/components.json

# 4. Negatives worth re-running WITH their control probes
curl -s https://app.fountain.com/.well-known/mcp | md5   # compare against a nonsense control path
curl -sI https://app.fountain.com/manifest.json          # check content-type, not status code
```

**Not reproduced this run, and the exact gap it leaves:** every step above is unauthenticated. `session`
and `wire-capture` require the user to be logged into `app.fountain.com` in Chrome and to authorize the
gated dimension; the harness never enters credentials. Until that happens, the corpus stays *declared*
rather than *observed*. Mode 4 (Cartography) **did run**, on the static material — but with **no
browser-driving tool available in this session at all**, nothing was walked or screenshotted
(`features_walked: 0`, `screenshot_coverage: 0`); see
[`evaluation/feature-coverage.md`](evaluation/feature-coverage.md).

```bash
# 5. The cheapest Cartography follow-ups — no login, no browser, plain GETs
curl -s https://ftn-shared-components.fountain.com/wx-navbar/v3/release/stable/wx-navbar.umd.js   # the missing nav chrome → settles every D0
curl -s https://ftn-shared-components.fountain.com/wx-copilot/v8/release/stable/wx-copilot.umd.js # the whole Cue client surface
```

**Cheapest high-value follow-ups, in order:** (1) a read-only authenticated Pass-1 session — closes the
AI-mechanism question, the auth-transport probe, the realtime catalog, and converts Cartography from
reconstructed to walked (screenshots, `features_walked`);
(2) fetch **one** `service*` reference page raw to see whether it embeds an OpenAPI fragment — if so, 467
endpoints' method grade rises from `docs-reconstructed` to `openapi-verbatim` for the price of one GET;
(3) mine the Worker Experience client bundle (the missing half of the published-vs-app-own diff);
(4) run the deferred **`external-reputation`** dimension — formally recommended by `community` under the
closed-feedback trigger, and the only way to turn inferred user pain into counted user voice.
