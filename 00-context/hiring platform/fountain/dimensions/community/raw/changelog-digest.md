<!-- source: https://new.fountain.com (paginated via ?date=YYYY-MM-DD) · captured_at: 2026-08-09 · method: crawl-clip -->

# Fountain — Changelog digest (`new.fountain.com`)

## Discovery note (not the main marketing nav)

`new.fountain.com` is a real, actively-maintained first-party product-changelog site — but it is **not
linked from the `fountain.com` homepage or footer** (checked via raw-HTML grep for `changelog`/`updates`/
`release`/`new.fountain.com` hrefs — zero hits). It was located via a targeted web search for
`support.fountain.com "release notes"`, which surfaced it as an indexed result. `fountain.com/changelog`,
`/releases`, `/product-updates`, and the subdomains `updates.`/`changelog.`/`feedback.`/`roadmap.
fountain.com` all 404/DNS-fail; `fountain.canny.io` resolves (200) but is an **unclaimed** Canny
subdomain ("There is no such company"), not a real board. So the changelog exists and is genuinely rich,
but it is a semi-orphaned surface an ordinary site visitor would not stumble onto.

## Cadence

- Archive depth: month-selector shows content back to **at least July 2022** (13+ months of pagination
  visible from the September-2025 view alone; the site states pages "1–9 … 16").
