---
dimension: codebase
target: paradox
status: complete
access_grade_used: source:partial
method: clone-and-map
completeness_pct: 100
confidence: medium
captured_at: 2026-08-09
sources:
  - "https://github.com/ParadoxAi (org API)"
  - "https://github.com/ParadoxAi/pdfgen-python"
  - "https://github.com/ParadoxAi/pdf-lib"
  - "https://github.com/ParadoxAi/packer-plugin-salt"
  - "https://github.com/ParadoxAi/celery.node"
  - "https://github.com/ParadoxAi/scim2-models"
  - "https://registry.npmjs.org (2 package lookups)"
  - "https://pypi.org (1 package lookup)"
gaps:
  - "The core product (Olivia conversational engine, the 7 'Conversational X' surfaces, mobile app source) has NO public repo anywhere in this org — this dimension can only ever see peripheral tooling for this target."
  - "packer-plugin-salt's real current usage (still-live infra tool vs abandoned mirror) is not directly confirmable from repo content alone — flagged as an open question, not asserted either way."
  - "The exact live service topology (which Python services, which Node services, how many, deployed where) is inferred from commit messages + code capability, not directly observed (no infra-as-code, no docker-compose, no k8s manifests in any of the 5 repos)."
  - "Only 50 commits per repo were fetched (--depth 50); pdf-lib and celery.node's full multi-year histories (dating to well before the ParadoxAi fork date) were not exhaustively walked, though this was sufficient to positively identify the fork point and all Paradox-authored commits (which cluster near HEAD)."
---

# Paradox — codebase capture

## Method

Cloned all 5 public repos under the confirmed-genuine `github.com/ParadoxAi` org (`--depth 50` each).
For every repo: read the top-level layout, manifest files (`package.json`/`pyproject.toml`/`go.mod`),
commit-author breakdown (`git log --format='%an <%ae>' | sort | uniq -c`), and cross-checked each against
the GitHub API's `fork`/`parent`/`archived`/`pushed_at` fields to establish genuine-vs-vendored status —
this was the single most load-bearing check, since the recon-plan flagged `pdf-lib` by name as a probable
name-collision risk. Extended the same fork-verification method to all 5 repos (not just `pdf-lib`),
which surfaced that **all five**, not just the flagged one, are forks. Checked npm/PyPI registries for
each repo's actual publish status/scope/name. Ran a secret/PII grep sweep across all 5 working trees
(excluding lockfiles and vendored binary assets) before writing anything to `raw/` — found nothing beyond
standard `${{ secrets.GITHUB_TOKEN }}` GitHub Actions references and a base64-encoded font asset (false
positive on a hex/base64 regex); no redaction was required.

## Findings

### 1. The org is genuine, but its public code is 100% forked — zero original Paradox source is public

| Repo | Fork of | Paradox-engineered? | Status |
|---|---|---|---|
| `pdfgen-python` | `shivanshs9/pdfgen-python` | Minimal — 3 commits, 1 day, 1 engineer, 2022 | Abandoned |
| `pdf-lib` | `Hopding/pdf-lib` | **Yes, substantial** — 3 engineers, 2023–2025, added a real feature | **Active** |
| `packer-plugin-salt` | `hashicorp/packer-plugin-salt` (upstream itself archived/unmaintained) | **No** — zero Paradox commits, dependabot-only | Passive mirror |
| `celery.node` | `actumn/celery.node` | **Yes, substantial** — 1 primary engineer, 2024–2025, real feature work | Active (repo itself later archived) |
| `scim2-models` | `python-scim/scim2-models` | Minimal but real — 2 commits, 1 day, 1 engineer, 2025 | Point-patch |

Full detail, per-repo commit evidence, and npm/PyPI publish names: `raw/structure-map.md`.

### 2. The headline finding: Paradox built its own PDF e-signature feature on a patched `pdf-lib` fork

