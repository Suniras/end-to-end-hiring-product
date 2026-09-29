<!-- source: fountain.com homepage badge images + g2.com + softwaresuggest.com + rectec.io + Gartner MQ press
     coverage · captured_at: 2026-08-09 · method: crawl-clip -->

# Fountain — Third-party recognition badges, traced to source

`fountain.com` homepage cites three badge images (found via raw-HTML grep for badge alt-text/filenames):
`G2 High Performer Fall 2023`, `Rectec Certified Partner`, `Software Suggest High Performer`. All three
image assets are dated `wp-content/uploads/2023/...` — traced each to its actual current source page.

| Badge as displayed on fountain.com | What it actually is (traced) | Currency / evidentiary weight |
| --- | --- | --- |
| **"G2 High Performer Fall 2023"** | Real G2 product page exists: `g2.com/products/fountain/reviews` — **4.3/5 stars, 126 reviews** (current, per WebSearch-derived summary; G2 itself blocked direct WebFetch with a 403). G2 badges are recalculated quarterly. | The homepage image is pinned to **Fall 2023** — stale by ~2.5 years as of this run (Aug 2026) even though the underlying G2 profile is live and presumably has had 8+ newer quarterly badge cycles since. Fountain has not refreshed the badge asset. |
| **"Rectec Certified Partner"** | `rectec.io` is a **UK-based ATS/CRM vendor-comparison and directory service** ("Rectec Compare"), not an independent review-aggregation site like G2/Capterra. Its "Certified Partner Programme" is a vendor-onboarding/validation process — Rectec conducts a product demo and validates vendor-supplied information, and offers **fee-free listing** to vendors seeking brand awareness. | This is a **directory-listing certification**, not a competitive user-review ranking. Displaying it alongside a G2 badge on the homepage implies parity of rigor with G2's 126-review-based score; the actual evidentiary basis is materially different (a vendor-onboarding checklist vs. aggregated customer reviews). |
| **"Software Suggest High Performer"** (badge reads "Winter 2025" on the SoftwareSuggest page itself) | `softwaresuggest.com/fountain` — shows **5/5 stars, based on exactly 1 verified review** (dated November 2023). | The badge is built on a **single review**, three years old at time of capture, yet is displayed on Fountain's own homepage with the same visual weight as the 126-review G2 badge. This is the most over-stated of the three claims. |

## Gartner Magic Quadrant (not a homepage badge, but a heavily-promoted 2026 claim)

- "Niche Player" in the **2026 Gartner® Magic Quadrant™ for Talent Acquisition Suites** — announced via
  press release 2026-05-13, Fountain's **first-ever** inclusion in this report (confirmed via WebSearch
  summary of the businesswire/finance.yahoo/natlawreview syndication of the release).
  "Niche Player" is the **lowest** of Gartner MQ's four quadrants (below Leaders, Visionaries, and
  Challengers) — evaluated on Ability to Execute and Completeness of Vision.
  Fountain promotes this heavily (a dedicated ebook download page at `ebook.fountain.com/...`, a blog
  repost, a press release, and syndicated pickup) — the promotion volume is disproportionate to the
  quadrant placement's actual competitive standing, though "first-time MQ inclusion at all" is a genuine,
  fair milestone to publicize for a company of this size.

## Method note

G2 and SoftwareSuggest were read via `WebFetch`/`WebSearch` (G2 itself returned 403 to direct WebFetch —
summary is search-engine-derived, not a primary-source page read, and is flagged accordingly wherever
cited). Rectec was read directly. No login or scraping-at-scale was used; each was a single targeted page
fetch consistent with ingestion §7 rule 8 (respect TOS).
