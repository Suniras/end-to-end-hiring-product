# Paradox — Product Features & Capabilities

> Cross-dimension rollup (Mode 3). Every claim is anchored `(dimension: artifact · method · confidence)`
> using each dimension's own provenance frontmatter. Weighting per `evaluation.md`: max-of-sources,
> promoted one band only on ≥2 *independent* dimensions (`website`+`docs` count as **one** source for
> feature claims), conflicts flagged rather than averaged.

## What it does

Paradox sells one thing: a conversational AI assistant ("Olivia") that runs the high-volume frontline
hiring funnel over the channels a shift worker already uses — SMS, WhatsApp, Facebook Messenger, web
widget, email — so that applying, screening, scheduling, offering, and onboarding all happen inside a text
conversation instead of inside forms. The candidate never logs into anything; the recruiter works a
console ("CEM" — Candidate Experience Manager) that is a triage inbox of conversations, not a requisition
database. Paradox explicitly does **not** position itself as a system of record: the repeated, verbatim,
four-page marketing line is *"Enhance your entire hiring lifecycle without replacing your system of
record"* (website: raw/partners-integrations.md · crawl-clip · medium), and the product is engineered to
match — a 37-field Candidate entity carrying `hirevue_link` / `pymetrics_link` / `adp_link` and a
`use_paradox_status_map` / `status_map_name` status-translation layer whose only purpose is to project
Paradox's internal candidate stages onto somebody else's ATS vocabulary (api: raw/endpoint-catalog.md ·
openapi-verbatim · high). The buyer is an enterprise with tens of thousands of hourly roles — Chipotle,
7-Eleven, Compass Group, GM, plus CT-log-confirmed tenants never on the logo wall: Aramark, Darden, FedEx,
Lowe's, PepsiCo, Unilever, Prudential (infra-backend-fingerprint: raw/dns-and-subdomains.md ·
dns-ct-fingerprint · medium).

---

## Feature map

Maturity vocabulary: **GA-observed** = the capability is corroborated by a runtime artifact (an API
operation, an admin route string, a product screenshot) independent of marketing · **GA-marketed** =
claimed by website/docs and consistent with observed architecture, but no independent runtime lane touched
it · **flag-gated** = an observed live feature flag · **roadmap** = vendor-disclosed as not yet shipped.

### A. The candidate-facing conversational engine (the core)

| Capability | User | Maturity | Evidence (anchored + tagged) |
| --- | --- | --- | --- |
| Conversational apply over SMS / WhatsApp / Messenger / web widget / email — no forms, no login | Candidate | GA-observed | 5 of 13 Statuspage components are literally the channel list — SMS, Site Widget, WhatsApp, Email, Facebook Messenger, grouped under "Conversations" (community: raw/statuspage-components.json · crawl-clip · medium); Twilio+SendGrid named as the SMS/email sub-processor (infra: raw/sub-processors.md · dns-ct-fingerprint · medium); recruiter-side transcript visible in-product (distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high) |
| Automated screening against configurable job requirements | Candidate / Recruiter | GA-marketed | website: raw/products.md · crawl-clip · medium — **note: "Conversational Apply" and "Screening" are the same capability, see reconciliation §1** |
| Text-to-Apply via QR code / SMS keyword / short-code sourcing | Candidate | GA-marketed | website: raw/products.md · crawl-clip · medium |
| 24/7 candidate Q&A (pay, benefits, logistics, culture) with employer-page citations | Candidate | GA-observed | transcript screenshot shows Olivia answering "tell me about the culture" with an outbound link to the employer's own careers page (distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high) |
| Automated interview self-scheduling, rescheduling, reminders, panel/group sessions | Candidate / Recruiter | GA-observed | `PUT /interview/interview_alerts` with an 18-value `interview_type` enum (IN_PERSON / PHONE / VIRTUAL / GROUP_SESSION / INTERVIEW_PREFERENCE / BREAK …), `/interview/get_setting`, `/interview/interview_history`, Rooms CRUD (api: raw/endpoint-catalog.md · openapi-verbatim · high); ~40 `lead-interview/*` + `external/*` scheduling routes (deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium) |
| Branded short-link delivery of scheduling options (`oli.vi/<token>`) | Candidate | GA-observed | observed in a live product screenshot (distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high) **and** independently resolved live, 308 → `olivia.paradox.ai`, `noindex,nofollow` (infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium) — **two independent dimensions → fact** |
| Multi-language conversation | Candidate | GA-observed | the API enumerates **57 language/locale codes** for `language_preference` (api: raw/endpoint-catalog.md · openapi-verbatim · high) — this is the hard number; see reconciliation §5 for the marketing "100+ / 30+" conflict |
| Automated text offer letters (`offer_letter`, `offer_file_name` on Candidate) | Candidate / Recruiter | GA-observed | api: raw/endpoint-catalog.md · openapi-verbatim · high |
| Recorded-video screening answers + live in-browser interviews (Zoom / Teams / Webex / Skype / BlueJeans) | Candidate | GA-marketed | website: raw/products.md · crawl-clip · medium; a live flag `ai_interview_page:enabled_new_ui` shows an "AI interview page" surface under active UI work (deployed-client-bundle: _shared/feature-flags.md · bundle-string-mine · medium) |
| Résumé parsing + AI role recommendation ("Olivia can read a résumé") | Candidate | GA-observed, **licensed not homegrown** | marketing claim (website: raw/products.md · crawl-clip · medium) reconciled against **Textkernel/Sovren** named as the résumé-and-job-parsing sub-processor and **Google LLC** for "semantic matching / NLP / Talent solutions" (infra: raw/sub-processors.md · dns-ct-fingerprint · medium) |
| Career-interest assessment (RIASEC) + personality assessment | Candidate | GA-observed | "Traitify Assessment" is one of the 13 monitored Statuspage components (community: raw/statuspage-components.json · crawl-clip · medium); Traitify = **Woofound, Inc., an acquired Paradox product**, not a partner ("support and maintenance exclusively for Traitify Services") (infra: raw/sub-processors.md · dns-ct-fingerprint · medium); Traitify CDN/API hosts appear in the live CSP (infra: raw/security-headers.md) |

