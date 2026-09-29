# Fountain — Shared Feature Flags

Seeded empty by Ingestion (Mode 2) before collector fan-out, per ingestion.md §6. Contributing dimensions
append a `## source: <dim>` section below — never create a separate copy of this file.

---

## source: bundle

<!-- captured_at: 2026-08-09 · method: source-map-reassembly (high confidence) · dimension: deployed-client-bundle -->

**Recovery method:** grepped `whoami.feature_flags['...']` literals and `whoami.*_enabled` boolean
gates across all 1757 first-party app source files reassembled from `main.js`'s live production source
map. Every flag below gates a real, named product surface (most are also tied to a specific route in
`dimensions/deployed-client-bundle/raw/route-table.md`).

### LaunchDarkly-style flags — `whoami.feature_flags['<key>']` (50 keys)

`additional-opening-details` · `aimbridge-hiring-goals-improvements` ·
`applicant-duplicate-check-in-rule-stage` · `applicant-grouped-details` ·
`applicant-portal-javascript` · `audit-trails-display` ·
`available-slots-new-availability-message` · `cai-show-apply-v-2` ·
`cai-show-knowledge-base-v-2` · `calendar-zero-schedule-tab` ·
`cannot-repeat-standard-key` · `career-site-interdependent-filters` ·
`career-site-settings` · `career-site-translation` · `collapse-applicant-rows` ·
`custom-terminologies` · `custom-user-notification` · `customer-attributes-rules` ·
`disable-uav-user-badge` · `embedded-docusign` · `fountain-concept-mapping` ·
`hire-go-enable-live-video-interview` · `hiring-goals-v2` · `hiring-goals-v4` ·
`hold-data-collection-partner-webhooks` · `immediate-hiring-decision` ·
`internal-career-site` · `manage-customer-attributes` ·
`merge-key-translation-control` · `message-applicant-from-any-channel` ·
`oauth2-webhooks` · `offer-approval-control` · `offer-letter-templates` ·
`opening-approvals-improvements` · `opening-attributes-management` ·
`opening-csv-update` · `opening-job-description` · `opening-status-icon-2-0` ·
`openings-table-customize-columns` · `pipeline-stages` · `pool-in-hire` ·
`referral-product` · `show-columns-drawer-in-sessions` · `sms-length-limited` ·
`universal-recruiter-dashboard` · `ups-functionality` ·
`workflow-editor-partner-stage-preview` · `workflow-system` ·
`workramp-help-center-sso` · `zip-recruiter-integration`

Two flags name specific enterprise customers directly (**not** a secret, but a notable disclosure of
named accounts in client-shipped code): `aimbridge-hiring-goals-improvements` (Aimbridge Hospitality)
and `ups-functionality` (UPS) — corroborated independently by `runtimeEnvVars.js`'s
`TENANT_WX_RELEASE_CHANNELS = { aimbridge: 'aimbridge', ups: 'ups' }` map (see bundle-map.md).

### Boolean account/tenant capability gates — `whoami.<key>` (27 keys)

`account_sms_enabled` · `ai_workflow_builder_enabled` · `applicant_search_settings_enabled` ·
`auto_generate_dummy_email_enabled` · `cai_agent_enabled` · `calendar_event_creation_enabled` ·
`chatbot_admin_enabled` · `chatbot_automated_response_enabled` · `chatbot_review_enabled` ·
`desktop_notification_enabled` · `fountain_ai_career_site_enabled` ·
`fountain_ai_carreer_site_setting_enabled` (sic — typo present in source) · `fountain_ai_enabled` ·
`fountain_ai_faq_enabled` · `fountain_ai_upsell_enabled` · `get_more_text_to_apply_enabled` ·
`go_enabled` · `hiring_goals_enabled` · `hiring_goals_v3_enabled` · `is_faq_bot_enabled` ·
`looker_custom_reports_enabled` · `opening_approval_enabled` ·
`post_interview_recruiter_notifications_enabled` · `qr_code_for_opening_enabled` ·
`slot_availability_based_openings_enabled` · `whats_app_enabled` · `workflow_editor_v2_enabled`

`looker_custom_reports_enabled` confirms **Looker** as the embedded BI/analytics backend for the
Analytics Dashboard surface — a stack finding not otherwise visible.

### LaunchDarkly client-side IDs (public-by-design — LD client-side IDs authorize flag *evaluation*
only, not writes, and are meant to ship in client bundles; not treated as a secret per §7's "provider
key prefix" table, which targets write-capable secrets, not LD's own documented public identifier)

| Environment | Client-side ID |
| --- | --- |
| prod | `652f17e244cb56124fa8cf96` |
| dev | `65c66efbfc74a80ff1860f04` |
| other/staging (default fallback) | `652f17e244cb56124fa8cf95` |

A **second, independent** LaunchDarkly client-side ID exists for the separately-deployed "Cue" AI-copilot
micro-frontend, overridable via `REACT_APP_WX_LAUNCH_DARKLY_CLIENT_SIDE_ID` (falls back to the same
`domainMeta.launchDarklyClientSideId` above when unset — which is the case in this observed deploy) —
i.e. the copilot subsystem is architecturally capable of independent flag targeting from the main app,
even though it currently shares the same LD project ID.

### Other flag/experimentation SDKs

PostHog is wired app-wide (`PostHogRootProvider` wraps the entire app with
`{product: 'hire', ui: 'recruiter'}` properties) — used for both product analytics and (per PostHog's
own feature set) potentially feature flags/experiments, though no `posthog.isFeatureEnabled(...)` call
sites were found in the reassembled source this run (bounded gap — not exhaustively grepped across every
container).

---

### Addendum (Mode-5 iteration 1, same dimension/source) — `wx-navbar.umd.js` + `wx-copilot.umd.js`

<!-- captured_at: 2026-08-09 · method: bundle-string-mine (medium confidence) · dimension: deployed-client-bundle -->

No new LaunchDarkly-style flag keys were found in either file (`isFeatureEnabled(...)` call sites use
dynamically-computed arguments in both bundles, not literal flag-name strings — a bounded gap, not a
confirmed-empty finding). Two kebab-case strings that look flag-shaped on first grep —
`"account-copilot"` / `"account-advanced-copilot"` — are **not feature flags**: they are cache-key
discriminators for a `copilotAgentNet` resource lookup (`accountCopilotAgentNetUuid` /
`accountAdvancedCopilotAgentNetUuid`), i.e. **two priced tiers of Cue's own "Agent Net"** (a
`serviceorganizations/productAgentNets` resource, per the shared `api-path-catalog.md` addendum) —
a billing/tier distinction, not a gate. Recorded here so a future pass doesn't re-flag them as LD keys.

The navbar's mount-time `featureFlags` config prop (`raw/wx-micro-frontends.md` §1a) confirms the *shape*
of flag delivery to this micro-frontend (a pre-resolved map handed in by the host app) but not any new
key names — the host app computes the map from the same `whoami.feature_flags`/`whoami.*_enabled`
sources already catalogued above.
