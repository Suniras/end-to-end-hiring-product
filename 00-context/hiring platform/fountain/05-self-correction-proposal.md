---
target: fountain
proposed_at: 2026-08-09
status: PROPOSED
awaiting_approval: true
run_score: 82.5
vibe: solid # 70–84 band
iterations: 4 # iteration 0 (baseline) + 1 + 2 + 3
stopped_on: converged # no within-run defect remains: every Evaluation + Cartography defect is retired, and the five that stand (D1, D2, D3, I1, X1) are harness-routed or historical-behaviour records that NO within-run action can retire. The hard floor — features_walked / screenshot_coverage / the write side — needs a browser or a session and is unreachable within-run at any effort.
score_history: [64.4, 62.0, 66.7, 82.5] # iter 1 restated in it. 2 (axis-4 arithmetic); iter 2 restated in it. 3 (axis-2 nav denominator + axis-6 Σ recount) — see §The iteration-3 restatements
---

# Fountain — Self-Correction (Mode 5)

## Run measurement

**Final score (run as shipped, post-iteration-3): 82.5 / 100 · band: solid.** Up from a **restated**
66.7 at iteration 2 (the recorded 68.8 contained two measurement errors this iteration found and fixed —
see §The iteration-3 restatements). The gain is real but its *shape* matters: **+6.0 on axis 4** is
substantive reconciliation work, while **+9.0 on axis 6** is largely the defect-load axis coming off its
floor all at once — the cliff H9 predicted, now observed.

| # | Axis (max) | iter 0 | iter 1 | iter 2 *(restated)* | **iter 3** | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Dimensional coverage (15) | 15.0 | 15.0 | 15.0 | **15.0** | Unchanged; nothing in iteration 3 touched dimension coverage. |
| 2 | Experiential / IA coverage (20) | 10.7 | 12.3 | **11.2** ⟵ *restated* | **11.2** | `8×0.68 + 6×0.89 + 4×0.00 + 2×0.20`. **W7 executed** — and it moved the number **down**, correctly. `feature-coverage.md` scored the nav term `2 × (14÷14)` = full credit; this proposal estimated `14÷19`. Counted from the catalog itself, the denominator is **20 distinct top-level products** and the numerator — destinations with a surface card — is **4**. Cartography mapped the interior of **one of twenty** top-level products; 14/14 asserted the opposite. Row 66 (Hire Go) was added to the claimed catalog: numerator **and** denominator each +1, so `feature_location_rate` stays 68 — more honest, not inflated. Structurally capped regardless: `screenshot_coverage: 0`, `features_walked: 0`. |
| 3 | Provenance integrity (15) | 13.7 | 13.7 | 14.0 | **14.3** | `7.5×(11/11 frontmatter)` + `7.5×~0.90`. **+0.3** from W3's second half: `competitive-positioning.md`'s final 25% — the section a decision-maker reads first — had two load-bearing bullets with **no anchor at all** and six tags decayed to dimension-name-only. All eight now carry `path · method · confidence`. **Deliberately not scored higher:** only the *named* section was repaired; no exhaustive corpus-wide anchor audit was run, so 0.90 is the honest fraction, not 0.95. |
| 4 | Reconciliation correctness (20) | 9.0 | 7.0 | 12.0 | **18.0** | Start 20, **−2** only. **Retired this iteration: all four remaining weighting violations** — the Cue over-promotion (E2, W2, +2), the HRIS/ADP over-promotion (E3, W3, +3), the soft over-promotion family (E8, +2), and declared-material-under-an-"observed"-heading (E7, +1). **Residual −2:** the three known single-source-as-fact instances were fixed by name, but **no systematic sweep** for others was performed across a 4,200-line rollup corpus — charging 0 would be the exact over-claim this axis exists to catch. |
| 5 | Calibration & safety (15) | 14.0 | 14.0 | 14.5 | **15.0** | **Redaction: clean — trivially so.** Iteration 3 was desk work plus **two unauthenticated GETs of a UI vendor chunk**; nothing credential-shaped was fetched, returned or written. **+0.5** for C2: `feature-coverage.md`'s banner no longer carries iteration-0 numbers (`48`, `25`) beside current ones — they are now explicitly boxed as historical with the frontmatter named authoritative. The iteration also **lowered its own headline coverage number on principle**, which is the behaviour this axis is meant to reward. |
| 6 | Defect load (15) | 2.0 | 0.0 | **0.0** ⟵ *restated* | **9.0** | `15 − Σ(severity)`. **Σ recounted from scratch this iteration** (see the restatements): iteration 2's true Σ was **16**, not 14, so its axis 6 was **floored at 0.0**, not 1.0. Iteration 3 retires **E2 (2) + E3 (2) + E6 (2) + E7 (1) + E8 (1) + C1 (1) + C2 (1) = 10**, leaving **Σ = 6** — D1 (1), D2 (1), D3 (1), I1 (2), X1 (1), every one of them harness-routed or a historical-behaviour record. |
| | **Total** | 64.4 | 62.0 | **66.7** | **82.5** | Δ **+15.8**. No regression at any point in the loop; `best == current`. |

**Gestalt:** *a static teardown that finished arguing with itself, then corrected its own scorecard
downward on the one axis it had been flattering.* Iterations 1–2 found the product (a second MCP server,
127 agent tools, an undocumented API family); **iteration 3 found nothing new about Fountain and fixed
how the run talks about what it already knew** — four over-promotions retired, eight anchors restored,
and a coverage scorecard recomputed against the denominator the run's own headline finding implies. The
two structural zeros (`features_walked: 0`, `screenshot_coverage: 0`) are untouched and untouchable
without a browser; they are why 82.5 is `solid` and not `strong`.

### The iteration-3 restatements (H11 applied to iteration 3's own input)

Per proposal **H11** — *"before computing `score[iter]`, re-derive `score[iter−1]` from its own per-axis
deductions and restate if they disagree"* — iteration 2's score was re-derived before iteration 3's was
computed. **It disagreed, twice, both in the flattering direction:**

1. **Axis 2 used a denominator the run had already superseded.** Iteration 2 carried forward
   `2 × (14 ÷ 19)` = 1.47 without recomputing (it said so, honestly — W7 was out of scope). The true
   figure is `2 × (4 ÷ 20)` = **0.40**. Iteration 2's axis 2 was **11.2, not 12.3**. Note this is *not* a
   regression caused by iteration 3 — the coverage never changed; only the measurement became correct.
2. **Axis 6's Σ was under-counted.** The still-charged set after iteration 2 was E2 (2) + E3 (2) + E6 (2)
   + E7 (1) + E8 (1) + C1 (1) + C2 (1) + D1 (1) + D2 (1) + D3 (1) + I1 (2) + X1 (1) = **16**, not the
   recorded 14. `15 − 16 < 0`, so iteration 2's axis 6 floors at **0.0, not 1.0**.

⇒ **iteration 2 restated: 66.7, not 68.8.** Two consequences worth stating: the loop's real trajectory is
**64.4 → 62.0 → 66.7 → 82.5**, and **H11 has now paid for itself on its very first application** — a
proposal written in iteration 2 caught two errors in iteration 2's own measurement one round later.

### H9 is not just "floored" — it is a cliff, and that is stronger evidence than before

Iterations 1 and 2 established that axis 6 contributes **0** on any corpus large enough for Σ to exceed
15. Iteration 3 shows the other half of the pathology: crossing back under the threshold pays out
**+9 in a single round**. So the axis is not merely insensitive — it is **bimodal**, contributing nothing
across most of a run's life and then dominating the delta of whichever round happens to cross Σ = 15.
**Nearly 60% of this iteration's +15.8 is that one crossing**, not 60% of the work. A loop steered on
this signal would under-value every round before the crossing and wildly over-value the one after it.
This strengthens **H9** from "the axis floors" to "the axis is a step function", and it is still **one
target's evidence — one vote, not two.**

<!-- Historical: the iteration-0/1/2 axis notes below are superseded by the table above; kept for the audit trail. -->

<details>
<summary>Iteration-0 → 2 axis notes (superseded by the table above — click to expand)</summary>

| # | Axis (max) | iter 0 | iter 1 | **iter 2** | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | Dimensional coverage (15) | **15.0** | **15.0** | **15.0** | Unchanged. 7/7 reachable dimensions returned `complete`; 0 blocked-where-predicted-available. `codebase`/`session`/`distribution-artifacts` are absent **by the access vector**, not by failure, and each is a verified finding with its own `_summary.md`. |
| 2 | Experiential / IA coverage (20) | **10.7** | **12.3** | **12.3** | `8×0.68 + 6×0.89 + 4×0.00 + 2×(14÷19)`. **Deliberately not moved.** Iteration 2 was desk-reconciliation + two static probes; it did not re-walk, did not screenshot, and — honestly — **did not recompute the coverage scorecard** (that is W7, which was not in this iteration's scope). Claiming a location-rate rise without recomputing the matrix would be exactly the over-claim this axis exists to catch. Structurally capped regardless: `screenshot_coverage: 0` and `features_walked: 0` need a browser. |
| 3 | Provenance integrity (15) | **13.7** | **13.7** | **14.0** | `7.5×(11/11 frontmatter)` + `7.5×~0.84`. **+0.3** for three concrete provenance repairs: `superseded_by:` banners added to **both** `dimensions/api/_summary.md` and `raw/tool-catalog.md` (a reader entering via the dimension no longer gets the refuted answer), a new honest `method_ceiling:` field on `docs/_summary.md` distinguishing *what is knowable cheaply* from *what is known*, and ~40 new claims all anchored + method + confidence tagged. Still capped by `competitive-positioning.md`'s final ~25% (defect E6, → W3, not done). |
| 4 | Reconciliation correctness (20) | **9.0** | **7.0** ⟵ *restated* | **12.0** | Start 20. **Remaining:** −3 HRIS over-promotion (E3, → W3), −2 Cue "runs on Claude" over-promotion (E2, → W2), −2 soft over-promotion family (E8), −1 declared-material-under-an-"observed"-heading (E7). **Retired this iteration:** the incomplete propagation (E1, +2), the four surviving sibling contradictions (E4, +2), the false comparative (E5, +1). See the arithmetic correction below for why iter 1 is restated 9.0 → 7.0. |
| 5 | Calibration & safety (15) | **14.0** | **14.0** | **14.5** | **Redaction: clean, re-verified.** The two MCP probes and five docs fetches returned no credential-shaped values; nothing secret was written. **+0.5** for three calibration wins: the wx/fountain-ai MCP negative is phrased **artifact-scoped by name** (ingestion §7 rule 10 — "absent from the 16 candidate names probed", never "absent"); W9's result is recorded as a **method *ceiling*, not a grade upgrade**, refusing the easy over-claim; and the iteration **self-caught and corrected an error in its own input artifact** (§2e's "eight of fourteen" list was wrong — four of the eight *are* documented). Still −0.5 for the stale iter-0 numbers in `feature-coverage.md`'s banner (C2, → W7). |
| 6 | Defect load (15) | **2.0** | **0.0** | **1.0** | `15 − Σ(sev)`. iter 0 Σ=13; iter 1 Σ=18; **iter 2 Σ=14** (retired E1, E4, E5, I2 = 4 med, and E9). Still all but floored — **H9 is now empirically confirmed, not predicted** (see below). |
| | **Total** | **64.4 ≈ 64** | **62.0 ≈ 62** | **68.8 ≈ 69** | Δ **+6.8** on the corrected baseline (**+4.8** vs the previously-recorded 64) — a clear, non-noise improvement; no regression, no revert. |

