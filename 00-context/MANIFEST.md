# What is in this folder

Last updated 9 Aug 2026. Two separate bodies of material, 54 files in total.

Read this before you quote anything from here.

**The NuAisle pack, six files.** All about **retail buying**, meaning deciding how much stock to order
for next season and from which factory. Nothing to do with hiring. It is useful for how Nurix builds,
packages and sells a product, and for what the platform can do. Do not lift a statistic out of it and
put it in a hiring document.

**The Unifi material, 48 files.** One case study slide plus a 47-file delivery archive that arrived on
9 Aug 2026. This is about hiring, in the US, at frontline volume, with real regulation attached. It is
the most valuable material in this repo for this project.

Neither body of material is direct evidence about **retail** hiring, which is what this project is
about. Aviation ground handling is structurally different: it hires centrally for airport stations,
while retail hiring is run by store managers across a thousand or more locations. Keep that difference
in view every time you borrow something from the Unifi work.

---

## nuaisle-v0.0: the NuAnchor sales pack

Six files, dated 31 July to 3 August 2026. Nishant Yadav is named as the owner throughout.
Questions from customers were meant to go to a Slack channel called #nustack.

### 1. Release note (docx, 3 Aug 2026)

An internal announcement, about 600 words, no pictures. It tells the company that NuAnchor is now
live.

**Useful for:** the fact that NuAisle is an app store at apps.nuplay.ai. Also the three demo web
pages, what the sales pack contains, which customers to approach and which to avoid, and two ready
made sentences a salesperson could email someone.

**Not in it:** any detail about how the product works, any technical information, any numbers.

**Only place you will find:** the definition of NuAisle as an app store, and the demo password.

### 2. Team deck (pdf, 7 slides)

The internal version. This is the one that explains how to beat competitors.

**Useful for:** the three-part product explanation, market statistics with their sources named,
the claimed customer benefits, estimated competitor prices, a comparison table against o9, Blue
Yonder, smaller tools and spreadsheets, who to approach and who to avoid, and three named companies
to try first (Knitwell, Kohler, Jomashop).

**Not in it:** anything about setup, security, or connecting to other systems.

**Worth copying:** its own footnotes admit that the competitor prices are third-party estimates and
that the benefit ranges are "directional, not a guaranteed result." That honesty is the standard
this project should meet.

### 3. Client deck (pdf, 7 slides)

The same story, rewritten to be safe to show a customer. Competitor prices are gone. The three
target companies are gone. Competitor names are replaced with category labels.

