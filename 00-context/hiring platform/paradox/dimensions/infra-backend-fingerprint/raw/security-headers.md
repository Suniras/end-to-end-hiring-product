<!-- source: curl -sI / -sIL against live hosts · captured_at: 2026-08-09 · method: dns-ct-fingerprint -->

# Paradox — security-header posture per host

| Host | HSTS | CSP | X-Frame-Options | X-Content-Type-Options | Permissions-Policy | Cookie flags | Posture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `olivia.paradox.ai` (product) | `max-age=31536000; includeSubDomains` | **Very detailed, allow-list-based** (see below) | `SAMEORIGIN` (login page: `DENY`) | `nosniff` | present, scoped (`camera=(self)`, `microphone=()`, `geolocation=(self)`, `display-capture=()`) | `csrftoken` (`Secure`, `SameSite=Lax`, no `HttpOnly` — needed client-readable for CSRF double-submit); `_ai_language` (no flags) | **Mature** — strict-dynamic nonce-based script CSP, full permissions-policy, HSTS+subdomains. The best-postured surface in the run. |
| `api.paradox.ai` | not observed on the 403/404 auth-wall responses (no HSTS header returned pre-auth) | none observed | none observed | none observed | none observed | none | Auth-wall responses are bare API-Gateway error bodies; can't grade the authenticated-response posture from outside. |
| `www.paradox.ai` / `paradox.ai` (marketing) | `max-age=31536000` (no `includeSubDomains`) | `frame-ancestors 'self'` only (minimal — Webflow-managed) | `SAMEORIGIN` | not observed | not observed | `_cfuvid` (`HttpOnly`, `Secure`, `SameSite=None`) | Baseline Webflow/Cloudflare defaults — adequate for a marketing site, not comparable to the product app. |
| `careers.paradox.ai` → Workday | mixed (`Workday` sets both `max-age=31536000; includeSubDomains` AND a conflicting `max-age=0` on the same response — a minor Workday-side header hygiene issue, not Paradox's) | none observed | `SAMEORIGIN` (on Workday's page) | `nosniff` (Workday) | — | `AWSALB`/`AWSALBCORS` (Paradox's own ALB, before the external redirect) | N/A — this is Workday's security posture, not Paradox's; noted only because Paradox's own ALB is the first hop. |
| `cdn.olivia.paradox.ai`, `cdn.sites.paradox.ai` (CloudFront+S3 static) | `max-age=31536000; includeSubDomains` | n/a (static asset host) | n/a | n/a | n/a | none | Standard CloudFront defaults. |

## The Olivia app CSP — the gold allow-list (`connect-src` / `script-src` / third-party fold-in)

Captured verbatim from `olivia.paradox.ai/login` (200 response). Full directive text preserved in the Findings section of `_summary.md`; the **`connect-src`** allow-list (the definitive third-party-API + analytics roster) is:

```
connect-src 'self'
  https://www.google.com https://*.googletagmanager.com https://tagmanager.google.com
  https://*.google-analytics.com https://*.analytics.google.com https://maps.googleapis.com
  https://*.pendo.io
  https://cdn.traitify.com https://api.traitify.com
  https://*.linkedin.com https://*.facebook.com
  https://unpkg.com/emoji-mart-vue-fast@15.0.5/data/google.json
  https://cdn.olivia.paradox.ai https://dokumfe7mps0i.cloudfront.net
  https://ai-paradox-prod-use1-mediaservice.s3.us-east-1.amazonaws.com
  https://paradox-prod-use1-sites-static.s3.us-east-1.amazonaws.com
  https://apply-prod-static.s3.us-east-1.amazonaws.com
  https://*.paradox.ai wss://*.paradox.ai;
```

Decoded vendor roster from the CSP alone (independent of the sub-processor PDF — see cross-reference in `_summary.md`):
- **Google**: Analytics, Tag Manager, Maps (`maps.googleapis.com`) — consistent with the sub-processor PDF's "Address validation" line item for Google LLC.
- **Pendo** (`*.pendo.io`) — product analytics; corroborated independently by the `pendo-domain-verification` DNS TXT record.
- **Traitify** (`cdn.traitify.com`, `api.traitify.com`) — personality-assessment vendor; corroborated by the sub-processor PDF's "Woofound, Inc. d/b/a Traitify" entry (confirms Traitify is an **acquired** Paradox product, not just an integration — "support and maintenance exclusively for Traitify Services").
- **LinkedIn**, **Facebook** — social apply/share integrations.
- **`wss://*.paradox.ai`** — confirms the realtime/chat channel is same-origin-domain WebSocket (matches the dedicated `ws.paradox.ai` host found in DNS).
- Three explicitly-named S3 buckets, all `use1` (us-east-1)-tagged: `ai-paradox-prod-use1-mediaservice`, `paradox-prod-use1-sites-static`, `apply-prod-static` — direct confirmation of AWS S3 storage + the naming convention (`prod`/`use1`) used across the product.
- `dokumfe7mps0i.cloudfront.net` — a second, undomained CloudFront distribution ID, also fronting the `use1` static assets (same origin family as `cdn.olivia.paradox.ai`).

**Not present in the CSP:** no `api.openai.com`, no `*.anthropic.com`, no `generativelanguage.googleapis.com` (Gemini API), no `*.azure.com`/`*.openai.azure.com` — i.e. **no client-side/browser-direct call to any named LLM vendor**. This is expected and *not* evidence of "no LLM use" — any LLM call the product makes is brokered **server-side** (via `api.paradox.ai` / `genai.paradox.ai`, both same-origin under the `*.paradox.ai` CSP entry), which is exactly what the sub-processor PDF's "AWS Bedrock, model licensing services" line item independently confirms (see `raw/sub-processors.md`). The CSP and the sub-processor list are **independent methods converging on the same conclusion**: any foundation-model call is broker-hidden, AWS-Bedrock-mediated, never a direct client-side third-party LLM call.
