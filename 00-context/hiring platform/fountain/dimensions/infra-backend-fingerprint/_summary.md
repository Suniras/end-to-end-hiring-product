---
dimension: infra-backend-fingerprint
target: fountain
status: complete
access_grade_used: runtime:reachable
method: dns-ct-fingerprint
completeness_pct: 80
confidence: medium
captured_at: 2026-08-09
sources:
  [
    "dig fountain.com (A/AAAA/MX/NS/TXT/SOA) + ~30 candidate subdomains, system resolver + @1.1.1.1 + @8.8.8.8",
    "https://crt.sh/?q=%25.fountain.com&output=json (3 attempts, all 502 — flaky, recorded not blocking)",
    "https://api.certspotter.com/v1/issuances?domain=fountain.com&include_subdomains=true&expand=dns_names (200, fallback CT source, 144 unique dns_names)",
    "whois.cymru.com ASN lookups for 104.18.18.164 / 104.16.241.118 / 18.155.99.45",
    "curl -sI against fountain.com, www, app, api, developer, partners, support, blog(+/blog path), services, internal, trust, status",
    "https://www.fountain.com/security",
    "https://www.fountain.com/ethical-ai",
    "https://www.fountain.com/trust (404)",
    "https://www.fountain.com/legal (404)",
    "https://www.fountain.com/privacy (redirect) + https://privacy.fountain.com (Transcend SPA shell)",
    "https://trust.fountain.com (Vanta SPA shell + CSP header)",
  ]
gaps:
  [
    "crt.sh's own JSON endpoint 502'd on all 3 attempts — worked around with the CertSpotter CT mirror, which delivered a fuller result (144 hosts) than a single crt.sh query typically would; crt.sh itself never confirmed reachable this run",
    "Vanta Trust Center (trust.fountain.com) and Transcend privacy policy (privacy.fountain.com) are both client-rendered SPAs — page bodies (the actual named sub-processor list, SOC2/ISO27001/GDPR certification detail) were not retrievable via static WebFetch/curl; recovered vendor names indirectly via their CSP headers instead, but the certification-detail text itself is an open question",
    "Security Whitepaper PDF (linked from /security) not fetched",
    "whether Anna/Emma/Sam/Cue call Anthropic specifically (vs in-house NLU vs another vendor) is unresolved — the Anthropic domain-verification TXT record is suggestive, not conclusive",
    "gist.build and Vouch (vouch.us) integrations unidentified in purpose",
    "blog.fountain.com bare-subdomain dangling-CNAME state not further investigated (read-only recon; no ownership/takeover probe attempted)",
  ]
---

# Fountain — infra-backend-fingerprint capture

## Method

Ran the full `dig`-based DNS sweep (A/AAAA/MX/NS/TXT/SOA on the apex, plus ~30 candidate/guessed
subdomains) against the system resolver, then re-verified every negative and every unusual positive
against `@1.1.1.1` and `@8.8.8.8` per contract §7 rule 10. Re-attempted the crt.sh JSON query 3 times
(with backoff) after Discovery's timeout — crt.sh's own backend returned `502 Bad Gateway` (nginx) on
every attempt, a genuinely flaky endpoint rather than a block — and fell back to the CertSpotter CT-log
mirror (`api.certspotter.com`), which returned a full result: 144 unique `dns_names` entries across every
certificate issued for `*.fountain.com` since mid-2025. Cross-referenced select CT-leaked hosts with
direct `dig`/`curl -sI` probes (including a wildcard-DNS control test to rule out DNS-wildcard noise).
Mapped every live host's IP to ASN via `whois.cymru.com`. Fetched the marketing site's `/security` and
`/ethical-ai` pages directly; the `/trust` and `/legal` paths 404'd (the real Trust Center lives at
`trust.fountain.com`, a Vanta-powered page; the real privacy policy at `privacy.fountain.com`, a
Transcend-powered page) — both are heavy client-rendered SPAs whose page bodies weren't retrievable via
static fetch, so vendor names were recovered instead from their **CSP response headers**, which name
every allow-listed third-party host verbatim. The richest single artifact was `app.fountain.com`'s own
(report-only) CSP, captured via a plain `curl -sI`, which enumerates ~35 distinct third-party hosts.

## Findings

### DNS / subdomains

