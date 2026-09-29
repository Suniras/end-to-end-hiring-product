# Verification run, 26 August 2026

Six questions, twelve agents, all completed. Every finding went through an adversarial pass whose instruction
was to refute rather than confirm, with a rule that a law firm blog is not primary for a rule of law and a
vendor's own claim about its own results is never supported.

**133 claims survived, 19 were killed.** Of the survivors, 88 were supported outright and 45 were narrowed.
The narrowing is the useful part: in almost every case the finder had converted a specific rule into a general
one, and the verifier put the boundary back.

**Three of these findings change something we had written down, and one of them corrects me.**

---

## 1. The I-9 rehire window. Three years, and the anchor is more specific than expected

**Confirmed from the regulation itself.** 8 CFR 274a.2(c)(1)(i), read against the GPO's official CFR XML and
Cornell LII after eCFR returned errors, and the two agree word for word:

> "the employer may (in lieu of completing a new Form I-9) inspect the previously completed Form I-9 and: (i)
> If upon inspection of the Form I-9, the employer determines that the Form I-9 relates to the individual and
> that the individual is still eligible to work, that previously executed Form I-9 is sufficient for purposes
> of section 274A(b) of the Act if the individual is hired within three years of the date of the initial
> execution of the Form I-9 and the employer updates the Form I-9 to reflect the date of rehire"

**The anchor is the date the original Form I-9 was first executed.** Not the original hire date, not the
rehire date. In practice the original I-9 is completed within three business days of the original start, so
the two are close, but a product that computes eligibility has to compute it from the right field.

**The current form instructions say the same thing and go further.** Form I-9 Instructions, edition 01/20/25,
page 5, under "Rehires":

> "If you rehire an employee within three years from the date the employee's Form I-9 was first completed, you
> may complete the supplement and attach it to the employee's previously completed Form I-9. ... You must
> complete a new Form I-9 for any employee you rehired more than three years after you originally completed a
> Form I-9 for that employee."

**Using the shortcut is optional either way.** M-274 section 6.2: "If you rehire employees within three years
from the date you completed their previous Form I-9, you may complete a block on Supplement B, Reverification
and Rehire, or you instead complete a new Form I-9." So an employer can always choose the new form.

**The field is Supplement B, not Section 3.** The old Section 3 was restructured in the 2023 revision. If a
block on Supplement B was already used, a subsequent block is used for the new rehire.

**One inconsistency inside USCIS's own material, worth knowing before writing rules.** The form instructions
say a new I-9 is required for a rehire "more than three years after". M-274 section 6.2 says employees rehired
"three years after" must complete a new Form I-9. At exactly three years the two texts point different ways.
Not a practical problem, but it is the kind of edge a validation rule has to pick a side on.

**A second constraint that can bite before the first one does.** The I-9 **retention** rule is three years
after the hire date or one year after employment ends, whichever is later. So for a short-tenure worker an
employer may lawfully have destroyed the old form while the three-year rehire window is still open. **The
shortcut can be legally available and practically impossible at the same time.**

### What this means for Q-037

**The four-year example in the reframe falls outside the window.** A rehire at four years requires a complete
new Form I-9. Verified against the regulation, not inferred.

**The design target is the worker who left inside three years**, and specifically inside three years of the
date their original I-9 was completed.

---

## 2. E-Verify on rehire. No new case in one branch, and three conditions to reach it

From the E-Verify User Manual, section 2.1.2, primary.

**Where the employer relies on the previous Form I-9 through Supplement B, no new E-Verify case is created.**
The Manual states this three times, once for each document scenario.

**But reaching that branch needs three conditions at once, not one.** The rehire must be within three years of
the initial execution of the previous Form I-9, **and** a case must have been created from that Form I-9,
**and** that case must have returned employment authorized. Miss any one and the employer is directed to a new
Form I-9 and a new case.

That third condition matters for us. A retailer that adopted E-Verify recently has former employees whose
original I-9 never produced a case, so the shortcut is unavailable for them no matter how recently they left.
**Whether the shortcut applies is a function of the customer's own adoption history**, which is a
configuration input rather than a rule we can hard-code.

**Where a case is required, the deadline is the third business day after the employee starts work for pay.**
Measured from the start of work for pay, not from the offer and not from the paperwork. There is no
rehire-specific deadline anywhere in the Manual, so the general new-hire deadline governs.