**Gestalt:** the run has moved from *"an unusually disciplined static teardown that didn't finish talking
to itself"* to *"a disciplined static teardown that has now reconciled its own findings and, in the
process, found the thing it was looking for."* The two structural zeros (`features_walked: 0`,
`screenshot_coverage: 0`) still hold the band at thin and are unreachable without a browser — but the
substantive picture of the target changed materially this round: **766 declared app-own paths across ≥19
microservices (not 300 across 12), a second live MCP server that turns out to be the Hire agent surface
the run had been hunting since Mode 1, and an entire undocumented `/api/go/*` API family.**

### The arithmetic correction (a Mode-5 defect in Mode 5's own measurement)

Iteration 1's axis-4 cell reads: *"iter 0: −11 … iter 1: retires the artifact-scoped-negative deduction
(+2) but adds a NEW over-promotion (−2) and the incomplete propagation (−2). **Net flat.**"*
**That is not net flat: +2 −2 −2 = −2.** Iteration 1's axis 4 was **7.0, not 9.0**, and its total was
**62.0, not 64.0**. The ledger has been restated. Two consequences worth stating plainly:

1. Iteration 1 was a **−2.4 regression**, not a flat round — still inside `TOL≈2`? No: 64.4 → 62.0 is a
   2.4-point drop, marginally **outside** tolerance. Under a strict reading the loop should have
   considered reverting. It should **not** have reverted (iteration 1's substantive gains were large and
   its only real cost was propagation debt that iteration 2 has now paid off), which is itself evidence
   for harness proposal **H10**: the rubric charges a fix's propagation debt in the round that creates
   it, so a correcting iteration can score as a regression.
2. **A self-correction proposal is an artifact like any other, and its arithmetic is checkable.** Nothing
   in the current stage-A checklist tells Mode 5 to verify its own prior measurement. → new harness
   proposal **H11**.

### Two measurement findings, both now stronger than when first recorded

1. **H9 confirmed empirically, twice.** Axis 6 contributed **0.0 → 1.0** across an iteration that retired
   **four medium defects and one low** — a 5-point severity reduction bought 1 point of score, because
   the axis floors at 0 on any corpus large enough to accumulate Σ > 15. Iteration 1 predicted this;
   iteration 2 demonstrates it. (Per the batch rule this is still **one target's** evidence — one vote,
   not two — but it is now a measurement, not a forecast.)
2. **Iteration 1 raised the numerator and the denominator at the same time.** `feature-coverage.md`
   self-estimated axis 2 at 13.8 using a 14-destination denominator; iteration 1's own `wx-navbar`
   catalog established **19** top-level destinations. Scored against the denominator the iteration itself
   discovered, axis 2 is **12.3**, not 13.8. Finding more of the product legitimately lowers your
   coverage ratio. **Unchanged in iteration 2, and W7 still owns the recomputation.**
   *(Iteration 3 note: **19 was itself wrong** — the catalog holds 21 rows / **20 distinct products**,
   and the numerator is **4**, not 14. See the restatements above.)*

</details>

---

## Iteration ledger

