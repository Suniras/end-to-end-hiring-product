---
dimension: codebase
target: fountain
status: absent
access_grade_used: "source:none"
method: inferred
completeness_pct: 100
confidence: high
captured_at: 2026-08-09
sources:
  - "https://api.github.com/orgs/Fountain (full JSON)"
  - "https://api.github.com/orgs/Fountain/repos"
  - "https://api.github.com/orgs/fountain-io (404)"
  - "https://api.github.com/orgs/fountainhire (404)"
  - "https://api.github.com/orgs/GoFountain (404)"
  - "https://fountain.engineering (200, unrelated content, Cloudflare-hosted)"
  - "https://registry.npmjs.org/-/v1/search?text=fountain%20hiring (no fountain.com-affiliated hit)"
gaps:
  - "No exhaustive slug-variant sweep beyond the four tried (Fountain, fountain-io, fountainhire, GoFountain) — a fifth guess could theoretically exist, but the marketing site links no GitHub anywhere (footer/Company/Resources all checked), which is itself corroborating evidence of genuine absence, not just an unlucky guess."
---

# Fountain — codebase capture

## Method

Direct GitHub API probes (`api.github.com/orgs/<slug>`) against four plausible org-slug guesses, following
the full-JSON-verification discipline established after the Onebeat/Brandlight/Profound namesake incidents
(never trust a bare 200/404 — read `blog`, `email`, `created_at`, `public_repos` before concluding).

## Findings

1. **`github.com/Fountain` (id 64402) is a verified namesake, not the hiring company's org.** Its `blog`
   field is `https://fountain.engineering` — NOT `fountain.com` or any hiring-platform domain. Its
   `created_at` is **2009-03-17**, five years before Fountain the hiring company was founded (2014) — an
   organization cannot predate the company it would represent. It holds exactly **one** public repo
   (`.github`, a bootstrap health-file repo), `followers: 4`. `twitter_username: fountain_inc` is the one
   piece of surface-level plausibility, but it does not overcome the pre-founding creation date and the
   mismatched blog domain.
2. **Three alternate slug guesses (`fountain-io`, `fountainhire`, `GoFountain`) all 404** — no org exists
   under any of them.
3. **`fountain.engineering` is a live, unrelated site** (Cloudflare-hosted, `last-modified: 2023-05-10`,
   `access-control-allow-origin: *`) — not fetched further since it is out of scope once disambiguated as
   unrelated to the target; recorded here only to close the namesake trail.
4. **No `fountain-hire`/`@fountain`-scoped package on npm** — the only close-name hit is `fountain-js`, an
   unrelated screenplay-markup-language parser (maintained by `jonnygreenwald`/`nathanhoad`, nothing to do
   with hiring software).
5. **The marketing site links no GitHub anywhere** (checked Company, Resources, and footer sections) —
   consistent with a closed-source SaaS with no open-source presence, not an oversight in the search.

## Inferences

Fountain the hiring company has **no discoverable public source presence of any kind** — no org, no SDK
repo, no client library. This is a clean, corroborated absence (marketing-site silence + 4-slug-guess
404/namesake-mismatch), not a single-probe negative.

## Open questions

None outstanding — this dimension is closed with high confidence.

## Artifacts

None — `status: absent`. Recorded as a finding per ingestion §1.
