# Frontline hiring platform

Product requirements, version 0.1. Written 27 August 2026.

---

## Summary

We are building software that manages hiring for hourly frontline staff at large US retailers, from the moment
someone applies to the moment they are still on the floor ninety days later.

The product does not replace the systems a retailer already runs. It connects them and sits across the whole
journey, which is the part nobody currently owns.

The target is five to six days from application to first shift worked. The published industry figures sit
between 34 and 42 days, though they measure a shorter span, and the closest comparable vendor number is three
and a half days.

The product is designed around the store manager. Who signs for it is not yet resolved, and neither is which
success metric wins where two of them conflict. Both are marked in place rather than smoothed over.

---

## The problem

US frontline retailers lack a single system that manages and connects the entire hiring journey, from
application through the first 90 days. Handoffs, waiting periods, compliance steps and post-hire follow-through
are fragmented across several systems and teams. That makes it hard to see where candidates are getting stuck,
hard to act on exceptions, and hard to hire people quickly and lawfully.

The clause that matters is the one about handoffs and waiting. We mapped all twenty steps of the journey.
Nineteen can be classified by what kind of step they are. Seventeen of those nineteen are a wait or a handoff.
Two are decisions.

That ratio explains the competitive gap. Fountain and Paradox both compete hard on the two decision steps,
because a decision step demonstrates well in a sales meeting. Six of the twenty steps are sold by neither
company, and nearly all six are waits. A wait does not demo, so nobody builds for it.

---

## Who this is for

Four roles, and they are different from each other by what they do in the buying decision rather than by all
being users of the software.

Only the first one gets a designed workspace. The buyer gets a report. The champion gets an argument. The
blocker gets an audit trail. Those are three different artefacts, not three more products.

### The user: the store manager

The person whose screen opens and whose hours the product gives back.

They already work a twelve to fourteen hour day running a store. Hiring sits on top of that. They do the
screening, the interviewing and the closing, through phone calls, texts and email, and by the time they have
worked through it the candidate has often taken another job. Twelve percent of retail hourly workers say they
have skipped an interview, and the most common reason they give is that they got another job.

What they stop doing: reading applications one at a time, chasing people who have already gone, and finding out
about a problem after it has cost them a hire.

### The buyer: central or senior management

The person who signs, or who owns the budget the money comes from.

**This is named at the level of a group rather than a person, and that is a gap rather than an answer.** A chief
HR officer buys a talent story. A chief operating officer buys store productivity. A chief financial officer
buys a cost line. A VP of talent acquisition buys their own team's workload. Those are four different first
slides, and which one applies is not established. Nobody at a US retailer has told us how this gets bought.

Two consequences follow from the buyer being central while the user is in a store, and they shape the product
rather than just the sales approach.

The product has to prove its value to somebody who will never open it. That is what the reporting layer is for,
and it is why cross-store comparison matters: a single store's numbers mean nothing to a central buyer, and a
comparison across every store in a region is exactly what they look at.

And the person who controls the payroll budget in the field, the district manager, is now not one of these four.
That role owns the constraint store managers actually name, and their stated measures are sales, profit,
productivity, payroll and shrink, where hiring shows up as a cost. If they are neither buyer nor user, the
product needs to survive their indifference rather than win their support.

### The champion: HR, and the store manager

The people who will argue for this internally.

The store manager is both user and champion here, which is normal and is a good sign: the person who feels the
problem is the person who will push for the fix.

HR needs narrowing. Central talent acquisition has hiring volume and no authority over any individual store.
Field HR owns the hourly hiring process across a group of stores and, unlike anyone else in this list, has
hiring in their own stated measures. Those are different people with different reasons to care, and only the
second one is measured on the thing this product improves.

### The blockers

The people who can stop the purchase even when everyone else wants it.

**Senior management, on cost.** The same group named as the buyer can also be the group that stops it, usually
on price or on unproven return. That is less a persona than a pricing objection, and it is why the product must
be able to show what it changed rather than assert it.

