---
AUTHOR: Claude. Domain explanation, written because Suniras asked what these steps actually are
WHAT THIS IS: how the background check, the I-9 and E-Verify actually work, and what the law requires
EVIDENCE TIER: this is my own knowledge, not fetched and read this session. Every legal claim below must be
confirmed by counsel before it enters a PRD. Nurix has Stephanie Johnson's June 2025 memo on voice AI in
recruitment as a starting point, and Anuj Modi named for Colorado
DATE: 16 Aug 2026
---

# Steps 9 to 12, explained

These four steps are where the funnel stops being a product problem and starts being a legal one. They are also
where most of the unavoidable waiting lives.

---

# The background check, steps 9 and 10

## The thing to correct first

**We do not perform the background check, and the candidate mostly does not upload documents.**

A background check in US employment is performed by a **consumer reporting agency**, a regulated third party.
The big ones are Sterling, Checkr, HireRight, First Advantage and Accurate. They are regulated under the Fair
Credit Reporting Act, usually written FCRA.

The employer orders a check. The agency searches. The agency returns a report as structured data over an API.
There is no pile of uploaded documents for a model to read.

So the idea of AI reading uploaded background check documents does not describe this step. What actually
happens is closer to placing an order and waiting for it to come back.

## What has to happen before the order is placed

Two things, both from the FCRA, and both are the kind of detail that produces class actions when done sloppily.

**A standalone written disclosure.** The candidate must be told, clearly, that a consumer report may be
obtained for employment purposes. The law requires this to be in a document that consists **solely** of that
disclosure. Adding a liability waiver or extra paragraphs to the same page has been found to violate it.

**Written authorisation from the candidate.**

Several states add their own requirements on top.

There is also a timing rule that explains why step 9 sits where it does. Many states and cities have
**ban-the-box** or fair chance laws that forbid asking about criminal history before a conditional offer. So
the check is ordered after the offer, not before. That is not a process choice anyone made. It is the law
placing the step there.

## What the agency actually searches, and why it takes days

There is **no single national criminal database** available to employers in the US. The product agencies sell
as a national database is a compiled index that has to be confirmed at source.

The real source of truth is **county court records**, and that is the whole reason for the wait.

The sequence is roughly:

1. A trace on the candidate's social security number produces their address history.
2. Address history determines which counties to search.
3. Each of those counties is searched. Some are fully digital and return in minutes. Some require a person to
   physically go to a courthouse and return in three to ten days. Some have backlogs.
4. In parallel: sex offender registries, state repositories, motor vehicle records if the role involves
   driving, and employment or education verification, which requires a previous employer to actually answer
   the phone.
5. A drug screen, if ordered, is separate again. The candidate has to physically attend a collection site,
   which is a candidate-dependent wait on top of a laboratory wait.

**So the wait at step 10 is made of three different things.** A county's digitisation level, which nobody can
change. A previous employer's responsiveness, which nobody can change. And the candidate turning up at a
collection site, which is the same shape as steps 5, 8 and 16 and is the one piece that can be nudged.

## If the report comes back with something on it

The FCRA sets a two-step process and it cannot be collapsed into one.

**Pre-adverse action.** Before doing anything, send the candidate a copy of the report and a copy of the
official summary of their rights under the FCRA.

**A reasonable gap.** So they can dispute an error. The statute does not name a number of days. Five business
days is the common practice and some jurisdictions set their own.

**Adverse action.** If still proceeding, a final notice naming the agency, stating clearly that the agency did
not make the decision, and describing the right to dispute and get a free copy.

Several jurisdictions, New York City and California among them, additionally require an **individualised
assessment** before withdrawing an offer over a conviction. Nature of the offence, time elapsed, relevance to
the job.

This is one of the most litigated areas in US hiring.

## Where AI could actually go here

**Genuinely useful:** summarising a returned report for the human who has to read it, provided that person can
see the source. Answering candidate questions about the process. Chasing a candidate who has not completed
their authorisation or booked their drug screen.

**Do not:** decide whether a record disqualifies someone. Several jurisdictions require a human individualised
assessment by law, and the EEOC treats criminal record screening as a disparate impact risk because conviction
rates differ sharply by race. A model that automates that judgement is the single largest liability available
in this product.

**The real product opportunity at step 10 is not intelligence.** It is that nobody currently tells anyone what
is happening. The order is placed and the candidate goes quiet for eight days. Surfacing which county is slow,
whether the drug screen has been booked, and how long this has been sitting is plain software, and neither
competitor sells into this step.

---

# The I-9, step 11

## What it is

Form I-9, Employment Eligibility Verification. Required by the Immigration Reform and Control Act of 1986.

**Every US employer must complete one for every new hire.** Citizens included. There is no exemption for small
employers or for short-term staff.

Its purpose is to confirm two things: that the person is who they say they are, and that they are allowed to
work in the United States.

## How it works, and the clocks

**Section 1** is completed by the employee, on or before their first day of work for pay.

**Section 2** is completed by the employer, who must examine the person's original documents **within three
business days of their first day of work for pay.**

