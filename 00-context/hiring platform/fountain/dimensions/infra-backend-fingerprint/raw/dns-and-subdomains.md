<!-- source: dig (system resolver + @1.1.1.1 + @8.8.8.8) · captured_at: 2026-08-09 · method: dns-ct-fingerprint -->

# Fountain — DNS records + subdomain inventory

## Apex DNS (`fountain.com`)

| Type | Value |
| --- | --- |
| A | 104.18.18.164, 104.18.19.164 (Cloudflare anycast) |
| AAAA | 2606:4700::6812:12a4, 2606:4700::6812:13a4 |
| NS | ernest.ns.cloudflare.com, dee.ns.cloudflare.com |
| SOA | dee.ns.cloudflare.com. dns.cloudflare.com. serial 2411748555 |
| MX | 1 aspmx.l.google.com; 5 alt1/alt2.aspmx.l.google.com; 10 alt3/alt4.aspmx.l.google.com — **Google Workspace** |

## TXT records (verification tells + SPF) — vendor-naming

```
v=spf1 include:_spf.google.com include:email.chargebee.com include:mktomail.com
       include:_spf.salesforce.com include:sent-via.netsuite.com include:spf.mailjet.com -all
MS=ms22349215
MS=ms96733179
anthropic-domain-verification-8b8te9=<redacted-token>
apple-domain-verification=<redacted-token>
atlassian-domain-verification=<redacted-token>
bird-domain-verification=<redacted-token>
cursor-domain-verification-dk4q2h=<redacted-token>
facebook-domain-verification=<redacted-token>
google-site-verification=<redacted-token>  (x6, distinct tokens — multiple GSuite/GA/Search-Console properties)
klaviyo-site-verification=<redacted-token>
linear-domain-verification=<redacted-token>
miro-verification=<redacted-token>
mongodb-site-verification=<redacted-token>
notion_verify_<redacted>
reachdesk-verification=<redacted-token>
rippling-domain-verification=<redacted-token>
1password-site-verification=<redacted-token>
"ALIAS for fountain.com.herokudns.com"   <-- unusual: a TXT record literally describing a historical
                                              CNAME-flattening ALIAS to Heroku's DNS, see Inferences
```

**Vendor tells decoded:** Google Workspace (MX+SPF+MS=), Microsoft (`MS=` x2 — Microsoft 365/Entra domain
verification), **Anthropic** (Claude enterprise/org domain verification), Apple (Business Manager or
Sign-in-with-Apple), Atlassian (could be Jira/Confluence internal, or is the same org that owns
Statuspage), Bird/MessageBird (CPaaS — SMS/WhatsApp candidate messaging is plausible for a hiring
product), Cursor (AI coding editor — engineering-culture signal, not product-facing), Facebook/Meta
Business, Klaviyo (marketing email), Linear (issue tracker), Miro (whiteboard), MongoDB (Atlas org
domain verification — a NoSQL datastore signal), Notion (internal docs), Reachdesk (corporate gifting —
sales/marketing), Rippling (internal HRIS — Fountain's own employee HR platform, ironic for a hiring
company), 1Password (internal vault), Chargebee/Salesforce/NetSuite/Mailjet (SPF includes — billing,
CRM, ERP, transactional email — back-office stack, not customer-facing).

**`herokudns.com` TXT — historical-infra tell.** This record only makes sense as a leftover from a prior
Heroku ALIAS/CNAME-flattening record at the apex — the zone has since moved to Cloudflare (current
NS/SOA), but a stale TXT artifact survived the migration. **Inference, not confirmed**: Fountain's origin
may have run on Heroku before moving off (to AWS, per the DuploCloud/S3/AWS-Transfer-Family evidence in
`cloud-cdn-fingerprint.md`). Open question — could also be an artifact of a DNS-migration tool that
never fully cleaned up.

## Second-resolver verification (contract §7 rule 10)

