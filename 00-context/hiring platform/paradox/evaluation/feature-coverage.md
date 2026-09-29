# Paradox — Feature Coverage

---
coverage_scorecard:
  features_claimed: 92              # union of website + docs/KB/glossary + App-Store changelog claims
  features_located: 68              # found in SOME static surface (console route · API op · Statuspage component · screenshot)
  features_walked: 0                # ZERO — nothing was navigated this run (see capability gap below)
  feature_location_rate: 74         # 68 ÷ 92
  flow_coverage: 0                  # 10 journeys identified, 10 diagrammed — but ALL INFERRED, 0 observed. See scoring note.
  ia_surfaces_mapped: 16            # surface cards written in information-architecture.md
  ia_nav_complete: false            # nav is server-driven per tenant (/api/menu) and was never fetched
  screenshot_coverage: 10           # 3 of ~31 primary surfaces have ANY image — all App-Store-listing surrogates
# --- honesty fields (this run's degraded mode; read these before scoring axis 2) ---
  run_mode: degraded
  blockers: ["auth:none (session absent, wire folded)", "browser/Chrome MCP tools ABSENT from the session toolset (capability gap, not a permission gate)"]
  surfaces_walked: 0
  screenshots_captured_this_run: 0
  screenshot_coverage_live: 0       # the live-capture number; the 10 above is the surrogate number
  screenshot_source: app-store-listing-surrogate
  features_depicted: 7              # visible in a first-party App-Store screenshot (not walked, not captured here)
  flows_identified: 10
  flows_diagrammed_inferred: 10
  flows_diagrammed_observed: 0
  d0_destinations_total: 30         # 6 public-site + 1 KB + 23 console (console D0s are INFERRED from route shape)
  d0_destinations_with_surface_card: 12
  claimed_not_located: 24
  claimed_not_located_undispositioned: 0
  dispositions_used: ["deeper-than-looked", "roadmap-not-shipped", "marketing-over-claim", "vendor-operated", "partner-side-implementation", "unreachable-this-run"]
  new_disposition_proposed: unreachable-this-run   # → Mode-5 harness-change candidate, see "Disposition taxonomy" below
---

> ## ⚠️ READ FIRST — `features_walked: 0` is literal, and it is not a shortfall of effort.
>
> Two independent blockers stacked:
>
> 1. **`auth: none`** — no credential existed for `olivia.paradox.ai`. `session` is `status: absent`
>    (`completeness_pct: 0`, `write_side_observed: false`); `wire-capture` is `status: folded`.
> 2. **The Chrome / browser-driving MCP tools were absent from this session's toolset entirely** —
>    confirmed by tool search. This is a **capability gap** in the sense of `ingestion.md` §8, not a
>    permission gate and not the same thing as blocker 1. Even the *public* marketing site could not be
>    browser-walked, and **no screenshot of any kind could be captured, of any surface, at any time.**
>
> **Therefore, everywhere in this document:**
> - **"Located"** means *found in a static artifact* — a client-side router path literal, a published API
>   operation, a Statuspage component, a feature flag, or an App-Store screenshot. It **never** means
>   "seen in the product."
> - **"Walked"** is `❌` on **every single row**. The `located-but-not-walked` re-walk queue is therefore
>   **all 68 located features**, and it cannot be drained within this run's capability envelope.
> - **Screenshots** in `dimensions/session/captures/screens/` are **App-Store listing images** described
>   in text, not captures. `screenshot_coverage: 10` counts those surrogates; `screenshot_coverage_live:
>   0` is the number a live-walk axis should score.
> - **`flow_coverage` is scored 0, not 100.** All 10 identified journeys are diagrammed in `ux-flows.md`,
>   which would naively read as 100% — but every diagram is **inferred** (dashed arrows, zero wire
>   observed). Per `cartography-flows.md` diagram rule 6, an inferred diagram is a hypothesis, not
>   coverage. **The raw ratio and the scored value are both published above so Mode 5 can reproduce
>   either.**

---

## Disposition taxonomy — one extension, flagged for approval

`cartography-coverage.md` provides four dispositions. **Three of them do not fit this run's dominant
failure mode**, and forcing rows into `deeper-than-looked` would misroute them: that disposition sends a
feature to the Mode-5 re-walk queue, but **no amount of re-walking closes a gap when there is no browser
and no credential.** Rather than silently mislabel, this document uses the four standard dispositions
plus three named extensions, and flags the first as a **Mode-5 harness-change proposal**:

| Disposition | Standard? | Meaning | Routes to |
| --- | --- | --- | --- |
| **deeper-than-looked** | ✅ standard | exists in the product; the static lanes just did not reach it | re-walk queue (needs auth + browser) |
| **edition/plan-gated** | ✅ standard | not in this tenant's edition | recorded gap — *(unused: no tenant existed)* |
| **roadmap-not-shipped** | ✅ standard | vendor-disclosed as not yet shipped | recorded gap |
| **marketing over-claim** | ✅ standard | the claim overstates the product | over-claim flag → `product-features.md` |
| **unreachable-this-run (capability-gated)** | 🆕 **PROPOSED** | the claim describes **runtime behaviour inside the conversation** or **rendered-UI quality** — locatable only by *using* the product, never by any static lane. Re-walking a nav cannot find it either. | **a recorded structural gap, NOT the re-walk queue** |
| **vendor-operated** | 🆕 extension | shipped, but configured/operated by **Paradox staff**, not by the customer admin — so it has no customer-facing surface to locate | recorded gap + a GTM finding |
| **partner-side-implementation** | 🆕 extension | shipped, but the implementation lives inside a **partner's** product, so it has no Paradox surface | recorded gap |

