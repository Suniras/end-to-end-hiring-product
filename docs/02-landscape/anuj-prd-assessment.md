# Anuj Jain's retail frontline hiring PRD: what we can use

Written 25 August 2026. Assessment of `retail-hiring-agent-main/ATS/`, 16 documents, 29,050 words, authored by
Anuj Jain, product lead at NuPlay. Dated 12 to 20 May 2026, with an executive summary dated June 2026.

**What this document is.** A read of somebody else's work, what transfers, what conflicts, and where the two
projects disagree on facts. It is not a merge plan and it does not propose scope. Both of those are Suniras's.

---

## What is in the folder

| Group | Files | Words | Sourcing |
|---|---|---|---|
| Competitor teardowns | 11 | 12,169 | **229 URLs** |
| PRDs and summaries | 4 | 16,606 | **zero URLs** |
| CLAUDE.md | 1 | 275 | n/a |

That split is the single most important structural fact about the folder, and it cuts both ways.

**The competitor research is genuinely sourced**, at roughly one URL per 53 words. **The PRDs carry no citations
at all**, and they are where every market number, funnel conversion rate and cost figure lives. Those are the
same numbers four of our own research runs either killed or failed to find, so they are being verified against
primary sources separately and the verdict is in the evidence section below.

**Two different products are in here.** `prd-v1.md`, dated 17 May, is **HireAgent**: a corporate,
knowledge-worker hiring agent whose primary user is a hiring manager and whose problem is the recruiter intake
loop. `retail-frontline-prd.md`, dated 20 May, is the **Retail Frontline Hiring Agent**, a different product
for a different buyer. The competitor research supports the first one, not the second: all eleven teardowns are
of corporate hiring tools, and **Fountain, Workstream and Snagajob appear nowhere in the research folder** even
though they are the actual competitors in frontline hiring. They get one table row each in the retail PRD with
nothing behind them.

---

## Where his product sits against our twenty steps

His eight components map onto our funnel like this.

| Our step | His coverage |
|---|---|
| **Step 0. Requisition opens** | **His. Not in our funnel at all.** Section 6.6, and it is the most useful new territory in the folder. |
| 1. Application captured | Both. His is SMS-first conversational. |
| 2. Eligibility on hard rules | Both. His Filter 1 and Filter 2. |
| 3. Behavioural or fit screening | **Ours only.** He explicitly excludes it: "Screening is NOT AI interviewing", no personality assessment. |
| 4. Interview scheduled | Both. His is candidate self-service. |
| 5. Interview happens, or no-show | **Partial.** He has 24h and 2h reminders and slot backfill. No mechanism beyond reminders. This is our tier 1. |
| 6. Hire or reject decision | Both. His is a manager tap after the 15-minute conversation. |
| 7. Offer made | Both. His 6.6 offer workflow, SMS with a mobile accept page. |
| 8. Offer accepted, or goes quiet | Both. His has a 24h reminder and a 48h expiry. This is our tier 1. |
| 9. Background check ordered | His Phase 3. Ours is D-014. |
| 10. Background check comes back | Neither, really. Ours is tier 2. |
| 11. I-9, W-4, sign-offs | **Ours.** His is a Phase 2 "onboarding handoff" that pushes a record to somebody else's system. |
| **12. E-Verify** | **Ours. Zero mentions in all sixteen of his documents.** |
| 13. Training and certifications | Split. He tracks certs at application; training is out of scope. |
| 14. Uniform, badge, payroll record | His: push a new-hire record to the HRIS. Ours: in scope. |
| 15. First shift scheduled | **Ours.** He explicitly excludes it: "we match availability at hire time, not ongoing scheduling". |
| **16. Day one: shows up, or does not** | **Ours, and this is the gap that matters.** He names day-one no-show as 12% and an 18% dropout bucket, then builds nothing for it. This is our tier 1. |
| 17 to 20. Activate | **Ours.** Entirely out of his scope. |

**The headline.** His product ends at offer acceptance. Ours spans to day ninety. He covers six of our twenty
steps in v1, plus one step we have never mapped.

