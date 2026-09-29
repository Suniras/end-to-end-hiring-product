# Evidence

Every claim we treat as true, and where it came from.

Three labels:

- **Verified.** There is a source, a document, or a named person behind it. Cited here.
- **Assumption.** Probably true, not checked yet, and we have written down how we would check it.
- **Unknown.** We don't know. Logged in OPEN-QUESTIONS.md.

Three standing rules:

1. Anything a competitor says in their own marketing is an assumption, never verified. Fountain
   saying Cue cuts hiring time by 30% tells us what Fountain claims, not what is true.
2. Never make up customer quotes, interview findings, market sizes, competitor prices, win rates, or
   company names. If a number is needed and we don't have it, say so and say where to find it.
3. An analogy is not evidence. Where a claim about this project rests on a resemblance to NuAnchor or
   Unifi, check which direction it came from. The material available about those two products is far
   deeper than the material available about retail hiring, so a resemblance noticed now is more likely to
   come from what was at hand than from the problem. See the withdrawn claim in D-008.
4. Nothing in the 00-context folder is evidence about hiring. Six of the seven sources are about
   retail buying. The seventh is about aviation. Something can be solidly proven about NuAnchor and
   still tell us nothing about hiring. The last column of the table below tracks that difference.

---

## Verified: NuAnchor and the platform

| ID | Claim | Where from | Useful for hiring? |
|---|---|---|---|
| E-001 | NuAisle is an app store at apps.nuplay.ai. NuAnchor is one app on it | Release note, 3 Aug 2026 | Only as structure |
| E-002 | NuAnchor does retail buying: sales file in, order size worked out, priced across factories with shipping and import taxes, draft purchase order out for approval | All seven sources agree | No. Nothing in common with hiring |
| E-003 | Three agent steps, and each one passes the next a structured result rather than loose text | Screenshot image7, text inside the app | Yes, as an architecture idea |
| E-004 | The agent's thinking appears as a labelled log with four kinds of entry: AGENT, INSIGHT, YOU, EXECUTED | Screenshots image3 and image7 | Yes, as a design idea |
| E-005 | A person must approve. The agent cannot place an order itself | Screenshot image4 shows "awaiting your approval", plus image7 and demo script scene 6 | Yes, and it matters more in hiring because hiring is regulated |
| E-006 | The audit record holds: who approved, exact timestamp, quantity, cost, a snapshot of the reasoning, and where it was sent next | Screenshot image7 | Yes as a pattern. The contents for hiring would be completely different |
| E-007 | Change one assumption and every number downstream recalculates in one pass | Screenshot image7, demo script scene 5 | Yes, as a pattern |
| E-008 | The triage screen: 355 items reviewed overnight, 271 handled automatically, 84 needing a human, grouped into 3 named actions. Each group shows its own money at risk, a plain-language reason, the biggest items listed out, and three buttons: accept all, reject all, or go through them one by one | Screenshot image8 | Yes. This is the single most useful idea in the whole pack |
| E-009 | In the product, the suppliers are in Vietnam and **India**. Saigon Performance Mills 4,326 units at $267,347, Madras Knitwear Co. 1,854 units at $122,568. The demo narration says Vietnam and **China**, so the recording contradicts the app | Screenshot image4 for the product, full transcript for the narration | No. Recorded because the recording and the product disagree, which is a sales risk |
| E-010 | The demo data is made up, and the app says so on screen | Screenshot image7, footer text | No, but the honesty is worth copying |
| E-011 | You can also just ask the agent a question in words, not only click preset buttons | Screenshot image8 has an "Ask the agent" button, image7 shows a typed question | Yes, as a pattern |
| E-012 | There are no direct connections to other business systems. Everything moves by spreadsheet file | Team deck, slide 7 | Useful as a precedent for what shipping early looks like |

## Verified: about this project

| ID | Claim | Where from |
|---|---|---|
| E-013 | Fountain already shipped Cue in April 2026 and Anna before it. AI agents doing frontline hiring is the incumbent's current product, not a new idea | CLAUDE.md, stated by Suniras |
| E-014 | We do not yet have anyone lined up to interview in Phase 1 or Phase 3 | Suniras, 8 Aug 2026 |
| E-015 | The NuAnchor demo is a style reference, not a blueprint for v1 | Suniras, 8 Aug 2026. See D-002 in DECISIONS.md |
| E-045 | **Workday owns Paradox. $1.1 billion, $1.0 billion of it in cash.** Definitive agreement announced 21 Aug 2025; completion announced 1 Oct 2025; Workday's 10-Q for the quarter ended 31 Oct 2025 gives the accounting acquisition date as September 2025 and discloses the consideration. Goodwill is $781M of a $1,063M allocation, against $253M of identifiable intangibles, and Workday held a $20M equity interest beforehand. **Corrected 25 Aug 2026: the press releases disclosed no price, the SEC filing does.** | VERIFIED | Workday Form 10-Q, Note 7 Business Combinations, sec.gov/Archives/edgar/data/1327811/000132781125000198/wday-20251031.htm |
| E-046 | Paradox's own Workday page still describes the relationship as a partnership, with no acquisition language, nearly a year after the deal | [paradox.ai/partners/workday](https://www.paradox.ai/partners/workday), fetched and read. This is why the technical teardown misread ownership as partnership |
| E-047 | Workday's release credits Paradox with cutting Chipotle time-to-hire by 75%, from 12 days to 4, and claims more than 189 million AI-assisted candidate conversations | Workday newsroom, as above. **Vendor claims inside an acquisition announcement, so assumption not verified.** Separate research reported Chipotle turnover rose in 2025. Both need checking and together they test the time-to-hire versus tenure finding |

