---
dimension: packages
target: paradox
status: complete
access_grade_used: "source:partial"
method: registry-metadata
completeness_pct: 100
confidence: high
captured_at: 2026-08-09
sources:
  - https://pypi.org/pypi/scim2-models/json
  - https://registry.npmjs.org/pdf-lib
  - https://registry.npmjs.org/@prd-huy-ta%2Fpdf-lib
  - https://registry.npmjs.org/celery.node
  - https://registry.npmjs.org/@prd-thanhnguyenhoang%2Fcelery.node
  - https://registry.npmjs.org/-/v1/search?text=celery.node
  - https://pypi.org/pypi/pdfgen-python/json
  - https://pypi.org/pypi/pdfgen/json
  - https://api.github.com/repos/ParadoxAi/{pdfgen-python,pdf-lib,packer-plugin-salt,celery.node,scim2-models}
  - https://api.github.com/repos/.../compare/... (fork-vs-upstream diffs, all 5 repos)
  - https://pkg.go.dev/github.com/ParadoxAi/packer-plugin-salt
gaps:
  - "No official '@paradoxai'/'paradox' branded npm org or PyPI org exists — could not enumerate a canonical package list from a registry namespace; had to reverse-engineer ownership repo-by-repo via GitHub fork/compare + npm maintainer-email checks."
  - "packer-plugin-salt is a Go module; Go has no central package registry to query for download/health stats the way npm/PyPI do — pkg.go.dev indexing (404) is the closest proxy and shows zero public `go get` traffic ever recorded."
  - "Could not determine why the ParadoxAi/pdf-lib and celery.node forks are published under PERSONAL engineer npm scopes (@prd-huy-ta, @prd-thanhnguyenhoang) rather than a corporate scope — likely just organizational convenience/habit, but unconfirmed from outside."
---

# Paradox — Packages capture

## Method

Discovery pre-flagged 5 `ParadoxAi` GitHub repos and one confirmed PyPI hit (`scim2-models`, 200) plus
one confirmed miss (`pdfgen-python`, 404). Ingestion re-verified **every** repo against the registry it
would plausibly publish to, rather than trusting the name match:

1. **npm exact-name lookups** for `pdf-lib` and `celery.node` (the two npm-shaped repo names), checking
   each returned package's `repository`/`author`/`homepage` field against `github.com/ParadoxAi/*` before
   crediting it.
2. **npm full-text search** (`registry.npmjs.org/-/v1/search?text=<name>`) to find any *scoped* variant
   whose `repository` field points at the ParadoxAi org — the correct way to find an internal fork
   published under a personal npm scope, since it won't appear at the unscoped name.
3. **GitHub repo + compare API** on all 5 `ParadoxAi/*` repos: fork status, parent repo, and an explicit
   `ahead_by`/`behind_by`/commit-list diff against the parent's default branch — this is what separates
   "an idle mirror" from "an actively customized internal dependency."
4. **PyPI exact-name + registry metadata pull** for `scim2-models` (the confirmed hit) and `pdfgen`/
   `pdfgen-python` (checking the exact PyPI name a naive publish of the fork *would* use), reading
   `author`/`author_email`/`project_urls.repository` to determine true ownership — the same discipline
   applied to npm.
5. **GitHub Releases + pkg.go.dev** for `packer-plugin-salt`, since Packer/Go plugins distribute via
   VCS releases and the Go module proxy, not npm/PyPI.

## Findings