**And two of our three tier-1 steps sit after the point where his product stops.** Steps 8 and 16. He covers 8
and not 16, and he does not build for step 5 beyond reminders. So the three steps we proposed to build first
are precisely the ones his design leaves thinnest. That is either a strong signal we picked the right gap or a
sign we both read the same funnel and drew different lines. Worth deciding which.

---

## The best thing in the folder

**Section 6.6, "How Requisitions Work Today".** This is upstream of everything we have mapped, and Nishant
asked about it in the second meeting under the heading of step 0.

He splits requisitions by trigger and puts a share on each: **backfill roughly 90%, new headcount 5 to 8%,
seasonal 2 to 5%.** Then he walks each one through the organisation step by step with an owner and an elapsed
time per step, and lands on **3 to 7 days from a departure to the first candidate in the pipeline**, with the
store understaffed throughout.

Whether those shares and days are sourced is the open question, and it is in the verification below. But the
**structure** is valuable regardless of the numbers, because it names a stage nobody in our funnel owns:
the gap between somebody leaving and a requisition existing. Our step 1 assumes an application arrives. His
step 0 asks why anybody was hiring in the first place.

Also worth taking: his four core problems with the current requisition process. No system of record at
mid-market chains, so the requisition is an email or a conversation. The store manager is the bottleneck at
every step. And no chain-wide visibility into how many positions are open and for how long. That third one is
our D-013 spanning-view claim, arrived at independently.

---

## Ideas worth taking

**Calibration against sample profiles.** From `prd-v1.md` section 4.1, Phase C. Before a score goes live, the
agent shows the manager three to five sample profiles and asks whether they would interview each one. Accept a
profile the spec scores low and a criterion is overweighted. Reject one the spec scores high and something is
missing. **Uncertain, and the criterion becomes a warm signal rather than a filter.**

Our D-016 says step 6 produces a score and a human decides. We have never said how the score gets calibrated to
the person who has to live with it. This is a mechanism for that, and it is the single most reusable idea in
the folder.

It also carries a serious risk that neither of his documents notes, and it is in the compliance section below.

**Identity resolution as step zero of screening, not as a feature.** His section 6.0 runs identity resolution
*before* any screening filter, so history is attached to the record before anything is scored. Phone number as
primary key, fuzzy match on name plus zip plus age as fallback, low-confidence matches flagged and **not
auto-merged**. That last detail matters and our own exception register does not state it.

**Re-application fast paths with a stated time saving per case.** Former employee in good standing skips
screening. Prior applicant for a new role skips data collection. Prior no-show gets flagged for manager review
rather than auto-rejected. This is a cleaner articulation of the same ground as our E1.

**The escalation ladder with no auto-decline at the end.** Section 6.3: candidate surfaced at 0h, reminder at
12h, urgent at 24h, escalate to district manager at 48h, and at 72h the candidate gets an honest status update
saying they have not been forgotten. The system never closes the door without a human. That last rung is a
detail our demo does not have and should.

**The store manager's action list as an exhaustive five.** Review a warm candidate, decide post-interview, set
availability blocks, view a candidate card, view store metrics. Then an explicit list of what they cannot do.
Constraining a persona by enumerating the whole action set is a good discipline and it makes the design
falsifiable.

**Requisition status as a five-state machine.** Draft, Pending Approval, Open, Filled, Closed, with a defined
trigger for each transition and a defined set of actions when a requisition opens: scan the pool, publish the
posting, screen incoming, then nudge at day 3, escalate at day 7, surface to corporate at day 14.

---

## Where the two designs actively conflict

### He auto-rejects. We never do.

This is the most consequential difference in the folder and it is not a matter of taste.

His screening pipeline rejects without a human three times. Filter 1 hard disqualifiers: "REJECT with reason.
Immediate, kind decline message." Filter 2 availability below 20% overlap: "REJECT (can't work when we need
them)." And the output tier: "COLD (score <50, or hard disqualified): Decline with respectful message."

Our D-016 and the demo say the agent can advance a candidate and can never reject one. That was taken as a
legal position, not a product preference.

**Three things make this sharper than a disagreement.**

