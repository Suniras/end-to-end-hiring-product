# Paradox — Technology & Architecture

> **Provenance key.** Every claim below is tagged `(dimension: anchor · method · confidence)` taken verbatim
> from that dimension's `_summary.md` frontmatter. Weighting follows `evaluation.md`: max-of-sources, one-band
> promotion only on ≥2 **independent** dimensions, conflicts flagged not averaged, direct observation beats
> inference.
>
> **Standing caveat for this entire rollup (rendered once, per the write-side cap).** `session` is
> `status: absent` (`auth:none`) and `wire-capture` is `status: folded` into it — **this run observed zero live
> application traffic**, and `write_side_observed: false` (session: `_summary.md` · inferred · high). Every
> runtime claim here rests on HTTP response headers, DNS/CT records, unauthenticated bundle strings, served
> documentation, and registry/commit metadata. Nothing about request/response bodies, WebSocket frames,
> model-call shapes, or execution behavior was observed. Where that ceiling binds a specific claim it is named
> inline; it is not re-hedged paragraph by paragraph.
>
> **Scope caveat.** Paradox was selected by the agent (not the user) as Fountain's closest USA-market
> competitor — see `00-scope-verdict.md` "Note on target selection". The target's inclusion is itself a
> flagged, unconfirmed choice; it does not affect the method or findings below.

---

## TL;DR

Paradox runs a **Python-first AWS monolith mid-way through two simultaneous migrations**. The system of record is
a sync **Django/gunicorn** application behind a *regional* **AWS API Gateway** on `api.paradox.ai`
(infra: `raw/cloud-cdn-fingerprint.md` · dns-ct-fingerprint · medium + api: `raw/auth-wall-probe.md` ·
openapi-verbatim · high — both read the self-naming `x-amzn-remapped-server: gunicorn` header), fronted by a
recruiter console that exists in **two coexisting frontend generations at once**: a thin Nuxt 3/Vue 3 shell that
today covers only login/OTP/SSO, and a much richer legacy Vue 2/Vuex/jQuery/Handlebars "Candidate Experience
Manager" with 100+ admin routes that was **redeployed the same month as this capture** — a live strangler-fig
migration, not dead code (bundle: `raw/bundle-map.md` · bundle-string-mine · medium).

The single most distinctive architectural choice is **the AI layer is a separate service on a separate runtime**:
`genai.paradox.ai` is its own host running **Python ASGI/uvicorn** — a different server stack from the sync
WSGI main API — and the app's CSP names **no third-party LLM host at all**, so every model call is brokered
server-side (infra: `raw/security-headers.md`, `raw/cloud-cdn-fingerprint.md` · dns-ct-fingerprint · medium;
host independently confirmed in the Nuxt runtime config as `public.genai.endpoint`, bundle:
`raw/env-config.md` · bundle-string-mine · medium). The best-supported *inference* in the run — and it stays an
inference, single-dimension — is that this service **replaced a Rasa-based pre-LLM NLU stack around early-2024**
and is now backed by **AWS Bedrock** (infra: `raw/dns-and-subdomains.md` + `raw/sub-processors.md` ·
dns-ct-fingerprint · medium).

The second-order read: Paradox **buys the commodity AI/parsing plumbing and builds only the differentiated
parts**. Résumé/JD parsing is Textkernel/Sovren, long-tail integration plumbing is Merge API, tax/payroll forms
are Symmetry, assessments are an acquisition (Traitify), the warehouse is Snowflake — all named in the current
first-party sub-processor disclosure (infra: `raw/sub-processors.md` · dns-ct-fingerprint · medium). What they
built in-house is narrow and telling: a **PDF digital-signature capability written from scratch** on a `pdf-lib`
fork (codebase: `raw/structure-map.md` · clone-and-map · medium + packages: `raw/prd-huy-ta-pdf-lib-exports.md` ·
registry-metadata · high) and a **Node service that speaks Python Celery's wire protocol over RabbitMQ** — direct
commit-level proof of a polyglot backend joined by one async task bus.

---

## Stack

