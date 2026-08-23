<!-- source: https://www.paradox.ai/legal/subprocessors (landing page) + linked PDF
     https://cdn.prod.website-files.com/611dc730a416cbf8f5934ebc/6a751d7f1a9802d227028b4e_Paradox%20Subprocessor%20List_8-5-2026.pdf
     (PDF dated 8-5-2026 — 4 days before capture; genuinely current) · captured_at: 2026-08-09 · method: crawl-clip -->

# Paradox — Sub-processor list (verbatim) + Security/Trust page + Fraud notice

## `/security` page (crawl-clip)

States third-party certifications but does **not** name specific cloud/AI vendors on that page itself (it defers to the linked Sub-processor List for vendor names):

- **ISO 27001** — "Third-party certified for demonstrated compliance of information security management systems and internal controls."
- **SOC 2 Type II** — "Certified by independent audit for design and operating effectiveness of security practices."
- **EU-U.S. Data Privacy Framework** — "Paradox is an active participant in the EU-U.S. Data Privacy Framework, the UK extension, and the Swiss-U.S. Data Privacy Framework."
- Security contact: `security@paradox.ai`. Status page linked: `status.paradox.ai`.

## `/legal/subprocessors` — the Sub-processor List PDF (verbatim table)

> "Paradox uses sub-processors in the provision of our cloud software. Each Paradox sub-processor undergoes an information security and data protection review and is subject to a written agreement with Paradox."

### Hosting and other third-party sub-processors

| Sub-processor Entity | Brief Description of Processing (verbatim) | Location |
| --- | --- | --- |
| **Amazon Web Services, Inc.** | Hosting services and support; Infrastructure-related services; Application development platform; **AWS Bedrock, model licensing services** | United States |
| **Twilio, Inc. (including SendGrid)** | Communication services (email and text message delivery and analytics) | United States |
| **Google LLC** | Business tools and workspace; Optical character recognition services; Translation Services; Similarity matching services (semantic matching); **Natural language processing**; Address validation; Talent solutions | United States |
| **Snowflake, Inc.** | Data management, analysis, and optimization | United States |
| **Atlassian Pty LTD** | Support, reporting, and ticketing | Australia |
| **Salesforce, Inc. (including Slack)** | Support and ticketing; Project management and communications | United States |
| **Textkernel US LLC, DBA Sovren** | Data intelligence platform (resume and job parsing, data querying, and analytics) | United States |
| **Symmetry Software Corporation** | Embedded tax forms and functionality | United States |
| **Merge API, Inc.** | API and integration services | United States |
| **Helpjuice, Inc.** | Support tools and documentation | United States |
| **Cielo, Inc.** | Implementation services and support | United States |
| **The Cloud Connectors, Inc.** | Implementation services and support | Canada |
| **Woofound, Inc. d/b/a Traitify** | Support and maintenance exclusively for Traitify Services | United States |

### Affiliate sub-processors — Paradox Entities

| Entity | Processing | Location |
| --- | --- | --- |
| Paradox.AI UK Ltd | Support and maintenance services | United Kingdom |
| Paradox.AI Israel | Support and maintenance services | Israel |
| Paradox Talent Acquisition Services, Inc. | Support and maintenance services | Canada (British Columbia) |
| Paradox Vietnam Company Limited | Support and maintenance services | Vietnam |
| Paradox Olivia (Australia) Pty LTD | Support and maintenance services | Australia |
| Paradox Olivia (Singapore) PTE. LTD. | Support and maintenance services | Singapore |

### Affiliate sub-processors — Workday Entities (Americas / European / APJ regions)

A full slate of ~24 **Workday** legal entities (Canada, Costa Rica, US, Austria, Belgium, Czech Republic, Denmark, Finland, France, Germany, Ireland, Israel, Italy, Latvia, Netherlands, Norway, Poland, Spain, Sweden, Switzerland, UK, Australia, India, Japan, New Zealand) are each listed as sub-processors performing "Support and maintenance services." Full per-country breakdown in the source PDF; digested here per size discipline — the finding is the **fact and depth of the relationship**, not each country row.

## Findings — decoded

