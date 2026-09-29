# Verification run two, 26 August 2026: LinkedIn access, and the alternatives

Suniras asked for the LinkedIn finding to be re-verified independently and for alternatives to be found. Six
clusters, twelve agents, **eleven completed. The adversarial verifier on the hiQ cluster was killed when the
machine slept mid-run**, so section 2 below is findings without a refute pass and is labelled accordingly.

167 claims survived, 11 were killed. 78 supported outright, 89 narrowed.

**The headline is that the original finding was right and understated, and that the LinkedIn question turned out
not to be the important one.**

---

## 1. LinkedIn. Confirmed from LinkedIn's own current documentation, and it is more closed than reported

**The verbatim text, from the live page**, moniker li-lts-2026-03, updated 3 June 2026:

> "We are currently not accepting new partnerships for LinkedIn's Job Posting API. If you would like to gain
> access to LinkedIn's Job Posting APIs please request access to Apply Connect."

And on the same page:

> "The use of these APIs is restricted to those developers approved by LinkedIn. Please reach out to your
> LinkedIn Relationship Manager or Business Development contact as you will need to meet certain criteria and
> sign an API agreement with data restrictions in order to use this integration."

**It is gated, not retired.** No deprecation notice, versioned through release 202603, still listed as a live
programme. So an existing partner keeps working and a new entrant cannot start.

### Two corrections to what was reported on 26 Aug, and the first one goes the wrong way for us

**More is closed than just the Job Posting API.**

- **Apply with LinkedIn is closed to new partners.** "Note that we are currently not accepting any new partners
  for Apply with LinkedIn (AWLI)." Documented since September 2023 and still closed on the May 2026 page.
- **Sales Navigator Application Platform is closed to new partners.**
- **LinkedIn Referrals has been closed since March 2018.**
- **Easy Apply is fully deprecated as of release 202603.**
- **Talent Hub was retired on 31 December 2024** and no longer appears in the programme index.

**"No self-serve path to anything" was too absolute.** Three self-serve things exist and none solves the problem.

1. **Free manual posting in the LinkedIn interface.** No partnership, no cost, but manual only, one active post
   at a time, 14 days, and an application cap in the region of 10 to 30. Fine for one job, useless for a product.
2. **Job Wrapping.** LinkedIn's help pages say it can be set up self-serve, but **the end customer must own paid
   Job Slots** and the developer FAQ says to start through an account manager. The vendor gets no API either way.
3. **Member Data Portability (3rd Party).** Genuinely "request access" from the developer portal with business
   verification and no business-development contact needed. But it returns **only the consenting member's own
   data, and only for members in the EEA.** Not a lookup tool.

### The free feed route, priced and bounded

The Basic Jobs XML feed is real and free. LinkedIn's own words are that it does not charge for ingestion and
hosting. Everything else about it is a constraint:

- **Still gated.** Non-partners email LinkedIn business development for evaluation, and are judged on **daily
  listing volume and market coverage.** A startup with three customers fails that screen on its face.
- **No guarantee of publication.** LinkedIn answers "no" to whether it guarantees ingesting supplied listings.
- Full-list feeds, not deltas. Six-hour latency for ATS partners, 24 hours for job board partners.
- Subject to employer opt-out, deduplication against higher-priority sources, spam review, and LinkedIn's
  reserved right to force paid promotion on some job types.

### And the lookup that mattered does not exist at all

**There is no LinkedIn API that takes a named individual and returns their current employer.** Established route
by route:

- Profile API position fields are partner-gated **and** scoped to the authenticated member, so they return the
  user's own employer and nobody else's.
- The People Search API was withdrawn from public access years ago and is absent from current documentation.
- Sales Navigator Profile Associations returns a profile URL, a member URN and a public photo. **No employer, no
  title.** It also requires CRM Sync, which supports only Dynamics 365 and Salesforce, plus SNAP partnership,
  which is closed.
- Talent Solutions surfaces candidate profile data only for a paying Recruiter customer's own candidates, by
  recruiter-initiated export.
- Member Data Portability is own-data, consent-based, EEA only.
- Scraping to fill the gap is prohibited by the User Agreement, and see section 2.

**So the conclusion reported on 26 Aug holds and understated the case.** The freshness lookup that sat underneath
the skill-graph proposal has no supply from LinkedIn by any route, paid or free, partner or not.