## Verified: from the live product screenshots, 9 Aug 2026

Six screenshots of the running workspace supplied by Suniras. This is the strongest evidence tier
available, because it is the product rather than anyone's description of it.

| ID | Claim | What shows it |
|---|---|---|
| E-056 | The product states, per step, what the agent owns and what the human decides. On the demand step: "AGENT OWNS: sensing and fusing demand signals into a directional range. YOU DECIDE: whether this product is worth a buy" | Hybrid Training Jacket screen |
| E-057 | Six personas exist, not two: Priya (merchandise planner), Maya, Sam, Dana, Dev (VP ops and sourcing), Lena. Switching re-scopes the navigation to that role's workspaces | Persona switcher on both home screens |
| E-058 | All personas read one shared calculation. Priya's and Dev's home screens carry identical figures: 84 decisions needing a planner, 1 sign-off pending, 26 styles rising, 14 below MOQ, and the same two agent-handled actions with the same timestamps | Both home screens side by side |
| E-048 | Work surfaces differ sharply by role. Priya has nine. Dev has two, Control Tower and Tariff Watch | Left navigation on both |
| E-049 | Autonomy is bounded by named hard limits, not a confidence threshold: "Limits you set: allowed factories, budget, minimum orders. The agents can't cross them" | Product how-it-works page |
| E-050 | Tariff Watch and Learning Loop are dedicated work surfaces. So tariffs and the improvement loop are prominent in the product, even though the demo narration mentioned neither | Priya's navigation |
| E-051 | The learning loop mechanism is specified: every style scored against actual once the season closes, misses shown rather than hidden, corrections carried into the next buy | Product how-it-works page, stage four |
| E-052 | There is an approval chain between personas. The buy sheet has a button reading "Submit 108 lines to Maya" | Buy Sheet screen |
| E-053 | The product page says "getting data in: a spreadsheet today, your systems next." So the product is honest that it is file-based, and the demo narration's claim about sitting on existing ERP systems was wrong | Product how-it-works page |
| E-054 | Reasoning drills down through a "Why" expander showing the underlying signals: "search +84%/6wk, social 3.2x, sell-through 92%" | Hybrid Training Jacket screen |
| E-055 | The app has changed since the sales pack was made. Demand for the same style now reads about 6,800 units with a range of 5,900 to 7,700, against 7,480 with a range of 6,500 to 8,500 in the pack | Compare the screen against demo script scene 3 |

**One observation to check rather than a finding.** The sample CSV has three columns: sku, product, and
**demand_point**. The row for Hybrid Training Jacket reads 7480, which is exactly the demand figure the
pack says the agent produces from that file. So in the demo the demand number appears to arrive in the
input rather than be derived from it. That may be intentional for a sample file, and the app does say the
season is synthetic. Worth knowing before anyone claims the demo derives demand live. Not logged as a
contradiction because I cannot see the code.

## Verified: what the demo recording actually says

Full transcript supplied 9 Aug 2026. It is a shorter and looser version of the written eight-scene
script, and the differences matter more than the overlaps.

| ID | Claim | Where from |
|---|---|---|
| E-039 | A second persona screen exists for a sourcing role called Dev. The presenter calls it a "control tower," showing where inventory is currently bought from and allowing decisions to be changed in real time | Transcript. This moves the second dashboard from assumption to verified |
| E-040 | The presenter names **Walmart and Target** as having this problem, alongside smaller brands, in the opening seconds. Both decks list Walmart under "not built for" | Transcript, opening line |
| E-041 | The presenter says the agents "sit on the existing client ERP systems." The team deck says "Direct ERP connections, not yet. CSV today" | Transcript, versus team deck slide 7 |
| E-042 | The recording never mentions the human approval gate. The written script makes it scene 6 and calls the gate "the spine" | Transcript, versus demo script scene 6 |
| E-043 | The recording never mentions tariffs, import duties or landed cost. The written script calls the tariff lever "the most differentiated fifteen seconds we have," and the whole wedge in the release note and both decks is duty exposure priced at order time | Transcript, versus release note and both decks |
| E-044 | The three outcomes the presenter claims are better gross margins, lower markdown rates and lower working capital. These match the decks | Transcript |

---

## Assumptions we are carrying

Each one has a way to check it. An assumption without a test is just a guess.

