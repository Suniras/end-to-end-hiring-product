---
dimension: website
target: paradox
status: complete
access_grade_used: presence:rich
method: crawl-clip
completeness_pct: 75
confidence: medium
captured_at: 2026-08-09
sources:
  - https://www.paradox.ai/sitemap.xml
  - https://www.paradox.ai (home)
  - https://www.paradox.ai/products/{campus-events,candidate-experience-agent,conversational-apply,conversational-ats,conversational-career-sites,conversational-crm,conversational-events,conversational-scheduling,onboarding,screening,surveys,text-apply,video}
  - https://www.paradox.ai/solutions/{retail,restaurant,franchise-hiring,healthcare,trucking-logistics,manufacturing,financial-services,hospitality,candidates,recruiters}
  - https://www.paradox.ai/partners/{workday,sap,indeed,integrations}
  - https://www.paradox.ai/case-studies/{chipotle,7-eleven,medtronic,compass-group,workday,general-motors}
  - https://www.paradox.ai/legal/{fraud,security,subprocessors}
  - https://www.paradox.ai/ethical-ai
  - https://www.paradox.ai/why-paradox
  - https://www.paradox.ai/clients-stories
  - https://www.paradox.ai/express-care
  - https://www.paradox.ai/the-conversation
  - https://www.paradox.ai/blog
  - https://www.paradox.ai/news/olivia-from-paradox-now-an-sap-endorsed-app-available-on-sap-r-store
gaps:
  - "57 of 63 named case studies not individually fetched (bounded fan-out); slugs known from sitemap, content not mined"
  - "Sub-processor PDF (legal/subprocessors) not fetched — it's a PDF link, out of WebFetch/crawl-clip scope; flagged for infra-backend-fingerprint which owns sub-processor mining"
  - "/solutions/managers persona page not fetched (lower priority, URL known)"
  - "No LLM/model vendor disclosed anywhere on the marketing site — genuinely absent, not a collection gap, but worth a cross-dimension check (bundle/API) per the note in raw/legal-security-fraud.md"
---

# Paradox — Website capture

## Method

Crawled via WebFetch (per task instruction to avoid Chrome MCP given a concurrent sibling `website`
collector may be running on Fountain in this batch — ingestion §7 rule 9). Pulled the live sitemap
(`https://www.paradox.ai/sitemap.xml`, 742 URLs) to build the full page inventory, then fetched: homepage,
all 13 `/products/*` pages, 10 of 11 `/solutions/*` pages, all 4 `/partners/*` pages, 6 representative
`/case-studies/*` pages (of 63 listed), key `/legal/*` footer pages (fraud, security, subprocessors),
`/ethical-ai`, `/why-paradox`, `/clients-stories`, `/express-care`, `/the-conversation`, `/blog`, and the
SAP-endorsement news announcement. Verified the "no pricing" hypothesis via 9 independent probe points
(nav, `/pricing` redirect-to-home, 4 plausible URL guesses, all product/solution/partner/case-study pages).
Cross-verified one WebFetch summary (`conversational-apply` title) against a direct `curl` fetch after
noticing an anomaly, per discipline of not trusting a single-pass summarizer blindly.

## Findings

### Positioning (verbatim)

Hero: **"Meet the AI assistant for all things hiring."** Sub-headline: **"Hiring takes time. But our AI
assistant Olivia gives you more of it — automating tasks so you spend more time with people, not
software."** Core differentiation pitch (`/why-paradox`): **"the software company that doesn't want you to
use our software"** — the product's stated success metric is recruiters spending *less* time inside it,
consistent with "automate up to 90-100% of the hiring process" language recurring across nearly every
industry page. No named competitors anywhere on the site; differentiation is framed against generic
"antiquated processes and clunky systems."

### The "Conversational X" product family — feature claims

13 product URLs, all built around one conversational engine (Olivia) with per-surface skins — confirmed,
not just hypothesized: `/products/conversational-apply` and `/products/screening` serve near-identical
`<title>` tags ("Automated candidate screening") and near-identical content/stat blocks, verified via direct
`curl`, not just a WebFetch summary. Full per-product feature tables and stat blocks are in
`raw/products.md`. Headline stats repeated as platform-wide claims across most product pages (not
independent per-product evidence): "21% increase in likelihood of a job being clicked" (Indeed), "1,000+
metrics tracked," "100+ languages supported" (though "30+ languages" appears inconsistently in 2 places —
flagged, not resolved).