**One gap worth naming.** LinkedIn publishes no prices anywhere for Apply Connect, Recruiter System Connect,
Premium Job Posting or Job Posting API partnership, and no list price for Recruiter Corporate, Recruiter
Professional Services or Job Slots. All are quoted by sales. The only cost statement LinkedIn makes in its own
documentation is that Basic Jobs ingestion is free.

---

## 2. hiQ Labs v. LinkedIn. NOT ADVERSARIALLY VERIFIED, because the verifier died

**Read this section knowing it has had one pass, not two.** The machine slept and killed the refute agent. The
findings below are from primary court documents by the finder's account and they are the most consequential
things in this run, which is exactly why they need the second pass they did not get. **Do not cite any of it
without checking.**

**The outcome for hiQ, which is the part everybody who cites this case leaves out.** hiQ **paid LinkedIn
$500,000, was permanently enjoined, and had to destroy its models and the data.** Consent judgment, docket 406.

**The injunction's shape matters more than the amount.** It bars automated access and the development of
competing commercial services **"without express written permission of LinkedIn."** So the case did not
establish a right to scrape. It established a permissioning regime and then enforced it.

**The district court recorded that regime explicitly**: entities seeking to crawl LinkedIn apply for permission
and, if allowed, must abide by LinkedIn's robots.txt and its Crawling Terms and Conditions.

**Why the case is cited the other way.** The Ninth Circuit's holding was about the **Computer Fraud and Abuse
Act**, and it went for hiQ: scraping publicly available data does not amount to access "without
authorization" under the CFAA. **That is a different question from whether it is lawful.** LinkedIn then won on
**breach of contract** under its User Agreement, which is where the $500,000 and the injunction came from.
Anybody who reads "hiQ won" and stops has read the first half.

**hiQ's business was the closest analogue to this idea that exists.** It sold employee-attrition prediction to
**employers**, built on scraped public profile data. That is a hiring-adjacent product doing individual-level
inference from public profiles, which is the shape of the freshness lookup.

**The one fact pattern that has won a contract ruling.** In Meta v. Bright Data, the court held that terms
governing "your use" do not reach logged-off scraping, and Bright Data held no accounts at the relevant time. So
**logged-out-only scraping, with no accounts at all, is the only pattern with a favourable contract ruling.** It
is a district court decision, jurisdiction-specific and terms-text-specific, and it does not survive holding an
account, logging in, or using proxies or fake accounts to evade blocks.

**Also recorded, and it needs its own check because it affects section 3.** The finder reports that **CFPB
Circular 2024-06 was withdrawn in May 2025**, at 90 FR 20084. That circular was the agency's statement that
dossiers and scores about identifiable people sold to employers are consumer reports. Withdrawing it removes the
agency's stated interpretation. It changes neither the statute at 15 U.S.C. 1681a nor the private right of
action, so the exposure remains while the guidance does not.

---

## 3. The real finding: the lookup is not an API problem, it is a regulatory-structure problem

This is the answer to the question that was actually asked, and it did not come from the LinkedIn cluster.

**The FTC's own commentary draws the line in a place that is fatal to the feature as a product.** Its "40 Years
of Experience with the FCRA" report, comment 603(d)-1: a communication to an employer about a job applicant from
a source that is not a consumer reporting agency, such as a prior employer, is **not** a consumer report. But
comment 603(o)-2: **a vendor doing the same thing on the employer's behalf is a screening service, and a
screening service is a consumer reporting agency.**

**So the same lookup is unregulated when the employer does it and regulated when we do it for them.**

The cluster's own summary of its search: **no option was found that lets a vendor sell an employer a candidate's
current employer for use in a hiring decision while staying outside the FCRA.**

**What that means concretely.** Building this feature does not mean adding an integration. It means becoming a
consumer reporting agency, or buying from one, and taking on permissible-purpose certification, standalone
disclosure, written authorisation, and the two-step pre-adverse and adverse action sequence, for every lookup.

**The compliant routes, in ascending order of cost:**

1. **Ask the candidate.** No third party assembles anything, so no consumer report and no FCRA. Cost zero. This
   is the route the incumbents actually use, see section 5.
2. **Consumer-permissioned payroll connection.** The candidate logs into their own payroll account and grants
   access. Argyle, Truv, Pinwheel. Still depends on candidate cooperation. Sold into mortgage, lending and
   tenant screening, and not marketed to frontline hiring buyers.
3. **Buy employment verification from a screener.** Checkr, Sterling, HireRight, First Advantage. FCRA rails,
   well-mapped. Priced, see section 5.
