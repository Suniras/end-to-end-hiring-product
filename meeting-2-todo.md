# Meeting 2 with Nishant: what I am working on

**Meeting date:** 18 Aug 2026. **This doc written:** 18 Aug 2026.
**Sources:** meeting-2-summary.txt and meeting-2-transcript.txt.

---

## How I read the transcript

Granola dropped most of the Hindi, so several passages are half-sentences. I have marked how confident I am
on each item below. Three levels:

- **Clear.** Nishant said it in recoverable English, or the summary and the transcript agree.
- **Reconstructed.** The transcript is broken but the meaning is recoverable from context, and the summary
  backs it up.
- **Uncertain.** I am guessing. Correct me and I will redo the item.

One line I could not recover at all: "Take attendant on board" near the end. It may be "take a tenant on
board", or a name. If it was an instruction, tell me and I will add it.

---

## The one item that changes the product

### 0. D-015 is reversed. We are a connector layer, not the system of record

**Clear.** This is the biggest thing in the meeting and everything else depends on it.

You said it: retailers above two billion already have entrenched systems that would be hard to replace, so
rather than replacing them we build connectors and give them one place to run the whole thing. Nishant did not
argue. His very next question assumed it: "in which steps do those existing systems play a huge role." Later he
confirmed the shape again on Workday, saying it covers recruitment, training, appraisals, payroll and security
at Target, "but we are only focusing on that hiring layer."

That directly reverses D-015 from 16 Aug, which says we are the system of record and every applicant is fed
into our system. It was recorded as the most expensive decision in the project, and its cost was written out in
full: a rip-and-replace sale with IT, procurement, a security review and a CIO in it.

**So this is good news, not a setback.** It removes the hardest part of the sale, and it puts us back on the
same architecture Nurix already shipped at Unifi, which was an overlay on Avature.

**What I will do:** record the reversal as a new decision with Nishant's reasoning, mark D-015 superseded
rather than deleting it, and correct the four places downstream that assumed we were the record: the v1 scope
answers, the integration surface map, the status doc, and Q-032 on what has to be exported from the old system.
Q-032 mostly dissolves, because a connector does not make anybody leave their applicant tracking system.

---

## What Nishant explicitly asked me to produce

### 1. Segregate the 20 steps: real system integration versus email and phone

**Clear, and this was his most concrete ask.** His words: "in which steps are those existing systems playing a
huge role, and in which steps is it just email and phone communication." Then: "What do we need from that
system."

**What I will do:** add two columns to the funnel map. For each of the twenty steps, which incumbent system
holds the truth, and what specifically we need from it: read, write, both, or nothing. Then the honest split of
how many steps need a real integration versus how many are just people emailing each other, because the second
group is where a product can win without asking anybody's IT department for anything.

### 2. Size the prize

**Clear.** He said Walmart spends a billion dollars a year on hiring operations, then immediately said "I'm
making it up. Something on that." He wants a real number, and he wants it to show up in discovery. He also
named the three things it has to tie to: cost, time, and attrition.

**What I will do:** research what a large US retailer actually spends on hiring operations, from filings and
disclosures rather than vendor blogs, under the same sourcing rules as before. Every claim gets a URL that
loaded or it gets dropped. If no traceable figure exists I will say so plainly rather than inventing one, and I
will build the number from parts we can source instead.

### 3. The handoff research

**Clear.** "How many teams are talking to each other in those first 90 days to actually get a candidate
screened and then make sure those candidates are working in the end store location."

**What I will do:** research how this runs today at a large retailer. How many distinct teams touch one hire,
where each handoff sits, and what is known about how long each one takes. This is the same question two earlier
research runs failed on, so I will be explicit about what is obtainable and what is not.

### 4. Which steps to solve first

**Reconstructed.** The transcript is broken here but the summary is clear: identify the top needle-movers and
solve those in the first 30 to 60 days. He also said the skeleton of twenty is fine and not to overthink it.

**What I will do:** rank the twenty by how much they would move, using what is already recorded: where the
drops are, which steps neither incumbent sells into, and which are pure waits. The ranking is mine to propose
and yours to decide, per the working rule.

### 5. Step 0 and step 20: no information lost at the ends

**Reconstructed.** "Step zero and step 20 may save information carry. How do we make sure no values [lost]."

**What I will do:** work out what enters at the start and what has to survive to the end, and where a connector
architecture risks dropping it. This is sharper now than it was under D-015, because an overlay does not own the
record and therefore can lose things a system of record could not.

### 6. Compliance connectors, not compliance features

**Clear.** Two requirements named: I-9 and E-Verify. He named a vendor, which Granola rendered as "green light
or something like that". That is almost certainly **GreenLight**, a real US background check and I-9 vendor.

**What I will do:** verify GreenLight exists and what it actually covers, and add it to the connector list
alongside the vendors already researched. This also settles Q-033, the open question on whether we own E-Verify
or embed somebody: Nishant's answer is embed.

### 7. The flagged candidate reapplying at another store

**Clear.** Your San Francisco to New York example. He put it in an "exception handling bucket", said a central
candidate database with biometric or government ID matching would handle it, and said he is not solving the
whitelist and blacklist problem now. He asked for a knowledge base of these cases.

**What I will do:** start an exception register. Each entry gets the case, what breaks, what a fix would need,
and whether it is in or out for v1. This one goes in first, and it matters that the demo already implements it.

