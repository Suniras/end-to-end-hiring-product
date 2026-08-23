---
scope: accept
target: paradox
corpus_root: research/
access_grade:
  source: { value: partial, confidence: high, evidence: "GitHub org github.com/ParadoxAi is CONFIRMED genuine (not a namesake): name='Paradox', blog='https://paradox.ai' (exact match), email='info@paradox.ai', created 2017-01-03 (consistent with the company's ~2016 founding). 5 public repos, none of which are the core product: pdfgen-python, pdf-lib (fork/mirror of the well-known generic library — verify it's not just a starred fork), packer-plugin-salt (HashiCorp Packer + SaltStack infra-provisioning plugin), celery.node (a Node port of Python Celery), scim2-models (a published PyPI package, confirmed 200 on pypi.org — SCIM v2 data models, meaning Paradox does enterprise identity/user-provisioning via SCIM, a real integration-architecture signal)." }
  runtime: { value: reachable, confidence: high, evidence: "olivia.paradox.ai (302, the candidate-chat/recruiter-login portal) and api.paradox.ai (403, body = {\"message\":\"Missing Authentication Token\"} — the literal AWS API-Gateway-Lambda-proxy error string, confirming a live AWS-hosted backend) both resolve. No public developer docs subdomain (docs./developer. both non-resolving) — the API is real but not published for self-serve integration." }
  auth: { value: none, confidence: high, evidence: "Same batch-wide default as Fountain: outside-only/no-login, user unreachable to authorize a session for this run." }
  presence: { value: rich, confidence: high, evidence: "Very rich marketing site with 20+ named enterprise logos (Chipotle, 7-Eleven, Tractor Supply, Ace Hardware, Compass Group, Sodexo, Marriott, IHG, Medtronic, Houston Methodist, GM, Nestlé, Johnson Controls, Great Wolf Lodge, Fontainebleau Las Vegas); a hosted Helpjuice knowledge base (paradox.helpjuice.com); a live Statuspage instance; a careers subdomain; a confirmed native iOS app ('Olivia by Paradox - CEM', publisher 'Paradox, Inc' — legal-name corroboration of the GitHub org). NO public developer/API docs presence at all — presence is rich on the marketing/support/community axis but genuinely thin-to-absent on the api/docs-for-integrators axis specifically." }
matched_case: "Case-2/Case-1-hybrid, thinner than Fountain on source (utility repos only, no core-product mirror) but WITH a genuine native distribution artifact (the iOS app) that Fountain lacks — a structurally different dimension-availability shape from its paired target, which is itself a useful comparison point."
pass2: not-applicable
hypotheses:
  - "api.paradox.ai is enterprise-partner-only (Workday/SAP SuccessFactors/Indeed connector traffic + the native app), never intended for general self-serve developer integration — UNVERIFIED, the api collector should still probe for any public-facing webhook/embed-script contract (a conversational widget embed script is a very plausible public-but-undocumented surface for a chat-based product) before concluding 'no public API surface at all.'"
  - "The 'Conversational X' product family (ATS/Career-Sites/Apply/Scheduling/Events/CRM) is built on ONE underlying conversational engine (Olivia) with per-surface UI skins, not seven separately-engineered products — UNVERIFIED, a reasonable architecture guess from the naming convention alone, re-derive from the bundle/session evidence rather than assuming."
  - "scim2-models (PyPI, real) suggests Python is used somewhere in Paradox's identity/provisioning stack, and celery.node suggests a Node service also exists — UNVERIFIED whether this is a genuinely polyglot backend or the utility repos are legacy/abandoned side projects; check repo last-commit dates in Ingestion before promoting to an architecture claim."
---

# Paradox — Recon Plan

## Dimension availability