### B. Multi-tenant persona theming — the white-label assistant (a real capability, not marketing color)

| Capability | User | Maturity | Evidence |
| --- | --- | --- | --- |
| The assistant's **name, avatar image, voice and tone are per-tenant configurable** — customers ship Olivia under their own brand | Admin (config) / Candidate (experienced) | **GA-observed → fact** | Five independently-branded deployments verbatim on the site: Chipotle → *"Ava Cado"*, 7-Eleven → *"Rita"*, GM → *"Ev-e"*, a franchise customer → *"Mia"*, the Express Care SKU → *"Becky"* (website: raw/solutions-usecases.md · crawl-clip · medium) — **and the public API exposes the exact primitive that implements it: `GET /company/ai` → "Get AI Assistant (name + image)"** (api: raw/endpoint-catalog.md · openapi-verbatim · high). Two independent dimensions (marketing evidence + a machine-verbatim API operation) → promoted to fact. |
| White-label extends to **native mobile app builds per enterprise customer** | Recruiter / hiring manager | GA-observed | "Regis + Paradox CEM" ships as its own iOS (`com.paradox.regis`) and Android (`ai.paradox.regis`) build alongside the flagship (distribution-artifacts: raw/{ios,android}-*-listing.md · binary-extract · high), corroborated by a `regis.paradox.ai` tenant subdomain family in CT logs (infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium) |
| White-label extends to **per-tenant hostnames** (`<customer>.paradox.ai`, `chrome.<customer>`, `<customer>api`, `job.<customer>`, `<customer>status`) | Admin | GA-observed | infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium |

This is the most under-rated capability in the run. The same engine is re-skinned per tenant at four
layers at once — persona name/avatar, conversation tone, mobile app binary, and DNS hostname — which is
what makes a single multi-tenant conversational product feel bespoke to a 100,000-employee brand.

### C. The recruiter console (CEM) — and the recruiter-facing AI copilot marketing never mentions

| Capability | User | Maturity | Evidence |
| --- | --- | --- | --- |
| **"CEM" = Candidate Experience Manager** is the console's real internal name | Recruiter | GA-observed → fact | App Store listing title "Olivia by Paradox - CEM", stated verbatim as "Paradox CEM (Candidate Experience Manager)" on every listing (distribution-artifacts: raw/ios-app-store-listing.md · binary-extract · high) **and** independently in the KB's internal glossary ("…throughout the CEM…", `glossary_terms.json`) (docs: raw/helpjuice-kb.md · crawl-clip · medium) **and** as the legacy admin app's `<title>` string (deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium) — three independent lanes → fact |
| Candidate triage inbox: status pills (Interview Scheduled / Pending / Canceled / Capture Incomplete), sort by most-recent-activity, thousands-scale counts | Recruiter | GA-observed | distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high; `/candidates/inbox`, `/candidates/management`, `/list-filters` (deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium) |
| 4-tab candidate profile: **Conversation / Résumé / Notes / Hire Details** | Recruiter | GA-observed | distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high; corroborated by the API's Candidate schema carrying `resume`, `note`, `hired_date`, `candidate_journey_status` (api: raw/endpoint-catalog.md · openapi-verbatim · high) |
| **Human takeover of the AI conversation** — a recruiter can inject into the live Olivia↔candidate thread at any point, and the composer retargets to the candidate's actual channel ("Send an email" vs "send a message") | Recruiter | GA-observed | distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high; `POST /candidates/send_message` is the public-API equivalent (api: raw/endpoint-catalog.md · openapi-verbatim · high) |
| **"Assist" — a voice-enabled AI copilot for the RECRUITER**, distinct from the candidate-facing bot ("I need to schedule an interview" / "When is my next interview?" / "How do I update my availability?") | Recruiter / interviewer | **GA-observed → fact, and entirely unmarketed** | A labelled "Assist" button + the opened copilot panel with a microphone control, in first-party App Store screenshots (distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high) **and** independently as router paths `/assist`, `/assist/calendar`, `/assist/scheduling_action` string-mined from the admin bundle (deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium). Two independent dimensions → fact. **It appears nowhere on the 13 product pages, nowhere in the KB, and nowhere in the 53-operation public API.** See reconciliation §3. |
| **Olivia Extension** — a LinkedIn-embedded sourcing companion (answer a candidate, propose interview slots, push a new candidate into the pipeline without leaving LinkedIn) | Recruiter / sourcer | GA-observed | a third, separately-listed distribution artifact, macOS/Safari Web Extension `ai.paradox.brext`, released 2025-06, v2.5.5 (distribution-artifacts: raw/olivia-browser-extension-listing.md · binary-extract · high) — also absent from website and docs |
| Per-candidate view/read-receipt audit trail ("Company Admin viewed", dated) | Recruiter / compliance | GA-observed | distribution-artifacts: raw/screenshot-catalog.md · binary-extract · high |
| Unified login identity: **phone / email / Employee ID in one field**, plus SSO via ADP, Google, Microsoft Entra ID, SmartRecruiters, Facebook | Recruiter | GA-observed | login screenshot (distribution-artifacts · binary-extract · high); `/api/_auth/callback/{adp,google,microsoft-entra-id,smartrecruiters,facebook}` (deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium); `/users/employees/{employee_id}` addressing throughout the API (api · openapi-verbatim · high) |
| Mobile console for frontline/store managers (iOS + Android, single coordinated release train, maintained continuously since Jan 2018) | Hiring manager | GA-observed | distribution-artifacts: raw/{ios,android}-*-listing.md · binary-extract · high |

