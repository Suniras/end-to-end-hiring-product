---
scope: accept
target: fountain
corpus_root: research/
access_grade:
  source: { value: none, confidence: high, evidence: "GitHub org github.com/Fountain (id 64402) is a NAMESAKE — created 2009-03-17, five years before Fountain the hiring company existed (founded 2014); blog field points to fountain.engineering (a separate live Cloudflare-hosted site, unrelated content); only 1 near-empty public repo (.github bootstrap). No fountain-hire / @fountain npm or PyPI package found (fountain-js on npm is an unrelated screenplay-markup parser). Verified via full org JSON + repo list, not a bare 404 — same namesake-disambiguation discipline as the Onebeat/Brandlight/Profound runs." }
  runtime: { value: reachable, confidence: high, evidence: "app.fountain.com returns 200 and serves a real webpack SPA shell (runtime.js + npm.lodash/babel/react-dom/react-quill/stripe vendor chunks — un-single-bundled, likely mineable). developer.fountain.com serves a real ReadMe-hosted developer portal (302→/reference) with a genuine llms.txt naming a real API host services.fountain.com and real endpoint docs (List/Create/Get Applicants, Hire Webhooks, Rate Limits, Tenant API URLs, Custom Integrations, Slack Integration, HRIS Sync)." }
  auth: { value: none, confidence: high, evidence: "Batch-wide default: outside-only/no-login confirmed by the user for this project pattern; user unreachable to provide a session for this specific run, so auth:none applies by inherited default, not a fresh per-target confirmation." }
  presence: { value: rich, confidence: high, evidence: "Rich marketing site (Solutions/Use-Cases-by-Industry/Use-Cases-by-Role/Resources/Company nav), a genuinely rich developer-docs portal (llms.txt + ReadMe reference pages), a live Statuspage instance (status.fountain.com), footer links to Trust Report + Security + Ethical AI pages, and a reachable /blog path on the main domain." }
matched_case: "Case-2-like (runtime:reachable, source:none) but with an unusually rich docs+api surface via a genuinely served developer portal — closer in richness to a Case-1 target on those two dimensions specifically, despite a fully namesake-blocked codebase."
pass2: not-applicable
hypotheses:
  - "services.fountain.com is the real production API host, and the 'Tenant API URLs' doc page implies a per-tenant subdomain/path model (multi-tenant SaaS, tenant-scoped API base) — UNVERIFIED, re-derive from the actual reference pages during Ingestion, do not assume the exact tenant-URL shape."
  - "The three named AI agents (Anna=screening, Emma=24/7 support, Sam=retention) and 'Cue' (workflow automation) are marketed as agentic/LLM-driven — UNVERIFIED whether this is genuine LLM orchestration or a rules-engine relabeled as 'AI agents' (the batch's single most recurring cross-target pattern in prior sub-batches was exactly this kind of overclaim; treat as a hypothesis to test, not a fact, verify: may-be-stale)."
  - "Fountain has no native mobile app (App Store search for 'fountain hiring'/'fountain onboarding'/'fountain.com' surfaced zero Fountain-affiliated apps, only unrelated namesakes: a podcast player, a water-fountain finder, a bank's app) — the 'mobile-first' marketing claim likely refers to responsive mobile WEB, not a native app. UNVERIFIED as a final claim; the distribution-artifacts / website collectors should re-check under any alternate app name before this is asserted as fact."
---

# Fountain — Recon Plan

## Dimension availability