4. **Equifax's The Work Number.** Instant, payroll-fed, and priced for mortgage lending, see section 5.

**One honest gap, and it is the one that would decide a real design.** Nothing on point exists for the exact
fact pattern of a lookup whose output is limited to the candidate's current employer name. Every enforcement
action found involved criminal records, sex-offender records, full profiles or dossiers. There is no appellate
holding either way on employer-name-only data. **The narrow version of the feature is genuinely uncharted**,
which is a reason for caution rather than comfort.

---

## 4. State law, with four corrections the adversarial pass forced

**Corrections first, because the finder overreached and these matter.**

**The NYC Local Law 144 disclosure is on request, not published.** The finder claimed employers must publicly
post the tool's data retention policy, data types and data source. **Refuted.** NYC Admin. Code section 20-871(b)
makes that information "available upon written request by a candidate or employee." The **bias audit summary** is
the part that must be published. Still notable that this is the one live US rule reaching the third-party data
input by name, but the duty is narrower than reported.

**Two claims attributed to the EEOC are not EEOC positions.** The observation that race, gender, approximate age
and possibly ethnicity are usually discernible from a profile was made by **outside panellists** at a March 2014
Commission meeting. The blind-screening mitigation, where a non-decisionmaker filters out demographic content,
was a **management-side attorney's recommendation** in the same meeting. **The Commission adopted nothing.** So
the discrimination exposure is real and obvious, and there is no EEOC guidance endorsing a mitigation.

**New York Labor Law section 201-i took effect 12 March 2024**, not September 2023, which was the signing date.

**The count of state credential-access statutes is 25 to 28, not a firm number.** The canonical tracker was
unreachable and secondary sources conflict. Rely on per-state citations.

### What stands

**Viewing a public profile is not prohibited** by the credential-access statutes, which are aimed at compelling
credentials or compelled access, and Michigan, Illinois and New York carve viewing out expressly. The universal
"no state prohibits it" version could not be proven and should not be asserted.

**Off-duty conduct statutes bite in three states**, and one of them reaches hiring: New York section 201-d
covers refusal to hire, North Dakota chapter 14-02.4, and Colorado section 24-34-402.5 which covers termination
only.

**California's ICRAA is the sharpest problem for a profile lookup.** Section 1786.2(c) captures information
about "character, general reputation, personal characteristics, or mode of living", which is a description of
what a profile scrape returns.

**Salary-history bans are a practical trap.** California, New York, Massachusetts and Colorado bar asking about
pay. **So pull employment status, never the compensation field**, even where the data source offers both.

### The AI-in-hiring map, corrected for what is actually in force now

| Rule | Status | What it adds |
|---|---|---|
| **NYC Local Law 144** | In force | Annual independent bias audit with a **published** summary, 10 business days' candidate notice, and data-source and retention disclosure **on written request** |
| **California, 2 CCR 11008.1, 11009, 11013** | In force since 1 Oct 2025 | **Automated decision systems are defined to include tools that merely facilitate a human decision.** Anti-bias testing is evidence. **Four-year retention of ADS data including inputs** |
| **Illinois, Human Rights Act as amended** | In force 1 Jan 2026 | Notice when AI is used in hiring, no zip-code proxying. **Rule content undefined: the state agency withdrew its proposed rules in 2026** |
| **Texas TRAIGA** | In force 1 Jan 2026 | Intent-based. No employer disclosure duty, so effectively no incremental obligation |
| **Colorado** | **Nothing in force now.** SB 26-189 lands 1 Jan 2027 | Notice, adverse-outcome explanation within 30 days, data access and correction, human review |
| **Utah** | Not applicable to hiring screening | |

**Two things follow for us.**

**D-016 needs a correction.** It lists "obligations under Colorado's AI Act" among the live costs of producing a
score. **Colorado has nothing in force.** Our own meeting notes already said Colorado repealed its duty before it
took effect, so the decision text is behind the file. The obligation is real but it starts 1 Jan 2027.

**California's definition is the one that binds us.** An automated decision system includes a tool that merely
**facilitates** a human decision. D-016 keeps a human deciding, which was partly a mitigation. **That mitigation
does not work in California**, and the four-year retention of inputs is a concrete storage and audit requirement
rather than paperwork.

**And a federal wildcard.** An executive order of 11 December 2025 created a Department of Justice task force
actively challenging state AI laws. Designing to the strictest live rule, meaning NYC plus California, is the
safe posture. Betting on preemption is not.

---

## 5. What the incumbents actually do, and the economics that decide this

