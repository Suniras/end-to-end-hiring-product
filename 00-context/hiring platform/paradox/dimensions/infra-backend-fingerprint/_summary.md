---
dimension: infra-backend-fingerprint
target: paradox
status: complete
access_grade_used: runtime:reachable
method: dns-ct-fingerprint
completeness_pct: 85
confidence: medium
captured_at: 2026-08-09
sources:
  - "dig (default resolver + @1.1.1.1 + @8.8.8.8) against paradox.ai, www/api/olivia/careers/status/cdn.olivia/cdn.sites/ws/genai/devsentry.paradox.ai, oli.vi, recruiting.ai"
  - "whois -h whois.cymru.com (ASN lookups on ~9 distinct IPs)"
  - "curl -sI/-sIL against api.paradox.ai, olivia.paradox.ai, www.paradox.ai, paradox.ai, careers.paradox.ai, genai.paradox.ai, chrome.paradox.ai, cdn.olivia.paradox.ai, dokumfe7mps0i.cloudfront.net"
  - "openssl s_client against olivia.paradox.ai, api.paradox.ai (current cert issuer + SAN)"
  - "https://crt.sh/?q=%25.paradox.ai&output=json (succeeded on 3rd retry with curl --retry 5 --retry-delay 10 --retry-all-errors --max-time 90; 4205 certs, 2017-09-29 to 2024-06-13, 333 unique names)"
  - "https://www.paradox.ai/security"
  - "https://www.paradox.ai/legal/subprocessors + linked PDF (Paradox Subprocessor List, dated 8-5-2026)"
  - "https://www.paradox.ai/fraud + https://www.paradox.ai/legal/fraud"
gaps:
  - "CORRECTED BY MODE-5 ITERATION 2 — the crt.sh `%.paradox.ai` dataset behind the '333 unique names' census is SILENTLY TRUNCATED at 2024-06-13 (zero names carry a cert issued after that date, yet a per-host query for readme.paradox.ai returns 2026 certs). The census is a 2017→mid-2024 floor, NOT a 9-year complete inventory. Two claims originally written here as fact were overstated and are now withdrawn/rescoped in Findings §4: (a) 'no developer-docs subdomain ever' — refuted by readme.paradox.ai; (b) 'no individually-named cert after 2024-06-13' — an artifact of the query. Any absence claim from this dataset must be re-checked with a per-host crt.sh query before being stated as fact."
  - "AWS Bedrock line item in the sub-processor list names the licensing mechanism, not the specific underlying foundation model(s) actually provisioned (could be Anthropic Claude, Amazon Nova/Titan, Llama, or several) — this run has no way to pin the exact model without an authenticated session probing genai.paradox.ai's request/response shape."
  - "Historical DNS-CNAME chain for api.paradox.ai before Route53-ALIAS-flattening (i.e. whether it's a regional API-Gateway custom domain or sits behind an internal NLB) could not be directly observed — inferred from the absence of CloudFront headers + the regional-IP-rotation pattern, not a verbatim CNAME read."
  - "4 unlabeled DNS TXT verification tokens (uq9nd7p3m49n8dl68e1gc77bi0, 4hulue9eoobf22bop75hgbc3pn, _ux3b0fz5ixwi60pzbiinh4kmktfb119, ca3-5cb3f6e555e14c9b8a53f41de289d77f) could not be attributed to a named vendor."
  - "'birddoghr', 'smashfly', and 'luci' branded subdomains (CT-logged) could not be confirmed as acquisitions vs. legacy customer tenants vs. internal codenames — flagged as open questions, not asserted as fact."
  - "Internal-tool hosts (argocd/rancher/grafana/vault/teleport/drone/intvpn) are confirmed publicly-delisted (NXDOMAIN across 3 resolvers with SOA-authority confirmation) but this cannot distinguish 'moved to private/split-horizon DNS' from 'genuinely decommissioned' — recorded as absent-from-public-DNS, not decommissioned."
  - "No authenticated session was available this run (auth:none) to confirm any of the above via an actual wire capture — every finding here is external/inferred, per this dimension's medium-confidence method."
---

# Paradox — infra-backend-fingerprint capture

## Method

Ran the full `dns-ct-fingerprint` playbook against `paradox.ai` and its confirmed-live hosts
(`api.paradox.ai`, `olivia.paradox.ai`, `careers.paradox.ai`, `status.paradox.ai`, `www.paradox.ai`)
plus every host the cert-transparency sweep and sibling dimensions (`deployed-client-bundle`'s Nuxt
runtime-config and its distribution-artifacts App-Store-screenshot fold-in) surfaced.

