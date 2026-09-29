---
target: paradox
proposed_at: 2026-08-09
status: PROPOSED # → APPLIED only after per-item approval (harness-change rows)
awaiting_approval: true
run_score: 81 # /100, the run AS SHIPPED (post-iteration-2)
vibe: solid
iterations: 2
stopped_on: converged
stopped_on_note: "No within-run defects remain after iteration 2. The dominant *blocker* (0 surfaces walked / 0 screenshots) is NOT a defect and is not iterable — the browser-driving tools were absent from the session's toolset. Proposal #5 asks for a `capability-blocked` value so this class stops having to be explained in prose."
run_mode: degraded
blockers: ["auth:none (session absent, wire-capture folded)", "browser/Chrome MCP tools ABSENT from the session toolset (capability gap, not a permission gate)"]
target_selection: agent-selected-unconfirmed # see 00-scope-verdict.md "Note on target selection"
---

# Paradox — Self-Correction (Mode 5)

> **Run context, stated once.** Paradox was **not the user's pick.** The user asked for a second
> USA-market frontline-hiring player and went off-screen before confirming; the agent selected Paradox as
> Fountain's closest head-to-head competitor. This is flagged in `00-scope-verdict.md`, `README.md`, and
> `technology-architecture.md`. It does not change the method or any finding below — but if Paradox is
> the wrong comparison, the scope verdict is the file to overrule, and nothing downstream depends on the
> choice being right, only on it being flagged. **Flagging it three times is correct behaviour, not a
> defect.**

---

## Run measurement

| # | Axis (max) | Score | Basis |
| --- | --- | --- | --- |
| 1 | **Dimensional coverage** (15) | **13.3** | 9 dimensions reachable per the access vector (`session` correctly excluded on `auth:none`; `wire-capture` correctly folded, both recorded as findings with files). 8 captured `complete`, `docs` `partial` (90%) → 15 × 8/9. **No penalty**: no dimension predicted-available came back blocked. |
| 2 | **Experiential / IA coverage** (20) | **7.1** | Cartography's own scorecard, formula re-derived and **confirmed correct**: `8×0.74 + 6×0.00 + 4×0.10 + 2×0.40 = 7.12`. Zero un-dispositioned rows → no −2 penalties. *(Scoring `screenshot_coverage_live: 0` instead of the surrogate `10` gives 6.7 — the axis is 7 either way.)* |
| 3 | **Provenance integrity** (15) | **14.6** | 11/11 `_summary.md` files carry complete, honest provenance frontmatter → 7.5. Evaluation claims are anchored + provenance-tagged at ~95% → 7.1. Deduction is for the one method mis-declaration (below), now corrected. |
| 4 | **Reconciliation correctness** (20) | **20** | **17 pre-iteration-2.** One weighting violation fired: a single-source, method-limited negative (the CT developer-subdomain claim) stated as **fact** across three rollups, with the direct-observation tiebreaker available and unapplied. Repaired in iteration 2. Otherwise the corpus is unusually disciplined — it *refuses* promotion correctly three separate times (Rasa→Bedrock, the same-CSP artifact, the same-header artifact). |
| 5 | **Calibration & safety** (15) | **14** | **No redaction miss.** `api` proactively redacted an AWS-key-shaped value out of a vendor doc example and logged it — exemplary. Basic-Auth-gated `/docs/docs/` never probed past the 401. Gaps and absences recorded to an unusually high standard. −1 for the absolute-negative-as-fact and the method label. |
| 6 | **Defect load** (15) | **12** | **1 pre-iteration-2.** Σ(severity) over the 9 stage-A defects = 14 pre-fix; 7 were repaired within-run, leaving 2 harness-only defects (Σ = 3) in the shipped run. |
| | **Total** | **81 / 100** | **solid** (70–84) |

**Vibe gestalt (one line).** An exceptionally well-provenanced, honestly-hedged **desk** teardown that
recovered a 53-operation partner API Discovery had written off — but walked zero surfaces, screenshotted
zero, observed zero wire, and never saw the thing that *is* the product (the conversation); Mode 5
repaired 7 defects, including an absence claim three documents stated as fact that one `curl` refuted.

