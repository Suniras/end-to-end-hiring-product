---
AUTHOR: Suniras. Claude wrote the questions and the notes under them, nothing else.
WHAT THIS IS: the v1 scope decision. Which steps, which person, what it replaces, what it explicitly is not
STATUS: all seven answered 16 Aug. Three need work before they can be built on. See the challenges under each
DATE STARTED: 16 Aug 2026
---

# What v1 is

## Answered so far

**Question 1 is answered and it is a no to the premise of the question.** No slice. All twenty steps. Recorded
as D-013 with the reasoning and the cost. The row-by-row consequence is in
[automation-breakdown.md](automation-breakdown.md).

**Question 6 is answered by implication and needs one correction.** Nothing in the funnel is excluded, so the
only non-goals left are attract as a category, per D-009, and management roles, per D-010.

The correction: on 14 Aug you marked step 1, application captured, as out because it is an attract feature.
Covering steps 1 through 20 puts it back in. That is fine and probably right, since capture is not attract, but
the two statements contradict each other and the later one wins unless you say otherwise.

**Questions 2 to 7 answered 16 Aug.** Suniras's words are transcribed under each. Where I have pushed back it is
labelled as a challenge and it is separate from his answer.

Three of the six need more work before anything is built on them: the user, the metric, and the assumption. The
metric one is not a matter of taste, it contains a direct contradiction with a recorded finding.

---

## How to use this file

Answer the six questions in order. Short answers. If a question takes more than a paragraph you are probably
avoiding it.

Everything you need is already in the repo. [01-diagnosis/funnel-map.md](../01-diagnosis/funnel-map.md) has the
twenty steps with your own read on each one, plus a section at the bottom counting what your answers add up to.
[02-landscape/gap-claims.md](../02-landscape/gap-claims.md) has what Fountain and Paradox get wrong, with an
evidence tier on every claim.

**You are choosing without measured evidence, and that is a deliberate decision, not a shortcut.** Two research
attempts failed to find how long any stage of frontline retail hiring takes. D-012 records why we stopped
looking. So question 6 is not optional paperwork. It is the thing that makes choosing this way honest.

---

## 1. Which steps does v1 cover?

A contiguous run. Steps X to Y.

*Why contiguous. A product covering steps 2, 7 and 14 is three integrations and no experience. A product
covering 2 through 6 is a flow somebody can live inside. Wide and shallow is the one shape you cannot win from a
standing start, and it is exactly what Workday and Fountain already sell.*

**Answer:**

---

## 2. Who opens this product, and how often?

One role. The person who would use it in a normal week, not the person who approves it.

*Q-027 is only partly answered and this question does not wait for it. Your answer here is allowed to be a
guess, as long as it is written as one. What is not allowed is leaving it blank, because a product with no named
user gets built for everybody and used by nobody.*

**Answer, 16 Aug:** "in a normal week, hiring managers, store managers, anyone who is involved in the hiring
process"

**Challenge.** That is three roles plus anyone, which is the outcome the question was written to avoid. A
product designed for everyone involved gets designed by committee and ends up being nobody's daily tool.

I do not think the fix is to pick one role and drop the rest. A spanning view across twenty steps genuinely does
serve several people, and pretending otherwise would be false. The fix is to name the **primary** user, defined
by one test: **whose week gets measurably worse if this product disappears on Monday?**

That person gets the product designed around their day. Everyone else gets a view onto it. Without that ranking
there is no way to resolve any design argument, because every screen will have three plausible owners.

Worth noting that a store manager and a central recruiter cannot both be primary. Per the sharpest observation
recorded in this project, the store manager has authority over their own hiring but too little volume for a tool
to be worth their attention, and central talent acquisition has the volume but no authority over what a store
does. Whichever you pick, you are picking which of those two problems you are willing to live with.

---

## 3. Who signs the contract, and what are they measured on?

The buyer. Not the same person as question 2, usually.

*The research found that a district manager is measured on sales, profit, productivity, payroll and shrink. If
your buyer's measures do not include anything v1 moves, the deal can still close and the product can still go
unused. That is the failure mode written into D-012.*

**Answer, 16 Aug:** "top management. payroll hours don't affect us"