Three named `@paradox.ai` engineers (or their `prd-*` GitHub aliases) added an AcroForm digital-signature
capability to `pdf-lib` that does not exist upstream (`src/api/form/PDFSignature.ts`,
`src/core/acroform/PDFAcroSignature.ts`), tracked under an internal ticket prefix `OL-` (almost certainly
the "Olivia" product's Jira key). Published to npm as an individual engineer's personal package
(`@prd-huy-ta/pdf-lib`), not an official Paradox SDK. This is directly relevant to a hiring/onboarding
product: applicants/hires filling and signing PDF forms (offer letters, tax/eligibility paperwork, policy
acknowledgments) is a plausible, concrete use case this capability serves.

### 3. Second finding: a genuinely polyglot backend, unified by a Celery/RabbitMQ task bus

`celery.node` (a Node.js implementation of Python Celery's wire protocol) is actively maintained by a
named Paradox engineer with real production-hardening commits — `"add testing worker rabbitmq"`,
retry logic, task-failure event handling — under internal ticket prefixes `OL-` and `OIS-`. This confirms,
by direct commit evidence rather than inference alone, that Paradox runs **RabbitMQ** as a message broker
and has at least one **Node.js service that interoperates with a Python-Celery task queue** — i.e., a
polyglot (Python + Node) backend joined by a shared async task bus, not a single-language monolith.

### 4. Third finding: the SCIM fork corroborates (does not just repeat) the marketing site's HRIS-integration claims

The one substantive patch to the `scim2-models` fork fixes a validation bug specific to the SCIM User
**`manager`** attribute — i.e., a real engineer hit a real bug while processing organizational-hierarchy
data via SCIM. This is independent, direct-observation corroboration that Paradox's SCIM-based
provisioning pipeline (the plausible integration point with Workday/SAP SuccessFactors that the marketing
site names as partners) is a live, exercised code path — not just a marketing claim. The
`scim2-models` package that resolves live on PyPI (200, v0.6.12) is the **upstream** `python-scim`
project's own publish, not a Paradox-specific one — corrected from the recon-plan's slightly imprecise
framing.

### 5. Fourth finding: `packer-plugin-salt` does NOT support the "legacy on-prem/VM infra" hypothesis as strongly as guessed

The recon plan flagged this repo as a possible signal of legacy Packer+SaltStack VM-provisioning infra.
Direct inspection refutes the strong form of that hypothesis: **zero commits in this fork are
Paradox-authored** — every commit is HashiCorp's own history plus automated `dependabot` bumps. Also
notable: the **upstream** HashiCorp repo describes itself as archived/no-longer-maintained by HashiCorp
itself. This reads far more like a passive compliance/dependency-mirror fork (an org policy of forking
third-party tools into the private GitHub org, perhaps for SBOM/vulnerability-scanning purposes) than
evidence of active Salt-based infrastructure. Left as an explicit open question rather than a
still-live-legacy-infra claim.

## Inferences

- **Confirmed (direct commit evidence, high confidence):** Paradox has an internal e-signature / PDF
  form-fill capability, built in-house rather than fully outsourced to a third-party e-sign vendor.
- **Confirmed (direct commit evidence, high confidence):** Paradox's backend is polyglot — Python and
  Node.js services both exist and interoperate via Celery-over-RabbitMQ.
- **Corroborated, not just claimed (medium-high confidence):** Paradox does live SCIM-based
  org-hierarchy/employee provisioning sync, consistent with (and a real engineering trace behind) its
  marketed Workday/SAP SuccessFactors integrations.
- **Downgraded from the recon-plan's hypothesis (now an open question, not a finding):** whether Paradox
  still runs an actual Packer+Salt VM-provisioning pipeline. The repo shows no active engineering, and its
  upstream is itself dead — treat any "legacy on-prem infra" claim as unconfirmed.
- **A general org pattern worth naming:** across all 5 repos, Paradox engineers **fork rather than
  contribute upstream**, and **publish under personal npm scopes** (`@prd-huy-ta/*`,
  `@prd-thanhnguyenhoang/*`) rather than an official `@paradox` org scope — consistent with these being
  internal-consumption artifacts (installable in Paradox's own CI/build pipelines) rather than any
  intended public SDK or open-source investment. Paradox has made **no public open-source investment** of
  its own; this stands in real contrast to the "developer platform" framing some competitors use.
- Two internal Jira-style ticket-project prefixes recur (`OL-`, seen in both `pdf-lib` and `celery.node`;
  `OIS-`, seen in `celery.node`), suggesting a shared "Olivia" engineering effort behind both forks.

## Open questions

- Is `packer-plugin-salt` still an actively-used part of Paradox's infrastructure, or purely a dormant
  compliance mirror? (Repo content alone cannot resolve this — would need `infra-backend-fingerprint` or
  a job posting/engineering-blog cross-check.)
- What is the actual current HTML→PDF or PDF-signature pipeline's production role — is `pdfgen-python`
  (abandoned since 2022) still in the critical path, or has it been superseded by the actively-maintained
  `pdf-lib` fork, or by a fully separate unobserved service?
- Are there other Paradox engineers' personal fork/publish activity under npm/PyPI/GitHub identities not
  yet linked to the `ParadoxAi` org (i.e., is this 5-repo org an undercount of Paradox's total public fork
  footprint)? Not pursued further — out of scope for a bounded per-org clone-and-map.
- What does `MS-` (seen once, in `pdf-lib`) refer to as a Jira project key, distinct from `OL-`/`OIS-`?

## Artifacts

- `raw/structure-map.md` — full per-repo detail: fork verification, commit-author breakdowns, feature
  content, npm/PyPI publish status, and the revised reading of `packer-plugin-salt`.
- `raw/dependency-graph.md` — the (non-monorepo) cross-repo relationship: the inferred Celery/RabbitMQ
  task-bus architecture joining the Python and Node.js sides, plus the shared internal ticket-prefix
  evidence.

## Per-unit work-list (for further fan-out, if warranted)

Given the small, peripheral nature of all 5 repos (none is a substantial core-product codebase), a
full per-package deep-read fan-out is **not warranted** — this `_summary.md` + the two `raw/` files
already capture the load-bearing detail for each. Provided for completeness per the dimension contract:

| unit | path | why it matters | suggested output file |
|------|------|-----------------|-----------------------|
| pdf-lib (Paradox fork) | source/paradox/pdf-lib | active internal e-signature/PDF feature, most substantial engineering evidence in the org | (covered in raw/structure-map.md — no further fan-out needed) |
| celery.node (Paradox fork) | source/paradox/celery.node | active internal Celery/RabbitMQ Node interop, confirms polyglot backend | (covered in raw/structure-map.md — no further fan-out needed) |
| scim2-models (Paradox fork) | source/paradox/scim2-models | small but real patch corroborating SCIM/HRIS provisioning claims | (covered in raw/structure-map.md — no further fan-out needed) |
| pdfgen-python (Paradox fork) | source/paradox/pdfgen-python | abandoned 2022 utility, low current relevance | (covered in raw/structure-map.md — no further fan-out needed) |
| packer-plugin-salt (Paradox fork) | source/paradox/packer-plugin-salt | zero Paradox engineering — likely passive mirror, refutes the strong "legacy infra" hypothesis | (covered in raw/structure-map.md — no further fan-out needed) |
