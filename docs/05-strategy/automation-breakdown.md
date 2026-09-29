---
AUTHOR: Claude, applying a rule Suniras set. The rule is his, the row-by-row application is mine
WHAT THIS IS: all twenty funnel steps sorted by what can be automated, where AI earns its place, and where a
human is required
WHAT THIS IS NOT: a PRD, a build order, or an estimate. No step here is committed to
DATE: 16 Aug 2026
---

# What we automate, what AI does, and what stays human

## The rule this applies

Suniras, 16 Aug 2026, in his own words: cover all twenty steps, it is fine for humans to handle some in
between, automate most of what can be automated, use AI wherever it makes sense. For steps neither competitor
sells into, many need a human anyway, and showing them in one pipeline is the value.

Everything below is that rule applied row by row. Where I have added judgement, it is marked.

## The four categories

**A. Deterministic automation.** Software does it, and AI would make it worse. Rules, integrations, forms,
timers. Most of the funnel is here and that is normal.

**B. AI earns its place.** A language or voice model does something a rules engine genuinely cannot: an
unstructured conversation, an open answer, a nudge that adapts.

**C. Human required.** Either the law requires a person, or a person is the only one who can do it. AI may
prepare and summarise. It does not decide.

**D. Fixed clock.** The wait is set by a vendor, a regulator or the calendar. It cannot be compressed by
anybody. The only available product is making it visible and making sure nothing is idle inside it.

Category D is the important one for the pipeline idea, because those are exactly the steps where showing the
state is the whole product.

---

## Hire

| # | Step | Category | What the software does | What AI does | Human floor |
|---|---|---|---|---|---|
| 1 | Application captured | A | Forms, API intake, job board and Indeed-style embeds, deduplication | Nothing. Do not put a model here | None |
| 2 | Eligibility on hard rules | A | Deterministic rules: age, right to work declared, availability against shift pattern | **Nothing, deliberately** | None |
| 3 | Behavioural or fit screening | B | Runs the conversation, records it, writes the audit entry | Conducts an open conversation and matches answers against a client-owned phrase bank | Every non-pass goes to a person |
| 4 | Interview scheduled | A | Availability matching, calendar write, reschedule, cancellation | Optional conversational front end only | None |
| 5 | Interview happens, or no-show | B + C | Reminders, confirmation, one-tap reschedule, escalation when silent | Outbound voice reminder and reschedule conversation | The interview itself, unless it is an AI screen |
| 6 | Hire or reject | **C** | Assembles everything the decider needs on one screen | Ranks and summarises. **Never rejects** | **Absolute. A person decides** |
| 7 | Offer made | A + C | Generates from a template, sends, tracks opening and expiry | Nothing needed | Pay rate approval, where policy requires it |
| 8 | Offer accepted, or goes quiet | B | Chase schedule, deadline, automatic escalation, alternate-candidate trigger | Voice or message follow-up that can answer questions | The acceptance itself |
| 9 | Background check ordered | A | API to the screening vendor, FCRA disclosure and authorisation capture | Nothing | None, but the disclosure must be a standalone document |
| 10 | Check comes back clear | **D** | Polls status, surfaces delay, runs pre-adverse and adverse action if it comes back bad | Nothing | Adverse action review is a person |

## Onboard

| # | Step | Category | What the software does | What AI does | Human floor |
|---|---|---|---|---|---|
| 11 | I-9, W-4, direct deposit, policy sign-offs | A + C | Forms, pre-fill, validation, storage, reminders | Nothing. Do not put a model near an I-9 | **I-9 Section 2 document examination is a person**, in the required window |
| 12 | E-Verify submitted and cleared | A + D | Creates the case, tracks it, drives the mismatch process | Nothing | Mismatch resolution involves the employee and a person |
| 13 | Training and certifications | A | Assigns, delivers, tracks completion, chases | Optional: answers questions about the content | Any state-mandated certification with its own body |
| 14 | Uniform, badge, systems access, payroll record | A | Provisioning triggers into payroll, identity and store systems | Nothing | Physical handover |
| 15 | First shift scheduled | A + D | Writes to the workforce management system, respects advance-notice rules | Nothing | None |
| 16 | Day one: shows up, or does not | B + C | Confirmation sequence, where to go, who to ask for, escalation on silence | Voice or message nudge, and a reschedule path | Turning up |

## Activate

| # | Step | Category | What the software does | What AI does | Human floor |
|---|---|---|---|---|---|
| 17 | Week one training on the floor | C | Tracks it, prompts the manager, records completion | Nothing | The training |
| 18 | Ramp to unsupervised | C | Measures, if the client has any signal to measure | Nothing yet | The judgement that someone is ready |
| 19 | 30, 60, 90 day check-ins | B + D | Schedules, prompts, captures, escalates a bad answer | Runs a short structured check-in and flags risk | The manager conversation, when one is triggered |
| 20 | Still employed at day 90 | D | Measures. This is the number, not a step | Nothing | None |

---

## What the categories add up to

| Category | Steps | Count |
|---|---|---|
| A, deterministic | 1, 2, 4, 7, 9, 11, 13, 14, 15 | 9 |
| B, AI earns its place | 3, 5, 8, 16, 19 | 5 |
| C, human required | 6, 17, 18, plus parts of 5, 7, 11, 16 | 3 whole, 4 partial |
| D, fixed clock | 10, 20, plus parts of 12, 15, 19 | 2 whole, 3 partial |

Three things fall out of that.