Apex is Cloudflare-DNS-hosted (NS: `ernest`/`dee`.ns.cloudflare.com), Google-Workspace-mailed (MX to
`aspmx.l.google.com`). The apex TXT records carry **21 distinct verification/SPF entries** naming
Google, Microsoft, **Anthropic**, Apple, Atlassian, Bird/MessageBird, Cursor, Facebook, Klaviyo, Linear,
Miro, MongoDB, Notion, Reachdesk, Rippling, 1Password, plus an SPF include-list naming Chargebee,
Salesforce, NetSuite, Mailjet. A stray TXT record (`"ALIAS for fountain.com.herokudns.com"`) is a
likely-historical artifact of a prior Heroku-hosted apex, now migrated to Cloudflare.

The CertSpotter CT-log fallback recovered **144 unique subdomains** — the single richest finding of this
run. Highlights: a **per-tenant subdomain model with paired sandbox environments** for named enterprise
customers (`aimbridge`, `amazon-na`/`amazon-us`/`ms-amazon-portal`, `brandsafway`, `ceracare`,
`doordash`, `ontrac`, `staples`, each with a `sandbox.<tenant>` twin) — directly confirming Discovery's
"Tenant API URLs" hypothesis and naming Amazon, DoorDash, Staples, BrandSafway as (former-or-current)
Fountain customers; a large pre-prod fleet (`staging-use-01` through `-30`, `uat`/`uat-01`, `demo`,
`dev-01`, `perf-01`, `wxp-01`–`15`); multi-region infra hosts (`us-2/3/4`, `eu-1`, `ap-1`, `euro-dsp`);
self-hosted **LaunchDarkly relay proxies** in 4 regions (`ld-production-{aps1,euc1,use1,use2}` +
`ld-staging-use1`); and `euw3-ms-nlu.internal.fountain.com` — an in-house **NLU microservice on AWS
eu-west-3**. `ups-ftp.fountain.com` is a **live AWS Transfer Family** (managed SFTP) endpoint. Three
CT-leaked hosts (`uat`, `workbrightstorage`, `wxp-01`) were confirmed absent on two independent resolvers
(dormant/decommissioned, not a resolver fluke). `internal.fountain.com` resolves and returns HTTP 403 —
confirmed NOT a DNS-wildcard artifact via a nonsense-subdomain control probe, so it's a deliberately
provisioned (if blocked) host.

### Cloud / CDN

Cloudflare (AS13335) fronts essentially the whole zone. Behind it: `app.fountain.com` (the SPA) is
origin-served from **AWS S3** (`x-amz-*` headers); `api.fountain.com` / `internal.fountain.com` /
unmapped tenant slugs all carry **Rack/Rails tells** (`x-runtime`, `x-request-id`) — one Ruby/Rack origin
app doing Host-header tenant routing, redirecting unmapped tenant Hosts to `www.fountain.com`.
`developer.fountain.com`/`partners.fountain.com` confirm Discovery's Render.com finding (that's ReadMe
.io's own hosting choice as a vendor, not Fountain's infra). `support.fountain.com` is an Intercom-hosted
Help Center. `blog.fountain.com` (bare subdomain) is a dangling/misconfigured Cloudflare entry (530); the
working blog lives at `www.fountain.com/blog`, WordPress-on-WP-Engine. `status.fountain.com` is
Statuspage.io/Atlassian, itself AWS-hosted. `trust.fountain.com` is Vanta; `privacy.fountain.com` is
Transcend. A `duploservices-prod01-*` S3 bucket named in the Vanta trust-center CSP is a strong tell that
**DuploCloud** (an AWS infra-orchestration SaaS) provisions Fountain's AWS footprint — corroborated
independently by the AWS Transfer Family endpoint and the eu-west-3-coded internal NLU host.

### Security headers

HSTS is strong and preloaded everywhere first-party. `app.fountain.com` ships a **comprehensive but
report-only** CSP (not yet enforcing) listing ~35 third-party hosts across `script-src`/`connect-src`/
`media-src` — `img-src`/`frame-src` are wildcard-open even in the drafted policy. No app-level session
cookie was observed via unauthenticated HEAD probes (only Cloudflare's own `__cf_bm` bot-management
cookie) — expected without a login.

### Sub-processor / vendor stack