| Layer | Technology | Anchor · method · confidence | Grade |
| --- | --- | --- | --- |
| Marketing site | **Webflow**, fronted by **Cloudflare** (`cf-ray`, `x-wf-region`, `cdn.webflow.com` CNAME) — a wholly separate stack from the product | infra: `raw/cloud-cdn-fingerprint.md`, `raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium | **fact** (direct header/DNS observation) |
| Product frontend — current gen | **Nuxt 3 / Vue 3**, Vite build, **Element Plus** UI kit, nonce/`strict-dynamic` CSP; `sentry.release: app@3.0.0-beta.13`, `buildId 57dd43df-…` | bundle: `raw/bundle-map.md`, `raw/env-config.md` · bundle-string-mine · medium | **fact** (direct string observation) |
| Product frontend — legacy gen (still shipping) | **Vue 2 + Vuex**, **jQuery 3.6 + jQuery-UI**, **Handlebars** precompiled templates, flatpickr (40+ locales), served off a **Django static pipeline** (`/caches/202608/js/*.<hash>.js`) | bundle: `raw/bundle-map.md`, `raw/route-table.md` · bundle-string-mine · medium | **fact** (direct string observation) |
| App server behind the SPA | **Django** — `csrftoken` cookie on the first response, `djangojs.js` i18n catalog, `moment.fn.django` format helper, Django-convention static cache-busting | bundle: `raw/bundle-map.md` · medium **+** infra: `raw/cloud-cdn-fingerprint.md` · medium (two independent artifacts: JS strings vs live Set-Cookie) | **fact** that it is Django-family; see reconciliation for the DRF tension |
| Main REST API | **AWS API Gateway, regional custom domain** (`x-amzn-requestid` / `x-amz-apigw-id` / `x-amzn-errortype`), **no CloudFront in front**; origin echoes `Server: gunicorn` → **Python/WSGI** | infra: `raw/cloud-cdn-fingerprint.md` · medium **+** api: `raw/auth-wall-probe.md` · openapi-verbatim · high | **fact** (service self-names in the header) — but see "same artifact ⇒ one source" note |
| GenAI service | **`genai.paradox.ai`, `server: uvicorn`** = Python **ASGI** (FastAPI/Starlette family — the framework itself is inference); architecturally distinct from the sync WSGI API | infra: `raw/cloud-cdn-fingerprint.md` · medium **+** bundle: `raw/env-config.md` (`public.genai.endpoint`) · medium | **fact** (host + ASGI runtime); FastAPI specifically = **tentative** |
| Model layer | **AWS Bedrock, "model licensing services"** (current 2026-08-05 sub-processor PDF); **Google LLC** as secondary AI/ML vendor (NLP, semantic matching, translation, OCR, address validation, Talent Solutions). **No specific foundation model named anywhere.** | infra: `raw/sub-processors.md` · dns-ct-fingerprint · medium | **tentative-to-solid**: the disclosure is first-party and current, but single-dimension; the *model identity* is unknown |
| Realtime | Dedicated **`wss://ws.paradox.ai`** host, separate from the REST host; CSP allows `wss://*.paradox.ai` | bundle: `raw/env-config.md` (`public.socketUrl`) · medium **+** infra: `raw/dns-and-subdomains.md` (live A record) · medium — independent artifacts | **fact** that it exists; **protocol, frames, and role entirely unobserved** (session absent) |
| Async task bus | **Celery over RabbitMQ**, with a **Node.js service speaking the Celery wire protocol** via an actively-maintained fork (33 commits ahead of upstream, 42 npm releases, maintainer `@paradox.ai`) | codebase: `raw/dependency-graph.md`, `raw/structure-map.md` · clone-and-map · medium **+** packages: `raw/prd-thanhnguyenhoang-celery-node.json` · registry-metadata · high | **fact** that the capability exists and is live-maintained; the **live service topology is inference** |
| Cloud / regions | **100% AWS**, us-east-1-centric (AS14618/AS16509 on every IP; `use1`-tagged S3 buckets `ai-paradox-prod-use1-mediaservice`, `paradox-prod-use1-sites-static`, `apply-prod-static`); **Route53** DNS; **CloudFront + private S3** for CDN (Olivia CDN's origin bucket is us-west-2); ALB/NLB front-door pool | infra: `raw/cloud-cdn-fingerprint.md`, `raw/security-headers.md` · medium | **fact** |
| EU region | A genuine **separate `eu1` deployment** — CT shows a full parallel host family (`api-k8s.eu1`, `olivia.eu1`, `analytics.eu1`, `public-feeds.eu1`), and the public API docs list `api.eu1.paradox.ai` / `api.stg.eu1.paradox.ai` as documented servers | infra: `raw/dns-and-subdomains.md` · medium **+** api: `raw/endpoint-catalog.md` · openapi-verbatim · high — **two independent dimensions** | **fact** (promoted) |
| Orchestration | **Kubernetes** — `api-k8s.*` / `app-k8s.*` / `job-k8s.*` / `media-k8s.*` naming across dozens of CT hosts; `k8s.devsentry.paradox.ai` resolves live today | infra: `raw/dns-and-subdomains.md` · medium | **solid inference**, not a direct cluster observation |
| Internal platform | **ArgoCD, Rancher, Grafana, Drone CI, Jenkins-behind-Teleport, SonarQube, HashiCorp Vault, PrivateBin, internal VPN** — all CT-logged, all publicly NXDOMAIN today (3-resolver + SOA verified) | infra: `raw/dns-and-subdomains.md` · medium | **fact** that they existed; "decommissioned vs split-horizon DNS" is **undecidable externally** |
| Observability | **Self-hosted Sentry** on Kubernetes (`devsentry.paradox.ai` → `k8s.devsentry…`, DSN points at it) + **Pendo** product analytics + GA/GTM | bundle: `raw/env-config.md`, `raw/bundle-map.md` · medium **+** infra: `raw/dns-and-subdomains.md` (live CNAME; `pendo-domain-verification` TXT) · medium | **fact** |
| Data warehouse | **Snowflake** | infra: `raw/sub-processors.md` · medium | single-source, first-party disclosure → **solid** |
| Résumé / JD parsing | **Textkernel US LLC, DBA Sovren** — bought, not built | infra: `raw/sub-processors.md` · medium | single-source → **solid** |
| Integration plumbing | **Merge API, Inc.** — a unified-API vendor sitting behind some portion of the "100+ integrations" catalog | infra: `raw/sub-processors.md` · medium; catalog claim from website: `raw/partners-integrations.md` · crawl-clip · medium | **tentative** — the *division of labour* between Merge and bespoke connectors is unobserved |
| Messaging channels | **Twilio (incl. SendGrid)** for email+SMS; **WhatsApp Business Platform (Meta)**; Facebook Messenger; site widget; email — each a separately-monitored Statuspage component | infra: `raw/sub-processors.md`, `raw/dns-and-subdomains.md` (SendGrid DKIM) · medium **+** community: `raw/statuspage-components.json` · crawl-clip · medium **+** bundle: `raw/bundle-map.md` (`whatsappOnboarding` config) · medium | **fact** (three independent dimensions) |
| Auth — recruiter console | SSO callbacks for **ADP, Google, Microsoft Entra ID, SmartRecruiters, Facebook** via the Nuxt-auth module; **CASL** client-side ability model (`/api/casl-ability`, SSR `ability: {"company_ids":"*"}`); Django `csrftoken` double-submit (`Secure`, `SameSite=Lax`, deliberately not `HttpOnly`) | bundle: `raw/route-table.md`, `raw/env-config.md` · medium **+** infra: `raw/security-headers.md` · medium | **fact** |
| Auth — published API | **OAuth2 `client_credentials`** against `POST /auth/token` (or HTTP Basic), credentials **issued by a human integrations team**, never self-serve | api: `raw/endpoint-catalog.md` · openapi-verbatim · high | **fact** |
| API envelope | Offset/limit pagination `{limit, count, offset, <resource>: […]}`; **hand-rolled numeric error taxonomy** `{"errors":[{"code":1015,"message":…,"field":…}]}` — neither DRF's default nor a generated-framework default | api: `raw/endpoint-catalog.md` · openapi-verbatim · high | **fact** (documented artifact); see reconciliation |
| Feature flags | **In-house, server-populated** (Nuxt/Pinia `$sfeatureFlags`, hydrated at SSR); confirmed live flags `ai_interview_page:enabled_new_ui`, `system:theme` | `_shared/feature-flags.md` (`source: bundle`) · bundle-string-mine · medium | **fact** — and an **explicit false-lead flag**: the `LaunchDarkly`/`Statsig`/`Unleash` literals in the vendor chunk are Sentry SDK's always-bundled adapters, **not** evidence of those vendors |
| E-signature / PDF | **In-house `PDFSignature` AcroForm capability**, built from scratch on a `pdf-lib` fork (21 commits ahead, tickets `OL-*`), published to npm under a personal engineer scope `@prd-huy-ta/pdf-lib` (32 versions) | codebase: `raw/structure-map.md` · clone-and-map · medium **+** packages: `raw/prd-huy-ta-pdf-lib.json`, `raw/prd-huy-ta-pdf-lib-exports.md` · registry-metadata · high | **fact** (commit + registry evidence); its **production role is an open question** |
| Identity provisioning | **SCIM v2** — a private fork of `scim2-models` patched for the User `manager` attribute / `PatchOp` mutability (2 commits, 2025-06-03) | codebase: `raw/structure-map.md` · medium **+** packages: `raw/paradoxai-scim2-models-fork.json` · high | **fact** that SCIM code is exercised; production status = open question |
| Assessments | **Traitify** (Woofound, Inc. d/b/a Traitify) — an **acquired** capability, not a mere integration ("support and maintenance exclusively for Traitify Services"); monitored as a first-party Statuspage component; `api.traitify.com`/`cdn.traitify.com` in the app CSP | infra: `raw/sub-processors.md` · medium **+** community: `raw/statuspage-components.json` · medium **+** bundle: `raw/bundle-map.md` · medium **+** website: `raw/case-studies.md` · medium | **fact** (promoted — three independent dimensions) |
| Tax / payroll compliance | **Symmetry Software** (`spfcdn.symmetry.com` in CSP + named sub-processor); plus I-9 / WOTC / Tax-Information services as distinct monitored components | bundle: `raw/bundle-map.md` · medium **+** infra: `raw/sub-processors.md` · medium **+** community: `raw/statuspage-components.json` · medium | **fact** |
| Content / assets | **Contentful** (headless CMS), **ImageKit** (image CDN/transform) | bundle: `raw/bundle-map.md` (CSP + string-mine) · medium | single-source → **solid** (direct CSP observation) |
| Scheduling oddity | **Zenoti** (spa/salon booking SaaS) wired into interview room/service booking — 36+ literals (`ROOM_BOOKING_TYPE`, `MAX_ITV_DURATION_ZENOTI`) | bundle: `raw/bundle-map.md` · bundle-string-mine · medium | **fact** that the code exists; see reconciliation for the sub-processor-list mismatch |
| Corporate email / security | Google Workspace (MX + DKIM), Mandrill, Proofpoint Essentials, HubSpot, KnowBe4, Atlassian, SendGrid whitelabel; DMARC at `p=quarantine` | infra: `raw/dns-and-subdomains.md` · medium | **fact** (direct DNS observation) |
| No longer in the stack | **Rasa** (`devrasa.*`, `rasa-k8s.dev.*`, CT-logged 2023-09 → 2024-03, NXDOMAIN today) — the pre-LLM intent-classification NLU generation | infra: `raw/dns-and-subdomains.md` · medium | see the dedicated reconciliation entry — **inference, single-dimension** |
| Not in the stack (refuted) | **Packer + SaltStack** — the Discovery hypothesis of a live legacy VM-provisioning pipeline does **not** hold: zero Paradox-authored commits, upstream itself archived by HashiCorp, one release tag with no binary assets, never indexed on pkg.go.dev | codebase: `raw/structure-map.md` · medium **+** packages: `raw/packer-plugin-salt.json` · high | **refuted** (as a *current* infra claim) |

---

## Architecture

### The client/server split

Two entirely separate stacks with no shared infrastructure: the **marketing surface** (`www.paradox.ai` — Webflow
behind Cloudflare) and the **product surface** (everything under AWS). This is clean and unremarkable, but it is
worth naming because the marketing surface is where every feature claim in the run originates and it shares
nothing — not a CDN, not a CSP, not a header posture — with the thing being described (infra:
`raw/cloud-cdn-fingerprint.md` · dns-ct-fingerprint · medium).

The product side resolves to **one shared front-door IP pool** serving `olivia.paradox.ai`, `chrome.paradox.ai`,
`genai.paradox.ai`, the branded short-link domain `oli.vi`, and a second registered domain `recruiting.ai` (which
is also covered by `api.paradox.ai`'s current TLS SAN). Behind that front door the surfaces separate by host:

- **`api.paradox.ai`** — regional AWS API Gateway → a persistent **gunicorn** origin. Notably *not*
  CloudFront-fronted (no `via`/`x-cache`/`x-amz-cf-*`), and gunicorn is a long-lived process rather than a Lambda
  handler, which is consistent with the `api-k8s.*` Kubernetes naming seen across CT rather than a serverless
  backend (infra: `raw/cloud-cdn-fingerprint.md` · medium).
- **`genai.paradox.ai`** — a separate **uvicorn/ASGI** Python service. The runtime difference is the finding: the
  AI path was built on the modern async stack while the CRUD path stayed on the older sync one.
- **`ws.paradox.ai`** — a dedicated WebSocket host, referenced as `public.socketUrl` in the Nuxt runtime config
  and present in DNS. **Nothing about its protocol or role was observed** — it is plausibly how the recruiter-side
  `/assist` and `/employee-chat/messages` surfaces receive live updates rather than the candidate's own transport
  (bundle: `_summary.md` Inferences · medium — explicitly labelled inference there, and it stays one here).
- **`cdn.olivia.paradox.ai` / `cdn.sites.paradox.ai`** — CloudFront over private S3 (403 `AccessDenied` on
  bare `/`, `.map` probes denied).
- **`chrome.paradox.ai`** — returns **HTTP 418** to a bare request, i.e. a deliberate decoy/block for requests
  arriving without proper tenant routing context (infra: `raw/cloud-cdn-fingerprint.md` · medium).

### The two frontend generations (the live migration)

`olivia.paradox.ai` serves a **Nuxt 3 shell** for `/`, `/login`, `/candidate` — and that shell is thin: only the
login/OTP/SSO surface is unauth-reachable, everything else is server-guarded. The **actual recruiter/admin
console is the legacy Django + Vue 2/Vuex/jQuery/Handlebars app**, branded "Candidate Experience Manager," which
surfaces as the 404 fallback shell and whose client router yields a 100+ route table: `/dashboard`, `/candidates/
inbox`, `/jobs`, `/interviews`, `/events`, `/campaigns`, `/campuses`, `/analytics`, `/cms`, `/site-studio`,
`/surveys`, `/microlearning`, `/employee-recognition`, `/assist`, plus a very deep `/settings/*` tree
(`job-builder`, `interview-builder`, `approvals-builder`, `workflows`, `journeys`, `round-robin-management`,
`candidate-volume-optimizer`, `integration-center-v2`, `knowledge-base`, `data-feeds`, `whatsapp-templates`,
`phone-numbers`) (bundle: `raw/route-table.md` · bundle-string-mine · medium).

The legacy generation's asset path is stamped **`202608`** — the same month as capture. This is the load-bearing
detail: it is **actively redeployed**, not frozen. The reasonable read (bundle's own inference, retained as
inference) is an incremental strangler-fig rewrite that started at auth — the highest-leverage,
most-security-sensitive surface — with the rest of the console still to come.

**Independent corroboration of the migration theme from a different dimension and a different layer:** the most
recent Statuspage postmortem (2026-07-27) names an active initiative to convert **legacy synchronous backend
endpoints to the platform's standard async model**, after a cluster of "CEM Slowness" incidents traced to
connection-pool exhaustion on exactly those legacy paths (community: `raw/issue-themes.md` · crawl-clip · medium).
Frontend and backend are being modernized concurrently, and the vendor has said so publicly. These are two
independent dimensions agreeing on the *pattern*, though on different layers — so "Paradox is mid-modernization
on both tiers" is **fact**; the specific coupling between the two efforts is not established.

### Multi-tenancy and white-labeling — an architecture, not a marketing feature

Tenancy shows up in four independent places at four different layers:

1. **Per-customer subdomain families** — `<customer>.paradox.ai` / `<customer>api` / `api-k8s.<customer>` /
   `chrome.<customer>` / `<customer>status` / `job.<customer>`, recovered for Aramark, Darden, FedEx (+ a
   `fedexstg` staging tenant), Lockheed Martin, Lowe's (+ `lowesstg`), PepsiCo, Regis, Unilever, Prudential,
   Visiting Angels, Sodexo (infra: `raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium).
2. **Per-customer native app builds** — a white-labeled "Regis + Paradox CEM" ships on both iOS and Android
   alongside the flagship, functionally identical apart from branding (distribution: `raw/android-play-store-
   listing.md` · binary-extract · high). **`regis.paradox.ai` in CT independently corroborates this** — two
   independent dimensions (distribution + infra), so the white-label build pattern is **fact** (promoted); the
   claim that *more* such builds exist for other logos remains a hypothesis.
3. **A per-tenant static-site provisioning product** — `sites.paradox.ai` plus `preview.sites.*` for every
   environment plus visibly ad-hoc QA tenants (`6577.sites.stg`, `somerandomname23142390.sites.dev2`), which
   confirms "Conversational Career Sites" is a genuine multi-tenant site builder rather than a template
   (infra: `raw/dns-and-subdomains.md` · medium).
4. **A rebrandable assistant persona** — the same engine deployed as "Ava Cado" (Chipotle), "Rita" (7-Eleven),
   "Ev-e" (GM), "Mia", "Becky" (website: `raw/solutions-usecases.md` · crawl-clip · medium).

The engineering read: **near-zero-marginal-cost bespokeness**. One multi-tenant platform, four independent
layers of per-customer skinning (DNS, mobile binary, career-site, persona name), which is what lets a
sales-led enterprise motion feel custom without forking the product.

### Authorization and tenancy expression

Client-side authorization is **CASL**, with the ability set fetched from `/api/casl-ability` and hydrated into
the SSR payload; the unauthenticated default shape is `{"company_ids": "*"}` — i.e. **tenancy is expressed as a
company-id scope inside the ability object** (bundle: `raw/env-config.md`, `raw/route-table.md` ·
bundle-string-mine · medium). The published API independently exposes a **Users / roles / location-permissions**
family of 12 operations, including an `employee_id`-addressed alias path family (api: `raw/endpoint-catalog.md` ·
openapi-verbatim · high). Two independent dimensions converge on the same model: **RBAC scoped by company *and*
by location** — which is exactly the shape a multi-site, high-volume hourly employer needs (a district manager
who can act only on their own stores). Promoted to **fact**; the exact permission grammar is unobserved.

The `Employee ID` accepted as a first-class login identifier in the mobile app (distribution:
`raw/screenshot-catalog.md` · binary-extract · high) and the SCIM `manager`-attribute patch (codebase/packages)
line up with this: identity is expected to arrive from the customer's HRIS, not to be created in Paradox.

### The async / data plane

Three independent signals describe a system where meaningful work happens off-request:

- **Celery over RabbitMQ**, with a Node service participating directly in the Python task queue rather than
  through a REST or second-queue abstraction (codebase: `raw/dependency-graph.md` · medium + packages:
  `raw/prd-thanhnguyenhoang-celery-node.json` · high). Commit evidence includes `"add testing worker rabbitmq"`,
  retry logic, and task-failure event handling under tickets `OL-`/`OIS-`.
- **Reporting is a separate async subsystem** — the published API's Reporting family is a job-submit endpoint
  requiring a `callbackUrl` that Paradox invokes when the report completes (api: `raw/endpoint-catalog.md` ·
  openapi-verbatim · high), and **Reporting is its own top-level Statuspage component group** (community:
  `raw/statuspage-components.json` · crawl-clip · medium). Two independent dimensions → **fact**.
- **Snowflake** as the warehouse (infra: `raw/sub-processors.md` · medium) is the plausible substrate under both
  the Reporting subsystem and the marketing claim of "1,000+ metrics tracked" — *plausible*, not established;
  no dimension connects them directly.

### The vendor's own service decomposition (first-party, machine-readable)

The Statuspage component census is the closest thing this run has to an org chart of the running system
(community: `raw/statuspage-components.json` · crawl-clip · medium). Its four groups:

| Group | Components | Architectural read |
| --- | --- | --- |
| **Conversations** | SMS, Site Widget, WhatsApp, Email, Facebook Messenger | The omnichannel conversational front-end is a **first-class service tier with per-channel failure domains** — channels are monitored independently, not as one "messaging" blob |
| **Candidate Experience Manager** | Site Services, User Experience, Candidate Experience | The recruiter console as its own tier — and the one with ~13 of 45 historical incidents (the acknowledged weak point) |
| **Reporting** | standalone | Confirms the async analytics split above |
| **Integrations** | I-9 Services, WOTC Services, Tax Information Services, Traitify Assessment | Compliance + assessment vendors run as **separately-monitored subsystems**, which is what you'd expect if they're third-party-backed |

This decomposition is independent of both marketing and the bundle, and it agrees with them — the channel list
matches the CSP/config vendor roster, and the CEM group matches the console the bundle mined.

---

## How it's built

**There is no public product source, and there never was.** All five repos in the confirmed-genuine
`github.com/ParadoxAi` org are **forks of unrelated upstream projects** (codebase: `raw/structure-map.md` ·
clone-and-map · medium; independently re-verified against registry ownership by packages:
`_summary.md` · registry-metadata · high). Three carry real Paradox engineering:

| Repo | Paradox work | Signal |
| --- | --- | --- |
| `pdf-lib` (fork of `Hopding/pdf-lib`) | 3 engineers, 2023–2025, a from-scratch AcroForm `PDFSignature` feature (`src/api/form/PDFSignature.ts`, `src/core/acroform/PDFAcroSignature.ts`), tickets `OL-*` | In-house **document e-signing**, the concrete engineering trace behind offer-letter/onboarding paperwork |
| `celery.node` (fork of `actumn/celery.node`) | 1 primary engineer, 2024–2025, RabbitMQ worker + retry + failure-event work, tickets `OL-`/`OIS-` | Direct proof of the **polyglot Python+Node backend** |
| `scim2-models` (fork of `python-scim/scim2-models`) | 2 commits, 2025-06-03, User `manager` attribute / `PatchOp` mutability fix | Real **SCIM provisioning** engineering — an engineer hit a real org-hierarchy bug |

**A correction that both dimensions made independently, and that matters for how it is cited:** the live PyPI
`scim2-models` package is **upstream Yaal Coop's own publish**, not Paradox's — Paradox's artifact is a private
*fork*, 2 ahead / 192 behind. `codebase` reached this via git fork lineage; `packages` reached it via PyPI
`author`/`project_urls` metadata. Different artifacts, two independent dimensions, same correction →
the corrected framing is **fact**: Paradox is a confirmed *user and patcher* of an upstream SCIM library,
never a publisher of one (codebase: `raw/structure-map.md` · medium + packages: `raw/paradoxai-scim2-models-fork.json`
· high).

**Org patterns visible from outside:**

- **Fork rather than upstream-contribute; publish under personal npm scopes** (`@prd-huy-ta/*`,
  `@prd-thanhnguyenhoang/*`) rather than a corporate org scope — no `@paradoxai` npm org or PyPI namespace
  exists at all (packages: `_summary.md` · registry-metadata · high). Every public artifact is an
  internal-consumption byproduct; **Paradox has made no public open-source investment**.
- **Internal Jira keys leak through commit messages**: `OL-` (in both `pdf-lib` and `celery.node` — almost
  certainly "Olivia," and the strongest available evidence both forks feed one product effort), `OIS-`, and a
  single `MS-` (codebase: `raw/dependency-graph.md` · medium).
- **A mature, Kubernetes-centric internal platform**, named by CT and now publicly delisted: ArgoCD (GitOps CD),
  Rancher (fleet), Drone CI + Jenkins-behind-Teleport, SonarQube, Vault, PrivateBin, an internal VPN
  (infra: `raw/dns-and-subdomains.md` · medium).
- **A cert-strategy shift — real, but weaker than originally written (corrected by Mode-5 iteration 2).** The
  observed facts: per-Ingress Let's Encrypt certs (2616× `R3`, 598× `E1`, 158× `X3` — the cert-manager signature)
  dominate the 2017→2024 record, and the *current* live cert is a single AWS-ACM wildcard `*.paradox.ai`
  (verified via `openssl s_client`). **What is withdrawn** is the sharp "no individually-named cert is issued
  after 2024-06-13" reading: the crt.sh `%.paradox.ai` dataset is **silently truncated** at that date, and a
  per-host query proves at least one Paradox subdomain (`readme.paradox.ai`) carries certs issued 2026-07-12.
  So the 2024-06-13 cutoff is substantially a **query artifact**, and the ACM-wildcard consolidation is a live
  observation rather than a dated event the CT record establishes. **The operative rule stands and is now
  doubly justified: the CT inventory is a floor, not a ceiling** — nothing after mid-2024 is visible in the
  wildcard query at all, so **no absence claim may rest on it without a per-host re-query**
  (infra: `_summary.md` gaps · corrected).
- **Environment discipline**: `dev`, `dev2`, `dev3`, `stg`, `stgent`, `test`, `ltsstg` (load-test staging),
  dedicated `load`/`loadapi` hosts, plus the full parallel `eu1` family.
- **Release cadence**: the mobile clients ship on a single coordinated train (iOS 2026-07-14, Android 2026-07-13),
  roughly monthly, continuously since January 2018 (distribution: `raw/ios-app-store-listing.md` · binary-extract
  · high). The legacy web console is redeployed at least monthly (the `202608` stamp). **No public changelog
  exists** — a gated Helpjuice `release-notes` article behind SAML is the only one (community:
  `raw/changelog-digest.md` · crawl-clip · medium).
- **Beta versioning in production**: the live prod shell reports `app@3.0.0-beta.13` (bundle: `raw/env-config.md`
  · medium) — consistent with a rewrite being shipped incrementally to production behind the flag store.

**Client-side closure is deliberate**: five distinct chunks across both frontend generations were checked for
`sourceMappingURL` — **zero found** — and direct `.map` probes return 403 from a private S3 bucket
(bundle: `raw/bundle-map.md` · bundle-string-mine · medium). No `source-map-reassembly` was ever available; this
run's client-side knowledge is string-mined, and its confidence is capped accordingly.

---

## Notable design choices (worth stealing)

1. **Isolate the model layer as its own service on its own runtime.** `genai.paradox.ai` is a separate host, a
   separate server stack (ASGI/uvicorn vs the sync WSGI monolith), and — per the CSP — the *only* path to a
   foundation model, since no LLM vendor host is reachable from the browser at all. You get independent scaling
   and rate-limiting for the expensive, latency-variable, quota-bound part of the system; you get to modernize
   the runtime exactly where it pays (async I/O for model calls) without rewriting CRUD; and you keep model
   credentials and prompt logic entirely server-side. Two frontend generations reach it through **two different
   integration points** — the legacy console via same-origin `/api/gen-ai/{init-data,create-feedback,track-consent-approval}`
   and the Nuxt shell via the dedicated host — which is the seam you'd expect mid-migration
   (bundle: `raw/route-table.md`, `raw/env-config.md` · medium).
2. **Strangler-fig starting at auth.** Rewriting login/OTP/SSO first is the highest-leverage entry: it is the
   surface every user hits, it is the most security-sensitive, it is the smallest coherent slice, and it lets the
   new stack own session establishment for everything that follows. The legacy console keeps shipping monthly
   behind it. The cost is real and visible — two frameworks, two build pipelines, two CSPs, one host — but it is
   being paid deliberately.
3. **Buy the commodity AI, build the weird specific thing.** Résumé parsing → Textkernel/Sovren. Long-tail HRIS
   connectors → Merge API. Tax/payroll forms → Symmetry. Assessments → acquire Traitify. Warehouse → Snowflake.
   Foundation models → license via Bedrock. Then build in-house exactly one narrow, unglamorous capability no
   vendor does well for this workflow: **AcroForm digital signatures placed programmatically into PDFs**. That
   ratio — buy everything commoditized, build the one thing that sits on the critical path of your differentiated
   flow — is the transferable lesson.
4. **One async bus across the language boundary, rather than a second abstraction.** Instead of putting REST or a
   second queue between the Python and Node services, they taught Node to speak Celery's wire protocol and
   maintain that fork for 16+ months. One broker, one task semantics, one failure model. The cost is owning a
   fork of a small OSS project; the benefit is not operating two queueing systems.
5. **Channels as first-class, independently-monitored services.** SMS, WhatsApp, Email, Facebook Messenger, and
   the site widget are separate Statuspage components with separate incident histories. For a product whose
   entire value proposition is "the conversation happens where the candidate already is," making each channel its
   own failure domain — rather than one "messaging" service — is the architecture that matches the promise.
6. **Per-tenant skinning at four independent layers** (subdomain, mobile binary, career-site instance, assistant
   persona name) over a single multi-tenant core. This is cheap bespokeness, and it is very likely a meaningful
   part of the "white glove" perception in the customer testimonials.

---

## Cross-dimension reconciliation

| # | Claim | Sources | Independence / weighting | Verdict |
| --- | --- | --- | --- | --- |
| 1 | Backend is **Python**; main API origin is **gunicorn/WSGI** behind regional AWS API Gateway | infra (`raw/cloud-cdn-fingerprint.md` · medium), api (`raw/auth-wall-probe.md` · high), codebase/packages (Python forks) | infra and api **read the same live header on the same host** — per §6 that is **one source, not corroboration**. But it is a *direct, self-naming* observation, and the codebase/packages Python lane is genuinely independent. | **Fact** — no band-bump claimed from the double read |
| 2 | The app server is **Django** | bundle (`djangojs.js`, `moment.fn.django`, Django static-pipeline paths — `raw/bundle-map.md` · medium); infra (`csrftoken` Set-Cookie on the live 302 — `raw/cloud-cdn-fingerprint.md` · medium) | Two dimensions, **two genuinely different artifacts** (minified JS strings vs an HTTP response header) → promotes | **Fact** that it is Django-family — see #3 for the tension |
| 3 | ✅ **RESOLVED by Mode-5 iteration 2** (was: "tension, flagged not resolved"). The tension was that the *published* API's envelope is **not** DRF's default — DRF paginates `{count, next, previous, results}`, while Paradox's documented partner envelope is `{limit, count, offset, <resource>:[…]}` with a hand-rolled numeric error taxonomy (`code: 1015`). **Resolution: there are two different API layers, and only the app-own one is DRF.** Six unauthenticated read-only `curl` GETs against the app's own same-origin paths (`/api/menu`, `/api/company`, `/api/company/users`, `/api/gen-ai/{init-data,create-feedback}`, `/api/external/itv-prep/upload`) each return **`401` with DRF's verbatim `not_authenticated` error `code`**, DRF's `APIView`-default `Allow` header (`GET, HEAD, OPTIONS` on `/api/menu`; `GET, POST, HEAD, OPTIONS` on `/api/company`), `Vary: Accept-Language, Cookie`, and a DRF-shaped `OPTIONS` response | api (`raw/endpoint-catalog.md` · openapi-verbatim · high) + the Django tells in #2 + `_shared/api-path-catalog.md` "Mode-5 live-probe verification addendum" · http-probe · **high (direct HTTP observation)** | Three lanes, and the resolution is a *third* corroboration of the near-disjoint published-vs-app-own split: the app-own layer is **DRF**; the partner layer is a **separate, hand-rolled** surface | **Django = fact. App-own API layer = DRF = fact** (direct observation). Published partner API = **not DRF**, a distinct layer — which is the point |
| 4 | **The Rasa → Bedrock evolution** — Olivia moved from a Rasa intent-classification NLU stack (CT-logged 2023-09→2024-03, NXDOMAIN today, 3-resolver+SOA verified) to a live Bedrock-backed GenAI microservice (`genai.*` first logged 2024-03, live today, `server: uvicorn`; sub-processor PDF dated 2026-08-05 names "AWS Bedrock, model licensing services") | **infra only** (`raw/dns-and-subdomains.md`, `raw/sub-processors.md`, `raw/cloud-cdn-fingerprint.md` · dns-ct-fingerprint · medium) | **Single dimension.** It synthesizes three *artifact types* (CT history, a live header, a first-party PDF), which is stronger than one artifact — but per `evaluation.md` that is **not** two independent dimensions and earns **no band promotion**. The source dimension itself says so explicitly. | **Tentative / medium — the run's best-supported inference, deliberately not promoted to fact.** The *timing* and the *causal link* are inferred; only the endpoints (Rasa hosts existed then and are gone; `genai` exists now; Bedrock is currently disclosed) are observed |
| 4a | Sub-claim: **a dedicated NLP-serving layer with failover existed pre-LLM** | infra (Rasa host family, CT · medium) **+ community** (a 2021 "NLP Failover" Statuspage incident — `raw/issue-themes.md` · crawl-clip · medium) | **Two genuinely independent dimensions**, different artifacts (CT certs vs a first-party incident log), agreeing on the existence of a dedicated NLP tier before the LLM era | **Fact** (promoted) — note this promotes only the *pre-LLM NLP tier existed*, **not** the Rasa identity or the Bedrock destination |
| 5 | **No client-direct LLM call**; all model access is server-brokered | The `olivia.paradox.ai` CSP `connect-src` names no `api.openai.com` / `*.anthropic.com` / `generativelanguage.googleapis.com` / `*.openai.azure.com` | **bundle and infra both read the same CSP** on the same host → **same artifact ⇒ one source.** No promotion. The website's silence on model vendors (`raw/legal-security-fraud.md` · crawl-clip · medium) is an *absence in marketing*, not independent technical corroboration | **Fact** (direct observation of the allow-list) — stated on the strength of the observation itself, not on a false two-source count |
| 6 | Which **foundation model** Bedrock provisions | none | Not disclosed anywhere public; Bedrock abstracts it by design | **Unknown.** Would need an authenticated session capturing a `genai.paradox.ai` request/response — the single highest-value gap this run leaves |
| 7 | **Polyglot Python + Node joined by Celery/RabbitMQ** | codebase (`raw/dependency-graph.md` · clone-and-map · medium) + packages (`raw/prd-thanhnguyenhoang-celery-node.json` · registry-metadata · high) | Both examine the **same repo family** — but via different artifacts (git commit history vs npm registry publish/maintenance metadata), and the registry lane adds what git alone cannot: that this is a *live, maintained, consumed* dependency (42 releases, maintainer `@paradox.ai`, last modified 2025-07) | **Fact** that the capability exists and is current. **The live service topology (how many services, deployed where) remains inference** — the source dimension flags this itself, and no infra-as-code was found anywhere |
| 8 | **White-labeled per-customer native builds** | distribution (`raw/android-play-store-listing.md` · binary-extract · high) + infra (`regis.paradox.ai` in CT · dns-ct-fingerprint · medium) | **Two independent dimensions**, entirely different artifacts (app-store catalog vs certificate transparency) | **Fact** (promoted). "Other logos likely have builds too" stays a **hypothesis** — one customer, two platforms is two data points about one customer |
| 9 | The `scim2-models` PyPI package is **not** Paradox's publish | codebase (`raw/structure-map.md` · medium) + packages (`raw/scim2-models.json`, `raw/paradoxai-scim2-models-fork.json` · high) | Two dimensions, two different artifacts (fork lineage vs PyPI `author`/`project_urls`), both correcting the same recon-plan imprecision | **Fact** — and a good example of Ingestion correcting Discovery rather than echoing it |
| 10 | **Packer + SaltStack legacy VM infra** (Discovery hypothesis) | codebase + packages both refute | Zero Paradox-authored commits; upstream archived by HashiCorp; one release tag with no assets; never indexed on pkg.go.dev | **Refuted as a current-infra claim.** Consistent with a retired path or a compliance/SBOM mirror; not evidence of live Salt provisioning |
| 11 | ⚠️ **Vendor-roster mismatch, flagged**: **Zenoti**, **Contentful**, **ImageKit**, **Pendo**, and **WhatsApp/Meta** appear in the client (CSP + config + string-mine) but **not** in the sub-processor PDF; conversely **Snowflake**, **Textkernel/Sovren**, **Merge API**, and **Twilio** appear in the PDF but never in the client | bundle (`raw/bundle-map.md` · medium) vs infra (`raw/sub-processors.md` · medium) | **Not a conflict — a scope difference.** The CSP enumerates *client-reachable* vendors; the sub-processor list enumerates *personal-data processors*, which are mostly server-side. A customer-directed booking integration (Zenoti) where the customer holds the vendor relationship would legitimately appear in neither list. | **Flagged as complementary, not contradictory.** The **union** of the two lists is the fuller vendor stack, and neither alone should be cited as complete |
| 12 | ⚠️ **Published-vs-actual gap, flagged**: the api dimension found **no generic webhook subscription system** (no `/webhooks` CRUD, no event catalog, no signature-verification docs) — only two narrow purpose-built contracts. But infra's CT sweep found dedicated **`webhook.paradox.ai`, `webhook.dev`, `webhook.eu1`** hosts | api (`raw/endpoint-catalog.md` · openapi-verbatim · high) + infra (`raw/dns-and-subdomains.md` · dns-ct-fingerprint · medium) | Two independent dimensions describing **different things**: what is *documented* vs what is *deployed*. Direct-observation tiebreaker does not apply — both are direct observations of different artifacts | **Both true.** Dedicated inbound-webhook infrastructure exists and is **undocumented publicly** — a real finding for anyone assessing integration surface, and an open question about whether it is partner-only or internal |
| 13 | **Reporting is a separate async subsystem** | api (job-submit + `callbackUrl` · openapi-verbatim · high) + community (its own Statuspage component group · crawl-clip · medium) | Two independent dimensions | **Fact** (promoted) |
| 14 | **Traitify is an acquired first-party capability**, not a third-party integration | infra (sub-processor PDF: "Woofound, Inc. d/b/a Traitify… support and maintenance exclusively for Traitify Services" · medium) + community (a monitored first-party Statuspage component · medium) + bundle (CSP hosts · medium) + website (named in a case study as a product used · medium) | Three independent dimensions (website is not independent of marketing, so it does not add a vote) | **Fact** (promoted) |
| 15 | **A separate EU region** exists | infra (full `eu1` host family in CT · medium) + api (documented `api.eu1.paradox.ai` / `api.stg.eu1.paradox.ai` servers · high) | Two independent dimensions, different artifacts | **Fact** (promoted) |
| 16 | **RBAC scoped by company and location** | bundle (CASL `/api/casl-ability`, `ability: {"company_ids":"*"}` · medium) + api (12 users/roles/location-permission ops, `employee_id` alias paths · high) | Two independent dimensions | **Fact** (promoted); the permission grammar itself is unobserved |
| 17 | **Kubernetes as the deployment substrate** | infra only (naming convention + internal tooling roster + the live `k8s.devsentry` CNAME · dns-ct-fingerprint · medium) | Single dimension, and the core of it is a **naming-convention inference** | **Solid inference, not fact.** Never directly observed |
| 18 | Route-count divergence: bundle recovered **100+ admin console routes**; api catalogued **53 operations / 36 paths** | bundle · medium; api · high | **Not a conflict** — two different surfaces (the app's own client router vs the published partner API). Per §6 this is a **scope difference**, and the published-vs-app-own diff belongs to `data-model-api-surface.md` | **Both stand.** The app surface is much broader than the published one |
| 19 | Language support: marketing says "100+ languages" in some places and "30+" in others; the API docs enumerate **57** `language_preference` locale codes | website (`raw/products.md` · crawl-clip · medium) vs api (`raw/endpoint-catalog.md` · openapi-verbatim · high) | **Direct-artifact tiebreaker**: 57 enumerated codes in a served OpenAPI fragment outranks two inconsistent marketing numbers | **57 is the citable figure**; the marketing range is flagged as unresolved (the 30-vs-100 split is likely live-conversation vs translated-content, but nothing states this) |
| 20 | Internal platform hosts (ArgoCD/Rancher/Grafana/Vault/Teleport/Drone) are "gone" | infra · medium | The absence was verified properly (3 resolvers + SOA authority), but **NXDOMAIN cannot distinguish decommissioned from split-horizon/private DNS** — the source dimension says so | **Recorded as absent-from-public-DNS only.** Not "decommissioned" |
| 21 | Missing lanes | session `absent`, wire-capture `folded` | No live wire on this run at any layer | **Recorded gap, not a structural hole.** It caps the realtime protocol, the model-call shape, the candidate-facing chat runtime, and every write path at *unobserved* |

---

## Open questions

1. **Which foundation model(s) does Bedrock provision for Olivia?** Nowhere public; Bedrock abstracts it. Needs
   one authenticated session capturing a `genai.paradox.ai` request/response. Highest-value single gap in the run.
2. **What protocol does `ws.paradox.ai` speak, and what is its role?** Content-streaming vs cache-coherence ping,
   frame shapes, event catalog — all unobserved. Also unresolved: whether it carries the candidate conversation
   or only recruiter-side live updates.
3. **Where does the candidate ↔ Olivia conversation actually render?** No candidate-facing chat bundle or route
   was located in the unauthenticated pass. The bundle dimension's read — that it is primarily SMS (a
   carrier-mediated channel with no web client to mine) plus per-conversation server-rendered pages reached via
   `oli.vi` links — is a **plausible inference, not an observation**.
4. **Is the Nuxt rewrite intended to subsume the full console, and on what horizon?** Only login/auth is covered
   today; the legacy generation still ships monthly. Nothing observed indicates the target end-state.
5. ~~**Django yes — but which API layer serves `api.paradox.ai`?**~~ **PARTIALLY ANSWERED by Mode-5 iteration 2
   (see reconciliation #3).** The **app's own** same-origin `/api/*` surface on `olivia.paradox.ai` is
   **Django REST Framework** — directly observed via DRF's `not_authenticated` error code, `Allow` headers,
   and `OPTIONS` behaviour on six live unauthenticated probes. The **published partner** API on
   `api.paradox.ai/api/v1/public` keeps its hand-rolled `{"errors":[{"code":1015,…}]}` envelope and is
   therefore a **different layer**. *Still open:* whether that partner layer is the same Django project
   behind a different serializer stack, a separate service, or an API-Gateway-level façade — and whether
   `api.paradox.ai`'s **non**-`/public` surface is the same DRF app the console calls.
6. **What is behind the Basic-Auth-gated `api.paradox.ai/docs/docs/`** (`WWW-Authenticate: Basic realm="Have a
   good day !"`)? Presumably the internal Swagger/ReDoc — likely a superset of the public 53 operations. Never
   attempted past the 401, per ethics.
7. **Are `webhook.paradox.ai` / `webhook.eu1` a live partner-facing surface or internal-only plumbing?** DNS says
   they exist; the documentation never mentions them.
8. **Is `assistant.paradox.ai` / `myassistant.paradox.ai` a distinct product from Olivia**, or the internal name
   for the recruiter-side "Assist" copilot the mobile screenshots show? CT names it; nothing else in the run does.
9. **Are the internal-platform hosts decommissioned or moved to split-horizon DNS?** Externally undecidable.
10. **What are `birddoghr.*`, `smashflystatus.*`, `lucistatus.*`?** Acquisitions, legacy white-label tenants, or
    internal codenames — unconfirmed by any source.
11. **How is the "100+ integrations" catalog actually divided between Merge API and bespoke connectors?** The
    partner tier is demonstrably bespoke per-partner (server-sync for Workday, browser extension for SAP,
    Indeed-side embed for Indeed — api: `raw/partner-integrations.md` · high); the long tail is unexplained.
12. **Is `scrape.dev/test.paradox.ai` (a scraping microservice, plausibly job-listing ingestion) still live?**
    It appears in historical CT only and is not in the currently-resolving set.
13. **What is the production role of the in-house PDF pipeline?** Is `pdfgen-python` (abandoned 2022) still in the
    critical path, superseded by the `pdf-lib` fork, or replaced by an unobserved service?
14. **Does the Olivia Safari extension request `<all_urls>`-class host permissions**, as its marketing copy
    implies? Would need the signed `.app` bundle (distribution stayed at listing-metadata level by design).
