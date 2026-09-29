<!-- source: multiple (see below) · captured_at: 2026-08-09 · method: crawl-clip + docs-reconstructed -->

# Paradox — Changelog / Release-Cadence Digest

## 1. No public web changelog exists (verified via full alternate-home checklist)

Per ingestion.md §7 rule 10, checked every common alternate home before concluding absence:

| Candidate | Result |
| --- | --- |
| `paradox.ai/changelog`, `/whats-new`, `/release-notes` | 404 |
| `changelog.paradox.ai` | NXDOMAIN (curl exit 000) |
| `updates.paradox.ai` | NXDOMAIN |
| `feedback.paradox.ai` | NXDOMAIN |
| `roadmap.paradox.ai` | NXDOMAIN |
| `paradox.canny.io` | HTTP 200 but body = "There is no such company. Did you enter the right URL?" — unclaimed |
| `paradoxai.canny.io`, `olivia.canny.io` | same Canny "no such company" placeholder |
| `paradox.featurebase.app`, `hiparadox.featurebase.app`, `paradox-ai.featurebase.app` | generic Featurebase app shell / 307 redirect, no populated board content resolvable |
| `paradoxai.featureos.app` | blank/generic FeatureOS shell, no board name populated |
| RSS/Atom autodiscovery on homepage + `/blog` | no `<link rel="alternate" type="application/rss+xml">` tag present; `/feed`, `/blog/feed`, `/blog/rss.xml` all 404 |

**Conclusion: no public-facing changelog, roadmap, or hosted feedback board.** This is a genuine absence, not a wrong-host miss.

## 2. BUT a gated release-notes page demonstrably exists

`paradox.helpjuice.com/en_US/release-notes` returns **HTTP 302**, redirecting to a SAML SSO login
(`http://olivia.paradox.ai/login?SAMLRequest=...`) with `RelayState` pointing back at the release-notes
URL. This confirms:

- Paradox **does** maintain a release-notes article in its Helpjuice knowledge base.
- It is **customer/employee-SSO-gated**, not publicly readable — consistent with `auth:none` for this run
  (we cannot log in to read it).
- The public Helpjuice landing page (`paradox.helpjuice.com`) shows no visible "Release Notes" /
  "What's New" top-level category — only "Workday Feature Descriptions" and popular
  Conversational-Apply/Scheduling articles are surfaced to an anonymous visitor.

This is the single most concrete evidence that Paradox runs an internal release/changelog process — it
is simply not a public artifact.

## 3. "The Conversation" and "Reports" — confirmed NOT changelog channels

- **"The Conversation"** is a customer/exec **interview series** (marketing content), e.g.:
  - "The Conversation with Touchmark's Director of Talent Density on implementing Paradox… twice"
  - "The Conversation with Advantage Solutions' VP of TA Operations on defining success in frontline hiring"
  This is testimonial/case-study content, not product-update content.
- **"Reports"** is a library of downloadable **research/thought-leadership reports** (e.g. "National
  Restaurant Association: 2026 Workforce technology report"), co-branded with industry associations —
  again positioning content, not a changelog.

Both are correctly dispositioned as marketing, not community/product-update signal.

## 4. The best available release-cadence proxy: the iOS App Store "What's New" history

`apps.apple.com` — "Olivia by Paradox - CEM" (id 1330936756), publisher "Paradox, Inc."
Current version: **2.2.0**, last updated **2025-07-14**. Rating: 3.5/5 (31 ratings — low volume).

| Version | Date | Release notes (verbatim themes) |
| --- | --- | --- |
| 2.2.0 | 2025-07-14 | Chat Widget UI redesign ("cleaner, more seamless"); improved document version tracking; optimized conversational event flows for hiring events |
| 2.1.9 | 2025-06-11 | Manual blur for explicit images (moderation/privacy); emoji + reaction support in chat; scroll-performance UI refactor |
| 2.1.8 | 2025-06-09 | Media-privacy + messaging improvements; per-screen-size iOS performance optimization |
| 2.1.7 | 2025-05-12 | New language support: Finnish, Norwegian; updated interview-cancellation flow; performance work on employee segments + data sync |
| 2.1.6 | 2025-04-15 | Redesigned Reward & Recognition feature; position-management/hire-tracking logic; full iOS 26.0 support + PDF editing improvements |

**Cadence:** roughly monthly-to-bimonthly point releases (Apr → May → Jun ×2 → Jul, 2025). No entries
found past Jul 2025 on the public listing (may reflect App Store history depth, not that the app stopped
shipping — status-page incident history shows continued CEM development through mid-2026).

**Recent direction (from this proxy):** (1) chat/messaging UX polish (emoji, reactions, image
moderation/blur), (2) localization expansion (Nordic languages), (3) post-hire employee engagement
(Reward & Recognition redesign — a scope expansion beyond pure candidate conversion into retention), (4)
steady iOS-platform-compliance maintenance (iOS 26 support).

> Coordinate: `distribution-artifacts` dimension did not yet exist in this run (folder absent at capture
> time) — this pull is the only current source for the App Store "What's New" data. If
> `distribution-artifacts` is run later, it should treat this as the seed and verify/extend rather than
> re-mine from scratch.

## 5. status.paradox.ai as an unconventional but genuine changelog proxy

No "announcements" tab was found (Statuspage instance exposes components + incidents only), but the
**incident postmortems themselves are first-party technical disclosures** — see `issue-themes.md` for the
full cluster analysis. The most recent (2026-07-27) postmortem for the "CEM Slowness" incident cluster
names a concrete architecture investment: converting legacy synchronous endpoints to the platform's
"standard asynchronous backend processing model" — i.e., an active async-migration effort is underway.
