<!-- source: curl -I / dig / whois.cymru.com / openssl s_client · captured_at: 2026-08-09 · method: dns-ct-fingerprint -->

# Paradox — CDN / cloud fingerprint (host → IP → ASN → cloud, with header evidence)

## `api.paradox.ai` — AWS API Gateway, confirmed definitively, no CDN in front

```
GET https://api.paradox.ai/  → HTTP/2 403
content-type: application/json
content-length: 0
x-amzn-requestid: c714fd6e-c1fb-4897-a8f0-f98c0a1dc72f
x-amzn-errortype: MissingAuthenticationTokenException
x-amz-apigw-id: B1YJ1F_GIAMEegw=
```
body: `{"message":"Missing Authentication Token"}`

`x-amzn-requestid` + `x-amzn-errortype` + `x-amz-apigw-id` together are the **unambiguous, literal AWS-API-Gateway response fingerprint** — this is not inferred, it's the service naming itself. There is **no CloudFront in front of this custom domain**: no `via:`, no `x-cache:`, no `x-amz-cf-id`/`x-amz-cf-pop` on this host (contrast with `cdn.olivia.paradox.ai` below, which shows all four) — `api.paradox.ai` is a **regional** API Gateway custom domain (Route53 ALIAS, not a CloudFront-fronted edge-optimized one).

**A second request to a nonexistent path reveals the origin behind the gateway:**
```
GET https://api.paradox.ai/foo → HTTP/2 404
x-amzn-remapped-server: gunicorn
x-amzn-remapped-content-length: 4
x-amzn-remapped-date: ...
vary: Accept-Language, origin
content-language: en
```
The `x-amzn-remapped-*` header family appears when API Gateway proxies a response and remaps a conflicting header name — `x-amzn-remapped-server: gunicorn` is API Gateway **echoing the origin's own `Server: gunicorn` header**. **Gunicorn is a Python WSGI server** — this directly names the backend framework family as Python/WSGI (Django or Flask), most likely fronted by an ALB/VPC-Link or Lambda-to-container integration rather than pure Lambda (gunicorn doesn't run inside a bare Lambda function; it's a persistent process, consistent with the `api-k8s.*` / `app-k8s.*` Kubernetes-hosted-service naming pattern found across dozens of CT-logged hostnames — see dns-and-subdomains.md). This corroborates the `codebase` dimension's `scim2-models` (Python/PyPI) finding independently.

**Current TLS cert on `api.paradox.ai`:**
```
issuer: C=US, O=Amazon, CN=Amazon RSA 2048 M01   (AWS Certificate Manager)
subject: CN=*.paradox.ai
SAN: DNS:*.paradox.ai, DNS:*.recruiting.ai
notBefore: 2026-07-16   notAfter: 2027-01-29
```
The SAN also covering **`*.recruiting.ai`** is new information: `recruiting.ai` resolves to the exact same IP pool as `olivia.paradox.ai`/`chrome.paradox.ai`/`genai.paradox.ai` — a second, related domain sharing Paradox's front-door infra (see dns-and-subdomains.md).

## `olivia.paradox.ai` / `chrome.paradox.ai` / `genai.paradox.ai` / `oli.vi` / `recruiting.ai` — one shared front-door IP pool

All five hosts resolve to the same rotating 3-IP AWS pool (`54.173.28.157`, `3.219.38.142`, `98.90.46.68` at time of capture; TTL ≤60s, consistent with an ALB or NLB target group). ASN lookups (`whois -h whois.cymru.com`) on every IP observed across this run return **AS14618 AMAZON-AES** (compute/ELB) or **AS16509 AMAZON-02** (CloudFront edge) — both Amazon, confirming a 100% AWS us-east-1-centric origin stack with no third-party cloud (no GCP/Azure IP ranges seen anywhere).