| ID | Claim | Why it isn't verified | How to check |
|---|---|---|---|
| A-002 | "Same numbers, any persona" means one calculation feeds several role-specific views | The app says it, but no source shows two views side by side | Ask engineering whether the views read from one shared result. See Q-006 |
| A-003 | Customers can set how much the agent decides alone | Claimed in the demo script. No settings screen appears anywhere | Find the settings screen. See Q-005 |
| A-004 | Clicking any number shows you where it came from | Both decks lead with this. Never captured in any screenshot | Click a number in the live app |
| A-005 | NuAnchor gets more accurate each season by comparing its forecast against what actually sold | The team deck calls this its main argument, but shows no mechanism | Ask engineering whether this is built or planned. See Q-011 |
| A-006 | Enterprise competitors cost around $175K a year and take 12 to 24 months to set up | These are third-party estimates, and the deck's own footnote says so | Not ours to verify. Never present it as a price quoted by the vendor. If a customer gives their own quote, use theirs |
| A-007 | $1.73 trillion lost yearly to stockouts and overstocks. 81% still plan in spreadsheets. US clothing import duties nearly doubled in 2025 | Third-party research, correctly credited in the deck (IHL 2025, AbcSupplyChain 2025) | These are about retail buying. They tell us nothing about hiring. Recorded here only so nobody reuses them by accident |
| A-008 | Customers gain 2 to 5 points of profit margin, cut discounted stock by 30%, and free up 6 to 12% of cash tied up in inventory each year | Industry benchmark ranges. The deck itself labels them "directional impact, not a guaranteed result" | Same as A-007. Not hiring evidence |

---

## Verified: the Unifi hiring build

The 47-file delivery archive found on 9 Aug 2026 moved most of this out of "unknown." These are the
strongest hiring-relevant facts in the whole project. Sources are files inside
00-context/unifi/Unifi - Abrightlabs 10.40.18/.

| ID | Claim | Where from |
|---|---|---|
| E-016 | The customer is Unifi Service: ground handling and aviation services, 42,000 to 45,000 employees, about $1.2B revenue, described as North America's largest aviation services provider | Internal handoff document |
| E-017 | The contract is with TalentOS, a recruitment company spun out of Unifi that intends to resell the solution. Unifi, ERMC and Prospect are covered by it | Statement of work V4, titled "TalentOS AI Voice" |
| E-018 | The volume is roughly 30,000 offers a year, 600 to 800 job types, 200+ airport stations, and the top 20 stations account for about 50% of recruiting | Internal notes |
| E-019 | The delivered scope is narrow: three behavioural questions on safety, reliability and teamwork, 90 seconds each. The outcome is Pass or In-Review only. The agent never rejects anyone | Call script, scope and solution document |
| E-020 | Judgement is deliberately kept out of the AI. Hard eligibility questions are yes/no rules from the client's procedures. Open answers are matched against a client-supplied phrase bank, highlighted green for positive and red for negative, and shown to a human. A human makes every final call on flagged candidates | Note on AI Voice Agent for Recruiting, Appendix A |
| E-021 | The applicant tracking system is Avature, two instances. Telephony is Twilio. There is a second entry route as embedded JavaScript on a web page | Statement of work, scope document, project plan |
| E-022 | Capacity is 20 concurrent calls, expandable to 50 for seasonal peaks | Statement of work, and the April 2025 proposal |
| E-023 | The agreed latency service level is 99th percentile within 5 seconds. Availability 99.9%+. Involuntary disconnects under 0.01%. P0 incidents get a 4-hour response, 24/7 | Statement of work, Project Governance |
| E-024 | Planned delivery was 12 to 14 weeks. The real plan ran Sept 2025 to a go-live readiness window of 26 to 30 Jan 2026, so about 19 weeks, and it slipped because the client had not supplied requirements | Proposal, project plan, scope document |
| E-025 | Data retention is 180 days by default in the contract, configurable per state law. Encryption TLS 1.2+ and AES-256. No client data used to train other models | Statement of work, acceptance criteria |
| E-026 | A named lawyer produced a US compliance memo on 3 June 2025 covering TCPA, the FCC's 2024 AI-voice ruling, FTC Act section 5, Illinois BIPA, Texas voiceprint consent, California and Colorado bias rules, Title VII, ADA, ADEA, and Mobley v. Workday on vendor liability | Legal memo, Stephanie Johnson |
| E-027 | Nurix committed in writing to: system cards, a risk management policy, quarterly model reviews, four-year retention of prompts and scoring logic, a public statement on its website, and notifying the client and the state within 90 days of finding a discriminatory effect | Note on AI Voice Agent for Recruiting |
| E-028 | Nurix mapped NYC Local Law 144, California FEHA automated-decision rules, and Colorado SB 24-205 clause by clause against its own approach | Unifi Nurix AI Compliance spreadsheet |
| E-029 | The team considered not going live in New York at all because of Local Law 144 | Internal notes: "Might not go-live with New York region" |
| E-030 | The buyer required the agent to handle American English dialects including AAVE, Cajun and Appalachian, interpret double negatives, accept slang and eggcorns, and explicitly must not treat standard business English as a sign of professionalism or job readiness, nor judge candidates on professionalism, intelligence or communication style | Statement of work, English Language and Dialect Considerations |
| E-031 | English only at launch. Spanish is a contractual future right, not a delivered feature | Statement of work, Language Availability |
| E-032 | The agent escalates when the request falls outside procedures, the candidate asks for a human, the language is not English, or intent is unclear within 30 seconds | Statement of work, Call Management |
| E-033 | The improvement loop is manual and monthly. The client supplies expanded keyword and phrase lists, recruiters flag where they disagree with the AI, and Nurix applies the changes. There is no automatic model retraining | Statement of work, Learning Loop |
| E-034 | The buyer ran a vendor evaluation of roughly 90 questions covering architecture, auditability, bias, security, IP, monitoring, integration, privacy, analytics, access control, candidate experience, commercials, scale and guardrails | AI Hiring Solution Vendor Review Checklist |
| E-035 | The deal was won on relationship, not product. The sales handover records the reason as "the agility we have shown / multiple discussions / follow up and the most important, we have an internal champion (Srini)" | Internal handoff |
| E-036 | The client's own existing phone script is far broader than what was built. It covers pay rate, duties, benefits, interview confirmation, two forms of ID, six yes/no eligibility questions, email verification and rescheduling, with branching responses over many pages | Unifi Pre-Interview Phone Script, shared by client |
| E-037 | Nurix advised against the web-link route on quality grounds ("internet connection, browser compatibility, permissions") and it was included in the scope anyway | Internal notes |
| E-038 | The client's own tester logged real agent failures during testing: inconsistent handling of "I don't remember applying," long silences where the agent waited without saying so, cutting the candidate off mid-answer, registering "hmm" as an answer, and quoting a one-month callback time the client considered too long | Project plan, Agent Feedback tab |

