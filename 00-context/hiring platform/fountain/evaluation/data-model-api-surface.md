# Fountain — Data Model & API / SDK Surface

<!-- Evaluation (Mode 3) rollup · reconciles: docs, api, deployed-client-bundle, packages, codebase,
     infra-backend-fingerprint, website, distribution-artifacts, session (absent), wire-capture (folded)
     · compiled 2026-08-09 · provenance-weighted per .claude/rules/evaluation.md -->

> **Evidence base for this document — read this first.** Every claim below rests on **two static-analysis
> lanes and zero live wire observation**:
>
> | Lane | Dimension(s) | Method | Confidence ceiling | What it is |
> | --- | --- | --- | --- | --- |
> | **A — served developer-docs corpus** | `docs` + `api` (**ONE source**, not two) | `docs-reconstructed`, with 41 of 575 endpoint rows `openapi-verbatim` | medium (high for the 41 verbatim rows) | `developer.fountain.com`'s `llms.txt` + ReadMe reference pages → the **published** API |
> | **B — reassembled production source map** | `deployed-client-bundle` | `source-map-reassembly` | high | `app.fountain.com`'s generated API client + route table → the **app's own** API |
>
> **Lane A is one source, not two.** `docs` and `api` worked independently but mined the *same served
> artifact* (the `developer.fountain.com` ReadMe corpus). Per `evaluation.md`'s "same artifact ⇒ one
> source" rule, their agreement on the 575-endpoint architecture is **not** independent corroboration and
> earns **no confidence band-bump**; their divergent page counts (593 vs 594) are a **reported range,
> not a flagged conflict**, and the 12-vs-13 `service*` divergence is **resolved** below (12
> microservices + the `servicehire` gateway prefix — §Count reconciliation).
>
> **Lane B is genuinely independent of Lane A** — a different host, a different artifact, and a
> categorically different method (source-map reassembly of a shipped client vs. reading a docs portal).
> Where A and B agree, the claim promotes. Where only one speaks, it stays capped at that lane's band.
>
> **Neither lane is a live wire observation — with exactly three, later, exceptions.** `session` is
> `status: absent` (`auth:none` — the user was unavailable to authorize a login;
> `write_side_observed: false`, `pass2: not-applicable`) and `wire-capture` is `status: folded` into it
> (`wire-capture: _summary.md · folded`). **No request of the app's own `/internal_api/*` or `/v2/*` API
> was observed on this target.** The exceptions, all read-only unauthenticated MCP probes
> (`initialize` + `tools/list` only, **no tool ever invoked**): **Mode-5 iteration 1** probed
> `data-mcp-production-us-east-1.fountain.com/mcp` (discovered in the `wx-copilot` bundle), and **Mode-5
> iteration 2** probed `mcp.fountain.com` (found live, `fountain-hire-mcp-server`, 127 tools) plus a
> DNS candidate sweep for the two remaining declared MCP hosts (not located) — see §MCP below. Those
> responses *are* direct runtime observations and are graded **high** accordingly. A third static
> exception, also iteration 2: five `service*` reference pages fetched raw, confirming embedded
> `openapi-verbatim` fragments across the WX family (§Open questions #7).
> Everything else below stands as declared. Consequences that bind this whole document:
> every request/response *shape* below is **declared** (by docs or by a generated client), never
> **observed**; no path can be shown to actually fire; the OAuth header-name ambiguity is unresolvable;
> and the realtime event catalog is empty. `source:none` (no repo — `codebase: absent`, high) and no
> published SDK (`packages: absent`, `registry-metadata`, high) remove the two remaining corroboration
> lanes.

---

## Core entities

Fountain's domain model is **not one model**. It is **two entity spines** — a pre-hire `Applicant` spine
(the legacy Hire ATS) and a post-hire `Worker` spine (the "Fountain One" / Worker Experience
microservices) — joined at a single documented seam, plus a **third, product-internal entity set** that
exists only in the recruiter console's own API.

### Spine 1 — `Applicant` (Hire v2, the legacy ATS)

The `Applicant` schema is the richest single entity recovered on this target, captured verbatim from the
per-operation OpenAPI fragment on `GET /v2/applicants/{id}` (`docs: raw/api-reference.md` ·
`openapi-verbatim` · **high**):

| Facet | Fields / structure |
| --- | --- |
| **Secure fields** (excluded from default GET; explicit allowlist) | SSN, gender, ethnicity, citizenship, `can_work_in_us`, religious preference, income/tax detail, driver's license, passport, bank account / routing / IBAN / BIC, vehicle registration, W-4 federal + state |
| **Employment eligibility** | `i9` (structured form incl. preparer/translator), `i9_status` state machine (`awaiting_employee → awaiting_employer → pending → complete`, `+ opted_out`, `awaiting_authorized_representative`), `everify` (`case_number`, `case_status` incl. `PHOTO_MATCH`, `MANUAL_REVIEW`, `FINAL_NONCONFIRMATION`) |
| **Vendor abstractions (tagged unions)** | `background_checks[]` → `vendor: checkr \| onfido`; `document_signatures[]` → `vendor: hellosign \| docusign` |
| **Embedded third-party data** | `lessonly{}` (LMS completion), `video_url_objects[]` (async video interview, tied to `question_id`/`label`), `assessments[]` (score / system_type / file_url), `partner_data[]` (documented example partner: **"AI Interview"**) |
| **Consent (TCPA)** | `consent_sms_transactional`, `consent_sms_marketing`, `consent_calls_transactional`, `consent_calls_marketing`, each with an `_at` timestamp (description carries the internal ticket ID `AXHE-3408`) |

Surrounding Hire v2 entities (`api: raw/endpoint-catalog.md` · `docs-reconstructed` · medium, with the
resource set itself corroborated by the verbatim fragments): **Funnel/Opening** (the two names are used
interchangeably in the API), **Stage**, **Label**, **Transition**, **ArchivedReason** /
**RejectionReason**, **Workflow** (list/delete + an *Alpha*, flag-gated opening→workflow reassignment),
**HiringGoal**, **Location**, **LocationGroup**, **Position**, **CompanyAttribute** (+ values),
**OptionBank**, **DataKey**, **Export** / **TimestampedExport**, **Role**, **User**, **UserActivity**,
**Shift** (read-only here), **AvailableSlot / BookedSlot / Session**, **Note**, **SecureDocument**,
**SmsMessage**, **WebhookSetting**.

### Spine 2 — `Worker` (Fountain One / Worker Experience) — **19 microservice families, not 12**

> **UPDATED (Mode-5 iteration 2, 2026-08-09).** This table previously listed **only the 12 families the
> docs corpus names**. Mode-5 iteration 1 mined the two `wx-*` micro-frontends and recovered **466 unique
> `/api/service*` paths across 15 client-consumed families** (`_shared/api-path-catalog.md` §Addendum ·
> `deployed-client-bundle: raw/wx-micro-frontends.md` · `bundle-string-mine` · medium). That mine reached
> none of the rollups until now. Reconciling the two lanes yields **19 distinct `service*` families**
> (12 documented + **7 client-only**) plus the `servicehire` gateway prefix — and, for the 8 families both
> lanes see, **materially divergent per-family counts in both directions**.

**Documented families** (`api: raw/endpoint-catalog.md` + `docs: raw/doc-map.md` · `docs-reconstructed` ·
medium; the resource *names* are extracted mechanically from the endpoint slugs, so the entity list is
solid even where the schemas were not fetched). The **live** column is the count of paths the shipped
`wx-navbar`/`wx-copilot` generated clients actually call (`bundle-string-mine` · medium):

| Service | Docs | Live client | Entities |
| --- | --- | --- | --- |
| `serviceorganizations` | 60 | **121** | **Company**, **Brand**, **EIN**, **CompanyAttribute**, **CompanyAttributeSet**, **CopilotAuditLog** |
| `serviceworkforce` | 77 | **57** | **Worker**, **Job**, **Location**, **LocationGroup**, **LocationGroupTree**, **Opening**, **CustomAttribute**, + `audienceJobs` / `audienceLocations` / `audienceOpenings` read models |
| `serviceattendance` | 81 | 0 | **Shift**, **ShiftTag**, **Timesheet**, **TimeOff**, **WorkerRequest**, **Demand**, **AttendanceActivityLog**, attendance **GeneralSettings** (holiday / automatic-break / worker-request / timesheet-flag rules) |
| `servicetodo` | 57 | **12** | **TaskFlow**, **Task**, **AssignedTask**, **PartnerTask**, **W-4 profile** (+ the Copilot task-flow authoring lifecycle) |
| `servicepulse` | 43 | 0 | **Survey**, **QuestionBank**, **Participant**, **Theme**, **PulseSetting**, **DefaultNotificationTemplate** |
| `serviceemployment` | 39 | **14** | **EmploymentProfile**, **EmployerNote**, **LogNote**, **Tag** (W-4 / I-9 document assignment; profile rehire/restart) |
| `servicepool` | 28 | **50** | **Talent**, **Audience**, **UnifiedJob** (+ Copilot-authored audiences, + vector job-matching) |
| `servicemedia` | 19 | **10** | **StoredFile**, **SignDoc** (presigned upload; `edm` / `attachments` / `csvimports` buckets) |
| `servicesecurity` | 16 | **113** | **ApiKey**, **OpenSignup** (+ impersonation & OAuth token processes) |
| `servicecompliancev2` | 16 | 0 | **DocumentType** (incl. **`ai-documenttypes`**), **DocumentSubmission**, **Requirement**, **WorkerComplianceProfile** (Atlas Search-backed) |
| `servicereferral` | 14 | 0 | **ReferralCampaign** |
| `servicestaff` | 11 | **3** | **Employer** (delete-with-slot-reassignment — a staffing/slot model) |

**Client-only families — seven services the published docs never mention** (`_shared/api-path-catalog.md`
§Addendum · `bundle-string-mine` · medium; **single-lane, so the entity reads are tentative** — the path
slugs are verbatim, the entity naming is inferred from them):

| Service | Live client | Entities (inferred from path slugs) |
| --- | --- | --- |
| `serviceauthorization` | **27** | **Role** (+ templates, `from-template`, default-employer-role), **Permission**, **Matrix**, **AuthzSetting**, external-role sync, `is-authorized` check, per-company/enterprise role-permission init, **SelfServeFirstEmployerClaim** (+ a **`kybStatus`** — a KYC/KYB check on self-serve signup) |
| `serviceintegrations` | **26** | **DataPipeline** (+ `Events`, `Mappings`, field discovery, JSON-path detection, file parse/transform/preview, one-time import), **Automation** (+ per-automation analytics), **SCIM** |
| `servicesupport` | **18** | the Support product's ticket/workflow backend (navbar `Support` → `/support/tickets`, `/support/workflows`) |
| `servicemessaging` | **5** | worker/employer messaging transport |
| `servicescheduler` | **3** | WX-side scheduling |
| `servicesegmentation` | **3** | audience/worker segmentation (`/settings/segments` in the nav catalog) |
| `servicecommunicate` | **3** | **CampaignTemplate** — the backend of the `Communicate` product (`/communicate/campaigns`) |

**Three readings of the divergence, none of them "the docs are wrong":**

1. **`serviceauthorization` is the single most consequential omission.** A 27-path RBAC service —
   roles, permissions, matrices, role templates, an `is-authorized` check — exists in production and is
   **entirely absent from the published API**. The authorization model an integrator can express is
   therefore strictly narrower than the one the product runs on (this is the concrete mechanism behind
   the "no shared scope vocabulary" asymmetry noted under §Auth & tenancy below).
2. **Where live ≫ docs (`servicesecurity` 16→113, `serviceorganizations` 60→121, `servicepool` 28→50),
   the published surface is a deliberate subset**, not a stale document: these are the services holding
   impersonation, tenancy and CRM internals.
3. **Where live ≪ docs (`servicetodo` 57→12, `serviceworkforce` 77→57, `serviceemployment` 39→14) — and
   for the four families at live-0 (`serviceattendance`, `servicepulse`, `servicecompliancev2`,
   `servicereferral`) — this is a *client-scope* artifact, not evidence of absence.** The two mined
   artifacts are a **nav bar** and a **Cue copilot panel**, not the Shift / Pulse / Compliance product
   UIs; `servicetodo`'s 12 live paths are scoped entirely to `i9Profiles`. **A live-0 count here is a
   statement about which client was mined, never about the service.** (Same discipline as the
   `servicepulse` "no UI surface" resolution below.)

**Counting note (a range, not a conflict — same-artifact rule).** "12 microservices" and "19 families"
are not in conflict: 12 is the *documented* count and 19 is the *documented ∪ client-observed* count.
Prefer **"at least 19 `service*` families in production, of which 12 are publicly documented."**

### The seam between the two spines

`Applicant → Worker` is bridged by exactly two documented mechanisms, both in the legacy Hire lane:
`POST /v2/workers/{id}/activate` / `deactivate` and the four `Posthire*` webhook event types
(`PosthireWorkerActivation`, `PosthireWorkerDeactivation`, `PosthireDataCollectionApproval`,
`PosthireDocumentUploaded`) (`api: raw/webhooks.md` · `docs-reconstructed` + verbatim OpenAPI enum ·
medium-high). Hire v2 also exposes a thin `GET /v2/workers` / `{id}` read of the WX-side worker. **The
platform is joined at a narrow waist**, not modelled as one entity — a structural finding, and the
clearest artefact of a suite assembled from two product generations.

### Spine 3 — the app-own entity set (recruiter console only, no published equivalent)

Recovered from the generated API client (`deployed-client-bundle: _shared/api-path-catalog.md` ·
`source-map-reassembly` · **high**) — entities that exist **only** inside the product:

**SourcingPurchase**, **SourcingChannel**, **VonqContract**, **IndeedCampaign**, budget/spend
recommendation objects (52 paths); **ChatbotSettings**, **AutomatedResponse** / **AutomatedResponseModel**,
**ChatbotLog**, **Intent** (29 paths); **Agent** / **RX agent** / thread-signature objects (11 paths);
**AIBuilder workflow chat** (2 paths); **OfferLetterTemplate**, **OfferLetter**, offer-letter
**Field**/**Condition** (workflow-editor + `/internal_api/offer_letters`); **ApprovalRule**,
**ApproverGroup**, **OpeningApproval** (12 paths across two generations of the approvals feature);
**CustomerAttribute** (`attribute_types` / `attribute_values` / `attribute_entities`); **Event** /
**EventRoster** (hiring events); **Calendar** / **AvailabilityRule** (Cronofy); **CareerSite** brand
configuration, positions, categories, experience levels; **MergeKey**; **CustomTerminology**
(translation); **Concept** (standard-attribute mapping); **NotificationPreference**;
**OAuth2Configuration**; **DuplicateApplicantSetting**; **ApplicantSearchSetting**; **WhatsApp
MessageTemplate**; plus the entire **candidate-portal** entity set (39 paths: application forms,
`i9_forms`, `background_checks`, `schedule_slots`, `video_recordings`, `applicant_signatures`,
`worker_token`, `authorized_representatives`).

### Three findings the entity model makes visible

1. **Two distinct "workflow" engines share one marketing word.** Hire's *Workflow* is a **stage graph**
   attached to a Funnel/Opening (`/v2/workflows`, `/internal_api/workflow_editor/funnels/{slug}/stages`);
   WX's *TaskFlow* is an **onboarding task sequence** (`/api/servicetodo/taskflows`). Different services,
   different generations, different editors — and both surface to the user as "workflows"
   (`api`+`bundle`, two independent lanes agreeing on the structural split → **fact**).
2. **Custom-attribute modelling is quadruplicated.** Hire *CompanyAttributes* + *DataKeys* + *OptionBanks*
   (`/v2/*`), WX *customAttributes* (`serviceworkforce`) and *companyAttributes*/*companyAttributeSets*
   (`serviceorganizations`), and the console's own *customer_attributes* + *merge_keys* + *concepts*
   (standard-attribute mapping) are four parallel metadata systems. The console's `/standard_attributes`
   route is gated on the flag `fountain-concept-mapping` (`bundle: raw/route-table.md` · high) — i.e.
   Fountain is **actively building a mapping layer to unify them**, which is the strongest available
   evidence that the fragmentation is real and known internally.
3. **Two distinct "audience" concepts.** `servicepool/audiences` (talent-CRM segments, incl.
   Copilot-authored) vs `serviceworkforce/audience{Jobs,Locations,Openings}` (read models). The console
   bridges them at `/internal_api/wx/pool/create_campaign_from_hire` and
   `/internal_api/sourcing/sourcing_purchases/pool_audiences` — a Hire→Pool campaign hand-off that exists
   in the product but has no published API equivalent.

### Identifier conventions (three, one per generation)

Hire v2 uses `{id}` / `external_id` / slugs; the `service*` fleet uses `uuid` / `{identifier}`; the
console's own API mixes `{external_id}`, `{*_slug}`, and `{account_slug}` (`api: raw/endpoint-catalog.md`
+ `_shared/api-path-catalog.md`). An integrator crossing the Applicant→Worker seam must map identifier
schemes as well as entities.

