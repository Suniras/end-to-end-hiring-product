# Fountain — Competitive Positioning

> Cross-dimension rollup (Mode 3). Every claim is anchored to its source dimension + provenance
> `(dimension: artifact · method · confidence)`. Weighting per `evaluation.md`: max-of-sources,
> promotion only on ≥2 *independent* dimensions, single-source rendered tentative, conflicts flagged.
>
> **Run-level caps that bind this doc (stated once):**
> - **No authenticated session was run** (`session: status: absent`, `write_side_observed: false`,
>   `pass2: not-applicable` · inferred · high). Feature *existence and gating* are well-evidenced from
>   `docs`/`api`/`deployed-client-bundle`; feature *execution behavior* — what Anna, Emma, Sam and Cue
>   actually do when they run — is **unobserved by every dimension in this run** and stays tentative
>   wherever it appears below.
> - **`website` and `docs` are not independent for feature claims** (docs restate marketing). Where a
>   claim rests only on those two, it is one source, not two.

---

## Positioning

**The pitch, verbatim** (`website: raw/home-and-positioning.md` · crawl-clip · medium):

> "Fountain is the AI-powered Superintelligence that sources, hires, and runs your frontline operations
> across every location, 24/7."
>
> "Powered by Frontline Superintelligence — The agentic operating system for the frontline workforce."

The same company describes itself, on its own recruiter-role page, in one plain line: **"An ATS for
hiring hourly workers"** (`website: raw/home-and-positioning.md`, `/role/recruiters` · crawl-clip ·
medium). The distance between those two sentences is the whole positioning story for this target.

**Category and ICP.** Multi-location, high-volume, hourly/frontline employers — explicitly not salaried
corporate hiring. 11 named industry verticals (Retail, Manufacturing, Logistics, Hospitality, Grocery,
Healthcare, Delivery, Food & Beverage, Professional Services, Franchises, PE Firms) and 7 buyer roles
(Hiring Managers, TA, HRIS, Recruiters, CHRO, Operations, DEIB) (`website:
raw/industries-roles-and-icp.md` · crawl-clip · medium). Founded 2014 on the thesis that "most applicant
tracking systems aren't built for [hourly workers]" (`website: raw/home-and-positioning.md`). Legal
entity is **OnboardIQ, Inc.**, a Delaware corporation — Fountain is the trade name
(`website: raw/trust-security-ethics-legal.md` · crawl-clip + 2 independent third-party corroborations ·
high). That predecessor name is still load-bearing inside production: the `X-OBIQ-SIGNATURE-V2` webhook
header, the `connecting-a-custom-form-to-the-onboardiq-applicant-portal` doc slug, the Intercom
help-center workspace id `onboardingiq` (`docs: raw/help-center.md` + `raw/webhooks.md` · crawl-clip ·
medium-high), and a regionally-sharded S3 bucket fleet literally named "OnboardIQ" for candidate
onboarding documents (`deployed-client-bundle: raw/bundle-map.md` · source-map-reassembly · high).
Counted per the independence rule (and consistently with `technology-architecture.md` §6 /
`data-model-api-surface.md`): the three docs-corpus tells are **one** source (same artifact), the S3
bucket naming is a **second, independent** lane, and the Delaware registry is corroboration —
**two independent lanes plus the registry ⇒ fact.**

**The claimed platform architecture** ("Frontline OS", four layers: Applications → Automation →
Intelligence → Agentic, all orchestrated by "Fountain Copilot, the super agent") and the marketed scale
numbers (91M+ applicants processed, 14M+ hires, 75+ countries, "50+ integrations out of the box")
(`website: raw/home-and-positioning.md` · crawl-clip · medium) are **single-source marketing** — no
dimension in this run can verify a throughput number, and no dimension contradicts one either.

**The product suite as actually shipped on the marketing site** is broader than the six-module nav
suggests: Source, Pool (CRM), Hire (ATS), Onboard, Shift, plus Assist, Reach, Compliance, I-9 Center,
Referrals, Communicate, Pulse (`website: raw/products.md` · crawl-clip · medium). **Assist is not
software** — it is a managed/RPO-style sourcing service with a human team, billed per hire. That matters
competitively: Fountain partly competes as an outsourced-recruiting alternative, not purely as a tool.

### Positioning-layer over-claims (each traced, each flagged)

