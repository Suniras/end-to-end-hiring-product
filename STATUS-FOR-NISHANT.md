# Frontline hiring platform: where the project stands

**For Nishant. Internal.**

Version 2, prepared 18 Aug 2026. Version 1 went to you on 11 Aug.

---

## What changed since version 1

Version 1 said there was no problem statement, no proposed v1, and that our own starting premise was in
question. All three of those are now resolved, and the last of them was resolved by deciding to stop asking.

**There is now a working demo you can click through.** That is the main thing in this document, and the main
thing I want from you is you taking it apart.

---

## The short version

Scope is decided and written down: all twenty steps of the funnel, from an application arriving to somebody
still being on the shop floor at day ninety. Seven decisions were taken on 16 and 17 August, each with a
reason and a condition that would reverse it.

A demo of it exists and runs. Ten screens, an overview page in front of them, and a read-aloud script. Every
external system in it is simulated and says so on screen.

The problem being solved is written out in full in section 1, including the two parts of it that are still
mine to settle. Three other answers I have recorded are weak and section 4 says which.

Three things are asked of you, in section 7. Feedback on the demo. Practitioner access, which is the same
thing I asked for on 11 August and have not got. And one question that got sharper this week: whether this
belongs on the NuAisle shelf at all, now that we have decided to replace the customer's applicant tracking
system rather than sit on top of it.

---

## 1. The problem we are solving

### The statement

> US frontline retailers lack a single system that manages and connects the entire hiring journey—from application through the first 90 days—leaving critical handoffs, waiting periods, compliance steps, and post-hire follow-through fragmented across multiple systems and teams. This makes it difficult to see where candidates are getting stuck, act on exceptions, and ultimately hire people quickly and compliantly.

Everything below takes that statement apart clause by clause and puts the work behind each one, so it can be
challenged in pieces rather than as a whole.

### What each part of it means, concretely

**"Lack a single system."** One person's application crosses **twenty separate steps**, four or five different
people, and five or six different systems. The twenty steps are mapped out in full, from an application
arriving to that same person still being on the floor at day ninety.

**"Critical handoffs, waiting periods."** This clause has the most work behind it. Every one of the twenty
steps was marked as a decision, a handoff or a wait, and the answer came back lopsided:
**seventeen of the nineteen classifiable steps are a wait or a handoff, and only two are decisions.**

That matters because the two decision steps are exactly where both existing tools compete, and the waits are
where they do not. Six of the twenty steps are sold by neither incumbent, and almost every one of those six is
a wait. They each own the steps that happen inside their own product. Neither owns the gaps, because a gap is
not a demonstrable feature.

**"Compliance steps."** Six of the twenty run on a clock rather than on somebody's availability, and four of
those six are legal rather than calendar. The I-9 must be examined by a named person within three business
days of the first day of work. E-Verify has its own three-day window, and if a check comes back mismatched and
the employee contests it, removing their shifts is unlawful until the case closes. A background check runs on
a county court's timetable, and if anything adverse comes back the notice sequence around it cannot be
collapsed. First shifts in covered cities need about fourteen days of notice, with a premium to change them
inside that.

Every one of those deadlines has been checked against the regulation or the government page rather than
against a vendor blog. Counsel sign-off is still needed before any of it enters a specification.

**"Post-hire follow-through."** The four activate steps: week one training, the ramp to working unsupervised,
the thirty, sixty and ninety day check-ins, and still being employed at ninety days. Both incumbents are
quietly building here and neither markets it.

**"Difficult to see where candidates are getting stuck."** Not a figure of speech. Two independent research
runs, the second under strict sourcing rules where any claim whose source would not load was dropped, failed
to find a single traceable published number for how long any stage of US frontline retail hiring takes. Every
figure circulating in this market is a vendor quoting another vendor, and sixteen of them have been
checked and killed by an adversarial pass. Nobody can see it because nobody has ever measured it.

**"Act on exceptions."** This is what the demo's opening screen is. Three hundred and twelve applications over
a weekend, two hundred and forty seven of which needed nobody, and sixty five that did, grouped into four
things to do rather than sixty five items to read.

**"Quickly and compliantly."** Those two words are the two success metrics, and nothing else is claimed.

