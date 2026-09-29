<!-- source: https://app.fountain.com/80a74d4/{runtimeEnvVars.js, main.js} + live source maps · captured_at: 2026-08-09 · method: source-map-reassembly -->

# Fountain — Embedded env config (field names only — values redacted per ingestion §7)

`app/runtimeEnvVars.js` is deliberately isolated into its **own webpack chunk** (`splitChunks` cacheGroup
`config`) specifically so ops can "swap the file" at deploy time without a full rebuild — i.e. this file
IS the runtime-config injection point by design, source-commented as such. All `REACT_APP_*` names below
were recovered from either this file's reassembled source or `grep`-mining `REACT_APP_` across all 1757
first-party app files in `main.js`'s source map.

## Fields found (name → purpose; value = `<REDACTED:env-value>` per §7 unless noted public-by-design)

| Field | Purpose (from source context) | Value observed |
| --- | --- | --- |
| `REACT_APP_MONOLITH_BASE_URL` | app-own API/backend origin | derived from hostname (`domainMeta.monolithOrigin`), not a secret — `web.fountain.com` for prod |
| `REACT_APP_GLOBAL_API_BASE_URL` | `${monolith}/api_self_serve/v1` | derived, not a secret |
| `REACT_APP_GLOBAL_API_BASE_URL_V2` | `${monolith}/api_self_serve/v2` | derived, not a secret |
| `REACT_APP_LANDING_PAGE_URL` | `${monolith}/users/sign_in` (Devise sign-in path) | derived, not a secret |
| `REACT_APP_SIGN_OUT_REDIRECT_URL` | same as above | derived, not a secret |
| `REACT_APP_HIRE_GO_BASE_URL` | origin of the separate "Fountain Go" candidate/SMS app (`go.fountain.com` prod) | derived, not a secret |
| `REACT_APP_WX_COPILOT_URL` | UMD bundle URL for the "Cue" AI-copilot micro-frontend | derived fallback observed: `https://ftn-shared-components.fountain.com/wx-copilot/v8/release/<channel>/wx-copilot.umd.js` — no override set in this deploy |
| `REACT_APP_WX_NAVBAR_URL` | sibling UMD bundle for the nav-bar micro-frontend | derived fallback, same pattern, `wx-navbar` v3 |
| `REACT_APP_WX_COPILOT_RELEASE_CHANNEL` / `REACT_APP_WX_NAVBAR_RELEASE_CHANNEL` | release channel selector (`stable`/`main`, or tenant-pinned) | not set in this deploy → falls to tenant map / environment default |
| `REACT_APP_WX_LAUNCH_DARKLY_CLIENT_SIDE_ID` | LD client-side ID override for the Cue subsystem specifically | not set in this deploy → falls back to `domainMeta.launchDarklyClientSideId` (captured in the shared feature-flags.md — LD client-side IDs are public-by-design) |
| `REACT_APP_CLEARBIT_API_BASE_URL` | Clearbit company-enrichment API base | `<REDACTED:env-value>` (unset in this deploy — resolves undefined) |
| `REACT_APP_FAKER_SEED` | deterministic seed for `faker-js` (test/demo data generation) | `<REDACTED:env-value>` (unset in this deploy) |
| `REACT_APP_POSTHOG_API_KEY` | PostHog project API key (analytics/feature-flag SDK) | `<REDACTED:env-value>` — not found baked into `runtimeEnvVars.js`; likely inlined at its own point-of-use chunk, not pursued further (redact-by-default) |
| `REACT_APP_POSTHOG_HOST` / `REACT_APP_POSTHOG_UI_HOST` | PostHog ingestion / UI host overrides | `<REDACTED:env-value>` |
| `REACT_APP_POSTHOG_DEBUG` | PostHog debug-mode toggle | `<REDACTED:env-value>` |
| `REACT_APP_STRIPE_KEY` | Stripe publishable key (client SDK init) | `<REDACTED:env-value>` — field only; not found baked in the chunks fetched (likely in a lazy Payments/Sourcing chunk not fetched — see gaps) |
| `REACT_APP_PUSHER_APP_KEY` / `REACT_APP_PUSHER_CLUSTER` | Pusher realtime client init | `<REDACTED:env-value>` |
| `REACT_APP_HELLOSIGN_CLIENT_ID` | HelloSign (Dropbox Sign) embedded e-signature client ID | `<REDACTED:env-value>` |
| `REACT_APP_ONESIGNAL_WEB_PUSH_APP_ID` | OneSignal web-push app ID | `<REDACTED:env-value>` |
| `REACT_APP_FACEBOOK_APP_ID` | Facebook App ID (likely career-site social apply/share) | `<REDACTED:env-value>` |
| `REACT_APP_CHARGEBEE_ANNUAL_PLAN_ID` / `REACT_APP_CHARGEBEE_MONTHLY_PLAN_ID` | Chargebee subscription-plan identifiers — this is the **SaaS subscription billing** system (distinct from the Stripe usage, which is scoped to sourcing/job-ad spend — see bundle-map.md) | `<REDACTED:env-value>` |
| `NODE_ENV` | build env | observed baked literal: `production` (not sensitive) |

## Redaction log

No live secret-shaped values (`pk_live_`, `sk_live_`, `phc_`, `AIza…`, etc.) were found baked into any
of the chunks actually fetched (`main.js`, `main.js.map`, `npm.api-clients.js`, `runtimeEnvVars.js` + its
map) — checked via pattern scan, zero hits. Several `REACT_APP_*` fields resolved to `<REDACTED:env-value>`
above are simply **not present as literal values** in what was fetched (they're either unset in this
deploy, or defined at their point-of-use in a lazy chunk outside this run's fetch bound) — this is
recorded as a gap, not a confirmed-empty finding, since a value-bearing chunk was not exhaustively hunted
per the redact-by-default discipline (§7: treat any value as a secret until proven public).
