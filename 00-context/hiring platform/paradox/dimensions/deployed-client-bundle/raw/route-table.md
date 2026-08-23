<!-- source: https://olivia.paradox.ai/{login,candidate}, cdn.olivia.paradox.ai/caches/202608/js/{common,page}.*.js · captured_at: 2026-08-09 · method: bundle-string-mine -->

# Paradox (olivia.paradox.ai) — Route table

Two coexisting frontend generations share the `olivia.paradox.ai` host, both served through the same
Django-flavored edge (csrftoken cookie, `Vary: Cookie`) — a live migration-in-progress, not a single SPA:

- **Generation A — Nuxt 3 / Vue 3 shell** (current default: `/`, `/login`, `/candidate` all serve this
  shell; build id `57dd43df-2e22-40ff-86f7-5461a0e81df4`, `app@3.0.0-beta.13`). Thin at the unauth layer —
  only the login/OTP/SSO surface is reachable without a session; the rest of its route tree is
  server-guarded (redirects to `/login`) and its page-level lazy chunks were not observed (never
  downloaded — auth-gated).
- **Generation B — legacy Django + jQuery/Vue2/Vuex/Handlebars app**, branded "**Candidate Experience
  Manager**" (`<title>`), served as the 404 fallback (e.g. hitting `/sitemap_index.xml` returns this
  shell's 404 page, not a JSON 404). Its bundle (`common.*.js` + `page.*.js`, unminified variable/string
  literals) is FAR richer — it is evidently the **recruiter/admin console**, and its client-side router
  paths are enumerated wholesale below. This is very likely the actual production admin app users land on
  post-login, with the Nuxt shell fronting only login/auth (a partial rewrite).

## Generation A (Nuxt) — confirmed unauth-reachable routes

| Route | Observed | Note |
| --- | --- | --- |
| `/` | 302 → `/login` | root always redirects |
| `/login` | 200 | Nuxt shell; SSR payload confirms `apiURL: https://api.paradox.ai` |
| `/candidate` | 200 (renders `<title>Login</title>`) | a distinct registered route, but resolves to the same login-gated shell when unauthenticated — likely the candidate-facing entry point once a session/OTP exists |

## Generation A — auth/SSO sub-routes (from `Dreh011s.js` vendor chunk string-mine)

| Path | Meaning |
| --- | --- |
| `/api/_auth` | Nuxt auth module base path (`config.public.auth.basePath`) |
| `/api/_auth/callback/adp` | SSO callback — ADP (payroll/HR) as an identity provider |
| `/api/_auth/callback/facebook` | SSO callback — Facebook |
| `/api/_auth/callback/google` | SSO callback — Google |
| `/api/_auth/callback/microsoft-entra-id` | SSO callback — Microsoft Entra ID (Azure AD) |
| `/api/_auth/callback/smartrecruiters` | SSO callback — **SmartRecruiters** (a competing/complementary ATS) — notable: implies Paradox recruiter accounts can federate off a SmartRecruiters identity, consistent with an ATS-integration partnership rather than pure competition |
| `/api/casl-ability` | CASL (JS authorization library) ability endpoint — confirms RBAC/permission model |
| `/api/v{apiVersion}` | templated, versioned API path pattern |

## Generation B (legacy admin console) — full route inventory (string-mined, deduped)

Grouped by area. This is the client-side router's path table (Vue-Router-style path strings found
verbatim in `common.34448012115f.js` / `page.b12fa8c10ff0.js`) — i.e. the **entire admin/recruiter
product surface**, unauthenticated string-level recovery (never navigated, since all require a session).