**Employment counsel.** The product scores candidates from a screening conversation and a person still decides.
That makes it a regulated automated employment decision tool. It brings an annual independent bias audit with a
published summary, ten business days of notice to candidates in New York City, exposure under federal
discrimination law if the score correlates with race, sex or age, and a requirement to offer disabled candidates
an alternative path, because a model reading interview behaviour can screen people out on speech or processing
time. California's rules, in force since October 2025, cover a tool that merely helps a human decide, so keeping
a person in the loop does not put the product outside the definition there, and those rules require four years
of retention covering the system's inputs.

This person does not need convincing that hiring is slow. They need convincing the product will not produce a
lawsuit.

**IT security.** The product connects to systems the retailer already runs and holds identity data about
applicants. Several states impose affirmative technical duties on anyone holding Social Security numbers, and a
large retailer's security review is thorough. This is the review that ends enterprise purchases quietly, and it
happens late unless it is planned for early.

### What is settled here and what is not

Settled: the store manager is the user. The product is designed around their day.

Not settled: which specific person signs. Everything else in this document survives either answer, but the first
slide of the pitch and the shape of the reporting layer do not.

## What happens today, and how long each step takes

Read the confidence column before reading any single number.

Verified means a regulation, a government dataset, or a named published source states this duration.
Derived means we calculated it from verified numbers, and the arithmetic is shown so it can be checked.
Estimated means it is our own figure, the basis is stated, and version 1 has to measure it and replace it.

Almost every verified row is a legal deadline. That is not an accident. Deadlines are written into regulations
and are therefore public. Operating durations are not published by anyone, because no retailer gains by
publishing how slow its hiring is and every vendor gains by quoting an unsourced version. Four rounds of
research found no traceable figure for the length of any individual step.

### Applying and screening

| Step | How long now | Confidence | Who owns it | Source |
|---|---|---|---|---|
| 1. Application arrives | 5.26% of retail job ad clicks become a finished application. 60% of frontline workers have started one and never finished | Verified | Software | Appcast 2024 retail figure, from 1,300 employers and 281 million clicks. iCIMS 2025 survey of 1,000 US hourly workers for the 60% |
| 2. Hard eligibility rules: age, right to work, availability | Seconds if automated. Hours to days if a person reads each one | Estimated | Software | The step is deterministic. What takes time today is the queue, not the work |
| 3. Screening conversation | The conversation runs 3 to 5 minutes. Getting it scheduled is the cost | Verified for the call | AI agent | Measured on Nurix's live aviation deployment |
| 4. Interview scheduled | 1 to 3 days | Estimated | Handoff between people and systems | No independent figure exists. Both competitors lead with this feature, which is indirect evidence it is slow |
| 5. Interview happens, or does not | Interview runs 20 to 45 minutes. 12% of retail hourly workers say they have skipped an interview, and 28% of those say it was because they got another job | Verified for the 12% | Candidate | iCIMS 2025, 1,000 US hourly workers, fielded 31 July to 11 August 2025. This is a lifetime question, not an annual rate |
| 6. Hire or reject | Median 4 days from decision to offer. Quarter of cases take 2 days, quarter take 7 or more | Verified | A person, always | SHRM Benchmarking: Talent Access, 936 organisations, data collected April to November 2021, all industries |

### Offer and checks

| Step | How long now | Confidence | Who owns it | Source |
|---|---|---|---|---|
| 7. Offer made | Minutes if automated. Days if it waits for someone | Estimated | Software, person approves | |
| 8. Offer accepted, or goes quiet | Median 2 calendar days. Three quarters land within 4 days | Verified | Candidate | SHRM, 942 organisations, same 2021 collection. This ties for the fastest step in the whole journey, which is the opposite of what we assumed |
| 9. Background check ordered | Minutes if automated | Estimated | Software. We never run checks ourselves | |
| 10. Background check returns | 24 to 48 hours for a criminal-only search. Add 1 to 3 days if employment verification is included | Verified | Fixed wait | Published turnaround from the screening vendors. First Advantage states employment and education verifications typically return within one to three days |

