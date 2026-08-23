<!-- source: https://github.com/ParadoxAi (org) + 5 repo clones · captured_at: 2026-08-09 · method: clone-and-map -->

# Paradox — GitHub org structure map

## Org identity (confirmed genuine)

```
login: ParadoxAi
name: Paradox
blog: https://paradox.ai
email: info@paradox.ai
location: United States of America
created_at: 2017-01-03
public_repos: 5
followers: 46
description: "Scientific/Engineering :: Artificial Intelligence"
public_members: [] (none disclosed)
```

## THE HEADLINE FINDING: all 5 public repos are forks — zero original Paradox code is public

Every single one of the 5 public repos under `ParadoxAi` is a **GitHub fork of a pre-existing,
independently-authored open-source project** — none is an original Paradox-authored library, and none
is the core product. This is stronger than the recon-plan's framing ("5 utility repos, none of which are
the core product") — it means Paradox has **published zero original source code** publicly; the org's
public footprint is entirely (a) a compliance/dependency-mirroring practice, or (b) individual engineers'
personal patched forks published under their own npm/GitHub identity for internal consumption.

| # | Repo | Upstream (fork parent) | Language | Paradox commits? | Last push | Staleness |
|---|------|------------------------|----------|-------------------|-----------|-----------|
| 1 | `pdfgen-python` | `shivanshs9/pdfgen-python` | Python | Yes — 3 commits, 1 day (2022-08-26), 1 author (`dong@paradox.ai`) | 2022-08-26 (repo-level GH `pushed_at` shows 2026-04-13, likely a dependabot/mirror sync, not new engineering) | **Abandoned** — patch-and-forget, ~3 years stale on actual engineering |
| 2 | `pdf-lib` | `Hopding/pdf-lib` (the well-known JS/TS PDF library, name-collision confirmed real) | TypeScript | **Yes — actively maintained**, 3 named paradox.ai engineers, spanning 2023-03 to 2025-08 | 2025-08-04 | **Active** |
| 3 | `packer-plugin-salt` | `hashicorp/packer-plugin-salt` (HashiCorp's own repo — itself archived/unmaintained upstream) | Go | **No Paradox-authored commits at all** — 100% Hashicorp-authored history + `dependabot[bot]` version bumps | 2025-08-28 (bump-only) | **Passive mirror**, not engineered by Paradox |
| 4 | `celery.node` | `actumn/celery.node` (Node.js port of Python Celery) | TypeScript | **Yes — actively maintained**, 1 primary paradox.ai engineer + 2 others, real feature commits (RabbitMQ worker testing, retry logic, task-on-fail events) | 2025-08-04 | **Active** (though the ParadoxAi fork itself is marked `archived: true` on GitHub as of capture) |
| 5 | `scim2-models` | `python-scim/scim2-models` (Pydantic SCIM v2 resource models, maintained by Yaal Coop) | Python | Yes — 2 small bugfix commits, 1 author (`huy.le@paradox.ai`), 1 day (2025-06-03) | 2025-06-03 | **Point-patch**, minimal but real and recent |

## Per-repo detail

### 1. `pdfgen-python`
- Fork of `shivanshs9/pdfgen-python` — "Python 3.6.1+ async wrapper for Pyppeteer to convert HTML to PDF."
- Paradox engineer `dong@paradox.ai` made exactly 3 commits, all on 2022-08-26: bumped the `pyppeteer`
  dependency, bumped the lib version, fixed a Python 3.10 `collections.abc.Iterable` deprecation. This
  reads as a one-time "grab it, patch the one breaking bug, ship it" event — no further engineering since.
- Not published to PyPI under any Paradox-controlled name (checked; PyPI has no `pdfgen-python` package
  matching this fork — the upstream project itself was never published either).
- **Inference:** Paradox has (or had, as of ~2022) an HTML→PDF rendering pipeline via headless
  Chrome/Pyppeteer — plausible for generating formatted documents (offer letters, applications) from
  HTML templates. Given 3+ years of silence, likely superseded or now a minor/legacy code path.

### 2. `pdf-lib` — the most revealing repo in the org
- Fork of `Hopding/pdf-lib`, the very popular (8k+★ upstream) TypeScript library for creating/modifying
  PDFs in any JS runtime. **Confirmed NOT an accidental/passive fork** — Paradox has 3 named engineers
  with `@paradox.ai` emails or `prd-*` GitHub handles committing real feature work from 2023-03 through
  2025-08.
- Published to npm under an individual engineer's personal scope: **`@prd-huy-ta/pdf-lib`** (not an
  official `@paradox` org scope) — version 3.1.5 in the cloned depth, npm registry shows latest 3.2.3.
  This is an internal-use publish, not a Paradox-branded SDK.
- **The load-bearing change:** Paradox engineers added a custom **PDF form-field digital-signature
  feature** — new files `src/api/form/PDFSignature.ts` and `src/core/acroform/PDFAcroSignature.ts`, with
  commit messages `"add signature feature"`, `"bug(OL-99979): create signature in form"`,
  `"fix(OL-99979): update appearance related functions for PDFSignature"`,
  `"fix(MS-273): fix signature being removed after fill"`. This is a from-scratch AcroForm signature
  capability the upstream `pdf-lib` library does not have.
- Internal ticket prefixes observed: **`OL-`** (recurring across pdf-lib AND celery.node — almost
  certainly the Jira project key for the "Olivia" product/engineering team) and **`MS-`** (a second,
  distinct internal project key, seen once).
