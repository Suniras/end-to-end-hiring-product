# Paradox — Information Architecture

> ## ⚠️ READ FIRST — this is a DEGRADED Mode-4 run. Nothing below was walked.
>
> Cartography's normal method is *"the main session re-enters the live product via the browser
> singleton and walks it read-only, section by section"* (`cartography.md` § "How Mode 4 is driven").
> **That method was not executable on this run, for two independent reasons stacked on top of each
> other:**
>
> | # | Blocker | Kind | Consequence |
> | --- | --- | --- | --- |
> | 1 | **`auth: none`** — no credential was ever available for `olivia.paradox.ai`; `session` is `status: absent`, `wire-capture` is `status: folded` (session: `_summary.md` · inferred · high · `completeness_pct: 0`) | **access gap** (the one `cartography.md`'s degraded-mode paragraph anticipates) | no authenticated surface to enter |
> | 2 | **The Chrome / browser-driving MCP tools were absent from this session's toolset entirely** — verified by tool search, not merely permission-gated or unauthorized | **capability gap** (`ingestion.md` §8, "Capability gap = a checkpoint, not a silent fallback") | even the *public* surfaces could not be browser-walked, and **no screenshot of any kind could be captured** |
>
> Blocker 2 is the one worth carrying into Mode 5: it is **not** the same as `auth:none`. Had a
> credential existed, this run still could not have walked, measured, or screenshotted anything,
> because the instrument was missing. The two blockers are recorded separately throughout so
> Self-correction can score them separately.
>
> **What this document therefore is:** an information architecture **reconstructed from static
> artifacts already captured in Modes 1–3** — a marketing/docs page inventory fetched by `curl`/WebFetch,
> and a **string-mined client-side router table** for the authenticated console. Every surface card
> below carries an explicit `Provenance` line stating which of those it came from.
>
> **What it is NOT:** a walked nav. **Zero surfaces were navigated. Zero screenshots were captured this
> run.** No depth measurement below the public marketing site is *observed* — console depths are
> **inferred from route-path shape**, and are labelled `Dn (inferred)` everywhere. Per `cartography.md`,
> *"Cartography never fabricates an IA it could not navigate"* — so this document draws the line
> explicitly rather than presenting a reconstruction as a walk.

---

## TL;DR

Paradox presents **three structurally different information architectures**, and only the first two were
reachable at all this run.

1. **The public marketing site (`www.paradox.ai`)** is a flat, wide, six-item nav over ~742 sitemap URLs,
   whose most load-bearing property is that its **13 `/products/*` destinations are one engine wearing
   thirteen skins** — two of them (`conversational-apply`, `screening`) serve near-identical `<title>` and
   body content (website: `raw/products.md` · crawl-clip · medium). Everything is D0/D1: nothing is buried,
   because there is almost nothing there to bury. **No pricing exists at any depth** — `/pricing` is a
   live URL that 301s to home.
2. **The public documentation surface (`paradox.helpjuice.com`)** is three levels deep and *one category
   wide*: a single "Workday Feature Descriptions" category with four articles, plus an undocumented,
   zero-auth `glossary_terms.json` that is the single most IA-informative artifact in the run — 15
   admin-console jargon terms that name console pages nobody walked (docs: `raw/helpjuice-kb.md` ·
   crawl-clip · medium).
3. **The authenticated recruiter console ("CEM" — Candidate Experience Manager)** is where the actual
   product lives, and it is **enormous**: 100+ client-side router paths, of which ~40 are
   scheduling/interview-ops and **~35 are `/settings/*` configuration surfaces alone**
   (deployed-client-bundle: `raw/route-table.md` · bundle-string-mine · medium). It is served by **two
   coexisting frontend generations on one host** — a thin Nuxt 3 shell covering only login/OTP/SSO, and
   the legacy Django + jQuery/Vue2/Handlebars console that is still the real product and was
   **redeployed the same month as capture** (asset path stamped `202608`).

**The single biggest structural finding available without a walk:** the console's navigation is
**server-driven and per-tenant** — the router table contains `/api/menu` and `/menu/clicked-tracking`
(bundle: `raw/route-table.md` · medium). The nav tree is therefore **not a static artifact at all**; it is
a per-tenant, per-role menu payload. This means `ia_nav_complete` is not merely *unmeasured* on this run —
it is **not statically knowable for any tenant**, and a single authenticated `GET /api/menu` would return
the real D0 destination list in one call. That is the highest-value, lowest-cost Mode-4 action available
to any future run on this target.

**The deepest positioning-vs-product gap, computable even without a walk:** every one of the 13 marketed
"Conversational X" products maps to a **settings section or a route inside one console**, not to a
destination of its own. Marketing sells thirteen products; the router exposes one product with thirteen
configuration surfaces. Conversely, two whole capability areas the marketing never mentions — a
**recruiter-facing AI copilot ("Assist")** and a **post-hire retention suite** (microlearning, employee
recognition/rewards, employee chat) — sit in the router as first-class routes.

---

## Layer 1 — Public marketing IA (`www.paradox.ai`)

**Provenance for this whole layer:** `website: _summary.md`, `raw/{home,products,solutions-usecases,
partners-integrations,case-studies,pricing,legal-security-fraud,resources-community}.md` ·
crawl-clip · medium. Pages were **fetched** (WebFetch + direct `curl`), **not browser-walked**; depth is
read from URL structure and the captured nav, which is reliable for a flat marketing site and is the one
place in this document where the depth measure is close to honest.

### Nav tree

```
www.paradox.ai
├─ Product                                     [D0, promoted]
│   ├─ Conversational ATS                      [D1]
│   ├─ Candidate Experience Agent              [D1]
│   ├─ Conversational Career Sites             [D1]
│   ├─ Conversational Apply                    [D1]  ← near-identical to Screening
│   ├─ Screening                               [D1]  ← near-identical to Conversational Apply
│   ├─ Text-to-Apply                           [D1]
│   ├─ Conversational Scheduling               [D1]
│   ├─ Conversational Events                   [D1]
│   ├─ Campus Events                           [D1]
│   ├─ Conversational CRM                      [D1]
│   ├─ Onboarding                              [D1]
│   ├─ Surveys                                 [D1]
│   └─ Video                                   [D1]
├─ Use Case                                    [D0, promoted]
│   ├─ Industries: retail · restaurant · franchise-hiring · healthcare ·
│   │  trucking-logistics · manufacturing · financial-services · hospitality   [D1 ×8]
│   └─ Personas: candidates · recruiters · managers                            [D1 ×3]
├─ Partners                                    [D0, promoted]
│   ├─ Workday · SAP · Indeed                  [D1 ×3]
│   └─ Integrations catalog (12 categories, 100+ vendors)  [D1]
│       └─ → "API Developer Hub" outbound link → readme.paradox.ai   [D2, BURIED — see below]
├─ Our Clients                                 [D0, promoted]
│   ├─ clients-stories (logo wall, ~38 logos)  [D1]
│   └─ case-studies/* (63 slugs)               [D1 ×63]
├─ Resources                                   [D0, promoted]
│   ├─ The Conversation (webinar/interview hub)      [D1]
│   ├─ Reports (3rd-party analyst research)          [D1]
│   └─ Blog                                          [D1]
├─ Demo (CTA)                                  [D0]
├─ Log in (CTA) → olivia.paradox.ai            [D0 — the seam into Layer 3]
└─ Footer                                      [D1]
    ├─ /legal/fraud · /legal/security · /legal/subprocessors (PDF)  [D2]
    ├─ /ethical-ai                                                  [D2]
    └─ /express-care  (a named vertical SKU, NOT in the main nav)   [D2, buried]
```

Unlinked-from-nav but live: `/why-paradox` (the "software company that doesn't want you to use our
software" pitch), `/pricing` (**301 → home**, verified by `curl -I` across 9 probe points).

### Surface cards — public marketing

#### Product index + the 13 product pages   [`/products/*` · D0→D1 · promoted]
- **Capability:** read-only marketing. Feature lists, stat blocks, CTAs.
- **Entities surfaced:** none (no product data).
- **Endpoints:** none (Webflow behind Cloudflare — website: `_summary.md` · medium).
- **Screenshot:** ❌ **gap — no browser tool this run** (capability gap #2).
- **Note:** the `conversational-apply` / `screening` title-and-body collision was confirmed by direct
  `curl`, not a summariser — the strongest single piece of "13 products = 1 engine" evidence.

#### Pricing   [`/pricing` · D0-expected · **ABSENT**]
- **Capability:** none. The slug is live and **301-redirects to the homepage** — deliberately pointed
  home rather than 404'd.
- **Note:** this is an IA finding, not a crawl miss: the absence is load-bearing (100% enterprise-quote
  GTM, corroborated by `infra`'s sub-processor list naming **no payment processor at all** — see
  `competitive-positioning.md`).

#### Partners → Integrations   [`/partners/integrations` · D1 · promoted]
- **Capability:** read-only catalog, 12 categories / 100+ vendors.
- **The buried-flagship of the public site lives here:** the **only link anywhere on paradox.ai to the
  API Developer Hub** (`paradox.readme.io` → `readme.paradox.ai`). A **53-operation, machine-parseable
  OpenAPI 3.1 partner API** is reachable at **D2, via one unlabelled outbound link, on a
  third-party-hosted domain invisible to subdomain enumeration** (api: `raw/endpoint-catalog.md` ·
  openapi-verbatim · high). No `docs.` or `developer.` subdomain has existed in 9 years of CT logs
  (infra: `raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium). **This is the run's clearest
  positioning-vs-product IA gap on the public side:** a real, actively-maintained developer surface,
  effectively unnavigable.
- **Screenshot:** ❌ gap — no browser tool.

#### Express Care   [`/express-care` · D2 · **buried**]
- A packaged vertical SKU (high-volume service businesses) with its own assistant persona ("Becky"),
  its own stat block, and **no main-nav entry** (website: `raw/solutions-usecases.md` · medium).

---

## Layer 2 — Public documentation IA (`paradox.helpjuice.com`)

**Provenance:** `docs: raw/doc-map.md`, `raw/helpjuice-kb.md` · crawl-clip · medium. Fetched, not walked.
Depths here are taken verbatim from the docs collector's own D0/D1/D2 table, which was derived from URL
structure + the sitemap + the atom feed.

```
paradox.helpjuice.com                                          [D0]
├─ Workday Feature Descriptions  (the ONLY public category)    [D1]
│   ├─ Conversational Apply                                    [D2]
│   ├─ Conversational Interview Scheduling                     [D2]
│   ├─ Conversational Career Site                              [D2]
│   └─ Hiring Team Experience                                  [D2]
├─ /glossary_terms.json      (undocumented data endpoint, zero auth)   [data]
├─ /questions.atom           (full article HTML, zero auth)            [feed]
├─ /en_US/release-notes      → **302 → SAML login** (gated)            [D1, walled]
└─ "+ View More Categories"  → resolves to nothing public              [boilerplate]
```

#### Surface card — the KB root   [`/` · D0 · promoted]
- **Capability:** read-only. Locale switcher `en_US / es_MX / fr_CA`.
- **Note:** the KB's real purpose is a **Workday-marketplace partner feature-description listing**, not a
  product manual — one article carries the verbatim clause *"Conversational Career Site functionality —
  requires a separate services agreement with Workday for implementation."* It covers **4 of the 13
  marketed products**.

#### Surface card — the glossary endpoint   [`/glossary_terms.json` · data · **unmarketed depth**]
- **Capability:** returns 15 internal admin-console terms with definitions, unauthenticated.
- **Why it is an IA artifact:** it *names console surfaces nobody walked* — **Assistant Messaging** (a
  permission-gated settings page), **CVO**, **NOH**, **OIT**, **Job Data Package**, **System Attribute /
  token**, **Next Step**, **Hot Jobs**, **Inquiry Detection**, plus the legacy→current renames
  (Capture→Apply, Care→Q&A, Rating→Surveys). Five of these independently corroborate `/settings/*` routes
  found in the bundle — **two independent dimensions → fact** that those console surfaces exist, even
  though nobody navigated to them.

#### Surface card — release notes   [`/en_US/release-notes` · D1 · **walled**]
- **302 → `olivia.paradox.ai/login?SAMLRequest=…`.** Proof Paradox maintains a changelog *internally*
  while publishing none (community: `raw/changelog-digest.md` · crawl-clip · medium). A gated surface
  recorded as gated, not as absent.

---

## Layer 3 — The authenticated recruiter console ("CEM") — **RECONSTRUCTED, NOT WALKED**

> **Every card in this section carries the same provenance ceiling.** Source: a **string-mine of the
> legacy console's client-side router path literals** in `common.34448012115f.js` /
> `page.b12fa8c10ff0.js` (deployed-client-bundle: `raw/route-table.md` · bundle-string-mine · **medium**).
> These are **route strings compiled into a JS bundle** — evidence that a route is *registered*, not that
> it is reachable, shipped to any given tenant, or placed anywhere in particular in the nav.
>
> - **Located?** = the route literal exists in the bundle. ✅ never means "walked."
> - **Depth?** = **inferred from route-path shape only** (`/x` → D0, `/x/y` → D1/D2). Real depth is a
>   property of the rendered nav, which is **server-driven per tenant via `/api/menu`** and was never
>   fetched. Every depth in this section is written `Dn (inferred)`.
> - **Screenshot?** = ❌ for all but three surfaces, where the only image evidence is an **App-Store
>   listing screenshot** (distribution-artifacts: `raw/screenshot-catalog.md` · binary-extract · high) —
>   a marketing asset of the real product chrome, **not a capture from this run**. See
>   `dimensions/session/captures/screens/_index.md`.
> - **Endpoints?** = the console's *router* paths were recovered; its **AJAX endpoint set was not**
>   (Nuxt lazy chunks past `/login` are auth-gated and were never fetched). Endpoint lines below cite
>   only what the seam file actually holds.

### The two-generation seam (an IA fact before any nav tree)

| Generation | Serves | Stack | Status |
| --- | --- | --- | --- |
| **A — Nuxt 3 / Vue 3** (`app@3.0.0-beta.13`) | `/`, `/login`, `/candidate` only | Nuxt 3, Nuxt-auth at `/api/_auth`, CASL at `/api/casl-ability` | the **only** unauth-reachable surface; everything else server-redirects to `/login` |
| **B — Django + jQuery/Vue2/Vuex/Handlebars** ("Candidate Experience Manager") | the entire recruiter/admin product, 100+ routes | legacy; assets at `cdn.olivia.paradox.ai/caches/**202608**/js/*` | **redeployed the same month as capture** — live, not dead code |

A user logging in crosses a **generation seam** mid-journey: auth is the new stack, the product is the
old one. This is a strangler-fig migration caught mid-flight, and it is visible in the IA itself, not
just the stack (technology-architecture.md; corroborated independently by the 2026-07-27 Statuspage
postmortem naming an active legacy-sync→async backend migration — community: `raw/issue-themes.md` ·
crawl-clip · medium → **two independent dimensions = fact**).

### Nav tree (reconstructed from router path literals — **NOT a walked nav**)

```
olivia.paradox.ai   [Gen A shell]
├─ /login                                        [D0]  ✅ the only surface with any live evidence
│   └─ /api/_auth/callback/{adp,google,microsoft-entra-id,smartrecruiters,facebook}   [D1]
├─ /candidate                                    [D0]  registered; resolves to login when unauthed
└─ (everything below: Gen B legacy console — route literals only)

CEM console  [Gen B]
├─ /dashboard                                    [D0 inferred]
├─ /candidates                                   [D0 inferred]  ← depicted in App-Store screenshots
│   ├─ /candidates/inbox                         [D1 inferred]  ← depicted
│   ├─ /candidates/management                    [D1 inferred]
│   ├─ /candidate-segments · /candidate-segment/{,create}   [D1/D2 inferred]
│   ├─ /candidate-hire-detail                    [D2 inferred]  ← the "Hire Details" profile tab
│   ├─ /candidate-offer-detail                   [D2 inferred]
│   └─ /list-filters                             [D2 inferred]
├─ /jobs                                         [D0 inferred]
├─ /interviews · /my-calendar · /interview/calendar/init      [D0/D1 inferred]
├─ /assist                                       [D0 inferred]  ← **UNMARKETED**; depicted
│   ├─ /assist/calendar                          [D1 inferred]
│   └─ /assist/scheduling_action                 [D1 inferred]
├─ /events · /events/                            [D0 inferred]
├─ /campaigns                                    [D0 inferred]
├─ /campuses                                     [D0 inferred]
├─ /communications                               [D0 inferred]
├─ /communities · /v3/communities · /talent-community          [D0/D1 inferred]
├─ /analytics                                    [D0 inferred]
├─ /surveys · /widget-ratings                    [D0/D1 inferred]
├─ /cms · /site-studio                           [D0 inferred]
├─ /microlearning                                [D0 inferred]  ← **UNMARKETED**
├─ /employee-recognition · /employee-rewards     [D0 inferred]  ← **UNMARKETED**
├─ /employee-chat/messages                       [D1 inferred]  ← **UNMARKETED**
├─ /employees · /employer-tax-info               [D0 inferred]  ← **UNMARKETED**
├─ /integration-center-v2                        [D0 inferred]
├─ /alerts · /search{,/locations,/user} · /preview · /share-email     [D0/D1 inferred]
├─ /admin · /admin-user · /iam/account-access-request                 [D0/D1 inferred]
├─ /user-help · /user-home-page · /user/idle · /logout                [D0/D1 inferred]
│
├─ SCHEDULING / INTERVIEW-OPS  (~40 routes — the deepest functional cluster)
│   ├─ /lead-interview/{schedule,cancel,cancel_request,check_attendee,reschedule,
│   │                   slots,edit_itv_details,assign_scheduling_task}      [D2 inferred]
│   ├─ /lead-event-interview/{events,cancel,session,orientation_events}     [D2 inferred]
│   ├─ /lead-itv-prep · /lead-itv-settings · /lead-watch                    [D2 inferred]
│   └─ /external/**  (the partner-embed family — see card below)            [D1–D3 inferred]
│
└─ /settings                                     [D0 inferred]  ← ~35 sub-surfaces, the biggest area
    ├─ Identity & access:  my-profile · security · users · group-management ·
    │                      company-information · client-setup                [D1 inferred]
    ├─ Org model:          location-management · school-management ·
    │                      field-manager · system-attributes                 [D1 inferred]
    ├─ Hiring model:       job-builder · job-data-packages · applicant-flows ·
    │                      forms · approvals · approvals-builder ·
    │                      candidate-volume-optimizer · offers-type          [D1 inferred]
    ├─ Interview model:    interview-builder · interview-preps ·
    │                      event-templates · round-robin-management ·
    │                      external-interview-preps/create                   [D1/D2 inferred]
    ├─ Automation:         workflows · journeys                              [D1 inferred]
    ├─ Conversation model: conversations · assistant-messaging ·
    │                      assistant-reminders · whatsapp-templates ·
    │                      phone-numbers · knowledge-base                    [D1 inferred]
    ├─ Web & content:      web-management · experience                       [D1 inferred]
    └─ Ops:                data-feeds · alert-management-v2 ·
                           user-feedback · suggestions                       [D1 inferred]
```

### Surface cards — console (all `located via bundle route-table, NOT live-walked`)

#### Login   [`/login` · D0 · promoted]
- **Capability:** authenticate. Single identifier field accepting **phone / email / Employee ID**, a
  "keep me signed in" toggle, five SSO providers (ADP, Google, Microsoft Entra ID, **SmartRecruiters**,
  Facebook), plus SAML (proved independently by the KB release-notes 302).
- **Entities:** User → `employee_id` / `login_email` (data-model-api-surface.md).
- **Endpoints:** `/api/_auth`, `/api/_auth/callback/{5}`, `/api/casl-ability` (`_shared/api-path-catalog.md`
  · source: bundle).
- **Screenshot:** **surrogate only** — `screens/03-login-ipad.md` (App-Store listing image, not a live
  capture).
- **Provenance:** Gen-A Nuxt shell, the **only** console surface with any live HTTP evidence this run
  (200 + SSR payload). Everything else in Layer 3 is route-literal evidence.

#### Candidates (inbox / triage)   [`/candidates`, `/candidates/inbox` · D0–D1 (inferred) · promoted]
- **Capability:** read + triage. Candidate list with live count badge (thousands-scale, "6,360
  Candidates" / "999+"), sortable by most-recent-activity, **status pills** — Interview Scheduled /
  Interview Pending / Interview Canceled / **Capture Incomplete** (a legacy product name still live in
  the UI).
- **Entities:** Candidate (44 writable fields), Stage, Conversation (data-model-api-surface.md).
- **Endpoints:** ❌ console AJAX set not recovered. Nearest published analogue: `GET /candidates` with 23
  query params (api · openapi-verbatim · high) — **the partner API, not necessarily what this screen
  calls.**
- **Screenshot:** **surrogate only** — `screens/01-candidate-inbox.md`, `screens/04-console-desktop.md`.

#### Candidate profile (4 tabs)   [`/candidates/…`, `/candidate-hire-detail`, `/candidate-offer-detail` · D2 (inferred)]
- **Capability:** read + act on one candidate. Four tabs: **Conversation / Résumé / Notes / Hire
  Details**, a workflow-status banner ("Interview Request Sent"), and a **per-candidate view/read-receipt
  audit trail** ("Company Admin viewed", dated).
- **Entities:** Candidate + `resume`, `note`, `hired_date`, `candidate_journey_status`, `offer_letter`.
- **Screenshot:** **surrogate only** — `screens/04-console-desktop.md`.
- **Note:** the four tabs are the clearest confirmation available that the entity spine
  (`data-model-api-surface.md`) is realized 1:1 in the screen layer — transcript, parsed résumé,
  free-text notes, structured hire record.

#### Conversation / chat takeover   [inside the candidate profile · D3 (inferred) · **buried**]
- **Capability:** read the Olivia↔candidate transcript and **inject into it** — a human takeover of the
  AI thread. The composer **retargets to the candidate's actual channel** (it read *"Send an email"*, not
  *"send a message"*).
- **Endpoints:** ❌ unobserved. Published analogue: `POST /candidates/send_message`.
- **Screenshot:** **surrogate only** — `screens/02-candidate-chat.md`.
- **Buried-flagship note:** this is the surface where *the product's entire value proposition* is
  visible, and it sits **three levels down inside a detail tab** — no D0 destination in the router
  corresponds to "conversations."

#### Assist (recruiter AI copilot)   [`/assist`, `/assist/calendar`, `/assist/scheduling_action` · D0–D1 (inferred) · **UNMARKETED DEPTH**]
- **Capability:** a conversational, **voice-enabled** copilot for the *recruiter* — suggested prompts
  *"I need to schedule an interview" / "When is my next interview?" / "How do I update my availability?"*,
  a large microphone button, a keyboard toggle. Opens as a right-side panel over the dimmed console.
- **Entities:** Interview, User availability, Candidate.
- **Endpoints:** ❌ unobserved. Candidate transport: `wss://ws.paradox.ai` (declared in the Nuxt config +
  the CSP — two independent artifacts → the socket's *existence* is fact, its *contents* unknown).
- **Screenshot:** **surrogate only** — `screens/05-assist-panel.md`.
- **Finding:** appears on **none** of the 13 product pages, in **no** KB article, and in **none** of the
  53 public API operations — yet is a labelled button in the product's own App Store marketing images
  **and** a router path. Two independent dimensions → **fact**.

#### Settings   [`/settings` + ~35 sub-routes · D0→D1/D2 (inferred) · the largest surface in the product]
- **Capability:** configure essentially everything — the hiring model, the interview model, the
  conversation model, the org model, automation, integrations.
- **Entities:** ~25 domain objects with **no public API representation at all** (Job, Workflow, Journey,
  Approval, Campaign, Community, Segment, Event, Survey, Form, System Attribute, Knowledge Base, Data
  Feed, Alert, Event Template, WhatsApp Template, Phone Number, Offers Type, …) —
  `data-model-api-surface.md`.
- **Screenshot:** ❌ **gap — zero of ~35 settings surfaces has any image evidence, live or surrogate.**
- **The self-serve boundary runs through this surface.** The KB glossary states **Assistant Messaging**
  access "is limited — contact your CS Representative," and **Next Step** transitions are "set up on the
  backend by your CS Representative" (docs · medium). At least two of these settings pages are
  **operated by a Paradox employee, not the customer admin** — an IA fact with GTM consequences.

#### Scheduling / interview-ops cluster   [`/lead-interview/*`, `/lead-event-interview/*`, `/lead-itv-*` · D2 (inferred)]
- **Capability:** the operational core — schedule, cancel, request-cancel, check attendee, reschedule,
  edit details, assign a scheduling task, fetch slots, run orientation events, prep, watch.
- **Entities:** Interview (48-field schema, 18-value `interview_type` enum), Room, Location, User.
- **Note:** **~40 of the 100+ routes are in this one cluster** — measured by route count, interview
  scheduling *is* the product, which matches the marketing's own emphasis ("30M+ interviews scheduled
  annually") more faithfully than the 13-product taxonomy does.

#### Partner-embed surface   [`/external/*` · D1–D3 (inferred) · **buried by design**]
- **Capability:** the same scheduling/review/settings surfaces, rendered **inside a partner ATS's UI**
  via a signed-URL iframe contract (`OID` + `jwt_token` + `account_id`).
- **Cross-lane corroboration:** the four documented embed URLs (api: `raw/embed-iframe-contract.md`) and
  the mined `/external/{itv-settings,review/*,event-schedule/*,scheduling/get-slots}` router family
  (bundle) are **independent artifacts describing the same surface** → the embed mechanism is **fact**.
- **Note:** for a SuccessFactors recruiter, *this* is the product's IA — Paradox has no nav at all; it is
  a panel inside somebody else's console.

#### Post-hire / retention cluster   [`/microlearning`, `/employee-recognition`, `/employee-rewards`, `/employee-chat/messages`, `/employees`, `/employer-tax-info` · D0–D1 (inferred) · **UNMARKETED DEPTH**]
- **Capability:** unknown in detail — but these are **top-level router destinations**, not sub-panels.
- **Corroboration:** Employee Recognition promotes to fact on a second lane (an App Store "Reward &
  Recognition" feature redesign in the 2.1.6 release notes — community: `raw/changelog-digest.md` ·
  crawl-clip · medium). Microlearning and employee-chat remain **single-source (bundle)**.
- **Finding:** the marketing site's post-hire story stops at "Onboarding." The router goes four steps
  further. Paradox is building the **retention half** of the frontline lifecycle and saying nothing.

---

## Promoted vs buried — the headline reconciliation

### Buried flagships (marketing-promoted, ≥D2 in the product)

| Marketed as | Where it actually lives | Depth | Read |
| --- | --- | --- | --- |
| **The conversation itself** — the entire product pitch, "Meet the AI assistant for all things hiring" | a tab inside a candidate detail record | **D3 (inferred)** | The recruiter console is a *candidate-record manager*; the conversation is a field on the record. Marketing sells the conversation; the IA files it under a tab. |
| **13 "Conversational X" products** (13 D0 marketing destinations) | `/settings/{job-builder,interview-builder,event-templates,workflows,…}` — **configuration sections of one console** | **D1–D2 (inferred)** | Thirteen marketed products, zero product-shaped destinations. Corroborated on three independent runtime lanes (one router, one entity set, 13 Statuspage components in 4 clusters that map to none of the SKUs). |
| **"Open API" / integrations**, claimed on nearly every product page | one unlabelled outbound link at `/partners/integrations`, to a third-party ReadMe.io host with no `docs.`/`developer.` subdomain in 9 years | **D2, off-domain** | A real 53-operation OpenAPI 3.1 surface, effectively unnavigable. |
| **Express Care** (its own SKU, own persona "Becky", own stats) | a footer-reachable page, absent from the main nav | **D2** | A packaged vertical SKU with no nav home. |
| **Analytics / "1,000+ metrics tracked"** — restated on nearly every product page | a single `/analytics` route + a 3-operation Reporting API | **D0 (inferred)** | Promoted in marketing at 13× the weight it carries in the router. |

### Unmarketed depth (deep and powerful, marketing-silent)

| Surface | Depth | Evidence | Why it matters |
| --- | --- | --- | --- |
| **"Assist" — the recruiter-facing voice AI copilot** | D0–D1 (inferred) | screenshot (high) + router (medium), **two independent dimensions → fact** | Reframes the category: the defensible surface may be the *recruiter's* copilot, not the candidate bot everyone markets. |
| **Olivia Extension** — LinkedIn-embedded sourcing companion, macOS/Safari, released 2025-06 | outside the console entirely | distribution: `raw/olivia-browser-extension-listing.md` · binary-extract · high | A whole distribution surface absent from website and docs. |
| **The retention suite** — microlearning, employee recognition/rewards, employee chat, employer tax info, employees directory | D0–D1 (inferred) | router (medium) + App-Store changelog (medium) on Recognition | A second product line the site never sells. |
| **~35 `/settings/*` configuration surfaces** | D1–D2 (inferred) | router (medium), 5 corroborated by the KB glossary → fact | The largest area of the product by route count; marketing describes essentially none of it. |
| **`/integration-center-v2`, `/settings/data-feeds`, `/settings/alert-management-v2`** | D0–D1 (inferred) | router (medium) | A named *v2* integration console implies a mature, iterated integration-ops surface — versus the thin published partner API. |
| **`/iam/account-access-request`** | D1 (inferred) | router (medium) | An access-request/approval workflow for the console itself — enterprise IAM depth nobody markets. |
| **Zenoti integration** (spa/salon booking, used for interview **room/service** booking — 36+ string hits incl. `ROOM_BOOKING_TYPE`, `MAX_ITV_DURATION_ZENOTI`) | inside scheduling | bundle: `raw/bundle-map.md` · medium | A vertical-specific booking backend nobody would guess from the marketing. |

---

## Admin / settings depth

`/settings` is the single largest surface in the product: **~35 sub-routes**, roughly 8 functional
clusters (identity & access · org model · hiring model · interview model · automation · conversation
model · web & content · ops). By route count it is **larger than every candidate-facing surface
combined**.

Three properties are recoverable without walking it:

1. **It is the real product taxonomy.** The 13 marketed products resolve to sections here, not to
   destinations of their own.
2. **It is partly not self-serve.** ≥2 pages (Assistant Messaging, Next Step) are documented as
   CS-rep-operated (docs · medium). **The deployed product is partly a Paradox employee.**
3. **It is authorization-aware at page granularity.** The glossary describes Assistant Messaging as a
   page where "access to this page is limited," and the client ships **CASL** with a dedicated
   `/api/casl-ability` fetch and a default ability object `{"company_ids": "*"}` — so settings visibility
   is per-role, per-tenant. **The real settings IA is therefore per-user**, and cannot be represented as
   one static tree.

---

## Global affordances

| Affordance | Evidence | Status |
| --- | --- | --- |
| **Global search** | `/search`, `/search/locations`, `/search/user` (router · medium) | located, never walked |
| **Tenant / org switcher** | visible in the console header in an App-Store screenshot (high) | depicted, never walked |
| **Notification bell + alerts** | header icon (screenshot · high); `/alerts`, `/settings/alert-management-v2` (router · medium) | located + depicted |
| **Assist launcher** (global AI entry point in the header) | labelled button in header (screenshot · high) + `/assist` (router · medium) | located + depicted → fact |
| **Mobile 5-tab bottom nav** — grid/apps · Candidates · Calendar · Briefcase(Jobs) · profile avatar | screenshot (high) | depicted. **This is the closest thing this run has to an observed D0 nav set** — and it is the *mobile* nav, which is a subset of the web console's. |
| **Command palette / keyboard shortcuts** | — | **unknown** — not determinable from route strings |

---

## Cross-dimension reconciliation

**Nav-as-walked vs the bundle route-table.** The reconciliation `cartography-ia.md` asks for — *"a route
present in the bundle but never reachable in the live nav is a dormant/unshipped surface"* — **cannot be
performed on this run in either direction**, and that is the honest finding rather than a gap to
apologise for:

- There is **no walked nav** to diff against (blockers 1 and 2).
- The seam file already records this explicitly: *"none of these paths could be cross-checked against a
  live `session` capture on this run… Any path here that a future run's `session`/`wire` dimension never
  observes being called is a genuine dormant-route finding"* (`_shared/api-path-catalog.md`).
- **No dormant-route claim is made anywhere in this document.** A route literal in a bundle is evidence
  of registration, not of shipping.

**Nav vs the docs IA.** The KB covers **4 of 13** marketed products and **0 of ~35** settings surfaces.
The documentation IA is not a subset of the product IA — it is a *Workday-marketplace compliance
artifact* pointed at a different audience entirely.

**Nav vs the published API.** Near-total disjunction, already established in `data-model-api-surface.md`:
53 published operations under `/api/v1/public/*` vs 100+ console router paths with **effectively zero
overlap**. In IA terms: **the partner API is not a view onto the product's information architecture at
all** — it is a separate, thinner surface for a different actor.

**Nav vs the mobile app.** The mobile 5-tab nav (grid · Candidates · Calendar · Jobs · profile) is the
only *observed-in-an-image* navigation in the run, and it is **far narrower** than the web router — no
settings, no events, no CRM, no retention suite. Consistent with the listings' own framing (a
frontline-manager on-the-go surface, primary console is desktop web).

**Nav vs the two frontend generations.** The Nuxt Gen-A route tree past `/login` was **never recovered**
(lazy chunks are auth-gated and carry no static chunk-manifest — bundle: `_summary.md` gaps). So the
entire Layer-3 tree above is the **legacy Gen-B** IA. Whether the Nuxt rewrite will reproduce it 1:1 is
unknown, and no claim is made either way.

---

## Open questions

1. **What does `GET /api/menu` return?** One authenticated call yields the real, per-tenant D0 nav — the
   single highest-value, lowest-cost Cartography action available on this target. Everything labelled
   `Dn (inferred)` above becomes measured.
2. **What does `GET /api/casl-ability` return?** The CASL verb taxonomy would give the entitlement-derived
   entity set *and* reveal which settings surfaces a given role can even see — i.e. the per-role IA.
3. **Where does the candidate ↔ Olivia conversation actually render?** Not found as a bundle or route
   (bundle: `_summary.md` open questions). If it is carrier-mediated SMS/WhatsApp/Messenger end-to-end,
   the product's primary surface **has no navigable IA at all** — which would itself be the finding.
4. **Which of the 100+ router paths are live for any given tenant?** Unanswerable without a session; no
   dormant-route claim is made here.
5. **Does the Nuxt Gen-A rewrite reproduce the Gen-B IA?** Unknown — Gen-A's authenticated route tree was
   never observed.
6. **Is there in-app help distinct from the public KB?** (`/user-help` exists as a route.) Unknown.
7. **How deep is the `/assist` surface?** Three router paths and one screenshot are the entire evidence
   base for the run's most strategically interesting finding.
