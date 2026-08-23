---
dimension: website
target: fountain
status: complete
access_grade_used: presence:rich
method: crawl-clip
completeness_pct: 85
confidence: medium
captured_at: 2026-08-09
sources:
  - "https://fountain.com (redirected to India variant on WebFetch)"
  - "https://fountain.com/why-fountain"
  - "https://fountain.com/customers"
  - "https://fountain.com/customer/stitch-fix"
  - "https://fountain.com/customer/bojangles"
  - "https://fountain.com/{source,hire,onboard,shift,pool,reach,assist,compliance,i-9-center,enterprise-ats}"
  - "https://fountain.com/agentic-ai"
  - "https://fountain.com/frontline-os"
  - "https://fountain.com/airecruiter"
  - "https://fountain.com/industry, /industry/retail-hiring-7, /industry-sitemap.xml"
  - "https://fountain.com/role/recruiters, /role-sitemap.xml"
  - "https://fountain.com/security"
  - "https://fountain.com/ethical-ai"
  - "https://fountain.com/integrations"
  - "https://fountain.com/about-us"
  - "https://fountain.com/blog"
  - "https://fountain.com/page-sitemap.xml"
  - "https://cue.fountain.com/ (JS-gated, degraded)"
  - "https://trust.fountain.com (JS-gated, degraded)"
  - "https://privacy.fountain.com/policies/en/?name=master-subscription-agreement (JS-gated, degraded)"
  - "WebSearch: fountain.com press releases, Clevy acquisition, legal-entity/funding corroboration (secondary, flagged)"
gaps:
  - "cue.fountain.com is a JS-rendered SPA — WebFetch returned only the bare page title; industry-specific Cue variant pages (Retail/Logistics/Restaurants/Outsourced Services) referenced in the April 2026 press release could not be located as standalone URLs and may live only inside this gated app"
  - "trust.fountain.com (Trust Report) is JS-gated — no sub-processor list, SOC 2 report, or compliance-badge detail recovered; overlaps with infra-backend-fingerprint's planned sub-processor fold-in"
  - "Master Subscription Agreement (privacy.fountain.com policy host) is JS-gated — fee-structure schema, termination terms, SLA language not recovered; only the legal-entity name (OnboardIQ, Inc.) was recoverable via WebSearch snippet + third-party corroboration"
  - "Dedicated Emma and Sam product pages not found by URL guessing or sitemap — content assembled from WebSearch snippets of fountain.com/posts/* blog content rather than a primary product page; lower confidence than Anna's page-level capture"
  - "Integrations page text extraction may be incomplete (ADP/Workday/UKG named on product pages but not captured in the /integrations page clip) — likely a WebFetch clipping gap, not a real absence"
  - "'Franchises' and 'Private Equity Firms' industry verticals are listed on the /industry index page but have no dedicated indexed URL in industry-sitemap.xml — could not deep-dive their specific claims"
---

# Fountain — Website capture

## Method

Crawled fountain.com via WebFetch + WebSearch (no Chrome browser tools used, per this run's
concurrent-collector constraint — `session`/other collectors in this batch may be driving Chrome for the
sibling Paradox target). Used `/sitemap.xml` → `page-sitemap.xml` / `industry-sitemap.xml` /
`role-sitemap.xml` to build a verified URL list rather than guessing paths blind (several guesses
`/products/source`, `/products/crm`, `/products/ats` etc. 404'd — the real paths are flat, e.g. `/source`,
`/hire`, `/pool`). Crawled: homepage (redirected to an India-localized variant), `/why-fountain`,
`/customers` + 2 full case studies (Stitch Fix, Bojangles), all 6+ product pages (`/source /hire /onboard
/shift /pool /reach /assist /compliance /i-9-center /enterprise-ats`), the AI/platform pages (`/agentic-ai
/frontline-os /airecruiter`), one industry vertical in depth (`/industry/retail-hiring-7`, most relevant
to the Nurix retail-frontline decision context) + the industry/role index lists, `/security /ethical-ai`,
`/integrations`, `/about-us`, `/blog` (path, not the 530-erroring subdomain — confirmed the Discovery
note holds), and attempted `cue.fountain.com` + `trust.fountain.com` + the Master Subscription Agreement
(all three JS-gated, degraded per gaps above). Pricing absence was verified across 6 distinct plausible
locations (see raw/pricing.md), not a single page. WebSearch was used only as a secondary/flagged source
for facts unreachable via direct page fetch (legal entity, funding, the Clevy acquisition, industry press
on Cue) — every such fact is explicitly marked "secondary" in the raw files, never presented as a direct
page observation.