**Duplicate cases are permitted, and rehire is the Manual's own example of when to create one.** Section 2.5.
E-Verify fires a Duplicate Cases Found alert on a 365-day lookback within the same employer account, and the
employer must close any open duplicates before continuing and state a reason. So the system constrains
ordering, not the duplicate itself.

**Federal contractors are the exception and it runs the other way.** Under the FAR E-Verify clause, an
employee already confirmed as work-authorized who is continuing in employment with the same employer is exempt,
and the contractor is **forbidden** to run them again. That is a prohibition with no counterpart in the general
Manual. It is conditioned on continuing employment rather than rehire, so it does not straightforwardly cover a
break in service, but any product that automates case creation for a contractor customer has to know the
difference.

**One thing to distrust.** The employer-facing FAQ on e-verify.gov still refers to Form I-9 "Section 3" rather
than Supplement B, so it is out of date on mechanics while correct on the rule. Read the Manual, not the FAQ.

---

## 3. Background check reuse. I told Suniras this was very unlikely, and that was too strong

**Correction.** On 26 Aug I wrote that a prior background check is "very unlikely to be reusable" and that "a
years-old report does not support a new hiring decision." **Federal law says otherwise, and this matters
because it makes the rehire idea stronger rather than weaker.**

**The FCRA imposes no shelf life on a delivered report.** Section 605 limits how old the adverse *information
inside* a report may be, generally seven years and ten for bankruptcy. It says nothing about how long a report
already in hand may be relied upon. The FTC's 2011 staff report, searched in full for staleness and report
age, contains no such rule either.

**And a fresh authorisation is not required for each report.** FTC Advisory Opinion to James, 5 August 1998:
FCRA does not require a new disclosure and authorisation for every report, and a blanket authorisation is
valid. The 2011 staff report puts it as consent "remain[ing] effective throughout the duration of employment."

**So the constraint is not federal. It is three other things.**

**The scope boundary.** The FTC bounded blanket authorisation to the application process and the consumer's
tenure of employment. It did not say effectiveness ends at separation, and it set no outer limit, so a former
employee's old authorisation sits in genuinely untested space. That is a legal-risk question rather than a
prohibition, and it is the kind of thing a retailer's counsel decides, not us.

**State law, and one state closes it outright.** Massachusetts: a CORI Acknowledgement Form is valid for one
year or until employment ends, whichever comes first. **So a former employee's Massachusetts authorisation has
necessarily lapsed by the time of a rehire.** California's ICRAA frames authorisation in the singular, for
"the procurement of the report", with no counterpart to the FTC's blanket-authorisation reading, so evergreen
consent is untested there too.

**Employer policy, which is where the real rule lives.** No published retailer policy was found. Three
published university policies were, and they are the only concrete shelf lives located anywhere: Florida State
requires a new check if the former employee was separated 31 or more days and will not run one more than 120
days before the effective date; Brandeis reuses a check under twelve months old and re-checks anything older;
Kansas State requires a new check on anyone separated more than a year.

**The practical conclusion for the product.** The check is not a legal blocker on fast rehire. **It is a
per-customer policy variable**, which means it is a configuration field, and the honest product statement is
"we apply your policy and we show which one applied", not "we skip the check."

**One genuinely counter-intuitive finding.** California caps the lookback for investigative consumer reports
at seven years from disposition, release or parole, measured to the date of the report. **So a fresh check can
lawfully return less than the old one did.** An older report on file may contain records a new report may no
longer include. Anybody designing a rehire flow that assumes newer means more complete has it backwards.

**And our own compliance document is already correct on the adverse-action gap**, which is worth recording
because it was checked rather than assumed. FCRA sets no waiting period between the pre-adverse-action notice
and the action. The only official number is an FTC staff advisory opinion to Weisberg, 27 June 1997, calling
five business days reasonable while noting the statute is silent. The three-business-day count that appears in
the statute belongs solely to the transportation and DOT carve-out in section 604(b)(3)(B), and it is not the
general rule.

---

## 4. The 72-hour claim. There is no source, and the real benchmark is 84 hours

