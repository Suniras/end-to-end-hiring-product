# Paradox — Recon Run

> **Paradox, Inc.** (`paradox.ai`, Scottsdale AZ, founded ~2016) sells one thing: a conversational AI
> assistant — "Olivia" — that runs the high-volume frontline hiring funnel over the channels a shift
> worker already uses (SMS, WhatsApp, Facebook Messenger, web widget, email), so that applying,
> screening, scheduling, offering and onboarding all happen inside a text conversation instead of inside
> forms. We ran this teardown as the USA-market counterpart to the paired **Fountain** run: same category
> (frontline / high-volume hiring), opposite postures on developer surface, AI marketing, and
> multi-tenancy. The run is outside-only — no login was ever available.

---

## ⚠️ Read first — this target was NOT the user's pick

**Paradox was selected by the agent, not the user.** The user asked for a second, similar USA-market
frontline-hiring player, then went away from screen and **was unreachable to confirm the substitution**.
The agent chose Paradox as Fountain's closest head-to-head competitor (both VC-backed, both sell into
big-box retail / QSR / logistics on a conversational-automation pitch, both compete for the same RFPs).
Alternates considered and rejected: **WorkStep** (narrower warehouse-retention vertical), **Sense**
(usually a complement, not a substitute), **iCIMS** (general enterprise ATS, not frontline-specialised),
**Instawork / Bluecrew / Wonolo** (gig-staffing marketplaces — a different business model).

**Full reasoning + the alternates table: [`00-scope-verdict.md` → "Note on target selection"](00-scope-verdict.md).**
If Paradox is not the comparison you wanted, the scope verdict is the file to overrule — nothing
downstream depends on the choice being right, only on it being flagged.

**Second standing caveat, equally load-bearing: `session` is `absent` and `wire-capture` is `folded`**
(`auth: none` — no credential was ever available, and the harness never signs up or enters credentials).
`write_side_observed: false`. **Nothing in this run was observed on a live wire.** For most SaaS targets
that is a normal Pass-1 limit; for Paradox it is *the* limit, because **the product IS the conversation**
and no dimension here watched a single candidate↔Olivia exchange. Feature *existence and gating* are
solid throughout; feature *execution quality* is documented or depicted, never observed.

---

## Access grade (the resolved vector)

| Axis | Value | Confidence | Evidence |
| --- | --- | --- | --- |
| **source** | `partial` | high | `github.com/ParadoxAi` confirmed genuine (blog + email exact-match), but all **5 repos are forks of unrelated upstream projects** — no core-product source exists publicly and never did |
| **runtime** | `reachable` | high | `olivia.paradox.ai` (302 login shell), `api.paradox.ai` (AWS API Gateway auth wall), `genai.paradox.ai`, `status.paradox.ai`, a ReadMe.io-hosted Developer Hub |
| **auth** | `none` | high | batch-wide default; user unreachable to authorise a session |
| **presence** | `rich` (marketing/support axis) · `thin-to-absent` (developer-docs axis) | high | 38 logo-wall customers, 63 case studies, Helpjuice KB, live Statuspage, iOS + Android + Safari-extension listings — but **no `docs.` / `developer.` subdomain has ever existed** |

**Matched case:** Case-2 / Case-1 hybrid — thinner than Fountain on source (utility forks only), but with
genuine native **distribution artifacts** Fountain lacks. Corpus root: `research/` (pre-existing).

---

## Dimensions covered

