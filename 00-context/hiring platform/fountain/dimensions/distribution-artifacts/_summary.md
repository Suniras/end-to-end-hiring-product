---
dimension: distribution-artifacts
target: fountain
status: absent
access_grade_used: "runtime:reachable (non-web client check — no non-web client found)"
method: binary-extract
completeness_pct: 100
confidence: high
captured_at: 2026-08-09
sources:
  - "https://apps.apple.com/ (iOS App Store search: 'fountain hiring' / 'fountain onboarding' / 'fountain.com' — run in Discovery)"
  - "https://play.google.com/store/search?q=fountain%20hiring&c=apps"
  - "https://play.google.com/store/search?q=fountain%20onboarding&c=apps"
  - "https://play.google.com/store/search?q=fountain.com&c=apps"
  - "https://chromewebstore.google.com/search/fountain%20hiring"
  - "https://chromewebstore.google.com/search/fountain%20ats"
  - "https://addons.mozilla.org/en-US/firefox/search/?q=fountain%20hiring"
  - "https://app.fountain.com/ (page-source + direct manifest/service-worker path probes + main bundle grep)"
gaps:
  - "No non-web client of any kind exists to extract (no CRX/XPI, no .asar, no .ipa/.apk, no CLI) — this is a confirmed absence, not an unreached surface."
  - "Could not check Fountain's own developer/partner ecosystem for a marketplace-distributed integration package (e.g. a Slack app manifest, an ATS-marketplace connector bundle) — out of scope for 'downloadable client' but flagged as a related, unexplored artifact type; the API docs (dimension: api/docs) already note a Slack Integration doc page, which may itself carry a Slack app manifest worth a future look (not pursued here to stay inside the distribution-artifacts scope: end-user/candidate/recruiter installable clients)."
---

# Fountain — distribution-artifacts capture

## Method

Fountain (fountain.com) is a frontline/high-volume hiring & onboarding SaaS platform with
`runtime:reachable` (a live SPA at `app.fountain.com`) but `source:none` (no accessible codebase). The
distribution-artifacts brief for this dimension is: find and decode any **shipped, downloadable client**
(browser extension, Electron desktop app, mobile app, or CLI). Before any extraction step, the EULA/
license question is moot here — **there is nothing to extract**, per the sweep below.

