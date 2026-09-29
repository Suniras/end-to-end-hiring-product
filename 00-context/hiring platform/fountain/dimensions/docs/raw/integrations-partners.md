<!-- source: developer.fountain.com/reference/{custom-integrations,slack-integration,sync-with-hris,connecting-a-custom-form-to-the-onboardiq-applicant-portal,embedding-the-worker-portal,partner-tasks}.md + partners.fountain.com/llms.txt · captured_at: 2026-08-09 · method: crawl-clip -->

# Integrations & the Partner ecosystem

## Custom Integrations pattern (the canonical "how customers wire Fountain to everything else")

Fountain's documented integration pattern is deliberately simple and stage-driven, built entirely from
existing primitives (webhooks + PUT):

1. Applicant lands in a stage → webhook fires with applicant details (incl. UUID).
2. Third-party service does its thing (e.g. sends a text, runs a check).
3. Third-party calls back with `PUT /v2/applicants/{id}/labels/{label}` (`X-ACCESS-TOKEN` auth) to mark a
   label complete.
4. If the stage has "Auto-Advance when all labels are checked" on, the applicant advances automatically.

A second documented pattern uses a **PUT-then-filter** mechanism to conditionally reject applicants
based on a data field a third party sets (e.g. `data.reject = "not experienced"` routes through a
workflow filter into a Rejected stage). This is Fountain's entire "workflow scripting" surface as
exposed to integrators — no formal rules-DSL is documented; it's stage graph + labels + filters + API
calls.

## Slack Integration — Zapier-mediated, no native Slack app

Explicitly Zapier-based: create a Zap with a Fountain webhook trigger → connect to Slack. No native
Fountain Slack app/OAuth integration is documented. This is a comparatively thin integration relative to
the sophistication elsewhere (worth noting as a low-investment area).

## HRIS Sync — webhook-only, not a certified connector

"Sync with your HRIS" is a two-paragraph doc describing: (a) a webhook fires when an applicant reaches
Approved with full applicant data, and (b) marking a worker Inactive via POST triggers an automatic
webhook to the HRIS. **No named/certified HRIS connectors are documented** (no Workday, ADP, UKG, Paycom
integration pages found in the crawled index) — "Sync with your HRIS" is generic webhook plumbing the
customer's own HRIS integration team must consume, not a pre-built connector catalog. This is a real
gap relative to the "seamless HRIS sync" framing the recon-plan's hypotheses flagged for verification —
docs show a DIY webhook pattern, not a marketplace of pre-built HRIS connectors.

## Connecting a Custom Form — the syndication/embed pattern

For customers who host their own careers page and want to funnel applicants into Fountain: `POST
/v2/applicants` server-side (never client-side, to avoid exposing the API token) → response includes
`portal_url` → redirect the applicant there to continue in the Fountain-hosted application flow. UTM
parameters pass straight through as arbitrary `data` fields (no special UTM handling — just naming
convention). The page title references the "OnboardIQ Applicant Portal" — **OnboardIQ** is another
internal/legacy product name surfacing in a URL slug (alongside "OBIQ" in the webhook signature header —
both likely abbreviations of the same predecessor product, corroborating a Fountain-Hire-was-built-on-or-
acquired-"OnboardIQ" hypothesis; not confirmed elsewhere in the crawled docs).

## Embedding the Worker Portal (native-app embed pattern)

Generate a short-lived (60-minute) authenticated impersonation URL via
`GET /api/servicesecurity/processes/workers/{workerUuid}/impersonate`, optionally append
`&next=/task-flow/{FLOW_UUID}` to deep-link, then iframe it inside a native app. On expiry the worker is
bounced to an email-verification link **outside** the embedding app — a real UX limitation for anyone
trying to build a fully-embedded native experience.

## Partner Tasks — the deepest partner-integration primitive (Worker Experience / Onboard)

Lets a partner's own workflow become one step inside a Fountain Onboard task flow via an iframe'd
"Partner Task": configurable title, estimated completion time, iframe URL (with templated variables),
an "end event" the portal listens for to auto-advance, optional auto-appended context params
(`wxWorkerUuid`, `wxAssignedTaskUuid`, `wxTaskFlowUuid`, `wxCompanyUuid`), and an optional
admin-review gate. The partner pushes status updates back via
`POST http://wxp-services.fountain.com/api/servicetodo/processes/partnerTasks/{assignedTaskUuid}`
(Bearer auth) with a `taskStatus` state machine (`ready → inProgress → completed/error`) plus a
free-form `partnerStatus` (label/color/details) shown in an admin audit trail. **Note:** this example
still uses the legacy `wxp-services.fountain.com` host, deprecated in favor of `services.fountain.com`
as of 2024-09-25/2025-01-01 per the WX API Deprecations page — the docs page itself was not updated to
reflect its own platform's URL consolidation (a docs-freshness gap, not a product gap).

## `partners.fountain.com` — a separate, sibling ReadMe-hosted docs site for partners

Its own `llms.txt` lists:

**Guides**: Partner Onboarding Guide, Update Partner Settings, "6. POST to Fountain" (POSTing applicant
data + partner status/details back), Applicant Lifecycle (how a service communicates when applicants
land in "your Partner Stage" — i.e. Fountain has a first-class "Partner Stage" workflow-graph node type),
Data Collection, Accessing the Worker Experience API.

**API Reference** (partner-scoped, `v1`, distinct from the main `v2` Hire API): update an applicant's
partner-specific labels, create Applicant Status, create/batch-update Applicant Details, retrieve/update
a partner record, retrieve/post-event to an assigned partner task (mirrors the `servicetodo` partner-task
endpoints above but under the partner-facing host/path).

This confirms Fountain runs a **third, partner-scoped API surface** (`v1/partners/...`) distinct from
both the legacy Hire `v2` API and the Fountain One `service*` microservice APIs — a third generation/
scope of API design coexisting in production.

## Open questions

- No named/certified HRIS, payroll, or ATS-adjacent connector marketplace found in crawled docs (Slack
  is Zapier-only; HRIS is DIY webhooks) — worth a cross-check against the website/community dimensions
  for a partner directory or marketplace page not indexed in llms.txt.
- Whether `partners.fountain.com`'s `v1` API is still actively maintained or a frozen legacy surface (no
  deprecation notice found there, but also no recent-dated content spotted in the pages crawled).