### Onboarding

| Step | How long now | Confidence | Who owns it | Source |
|---|---|---|---|---|
| 11. I-9, W-4, direct deposit, policy sign-offs | Section 1 on or before day one. Section 2 within 3 business days of day one. For jobs shorter than three business days, Section 2 must be done by the first day | Verified | A person must physically examine documents | 8 CFR 274a.2 and the Form I-9 instructions, edition 01/20/25 |
| 12. E-Verify submitted and cleared | Case must be created by the third business day after the employee starts work for pay. 10 federal working days to resolve a contested mismatch | Verified | Government system | E-Verify User Manual, sections 1.5, 2.2 and 2.2.1 |
| 13. Required training | Hours of content. Elapsed time depends on scheduling, not on how long the content is | Estimated | Software and a person | |
| 14. Uniform, badge, systems access, payroll record | Hours of work spread across days, because it crosses four systems and two teams | Estimated | Software and people | Sold by neither competitor |
| 15. First shift scheduled | Bounded by the store's rota cycle, usually weekly | Estimated | A person | This is the wait nobody names. Somebody cleared on a Wednesday can still sit until the next rota is published |
| 16. Day one | A date, not a duration | Fixed | Candidate | Published day-one no-show figures come from surveys asking employers whether they have ever had one, which is not a rate |

### First ninety days

| Step | How long now | Confidence | Who owns it | Source |
|---|---|---|---|---|
| 17. Week one training on the floor | Days | Estimated | A person | |
| 18. Ramp to working unsupervised | Weeks. No published figure for retail | Estimated | A person | |
| 19. 30, 60 and 90 day check-ins | Fixed by definition | Fixed | A person | Cannot be shortened. The open question is whether they happen at all |
| 20. Still employed at day 90 | A measurement point | Fixed | | 8.9% of US retail hires in 2024 were people returning to a former employer, per Census Quarterly Workforce Indicators |

### End-to-end figures, and a warning about comparing them

SHRM's time-to-fill runs from the day a job opens to the day an offer is accepted. It stops there. It does not
include the wait between accepting an offer and working a first shift.

Our target covers application through to first shift worked. So the published industry numbers and our target
do not measure the same span, and putting them side by side overstates our improvement by however long
onboarding takes. Onboarding is exactly the part nobody publishes.

| Figure | Value | What it measures |
|---|---|---|
| SHRM 2026 benchmarking | 39 calendar days, median for non-executive roles, down from 44 the year before | Job opens to offer accepted |
| iCIMS 2023 Workforce Report | 34 days average for retail, the fastest of its industries, against 41 overall | Job opens to offer accepted |
| Employ 2025 | 7.2 days to screen | Application to screened |
| Paradox, published by Workday | Three and a half days average | Application to first day worked |
| Chipotle, using Paradox | 12 days down to 4 | Application to first day worked |

Only the last two are comparable to our target, and both are a vendor describing its own product.

Two numbers in circulation that we do not use. A 21 to 30 day industry baseline, which traces to a blog post by
a Workday executive and is the vendor's own before-picture. And a claim that Paradox achieves a 72 hour hire,
which has no source anywhere in Paradox's material, Workday's newsroom, or Chipotle's own releases. The likely
origin is arithmetic: a headline claiming a 75% cut from 12 days works out to exactly 3 days.

---

## Where the time actually goes

You cannot shorten a legal deadline. You can start it earlier and you can run it alongside something else.
That is the whole mechanism, and saying it plainly is better than implying the software makes anything
intrinsically faster.

Here is the arithmetic, shown so it can be checked.

