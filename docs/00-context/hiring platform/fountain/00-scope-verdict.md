---
target: fountain
scope_checked_at: 2026-08-09
verdict: accept
verdict_reason: clean
resolved_identity: "https://www.fountain.com/ — Fountain (Fountain On Demand, Inc.), San Francisco-based high-volume/frontline hiring platform. User supplied the exact URL (fountain.com/why-fountain), so identity is fixed — no ambiguity search needed."
suite_product_count: 1
surfaces_present: [codebase?, docs?, api?, website?, session?]
awaiting_user: false
---

# Fountain — Scope Verdict: ACCEPT

## Resolution (what the name resolved to + evidence)

User gave the concrete URL `https://www.fountain.com/why-fountain`. Identity is fixed per Discovery Part A
step 0a (a user-supplied URL skips the ambiguity search). Fountain is a hiring/workforce-management SaaS
platform for hourly/frontline workers, marketed under the umbrella "Frontline Superintelligence."

## Gate trace (which gate fired A–E + the verbatim signal)

- **Gate A (ambiguity):** skipped — identity fixed by user-supplied URL. (Note: "Fountain" is a common
  word with unrelated namesakes — a Bitcoin-payments podcast app "Fountain: Podcast Player" by Fountain
  Labs Ltd., water-fountain-finder apps, a "Fountain Trust Company" bank. None resolve to fountain.com;
  none confused the identity resolution since the URL was explicit. This namesake-density did, however,
  bite the `codebase` dimension probe — see below.)
- **Gate B (ethics):** clean. Frontline hiring/HR SaaS for legitimate retail/logistics/hospitality
  employers — no credential-theft, no scraping-for-resale, no rate-limit-bypass angle. Proceeds under the
  same spec-writing/competitive-analysis frame as every prior batch target.
- **Gate C (suite size):** the marketing nav shows five "Products" (Source, CRM, ATS, Onboarding, Shift &
  Scheduling) plus three named AI agents (Anna, Emma, Sam) plus a separate branded module (Cue, for
  logistics/retail/restaurants/outsourced-services). This reads as **N ≥ 4 on a literal count**, but per
  the Gate-C guard ("one platform, many modules sharing one account/API/pricing page is one product, not
  a suite" — the Stripe Payments/Billing/Connect precedent) — all of these modules are stages of a single
  hire-to-shift pipeline sold as one contract under one platform brand ("Frontline Superintelligence"),
  not independently priced/documented products with their own `/pricing` or `/docs` trees. **Accept as one
  product**, not a suite-narrow.
- **Gate D (primitive):** not a primitive — a full SaaS application with hidden internal architecture
  (a real API host, a real app shell, a real docs portal), not a published spec with no app behind it.
- **Gate E (reachability):** multiple surfaces confirmed live in the cheapest probe pass: `fountain.com`
  200, `app.fountain.com` 200 (a genuine React/webpack SPA shell), `developer.fountain.com` 302→`/reference`
  (a real ReadMe-hosted developer-docs site with a served `llms.txt`), `status.fountain.com` 200
  (Statuspage.io). Well above the reachability floor.

## Verdict & reason

**ACCEPT — clean.** Single product, ethically unproblematic, multiple live surfaces confirmed cheaply.
Proceed to full dimension probing.

## If refused

N/A — not refused.