## Findings

### Positioning (verbatim)

> "Fountain is the AI-powered Superintelligence that sources, hires, and runs your frontline operations across every location, 24/7."

> "Powered by Frontline Superintelligence — The agentic operating system for the frontline workforce."

Company self-description, plainest form found (fountain.com/role/recruiters): **"An ATS for hiring hourly workers."** Founding thesis (fountain.com/about-us): "Founded in 2014... most applicant tracking systems aren't built for [hourly workers]." Full detail: `raw/home-and-positioning.md`.

### Product suite (feature claims per module)

| Module | Live URL | One-line claim | Claimed quantified result |
| --- | --- | --- | --- |
| Source | /source | 24/7 agentic sourcing-spend optimization | 20% spend reduction, 15% faster TTH, 3x hire-quality |
| Hire (ATS) | /hire | "10x your Hiring Speed with Agentic Hiring" | 91M+ applicants, 14M+ hires, 75+ countries |
| Onboard | /onboard | 2x-faster day-one onboarding | 40% faster onboarding, 30% fewer Day-1 no-shows |
| Shift | /shift | "10x Your Shift Coverage" | 40% less absenteeism, 80% faster peak coverage |
| Pool (CRM) | /pool | Rehire/CRM talent pool | 35% faster fill from existing talent, 4x re-engagement |
| Reach | /reach | Paid/programmatic sourcing beyond job boards | $2.60 cost-per-applicant, 3x apply-to-hire rate |
| Assist | /assist | Managed/RPO-style sourcing **service** (human team + AI) | 95% interview attendance, per-hire pricing |
| Compliance | /compliance | Document/compliance automation | 100% audit readiness, 60% less manual work |
| I-9 Center | /i-9-center | Automated I-9/E-Verify | 99% E-Verify compliance, 40% fewer incomplete I-9s |

Full per-product bullet lists, integration partners, and the products-not-in-the-original-nav-list
(Assist, Reach, Compliance, I-9 Center, Referrals, Communicate, Pulse) are in `raw/products.md`.

**Integration partners named across the site:** ADP (Workforce Vantage), Workday, UKG, Indeed, SAP,
Equifax, Accurate Background, Certn, Checkr, FirstAdvantage, HireRight, Orange Tree, Vetty, Yardstik,
eduMe, Harver, Lessonly, Testlify, Recruitics, VONQ, EvidentID, DocuSign, E-Verify, CameraTag, DirectID,
Branch, Walton Management Services.

### AI Agents (Anna/Emma/Sam) and Cue — mechanical description

- **Anna** ("AI Recruiter"): 24/7 voice-based candidate screening. Notable specific claim: **"AI trained on structured logic, not personal data"** — implies a hybrid architecture (conversational front-end + structured/rules scoring layer), not a raw LLM operating directly on PII.
- **Emma** ("AI Support"): 24/7 candidate/new-hire Q&A across voice, SMS, web chat, WhatsApp; clears I-9/W-4 paperwork. No dedicated page found — assembled from blog-post search snippets (lower confidence).
- **Sam** ("AI Satisfaction"): post-hire sentiment/retention-risk tracking at Day 1/10/30/60. Likely the same capability as the separately-branded **"Fountain Pulse"** seen in a customer case study (Brightside Health) and named on the enterprise-ATS page — naming overlap unresolved.
- **Cue**: launched April 14, 2026 as **"the first autonomous frontline intelligence"** — a multi-agent orchestration layer. Company claims: **"Fountain embedded multi-agent orchestration directly into its platform, rather than layering on an AI assistant"** and calls itself "the first scaled SaaS provider to transition its core architecture into a production-grade agentic system." Confirmed industry-specific Cue framings (Logistics/Delivery, Retail, Restaurants, Outsourced Services) exist per the launch press release, but no standalone marketing URLs for them were found — likely gated inside the un-crawlable `cue.fountain.com` app.
- **No LLM/foundation-model vendor is named anywhere on the site** (no GPT/Claude/Gemini/Llama, no generic "large language model" term). The one verifiable piece of technical lineage is the **June 2023 acquisition of Clevy** ("an international provider of AI conversational technologies," IP + talent, terms undisclosed) explicitly "to further advance AI for hourly hiring" — real corroborated history, but 3 years old relative to the 2026 "Cue"/"Frontline Superintelligence" rebrand, so it does not resolve whether the current agents are modern LLM-orchestrated or a rules/NLU system with agentic marketing language layered on. **This question is not resolvable from the website dimension alone** — flag for `session`/`api`/`docs` to test empirically (LLM-typical failure modes vs. rules-engine tells). Full analysis: `raw/ai-agents-and-cue.md`.

