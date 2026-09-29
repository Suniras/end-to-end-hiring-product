<!-- source: https://apps.apple.com/us/app/olivia-by-paradox-cem/id1330936756 (+ itunes.apple.com/lookup API, id=1330936756) · captured_at: 2026-08-09 · method: binary-extract (public-listing metadata level only — no IPA download/decompile) -->

# Olivia by Paradox - CEM — iOS App Store listing (flagship app)

## Identity

| Field | Value |
| --- | --- |
| Track name | Olivia by Paradox - CEM |
| Subtitle | Candidate Experience Manager |
| Bundle ID | `ai.paradox.olivia` |
| App Store ID | 1330936756 |
| Seller (legal entity) | Paradox, Inc |
| Artist/developer display | Paradox, LLC |
| Developer/artist ID | 1290013605 |
| Category (genres) | Business, Productivity |
| Content rating | 4+ |
| Price | Free ("a Paradox subscription is required to use the application") |
| Original release date | 2018-01-16 |
| Current version | 2.2.0, released 2026-07-14 (i.e. ~4 weeks before this capture — actively maintained) |
| App size | 183.9 MB (183,861,248 bytes) |
| Min OS | iOS 15.0+ / iPadOS 15.0+ / macOS 12.0+ (Apple Silicon, via Mac Catalyst or iPad-app-on-Mac) / visionOS 1.0+ |
| Supported devices | 127 device identifiers (iPhone5s-class through iPhone15/current iPad/iPad Pro/mini lines) — broad backward compatibility |
| Languages | 35 (EN + AR, BS, BG, KM, HR, CS, DA, NL, FI, FR, DE, EL, HE, HU, ID, IT, JA, KO, MS, NB, PL, PT, RO, RU, SR, ZH×2, SK, ES, SV, TH, TR, UK, VI) — a genuinely global localisation footprint, consistent with the enterprise customer base (Marriott, IHG, Compass Group, Sodexo etc. all have international/multi-language frontline workforces) |
| Developer website | https://paradox.ai/ |
| Privacy Policy | https://www.paradox.ai/legal/privacy-policy |
| EULA | No custom EULA link surfaced on the listing beyond Apple's own Standard EULA (implicit for any App-Store app that doesn't link its own) — nothing to flag as restrictive; extraction correctly stayed at listing-metadata level regardless per task instruction |
| Copyright | © 2016-2024 Paradox (per WebFetch render) / older cached screenshot shows "© 2016-2020 Olivia by Paradox.Ai" |

## Description (verbatim, abridged)

> "We've taken the Paradox CEM (Candidate Experience Manager) from web to iOS to help you quickly and effectively communicate with your candidates.
> Paradox CEM mobile app benefits include:
> • Easily manage the candidates that your AI assistant Olivia has captured, screened and engaged for you.
> • Quickly communicate with your candidates through Web, Email, SMS and Facebook Messenger®.
> • Effortlessly schedule interviews by leveraging Olivia to find times that work for your organization and top candidates.
> • Receive real-time push notifications when your candidates interact with Olivia.
> Note: The Paradox CEM is free to download and a subscription with Paradox is required to use the application."

Followed by a boilerplate "ABOUT PARADOX" company blurb (flagship product = Olivia; "recruiting is a people game"; explicit human-in-the-loop positioning: "We never want to remove humans from the recruiting process. We just want to make it better.").

**"CEM" confirmed = Candidate Experience Manager**, stated explicitly and identically across every app description checked (iOS main app, Android main app, Regis white-label variant). This is the **recruiter-facing management console**, not a candidate-facing app — the candidate side of Olivia lives entirely in the web/SMS/email/Messenger chat, never as its own installable app.

## What's New — version 2.2.0 (2026-07-14, current)

> "- Improved Chat Experience: Updated the Chat Widget UI for a cleaner, more seamless display of shared images.
> - Enhanced Document Tracking: Upgraded the 'Version History' panel to help you review document iterations more easily.
> - Streamlined Events: Optimized conversational event flows to smoothly skip Superday Hiring Events within the app."

Only the current version's release notes are retrievable via the public listing/lookup API (no historical changelog archive is exposed by Apple) — a **release-cadence data point** (last shipped 4 weeks before capture) rather than a full changelog history. "Superday Hiring Events" is a named Paradox feature (high-volume in-person hiring events, a known vertical — retail/restaurant/hospitality bulk hiring days) confirmed as a first-class in-app concept.

## Ratings & reviews

| Metric | Value |
| --- | --- |
| Average rating | 3.45 / 5 |
| Rating count | 31 |

Visible review themes (paraphrased, no reviewer names/handles quoted per redaction discipline): loss of candidate-disposition functionality after an update, recurring login/sign-in failures and UI glitches, and a report that applicant-status visibility was removed without notice. **Read as a signal, not over-indexed** — n=31 is a very small sample for an enterprise B2B tool whose real usage happens on desktop web (the mobile app is a secondary/on-the-go surface for recruiters, not the primary console), and dissatisfaction clusters on auth reliability and a specific feature regression rather than the core AI/chat experience.

## Privacy labels ("App Privacy" section)

**Data Not Linked to Identity:**
- Usage Data (Product Interaction)
- Diagnostics (Crash Data, Performance Data)

No data collection categories are declared as "Linked to You" or "Used for Tracking" — a fairly minimal self-declared footprint for an app that handles candidate PII server-side (consistent with the PII living in the backend API, not in on-device telemetry).

## Permissions (visible on listing)

- Location access flagged ("may decrease battery life") — plausible use: recruiter check-in at a hiring event / geo-tagging interview locations (the Inbox screenshot shows per-candidate location fields).
- "Contains Messaging and Chat" (Apple's generic content descriptor, not a granular permission).

No microphone/camera/contacts permission is flagged on the public listing itself (Apple surfaces only a subset pre-download; a full permission/entitlement list would require the actual binary's `Info.plist`, which was not pulled per the metadata-only scope of this capture).