**One. His own executive summary says the opposite of his PRD.** It states: "The AI never makes a hiring
decision. It structures data, enforces compliance rules, scores fit, and routes candidates. The hiring decision
is always human." An automated decline is a hiring decision. The two documents do not describe the same system.

**Two. His retail PRD contradicts his own principle from three days earlier.** `prd-v1.md`, principle 3: "Fail
toward human review, not auto-action. When the AI is uncertain, candidates go to Warm (human reviews), not Hot
or Cold. When in doubt, slow down, don't auto-reject." Principle 5: "Human-in-the-loop checkpoints at every
irreversible action (rejections, external communications)." And in its user table, the recruiter "reviews first
batch of Cold for compliance". The retail PRD dropped all of that.

**Three. His own competitor research identified this as a moat.** His Tezi teardown records "3rd-party bias
audit; Max cannot make autonomous rejection decisions" and "No autonomous rejection decisions (human-in-the-loop
for adverse actions)" as a **strength**. His Maki teardown records "Bias auditability and regulatory readiness
(GDPR, EU AI Act, NYC audit)" and says in terms that "Maki's strength in structured assessment and bias auditing
is a proven moat that an agent-first ATS would need to replicate or integrate."

So the research found it, prd-v1 stated it as a principle, and the retail PRD designed against it. That is
worth raising as a question rather than a correction, because he may have a reason.

### The scoring threshold floats with the applicant pool

`prd-v1.md` section 4.3.1: "The thresholds are not static — they're relative to the applicant pool for this
specific role. If all applicants are strong, the bar rises." And the Cold tier is defined as "Bottom quartile OR
fails hard filter OR weak on 3+ High-weight criteria."

Two consequences. **The same candidate is Hot in one pool and Cold in another**, which cannot be explained to
that candidate and is unstable under any audit that computes impact ratios by category. And **a bottom-quartile
rule rejects 25% of every pool by construction**, whether or not those people are qualified.

### Compliance is almost entirely absent

Counted across all sixteen documents:

| Term | Mentions |
|---|---|
| E-Verify | **0** |
| I-9 | 1, inside a Phase 2 integration table |
| NYC Local Law 144 or AEDT | **0** |
| EEOC | **0** |
| FCRA | **0** |
| adverse impact, disparate, four-fifths, Title VII | **0** |
| Illinois AIVI, Colorado SB 24-205 | **0** |
| TCPA | 2 |
| bias audit | 2, both describing competitors |

The retail PRD closes with "Sections to follow: Data model, technical architecture, security & compliance", so
this is a known hole rather than a claim of coverage. But the product it describes runs automated screening with
a numeric score and an automatic decline, which is the exact fact pattern NYC Local Law 144 was written for.

### Work authorisation is a self-reported flag feeding an automatic rejection

Separate from the auto-decline argument above, and more specific. His application flow collects "Work
authorization (yes/no)" over SMS, and Filter 1 lists "No work authorization" among the hard disqualifiers that
"REJECT with reason. Immediate, kind decline message."

So a self-reported yes or no, gathered pre-offer in a text conversation, triggers an automatic decline with no
human in the loop and nothing for the candidate to correct.

That sits directly on top of the anti-discrimination provision our own compliance work already covers, at
8 U.S.C. 1324b. An employer may ask whether somebody is authorised to work. What it may not do is treat
authorised non-citizens differently from citizens, demand documents before hire, or build a citizenship-status
screen. A one-bit self-report wired to an automatic rejection is the shape of exactly that, and a candidate who
answered the question wrong or misread it has no route back.

Our `01-diagnosis/compliance-steps-explained.md` covers unfair documentary practices and the I-9 timing rules
in detail. This is the single place where our compliance research applies most directly to his design.

**He does have one thing we should check ourselves: TCPA.** His entire candidate experience is SMS, and he
names carrier filtering, consent management and volume limits as a day-one operational risk, with consent
captured at application. We do cover TCPA in EVIDENCE.md and the Fountain research, but our tier 1 is three
outbound-contact steps and it is worth confirming our own consent design is as explicit as his.

---

## Where his ICP and ours diverge

