<!-- source: developer.fountain.com/reference/{webhooks,automation-webhooks,custom-attribute-webhooks,universal-tasks-webhooks-onboard,webhooks-and-external-api-calls,external-processing-api-compliance}.md · captured_at: 2026-08-09 · method: crawl-clip -->

# Webhooks & synchronous external-processing hooks

Fountain has **at least four distinct, independently-configured webhook mechanisms** plus one
synchronous (non-webhook) external-decision hook — evidence of the product having grown webhook surface
incrementally per-product-line (Hire, Onboard, WX) rather than one unified event bus.

## 1. Hire Webhooks (legacy, `v2` / Company Settings → Webhooks)

- **Screening webhooks**: fire on Stage Transition (First/Approved/Rejected/On-Hold/All/Selected
  stages) and on background-check status change (Checkr: Cleared/Considered/Consider-Engaged/
  Pre-Adverse/Post-Adverse/Suspended/Dispute; Onfido: Clear/Consider).
- **Post-Hire webhooks**: Worker Activated/Deactivated, Document Uploaded, Documents Approved
  (Posthire = the post-hire/worker-management product line).
- Delivery: POST, JSON, retried **2x** on failure; disabled automatically after **10 failures in 24h**
  (re-enable manually).
- **Signature verification**: `X-OBIQ-SIGNATURE-V2` header, HMAC-SHA-256 over the raw body using the
  Hire Private API Token as the HMAC secret ("OBIQ" is a legacy internal product codename surfacing in a
  header name — a naming-archaeology tell, pre-dating the "Fountain" brand or an acquired-product
  artifact).
- **Static egress IP allowlist published** (15 IPs, all AWS ranges spanning multiple regions —
  us-east-1, us-west-2, eu-west-1-class ranges by inspection) for customers who want to IP-allowlist
  Fountain's outbound calls — a direct AWS-hosting confirmation independent of any other dimension.
- 14 `Webhooks::Settings::*` typed events available via the `POST /v2/webhook_settings` API (see
  api-reference.md — WebhookSetting schema): ApplicantSave, ApplicantStateChange, Transition (with
  configurable strategy: first/hired/rejected/archived/all/selected), CheckrStatus, OnfidoStatus,
  FunnelSave, HiringGoalChange, PartnerStatus, FileStatus, PosthireDataCollectionApproval,
  PosthireWorkerActivation, PosthireWorkerDeactivation, PosthireDocumentUploaded, LocationSave.

## 2. Automation Webhooks (Settings → Automations → Create automation)

A newer, more general no-code trigger builder: pick a **worker or applicant source**, a
trigger/filter combination, and "Send a webhook" as the action. Supports a **Signing key** (HMAC-SHA256)
OR a custom **Authorization header** (Bearer/Basic) per-webhook — a more flexible auth model than the
legacy mechanism. Sample worker payload shows a rich `customAttributes[]` array
(`requirement_drivers_license_status`, `in_compliance`, `onboard_status`, `preboarding_type_flows_
completed`, etc.) — confirms a generic custom-attribute framework backs compliance/onboarding state
tracking, not hardcoded fields.

## 3. Custom Attribute Webhooks (Settings → Worker Attributes → Manage Webhooks)

Fires on **any** custom attribute value change for **any** worker; payload includes
`previousState`/`newState` diff with the full `customAttribute` definition (label, dataType, key,
readOnly/hidden/protected flags) embedded — i.e. attribute *metadata* travels with every event, not just
IDs. **3-second response SLA** enforced (tightest of any Fountain webhook).

## 4. Universal Tasks Webhooks (Onboard)

Configured per-Universal-Task inside a task flow; fires on task completion or flow-end. Payload nests
`worker` + `tasks[]` (per-task `status`, `type`, and a `data` bag that can include `w4Profile`,
`i9Profile`, `hirePapiProfile` — all `null` unless that task type populated them).

## 5. External Processing URL (compliance documents) — NOT a webhook, a synchronous decision hook

The most architecturally interesting integration point found in the docs. Distinguishing table (verbatim
from the doc):

| | External Processing URL | Webhook |
| --- | --- | --- |
| Timing | Called *before* the document status is set | Called *after* the event happened |
| Fountain waits for response | Yes — holds document in processing state | No — fires and moves on |
| Response changes outcome | Yes — can force approval or manual review | No |

**Full sequence:** worker uploads doc → Fountain's own OCR engine reads it (glare/focus detection, field
extraction, confidence scoring) → Fountain's auto-approval logic evaluates → **Fountain calls your URL**
with a JSON summary (`glareFree`, `inFocus`, `aiConfidenceLevel`, `manuallyEdited`, `fields[]`,
`isAutoApproved` — Fountain's own tentative verdict) → your service returns
`{forceAutoApprove: bool, forceManualReview: bool}` → Fountain records the final status.

- Only fires if **auto-approval is enabled** on that document type.
- **10-second timeout**; on timeout/error/non-200, Fountain silently falls back to its own logic — "your
  team will not be notified through the UI."
- `forceManualReview: true` always wins if both are true. The safe default the docs explicitly recommend
  is `{false, false}` (defer to Fountain), warning explicitly against a buggy fallback of
  `{true, false}` which would "silently approve" every document on your error path.

**This is a genuine, first-class AI/OCR document-processing pipeline** (glare detection, focus detection,
a confidence score, an auto-approval verdict) that Fountain runs itself, with an extensibility hook that
lets a customer's own logic **override** Fountain's own AI's decision synchronously — a materially more
sophisticated integration pattern than the fire-and-forget webhooks above, and direct evidence that
Fountain's OCR/compliance-document AI is real production infrastructure, not just a claimed capability.

## Open questions

- Whether all four webhook mechanisms share one delivery/retry infrastructure or are genuinely four
  separate implementations (the differing retry/SLA numbers — 2 retries/10-failure-disable for Hire vs a
  flat 3-second SLA for Custom Attribute webhooks vs no stated retry policy for Automation/Universal
  Tasks webhooks — suggest they are NOT unified, but this is inferred from documentation gaps, not
  confirmed).
- OCR/AI vendor: whether the document OCR is Fountain-built or a wrapped third party (Onfido does
  identity-document OCR elsewhere in the product for background checks — docs don't say whether the
  Compliance-document OCR is the same vendor/pipeline).
