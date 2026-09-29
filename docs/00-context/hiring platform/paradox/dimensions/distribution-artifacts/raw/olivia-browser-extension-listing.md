<!-- source: itunes.apple.com/lookup (id=6747236880, entity=macSoftware), apps.apple.com/us/app/olivia-extension/id6747236880 · captured_at: 2026-08-09 · method: binary-extract (public listing + screenshot assets only, no .app/extension bundle downloaded) -->

# Olivia Extension — a THIRD distribution artifact (Mac App Store, Safari Web Extension wrapper)

Not named in the Discovery hand-off — found by pulling the full app catalog for Paradox's iOS/Mac
developer account (`itunes.apple.com/lookup?id=1290013605&entity=software`), which returned 3 apps, not
1. This is the extension-type artifact the dimension contract calls out (`raw/extension-manifest.md`
territory) — but because Apple wraps Safari Web Extensions inside a signed macOS app rather than a raw
CRX, the manifest itself is not retrievable from the public listing without downloading + unpacking the
`.app` (out of scope for this metadata-only pass; recorded as an open question, not attempted).

## Identity

| Field | Value |
| --- | --- |
| Track name | Olivia Extension |
| Bundle ID | `ai.paradox.brext` (`brext` = **br**owser **ext**ension) |
| App Store ID | 6747236880 |
| Distribution | Mac App Store (`mt=12` — macOS, not iOS) |
| Category | Productivity |
| Content rating | 4+ |
| Min OS | macOS 10.14+ |
| Size | ~2.98 MB — small, consistent with a thin Safari-extension wrapper shell (the real logic runs as a web extension against Paradox's hosted backend) |
| Languages | English only (vs. the flagship app's 35 languages) — a much less mature, English-first, likely US-market-first rollout |
| Original release | 2025-06-16 |
| Current version | 2.5.5, updated 2025-10-14 |
| Release notes (2.5.5) | "Bug fixed, add features" — minimal/low-effort changelog text, a soft signal this is a smaller, less operationally mature product line than the flagship CEM app |
| Rating | 0 ratings — too new/low-adoption to have public review signal |

**Recency is itself a finding**: released June 2025, i.e. well after the flagship CEM mobile apps
(2018) — this is a **new go-to-market motion** for Paradox, not a legacy artifact.

## Description (verbatim)

> "Paradox is an AI company that helps companies capture and screen candidates, improve conversions, and answer all candidate questions.
> Note: You need a Paradox account to use this extension. Request access and learn more about Paradox on our website: www.paradox.ai"

Confirms this is **not a self-serve public tool** — gated behind an existing Paradox customer account,
consistent with the rest of the product's B2B-enterprise-only distribution model.

## Screenshots (4 of 4) — what the extension actually does

All four screenshots show the same staged scenario: a browser window with a **LinkedIn feed visible in
the background** ("My Network", "Jobs", "Write article" — LinkedIn's own chrome) and a Paradox-branded
floating panel overlaid on top of/beside LinkedIn's own messaging UI. Demo participant names/emails
visible in the chat mockups are Paradox's own scripted demo personas, not real end users — paraphrased
rather than quoted verbatim below per redaction discipline.

| # | Headline copy | What it shows |
| --- | --- | --- |
| 1 | "Hi, I'm Olivia. The AI Assistant that helps teams get recruiting work done faster." | Pure brand/intro slide — Olivia personified as a named human-like avatar/persona in the marketing art (a recurring Paradox branding choice, also seen on the flagship app's loader screen). |
| 2 | "Answer questions anytime, anywhere. An interface where you can be responsive right when candidate attention is at its peak." | The extension injects a **floating chat-overlay panel on top of LinkedIn's own messaging surface**, showing a candidate conversation thread (candidate asking who they'll be meeting, a scripted reply naming an interviewer/title) with a reply compose box at the bottom. |
| 3 | "Easily schedule new interviews. Manually schedule new interviews and get informed on your upcoming interviews." | A **date/time-slot picker overlay** (day-of-week header, a grid of half-hour slots, a running list of "will be given the choice of" proposed windows) injected into the same LinkedIn-messaging context — the recruiter can build and send an interview-scheduling proposal without leaving LinkedIn. |
| 4 | "Instantly add new candidates. You can now add candidates while on LinkedIn (or whichever tab for that matter)." | An **"Add New Candidate" form overlay** (first name / last name / phone / email / location-name dropdown fields, "Add Candidate" / "Add & Schedule" buttons) injected into the page — explicit copy confirms this works on **any tab**, not just LinkedIn, implying broad host-permission scope (`<all_urls>`-class, not a LinkedIn-only content-script match pattern) even though every screenshot stages it against LinkedIn specifically. |

## Inferences (flagged as inference, not observed fact)

- **This is a LinkedIn-Recruiter-embedded sourcing companion**: it lets a recruiter sourcing candidates
  on LinkedIn capture a lead into Paradox's ATS pipeline, message them, and schedule an interview — all
  without context-switching to the Olivia CEM console or LinkedIn's own tools. This is a genuine
  **sourcing-workflow integration** that is not mentioned anywhere in this run's `website`/`docs`
  captures (per Discovery's plan) — a likely case of **unmarketed-but-real depth**, the kind Cartography
  looks for, surfaced here instead because this run has no live product to walk.
- The claimed "whichever tab for that matter" scope, if the extension manifest truly requests
  broad/all-site host permissions, would be a notable trust/security-review data point for competitive
  or security positioning — **unverified**, since the manifest itself was not extracted (would require
  downloading the signed `.app` and inspecting its embedded `Info.plist`/extension bundle, out of scope
  for this metadata-only pass).
- A Chrome Web Store equivalent was searched for (`chromewebstore.google.com/search/paradox+olivia`) but
  the search results page is JS-rendered and did not yield a confirmable result via static fetch —
  **recorded as an open question (not confirmed absent)**, consistent with the batch lesson to verify
  absence claims rather than assume them; a live-browser check would resolve this cheaply if revisited.
