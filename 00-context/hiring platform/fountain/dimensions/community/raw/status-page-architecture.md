<!-- source: https://status.fountain.com/api/v2/components.json + /api/v2/incidents.json · captured_at: 2026-08-09 · method: wire-tap-browser-equivalent (public JSON API, unauthenticated) -->

# Fountain — Statuspage.io component + incident signal

Confirmed genuine Atlassian Statuspage.io instance (page id `tp2f5gp8blgc`). Component list fetched
verbatim from the public `/api/v2/components.json` endpoint (no auth required); 39 components across 6
groups + several ungrouped ("services") entries.

## Component groups (name, notable members, `created_at` = when Fountain started publicly monitoring it)

| Group | Members | Earliest / notable `created_at` |
| --- | --- | --- |
| **Core** | API ("Fountain Developer API V2.0"), Dashboard, Webhooks, Background Processing | 2016-09-27 (API/Dashboard/Background Processing — founding-era); Webhooks added 2021-01-21 |
| **FountainAI** | FountainAI, AI Interviews | FountainAI since **2023-04-04**; AI Interviews added **2026-07-06** (very recent — same window as the Cue/Sam changelog push) |
| **Hire Go / Assist** | (single component) | 2024-09-27 |
| **Worker Experience Platform** | (single component) | 2024-09-27 |
| **Data** | Warehouse Connections, Analytics | Analytics since 2016; Warehouse Connections added **2026-03-24** |
| **Messaging** | Email, Twilio SMS ×5 regions (NA long/short code, EMEA, LatAm, delivery callbacks), WhatsApp, Bird Messaging ×4 regions (NA/LatAm/EMEA/APAC) | Twilio since 2019-04-29; WhatsApp 2022-10-25; **Bird Messaging added 2026-03-30** — a second SMS/messaging vendor stood up alongside Twilio across all 4 regions in the same month, i.e. very recent multi-provider redundancy or a vendor migration in progress |
| **Infrastructure Providers** | Cloudflare (DNS), AWS (us-east-1, us-east-2, ap-south-1, eu-central-1, + S3 in us-west-1/eu-west-1/ap-southeast-1/sa-east-1), Azure ("Frontend application and API servers") | **AWS compute regions (us-east-1/2, ap-south-1, eu-central-1) all added 2025-10-20** — a single-day batch-add, reads as a real infra scale-out or a new region-aware architecture rollout ~10 months ago; Azure present since 2021-01-19 |
| **(ungrouped, "Other Integrations")** | Checkr (background checks, 2022-07-05), DropboxSign (e-sign, 2022-05-25, split into 3 sub-flows: callbacks / send / embedded), Pusher (2022-08-04), Everify (E-Verify eligibility, 2022-08-15), Cronofy (scheduling, 2024-04-23) | most 3rd-party integration components added in a tight May–Nov 2022 window — reads as a deliberate "integration platform" build-out year |

## Reads / findings

1. **Multi-cloud, not single-vendor.** Both AWS (compute + S3, multi-region) and Azure ("frontend
   application and API servers") are monitored as first-class components — Fountain runs a genuine
   multi-cloud footprint, not just a CDN-in-front-of-one-cloud setup.
2. **No public microservice-level granularity for "security"/"workforce"/"hire" backend split.** The
   00-recon-plan.md hypothesis (from `services.fountain.com/api/servicesecurity/...`,
   `.../serviceworkforce/...`, `.../servicehire/...` path prefixes) implied a microservices split — the
   public status page does **not** corroborate this at the monitoring-component level: "Core" bundles
   API/Dashboard/Webhooks/Background Processing as one undifferentiated group. This doesn't refute the
   backend path hypothesis (internal service boundaries need not be externally monitored separately),
   but it means the status page is **not** independent corroboration for it — record as open, not fact.
3. **`Pusher` as a monitored component confirms a WebSocket/pub-sub realtime layer** exists in production
   (corroborates a `deployed-client-bundle` vendor-chunk finding if one was made independently).
4. **The FountainAI → AI Interviews component timeline independently corroborates the changelog's AI
   investment narrative from a wholly separate data source** (component-creation timestamps vs. release
   notes): FountainAI branding dates to 2023, but a *dedicated* "AI Interviews" component appears only in
   **July 2026** — squarely inside the Cue (Apr 2026) / Sam (Jun 2026) launch window documented in
   raw/changelog-digest.md. Two independent first-party surfaces agreeing on the same recent-direction
   claim.

## Incident history (50 most recent, `2025-11-11` → `2026-07-31`, ~8.5 months)

Impact distribution: `none`: 24 · `minor`: 13 · `major`: 10 · `critical`: 2 · `maintenance`: 1.
Average ≈ 5.9 incidents/month (most low-impact, but a non-trivial major/critical tail: 12 of 50 were
major-or-worse).

**Two critical incidents, both June 2026** — a rough month:
- "Analytics Service Degradation" (critical, 2026-06-12)
- "Platform Severely Degraded" (critical, 2026-06-24)

**Notable major incidents:** "Outbound Email Delivery Interruption" (2026-07-11), "Login issues on Hire
UI" (2026-07-30, ~70 min, users unable to reach hiring/openings pages), "Partial Analytics Service
Degradation" (2026-06-16), "Partial Service Degradation" (2026-06-01), "Issues logging in to us-2"
(2026-05-18), "Cue agent service disruption" (2026-05-12, the third Cue incident in 2 weeks).

**Cue-specific:** 3 named "Cue agent service disruption" incidents in the agent's first month live
(2026-04-28 minor, 2026-05-06 minor, 2026-05-12 major) — no further Cue-named incidents appear in the
remaining ~2.5 months of the sample, consistent with (but not proof of) early-launch instability that
was subsequently stabilized.

**Analytics-specific:** 3 incidents in a 5-week window (2026-06-12 critical, 2026-06-16 major, 2026-07-17
minor "stale data... for EU Customers"), shortly after the "Warehouse Connections" component launched
(2026-03-24) — reads as a still-maturing data-pipeline integration.

**Named dedicated-tenant environments (a real customer-architecture finding).** "Planned downtime"
incident titles name specific environment identifiers distinct from the standard region components:
`us-2`, `us-4`, `eu-1`, `ap-1`, `amazon-mm`, `amazon-eu-dsp`, `ceracare`. The `amazon-mm` / `amazon-eu-dsp`
pair strongly implies **Amazon logistics (Middle Mile / DSP — Delivery Service Partner driver hiring) runs
on a dedicated, separately-scheduled environment**, distinct from the shared regional pools — i.e.
Fountain's largest accounts get isolated deployment/maintenance windows, not just row-level multi-tenancy.
`ceracare` likely names a second large dedicated-environment customer. This corroborates the "logistics"
vertical the company markets to (see raw/changelog-digest.md press-release table) with an independent,
non-marketing data source.

## Artifacts

- Full component JSON fetched from `status.fountain.com/api/v2/components.json` (39 components; digested
  above — not pasted verbatim, no secrets present in a public status API).
- Full incident JSON fetched from `status.fountain.com/api/v2/incidents.json` (50 records; digested above).