The `/security` and `/ethical-ai` marketing pages **name no specific vendor** — no cloud provider, no
AI/LLM vendor, no certification, stated explicitly on-page. The Vanta Trust Center and Transcend privacy
pages are both JS-rendered and their bodies weren't recoverable via static fetch. The vendor stack was
instead reconstructed from **CSP headers** (machine-emitted, verbatim, high-confidence for presence even
though the pages' prose is unreachable): Stripe, Cronofy, Pusher (4-region), Merge.dev, VONQ, CameraTag,
NimbleCapture, OneSchema, Vanta, Transcend, Vouch (unclear fit), Bird/MessageBird, Chameleon, LeanData,
Intercom+Fin.ai, Zendesk, OneSignal, Customer.io, Appcues, FullStory, Datadog, Google Analytics, Heap.
**The headline finding for the "AI Agents" hypothesis: an `anthropic-domain-verification` TXT record on
the apex zone** — direct, first-party evidence of an organizational Anthropic relationship, the single
most concrete named-AI-vendor signal found across every surface probed. It is suggestive, not
conclusive, that the customer-facing agents (Anna/Emma/Sam/Cue) run on Claude specifically. Independently,
`browserbase.com` + `*.onkernel.com` (headless-browser/agent-sandbox infra vendors) appear in the
trust-center CSP — a genuine agentic-tooling signal regardless of LLM vendor — and the
`euw3-ms-nlu.internal.fountain.com` host suggests at least some "AI" functionality is classic in-house
NLU, not an LLM call at all.

## Inferences

- **Origin cloud: AWS** (inference from S3 origin headers + AWS Transfer Family + DuploCloud bucket
  naming + region-coded internal host — no single artifact is a verbatim "we run on AWS" statement, but
  four independent signals converge).
- **Edge/CDN: Cloudflare** (fact — ASN + headers on every main-zone response).
- **Core app framework: Ruby/Rack (Rails-shaped)** (inference from `x-runtime`/`x-request-id` header
  pair — a strong but not 100%-certain framework tell; a `session` dimension observing the same headers
  on an authenticated response, or a `deployed-client-bundle` string-mine finding Rails-specific asset
  fingerprints, would promote this to fact per the evaluation tiebreaker rule).
- **Email: Google Workspace** (fact — MX + SPF).
- **Docs-portal vendor: ReadMe.io, hosted on Render.com** (fact, corroborating Discovery).
- **AI vendor: Anthropic relationship confirmed at the org level (fact); product-agent LLM attribution
  is inference, not fact** — flagged for `deployed-client-bundle`/`session` follow-up (grep the SPA
  bundle for `anthropic`/`claude`/`openai` literals; a `session` dimension exercising Anna/Emma would be
  the strongest confirmation but this run has no authorized session).
- **Multi-tenant SaaS with per-customer subdomains + full sandbox parity** (fact, from CT — this is a
  genuine architecture finding, not an inference).
- **Backend-maturity read:** the CSP-report-only-not-enforced posture, the very large numbered
  staging/wxp fleet, the self-hosted multi-region LaunchDarkly relay, and the DuploCloud-orchestrated
  AWS footprint together read as a **mature, release-engineering-heavy organization mid-way through a
  security hardening rollout** (CSP measured before enforced) rather than either a scrappy startup or a
  fully locked-down enterprise posture.

## Open questions

- Explicit sub-processor list + SOC2/ISO27001/GDPR certification detail (gated behind the
  JS-rendered Vanta/Transcend pages and an unfetched Security Whitepaper PDF).
- Whether Anna/Emma/Sam/Cue are Anthropic-Claude-orchestrated, in-house-NLU-driven, or both.
- Purpose of `gist-queue-consumer-api.cloud.gist.build` and the Vouch (`vouch.us`) integration.
- `blog.fountain.com` bare-subdomain dangling-CNAME state — not investigated beyond noting it 530s (no
  ownership/takeover probe attempted; read-only recon only).
- `web.fountain.com` appears only once, as a CSP `frame-ancestors` value on `app.fountain.com` — no
  DNS record found for it in either the CT sweep or direct `dig`; likely a legacy/internal alias.

## Artifacts

- `raw/dns-and-subdomains.md` — full `dig` output, TXT-record vendor decode, the 144-host CT inventory
  (CertSpotter, since crt.sh 502'd 3x), second-resolver absence verification, wildcard-DNS control test.
- `raw/cloud-cdn-fingerprint.md` — host→CNAME→IP→ASN→cloud map, the Rack/Rails origin-framework
  evidence, the DuploCloud/AWS orchestration tell, per-vendor-hosted-surface breakdown.
- `raw/security-headers.md` — per-host header table + the full `app.fountain.com` report-only CSP
  allow-list (the richest single artifact).
- `raw/sub-processors.md` — the vendor-stack table recovered from CSP headers + TXT records (since the
  Vanta/Transcend page bodies weren't fetchable), including the Anthropic domain-verification finding.
