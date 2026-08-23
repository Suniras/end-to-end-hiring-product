---
dimension: docs
target: fountain
status: complete
access_grade_used: presence:rich
method: crawl-clip
method_ceiling: openapi-verbatim   # confirmed retrievable per-operation, one GET per endpoint, across the WHOLE reference corpus (Mode-5 it. 2) — see gaps[0] and the Method note
completeness_pct: 75
confidence: medium-high            # unchanged: the ceiling moved, the fetched sample did not
captured_at: 2026-08-09
revised_at: 2026-08-09             # Mode-5 iteration 2 — service* OpenAPI-fragment question resolved
sources:
  - https://developer.fountain.com/llms.txt
  - https://developer.fountain.com/.well-known/agent-skills/index.json
  # --- added Mode-5 iteration 2 (the service*-OpenAPI-fragment probe, 5 GETs) ---
  - https://developer.fountain.com/reference/get_api-serviceattendance-demands.md
  - https://developer.fountain.com/reference/get_api-servicepulse-surveys.md
  - https://developer.fountain.com/reference/get_api-servicetodo-taskflows.md
  - https://developer.fountain.com/reference/get_api-serviceorganizations-companies.md
  - https://developer.fountain.com/reference/get_api-servicepool-audiences.md
  - https://developer.fountain.com/.well-known/agent-skills/read-the-docs/SKILL.md
  - https://developer.fountain.com/reference/overview.md
  - https://developer.fountain.com/reference/hire-api-overview.md
  - https://developer.fountain.com/reference/webhooks.md
  - https://developer.fountain.com/reference/rate-limitations.md
  - https://developer.fountain.com/reference/frequently-asked-questions.md
  - https://developer.fountain.com/reference/deprecations.md
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
  - https://developer.fountain.com/reference/wx-api-deprecations.md
  - https://developer.fountain.com/reference/get_v2-applicants-id.md
  - https://developer.fountain.com/reference/post_v2-webhook-settings.md
  - https://partners.fountain.com (llms.txt only)
  - https://help.fountain.com/en/ (== support.fountain.com/en/)
gaps:
  - "593-page llms.txt index enumerated and classified in full (all titles/URLs/families counted), but only ~24 of 593 individual pages fetched verbatim — the ~537 microservice (service*) pages are digested from title+description text in the index only. RESOLVED IN PART (Mode-5 it. 2): the question 'do service* pages carry embedded OpenAPI like the v2 pages do?' is answered YES — 5 pages from 5 different families (serviceattendance/demands, servicepulse/surveys, servicetodo/taskflows, serviceorganizations/companies, servicepool/audiences) were fetched raw, all HTTP 200, and 5/5 embed a complete OpenAPI 3.0.3 per-operation fragment declaring info.title 'Worker Experience Public API' v1.0.0, servers[0].url https://services.fountain.com, securitySchemes.jwt = http/bearer — identical to the 2 serviceworkforce pages already sampled (7 of 12 families now confirmed). The METHOD CEILING for the 467-page service* family therefore rises to openapi-verbatim-on-demand (one GET per operation); the CURRENT grade stays crawl-clip/docs-reconstructed because only ~29 of 593 pages have actually been fetched. This moves what is cheaply knowable, not what is known."
  - "help.fountain.com end-user help center: 9 real collection cards confirmed present, but category titles/article content are client-rendered and were not recovered by static fetch (would need a real browser — session/website dimension territory, out of scope for a non-browser-driving collector per ingestion §7 rule 9)."
  - "partners.fountain.com: llms.txt index captured (14 pages), but individual partner-API pages (v1 partner-scoped surface) not fetched verbatim — digested from titles/descriptions only."
  - "No changelog found in the crawled llms.txt despite the agent-skill SKILL.md description explicitly promising one ('links to every doc, reference, changelog, and custom page') — see raw/agent-skill-manifest.md."
  - "Full extent of exposeAsMcpTool-tagged v2 operations unknown (1 of 108 v2 pages sampled directly)."
---

# Fountain — docs dimension capture

## Method

