# Srikanth, on the IndiGo HRSS build

AUTHOR: Claude wrote the questions and the inventory. Suniras writes the answers and what they mean.

Date: 31 August 2026
Who: Srikanth, worked on the IndiGo HRSS programme
Format: internal conversation

**This does not count toward the P3 gate.** That gate is five people who do not work at Nurix, and it is still
at zero. Srikanth is a colleague talking about a build, not a practitioner talking about their own hiring.
What he says about IndiGo's process is second-hand about a customer we do not have in our target segment.

---

## Read before the call

Grounded in the repository at `sunirasrapelli/Nurix-Airlines-HRSS`, specifically
`docs/indigo-hrss-process-summary.md`, `docs/indigo-asis-tobe.md`, `docs/indigo-client-tech-questions.md`,
`docs/indigo-executive-summary.md` and the root README. Read 31 Aug 2026.

**The single most important fact.** The automated SOP starts after the hiring decision has already been made.
IndiGo selects on the drive day by verbal callout from Talent Acquisition. There is no application screening,
no structured assessment, no interview stage and no hire-or-reject decision anywhere in the built scope. The
programme is offer generation through to induction.

That is our steps 7 to 16. The part of the funnel we are building, steps 1 to 6, is upstream of everything
Srikanth worked on and was never in scope.

---

## Questions

### A. The write-back block, which is the one that could change our architecture

1. SF status write-back is blocked on a service account permission. How long has it been blocked?
2. Who has to sign that off, and what has been tried to move them?
3. Did you ever get write access in UAT, or only read?
4. If write-back never arrives, does the product still work? What specifically breaks?
5. Have you hit a customer where the system of record simply could not be written to? What did you do?

### B. Durations, which is the thing this project cannot get anywhere

6. Do you have measured per-stage times, or is the SOP still all TBC?
7. Offer accepted to induction: what is the actual elapsed time, and how much of it is queue?
8. The Thursday collation and Friday dispatch cadence. How many days does one candidate lose to it?
9. Did IndiGo have no-show and drop rates per stage, or did you have to measure them yourself?
10. 3,000 candidates a month, 300 calls a day, 500 documents a day. Where did those come from and are they real?

### C. What the voice agent actually does

11. V1 to V4 and Pa: are they all notification, nudge and capture, or does any one of them hold an open
    conversation and score what it hears?
12. What is the pickup rate, and what happens after three failed attempts?
13. Consent was settled as in-call disclosure rather than opt-in. Who decided, and did legal push back?
14. Is the Unifi screening agent the same codebase as these, or a different build?

### D. The integrations

15. AuthBridge: is there an API, or is it still the daily tracker email and an Excel attachment?
16. Which integration took longest, and was the delay technical or permission?
17. Extract-and-discard for KYC documents. Whose idea, and did InfoSec actually accept it?
18. ServiceNow as the universal ticketing system: IndiGo's constraint, or your recommendation?
19. Eight documented platform gotchas are referenced in the architecture doc. What are they?

### E. Who bought it

20. Who is the buyer: HRSS, Talent Acquisition, HR leadership, or IT?
21. Who signed, and who could have killed it?
22. Is HRSS measured on anything today? Time to induction, no-shows, cost per hire?
23. Did anyone ask for a headcount reduction, or is this about capacity?

### F. What is reusable

24. What in the codebase is genuinely portable, and what is SuccessFactors-shaped?
25. The 11-stage pipeline and the status engine: generic, or built around SF stages?
26. What would you not build again?

### G. The upstream gap, which matters most to us

27. Screening and selection are entirely outside scope. IndiGo's choice, or never on the table?
28. Who does selection on the drive day, and on what basis? Is there any structured assessment at all?
29. Would IndiGo buy screening automation, or is the drive-day format non-negotiable?
30. Was there ever a conversation about the part before the offer?

---

## Answers

(Suniras fills this in. Verbatim where possible.)

---

## What this changes

(Suniras. Nothing goes into DECISIONS.md, EVIDENCE.md or OPEN-QUESTIONS.md until it is written here first.)
