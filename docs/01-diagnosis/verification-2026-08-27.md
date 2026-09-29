# Verification run three, 27 August 2026: the visibility framing

Six clusters, twelve agents, **eleven completed.** The adversarial verifier on the SSN cluster was killed when
the machine slept, so section 4 is findings without a refute pass and is labelled.

154 claims survived, 23 were killed. 76 supported outright, 78 narrowed.

**This run corrected three things Claude told Suniras on 26 August.** Two of the four points in his visibility
framing turn out to be table stakes rather than differentiation, and one of them is dead on arithmetic.

---

## 1. Source-of-hire attribution per store is dead, and there is a better use for the same data

**The arithmetic kills it.** A store hiring 20 to 40 people a year across 4 to 6 sources gets 3.3 to 10 hires
per source per year. Under simulation with genuinely unequal true source shares, 22/20/18/15/13/12%, a single
store's observed top four sources matches the true top four **only 28 to 33% of the time.** So the
recommendation "these four sources are most likely to produce a hire for this store" would be **wrong about
two times in three.**

**And the instrument is broken before sample size even matters.** The only large concordance study located,
WorkPlace Group across 15,276 candidates, found **17% agreement** between applicant tracking system metadata,
candidate self-report, and the recruiter's record as to what "the" source was. So the label being counted is
mostly noise.

**No programmatic vendor actually makes the per-store claim.** Appcast, Joveo, PandoLogic and Radancy claim
per-location **targeting, bidding and budget guardrails**, while pooling across employers at enormous scale.
Appcast's state-level figures rest on 1,300-plus employers, 281 million clicks and 25.6 million applications.
PandoLogic cites 200 billion historical data points. **That pooling is exactly what a "hiring is local" product
claim would contradict.**

### The better use, and it is a compliance requirement rather than an analytics feature

**There is a reason to record source per store regardless of whether the analytics work.** Federal contractor
record-keeping under VEVRAA and Section 503 requires an applicant source record, and **those obligations
survived the rescission of Executive Order 11246.** So a per-store, compliance-grade source record has a buyer
and a legal driver, and it does not need to predict anything.

**The defensible product shape is therefore two things, not one.** A pooled or hierarchical model shown *for* a
store rather than computed *from* that store alone, which is what the specialists actually do. Plus an
auditable per-store source record, which is a compliance artefact.

**This replaces the recommendation Claude gave on 26 August**, which was to demote point 1 to a chain-level
claim. Demoting it is right and insufficient. The chain-level version needs a hierarchical model, and the
per-store version should stop being an analytics claim altogether.

---

## 2. Past-applicant rediscovery is table stakes. Claude was wrong to call it our best fit

**Corrected.** On 26 August Claude called point 3, re-engaging people you already know, "the best fit for our
position". **It is unambiguously table stakes.**

**All ten vendors checked ship it**, and four have a literally named feature for it: Greenhouse, Fountain,
Phenom, and Workday with HiredScore. The verifier's own words: **pitching talent rematch as novel will not
survive a vendor bake-off.**

**Duplicate detection and merge is also near-universal**, documented by Beamery, Greenhouse, SmartRecruiters,
Fountain, iCIMS, Eightfold and Workday, as a data-hygiene function.

**Source-of-hire channel attribution is documented by everybody who publishes an analytics page.**

### The two things that are genuinely rare

**Reporting unique people as a first-class metric, distinct from applications.** No vendor advertises this
anywhere the search could find. **They all deduplicate records for hygiene and then still count applications.**
That is the gap, and it is narrower and sharper than what Claude claimed.

**Cross-site comparative benchmarking**, where one location's funnel is scored against comparable locations.
**Only Fountain states this plainly**, in its own words, "Compare performance across sites. Identify
bottlenecks and slow locations instantly." Phenom is a partial second.

**So the claim Claude made on 26 August, that the district comparison is the first thing in the product aimed
at somebody who can sign, survives as a statement about our own product and fails as a claim about the
market.** Fountain says it does this. What Fountain compares is applications. **Nobody compares unique people.**

**The honest position is the combination rather than either half.** Unique people as the metric, used for
cross-site comparison. Each half exists somewhere. Together they do not, as far as this search could tell.

---

## 3. Re-contacting a previous applicant is lawful, with one state that must be gated