| Product | One-line pitch (verbatim) |
| --- | --- |
| Conversational ATS | "Hire faster with the ATS that reimagines recruiting." |
| Candidate Experience Agent | "the always-on, AI agent that turns clunky processes into simple, human conversations" |
| Conversational Career Sites | "The career site that (actually) converts." |
| Conversational Apply / Screening | "Eliminate friction, increase conversion." (near-duplicate pages) |
| Text-to-Apply | integrates explicitly with Workday, SAP SuccessFactors, ADP, Taleo, Cornerstone |
| Conversational Scheduling | "The smartest assistant for interview scheduling." — "30M+ interviews scheduled annually" (platform-wide) |
| Conversational Events / Campus Events | "Make hiring events your competitive advantage." |
| Conversational CRM | "A CRM that actually drives action" — includes AI-assisted campaign copywriting |
| Onboarding | "Simple, fast onboarding built for first-day success stories." |
| Surveys | "Know exactly how every candidate feels — in real-time." |
| Video | native in-browser interviewing; explicit 3rd-party integrations: Zoom, Skype, BlueJeans, Teams, Webex |

### Target market

Enterprise, high-volume, frontline/hourly hiring at scale — every named customer is a 10,000+ (often
100,000+) employee organization: Chipotle (110K+), 7-Eleven (135K+), Medtronic (95K), Compass Group (500K+),
Workday itself (20K+, 1,900+ open reqs). Industry verticals covered with dedicated pages: retail,
restaurant, franchise, healthcare, manufacturing, financial services, hospitality, trucking/logistics.
Persona pages target candidates, recruiters, and managers/TA leadership as the buyer. Two outlier logos
(Zillow, Dell) suggest some reach into white-collar/tech employers beyond the frontline-hourly core, but the
overwhelming majority of case studies and site content targets high-volume hourly hiring.

### "Olivia" branding — mechanically generic, no model disclosed

