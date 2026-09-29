# Tezi — Product Research

**Date:** 2026-05-12
**Website:** https://tezi.ai/

## Company Overview
- Agentic AI recruiting platform offering "Max," an autonomous AI recruiter that handles sourcing, screening, and scheduling end-to-end.
- Founded 2024, HQ in Menlo Park, CA. Co-founded by Raghavendra Prabhu (CEO, ex-Covariant, Thumbtack, Google) and Jason James (COO, ex-Instacart, Intercom).
- Seed stage; raised $9M in July 2024 from 8VC, Audacious Ventures, and 4 other investors. Team of ~8 people.
- **Acquired by Headway on March 31, 2026** (acqui-hire; team joined Headway to build AI for mental health care). Tezi is no longer operating independently.

## Product
- Core product is **Max**, an autonomous AI recruiting agent that sources candidates, screens applications, handles candidate Q&A, and auto-schedules interviews — positioned as an always-on AI teammate rather than a copilot tool.
- Max accesses a database of 750M+ candidate profiles globally, supports natural-language search for sourcing, and sends personalized outreach emails.
- Target: professional/desk-worker roles at tech and finance companies, from new-grad to director level. Best suited for high-volume roles (SWE, AE, SDR, Product Designer).

**Key features:**
- Autonomous sourcing with natural-language calibration and 750M profile database
- Application screening with candidate Q&A handling
- Interview scheduling via calendar integration (auto-schedule or candidate self-book)
- Proactive follow-ups on scorecards, candidate responses, and hiring-manager decisions
- Slack-based conversational delegation (tell Max what to do in natural language)
- Built-in lightweight ATS for teams that don't have one
- Explainable recommendations — logs job-related evidence behind every candidate score
- 3rd-party bias audit; Max cannot make autonomous rejection decisions
- SOC 2 and CCPA compliant

**Target customer segment:**
- Early-stage startups (founders doing their own hiring)
- Growth-stage companies with small recruiting ops teams
- Mature talent teams at larger companies looking to augment recruiters

**Deployment model:** Cloud SaaS. No on-prem option indicated.

**Key use cases:**
- End-to-end recruiting automation for lean teams
- Augmenting in-house recruiters with AI capacity
- Replacing or reducing reliance on external recruiting agencies

## Tech & Integrations

**Known tech stack:**
- AI/ML: Uses LLMs but constrains them to company-provided context only (not open-web or general LLM knowledge) when discussing employer details. Does not train models on customer data.
- The team brought robotics/AI background from Covariant (AI for robotic manipulation), suggesting strong ML engineering depth.

**Key integrations:**
- **ATS:** Greenhouse, Ashby, Lever (bi-directional sync). Also includes its own built-in ATS.
- **Calendars:** Google Calendar, Outlook
- **Communication:** Slack (primary interaction channel), Zoom, Google Meet
- **HRIS:** Not publicly documented
- **Assessment:** Not publicly documented

**API availability:** Not publicly documented.

**AI/ML approach:**
- Agentic architecture — Max operates autonomously within defined guardrails
- Context-constrained LLM usage (company-specific context only, not general web knowledge)
- Tuned for reliability and predictability with recruiting domain expertise baked in
- No autonomous rejection decisions (human-in-the-loop for adverse actions)
- Bias-audited by third party across 18 protected-class demographics with no measured bias on audited use cases

## Pricing
- **Pricing model:** Tiered based on planned number of hires; contact sales for quote.
- **Known price range:** Estimated $1,000–$10,000/year depending on user count and candidate volume.
- **Positioning:** Priced at 5x–10x ROI vs. alternatives; full year with Max described as less expensive than a single agency hire.
- **Free tier or trial:** Not publicly documented.

## Competitive Positioning

**Key differentiators:**
- Fully autonomous agent (not a copilot or workflow tool) — handles end-to-end recruiting with minimal human input
- Slack-native conversational interface for delegation
- Explainable, auditable AI decisions with third-party bias certification
- Built-in ATS option for teams without existing systems
- 750M profile sourcing database included

**Strengths:**
- True agentic approach — Max proactively executes tasks rather than waiting for prompts
- Strong compliance posture (SOC 2, CCPA, bias audit, no autonomous rejections)
- Clean integration with popular ATS/calendar/communication tools
- Founding team with deep ML/engineering pedigree (Google, Covariant, Pinterest, Thumbtack)
- Low-cost alternative to agencies and additional headcount

**Weaknesses / gaps:**
- Acquired by Headway (March 2026) — product future is uncertain; team pivoted to mental health care
- Very small team (~8 people) limits product breadth and support capacity
- No documented HRIS integrations, assessment tool integrations, or public API
- Focused on professional/desk-worker roles only — not suited for blue-collar, hourly, or specialized hiring
- Opaque pricing; no self-serve signup or free trial documented
- Limited to sourcing, screening, and scheduling — no interview intelligence, offer management, or onboarding features
- Reliance on AI may reduce human touch, potentially missing candidates with non-standard backgrounds

**How they compare to an AI agent-first approach:**
- Tezi validates the market thesis that fully autonomous AI agents (not copilots) can handle recruiting workflows end-to-end.
- Their architecture — agentic AI with human-in-the-loop for rejection decisions — is a sound pattern worth emulating.
- Key gap: Tezi focused narrowly on sourcing/screening/scheduling. A more comprehensive AI agent-first ATS could extend agents into interview scoring, offer negotiation, onboarding, and multi-channel candidate engagement.
- Their acqui-hire by a non-recruiting company (Headway) suggests the product alone may not have achieved sufficient PMF or scale at seed stage — a cautionary signal about go-to-market in this space.
- The built-in ATS is a smart play for startups; an AI agent-first ATS should similarly consider being the system of record rather than just an overlay on existing ATS platforms.

## Sources
- https://tezi.ai/
- https://tezi.ai/for-operators
- https://tezi.ai/for-founders
- https://tezi.ai/for-heads-of-talent
- https://tezi.ai/about
- https://blog.tezi.ai/p/tezi-raises-9m-to-launch-max-the
- https://blog.tezi.ai/p/the-future-of-recruiting-is-now-tezis
- https://blog.tezi.ai/p/explainable-audited-accountable
- https://venturebeat.com/business/meet-max-tezis-ai-powered-recruiting-partner-transforming-the-hiring-process
- https://www.8vc.com/resources/ready-ai-hire-announcing-our-investment-in-tezi
- https://www.prnewswire.com/news-releases/headway-acquires-team-behind-tezi-to-advance-human-centered-ai-in-mental-health-care-302729806.html
- https://www.fiercehealthcare.com/health-tech/mental-health-provider-platform-headway-acquires-team-behind-ai-company-tezi
- https://tracxn.com/d/companies/tezi/__2ZLWJfwhXE-jH1gXv-_MbYgkHctYlReOQRq4BO_QJMo
- https://www.crunchbase.com/organization/tezi
- https://www.herohunt.ai/blog/tezi-ai-recruiting-pricing/
- https://www.dhrmap.com/news/tezi-raises-9m-to-launch-max-the-first-fully-autonomous-ai-recruiter
- https://www.gomokka.com/resources/choosing-ai-recruiting-partner.html