| iter | score | Δ | dim | **ia** | prov | recon | calib | defects | within-run fixes applied | remaining |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | **64.4** | — | 15.0 | 10.7 | 13.7 | 9.0 | 14.0 | 2.0 | (baseline — Discovery → Ingestion → Evaluation → Cartography, plus **two** sibling-reconciliation passes already run over the 4 rollups) | 9 defects |
| 1 | **62.0** *(restated from 64.0)* | **−2.4** | 15.0 | **12.3** | 13.7 | **7.0** | 14.0 | **0.0** | fetched + mined `wx-navbar.umd.js` and `wx-copilot.umd.js` (2 unauth GETs, ~8.8 MB); read-only MCP capability probe (`initialize` + `tools/list`, no tool invoked); propagated the MCP + LLM-backend corrections into 4 rollups + README + 3 Cartography docs; promoted 13 coverage rows; reversed the "Communicate" over-claim disposition | 13 defects (1 retired, 5 added) |
| **2** | **66.7** *(restated from 68.8)* | **+4.7** | 15.0 | **11.2** ⟵ *restated* | **14.0** | **12.0** | **14.5** | **0.0** ⟵ *restated* | **W1** full API-surface propagation (466 paths / ≥19 microservices into all 4 rollups + README + `ux-flows` + `information-architecture` + `feature-coverage`; OQ #8 struck); **W4** all four sibling contradictions + the `#6`/`#8` cross-ref + the 81-vs-108 false comparative in **three** docs; **W5** `superseded_by:` back-annotation on `api/{_summary.md, raw/tool-catalog.md}`; **W6** Communicate reversal landed in `product-features`; **W8** probed the 3 unprobed MCP hosts → **found a second live server**; **W9** fetched 5 `service*` reference pages → **OpenAPI fragments confirmed family-wide** | **6 of 10** within-run items closed; **W2, W3, W7, W10 remain** (11 defects) |
| **3** | **82.5** | **+15.8** | 15.0 | 11.2 | **14.3** | **18.0** | **15.0** | **9.0** | **W2** the Cue over-promotion split into *declared config* (fact, single-lane) vs *"runs on Claude"* (tentative) across **8 files**; **W3** the HRIS/ADP subset re-flagged to `data-model`'s posture in **2 places**, both unanchored load-bearing bullets anchored, 6 decayed tags restored, "certified" struck; **W7** the coverage scorecard **recomputed** — nav term `14÷14 → 4÷20`, row 66 (Hire Go) added, the iter-0 banner numbers boxed as historical; **W10** `npm.fountain.*` reassembled (**⌘K command palette found**, zero new API paths — a recorded negative) and the lazy route chunks **confirmed unfetchable**; **plus** E7 + E8 retired opportunistically and a **fourth** 81-vs-108 instance found and fixed | **10 of 10** within-run items resolved (8 done, 1 done-in-part, 1 confirmed-blocked). **CONVERGED** — Σ=6, all five remaining defects harness-routed or historical |

> **Basis note on the `ia` column (iteration 3).** Iterations 0 and 1 are shown on the **old** axis-2
> basis (nav term `2 × (14÷14)` and `2 × (14÷19)` respectively). On the corrected `4÷20` basis each would
> be **~1.1 lower** — iter 0 ≈ 9.6 (total ≈ 63.3), iter 1 ≈ 11.2 (total ≈ 60.9). Only iteration 2 was
> formally restated, because that is the score the regression test actually compares against (H11 asks
> for `score[iter−1]`). **The per-round deltas are unaffected by the basis**, since the correction is a
> constant offset across every round — which is precisely why it is a *measurement* correction and not a
> regression.

**What iteration 1 actually bought (substantively, where the rubric is blind):** a live production MCP server (`fountain-data-mcp v1.27.2`, Cube.js + ClickHouse) that **corrected** a stated run-level negative; Cue's LLM backend (Claude Opus/Sonnet 4.6 via Bedrock, in a multi-provider schema defaulting to `openai`); the full Frontline-OS destination catalog (19 top-level products); confirmation that `Communicate` is a real routed product, not an over-claim; a **third independent lane** on the Hire-vs-Worker-Experience two-application split (`FDEPLOY_RULES` vs `FDEPLOY_RULES_WX`); and 466 app-tier paths across 15 microservices.

**What iteration 1 left undone, and why it scored as a regression:** that last item — the 466-path / 15-microservice mine — **reached none of the four evaluation rollups.** The iteration was scoped to its two headline questions (LLM backend, MCP) plus the three Cartography docs, and skipped the API-surface consequences of the same fetch. **Iteration 2 paid that debt in full and then some.**

### What iteration 2 actually bought (substantively)

The desk half (W1/W4/W5/W6) was debt repayment — but the two cheap collection items (W8/W9), estimated
at **+1.6 combined**, returned the largest single finding of the entire run:

1. **A second live MCP server — and it is the Hire agent surface the run had been chasing since Mode 1.**
   `mcp.fountain.com` = **`fountain-hire-mcp-server v1.0.0`**, returning **127 fully JSON-Schema'd tools
   to an unauthenticated `tools/list`**, every one tagged `exposeAsMcpTool`. This closes iteration 1's
   largest surviving scope caveat *and* iteration 0's `api`-dimension open question in one probe. **No
   tool was invoked.**
2. **`exposeAsMcpTool` is now traced end-to-end across three independent artifacts** — served OpenAPI
   docs (Lane A) → `_meta.apiTags` on all 127 live tools (direct observation) → the literal in
   `wx-copilot` (Lane B′). The tag is **the build-pipeline switch that makes an endpoint agent-callable
   in production**, which is a stronger and quite different claim from "a curated tag staged ahead of
   shipping."
3. **An entire undocumented API family: `/api/go/{v1,v2}` ("Hire Go"), ≥56 operations** — absent from all
   575 documented endpoints *and* all 766 app-own paths. The run had previously seen "Hire Go" only as a
   `/hire-go-redirect` nav stub.
4. **21 hand-authored agent-composite tools** with a contractual `uiMeta.label` requirement ("a
   user-facing one-sentence non-technical summary of what you're doing with this tool call and why") —
   evidence of a deliberate agent-tool *product* layer, not generated REST wrappers.
5. **W9: `openapi-verbatim` is retrievable across the whole `service*` family** (5 families sampled, 5/5
   carry a complete OpenAPI 3.0.3 fragment; 7 of 12 families now confirmed) — recorded as a **method
   ceiling**, not a grade upgrade, because only ~29 of 593 pages have been fetched.
6. **The fleet is ≥19 microservices, not 12** — seven client-only families the docs never name, including
   a 27-path **`serviceauthorization`** RBAC service and a 26-path **`serviceintegrations`** ETL/SCIM
   service. Four of the seven are *products*, not plumbing (Support, Communicate, Integrations,
   Segmentation).
7. **A self-caught input error.** `raw/wx-micro-frontends.md` §2e claimed "eight of these fourteen service
   names do not appear in the prior docs/api capture" — **four of the eight do**. Corrected in place with
   a dated note; the corrected set (seven client-only families) is what the rollups carry.

**Boundary held, again:** every iteration-2 action was read-only, unauthenticated and zero-cost — 2 MCP
handshakes + 1 `tools/list` per server, 5 docs GETs, 1 CT query, ~30 DNS lookups. **No tool was invoked
on either MCP server, no argument was ever supplied, no SQL executed, no data read.** A resolving
`data-mcp-staging-*` host was found and **deliberately not probed**. Nothing touched the Pass-2 / cost /
state-change / credential gate.

---

## Behavioral defects found (stage A)

Every checklist category is recorded, including the clean ones.

> **Status legend (updated through iteration 3).** Rows below are the **iteration-1** inspection,
> annotated with what iterations 2 and 3 did. **✅ RETIRED** = fixed in the shipped run and no longer
> charged. Rows still marked ⬜ are present and still charged. Four **new** defects were found *and fixed
> within* the round that found them (N1, N2 in iteration 2; N3, N4 in iteration 3) — per the checklist
> they are recorded but **not charged**, because they are not present in the run as shipped.
>
> | Defect | Sev | Status after iteration 3 |
> | --- | --- | --- |
> | **E1** incomplete propagation | med | ✅ **RETIRED** — 466 paths / ≥19 microservices / the 7 undocumented families / the live-vs-documented per-family divergences are now in all four rollups, the README, `ux-flows`, `information-architecture` and `feature-coverage`; `data-model` OQ #8 struck as completed |
> | **E4** four surviving sibling contradictions | med | ✅ **RETIRED** — all four reconciled (see below), plus the `#6`/`#8` stale cross-reference |
> | **E5** false comparative (81 > 108) | med | ✅ **RETIRED** — fixed in **three** places by iteration 2 (a third instance was found in `competitive-positioning.md`'s market-frame table that the iteration-1 inspection had missed) and a **fourth** by iteration 3 (defect N3 — it had survived on the synonym *"exceeds"*) |
> | **I2** Mode-5 correction not back-annotated | med | ✅ **RETIRED** — `superseded_by:` banners on both `dimensions/api/_summary.md` and `raw/tool-catalog.md`, each preserving the original negative *at its correct artifact scope* rather than deleting it |
> | **E9** Communicate reversal not propagated | low | ✅ **RETIRED** — `servicecommunicate` / `/communicate/campaigns` now appear in `product-features.md` (with the reversal stated explicitly) and `competitive-positioning.md` |
> | **E2** Cue over-promotion | med | ✅ **RETIRED (it. 3, W2)** — split into *declared configuration* (fact, single-lane, not band-promoted) vs *"runs on Claude"* (tentative), across 8 files / ~21 sites |
> | **E3** HRIS over-promotion | med | ✅ **RETIRED (it. 3, W3)** — the corroborated vendor subset stays fact; the ADP/Workday/UKG/SAP subset is flagged + tentative in both places, matching `data-model`'s posture; "certified" struck |
> | **E6** tag decay + unanchored bullets | med | ✅ **RETIRED (it. 3, W3)** — both unanchored load-bearing bullets now carry three-lane anchors; 6 decayed tags restored to `path · method · confidence` |
> | **E7** declared material under an "observed" heading | low | ✅ **RETIRED (it. 3)** — column retitled "The **evidenced** Fountain", with a boxed note naming the only two genuine direct observations in the table |
> | **E8** soft over-promotion family | low | ✅ **RETIRED (it. 3)** — all three: the entity-hierarchy row `high`→`medium-high` with the reason; two single-lane Stack rows restated as "well-evidenced, single-lane · medium"; the mis-tagged package gate re-tagged `crawl-clip · medium-high` |
> | **C1** stale scorecard denominator | low | ✅ **RETIRED (it. 3, W7)** — recomputed `14÷14` → **`4÷20`**; the proposal's own `14÷19` estimate was **also** wrong and is restated |
> | **C2** stale banner numbers | low | ✅ **RETIRED (it. 3, W7)** — the iter-0 `48`/`25` figures are boxed as historical, frontmatter named authoritative |
> | **D1 / D2 / D3 / X1** | low | ⬜ **still present — harness-routed, NOT within-run fixable.** D1 (axis graded `high` on an inherited batch default), D2 (browser capability probed at Mode 4, not Mode 1), D3 (the source-map probe was a parenthetical) and X1 (§8 checkpoint not taken under pre-authorized autonomy) are all facts about *how the run was conducted*; no edit to the corpus retires them. Σ contribution: 4. |
> | **I1** artifact-scoped negative asserted at product scope | med | ⬜ **still present as a historical-behaviour record.** Its *within-run* half was closed in it. 1 (both negatives overturned) and it. 2 (supersession banners), so the shipped corpus no longer states the refuted claim — but the Ingestion behaviour happened, and it is the evidence behind **H1**. Σ contribution: 2. |

> **Convergence test (self-correction.md §C stop condition 1).** `within = defects.where(within-run AND
> read-only/no-cost)` is now **empty**: every Evaluation defect (E1–E9) and every Cartography defect
> (C1, C2) is retired, and the five that remain are harness-routed or historical-behaviour records that
> **no within-run action can retire**. The loop therefore stops on **converged**, not on cap — and not
> because it ran out of appetite. Σ = **6**.

### New in iteration 2 (found AND fixed this round — recorded, not charged)

| # | Mode | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- | --- |
| N1 | Ingestion | **A derived count in a `raw/` artifact was simply wrong, and was on its way into the rollups.** `raw/wx-micro-frontends.md` §2e asserted "**eight** of these fourteen service names do not appear anywhere in this run's prior docs/api capture" and listed `serviceemployment`, `servicemedia`, `servicestaff`, `serviceworkforce` among them — **all four are in the documented 12.** The correct count is **seven** client-only families (six from `wx-copilot` + `servicesupport` from `wx-navbar`). Caught only because propagating the finding forced a set-difference against the Spine-2 table. **Fixed in place with a dated correction note; the rollups carry the corrected set.** | med | `raw/wx-micro-frontends.md` §2e | within-run (**DONE**) |
| N2 | Self-correction | **Mode 5's own scoring arithmetic was wrong, in the direction that hid a regression.** The iteration-1 axis-4 cell computed `+2 −2 −2` and reported "net flat", leaving axis 4 at 9.0 when it should have been 7.0 — so the recorded total was 64.0 instead of 62.0, and a −2.4 round was recorded as a −0.4 one. **Restated in the ledger.** Nothing in the stage-A checklist asks Mode 5 to verify its own prior measurement. | med | this file, iteration-1 axis-4 cell | **both** (within-run: DONE; harness: → **H11**) |

*(A third item is worth noting as a **near-miss, not a defect**: the iteration-0 MCP probe convention was
`<host>/mcp`. `mcp.fountain.com` mounts its MCP server at the **root** — so even with the correct host,
the original probe would have 404'd. This is method knowledge, folded into H12 below rather than charged
as a defect, since no rule told the collector otherwise.)*

---

### The four sibling contradictions — how each was resolved (W4 detail)

| # | Contradiction | Resolved to | Why that side won |
| --- | --- | --- | --- |
| a | **SOC 2** — `product-features` #4 "unverified, two lanes agree the pages are certification-free" vs `competitive-positioning` #2 "most likely a badge-image clipping gap" | **`product-features`' formulation**, copied into `competitive-positioning` #2 | The clipping-gap read is *speculation with no supporting evidence*, while the other side carries **two independent lanes** (`website` crawl + `infra`'s independent fetch of `/security` and `/ethical-ai`). It was also **internally inconsistent**: `competitive-positioning` row 3 explicitly *rejects* the identical crawl-gap explanation for ISO-42001 two rows later, on the grounds that the pages were fully readable. |
| b | **`servicepulse` "no UI surface"** — three states across `data-model` (resolved-as-coverage-artifact), `product-features` (left open) and `information-architecture` (located at `/pulse` D0) | **Located at `/pulse` D0 in the Worker-Experience application; the recruiter-console miner never reached it** — one wording, now in all three docs | Direct observation outranks inference (`evaluation.md` tiebreaker). The `wx-navbar` catalog *positively locates* `Pulse` `/pulse` (children Dashboard/Checks/Settings) **and** `Referrals` `/referral`. This also upgraded `information-architecture`'s "four marketed modules with zero routes" section: reading (a) (they live in the second application) is now **the answer**, and reading (b) (back-office/API-only) is **refuted** — all four modules have D0 destinations. |
| c | **Emma ↔ Intercom Fin** — `product-features` "weakly supported at most" vs `technology-architecture` OQ3 "materially open" | **"Weakly supported at most"** — `technology-architecture` reconciled down | Checked against the actual evidence in `docs/raw/help-center.md`: Fin is confirmed **on the worker help center** — Fountain's own support surface — and the file itself records the Emma link as an open question, not a finding. Against it sit **two independent lanes** (the 29-path first-party chatbot admin stack + the `euw3-ms-nlu` in-house NLU host). The residual open question is narrowed to **branding**, not architecture. |
| d | **"No SDK exists"** stated on three bases (593-page index / full `llms.txt` / "~185–200 titles") | **The `packages` dimension's direct-registry sweep** — 23 npm + 14 PyPI = 37 direct GETs, `registry-metadata` · high — named as the **primary** basis in all four rollups, with the docs grep demoted to explicitly non-independent corroboration | The registry sweep is the only lane that can actually establish the absence; the docs grep can only fail to find a mention. The three "different bases" were never three findings — they were three descriptions of **one index read twice** (a range over one artifact, per the same-artifact rule), which is now stated that way in every doc. |

---

### The 81-vs-108 arithmetic error (E5 detail)

Three instances, not two. All three asserted some form of *"`serviceattendance` alone (81 endpoints) is
**larger than** the entire legacy ATS API (108)"* — **81 < 108.** The claim was load-bearing: it anchored
`competitive-positioning`'s headline *"competing with 'Fountain the ATS' is a category error."*

| Doc | Was | Now |
| --- | --- | --- |
| `product-features.md` (What it does) | "the WFM/attendance service alone (81 endpoints) is larger than the entire legacy ATS API (108)" | "the legacy Hire ATS accounts for only **108**, while the twelve post-hire WX services account for **~467**; a single one of them is **81 endpoints, three-quarters the size of the entire ATS API on its own**" |
| `competitive-positioning.md` (real moat #1) | "`serviceattendance` alone has 81 endpoints — larger than the entire 108-endpoint legacy Hire ATS surface" | same corrected framing, **plus** the ≥19-family finding |
| `competitive-positioning.md` (market-frame table) — *missed by the iteration-1 inspection* | "81-endpoint attendance/scheduling service + a pulse-survey product — **bigger than its own ATS surface**" | "the post-hire WX fleet is **~467 documented endpoints vs the ATS's 108 — over 4× its own ATS surface**" |

**The correction strengthens the conclusion it was propping up.** The real ratio is **108 : 467** — the
ATS is under a quarter of the documented platform — which supports "category error" far better than the
false comparison did. `technology-architecture.md` L140 had the honest version all along ("108 → but
spread across the whole ATS domain"); it is now aligned with the others.

### Discovery

| # | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- |
| D1 | **Axis graded `confidence: high` on an inherited batch default, not a per-target probe.** `auth: {value: none, confidence: high, evidence: "Batch-wide default… applies by inherited default, not a fresh per-target confirmation"}`. The checklist warns about this for a *claimed login*; the same logic binds the negative. The evidence line is candidly self-labelling, which mitigates. | low | `00-recon-plan.md` L8 | harness |
| D2 | **Browser/tool capability was never probed at Mode 1.** A tool-availability check is free at Discovery and would have set correct Cartography expectations in the plan. Instead `00-recon-plan.md` records `session: ❌ absent` for `auth:none` reasons **only**, and the strictly-worse blocker surfaced at Mode 4. | low | `00-recon-plan.md` L30 vs `evaluation/information-architecture.md` L15 | harness |
| D3 | **The run's strongest lane was a parenthetical.** "check for `sourceMappingURL` before assuming no source maps" was one clause; it produced 1,757 first-party files and the only `high`-confidence dimension in the run. | low | `00-recon-plan.md` L31; README lesson 3 | harness |
| — | Method graded from a label, not an artifact | **none** | Discovery pre-graded `api` as `docs-reconstructed` *because* guessed spec paths 404'd, and instructed the collector to "grade the method from what's actually retrieved, not the label" (`00-recon-plan.md` L27). Exemplary. | — |
| — | Predicted-available dimension came back blocked | **none** | All 7 predicted-available returned `complete`. `packages` was predicted ⚠️ partial and **over**-delivered at `complete`/100%. | — |
| — | Sibling-declared count treated as a ceiling | **none** | Treated as a floor throughout — `api` expanded past `llms.txt`, and the bundle mine exceeded its own iteration-0 count in iteration 1. | — |
| — | Scope verdict wrong | **none** | Gate C was the close call (5 products + 3 agents + Cue reads as N≥4) and the run applied the Stripe-precedent guard with explicit reasoning. Downstream evidence validates it: one contract, no per-product pricing/docs trees. The later "at least two applications" finding is an *architecture* split, not a *suite* split — verdict stands. | — |

### Ingestion

| # | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- |
| I1 | **An artifact-scoped negative asserted at product scope, against an artifact the run knew about and did not fetch.** Two instances, both overturned in iteration 1 by one `curl` each: `api`'s "**no live MCP server exists**" (true of the 6 guessed paths on 3 hosts) and `deployed-client-bundle`'s "no `anthropic`/`claude`/`bedrock` literal exists" (true of the 1,757 reassembled `recruiter_ui` files). **Judged fairly: this is a genuine Ingestion miss, not an unknowable.** The bundle dimension's own `env-config.md` names `REACT_APP_WX_COPILOT_URL` → `ftn-shared-components.fountain.com/wx-copilot/…` — it recorded the artifact, identified it as a separately-deployed micro-frontend, did not fetch it, then asserted a grep-negative scoped to what it did fetch. Both collectors ran correct §7-rule-10 control probes; **the defect is in the scoping of the write-up and the un-fetched sibling artifact, not in collector rigour.** | med | `dimensions/api/raw/tool-catalog.md` L5 · `dimensions/deployed-client-bundle/raw/env-config.md` L21-22 · corrected in `raw/wx-micro-frontends.md` §2c–2d | **both** (within-run: DONE iter 1) |
| I2 | **A Mode-5 correction was not back-annotated onto the originating dimension.** `dimensions/api/_summary.md` still reads "**no live server**… No MCP server is live" and `raw/tool-catalog.md` "**No live MCP server was found**" — with no `superseded-by:` pointer. A reader entering the corpus via the dimension gets the wrong answer. | med | `dimensions/api/_summary.md` L151-153 | **both** |
| — | Redaction miss | **none** | **Verified clean.** A full sweep for JWT / Stripe / OpenAI / Slack / AWS / GitHub / Google key shapes and long-base64 across every file in the corpus returns **zero hits**. `env-config.md` is field-names-only with an explicit redaction log and an over-redact-by-default rationale. | — |
| — | Method ≠ planned | **none** | Both deviations were **upgrades** with recorded reasons: planned `bundle-string-mine` → actual `source-map-reassembly`; `api` graded exactly as pre-graded, with 41 rows lifted to `openapi-verbatim`. | — |
| — | Missing contract artifact | **none** | All required `raw/` files present per dimension; `folded`/`absent` dimensions correctly carry only a `_summary.md`. | — |
| — | Low completeness with no recorded gap | **none** | Every `completeness_pct` carries structured gaps — including `deployed-client-bundle` self-reporting **78%** while being the strongest lane, and `api` at 85% disclosing "534 of 575 pages not individually verified". | — |
| — | Blocked-where-predicted and not recovered | **none** | Two genuine second-method recoveries: crt.sh 502×3 → CertSpotter (144 hosts, a *fuller* result); JS-gated Vanta/Transcend pages → vendor names recovered from their **CSP headers**. | — |
| — | **Seam forked** | **none** | **Exemplary.** Exactly one `## source: bundle` section in each of `_shared/{api-path-catalog.md, feature-flags.md}`; both seeded with the correct header before fan-out. `api` was *told* to append, **declined** on §6's contributor allowlist (published surfaces are not on it), flagged the deviation — and Evaluation reviewed and **upheld** it. The allowlist held: no `session`/`wire`/`distribution`/`infra` section exists anywhere. | — |
| — | Same artifact double-mined read as corroboration | **none** | An explicit **A–F source-independence lane map** was decided once and applied in all four rollups; `docs`+`api`+`website` are treated as ONE lane throughout. | — |
| — | Silent absence | **none** | 3 absent + 1 folded, each materialized as its own `_summary.md` and each surfaced in the README dimension table. | — |
| — | Went silent / looked hung | **not assessable** | No evidence either way in the artifacts. Recorded per the "never skip a category silently" rule. | — |
| — | Budget discipline | **note, not a defect** | ~26.7 MB fetched against a nominal ~5 MB bundle budget, **declared with justification** in the gaps block both times. Honest over-spend on the single highest-value artifact class on the target. | — |

### Evaluation

| # | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- |
| E1 | **Iteration-1 propagation incomplete — the API-surface half of the same mine reached no rollup.** `_shared/api-path-catalog.md` L513 records "**466 unique paths after de-dup** … spanning **15 distinct microservices**". All four rollups still quote "**300 paths / 358 method+path pairs**" as the app-own surface — an undercount of *the same physical file they cite*. Six live families (`serviceauthorization` 27, `serviceintegrations` 26, `servicesupport` 18, `servicemessaging` 5, `servicescheduler` 3, `servicesegmentation` 3, `servicecommunicate` 3) appear in **none** of them, so `data-model`'s "Spine 2 — 12 microservices" table is now materially incomplete. Live-vs-documented divergences (`serviceorganizations` 60→**121**, `servicesecurity` 16→**113**, `servicepool` 28→**50**, `servicetodo` 57→**12**) are unrecorded. And `data-model-api-surface.md` **open question #8 still lists "mine the WX client bundle" as an open action iteration 1 already performed.** | **med** | `_shared/api-path-catalog.md` L505-515 vs `evaluation/data-model-api-surface.md` L418-425, L547, L706-708 | within-run |
| E2 | **NEW over-promotion (introduced by iteration 1): Cue "runs on Claude via Bedrock" promoted to fact on a lane the same document disqualifies.** `technology-architecture.md` L338-340 states the apex `anthropic-domain-verification` TXT is "on its own, **ambiguous**, because it sits in a block of internal-tooling SaaS verifications alongside Cursor, Linear, Notion, Miro, 1Password, Atlassian and Rippling" — then L349-352 uses that same record as the second independent lane for the promotion. A TXT record corroborates "Fountain has an Anthropic account", not "Cue's inference runs on Claude". Compounded: the mined schema's **default is `openai`**. `competitive-positioning.md` #1 pushes it furthest ("⇒ fact: Cue runs on Claude via AWS Bedrock"); `technology-architecture.md` is the only doc that draws the line correctly ("a **declared configuration** read from production client code, not an observed inference call"). | **med** | `evaluation/technology-architecture.md` L338-352 · `competitive-positioning.md` #1 | within-run |
| E3 | **Over-promotion: the HRIS/ADP/Workday/UKG/SAP integration claim.** `data-model-api-surface.md` L262-273 flags it as a conflict and renders the marketing side **tentative** ("Flagged, not averaged"). `competitive-positioning.md` L252-268 promotes the same claim to **fact** on "marketing + client source + status page, three independent lanes" — but those lanes cover VONQ/Cronofy/HelloSign/Checkr/Twilio, **not the disputed ADP/Workday/UKG/SAP subset**. It is then re-asserted unhedged and **unanchored** at L473-479. | **med** | `competitive-positioning.md` L252-268, L473-479 vs `data-model-api-surface.md` L262-273 | within-run |
| E4 | **Sibling contradictions surviving two reconciliation passes** (consolidated). (a) **SOC 2** resolved two opposite ways — `product-features` #4 "unverified, two lanes agree the pages are certification-free"; `competitive-positioning` #2 "most likely a badge-image clipping gap", and that same doc *rejects* the identical crawl-gap explanation two rows later for ISO-42001. (b) **`servicepulse` "no UI surface"** in three states: resolved-as-coverage-artifact / left-open / located at `/pulse` D0. (c) **Emma-as-Intercom-Fin** at two confidences — downgraded to "weakly supported at most" in `product-features`, still live and "materially open" in `technology-architecture` OQ3. (d) The **"no SDK" evidentiary basis** stated three ways (593-page index / full `llms.txt` / "~185–200 titles"). (e) A **stale internal cross-reference** — `product-features.md` L95 cites "conflict #6" where its own table numbers it #8. | **med** | see each anchor above | within-run |
| E5 | **A false comparative repeated across siblings, load-bearing.** "`serviceattendance` alone (**81** endpoints) is **larger than** the entire legacy ATS API (**108**)" — `product-features.md` L18 and `competitive-positioning.md` L152-153. 81 < 108. `technology-architecture.md` L140 alone adds the saving parenthetical ("108 → but spread across the whole ATS domain"). It anchors competitive's headline "competing with 'Fountain the ATS' is a category error." **Worse post-iteration-1:** the live client shows `serviceworkforce` at **57**, not 81 — the corpus's most-repeated quantitative claim rests on a documented count the live artifact contradicts, and that mismatch is recorded only in `feature-coverage.md` row 6. | **med** | `product-features.md` L18 · `competitive-positioning.md` L152 | within-run |
| E6 | **Provenance-tag decay + unanchored load-bearing claims** in `competitive-positioning.md`'s final ~25% ("What Nurix should take from this") — tags degrade to dimension-name-plus-verdict with method/confidence dropped, and **two load-bearing bullets carry no anchor at all** ("Deep, certified enterprise integrations…" L473-479; "The per-tenant isolated-deployment capability itself" L489-492). This is the section a decision-maker reads first. | **med** | `competitive-positioning.md` L440-513 | within-run |
| E7 | **Presentation: declared material tabulated under an "observed" heading.** `competitive-positioning.md` L402-405 titles a column "**The observed Fountain**" and files inside it "575 documented endpoints", "Vector job matching", the OCR pipeline and "Cue running on Claude" — all `docs-reconstructed`/`crawl-clip`/`bundle-string-mine`, none observed, on a run whose own header states only one live response exists. | low | `competitive-positioning.md` L402-405 | within-run |
| E8 | **Soft over-promotion family.** (a) Multi-brand/multi-EIN **entity hierarchy** graded `high` on lane A (medium) + an infra lane that corroborates *tenant subdomains*, not the hierarchy. (b) Single-source-`medium` rows rendered as "**Fact**" in the Stack table (ReadMe.io-on-Render, Google Workspace — `infra · dns-ct-fingerprint · medium`, one lane). (c) A tag **mismatch**: the "Fountain Hire Package Required" gate tagged `registry-metadata · high` when it is a reading of a docs page (`crawl-clip · medium-high`). | low | `product-features.md` (tenancy row, L262-263) · `technology-architecture.md` Stack table | within-run |
| E9 | **The "Communicate" over-claim reversal never reached the two over-claim tables.** `feature-coverage.md` L233-242 REVERSES the marketing-over-claim disposition (a real, routed `/communicate/campaigns` backed by `servicecommunicate`) and explicitly asks a future Evaluation pass to propagate it. Neither `product-features.md` nor `competitive-positioning.md` mentions `servicecommunicate` or `/communicate/campaigns` — grep returns zero hits in all four rollups. Mitigated: it is a **known, recorded** handoff, not a silent miss. | low | `feature-coverage.md` L233-242 vs the two over-claim tables | within-run |
| — | Inference overrode a direct observation | **none** | Both candidate cases resolved **toward** the observation with the tiebreaker cited by name (the MCP negative vs the live probe; "Fountain runs on Render"). The mobile-app case is correctly left *flagged* — both sides are direct observations at equal method confidence. | — |
| — | Count-divergence rendered as a conflict | **none** | **Exemplary.** 593-vs-594 pages, 12-vs-13 services, 185-200-vs-593 titles all handled as **ranges**, with the same-artifact rule invoked explicitly at each site. Lesson 2 in the README even improves on the rule ("try to resolve first; range only when the artifact truly can't settle it") — and did resolve 12-vs-13. | — |
| — | Published-vs-app-own diff omitted | **none** | Present, dedicated, **both directions**, with the inverse honestly downgraded to a coverage artifact and the generated-client-substitutes-for-a-wire-tap trade named explicitly. The best-executed section in the corpus — its only flaw is E1's staleness. | — |
| — | Marketed write/execution behavior promoted to fact | **none** | The cap holds on **behavior** in all four docs — autonomy, output quality and the marketed outcome claims are explicitly withheld everywhere, and the sourcing engine is correctly capped as *recommend*-not-*execute*. The write-side cap is rendered once per doc **from the frontmatter flag** (`write_side_observed: false`), not re-derived. | — |

### Cartography

| # | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- |
| C1 | **The scorecard's own axis-2 estimate uses a denominator its own iteration superseded.** `feature-coverage.md` L341 computes `2 × (14 ÷ 14)` = full credit for the `ia_nav_complete` term, while the same document (and `information-architecture.md`'s update block) establishes **19** top-level destinations from the `wx-navbar` catalog, with `ia_nav_complete: false`. Scored against 19, the term is 1.47, not 2.0, and axis 2 is **12.3**, not the stated 13.8. | low | `feature-coverage.md` L341 vs L44-48 of `information-architecture.md` | within-run |
| C2 | **Stale iteration-0 numbers left standing inside the updated document.** `feature-coverage.md`'s banner still reads "Why `feature_location_rate` is deliberately strict (**48**, not 86)" and "those **25** rows are counted separately" after the frontmatter moved to **68** and **16**. The iteration-1 block directly below is correct, so the document carries both numbers without marking the banner historical. | low | `feature-coverage.md` L43-48 | within-run |
| — | Marketed feature not located and not dispositioned | **none** | **Exemplary — 0 un-dispositioned rows.** All 5 remaining ❌ and all 16 ⚠ carry an explicit taxonomy disposition, and 12 of the 16 share one *named finding* (the second, unmapped Worker-Experience application) rather than a shrug. | — |
| — | Located-but-not-walked not queued | **none** | All 44 located features are in the queue, with an honest note that it is blocked by a **capability** gap not by effort, **plus** a 6-item no-browser alternative action table (items 1–2 executed in iteration 1). | — |
| — | Nav destination unmapped / `ia_nav_complete:false` with no reason | **none** | Reason recorded, and *narrowed* by iteration 1 from "unconfirmed existence" to "unconfirmed per-tenant promotion". | — |
| — | Primary flow not diagrammed | **none** | 8 of 9; the 9th (realtime) is a **recorded negative** with the reason stated — "drawing a lifecycle diagram from a config key would be fabrication." | — |
| — | Buried flagship not surfaced | **none** | **Exemplary** — the AI workflow builder at **D3 inside one opening** is the headline reconciliation, with a 5-row table and a structural read ("configuration power reached uniformly through an Opening"). | — |
| — | Depth not recorded | **none** | Every surface card carries a numeric `Dn`; route-shape-derived depths are honestly marked `D0?` rather than asserted. | — |
| — | Screenshot gap unrecorded | **none** | `screenshot_coverage: 0` in the scorecard, "gap" on every surface card, a dedicated `screens/_index.md` distinguishing the **two** blockers, and a verified absence of any visual surrogate (no App Store / Play / extension / PWA). Nothing fabricated. | — |
| — | Write flow drawn as observed on `write_side_observed:false` | **none** | **Applied beyond the rule.** Every arrow in every diagram is dashed — *including the read hops* — with the solid/dashed convention explicitly suspended and the reason given ("on a zero-observation run the reads are no better evidenced than the writes"). | — |

### Cross-cutting

| # | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- |
| X1 | **The §8 capability-gap checkpoint was not taken.** `ingestion.md` §8 requires a **pause-and-confirm** when a *preferred* capability is found unavailable mid-run leaving only a materially weaker method. At Mode 4 the browser-driving MCP surface was found **absent from the session entirely** — strictly worse than `auth:none`, since it also blocked the *unauthenticated* walks (`cue.fountain.com`, the tenant career site, the public chat widget, the Intercom help center). The run proceeded on the degraded static-reconstruction method **without pausing**. **Mitigating context, and it is material:** the user had explicitly pre-authorized full autonomous operation while away from the screen and was confirmed unreachable — pausing would have stalled the run indefinitely against a standing instruction. The run also satisfied everything else §8 asks: it **named** the unavailable capability, **distinguished** it from `auth:none`, **quantified** the coverage lost (`features_walked: 0`, `screenshot_coverage: 0`), and recorded it in **four** places (README flag 2, the IA banner, the coverage banner, `screens/_index.md`). **Scored low as executed — a briefed, documented deviation, not an oversight — but it exposes a real hole in the rule: §8 defines no behavior for "checkpoint required, user pre-authorized autonomy / unreachable."** | low (as executed) | `evaluation/feature-coverage.md` L30-36 · `information-architecture.md` L10-15 · `README.md` flag 2 | **harness** (high value) |
| — | Provenance frontmatter incomplete or dishonest | **none** | **The run's strongest axis.** 11/11 complete; `session` carries both mandatory extra flags (`write_side_observed: false`, `pass2: not-applicable`); absent/folded dimensions carry semantically correct 0%/100% completeness. Self-reported completeness is *conservative*, not flattering. | — |
| — | An absent dimension not recorded as a finding | **none** | 3 absent + 1 folded, each a file, each a README row, each with the evidence that makes the absence a *verified* one (the 2009 GitHub namesake; 37 registry GETs; 4 store surfaces + a content-type control probe). | — |

**Totals (Σ severity, recounted from scratch in iteration 3 per H11):** iteration 0 — 9 defects (Σ 13) ·
iteration 1 — 13 defects (Σ 18) · iteration 2 — **Σ 16** *(restated from the recorded 14: the still-charged
set was E2 2 + E3 2 + E6 2 + E7 1 + E8 1 + C1 1 + C2 1 + D1 1 + D2 1 + D3 1 + I1 2 + X1 1)* ·
**iteration 3 — 5 defects, Σ 6** (D1 1, D2 1, D3 1, I1 2, X1 1 — every one harness-routed or a
historical-behaviour record). Two defects were found **and fixed** in iteration 3 and are therefore
**recorded but not charged**: **N3** (a fourth 81-vs-108 instance, surviving on the synonym "exceeds") and
**N4** (the nav denominator wrong in the artifact, in this proposal's estimate, and ambiguous in the
rubric). Both route to harness proposals — N3 → **H16**, N4 → **H14**.

### New in iteration 3 (found AND fixed this round — recorded, not charged)

| # | Mode | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- | --- |
| N3 | Evaluation | **A corpus-wide correction declared complete in iteration 2 had missed a fourth instance, because the verification grepped the *phrasing* rather than the *numbers*.** `competitive-positioning.md`'s "hard to replicate" bullet read *"the attendance/scheduling service alone (81 endpoints) **exceeds** the entire ATS surface (108 endpoints)"* — the same false comparative, phrased with a synonym. Replaced with the correct **108 : ~467** framing. | med | `competitive-positioning.md` §"What is genuinely hard to replicate" | **both** (within-run: DONE; harness → **H16**) |
| N4 | Self-correction / Cartography | **The nav-coverage denominator was wrong in three places at once — the artifact (`14÷14`), this proposal's estimate (`14÷19`), and the rubric itself (whose literal reading, `cards ÷ destinations`, yields >1 and therefore full credit).** The correct figure is **4 ÷ 20**. All three readings flattered the run; the literal rubric reading makes the term inert. | med | `feature-coverage.md` §Scorecard derivation · `self-correction.md` §B axis 2 | **both** (within-run: DONE via W7; harness → **H14**) |

---

## Within-run fixes applied (iteration 1) — and the delta each bought

| Fix | Cost | Score delta | Substantive delta |
| --- | --- | --- | --- |
| `curl` + string-mine `wx-navbar.umd.js` (2.06 MB) | 1 unauth GET | axis 2 **+1.3** | 12 coverage rows `⚠/❌ → ✅`; the full 19-item Frontline-OS destination catalog; the `wxServiceBaseUrl` mount mechanism behind the two-application finding; a confirmed global-search index; `platformCopilot` literally labelled "Cue" (killing the second-orchestrator ambiguity); `searchPathnameOverride:"/talent-agents/sam"` confirming Sam = Talent Agents |
| `curl` + string-mine `wx-copilot.umd.js` (6.77 MB) | 1 unauth GET | axis 2 **+0.3**, axis 4 **+2 then −2** | Cue's Claude/Bedrock model enum + multi-provider schema; the full Cue panel set; **Scheduled Tasks confirmed shipped**; the `dataMcpBaseUrl` map; 466 app-tier paths / 15 microservices (**not propagated — defect E1**) |
| Read-only MCP capability probe (`initialize` + `tools/list`, **no tool invoked**) | 1 unauth POST | folded into the above | **Corrected a false run-level negative.** `fountain-data-mcp v1.27.2`, 6 JSON-Schema'd tools over Cube.js + ClickHouse; a **third** independent lane on the Hire-vs-WX split (`FDEPLOY_RULES` / `FDEPLOY_RULES_WX`) |
| Propagation pass into 4 rollups + README + 3 Cartography docs | desk | included above | MCP and LLM-backend corrections landed cleanly and consistently in **all** four rollups, each with the same three scope caveats. **Verified: no stale copy of either survives in any rollup.** |
| Disposition reversal — "Communicate" | desk | 0 | An over-claim correctly retracted (**but not propagated — defect E9**) |

**Boundary held:** every iteration-1 action was read-only, unauthenticated and zero-cost. The MCP probe invoked **no tool** and read **no data**. Nothing touched the Pass-2 / cost / state-change / credential gate.

## Within-run fixes applied (iteration 2) — and the delta each bought

| Fix | Cost | Score delta | Substantive delta |
| --- | --- | --- | --- |
| **W1** — full API-surface propagation into 4 rollups + README + `ux-flows` + `information-architecture` + `feature-coverage` + the seam file | desk | axis 4 **+2**, axis 6 +2 | `data-model` §Spine 2 rebuilt as a **19-family** table with a docs-vs-live column and three readings of the divergence; `/api/service*` added to every "app-own surface" table (300 → **766**); the "inverse list is a coverage artifact" argument replaced by a **positively-confirmed** observation; `servicepulse`/`servicereferral` located at D0; OQ #8 struck; `information-architecture`'s "four modules with zero routes" upgraded from *two open readings* to *reading (a) confirmed, (b) refuted* |
| **W4** — four sibling contradictions + the `#6`/`#8` cross-ref + the 81-vs-108 false comparative | desk | axis 4 **+3**, axis 6 +3 | SOC 2, `servicepulse`, Emma/Fin and the SDK basis each reconciled to **one wording, in the doc that carried the weaker evidence**; the false comparative fixed in **three** places (one previously unnoticed) and replaced with the stronger **108 : 467** ratio |
| **W5** — `superseded_by:` back-annotation | desk | axis 3 **+0.2**, axis 6 +2 | `dimensions/api/{_summary.md, raw/tool-catalog.md}` now carry supersession banners that **preserve the original negative at its correct artifact scope** and point at the two live servers. Entering the corpus via the dimension no longer yields the refuted answer. |
| **W6** — Communicate reversal propagated | desk | axis 6 +1 | `servicecommunicate` / `/communicate/campaigns` now named in `product-features.md` (with the reversal stated) and `competitive-positioning.md` |
| **W8** — probe the 3 unprobed MCP hosts (`initialize` + `tools/list` **only**) | 2 unauth POSTs + ~30 DNS + 1 CT query | axis 4 **+1**, axis 5 +0.3 | **The largest finding of the run after the source maps.** `fountain-hire-mcp-server v1.0.0` at `mcp.fountain.com` — **127 tools, unauthenticated, all tagged `exposeAsMcpTool`**; `exposeAsMcpTool` traced end-to-end across three artifacts; **`/api/go/{v1,v2}` discovered** (56 tools, in no doc and no bundle); 21 hand-authored agent composites with a contractual `uiMeta.label`. `wx` + `fountain-ai` hosts **not located**, recorded artifact-scoped. |
| **W9** — fetch 5 `service*` reference pages | 5 GETs | axis 3 **+0.1**, axis 5 +0.2 | **5/5 embed a complete OpenAPI 3.0.3 fragment** (7 of 12 families now confirmed) → `docs/_summary.md` gains an honest `method_ceiling: openapi-verbatim`; `exposeAsMcpTool` absent from all five, corroborating its Hire-only scope |
| **N1** — self-caught error in the input artifact | desk | (prevented a defect) | `raw/wx-micro-frontends.md` §2e's "eight of fourteen" list corrected to the true **seven client-only families** before it propagated |
| **N2** — restated iteration 1's score | desk | (accuracy, not gain) | Axis 4 corrected 9.0 → 7.0; iteration 1's total restated 64.0 → 62.0; the ledger now reflects that iteration 1 was a marginal regression that iteration 2 repaid |

**Boundary held again:** every iteration-2 action was read-only, unauthenticated and zero-cost — 2 MCP
handshakes, 1 `tools/list` per server, 5 docs GETs, 1 CT query, ~30 DNS lookups. **No tool was invoked on
either MCP server, no argument supplied, no SQL executed, no data read.** A resolving
`data-mcp-staging-us-east-1.fountain.com` was found and **deliberately not probed**. Whether
`execute_raw_sql` or any of the 127 Hire tools *executes* unauthenticated was **deliberately not
tested** — that is a state/data action outside the read-only boundary, and it is recorded in the corpus
as a **security question, not a finding**.

## Within-run fixes applied (iteration 3) — and the delta each bought

| Fix | Cost | Score delta | Substantive delta |
| --- | --- | --- | --- |
| **W2** — split the Cue claim in two everywhere it appears | desk | axis 4 **+2**, axis 6 +2 | The corpus said **"⇒ fact: Cue runs on Claude via AWS Bedrock"** on the strength of two lanes, one of which the *same document* grades ambiguous four paragraphs earlier. Now graded as two claims: **fact** — Cue's shipped client *declares* Claude-on-Bedrock inside a multi-provider schema (single lane, a direct artifact read, **not** band-promoted); **tentative** — that production inference *runs on* Claude (schema default is `openai`; `write_side_observed: false`). Landed in `technology-architecture` (×5 sites incl. the Stack table + reconciliation #5 + OQ2), `competitive-positioning` (×4), `product-features` (×5), `data-model-api-surface` (×3), `README` (×3), `information-architecture`, `feature-coverage`. **`ux-flows.md` needed no edit** — it had the correct formulation all along ("a static configuration fact, not an observed trace"), which is itself the tell that the promotion was a rollup-level error, not an evidence-level one. |
| **W3** — HRIS over-promotion + anchor restoration | desk | axis 4 **+3**, axis 3 **+0.3**, axis 6 +4 | `competitive-positioning` promoted ADP/Workday/UKG/SAP to **fact** on "marketing + client source + status page, three independent lanes" — but those lanes cover VONQ/Cronofy/HelloSign/Checkr/Twilio, **not the disputed HRIS subset**, which `data-model` had already flagged as a conflict and rendered tentative. Now split explicitly: the corroborated vendor subset stays **fact**; the HRIS/payroll subset is **flagged, tentative**, in both the moat section and the "hard to replicate" bullet, with the word **"certified" struck** (no certification is evidenced anywhere in the run). Separately: the two **unanchored** load-bearing bullets now carry three-lane anchors, and six decayed tags across the section were restored to `path · method · confidence`. |
| **W7** — the coverage-gate recompute | desk | axis 2 **honesty (−1.1 vs the flattered figure)**, axis 5 +0.5, axis 6 +2 | **The scorecard now measures what the run actually did.** `ia_nav_complete`'s term went `2×(14÷14)` → `2×(4÷20)`: the denominator is the **20 distinct top-level products** in the `wx-navbar` catalog (21 rows; the two I-9 Center entries are one product), and only **4** have a surface card. Row **66 "Hire Go / Fountain Go"** was added — a real changelog + status-page claim the Mode-4 catalog missed, located via three lanes incl. the `/api/go/*` family — raising numerator and denominator together so `feature_location_rate` stays 68. `/api/go/*` was **deliberately not** added as a claimed feature (nobody claimed it) and went to Unmarketed depth instead, alongside the four undocumented `service*` products. The iter-0 banner numbers (`48`, `25`) are now boxed as historical. |
| **W10** — the last two bundle gaps | **2 unauth GETs** (772 KB chunk + 1.49 MB map) | axis 2 0 (no located feature), IA quality +| **Half a finding, half a confirmed wall — both worth having.** `npm.fountain.*` reassembled: **233 sources** = the in-house design system (230) + **`@fountain/universal-search`**, which installs a global `keydown` handler firing on `(metaKey‖ctrlKey) && key==="k"` — a **shipped ⌘K command palette** with a two-section (nav + people) dialog and a `universal_search:bar_open` analytics event. That **closes `information-architecture.md` Open Question #5** from a second independent artifact (iteration 1 had the search *index*; this is the *trigger*). **Zero new API paths, routes or flags** — a recorded negative that closes the `bundle-map.md` open question. The **lazy route chunks are confirmed not statically addressable**: the live shell links exactly 48 chunks, none of them a route chunk, so *what `/payments` is* stays open as a **capability** gap. |
| **E7** (opportunistic) | desk | axis 4 **+1** | `competitive-positioning`'s market-frame column was headed **"The observed Fountain"** while listing `docs-reconstructed` / `crawl-clip` / `bundle-string-mine` material on a run with one live response. Retitled **"The evidenced Fountain"**, with a boxed note naming the only two genuine direct observations in the table (the two MCP `tools/list` responses). |
| **E8** (opportunistic) | desk | axis 4 **+2** | Three soft over-promotions retired: the multi-EIN **entity hierarchy** row dropped `high (fact)` → `medium-high`, with the reason stated (infra corroborates *deployment isolation*, a different claim, so it cannot band-bump); two single-lane Stack rows (Google Workspace, ReadMe-on-Render) restated as **"well-evidenced, single-lane · medium"** instead of "Fact"; and the "Fountain Hire Package Required" gate re-tagged `crawl-clip · medium-high` — it is a reading of a docs page, and `registry-metadata · high` belongs to a different artifact entirely. |
| **N3** — a **fourth** 81-vs-108 instance, found and fixed | desk | (prevented a defect) | Iteration 2 fixed the false comparative in three places and believed it exhaustive. A fourth survived in `competitive-positioning`'s "hard to replicate" bullet: *"the attendance/scheduling service alone (81 endpoints) **exceeds** the entire ATS surface (108)"* — 81 < 108. Replaced with the correct and stronger **108 : ~467** framing. **Recorded, not charged** (fixed in the shipped run). Method note: it survived three passes because it used the verb *"exceeds"* rather than *"larger than"* — a grep for the known phrasing missed it. |
| **N4** — the nav denominator was wrong in **both** the artifact and this proposal | desk | (accuracy) | `feature-coverage.md` used `14÷14`; this proposal estimated `14÷19`; the truth is `4÷20`. **Recorded, not charged** — but it is the second consecutive iteration in which Mode 5's own measurement was the defect, which is what makes **H14** (below) worth proposing. |

**Boundary held, a third time:** iteration 3 was **desk reconciliation plus two unauthenticated GETs of a
UI vendor chunk and its source map** — no login, no browser, no state change, no cost, no tool invoked on
either MCP server, nothing that touched the Pass-2 / cost / credential gate. The fetched artifact is CSS
and React components; **no credential-shaped value was fetched, returned or written**, and a redaction
sweep of the new material returns zero hits.

---

## Within-run queue — ALL 10 RESOLVED; the loop is CONVERGED

All read-only, no login, no cost. **Iteration 2 executed W1, W4, W5, W6, W8, W9; iteration 3 executed
W2, W3, W7, W10.**

| # | Action | Cost | Closes | Est. delta | **Status** |
| --- | --- | --- | --- | --- | --- |
| **W1** | Re-run the sibling reconciliation pass over iteration 1's API-surface findings — propagate 466 paths / 15 microservices / the undocumented families / the live-vs-documented count divergences into all four rollups, **close open question #8** | desk only | **E1** | axis 4 +2, axis 6 +2 | ✅ **DONE (it. 2)** — and wider than specified: also landed in `README.md`, `ux-flows.md`, `information-architecture.md`, `feature-coverage.md`, and the shared seam file. Correct family count is **7 undocumented**, not 6 (defect N1). |
| **W2** | Fix the **Cue over-promotion** wording in the three docs to match `technology-architecture.md`'s correct formulation (declared-configuration = fact; "runs on" = tentative) | desk | **E2** | axis 4 **+2**, axis 6 +2 | ✅ **DONE (it. 3)** — landed in **8 files / ~21 sites**; `ux-flows.md` needed no edit (it had the correct formulation already). |
| **W3** | Fix the **HRIS/ADP over-promotion** in `competitive-positioning.md` to match `data-model`'s flagged-conflict posture; **anchor the two unanchored load-bearing bullets** and restore full tags across its final 25% | desk | **E3, E6** | axis 3 **+0.5**, axis 4 **+3**, axis 6 +4 | ✅ **DONE (it. 3)** — HRIS subset re-flagged in **2** places, "certified" struck, **2** unanchored bullets anchored, **6** decayed tags restored. |
| **W4** | Resolve the four surviving **sibling contradictions** + the `#6`/`#8` cross-ref; fix the **81-vs-108 false comparative** and record the live-vs-documented count mismatches | desk | **E4, E5** | axis 4 +2, axis 6 +4 | ✅ **DONE (it. 2)** — all four resolved (detail above); the false comparative was in **three** docs, not two; per-family live-vs-documented counts now tabulated in `data-model` §Spine 2 |
| **W5** | **Back-annotate** `dimensions/api/{_summary.md, raw/tool-catalog.md}` with a `superseded-by:` pointer | desk | **I2** | axis 6 +2 | ✅ **DONE (it. 2)** — banners preserve the original negative at its correct artifact scope rather than deleting it |
| **W6** | Propagate the **"Communicate"** reversal into the over-claim tables | desk | **E9** | axis 6 +1 | ✅ **DONE (it. 2)** — in `product-features.md` (explicit reversal note) and `competitive-positioning.md` |
| **W7** | Recompute `feature-coverage.md`'s scorecard against the **19**-destination denominator; mark the banner's `48`/`25` as historical | desk | **C1, C2** | axis 6 +2, axis 2 honesty | ✅ **DONE (it. 3)** — and the denominator was **19-was-also-wrong**: it is **20 distinct products** (21 catalog rows), numerator **4**, so the term is `2×0.20` = **0.40**, not 1.47. Row **66 (Hire Go)** added; `/api/go/*` correctly routed to *Unmarketed depth*, **not** the claimed catalog. Banner numbers boxed as historical. |
| **W8** | **Probe the 3 unprobed MCP hosts** read-only — `initialize` + `tools/list` only, **no tool invoked** | 3 unauth POSTs | the largest surviving scope caveat on headline finding 5a | axis 2 up to +0.6, axis 4 +1 | ✅ **DONE (it. 2) — the highest-yield action of the entire Mode-5 loop.** Found `fountain-hire-mcp-server` (127 tools) at `mcp.fountain.com`; `wx` and `fountain-ai` **not located** (16-candidate DNS sweep, all NXDOMAIN — recorded artifact-scoped). |
| **W9** | **Fetch one `service*` reference page raw** and check for an embedded OpenAPI fragment | **1 GET** | if present, 467 endpoints' method ceiling rises | axis 3 +1, axis 4 +1 | ✅ **DONE (it. 2)** — 5 pages across 5 families fetched, **5/5 carry a complete OpenAPI 3.0.3 fragment**. Recorded as a **method ceiling** (`method_ceiling: openapi-verbatim` on `docs/_summary.md`), **not** a grade upgrade — only ~29 of 593 pages are actually fetched. |
| W10 | Fetch the unfetched lazy chunks (`Payments`, `SourcingPurchaseNew`, `WorkflowEditor`) and reassemble `npm.fountain.*` (772 KB) | bounded | what `/payments` actually is; the workflow-editor sub-IA | axis 2 +0 (no located feature), IA quality + | **◑ DONE IN PART (it. 3)** — `npm.fountain.*` reassembled: **⌘K command palette found** (closes IA OQ #5), **zero** new API paths (recorded negative). Lazy route chunks **⛔ CONFIRMED UNFETCHABLE** — the live shell links exactly 48 chunks, none a route chunk; needs a renderer, so `/payments` stays open as a *capability* gap. |

**Actual post-W2/W3/W7/W10 score: 82.5 / 100 (band: solid)** — against a forecast of ~74–76. The
forecast was **low by ~7**, and for an instructive reason: it assumed axis 6 would recover "at most ~1–5"
of the credited +8 because it was floored at Σ=14. But Σ was actually **16**, and the four fixes retired
**10** severity points — which took Σ *below* the 15-point threshold and paid out the axis's **entire**
9-point balance at once. **The forecast was wrong in the direction that H9 predicts a forecast will be
wrong**: a step function is not forecastable by linear reasoning about "how much is recoverable."

**Not fixable within-run at any effort (the hard floor):** `features_walked` and `screenshot_coverage`
(need the browser capability restored), the auth-transport probe, the realtime event catalog, what
`/payments` actually is (its lazy chunk is not statically addressable — **re-verified in iteration 3**),
and the entire write side (needs a session). These are the structural cap on axis 2, and they are why
this run converges at `solid` rather than `strong`.

### Deliberately NOT done — recorded as a choice, not a silent omission

The loop is **converged** on the defect test (no within-run *defect* remains), but three cheap
*opportunities* survive it. Each was weighed and declined; none is a defect, and none would move the
score materially:

| # | Action | Cost | Why declined |
| --- | --- | --- | --- |
| W11 | Fetch **one `/api/go/*` reference page** and probe whether `developer.fountain.com` documents the Go family anywhere | 1–2 GETs | Would sharpen a finding already recorded correctly and hedged correctly (`/api/go/*` exists — direct observation; its full size and documentation status — open). No claim in the corpus depends on the answer. Left for a future run. |
| W12 | Derive the full path/method set for all 127 Hire-MCP tools from the captured `tools/list` and append it to the shared catalog | desk | **Still declined, on provenance grounds** — tool-name-derived paths are *inferred*, not read from a `url:` literal, and mixing them into a mined-path catalog would blur the seam file's `source:` semantics (ingestion §6). Declining this is the correct call, not a shortfall. |
| — | Re-fetch `main.js` (9.23 MB) + its map (8.46 MB) to find the call site that builds the navbar's `featureFlags` mount config | ~18 MB | Would answer which of the 20 nav destinations are `enabled` for this tenant — but **that does not add a surface card**, so it moves neither `ia_nav_coverage` nor `feature_location_rate`. ~18 MB re-fetched for a footnote fails the cost/benefit test the loop is supposed to apply. |

---

## Harness-change proposals (APPROVAL-GATED)

| # | Sev | Kind | Finding + anchor | Proposed fix | Target file |
| --- | --- | --- | --- | --- | --- |
| **H1** | **high** | additive | **A negative was stated at product scope when it was only ever artifact-scoped — twice, and one `curl` overturned both.** `api`: "no live MCP server exists" (true of 6 paths / 3 hosts). `bundle`: "no `anthropic`/`claude` literal exists" (true of the 1,757 reassembled files). Both collectors ran correct §7-rule-10 control probes; the failure was in *scope of assertion*. (`dimensions/api/raw/tool-catalog.md` L5 · README lesson 9) | Extend §7 rule 10 with a **negative-scoping clause**: *before promoting any absence to a run-level finding, enumerate the artifacts/hosts that were NOT searched, and phrase the claim as "absent from artifact X / hosts Y", never "absent".* Add the enumeration to the §8 completeness check. | `.claude/rules/ingestion.md` §7 rule 10 + §8 |
| **H2** | **high** | additive | **A separately-deployed client artifact named in the main bundle's own env config went unfetched, and it held the answers to two headline questions.** `REACT_APP_WX_COPILOT_URL` / `REACT_APP_WX_NAVBAR_URL` were **recorded** by `deployed-client-bundle` at iteration 0 and fetched only at Mode 5 — 2 unauth GETs that resolved the run's longest-standing open question, corrected a false negative, and added 466 paths. (`raw/env-config.md` L21-22 · README lesson 10) | Add to the `deployed-client-bundle` strategy: *when the bundle's env config or CSP names a **separately-deployed client artifact** (UMD micro-frontend, shared-components host, a second CDN origin, a distinct release channel), **fetch it before concluding anything about the subsystem it serves**.* Also add it as a first-class **Cartography input** (a nav-bar micro-frontend is the difference between derived and observed nav depth). | `.claude/rules/discovery.md` Part C §8 + `.claude/rules/cartography.md` Inputs |
| **H3** | **high** | additive | **§8's capability-gap checkpoint has no defined behavior under pre-authorized autonomy.** The browser MCP surface was found absent at Mode 4; §8 mandates pause-and-confirm; the user had explicitly pre-authorized autonomous operation and was unreachable. The run proceeded and documented it well — but it did so *outside* the rule, with no defined artifact. (defect X1) | Add a §8 **autonomous-override clause**: when a checkpoint fires and the user has pre-authorized autonomous operation (or is confirmed unreachable), the run **proceeds on the degraded method** but MUST emit a structured `capability_gap: {capability, degraded_method, coverage_lost, authorized_by}` record in **both** the affected dimension's `_summary.md` frontmatter **and** the run README — and that record is **auto-promoted to the Mode-5 stage-A defect list**. Preserves the gate's information; removes the deadlock. | `.claude/rules/ingestion.md` §8 |
| **H4** | **high** | additive | **A within-run iteration propagated its headline findings and skipped the rest of the same fetch.** Iteration 1's `wx-copilot` mine yielded 466 paths / 15 microservices; that reached **zero** of the four rollups, which still cite "300 paths" from the very file they anchor to — and one still lists a **completed** action as open question #8. This is the project's most recurring defect class **recurring inside the self-correction loop itself.** (defect E1) | Amend §C's "apply within-run fixes" step: *a within-run fix that changes a shared or cited artifact MUST be followed by a **full sibling re-reconciliation** over every document that cites that artifact — not only the documents the iteration went looking to change. Closing an open question that the fix answered is part of the fix.* | `.claude/rules/self-correction.md` §C |
| **H5** | med | additive | **A Mode-5 correction left the originating dimension stating the refuted claim, with no pointer.** `dimensions/api/{_summary.md, raw/tool-catalog.md}` still read "No live MCP server was found." (defect I2) | Require a `superseded_by:` frontmatter key (and an inline strike-through note in the affected `raw/` artifact) whenever Mode 5 or a later dimension corrects a collector finding — so entry via the dimension never yields the stale answer. | `.claude/rules/self-correction.md` §C + `.claude/rules/ingestion.md` §2 |
| **H6** | med | additive | **An access axis inherited from a batch default was graded `confidence: high`.** `auth: {value: none, confidence: high, evidence: "…by inherited default, not a fresh per-target confirmation"}` — the evidence line contradicts the band. (defect D1) | Mirror the existing `auth:claimed` rule for the negative case: *an axis whose value is inherited from a batch/project default rather than a per-target probe is graded **`confidence: medium`** until a cheap per-target probe confirms it.* | `.claude/rules/discovery.md` Part B |
| **H7** | med | additive | **Tool/browser capability was probed on first use (Mode 4), not at Discovery.** A free Mode-1 check would have set correct `session`/Cartography expectations in `00-recon-plan.md`, which recorded the `session` absence for `auth:none` reasons only. (defect D2) | Add to Discovery Step 2: *probe **capability availability** (browser-driving MCP, CDP, image tool) alongside dimension availability, and record it in `00-recon-plan.md` as a distinct row from access-vector availability.* A capability gap and an access gap are different findings and must not be collapsed. | `.claude/rules/discovery.md` Part C / Step 2 |
| **H8** | med | additive | **The source-map probe — the run's strongest lane — was a parenthetical note.** One clause in the plan produced 1,757 first-party files and the only `high`-confidence dimension. (defect D3, README lesson 3) | Promote to a first-class Discovery check: *on any `source:none` target, resolving an entry chunk's `sourceMappingURL` is a **required** Mode-1 probe, not a note; a 200 `.map` pre-grades the dimension `source-map-reassembly · high` and reclassifies the target's effective source access.* | `.claude/rules/discovery.md` Part C §8 |
| **H9** | med | **STRUCTURAL — flagged, do not auto-apply** | **Axis 6 (defect load) floors at 0 on any large corpus and stops discriminating between iterations.** A thorough stage-A inspection of a 60-file corpus produces Σ(severity) > 15 almost by construction, so the axis contributed **the same 0** to iteration 1 whether it improved or not, and dragged the total down ~15 points independent of quality. (this run: iter 0 Σ=13, iter 1 Σ=18) | Normalize axis 6 — e.g. count at most the **3 highest-severity defects per checklist category**, or scale Σ by corpus size. **Structural: changes every historical score's comparability.** Flagged for explicit decision, not applied. | `.claude/rules/self-correction.md` §B axis 6 |
| **H10** | med | **STRUCTURAL — flagged, do not auto-apply** | **The rubric under-credits a correcting iteration.** Iteration 1 corrected a false headline negative in five documents and moved `feature_location_rate` 48→68, and scored **Δ 0.0** — because the propagation debt it created was charged in the same round as the correction it made. A loop steered by this signal would conclude the iteration was worthless. | Couple to H4: *measure axis 4 **after** the mandated sibling re-reconciliation, so a fix and its propagation are scored as one unit.* Alternatively, record a `substantive_delta` line in the ledger alongside the numeric one. **Structural** (changes when measurement occurs in the loop). | `.claude/rules/self-correction.md` §B / §C |

| **H11** | med | additive | **Mode 5 does not check its own prior arithmetic, and the error hid a regression.** The iteration-1 axis-4 cell computed `+2 −2 −2` and reported "net flat", recording 64.0 where the rubric gives 62.0 — turning a −2.4 round into a −0.4 one and moving it from *outside* `TOL` to *inside* it. The stop-condition logic runs on these numbers. (defect N2) | Add to §C's loop: *before computing `score[iter]`, **re-derive `score[iter−1]` from its own per-axis deductions** and restate the ledger if they disagree. A self-correction proposal is an artifact subject to the same inspection as any other; its arithmetic is checkable and MUST be checked.* Cheap, purely additive, and it protects the only quantitative signal the loop has. | `.claude/rules/self-correction.md` §C |
| **H12** | med | additive | **A capability probe that guesses a HOST must also vary the PATH — and CT enumeration is blind under a wildcard certificate.** Two independent near-misses on one target: (a) iteration 0 probed `<host>/mcp` on three guessed hosts; the real Hire server is mounted at the **root** of `mcp.fountain.com`, so even the correct host would have 404'd on that convention. (b) A full CertSpotter sweep of `fountain.com` returns 144 names and **zero** containing `mcp`, because Fountain serves a wildcard `*.fountain.com` cert — so the CT-negative was never evidence of absence, yet the run's host-enumeration lane treated CT as its census. | Two additive clauses. **(i)** In the unauth MCP-probe recipe: *try `/mcp`, `/`, `/sse` and `/health` on every candidate host — a `409 "Only one SSE stream is allowed per session"` or an Express `Cannot POST /mcp` is a **positive** tell that an MCP server is present at a different path, not a miss.* **(ii)** In `infra-backend-fingerprint`: *when the target serves a **wildcard** certificate, record explicitly that CT enumeration is **structurally incomplete** for that zone, and treat a CT-negative on any subdomain as **no evidence**, never as absence.* | `.claude/rules/discovery.md` Part C §4 (MCP recipe) + Part C §9 (infra) |
| **H13** | med | additive | **A `raw/` artifact's own derived counts went unverified against the sibling table they contradict — and were one propagation away from entering four rollups.** `raw/wx-micro-frontends.md` §2e asserted "eight of these fourteen service names do not appear in the prior docs/api capture" and named four services that **are** in the documented 12. The error was caught only because W1 forced an explicit set-difference. (defect N1) | Add to ingestion §8's completeness check: *any **derived count or set-difference** stated in a `raw/` artifact against another dimension's inventory (an "N of these are new / absent / undocumented" claim) MUST name the comparison inventory by path and be recomputed at write time — a derived count is not an observation and does not inherit the artifact's confidence.* | `.claude/rules/ingestion.md` §8 |

| **H14** | **high** | additive | **The `ia_nav_complete` term in the rubric is under-specified, and every party computing it got a different answer — all of them flattering.** `self-correction.md` axis 2 reads `2 × (ia_nav_complete ? 1 : cards ÷ destinations)`. Read **literally** it is `31 cards ÷ 20 destinations` = 1.55 → capped at 1 → **full credit**, meaning `ia_nav_complete: false` costs nothing at all. `feature-coverage.md` computed `14 ÷ 14` = full credit; this proposal estimated `14 ÷ 19` = 0.74; the correct figure — *top-level destinations that have a surface card* ÷ *all top-level destinations* — is **4 ÷ 20 = 0.20**. Three readings, a 5× spread, and the literal one makes the term inert. (defects C1, N4 · `evaluation/feature-coverage.md` §Scorecard derivation) | Restate the term unambiguously in `cartography-coverage.md` **and** the axis-2 formula: *`ia_nav_coverage` = **the number of top-level nav destinations having ≥1 surface card**, divided by **the total number of top-level nav destinations**; both counts MUST name the artifact they were counted from, and the numerator is destinations-with-a-card, **never** total cards (a run can hold many cards for one destination).* Add it as an explicit `ia_nav_coverage:` field in the coverage scorecard so it is computed once, in the artifact, rather than re-derived by Mode 5. | `.claude/rules/cartography-coverage.md` (scorecard schema + scoring) + `.claude/rules/self-correction.md` §B axis 2 |
| **H15** | med | additive | **The claimed-feature catalog was assembled from three lanes and still missed a claim that two of them carried.** `cartography-coverage.md` says the matrix rows are "the union of website + docs + changelog feature claims". **Hire Go / "Fountain Go"** is claimed in the changelog ("Hire Go / Assist — Shared Dashboard, Unified login") **and** carries a first-class `status.fountain.com` component since 2024-09-27 — yet it was never a matrix row through Mode 4 and two Mode-5 iterations, even while `/hire-go-redirect`, `go.fountain.com`, `go_enabled` and eventually a whole `/api/go/*` API family kept surfacing elsewhere in the corpus. (added as row 66 in it. 3) | Extend the claimed-catalog assembly rule: *the union also includes **first-party operational surfaces** — the **status page's component list** and the **env-config's product base-URLs** (`*_BASE_URL` fields naming a product) — each of which names a shipped product the marketing site may not. Cross-check the assembled catalog against the IA nav-destination list and the env-config product hosts before freezing it; a destination or product host with no matrix row is a **missing claim**, not a missing feature.* | `.claude/rules/cartography-coverage.md` §"Assembling the claimed-feature catalog" |
| **H16** | low | additive | **A corpus-wide correction verified by grepping the known phrasing missed a fourth instance that used a synonym.** Iteration 2 fixed the 81-vs-108 false comparative in three places and recorded it as complete; iteration 3 found a fourth, which had survived because it read *"**exceeds** the entire ATS surface"* rather than *"larger than"*. (defect N3 · `competitive-positioning.md` §"hard to replicate") | Add to §C's propagation step: *when a within-run fix corrects a **claim**, verify the propagation by searching for the **numbers/entities** in the claim (`81`, `108`), not the **phrasing** of it — a paraphrase is the common case, and a phrase-grep reports a false all-clear.* | `.claude/rules/self-correction.md` §C |

**Cross-target note for the batch synthesis:** H1 and H4 are the two candidates most likely to be corroborated by other targets in this batch — H4's parent class ("concurrently-drafted sibling rollups need an explicit reconciliation pass") is already this project's most recurring defect, and this run is the first evidence it also fires *inside* Mode 5. H2 and H3 are, on current evidence, **single-target** findings and should be held to the ≥2-independent-targets bar before promotion.

---

## Approval gate

**Nothing above has been applied.** The **sixteen** harness-change rows (H1–H10 from iteration 1;
H11–H13 from iteration 2; **H14–H16 new in iteration 3**) are PROPOSED only. The main session applies
accepted items per-item, flips each row to APPLIED, and logs the change. **H9 and H10 are structural**
(they change how every prior and future run is scored) and are flagged for explicit decision rather than
bundled with the additive rows. **H14 is graded `high`** and is the highest-value new row: it fixes a
rubric term that, read literally, makes `ia_nav_complete: false` cost nothing — every party who computed
it on this run got a different, flattering answer.

**The within-run loop is CLOSED.** All ten queue items are resolved (**eight done, W10 done-in-part, and
W10's other half confirmed *blocked* rather than skipped**), the run has moved **64.4 → 62.0 → 66.7 →
82.5**, and `stopped_on: converged` — not `cap`. The convergence is real, not fatigue: `within =
defects.where(within-run AND read-only/no-cost)` is empty, because the only five defects left (D1, D2,
D3, I1, X1) are facts about *how the run was conducted*, which no edit to the corpus can retire. Three
cheap *opportunities* survive the loop and are recorded as an explicit choice, not a silent omission
(see §Deliberately NOT done). **The hard floor is unchanged and unreachable within-run at any effort:**
`features_walked: 0`, `screenshot_coverage: 0`, the auth transport, the realtime catalog, and the entire
write side all need a browser or a session.

**What iteration 3 says about the loop itself.** Iterations 1 and 2 found the *product*; iteration 3
found nothing new about Fountain and instead found **four over-promotions, eight missing anchors, a
fourth copy of an arithmetic error believed already fixed, and a coverage denominator that was wrong in
the artifact, wrong in the previous proposal's estimate, and ambiguous in the rubric itself.** Two of
those — N3 and N4 — were errors *in Mode 5's own prior output*. That is now the pattern across three
rounds: **the self-correction step's most reliable finding is a defect in the self-correction step**,
which is why H11 (re-derive the prior score) paid for itself immediately and why H14/H16 are proposed.
A loop that never audits its own artifacts converges on a confident wrong number.

**One thing iteration 2 changed about how to read this run.** Iterations 1 and 2 each spent two or three
unauthenticated requests and each returned a headline finding the four-mode pipeline had missed —
first the Claude/Bedrock model enum and a live MCP server, then a **second** MCP server exposing 127
agent-callable Hire tools and an entire undocumented API family. That is not a coincidence about
Fountain; it is a signal about **the pipeline's stopping rule**. Both misses trace to the same root:
*an artifact was named in a captured file and not fetched* (H2), and *a negative was asserted at a
scope wider than the artifacts searched* (H1). H1 and H2 should be read as the two most load-bearing
proposals in this document — on this target they were worth more than every desk-reconciliation fix
combined.
