---
dimension: community
target: fountain
status: complete
access_grade_used: presence:rich
method: crawl-clip
completeness_pct: 75
confidence: medium
captured_at: 2026-08-09
sources:
  - "https://www.fountain.com/blog"
  - "https://new.fountain.com (paginated: 2022 -> Aug 2026)"
  - "https://www.fountain.com/news"
  - "https://status.fountain.com (+ /api/v2/components.json, /api/v2/incidents.json)"
  - "https://www.g2.com/products/fountain/reviews (via WebSearch — direct WebFetch 403'd)"
  - "https://www.softwaresuggest.com/fountain"
  - "https://rectec.io/rectec-certified-partner/"
  - "https://fountain.canny.io (checked, unclaimed)"
  - "https://support.fountain.com (checked, help-center only)"
  - "https://github.com/Fountain (re-confirmed namesake per prior dimension finding — not re-probed for issues)"
gaps:
  - "No public issue tracker / roadmap-voting board / forum exists — 'most requested feature' themes are inferred from changelog churn + incident naming + one commissioned survey, never counted tickets (see raw/issue-themes.md)."
  - "G2 page itself returned 403 to direct WebFetch — G2 rating/badge facts are WebSearch-derived summaries of the page, not a primary-source read."
  - "Blog post publish dates were not recoverable from the listing page (single byline 'Salim Jernite', no visible dates); dates recovered only for posts that also exist as press releases."
  - "new.fountain.com's discoverability from in-app (a logged-in 'what's new' bell/panel) could not be checked — auth:none for this run."
---

# Fountain — Community capture

## Method

Checked the full alternate-home checklist (ingestion §7 rule 10) before drawing any absence conclusion:
`fountain.com/changelog`, `/releases`, `/product-updates` (all 404); `updates.`/`changelog.`/`feedback.`/
`roadmap.fountain.com` (all DNS-fail); `fountain.canny.io` (200 but explicitly "no such company" —
unclaimed); `fountain.zendesk.com` (403, exists but not a public forum); `support.fountain.com` (real
Zendesk-style help center, no forum/voting mechanism). A separate targeted search
(`support.fountain.com "release notes"`) surfaced the actual first-party changelog at
**`new.fountain.com`** — live, rich, dated back to July 2022, but **not linked from the main
`fountain.com` site** (verified by raw-HTML grep of the homepage for changelog-related hrefs — zero
hits). Mined it via its `?date=YYYY-MM-DD` pagination across 5 sample windows (Aug 2026, Jun 2026, Mar
2026, Dec 2025, Sep 2025). Mined `status.fountain.com`'s public Statuspage.io JSON API
(`/api/v2/components.json`, `/api/v2/incidents.json`) directly — no auth needed, no PII present. Crawled
`fountain.com/blog` (listing page) and `fountain.com/news` (press-release list) for narrative. Traced the
three homepage-cited recognition badges (G2, Rectec, SoftwareSuggest) to their live source pages, plus
the 2026 Gartner MQ press coverage. `github.com/Fountain` was not re-probed — the prior dimension already
confirmed it's an unrelated namesake org (pre-dates the company by 5 years), so no public issue tracker
exists to mine there.

## Findings

### Release cadence & direction

`new.fountain.com` runs bi-weekly release-note roundups (3–10 items each) going back to July 2022, self-
reported at "~4–6 updates monthly" across `Hire`/`Source`/`Pool`/`Shift`/`Onboard`/`Referrals`/`Platform`/
`Hire Go`/`CRM`/AI-agent categories. **The heaviest recent churn (Jun–Aug 2026) is AI agents**: Cue
(workflow-automation agent, launched as a press release "Autonomous AI System" Apr 14/23, 2026 — now
getting scheduled-task automation, Jul 23), Sam (a new voice retention/satisfaction agent introduced Jun
25, 2026, checking in with workers at Day 1/7/30 milestones), and Candidate AI Agent knowledge-base
tooling. This is independently corroborated by a second, unrelated first-party source: `status.fountain.
com` added a dedicated **"AI Interviews"** monitoring component on **2026-07-06**, squarely inside the
same window. Second-heaviest: **Source** (sourcing/job-board campaigns — a new "Campaigns" page, Talroo
attribution/conversion tracking, contracted job-board access). Steady baseline: ATS/Hire UX (bulk-action
friction repeatedly iterated across ≥3 separate release windows — Hire and Shift both) and compliance/
localization (state W-4/I-9 forms, translation accuracy).

