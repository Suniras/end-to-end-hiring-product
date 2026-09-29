# Fountain — Full Endpoint Catalog (developer.fountain.com)

<!-- source: https://developer.fountain.com/llms.txt (594 linked reference pages) + individual .md fetches of 10 guide pages and an 8-page endpoint schema sample · captured_at: 2026-08-09 · method: docs-reconstructed (narrative + slug-to-path reconstruction) with verbatim per-operation OpenAPI JSON fragments for the sampled rows -->

**575 endpoint reference pages + 19 guide pages** are linked from `llms.txt`, spanning **14 distinct backend service prefixes** (1 legacy monolith + 13 `service*` microservices under `services.fountain.com`). Paths below are reconstructed from the ReadMe page slug — ReadMe lowercases and dash-joins the literal OpenAPI path, so exact camelCase path-param names are a best-effort reconstruction EXCEPT the 8 rows marked `(verbatim)`, where the actual per-operation OpenAPI JSON was fetched and the path is copied exactly. Every row links to its live ReadMe page for the authoritative per-operation schema (full request/response JSON Schema, embedded in every page as `# OpenAPI definition`).

## Service families (endpoint counts)

| Family | Endpoints |
|---|---|
| hire-v2 | 108 |
| hire-api-v2-misc | 6 |
| serviceworkforce | 77 |
| serviceattendance | 81 |
| serviceorganizations | 60 |
| servicetodo | 57 |
| servicepulse | 43 |
| serviceemployment | 39 |
| servicepool | 28 |
| servicemedia | 19 |
| servicesecurity | 16 |
| servicecompliancev2 | 16 |
| servicereferral | 14 |
| servicestaff | 11 |
| **Total** | **575** |