**The single number that describes this run:** `features_walked: 0`. Everything else is desk work done
very well.

---

## Iteration ledger

| iter | score | Δ | dim | **ia** | prov | recon | calib | defects | within-run fixes applied | remaining |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 66.5 | — | 13.3 | 7.1 | 14.6 | 17 | 13.5 | 1 | (baseline as delivered by Mode 4) | 8 within-run · 3 harness |
| 1 | 66.5 | **0** | 13.3 | 7.1 | 14.6 | 17 | 13.5 | 1 | **NEGATIVE RESULT — recorded, not hidden.** Probed Cartography's two nominated cheap leads on `olivia.paradox.ai`, unauth: `GET /api/casl-ability` → **404** (served the SPA/Django catch-all — wrong path, unresolved at the time); `GET /api/menu` → **401** `{"message":"Authentication credentials were not provided.","code":"not_authenticated"}`. Confirms both leads are genuinely `auth:none`-blocked — **not** capability-gated the way Fountain's micro-frontend fetches were. This **confirms** a gap rather than closing one. | 8 within-run · 3 harness |
| 2 | **81.0** | **+14.5** | 13.3 | 7.1 | 14.6 | **20** | **14** | **12** | **7 defects repaired.** (a) Re-queried crt.sh **per-host** and refuted the corpus's absolute CT negative — `readme.paradox.ai` **is** CT-logged (certs 2026-07-12, Google Trust Services) and the `%.paradox.ai` dataset is **silently truncated at 2024-06-13**; corrected the claim in `infra`, `docs`, `product-features`, `data-model-api-surface`, `competitive-positioning`. (b) Rescoped the "mid-2024 cert-consolidation event" as substantially a query artifact. (c) Corrected `docs`' false absence ("no developer/API documentation exists at all"). (d) Corrected `distribution-artifacts`' `method: binary-extract` → `crawl-clip` (no binary was ever extracted). (e) **Live-probed 6 bundle-declared app-own `/api/*` paths** — all confirmed existing + auth-gated, with `Allow` verb sets recovered. (f) **Identified the app-own API layer as Django REST Framework**, resolving `technology-architecture.md` #3's flagged tension and half of open question #5. (g) Fixed an intra-`README` contradiction ("Mode 4 not run" vs the Cartography row three lines above). | **0 within-run** · 6 harness |

**Stop condition: converged** — no within-run defects remain, and the loop is not capped or regressing.
The axis-6 swing (+11) is the rubric's arithmetic working as designed: the defect-load axis rewards
repair, and 7 of 9 defects were repairable read-only at zero cost.

**Why the loop stopped at 2 rather than running its ≥5 budget.** Everything still open is either
(i) **blocked** — the 68-item re-walk queue and all screenshot coverage need a credential *and* a
browser, neither of which exists; or (ii) **harness-changing** — a rule edit, which is approval-gated by
construction. There is no third category left to iterate on. Iterations 3–5 would have re-measured an
unchanged corpus.

---

## Behavioral defects found (stage A)

Inspected against the full `self-correction.md` §A checklist. **Categories inspected and found clean are
recorded as such, not skipped.**