| # | Dimension | Status | Evidence | Planned method |
| --- | --- | --- | --- | --- |
| 1 | **codebase** | ❌ absent | `github.com/Fountain` is a verified namesake (see access_grade.source); no other org guess (`fountain-io`, `fountainhire`, `GoFountain`) resolved | — |
| 2 | **docs** | ✅ available | `developer.fountain.com` (ReadMe, real `llms.txt`, real reference pages); likely also a general help/support site (`support.fountain.com` linked from footer, unprobed) | `crawl-clip` of llms.txt-linked pages + docs-reconstructed for endpoint shapes |
| 3 | **packages** | ⚠️ partial/likely-absent | No `fountain-hire`/`@fountain`-scoped npm or PyPI hit in the cheap probe; ReadMe docs suggest REST-only, no official client SDK mentioned in llms.txt titles so far | `registry-metadata` if any SDK surfaces; otherwise recorded absent |
| 4 | **api** | ✅ available | Real host `services.fountain.com`; llms.txt lists ~15+ real endpoint/reference pages (Applicants CRUD, Webhooks, Rate Limits, Tenant API URLs, Custom Integrations, HRIS Sync, Slack Integration); no verbatim OpenAPI JSON found at guessed paths (`openapi.json`/`swagger.json` all 404) — grade the method from what's actually retrieved, not the label | `docs-reconstructed` (medium) unless the collector finds a served spec (ReadMe sites often expose one at a non-guessable path — check page source / API Explorer "Try It" panel network calls) |
| 5 | **website** | ✅ available | Rich nav: Solutions (Products/AI Agents/Cue), Use Cases (Industry/Role), Resources, Company; footer has Trust Report, Security, Ethical AI, Subscription Agreement | `crawl-clip` |
| 6 | **community** | ✅ available | `/blog` resolves 200 on the main domain (note: `blog.fountain.com` subdomain itself 530s — use the path, not the subdomain); Statuspage component list is a cheap architecture signal; check for a public changelog/roadmap separately from the blog | `crawl-clip` (first-party only) |
| 7 | **session** | ❌ absent | `auth:none` — not dispatched this run (batch default, user unreachable to authorize) | `status: absent` per ingestion §1 |
| 8 | **deployed-client-bundle** | ✅ available | `app.fountain.com` 200, real webpack SPA with named vendor chunks (`npm.lodash`, `npm.babel`, `npm.react-dom`, `npm.react-quill`, `npm.stripe` — Stripe SDK client-side is notable, investigate what it's for: background-check fee collection? direct-deposit/payroll setup during onboarding?) | `bundle-string-mine`; check for `sourceMappingURL` before assuming no source maps |
| 9 | **infra-backend-fingerprint** | ✅ available | DNS/CT sweep not completed in Discovery (crt.sh timed out on the cheap probe — retry in Ingestion); Statuspage component list + response headers (developer.fountain.com fronted by Cloudflare, backend on Render per `x-render-origin-server: Render`) already give a partial fingerprint | `dns-ct-fingerprint` + sub-processor fold-in from Trust Report/Security pages |
| 10 | **wire-capture** | folded → session | No separate non-browser client identified; folds per ingestion §7.1 fold note | `status: folded` |
| 11 | **distribution-artifacts** | ❌ absent (tentative) | No Fountain-affiliated app found in 3 App Store search variants (`fountain hiring`, `fountain onboarding`, `fountain.com`) — only unrelated namesakes returned | re-verify once during Ingestion (Google Play too) before finalizing absent |

## Notable early leads (not facts — re-derive during Ingestion)

- `developer.fountain.com/.well-known/api-catalog` (404 on direct fetch, but the `Link:` header on the
  `/reference` redirect response advertises it, plus a `.well-known/agent-skills/index.json` that DOES
  resolve — an AI-agent-skill discovery manifest (schema `schemas.agentskills.io/discovery/0.2.0`)
  pointing to one skill (`read-the-docs`, a pointer back to `llms.txt`). This is a genuinely novel,
  early-adopter pattern (agent-native docs discovery) worth a dedicated note in the `api`/`docs` capture —
  not an MCP server, but adjacent in spirit to the MCP/tool-catalog fold-in Part C describes.
- `partners.fountain.com` is referenced from the API docs as the partner-integration guide host — a
  second docs surface to check.
- `services.fountain.com/api/servicesecurity/...`, `.../serviceworkforce/...`, `.../servicehire/...` path
  prefixes imply a **microservices architecture** (security / workforce / hire as separate backend
  services fronted by one API gateway) — a real architecture signal for `technology-architecture.md`,
  not yet corroborated by a second dimension.

## Gating / ethics flags

No gated dimensions dispatched (`auth:none`, `wire-capture` folds to an absent `session`). Standard
redaction discipline applies to all captures per ingestion §7.
