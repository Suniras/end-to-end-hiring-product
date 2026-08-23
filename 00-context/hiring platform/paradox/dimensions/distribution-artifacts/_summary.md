---
dimension: distribution-artifacts
target: paradox
status: complete
access_grade_used: runtime:reachable
method: crawl-clip   # CORRECTED by Mode-5 iteration 2 — was `binary-extract`, which the §3 vocabulary maps to `high` confidence. NO binary was ever downloaded, extracted, or decompiled: this capture is public App-Store / Play-Store listing metadata + first-party marketing screenshots, which is `crawl-clip`-class collection. Confidence is retained at `high` on a narrower basis (see below), NOT inherited from the method label.
method_note: "Confidence `high` here is justified by the ARTIFACT, not the method: the store listings and screenshots are first-party, machine-served, and directly inspected, so what they SHOW (bundle IDs, versions, release dates, visible UI chrome) is directly observed. It does NOT extend to anything requiring the binary — permissions scope, manifest contents, host permissions — all of which remain listed as gaps. Downstream rollups citing `binary-extract · high` should read `crawl-clip · high (first-party listing artifact)`."
completeness_pct: 70
confidence: high
captured_at: 2026-08-09
sources:
  - "https://apps.apple.com/us/app/olivia-by-paradox-cem/id1330936756"
  - "https://itunes.apple.com/lookup?id=1330936756&country=us"
  - "https://itunes.apple.com/lookup?id=1290013605&entity=software (Paradox developer catalog)"
  - "https://apps.apple.com/us/app/regis-hire/id1593160760"
  - "https://apps.apple.com/us/app/olivia-extension/id6747236880"
  - "https://play.google.com/store/apps/details?id=ai.paradox.olivia"
  - "https://play.google.com/store/apps/details?id=ai.paradox.regis"
  - "https://play.google.com/store/apps/developer?id=Paradox+Ai"
gaps:
  - "No binary decompile / IPA-APK download performed — stayed at public-listing metadata level throughout, per ingestion §7.2 and explicit task scope (no restrictive-EULA blocker was actually hit; the ceiling was self-imposed by design, not a license refusal)"
  - "Granular Android runtime-permission list not retrievable from the current Play listing's static HTML (Google renders it behind a JS 'About this app' expansion)"
  - "Olivia Extension's actual manifest / host-permission scope not verified (would require downloading + inspecting the signed macOS .app bundle)"
  - "Chrome Web Store equivalent of the extension searched for but not confirmed either way (JS-rendered search results; not a claimed absence)"
  - "Full historical App-Store changelog beyond the current version's release notes is not exposed by Apple's public listing/lookup API"
  - "White-label app roster likely incomplete — only 'Regis' surfaced on both stores' public developer-catalog pages within scope; other named enterprise customers (Marriott, IHG, Compass Group etc.) may have their own co-branded builds not enumerated here"
---

# Paradox — distribution-artifacts capture

## Method

Confirmed by Discovery: a genuine native app, "Olivia by Paradox - CEM" (iOS App Store id 1330936756,
publisher Paradox, Inc). Per task instruction and ingestion §7.2, this capture deliberately stayed at
**public-listing metadata level** — no IPA/APK download, no sideloading, no decompilation. Three tools
were used, all public/unauthenticated: (1) `WebFetch` against the App Store and Play Store listing
pages, (2) the undocumented-but-public `itunes.apple.com/lookup` JSON API (id lookups, no auth), (3)
plain `curl` against `play.google.com` static HTML (Google Play's own JSON-LD/schema.org block embedded
in the page). No EULA blocked any step actually attempted — the App Store listing surfaces only Apple's
implicit Standard EULA (no custom license link), and nothing beyond listing metadata was ever attempted
regardless. Screenshot assets (public marketing images, not app internals) were downloaded and visually
inspected directly, since this run has `auth: none` and no live `session` capture — the App Store
screenshots became the richest available surrogate for an actual UI walk of the product, per the task's
explicit framing.