| # | Mode | Defect | Sev | Evidence anchor | Route |
| --- | --- | --- | --- | --- | --- |
| 1 | Discovery | **`api` mis-graded from a DNS/CT negative rather than a retrieved artifact.** Predicted `⚠️ partial` / `docs-reconstructed` / "likely capped low"; the collector found a served, verbatim **OpenAPI 3.1** partner spec (53 ops / 36 paths) at `readme.paradox.ai` → `openapi-verbatim` / **high**. Root cause: the dimension-probe method for `docs`/`api` is **subdomain-guess + CT-log only** and never follows the marketing site's own footer/nav/partner links. The `presence` sub-axis grade ("thin-to-absent on the developer-docs axis") is wrong for the same reason. | med | `00-recon-plan.md` row 4 vs `dimensions/api/_summary.md` | **harness** (#1) |
| 2 | Ingestion | **`docs` asserted a false absence contradicting a sibling, with no §7 rule-10 second-method re-check.** Its `gaps` read "No developer/API documentation exists at all… confirmed absence, not a crawl miss" while `api` was documenting 55 pages of the thing it declared absent. The second method was one click: the `/partners/integrations` link. | med | `dimensions/docs/_summary.md` gaps + Method | **within-run** ✅ fixed |
| 3 | Ingestion | **`infra` asserted an absolute 9-year CT negative as `fact`** — "Paradox has never stood up a developer-docs/API-spec subdomain, publicly, at any point" — refuted two ways by a cheap re-probe: `readme.paradox.ai` is a `*.paradox.ai` host **and** is CT-logged (2026-07-12). Missed because the grep pattern had no `readme\|hub\|portal\|reference` term. | med | `dimensions/infra-backend-fingerprint/_summary.md` Findings §4 + Inferences | **within-run** ✅ fixed |
| 4 | Ingestion | **`infra` over-read a truncated dataset as an architecture event.** The `%.paradox.ai` crt.sh query returns **zero** names with certs issued after 2024-06-13, which was rendered as a dated "cert-issuance strategy changed mid-2024 / Let's-Encrypt→ACM consolidation event." A per-host query proves 2026 certs exist inside that same wildcard → the cutoff is substantially a **query artifact**. (The live ACM wildcard itself is real and survives.) | low | same file, Findings §4 | **within-run** ✅ fixed |
| 5 | Ingestion | **Method mis-declared.** `distribution-artifacts` declared `method: binary-extract`, which the ingestion §3 vocabulary maps to **high** confidence — but **no binary was ever downloaded, extracted, or decompiled**; the capture is public store-listing metadata + marketing screenshots (`crawl-clip`-class). The `high` band then propagated to ~15 screenshot-derived claims. Honestly disclosed in `gaps`, so this is a label defect, not a dishonesty — and the conclusions survive on artifact strength. | low | `dimensions/distribution-artifacts/_summary.md` frontmatter vs its own gaps | **within-run** ✅ fixed **+ harness** (#4) |
| 6 | Evaluation | **A single-source, method-limited negative stated as fact in three rollups**, with the direct-observation tiebreaker available and unapplied — `api`'s live retrieval of the hub is a direct observation and outranks an inferred CT absence. | low | `product-features.md`, `data-model-api-surface.md`, `competitive-positioning.md` | **within-run** ✅ fixed |
| 7 | Evaluation | **Residual concurrent-sibling contradiction — the 8th and 9th project-wide instances.** (8th) `technology-architecture.md` states "the CT inventory is a **floor, not a ceiling** — nothing stood up after mid-2024 is visible in it at all", while two sibling rollups use the same dataset as a **complete 9-year negative rendered as fact**. Both cannot be load-bearing. (9th) `README.md` contradicts *itself* three lines apart: "Mode 4 not run… queued for Mode 5" vs a How-to-navigate row describing the three Cartography docs as produced. **The Mode-3 reconciliation pass already caught 7 of these by hand** — this class has now fired **9 times on one target**. | med | `technology-architecture.md` "How it's built" vs `product-features.md` / `data-model-api-surface.md`; `README.md` Reproduction vs How-to-navigate | **within-run** ✅ fixed **+ harness** (#3) |
| 8 | Evaluation | **"Declared-only" asserted where a cheap unauthenticated existence-probe was available** *(novel defect class)*. The app-own `/api/*` lane was recorded throughout as bundle-declared and "unconfirmable without a session", and `technology-architecture.md` #3/#5 flagged the Django-vs-DRF question as unresolvable. **Six unauthenticated read-only `curl` GETs** settled all of it: 6 paths confirmed live + auth-gated (401, not 404), two `Allow` verb sets recovered, the `/api/_auth/*` action list recovered verbatim, and the app-own layer identified as **DRF**. A `401`-vs-`404` probe is not a wire capture — but it is not nothing, and the run treated the whole lane as all-or-nothing. | med | `data-model-api-surface.md` API-path diff; `_shared/api-path-catalog.md` addendum | **within-run** ✅ fixed **+ harness** (#2) |
| 9 | Cartography | **Mode 4 proceeded on a materially weaker method after discovering a runtime capability gap, without firing the ingestion §8 pause-and-confirm checkpoint.** The Cartography agent flagged this against itself and proceeded because the user had pre-authorised autonomous operation. **Judgement: the checkpoint should have fired.** §8 exists precisely to surface *coverage loss* to the user, and a blanket autonomy grant does not obviously subsume a "here is what you are about to not get" checkpoint — a Mode-4 run with no browser is a materially different deliverable. Mitigating: it was detected, documented exhaustively, and the degraded mode was never disguised. **2nd project-wide instance** (after Fountain). | low | `evaluation/feature-coverage.md` "Handoff to Mode 5" §1; `evaluation/information-architecture.md` READ-FIRST block | **harness** (#5) |

### Checklist categories inspected and found CLEAN (recorded, not skipped)

| Category | Finding |
| --- | --- |
| **Discovery — scope verdict** | Correct. `accept`/clean; Gate C reasoning (one platform, many modules) sound and consistent with the harness's Stripe guard. The agent-selected-target caveat is flagged in three files — correct behaviour. |
| **Discovery — sibling count as ceiling** | Clean, and better than clean: the corpus repeatedly and explicitly treats the logo wall and the CT census as **floors** ("the logo wall is a floor, not a ceiling"). |
| **Ingestion — redaction** | **No miss.** Proactive redaction of an AWS-key-shaped value in a vendor doc example, logged in `_redactions`. No credential touched; the Basic-Auth-gated internal Swagger never probed past 401. |
| **Ingestion — seam forked** | Clean. Both `_shared/` files seeded once before fan-out; `bundle` and `distribution` appended `source:`-tagged sections; every collector **links** rather than duplicates. Textbook §6. |
| **Ingestion — same artifact double-mined as corroboration** | Fired 3× during drafting (the `gunicorn` header, the CSP, the Rasa artifact-types) and was **caught and corrected by hand** in the Mode-3 pass. No residual. |
| **Ingestion — silent absence** | Clean. `session` (`status: absent`) and `wire-capture` (`status: folded`, naming its fold target) both materialised as files per §1. |
| **Evaluation — over-promotion** | Clean, and notably disciplined: promotion is *refused* correctly three times, and `website`+`docs` are treated as one source for feature claims throughout. |
| **Evaluation — write-side cap** | Clean. Rendered **once**, from the frontmatter flag, exactly as `evaluation.md` requires. |
| **Evaluation — published-vs-app-own diff** | Emitted, with the missing lane honestly named rather than papered over. |
| **Evaluation — closed-feedback cap** | Applied; `external-reputation` flagged recommended-for-this-run per the conditional trigger. |
| **Cartography — all 8 checklist items** | **Clean on every one.** 24/24 claimed-but-not-located rows dispositioned (0 undispositioned); the re-walk queue is built and prioritised; `ia_nav_complete: false` carries a *recorded reason* (nav is server-driven per tenant via `/api/menu`); 10/10 identified flows diagrammed; 5 buried flagships surfaced; every surface card carries a numeric `Dn`; the screenshot gap is recorded **twice**, with a live-vs-surrogate split. Diagram rule 6 is applied **maximally** — every arrow in all 10 diagrams is dashed. This is the strongest Cartography output in the batch despite being the most blocked. |
| **Cross-cutting — absent dimension as finding** | Clean, both. |

### Positive pattern worth recording (explicitly NOT a defect)

**`codebase` self-corrected Discovery before a sibling had to.** `00-recon-plan.md` framed `scim2-models`
as "a published PyPI package… meaning Paradox does enterprise identity/user-provisioning via SCIM."
`codebase/_summary.md` §4 corrected this **in its own capture** ("the `scim2-models` package that resolves
live on PyPI is the **upstream** `python-scim` project's own publish… corrected from the recon-plan's
slightly imprecise framing") — **before `packages` ran**. `packages` then reached the identical correction
independently, via PyPI `author`/`project_urls` metadata rather than git fork lineage.

This is the **inverse** of defect class #7: two dimensions converging on a correction of Discovery through
different artifacts is the designed behaviour, and it is what makes the corrected claim *fact* rather than
a coin-flip between two summaries. It is worth naming because the `verify:may-be-stale` seeding discipline
is what produced it — the hypothesis was seeded **tagged**, so the collector re-derived instead of echoing.
**Two of three Discovery hypotheses were refuted this way.** No harness change requested; this one works.

---

## Within-run fixes applied (iteration 2)

All read-only, zero-cost, no credential, no state change — inside the auto-loop boundary.

| # | Fix | Files touched | What it bought |
| --- | --- | --- | --- |
| 1 | Per-host crt.sh re-query refuting the absolute CT negative; claim rescoped to the narrow form the evidence supports | `infra/_summary.md` (Findings §4, Inferences, new `gaps` entry) | recon +3, calib +0.5 |
| 2 | "Mid-2024 cert-consolidation event" rescoped as substantially a query artifact; the live ACM wildcard retained as observed | `infra/_summary.md`, `technology-architecture.md` "How it's built" | calibration honesty |
| 3 | `docs`' false absence corrected in `gaps` **and** in the Method prose, with a READ-FIRST correction block | `docs/_summary.md` | removes a flatly wrong "confirmed absence" a downstream reader would trust |
| 4 | The CT claim corrected in all three rollups that echoed it as fact | `product-features.md`, `data-model-api-surface.md`, `competitive-positioning.md` (×2) | closes contradiction instance #8 |
| 5 | `method: binary-extract` → `crawl-clip` + a `method_note` explaining why confidence stays `high` on a *narrower* basis (artifact strength, not method mapping) | `distribution-artifacts/_summary.md` | provenance honesty |
| 6 | **Live-probe verification addendum**: 6 app-own paths confirmed existing + auth-gated; `Allow` verb sets for `/api/menu` and `/api/company`; the full Nuxt-auth action list recovered verbatim; `/api/casl-ability` confirmed unregistered unauthenticated | `_shared/api-path-catalog.md`, `deployed-client-bundle/_summary.md`, `data-model-api-surface.md` | upgrades the app-own lane from *declared* to *existence/auth/verb observed* |
| 7 | **DRF identification** resolving `technology-architecture.md` #3 and half of open question #5 | `technology-architecture.md` ×2, `data-model-api-surface.md` | converts a flagged unresolved tension into a fact, with a third independent confirmation of the published-vs-app-own split |
| 8 | Intra-`README` contradiction fixed ("Mode 4 not run" → "Mode 4 run in its degraded, static-only form"); Lesson #1 extended to name the `docs` and `infra` misses | `README.md` ×4 | closes contradiction instance #9 |

**What iteration 2 did NOT attempt, and why.** The `/api/casl-ability` prefix hunt (iteration 1's open
lead) was retried across six candidate prefixes and is now **characterized rather than resolved**: the
Nuxt-auth handler enumerates its own supported actions and `casl-ability` is not among them, and the
legacy Django router does not register it unauthenticated. It requires auth. Separately,
`readme.paradox.ai` was probed for a **consolidated** OpenAPI document (which would raise `api`'s
`completeness_pct` above 75) — all candidate paths 404'd and the host began returning **429**, so probing
stopped there. Rate-limit respected per §7 rule 8; recorded as a bounded negative, not a gap.

---

## Harness-change proposals — **APPROVAL-GATED**

Nothing below is applied. Promote only what a *next, different* target would also hit.

| # | Sev | Kind | Finding + anchor | Proposed fix | Target file |
| --- | --- | --- | --- | --- | --- |
| **1** | **high** | **additive** | **Off-domain doc portals are invisible to the whole current probe method.** Discovery graded `api` `⚠️ partial / docs-reconstructed / "likely capped low"` and `docs` asserted "no developer/API documentation exists at all" — both from **subdomain-guessing + a CT-log grep**, the only two probes the method has. The real hub was at `readme.paradox.ai`, a **ReadMe.io CNAME reachable only via one unlabelled on-page link from `/partners/integrations`**, serving **53 verbatim OpenAPI 3.1 operations**. Mode 5 further showed the CT lane could not have saved it: the `%.paradox.ai` dataset is truncated at 2024-06-13 and the grep pattern lacked a `readme` term. **This is a method gap, not bad luck** — every SaaS using ReadMe.io / Mintlify / GitBook / Redocly / Stoplight on a vendor CNAME is invisible the same way, and vendor-hosted docs are now the *majority* pattern. Anchors: `00-recon-plan.md` row 4 · `dimensions/docs/_summary.md` gaps · `dimensions/api/_summary.md` Method · `README.md` Lesson #1. | Add to the `docs`/`api` detection steps: **before grading a developer surface `partial`/`absent`, fetch the marketing homepage + `/partners*` + `/integrations*` + the **footer** and follow any outbound link whose text or href matches `api\|developer\|docs\|reference\|readme\|mintlify\|gitbook\|redocly\|stoplight`.** State the rule as: **a DNS/CT negative is evidence about *hostnames*, never about *documentation* — an off-domain portal is the default modern case, not the exception.** Pair it with an explicit note that a CT sweep's coverage window must be reported and must never carry an absence claim beyond it. | `.claude/rules/discovery.md` **Part C** (dimensions 2 `docs` + 4 `api`), and the Part-A Gate-E reachability probe list |
| **2** | med | additive | **A `401`-vs-`404` unauthenticated probe is free evidence the harness never asks for.** This run recorded the entire app-own `/api/*` lane as "declared-only, unconfirmable without a session" and left the Django-vs-DRF question flagged unresolved. Six unauthenticated `curl` GETs then established **path existence, the auth model, the `Allow` verb set, and the framework identity** (DRF, from its `not_authenticated` code + `APIView` `Allow`/`OPTIONS` defaults), and recovered a Nuxt-auth handler's own enumerated action list from a 400 body. None of it required a credential or changed state. Anchor: `_shared/api-path-catalog.md` "Mode-5 live-probe verification addendum". | Add a **cheap existence-verification step** to `deployed-client-bundle`: after string-mining the API-path catalog, **probe each declared same-origin path unauthenticated and record the status class** — `401`/`403` = handler exists + auth-gated (promote from *declared* to *existence-observed*), `404`/HTML catch-all = not registered unauthenticated, `200` = an unauth surface worth mining. Capture `Allow` headers and any structured error body (they frequently self-name the framework). Add a matching line to the tradecraft envelope-fingerprint table: **DRF tell = `{"detail"\|"message", "code":"not_authenticated"}` + an `APIView` `Allow` header + a 401 on `OPTIONS`.** State the boundary explicitly: this yields existence/auth/verbs, **never payloads** — it does not substitute for a session. | `.claude/rules/discovery.md` Part C #8 (`deployed-client-bundle`) + `.claude/rules/tradecraft.md` §2.3 (API-envelope fingerprint table) |
| **3** | med | additive | **Concurrent sibling rollups drift on shared weighting decisions — now 9 instances on this one target.** The Mode-3 reconciliation pass caught 7 by hand (the Rasa→Bedrock over-promotion appearing 3×, a stale "seven products" count, a locale conflict resolved two different ways, …). Mode 5 found **2 more**: the CT negative used as a complete 9-year fact in two rollups while a third correctly called the same dataset "a floor, not a ceiling"; and `README.md` contradicting itself three lines apart on whether Mode 4 ran. Every instance has the same root: **each concurrently-drafted document re-derives the shared weighting decisions from scratch.** The run's own `README.md` Lesson #3 proposes this fix independently. | Before the rollup fan-out, have the main session write a short **`evaluation/_shared/weighting-ledger.md`** and pass it to every drafting sub-agent as a required input: the **one-artifact list** (artifacts two dimensions both read — headers, CSPs, bundles — which are one source and earn no band-bump), the **claims explicitly NOT promoted** and why, the **caps in force** (write-side, closed-feedback), and the **coverage window of every dataset an absence rests on**. Sub-agents **cite** it rather than re-deriving. Add the reconciliation pass's mandate to include an **intra-document** consistency check, not only cross-document. | `.claude/rules/evaluation.md` ("Evaluation method" step 3) |
| **4** | low | additive | **The `method:` vocabulary has no term for public distribution-listing metadata, so collectors stretch `binary-extract`** — which §3 maps to **high** confidence. This run's `distribution-artifacts` declared `binary-extract` while explicitly never downloading a binary, propagating a `high` band to ~15 screenshot-derived claims. (The conclusions survive on artifact strength, and the gaps disclosed it — but the mapping did the wrong work.) Anchor: `dimensions/distribution-artifacts/_summary.md`. | Add **`listing-metadata`** to the §3 method vocabulary at **medium**, defined as *public app-store / web-store / registry listing pages + first-party marketing assets, no binary retrieved*, and note that `binary-extract` requires an artifact **actually retrieved and unpacked**. Add the corollary: *a first-party screenshot is a high-confidence observation of **what it depicts** and no evidence of anything requiring the binary (permissions, manifest, host scope).* | `.claude/rules/ingestion.md` §3 (method & confidence vocabulary) |
| **5** | med | **structural — flagged, do not auto-apply** | **Blanket autonomy authorization vs the §8 capability checkpoint — unresolved, and now a 2nd instance in this batch (after Fountain).** Mode 4 found the browser-driving tools **absent from its toolset** (a capability gap, not a permission gate), and proceeded on a materially weaker static-only method because the user had pre-authorised autonomous operation. It documented the degrade exhaustively and then asked, in its own handoff, whether it should have halted. **§8 currently does not say** whether a standing autonomy grant subsumes its "pause and confirm" checkpoint. Two readings are both defensible today, which is exactly the problem. Anchors: `evaluation/feature-coverage.md` "Handoff to Mode 5" §1 · `evaluation/information-architecture.md` READ-FIRST · Fountain's equivalent. | Decide and state it. **Recommended:** blanket autonomy authorises *proceeding*, but **never** silences the notice — require a **one-line, up-front `CAPABILITY DEGRADE` announcement** naming (i) the unavailable capability, (ii) the fallback method, (iii) the coverage lost, emitted **before** continuing, and mirrored into the affected artifact's frontmatter as `run_mode: degraded` + `blockers[]`. Under blanket autonomy the run then continues without waiting; without it, it blocks. This keeps the user informed **before** rather than after, which is the whole point of §8, without stalling an explicitly autonomous run. *(Structural because it changes when a run may proceed — flagged, never auto-applied.)* | `.claude/rules/ingestion.md` §8 + a cross-reference in `.claude/rules/cartography.md` ("Degraded modes") |
| **6** | med | additive | **Three Cartography schema/taxonomy gaps this run had to invent its way around** (all three proposed by the Mode-4 agent itself; Mode 5 endorses all three, with one scope change). **(a)** The 4-disposition taxonomy has no slot for a claim **unlocatable by construction** — 5 rows here (Inquiry Detection, emoji/reactions, image moderation, chatbot job search, accessibility) are *conversation-runtime or rendered-UI properties*. Forcing them into `deeper-than-looked` would inflate the Mode-5 re-walk queue with items a re-walk **provably cannot close**. **(b)** The coverage scorecard has no honesty fields, so a **surrogate** `screenshot_coverage: 10` scores identically to a live 10 on rubric axis 2. **(c)** `stopped_on` has no value for a defect class that cannot be iterated. Anchors: `evaluation/feature-coverage.md` "Disposition taxonomy" + scorecard frontmatter. | **(a)** Add **`unreachable-this-run (capability-gated)`** as a 5th standard disposition → routes to a **recorded structural gap, NOT the re-walk queue**. *Scope change from the Mode-4 proposal:* also add **`vendor-operated`** (shipped, but configured by vendor staff — no customer-facing surface exists to locate; here it caught a real GTM finding, "the deployed product is partly a Paradox employee") and **`partner-side-implementation`** (shipped inside a partner's product). This run needed all three and used them well. **(b)** Add `run_mode: normal\|degraded`, `blockers: []`, `screenshot_coverage_live`, `flows_diagrammed_observed` vs `_inferred`, and `surfaces_walked` to the scorecard schema, and **score axis 2 off the `_live`/`_observed` fields** so surrogates can never inflate it. **(c)** Add **`capability-blocked`** to `stopped_on`. | `.claude/rules/cartography-coverage.md` (disposition table + scorecard schema + the axis-2 scoring note) · `.claude/rules/self-correction.md` (§B ledger, §C stop conditions, output frontmatter) |
| **7** | low | additive | **Conversational-channel products need a capture method the dimension catalog does not have, and Discovery does not warn about it.** **4 of this run's 5 `unreachable-this-run` rows would survive a fully-authorised recruiter session**, because the product's primary interaction is **carrier-mediated (SMS / WhatsApp / Facebook Messenger)** and has **no web-observable wire at all** — no client bundle, no browser tap, nothing for `session` or `wire-capture` rung 1 to see. The corpus reached this conclusion three separate times, from three dimensions, *after the fact*. Closing it needs **a live phone texting a Paradox-powered career site**, not a login. Anchors: `evaluation/ux-flows.md` F2 + TL;DR §1 · `evaluation/feature-coverage.md` "unreachable-this-run" · `deployed-client-bundle/_summary.md` Inferences. | Add to the `session` catalog entry a **conversational-channel pre-flag**: when Discovery detects that the product's primary interaction rides a **carrier/third-party messaging channel** (tells: SMS/WhatsApp/Messenger/RCS/voice as *monitored status-page components*; Twilio/MessageBird/Sinch/Meta-WhatsApp as sub-processors; a "text to apply" or short-code/QR call-to-action; a branded URL-shortener), record in `00-recon-plan.md` **which gaps a session would and would NOT close**, and mark the channel-runtime gap `unreachable-without-endpoint-capture` **up front**. Note the only lanes that close it (a user-owned handset conversation, or `wire-capture` rung 3 against the user's own device) and that both are **gated**. **The principle generalises past chat:** any product whose core surface is not a browser — voice/IVR, email-native, embedded/IoT, in-partner-UI — has the same shape, and `session` is not its capture method. | `.claude/rules/discovery.md` Part C (dimension 7, `session`) |

**Deliberately NOT proposed** (would not recur on a different target): everything specific to Paradox's
own hosts, and the `crt.sh` truncation itself — that is a *known-flaky-tool* symptom the run already
handles with retries. What **is** promoted from it is the generic rule inside proposal #1: *report a
dataset's coverage window, and never let an absence claim outrun it.*

---

## Approval gate — **STOP**

**Nothing above has been applied.** The 8 within-run fixes are already in the corpus (they need no
approval — read-only, no-cost, this target only). The **7 harness-change proposals** need your per-item
call:

- **Accept** → I apply it, flip the row to `APPLIED`, and log the change.
- **Reject** → the row is struck and the reasoning stays on record.
- **Defer** → it stays `PROPOSED` for a later batch.

**Note on promotion evidence.** Proposals **#3** and **#5** are the two with genuinely fast promotion
warrants: #3 has fired **9 times on this single target** (7 caught by the Mode-3 pass, 2 more by Mode 5),
and #5 is the **2nd instance in this same batch** after Fountain. Per the cross-target guard, a
homogeneous batch's repetitions are one vote — **but Fountain and Paradox are independent targets with
different stacks, different access vectors, and different failure modes**, so #5's two instances are two
votes, not one. Proposal **#1** is the highest-value single change: it is the difference between grading a
target's developer surface `absent` and recovering 53 verbatim OpenAPI operations from it.
