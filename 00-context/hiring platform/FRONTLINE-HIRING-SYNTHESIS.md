# Frontline Hiring Platform — Cross-Target Synthesis

> Two targets torn down for **Nurix**, informing a build decision for a **Frontline Hiring Platform** —
> the user's own framing: *"a product that enables retailers to attract, hire, onboard, and activate
> frontline associates at scale, ensuring stores are continuously staffed with qualified and ready-to-work
> talent."* **Fountain** (82.5/100, `solid`) and **Paradox** (81/100, `solid`), both `auth:none`,
> both redaction-clean, both `write_side_observed: false`. Full detail: [`fountain/`](fountain/) ·
> [`paradox/`](paradox/) · head-to-head:
> [`COMPARISON-fountain-vs-paradox.md`](COMPARISON-fountain-vs-paradox.md).
>
> This is the **smallest** synthesis in this project — two targets, not three or more. Read it as a
> paired read, not a category census: a pattern that fires on both is two votes, and two votes on a
> deliberately-chosen head-to-head pair is suggestive, not conclusive.

---

## TL;DR

The user named **Fountain** and asked the agent to pick a second similar USA-market player, then went
off-screen and was **unreachable to confirm the substitution**; the agent chose **Paradox** — a choice
flagged in three places and recorded, with the rejected alternates, in
[`paradox/00-scope-verdict.md`](paradox/00-scope-verdict.md). Both runs scored `solid` and both ran
**without any browser-driving tool in the session at all**, so Cartography executed in a fully degraded,
desk-reconstruction mode on both (`features_walked: 0` on each). The single most decision-relevant
cross-target finding is this: **both incumbents have real, substantial, deliberately-engineered LLM/NLU
infrastructure, and neither names its model vendor anywhere a customer, a candidate, or even a technical
integrator can see** — Fountain's Claude-on-Bedrock enum lives in an unadvertised UMD bundle, Paradox's
Bedrock line lives in a sub-processor PDF. For a category that makes automated decisions about people's
employment, that is a governance-transparency vacuum sitting in the open, and it is the clearest
positioning opening this pair surfaces. The technical bar to enter is high and boring (a multi-service
data model, a compliance state machine, per-tenant isolation); the *unclaimed* ground is trust.

---

## Score & posture summary

