<!-- source: https://play.google.com/store/apps/details?id=ai.paradox.olivia (+ id=ai.paradox.regis), developer page play.google.com/store/apps/developer?id=Paradox+Ai · captured_at: 2026-08-09 · method: binary-extract (public-listing metadata level only, static HTML fetch) -->

# Olivia by Paradox - CEM — Google Play listing (Android equivalent CONFIRMED to exist)

Batch-lesson compliance: this is a **verified positive** via an actual Play Store search + listing
fetch (`curl` + `WebFetch` against `play.google.com`), not an assumed absence/presence.

## Identity

| Field | Value |
| --- | --- |
| App name | Olivia by Paradox - CEM |
| Package ID | `ai.paradox.olivia` — **identical bundle-namespace root to the iOS app** (`ai.paradox.*`), confirming one shared codebase/brand across platforms |
| Developer | Paradox Ai (linked to https://paradox.ai/) |
| Category | Business |
| Content rating | Everyone |
| Price | Free |
| Install count | 10,000+ |
| Last updated | 2026-07-13 — **one day before** the iOS 2.2.0 release (2026-07-14), i.e. Android and iOS ship on the same weekly/bi-weekly cadence, near-simultaneously |
| Rating | 3.16 / 5 (100 ratings) — slightly lower than iOS's 3.45/31, larger sample |

## Description (verbatim, abridged)

> "We've taken the Paradox CEM (Candidate Experience Manager) from web to Android to help you quickly and effectively communicate with your candidates. Paradox CEM mobile app benefits include: • Easily manage the candidates that your AI assistant Olivia has captured, screened and engaged for you. • Quickly communicate with your candidates through Web, Email, SMS and Facebook Messenger®. • Effortlessly schedule interviews by leveraging Olivia to find times that work for your organization and top candidates. • Receive real-time push notifications when your candidates interact with Olivia."

Word-for-word identical to the iOS description except "iOS"→"Android" — confirms a single shared
product spec across platforms, not platform-divergent feature sets.

## Data safety (Play's self-declared privacy label)

- "No data shared with third parties"
- "No data collected"
- "Data is encrypted in transit"
- "You can request that data be deleted"

**Notably more minimal than the iOS "App Privacy" label**, which does declare Usage Data + Diagnostics
collection (not linked to identity). This divergence is most plausibly just inconsistent self-reporting
between the two developer consoles (a common real-world pattern) rather than an actual platform
difference in telemetry — flagged as an open question, not resolved either way.

## Permissions

Not enumerated on the current Play listing's static HTML (Google moved the granular permissions view
behind a JS-rendered "About this app" expansion this capture's static fetch did not reach) — recorded as
a gap, not asserted absent.

## A second, WHITE-LABELED Android app: "Regis + Paradox CEM" (`ai.paradox.regis`)

Found via the `Paradox Ai` Play developer page (`play.google.com/store/apps/developer?id=Paradox+Ai`),
which lists exactly **two** apps: the flagship `ai.paradox.olivia` above, and a second package:

| Field | Value |
| --- | --- |
| App name (Play) | Regis + Paradox CEM |
| Package ID | `ai.paradox.regis` |
| Install count | 500+ |
| Last updated | same week as the flagship app (Jul 2026) |
| Description | Identical boilerplate with every "Paradox CEM" replaced by **"Regis + Paradox CEM"** ("We've taken the Regis + Paradox CEM … from web to Android …") |

**This is a real, material finding for the distribution architecture:** Paradox ships **customer-specific
co-branded native app builds** for at least one large enterprise customer ("Regis" — consistent with
Regis Corporation, a hair-salon-franchise operator, a plausible fit for Paradox's named
retail/high-volume-hourly customer base), not just one generic multi-tenant app. The white-label build is
otherwise functionally identical (same feature list, same release cadence) — it is a **branding/tenant
skin**, not a separate product. This pattern (see also `com.paradox.regis` / App Store ID 1593160760 on
iOS, confirmed via the iOS developer catalog — `raw/ios-app-store-listing.md`'s sibling developer-catalog
pull) strongly implies **more such white-label builds likely exist for other large customers** but were
not enumerated (only "Regis" surfaced on both stores' public developer-catalog pages within this
capture's scope) — recorded as an open question / re-walk candidate, not a claimed exhaustive list.