**No source published by Paradox, Workday, or any named Paradox customer states a 72-hour time to hire.** The
search covered Paradox case studies, blog, product pages and infographics, Workday's newsroom, investor
releases, the acquisition release and blog, and Chipotle's own newsroom. The verifier correctly declined to
mark an exhaustive negative as proven, because no search can prove a universal absence. What can be said is
that a thorough search found nothing.

**The real benchmark, and it is the number to beat.** Workday's newsroom, 8 January 2026, states that Paradox
customers are "currently seeing an average time-to-hire of three and a half days." **That is 84 hours**, and
the same claim appears in the 21 August 2025 acquisition release. So the market leader's published average is
slower than the number circulating about it.

**The Chipotle endpoints are now confirmed twice from primary sources.** Workday's customer story gives 12 days
to 4 days on an **application to start date** basis, and Paradox's own case study says the same and phrases the
endpoint as "apron on", meaning the candidate is physically working. Application completion rose from 50% to
85% and applications doubled. **This closes the endpoint question for good**, and 4 days is 96 hours.

**Chipotle's own release is weaker than the vendor's.** Chipotle Newsroom, 22 October 2024, states the 75%
figure as a forward-looking expectation rather than a measured result, and never defines the endpoints. So the
customer was more cautious than the vendor.

**Two plausible origins for the 72-hour number, neither provable.** First, arithmetic: the "75% reduction"
headline is inconsistent with the 12-to-4-day figure it is attached to, because 12 to 4 is a 66.7% reduction.
A literal 75% cut from 12 days is 3 days, which is exactly 72 hours. Somebody back-computing the headline gets
72 hours. Second, a "72" does appear in Workday's Paradox messaging as an **application completion rate
percentage**, sitting in the same press release as the time-to-hire claim.

**Joy's mechanism thesis was right.** The vendors who do claim 72 hours are selling something else. A.Team
headlines 72 hours and its own copy defines the deliverable as a curated shortlist of two to three matched
builders, drawn from a pool of 11,000-plus pre-vetted people screened before any client request arrives. Masis
Staffing's 72-hour window **starts at candidate selection**, so it excludes everything before that. Neither is
a filled role from a cold requisition.

**So the comparison was never apples to apples.** Paradox measures application to first shift. The staffing
vendors measure shortlist delivery or post-selection onboarding. Converting them to a common unit and
declaring one faster is a mistake, and it was one I was on the edge of making.

---

## 5. The rehire population. Smaller than I said, and my figure came from a vendor blog

**Retraction first.** On 26 Aug I wrote that "roughly 19% of grocery hires are returning workers" and called
one in five "not an edge case." **That figure comes from a Ceridian/Dayforce vendor blog**, built on 850,000
employee records volunteered by its own clients through an optional feature, with no sampling frame and no
years attached to any statistic. It should not have been used and it is withdrawn. The same blog is the origin
of the 21% figure for clerks, cashiers and baristas and the 24% overall.

**The best available primary measurement says roughly 9%, and retail is below average.** Census Quarterly
Workforce Indicators put recall hires at **8.9% of retail hires in 2024** and 8.5% in 2023, with a full series
from 2015. Retail sits below all private industry at 12.7%, and below construction at 14.8%, transportation
and warehousing at 11.3%, health care at 10.9%, manufacturing at 10.6% and accommodation and food services at
9.8%.

**And retail does not spike in Q4.** That kills the seasonal-returner hypothesis I built on top of the wrong
figure. I had argued that retail's seasonal pattern would concentrate returners inside the three-year legal
window. The seasonal concentration is not in the data.

**QWI is a lower bound and the true number is higher.** It sees returns only within four quarters, so it
misses anyone who worked elsewhere in between. Fujita and Moscarini report QWI recall at about 17% of all
hires against roughly 40% of completed jobless spells ending in a return to the prior employer in SIPP data.
How much of that gap applies to retail is unknown.

**The one peer-reviewed retail study is the least encouraging source of all.** Arnold and colleagues, Journal
of Management 2021, using a US retail chain: rehires were **4% of manager-trainee placements**, 1,318 of
30,714, and 5.9% measured against outside-sourced hires only. **And rehires turned over more than either
comparison group: 36.6% against 33.5% for external hires and 20.9% for internal moves.** They performed on par
in year one and improved less over time. Only the subset who had left voluntarily outperformed both other
groups in year one.