| # | Claim | What the run found | Severity |
| --- | --- | --- | --- |
| 1 | "AI-powered Superintelligence" / "agentic" throughout | **UPDATED (Mode-5 it. 1) — the claim splits into a disclosure finding (still standing) and a verification finding (now closed).** **(a) Disclosure — still true, and now the actual finding:** no LLM or foundation-model vendor is named anywhere on the site — no GPT/Claude/Gemini/Llama, not even the generic term "large language model" (`website: raw/ai-agents-and-cue.md` · crawl-clip · medium). Fountain does not tell customers whose models it runs. **(b) Verification — partly closed:** the shipped `wx-copilot.umd.js` micro-frontend carries a verbatim model-selection enum, **`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`** (the exact AWS Bedrock cross-region inference-profile convention), inside an `llmProvider: enum(["openai","anthropic","anthropic_direct"])` config schema (`deployed-client-bundle: raw/wx-micro-frontends.md` §2c · bundle-string-mine · medium) — **⇒ fact (declared configuration): Cue's shipped client declares Claude-on-Bedrock inside a multi-provider LLM schema.** **RE-GRADED (Mode-5 it. 3, defect E2):** the apex `anthropic-domain-verification` TXT record (`infra-backend-fingerprint: raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium) is an **org-level signal only** and is **not** counted as a second independent lane — so **"Cue *runs on* Claude" stays tentative**, not fact (the schema default is `openai`; no inference call was observed). A live `fountain-data-mcp` MCP tool server (direct read-only probe · high) independently corroborates the agentic plumbing. **Three limits:** this covers **Cue only** — `euw3-ms-nlu.internal.fountain.com` plus the intent-model chatbot API still say **Emma** is classic in-house NLU; **which provider serves a production request is unobserved**; and the *behaviour* the marketing sells (autonomy, "runs your frontline operations", quality) remains unobserved. | med (down from high) — the **mechanism** behind the 2026 repositioning is now confirmed real, so "it's a relabeled rules engine" is off the table for Cue. What is still over-claimed is **autonomy** (the shipped shape is draft → test → human-publish) and, separately, **non-disclosure**: an AI-hiring vendor selling "Superintelligence" to compliance-sensitive enterprise buyers while naming no model vendor on any security, ethical-AI or trust page is a governance-transparency gap, not a capability gap |
| 2 | "SOC 2 certified" (stated on `/hire` and `/onboard`) | **Unverified — not refuted.** *(Reconciled Mode-5 it. 2 to match `product-features.md` #4 verbatim; this cell previously read "most likely a badge-image clipping gap," which (a) is speculation with no supporting evidence and (b) contradicted row 3 below, where the identical crawl-gap explanation is explicitly rejected because the pages were fully readable.)* The dedicated `/security` page's extracted text **never says SOC 2** — only "third-party security audits" (`website: raw/trust-security-ethics-legal.md` · crawl-clip · medium) — and `infra` independently confirms that `/security` and `/ethical-ai` **name no certification and no vendor at all** (`infra-backend-fingerprint: raw/sub-processors.md` · dns-ct-fingerprint · medium). **Two lanes agree the dedicated pages are certification-free.** The real Trust Center (`trust.fountain.com`) is a **Vanta**-powered JS-gated SPA whose certification detail neither dimension could recover; Vanta's presence corroborates *"runs a formal compliance program"*, **not** *"holds a SOC 2 Type II."* Genuinely open — do not treat the badge as verified, and do not assume a capture artifact either. | low–med (open, two lanes of negative evidence on the dedicated pages) |
| 3 | Compliance-framework alignment (EEOC / GDPR / **ISO 42001**) | Appears on exactly **one** page — `/agentic-ai`. The dedicated `/ethical-ai` page, where one would expect it, names **zero** frameworks and is entirely qualitative (no algorithmic specifics, no validation methodology, no audit cadence, no named third-party bias auditor). Both pages were fully readable, so this is a real documentation inconsistency, not a crawl gap (`website: raw/trust-security-ethics-legal.md` · crawl-clip · medium). | med — for an AI-hiring vendor, the governance page being the *thinnest* page is a substantive tell |
| 4 | Fountain Reach: "3x more applicants — **without job boards or paid ads**" | The same page says it reaches candidates via "**Meta, Google and more**." Meta and Google ads are paid ads. Self-contradicting copy on a single page (`website: raw/ai-agents-and-cue.md` · crawl-clip · medium). | low — marketing sloppiness, but it is a factual self-contradiction |
| 5 | The three homepage trust badges, displayed at equal visual weight | Traced to source (`community: raw/review-badges-traced.md` · crawl-clip · medium): **G2 "High Performer Fall 2023"** — the underlying G2 profile is real and live (4.3/5, 126 reviews) but the badge asset is pinned to Fall 2023, ~2.5 years stale across ~8+ quarterly refresh cycles. **"Rectec Certified Partner"** — Rectec is a UK ATS **vendor directory** with a fee-free vendor-onboarding certification, not a review ranking. **"Software Suggest High Performer"** — traced to a page showing **exactly 1 review** (5/5, Nov 2023) behind a "Winter 2025" badge. | med — a genuine, verified pattern: the weakest evidentiary base is presented with the same weight as the strongest |
| 6 | "Mobile-first" | **No native mobile app exists on either store, no browser extension, no installable PWA** — a clean 4-way negative sweep across iOS, Google Play (3 query variants each), Chrome Web Store, Firefox AMO, plus a page-source/manifest/service-worker/bundle-grep check on `app.fountain.com` where the `/manifest.json` and `/sw.js` 200s were confirmed SPA-shell false positives by content-type (`distribution-artifacts: raw/store-and-pwa-sweep.md` · binary-extract · high). But the SPA route table carries a verbatim comment naming a "LEGACY … Fountain Mobile App … only accessible by GlobalDrawer in mobile app" (`deployed-client-bundle: raw/route-table.md` · source-map-reassembly · high). **Both are direct observations at equal method confidence, so neither overrides the other — FLAGGED, not resolved** (a store-only sweep cannot see a retired, unlisted, or MDM/enterprise-distributed client, nor the separate "Fountain Go" surface). What *is* safe to state: **"mobile-first" is a responsive-web claim, not a public-distribution claim.** | med — real marketing/product gap on public distribution; the legacy-client question stays open |
| 7 | Third-party aggregator claim: "Fountain was acquired by Porch Group, June 5, 2025" | **Refuted.** Uncorroborated by any primary source and directly contradicted by Fountain's own 2026 newsroom, which continues to publish independent-company product launches — including the April 2026 Cue launch with its own named C-suite exec, and a July 2026 named-customer win (`website: raw/trust-security-ethics-legal.md` · crawl-clip · medium; corroborated by `community: raw/changelog-digest.md` press-release stream · crawl-clip · medium). Two independent dimensions observe an actively independent company. **Recorded so no later run re-trusts the aggregator.** | n/a — flagged as false |

One genuinely creditable counterweight to the over-claim list: Fountain **commissioned and published its
own survey admitting 62% of applicants report being "ghosted,"** with the top complaints being lack of
communication and unexplained AI screening rejections (`community: raw/issue-themes.md` +
`raw/changelog-digest.md` · crawl-clip · medium). Publishing the category's trust problem in your own
name is a real positioning move, not a soft one. Whether Fountain's stated mitigations (explainable
scoring, opt-in human review, full logging) are implemented as described is **unverified** — it would
take a session.

---

## Pricing & packaging

**No pricing is disclosed anywhere on fountain.com. Verified across 6+ distinct locations, not one page**
(`website: raw/pricing.md` · crawl-clip · medium): the guessed `/pricing` URL (resolves, but serves a
"book a one-to-one chat" form), the main nav (no Pricing item at all — Solutions / Use Cases / Resources
/ Company / Sign In), `/learn-more`, the India-localized landing page, `/signup` and `/signup-apac`, and
the Assist product page. Every commercial path terminates in a sales-assisted demo/quote flow. The
Master Subscription Agreement (`privacy.fountain.com`, a Transcend-hosted SPA) is JS-gated and its fee
schema was not recoverable — recorded as a gap.

**What the packaging model looks like, assembled from four independent signals:**

| Signal | Source | What it implies |
| --- | --- | --- |
| Demo-form copy: "pricing tailored to your **customized product suite**" | `website: raw/pricing.md` · crawl-clip · medium | **Modular, per-product-line negotiated pricing** — Source / Pool / Hire / Onboard / Shift / Compliance / I-9 each licensable |
| Assist advertises "**Transparent per-hire pricing**" + "No upfront costs" (no rate given) | `website: raw/pricing.md` · crawl-clip · medium | At least one line is **outcome-billed per successful hire**, not seat-billed |
| "Fountain **Hire Package Required**" gate note on the Hire API overview | `packages: _summary.md` / `docs: raw/getting-started.md` · registry-metadata + crawl-clip · high/medium-high | Commercially separable API surfaces — the legacy Hire API and the Fountain One microservice API are **different entitlements**, each with its own key model |
| **27 `whoami.*_enabled` boolean tenant-capability gates** + **50 LaunchDarkly-style feature flags** + 3 LaunchDarkly client-side environment IDs (prod / dev / staging-fallback) plus a separate, currently-unset override slot reserved for the Cue micro-frontend | `deployed-client-bundle: _shared/feature-flags.md` · source-map-reassembly · **high** | The entitlement model is **real and granular in the client**, not just a sales-deck construct. This is the strongest evidence in the run of how packaging actually works. |