## Hire API v2 (`/v2/...` — legacy Screening/ATS product; X-ACCESS-TOKEN or the unified OAuth Bearer via `services.fountain.com/api/servicehire/v2/...`) — 108 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/v2/applicants` *(verbatim)* | [List All Applicants](https://developer.fountain.com/reference/get_v2-applicants) |
| POST | `/v2/applicants` *(verbatim)* | [Create an Applicant](https://developer.fountain.com/reference/post_v2-applicants) |
| GET | `/v2/applicants/{id}` *(verbatim)* | [Get Applicant Info](https://developer.fountain.com/reference/get_v2-applicants-id) |
| PUT | `/v2/applicants/{id}` | [Update Applicant Info](https://developer.fountain.com/reference/put_v2-applicants-id) |
| DELETE | `/v2/applicants/{id}` | [Delete an Applicant](https://developer.fountain.com/reference/delete_v2-applicants-id) |
| PUT | `/v2/applicants/{id}/advance` | [Advance an Applicant](https://developer.fountain.com/reference/put_v2-applicants-id-advance) |
| POST | `/v2/applicants/advance` | [Bulk Advance Multiple Applicants](https://developer.fountain.com/reference/post_v2-applicants-advance) |
| GET | `/v2/applicants/{id}/transitions` | [Get Transition History](https://developer.fountain.com/reference/get_v2-applicants-id-transitions) |
| POST | `/v2/applicants/transitions` | [Bulk Transition History for Multiple Applicants](https://developer.fountain.com/reference/post_v2-applicants-transitions) |
| GET | `/v2/applicants/{id}/duplicates` | [duplicate applicants](https://developer.fountain.com/reference/get_v2-applicants-id-duplicates) |
| GET | `/v2/applicants/{id}/booked/slots` | [Get Interview Sessions](https://developer.fountain.com/reference/get_v2-applicants-id-booked-slots) |
| POST | `/v2/applicants/booked/slots` | [Bulk Interview Sessions for Multiple Applicants](https://developer.fountain.com/reference/post_v2-applicants-booked-slots) |
| POST | `/v2/applicants/notify` | [Notify applicant](https://developer.fountain.com/reference/post_v2-applicants-notify) |
| GET | `/v2/applicants/latest/applicant` | [Get Latest Applicant](https://developer.fountain.com/reference/get_v2-applicants-latest-applicant) |
| GET | `/v2/applicants/{id}/secure/documents` | [Get Applicant Files](https://developer.fountain.com/reference/get_v2-applicants-id-secure-documents) |
| POST | `/v2/applicants/{id}/secure/documents/upload` | [File Upload to S3](https://developer.fountain.com/reference/post_v2-applicants-id-secure-documents-upload) |
| POST | `/v2/applicants/{id}/secure/documents/link/upload` | [Link Applicant to Files in S3](https://developer.fountain.com/reference/post_v2-applicants-id-secure-documents-link-upload) |
| POST | `/v2/applicants/{id}/secure/documents/approve` | [Approve Applicant Documents](https://developer.fountain.com/reference/post_v2-applicants-id-secure-documents-approve) |
| POST | `/v2/applicants/{id}/secure/documents/upload/and/link` | [Upload File and Link to Applicant](https://developer.fountain.com/reference/post_v2-applicants-id-secure-documents-upload-and-link) |
| GET | `/v2/applicants/{id}/sms/messages` | [Get Applicant SMS Messages](https://developer.fountain.com/reference/get_v2-applicants-id-sms-messages) |
| POST | `/v2/applicants/{id}/sms/messages` | [Send SMS Message](https://developer.fountain.com/reference/post_v2-applicants-id-sms-messages) |
| POST | `/v2/applicants/{id}/gdpr/anonymize` | [GDPR-anonymize an Applicant](https://developer.fountain.com/reference/post_v2-applicants-id-gdpr-anonymize) |
| POST | `/v2/applicants/{id}/gdpr/anonymize/with/whitelist` | [GDPR-anonymize an Applicant, preserving selected data keys](https://developer.fountain.com/reference/post_v2-applicants-id-gdpr-anonymize-with-whitelist) |
| POST | `/v2/applicants/{id}/document/rejection/notifications` | [Send Document Rejection Notification](https://developer.fountain.com/reference/post_v2-applicants-id-document-rejection-notifications) |
| GET | `/v2/applicants/{id}/labels` | [List Labels for Applicant](https://developer.fountain.com/reference/get_v2-applicants-id-labels) |
| PUT | `/v2/applicants/{id}/labels/title` | [Update Label for Applicant](https://developer.fountain.com/reference/put_v2-applicants-id-labels-title) |
| GET | `/v2/stages/stage/{id}/labels` | [List All Labels in Stage](https://developer.fountain.com/reference/get_v2-stages-stage-id-labels) |
| GET | `/v2/applicants/{id}/notes` | [Get Applicant Notes](https://developer.fountain.com/reference/get_v2-applicants-id-notes) |
| POST | `/v2/applicants/{id}/notes` | [Create Applicant Note](https://developer.fountain.com/reference/post_v2-applicants-id-notes) |
| DELETE | `/v2/applicants/{id}/notes/note/{id}` | [Delete Applicant Note](https://developer.fountain.com/reference/delete_v2-applicants-id-notes-note-id) |
| PUT | `/v2/applicants/{id}/notes/note/{id}` | [Update Applicant Note](https://developer.fountain.com/reference/put_v2-applicants-id-notes-note-id) |
| GET | `/v2/archived/reasons` | [List Archived Reasons](https://developer.fountain.com/reference/get_v2-archived-reasons) |
| GET | `/v2/rejection/reasons` | [List Rejection Reasons](https://developer.fountain.com/reference/get_v2-rejection-reasons) |
| POST | `/v2/available/slots` | [Create Calendar Slots](https://developer.fountain.com/reference/post_v2-available-slots) |
| POST | `/v2/available/slots/{id}/confirm` | [Book an Available Slot](https://developer.fountain.com/reference/post_v2-available-slots-id-confirm) |
| DELETE | `/v2/available/slots/{id}` | [Delete Calendar Slots](https://developer.fountain.com/reference/delete_v2-available-slots-id) |
| POST | `/v2/booked/slots/{id}/cancel` | [Cancel a booked slot](https://developer.fountain.com/reference/post_v2-booked-slots-id-cancel) |
| GET | `/v2/sessions` | [List Calendar Slots](https://developer.fountain.com/reference/get_v2-sessions) |
| GET | `/v2/stages/{id}/available/slots` | [List Available Slots](https://developer.fountain.com/reference/get_v2-stages-id-available-slots) |
| PATCH | `/v2/available/slots/{id}` | [Update Calendar Slot](https://developer.fountain.com/reference/patch_v2-available-slots-id) |
| GET | `/v2/company/attributes/type` | [Get a specific company attribute by type](https://developer.fountain.com/reference/get_v2-company-attributes-type) |
| GET | `/v2/company/attributes` | [List company attributes](https://developer.fountain.com/reference/get_v2-company-attributes) |
| POST | `/v2/company/attributes` | [Create company attribute](https://developer.fountain.com/reference/post_v2-company-attributes) |
| POST | `/v2/company/attributes/type/values` | [Add values to a company attribute](https://developer.fountain.com/reference/post_v2-company-attributes-type-values) |
| GET | `/v2/data/keys` | [List data keys](https://developer.fountain.com/reference/get_v2-data-keys) |
| GET | `/v2/exports` *(verbatim)* | [List Custom Export Templates](https://developer.fountain.com/reference/get_v2-exports) |
| POST | `/v2/exports` | [Create Custom Export](https://developer.fountain.com/reference/post_v2-exports) |
| GET | `/v2/exports/{id}` | [Download Custom Export](https://developer.fountain.com/reference/get_v2-exports-id) |
| GET | `/v2/exports/templates` | [List all Custom Export Templates](https://developer.fountain.com/reference/get_v2-exports-templates) |
| GET | `/v2/timestamped/exports/templates` | [List All Timestamped Export Templates](https://developer.fountain.com/reference/get_v2-timestamped-exports-templates) |
| GET | `/v2/timestamped/exports/{id}` | [Download Timestamped Export](https://developer.fountain.com/reference/get_v2-timestamped-exports-id) |
| POST | `/v2/timestamped/exports` | [Create Timestamped Export](https://developer.fountain.com/reference/post_v2-timestamped-exports) |
| GET | `/v2/timestamped/exports` | [List Timestamped Export Templates](https://developer.fountain.com/reference/get_v2-timestamped-exports) |
| GET | `/v2/funnels` | [List All Openings](https://developer.fountain.com/reference/get_v2-funnels) |
| POST | `/v2/funnels` | [Create a new opening](https://developer.fountain.com/reference/post_v2-funnels) |
| GET | `/v2/funnels/{id}` | [Retrieve Opening](https://developer.fountain.com/reference/get_v2-funnels-id) |
| PUT | `/v2/funnels/{id}` | [Update opening](https://developer.fountain.com/reference/put_v2-funnels-id) |
| DELETE | `/v2/funnels/{id}` | [Delete an opening](https://developer.fountain.com/reference/delete_v2-funnels-id) |
| GET | `/v2/funnels/funnel/{id}/stages` | [List All Opening Stages](https://developer.fountain.com/reference/get_v2-funnels-funnel-id-stages) |
| GET | `/v2/stages/{id}` | [Retrieve stage](https://developer.fountain.com/reference/get_v2-stages-id) |
| GET | `/v2/hiring/goals` | [List Hiring Goals](https://developer.fountain.com/reference/get_v2-hiring-goals) |
| POST | `/v2/hiring/goals` | [Create a new hiring goal](https://developer.fountain.com/reference/post_v2-hiring-goals) |
| PUT | `/v2/hiring/goals/{id}` | [Update Hiring Goal](https://developer.fountain.com/reference/put_v2-hiring-goals-id) |
| DELETE | `/v2/hiring/goals/{id}` | [Delete a Hiring Goal](https://developer.fountain.com/reference/delete_v2-hiring-goals-id) |
| POST | `/v2/hiring/goals/{id}/company/attributes` | [Assign Company Attributes to Hiring Goals](https://developer.fountain.com/reference/post_v2-hiring-goals-id-company-attributes) |
| GET | `/v2/location/groups` | [List Location Groups](https://developer.fountain.com/reference/get_v2-location-groups) |
| POST | `/v2/location/groups` | [Create a new Location Group](https://developer.fountain.com/reference/post_v2-location-groups) |
| GET | `/v2/location/groups/{id}` | [Retrieve Location Group](https://developer.fountain.com/reference/get_v2-location-groups-id) |
| PUT | `/v2/location/groups/{id}` | [Update Location Group](https://developer.fountain.com/reference/put_v2-location-groups-id) |
| DELETE | `/v2/location/groups/{id}` | [Delete a Location Group](https://developer.fountain.com/reference/delete_v2-location-groups-id) |
| GET | `/v2/locations` | [List Locations](https://developer.fountain.com/reference/get_v2-locations) |
| POST | `/v2/locations` | [Create a new Location](https://developer.fountain.com/reference/post_v2-locations) |
| GET | `/v2/locations/{id}` | [Retrieve Location](https://developer.fountain.com/reference/get_v2-locations-id) |
| PUT | `/v2/locations/{id}` | [Update Location](https://developer.fountain.com/reference/put_v2-locations-id) |
| DELETE | `/v2/locations/{id}` | [Delete a Location](https://developer.fountain.com/reference/delete_v2-locations-id) |
| POST | `/v2/locations/{id}/company/attributes` | [Assign Company Attributes to Location](https://developer.fountain.com/reference/post_v2-locations-id-company-attributes) |
| POST | `/v2/openings/{id}/company/attributes` | [Assign or remove Company Attributes from an Opening](https://developer.fountain.com/reference/post_v2-openings-id-company-attributes) |
| GET | `/v2/option/banks` | [List All Option Banks](https://developer.fountain.com/reference/get_v2-option-banks) |
| POST | `/v2/option/banks` | [Create Option Bank](https://developer.fountain.com/reference/post_v2-option-banks) |
| GET | `/v2/option/banks/{id}` | [Get Option Bank](https://developer.fountain.com/reference/get_v2-option-banks-id) |
| PUT | `/v2/option/banks/{id}` | [Replace Option Bank](https://developer.fountain.com/reference/put_v2-option-banks-id) |
| DELETE | `/v2/option/banks/{id}` | [Delete Option Bank](https://developer.fountain.com/reference/delete_v2-option-banks-id) |
| DELETE | `/v2/option/banks/{id}/remove` | [Remove from Option Bank](https://developer.fountain.com/reference/delete_v2-option-banks-id-remove) |
| PUT | `/v2/option/banks/{id}/append` | [Append to Option Bank](https://developer.fountain.com/reference/put_v2-option-banks-id-append) |
| GET | `/v2/positions` | [List Positions](https://developer.fountain.com/reference/get_v2-positions) |
| POST | `/v2/positions` | [Create a new Position](https://developer.fountain.com/reference/post_v2-positions) |
| GET | `/v2/positions/{id}` | [Retrieve Position](https://developer.fountain.com/reference/get_v2-positions-id) |
| PUT | `/v2/positions/{id}` | [Update Position](https://developer.fountain.com/reference/put_v2-positions-id) |
| DELETE | `/v2/positions/{id}` | [Delete a Position](https://developer.fountain.com/reference/delete_v2-positions-id) |
| POST | `/v2/positions/{id}/company/attributes` | [Assign Company Attributes to Position](https://developer.fountain.com/reference/post_v2-positions-id-company-attributes) |
| GET | `/v2/roles` | [List user roles](https://developer.fountain.com/reference/get_v2-roles) |
| GET | `/v2/shifts` | [List shifts](https://developer.fountain.com/reference/get_v2-shifts) |
| GET | `/v2/user/activities/{id}` | [List User Activities](https://developer.fountain.com/reference/get_v2-user-activities-id) |
| GET | `/v2/users/user/{id}/opening/access` | [Get user opening access](https://developer.fountain.com/reference/get_v2-users-user-id-opening-access) |
| PUT | `/v2/users/user/{id}/opening/access` | [change user opening access](https://developer.fountain.com/reference/put_v2-users-user-id-opening-access) |
| POST | `/v2/users` | [Create User](https://developer.fountain.com/reference/post_v2-users) |
| GET | `/v2/users` | [Get Users](https://developer.fountain.com/reference/get_v2-users) |
| PUT | `/v2/users/{id}` | [Update User](https://developer.fountain.com/reference/put_v2-users-id) |
| DELETE | `/v2/users/{id}` | [Delete User](https://developer.fountain.com/reference/delete_v2-users-id) |
| GET | `/v2/webhook/settings` *(verbatim)* | [List Webhook Settings](https://developer.fountain.com/reference/get_v2-webhook-settings) |
| POST | `/v2/webhook/settings` *(verbatim)* | [Create Webhook Setting](https://developer.fountain.com/reference/post_v2-webhook-settings) |
| GET | `/v2/webhook/settings/{id}` | [Retrieve Webhook Setting](https://developer.fountain.com/reference/get_v2-webhook-settings-id) |
| DELETE | `/v2/webhook/settings/{id}` | [Delete Webhook Setting](https://developer.fountain.com/reference/delete_v2-webhook-settings-id) |
| GET | `/v2/workers` | [List Workers](https://developer.fountain.com/reference/get_v2-workers) |
| GET | `/v2/workers/{id}` | [Get Worker Info](https://developer.fountain.com/reference/get_v2-workers-id) |
| PATCH | `/v2/workers/{id}` | [Update A Worker](https://developer.fountain.com/reference/patch_v2-workers-id) |
| POST | `/v2/workers/{id}/activate` | [Activate A Worker](https://developer.fountain.com/reference/post_v2-workers-id-activate) |
| POST | `/v2/workers/{id}/deactivate` | [Deactivate A Worker](https://developer.fountain.com/reference/post_v2-workers-id-deactivate) |

## Hire API v2 misc (`/api/v2/...` workflow-reassignment endpoints) — 6 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| POST | `/api/api/v2/applicants/applicant/{id}/file/upload/requests` | [Trigger file recollection for an applicant](https://developer.fountain.com/reference/post_api-v2-applicants-applicant-id-file-upload-requests) |
| GET | `/api/api/v2/applicant/print/requests/external/{id}/download` | [Poll an async print request for its PDF](https://developer.fountain.com/reference/get_api-v2-applicant-print-requests-external-id-download) |
| POST | `/api/api/v2/applicants/applicant/{id}/print` | [Request an async PDF print of an applicant](https://developer.fountain.com/reference/post_api-v2-applicants-applicant-id-print) |
| POST | `/api/api/v2/openings/workflow/reassignment` | [Reassign Opening to Different Workflow (Alpha)](https://developer.fountain.com/reference/post_api-v2-openings-workflow-reassignment) |
| GET | `/api/api/v2/workflows` | [List all Workflows](https://developer.fountain.com/reference/get_api-v2-workflows) |
| DELETE | `/api/api/v2/workflows/{id}` | [Delete a Workflow](https://developer.fountain.com/reference/delete_api-v2-workflows-id) |

## serviceworkforce — Workforce/Worker Experience core (workers, jobs, locations, location groups/trees, openings, custom attributes, audience-* read models) — 77 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/serviceworkforce/workers/count` | [count workers](https://developer.fountain.com/reference/get_api-serviceworkforce-workers-count) |
| GET | `/api/serviceworkforce/workers/{identifier}` | [find one worker](https://developer.fountain.com/reference/get_api-serviceworkforce-workers-identifier) |
| PATCH | `/api/serviceworkforce/workers/{identifier}` | [partially update one existing worker](https://developer.fountain.com/reference/patch_api-serviceworkforce-workers-identifier) |
| DELETE | `/api/serviceworkforce/workers/{identifier}` | [delete one worker](https://developer.fountain.com/reference/delete_api-serviceworkforce-workers-identifier) |
| GET | `/api/serviceworkforce/workers` *(verbatim)* | [find many workers](https://developer.fountain.com/reference/get_api-serviceworkforce-workers) |
| POST | `/api/serviceworkforce/workers` *(verbatim)* | [create one or multiple workers](https://developer.fountain.com/reference/post_api-serviceworkforce-workers) |
| PATCH | `/api/serviceworkforce/workers` | [partially update many existing worker](https://developer.fountain.com/reference/patch_api-serviceworkforce-workers) |
| DELETE | `/api/serviceworkforce/workers` | [delete many workers](https://developer.fountain.com/reference/delete_api-serviceworkforce-workers) |
| POST | `/api/serviceworkforce/processes/workers/sendworkermessage` | [message one or many workers](https://developer.fountain.com/reference/post_api-serviceworkforce-processes-workers-sendworkermessage) |
| PUT | `/api/serviceworkforce/processes/workers/{workeridentifier}/customattributes/customattributeidentifier` | [Create or update a worker custom attribute value](https://developer.fountain.com/reference/put_api-serviceworkforce-processes-workers-workeridentifier-customattributes-customattributeidentifier) |
| DELETE | `/api/serviceworkforce/processes/workers/{workeridentifier}/customattributes/customattributeidentifier` | [Delete a worker custom attribute](https://developer.fountain.com/reference/delete_api-serviceworkforce-processes-workers-workeridentifier-customattributes-customattributeidentifier) |
| PUT | `/api/serviceworkforce/processes/workers/{workeridentifier}/customattributes` | [Create or update a worker's custom attributes values](https://developer.fountain.com/reference/put_api-serviceworkforce-processes-workers-workeridentifier-customattributes) |
| GET | `/api/serviceworkforce/processes/workers/{workeridentifier}/sensitiveworkerdata` | [Get the worker profile without sensitive filters](https://developer.fountain.com/reference/get_api-serviceworkforce-processes-workers-workeridentifier-sensitiveworkerdata) |
| POST | `/api/serviceworkforce/processes/workers/{workeridentifier}/terminate` | [Terminate a worker access](https://developer.fountain.com/reference/post_api-serviceworkforce-processes-workers-workeridentifier-terminate) |
| GET | `/api/serviceworkforce/jobs/count` | [count jobs](https://developer.fountain.com/reference/get_api-serviceworkforce-jobs-count) |
| GET | `/api/serviceworkforce/jobs/{identifier}` | [find one job](https://developer.fountain.com/reference/get_api-serviceworkforce-jobs-identifier) |
| PUT | `/api/serviceworkforce/jobs/{identifier}` | [replace one job which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-jobs-identifier) |
| PATCH | `/api/serviceworkforce/jobs/{identifier}` | [partially update one existing job](https://developer.fountain.com/reference/patch_api-serviceworkforce-jobs-identifier) |
| DELETE | `/api/serviceworkforce/jobs/{identifier}` | [delete one job](https://developer.fountain.com/reference/delete_api-serviceworkforce-jobs-identifier) |
| GET | `/api/serviceworkforce/jobs` | [find many jobs](https://developer.fountain.com/reference/get_api-serviceworkforce-jobs) |
| POST | `/api/serviceworkforce/jobs` | [create one or multiple jobs](https://developer.fountain.com/reference/post_api-serviceworkforce-jobs) |
| PUT | `/api/serviceworkforce/jobs` | [replace many jobs which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-jobs) |
| PATCH | `/api/serviceworkforce/jobs` | [partially update many existing job](https://developer.fountain.com/reference/patch_api-serviceworkforce-jobs) |
| DELETE | `/api/serviceworkforce/jobs` | [delete many jobs](https://developer.fountain.com/reference/delete_api-serviceworkforce-jobs) |
| POST | `/api/serviceworkforce/processes/jobs/custom/attributes` | [Create a job and replace its Company Attributes with the payload](https://developer.fountain.com/reference/post_api-serviceworkforce-processes-jobs-custom-attributes) |
| PATCH | `/api/serviceworkforce/processes/jobs/{jobuuid}/custom/attributes` | [Update a job and replace its Company Attributes with the payload](https://developer.fountain.com/reference/patch_api-serviceworkforce-processes-jobs-jobuuid-custom-attributes) |
| GET | `/api/serviceworkforce/customattributes/count` | [count customAttributes](https://developer.fountain.com/reference/get_api-serviceworkforce-customattributes-count) |
| GET | `/api/serviceworkforce/customattributes/{identifier}` | [find one customAttribute](https://developer.fountain.com/reference/get_api-serviceworkforce-customattributes-identifier) |
| PUT | `/api/serviceworkforce/customattributes/{identifier}` | [replace one customAttribute which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-customattributes-identifier) |
| PATCH | `/api/serviceworkforce/customattributes/{identifier}` | [partially update one existing customAttribute](https://developer.fountain.com/reference/patch_api-serviceworkforce-customattributes-identifier) |
| DELETE | `/api/serviceworkforce/customattributes/{identifier}` | [delete one customAttribute](https://developer.fountain.com/reference/delete_api-serviceworkforce-customattributes-identifier) |
| GET | `/api/serviceworkforce/customattributes` | [find many customAttributes](https://developer.fountain.com/reference/get_api-serviceworkforce-customattributes) |
| POST | `/api/serviceworkforce/customattributes` | [create one or multiple customAttributes](https://developer.fountain.com/reference/post_api-serviceworkforce-customattributes) |
| PUT | `/api/serviceworkforce/customattributes` | [replace many customAttributes which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-customattributes) |
| PATCH | `/api/serviceworkforce/customattributes` | [partially update many existing customAttribute](https://developer.fountain.com/reference/patch_api-serviceworkforce-customattributes) |
| DELETE | `/api/serviceworkforce/customattributes` | [delete many customAttributes](https://developer.fountain.com/reference/delete_api-serviceworkforce-customattributes) |
| GET | `/api/serviceworkforce/locations/count` | [count locations](https://developer.fountain.com/reference/get_api-serviceworkforce-locations-count) |
| GET | `/api/serviceworkforce/locations/{identifier}` | [find one location](https://developer.fountain.com/reference/get_api-serviceworkforce-locations-identifier) |
| PUT | `/api/serviceworkforce/locations/{identifier}` | [replace one location which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-locations-identifier) |
| PATCH | `/api/serviceworkforce/locations/{identifier}` | [partially update one existing location](https://developer.fountain.com/reference/patch_api-serviceworkforce-locations-identifier) |
| DELETE | `/api/serviceworkforce/locations/{identifier}` | [delete one location](https://developer.fountain.com/reference/delete_api-serviceworkforce-locations-identifier) |
| GET | `/api/serviceworkforce/locations` | [find many locations](https://developer.fountain.com/reference/get_api-serviceworkforce-locations) |
| POST | `/api/serviceworkforce/locations` | [create one or multiple locations](https://developer.fountain.com/reference/post_api-serviceworkforce-locations) |
| PUT | `/api/serviceworkforce/locations` | [replace many locations which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-locations) |
| PATCH | `/api/serviceworkforce/locations` | [partially update many existing location](https://developer.fountain.com/reference/patch_api-serviceworkforce-locations) |
| DELETE | `/api/serviceworkforce/locations` | [delete many locations](https://developer.fountain.com/reference/delete_api-serviceworkforce-locations) |
| PATCH | `/api/serviceworkforce/processes/locations/{locationuuid}/custom/attributes` | [Update a location and replace its Company Attributes with the payload](https://developer.fountain.com/reference/patch_api-serviceworkforce-processes-locations-locationuuid-custom-attributes) |
| POST | `/api/serviceworkforce/processes/locations/custom/attributes` | [Create a location and replace its Company Attributes with the payload](https://developer.fountain.com/reference/post_api-serviceworkforce-processes-locations-custom-attributes) |
| DELETE | `/api/serviceworkforce/processes/locations/{hirelocationuuid}` | [Deletes a Location and its Company Attributes by its hireLocationUuid if they exist](https://developer.fountain.com/reference/delete_api-serviceworkforce-processes-locations-hirelocationuuid) |
| PATCH | `/api/serviceworkforce/processes/locations/custom/attributes` | [Update multiple locations and replace their Company Attributes with the payload](https://developer.fountain.com/reference/patch_api-serviceworkforce-processes-locations-custom-attributes) |
| GET | `/api/serviceworkforce/locationgroups/count` | [count locationGroups](https://developer.fountain.com/reference/get_api-serviceworkforce-locationgroups-count) |
| GET | `/api/serviceworkforce/locationgroups/{identifier}` | [find one locationGroup](https://developer.fountain.com/reference/get_api-serviceworkforce-locationgroups-identifier) |
| PUT | `/api/serviceworkforce/locationgroups/{identifier}` | [replace one locationGroup which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-locationgroups-identifier) |
| PATCH | `/api/serviceworkforce/locationgroups/{identifier}` | [partially update one existing locationGroup](https://developer.fountain.com/reference/patch_api-serviceworkforce-locationgroups-identifier) |
| DELETE | `/api/serviceworkforce/locationgroups/{identifier}` | [delete one locationGroup](https://developer.fountain.com/reference/delete_api-serviceworkforce-locationgroups-identifier) |
| GET | `/api/serviceworkforce/locationgroups` | [find many locationGroups](https://developer.fountain.com/reference/get_api-serviceworkforce-locationgroups) |
| POST | `/api/serviceworkforce/locationgroups` | [create one or multiple locationGroups](https://developer.fountain.com/reference/post_api-serviceworkforce-locationgroups) |
| PUT | `/api/serviceworkforce/locationgroups` | [replace many locationGroups which exists or not](https://developer.fountain.com/reference/put_api-serviceworkforce-locationgroups) |
| PATCH | `/api/serviceworkforce/locationgroups` | [partially update many existing locationGroup](https://developer.fountain.com/reference/patch_api-serviceworkforce-locationgroups) |
| DELETE | `/api/serviceworkforce/locationgroups` | [delete many locationGroups](https://developer.fountain.com/reference/delete_api-serviceworkforce-locationgroups) |
| GET | `/api/serviceworkforce/locationgrouptrees/count` | [count locationGroupTrees](https://developer.fountain.com/reference/get_api-serviceworkforce-locationgrouptrees-count) |
| GET | `/api/serviceworkforce/locationgrouptrees/{identifier}` | [find one locationGroupTree](https://developer.fountain.com/reference/get_api-serviceworkforce-locationgrouptrees-identifier) |
| GET | `/api/serviceworkforce/locationgrouptrees` | [find many locationGroupTrees](https://developer.fountain.com/reference/get_api-serviceworkforce-locationgrouptrees) |
| GET | `/api/serviceworkforce/audiencelocations/count` | [count audienceLocations](https://developer.fountain.com/reference/get_api-serviceworkforce-audiencelocations-count) |
| GET | `/api/serviceworkforce/audiencelocations/{identifier}` | [find one audienceLocation](https://developer.fountain.com/reference/get_api-serviceworkforce-audiencelocations-identifier) |
| GET | `/api/serviceworkforce/audiencelocations` | [find many audienceLocations](https://developer.fountain.com/reference/get_api-serviceworkforce-audiencelocations) |
| GET | `/api/serviceworkforce/audiencejobs/count` | [count audienceJobs](https://developer.fountain.com/reference/get_api-serviceworkforce-audiencejobs-count) |
| GET | `/api/serviceworkforce/audiencejobs/{identifier}` | [find one audienceJob](https://developer.fountain.com/reference/get_api-serviceworkforce-audiencejobs-identifier) |
| GET | `/api/serviceworkforce/audiencejobs` | [find many audienceJobs](https://developer.fountain.com/reference/get_api-serviceworkforce-audiencejobs) |
| GET | `/api/serviceworkforce/audienceopenings/count` | [count audienceOpenings](https://developer.fountain.com/reference/get_api-serviceworkforce-audienceopenings-count) |
| GET | `/api/serviceworkforce/audienceopenings/{identifier}` | [find one audienceOpening](https://developer.fountain.com/reference/get_api-serviceworkforce-audienceopenings-identifier) |
| GET | `/api/serviceworkforce/audienceopenings` | [find many audienceOpenings](https://developer.fountain.com/reference/get_api-serviceworkforce-audienceopenings) |
| PATCH | `/api/serviceworkforce/processes/locationgroups/{locationgroupuuid}/custom/attributes` | [Update a location group and replace its Company Attributes with the payload](https://developer.fountain.com/reference/patch_api-serviceworkforce-processes-locationgroups-locationgroupuuid-custom-attributes) |
| POST | `/api/serviceworkforce/processes/locationgroups/custom/attributes` | [Create a location group and replace its Company Attributes with the payload](https://developer.fountain.com/reference/post_api-serviceworkforce-processes-locationgroups-custom-attributes) |
| GET | `/api/serviceworkforce/openings/count` | [count openings](https://developer.fountain.com/reference/get_api-serviceworkforce-openings-count) |
| GET | `/api/serviceworkforce/openings/{identifier}` | [find one opening](https://developer.fountain.com/reference/get_api-serviceworkforce-openings-identifier) |
| GET | `/api/serviceworkforce/openings` | [find many openings](https://developer.fountain.com/reference/get_api-serviceworkforce-openings) |

## serviceattendance — Time & Attendance (timesheets, time-off, shifts, shift tags, attendance policies, allowances, demands) — 81 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/serviceattendance/processes/attendancepolicies/location/{locationuuid}` | [Find attendance policy for a given location](https://developer.fountain.com/reference/get_api-serviceattendance-processes-attendancepolicies-location-locationuuid) |
| GET | `/api/serviceattendance/processes/attendancepolicies/locationgroup/{locationgroupuuid}` | [Find attendance policy for a given location group](https://developer.fountain.com/reference/get_api-serviceattendance-processes-attendancepolicies-locationgroup-locationgroupuuid) |
| POST | `/api/serviceattendance/processes/allowances/createandassociate` | [Create an allowance and associate it with a location](https://developer.fountain.com/reference/post_api-serviceattendance-processes-allowances-createandassociate) |
| POST | `/api/serviceattendance/processes/allowances/deleteanddisassociate` | [Delete one or more allowances](https://developer.fountain.com/reference/post_api-serviceattendance-processes-allowances-deleteanddisassociate) |
| GET | `/api/serviceattendance/timeoff/count` | [count timeOff](https://developer.fountain.com/reference/get_api-serviceattendance-timeoff-count) |
| GET | `/api/serviceattendance/timeoff/{identifier}` | [find one timeOff](https://developer.fountain.com/reference/get_api-serviceattendance-timeoff-identifier) |
| GET | `/api/serviceattendance/timeoff` | [find many timeOff](https://developer.fountain.com/reference/get_api-serviceattendance-timeoff) |
| POST | `/api/serviceattendance/processes/timeoff` | [/api/serviceattendance/processes/timeOff](https://developer.fountain.com/reference/post_api-serviceattendance-processes-timeoff) |
| PATCH | `/api/serviceattendance/processes/timeoff/{timeoffuuid}` | [/api/serviceattendance/processes/timeOff/{timeOffUuid}](https://developer.fountain.com/reference/patch_api-serviceattendance-processes-timeoff-timeoffuuid) |
| DELETE | `/api/serviceattendance/processes/timeoff/{timeoffuuid}` | [Delete time-off](https://developer.fountain.com/reference/delete_api-serviceattendance-processes-timeoff-timeoffuuid) |
| GET | `/api/serviceattendance/timesheets/count` | [count timesheets](https://developer.fountain.com/reference/get_api-serviceattendance-timesheets-count) |
| GET | `/api/serviceattendance/timesheets/{identifier}` | [find one timesheet](https://developer.fountain.com/reference/get_api-serviceattendance-timesheets-identifier) |
| PATCH | `/api/serviceattendance/timesheets/{identifier}` | [partially update one existing timesheet](https://developer.fountain.com/reference/patch_api-serviceattendance-timesheets-identifier) |
| GET | `/api/serviceattendance/timesheets` | [find many timesheets](https://developer.fountain.com/reference/get_api-serviceattendance-timesheets) |
| POST | `/api/serviceattendance/timesheets` | [create one or multiple timesheets](https://developer.fountain.com/reference/post_api-serviceattendance-timesheets) |
| PATCH | `/api/serviceattendance/timesheets` | [partially update many existing timesheet](https://developer.fountain.com/reference/patch_api-serviceattendance-timesheets) |
| POST | `/api/serviceattendance/processes/timesheets/markdeleted` | [Marks a timesheet as deleted and cancels scheduled events](https://developer.fountain.com/reference/post_api-serviceattendance-processes-timesheets-markdeleted) |
| PATCH | `/api/serviceattendance/processes/timesheets/{timesheetuuid}/addclockevent` | [/api/serviceattendance/processes/timesheets/{timesheetUuid}/addClockEvent](https://developer.fountain.com/reference/patch_api-serviceattendance-processes-timesheets-timesheetuuid-addclockevent) |
| POST | `/api/serviceattendance/processes/timesheets/exportviaapi` | [Exports timesheets to the preconfigured payroll webhook integration](https://developer.fountain.com/reference/post_api-serviceattendance-processes-timesheets-exportviaapi) |
| POST | `/api/serviceattendance/processes/timesheets/export` | [Returns exported headers, rows, filename for timesheets. Specify target timesheets by uuid or by filter](https://developer.fountain.com/reference/post_api-serviceattendance-processes-timesheets-export) |
| POST | `/api/serviceattendance/processes/timesheets/getexportabletimesheets` | [Returns exported headers, rows, filename for timesheets. Specify target timesheets by uuid or by filter](https://developer.fountain.com/reference/post_api-serviceattendance-processes-timesheets-getexportabletimesheets) |
| GET | `/api/serviceattendance/workerrequests/count` | [count workerRequests](https://developer.fountain.com/reference/get_api-serviceattendance-workerrequests-count) |
| GET | `/api/serviceattendance/workerrequests/{identifier}` | [find one workerRequest](https://developer.fountain.com/reference/get_api-serviceattendance-workerrequests-identifier) |
| GET | `/api/serviceattendance/workerrequests` | [find many workerRequests](https://developer.fountain.com/reference/get_api-serviceattendance-workerrequests) |
| GET | `/api/serviceattendance/demands/count` | [count demands](https://developer.fountain.com/reference/get_api-serviceattendance-demands-count) |
| GET | `/api/serviceattendance/demands/{identifier}` | [find one demand](https://developer.fountain.com/reference/get_api-serviceattendance-demands-identifier) |
| GET | `/api/serviceattendance/demands` | [find many demands](https://developer.fountain.com/reference/get_api-serviceattendance-demands) |
| GET | `/api/serviceattendance/shifttags/count` | [count shiftTags](https://developer.fountain.com/reference/get_api-serviceattendance-shifttags-count) |
| GET | `/api/serviceattendance/shifttags/{identifier}` | [find one shiftTag](https://developer.fountain.com/reference/get_api-serviceattendance-shifttags-identifier) |
| PATCH | `/api/serviceattendance/shifttags/{identifier}` | [partially update one existing shiftTag](https://developer.fountain.com/reference/patch_api-serviceattendance-shifttags-identifier) |
| DELETE | `/api/serviceattendance/shifttags/{identifier}` | [delete one shiftTag](https://developer.fountain.com/reference/delete_api-serviceattendance-shifttags-identifier) |
| GET | `/api/serviceattendance/shifttags` | [find many shiftTags](https://developer.fountain.com/reference/get_api-serviceattendance-shifttags) |
| POST | `/api/serviceattendance/shifttags` | [create one or multiple shiftTags](https://developer.fountain.com/reference/post_api-serviceattendance-shifttags) |
| PATCH | `/api/serviceattendance/shifttags` | [partially update many existing shiftTag](https://developer.fountain.com/reference/patch_api-serviceattendance-shifttags) |
| DELETE | `/api/serviceattendance/shifttags` | [delete many shiftTags](https://developer.fountain.com/reference/delete_api-serviceattendance-shifttags) |
| GET | `/api/serviceattendance/processes/allowancesettings/location/{locationuuid}` | [Find allowance settings for a given location](https://developer.fountain.com/reference/get_api-serviceattendance-processes-allowancesettings-location-locationuuid) |
| GET | `/api/serviceattendance/processes/allowancesettings/locationgroup/{locationgroupuuid}` | [Find allowance settings for a given location group](https://developer.fountain.com/reference/get_api-serviceattendance-processes-allowancesettings-locationgroup-locationgroupuuid) |
| GET | `/api/serviceattendance/processes/allowancesettings/location/{locationuuid}/count` | [Count allowance for a given location](https://developer.fountain.com/reference/get_api-serviceattendance-processes-allowancesettings-location-locationuuid-count) |
| GET | `/api/serviceattendance/processes/allowancesettings/locationgroup/{locationgroupuuid}/count` | [Count allowance for a given location group](https://developer.fountain.com/reference/get_api-serviceattendance-processes-allowancesettings-locationgroup-locationgroupuuid-count) |
| POST | `/api/serviceattendance/processes/allowancesettings/allowancesettinguuid/clone` | [Clone allowance settings with allowances](https://developer.fountain.com/reference/post_api-serviceattendance-processes-allowancesettings-allowancesettinguuid-clone) |
| GET | `/api/serviceattendance/processes/automaticbreaksettings/location/{locationuuid}` | [Find automatic break settings for a given location](https://developer.fountain.com/reference/get_api-serviceattendance-processes-automaticbreaksettings-location-locationuuid) |
| GET | `/api/serviceattendance/processes/automaticbreaksettings/locationgroup/{locationgroupuuid}` | [Find automatic break settings for a given location group](https://developer.fountain.com/reference/get_api-serviceattendance-processes-automaticbreaksettings-locationgroup-locationgroupuuid) |
| GET | `/api/serviceattendance/processes/automaticbreaksettings/location/{locationuuid}/count` | [Count automatic break rules for a given location](https://developer.fountain.com/reference/get_api-serviceattendance-processes-automaticbreaksettings-location-locationuuid-count) |
| GET | `/api/serviceattendance/processes/automaticbreaksettings/locationgroup/{locationgroupuuid}/count` | [Count automatic break rules for a given location group](https://developer.fountain.com/reference/get_api-serviceattendance-processes-automaticbreaksettings-locationgroup-locationgroupuuid-count) |
| POST | `/api/serviceattendance/processes/automaticbreaksettings/automaticbreaksettinguuid/clone` | [Clone automatic break settings with automatic break rules](https://developer.fountain.com/reference/post_api-serviceattendance-processes-automaticbreaksettings-automaticbreaksettinguuid-clone) |
| POST | `/api/serviceattendance/processes/automaticbreakrules/createandassociate` | [Create an automatic break rule and associate it with a location](https://developer.fountain.com/reference/post_api-serviceattendance-processes-automaticbreakrules-createandassociate) |
| POST | `/api/serviceattendance/processes/automaticbreakrules/deleteanddisassociate` | [Delete one or more automatic break rules](https://developer.fountain.com/reference/post_api-serviceattendance-processes-automaticbreakrules-deleteanddisassociate) |
| POST | `/api/serviceattendance/processes/holidayrules/createandassociate` | [Create a holiday rule and associate it with a location](https://developer.fountain.com/reference/post_api-serviceattendance-processes-holidayrules-createandassociate) |
| POST | `/api/serviceattendance/processes/holidayrules/deleteanddisassociate` | [Delete one or more holiday rules](https://developer.fountain.com/reference/post_api-serviceattendance-processes-holidayrules-deleteanddisassociate) |
| PATCH | `/api/serviceattendance/processes/holidayrules/updateholidayrules` | [Update holiday rule(s) and invalidate overlapping schedules for re-evaluation](https://developer.fountain.com/reference/patch_api-serviceattendance-processes-holidayrules-updateholidayrules) |
| POST | `/api/serviceattendance/processes/holidayrules/getactiveholidayrulesforlocations` | [Get active holiday rules for specified locations within a date range](https://developer.fountain.com/reference/post_api-serviceattendance-processes-holidayrules-getactiveholidayrulesforlocations) |
| GET | `/api/serviceattendance/processes/holidayrulesettings/location/{locationuuid}` | [Find holiday rule settings for a given location](https://developer.fountain.com/reference/get_api-serviceattendance-processes-holidayrulesettings-location-locationuuid) |
| GET | `/api/serviceattendance/processes/holidayrulesettings/locationgroup/{locationgroupuuid}` | [Find holiday rule settings for a given location group](https://developer.fountain.com/reference/get_api-serviceattendance-processes-holidayrulesettings-locationgroup-locationgroupuuid) |
| GET | `/api/serviceattendance/processes/holidayrulesettings/location/{locationuuid}/count` | [Count holiday rule settings for a given location](https://developer.fountain.com/reference/get_api-serviceattendance-processes-holidayrulesettings-location-locationuuid-count) |
| GET | `/api/serviceattendance/processes/holidayrulesettings/locationgroup/{locationgroupuuid}/count` | [Count holiday rule settings for a given location group](https://developer.fountain.com/reference/get_api-serviceattendance-processes-holidayrulesettings-locationgroup-locationgroupuuid-count) |
| POST | `/api/serviceattendance/processes/holidayrulesettings/holidayrulesettinguuid/clone` | [Clone holiday rule settings](https://developer.fountain.com/reference/post_api-serviceattendance-processes-holidayrulesettings-holidayrulesettinguuid-clone) |
| DELETE | `/api/serviceattendance/processes/holidayrulesettings/holidayrulesettinguuid` | [Delete holiday rule settings and re-evaluate workers for inheritance](https://developer.fountain.com/reference/delete_api-serviceattendance-processes-holidayrulesettings-holidayrulesettinguuid) |
| GET | `/api/serviceattendance/generalsettings/count` | [count generalSettings](https://developer.fountain.com/reference/get_api-serviceattendance-generalsettings-count) |
| GET | `/api/serviceattendance/generalsettings/{identifier}` | [find one generalSetting](https://developer.fountain.com/reference/get_api-serviceattendance-generalsettings-identifier) |
| GET | `/api/serviceattendance/generalsettings` | [find many generalSettings](https://developer.fountain.com/reference/get_api-serviceattendance-generalsettings) |
| GET | `/api/serviceattendance/processes/generalsettings` | [/api/serviceattendance/processes/generalSettings](https://developer.fountain.com/reference/get_api-serviceattendance-processes-generalsettings) |
| POST | `/api/serviceattendance/processes/workerrequestrules/createandassociate` | [Create a worker request rule and associate it with a location or location group](https://developer.fountain.com/reference/post_api-serviceattendance-processes-workerrequestrules-createandassociate) |
| POST | `/api/serviceattendance/processes/workerrequestrules/deleteanddisassociate` | [Delete one or more worker request rules](https://developer.fountain.com/reference/post_api-serviceattendance-processes-workerrequestrules-deleteanddisassociate) |
| GET | `/api/serviceattendance/shifts/count` | [count shifts](https://developer.fountain.com/reference/get_api-serviceattendance-shifts-count) |
| GET | `/api/serviceattendance/shifts/{identifier}` | [find one shift](https://developer.fountain.com/reference/get_api-serviceattendance-shifts-identifier) |
| GET | `/api/serviceattendance/shifts` | [find many shifts](https://developer.fountain.com/reference/get_api-serviceattendance-shifts) |
| POST | `/api/serviceattendance/shifts` | [create one or multiple shifts](https://developer.fountain.com/reference/post_api-serviceattendance-shifts) |
| PATCH | `/api/serviceattendance/processes/shifts` | [Update shifts, validated by rules. Fails with a 409 if there are any blockers. Note: When adding breaks use v4 uuid.](https://developer.fountain.com/reference/patch_api-serviceattendance-processes-shifts) |
| DELETE | `/api/serviceattendance/processes/shifts/shiftuuid` | [/api/serviceattendance/processes/shifts/{shiftUuid}](https://developer.fountain.com/reference/delete_api-serviceattendance-processes-shifts-shiftuuid) |
| POST | `/api/serviceattendance/processes/shifts/{locationuuid}/publish` | [/api/serviceattendance/processes/shifts/{locationUuid}/publish](https://developer.fountain.com/reference/post_api-serviceattendance-processes-shifts-locationuuid-publish) |
| POST | `/api/serviceattendance/processes/shifts/shiftuuid/resetnextversion` | [/api/serviceattendance/processes/shifts/{shiftUuid}/resetNextVersion](https://developer.fountain.com/reference/post_api-serviceattendance-processes-shifts-shiftuuid-resetnextversion) |
| POST | `/api/serviceattendance/processes/shifts/shiftuuid/publishsingleshift` | [Publish an individual shift](https://developer.fountain.com/reference/post_api-serviceattendance-processes-shifts-shiftuuid-publishsingleshift) |
| POST | `/api/serviceattendance/processes/demand/bulkcreate` | [Creates bulk demand for a given period](https://developer.fountain.com/reference/post_api-serviceattendance-processes-demand-bulkcreate) |
| POST | `/api/serviceattendance/processes/demand/createshifts` | [Creates shifts for a specific demand or list of demands](https://developer.fountain.com/reference/post_api-serviceattendance-processes-demand-createshifts) |
| DELETE | `/api/serviceattendance/processes/shifts/deleteshifts` | [Delete multiple shifts](https://developer.fountain.com/reference/delete_api-serviceattendance-processes-shifts-deleteshifts) |
| POST | `/api/serviceattendance/processes/shifts/publishshifts` | [Publish multiple shifts](https://developer.fountain.com/reference/post_api-serviceattendance-processes-shifts-publishshifts) |
| GET | `/api/serviceattendance/attendanceactivitylog/count` | [count attendanceActivityLogs](https://developer.fountain.com/reference/get_api-serviceattendance-attendanceactivitylog-count) |
| GET | `/api/serviceattendance/attendanceactivitylog/{identifier}` | [find one attendanceActivityLog](https://developer.fountain.com/reference/get_api-serviceattendance-attendanceactivitylog-identifier) |
| GET | `/api/serviceattendance/attendanceactivitylog` | [find many attendanceActivityLogs](https://developer.fountain.com/reference/get_api-serviceattendance-attendanceactivitylog) |
| POST | `/api/serviceattendance/processes/timesheetflagrules/createandassociate` | [Create a timesheet flag rule and associate it with a location or location group](https://developer.fountain.com/reference/post_api-serviceattendance-processes-timesheetflagrules-createandassociate) |
| POST | `/api/serviceattendance/processes/timesheetflagrules/deleteanddisassociate` | [Delete one or more timesheet flag rules](https://developer.fountain.com/reference/post_api-serviceattendance-processes-timesheetflagrules-deleteanddisassociate) |

## serviceorganizations — Org/tenant structure (companies, brands, EINs, company attributes/sets, Copilot audit logs) — 60 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/serviceorganizations/brands/count` | [count brands](https://developer.fountain.com/reference/get_api-serviceorganizations-brands-count) |
| GET | `/api/serviceorganizations/brands/{identifier}` | [find one brand](https://developer.fountain.com/reference/get_api-serviceorganizations-brands-identifier) |
| PUT | `/api/serviceorganizations/brands/{identifier}` | [replace one brand which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-brands-identifier) |
| PATCH | `/api/serviceorganizations/brands/{identifier}` | [partially update one existing brand](https://developer.fountain.com/reference/patch_api-serviceorganizations-brands-identifier) |
| DELETE | `/api/serviceorganizations/brands/{identifier}` | [delete one brand](https://developer.fountain.com/reference/delete_api-serviceorganizations-brands-identifier) |
| GET | `/api/serviceorganizations/brands` | [find many brands](https://developer.fountain.com/reference/get_api-serviceorganizations-brands) |
| POST | `/api/serviceorganizations/brands` | [create one or multiple brands](https://developer.fountain.com/reference/post_api-serviceorganizations-brands) |
| PUT | `/api/serviceorganizations/brands` | [replace many brands which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-brands) |
| PATCH | `/api/serviceorganizations/brands` | [partially update many existing brand](https://developer.fountain.com/reference/patch_api-serviceorganizations-brands) |
| DELETE | `/api/serviceorganizations/brands` | [delete many brands](https://developer.fountain.com/reference/delete_api-serviceorganizations-brands) |
| GET | `/api/serviceorganizations/processes/brands/default` | [get a company default brand](https://developer.fountain.com/reference/get_api-serviceorganizations-processes-brands-default) |
| GET | `/api/serviceorganizations/companies/count` | [count companies](https://developer.fountain.com/reference/get_api-serviceorganizations-companies-count) |
| GET | `/api/serviceorganizations/companies/{identifier}` | [find one company](https://developer.fountain.com/reference/get_api-serviceorganizations-companies-identifier) |
| PUT | `/api/serviceorganizations/companies/{identifier}` | [replace one company which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-companies-identifier) |
| PATCH | `/api/serviceorganizations/companies/{identifier}` | [partially update one existing company](https://developer.fountain.com/reference/patch_api-serviceorganizations-companies-identifier) |
| GET | `/api/serviceorganizations/companies` | [find many companies](https://developer.fountain.com/reference/get_api-serviceorganizations-companies) |
| PUT | `/api/serviceorganizations/companies` | [replace many companies which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-companies) |
| PATCH | `/api/serviceorganizations/companies` | [partially update many existing company](https://developer.fountain.com/reference/patch_api-serviceorganizations-companies) |
| POST | `/api/serviceorganizations/processes/companies/{companyuuid}/smsregistration` | [Submit SMS brand registration for a company](https://developer.fountain.com/reference/post_api-serviceorganizations-processes-companies-companyuuid-smsregistration) |
| GET | `/api/serviceorganizations/companyattributes/count` | [count companyAttributes](https://developer.fountain.com/reference/get_api-serviceorganizations-companyattributes-count) |
| GET | `/api/serviceorganizations/companyattributes/{identifier}` | [find one companyAttribute](https://developer.fountain.com/reference/get_api-serviceorganizations-companyattributes-identifier) |
| PUT | `/api/serviceorganizations/companyattributes/{identifier}` | [replace one companyAttribute which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-companyattributes-identifier) |
| PATCH | `/api/serviceorganizations/companyattributes/{identifier}` | [partially update one existing companyAttribute](https://developer.fountain.com/reference/patch_api-serviceorganizations-companyattributes-identifier) |
| DELETE | `/api/serviceorganizations/companyattributes/{identifier}` | [delete one companyAttribute](https://developer.fountain.com/reference/delete_api-serviceorganizations-companyattributes-identifier) |
| GET | `/api/serviceorganizations/companyattributes` | [find many companyAttributes](https://developer.fountain.com/reference/get_api-serviceorganizations-companyattributes) |
| POST | `/api/serviceorganizations/companyattributes` | [create one or multiple companyAttributes](https://developer.fountain.com/reference/post_api-serviceorganizations-companyattributes) |
| PUT | `/api/serviceorganizations/companyattributes` | [replace many companyAttributes which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-companyattributes) |
| PATCH | `/api/serviceorganizations/companyattributes` | [partially update many existing companyAttribute](https://developer.fountain.com/reference/patch_api-serviceorganizations-companyattributes) |
| DELETE | `/api/serviceorganizations/companyattributes` | [delete many companyAttributes](https://developer.fountain.com/reference/delete_api-serviceorganizations-companyattributes) |
| GET | `/api/serviceorganizations/companyattributesets/count` | [count companyAttributeSets](https://developer.fountain.com/reference/get_api-serviceorganizations-companyattributesets-count) |
| GET | `/api/serviceorganizations/companyattributesets/{identifier}` | [find one companyAttributeSet](https://developer.fountain.com/reference/get_api-serviceorganizations-companyattributesets-identifier) |
| PUT | `/api/serviceorganizations/companyattributesets/{identifier}` | [replace one companyAttributeSet which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-companyattributesets-identifier) |
| PATCH | `/api/serviceorganizations/companyattributesets/{identifier}` | [partially update one existing companyAttributeSet](https://developer.fountain.com/reference/patch_api-serviceorganizations-companyattributesets-identifier) |
| DELETE | `/api/serviceorganizations/companyattributesets/{identifier}` | [delete one companyAttributeSet](https://developer.fountain.com/reference/delete_api-serviceorganizations-companyattributesets-identifier) |
| GET | `/api/serviceorganizations/companyattributesets` | [find many companyAttributeSets](https://developer.fountain.com/reference/get_api-serviceorganizations-companyattributesets) |
| POST | `/api/serviceorganizations/companyattributesets` | [create one or multiple companyAttributeSets](https://developer.fountain.com/reference/post_api-serviceorganizations-companyattributesets) |
| PUT | `/api/serviceorganizations/companyattributesets` | [replace many companyAttributeSets which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-companyattributesets) |
| PATCH | `/api/serviceorganizations/companyattributesets` | [partially update many existing companyAttributeSet](https://developer.fountain.com/reference/patch_api-serviceorganizations-companyattributesets) |
| DELETE | `/api/serviceorganizations/companyattributesets` | [delete many companyAttributeSets](https://developer.fountain.com/reference/delete_api-serviceorganizations-companyattributesets) |
| GET | `/api/serviceorganizations/eins/count` | [count eins](https://developer.fountain.com/reference/get_api-serviceorganizations-eins-count) |
| GET | `/api/serviceorganizations/eins/{identifier}` | [find one ein](https://developer.fountain.com/reference/get_api-serviceorganizations-eins-identifier) |
| PUT | `/api/serviceorganizations/eins/{identifier}` | [replace one ein which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-eins-identifier) |
| PATCH | `/api/serviceorganizations/eins/{identifier}` | [partially update one existing ein](https://developer.fountain.com/reference/patch_api-serviceorganizations-eins-identifier) |
| DELETE | `/api/serviceorganizations/eins/{identifier}` | [delete one ein](https://developer.fountain.com/reference/delete_api-serviceorganizations-eins-identifier) |
| GET | `/api/serviceorganizations/eins` | [find many eins](https://developer.fountain.com/reference/get_api-serviceorganizations-eins) |
| POST | `/api/serviceorganizations/eins` | [create one or multiple eins](https://developer.fountain.com/reference/post_api-serviceorganizations-eins) |
| PUT | `/api/serviceorganizations/eins` | [replace many eins which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-eins) |
| PATCH | `/api/serviceorganizations/eins` | [partially update many existing ein](https://developer.fountain.com/reference/patch_api-serviceorganizations-eins) |
| DELETE | `/api/serviceorganizations/eins` | [delete many eins](https://developer.fountain.com/reference/delete_api-serviceorganizations-eins) |
| PATCH | `/api/serviceorganizations/processes/mcp/eins` | [Update one or multiple existing Employer Identification Numbers (EINs) metadata](https://developer.fountain.com/reference/patch_api-serviceorganizations-processes-mcp-eins) |
| GET | `/api/serviceorganizations/copilotauditlogs/count` | [count copilotAuditLogs](https://developer.fountain.com/reference/get_api-serviceorganizations-copilotauditlogs-count) |
| GET | `/api/serviceorganizations/copilotauditlogs/{identifier}` | [find one copilotAuditLog](https://developer.fountain.com/reference/get_api-serviceorganizations-copilotauditlogs-identifier) |
| PUT | `/api/serviceorganizations/copilotauditlogs/{identifier}` | [replace one copilotAuditLog which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-copilotauditlogs-identifier) |
| PATCH | `/api/serviceorganizations/copilotauditlogs/{identifier}` | [partially update one existing copilotAuditLog](https://developer.fountain.com/reference/patch_api-serviceorganizations-copilotauditlogs-identifier) |
| DELETE | `/api/serviceorganizations/copilotauditlogs/{identifier}` | [delete one copilotAuditLog](https://developer.fountain.com/reference/delete_api-serviceorganizations-copilotauditlogs-identifier) |
| GET | `/api/serviceorganizations/copilotauditlogs` | [find many copilotAuditLogs](https://developer.fountain.com/reference/get_api-serviceorganizations-copilotauditlogs) |
| POST | `/api/serviceorganizations/copilotauditlogs` | [create one or multiple copilotAuditLogs](https://developer.fountain.com/reference/post_api-serviceorganizations-copilotauditlogs) |
| PUT | `/api/serviceorganizations/copilotauditlogs` | [replace many copilotAuditLogs which exists or not](https://developer.fountain.com/reference/put_api-serviceorganizations-copilotauditlogs) |
| PATCH | `/api/serviceorganizations/copilotauditlogs` | [partially update many existing copilotAuditLog](https://developer.fountain.com/reference/patch_api-serviceorganizations-copilotauditlogs) |
| DELETE | `/api/serviceorganizations/copilotauditlogs` | [delete many copilotAuditLogs](https://developer.fountain.com/reference/delete_api-serviceorganizations-copilotauditlogs) |

## servicetodo — Onboarding task engine (task flows incl. Copilot-generated, assigned tasks, W-4 profiles) — 57 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicetodo/taskflows/count` | [count taskFlows](https://developer.fountain.com/reference/get_api-servicetodo-taskflows-count) |
| GET | `/api/servicetodo/taskflows/{identifier}` | [find one taskFlow](https://developer.fountain.com/reference/get_api-servicetodo-taskflows-identifier) |
| PATCH | `/api/servicetodo/taskflows/{identifier}` | [partially update one existing taskFlow](https://developer.fountain.com/reference/patch_api-servicetodo-taskflows-identifier) |
| DELETE | `/api/servicetodo/taskflows/{identifier}` | [delete one taskFlow](https://developer.fountain.com/reference/delete_api-servicetodo-taskflows-identifier) |
| GET | `/api/servicetodo/taskflows` | [find many taskFlows](https://developer.fountain.com/reference/get_api-servicetodo-taskflows) |
| POST | `/api/servicetodo/taskflows` | [create one or multiple taskFlows](https://developer.fountain.com/reference/post_api-servicetodo-taskflows) |
| PATCH | `/api/servicetodo/taskflows` | [partially update many existing taskFlow](https://developer.fountain.com/reference/patch_api-servicetodo-taskflows) |
| DELETE | `/api/servicetodo/taskflows` | [delete many taskFlows](https://developer.fountain.com/reference/delete_api-servicetodo-taskflows) |
| POST | `/api/servicetodo/processes/taskflows/clone` | [clone task flow(s)](https://developer.fountain.com/reference/post_api-servicetodo-processes-taskflows-clone) |
| GET | `/api/servicetodo/processes/taskflows/checkcalendargroupusage` | [Check if a calendar group is used by any task flows](https://developer.fountain.com/reference/get_api-servicetodo-processes-taskflows-checkcalendargroupusage) |
| GET | `/api/servicetodo/processes/taskflows/{taskflowidentifier}/workers/processed` | [Retrieve all workers of a taskFlow with data such as completion rate of tasks](https://developer.fountain.com/reference/get_api-servicetodo-processes-taskflows-taskflowidentifier-workers-processed) |
| GET | `/api/servicetodo/processes/taskflows/{taskflowidentifier}/workers/{workeridentifier}/processed` | [Retrieve all information about one worker and its taskFlow completion](https://developer.fountain.com/reference/get_api-servicetodo-processes-taskflows-taskflowidentifier-workers-workeridentifier-processed) |
| GET | `/api/servicetodo/processes/taskflows/workers/{workeridentifier}/processed` | [Retrieve all taskFlows for a given worker with data such as completion rate of tasks](https://developer.fountain.com/reference/get_api-servicetodo-processes-taskflows-workers-workeridentifier-processed) |
| POST | `/api/servicetodo/processes/taskflows/createforcopilot` | [Create task flow for copilot](https://developer.fountain.com/reference/post_api-servicetodo-processes-taskflows-createforcopilot) |
| POST | `/api/servicetodo/processes/taskflows/cloneforcopilot` | [Clone a draft task flow as a Test flow for copilot](https://developer.fountain.com/reference/post_api-servicetodo-processes-taskflows-cloneforcopilot) |
| POST | `/api/servicetodo/processes/taskflows/{taskflowidentifier}/publishforcopilot` | [Publish a Test task flow for copilot](https://developer.fountain.com/reference/post_api-servicetodo-processes-taskflows-taskflowidentifier-publishforcopilot) |
| POST | `/api/servicetodo/processes/taskflows/applytestchangestodraftforcopilot` | [Apply Test task flow changes back to its source draft](https://developer.fountain.com/reference/post_api-servicetodo-processes-taskflows-applytestchangestodraftforcopilot) |
| DELETE | `/api/servicetodo/processes/taskflows/{taskflowidentifier}/forcopilot` | [Delete a Test task flow for copilot](https://developer.fountain.com/reference/delete_api-servicetodo-processes-taskflows-taskflowidentifier-forcopilot) |
| GET | `/api/servicetodo/tasks/count` | [count tasks](https://developer.fountain.com/reference/get_api-servicetodo-tasks-count) |
| GET | `/api/servicetodo/tasks/{identifier}` | [find one task](https://developer.fountain.com/reference/get_api-servicetodo-tasks-identifier) |
| PATCH | `/api/servicetodo/tasks/{identifier}` | [partially update one existing task](https://developer.fountain.com/reference/patch_api-servicetodo-tasks-identifier) |
| DELETE | `/api/servicetodo/tasks/{identifier}` | [delete one task](https://developer.fountain.com/reference/delete_api-servicetodo-tasks-identifier) |
| GET | `/api/servicetodo/tasks` | [find many tasks](https://developer.fountain.com/reference/get_api-servicetodo-tasks) |
| POST | `/api/servicetodo/tasks` | [create one or multiple tasks](https://developer.fountain.com/reference/post_api-servicetodo-tasks) |
| PATCH | `/api/servicetodo/tasks` | [partially update many existing task](https://developer.fountain.com/reference/patch_api-servicetodo-tasks) |
| DELETE | `/api/servicetodo/tasks` | [delete many tasks](https://developer.fountain.com/reference/delete_api-servicetodo-tasks) |
| GET | `/api/servicetodo/assignedtasks/count` | [count assignedTasks](https://developer.fountain.com/reference/get_api-servicetodo-assignedtasks-count) |
| GET | `/api/servicetodo/assignedtasks/{identifier}` | [find one assignedTask](https://developer.fountain.com/reference/get_api-servicetodo-assignedtasks-identifier) |
| PATCH | `/api/servicetodo/assignedtasks/{identifier}` | [partially update one existing assignedTask](https://developer.fountain.com/reference/patch_api-servicetodo-assignedtasks-identifier) |
| GET | `/api/servicetodo/assignedtasks` | [find many assignedTasks](https://developer.fountain.com/reference/get_api-servicetodo-assignedtasks) |
| PATCH | `/api/servicetodo/assignedtasks` | [partially update many existing assignedTask](https://developer.fountain.com/reference/patch_api-servicetodo-assignedtasks) |
| POST | `/api/servicetodo/processes/assignedtasks/assignedtaskidentifier/completeandresend` | [mark an webhook assignedTask as done programmatically and resend it](https://developer.fountain.com/reference/post_api-servicetodo-processes-assignedtasks-assignedtaskidentifier-completeandresend) |
| POST | `/api/servicetodo/processes/assignedtasks/assignedtaskidentifier/resend` | [retrigger an webhook programmatically for an assignedTask](https://developer.fountain.com/reference/post_api-servicetodo-processes-assignedtasks-assignedtaskidentifier-resend) |
| POST | `/api/servicetodo/processes/workers/{workeruuid}/cleanup` | [trigger the init process of a task again](https://developer.fountain.com/reference/post_api-servicetodo-processes-workers-workeruuid-cleanup) |
| POST | `/api/servicetodo/processes/assignedtasks/assignedtaskidentifier/reinit` | [trigger the init process of a task again](https://developer.fountain.com/reference/post_api-servicetodo-processes-assignedtasks-assignedtaskidentifier-reinit) |
| POST | `/api/servicetodo/processes/assignedtasks/assignedtaskidentifier/complete` | [mark an assignedTask as done programmatically](https://developer.fountain.com/reference/post_api-servicetodo-processes-assignedtasks-assignedtaskidentifier-complete) |
| GET | `/api/servicetodo/w4profiles/count` | [count w4Profiles](https://developer.fountain.com/reference/get_api-servicetodo-w4profiles-count) |
| GET | `/api/servicetodo/w4profiles/{identifier}` | [find one w4Profile](https://developer.fountain.com/reference/get_api-servicetodo-w4profiles-identifier) |
| GET | `/api/servicetodo/w4profiles` | [find many w4Profiles](https://developer.fountain.com/reference/get_api-servicetodo-w4profiles) |
| GET | `/api/servicetodo/processes/yardstick/packages` | [Query Yardstik for the full list of account packages associated with the account defined by the API key](https://developer.fountain.com/reference/get_api-servicetodo-processes-yardstick-packages) |
| GET | `/api/servicetodo/processes/partnertasks/assignedtaskuuid` | [Retrieve an assigned partner task](https://developer.fountain.com/reference/get_api-servicetodo-processes-partnertasks-assignedtaskuuid) |
| POST | `/api/servicetodo/processes/partnertasks/assignedtaskuuid` | [Add a new partner event to an assigned partner task](https://developer.fountain.com/reference/post_api-servicetodo-processes-partnertasks-assignedtaskuuid) |
| POST | `/api/servicetodo/processes/workers/{workeridentifier}/reprocess` | [Reprocess worker onboarding](https://developer.fountain.com/reference/post_api-servicetodo-processes-workers-workeridentifier-reprocess) |
| GET | `/api/servicetodo/processes/universal/dashboard/openings` | [Provides a list of openings for a current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-openings) |
| GET | `/api/servicetodo/processes/universal/dashboard/schedule/events` | [Provides a list of schedule events for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-schedule-events) |
| GET | `/api/servicetodo/processes/universal/dashboard/metrics/reviewapplicants` | [Provides the review applicants task metric for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-metrics-reviewapplicants) |
| GET | `/api/servicetodo/processes/universal/dashboard/metrics/reviewfiles` | [Provides the review files task metric for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-metrics-reviewfiles) |
| GET | `/api/servicetodo/processes/universal/dashboard/metrics/applicants/pipeline` | [Provides the applicants pipeline metric for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-metrics-applicants-pipeline) |
| GET | `/api/servicetodo/processes/universal/dashboard/metrics/applicants/new` | [Provides the new applicants metric for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-metrics-applicants-new) |
| GET | `/api/servicetodo/processes/universal/dashboard/metrics/markattendance` | [Provides the mark attendance task metric for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-metrics-markattendance) |
| GET | `/api/servicetodo/processes/universal/dashboard/metrics/respondtomessages` | [Provides the respond to messages task metric for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-metrics-respondtomessages) |
| GET | `/api/servicetodo/processes/universal/dashboard/metrics/openingapprovals` | [Provides the opening approvals task metric for the current employer user](https://developer.fountain.com/reference/get_api-servicetodo-processes-universal-dashboard-metrics-openingapprovals) |
| GET | `/api/servicetodo/processes/workers/{workeridentifier}/taskflows` | [Get worker task flows](https://developer.fountain.com/reference/get_api-servicetodo-processes-workers-workeridentifier-taskflows) |
| GET | `/api/servicetodo/processes/workers/startsbydate` | [Api endpoint to get workers by start date](https://developer.fountain.com/reference/get_api-servicetodo-processes-workers-startsbydate) |
| GET | `/api/servicetodo/processes/workers/metrics/count` | [Get counts of workers with tasks in different statuses](https://developer.fountain.com/reference/get_api-servicetodo-processes-workers-metrics-count) |
| GET | `/api/servicetodo/processes/workers/{workeridentifier}/partneronboardstatus` | [Get partner status with partnerStatus](https://developer.fountain.com/reference/get_api-servicetodo-processes-workers-workeridentifier-partneronboardstatus) |
| GET | `/api/servicetodo/processes/dashboard/pending/tasks/summary` | [Get dashboard pending tasks summary](https://developer.fountain.com/reference/get_api-servicetodo-processes-dashboard-pending-tasks-summary) |

## servicepulse — Engagement/pulse surveys (surveys, question banks, participants, themes, notification templates) — 43 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicepulse/participants/count` | [count participants](https://developer.fountain.com/reference/get_api-servicepulse-participants-count) |
| GET | `/api/servicepulse/participants/{identifier}` | [find one participant](https://developer.fountain.com/reference/get_api-servicepulse-participants-identifier) |
| GET | `/api/servicepulse/participants` | [find many participants](https://developer.fountain.com/reference/get_api-servicepulse-participants) |
| GET | `/api/servicepulse/questionbanks/count` | [count questionBanks](https://developer.fountain.com/reference/get_api-servicepulse-questionbanks-count) |
| GET | `/api/servicepulse/questionbanks/{identifier}` | [find one questionBank](https://developer.fountain.com/reference/get_api-servicepulse-questionbanks-identifier) |
| PATCH | `/api/servicepulse/questionbanks/{identifier}` | [partially update one existing questionBank](https://developer.fountain.com/reference/patch_api-servicepulse-questionbanks-identifier) |
| DELETE | `/api/servicepulse/questionbanks/{identifier}` | [delete one questionBank](https://developer.fountain.com/reference/delete_api-servicepulse-questionbanks-identifier) |
| GET | `/api/servicepulse/questionbanks` | [find many questionBanks](https://developer.fountain.com/reference/get_api-servicepulse-questionbanks) |
| POST | `/api/servicepulse/questionbanks` | [create one or multiple questionBanks](https://developer.fountain.com/reference/post_api-servicepulse-questionbanks) |
| PATCH | `/api/servicepulse/questionbanks` | [partially update many existing questionBank](https://developer.fountain.com/reference/patch_api-servicepulse-questionbanks) |
| DELETE | `/api/servicepulse/questionbanks` | [delete many questionBanks](https://developer.fountain.com/reference/delete_api-servicepulse-questionbanks) |
| GET | `/api/servicepulse/surveys/count` | [count surveys](https://developer.fountain.com/reference/get_api-servicepulse-surveys-count) |
| GET | `/api/servicepulse/surveys/{identifier}` | [find one survey](https://developer.fountain.com/reference/get_api-servicepulse-surveys-identifier) |
| PATCH | `/api/servicepulse/surveys/{identifier}` | [partially update one existing survey](https://developer.fountain.com/reference/patch_api-servicepulse-surveys-identifier) |
| DELETE | `/api/servicepulse/surveys/{identifier}` | [delete one survey](https://developer.fountain.com/reference/delete_api-servicepulse-surveys-identifier) |
| GET | `/api/servicepulse/surveys` | [find many surveys](https://developer.fountain.com/reference/get_api-servicepulse-surveys) |
| POST | `/api/servicepulse/surveys` | [create one or multiple surveys](https://developer.fountain.com/reference/post_api-servicepulse-surveys) |
| PATCH | `/api/servicepulse/surveys` | [partially update many existing survey](https://developer.fountain.com/reference/patch_api-servicepulse-surveys) |
| DELETE | `/api/servicepulse/surveys` | [delete many surveys](https://developer.fountain.com/reference/delete_api-servicepulse-surveys) |
| GET | `/api/servicepulse/themes/count` | [count themes](https://developer.fountain.com/reference/get_api-servicepulse-themes-count) |
| GET | `/api/servicepulse/themes/{identifier}` | [find one theme](https://developer.fountain.com/reference/get_api-servicepulse-themes-identifier) |
| PATCH | `/api/servicepulse/themes/{identifier}` | [partially update one existing theme](https://developer.fountain.com/reference/patch_api-servicepulse-themes-identifier) |
| DELETE | `/api/servicepulse/themes/{identifier}` | [delete one theme](https://developer.fountain.com/reference/delete_api-servicepulse-themes-identifier) |
| GET | `/api/servicepulse/themes` | [find many themes](https://developer.fountain.com/reference/get_api-servicepulse-themes) |
| POST | `/api/servicepulse/themes` | [create one or multiple themes](https://developer.fountain.com/reference/post_api-servicepulse-themes) |
| PATCH | `/api/servicepulse/themes` | [partially update many existing theme](https://developer.fountain.com/reference/patch_api-servicepulse-themes) |
| DELETE | `/api/servicepulse/themes` | [delete many themes](https://developer.fountain.com/reference/delete_api-servicepulse-themes) |
| GET | `/api/servicepulse/defaultnotificationtemplates/count` | [count defaultNotificationTemplates](https://developer.fountain.com/reference/get_api-servicepulse-defaultnotificationtemplates-count) |
| GET | `/api/servicepulse/defaultnotificationtemplates/{identifier}` | [find one defaultNotificationTemplate](https://developer.fountain.com/reference/get_api-servicepulse-defaultnotificationtemplates-identifier) |
| PATCH | `/api/servicepulse/defaultnotificationtemplates/{identifier}` | [partially update one existing defaultNotificationTemplate](https://developer.fountain.com/reference/patch_api-servicepulse-defaultnotificationtemplates-identifier) |
| DELETE | `/api/servicepulse/defaultnotificationtemplates/{identifier}` | [delete one defaultNotificationTemplate](https://developer.fountain.com/reference/delete_api-servicepulse-defaultnotificationtemplates-identifier) |
| GET | `/api/servicepulse/defaultnotificationtemplates` | [find many defaultNotificationTemplates](https://developer.fountain.com/reference/get_api-servicepulse-defaultnotificationtemplates) |
| POST | `/api/servicepulse/defaultnotificationtemplates` | [create one or multiple defaultNotificationTemplates](https://developer.fountain.com/reference/post_api-servicepulse-defaultnotificationtemplates) |
| PATCH | `/api/servicepulse/defaultnotificationtemplates` | [partially update many existing defaultNotificationTemplate](https://developer.fountain.com/reference/patch_api-servicepulse-defaultnotificationtemplates) |
| DELETE | `/api/servicepulse/defaultnotificationtemplates` | [delete many defaultNotificationTemplates](https://developer.fountain.com/reference/delete_api-servicepulse-defaultnotificationtemplates) |
| GET | `/api/servicepulse/pulsesettings/count` | [count pulseSettings](https://developer.fountain.com/reference/get_api-servicepulse-pulsesettings-count) |
| GET | `/api/servicepulse/pulsesettings/{identifier}` | [find one pulseSettings](https://developer.fountain.com/reference/get_api-servicepulse-pulsesettings-identifier) |
| PATCH | `/api/servicepulse/pulsesettings/{identifier}` | [partially update one existing pulseSettings](https://developer.fountain.com/reference/patch_api-servicepulse-pulsesettings-identifier) |
| DELETE | `/api/servicepulse/pulsesettings/{identifier}` | [delete one pulseSettings](https://developer.fountain.com/reference/delete_api-servicepulse-pulsesettings-identifier) |
| GET | `/api/servicepulse/pulsesettings` | [find many pulseSettings](https://developer.fountain.com/reference/get_api-servicepulse-pulsesettings) |
| POST | `/api/servicepulse/pulsesettings` | [create one or multiple pulseSettings](https://developer.fountain.com/reference/post_api-servicepulse-pulsesettings) |
| PATCH | `/api/servicepulse/pulsesettings` | [partially update many existing pulseSettings](https://developer.fountain.com/reference/patch_api-servicepulse-pulsesettings) |
| DELETE | `/api/servicepulse/pulsesettings` | [delete many pulseSettings](https://developer.fountain.com/reference/delete_api-servicepulse-pulsesettings) |

## serviceemployment — Employment profiles (employer notes, tags, log notes) — 39 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/serviceemployment/employmentprofiles/count` | [count employmentProfiles](https://developer.fountain.com/reference/get_api-serviceemployment-employmentprofiles-count) |
| GET | `/api/serviceemployment/employmentprofiles/{identifier}` | [find one employmentProfile](https://developer.fountain.com/reference/get_api-serviceemployment-employmentprofiles-identifier) |
| GET | `/api/serviceemployment/employmentprofiles` | [find many employmentProfiles](https://developer.fountain.com/reference/get_api-serviceemployment-employmentprofiles) |
| PATCH | `/api/serviceemployment/employmentprofiles/{identifier}` | [partially update one existing employmentProfile](https://developer.fountain.com/reference/patch_api-serviceemployment-employmentprofiles-identifier) |
| PATCH | `/api/serviceemployment/employmentprofiles` | [partially update many existing employmentProfile](https://developer.fountain.com/reference/patch_api-serviceemployment-employmentprofiles) |
| PATCH | `/api/serviceemployment/processes/companies/companyidentifier/profiles/i9/workers/{workeridentifier}/tags` | [Update tags associated to a profile](https://developer.fountain.com/reference/patch_api-serviceemployment-processes-companies-companyidentifier-profiles-i9-workers-workeridentifier-tags) |
| PATCH | `/api/serviceemployment/processes/companies/companyidentifier/profiles/all/workers/{workeridentifier}` | [Update allowed properties for an employment profile](https://developer.fountain.com/reference/patch_api-serviceemployment-processes-companies-companyidentifier-profiles-all-workers-workeridentifier) |
| GET | `/api/serviceemployment/processes/companies/companyidentifier/profiles/w4/workers/{workeridentifier}/assignments` | [Get worker W-4 document assignments](https://developer.fountain.com/reference/get_api-serviceemployment-processes-companies-companyidentifier-profiles-w4-workers-workeridentifier-assignments) |
| POST | `/api/serviceemployment/processes/companies/companyidentifier/profiles/i9/workers/{workeridentifier}/restart` | [Restart a profile submission(s)](https://developer.fountain.com/reference/post_api-serviceemployment-processes-companies-companyidentifier-profiles-i9-workers-workeridentifier-restart) |
| POST | `/api/serviceemployment/processes/companies/companyidentifier/profiles/i9/workers/{workeridentifier}/rehire` | [Rehire a profile submission(s)](https://developer.fountain.com/reference/post_api-serviceemployment-processes-companies-companyidentifier-profiles-i9-workers-workeridentifier-rehire) |
| PATCH | `/api/serviceemployment/processes/companies/companyidentifier/profiles/all/workers/{workeridentifier}/disabled` | [Set the disabled flag for a worker case and emit activity events](https://developer.fountain.com/reference/patch_api-serviceemployment-processes-companies-companyidentifier-profiles-all-workers-workeridentifier-disabled) |
| GET | `/api/serviceemployment/tags/count` | [count tags](https://developer.fountain.com/reference/get_api-serviceemployment-tags-count) |
| GET | `/api/serviceemployment/tags/{identifier}` | [find one tag](https://developer.fountain.com/reference/get_api-serviceemployment-tags-identifier) |
| PATCH | `/api/serviceemployment/tags/{identifier}` | [partially update one existing tag](https://developer.fountain.com/reference/patch_api-serviceemployment-tags-identifier) |
| DELETE | `/api/serviceemployment/tags/{identifier}` | [delete one tag](https://developer.fountain.com/reference/delete_api-serviceemployment-tags-identifier) |
| GET | `/api/serviceemployment/tags` | [find many tags](https://developer.fountain.com/reference/get_api-serviceemployment-tags) |
| POST | `/api/serviceemployment/tags` | [create one or multiple tags](https://developer.fountain.com/reference/post_api-serviceemployment-tags) |
| PATCH | `/api/serviceemployment/tags` | [partially update many existing tag](https://developer.fountain.com/reference/patch_api-serviceemployment-tags) |
| DELETE | `/api/serviceemployment/tags` | [delete many tags](https://developer.fountain.com/reference/delete_api-serviceemployment-tags) |
| GET | `/api/serviceemployment/processes/profiles/all/count` | [count viewEmploymentProfiles](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-all-count) |
| GET | `/api/serviceemployment/processes/profiles/all/workers/{workeridentifier}` | [find one viewEmploymentProfile](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-all-workers-workeridentifier) |
| GET | `/api/serviceemployment/processes/profiles/all` | [find many viewEmploymentProfiles](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-all) |
| POST | `/api/serviceemployment/processes/companies/companyidentifier/profiles/all/workers/{workeridentifier}/sync` | [Sync viewEmploymentProfile and Partner resources for a given worker](https://developer.fountain.com/reference/post_api-serviceemployment-processes-companies-companyidentifier-profiles-all-workers-workeridentifier-sync) |
| GET | `/api/serviceemployment/processes/profiles/i9/workers/{workeridentifier}/submission/submissionid/file` | [Retrieve a submission file](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-i9-workers-workeridentifier-submission-submissionid-file) |
| GET | `/api/serviceemployment/processes/profiles/i9/workers/{workeridentifier}/submission/submissionid/attachments/file` | [Retrieve a submission file](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-i9-workers-workeridentifier-submission-submissionid-attachments-file) |
| GET | `/api/serviceemployment/processes/profiles/i9/count` | [count viewEmploymentProfilesI9](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-i9-count) |
| GET | `/api/serviceemployment/processes/profiles/i9/workers/{workeridentifier}` | [find one viewEmploymentProfileI9](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-i9-workers-workeridentifier) |
| GET | `/api/serviceemployment/processes/profiles/i9` | [find many viewEmploymentProfilesI9](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-i9) |
| GET | `/api/serviceemployment/processes/profiles/w4/count` | [count viewEmploymentProfilesW4](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-w4-count) |
| GET | `/api/serviceemployment/processes/profiles/w4/workers/{workeridentifier}` | [find one viewEmploymentProfileW4](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-w4-workers-workeridentifier) |
| GET | `/api/serviceemployment/processes/profiles/w4` | [find many viewEmploymentProfilesW4](https://developer.fountain.com/reference/get_api-serviceemployment-processes-profiles-w4) |
| GET | `/api/serviceemployment/lognotes/count` | [count logNotes](https://developer.fountain.com/reference/get_api-serviceemployment-lognotes-count) |
| GET | `/api/serviceemployment/lognotes/{identifier}` | [find one logNote](https://developer.fountain.com/reference/get_api-serviceemployment-lognotes-identifier) |
| GET | `/api/serviceemployment/lognotes` | [find many logNotes](https://developer.fountain.com/reference/get_api-serviceemployment-lognotes) |
| GET | `/api/serviceemployment/employernotes/count` | [count employerNotes](https://developer.fountain.com/reference/get_api-serviceemployment-employernotes-count) |
| GET | `/api/serviceemployment/employernotes/{identifier}` | [find one employerNote](https://developer.fountain.com/reference/get_api-serviceemployment-employernotes-identifier) |
| GET | `/api/serviceemployment/employernotes` | [find many employerNotes](https://developer.fountain.com/reference/get_api-serviceemployment-employernotes) |
| POST | `/api/serviceemployment/employernotes` | [create one or multiple employerNotes](https://developer.fountain.com/reference/post_api-serviceemployment-employernotes) |
| POST | `/api/serviceemployment/processes/i9center/setup` | [One stop setup for I9Center V2](https://developer.fountain.com/reference/post_api-serviceemployment-processes-i9center-setup) |

## servicepool — Talent pool / audiences (talents, unified jobs, Copilot-generated audiences) — 28 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicepool/talents` | [fetch list of talent](https://developer.fountain.com/reference/get_api-servicepool-talents) |
| POST | `/api/servicepool/talents` | [Create one or multiple talent](https://developer.fountain.com/reference/post_api-servicepool-talents) |
| GET | `/api/servicepool/talents/count` | [Count talent](https://developer.fountain.com/reference/get_api-servicepool-talents-count) |
| GET | `/api/servicepool/talents/{identifier}` | [Retrieve a talent by its unique identifier](https://developer.fountain.com/reference/get_api-servicepool-talents-identifier) |
| PUT | `/api/servicepool/talents/{identifier}` | [Find and update a talent](https://developer.fountain.com/reference/put_api-servicepool-talents-identifier) |
| GET | `/api/servicepool/talents/{identifier}/audiencecampaigns` | [Get audience campaigns for a talent](https://developer.fountain.com/reference/get_api-servicepool-talents-identifier-audiencecampaigns) |
| PATCH | `/api/servicepool/talents` | [Update one or multiple talent](https://developer.fountain.com/reference/patch_api-servicepool-talents) |
| GET | `/api/servicepool/talents/templateattributes` | [Fetch all template attributes available for talents](https://developer.fountain.com/reference/get_api-servicepool-talents-templateattributes) |
| GET | `/api/servicepool/talents/{identifier}/audiencecampaigns/count` | [Count audience campaigns the talent has ever been part of (filterable)](https://developer.fountain.com/reference/get_api-servicepool-talents-identifier-audiencecampaigns-count) |
| GET | `/api/servicepool/talents/{identifier}/audiencehistory` | [Get audience history grouped by audience for a talent](https://developer.fountain.com/reference/get_api-servicepool-talents-identifier-audiencehistory) |
| GET | `/api/servicepool/talents/{identifier}/audiencehistory/count` | [Count audiences in a talent history (filterable by lastEventType)](https://developer.fountain.com/reference/get_api-servicepool-talents-identifier-audiencehistory-count) |
| GET | `/api/servicepool/talents/{identifier}/jobmatches` | [Find unifiedJobs matches for a given talent based on aggregate vector match](https://developer.fountain.com/reference/get_api-servicepool-talents-identifier-jobmatches) |
| GET | `/api/servicepool/unifiedjobs` | [fetch list of unified jobs](https://developer.fountain.com/reference/get_api-servicepool-unifiedjobs) |
| POST | `/api/servicepool/unifiedjobs` | [Create one or multiple unified jobs](https://developer.fountain.com/reference/post_api-servicepool-unifiedjobs) |
| GET | `/api/servicepool/unifiedjobs/count` | [Count unifiedJobs](https://developer.fountain.com/reference/get_api-servicepool-unifiedjobs-count) |
| GET | `/api/servicepool/unifiedjobs/{identifier}` | [Retrieve a unified job by its unique identifier](https://developer.fountain.com/reference/get_api-servicepool-unifiedjobs-identifier) |
| PUT | `/api/servicepool/unifiedjobs/{identifier}` | [Find and update a unified job](https://developer.fountain.com/reference/put_api-servicepool-unifiedjobs-identifier) |
| DELETE | `/api/servicepool/unifiedjobs/{identifier}` | [Delete a unified job](https://developer.fountain.com/reference/delete_api-servicepool-unifiedjobs-identifier) |
| GET | `/api/servicepool/audiences` | [fetch list of audiences](https://developer.fountain.com/reference/get_api-servicepool-audiences) |
| POST | `/api/servicepool/audiences` | [Create one or multiple audiences](https://developer.fountain.com/reference/post_api-servicepool-audiences) |
| GET | `/api/servicepool/audiences/count` | [Fetch a count of audiences](https://developer.fountain.com/reference/get_api-servicepool-audiences-count) |
| GET | `/api/servicepool/audiences/{identifier}` | [Retrieve an audience by its unique identifier](https://developer.fountain.com/reference/get_api-servicepool-audiences-identifier) |
| PATCH | `/api/servicepool/audiences/{identifier}` | [Find and update an audience](https://developer.fountain.com/reference/patch_api-servicepool-audiences-identifier) |
| GET | `/api/servicepool/audiences/{identifier}/workeruuids` | [fetch list of contactable worker uuids for audience within a given audience](https://developer.fountain.com/reference/get_api-servicepool-audiences-identifier-workeruuids) |
| POST | `/api/servicepool/copilot/audiences` | [Create audiences via Copilot](https://developer.fountain.com/reference/post_api-servicepool-copilot-audiences) |
| PATCH | `/api/servicepool/copilot/audiences/{identifier}` | [Update audience via Copilot](https://developer.fountain.com/reference/patch_api-servicepool-copilot-audiences-identifier) |
| GET | `/api/servicepool/audiences/{identifier}/activecampaigns` | [fetch list of active campaigns for a given audience](https://developer.fountain.com/reference/get_api-servicepool-audiences-identifier-activecampaigns) |
| GET | `/api/servicepool/audiences/{identifier}/talentaudiencehistory` | [Per-day entrance / exit counts for an audience inside the resolved [from, to] window](https://developer.fountain.com/reference/get_api-servicepool-audiences-identifier-talentaudiencehistory) |

## servicemedia — Document/media (e-signature docs, stored files) — 19 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicemedia/storedfiles/count` | [count storedFiles](https://developer.fountain.com/reference/get_api-servicemedia-storedfiles-count) |
| GET | `/api/servicemedia/storedfiles/{identifier}` | [find one storedFile](https://developer.fountain.com/reference/get_api-servicemedia-storedfiles-identifier) |
| PATCH | `/api/servicemedia/storedfiles/{identifier}` | [partially update one existing storedFile](https://developer.fountain.com/reference/patch_api-servicemedia-storedfiles-identifier) |
| DELETE | `/api/servicemedia/storedfiles/{identifier}` | [delete one storedFile](https://developer.fountain.com/reference/delete_api-servicemedia-storedfiles-identifier) |
| GET | `/api/servicemedia/storedfiles` | [find many storedFiles](https://developer.fountain.com/reference/get_api-servicemedia-storedfiles) |
| PATCH | `/api/servicemedia/storedfiles` | [partially update many existing storedFile](https://developer.fountain.com/reference/patch_api-servicemedia-storedfiles) |
| DELETE | `/api/servicemedia/storedfiles` | [delete many storedFiles](https://developer.fountain.com/reference/delete_api-servicemedia-storedfiles) |
| POST | `/api/servicemedia/processes/files/edm` | [Create a file and get an upload presigned URL for an object storage in the edm bucket](https://developer.fountain.com/reference/post_api-servicemedia-processes-files-edm) |
| POST | `/api/servicemedia/processes/files/attachment` | [Create a file and get an upload presigned URL for an object storage in the attachments bucket](https://developer.fountain.com/reference/post_api-servicemedia-processes-files-attachment) |
| GET | `/api/servicemedia/processes/company/companyidentifier/storedfiles/storedfileidentifier/url` | [generate a signed file url to access a file](https://developer.fountain.com/reference/get_api-servicemedia-processes-company-companyidentifier-storedfiles-storedfileidentifier-url) |
| POST | `/api/servicemedia/processes/files/storagefolder/url/upload` | [Upload one or two files from a publicly accessible URL to our object storage. The combined file must not exceed 15MB.](https://developer.fountain.com/reference/post_api-servicemedia-processes-files-storagefolder-url-upload) |
| POST | `/api/servicemedia/processes/files/csvimports` | [Create a file and get an upload presigned URL for an object storage in the csv imports bucket](https://developer.fountain.com/reference/post_api-servicemedia-processes-files-csvimports) |
| GET | `/api/servicemedia/processes/files/csvimports` | [List files from CSV imports storage folder only](https://developer.fountain.com/reference/get_api-servicemedia-processes-files-csvimports) |
| GET | `/api/servicemedia/processes/files/csvimports/count` | [Count files from CSV imports storage folder only](https://developer.fountain.com/reference/get_api-servicemedia-processes-files-csvimports-count) |
| GET | `/api/servicemedia/signdocs/count` | [count signDocs](https://developer.fountain.com/reference/get_api-servicemedia-signdocs-count) |
| GET | `/api/servicemedia/signdocs/{identifier}` | [find one signDoc](https://developer.fountain.com/reference/get_api-servicemedia-signdocs-identifier) |
| GET | `/api/servicemedia/signdocs` | [find many signDocs](https://developer.fountain.com/reference/get_api-servicemedia-signdocs) |
| GET | `/api/servicemedia/processes/signaturerequests/signaturerequestidentifier/files` | [Retrieve a link or download files linked to a signatureRequest document](https://developer.fountain.com/reference/get_api-servicemedia-processes-signaturerequests-signaturerequestidentifier-files) |
| GET | `/api/servicemedia/processes/signaturerequests/signaturerequestidentifier/attachment` | [Return the attachment of a signatureRequest as a buffer](https://developer.fountain.com/reference/get_api-servicemedia-processes-signaturerequests-signaturerequestidentifier-attachment) |

## servicesecurity — AuthN/authz (API keys, OAuth token issuance, worker/employer impersonation, open signups) — 16 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicesecurity/apikeys/count` | [count apikeys](https://developer.fountain.com/reference/get_api-servicesecurity-apikeys-count) |
| GET | `/api/servicesecurity/apikeys/{identifier}` | [find one apikey](https://developer.fountain.com/reference/get_api-servicesecurity-apikeys-identifier) |
| DELETE | `/api/servicesecurity/apikeys/{identifier}` | [delete one apikey](https://developer.fountain.com/reference/delete_api-servicesecurity-apikeys-identifier) |
| GET | `/api/servicesecurity/apikeys` | [find many apikeys](https://developer.fountain.com/reference/get_api-servicesecurity-apikeys) |
| DELETE | `/api/servicesecurity/apikeys` | [delete many apikeys](https://developer.fountain.com/reference/delete_api-servicesecurity-apikeys) |
| POST | `/api/servicesecurity/processes/apikey/generate` | [create a new API key based on caller rights](https://developer.fountain.com/reference/post_api-servicesecurity-processes-apikey-generate) |
| POST | `/api/servicesecurity/processes/apikey/generate/integration/{useruuid}` | [create a new API key based on caller rights](https://developer.fountain.com/reference/post_api-servicesecurity-processes-apikey-generate-integration-useruuid) |
| GET | `/api/servicesecurity/opensignups/count` | [count opensignups](https://developer.fountain.com/reference/get_api-servicesecurity-opensignups-count) |
| GET | `/api/servicesecurity/opensignups/{identifier}` | [find one opensignup](https://developer.fountain.com/reference/get_api-servicesecurity-opensignups-identifier) |
| PATCH | `/api/servicesecurity/opensignups/{identifier}` | [partially update one existing opensignup](https://developer.fountain.com/reference/patch_api-servicesecurity-opensignups-identifier) |
| GET | `/api/servicesecurity/opensignups` | [find many opensignups](https://developer.fountain.com/reference/get_api-servicesecurity-opensignups) |
| POST | `/api/servicesecurity/opensignups` | [create one or multiple opensignups](https://developer.fountain.com/reference/post_api-servicesecurity-opensignups) |
| PATCH | `/api/servicesecurity/opensignups` | [partially update many existing opensignup](https://developer.fountain.com/reference/patch_api-servicesecurity-opensignups) |
| POST | `/api/servicesecurity/processes/papi/setup/v1/{hireaccountuuid}` | [One stop setup for PAPI](https://developer.fountain.com/reference/post_api-servicesecurity-processes-papi-setup-v1-hireaccountuuid) |
| GET | `/api/servicesecurity/processes/workers/{workeruuid}/impersonate` | [Retrieve a short-lived authenticated URL for a worker's portal](https://developer.fountain.com/reference/get_api-servicesecurity-processes-workers-workeruuid-impersonate) |
| GET | `/api/servicesecurity/processes/employers/{employeruuid}/impersonate` | [Retrieve a short-lived authenticated URL for a worker's portal](https://developer.fountain.com/reference/get_api-servicesecurity-processes-employers-employeruuid-impersonate) |

## servicecompliancev2 — Compliance/document verification (document types incl. AI-classified `ai-documenttypes`, submissions, requirements, worker compliance profiles) — 16 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicecompliancev2/documenttypes` | [fetch list of documentTypes](https://developer.fountain.com/reference/get_api-servicecompliancev2-documenttypes) |
| POST | `/api/servicecompliancev2/documenttypes` | [Create one or multiple documentTypes](https://developer.fountain.com/reference/post_api-servicecompliancev2-documenttypes) |
| POST | `/api/servicecompliancev2/ai/documenttypes` | [Create one or multiple documentTypes simplified](https://developer.fountain.com/reference/post_api-servicecompliancev2-ai-documenttypes) |
| GET | `/api/servicecompliancev2/documenttypes/{identifier}` | [Retreive a documentType by its unique identifier](https://developer.fountain.com/reference/get_api-servicecompliancev2-documenttypes-identifier) |
| GET | `/api/servicecompliancev2/documentsubmissions` | [fetch list of documentSubmissions](https://developer.fountain.com/reference/get_api-servicecompliancev2-documentsubmissions) |
| POST | `/api/servicecompliancev2/documentsubmissions` | [Create one documentSubmission](https://developer.fountain.com/reference/post_api-servicecompliancev2-documentsubmissions) |
| GET | `/api/servicecompliancev2/documentsubmissions/{identifier}` | [Retrieve a documentSubmission by its unique identifier](https://developer.fountain.com/reference/get_api-servicecompliancev2-documentsubmissions-identifier) |
| PUT | `/api/servicecompliancev2/documentsubmissions/{identifier}` | [Find and update a documentSubmission](https://developer.fountain.com/reference/put_api-servicecompliancev2-documentsubmissions-identifier) |
| POST | `/api/servicecompliancev2/requirements` | [Create one or multiple requirements](https://developer.fountain.com/reference/post_api-servicecompliancev2-requirements) |
| GET | `/api/servicecompliancev2/requirements` | [List requirements](https://developer.fountain.com/reference/get_api-servicecompliancev2-requirements) |
| GET | `/api/servicecompliancev2/requirements/{identifier}` | [Retreive a requirement by its unique identifier](https://developer.fountain.com/reference/get_api-servicecompliancev2-requirements-identifier) |
| PUT | `/api/servicecompliancev2/requirements/{identifier}` | [Find and update a requirement](https://developer.fountain.com/reference/put_api-servicecompliancev2-requirements-identifier) |
| GET | `/api/servicecompliancev2/workercomplianceprofiles` | [List workerComplianceProfiles](https://developer.fountain.com/reference/get_api-servicecompliancev2-workercomplianceprofiles) |
| GET | `/api/servicecompliancev2/workercomplianceprofiles/{identifier}` | [Retreive a workerComplianceProfile by its unique identifier](https://developer.fountain.com/reference/get_api-servicecompliancev2-workercomplianceprofiles-identifier) |
| GET | `/api/servicecompliancev2/workercomplianceprofile/worker/{workeridentifier}` | [Retrieve the workerComplianceProfile for an authenticated worker](https://developer.fountain.com/reference/get_api-servicecompliancev2-workercomplianceprofile-worker-workeridentifier) |
| POST | `/api/servicecompliancev2/workercomplianceprofiles/search` | [Search workerComplianceProfiles (Atlas Search)](https://developer.fountain.com/reference/post_api-servicecompliancev2-workercomplianceprofiles-search) |

## servicereferral — Employee referral program (referral campaigns) — 14 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicereferral/referralcampaigns/count` | [count referralCampaigns](https://developer.fountain.com/reference/get_api-servicereferral-referralcampaigns-count) |
| GET | `/api/servicereferral/referralcampaigns/{identifier}` | [find one referralCampaign](https://developer.fountain.com/reference/get_api-servicereferral-referralcampaigns-identifier) |
| PUT | `/api/servicereferral/referralcampaigns/{identifier}` | [replace one referralCampaign which exists or not](https://developer.fountain.com/reference/put_api-servicereferral-referralcampaigns-identifier) |
| PATCH | `/api/servicereferral/referralcampaigns/{identifier}` | [partially update one existing referralCampaign](https://developer.fountain.com/reference/patch_api-servicereferral-referralcampaigns-identifier) |
| DELETE | `/api/servicereferral/referralcampaigns/{identifier}` | [delete one referralCampaign](https://developer.fountain.com/reference/delete_api-servicereferral-referralcampaigns-identifier) |
| GET | `/api/servicereferral/referralcampaigns` | [find many referralCampaigns](https://developer.fountain.com/reference/get_api-servicereferral-referralcampaigns) |
| POST | `/api/servicereferral/referralcampaigns` | [create one or multiple referralCampaigns](https://developer.fountain.com/reference/post_api-servicereferral-referralcampaigns) |
| PUT | `/api/servicereferral/referralcampaigns` | [replace many referralCampaigns which exists or not](https://developer.fountain.com/reference/put_api-servicereferral-referralcampaigns) |
| PATCH | `/api/servicereferral/referralcampaigns` | [partially update many existing referralCampaign](https://developer.fountain.com/reference/patch_api-servicereferral-referralcampaigns) |
| DELETE | `/api/servicereferral/referralcampaigns` | [delete many referralCampaigns](https://developer.fountain.com/reference/delete_api-servicereferral-referralcampaigns) |
| POST | `/api/servicereferral/processes/referralcampaigns` | [Process a referral campaign request](https://developer.fountain.com/reference/post_api-servicereferral-processes-referralcampaigns) |
| GET | `/api/servicereferral/processes/referralcampaigns/{companyuuid}/openings` | [retrieve a list of Hire openings with targeting](https://developer.fountain.com/reference/get_api-servicereferral-processes-referralcampaigns-companyuuid-openings) |
| POST | `/api/servicereferral/processes/referralsettings/initialize/{companyuuid}` | [Initialize referral setting](https://developer.fountain.com/reference/post_api-servicereferral-processes-referralsettings-initialize-companyuuid) |
| GET | `/api/servicereferral/processes/referralsettings/{companyuuid}` | [Get referral setting by company UUID (public)](https://developer.fountain.com/reference/get_api-servicereferral-processes-referralsettings-companyuuid) |

## servicestaff — Staffing/employer records — 11 endpoints

| Method | Path (reconstructed) | Summary |
|---|---|---|
| GET | `/api/servicestaff/employers/count` | [count employers](https://developer.fountain.com/reference/get_api-servicestaff-employers-count) |
| GET | `/api/servicestaff/employers/{identifier}` | [find one employer](https://developer.fountain.com/reference/get_api-servicestaff-employers-identifier) |
| PUT | `/api/servicestaff/employers/{identifier}` | [replace one employer which exists or not](https://developer.fountain.com/reference/put_api-servicestaff-employers-identifier) |
| PATCH | `/api/servicestaff/employers/{identifier}` | [partially update one existing employer](https://developer.fountain.com/reference/patch_api-servicestaff-employers-identifier) |
| DELETE | `/api/servicestaff/employers/{identifier}` | [delete one employer](https://developer.fountain.com/reference/delete_api-servicestaff-employers-identifier) |
| GET | `/api/servicestaff/employers` | [find many employers](https://developer.fountain.com/reference/get_api-servicestaff-employers) |
| POST | `/api/servicestaff/employers` | [create one or multiple employers](https://developer.fountain.com/reference/post_api-servicestaff-employers) |
| PUT | `/api/servicestaff/employers` | [replace many employers which exists or not](https://developer.fountain.com/reference/put_api-servicestaff-employers) |
| PATCH | `/api/servicestaff/employers` | [partially update many existing employer](https://developer.fountain.com/reference/patch_api-servicestaff-employers) |
| DELETE | `/api/servicestaff/employers` | [delete many employers](https://developer.fountain.com/reference/delete_api-servicestaff-employers) |
| DELETE | `/api/servicestaff/employers/{identifier}/withreassignment` | [Delete an employer with slot reassignment](https://developer.fountain.com/reference/delete_api-servicestaff-employers-identifier-withreassignment) |