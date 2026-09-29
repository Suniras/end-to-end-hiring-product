<!-- source: direct curl probes against https://api.paradox.ai/* · captured_at: 2026-08-09 · method: direct-probe (unauth) -->

# Paradox — `api.paradox.ai` path-probing (the wrong-auth-scheme / route-existence tripwire)

Discovery confirmed `api.paradox.ai/` → 403 `{"message":"Missing Authentication Token"}` (AWS API
Gateway's own error, meaning the root resource has no method configured without an authorizer). This
collector probed further paths to distinguish "route doesn't exist" from "route exists, needs auth" —
per `tradecraft.md`'s wrong-auth-scheme-tripwire pattern. The distinction turned out to be sharper than a
status code: **response headers reveal whether a request reached the backend at all.**

## The three response classes observed

| Path | Status | Body | `x-amzn-remapped-server` | Interpretation |
|---|---|---|---|---|
| `/` | 403 | `{"message":"Missing Authentication Token"}` | *(absent)* | **API Gateway itself** rejects — no resource configured for bare `/` without an authorizer/API-key. This is AWS's own error, generated at the gateway, never reaching any backend. |
| `/v1`, `/v2`, `/graphql`, `/health`, `/status`, `/swagger`, `/openapi.json`, `/webhooks`, `/webhook`, `/api`, `/.well-known/openapi.json`, `/redoc`, `/swagger-ui`, `/api-docs`, `/admin`, any random unmapped path | 404 | plain text `404` (4 bytes) | **`gunicorn`** (present) | These requests ARE proxied through API Gateway to a live **Python/gunicorn backend**, which itself returns a generic 404 for an unmapped route. The backend is reachable and real; these specific paths just don't exist on it. `content-language: en` + `vary: Accept-Language, origin` on every one of these responses are backend-emitted headers (an i18n-aware Python web framework, consistent with Django or a Django-alike). |
| `/ping` | 200 | `healthy` (7 bytes, `content-type: null`) | *(absent — no remapped-\* headers, no `x-request-id`)* | A **genuine unauthenticated health-check endpoint**, most likely served directly by API Gateway (a mock/Lambda-authorizer-bypassed integration) rather than proxied to the gunicorn backend — no `x-amzn-remapped-*` headers accompany it, unlike every backend-reached path above. |
| `/docs` → `/docs/` → `/docs/docs/` | 302 → 302 → **401** | `Have a good day !` | `gunicorn` (present) | **A real, backend-served, HTTP-Basic-Auth-gated documentation endpoint.** Two redirects (Django-style relative-URL trailing-slash resolution) land on `/docs/docs/`, which challenges with `WWW-Authenticate: Basic realm="Have a good day !"` — a distinctive, human-authored realm string (not a framework default), confirming this is Paradox's own internal Swagger/ReDoc UI for `api.paradox.ai`, deliberately gated behind Basic Auth for internal/ops use — **separate from** the public `readme.paradox.ai` customer-facing docs portal (see `endpoint-catalog.md`). |

## Confirmed inferences

- **The real path prefix is `/api/v1/public/*`** (confirmed independently via `readme.paradox.ai` — see
  `endpoint-catalog.md`), which is why bare `/v1`, `/v2`, `/graphql` etc. 404 at the backend: they're not
  wrong guesses caught by the gateway, they're syntactically-plausible-but-wrong paths that the real
  Python backend evaluates and rejects.
- **Backend runtime: Python + gunicorn**, fronted by AWS API Gateway (Lambda-proxy or ALB-behind-APIGW
  integration — the `x-amzn-remapped-*` header prefix is API Gateway's convention for passing through
  headers from an integrated HTTP backend). This corroborates (independently, via HTTP headers rather
  than DNS/cert data) the `infra-backend-fingerprint` dimension's AWS finding, and adds the language
  (Python) that dimension likely can't see from outside.
- **`/docs/docs/` is a real, if inaccessible, internal API-documentation UI** — the api-dimension method
  for the customer-facing catalog is `openapi-verbatim` (via `readme.paradox.ai`, see
  `endpoint-catalog.md`), not this gated internal one; this file records its existence as a fingerprint,
  not a source of endpoint data (never attempted credential guessing against the Basic Auth challenge).

## Full probe log (paths tried against `api.paradox.ai`)

`/`, `/v1`, `/v2`, `/graphql`, `/health`, `/status`, `/docs`, `/docs/`, `/docs/docs/`, `/swagger`,
`/openapi.json`, `/webhooks`, `/webhook`, `/api`, `/.well-known/openapi.json`, `/ping`, `/redoc`,
`/redoc/`, `/swagger-ui`, `/api-docs`, `/admin`, `/admin/`, `/unknown-random-xyz123` (negative control,
confirmed the generic-gunicorn-404 baseline). OPTIONS also tried on `/` and `/ping` — both mirror their
GET status (403 / 200 respectively), i.e. no distinct CORS preflight handling observed.