- Cadence: entries are bundled into **bi-weekly "release note" roundups** (e.g. "Fountain Product Release
  Notes (12/1/2025–12/19/2025)", "(2/21–3/5/2026)", "(11/17–11/28/2025)") each containing 3–10 individual
  line items, plus the roundup itself is also listed as a standalone entry. The page's own stated cadence:
  "approximately 4–6 updates monthly" across ATS, Sourcing, Compliance, and AI-agent categories.
- Individual-item categories tagged across the sampled months: `Hire`, `Source`, `Sourcing`, `Pool`,
  `Shift`, `Onboard`, `Referrals`, `Platform` (automations), `Hire Go`, `CRM`, `Candidate AI Agent`,
  `Sam`, `Talent Agents` — i.e. the changelog double as a de facto product-line map.

## Recent direction (Jun–Aug 2026 sample — where the churn is)

**Heaviest recent investment: AI agents.**
- **Cue** (workflow-automation agent) — "Scheduled Tasks in Cue" (Jul 23): automated recurring work on
  daily/weekly/monthly schedules; "Customer Configuration for Sam" (Jul 23): customizable AI instances
  pre-loaded with Fountain defaults; earlier (Jun 11) "Cue identifies at-risk openings with prioritized
  action plans."
- **Sam** (new — introduced Jun 25, 2026) — "a proactive satisfaction agent checking in at key moments
  (Day 1, Day 7, Day 30)" — a voice agent that "proactively checks in with workers, collecting structured
  feedback at employment journey milestones." This is a **retention/satisfaction** agent, distinct from
  Cue (workflow) and the docs-mentioned Anna (screening) / Emma (support).
- **Candidate AI Agent** — "Streamlined Knowledge Base Setup" (Jun 11, "coming soon"): direct editing
  with on-demand AI assistance for the agent's knowledge base.
- Status-page corroboration (independent source): a dedicated `AI Interviews` component was added to
  `status.fountain.com` on **2026-07-06** — same window, second data source, same direction.

**Second-heaviest: Source (sourcing/campaign management).**
- "Campaigns Page in Source" (Aug 6): new unified view for tracking campaign performance across openings.
- "Clearer Campaign Budget Reporting in Source" (Aug 6).
- "Talroo attribution" / "S2S Conversion Tracking for Talroo" (Jun 25): server-to-server conversion
  tracking ties Fountain hire events back to a named job-board partner (Talroo).
- "Contract Flow Support in Source" (coming soon, Jun 25): "direct access to 3,000+ job boards through
  contracted agreements."

**Steady baseline: ATS/Hire UX refinement + compliance.**
- Bulk-action and applicant-table UX iterated repeatedly across multiple release windows (Hire: "More
  control when selecting applicants in bulk," Dec 2025: "Collapsible Status Labels," "Pipeline View,"
  "Redesigned Applicant Profile"; Shift: "Bulk actions for faster schedule management," Mar 2026) —
  recurring iteration on the same surface across ≥3 separate windows is itself a signal of ongoing UX
  friction being worked down, not a one-off.
- Compliance/localization is a steady drumbeat, not a special initiative: "2026 State W-4 Form Updates"
  (Aug 6, via a named partner — WorkBright's I-9 Center), "Improve translation accuracy with custom
  terminology" (Mar 2026), "WhatsApp Translation" / "Job Directory Translation" (Sep 2025).

## Product-line map (as surfaced by changelog category tags)

| Product / surface | Evidence (changelog category tag) |
| --- | --- |
| **Hire** | ATS core — applicant profile, pipeline, job directory, bulk actions |
| **Source** | Sourcing / job-board campaigns, budget reporting, Talroo integration |
| **Pool** | CRM / talent pool, campaign editor, audience filtering |
| **Shift** | Scheduling — bulk shift actions, claim/rejection messaging |
| **Onboard** | referenced in category lists (Feb–Mar 2026 roundup) alongside Hire/Platform |
| **Referrals** | conditional referral incentive design |
| **Platform** (Automations) | workflow triggers off Opening/applicant-message events, Cue |
| **Hire Go / Assist** | interviewer-facing tool — "Shared Dashboard," "Unified login across Fountain" |
| **Cue** | AI workflow-automation / "run frontline hiring and staffing in real time" (launched as press release Apr 14/23, 2026) |
| **Sam** | AI voice retention/satisfaction agent (introduced Jun 25, 2026) |
| **Candidate AI Agent** | applicant-facing conversational agent w/ a configurable knowledge base |
| **FountainAI** | the umbrella AI branding (status-page component since 2023-04-04 — predates Cue/Sam by 3 years) |

## Strategic narrative (from `fountain.com/news` press releases, same window)

| Date | Release | Note |
| --- | --- | --- |
| 2026-04-14/23 | "Fountain Launches Cue, an **Autonomous AI System** to Run Frontline Hiring and Workforce Operations" (two variant headlines, same launch) | flagship AI launch |
| 2026-05-13 | "Fountain Named a **Niche Player** in the 2026 Gartner® Magic Quadrant™ for Talent Acquisition Suites" | Fountain's **first-ever** MQ inclusion; Niche Player is the lowest of Gartner's four MQ quadrants (below Leaders/Visionaries/Challengers). CEO Sean Behr quote frames the pitch as "not just managing pipelines... making sure roles are filled and teams are ready to work." Market segments named: logistics, retail, staffing, restaurants, healthcare, food & beverage. |
| 2026-07-01 | "The Service Companies Chooses Fountain For Hiring Across 35 States With 24/7 Screening" | named customer win, screening emphasis |
| 2026-07-15 | "Frontline Workers Don't Want AI Out of Hiring. They Want It Out in the Open." | first-party-commissioned survey (1,014 U.S. frontline workers, Jun 2026) responding to AI-hiring trust concerns — see raw/issue-themes.md |

## Blog (`fountain.com/blog`) — separate from the changelog

- Thought-leadership / SEO content mill: 16+ paginated pages, topics = recruiting best practices,
  workforce planning, "Narrow AI vs General AI vs Superintelligence," a "Fountain vs. SmartRecruiters"
  comparison page (named-competitor content), and a repost of the Gartner MQ press release.
  All sampled posts are attributed to a single byline ("Salim Jernite"); no visible publish dates on the
  listing page itself (dates only recovered via search-indexed URLs/press releases).
  No changelog/product-update category exists inside the blog — the blog and `new.fountain.com` are two
  fully separate first-party surfaces with no cross-linking found.