| Dimension | Status | Method | Conf. | Headline finding |
| --- | --- | --- | --- | --- |
| **codebase** | complete (100%) | `clone-and-map` | medium | All 5 `ParadoxAi` repos are **forks of unrelated OSS**; three carry real engineering — a from-scratch AcroForm `PDFSignature` on a `pdf-lib` fork, a Node service speaking **Python Celery's wire protocol**, and a 2-commit SCIM `manager`-attribute patch |
| **docs** | partial (90%) | `crawl-clip` | medium | The only public KB is a **Workday-marketplace partner disclosure** (1 category, 4 articles) + a 15-term internal glossary exposing CVO / NOH / OIT / Job Data Package — and the glossary admits parts of the product are configured **by a Paradox CS rep**, not the customer |
| **packages** | complete (100%) | `registry-metadata` | high | **No SDK exists in any registry, in any language** (verified npm/PyPI/Go/GitHub-Releases). The only Paradox-owned publishes are two internal-tooling forks under *personal engineer scopes*; there is no `@paradoxai` org |
| **api** | complete (75%) | `openapi-verbatim` | high | A real partner API — **53 operations / 36 paths**, recovered as 53 verbatim OpenAPI 3.1 fragments from a **ReadMe.io-hosted hub invisible to subdomain enumeration**. OAuth2 `client_credentials`, credentials issued by a human team, no self-serve |
| **website** | complete (75%) | `crawl-clip` | medium | 13 "Conversational X" product pages that are **one engine wearing thirteen skins**; zero pricing anywhere (`/pricing` 301s to home); zero LLM/model vendor named anywhere |
| **community** | complete (80%) | `crawl-clip` | medium | **No first-party feedback loop of any kind** (exhaustively verified). The Statuspage is the substitute: 13 components in 4 groups, 45 incidents since 2017, **~13 of them "CEM Slowness"** with a dated first-party postmortem naming legacy sync endpoints |
| **deployed-client-bundle** | complete (65%) | `bundle-string-mine` | medium | **Two coexisting frontend generations on one host** — a thin Nuxt 3 shell covering only auth, and the real legacy Django/Vue2/jQuery console with **100+ admin routes, redeployed the same month as capture** |
| **infra-backend-fingerprint** | complete (85%) | `dns-ct-fingerprint` | medium | 333-name CT sweep: per-customer tenant families for **FedEx, Lockheed Martin, Lowe's, PepsiCo, Darden, Aramark, Unilever, Prudential** — none on the logo wall; a dead `rasa-*` family; a live `genai.*` family; a full parallel `eu1` region |
| **distribution-artifacts** | complete (70%) | `binary-extract` | high | Three artifacts, all listing-level: iOS + Android CEM apps (since Jan 2018), a **white-labeled "Regis + Paradox CEM" build**, and a **Safari "Olivia Extension" that injects Paradox into LinkedIn** — plus the screenshots that revealed "Assist" |
| **session** | **absent** | `inferred` | high | `auth:none`, never dispatched. The entire authenticated runtime **and the candidate-facing conversation** are unobserved |
| **wire-capture** | **folded** | `inferred` | high | Folds into the absent `session` per ingestion §7.1 — rung 1 *is* the in-page tap `session` would install. **Zero live wire on this run at any layer** |

---

## Headline findings

1. **A two-generation frontend strangler-fig, caught mid-flight.** `olivia.paradox.ai` serves a thin
   **Nuxt 3 / Vue 3** shell (`sentry.release: app@3.0.0-beta.13`) that covers only login/OTP/SSO — while
   the *actual* recruiter console is still the legacy **Django + Vue 2/Vuex/jQuery/Handlebars** "Candidate
   Experience Manager," 100+ routes deep, with its asset path stamped **`202608`: the same month as
   capture**, i.e. actively redeployed, not dead code. Rewriting *auth first* is the highest-leverage
   strangler-fig entry point in the run's "worth stealing" list (bundle: `raw/bundle-map.md`,
   `raw/route-table.md` · bundle-string-mine · medium). Independently corroborated on a different tier:
   the 2026-07-27 Statuspage postmortem discloses an active initiative converting **legacy synchronous
   backend endpoints to the platform's standard async model** (community: `raw/issue-themes.md` ·
   crawl-clip · medium) → **two independent dimensions, both tiers mid-modernisation = fact**.

