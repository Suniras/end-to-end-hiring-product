<!-- source: apps.apple.com listing assets for "Olivia by Paradox - CEM" (id 1330936756), via itunes.apple.com/lookup screenshotUrls · captured_at: 2026-08-09 · method: binary-extract (public listing assets) · NOT a live session capture -->

# Paradox — session screens index

## ⚠️ THESE ARE NOT SCREENSHOTS FROM THIS RUN. NO IMAGE WAS CAPTURED.

This directory exists to satisfy the Mode-4 screenshot contract
(`cartography-coverage.md` → "Screenshots — `dimensions/session/captures/screens/`") **in the only way
this run could**: with a **textual index pointing at first-party App Store listing images**, described in
UI-surface detail by the `distribution-artifacts` collector.

**Two independent blockers made a real capture impossible:**

| # | Blocker | Kind |
| --- | --- | --- |
| 1 | **`auth: none`** — no credential for `olivia.paradox.ai`; `session` is `status: absent` (`completeness_pct: 0`), `wire-capture` is `status: folded` | access gap |
| 2 | **The Chrome / browser-driving MCP tools were absent from this session's toolset entirely** — verified by tool search; not a permission gate | **capability gap** (`ingestion.md` §8) |

Blocker 2 is the decisive one for *this* directory: **even with a credential, no screenshot could have
been taken, because there was no instrument to take it with.** Not one pixel of `olivia.paradox.ai` was
rendered, at any point, on this run.

**What is indexed below.** Six public **App Store marketing screenshots** of the real product chrome,
downloaded and visually inspected by `distribution-artifacts`. They are the run's closest available
surrogate for a UI walk and they are genuinely first-party — but they are:

- **marketing assets**, framed and selected by Paradox, not surfaces a walk chose;
- **populated with Paradox's own scripted demo data** (fictional candidates, a fictional demo company
  "ENZO", a demo tenant name, a demo email address) — the collector paraphrased rather than repeated
  names verbatim as a redaction-discipline default, and that paraphrasing is preserved here. **No real
  end-user PII is present in the source assets, and none is reproduced below;**
- **undated relative to the current build** — one is stamped "© 2016-2020", i.e. a cached older asset;
- **not navigable** — they show no nav depth, no route, no wire, and no state transition.

**No image files are stored in this directory.** Copying Paradox's marketing assets into the corpus would
add nothing over the descriptions and would blur the line this index exists to draw. The full,
authoritative descriptions live at
[`../../../distribution-artifacts/raw/screenshot-catalog.md`](../../../distribution-artifacts/raw/screenshot-catalog.md);
each row below is a pointer plus the IA mapping Cartography needs.

---

## Index

| File (would-be) | Surface | Route (inferred) | Depth | Source image | Status |
| --- | --- | --- | --- | --- | --- |
| `01-candidate-inbox.png` | Candidate list / triage inbox (mobile) | `/candidates`, `/candidates/inbox` | D0–D1 *(inferred)* | iPhone `5.5''-Inbox.png` | **surrogate — no local file** |
| `02-candidate-chat.png` | Per-candidate conversation thread + takeover composer | candidate profile → Conversation tab | D3 *(inferred)* | iPhone `5.5''-Chat.png` | **surrogate — no local file** |
| `03-login.png` | Login | `/login` | D0 | iPad #1 | **surrogate — no local file** |
| `04-console-desktop.png` | Full recruiter console — left candidate rail + 4-tab candidate profile | `/candidates` + `/candidate-hire-detail` | D0→D2 *(inferred)* | iPad #2 | **surrogate — no local file** |
| `05-assist-panel.png` | "Assist" recruiter AI-copilot overlay | `/assist` | D0–D1 *(inferred)* | iPad #3 | **surrogate — no local file** |
| `00-splash.png` | Launch/splash screen (pure marketing framing, not a functional surface) | — | — | iPhone `5.5''-Loader.png` | **surrogate — excluded from coverage counts** |

**Distinct primary surfaces depicted: 3** — Login, Candidates (inbox + profile + conversation, all one D0
destination), and Assist. Against ~31 primary surfaces across the three IA layers this yields
`screenshot_coverage: 10` in `feature-coverage.md`, with **`screenshot_coverage_live: 0`** recorded
alongside it so the surrogate can never be scored as a live capture.

---

## What each depicts (condensed — full detail in `screenshot-catalog.md`)

### 01 — Candidate list / triage inbox (mobile)
"All Candidates", a **"999+ Candidates"** badge. Each row: candidate name · elapsed time since activity
(10h / 10m / 10d / 10 weeks) · role or department ("Restaurant & Food Services", "Human Resources",
"Cashier") · a coarse location · a workflow-status line — **Interview Scheduled / Interview Pending /
Interview Canceled / "Capture Incomplete"** — and a row of small status icons (calendar, attachment,
flag, send, thumbnail). **Bottom tab bar (5 tabs): grid/apps · Candidates (active) · Calendar ·
Briefcase (Jobs) · profile avatar.** *This 5-tab bar is the closest thing in the entire run to an
observed D0 navigation set — and it is the mobile subset, not the web console's nav.* "Capture" is a
**legacy product name** (glossary: Capture→Apply) still live in a current status pill.