| | **Fountain** | **Paradox** |
| --- | --- | --- |
| **Score / vibe** | 82.5 (`solid`) | 81 (`solid`) |
| **Iterations · stop** | **4** (64.4 → 62.0 → 66.7 → 82.5) · `converged` | **2** (66.5 → 66.5 → 81) · `converged` |
| **Target selection** | user-named | **agent-selected, unconfirmed** ⚠️ |
| **Access vector** | `source:none` · `runtime:reachable` · `auth:none` · `presence:rich` — but **full unauthenticated production source maps** (8/8 chunks) → 1,962 files reassembled | `source:partial` (all 5 GitHub repos are forks of unrelated OSS) · `runtime:reachable` · `auth:none` · `presence:rich` marketing / thin dev-docs · **zero source maps** |
| **Strongest lane** | `deployed-client-bundle` — `source-map-reassembly` · **high** | `api` — `openapi-verbatim` · **high** (53 ops recovered from a hub Discovery had written off) |
| **Browser capability** | ❌ **absent from the session toolset** | ❌ **absent from the session toolset** |
| **`features_walked`** | **0** of 66 claimed (45 located) | **0** of 92 claimed (68 located) |
| **`screenshot_coverage`** | **0** — and no visual surrogate exists (no store/extension/PWA listing, verified absent) | **10**, App-Store-listing **surrogates** only; `screenshot_coverage_live: 0` |
| **`flow_coverage`** | 89 (8 of 9 diagrammed — **all inferred**) | **0** (10 of 10 diagrammed, all inferred → scored 0 by choice) |
| **Harness proposals left PROPOSED** | 16 (H1–H16) | 7 (#1–#7) |

---

## ⚠️ Two run-level caveats that bound everything below

**1. Paradox was the agent's pick, not the user's.** The alternates considered and rejected — WorkStep
(narrower warehouse-retention vertical), Sense (a complement, not a substitute), iCIMS (general
enterprise ATS), Instawork/Bluecrew/Wonolo (gig marketplaces, a different business model) — are recorded
in [`paradox/00-scope-verdict.md`](paradox/00-scope-verdict.md). Nothing downstream depends on the choice
being *right*, only on it being flagged. If Paradox is the wrong comparison, that verdict is the file to
overrule; every Fountain-vs-Paradox statement here rests on it.

**2. The Chrome/browser-driving MCP tools were not connected in this session at all.** This is a
*capability* gap in the sense of `ingestion.md` §8, not a permission gate — and it is **strictly worse
than `auth:none`**, because it also blocked the *unauthenticated* walks `auth:none` alone would have
left open (Fountain's `cue.fountain.com`, tenant career sites, the public chat widget; Paradox's public
marketing site). Neither the Onebeat batch nor the AEO/GEO batch hit this in this form.

**What this does and does not affect.** The **dimension captures are unaffected** — none of them needed a
browser, and both corpora are rich: source-map reassembly, CT sweeps, registry sweeps, verbatim OpenAPI,
live MCP probes, `401`-vs-`404` existence probes. What *is* affected is the **Mode-4 experiential layer
specifically**: every IA depth measure, every UX flow, and every "where does this feature live" claim in
both corpora is **reconstructed from static artifacts, never observed rendering**. Fountain's
reconstruction is unusually strong (a verbatim machine artifact); Paradox's is string-mined and capped
lower. Neither is a walk. Weight the four dimension rollups normally; discount the IA/UX-flow
deliverables accordingly.

---

## The central cross-target finding: the AI plumbing is real, and it is invisible on purpose

Both companies have built genuine AI infrastructure well past what their public material admits — and in
both cases the *specific* thing that is undisclosed is the **model vendor**.

- **Fountain.** One unauthenticated `curl` of the separately-deployed `wx-copilot.umd.js`
  micro-frontend surfaced a verbatim model-selection enum: **`us.anthropic.claude-opus-4-6-v1`** and
  **`us.anthropic.claude-sonnet-4-6`** — the exact AWS Bedrock cross-region inference-profile naming
  convention — inside `llmProvider: enum(["openai","anthropic","anthropic_direct"])` (default `openai`),
  alongside a Bedrock-knowledge-base field, `customPrompt`, and a strictness enum. Around it: a
  **`copilotAuditLogs`** resource (a governance audit trail built specifically for AI-made changes), a
  `createForCopilot → cloneForCopilot → publishForCopilot` human-in-the-loop lifecycle, and **two live
  unauthenticated MCP servers totalling 133 tools** (`fountain-data-mcp` 6 tools over Cube.js+ClickHouse;
  `fountain-hire-mcp-server` **127 tools** at `mcp.fountain.com`). Nobody builds a governance audit log
  for a relabeled rules engine. **Named nowhere:** not on marketing, security, `/ethical-ai`, or the
  trust centre — not even the phrase "large language model."
- **Paradox.** `genai.paradox.ai` runs Python ASGI/uvicorn, architecturally separate from the sync
  WSGI Django monolith, and the app's CSP `connect-src` names **no third-party LLM host at all** — every
  model call is brokered server-side. A `rasa-*` host family CT-logged 2023-09 → 2024-03 and NXDOMAIN
  today (Rasa being the leading *pre-LLM* intent-classification framework), a live `genai.*` family since,
  and a 2026-08-05 sub-processor PDF naming **"AWS Bedrock, model licensing services."** **Named
  nowhere else:** not the homepage, not any of 13 product pages, not the ethical-AI page, not the
  security page. Recovered only from a PDF linked off the footer.

**Why this is a different — and stronger — pattern than the AEO/GEO batch's.** There, the finding was
*capability exists but isn't flagship-marketed*: a built AI-commerce product buried in the positioning.
Here the capability is loudly marketed (Fountain's "Frontline Superintelligence," four named personas) or
quietly shipped (Paradox's unadvertised "Assist" copilot), but the **underlying plumbing is undisclosed
even in the technical documentation** — 593 reference pages at Fountain never mention its own live MCP
servers; 53 published API operations at Paradox expose no AI operation whatsoever. Positioning lagging
technology is now a **two-category** phenomenon in this project, and in this category it has a compliance
edge to it that AEO/GEO did not: these systems screen job applicants.

**The self-published evidence makes it quotable.** Fountain commissioned and published a survey of 1,014
US frontline workers (Jun 2026) finding **62% report being "ghosted,"** with *"unexplained AI screening
rejections"* among the top complaints — while its `/ethical-ai` page names **zero** compliance frameworks
and its stated mitigations ("explainable scoring," opt-in human review) have **no corresponding endpoint**
in 575 published paths, 766 app-own paths, or 127 live MCP tools. Paradox defers its bias-evaluation
methodology **to Workday's standards** and has published a dated postmortem tracing ~13 of 45 incidents
to legacy synchronous endpoints. Both criticisms are the vendors' own words.

---

## Architecture convergence

Four things fired on both, from two unrelated engineering organisations:

1. **Both on AWS, both mid-migration, both visibly.** Fountain runs **two backend generations behind one
   brand** — a Rails/Rack Hire monolith (Devise, `X-ACCESS-TOKEN`, flat JSON, 120 req/min) alongside a
   **LoopBack 3/4 Node** fleet of Worker-Experience microservices (OAuth2, `filter[where][field][eq]`
   grammar, JSON:API envelopes, **no documented rate limits at all**), carried as two separately-generated
   OpenAPI documents in its own docs corpus, with `Auth_old` / `workflow_editor_v2` / `hiring-goals-v2/v3/v4`
   visible inside the client. Paradox runs a **Nuxt3-over-legacy-Vue2 strangler fig** — a thin Nuxt 3 shell
   covering only login/OTP/SSO over a Django+Vue2/Vuex/jQuery/Handlebars console 100+ routes deep, asset
   path stamped `202608` (the month of capture) — plus a **Rasa→Bedrock AI-stack migration**. Neither
   migration is finished. Neither is a moat; both are consistency taxes a clean-sheet entrant does not pay.
2. **Zero public open-source presence for the core product.** `github.com/Fountain` is a verified
   **namesake** (org created 2009-03-17, five years pre-founding). `github.com/ParadoxAi` is genuine but
   **all 5 repos are forks of unrelated OSS**, with the only Paradox-owned publishes sitting under
   *individual engineers' personal npm scopes*. **And no SDK in any language on either** — 23 npm + 14
   PyPI direct GETs at Fountain, no registry namespace at all at Paradox. REST + curl only, in an
   integration-heavy category. That lane is wide open.
3. **Enterprise-quote-only, zero public pricing.** Verified across 6+ locations (Fountain) and 9 probe
   points (Paradox, whose `/pricing` **301-redirects to the homepage** rather than 404ing). Paradox's is
   independently corroborated as structural: its sub-processor list **names no payment processor at all**.
4. **Real capability sitting deeper than the public product catalog, on both.** Fountain: a whole
   `/payments` destination, an entire undocumented **`/api/go/{v1,v2}` ("Hire Go")** API family absent from
   all 575 documented endpoints *and* all 766 app-own paths, seven `service*` families the docs never name
   (including a 27-path `serviceauthorization` RBAC service), and **four marketed modules — Shift, Onboard,
   Pulse, Compliance, ~197 endpoints — with zero routes in the application this run mapped**, i.e. "Frontline
   OS" ships as at least two applications and the initial pass located one. Paradox: the unmarketed **"Assist"**
   voice-enabled recruiter copilot (confirmed on two independent lanes, appearing on none of 13 product
   pages, no KB article, none of 53 API operations), a Safari **Olivia Extension** injecting Paradox over
   LinkedIn, and a whole **post-hire retention line** (`/microlearning`, `/employee-recognition`,
   `/employee-rewards`, `/employee-chat`) the site never mentions.

Point 4 has a direct consequence for Nurix's scope: **both incumbents are already building the retention
half of the frontline lifecycle** — which is precisely the *"ready-to-work talent, continuously staffed"*
half of the user's own framing. Neither markets it yet.

---

## Where the two genuinely differ

The pair is not two versions of the same company. The divergence is a **GTM philosophy split**, and it is
the sharpest signal in the batch.

| | **Fountain** | **Paradox** |
| --- | --- | --- |
| **Shape** | Broad modular suite — ~20 top-level products, **766 declared app-own paths**, ≥19 microservice families, hire → onboard → schedule → engage → retain | One conversational engine wearing **13 product skins** — verified on three runtime lanes (near-identical page content, one admin router, one entity set, 13 status components mapping to none of the 13 SKUs) |
| **Developer surface** | Real and deep: `developer.fountain.com`, a 593-page `llms.txt`, **575 documented endpoints**, verbatim per-operation OpenAPI, documented webhooks, rate limits, RFC 8594 `Sunset:` deprecations, and `exposeAsMcpTool` — a **build-pipeline switch traced end-to-end** that promotes an endpoint to an agent-callable tool | Thin and hidden: **53 operations / 36 paths** on a ReadMe.io CNAME reachable via **one unlabelled link**; OAuth2 credentials issued by a human; **no MCP surface at all**; the public API exposes **no AI operation whatsoever** |
| **Distribution** | **Direct sales + DIY integration.** No certified partner-embed programme evidenced anywhere; the HRIS story is a **two-paragraph DIY webhook pattern**, and the ADP/Workday/UKG/SAP names are marketing-only (flagged tentative in its own corpus; "certified" was struck for lack of evidence) | **Formalised, paid-tier partner-embed moat** — Workday Certified (a named "Paradox for Workday" line), a **paid SAP Endorsed App** (validated → spotlight → endorsed), Indeed Apply embedding. Three genuinely *different bespoke mechanisms*, i.e. real per-partner headcount — defensible precisely because it doesn't scale to the long tail |
| **Schema philosophy** | Own the stack; three entity spines, near-disjoint published vs app-own surfaces | Mirror someone else's: **dual identity on every entity** (internal OID + external ID) across eight families, plus a **status-map triplet** translating Paradox stages into the customer ATS's vocabulary — the literal implementation of *"enhance your hiring lifecycle without replacing your system of record"* |

In one line: **Fountain owns the whole stack and sells direct; Paradox embeds into the incumbents'
installed base and sells the overlay.** Fountain has the materially deeper product and the far better
developer portal — and the weaker distribution story.

---

## What Nurix should take from this

### 1. The table-stakes technical bar (not optional — both incumbents clear it)

- **A real multi-service backend, not a monolith and not an ATS.** Fountain's post-hire surface is **~467
  endpoints against its ATS's 108 — over 4×** — and Paradox's unmarketed routes already reach
  recognition/rewards/microlearning. An MVP scoped to applicant tracking will be benchmarked against the
  wrong thing and lose on the right thing. Budget for the *shape*, not the feature list.
- **A genuine LLM backend, even before you disclose it.** Both license through **AWS Bedrock**; Bedrock
  access is a moat for neither and will not be one for Nurix. What is differentiating is the surrounding
  machinery — Fountain's `copilotAuditLogs` and its `draft → test → human-publish` approval lifecycle are
  the parts worth copying, not the model choice.
- **A compliance/I-9-style state machine, if targeting US frontline/retail.** I-9, E-Verify, WOTC, tax
  forms, TCPA consent in the core applicant schema, background-check vendor abstractions. Fountain's is
  the best-specified AI contract on either platform: OCR with glare/focus detection → field extraction →
  an `aiConfidenceLevel` → a tentative auto-approve verdict → a **synchronous block on the customer's
  External Processing URL**, which may return `{forceAutoApprove, forceManualReview}` to override it
  (`forceManualReview` wins ties; on timeout Fountain silently falls back to its own decision **without
  surfacing that in the UI** — a fail-open footgun it documents itself). This carries legal exposure,
  which makes it slow by nature, not merely laborious.
- **Two schema decisions on day one.** (a) **Dual identity + a status-translation map on every entity**,
  the way Paradox does — this is what makes an overlay deployable next to Workday/SAP/UKG instead of a
  rip-and-replace fight. (b) **Per-decision explanation records in the schema from the start** — the one
  thing neither incumbent can retrofit cheaply.
- **Buy the commodity, build the one thing on your critical path.** Both do it: Fountain buys
  Checkr/Onfido/HireRight/DocuSign/HelloSign and *acquired* Clevy for conversational AI; Paradox buys
  Textkernel/Symmetry/Merge and *acquired* Traitify. What Paradox built in-house is narrow and telling —
  AcroForm PDF signatures and a Node service that speaks Python Celery's wire protocol.
- **Per-tenant isolated deployment.** Fountain: 144 CT subdomains with paired `sandbox.<tenant>` twins and
  separately-scheduled maintenance windows naming Amazon/CeraCare. Paradox: per-customer subdomain
  families and **per-customer native app builds** ("Regis + Paradox CEM" on both stores). Boring,
  expensive, non-optional above a certain deal size — and exactly what enterprise security review
  interrogates.

### 2. The open positioning space: **transparent, disclosed AI**

Neither incumbent has made AI trust, explainability, or model transparency a differentiator, despite both
having the infrastructure to. Fountain's ethical-AI page names zero frameworks, zero methodology, zero
audit cadence, and no third-party bias auditor — while Fountain itself published the survey saying 62% of
frontline applicants get ghosted and that unexplained AI rejections are a top complaint. Paradox defers
its bias-evaluation methodology to a **partner's** standards. Neither names a model vendor anywhere a
buyer or a candidate can see.

Two properties make this unusually attractive as a wedge:

- **It is structural, not a marketing oversight.** Retrofitting per-decision explanations onto a
  decade-old applicant state machine, or onto a conversation engine mid-migration from intent
  classification, is genuinely expensive. An entrant builds it into the schema before there is data to
  migrate.
- **It is a product surface, not a page.** The credible version is candidate-facing: *why* was this
  application advanced or held, what did the assistant read, who can review it, an auditable trail per
  decision — plus a published AI-governance story that names the model provider. Both incumbents already
  have the audit-log *concept* (Fountain literally ships `copilotAuditLogs`); neither has turned it
  outward. "An Ethical AI marketing page" is what the incumbents have. That is not the same thing.

Two cheaper adjacent gaps: **quality-of-hire is unclaimed** (every Paradox case-study metric in the
corpus is speed or cost — none is quality-of-hire, retention, or 90-day attrition; though it is unclaimed
*because it's hard to prove*, so don't promise it without an evaluation design), and **admin self-serve
is attackable** (Paradox's KB states Assistant Messaging access and "Next Step" transitions are
configured **by a CS representative** — the deployed product is partly a Paradox employee).

### 3. The GTM lesson is Paradox's

**Partner-embed distribution with paid certification is likely a faster wedge for a new entrant than
pure direct sales.** Paradox's three certified embeds are each a different bespoke mechanism —
server-to-server sync (Workday), a client-side extension driven by a signed-URL iframe contract (SAP), a
partner-side embed (Indeed Apply). Fountain, with a materially deeper product and a far better developer
portal, has **no evidenced certified HRIS connector at all**. A new entrant has none of Fountain's decade
of RFP relationships, which makes layering onto Workday/SAP/Indeed's installed base a materially cheaper
path to the same buyer than displacing the system of record.

Three consequences: **start the certification clock before the product is finished** (it is audited,
contractual, multi-quarter — the one item on this list engineering effort cannot compress); **ship a
documented, authenticated, customer-facing agent/MCP surface** (Fountain has already built the plumbing
and pointed it *inward* — 127 tools answer an anonymous `tools/list` but are undocumented across all 593
reference pages; Paradox has none. The wedge is not "they have no MCP," it is **"their MCP is not for
you"**); and **don't plan to win the enterprise RFP head-on in year one.**

### 4. The distribution-channel lesson: plan for a surface your own tooling can't see

Paradox proved that a candidate-facing hiring funnel can run **entirely over SMS / WhatsApp / Messenger
with no web-observable wire at all** — no client bundle, no browser tap, nothing for a `session` or a
rung-1 wire capture to observe. This run's own conclusion was that even a fully-authorised recruiter
session would have captured the *console's* wire, not the *conversational* one; closing that gap needs a
live handset, not a login. If Nurix's product is also conversational or agentic, **design the data-capture,
evaluation, and observability story for that channel up front** — because your own tooling will be as
blind to it as this teardown was, and "we can't see what our agent said to the candidate" is exactly the
gap that turns the transparency wedge in §2 from a differentiator into an embarrassment.

---

## Batch process note (for the harness, not the product decision)

Two harness-relevant findings are worth carrying forward:

**(a) The browser-capability-gap vs §8-checkpoint tension fired on BOTH targets — 2 for 2, and it is a
session-level tooling gap, not a per-target auth gap.** In both runs, Mode 4 discovered the capability
gap, judged that §8's pause-and-confirm checkpoint applied, and **proceeded anyway** on the materially
weaker method because the user had pre-authorised autonomous operation and was unreachable. Both
documented the degrade exhaustively and both flagged the tension against themselves. The two proposed
fixes differ in kind and are worth reading together: Fountain proposes an **additive** §8 clause (a
structured `capability_gap: {capability, degraded_method, coverage_lost, authorized_by}` record
auto-promoted to the Mode-5 defect list); Paradox proposes a **structural** one (a one-line up-front
`CAPABILITY DEGRADE` announcement *before* continuing, mirrored as `run_mode: degraded` + `blockers[]`).
Both are approval-gated and unapplied. Because Fountain and Paradox are independent targets, this clears
the ≥2-independent-target bar — but note the homogeneity guard cuts the other way here: they hit it for
the *same session-level reason*, so it is arguably one environmental cause observed twice, not two
independent votes. Worth stating explicitly at approval time.

**(b) Fountain's 4-iteration loop materially changed its own score by continuing to mine assets its own
initial pass had found-but-not-fetched — strong validation of iterate-until-converged over single-pass.**
Iterations 1–2 *found product*: two unauthenticated GETs of previously-unfetched UMD micro-frontends
recovered **Cue's LLM configuration**, **+466 API paths** (300 → 766), and **two live MCP servers**, one of
which turned out to be the 127-tool Hire agent surface the run had been hunting since Mode 1. Iteration 3
found nothing new and instead **retired four over-promotions and lowered its own headline coverage number
on principle** (`ia_nav_coverage` corrected *downward* from a flattering `14÷14 = 1.00` to an honest
`4÷20 = 0.20`), while catching two arithmetic errors in its own prior measurement. Paradox's shorter loop
did the same in miniature: iteration 1 returned a **negative result, recorded as such**; iteration 2
repaired 7 defects, the load-bearing one being **a false absence stated as fact in three documents**
("Paradox has never stood up a developer-docs subdomain, at any point") that one per-host crt.sh re-query
refuted — the `%.paradox.ai` dataset is silently truncated at 2024-06-13. Both loops stopped early for the
same reason: everything still open needs **a credential and a browser**, and neither existed.

The generalisable lesson from (b): on a `source:none` target, **the cheapest unmined artifact is often the
highest-yield one in the entire run** — and an absence must be scoped to the artifacts actually searched,
never asserted at product scope.

---

## Open items

- **All harness-change proposals from this batch remain `PROPOSED` / awaiting approval** — 16 from
  Fountain (H1–H16, of which H9 and H10 are flagged **structural**) and 7 from Paradox (#1–#7, of which #5
  is flagged **structural**), for **23 in this batch**, on top of the accumulated total across all batches
  to date. Nothing has been applied.
- **Both targets' single highest-value follow-up is identical and unavailable this session:** one
  read-only Pass-1 authenticated session with a pre-navigation in-page fetch/XHR tap, *plus* a working
  browser. That alone would convert both corpora from *declared* to *observed*, close
  `features_walked: 0` / `screenshot_coverage: 0` on both, resolve which foundation model Bedrock fronts
  for Olivia, and reveal what `wss://ws.paradox.ai` carries.
- **`external-reputation` is flagged recommended-for-this-run on both** (the closed-feedback cap fired on
  each — neither has a public issue tracker, roadmap, forum, or feedback board). Until it runs, **every
  user-pain claim across this entire pair is capped at tentative.**
- **The Paradox target selection is still unconfirmed.** If it is the wrong comparison,
  [`paradox/00-scope-verdict.md`](paradox/00-scope-verdict.md) is the file to overrule.

---

## Provenance & confidence notes

Every finding above is drawn from the two full teardowns (`fountain/evaluation/*.md`,
`paradox/evaluation/*.md`) and from
[`COMPARISON-fountain-vs-paradox.md`](COMPARISON-fountain-vs-paradox.md), each independently anchored and
provenance-tagged. Cross-target claims — the central finding, the convergence section, and the Nurix
recommendations — are **this document's own synthesis**, not a claim either corpus makes about the other.
Both runs are `auth:none` with `write_side_observed: false`: the only live responses in either run are
Fountain's two read-only MCP capability probes (`initialize` + `tools/list` only, **no tool ever
invoked**) and Paradox's six unauthenticated `401`-vs-`404` existence probes. **Everything else about
product behaviour — as opposed to declared or shipped capability — is inferred from static evidence and
was never confirmed live.** And with no browser in the session, nothing in either run was ever *seen*
rendering.