**A packaging finding worth Nurix's attention:** the SPA ships
`REACT_APP_CHARGEBEE_ANNUAL_PLAN_ID` and `REACT_APP_CHARGEBEE_MONTHLY_PLAN_ID` env fields
(`deployed-client-bundle: raw/env-config.md` · source-map-reassembly · high — field names verbatim,
values redacted). **Chargebee is Fountain's own SaaS subscription billing**, and annual/monthly plan IDs
imply a **card-payable subscription tier exists in the product** even though the public site shows zero
pricing and offers zero self-serve checkout. Single-source (one artifact, one dimension) → **tentative**,
but the artifact is a high-confidence generated-source read, not an inference from marketing.

**Two decoupled money flows** — a distinguishing bit of commercial architecture (`deployed-client-bundle:
raw/bundle-map.md` · source-map-reassembly · high):

1. **Chargebee** → Fountain's own SaaS subscription fee.
2. **Stripe** → a `SetupIntent` (card-on-file) flow scoped to `/jobs/:jobId/sourcing/new`, i.e. the
   **employer buying paid job-ad / sourcing distribution budget** through the VONQ marketplace layer,
   with a coupon path and an "invoiced" alternative. Explicitly *not* used for candidate background-check
   fees or payroll — those sit on a disjoint `internal_api/portal/.../background_checks` /
   `.../i9_forms` / `.../worker_token` family with no Stripe reference nearby.

That second flow is a **media/ad-spend pass-through business running inside the ATS.** Combined with the
52-path `/internal_api/sourcing/*` engine (budget recommendations, aggregate spend, suggested target
budget, sourcing-channel stats, openings-at-risk, historical conversion data —
`deployed-client-bundle: _shared/api-path-catalog.md` · source-map-reassembly · high) and the Talroo
server-to-server conversion tracking shipped Jun 2026 (`community: raw/changelog-digest.md` · crawl-clip
· medium), Fountain is not only charging for software; it is **sitting between employers and job-ad
marketplaces, with a spend-optimization surface of its own**. Two independent dimensions (bundle +
community changelog) agree on this → **fact for the business shape and the endpoints' existence.**
**Consistent with `product-features.md`'s cap: the *optimization behaviour itself* stays tentative** —
the recovered paths are `budget_recommendation` / `suggested_target_budget` / `openings_at_risk`, i.e.
**recommendation** endpoints, not autonomous-execution ones, and with `write_side_observed: false`
nothing was observed running. "24/7 agentic spend optimization" is a marketing framing this run does not
verify.

---

## Differentiation

### What Fountain claims the moat is