## Assumptions and contradictions inside the Unifi archive

The archive disagrees with itself in several places. None of these is resolved.

| ID | The disagreement | Why it matters |
|---|---|---|
| A-009 | The vendor checklist states flatly "we are ISO 27001, SOC 2 Type II, and GDPR compliant." The statement of work says only "aligned to SOC 2 Type II or ISO 27001." The compliance spreadsheet's internal notes say ISO 42001 would be needed and is not held | Three different strengths of claim about the same certifications. A buyer's security team will ask for the certificate, not the claim |
| A-010 | Data retention is 90 days in the vendor checklist and 180 days in the statement of work | One of them is wrong in a document a customer has read |
| A-011 | Uptime is 99.5%+ in the checklist and 99.9%+ in the statement of work | Same problem |
| A-012 | The checklist answers "EEOC is not applicable" to a compliance question. Nurix's own legal memo says vendors face liability under federal anti-discrimination law and cites Mobley v. Workday as the case testing exactly that | The legal memo contradicts the sales answer. This is the most serious inconsistency in the archive |
| A-013 | The checklist says the voice agent "supports multi-language calls." The statement of work says English only, with Spanish as a future right | Overclaim in a document given to a buyer |
| A-014 | Asked whether interfaces meet WCAG 2.1 accessibility standards, the answer is "not applicable, as the primary interaction is voice-based" | Sidesteps the question. A voice-only process is itself the accessibility problem, and in US hiring that is an ADA matter |
| A-015 | Asked about adverse impact analysis, the answer is "not directly." Asked about tracking diversity metrics, "not applicable, we don't have access to DEI data" | The one measurement US regulators actually care about is the one not offered. Whether that is the right split of responsibility with the client is a real question, not an obvious answer |
| A-021 | A level exists between store manager and central TA, split into a district manager who owns payroll goals across 15 to 20 stores and a field HR business partner who runs hourly hiring across a group of stores | Search summaries and job-description aggregators. Several primary fetches failed. Job postings describe intent rather than practice | Read careers pages and 10-K filings of three or four named mid-market US retailers directly. See 04-segmentation/field-structure.md and Q-027 |
| A-016 | The checklist claims deployments "scaled up to 2M calls/month" and that the platform handles 100,000+ candidates a month "easily." The Unifi contract provisions 20 concurrent calls, 50 at peak | Not strictly contradictory, but the delivered configuration is nowhere near the claimed ceiling. If asked to evidence the 2M figure, we cannot do it from this archive |

## Contradictions between the demo recording and the written material

Separate from the Unifi archive contradictions. These are all inside the NuAnchor pack.

| ID | The disagreement | Why it matters |
|---|---|---|
| A-017 | Recording says the suppliers are Vietnam and China. The app shows Vietnam and India | A prospect who watches the video and then runs the demo sees two different answers |
| A-018 | Recording names Walmart and Target as having this problem. Both decks name Walmart as a company not to sell to | This is not a slip of one word. It is the opening framing of the whole demo, and it points at the segment this hiring project targets. See Q-002 |
| A-019 | Recording says the agents sit on existing client ERP systems. The team deck says there are no direct ERP connections and everything moves by spreadsheet today | An integration claim made out loud that the product does not support. The most likely of these four to cause a problem in a real sale |
| A-020 | The recording omits the human approval gate entirely, and omits tariffs entirely | The written script treats both as essential: the gate as the trust argument, tariffs as the differentiator. A demo that drops both is selling a generic forecasting tool |

## Still unknown about Unifi

| ID | Question | Status |
|---|---|---|
| U-001 | Did it actually go live, and when? | The last dated file is Nov 2025 and go-live readiness was planned for 26 to 30 Jan 2026. The case study slide says "In Progress." See Q-013 |
| U-002 | Where does "70,000+ annual hires" come from? | The internal notes say 30,000 offers a year. The two numbers are not reconciled anywhere. See Q-015 |
| U-003 | What is the baseline behind "20% time reduction" and "500+ hours a month"? | Neither appears in the delivery archive at all. See Q-016 |
| U-004 | What does "100% regulatory compliance" mean? | Now partly answerable. The archive shows a real compliance framework for NYC, California and Colorado. But the compliance spreadsheet's own internal notes admit gaps, so "100%" is not supportable as written. See Q-017 |
| U-005 | What are the commercial terms? | Referenced as Appendix A of the statement of work. Not verified. See Q-008 |

**The four numbers on the case study slide still cannot be used.** The archive explains how the system
works and what it had to comply with. It does not contain the measurements the slide claims.

