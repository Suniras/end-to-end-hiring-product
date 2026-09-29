<!-- source: https://developer.fountain.com/.well-known/{mcp,agent-skills/index.json} · https://app.fountain.com/.well-known/mcp · reference page hydration data (get_v2-applicants, post_v2-applicants, get_v2-applicants-id) · captured_at: 2026-08-09 · method: bundle-string-mine (probe) + verbatim OpenAPI tag inspection -->

# Fountain — MCP / tool-catalog surface

> ### ⚠️ SUPERSEDED IN PART — read this first
>
> `superseded_by: evaluation/data-model-api-surface.md §MCP` ·
> `deployed-client-bundle: raw/wx-micro-frontends.md §2d` · corrected 2026-08-09 (Mode-5 iterations 1–2)
>
> ~~**No live MCP server was found.**~~ **TWO live MCP servers were subsequently found**, both answering
> read-only unauthenticated `initialize` + `tools/list` (no tool ever invoked):
>
> | Host | Server | Tools | Found by |
> | --- | --- | --- | --- |
> | `data-mcp-production-us-east-1.fountain.com/mcp` | `fountain-data-mcp v1.27.2` | 6 (Cube.js + ClickHouse) | Mode-5 it. 1 — host discoverable **only** from the `wx-copilot` client bundle |
> | `mcp.fountain.com/` (mounted at root, not `/mcp`) | `fountain-hire-mcp-server v1.0.0` | **127**, all tagged `exposeAsMcpTool` | Mode-5 it. 2 — the `x-hire-mcp-base-url` host |
>
> **This capture's probe was not wrong — it was artifact-scoped.** The six candidate paths it tried
> across `app.` / `services.` / `developer.fountain.com` genuinely 404, and that result stands for those
> hosts. Neither real host was reachable from the artifacts this dimension held; both required the client
> bundle (it. 1) or a DNS candidate sweep (it. 2). The defect corrected here is the **scope of the
> assertion** ("no live MCP server exists" stated at product scope), not the probe.
>
> **The section's positive finding is not superseded — it is confirmed and strengthened.** The
> `exposeAsMcpTool` tag documented below turned out to be the **build-pipeline switch** that promotes an
> endpoint to a live agent-callable tool: all 127 tools on `fountain-hire-mcp-server` carry it in
> `_meta.apiTags`. The "deliberate, curated first agent-tool surface" read was right; only "not a live
> product yet" was wrong.

**No live MCP server was found *by this capture*.** This is a genuine probe result, verified by a second
method (see below), not a guess — but see the supersession banner above for its correct scope.

## What WAS found: an `exposeAsMcpTool` OpenAPI tag on a subset of Hire v2 operations

Some Hire v2 operations carry an extra `tags` entry beyond the normal resource tag:

```json
"tags": ["Applicants", "exposeAsMcpTool"]
```

**Extended, bounded sample (36 of 108 Hire-v2 endpoint pages, a stratified every-3rd-page sample,
fetched in a second pass to size the prevalence — still not exhaustive, see gaps):** **10 of 36 (28%)**
carry the tag:

| Tagged (`exposeAsMcpTool` present) | NOT tagged (sample) |
|---|---|
| `GET /v2/applicants`, `POST /v2/applicants`, `DELETE /v2/applicants/{id}`, `PUT /v2/applicants/{id}/advance` | `GET/POST /v2/applicants/{id}/secure/documents*`, `.../notes`, `.../document-rejection-notifications` (sub-resource ops) |
| `GET/POST/PUT /v2/locations` family (list, create, update-by-id) | `GET /v2/location-groups`, `GET /v2/company-attributes*` |
| `GET/PUT /v2/positions` family (list, update-by-id) | `GET /v2/roles`, `GET /v2/stages/{id}`, `GET /v2/workers/{id}` |
| `PUT /v2/funnels/{id}` | `GET /v2/funnels/{funnel_id}/stages`, `GET/POST /v2/exports*`, `POST /v2/timestamped-exports` |
| — | `GET /v2/webhook-settings`, `POST /v2/workers/{id}/activate`, `POST /v2/available-slots/{id}/confirm`, `POST /v2/hiring-goals`, `POST /v2/option-banks`, `POST /v2/company-attributes/*` |

