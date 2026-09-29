<!-- source: help.fountain.com/en/ (== support.fountain.com/en/) · captured_at: 2026-08-09 · method: crawl-clip (partial — client-rendered) -->

# End-user help center (distinct from developer docs)

Both `support.fountain.com` and `help.fountain.com` HTTP-302-redirect to `https://help.fountain.com/en/`
— a **real, live, branded Intercom-hosted help center**:

- `<title>`: "Home | Worker Experience Help Center"
- Intercom app/workspace identifier: **`onboardingiq`** (visible in the favicon path
  `intercom.help/onboardingiq/assets/favicon` and the page route
  `page":"/[helpCenterIdentifier]/[locale]/landing","query":{"helpCenterIdentifier":"onboardingiq"`)
  — **the same "OnboardIQ" legacy product name** surfacing here as in the `connecting-a-custom-form-to-
  the-onboardiq-applicant-portal` doc slug and the `X-OBIQ-SIGNATURE-V2` webhook header (see
  raw/integrations-partners.md and raw/webhooks.md). Three independent surfaces now corroborate
  "OnboardIQ" as a real predecessor product name still embedded throughout Fountain's infrastructure
  naming, well after the "Fountain" rebrand.
- The page ships **9 visual collection cards** (collection IDs `5615740, 6660671, 7805117, 7853074,
  9241028, 9818092, 10316714, 10971012, 14419915`), each with a custom background image — i.e. the help
  center has real, populated top-level categories — but the category **titles** are fetched client-side
  after hydration and were not recoverable via static `curl`/WebFetch in this pass (a raw-HTML grep for
  an empty-state string was a false positive — that string is part of Intercom's static i18n dictionary
  bundled into every page load, not an indicator that this specific help center is actually empty).
- The Intercom "Fin" AI support-chat widget is present and end-user-facing (`"Ask Fin a question"` / `Fin
  AI` search-assist copy in the loaded i18n bundle) — Fountain uses **Intercom Fin** for support-chat AI,
  a named third-party AI vendor in the support stack, distinct from Fountain's own "Emma" 24/7-support
  AI-agent marketing claim. This is worth flagging directly to evaluation: **if "Emma" turns out to be
  Intercom Fin under a custom persona name, that materially changes the read on Fountain's in-house AI
  investment** for the support use case specifically (does not bear on Anna/Sam/Cue). Not confirmed
  either way from this pass — a session/website-dimension cross-check (does the live product's support
  widget show Intercom branding or network calls to `intercom.io`/`intercom.help`?) would resolve it.

## Open questions

- The 9 collection titles/descriptions (client-rendered, not recovered by static fetch — a `session` or
  `website` dimension driving a real browser could recover these cheaply).
- Whether "Emma" (Fountain's marketed 24/7 AI support agent) is built on Intercom Fin or is a separate,
  in-house system — flagged above as a direct, checkable hypothesis for the session/website dimensions.