### Who has this problem

The person who runs hourly hiring across a group of stores. In the demo that is a field HR manager covering
eighteen stores, with a store manager as the second seat.

The research says this role genuinely splits in two, which is part of why it has stayed unsolved. A district
manager covers fifteen to twenty stores and is measured on sales, profit, productivity, payroll and shrink, so
they hold the money but not the hiring process. A field HR business partner covers a group of stores and runs
the hourly hiring, so they hold the process but not the money. **The person who owns the constraint is not the
person who owns the work.**

### What it costs them

Four things, in the order a retailer feels them.

**Roles stay open longer than they need to,** not because a decision was slow but because a handoff waited on
somebody opening an email.

**Candidates are lost after the retailer has already decided it wants them.** The largest losses in the
recorded funnel sit at the offer going quiet, the interview no-show and day one. All three are steps neither
existing tool sells into.

**Legal clocks run with nobody watching them.** A store manager who has never heard of a verification
mismatch will drop somebody's shifts by accident, and no system currently stops them.

**The wrong person gets rehired.** Somebody terminated for cause at one store applies to another, spells their
name differently, changes their contact details, and to any system starting from today they are a brand-new
applicant.

### Why it has not been fixed already

Three structural reasons, all from the research rather than from opinion.

**The gaps are unattractive to build.** Every step nobody sells into is a step where the software is waiting
on a person to do something outside it: turn up, say yes, come back clear, be there on Monday.

**Nobody can size it,** for the reason above. A problem with no number does not get prioritised.

**The incentives point away from it.** The role holding the budget is measured on payroll and shrink. Hiring
appears on their sheet as a cost line.

### What we are explicitly not claiming

Stated here so it cannot be read into the demo.

**Not retention or quality of hire.** Considered and dropped. It is hard to prove, takes ninety days to
observe, and the buyer may hold no baseline to measure against. Worth knowing that neither incumbent claims it
either, and that is the best-supported finding in the whole project.

**Not shorter fixed waits.** A county court, a federal verification window and a scheduling notice period are
not ours to compress. We claim only to make them visible and to make sure nothing sits idle inside them.

**Not a wage or scheduling effect.** The interventions with the best causal evidence in this market are wage
floors and referral programmes. Neither is a software lever.

**Not novelty on the ordinary steps.** Both incumbents already screen, schedule and score. That is the cost of
entry, not the argument.

### The one thing still missing from this statement

The statement above is right about the problem and does not yet name the person. Asked whose screen the
product opens on, the answer recorded was "hiring managers, store managers, anyone who is involved in the
hiring process", which is three roles plus anyone. The demo picks field HR in order to exist at all.

So one line is still owed, and it is the same one that has been open longest: **which single role, and what
does that person stop doing on a Monday.** The test to apply is whose week gets measurably worse if this
disappears.

---

## 2. There is a demo



**What it is.** An overview page that explains the product in about thirty seconds, then ten screens of the
product itself. A Monday morning triage queue. All twenty funnel steps with live counts. One candidate
followed end to end with a timestamp and a name against every step. The screening call and its transcript.
The decision desk. A compliance desk with live legal countdowns. The background check tracker. The funnel
instrumentation. And the same data seen from a store manager's chair.

**What is genuinely running,** because this is what you will probe first. The twenty steps and who owns each
one. The business-day arithmetic behind every compliance clock. The refusal that fires when somebody tries to
remove a contested new hire's shift. The state changes when you hire somebody, which move the pipeline counts
and write an audit entry naming who decided. The funnel maths.

**What is invented.** The retailer, every store, every person, every count and every duration. It is
deliberately a mid-market chain rather than big-box, because big-box is outside our target.

**What is simulated and labelled as simulated on screen.** Payroll, workforce management, the identity
directory, the screening agency, E-Verify and the learning system. No real integration exists yet and the
demo says so rather than implying otherwise.

**How to drive it.** Press P for presenter notes, which give you the narration scene by scene. R resets it.


**The two scenes that are the reason it exists.** A candidate who scores 79 and is also flagged as not
eligible for rehire from another store in 2024, caught on social security number and date of birth because he
spelled his name differently and changed every contact detail. And a new hire whose E-Verify check comes back
mismatched, who is a US citizen with a stale record after a marriage, where the product blocks her store
manager from quietly dropping her shifts because doing so would be unlawful while she contests it.