**Challenge, and it is small.** Top management is not one person and they do not buy the same way. A chief HR
officer buys a talent story. A chief operating officer buys store productivity. A chief financial officer buys a
cost line. A VP of talent acquisition buys their own team's workload. Naming which one changes the pitch, the
pricing and which metric from question 5 goes on the first slide.

This is not urgent. It becomes urgent the moment anyone builds a pitch.

**A structural note, not an argument.** Combined with question 2, the buyer now sits at the top of the company
and the users sit in stores and in recruiting. That is normal in enterprise software and it is also exactly the
configuration that makes adoption rather than the sale the main risk. D-013 already records that risk. Nothing
to resolve here, just something the design has to answer later.

---

## 4. What does v1 replace?

What does the person in question 2 do today, in the steps from question 1, that they would stop doing?

*If the honest answer is "nothing, this is new," say that. It is a harder product to sell and it is better to
know now. If the answer is a spreadsheet, a WhatsApp group or a phone, say which.*

**Answer, 16 Aug:** "it is supposed to replace a lot of things. first its a complete database of all the
candidates and their lifecycle. many other things are also in scope, features of which we've answered in funnel
map"

**Was consistent with D-015. REVISED 18 Aug 2026.** D-020 reverses that: we are a connector layer, not the
system of record. So "a complete database of all the candidates and their lifecycle" is no longer literally what
we are. As a connector we hold the state of the steps we sit across and read the rest. Worth rewording before it
reaches a pitch, because a buyer will hear "database" as "replace my ATS", which is exactly the sale we just
decided not to make.

**Challenge.** That answers what it replaces for the **company**. It does not answer what it replaces for the
**person in question 2**, which is what the question was asking.

Nobody adopts a database. They adopt the thing that removes a job from their week. So: on Monday morning, what
does that person stop doing? Stop chasing a recruiter for a status. Stop keeping their own spreadsheet of who is
starting. Stop phoning candidates who went quiet. Whichever it is, that sentence is the demo, and right now we
do not have it.

---

## 5. What one number moves if this works?

One. Named, with the population it applies to.

*Two traps here, both already documented. Time-to-hire is what every competitor claims and it is a feature
metric dressed as a business one. Ninety-day retention is what nobody claims, because it is genuinely hard to
prove and it takes ninety days to find out. Picking either is fine. Picking either without knowing which trap
you have walked into is not.*

*Note also Q-030: if the number you pick is hiring volume, remember that succeeding at retention reduces it.*

**Answer, 16 Aug:** "time to hire, number of hires, quality of hires (is the goal)"

**Challenge, and this one is not a matter of taste.** Two of these three fight each other, and it is provable
rather than arguable.

**Number of hires goes down when quality of hire goes up.** That is Q-030 and it comes from Derenoncourt and
Weil, NBER w32546: twenty voluntary wage-floor events at five US retailers each over 150,000 employees, credit
bureau payroll data on about 18 million hourly workers. Total headcount rose, 1.25% across all events and 4.62%
at the $15 events, while year-on-year growth in new hires **fell**, with coefficients of -0.860, -0.798 and
-1.123, all significant at 1%.

Fewer people left, so fewer people had to be hired. If we succeed at the stated goal, one of our own success
metrics moves the wrong way. A customer will notice this in year two, in a renewal conversation, holding a chart
showing they hired fewer people after buying our product.

**The other two each carry a known trap, both already documented here.**

Time to hire is what every competitor already claims and none of them claims anything else. It is also a feature
metric wearing a business metric's clothes, which is the distinction in the project glossary.

Quality of hire is the genuinely unclaimed ground and it is unclaimed for a reason. It is hard to prove, it takes
at least ninety days to observe, and the buyer may not hold a baseline to measure it against: Walmart's FY2026
10-K discloses no turnover figure at all, and Costco's 94% retention is defined to exclude anyone with under a
year of service, which is where the churn sits.

**RESOLVED 16 Aug.** Suniras dropped quality of hire. The metrics are **time to hire and number of hires**.

That closes the conflict properly, since number of hires only fought quality of hire. Recorded as D-017 with the
two consequences: our metric story is now identical to the incumbents', and number of hires is set by the
customer's own growth and churn rather than by anything we do. Neither is a reason to change it. Both need
handling before this reaches a pitch.

