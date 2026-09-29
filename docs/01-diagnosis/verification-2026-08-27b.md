# Verification run four, 27 August 2026: per-step durations

Six clusters, twelve agents, **all twelve completed.** 137 claims survived, 27 killed. 87 supported outright, 50
narrowed.

**This run finally produced real per-step numbers**, and it produced one definitional correction that invalidates
a comparison this project has been making for two weeks.

**It also caught five fabrications**, where a finder quoted text that does not exist on the page it cited. Named
below, because that pattern is the reason the verify pass exists.

---

## 1. The correction that matters most: we have been comparing two different spans

**SHRM's time-to-fill is calendar days from the requisition opening to the offer being ACCEPTED. It excludes the
offer-acceptance to first-day window entirely.**

**So the 39 to 42 day baseline and our five to six day target do not measure the same thing.** Our target is
application to first shift worked. The industry figure stops at offer acceptance. **Comparing them overstates our
improvement by however long onboarding takes**, which is the part of the funnel nobody publishes.

**The related definitions, so this does not recur.** SHRM time-to-fill starts at the requisition. SHRM
time-to-hire starts at the eventual hire's entry into the pipeline. **Both end at offer acceptance.** Time-to-hire
is usually shorter but not always, and it is survivor-selected, because a candidate already in the pipeline before
the requisition opened produces a longer time-to-hire.

**Paradox's figures are the ones that are comparable to ours**, because they are application to first day worked,
"apron on". That is now the only external anchor we can legitimately compare against, and it is a vendor's own
claim.

**Latest baselines, with their years.** SHRM 2026 benchmarking: nonexecutive median time-to-fill **39 calendar
days**, down from 44 in 2025. Employ 2025: time to screen **7.2 days** overall. And **iCIMS reports retail average
time-to-fill at 34 days**, the lowest of its industries against 41 overall and 49 for technology, from its 2023
Workforce Report. **That 34 is a different figure from the 40 going to 42 we recorded earlier**, from a different
iCIMS report and year, so both need their year attached whenever either is used.

---

## 2. Real per-step durations, at last

All from SHRM Benchmarking: Talent Access. **Data collected April to November 2021**, published 2022,
nonexecutive, all industries rather than hourly-specific. Self-reported by HR respondents rather than extracted
from systems.

| Stage | Median | 25th | 75th | Mean | n |
|---|---|---|---|---|---|
| Requisition approved to posted | 2 days | | | | 840 to 942 |
| **Decision to offer** | **4 days** | 2 | 7 | 6 | 936 |
| **Offer to acceptance** | **2 calendar days** | | 4 | | 942 |

**Two cautions that came from the verify pass rather than the finder.** The stages are **not additive**, and each
stage has a different respondent base, so they are not measured on a common set of organisations. And the
day-counting convention is unstated for individual stages; calendar days is specified only for the total.

**Offer to acceptance ties with requisition-to-posted as the shortest stage in the whole funnel.** That is worth
knowing, because step 8 was one of the four unknowns D-023 moved to the measurement list, and the answer appears
to be that it is fast.

---

## 3. The application stage, and a nine-year-old statistic everybody quotes

**iCIMS 2025, the one report whose population is ours**, 1,000 US hourly frontline workers plus 1,000 frontline
hiring managers, fielded by Censuswide **31 July to 11 August 2025**:

- **60% of frontline workers have started but never finished a job application.**
- Retail: **56% cite an overly long or time-consuming process.** Hospitality abandonment 68%.
- Abandonment reasons: forms too long **50%**, uncertainty about qualifications **35%**, no pay transparency
  **31%**.

**A correction to how we have been using those three.** They sum to 116%, so **the question was multi-select.**
That means 50% is the share of abandoners who cite length among other reasons, **not the share of abandonment
caused by length.** We have been treating them as a partition and they are not one.

**And a sourcing trap.** iCIMS's UK edition of the same study family publishes materially different numbers, 76%
started but did not finish and 88% hospitality abandonment. **Cite the US page specifically or the figures drift.**

