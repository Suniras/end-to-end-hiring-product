# Paradox — Shared Feature Flags

Seeded empty by Ingestion (Mode 2) before collector fan-out, per ingestion.md §6. Contributing dimensions
append a `## source: <dim>` section below — never create a separate copy of this file.

---

## source: bundle

<!-- captured_at: 2026-08-09 · method: bundle-string-mine · host: olivia.paradox.ai (unauth, Nuxt SSR payload) -->

| Flag key | Observed state (unauth, this capture) | Notes |
| --- | --- | --- |
| `system:theme` | `{enabled:false}` | theming feature flag |
| `ai_interview_page:enabled_new_ui` | `{enabled:true, value:"0"}` | a genuine, live, in-house feature flag gating a new UI for an "AI interview page" — the clearest confirmed flag on this run |

**Flag system:** appears to be a **custom in-house flag store** (Nuxt/Pinia `$sfeatureFlags` state,
populated server-side at SSR time) — NOT a named third-party flagging SaaS. The Sentry SDK bundled in the
vendor chunk carries generic, always-present integration-adapter code referencing `LaunchDarkly`,
`Statsig`, and `Unleash` (`buildLaunchDarklyFlagUsedHandler`, etc.) — this is Sentry's own optional
feature-flag-tracking integrations shipped in every build regardless of which (if any) flag vendor a
customer actually wires up, and should NOT be read as evidence Paradox uses any of those three vendors.
No corroborating network host, config key, or storage key for LaunchDarkly/Statsig/Unleash was found.
