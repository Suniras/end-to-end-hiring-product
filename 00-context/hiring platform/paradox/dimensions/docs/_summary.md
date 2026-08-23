---
dimension: docs
target: paradox
status: partial
access_grade_used: presence:rich (product-help axis) / presence:thin-to-absent (developer-docs axis)
method: crawl-clip
completeness_pct: 90
confidence: medium
captured_at: 2026-08-09
sources:
  - https://paradox.helpjuice.com/
  - https://paradox.helpjuice.com/sitemap.xml
  - https://paradox.helpjuice.com/questions.atom
  - https://paradox.helpjuice.com/glossary_terms.json
  - https://paradox.helpjuice.com/en_US/workday-feature-descriptions (+ 4 articles)
  - https://www.paradox.ai/the-conversation
  - https://www.paradox.ai/resources-type/reports
  - https://www.paradox.ai/report/the-impact-of-ai-on-the-candidate-experience
  - https://info.paradox.ai/hubfs/Content%20Marketing%20Assets/Apt_Paradox_AI_Report-0324_Rev5%20(1).pdf (HEAD only)
gaps:
  - "**CORRECTED BY MODE-5 ITERATION 2 — this dimension asserted a false absence.** The original text read: 'No developer/API documentation exists at all (docs.paradox.ai and developer.paradox.ai both fail DNS resolution — confirmed absence, not a crawl miss).' The DNS observation is correct; **the conclusion drawn from it is wrong.** A real, actively-maintained 55-page **API Developer Hub exists at `readme.paradox.ai`** (ReadMe.io-hosted, zero auth, serving 53 verbatim OpenAPI 3.1 fragments) — found by the sibling `api` dimension by following an on-page link from `www.paradox.ai/partners/integrations`. This dimension MISSED it because it probed only guessable subdomains and never followed the marketing site's own integration/partner links (an ingestion §7 rule-10 miss: an absence asserted that contradicts a sibling, with no second-method re-check). **Corrected claim: no developer docs exist on a guessable `paradox.ai` subdomain; the developer docs are off-domain and link-reachable only.** See `dimensions/api/_summary.md` and `evaluation/data-model-api-surface.md`."
  - "The public Helpjuice KB may have additional categories gated behind a customer/admin login — a 'View More Categories' button is present but is standard Helpjuice theme boilerplate and did not resolve to any hidden category via sitemap/atom-feed/direct-nav probing. Genuinely unverified whether gated content exists behind it."
  - "The KB covers only 4 of Paradox's ~8 named Conversational-X products (Apply, Interview Scheduling, Career Site, Hiring Team Experience) — Conversational ATS, CRM, Events, Scheduling(-standalone), Campus Events, and Traitify Assessments have zero public KB coverage."
  - "Did not download/read the full 14.6MB Aptitude Research PDF body — confirmed publicly downloadable and its topic, but distilled from the landing-page summary, not the full PDF text (out of scope for docs dimension; would belong to community/competitive-positioning if deeper analyst-report content were needed)."
---

# Paradox — Docs capture

> **⚠️ Mode-5 correction (iteration 2).** This capture concluded "no developer/API documentation exists
> at all" from two DNS negatives. That conclusion is **refuted** — `readme.paradox.ai` serves a real
> 55-page API Developer Hub, found by the sibling `api` dimension via an on-page link. Read every
> "no developer docs" statement below as **"no developer docs on a guessable subdomain."** See the
> corrected `gaps:` entry above.

## Method

Checked `docs.paradox.ai` and `developer.paradox.ai` first (both DNS-fail — `000`; **this was
over-interpreted at the time as proving no developer-docs surface exists — see the correction above**). Then crawled the one genuine documentation
surface, the hosted Helpjuice knowledge base at `paradox.helpjuice.com`: fetched the root page, the
sitemap, the public `questions.atom` content feed (which serves full article HTML with zero
authentication), and a `glossary_terms.json` data endpoint discovered via an inline glossary-widget
script reference. Cross-checked the "+ More Categories" UI element for hidden gated content (inconclusive
— standard theme boilerplate, no resolvable additional category found). Separately verified the two
Resources-nav items named in the dispatch brief — "The Conversation" and "Reports" — by fetching each
landing page and one representative Report detail page, plus a HEAD request confirming the linked
Aptitude Research PDF is ungated and publicly downloadable.

## Findings

### The Helpjuice KB is genuinely public — no login wall

Contrary to the common Helpjuice-instance pattern (gated behind a login), `paradox.helpjuice.com` returns
200 with full content, unauthenticated, from every angle tested (root page, category page, individual
articles, the atom feed, and the JSON glossary endpoint). **Record this as a confirmed access grade of
`presence: partial-but-genuinely-public`, not a login-gated blind spot.**

### But the public content is extremely narrow: one category, four articles

| Section | Pages | Nature |
| --- | --- | --- |
| Workday Feature Descriptions (the only public category) | 4 articles | Feature-capability descriptions for 4 of ~8 Conversational-X products |
| Internal glossary | 15 terms (`glossary_terms.json`) | Admin-console jargon (CEM, CVO, NOH, OIT, System Attribute, token, etc.) |
| "The Conversation" (Resources nav) | content hub | Customer-interview webinars/blogs — thought leadership, NOT documentation |
| "Reports" (Resources nav) | content hub | Third-party analyst research + case studies (Bersin, Aptitude Research, National Restaurant Association) — marketing/industry-research, NOT documentation |

