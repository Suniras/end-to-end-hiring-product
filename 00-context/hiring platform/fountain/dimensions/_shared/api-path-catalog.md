# Fountain — Shared API Path Catalog

Seeded empty by Ingestion (Mode 2) before collector fan-out, per ingestion.md §6. Contributing dimensions
(`deployed-client-bundle`, `session`, `wire-capture`, `distribution-artifacts`) append a `## source: <dim>`
section below — never create a separate copy of this file.

---

## source: bundle

<!-- captured_at: 2026-08-09 · method: source-map-reassembly (high confidence) · dimension: deployed-client-bundle -->

**Host:** the app's own API is served **same-origin as the web app** (`monolithOrigin`, e.g.
`https://web.fountain.com` in prod — see `dimensions/deployed-client-bundle/raw/route-table.md`), under
two path families: `/api_self_serve/{v1,v2}` (a smaller, versioned self-serve REST surface — 33 paths)
and `/internal_api/*` (the bulk of the app's own operations — 267 paths). **This is a completely
different host from the published developer API** (`services.fountain.com`, per the `docs`/`api`
dimensions) — see the published-vs-app-own diff this feeds in `evaluation/data-model-api-surface.md`.

**Recovery method:** the generated OpenAPI/typed API client (`npm.api-clients.*.js`, a webpack vendor
chunk explicitly named `api-clients`) ships a live production source map; every `url:"..."` + `method:"..."`
literal in the generated client was extracted directly — **300 unique paths, 358 method+path pairs**
(some paths support >1 verb). This is a generated-client artifact, not a reconstruction from usage sites,
so it is complete for whatever operations the generated client covers (verified against the entry
bundle's own route/container list — e.g. `sourcing`, `chatbot`, `workflow_editor`, `portal` — and no
material gap was found between the two).

Grouped by path prefix (52 groups collapsed to keep this scannable — expand any `<details>` for the full
list):

<details><summary>/internal_api/sourcing — 52 paths</summary>

- `/internal_api/sourcing/brands`
- `/internal_api/sourcing/dashboard/analytics`
- `/internal_api/sourcing/dashboard/automation_recommendation`
- `/internal_api/sourcing/dashboard/openings`
- `/internal_api/sourcing/dashboard/openings_at_risk`
- `/internal_api/sourcing/dashboard/openings_at_risk_count`
- `/internal_api/sourcing/dashboard/snapshots`
- `/internal_api/sourcing/dashboard/sourcing_recommendation`
- `/internal_api/sourcing/dashboard/{opening_slug}`
- `/internal_api/sourcing/locations`
- `/internal_api/sourcing/openings/add_openings_to_source_dashboard`
- `/internal_api/sourcing/openings/mark_for_sourcing`
- `/internal_api/sourcing/openings/openings_by_external_ids`
- `/internal_api/sourcing/openings/{opening_external_id}`
- `/internal_api/sourcing/openings/{opening_slug}`
- `/internal_api/sourcing/openings/{opening_slug}/aggregate_spend`
- `/internal_api/sourcing/openings/{opening_slug}/budget_recommendation`
- `/internal_api/sourcing/openings/{opening_slug}/general_recommendations`
- `/internal_api/sourcing/openings/{opening_slug}/hire_stages`
- `/internal_api/sourcing/openings/{opening_slug}/hiring_goals`
- `/internal_api/sourcing/openings/{opening_slug}/hiring_openings`
- `/internal_api/sourcing/openings/{opening_slug}/historical_conversion_data`
- `/internal_api/sourcing/openings/{opening_slug}/map_sourcing_stages`
- `/internal_api/sourcing/openings/{opening_slug}/sourcing_channels`
- `/internal_api/sourcing/openings/{opening_slug}/sourcing_funnels`
- `/internal_api/sourcing/openings/{opening_slug}/sourcing_stage_stats`
- `/internal_api/sourcing/openings/{opening_slug}/suggested_target_budget`
- `/internal_api/sourcing/positions`
- `/internal_api/sourcing/sourcing_channels`
- `/internal_api/sourcing/sourcing_channels/all_channels`
- `/internal_api/sourcing/sourcing_channels/enable_channels`
- `/internal_api/sourcing/sourcing_channels/enabled_channels`
- `/internal_api/sourcing/sourcing_channels/non_integrated_sourcing_channels`
- `/internal_api/sourcing/sourcing_channels/{id}`
- `/internal_api/sourcing/sourcing_purchases/bulk_create`
- `/internal_api/sourcing/sourcing_purchases/pool_audiences`
- `/internal_api/sourcing/sourcing_purchases/validate_sourcing_purchases`
- `/internal_api/sourcing/sourcing_purchases/{sourcing_purchase_id}`
- `/internal_api/sourcing/sourcing_purchases/{sourcing_purchase_id}/accept_recommendation`
- `/internal_api/sourcing/sourcing_purchases/{sourcing_purchase_id}/campaign_details`
- `/internal_api/sourcing/sourcing_purchases/{sourcing_purchase_id}/reject_recommendation`
- `/internal_api/sourcing/sourcing_purchases/{sourcing_purchase_id}/update_campaign_status`
- `/internal_api/sourcing/sourcing_settings`
- `/internal_api/sourcing/sourcing_settings/utm_source_mapping_keys`
- `/internal_api/sourcing/vonq/contracts`
- `/internal_api/sourcing/vonq/contracts/channel_details`
- `/internal_api/sourcing/vonq/contracts/channels`
- `/internal_api/sourcing/vonq/contracts/posting_requirements`
- `/internal_api/sourcing/vonq/contracts/posting_requirements/{channel_id_or_contract_id}/{posting_requirement_name}/autocomplete`
- `/internal_api/sourcing/vonq/contracts/{id}`
- `/internal_api/sourcing/vonq_contracts`
- `/internal_api/sourcing/vonq_contracts/{vonq_contract_id}`

</details>

<details><summary>/internal_api/portal — 39 paths</summary>

- `/internal_api/portal/apply_url_resolution`
- `/internal_api/portal/countries`
- `/internal_api/portal/countries/{id}/states`
- `/internal_api/portal/google_maps/autocomplete`
- `/internal_api/portal/google_maps/details`
- `/internal_api/portal/iban/check_validity`
- `/internal_api/portal/{account_slug}/applicants/{application_id}`
- `/internal_api/portal/{account_slug}/application_forms`
- `/internal_api/portal/{account_slug}/application_forms/new`
- `/internal_api/portal/{account_slug}/applications/{application_id}/applicant_signatures/{signature_id}`
- `/internal_api/portal/{account_slug}/applications/{application_id}/application_requests`
- `/internal_api/portal/{account_slug}/applications/{application_id}/authorized_representatives/email`
- `/internal_api/portal/{account_slug}/applications/{application_id}/background_checks`
- `/internal_api/portal/{account_slug}/applications/{application_id}/background_checks/create_invitation`
- `/internal_api/portal/{account_slug}/applications/{application_id}/background_checks/status`
- `/internal_api/portal/{account_slug}/applications/{application_id}/blob_public_url`
- `/internal_api/portal/{account_slug}/applications/{application_id}/contexts`
- `/internal_api/portal/{account_slug}/applications/{application_id}/document_signature_requests/{signature_id}`
- `/internal_api/portal/{account_slug}/applications/{application_id}/file_upload_requests`
- `/internal_api/portal/{account_slug}/applications/{application_id}/file_upload_requests/new`
- `/internal_api/portal/{account_slug}/applications/{application_id}/i9_forms`
- `/internal_api/portal/{account_slug}/applications/{application_id}/i9_forms/{i9_form_id}/pdf`
- `/internal_api/portal/{account_slug}/applications/{application_id}/i9_forms/{id}`
- `/internal_api/portal/{account_slug}/applications/{application_id}/learning_course_assignment/status`
- `/internal_api/portal/{account_slug}/applications/{application_id}/schedule_slots`
- `/internal_api/portal/{account_slug}/applications/{application_id}/schedule_slots/days`
- `/internal_api/portal/{account_slug}/applications/{application_id}/schedule_slots/request_more_slots`
- `/internal_api/portal/{account_slug}/applications/{application_id}/schedule_slots/{slot_id}`
- `/internal_api/portal/{account_slug}/applications/{application_id}/schedule_slots/{slot_id}/reschedulable`
- `/internal_api/portal/{account_slug}/applications/{application_id}/stage_progress`
- `/internal_api/portal/{account_slug}/applications/{application_id}/stages`
- `/internal_api/portal/{account_slug}/applications/{application_id}/stages/new`
- `/internal_api/portal/{account_slug}/applications/{application_id}/video_recordings`
- `/internal_api/portal/{account_slug}/applications/{application_id}/worker_token`
- `/internal_api/portal/{account_slug}/authorized_representative_forms/{i9_form_id}`
- `/internal_api/portal/{account_slug}/funnels/{funnel_id}/translation`
- `/internal_api/portal/{account_slug}/funnels/{funnel_id}/translation/data_fields`
- `/internal_api/portal/{account_slug}/funnels/{funnel_id}/translation/stages`
- `/internal_api/portal/{account_slug}/preview_meta`

</details>

<details><summary>/api_self_serve/v2 — 30 paths</summary>

- `/api_self_serve/v2/applicant_search_settings`
- `/api_self_serve/v2/applicants/{external_id}`
- `/api_self_serve/v2/applicants/{external_id}/email_conversations`
- `/api_self_serve/v2/applicants/{external_id}/email_messages/{email_message_external_id}/email_content`
- `/api_self_serve/v2/applicants/{external_id}/follow_ups`
- `/api_self_serve/v2/applicants/{external_id}/follow_ups/{id}`
- `/api_self_serve/v2/applicants/{external_id}/follow_ups/{id}/mark_closed`
- `/api_self_serve/v2/applicants/{external_id}/resubmit_partner_data`
- `/api_self_serve/v2/applicants/{external_id}/telephony/initiate_call`
- `/api_self_serve/v2/applicants/{external_id}/transitions/completed_stages`
- `/api_self_serve/v2/bulk_hiring_goals`
- `/api_self_serve/v2/bulk_hiring_goals/create_or_update`
- `/api_self_serve/v2/bulk_hiring_goals/{external_id}`
- `/api_self_serve/v2/data_keys`
- `/api_self_serve/v2/data_keys/{id}`
- `/api_self_serve/v2/duplicate_applicant_settings`
- `/api_self_serve/v2/duplicate_applicant_settings/rejection_reasons`
- `/api_self_serve/v2/location_groups`
- `/api_self_serve/v2/location_groups/{id}`
- `/api_self_serve/v2/message_templates/deliver`
- `/api_self_serve/v2/openings`
- `/api_self_serve/v2/openings/brands`
- `/api_self_serve/v2/openings/location_groups`
- `/api_self_serve/v2/openings/owners`
- `/api_self_serve/v2/openings/workflows`
- `/api_self_serve/v2/openings/{external_id}`
- `/api_self_serve/v2/openings/{external_id}/status_options`
- `/api_self_serve/v2/openings/{external_id}/status_v2`
- `/api_self_serve/v2/openings/{id}`
- `/api_self_serve/v2/users/{id}/features`

</details>

<details><summary>/internal_api/chatbot — 29 paths</summary>

- `/internal_api/chatbot/automated_response_models`
- `/internal_api/chatbot/automated_response_models/{external_id}`
- `/internal_api/chatbot/automated_responses`
- `/internal_api/chatbot/automated_responses/bulk_upload_csv`
- `/internal_api/chatbot/automated_responses/get_intents_with_bot_reply/{model_name}`
- `/internal_api/chatbot/automated_responses/sample`
- `/internal_api/chatbot/automated_responses/update_intent/{faqbot_log_id}`
- `/internal_api/chatbot/automated_responses/{id}`
- `/internal_api/chatbot/automated_responses/{id}/update_faq_bot`
- `/internal_api/chatbot/chatbot_logs/chatbot_logs`
- `/internal_api/chatbot/chatbot_logs/intents`
- `/internal_api/chatbot/chatbot_logs/{chatbot_log_id}`
- `/internal_api/chatbot/chatbot_widget/brands`
- `/internal_api/chatbot/chatbot_widget/dashboard`
- `/internal_api/chatbot/contact_sales`
- `/internal_api/chatbot/settings`
- `/internal_api/chatbot/settings/{brand_id}`
- `/internal_api/chatbot/settings/{brand_id}/check_career_site_parsing_ability`
- `/internal_api/chatbot/settings/{brand_id}/refresh_career_site_scraping_status`
- `/internal_api/chatbot/settings/{brand_id}/refresh_knowledge_base_status`
- `/internal_api/chatbot/settings/{brand_id}/search_funnels`
- `/internal_api/chatbot/widget/alive`
- `/internal_api/chatbot/widget/chat`
- `/internal_api/chatbot/widget/close_handoff_session`
- `/internal_api/chatbot/widget/configuration`
- `/internal_api/chatbot/widget/faq_chat`
- `/internal_api/chatbot/widget/log_faq_feedback`
- `/internal_api/chatbot/widget/log_faq_link_click`
- `/internal_api/chatbot/widget/presigned_blob`

</details>

<details><summary>/internal_api/workflow_editor — 28 paths</summary>

- `/internal_api/workflow_editor/archived_reasons`
- `/internal_api/workflow_editor/calendar_users`
- `/internal_api/workflow_editor/data_fields`
- `/internal_api/workflow_editor/document_signing_settings`
- `/internal_api/workflow_editor/funnels/{funnel_slug}`
- `/internal_api/workflow_editor/funnels/{funnel_slug}/clone_stages`
- `/internal_api/workflow_editor/funnels/{funnel_slug}/rule_stage_types`
- `/internal_api/workflow_editor/funnels/{funnel_slug}/stage_types`
- `/internal_api/workflow_editor/funnels/{funnel_slug}/stages`
- `/internal_api/workflow_editor/funnels/{funnel_slug}/stages/{stage_external_id}`
- `/internal_api/workflow_editor/job_matcher_condition_options`
- `/internal_api/workflow_editor/offer_letter_field_catalog`
- `/internal_api/workflow_editor/offer_letter_templates`
- `/internal_api/workflow_editor/offer_letter_templates/{external_id}`
- `/internal_api/workflow_editor/offer_letter_templates/{external_id}/clone`
- `/internal_api/workflow_editor/offer_letter_templates/{external_id}/preview`
- `/internal_api/workflow_editor/offer_letter_templates/{offer_letter_template_external_id}/fields/{external_id}`
- `/internal_api/workflow_editor/offer_letter_templates/{offer_letter_template_external_id}/fields/{field_external_id}/conditions`
- `/internal_api/workflow_editor/rejection_reasons`
- `/internal_api/workflow_editor/rules_edit_data/{stage_external_id}`
- `/internal_api/workflow_editor/stages/learning_stages/lessonly_content`
- `/internal_api/workflow_editor/stages/learning_stages/northpass_courses`
- `/internal_api/workflow_editor/stages/{stage_external_id}`
- `/internal_api/workflow_editor/stages/{stage_external_id}/partner_integrations`
- `/internal_api/workflow_editor/workflows/{id}/clone`
- `/internal_api/workflow_editor/workflows/{workflow_external_id}`
- `/internal_api/workflow_editor/workflows/{workflow_id}`
- `/internal_api/workflow_editor/workflows/{workflow_id}/workflow_editor_url`

</details>

<details><summary>/internal_api/agent_integrations — 11 paths</summary>

- `/internal_api/agent_integrations/agent`
- `/internal_api/agent_integrations/agent/applicant_thread_signature`
- `/internal_api/agent_integrations/agent/conversation_report`
- `/internal_api/agent_integrations/agent/create_rx_agent`
- `/internal_api/agent_integrations/agent/create_rx_thread_and_signature`
- `/internal_api/agent_integrations/agent/fetch_access_token`
- `/internal_api/agent_integrations/agent/publish_chat_agent`
- `/internal_api/agent_integrations/agent/thread_signature`
- `/internal_api/agent_integrations/agent/user`
- `/internal_api/agent_integrations/agent/wx_i9_bot_thread_signature`
- `/internal_api/agent_integrations/agent/{id}`

</details>

<details><summary>/internal_api/career_site — 9 paths</summary>

- `/internal_api/career_site/brands/configuration`
- `/internal_api/career_site/locations`
- `/internal_api/career_site/openings`
- `/internal_api/career_site/positions`
- `/internal_api/career_site/positions/categories`
- `/internal_api/career_site/positions/experience_levels`
- `/internal_api/career_site/search/funnels_by_location`
- `/internal_api/career_site/settings`
- `/internal_api/career_site/settings/{brand_id}`

</details>

<details><summary>/internal_api/customer_attributes — 9 paths</summary>

- `/internal_api/customer_attributes/attribute_entities`
- `/internal_api/customer_attributes/attribute_types`
- `/internal_api/customer_attributes/attribute_types/{id}`
- `/internal_api/customer_attributes/attribute_types/{id}/openings/count`
- `/internal_api/customer_attributes/attribute_types/{id}/usage`
- `/internal_api/customer_attributes/attribute_values`
- `/internal_api/customer_attributes/attribute_values/{id}`
- `/internal_api/customer_attributes/attribute_values/{id}/usage`
- `/internal_api/customer_attributes/entities`

</details>

<details><summary>/internal_api/events — 8 paths</summary>

- `/internal_api/events`
- `/internal_api/events/availability/new`
- `/internal_api/events/bookings/{series_key}`
- `/internal_api/events/conditions`
- `/internal_api/events/exports`
- `/internal_api/events/stage_options`
- `/internal_api/events/stage_titles`
- `/internal_api/events/{external_id}`

</details>

<details><summary>/internal_api/opening_approval — 8 paths</summary>

- `/internal_api/opening_approval/approvals`
- `/internal_api/opening_approval/approvals/action`
- `/internal_api/opening_approval/approver_groups`
- `/internal_api/opening_approval/approver_groups/approver_groups_for_opening`
- `/internal_api/opening_approval/approver_groups/get_approvers`
- `/internal_api/opening_approval/approver_groups/{id}`
- `/internal_api/opening_approval/settings`
- `/internal_api/opening_approval/settings/update_settings`

</details>

<details><summary>/internal_api/wx — 8 paths</summary>

- `/internal_api/wx/custom_terminologies`
- `/internal_api/wx/custom_terminologies/{id}`
- `/internal_api/wx/custom_terminologies/{id}/download_url`
- `/internal_api/wx/funnels/targeted_count`
- `/internal_api/wx/pool/create_campaign_from_hire`
- `/internal_api/wx/users`
- `/internal_api/wx/users/{id}`
- `/internal_api/wx/users/{user_id}/accessible_openings`

</details>

<details><summary>/internal_api/job_boards — 7 paths</summary>

- `/internal_api/job_boards/indeed_campaign`
- `/internal_api/job_boards/indeed_campaign_predictions/{funnel_external_id}`
- `/internal_api/job_boards/indeed_integration`
- `/internal_api/job_boards/indeed_integration/unlink`
- `/internal_api/job_boards/vonq`
- `/internal_api/job_boards/vonq_funnels/{funnel_id}`
- `/internal_api/job_boards/vonq_products/{sourcing_purchase_id}`

</details>

<details><summary>/internal_api/message_template — 6 paths</summary>

- `/internal_api/message_template/default_whats_app_message_templates`
- `/internal_api/message_template/default_whats_app_message_templates/get_languages`
- `/internal_api/message_template/default_whats_app_message_templates/get_template_types`
- `/internal_api/message_template/default_whats_app_message_templates/whats_app_usage_stats`
- `/internal_api/message_template/default_whats_app_message_templates/{id}`
- `/internal_api/message_template/default_whats_app_message_templates/{id}/fetch_latest_status`

</details>

<details><summary>/internal_api/openings — 6 paths</summary>

- `/internal_api/openings/csvs`
- `/internal_api/openings/import`
- `/internal_api/openings/workflow_reassignment`
- `/internal_api/openings/{id}/activities`
- `/internal_api/openings/{id}/approvals`
- `/internal_api/openings/{id}/export`

</details>

<details><summary>/internal_api/applicants — 5 paths</summary>

- `/internal_api/applicants/{applicant_external_id}/offer_letter_form`
- `/internal_api/applicants/{applicant_external_id}/offer_letter_form/preview`
- `/internal_api/applicants/{applicant_external_id}/offer_letters`
- `/internal_api/applicants/{applicant_id}/partner_option_data/{partner_option_data_id}`
- `/internal_api/applicants/{applicant_id}/partner_option_data/{stage_id}`

</details>

<details><summary>/internal_api/scheduler — 5 paths</summary>

- `/internal_api/scheduler/availability_rules`
- `/internal_api/scheduler/calendars/availability`
- `/internal_api/scheduler/calendars/book`
- `/internal_api/scheduler/calendars/{id}`
- `/internal_api/scheduler/cronofy_information`

</details>

<details><summary>/internal_api/approvals — 4 paths</summary>

- `/internal_api/approvals/field_catalog`
- `/internal_api/approvals/rules`
- `/internal_api/approvals/rules/{id}`
- `/internal_api/approvals/rules/{id}/pending_requests`

</details>

<details><summary>/internal_api/workflows — 4 paths</summary>

- `/internal_api/workflows`
- `/internal_api/workflows/import`
- `/internal_api/workflows/{id}/export`
- `/internal_api/workflows/{workflow_id}`

</details>

<details><summary>/internal_api/{notifiable_type} — 4 paths</summary>

- `/internal_api/{notifiable_type}/{notifiable_id}/notification_preferences`
- `/internal_api/{notifiable_type}/{notifiable_id}/notification_preferences/stages`
- `/internal_api/{notifiable_type}/{notifiable_id}/notification_preferences/{notification_key}`
- `/internal_api/{notifiable_type}/{notifiable_id}/notification_preferences/{notification_key}/update_custom_preferences`

</details>

<details><summary>/api_self_serve/v1 — 3 paths</summary>

- `/api_self_serve/v1/jobs/{id}`
- `/api_self_serve/v1/openings_table_columns`
- `/api_self_serve/v1/openings_table_columns/options`

</details>

<details><summary>/internal_api/custom_terminologies — 3 paths</summary>

- `/internal_api/custom_terminologies/{account_external_id}/terminologies`
- `/internal_api/custom_terminologies/{account_external_id}/terminologies/{id}`
- `/internal_api/custom_terminologies/{account_external_id}/terminologies/{id}/download_url`

</details>

<details><summary>/internal_api/merge_keys — 3 paths</summary>

- `/internal_api/merge_keys/{account_external_id}`
- `/internal_api/merge_keys/{account_external_id}/available`
- `/internal_api/merge_keys/{account_external_id}/{id}`

</details>

<details><summary>/internal_api/oauth_2_configurations — 3 paths</summary>

- `/internal_api/oauth_2_configurations`
- `/internal_api/oauth_2_configurations/show_latest`
- `/internal_api/oauth_2_configurations/{id}`

</details>

<details><summary>/internal_api/offer_letters — 3 paths</summary>

- `/internal_api/offer_letters/{external_id}`
- `/internal_api/offer_letters/{external_id}/download`
- `/internal_api/offer_letters/{external_id}/submit_for_approval`

</details>

<details><summary>/internal_api/ai_builder — 2 paths</summary>

- `/internal_api/ai_builder/workflow/chat`
- `/internal_api/ai_builder/workflow/get_latest_message`

</details>

<details><summary>/internal_api/events_rosters — 2 paths</summary>

- `/internal_api/events_rosters`
- `/internal_api/events_rosters/{external_id}`

</details>

<details><summary>/internal_api/stages — 2 paths</summary>

- `/internal_api/stages`
- `/internal_api/stages/{id}`

</details>

<details><summary>/internal_api/users_pack — 2 paths</summary>

- `/internal_api/users_pack/user_options`
- `/internal_api/users_pack/{id}`

</details>

<details><summary>/internal_api/concepts — 1 paths</summary>

- `/internal_api/concepts`

</details>

<details><summary>/internal_api/fountain — 1 paths</summary>

- `/internal_api/fountain/opening_attributes`

</details>

<details><summary>/internal_api/hiring_goals — 1 paths</summary>

- `/internal_api/hiring_goals`

</details>

<details><summary>/internal_api/option_banks — 1 paths</summary>

- `/internal_api/option_banks/option_banks`

</details>

<details><summary>/internal_api/webhooks — 1 paths</summary>

- `/internal_api/webhooks/notifications`

</details>


**Additional app-own path observed directly in the entry bundle's Redux/request layer** (not part of the
generated client, hand-written instead): `${REACT_APP_GLOBAL_API_BASE_URL_V2}/jobs/{jobId}/stages`
(`app/requests/requests.js`).



