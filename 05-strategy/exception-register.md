---
AUTHOR: Claude. Nishant asked for this register in the second meeting
WHAT THIS IS: the laundry list of edge cases, each with what breaks and what a fix would need
WHAT THIS IS NOT: a commitment to solve any of them. Nishant explicitly deferred the hardest one
DATE: 18 Aug 2026
---

# Exception register

**Eighteen cases as of 18 Aug 2026.** E18 was added after the meeting, from research, and it is the one
that most deserves a second look.

## Why this exists

Nishant, meeting 2, on the flagged-candidate case Suniras raised:

> "What you have explained, I put that in an exception handling kind of bucket. Each cases. Laundry list,
> whatever exception handling list. Probably it can be easily solved by a central candidate database. If this is
> a biometric scan store, I will have a biometric record of that candidate the moment they reapply. Or a
> government ID number. Both are unique. Already flagged in the central database for this candidate: no hire in
> any of the stores because of this. Read, interpret, blacklist agreement, like edge cases. Yes, all whitelist.
> I'm not solving. We'll create a handoff knowledge base."

Two instructions in that. Keep a list, and do not try to solve the general blacklist and whitelist problem now.

**The register's job is to stop these being discovered late.** Every one of them is a case where the happy path
runs fine and something else happens. A hiring product that has not written them down finds them in production.

## How to read the columns

**Status** is one of four:

- **In v1.** Already handled, or must be for the first version to be honest.
- **Deferred.** Real, understood, deliberately not now. Nishant's instruction on the big one.
- **Open.** We do not yet know enough to decide.
- **Out.** Somebody else's problem, and we should say so rather than half-solve it.

---

## The one Nishant discussed

### E1. A terminated employee reapplies at a different store

**Status: In v1, partially.** The demo already implements the detection.

**What happens.** Somebody is terminated for cause at the San Francisco store. Six months later they apply at
the New York store. Different store, different hiring manager, possibly a different region. To any system that
starts from today, they are a brand-new applicant with a clean record.

**What breaks.** They get screened, they score well, and somebody rehires them. The faster the funnel, the
faster that happens. This is the one case where speed actively makes the outcome worse.

**What a fix needs.** A single identifier that survives somebody changing their name, address, phone and email.
Nishant named the two candidates: a biometric record, or a government ID number. In the US the practical one is
the social security number, which is what the demo matches on, together with date of birth.

**What is genuinely unresolved.** Whether the retailer's existing system will let a connector read that flag.
Under the old system-of-record decision we would have imported the list at cutover. As a connector we have to
read it in place, which is a smaller ask but still an ask. That is question 5 on the short list in
QUESTIONS-FOR-TARGET.md and the last surviving part of Q-032.

**What we are not solving,** on Nishant's instruction. The general blacklist and whitelist problem: who can add
a flag, who can remove one, what evidence is required, how a wrongly flagged person gets it lifted, and how long
a flag lives. Those are policy questions with real fairness consequences and they are not v1.

---

## Already handled in the demo

### E2. E-Verify returns a mismatch and the employee contests it

**Status: In v1.** This is the most distinctive behaviour in the product.

**What happens.** A new hire's E-Verify check comes back mismatched. Usually an administrative error: a name
change after marrying, a hyphenated surname, a record not yet updated. The employee contests it, which they are
entitled to do.

**What breaks.** A store manager who has never heard of a mismatch quietly stops scheduling them. That is
adverse action during a contested case and it is unlawful. Nobody involved intended to break anything.

**What the fix needs, and it is a read.** The case state from whichever vendor we embed per D-022: that a case
is in tentative nonconfirmation, that the employee is contesting, and the remaining deadline. Without that read
we cannot enforce the bar. This is now the single most important requirement in the connector map.

### E3. A background check returns something adverse

**Status: In v1 for the sequence, out for the judgement.**

**What happens.** The report comes back with a record on it.

**What breaks.** Somebody withdraws the offer immediately, skipping the two-step notice the law requires.

**What the fix needs.** Enforce the sequence: pre-adverse notice with a copy of the report and the rights
summary, a reasonable gap so the candidate can dispute an error, then the adverse notice. Several jurisdictions
additionally require an individualised assessment, which is a human judgement and stays one.

**What we never do.** Decide whether a record disqualifies somebody.

### E4. An offer goes quiet, or somebody does not turn up on day one

**Status: In v1.** Both are implemented and both are steps neither incumbent sells into.

**What breaks today.** Nobody notices until it is too late to act, because no system owns the gap.

---

## Deferred, on instruction or on judgement

### E5. The general blacklist and whitelist

**Status: Deferred.** Nishant: "Yes, all whitelist. I'm not solving."

Includes who may raise a flag, what evidence is needed, expiry, appeal, and the whitelist inverse of a
positively marked rehire.

### E6. Seasonal taper, transition and exit

**Status: Deferred, and partly out of scope.**

**What happens.** Nishant raised this himself: a retailer hires flex headcount for a season, then has to taper
down, transition some people to permanent, and exit the rest.

**Why it is deferred.** Exiting people is firing, and firing is a long way outside a hiring product. It is also
where the compliance exposure is highest. Worth noting that Nishant raised it as part of the flex-headcount
picture rather than as something to build.

