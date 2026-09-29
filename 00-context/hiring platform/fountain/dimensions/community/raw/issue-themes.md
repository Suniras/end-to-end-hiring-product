<!-- source: no public issue tracker/roadmap/forum exists for Fountain — themes below are INFERRED from
     first-party changelog churn, status-page incident naming, and a first-party-commissioned survey
     cited in a press release. method: inferred (capped low/tentative per evaluation's closed-feedback rule)
     captured_at: 2026-08-09 -->

# Fountain — Issue / request themes (inferred, no public tracker)

## Why this table is inferred, not observed

Checked the full alternate-home list per ingestion §7 rule 10 before concluding there is no public
feedback loop:

| Surface checked | Result |
| --- | --- |
| `github.com/Fountain` | confirmed namesake (pre-dates the company; see 00-recon-plan.md) — no issues to mine |
| `fountain.com/changelog`, `/releases`, `/product-updates` | 404 |
| `updates.`/`changelog.`/`feedback.`/`roadmap.fountain.com` | DNS-fail / unreachable |
| `fountain.canny.io` | 200 but **unclaimed** ("There is no such company") |
| `fountain.zendesk.com` | 403 (exists but not publicly browsable as a forum) |
| `support.fountain.com` | real Zendesk-style help center (302→`/en/`) — a knowledge base, not a public
  forum/idea board; no upvote/roadmap mechanism found |
| `new.fountain.com` | **found** — a real, rich first-party changelog (see raw/changelog-digest.md), but
  it is one-way broadcast (release notes), not a two-way feedback/request board |

**Verdict: a changelog exists (broadcast), but no public issue tracker, roadmap-voting board, or forum
exists (no intake).** This is a partial version of the discovery Part C trigger — flagging
`external-reputation` as recommended-for-this-run (see `_summary.md`) specifically for the
request/complaint-theme axis, even though the changelog itself is not absent.

## Theme table (each row: inferred from — never a counted ticket)

| Theme | Rough signal | Inferred from | Confidence |
| --- | --- | --- | --- |
| **Bulk / mass-action friction on applicant & shift lists** | recurring feature, ≥3 separate release windows | changelog: "More control when selecting applicants in bulk" (Mar 2026), "Bulk actions for faster schedule management" (Shift, Mar 2026), "Collapsible Status Labels in Applicant Tables" (Dec 2025) | low-medium (repeated fixes to the same surface implies real friction, but no direct user quote) |
| **Cross-product login/identity fragmentation** | 1 explicit fix | changelog: "Unified login across Fountain \| Users authenticate using consistent credentials across all Fountain products" (Hire Go, Mar 2026) — implies users previously had to re-auth per product (Hire vs Hire Go vs Source vs Pool) | medium (a "unified login" fix is a direct tell of a prior fragmented-auth complaint) |
| **New AI-agent (Cue) early instability** | 3 incidents in the first month post-launch | status-page incidents: "Cue agent service disruption" × 3 (Apr 28 minor, May 6 minor, May 12 major) — Cue launched Apr 14/23, 2026 | medium (direct incident-log evidence, not inferred from a support ticket, but small sample) |
| **AI-hiring trust/transparency (candidate-side, not recruiter-side)** | first-party-acknowledged, quantified | Jul 2026 press release citing Fountain's own commissioned survey (1,014 US frontline workers, Jun 2026): 62% report being "ghosted" after multiple interview rounds, top complaints = "lack of communication" (20%) and "unexplained AI screening rejections"; Fountain's response = pre-notification before AI interaction, "explainable scoring," opt-in human review, full AI-action logging | **high for the acknowledgment itself** (Fountain published it), low for whether their fix actually resolves it (unverified, no session/write-side observation) |
| **Translation/localization gaps** | recurring, low-severity | changelog: "WhatsApp Translation" (Sep 2025), "Job Directory Translation" (Sep 2025), "Improve translation accuracy with custom terminology" (Mar 2026) — the same localization surface touched 3 times over 6 months | low-medium |
| **Analytics/reporting reliability** | 2 status-page incidents, 1 "critical" | "Analytics Service Degradation" (critical, Jun 12, 2026), "Partial Analytics Service Degradation" (major, Jun 16, 2026), "Stale data in Analytics and Warehouse for EU Customers" (minor, Jul 17, 2026) — three analytics-specific incidents in a 5-week window, shortly after "Warehouse Connections" launched (Mar 24, 2026) | medium (direct incident log; suggests the new data-warehouse integration surface is still maturing) |
| **Market presence / review-recency vs competitors** | secondary G2 read | G2 summary (WebSearch-derived): "Fountain faces challenges in overall market presence and user engagement... fewer recent reviews compared to competitors" (e.g. Gem cited as higher G2 Score) | low (secondhand summary of G2 copy, not a primary review read — G2 itself blocked WebFetch, 403) |

## Acknowledged limitations (first-party, explicit)

- **Gartner Magic Quadrant "Niche Player"** (not Leader/Visionary/Challenger) is itself an implicit
  acknowledgment of a market-position gap — Fountain publicized its first-ever MQ inclusion rather than
  downplaying the modest quadrant, which reads as a company treating "we're finally on the map" as the
  win, not the quadrant placement itself.
- **The AI-transparency press release is the clearest first-party gap-acknowledgment found**: Fountain is
  responding to a real, self-measured candidate-trust problem in its own product category (automated
  screening perceived as opaque/unfair by the workers subject to it) rather than asserting no problem
  exists.

## Open questions

- No way to size real ticket volume/frequency behind any theme above — all are changelog/incident-log
  inferences, never a counted complaint.
- Whether Cue's early instability (May 2026) has continued or was resolved is unknown — status-page
  incidents for Cue stop after May 12 in the 50-incident sample (Nov 2025–Jul 2026), suggesting
  resolution, but this is an absence-of-evidence read, not a confirmed fix.
