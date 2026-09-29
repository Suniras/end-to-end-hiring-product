<!-- source: https://app.fountain.com/ + /80a74d4/* chunks · captured_at: 2026-08-09 · method: source-map-reassembly -->

# Fountain — Bundle Map

## Framework / build tool

- **React SPA**, webpack-built, CRA-flavored config (`file-loader`, `regenerator-runtime`,
  `core-js/stable` polyfills, `internals/webpack/webpack.prod.babel.js` referenced in a source comment).
  Internal app name (webpack global): **`recruiter-ui`** / **`recruiter_ui`**.
  Build hash / asset path prefix: `/80a74d4/`.
- **State:** Redux + `redux-saga` + `connected-react-router` (react-router v5, not v6 — `withRouter`,
  `<Switch>`/`<Route path=…>` JSX idiom).
- **Design system:** `@fountain/fountain-ui-components` + `@fountain/ripple/styles` — Fountain's own
  internal component library, named "Ripple".
- **i18n:** `react-intl`/`formatjs` + a `translationMessages`/`i18n.js` polyfill setup — confirms the
  in-product "Translation Settings" / "custom-terminologies" features are backed by a real i18n layer,
  not just UI chrome.
- **Testing:** `@testing-library` + `faker-js` shipped into the **production** bundle (98 KB +
  3.26 MB respectively) — dead weight in prod, or deliberately used for demo/sandbox data generation
  (a `REACT_APP_FAKER_SEED` env var exists, suggesting the latter — demo-account seeding logic ships
  client-side).

## Chunk graph (from the static shell — no lazy/route chunks are statically linked)

48 chunks linked in `https://app.fountain.com/`'s HTML: 1 `runtime`, 1 `runtimeEnvVars` (dedicated
deploy-swappable config chunk — see env-config.md), 1 `main` entry (9.23 MB), 45 `npm.*` vendor chunks
(webpack `splitChunks` vendor-per-package strategy — unusually granular; most webpack apps group vendor
code into 1-3 chunks, this one names 45 individually by npm package, which is itself a strong tell for a
deliberately-tuned caching strategy). Route-level code (containers) is lazy-loaded on demand via
numeric-hash chunk names not present in the static HTML — **out of static-fetch reach without a browser**
(recorded as a gap; the route table was instead recovered from the *entry* chunk's source map, which
still names every route + its lazy `import()` target).

### Fetched this run (bounded — see Method in _summary.md for the budget note)

| Chunk | Size | Source map? |
| --- | --- | --- |
| `runtime.*.js` | 7.5 KB | yes (live, 200) |
| `runtimeEnvVars.js` | 1.3 KB | yes (live, 200) |
| `npm.stripe.*.js` | 9.9 KB | yes (live, 200) |
| `npm.api-clients.*.js` | 114.6 KB | yes (live, 200) — this is the generated OpenAPI/typed API client; mined directly for the full app-own API path catalog (300 unique paths, 358 method+path pairs) |
| `main.*.js` (entry) | 9.23 MB | yes (live, 200, 8.46 MB map) — reassembled 1962 original source files, 1757 first-party (`./app/...`) |

### Vendor chunks confirmed to ALSO carry a live source map, not reassembled (bounded gap)

Spot-checked 4 more (`npm.fountain.*`, `npm.material-ui.*`, `npm.cronofy-elements.*`, `npm.axios.*`) — all
4 returned a `//# sourceMappingURL=` comment resolving 200. **Every chunk checked (8/8) ships a live
production source map** — strong evidence the entire 48-chunk graph is source-mappable, not just the
entry. Not reassembled this run (mostly third-party library source, lower marginal value than the 1757
first-party files already recovered from `main.js`): `npm.fountain.*` (772 KB — Fountain's own internal
shared package, likely worth a follow-up pass), `npm.material-ui.*` (3.39 MB), `npm.cronofy-elements.*`
(1.28 MB), `npm.faker-js.*` (3.26 MB), `npm.formatjs.*` (1.25 MB), `npm.timezone-support.*` (934 KB), and
33 smaller vendor chunks (14–340 KB each, mostly well-known OSS libraries — lodash, axios, date-fns,
codemirror, jspdf, etc. — string-mining these would mostly recover library source, not app-specific
signal).