| Host | Default resolver | @1.1.1.1 | @8.8.8.8 | Verdict |
| --- | --- | --- | --- | --- |
| staging.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | absent (confirmed 2 resolvers) — but see CT list below, many numbered staging-use-NN hosts DO exist |
| dev.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | absent |
| admin.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | absent |
| vault.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | absent |
| grafana.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | absent |
| mail.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | absent (MX handles mail, no web host needed) |
| internal.fountain.com | **resolves** (104.18.18.164/.19.164) | resolves | resolves | **present** — a deliberately configured DNS record (confirmed NOT a wildcard, see below), origin returns HTTP 403 |
| uat.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | CT-leaked but currently decommissioned/dormant |
| workbrightstorage.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | CT-leaked but currently decommissioned/dormant |
| wxp-01.fountain.com | NXDOMAIN | NXDOMAIN | NXDOMAIN | CT-leaked but currently decommissioned/dormant |
| euro-dsp / ap-1 / eu-1.fountain.com | resolve | resolve | resolve | present, region-sharded hosts |

**Wildcard-DNS control test:** `zzz-nonexistent-probe-12345.fountain.com` returned **no** A/CNAME record
on any resolver and no HTTP response — confirming `fountain.com` does **not** run wildcard DNS. Every
resolving subdomain (including `internal.fountain.com`) is therefore a deliberately provisioned record,
not DNS-wildcard noise.

## Certificate-transparency subdomain inventory

Discovery's crt.sh probe timed out; **retried 3x here (still 502/404 from crt.sh's own backend — a
known flaky endpoint, not a block)**, then **fell back to the CertSpotter CT-log mirror**
(`api.certspotter.com`) as the second method per contract §7 rule 10 — this returned 200 with 43,962
bytes covering `*.fountain.com` issuances. 144 unique `dns_names` values recovered (deduped, wildcards
noted). This is dramatically richer than Discovery's cheap probe and is the single richest finding of
this dimension.

### Full deduped list (144 entries; `*.` wildcard entries collapsed with their bare form)

**Marketing/docs/app/support (already known):** fountain.com, www (via apex cert)

**Per-tenant / per-customer subdomains (named enterprise customers — genuinely sensitive, treat as a
finding not a leak-and-publish item; all are already public via CT logs, this is not new exposure):**
`aimbridge`, `amazon-na`, `amazon-us`, `ms-amazon-portal`, `brandsafway`, `ceracare`, `doordash`,
`ontrac`, `staples` — each also has a paired `sandbox.<tenant>` host (`sandbox.aimbridge`,
`sandbox.amazon-mm`, `sandbox.amazon-na`, `sandbox.brandsafway`, `sandbox.doordash`, `sandbox.ontrac`,
`sandbox.staples`). This directly corroborates Discovery's hypothesis: Fountain runs a **per-tenant
subdomain model** with a **parallel sandbox environment per named enterprise customer**. Amazon appears
under three distinct subdomains (`amazon-na`, `amazon-us`, `ms-amazon-portal`, `sandbox.amazon-mm`,
`sandbox.amazon-na`) — suggesting Amazon is a large, multi-region, multi-business-unit Fountain customer.

**Region-sharded infra hosts:** `us-2`, `us-3`, `us-4`, `eu-1`, `ap-1`, `euro-dsp` — multi-region
deployment (US/EU/APAC), consistent with data-residency requirements for an HR/hiring SaaS.

**`euw3-ms-nlu.internal.fountain.com`** — decodes as **eu-west-3 (Paris, AWS region code) — microservice
— NLU (Natural Language Understanding)**, under the `internal.` zone. Strong evidence of an **in-house
NLU microservice** hosted on AWS eu-west-3, independent of any third-party LLM API. Relevant to the
"AI Agents" hypothesis: some AI-labeled functionality may be classic in-house NLU/ML, not solely an LLM
wrapper — see `sub-processors.md` for the LLM-vendor angle.

