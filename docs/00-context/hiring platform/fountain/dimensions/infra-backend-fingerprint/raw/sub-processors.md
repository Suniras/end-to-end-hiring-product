<!-- source: fountain.com/security, trust.fountain.com (Vanta), privacy.fountain.com (Transcend),
     fountain.com/ethical-ai, apex TXT records · captured_at: 2026-08-09 · method: dns-ct-fingerprint -->

# Fountain — sub-processor / vendor-stack fold-in

## Direct-fetch results (WebFetch)

| Page | URL | Result |
| --- | --- | --- |
| Trust Report | `https://www.fountain.com/trust` | **404** — the footer link's actual live host is `trust.fountain.com` (a Vanta-powered Trust Center), not a `/trust` path on the marketing domain |
| Security | `https://www.fountain.com/security` | 200, text content retrieved — see below |
| Ethical AI | `https://www.fountain.com/ethical-ai` | 200, text content retrieved — **no AI/LLM vendor named** |
| Legal hub | `https://www.fountain.com/legal` | 404 — not the right path |
| Privacy | `https://www.fountain.com/privacy` | 301 → `privacy.fountain.com` (Transcend-powered, JS-rendered SPA — text content not retrievable via static fetch, see gap) |
| Trust Center (actual) | `https://trust.fountain.com` | 200, JS-rendered Vanta widget shell — page title only via static fetch ("Fountain Trust Center"); vendor list recovered **indirectly** via the page's own CSP header instead (see below) |

## `/security` page — verbatim-adjacent findings

- States AES-256 for documents at rest, TLS/HSTS for transport, "third-party security vendors to
  perform audits" (**vendor NOT named** on-page).
- References a downloadable **Security Whitepaper** (PDF, not fetched — likely gated or requires a
  direct link not surfaced in the crawled text) and points to `trust.fountain.com` for the full report.
- Does **not** name: cloud infra provider, AI/LLM provider, payment processor, specific hosting region,
  or any compliance certification (SOC2/ISO27001/GDPR/HIPAA) in the crawled text — all of that detail is
  gated behind the Vanta trust report and/or the whitepaper PDF, neither of which yielded text via
  static fetch (**recorded as an Open question, not fabricated**).

## `/ethical-ai` page — the direct test of the "AI Agents" hypothesis

**No named AI/LLM model provider anywhere on the page.** The three agents (Anna — AI Recruiter/
screening, Emma — AI 24/7 Support, Sam — AI Satisfaction/retention) are described only functionally
("Screens candidates while you sleep", "Every form, before day one", "Engage. Retain. Repeat"), plus a
"Frontline Superintelligence" platform tagline. **No mention of OpenAI, Anthropic, Google, Azure OpenAI,
or "our own models."** This is a genuine disclosure gap on the page built specifically to talk about AI
ethics — notable in itself.

## Indirect vendor recovery — via CSP headers (since the Trust Center / Privacy pages are JS-rendered)

Two CSP headers (captured in `security-headers.md` / `cloud-cdn-fingerprint.md`) carry an extensive,
**verbatim, machine-emitted** allow-list of vendor hostnames. Cross-referencing both pages' CSPs against
the apex TXT domain-verification records produces the fullest vendor-stack picture this dimension can
recover without JS execution:

### Cloud / infra

| Vendor | Evidence |
| --- | --- |
| **Cloudflare** | edge/CDN/DNS for the whole zone; Turnstile bot-challenge (`challenges.cloudflare.com` in trust.fountain.com CSP) |
| **AWS** | S3 buckets (`onboardiq-secure-*`, `fountain-applicant-uploads`, `pr-onboardiq-secure-*`, `duploservices-prod01-*`, `prod-backend-company-uploads-transcend-io`), AWS Transfer Family (`ups-ftp.fountain.com`), region-coded internal host (`euw3-ms-nlu.internal`) |
| **DuploCloud** | AWS infra-orchestration/DevOps-automation SaaS — inferred from `duploservices-prod01-*` S3 bucket naming convention in the Vanta trust-center CSP |
| **Render.com** | hosts the ReadMe-powered developer/partners docs portal (`x-render-origin-server` header) — ReadMe's infra choice, not Fountain's own |
| **WP Engine** | hosts the WordPress blog (`x-powered-by: WP Engine`) |

