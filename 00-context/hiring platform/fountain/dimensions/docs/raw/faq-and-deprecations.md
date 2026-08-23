<!-- source: developer.fountain.com/reference/{rate-limitations,frequently-asked-questions,deprecations,wx-api-deprecations}.md · captured_at: 2026-08-09 · method: crawl-clip -->

# Rate limits, FAQ, deprecations

## Rate limits

- **120 requests/minute default**, communicated via `X-Api-Ratelimit-{Limit,Limit-Remaining,Reset}`
  headers on every response.
- Exceeding it returns `429` with body `{"error":{"msg":"Too many API requests...","name":"exceeded_rate"}}`.
- No published per-plan/tier rate-limit differentiation — the only stated ways to raise the ceiling are
  (a) request a secondary API key (doubles it), (b) upgrade to single-tenant hosting (higher default per
  key), or (c) wait for Fountain's forthcoming Bulk APIs (mentioned as in-progress, no ETA, no public
  beta link found).

## FAQ (developer-facing)

- The FAQ is entirely about **rate limits and API key rotation** — no product-usage FAQ content at all
  in the developer-docs FAQ (contrast with the "Frequently Asked Questions" title suggesting broader
  scope). Key rotation flow: request a Secondary Token → promote Secondary to Primary (deletes old
  Primary) — a manual, blue/green-style key rotation with an explicit warning to pause traffic first.

## API Deprecations (Hire, `reference/deprecations.md`)

Page exists with a **defined table schema** (URL / HTTP Verb / Sunset Date / Documentation / Notes) and
implements **RFC 8594** (`Sunset` + `Link` response headers on deprecated endpoints) — but the table body
was **empty** at capture time: no currently-deprecated Hire v2 endpoints. The RFC-8594 mechanism itself
is a genuine engineering-maturity signal (a real deprecation protocol, not just a blog-post announcement)
even though nothing is presently listed.

## API Deprecations (Worker Experience / WX, `reference/wx-api-deprecations.md`)

Two dated entries, both about **host consolidation**, not endpoint removal:

- **2025-11-14**: single global host `services.fountain.com` replaces all tenant-specific hosts
  (`eu-1`, `ap-1`, `sandbox`, single-tenant, Hire-specific) — old ones still work, just not required.
- **2024-09-25**: WX API base moved `wxp-services.fountain.com` → `services.fountain.com`; old host
  removed **2025-01-01** except for customers on a dedicated Worker-Experience instance
  (`services.<customer_instance>.fountain.com`).

Read together with getting-started.md's tenant-URL table, this is a **directly documented, dated
infrastructure-consolidation timeline** — a real architecture-evolution signal spanning ~14 months
(Sept 2024 → Nov 2025) of migrating off per-tenant/per-region hosts toward one gateway.