The employee chooses which documents to present, from three lists. List A proves identity and work
authorisation together, for example a US passport or a permanent resident card. List B proves identity only,
for example a driving licence. List C proves work authorisation only, for example a social security card. The
employee presents either one List A document, or one from List B plus one from List C.

**The employer cannot tell them which to bring.** Specifying documents, or asking for more than the minimum, is
called an unfair documentary practice and it is a discrimination violation enforced by the Department of
Justice. This trips up well-meaning employers constantly.

Historically the examination had to be in person. Since 1 August 2023 there is an alternative procedure
allowing remote examination over live video, **but only for employers enrolled in E-Verify and in good
standing.** That link matters for the product, because it means remote onboarding and E-Verify are coupled.

**Corrected 18 Aug 2026.** I previously wrote that enrolment is assessed per hiring site and implied the choice
is therefore locked to a site-level setting. DHS is more flexible than that. It expressly permits offering the
alternative procedure for remote hires only while continuing physical examination for onsite and hybrid
employees, provided the rule is not adopted for a discriminatory purpose and employees are not treated
differently by citizenship, immigration status or national origin. So it can lawfully be a consistently applied
category rule. What remains prohibited is a per-individual eligibility judgement, which is the thing a product
must make impossible to express.

Records must be kept for three years after the hire date or one year after employment ends, whichever is later.

## Where it sits in the funnel

At and just after the start date. Not before the offer.

You cannot ask a candidate for work authorisation documents earlier in the funnel. You may ask on an
application whether someone is legally authorised to work and whether they will need sponsorship. Demanding
documents before hire is the violation described above.

So the I-9 is a **day-one-adjacent** step, and its three-business-day clock starts from the first day of work,
not from the offer.

## Where AI can and cannot go, in three parts

Added 16 Aug after Suniras asked directly. This one is more nuanced than a flat no.

**The attestation is human only, and this is not a preference.** Section 2 is signed by a named person, under
penalty of perjury, stating that they examined the documents and that those documents reasonably appear to be
genuine and to relate to the person presenting them. The law assigns that act to a human representative of the
employer. There is no version of this where a model signs it.

The failure mode is also discriminatory. Scrutinising documents harder because of somebody's name, accent or
appearance is national origin or citizenship status discrimination. A model trained to flag suspicious
documents would do exactly that and would be very hard to defend.

**Reading a document to fill in the form is legitimate, and it is the one real AI job here.** Section 2 records
the document title, issuing authority, number and expiry date. Extracting those from a photograph is optical
character recognition, and it is data entry assistance, not attestation. Products in the market already do it.

The trap is worth stating plainly. If the extraction is good enough that the human stops looking and just
clicks, the attestation has been automated in practice while remaining human on paper. That is worse than not
having it, because it produces signed attestations nobody made. Any design here has to force the person to
actually look.

**Explaining the process to the employee is possible and high risk.** Employees genuinely do not know they can
present either one List A document or one from List B plus one from List C. Showing them the official lists and
answering their questions is allowed and helpful.

Steering them toward a particular document is an unfair documentary practice. So a general assistant is exactly
the wrong tool here unless it is tightly bounded, and the bounding looks like the Unifi phrase bank rather than
like an open conversation.

**The rest is deterministic and valuable:** pre-fill from data already captured, validate formats, drive the
three-business-day clock and escalate before it is missed, store for the retention period, and never let the
interface suggest which documents to ask for.

---

# E-Verify, step 12

## What it is

A separate thing from the I-9, and often confused with it.

E-Verify is a web system run by the Department of Homeland Security with the Social Security Administration.
It takes the data from a completed I-9 and checks it electronically against government records.

**The I-9 is the paperwork. E-Verify is the electronic check on that paperwork.** Doing the I-9 does not mean
you are using E-Verify.

## Who has to use it

Voluntary at federal level for most employers. Mandatory for federal contractors carrying the relevant clause,
and **mandatory under the laws of a number of states**, with the list and the employee-count thresholds varying
by state and changing over time.

That state variation is a real product requirement rather than a footnote. A retailer operating across state
lines may be required to use E-Verify in some states and not others.

## The clocks, and the one rule that matters most

**The case must be created no later than the third business day after the employee starts work for pay.**

Three outcomes.

**Employment Authorized.** Done.

**Tentative Nonconfirmation**, usually written TNC. The government's records do not match. This is often an
administrative error rather than anything real: a name change after marriage, a hyphenated surname entered
differently, a citizenship record not yet updated.

The employer must tell the employee promptly and privately and give them the official Further Action Notice.

**Corrected twice. Read this version.** On 16 Aug I collapsed two clocks into one. On 18 Aug research found
there are **three**, and that the first one is shared rather than the employee's alone. Verified against
e-verify.gov.

**Clock one, ten federal government working days from issuance of the mismatch. It is a shared window.** The
employer must notify the employee and complete the referral as soon as possible within those ten days, and the
employee's decision is due on the same tenth day. I previously described this as purely the employee's decision
window, which understates what the employer has to do inside it.

**Clock two, eight federal government working days after referral,** for the employee to contact DHS or visit
SSA. The government page notes these timeframes have been extended for certain mismatch types, so a hardcoded
number needs an override.