### AI / LLM — the headline finding

| Signal | Read |
| --- | --- |
| **`anthropic-domain-verification-8b8te9=<token>` TXT record on the apex zone** | Fountain has verified `fountain.com` with **Anthropic** — this is the domain-verification flow used for a Claude/Anthropic **enterprise or org-level account** (e.g. Claude for Work/Enterprise SSO, or an API console org). **This is direct, first-party evidence Fountain has an Anthropic relationship at the organizational level.** It does **not**, by itself, prove the customer-facing agents (Anna/Emma/Sam/Cue) are powered by Claude — it could equally reflect internal tooling (engineering using Claude) — but it is the single most concrete "named AI vendor" signal recovered across every surface probed (marketing, security, ethical-ai, trust pages all stayed silent). |
| `cursor-domain-verification` TXT | Cursor (AI coding IDE) — engineering-tooling signal, not customer-facing AI |
| No OpenAI/Google/Azure-OpenAI/Cohere host in any CSP allow-list observed | absence noted — the client-side CSPs never reference an LLM vendor host directly, consistent with any LLM calls being brokered fully server-side (expected/good practice) rather than evidence of no LLM use |
| `browserbase.com` + `*.onkernel.com` in trust.fountain.com CSP `frame-src` | **Browserbase** and **Kernel** are both headless-browser/agent-sandbox infrastructure vendors (2024-25-era "browser infra for AI agents" category) — this is a strong **agentic-tooling** signal (an AI agent that drives a headless browser to interact with external systems), independent of which LLM sits behind it |
| `euw3-ms-nlu.internal.fountain.com` (DNS finding, see dns-and-subdomains.md) | an in-house NLU microservice on AWS eu-west-3 — some "AI" functionality may be classic in-house NLP/ML rather than an LLM call at all |

**Net read (inference, not fact):** Fountain has an organizational relationship with Anthropic and runs
agent-sandbox infra (Browserbase/Kernel) alongside at least one in-house NLU microservice. Whether the
marketed Anna/Emma/Sam/Cue "AI Agents" are LLM-orchestrated (and by which vendor) versus classic
rules+NLU relabeled as "agentic" **remains only partially resolved** — the Anthropic domain-verification
is the closest thing to a smoking gun this dimension found, but it stops short of confirming the
product-facing agents call Claude specifically. Flag for `session`/`deployed-client-bundle` follow-up:
grep the SPA bundle for `anthropic`/`claude`/`openai` string literals or a `/ai/chat` proxy endpoint name.

### SaaS / product vendors (customer-facing or product-adjacent)

