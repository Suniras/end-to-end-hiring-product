<!-- source: 5 repo clones under github.com/ParadoxAi · captured_at: 2026-08-09 · method: clone-and-map -->

# Paradox — internal dependency hierarchy

**There is no internal dependency hierarchy in the classic monorepo sense** — the 5 public repos are
independent forks of unrelated upstream projects, not packages of a shared Paradox workspace. No
`package.json`/`pyproject.toml` in any of the 5 repos references another `ParadoxAi`-org package. This is
expected: they are individual engineers' patched vendor forks, not a coherent internal SDK family.

## The only cross-repo relationship: a shared task-queue architecture (inferred, not a code dependency)

```
                    ┌─────────────────────────────┐
                    │   RabbitMQ (confirmed by     │
                    │   celery.node commit:        │
                    │   "add testing worker        │
                    │    rabbitmq", ticket OIS-4750)│
                    └───────────┬─────────────────┘
                                │  Celery wire protocol
                 ┌──────────────┼──────────────────┐
                 │                                  │
     ┌───────────▼───────────┐         ┌───────────▼────────────────┐
     │ Python service(s)      │         │ Node.js service(s)         │
     │ (native Celery,        │◄───────►│ using the patched          │
     │  presumed — no repo    │  tasks  │ `celery.node` fork          │
     │  observed directly)    │         │ (@prd-thanhnguyenhoang/     │
     │                        │         │  celery.node)               │
     └────────────────────────┘         └─────────────────────────────┘
```

This is an **inference from two independent commit-history observations** (celery.node's RabbitMQ-worker
commit + its Redis/AMQP broker code paths), not a directly observed service topology — no infra-as-code
or docker-compose was found in any of the 5 repos to confirm the exact deployment shape. Confidence:
medium (direct code+commit evidence of the *capability*; the *live topology* is not directly observed).

## Shared internal ticket-tracker prefixes (a weak but real cross-repo signal)

| Prefix | Seen in | Likely meaning |
|---|---|---|
| `OL-` | `pdf-lib`, `celery.node` | Probably the "Olivia" product Jira project key — both repos feed the same core product team |
| `OIS-` | `celery.node` | A second, distinct Jira project — possibly "Olivia Infra/Integration Services" |
| `MS-` | `pdf-lib` (one commit) | A third, distinct Jira project — unclear scope from one data point |

The recurrence of `OL-` across both the PDF-signature fork and the Celery-interop fork is the strongest
available (if indirect) evidence that these two forks feed the **same** underlying product engineering
effort (Olivia), not two unrelated teams' side projects.

## Language mix observed across the 5 repos

| Language | Repos | Note |
|---|---|---|
| **TypeScript/JavaScript** | `pdf-lib`, `celery.node` | Both actively engineered by Paradox — real Node/TS backend or tooling surface |
| **Python** | `pdfgen-python`, `scim2-models` | One abandoned (2022), one lightly but recently patched (2025) — real but thinner Python evidence than the TS side |
| **Go** | `packer-plugin-salt` | Zero Paradox engineering — passive mirror only, do not read as a Go-backend signal |

**Net read:** the public fork evidence best supports a **Python + Node.js polyglot backend**, unified at
least in one place by a Celery/RabbitMQ task bus. It does NOT support treating Go/Packer/Salt as an
active part of Paradox's current infrastructure — that repo shows no engineering activity at all.