---

## Second-hand claims from colleagues, 25 Aug 2026

Everything in this section comes from one call on 25 Aug 2026 where Nishant relayed his conversations with
Anuj Jain and Joy, plus Nishant's own written notes of the Joy conversation. Sources are in
03-discovery/raw/internal/. The inventory and the conflicts are in
03-discovery/synthesis/internal-inputs-2026-08-25.md.

**Read the distinction in this table carefully, because it is the one this section exists to protect.** A
transcript proves that somebody said a thing. It does not prove the thing. So "verified" in the last column
below means only that the words are on the record and attributed correctly. Where the column says
**assumption**, the content itself is unchecked, and it is unchecked at two hops: the person who would know
said it to Anuj or Joy, who said it to Nishant, who said it to us.

**Neither Anuj nor Joy is a practitioner.** They are colleagues who have read the market and, in Joy's case,
used this class of software. Nothing here counts toward the Q-001 gate of five people outside Nurix, and that
count is still zero.

### Claims about the hiring problem

| ID | Claim | Who said it | Status |
|---|---|---|---|
| E-059 | Frontline candidates fall into two groups: young people looking for part-time or gig work, and workers aged 40 plus and 50 plus. Both lack specialised skills | Anuj via Nishant | Assumption. Checkable against BLS age-by-industry data |
| E-060 | Candidates apply to many employers at once and do not wait to hear back from one. They do not care whether it is a Walmart, a department store or a liquor store | Anuj via Nishant | Assumption |
| E-061 | The store manager already works long days, and screening by phone, chat, text and email is a high cognitive load problem. **The hours drift across retellings**: eight to ten in the transcript, ten to twelve from Suniras later in the same call, twelve to fourteen from Suniras on 26 Aug | Anuj via Nishant | Assumption. Do not quote a precise number. The claim that survives is that hiring is an extra task on an already full day, which is the point |
| E-062 | **By the time the store manager gets through screening, the candidate is often already gone.** "By the time they figure out a lot of times they already lost the candidate" | Anuj via Nishant | Assumption. The single most useful claim in the dump, because it is a mechanism rather than a symptom, and it is the claim our tier 1 argument depends on |
| E-063 | 40 days is a good enough benchmark for the current hiring cycle. Five to seven days is theoretically closeable. Faster than that gets "tricky and riskier" | Nishant, relaying Anuj | Assumption, but it converges with iCIMS at 40 going to 42 days and SHRM in the high thirties to low forties. Not an independent fourth data point, because he may have read the same reports |
| E-064 | The US job-to-application ratio is not usually very high, unlike India, the Middle East and Southeast Asia | Joy via Nishant | Assumption, and it **conflicts** with the screening-volume premise our own work is built on. Q-035 |
| E-065 | The cost of processing one application is low relative to the commission earned | Joy via Nishant | Assumption |
| E-070 | Years of experience carries high weight in retail as a seniority signal. Frequent job changes matter less | Joy via Nishant | Assumption. Relevant to step 6 scoring if true |
| E-071 | Candidate reputation from past placements, meaning attendance, punctuality and conduct, carries very high weight in medical and nursing. Debatable for cashier work | Joy via Nishant | Assumption. Q-034 |

### Claims about the market and the money

| ID | Claim | Who said it | Status |
|---|---|---|---|
| E-066 | Placement commission runs 4 to 8% of annual pay. The Indian agency standard is one month of salary, roughly 8%. The same percentage is a much larger dollar figure in the US | Joy via Nishant | Assumption. Q-030 |
| E-067 | Some vendors charge nothing for the hiring software and make their margin as the employee insurance provider, because insurance margin is larger and recurring. That bundle is what lets others charge 14 to 15% commission. Zenefits and Gusto named | Joy via Nishant | Assumption. Both named companies are real payroll and benefits platforms and Zenefits was acquired, so neither is a live standalone comparable without checking. Q-030 |
| E-068 | The US job board market is organised and LinkedIn dominant. Europe is fragmented, with 80 to 90% of sourcing through job boards, down to niche sites like barberjobs.com. A retailer will not subscribe to three or four boards | Joy via Nishant | Assumption. Note it argues against its own conclusion for us: if the US is organised, the aggregation problem is a European one |
| E-069 | Some players claim a 72 hour close. The mechanism is a pre-sourced talent pool that can return a top five the moment a job description lands, not faster software | Joy via Nishant | Assumption, and **Joy labelled it himself** as his thesis with no proof point. **Not attributable to Paradox.** Nishant floated Paradox as the source and said in the same breath "no proof point". Paradox's strongest published number is Chipotle at four days, which is 96 hours. There is no source in this project for "Paradox does 72 hours" |

### On the record about our own people and process

These four are verified in the narrow sense that the words are on the record and attributed correctly. What
they describe is a state of affairs inside Nurix, so there is no second hop.