The KB's real purpose reads as a **Workday-marketplace partner feature-description listing** (the
category is literally named "Workday Feature Descriptions," all 4 articles read like the standardized
capability-disclosure format Workday requires of marketplace partner apps, and one article contains the
verbatim clause: *"Conversational Career Site functionality - requires a separate services agreement
with Workday for implementation"*) rather than a general customer/admin product manual. It is genuine,
first-party, and citable — just narrow in scope.

### The internal glossary is the most load-bearing artifact found

`glossary_terms.json` (undocumented, discovered via an inline widget reference, zero auth) is a 15-term
admin-jargon glossary that materially corroborates and extends other dimensions' findings:
- Confirms the console's internal name is **"CEM"** (glossary text: "…throughout the CEM…"), matching
  the App Store listing title "Olivia by Paradox - CEM" found by `distribution-artifacts` — an
  independent cross-dimension corroboration of the console's real product name.
- Names concrete admin features not visible anywhere on the marketing site: **CVO** (Candidate Volume
  Optimizer — per-requisition volume throttling), **NOH** (Number of Hires — auto job-close trigger),
  **OIT** (Open Interview Times), **Job Data Package** (location-level job config), **System
  Attribute**/**token** (a messaging-templating data model spanning candidate/job/location/event scope).
- Reveals a CS-rep-mediated configuration model for at least two features: "Assistant Messaging" (default
  AI messages) is described as "access to this page is limited — contact your CS Representative," and
  "Next Step" (custom workflow status transitions) is "set up on the backend by your CS Representative"
  — i.e. Paradox's admin console is **not fully self-serve**; some configuration requires a Paradox
  Customer Success rep to make backend changes, a real product/GTM-model signal.
- Reveals product-naming churn: Capture→Apply, Care→Q&A, Rating→Surveys — legacy names still surfacing in
  UI copy, evidence of at least two rounds of product rebranding.

### "The Conversation" and "Reports" verified — neither is technical documentation

Both are content-marketing hubs, confirmed by direct content inspection (not just inferred from naming):
"The Conversation" is customer-interview webinars/blog posts (a thought-leadership franchise reusing the
"conversational" wordplay); "Reports" is third-party analyst research (Aptitude Research, Bersin/Josh
Bersin Company, National Restaurant Association) plus case studies, one PDF verified as directly
downloadable with no lead-gen gate. Neither contains API specs, architecture whitepapers, or
security/compliance detail — see `raw/resources-hub.md`.

## Inferences

- Paradox's documentation posture is a direct product of its go-to-market: it sells to enterprise
  HR/TA buyers via a sales-led, high-touch (CS-rep-mediated) model, not to developers via self-serve
  API. The complete absence of a developer-docs subdomain plus the CS-rep-gated config features in the
  glossary both point the same direction — this is a **configured-for-you enterprise SaaS**, not a
  build-on-us platform, at least on the current public surface.
- The one public KB category being Workday-specific implies Paradox maintains (or maintained) other
  partner-specific KB categories privately for its other major HRIS integrations (SAP SuccessFactors,
  Oracle, Indeed — all named as partners on the marketing site) — plausible given ATS/HRIS marketplaces
  commonly require this disclosure format from every partner, but this is inference, not observed (the
  "+ More Categories" ambiguity above is the direct evidence gap).
- The i18n locale switcher (en_US/es_MX/fr_CA) on a KB whose only visible content is English confirms
  Paradox serves (or plans to serve) French-Canadian and Mexican-Spanish enterprise customers — consistent
  with the named customer logos (multinational retail/hospitality/QSR chains).

## Open questions

- Does the "+ More Categories" button gate real additional KB content (other-HRIS feature descriptions, a
  general admin manual, troubleshooting articles) behind a customer login, or is it simply unused theme
  boilerplate with nothing behind it? Unverified — would need an authenticated Paradox customer account
  to check (out of scope for this dimension/run; `auth: none` for this target).
- Is there a genuinely separate, gated admin/help portal inside the CEM console itself (in-app help,
  tooltips, a "?" menu) distinct from the public Helpjuice KB? Not observable without a `session`
  dimension (absent for this target per `00-recon-plan.md`).
- Full text of the Aptitude Research / Bersin PDFs was not read — if a future run needs the analyst
  research's actual findings (vs. this run's landing-page-level summary), those PDFs are directly
  fetchable (see Artifacts).

## Artifacts

- `raw/doc-map.md` — full page index: subdomain-DNS checks, the Helpjuice KB structure, "The
  Conversation" + "Reports" content-type verification, and the KB-vs-product-catalog cross-reference.
- `raw/helpjuice-kb.md` — distilled content of all 4 KB articles (Conversational Apply, Conversational
  Interview Scheduling, Conversational Career Site, Hiring Team Experience) + the full 15-term internal
  glossary with console-structure inferences.
- `raw/resources-hub.md` — "The Conversation" and "Reports" content-type verification detail (webinar/
  report titles, the confirmed-ungated Aptitude Research PDF URL).