### D. Admin / configuration depth (the largest surface in the product, almost none of it marketed)

All from the string-mined admin router (deployed-client-bundle: raw/route-table.md · bundle-string-mine ·
medium), several corroborated by the KB's internal glossary (docs: raw/helpjuice-kb.md · crawl-clip ·
medium) — **two independent dimensions on the named overlaps → fact**:

| Configuration capability | Route | Corroboration |
| --- | --- | --- |
| **Candidate Volume Optimizer (CVO)** — per-requisition applicant-volume throttling | `/settings/candidate-volume-optimizer` | glossary defines CVO verbatim (docs) → **fact** |
| **Number of Hires (NOH)** auto job-close trigger | (glossary) | docs: raw/helpjuice-kb.md |
| **Open Interview Times (OIT)** | (glossary) | docs: raw/helpjuice-kb.md |
| **Job Data Packages** — location-level job configuration | `/settings/job-data-packages` | glossary → **fact** |
| **System Attributes / tokens** — a messaging-templating data model scoped across candidate / job / location / event | `/settings/system-attributes` | glossary → **fact** |
| Job builder · Interview builder · Approvals builder · Forms · Applicant flows | `/settings/{job-builder,interview-builder,approvals-builder,forms,applicant-flows}` | single-source (bundle) |
| **Workflows / Journeys** (candidate journey state machines; `candidate_journey` + `candidate_journey_status` are first-class Candidate fields) | `/settings/{workflows,journeys}` | api: raw/endpoint-catalog.md · openapi-verbatim · high → **fact** |
| Round-robin interviewer assignment | `/settings/round-robin-management` | single-source (bundle) |
| Assistant Messaging (default AI message copy) · Assistant Reminders · Conversations | `/settings/{assistant-messaging,assistant-reminders,conversations}` | glossary → **fact**, and see the CS-rep gate below |
| WhatsApp templates · phone-number management | `/settings/{whatsapp-templates,phone-numbers}` | single-source (bundle), consistent with the Twilio sub-processor line |
| Knowledge base (what Olivia answers Q&A from) | `/settings/knowledge-base` | single-source (bundle) |
| Site Studio / CMS — the career-site builder | `/site-studio`, `/cms` | corroborated by a distinct multi-tenant career-site host family `sites.paradox.ai` (infra · dns-ct-fingerprint · medium) → **fact** |
| Integration Center v2 · data feeds · alert management | `/integration-center-v2`, `/settings/{data-feeds,alert-management-v2}` | single-source (bundle) |
| RBAC: users, groups, roles, **location-scoped permissions** | `/settings/{users,group-management,location-management}` | api has 12 User/role/location-permission ops incl. `add_location_permission` (openapi-verbatim · high); the Nuxt shell exposes `/api/casl-ability` (CASL authorization) → **fact** |

> **Not fully self-serve — a real product/GTM finding.** The glossary states plainly that "Assistant
> Messaging" access "is limited — contact your CS Representative," and that "Next Step" (custom workflow
> status transitions) is "set up on the backend by your CS Representative" (docs: raw/helpjuice-kb.md ·
> crawl-clip · medium). Some configuration is performed *by Paradox staff*, not by the customer admin.

### E. Post-hire / employee engagement — a whole second product area barely marketed

| Capability | User | Maturity | Evidence |
| --- | --- | --- | --- |
| Onboarding: offer letters, I-9, WOTC, tax forms, background-check docs, day-1 reminders | New hire | GA-observed | marketed (website: raw/products.md · crawl-clip · medium) **and** independently: "I-9 Services", "WOTC Services", "Tax Information Services" are three of the 13 monitored Statuspage components (community: raw/statuspage-components.json · crawl-clip · medium), with **Symmetry Software** named as the embedded-tax-forms sub-processor (infra: raw/sub-processors.md · dns-ct-fingerprint · medium) → **fact** |
| **Employee Recognition / Employee Rewards** | Employee | GA-observed | `/employee-recognition`, `/employee-rewards` routes (deployed-client-bundle · bundle-string-mine · medium) **and** a "Reward & Recognition" feature redesign in the App Store "What's New" history (community: raw/changelog-digest.md · crawl-clip · medium) → **fact**, two independent lanes |
| **Employee chat** (`/employee-chat/messages`) — the assistant retargeted at existing employees | Employee | GA-observed, single-source | deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium; consistent with the separate `assistant.paradox.ai` / `myassistant.paradox.ai` brand found in CT logs (infra · dns-ct-fingerprint · medium) |
| **Microlearning** (`/microlearning`) | Employee | GA-observed, single-source | deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium — appears in **no** marketing page and **no** KB article |
| Employer tax info, employees directory, internal mobility career site with SSO | Employee / admin | GA-observed / GA-marketed | `/employer-tax-info`, `/employees` (bundle · medium); internal career sites claim (website · medium) |

The marketing site's post-hire story stops at "Onboarding." The product's routes go three steps further —
recognition, rewards, employee chat, microlearning — i.e. Paradox is quietly building the **retention half
of the frontline lifecycle**, not just the acquisition half. For a frontline-hiring build decision this is
the single most strategically informative unmarketed finding after "Assist."

### F. Integration & partner surface