Agentic AI. "The first scaled SaaS provider to transition its core architecture into a production-grade
agentic system"; "Fountain embedded multi-agent orchestration directly into its platform, rather than
layering on an AI assistant"; Cue as "the first autonomous frontline intelligence" (`website:
raw/ai-agents-and-cue.md` · crawl-clip · medium, quoting the Apr 14 2026 launch release).

### What the teardown reads as the real moat

**1. Suite depth that is genuinely much larger than "an ATS" — and larger than the marketing conveys.**
`575 documented public endpoints across 14 service families` (`api: raw/endpoint-catalog.md` ·
docs-reconstructed · medium, with 41 rows schema-verbatim; corroborated independently by `docs:
raw/doc-map.md` · crawl-clip · medium-high over the same `llms.txt` index — note per the seam rule this
is **one artifact, two readings**, so it is a *range-and-corroboration-of-reading*, not two independent
sources). The shape of that catalog is the finding: **the legacy Hire ATS is 108 of those 575 endpoints —
under a quarter of the documented platform — while the twelve post-hire Worker-Experience services carry
~467**, and `serviceattendance` alone carries **81**, three-quarters of the whole ATS surface in one
service (`api: raw/endpoint-catalog.md`). *(Corrected, Mode-5 it. 2: this sentence and its sibling in
`product-features.md` previously read "81 … larger than … 108" — arithmetically false, and it was the
load-bearing evidence for the category-error claim below. The corrected ratio, **108 : 467**, supports
that claim considerably better than the false comparison did.)* A full WFM/scheduling module, a
talent-CRM with ML matching (`servicepool`), an engagement/pulse-survey product (`servicepulse`, 43
endpoints), a referral program (`servicereferral`), employment records (`serviceemployment`, 39),
compliance v2 (16), organizations/brands/EINs (60). **And the documented 12 are not the whole fleet:** the
shipped WX clients call **seven further `service*` families the docs never mention** —
`serviceauthorization` (27 paths), `serviceintegrations` (26), `servicesupport` (18), `servicemessaging`
(5), `servicescheduler` (3), `servicesegmentation` (3), `servicecommunicate` (3) — for **at least 19
microservice families in production** (`deployed-client-bundle: _shared/api-path-catalog.md` §Addendum ·
`bundle-string-mine` · medium; full reconciliation in `data-model-api-surface.md` §Spine 2). This is a
**hire → onboard → schedule → engage → retain** lifecycle suite. Competing with "Fountain the ATS" is a
category error.

**2. Concrete AI infrastructure that is real, specific, and audited — distinct from the agentic rhetoric.**
Four named capabilities that no marketing page describes at this resolution:

- **Document OCR + auto-approval pipeline** (Compliance): glare/focus detection, an AI confidence score,
  auto-approval logic, and a **synchronous external-override decision gate** — Fountain blocks on a
  partner's HTTP response and lets the partner override its own auto-approve/manual-review decision. The
  docs even warn about the fail-open footgun (`docs: raw/webhooks.md` + `api: raw/webhooks.md` ·
  crawl-clip / docs-reconstructed · medium-high). Notable candor for a background-screening product.
- **Vector-similarity job matching**: `GET .../talents/{id}/jobmatches` — "based on aggregate vector
  match" (`docs: raw/api-reference.md` · crawl-clip · medium-high).
- **A Copilot draft → test → publish → apply lifecycle** for Onboard task flows
  (`createforcopilot` / `cloneforcopilot` / `publishforcopilot` / `applytestchangestodraftforcopilot`),
  Copilot-generated audiences in `servicepool`, an AI document-type classifier in `servicecompliancev2`,
  and — the tell that matters — a dedicated **`copilotAuditLogs` resource in `serviceorganizations`, an
  audit trail specifically for AI-driven changes** (`api: _summary.md` + `docs: raw/api-reference.md` ·
  docs-reconstructed / crawl-clip · medium-high). Nobody builds a governance audit log for a relabeled
  rules engine.
- **`exposeAsMcpTool`** as an OpenAPI tag baked into the API build pipeline — 10/36 in a bounded
  stratified Hire-v2 sample (28%), curated onto core-entity primary operations (Applicants, Locations,
  Positions, Funnels) and deliberately excluding sub-resource/process ops — plus a served
  `.well-known/agent-skills/index.json` discovery manifest (`api: raw/tool-catalog.md` ·
  docs-reconstructed · medium). **UPDATED (Mode-5 it. 1): this is no longer "staged ahead of shipping" —
  MCP is running in production.** A live, unauthenticated server answers at
  `data-mcp-production-us-east-1.fountain.com/mcp` as **`fountain-data-mcp v1.27.2`** with **6
  JSON-Schema'd tools** over a **Cube.js semantic layer + ClickHouse**, with server-side dataset caching
  so "no row data enters the calling context" (`deployed-client-bundle: raw/wx-micro-frontends.md` §2d ·
  **live read-only probe · high**; supersedes the earlier negative, which was correct only for the six
  guessed paths on `app.`/`services.`/`developer.fountain.com`). Competitively the notable part is *what*
  they made agent-callable first: **a governed analytics semantic layer, not the CRUD API.** The
  customer-facing half is still forward investment — the confirmed server is internal to Cue, and three
  further declared MCP hosts (`x-wx-`, `x-hire-`, `x-fountain-ai-mcp-base-url`) were not probed.

On the client side, independently: `fountain_ai`, `ai_builder/workflow/{chat,get_latest_message}`,
`agent_integrations/agent/*`, and 29 `/internal_api/chatbot/*` paths, with **Cue shipped as a separately
deployed, independently version-pinned UMD micro-frontend** off `ftn-shared-components.fountain.com` with
per-tenant release channels (`deployed-client-bundle: _summary.md` + `_shared/api-path-catalog.md` ·
source-map-reassembly · **high**). A team ships an independently-versioned micro-frontend with per-tenant
release pinning when it is iterating fast on a real bet, not when it is renaming a rules engine.

**Verdict on the "genuine AI vs relabeled rules engine" hypothesis** (`00-recon-plan.md` hypothesis #2):
**two independent lanes** — the served developer-docs corpus (`api` + `docs`, which mine the *same*
`developer.fountain.com` artifact and are therefore **ONE source**, not two) and the reassembled
production client source (`deployed-client-bundle`) — each found real, dedicated, non-trivial AI
infrastructure with its own audit trail and deployment lane. Two genuinely independent lanes is enough to
**promote "real backend AI investment exists" to fact**.

**UPDATED (Mode-5 it. 1) — the hypothesis is now answered for Cue, without a session.** Mining the
previously-unfetched `wx-copilot.umd.js` produced a verbatim model-selection enum,
**`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`** — the AWS Bedrock cross-region
inference-profile convention — plus an `llmProvider: enum(["openai","anthropic","anthropic_direct"])`
schema, an `llmServiceVersion`, a Bedrock-knowledge-base field, a `customPrompt` and a strictness enum
(`deployed-client-bundle: raw/wx-micro-frontends.md` §2c · bundle-string-mine · medium).
**RE-GRADED (Mode-5 it. 3, defect E2) — the promotion this paragraph originally made was one lane too
generous.** What the enum establishes, as **fact**, is that **Cue's shipped client declares a real
multi-provider LLM configuration with Claude-on-Bedrock named in it** — a direct read of a production
artifact, single-lane, capped at its source confidence. What it does **not** establish is that
**Cue's production inference runs on Claude**: the schema's own default is `openai`, no inference call
was ever observed (`write_side_observed: false`), and the apex `anthropic-domain-verification` TXT
record (`infra-backend-fingerprint` · dns-ct-fingerprint · medium) is **not an independent lane for a
product-level claim** — `technology-architecture.md` grades that record ambiguous because it sits among
internal-tooling SaaS verifications (Cursor, Linear, Notion, Miro, 1Password, Atlassian, Rippling), so
it evidences an *Anthropic account*, not a *request path*. **"Cue runs on Claude" is therefore rendered
tentative here, not fact.** What survives at fact strength is the thing the hypothesis actually asked:
**Cue is genuine, configured, multi-provider LLM orchestration, not a relabeled rules engine** — and a
live `fountain-data-mcp` MCP server (direct read-only probe · high) gives that agent real
Cube.js/ClickHouse analytics tools.

**What a session is still needed for:** (a) **Emma** — the intent-model chatbot API plus
`euw3-ms-nlu.internal.fountain.com` still point at classic in-house NLU, a *different subsystem* this
finding does not touch; **Anna** and **Sam** remain unconfirmed either way. (b) **Autonomy** — the shipped
shape is draft → test → human-publish, and no agent was observed producing output
(`write_side_observed: false`). (c) **Which provider actually serves a production call** — the schema's
default is `openai`. Also unattributed: `browserbase.com` / `*.onkernel.com` (headless-browser /
agent-sandbox vendors) in the trust-center CSP (`infra-backend-fingerprint: raw/sub-processors.md` ·
dns-ct-fingerprint · medium) — a real agentic *tooling* signal with no named product link.

**3. A quietly much larger enterprise customer base than the one it markets.**
The marketing site names **15 customers** (`website: raw/customers.md` · crawl-clip · medium): Bojangles,
UPS, Stitch Fix, LoadUp, Centerfield, LSG Sky Chefs, Alto, CLEAR, Brightside Health, Aimbridge, Tono
Pizzeria, LiveOps, JDW Logistics, Marsden Services, and one unnamed fast-casual chain. Certificate
Transparency logs tell a different story — a **per-tenant subdomain model with a paired sandbox
environment per named enterprise account**, exposing `aimbridge`, `amazon-na`, `amazon-us`,
`ms-amazon-portal`, `sandbox.amazon-mm`, `brandsafway`, `ceracare`, `doordash`, `ontrac`, `staples`
among 144 recovered hosts (`infra-backend-fingerprint: raw/dns-and-subdomains.md` · dns-ct-fingerprint ·
medium, via the CertSpotter CT mirror after crt.sh 502'd 3×). Independently, the status page's
**planned-downtime windows name dedicated environments** — `amazon-mm`, `amazon-eu-dsp`, `ceracare` —
i.e. isolated, separately-scheduled deployments rather than shared multi-tenancy
(`community: raw/status-page-architecture.md` · crawl-clip · medium). And the client bundle bakes in two
named enterprise custom-deploy tenants with matching feature flags: **Aimbridge Hospitality and UPS**
(`deployed-client-bundle: raw/route-table.md` · source-map-reassembly · high).

**Three independent non-marketing dimensions** (CT logs, status page, client bundle) converge on the same
architecture → **fact**: Fountain runs isolated per-tenant deployments for large accounts, and **Amazon,
DoorDash, Staples, BrandSafway, OnTrac and CeraCare appear as (current or former) tenants that the
marketing site never names.** Amazon appears under three distinct subdomains plus two sandboxes,
suggesting a multi-region, multi-business-unit relationship (Middle-Mile and DSP driver hiring, per the
maintenance-window naming). Two caveats held honestly: CT presence proves a certificate was issued for a
tenant host, not that the contract is live today; and `aimbridge.fountain.com` / `doordash.fountain.com`
currently 301 to the marketing site as unmapped slugs (same source), which is consistent with either
churn or routing change.

**4. Integration breadth as the actual system-of-record lock-in.** ADP (Workforce Vantage), Workday, UKG,
SAP, Indeed, Equifax, Checkr, Accurate Background, Certn, FirstAdvantage, HireRight, Orange Tree, Vetty,
Yardstik, eduMe, Harver, Lessonly, Testlify, Recruitics, VONQ, EvidentID, DocuSign, E-Verify, CameraTag,
DirectID, Branch, Walton Management Services (`website: raw/products.md` · crawl-clip · medium),
corroborated at the client layer by the independently observed vendor stack — VONQ, Indeed, Cronofy,
HelloSign **plus** a DocuSign feature flag (dual e-signature vendors), Lessonly + Northpass + WorkRamp
(three LMS integrations), Looker, Clearbit, Pusher 4-region (`deployed-client-bundle: raw/bundle-map.md` ·
source-map-reassembly · high) and by the status page monitoring Checkr, DropboxSign, E-Verify, Cronofy,
Twilio (5 regions) and Bird Messaging as first-class components (`community:
raw/status-page-architecture.md` · crawl-clip · medium).

> **Which part of that list is a fact, and which is flagged (corrected Mode-5 it. 3, defect E3).** The
> three-lane corroboration covers the vendors the client source and the status page **actually name** —
> VONQ, Indeed, Cronofy, HelloSign/DropboxSign, DocuSign, Checkr, E-Verify, Twilio, Bird, Lessonly,
> Northpass, WorkRamp, Looker, Clearbit. **That subset ⇒ fact.** It does **not** cover the
> **HRIS/payroll subset — ADP (Workforce Vantage), Workday, UKG, SAP** — which appears in **marketing
> only**. `docs: raw/integrations-partners.md` (medium) documents "Sync with your HRIS" as a
> **two-paragraph DIY webhook pattern with no named or certified HRIS/payroll connector** anywhere in
> the 593-page index, and `website`/`docs` are **not independent lanes** for a feature claim. So the
> HRIS subset is **flagged, not averaged, and rendered tentative** — the same posture
> `data-model-api-surface.md` §"Named connectors" and §"Conflicts flagged, not averaged" #1 already
> carried, which this document previously contradicted by promoting it to fact. A `/integrations`
> re-clip (the competing clipping-gap explanation `website` itself flags) would settle it.

The `Applicant` schema itself carries tagged-union vendor abstractions
for background checks (Checkr/Onfido) and e-signature (HelloSign/DocuSign), I-9 + E-Verify state
machines, granular TCPA-style SMS/call consent fields, and a `partner_data[]` slot whose documented
example partner is literally **"AI Interview"** (`docs: raw/api-reference.md` · crawl-clip ·
medium-high). The moat here is not "we built everything" — it is **"we are the orchestration layer and
system of record gluing the frontline-hiring stack together, with the compliance state machine
in the middle."**

### What is *not* a moat

- **No SDK in any language.** Exhaustive direct-registry sweep: 23 npm candidate names + 14 PyPI names,
  every hit disambiguated as an unrelated namesake (a screenplay parser, an XRP-Ledger stablecoin SDK),
  and the docs index greps zero for `sdk|client librar|npm|pypi|pip install`
  (`packages: raw/registry-sweep.json` · registry-metadata · **high**, `gaps: []`). **Count note (a
  range within one artifact, not a conflict):** `packages` describes the index it grepped as ~185–200
  reference-page titles, while `docs`/`api` enumerated the same `llms.txt` in full at **593–594 pages**
  — the same-artifact rule applies, and the fuller enumeration (a 180 KB `curl` of the whole file) is the
  better-evidenced figure; the grep's negative holds either way. REST + curl only.
- **No open-source presence of any kind.** `github.com/Fountain` is a verified namesake — created
  2009-03-17, five years before the company existed, blog field points at `fountain.engineering`, one
  public repo. Three alternate slugs 404. The marketing site links no GitHub anywhere
  (`codebase: _summary.md` · inferred · high).
- **No native mobile, no extension, no PWA** (see over-claim #6 above).
- **No two-way public feedback loop.** No public issue tracker, roadmap-voting board, or forum exists —
  the full alternate-home checklist was run (`/changelog`, `/releases`, `/product-updates`,
  `updates.`/`changelog.`/`feedback.`/`roadmap.` subdomains, Canny, Zendesk) before the absence was
  asserted (`community: raw/issue-themes.md` · crawl-clip · medium). The genuine first-party changelog
  lives at **`new.fountain.com`** — rich, dated back to July 2022 — and is **not linked from
  fountain.com anywhere** (verified by raw-HTML grep). Per the closed-feedback cap, every user-pain theme
  in this run is capped at **low/tentative**, and **`external-reputation` is flagged
  recommended-for-this-run** — a full G2/Glassdoor/Reddit corpus is the single highest-value follow-up.

---

## Alternatives & comparison

**Named by Fountain itself:** exactly one — a "**Fountain vs. SmartRecruiters**" comparison page in the
blog, alongside a "Comparisons" nav section under Resources (`community: raw/changelog-digest.md` +
`website: raw/home-and-positioning.md` · crawl-clip · medium). For a company this size, one named
head-to-head is a thin competitive-content program.

**Named by third parties, about Fountain:** a G2-derived summary (secondhand — G2 returned 403 to direct
fetch) reads *"Fountain faces challenges in overall market presence and user engagement… fewer recent
reviews compared to competitors,"* citing **Gem** as scoring higher on G2 Score (`community:
raw/issue-themes.md` · crawl-clip · **low** — secondhand summary of a blocked page, explicitly not a
primary read).

**Analyst placement:** **Niche Player** in the 2026 Gartner Magic Quadrant for Talent Acquisition
Suites (announced 2026-05-13) — Fountain's **first-ever** MQ inclusion, and the **lowest of the four
quadrants** (below Leaders, Visionaries, Challengers). Fountain promotes it hard: a dedicated ebook
landing page, a blog repost, a press release, syndicated pickup (`community:
raw/review-badges-traced.md` · crawl-clip · medium). First-time MQ inclusion is a fair milestone to
publicize; the promotion volume is out of proportion to the placement.

**The competitive frame the evidence supports.** Fountain sits at the intersection of three markets that
each have different incumbents:

| Frame | Fountain's position | Who else is there |
| --- | --- | --- |
| **High-volume/frontline ATS** | Core, decade-deep, 108-endpoint legacy Hire API + 300-path recruiter console | The frontline-hiring specialists; SmartRecruiters is the one Fountain itself names |
| **Frontline workforce management** (scheduling, attendance, engagement, retention) | 81-endpoint attendance/scheduling service + a pulse-survey product; the post-hire WX fleet is **~467 documented endpoints vs the ATS's 108 — over 4× its own ATS surface** *(wording corrected it. 2; the earlier "81 … bigger than its own ATS surface" was the same false 81-vs-108 comparison flagged above)* | WFM incumbents; this is where Fountain is quietly competing without much marketing air-cover |
| **Sourcing-spend / programmatic job advertising** | Stripe-backed ad-budget purchase + a 52-path optimization engine + Talroo/VONQ/Indeed wiring | Programmatic job-ad platforms; Fountain absorbs this function rather than integrating to it |

**Note on comparison-set caution:** this run captured **no external-reputation dimension** and **no
session**, so every competitor-relative statement above is either Fountain's own framing or a
low-confidence secondhand read. Nothing here should be used as a market-share or win-rate input.

---

## Strategic read

**Direction, corroborated by three independent first-party surfaces** (`community: _summary.md` ·
crawl-clip · medium — changelog, press-release stream, and status page are genuinely separate sources):

1. **Apr 14, 2026 — Cue launches**, framed as "the first autonomous frontline intelligence" and a
   multi-agent orchestration layer embedded in the core architecture.
2. **May 13, 2026 — first-ever Gartner MQ inclusion (Niche Player)**, explicitly tied to the Cue launch
   in Fountain's own promotion.
3. **Jun 25, 2026 — Sam ships**, a voice retention/satisfaction agent checking in at Day 1/7/30 per the
   changelog. *(Divergence flagged, not averaged: the marketing page states Day 1/10/30/60
   — `website: raw/ai-agents-and-cue.md` · medium — vs the changelog's Day 1/7/30
   `community: raw/changelog-digest.md` · medium. Two different first-party surfaces, one product; the
   cadence is recorded as **unsettled**, not reconciled to either number.)*
4. **Jul 6, 2026 — the status page adds a dedicated "AI Interviews" monitoring component** — a wholly
   separate data source landing in the same window, which is what makes the direction claim a fact
   rather than a marketing read.
5. **Jul 2026 — the self-commissioned AI-trust survey** (62% ghosted) positioned as a transparency
   differentiator, plus a named customer win (The Service Companies, 35 states).

**The rollout is maturing operationally, not finished.** Fountain's own status page shows **"Cue agent
service disruption" three times in Cue's first live month**, then not again in the remaining 2.5-month
sample; the new Warehouse Connections / Analytics work drew a critical incident plus two more inside five
weeks; and **both of the period's two `critical` incidents landed in June 2026** (50 incidents over ~8.5
months: none 24 · minor 13 · major 10 · critical 2 · maintenance 1 ≈ 5.9/month, 12 of 50 major-or-worse)
(`community: raw/status-page-architecture.md` · crawl-clip · medium). Read the "autonomous" claim against
a product still working through launch reliability.

**The company is mid-migration across two backend generations, and says so publicly.** A legacy
Rails-flavored Hire monolith (`X-ACCESS-TOKEN`, page+cursor pagination on the same endpoint, flat
resource JSON, `{"error":{"msg","name"}}`, 120 req/min documented) alongside a LoopBack-flavored Node
microservice fleet (OAuth2 client-credentials, `filter[where][field][op]` offset pagination, JSON:API
`{data, meta}` with server APM in the envelope, an array error shape, **rate limits entirely
undocumented**) (`api: raw/rate-limits-and-pagination.md` + `raw/openapi-digest.md` · docs-reconstructed ·
medium — two distinct `info.title` values, "Hire Public API" v2 and "Worker Experience Public API" v1.0.0,
make this a direct observation rather than an inference). Host consolidation onto
`services.fountain.com` completed 2025-11-14 with **every legacy URL form still working** and RFC 8594
`Sunset:` headers on the deprecation path (`docs: raw/faq-and-deprecations.md` · crawl-clip ·
medium-high). High maturity on backward compatibility; notably immature on cross-service consistency.
Corroborated from an entirely different angle by infra: a **report-only (not enforced) CSP** on
`app.fountain.com` listing ~35 third-party hosts, a ~100-slot `staging-use-NN` deploy fleet, self-hosted
LaunchDarkly relay proxies in 4 regions, a DuploCloud-orchestrated AWS footprint behind Cloudflare, and
a stray `herokudns.com` TXT record left over from a prior apex host (`infra-backend-fingerprint:
raw/security-headers.md` + `raw/cloud-cdn-fingerprint.md` · dns-ct-fingerprint · medium). The composite
read: **a mature, release-engineering-heavy organization midway through both a platform re-unification
and a security-hardening rollout.**

**The organizational tell.** The marketing site shows page sprawl faster than consolidation — duplicate
industry URLs (`/industry/retail` vs `/industry/retail-hiring-7`), overlapping product naming
(`/pool` vs `/reach` vs `/source`), **Sam vs Pulse** and **Cue vs Fountain Copilot** both unresolved as
the same-thing-under-two-names, and industry-specific Cue variants that exist in a press release but have
no findable standalone page (`website: _summary.md` inferences · crawl-clip · medium). A marketing org
shipping landing pages faster than it consolidates them.

**Where the strategy is genuinely well-aimed:** the "hiring isn't just pipelines anymore — it's making
sure roles are filled and teams are ready to work" framing (CEO Sean Behr, `community:
raw/changelog-digest.md`) matches what the API catalog actually contains. The attendance/scheduling/
engagement depth is real; the positioning is finally catching up to a suite that was already built. That
is the opposite of the usual over-claim direction, and it is worth saying plainly alongside the seven
over-claims above.

---

## What Nurix should take from this

*(Decision context: Nurix is evaluating building a competing/adjacent Frontline Hiring Platform.)*

### 1. Separate the marketing layer from the engineering layer before you benchmark anything

Two Fountains show up in this teardown, and they are not the same company:

| The marketed Fountain | The **evidenced** Fountain (what the captured artifacts actually show) |
| --- | --- |
| "Frontline Superintelligence," "the agentic operating system," "the first scaled SaaS provider to transition its core architecture into a production-grade agentic system" | **575 documented endpoints across 14 service prefixes**, a **766-path declared app-own surface** (a 300-path / 358-verb recruiter console **+ 466 WX service-tier paths across 15 client-mined families**, seven of which the docs never name — so the fleet is **≥19 `service*` families**), **1,757 first-party source files** recovered from one live source map, **50 feature flags + 27 tenant capability gates**, **two live MCP servers** (`fountain-data-mcp`, 6 tools; `fountain-hire-mcp-server`, **127** tools) answering unauthenticated capability probes, two backend generations mid-consolidation |
| Zero named model vendors, zero named frameworks on the ethical-AI page, a 1-review "High Performer" badge on the homepage | Vector job matching, an OCR + confidence-scored compliance pipeline with a synchronous partner override gate, a **`copilotAuditLogs` governance trail for AI-driven changes**, `exposeAsMcpTool` curated into the API build pipeline and **traced to a live 127-tool Hire MCP server**, plus a **live `fountain-data-mcp` MCP server** (Cube.js + ClickHouse, 6 tools) — and, from the shipped client bundle, **Cue's declared LLM config: Claude (`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`) via AWS Bedrock behind a multi-provider `llmProvider` schema whose default is `openai`** |

> **Read this column's title literally (corrected Mode-5 it. 3, defect E7).** It was previously headed
> "The observed Fountain", which over-stated the method: on a run with **one** live response and
> `write_side_observed: false`, almost every row here is `docs-reconstructed`, `crawl-clip`,
> `source-map-reassembly` or `bundle-string-mine` — **declared, published or reassembled material**, not
> runtime observation. The two genuine direct observations in the table are the **two MCP servers'
> `initialize`/`tools/list` responses**. Everything else is evidenced, not observed.

**Benchmark against the right one.** The agentic language is partly self-contradicting and — **updated
after Mode-5 it. 1, re-graded it. 3** — its *mechanism* is no longer unverifiable: Cue's shipped client
declares a real multi-provider LLM layer with Claude-on-Bedrock named in it, and two live MCP tool
servers answer unauthenticated probes. What stays unverified is **which provider serves production**
(the schema defaults to `openai` and no inference call was observed), the *autonomy*, and the outcome
claims. The platform underneath is deep, specific, and years old. Anyone who dismisses
Fountain because the marketing reads thin will badly under-scope the competitive problem — and anyone who
believes the marketing will over-scope the AI threat.

### 2. The three gaps Nurix can actually exploit

**(a) The self-acknowledged AI-trust problem.** Fountain published its own survey finding **62% of
applicants report being ghosted**, with unexplained AI screening rejections among the top complaints
(`community: raw/changelog-digest.md` · crawl-clip · medium). At the same time, its dedicated **Ethical
AI page names zero compliance frameworks** and carries no algorithmic specifics, no validation
methodology, no audit cadence, no named third-party bias auditor — the single framework citation on the
entire site (EEOC / GDPR / ISO 42001) sits on the *marketing* `/agentic-ai` page instead
(`website: raw/trust-security-ethics-legal.md` + `raw/ai-agents-and-cue.md` · crawl-clip · medium).
Fountain has named the category's trust problem and has not visibly built the governance surface to
answer it. **A candidate-facing explainability and auditability story — shipped as a product surface,
not a page — is an open flank**, and it is one where an entrant has an inherent advantage: you can build
per-decision explanations into the schema from day one instead of retrofitting them onto a decade-old
applicant state machine.

**(b) Customer concentration in enterprise logistics and big-box.** The names CT logs surface — Amazon
(three subdomains + sandboxes, Middle-Mile and DSP), DoorDash, Staples, BrandSafway, OnTrac, CeraCare,
Aimbridge, UPS — cluster hard in logistics/delivery, big-box retail, and facilities
(`infra-backend-fingerprint: raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium **×**
`community: raw/status-page-architecture.md` · crawl-clip · medium **×**
`deployed-client-bundle: raw/route-table.md` · source-map-reassembly · **high** — three independent
non-marketing lanes ⇒ **fact**).
Two readings, both actionable: **(i)** these accounts run on **isolated, separately-scheduled
deployments**, which means per-tenant customization debt and slow platform-wide iteration — the classic
enterprise-anchor drag an entrant is free of; **(ii)** the segments *outside* that cluster (healthcare
staffing, mid-market multi-unit restaurants, franchise groups, staffing agencies, non-US frontline
markets) get suite breadth but not the dedicated-deployment attention, and Fountain's own marketing
already lists them as verticals it serves rather than accounts it has won.

**(c) Two-generation backend drag.** Fountain is publicly, dated-ly mid-migration: two API generations,
two pagination styles, two error envelopes, rate limits **documented for the legacy API and undocumented
for all 12 Worker-Experience microservices**, a pre-rebrand product name (`OnboardIQ`/`OBIQ`) still embedded in webhook
signature headers and S3 bucket names, four separately-built webhook subsystems with different signing
conventions and SLAs (one with a hard 3-second synchronous budget, another recommending async
processing), and a report-only CSP that is measured but not enforced (`api: raw/webhooks.md` +
`raw/rate-limits-and-pagination.md` · docs-reconstructed · medium-high **×**
`deployed-client-bundle: raw/bundle-map.md` + `raw/env-config.md` · source-map-reassembly · **high**
**×** `infra-backend-fingerprint: raw/security-headers.md` · dns-ct-fingerprint · medium — three lanes,
two of them independent of the docs ⇒ **fact**). **Every one of those is a
consistency tax an entrant does not pay.** Concretely: a single coherent API with one envelope, one
pagination model, documented limits everywhere, one webhook system, and a **published, customer-facing**
MCP server is a real, demonstrable developer-experience wedge in an integration-heavy category. **Sharpened
by Mode-5 it. 1 — the wedge is narrower than it looked, and more specific.** Fountain does not merely have
the `exposeAsMcpTool` *tag*: it runs a **live MCP server in production** (`fountain-data-mcp v1.27.2`,
Cube.js + ClickHouse, 6 tools) — but it is an **internal analytics surface for its own copilot**, not a
customer-callable agent API, and it is **not documented anywhere on `developer.fountain.com`**
(`deployed-client-bundle: raw/wx-micro-frontends.md` · live probe · high × `api: raw/tool-catalog.md` ·
medium). So the entrant's wedge is not "they have no MCP" — it is **"their MCP is not for you"**: ship a
documented, authenticated, customer-facing agent-tool API and you beat a competitor that has already built
the plumbing but pointed it inward. Fountain also publishes **no SDK in any language**
(`packages: raw/registry-sweep.json` · registry-metadata · **high** — 23 npm + 14 PyPI direct registry
GETs, every hit disambiguated as an unrelated namesake) — that lane stays wide open.

**(d) A smaller but clean one:** "mobile-first" with **no publicly distributed mobile app, no PWA, not
even a service worker** (`distribution-artifacts: raw/store-and-pwa-sweep.md` · binary-extract · **high**
— 4 store/PWA surfaces swept with a content-type control probe; the legacy-mobile-client
route comment remains a flagged, unresolved conflict, but nothing ships on a public store today), in a
category whose candidates are phone-only. There
is a real product argument that a no-install web flow is *correct* for high-churn frontline funnels — but
the *worker-side* post-hire surface (scheduling, shift pickup, retention check-ins, document upload) is
exactly where a real installed client would pay off, and Fountain has none.

### 3. What is genuinely hard to replicate — budget for these, don't hand-wave them

- **Suite depth built over ~12 years.** 12 documented Worker-Experience microservices (plus the
  `servicehire` gateway prefix fronting the legacy ATS monolith, and **seven further client-only
  families the docs never name ⇒ ≥19 in the fleet**) spanning hire → onboard → schedule → engage →
  retain. **The size ratio, stated correctly:** the legacy Hire ATS is **108** documented endpoints
  while the post-hire WX services account for **~467 — over 4× the ATS surface**; a single one of them,
  `serviceattendance`, is **81 endpoints, three-quarters the size of the entire ATS API on its own**
  (`api: raw/endpoint-catalog.md` · docs-reconstructed · medium-high). *(Corrected Mode-5 it. 3 — this
  was a **fourth** instance of the 81-vs-108 false comparative iteration 2 fixed in three other places;
  81 < 108.)* This is not one product; it is five or six, each with its own state machine. An MVP ATS
  does not compete with it.
- **Deep enterprise integrations with compliance state machines in the middle.** Background checks
  (Checkr / Onfido / Accurate / HireRight / FirstAdvantage / Orange Tree), e-signature (HelloSign +
  DocuSign, a tagged-union vendor abstraction), E-Verify and full I-9 state machines, TCPA-grade
  SMS/call consent fields in the core `Applicant` schema, and Twilio across 5 regions plus a second SMS
  vendor (Bird) added Mar 2026 for redundancy — all corroborated across three independent lanes
  (`website: raw/products.md` · crawl-clip · medium **×** `deployed-client-bundle: raw/bundle-map.md` ·
  source-map-reassembly · **high** **×** `community: raw/status-page-architecture.md` · crawl-clip ·
  medium; schema detail from `docs: raw/api-reference.md` · crawl-clip · medium-high). **These are years
  of contract, certification, and edge-case work, not integration sprints** — and the compliance ones
  (I-9, E-Verify, TCPA) carry legal exposure that makes them slow by nature. **The HRIS/payroll side
  (ADP / Workday / UKG / SAP) is deliberately NOT in this list** *(corrected Mode-5 it. 3, defect E3)*:
  it is marketing-only, contradicted by the docs' DIY-webhook HRIS page, and stays **tentative** — see
  the flagged conflict under moat #4 above and `data-model-api-surface.md` §"Conflicts flagged, not
  averaged" #1. The word "certified" has been struck from this bullet for the same reason: **no
  certification of any connector is evidenced anywhere in this run.**
- **The sourcing-spend / ad-buying engine.** A 52-path optimization surface (budget recommendations,
  suggested target budget, aggregate spend, channel stats, historical conversion, openings-at-risk),
  Stripe card-on-file for employer ad-budget purchase, VONQ marketplace distribution, Indeed and Talroo
  server-to-server conversion tracking (`deployed-client-bundle: _shared/api-path-catalog.md` +
  `raw/bundle-map.md` · source-map-reassembly · **high** **×** `community: raw/changelog-digest.md` ·
  crawl-clip · medium — two independent lanes ⇒ **fact**). **This is a
  two-sided data flywheel**: the more hires Fountain closes, the better its channel-attribution model,
  which makes its budget recommendations better, which wins more spend. Replicating the software is
  tractable; **replicating the historical conversion data across 91M claimed applicants is not.** If
  Nurix competes here, compete on a different axis (e.g. agent-driven candidate conversion) rather than
  on spend optimization from a cold start.
- **The per-tenant isolated-deployment capability itself.** Sandbox parity per enterprise tenant
  (`infra-backend-fingerprint: raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium — 144 CT-recovered
  hosts with paired `sandbox.*` twins), dedicated maintenance windows naming `amazon-mm` /
  `amazon-eu-dsp` / `ceracare` (`community: raw/status-page-architecture.md` · crawl-clip · medium),
  region-coded infra and self-hosted LaunchDarkly relays in 4 regions
  (`deployed-client-bundle: raw/bundle-map.md` · source-map-reassembly · **high**). **Three independent
  non-marketing lanes ⇒ fact.** This is what an enterprise logistics buyer procures, and it is real
  operational muscle — visible in CT logs and the status page, not just in a sales deck. *(Anchors added
  Mode-5 it. 3, defect E6 — this bullet previously carried none.)*

### 4. Two things to verify before acting on this

- **Run an authenticated session — but the AI-mechanism question is now half-answered without one.**
  **UPDATED (it. 1), RE-GRADED (it. 3):** **Cue's *configuration* is settled** —
  `us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6` via AWS Bedrock, inside a
  multi-provider `llmProvider` schema (default `openai`), with **two** live MCP tool servers
  (`fountain-data-mcp`, 6 tools; `fountain-hire-mcp-server`, 127 tools). **What is NOT settled is which
  provider serves production** — the Anthropic DNS record is an org-level hint and is **not** a second
  independent lane, so this is a declared config read from client code, not an observed inference call.
  What a session is still for: **that** question; **Emma** (the intent-model chatbot API + the in-house
  `euw3-ms-nlu` microservice point the other way — classic NLU, a separate subsystem), **Anna** and
  **Sam** (unconfirmed), the **autonomy** question (the shipped shape is draft → test → human-publish),
  the **output quality** of any agent, and the still-unattributed Browserbase/onkernel agent-sandbox
  vendors in the trust-center CSP. **Do not benchmark against "Fountain's agentic story is
  unverifiable" — that is out of date.** Benchmark against a competitor that has *built and configured*
  a frontier-model orchestration layer with a live agent-tool API, gated by a human-approval workflow,
  and discloses none of it to its customers.
- **Run `external-reputation`.** Fountain has **no public feedback loop at all** — no tracker, no
  roadmap, no forum, and its real changelog is unlinked from its own site. Every user-pain signal in
  this run is inferred from changelog churn and incident naming, capped low. A full G2 (4.3/5, 126
  reviews), Glassdoor, and Reddit corpus is the cheapest way to convert "where does Fountain actually
  hurt customers" from inference into evidence — and that is exactly the input a build-vs-buy /
  differentiation decision needs.