| | Anuj | Us |
|---|---|---|
| Segment | Mid-market grocery, 50 to 500 stores | US retail above $2B revenue |
| Named beachhead | Grocery, then QSR, apparel, c-store | Frontline retail, big-box included |
| Thesis | Mid-market is underserved: too big for Indeed and spreadsheets, too small for Workday plus Paradox | Large retailers have entrenched systems, so we connect rather than replace |
| Architecture | System of record for hiring, integrates to HRIS | Connector layer, D-020, we replace nothing |
| Primary user | **Store manager**, stated plainly | Still unnamed, outstanding since 16 August |

These are not the same bet. His depends on there being no incumbent to displace; ours depends on there being
one to sit beside. Four of the six chains in his own mid-market table are above $2B revenue, so the segments
overlap on paper while the strategies point in opposite directions.

**The one he answers and we have not.** He names the store manager as the primary user and states what leaves
their week: "The store manager's only high-value contribution to hiring is a 15-minute in-person conversation
with a pre-qualified candidate. Everything else should be automated." That is the shape of the two sentences
Suniras has owed since 16 August. Not the answer, because our ICP is different and his is asserted rather than
observed, but the shape.

---

## Evidence verdict

Every load-bearing number in the PRDs was put through a verification pass whose instruction was to find the
origin or declare it untraceable, then an adversarial pass to break the result. Ten clusters were planned. **Five
completed, and one adversarial pass completed**, before eight of the sixteen agents were killed by the machine
sleeping mid-run.

**Of 33 verdicts returned, two are SUPPORTED.** The rest split across partially supported, wrong population,
untraceable and contradicted.

**A caveat on this section's own reliability.** The one adversarial pass that finished, on the boomerang cluster,
corrected the first pass in four places, including a study sample that was wrong by roughly a hundredfold. The
boomerang section below is the post-adversarial version. **The other four clusters have not been attacked**, so
treat them as first-pass findings. That is the same discipline our own 24 August run had to learn the hard way,
and the reason this document says which parts have been through both passes.

### What holds up

Two claims survive properly, and one of them is the most useful thing in the folder.

**Roughly 6% of people who click a job ad complete the application**, which is where his 94% abandonment
figure comes from. Two independent vendor datasets converge, and both are large:

- CareerPlug's 2025 Recruiting Metrics Report: 6% click-to-apply, from "hiring activity in 2024 from more than
  60,000 small business owners, covering more than 10 million job applications".
- Appcast's 2025 Recruitment Marketing Benchmark Report: apply rates "ending the year at 6.1%", from
  "379 million job ad clicks and over 30 million applies" across "1,300 employers in the U.S."

Vendor book-of-business rather than a measured study, so assumption tier by our rules. But two independent
sources at that sample size is the strongest evidence in the folder and it is worth having. **Appcast and
CareerPlug are two publishers we should be reading and are not.**

`[SUPPORTED]` **The three reasons candidates abandon applications: form too long 50%, no pay transparency 31%,
uncertain about qualifications 35%.** All three verified verbatim, and this is the only claim in the folder whose
population is genuinely ours. **iCIMS 2025 State of Frontline Hiring Report**, methodology stated as "surveys of
1,000 U.S. hourly frontline workers and 1,000 frontline hiring managers across healthcare, hospitality,
manufacturing and retail". Still a vendor survey and still self-reported rather than funnel telemetry, with
retail one of four sectors and no grocery cut. But **1,000 US hourly frontline workers is the population this
whole project has been unable to reach**, and that report is a source we should be reading.

`[SUPPORTED]` **$883B US grocery revenue.** Census Monthly Retail Trade Survey, NAICS 44511, 2025 months sum to
$880.5B, within 0.3%. One caveat that matters: NAICS 44511 **excludes supercenters and warehouse clubs**, which
makes it a different base from the 45,000 store count.

### Corrected numbers we can use

The verification produced primary replacements for three figures he had wrong. All three are new to our
repository.

| His figure | Correct figure | Source |
|---|---|---|
| 2.88M grocery employees | **2,646,000** | BLS CES, NAICS 44511 supermarkets excluding convenience, 2025 annual average. QCEW agrees at 2,633,046. |
| 2.3-2.4M frontline at "80-85%" | **2,424,100**, which is **91.6%** of the correct base | BLS CES production and nonsupervisory, NAICS 445110, 2025 |
| $883B revenue | $880.5B | Census MRTS via FRED |