**Why `unreachable-this-run` matters and should be promoted to the harness:** 5 of this run's 24
not-located features (Inquiry Detection, emoji/reactions, image moderation, chatbot job search,
accessibility) are **conversation-runtime or rendered-UI properties**. Marking them
`deeper-than-looked` would inflate the Mode-5 re-walk queue with items a re-walk provably cannot close,
and would let a genuine capability gap masquerade as insufficient navigation. **This is the single
highest-value harness change this run surfaced.**

---

## Coverage matrix

**Legend.** Source: `W` = website · `D` = docs (KB articles + `glossary_terms.json`) · `C` = community
(App-Store "What's New"). Located: ✅ located in a static lane · ⚠ partially/indirectly located ·
❌ not located. **Walked is `❌` on every row** — the column is retained to make that explicit rather than
implicit. Route/depth: console depths are **inferred from route shape**, never measured
(`information-architecture.md`). `[api]` = a published API operation/field. `[sp]` = a Statuspage
component. `[shot]` = visible in an App-Store screenshot. `[flag]` = a live feature flag.

### A. Candidate-facing conversational engine (26 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | Conversational apply — no forms, no login | W,D | ✅ | 5 channel components `[sp]` + Candidate schema `[api]` + transcript `[shot]`; in-product it is a **tab inside a candidate record, D3 (inferred)** | ❌ | high | the product's core, and its deepest surface |
| A2 | Text-to-Apply — SMS keyword / QR / shortcode | W,D | ⚠ | SMS channel `[sp]`; the **QR/keyword authoring surface was not located** | ❌ | med | channel located, authoring not |
| A3 | Automated screening vs configurable job requirements | W,D | ✅ | `/settings/{job-builder,applicant-flows}` · D1 (inf) | ❌ | med | config surface located; **screening behaviour entirely unobserved** |
| A4 | 24/7 candidate Q&A (glossary: "Care"→"Q&A") | W,D | ✅ | `/settings/knowledge-base` · D1 (inf) + answer-with-employer-link `[shot]` | ❌ | med | |
| A5 | **Inquiry Detection** — distinguishes a question from an answer | D | ❌ | — | ❌ | — | **unreachable-this-run**: a runtime NLU property |
| A6 | Multi-language conversation | W | ✅ | `language_preference` enumerates **57 locale codes** `[api]` | ❌ | **high** | marketing says 100+/30+; 57 is the load-bearing number (conflict flagged in `product-features.md` §5) |
| A7 | Nordic language expansion (Finnish, Norwegian) | C | ✅ | folds into the 57-code enum `[api]` | ❌ | high | |
| A8 | Site widget / chat widget + landing pages | W,D | ✅ | "Site Widget" `[sp]` + `/settings/web-management` · D1 (inf) | ❌ | med | |
| A9 | WhatsApp channel | W | ✅ | "WhatsApp" `[sp]` + `/settings/whatsapp-templates` · D1 (inf) + Meta WhatsApp Business config | ❌ | med | |
| A10 | Facebook Messenger channel | W | ✅ | "Facebook Messenger" `[sp]` | ❌ | med | |
| A11 | SMS channel | W | ✅ | "SMS" `[sp]` + `/settings/phone-numbers` + Twilio sub-processor | ❌ | med | |
| A12 | Email channel | W | ✅ | "Email" `[sp]` + SendGrid sub-processor | ❌ | med | |
| A13 | Emoji + reactions in chat | C | ❌ | — | ❌ | — | **unreachable-this-run**: in-conversation UI |
| A14 | Explicit-image manual blur / media moderation | C | ❌ | — | ❌ | — | **unreachable-this-run**: in-conversation UI |
| A15 | **Hot Jobs** — priority exposure in candidate job search | D | ❌ | — | ❌ | — | **deeper-than-looked**: almost certainly a job-level flag under `/jobs` or `/settings/job-builder` |
| A16 | Chatbot job search + job-preference input | D | ❌ | — | ❌ | — | **unreachable-this-run**: candidate-side conversation behaviour |
| A17 | Résumé parsing + AI role recommendation | W | ✅ | Candidate `resume` `[api]` + "Résumé" profile tab `[shot]` + **Textkernel/Sovren** sub-processor | ❌ | high | **licensed, not homegrown** |
| A18 | Career-interest assessment (RIASEC) | W | ⚠ | "Traitify Assessment" `[sp]`; no console route located | ❌ | med | |
| A19 | Personality assessment (Traitify) | W | ✅ | `[sp]` + Traitify CDN/API hosts in the live CSP | ❌ | med | Traitify = **Woofound, Inc., an acquired Paradox product**, not a partner |
| A20 | Recorded video screening responses | W,D | ✅ | `recorded_interview_id` `[api]` + `ai_interview_page:enabled_new_ui` `[flag]` | ❌ | med | a flagged surface under active UI work |
| A21 | Native in-browser video interview | W,D | ✅ | `generate_virtual_url` `[api]` | ❌ | med | KB confirms a *native* tool, not only third-party embeds |
| A22 | 3rd-party video: Zoom · Teams · Webex · Skype · BlueJeans | W,D | ❌ | no route, no API field, **none in the CSP or sub-processor list** | ❌ | — | **deeper-than-looked** — but the CSP negative makes this worth re-checking first |
| A23 | Candidate surveys post-apply / post-interview (glossary: "Rating"→"Surveys") | W,D | ✅ | `/surveys`, `/widget-ratings` · D0/D1 (inf) | ❌ | med | |
| A24 | SMS-based employee referrals | W,D | ✅ | `referrer_email`, `referrer_name`, `external_referrer` `[api]` | ❌ | high | |
| A25 | Talent community + automated SMS job alerts | W | ✅ | `/talent-community`, `/communities`, `/v3/communities` · D0/D1 (inf) + `talent_community`, `community_of_interest` `[api]` | ❌ | med | |
| A26 | Career-site advanced search — military-skills translator, commute-time calculator | W | ❌ | — | ❌ | — | **deeper-than-looked**: inside Site Studio |

