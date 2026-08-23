---
AUTHOR: Claude. Answering a question Nishant asked directly in the second meeting
WHAT THIS IS: for each of the twenty steps, whether an existing system plays a real role or whether it is just
  somebody sending an email, and what specifically we would need from that system
WHAT THIS IS NOT: an integration plan or an estimate. Nothing here is committed to
DATE: 18 Aug 2026
---

# Which steps need a system, and which are just email and phone

## The question, in his words

Nishant, meeting 2, 18 Aug 2026:

> "In which steps are those existing systems playing a huge role, and in which steps is it just email and phone
> communication, which is the primary driver to segregate. What do we need from that system."

He asked this immediately after accepting the connector architecture, and the two things go together. Once we
are not replacing anybody's applicant tracking system, the only question that matters per step is what we need
from whatever is already there.

## The answer, in one line

**Twelve of the twenty steps need something from an existing system. Eight need nothing at all, because today
they are a person sending an email or picking up a phone.**

And the part worth pausing on: **four of the six steps that neither incumbent sells into are in the second
group.** We could own those on day one without asking anybody's IT department for anything.

---

## The four postures

Each step gets exactly one.

**System, read.** The truth lives elsewhere and we need to see it. Cheapest kind of integration and the easiest
to get past a security review, because we change nothing.

**System, write.** We have to put something into somebody else's system. Harder, slower to approve, and where
the real integration work is.

**System, both.** We read state and write back. The most expensive posture.

**Ours already.** No existing system plays a meaningful role. Today it is email, a phone call, or nothing at
all. We need no integration to do this, which makes these steps available immediately.

---

## Hire

| # | Step | Posture | What we need, specifically |
|---|---|---|---|
| 1 | Application captured | **System, read** | New applications, as they arrive. Nishant's instruction: a direct connector from the job portals. A read is enough. |
| 2 | Eligibility on hard rules | **Ours already** | Nothing. The rules run on the application data we already received at step 1. No system holds anything we need. |
| 3 | Behavioural screening | **Ours already** | Nothing. Today this is a recruiter on the phone. The phrase bank is ours and the client's, and no incumbent system holds it. |
| 4 | Interview scheduled | **System, both** | Read the recruiter and manager calendars, write the booking. Light, and the calendar tenant is usually the same identity tenant as everything else. |
| 5 | Interview happens, or no-show | **Ours already** | Nothing. Nobody has a system for this. It is a slot in a calendar and a person turning up or not. |
| 6 | Hire or reject | **System, write** | Write the disposition back, so their applicant tracking system stays the record. The deciding itself happens with us. |
| 7 | Offer made | **System, write** | Either write the offer into their system or generate it ourselves and write the outcome. E-signature is a vendor we license once, not a per-customer integration. |
| 8 | Offer accepted, or goes quiet | **Ours already** | Nothing. The chase is entirely ours: messages, calls, escalation. No system holds any of it today. |
| 9 | Background check ordered | **System, write** | Place the order with whichever agency they already contract. Per D-022 this is an embedded vendor rather than something we own. |
| 10 | Check comes back clear | **System, read** | Status, and ideally the per-search breakdown so we can show which county is slow. One agency exposes that; another does not. |

## Onboard

| # | Step | Posture | What we need, specifically |
|---|---|---|---|
| 11 | I-9, W-4, direct deposit | **System, both** | Read the I-9 status from the compliance vendor, write the completion onward. Section 2 is examined by a person and no system changes that. |
| 12 | E-Verify | **System, read** | The case state, and nothing else. This is the single most important read in the product: without it we cannot enforce the bar on adverse action, which is the most distinctive thing we do. |
| 13 | Training and certifications | **System, read** | Completion status from their learning system. We assign nothing they do not already assign. |
| 14 | Uniform, badge, access, payroll | **System, write** and **Ours already** | Payroll is a write and it is the hardest one in the map. Badge and till provisioning has no public vendor documentation anywhere, so in practice it is email and phone today, which means it is available to us. |
| 15 | First shift scheduled | **System, write** | Write the shift into their workforce management system, respecting the local advance-notice rule before doing it. |
| 16 | Day one: shows up, or does not | **Ours already** | Nothing. The confirmation, the nudge, the escalation and the call are all ours. This is the largest single drop in the funnel and no system touches it. |

## Activate