The frontline figure is the interesting one. **His level is right by accident.** An inflated base of 2.88M times
an understated share of about 83% happens to land inside 2.3 to 2.4M. Both inputs are wrong and the errors
cancel.

### Wrong population

**Interview-to-offer 47.5% and offer acceptance 69%.** Both come from **NACE, the National Association of
Colleges and Employers**, and they are **campus and new-graduate recruiting benchmarks** from a self-reported
survey of 334 organisations. Nothing to do with hourly retail. The 69% is also an all-programs blend: NACE's
actual new-graduate acceptance figure is 73.6%.

**Applications per hire, 46 to 95.** Real and traceable, to **BambooHR's 2026 State of Hiring**. But the source
measures applicants per **job posting**, not per hire. And the same report says the hiring rate fell from 4.5%
to 2.8% over the period, which means applications per hire rose considerably **more** than double. So the label
is wrong in a direction that understates his own case.

**65% new-hire turnover**, the denominator of his boomerang comparison. Pulled from the BLS API directly and it
checks out arithmetically: retail trade annual total separations 2021 was 64.9%. But that is **all separations
divided by all employment in NAICS 44-45**, not a new-hire figure at all.

### The drop-off table, stage by stage

His section 2.3 attributes dropout to five causes with a percentage each. Verified individually they are five
different things from five different vendors, and the headline one is mislabelled.

**"Interview no-show 32%, the biggest leak" is not a no-show rate.** The only 32% in the frontline literature is
iCIMS's stage-attribution question, and it is the share of **hiring managers who named "interview" as the stage
where they see drop-off**, out of four stages summing to about 100%. It has no denominator, it measures manager
perception rather than candidate behaviour, and iCIMS's own pages contain no interview no-show data at all. The
single most load-bearing number in his problem statement is a survey response about where managers think people
leave.

**"42% withdraw because scheduling took too long"** is verbatim accurate, from **Cronofy**, which sells
interview-scheduling software. So a scheduling vendor publishing a statistic about the cost of slow scheduling.
12,000 candidates across seven countries, so roughly one in seven American, all industries, no frontline cut,
self-reported recall rather than observed withdrawal, and the figure moves year to year.

**"12% no-show on day one"** has no origin, and everything that does have a home measures something else and runs
far higher: 83% of employers have experienced first-day no-shows, and around 70% report day-one ghosting of up to
25%. His figure is low against every published alternative, which is the opposite of the direction a problem
statement usually drifts.

**"43% of frontline workers leave within 90 days"** traces to **Fountain's** marketing blog, attributed to a
gated report with Lighthouse Research based on about 2,000 frontline workers. The report could not be obtained
and Lighthouse's own public write-up of the same study contains no 90-day figure. That is a competitor's gated
marketing claim doing structural work in his cost model.

**"34% assume they have been ghosted after a week"** is verified at Criteria Corp's 2024 Candidate Experience
Report, about 2,500 respondents. An assessment vendor, no frontline breakout, and it measures a **perception**
rather than a behaviour.

### Untraceable

**21 to 30 day time-to-hire for frontline grocery.** No measured source exists. FMI publishes turnover and
recruitment difficulty but no time-to-fill. BLS and JOLTS do not measure hiring duration at all. The closest
textual match is a Paradox or Workday executive in a vendor blog saying "it would take 20 or 30 days to hire
someone", which is a conversational recollection of the vendor's own before-picture, and therefore the number
that vendor has the most incentive to inflate.

**And two published figures point the other way, both roughly double his.** iCIMS platform data: "Time to fill
(TTF) in retail also increased from 40 to 42 days", requisition-open to offer-accept, retail broadly. The SHRM
2025 Benchmarking Survey puts median time to fill in the high thirties to low forties, same definition, from
2,371 US HR respondents across all industries.