Primary source: `developer.fountain.com/llms.txt`, fetched via `curl` (not WebFetch — a first WebFetch
pass on the same URL silently truncated the file mid-content and fabricated a phantom `## Summary`
section header that does not exist in the real file; the raw curl fetch, 599 lines / 183,778 bytes, is
authoritative and was used for all downstream analysis). The index was parsed to extract all 593
`[title](url)` pairs, classified into the v2-Hire-API family, the 12-microservice family, and misc
narrative pages (see `raw/doc-map.md`). ~24 representative pages across every doc-map section were then
fetched verbatim via `curl` (ReadMe serves each reference page as raw Markdown by appending `.md`,
including for `partners.fountain.com`). The `.well-known/agent-skills/index.json` and `SKILL.md` were
fetched directly. `partners.fountain.com`, `support.fountain.com`, and `help.fountain.com` were probed
and their `llms.txt` (partners) / redirect target + static HTML (help) captured; the help center's actual
article content is client-rendered by Intercom's Next.js app and was not recoverable by static fetch
(flagged as a gap, not faked).

**Mode-5 iteration 2 addendum (5 further GETs, 2026-08-09).** This capture's largest open question was
whether the ~537 `service*` reference pages embed per-operation OpenAPI fragments the way the v2 pages
do — the answer sets the *method ceiling* for 467 of the 575 published endpoints. Five pages from five
**different** service families were fetched raw (`.md` mirror): `get_api-serviceattendance-demands`
(13,130 B), `get_api-servicepulse-surveys` (42,234 B), `get_api-servicetodo-taskflows` (64,447 B),
`get_api-serviceorganizations-companies` (32,869 B), `get_api-servicepool-audiences` (12,676 B) — all
**HTTP 200**, and **all five embed a complete OpenAPI 3.0.3 fragment**, each declaring
`info: {title: "Worker Experience Public API", version: "1.0.0"}`,
`servers: [{url: "https://services.fountain.com"}]`, `security: [{jwt: []}]` and
`securitySchemes.jwt = {type: "http", scheme: "bearer"}` — byte-identical document identity to the two
`serviceworkforce` pages the `api` dimension already had. **7 of the 12 documented WX families are now
confirmed.** Two secondary results from the same five pages: **`exposeAsMcpTool` is absent from all
five** (independent corroboration that the tag is a Hire-v2-only construct), and each fragment's `tags`
array is a single resource name (`demands`, `surveys`, `taskFlows`, `companies`, `audiences`),
confirming the LoopBack resource-per-tag convention across families.

**The honest form of the upgrade:** `method` stays `crawl-clip` and `confidence` stays `medium-high`,
because only ~29 of 593 pages have been fetched. What changed is the `method_ceiling` — a verbatim
OpenAPI schema for **any** `service*` endpoint is now a **confirmed one-GET-away retrieval**, not a
hypothesis. Anyone writing an integration spec from this corpus should fetch the specific pages they
need and grade those rows `openapi-verbatim` / high.

## Findings

### The docs surface has (at least) four independent surfaces, not one

| Surface | Host | Nature | Pages | Method / confidence |
| --- | --- | --- | --- | --- |
| Developer API docs | `developer.fountain.com` | ReadMe, served `llms.txt`, per-page OpenAPI fragments (v2) | 593 | `openapi-verbatim` (v2, 108 pages) high / `docs-reconstructed` (service*, ~537 pages) medium |
| Partner integration guide | `partners.fountain.com` | ReadMe, own `llms.txt`, separate `v1` partner-scoped API | 14 | `crawl-clip`, medium |
| End-user help center | `help.fountain.com` (== `support.fountain.com`) | Intercom-hosted, branded "Worker Experience Help Center" (`onboardingiq`), Fin AI chat | 9 collections (content not fetched) | `crawl-clip`, low (client-rendered, gap recorded) |
| Agent-skill discovery manifest | `developer.fountain.com/.well-known/agent-skills/` | novel `schemas.agentskills.io` convention | 1 skill | `crawl-clip`, high (verbatim JSON) |

### The API surface is genuinely three generations deep

1. **Legacy "Hire" v2 REST API** (`api.fountain.com` / tenant-specific hosts, `X-ACCESS-TOKEN` auth,
   108 endpoints, verbatim OpenAPI 3.0.1 per page) — the original ATS.
