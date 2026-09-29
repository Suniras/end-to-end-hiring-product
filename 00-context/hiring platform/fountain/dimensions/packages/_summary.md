---
dimension: packages
target: fountain
status: complete
access_grade_used: "source:none, presence:rich (docs)"
method: registry-metadata
completeness_pct: 100
confidence: high
captured_at: 2026-08-09
sources:
  - https://developer.fountain.com/llms.txt
  - https://developer.fountain.com/reference/overview.md
  - https://developer.fountain.com/reference/hire-api-overview.md
  - https://registry.npmjs.org/<candidate-name> (23 direct GETs)
  - https://pypi.org/pypi/<candidate-name>/json (14 direct GETs)
  - https://registry.npmjs.org/-/v1/search?text=fountain%20hire (sanity text search)
  - https://api.github.com/orgs/xrpl-fountain, https://github.com/xrpl-fountain/fountain-sdk-python (namesake verification)
gaps: []
---

# Fountain — Packages capture

## Method

Discovery's cheap probe found no `fountain-hire`/`@fountain`-scoped package and flagged this dimension
`⚠️ partial/likely-absent` pending a proper direct-registry sweep. This capture closes that gap with the
gold-standard method for an absence claim (per this project's established practice — see Brandlight's
packages dimension): **direct registry GETs, not text search**, against every plausible official-SDK
name, plus a check of whether the developer docs name an SDK anywhere.

1. **Docs-first check.** Fetched `developer.fountain.com/llms.txt` in full (the complete ~200-entry
   reference-page index) and grepped it for `sdk|client librar|npm|pypi|pip install|package|library` —
   zero hits. Also read `reference/overview.md` (Fountain One OAuth overview) and
   `reference/hire-api-overview.md` (legacy Hire API overview) verbatim — both describe **REST-only**
   access via `curl` examples (OAuth2 `client_credentials` bearer tokens, or a legacy `X-ACCESS-TOKEN`
   header for Hire). Neither page, nor any of the ~185 other reference-page titles, mentions an official
   client library in any language. This ruled out the "check docs for the real SDK name first" path the
   task specified — there is no named SDK to go verify.
2. **Direct npm registry GETs** (`registry.npmjs.org/<name>`, unscoped + `@fountain/*` scoped) against 23
   candidate names: `fountain-hire`, `fountain-sdk`, `fountain-api`, `fountain-node`, `fountainhire`,
   `fountain-client`, `fountain-io`, `fountain`, `fountain-api-client`, `fountain-node-sdk`,
   `fountain-employer`, `fountain-hire-sdk`, `fountainhq`, `fountain-hq`, `fountain-services`,
   `fountain-workforce`, and the scoped `@fountain/{sdk,client,api,api-client,hire,node}` +
   `@fountainhq/sdk`. All returned **404** except bare `fountain` (200).
3. **Direct PyPI registry GETs** (`pypi.org/pypi/<name>/json`) against 14 candidate names: `fountain-hire`,
   `fountain-sdk`, `fountain-api`, `fountain-python`, `fountainhire`, `fountain-client`, `fountain`,
   `fountain-api-client`, `fountain-hiring`, `fountain-employer`, `fountainhq`, `fountain-hq`,
   `fountain-services`, `fountain-workforce`. Two returned **200**: `fountain` and `fountain-sdk`.
4. **Investigated every hit** (npm's `fountain`, PyPI's `fountain` and `fountain-sdk`) by pulling full
   registry metadata (author, homepage, repository, description, first-publish date) and, for
   `fountain-sdk`, cross-checking its declared GitHub org via the GitHub API — all three are confirmed
   **unrelated namesakes** (below), none is Fountain-the-hiring-company's package.