Discovery had already run a 3-variant iOS App Store search (`fountain hiring`, `fountain onboarding`,
`fountain.com`) and found zero Fountain-affiliated results, only unrelated namesakes (a podcast player
by "Fountain Labs Ltd", water-fountain-finder apps, a bank's "Fountain Trust Mobile" app). That result
alone was flagged tentative pending a fuller sweep. This capture closes it with three additional,
independent checks:

1. **Google Play Store** — the mobile surface Discovery's iOS-only search did not cover. Ran the same
   3 query variants (`fountain hiring`, `fountain onboarding`, `fountain.com`) against
   `https://play.google.com/store/search?q=<query>&c=apps`.
2. **Browser extension stores** (Chrome Web Store + Firefox Add-ons/AMO) — cheap to check even though
   this product type (frontline-hiring ATS/onboarding SaaS) has no obvious in-browser-augmentation use
   case. Ran `fountain hiring` / `fountain ats` on Chrome Web Store, `fountain hiring` on AMO.
3. **PWA-manifest / service-worker check on the live app shell** (`app.fountain.com`) — the hypothesis
   from `00-recon-plan.md` is that Fountain's "mobile-first" marketing claim describes responsive mobile
   WEB, not a native app; a genuinely-registered PWA manifest + service worker would still count as a
   real (if minor) distribution artifact distinct from "nothing at all." Fetched the raw page HTML with
   `curl` (bypassing markdown-conversion loss from WebFetch), inspected the full `<head>`, direct-probed
   `/manifest.json`, `/manifest.webmanifest`, `/sw.js`, `/service-worker.js`, and grepped the 9.23 MB
   main JS bundle for `serviceWorker.register` / `navigator.serviceWorker` / dynamic manifest injection.

Full verbatim results, tables, and the raw HTML `<head>` are in `raw/store-and-pwa-sweep.md`.

## Findings

| Surface | Method | Result |
| --- | --- | --- |
| iOS App Store (3 variants) | store search (Discovery) | Zero Fountain-affiliated apps |
| Google Play (3 variants) | store search | Zero Fountain-affiliated apps — only unrelated namesakes (podcast app, wellness brand, church-streaming app, fitness-studio white-labels, an Indian civil-services coaching app, literal fountain/wallpaper apps) |
| Chrome Web Store (2 queries) | store search | Zero results at all (store's own empty-state) |
| Firefox Add-ons (1 query) | store search | 26 results, all unrelated "Mountain/Spring" themed browser themes (keyword-collision noise, zero relevance) |
| `app.fountain.com` PWA manifest | page-source + path probes + bundle grep | **No `<link rel="manifest">`, no service-worker registration.** One legacy meta tag `<meta name="mobile-web-app-capable" content="yes">` present (a Chrome-only "add to home screen, full-screen launch" hint that works without a manifest) — a minor mobile-web-optimization signal, not an installable-PWA artifact. Direct probes of `/manifest.json`/`/sw.js`/etc. returned HTTP 200 but are **false positives**: the SPA's catch-all server route serves the identical `index.html` shell (`content-type: text/html`) for every path, confirmed by content-type + body inspection, not status code alone. |

**No downloadable/installable client exists for Fountain in any of the four checked categories**
(native mobile — both stores, browser extension — both major stores, installable PWA).

## Inferences

- **The "mobile-first" marketing claim (fact, from `website`/docs) most likely means "responsive mobile
  web," not a native app or an installable PWA** (inference, high confidence given the clean 4-way
  negative sweep — this is a genuine absence, not a naming/discoverability miss, since the searches used
  Fountain's own product-category terms across 5 independent store/surface checks). This corroborates
  the hypothesis flagged in `00-recon-plan.md` and should be surfaced in `competitive-positioning.md` as
  a marketing-vs-product finding: "mobile-first" is a UX/responsive-design claim, not a distribution
  claim.
- Fountain's candidate- and recruiter-facing surfaces (per the `website`/`docs`/`deployed-client-bundle`
  dimensions) are entirely web-based: the recruiter/admin app is `app.fountain.com` (an SPA, confirmed
  reachable), and candidate-facing application/onboarding flows are presumably served via web links
  (SMS/email-delivered application URLs — the pattern common to frontline-hiring ATS products, where
  candidates apply from a phone browser rather than an app). This is consistent with, and explains, why
  no native mobile app or PWA was built: a one-off, no-install web flow is lower-friction for a
  high-volume, high-churn candidate funnel than requiring an app install.
- This dimension therefore contributes **no** rows to the shared `dimensions/_shared/api-path-catalog.md`
  or `dimensions/_shared/feature-flags.md` — there is no binary to mine for either.

## Open questions

- Whether Fountain publishes a Slack App manifest or similar marketplace-integration package (distinct
  from an end-user installable client) — out of this dimension's scope (candidate/recruiter/admin
  clients) but worth a incidental look if the `api`/`docs` dimension's "Slack Integration" doc page names
  a public Slack App directory listing.
- Whether any of Fountain's named AI agents (Anna/Emma/Sam/Cue, per `00-recon-plan.md` hypotheses) are
  exposed via a phone/SMS/IVR channel that would itself count as a "client" in a broader sense (e.g. a
  registered phone number or WhatsApp Business integration) — this would be a `wire-capture`/`api`
  finding, not a distribution-artifact one, since it wouldn't be a downloadable binary; flagged here only
  because it's adjacent to "how do candidates without app access interact with Fountain," which this
  dimension's negative finding raises.

## Artifacts

- `raw/store-and-pwa-sweep.md` — full verbatim results of the Google Play (3 variants), Chrome Web Store
  (2 variants), Firefox Add-ons (1 variant), and PWA-manifest/service-worker checks, including the raw
  `<head>` HTML and the false-positive-200 diagnosis for the manifest/service-worker path probes.