---

## 6. What is v1 explicitly not?

Every step in the funnel v1 does not touch, with one line of reason each. Then anything else people will assume
we do.

*This is the most useful part of the file and the part most likely to get skipped. A broad horizon is a roadmap.
A broad v1 is how products fail. Nishant said keep the horizon broad and cut scope later, and this list is the
mechanism that makes "later" actually happen.*

*Existing non-goals to carry forward: attract, per D-009. Management roles, per D-010. Both already have their
reasons written down, so they only need a pointer here.*

**Answer:**

---

## 7. What you are assuming, and what would prove you wrong

Not a question. A requirement, and the reason this file can be written at all without practitioner data.

For the slice you picked, write down what has to be true for it to be worth building. Then write what would
tell you it is false, and where that evidence would come from.

*Example of the shape, not of the content: "This assumes the wait at step N is caused by X. If a practitioner
says it is caused by Y instead, the slice is wrong and we move to steps A to B."*

*This is what turns choosing-without-data from a guess into a position. It is also what
[03-discovery/practitioner-questions.md](../03-discovery/practitioner-questions.md) gets pointed at the moment
you have access to anyone.*

**Answer, 16 Aug:** "i am assuming that we can do the entire end to end hiring lifecycle tracking and also
automation in one place, and i would be proven wrong, if there is too much complexity in it, maybe things that
need to be outsourced or anything which might break our flow and such"

**Challenge.** The assumption is the right one. The falsifier is not falsifiable. Too much complexity has no
threshold, so nothing that happens can ever trigger it, which means it will not protect you.

The good news is that this particular assumption can be turned into a number, and the work to do it is already
queued.

**Make it this instead.** Count the systems. For each of the twenty steps, identify which system holds the truth
today: applicant tracking, HR information system, payroll, workforce management, the screening agency, the
learning system, identity and access. Then count the distinct integrations required for the pipeline to be
complete for one customer.

Pick a number now, before seeing the answer. If it comes back at or under that number, the assumption holds. If
it comes back well over, the one-place claim is not deliverable as stated and the response is to decide which
steps are genuinely tracked versus merely displayed.

That map is the next piece of work, and it matters under either architecture.

**REVISED 18 Aug 2026.** This paragraph originally said that being the system of record moves the integrations
rather than removing them. D-020 reverses the architecture, so the integration list changes shape again: we now
also need a connector to the applicant tracking system itself, which under D-015 we would have replaced. The
count barely moves. What changes is the posture, and most of it becomes reading rather than writing. See
connector-map.md, which answers the question Nishant actually asked.

**ANSWERED 16 Aug 2026. The number is six to eight, most likely seven.**

Full working in [integration-surface-map.md](integration-surface-map.md). Payroll and HR system of record,
workforce management, the corporate identity directory, the background check agency, E-Verify, a learning
system, and the store access layer. Six only when payroll and workforce management come from the same vendor.
Eight when badge issuance and point-of-sale provisioning are separate products, which is common.

Plus four to six vendors we license once and embed rather than negotiate per customer: messaging, e-signature,
a W-4 withholding engine, calendar federation, resume parsing, and possibly an I-9 vendor.

**So the assumption holds on the count.** Seven customer-side systems is a normal enterprise integration load,
not an impossible one. The one-place claim is deliverable.

**But you never named your threshold, so this cannot count as a passed test.** You were asked to pick a number
before seeing the answer, and you did not. Whatever you feel about seven now is shaped by having read it. Worth
knowing about yourself for the next one of these.

**And the count is not where the risk turned out to be.** Three things in the map matter more than the number:

Six systems still means seven API surfaces, because payroll and workforce management inside one vendor are
separate products with separate authentication.

The two integrations that gate the schedule, ADP payroll and E-Verify, publish no total timeline anywhere. Any
duration you have seen quoted for either is unsourced.

And the largest unknown in the entire map is not an integration at all. It is what a retailer can actually
export out of the applicant tracking system that D-015 requires them to leave. Nothing was verified for any
vendor. Raised as Q-032.

---

## When this file is done

The six answers plus the assumption. Then it goes to Claude to be argued against, hard, before anything else is
built on it.

After that: success metrics with baselines, then the PRD at 07-prd/, then S1.