Neither of the two companies who sell into this market sells anything at either of those points.

---

## 3. What has been decided, and why

Nineteen decisions are recorded. These seven are the ones that define the product.

### All twenty steps, no slice

Parity with the incumbents on the ordinary steps is the cost of entry. The claim is the view that spans all
twenty, including the ones we never automate.

The reason is in the funnel work rather than in ambition. Seventeen of the nineteen steps that could be
classified are a wait or a handoff, not a decision. Six of the twenty are sold by neither incumbent, and
almost every one of those six is a wait. A product scoped to one slice cannot address a problem that lives
between slices.

The cost, written down at the time: the likely failure is not losing on any one step, it is shipping twenty
things at seventy percent against a competitor doing five at a hundred.

### Most of it is not AI, and that is deliberate

Of the twenty steps, nine are plain deterministic software that a model would only make worse, five are where
a model genuinely earns its place, three need a person, and three are fixed waits nobody can compress.

The five AI steps are almost one capability applied five times: a conversation with a candidate or a new hire
about whether they are going to turn up or stay. Which is what we already shipped on the aviation build.

### We are a connector layer, not the system of record

> **Updated 18 Aug 2026 after our second meeting.** You accepted the connector approach, so this section is
> now the opposite of what it said. The original text is kept below it, because the cost it lists is exactly
> what the change avoids.

Retailers above two billion already run entrenched systems. Rather than replacing them we build connectors, so
nothing gets torn out and the customer still gets one place to run the whole funnel. Recorded as D-020.

This removes the hardest part of the sale, and it puts us back on the architecture Nurix has actually shipped
in this domain, since the Unifi build was an overlay on Avature.

One thing is genuinely lost and it should stay visible. Owning the record would eventually have given us the
dataset nobody publishes, which was the strongest argument for the old decision and the route by which attract
might have come back into scope. As a connector we see events passing through rather than owning them.

The step-by-step consequence, which answers your question about which steps need a system and which are just
email and phone, is in 05-strategy/connector-map.md. Short version: twelve of the twenty steps need something
from an existing system, eight need nothing at all, and four of the six steps neither incumbent sells into are
in that second group.

**The original section, kept as record.**

Every applicant is fed into our system, so we replace the applicant tracking system rather than sitting on
top of it.

This is the most expensive decision in the project and its costs are written out in full. Every target
already runs Workday, SAP SuccessFactors, iCIMS or Avature, so this is a rip-and-replace sale with IT,
procurement, security review and a CIO in it. It also contradicts the only thing we have shipped in this
domain, since the aviation build was an overlay on the customer's existing system.

The long-run argument for it is the one worth keeping. If every applicant and every lifecycle event lives
with us, we end up holding the dataset that does not exist publicly, and the reason we ruled out attract
stops applying.

### A score, and a human still decides

The screening agent produces a score off the interview it conducted, with a band rather than a single number,
and the reasoning under it. A person makes the call and their name goes on the record.

Being straight about this: both competitors already score. This is parity, not our edge.

It also makes us a regulated automated employment decision tool, which brings an annual independent bias
audit, a published summary, ten business days of notice to candidates in New York City, and an alternative
path for anybody who cannot do a voice interview. That is real engineering, not paperwork.

### The agent can never reject anybody

It passes a candidate forward, or it holds them for a person. Nineteen candidates in the demo's weekend gave
an answer the client-owned phrase bank did not cover, and every one went to a person rather than being
guessed at.

This is the design that passed a client's legal review on the aviation build.

### We never perform background checks

We place the order with whichever agency the customer already contracts, capture the disclosure correctly,
track the case, show which county is slow, and run the pre-adverse and adverse action sequence so it cannot be
skipped. Performing checks is a different regulated business.

### Success is time to hire and number of hires

Quality of hire was considered and dropped. Two consequences worth stating once. Our metric story is now the
same as both incumbents', who all claim speed and none claim tenure. And number of hires is not a number we
cause, since a retailer hires as many people as their growth and churn require.

---

## 4. Three answers I have recorded that are still weak