**The one part that might belong to us.** Somebody tapering down needs to know who to keep, and a hiring product
holds the record of how each person performed in their first ninety days. That is an input to the decision, not
the decision.

### E7. Over-hiring, and scenario planning

**Status: Deferred, and it is an adjacency rather than an exception.**

Nishant's example: 500 hired into one warehouse, people sitting idle at eight to twenty dollars an hour, which
over a quarter is millions. His proposal was that our product talks to a scenario planning product so that
forecast demand sets the headcount.

**Why it is not ours.** Forecasting demand is workforce management, not hiring. But the direction of the arrow
matters: the forecast is an input to how many people we need to hire, so if it exists we should read it rather
than ask a recruiter to retype a number.

---

## Open, and each one needs a decision

### E8. The same person applies to several stores at once

**What breaks.** Two hiring managers interview the same person the same week, neither knows, and one makes an
offer the other has already made. Or the person is counted twice in every funnel number.

**What a fix needs.** Deduplication on the identifier from E1, and a rule for who has the claim. That rule is a
policy question: first to apply, nearest store, or first to offer.

### E9. A good leaver reapplies

The positive inverse of E1. Somebody left on good terms and comes back. Almost always the best candidate in the
queue, and almost always treated as a stranger.

**Why it is worth naming.** The mechanism is identical to E1, the same identifier read, so the cost of handling
it is nearly zero once E1 exists. Whether to surface it is a product call.

### E10. A candidate cannot do a voice interview

**Status: Open, and it has a legal floor.**

D-016 makes the score a regulated automated employment decision tool, which requires an alternative selection
path. Somebody who is deaf, has a speech difference, or processes language differently must have a route through
that does not disadvantage them. The demo shows one candidate requesting a written interview and being granted
it automatically, which is the right shape but not a designed answer.

### E11. State rules differ, so the same funnel is not legal everywhere

**What happens.** E-Verify is mandatory for private employers in some states and not others, with different
employee-count thresholds and different retention periods. Advance-notice scheduling rules apply in some cities
and not others. Bias-audit and candidate-notice obligations apply in some cities.

**What breaks.** A single global configuration is wrong somewhere, and wrong in a way that produces a compliance
event rather than a bug.

**What a fix needs.** Rules keyed to the store's location rather than to the customer. This is a data-model
decision and it is cheap now and expensive later.

### E12. A candidate withdraws after the background check is ordered

Small, but it is real money. The check is paid for and the candidate is gone. Worth knowing whether retailers
track it.

### E13. Under-18 candidates

Hour restrictions, task restrictions, and in some states a work permit. High-volume retail hires teenagers in
quantity, so this is not an edge case by frequency, only by handling.

### E14. Internal transfer rather than external hire

An existing employee moving store or role goes through some of the twenty steps and not others. No new I-9, no
new background check in most cases, but a new schedule and a new manager. Whether internal moves belong in this
product at all is a scope question.

---

### E18. A current employee's work authorisation is revoked in bulk

**Status: Open, and it may be the largest live exposure in the whole register.** Found by research on 18 Aug
2026, after this register was first written.

**What happens.** DHS is running a recurring process through 2026, roughly every two weeks, publishing revoked
employment authorisation documents into a Status Change Report inside E-Verify. The report carries the revocation
date, the case number, the A-number and the revoked document number. Coverage was expanded again on 11 August
2026.

**What the employer must do.** Immediately begin reverifying every current employee whose document appears as
revoked, compare each person's card number against the revoked number, and refuse the revoked document.

**Why this is different in kind from everything else here.** Every other case in this register is keyed to one
candidate moving through the funnel. This one is keyed to the **existing workforce**, arrives as a periodic
report rather than a per-case event, and can flag many people at once. A retailer with tens of thousands of
hourly staff can receive a bulk reverification obligation with no warning.

**Why it is currently invisible.** None of the vendor interfaces researched exposes a field for it, including the
one vendor that does expose the mismatch state. So today this is a person opening a report in a portal, noticing,
and starting a manual process. That is exactly the shape of problem this product exists to fix.

**What a fix would need.** Read the report, match it against the workforce, and drive a reverification queue with
its own clock. That is a different state machine from the hiring funnel and it would be a real piece of work.

**Honest limit.** One research pass, not independently confirmed. Verify directly on e-verify.gov before it goes
near a customer conversation. Two Target questions were added for it, on who handled the 2026 reports and how
many people were flagged.

---

## Out

### E15. Deciding whether a criminal record disqualifies somebody

Human judgement, required by law in several jurisdictions, and the largest liability in the product. We surface
the record and enforce the sequence. We never decide.

### E16. Examining I-9 documents

A named person attests, under penalty of perjury, that documents reasonably appear genuine. No software signs
that. We drive the clock and we never suggest which documents to ask for, because steering is itself a
violation.

### E17. Performing background checks

A regulated business we are not in. D-014.

---

## How to use this

**When somebody proposes a feature,** check whether it creates a new row here. Most do.

**When a case moves from Open to a decision,** it becomes a line in DECISIONS.md with a reason and a reversal
condition, and this register points at it.

**What to ask a practitioner.** E1, E8, E11 and E13 are all answerable by somebody who does the job, and E1 is
already on the short list of questions for Target. If a Target recruiter says the rehire flag has ever been
missed in practice, that single answer moves E1 from a plausible problem to a documented one.