---

### Addendum (Mode-5 iteration 1, same dimension/source) — `wx-navbar.umd.js` + `wx-copilot.umd.js`

<!-- captured_at: 2026-08-09 · method: bundle-string-mine (medium confidence — no source map on either
     UMD file, unlike the source-map-reassembled entry above) · dimension: deployed-client-bundle -->

**Host:** a NEW, previously-uncataloged host family — `/api/service*` served (per the generated clients'
own base-URL config, not statically visible in these two files) from the injected `wxServiceBaseUrl` /
`hireAccountBaseUrl` origins, i.e. **the Fountain One microservice tier**, not `web.fountain.com`'s
monolith paths above. **466 unique paths after de-dup** across the two files (`wx-navbar.umd.js`: 280;
`wx-copilot.umd.js`: 382; overlap: 196), spanning **15 distinct microservices** — full detail and the
"why this matters" narrative in `raw/wx-micro-frontends.md`.

**A live MCP server was also confirmed reachable, unauthenticated, at a THIRD host discovered only from
this pair of files** (not `web.fountain.com`, not `services.fountain.com`):
`https://data-mcp-production-us-east-1.fountain.com/mcp` — responded to an unauth `initialize` with
`serverInfo:{"name":"fountain-data-mcp","version":"1.27.2"}` and to `tools/list` with 6 real tools
(`list_cubes`, `get_cube_detail`, `execute_cube_sql_v2`, `execute_raw_sql`, `query_dataset`,
`list_datasets` — a Cube.js/ClickHouse natural-language-analytics MCP server). **Only `initialize` and
`tools/list` were called — no tool was invoked, no SQL was executed, no data was read.** This revises
`evaluation/data-model-api-surface.md`'s / `feature-coverage.md`'s prior "no live MCP server" finding —
see `raw/wx-micro-frontends.md` §2d for the full transcript and the precise scope of what this does and
does not prove.

