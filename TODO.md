# Suniras's to-do list

Created 9 Aug 2026, updated 14 Aug. Things only you can do. Everything here is either a decision that is
yours to make or an answer that has to come from a person.

Claude keeps this updated. If something moves to DECISIONS.md it comes off this list.

**Status doc sent to Nishant. No reply.** So nothing on this list waits on him any more. You are working
alone and the work below does not need him.

**The premise question is closed.** D-012, 14 Aug. We are building. The cost of closing it early is written
into that decision, and the mitigation is a design requirement rather than more research: v1 instruments the
funnel it touches.

## Top of the list, updated 18 Aug: after meeting 2

**The second meeting changed the architecture.** Nishant accepted the connector approach, which reverses D-015.
We are an overlay, not the system of record. D-020, and it is the most consequential thing to come out of the
meeting. He also closed Q-022 on the seasonal trend and settled the E-Verify posture as an embedded vendor.

Everything he asked for is listed in meeting-2-todo.md with how confident I am on each item, because Granola
dropped most of the Hindi.

**A. Send Nishant QUESTIONS-FOR-TARGET.md.** Written and ready. He is reaching out in the next two or three
days, so this is the only genuinely time-critical item. Five questions matter most and they are marked.

**B. His time box.** Research locked by Friday 21 or Monday 24 Aug, then wireframes, then build. He was explicit
that it is for discipline rather than because he is rushing.

**C. Waiting on the research** he asked for: size of the prize, the handoff count, the outsourcing share, and
whether any compliance vendor exposes the E-Verify case state.

**D. Then decide the needle-mover ranking.** Which of the twenty steps to solve first. Claude will propose.

---

## Carried over from 17 Aug: the demo

The goal changed shape on 17 Aug. **D-018: a demo for Nishant comes before the product.** Everything external
is simulated. Pricing is deferred with a guardrail. Q-032 narrowed to one import. E-Verify posture is Q-033,
decided at S1. The metric conflict is resolved by D-017.

**1. DONE 17 Aug. The demo is built.** Open 06-validation/demo/index.html by double-clicking it. Overview
page first, then click through to the product. Ten screens, presenter notes on P, reset on R. The
read-aloud script is 06-validation/DEMO-SCRIPT.docx, eleven scenes with the narration written out.

**2. Walk it yourself, twice, before he sees it.** Once with presenter notes on to learn the beats, once
with them off at the real pace. The two scenes that matter are 6 and 7, the rehire flag and the E-Verify
refusal. If you are short on time, cut scene 3 or 8, never 6 or 7.

**3. Send him STATUS-FOR-NISHANT.md, v2 as of 18 Aug.** Rewritten from scratch, because v1 said there was no
problem statement and no v1 and that our premise was in question, and all three of those are now resolved. It
leads with the demo, records the seven decisions that define the product, and is honest about the three
answers that are still weak. Three asks in section 6: tear the demo apart, practitioner access again, and
whether this sits on the NuAisle shelf at all now that we have chosen to replace the applicant tracking
system.

**4. The defence pack behind it is DECISIONS.md,** D-009 to D-019, each with reasons and a reversal condition,
plus the short form in the appendix of the demo script.

**5. Deferred by D-018, on purpose:** pricing (Q-030), the do-not-hire export question (Q-032), the E-Verify
posture (Q-033), the build order, and every integrate-versus-export choice.

**6. Not deferred: practitioner access. Q-001.** Still the biggest unmanaged risk. The demo helps rather than
waits, because a concrete thing to react to opens doors that a question list has not.

Item 12 below, the one-sentence problem statement, falls out of the demo spec: scene 1 names the user, and the
scene list names what they stop doing.

---

## Big decisions, blocking Phase 5

### 1. SETTLED 9 Aug 2026

One flow. Management roles are an explicit non-goal for v1. Recorded as D-010 with the cost written next to
it, because management roles are where the money usually is.

### 2. How broad does the horizon stay, and how does that not become v1 scope?

**Partly settled 9 Aug 2026.** Attract is now an explicit non-goal. See D-009. Three stages left in scope
for the horizon: hire, onboard, activate. The v1 cut among those is still a Phase 5 decision.

Nishant's guidance, 9 Aug 2026: "yes keep the horizon broad, we can cut down the scope later. we also
want to create solution to attract the talent. not the ads/marketing part like social media website
publications those will be job of other teams but enabling those teams will be a dimension we need to
address."

So attract is in the long-term picture, and specifically the enabling layer rather than running the
advertising. That is a useful boundary and it is narrower than "attract."

What you owe here: the difference between a broad horizon and a broad v1, written down. A broad horizon
is a roadmap. A broad v1 is how products fail. Recorded as D-008.

---

## Answers that have to come from a person

### 3. Find five people who hire retail staff in the US and do not work at Nurix

Phase 1 now runs without them by your decision. Phase 3 cannot. Its gate is exactly this.

No date set and no name against it except yours. Ask Nurix sales this week which US retail companies
are already in conversation. Q-001.

### 4. Does scheduling law enforcement make hiring speed newly expensive?

This is currently my hypothesis and it needs someone who operates under one of these laws.

