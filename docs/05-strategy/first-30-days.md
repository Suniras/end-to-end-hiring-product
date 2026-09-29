---
AUTHOR: Claude. A PROPOSAL answering a question Nishant asked. The decision is Suniras's, per CLAUDE.md
WHAT THIS IS: which of the twenty steps to solve first, and why, ranked on recorded evidence
WHAT THIS IS NOT: a decision, a build order, or an estimate
DATE: 18 Aug 2026
---

# Which steps to solve first

## The question

Nishant, meeting 2. The transcript is broken here but the summary is clear and the intent is recoverable: the
skeleton of twenty steps is fine and not worth overthinking, and what matters now is identifying the biggest
needle-movers and solving those in the first 30 to 60 days. His words on the skeleton: "overall the skeleton
looks good to me, I think we don't need to overthink about it."

## How I ranked them

Five tests, all from material already in the repo rather than from opinion. A step scores on each.

**Is it unowned?** Do the two incumbents sell anything there. Six of the twenty they do not, and those six are
where we have no competition.

**Does it need any integration?** From connector-map.md. Eight steps need nothing from anybody's system, which
means they can ship without a security review, a procurement cycle or an IT conversation.

**Is there a real loss there?** From the funnel. A step where people disappear is worth more than a step where
they queue.

**Is it a wait or a handoff?** Suniras's own funnel map answered this: seventeen of nineteen classifiable steps
are a wait or a handoff and only two are decisions. The time is in the gaps.

**Do we already have the capability?** Nurix shipped a live voice screening agent on the aviation build. A step
that reuses it starts from something real rather than from zero.

---

## The proposal

### Tier 1: the first 30 days. Steps 5, 8 and 16

| Step | Unowned | Integration needed | Loss | Capability exists |
|---|---|---|---|---|
| 5. Interview happens, or no-show | Neither sells | **None** | Largest claimed drop in hire | Yes, outbound voice |
| 8. Offer accepted, or goes quiet | Neither sells | **None** | Real, and after we chose them | Yes |
| 16. Day one: shows up, or does not | Neither sells | **None** | Largest drop in onboard | Yes |

**Why these three together, and why first.** They are not three features. They are one capability applied three
times: a conversation with somebody about whether they are going to turn up, at the three moments where people
vanish. The demo already treats them that way.

Every test scores. Nobody sells there. Nothing needs integrating, so nothing waits on a customer's IT
department. All three lose people the retailer has already decided it wants, which is the expensive kind of
loss. All three are waits, which is where Suniras's own funnel map says the time is. And all three reuse the one
thing Nurix has already shipped and had a client's legal counsel approve.

**The commercial argument, which is the strongest part.** A first version covering only these three is a product
somebody can buy and switch on the same week. It touches no system of record, so it does not need a security
review to start. It is the only part of the twenty where we can be live before a competitor notices.

**The honest counter.** Three steps is not an end-to-end hiring platform, and it is not what Nishant has been
told the product is. Selling three nudges as end-to-end hiring would be a stretch. So this is a build order, not
a positioning change.

### What the research supports, and what it does not. 24 Aug 2026

Research run four went looking for evidence on this ranking. **Half of what the first write-up claimed did not
survive verification**, so this section states only what did.

`[VERIFIED, non-retail]` **Compressing the funnel does not cost tenure, and it buys acceptance.** Two
independent peer-reviewed nulls. In Hoffman, Kahn and Li, hires starting one, two or three months after
applying had durations statistically indistinguishable from same-month starters, all eighteen coefficients
insignificant. In Becker, Connolly and Slaughter, no difference in turnover or performance between quicker and
later offers. And in the same study, candidates in both populations were more likely to accept earlier offers.

**Say it as "no penalty", not as "speed improves retention".** Only the first is evidenced. Both studies are
non-retail or salaried populations, so it is assumption-grade for hourly retail, and it is still the closest
thing to an answer that exists.

**Removed, because it did not survive.** The first version of this section argued that latency costs candidates
while assessment quality buys tenure, and cited Autor and Scarborough on testing raising tenure 10 to 15%. That
claim was **dropped before verification when the research run hit its budget**, so it is recorded as unverified
rather than as support. The latency half stands on the two nulls above. The assessment half does not stand at
all, and the neat symmetry it produced should not be repeated.