**A: 26 claimed · 19 located · 7 not located.**

### B. Persona / white-label theming (2 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | Per-tenant assistant **name, avatar, voice, tone** ("Personalization") | W | ✅ | **`GET /company/ai` → "Get AI Assistant (name + image)"** `[api]` | ❌ | **high** | the marketed capability and the API primitive that implements it — **two independent lanes → fact** |
| B2 | Branded, Paradox-built career sites ("White Glove Service") | W | ✅ | `/site-studio`, `/cms` · D0 (inf) + a multi-tenant `sites.paradox.ai` host family | ❌ | med | → **fact** |

**B: 2 claimed · 2 located · 0 not located.**

### C. Interview scheduling (10 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Automated interview self-scheduling | W,D | ✅ | `/lead-interview/{schedule,slots}` · D2 (inf) + `/interview/get_setting` `[api]` + slot proposal `[shot]` | ❌ | high | |
| C2 | Rescheduling / cancellation | W,D,C | ✅ | `/lead-interview/{reschedule,cancel,cancel_request}` · D2 (inf) | ❌ | med | |
| C3 | Automated reminders + follow-ups | W,D | ✅ | `/settings/assistant-reminders` · D1 (inf) | ❌ | med | |
| C4 | Panel / group / multi-person / multi-day / sequential interviews | W,D | ✅ | 18-value `interview_type` enum + `interview_segments`, `force_sequent_multi_days`, `sequential_order_automation` `[api]` | ❌ | **high** | the richest schema in the API |
| C5 | Open Interview Times (interviewer availability) | D | ✅ | `/lead-itv-settings`, `/external/itv-settings` · D2 (inf) + glossary | ❌ | med | glossary + route → **fact** |
| C6 | Interview prep / Q&A delivery | W,D | ✅ | `/lead-itv-prep`, `/settings/interview-preps` + `candidate/recruiter_interview_prep_ex_id` `[api]` | ❌ | high | |
| C7 | Interview feedback collection from the hiring team | W,D | ⚠ | `debrief` field `[api]`; no dedicated console route located | ❌ | med | |
| C8 | Centralized dashboard for phone / in-person / virtual interviews | D | ✅ | `/interviews`, `/my-calendar` · D0 (inf) | ❌ | med | |
| C9 | Bi-directional calendar + room-booking integrations | D | ✅ | Room entity + `cal_email` `[api]` + **Zenoti** strings (`ROOM_BOOKING_TYPE`, `MAX_ITV_DURATION_ZENOTI`) | ❌ | med | Zenoti is a genuinely surprising booking backend |
| C10 | **Calendar Negotiation — "Coming Soon"** | W | ❌ | — | ❌ | — | **roadmap-not-shipped** (vendor-disclosed; correctly not counted as shipped) |

**C: 10 claimed · 9 located · 1 not located.**

