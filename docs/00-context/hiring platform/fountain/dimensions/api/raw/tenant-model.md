<!-- source: https://developer.fountain.com/reference/{tenant-api-urls,wx-api-deprecations,frequently-asked-questions}.md · captured_at: 2026-08-09 · method: docs-reconstructed -->

# Fountain — "Tenant API URLs" model (VERIFIED against the recon-plan hypothesis)

The recon-plan hypothesis was: *"services.fountain.com is the real production API host, and the 'Tenant
API URLs' doc page implies a per-tenant subdomain/path model."* **Verified, with an important nuance the
hypothesis didn't anticipate: the per-tenant URL model is being actively RETIRED, not the current design.**

## Current (2025-11-14 onward) — single unified host, gateway-resolved tenancy

> "All Hire APIs are available through the base URL `https://services.fountain.com/api/servicehire`,
> regardless of region or tenant. In the background, our authentication layer will automatically find
> the correct tenant and redirect requests to the correct one." — `tenant-api-urls.md`

Tenancy is resolved **server-side from the authenticated principal** (the API key / OAuth token), not
from the URL. This is a meaningful platform-maturity signal: Fountain moved from a URL-encoded
multi-tenancy model to a gateway/auth-resolved one — the more common evolution path as a per-tenant-
deployed SaaS platform consolidates onto shared infrastructure.

## Legacy (still fully functional, not sunset) — three URL patterns

| Pattern | When used | Example |
|---|---|---|
| Main tenant | account logs in at `app.fountain.com` / `web.fountain.com` | `https://api.fountain.com/v2/applicants` |
| Region-specific | account logs in at `<region>.fountain.com` (e.g. `us-2`) | `https://us-2.fountain.com/api/v2/applicants` |
| Single-tenant / dedicated | dedicated infrastructure customers | `https://<your_Fountain_hire_account_URL>.fountain.com/api/v2/<endpoint>` |
| WX dedicated instance | customers with a dedicated Worker Experience deployment | `https://services.<customer_instance>.fountain.com` |

**All four legacy patterns continue to work indefinitely** per the 2025-11-14 deprecation note — Fountain
explicitly did NOT force a breaking migration, just made the new unified host "not required anymore."
This is a genuinely customer-friendly deprecation posture (contrast with the more common "sunset by date
X" pattern seen even in Fountain's own Hire v2 endpoint-level deprecations via RFC 8594 Sunset headers).

## Reading between the lines — what this implies architecturally

- Fountain's regional/single-tenant model strongly implies **per-region or per-customer database/infra
  isolation** at some point in the platform's history (you don't build a region-routing URL scheme for a
  single shared multi-tenant DB) — likely inherited from the original Hire (Rails) product's scaling
  strategy, later abstracted behind a gateway as the platform grew via the Worker Experience acquisition/
  build-out.
- The **"WX dedicated instance"** pattern (`services.<customer_instance>.fountain.com`) surviving
  alongside the shared-host default suggests enterprise customers can still opt into (or are grandfathered
  into) isolated infrastructure — a data-residency / compliance lever worth noting for the competitive-
  positioning rollup (background-check/compliance data is sensitive; dedicated infra is a plausible
  enterprise sales lever).

## Open questions

- Whether new customers are ever placed onto a legacy regional/single-tenant URL today, or whether that
  path is closed to net-new accounts and only serves pre-2025-11-14 customers (not documented either way).
- No explicit mention of EU/data-residency-specific routing beyond the generic "region" concept — a
  compliance-relevant gap if Fountain markets GDPR/EU-data-residency guarantees (cross-check against
  `infra-backend-fingerprint`'s trust/security pages).