| Repo | Registry checked | Published? | Owner | Version / activity | Notes |
| --- | --- | --- | --- | --- | --- |
| **scim2-models** | PyPI `scim2-models` | ✅ live, 56 releases, latest `0.6.12` | ❌ **NOT Paradox** — author "Yaal Coop" (`contact@yaal.coop`), repo `python-scim/scim2-models` | active (Apache-2.0, MIT-style dev community) | **Correction to the recon-plan hypothesis**: this is a name-collision-by-origin, not a Paradox publish. `ParadoxAi/scim2-models` on GitHub is a private **fork** of this exact upstream repo (2 commits ahead / 192 behind, single 4.5-hr session on 2025-06-03) — real evidence Paradox *uses* this SCIM library internally, never evidence they *publish* it. |
| **pdf-lib** (unscoped npm name) | npm `pdf-lib` | ✅ live, latest `1.17.1` | ❌ **NOT Paradox** — author Andrew Dillon, repo `Hopding/pdf-lib` | the famous independent PDF library | Exactly the name-collision the dispatch flagged. Confirmed via `repository` field. |
| **`ParadoxAi/pdf-lib`** (actual Paradox fork) | npm `@prd-huy-ta/pdf-lib` (found via full-text search, not exact-name) | ✅ **Paradox's own**, 32 versions, latest `3.2.3` | ✅ maintainers `huy.ta@paradox.ai`, `nguyen.nguyentruong@paradox.ai` | actively maintained, last modified 2025-07-11 | 21 commits ahead of upstream, adding a **`PDFSignature`** form-field feature (commits tagged `OL-99979`) — a genuine, shipped, in-house PDF e-signature capability. Published under a *personal* npm scope, not an org scope. |
| **celery.node** (unscoped npm name) | npm `celery.node` | ❌ 404 | n/a | n/a | The unscoped name isn't even registered; the real independent project publishes as `celery-node` (`actumn/celery.node`). |
| **`ParadoxAi/celery.node`** (actual Paradox fork) | npm `@prd-thanhnguyenhoang/celery.node` (found via full-text search) | ✅ **Paradox's own**, 42 versions, latest `1.0.57` | ✅ maintainer `thanh.nguyenhoang@paradox.ai` | actively maintained, last modified 2025-07-14 | 33 commits ahead of upstream `actumn/celery.node`. Confirms a Node.js service in Paradox's stack that speaks the Celery protocol — i.e., a polyglot backend where Node code enqueues/consumes tasks from a Python/Celery task queue. |
| **pdfgen-python** | PyPI `pdfgen-python` (404) and `pdfgen` (200) | ❌ Not published by Paradox under either name | `pdfgen` on PyPI belongs to original author Shivansh Saini (unrelated) | fork exists, has a dependabot branch, never renamed/republished | Repo is forked and apparently used internally (dependabot activity through 2026-04) but has zero public registry footprint of its own. |
| **packer-plugin-salt** | GitHub Releases (correct channel) + pkg.go.dev | ⚠️ One release tag (`1.0.0`), **zero binary assets attached**; never indexed on pkg.go.dev (no public `go get` ever recorded) | fork of `hashicorp/packer-plugin-salt` (itself archived/deprecated upstream) | only 4 commits ahead, **all** are automated Dependabot dependency bumps — no Paradox-authored functional commits | Best read as a dormant/legacy artifact, closer to abandoned than actively used. |

**Downloads / health:** not meaningfully attempted for the two personal-scope npm packages (Paradox's own
`@prd-huy-ta/pdf-lib`, `@prd-thanhnguyenhoang/celery.node`) — npm download-count APIs report near-zero/low
counts for scoped internal-use packages by design (they're consumed via private CI/lockfiles pointing at
the exact version, not organic public installs), so a download-count pull would be noise, not signal;
maintenance cadence (version count + last-modified date) is the more honest health signal here and is
already captured above.

## Inferences

1. **Paradox has no branded public package-registry presence** — no `@paradoxai` npm org, no `paradox-*`
   PyPI namespace. Every internal fork that reaches a public registry does so under an individual
   engineer's personal scoped npm username, informally prefixed `prd-` (a personal, not
   organizational, publishing convention — `prd` almost certainly abbreviates "Paradox").
