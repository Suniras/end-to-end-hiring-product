<!-- source: https://olivia.paradox.ai/login (inline window.__NUXT__.config script) · captured_at: 2026-08-09 · method: bundle-string-mine -->

# Paradox — embedded env / runtime config (Nuxt `window.__NUXT__.config.public`)

Field names only. Every credential/key/license-shaped VALUE is redacted per ingestion §7 rule 3, logged
below. Pure routing hostnames (not secrets — already independently visible in the `Content-Security-
Policy` response header, which is standard HTTP metadata, not an embedded app secret) are reported as-is
because redacting them would hide real, freely-observable architecture facts.

| Field | Value / redaction |
| --- | --- |
| `public.base` | `olivia.paradox.ai` (hostname, kept) |
| `public.awsCdnUrl` | `https://cdn.olivia.paradox.ai` (hostname, kept) |
| `public.staticBucketUrl` | `https://apply-prod-static.s3.us-east-1.amazonaws.com` (hostname, kept — an S3 bucket name, not a credential) |
| `public.app.domain` | `olivia.paradox.ai` (kept) |
| `public.app.helpUrl` | `https://olivia.paradox.ai/help` (kept) |
| `public.app.contactUsUrl` | `https://paradox.ai/contact.html` (kept) |
| `public.app.complianceEmail` | `compliance@paradox.ai` (kept — a published contact address, not PII of an individual) |
| `public.app.environment` | `Prod` (kept) |
| `public.app.brandingName` | `Olivia by Paradox Ai` (kept) |
| `public.auth.basePath` | `/api/_auth` (kept — routing) |
| `public.auth.pages.signIn` | `/login` (kept — routing) |
| `public.auth.disableServerSideAuth` | `false` (kept — a boolean config flag, not a secret) |
| `public.sentry.dsn` | `<REDACTED:SENTRY_DSN>` (field kept; the DSN string + embedded project-key value redacted — DSNs are commonly considered non-sensitive/write-only, but redacted here per the strict "treat every value as secret until proven public" instruction) |
| `public.sentry.environment` | `Prod` (kept) |
| `public.sentry.release` | `app@3.0.0-beta.13` (kept — a version string, valuable architecture signal: confirms active beta versioning) |
| `public.pendo.apiKey` | `<REDACTED:PENDO_API_KEY>` |
| `public.genai.endpoint` | `https://genai.paradox.ai` (kept — hostname; a **dedicated GenAI backend subdomain**, distinct from `api.paradox.ai` — architecturally significant) |
| `public.ptLicenseKey` | `<REDACTED:LICENSE_KEY>` (a PhantomJS/headless-browser-testing-tool-shaped OEM license string — field kept, full value redacted) |
| `public.socketUrl` | `wss://ws.paradox.ai` (kept — hostname; confirms a **dedicated WebSocket host**, `ws.paradox.ai`, separate from the REST API host) |
| `public.whatsappOnboarding.appConfigId` | `<REDACTED:WHATSAPP_APP_CONFIG_ID>` |
| `public.whatsappOnboarding.appId` | `<REDACTED:WHATSAPP_APP_ID>` |
| `public.whatsappOnboarding.solutionId` | `<REDACTED:WHATSAPP_SOLUTION_ID>` |
| `public.ssoSystemKey` | `""` (empty at this tenant/unauth state) |
| `public["nuxt-seo-utils-version"]` | `8.2.1` (kept — library version) |
| `public["nuxt-robots"].version` | `6.0.9` (kept — library version) |

## SSR data payload (`__NUXT_DATA__`, separate from `config.public`)

| Field | Value / redaction |
| --- | --- |
| `apiURL` | `https://api.paradox.ai` (kept — confirms the SPA's own backend host, corroborates `infra-backend-fingerprint`) |
| `env` | `production` (kept) |
| `url` | `https://olivia.paradox.ai/` (kept) |
| `featureFlags["system:theme"]` | `{enabled:false}` at capture time (kept — flag state, not a secret) |
| `featureFlags["ai_interview_page:enabled_new_ui"]` | `{enabled:true, value:"0"}` at capture time (kept — appended to shared feature-flags.md) |
| `ability` (CASL permission set) | `{"company_ids": "*"}` unauthenticated default (kept — a permission-condition shape, not a secret) |
| A 40-char hex string embedded as a session/build fingerprint (`"eb4a25fb9699919673ac53961930c8dc7273619b"`) | `<REDACTED:HEX_ID>` — could not confirm purpose (build hash vs. session/device id); redacted defensively |

## Redaction log (`_meta.redactions` equivalent)

- `public.sentry.dsn` → `<REDACTED:SENTRY_DSN>` (was a full `https://<32-hex>@devsentry.paradox.ai/30` URL)
- `public.pendo.apiKey` → `<REDACTED:PENDO_API_KEY>` (was a 36-char UUID-shaped key)
- `public.ptLicenseKey` → `<REDACTED:LICENSE_KEY>` (was a long colon-delimited license string ending in a 64-hex-char signature)
- `public.whatsappOnboarding.{appConfigId,appId,solutionId}` → `<REDACTED:WHATSAPP_*_ID>` (were 15–16 digit numeric Meta/WhatsApp Business Platform identifiers)
- SSR hex fingerprint → `<REDACTED:HEX_ID>`
