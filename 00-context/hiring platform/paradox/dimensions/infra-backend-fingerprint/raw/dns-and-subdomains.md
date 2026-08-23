<!-- source: dig (default + @1.1.1.1 + @8.8.8.8), crt.sh JSON API · captured_at: 2026-08-09 · method: dns-ct-fingerprint -->

# Paradox — DNS records + certificate-transparency subdomain inventory

## DNS — apex + core hosts (`dig`, default resolver; cross-checked @1.1.1.1 / @8.8.8.8 where noted)

| Host | Type | Value | Note |
| --- | --- | --- | --- |
| `paradox.ai` | NS | `ns-288.awsdns-36.com`, `ns-926.awsdns-51.net`, `ns-1414.awsdns-48.org`, `ns-2043.awsdns-63.co.uk` | **Route53** (AWS-managed DNS) |
| `paradox.ai` | SOA | `ns-1414.awsdns-48.org. awsdns-hostmaster.amazon.com.` | confirms Route53 |
| `paradox.ai` | MX | `10 aspmx.l.google.com`, `20 alt1/alt2.aspmx.l.google.com`, `30 aspmx2/aspmx3.googlemail.com` | **Google Workspace** mail |
| `paradox.ai` | A (301→www) | via Cloudflare | apex redirects to `www.paradox.ai` |
| `www.paradox.ai` | CNAME | `cdn.webflow.com` | marketing site is **Webflow**, fronted by **Cloudflare** |
| `api.paradox.ai` | A (no CNAME — Route53 ALIAS-flattened) | 3 rotating AWS IPs (`3.x`, `52.55.x`, `100.5x.x` — us-east-1 ranges), TTL 21–60s | **AWS API Gateway** custom domain (ALIAS record hides the `execute-api`/regional-APIGW CNAME target — Route53 flattens it to A records) |
| `olivia.paradox.ai` | A | 3 rotating AWS IPs (`54.173.x`, `3.219.x`, `98.90.x`) | candidate/recruiter portal — same-origin front door shared with `chrome.`, `genai.`, `oli.vi` (see below) |
| `careers.paradox.ai` | A | `awselb/2.0` (AWS Classic/ALB ELB) | **redirects to `https://www.workday.com/en-us/company/careers/overview.html`** — see Findings |
| `status.paradox.ai` | CNAME | `6bz6htpnpsgr.stspg-customer.com` → `52.84.205.x` | **Statuspage.io** (Atlassian) |
| `cdn.olivia.paradox.ai` | A | `52.84.205.x` (classic CloudFront range, AS16509) | CloudFront → S3 origin (us-west-2), 403 AccessDenied on `/` |
| `cdn.sites.paradox.ai` | A | `3.160.188.x` (newer CloudFront range, AS16509) | CloudFront, for the "Career Sites" product |
| `ws.paradox.ai` | A | 3 rotating AWS IPs | dedicated WebSocket host (corroborates `deployed-client-bundle`'s Nuxt-runtime-config finding) |
| `genai.paradox.ai` | A | same pool as `olivia.`/`chrome.`/`oli.vi` | **LIVE TODAY** — dedicated GenAI microservice (see Findings) |
| `devsentry.paradox.ai` | CNAME | `k8s.devsentry.paradox.ai` → 3 AWS IPs | self-hosted **Sentry-on-Kubernetes**, still live |
| `oli.vi` | A | same pool as `olivia.`/`chrome.`/`genai.` | first-party branded short-link domain (separate TLD), NS on Route53 (awsdns) — 308 → `https://olivia.paradox.ai/`, `x-robots-tag: noindex, nofollow` |
| `recruiting.ai` | A | **identical IPs** to `chrome.`/`genai.`/`olivia.` | a second, related domain sharing the exact same front-door infra; also covered by the current `api.paradox.ai` TLS cert's SAN (`*.recruiting.ai`) — see cloud-cdn-fingerprint.md |
| `app.paradox.ai`, `mail.paradox.ai`, `staging.paradox.ai`, `docs.paradox.ai`, `developer.paradox.ai` | — | **NXDOMAIN** (no A/CNAME) | confirmed absent, see Open questions / verification below |

## TXT records (`paradox.ai`) — vendor-verification tells

```
v=spf1 include:_spf.google.com include:spf.mandrillapp.com a:dispatch-us.ppe-hosted.com
       include:19546648.spf02.hubspotemail.net include:_spf.psm.knowbe4.com
       include:_spf.atlassian.net ~all
```
Decoded SPF includes: **Google Workspace**, **Mandrill** (Mailchimp Transactional), **Proofpoint Essentials** (`dispatch-us.ppe-hosted.com` — inbound/outbound email security gateway), **HubSpot** (marketing email), **KnowBe4** (`psm.knowbe4.com` — phishing-simulation/security-awareness training, itself sending mail as `paradox.ai`), **Atlassian** (Jira Service Management notification mail).

```
_dmarc.paradox.ai  TXT  "v=DMARC1; p=quarantine; pct=100; sp=quarantine;
                          rua=mailto:dmarc.reports@paradox.ai,mailto:dmarc_agg@vali.email; aspf=r;"
```
DMARC enforced at `quarantine` (not `reject`) — reasonable-but-not-maximal posture.

DKIM selectors: `google._domainkey` (Google Workspace, RSA), `s1`/`s2._domainkey` → CNAME to `*.domainkey.u2162085.wl086.sendgrid.net` (**SendGrid** whitelabel — note SendGrid is Twilio-owned, confirmed as a named sub-processor "Twilio, Inc. (including SendGrid)"), `mandrill._domainkey` present.

Verification TXT tokens present (vendor-naming, values not secrets): `google-site-verification` ×5, `pendo-domain-verification` (**Pendo** product analytics — corroborates `*.pendo.io` seen in the Olivia CSP), `smartsheet-site-validation`, `uber-domain-verification`, `adobe-idp-site-verification` (Adobe SSO/identity), `apple-domain-verification`, `atlassian-domain-verification` ×2 + `atlassian-sending-domain-verification`, `goodnotes-verification`. Four bare/unlabeled tokens (`uq9nd7p3m49n8dl68e1gc77bi0`, `4hulue9eoobf22bop75hgbc3pn`, `_ux3b0fz5ixwi60pzbiinh4kmktfb119`, `ca3-5cb3f6e555e14c9b8a53f41de289d77f`) could not be attributed to a named vendor from the bare string alone — recorded as an open question, not guessed.

## Certificate-transparency sweep (crt.sh)

`curl 'https://crt.sh/?q=%25.paradox.ai&output=json'` — **first attempt timed out (matches Discovery's report); crt.sh's backend is flaky (PL/pgSQL "conflict with recovery" / intermittent 404/502 from its own reverse proxy), not actually blocking.** Succeeded on the 3rd distinct retry using `curl --retry 5 --retry-delay 10 --retry-all-errors --max-time 90`, returning **4205 logged certificates spanning 2017-09-29 → 2024-06-13**, deduped to **333 unique DNS names**.

**Cert-issuance cutoff explained (verified, not guessed):** no new individually-named certs appear after 2024-06-13, even though the domain is very much alive today. A live `openssl s_client` probe against `olivia.paradox.ai` / `api.paradox.ai` today shows the current cert is issued by **Amazon (`CN=Amazon RSA 2048 M01/M04`, i.e. AWS ACM)** with SAN **`*.paradox.ai` (+ `paradox.ai`)**, and the `api.paradox.ai` cert's SAN additionally covers **`*.recruiting.ai`**. This confirms Paradox **migrated from per-host/per-environment Let's Encrypt certs (issuer mix: 2616× `R3`, 598× `E1`, 158× the old `Let's Encrypt Authority X3` — almost certainly a Kubernetes `cert-manager` issuing one cert per Ingress host) to a single shared AWS-ACM wildcard cert** sometime after mid-2024 — a real infra-hardening/consolidation event, not a sign the underlying hosts were torn down. (Cloudflare-issued certs — 330× `Cloudflare Inc RSA CA-2`, 324× `...ECC CA-3` — belong to the separately-hosted `www.paradox.ai` Webflow site.)

### Subdomain inventory, categorized (333 unique names → grouped; full list retained in scratchpad, digested here per size discipline)

**Public-facing, currently resolving (confirmed live):**
`www.paradox.ai`, `paradox.ai`, `olivia.paradox.ai`, `www.olivia.paradox.ai`, `api.paradox.ai`, `status.paradox.ai`, `careers.paradox.ai`, `cdn.olivia.paradox.ai`, `cdn.sites.paradox.ai`, `ws.paradox.ai`, `genai.paradox.ai`, `devsentry.paradox.ai`, `chrome.paradox.ai` (HTTP 418 direct — see cloud-cdn-fingerprint.md), `email.paradox.ai`, `info.paradox.ai`, `news.paradox.ai`.

**Per-customer tenant subdomains** (pattern: `<customer>.paradox.ai` / `<customer>api.paradox.ai` / `api-k8s.<customer>.paradox.ai` / `chrome.<customer>.paradox.ai` / `<customer>status.paradox.ai` / `job.<customer>.paradox.ai`, each white-labeling the Olivia portal per enterprise client) — **named customers found that are NOT in the recon-plan's website-derived logo list**: `aramark` (Aramark), `darden` (Darden Restaurants), `fedex` (FedEx, + a separate `fedexstg` staging tenant), `lockheed` (Lockheed Martin), `lowes` (Lowe's, + `lowesstg`), `pepsi` (PepsiCo), `regis` (Regis Corp — **independently corroborated**: `deployed-client-bundle`'s distribution-artifacts fold-in found an Android white-label bundle ID `ai.paradox.regis`), `unilever` (Unilever), `prudential` (Prudential Financial, + `prudential-prod`), `visiting-angels` (Visiting Angels home-care franchise), `advantage` (plausibly Advantage Solutions), `birddoghr` (a distinct branded tenant — `birddoghr.paradox.ai`/`birddoghrapi`/`birddoghrdemo`/`birddoghrstatus` — pattern strongly resembles an **acquired product line** being run on Paradox's own multi-tenant infra rather than a customer; **not independently confirmed as an acquisition — flagged as an open question, not asserted**). Also present: `sodexo` (matches the known Sodexo logo).

**Legacy/unclear branded status-page hosts** (each only a `<name>status.paradox.ai` entry, no matching `<name>api`/`<name>chrome` siblings): `smashflystatus.paradox.ai` (62 certs 2023-05→2023-09), `lucistatus.paradox.ai` (90 certs 2023-12→2024-05). Neither "SmashFly" nor "Luci" is otherwise attested anywhere else in this run — **open question**, plausibly decommissioned white-label tenants or internal codenames, not confirmed.

**The Rasa → GenAI evolution (the highest-value finding — see _summary.md Inferences):** `devrasa.paradox.ai`, `devrasaapi.paradox.ai`, `geo.devrasa.paradox.ai`, `rasa-k8s.dev.paradox.ai`, `rasa-k8s.dev.proxy.paradox.ai` (last cert 2024-03-22, **NXDOMAIN today across 3 resolvers — default, @1.1.1.1, @8.8.8.8, with SOA-authority confirmation, not just a single miss**) vs. `genai.paradox.ai`/`genai.dev/dev2/dev3/stg/test/ltsstg.paradox.ai` (**`genai.paradox.ai` resolves and serves live today** — `server: uvicorn`, see cloud-cdn-fingerprint.md).

**Internal tooling (named, all confirmed NXDOMAIN today across 3 resolvers — publicly delisted, not necessarily decommissioned; likely moved to a private/split-horizon zone):** `argocd.paradox.ai` (ArgoCD — GitOps CD), `rancher.paradox.ai` (Rancher — K8s fleet mgmt), `grafana.paradox.ai` + `grafana.dev.paradox.ai` (observability), `drone.paradox.ai` / `droneai.paradox.ai` (Drone CI), `jenkins.teleport.paradox.ai` (Jenkins, behind Teleport), `teleport.paradox.ai` + `intvpn.paradox.ai` (zero-trust access broker + internal VPN), `sonarqubetest.paradox.ai` (static analysis), `vault.olivia.use1.paradox.ai` (HashiCorp Vault — secrets mgmt; `use1` = us-east-1 naming convention), `privatebin.paradox.ai` / `privatebindev` / `privatebinold` (self-hosted encrypted pastebin for internal secret-sharing).

**"Career Sites" product infrastructure (per-tenant static-site provisioning):** `sites.paradox.ai` + `sites.{dev,dev2,dev3,stg,test,ltsstg}.paradox.ai` + `preview.sites.*` for every environment, plus clearly ad-hoc QA-provisioned tenant names (`6577.sites.stg`, `asd1211.sites.dev2`, `somerandomname23142390.sites.dev2`, `test3265.sites.dev2`, `uiui.sites.test`) — confirms a genuine multi-tenant website-builder product behind the "Conversational Career Sites" marketing name, not just a template.

**Environments:** `dev`, `dev2`, `dev3`, `stg`, `stgent` (staging-enterprise?), `test`, `ltsstg` (load-test staging), `load`/`loadapi` (dedicated load-testing), plus a full **`eu1`** environment family (`eu1.paradox.ai`, `analytics.eu1`, `api-k8s.eu1`, `chrome.eu1`, `olivia.eu1`, `job.eu1`, `stg.eu1`, `public-feeds.eu1`) — confirms a genuine **separate EU-region deployment** (data-residency/GDPR posture), not just multi-AZ within one region.

**Other named products/surfaces:** `assistant.paradox.ai` / `assistantapi.paradox.ai` / `myassistant.paradox.ai` (a distinct "Assistant" brand, separate from "Olivia" — recruiter-facing?), `webhook.paradox.ai` + `webhook.dev` + `webhook.eu1` (inbound webhook ingestion — integration architecture), `scrape.dev.paradox.ai` / `scrape.test.paradox.ai` (a scraping microservice — likely job-listing ingestion for the ATS/career-site product), `custom.paradox.ai` (plausible customer-custom-domain CNAME target), `login.labs.paradox.ai` / `login.labsdev.paradox.ai` ("Paradox Labs" — R&D/innovation sandbox), `store.paradox.ai`, `proposals.paradox.ai` (sales tooling), `public-feeds.eu1.paradox.ai` (job-feed export, e.g. to Indeed/Google-for-Jobs).

**Confirmed absent, historically AND today** — a genuine, decisive negative: grepping all 333 CT-logged names (spanning 2017–2024) for `doc`, `developer`, `swagger`, `openapi`, `graphql`, `mcp`, `spec.` returns **zero matches**. Paradox has never — in 9 years of publicly-logged TLS certificates — stood up a `docs.`/`developer.` subdomain or any spec/API-portal host. This is a decisive negative (not a single-probe miss): there was never a decommissioned dev-docs effort visible in CT.

## Verification of absences (ingestion §7 rule 10 compliance)

Every "NXDOMAIN" claim above for a host a sibling dimension might expect to be live (`docs.`, `developer.`, `argocd.`, `rasa-k8s.dev.`, `grafana.`, `vault.olivia.use1.`, `teleport.`, `rancher.`, `drone.`, `intvpn.`) was re-checked via **3 independent resolvers** (system default, `@1.1.1.1`, `@8.8.8.8`) and, for `argocd.paradox.ai` and `rasa-k8s.dev.paradox.ai`, an explicit full `dig` confirming an authoritative **NXDOMAIN** response (status: NXDOMAIN, AUTHORITY: the zone's own SOA record) rather than a resolver-level timeout/empty answer. No HTTP probe was needed for these since there is no A/AAAA record at all to connect to.