**Refined reading:** the tag is NOT applied uniformly across all CRUD verbs on all resources — it
targets **core-entity primary operations** (list/create/get/update/delete on **Applicants, Locations,
Positions, Funnels**) and explicitly excludes **sub-resource / nested / process operations** (notes,
documents, exports, activation, slot-confirmation, webhook settings). This looks like a deliberate,
curated first tool-surface — "let an agent read and act on the four or so entities an agent-driven
hiring workflow would actually need" — not an auto-tag-everything pipeline default. Confirmed ABSENT on
the two `serviceworkforce` operations sampled (`GET`/`POST /api/serviceworkforce/workers`); the tag
appears to be a **Hire-v2-only** (legacy monolith) construct so far, not yet extended to the `service*`
microservices in the samples checked. This is almost certainly a build-time marker Fountain's own
OpenAPI pipeline uses to decide which operations get auto-exposed as callable tools to an internal or
partner-facing LLM/agent layer (e.g. feeding a future MCP server, or Fountain's own "Cue"/Copilot agent
surface) — Fountain's API definitions are **already agent-tooling-aware** even though no public MCP
endpoint is live yet.

## What was probed and returned negative (verified via a second method per ingestion §7 rule 10)

| Probe | Result | Verification |
|---|---|---|
| `GET developer.fountain.com/.well-known/mcp` | 404 | direct fetch |
| `GET services.fountain.com/.well-known/mcp` | 404 | direct fetch |
| `GET services.fountain.com/mcp` | 404 | direct fetch |
| `GET services.fountain.com/api/servicehire/mcp` | 404 | direct fetch |
| `GET services.fountain.com/sse` | 404 | direct fetch |
| `GET developer.fountain.com/.well-known/oauth-authorization-server` | 404 | direct fetch |
| `GET services.fountain.com/.well-known/oauth-authorization-server` | 404 | direct fetch |
| `GET services.fountain.com/.well-known/oauth-protected-resource` | 404 | direct fetch |
| `GET app.fountain.com/.well-known/mcp` → 200 | **FALSE POSITIVE** — the SPA serves its `index.html` shell for ANY path (confirmed by comparing response headers byte-for-byte, incl. identical `last-modified`/`x-amz-version-id`, against a random nonsense control path `app.fountain.com/this-path-should-not-exist-xyz123`, which also 200s with the same asset fingerprint) | second-method cross-check — NOT a real MCP endpoint |

## What WAS found: an agent-skills discovery manifest (docs-pointer only, not a tool catalog)

`GET https://developer.fountain.com/.well-known/agent-skills/index.json` → 200:
```json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [{
    "name": "read-the-docs",
    "type": "skill-md",
    "description": "Guide to the documentation available at https://developer.fountain.com. Points to an llms.txt summary with links to every doc, reference, changelog, and custom page.",
    "url": "https://developer.fountain.com/.well-known/agent-skills/read-the-docs/SKILL.md",
    "digest": "sha256:4e6b76e8c85bc85a84bc57722c4e9056438a7bda9718c20df5d504f0c5cdb1fe"
  }]
}
```
This is a single "read the docs" pointer-skill (an `agentskills.io`-schema discovery file, an emerging
early-2026 standard for making a docs site itself agent-navigable) — it just points an agent at
`llms.txt`. It is NOT a tool catalog (no callable actions), just an agent-native docs-discovery
breadcrumb. Genuinely early-adopter (this schema and pattern are still uncommon as of this run), worth
noting as a positioning signal (Fountain is building for an agent-consuming audience), but should not be
conflated with the `exposeAsMcpTool` finding above, which is the actual tool-surface signal.

## Platform-level noise (NOT a Fountain finding — ReadMe's own product feature)

The `get_v2-applicants` reference page's hydration data includes a ReadMe-platform-wide config block:
`"reservedWords":{"tools":["execute-request","get-endpoint","get-server-variables","list-endpoints",
"search-endpoints","search","fetch"]}`. This is **ReadMe's own hosted-docs MCP/AI-chat tool-naming
convention** (a generic feature of the ReadMe SaaS platform, offered to any ReadMe customer), not
something Fountain built or configured specifically. Recorded here to avoid a future run mis-attributing
it to Fountain.

## Gaps

- 41 of 575 endpoint pages (5 initial + 36 stratified) had their full OpenAPI JSON checked for the tag —
  all within the Hire v2 family (108 pages) and 2 `serviceworkforce` pages. The tag's prevalence across
  the OTHER 12 `service*` microservices (467 pages) is UNCONFIRMED — flagged as a re-walk candidate for
  a future pass, not fabricated here. Extrapolating the 28% Hire-v2 rate to the whole catalog would be
  unjustified (the tag looks entity-curated, not uniform-random) — no full-catalog percentage is claimed.
- No live MCP transport (streamable-HTTP vs SSE) could be fingerprinted since no MCP endpoint responded.