Written here because they will otherwise look settled.

**There is no primary user.** Asked whose screen the product opens on, I answered hiring managers, store
managers and anyone involved in hiring. That is three roles plus anyone, which is how a product gets designed
by committee. The test still to apply is whose week gets measurably worse if this disappears on Monday.

**I cannot say what the user stops doing.** I can say what it replaces for the company, which is a complete
database of every candidate and their lifecycle. I cannot yet say what leaves one named person's Monday. That
sentence is the demo and I do not have it.

**The buyer is "top management".** Not one person. A chief HR officer buys a talent story, a chief operating
officer buys store productivity, a chief financial officer buys a cost line, and a VP of talent acquisition
buys their own team's workload. Each is a different pitch.

---

## 5. What the research settled, and what it could not

### The size of the prize, which you asked for. Added 18 Aug 2026

You said Walmart spends about a billion a year on hiring operations and immediately said you were making it up.
Here is the honest version.

**Nobody discloses it.** Not Walmart, not Target, not Kroger, Costco, Home Depot or Lowe's. Full-text search of
their filings from 2001 onward returns nothing for cost per hire, talent acquisition expense, recruitment cost or
nine other variants. Walmart's FY2026 10-K uses the word "turnover" exactly once and it means inventory. So
anybody who hands you a figure has built it, and you should ask them to show the arithmetic.

**Built from what is disclosed, your guess was close.** Walmart discloses 1.6 million US associates, 92% of them
hourly. BLS publishes a retail trade hires rate of 45.0 per hundred employees for 2025. That gives roughly
720,000 hire events a year, and it cross-checks against BLS's own published totals to within a tenth of a point.
Multiplied by a published cost-per-hire distribution:

| Cost per hire | Annual total |
|---|---|
| 25th percentile, $354 | $255 million |
| **Median, $1,244** | **$896 million** |
| 75th percentile, $4,375 | $3.15 billion |

**So the median case is about 900 million dollars,** which is 0.61% of Walmart's SG&A and 0.13% of revenue.

Three honest caveats, because you will be asked. The cost per hire comes from a member survey rather than a
filing or a study, and the survey's own guidance is to use the median rather than the average. The band varies
only cost per hire and holds volume fixed, so the real uncertainty is wider, not narrower. And JOLTS counts hire
events rather than people, so a rehire counts twice.

**Do not quote 3.4 billion.** That number comes from the survey's average rather than a percentile and it does
not belong on the end of a percentile range.

### Settled, and it changed the plan

**Workday owns Paradox.** Announced 21 August 2025 in Workday's own newsroom. So the competitive picture is
not two independent specialists. It is Fountain on its own, placed by Gartner in the lowest quadrant, against
Workday, which now owns both the system of record and the conversational hiring layer on top of it.

That closes the go-to-market route the internal teardown recommends, which was to embed into Workday through
certification. You cannot embed into Workday to compete with Workday's own frontline product.

**Neither incumbent claims tenure.** Every claim in this category is about time to hire. Found independently
by two unrelated research methods, which makes it the best-supported finding in the project. It is unclaimed
because it is genuinely hard to prove, so it is an opening and a trap at once.

**Seven external systems per customer deployment,** in a range of six to eight. Payroll, workforce
management, the identity directory, the screening agency, E-Verify, a learning system and the store access
layer. That is a normal enterprise integration load rather than an impossible one. The two that gate the
schedule, payroll and E-Verify, publish no total timeline anywhere, so any duration you have seen quoted for
either is unsourced.

**Every compliance clock is now verified against primary government sources.** The I-9 windows, the E-Verify
deadlines, the retention periods, the FCRA sequence and the New York City obligations, all checked against
the regulation or the government page rather than against a vendor blog. Counsel sign-off is still required
before any of it enters a specification.

### Could not be settled, after two serious attempts

**Nobody publishes where the time goes in US frontline retail hiring.** Not application time, not screening,
not scheduling, not the background check, not onboarding. Two independent research runs failed to find a
single traceable number, the second one under strict rules where any claim whose source would not load was
dropped.

Every figure circulating in this market is a vendor quoting another vendor. About twenty of them have been
checked and killed and are listed so nobody rediscovers them.

