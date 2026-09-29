---
dimension: session
target: fountain
status: absent
access_grade_used: "auth:none"
method: inferred
completeness_pct: 0
confidence: high
captured_at: 2026-08-09
write_side_observed: false
pass2: not-applicable
sources:
  - "https://app.fountain.com/ (unauthenticated shell only)"
gaps:
  - "The entire authenticated employer-admin runtime is unobserved: no live wire capture, no walked nav, no screenshots, no observed request/response bodies."
  - "Whether the marketed AI agents (Anna, Emma, Sam) and Cue's 'multi-prompt workflow automation' are genuine LLM-driven behavior or a rules-engine relabeled as AI is entirely unverified from this dimension — it rests on marketing + whatever the bundle/api dimensions can independently support."
---

# Fountain — session capture

## Method

**Not dispatched.** This run inherits the batch-wide `auth:none` default (outside-only/no-login,
established across every prior sub-batch) — the user who commissioned this run was away from the screen
when it was queued and explicitly could not authorize a fresh session for this specific pair. The harness
never signs up or enters credentials on its own (ingestion §7 rule 1), so no authenticated capture is
possible without the user present.

The unauthenticated shell at `app.fountain.com` was mined separately by the `deployed-client-bundle`
collector (a real webpack SPA shell — see that dimension's summary), which is the closest this run gets to
the client tier.

## Findings

1. **`auth:none` — the authenticated employer-admin runtime was never entered.**
2. **`write_side_observed: false`, `pass2: not-applicable`.** No session ⇒ no Pass-2 gate. Every product
   capability's execution behavior — Source, CRM, ATS, Onboarding, Shift & Scheduling, and the three named
   AI agents — is unobserved by any dimension in this run.
3. This matches the pattern of every `auth:none` target in this project (Brandlight, Onebeat-adjacent
   runs, the AEO/GEO batch): feature *existence/gating* claims can rest on marketing + bundle/api evidence,
   but feature *execution behavior* stays capped tentative throughout Evaluation.

## Open questions

All would close with a single read-only Pass-1 session:
1. What the three AI agents (Anna/Emma/Sam) actually do mechanically — LLM calls vs. rules engine.
2. The real authenticated employer-admin IA and nav depth (vs. the public marketing IA this run can map).
3. The real API request/response shapes against `services.fountain.com` (this run only has docs-page
   descriptions, no live-observed traffic).
4. Whether the "Tenant API URLs" concept (per-tenant API base paths, per the developer docs) is a
   subdomain-per-tenant model or a path-prefix model.

## Artifacts

None — `status: absent`. Recorded as a finding per ingestion §1.