| # | Step | Posture | What we need, specifically |
|---|---|---|---|
| 17 | Week one training on the floor | **Ours already** | Nothing we need. A person trains them and a manager signs it off. We prompt and record. |
| 18 | Ramp to unsupervised | **Ours already** | Nothing. There is usually no system at all. A manager decides somebody is ready. |
| 19 | 30, 60 and 90 day check-ins | **Ours already** | Nothing required. Some retailers have a talent module we could write to, but none of them need us to. |
| 20 | Still employed at day 90 | **System, read** | Employment status from payroll. Read only, and it is the number the finance side actually believes. |

---

## What the split adds up to

| Posture | Steps | Count |
|---|---|---|
| Ours already, no integration needed | 2, 3, 5, 8, 14 (part), 16, 17, 18, 19 | **8 whole, 1 partial** |
| System, read | 1, 10, 12, 13, 20 | 5 |
| System, write | 6, 7, 9, 14, 15 | 5 |
| System, both | 4, 11 | 2 |

So twelve steps touch a system, and of those only seven require writing anything into somebody else's product.
Five are reads, which is the posture a security review approves fastest.

## The finding that matters commercially

Cross the postures against which steps the two incumbents already sell into.

| Step | Neither incumbent sells here | Posture |
|---|---|---|
| 5 | Interview happens, or no-show | **Ours already** |
| 8 | Offer accepted, or goes quiet | **Ours already** |
| 10 | Check comes back clear | System, read |
| 16 | Day one: shows up, or does not | **Ours already** |
| 18 | Ramp to unsupervised | **Ours already** |
| 20 | Still employed at day 90 | System, read |

**Four of the six unclaimed steps need no integration whatsoever, and the other two need a read.**

That is the strongest thing in this document. The steps nobody sells into are unclaimed precisely because they
are the gaps between systems, which is exactly why they need no system to enter. The two hardest things about
selling into a large retailer, replacing infrastructure and writing into it, do not apply to the ground where
we have the least competition.

It also means a genuinely useful first version could ship against the email-and-phone steps alone, with two
read-only connectors, and still cover every point where the funnel currently leaks. Whether that is the right
first version is a scope decision for Suniras, not a conclusion here.

## The two hard ones, named

**Payroll, at step 14.** The only place we must write into a system that finance depends on. The vendor with the
clearest documented partner path also has a full gate: security review, sandbox, signed agreement, two
marketplace listings, mutual TLS, staged approvals with exit points, and no published total timeline anywhere.
It also sizes its products by employee count, so integrating with one vendor is not one integration.

**E-Verify state, at step 12. ANSWERED 18 Aug 2026, and the answer is narrow.** Not hard to build, hard to be
allowed to see. D-022 settles the posture as an embedded vendor, and the requirement was that the vendor must
expose the mismatch state. Research tested the field against exactly that question.

**Only WorkBright publicly documents both a readable deadline and a readable tentative-nonconfirmation action.**
Symmetry I-9 is the same product white-labelled. Equifax Guardian exposes a due date and nothing about the
contest. Checkr, Sterling, First Advantage, HireRight and Fragomen keep it inside their own interface. So the
vendor choice at this step is effectively made for us, and it is worth knowing that before anybody negotiates.

Three design consequences, all from the same research:

**There is no status that says "contesting".** E-Verify publishes six case results and none is a countdown. We
record the contest ourselves and watch for Case in Continuance, which is E-Verify confirming the employee
contacted DHS or visited SSA.

**Nobody pushes.** No vendor publishes an event telling us somebody is contesting with days remaining. DHS's own
instruction is to check periodically. So the connector polls, by design rather than by omission.

**Watch the wording on days.** At least one vendor's documentation says "business days" where DHS says "federal
government working days". Those differ on every federal holiday, so a deadline computed from the vendor's wording
can be wrong on the only days it matters.

## What this changes about the demo

Nothing yet, and one thing soon. The demo currently labels every external system as simulated, which is still
true and still honest. What it should stop implying is that we are the record. Two screens carry that reading
and they need a pass once Suniras has decided the first-version scope.

## What I could not answer

**Which of these a Target recruiter would recognise.** Every posture above is derived from the integration
research, not from anybody who does the job. Question 4 on the short list in QUESTIONS-FOR-TARGET.md asks
exactly this, step by step, and one answer from a real recruiter would either confirm this table or rewrite it.

**Whether the email-and-phone steps are email and phone everywhere.** A retailer with a mature applicant
tracking deployment may already run steps 3 and 8 inside it. That would move them from the free column to the
expensive one, and it is the single assumption in this document most likely to be wrong.
