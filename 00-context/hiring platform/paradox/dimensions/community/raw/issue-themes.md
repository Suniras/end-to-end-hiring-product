<!-- source: github.com/ParadoxAi (5 repos) + status.paradox.ai/api/v2 · captured_at: 2026-08-09 · method: crawl-clip -->

# Paradox — Issue/Theme Clusters

Paradox has **no public issue tracker, discussion board, or forum** for its core product (Olivia /
Conversational ATS / CEM). The only two first-party surfaces that carry anything resembling "issues" are
(A) the GitHub org's Dependabot activity (zero product relevance) and (B) the Statuspage incident log
(a genuine, if indirect, defect/reliability signal). Both are reported below; themes over threads.

## A. GitHub org (github.com/ParadoxAi) — confirmed NOT a product community surface

All 5 public repos are **forks of unrelated third-party open-source projects**, each with `discussions:
false`, each carrying exactly 0–1 open issues, and every one of those issues is an **automated Dependabot
security-bump PR/issue** with zero comments:

| Repo | Fork of | Open issues | Content of the issue(s) |
| --- | --- | --- | --- |
| `pdfgen-python` | `shivanshs9/pdfgen-python` | 1 | Dependabot: "Bump the pip group across 1 directory with 4 updates" |
| `pdf-lib` | `Hopding/pdf-lib` | 1 | Dependabot: "Bump js-yaml from 3.13.1 to 3.14.2…" |
| `packer-plugin-salt` | `hashicorp/packer-plugin-salt` (upstream itself archived/unmaintained) | 1 | Dependabot: "Bump github.com/ulikunitz/xz…" |
| `celery.node` (archived) | `actumn/celery.node` | 1 | Dependabot: "Bump brace-expansion…" |
| `scim2-models` | `python-scim/scim2-models` | 0 | — |

**Theme: zero.** No feature requests, no bug reports, no product-relevant discussion of any kind exists
on this org. It functions purely as Paradox's internal Dependabot-monitored fork holding-pen (likely kept
for internal tooling/vendoring reasons), not a developer-facing surface. This corroborates the recon
plan's flagged suspicion about `pdf-lib` being a name-collision fork, and generalizes it to all 5 repos.

## B. Statuspage incident log (status.paradox.ai) — the de facto reliability/defect signal

45 incidents on record, **2017-08-03 → 2026-07-15** (Statuspage instance created ~2023-02, but backfilled
with history to 2017 — corroborates the company's ~2016/2017 founding independently of the GitHub-org
creation date). Clustered by theme:

| Theme | Count (approx.) | Representative examples |
| --- | --- | --- |
| **CEM (Candidate Experience Manager) performance/slowness** | ~13 | "CEM Slowness" ×4 (Jul 2026, one with full postmortem), "Cem Slowness" (Jan 2026), "CEM Performance Impacted" (Aug 2025, Jun 2025), "CEM Performance impacted" (Aug 2024), "CEM Slowness" (Aug 2024 ×2), "Degraded performance on CEM" (Aug 2023), "Responsiveness impacted on the API and CEM" (Jun 2023) — the single most recurring incident category by far |
| **Messaging-channel delivery (WhatsApp/SMS)** | ~5 | "WhatsApp messages not being delivered" (Apr 2024), "Delays sending whatsapp Messages" (Jul 2023), "WhatsApp messages not being processed" (Jun 2023), "Service disruption impacting SMS delivery" (Jun 2023, major) |
| **CEM/system availability outages** | ~7 | "Production Instances Unavailable" (Jun 2026, critical), "CEM Unavailable" (Apr 2026), "Olivia Availability Issue" (Apr 2024, critical), "CEM availability issue" (Jan 2024, major), "Paradox Outage" (May 2022, critical), "CEM Outage" (Jul 2023) |
| **Infra/platform-attributed (AWS, NLP, cache)** | ~4 | "Elevated API Errors (AWS)" (Dec 2021, major), "Downtime due to AWS EC2, RDS, and Redshift Operational Issues" (Aug 2017), "System Performance - NLP Failover" (Oct 2021), "Cache Performance" (Sep 2020) |
| **Integration/compliance module issues** | ~2 | "I-9 errors for Gryphon users" (Aug 2024 — names a customer-facing integration partner, "Gryphon"), "Reporting Timeout" (Feb 2022) |
| **Misc UI/widget/browser issues** | ~4 | "Issue with Browser Extension" (Jun 2026), "Widget Not Rendering" (Feb 2022), "Job Search Results" (Jan 2022, major), "Issues viewing candidates in the CEM Inbox" (Sep 2023) |

**The one detailed postmortem on record** (2026-07-27, for the "CEM Slowness" cluster spanning Jul 1/9/
10/15 2026) discloses a concrete architecture finding: recently-shifted traffic patterns hit **legacy
endpoints that had inadvertently retained synchronous components** inside what is otherwise "the
system's standard asynchronous backend processing model" — under low volume this went unnoticed, but
rising traffic caused connection exhaustion and cascading slowness. Fix in progress: converting the
remaining sync endpoints to fully async, plus auditing other legacy endpoints for the same drift.

**Acknowledged rough edge (self-disclosed by the vendor):** CEM performance/slowness is the single most
recurring incident theme across the 2023–2026 window (roughly 13 of 45 incidents), with an admitted
legacy-architecture root cause as of mid-2026 — the clearest first-party evidence of where the platform's
technical debt currently sits.