## Third-party vendor stack (from the response's `Content-Security-Policy-Report-Only` header — a
free, zero-string-mining artifact naming every host the app is allowed to call)

| Category | Vendor(s) | Host(s) |
| --- | --- | --- |
| Support/chat widget | Intercom | `js.intercomcdn.com`, `widget.intercom.io`, `api-iam.intercom.io` (+ regional `api-iam.eu/au.intercom.io` — confirmed in reassembled source), `wss://nexus-websocket-a.intercom.io` |
| Support/chat (secondary) | Zendesk | `static.zdassets.com`, `ekr.zdassets.com` |
| Realtime | Pusher | `sockjs-{mt1,us2,ap2,eu}.pusher.com`, `ws-{mt1,us2,ap2,eu}.pusher.com` — 4-region deployment |
| Session replay / RUM | FullStory | `edge.fullstory.com`, `rs.fullstory.com` — confirmed wired in source (`components/Fullstory`, gated off for super-admins unless a staging-host flag is set) |
| APM / RUM | Datadog | `logs.browser-intake-datadoghq.com`, `rum.browser-intake-datadoghq.com` |
| Product analytics / flags | PostHog | `posthog-js` chunk (202 KB) + `REACT_APP_POSTHOG_*` env vars; `PostHogRootProvider` wraps the whole app with `{product: 'hire', ui: 'recruiter'}` properties — internal product-family naming |
| Feature flags | LaunchDarkly | confirmed client-side IDs in source (see feature-flags.md) — no `launchdarkly` vendor chunk present, so likely accessed via REST polling or the internal `Wx` copilot's own bundle, not the main SPA's JS SDK |
| In-app guidance | Appcues | `fast.appcues.com`, `wss://api.appcues.net` |
| Push notifications | OneSignal | `cdn.onesignal.com`, `onesignal.com` + `REACT_APP_ONESIGNAL_WEB_PUSH_APP_ID` |
| CDP / messaging orchestration | Customer.io | `cdp.customer.io` |
| Payments (job-ad/sourcing spend) | Stripe | `js.stripe.com`, `merchant-ui-api.stripe.com` + `npm.stripe` chunk + `REACT_APP_STRIPE_KEY` — see "Stripe usage resolved" below |
| Subscription billing (SaaS plans) | Chargebee | `REACT_APP_CHARGEBEE_{ANNUAL,MONTHLY}_PLAN_ID` — no Chargebee JS SDK chunk found; likely server-driven checkout, not client-embedded |
| E-signature | HelloSign (Dropbox Sign) | `npm.hellosign-embedded` chunk (90 KB) + `REACT_APP_HELLOSIGN_CLIENT_ID`; ALSO a `embedded-docusign` feature flag exists (two e-signature vendors, likely a migration or dual-support state) |
| Calendar / scheduling | Cronofy | `npm.cronofy-elements` chunk (1.28 MB) + `api.cronofy.com` + `internal_api/scheduler/cronofy_information` path |
| Video recording | CameraTag | `cameratag.com`, `us-assets.cameratag.com` — candidate-side interview video recording (`.../video_recordings` API path, `VideoRecordingPopover` container) |
| Job-board marketplace aggregator | VONQ | `elements.hapi.vonq.com`, `marketplace.api.vonq.com` + extensive `internal_api/sourcing/vonq*` paths — the paid job-ad distribution layer |
| Job board (direct) | Indeed | `internal_api/job_boards/indeed_integration/*` |
| LMS / training integrations | Lessonly, Northpass, WorkRamp | `workflow_editor/stages/learning_stages/{lessonly_content,northpass_courses}` API paths + `workramp-help-center-sso` feature flag — 3 distinct LMS integrations |
| Company enrichment | Clearbit | `REACT_APP_CLEARBIT_API_BASE_URL` (unset in this deploy) |
| Web analytics | Google Analytics | `www.google-analytics.com`, `ssl.google-analytics.com` |
| File storage (candidate documents) | AWS S3 | `fountain-applicant-uploads.s3.us-west-1`, and a **fleet of `onboardiq-secure-{region}` buckets** across `us-west-1`, `eu-west-1`, `ap-southeast-1`, `sa-east-1` + a `pr-onboardiq-secure-us-west-1` (PR = likely "pull-request"/preview env bucket) — **"OnboardIQ" is not mentioned anywhere else in the marketing/docs surfaces seen so far; it reads as an internal/acquired-product codename for the candidate onboarding-portal document pipeline**, regionally sharded for data-residency (a genuine infra finding worth cross-checking against `infra-backend-fingerprint`) |
| Backend hosting (secondary) | AWS (S3 + presumably compute) fronting the CDN | response headers show `x-amz-*` (S3-origin) even on the main app-shell response — `app.fountain.com`'s HTML itself is served from an S3 bucket behind Cloudflare |