### D. CRM & hiring events (12 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Campaigns — templated text/email | W | ✅ | `/campaigns` · D0 (inf) | ❌ | med | |
| D2 | **AI-assisted campaign copywriting** ("an assistant that writes campaigns") | W | ❌ | no route, no API op; `/api/gen-ai/*` is generic | ❌ | — | **deeper-than-looked** — a *marketed AI capability* with no located surface. Priority re-walk item. |
| D3 | Dynamic candidate segmentation | W | ✅ | `/candidate-segments`, `/candidate-segment/create` · D0/D1 (inf) | ❌ | med | |
| D4 | Talent communities / nurture pipeline | W | ✅ | `/communities`, `/v3/communities` · D0 (inf) | ❌ | med | |
| D5 | "Find" — pre-CRM lead screening via text/chat | W | ❌ | — | ❌ | — | **deeper-than-looked** |
| D6 | LinkedIn Connect — 1-click candidate export from LinkedIn | W | ✅ | the **Olivia Extension** (`ai.paradox.brext`, macOS/Safari, v2.5.5) does exactly this | ❌ | **high** | located *better than claimed* — the shipped artifact exceeds the one-line marketing claim |
| D7 | Hiring events — creation, virtual or in-person | W | ✅ | `/events`, `/settings/event-templates`, `/lead-event-interview/events` · D0/D1 (inf) | ❌ | med | |
| D8 | Event registration with no forms/passwords | W | ❌ | — | ❌ | — | **deeper-than-looked** |
| D9a | Campus recruiting events + student talent communities | W | ✅ | `/campuses` · D0 (inf) + `campus_permissions`, `campus_entitlements` `[api]` | ❌ | high | a first-class entitlement axis in the API |
| D9b | **A student-facing mobile app** | W | ❌ | Paradox's public developer catalogue on **both** stores contains only CEM, the Regis white-label, and the Safari extension — **no student app** | ❌ | — | **marketing over-claim (flagged)** → `product-features.md`. Two-store negative is reasonably strong. |
| D10 | Real-time candidate evaluations / instant post-meeting tagging at events | W | ❌ | — | ❌ | — | **deeper-than-looked** |
| D11 | Conversational event-flow optimization | C | ✅ | folds into D7 (`/lead-event-interview/*`) | ❌ | med | |

**D: 12 claimed · 7 located · 5 not located.**

### E. Career sites (7 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E1 | Branded career-site creation, hosting, management | W,D | ✅ | `/site-studio`, `/cms` · D0 (inf) + `sites.paradox.ai` host family | ❌ | med | → **fact** (two independent lanes) |
| E2 | "White Glove Service" — Paradox designs/builds/manages the site | W | ⚠ | located as a **service**, not a surface: Cielo + The Cloud Connectors as implementation-services sub-processors | ❌ | med | a services layer, not a product feature |
| E3 | Job + org content display; distribution to external job boards | D | ⚠ | `/jobs`, `/settings/job-data-packages` located; **job-board distribution not located** | ❌ | med | |
| E4 | SEO support | W,D | ❌ | — | ❌ | — | **deeper-than-looked** (inside Site Studio) |
| E5 | Content / media / translation management | D | ✅ | **Contentful** + **ImageKit** in the bundle + Google (translation) sub-processor + `/cms` | ❌ | med | |
| E6 | Internal career sites with SSO (internal mobility) | W | ❌ | `/employees` is adjacent but is not it | ❌ | — | **deeper-than-looked** |
| E7 | Career-site performance / traffic analytics | D | ✅ | `/analytics` · D0 (inf) + GA/GTM/Pendo in the bundle | ❌ | med | |

**E: 7 claimed · 5 located · 2 not located.**

### F. Hiring-team / ATS core (17 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | Job requisition management / "Paradox Jobs" | W,D | ✅ | `/jobs`, `/settings/job-builder` · D0/D1 (inf) | ❌ | med | glossary distinguishes Paradox-native jobs from ATS-synced jobs |
| F2 | **Job Data Package** — location-level job config | D | ✅ | `/settings/job-data-packages` · D1 (inf) + glossary | ❌ | med | route + glossary → **fact** |
| F3 | **Candidate Volume Optimizer** — per-requisition volume limits | W(KB),D | ✅ | `/settings/candidate-volume-optimizer` · D1 (inf) + glossary | ❌ | med | route + glossary → **fact** |
| F4 | **Number of Hires** — auto job-close trigger | D | ❌ | no dedicated route; presumably a job-level setting | ❌ | — | **deeper-than-looked** |
| F5 | Automated candidate progression by data / stage / attribute | D | ✅ | `/settings/{workflows,journeys}` + `candidate_journey`, `candidate_journey_status` `[api]` | ❌ | high | route + schema → **fact** |
| F6 | **"Next Step"** — custom status transitions | D | ❌ | documented verbatim as *"set up on the backend by your CS Representative"* | ❌ | — | **vendor-operated** — no customer surface exists to locate. A GTM finding, not a coverage miss. |
| F7 | Custom data attributes / **System Attributes + tokens** | D | ✅ | `/settings/system-attributes` · D1 (inf) + `candidate_attribute_data`, `PATCH/PUT /candidate/attributes/{OID}` `[api]` | ❌ | high | → **fact** |
| F8 | Secure forms / traditional form fields | D | ✅ | `/settings/forms` · D1 (inf) | ❌ | med | |
| F9 | Role-based access control | D,W | ✅ | `/settings/{users,group-management,location-management}` + 12 User/role/location-permission ops `[api]` + `/api/casl-ability` | ❌ | high | → **fact**; **location-scoped**, not flat roles |
| F10 | SSO | D,W | ✅ | 5 SSO callbacks + SAML (proved by the KB release-notes 302) | ❌ | med | → **fact** |
| F11 | Offer creation + automated delivery | W,D | ✅ | `/candidate-offer-detail`, `/settings/offers-type` + `offer_letter`, `offer_file_name` `[api]` | ❌ | high | → **fact** |
| F12 | Review layer for key recruiting documents | D | ✅ | `/settings/{approvals,approvals-builder}` · D1 (inf) | ❌ | med | mapping is inferred |
| F13 | Document version tracking | C | ❌ | — | ❌ | — | **deeper-than-looked** |
| F14 | Job + candidate management in the mobile app | W | ✅ | 5-tab bottom nav — Candidates, Calendar, Briefcase(Jobs) `[shot]` | ❌ | high | the only *observed* nav in the run — and it is an App-Store image, not a walk |
| F15 | Position management / hire tracking | C | ✅ | `/candidate-hire-detail` · D2 (inf) + `hired_date` `[api]` + "Hire Details" tab `[shot]` | ❌ | high | |
| F16 | "Hiring Goals" — auto on/off by volume | W | ⚠ | same mechanism as CVO (F3) + NOH (F4); no distinct surface | ❌ | med | a marketing name for two console features |
| F17 | **Assistant Messaging** — default AI message copy | D | ✅ | `/settings/assistant-messaging` · D1 (inf) + glossary | ❌ | med | → **fact**, **but access is CS-rep-gated** ("access to this page is limited") |

