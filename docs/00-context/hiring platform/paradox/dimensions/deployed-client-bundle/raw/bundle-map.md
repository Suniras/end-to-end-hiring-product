<!-- source: cdn.olivia.paradox.ai (Nuxt + legacy chunks) · captured_at: 2026-08-09 · method: bundle-string-mine -->

# Paradox (olivia.paradox.ai) — Bundle map

## Two coexisting frontend generations on one host

| | Gen A — current shell | Gen B — legacy admin console ("Candidate Experience Manager") |
| --- | --- | --- |
| Framework | **Nuxt 3 / Vue 3** | **Vue 2 + Vuex** + jQuery 3.6/jQuery-UI, on a **Django** backend (djangojs.js i18n, `moment.fn.django` format helper, csrftoken cookie) |
| Build tool | Vite (Nuxt 3 default) — hashed `_nuxt/*.js` filenames, `strict-dynamic` nonce-CSP | Django static pipeline with cache-busted paths (`/caches/202608/js/*.<hash>.js`); Handlebars precompiled templates |
| UI kit | Element Plus (css chunk names: `el-aside`, `form-item`, `radio-group`, `scroller`, `infinite-loading`, `input-verify-code`) | jQuery UI, custom Handlebars-templated widgets, flatpickr (date picker, 40+ locale files bundled) |
| Reachable when unauth | `/`, `/login`, `/candidate` (all render the Nuxt login shell) | Served as the 404 fallback shell (e.g. `/sitemap_index.xml` → this app's 404 page) — genuinely reachable, but its actual authenticated routes were string-mined, not navigated |
| Build/version marker | `buildId: 57dd43df-2e22-40ff-86f7-5461a0e81df4`, `sentry.release: app@3.0.0-beta.13` | cache date stamp `202608` (August 2026) in asset paths — i.e. actively rebuilt/redeployed this month, not a frozen legacy artifact |
| Source maps | **None found** (checked both fetched chunks' literal EOF for `//# sourceMappingURL=`; direct `.js.map` probe → `403` CloudFront/S3 AccessDenied) | **None found** (checked EOF of `templates.js`, `vendorCommon.js`, `vendor.js`, `common.js`, `page.js` — 5/5 chunks, zero source maps) |

**Read on the coexistence:** this is a live migration, not dead legacy code — Gen B's asset cache
timestamp (`202608`) is the same month as capture, meaning Paradox is still actively shipping to the
Vue2/jQuery/Django stack while a Nuxt 3 rewrite handles (so far) only the login/auth surface. This is a
concrete "still mid-rewrite" architecture signal for a competitive teardown.

## Chunks fetched (bounded — well under the 40-chunk/5MB/90s cap)

| File | Size | Role |
| --- | --- | --- |
| `_nuxt/DElBek1l.js` | 67.6 KB | Nuxt entry — polyfills/runtime bootstrap, no app-specific literals |
| `_nuxt/Dreh011s.js` | 1.22 MB | Nuxt vendor bundle — Vue 3 runtime, Element Plus, **Sentry SDK** (full, incl. all optional feature-flag-vendor integration modules — see note below), Nuxt Auth module (SSO callback routes), CASL |
| `caches/202608/js/common.34448012115f.js` | 202 KB (198 KB decompressed as fetched) | Gen B shared app logic — scheduling helpers (Zenoti room-booking), Vuex menu module |
| `caches/202608/js/page.b12fa8c10ff0.js` | 674 KB | Gen B page-specific logic — the full route table (see `route-table.md`), WhatsApp + Zenoti integration code |
| `caches/202608/js/templates.815251a3d33f.js` | 2.99 MB (EOF-only checked, not fully mined) | Handlebars-precompiled UI templates — digested, not string-mined line-by-line (low marginal value: mostly HTML+i18n `trans` helper calls) |
| `caches/202608/js/vendorCommon.d8c196d16796.js` | 1.17 MB (EOF-only checked) | third-party libs incl. moment.js w/ Django format extension |
| `caches/202608/js/vendor.192478c3b099.js` | 2.19 MB (EOF-only checked) | third-party libs incl. flatpickr (40+ locales) |
| `login`, `candidate` HTML shells | ~51 KB each | SSR payload (`__NUXT_DATA__`) — see `env-config.md` |

**Total bytes actually downloaded (not just EOF-probed):** ~2.3 MB across 7 files — within the ≤5 MB /
≤40-chunk cap. `templates.js`/`vendorCommon.js`/`vendor.js` were range-requested (last ~800 bytes only)
to check for source maps without a full download, since a first-pass read of their tails showed pure
third-party library code with negligible app-specific signal.

## Third-party vendor / SDK inventory (confirmed wired, from CSP + string-mine)

| Vendor | Role | Evidence |
| --- | --- | --- |
| **Sentry** | error monitoring | `sentry.dsn` config field, full SDK bundled in `Dreh011s.js` |
| **Pendo** | product analytics | `pendo.apiKey` config field, `*.pendo.io` in CSP |
| **Google Analytics / Tag Manager** | web analytics | CSP `connect-src`, GTM script tag (`G-WN7X9F92J3`) on the legacy 404 shell |
| **Google Maps** | location/geocoding (location-management, campuses features) | `maps.googleapis.com` in CSP + config |
| **LinkedIn** | apply-with-LinkedIn / candidate sourcing | `platform.linkedin.com` script + `form-action` CSP entry |
| **Facebook** | SSO login option | `/api/_auth/callback/facebook`, CSP `*.facebook.com` |
| **Traitify** | personality/behavioral assessment | `cdn.traitify.com` / `api.traitify.com` in CSP |
| **Symmetry (Symmetry Software)** | payroll/tax-withholding compliance forms | `spfcdn.symmetry.com` / `spfcdn-staging.symmetry.com` in CSP |
| **Contentful** | headless CMS (candidate-facing content/help) | `*.ctfassets.net` in CSP |
| **ImageKit** | image CDN/transform | `*.imagekit.io` in CSP |
| **WhatsApp Business Platform (Meta)** | candidate messaging channel | `whatsappOnboarding` config block (app/config/solution IDs, redacted), `/settings/whatsapp-templates` route, `whatsapp` string hits in Gen B bundle |
| **Zenoti** | spa/salon scheduling — room/service booking for interviews | 36+ string hits (`ROOM_BOOKING_TYPE`, `MAX_ITV_DURATION_ZENOTI`) in Gen B `page.js`/`common.js` — a genuinely surprising vertical-specific integration for a hiring platform (retail/service-industry in-person interview slot booking) |
| **ADP, Google, Microsoft Entra ID, SmartRecruiters** | SSO identity providers for recruiter login | `/api/_auth/callback/{adp,google,microsoft-entra-id,smartrecruiters}` |
| **CASL** | client-side authorization/ability library | `/api/casl-ability` endpoint, `ability` field in SSR payload |
| **emoji-mart-vue-fast** (via unpkg) | chat message composer emoji picker | CSP `connect-src` unpkg path, confirms a real chat-composer UI component ships even in the Nuxt shell |

**A note on the Sentry-bundled flag-vendor names (LaunchDarkly/Statsig/Unleash):** `Dreh011s.js` contains
string literals `LaunchDarkly`, `Statsig`, `Unleash` — but these are Sentry SDK's own **generic,
always-bundled** feature-flag-integration adapter modules (`buildLaunchDarklyFlagUsedHandler`, etc.), not
evidence any of those three vendors are actually configured by Paradox. The one **confirmed, live**
feature flag is `ai_interview_page:enabled_new_ui`, observed set in the SSR payload — this looks to be a
**custom in-house flag system** (Pinia `$sfeatureFlags` store, populated server-side), not a named
third-party flagging SaaS. Recorded as a caveat so this isn't over-read as "Paradox uses LaunchDarkly."

## Digest of a representative minified snippet (redacted representative sample, per §5)

```
// Dreh011s.js, ~byte offset near EOF — representative Element-Plus/Vue3 export-map tail (harmless,
// purely structural minified export aliasing, no literals of interest):
...yg,wu as yh,Fae as yi,wv as yl,Od as ym,dce as yn,Are as yo,lp as yp,pse as yr,Fx as ys...
```

## Open questions

- No candidate-facing SMS/chat conversation bundle was located as a distinct client artifact — see
  `_summary.md`.
- Gen B's page-level Vue2 component chunks beyond `common.js`/`page.js` (if further code-split) were not
  enumerated — the two fetched files appear to be the full "common + page" bundle-split (Django/webpack
  legacy convention: vendor / vendorCommon / common / page / templates), so this is likely complete for
  that generation, but not verified against a webpack stats/manifest file (none found).
