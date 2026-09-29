<!-- source: fountain.com/security, fountain.com/ethical-ai, trust.fountain.com, privacy.fountain.com/policies · captured_at: 2026-08-09 · method: crawl-clip (security/ethical-ai) + degraded/JS-gated (trust report, subscription agreement) -->

# Fountain — Trust Report, Security, Ethical AI, Subscription Agreement

## Security (fountain.com/security) — readable, crawl-clip

- Encryption: "Fountain forces HTTPS for all services using TLS (SSL)... Fountain uses AES-256 for
  encrypting documents at rest."
- "Fountain also regularly uses third-party security vendors to perform audits of our platform to ensure
  that we are using the best practices to keep all data secure."
- Responsible-disclosure program: dedicated security contact email + a published PGP key for encrypted
  reports.
- Badges shown: G2 High Performer (Fall 2023), Rectec Certified Partner, Software Suggest High Performer.
- A "detailed security white paper" is referenced as downloadable but not fetched in this pass.
- **Notable absence:** this page's extracted text does NOT explicitly say "SOC 2" — it only claims generic
  "third-party audits." This is a direct contradiction/gap against the /hire and /onboard product pages,
  which both explicitly say **"SOC 2 certified"** / "SOC 2-certified with full audit trails." Either (a)
  the security page's SOC 2 badge/logo wasn't captured in the WebFetch text clip (most likely — badges are
  often image-only with alt-text WebFetch may miss), or (b) the claim is inconsistently applied across
  pages. Flag for cross-dimension reconciliation; do not treat "SOC 2 certified" as fully confirmed from a
  single page, but note it IS asserted (twice) on product pages.

## Ethical AI (fountain.com/ethical-ai) — readable, crawl-clip — qualitative only

- "At Fountain we believe in harnessing the power of technology to revolutionize the hiring landscape
  while upholding the utmost ethical standards."
- "Fountain is committed to developing AI tools that complement human expertise, not replace it."
- "We believe in transparency through every step. Our AI-powered decisions are explained clearly."
- Bias-mitigation claim: "meticulously designed our AI algorithms to recognize and eliminate bias,
  creating a level playing field where candidates are evaluated solely on their qualifications and
  potential" — and that the AI "analyzes skills, experience, and qualifications, ensuring that each
  candidate is evaluated fairly, regardless of their background or personal characteristics."
- Human-in-the-loop language: "designed to augment human decision-making, fostering a harmonious synergy
  between technology and expertise."
- **No named compliance framework** on this page (no EEOC, GDPR, ISO 42001, or any regulatory citation) —
  contrast with the separate /agentic-ai page, which DOES explicitly claim alignment to "EEOC/GDPR/ISO
  42001." This means Fountain's compliance-framework claim exists in exactly ONE place on the site
  (/agentic-ai), not on the dedicated Ethical-AI page one would expect to carry it — a real
  positioning/documentation inconsistency worth flagging, not just a crawl gap (both pages were fully
  readable via WebFetch).
- Technical detail level: **minimal/zero** — no algorithmic specifics, no validation methodology, no
  audit-frequency commitment, no named third-party bias auditor.

## Trust Report (trust.fountain.com) — DEGRADED: JS-gated, unreadable via WebFetch

WebFetch returned only the bare page title "Fountain Trust Center" with no body content — this is very
likely a JS-rendered SPA (a Vanta/SafeBase/Drata-style trust-center product, common for this kind of page)
that doesn't server-render its compliance-badge/sub-processor content. **Recorded as a gap, not
fabricated.** The main session should re-fetch this with Chrome MCP if the Trust Report's sub-processor
list / SOC 2 report / compliance-badge detail is needed for the infra-backend-fingerprint dimension's
sub-processor fold-in (per discovery.md Part C, dimension 9) — this is exactly the kind of page that
dimension is supposed to mine, and it overlaps with this one; note the overlap rather than duplicate
effort.

## Master Subscription Agreement (privacy.fountain.com/policies/en/?name=master-subscription-agreement) —
DEGRADED: JS-gated, unreadable via WebFetch

- Redirect chain confirmed: `fountain.com/msa` → 301 → `privacy.fountain.com/policies/en/?name=master-subscription-agreement`.
- WebFetch returned empty body content (JS-rendered policy-hosting platform, likely Iubenda/OneTrust/
  Termly-style). **Recorded as a gap.**
- One concrete fact WAS recoverable via WebSearch (search-snippet indexing, not a direct page fetch):
  the agreement is between **"OnboardIQ, Inc., a Delaware corporation ('Fountain')"** and the Customer —
  confirming **Fountain's legal entity name is OnboardIQ, Inc.**, a Delaware corp (Fountain is the trade
  name/DBA). This is corroborated independently by SAP's partner directory (`sap.com/.../onboardiq-inc-fountain.html`,
  listing "OnboardIQ Inc. | Fountain") and by 6sense's tech-comparison indexing ("Fountain (Formerly
  OnboardIQ)") — **two independent third-party corroborations of the same legal-entity fact**, high
  confidence despite the primary document itself being unreadable.
- Support contact for business-terms questions: support@fountain.com.
- No pricing/fee schema, termination terms, or SLA language was recoverable — flagged as an open question,
  not fabricated.

## Legal-entity / corporate-history flags for cross-dimension reconciliation (from WebSearch, secondary — flag confidence accordingly)

- **Fountain = OnboardIQ, Inc.** (Delaware corp) — legal entity name behind the "Fountain" brand. HIGH
  confidence (2 independent third-party sources + the MSA search snippet itself).
- **Acquired Clevy** (June 2023) — "IP and talent" of an international conversational-AI provider,
  explicitly "to further advance AI for hourly hiring." Terms undisclosed. Corroborated by the original
  fountain.com/news press release URL plus syndication (BusinessWire, RecruitingDaily, HRTechCube,
  TechRSeries) — HIGH confidence this acquisition happened; MEDIUM confidence on its precise relevance to
  today's Anna/Emma tech stack (3-year-old acquisition, current branding is "Cue"/2026).
  See raw/ai-agents-and-cue.md for the full analysis.
- **"Acquired by Porch Group on June 5, 2025"** — this claim appeared in ONE aggregator-search-summary
  (a WebSearch synthesis citing Tracxn-style sources) and was NOT corroborated by any primary source (no
  Fountain press release, no BusinessWire/PR Newswire hit, and Fountain's own /newsroom continues to
  publish 2026 press releases — including the April 2026 Cue launch — presented as an independent-company
  product launch with its own named C-suite exec, not as a Porch Group subsidiary announcement). **This
  claim is very likely FALSE or a data-aggregator error (possibly confusing Fountain with an unrelated
  company, or a stale/incorrect Tracxn-style entry)** — treat as REFUTED / do-not-cite, flagged per the
  batch's namesake-verification discipline. Recorded here only so a later dimension doesn't independently
  rediscover and re-trust the same bad claim.
- HQ / employee count / funding (from WebSearch, NOT from a directly-fetched fountain.com page): San
  Francisco, CA (275 Sacramento Street); employee count estimates range from ~230 to ~421 across sources
  (unreconciled — different snapshot dates, likely both roughly correct at different points in time);
  ~$219M total funding raised (Series B + two Series C rounds, including a $100M Series C extension and an
  earlier $85M round per PRNewswire, June 2021). MEDIUM confidence (third-party aggregators, not a
  fountain.com primary source) — the `community`/`infra-backend-fingerprint` dimensions should
  independently corroborate if this matters to the final rollup.