**One finding does support the design, and it is the timing.** Mean time away in that retail chain was 1.77
years, standard deviation 1.86, n=1,317. **That mean sits inside the three-year I-9 window.** The paper
publishes no percentiles, so the share above three years cannot be computed, and the standard deviation is
large enough that a substantial minority will be outside. But the centre of the distribution is in the right
place.

**The highest retail number found is first-party and it is one retailer for one season.** Macy's head of talent
John Patterson said **33% of recent hires for the 2024 holiday season were former colleagues returning**, and
that Macy's converted 15% of 2023 seasonal hires to regular roles. An executive statement rather than audited
data, and one company, but it is first-party and it suggests the variation between retailers is very large.

**Everything else in circulation is worse sourced.** The "33% of retail new hires are boomerangs" figure
originates on a careers blog crediting unlinked "Harvard Business Review data"; HBR's actual figure is Visier's
all-industry 27 to 29%, from a proprietary database with no industry split. ADP Research reports 35% of new
hires in March 2025 and a 31% average since 2018, but defines a boomerang as any payroll reactivation with no
maximum gap and **has published no retail figure**. Revelio Labs put Spirit Halloween's seasonal return rate at
11.8%, from online profile data with no stated method. And the HBR "nearly 20% of workers who quit have
returned" line is a UKG opinion survey of about 2,000 people across six countries, not a share of hires.

**For contrast, in a different sector it looks better.** Keller and colleagues, Academy of Management Journal
2021, found boomerangs at 15.9% of external hires in their analysis sample at a Fortune 500 health care
company, mean 2.81 years away, and **outperforming new hires.** Health care, not retail, and QWI shows health
care running above retail on recall, so it is not transferable.

### The honest summary for Q-037

**Rehire is a meaningful minority of retail hiring, not a core flow.** Somewhere between 4% and 9% by the two
credible sources, higher by an unknown amount because QWI truncates, and up to 33% at one retailer in one
season. **Nishant's instinct that it is an edge case was closer to the data than my enthusiasm was.**

What survives is the value argument rather than the volume argument. A returning worker is still the cheapest
and fastest hire available, the timing centres inside the legal window, and no competitor has been found doing
it. **What does not survive is selling it as a quality play**, because the only peer-reviewed retail evidence
says rehires quit more than external hires.

---

## 6. Job board distribution. Indeed is table stakes, multi-board is bought, and LinkedIn is shut

### LinkedIn: the claim relayed on 25 August is wrong in the worst way

Joy's claim, via Nishant, was that any recruiter can access LinkedIn's APIs to post jobs and read incoming
applications. **The door is not gated. It is closed.**

- **The Job Posting API is closed to new partners.** New applicants are redirected to Apply Connect.
- Access is restricted to LinkedIn-approved developers meeting undisclosed criteria, under a data-restricted
  API agreement negotiated through a LinkedIn Relationship Manager or business development contact.
- **Only three consumer-scoped permissions are self-serve for all developers**: profile, email and
  w_member_social. Every Talent Solutions program requires explicit LinkedIn approval.
- LinkedIn does not commit to granting partnership and warns of delayed responses due to volume.
- Reading applications into a product and evaluating applicants against job criteria through Apply Connect
  requires the **customer** to hold a paid LinkedIn Recruiter Corporate or Recruiter Professional Services
  licence.
- Job Wrapping is a LinkedIn-side service sold to Recruiter customers holding Job Slots, arranged through a
  LinkedIn account manager. It is not something a vendor integrates.
- LinkedIn reserves the right to force paid promotion of certain job types, including jobs from search and
  staffing companies.

**There is one free route and it is weak.** An XML feed for "Basic Jobs", with no charge for ingestion or
hosting. But LinkedIn **explicitly refuses to guarantee that fed jobs will be ingested**, onboarding runs
through LinkedIn-side testing with no external test environment, and feed-ingested Basic Jobs get materially
worse distribution than paid Job Slots. So it cannot be sold as reliable delivery.

**The consequence for Joy's wider proposal.** The freshness lookup that finds where a candidate works now was
the mechanism underneath the whole skill-graph idea. It has no supply. That does not just narrow the feature,
it removes its foundation.