**Mode-5 iteration 2 addendum — a SECOND live MCP server, and a path family neither catalog holds.**
Probing the client's remaining declared MCP base-URL headers found **`https://mcp.fountain.com/`** =
`fountain-hire-mcp-server v1.0.0` (the `x-hire-mcp-base-url` host; mounted at the **root**, not `/mcp`),
which returned **127 tools to an unauthenticated `tools/list`** — every one tagged `exposeAsMcpTool`.
**No tool was invoked.** 56 of the 127 map to **`/api/go/v1` + `/api/go/v2`**, a "Hire Go" API family
that appears in **neither** the published 575 endpoints **nor** the 766 paths catalogued in this file —
so it is **deliberately not appended here** (an MCP tool catalog is not a mined client path catalog, and
the underlying paths are inferred from tool names rather than read from a `url:` literal). It is recorded
in full in `deployed-client-bundle: raw/wx-micro-frontends.md` §3 and reconciled in
`evaluation/data-model-api-surface.md` §MCP. The other two declared hosts (`x-wx-`,
`x-fountain-ai-mcp-base-url`) were **not located** (16-candidate DNS sweep, all NXDOMAIN).

Grouped by microservice:

<details><summary>/api/other — 1 paths</summary>

- `/api/v2/`

</details>

<details><summary>/api/serviceauthorization — 27 paths</summary>

