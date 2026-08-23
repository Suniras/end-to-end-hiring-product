<!-- source: https://readme.paradox.ai/reference/*.md (55 per-operation pages; 53 pages carried a machine-parseable OpenAPI 3.1 JSON fragment, 2 [authentication.md, language-codes.md] are prose-only) · captured_at: 2026-08-09 · method: openapi-verbatim (per-fragment, merged into one digest by this collector — Paradox does not serve a single consolidated spec file anywhere found) -->

# Paradox — Public API Endpoint Catalog ("olivia-public-api-docs")

**How this was found:** `api.paradox.ai` itself serves no docs, no spec, and no self-serve signup — but
`www.paradox.ai/partners/integrations` links an "API Developer Hub" at `https://paradox.readme.io/`,
which 301s to a ReadMe.io-hosted portal on a real subdomain: **`https://readme.paradox.ai/`**. That
subdomain was invisible to plain DNS/crt.sh subdomain enumeration (a `CNAME` to ReadMe.io's Render-hosted
infra, not an A/AAAA record pattern typical of `api.`/`docs.`/`developer.` guesses) and was only found by
following an on-page link — the discovery method itself is a reusable lesson (see Open questions /
self-correction note in `_summary.md`).

The portal serves a `/llms.txt` index (ReadMe.io's standard LLM-discovery file) enumerating every guide,
API reference page, and changelog entry, each also fetchable as raw Markdown via a `.md` suffix
(`https://readme.paradox.ai/reference/<slug>.md`) with NO auth required. Each reference page embeds a
**verbatim, machine-parseable OpenAPI 3.1.0 JSON fragment** scoped to that one operation (`servers`,
`paths`, request schema, response schema + examples, error codes). This collector fetched all 55 listed
reference pages and parsed the embedded OpenAPI fragment from each, recovering **53 operations across 36
distinct paths** — a complete, high-confidence picture of Paradox's public "olivia-public-api-docs" v1.0
surface, despite there being no single served spec file and no self-serve API-key signup.

**API title (from spec `info.title`):** `olivia-public-api-docs`, version `1.0`.

**Base server (prod, US):** `https://api.paradox.ai/api/v1/public` — confirms `/api/v1/public/*` is the
real path prefix; every operation below is relative to this. **Documented sibling environments** (from
`reference/authentication.md`): `dev2api.paradox.ai`, `testapi.paradox.ai`, `stgapi.paradox.ai` (all US,
same `/api/v1/public/*` path shape), plus a **separate EU region**: `api.stg.eu1.paradox.ai` (EU staging)
and `api.eu1.paradox.ai` (EU prod) — confirming a documented **data-residency split** (US vs EU
deployments), relevant to enterprise/GDPR buyers.

## Auth model

Two supported schemes, both documented on `reference/authentication.md`:

1. **OAuth 2.0 client_credentials (preferred):** `POST /auth/token` with
   `grant_type=client_credentials&client_id=<Account ID>&client_secret=<Secret Key>`
   (`application/x-www-form-urlencoded`) → `{access_token, expires_in, token_type: "bearer"}`. Every
   subsequent call carries `Authorization: Bearer <access_token>`.
2. **HTTP Basic Auth:** `Account ID` as username, `API Secret` as password — an alternative, simpler
   scheme for the same credential pair.

**Credentials are NOT self-serve** — the docs explicitly say "contact the Paradox Integrations Team to
request your account ID and API secret key." This confirms the access model: partner/customer-only,
provisioned out-of-band, not an open developer signup (consistent with Discovery's finding of no public
signup portal).

## Response envelope (list endpoints)

Offset/limit pagination, e.g. `GET /candidates`:
```json
{"limit": 50, "count": 1396, "offset": 0, "candidates": [ {"candidate": {...}, "stage": {...}, "conversation": [...]} ]}
```
Error envelope (seen on `/auth/token` 400 and elsewhere):
```json
{"errors": [{"code": 1015, "message": "Invalid request.", "field": ""}]}
```
Numeric app-level error codes (not just HTTP status) — a hand-rolled error taxonomy, not a generated
framework default (RFC 7807 / DRF-style).

## Endpoint catalog (53 operations / 36 paths)

| Method | Path | Summary | Required body fields | Query/path params | Response codes |
|---|---|---|---|---|---|
| GET | `/areas` | Get Area List | — | — | 200, 400 |
| POST | `/areas` | Create an area | name | — | 201, 400 |
| DELETE | `/areas/{OID}` | Delete an area | — | OID | 204, 400 |
| GET | `/areas/{OID}` | Get Single Area | — | OID | 200, 400 |
| PUT | `/areas/{OID}` | Update an area | name | OID | 200, 400 |
| POST | `/auth/token` | OAuth 2.0 Token | grant_type, client_id, client_secret | — | 200, 400 |
| PATCH | `/candidate/attributes/{OID}` | Patch Candidate Attributes | — | OID | 200, 400 |
| PUT | `/candidate/attributes/{OID}` | Update Candidate Attributes | — | OID | 200, 400 |
| GET | `/candidates` | Get Candidates | — | start_date, end_date, start_keyword, limit, status, group_name, location_id, source, conversation, offset, interviews, note, profile_id, include_attributes, candidate_journey_status, created_start_date, page, job_loc_code, job_req_id, ex_id, email | 200, 400 |
| POST | `/candidates` | Create Candidate | phone, email, name | — | 200, 400 |
| POST | `/candidates/send_message` | Send Candidate Message | OID, message | — | 200, 400, 401, 500 |
| PUT | `/candidates/unsubscribe` | Unsubscribe Candidate | OID | — | 200, 400 |
| DELETE | `/candidates/{ID}` | Delete Candidate | — | ID | 200, 400 |
| GET | `/candidates/{ID}` | Get Single Candidate | — | ID, conversation, note | 200, 400 |
| PUT | `/candidates/{ID}` | Update Candidate | — | ID | 200, 400 |
| GET | `/company/ai` | Get AI Assistant (name + image) | — | — | 200, 400 |
| GET | `/company/conversations` | Get Conversations | — | — | 200, 400 |
| GET | `/company/groups` | Get Groups | — | — | 200, 400 |
| GET | `/company/locations` | Get Locations | — | — | 200, 400 |
| GET | `/interview/get_job_loc_rooms` | Get job location rooms | — | jobloc_id | 200, 400 |
| GET | `/interview/get_setting` | Get interview setting | — | OID, company_id, name, phone, email | 200, 400 |
| PUT | `/interview/interview_alerts` | Send interview alerts (3rd-party → Paradox) | action, interview_duration, interview_type | — | 200, 400 |
| GET | `/interview/interview_history` | Get interview history | — | OID, limit, offset | 200, 400 |
| GET | `/locations` | Get Single Location by job_loc_code | — | job_loc_code | 200, 404 |
| POST | `/locations` | Create a location | name, state_code | — | 201, 400 |
| PUT | `/locations/job_loc/{job_loc_code}` | Update Location by job_loc_code | — | job_loc_code | 200 |
| POST | `/locations/{ID}/deactivate` | Deactivate a location | — | ID | 204, 400 |
| DELETE | `/locations/{OID}` | Delete a location (deprecated — replaced by deactivate) | — | OID | 204, 400 |
| GET | `/locations/{OID}` | Get Single Location | — | OID | 200, 404 |
| PUT | `/locations/{OID}` | Update a location | — | OID | 200, 400 |
| GET | `/reporting/reports` | Get Report List | — | — | 200, 400 |
| POST | `/reporting/reports` | Create Report (**async, webhook-callback**) | callbackUrl | — | 200, 400 |
| GET | `/reporting/reports/{ID}` | Get Single Report | — | ID | 200, 400 |
| POST | `/rooms` | Create a room | name, location_id, seats | — | 201, 400 |
| DELETE | `/rooms/{room_id}` | Delete a room | — | room_id | 204, 400 |
| GET | `/rooms/{room_id}` | Get Single Room | — | room_id | 200, 400 |
| PUT | `/rooms/{room_id}` | Update a room | name, seats | room_id | 200, 400 |
| GET | `/rooms?location_id={loc_id}` | Get Room List | — | loc_id | 200, 400 |
| POST | `/scheduling/communication` | Scheduling Shortlist Review (email HM w/ shortlist) | to, email_title, email_text, action_link | — | 200, 400, 401, 500 |
| GET | `/user-roles` | Get User Roles | — | limit, page | 200, 400 |
| PUT | `/user_permission/add_location_permission` | Add Location Permission | user_id, location_id, group_ids | — | 200, 400 |
| DELETE | `/user_permission/delete_location_permission` | Delete Location Permission | user_id, location_id | — | 200, 400 |
| GET | `/user_permission/get_location_permissions` | Get Location Permissions | — | user_id, user_reference | 200, 400 |
| POST | `/users` | Create User | phone_number, name, email | — | 200, 400 |
| GET | `/users/` | Get users | — | limit, page, include_campus_permission, external_role_id, location_id | 200, 400 |
| DELETE | `/users/employees/{employee_id}` | Delete User by employee_id | — | employee_id | 200, 400 |
| GET | `/users/employees/{employee_id}` | Get Single User by employee_id | — | employee_id | 200, 400 |
| PUT | `/users/employees/{employee_id}` | Update User by employee_id | name | employee_id | 200, 400 |
| DELETE | `/users/{OID}` | Delete User | — | OID | 200, 400 |
| GET | `/users/{OID}` | Get Single User | — | OID, include_campus_permissions | 200, 400 |
| PUT | `/users/{OID}` | Update User | name | OID | 200, 400 |
| POST | `/users/{OID}/deactivate` | Deactivate User | — | OID | 200, 400 |
| POST | `/users/{OID}/reactivate` | Reactivate User | — | OID | 200, 400 |

## Endpoint families (rollup)

| Family | Ops | Entities touched |
|---|---|---|
| Auth | 1 | token |
| Candidates (+ attributes, messaging, unsubscribe) | 8 | Candidate (37-field schema on Update — see below), conversation, stage |
| Users / employees / roles / location-permissions | 12 | User, Role, LocationPermission |
| Locations | 7 | Location (+ legacy job_loc_code addressing scheme, one deprecated hard-delete op) |
| Areas | 4 | Area (grouping construct over Locations) |
| Rooms | 5 | Room (interview room, tied to a Location) |
| Interview (settings, history, 3rd-party alerts, job-loc rooms) | 4 | Interview, scheduling |
| Reporting | 3 | async report job (see webhook callback below) |
| Scheduling / company (groups, conversations, AI assistant) | 4 | Group, Conversation, AI-assistant branding |

## Candidate entity — full field schema (from `PUT /candidates/{ID}` request body, 37 fields)

`phone, email, name, first_name, last_name, status, location, hirevue_link, pymetrics_link, ex_step,
ex_status, ex_reason, job_req_id, job_title, primary_contact_method, hired_date, adp_link, audience_type,
hm_cid, external_group_id, hirevue_instructions, referrer_email, referrer_name, external_referrer,
language_preference, resume, candidate_journey, candidate_journey_status, candidate_attribute_data, note,
candidate_location_info, external_source_id, offer_letter, offer_file_name, use_paradox_status_map,
status_map_name, status_map_ex_id`

Notable: `hirevue_link`/`pymetrics_link` (3rd-party assessment-vendor integration fields baked into the
core schema — HireVue video interviewing, Pymetrics psychometric screening), `adp_link` (ADP payroll/HR
integration), `use_paradox_status_map`/`status_map_name`/`status_map_ex_id` (a configurable
status-code-translation layer for mapping Paradox's internal candidate stages onto an external ATS's own
status vocabulary — this is exactly the kind of field a Workday/SuccessFactors sync layer needs).

## Webhook / callback contract — `POST /reporting/reports`

The one genuine **documented async webhook contract** found: create a report job with a required
`callbackUrl`; Paradox returns `{id, status: "create", callbackUrl, url: ""}` immediately, then invokes
`callbackUrl` once the report is ready (fire-and-forget POST, contract for the payload shape at the
callback itself is not documented on this page — an open question). Example from the docs:
`{"callbackUrl": "http://my.server.com/bar", "report": "CAPTURE_CANDIDATE_SPECIFIC", "from_date": "2020-03-01", "to_date": "2021-03-02"}`.

## Inbound 3rd-party-integrator contract — `PUT /interview/interview_alerts`

The one endpoint explicitly documented as being for **3rd-party integrators calling INTO Paradox**
(not Paradox calling out): "This API allows 3rd party integrators to send Interview Requests to Paradox.
Additionally, this API will create Candidates within Paradox that do not exist." Accepts `action`
(interview/cancel/reschedule), an 18-value `interview_type` enum (IN_PERSON_INTERVIEW,
PHONE_INTERVIEW, VIRTUAL_INTERVIEW, GROUP_SESSION, INTERVIEW_PREFERENCE, BREAK, …), interviewer IDs,
room ID, and either a Paradox `OID`, an external `ex_id`, or a `job_application_id` (with
`use_application_id_for_identity`) to identify/create the candidate. A recent (2026-07-24) doc update
adds an opt-in validation toggle (Settings → Client Setup → Integrations → "Enable Validation for
Interview Alerts Scheduling") — i.e. this surface is under active development, not legacy/frozen.

## No consolidated spec file, no self-serve signup

No single `openapi.json`/`swagger.json` is served anywhere (each reference page is its own fragment); no
"Sign up for an API key" flow exists on the portal — credentials are provisioned by the Paradox
Integrations Team out-of-band per the Authentication page. This is a **partner-API posture**, not a
self-serve developer-platform posture, consistent with Discovery's read of the target.