1. **The central "is Olivia an LLM or legacy NLU?" question — answered, precisely, by the phrase "AWS Bedrock, model licensing services" under the Amazon Web Services entry.** Paradox **does** license foundation models via **AWS Bedrock** (AWS's managed multi-model LLM service — hosts Anthropic Claude, Amazon Nova/Titan, Meta Llama, Mistral, Cohere, depending on what Paradox has enabled). This is a **modern, LLM-backed** capability, disclosed at the infrastructure level. **No single named model vendor (OpenAI, Anthropic, Google Gemini) is disclosed** — Bedrock abstracts the underlying model, so this document alone cannot say *which* model(s) Paradox has provisioned, only that a licensed-model capability exists via AWS.
2. **This is independently corroborated by two other methods in this same dimension**: (a) the CSP `connect-src` never names a third-party LLM host, meaning any model call is server-brokered — consistent with a Bedrock call happening inside AWS, never client-side; (b) the CT-log history shows a **`rasa-k8s`/`devrasa` (Rasa — pre-LLM, intent-based open-source NLU) family of hosts active 2023–2024, now decommissioned (NXDOMAIN today)**, while a **`genai.*` family of hosts (across every environment) appeared at the same time and is still live today** (`genai.paradox.ai` serves `server: uvicorn` — a modern Python/ASGI microservice). **Three independent signals (sub-processor disclosure, CSP absence-of-direct-LLM-calls, and CT-log Rasa→GenAI host-family transition) converge on the same story: Paradox evolved from a Rasa-based intent-classification NLU system toward a dedicated, AWS-Bedrock-backed GenAI microservice, likely sometime around early-to-mid 2024.** This is presented as a well-corroborated **inference**, not a directly-observed fact (no session/wire capture of an actual model call was possible on this `auth:none` run) — Evaluation should weight it as cross-dimension-corroborated-medium, not verbatim-high.
3. **Google LLC is a second, separate AI/ML vendor** — "Natural language processing," "Similarity matching services (semantic matching)," "Talent solutions" line items suggest Google Cloud NLP API and/or **Google Cloud Talent Solution** (a real, named Google product for job-candidate matching) are also in the stack, alongside AWS Bedrock. This makes Paradox's AI stack **multi-cloud for AI/ML specifically**, even though compute/hosting is AWS-exclusive.
4. **Textkernel/Sovren** (resume & job parsing) is a well-known, distinct third-party parsing engine — confirms resume/job-description parsing is not homegrown NLP but a licensed specialist vendor.
5. **Symmetry Software** ("embedded tax forms") independently corroborates the `spfcdn.symmetry.com` / `spfcdn-staging.symmetry.com` hosts already visible in the Olivia CSP `img-src` — a payroll/tax-compliance embed, presumably for onboarding/new-hire paperwork (W-4 equivalents), consistent with the "Conversational Onboarding" product line.
6. **Woofound, Inc. d/b/a Traitify** confirms Traitify (personality assessment, seen in the CSP as `cdn.traitify.com`/`api.traitify.com`) is a **Paradox-acquired product** ("exclusively for Traitify Services"), not a third-party integration partner.
7. **Merge API, Inc.** ("API and integration services") — Merge.dev is a unified-API vendor for HRIS/ATS integrations; likely the plumbing behind Paradox's Workday/SAP SuccessFactors/Indeed partner-integration pages rather than fully bespoke per-partner connectors.
8. **Cielo, Inc. and The Cloud Connectors, Inc.** are named as implementation/support sub-processors — both are real-world RPO (recruitment-process-outsourcing)/HR-tech consulting firms, suggesting Paradox routes some enterprise implementations through outside consultancies rather than in-house services exclusively.
9. **The Workday sub-processor relationship is unusually deep for what might look like a simple ATS integration.** ~24 Workday legal entities across every major region are formal GDPR sub-processors of Paradox — meaning Workday entities may process client personal data *on Paradox's behalf* under Paradox's own client agreements. Combined with the DNS finding that Paradox's own `careers.paradox.ai` redirects to `workday.com`, this points to a substantive, formal co-sell/embedded partnership with Workday, not an arm's-length API integration — a genuinely interesting competitive-positioning finding (Paradox both partners deeply with Workday AND, per its website, competes for some of the same "conversational recruiting" budget).
10. **No payment processor is named** in the sub-processor list (no Stripe/Adyen/Braintree) — consistent with Paradox being an enterprise B2B SaaS sold on contract/invoice, not self-serve card billing.

## `/fraud` and `/legal/fraud` — the Fraud Notice (an unusual footer page for this product category)

Confirmed live (`/fraud` → 200, `/legal/fraud` → 200). Content (crawl-clip):

> "Any recruitment outreach from a Paradox employee will be sent from a Paradox email address, not from Outlook, Gmail, or other generic email systems."

The page warns **job candidates applying to work AT Paradox** (i.e. Paradox's own hiring pipeline, not client companies' Olivia deployments) about fraudsters impersonating Paradox recruiters on job-posting sites. It explicitly disclaims requests for: financial-transaction management from home, sensitive personal data (driver's license, SSN, bank details, passwords), fees/charges for employment, shipping/money-transfer intermediary roles. It directs victims to email `info@paradox.ai`, and references **OnGuardOnline.gov** and the **FBI's IC3** (Internet Crime Complaint Center) as external resources.

**Reading this finding correctly:** this is *not* evidence that Olivia (the product, as run on behalf of Paradox's clients) is being weaponized for candidate-facing SMS scams — it is Paradox defending **its own employer brand** from being spoofed by generic recruitment-scam operators, a real and increasingly common problem for any company with a public hiring pipeline (independently reasonable given the SMS/email infrastructure — Twilio + SendGrid — that Paradox's own sub-processor list discloses, which is the same class of infrastructure recruitment scammers commonly abuse when impersonating *any* company). Still a genuine, if modest, threat-model finding worth recording: Paradox judged its own brand recognition high enough, or the impersonation volume high enough, to warrant a dedicated public disclaimer page — something most SaaS vendors in adjacent categories do not carry.