- `/api/serviceauthorization/authzSettings`
- `/api/serviceauthorization/authzSettings/count`
- `/api/serviceauthorization/authzSettings/{identifier}`
- `/api/serviceauthorization/matrices`
- `/api/serviceauthorization/matrices/count`
- `/api/serviceauthorization/matrices/{identifier}`
- `/api/serviceauthorization/permissions`
- `/api/serviceauthorization/permissions/count`
- `/api/serviceauthorization/permissions/{identifier}`
- `/api/serviceauthorization/processes/externalRoles/stopSyncExternalHireRoles`
- `/api/serviceauthorization/processes/externalRoles/syncExternalHireRoles`
- `/api/serviceauthorization/processes/permissions/hire/`
- `/api/serviceauthorization/processes/permissions/is-authorized`
- `/api/serviceauthorization/processes/permissions/roles-with-can-view-all-workers`
- `/api/serviceauthorization/processes/roles/{roleUuid}/setDefaultEmployerRole`
- `/api/serviceauthorization/processes/selfServeFirstEmployerClaims/by-company/{companyUuid}`
- `/api/serviceauthorization/processes/selfServeFirstEmployerClaims/by-company/{companyUuid}/kybStatus`
- `/api/serviceauthorization/processes/system/init-enterprise-roles-permissions/{enterpriseUuid}`
- `/api/serviceauthorization/processes/system/init-roles-permissions/{companyUuid}`
- `/api/serviceauthorization/roles`
- `/api/serviceauthorization/roles/count`
- `/api/serviceauthorization/roles/from-template`
- `/api/serviceauthorization/roles/templates`
- `/api/serviceauthorization/roles/{identifier}`
- `/api/serviceauthorization/status`
- `/api/serviceauthorization/status/crash`
- `/api/serviceauthorization/status/redis`