**Asked plainly whether Fountain, Paradox and Workday, iCIMS, Greenhouse or SmartRecruiters advertise
determining a candidate's current employer from third-party or social data, the answer is that none of them do.**
Fountain's own integration taxonomy has no enrichment or employment-data category at all. **Greenhouse's own FAQ
affirmatively rules third-party data out.** iCIMS and SmartRecruiters describe parsing as document extraction.
Workday Paradox names Workday itself as the source.

**What they use instead, in order of how common it is:**

1. **Self-reported application data.** The candidate types their current employer in, or answers a conversational
   screening question. This is the actual norm in frontline hourly hiring. Cost zero, verification none. It is a
   claim, not a fact.
2. **Parsing the candidate's own resume.** Employer, title and dates extracted from a document the candidate
   supplied. Parsing does not check truth.
3. **Employment verification bought as a priced add-on** from a screener, on FCRA rails.

### The prices, and this is where the idea dies for our segment

**Checkr publishes $12.50 per check for current-employer verification**, scaling to roughly $50 for a ten-year
lookback, on top of a report priced at $29.99 basic, $59.99 essential or $94.99 complete.

**Equifax's The Work Number costs roughly $105 to $109 per verified match** as a pass-through. Coverage is
genuine: Equifax states 839 million employee records and over 5 million contributing employers, with investor
figures of about 209 million active records and 4.2 million employers. **So the instant current-employer
capability exists and works. It costs three to four times the entire criminal-only screening package used for
hourly roles.** It is priced for mortgage lending, not for hiring forty thousand warehouse associates a year.

**On timing, the adversarial pass narrowed the claim.** The finder said verification adds three to five days.
First Advantage's own page says education and employment verifications typically return **within one to three
days**, and the page names neither HireRight nor Sterling, so the wider figure was not supported. What stands is
that a criminal-only hourly package returns in 24 to 48 hours and verification is a slower leg on top of it.

**That is a direct constraint on D-027.** The target is five to six days application to first shift. Adding
employment verification adds one to three days to a step that is already the longest fixed clock in the funnel.
**Which is very likely why hourly packages are criminal-only**, and it means any design that adds verification to
a frontline flow is spending the speed budget the target depends on.

### The finding that settles it

**Public-profile enrichment is the only category that advertises knowing where somebody works now.** SeekOut,
hireEZ, LinkedIn Recruiter, Apollo and Clay, over a billion profiles. It is an outbound sourcing tool for
professional and technical hiring.

**Frontline hourly workers are largely absent from those datasets**, and none of the five applicant tracking
platforms resells the capability.

**So for our population the feature fails three times over.** The API does not exist. Doing it for an employer
makes us a consumer reporting agency. And the data is not there for the people we are hiring. **It is a solution
looking for a problem in this segment**, and the honest thing to record is that the capability the buyer actually
wants is something else: identity, right to work, or rehire eligibility.

---

## 6. Job board distribution. The recommendation on 26 Aug was wrong and this is better

**I recommended buying the outbound fan-out. That was premature.** There is a free, unilateral tier that needs no
partner, no agreement and no gatekeeper, and it should be shipped before anything is bought.

### Tier 0: free, unilateral, nobody can refuse you

**Google for Jobs, through schema.org JobPosting.** Emit JSON-LD on each job detail page with five required
fields, title, description, datePosted, hiringOrganization, jobLocation, publish an XML sitemap, and optionally
call the Indexing API. **Cost zero. No contract, no application, no approval for eligibility.** The only approval
anywhere is Indexing API quota above the default 200 URLs a day. Roughly one to three developer weeks.

Two traps. The structured data must sit on the **single job page**, not a listing page. And expiry must be
implemented, using validThrough in the past, a 410, or noindex, or the site risks a manual action.

**Free aggregator feeds. One feed file, several submissions.** Adzuna states it first-party: "Provide us with an
XML feed of all of the organic jobs on your platform and we'll advertise them for free." Jooble takes the same
feed through a support ticket. Careerjet, Talent.com, Jora, WhatJobs and Trovit run the same publisher-application
pattern. **Cost zero for organic placement.** About one developer week for the feed and a day of admin each.

**So for zero dollars and two to four developer weeks, the truthful claim becomes: your jobs appear on Google for
Jobs, Adzuna, Jooble, Careerjet, Talent.com, Jora and WhatJobs.** Nothing to negotiate and no gatekeeper who can
kill the roadmap.

