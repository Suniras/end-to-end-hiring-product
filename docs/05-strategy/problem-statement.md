# Problem statement and personas

**AUTHOR: Suniras. This file is a scaffold and it is deliberately empty below each heading.**

Created 26 Aug 2026, because D-026 makes these two things the deliverable. Nishant's words: "by end of your
research and discovery you are convinced that this is the problem statement we are going after, these are the
personas." Then specs, data model, information architecture, engineering high level design, build.

What Claude has done here is set out the shape, list what is already available to fill each section, and name
what is missing. The sentences are yours. Per CLAUDE.md they have to be, and there is a practical reason
beyond the rule: you have to defend this to Nishant on a call, and a paragraph you did not write is very hard
to defend under a question.

---

## Before you start: the one thing that is still missing

**The persona choice.** Everything else is available. This is not.

Q-027 closed on 26 Aug with the answer **no**: there is no single organisational level where hiring volume and
hiring authority both sit. So this cannot be solved by finding the right layer. It has to be chosen. The
comparison table is in Q-027 in OPEN-QUESTIONS.md, mapping store manager, district manager and field HR
business partner against your three objectives.

The uncomfortable shape of that table, stated once so it is not a surprise: **the person who feels all three
objectives cannot buy, and the person who can buy has stated measures where hiring appears as a cost line.**

**You do not need to be certain.** You need to name a choice and write down what would make you change it.
That is what every other decision in DECISIONS.md does, and it is what makes a wrong choice recoverable.
Writing "we are betting on X, and we would abandon that bet if Y" is a finished answer. Writing nothing until
a practitioner appears is not, and Q-036 might produce one this week or never.

---

## 1. Who has the problem

Name one primary person. Secondary people can be listed, but if there are two primaries there is no problem
statement, there are two.

**Available to you:** Q-027's table. E-059 to E-062 on the candidate side and the manager side. Q-027's
original entry on district manager and field HR. 04-segmentation/field-structure.md.

**Not available:** any evidence that separates the three. Nobody we have spoken to has mentioned field HR,
which is the role our own structural analysis points at. That is either an insight or a sign the analysis is
detached, and Q-036 is the cheapest way to find out.

---

## 2. What actually breaks

Describe the thing that goes wrong, in the order it goes wrong, for the person named above.

**Available to you, and this is the strongest part of the file:**

- 01-diagnosis/funnel-map.md. Twenty steps, and **17 of 19 classifiable steps are waits or handoffs.**
- E-062. "By the time they figure out a lot of times they already lost the candidate." Two hops and unsourced,
  and it is the mechanism your whole argument depends on.
- The roughly 6% click-to-apply rate. The best-evidenced number in the project, two independent sources.
- E-061. Hiring is an extra task on an already full day. Do not quote the hours, they drift across retellings.
- 05-strategy/connector-map.md. Which steps run in a system and which run on email and phone.

**Write down which one of these is the cause and which are consequences.** That ordering is the actual content
of a problem statement, and no document in this repo has done it yet.

---

## 3. What it costs, and to whom

**Available to you:** the retail employment and revenue figures, corrected. iCIMS and SHRM time-to-fill at
40 to 42 days and high thirties to low forties.

### The rehire number, since it is going into a document

Flagged specifically because on 26 Aug the intention was stated to put **19%** into the PRD. **Do not use it.**
That figure is a Ceridian/Dayforce marketing blog, built on 850,000 employee records volunteered by its own
clients through an optional product feature, with no sampling frame and no year attached to any statistic. It
was Claude who put it in front of you, and it is withdrawn. It is also grocery specifically, not retail.

**This is the same failure we documented in Anuj's PRD**, where a competitor's gated marketing blog ends up
doing structural work in a cost model. It is worth avoiding for a self-interested reason as much as a
principled one: Nishant asks where numbers come from, and "a payroll vendor's blog" is a bad answer in the room.

**Three numbers exist. Here is what each one can carry.**

| Number | Source | What it can support | How it gets attacked |
|---|---|---|---|
| **8.9% of US retail hires in 2024** were recall hires, 8.5% in 2023 | US Census Quarterly Workforce Indicators. Government payroll data | **The strongest option.** Nobody can attack the source. Use it as the floor | It is a lower bound, seeing returns only within four quarters. Say so yourself before anyone says it to you. Also: retail sits **below** the all-private 12.7%, and there is **no Q4 spike**, so do not imply seasonality |
| **4% of placements**, and rehires turned over **more** than external hires, 36.6% against 33.5% | Arnold et al., Journal of Management 2021, one US retail chain | Honest, peer-reviewed, and the turnover finding is the reason not to claim rehires are better hires | Narrow population, manager trainees at one chain. And the turnover half argues against the feature, so cite it because it is true, not because it helps |
| **33% of holiday 2024 hires** at Macy's were returning colleagues | Named Macy's head of talent | Shows the variation between retailers is very large, which is a genuine argument for making it configurable | One retailer, one season, an executive statement rather than audited data |