---

## Integration surface

### SDK / packages — **none, confirmed absent**

Fountain publishes **no official client library in any language** (`packages: _summary.md` ·
`registry-metadata` · **high**). This is a gold-standard absence, not an unlucky search: 23 direct npm
registry GETs (unscoped + `@fountain/*` scoped) and 14 direct PyPI GETs, all 404 except three verified
unrelated namesakes (a 2012 personal OSS project predating the company; a screenplay-markup parser; an
XRP-Ledger stablecoin SDK whose `author_email` coincidentally reads `support@fountain.com` but whose every
other field contradicts ownership). Independently corroborated by `codebase: _summary.md` (`inferred` ·
high — no GitHub org, marketing site links no repo anywhere) and by the docs' own silence: a grep of the
full `llms.txt` index for `sdk|client librar|npm|pypi|pip install|package|library` returns **zero hits**,
and both API-overview pages are curl-only. **The published integration surface is REST-and-curl, full
stop.**

### REST / HTTP catalog — 575 published endpoints across 14 prefixes, two OpenAPI documents, no served spec

| Property | Value | Anchor |
| --- | --- | --- |
| Documented endpoints | **575** (+19 guide pages) across **14 path prefixes** | `api: raw/endpoint-catalog.md` · `docs-reconstructed` · medium |
| Single served spec file | **None.** `openapi.json`, `swagger.json`, `/api/openapi.json`, `.well-known/api-catalog` all 404 (the last re-tried with `Accept: application/json`) | `api: raw/openapi-digest.md` · direct probe · **high** (negative verified) |
| What *is* verbatim | **Every individual ReadMe reference page embeds a complete per-operation OpenAPI 3.0 JSON fragment** (visible via the page's `.md` mirror). 41 of 575 were fetched and inspected | `api: raw/openapi-digest.md` · `openapi-verbatim` · **high** for those 41 |
| Distinct OpenAPI documents | **Two**: `"Hire Public API" v2` (3.0.1, `servers: api.fountain.com`, `securitySchemes.ApiKeyAuth = X-ACCESS-TOKEN`) and `"Worker Experience Public API" v1.0.0` (3.0.3, `servers: services.fountain.com`, `securitySchemes.jwt = http/bearer`) | `api: raw/openapi-digest.md` · verbatim · **high** |
| Protocol | REST only — **no GraphQL, no gRPC, no tRPC** anywhere in 575 published paths or **766** app-own paths (300 recruiter-console + 466 WX service-tier) | `api` + `bundle`, two independent lanes → **fact** |

**Envelope / pagination / errors split cleanly along the two generations** (`api:
raw/rate-limits-and-pagination.md` · `docs-reconstructed` + verbatim schema · medium-high):

| | Hire v2 (legacy monolith) | `service*` (LoopBack fleet) |
| --- | --- | --- |
| Pagination | `?page=N` + a `Pagination{first,last,previous,current,next}` object **and** an opaque `pagination.next_cursor` on the same endpoint (cursor positioned as the escape hatch — deep page-number paging is capped "for performance reasons") | `filter[limit]` / `filter[skip]` offset paging via the LoopBack filter DSL; a **separate** `/<resource>/count` sibling endpoint rather than a query flag |
| Filtering | conventional query params | `filter[where][field][op]=value` (`eq`,`gt`,`gte`,`lt`,`lte`,`ne`,`in`,`nin`), `filter[fields][x]=true` projection, `explode:true, style:deepObject` |
| Success envelope | flat resource JSON | `{data, meta}`; `meta` = `timestamp, verb, path, jti, rid, count, status, duration, size` — **server-side APM surfaced in the public response** |
| Error envelope | `{"error": {"msg","name"}}` (+ a narrower `{"message"}` for auth) | JSON:API-style array `[{rid,status,code,title,detail,meta}]` |
| Rate limit | **120 req/min** per key; `X-Api-Ratelimit-{Limit,Limit-Remaining,Reset}` headers; 429 body `{"error":{"name":"exceeded_rate"}}` | **undocumented** — no rate-limit page found for any `service*` service. Recorded as a documentation gap, *not* as "unlimited" |
| Deprecation | RFC 8594 `Sunset:` + `Link: rel="sunset"` headers (the deprecations table itself was empty at capture) | not observed |

Two documented rate-limit mitigations are worth noting as commercial tells: a **secondary API key doubles
the limit**, and a **single-tenant hosting plan raises it** — i.e. throughput is partly a packaging lever.
The FAQ also states plainly that **bulk APIs are "in the process of being built"** — an explicit,
first-party admission of a current gap for large-dataset integrators (`api:
raw/rate-limits-and-pagination.md` · medium).

### A third published surface: the partner `v1` API

`partners.fountain.com` is a **separate ReadMe docs site with its own `llms.txt`** documenting a
partner-scoped `v1` API (`/v1/partners/{id}/applicants/{applicant_id}/...`) — update partner-specific
labels, create applicant status, create/batch-update applicant details, retrieve/update a partner record,
retrieve/post-event to an assigned partner task (`docs: raw/integrations-partners.md` · `crawl-clip` ·
medium; 14 pages indexed, individual pages **not** fetched verbatim). **Four API generations coexist in
production** (updated it. 2): Hire `v2`, Fountain One `service*`, partner `v1`, and — found only via the
live Hire MCP catalog, documented nowhere — **`/api/go/{v1,v2}`** ("Hire Go"), ≥56 operations
(§MCP below). Three of the four are published; `/api/go/*` is not.

### Webhooks — five subsystems, four notification + one synchronous decision gate

Fountain has **no single webhook product**; webhooks are configured in at least five places with
different payload shapes, key conventions, signing schemes, and SLAs (`api: raw/webhooks.md` +
`docs: raw/webhooks.md` · `docs-reconstructed` + verbatim OpenAPI enum · **medium-high** — the 14-event
enum itself is verbatim):

1. **Hire Screening / Post-Hire webhooks** — 14 event types (`Webhooks::Settings::ApplicantSave`,
   `ApplicantStateChange`, `Transition`, `CheckrStatus`, `OnfidoStatus`, `FunnelSave`,
   `HiringGoalChange`, `PartnerStatus`, `FileStatus`, `PosthireDataCollectionApproval`,
   `PosthireWorkerActivation`, `PosthireWorkerDeactivation`, `PosthireDocumentUploaded`, `LocationSave`).
   HMAC-SHA256 signed via **`X-OBIQ-SIGNATURE-V2`**, keyed by **the account's own Hire API token** — a
   notable coupling: rotating the API key silently rotates webhook-signature verification. 2 retries,
   auto-disable after 10 failures in 24h, **15 static egress IPs** documented for allowlisting.
2. **Automation Webhooks** (no-code automation builder) — customer-chosen HMAC signing key **or** a custom
   `Authorization` header (`Basic`/`Bearer`). The customer picks Fountain's outbound auth scheme.
3. **Custom Attribute Webhooks** — fire on any worker custom-attribute change; a distinct
   `{previousState, newState}` envelope; a **hard 3-second response SLA** (vs. the legacy system's
   "process async" advice — a genuine implementation-boundary tell).
4. **Universal Tasks Webhooks** (Onboard flow builder) — fire on task completion / flow end; a **third**
   custom-attribute key convention (human-readable label, not UUID).
5. **External Processing URL (compliance)** — **not a notification webhook**. Fountain **blocks** on the
   response and the partner may **override** the auto-approve decision. Request carries `storageUuid`,
   `glareFree`, `inFocus`, `aiConfidenceLevel`, `manuallyEdited`, `fields[]`, `submittedByType`,
   `workerUuid`, `documentTypeUuid`, `isAutoApproved`; required response `{forceAutoApprove,
   forceManualReview}` with `forceManualReview` winning on conflict and `{false,false}` deferring. The
   docs proactively warn about the fail-open footgun.

The `WebhookSetting` schema itself is verbatim (`docs: raw/api-reference.md` · `openapi-verbatim` · high):
`type` (one of the 14), `url`, `disabled`, `authorization_method` (`no_auth | simple | oauth`),
`authorization_header`, and **`send_secure_data`** — an explicit per-webhook opt-in to include PII in the
payload.

**Cross-lane corroboration:** the docs' "Automation Webhooks let you supply a custom `Authorization`
header" ↔ the console's `/internal_api/oauth_2_configurations` (3 paths) behind the feature flag
`oauth2-webhooks` and the `/oauth_configuration` route (`bundle: raw/route-table.md` +
`_shared/feature-flags.md` · high). **Two independent lanes** → the OAuth-authenticated outbound-webhook
capability is stated as **fact**.

### Embed / iframe surfaces (the integration primitives that are not REST)

- **Worker-portal embed** — `GET /api/servicesecurity/processes/workers/{workerUuid}/impersonate` mints a
  **60-minute** authenticated URL (optionally `&next=/task-flow/{FLOW_UUID}`) for iframing in a partner's
  native app; on expiry the worker is bounced to an **out-of-app** email re-auth link (a real limitation
  for a fully-embedded experience) (`docs: raw/integrations-partners.md` · medium).
- **Partner Tasks** — a partner's own workflow becomes a step inside a Fountain Onboard task flow: an
  iframe URL with templated variables, auto-appended context params (`wxWorkerUuid`, `wxAssignedTaskUuid`,
  `wxTaskFlowUuid`, `wxCompanyUuid`), an "end event" the portal listens for to auto-advance, an optional
  admin-review gate, and a status push-back (`taskStatus: ready → inProgress → completed/error`).
- **Custom form → portal handoff** — `POST /v2/applicants` server-side returns `portal_url`; redirect the
  candidate there. UTM params pass through as arbitrary `data` fields (no special handling).
- **Custom Integrations pattern** — the documented "wire Fountain to anything" recipe is
  *webhook fires → third party acts → `PUT /v2/applicants/{id}/labels/{label}` → stage auto-advances when
  all labels are checked*, plus a PUT-then-filter path for conditional rejection. **There is no formal
  rules DSL** in the published surface: the entire integrator-facing "workflow scripting" model is stage
  graph + labels + filters + API calls.

### Named connectors — thinner than the marketing implies

`docs: raw/integrations-partners.md` (medium) records: **Slack is Zapier-mediated only** (no native
Fountain Slack app or OAuth integration documented), and **"Sync with your HRIS" is a two-paragraph DIY
webhook pattern** with **no named or certified HRIS/payroll connector** (no Workday, ADP, UKG, or Paycom
integration page in the 593-page index). This **conflicts** with `website: raw/products.md` (`crawl-clip`
· medium), which names ADP (Workforce Vantage), Workday, UKG and SAP among integration partners.
**Flagged, not averaged.** Per the independence rule `website` and `docs` are not independent for feature
claims, so this is one source disagreeing with itself across surfaces; the *technical* reading — that no
certified connector is **documented for integrators** — is the better-evidenced side, and the marketing
claim is rendered **tentative**. (`website` itself flags a possible WebFetch clipping gap on
`/integrations`, which is the competing explanation; a re-clip would settle it.)

### MCP / agent-tooling surface — **two** live MCP servers (confirmed), plus an agent-aware doc pipeline

> **CORRECTION (Mode-5 iteration 1, 2026-08-09).** This section previously stated **"no live MCP server
> exists."** That is **superseded**. Mining the previously-unfetched `wx-copilot.umd.js` micro-frontend
> revealed a per-tenant `dataMcpBaseUrl` map, and a read-only unauthenticated probe of the production
> host **confirmed a live MCP server**. Per `evaluation.md`'s tiebreaker (direct observation outranks
> inference — and outranks a negative probe of the *wrong* hosts), the earlier negative is corrected, not
> averaged. The prior negative was **correct for the 6 paths it tried** (`app.` / `services.` /
> `developer.fountain.com`, all guessed from the docs' `exposeAsMcpTool` tag); it never had this host,
> which is discoverable only from the client bundle.

**A live MCP server is confirmed** at `https://data-mcp-production-us-east-1.fountain.com/mcp` —
`serverInfo: {name: "fountain-data-mcp", version: "1.27.2"}`, protocol `2025-06-18`, responding
**unauthenticated** to `initialize` + `tools/list` with **6 fully JSON-Schema'd tools**
(`deployed-client-bundle: raw/wx-micro-frontends.md` §2d · **live unauth probe · high** — a direct
runtime observation, the only one in this run; no tool was invoked, no query executed, no data read):

| Tool | What it does |
| --- | --- |
| `list_cubes` | lists all **Cube.js** semantic-layer cubes/views (name, title, measure/dimension counts) |
| `get_cube_detail` | full cube metadata (measures/dimensions/segments), TOON-encoded |
| `execute_cube_sql_v2` | runs a Cube.js semantic query against **ClickHouse**, server-side dataset caching (materializes to Parquet, returns a `dataset_id` — "no row data enters the calling context") |
| `execute_raw_sql` | caller-supplied raw ClickHouse SQL **"with RBAC applied"**; its `product` param docstring routes `"hire"` → **`FDEPLOY_RULES`** and all WX products (onboard, shift, …) → **`FDEPLOY_RULES_WX`** |
| `query_dataset` | follow-up SQL/structured queries against a cached dataset |
| `list_datasets` | cached datasets for the current conversation thread |

Surrounding client evidence, same artifact (`bundle-string-mine` · medium): `wx-copilot` embeds a real
MCP **client** — the standard protocol-version negotiation list, Anthropic Messages-API-shaped
`server_tool_use`/`mcp_tool_use` content blocks, and **four distinct MCP base-URL request headers**
(`x-wx-mcp-base-url`, `x-hire-mcp-base-url`, `x-data-mcp-base-url`, `x-fountain-ai-mcp-base-url`) — i.e.
the architecture contemplates **four** MCP servers, **of which this run has now confirmed two live**
(`data` and `hire` — see the next sub-section). The `dataMcpBaseUrl` map carries dedicated per-tenant
overrides for `aimb` (Aimbridge) and `ups` — a third independent confirmation of those two named
enterprise custom-deploy tenants.

### A SECOND live MCP server — the Hire tool surface (Mode-5 iteration 2)

> **This closes the "is any MCP surface the `exposeAsMcpTool` Hire surface?" question with a direct
> observation.** Iteration 1 left three of the client's four declared MCP base-URL headers unprobed and
> recorded the *narrowed* question as open. Iteration 2 probed them (read-only, unauthenticated,
> `initialize` + `tools/list` **only**; no tool invoked, no argument supplied, nothing executed).

**`https://mcp.fountain.com/` — `fountain-hire-mcp-server` v1.0.0** (`live unauth probe · high`):

| Property | Observed value |
| --- | --- |
| Transport | **streamable-HTTP**: `POST /` returns `text/event-stream`; `GET /` is the SSE stream (`409 "Conflict: Only one SSE stream is allowed per session"`). `POST /mcp`, `GET /sse`, `POST /messages` all 404 — the server is mounted at the **root**, not `/mcp` |
| `initialize` | `protocolVersion 2025-06-18`, `capabilities: {tools:{listChanged:true}}`, `serverInfo: {name: "fountain-hire-mcp-server", version: "1.0.0"}` |
| `GET /health` | `200 {"status":"healthy","server":"fountain-mcp-server","version":"1.0.0",…}` — **the health endpoint reports the generic name, the MCP handshake the specific one**; a single Express process (`x-powered-by: Express`, `access-control-allow-origin: *`) behind Cloudflare |
| `tools/list` | **200 — 127 tools, unauthenticated, no cursor (complete list)** |

**All 127 tools carry `_meta.apiTags` including `"exposeAsMcpTool"`.** This is the missing link: the
OpenAPI tag the `api` dimension found baked into the docs build pipeline is **the same tag that selects
which operations become MCP tools on a live server.** The catalog spans four path families:

| Family | Tools | Note |
| --- | --- | --- |
| **`/api/go/v1` + `/api/go/v2`** ("Go API") | **56** | **A wholly new, previously-uncataloged published API family** — absent from the 575 documented endpoints *and* from all 766 app-own paths. Dashboards (counts, upcoming interviews, video reviews, interview feedback, shared/org-wide variants), applicants, funnels, users, UAS (recurring availability schedules), calendars, WhatsApp templates, labor-union codes. This is the API behind **"Fountain Go" / Hire Go** — the `hire_go` nav destination whose product surface this run had otherwise only seen as a redirect stub |
| `/internal_api/sourcing/*` | **28** | The paid-sourcing engine — the same family the published API does **not** expose. It *is* exposed here, agent-callable |
| `/v2/*` (Hire public) | ~15 | Applicants (list/get/create/update/advance/delete), Locations, Positions, Funnels — exactly the "core-entity primary operations" curation the `api` dimension inferred from its 36-page sample |
| `getTools*` / `postTools*` | **21** | A curated **agent-composite** layer above the REST mapping: `postToolsApplicants` ("search/find by name, email, phone"), `postToolsWorkflowEditorStages`, `postToolsUsers`, `postToolsAvailabilityManagement`, `getToolsLlmContext` ("stage schemas and custom data keys"), `postToolsHireGoUrl` (deep-link resolver), `postToolsAiRecruiterJobs`, `getToolsDashboard`, `postToolsSignatureTemplates`, `postToolsPartnerIntegrations`, `postToolsMessageTemplates`, `getToolsWorkflowTemplates`. **These are hand-authored agent tools, not generated REST wrappers** — the strongest evidence in the run that Fountain built a deliberate agent-tool product layer |

**Tool-schema conventions observed** (each tool is a full JSON-Schema draft-07 object): inputs are
namespaced into `pathParams` / `queryParams` / `bodyParams`; every tool additionally requires a **`uiMeta`
object with `label` ("User-facing one-sentence non-technical summary of what you're doing with this tool
call and why") and `actionType: create|delete|update|view`** — i.e. the agent must *narrate its own action
to the user*, and the UI picks an icon from the declared action type. Tools carry MCP `annotations`
(**73 `readOnlyHint: true`, 4 `destructiveHint: true`**) and `execution: {taskSupport: "forbidden"}` on
all 127 (no long-running/task-mode calls). `_meta` also carries `outputSchema`, `inputExamples`,
`usageInfo`, and an `exposeAsPromptContextTool` boolean — the client-side counterpart named in
`wx-copilot`'s `exposeAsPromptContextTool` API.

**What this does and does not establish — stated precisely, because it is a strong claim:**

- **Establishes:** a second, distinct, live MCP server exists; it is the **Hire** one
  (`x-hire-mcp-base-url`); it serves the `exposeAsMcpTool`-tagged Hire operations; its **tool catalog is
  readable without authentication**; and it reveals a previously-unknown `/api/go/*` published API family.
- **Does not establish:** that any tool *executes* unauthenticated. **No tool was invoked.** The
  handshake and catalog are capability metadata; every tool declares path/query/body params that a real
  call would need, and the server may well reject an uncredentialed `tools/call`. **Whether it does was
  deliberately not tested** — invoking a tool is a state/data action outside the read-only boundary.
- **Does not establish** that this server is *customer*-facing in the sense of being a documented,
  supported developer integration surface: it is undocumented in all 593 reference pages, and its most
  likely first-party consumer is Cue itself (`wx-copilot` sends `x-hire-mcp-base-url`). What is now
  **fact** is that Fountain's Hire domain is agent-callable over MCP in production.

**Two of the four declared MCP hosts remain unlocated.** `x-wx-mcp-base-url` and
`x-fountain-ai-mcp-base-url` were **searched for and not found**: a 16-candidate DNS sweep
(`wx-mcp`, `wx-mcp-production-us-east-1`, `ai-mcp`, `fountain-ai-mcp`, `mcp-wx`, `mcp-ai`, `cue-mcp`,
`copilot-mcp`, … `.fountain.com`) returned **NXDOMAIN on every candidate**, and certificate-transparency
enumeration cannot help here — Fountain serves a wildcard `*.fountain.com` certificate, which is exactly
why `mcp.` and `data-mcp-*` never appeared in the 144-name CT inventory either. **Recorded as
artifact-scoped, per ingestion §7 rule 10: these two hosts are absent from the candidate names probed,
not shown to be absent.** (One incidental DNS finding: `data-mcp-staging-us-east-1.fountain.com` resolves
to the same Cloudflare pair — a staging twin of the confirmed data server. **Not probed**; a staging
surface adds nothing a production one has not already shown.)

**Two things the *data* server alone did NOT establish (superseded in part by the above):**

1. ~~The confirmed server is an internal analytics server, not shown to be the `exposeAsMcpTool` Hire
   surface.~~ **Superseded (it. 2):** that surface exists and is live at `mcp.fountain.com`. The
   `fountain-data-mcp` characterization itself stands — it *is* the Cube.js/ClickHouse analytics server —
   but "no MCP server serves the Hire domain" is now refuted.
2. ~~The other three header-implied hosts were not probed.~~ **Partly closed (it. 2):** `hire` found and
   probed; `wx` and `fountain-ai` searched by DNS candidate sweep and not located.

Separately, `execute_raw_sql`'s own docstring is **independent, database-layer corroboration of the
Hire-vs-Worker-Experience two-application split** documented throughout this rollup — a third lane
agreeing with the nav-config and CT-log/Helm evidence.

Alongside the live servers, the docs-side pipeline is agent-aware: a subset of Hire v2 operations
carries an extra OpenAPI tag,
`"tags": ["Applicants", "exposeAsMcpTool"]`. A bounded 36-page stratified sample of the 108-endpoint Hire
v2 family found **10/36 (28%) tagged**, and the tagging is **curated, not automatic** — it targets
*core-entity primary operations* (list/create/get/update/delete on **Applicants, Locations, Positions,
Funnels**) and explicitly skips sub-resource and process operations (notes, documents, exports,
activation, webhook settings, slot confirmation).

**The tag is now traced end-to-end, across three independent artifacts (it. 2) → fact.** It appears (a)
as an OpenAPI `tags` entry in the served docs, (b) as `_meta.apiTags` on **all 127 tools** of the live
`fountain-hire-mcp-server`, and (c) as the `exposeAsMcpTool` literal in `wx-copilot`'s client code.
`exposeAsMcpTool` is not a documentation curiosity — it is **the build-pipeline switch that promotes an
endpoint to an agent-callable MCP tool.** Its **Hire-only scope is also now well evidenced**: absent on
the two `serviceworkforce` operations the `api` dimension sampled, and absent on **all five** additional
`service*` reference pages fetched in iteration 2 (attendance, pulse, todo, organizations, pool) — **7 of
12 documented WX families checked, zero hits**, against 127 live Hire tools. Separately,
`developer.fountain.com/.well-known/agent-skills/index.json` serves a genuine `schemas.agentskills.io`
discovery manifest — but it is a single "read-the-docs" pointer skill, **not a tool catalog**; the real
tool catalog is the live `tools/list` above.

Two calibration notes, both recorded by the collector and worth preserving: the tag's prevalence across
the remaining 5 unchecked `service*` families is still **unsampled** — no full-catalog percentage is
claimed — and the `reservedWords.tools` block visible in ReadMe page hydration data is **ReadMe's own
platform feature**, not a Fountain artifact.

### Realtime / wire protocol — **presence only; zero frames observed**

Two independent dimensions place a realtime vendor in the stack: `infra-backend-fingerprint:
raw/security-headers.md` finds **Pusher (4 regions)** in `app.fountain.com`'s report-only CSP
(`dns-ct-fingerprint` · medium), and `deployed-client-bundle: raw/env-config.md` finds
`REACT_APP_PUSHER_*` env-var **field names** (values redacted) (`source-map-reassembly` · high). Two
independent lanes → **Pusher's presence in the client stack is a fact**. `OneSignal` (web push) appears
in both lanes the same way.

**Everything past presence is unobserved.** No channel naming convention, no event catalog, no frame
shape, no evidence any socket ever opens — because no session ran. Per the realtime-trap discipline in
`tradecraft.md` §2.4 this is a **recorded gap, not a "REST-only" finding**: this run cannot distinguish
content-streaming from cache-coherence-ping, nor rule out additional channels. A single Pass-1 session
with the WebSocket + Pusher `bind_global` taps would close it entirely.

---

## Published-vs-app-own API diff

**Both lanes are present, and they are near-totally disjoint.** This is the headline structural finding
of the target.

> **What each lane actually is — and the one substitution this run made.** `evaluation.md` template 3
> specifies the app-own lane as *the pre-nav in-page fetch/XHR tap* (session-observed paths). **That lane
> is absent here.** In its place, `deployed-client-bundle` recovered the app's **generated API client**
> (`npm.api-clients.*.js`) from a live production source map and extracted every `url:` + `method:`
> literal verbatim. That substitution is a **strength on completeness and a weakness on liveness**: a
> generated client is a *complete declared inventory* of the operations it covers (better than a tap,
> which only sees what you happened to click), but it proves **nothing about which paths actually fire**.
> Read every "app-own" count below as **declared**, never **observed**.

| | **Published** developer API | **App-own** recruiter-console API |
| --- | --- | --- |
| Host | `services.fountain.com` (unified gateway) + legacy `api.fountain.com` / `<region>.fountain.com` / `<instance>.fountain.com` / `services.<instance>.fountain.com` | **two** origins: the recruiter console's **same-origin** `monolithOrigin` (`https://web.fountain.com` in prod) **and** the injected `wxServiceBaseUrl` / `hireAccountBaseUrl` origin the WX micro-frontends mount against (host not statically resolvable — a recorded gap) |
| Path families | `/v2/*` (Hire) · `/api/service{hire,workforce,attendance,organizations,todo,pulse,employment,pool,media,security,compliancev2,referral,staff}/*` | `/internal_api/*` (**267**) · `/api_self_serve/{v1,v2}/*` (**33**) · `/api/service*/*` (**466**, 15 client-consumed families) |
| Size | **575** documented endpoints, 14 prefixes | **766** unique paths — **300** / **358** method+path pairs (recruiter console) **+ 466** (WX service-tier, Mode-5 it. 1) |
| Auth | OAuth2 `client_credentials` Bearer, or legacy `X-ACCESS-TOKEN` | dual-tier JWT (`token_employer` / `token_enterprise`) from browser storage — **transport not live-verified** |
| Method / confidence | `docs-reconstructed` (41 rows verbatim; **`openapi-verbatim` retrievable per page — confirmed it. 2**, see §Count reconciliation) · medium | `source-map-reassembly` · **high** for the 300; `bundle-string-mine` · **medium** for the 466 |
| Overlap | **near-zero on the 300** (`/internal_api` ↔ published: disjoint); **substantial on the 466** — the WX service-tier paths are the *client-side counterpart* of the published `service*` families, which is what makes the per-family live-vs-documented diff above possible | |

### Operations the app has that the published API does not expose at all

Ranked by size (`_shared/api-path-catalog.md` · `## source: bundle` · high):

| App-own family | Paths | What a partner cannot reach |
| --- | --- | --- |
| `/internal_api/sourcing` | **52** | The entire paid-sourcing / ad-spend engine: budget recommendations, `suggested_target_budget`, `aggregate_spend`, `openings_at_risk`, `historical_conversion_data`, `sourcing_channels`, `sourcing_purchases` (+ accept/reject recommendation), VONQ contracts |
| `/internal_api/portal` | **39** | The whole candidate-facing portal surface: application forms, `i9_forms` (+ PDF), `background_checks` (+ invitation/status), `schedule_slots`, `video_recordings`, `applicant_signatures`, `worker_token`, `authorized_representatives`, funnel translation |
| `/internal_api/chatbot` | **29** | The AI chatbot / FAQ-bot: `automated_response_models`, intents, career-site scraping + knowledge-base refresh, widget chat/handoff, feedback logging |
| `/internal_api/workflow_editor` | **28** | The stage-graph editor internals: stage types, rule-stage types, `rules_edit_data`, offer-letter templates + field conditions, LMS content pickers (Lessonly / Northpass), `job_matcher_condition_options` |
| `/internal_api/agent_integrations` | **11** | An "**RX agent**" surface: `create_rx_agent`, `create_rx_thread_and_signature`, `publish_chat_agent`, `conversation_report`, `wx_i9_bot_thread_signature`, `fetch_access_token` |
| `/internal_api/career_site` | **9** | Career-site brand configuration, positions/categories/experience-levels, funnel-by-location search |
| `/internal_api/{opening_approval,approvals}` | **12** | Approver groups, approval rules + field catalog, pending requests (two generations, mid-cutover) |
| `/internal_api/{events,events_rosters,scheduler}` | **15** | Hiring events + rosters; Cronofy-backed calendar availability/booking |
| `/internal_api/job_boards` | **7** | Indeed campaign + prediction, VONQ funnel/product wiring |
| `/internal_api/ai_builder` | **2** | `workflow/chat` + `workflow/get_latest_message` — **the "Cue" AI workflow-builder conversation endpoint** |
| others | ~96 | message templates + WhatsApp usage stats, telephony `initiate_call`, merge keys, custom terminologies, concepts/standard-attribute mapping, notification preferences, OAuth2 webhook configs, duplicate-applicant + applicant-search settings, users_pack, option banks |

**The reading:** the published developer API is an **integration and data-sync surface**. Fountain's
*differentiated* capability — sourcing-spend optimization, the AI chatbot, the AI workflow builder
("Cue"), the agent/RX layer, the candidate portal — is **product-internal and not exposed to partners at
all**. That gap is the most decision-relevant fact in this document for a build-vs-partner call
(`api: raw/published-vs-app-own-note.md` + `_shared/api-path-catalog.md` · two independent lanes →
**fact**).

### Operations the published API has that the app-own catalog does not — a coverage artifact, now **positively confirmed** rather than argued

> **RESOLVED (Mode-5 iteration 1, propagated here in iteration 2).** This section previously *argued* that
> the enormous inverse list (essentially all 467 `service*` endpoints) was a coverage artifact rather than
> ~460 dormant routes, on the strength of three indirect tells. **Iteration 1 then fetched the WX
> micro-frontends and observed the client-side consumption directly: 466 `/api/service*` paths across 15
> families, called by shipped Fountain client code.** The argument no longer rests on inference — the
> WX-side client consumption is now an observed artifact.

The original three tells still hold, and now have a fourth, decisive one:

- The bundle mined at iteration 0 is **one product's console** — webpack app name `recruiter_ui` /
  `recruiter-ui` (`bundle: raw/route-table.md` · high). It is the **Hire** recruiter surface, not the
  Worker Experience surface.
- The console contains explicit **bridges** into a separate WX front-end: `/internal_api/wx/*` (8 paths,
  including `wx/pool/create_campaign_from_hire` and `wx/users`), a separately-deployed **`wx-copilot` +
  `wx-navbar` UMD micro-frontend pair** served from `ftn-shared-components.fountain.com` with per-tenant
  release channels, and `REACT_APP_WX_*` env vars (`bundle: raw/route-table.md`, `raw/env-config.md` ·
  high).
- `wx-navbar`'s mount contract takes **`wxServiceBaseUrl`** as an injected runtime prop — the second
  application has its own base URL and is wired into the same shared nav (`raw/wx-micro-frontends.md` §1a).
- **And the WX clients do call the `service*` fleet directly:** 466 paths across `serviceauthorization`,
  `servicecommunicate`, `serviceemployment`, `serviceintegrations`, `servicemedia`, `servicemessaging`,
  `serviceorganizations`, `servicepool`, `servicescheduler`, `servicesecurity`, `servicesegmentation`,
  `servicestaff`, `servicesupport`, `servicetodo`, `serviceworkforce`
  (`_shared/api-path-catalog.md` §Addendum · `bundle-string-mine` · medium).

So the corrected framing: **the published-vs-app-own diff is complete on the Hire side, and now
*partially* covered on the WX side** — two shared components (nav + copilot) of the WX application were
mined, but the WX product SPAs themselves (Shift, Pulse, Compliance, Referral, Onboard) were not. Four
documented families (`serviceattendance` 81, `servicepulse` 43, `servicecompliancev2` 16,
`servicereferral` 14) still show **zero** client consumption — and that is a statement about which
clients were mined, not about the services. The `api` dimension's open question — whether `servicepulse` /
`servicereferral` genuinely lack a UI surface — is now **positively resolved**: the `wx-navbar` product
catalog ships `Pulse` at `/pulse` (D0, children Dashboard / Checks / Settings) and `Referrals` at
`/referral` (D0, children Pipeline / Campaigns / Incentives / Settings) (`raw/wx-micro-frontends.md` §1b ·
`bundle-string-mine` · medium). **Both have first-class UI destinations; the recruiter-console miner
simply never reached them.**

### The lineage tell that explains the split

**Lane A** names a predecessor product three separate times — the `X-OBIQ-SIGNATURE-V2` webhook header
(`docs`/`api`), the `connecting-a-custom-form-to-the-onboardiq-applicant-portal` doc slug (`docs`), and
the Intercom help-centre workspace identifier `onboardingiq` (`docs: raw/help-center.md`). Those three
tells sit on **one artifact, so they count as one source, not three** (same-artifact rule). **Lane B,
independent,** finds it again in a different medium entirely: a regionally-sharded S3 bucket fleet
literally named **"OnboardIQ"** in the reassembled client source (`bundle: _summary.md` ·
`source-map-reassembly` · high). Corporate-registry corroboration closes it: Fountain's **legal entity is
OnboardIQ, Inc.**, a Delaware corporation (`website: raw/trust-security-ethics-legal.md` ·
WebSearch-secondary · medium). **Two independent lanes plus the registry ⇒ fact** (the same count
`technology-architecture.md` §6 uses): "OnboardIQ" is the platform's original identity, still
load-bearing in production infrastructure, webhook signing, and the corporate entity itself.

---

## Auth & tenancy model

### Published API — three coexisting schemes

(`api: raw/auth-model.md` · `docs-reconstructed` + verbatim `securitySchemes` · **medium-high**)

| Scheme | Mechanism | Scope | Status |
| --- | --- | --- | --- |
| **Fountain One OAuth2** (current default) | `POST services.fountain.com/api/servicesecurity/processes/apikey/oauth/token`, `grant_type=client_credentials`, HTTP Basic `client_id:secret` → **60-minute** Bearer. No refresh-token flow documented (re-mint via the same call). | **Personal keys** inherit the creating user's permissions; **Integration keys** are scoped to a role chosen at creation (the docs recommend least-privilege). Only one scope string observed: `employer`. | current |
| **Hire legacy key** | `X-ACCESS-TOKEN: <key>` — a **static, long-lived** credential on every request, no token exchange. **Primary + Secondary** pair, explicitly offered both as rate-limit doubling and as zero-downtime rotation. | Hire product only | fully supported, **not deprecated** |
| **Trusted Party key** | Same header, restricted to **create-applicant only** (cannot read/update/delete). Docs warn: server-side only. | third-party applicant ingestion | fully supported |

**The finer-grained authorization unit on the published API is the *role* attached to an Integration key,
not an OAuth scope claim** — no granular scope catalog exists in the docs. **Unresolved:** the docs show
both `Authorization: Bearer` (implied by `securitySchemes.jwt = {type: http, scheme: bearer}`) and a
literal `Application: Bearer AUTH_TOKEN` in one worked curl example. Almost certainly a docs typo, but
**this run cannot settle it** — it needs one live authenticated probe, and there was no session. Recorded,
not guessed.

**Impersonation as a first-class primitive:** `servicesecurity` mints 60-minute worker and employer
impersonation URLs. This is the sanctioned session-minting mechanism for embedded UX — and, for a
security reader, the most sensitive published capability on the platform.

### App-own — a dual-tier JWT in browser storage

(`bundle: raw/route-table.md` · `source-map-reassembly` · **high** for the storage model; the *transport*
is **not** verified)

`utils/wxJwtToken.js` stores JWTs under **`token_employer_<stage>`** and **`token_enterprise_<stage>`** in
**both localStorage and sessionStorage**; the JWT `aud` claim (`EnterpriseIdentity`, `SuperUser`) selects
which key is used — **two auth tiers sharing one token shape, disambiguated client-side by claim**. Sign-in
is `/users/sign_in` (a Devise convention; the source also references Rails-style validators), and a
legacy `containers/Auth_old/*` still ships alongside the current flow — a mid-migration auth system.

Mapped onto `tradecraft.md`'s auth-token-location taxonomy this is **token-in-localStorage** → **XSS-reachable**.
But note the honest limit: a JS-readable token does **not** prove Bearer transport. `/internal_api/*` is
**same-origin** with the app, so an httpOnly session cookie could equally be the real credential with the
stored JWTs serving the WX micro-frontends. `tradecraft.md` §2.26 exists precisely for this ambiguity —
probe Bearer vs cookie vs raw-token — and this run **could not run that probe**. The transport is
therefore **tentative**; only the storage model is fact.

### Tenancy — three mechanisms, and a documented consolidation

| Layer | Model | Anchor / confidence |
| --- | --- | --- |
| **Published API (current)** | **Tenant-agnostic URL.** `services.fountain.com/api/service*/...` for everything; "the authentication layer will automatically find the correct tenant and redirect" — tenancy resolved **server-side from the authenticated principal**, not the URL | `api: raw/tenant-model.md` · quoted verbatim from docs · medium-high |
| **Published API (legacy, still working)** | Four URL forms survive indefinitely: main (`api.fountain.com`), regional (`us-2.fountain.com`), single-tenant (`<instance>.fountain.com`), WX-dedicated (`services.<instance>.fountain.com`). The 2025-11-14 note makes the unified host "no longer required" — **explicitly not a breaking sunset** | `api: raw/tenant-model.md` · medium-high |
| **Web app** | `app.<tenant>.fountain.com` → monolith origin `https://<tenant>.fountain.com`; prod tenant `fountain` → `web.fountain.com`. Every authenticated route nests under `/:accountSlug` | `bundle: raw/route-table.md` · **high** |
| **Infrastructure** | **Per-tenant subdomains with paired sandbox twins**, recovered from CT logs: `aimbridge`, `amazon-na`/`amazon-us`/`ms-amazon-portal`, `brandsafway`, `ceracare`, `doordash`, `ontrac`, `staples`, each with a `sandbox.<tenant>` counterpart; plus multi-region hosts (`us-2/3/4`, `eu-1`, `ap-1`) | `infra: raw/dns-and-subdomains.md` · `dns-ct-fingerprint` · medium |

**Promotion:** the per-tenant subdomain model is asserted by `bundle` (client config, high) **and**
independently by `infra` (certificate-transparency logs, medium) — two independent dimensions, different
methods → **stated as fact**. The CT lane additionally names **Amazon, DoorDash, Staples, BrandSafway,
Aimbridge, OnTrac, CeraCare** as (current or former) tenants — customer identities recovered from
infrastructure rather than marketing.

**Deployment tiering is real, not just a URL scheme:** the client config bakes in two named enterprise
tenants — **`aimbridge`** (a dedicated Helm-provisioned "hire cluster", source comment cites
`apps/hire/helm/tenants/aimbridge-na/values.yaml`) and **`ups`** ("runs on shared infra") — each with a
matching feature flag (`aimbridge-hiring-goals-improvements`, `ups-functionality`) (`bundle:
raw/route-table.md` + `_shared/feature-flags.md` · high). Dedicated-vs-shared infrastructure is a
per-customer decision, and the WX-dedicated URL form (`services.<instance>.fountain.com`) is its
published-API counterpart — a plausible data-residency / compliance sales lever.

### Authorization inside the app — the `whoami`-gated capability model

The console's authorization surface is a single `whoami` object with **three distinct gate types**
(`_shared/feature-flags.md` · `## source: bundle` · **high** — grepped across 1757 reassembled first-party
source files):

1. **50 LaunchDarkly-style flags** — `whoami.feature_flags['<key>']` (e.g. `offer-approval-control`,
   `workflow-system`, `pool-in-hire`, `referral-product`, `custom-terminologies`, `audit-trails-display`,
   `embedded-docusign`, `zip-recruiter-integration`).
2. **27 boolean tenant-capability gates** — `whoami.<key>_enabled` (e.g. `ai_workflow_builder_enabled`,
   `cai_agent_enabled`, `fountain_ai_enabled`, `fountain_ai_faq_enabled`, `whats_app_enabled`,
   `workflow_editor_v2_enabled`, `opening_approval_enabled`, `looker_custom_reports_enabled`,
   `hiring_goals_v3_enabled`). These read as **commercial entitlement gates** — the SKU boundary
   expressed in code, and the closest thing to a pricing model this run recovered given
   `website: raw/pricing.md` confirms **no public pricing anywhere** (verified across 6+ locations).
3. **RBAC policy checks** — `policies.manage_account`, `policies.manage_user_groups`, plus a
   `/user_groups` management surface.

Two supporting facts: `looker_custom_reports_enabled` names **Looker** as the embedded BI backend (a stack
finding not visible on any other surface), and three **LaunchDarkly client-side IDs** ship in the bundle
(prod / dev / staging-fallback) — public-by-design identifiers that authorize flag *evaluation* only, with
a second, independently overridable ID reserved for the Cue micro-frontend. Infra corroborates the LD
dependency independently: **self-hosted LaunchDarkly relay proxies in four regions**
(`ld-production-{aps1,euc1,use1,use2}`) in the CT inventory (`infra: raw/dns-and-subdomains.md` · medium)
→ **two independent lanes**, so LaunchDarkly as the flag platform is **fact**.

**Note the asymmetry:** the app expresses authorization as flags + boolean entitlements + policies; the
published API expresses it as a role bound to an Integration key. There is **no evidence of any shared
scope vocabulary between them** — a partner's key cannot express "may manage sourcing spend," because
that capability is not in the published API at all.

---

## API-path diff (published-declared vs bundle-declared — the two lanes this run actually has)

Titled for the sources **actually run**. Of the four runtime lanes the seam rule contemplates
(bundle / session / wire / distribution), **exactly one produced rows**:

| Lane | Status | Rows contributed |
| --- | --- | --- |
| `bundle` | ✅ complete, `source-map-reassembly` · high (+ a Mode-5 it. 1 `bundle-string-mine` · medium addendum) | **766 paths total** in `_shared/api-path-catalog.md` under the single `## source: bundle` section: **300 paths / 358 method+path pairs** (recruiter console, source-map-reassembled) **+ 466** `/api/service*` paths across 15 families (`wx-navbar` 280 + `wx-copilot` 382, 196 overlapping) |
| `session` | ❌ **absent** (`auth:none`) | 0 — no `## source: session` section exists |
| `wire` | ❌ **folded** into `session` | 0 — correctly recorded as `status: folded`, not silently dropped |
| `distribution` | ❌ **absent** — no non-web client exists (4-way store + PWA sweep, all negative, high confidence) | 0 — and correctly contributed nothing rather than padding the catalog |

So the "N-way" diff is structurally **2-way and both sides are declarations**:

| | Source | Nature | Count |
| --- | --- | --- | --- |
| Published-declared | docs corpus (Lane A) | endpoint reference pages | 575 |
| App-own-declared (recruiter console) | generated API client, source-map-reassembled (Lane B) | `url:`/`method:` literals | 300 / 358 |
| App-own-declared (WX service-tier) | generated API clients inside `wx-navbar` + `wx-copilot` (Lane B′, Mode-5 it. 1) | `url:`/`method:` literals, string-mined | **466** across 15 families |
| Runtime-observed | — | — | **0** (app-own paths) |

> **One runtime observation exists, and it is outside this diff.** Mode-5 iteration 1 live-probed
> `data-mcp-production-us-east-1.fountain.com/mcp` (read-only, unauthenticated). That is a *different
> host and a different protocol* from either lane above — it adds no `/internal_api/*` or `/v2/*` row —
> so the diff below remains 2-way and declaration-only. It does mean the flat "zero live observations on
> this target" framing used elsewhere in the corpus carries this one exception.

**Three consequences, stated plainly rather than papered over:**

1. **No dormant/unshipped-route finding is available on this target.** The seam rule's payoff — "a path in
   the bundle but never in session/wire is a dormant route" — requires an observed lane. With zero observed
   rows, **nothing here shows any path is live or dead**. Every "declared" count is a floor for what the
   platform can do and says nothing about what it does.
2. **766 is a floor even for the app itself — and 300 was demonstrably one.** Mode-5 iteration 1 raised
   the app-own count by **155%** with two unauthenticated GETs, which is the sharpest available proof
   that a declared count from one client is a floor. The generated client is complete for the operations
   *it* covers, but the collector also found at least one hand-written call site outside it
   (`${REACT_APP_GLOBAL_API_BASE_URL_V2}/jobs/{jobId}/stages` in `app/requests/requests.js`), and the
   console's core applicant-list surfaces (`MasterApplicantsView`, `ApplicantsV2`) have no obvious
   corresponding list path in the 300 — consistent with server-rendered legacy Rails pages or an unfetched
   lazy chunk. Additionally **44 of 48 vendor chunks were not reassembled**, including the 772 KB
   `npm.fountain.*` first-party shared package (recorded gap, `bundle: _summary.md`).
3. **The seam file is correctly single-copy.** `_shared/api-path-catalog.md` holds exactly one
   `## source: bundle` section. The `api` dimension **declined to append** a `## source: api` section
   despite its dispatch brief instructing it to, on the grounds that ingestion §6's allowlist is
   `bundle | session | wire | distribution` only and a published-API surface is a cite-don't-append case —
   and it **flagged the deviation explicitly** rather than acting silently (`api:
   raw/published-vs-app-own-note.md`). **Evaluation's read: the collector was right.** The rule is
   specific, the reasoning matches the host-level-dimension precedent, and the citation preserved both
   lanes for this diff. Noted here so Mode 5 scores it as correct judgement, not as an unfollowed
   instruction.

### Count reconciliation (a range, not a conflict)

Per the same-artifact rule, divergences between `docs` and `api` over the one ReadMe corpus are reported
as ranges:

| Item | `docs` | `api` | Resolution |
| --- | --- | --- | --- |
| Pages in `llms.txt` | 593 | 594 | **range** — an off-by-one in link parsing over one file; immaterial |
| Endpoint vs guide split | 24 narrative + ~537 `service*` + 108 v2 | 575 endpoints + 19 guides | **range** — different classification cut-lines over one index; both agree on **~575 endpoint operations** |
| `service*` families | 12 named | "13 `service*` microservices" (family table lists 12 + `hire-v2` + `hire-api-v2-misc` = 14 prefixes) | **Resolved, not a conflict.** There are **12 Worker-Experience microservices** plus a **13th gateway prefix, `servicehire`** (`services.fountain.com/api/servicehire/v2/...`), which fronts the legacy Hire monolith rather than being a microservice. Both counts are right about different things. |
| Compliance service name | `servicecompliancev` | `servicecompliancev2` | **range** — a slug-truncation artifact; `servicecompliancev2` is the correct form (it appears in a fetched path, `post_api-servicecompliancev2-ai-documenttypes`) |

---

## Cross-dimension reconciliation

### Stated as fact (≥2 independent dimensions, or a verbatim machine artifact)

| Claim | Why it holds |
| --- | --- |
| **Two coexisting backend generations behind one gateway** (the *split itself*, and the Rails identification of the legacy side) — **not** a contradiction between dimensions | Lane A: two distinct verbatim OpenAPI documents with different `info.title`, `servers`, and `securitySchemes`; two error envelopes; two pagination styles. Lane B (independent): source comments referencing "Rails endpoints", a Ruby `ReviewQuestionnaire::Validator`, and the Devise `/users/sign_in` path. `infra` (third lane): `x-runtime` + `x-request-id` Rack/Rails headers on `api.fountain.com`. **Caveat carried consistently with `technology-architecture.md` §Reconciliation #1: the *LoopBack* identification of the new-generation fleet rests on Lane A alone** (the verbatim `filter[where][field][op]` grammar + LoopBack's autogenerated CRUD titles across all 12 services) — machine-derived and strongly evidenced, but **uncorroborated by an independent lane, so it is stated as high-evidence, not promoted to fact.** |
| **REST only — no GraphQL, gRPC, or tRPC anywhere** | Negative confirmed independently across 575 published paths (Lane A) and **766** app-own paths + the full reassembled client + both `wx-*` micro-frontends (Lane B/B′) |
| **Published API host ≠ app API host** (`services.fountain.com` vs same-origin `web.fountain.com`) | Lane A names the published host; Lane B recovers `monolithOrigin` from client config |
| **Near-total path disjointness between the published surface and the *recruiter console's* app-own surface** | Direct comparison of the two catalogs; no `service*` path shape appears anywhere in the 300 recruiter-console paths. **Scoped precisely (it. 2):** this does **not** generalize to the whole app tier — the WX micro-frontends' 466 `/api/service*` paths *do* share the published surface's path shape, and their per-family counts diverge in both directions (§Spine 2). "Disjoint" is a fact about the Hire console, not about Fountain's client tier as a whole. |
| **No official SDK in any language** | **Primary basis: `packages`' direct-registry sweep — 23 npm + 14 PyPI = 37 direct registry GETs, every hit disambiguated as an unrelated namesake (`packages: raw/registry-sweep.json` · `registry-metadata` · high).** Corroborated by `codebase` (no public org, no repo link anywhere — independent) and, non-independently, by Lane A's docs grep (`sdk\|client librar\|npm\|pypi\|pip install` → zero hits across the reference index). **Basis stated identically in all four rollups (it. 2 reconciliation):** the registry sweep is the finding; the docs grep is supporting, and its index is described as ~185–200 reference-page titles within the ~593-page corpus — **a range over one artifact, not a separate count.** |
| **TWO live MCP servers exist** — `data-mcp-production-us-east-1.fountain.com/mcp` (`fountain-data-mcp v1.27.2`, 6 Cube.js/ClickHouse tools) and `mcp.fountain.com/` (`fountain-hire-mcp-server v1.0.0`, **127** tools), both answering `initialize` + `tools/list` **unauthenticated** | Two direct read-only runtime probes, verbatim machine artifacts (it. 1 and it. 2). **Supersedes the earlier "no live MCP server" verdict**, which held only for the 6 guessed paths across `app.`/`services.`/`developer.fountain.com` — those 404s remain correct for those hosts. |
| **`exposeAsMcpTool` is the pipeline switch that makes a Hire endpoint agent-callable** | Three independent artifacts: the served OpenAPI `tags` (Lane A), `_meta.apiTags` on all 127 live MCP tools (direct probe), and the `exposeAsMcpTool` literal in `wx-copilot` (Lane B′) |
| **A previously-uncataloged `/api/go/{v1,v2}` "Hire Go" API family exists** — 56 of the 127 live Hire MCP tools map to it | Direct probe; absent from all 575 documented endpoints and all 766 app-own paths, so this is a **new surface**, not a recount of a known one. Single lane (the MCP catalog) → the *existence* is a direct observation (fact); the family's full size is unknown |
| **`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6` (AWS Bedrock) are Cue's declared models** | A verbatim model-selection enum in the shipped `wx-copilot.umd.js` (lane B, `bundle-string-mine` · medium) — a direct read of a production artifact. **Single-lane, NOT promoted a band (re-graded Mode-5 it. 3, defect E2):** the `anthropic-domain-verification` TXT record (lane C) is an **org-level** signal that `technology-architecture.md` itself grades ambiguous, so it does not corroborate a product-level claim. The row's claim is exactly what it says — these are the **declared** models. **"Cue's production inference runs on Claude" is a separate, tentative claim** (schema default `openai`; no inference observed). Detail in `technology-architecture.md`. |
| **`exposeAsMcpTool` tag exists on real Hire v2 operations** | Verbatim OpenAPI JSON, observed on ≥10 distinct operations |
| **Multi-tenant per-tenant-subdomain architecture** | `bundle` client config + `infra` CT logs — independent lanes, different methods |
| **LaunchDarkly is the flag platform; Pusher is in the client stack; Looker backs analytics** | `bundle` (env-var field names + flag literals) + `infra` (CSP header hosts, self-hosted LD relay subdomains) |
| **"OnboardIQ" is the platform's original identity, still load-bearing** | Webhook signature header + doc slug + Intercom workspace (Lane A) + S3 bucket fleet naming (Lane B) + the Delaware legal entity (`website`) — four independent surfaces |

### Rendered tentative (single-source, or method-capped)

- **The exact request/response schema of 534 of 575 published endpoints.** Only 41 rows are
  `openapi-verbatim`; the rest are slug-reconstructed paths + `llms.txt` link titles. Path *shapes* for
  those rows are a best-effort reconstruction, explicitly marked as such by the collector. Any integration
  spec written from this document must fetch the specific reference page for its endpoints.
- ~~**Whether `service*` pages carry embedded OpenAPI fragments like the v2 pages do.** Unsampled.~~
  **RESOLVED (Mode-5 it. 2) — they do, across the family** (5 families sampled, 5/5 carry a complete
  OpenAPI 3.0.3 per-operation fragment; §Open questions #7). `openapi-verbatim` is **retrievable on
  demand at one GET per operation**, which is the honest form of the upgrade — the catalog rows stay
  `docs-reconstructed` until fetched, so this moves the *ceiling*, not the current grade, for the
  467-page family. 46 of 575 pages have been fetched verbatim to date.
- **The app-own auth transport** (Bearer-from-storage vs same-origin session cookie). Storage model is
  fact; transport is unverified and needs the three-way probe.
- **Every request/response *body* on the app-own API.** The generated client yields paths and methods, not
  schemas.
- **The realtime channel/event catalog.** Vendor presence is fact; everything past it is unobserved.
- **Named/certified HRIS + payroll connectors.** `website` claims ADP/Workday/UKG/SAP; `docs` documents
  only DIY webhooks and a Zapier-mediated Slack path. Not independent sources; the better-evidenced
  technical reading is "no certified connector documented for integrators."
- **The AI/Copilot layer's actual mechanism.** Both lanes agree **dedicated backend and frontend surfaces
  exist** — `servicetodo`'s `createForCopilot`/`cloneForCopilot`/`publishForCopilot`/
  `applyTestChangesToDraftForCopilot` lifecycle, `serviceorganizations/copilotauditlogs` (an audit trail
  *specifically for AI-driven changes*, which a relabeled rules engine would not need),
  `servicepool/copilot/audiences`, `servicecompliancev2/ai-documenttypes`, and on the app side
  `/internal_api/ai_builder/workflow/chat`, `/internal_api/agent_integrations/agent/*`, the
  `/fountain_ai` + `/ai_workflow_builder` + `/ai_interviewers` routes, and a separately-versioned
  `wx-copilot` micro-frontend. That is **two independent lanes** → *the existence of a real, audited,
  dedicated AI subsystem is fact*. **UPDATED (Mode-5 iteration 1): for Cue specifically, the mechanism is
  no longer open** — the `wx-copilot` bundle carries a verbatim model-selection enum
  (`us.anthropic.claude-opus-4-6-v1` / `us.anthropic.claude-sonnet-4-6`, AWS Bedrock cross-region
  inference profiles) plus a multi-provider config schema (`llmProvider: openai | anthropic |
  anthropic_direct`, default `openai`), and a live MCP tool server backs it. **Cue is genuine,
  configured, multi-provider LLM orchestration — fact.** What stays tentative is (a) **which provider
  actually serves a production call** — a declared config is not an observed inference (re-graded
  it. 3), (b) Cue's *autonomy* (the API shape is still draft→test→human-publish) and
  (b) the mechanism of the **other** agents: `infra`'s `euw3-ms-nlu.internal.fountain.com` in-house NLU
  microservice plus the `automated_response_models`/intent-scoped chatbot API still point at classic
  intent classification for **Emma**, and `website` notes Anna is marketed as "trained on structured
  logic, not personal data." **Verdict: real subsystem (fact); Cue's LLM mechanism (fact); Anna/Emma/Sam
  mechanism still open (tentative) — only a session closes those.**

### The write-side cap (rendered once, per `evaluation.md`)

`session: _summary.md` carries **`write_side_observed: false`** and `pass2: not-applicable`. No
create/update/generate/launch path was exercised anywhere on this target. Therefore **every write-side
behavior claim in this document is declared, never observed** — including the entire Applicant creation
and advancement flow, the webhook delivery/retry behavior, the compliance decision-gate round-trip, the
Copilot draft→test→publish lifecycle, and the `ai_builder/workflow/chat` interaction. Request bodies and
state transitions described above come from OpenAPI fragments and a generated client, not from a wire.
**This cap is stated here once and applies to the whole document.**

### Conflicts flagged, not averaged

1. **HRIS/payroll connectors** — `website` (named partners) vs `docs` (DIY webhooks only). Not independent
   sources; resolved toward the documented technical reality, marketing claim left tentative. A `/integrations`
   re-clip settles it.
2. **`Authorization: Bearer` vs `Application: Bearer`** — the docs contradict themselves within one page
   family. Unresolvable without a live probe. Recorded as an open question; **not guessed**.
3. **`servicepulse` / `servicereferral` "have no UI surface"** — **CLOSED (Mode-5 it. 1, propagated it.
   2). Not a conflict, and no longer merely a downgraded inference: it is refuted by direct observation.**
   The `api` dimension raised it; Evaluation downgraded it to a coverage artifact (the mined bundle was
   the *Hire* console, `recruiter_ui`); the `wx-navbar` product catalog then **positively located both
   surfaces** — `Pulse` at `/pulse` (D0; children Dashboard `/pulse/dashboard`, Checks `/pulse/checks`,
   Settings `/pulse/settings`) and `Referrals` at `/referral` (D0; children Pipeline, Campaigns,
   Incentives, Settings) (`bundle: raw/wx-micro-frontends.md` §1b · `bundle-string-mine` · medium).
   **This is the single wording all three docs now carry** — the earlier "resolved as coverage artifact"
   / "left open" / "located at `/pulse` D0" three-way split across `data-model`, `product-features` and
   `information-architecture` is reconciled to *located, D0, in a client this run did not walk*.

---

## Open questions

**Would close with one read-only Pass-1 session** (the single highest-value follow-up — it converts this
entire document from *declared* to *observed*):

1. Does `/internal_api/*` authenticate by `Authorization: Bearer` from the stored JWT, or by a same-origin
   session cookie? (Probe Bearer / cookie / raw-token — `tradecraft.md` §2.26.)
2. Which of the **766** declared app-own paths actually fire, and in what order per surface? This is what makes
   the dormant-route half of the seam rule available at all.
3. The realtime channel + event catalog: Pusher channel naming, event names, payload shapes — and whether
   any second channel exists (`tradecraft.md` §2.4's multi-channel trap).
4. Live request/response bodies for the app-own API, especially `ai_builder/workflow/chat` and
   `agent_integrations/agent/*`. **(Narrowed by Mode-5 iteration 1:** the LLM-vs-rules question is now
   **settled for Cue** by the bundle's Claude/Bedrock model enum + the live MCP server; what these two
   endpoints would still add is the *per-request* shape, **which configured provider actually serves a
   call** (still open — the schema defaults to `openai`), and the mechanism for **Anna / Emma / Sam**,
   which remain open.)
5. Whether the app's applicant-list surfaces use paths outside the generated client (server-rendered Rails
   pages, or an unfetched lazy chunk).
6. The `Authorization` vs `Application` Bearer header name (one authenticated call settles it).

**Would close with additional static collection (cheap, no session needed):**

7. ~~**Fetch one `service*` reference page raw** and check for an embedded OpenAPI fragment.~~ **CLOSED
   (Mode-5 iteration 2, 2026-08-09) — answer: YES, across the family.** Five `service*` reference pages
   from five *different* families were fetched raw as `.md` mirrors —
   `get_api-serviceattendance-demands`, `get_api-servicepulse-surveys`, `get_api-servicetodo-taskflows`,
   `get_api-serviceorganizations-companies`, `get_api-servicepool-audiences` (all HTTP 200, 12.7–64.4 KB).
   **Every one embeds a complete per-operation OpenAPI 3.0.3 fragment**, each declaring
   `info.title: "Worker Experience Public API"` v1.0.0, `servers[0].url:
   https://services.fountain.com`, and `securitySchemes.jwt = {type: http, scheme: bearer}` — byte-for-byte
   the same document identity the `api` dimension recovered from `get_api-serviceworkforce-workers`.
   **Consequence for the method grade, stated precisely:** *retrievability* of a verbatim per-operation
   schema for the 467-page `service*` family is now confirmed at **high** confidence across **6 of 12**
   documented families; the catalog rows themselves remain `docs-reconstructed` because only 46 of 575
   pages have actually been fetched. The correct statement is **"`openapi-verbatim` is available on demand
   for any `service*` endpoint, one GET per operation"** — not "the catalog is now verbatim." Two
   secondary findings from the same five pages: (a) **`exposeAsMcpTool` is absent from all five**,
   independently corroborating the "Hire-v2-only construct" read; (b) the tag `tags: ["demands"]` /
   `["surveys"]` / `["taskFlows"]` / `["companies"]` / `["audiences"]` confirms the LoopBack-style
   resource-per-tag convention across families.
8. ~~**Mine the Worker Experience client bundle**~~ **CLOSED (Mode-5 iteration 1).** `wx-navbar.umd.js`
   (2.06 MB) and `wx-copilot.umd.js` (6.77 MB) were fetched unauthenticated and string-mined: **466
   `/api/service*` paths across 15 families**, the full Frontline OS destination catalog (21 rows = 20 distinct products), the
   `wxServiceBaseUrl` mount contract, and Cue's LLM/MCP client config
   (`bundle: raw/wx-micro-frontends.md`). Propagated into this document at iteration 2 (§Spine 2,
   §Published-vs-app-own diff, §API-path diff). **What remains open is narrower:** the WX *product* SPAs
   (Shift, Pulse, Compliance, Referral, Onboard) and the origin `wxServiceBaseUrl` resolves to.
9. **Reassemble `npm.fountain.*`** (772 KB, Fountain's own internal shared package, source map confirmed
   live but not fetched).
10. **Crawl `partners.fountain.com`'s 14 pages verbatim** — the partner `v1` API is currently the least
    evidenced of the three published surfaces (titles and descriptions only).
11. **`exposeAsMcpTool` prevalence across the 467 `service*` pages** — unsampled. Whether the tag stays a
    Hire-v2-only construct or spans the platform materially changes the read on Fountain's agent-API
    direction.
12. ~~**(Mode-5 it. 1) Is there a *customer-facing* MCP server?**~~ **LARGELY CLOSED (it. 2).** The
    `exposeAsMcpTool`-tagged Hire operations **are** served by a live MCP server —
    `mcp.fountain.com` / `fountain-hire-mcp-server v1.0.0`, 127 tools, unauthenticated catalog. **What is
    still open is the narrower commercial question:** the server is undocumented across all 593 reference
    pages and its known consumer is Cue itself, so "agent-callable in production" is fact while
    "a supported customer/developer integration surface" is not established. Two of the four declared MCP
    hosts (`x-wx-mcp-base-url`, `x-fountain-ai-mcp-base-url`) remain **unlocated** after a 16-candidate
    DNS sweep (all NXDOMAIN) — absence is artifact-scoped to the names probed, not asserted.
13. **Why are TWO production MCP servers reachable unauthenticated?** `initialize` and `tools/list`
    returned with no credential on both. On the Hire server this discloses a **127-tool capability map
    including 4 `destructiveHint: true` tools** (e.g. `deleteV2ApplicantsId`,
    `deleteInternalApiSourcingSourcingChannelsId`) with full JSON-Schema input contracts. Whether any
    tool *executes* unauthenticated was **deliberately not tested** — invoking a tool is a state/data
    action outside the read-only boundary. Recorded as a **security question, not a finding**; it needs
    the vendor's own confirmation or an authorized test.
14. **(New, it. 2) How large is the `/api/go/{v1,v2}` family really?** 56 MCP tools map to it, but MCP
    exposure is a curated subset (`exposeAsMcpTool`), so 56 is a **floor**. The family appears in no
    published doc and no client bundle mined so far — the "Fountain Go" SPA is the artifact that would
    settle it.

**Genuinely undocumented / unresolvable from public surfaces:**

12. Rate limits for all 12 `service*` microservices — no page exists. Not confirmed unlimited.
13. Whether `PAPI` (in `servicesecurity`'s "one stop setup for PAPI" and the `hirePapiProfile` webhook
    payload field) expands to "Partner API" — never spelled out anywhere in 593 pages.
14. Whether webhook subsystems #3 (Custom Attribute) and #4 (Universal Tasks) are signed at all — no
    signature header appears in either sample payload.
15. Whether the four notification-webhook subsystems share one delivery/retry infrastructure. The differing
    SLAs (hard 3 s vs "process async") suggest genuinely separate implementations.
16. Whether net-new customers are ever placed on a legacy regional/single-tenant URL, or whether that path
    is closed to new accounts.
17. Whether "OnboardIQ" reflects an acquisition or an internal rename — the artifacts prove the lineage,
    not its cause.