**LaunchDarkly self-hosted relay proxies (multi-region):** `ld-production-aps1`, `ld-production-euc1`,
`ld-production-use1`, `ld-production-use2`, `ld-staging-use1` — decode as ap-southeast-1, eu-central-1,
us-east-1 (x2), staging-use-east-1. A company self-hosting a LaunchDarkly Relay Proxy under its own
domain per-region (rather than calling `app.launchdarkly.com` directly) is an infra-maturity signal
(ad-blocker resilience + reduced third-party dependency for flag evaluation).

**Pre-prod / test fleet (large):** `demo`, `dev-01`, `perf-01` (performance testing), `faut-01/02/03`
(functional-automation-test, inferred), `staging.fountain.com` (bare, CT-only — absent per second
resolver, dormant), `staging-use-01` through `staging-use-30` (~22 of 30 numbers actually issued —
sparse numbering, large staging fleet, likely per-team/per-feature-branch environments; `staging-use-01`
DNS-resolves and returns a Cloudflare-fronted 404), `uat.fountain.com` + `uat-01` (dormant/absent, see
resolver table), `wxp-01` through `wxp-15` + `wxp-staging` (unidentified — "wxp" possibly "Workflow/Web
eXPerience" — a distinct environment fleet of 15+ numbered hosts; `wxp-01` DNS-absent on both resolvers,
likely decommissioned naming scheme).

**Feature/vertical-specific:** `hiring-events.fountain.com` (resolves, redirect-tell not probed),
`transport-jobs.fountain.com` (resolves — plausibly a DoorDash/logistics-vertical microsite, unconfirmed),
`workbrightstorage.fountain.com` (CT-only, DNS-absent — "WorkBright" is a third-party I-9/onboarding
compliance vendor; this could be a decommissioned integration-storage bucket alias, or a vestige of a
partnership — open question), `ups-ftp.fountain.com` (**resolves**, CNAME →
`s-07d22442690940fe9.server.transfer.us-east-2.amazonaws.com` — a live **AWS Transfer Family** managed
SFTP endpoint in us-east-2, almost certainly for exchanging UPS-related HR/logistics data files).

### Selected live-host probe results (HTTP, read-only HEAD requests)

| Host | HTTP | Notable headers | Read |
| --- | --- | --- | --- |
| aimbridge.fountain.com | 301 → https://www.fountain.com | `x-request-id` (Rack/Rails tell), NO `server: cloudflare` line | tenant slug currently unmapped → app-level catch-all redirect to marketing site |
| doordash.fountain.com | 301 → https://www.fountain.com | same Rack tell | same |
| demo.fountain.com | 301 → https://www.fountain.com | same Rack tell | same |
| staging-use-01.fountain.com | 404 | `server: cloudflare`, `cf-cache-status: DYNAMIC` | Cloudflare-fronted, origin 404s (empty/decommissioned slot, still alive at the edge) |
| ld-production-use1.fountain.com | 404 | `cf-cache-status: DYNAMIC`, `content-length: 19` plain-text | plausibly the LD relay proxy's own bare 404 (unconfirmed) |
| uat.fountain.com | no response (DNS absent) | — | dormant |

**Read:** the 301-with-Rack-tell response on unmapped tenant slugs (`aimbridge`, `doordash`, `demo`) is
the **same backend framework signature** seen on `api.fountain.com` and `internal.fountain.com`
(`x-runtime` / `x-request-id` — classic Rack middleware headers) — corroborates a **Ruby/Rails (or Rack-
compatible) origin app** doing Host-header-based tenant routing, independent of the Cloudflare edge.

## `raw/dns-and-subdomains.md` sourcing note

Primary CT source: `api.certspotter.com/v1/issuances?domain=fountain.com&include_subdomains=true&expand=dns_names`
(200, 43,962 bytes). crt.sh itself returned `502 Bad Gateway` (nginx) on 3 attempts across ~2 minutes
with backoff — recorded as a flaky-endpoint gap, not treated as "no CT data available."