### Pricing — confirmed absent everywhere (verified across 6+ locations)

**No pricing is disclosed anywhere on fountain.com.** Every commercial path (the guessed `/pricing` URL,
demo-request forms, the India-localized landing page, `/signup` and `/signup-apac`, the Assist
managed-service page) routes to a sales-assisted "book a demo / request a quote" flow. The demo form's own
copy — "pricing tailored to your customized product suite" — implies **modular, per-product-line
negotiated pricing**. The one quasi-pricing signal on the entire site: Assist advertises **"Transparent
per-hire pricing"** and **"No upfront costs"** (i.e., billed per successful hire), with no rate given.
Full verification trail: `raw/pricing.md`.

### Target market / ICP

Multi-location, high-volume, **hourly/frontline-workforce employers** — explicitly NOT positioned for
salaried/exempt corporate hiring as a primary use case. 11 named industry verticals (Retail,
Manufacturing, Logistics, Hospitality, Grocery, Healthcare, Delivery, Food & Beverage, Professional
Services, Franchises, Private Equity Firms) and 7 named roles (Hiring Managers, Talent Acquisition, HRIS,
Recruiters, CHRO, Operations, DEIB). Retail-specific claim: "On average, retail positions take 25-26 days
to fill. With Fountain, our customers can hire workers in 7 days" (77% decrease in time-to-hire). Full
detail: `raw/industries-roles-and-icp.md`.

### Social proof — 15 named customers found (Discovery had only 1)

Bojangles (80% TTH decrease — the one Discovery found), plus newly surfaced: LoadUp, Centerfield, UPS
(7-minute job offers, 100k hires in 6 weeks), LSG Sky Chefs, Alto, CLEAR, Brightside Health (26% higher
engagement via Fountain Pulse), Aimbridge, Tono Pizzeria, LiveOps (48% faster time-to-fill), JDW
Logistics, Stitch Fix (40% more applicants passing background checks; TTH 3 weeks→9.16 days), Marsden
Services (18 days→7 days TTH), and an unnamed "healthy fast-casual restaurant" (halved TTH). Full detail
+ quotes: `raw/customers.md`.

### Trust / Security / Ethical AI / Legal

- Security page: HTTPS/TLS everywhere, AES-256 at rest, third-party security audits, responsible-disclosure program. Does NOT explicitly say "SOC 2" in the extracted text — yet TWO separate product pages (/hire, /onboard) explicitly claim **"SOC 2 certified"**. Likely a WebFetch text-clip gap (badge/logo), not a real inconsistency, but unverified — flag for cross-check.
- Ethical AI page: purely qualitative (transparency, bias-mitigation, human-in-the-loop language) — **names zero compliance frameworks**. The ONLY page on the entire site naming a specific framework (EEOC/GDPR/ISO 42001) is `/agentic-ai`, not the dedicated Ethical-AI page — a real documentation-inconsistency finding.
- Trust Report (trust.fountain.com) and the Master Subscription Agreement are both **JS-gated / unreadable via WebFetch** — recorded as gaps, not fabricated. One fact recovered from WebSearch with two independent third-party corroborations: **Fountain's legal entity is OnboardIQ, Inc.**, a Delaware corporation.
- **Flag/refute:** a WebSearch aggregator claim that "Fountain was acquired by Porch Group on June 5, 2025" appears to be **false or a data-aggregator error** — uncorroborated by any primary source, and contradicted by Fountain's own 2026 newsroom continuing to publish independent-company product launches (including the April 2026 Cue launch with its own named C-suite exec). Recorded so it is not re-trusted by a later dimension. Full detail: `raw/trust-security-ethics-legal.md`.

## Inferences