2. **The AI layer is a separate service on a separate runtime — and every model call is server-brokered.**
   `genai.paradox.ai` runs **Python ASGI/uvicorn**, architecturally distinct from the sync
   **gunicorn/WSGI** main API behind a regional AWS API Gateway; the app's CSP `connect-src` names **no
   third-party LLM host at all**, so no client-direct model call exists — a direct observation of the
   allow-list (infra: `raw/security-headers.md`, `raw/cloud-cdn-fingerprint.md` · medium; host
   independently confirmed as `public.genai.endpoint` in the Nuxt config — bundle: `raw/env-config.md` ·
   medium). **The Rasa→Bedrock evolution is the run's best-supported *inference*, held at
   medium/tentative and deliberately NOT promoted**: a `rasa-k8s`/`devrasa` family CT-logged 2023-09→
   2024-03 and NXDOMAIN today, a `genai.*` family live since, and a 2026-08-05 sub-processor PDF naming
   "AWS Bedrock, model licensing services" — three *artifact types* inside **one dimension** (`infra`),
   which earns no band promotion. Only the narrower sub-claim promotes: a **pre-LLM NLP tier existed**
   (infra + community's 2021 "NLP Failover" incident → fact). Which foundation model Bedrock fronts is the
   single highest-value gap in the run.

3. **"Olivia" is a rebrandable persona, and white-labeling goes all the way down the stack.** Chipotle
   ships her as *"Ava Cado,"* 7-Eleven as *"Rita,"* GM as *"Ev-e,"* plus *"Mia"* and *"Becky"* (website:
   `raw/solutions-usecases.md` · medium) — and the public API exposes the exact primitive that implements
   it: **`GET /company/ai` → "Get AI Assistant (name + image)"** (api: `raw/endpoint-catalog.md` ·
   openapi-verbatim · high). Per-tenant skinning happens at **four independent layers at once**: DNS
   (`<customer>.paradox.ai` / `<customer>api` / `chrome.<customer>` families), a **white-labeled native
   app build** ("Regis + Paradox CEM" on both stores, corroborated by `regis.paradox.ai` in CT → **two
   independent dimensions = fact**), per-tenant career-site provisioning (`sites.paradox.ai`), and the
   persona name. Near-zero-marginal-cost bespokeness over a single multi-tenant core.

4. **The 13 "Conversational X" products are one engine — verified on three runtime lanes, not assumed.**
   `curl` (not a summariser) confirmed `/products/conversational-apply` and `/products/screening` serve
   near-identical titles and body content; then (a) the admin bundle exposes **one** console with one
   router where the "products" are *settings sections*, (b) the public API exposes **one**
   Candidate/Location/Interview/Room entity set with no per-product namespace, and (c) the Statuspage
   monitors **13 components in 4 clusters that map to none of the 13 SKUs**. Modularity is real
   *commercially* (every case study names 1–4 products) — the slices just aren't separately engineered.

5. **"Assist" — a voice-enabled recruiter-facing copilot that Paradox never markets.** A labelled Assist
   button and its opened panel with a microphone control appear in first-party App Store screenshots
   (distribution: `raw/screenshot-catalog.md` · binary-extract · high), and `/assist`, `/assist/calendar`,
   `/assist/scheduling_action` appear in the string-mined admin router (bundle: `raw/route-table.md` ·
   medium) — **two independent dimensions = fact**. It appears on **none** of the 13 product pages, in
   **no** KB article, and in **none** of the 53 public API operations. The June-2025 **Olivia Extension**
   (a Safari web extension injecting Paradox over LinkedIn's messaging UI) is unmarketed the same way.
   Marketing sells a candidate bot; the product also ships a recruiter copilot and says nothing.

6. **A second unmarketed product line: post-hire retention.** `/microlearning`,
   `/employee-recognition`, `/employee-rewards`, `/employee-chat/messages`, `/employer-tax-info` are all
   in the admin router (bundle · medium) — **none on any product page or KB article**. Employee
   Recognition promotes to fact on a second lane (an App Store "Reward & Recognition" redesign — community:
   `raw/changelog-digest.md` · medium); microlearning and employee-chat stay single-source. The site's
   post-hire story stops at "Onboarding"; the routes go three steps further, i.e. Paradox is quietly
   building the **retention half** of the frontline lifecycle.

7. **The schema's structural signature: every entity carries a dual identity (internal OID + external
   ID), across eight entity families.** Candidate (`ex_id`, `external_source_id`, `job_application_id`),
   User (`employee_id`, `external_role_id`), Location (`job_loc_code`), Area (`external_area_id`), Room
   (`room_ex_id`), interviewers, interview-prep, and a **status-map triplet** (`use_paradox_status_map` /
   `status_map_name` / `status_map_ex_id`) that translates Paradox's candidate stages into the customer
   ATS's own vocabulary (api: `raw/endpoint-catalog.md` · openapi-verbatim · high). The data model is
   engineered from the ground up **to mirror someone else's system of record, addressable by that system's
   keys** — the schema-level correlate of the four-page marketing line *"Enhance your entire hiring
   lifecycle without replacing your system of record."* Two independent lanes from opposite directions.

8. **The published API and the app's own surface are near-disjoint — the partner API is a bolt-on, not
   the product's transport.** 53 published ops under `/api/v1/public/*` vs a client surface of
   `/api/_auth/*`, `/api/casl-ability`, `/api/gen-ai/*`, `/api/company*`, `/api/menu` and 100+ router
   paths, with **effectively zero overlap** (api · high vs bundle · medium). **The public API exposes no
   AI/generation operation whatsoever** — the product's headline capability is entirely unavailable to
   partners — and no realtime, no jobs/workflows/journeys/approvals/campaigns/events/CMS. There is also
   **no generic webhook system**: exactly one outbound contract (a `callbackUrl` on async reports) and one
   inbound (`PUT /interview/interview_alerts`, which can create a Candidate that doesn't exist yet).

9. **The customer base is broader and less frontline-shaped than the marketing says.** A 333-name CT
   sweep surfaced provisioned tenants that appear **nowhere** on the site: **FedEx** (+ `fedexstg`),
   **Lockheed Martin**, **Lowe's** (+ `lowesstg`), **PepsiCo**, **Darden**, **Aramark**, **Unilever**,
   **Prudential Financial**, **Regis**, **Visiting Angels** (infra: `raw/dns-and-subdomains.md` ·
   dns-ct-fingerprint · medium). Certificate transparency is independent of marketing — a cert is issued
   because a tenant was provisioned, not because a logo was licensed. **The logo wall is a floor, not a
   ceiling.** *(That these are live production accounts rather than pilots or lapsed tenants is an
   inference, medium — a cert proves provisioning, not a contract.)*

10. **Workday concentration is a real single point of strategic dependency.** Workday is simultaneously
    Paradox's **partner** (Workday Certified, a named "Paradox for Workday" line), **channel**,
    **customer** (`careers.paradox.ai` redirects to `workday.com` — Paradox runs its own recruiting on
    Workday), **compliance reference** (the ethical-AI page defers bias-evaluation methodology to
    "Workday's evolving ethical AI standards"), and **sub-processor** (~24 Workday legal entities across
    Americas/EMEA/APJ on Paradox's own current sub-processor PDF). The one public KB category is literally
    *"Workday Feature Descriptions"* in Workday's standard marketplace-partner format (infra:
    `raw/sub-processors.md` · medium; website: `raw/legal-security-fraud.md` · medium; docs:
    `raw/helpjuice-kb.md` · medium). **Inference (medium)** from the convergence of five observations.

11. **Buy the commodity AI, build the one weird thing.** Parsing → Textkernel/Sovren. Long-tail HRIS
    connectors → Merge API. Tax/payroll forms → Symmetry. Assessments → **acquire** Traitify ("Woofound,
    Inc. d/b/a Traitify… support and maintenance exclusively for Traitify Services" — three independent
    dimensions = fact). Warehouse → Snowflake. Foundation models → license. What they built in-house is
    narrow and telling: **AcroForm digital signatures placed programmatically into PDFs**, and a **Node
    service that speaks Python Celery's wire protocol over RabbitMQ** — commit-level proof of a polyglot
    backend joined by one async task bus (codebase · medium + packages · high).

12. **Zero self-serve, by construction and confirmed on two lanes.** No pricing page (9 probe points;
    `/pricing` 301s to home), no plan names, no usage language — **and the sub-processor list names no
    payment processor at all**, which a company with any self-serve billing path would have (website ·
    medium + infra · medium → **fact: 100% enterprise-quote, sales-assisted**). The same gate sits on the
    API (credentials from a human team) and on configuration itself: the KB states Assistant Messaging
    access "is limited — contact your CS Representative" and that "Next Step" transitions are "set up on
    the backend by your CS Representative." **The deployed product is partly a Paradox employee.**

---

## How to navigate

| Path | What's in it |
| --- | --- |
| [`00-scope-verdict.md`](00-scope-verdict.md) | The accept verdict, the A–E gate trace — **and the "Note on target selection" that flags Paradox as the agent's unconfirmed pick** |
| [`00-recon-plan.md`](00-recon-plan.md) | The `access_grade` vector, the 11-dimension availability table, and the three Discovery hypotheses (two of which Ingestion refuted — see Lessons) |
| `dimensions/<dim>/_summary.md` | Per-dimension capture with provenance frontmatter (method · confidence · completeness · gaps); `raw/` holds the verbatim artifacts |
| `dimensions/_shared/` | The two seam files — `api-path-catalog.md` (sources: `bundle`, `distribution`) and `feature-flags.md` |
| [`evaluation/technology-architecture.md`](evaluation/technology-architecture.md) | The stack table, the two-generation frontend, the async/data plane, 21 reconciliation rows |
| [`evaluation/product-features.md`](evaluation/product-features.md) | The 8-section feature map (A–H) with maturity grades, the three user journeys, 10 reconciliation notes |
| [`evaluation/data-model-api-surface.md`](evaluation/data-model-api-surface.md) | The entity ER diagram, the dual-identity signature, the published-vs-app-own diff, the auth/tenancy model |
| [`evaluation/competitive-positioning.md`](evaluation/competitive-positioning.md) | Positioning, the (absent) pricing read, the real-moat analysis, the Fountain comparison, and the "What Nurix should take from this" section |
| [`evaluation/information-architecture.md`](evaluation/information-architecture.md) · [`ux-flows.md`](evaluation/ux-flows.md) · [`feature-coverage.md`](evaluation/feature-coverage.md) | **Mode 4 (Cartography) — produced, but in an explicitly DEGRADED mode.** Two blockers stacked: `auth:none` (no authenticated surface) **and** the Chrome/browser-driving MCP tools being **absent from the session's toolset entirely** (a *capability* gap, not a permission gate). So: **0 surfaces walked, 0 screenshots captured, 0 wire observed.** The three docs are built from the already-captured static material — a three-layer IA (marketing · docs · a *reconstructed* console IA from the bundle's 100+ route literals, every depth labelled `Dn (inferred)`), 10 UX flows **all drawn as inferred** (dashed arrows per `cartography-flows.md` rule 6, which on this run applies to every flow on both read and write sides), and a **92-claim coverage matrix** (68 located / **0 walked** / 24 dispositioned). Scorecard: `feature_location_rate: 74`, `flow_coverage: 0`, `screenshot_coverage: 10` (App-Store-listing **surrogates**; `screenshot_coverage_live: 0`), `ia_nav_complete: false` |
| [`dimensions/session/captures/screens/_index.md`](dimensions/session/captures/screens/_index.md) | The Mode-4 screenshot contract, met the only way it could: a **textual index of first-party App Store listing images**, with no image files stored and the live-capture gap recorded. 3 of ~31 primary surfaces depicted |
| [`05-self-correction-proposal.md`](05-self-correction-proposal.md) | **Mode 5 output — read this for what the run got wrong.** Final score **81/100 (solid)**, 2 iterations, `stopped_on: converged`. Iteration 1 (two follow-up probes) returned a **negative/confirmatory** result and is recorded as such. Iteration 2 found and repaired **7 behavioral defects**, the load-bearing ones being: (a) `docs` and `infra` both asserted a **false absence** — "no developer/API documentation exists at all" / "Paradox has never stood up a developer-docs subdomain, at any point" — which the sibling `api` dimension already refuted and a cheap re-probe disproved (`readme.paradox.ai` **is** CT-logged, certs issued 2026-07-12); (b) the 333-name CT census behind several claims is **silently truncated at 2024-06-13**, so the "mid-2024 cert-consolidation event" is substantially a query artifact; (c) six unauthenticated `curl` GETs **live-confirmed** six bundle-declared app-own `/api/*` paths and identified the app-own API layer as **Django REST Framework**, resolving a tension `technology-architecture.md` had flagged as unresolvable without a session |

---

## Lessons (candidate methodology learnings → feed self-correction)

1. **A ReadMe.io-hosted Developer Hub is invisible to subdomain enumeration — and Discovery, `docs` AND
   `infra` all got it wrong because of it.** *(Mode 5 extended this lesson: the miss was not confined to
   Discovery. `docs/_summary.md` asserted "no developer/API documentation exists at all" and
   `infra/_summary.md` asserted, as **fact**, that "Paradox has never stood up a developer-docs/API-spec
   subdomain, publicly, at any point" — both while the sibling `api` dimension was documenting 53
   verbatim OpenAPI operations on `readme.paradox.ai`. A Mode-5 per-host crt.sh re-query further showed
   the host **is** CT-logged (2026-07-12) and that the `%.paradox.ai` dataset both dimensions relied on is
   **truncated at 2024-06-13**. All three statements are corrected in place.)* Discovery predicted `⚠️ partial`, method `docs-reconstructed`,
   "likely capped low," on the strength of `docs.` / `developer.` both failing DNS plus a 9-year CT-log
   negative for `doc|developer|swagger|openapi|graphql`. Both of those facts are **correct and
   misleading**: the hub lives at `readme.paradox.ai` (a ReadMe.io CNAME, not a guessable A record),
   reachable only by following an on-page link from `/partners/integrations`, and it served **53 verbatim
   OpenAPI 3.1 fragments** → method upgraded to `openapi-verbatim`, confidence **high**. *Generalisable:
   before grading a developer surface absent, follow the marketing site's own integration/partner links —
   DNS-negative ≠ docs-absent.*

2. **Two of three Discovery hypotheses were refuted by Ingestion — which is the system working.**
   `scim2-models` was seeded as "a Paradox-published PyPI package"; it is **upstream Yaal Coop /
   `python-scim`'s own publish**, and Paradox holds a private 2-commit fork. `packer-plugin-salt` was
   seeded as possible "legacy VM-provisioning lineage"; it has **zero Paradox-authored commits**, upstream
   is archived by HashiCorp, and it was never indexed on pkg.go.dev. Both were corrected by **two
   independent dimensions each** (codebase via fork lineage, packages via registry metadata). *The
   `verify:may-be-stale` seeding discipline earned its keep here.*

3. **"Same artifact ⇒ one source" fired three times on this target and had to be enforced by hand in the
   reconciliation pass.** `api` and `infra` read the *same* `x-amzn-remapped-server: gunicorn` response
   header; `bundle` and `infra` read the *same* CSP; and the Rasa→Bedrock story is three *artifact types*
   inside the *one* `infra` dimension. Each is a strong direct observation stated on its own strength —
   **none is a two-source band-bump**. Sibling rollups drafted concurrently drifted on exactly this
   (`competitive-positioning.md` had written "promoted one band on independence"; `data-model-api-surface.md`
   had "Bedrock … = fact (two independent methods converge)") and both were corrected in the Mode-3
   reconciliation pass. *Candidate harness change: concurrent sibling rollups need the shared
   "one-artifact" list handed to them as an input, not re-derived per document.*

4. **A `presence:rich` target can still be `community`-dark.** Paradox has **no** public changelog,
   roadmap, forum, issue tracker or hosted feedback board — verified per ingestion §7 rule 10 against the
   full alternate-home checklist (four subdomain probes, three hosted-board vendors under seven slugs, RSS
   autodiscovery), with a gated Helpjuice `release-notes` page behind SAML proving one *exists* internally.
   The closed-feedback cap fired: every user-pain claim is capped tentative, and **`external-reputation`
   is flagged recommended-for-this-run**. The Statuspage incident history became the substitute changelog
   and turned out to be the strongest first-party technical-debt artifact in the run.

5. **`auth:none` doesn't just cost the `session` dimension — it guts Mode 4; and a missing *tool* guts it
   a second time, independently.** No authenticated surface means no nav walk, no depth measurement, no
   screenshots, and no observed flow to diagram. Mode 4 was subsequently run in its degraded, static-only
   form (see How to navigate) — and doing so surfaced a **second, distinct blocker worth separating in the
   record: the browser-driving MCP tools were absent from the session's toolset entirely**, so even the
   *public* surfaces could not be walked and **no screenshot of anything could be captured**. Had a
   credential existed, this run still could not have walked, measured, or screenshotted a single surface.
   Per `ingestion.md` §8 that is a **capability gap = a checkpoint**, and it arguably warranted pausing to
   confirm before proceeding on the weaker method rather than documenting it afterwards. On a
   target whose *product is a conversation*, it also means the core interaction model is unobservable —
   and the bundle's own read is that the candidate side may have **no capturable web wire at all** (carrier
   SMS / WhatsApp / Messenger), so even a full recruiter session would capture the console's wire, not the
   conversational one. *Worth pre-flagging at Discovery for conversational-channel products: name up front
   which gaps a session would and would **not** close.*