**Core navigation**
`/dashboard` · `/candidates` · `/candidates/inbox` · `/candidates/management` · `/candidate-segment/` ·
`/candidate-segment/create` · `/candidate-segments` · `/candidate-hire-detail` · `/candidate-offer-detail`
· `/jobs` · `/interviews` · `/interview/calendar/init` · `/my-calendar` · `/events` · `/events/` ·
`/campaigns` · `/campuses` · `/communications` · `/communities` · `/v3/communities` · `/talent-community`
· `/analytics` · `/cms` · `/site-studio` · `/surveys` · `/microlearning` · `/employee-recognition` ·
`/employee-rewards` · `/employee-chat/messages` · `/employer-tax-info` · `/employees` · `/admin` ·
`/admin-user` · `/alerts` · `/search` · `/search/locations` · `/search/user` · `/list-filters` ·
`/preview` · `/widget-ratings` · `/share-email` · `/user-help` · `/user-home-page` · `/user/idle` ·
`/logout` · `/iam/account-access-request`

**Assist / scheduling / interview-ops**
`/assist` · `/assist/calendar` · `/assist/scheduling_action` · `/lead-interview/schedule` ·
`/lead-interview/cancel` · `/lead-interview/cancel_request` · `/lead-interview/check_attendee` ·
`/lead-interview/reschedule` · `/lead-interview/slots` · `/lead-interview/edit_itv_details` ·
`/lead-interview/assign_scheduling_task` · `/lead-event-interview/events` ·
`/lead-event-interview/cancel` · `/lead-event-interview/session` ·
`/lead-event-interview/orientation_events` · `/lead-itv-prep` · `/lead-itv-settings` · `/lead-watch` ·
`/external` · `/external/` · `/external/itv-settings` · `/external/itv-settings/search-users` ·
`/external/review/schedule` · `/external/review/cancel` · `/external/review/cancel_request` ·
`/external/review/check_attendee` · `/external/review/reschedule` · `/external/review/xhr` ·
`/external/review/edit_itv_details` · `/external/event-schedule/events` ·
`/external/event-schedule/cancel` · `/external/event-schedule/session` ·
`/external/scheduling/get-slots` · `/external/itv-prep/upload` (POST, under `/api/`) ·
`/settings/external-interview-preps/create`

**Settings (the admin/configuration depth — a very large surface)**
`/settings` · `/settings/my-profile` · `/settings/security` · `/settings/users` ·
`/settings/group-management` · `/settings/company-information` · `/settings/client-setup` ·
`/settings/location-management` · `/settings/school-management` · `/settings/field-manager` ·
`/settings/system-attributes` · `/settings/forms` · `/settings/job-builder` ·
`/settings/job-data-packages` · `/settings/applicant-flows` · `/settings/approvals` ·
`/settings/approvals-builder` · `/settings/round-robin-management` · `/settings/interview-builder` ·
`/settings/interview-preps` · `/settings/event-templates` · `/settings/workflows` ·
`/settings/journeys` · `/settings/candidate-volume-optimizer` · `/settings/conversations` ·
`/settings/assistant-messaging` · `/settings/assistant-reminders` · `/settings/whatsapp-templates` ·
`/settings/phone-numbers` · `/settings/web-management` · `/settings/knowledge-base` ·
`/settings/data-feeds` · `/settings/alert-management-v2` · `/settings/user-feedback` ·
`/settings/suggestions` · `/settings/experience` · `/settings/offers-type` ·
`/integration-center-v2` · `/company/` · `/company/get_states/` · `/get_children_locations`

**API (same-origin, non-`_auth`)**
`/api/company` · `/api/company/users` · `/api/menu` · `/menu/clicked-tracking` ·
`/api/gen-ai/init-data` · `/api/gen-ai/create-feedback` · `/api/gen-ai/track-consent-approval`

## Cross-reference note

`/api/gen-ai/*` (same-origin, called from the legacy admin app) is a **different path family** from the
`genai.paradox.ai` dedicated subdomain embedded in the Nuxt config (`config.public.genai.endpoint`) — two
distinct integration points to the GenAI backend from the two frontend generations. Both should be
diffed against `session`/`wire` observations if that dimension is ever unblocked.

## Gaps

- No lazy-loaded page-level Nuxt chunks were fetched (all auth-gated; static import graph from the two
  unauth-reachable entry chunks carried no further chunk-hash literals to follow).
- The candidate-facing SMS/chat conversation UI itself was not located as a distinct bundle/route — see
  `_summary.md` Open questions.