</details>

<details><summary>/api/servicecommunicate — 3 paths</summary>

- `/api/servicecommunicate/campaignTemplates`
- `/api/servicecommunicate/campaignTemplates/count`
- `/api/servicecommunicate/campaignTemplates/{identifier}`

</details>

<details><summary>/api/serviceemployment — 14 paths</summary>

- `/api/serviceemployment/employmentSettings`
- `/api/serviceemployment/employmentSettings/count`
- `/api/serviceemployment/employmentSettings/{identifier}`
- `/api/serviceemployment/processes/profiles/all`
- `/api/serviceemployment/processes/profiles/all/count`
- `/api/serviceemployment/processes/profiles/i9`
- `/api/serviceemployment/processes/profiles/i9/count`
- `/api/serviceemployment/processes/profiles/w4`
- `/api/serviceemployment/processes/profiles/w4/count`
- `/api/serviceemployment/processes/workbright/buffer/replay`
- `/api/serviceemployment/processes/workbright/webhook`
- `/api/serviceemployment/tags`
- `/api/serviceemployment/tags/count`
- `/api/serviceemployment/tags/{identifier}`

</details>

<details><summary>/api/serviceintegrations — 26 paths</summary>

- `/api/serviceintegrations/automations`
- `/api/serviceintegrations/automations/count`
- `/api/serviceintegrations/automations/{identifier}`
- `/api/serviceintegrations/dataPipelineEvents`
- `/api/serviceintegrations/dataPipelineEvents/count`
- `/api/serviceintegrations/dataPipelineEvents/{identifier}`
- `/api/serviceintegrations/dataPipelineMappings`
- `/api/serviceintegrations/dataPipelineMappings/count`
- `/api/serviceintegrations/dataPipelineMappings/{identifier}`
- `/api/serviceintegrations/dataPipelines`
- `/api/serviceintegrations/dataPipelines/count`
- `/api/serviceintegrations/dataPipelines/{identifier}`
- `/api/serviceintegrations/processes/automations/{uuid}/analytics`
- `/api/serviceintegrations/processes/dataPipelines/availableFields`
- `/api/serviceintegrations/processes/dataPipelines/checkName`
- `/api/serviceintegrations/processes/dataPipelines/cleanupTempFiles`
- `/api/serviceintegrations/processes/dataPipelines/detectJsonPaths`
- `/api/serviceintegrations/processes/dataPipelines/import`
- `/api/serviceintegrations/processes/dataPipelines/oneTimeImportFile`
- `/api/serviceintegrations/processes/dataPipelines/parseFileHeader`
- `/api/serviceintegrations/processes/dataPipelines/parseJsonText`
- `/api/serviceintegrations/processes/dataPipelines/previewMapping`
- `/api/serviceintegrations/processes/dataPipelines/transformFile`
- `/api/serviceintegrations/scim`
- `/api/serviceintegrations/scim/count`
- `/api/serviceintegrations/scim/{identifier}`

</details>

<details><summary>/api/servicemedia — 10 paths</summary>

- `/api/servicemedia/processes/files/attachment`
- `/api/servicemedia/processes/files/csvImports`
- `/api/servicemedia/processes/files/csvImports/count`
- `/api/servicemedia/processes/files/document/signing`
- `/api/servicemedia/processes/files/edm`
- `/api/servicemedia/processes/files/publicImage`
- `/api/servicemedia/processes/files/workers/bulk`
- `/api/servicemedia/processes/files/workers/{workerIdentifier}`
- `/api/servicemedia/processes/files/{storageFolder}/url/upload`
- `/api/servicemedia/processes/storedFiles/getPresignedUrls`

</details>

<details><summary>/api/servicemessaging — 5 paths</summary>

- `/api/servicemessaging/processes/emailTemplates/byBrand`
- `/api/servicemessaging/processes/emailTemplates/sendTestEmail`
- `/api/servicemessaging/senders`
- `/api/servicemessaging/senders/count`
- `/api/servicemessaging/senders/{identifier}`

</details>

<details><summary>/api/serviceorganizations — 121 paths</summary>

