<!-- source: https://readme.paradox.ai/docs/iframe-usage.md · captured_at: 2026-08-09 · method: docs-reconstructed (verbatim doc page, no auth) -->

# Paradox — Embeddable surface: signed-URL IFrame modals (not a `<script>` widget)

**The public/undocumented-elsewhere embeddable surface the task asked about exists — but it is an
IFrame + signed-URL-parameter contract, not a `<script src="widget.js">` embed snippet.** No
`widget.js`, no `data-paradox-*` attribute, and no embeddable-chat `<script>` tag was found anywhere in
`paradox.ai`'s or `careers.paradox.ai`'s page source (both checked; `careers.paradox.ai` itself turned
out to redirect to `workday.com/careers`, presumably a stale/reassigned DNS record — a `website`/
`infra-backend-fingerprint` finding, not an `api` one). Instead, `readme.paradox.ai/docs/iframe-usage`
documents four parameterized `olivia.paradox.ai` URLs meant to be embedded in an `<iframe>` inside a
**partner ATS's own UI** (this is exactly the mechanism behind the "Paradox for SAP SuccessFactors
browser extension" and similar partner-embedded-panel integrations — see `partner-integrations.md`).

## The four documented iframe endpoints

All take three common query params: `OID` (Olivia candidate long ID), `jwt_token` (a token "generated" —
mechanism of generation not documented on this page, presumably minted server-side by Paradox for the
partner to embed), `account_id`.

| Purpose | Endpoint | Extra params |
|---|---|---|
| Demo / test modal | `https://olivia.paradox.ai/demo/sf-iframes` | — |
| Conversation modal | `https://olivia.paradox.ai/external/convo` | — |
| Scheduling modal | `https://olivia.paradox.ai/external/scheduling` | `ContactID`, `ContactDBID`, `ClientID`, `is_show_conversation`, `name`, `email`, `phone` |
| Settings modal | `https://olivia.paradox.ai/external/settings` | — |

The docs page includes a worked example URL for each, with a **sample JWT** (HS256, doc-published,
clearly a fabricated/ancient example — payload `{"UID":336,"iat":1543979448...}`, a 2018-dated
placeholder, and a fake candidate "Hoang Nguyen" / `hoang@codeographer.net`). This is a **documentation
sample, not a captured live credential** — noted for completeness, not reproduced verbatim in this
summary's prose (the raw doc page itself is public and unauthenticated, so no redaction violation in
citing its existence, but this file paraphrases rather than re-pasting the full token string).

## What this confirms

- Paradox's actual "chat widget" experience for candidates is **not** a generic embeddable `<script>` a
  customer drops into any career site DIY-style — the primary candidate-facing surface is
  `olivia.paradox.ai` itself (the product's own hosted career-site/chat SPA), and the iframe contract
  above is a **narrower, partner-integration-only mechanism**: letting a 3rd-party ATS UI (SAP
  SuccessFactors, an internal recruiter tool) embed a specific candidate's conversation/scheduling/
  settings panel inline, authenticated via a Paradox-minted signed JWT scoped to `OID` + `account_id`.
- This is consistent with the Candidate-entity schema fields found in `endpoint-catalog.md`
  (`use_paradox_status_map`, `hm_cid`) and the SAP/Workday partner pages (`partner-integrations.md`) — an
  **embed-in-partner-UI** integration model, not a **embed-Paradox-in-your-own-website** widget model.
- **Open question:** the JWT *generation* mechanism (who calls what to mint a `jwt_token` for a given
  `OID`/`account_id` pair) is not documented on this page and wasn't found elsewhere in the recovered
  reference catalog — plausibly a field returned inline on another authenticated response (e.g. as part
  of the Candidate object) rather than a dedicated endpoint; not confirmed.