Neither measures application-to-first-shift and neither is grocery, so they do not replace his number. But
**anybody using 21 to 30 days as the industry baseline is using a figure half the size of the only two published
retail numbers**, and taking it from the party selling the improvement. That matters for us too: our own tier-1
argument is about compressing elapsed time, and the baseline we cite should not be a vendor's before-picture.

**Our own four runs reached the same conclusion independently**, which is the most reassuring part of the
exercise: two separate efforts concluded the grocery number does not exist.

**"The best candidates are off the market within 48 hours."** No origin whatsoever. It lives only on uncited
vendor SEO pages, and the pages that carry it pair it with a claim that candidates contacted within five minutes
convert 21 times better, which is itself laundered from a study of **B2B sales leads**.

**92% of applicants are never screened.** No source as worded, and worse, it is a **duplicate**. The only 92%
with any pedigree is a SHRM figure measuring apply-click-to-completion drop-off, which is the same construct as
the 94% abandonment claim. His funnel diagram lists them as two sequential stages. They are one measurement
counted twice.

**37% screen-to-interview.** The weakest number in the folder. SEO blogs only, always bare. Where they gesture
at attribution they name CareerPlug and NACE, and **neither publishes a screen-to-interview metric at all.**

**55 to 70% of grocery employees are part-time.** BLS does not publish part-time status at that industry detail.

**60 to 76% annual frontline grocery turnover**, which is the number his entire cost model rests on.
**No US government body publishes a grocery-specific turnover rate.** The JOLTS industry catalogue contains 28
industries and its finest retail granularity is "Retail trade". There is no grocery row, no supermarket row, no
food-and-beverage-retail row. That is why every document in this space cites a survey, and it is why our own
repository ends up citing Korn Ferry.

### The boomerang claims

These matter most because the boomerang fast-track is a headline feature of his design. They went through both
a verification pass and an adversarial pass, and the adversarial pass corrected the first one in four places,
so what follows is the surviving version.

**"33% of retail new hires are returning employees."** Traces to an HBR article co-authored with Visier, and it
is an analysis of **Visier's own client data**, not a labour-market measurement.

The study sample is **3 million employee records across 120-plus firms, 2019 to 2022**, taken verbatim from an
archived copy of the HBR piece. That number is worth stating carefully, because the figure widely quoted
alongside this claim, 15 million records across 15,000 companies, is **Visier's entire commercial database from
the author bio, not the study**. The real sample is five times fewer records and roughly a hundred times fewer
firms, which matters a lot for an industry-level cut.

**The grocery number is different, but it does not refute the retail one.** Ceridian and Dayforce, across
850,000 employee records, put supermarkets and grocery stores at **19%**. That is a different vendor, a
different book of business, a different year, and no stated boomerang definition at all, against Visier's
"external hire with a prior resignation inside a three-year lookback". So the honest verdict is **two
non-comparable vendor datasets disagreeing**, not one disproving the other. The practical conclusion survives
either way: 33% is the wrong number to put in a grocery product's PRD.

One coincidence worth knowing: **33% is exactly the Ceridian figure for civic and social organisations.**

**UPDATE 26 Aug 2026: there is a primary number, and none of the vendor figures is close to it.** The US Census
Quarterly Workforce Indicators put **recall hires at 8.9% of retail hires in 2024** and 8.5% in 2023, with a
series running from 2015. Retail sits **below** all private industry at 12.7%, and below construction,
transportation and warehousing, health care, manufacturing and accommodation and food services. QWI is a lower
bound because it sees returns only within four quarters, so the true figure is higher by an unknown amount. But
the gap between 8.9% and the 19%, 31% and 33% stacked above is not measurement noise. It is the difference
between government payroll data and vendor client books.

**And the one peer-reviewed retail study is lower still.** Arnold and colleagues, Journal of Management 2021,
in a US retail chain: rehires were 4% of manager-trainee placements and 5.9% of outside-sourced hires. **The
same study found rehires turned over more than external hires, 36.6% against 33.5%**, which is the opposite of
the retention claim this section is examining. Verified in 01-diagnosis/verification-2026-08-26.md.

**Claude used the 19% figure on 26 Aug and has withdrawn it.** Recorded here because this section is the one
that warned against exactly that.