- `/api/serviceorganizations/brands`
- `/api/serviceorganizations/brands/count`
- `/api/serviceorganizations/brands/{identifier}`
- `/api/serviceorganizations/companies`
- `/api/serviceorganizations/companies/count`
- `/api/serviceorganizations/companies/{identifier}`
- `/api/serviceorganizations/companyAttributeSets`
- `/api/serviceorganizations/companyAttributeSets/count`
- `/api/serviceorganizations/companyAttributeSets/{identifier}`
- `/api/serviceorganizations/companyAttributes`
- `/api/serviceorganizations/companyAttributes/count`
- `/api/serviceorganizations/companyAttributes/{identifier}`
- `/api/serviceorganizations/copilotAuditLogs`
- `/api/serviceorganizations/copilotAuditLogs/count`
- `/api/serviceorganizations/copilotAuditLogs/{identifier}`
- `/api/serviceorganizations/copilots`
- `/api/serviceorganizations/copilots/count`
- `/api/serviceorganizations/copilots/{identifier}`
- `/api/serviceorganizations/demoDataCollections`
- `/api/serviceorganizations/demoDataCollections/count`
- `/api/serviceorganizations/demoDataCollections/{identifier}`
- `/api/serviceorganizations/eins`
- `/api/serviceorganizations/eins/count`
- `/api/serviceorganizations/eins/{identifier}`
- `/api/serviceorganizations/enterprises`
- `/api/serviceorganizations/enterprises/count`
- `/api/serviceorganizations/enterprises/{identifier}`
- `/api/serviceorganizations/paymentInvoices`
- `/api/serviceorganizations/paymentInvoices/count`
- `/api/serviceorganizations/paymentInvoices/{identifier}`
- `/api/serviceorganizations/process/companies/salesforce`
- `/api/serviceorganizations/process/refreshSalesforceId`
- `/api/serviceorganizations/processes/accounts/create`
- `/api/serviceorganizations/processes/accounts/internal/create`
- `/api/serviceorganizations/processes/ai/brandfetch-search`
- `/api/serviceorganizations/processes/ai/branding`
- `/api/serviceorganizations/processes/ai/completion`
- `/api/serviceorganizations/processes/brands`
- `/api/serviceorganizations/processes/brands/default`
- `/api/serviceorganizations/processes/brands/importFromHire`
- `/api/serviceorganizations/processes/brands/{brandUuid}/filtered`
- `/api/serviceorganizations/processes/companies/connectToHire`
- `/api/serviceorganizations/processes/companies/context`
- `/api/serviceorganizations/processes/companies/features`
- `/api/serviceorganizations/processes/companies/hire/{hireAccountUuid}`
- `/api/serviceorganizations/processes/companies/monolithServers`
- `/api/serviceorganizations/processes/companies/retrieveHireCompanySyncSettings`
- `/api/serviceorganizations/processes/companies/{companyUuid}/accountStatus`
- `/api/serviceorganizations/processes/companies/{companyUuid}/addToEnterprise`
- `/api/serviceorganizations/processes/companies/{companyUuid}/dataKeys`
- `/api/serviceorganizations/processes/companies/{companyUuid}/embeddedSignatureTemplates`
- `/api/serviceorganizations/processes/companies/{companyUuid}/filtered`
- `/api/serviceorganizations/processes/companies/{companyUuid}/locations`
- `/api/serviceorganizations/processes/companies/{companyUuid}/openings`
- `/api/serviceorganizations/processes/companies/{companyUuid}/passwordPolicy`
- `/api/serviceorganizations/processes/companies/{companyUuid}/positions`
- `/api/serviceorganizations/processes/companies/{companyUuid}/smsRegistration`
- `/api/serviceorganizations/processes/companies/{companyUuid}/syncHireApiKey`
- `/api/serviceorganizations/processes/companyAttributes/upsert`
- `/api/serviceorganizations/processes/companyCredits/allowOverages`
- `/api/serviceorganizations/processes/companyCredits/autoTopUp`
- `/api/serviceorganizations/processes/companyCredits/balance`
- `/api/serviceorganizations/processes/companyCredits/confirmPayment`
- `/api/serviceorganizations/processes/companyCredits/createPaymentIntent`
- `/api/serviceorganizations/processes/companyCredits/disputes`
- `/api/serviceorganizations/processes/companyCredits/gateCheck`
- `/api/serviceorganizations/processes/companyCredits/invoicedBilling`
- `/api/serviceorganizations/processes/companyCredits/paymentMethods`
- `/api/serviceorganizations/processes/companyCredits/paymentMethods/default`
- `/api/serviceorganizations/processes/companyCredits/paymentMethods/setupIntent`
- `/api/serviceorganizations/processes/companyCredits/paymentMethods/{paymentMethodId}`
- `/api/serviceorganizations/processes/companyCredits/purchasePackInvoiced`
- `/api/serviceorganizations/processes/companyCredits/{companyUuid}/outcomeGateCheck/{outcomeType}`
- `/api/serviceorganizations/processes/copilotBilling/transactionHistory`
- `/api/serviceorganizations/processes/copilotBillingEvents/addCredits`
- `/api/serviceorganizations/processes/copilotBillingEvents/emit`
- `/api/serviceorganizations/processes/creditAlertConfigs`
- `/api/serviceorganizations/processes/cue/stats/commonActions`
- `/api/serviceorganizations/processes/cue/stats/contactSales`
- `/api/serviceorganizations/processes/cue/stats/creditAuditLog`
- `/api/serviceorganizations/processes/cue/stats/roi`
- `/api/serviceorganizations/processes/cue/stats/teamLeaderboard`
- `/api/serviceorganizations/processes/cue/stats/usage`
- `/api/serviceorganizations/processes/cue/stats/usageVolume`
- `/api/serviceorganizations/processes/enterprises/createCompany`
- `/api/serviceorganizations/processes/enterprises/getCompanies`
- `/api/serviceorganizations/processes/mcp/companies`
- `/api/serviceorganizations/processes/mcp/companies/{companyUuid}`
- `/api/serviceorganizations/processes/mcp/company-context`
- `/api/serviceorganizations/processes/mcp/companyAttributes`
- `/api/serviceorganizations/processes/mcp/eins`
- `/api/serviceorganizations/processes/permissions/hire/roles/{roleUuid}`
- `/api/serviceorganizations/processes/stripe/webhook`
- `/api/serviceorganizations/processes/superuser/billing/accounts/{companyUuid}`
- `/api/serviceorganizations/processes/superuser/billing/accounts/{companyUuid}/transactionHistory`
- `/api/serviceorganizations/processes/superuser/billing/allowOverages`
- `/api/serviceorganizations/processes/superuser/billing/credits/add`
- `/api/serviceorganizations/processes/superuser/billing/disputes`
- `/api/serviceorganizations/processes/superuser/billing/disputes/{disputeUuid}`
- `/api/serviceorganizations/processes/superuser/billing/invoiceOrders`
- `/api/serviceorganizations/processes/superuser/billing/invoiceOrders/{orderUuid}/reconcile`
- `/api/serviceorganizations/processes/superuser/company-context/{companyUuid}`
- `/api/serviceorganizations/processes/superuser/freemium`
- `/api/serviceorganizations/processes/superuser/outcomeCreditConfigs/{companyUuid}`
- `/api/serviceorganizations/processes/superuser/outcomeCreditConfigs/{companyUuid}/{outcomeType}`
- `/api/serviceorganizations/processes/superuser/pool/{companyUuid}`
- `/api/serviceorganizations/processes/translationTerminologies/import`
- `/api/serviceorganizations/processes/translationTerminologies/{identifier}`
- `/api/serviceorganizations/processes/warehouseConnectionConfig/{identifier}/dagster`
- `/api/serviceorganizations/productAgentNets`
- `/api/serviceorganizations/productAgentNets/count`
- `/api/serviceorganizations/productAgentNets/{identifier}`
- `/api/serviceorganizations/status`
- `/api/serviceorganizations/status/crash`
- `/api/serviceorganizations/status/redis`
- `/api/serviceorganizations/translationTerminologies`
- `/api/serviceorganizations/translationTerminologies/count`
- `/api/serviceorganizations/translationTerminologies/{identifier}`
- `/api/serviceorganizations/warehouseConnectionConfigs`
- `/api/serviceorganizations/warehouseConnectionConfigs/count`
- `/api/serviceorganizations/warehouseConnectionConfigs/{identifier}`

</details>

<details><summary>/api/servicepool — 50 paths</summary>

- `/api/servicepool/applicants/bulk`
- `/api/servicepool/applicants/{identifier}`
- `/api/servicepool/audiences`
- `/api/servicepool/audiences/count`
- `/api/servicepool/audiences/{identifier}`
- `/api/servicepool/audiences/{identifier}/activeCampaigns`
- `/api/servicepool/audiences/{identifier}/talentAudienceHistory`
- `/api/servicepool/audiences/{identifier}/workerUuids`
- `/api/servicepool/copilot/audiences`
- `/api/servicepool/copilot/audiences/{identifier}`
- `/api/servicepool/funnels`
- `/api/servicepool/hireOpenings`
- `/api/servicepool/hireOpenings/count`
- `/api/servicepool/hireOpenings/{identifier}`
- `/api/servicepool/hireOpenings/{identifier}/talentMatches`
- `/api/servicepool/hireOpenings/{identifier}/v3TalentMatches`
- `/api/servicepool/processes/audiences/archive`
- `/api/servicepool/processes/audiences/duplicate`
- `/api/servicepool/processes/audiences/recomputeMembership`
- `/api/servicepool/prospects`
- `/api/servicepool/talents`
- `/api/servicepool/talents/count`
- `/api/servicepool/talents/doNotContact`
- `/api/servicepool/talents/geocoding/batch`
- `/api/servicepool/talents/geocoding/preview`
- `/api/servicepool/talents/geocoding/summary`
- `/api/servicepool/talents/templateAttributes`
- `/api/servicepool/talents/{identifier}`
- `/api/servicepool/talents/{identifier}/applicationHistory`
- `/api/servicepool/talents/{identifier}/applicationHistory/count`
- `/api/servicepool/talents/{identifier}/attributes`
- `/api/servicepool/talents/{identifier}/attributes/count`
- `/api/servicepool/talents/{identifier}/audienceCampaigns`
- `/api/servicepool/talents/{identifier}/audienceCampaigns/count`
- `/api/servicepool/talents/{identifier}/audienceHistory`
- `/api/servicepool/talents/{identifier}/audienceHistory/count`
- `/api/servicepool/talents/{identifier}/description`
- `/api/servicepool/talents/{identifier}/doNotContact`
- `/api/servicepool/talents/{identifier}/employmentHistory`
- `/api/servicepool/talents/{identifier}/employmentHistory/count`
- `/api/servicepool/talents/{identifier}/hireDocuments`
- `/api/servicepool/talents/{identifier}/hireOpeningMatches`
- `/api/servicepool/talents/{identifier}/jobMatches`
- `/api/servicepool/talents/{identifier}/prospectRecords`
- `/api/servicepool/talents/{identifier}/prospectRecords/count`
- `/api/servicepool/talents/{identifier}/prospects`
- `/api/servicepool/talents/{identifier}/skills`
- `/api/servicepool/talents/{identifier}/skills/count`
- `/api/servicepool/talents/{identifier}/v3Competencies`
- `/api/servicepool/talents/{identifier}/v3JobMatches`