The fixed waits before someone can start work are a criminal background check at two business days, and up to
seven days waiting for the next rota to be published. Call it nine days at worst and two days when the rota is
not the constraint.

The I-9 and E-Verify clocks both run after the first day of work, so they delay nothing at all.

Against a forty day baseline that leaves roughly thirty-one to thirty-eight days which is not a legal deadline.
It is queue time, handoff time, and time waiting for a person who is busy doing something else.

That is the entire surface this product can act on, and it is where the funnel map already said it was.

This conclusion is derived, not measured. The forty days comes from vendor platform data and the rota figure is
our estimate. If the baseline moves, the conclusion moves with it.

---

## How we shorten it

### Remove the queue

Steps 2, 7 and 9 are deterministic. Nothing about them requires judgement. What takes time today is that they
sit waiting for a person to reach them. Automating a deterministic step does not make a decision faster, it
removes a queue.

This is the cheapest time in the journey to recover and the least interesting to talk about.

### Start the clock earlier

Ordering a background check when a conditional offer goes out, rather than after the candidate accepts, takes
two business days off the critical path.

There is a legal floor on how early, and it varies by state and city. Federal consumer reporting law imposes no
timing restriction at all: it only requires a standalone written disclosure before the report is obtained, plus
written permission. State fair chance law is where the limit sits. California makes it unlawful for employers
with five or more staff to look into conviction history until after a conditional offer, and California's
regulations extend that ban to the background check itself and to internet searches. New York City requires all
non-criminal vetting to happen first. Illinois requires the applicant to have been found qualified and told
they are being selected for interview.

So the mechanism is to order at conditional offer, not at acceptance. That is the earliest lawful point in the
strictest jurisdictions and it still moves the check off the post-acceptance path. It has to be configurable
per jurisdiction rather than a single rule.

### Run independent things at the same time

Onboarding paperwork, training assignment, badge and systems provisioning, and rota placement are largely
independent of each other. They happen one after another because different people own each one. Overlapping
them is a coordination change rather than a technical one.

This one has a cost the retailer will notice. Under federal wage law, mandatory job-specific onboarding
training is hours worked and must be paid. The regulation sets four conditions for training time to be unpaid
and mandatory onboarding fails two of them. The small-amounts exception will not cover it either, since the
practical floor there is around ten minutes a day.

So moving onboarding before the first shift converts unpaid waiting into paid time. That does not kill the
mechanism. It means the pitch is "faster, and here is what it costs", which is a better conversation to have
before a customer discovers it themselves.

### Make the wait visible and tell the candidate

Steps 5, 8, 10 and 16 are waits we do not control and cannot compress. The mechanism here is not speed. It is
not losing the person while they wait.

There is some evidence this is where candidates are actually lost. Twelve percent of retail hourly workers say
they have skipped an interview, and the most common reason given is that they got another job. Separately, 77%
of hourly workers in manufacturing say they would accept a job within 48 hours of applying or interviewing. No
retail equivalent has been published and manufacturing was the highest of four sectors surveyed, so treat that
as an upper bound.

### The rehire path, where the journey genuinely collapses

Somebody returning within three years of the date their original I-9 was first completed can reuse that form
rather than starting again. If an E-Verify case was created from the original form and came back authorised, no
new case is needed either.

For that group, steps 11 and 12 largely disappear, and steps 13, 14 and 17 shorten because the training record
and the systems access already exist.

The honest sizing. Census Quarterly Workforce Indicators put returning workers at 8.9% of US retail hires in
2024, below the 12.7% figure for private industry as a whole, with no fourth-quarter spike. One peer-reviewed
study of a US retail chain found 4% of placements and also found returning workers left slightly more often
than external hires, so this is a speed feature and not a quality one. Average time away in that study was 1.77
years, which sits inside the legal window.

The group we can actually serve fast is smaller than 8.9%, because four things all have to be true: the return
is inside three years of the original form, that form was still retained, an E-Verify case existed and came
back authorised, and the retailer's own background check policy allows reuse. Working that funnel out is a task
for version 1, not something this document can compute.

