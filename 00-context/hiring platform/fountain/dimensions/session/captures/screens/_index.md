<!-- Cartography (Mode 4) screenshot index · captured_at: 2026-08-09 · method: NONE — zero screenshots exist -->

# Fountain — Screenshot index

## Zero screenshots exist for this run. This file records why, and what would change it.

**`screenshot_coverage: 0`** in `evaluation/feature-coverage.md`. This directory is intentionally empty
of images. Per `cartography-coverage.md` ("capture them live here; fall back to the textual map **and
record the `screenshot_coverage` gap** only when the runtime genuinely cannot screenshot") and
`ingestion.md` §9.5, an unrecorded visual gap is a defect and a recorded one is not — this file is the
record.

## Why — two independent blockers

| # | Blocker | Kind | Blocks |
| --- | --- | --- | --- |
| 1 | **No browser-driving tool exists in this session at all.** The Chrome MCP surface (`tabs_context_mcp`, `navigate`, `screenshot`, `javascript_tool`, …) is **absent**, confirmed by tool search. | **Capability gap** — discovered at Mode 4, not planned for | *Everything.* No page of any kind could be rendered, authenticated **or public**. |
| 2 | **`auth:none`** — no authenticated session was established all run. `session` is `status: absent` (`write_side_observed: false`, `pass2: not-applicable`); the user was unreachable to authorize a login, and the harness never signs in on its own (ingestion §7 rule 1). | Standing run constraint, known from Mode 1 | The authenticated recruiter console at `app.fountain.com`. |

**Blocker 1 is strictly worse than blocker 2**, and the distinction matters for Mode 5: with a browser
but no login, this run could still have screenshotted the **public** surfaces — the marketing site, the
tenant career site, `cue.fountain.com`, the developer portal, the Intercom help center, and the
unauthenticated `app.fountain.com` login shell. With no browser at all, **none** of those was reachable
either. Every image in this directory would have required tool 1.

## No surrogate exists for Fountain

On some targets a screenshot gap can be partly filled from a public visual surrogate (App Store / Play
Store listing images, a Chrome Web Store listing, a product-tour video still). **Fountain has none.**
`distribution-artifacts` verified the absence directly and independently:

- **iOS App Store** — 3 queries, no listing.
- **Google Play** — 3 queries, no listing.
- **Chrome Web Store** — 2 queries, no extension.
- **Firefox AMO** — 1 query, no add-on.
- **Installable PWA** — `/manifest.json` and `/sw.js` both **200 but disproved by content-type** (SPA
  catch-all false positives).

(`distribution-artifacts: raw/store-and-pwa-sweep.md · binary-extract · **high**` — a verified absence,
not a failed search.) So there is no screenshot surrogate to substitute, and **none was fabricated**.

## What stands in for the visual map

The textual substitute permitted by `ingestion.md` §9.5 — but sourced far more strongly than usual:

| Substitute | Where | Strength |
| --- | --- | --- |
| **Full nav tree + 31 surface cards**, each with route, depth, capability, entities, endpoints and its exact feature-flag / RBAC gate | [`evaluation/information-architecture.md`](../../../../evaluation/information-architecture.md) | Recovered by **`source-map-reassembly`** of `app.fountain.com` (1,962 files, 1,757 first-party) — a verbatim machine artifact, **high** confidence that each surface *exists*; **zero** evidence of how any of it *looks* |
| 8 inferred journey diagrams | [`evaluation/ux-flows.md`](../../../../evaluation/ux-flows.md) | Call sites + documented contracts; nothing observed |
| Claimed-vs-located-vs-walked matrix (65 rows) | [`evaluation/feature-coverage.md`](../../../../evaluation/feature-coverage.md) | `features_walked: 0` |

**What the textual map cannot substitute for, and Mode 5 should not pretend otherwise:** visual
hierarchy and information density, what the nav chrome actually promotes, empty/loading/error states,
what a gated surface shows when its flag is off, and any judgement about usability. A route table proves
a screen exists; it says nothing about what an operator sees.

## What would close this gap

| Prereq | Unlocks | Cost |
| --- | --- | --- |
| **A browser tool in the session** (no login needed) | Public surfaces: marketing site, `cue.fountain.com`, tenant career site, developer portal, help center, the `app.fountain.com` login shell | low — read-only nav, no cost, no state change |
| **A browser tool + a user-authorized read-only session** | The full 16 primary surfaces of the recruiter console, redacted per §7 → `screenshot_coverage` toward 100, plus `features_walked` toward 31 | one user action; still read-only / no-cost (Pass 1) |

Until then this directory stays empty **by record, not by omission**.

## Index

*(none — no files)*

| File | Surface | Route | Depth |
| --- | --- | --- | --- |
| — | — | — | — |