| Capability | User | Maturity | Evidence |
| --- | --- | --- | --- |
| **Partner REST API — 53 operations across 36 paths** (Candidates ×8, Users/roles/location-permissions ×12, Locations ×7, Areas ×4, Rooms ×5, Interview ×4, Reporting ×3, Scheduling/company ×4, Auth ×1) | Partner / customer integrator | GA-observed → fact | api: raw/endpoint-catalog.md · openapi-verbatim · high — reconstructed from 53 verbatim per-operation OpenAPI 3.1 fragments served at `readme.paradox.ai` |
| OAuth2 client_credentials **or** HTTP Basic; credentials issued by "the Paradox Integrations Team" — **no self-serve signup** | Integrator | GA-observed → fact | api · openapi-verbatim · high — the "no self-serve" claim rests on **human-issued credentials + no signup form + no rate-limit surface across 55 portal pages**, not on the CT negative. *(Supporting only: no `doc*`/`developer*`/`swagger*`/`graphql*` host appears in the 2017→mid-2024 CT record — infra: raw/dns-and-subdomains.md · dns-ct-fingerprint · medium. Per the Mode-5 iteration-2 correction that dataset is truncated and cannot carry an absolute "never existed"; a developer-docs surface **does** exist off-domain at `readme.paradox.ai`.)* |
| **US / EU data-residency split** (`api.eu1.paradox.ai` documented alongside the US hosts) | Enterprise buyer | GA-observed → fact | api · openapi-verbatim · high **and** a full parallel `eu1.*` host family in CT logs (infra · dns-ct-fingerprint · medium) |
| **Assessment-vendor integrations baked into the core Candidate schema**: `hirevue_link`, `pymetrics_link`, `adp_link` | Recruiter | GA-observed → fact | api: raw/endpoint-catalog.md · openapi-verbatim · high — these are *fields on the Candidate entity*, a firmer integration signal than any partner logo wall |
| **ATS status-map translation layer** (`use_paradox_status_map`, `status_map_name`, `status_map_ex_id`) | Integrator | GA-observed → fact | api · openapi-verbatim · high — the mechanism that makes "don't replace your system of record" true in code |
| Inbound 3rd-party integrator contract: `PUT /interview/interview_alerts` (can create a Candidate that doesn't exist yet); actively developed — doc updated 2026-07-24 with a new opt-in validation toggle | Integrator | GA-observed | api · openapi-verbatim · high |
| Async reporting job with **the one documented webhook**: `POST /reporting/reports` + required `callbackUrl` | Integrator | GA-observed | api · openapi-verbatim · high — **note the absence: no generic webhook-subscription system, no event-type catalog, no signature-verification docs** |
| **Signed-URL iframe embed contract** (`olivia.paradox.ai/{demo/sf-iframes, external/convo, external/scheduling, external/settings}` taking `OID` + `jwt_token` + `account_id`) — not a `<script>` widget | Partner engineer | GA-observed | api: raw/embed-iframe-contract.md · openapi-verbatim · high (docs verbatim); no `<script src=widget.js>` or `data-paradox-*` attribute exists on paradox.ai or careers.paradox.ai |
| **Three genuinely different partner mechanisms** — Workday: server-to-server status sync · SAP SuccessFactors: **client-side browser extension** injecting Paradox UI via the iframe contract (`sf-iframes`) · Indeed: application completed **inside Indeed Apply itself** | Partner | GA-observed → fact | api: raw/partner-integrations.md · openapi-verbatim · high + website: raw/partners-integrations.md · crawl-clip · medium. This is **not** one uniform "partner overlay": it is bespoke integration engineering per major partner. |
| Formalized, paid partner tiers: **"Workday Certified"** badge and a **paid SAP Endorsed App on SAP Store** (progressed validated → spotlight → endorsed) | GTM | GA-observed | website: raw/partners-integrations.md + the SAP-endorsement news page · crawl-clip · medium |
| Broader catalog: 12 categories, 100+ named vendors (ATS, HCM, CRM, assessments, WOTC, I-9/background check, programmatic ad, video, messaging, calendar) | Buyer | GA-marketed | website: raw/partners-integrations.md · crawl-clip · medium |
| Third-party services observed in the live client that marketing never lists: **Zenoti** (spa/salon booking, used for interview **room/service** booking — 36+ string hits incl. `ROOM_BOOKING_TYPE`, `MAX_ITV_DURATION_ZENOTI`), Contentful, ImageKit, Pendo, Sentry, Google Maps | — | GA-observed, single-source | deployed-client-bundle: raw/bundle-map.md · bundle-string-mine · medium |
| Integration plumbing vendor **Merge API** in the sub-processor list | — | GA-observed | infra: raw/sub-processors.md · dns-ct-fingerprint · medium — suggests part of the long-tail ATS/HRIS connector surface is bought, not built |

### G. Analytics, trust, and the AI layer itself

| Capability | User | Maturity | Evidence |
| --- | --- | --- | --- |
| "1,000+ metrics tracked", dynamic dashboards, secure sFTP export | TA leader | GA-marketed | website: raw/products.md · crawl-clip · medium (a platform-wide claim restated on nearly every product page — counted once); the runtime lane shows a `/analytics` route + a 3-op Reporting API + **Snowflake** as the data-warehouse sub-processor (bundle · medium; api · high; infra · medium) |
| Surveys — post-application/post-interview feedback, emoji/rating/list/open-ended, multi-channel | Candidate | GA-observed | `/surveys`, `/widget-ratings` routes (bundle · medium); marketed (website · medium); legacy name "Rating→Surveys" in the glossary (docs · medium) |
| ISO 27001, SOC 2 Type II, EU-U.S. Data Privacy Framework; NIST AI RMF alignment; bias-evaluation methodology **deferred to "Workday's evolving ethical AI standards"** | Buyer / legal | GA-observed | infra: raw/sub-processors.md · dns-ct-fingerprint · medium; website: raw/legal-security-fraud.md · crawl-clip · medium |
| **The model layer: AWS Bedrock-brokered LLM, server-side only** | — | **inference**, medium — **not promoted** | Two claims, weighted separately. **(a) Server-brokered, never client-direct = fact**: the live CSP `connect-src` **never** names `api.openai.com` / `*.anthropic.com` / `generativelanguage.googleapis.com` — a direct observation of the allow-list (infra: raw/security-headers.md · medium; the bundle reads the *same* CSP, so that is **one artifact, not corroboration**). **(b) Bedrock as the broker + the Rasa→Bedrock evolution = tentative/medium, single-dimension**: three *artifact types* inside `infra` alone (raw/sub-processors.md's verbatim "**AWS Bedrock, model licensing services**"; the CT `rasa-k8s`/`devrasa` family live 2023–2024, NXDOMAIN today; the still-live `genai.*` family with `server: uvicorn`) — stronger than one artifact, but **not ≥2 independent dimensions, so no band promotion** (see technology-architecture.md #4). What the siblings *do* independently corroborate is narrower: the bundle finds `genai.paradox.ai` in the Nuxt config plus same-origin `/api/gen-ai/{init-data,create-feedback,track-consent-approval}` routes (deployed-client-bundle · bundle-string-mine · medium) → the **GenAI host** is fact; community's 2021 "NLP Failover" incident → a **pre-LLM NLP tier** is fact. Neither corroborates the Rasa identity or the Bedrock destination. **Which** foundation model Bedrock fronts is undisclosed and unobservable on this run. |
| **`/legal/fraud` — a dedicated anti-scam/impersonation notice for candidates** | Candidate | GA-observed | website: raw/legal-security-fraud.md · crawl-clip · medium, confirmed live independently by infra (raw/sub-processors.md · medium) → **fact**. Paradox warns candidates that legitimate outreach never comes from Outlook/Gmail, never asks for bank/SSN/licence data, never charges fees, and points victims at IC3. This is the **operational cost of the SMS-first channel**: an unsolicited-text hiring funnel is indistinguishable, to the candidate, from the job-scam texts that plague the same population — a product-design constraint anyone building in this space inherits. |

### H. Explicitly not shipped / disclosed roadmap

| Item | Evidence |
| --- | --- |
| **"Calendar Negotiation — Coming Soon"** on the Conversational Scheduling page | website: raw/products.md · crawl-clip · medium — a vendor-disclosed roadmap item, correctly not counted as shipped |
| No pricing, tiers, or packaging exist publicly — `/pricing` is a live URL that 301s to the homepage (verified by `curl -I`, 9 independent probe points) | website: raw/pricing.md · crawl-clip · medium |
| No generic webhook/event-bus, no rate-limit documentation anywhere in the 55-page developer hub | api: _summary.md gaps · openapi-verbatim · high (an explicit absence, checked, not a miss) |

---

## User-facing surfaces

| Surface | Who uses it | What we know | Provenance |
| --- | --- | --- | --- |
| **The conversation itself** (SMS / WhatsApp / Messenger / web widget / email) | Candidate | The product's actual primary interface. **Never observed live in this run** — see the gap note below. | community (channel components) · medium; distribution-artifacts (recruiter-side transcript view) · high |
| **CEM web console** (`olivia.paradox.ai`) | Recruiter, TA ops, admin | Two coexisting frontend generations on one host: a thin **Nuxt 3 / Vue 3** shell (`app@3.0.0-beta.13`) serving only `/`, `/login`, `/candidate`, and the actual **legacy Django + jQuery/Vue2/Vuex/Handlebars** admin app titled "Candidate Experience Manager", **actively redeployed the same month as capture** (asset path stamped `202608`). A live strangler-fig migration starting at auth. 100+ router paths recovered. | deployed-client-bundle: raw/route-table.md · bundle-string-mine · medium |
| **CEM mobile app** (iOS + Android, `ai.paradox.olivia`) | Frontline/store manager, recruiter on the go | Candidate inbox, per-candidate 4-tab profile, chat takeover, Assist copilot, 5-tab bottom nav. 3.45★/31 (iOS), 3.16★/100 + 10,000+ installs (Android). | distribution-artifacts · binary-extract · high |
| **Olivia Extension** (macOS/Safari Web Extension) | Recruiter/sourcer | LinkedIn-embedded panel: answer, propose slots, add candidate to pipeline. Requires an existing Paradox account. | distribution-artifacts: raw/olivia-browser-extension-listing.md · binary-extract · high |
| **Partner-embedded UI** (SAP SuccessFactors browser extension; `sf-iframes` signed-URL iframes) | Recruiter inside a partner ATS | Signed-URL iframe contract with `OID` + `jwt_token` + `account_id`. | api: raw/embed-iframe-contract.md · openapi-verbatim · high |
| **Career sites / Site Studio** (`sites.paradox.ai`, multi-tenant) | Candidate | Paradox-built-and-managed ("White Glove Service") conversational career sites; `/site-studio` + `/cms` are the authoring surface. | infra · medium + bundle · medium → **fact** |
| **Partner REST API** (`api.paradox.ai/api/v1/public/*`) | Integrator | 53 ops, offset/limit envelope, numeric app-error taxonomy (`{"errors":[{"code":1015,…}]}`). | api · openapi-verbatim · high |
| **Public KB** (`paradox.helpjuice.com`) | Customer admin | Genuinely public but tiny: one category ("Workday Feature Descriptions", 4 articles) + a 15-term internal glossary. Reads as a Workday-marketplace partner disclosure listing, not a product manual. | docs · crawl-clip · medium |
| *(absent)* Authenticated runtime | — | `session` **not dispatched** (`auth:none`), `wire-capture` **folded** into it. | session/_summary.md, wire-capture/_summary.md |

---

## User journeys

Three primary flows. **All three are reconstructed from documented API contracts, string-mined routes,
and product screenshots — none was observed live** (`write_side_observed: false`); the write side of every
one of them is inference, per the write-side cap stated once below.

**1. Candidate: text → screened → scheduled → hired.** Candidate scans a QR code / texts a keyword / taps
Indeed Apply / lands on a Paradox career site → Olivia opens a conversation on that channel → asks
screening questions mapped to the requisition's requirements → answers the candidate's own questions from
the tenant Knowledge Base → proposes concrete interview slots, with an `oli.vi` short-link to more times →
the Candidate record carries `status`, `candidate_journey_status`, and (if the tenant uses one)
`status_map_*` so the state is projected back into the customer's Workday/SuccessFactors → offer letter is
delivered in the same thread (`offer_letter`) → onboarding continues in-thread (I-9, WOTC, tax forms via
Symmetry). *Evidence: api: raw/endpoint-catalog.md · high (schema + interview enum + status map);
distribution-artifacts: raw/screenshot-catalog.md · high (transcript + slot proposal); website:
raw/products.md · medium (the funnel narrative). The conversation content model, the branching logic, the
handoff thresholds and the actual latency are **unobserved**.*

**2. Recruiter: triage → take over → schedule.** Recruiter opens CEM (web or mobile), works the candidate
inbox sorted by most-recent-activity with status pills → opens a candidate's 4-tab profile
(Conversation / Résumé / Notes / Hire Details) → reads the AI transcript and, when needed, **takes over the
thread**, with the composer automatically retargeting to that candidate's channel → or delegates to
**Assist**, the voice-capable recruiter copilot, for "schedule an interview" / "when is my next interview"
/ "update my availability" → interview lands via the `lead-interview/*` scheduling routes, optionally
round-robin-assigned, into a Room at a Location. *Evidence: distribution-artifacts · high (every UI element
named here is in a first-party screenshot); deployed-client-bundle: raw/route-table.md · medium (`/assist*`,
`/lead-interview/*`, `/round-robin-management`); api · high (Rooms/Locations/Interview ops).*

**3. Integrator: overlay onto the incumbent system of record.** Partner obtains credentials from the
Paradox Integrations Team (never self-serve) → OAuth2 client_credentials → pushes/pulls Candidates, Users,
Locations, Areas, Rooms → sends interview requests **into** Paradox via `PUT /interview/interview_alerts`
(which will create the Candidate if absent) → receives async report deliveries at a `callbackUrl` → and,
for the three flagship partners, uses a *different* mechanism each: Workday server-sync, SAP browser
extension over signed-URL iframes, Indeed in-Apply embed. *Evidence: api: raw/{endpoint-catalog,
partner-integrations,embed-iframe-contract}.md · openapi-verbatim · high.*

---

## Gaps & rough edges

**Vendor-acknowledged reliability debt in the recruiter console.** The public Statuspage carries **45
incidents since 2017**, and the single largest cluster — **~13 of 45** — is "CEM Slowness" on the recruiter
dashboard, running 2023 through 2026. The most recent postmortem (2026-07-27) names the root cause in
Paradox's own words: **legacy synchronous endpoints inside an otherwise async backend**, causing
connection-pool exhaustion, with a migration to the platform's standard async model disclosed as an active
initiative (community: raw/issue-themes.md · crawl-clip · medium). This is a dated, first-party admission
of technical debt, not an outside inference — and it lines up exactly with the bundle finding that the
live admin console is still the legacy Django/jQuery generation while the Nuxt rewrite has so far only
reached login (deployed-client-bundle · bundle-string-mine · medium). **Two independent dimensions →
fact.** Other clusters: ~7 full-system/CEM availability outages (2 "critical", plus one in Jun 2026), ~5
WhatsApp/SMS delivery-failure incidents (2022–2024, none since — the channel layer appears to have
stabilized), ~4 infra-attributed (AWS, cache, and a 2021 "NLP Failover" that independently confirms a
dedicated NLP-serving tier).

**App-store complaint themes** cluster on **auth reliability** (login/sign-in failures) and **one feature
regression** — loss of candidate-disposition/status visibility after an update — rather than on the AI
itself (distribution-artifacts · binary-extract · high). Small samples (31 and 100 ratings) for a tool
whose primary surface is desktop; a real but limited signal.

**No public feedback loop exists at all** — no public changelog (a gated Helpjuice release-notes page is
*confirmed to exist* behind SAML, proving Paradox maintains one internally), no roadmap, no forum, no
issues, no hosted feedback board. Verified exhaustively per ingestion §7 rule 10: four subdomain probes,
three hosted-board vendors under seven slugs, RSS autodiscovery — all negative (community: raw/
changelog-digest.md · crawl-clip · medium). **Per the closed-feedback cap, every user-pain claim in this
section is capped at tentative and none is promoted on changelog frequency alone**; `external-reputation`
(G2 / Capterra / Reddit / Glassdoor) is the surface that would corroborate user sentiment and is
**recommended for this run**.

**Product-naming churn** is visible in the UI copy: Capture→Apply, Care→Q&A, Rating→Surveys, with legacy
names still surfacing (docs: raw/helpjuice-kb.md · crawl-clip · medium) — at least two rounds of
rebranding, and "Capture Incomplete" still appears as a live candidate status pill in current screenshots.

**Documentation is thin for admins and off-domain for developers.** `docs.paradox.ai` and
`developer.paradox.ai` both fail DNS, and no `doc*`/`developer*`/`swagger*`/`openapi*`/`graphql*`
subdomain appears in the CT record (docs · medium + infra · medium → **fact, as scoped**). The one public
KB category covers 4 of ~13 products. **But developer documentation is not absent — it is off-domain:**
`readme.paradox.ai` serves a real, actively-maintained 55-page hub with 53 verbatim OpenAPI 3.1
operations, reachable only via one unlabelled link from `/partners/integrations` (api ·
openapi-verbatim · high). *(Mode-5 iteration 2 correction: this paragraph previously stated the CT sweep
as a "9-year" complete negative proving no developer-docs subdomain ever existed. The dataset is
truncated at 2024-06-13 and `readme.paradox.ai` is itself CT-logged with 2026 certs — the absolute form
is withdrawn; the scoped form above is what the evidence supports. See infra `_summary.md` gaps.)*

> ### The gap that matters most: the conversation itself was never observed
>
> `session` is **absent** (`auth:none`, never dispatched) and `wire-capture` is **folded** into it;
> `write_side_observed: false`. For a dashboard SaaS that would be a normal Pass-1 limitation. For Paradox
> it is the central one: **the product IS the conversation**, and no dimension in this run watched a
> single live candidate↔Olivia exchange. Everything this rollup says about *how the AI behaves* — how it
> screens, how it branches, when it escalates to a human, how it handles an ambiguous or hostile reply,
> what its latency and containment rate actually are, how the Bedrock model is prompted and grounded
> against the tenant Knowledge Base — is **documented or depicted, never observed**. Per the write-side
> cap this is stated once, here, and every generate/send/schedule *behavior* claim above inherits it:
> feature **existence and gating** are solid; feature **execution quality** is not evidenced at all. The
> two things that would close it are a read-only recruiter session and a single live text to a
> Paradox-powered career site.

---

## Cross-dimension reconciliation

**1. "13 products" is a marketing taxonomy over one engine — verified, not hedged.** The site sells 13
"Conversational X" products. Direct `curl` (not a WebFetch summary) confirmed `/products/conversational-
apply` and `/products/screening` serve **near-identical `<title>` tags and near-identical body content and
stat blocks** (website: raw/products.md · crawl-clip · medium). Three independent runtime lanes agree that
the underlying thing is singular: (a) the admin bundle exposes **one** console with one router, not 13
apps, and the "products" appear as *settings sections* inside it — `/settings/{job-builder,
interview-builder,event-templates,workflows}` etc. (deployed-client-bundle: raw/route-table.md ·
bundle-string-mine · medium); (b) the public API exposes **one** Candidate/Location/Interview/Room entity
set for all of them, with no per-product namespace (api: raw/endpoint-catalog.md · openapi-verbatim ·
high); (c) the Statuspage monitors **13 components grouped into 4 clusters** — Conversations, CEM,
Reporting, Integrations — which is the real architecture, and it maps to none of the 13 SKUs (community:
raw/statuspage-components.json · crawl-clip · medium). **Stated as fact: the "Conversational X" family is
a per-surface skin over one conversational engine plus one recruiter console.** The one nuance worth
keeping: modularity is real *commercially* — every case study names 1–4 specific products, so customers
buy and are licensed slices, they just aren't separately-engineered slices.

**2. The AI vendor is disclosed nowhere in marketing; the best-supported answer is AWS Bedrock — at
medium confidence, single-dimension, not fact.** Zero LLM/model vendor is named across the homepage, all
13 product pages, the ethical-AI page, or the security page (website: _summary.md · crawl-clip · medium —
a verified absence across an exhaustive crawl, not a collection miss). Only the `infra` lane answers it,
via the three *artifact types* in the row above; per `evaluation.md` that is one dimension and earns no
promotion, so **"Bedrock" is stated tentatively throughout this corpus** (identically weighted in
technology-architecture.md #4, data-model-api-surface.md, and competitive-positioning.md #6). What *is*
fact is the negative: no client-direct model call exists.
**The non-disclosure is a positioning choice, not an oversight**, and it is worth naming: Paradox sells
"conversational AI" to non-technical HR buyers, and additionally **defers its bias-evaluation methodology
to "Workday's evolving ethical AI standards"** rather than publishing its own (website:
raw/legal-security-fraud.md · crawl-clip · medium). *(Cross-reference: the same no-vendor-named pattern was
found on Fountain in this batch — it appears to be a category norm, not a Paradox quirk.)*

**3. The biggest unmarketed depth: "Assist", the recruiter-facing copilot.** Marketing describes Olivia
almost entirely as candidate-facing. Two independent runtime lanes show a **second, recruiter-facing
conversational AI**: a labelled, voice-enabled "Assist" panel in first-party App Store screenshots
(distribution-artifacts · binary-extract · high) and `/assist`, `/assist/calendar`,
`/assist/scheduling_action` in the admin router (deployed-client-bundle · bundle-string-mine · medium).
It appears in **no** product page, **no** KB article, and **no** public API operation. The standalone
LinkedIn-embedded Olivia Extension (a third distribution artifact, released June 2025) points the same
direction. **Promoted to fact.** For a build decision this reframes the category: the defensible surface
may be the recruiter's own copilot (scheduling, availability, pipeline actions in-context inside LinkedIn
or the ATS), not only the candidate bot everyone markets. Secondary unmarketed depth, same shape: the
`/microlearning`, `/employee-recognition`, `/employee-rewards`, `/employee-chat` routes plus the App-Store
"Reward & Recognition" redesign — a post-hire retention product the website never sells.

**4. Marketing stat blocks are platform-wide claims restated per page — count them once.** "21% increase
in likelihood of a job being clicked" (an Indeed-integration stat) and "1,000+ metrics tracked" recur
verbatim across nearly every product page; treating them as 13 independent per-product proofs would be a
counting error (website: raw/products.md · crawl-clip · medium). Likewise the outcome metrics: every
fetched case study reports **time-to-hire / time-to-schedule / hours-saved / cost-saved / completion-rate,
and nothing else** — **no quality-of-hire, no retention, no diversity-outcome metric appears in any of the
six case studies checked** (website: raw/case-studies.md · crawl-clip · medium). That is a meaningful
shape: Paradox's evidence base is entirely funnel-efficiency, never hire-quality. Flagged, not as an
over-claim (they don't claim quality outcomes), but as the boundary of what they've proven.

**5. Flagged conflict — languages.** Marketing says "100+ languages" on most product pages and "30+
languages" on two (Candidate Experience Agent, Conversational Scheduling) (website: raw/products.md ·
crawl-clip · medium). The API enumerates **57 language/locale codes** for `language_preference` (api:
raw/endpoint-catalog.md · openapi-verbatim · high). **Direct-observation tiebreaker applies: 57 documented
conversational locales is the load-bearing number**; "100+" most plausibly counts translated career-site/
job content (Google Translate is a named sub-processor), and "30+" appears to be stale copy. Flagged
rather than resolved — none of the three figures is contradicted by another observation, they just measure
different things.

**6. Partner integration is three mechanisms, not one overlay.** A single "partner overlay" story would be
wrong. Workday is a **server-to-server status sync** (Workday Certified badge). SAP SuccessFactors is a
**client-side browser extension** injecting Paradox UI through the signed-URL iframe contract — the
`sf-iframes` demo path name is the tell. Indeed is an **embed inside Indeed Apply itself**, on Indeed's
side, undocumented from Paradox's end (api: raw/partner-integrations.md · openapi-verbatim · high +
website: raw/partners-integrations.md · crawl-clip · medium). The read: Paradox does **bespoke integration
engineering per flagship partner** and leaves the long tail to the plain REST API (plus, per the
sub-processor list, **Merge API** for some connector plumbing). And the partnership is formalized
commercially into paid/certified tiers — **"Workday Certified"** and a **paid SAP Endorsed App on SAP
Store** — which are distribution and trust assets, not just integration docs.

**7. Depth of the Workday relationship exceeds "an integration."** Beyond the certified-partner tier,
**~24 Workday legal entities across the Americas/EMEA/APJ appear as affiliate sub-processors** on
Paradox's own current sub-processor PDF (dated 4 days before capture), and Paradox's ethical-AI page
defers bias methodology to Workday's standards (infra: raw/sub-processors.md · dns-ct-fingerprint · medium
+ website: raw/legal-security-fraud.md · crawl-clip · medium). Recorded here as a **corporate-relationship
signal with product consequences** (which HRIS the roadmap optimizes for); the ownership/strategy read
belongs to `competitive-positioning.md`, not this rollup.