**What this leaves the ranking resting on.** Suniras's own funnel map, which says seventeen of nineteen
classifiable steps are waits or handoffs, plus the connector map, which says four of the six steps neither
incumbent sells into need no integration. Both are our own work rather than external evidence. That is a
weaker foundation than the first write-up implied, and it is the honest one.

**One competitive fact that bears on this directly.** Chipotle publishes application-to-start falling from 12
days to four, and attributes it to a **Paradox-built** assistant. So an incumbent already has an
employer-attributed result on exactly the compression this tier proposes. Two caveats worth carrying: the
release is internally inconsistent about whether it measures to offer or to start, and it sits alongside 155%
reported hourly turnover, which is a speed win with no disclosed quality control. Being right about where the
time goes is not the same as being first to say so.

### Tier 2: days 30 to 60. Steps 12, 10 and 3

**Step 12, the E-Verify bar.** The single most distinctive thing in the product and the thing no competitor
does. It needs exactly one read: the case state from the embedded vendor per D-022. It is in tier 2 rather than
tier 1 only because it depends on a vendor answer we do not yet have. If that answer comes back positive it
arguably moves up.

**Step 10, making the background check wait visible.** One read. No competitor sells here. It does not reduce
the wait and we should never claim it does, but it converts a black hole into a status, and the candidate
currently gets told nothing for days.

**Step 3, the screening call.** Both incumbents sell here so it is parity rather than advantage, but it needs no
integration and it reuses the same voice capability as tier 1. It is also what a buyer expects to see, so
leaving it out makes the product look smaller than it is.

### Tier 3: what makes it a product rather than a feature. Steps 1, 4, 6, 7

Application intake, scheduling, the hire decision and the offer. All four are the spine. Without them the tier 1
work is a set of reminders bolted onto somebody else's funnel, and there is no place for the pipeline view that
D-013 makes the actual claim.

Three of the four need a write, which is the expensive posture, so this is where the integration work genuinely
starts.

### Tier 4: everything else. Steps 2, 9, 11, 13, 14, 15, 17, 18, 19, 20

Not unimportant. Step 11 has a legal clock and step 20 is the number the finance side believes. But none of them
is where a first version wins, and several of them, particularly payroll at step 14, carry the heaviest
integration cost in the whole map.

---

## Step 0 and step 20, which he asked about separately

Nishant: "Step zero and step 20 may save information carry. How do we make sure no values [lost]." Reconstructed
from a broken passage, but the summary confirms the intent: no data or value lost at the two ends.

**The start.** There is no step 0 in our twenty. Step 1 is the application arriving, so step 0 is whatever
happens before it: the job being posted, the advert, the candidate finding it. That is attract, which D-009 rules
out. So the honest answer is that the boundary at the start is a decision we already took, and what has to
survive across it is the application itself plus wherever it came from, because source is the one attribute you
cannot reconstruct later.

**The end.** Step 20 is still employed at day 90, and this is the one that genuinely worries me under a connector
architecture. Employment status lives in payroll. If we only read it we can report the number, but we cannot
guarantee it is attributable back to the hire, because the join between "this person we hired" and "this person
on payroll" happens in somebody else's system. That join is the thing that must not be lost, and it is worth
naming as a requirement now rather than discovering it later.

**The general version.** Under D-015 nothing could be lost at a handoff because we owned the record. Under D-020
every handoff is a place where an identifier can fail to match. So the requirement that replaces "own
everything" is: one identifier that survives every connector, chosen on day one. That is the same identifier the
rehire case needs in exception E1, which is convenient.

---

## What would change this ranking

**The research Nishant asked for.** If the size-of-the-prize work shows the money is concentrated somewhere
other than the three tier 1 steps, the ranking should follow the money.

**A Target answer to question 4.** If a recruiter says steps 3 and 8 already run inside their applicant tracking
system, they move from the free column to the expensive one and tier 1 loses a member.

**The vendor answer on E-Verify state.** If a vendor exposes it cleanly, step 12 has a case for tier 1, because
it is the only step where we would be doing something nobody else does at all.

## What I am not proposing

Not a change to scope. D-013 keeps all twenty in, and this is a sequence inside that. Nishant was explicit that
solving all twenty at once would be ideal and that the ranking is about what to do first, not what to drop.
