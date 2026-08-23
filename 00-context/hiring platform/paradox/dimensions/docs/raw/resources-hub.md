<!-- source: www.paradox.ai/the-conversation · www.paradox.ai/resources-type/reports · captured_at: 2026-08-09 · method: crawl-clip -->

# Paradox — "The Conversation" + "Reports" (Resources nav) — verified content types

Both named in the marketing-site "Resources" nav per the recon plan's open item; both are confirmed
NOT technical/integration documentation. Recorded here (docs dimension) rather than under `website`
since they were flagged as a docs-adjacent open question in `00-recon-plan.md`; `website` dimension
should treat these as marketing-content-hub findings for its own crawl, not duplicate the mine.

## "The Conversation" (`/the-conversation`)

A filterable content hub (filters: Topic [Future of Work / Conversational AI / Candidate Experience /
High Volume Hiring / Talent Acquisition], Industry, Content-type, Integration [Oracle/Workday/SAP],
Paradox Product) surfacing:
- Customer-interview webinars, e.g. "The Conversation with Compass Group and John Vlastelica" (23 min),
  "The Conversation with Touchmark's Director of Talent Density on implementing Paradox…twice" (webinar),
  "The Conversation with Hamra Enterprises and Compass Group" (blog), "The Conversation with TruGreen's
  Senior Director of TA."
- These are branded thought-leadership interviews with named enterprise customers — a content-marketing
  franchise using the "conversational" wordplay on the product's own positioning, not a docs/help
  section despite living in the same top-level nav group as the Helpjuice KB link.

## "Reports" (`/resources-type/reports`)

Third-party analyst research Paradox has co-branded or commissioned, plus Bersin-branded customer case
studies. Named reports observed:
- "National Restaurant Association: 2026 Workforce Technology Report" (High Volume Hiring)
- "Bersin Report: Great Wolf Lodge Scales Hiring with an AI" (Candidate Experience)
- "Bersin Report: Johnson Controls Accelerates Global Hiring with AI" (High Volume Hiring)
- "Bersin Report: Coca-Cola Consolidated Uncaps Frontline Potential through Its Employee Value Promise"
- "Harvard Business Review: How TA is Transforming with AI and Automation" (co-branded content, not a
  genuine HBR editorial placement — standard sponsored-content pattern)
- "Aptitude Research: The Impact of AI on the Candidate Experience" — verified directly downloadable,
  no lead-gen gate: `https://info.paradox.ai/hubfs/Content%20Marketing%20Assets/Apt_Paradox_AI_Report-0324_Rev5%20(1).pdf`
  (HTTP 200, `application/pdf`, 14.6 MB, hosted on Paradox's HubSpot CMS instance `info.paradox.ai`
  behind CloudFront — confirms Paradox runs HubSpot for marketing/content-ops, a minor infra-fingerprint
  corroboration point for that dimension).

None of the observed reports are technical (no API specs, no architecture whitepapers, no security/SOC2
detail docs) — all are industry-research / ROI / case-study content aimed at buyer-side HR/TA leaders,
consistent with Paradox's enterprise-sales positioning.