### 8. Scenario planning and the cost of over-hiring

**Reconstructed, and it is a genuinely new idea from him.** His example: hire 500 into a warehouse, people sit
idle, idle costs eight to twenty dollars an hour each, and over a quarter that is millions. He said our product
could talk to a scenario planning product so that forecast demand sets the headcount, and mentioned flex
headcount, tapering down, and handling the exit.

**What I will do:** write this up as a possible adjacent surface with the cost logic stated, and flag the two
things it implies. It points at workforce management rather than hiring, and tapering down and exits are
firing, which is a long way outside the current scope.

### 9. Outsourcing research, and the third-party candidate pool

**Clear.** He asked directly: what percentage of hiring is outsourced to third parties, and what do those
arrangements look like. His own answer to why retailers keep it in house was cost and knowing their own
systems. Then he raised the interesting version: plug into a third party's already screened and shortlisted
pool at the shortlist stage.

**What I will do:** research it, and treat the plug-in idea as a scope question for you rather than a
conclusion.

### 10. Application ingestion

**Clear.** New applicants come in through a direct connector from the job portals. Existing applications are
the open question, and he will ask Target how their central HQ database is structured.

**What I will do:** map the intake options and what each needs. Note that under a connector architecture the
migration question largely goes away, which is worth saying out loud.

---

## What you asked me for directly

### 11. The questions doc for Nishant's Target colleagues

**Your ask, and the highest priority item here**, because he is reaching out in the next two or three days and
the questions have to be with him before that.

**What I will do:** write a send-able document of questions for somebody who works in hiring at Target.
Ordered by value, short enough to actually get answered, and written so each answer is a fact rather than an
opinion. It will fold in the fourteen questions already sitting in 03-discovery/practitioner-questions.md, plus
the specific ones this meeting added: the handoff count, the system-versus-email split, the flagged rehire
case, how applications are stored centrally, and the outsourcing share.

I will also include a shorter version he can use if he only gets ten minutes with somebody, because a long
list often returns nothing.

---

## Timeline he set

**Clear.** Three to four days to lock the research, then wireframes, then build. Research locked by Friday 21
or Monday 24 August. He was explicit that the time-boxing is for discipline rather than because he is rushing
the product.

He also described his own preferred order: wireframes, then high fidelity, then check the screens actually
solve the thing, and only then build. Worth noting we are slightly ahead of that, because a working demo
already exists.

---

## What I am deliberately not doing

- **Not reopening whether the problem is worth solving.** Closed by D-012.
- **Not writing the positioning or the problem statement.** Yours, per CLAUDE.md. Your problem statement from
  17 Aug still holds and this meeting did not contradict it.
- **Not solving the whitelist and blacklist properly.** Nishant explicitly deferred it to exception handling.
- **Not building the scenario planning integration.** Adjacent, and it needs a decision from you first.
- **Not changing the demo's screens yet.** The connector reversal changes what the demo should claim, but I
  want the research and your call on the ranking before I touch it. One exception: I will fix anything in the
  demo that now states the wrong architecture.

---

## Order I worked in, and what came out

All seven done as of 18 Aug 2026.

1. **QUESTIONS-FOR-TARGET.md.** Send-able. Five questions marked as the ones that matter in a realistic ten
   minutes, then the longer list, plus two things not to ask.
2. **D-020 records the reversal**, D-015 is marked superseded, and four downstream docs are corrected: v1-slice,
   the integration surface map, the status doc and Q-031. Q-032 mostly dissolved.
3. **05-strategy/connector-map.md.** Twelve steps need a system, eight need nothing. Four of the six steps
   neither incumbent sells into need no integration at all.
4. **05-strategy/exception-register.md.** Eighteen cases. E18 came out of the research and may be the biggest of
   them.
5. **01-diagnosis/research-2026-08-18.md.** All four angles, 737 fetches, each researcher audited by a separate
   agent. It corrected six things we had written ourselves.
6. **05-strategy/first-30-days.md.** The ranking, as a proposal. Steps 5, 8 and 16 in tier 1.
7. **CONTEXT.md, TODO.md and OPEN-QUESTIONS.md** all updated, and two blocking questions closed.

### What the research changed, beyond answering the questions

- **GreenLight is the wrong vendor.** Worker classification, not I-9 or E-Verify. D-022 corrected.
- **Three E-Verify clocks, not two,** and the first one is a shared window rather than the employee's alone. The
  demo now shows five clocks on the case instead of four.
- **There is no "contesting" status** in E-Verify. We hold that state ourselves and watch for Case in
  Continuance. Every workable design polls, because nobody pushes.
- **Only WorkBright publicly exposes both a deadline and the mismatch action.** That effectively decides the
  vendor at step 12.
- **E18, the EAD Status Change Report.** A second state machine keyed to the existing workforce rather than to
  new hires, running biweekly through 2026. No vendor interface exposes it. Plausibly a bigger live exposure than
  mismatch handling for a large hourly retailer, and it needs a second verification pass before anybody repeats
  it.

### Still outstanding

- **Nishant to talk to his Target colleagues.** Send him the questions doc.
- **Suniras to decide the tier 1 ranking** in first-30-days.md.
- **Suniras still owes two sentences** from 16 Aug: the primary user, and what that person stops doing on a
  Monday. This meeting did not change that.
