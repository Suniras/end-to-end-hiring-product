---
dimension: wire-capture
target: fountain
status: folded
access_grade_used: "runtime:reachable, auth:none"
method: inferred
completeness_pct: 0
confidence: high
captured_at: 2026-08-09
sources: []
gaps:
  - "No live wire observation of any kind — folds into the absent `session` dimension per ingestion.md §7.1's fold note."
---

# Fountain — wire-capture capture

## Method

**Folded into `session`.** Per ingestion.md §7.1, wire-capture's rung-1 (browser network tap) IS the
in-page interceptor `session` would install — there is no separate non-browser client for Fountain to
target (no CLI, no desktop app; `distribution-artifacts` confirmed no native mobile client exists either).
Since `session` is `status: absent` this run (`auth:none`, batch default, user unreachable to authorize),
the folded wire-capture has nothing to attach to and is correspondingly absent.

## Findings

None — no wire observation occurred. All API-path knowledge in this run comes from static sources
(`docs`, `api` reference pages, `deployed-client-bundle` source-map reassembly), not live traffic.

## Open questions

Would close entirely if a future run authorizes `session` — the folded wire-capture would then ride along
on the same authenticated browser tap.

## Artifacts

None — `status: folded`, naming `session` as the fold target, per ingestion.md §1.