6. **App-store listing metadata is an under-rated dimension.** The two biggest unmarketed findings in this
   run — **Assist** and the **LinkedIn Olivia Extension** — came from first-party App Store screenshots and
   a third store listing, at `binary-extract` confidence **high**, with no decompile and no EULA question.
   For any product with a native client, screenshot-catalogue mining is cheap and disproportionately
   informative.

---

## Reproduction

**Preconditions.** No credentials, no login, no state change, no cost — every capture in this run is
unauthenticated and read-only. `curl`, `dig`, `openssl s_client`, WebFetch and public registry APIs are
the entire toolset; Chrome was never driven (no browser-driving dimension ran).

**Warm entry points** (re-derive facts rather than trusting the values below — they are dated
2026-08-09):

- Marketing: `https://www.paradox.ai/` (Webflow behind Cloudflare) · `/products/*` (13) · `/pricing`
  (301→home) · `/legal/fraud` · `/partners/integrations` (**the only link to the Developer Hub**)
- Product shell: `https://olivia.paradox.ai/` (Nuxt 3 shell + the legacy CEM 404 fallback — mine both)
- API: `https://readme.paradox.ai/` (ReadMe.io hub; append `.md` to any page for raw markdown) →
  `https://api.paradox.ai/api/v1/public/*`
