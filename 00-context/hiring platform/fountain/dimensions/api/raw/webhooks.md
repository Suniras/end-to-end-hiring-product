<!-- source: https://developer.fountain.com/reference/{webhooks,automation-webhooks,custom-attribute-webhooks,universal-tasks-webhooks-onboard,external-processing-api-compliance,webhooks-and-external-api-calls}.md · captured_at: 2026-08-09 · method: docs-reconstructed + verbatim OpenAPI enum (event-type list) -->

# Fountain — Webhook system (at least 4 independently-configured webhook subsystems)

Fountain has NO single unified webhook product — webhooks are configured in at least four different
places in the product, each with its own trigger model, payload shape, and signing convention. This is
itself an architecture finding (echoes the multi-service/no-single-gateway pattern seen in the API host
split).

## 1. Hire "Screening"/"Post-Hire" webhooks (legacy monolith, Company Settings → Webhooks)

**Configured at:** `https://www.fountain.com/{COMPANY_NAME}/webhooks/settings`
**Delivery:** POST to a configured payload URL, JSON body (`applicant` key for screening events, raw
worker-shaped JSON for post-hire events — "same structure as the 'Get Worker Info' API call").
**14 documented event types** (from the `Create Webhook Setting` OpenAPI enum, `Webhooks::Settings::*`):

| Event type | Fires when |
|---|---|
| `ApplicantSave` | an applicant is created or updated |
| `ApplicantStateChange` | an applicant's application state changes |
| `Transition` | applicant moves stages (configurable strategy: first / hired / rejected / archived / all / selected stages) |
| `CheckrStatus` | a Checkr background-check status changes (clear, consider, suspended, engaged, pre_adverse, post_adverse, dispute) |
| `OnfidoStatus` | an Onfido identity-verification status changes (clear, consider) |
| `FunnelSave` | an opening (funnel) is created or updated |
| `HiringGoalChange` | a hiring goal is modified |
| `PartnerStatus` | a partner-integration status changes |
| `FileStatus` | an uploaded file's status changes |
| `PosthireDataCollectionApproval` | post-hire documents/data fields are approved |
| `PosthireWorkerActivation` | a post-hire worker is activated |
| `PosthireWorkerDeactivation` | a post-hire worker is deactivated |
| `PosthireDocumentUploaded` | a document is uploaded for a post-hire worker |
| `LocationSave` | a location is created or updated |

**Retry policy:** 2 retries after initial failure; a webhook failing >10× in 24h is auto-disabled
(requires manual re-enable from the settings page).
**Recommended pattern:** process asynchronously (docs explicitly warn against slow synchronous handlers).
**Signature (optional):** header `X-OBIQ-SIGNATURE-V2`, hex-encoded HMAC-SHA256 of the raw request body
keyed by the account's **Hire Private API token** (i.e. the same secret used for `X-ACCESS-TOKEN` auth —
reusing an auth credential as a webhook-signing secret is a notable design choice: rotating the API key
silently also rotates webhook-signature verification, a coupling worth flagging).
**Egress IPs documented** (15 static IPs) for IP-allowlisting as an alternative to signature verification.

## 2. Automation Webhooks (Settings → Automations → "Send a webhook…" action)

A newer, more general no-code automation-trigger builder: pick worker/applicant source → filter/trigger
condition → "Send a webhook" action. Configurable per-automation:
- **Signing key** (HMAC-SHA256 over the payload) OR a **custom `Authorization` header** (`Basic ...` /
  `Bearer ...`) — i.e. this subsystem lets the *customer* pick Fountain's outbound auth scheme, unlike
  the Hire legacy signature scheme which is fixed.
- Payload = either the full applicant or full worker record (sample worker payload captured is the
  richest single worker-entity schema found this run — `_id`, `uuid`, `companyUuid`, `people.uuid`,
  `customAttributes[]` array of `{customAttributeUuid, key, value}`, `segmentUuids[]`, `securityGroupUuids[]`,
  `employmentStatus.{type,subtype}`, `smsOptOut.*`, `payRateExceptions[]`, `technicalOptions.lockEin`).

## 3. Custom Attribute Webhooks (Settings → Worker Attributes → Manage Webhooks)

Fires on ANY custom-attribute value change for a worker. Payload envelope (distinct shape from #2):
```json
{
  "webhookUuid": "...", "companyUuid": "...",
  "trigger": {"type": "customAttribute", "resourceIdentifier": "<attr-uuid>"},
  "action": "update", "timestamp": "...", "workerUuid": "...",
  "previousState": {"customAttributeUuid": "...", "customAttribute": {...}, "value": "before"},
  "newState":      {"customAttributeUuid": "...", "customAttribute": {...}, "value": "after"}
}
```
Must respond within **3 seconds** (a hard SLA, distinct from the Hire legacy webhook's untimed
"process async" recommendation — a second architecture tell that this is a different backend).

## 4. Universal Tasks Webhooks (Onboard flow builder)

A Universal Task node type with a webhook integration, fired when a worker completes a task or reaches
the end of an onboarding flow. Payload includes a `worker{}` block, a `customAttributes` map keyed by
human-readable label (not UUID — a THIRD distinct key convention across the webhook subsystems), and a
`tasks[]` array with per-task `{title, uuid, status, type, data}`.

## 5. External Processing URL — a synchronous "decision webhook", NOT a notification webhook

Distinct from all four above by design: Fountain **blocks** on the response and lets the partner service
**override the compliance decision**, not just get notified.

- **Timing:** fires after a worker submits a compliance document AND after Fountain's own OCR/AI analysis
  runs, but BEFORE the final document status is committed. Only fires if auto-approval is enabled on that
  document type.
- **Request body Fountain sends:** `storageUuid`, `glareFree` (bool), `inFocus` (bool),
  `aiConfidenceLevel` (number), `manuallyEdited` (bool, tamper signal), `fields[]`, `submittedAt`,
  `submittedByType` (`WORKER`/`EMPLOYER`/`SYSTEM`), `submittedBy`, `workerUuid`, `documentTypeUuid`,
  `workerComplianceProfileUuid`, `isAutoApproved` (what Fountain's own logic WOULD have decided).
- **Required response:** `{"forceAutoApprove": bool, "forceManualReview": bool}` — `forceManualReview`
  wins on conflict; `{false,false}` = defer to Fountain's own logic (the documented "safe fallback").
  Docs explicitly warn about the fail-open risk (`{true,false}` on every call due to a bug = every
  document auto-approved with no human review) — a real compliance/safety footgun the docs call out
  proactively, notable for a background-screening product.
- Confirms Fountain runs an **in-house OCR + AI-confidence-scoring pipeline** for compliance documents
  (`aiConfidenceLevel`, `glareFree`, `inFocus` are Fountain's own computed signals, not pass-through) —
  independent corroboration of the `servicecompliancev2/ai-documenttypes` endpoint found in the catalog.

## Webhook system open questions

- Whether the 4 legacy/automation/custom-attribute/universal-task webhook subsystems share a single
  outbound delivery/retry infrastructure or are genuinely separate code paths (the differing SLA — 3s
  vs "process async" — suggests genuinely separate implementations, not just separate UI entry points).
- No `X-OBIQ-SIGNATURE-V2`-equivalent signing convention documented for subsystems #3/#4 (only #2 lets
  the customer choose a signing key; #3/#4 show no signature header in their sample payloads — open
  question whether they're unsigned).
