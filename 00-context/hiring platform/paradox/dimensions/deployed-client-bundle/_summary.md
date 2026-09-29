---
dimension: deployed-client-bundle
target: paradox
status: complete
access_grade_used: runtime:reachable
method: bundle-string-mine
completeness_pct: 65
confidence: medium
captured_at: 2026-08-09
sources:
  - https://olivia.paradox.ai/
  - https://olivia.paradox.ai/login
  - https://olivia.paradox.ai/candidate
  - https://olivia.paradox.ai/sitemap_index.xml (404 fallback — revealed the legacy Gen-B shell)
  - https://olivia.paradox.ai/robots.txt
  - https://olivia.paradox.ai/manifest.webmanifest
  - https://cdn.olivia.paradox.ai/_nuxt/DElBek1l.js
  - https://cdn.olivia.paradox.ai/_nuxt/Dreh011s.js
  - https://cdn.olivia.paradox.ai/caches/202608/js/common.34448012115f.js
  - https://cdn.olivia.paradox.ai/caches/202608/js/page.b12fa8c10ff0.js
  - https://cdn.olivia.paradox.ai/caches/202608/js/templates.815251a3d33f.js (EOF-only, source-map check)
  - https://cdn.olivia.paradox.ai/caches/202608/js/vendorCommon.d8c196d16796.js (EOF-only)
  - https://cdn.olivia.paradox.ai/caches/202608/js/vendor.192478c3b099.js (EOF-only)
gaps:
  - "No source map found on any of the 5 fully-or-tail-checked chunks (2 Nuxt + 3 legacy JS files) — confirmed closed-source at the bundle level."
  - "Nuxt Gen-A's page-level lazy chunks (everything past /login) were never fetched — they require an authenticated client-side navigation to resolve their chunk hashes, and no static chunk-manifest was found embedded in the two unauth-reachable entry chunks."
  - "The candidate-facing SMS/chat conversation UI (the actual Olivia chat interface, as opposed to the recruiter/admin console) was not located as a distinct client bundle or route — see Open questions."
  - "Gen-B legacy bundle: templates.js/vendorCommon.js/vendor.js (6.35 MB combined) were only EOF-probed for source maps, not string-mined in full, per the size/time discipline (§8) — low marginal value expected (mostly third-party libs + precompiled HTML templates)."
  - "Per-tenant injected config (API keys, tenant-specific feature flags) not observed — the fetched pages are the generic unauthenticated/no-tenant shell."
---

# Paradox (olivia.paradox.ai) — deployed-client-bundle capture

## Method

Followed the 302 from `https://olivia.paradox.ai/` → `/login`. Fetched the HTML shell, its two `<script
type=module>` entry chunks, and the Nuxt SSR data payload (`window.__NUXT__.config` + `__NUXT_DATA__`).
Probed `/candidate` (200 — a second registered unauth-reachable route) and several other route guesses
(`/apply`, `/chat`, `/interview`, `/widget`, `/c/test` — all 404). A request to `/sitemap_index.xml`
surfaced a **second, older frontend generation** as the 404 fallback page — a Django/jQuery/Vue2/Vuex/
Handlebars admin app branded "Candidate Experience Manager," with its own asset pipeline
(`cdn.olivia.paradox.ai/caches/202608/js/*`). Fetched its two highest-value bundles in full
(`common.js` 202 KB, `page.js` 674 KB — these carry the actual application logic and, critically, the
full client-side route table) and range-requested the tails of its three larger vendor/template bundles
(templates.js 2.99 MB, vendorCommon.js 1.17 MB, vendor.js 2.19 MB — ~800 bytes each) purely to check for
`//# sourceMappingURL=`. **Checked source-map presence on 5 distinct chunk files** (2 Nuxt + 3 legacy),
per the instruction to verify across multiple files rather than one — zero found; a direct
`<chunk>.js.map` probe on the two Nuxt chunks returned `403` CloudFront/S3 `AccessDenied` (private
bucket, not published). Total downloaded: ~2.3 MB across 10 fetches — within the ≤5 MB / ≤40-chunk / ≤90s
bound (§8), well under budget. String-mined both fully-fetched app-logic files for route literals,
`/api/` paths, vendor/integration name-mentions, and feature-flag literals.

## Findings

**Two coexisting frontend generations, one active migration.** `olivia.paradox.ai` currently serves a
**Nuxt 3 / Vue 3** shell (build `57dd43df-2e22-40ff-86f7-5461a0e81df4`, `sentry.release: app@3.0.0-
beta.13`) for `/`, `/login`, `/candidate` — but this shell is thin: only the login/OTP/SSO surface is
unauth-reachable, everything else redirects server-side. The **actual admin/recruiter console is a much
older Django + jQuery/Vue2/Vuex/Handlebars app** ("Candidate Experience Manager"), reachable as the 404
fallback and confirmed **actively redeployed this month** (asset cache path stamped `202608`, i.e.
August 2026 — the same month as this capture). This is a genuine mid-rewrite architecture, not dead
legacy code sitting untouched.

**Backend confirmed:** `api.paradox.ai` — pulled directly from the Nuxt SSR payload's `apiURL` field,
independently corroborating `infra-backend-fingerprint`'s AWS-API-Gateway finding on the same host.
Two additional dedicated backend hosts surfaced only here: **`genai.paradox.ai`** (a separate GenAI
service, distinct from the `/api/gen-ai/*` same-origin paths the legacy app also calls) and **`wss://
ws.paradox.ai`** (a dedicated WebSocket host — confirms realtime transport exists, though no frame/
protocol detail was observable without a session).