**Appcast's application-length statistic is from 2017.** The much-quoted 12.47% completion for applications under
five minutes against 3.61% for fifteen minutes or more comes from a page published **8 November 2017**, last
modified March 2021, so it reflects roughly 2016 to 2017 job-ad data. Nine years old. No sample size, no
denominator definition.

**And the two versions of it are different numbers.** 12.47 against 3.61 is a 3.45x ratio, which is a 245%
increase. Appcast separately publishes a "350% increase", which is 4.5x. **Those cannot both describe one
relationship**, so anybody quoting "350%" and "12.47% versus 3.61%" as the same finding is wrong.

**One useful definition confirmed.** Appcast defines application drop-off as the inverse of apply rate, so its
figures are **click to complete, not start to complete.**

**Apply rate, current.** Appcast's median ended 2024 at **6.1%, up 35% from January to December** against a 7%
decrease in job openings, across 1,300-plus employers, 281 million clicks and 25.6 million applications. Retail
specifically is **5.26%**.

---

## 4. Candidate patience, which is the closest thing to a number for E-062

**E-062 is the claim relayed from Anuj that the manager loses the candidate before finishing screening.** It is
the mechanism our whole argument rests on and it has had no number behind it. This run found the nearest thing.

**77% of manufacturing hourly workers say they would accept a job within 48 hours of applying or interviewing.**
iCIMS 2025, same sample and fielding window. **No retail equivalent is published**, and manufacturing was the
highest of the four sectors, so it is an upper bound rather than a transferable figure.

**And retail interview no-shows now have a real number, for the first time in this project.** **12% of retail
hourly workers say they have skipped an interview**, against 26% in hospitality. The leading reason is "got
another job", at 28% for retail. iCIMS 2025.

**Note the framing carefully.** That is a lifetime "have you ever" question, **not an annualised rate**, so it
cannot be used as a per-interview no-show rate. But the leading reason being another job offer is direct support
for the E-062 mechanism, which is more than we had.

**And the 32% figure is now fully explained.** 32% of frontline hiring **managers** name interview as the biggest
candidate drop-off point, against 20% for scheduling and **7% for the offer stage**, the lowest of five. That is
where managers perceive loss. It was never a no-show rate.

---

## 5. Ghosting and reneging, with the numbers separated properly

Three different things get conflated and this run separated them.

- **Gartner, November 2023**: **51% of new hires say that after accepting an offer they later declined it or
  ghosted the employer**, up from 36% in 2019 and 44% in 2022. n=3,500, all industries, self-report, and the base
  is people who accepted an offer.
- **Jobvite 2018 ATS data**: retail offers-to-hires **98%**, the highest of eleven industries, against 93%
  all-industry. **Jobvite counts a hire at offer acceptance**, so this is an acceptance rate, not a start rate,
  and it cannot be netted against renege figures. Eight years old.
- **Employ 2025**: overall offer-acceptance **83.9%**. **Retail acceptance is genuinely not published**; the 39.3%
  sometimes attributed to retail is its interview-to-offer rate, which is a different thing.
- **SHRM 2025**: 41% of organisations reporting recruitment difficulty report an **increase** in candidate
  ghosting, third behind low applicant volume at 51% and employer competition at 50%. Employer perception, not a
  rate, and SHRM locates it at the interview stage rather than post-offer.

**One vendor figure to stop using.** Fountain's Stitch Fix "68% to 95%" is a **compound** background-check-pass
and day-one-show-up rate. It cannot be read as a 32% day-one no-show rate, which is how it circulates.

---

## 6. The legal floor on starting the background check earlier

**This was flagged as pending in PRD v0.1 and it is now answered. Mechanism 2 survives, with a jurisdiction floor.**

**FCRA does not gate the timing.** 15 U.S.C. 1681b(b)(2)(A) requires only a standalone written disclosure "at any
time before the report is procured" plus written authorisation. **So federal consumer-report law imposes no
offer-relative restriction at all.**

**State and city fair-chance law does, and the floor is the conditional offer rather than acceptance.**