## Stripe usage — resolved (was an open question from Discovery)

Reassembled source in `containers/SourcingPurchaseNew/{actions,constants}.js` shows Redux actions
`FETCH_SETUP_INTENT_{INIT,SUCCESS,ERROR}`, `SET_PAYMENT_SOURCE`, `SET_COUPON`, `SET_BUDGET`,
`SET_IS_INVOICED`, `SET_ADVERTISER_BUDGET`, `SET_DURATION`, `SET_POST_TO_FREE_BOARDS`. This is a Stripe
**SetupIntent** (card-on-file) flow scoped to the `/jobs/:jobId/sourcing/new` route — i.e. Stripe is used
for **employer purchase of paid job-ad/sourcing distribution budget** (the VONQ marketplace layer),
with a coupon-code path and an "invoiced" alternative (presumably for larger accounts that don't pay by
card). **It is not used for candidate background-check fees or payroll/direct-deposit setup** — no
Stripe reference appears anywhere near the `background_checks`, `i9_forms`, or `worker_token` API paths
(all under `internal_api/portal/...`, the candidate-facing surface). The separate `Chargebee` env vars
indicate **subscription/plan billing for the SaaS contract itself runs on a different vendor entirely**
— two decoupled payment systems for two different money flows (job-ad spend vs. Fountain's own SaaS fee).

---

## ✅ Mode-5 iteration 3 addendum — `npm.fountain.*` reassembled (closes a bounded gap)

<!-- source: https://app.fountain.com/80a74d4/npm.fountain.<hash>.js + .chunk.js.map · captured_at: 2026-08-09 · method: source-map-reassembly · 2 unauthenticated GETs (772 KB chunk + 1.49 MB map), zero cost, no login -->

The one vendor chunk flagged as worth a follow-up was fetched and its **live production source map
reassembled**: **233 original sources**, and the answer to the open question below is **no new API,
route or flag signal — but one real product finding.**

| Package inside the chunk | Sources | What it is |
| --- | --- | --- |
| `@fountain/fountain-ui-components` | **230** | The in-house **"Ripple"-adjacent design system** — `Icons` (30), `Buttons` (15), `StyledReactSelect` (14), `Modals` (12), `ListResultsStates` (8), `ReduxFormField` (8), `Drawer`, `Menu`, `SideNavigation`, `StatusLabel`, `Slider`, plus bundled `@juggle/resize-observer`. Confirms the design-system claim in the Stack table from a *second* artifact. |
| **`@fountain/universal-search`** | **1** (16.8 KB) | **The global command palette — a first-party npm package of its own.** |
| `css-loader` / `style-loader` | 2 | build plumbing |

### The finding: a **⌘K / Ctrl-K command palette is confirmed shipped**, not just indexed

`@fountain/universal-search`'s `dist/index.js` exports `UniversalSearch`, `UniversalSearchDialog` and
`filterNavItems`, and the root component installs a **global `keydown` listener** that opens the dialog
on `(e.metaKey || e.ctrlKey) && e.key === "k"` — verbatim. Its props are
`{searchPeople, navItems, onNavigate, onAnalytics, iconMap, placeholder, peopleSectionLabel}`, and it
fires a named analytics event **`universal_search:bar_open`**. The injected stylesheet defines a full
palette UI: `.fn-us-overlay` / `.fn-us-dialog` / `.fn-us-input-row` / `.fn-us-kbd-group` / `.fn-us-kbd` /
`.fn-us-results` / `.fn-us-section-header` / `.fn-us-result-icon--nav` / `.fn-us-result-icon--person` /
`.fn-us-empty-*` / `.fn-us-footer` / `.fn-us-enter-hint` / `.fn-us-hint-keys`.

**Why this matters:** iteration 1 established the global-search *index* (the `searchGroup` /
`searchKeywords` fields in the `wx-navbar` catalog) but had to leave the **trigger UI unconfirmed** —
`information-architecture.md` Open Question #5. It is now confirmed from a **second, independent
first-party artifact**: the palette ships, it is keyboard-triggered, it searches **two** result classes
(**nav destinations** — fed by the same navbar catalog via `filterNavItems` — and **people**, via an
injected async `searchPeople`), and it is instrumented. What still needs a walk is only whether the host
app *mounts* it for a given tenant.

**No API paths, no route literals, no feature flags, no credential-shaped values** appear anywhere in
the chunk (grepped for `/api`, `/internal_api`, `/api_self_serve`, host literals — zero hits; the only
external host string is the W3C SVG namespace). The 766-path app-own catalog is **unchanged** by this
mine — recorded as a **negative result**, which is what the open question asked for.

### The other half of this action is confirmed BLOCKED, not skipped

The lazy **route** chunks (`Payments`, `SourcingPurchaseNew`, `WorkflowEditor`'s 525 files) were
re-checked this iteration: `https://app.fountain.com/` links **exactly 48 chunks**, and **none** of them
is a route chunk — the route chunks carry webpack numeric-hash names emitted only at
`Loadable()`-resolution time, so they are **not statically addressable**. Confirmed by grepping the live
shell HTML for `payments` / `workfloweditor` / `sourcingpurchase`: **zero hits.** Fetching them needs a
renderer, i.e. the same browser capability this run has recorded as absent throughout. **What `/payments`
actually is therefore remains open**, and it is a *capability* gap, not an effort gap.

---

## Open questions

- ~~Whether `npm.fountain.*` (Fountain's own 772 KB internal shared package) contains additional
  API/route/flag signal beyond what `main.js` already surfaced~~ — **CLOSED (Mode-5 it. 3): no new API /
  route / flag signal.** It is the design system + the `@fountain/universal-search` command palette. See
  the addendum above.
- **(Still open, re-confirmed it. 3)** What `/payments` actually is — its lazy route chunk is not
  statically addressable; needs a renderer.
- The actual Stripe/PostHog/Pusher/HelloSign/OneSignal/Facebook key **values** were not located in the
  chunks fetched (likely defined at point-of-use in a lazy chunk) — redacted-by-default, not pursued.
- Whether "OnboardIQ" is an acquired product, a legacy codename, or simply an internal service name —
  worth a cross-check against `infra-backend-fingerprint`'s sub-processor/trust-page mine.
- Whether the `LEGACY ... Fountain Mobile App` route comment (route-table.md) indicates a real native or
  wrapped-webview mobile client that the Discovery App-Store probe missed (e.g. unlisted, enterprise/
  MDM-only distribution, or a white-labeled name) — flagged for `distribution-artifacts` reconsideration.
