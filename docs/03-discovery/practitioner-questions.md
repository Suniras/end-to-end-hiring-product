---
AUTHOR: Claude, assembled from the 14 Aug 2026 research run
WHAT THIS IS: the questions desk research provably cannot answer, ready to use the day we get access
WHAT THIS IS NOT: an interview guide. It has no warm-up, no ordering for rapport, and no follow-ups
DATE: 14 Aug 2026
---

# Questions only a practitioner can answer

## Why this file exists

A research run on 14 Aug 2026 tried hard to find out where time goes in US frontline retail hiring, under strict
rules: fetch every source, drop any claim whose page does not load, never treat a search snippet as evidence.

It found nothing. No independent source publishes the duration of any stage of frontline retail hiring. Details
in [01-diagnosis/research-2026-08-14.md](../01-diagnosis/research-2026-08-14.md).

So these questions are not a nice-to-have. They are the only route to numbers this project needs, and the reason
Q-001, finding five people who hire US retail staff, is the biggest unmanaged risk in the project.

## How to use them

Do not read them out. Pick three or four per conversation. The ones in bold are the highest value.

Every one of these is designed so the answer is a number or a specific fact, not an opinion. That matters,
because opinions about hiring are abundant and free.

---

## For a talent acquisition lead or a store operations director

**1. How long does it take, in calendar days, from application submitted to first paid shift, for a frontline
hourly role? And what is the spread, not the average?**

The spread matters more than the average. An average of nine days made of mostly three-day cases and a few
thirty-day cases is a different problem from an even nine.

**2. Split that clock into three buckets. Time you cannot compress, such as background check turnaround,
right-to-work verification, any drug screen, mandated training. Time you have chosen not to compress, such as
batching, weekly interview slots, approval queues. And time that is pure queueing. Which bucket is biggest?**

This is the single most valuable question in the file. If the biggest bucket is the one that cannot be
compressed, software cannot fix it, and knowing that early is worth more than any feature idea.

3. Where in the funnel do candidates disappear, and what fraction of that loss happens after you have already
decided you want them?

4. What share of accepted offers never work a first shift? What share work fewer than five shifts?

**5. Who owns time-to-hire, and what happens to that person if it doubles? Who owns 90-day retention, and what
happens to that person if it halves?**

This is the buyer question asked properly. It gets at accountability rather than job titles, and it is the
question our own research on field structure could not answer. See [04-segmentation/field-structure.md](../04-segmentation/field-structure.md).

6. Does a store manager see a hiring cost or a hiring budget at all, or is it absorbed centrally?

---

## For someone who can see the data

7. Does your first-year survival curve match the shape found in the research, where about half are gone by five
months? Or is it flatter or steeper? Note that finding is from a non-US grocery chain, so this is a test rather
than a comparison.

**8. Do faster-hired employees stay longer, shorter, or the same, holding store and season constant?**

Nothing in the public literature answers this, and the whole category rests on assuming the answer. Both
Fountain and Paradox sell speed and neither claims tenure. If speed and tenure are uncorrelated, that is worth
knowing before we build. If speed and tenure are negatively correlated, that changes everything.

9. Did anything in your hiring process change in the same window as your last wage or schedule investment? Ask
because bundled changes get credited to one component. The Sam's Club case in our research is exactly this.

10. What is your turnover rate including people with under a year of service? Ask because the industry's best
public disclosure, Costco's 94%, is defined to exclude them.

---

## Where the published research simply stops

These four are worth asking of anyone senior, because a yes to any of them is new evidence rather than desk
research.

11. Has any US retailer run a controlled test of stable scheduling with turnover as a stated outcome up front?
The Gap Inc. trial was a null on aggregate turnover and Seattle's evaluation found no effect on quits or tenure.

12. Has any US retailer run a referral programme rollout with a control group? The most interesting mechanism
found anywhere in our research is that a referral programme's benefit came about 95% from improved retention of
existing staff rather than from the referred hires themselves. There is no US replication.

13. Does manager attention decay the same way here? A CEO letter asking store managers to reduce quitting cut
quits by a fifth to a quarter, faded after nine months, and returned after a reminder.

14. What does a store manager think a departure costs, in hours of their own time? No public dataset measures
this, and both working interventions in the research run through manager and worker time.

---

## Added 25 Aug 2026, from the Anuj and Joy relay

Three questions came out of that call. The first two are now more valuable than anything above, because each
one settles a conflict that is currently blocking a written decision.

**15. How many applications do you get per opening, and how many of those do you actually speak to?**

This is Q-035 and it decides which product we are building. Joy says the US job-to-application ratio is not
high. Anuj says the store manager is buried in screening. Both cannot be the primary pain. If applications are
scarce the product is sourcing and conversion. If they are plentiful the product is screening and throughput.
Everything we have built assumes the second.

Ask it as two separate numbers, per opening, for a normal week rather than a peak. Then ask the follow-up that
tells you which reading is true: how many openings are you covering at the same time. A trickle across eight
openings and a flood on one feel identical to the person doing it and need different products.

**16. Walk me through the last person you lost. Where were they in the process, and what had you done by
then?**

This tests the sharpest claim in the whole dump, E-062: that by the time the manager finishes screening, the
candidate has already taken another job. That claim is the mechanism our entire tier 1 argument rests on, and
it currently has one unsourced second-hand sentence behind it.

Ask it in the past tense about a specific person, per the Mom Test. Do not ask whether speed matters. Ask what
happened. If the answer is consistently "they stopped replying" rather than "they took another offer", the
mechanism is different and so is the fix.

**17. When somebody who used to work here applies again, how do you find out?**

Q-037. Nishant treats rehire as an edge case. Our demo treats it as one of two unskippable moments. One
practitioner answer settles it. If the answer is "the system tells us" the flag is real and reading it is table
stakes. If the answer is "we usually recognise the name" then it is a genuine gap, which is a stronger case for
the feature, not a weaker one.

---

## What to write down afterwards

Whatever the answers, they go in [raw/](raw/) verbatim, one file per conversation, with the date and the role
but no name if the person asked for that. Interpretation goes in [synthesis/](synthesis/) and stays separate.

The separation matters here more than usual, because this project has one recorded case of a summary being
blamed for an error the source did not contain. Keeping the raw words means that argument can always be settled.