### The incumbents: both do Indeed natively, neither owns multi-board

**Fountain.** Its own Indeed page states that "Job listings you create or update in Fountain are automatically
sent to Indeed.com", and it separately receives applications through Indeed Apply. Indeed is the only board
named. It claimed distribution to "hundreds of job boards" through Fountain Boost in March 2022, but its
current integrations page lists **Programmatic Job Advertising as a category supplied by Recruitics and VONQ**.
So the broad reach is bought.

**Paradox.** Native toggle-level outbound distribution is Indeed-specific on its own product pages, and its
"thousands of job boards" reach claim is **explicitly attributed to programmatic advertising** rather than to
a native layer it owns. It also uses Indeed Apply on the inbound side.

**Workday.** Its LinkedIn integration set is Recruiter System Connect, Apply Connect and Apply with LinkedIn.
Single-channel LinkedIn integrations, not general multi-board distribution.

**Indeed claims over 350 ATS integrations globally.** So Indeed distribution is close to universal among
applicant tracking systems.

**VONQ markets its HAPI product to ATS and HCM vendors as a way to add distribution "without building
infrastructure themselves."** That is VONQ's own sales positioning rather than proof of market practice, but it
is the pattern both incumbents visibly follow.

### Every destination is gated, and one is being switched off right now

- **Indeed** requires a signed Developer Agreement through a formal partner request channel and an issued
  Indeed Apply API token. It reserves the right to exclude jobs failing its quality rules, so successful
  transmission does not mean visibility.
- **ZipRecruiter** requires registration and an issued API key. Details of its partner API surface could not be
  read: the partner documentation returns 403 and the only readable source is a 2017 press release.
- **LinkedIn** is the most closed, as above.

**And the timing is live.** Indeed notified customers in late 2025 that single-source job feeds are being
discontinued: **organic delivery ended 31 March 2026** and sponsored delivery ends by the end of 2026, pushing
integrators to multi-source feeds or direct API integration. From June 2025 Indeed also stopped letting
agencies maintain single-source feeds for employers whose ATS is already integrated. **So the free feed route
into the largest destination is already gone and the paid one has months left.** Anybody costing a feed-based
integration today is costing infrastructure that is being retired.

### What this settles for Q-041

**Distribution is not a differentiator.** Indeed posting is table stakes, both incumbents have it, and 350-plus
applicant tracking systems have it. Genuine multi-board reach is a bought layer for both incumbents.

**So the choice is not build or skip. It is buy or skip.** Building it means competing with programmatic
advertising and multi-posting specialists on their own ground, which is the opposite of the position D-020
chose. Buying it puts us level with the incumbents cheaply and honestly.

**And per D-025 the demo needs neither.** Nishant's standard is to show where the integration goes and simulate
it. The visibility story can be demonstrated at zero integration cost, which means the decision about whether
to buy can wait for a customer to ask for it.

---

## What could not be established

Recorded so the absences are not mistaken for clean answers.

- **No E-Verify deadline expressed in terms of the rehire date exists.** Section 2.1.2 contains no deadline
  language at all. The third-business-day rule is written for a newly hired employee starting work for pay,
  and applying it to a rehire is an inference, though a well-founded one.
- **No FTC or CFPB document squarely answers whether an authorisation signed during a prior completed
  employment covers a later rehire check.** The nearest authority is the boundary language in the 1998 advisory
  opinion. This is the single most consequential unresolved point in the rehire design.
- **No US retailer other than Macy's publishes a quantified seasonal-returner share.** Walmart, Target,
  Amazon, UPS, Macy's and Kohl's announcements plus an EDGAR full-text search were checked. Retailers disclose
  seasonal-to-permanent conversion rates and not returner rates. EDGAR returns zero filings for "rehire rate"
  and for "returning seasonal employees".
- **Workday Marketplace listings for eQuest and Broadbean could not be read**, being JavaScript-rendered, so
  the claim that Workday Recruiting lacks native multi-board distribution rests on the existence of certified
  third-party distribution apps rather than on a direct statement.
- **The roster of leading programmatic advertising vendors could not be established from primary sources.** A
  market-leader list is a judgement no vendor page makes, and every attempt to source one was killed.
- **ZipRecruiter's partner API surface is unverified**, its documentation returning 403.
