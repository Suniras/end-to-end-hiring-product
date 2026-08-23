# Paradox — Shared API Path Catalog

Seeded empty by Ingestion (Mode 2) before collector fan-out, per ingestion.md §6. Contributing dimensions
(`deployed-client-bundle`, `session`, `wire-capture`, `distribution-artifacts`) append a `## source: <dim>`
section below — never create a separate copy of this file.

---

## source: bundle

<!-- captured_at: 2026-08-09 · method: bundle-string-mine · host under test: olivia.paradox.ai (unauth) -->

String-mined from two coexisting frontend generations served off `olivia.paradox.ai` /
`cdn.olivia.paradox.ai` (see `dimensions/deployed-client-bundle/raw/route-table.md` for full detail +
grouping). Backend host confirmed same-origin `api.paradox.ai` via the Nuxt SSR payload (`apiURL` field)
— corroborates `infra-backend-fingerprint`'s independent AWS-API-Gateway finding on `api.paradox.ai`.

**Nuxt (Gen A) auth surface:**

| Path | Method (inferred) | Notes |
| --- | --- | --- |
| `/api/_auth` | — | Nuxt-auth module base path |
| `/api/_auth/callback/adp` | GET | SSO callback (ADP) |
| `/api/_auth/callback/facebook` | GET | SSO callback (Facebook) |
| `/api/_auth/callback/google` | GET | SSO callback (Google) |
| `/api/_auth/callback/microsoft-entra-id` | GET | SSO callback (Azure AD) |
| `/api/_auth/callback/smartrecruiters` | GET | SSO callback (SmartRecruiters ATS) |
| `/api/casl-ability` | GET | CASL permission/ability fetch |
| `/api/v{apiVersion}` | — | templated versioned API path |

**Legacy admin console (Gen B) same-origin API paths:**

| Path | Notes |
| --- | --- |
| `/api/company` | |
| `/api/company/users` | |
| `/api/menu` | |
| `/api/gen-ai/init-data` | GenAI feature init |
| `/api/gen-ai/create-feedback` | GenAI feedback loop |
| `/api/gen-ai/track-consent-approval` | GenAI consent tracking |
| `/api/external/itv-prep/upload` (POST) | interview-prep file upload |

**Dedicated hosts (from embedded Nuxt runtime config, `window.__NUXT__.config.public`):**

| Host | Role |
| --- | --- |
| `api.paradox.ai` | primary REST backend (`apiURL`) |
| `genai.paradox.ai` | dedicated GenAI backend, separate from `api.paradox.ai` |
| `ws.paradox.ai` (`wss://`) | dedicated WebSocket host |
| `cdn.olivia.paradox.ai` | static asset CDN (Nuxt build + legacy `/caches/*` + `/static/*`) |
| `devsentry.paradox.ai` | self-hosted Sentry instance |

