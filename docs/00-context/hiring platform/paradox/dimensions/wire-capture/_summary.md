---
dimension: wire-capture
target: paradox
status: folded
access_grade_used: "runtime:reachable, auth:none"
method: inferred
completeness_pct: 0
confidence: high
captured_at: 2026-08-09
sources: []
gaps:
  - "No live wire observation of any kind — folds into the absent `session` dimension per ingestion.md §7.1's fold note."
  - "The candidate-facing SMS/chat conversation with Olivia — the product's core interaction model — is the single biggest observational gap this fold leaves; it would need either an authenticated session or the user actually texting a live Paradox-powered career site to observe."
---

# Paradox — wire-capture capture

## Method

**Folded into `session`.** Per ingestion.md §7.1, wire-capture's rung-1 (browser network tap) IS the
in-page interceptor `session` would install. Paradox does have one candidate non-browser client
(`distribution-artifacts` confirmed a native iOS/Android "Olivia by Paradox - CEM" recruiter app, plus a
Safari/macOS browser extension), which would be a genuine independent wire-capture target in a future
authorized run — but with `auth:none` this run and no device/extension install performed, there is
nothing to tap.

## Findings

None — no wire observation occurred. All API-path knowledge in this run comes from static sources
(`api`'s recovered `readme.paradox.ai` OpenAPI spec, `deployed-client-bundle`'s source-string mine of the
Nuxt/legacy admin console).

## Open questions

Would close substantially if a future run authorizes either `session` (recruiter-console traffic) or a
mobile-app wire-capture rung against the confirmed native app (candidate/recruiter conversation traffic,
the product's core interaction model and the single biggest gap in this entire run).

## Artifacts

None — `status: folded`, naming `session` as the fold target, per ingestion.md §1.