2. **The two genuinely-Paradox-owned published packages (`@prd-huy-ta/pdf-lib`, `@prd-thanhnguyenhoang/celery.node`) are real, live, actively maintained internal dependencies** (32 and 42 releases respectively, both modified within the last ~13 months of capture), not abandoned side projects — this corrects the recon-plan's open hypothesis #3 (staleness) for these two specifically.
3. **The PDF e-signature feature (`PDFSignature`, `@prd-huy-ta/pdf-lib`) is the single most product-relevant finding in this dimension** — an in-house-built capability to programmatically generate and place signature fields into PDF forms, strongly consistent with an offer-letter / onboarding-document e-signing flow inside Paradox's hiring product. This is a concrete, citable engineering-capability signal that the marketing/docs surfaces alone would not reveal.
4. **The Celery-interop fork corroborates a polyglot backend**: a Python service (or services) run Celery as the task queue, and a Node.js service needs to talk to it directly (rather than through a REST/queue abstraction) — otherwise there would be no reason to fork and actively maintain a Node Celery client for 16+ months. This is a genuine architecture signal.
5. **`scim2-models` reclassification matters for the identity-provisioning finding, not for dismissing it**: Paradox's private fork (2 commits, both touching `PatchOp` / User-`manager` mutability) still confirms real SCIM-provisioning engineering work (consistent with Workday/SAP SuccessFactors integrations named on the website), but the *artifact* citable as evidence is the GitHub fork + its 2-commit diff, not a PyPI publish. The recon-plan's framing of this as "Paradox's confirmed-real published package" should be corrected to "Paradox's confirmed-real *use of* an upstream published package, patched privately, never republished."
6. **`packer-plugin-salt` reads as legacy-and-abandoned, not legacy-and-load-bearing.** The upstream plugin it forks is itself archived by HashiCorp; Paradox's fork has accumulated only automated dependency bumps in ~1.5 years, no feature work, and no evidence of any actual `go get`/consumption (0 Go-proxy hits). This weakens (does not fully refute) the recon-plan's "legacy on-prem/VM lineage" hypothesis — it's consistent with a *retired* provisioning path rather than one still driving current infrastructure.
7. **Net picture for this dimension:** of 5 `ParadoxAi` GitHub repos, exactly **2 have a genuine, Paradox-owned, currently-maintained public registry footprint** (`@prd-huy-ta/pdf-lib`, `@prd-thanhnguyenhoang/celery.node`); the other 3 have GitHub presence only, no registry publish under Paradox's control (`pdfgen-python`, `packer-plugin-salt`, and `scim2-models` in the sense that the *PyPI listing itself* isn't Paradox's). Paradox is not, and does not attempt to be, an open-source-first or SDK-publishing company — every public artifact here is an internal-tooling byproduct, not a deliberate developer-facing release.

## Open questions

- Why publish `@prd-huy-ta/pdf-lib` and `@prd-thanhnguyenhoang/celery.node` to the **public** npm registry
  at all (rather than a private registry/GitHub Packages) if they're purely internal dependencies? Possibly
  a cost/simplicity default (public npm is free; private registries/GH Packages auth add CI friction) —
  unverified.
  - **verify:may-be-stale** — this is a plausible-but-unconfirmed inference from Discovery/Ingestion reasoning about a common industry pattern, not an observed fact from Paradox itself.
- Whether the SCIM fork (`ParadoxAi/scim2-models`) is currently used in production or was a one-off
  exploration — the single 4.5-hour commit burst on 2025-06-03 with no subsequent activity is ambiguous
  between "shipped and stable, no further changes needed" and "abandoned experiment."
- Whether there are additional Paradox-owned packages published under *other* personal npm scopes /
  PyPI usernames not tied to one of the 5 known `ParadoxAi` GitHub repo names — the full-text-search method
  used here (`text=<repo-name>`) only surfaces scoped forks of an *already-known* repo name; a
  Paradox-authored package with no public GitHub mirror at all would be invisible to this method.

## Artifacts

- `raw/scim2-models.json` — full PyPI registry metadata for the upstream (non-Paradox) package.
- `raw/scim2-models-exports.md` — the public Python API surface of `scim2-models` (symbol catalog).
- `raw/paradoxai-scim2-models-fork.json` — GitHub fork metadata + the 2-commit diff vs upstream.
- `raw/pdf-lib-npm-namecollision.json` — the generic npm `pdf-lib`, confirmed unrelated (Hopding).
- `raw/prd-huy-ta-pdf-lib.json` — full npm registry metadata for Paradox's actual pdf-lib fork publish.
- `raw/prd-huy-ta-pdf-lib-exports.md` — the Paradox-added delta (PDFSignature) over upstream pdf-lib.
- `raw/prd-thanhnguyenhoang-celery-node.json` — full npm registry metadata for Paradox's celery.node fork publish.
- `raw/pdfgen-python.json` — GitHub fork metadata + negative PyPI checks (`pdfgen-python` 404, `pdfgen` 200-but-unrelated-author).
- `raw/packer-plugin-salt.json` — GitHub repo/releases metadata + dependency-bump-only diff + pkg.go.dev negative check.