| Host | Behavior |
| --- | --- |
| `olivia.paradox.ai` | 302 → `/login`; sets `csrftoken` cookie (**Django tell** — `csrftoken` is Django's literal default CSRF cookie name) even though the served shell is a Nuxt 3/Vue 3 SPA — the SSR render synchronously calls a Django backend and forwards its cookie |
| `chrome.paradox.ai` | direct hit (no Host-routing context) → **HTTP 418 "I'm a teapot"** — a deliberate block/decoy response for bare requests without proper tenant routing |
| `genai.paradox.ai` | **HTTP 404**, `server: uvicorn`, `content-type: application/json` — **uvicorn is a Python ASGI server (the FastAPI/Starlette signature)**. This is a *different* server stack from the gunicorn/WSGI main API — confirms Paradox runs the GenAI service as a **separate, modern async Python microservice**, architecturally distinct from the older sync WSGI monolith. |
| `oli.vi` | 308 → `https://olivia.paradox.ai/`, `x-robots-tag: noindex, nofollow` — first-party branded short-link domain (used for interview-scheduling links per an App Store screenshot found by `distribution-artifacts`) |
| `recruiting.ai` | same IP pool, not independently probed further this run (no distinguishing content requested) |

## `cdn.olivia.paradox.ai` / `dokumfe7mps0i.cloudfront.net` — CloudFront + S3

```
HTTP/2 403, content-type: application/xml, server: AmazonS3
x-amz-bucket-region: us-west-2
x-cache: Error from cloudfront
via: 1.1 <hash>.cloudfront.net (CloudFront)
x-amz-cf-pop: BLR50-P3
```
Textbook CloudFront-in-front-of-private-S3 fingerprint (`x-amz-bucket-region`, `x-cache`, `via`, `x-amz-cf-pop`, `x-amz-cf-id` — all four CloudFront tells present, unlike `api.paradox.ai`). Origin bucket region is **us-west-2**, distinct from the primary compute region (us-east-1, per the S3 bucket names embedded in Olivia's CSP: `ai-paradox-prod-use1-mediaservice`, `paradox-prod-use1-sites-static`, `apply-prod-static` — all explicitly `use1`-tagged). `cdn.sites.paradox.ai` is the equivalent CloudFront distribution for the "Career Sites" product (3.160.188.0/23, AS16509).

## `careers.paradox.ai` — Paradox's *own* careers page redirects to Workday

```
HTTP/2 301, server: awselb/2.0 → location: https://workday.com:443/careers
  → HTTP/1.0 301 (Server: Workday) → https://www.workday.com/careers
  → HTTP/2 301 → http://www.workday.com/en-us/company/careers/overview.html
  → HTTP/2 200 (Server: Apache, via CloudFront, AWSALB/AWSALBCORS cookies)
```
Paradox terminates the redirect chain on its **own** AWS ALB (`awselb/2.0`, TLS on `careers.paradox.ai`) before handing off to `workday.com`. This means Paradox itself runs its own hiring/careers page **on Workday** — a real, if minor, finding: Paradox's own internal HR/recruiting stack uses Workday (independently corroborated by the sub-processor PDF's long list of "Workday Entities" as formal GDPR sub-processors — see raw/sub-processors.md — meaning the Workday relationship is deep enough that Workday entities process client personal data on Paradox's behalf, i.e. a joint-integration/co-sell relationship, not just Paradox-the-company using Workday as its own HRIS).

## `www.paradox.ai` / `paradox.ai` — Cloudflare-fronted Webflow

```
HTTP/2 200, server: cloudflare, cf-ray: a286a3e73a653c13-BLR, cf-cache-status: HIT
link: <https://cdn.prod.website-files.com>; rel=preconnect ...
x-wf-region: us-east-1        (Webflow's own region header)
```
Marketing site is **Webflow** (`cdn.prod.website-files.com`), fronted by **Cloudflare** (`cf-ray`, `cf-cache-status`, `server: cloudflare`, `alt-svc: h3`). Entirely separate stack from the product (app/api) infrastructure — standard marketing-site-on-a-website-builder pattern, unrelated to the AWS product backend.

## Summary table

| Surface | Cloud/CDN | Evidence |
| --- | --- | --- |
| `api.paradox.ai` (product REST API) | AWS API Gateway (regional, no CDN), origin = gunicorn (Python/WSGI), likely K8s-hosted | `x-amzn-requestid`/`x-amz-apigw-id`/`x-amzn-errortype`; `x-amzn-remapped-server: gunicorn` |
| `olivia.paradox.ai` (product frontend) | AWS (ALB/NLB pool), Nuxt 3 SSR fronting a Django backend | `csrftoken` cookie on first response |
| `genai.paradox.ai` (GenAI microservice) | AWS, uvicorn/ASGI (Python, likely FastAPI) | `server: uvicorn` |
| `cdn.olivia.paradox.ai`, `cdn.sites.paradox.ai` | CloudFront + S3 (us-west-2 origin bucket for Olivia CDN) | full CloudFront header set |
| `careers.paradox.ai` | AWS ALB → external redirect to Workday | `awselb/2.0` → workday.com |
| `www.paradox.ai` | Cloudflare + Webflow | `cf-ray`, `x-wf-region` |
| `status.paradox.ai` | Statuspage.io (Atlassian) | CNAME `stspg-customer.com` |