- **The go-to-market story:** Fountain sells an end-to-end, modular "operating system" for hourly/frontline hiring-through-retention (Source → Pool/CRM → Hire/ATS → Onboard → Shift → Compliance/I-9 → post-hire retention), monetized via negotiated, quote-gated, likely per-product-line and/or per-hire pricing (Assist is explicitly per-hire) rather than any public seat/tier model — consistent with an enterprise, multi-location B2B sale where the buyer is a director/VP of Talent Acquisition, Ops, or CHRO at a large multi-location retail/QSR/logistics/healthcare employer (matching the "Use Cases by Role" list), not an SMB self-serve buyer.
- **Who they're really selling to:** the case-study logos skew toward large, multi-location, high-turnover, deskless-workforce brands (Bojangles 750 locations, UPS, Stitch Fix, Aimbridge hospitality, LSG Sky Chefs airline catering) — i.e., enterprise accounts where hundreds/thousands of hourly hires per year justify a negotiated platform contract. The "Assist" managed-service tier and the heavy compliance/I-9 tooling both suggest Fountain also competes partly as an **outsourced recruiting/RPO alternative**, not purely a software tool.
- **2026 repositioning as an "agentic AI" platform (Cue/Frontline Superintelligence) is a recent, aggressive rebrand** (launched April 2026) layered on top of a decade-old ATS/onboarding business (founded 2014) with a real but modest AI-technology acquisition history (Clevy, 2023). The marketing language is unusually disciplined about NEVER naming an underlying model, which reads as deliberate positioning (avoid being "just a GPT wrapper" perception) rather than an accidental omission — but it also means the "agentic" claim is **entirely unverifiable from public marketing alone** and should be weighted as tentative/marketing-driven until the `session`/`api`/`docs` dimensions can test actual product behavior.
- **The site itself shows signs of aggressive, iterative SEO/campaign-driven page sprawl** (duplicate industry-vertical URLs like `/industry/retail` vs `/industry/retail-hiring-7`, a `/pool` vs `/reach` vs `/source` product-naming overlap, `Sam` vs `Pulse` naming ambiguity, `Cue` vs `Fountain Copilot` naming ambiguity) — suggests a marketing org that ships landing pages faster than it consolidates them, a minor but real signal about organizational maturity/process discipline worth noting in the competitive-positioning rollup.

## Open questions

1. Is Cue/Anna/Emma/Sam built on a modern LLM (in-house or third-party API) or a rules/NLU system rebranded "agentic"? Unresolvable from website alone — needs `session`/`api`/`docs`/`packages` empirical testing.
2. What does `cue.fountain.com` actually show (JS-gated) — is it a customer-facing product surface, a marketing microsite, or both? Needs Chrome-MCP re-fetch.
3. Does the Trust Report (trust.fountain.com) list SOC 2 Type I/II explicitly, and what is the actual sub-processor list? Needs Chrome-MCP re-fetch; overlaps with infra-backend-fingerprint's planned work.
4. What exact fee structure does the Master Subscription Agreement specify (per-hire? per-seat? platform fee + usage)? JS-gated, unresolved.
5. Are "Sam" and "Fountain Pulse" the same product under two names, and are "Cue" and "Fountain Copilot" the same orchestration layer under two names? Both naming ambiguities unresolved from the website alone.
6. Do the industry-specific Cue variants (Cue for Retail/Logistics/Restaurants/Outsourced Services) have live standalone marketing pages, or do they exist only as press-release framing / inside the gated app?

## Artifacts

- `raw/pricing.md` — full pricing-absence verification trail across 6+ checked locations.
- `raw/home-and-positioning.md` — verbatim positioning, nav structure, Frontline OS architecture claims.
- `raw/products.md` — per-module feature claims for all 9+ product pages + full integration-partner catalog.
- `raw/ai-agents-and-cue.md` — Anna/Emma/Sam/Cue mechanical description + the LLM-vs-rules-engine audit.
- `raw/customers.md` — all 15 named customers, full Stitch Fix and Bojangles case studies with quotes.
- `raw/industries-roles-and-icp.md` — full industry/role vertical lists, retail-specific detail, ICP framing.
- `raw/trust-security-ethics-legal.md` — Security/Ethical-AI page content, JS-gated Trust Report and MSA notes, legal-entity (OnboardIQ, Inc.) finding, and the refuted "acquired by Porch Group" claim.