| # | Dimension | Status | Evidence | Planned method |
| --- | --- | --- | --- | --- |
| 1 | **codebase** | ⚠️ partial | Confirmed-genuine `ParadoxAi` GitHub org, 5 small utility repos (no core app) | `clone-and-map` on the 5 repos |
| 2 | **docs** | ⚠️ partial | No developer-docs subdomain; `paradox.helpjuice.com` is a genuine hosted KB but it's end-user/admin product help, not integration docs | `crawl-clip` of the Helpjuice KB (treat as product documentation, not API docs) |
| 3 | **packages** | ⚠️ partial | `scim2-models` confirmed live on PyPI; `pdfgen-python` NOT on PyPI (404) despite being a GitHub repo name — check npm/PyPI more precisely per-repo in Ingestion rather than guessing | `registry-metadata` for whichever of the 5 repos are actually published |
| 4 | **api** | ⚠️ partial | `api.paradox.ai` is live (AWS API Gateway) but returns a generic auth-wall error with no public spec, no docs subdomain, no self-serve portal | `docs-reconstructed` (low) — likely capped low/partial; check for an embeddable widget script (a public JS embed is plausible for a chat product and would be a real, if undocumented, API surface) |
| 5 | **website** | ✅ available | Rich nav + 20+ named enterprise customers + case studies + partner-integration pages (Workday/SAP SuccessFactors/Indeed) | `crawl-clip` |
| 6 | **community** | ✅ available | `/blog` resolves 200 on main domain; "The Conversation" content hub and "Reports" section named in nav; Statuspage component list | `crawl-clip` (first-party only) |
| 7 | **session** | ❌ absent | `auth:none` — not dispatched (batch default) | `status: absent` |
| 8 | **deployed-client-bundle** | ✅ available | `olivia.paradox.ai` (302, the login/chat portal shell) is a real SPA worth bundle-mining for route table + API-path catalog | `bundle-string-mine` |
| 9 | **infra-backend-fingerprint** | ✅ available | AWS API Gateway confirmed on `api.paradox.ai`; Statuspage component list; Security page linked from footer (Support section) for sub-processor mining; crt.sh sweep pending (timed out in Discovery, retry in Ingestion) | `dns-ct-fingerprint` + sub-processor fold-in |
| 10 | **wire-capture** | folded → session | No separate non-browser wire target beyond the confirmed native app (see #11) | `status: folded` |
| 11 | **distribution-artifacts** | ✅ available | **Confirmed native iOS app: "Olivia by Paradox - CEM", publisher "Paradox, Inc"** (App Store, id 1330936756) — a genuine distribution artifact, unlike Fountain. Extract `Info.plist`-visible metadata (permissions, ATS exceptions) from the public App Store listing + any public IPA-adjacent metadata; do NOT attempt to sideload/decompile without checking the EULA per ingestion §7.2 | `binary-extract` (metadata-level; full decompile only if EULA permits) |

## Notable early leads (not facts — re-derive during Ingestion)

- The App Store listing itself (description, screenshots, "What's New" changelog) is a legitimate,
  citable public artifact — mine it for feature claims and release cadence, corroborating/contrasting the
  website's marketing claims (a same-company, different-medium source — useful for the community/
  competitive-positioning cross-check).
- `pdf-lib` as a GitHub repo name under `ParadoxAi` is suspicious for name-collision with the extremely
  popular independent open-source library `Hopding/pdf-lib` — verify in Ingestion whether this is a fork,
  a vendored copy, or a genuinely distinct Paradox-authored library before citing it as Paradox's own code.
- `packer-plugin-salt` (HashiCorp Packer + SaltStack) is an unusually old-school infra-provisioning
  combination for a 2016-founded company — worth checking repo age/staleness; may indicate a legacy
  on-prem/VM-based deployment lineage predating a later containerized/cloud-native rewrite (a real,
  citable architecture-evolution signal if corroborated).

## Gating / ethics flags

No gated dimensions dispatched (`auth:none`, `wire-capture` folds to an absent `session`). The App Store
metadata mine (distribution-artifacts) stays at the public-listing level — no purchase, no login, no
device-level extraction. Standard redaction discipline applies to all captures per ingestion §7.