**The defensible shape of the claim is a floor plus a range, not a single figure.** Roughly one in eleven retail
hires is a returning worker by government data, that measure undercounts, and at least one large retailer
reports one in three in a holiday season. That sentence survives any question. "19% of hires are returning
people" does not survive the first one.

**And there is a separate point that matters more than the size.** Q-037 established that the population you can
actually serve fast is smaller than the population that exists, because it is gated by four constraints at once:
within three years of the original Form I-9's execution, the original I-9 still retained, an E-Verify case having
existed and returned authorized, and the customer's own background-check policy. **A funnel down from 8.9% through
those four gates is a more useful thing to put in a PRD than any single percentage**, because it is the thing the
product actually has to handle.

**Be careful here, and this is the trap the whole repo is built to avoid.** Every attractive cost number in
this domain traces to a vendor's before-picture. Anuj's PRD uses 21 to 30 days from a Workday executive's blog
post, and its $480 cost per hire and $40M turnover figures rest on a turnover rate we could not trace at all.
Nishant himself says 40. **If you cannot source a cost figure, write "we do not know what this costs" and say
what would measure it.** That sentence is stronger with Nishant than a borrowed number, because he will ask
where it came from.

---

## 4. Why it is not already solved

**Available to you:** Q-012. 02-landscape/gap-claims.md. 02-landscape/paradox.md and fountain.md. The Workday
and Paradox deal at $1.1B with $781M of $1,063M as goodwill against $253M of identifiable intangibles, which
says Workday bought the frontline position rather than the codebase.

**Do not use:** "Paradox does 72 hours." There is no source for it. Joy said only that some companies claim it
and called his own explanation a thesis with no proof point. Paradox's strongest published number is Chipotle
at four days, 96 hours, from Workday's acquisition release.

---

## 5. What we are going to change, and how we will know

**The target is decided.** D-027: five to six days, application to first shift. Two things about it belong in
this section.

**It is an internal goal, not a competitive claim.** Against the 40 to 42 day industry baseline it is an 85 to
88% reduction, which is strong. Against Paradox's published average of **three and a half days** it is slower, so
a pitch built on speed walks into a comparison we lose against a number Workday already publishes. The
positioning that survives is the one already decided: the connector position from D-020 and the spanning view
from D-013.

**Measure it the way they measure it.** Their figures are application to first day worked, confirmed twice from
primary sources. Comparing our days-to-offer against their days-to-first-shift would be cheating, and it is the
kind of thing that gets noticed once and never forgotten.

**Your own words, 26 Aug 2026, recorded verbatim because they are the closest thing to an answer that exists:**

> "It's a complete problem and the solution's main aim would be to reduce time to hire, number of people
> involved, and the least amount of manual work."

**Three things to settle here, and they are the real work of this section.**

**First, this does not match D-017.** That decision records success as time to hire and number of hires. Your
three are time to hire, number of people involved, and least manual work. Number of hires is absent from your
list, and two of your three are absent from D-017. Either D-017 gets amended or the objectives get restated.
It cannot stay both ways, because the metric tree in Phase 7 is built from whichever one is true.

**Second, "number of people involved" is the handoff count**, which is the question you originally put to
Nishant and which four research runs could not answer. If it is a success metric, then v1 has to be able to
count it, and that is a design requirement rather than an aspiration.

**Third, "least manual work" is measured in somebody's hours.** Whose, and against what baseline. If the
baseline does not exist, say the first deployment establishes it. That is the mitigation D-012 already accepted.

---

## 6. What we are explicitly not solving

A problem statement without exclusions is a wish. These are already decided and can be listed as they stand:
D-009 attract, D-010 management roles, D-014 background checks, D-024 sourcing and matching platform features,
D-013 no slice of the twenty steps.

**One open item belongs here and cannot be listed until you decide it:** Q-041, job board distribution. You
said on 26 Aug that a thin funnel makes it desirable and that it was a major point at the end of the meeting.
That contradicts D-009's headline while passing D-009's actual reasoning. Decide it before this section is
written, because it either is or is not an exclusion.

---

## 7. The assumptions this rests on

Every problem statement in a project with no practitioner access is standing on assumptions. Listing them is
what makes it honest rather than confident.

The three that carry the most weight, and all three are unverified:

1. **E-062.** Candidates are lost because contact is too slow. If they are lost for another reason, the product
   optimises the wrong variable.
2. **The primary user.** Whichever one you name, no evidence separates it from the other two.
3. **That speed is worth paying for.** D-017 dropped quality of hire, and the Chipotle case pairs a faster
   cycle with rising turnover in the first full year the tool was live. Both need checking, and together they
   are the sharpest available test of speed against tenure.

---

## Two things not to do in this document

**Do not include a solution.** Sections 1 to 4 describe a problem. If a feature appears before section 5, the
statement has become a pitch, and a pitch cannot be tested.

**Do not smooth over the persona uncertainty.** Naming a bet and its reversal condition reads as judgement.
Writing a confident paragraph over three unseparated candidates reads as certainty you do not have, and it is
the one thing in this document that a person who actually runs retail hiring would spot in a sentence.