</details>

<details><summary>/api/servicescheduler — 3 paths</summary>

- `/api/servicescheduler/appointments`
- `/api/servicescheduler/appointments/count`
- `/api/servicescheduler/appointments/{identifier}`

</details>

<details><summary>/api/servicesecurity — 113 paths</summary>

- `/api/servicesecurity/.well-known/jwks.json`
- `/api/servicesecurity/apikeys`
- `/api/servicesecurity/apikeys/count`
- `/api/servicesecurity/apikeys/{identifier}`
- `/api/servicesecurity/audienceSecurityGroups`
- `/api/servicesecurity/audienceSecurityGroups/count`
- `/api/servicesecurity/audienceSecurityGroups/{identifier}`
- `/api/servicesecurity/enterpriseAuthnRules`
- `/api/servicesecurity/enterpriseAuthnRules/count`
- `/api/servicesecurity/enterpriseAuthnRules/{identifier}`
- `/api/servicesecurity/importProviderSettings`
- `/api/servicesecurity/importProviderSettings/count`
- `/api/servicesecurity/importProviderSettings/{identifier}`
- `/api/servicesecurity/opensignups`
- `/api/servicesecurity/opensignups/count`
- `/api/servicesecurity/opensignups/{identifier}`
- `/api/servicesecurity/processes/analytics`
- `/api/servicesecurity/processes/apikey/enterprise/generate`
- `/api/servicesecurity/processes/apikey/enterprise/list`
- `/api/servicesecurity/processes/apikey/enterprise/{apikeyUuid}`
- `/api/servicesecurity/processes/apikey/generate`
- `/api/servicesecurity/processes/apikey/generate/integration/{userUuid}`
- `/api/servicesecurity/processes/apikey/hireApi/token`
- `/api/servicesecurity/processes/apikey/oauth/token`
- `/api/servicesecurity/processes/companies/{companyIdentifier}/forcelogout`
- `/api/servicesecurity/processes/companies/{companyIdentifier}/reset-passwords`
- `/api/servicesecurity/processes/employers/with-roles`
- `/api/servicesecurity/processes/employers/{employerIdentifier}/forcelogout`
- `/api/servicesecurity/processes/employers/{employerIdentifier}/reinvite`
- `/api/servicesecurity/processes/employers/{employerUuid}/impersonate`
- `/api/servicesecurity/processes/enterprise-identity/companyIdentities`
- `/api/servicesecurity/processes/enterprise-identity/invite`
- `/api/servicesecurity/processes/enterprise-identity/{enterpriseIdentityUuid}`
- `/api/servicesecurity/processes/enterprise-identity/{enterpriseIdentityUuid}/membership`
- `/api/servicesecurity/processes/enterpriseUsers`
- `/api/servicesecurity/processes/enterpriseUsers/count`
- `/api/servicesecurity/processes/externalSecurityGroups/cleanupExternalEmployerSecurityGroups`
- `/api/servicesecurity/processes/externalSecurityGroups/stopCleanupExternalEmployerSecurityGroups`
- `/api/servicesecurity/processes/externalSecurityGroups/stopSyncExternalHireSecurityGroups`
- `/api/servicesecurity/processes/externalSecurityGroups/syncExternalHireSecurityGroups`
- `/api/servicesecurity/processes/hire/associateWXCompanyWithHireAccount`
- `/api/servicesecurity/processes/hire/papi/applicantWebhook`
- `/api/servicesecurity/processes/hire/registerNewCompany`
- `/api/servicesecurity/processes/hire/resolveCanonicalCompany`
- `/api/servicesecurity/processes/intercom/hmac`
- `/api/servicesecurity/processes/mcp/users/product-access`
- `/api/servicesecurity/processes/okta/addSuperUser`
- `/api/servicesecurity/processes/papi/setup/v1/{hireAccountUuid}`
- `/api/servicesecurity/processes/sso/{ssoUuid}/saml`
- `/api/servicesecurity/processes/sso/{ssoUuid}/saml/assert`
- `/api/servicesecurity/processes/sso/{ssoUuid}/saml/metadata`
- `/api/servicesecurity/processes/superusers/companyIdentities`
- `/api/servicesecurity/processes/superusers/issueCompanyToken/{companyIdentifier}`
- `/api/servicesecurity/processes/system/setup-company`
- `/api/servicesecurity/processes/system/setup-enterprise`
- `/api/servicesecurity/processes/system/upgradeToSuperUser`
- `/api/servicesecurity/processes/user/fai-provisional-token`
- `/api/servicesecurity/processes/user/fai-system-token`
- `/api/servicesecurity/processes/user/generateRegisterLink`
- `/api/servicesecurity/processes/user/hire/omni/{hireAccountUuid}/wxUserAccess/{email}`
- `/api/servicesecurity/processes/user/integrations`
- `/api/servicesecurity/processes/user/invite-employer`
- `/api/servicesecurity/processes/user/kiosk/authenticate`
- `/api/servicesecurity/processes/user/kiosk/worker-login`
- `/api/servicesecurity/processes/user/login`
- `/api/servicesecurity/processes/user/logout`
- `/api/servicesecurity/processes/user/opensignup/{code}/preregister`
- `/api/servicesecurity/processes/user/password/change`
- `/api/servicesecurity/processes/user/password/prereset`
- `/api/servicesecurity/processes/user/password/reset`
- `/api/servicesecurity/processes/user/prelogin`
- `/api/servicesecurity/processes/user/preregister`
- `/api/servicesecurity/processes/user/register`
- `/api/servicesecurity/processes/user/registration-context`
- `/api/servicesecurity/processes/user/send-personal-link`
- `/api/servicesecurity/processes/user/send-portal-link/context`
- `/api/servicesecurity/processes/user/sendOtp`
- `/api/servicesecurity/processes/user/verifyOtp`
- `/api/servicesecurity/processes/user/whoami`
- `/api/servicesecurity/processes/user/worker/login`
- `/api/servicesecurity/processes/user/wxPermissions`
- `/api/servicesecurity/processes/users/backfillMissingUsersForExternalEmployers/{companyIdentifier}`
- `/api/servicesecurity/processes/users/context`
- `/api/servicesecurity/processes/users/issueCompanyToken/{companyIdentifier}`
- `/api/servicesecurity/processes/users/kiosk/active-worker`
- `/api/servicesecurity/processes/users/otp`
- `/api/servicesecurity/processes/users/productFeatureAccess`
- `/api/servicesecurity/processes/users/token/refresh`
- `/api/servicesecurity/processes/users/{userIdentifier}/forcelogout`
- `/api/servicesecurity/processes/users/{userIdentifier}/hire-superuser-impersonate`
- `/api/servicesecurity/processes/users/{userIdentifier}/inactivityUnlock`
- `/api/servicesecurity/processes/users/{userIdentifier}/login`
- `/api/servicesecurity/processes/users/{userIdentifier}/password/prereset`
- `/api/servicesecurity/processes/users/{userIdentifier}/productFeatureAccess`
- `/api/servicesecurity/processes/users/{userIdentifier}/reinvite`
- `/api/servicesecurity/processes/users/{userIdentifier}/reset_tfa`
- `/api/servicesecurity/processes/users/{workerUuid}/impersonate`
- `/api/servicesecurity/processes/workers/{workerIdentifier}/forcelogout`
- `/api/servicesecurity/processes/workers/{workerSlug}/sso`
- `/api/servicesecurity/processes/workers/{workerUuid}/impersonate`
- `/api/servicesecurity/processes/workers/{workerUuid}/token`
- `/api/servicesecurity/securityGroups`
- `/api/servicesecurity/securityGroups/count`
- `/api/servicesecurity/securityGroups/{identifier}`
- `/api/servicesecurity/sso`
- `/api/servicesecurity/sso/count`
- `/api/servicesecurity/sso/{identifier}`
- `/api/servicesecurity/status`
- `/api/servicesecurity/status/crash`
- `/api/servicesecurity/status/redis`
- `/api/servicesecurity/users`
- `/api/servicesecurity/users/count`
- `/api/servicesecurity/users/{identifier}`