| Vendor | Role | Evidence |
| --- | --- | --- |
| **Stripe** | payments | `js.stripe.com`, `merchant-ui-api.stripe.com` in app CSP + `npm.stripe` vendor chunk (Discovery) — likely background-check/verification fee collection during onboarding |
| **Cronofy** | calendar/interview-scheduling API | `api.cronofy.com` in app CSP `connect-src` |
| **Pusher** | realtime (multi-region: mt1/us2/eu/ap2 clusters) | `sockjs-*`/`ws-*` pusher hosts in app CSP |
| **Merge.dev** | unified HRIS/ATS integration API | `cdn.merge.dev` in trust-center CSP — plausibly the engine behind the docs-catalogued "HRIS Sync" endpoint |
| **VONQ** | job-ad distribution marketplace | `elements.hapi.vonq.com`, `marketplace.api.vonq.com` in app CSP |
| **CameraTag** | video-interview recording | `cameratag.com` + regional asset hosts in app CSP `media-src` |
| **NimbleCapture** | form/lead capture | `api.nimblecapture.com`, `r.nimblecapture.com` in app CSP |
| **OneSchema** | CSV import UX | `oneschema.co` in trust-center CSP `frame-src` — plausibly bulk applicant/employee import |
| **Vanta** | compliance automation / public trust report | `assets.vanta.com`, `vanta.com` — trust.fountain.com is literally rendered by Vanta |
| **Transcend** | privacy/consent/DSR management | `api.transcend.io`, `prod-backend-company-uploads-transcend-io.s3.amazonaws.com` — privacy.fountain.com is a Transcend-hosted app |
| **Vouch** | commercial insurance (for startups) | `apply.vouch.us`, `auth.vouch.us`, `quote.vouch.us` in trust-center CSP `frame-src` — unclear fit; open question whether this is a genuine product integration (e.g. workers-comp/insurance verification in a hiring flow) or an unrelated internal/back-office use folded into a shared CSP template |
| **Bird (MessageBird)** | CPaaS (SMS/WhatsApp) | `bird-domain-verification` TXT — plausible candidate-messaging channel |
| **Chameleon** | in-app product-led onboarding | `trychameleon.com` in trust-center CSP |
| **LeanData** | B2B lead routing (Salesforce ecosystem) | `app.leandata.com`, `cdn.leandata.com` — likely Fountain's own sales-ops tooling, not customer-facing |
| **Intercom** (+ **Fin.ai**) | in-app support chat + AI support bot | `widget.intercom.io`, `api-iam.intercom.io`, CSP references to `fin.ai` domains on the Intercom-hosted `support.fountain.com` — Fin.ai is Intercom's own AI agent product, notable since Fountain's "Emma" (24/7 AI support) could plausibly be built on top of Intercom+Fin rather than a bespoke agent — **unconfirmed, flag for session/bundle follow-up** |
| **Zendesk** | help-widget assets (`static.zdassets.com`, `ekr.zdassets.com`) co-present with Intercom in app CSP | possible legacy/migration-in-progress, or Zendesk used for a different queue than Intercom |
| **OneSignal** | push notifications | `cdn.onesignal.com`, `onesignal.com` |
| **Customer.io** | customer messaging / CDP | `cdp.customer.io` |
| **Appcues** | product-tour/onboarding | `fast.appcues.com`, `api.appcues.net` |
| **FullStory** | session-replay analytics | `edge.fullstory.com`, `rs.fullstory.com` |
| **Datadog** | RUM + logging | `logs.browser-intake-datadoghq.com`, `rum.browser-intake-datadoghq.com`, CSP `report-uri` on trust.fountain.com |
| **Google Analytics** | web analytics | `www.google-analytics.com`, `ssl.google-analytics.com` |
| **Heap Analytics** | product analytics | `heapanalytics.com` (trust-center CSP) |
| **gist.build** | unidentified queue/consumer API | `gist-queue-consumer-api.cloud.gist.build/api/v2/users` in app CSP — **open question**, vendor/purpose not identified from public surfaces |

### Back-office / internal-only (from SPF + TXT verification records — org-maturity signal, not customer-facing)

Google Workspace, Microsoft 365, Chargebee (billing), Salesforce (CRM), NetSuite (ERP), Mailjet
(transactional email), Klaviyo (marketing email), Rippling (Fountain's own internal HRIS — notable
irony for a hiring-software company), 1Password, Linear, Notion, Miro, Reachdesk, Atlassian
(Jira/Confluence and/or the Statuspage relationship), MongoDB (Atlas org — a NoSQL datastore signal),
Apple, Facebook/Meta Business.

## Open questions

- The Vanta Trust Report and Transcend privacy-policy **page bodies** could not be read via static
  fetch (both are heavy client-rendered SPAs) — a full JS-execution pass (browser-driven, e.g. via the
  `session`/cartography browser singleton, read-only) would likely recover the **explicit named
  sub-processor list + certifications** (SOC2/ISO27001/GDPR) that Vanta trust pages typically publish
  verbatim. Recorded as a genuine capture gap, not asserted as "no certifications."
- Whether Anna/Emma/Sam/Cue call Anthropic's Claude specifically (vs. an in-house NLU/rules engine, vs.
  another LLM vendor entirely) is **not resolved** — the domain-verification TXT record is suggestive,
  not conclusive. Follow-up: `deployed-client-bundle` string-mine of the `app.fountain.com` webpack
  bundle for `anthropic`/`claude`/`openai`/`bedrock` literals or an `/ai/*` proxy route name.
  `session` (if ever authorized) triggering an Anna/Emma interaction and inspecting the response latency/
  headers would be the strongest confirmation.
- `gist-queue-consumer-api.cloud.gist.build` and the Vouch (`vouch.us`) integration are unidentified in
  purpose — neither maps cleanly to a known category from public information alone.
- The Security Whitepaper PDF (linked from `/security`) was not fetched — may contain the explicit
  cloud-provider/certification disclosure the on-page text omitted.
