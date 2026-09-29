<!-- source: developer.fountain.com/reference/{overview,hire-api-overview,tenant-api-urls,frequently-asked-questions}.md · captured_at: 2026-08-09 · method: crawl-clip -->

# Getting started / auth model / tenancy

## Two parallel auth generations (a real architectural seam, not a doc artifact)

Fountain's developer docs describe **two distinct API generations that coexist today**:

### 1. "Fountain One" OAuth2 (current, preferred, product-suite-wide)

- Client-credentials OAuth2 flow. Token endpoint:
  `POST https://services.fountain.com/api/servicesecurity/processes/apikey/oauth/token?grant_type=client_credentials&scopes=employer`
  (Basic auth with `API_KEY:API_SECRET`). Resulting Bearer token valid **60 minutes**.
- Two key types: **Personal keys** (tied to a user, same permissions as that user) and **Integration
  keys** (tied to a role you assign when creating the integration — "create the most restricted role
  possible").
- All Fountain One / microservice traffic authenticates this way: `Authorization: Bearer <token>` (docs
  show a non-standard example header `Application: Bearer AUTH_TOKEN` in one snippet — likely a docs typo
  for `Authorization`, worth flagging as an open question).
- Single base host regardless of tenant/region: `https://services.fountain.com/api/<serviceName>/...`
  — "our authentication layer will automatically find the correct tenant and redirect requests."

### 2. Legacy "Hire" API key (`X-ACCESS-TOKEN` header)

- Pre-dates Fountain One; still fully documented and supported.
- **Private Hire API Key** — full CRUD, found under Company Settings → API → Developer Settings.
- **Trusted Party API Key** — a deliberately-restricted key that can ONLY create applicants (no read/
  update/delete). Designed to be handed to a third party for applicant-import without exposing full
  access; docs explicitly warn it must be used server-side only.
- A **secondary API key** can be requested to double the effective rate limit (see faq-and-deprecations.md).
- Legacy base URLs are **tenant/region-specific** (see below) — this is the literal mechanism behind the
  "Tenant API URLs" doc page.

## Tenant / region URL model (confirms the recon-plan hypothesis, with historical detail)

Historically Fountain Hire ran **multi-region, multi-tenant infrastructure** with distinct URL shapes:

| Login host you see | API base URL you use |
| --- | --- |
| `app.fountain.com` / `web.fountain.com` (main/default tenant) | `http://api.fountain.com/v2/` |
| `<region>.fountain.com` (e.g. `us-2.fountain.com`) | `http://<region>.fountain.com/api/v2` |
| Single-tenant / dedicated deployment | `https://<your_Fountain_hire_account_URL>.fountain.com/api/v2/<endpoint>` |
| Dedicated Worker Experience instance | `https://services.<customer_instance>.fountain.com` |

**This regional/tenant fragmentation is being actively consolidated** — a dated "API Deprecations" (WX)
entry states plainly:

- **2025-11-14**: "The Fountain API endpoint is now a single URL `services.fountain.com` for all
  customers, regardless of their tenant." Old tenant-specific endpoints (`eu-1`, `ap-1`, `sandbox`,
  single-tenant, Hire-specific URLs) **continue to work** but are no longer required.
- **2024-09-25**: the Worker Experience API base moved from `wxp-services.fountain.com` to
  `services.fountain.com` (old host removed 2025-01-01, except for customers on a dedicated instance).

**Read as a technology-architecture finding:** Fountain evolved from siloed per-region/per-tenant
infrastructure (consistent with an older, sharded-by-customer SaaS deployment model — plausibly one
Fountain-Hire-instance-per-large-customer) toward a single global API gateway ("Fountain One") that does
tenant resolution internally post-auth. The migration was still being messaged as recently as
2025-11-14 — i.e. this consolidation is **recent**, not a historical footnote.

## Unique identifiers

Most Fountain Hire entities (applicants, stages, interview sessions, etc.) carry a UUID. Docs recommend
storing these client-side for later reference.

## Support escalation pattern

Both the "insufficient rate limit" and "no API access visible" paths in the docs route to
`support@fountain.com` / a CSM — there is no self-serve API-access signup; access is provisioned by a
human on Fountain's side per account.