Fair workweek rules require posting schedules about 14 days ahead and paying a premium to change them.
Chipotle settled with New York City for $20 million, Starbucks for about $39 million in December 2025.
If a retailer must commit to a schedule two weeks out and pay to change it, an unfilled shift stops
being an inconvenience and becomes a priced compliance event.

If true, it is the "what changed" answer this project has been missing. If false, drop it. Either way
it needs a practitioner. Q-024.

**Weakened 14 Aug.** The settlements are real. The link from schedule stability to retention is not. The one US
retail randomised trial that tested it, at Gap Inc., came back as a null on aggregate turnover, and Seattle's
own evaluation of its scheduling law found no effect on quits or tenure. So keep the question, and do not let it
carry weight in a pitch. Detail in 01-diagnosis/research-2026-08-14.md.

### 5. Get real hiring funnel numbers

Interview no-show rate, application completion rate, day-one no-show rate, 90-day retention.

Desk research produced plenty of these figures and not one with a traceable source. They are listed in
section D of 01-diagnosis/research-inputs.md as numbers not to use.

These have to come from a practitioner's own reporting or a named study. There is no shortcut and the
PRD needs them as baselines. Q-025.

**Two failed attempts as of 14 Aug.** A research run with strict source rules, fetch everything and drop any
claim whose page does not load, found no traceable number for the duration of any stage of US frontline retail
hiring. That is the second attempt to fail. More searching is not the answer.

The questions to ask instead are written out in 03-discovery/practitioner-questions.md, ready for the day you
have access. That makes item 3 above, finding five people, the biggest unmanaged risk in the project.

### 6. What does NuAnchor cost, and how long does it take to set up?

You said this is out of scope, so it sits here rather than blocking anything.

It matters only as a precedent. If products on the NuAisle shelf have a standard price and setup shape,
a hiring product inherits it. Ask Nishant when convenient. Q-008.

### 7. What is in the downloadable audit file?

Low priority. The screenshots show the reasoning display and the per-step ownership, but not the audit
export.

It matters because in US hiring, being able to reconstruct a decision months later without the app is a
legal requirement rather than a nice feature. Worth knowing what shape Nurix already produces. Q-007.

---

## Still owed by you, added 11 Aug

### 12. Your problem statement: WRITTEN 18 Aug 2026, and it is good

You wrote it yourself and it is now the spine of section 1 of STATUS-FOR-NISHANT.md, quoted verbatim with the
work behind each clause underneath it.

"US frontline retailers lack a single system that manages and connects the entire hiring journey, from
application through the first 90 days, leaving critical handoffs, waiting periods, compliance steps, and
post-hire follow-through fragmented across multiple systems and teams. This makes it difficult to see where
candidates are getting stuck, act on exceptions, and ultimately hire people quickly and compliantly."

It holds up against the recorded work. Handoffs and waiting periods is exactly what the funnel map found,
seventeen of nineteen. Compliance steps maps to the six clocked steps. Post-hire follow-through is the four
activate steps. Quickly and compliantly is the two metrics and nothing more.

**One half of it is still open.** It names the problem and not the person. Whose screen does this open on, and
what does that person stop doing on a Monday. Everything downstream, the design and the pitch both, waits on
those two.

If the honest answer today is "I do not know which step yet," write that sentence instead and say what would
tell you. That is a legitimate position six days in.

### 13. Send Nishant the status doc, and get the three answers in it

STATUS-FOR-NISHANT.md. The three asks are practitioner access, whether a hiring product sits on the NuAisle
shelf or outside it, and his read on the premise challenge.

The first one is the biggest risk in the project and has had no date against it since 8 Aug.

---

## Phase 0: CLOSED 9 Aug 2026

All three remaining items answered in conversation and transcribed into the files.

- **Item 8, what transfers from NuAnchor.** Answered: nothing. See D-011.
- **Item 9, what does not carry over from Unifi.** Answered, and it is the strongest structural
  observation made in this project so far. Transcribed into 00-context-notes/unifi-one-pager.md.
- **Item 10, the four-sentence test.** Passed. Transcribed into 00-context-notes/nuanchor-one-pager.md
  with a note on the two things missing.

---

## Diary

### 11. Check the 2026 NRF seasonal hiring forecast when it publishes

Usually September or October. It settles whether the 2025 drop was one soft year or the start of a
trend.

The 2022 to 2025 numbers are not a straight decline, so one more data point genuinely decides this.
Q-022 and D-006.

---

## A note on what the screenshots gave us

Worth reading before you write item 8.

NuAnchor now shows, per step, a line saying what the agent owns and what the human decides. On the
demand step: "AGENT OWNS: sensing and fusing demand signals into a directional range. YOU DECIDE:
whether this product is worth a buy."

Separately, the Unifi build answered the same question a different way: hard yes/no rules for
eligibility, a client-owned phrase bank for open answers, and an agent that can pass a candidate
forward but never reject one.

So Nurix has two independent, shipped answers to the hardest question in this project, which is where
AI belongs in a decision about a person. That is more useful to you than either the retail domain
logic or the demo polish, and it is what item 8 should be about.