2. **"Fountain One" microservices** (`services.fountain.com/api/<serviceName>/...`, OAuth2
   client-credentials, ~537 endpoints across 12 named services: serviceattendance, serviceworkforce,
   serviceorganizations, servicetodo, servicepulse, serviceemployment, servicepool, servicemedia,
   servicesecurity, servicecompliancev, servicereferral, servicestaff) — see `raw/api-reference.md` and
   `raw/doc-map.md` for the full per-service breakdown. **LoopBack (Node.js) framework fingerprint**
   confirmed directly from filter-query syntax (`filter[where][field][eq]=value`) used identically across
   all 12 services.
3. **Partner-scoped `v1` API** (`partners.fountain.com/reference/*`, distinct paths
   `/v1/partners/{id}/applicants/{applicant_id}/...`) — a third, narrower surface for partner-stage
   integrations, separate from both of the above.

### Tenant/region infrastructure is mid-consolidation (a dated, documented migration)

Fountain ran (and still supports, for backward compatibility) per-region/per-tenant API hosts
(`api.fountain.com`, `<region>.fountain.com`, single-tenant custom hosts, `wxp-services.fountain.com`).
Two dated deprecation notices (2024-09-25 and 2025-11-14) show Fountain **actively consolidating** to one
global gateway host, `services.fountain.com`, that resolves tenancy internally post-auth — a real,
in-progress infrastructure simplification, not a historical footnote (`raw/getting-started.md`,
`raw/faq-and-deprecations.md`).

### Concrete, docs-verified AI/ML capabilities (independent of marketing copy)

- **Document OCR + auto-approval pipeline** (Compliance): glare/focus detection, AI confidence score,
  auto-approval logic, with a synchronous external-override hook (`raw/webhooks.md` — External Processing
  URL). This is real, described-in-detail production infrastructure.
- **Vector-similarity job matching** (`servicepool`): `GET .../talents/{id}/jobmatches` — "based on
  aggregate vector match" (`raw/api-reference.md`).
- **AI-assisted workflow authoring ("Copilot")**: a draft → test → publish → apply lifecycle for Onboard
  task flows, paired with an audit-log service (`copilotAuditLogs`) — the strongest available evidence
  (still docs-only, not session-observed) that the "Cue" AI-agent marketing claim reflects a real
  AI-drafts/human-approves loop rather than a relabeled rules engine (`raw/api-reference.md`).
- **`exposeAsMcpTool`** OpenAPI tag found on at least one live v2 endpoint — Fountain is building a
  second, tool-callable agent surface distinct from the `.well-known/agent-skills` docs-discovery
  manifest (`raw/agent-skill-manifest.md`, `raw/api-reference.md`).
- Intercom **Fin** AI chat is present on the end-user help center — a named third-party AI vendor in the
  support stack, worth cross-checking against the "Emma" 24/7-support-agent marketing claim
  (`raw/help-center.md`).

### Naming archaeology: "OnboardIQ" / "OBIQ" — a pre-rebrand product surfacing three separate times

`X-OBIQ-SIGNATURE-V2` webhook signature header, the `connecting-a-custom-form-to-the-onboardiq-
applicant-portal` doc slug, and the Intercom help-center's `onboardingiq` workspace identifier all
independently point to a predecessor product name ("OnboardIQ"/"OBIQ") still embedded in production
infrastructure well after the "Fountain" brand — a real technology-lineage finding (three independent
surfaces corroborate, not one), consistent with an acquisition or an internal product rename that never
fully propagated through infra naming.

### Data-model depth (from the `Applicant` OpenAPI schema)

Applicant records embed, natively: full PII/compliance secure-fields (SSN, bank, passport, driver's
license, tax detail), I-9 + E-Verify state machines, a tagged-union background-check vendor abstraction
(Checkr / Onfido), a tagged e-signature vendor abstraction (HelloSign / DocuSign), Lessonly LMS
completion data, async-video-interview URLs tied to specific questions, a generic `assessments[]` slot,
granular TCPA-style SMS/call consent fields (with an internal ticket ID `AXHE-3408` visible in the
description — a real engineering-tracker leak), and a `partner_data[]` array whose documented example
partner name is **"AI Interview"** — i.e. a named third-party AI-interview vendor integration slot exists
in the core schema (`raw/api-reference.md`).

## Inferences