---

## Requirements

The product connects to the systems a retailer already runs rather than replacing any of them. That decision
reverses an earlier plan to be the system of record, and it removes the hardest part of the sale.

All twenty steps are in scope, including the ones we never automate. The spanning view is the claim.

Step 6 produces a score from the screening conversation and a person still decides. That makes the product a
regulated automated employment decision tool, which brings an annual independent bias audit with a published
summary, ten business days of notice to candidates in New York City, exposure under federal discrimination law
if the score correlates with race, sex or age, and a requirement to offer disabled candidates an alternative
path, since a model reading interview behaviour can screen people out on speech or processing time.

California's rules, in force since October 2025, define an automated decision system to include anything that
merely helps a human decide. Keeping a person in the loop does not put us outside that definition there, and
those rules require four years of retention covering the system's inputs.

We never perform background checks. We order them, track them, and run the required notice sequence when
something comes back that affects a hiring decision.

I-9 and E-Verify are handled by an embedded specialist vendor. The one hard requirement on that vendor is that
it must expose the E-Verify case state, because without it we cannot enforce the rule that a contested mismatch
does not become grounds for adverse treatment.

Identity matching uses the retailer's own records only. This is a hard architectural boundary, not a
preference. Matching within one customer's own data keeps us a service provider. The moment records are pooled
across customers and a candidate from one retailer is surfaced to another, we become a consumer reporting
agency and inherit an entirely different regulatory regime. Scoring does not cross that line. Pooling does.
Enforce isolation at the data layer, because the whole value of this rule is that it cannot be undone by a
query someone writes in a hurry.

A Social Security number is the right key for matching a former employee, because payroll and E-Verify both run
on it. It cannot be the key when someone applies, because it does not exist yet at that point and is never
required to apply for a job. So matching before hire runs on name, date of birth, email, phone and address,
which is probabilistic. Tune it to under-merge. Wrongly joining two people would attach one applicant's
rejection, or another person's do-not-rehire flag, to somebody it does not belong to, and in hiring that is a
discrimination complaint rather than a bug. Show the operator what was merged and let them split it.

Re-contacting a past applicant about a new opening is lawful, and the consent wording captured at application
is part of the design rather than a wrapper around it. Federal rules turn on whether a message is closely
related to the purpose the phone number was given for, so consent language written for one job may not cover a
different one months later. Washington State needs separate handling: its statute bans commercial texts to
Washington mobile numbers without clear advance consent, and a state appeals court held in September 2025 that
recruitment texts count as commercial. Opt-outs must be honoured within ten business days.

---

## What we are not building

Advertising and attraction as a category. We have no data advantage there and would be reporting on another
vendor's records while competing with their analytics.

Hiring for management roles in version 1. Hourly hiring is volume and throughput. Management hiring is a
low-volume quality decision made a handful of times a year by someone who cannot afford to get it wrong. A
product that serves both well is two products sharing a name.

Skill graph taxonomies, candidate sourcing marketplaces and job board aggregation as a platform. That is a
different product with a different buyer.

Looking up where a candidate currently works from third-party data. Three separate reasons, any one of which
would be enough. No such interface exists: LinkedIn has no endpoint that takes a name and returns an employer,
and closed its job posting interface to new partners. Doing the lookup on an employer's behalf makes us a
consumer reporting agency, because the same lookup is unregulated when the employer does it and regulated when
a vendor does it for them. And frontline hourly workers are largely absent from the profile databases that sell
this capability, so the data would not be there for our population anyway.

Undecided, and named rather than buried. Job board distribution, where the current thinking is to take the
free routes because nobody can refuse them and buy wider reach only if a customer asks. Pricing. Contingent and
temporary staffing.

---

## What version 1 measures from day one