### Issue / request themes (inferred — no public tracker exists)

| Theme | Signal strength | Confidence |
| --- | --- | --- |
| Bulk/mass-action friction (applicant + shift lists) | fixed ≥3 separate times across 2 products | low-medium |
| Cross-product login fragmentation | "Unified login across Fountain" ships Mar 2026 | medium |
| Cue (new AI agent) early instability | 3 status-page incidents in its first launch month | medium |
| AI-hiring candidate trust/transparency | first-party-commissioned survey: 62% of applicants report ghosting; top complaints = lack of communication + unexplained AI screening rejections | high (acknowledgment) / low (whether the fix works — unverified) |
| Translation/localization gaps | touched 3x over 6 months | low-medium |
| Analytics/reporting reliability | 3 incidents in a 5-week window incl. 1 critical, right after "Warehouse Connections" launched | medium |
| Market presence / review recency vs. competitors (e.g. Gem) | secondhand G2-summary read | low |

Full theme detail + how each was derived: `raw/issue-themes.md`.

### Blog narrative

`fountain.com/blog` (16+ pages) is SEO/thought-leadership content (recruiting best practices, workforce
planning, a "Fountain vs. SmartRecruiters" named-competitor comparison), separate from both the changelog
and the press-release stream. The strategic narrative lives in **press releases** (`fountain.com/news`):
Cue launch (Apr 2026, framed as "autonomous") → first-ever Gartner MQ inclusion as a **Niche Player**
(May 2026, the lowest of Gartner's four MQ quadrants, heavily promoted anyway as a first-time milestone)
→ a named customer win (The Service Companies, 35 states, Jul 2026) → a self-commissioned AI-trust survey
positioned as a transparency differentiator (Jul 2026). CEO Sean Behr's framing: "Hiring isn't just about
managing pipelines anymore... making sure roles are filled and teams are ready to work" — positions
Fountain as an execution/operations platform, not just an ATS. Market segments named across releases:
logistics, retail, staffing, restaurants, healthcare, food & beverage.

### Status page — reliability + architecture signal

Genuine Statuspage.io instance, 39 monitored components across 6 groups. **Multi-cloud**: both AWS
(compute in us-east-1/2, ap-south-1, eu-central-1 — all added in a single batch on 2025-10-20 — plus S3 in
4 regions) and Azure ("frontend application and API servers," since 2021) are monitored. **No public
microservice-level granularity** for the security/workforce/hire backend split hypothesized in
`00-recon-plan.md` — "Core" bundles API/Dashboard/Webhooks/Background Processing undifferentiated, so the
status page neither confirms nor refutes that hypothesis. `Pusher` is monitored as a first-class
component, confirming a WebSocket/pub-sub realtime layer. Integration vendors monitored directly: Checkr
(background checks), DropboxSign (e-signature), Everify (E-Verify), Cronofy (scheduling), Twilio (5
regions) + **Bird Messaging** (a second SMS/messaging vendor, all 4 regions added 2026-03-30 — recent
multi-provider redundancy or migration).

**Incident history** (50 records, 2025-11-11 → 2026-07-31, ~8.5 months): impact mix `none`:24 · `minor`:
13 · `major`:10 · `critical`:2 · `maintenance`:1 (≈5.9/month, 12 of 50 major-or-worse). Two critical
incidents both landed in **June 2026** (Analytics Service Degradation, Platform Severely Degraded).
"Cue agent service disruption" appears 3x in Cue's first month live, then never again in the remaining
2.5-month sample. **A real, non-marketing architecture + customer finding**: "Planned downtime" incidents
name dedicated environments beyond the standard region pools — `amazon-mm`, `amazon-eu-dsp`, `ceracare` —
strongly implying Amazon (logistics Middle-Mile / Delivery Service Partner driver hiring) and at least one
other large account run on **isolated, separately-scheduled deployments**, not just shared multi-tenancy.
Full detail: `raw/status-page-architecture.md`.

### Recognition badges — traced to source

All three badges Fountain cites on its own homepage are weaker on inspection than their homepage framing
implies:

| Badge | Reality |
| --- | --- |
| "G2 High Performer Fall 2023" | Real G2 profile (4.3/5, 126 reviews, live) — but the homepage badge image is pinned to **Fall 2023**, ~2.5 years stale, despite G2 badges refreshing quarterly. |
| "Rectec Certified Partner" | Rectec is a UK ATS/CRM **vendor directory/comparison service** with a fee-free vendor-onboarding certification — not a competitive review ranking like G2. Displayed with equal visual weight regardless. |
| "Software Suggest High Performer" | Traced to a SoftwareSuggest page showing **1 review** (5/5, Nov 2023) backing a "Winter 2025" badge — the thinnest evidentiary base of the three. |

Gartner MQ "Niche Player" (May 2026, first-ever inclusion) is separately and heavily promoted via press
release/ebook/blog — the lowest of the four MQ quadrants, but a genuine first-time milestone. Full trace:
`raw/review-badges-traced.md`.

## Inferences

- **Fountain is mid-pivot from "ATS" to "AI-agentic hiring/workforce-operations platform."** Three
  independent first-party surfaces agree on timing and direction: the changelog (Cue Apr 2026, Sam Jun
  2026), the press-release stream (Cue launch framed as "autonomous," Gartner MQ debut tied explicitly to
  the Cue launch), and the status page (a dedicated AI Interviews component appearing Jul 2026). This is
  a corroborated direction claim, not a single-source read.
- **The AI-agent rollout is still maturing operationally**, not just narratively: Cue had 3 named
  service-disruption incidents in its first live month, and the new data-warehouse integration
  (Analytics/Warehouse Connections) had a critical incident + 2 more within 5 weeks of launch. The
  marketing claim of "autonomous" execution should be read against a product still working through
  early-launch reliability issues.
- **The homepage's third-party-validation badges overstate their own rigor** — pairing a live 126-review
  G2 badge (itself 2.5 years stale as displayed) with a 1-review SoftwareSuggest badge and a vendor-
  directory certification, at equal visual weight, is a real positioning-vs-substance gap worth flagging
  for `competitive-positioning.md`.
- **Fountain serves at least one enterprise logistics account (very likely Amazon) on dedicated,
  separately-scheduled infrastructure** — inferred from status-page maintenance-window naming
  (`amazon-mm`, `amazon-eu-dsp`), independent of any marketing claim. This corroborates the "logistics"
  vertical Fountain names in its own press releases, from a non-marketing source.
- **The self-commissioned AI-trust survey (Jul 2026) is a genuine, well-quantified first-party
  acknowledgment of a real rough edge in the AI-hiring category Fountain sells into** — candidates
  distrust opaque automated screening. Whether Fountain's stated mitigations (explainable scoring,
  opt-in human review, full logging) are actually implemented as described is unverified (no `session`
  dimension was run for this target — `auth:none`).