**Beyond the single anchor app, this capture expanded the surface materially**: pulling the full public
developer catalog for Paradox's iOS/Mac account (id 1290013605) and the Play Store developer page
(`Paradox Ai`) surfaced **three distinct distribution artifacts, not one** — the flagship CEM app
(iOS+Android), a white-labeled "Regis + Paradox CEM" build for a named enterprise customer (iOS+Android),
and a previously-unknown-to-this-run macOS/Safari Web Extension ("Olivia Extension", released mid-2025).

## Findings

### Artifact inventory

| Artifact | Platform | Package/Bundle ID | Released | Current version | Rating | Installs/Downloads |
| --- | --- | --- | --- | --- | --- | --- |
| Olivia by Paradox - CEM | iOS | `ai.paradox.olivia` | 2018-01-16 | 2.2.0 (2026-07-14) | 3.45★ (31) | — |
| Olivia by Paradox - CEM | Android | `ai.paradox.olivia` | — | updated 2026-07-13 | 3.16★ (100) | 10,000+ |
| Regis Hire / "Regis + Paradox CEM" | iOS | `com.paradox.regis` (id 1593160760) | 2021-11-17 | 1.4.9 (2026-07-14) | 1.0★ (1 rating — not statistically meaningful) | — |
| Regis + Paradox CEM | Android | `ai.paradox.regis` | — | updated Jul 2026 | — | 500+ |
| Olivia Extension | macOS (Safari Web Extension) | `ai.paradox.brext` (id 6747236880) | 2025-06-16 | 2.5.5 (2025-10-14) | 0 ratings | — |

Full per-artifact detail: `raw/ios-app-store-listing.md`, `raw/android-play-store-listing.md`,
`raw/olivia-browser-extension-listing.md`.

### "CEM" confirmed = Candidate Experience Manager

Stated verbatim and identically across every listing checked: "Paradox CEM (Candidate Experience
Manager)". **This is the recruiter-facing management console app** (candidate list, chat takeover,
scheduling) — the *candidate*-facing side of Olivia has no separate installable app; it lives entirely
inside the web/SMS/email/Facebook-Messenger chat channels the recruiter app manages.

### What the screenshots show (full detail: `raw/screenshot-catalog.md`)

Both apps' screenshots depict the **same recruiter console** — a candidate list (status pills: Interview
Scheduled / Pending / Canceled / Capture Incomplete), a per-candidate 4-tab profile (**Conversation /
Resume / Notes / Hire Details**), a chat-takeover composer, and — most notably — a **labelled "Assist"
AI-copilot panel distinct from the candidate-facing Olivia chat**, with voice input, that answers the
*recruiter's own* scheduling/availability questions ("When is my next interview?", "How do I update my
availability?"). A branded short-link domain `oli.vi` appears in a scheduling-proposal message. The login
screen accepts phone / email / **Employee ID** as one unified identifier field, consistent with
enterprise HRIS/directory integration.

### The Olivia Extension is a LinkedIn-embedded sourcing companion

Not mentioned anywhere in this run's `website`/`docs` captures. Its App Store screenshots show a
floating Paradox panel injected on top of LinkedIn's own messaging UI, letting a recruiter: answer a
candidate's questions, build an interview-time-slot proposal, and add a brand-new candidate straight into
Paradox's pipeline — all without leaving LinkedIn. Marketing copy explicitly claims it works on "whichever
tab for that matter," implying broad host-permission scope. Released June 2025 (recent), English-only,
gated behind an existing Paradox account ("You need a Paradox account to use this extension").

### Release cadence & platform parity

Both mobile apps ship on the same cadence, essentially simultaneously (iOS 2026-07-14, Android
2026-07-13) — a single coordinated release train across platforms, not independently-paced iOS/Android
teams. The flagship app has been continuously maintained since January 2018 (8+ years) and was updated
within the last month of this capture.

### White-label distribution architecture

