<!-- source: dig + curl -sI + whois.cymru.com · captured_at: 2026-08-09 · method: dns-ct-fingerprint -->

# Fountain — CDN / cloud fingerprint

## Host → CNAME → IP → ASN → cloud/CDN map

| Host | CNAME chain | IP | ASN / Org | Edge / cloud read |
| --- | --- | --- | --- | --- |
| fountain.com (apex), www, app, api, support, blog, services, internal, trust, tenant-slugs | (Cloudflare-flattened, no CNAME shown) | 104.18.18.164 / 104.18.19.164 | AS13335 CLOUDFLARENET | **Cloudflare** edge/CDN in front of everything on the main zone |
| developer.fountain.com, partners.fountain.com | → `ssl.readmessl.com` | 104.16.241.118 / 104.16.242.118 | AS13335 CLOUDFLARENET | ReadMe.io's own Cloudflare-fronted SSL infra (ReadMe is the docs-portal SaaS vendor) |
| status.fountain.com | → `tp2f5gp8blgc.stspg-customer.com` | 18.155.99.x (4 A records) | AS16509 AMAZON-02 | **Statuspage.io (Atlassian)**, itself hosted on AWS |
| ups-ftp.fountain.com | → `s-07d22442690940fe9.server.transfer.us-east-2.amazonaws.com` | 3.134.159.10 | AWS (us-east-2) | **AWS Transfer Family** (managed SFTP) — direct, unambiguous AWS confirmation |

## Origin-behind-Cloudflare evidence (the load-bearing fingerprint)

Cloudflare fronts nearly the entire `fountain.com` zone, so the **origin** stack has to be read from
response headers that leak past the edge, not from IPs (which are all Cloudflare anycast):

1. **`app.fountain.com` (the SPA) is origin-served from S3.** The 200 response carries
   `x-amz-id-2`, `x-amz-request-id`, `x-amz-server-side-encryption: AES256`, `x-amz-version-id` — this
   is an **S3 static-website/object origin** (likely fronted by Cloudflare acting as the CDN in place of
   or alongside CloudFront) serving the webpack SPA shell. `cf-apo-via: origin,host` confirms Cloudflare
   APO (Automatic Platform Optimization) is active.
