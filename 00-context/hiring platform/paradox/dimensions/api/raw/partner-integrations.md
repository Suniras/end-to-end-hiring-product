<!-- source: https://www.paradox.ai/partners/{integrations,workday,sap,indeed} · captured_at: 2026-08-09 · method: crawl-clip -->

# Paradox — Partner integration pages (Workday / SAP SuccessFactors / Indeed)

No formal webhook/callback contract is publicly described on any partner page (that lives only in the
`readme.paradox.ai` API reference — see `endpoint-catalog.md`'s `POST /reporting/reports` callback and
`PUT /interview/interview_alerts` inbound-3rd-party contract). The partner pages are marketing-level, but
each names a specific, checkable **integration mechanism**:

## `/partners/integrations` (the hub page)

- Confirms: "Through direct integrations and our open API, Paradox works with the leading systems, apps,
  and devices you already use today." → links the API Developer Hub (`paradox.readme.io` →
  `readme.paradox.ai`, the discovery that unlocked this entire dimension).
- Lists integration categories: **ATS** (create candidate profiles, manage communications), **Job
  Boards** (advertise open roles), **HCM** (deliver completed new-hire records), **Video interviewing**,
  **Messaging** (3rd-party apps/websites), **Email and Calendar sync** (for automated scheduling).

## `/partners/workday` — "Paradox for Workday"

- **Mechanism named:** "one-click simple step-and-status integration with Workday Recruiting" — when an
  interview is scheduled via Paradox, it "automatically update[s] the candidate's status in Workday."
  This is a **status-sync integration**, consistent with the `status_map_name`/`status_map_ex_id`/
  `use_paradox_status_map` fields found on the Candidate entity schema (a configurable status-code
  translation layer).
- **"Workday Certified for its reliability and accuracy"** on the scheduling integration specifically —
  a named partner-certification badge (also independently corroborated by a
  `paradox.ai/news/paradox-earns-workday-certified-badge-for-scheduling-integration-with-workday-recruiting`
  press item found via sitemap).
- Calendar integrations named: O365/Exchange, Gmail, Teams.
- Compliance claims on this page: SOC 2 Type II, ISO 27001, GDPR, CCPA (cite via `infra-backend-
  fingerprint`'s sub-processor/trust-page mine for corroboration — not independently verified here).

## `/partners/sap` — "Paradox for SAP SuccessFactors"

- **Mechanism named:** a **browser extension** — "Work directly in SAP SuccessFactors Recruiting with
  our browser extension. With step and status integration and browser extension, hiring teams work
  directly from SAP SuccessFactors or their browser to send text messages, review candidates..." This is
  a materially different integration shape from the Workday one: a **client-side browser extension**
  injecting Paradox UI into the SAP SuccessFactors web app, likely using the iframe-modal contract found
  in `embed-iframe-contract.md` (the `sf-iframes` demo path name — "sf" almost certainly = SuccessFactors
  — directly corroborates this).
- No public listing of this browser extension was found on the Chrome Web Store search during this pass
  (not exhaustively verified — flagged as an open question / a `distribution-artifacts` follow-up: if a
  public extension listing exists, its `manifest.json` would be a rich, independent corroboration of the
  SAP integration's actual host permissions and content-script injection points).

## `/partners/indeed` — "Paradox for Indeed"

- **Mechanism named:** "Indeed Apply" integration — candidates "complete entire applications... directly
  through Indeed Apply with our Conversational ATS integration. No more cumbersome redirects to company
  sites." This implies Paradox's application flow is embedded/rendered *inside* the Indeed Apply
  experience itself (an Indeed-side integration, likely Indeed-Apply's own published partner API/embed
  mechanism on Indeed's side, not documented from Paradox's side at all — an Open question, out of scope
  for this dimension to resolve further since it's a 3rd-party (Indeed) surface).

## Cross-reference

The three partner integrations map to **three distinct technical mechanisms** — Workday: server-to-server
status-sync API; SAP SuccessFactors: client-side browser extension + iframe embed; Indeed: embedded-apply
flow inside a 3rd party's own product — not one uniform "connector" pattern. This is a genuine finding
about Paradox's integration architecture: it adapts the mechanism per-partner rather than exposing one
generic webhook/connector framework for all of them.