1. **DNS** — `dig` for A/AAAA/MX/NS/TXT/SOA/CNAME on the apex + ~15 named hosts, cross-checked against
   `@1.1.1.1` and `@8.8.8.8` wherever a result mattered for an absence claim (ingestion §7 rule 10).
2. **Cert-transparency sweep** — `crt.sh`'s JSON API timed out / 502'd / 404'd on the first four attempts
   (matches Discovery's report — crt.sh's own backend is flaky, confirmed by its own PL/pgSQL "conflict
   with recovery" error page, not a block on this query). **Succeeded on retry #5** using
   `curl --retry 5 --retry-delay 10 --retry-all-errors --max-time 90`, returning 4205 logged certs across
   2017–2024, deduped to 333 unique DNS names.
3. **Cloud/CDN fingerprint** — ASN lookups (`whois.cymru.com`) on every distinct IP seen; header
   evidence (`x-amzn-*`, `x-amz-cf-*`, `cf-ray`, `server:`) per host; a live `openssl s_client` pull of
   the *current* TLS cert on two hosts to reconcile against the CT-log cutoff (see Findings).
4. **Security headers** — `curl -sI`/`-sIL` on the product app, the marketing site, and the CDN hosts;
   the Olivia app's CSP `connect-src` was read in full as the third-party/vendor allow-list.
5. **Sub-processor fold-in** — `/security` (crawl-clip), `/legal/subprocessors` (which links out to a
   PDF, fetched and read directly), and `/fraud` + `/legal/fraud` per the task's specific instruction.

## Findings

### 1. `api.paradox.ai` is definitively AWS API Gateway, regional (no CDN in front), origin = gunicorn/Python

```
x-amzn-requestid, x-amzn-errortype: MissingAuthenticationTokenException, x-amz-apigw-id
```
are the literal AWS-API-Gateway fingerprint (not inferred). A 404 on a nonexistent path additionally
surfaces `x-amzn-remapped-server: gunicorn` — API Gateway echoing the origin's own `Server:` header —
**naming the backend as a Python/WSGI (gunicorn) process**, independently corroborating the `codebase`
dimension's `scim2-models` PyPI finding. No `via:`/`x-cache:`/`x-amz-cf-id` on this host — this is a
**regional** API Gateway custom domain, not CloudFront-fronted (contrast with the CDN hosts below, which
show the full CloudFront header set).

### 2. The Rasa → GenAI evolution — the answer to "is Olivia an LLM wrapper or legacy NLU?"

Three independent signals converge:

- **CT-log history**: `devrasa.paradox.ai` / `devrasaapi.paradox.ai` / `geo.devrasa.paradox.ai` /
  `rasa-k8s.dev.paradox.ai` (Rasa — the leading pre-LLM, intent-classification open-source NLU
  framework, deployed on Kubernetes) were certificate-logged 2023-09 through 2024-03, and are
  **confirmed NXDOMAIN today** (3-resolver + SOA-authority verified).
- Simultaneously, a **`genai.*` host family** (`genai.paradox.ai` + `genai.{dev,dev2,dev3,stg,test,
  ltsstg}.paradox.ai`) appears in the same CT window (first logged 2024-03) and — critically —
  **`genai.paradox.ai` is live and serving today**, fronted by `server: uvicorn` (a Python ASGI
  server — the FastAPI/Starlette signature), architecturally distinct from the older sync gunicorn/WSGI
  main API.
- **The sub-processor PDF (dated 2026-08-05, four days before this capture)** lists Amazon Web Services'
  processing scope as including **"AWS Bedrock, model licensing services"** — a direct, current,
  first-party disclosure of licensed-foundation-model usage.

**Read together: Paradox appears to have run a Rasa-based intent-classification NLU system (consistent
with its 2016 founding, pre-dating the LLM era) at least through early 2024, and to have since stood up
a dedicated, still-live, AWS-Bedrock-backed GenAI microservice.** This is presented as a well-corroborated
**inference** (three independent methods, none of them a direct session/wire observation of an actual
model call) — not a directly-observed fact. No specific model (Claude / Nova / Llama / etc.) is named
anywhere; Bedrock abstracts that. The CSP `connect-src` on the live app **never** names a third-party LLM
host (no `api.openai.com`, `*.anthropic.com`, `generativelanguage.googleapis.com`) — consistent with
model calls being server-brokered through `genai.paradox.ai`/`api.paradox.ai`, never client-direct.

### 3. Sub-processor list — the full vendor stack (verbatim, see `raw/sub-processors.md`)

| Category | Vendor(s) |
| --- | --- |
| Cloud/hosting + AI model licensing | **Amazon Web Services** (incl. **AWS Bedrock**) |
| Secondary AI/ML vendor | **Google LLC** (NLP, semantic matching, translation, OCR, address validation, "Talent solutions") |
| Communications | **Twilio, Inc. (including SendGrid)** — email + SMS |
| Data warehouse | **Snowflake, Inc.** |
| Support/ticketing | **Atlassian**, **Salesforce (incl. Slack)**, **Helpjuice** |
| Resume/JD parsing | **Textkernel US LLC, DBA Sovren** |
| Embedded tax/payroll | **Symmetry Software Corporation** |
| Integration plumbing | **Merge API, Inc.** |
| Implementation partners | **Cielo, Inc.**, **The Cloud Connectors, Inc.** |
| Acquired product | **Woofound, Inc. d/b/a Traitify** (personality assessment) |
| Deep formal partner (24 legal entities, every region) | **Workday** |

No payment processor is named (consistent with enterprise-contract B2B sales, no self-serve billing).

### 4. Cert-transparency subdomain sweep (333 unique names, 2017–2024) — see `raw/dns-and-subdomains.md` for the full categorized inventory

- **New enterprise customers not in the recon plan's known-logo list**: Aramark, Darden Restaurants,
  FedEx, Lockheed Martin, Lowe's, PepsiCo, Regis Corp (**independently corroborated** by
  `deployed-client-bundle`'s Android bundle-ID find `ai.paradox.regis`), Unilever, Prudential Financial,
  Visiting Angels — each with its own white-labeled tenant subdomain family
  (`<name>.paradox.ai`/`<name>api`/`api-k8s.<name>`/`chrome.<name>`/`<name>status`).
- **Internal tooling named via CT** (all publicly NXDOMAIN today, 3-resolver-confirmed): ArgoCD, Rancher,
  Grafana, Drone CI, Jenkins-behind-Teleport, SonarQube, HashiCorp Vault, PrivateBin — a mature,
  Kubernetes-centric internal platform (`api-k8s.*`/`app-k8s.*`/`job-k8s.*`/`media-k8s.*` naming
  convention appears across dozens of hosts).
- **A genuine separate EU-region deployment** (`eu1.paradox.ai` + a full parallel host family) — a
  data-residency/GDPR posture beyond simple multi-AZ.
- **A distinct "Career Sites" multi-tenant static-site product** (`sites.paradox.ai` + per-environment/
  ad-hoc-QA-tenant subdomains), and a distinct **"Assistant"** brand (`assistant.paradox.ai`,
  `myassistant.paradox.ai`) separate from "Olivia."
- **Narrow negative (CORRECTED by Mode-5 iteration 2 — was overstated here):** grepping all 333
  historical CT names for `doc|developer|swagger|openapi|graphql|mcp|spec.` returns **zero matches**.
  This capture originally rendered that as "Paradox has never stood up a developer-docs/API-spec
  subdomain, publicly, at any point." **That absolute form is refuted and is withdrawn.** Two independent
  refutations: (a) the sibling `api` dimension found a real, actively-maintained **API Developer Hub at
  `readme.paradox.ai`** (a `*.paradox.ai` subdomain, CNAME → `paradox-*.readmessl.com`, ReadMe.io-hosted);
  (b) a targeted re-query of `crt.sh?q=readme.paradox.ai` returns **live CT entries issued 2026-07-12
  (Google Trust Services)** — i.e. the host *is* certificate-logged. It was missed for two compounding
  reasons: the grep pattern contained no `readme|hub|portal|reference` term, **and** the `%.paradox.ai`
  wildcard dataset used here is **silently truncated** (see the next bullet). **The surviving, correct
  claim:** no `docs.` / `developer.` / `swagger.` / `openapi.` / `graphql.` host has ever been CT-logged,
  and the developer hub that does exist is **third-party-hosted and invisible to subdomain enumeration**
  — reachable only by following an on-page link from `/partners/integrations`.
- **The 333-name CT census is truncated at 2024-06-13 — treat it as a 2017→mid-2024 census, not a 9-year
  one (CORRECTED by Mode-5 iteration 2).** The `%.paradox.ai` query returns 4205 rows / 333 names with a
  `not_before` range of 2017-09-29 → 2024-06-13 and **zero** names bearing a cert issued after that date —
  yet a direct single-host query (`readme.paradox.ai`) returns 2026 certs for a name inside that same
  wildcard. The cutoff is therefore substantially an artifact of the crt.sh wildcard query, **not** purely
  a real issuance event. What survives as observed: the *current* cert on `olivia`/`api` is a single
  AWS-ACM wildcard `*.paradox.ai` (+ `*.recruiting.ai` on `api.paradox.ai`), verified live via
  `openssl s_client`. What is **withdrawn** as an inference: "no individually-named cert exists after
  2024-06-13" and the strong reading of a dated Let's-Encrypt→ACM *consolidation event*. Paradox's own
  ACM wildcard is real; a per-host cert issued by a third-party SaaS on a Paradox subdomain (ReadMe.io)
  demonstrably still occurs. **Any absence claim resting on this dataset is bounded to 2017→2024-06 and
  must be re-checked with a per-host query before being stated as fact.**
- **`recruiting.ai`** is a second, related domain, resolving to the identical front-door IP pool as
  `olivia`/`chrome`/`genai`.paradox.ai and covered by `api.paradox.ai`'s current cert SAN.
- **`oli.vi`** is a first-party branded URL-shortener (308 → `olivia.paradox.ai`, `noindex,nofollow`),
  independently named by `distribution-artifacts`' App-Store-screenshot fold-in and confirmed live here.

### 5. Fraud page (verbatim in `raw/sub-processors.md`)

Confirmed live and confirmed to be about **Paradox's own hiring pipeline being impersonated by generic
recruitment scammers** on job-posting sites (not about Olivia being weaponized against clients'
candidates). A real, if modest, threat-model finding — most SaaS vendors in adjacent categories don't
carry a dedicated public fraud-disclaimer page; Paradox judged its own brand-impersonation risk (or
observed volume) high enough to warrant one.

## Inferences

- **Backend is polyglot Python**, split across at least two runtime generations: an older sync
  gunicorn/WSGI (likely Django, given the `csrftoken` cookie forwarded through the Nuxt SSR layer, and
  the `scim2-models` PyPI package from `codebase`) monolith serving `api.paradox.ai`, and a newer async
  uvicorn/ASGI (likely FastAPI) microservice serving `genai.paradox.ai`. **Inference**, corroborated by
  two independent header observations plus one sibling-dimension package finding.
- **Kubernetes is the deployment substrate** for most production services (`*-k8s.*` naming convention
  across api/app/job/media/rasa, plus ArgoCD/Rancher/Grafana/Drone internal tooling all named via CT).
  **Inference** from naming conventions + tooling roster, not a direct cluster observation.
- **Olivia evolved from a Rasa-based NLU system to an AWS-Bedrock-backed GenAI microservice**, likely
  around early-to-mid 2024. **Inference**, corroborated by three independent signals (CT-log host-family
  transition, live header fingerprint on `genai.paradox.ai`, and the current sub-processor disclosure) —
  this is the single most load-bearing inference in this dimension and should be evaluated as
  cross-dimension-corroborated-medium in the rollups, not promoted to fact absent a session-level model
  call observation.
- **No self-serve public developer program has ever existed** — **fact, but on narrower evidence than
  originally claimed here** (corrected by Mode-5 iteration 2). The load-bearing evidence is *not* the CT
  negative (that dataset is truncated at 2024-06 and missed `readme.paradox.ai` entirely). It is the
  `api` dimension's direct observation of the hub itself: partner-API credentials are issued by a **human
  integrations team**, there is no signup form, and no rate-limit/quota surface exists across all 55
  portal pages (api: `raw/endpoint-catalog.md` · openapi-verbatim · high). A **developer-docs surface does
  exist** (`readme.paradox.ai`); what has never existed is a **self-serve** one.
- **The Workday relationship is a formal, deep sub-processor partnership**, not just an ATS-integration
  page. **Inference** from the sub-processor PDF's ~24-entity Workday roster + the `careers.paradox.ai`
  → workday.com redirect observed independently.

## Open questions

- Which specific foundation model(s) does Paradox provision via AWS Bedrock? Not disclosed anywhere
  public; would require an authenticated session capturing an actual `genai.paradox.ai` request/response.
- Are `birddoghr.paradox.ai`, `smashflystatus.paradox.ai`, and `lucistatus.paradox.ai` acquisitions,
  legacy white-label customer tenants, or internal codenames? Not confirmed by any source in this run.
- Are the internal-tool hosts (ArgoCD/Rancher/Grafana/Vault/Teleport/Drone) genuinely decommissioned, or
  moved to a private/split-horizon DNS zone invisible to public resolvers? Cannot be distinguished
  externally.
- What are the four unlabeled DNS TXT verification tokens for?

## Artifacts

- `raw/dns-and-subdomains.md` — full DNS record dump + the categorized 333-name CT-log subdomain
  inventory + absence-verification detail.
- `raw/cloud-cdn-fingerprint.md` — per-host IP→ASN→cloud/CDN mapping with header evidence.
- `raw/security-headers.md` — per-host header posture table + the full Olivia CSP `connect-src` allow-list.
- `raw/sub-processors.md` — verbatim sub-processor table (Security/Trust/Subprocessors/Fraud pages).