| ID | Claim | Source | Status |
|---|---|---|---|
| E-072 | **Nishant has not reviewed Anuj's PRD himself.** "I have not run any cloud code session of myself into baselining that, you can experiment" | 25 Aug transcript | Verified as said. It means everything in 02-landscape/anuj-prd-assessment.md is new information to him |
| E-073 | **Nishant has no practitioner connections of his own.** "Folks around me are a bit limited over here." On sitting next to Joy and Anuj: "black hole, I don't know why." He offered to carry specific questions | 25 Aug transcript | Verified as said. Confirms the internal route to Q-001 is exhausted |
| E-074 | Nishant's demo standard: synthetic data with real computation, so changing an input changes the output, and simulated connectors with the space for a real one left visible. "Greenhouse access capability exists to simulate" | 25 Aug transcript | Verified as his stated standard. Recorded as D-025 |
| E-075 | Anuj was in the USA a couple of months before 25 Aug 2026 meeting clients and internal team members, and the PRD came out of those meetings | 25 Aug transcript | Verified that Nishant said it. **The meetings themselves are unverified and undocumented**, which is Q-036 |

### Claims from this call that we should not repeat

Not given evidence IDs on purpose, because an ID makes a claim easier to cite. All four are written up in
Q-040 and in the synthesis document.

| The claim | Why not |
|---|---|
| Greenhouse is a candidate-side aggregator holding resumes you can search | Greenhouse is an applicant tracking system sold to employers. It does not hold an open candidate pool other employers browse. A competitive map built on this reading is wrong about both what the product is and who buys it |
| Any recruiter can get LinkedIn API access, for posting jobs and for reading applications | LinkedIn's recruiting and job posting interfaces are partner-gated as far as we know. Needs checking before anything is planned on it, because this is the supply for the whole skill-graph freshness idea |
| "Vline AI" is a startup in contingent hiring | No such company. Nishant's own notes say **Beeline**, which is a long-established vendor management system company, not an AI startup. The name reached the summary through a transcription error. Also in the notes and missing from both retellings: **Simplify VMS** |
| Anuj's PRD covers the hiring cycle through to close | Our read of all sixteen documents is that it ends at offer acceptance. Per D-003 the documents win over a recollection. Q-038 |

---

## Verified from primary sources, 26 Aug 2026

A twelve-agent verification run, every finding taken through an adversarial pass instructed to refute rather
than confirm, under a rule that a law firm blog is not primary for a rule of law and a vendor's claim about its
own results is never verified. 133 claims survived, 19 were killed, 45 of the survivors were narrowed. Written
up in 01-diagnosis/verification-2026-08-26.md.

**These are the first genuinely verified primary-source facts this project has on rehire mechanics, and they
were checked because a product decision rests on them.**

### The law on rehire

| ID | Claim | Source | Tier |
|---|---|---|---|
| E-076 | An employer may rely on a former employee's existing Form I-9 instead of completing a new one **only if the rehire happens within three years of the date the original Form I-9 was first executed.** Not the original hire date, not the rehire date | 8 CFR 274a.2(c)(1)(i), confirmed word for word against the GPO official CFR text and Cornell LII | Verified, primary |
| E-077 | A rehire more than three years after the original Form I-9 was completed **requires a complete new Form I-9** | Form I-9 Instructions, edition 01/20/25, page 5, "Rehires" | Verified, primary |
| E-078 | Using the shortcut is optional. An employer may always complete a new Form I-9 instead. The field is **Supplement B**, not the old Section 3 | USCIS Handbook for Employers M-274, section 6.2 | Verified, primary |
| E-079 | USCIS's own materials are internally inconsistent at exactly three years. The form instructions say a new I-9 is needed "more than three years after". M-274 6.2 says employees rehired "three years after" must complete a new one | Both sources, read side by side | Verified, primary. A validation rule has to pick a side |
| E-080 | The I-9 **retention** rule is three years after hire or one year after employment ends, whichever is later. So for a short-tenure worker the old form may lawfully have been destroyed while the rehire window is still open | 8 CFR 274a.2, and our own 01-diagnosis/compliance-steps-explained.md | Verified, primary. The shortcut can be available in law and impossible in practice |
| E-081 | Relying on the previous Form I-9 through Supplement B means **no new E-Verify case**. But reaching that branch needs three conditions at once: inside three years of the original I-9's execution, **and** a case was created from that I-9, **and** it returned employment authorized | E-Verify User Manual, section 2.1.2 Rehires | Verified, primary. Whether the shortcut applies depends on the customer's own E-Verify adoption history |
| E-082 | Where a case is required on rehire the deadline is the **third business day after the employee starts work for pay**. No rehire-specific deadline exists anywhere in the Manual | E-Verify User Manual, sections 1.5, 2.2, 2.2.1 | Verified, primary. Applying the new-hire deadline to a rehire is an inference, though a well-founded one |
| E-083 | Duplicate E-Verify cases are permitted, and rehire is the Manual's own example of when to create one. A 365-day duplicate alert fires and open duplicates must be closed first | E-Verify User Manual, sections 2.3 and 2.5 | Verified, primary |
| E-084 | Under the FAR E-Verify clause a federal contractor is **forbidden** to re-run an employee already confirmed as work-authorized who is continuing in employment | E-Verify Supplemental Guide for Federal Contractors, sections 2.2 and 3.3 | Verified, primary. Runs opposite to the general rule |

### The law on reusing a background check