- **Inference (high confidence, direct-observation):** Paradox built its own e-signature / form-fill
  capability on top of a patched `pdf-lib`, rather than relying entirely on a third-party e-sign vendor —
  directly relevant to a hiring/onboarding product that needs applicants/hires to fill and sign PDF forms
  (offer letters, W-4/I-9-style tax and eligibility forms, policy acknowledgments).

### 3. `packer-plugin-salt`
- Fork of HashiCorp's own `hashicorp/packer-plugin-salt` — and notably, the upstream repo's own
  description says it **"has been archived due to it no longer being maintained"** by HashiCorp itself.
- **Zero Paradox-authored commits** in the entire fetched history (100 commits checked) — every commit is
  from HashiCorp employees/community contributors or `dependabot[bot]`. The fork exists purely to receive
  automated dependency-bump PRs (visible dependabot Go-module bump merges as the two most recent commits).
- **Revised inference (supersedes the recon-plan hypothesis):** this does NOT read as live evidence of an
  active Salt/VM-based infra lineage — it reads as a **passive compliance/dependency-mirror fork**
  (consistent with an org-wide practice of forking any third-party tool into the private GitHub org for
  vulnerability-scanning/SBOM purposes) of an already-dead upstream tool. Whether Paradox *actually still
  runs* Packer+Salt provisioning internally is **not corroborated** by this repo's commit content — the
  repo shows custodial dependency hygiene, not active engineering. Flagged as an open question rather than
  a "legacy infra" fact.

### 4. `celery.node`
- Fork of `actumn/celery.node`, a Node.js client/worker implementing the Celery wire protocol
  (Python's Celery task-queue system) — supports both Redis and AMQP (RabbitMQ) brokers/backends
  (`src/kombu/brokers/{redis,amqp}.ts`, `src/backends/{redis,amqp}.ts`).
- **Actively engineered by Paradox**: primary author `Thanh Nguyen Hoang <thanh.nguyenhoang@paradox.ai>`
  (30 commits) plus `prd-huy-ta`/`prd-hoa-le` (shared with the pdf-lib team). Commits span 2024-03 through
  2025-08 with real feature work, not just version bumps:
  - `"add testing worker rabbitmq"` (ticket `OIS-4750`) — confirms **RabbitMQ** as the broker in use.
  - `"add retry"`, `"add error when done retry"` — worker reliability hardening.
  - `"feat(OL-206514): remove backend and add event task on fail for worker"` — production task-failure
    event handling.
  - `"init public package"` — deliberately published, not accidental.
- Published to npm as **`@prd-thanhnguyenhoang/celery.node`**, latest 1.0.57 — again an individual
  engineer's personal npm scope, not an official Paradox package.
- Internal ticket prefixes: `OL-` (same as pdf-lib) and `OIS-` (a second, distinct Jira project key —
  plausibly "Olivia Infra/Integration Services" or similar).
- Interestingly, the **`ParadoxAi/celery.node` fork itself is marked `archived: true`** on GitHub as of
  capture, despite its most recent commit being 2025-08-04 — i.e., Paradox archived (made read-only) this
  repo shortly after its last active commit, suggesting either a migration off Node-Celery-interop or a
  routine internal-tooling cleanup, not necessarily that the underlying capability was retired.
- **Inference (high confidence, direct observation):** Paradox runs a **polyglot backend** — a
  Python/Celery task-queue core (workers presumably in Python) with at least one **Node.js service that
  produces and/or consumes Celery-protocol tasks over RabbitMQ**, i.e., Node and Python services
  interoperate through a shared Celery/RabbitMQ task bus rather than all async work living in one language.

### 5. `scim2-models`
- Fork of `python-scim/scim2-models` (maintained by Yaal Coop, a French open-source SCIM
  implementation), a Pydantic-based SCIM v2 (RFC 7643/7644) resource-model library.
- **Correction to the recon-plan's framing:** the PyPI package `scim2-models` that resolves live (200,
  latest 0.6.12) is the **upstream** `python-scim` project's own publish (`author: Yaal Coop`) — NOT a
  Paradox-specific PyPI publish. Paradox's fork itself does not appear to be independently published to
  PyPI under a Paradox-controlled name (no divergent version tag beyond the 2 patch commits).
- Paradox engineer `huy.le@paradox.ai` made exactly 2 commits, both 2025-06-03 (same day):
  - `"feat: Adjust the PatchOp model"` — modifies `scim2_models/base.py` and
    `scim2_models/rfc7644/patch_op.py` (the SCIM `PATCH` operation model, RFC 7644 §3.5.2).
  - `"fix: CoreUser has no attribute 'manager' when validating mutability"` — fixes a validation bug
    specifically on the SCIM **User `manager` attribute** (`scim2_models/base.py`).
- **Inference (high confidence, direct observation):** the `manager` attribute fix is a strong, concrete
  signal that Paradox's SCIM implementation ingests **organizational hierarchy / manager-reference data**
  via SCIM — exactly the shape of data an HRIS like Workday or SAP SuccessFactors pushes during
  employee/candidate provisioning sync. This corroborates (does not merely repeat) the marketing site's
  claimed Workday/SAP SuccessFactors partner-integration pages: a real engineer hit and fixed a real bug
  in the manager-hierarchy field of the SCIM User model, which only matters if SCIM-based org-hierarchy
  sync is a live, exercised code path.

## What is genuinely absent

No repo here is: the core conversational-AI engine ("Olivia"), any of the seven "Conversational X"
product surfaces (ATS/CRM/Scheduling/Events/Career Sites/Apply), any infra-as-code for the live backend,
any mobile app source, or any client-side web app source. The `deployed-client-bundle` and
`distribution-artifacts` dimensions are the only ones that can observe the actual product; this dimension
observes only Paradox's peripheral internal tooling.
