<!-- source: paradox.helpjuice.com/questions.atom + /glossary_terms.json · captured_at: 2026-08-09 · method: crawl-clip -->

# Paradox — Helpjuice KB: distilled content (verbatim feature-description text)

The entire public KB is ONE category ("Workday Feature Descriptions") containing exactly 4 articles, all
authored by "Lindsey Stanifer" (a Paradox employee, public byline — not redacted; this is a published
KB author credit, not private PII), all last-updated 2026-07-22. This reads as a Workday
marketplace/partner-app compliance artifact (the kind of feature-description doc Workday requires from
partner apps listed in its marketplace), not a general-purpose admin console manual — it never covers
"how to configure X in the console," only "what this module supports."

## Conversational Apply

Automates candidate communication + data management through the talent-acquisition process. Capabilities
enumerated: build/manage conversations, content, and web tools (landing pages, widgets); bi-directional
integrations with third-party systems (calendars, room-booking tools); collect candidate data via
conversational responses, secure forms, or traditional form fields; candidate job-preference input +
chatbot job search; automated follow-up based on outstanding tasks; automated candidate-progression
based on collected data/hiring-stage/attributes; role-based access control; integrated metrics/tracking
for hiring-process performance + candidate feedback; QR-code + keyword job advertising; custom data
attributes on entities; SMS-based employee referrals; an assistant that answers candidate/user FAQs.

## Conversational Interview Scheduling

Automates the interview process end-to-end (initial scheduling → feedback collection) across interview
types/platforms. Capabilities: pre-interview application review; bi-directional third-party integrations
(calendars, room-booking); interview-feedback collection/management from the hiring team; a centralized
dashboard managing phone/in-person/virtual interview types; candidate + interview-team info delivery for
upcoming interviews; automated scheduling-invitation + follow-up-reminder sends keyed to job
qualifications/workflow triggers; automated scheduling/rescheduling/cancellation across multi-person,
multi-day, panel, and sequential interview formats; video interviews via preferred third-party platforms
OR a native video tool (Paradox ships its own video-interview capability, not solely a
third-party-embed).

## Conversational Career Site

Branded career-site creation, hosting, and management. Capabilities: performance/traffic analytics;
visual layout/branding design; job + org-content display; distribution to external job boards; responsive
navigation incl. mobile; hosted infrastructure + maintenance; content/media/translation management;
SEO support. Notable gating clause verbatim: **"Conversational Career Site functionality - requires a
separate services agreement with Workday for implementation"** — i.e. this specific module, when sold
through the Workday marketplace, needs an additional Workday-side services contract beyond the base
Paradox subscription (a real packaging/GTM signal for the Workday channel specifically).

## Hiring Team Experience

Integrated management of job requisitions, candidate offers, and post-hire admin tasks via automatable
workflows. Capabilities: data/document collection for onboarding + background checks; integrations with
external systems for requisition-status sync; a review layer for key recruiting documents; automated
offer creation + delivery; per-requisition candidate-volume-limit configuration (see CVO in the
glossary below — this is the console feature behind that limit); keyword-SMS-based job-seeker screening.

---

## Internal terminology glossary (15 terms, from `glossary_terms.json` — a genuine admin-console jargon
list, useful for reading Paradox screenshots/UI copy correctly)

| Term | Meaning |
| --- | --- |
| **CEM** | Not itself a glossary entry, but the console is referred to throughout the glossary as "the CEM" (Candidate Experience Manager) — corroborates the App Store listing name "Olivia by Paradox - CEM" (distribution-artifacts dimension) as the console's real internal name. |
| **Assistant Messaging** | The console page housing default AI-Assistant messages; editable, but "access to this page is limited" — a permissions-gated admin sub-page. |
| **Capture** | Legacy/internal name for the Apply product; still visible in some UI surfaces. |
| **CVO** (Candidate Volume Optimizer) | Controls how many candidates reach a given Candidate Journey stage — the mechanism behind "candidate volume limits per job requisition" named in the Hiring Team Experience article. |
| **Hot Jobs** | Jobs flagged high-priority for increased candidate exposure; surfaced at the top of candidate-facing job search results. |
| **Inquiry Detection** | The AI Assistant's ability to distinguish a candidate asking a question from a candidate answering the screening question — an NLU/intent-classification feature of Olivia. |
| **Job Data Package** | Location-level job-data configuration object: base pay, minimum age, employment type, etc. |
| **Next Step** | A custom action/status-transition configured by the CS (Customer Success) rep on the backend — implies status-workflow configuration is partly CS-mediated, not fully self-serve for the customer admin. |
| **NOH** (Number of Hires) | Feature that notifies/auto-turns-off a job once a set number of candidates reach "Hired" status. |
| **OIT** (Open Interview Times) | Interviewer availability windows. |
| **Paradox Jobs** | Jobs created/managed natively in Paradox, tied to the Conversational ATS product (as distinct from jobs synced in from an external ATS like Workday). |
| **Q&A** (formerly "Care") | The FAQ-answering feature for candidates/users about company/culture/benefits — a renamed legacy feature ("Care" → "Q&A"), evidence of product-naming churn over time. |
| **Rating** | Legacy term for the Surveys product. |
| **SSO** | Single Sign-On — standard enterprise auth capability. |
| **System Attribute** | Stored candidate/job/location data fields; usable as message tokens, tied to conversation questions, etc. |
| **token** | A dynamic placeholder (event/conversation/candidate/job/location-scoped) used in mass communications, forms, and offers — the templating mechanism behind Paradox's messaging system. |

### Reading the glossary as an admin-console structural signal

Several entries above are themselves evidence of the admin console's information architecture even
though no console screenshot was captured (no session dimension for this target): a permissions-gated
"Assistant Messaging" settings page; a "Next Step"/status-workflow configuration surface that is partly
CS-rep-mediated rather than fully self-serve; a "System Attribute" + "token" templating system
underpinning messaging/forms/offers; and legacy-vs-current naming pairs (Capture→Apply, Care→Q&A,
Rating→Surveys) indicating at least two rounds of product rebranding visible in leftover UI copy.