5. A noisy npm text search (`text=fountain hire`) was run only as a **sanity check**, not as the primary
   method (per the task's explicit warning that text search surfaces noise like `fountain-js`) — it
   returned only screenplay-parser tooling (`fountain-js`, `fountain-generator`, Yeoman
   `generator-fountain-*`) and unrelated packages that merely contain the substring "fountain"
   (`@tsparticles/preset-fountain`, `@intentius/chant-lexicon-fountain`), corroborating the direct-lookup
   result rather than surfacing anything new.

## Findings

| Registry | Candidate checked | HTTP status | Verdict |
| --- | --- | --- | --- |
| npm | `fountain-hire`, `fountain-sdk`, `fountain-api`, `fountain-node`, `fountainhire`, `fountain-client`, `fountain-io`, `fountain-api-client`, `fountain-node-sdk`, `fountain-employer`, `fountain-hire-sdk`, `fountainhq`, `fountain-hq`, `fountain-services`, `fountain-workforce` (15 names) | 404 (all) | absent |
| npm | `@fountain/sdk`, `@fountain/client`, `@fountain/api`, `@fountain/api-client`, `@fountain/hire`, `@fountain/node`, `@fountainhq/sdk` (7 scoped names) | 404 (all) | absent |
| npm | `fountain` | 200 | **unrelated namesake** — author Giulian Drimba, `github.com/giuliandrimba/fountain`, first published 2012-12-08 (predates Fountain-the-company's 2014 founding), v0.3.4, no homepage set. Personal OSS project. |
| PyPI | `fountain-hire`, `fountain-api`, `fountain-python`, `fountainhire`, `fountain-client`, `fountain-api-client`, `fountain-hiring`, `fountain-employer`, `fountainhq`, `fountain-hq`, `fountain-services`, `fountain-workforce` (12 names) | 404 (all) | absent |
| PyPI | `fountain` | 200 | **unrelated namesake** — "Parses fountain screenplay markup" (fountain-to-LaTeX utility), author gabriel montangé láscaris-comneno, `bitbucket.org/gabriel.montagne/fountain`, v0.1.3. Same screenplay-markup family as npm's `fountain-js`. |
| PyPI | `fountain-sdk` | 200 | **unrelated namesake** — "Python SDK for Fountain stablecoin API": a Brazilian-Real-pegged stablecoin / XRP-Ledger product (`create_stablecoin`, `currency_code=APBRL`, `deposit_type=XRP`, `mint_more`/`burn_stablecoin` methods). Repo `github.com/xrpl-fountain/fountain-sdk-python` — org+repo both **404 on GitHub** as of capture (deleted/never fully public). Single release ever (v1.0.1, Beta classifier). `author_email` field reads `support@fountain.com` (textually matches Fountain-the-hiring-company's real support address) but every other signal — product domain, GitHub org name, description — contradicts it; treated as coincidental/placeholder, not ownership evidence. |
| developer.fountain.com docs | full `llms.txt` index (~185 reference pages) + both API-overview pages | n/a | **no SDK/client-library named anywhere** — the docs describe a REST-only API, curl-only examples, OAuth2 `client_credentials` (Fountain One) or legacy `X-ACCESS-TOKEN` header (Hire API v2.0) |

**Conclusion: Fountain publishes no official SDK / client package on npm or PyPI, under any plausible
name.** The public integration surface is REST-only, documented via a ReadMe-hosted developer portal
with per-endpoint reference pages and curl examples — no generated or hand-written client library in any
language is referenced from the docs, and no registry hit resolves to Fountain-the-hiring-company.

## Inferences

- Fountain's API strategy leans on a **rich, auto-generated ReadMe docs portal + curl-first reference**
  rather than shipping first-party SDKs — consistent with a B2B enterprise-integration model where
  customers/partners typically build a thin internal wrapper themselves (or Fountain's own Custom
  Integrations / Partner ecosystem, per `partners.fountain.com`, does the heavy lifting) rather than a
  developer-self-serve/PLG model that would justify investing in maintained client libraries.
- The `services.fountain.com/api/service{security,workforce,hire}/...` path structure documented in the
  overview pages corroborates the microservices hypothesis already flagged in `00-recon-plan.md`
  (security / workforce / hire as separate backend services behind one gateway) — this is an `api`/
  `docs`-dimension finding, cross-referenced here since it surfaced during the SDK-mention sweep.
  Not this dimension's primary finding; flagged for `api`/`technology-architecture.md` to corroborate.
- The "Fountain Hire Package Required" gate note on the Hire API overview page implies Fountain's product
  line has at least two commercially-separable API surfaces (a newer "Fountain One" OAuth2 API and a
  legacy "Hire" v2.0 API with its own key model) — a packaging/edition signal worth folding into
  `competitive-positioning.md` / `data-model-api-surface.md`, not a `packages`-dimension conclusion per
  se.
- The coincidental `support@fountain.com` author-email on the unrelated PyPI `fountain-sdk` stablecoin
  package is almost certainly a boilerplate/placeholder value inserted by whatever scaffold/template
  generated that package's metadata (or a copy-paste artifact) — it is flagged for completeness but
  carries no evidentiary weight given every other field contradicts it.

## Open questions

- None outstanding for this dimension — the direct-registry sweep is exhaustive over every plausible
  official-SDK name pattern, cross-checked against the docs' silence on any SDK, so `status: absent` for
  an official package is asserted at full confidence.
- Out of scope for `packages` but worth a note for `codebase`/`docs`: whether Fountain's **partner**
  ecosystem (`partners.fountain.com`, referenced repeatedly from the developer docs) publishes any
  partner-facing SDKs or connector code under a different name/org — not probed here since it is a
  distinct docs surface, not a registry package; flag for the `docs` collector if not already covered.

## Artifacts

- `raw/registry-sweep.json` — the full direct-lookup sweep: 23 npm candidate names + 14 PyPI candidate
  names with HTTP status codes, plus the docs SDK-mention check result.
- `raw/fountain-sdk-namesake.json` — full registry metadata + disambiguation evidence for the one hit
  that needed real scrutiny (PyPI `fountain-sdk`, the unrelated stablecoin package).