**F: 17 claimed · 14 located · 3 not located.**

### G. Post-hire / employee engagement (5 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | Onboarding — offer letters, I-9, WOTC, tax forms, background-check docs | W,D | ✅ | **three separate Statuspage components** ("I-9 Services", "WOTC Services", "Tax Information Services") + **Symmetry Software** sub-processor | ❌ | med | → **fact**, two independent dimensions |
| G2 | Day-1 reminders / pre-boarding | W | ❌ | — | ❌ | — | **deeper-than-looked** |
| G3 | Automated workflows synced to new-hire position/location | W | ✅ | `/settings/workflows` + `/employer-tax-info` · D0/D1 (inf) | ❌ | med | |
| G4 | **Reward & Recognition** | C | ✅ | `/employee-recognition`, `/employee-rewards` · D0 (inf) + an App-Store "Reward & Recognition" redesign (v2.1.6) | ❌ | med | → **fact**, two independent lanes. **Marketed nowhere on the website.** |
| G5 | Employee segments + data sync | C | ⚠ | `/employees` · D0 (inf) | ❌ | med | weak locate |

**G: 5 claimed · 4 located · 1 not located.**

### H. Analytics, trust, integrations, platform (13 claims)

| # | Feature (claimed) | Src | Located? | Where located · depth | Walked? | Conf | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| H1 | "**1,000+ metrics tracked**", dynamic dashboards | W | ⚠ | `/analytics` · D0 (inf) + a 3-op Reporting API + **Snowflake** sub-processor | ❌ | med | **the surface is located; the number "1,000+" is unverifiable on any lane** |
| H2 | Secure sFTP export | W | ❌ | — | ❌ | — | **deeper-than-looked** |
| H3 | Accessibility features | W | ❌ | — | ❌ | — | **unreachable-this-run**: a rendered-UI property; no browser, no audit possible |
| H4 | Fairness & compliance / bias evaluation | W | ❌ | located only as **policy**: NIST AI RMF alignment, with bias methodology **deferred to "Workday's evolving ethical AI standards"** | ❌ | — | **marketing over-claim watch (flagged)** — a listed product capability that resolves to a deferral to a partner's standard |
| H5 | Global compliance / localization | W | ✅ | 57 locales `[api]` + `api.eu1.paradox.ai` + a full `eu1.*` CT host family | ❌ | high | → **fact** |
| H6 | Security certifications — ISO 27001, SOC 2 Type II, EU-U.S. DPF | W | ✅ | trust/sub-processor pages (infra) | ❌ | med | → **fact** |
| H7 | "Open API" / integrations with major ATS platforms | W | ✅ | **53 operations / 36 paths**, verbatim OpenAPI 3.1 `[api]` | ❌ | **high** | → **fact**, but see the buried-flagship note below |
| H8 | Indeed Apply integration | W | ❌ | no route, no API op, no bundle string — the application completes **inside Indeed Apply itself** | ❌ | — | **partner-side-implementation** — a recorded gap, not a miss |
| H9 | Workday integration (Workday Certified) | W,D | ✅ | the entire public KB category + ~24 Workday sub-processor entities + `use_paradox_status_map`/`status_map_*` `[api]` | ❌ | high | → **fact** |
| H10 | SAP SuccessFactors integration (SAP Endorsed App) | W | ✅ | `olivia.paradox.ai/demo/sf-iframes` `[api]` + the `/external/*` router family | ❌ | high | → **fact** (two independent artifacts) |
| H11a | ADP integration | W | ✅ | `adp_link` on the Candidate schema `[api]` + an ADP SSO callback | ❌ | high | a field on the core entity — a firmer signal than a logo |
| H11b | Taleo · Cornerstone · Greenhouse (and the 100+-vendor long tail) | W | ❌ | none located; **Merge API** in the sub-processor list suggests brokered connectors | ❌ | — | **partner-side-implementation / brokered** — recorded gap |
| H12 | US / EU data-residency split | W,D | ✅ | documented `api.eu1` / `api.stg.eu1` hosts `[api]` + an independent CT-log `eu1.*` family | ❌ | high | → **fact** |