**And a third figure exists that is broader still.** ADP reports boomerangs at "31 percent of new hires on
average" since 2018, but its definition has **no resignation requirement and no lookback ceiling**, so it
captures terminations, layoffs and seasonal recalls. Stacking 31%, 33% and 19% as three estimates of one
quantity is definition drift, not triangulation.

**"Boomerangs have 5.7% turnover versus 65%, so 11x better retention."**

The 5.7% has exactly one home, a Ceridian blog post, with no underlying report anywhere. Its data is from 2021.
The 65% denominator was independently re-derived from the BLS API and does check out arithmetically as retail
trade total separations for 2021, at 64.9%. But that is **all separations over all employment in NAICS 44-45**,
not a new-hire figure.

**The 11x appears in no source.** It is the PRD's own arithmetic across two organisations, two populations and
two incompatible methods.

The adversarial pass strengthened that verdict while overturning how the first pass argued it. The vendor
justifies its own comparison by citing "57% according to the BLS", and the refuter pulled the actual JOLTS
series to check: retail trade total separations run 57.8, 58.5, 69.8, 64.9 and 59.7 across 2018 to 2022, a
five-year mean of 62.1, and accommodation and food services runs a mean of 91.1. **No BLS series corresponds to
the retail-plus-hospitality-plus-supermarkets blend the vendor claims at 57%.** The figure matches total nonfarm
in 2020, or retail trade in 2018, and neither is the mix being described.

**And the only peer-reviewed measured comparison points the other way.** Arnold, Van Iddekinge and colleagues,
"Welcome Back? Job Performance and Turnover of Boomerang Employees Compared to Internal and External Hires",
using longitudinal personnel records inside one organisation on one method: 1,318 boomerangs against 20,850
external hires and 8,546 internal promotions. The authors conclude that "the overall results call into question
some of the assumed benefits of rehiring." Honest caveat, and it is a real one: that study covers management
positions, not hourly.

**What this means for us.** It does not touch E1. Our interest in rehires is *blocking* the ineligible ones, and
that case stands on its own evidence. What it does undermine is treating a returning employee as automatically
a better hire and fast-tracking them past screening on that basis. If we ever add a boomerang path, **the
retention premium is not established and should not be claimed.**

**The retrieval hazard, worth internalising.** The top search results for both figures are SEO listicles that
print the numbers and attribute them to HBR, ADP or Visier with no link. Two of the pages that appear to
corroborate each other, EnterpriseAlumni and PeoplePath, are both corporate-alumni-network vendors selling into
the same rehire use case, and one of them 404s. Two vendor blogs retyping one paywalled sentence is one source,
not two.

### What was not verified

Five clusters never returned: manager time burden and district span, mid-market segment sizing and the
six-chain table, the cost model including the $480 cost per hire and the $40M turnover figure, the remaining
competitor and vendor facts, and the SMS channel claims. Two adversarial passes also died.

The cause was mundane. **Eight of the sixteen agents were killed when the machine went to sleep mid-run.** So
those five clusters are genuinely unverified rather than verified and clean, and nothing should be inferred from
their absence. Given the pattern in the five that did complete, the prior on the cost model in particular should
be low: it is built on the 60 to 76% turnover figure, which is untraceable, so the $3.6M and $40M outputs
inherit that.

The clusters that did complete are the load-bearing ones, and they were chosen that way.

### The pattern

Sorted by how the numbers behave rather than by cluster, three groups emerge.

**Sound.** Government series and Census revenue, when somebody goes and gets them. Every corrected figure above
came from BLS or Census in one query.

**Assumption tier but usable.** Large vendor datasets where the vendor publishes its sample: Appcast, CareerPlug,
BambooHR. Not measurements of the market, but honest about what they are and big enough to be directional.

**Unusable.** Anything expressing a rate at a specific funnel stage, anything about candidate behaviour timing,
and anything comparing two cohorts. Those are the three shapes that turn out to be SEO content, campus-recruiting
benchmarks wearing a retail label, or arithmetic performed across incompatible sources.

