<!-- source: https://developer.fountain.com/llms.txt · captured_at: 2026-08-09 · method: crawl-clip (llms.txt index, fetched via curl for the true unsummarized body — a WebFetch pass on the same URL truncated content mid-file and fabricated a phantom "## Summary" section header; the curl-fetched raw file is authoritative) -->

# Fountain developer-docs — full page index

Single served `llms.txt` at `developer.fountain.com/llms.txt` — **one section only** (`## API Reference`),
**593 linked reference/guide pages**, all under `developer.fountain.com/reference/*.md` (ReadMe-hosted,
each page independently fetchable as raw Markdown by appending `.md`). No separate Getting-Started,
Changelog, or Guides top-level sections exist in this llms.txt — "guide" content (webhooks, integrations,
HRIS sync, custom forms) is folded into the same flat `## API Reference` list as narrative pages
alongside the per-endpoint references.

A **second, sibling docs surface** exists at `partners.fountain.com` (also ReadMe-hosted, own `llms.txt`,
own `## Guides` + `## API Reference` sections, ~14 pages) — the partner-integration guide referenced from
the main docs' overview pages. See `raw/integrations-partners.md`.

A **third surface**, `help.fountain.com` (redirects to `/en/`, also reachable as `support.fountain.com`),
is a separate **end-user** (not developer) help center, Intercom-hosted, branded "Worker Experience Help
Center" (Intercom app identifier `onboardingiq`). See `raw/help-center.md`.

## Composition of the 593-page developer.fountain.com index

| Family | Count | What it is |
| --- | --- | --- |
| **Narrative / guide pages** (non-endpoint) | 24 | Overview, Hire API Overview, Webhooks, Rate Limits, FAQ, Deprecations (x2), Tenant API URLs, Custom Integrations, Slack Integration, Sync with HRIS, Connecting a Custom Form, Webhooks-and-External-API-Calls, Automation Webhooks, Custom Attribute Webhooks, Universal Tasks Webhooks, External Processing API (Compliance), Embedding the Worker Portal, Partner Tasks + a handful of individually-named v2 endpoints not part of the CRUD sets below |
| **`v2-*` (Hire public REST API)** | 108 | The original/legacy "Hire" ATS product's REST v2 API: Applicants (create/read/update/delete/advance/bulk-advance/transitions/duplicates/notify/files/SMS/notes/GDPR-anonymize), Funnels(Openings)/Stages, Hiring Goals, Location Groups, Locations, Positions, Option Banks, Data Keys, (Timestamped) Exports, Roles, Shifts, User Activities, Users, Webhook Settings, Workers, Workflows, Rejection/Archived Reasons, Available/Booked Slots/Sessions, Company Attributes |
| **`service*-*` (microservice CRUD families, "Fountain One")** | ~537 | 12 named backend microservices, each with LoopBack-style filterable CRUD (`count`/`find one`/`find many`/`create`/`replace`/`patch`/`delete`, `filter[where][field][op]=value`, `filter[limit]`/`filter[skip]`/`filter[fields]` query syntax) — see the service breakdown table below |

## The 12 named microservices ("Fountain One" backend, from `services.fountain.com/api/<serviceName>/...`)

| Service prefix | Endpoint count in docs | Domain (inferred from resource names) |
| --- | --- | --- |
| `serviceattendance` | 81 | Shift scheduling / WFM: shifts, timesheets, time-off, holiday rules, automatic-break rules, worker-request rules, allowances, demand planning, attendance activity log |
| `serviceworkforce` | 77 | Core worker/job registry: workers, jobs, customAttributes, locations, locationGroups, locationGroupTrees, audienceLocations/Jobs/Openings, openings |
| `serviceorganizations` | 60 | Tenancy/org model: brands, companies, companyAttributes, companyAttributeSets, EINs, copilotAuditLogs |
| `servicetodo` | 57 | Task/workflow engine ("Onboard"): taskFlows, tasks, assignedTasks, partnerTasks, task-flow authoring-for-Copilot lifecycle (create/clone/publish/apply/delete "forCopilot") |
| `servicepulse` | 43 | Engagement / survey system: surveys, questionBanks, participants, themes, pulseSettings, defaultNotificationTemplates |
| `serviceemployment` | 39 | Employment/compliance profile management: W-4 & I-9 document assignments, employmentProfiles, employerNotes, logNotes, tags, profile-submission rehire/restart |
| `servicepool` | 27 | Talent CRM / sourcing pool: talent, audiences, unifiedJobs, audience campaigns, **AI/ML job-matching ("aggregate vector match")**, Copilot-authored audiences |
| `servicemedia` | 19 | File storage: storedFiles, signDocs (e-signature), presigned-upload URLs (edm / attachments / csv-imports buckets) |
| `servicesecurity` | 16 | AuthN/authZ: apikeys, opensignups, OAuth `apikey/generate`, worker/employer impersonation URL, PAPI one-stop-setup |
| `servicecompliancev` (compliance vertical) | 16 | Document compliance: documentSubmission, documentType, requirement, workerComplianceProfile (Atlas Search-backed) |
| `servicereferral` | 14 | Employee referral program: referralCampaigns, referral settings, opening-targeting |
| `servicestaff` | 11 | Employer registry: employers (incl. delete-with-slot-reassignment) |

Note: two service-prefix docs pages (`get_v2-applicants...` etc.) also live in the misc/`v2` bucket where the
slug doesn't cleanly parse as `serviceX` — counts above are `_api-service*` slug matches, a floor not a ceiling.

## Section groupings used for the `raw/*.md` digests

| Section file | Pages covered |
| --- | --- |
| `raw/getting-started.md` | Overview, Hire API Overview, Tenant API URLs, FAQ (auth model, base URLs) |
| `raw/api-reference.md` | v2 Hire REST API + the 12 microservices catalog + sample OpenAPI schemas (Applicant, WebhookSetting) |
| `raw/webhooks.md` | Hire Webhooks, Automation Webhooks, Custom Attribute Webhooks, Universal Tasks Webhooks (Onboard), Webhooks-and-External-API-Calls, External Processing API (Compliance) |
| `raw/integrations-partners.md` | Custom Integrations, Slack Integration, Sync with HRIS, Connecting a Custom Form, Embedding the Worker Portal, Partner Tasks, partners.fountain.com (separate docs site) |
| `raw/faq-and-deprecations.md` | Rate Limits, FAQ, API Deprecations (Hire), API Deprecations (WX) |
| `raw/agent-skill-manifest.md` | `.well-known/agent-skills/index.json` + `SKILL.md` — the AI-agent-native docs-discovery manifest |
| `raw/help-center.md` | help.fountain.com / support.fountain.com — the separate end-user Intercom help center (distinct from developer docs) |