**8. Two "integration partners" are actually owned or licensed, which changes the feature read.**
**Traitify** (personality assessment) is listed as *"Woofound, Inc. d/b/a Traitify — support and
maintenance **exclusively for Traitify Services**"*, i.e. an **acquired Paradox product**, not a third-party
partner (infra: raw/sub-processors.md · dns-ct-fingerprint · medium) — so assessments are an owned
capability, and the Compass Group case study naming "Traitify Assessments" (which puzzled the `website`
collector, since Traitify is absent from the public integrations catalog) is explained. Conversely,
**résumé parsing is licensed, not homegrown**: Textkernel/Sovren is the named parsing sub-processor, and
Google supplies NLP/semantic-matching/translation/OCR. The marketing line "Olivia can read a resume" is
true and not an over-claim — it just isn't Paradox's own NLP.

**9. Not fully self-serve — a real limit on the "configure it yourself" implication.** Marketing implies
an admin-configurable platform; the KB glossary states that Assistant Messaging access "is limited —
contact your CS Representative" and that "Next Step" workflow transitions are "set up on the backend by
your CS Representative" (docs: raw/helpjuice-kb.md · crawl-clip · medium). Combined with career sites sold
as **"White Glove Service"** (Paradox designs, builds and manages the site) and **Cielo + The Cloud
Connectors** listed as implementation-services sub-processors, the honest read is a **configured-for-you
enterprise product with a services layer**, not a self-serve platform. Single-source (docs) on the
CS-rep specifics — tentative, but consistent with three other observations.

**10. Over-claim watch — nothing rises to a flagged over-claim, but two claims are unverifiable here.**
"Automate up to 90–100% of the hiring process" and "one third of interactions happen outside business
hours" are marketing figures with no independent lane in this run; both are behavior claims about the
unobserved conversation and are therefore **tentative, never promoted** (website: raw/products.md ·
crawl-clip · medium; write-side cap). Everything else the site claims that *could* be checked against a
runtime lane — the channels, the scheduling engine, the languages, the assessments, the onboarding
compliance modules, the API, the persona theming — checked out.

---

*Inputs read: `dimensions/{website,docs,api,community,distribution-artifacts,deployed-client-bundle,
infra-backend-fingerprint,codebase,packages,session,wire-capture}/_summary.md` + the raw artifacts cited
inline. `codebase` (5 forked, non-product repos) and `packages` (no branded namespace) carry **zero
product-feature signal** for this target and are cited nowhere above — recorded here so their absence from
the feature map reads as a checked negative, not an omission.*