Paradox ships **customer-co-branded native app builds**, confirmed for at least one named customer
("Regis," on both iOS and Android, functionally identical to the flagship app apart from branding). This
is a genuine distribution/packaging finding: the mobile client is not a single multi-tenant app but a
per-large-customer build pattern — implying more such builds plausibly exist for Paradox's other named
enterprise logos (Marriott, IHG, Compass Group, Sodexo, etc.) but were not enumerated within this
capture's scope.

### Public sentiment (note, not over-read)

iOS: 3.45★/31 ratings. Android: 3.16★/100 ratings. Visible complaint themes cluster on **auth
reliability** (login failures, sign-in glitches) and **a specific feature regression** (loss of
candidate-disposition/status visibility after an update) rather than the core AI/chat experience. Sample
sizes are small for an enterprise B2B tool where the mobile app is a secondary on-the-go surface (the
primary console is desktop web) — a real but limited signal.

## Inferences

- **Olivia is a two-surface AI product, not one.** Marketing (`website`/`docs`) foregrounds the
  candidate-facing conversational screening/scheduling assistant almost exclusively. This capture found a
  second, recruiter-facing AI-copilot layer (the in-app "Assist" panel + the standalone browser
  extension) that is materially less marketed — a genuine unmarketed-depth finding Cartography would
  otherwise have needed a live session to surface (inference, corroborated by two independent artifacts
  — the CEM app's Assist panel and the separate Extension — agreeing on the same theme).
- **The Employee-ID login field is a soft (unverified) corroboration** of Discovery's `scim2-models`
  PyPI-package hypothesis (SCIM-based enterprise identity/provisioning) — no SCIM endpoint was directly
  observed; flagged as inference only.
- **The `oli.vi` short-link domain is a new, previously-unlisted host** for `infra-backend-fingerprint`
  to fold into its DNS/CT sweep — observed directly in a first-party screenshot, not inferred.
- **The white-label build pattern is inference-from-two-data-points** (one customer, two platforms) —
  real, but the claim "more customers likely have their own builds" is a hypothesis, not confirmed.

## Open questions

- Does the Olivia Extension's actual manifest request `<all_urls>`-class host permissions (as its
  marketing copy implies), or is it scoped narrower than advertised? Would require downloading and
  inspecting the signed `.app` bundle — out of scope for this metadata-only pass.
- Is there a Chrome Web Store equivalent of the extension? Searched, inconclusive (JS-rendered results) —
  not confirmed absent.
- How many other customer-specific white-label app builds exist beyond "Regis"? Only surfaced via the
  two public developer-catalog pages within scope; a systematic sweep (trying `ai.paradox.<customer>`
  package-ID guesses, or crawling Paradox's own customer-logo list against each store) was not attempted.
- Why does the Android "Data safety" self-declaration ("no data collected") diverge from iOS's "App
  Privacy" declaration (Usage Data + Diagnostics collected)? Most plausibly inconsistent self-reporting
  between developer consoles rather than a real platform difference — unresolved either way.
- Full historical changelog (only the current version's release notes are exposed by Apple's public
  API) — a deeper release-cadence history would need a third-party App Store history tracker, not
  attempted here.

## Artifacts

- `raw/ios-app-store-listing.md` — full iOS flagship-app listing digest (identity, description, What's
  New, ratings, privacy labels, permissions).
- `raw/android-play-store-listing.md` — Android flagship-app listing + the "Regis + Paradox CEM"
  white-label Android sibling.
- `raw/olivia-browser-extension-listing.md` — the third, previously-unlisted distribution artifact: the
  macOS/Safari Web Extension, full listing + 4-screenshot description.
- `raw/screenshot-catalog.md` — the Cartography-lite surface-map: all 6 flagship-app screenshots (3
  iPhone + 3 iPad) described in UI-surface detail, since this run has no live `session` to walk.
- Shared: `dimensions/_shared/api-path-catalog.md` (`## source: distribution` section) — the `oli.vi`
  host lead + bundle-ID namespace finding, for `infra-backend-fingerprint` to cross-check.
