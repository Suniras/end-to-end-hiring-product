<!-- source: fountain.com/{airecruiter,assist,reach,agentic-ai,frontline-os}, cue.fountain.com, WebSearch (fountain.com/posts/*, businesswire press release) · captured_at: 2026-08-09 · method: crawl-clip + WebSearch (secondary) -->

# Fountain — AI Agents (Anna / Emma / Sam) and Cue — mechanical description + technical-detail audit

## Summary verdict on the Discovery hypothesis

The recon plan flagged as an open hypothesis: *"is this genuine LLM orchestration or a rules-engine relabeled as 'AI agents'?"* Verdict from the website crawl alone: **cannot be confirmed either way from marketing copy** — Fountain is consistent and disciplined about NEVER naming an underlying model/vendor (no GPT, Claude, Gemini, Llama, or "large language model" term found anywhere in the crawl), and equally consistent about asserting "agentic" (goal-directed, autonomous, context-aware) rather than "automation" framing at the positioning layer. The one piece of real corroborating technical history: Fountain **acquired Clevy in June 2023** ("an international provider of AI conversational technologies for businesses" — IP + talent acquisition, terms undisclosed) specifically "to further advance AI for hourly hiring" — this is a real, verifiable technical lineage behind the conversational agents (Anna/Emma), predating the 2026 "Cue"/"Frontline Superintelligence" rebrand by ~3 years. It suggests the conversational layer has real (if undisclosed) proprietary NLP/AI investment rather than being a pure relabel — but "conversational AI" in 2023 vendor-acquisition language is NOT proof of modern LLM-based agentic orchestration; it's equally consistent with a sophisticated NLU/dialogue-tree system that was retroactively rebranded "agentic" in the 2026 marketing push. **This remains genuinely unresolved from the website dimension** — the `session`/`api`/`docs` dimensions are better positioned to test whether the actual product exhibits LLM-typical behavior (free-text handling, hallucination-shaped errors, prompt-like configurability) vs. rules-engine tells (rigid decision trees, fixed response banks).

## Anna — "AI Recruiter" — /airecruiter

**Nav one-liner:** "Anna – AI Recruiter: Screens candidates while you sleep"

**Headline:** "Not just AI that chats. AI that qualifies."

Capabilities claimed:
- "Auto-screen candidates 24/7 via voice conversations"
- "Serve job matches based on fit, not just interest"
- "Ask custom questions and evaluate answers instantly"
- "Automatically accelerate top candidates to interviews"
- "Built with agentic AI" (explicit contrast to "traditional chatbot")
- "AI trained on structured logic, not personal data" (a notable, specific privacy/bias-defense claim — implies scoring is rules/structured-data-driven rather than an LLM free-associating over PII, which is itself a hint AWAY from a raw LLM-does-everything architecture and toward a hybrid: LLM/NLU for the conversation layer + a structured/rules scoring layer underneath)
- "Generates structured notes, summaries, and interview recaps" (summarization — an LLM-typical capability)

**Claimed results:** reduces time-to-hire by up to 50% · 2.5x increase in qualified candidates interviewed · 800+ recruiter hours saved per year per brand · 295% increase in application volume · 2x increase in completion rates.

**No model/vendor name disclosed.**

## Emma — "AI Support" (24/7 candidate support) — no dedicated page found; description assembled from WebSearch snippets of fountain.com/posts/* content

- Answers candidate questions instantly across **voice, SMS, web chat, and WhatsApp** at every funnel stage
- Supports "Chat Apply" on web, SMS, and WhatsApp
- Clears paperwork (I-9, W-4) before day one
- Described as working "under Cue" to guide workers/authorized representatives through paperwork and clear blockers before they delay a start date
- No model/vendor name found.

## Sam — "AI Satisfaction" (post-hire engagement/retention) — no dedicated page found; assembled from WebSearch snippets

- "Post-hire engagement intelligence that captures sentiment at Day 1, 10, 30, and 60 to flag retention risk before a worker quits"
- Checks in at key milestones to flag "early flight risk"
- Governance claim: "Every action is logged, traceable, and reviewable, with override protocols and bias auditing across protected groups"
- No model/vendor name found.
- Note: Sam appears to be the productization of what the enterprise-ats page calls **"Pulse"** ("AI-Driven sentiment analysis") and what a customer case study calls **"Fountain Pulse"** (Brightside Health: "26% higher workforce engagement with Fountain Pulse") — Sam and Pulse likely name the same underlying capability at different points in the rebrand timeline; UNRESOLVED, flag for docs/api cross-check.

## Cue — the orchestration layer

**cue.fountain.com** exists as a dedicated subdomain but returned only a bare page title ("Cue") via WebFetch — **JS-rendered/client-side app, unreadable via WebFetch.** Flagged for a Chrome-MCP re-fetch by the main session if deeper detail is needed; not attempted here per this dimension's browser-avoidance instruction (concurrent Paradox collector may be driving Chrome).

Assembled from `/agentic-ai`, `/frontline-os`, and the April 14, 2026 launch press release (`fountain.com/news/fountain-launches-cue-to-run-frontline-hiring-and-workforce-operations`, corroborated by BusinessWire/SiliconANGLE/Morningstar syndication):

- Billed as **"the first autonomous frontline intelligence designed to run frontline workforce operations"** — launched April 14, 2026.
- "Cue acts as a single interface to coordinate and trigger agent behavior" (/agentic-ai)
- "Cue orchestrates agents to run hiring, onboarding, and support workflows end to end, without manual work" — autonomously builds/updates hiring workflows, sources/screens candidates without recruiter intervention, detects and fills shift gaps, flags underperforming locations, generates "board-ready operational insights."
- Company claims this represents a genuine architecture shift, not a bolt-on: **"Fountain embedded multi-agent orchestration directly into its platform, rather than layering on an AI assistant"** — and claims to be **"the first scaled SaaS provider to transition its core architecture into a production-grade agentic system."**
- Explicit governance framing: "human oversight controls and configurable governance policies."
- **Executive quote** (Salim Jernite, Chief Product and Technology Officer — also the named author of most current Fountain blog posts, suggesting he is the public technical/product voice for this launch): *"Software digitized work, but agentic systems go further. They run it, introducing a new era of autonomous intelligence for enterprise operations."*
- **Industry-specific Cue variants** (confirmed via press release, matching the Discovery plan's expected list): Logistics/Delivery ("High-volume, time-sensitive hiring"), Retail ("Store staffing at scale"), Restaurants ("Fast hiring, shift coverage"), Outsourced Services ("Multi-client hiring, simplified"). Could not verify these as separately live marketing pages — only found referenced in the press release; sitemap crawl did not surface distinct `/cue-retail`, `/cue-logistics` etc. URLs. Likely live only inside the JS-gated `cue.fountain.com` app, or not yet published as standalone pages at crawl time.
- **No model/vendor name disclosed anywhere** for Cue either — "multi-agent orchestration" is described architecturally (agents + orchestration layer + governance policies) but never names a foundation model, an LLM API vendor, or even a generic "large language model" term.
- Relationship to **"Fountain Copilot"** (named on /frontline-os as "the super agent orchestrating every layer") is unresolved — likely Cue is the external product name for the same orchestration concept Copilot names internally, or Copilot is a superseded/parallel name. Flag for docs/api dimension.

## Cross-check flags for synthesis (marketing claims that should be verified against product/session/api reality)

1. **"Agentic AI" vs. rules-engine** — the single most load-bearing overclaim risk on this site. No technical evidence either way from the website; the Clevy acquisition (2023, "conversational AI") is real corroborating history but doesn't resolve modern-LLM vs. NLU-era-conversational-AI.
2. **"AI trained on structured logic, not personal data"** (Anna) — a specific, testable architectural claim; worth checking against the docs/api schema for what fields actually feed the scoring model.
3. **SOC 2 certification** — asserted bare ("SOC 2 certified") on /hire and /onboard pages but the dedicated /security page's extracted text does not explicitly repeat "SOC 2" (only "third-party security audits" and encryption practices) — worth a direct check of the Trust Report (trust.fountain.com, JS-gated in this crawl) or a SOC 2 report link.
4. **Reach's "3x more applicants — without job boards or paid ads"** vs. the same page's own claim of reaching candidates via "Meta, Google and more" — Meta/Google ads ARE paid ads; this is an internal contradiction in the marketing copy itself, worth flagging as a straightforward marketing-copy inconsistency rather than a deep technical finding.
5. **Sam vs. Pulse naming** — likely the same capability under two names at different points in time; unresolved.
6. **Cue vs. Fountain Copilot naming** — likely the same orchestration concept under two names; unresolved.