**Most of this product is not AI.** Nine steps are plain deterministic software and would be made worse by a
model. That is not a disappointment, it is what a working hiring system looks like, and it matches what the
teardown found: both incumbents are mostly integration and state machine with a model at the edges.

**The five AI steps cluster in one place.** Steps 3, 5, 8, 16 and 19. Four of those five are conversations with
a candidate or a new hire about whether they are going to turn up or stay. That is one capability applied five
times, not five features. It is also, precisely, what Nurix already shipped at Unifi.

**Steps 5, 8 and 16 are the ones neither competitor sells into.** They are also three of the five AI steps.
Worth noticing, not worth building on yet.

**One reconciliation, added 18 Aug 2026.** The counts above add to nineteen, not twenty, because step 12,
E-Verify, is genuinely a hybrid: creating the case is deterministic, and the two clocks around it are not.

The demo at ../../demo/demo/ has to give every step exactly one owner, because the whole visual system is
one hue per step. It assigns step 12 to the fixed-clock category, since the clocks are what define that step
in practice and the mismatch bar is the part that matters. So the demo shows a clean partition of nine
deterministic, five AI, three human and three fixed waits, and ../shared/STATUS-FOR-NISHANT.md v2 quotes those numbers.

Both are correct descriptions of the same analysis. This table is the finer-grained one. If anybody asks why
the numbers differ, that is the answer.

## Where AI is deliberately kept out, and why that is a feature

Steps 2, 6, 9, 11 and 12 are the legally loaded ones. Eligibility, the hire or reject call, the background
check, the I-9 and E-Verify.

Putting a model in any of them is how this category gets sued. The Unifi design already answered this: hard
yes/no rules for eligibility, a client-owned phrase bank for open answers, a human on every flagged case, and
an agent that can pass a candidate forward but never reject one. It survived a client's legal review.

Both competitors have a documented gap here. Fountain's ethical-AI page names zero compliance frameworks, zero
methodology and no third-party auditor. Paradox defers its bias-evaluation methodology to Workday's standards.
Neither names its model vendor anywhere a buyer or a candidate can see.

Whether that is a position is Suniras's call. It is at minimum a thing we can do correctly from day one that
neither of them has done.

## The compliance clocks that set category D

**VERIFIED 16 Aug 2026 against primary government sources.** Originally written from my own knowledge and
flagged as unverified. A research run then confirmed every one of them verbatim against eCFR, e-verify.gov,
uscis.gov, the Federal Register, eeoc.gov, and state statute sites, and corrected several. The full table with
URLs is in 05-strategy/integration-surface-map.md section 5, along with eleven commonly repeated versions that
turned out to be wrong.

Counsel sign-off is still required before the PRD, but these are no longer my recollection.

- **I-9 Section 2.** Document examination within three business days of the start date. A person does it.
- **E-Verify.** Case created within three business days of the start date, with its own resolution windows if
  the case comes back mismatched.
- **FCRA.** Pre-adverse action notice, then a reasonable gap, then adverse action. Cannot be collapsed.
- **Fair workweek.** Around fourteen days of advance schedule notice in covered cities, with a premium to
  change inside it. Affects step 15.
- **NYC Local Law 144. Corrected 16 Aug 2026, and the correction matters.** Not an annual exercise. The bias
  audit must have been conducted **no more than one year before each use of the tool**. That is a rolling
  twelve-month lookback measured from every single screen, not a job you do each January. An audit that ages
  past twelve months makes every subsequent screen unlawful even though it was done "this year". A summary plus
  the tool's distribution date must be published on the website before use, and each in-city candidate needs at
  least ten **business** days of notice offering an alternative selection process. Affects step 3, and after
  D-016 it affects step 6 too.
- **The background check itself.** The vendor's turnaround. Not ours to compress.

Nurix already has a worked legal framework from the Unifi build and a June 2025 legal memo on voice AI in
recruitment. That is a starting point, not an answer, because Unifi is aviation and some of this is
retail-specific and city-specific.

## The three things that will bite

**1. Are we the system of record, or an overlay on it?** This is now the biggest open question in the project
and it has to be answered before any schema is drawn. Raised as Q-031.

A single place where everyone sees everything sounds like a system of record. But the applicant tracking system
is already the system of record, and the teardown is blunt that trying to out-build one is the mistake most
likely to cost us. Paradox solved this with a day-one schema decision: every entity carries both an internal
ID and an external ID, plus a status map translating their stages into the customer's vocabulary. That is what
makes an overlay deployable next to Workday instead of starting a replacement fight, and the teardown says
retrofitting it later is expensive.

**2. Better needs a definition, and there are two evidenced ones available.** Parity is not a claim. But two
weaknesses at the incumbents are documented from their own material rather than asserted.

Paradox customers cannot configure their own system. Their knowledge base says access to Assistant Messaging
requires contacting a customer success representative, and that stage transitions are configured on the backend
by that representative. For a retailer with no recruiting operations team, that is a cost and a delay every
time anything changes.

Fountain names ADP, Workday, UKG and SAP in marketing and documents connecting to a human resources system as a
two-paragraph do-it-yourself webhook. No certified connector appears anywhere in a 593-page documentation
index.

So better could mean self-serve configuration, or real connectors, or both. Picking is Suniras's.

**3. Twenty steps is a roadmap, and it still needs a build order.** Covering all twenty is a scope decision and
a legitimate one. It is not a sequence. Something ships first, and what ships first decides whether the second
thing gets funded. That question is deferred rather than answered, and it should be answered before S1.