**Useful for:** seeing exactly which claims survived the cut from internal to external. The
difference between deck 2 and deck 3 is effectively the list of things approved for customers to
see. It also names example companies it is built for (Vuori, Yeti, Huckberry, Spanx, Knitwell) and
examples it is not (FreshDirect, Kroger, Walmart, Lowe's).

### 4a. Demo script (html, 689KB, 8 screenshots)

A single web page with tabs. The richest source in the pack, and the one to read first.

**Useful for:** the exact words to say in all eight scenes with timings, every click, every number,
how to set up before recording, a plain-English explanation for someone new to retail, a glossary of
customer vocabulary, a 60-second short version, a table of phrases to use and phrases to avoid, four
likely objections with answers, and what to do if the demo breaks on camera.

**Not in it:** nothing much. This is the primary source.

### 4b. Demo walkthrough (docx)

The same script as a document. The text repeats file 4a, but it has **eight screenshots embedded**
that are the only way to see the actual product without a login.

The useful ones:

- image3: the activity log where the agent explains its thinking
- image4: the draft purchase order with real supplier names and the split between them
- image7: the whole live demo page after approval, including the audit line
- image8: the workspace, showing a planner's morning queue of decisions

### 5. Demo video (mp4, 3 minutes 40, 37MB)

The recorded walkthrough.

**I cannot read this file.** The machine has no video tool installed. Instead I am working from the
exact words in file 4a, the screenshots in file 4b, and a written summary Suniras provided.

**Things the video shows that no document mentions:** a second dashboard for a sourcing person, a
tagline that matches neither deck, and a reference to Walmart that contradicts what both decks say
in writing.

---

## unifi: one slide

One image, Nurix branded, slide 9 of some larger deck we do not have. This is the only source about
hiring that exists anywhere in this project. It is badged "Case Study, In Progress."

**What it says:** a $1B+ aviation ground services company, more than 70,000 hires a year, four
numbers (3 to 5 minute screening calls, 70,000+ hires, 20% time reduction, 100% regulatory
compliance) and one quote from an unnamed "Business Lead" about freeing up 500+ hours a month.

**What is missing, which is most of it:** the company name, the country, which rules the compliance
claim refers to, the starting numbers behind either percentage, the date, and which parts of hiring
were actually covered. Its headline says Nurix automated the entire hiring process. Its own customer
quote says Nurix automated the first stage of screening. Those are two different products.

---

## Files that are mentioned but missing

Worth chasing before assuming they don't matter.

| File | Mentioned in | Why it matters |
|---|---|---|
| pitch-kit.md | Release note, team deck footer | Described as "the detail," so probably the most thorough document that exists |
| deck.html | Team deck footer | The original web version of the client deck |
| The original Unifi deck | The slide is page 9 of something | Would answer nearly every missing Unifi fact |
| The demo workspace | Every source | Password protected. I have no access. Suniras does |

---

## When sources disagree

Believe them in this order: screenshots first, then the demo script and walkthrough, then the two
decks, then the release note, then Suniras's video summary last.

The video summary comes last because it is a description of the recording rather than the recording
itself. This rule has already been used once. It settled which countries the suppliers were in. See
E-009 in EVIDENCE.md.

---

# Added 9 Aug 2026: the Unifi delivery archive

Location: unifi/Unifi - Abrightlabs 10.40.18/

47 files from the US delivery team who actually built the Unifi voice agent. Dated April 2025 to
November 2025. This changes the evidence picture completely. Before this arrived, the only hiring
source in the whole project was one slide.

**This is now the most valuable material in the repo for this project**, because unlike the NuAnchor
pack it is about hiring, in the US, at frontline volume, with real regulation attached.

## Legal and compliance, which is the part that matters most

- **Legal Memo, Voice AI Agents in Recruitment.** Written by Stephanie Johnson, 3 June 2025. Covers
  the TCPA and the FCC's 2024 ruling that AI voices count as artificial calls needing consent, FTC
  Act section 5, Illinois BIPA and Texas voiceprint consent, California and Colorado bias audit
  rules, Title VII, ADA and ADEA discrimination exposure, and Mobley v. Workday as the case testing
  whether a vendor can be liable. Penalties cited at $500 to $1,500 per TCPA violation.
- **Unifi: Note on AI Voice Agent for Recruiting.** Nurix's written compliance commitments. System
  cards, a risk management policy, quarterly model reviews, four-year retention of prompts and
  scoring logic, a public statement on the website, and notifying the client and the state within 90
  days of finding any discriminatory effect. Appendix A explains the call logic.
- **Unifi Nurix AI Compliance.xlsx.** A clause-by-clause map of NYC Local Law 144, California FEHA
  rules on automated decision systems, and Colorado SB 24-205, against what Nurix will do. The
  internal-notes column records real doubts, including that ISO 42001 would be needed and is not
  held, and the unanswered question of how discrimination would actually be detected.
- **AI Recruiting Voice Agent Research.** Background research behind the memo.
- **ABC Pre-Interview Phone Script.pdf.** A redacted version of the client script.

## Contracts and scope

- **Nurix_Unifi_SOW_1OCT2025_V4** in two versions, 10 Oct and 3 Nov 2025. Titled "TalentOS AI Voice."
  Contains the service levels, security commitments, division of responsibilities, and the language,
  fairness and reporting requirements. Commercial terms sit in an Appendix A that has not been
  verified.
- **Proposal, 1 April 2025.** The original pitch. Wider than what was built: voice agent plus chat
  agent on website, Messenger and Instagram, resume parsing, onboarding and post-offer engagement.
- **NURIX AI MSA 1.docx.** The master services agreement.
- **Unifi - Nurix Scope & Solution.docx.** The narrowed scope: three questions, Pass or In-Review,
  results pushed to Avature. Also records that the project slipped because the client had not
  supplied requirements.
- **Unifi - Internal handoff.docx.** Sales to delivery handover. Company size, named stakeholders, and
  the reason the deal was won.

## What the product actually does

- **Unifi Call Script - Nurix.docx.** The agent's actual words. Three questions on safety,
  reliability and teamwork, 90 seconds each.
- **Docs Shared by Client / Unifi Pre-Interview Phone Script.pdf.** The client's own existing script,
  and much broader than what Nurix built: pay rate, duties, benefits, interview confirmation, two
  forms of ID, six yes/no eligibility questions, email verification, rescheduling. Branching
  responses over many pages. Useful as the baseline the AI was measured against.
- **Nurix Call Requirements and Questions**, three versions, plus the positive and negative learning
  statements. The phrase bank source material.
- **Unifi Disposition v25-1111.xlsx.** The output format, with a worked example. Every question breaks
  into named sub-measures, each with the candidate's exact words, a decision, and a written reason.
- **Nurix Follow Ups.docx and .pdf.** The SMS and email chase sequence: three attempts, 24 hours
  apart, 48-hour final window.
- **Unifi ATL Job Descriptions.docx** and **Agent - Cabin Cleaner job ad.** The roles being hired for.

## Delivery and quality

- **Project Plan_Unifi.xlsx.** Task-level plan, Sept 2025 to Jan 2026, with owners and status. Also
  an integrations tab showing telephony, Avature and appointments all awaiting credentials. Also an
  **agent feedback tab** containing the client's own tester recording what she said, how the agent
  responded, and how it should have responded. That tab is the single most useful quality artefact in
  the repo.
- **Unifi - Testcases.xlsx** and **Unifi QC.xlsx.** Test cases and quality checks.
- **Unifi Rollout & Go-live Check list plan.xlsx.**
- **Unifi - Transcripts.docx.** Real call transcripts.
- **AI_Hiring_Solution_Vendor_Review_Checklist.xlsx**, in a client version and a Nurix internal
  version. Around 90 questions the buyer asked, with Nurix's answers, covering architecture,
  auditability, bias, security, IP, monitoring, integration, privacy, analytics, access control,
  candidate experience, commercials, scale and guardrails. This is how a real US buyer evaluates an AI
  hiring vendor, which makes it valuable for Phase 2 and Phase 4.

## Integration

- **Avature APIs.docx**, **Add Lead API Spec.pdf**, **Avature-Nurix API Call Flow.vsdx**.
- **FRD_Unifi.xlsx.** Functional requirements.
- **NewCo Hiring-Onboarding.pdf.**

## Knowledge base

- **Unifi Overview Benefits**, **ERMC Overview Benefits**, **Prospect Overview & Benefits.** The
  content the agent answers questions from.

## One thing to be careful about

**Docs Shared by Client / Nurix Test API key - Sandbox.txt** holds a credential. It has not been
opened and its contents are not recorded anywhere in this repo. See Q-014 in OPEN-QUESTIONS.md.
