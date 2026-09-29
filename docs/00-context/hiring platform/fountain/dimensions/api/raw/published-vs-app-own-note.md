<!-- source: dimensions/_shared/api-path-catalog.md (## source: bundle, written by deployed-client-bundle) cross-referenced against this dimension's own catalog · captured_at: 2026-08-09 · method: inferred (cross-dimension citation, no new fetch) -->

# Fountain — published (developer.fountain.com) vs app-own (web.fountain.com) API — a citation, not a duplicate copy

Per ingestion.md §6 ("Host-level dimensions cite, they don't append — seam allowlist"), `api` is not on
the shared `dimensions/_shared/api-path-catalog.md` contributor allowlist (`bundle` / `session` / `wire`
/ `distribution` only). This dimension therefore does **not** append a `## source: api` section to that
file — it CITES it here instead, so Evaluation's published-vs-app-own diff (per
`evaluation.md` template 3) has both lanes to read.

**NOTE:** the dispatch brief for this run asked me to append a `## source: api` section to the shared
file directly; I deviated from that instruction in favor of the more specific governing rule
(`ingestion.md` §6's explicit allowlist + the host-level-dimension citation pattern), which this exact
situation matches (the published developer API is a distinct, non-runtime-observed surface, analogous to
`infra-backend-fingerprint`'s treatment). Flagging the deviation explicitly for the orchestrator/Evaluation
to see.

## The diff, as it stands from the two capture

| | Published API (`services.fountain.com`, this dimension) | App-own API (`web.fountain.com`, `deployed-client-bundle`) |
|---|---|---|
| Host | `services.fountain.com` (unified gateway) + legacy `api.fountain.com`/regional hosts | same-origin as the web app, e.g. `web.fountain.com` |
| Path families | `/v2/*` (Hire legacy), `/api/service{workforce,attendance,organizations,todo,pulse,employment,pool,media,security,compliancev2,referral,staff}/*` | `/api_self_serve/{v1,v2}/*` (33 paths), `/internal_api/*` (267 paths) |
| Count | 575 documented endpoint pages across 14 service families | 300 unique paths / 358 method+path pairs (generated-client extraction) |
| Auth | OAuth2 client_credentials Bearer (unified) OR `X-ACCESS-TOKEN` (legacy Hire) | app's own session/cookie auth (not this dimension's finding — see `deployed-client-bundle`/`session`) |
| Overlap | `applicants`, `funnels`(↔`openings`), `locations`, `positions`, `hiring_goals`, `webhook-settings`(↔`webhooks`), `workers` all have BOTH a published `service*`/`v2` endpoint AND an `/internal_api/*` equivalent (e.g. published `GET /v2/applicants` vs app-own `/internal_api/applicants/...`, published `serviceworkforce/workers` vs app-own no direct `/internal_api/workers` — app manages workers via `/internal_api/wx/users` instead) | — |

## The headline finding (near-total path disjointness, same as the Akeneo pattern this playbook cites)

**The published developer API and the app's own internal API are almost entirely separate path
namespaces**, not two views of the same routes:
- The published API's path *shapes* (`/api/serviceattendance/timesheets`, `/api/servicepool/copilot/
  audiences`, `/api/servicecompliancev2/ai-documenttypes`) do not appear ANYWHERE in the bundle's 300
  app-own paths.
- The app's rich feature surfaces visible only in `/internal_api/*` — `chatbot` (29 paths, the AI
  chatbot/FAQ-bot backend), `sourcing` (52 paths, job-ad spend/budget/channel recommendation engine),
  `ai_builder` (2 paths — `workflow/chat`, `workflow/get_latest_message`, almost certainly the "Cue"
  AI workflow-builder chat interface), `agent_integrations` (11 paths, a distinct "RX agent"/
  conversation-report surface, name suggests a compliance/regulated vertical i.e. background-check
  "Rx" workflows) — have **no published equivalent at all**. A partner integrating via the public API
  cannot touch sourcing spend optimization, the AI chatbot config, the AI workflow builder ("Cue"), or
  whatever "RX agent" is; those are internal-product-only surfaces.
- Conversely, some published-only microservices (`servicepulse` — engagement surveys, `servicereferral`
  — referral campaigns) have no obviously-matching `/internal_api/*` family in the 300-path bundle
  sample — plausibly because those features are managed through UI surfaces the code-split bundle miner
  didn't reach, not because they're API-only (an open question for a future `session`/`deployed-client-
  bundle` re-walk).

**Positioning implication:** Fountain's *product* is materially broader (sourcing spend optimization, AI
chatbot, AI workflow builder, compliance agent flows) than what it exposes to *integration partners*
(applicant/worker CRUD, compliance documents, attendance, referrals). The public API is an
integration/data-sync surface; the differentiated AI/automation capability is kept product-internal —
worth a line in `competitive-positioning.md` (Fountain is not (yet) opening its AI layer to partners/
agents via API, despite the `exposeAsMcpTool` tagging suggesting that's a direction of travel — see
`tool-catalog.md`).

## Open questions

- Whether `servicepulse`/`servicereferral` truly have no `/internal_api` UI surface, or the bundle miner
  simply didn't reach those routes (code-splitting can hide unloaded chunks) — a `deployed-client-bundle`
  or `session` re-walk of the Engagement/Referral settings pages would resolve this.
