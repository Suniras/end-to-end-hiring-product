<!-- source: itunes.apple.com/lookup screenshotUrls (id=1330936756), fetched images viewed directly · captured_at: 2026-08-09 · method: binary-extract (public listing assets, no app install) -->

# Olivia by Paradox - CEM — App Store screenshot catalog (the surrogate UI walk)

Since this run has `auth: none` (no live authenticated `session` dimension), these **first-party
marketing screenshots of the actual product chrome** are the richest available visual source of the
real recruiter-facing UI for this run — treated here as a Cartography-lite surface inventory. All
names/emails visible are Paradox's own scripted demo/placeholder data used in their marketing assets
(fictional candidates "Ollie Floyd", "Violet Brekke" etc., fictional demo company "ENZO", a demo tenant
"Stephen's Marriott Test", a demo email address) — no real end-user PII is present, but names/emails are
paraphrased rather than repeated verbatim below as a redaction-discipline default.

## iPhone screenshots (3 of 3 — 5.5" display frame)

| # | Filename tell | What it shows |
| --- | --- | --- |
| 1 | `5.5''-Loader.png` | Splash/launch screen: teal brand background, tagline "Say Hello to Olivia, you may just fall in love," phone mockup showing the Paradox "P" logomark loading screen. Pure marketing framing, not a functional screen. |
| 2 | `5.5''-Inbox.png` | **Candidate list ("All Candidates", "999+ Candidates" badge)** — the recruiter's primary triage view. Each row: candidate name, elapsed-time-since-activity (10h/10m/10d/10 weeks), role/department (e.g. "Restaurant & Food Services", "Human Resources", "Cashier"), a rough location field, a workflow-status line (**Interview Scheduled / Interview Pending / Interview Canceled / Capture Incomplete**), and a row of small status icons (calendar, document/attachment, flag, send, thumbnail). Bottom tab bar: grid/apps icon, Candidates (active), Calendar, Briefcase (jobs?), and a profile avatar — a 5-tab bottom nav. |
| 3 | `5.5''-Chat.png` | **Per-candidate conversation thread**, recruiter's view of the Olivia↔candidate chat. Header shows candidate name + a small teal badge/dropdown (truncated, looks like a currency/pay-range chip) + overflow menu. Body: Olivia's scripted opener ("Hi, I'm Olivia, your personal job assistant. I can help you search and apply for opportunities or you can ask me anything about our business, culture, team, and more."), a candidate question ("Tell me about the culture"), an Olivia reply containing an outbound link to the (fictional demo) employer's own careers/culture page, and candidate "Thanks!". A "Write a reply…" compose box at the bottom (with `#` and image-attach icons) confirms **the recruiter can manually take over/inject into the AI conversation thread at any time** — Olivia handles the default flow, a human can step in. |

## iPad screenshots (3 of 3)

| # | What it shows |
| --- | --- |
| 1 | **Login screen** — "Phone number, email, or Employee ID" single field + "Next" + a "Keep me signed in on this device" checkbox. Confirms the auth model accepts **three identifier types at the same input** (phone / email / internal Employee ID) — a tell that Paradox integrates with a customer's existing employee/HRIS directory identifiers, not just email-based self-signup. Copyright footer on this (older, cached) screenshot reads "© 2016-2020 Olivia by Paradox.Ai". |
| 2 | **The full recruiter console** (rendered at iPad width — visually this is the responsive/desktop-web layout, not a distinct native iPad interface), the richest single screenshot captured. Confirms: <br>• A **tenant/org switcher** in the header (shown against a demo tenant name), plus a small avatar-group icon, notification bell, search, and an explicit **"Assist" button** — a labelled AI-copilot entry point for the recruiter, distinct from the candidate-facing Olivia chat. <br>• Left rail: candidate list with a live count badge (thousands-scale, e.g. "6,360 Candidates"), sortable by "Most recent activity", same status-pill vocabulary as the iPhone Inbox view. <br>• Right pane: a **per-candidate profile with FOUR tabs — Conversation / Resume / Notes / Hire Details** — confirming the data model holds at minimum: chat transcript, an attached/parsed résumé, free-text recruiter notes, and a structured hire-decision record, per candidate. <br>• A workflow-status banner ("Interview Request Sent") sits above the transcript — status is tracked as a discrete state machine, not just inferred from message content. <br>• Olivia's scheduling-proposal message offers two concrete interview time slots and a **branded short-link domain for "view more times"**: `oli.vi/<token>` — a first-party branded URL shortener, a genuine infra/branding fact (worth cross-checking against `infra-backend-fingerprint`'s DNS/CT sweep — `oli.vi` did not appear in this run's discovery-stage host list). <br>• The reply compose box is contextual: it read "Send an email" (not "send a message"), implying the same composer **retargets to the candidate's actual channel** (SMS/email/Messenger/web) rather than always posting to one wire. |
| 3 | **The recruiter-facing "Assist" AI copilot overlay**, triggered from the button seen in screenshot 2 — this is the single most important frame in the set. A right-side panel opens (background console dimmed) showing a conversational assistant greeting the *recruiter* ("Hi <name>! How can I help?"), with three suggested-prompt chips: **"I need to schedule an interview," "When is my next interview?", "How do I update my availability?"** — i.e. Olivia is not only the candidate-facing bot, it is **also an internal ops copilot FOR recruiters/interviewers**, helping them manage their own scheduling and availability conversationally. A large teal **microphone button** plus a keyboard-toggle icon confirm **voice input is supported** in this assistant surface. The background list also shows a **per-candidate view/read-receipt activity trail** ("Company Admin viewed", "<name> viewed", dated entries) — an audit-log feature. |

## Cross-dimension notes

- The **"Assist" copilot** + the standalone **"Olivia Extension"** browser extension (see
  `raw/olivia-browser-extension-listing.md`) both point at the same architecture theme: Paradox is
  pushing Olivia beyond the candidate-facing chat into a **recruiter-facing AI-copilot layer** (schedule
  lookups, availability, LinkedIn-embedded actions) — a distinct, second conversational surface from the
  one the marketing site foregrounds (which is almost entirely candidate-side). This is a genuine
  Cartography-relevant finding: the *recruiter* product has AI-copilot depth that the public marketing
  site does not headline.
- The `oli.vi` short-link domain is a **new host lead for `infra-backend-fingerprint`** to fold into its
  DNS/CT sweep (not present in this run's Discovery-stage host list).
- The Employee-ID login field is a soft corroboration of the `scim2-models` PyPI package noted in
  Discovery hypotheses (SCIM-based enterprise identity/provisioning) — still not directly proven (no
  SCIM endpoint was observed), but consistent with it.