- Infra: `crt.sh?q=%25.paradox.ai` (333 names) · `dig` any host across 3 resolvers + SOA before asserting
  an absence · the sub-processor PDF linked from the footer Security page
- Distribution: App Store `id1330936756` ("Olivia by Paradox - CEM") + the Regis white-label build + the
  Safari "Olivia Extension" listing
- Community: `https://status.paradox.ai/` (13 components / 4 groups; 45 incidents) ·
  `https://paradox.helpjuice.com/` (+ the undocumented, zero-auth `glossary_terms.json`)
- Source: `git clone --depth 1` the 5 `github.com/ParadoxAi` repos into `source/paradox/`

**Method order actually used:** Discovery (scope gate → access vector → 11 cheap dimension probes) →
Ingestion (8 non-browser collectors dispatched in parallel; `session` never dispatched; `wire-capture`
folded) → Evaluation (4 rollups drafted concurrently, then a Mode-3 reconciliation pass that corrected
seven cross-document confidence drifts — see Lessons #3) → **Mode 4 run in its degraded, static-only
form** (0 surfaces walked, 0 screenshots captured, 0 wire observed — both blockers recorded; the three
Cartography docs were produced from already-captured material, see How to navigate) → Mode 5 (2
iterations; 7 defects repaired within-run; final score 81/100).

*(Mode-5 correction: this line previously read "Mode 4 not run … queued for Mode 5", contradicting the
How-to-navigate row in this same file. Mode 4 was run — degraded, and documented as such.)*

**Redaction:** no secret-shaped value reached `raw/`. Nothing sensitive was encountered — the run touched
no credential, and the Basic-Auth-gated `api.paradox.ai/docs/docs/` was **never probed past the 401**,
per ethics.

**What would most change this run's conclusions:** one read-only Pass-1 authenticated session with a
pre-navigation in-page fetch/XHR tap. It would convert the entire "declared" column of the API-path diff
into "observed," yield the CASL verb taxonomy from a single `/api/casl-ability` GET (the richest
data-model artifact available on this target), reveal what `wss://ws.paradox.ai` carries, and capture a
`genai.paradox.ai` request/response — the only way to learn which foundation model Olivia actually runs on.