### 02 — Per-candidate conversation thread + takeover composer
The recruiter's view of the Olivia↔candidate chat. Header: candidate name, a small teal badge/dropdown
(truncated, reads like a pay-range chip), overflow menu. Body: Olivia's scripted opener — *"Hi, I'm
Olivia, your personal job assistant. I can help you search and apply for opportunities or you can ask me
anything about our business, culture, team, and more."* — a candidate question ("Tell me about the
culture"), an Olivia reply carrying an **outbound link to the employer's own careers/culture page**, and
a candidate "Thanks!". A **"Write a reply…"** composer (with `#` and image-attach icons) at the bottom.
**This composer is the direct evidence for human takeover of the AI thread** — the single most
product-defining affordance in the set.

### 03 — Login
A **single field labelled "Phone number, email, or Employee ID"** + "Next" + a "Keep me signed in on this
device" checkbox. Three identifier types in one input is the tell for HRIS/employee-directory
integration rather than email-based self-signup. Footer reads "© 2016-2020 Olivia by Paradox.Ai" — **a
cached, older asset**, so treat its chrome as historical.

### 04 — Full recruiter console (rendered at iPad width = the responsive desktop-web layout)
The richest single frame. Header: a **tenant/org switcher**, an avatar-group icon, a notification bell,
search, and an explicit **"Assist" button**. Left rail: candidate list with a live count badge
(thousands-scale, e.g. "6,360 Candidates"), sortable by "Most recent activity", same status-pill
vocabulary as 01. Right pane: a per-candidate profile with **four tabs — Conversation / Résumé / Notes /
Hire Details** — plus a workflow-status banner ("Interview Request Sent") above the transcript. Olivia's
scheduling message offers **two concrete time slots** and a **branded short link, `oli.vi/<token>`**, for
"view more times" (independently resolved live: 308 → `olivia.paradox.ai`, `noindex,nofollow`). The reply
composer read **"Send an email"**, not "send a message" — i.e. the composer **retargets to the
candidate's actual channel**.

### 05 — "Assist" recruiter AI-copilot overlay
The most consequential frame in the set. A right-side panel over the dimmed console, greeting the
**recruiter** ("Hi <name>! How can I help?") with three suggested-prompt chips — **"I need to schedule an
interview," "When is my next interview?", "How do I update my availability?"** — a large teal
**microphone** button and a keyboard-toggle icon (**voice input supported**). Behind it, a
**per-candidate view/read-receipt activity trail** ("Company Admin viewed", "<name> viewed", dated) — an
audit-log feature. Together with the router paths `/assist`, `/assist/calendar`,
`/assist/scheduling_action`, this is **two independent dimensions → Assist is fact**, despite appearing
on none of the 13 product pages, in no KB article, and in none of the 53 public API operations.

---

## Coverage gap — recorded, not papered over

**Zero image evidence exists for ~28 of ~31 primary surfaces**, including:

- **all ~35 `/settings/*` configuration surfaces** — the largest area of the product by route count;
- `/dashboard`, `/jobs`, `/analytics`, `/campaigns`, `/events`, `/campuses`, `/communities`, `/surveys`,
  `/cms`, `/site-studio`, `/integration-center-v2`, `/admin`;
- **the entire post-hire retention suite** (`/microlearning`, `/employee-recognition`,
  `/employee-rewards`, `/employee-chat/messages`);
- the `/lead-interview/*` scheduling cluster (~40 routes) — the product's operational core;
- the `/external/*` partner-embed surfaces;
- **the candidate's own view of the conversation** — which, per `ux-flows.md` F2, renders in the
  candidate's SMS/WhatsApp/Messenger client and therefore has no Paradox UI to screenshot at all.

Per `ingestion.md` §9.5 the textual surface-map is the accepted substitute when the runtime cannot be
screenshotted, **and the visual-coverage gap must be recorded in the `gaps:` frontmatter** — it is, in
`session/_summary.md` (`status: absent`, `completeness_pct: 0`) and in `feature-coverage.md`'s scorecard
(`screenshots_captured_this_run: 0`, `screenshot_coverage_live: 0`).

**To close this gap a future run needs both** (a) a credential for `olivia.paradox.ai` **and** (b) a
working browser-driving tool. Neither existed here. The single highest-value first action once both are
available is `GET /api/menu` — it returns the real per-tenant D0 nav and turns this index's inferred
depths into measured ones.