**H: 13 claimed · 8 located · 5 not located.**

---

## Located-but-not-walked — the re-walk queue

**All 68 located features are `not-walked`.** Nothing was navigated. Listing 68 identical rows would be
noise, so the queue below is **prioritised for a future run that has both a credential and a browser**,
ordered by how much each would change the corpus's conclusions.

| Pri | Re-walk target | Route(s) | Why it is top of the queue |
| --- | --- | --- | --- |
| **1** | **`GET /api/menu` + `GET /api/casl-ability`** | `/api/menu`, `/api/casl-ability` | **Two authenticated GETs.** The first returns the real per-tenant D0 nav — converting every `Dn (inferred)` in `information-architecture.md` into a measured depth and setting `ia_nav_complete`. The second returns the CASL verb taxonomy — *the richest single data-model artifact available on this target* (`data-model-api-surface.md` open question #8). Highest value-per-action in the entire corpus. |
| **2** | **Assist** | `/assist`, `/assist/calendar`, `/assist/scheduling_action` | The run's most strategically interesting finding rests on **one screenshot and three route strings**. Walking it would settle whether it acts or only answers, and whether it rides `wss://ws.paradox.ai`. |
| **3** | **The candidate conversation** (Conversation tab + a live inbound text) | candidate profile → Conversation | The only way to observe the product's actual behaviour. **Note: needs a live phone, not just a session** — the transport is carrier SMS/WhatsApp/Messenger with no web wire. |
| **4** | **`/settings/*` — all ~35 surfaces** | `/settings/**` | The largest area of the product, **0 of 35 with any image evidence**. Also where the CS-rep-operated boundary (F6, F17) becomes visible. |
| **5** | **The scheduling cluster** | `/lead-interview/*` (~40 routes) | By route count, this *is* the product; the console flow (F4 in `ux-flows.md`) is entirely inferred. |
| **6** | **The retention suite** | `/microlearning`, `/employee-{recognition,rewards}`, `/employee-chat/messages` | An unmarketed second product line; only Recognition has a second lane. |
| **7** | **`/integration-center-v2`, `/settings/data-feeds`** | as listed | The *v2* naming implies a mature integration-ops surface far richer than the published partner API. |
| **8** | The 13 marketed "products" as they appear in-console | `/settings/*` sections | Would convert the "13 skins on one engine" finding from a three-lane inference into a walked observation. |

---

## Claimed-but-not-located — all 24 rows, each dispositioned

**No row is left blank.** Counts: `deeper-than-looked` 13 · `unreachable-this-run` 5 ·
`marketing over-claim` 2 · `partner-side-implementation` 2 · `roadmap-not-shipped` 1 · `vendor-operated` 1.

### deeper-than-looked → the re-walk queue (13)

`A15` Hot Jobs · `A22` Zoom/Teams/Webex/Skype/BlueJeans video integrations · `A26` military-skills
translator + commute-time calculator · `D2` **AI-assisted campaign copywriting** · `D5` "Find" pre-CRM
lead screening · `D8` no-forms event registration · `D10` real-time event candidate evaluations ·
`E4` SEO support · `E6` internal career sites with SSO · `F4` Number of Hires auto-close ·
`F13` document version tracking · `G2` day-1 reminders / pre-boarding · `H2` secure sFTP export.

> Two of these deserve a flag rather than a queue slot. **`D2` (AI-assisted campaign copywriting)** is a
> *marketed AI capability* with no located surface on any lane — the highest-priority item in this group.
> **`A22`** is odd for a different reason: five named video vendors appear in marketing but **none appears
> in the live CSP or the sub-processor list**, which for a browser-embedded video integration is a
> mildly contradictory negative worth re-checking before accepting the claim.

### unreachable-this-run — capability-gated, NOT re-walkable (5)

| Row | Claim | Why no walk can locate it |
| --- | --- | --- |
| `A5` | Inquiry Detection (question-vs-answer intent) | a runtime NLU property of the conversation |
| `A13` | Emoji + reactions in chat | in-conversation UI on the candidate's own messaging client |
| `A14` | Explicit-image blur / media moderation | same |
| `A16` | Chatbot job search + job-preference input | candidate-side conversational behaviour |
| `H3` | Accessibility features | a rendered-UI property; requires a browser + an audit, neither available |

**These five are the structural core of the `auth:none` + no-browser double blocker**, and the reason the
new disposition is proposed. Four of the five are properties of *the conversation* — which, per
`ux-flows.md` F2, is carrier-mediated and has **no capturable web wire at all**, so even a fully
authorised recruiter session would not close them. Closing them needs **a live phone texting a
Paradox-powered career site**.

### marketing over-claim → flagged to `product-features.md` (2)

| Row | Claim | Evidence against |
| --- | --- | --- |
| `D9b` | a **student-facing mobile app** (Campus Events page) | Paradox's public developer catalogue on **both** App Store and Play Store lists only the CEM app, the Regis white-label build, and the Safari extension. A two-store negative. *(Caveat: it could ship inside a customer's own app or as a web app — flagged as an over-claim **candidate**, medium confidence, not asserted.)* |
| `H4` | "Fairness & Compliance" as a product capability | resolves to NIST AI RMF *alignment* plus an explicit deferral of bias-evaluation methodology to **"Workday's evolving ethical AI standards"**. Listing it as a product feature overstates what Paradox itself does. |

