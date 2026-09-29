<!-- source: paradox.helpjuice.com + www.paradox.ai/the-conversation + www.paradox.ai/resources-type/reports · captured_at: 2026-08-09 · method: crawl-clip -->

# Paradox — Documentation Surface Map

## 0. Subdomains checked for developer/API docs (both absent)

| Host | Result |
| --- | --- |
| `docs.paradox.ai` | DNS does not resolve (curl exit `000`) |
| `developer.paradox.ai` | DNS does not resolve (curl exit `000`) |

No public developer/integration-docs subdomain exists for Paradox. This is a genuine absence, not a
crawl miss — both hosts fail at DNS resolution, not at HTTP.

## 1. `paradox.helpjuice.com` — the hosted Helpjuice knowledge base (PUBLIC, un-gated)

Confirmed publicly reachable with no login wall: root page 200, `sitemap.xml` lists every article,
`questions.atom` (Helpjuice's public content feed) serves full article HTML bodies verbatim, and a
`glossary_terms.json` endpoint serves a 15-term internal-terminology glossary — all with zero
authentication.

| Page | Depth | Content |
| --- | --- | --- |
| `/` (home) | D0 | KB landing page. Nav shows exactly ONE category: "Workday Feature Descriptions." Locale switcher: en_US / es_MX / fr_CA (i18n signal — Paradox serves French-Canadian + Mexican-Spanish customer bases). |
| `/en_US/workday-feature-descriptions` | D1 (category) | The only category in the public KB. Lists all 4 articles below. |
| `/en_US/workday-feature-descriptions/conversational-apply` (canonical short URL `/conversational-apply`) | D2 (article) | "Conversational Apply" feature description |
| `/en_US/workday-feature-descriptions/conversational-interview-scheduling` (`/conversational-interview-scheduling`) | D2 | "Conversational Interview Scheduling" feature description |
| `/en_US/workday-feature-descriptions/conversational-career-site` (`/conversational-career-site`) | D2 | "Conversational Career Site" feature description |
| `/en_US/workday-feature-descriptions/hiring-team-experience` (`/hiring-team-experience`) | D2 | "Hiring Team Experience" feature description |
| `/glossary_terms.json` | data endpoint | 15-term internal-jargon glossary (Assistant Messaging, Capture, CVO, Hot Jobs, Inquiry Detection, Job Data Package, Next Step, NOH, OIT, Paradox Jobs, Q&A, Rating, SSO, System Attribute, token) |
| `/questions.atom` | feed | Atom feed of all 4 KB articles, full HTML content, byline "Lindsey Stanifer" for all 4 |

**A "+ More" "View More Categories" button appears on the category page** — this is standard Helpjuice
theme boilerplate (present even with a single category) and did not resolve to any additional visible
category via the sitemap, the atom feed, or direct navigation. Whether it gates additional
customer-only/admin-only KB content behind a separate login is **unverified** — recorded as an open
question, not asserted either way.

## 2. "The Conversation" (`www.paradox.ai/the-conversation`) — VERIFIED: blog-adjacent thought-leadership hub, NOT technical documentation

Confirmed by content inspection: a filterable content hub (filters: Topic, Industry, Content-type,
Integration, Product) surfacing customer-interview webinars ("The Conversation with Compass Group and
John Vlastelica," "The Conversation with Touchmark's Director of Talent Density…"), blog posts, and
client-story videos. Zero technical/API/admin-configuration content. This is marketing content
production under a branded content-hub name — the name "The Conversation" is a wordplay on Paradox's
"conversational AI" positioning, not a signal of technical documentation.

## 3. "Reports" (`www.paradox.ai/resources-type/reports`) — VERIFIED: third-party analyst research + case studies, publicly downloadable, NOT technical

Confirmed by content inspection + one verbatim fetch: the Reports section is third-party analyst
research Paradox has licensed/co-branded (Aptitude Research, Bersin/Josh Bersin Company, National
Restaurant Association) plus customer case-study write-ups (Compass Group, General Motors, Harvard
Business Review guest piece). One report PDF was verified directly downloadable, no gate/form:

- `https://info.paradox.ai/hubfs/Content%20Marketing%20Assets/Apt_Paradox_AI_Report-0324_Rev5%20(1).pdf`
  (Aptitude Research, "The Impact of AI on the Candidate Experience") — HTTP 200, `content-type:
  application/pdf`, 14.6 MB, served from a HubSpot CMS hub (`info.paradox.ai`) behind CloudFront.

Content is industry-research / thought-leadership, not a technical spec, API reference, or admin manual.

## 4. Cross-reference: KB feature names vs. website product names

The KB's 4 Workday-facing feature descriptions map 1:1 onto 4 of the ~8 "Conversational X" products
named on the marketing site (`www.paradox.ai/products/*` and repeated in the Reports/Conversation filter
facets): Conversational Apply, Conversational ATS, Conversational Career Sites, Conversational CRM,
Conversational Events (+ "Campus Events," "Traitify Assessments" as sub-brands), Conversational
Scheduling. The KB does not cover Conversational ATS, Conversational CRM, or Conversational Events
directly — its scope is narrower than the full product line, consistent with the KB's real purpose being
a **Workday-marketplace partner feature-description listing**, not a general customer admin manual.