- Fountain is a **considerably deeper platform than "an ATS"**: the 12-microservice Fountain One catalog
  reveals a full WFM/scheduling module (serviceattendance, 81 endpoints — larger than the entire legacy
  v2 Hire surface), a talent-CRM/sourcing-pool layer with ML-based matching (servicepool), an
  engagement/pulse-survey product (servicepulse), and a referral-program module (servicereferral) — none
  of which are "ATS" features in the traditional sense. This matters directly for a competitive/product-
  strategy read: Fountain competes on breadth of the full frontline-worker-lifecycle suite (hire → onboard
  → schedule → engage → retain → offboard), not just top-of-funnel applicant tracking.
- The API surface's three generations (legacy Hire v2, Fountain One microservices, partner v1) plus the
  documented, dated host-consolidation timeline together read as a company **actively re-platforming a
  suite built via acquisition/internal-product-proliferation into one coherent gateway** — a live
  architecture-migration story, useful context for any integration-partnership timing decision.
- The AI-agent marketing claims (Anna/Emma/Sam/Cue) have **partial, real backing in the API surface**
  for at least the workflow-automation ("Cue"/Copilot) and document-compliance ("Anna"?-adjacent OCR)
  cases — but the support-agent case ("Emma") may be partly or wholly Intercom Fin under a custom
  persona, which would be a meaningfully different story (vendor-wrapped vs. in-house). This directly
  updates the recon-plan's hypothesis #2 from "unverified, treat as hypothesis" toward "partially
  corroborated for Cue and the compliance-OCR flow; still open for Emma."
- The `.well-known/agent-skills` manifest + `exposeAsMcpTool` OpenAPI tag are genuine, concrete evidence
  of forward-looking agent-interoperability investment on the platform/DX side — a distinct signal from,
  and stronger evidence than, the customer-facing "AI agent" personas.

## Open questions

- The 9 help-center collection titles/content (client-rendered, needs a real browser to recover — flag
  for `session`/`website` if either drives a browser against `help.fountain.com`).
- Whether Fountain's "Emma" support agent is Intercom Fin under a custom name, or a separate in-house
  system (checkable via the live product's support widget branding/network calls).
- Full `exposeAsMcpTool` tag coverage across the 108 v2 endpoints (only 1 sampled).
- Whether the ~537 `service*` pages carry embedded OpenAPI fragments like the v2 pages do, or are purely
  LoopBack-autogenerated prose (changes the method/confidence grade for that family).
- `PAPI` acronym expansion (referenced in `servicesecurity` + `hirePapiProfile` payload field, never
  spelled out).
- Whether a Fountain product changelog exists somewhere not linked from `llms.txt` (the agent-skill
  manifest's own description promises one; none was found) — cross-check with the `community` dimension.
- No named/certified HRIS or payroll connector catalog found (Slack is Zapier-only, HRIS is DIY
  webhooks) — cross-check with `website`/`community` for a partner-marketplace page not indexed here.

## Artifacts

- `raw/doc-map.md` — the full 593-page index, classified by API generation/service, with per-service
  endpoint counts and the section-to-file mapping used below.
- `raw/getting-started.md` — the two-generation auth model (Fountain One OAuth2 vs legacy Hire
  `X-ACCESS-TOKEN`) + the tenant/region URL model + the documented host-consolidation timeline.
- `raw/api-reference.md` — the v2 Hire REST API + the 12-microservice Fountain One catalog + the sampled
  `Applicant`/`WebhookSetting` OpenAPI schemas + the LoopBack fingerprint + the `exposeAsMcpTool` finding.
- `raw/webhooks.md` — the four independent webhook mechanisms + the synchronous External Processing URL
  (compliance OCR override hook).
- `raw/integrations-partners.md` — Custom Integrations (stage+label+webhook pattern), Slack (Zapier-only),
  HRIS sync (DIY webhooks, no certified connectors), custom-form embed, worker-portal embed, Partner
  Tasks, and the separate `partners.fountain.com` v1 partner API.
- `raw/faq-and-deprecations.md` — rate limits (120 req/min, secondary-key doubling), the empty-but-
  RFC-8594-compliant Hire deprecations table, and the dated WX host-consolidation deprecation notices.
- `raw/agent-skill-manifest.md` — verbatim `.well-known/agent-skills/index.json` + `SKILL.md`, and why
  this is a genuinely novel finding distinct from a normal docs crawl.
- `raw/help-center.md` — the Intercom-hosted end-user help center, the "OnboardIQ" naming corroboration,
  and the Intercom Fin AI-chat finding relevant to the "Emma" marketing claim.