**Clock three, ten federal government working days from referral, for DHS and SSA to update the result.** I
missed this one entirely. DHS's own instruction is to check E-Verify periodically for an update, which means
**the government is telling you to poll.** Any design that waits for a notification will wait forever.

**And a fourth thing, which is not a clock but changes the design.** There is no case status that says
"contesting". E-Verify publishes six case results and none of them is a countdown. The employer records the
contest, and the only downstream confirmation is **Case in Continuance**, which means the employee has contacted
DHS or visited an SSA field office. So enforcing the bar on adverse action depends on state we hold ourselves
plus that indirect signal, never on reading a single "contesting" flag.

The version that circulates in vendor material, that a final nonconfirmation issues automatically if the
employee does not act within ten working days after referral, is wrong on both the number and the starting
point.

**And here is the rule that must be built into the product:** while a TNC is being contested, the employer
**cannot take adverse action.** Not termination, not suspension, not withholding pay, not delaying training, not
holding back their first shift.

**Final Nonconfirmation.** Only at this point may the employer terminate.

## Why AI stays out of the check, and where it does belong

There is nothing to infer. E-Verify is a deterministic government interface. You send data, it returns one of
three results. AI is not forbidden here so much as pointless.

**But there is a real AI job next to it, and it is one of the better ones in the product.** A tentative
nonconfirmation is a confusing, frightening thing to receive. The new hire does not know whether they are about
to lose the job. The store manager does not know what they are allowed to do. Neither of them reads the
official notice properly.

Explaining a mismatch to a new hire in their own language, telling them exactly what to do and by when, and
separately telling the store manager what they must not do, is a conversation. That is where a model earns its
place at step 12, and it directly attacks the failure that makes this step dangerous.

So the shape here is the reverse of what it looks like: no AI in the check, real AI in the conversation around
a bad result.

But this step is a genuine product opportunity for a different reason, and it is one of the clearest in the
whole funnel.

**The TNC process is where employers break the law by accident.** A new hire gets a mismatch, a store manager
does not understand what it means, and they quietly stop scheduling that person. That is adverse action during
a contested TNC, and it is a violation. Nobody involved intended to break anything.

Software that runs the notice correctly, tracks the ten-day window and **actively blocks the store from
dropping that person off the rota** while the case is contested is high value, purely deterministic, and
directly attacks a documented competitor weakness. Fountain's own documentation says that on the employment
eligibility path, if the verification service times out, it silently falls back to its own decision without
surfacing that in the interface. A silent fallback on a legally consequential decision is exactly the kind of
thing a customer's counsel notices.

---

# The second state machine, found 18 Aug 2026

Not part of the twenty steps, and possibly a larger live exposure than everything above for a retailer with a
big existing hourly workforce.

**What is happening.** DHS is running a recurring process through 2026, roughly every two weeks, publishing
revoked employment authorisation documents into a **Status Change Report** inside E-Verify. The report carries
the revocation date, the case number, the A-number and the revoked document number. The 11 August 2026 update
expanded coverage to further categories.

**What the employer must do.** Immediately begin reverifying every current employee whose document the report
shows as revoked, compare each employee's card number against the revoked document number, and refuse to accept
the revoked document.

**Why it is different in kind from everything above.** Every clock in this document is keyed to a new hire. This
one is keyed to the **existing workforce**, it arrives as a periodic report rather than as a per-case status
change, and it can flag many people at once. For a retailer with tens of thousands of hourly staff, a single
report can create a bulk reverification obligation with no warning.

**Why it matters to us.** None of the vendor interfaces researched has a field for it. The one vendor that
exposes the mismatch state has no field for this. So even the best-integrated design currently has no way to see
it, which means today it is a person opening a report in a portal. Recorded as exception E18.

**Honest limit.** This came from one research pass and has not been independently checked by a second one. Before
it goes anywhere near a customer conversation, verify it directly on e-verify.gov.

---

# Summary table

| | Step | Who performs it | The clock | Can AI help |
|---|---|---|---|---|
| 9 | Order the check | We order, an agency performs | None on us. Must follow a conditional offer in ban-the-box jurisdictions | Only for chasing the candidate's authorisation and drug screen booking |
| 10 | Check returns | The agency, county by county | Theirs, not ours | Summarising for the reviewer. Never deciding |
| 11 | I-9 | The employer, a named human | Section 1 on or before day one. Section 2 within three business days of day one | No. A human must examine documents |
| 12 | E-Verify | The government system | Case within three business days of day one. Ten federal working days for a contested mismatch | No. Nothing to infer |

# What this changes about the automation breakdown

Nothing in categories. All four remain deterministic or human.

But it sharpens why. These are not steps we chose to leave alone. They are steps where the law assigns the work
to a person or to a government system, and where getting the workflow right is worth more than getting the
intelligence right.

It also produces two specific opportunities neither competitor sells into, both plain software:

- Making the background check wait visible while it happens, instead of a candidate going silent for eight days.
- Running the E-Verify mismatch process correctly, including stopping a store from quietly dropping somebody
  while their case is open.