2. **`api.fountain.com`, `internal.fountain.com`, and unmapped tenant slugs (`aimbridge`, `doordash`,
   `demo`) all carry Rack/Rails tells** — `x-runtime: 0.00xxxx` (Rack::Runtime middleware) and
   `x-request-id: <uuid>` (Rack::RequestId). `api.fountain.com` 404s with these headers; the tenant
   slugs 301-redirect to `www.fountain.com` with the same signature — a **single Ruby/Rack origin app**
   is doing Host-header-based tenant routing, and unmatched Hosts fall through to a redirect. `internal.
   fountain.com` returns a plain 403 from the same-shaped origin (custom error page, `referrer-policy:
   same-origin`, matches `blog.fountain.com`'s 530 error-page shape) — read as the origin's blocked-host
   handler rather than a distinct "internal" product surface.
3. **`developer.fountain.com` / `partners.fountain.com` → Render.com.** `x-render-origin-server: Render`
   + `rndr-id: <hex>` on both — confirms Discovery's finding. This is **ReadMe.io's own hosting choice**
   (Render.com), not Fountain's — Fountain is a ReadMe customer for its developer-docs portal; the
   `Link: rel="api-catalog"` / `rel="agent-skills"` headers are ReadMe platform features, not
   Fountain-authored infra.
4. **`support.fountain.com` → Intercom-hosted Help Center**, custom-domain-mapped. `x-intercom-version`,
   `x-ami-version` (AWS AMI build id, Intercom's own infra), and a CSP referencing `*.intercom.io`,
   `*.fin.ai` (Intercom's AI product) confirm this is Intercom's hosted product, not a Fountain origin.
5. **`blog.fountain.com` (bare subdomain) is a dangling/misconfigured DNS entry** — HTTP 530
   (Cloudflare's "origin DNS error", akin to error 1016) with `content-length: 17` "plain text" body.
   The **working** blog is at the path `www.fountain.com/blog`, which resolves through Cloudflare to a
   **WordPress / WP Engine** origin: `x-powered-by: WP Engine`, `cf-edge-cache: cache,platform=wordpress`.
   The `blog.fountain.com` subdomain CNAME (if any) is stale — flagged as an open
   question/subdomain-hygiene note (a classic dangling-CNAME shape; **not verified as an actual
   takeover risk** — no ownership claim was attempted, this is read-only recon).
6. **`status.fountain.com` → Statuspage.io (Atlassian), hosted on AWS.** `server: AtlassianEdge`,
   `x-statuspage-version`, asset host `dka575ofm4ao0.cloudfront.net` (**CloudFront** — Statuspage's own
   CDN, AWS-native).
7. **`trust.fountain.com` → Vanta Trust Center**, Cloudflare-fronted, content served from
   `assets.vanta.com` (a client-rendered Vanta widget — `content-location` header points at a
   Vanta-hosted Vite build). Confirms Fountain uses **Vanta** for compliance/SOC2 automation and its
   public trust-report page.
8. **`privacy.fountain.com` → Transcend.io**, Cloudflare-fronted, bootstraps a heavy JS SPA
   (`vendor-transcend-io-penumbra.*.js`, Apollo Client) that preconnects to `api.transcend.io` and
   `prod-backend-company-uploads-transcend-io.s3.amazonaws.com`. Confirms **Transcend** as the
   privacy-policy/consent/DSR-management vendor (page content itself needs JS execution to read —
   recorded as an open question, not fabricated).

## DuploCloud — AWS infra-orchestration tell (from the Vanta trust-center CSP)

`trust.fountain.com`'s CSP `frame-src` allow-list includes:
`https://duploservices-prod01-exports2-415703579972.s3.amazonaws.com`

`duploservices-<env>` is the **default S3-bucket naming convention DuploCloud** (an AWS
infrastructure-orchestration/DevOps-automation SaaS) applies when it provisions resources for a
customer. This is strong, independent evidence that **Fountain's backend runs on AWS, provisioned/
managed via DuploCloud** — corroborated by the AWS Transfer Family endpoint (`ups-ftp`), the
`euw3-ms-nlu.internal` (eu-west-3) host, and the many regional S3 buckets in `app.fountain.com`'s CSP
(`onboardiq-secure-{us-west-1,ap-southeast-1,eu-west-1,sa-east-1}`, `fountain-applicant-uploads.s3.
us-west-1`, `pr-onboardiq-secure-us-west-1` — a PR/staging-prefixed bucket). Note the numeric string is
an AWS account ID surfaced in a public CSP header, not a credential — recorded as a fingerprint value,
not redacted (it identifies an account, not a secret).

## Cloud/CDN summary table

| Layer | Provider | Confidence | Evidence |
| --- | --- | --- | --- |
| Edge / CDN (main zone) | Cloudflare | high | AS13335, `server: cloudflare` on every main-zone response |
| App origin (SPA static assets) | AWS S3 (behind Cloudflare) | high | `x-amz-*` headers on `app.fountain.com` |
| App origin (API / core app) | Ruby/Rack (Rails-shaped) app, likely on AWS (DuploCloud-provisioned) | medium (framework: high; exact host: inferred) | `x-runtime`/`x-request-id` tells + DuploCloud S3 bucket naming + AWS Transfer Family + region-coded internal host |
| Infra orchestration | DuploCloud | medium | `duploservices-prod01-*` S3 bucket in trust-center CSP |
| Docs portal (developer/partners) | ReadMe.io, hosted on Render.com | high | `x-render-origin-server: Render`, CNAME to `ssl.readmessl.com` |
| Support/help center | Intercom (custom-domain-mapped) | high | `x-intercom-version`, Intercom-only CSP |
| Status page | Statuspage.io (Atlassian), on AWS | high | `server: AtlassianEdge`, CNAME to `stspg-customer.com`, CloudFront asset host |
| Blog | WordPress on WP Engine (behind Cloudflare) | high | `x-powered-by: WP Engine`, `cf-edge-cache: platform=wordpress` (only reachable at `/blog` path; `blog.` subdomain is dangling) |
| Trust center | Vanta | high | `assets.vanta.com` content-location, Vanta-only CSP |
| Privacy/consent portal | Transcend.io | high | `vendor-transcend-io-penumbra.js`, `api.transcend.io` preconnect |
