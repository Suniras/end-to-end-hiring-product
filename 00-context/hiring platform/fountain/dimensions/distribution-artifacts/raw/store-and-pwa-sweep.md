<!-- source: Google Play Store search, Chrome Web Store search, Firefox Add-ons search, app.fountain.com page-source + path probes · captured_at: 2026-08-09 · method: binary-extract (negative-result sweep) -->

# Fountain — distribution-artifacts sweep (Google Play + browser extensions + PWA manifest)

This supplements Discovery's 3-variant App Store (iOS) search, which found zero Fountain-affiliated
apps. Ingestion re-verifies via the two remaining app-store surfaces (Google Play, browser-extension
stores) plus a direct PWA-manifest check on the live app shell, per the task brief's 3-check closure
requirement.

## Check 1 — Google Play Store

Three query variants run against `https://play.google.com/store/search?q=<query>&c=apps`:

| Query | Result count seen | Fountain-affiliated hit? |
| --- | --- | --- |
| `fountain hiring` | 13 results | None. All results are unrelated job-search/recruiter apps (Naukri, Indeed, Upwork, apna, WorkIndia, SmartRecruiters, Jobvite, Phenom, foundit/Monster) — none published by Fountain. |
| `fountain onboarding` | 30+ results | None. Closest namesake: "Fountain: Podcasts & Music" by Fountain Labs Ltd (podcast app, unrelated). Other onboarding-flavored apps (Quess Corp, Blinkit, Park+, Worldline South Asia) are unrelated companies. |
| `fountain.com` | 20 results | None. Results are entirely non-affiliated namesakes: podcast app (Fountain Labs Ltd), a wellness brand "Fountain Life", a church streaming app, wallpaper/theme apps, a fitness-studio-network app ("Fountain Fitness" / "The Fountain of Fitness" via MINDBODY/PushPress white-label), an Indian civil-services coaching app ("Fountain IAS Learning App"), and several literal water-fountain / decorative-fountain apps. |

**Verdict: no Fountain (hiring/recruiting/onboarding SaaS) app on Google Play**, corroborating the
iOS App Store result with an independent store.

## Check 2 — Browser extension stores (Chrome Web Store, Firefox Add-ons)

| Store | Query | Result |
| --- | --- | --- |
| Chrome Web Store | `fountain hiring` | Zero results ("No search results" — the store's own empty-state message). |
| Chrome Web Store | `fountain ats` | Zero results (same empty-state message). |
| Firefox Add-ons (AMO) | `fountain hiring` | 26 results returned, all unrelated "Mountain Spring" themed browser-theme add-ons by hobbyist theme authors (MaDonna, Creative_Expressions, etc.) — a keyword-overlap artifact ("spring"/"mountain"/"fountain" fuzzy-matched), zero relation to Fountain the hiring platform. |

**Verdict: no Fountain-published Chrome or Firefox extension.** Consistent with the product type — Fountain
is a hiring/onboarding SaaS with no plausible in-browser-augmentation use case (unlike, say, an ATS
sourcing-extension play — LinkedIn-scraper-style extensions exist in this space for OTHER vendors, e.g.
recruiting-CRM sourcing tools, but Fountain does not ship one under any discoverable name).

## Check 3 — PWA manifest / service-worker check on app.fountain.com

Fetched the live app shell HTML directly (`curl` with a standard desktop UA, bypassing any bot-specific
serving):

```
GET https://app.fountain.com/  -> 200, 5530 bytes, text/html
```

Full `<head>` (verbatim, no PII):

```html
<!doctype html><html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="icon" type="image/png" href="/80a74d4/favicon.png"/>
  <title>Fountain</title>
  <script defer src="/80a74d4/runtime.*.js"></script>
  ... (~50 defer'd webpack vendor chunks — full list in deployed-client-bundle's raw/, not duplicated here)
</head>
```

Findings:

- **No `<link rel="manifest" ...>` tag.** No web-app-manifest is declared.
- **One legacy PWA-adjacent meta tag**: `<meta name="mobile-web-app-capable" content="yes">` — this is
  the older, Chrome-only "add to home screen, launch full-screen" hint. It works WITHOUT a manifest.json
  (unlike the modern installable-PWA path, which requires a manifest + a registered service worker to
  qualify for the install prompt). Its presence is a genuine, if minor, mobile-web-optimization signal —
  it is NOT evidence of a native-app-equivalent PWA install experience.
- **Direct path probes for a manifest/service-worker all returned HTTP 200, but this is a false
  positive**: the app is a client-side-routed SPA with a catch-all server route, so EVERY path
  (`/manifest.json`, `/manifest.webmanifest`, `/sw.js`, `/service-worker.js`, and literally any other
  path) serves the same `index.html` shell (`content-type: text/html`, `x-content-type-options: nosniff`,
  identical byte-for-byte body). Verified by content-type + body-diff, not by status code alone (status
  code alone would have been a false "manifest exists" reading — see below).
- **Grepped the main JS bundle** (`main.<hash>.js`, 9.23 MB) for `serviceWorker.register`,
  `navigator.serviceWorker`, and dynamic `rel=manifest` injection — zero matches. No service worker is
  registered at runtime either.

**Verdict: no manifest.json, no service worker, no installable-PWA signal.** The single
`mobile-web-app-capable` meta tag is the full extent of any "mobile-first" distribution-artifact
signal on the live app shell — it is a responsive/mobile-web hint, not a distribution artifact in the
binary-extract sense (no manifest to decode, no permissions/host list, no capability map).

## Net verdict (all 3 checks + Discovery's iOS sweep)

| Surface | Checked | Result |
| --- | --- | --- |
| iOS App Store (3 query variants) | Discovery | Zero Fountain-affiliated apps |
| Google Play (3 query variants) | Ingestion | Zero Fountain-affiliated apps |
| Chrome Web Store (2 query variants) | Ingestion | Zero results at all |
| Firefox Add-ons (1 query variant) | Ingestion | Zero relevant results (keyword-collision noise only) |
| PWA manifest / service worker on app.fountain.com | Ingestion | Absent — SPA catch-all routing produces false-positive 200s; verified absent by content-type + body + bundle grep |

**No downloadable/installable client of any kind exists for Fountain** across mobile app stores, browser
extension stores, or an installable-PWA path. This is a clean, fully-closed absence — not a gap from an
incomplete search.