**A rule that would have caught most of it:** if a number describes a *stage conversion* or a *behavioural
deadline*, assume it is invented until the original study is in hand.

---

## Two places his work corrected ours

Worth recording, because the traffic went both ways.

**The Paradox acquisition price.** His teardown states "Acquired by Workday for ~$1B in cash, completed
October 1, 2025." Our records said Workday disclosed no price and that press reports of about $1 billion were
reports rather than disclosure. **He was right and we were under-recorded.** Chasing it produced a primary
source neither of us had: Workday's Form 10-Q for the quarter ended 31 October 2025, Note 7, states the total
acquisition-date fair value of the consideration was **$1.1 billion, of which $1.0 billion cash**, plus a
$20 million equity interest Workday already held.

Two things fall out of that filing that are new to both projects. **Goodwill is $781M of a $1,063M allocation
against only $253M of identifiable intangibles**, so Workday's own accountants could attribute barely a quarter
of the price to identifiable technology. It bought the position in frontline candidate experience, not the
codebase. And **Workday was already an investor** before it acquired.

Also settled: the two dates are both correct and not a contradiction. Definitive agreement 21 August 2025, which
is what we had recorded. Completion 1 October 2025, which is what he had recorded. The 10-Q gives the accounting
acquisition date as September 2025.

**And a mistake of ours his folder surfaced.** Chasing his Chipotle figure showed that our own fourth research
run claimed the 12-to-4-day number as a first find. It was not. **We already had it as E-047 in EVIDENCE.md**,
recorded on 11 August from Workday's acquisition release, correctly tiered as a vendor claim, and already
carrying the note that Chipotle's turnover rose in 2025 so the two together test the speed-versus-tenure
question. Both the research file and the status doc are corrected.

---

## What we should not take

**The eleven competitor teardowns as a competitive baseline for our project.** They are well organised and
useful as a feature inventory, but the sourcing is predominantly the vendors' own marketing sites, with review
aggregators behind that: phenom.com 18 URLs, heymilo.ai 16, findem.ai 14, eightfold.ai 9, then G2, Capterra,
SelectSoftwareReviews, SoftwareFinder. Under our own evidence rules that is assumption tier, which is exactly
how we already treat vendor claims. And the eleven are corporate hiring tools. Our two actual competitors are
covered more deeply in our own repository than in his.

**The Interview Prep Agent.** `prd-v1.md` section 4.5 generates a candidate brief, tailored questions and a
rubric 24 hours before each interview, including what not to re-ask because another round covers it. Good
design for a multi-round corporate loop. Frontline hiring is one fifteen-minute conversation, so it does not
transfer.

**The Workday per-employee pricing anchor as-is.** His Workday teardown estimates $34 to $42 per employee per
month, which is $408 to $504 a year. Applied to a 1.6 million associate retailer that would be $650M to $800M a
year, which is not plausible. It is an enterprise-scale estimate that does not extend to hourly headcounts at
that volume. Useful as a shape for Q-030, dangerous as a multiplier.

---

## Questions for Anuj

Ordered by what they unblock.

1. **Where do the funnel numbers come from?** The 94% application abandonment, 95 applications per hire, 32%
   interview no-show and 21-30 day time-to-hire. We have spent four research runs failing to source figures of
   exactly this kind, so if he has traceable origins they are worth more to us than anything else in the folder.
2. **Is the auto-decline deliberate?** His executive summary, his prd-v1 principles and his own competitor
   research all point the other way. If it is deliberate, what is the answer on Local Law 144?
3. **Where did the requisition trigger shares come from?** Backfill at 90%, new headcount at 5 to 8%, seasonal
   at 2 to 5%, and the 3 to 7 day lag. Practitioner conversations, or reconstruction?
4. **Has he spoken to anybody who runs hourly hiring?** This is the thing our project has failed at four times.
   If he has a route, that is the most valuable thing he owns.
5. **Is HireAgent still live, or did the retail PRD supersede it?** Two products, three days apart, different
   buyers. The competitor research supports the first.
6. **Why grocery mid-market rather than big-box?** He gives four reasons and they are coherent. Ours points the
   other way and it would be useful to know whether he considered and rejected the large-retailer path.