| ID | Claim | Source | Tier |
|---|---|---|---|
| E-085 | **FCRA imposes no shelf life on a delivered consumer report.** Section 605 limits how old the adverse information inside a report may be, generally seven years, not how long a report in hand may be relied upon | 15 U.S.C. 1681c(a); FTC 2011 staff report searched in full for staleness and report age | Verified, primary |
| E-086 | **FCRA does not require a fresh disclosure and authorisation for each report.** A blanket authorisation is valid, bounded to the application process and the consumer's tenure of employment | FTC Advisory Opinion to James, 5 August 1998; FTC staff report "40 Years of Experience with the FCRA" (2011) p.51 | Verified, primary. **This corrects a claim Claude made on 26 Aug that a prior check is very unlikely to be reusable** |
| E-087 | The FTC never said a blanket authorisation ends at separation and set no outer limit, so a former employee's old authorisation sits in legally untested space | FTC 2011 staff report, read for the boundary | Verified as an absence. The most consequential unresolved point in the rehire design |
| E-088 | **Massachusetts closes it outright.** A CORI Acknowledgement Form is valid one year or until employment ends, whichever comes first, so a former employee's authorisation has necessarily lapsed by rehire | 803 CMR 2.11, Massachusetts DCJIS regulations | Verified, primary |
| E-089 | California's ICRAA frames authorisation in the singular, for "the procurement of the report", with no counterpart to the FTC's blanket-authorisation reading. Evergreen consent is untested in California | California Civil Code 1786.16 | Verified, primary |
| E-090 | **A fresh check can lawfully return less than an older one did.** California caps the lookback for investigative consumer reports at seven years from disposition, release or parole, measured to the report date | California Civil Code 1786.18(a)(7) | Verified, primary. Inverts the intuition that newer means more complete |
| E-091 | FCRA sets **no waiting period** between the pre-adverse-action notice and the action. The only official number is an FTC staff advisory calling five business days reasonable while noting the statute is silent. The three-business-day count in the statute belongs solely to the transportation and DOT carve-out | 15 U.S.C. 1681b(b)(3)(B); FTC Advisory Opinion to Weisberg, 27 June 1997 | Verified, primary. **Confirms our own compliance-steps-explained.md was already correct** |
| E-092 | No published US **retailer** rehire background-check policy could be found. The only concrete shelf lives located anywhere are university policies: 31 days separation at Florida State, twelve months at Brandeis, one year at Kansas State | Searched; three university policies read directly | Verified as an absence. The operative rule is employer policy, so it is a configuration field |

### How big the rehire population actually is

| ID | Claim | Source | Tier |
|---|---|---|---|
| E-093 | **Recall hires were 8.9% of US retail (NAICS 44-45) hires in 2024** and 8.5% in 2023, with a series from 2015. Retail sits **below** all private industry at 12.7%, construction 14.8%, transportation and warehousing 11.3%, health care 10.9%, manufacturing 10.6% and accommodation and food 9.8% | US Census Quarterly Workforce Indicators | Verified, primary. The best measurement this project has |
| E-094 | **Retail recall does not spike in Q4.** No seasonal concentration appears in the QWI series | US Census QWI | Verified, primary. **Kills the seasonal-returner hypothesis Claude built on 26 Aug** |
| E-095 | QWI recall is a **lower bound**, seeing returns only within four quarters. Fujita and Moscarini put QWI recall at about 17% of all hires against roughly 40% of completed jobless spells ending in a return in survey data. How much of that gap applies to retail is unknown | Fujita and Moscarini, recall-unemployment literature | Verified, and explicitly a bound rather than a value |
| E-096 | In a US retail chain, rehires were **4% of manager-trainee placements**, 1,318 of 30,714, and 5.9% measured against outside-sourced hires only | Arnold et al., Journal of Management, 2021 | Verified, peer-reviewed, one chain, manager-trainee population |
| E-097 | **In the same chain rehires turned over MORE than either comparison group: 36.6% against 33.5% external and 20.9% internal.** On par in year one, improving less over time. Only the voluntary-exit subset outperformed in year one | Arnold et al., 2021 | Verified, peer-reviewed. **Kills any attempt to sell rehire as a quality play** |
| E-098 | Mean time away between leaving and rehire in that chain was **1.77 years**, SD 1.86, n=1,317. The centre of the distribution sits inside the three-year I-9 window. No percentiles are published, so the share above three years cannot be computed | Arnold et al., 2021 | Verified. The one finding that supports the design |
| E-099 | Macy's head of talent stated that **33% of recent hires for the 2024 holiday season were former colleagues returning**, and that Macy's converted 15% of 2023 seasonal hires to regular roles | Named Macy's executive, press | Assumption. First-party but an executive statement rather than audited data, one retailer, one season. Suggests very large variation between retailers |
| E-100 | Boomerangs were 15.9% of external hires in the analysis sample at a Fortune 500 **health care** company, mean 2.81 years away, and **outperformed** new hires | Keller et al., Academy of Management Journal, 2021 | Verified, peer-reviewed. Not transferable: different sector, and QWI shows health care running above retail on recall |

### Job board distribution and API access

