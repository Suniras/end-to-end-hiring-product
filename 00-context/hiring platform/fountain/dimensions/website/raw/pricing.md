<!-- source: multiple (see below) · captured_at: 2026-08-09 · method: crawl-clip -->

# Fountain — Pricing (confirmed: NONE disclosed anywhere on the public site)

## Method

Checked every plausible pricing location:

| Location | URL | Result |
| --- | --- | --- |
| Guessed pricing page | fountain.com/pricing | resolves but shows a "Book a one-to-one chat" signup form, not a price list |
| Homepage / nav | fountain.com | no "Pricing" nav item anywhere in the main nav (Solutions / Use Cases / Resources / Company / Sign In) |
| Demo/quote CTA | fountain.com/learn-more | demo-request form only (name, work email, phone, company, job title, region, website) — no price shown, no self-serve checkout |
| Assist product page | fountain.com/assist | mentions **"Transparent per-hire pricing"** and **"No upfront costs"** as qualitative claims but discloses no number |
| India landing page | fountain.com (redirects to India variant) | same "request a quote" pattern, no numbers |
| Subscription Agreement | privacy.fountain.com/policies/en/?name=master-subscription-agreement | JS-gated / returned empty content via WebFetch — legal doc likely has no list pricing anyway (order-form-driven B2B contract); flagged for Chrome-MCP re-check if needed |
| /signup, /signup-apac | fountain.com/signup, /signup-apac | signup/demo funnels, not self-serve pricing |

## Finding

**Confirmed: Fountain discloses zero pricing anywhere on its public marketing site.** Every commercial path (product pages, the guessed `/pricing` URL, demo CTAs, the India variant, the Assist managed-service page) routes to a **sales-assisted "book a demo / request a quote" flow**. The one quasi-pricing signal is qualitative: Assist (the managed/RPO-style sourcing service) advertises **"Transparent per-hire pricing"** and **"No upfront costs"** — implying Assist specifically is billed per successful hire/placement, but no rate is given.

This confirms the Discovery-plan hypothesis that pricing is fully quote-gated — consistent with an enterprise, multi-location, negotiated-per-seat/per-hire B2B SaaS model (further corroborated by the "pricing tailored to your customized product suite" copy on the demo form, implying a modular per-product-line pricing structure: Source / CRM(Pool) / ATS(Hire) / Onboarding / Shift & Scheduling / AI Agents are each licensable pieces).

## Open question

Whether the Master Subscription Agreement (legal doc) discloses a fee-structure schema (e.g., per-applicant, per-hire, per-seat, platform fee + usage) — page returned empty via WebFetch (likely JS-rendered); needs a Chrome-MCP re-fetch to confirm.
