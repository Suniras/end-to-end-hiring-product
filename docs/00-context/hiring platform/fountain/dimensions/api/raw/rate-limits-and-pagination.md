<!-- source: https://developer.fountain.com/reference/{rate-limitations,frequently-asked-questions,get_v2-applicants,get_v2-webhook-settings,get_api-serviceworkforce-workers}.md · captured_at: 2026-08-09 · method: docs-reconstructed + verbatim OpenAPI schema -->

# Fountain — Rate limits, pagination, error envelopes (documented ONLY for the Hire v2 legacy API)

## Rate limits (Hire API v2 only — no `service*` microservice rate-limit page found)

- **Default: 120 requests/minute** per API key.
- Headers on every response: `X-Api-Ratelimit-Limit`, `X-Api-Ratelimit-Limit-Remaining`,
  `X-Api-Ratelimit-Reset` (unix time).
- 429 response body: `{"error": {"msg": "Too many API requests. See documentation for more information", "name": "exceeded_rate"}}`.
- **Documented mitigations** (from the FAQ, notably candid about current platform limitations):
  1. Request a **secondary API key** — doubles the effective rate limit for the account.
  2. Upgrade to a **single-tenant** hosting plan — raises the default limit.
  3. **Bulk APIs are "in the process of being built"** — an explicit admission of a current gap for
     large-dataset customers; ask a CSM for early access.
- **No rate-limit documentation found for the 13 `service*` microservices** (serviceworkforce,
  serviceattendance, etc.) — a real documentation gap, not confirmed to mean "unlimited."

## Pagination — TWO distinct styles across the platform (a third architecture split-tell)

### Hire v2 (legacy) — page-number AND cursor, both supported on the same endpoint
- **Page-number:** `?page=N`. Response `Pagination` object: `{first, last, previous, current, next}`
  (all integers, `previous`/`next` nullable at the ends).
- **Cursor (recommended for deep pagination):** every list response includes `pagination.next_cursor`;
  pass it back as `?cursor=<opaque_string>` for the next page. Docs explicitly say deep page-number
  pagination is capped "due to performance reasons" — cursor pagination is positioned as the escape
  hatch, not a first-class citizen (a retrofit onto an existing page-based API, a common evolution
  pattern for an aging monolith).
- **`per_page`** query param also documented (uncapped value shown in schema, actual server-side cap
  unconfirmed).

### `service*` microservices (serviceworkforce sampled, pattern repeats in every "find many X" doc
description across serviceattendance/servicetodo/etc.) — LoopBack-style filter object
- `filter[limit]=25&filter[skip]=25` — offset/limit pagination via a **LoopBack "filter" query DSL**:
  `filter[where][field][op]=value` for filtering (operators: `eq` implicit, `gt`,`gte`,`lt`,`lte`,`ne`,
  `in`,`nin`), `filter[fields][field]=true` for field projection, `filter[limit]`/`filter[skip]` for
  paging. Uses `explode:true, style:deepObject` OpenAPI parameter serialization.
- No `next`/`has_more`/cursor field observed in the sampled response envelope — the client must track
  its own offset. A `meta.count` field (see error/envelope section below) gives the total-matched count
  on `count` endpoints (`GET /api/serviceworkforce/workers/count` is a SEPARATE endpoint from the list
  endpoint, not a query flag — this `<resource>/count` sibling-endpoint pattern repeats across every
  `service*` family in the full catalog, another LoopBack tell).

## Error envelopes — at least TWO distinct shapes confirmed (see also `openapi-digest.md`)

| API family | Shape | Sample |
|---|---|---|
| Hire v2 (legacy) | `{"error": {"msg": string, "name": string}}` | `{"error":{"msg":"Too many API requests...","name":"exceeded_rate"}}` |
| `service*` microservices | JSON:API-flavored array | `[{"rid":"$triMTZcK","status":"404","code":"#d06c700a","title":"resource not found","detail":"resource with uuid `...` not found","meta":{...}}]` |
| Hire v2 auth-only | `{"message": string}` (the `Unauthorized` schema — narrower than the general error shape) | — |

## Response metadata envelope (`service*` only)

Every `service*` list/detail response includes a `meta` object (`responsesPartMeta` schema):
`timestamp, verb, path, jti, rid, count, status, duration, size` — a fairly sophisticated per-request
diagnostic envelope (`jti`/`rid` look like request/trace IDs; `duration`+`size` suggest server-side APM
instrumentation is surfaced directly in the API response, unusual for a public-facing API and worth
noting as a design choice).

## RFC 8594 Sunset headers (Hire v2 deprecation mechanic)

Deprecated Hire v2 endpoints carry standard `Sunset:` + `Link: <...>; rel="sunset"` headers pointing back
to the `deprecations` doc page — a properly-implemented, standards-based deprecation signal (better
practice than most SaaS APIs bother with). The deprecations TABLE itself was empty (no rows) at capture
time — either no endpoints are currently in their deprecation window, or the table wasn't rendered in
the markdown mirror (open question, low priority).
