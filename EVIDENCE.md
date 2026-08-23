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
| E-045 | **Workday owns Paradox.** Announced 21 Aug 2025, expected to close by 31 Oct 2025. Workday did not disclose a price; press reports of about $1 billion are reports, not disclosure | [Workday newsroom, 21 Aug 2025](https://newsroom.workday.com/2025-08-21-Workday-Signs-Definitive-Agreement-to-Acquire-Paradox,-the-AI-Company-Redefining-the-Frontline-Candidate-Experience), fetched and read |
| E-046 | Paradox's own Workday page still describes the relationship as a partnership, with no acquisition language, nearly a year after the deal | [paradox.ai/partners/workday](https://www.paradox.ai/partners/workday), fetched and read. This is why the technical teardown misread ownership as partnership |
| E-047 | Workday's release credits Paradox with cutting Chipotle time-to-hire by 75%, from 12 days to 4, and claims more than 189 million AI-assisted candidate conversations | Workday newsroom, as above. **Vendor claims inside an acquisition announcement, so assumption not verified.** Separate research reported Chipotle turnover rose in 2025. Both need checking and together they test the time-to-hire versus tenure finding |

## Verified: from the live product screenshots, 9 Aug 2026

Six screenshots of the running workspace supplied by Suniras. This is the strongest evidence tier
available, because it is the product rather than anyone's description of it.

| ID | Claim | What shows it |
|---|---|---|
| E-045 | The product states, per step, what the agent owns and what the human decides. On the demand step: "AGENT OWNS: sensing and fusing demand signals into a directional range. YOU DECIDE: whether this product is worth a buy" | Hybrid Training Jacket screen |
| E-046 | Six personas exist, not two: Priya (merchandise planner), Maya, Sam, Dana, Dev (VP ops and sourcing), Lena. Switching re-scopes the navigation to that role's workspaces | Persona switcher on both home screens |
| E-047 | All personas read one shared calculation. Priya's and Dev's home screens carry identical figures: 84 decisions needing a planner, 1 sign-off pending, 26 styles rising, 14 below MOQ, and the same two agent-handled actions with the same timestamps | Both home screens side by side |
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
