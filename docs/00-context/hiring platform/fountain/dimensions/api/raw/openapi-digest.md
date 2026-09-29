<!-- source: https://developer.fountain.com/llms.txt + https://developer.fountain.com/reference/*.md · captured_at: 2026-08-09 · method: docs-reconstructed (no single served spec file found) with verbatim per-operation OpenAPI JSON fragments -->

# Fountain — OpenAPI spec digest (no single combined file — per-operation fragments)

## What was checked and NOT found

- `https://developer.fountain.com/openapi.json` → 404
- `https://developer.fountain.com/swagger.json` → 404
- `https://developer.fountain.com/api/openapi.json` → 404 (per Discovery)
- `https://developer.fountain.com/.well-known/api-catalog` → 404 (re-tried in Ingestion with `Accept: application/json` — still 404; the `Link:` header referencing it on the `/reference` redirect appears to be a dead/aspirational reference)
- Page source of a live reference page (`get_v2-applicants`) was inspected for a `dash.readme.com` spec-registry UUID or a downloadable OpenAPI export link — none found. The React app embeds the **per-operation** OpenAPI JSON directly in the page's hydration data (see below), not a link to one combined file.
- No ReadMe "Download OpenAPI" affordance was reachable without a dashboard login.

**Conclusion: there is no single verbatim OpenAPI spec file served.** Grade the `api` dimension's `method` as `docs-reconstructed` for the narrative/catalog assembly. HOWEVER — and this is the load-bearing nuance — **every individual ReadMe reference page embeds a genuine, complete, machine-generated OpenAPI 3.0 JSON fragment for that one operation** (visible via the page's `.md` mirror under `# OpenAPI definition`). These fragments are NOT hand-written docs prose; they are verbatim generator output (see the `Fountain-servicehire` and `Fountain-serviceworkforce` API definitions below). So: the **endpoint catalog + every sampled schema is high-confidence, machine-derived data**; only the assembly across 575 pages into one catalog (and the guide-page narrative) is `docs-reconstructed`.

## Two (at least) distinct OpenAPI source documents observed

Fountain does not run one OpenAPI document across the whole platform — the embedded fragments show at least **two independently-generated specs**, confirming the microservices split:

### 1. "Hire Public API" v2 (legacy monolith, `/v2/...`)
```json
{
  "openapi": "3.0.1",
  "info": { "title": "Hire Public API", "version": "v2" },
  "servers": [{ "url": "https://api.fountain.com", "description": "Our production API url." }],
  "security": [{ "ApiKeyAuth": [] }],
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": { "type": "apiKey", "name": "X-ACCESS-TOKEN", "in": "header" }
    }
  }
}
```
Sampled from: `get_v2-applicants`, `post_v2-applicants`, `get_v2-applicants-id`, `get_v2-webhook-settings`,
`post_v2-webhook-settings`. Two of the five sampled Applicants operations (`get_v2-applicants`,
`post_v2-applicants`, `get_v2-applicants-id`) carry an extra OpenAPI `tags` entry: **`"exposeAsMcpTool"`**
alongside the resource tag (`"Applicants"`) — see `tool-catalog.md`.

### 2. "Worker Experience Public API" v1.0.0 (`serviceworkforce` microservice)
```json
{
  "openapi": "3.0.3",
  "info": { "version": "1.0.0", "title": "Worker Experience Public API" },
  "servers": [{
    "url": "https://services.fountain.com",
    "description": "The former URL `wxp-services.fountain.com` is being deprecated but is still supported for the time being. Customers with dedicated WX instances must use services.<customer_instance>.fountain.com."
  }],
  "security": [{ "jwt": [] }],
  "components": {
    "securitySchemes": { "jwt": { "type": "http", "scheme": "bearer" } }
  }
}
```
Sampled from: `get_api-serviceworkforce-workers`, `post_api-serviceworkforce-workers`. Response envelope
is JSON:API-flavored (`{data, meta}` with `responsesPartMeta` carrying `timestamp/verb/path/jti/rid/count/
status/duration/size`); errors are a JSON:API-style array (`[{rid, status, code, title, detail, meta}]`) —
**a different error shape from the Hire v2 monolith's `{"error": {"msg","name"}}`.** Given the shared
`services.fountain.com` host and near-identical error/meta envelope conventions across the other 12
`service*` prefixes sampled indirectly (consistent `filter[where]/filter[limit]/filter[skip]` LoopBack-style
query syntax appears in every `find many <resource>` page description, e.g. `serviceattendance`,
`servicetodo`), the 13 `service*` microservices likely share **one underlying framework generation**
(LoopBack-flavored Node.js) distinct from the legacy Rails-flavored Hire v2 monolith — this is an
INFERENCE from convention consistency across doc pages, not independently confirmed per-service by a
fetched schema; flag as an open question for `infra-backend-fingerprint`/`technology-architecture.md`.

## Full endpoint catalog

See `raw/endpoint-catalog.md` — 575 endpoint pages reconstructed into a method×path×summary table,
grouped into 14 service families, sourced from `llms.txt`'s link titles + an 8-page verbatim-schema
sample (marked `(verbatim)` in the catalog).
