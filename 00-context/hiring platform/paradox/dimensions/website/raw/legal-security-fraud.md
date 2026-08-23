<!-- source: https://www.paradox.ai/legal/* + /ethical-ai + /why-paradox · captured_at: 2026-08-09 · method: crawl-clip -->

# Footer / legal pages — Security, Fraud, Sub-processors, Ethical AI, Positioning

## `/legal/fraud` — the "unusual footer link," explained

Confirmed hypothesis: this is a **candidate-facing anti-scam / anti-impersonation notice**, not a
compliance-fraud (e.g. applicant-fraud-detection) page. It exists precisely because SMS/text-based
recruiting is a known phishing vector — scammers impersonate Paradox/its client companies to run fake-job
scams over text.

**Verbatim-shape warnings:**
- "Any recruitment outreach from a Paradox employee will be sent from a Paradox email address, not from
  Outlook, Gmail, or other generic email systems."
- Red flags Paradox says it will **never** ask for: managing financial transactions from home; detailed
  personal info (driver's license, bank account, credit card, passwords, SSN); compensation tied to
  withdrawing bank funds; application/processing fees; shipping items from your home; acting as a
  money-transfer intermediary.
- Reporting: `info@paradox.ai`, plus pointers to OnGuardOnline.gov and the FBI's IC3 (Internet Crime
  Complaint Center).

**Read:** this is a defensive-trust page a company only needs when its core distribution channel (SMS/text,
per every product page) is being actively abused by scammers trading on the brand's reach into
high-volume/hourly job seekers. It's indirect but real evidence of scale (the company gets impersonated
often enough to need a dedicated page) and of a real operational-trust cost of the SMS-first channel choice
— worth flagging in competitive-positioning as a channel-risk callout, distinct from the AI-model-safety
question.

## `/legal/security`

Certifications claimed: **ISO 27001** ("third-party certified... information security management systems
and internal controls"), **SOC 2 Type II** ("independent audit for design and operating effectiveness...
Trust Service Principles"), and participation in the **EU-U.S. Data Privacy Framework** (+ UK extension +
Swiss-U.S. DPF). Emphasizes holding its own certifications independent of its cloud provider (AWS).
Publishes a live status page at `status.paradox.ai`. **No specifics disclosed** on encryption methods, data
residency, AI-specific model governance, or incident-response process — security@paradox.ai is the contact
for deeper inquiries.

## `/legal/subprocessors`

The page itself names **zero vendors** — it only describes the sub-processor review policy and links out to
a PDF (`.../Paradox%20Subprocessor%20List_8-5-2026.pdf`) that was not fetched this pass (PDF, out of scope
for a WebFetch/crawl-clip pass — flag for `infra-backend-fingerprint`, which owns sub-processor mining per
the discovery catalog, to pull the actual vendor list from that PDF).

## `/ethical-ai`

Governance: states it "implemented and maintains a governance and risk management program for AI systems"
**aligned with the NIST AI Risk Management Framework**, and explicitly aligns with **"Workday's evolving
ethical AI standards and applicable law"** (a notable dependency-on-partner detail, consistent with the
depth of the Workday partnership found in `raw/partners-integrations.md`).

Four stated pillars: Amplify Human Potential (AI "support[s] human decision-making," keeps users in
control) · Positively Impact Society · Champion Transparency and Fairness ("clear documentation" for
customers, "safeguard instructions" for personnel) · Data Privacy & Protection ("privacy-by-design").

States it "regularly conducts bias evaluations and reviews of its AI systems and technology" but discloses
**no methodology**, and defers bias-evaluation detail to **Workday's own resources** rather than publishing
its own.

**Confirmed: no LLM/model vendor named anywhere** (no OpenAI/Anthropic/Google/custom-model disclosure), no
mention of NYC Local Law 144, the EU AI Act, or third-party fairness audits. This is consistent across
every page checked in this crawl (homepage, ethical-ai, security, all 13 product pages) — Paradox's public
AI-model language is uniformly generic ("conversational AI," "AI assistant") with zero technical disclosure
of the underlying model/vendor. **This should be cross-checked against the `codebase`/`api`/
`deployed-client-bundle` dimensions** — a bundle string-mine or API response header could reveal an actual
model provider (OpenAI/Azure OpenAI/Anthropic/in-house) that the marketing site deliberately does not
disclose.

## `/why-paradox` — core differentiation pitch

Verbatim pitch: "We believe in a future where hiring work is replaced by conversations... freeing people up
to spend time with people, not software." Self-description: **"the software company that doesn't want you
to use our software"** — i.e., positions the product's success metric as recruiters spending LESS time in
it, an unusual and consistent framing (matches "automate up to 100%/90% of the hiring process" language
recurring across nearly every industry page). Claims: "helped thousands of companies increase conversion
rates by over 50%," "99.78% of candidates rate the experience positively." **No named competitors** anywhere
on this page — differentiation is framed against generic "antiquated processes and clunky systems," never
against a named rival ATS or conversational-AI vendor.
