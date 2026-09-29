<!-- source: https://developer.fountain.com/reference/{overview,hire-api-overview,tenant-api-urls,wx-api-deprecations}.md · captured_at: 2026-08-09 · method: docs-reconstructed (narrative) + verbatim OpenAPI securitySchemes (schema) -->

# Fountain — Auth model (THREE coexisting schemes, one active migration)

## 1. "Fountain One" unified OAuth2 (current, preferred — all products)

- **Token endpoint:** `POST https://services.fountain.com/api/servicesecurity/processes/apikey/oauth/token`
- **Grant type:** `client_credentials`
- **Credentials:** HTTP Basic (`-u 'API_KEY:API_SECRET'`) in the token request; `grant_type` + `scopes` (e.g. `employer`) as query/form params.
- **Token lifetime:** 60 minutes (no refresh-token flow documented — re-mint via the same client_credentials call).
- **Subsequent calls:** `Authorization: Bearer <token>` — NOTE the docs page's own curl example is inconsistent, showing `-H 'Application: Bearer AUTH_TOKEN'` in one place (likely a docs typo for `Authorization`) vs the OpenAPI `securitySchemes.jwt = {type: http, scheme: bearer}` which implies the standard `Authorization: Bearer` header. Treat `Application:` as a probable doc typo, not a real header name — flagged as an open question.
- **Key types:**
  - **Personal keys** — Profile → Manage API Keys; inherit the creating user's own permissions.
  - **Integration keys** — Settings → Integrations & API Keys; scoped to a role assigned at integration-creation time (least-privilege pattern the docs explicitly recommend).
- **Base URL is now tenant-agnostic:** `https://services.fountain.com/api/servicehire/v2/...` and `https://services.fountain.com/api/service<name>/...` — "the authentication layer will automatically find the correct tenant and redirect requests" (a gateway-mediated multi-tenancy model, not a URL-encoded tenant).
- **Scope model:** a single scope string observed (`employer`) — no evidence of a granular OAuth scope list; the finer-grained authorization unit is the **role** assigned to an Integration key, not the OAuth `scope` claim.

## 2. Hire API legacy key (`X-ACCESS-TOKEN` header) — Hire product only, still fully supported

- **Header:** `X-ACCESS-TOKEN: <api-token>`
- **Where to find it:** Fountain dashboard → account name → Company Settings → API (under Developer Settings) → "Show API Keys".
- **Primary + Secondary key pattern:** an account can hold two active Hire API keys simultaneously — explicitly offered as a **rate-limit-doubling mechanism** (see rate-limits.md) and a **zero-downtime rotation mechanism** (promote secondary → primary, generate new secondary).
- **No OAuth token exchange for this scheme** — the raw key is the credential on every request (a long-lived static bearer-equivalent, not a short-lived token) — a materially weaker posture than scheme 1 (60 min token) if the raw key leaks.
- **Embedded in every legacy-family (`hire-v2`) OpenAPI fragment as:** `securitySchemes.ApiKeyAuth = {type: apiKey, name: X-ACCESS-TOKEN, in: header}`.

## 3. Trusted Party API Key (Hire, create-applicant-only)

- A restricted variant of scheme 2, shareable with a third party for applicant ingestion.
- **Cannot** retrieve, update, or delete — POST-create-applicant only.
- Docs explicitly warn: use **server-side only** (never embed client-side) to avoid key exposure + spam applicant creation.
- Subject to the same rate limit as the primary key (not a separate pool).

## Regional / single-tenant legacy URLs (superseded, still functioning)

Before the Aug-2026-documented unification, Hire customers used one of:
- `https://api.fountain.com/v2/...` — main/default tenant
- `https://<region>.fountain.com/api/v2/...` — e.g. `us-2.fountain.com` for region-pinned accounts
- `https://<customer_instance>.fountain.com/api/v2/...` — single-tenant/dedicated accounts
- Worker Experience dedicated instances: `https://services.<customer_instance>.fountain.com`

**Migration timeline (from `wx-api-deprecations.md`):**
| Date | Change |
|---|---|
| 2024-09-25 | WX default base URL moves `wxp-services.fountain.com` → `services.fountain.com` (both live in parallel) |
| 2025-01-01 | `wxp-services.fountain.com` originally slated for full removal (superseded by the 2025-11-14 note below — both hosts were apparently still functioning past this date) |
| 2025-11-14 | **All Fountain APIs (Hire + WX) unified onto the single host `services.fountain.com`**, gateway-routed regardless of tenant/region; all prior tenant-specific/regional/single-tenant/Hire-specific URLs continue working (not sunset), just "no longer required" |

This is a live, still-in-progress **API-gateway consolidation** — a genuine architecture signal: Fountain
grew via (likely) acquisition/organic-microservice-sprawl into a legacy Hire (Rails-flavored) monolith +
a fleet of newer `service*` (LoopBack-flavored) microservices, and is actively unifying them behind one
gateway host + one OAuth model, while preserving full backward compatibility for the legacy per-tenant/
per-region URL scheme and the legacy header-key auth.

## Worker/Employer impersonation (session minting for embedded UX)

- `GET /api/servicesecurity/processes/workers/{workerUuid}/impersonate` and the employer equivalent mint
  a **60-minute authenticated URL** for embedding the Worker Portal in a partner's native app (iframe).
- On expiry, the worker is bounced to an out-of-app email-verification re-auth link — a real UX
  limitation for any embedded-portal integration (a partner cannot silently refresh past 60 minutes).

## Open questions

- Whether the OAuth Bearer header is literally `Authorization: Bearer` (implied by `securitySchemes.jwt`)
  or the docs' own `Application: Bearer` example is real — **not resolved without a live authenticated
  probe** (no session available this run; recommend a header-name check in any future `session` run).
  Recorded here for handoff; the two docs I fetched are the only current statement I could confirm.
- No granular OAuth **scope catalog** beyond the single `employer` scope seen — unclear if the platform
  supports finer resource/verb scopes.