**What is settled.** Recruiting calls and texts to a mobile are covered by 47 U.S.C. 227(b)(1)(A)(iii) whenever
an autodialer or an artificial or prerecorded voice is used, and require prior express consent. The Ninth
Circuit's Loyhayem v. Fraser Financial, 2021, is the only federal appellate decision on recruiting robocalls
and held the prohibition reaches "any call," regardless of content. **It was a pleading-stage reversal, not a
liability finding**, and the court did not hold that recruiting is categorically informational. That was a
party concession.

**Two things narrow the exposure usefully.** After Facebook v. Duguid the autodialer definition requires a
random or sequential number generator, so **a list-based recruiting SMS may fall outside the provision
entirely.** And where courts have decided it, pure recruiting content is neither an advertisement nor
telemarketing, so the heightened prior express **written** consent rule does not apply and oral or written
consent suffices. Gerrard v. Acara Solutions and Andersen v. Nexa Mortgage both say so, both are unreported
district court decisions with no precedential weight, and **the district courts are split.**

**What is not settled is the exact question this feature raises.** Whether consent given on an application for
one job extends to outreach about a **different, later** opening. No FCC order or reported decision addresses
it. The only governing standard is fact-specific: the message must be **"closely related to the purpose for
which the telephone number was originally provided."** Whether a new-role pitch clears that depends on how the
application's consent language was written, which means **the consent wording at intake is a product design
decision, not a legal afterthought.**

**The real quantifiable exposure is Washington State and it is concrete.** RCW 19.190.060 bans commercial
electronic text messages to Washington mobile numbers without a subscriber who "has clearly and affirmatively
consented in advance." **Aaland v. CRST Home Solutions, Washington Court of Appeals, 15 September 2025, held
that recruitment texts are commercial**, because a message "promotes a business' services where it aims to
contribute to the growth or prosperity of said business."

### What the product has to do, concretely

- **Recruiting-specific consent language at application**, written to cover future openings rather than only
  this one, because the FCC standard turns on what the number was originally provided for.
- **Gate Washington numbers** behind explicit, documented, recruiting-specific opt-in.
- **Honour STOP within 10 business days**, per 47 C.F.R. 64.1200(a)(10).
- Treat Florida, Oklahoma and Maryland as lower risk, because those statutes reach sales calls only.

**So the feature ships, and the consent record is part of it rather than a wrapper around it.**

---

## 4. The CRA boundary, and it is a single architectural fact

**This is the most useful finding in the run.** A previous run established that a vendor doing an outside
lookup for an employer is a screening service and therefore a consumer reporting agency. This run answers the
opposite case and gives a boundary that can be designed to.

**A vendor that surfaces, matches and ranks records drawn exclusively from one employer's own tenant is not a
consumer reporting agency.** It is "evaluating" consumer information, so the first element of 15 U.S.C. 1681a(f)
is met, but it is **not furnishing to a third party**, because it returns the employer's own information to
that employer as its agent. Supported by FTC commentary 603(f)-4A, 603(f)-4G and 603(f)-4H.

**The reason matters and it is not the reason most people give.** It is the furnishing-to-third-parties element
in 1681a(f), **not** the transactions-and-experiences exclusion in 1681a(d)(2)(A)(i). Getting that wrong leads
to the wrong design.

**And here is the boundary, stated exactly.** The moment the vendor pools records across employer customers and
surfaces a candidate sourced from employer A to employer B, **employer B is a third party as to employer A's
records, both elements are satisfied, and the vendor is a consumer reporting agency.**

**That single design fact is the boundary. Not scoring. Not AI. Not ranking.** A single-tenant matcher can rank
and score freely. A cross-tenant matcher is a regulated entity whatever it does.

**This needs to be a decision rather than a note**, because it is the kind of boundary that gets crossed by
accident in a later release when somebody suggests a shared talent pool across customers as a growth feature.

---

## 5. SSN custody. NOT ADVERSARIALLY VERIFIED, the verifier died

**One pass, not two.** Treat as strong leads rather than settled, and check before designing on it. It confirms
D-029 and adds one reason that is sharper than anything in that decision.