### partner-side-implementation → recorded gap (2)

`H8` **Indeed Apply** — the conversational application completes **inside Indeed**, on Indeed's side,
undocumented from Paradox's end. Not a Paradox surface to locate. · `H11b` **Taleo / Cornerstone /
Greenhouse and the 100+-vendor long tail** — **Merge API** in the sub-processor list implies these are
brokered through a unified-API vendor rather than built as Paradox surfaces.

### roadmap-not-shipped → recorded gap (1)

`C10` **Calendar Negotiation — "Coming Soon"**, disclosed by the vendor on the Conversational Scheduling
page. Correctly not counted as shipped.

### vendor-operated → recorded gap + a GTM finding (1)

`F6` **"Next Step"** (custom workflow status transitions) is documented verbatim as *"set up on the
backend by your CS Representative."* There is no customer-facing surface to locate **because the feature
is delivered by a Paradox employee.** Combined with `F17` (Assistant Messaging: "access to this page is
limited — contact your CS Representative"), career sites sold as "White Glove Service", and Cielo + The
Cloud Connectors as implementation-services sub-processors, this is a **configured-for-you enterprise
product with a services layer**, not a self-serve platform. **The deployed product is partly a Paradox
employee** — a coverage row that is really a business-model finding.

---

## Buried flagships

Marketing-promoted capabilities sitting at depth in the product (from
`information-architecture.md`'s promoted-vs-buried reconciliation). **All depths are inferred.**

| Flagship | Marketed as | Actually at | Read |
| --- | --- | --- | --- |
| **The conversation** | the entire pitch — "Meet the AI assistant for all things hiring" | a **tab inside a candidate detail record**, D3 (inferred). No D0 router destination corresponds to "conversations." | The console is a *candidate-record manager*; the conversation is a field on the record. |
| **The 13 "Conversational X" products** | 13 top-level marketing destinations | `/settings/{job-builder,interview-builder,event-templates,workflows,…}` — **configuration sections of one console**, D1–D2 (inferred) | Thirteen marketed products, **zero product-shaped destinations**. Corroborated on three independent runtime lanes. |
| **"Open API"** — claimed on nearly every product page | a platform capability | **one unlabelled outbound link** at `/partners/integrations` → a third-party ReadMe.io host, with no `docs.`/`developer.` subdomain in 9 years of CT logs | A real, actively-maintained 53-operation OpenAPI 3.1 surface that is **effectively unnavigable**. |
| **"1,000+ metrics tracked"** | restated on nearly every product page | a single `/analytics` route + a 3-operation Reporting API | Promoted at ~13× the weight it carries in the router. |
| **Express Care** | its own SKU, persona ("Becky"), and stat block | `/express-care`, footer-reachable, **absent from the main nav**, D2 | A packaged vertical SKU with no nav home. |

---

## Unmarketed depth

The inverse finding — powerful surfaces the marketing never mentions. **This is where this run's
static-only method performed *better* than a nav walk would have**, because a route table is a complete
inventory of what the client can render, whereas a walk only finds what the nav exposes.

| Surface | Evidence | Confidence | Why it matters |
| --- | --- | --- | --- |
| **"Assist" — the recruiter-facing, voice-enabled AI copilot** | Assist button + opened panel with microphone `[shot]` (high) **and** `/assist`, `/assist/calendar`, `/assist/scheduling_action` (bundle, medium) | **fact** (2 independent dimensions) | Absent from all 13 product pages, every KB article, and all 53 API operations. **Reframes the category:** the defensible surface may be the *recruiter's* copilot, not the candidate bot everyone markets. |
| **Olivia Extension** — LinkedIn-embedded sourcing companion (macOS/Safari, `ai.paradox.brext`, released 2025-06) | a separately-listed distribution artifact (high) | high | An entire distribution surface absent from website and docs. Same strategic direction as Assist. |
| **The retention suite** — `/microlearning`, `/employee-recognition`, `/employee-rewards`, `/employee-chat/messages`, `/employer-tax-info`, `/employees` | router (medium); Recognition also in the App-Store changelog (medium) | Recognition **fact**; the rest single-source | The site's post-hire story stops at "Onboarding." The router goes four steps further. Paradox is quietly building the **retention half** of the frontline lifecycle. |
| **~35 `/settings/*` configuration surfaces** | router (medium); 5 corroborated by the KB glossary → fact | medium→fact | The largest area of the product by route count, and marketing describes essentially none of it. |
| **`/integration-center-v2` + `/settings/{data-feeds,alert-management-v2}`** | router (medium) | medium | A named **v2** integration console implies a mature, iterated integration-ops product — versus a thin published partner API. |
| **`/iam/account-access-request`** | router (medium) | medium | An access-request/approval workflow for the console itself — enterprise IAM depth nobody markets. |
| **Zenoti** as the room/service-booking backend (36+ strings incl. `ROOM_BOOKING_TYPE`, `MAX_ITV_DURATION_ZENOTI`) | bundle (medium) | medium, single-source | A spa/salon booking platform inside a hiring product's interview scheduler — deep retail/service-vertical tooling nobody would guess. |
| **White-labeled native app builds per enterprise customer** ("Regis + Paradox CEM" on both stores) | distribution (high) + `regis.paradox.ai` in CT (medium) | **fact** | Per-customer app binaries, unmentioned in marketing. |
| **`/candidate-segment/*`, `/list-filters`, `/preview`, `/share-email`, `/widget-ratings`** | router (medium) | medium | A segmentation/bulk-action layer the CRM page only gestures at. |

---

## Scorecard derivation (so Mode 5 can reproduce every number)

| Field | Computation | Value |
| --- | --- | --- |
| `features_claimed` | A 26 + B 2 + C 10 + D 12 + E 7 + F 17 + G 5 + H 13 | **92** |
| `features_located` | 19 + 2 + 9 + 7 + 5 + 14 + 4 + 8 (✅ and ⚠ both count as located) | **68** |
| `features_walked` | nothing was navigated | **0** |
| `feature_location_rate` | 100 × 68 ÷ 92 | **74** |
| `flow_coverage` | 10 identified, 10 diagrammed, **0 observed**. Diagrams are all inferred per `cartography-flows.md` rule 6 ⇒ scored on the observed lane | **0** *(raw diagrammed÷identified = 100 — published above as `flows_diagrammed_inferred` so either can be recomputed)* |
| `ia_surfaces_mapped` | surface cards in `information-architecture.md`: 4 public + 3 docs + 9 console | **16** |
| `ia_nav_complete` | the console nav is **server-driven per tenant** via `/api/menu`, never fetched; 12 of 30 D0 destinations have a card (ratio 0.40) | **false** |
| `screenshot_coverage` | 3 of ~31 primary surfaces have any image (Login, Candidates, Assist) — **all App-Store-listing surrogates** | **10** |
| `screenshot_coverage_live` | zero screenshots captured this run (no browser tool) | **0** |
| `claimed_not_located_undispositioned` | all 24 dispositioned | **0** (no −2 penalties) |

**Indicative Mode-5 axis-2 score** (`self-correction.md` rubric axis 2, max 20), using the scored values:
`8 × 0.74` + `6 × 0.00` + `4 × 0.10` + `2 × 0.40` = `5.92 + 0 + 0.40 + 0.80` = **≈ 7.1 / 20**.

**That number is the correct read of this run and should not be argued up.** A Cartography pass that
located 74% of claimed features but **walked none, screenshotted none, and observed no flow** is exactly
what a ~7/20 experiential score describes. The recommendation to Mode 5 is **not** to iterate for a
better score — the within-run re-walk loop *cannot execute* without the browser tools — but to record the
capability gap as a top-line finding and route the two harness changes below.

## Handoff to Mode 5

1. **The capability gap is the headline, and it is distinct from `auth:none`.** `ingestion.md` §8 says a
   capability found unavailable mid-run, where only a materially weaker method remains, is **a checkpoint
   — pause and confirm with the user**, not a silent degrade. Mode 4 here proceeded on the weaker method
   (static reconstruction) and documented it exhaustively rather than pausing. **Whether Cartography
   should have halted for confirmation instead is a genuine Mode-5 question**, and the honest answer is
   probably yes: a Mode-4 run with no browser is a materially different deliverable and the user should
   have been told before, not after.
2. **The within-run re-walk loop cannot run.** `self-correction.md` §C iterates Cartography defects as a
   *live read-only re-walk*. With no browser tool that loop is a no-op. Mode 5 should record
   `stopped_on: capability-blocked` for the Cartography defect class rather than iterating to no effect.
3. **Two harness-change proposals** (approval-gated, for the next different target):
   - **Add `unreachable-this-run (capability-gated)` to the disposition taxonomy** in
     `cartography-coverage.md`, so a claim that is unlocatable *by construction* is not misrouted into a
     re-walk queue that cannot close it. 5 rows this run.
   - **Add a `run_mode: degraded` + `blockers[]` block to the coverage scorecard schema**, and make
     `screenshot_coverage_live` a first-class field distinct from surrogate coverage — so a Mode-5 axis-2
     score can never be inflated by App-Store screenshots standing in for live captures.
4. **Pre-flag at Discovery, for conversational-channel products:** name up front which gaps a session
   would and would **not** close. On this target a full recruiter session still would not have observed
   the candidate conversation (carrier-mediated, no web wire) — 4 of the 5 `unreachable-this-run` rows
   would survive it. That belongs in `00-recon-plan.md`, not in a Mode-4 post-mortem.