Every estimated row in the table above is a number this product has to produce from its own operation. No
public source has it and four rounds of research established that.

For every step, for every customer, record the timestamp on entry and exit, so duration is measured rather than
guessed.

Record who or what acted: the AI agent, deterministic software, a named person, or a fixed wait.

Count handoffs per hire, meaning every time the record passes between actors. This is one of the stated goals
and no research round could answer it for any real retailer, so the product is the instrument.

Separate queue time from work time. The distinction is the whole product argument and it cannot be
reconstructed later if it is not captured at the time.

Record the application source per store. This is a compliance record under federal contractor rules covering
veterans and disability, which survived the 2025 rescission of the older executive order, rather than an
analytics feature. Per-store source analytics do not work: a store hiring 20 to 40 people a year across 4 to 6
sources would pick the right top four sources only about a third of the time, and the underlying label is
unreliable anyway, since one study of 15,276 candidates found only 17% agreement between system records,
candidate self-report and recruiter notes on what the source was.

Report unique people separately from applications. Every major competitor deduplicates records for hygiene and
then still counts applications. None of them reports unique people as a metric.

Measure elapsed time as application to first shift worked. Any other endpoint makes our number incomparable
with the only published figures that cover the same span.

---

## Risks and what is still open

The buyer is not named at the level of a person. The store manager is the user and that is decided, so the
product has a subject. But a chief HR officer, a chief operating officer, a chief financial officer and a VP of
talent acquisition each buy a different thing, and nobody at a US retailer has told us how this gets bought.

That gap has a second edge. The buyer is central and the user is in a store, so the product has to prove itself
to somebody who will never open it. If the reporting layer is weak, the renewal conversation happens without
evidence.

The success metrics conflict. An earlier decision set them as time to hire and number of hires. The goals as
stated more recently are time to hire, number of people involved, and least manual work. Number of hires is
absent from the second list and two of the three goals are absent from the first. One of the two has to give,
because the metric tree gets built from whichever is true.

The core mechanism has never been measured by anyone. No published source gives an elapsed-time saving from
running hiring stages in parallel. The only structured source is the US Office of Personnel Management's
end-to-end hiring roadmap from March 2017, which budgets a fully sequential fourteen-step federal process at 80
calendar days and shows the security check starting at tentative offer, but publishes no measured result. So we
know the shape of the mechanism and not its size.

Speed cannot be the pitch. The market leader publishes three and a half days. Our target is slower. What we sell
is that the retailer keeps the systems they already run, and that one product spans all twenty steps including
the ones it never automates.

Nobody outside this company has told us the problem is real. Four rounds of research and three verification
rounds have not replaced one conversation with somebody who has run hourly hiring at a large US retailer. Every
estimated row above would improve with one such conversation.

One legal question is unresolved and it affects the identity design. There are reports that federal immigration
enforcement guidance warns employers away from I-9 software that requires a Social Security number to onboard.
If that holds, an SSN-keyed design is not merely unnecessary but is named as a hazard. This needs checking
before the identity model is built.

---

## Appendix: where the numbers come from

Every figure above is either cited inline or marked estimated. Nothing in this document is an unsourced number
presented as fact, which is a deliberate choice, because most circulating figures in this market trace back to a
vendor's marketing.

This project keeps its full working record separately. Decisions with their reasons and the conditions that
would reverse them are in DECISIONS.md at the repository root. Open questions with an owner against each are in
OPEN-QUESTIONS.md. Every claim with its evidence tier, and a list of circulating numbers that must not be used,
is in EVIDENCE.md. The four verification rounds behind the timing table are in 01-diagnosis/.

Authorship, recorded because this project has a rule about it. The problem statement and the goals are Suniras's
own words. The scope and requirements are assembled from decisions he made. The timing table, the arithmetic on
where the time goes, the four mechanisms and the measurement requirements were written by Claude from the
research record. Two sections are marked incomplete because they need a decision that is his to make.