| ID | Claim | Source | Tier |
|---|---|---|---|
| E-101 | **LinkedIn's Job Posting API is closed to new partners.** New applicants are redirected to Apply Connect. Only three consumer-scoped permissions are self-serve for any developer: profile, email, w_member_social. Every Talent Solutions program needs explicit LinkedIn approval and LinkedIn does not commit to granting it | LinkedIn developer and partner documentation | Verified, first-party. **Refutes the claim relayed on 25 Aug that any recruiter can access LinkedIn APIs** |
| E-102 | Reading applications into a product and scoring them against job criteria through Apply Connect requires **the customer** to hold a paid LinkedIn Recruiter Corporate or Recruiter Professional Services licence | LinkedIn Apply Connect documentation | Verified, first-party |
| E-103 | A free XML feed route for Basic Jobs exists, but **LinkedIn explicitly refuses to guarantee ingestion**, there is no external test environment, and feed-ingested Basic Jobs get materially worse distribution than paid Job Slots | LinkedIn feed documentation and FAQ | Verified, first-party. Cannot be sold as reliable delivery |
| E-104 | **Fountain posts jobs out to Indeed natively**: "Job listings you create or update in Fountain are automatically sent to Indeed.com". It also receives applications through Indeed Apply | Fountain's own Indeed product page | Verified, first-party about their own product |
| E-105 | **Neither incumbent owns multi-board distribution. Both buy it.** Fountain's integrations page lists Programmatic Job Advertising supplied by **Recruitics and VONQ**. Paradox's "thousands of job boards" claim is explicitly attributed to programmatic advertising, not a native layer | Fountain integrations page; Paradox product pages | Verified, first-party |
| E-106 | **Indeed claims over 350 ATS integrations globally**, so Indeed distribution is close to universal among applicant tracking systems | Indeed ATS integration page | Verified, first-party. Makes it table stakes |
| E-107 | Every major destination is gated. Indeed needs a signed Developer Agreement through a formal partner channel plus an issued API token, and reserves the right to exclude jobs failing quality rules, so transmission is not visibility | Indeed partner documentation | Verified, first-party |
| E-108 | **Indeed is retiring single-source job feeds: organic delivery ended 31 March 2026, sponsored delivery ends by the end of 2026.** From June 2025 it also stopped letting agencies maintain single-source feeds for employers whose ATS is already integrated | Indeed customer notice, late 2025; trade coverage June 2025 | Verified for the Indeed notice, assumption for the agency change which rests on trade coverage. **Anybody costing a feed-based Indeed integration today is costing infrastructure that is already half retired** |

### The Paradox cycle-time numbers, settled

| ID | Claim | Source | Tier |
|---|---|---|---|
| E-109 | **Paradox's published headline is an average time to hire of three and a half days, which is 84 hours.** Stated in Workday's newsroom on 8 January 2026 and in the 21 August 2025 acquisition release | Workday Newsroom | Assumption by rule 1, because it is the acquirer's claim about its own product. But it is the benchmark to beat and it is on the record |
| E-110 | **The Chipotle figure is 12 days to 4 days on an application-to-start-date basis**, confirmed independently by Workday's customer story and by Paradox's own case study, which phrases the endpoint as "apron on". Application completion rose 50% to 85% and applications doubled | Workday customer story; Paradox.ai case study | Assumption by rule 1, but the **endpoint question is now closed** and 4 days is 96 hours |
| E-111 | **Chipotle's own release is weaker than the vendor's.** It states the 75% figure as a forward-looking expectation rather than a measured result and never defines the endpoints | Chipotle Newsroom, 22 October 2024 | Verified as to what the release says. The customer was more cautious than the vendor |
| E-112 | The "75% reduction" headline is arithmetically inconsistent with the 12-to-4-day figure attached to it, because 12 to 4 is a 66.7% reduction. A literal 75% cut from 12 days is 3 days, exactly 72 hours | Arithmetic on published figures | Verified arithmetic. A plausible but unprovable origin for the circulating 72-hour number |

### Added to the list of numbers that must not be used

| The number | Why not |
|---|---|
| **"Paradox does 72 hours"** | No source. A thorough search of Paradox's case studies, blog, product pages and infographics, Workday's newsroom, investor and acquisition releases and blog, and Chipotle's own newsroom found no 72-hour time-to-hire or time-to-fill figure anywhere. Paradox's published average is 84 hours and its flagship case is 96 hours. Two plausible origins for the number exist and neither is provable: back-computing the inconsistent 75% headline, and a "72" that appears in the same Workday release as an **application completion rate percentage** |
| **19% of grocery hires are returning workers**, and the related 21% and 24% | Ceridian/Dayforce vendor blog, 850,000 records volunteered by its own clients through an optional feature, no sampling frame, no years attached to any statistic. **Claude used this on 26 Aug. Withdrawn.** The primary figure is 8.9%, E-093 |
| **33% of retail new hires are boomerangs** | Originates on a careers blog crediting unlinked "Harvard Business Review data". HBR's actual figure is Visier's all-industry 27 to 29%, from a proprietary database with no industry split |
| **35% of new hires are boomerangs** (ADP) | Real and correctly quoted, but ADP defines a boomerang as any payroll reactivation with no maximum gap, and **has published no retail figure**. Not comparable to QWI recall |
| **Nearly 20% of workers who quit have returned** | A UKG opinion survey of about 2,000 people across six countries. Self-reported, not a share of hires, not US-specific, not retail |
| **11.8% Spirit Halloween seasonal return rate** | Revelio Labs, derived from online profiles with no stated sample, years or method |
| **72-hour turnaround from staffing vendors**, if quoted as a time to hire | A.Team's 72 hours delivers a shortlist of two to three matched people from a pre-vetted pool, not a filled role. Masis Staffing's 72-hour clock **starts at candidate selection**. Neither is a hire from a cold requisition, so neither is comparable to a time-to-hire figure |