</details>

<details><summary>/api/servicesegmentation — 3 paths</summary>

- `/api/servicesegmentation/segments`
- `/api/servicesegmentation/segments/count`
- `/api/servicesegmentation/segments/{identifier}`

</details>

<details><summary>/api/servicestaff — 3 paths</summary>

- `/api/servicestaff/employers`
- `/api/servicestaff/employers/count`
- `/api/servicestaff/employers/{identifier}`

</details>

<details><summary>/api/servicesupport — 18 paths</summary>

- `/api/servicesupport/process/channels/getOrCreate`
- `/api/servicesupport/process/channels/getUnreadCountForCompany`
- `/api/servicesupport/process/channels/getWorkersWithUnreadImsForCompany/{companyUuid}`
- `/api/servicesupport/process/channels/markAsRead`
- `/api/servicesupport/process/channels/markUnread`
- `/api/servicesupport/process/channels/resetExCopilotDraft`
- `/api/servicesupport/process/channels/resetUnreadEmployerMessage`
- `/api/servicesupport/process/channels/resetUnreadWorkerMessage`
- `/api/servicesupport/process/channels/search`
- `/api/servicesupport/process/channels/searchCount`
- `/api/servicesupport/process/channels/sendMessage`
- `/api/servicesupport/process/channels/sendWhatsAppTemplateMessage`
- `/api/servicesupport/process/channels/simulateReceiveMessage`
- `/api/servicesupport/process/channels/sse`
- `/api/servicesupport/process/channels/workerMarkAsRead`
- `/api/servicesupport/process/channels/workerMarkUnread`
- `/api/servicesupport/process/channels/workerSendMessage`
- `/api/servicesupport/process/channels/{workerUuid}`

</details>

<details><summary>/api/servicetodo — 12 paths</summary>

- `/api/servicetodo/i9Profiles`
- `/api/servicetodo/i9Profiles/count`
- `/api/servicetodo/i9Profiles/{identifier}`
- `/api/servicetodo/processes/i9Profiles/dashboard`
- `/api/servicetodo/processes/i9Profiles/{profileIdentifier}/accept`
- `/api/servicetodo/processes/i9Profiles/{profileIdentifier}/activate`
- `/api/servicetodo/processes/i9Profiles/{profileIdentifier}/everify`
- `/api/servicetodo/processes/i9Profiles/{profileIdentifier}/form`
- `/api/servicetodo/processes/i9Profiles/{profileIdentifier}/rehire`
- `/api/servicetodo/processes/i9Profiles/{profileIdentifier}/reject`
- `/api/servicetodo/processes/i9Profiles/{profileIdentifier}/restart`
- `/api/servicetodo/processes/i9Profiles/{workerIdentifier}`

</details>

<details><summary>/api/serviceworkforce — 57 paths</summary>

- `/api/serviceworkforce/audienceJobs`
- `/api/serviceworkforce/audienceJobs/count`
- `/api/serviceworkforce/audienceJobs/{identifier}`
- `/api/serviceworkforce/audienceLocations`
- `/api/serviceworkforce/audienceLocations/count`
- `/api/serviceworkforce/audienceLocations/{identifier}`
- `/api/serviceworkforce/audienceOpenings`
- `/api/serviceworkforce/audienceOpenings/count`
- `/api/serviceworkforce/audienceOpenings/{identifier}`
- `/api/serviceworkforce/audienceUserGroups`
- `/api/serviceworkforce/audienceUserGroups/count`
- `/api/serviceworkforce/audienceUserGroups/{identifier}`
- `/api/serviceworkforce/customAttributes`
- `/api/serviceworkforce/customAttributes/count`
- `/api/serviceworkforce/customAttributes/{identifier}`
- `/api/serviceworkforce/hireDataMappings`
- `/api/serviceworkforce/hireDataMappings/count`
- `/api/serviceworkforce/hireDataMappings/{identifier}`
- `/api/serviceworkforce/jobs`
- `/api/serviceworkforce/jobs/count`
- `/api/serviceworkforce/jobs/{identifier}`
- `/api/serviceworkforce/locationGroups`
- `/api/serviceworkforce/locationGroups/count`
- `/api/serviceworkforce/locationGroups/{identifier}`
- `/api/serviceworkforce/locations`
- `/api/serviceworkforce/locations/count`
- `/api/serviceworkforce/locations/{identifier}`
- `/api/serviceworkforce/processes/jobs/audience`
- `/api/serviceworkforce/processes/jobs/by-uuids`
- `/api/serviceworkforce/processes/jobs/custom_attributes`
- `/api/serviceworkforce/processes/jobs/jobsForLocations`
- `/api/serviceworkforce/processes/jobs/upsert`
- `/api/serviceworkforce/processes/jobs/{jobUuid}/custom_attributes`
- `/api/serviceworkforce/processes/locationGroups/custom_attributes`
- `/api/serviceworkforce/processes/locationGroups/search`
- `/api/serviceworkforce/processes/locationGroups/upsert`
- `/api/serviceworkforce/processes/locations/audience`
- `/api/serviceworkforce/processes/locations/custom_attributes`
- `/api/serviceworkforce/processes/locations/search`
- `/api/serviceworkforce/processes/locations/upsert`
- `/api/serviceworkforce/processes/locations/{hireLocationUuid}`
- `/api/serviceworkforce/processes/openings/search`
- `/api/serviceworkforce/processes/openings/upsert`
- `/api/serviceworkforce/processes/workers`
- `/api/serviceworkforce/processes/workers/context`
- `/api/serviceworkforce/processes/workers/count`
- `/api/serviceworkforce/processes/workers/fake`
- `/api/serviceworkforce/processes/workers/sendWorkerMessage`
- `/api/serviceworkforce/processes/workers/upsert`
- `/api/serviceworkforce/processes/workers/{workerIdentifier}/info`
- `/api/serviceworkforce/processes/workersByLocation`
- `/api/serviceworkforce/userGroups`
- `/api/serviceworkforce/userGroups/count`
- `/api/serviceworkforce/userGroups/{identifier}`
- `/api/serviceworkforce/workers`
- `/api/serviceworkforce/workers/count`
- `/api/serviceworkforce/workers/{identifier}`

</details>