- **California**, Gov. Code 12952(a)(2), employers with 5 or more employees: unlawful to inquire into or consider
  conviction history **until after a conditional offer**. And 2 CCR 11017.1(a) extends that ban **to the background
  check itself and to internet searches**, with (a)(3) removing the non-disclosure workaround.
- **New York City**: all non-criminal vetting must come first, with narrow exceptions for an ADA-permitted medical
  exam and for information the employer could not reasonably have known pre-offer.
- **Illinois**, 820 ILCS 75/25: the trigger is **conjunctive**, the applicant must be determined qualified **and**
  notified of interview selection. Exemptions where a fidelity bond or a legally required check applies.
- **California's five business days** for the applicant to respond is a **statutory floor measured from when the
  applicant receives the check and the Fair Chance Analysis**, so it is a lower bound on that branch rather than
  its expected duration.

**So the mechanism is: order the check at the conditional offer, not after acceptance.** That is the earliest
lawful point in the strictest jurisdictions, and it still moves the check off the post-acceptance critical path.
**It is a configuration per jurisdiction, not a single rule.**

**One coverage claim was fabricated.** "More than 37 states, D.C., and over 150 cities and counties" does not
appear on the page it was cited to. Do not use a coverage count.

---

## 7. Moving onboarding earlier has a payroll cost, and it is confirmed

**Also flagged as pending in v0.1. It is real.**

**29 CFR 785.27 sets four conjunctive criteria** for training time to be non-compensable, and **mandatory
job-specific onboarding training plainly fails two of them** on the regulation's own terms. So it is hours worked
and it must be paid. Sections 785.30 to 785.32 carve out genuinely independent programmes, which mandatory
onboarding is not.

**And the de minimis rule will not absorb it.** 29 CFR 785.47's practical floor is around ten minutes a day per
the cited case law.

**So mechanism 3, overlapping onboarding into the pre-start window, converts unpaid waiting into paid time.** That
is not a reason to abandon it. It is a reason the pitch becomes "faster, and here is what it costs", which is a
different conversation and a better one to have before a customer discovers it.

**Two related claims were fabricated and are not usable.** That applicant pre-employment time is "generally not
compensable", quoted to a page that does not contain it. And a California reporting-time-pay two-hour figure,
quoted to a page whose holding runs the other way.

**One I-9 edge case worth building for.** For hires of **fewer than three business days**, Section 2 must be
completed no later than the first day of employment. Form I-9 instructions, edition 01/20/25, page 1. That matters
for very short seasonal assignments.

---

## 8. Evidence that parallelising works: thin, and the best source is a government one

**The only structured source found is OPM's End-to-End Hiring Roadmap**, March 2017, page 27, which allocates
maximum calendar-day budgets across a **fully sequential** fourteen-step process summing to exactly **80 days**,
including Tentative Job Offer and Accept at 3, Initiate Security Check at 10, Official Offer and Accept at 2, and
Entry on Duty at 14.

**It shows the security investigation being initiated after the tentative offer**, which is the parallelising
pattern, and **OPM states a time-saving rationale but publishes no measured elapsed-time result.** So it is a
worked example of the sequencing, not evidence of its size.

**Everything else in this cluster failed.** Five claims were refuted as fabrications, including a Bojangles case
of 30 days to 5.8 days whose cited page contains none of it, and a Workstream quotation that does not appear on
the page. A vendor claim of "5 to 7 days faster" turned out to be attributed to that vendor's own 24 to 48 hour
turnaround rather than to any sequencing change.

**So the honest position on the central mechanism is that it is sound in principle, supported by one government
process model, and unmeasured.** Which is another entry for the list of things v1 has to produce itself.

---

## What could not be established

- **Any measured elapsed-time saving from parallelising hiring stages.** Section 8. The mechanism is the product's
  core argument and nobody has published its size.
- **A retail-specific offer acceptance rate.** Employ publishes overall; retail is absent.
- **A retail equivalent of the 48-hour acceptance-window figure.** Only manufacturing is published, and it was the
  highest of four sectors.
- **An annualised interview no-show rate for retail.** The 12% is a lifetime "have you ever" figure.
- **Any current application-length statistic.** The one everybody quotes is from 2017.