**An SSN is never required to apply for a job.** It is voluntary on Form I-9 unless the employer uses E-Verify.
Its only hard federal trigger is the tax duty that attaches on the day the employee enters employment for
wages. **So a product that makes SSN an identity key at application stage collects it before any legal
obligation to hold it exists.**

**The sharpest risk is not the security burden, it is a named discrimination hazard.** The finder reports that
the Department of Justice's Immigrant and Employee Rights Section and ICE **jointly warn employers away from
I-9 software that requires "a Social Security number to onboard."** If that holds, an SSN-keyed identity model
is not merely unnecessary, it is called out in federal guidance. **That is a stronger argument against it than
anything in D-029 and it needs its own verification pass.**

**The custody burden, for completeness.** SSN is a triggering data element in effectively every US breach
notification statute, with 30-day clocks in Colorado, Florida, Washington and New York. Four states impose
affirmative security duties, and **Massachusetts 201 CMR 17.04 alone requires** a written information security
programme, encryption in transit over public networks, encryption at rest on portable devices, unique
per-user credentials, account lockout, monitoring, patching and training.

**And there is no alternative national identifier.** So the recommendation matches D-029: a system-issued
candidate identifier plus composite probabilistic attributes at application, with the SSN deferred to post-hire
payroll and E-Verify, ideally passed through to the embedded I-9 vendor rather than stored.

---

## 6. The duplication rate does not exist, and the best primary source points the other way

**No credible published measurement of the duplicate-applicant rate exists.** Appcast, CareerPlug and
Greenhouse, the three main benchmark publishers, **never compute a unique-person denominator at all.** The only
figure in circulation, around 12%, traces to an unsourced hypothetical on a content farm with a fabricated
byline.

**So the demo's 176 applications to 141 people cannot be scored against any baseline**, which is exactly what
the screen already says. That is the right posture and this run confirms there is no better one available.

**The strongest primary source on frontline application behaviour points away from the "apply to everything"
story.** Faberman and Kudlyak, using SnagAJob data: **4.77 million job seekers, 17.26 million applications,
2010 to September 2011, 44.6% retail vacancies.** The average hourly job seeker sent **1.9 applications per
week**, **40.3% applied to only one job ever**, and total applications per seeker across all employers over the
whole twenty-month window was about **3.6**.

**That contradicts E-060**, the claim relayed from Anuj that frontline candidates apply everywhere
indiscriminately and do not wait to hear back. It is not a clean refutation, because the data is from 2010 to
2011 and predates the application surge Greenhouse measures at **plus 111% applications per job, 116 to 244,
between 2022 and 2025.** But it is the only large primary measurement of the behaviour and it points the other
way. **E-060 should be re-tiered and the contradiction recorded rather than resolved.**

**One consequence for the demo.** If the true behaviour is nearer two applications per seeker per week across
all employers, then 1.25 applications per person inside a **single** employer is a high ratio rather than a
trivial one. The invented 20% may be generous. It stays labelled as invented.

### The apply-rate figures, refined

**Appcast's median apply rate, completed applications per ad click, ended 2024 at 6.1%.** By sector:
**Retail 5.26%**, Warehousing and Logistics 5.30%, Food Service 5.62%, Hospitality 5.09%.

**So retail is below the overall median**, and our repeated "roughly 6%" should become **5.3% for retail
specifically**, which is a slightly worse funnel than we have been describing.

**CareerPlug contradicts itself and this matters, because it was one of our two independent sources.** Its
small-business 2024 data gives Retail 7.1% click-to-apply, with 153 applicants per hire against 180 overall.
But **the same report states 4.7% overall in its body text and 6% in its industry tables and on its website.**
An unresolved internal contradiction in a source we treated as corroborating. **The convergence between
CareerPlug and Appcast that we recorded is weaker than it looked**, because one of the two disagrees with
itself by a factor of about 1.5.

---

## What could not be established

- **Any published duplicate-applicant rate.** Section 6. This is a genuine hole and it is the number the
  identity feature's headline depends on.
- **Whether the DOJ and ICE warning about SSN-requiring I-9 software is real and current.** Section 5, and the
  whole cluster is unverified.
- **Whether Fountain's cross-site comparison actually ships as described**, as distinct from appearing on a
  marketing page. Absence of a bake-off means this rests on their own copy.
- **An authoritative resolution of the CareerPlug internal contradiction.** Both figures appear in the same
  publication.