### Tier 1: free API, but a signed agreement and a real build

**Indeed Job Sync API, GraphQL.** Signed Developer Agreement, then a formal partner application, OAuth, sandbox
provided. Indeed Apply and screener questions are conditions of approval, and integrations must be
comprehensive, meaning all public jobs for every client. **API calls are free**; employer ad spend is separate
and unpublished. Indeed states about six weeks.

**This is now non-optional to claim the largest destination.** Single-source XML feeds went sponsored-only on 31
March 2026 and are being switched off through 2026 wherever an integrated applicant tracking system exists.
**Being an integrated ATS is now the only route to free organic Indeed placement at scale.**

**ZipRecruiter Partner API.** Register as a partner and receive a key, through atsintegrations@ziprecruiter.com,
no self-signup. The documentation is the best of any destination surveyed: Jobs, Questions and Features APIs, XML
feed import, an Apply webhook, hiring signals, embedded sponsorship, an SDK, and an MCP connector. No partner fee
published. There is no meaningful free organic tier, so the employer needs a paid plan for jobs to run.

### Tier 2: one integration, many destinations

**JobTarget is the best value and the only vendor with public prices.** One integration gives customers 25,000
plus job sites plus programmatic advertising and OFCCP compliance tooling, and it already has more than 80
applicant tracking integrations. The partner programme is revenue share plus co-marketing with **"no added costs
or fees" to the ATS partner**, and the end customer pays **$5 per posting** on zero-cost boards and the board's
own rate on paid ones. **That $5 is one of only two hard prices in the entire category.**

**Everything else is demo-gated with nothing published.** VONQ HAPI reaches 5,000 plus channels and is live in
more than 85 platforms including Fountain. Veritone Hire, formerly Broadbean, sells embeddable JSON widgets with
HMAC-signed API keys. eQuest claims 35,000 plus destinations across 183 countries and says only that "pricing is
extremely reasonable and based on your posting output", with an unlimited-postings annual option. PandoLogic is
the only explicit white-label offer found. **Recruitics is the weakest documented option: its partner pages all
return 404 and the programme appears only in third-party directories.**

### The ranking, cheapest credible first

1. **Google for Jobs plus five to seven free aggregator feeds.** Zero dollars, two to four developer weeks,
   immediately truthful, no gatekeeper.
2. **Add the Indeed Job Sync API.** No fees, but an agreement, a six-week build and the all-jobs obligation.
   Non-negotiable for the largest destination and now the only free organic route into it.
3. **Add ZipRecruiter.** Free key, best documentation, small build, employer carries the ad cost.
4. **Resell JobTarget.** Zero cost to us, revenue share to us, and the only published end-customer price.
5. VONQ, Veritone Hire, eQuest or PandoLogic. Deeper reach or a branded product, but every term needs
   negotiating and nothing is published, so budget weeks of business development before knowing the cost.
6. **Avoid building direct integrations to individual boards.** Worst return on engineering. The aggregator and
   reseller layers exist precisely to absorb this work.

**One thing that does not exist.** There is no open standard that redistributes onward from a single feed. HR
Open Standards is free and open but is a schema body, not a rail, and no aggregator ingests jobs through it.
Jobg8 is a paid exchange rather than a standard, and the adversarial pass killed the price attributed to it: the
$0.20 figure is a minimum cost-per-click bid on its traffic product, not a per-application price, and its
application product benchmarks far higher.

---

## What could not be established

- **Pricing across almost the entire vendor layer.** Nothing published for VONQ, Veritone Hire, eQuest, Appcast,
  Joveo, PandoLogic, Recruitics or the ZipRecruiter partner API. All demo-gated or business-development gated.
  **Two hard prices exist in the whole market**: JobTarget's $5 per posting on zero-cost boards, and Jobg8's
  $0.20 minimum click bid.
- **Nothing on point for an employer-name-only lookup under FCRA.** No enforcement action, advisory opinion,
  circular or rulemaking, and no appellate holding either way.
- **An authoritative count of state credential-access statutes.** The canonical tracker returned an error and
  secondary sources conflict between 25 and 28.
- **The Supreme Court's 2021 order in the hiQ litigation could not be fetched directly**, though it is recited in
  the district court's own docket and on the face of the Ninth Circuit's opinion on remand.
- **SmartRecruiters' own description of its parsing** could not be confirmed: the page is bot-blocked and
  returned an error to every fetch route tried.
- **The whole hiQ cluster has had no adversarial pass.** See section 2.
