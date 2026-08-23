---
dimension: session
target: paradox
status: absent
access_grade_used: "auth:none"
method: inferred
completeness_pct: 0
confidence: high
captured_at: 2026-08-09
write_side_observed: false
pass2: not-applicable
sources:
  - "https://olivia.paradox.ai/ (unauthenticated shell only)"
gaps:
  - "The entire authenticated recruiter-admin runtime (the actual Conversational-ATS/CRM/Scheduling console) is unobserved."
  - "The candidate-facing SMS/chat conversation flow with Olivia — the product's core interaction model — is entirely unobserved from the recruiter or candidate side."
---

# Paradox — session capture

## Method

**Not dispatched** — same batch-wide `auth:none` default as Fountain (see that dimension's identical
reasoning). No credential ever available; the harness never signs up or enters credentials.

The unauthenticated shell at `olivia.paradox.ai` was mined separately by the `deployed-client-bundle`
collector.

## Findings

1. **`auth:none` — the authenticated recruiter-admin runtime was never entered.**
2. **`write_side_observed: false`, `pass2: not-applicable`.** The core interaction model of this product —
   a candidate texting/chatting with "Olivia" — is fundamentally different from a dashboard-driven SaaS
   and is the single biggest observational gap in this run: no dimension can substitute for actually
   watching a live conversation.
3. Distribution-artifacts (the confirmed native iOS app) is the closest surrogate this run has for the
   candidate-facing experience, since its public App Store listing includes screenshots.

## Open questions

All would close with a single read-only Pass-1 session (recruiter side) plus a candidate-side text/chat
interaction:
1. What "Conversational Scheduling"/"Conversational Events" actually look like as a live chat transcript.
2. The real recruiter-admin IA (ATS/CRM/Career-Sites consoles) vs. the public marketing IA.
3. Whether the seven "Conversational X" products share one underlying engine or are more loosely coupled.

## Artifacts

No capture artifacts — `status: absent`. Recorded as a finding per ingestion §1.

One **Mode-4 (Cartography) placeholder** was later written under this dimension, because
`cartography-coverage.md` locates the screenshot contract here:

- `captures/screens/_index.md` — a **textual index only, no image files**. It points at first-party
  **App Store listing screenshots** (mined by `distribution-artifacts`) as the closest available
  surrogate for a UI walk, and records the live-capture gap explicitly. **Nothing in it was captured from
  a live session**; `screenshots_captured_this_run: 0`.

> **Second blocker, recorded separately from `auth:none`.** Mode 4 additionally found that the
> **Chrome / browser-driving MCP tools were absent from the session's toolset entirely** (verified by
> tool search — a *capability* gap per ingestion §8, not a permission gate). Even with a credential, no
> surface could have been walked and no screenshot taken. The two blockers are independent and are scored
> separately in `evaluation/feature-coverage.md`.