## Open questions

- Whether `new.fountain.com` is surfaced anywhere inside the authenticated app (a "what's new" panel) —
  unverifiable without a session.
- True request/complaint volume behind any inferred theme — no counted-ticket source exists.
- Whether the Cue incident pattern (3x in month 1, 0x afterward) reflects a genuine fix or just reduced
  status-page granularity for agent-specific issues going forward.
- G2's full review-text pros/cons breakdown (blocked at 403 to direct fetch; only a WebSearch summary was
  obtained) — a fuller G2/Capterra read would strengthen `competitive-positioning.md`.

## Recommendation — flag `external-reputation` for this run

Per discovery.md Part C's conditional trigger: while a first-party **changelog** does exist
(`new.fountain.com`), there is **no public issue tracker, roadmap-voting board, or forum** — i.e. no
two-way first-party feedback intake at all, only one-way broadcast (changelog + blog + press releases).
The "most requested feature" / "top complaint" themes in this capture are therefore inferred from
changelog churn and incident-log naming, never from a counted user report, and are capped at
low/tentative per evaluation's closed-feedback rule. **Recommend running `external-reputation`** (G2 full
review corpus, Glassdoor, Reddit/HN if any) specifically to corroborate or refute the theme table above
with real user-voice — this is the single highest-value follow-up for this dimension.

## Artifacts

- `raw/changelog-digest.md` — cadence + recent-direction detail + product-line map + press-release
  narrative table + blog notes.
- `raw/issue-themes.md` — the inferred theme table with full derivation + the alternate-home checklist
  proving no public tracker exists.
- `raw/status-page-architecture.md` — full component-group breakdown, incident-impact distribution,
  the dedicated-tenant-environment finding, and the Cue/Analytics incident clusters.
- `raw/review-badges-traced.md` — G2 / Rectec / SoftwareSuggest / Gartner MQ, each traced to its live
  source page.