That is why the demo instruments itself. The first real deployment has to produce the number rather than
borrow one.

---

## 6. What is deferred on purpose

So that none of these look forgotten.

**Pricing.** Genuinely unresolved, and the demo shows no price and frames nothing per hire. There is a reason
to be careful here rather than quick. The best-identified study of large US retailers finds that when
retention improves, gross hiring volume falls. So a price per hire or per requisition would fall exactly when
the product works.

**Whether we own E-Verify or embed a vendor.** Owning it means a direct relationship with the Department of
Homeland Security, a certification test, and a standing obligation to update our systems within six months
every time they ship a new version. Embedding a vendor avoids all of that. Decided at architecture stage.

**What has to come out of the old applicant tracking system.** Since we replace it, every customer leaves the
one they have. Most of that can start clean from a cutover date. One list cannot: the do-not-hire list, which
exists specifically to catch a new application. Whether each vendor can export it was verifiable for none of
them and is answerable by one call to a vendor sales engineer.

**Build order.** Twenty steps is a roadmap, not a sequence. Something ships first and that decides what gets
funded second.

---

## 7. What is needed from you

### One: take the demo apart

This is the main ask and it is worth more to me than agreement.

Four questions, and I would rather write your answers down than defend anything:

1. Is this what you meant when you said end to end hiring?
2. Which parts of the funnel have I got wrong, or in the wrong order?
3. Is there anything here we should not be doing at all?
4. What did you expect to see that is not here?

### Two: five people who hire retail staff in the US and do not work at Nurix

Asked on 11 August, and there has been no movement. It remains the single biggest unmanaged risk in the
project, and the reason is now sharper than it was.

Desk research has hit its ceiling and I can prove it. Two research runs could not find one traceable number
for how long any stage of this funnel takes. The questions that would answer it are written out and ready.
What is missing is a person to ask.

Names, a route to names, or a clear no so it can be planned around deliberately.

The demo helps here rather than waiting on it. A concrete thing to react to opens doors that a list of
questions has not.

### Three, and this one is newly sharper: does this sit on the NuAisle shelf at all?

Version 1 asked this, and version 2 said the answer mattered more because we had decided to be the system of
record. **That decision was reversed in our second meeting, which changes this ask substantially and makes it
much less alarming.** A connector layer can plausibly sit on a marketplace shelf in a way that a rip-and-replace
applicant tracking system never could. The question is still worth answering, but it is no longer a warning.

**The original framing, kept as record.**

Replacing a retailer's applicant tracking system is an enterprise rip-and-replace with IT, procurement, a
security review and a CIO involved. An overlay could have been bought by an HR leader out of a departmental
budget. This cannot.

So either this product sits outside NuAisle, or being the system of record is the wrong call. Both are
legitimate and I would rather find out from you than from a first customer meeting.

---

## 8. What happens next

**Now.** I walk the demo twice myself, then show it to you and write down what you say.

**Straight after, whatever you say.** Name the primary user and write the sentence about what that person
stops doing on a Monday. Those two sentences unlock the design and the pitch, and no amount of further
research produces them.

**Waiting on practitioner access.** Any success metric with a real baseline behind it, and the funnel timing
that two research runs could not find.

**Not being done yet, on purpose.** Pricing, the E-Verify architecture, and the build order. All three are
recorded as open with the reason each is safe to defer.

---

## Appendix: the full record

Everything above is traceable. Nineteen decisions with reasons and reversal conditions in DECISIONS.md.
Thirty-three questions with owners in OPEN-QUESTIONS.md. Every claim with its evidence tier in EVIDENCE.md,
including the list of circulating numbers that have no traceable source and are therefore not used.

The funnel work is in 01-diagnosis/funnel-map.md. What the background check, the I-9 and E-Verify actually
require is in 01-diagnosis/compliance-steps-explained.md. The scope decisions and the challenges to them are
in 05-strategy/v1-slice.md. The integration count and the verified legal deadlines are in
05-strategy/integration-surface-map.md. Competitor weaknesses with an evidence tier on each are in
02-landscape/gap-claims.md. Current state is in CONTEXT.md.

The demo has its own README explaining exactly what is real, what is invented and what is simulated.