"Olivia" is Paradox's own default assistant name, but it is a **white-labeled persona** — confirmed across
5 independent pages, customers deploy it under their own branded name: Chipotle → "Ava Cado," 7-Eleven →
"Rita," General Motors → "Ev-e," a franchise customer → "Mia" (quoted: "We had to turn Mia off because we
were getting so many applications" — Brad Williams, VP of Franchise Restaurants), the `/express-care` SKU →
"Becky." **No LLM/model vendor is named anywhere on the site** — homepage, all 13 product pages, the
ethical-AI page, and the security page all use uniformly generic "conversational AI"/"AI assistant"
language with zero technical disclosure (no OpenAI/Anthropic/Azure/custom-model mention). The Ethical AI
page states alignment with the **NIST AI Risk Management Framework** and explicitly defers to **"Workday's
evolving ethical AI standards"** for bias-evaluation methodology — a real dependency signal given how deep
the Workday partnership runs elsewhere on the site. **This absence should be cross-checked against
`deployed-client-bundle`/`api`/`codebase`** — a bundle string-mine or response header could surface an
actual model provider the marketing site deliberately doesn't disclose.

### Pricing & packaging — CONFIRMED absent (9 independent checks)

No pricing, tiers, or packaging anywhere. `/pricing` is a live URL but 301-redirects to the homepage
(confirmed via direct `curl -I`, not just a missing page — someone at Paradox deliberately keeps that slug
pointed home rather than 404ing it). All CTAs are "Request demo" / "Log in." Consistent with an
enterprise-quote, sales-assisted GTM matching the customer base (every case study is a large enterprise).
Full checklist of probed locations in `raw/pricing.md`.

### Partner-embed positioning — the overlay-onto-incumbent-ATS pattern (confirmed)

This is the clearest and most repeated message on the entire site, verbatim across 4 independent pages:
**"Enhance your entire hiring lifecycle without replacing your system of record."** Paradox explicitly
never positions itself as an ATS/HCM replacement — it's a conversational engagement + scheduling +
screening layer that syncs status into the incumbent system of record.

- **Paradox for Workday** — "Workday Certified" badge, a named product line ("Paradox for Workday"),
  browser-extension embed inside Workday Recruiting, two-way SMS through Workday, automated status sync.
- **Paradox for SAP SuccessFactors** — Olivia is a paid-tier **SAP Endorsed App** sold on **SAP Store**
  (progressed through SAP's partner tiers from "validated" → "spotlight"), per the dedicated announcement
  page; browser-extension embed inside SuccessFactors Recruiting.
- **Paradox for Indeed** — one-toggle job distribution + full Indeed Apply conversational applications
  completed without leaving Indeed.
- **The broader integration catalog** spans 12 categories and 100+ named vendors (ATS, HCM, CRM,
  assessments, WOTC, I-9/background-check, ad/programmatic, consultants, system integrators, video,
  messaging, email/calendar) — see `raw/partners-integrations.md` for the full list.

**This is the same GTM shape this project has previously flagged for Quinyx (AI-optimization overlay onto
UKG/Infor, Store-Ops batch)** — an AI layer that deliberately partners-into, rather than displaces, the
enterprise system-of-record incumbents, and formalizes that positioning into certified/endorsed partner
tiers (Workday Certified, SAP Endorsed App) as a trust/distribution mechanism.

### Case studies (63 named, 6 fetched in depth)

Every fetched case study names specific products used (modular adoption, 1-4 of the "Conversational X"
family per customer, never framed as one monolithic suite) and cites time-to-hire/time-to-schedule/
hours-saved/cost-saved/completion-rate stats exclusively — no quality-of-hire, retention, or
diversity-outcome metric appears in any case study checked. No case study carried a transcribed text quote
from a named customer individual (spokespeople are tied to embedded video/webinars, not pull-quotes).
Highlights: Chipotle (75% ↓ time-to-hire, "Ava Cado"), 7-Eleven (40,000 hrs/wk saved, "Rita"), Medtronic
(scheduling 6,000 interviews/3mo, days→17min), Compass Group (160K annual hires w/ 20 recruiters, uses
Traitify Assessments — not in the general integrations catalog), Workday (customer AND certified partner —
23,000 hrs saved over 2 years), General Motors ($2M/yr saved, "Ev-e," 99.6% ↓ scheduling time).

### The `/legal/fraud` page (confirmed hypothesis)

A candidate-facing **anti-scam/anti-impersonation notice** — exactly the SMS-recruiting phishing-vector
concern flagged in the task brief. Warns candidates that legitimate Paradox outreach only comes from a
Paradox email address (never Outlook/Gmail), lists red flags (never asks for bank/SSN/driver's-license
info, never charges application fees, never asks candidates to be money-transfer intermediaries), and
directs victims to `info@paradox.ai`, OnGuardOnline.gov, and the FBI's IC3. This is real evidence the
brand's SMS-first, high-volume-hourly-hiring channel gets actively targeted by job-scam fraud at a scale
that warranted a dedicated footer page — a genuine operational-trust cost of the channel choice, distinct
from AI-safety concerns.

## Inferences

- **The "Conversational X" naming is a skin over one engine**, not seven separately engineered products —
  now corroborated (title-tag collision + near-identical content between `conversational-apply` and
  `screening`), matching the recon-plan hypothesis. Re-verify against `codebase`/`deployed-client-bundle`
  route/API evidence before treating as settled fact in evaluation (single-dimension corroboration so far).
- **Olivia is a rebrandable persona layer**, not a fixed product name — this is a soft-differentiator
  Paradox could use to make the same underlying assistant feel bespoke per enterprise client, worth noting
  in competitive-positioning as a low-cost personalization feature that likely drives some of the "white
  glove" perception in customer testimonials.
- **The overlay/partner-embed GTM is deliberate company strategy, not one page's marketing copy** — the
  identical "without replacing your system of record" line appears on 4 independent pages (Workday, SAP,
  integrations, and echoed in the Candidate Experience Agent product copy), and is reinforced by two paid/
  certified partner-tier relationships (Workday Certified, SAP Endorsed App) rather than just informal
  integration claims.
- **Zero technical AI disclosure is very likely a deliberate positioning choice**, not an oversight — it
  holds across marketing (homepage, 13 product pages), trust (security, ethical-AI), and partner pages
  alike. A sales-assisted enterprise seller of "conversational AI" to non-technical HR/TA buyers has little
  incentive to disclose the underlying model vendor, and doing so via a partner (Workday's ethical-AI
  standards) rather than independently may also reduce Paradox's own AI-governance disclosure burden.

## Open questions

- What LLM/model actually powers Olivia? (Not on the marketing site at all — needs `codebase`/
  `deployed-client-bundle`/`api` cross-check, e.g. bundle string-mine for `openai.com`/`anthropic.com`
  hostnames, or response headers/latency fingerprints.)
- Full sub-processor vendor list is a PDF (`legal/subprocessors`), not mined this pass — `infra-backend-
  fingerprint` should pull it (it owns sub-processor mining per the discovery catalog).
- What does Traitify Assessments (named in the Compass Group case study) tell us — is it an acquired/
  proprietary Paradox capability, or a third-party integration missing from the public `/partners/
  integrations` Assessments category list? Worth a targeted follow-up.
- The 57 unfetched case studies (of 63) may contain additional named-persona brandings, additional
  vertical-specific stats, or a pricing/packaging leak not seen in the 6 sampled — a second pass could mine
  more if synthesis needs deeper corroboration on a specific vertical (financial services and logistics
  each currently rest on only 2-3 named customers).
- "30+ languages" vs "100+ languages" inconsistency across product pages — unresolved; likely a
  live-conversation vs. translated-content distinction but not stated explicitly anywhere.

## Artifacts

- `raw/home.md` — homepage hero, nav, logos, Olivia branding, pricing check
- `raw/products.md` — all 13 product pages, feature tables, stats, the title-collision finding
- `raw/solutions-usecases.md` — 8 industry pages + 2 persona pages + Express Care + the Olivia-rebranding note
- `raw/partners-integrations.md` — Workday/SAP/Indeed partner pages + full integrations catalog (the GTM-overlay evidence)
- `raw/case-studies.md` — 6 fetched case studies in depth + pattern notes + list of gaps
- `raw/pricing.md` — the 9-point "no pricing" verification checklist
- `raw/legal-security-fraud.md` — fraud page, security certs, subprocessors (PDF gap), ethical-AI, why-paradox
- `raw/resources-community.md` — the-conversation hub, blog post titles, clients-stories logo wall