**Full Gen-B admin-console route inventory** (100+ paths — settings/*, scheduling/*, candidates/*, etc.)
is NOT re-listed here to keep this shared file scannable — see the owning artifact:
`dimensions/deployed-client-bundle/raw/route-table.md`.

**Dormant/unshipped candidate:** none of these paths could be cross-checked against a live `session`
capture on this run (`session` is `status: absent` — `auth:none`, no user-provided credential for this
batch). Any path here that a future run's `session`/`wire` dimension never observes being called is a
genuine dormant-route finding; conversely, a `session`-observed path absent from this list would indicate
the bundle string-mine missed a lazy-loaded chunk (see gaps in `_summary.md`).

### Mode-5 live-probe verification addendum (added by Self-correction, iteration 2)

<!-- captured_at: 2026-08-09 · method: http-probe (unauthenticated GET/OPTIONS, read-only, no credential, no state change) · verifies the bundle-declared paths above · owner dimension remains deployed-client-bundle per ingestion §6 -->

The bundle-declared app-own paths above were **existence-verified live** with unauthenticated `curl`.
This is **not** a wire capture — no request body, response body, or authenticated call was ever seen —
but a `401` (auth-gated, handler exists) is decisively distinguishable from a `404` (SPA catch-all, no
handler), so **path existence, the auth model, and the allowed verb set are now directly observed**
rather than only bundle-declared.

| Path | Live status | `Allow` header | Read |
| --- | --- | --- | --- |
| `/api/menu` | **401** `{"message":"Authentication credentials were not provided.","code":"not_authenticated"}` | `GET, HEAD, OPTIONS` | exists, auth-gated, **read-only** |
| `/api/company` | **401** (same envelope) | `GET, POST, HEAD, OPTIONS` | exists, auth-gated, **has a write side** |
| `/api/company/users` | **401** (same envelope) | — | exists, auth-gated |
| `/api/gen-ai/init-data` | **401** (same envelope) | — | exists, auth-gated |
| `/api/gen-ai/create-feedback` | **401** (same envelope) | — | exists, auth-gated |
| `/api/external/itv-prep/upload` | **401** (same envelope) | — | exists, auth-gated |
| `/api/casl-ability` | **404** — served by the **legacy Gen-B Django 404 page** (`<title>… Candidate Experience Manager`) | — | **not registered unauthenticated**; see below |
| `/api/_auth/casl-ability` | **400** JSON (Nuxt-auth handler) | — | see the recovered action list below |

**Three findings this addendum adds:**

1. **The app-own API layer is Django REST Framework.** Every `/api/*` app path returns DRF's verbatim
   `not_authenticated` error `code`, DRF's `APIView`-default `Allow` header, `Vary: Accept-Language,
   Cookie`, and a DRF-shaped `OPTIONS` response (401 rather than a verb list). This **resolves the
   tension flagged in `evaluation/technology-architecture.md` #3 and its open question #5**: the *app-own*
   API is DRF; the *published partner* API's hand-rolled `{"errors":[{"code":1015,…}]}` envelope is a
   **different layer** — which independently reinforces the near-disjoint published-vs-app-own split.
2. **The `/api/_auth/*` namespace is fully enumerated, unauthenticated.** The Nuxt-auth handler names its
   own supported actions verbatim: `providers, session, csrf, signin, signout, callback, verify-request,
   error`. The same-origin `/api/*` namespace is therefore **split across both frontend generations** —
   `/api/_auth/*` is served by the Nuxt shell (JSON `{error,url,statusCode,…}` envelope), everything else
   by the legacy Django/DRF console.
3. **`/api/casl-ability` is characterized, not resolved.** It is *not* a Nuxt-auth action (the handler
   above explicitly rejects it) and it is *not* registered on the unauthenticated Django router (it falls
   through to the Gen-B 404 page). It is reachable only inside an authenticated context. The Mode-5
   iteration-1 probe that hit a 404 here was hitting a real absence, not a wrong prefix.

**Standing caveat unchanged:** existence + auth model + verb set are observed; **request/response shapes,
payloads, and which paths the app actually calls remain unobserved** and still require one authenticated
Pass-1 session with a pre-navigation in-page tap.

## source: distribution

No REST/GraphQL API paths were recovered — this capture stayed at public App-Store/Play-Store listing
metadata level (no IPA/APK download or decompile, per ingestion §7.2 and task scope). Two host-level
leads surfaced instead, for `infra-backend-fingerprint` to fold into its DNS/CT sweep:

| Host | Evidence | Note |
| --- | --- | --- |
| `oli.vi` | Visible in an iOS App-Store screenshot of the recruiter console ("View additional times at http://oli.vi/&lt;token&gt;") | A first-party branded URL-shortener domain for interview-scheduling links — not present in this run's Discovery-stage host list. |
| `ai.paradox.*` (bundle-ID namespace) | `ai.paradox.olivia` (iOS+Android), `ai.paradox.regis` (Android white-label), `ai.paradox.brext` (macOS Safari extension) | Confirms one shared app-ID namespace/root across all three client artifacts and both mobile platforms — corroborates a single backend/brand serving all surfaces, not fragmented per-platform builds. |

Method: `binary-extract` (listing-metadata level), confidence: medium (host names observed directly in
first-party screenshots/catalog data, not inferred) but scope is narrow (no path-level API surface).