**Route table:** the full string-mined admin-console route table (100+ paths) is in
`raw/route-table.md`. It reads as a mature, deep enterprise recruiting-ops product: settings depth alone
spans `job-builder`, `interview-builder`, `approvals-builder`, `round-robin-management`, `workflows`,
`candidate-volume-optimizer`, `integration-center-v2`, `site-studio`, `cms`, plus SSO callbacks for ADP /
Google / Microsoft Entra ID / SmartRecruiters.

**API-path catalog:** appended to the shared `dimensions/_shared/api-path-catalog.md` under
`## source: bundle` (per ingestion §6 — this dimension owns the bundle mine of `olivia.paradox.ai`; no
other dimension re-mines it).

> **Mode-5 iteration-2 addendum (live verification of this dimension's declared paths).** Six of the seven
> bundle-declared app-own `/api/*` paths were subsequently **existence-verified** with unauthenticated,
> read-only `curl` — each returns `401` with a DRF `not_authenticated` envelope (a real auth-gated
> handler) rather than the SPA/Django `404` catch-all, and `/api/menu` + `/api/company` additionally
> expose their `Allow` verb sets. `/api/casl-ability` is confirmed **not registered unauthenticated**.
> This upgrades those rows from *bundle-declared only* to *bundle-declared + existence/auth/verb
> directly observed*, and identifies the app-own API layer as **Django REST Framework**. Full detail and
> caveats in the shared catalog's "Mode-5 live-probe verification addendum". No payload or authenticated
> call was ever made.

**Feature flags:** one confirmed live flag, `ai_interview_page:enabled_new_ui`, appended to the shared
`dimensions/_shared/feature-flags.md`. The Sentry SDK's generic LaunchDarkly/Statsig/Unleash integration
strings are a **false lead** — always-bundled Sentry adapter code, not evidence of those specific
vendors; flagged explicitly in the shared file to prevent mis-citation downstream.

**Third-party SDK inventory** (from CSP + string-mine, full table in `raw/bundle-map.md`): Sentry, Pendo,
GA/GTM, Google Maps, LinkedIn, Facebook, Traitify (personality assessment), Symmetry (payroll/tax
compliance), Contentful, ImageKit, WhatsApp Business Platform (Meta), and — unexpectedly — **Zenoti**
(spa/salon scheduling software, used here for in-person interview **room/service booking**, 36+ string
hits: `ROOM_BOOKING_TYPE`, `MAX_ITV_DURATION_ZENOTI`). This is a genuinely surprising vertical-specific
integration for a hiring platform, worth flagging for competitive-positioning (suggests deep retail/
service-industry vertical tooling beyond generic ATS scheduling).

**No source maps anywhere.** Checked 5 distinct chunk files across both frontend generations — none
carry `sourceMappingURL`, and a direct `.map` probe 403s. This is a genuinely closed-source client;
confidence stays `medium` (bundle-string-mine), never promotes to `source-map-reassembly`.

## Inferences

- The chat-based "Olivia" conversational interaction — the product's headline differentiator — is
  **not visible in this client bundle at all**. Everything mined here is the **recruiter/admin console**
  (scheduling, settings, candidate management) plus the login/auth shell. Per the dispatch hint: this is
  itself a finding, not a gap to apologize for — it strongly suggests the actual candidate-facing
  conversation happens **over SMS** (a carrier-mediated channel with no web client bundle to mine at all)
  and/or as **server-rendered, per-conversation pages** not registered as a discoverable route in the
  admin app's router (would need a live conversation link, e.g. via `oli.vi`, to observe). The `wss://
  ws.paradox.ai` host is likely *how* the recruiter-side "Assist"/"live chat monitoring" features (seen in
  the route table: `/assist`, `/employee-chat/messages`) receive live updates, not necessarily the
  candidate's own chat transport.
- The Nuxt rewrite currently covers only login/auth — a reasonable inference is Paradox is doing an
  incremental strangler-fig migration off the legacy Django/jQuery stack, starting with auth (the highest-
  leverage, most security-sensitive surface) before the rest of the console.
- `genai.paradox.ai` as a dedicated subdomain (separate from `api.paradox.ai`) suggests the GenAI/LLM
  capability is architecturally isolated as its own service — plausibly for independent scaling/rate-
  limiting of LLM calls versus the core CRUD API.

## Open questions

- Where does the actual candidate ↔ Olivia SMS/web-chat conversation render? Not found as a bundle or
  route in this unauthenticated pass. Would need either a live SMS conversation link or an authenticated
  session to resolve.
- Full Nuxt Gen-A route tree (everything past `/login`) is unobserved — only inferable by proxy through
  the legacy Gen-B route table, which may or may not be 1:1 with what the eventual Nuxt rewrite exposes.
- Whether `ws.paradox.ai` carries content-streaming or cache-coherence-ping frames, and its message
  protocol, is unknown without a session (`wire-capture` folded to the absent `session` dimension this
  run).
- Per-tenant config injection (e.g. whether `pendo.apiKey`/`ptLicenseKey` etc. vary per customer) not
  determinable from a single generic-tenant capture.

## Artifacts

- `raw/route-table.md` — full Gen-A + Gen-B route inventory (100+ paths), dedup'd and grouped
- `raw/env-config.md` — every embedded `window.__NUXT__.config` + SSR-payload field, values redacted per §7
- `raw/bundle-map.md` — framework/build-tool/vendor-SDK detection table, chunk sizes, source-map check log
- `dimensions/_shared/api-path-catalog.md` (`## source: bundle`) — confirmed API paths + dedicated hosts, LINKED not duplicated
- `dimensions/_shared/feature-flags.md` (`## source: bundle`) — confirmed flag + the Sentry-false-lead caveat, LINKED not duplicated
