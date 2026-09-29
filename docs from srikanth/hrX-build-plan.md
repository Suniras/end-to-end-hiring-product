Build plan · greenfield

# hrX — Requisition to Joining

One platform that opens a role, sources and screens for it, runs two AI interview rounds, prices and issues the offer, keeps the candidate warm until they walk in on day one — and then ramps them to productive work, so you can finally measure whether any of the hiring worked.

**Scope:** 36 modules, 9 phases

**Rough duration:** 45 weeks, 4 engineers

**First usable release:** week 6

**Orchestration:** Temporal, process as data

**Repo state:** empty

**Product shape:** Multi-tenant SaaS

**Voice:** Nurix first-party stack

**Geography:** India now, global later

**Design-partner roles:** High-volume sales, support, ops

## 01 · The one structural call: sequence by risk, not by funnel order

Building in candidate-journey order feels natural and is wrong. It puts the two things that can kill the product — job-board access and whether recruiters trust an AI score — at months four and six, after the money is spent.

Four risks decide whether this works. Only two are engineering problems.

#### Job-board access is contractual, not technical

`Partly de-risked`

LinkedIn job posting and candidate APIs sit behind Talent Solutions partnership. Naukri posting and Resdex need a commercial agreement. Indeed moved to feeds. Scraping is a terms-of-service and legal exposure, not a shortcut.

Selling this as SaaS changes the shape of the problem: **each tenant brings their own board accounts**, and you act on their credentials rather than needing blanket access of your own. That is how established ATSs do it, and it means a customer with a Naukri contract is productive on day one. You still want partner status for the cleaner APIs — it is a growth lever, not a launch blocker.

**Action, week 1**Per-tenant credential vault in the schema from the first migration. Ship email-inbox and XML-feed ingest, which works with every board regardless of API access. Start partner conversations in parallel, off the engineering critical path.

#### Recruiters may not trust the scores

`Product`

If an AI score is a bare number, recruiters re-read every resume and the automation saves nothing. Trust comes from evidence: every score cites the resume line or transcript timestamp it came from, against a rubric a human approved.

**Action, phase 1**Score 200 candidates a recruiter already decided on. Measure agreement before any auto-advance is switched on.

#### Candidates will game AI interviews

`Required`

Reading answers off a second screen, a stronger friend on the call, a cloned voice. This is the most common failure mode of AI interviewing, and it is invisible unless designed against. Confirmed as a hard requirement, not a later hardening pass — an unverified score is not a score.

**Action, phases 2 and 3**Four checks, all four required: identity verification before any assessed conversation begins; liveness; unscripted follow-ups on the candidate's own claims; latency and prosody anomaly flags. Every flag routes to human review — **never an automatic rejection on suspicion alone**.

#### Offer maths is high blast radius, low uncertainty

`Known`

Getting a CTC breakup wrong is a legal and reputational event, but nothing about it is unknown. It needs care and golden-file tests, not research.

**Action, phase 5**Versioned comp plans, resolved values stored alongside the rendered PDF hash, approval chain before any letter renders.

Everything else in the scope is well-understood CRUD, integration plumbing, and orchestration. Which is why phase 0 builds the boring spine and phases 1–4 attack the two product risks while the partnership track runs in the background.

## 02 · The pipeline, and what sits under it

Nine stages. Teal is AI-driven, amber needs a human, grey is a system process. Underneath all of it is one append-only event log — the single design decision that makes audit, analytics, and engagement triggers fall out for free instead of being three more features.

**Requisition & approval** — Hiring mgr

**Post & syndicate** — System

**Source & shortlist** — AI

**Intent call & schedule** — AI voice

**Screening interview** — AI L1

**Deep-dive interview** — AI L2

**Negotiate & offer** — HR

**BGV, medical, docs** — Vendors

**Pre-boarding to day 1** — AI + HR

events → stage_changed call_completed score_recorded doc_verified offer_signed joining_confirmed

A recruiter can advance or reject at any stage, and an override is itself an event with a reason attached — that record is what makes an AI-assisted rejection defensible later. Stages are rows in a tenant's versioned pipeline definition, not branches in code, so a customer who wants two human rounds between L2 and HR is configuration — see section 12. For the v1 volume roles, stages four and five collapse into a single qualify-and-screen call — see phase 2.

**Voice is not the default channel.** The plan as described leans on voice calls for reminders and nudges; in practice WhatsApp and email carry that load far more cheaply and candidates prefer them. Reserve voice for the moments where it genuinely outperforms text: qualifying intent, the two interviews, recovering a candidate who has gone quiet, and the joining-week confirmation.

## 03 · Module map — including twelve things the brief did not mention

The original scope is largely intact and well-sequenced. What was missing is mostly governance, identity, and the unglamorous parts that decide whether the automated funnel is trustworthy and legal. Everything marked `Added` is now committed scope, sized and scheduled in section 11 — the marker records that it was not in the original brief, nothing more.

| Module | Call | Phase | Note |
|----|----|----|----|
| Requisition & job management | `Build` | 0 | Core spine. |
| Requisition approval, headcount & salary band | `Added` | 0 | Not in the brief. Without a band on the requisition, the offer engine in phase 5 has nothing to validate against and offers go out ungoverned. |
| Multi-platform posting & syndication | `Build` | 1 | Adapter per board behind one canonical job schema. Access is the risk, not the code. |
| Career site & hosted apply form | `Added` | 1 | Not in the brief but required — it is the one application channel fully under your control, and where form-fill assistance and document upload actually live. |
| Candidate aggregation & identity resolution | `Build` | 1 | The same person arrives from LinkedIn, Naukri and a referral. De-duplication is what makes "one platform" true rather than aspirational. |
| Resume parsing & JD rubric generation | `Build` | 1 | LLM extraction into a structured schema. No dedicated parser vendor needed. |
| AI shortlisting with cited evidence | `Build` | 1 | Rubric-scored, every claim cited, rubric version stored with the score so it reproduces. |
| Sourcing & talent-pool rediscovery | `Build` | 1 | Search your own past applicants first — cheapest source of hire and it needs no partnership. |
| Employee referrals | `Added` | 1 | Not in the brief. Highest conversion source in most orgs; a submit form and attribution is a few days of work. |
| Agency & vendor submissions | `Added` | 2 | Not in the brief. Agencies are a real inbound channel and fee attribution needs a submission record. v1 is a tagged email address per agency riding the inbox ingest — no portal until one is asked for. |
| Engagement — WhatsApp, email, SMS, voice | `Build` | 2 | One outbox behind one template store. Voice is one channel among four, not the default. |
| AI voice intent qualification | `Build` | 2 | Short call, structured output: interested, notice period, current and expected comp, competing offers, location. |
| Interview scheduling & no-show recovery | `Build` | 2 | Harder than it looks: panel availability, timezones, reschedules, no-shows. Sync calendars, do not build one. |
| L1 AI screening interview | `Build` | 3 | Fixed rubric, short, high volume, cost-capped per call. |
| Identity verification & interview integrity | `Added` | 2 & 3 | Not in the brief, confirmed as required. Impersonation and answer-assistance are the standard failure mode of AI interviews; without this the L1 and L2 scores are worthless. **Identity lands in P2, not P3** — the merged qualify-and-screen call is the first scored conversation, so it cannot be the unverified one. |
| L2 AI deep-dive interview | `Build` | 4 | Questions generated per resume and per JD, human-approved question bank per role, unscripted probes on the candidate's own claims. |
| AI video interview stage | `Build` | 4 | A video medium for the L2 rather than an extra round, on your own WebRTC stack, with proctoring rented as an embeddable SDK. ~10 engineer-weeks; see section 13 for the scheduling choice. |
| Human interview stage & scorecards | `Added` | 4 | Not in the brief, which goes AI L2 straight to HR. Most orgs will still want one human technical round; make it a first-class stage type rather than a later retrofit. |
| Recruiter dashboard & decision surface | `Build` | 0 | Ships in phase 0 with manual data. Gets richer every phase. |
| Offer negotiation log | `Build` | 5 | Every number offered and countered, timestamped and attributed. This is the audit trail HR will need. |
| Comp computation & offer letter generation | `Build` | 5 | Versioned comp plans, not a general formula language. See section 05. |
| Offer approval chain | `Added` | 5 | Not in the brief. A letter must not render before the required approvals exist, and band breaches must escalate. |
| E-signature | `Buy` | 5 | Aadhaar eSign or DocuSign. Never build this. |
| Document collection & verification | `Build` | 6 | DigiLocker, PAN, UAN employment history via vendor APIs. Doctored payslips and Form 16s are common enough to check for explicitly. |
| BGV & medical orchestration | `Buy` | 6 | Vendor adapters behind one interface. Parallel branches, independent status, one blocked branch does not stall the others. |
| Renege-risk scoring & pre-boarding engagement | `Added` | 6 | Not in the brief as a distinct thing. Post-accept drop-off is the single largest cost in Indian hiring; engagement should be driven by a risk score, not a fixed drip schedule. |
| HRIS handoff on joining | `Added` | 6 | Not in the brief. "Until they join" has to end somewhere concrete — an employee record pushed to SuccessFactors, Darwinbox, Keka or Workday. |
| Consent, data retention & AI decision audit | `Added` | 0 & 7 | Not in the brief and not optional. See section 06 — the consent and logging primitives must exist in phase 0 because retrofitting them means reprocessing every record. |
| Pre-joining ramp content | `Build` | 6 | Company and role primer between accept and day one, through the existing outbox. Doubles as the best renege signal you have — a candidate who stops opening ramp content is disengaging earlier than any rule detects. |
| Training tracks & quiz engine | `Build` | 8 | Short mobile-first modules and auto-scored knowledge checks across days 1–90. Content is versioned data, not a course-authoring product. |
| AI practice role-play calls | `Build` | 8 | The L2 scenarios and voice stack reused as ramp practice at day 7 and day 21, scored on the same rubric. Nearly free given everything before it, and hard for anyone without the hiring data to copy. |
| Certification gates | `Build` | 8 | Sign-off before a support agent takes live calls or a seller pitches. Auditable, and the part clients actually pay for. Results push to the HRIS, which stays the record. |
| Ramp-to-hiring outcome loop | `Build` | 8 | Correlate L2 dimension scores against quiz results, practice scores and 30/60/90 retention. The thing that finally validates the AI interview scores. |
| Funnel analytics & unit economics | `Build` | 7 | Free from the event log. Time-to-fill, source effectiveness, cost per screened candidate, AI-human agreement. |
| Multi-tenancy, RBAC, audit log | `Build` | 0 | Row-level security in Postgres, not filtering by convention. Plus a per-tenant credential vault for board accounts, calendars and vendors. |
| Process definition, versioning & pipeline interpreter | `Build` | 0 | The mechanism that makes stage order, owners, thresholds, timers and branch conditions editable data rather than deployed code. See section 12. |
| Tenant onboarding & configuration library | `Added` | 7 | Implied by selling this. A new customer must be productive in a day, which means seeded stage templates, rubrics, comp plans and scenarios — not a blank system. |
| Usage metering & billing rollup | `Added` | 2 | Implied by selling this. Voice minutes and tokens are your cost of goods; meter per tenant from the first call, not after the first surprising invoice. |

Build / buy / defer, phase of first delivery

## 04 · Stack — deliberately boring

One deployable, one database, one worker. Nothing here is chosen for scale you do not have; every piece is chosen because the alternative costs more to operate than it saves.

Shape  
Modular monolith. Python and FastAPI, since that is where the repo already lives. Split a service out only when a specific scaling or team boundary demands it — recruiting volumes do not.

Data  
Postgres for everything: relational core, JSONB for parsed resumes and call payloads, pgvector for resume and JD semantic search, and the append-only event table. No Elasticsearch, no separate vector database, no data warehouse until Postgres measurably hurts.

State  
An `application` row carries current stage; every transition is an `event` row. Analytics, audit, and engagement triggers all read the same log. Never mutate history.

Orchestration  
**Temporal from P0**, running a generic pipeline interpreter rather than one workflow per hiring process. Recruiting is exactly Temporal's shape — multi-week waits, human approvals, parallel BGV and medical branches, retries against flaky vendors. The critical part is *what goes in the workflow code*: almost nothing. See section 12, because the naive version actively defeats the goal of changing the process easily.

Tenancy  
A `tenant_id` on every table, enforced by Postgres row-level security rather than by remembering to filter in every query — the difference between an isolation bug being impossible and being one forgotten `WHERE` clause away. Per-tenant credential vault for board accounts, calendars and vendors. Stage templates, rubrics, comp plans, document checklists and letter templates are all tenant-scoped data seeded from a shared library, never code.

Voice  
Nurix's own stack, behind an adapter you keep anyway. First-party is the right call here: you own latency and per-minute cost, and you can get raw audio with per-turn timing — which is what makes the integrity signals in phase 3 cheap instead of a separate product. The caveat is that an internal stack tuned for other call types may not handle a twenty-minute interview with long candidate turns, heavy barge-in and thoughtful silences; that is a phase-0 spike, not an assumption.

Models  
Reasoning-heavy work — rubric generation, resume-to-JD scoring, transcript evaluation, question generation — goes to a frontier model. Extraction and classification go to a cheap fast one. Cache the JD-derived rubric per requisition; it is generated once and reused across every candidate.

Integrations  
Every job board, BGV vendor, and calendar sits behind a typed connector interface with idempotency keys on every inbound record. Adding the tenth board should be a config file and a mapper, not a project.

Locale seam  
India only for now, so build no second jurisdiction — but leave one seam, not an abstraction layer. A `jurisdiction` field on tenant, requisition, comp plan, document checklist, consent record and retention policy, with statutory comp components and verification vendors as rows rather than Python. Country two then means inserting data and writing one vendor adapter.

Cost control  
Voice minutes and tokens are the unit economics of this product, and as SaaS they are also the thing you bill for or eat. Meter from day one: cost attributed to each candidate in the event log, per-call and per-requisition caps, hard stop on runaway calls, and a per-tenant rollup that exists before the first paying customer rather than after the first surprising invoice. A fifteen-minute L2 interview is real money at volume.

## 05 · Two design calls worth arguing about now

Both are places where the obvious implementation is more expensive and less defensible than the simple one.

#### The comp engine is not a formula language

SuccessFactors-style computation suggests building an expression evaluator. Skip it. A comp plan is an *ordered list of components*, where each component is a fixed amount, a percentage of a named earlier component, or a slab lookup — which is exactly what PF, gratuity, ESI, and state professional tax are. That covers essentially every Indian CTC breakup, including variable pay, joining bonus with clawback, and ESOP grants, with no parser and no sandbox.

What matters instead: comp plans are **versioned**; a generated offer stores its plan version, its inputs, every resolved output, and the hash of the rendered PDF. Golden-file tests per plan. Add a real expression evaluator the day a client needs something the component model genuinely cannot express — not before.

#### Auto-advance freely, auto-reject almost never

The goal is to cut recruiter headcount, and the instinct is to let the AI reject. Resist it for two reasons: a wrong rejection is invisible — you never learn about the candidate you lost — and an unreviewed automated rejection is exactly what AI hiring regulation is written about.

So: let strong candidates advance automatically, and route rejections to a single screen where a recruiter clears fifty at a time with reasons pre-filled. That keeps a human accountable for every negative decision while costing seconds per candidate rather than minutes. Revisit only once you have measured agreement between AI and recruiter decisions on a real audit set, per role family — and even then, keep sampled human review running.

**Integrity flags are bound by this rule absolutely, with no threshold that ever relaxes it.** A suspected impersonation or answer-assistance signal goes to a person with the audio attached, and only a person decides. Accusing an honest candidate of cheating is a worse and less recoverable outcome than letting a dishonest one through to the next round, where the unscripted probes will catch them anyway.

## 06 · Compliance is a phase-0 dependency, not a phase-7 cleanup

Most of this list needs primitives in the schema from the first migration. Adding consent records and decision logs later means reprocessing every candidate you have already touched, and possibly deleting data you cannot lawfully hold.

#### Automated hiring decisions

`Design in P0`

Depending on where you hire, AI-assisted screening can trigger bias-audit and candidate-notice duties, and in the EU recruitment sits in the high-risk category with documentation and human-oversight obligations. All of them assume you can produce, per decision, the inputs, the rubric version, the model, and the human who reviewed it.

**Primitive needed**An immutable decision record on every score and every stage transition.

#### Call recording & consent

`Design in P0`

Recording an interview needs disclosed, recorded consent at the start of the call, and biometric-style voice processing has its own rules in several jurisdictions. Outbound calling in India also brings registration and calling-window constraints.

**Primitive needed**Per-candidate, per-purpose consent rows with timestamp and channel; call-window rules in the dialer.

#### Personal data & retention

`Design in P0`

India's DPDP framework, plus GDPR if you ever process EEA candidates, means purpose limitation, retention limits, and working deletion and export — across resumes, call recordings, transcripts, and verification documents.

**Primitive needed**Retention policy per data class, and a deletion path that actually reaches object storage and transcripts.

#### Verification & document handling

`Phase 6`

BGV requires candidate authorization before it starts. Aadhaar and government-ID handling has specific storage and masking rules. Verification documents are the most sensitive data in the system.

**Primitive needed**Separate encrypted store, field-level masking, access logged per view.

None of this requires a compliance team in month one. It requires four things in the first schema: a consent table, an immutable decision log, a data-class retention field, and access logging. Everything else can follow.

## 07 · Phases

Every phase ends with something real recruiters use on a real requisition. Durations assume four engineers and one recruiter embedded as a design partner; they are planning estimates, not commitments. They include the twelve added modules from section 11, the AI video build inside an extended P4, and the P8 ramp phase — which is how the original scope’s 31 weeks became 45.

| Phase | Ships | Weeks | Risk retired |
|----|----|----|----|
| P0 | Tenant spine, Temporal + pipeline interpreter, governance primitives, dashboard, voice spike | 6 | Replaces spreadsheets immediately |
| P1 | Career site, sourcing, parsing, coarse AI pre-filter | 5 | Score trust, board access |
| P2 | Engagement, qualify-and-screen call, identity, scheduling | 5 | Voice reliability, no-show cost |
| P3 | Scored L1, full integrity suite | 3 | Gaming and impersonation |
| P4 | L2 role-play deep dive, AI video build, human stage | 7 | Depth of assessment |
| P5 | Comp engine, approval chain, offer & e-sign | 6 | Money correctness |
| P6 | Docs, BGV, medical, renege risk, joining, HRIS | 5 | Post-accept drop-off |
| P7 | Analytics, bias audit, tenant onboarding, hardening | 4 | Provable ROI, defensibility |
| P8 | Ramp training, quizzes, practice calls, outcome loop | 4 | Early attrition, and score validation |

Sequence overview

**P0 — 6 weeks**

### The tenant spine

- Tenant model with row-level security, RBAC, audit log, credential vault. Consent table, retention policy per data class, jurisdiction field.
- Requisitions with approval, headcount and salary band. Candidates, applications, stage templates as tenant-scoped data.
- Append-only event log — the spine everything else reads from.
- **Temporal, plus the pipeline interpreter and the versioned process definition** (section 12). Even though P0's own flow is trivial, the interpreter has to come first: every stage transition built on top of it is a transition you would otherwise rewrite. Temporal Cloud versus self-hosted decided here.
- Recruiter dashboard: pipeline by stage, candidate view, advance or reject with reason.
- Ingest by CSV and manual entry. Resume files into object storage.
- **Voice-stack spike:** one twenty-minute call on the Nurix stack, end to end. Confirm outbound dialling in India with the DLT and calling-window rules, barge-in behaviour on long candidate turns, recording and consent hooks, per-turn timing in the transcript, structured extraction at the end, and measured cost per minute. WebRTC is confirmed present, so also run one long browser session over ordinary Indian consumer bandwidth — that sizes the video work in section 13. This is the input to every voice and video estimate that follows.
- Off the engineering critical path: partner conversations with the boards, and a first design-partner customer for the sales-and-support hiring pipeline.

**Gate** One real requisition runs end to end on manual data and the recruiter prefers it to their spreadsheet. The voice spike either confirms the internal stack fits interview-shaped calls, or tells you now — not in phase 2 — what has to change.

**P1 — 5 weeks**

### Sourcing and pre-filtering

**Re-weighted for volume non-technical roles.** For sales, support and ops hiring, a resume is a weak signal — the differentiators are language fluency, shift and location willingness, notice period, and genuine interest, none of which a CV tells you reliably. So resume scoring here is a *coarse pre-filter* that removes the clearly unqualified, not the decision gate. The real filter moves to the phone in P2. Do not overbuild this phase.

- Career site with hosted job pages, tenant-branded, and an apply form that pre-fills from an uploaded resume — this is the form-fill assistance from the brief, and it belongs here.
- Resume parsing to a structured schema. Identity resolution and de-duplication across sources — at volume this matters more than the scoring does.
- JD to rubric: hard filters (location, languages, shift, notice, minimum experience) separated from graded criteria. Generated once, edited and approved by a human, versioned.
- Candidate scoring against the approved rubric, every claim cited to a resume line. Ranked queue with one-click bulk reject.
- Ingest paths: email inbox parsing and XML feeds first (works everywhere), per-tenant platform credentials as each board clears.
- Talent-pool search over past applicants — for high-attrition volume roles this is the highest-yield source you have. Referral submission.

**Gate** On 200 candidates a recruiter already decided, measure agreement between rubric score and recruiter decision. Publish the number. Expect it to be modest for these roles — that is the finding, and it is what justifies moving the real assessment to the call.

**P2 — 5 weeks**

### Engagement and the qualify-and-screen call

**One call, not two.** The brief has a separate intent-qualification call and then an L1 screening interview. For volume sales, support and ops roles that is two dials, two chances to not pick up, and twice the cost to learn things one five-to-eight minute conversation establishes. Merge them: qualify intent and screen in the same call, and branch to scheduling at the end only if it went well. Keep them separable in the stage template for the tenant who wants two.

- One outbox across WhatsApp, email and SMS, versioned templates, per-candidate quiet hours, tenant sender identity. WhatsApp carries the reminder load; voice is reserved for the moments it earns.
- The merged call, structured output: interest, notice period, current and expected comp, competing offers, location and shift willingness, plus a first read on spoken language fluency — which for these roles is a core requirement, not a soft one.
- **Identity verification before the call's assessed portion begins.** Merging the intent call and L1 means this call is the first scored conversation, so it cannot be the unverified one — identity moves here from P3, and the anomaly detection that grades it follows in P3. Delivered as a vendor link over WhatsApp or SMS ahead of the call, not inside it, and reused later for P6 document verification.
- Calendar sync for interviewer availability. Scheduling, rescheduling, confirmation and reminder sequences.
- No-show detection and recovery. Unreachable-number, wrong-number and bad-data handling — at volume this is a large fraction of your list and it needs to be a designed path, not an exception.
- Cost metering per call, per requisition and per tenant, with hard caps — the meter that the invoice will eventually read from.
- Agency submissions the cheap way: a tagged email address per agency, landing through the P1 inbox ingest with attribution from the tag. No portal until an agency asks for one.

**Gate** Median time from application to first contact under thirty minutes. Connect rate, completion rate and cost per completed call measured and acceptable. No-show rate below the manual baseline.

**P3 — 3 weeks**

### Scored L1 and integrity

P2 already built the call. This phase turns it into a defensible assessment, and the integrity suite is the bulk of the work.

- Fixed-rubric scoring on the P2 call: transcript with per-turn timestamps, scored per dimension with cited evidence, recruiter-visible next to the audio.
- Language and accent handling for your real candidate mix — for pan-India volume hiring that means regional languages and code-switching as a requirement, not an edge case. Explicit fluency scoring where the role needs it.
- **Interview integrity, all four checks — the non-negotiable part of this phase.** Identity verification already lands in P2; here it gains liveness, unscripted follow-ups that probe the candidate's own stated claims, speaker verification against the voice on the earlier call, and anomaly flags built on the per-turn timing the first-party voice stack gives you: response-latency spikes that indicate reading from a screen, prosody discontinuity, a second voice on the line.
- Every integrity flag routes to a human review queue with the flagged audio segment attached. **No integrity signal, alone or combined, ever triggers an automatic rejection** — a false accusation of cheating is a worse outcome than a missed one, and the flag is evidence for a person, not a verdict.
- Fallback to text or async when the line is unusable — at volume, a meaningful share of calls will be.

**Gate** A recruiter reads the scorecard and reaches the same conclusion as listening to the call — sample and verify weekly, forever. Separately: seeded impersonation attempts on your own test calls are actually caught, and the flag rate on genuine candidates is low enough that the review queue is workable.

**P4 — 7 weeks**

### L2 deep dive

**For these roles, L2 is a role-play, not a Q&A.** This is where a voice-first product beats every text-based ATS on the market and where the design-partner choice pays off: the assessment *is* a phone conversation, so an AI on the phone is testing the actual job rather than a proxy for it. A support hire handles a simulated irate customer; a sales hire pitches and gets objected to; an ops hire works a situational-judgement scenario. Scored on the dimensions the job runs on — objection handling, de-escalation, clarity, process adherence — not on recalled facts.

- Per-candidate scenario and question selection from resume and JD, drawn from a human-approved bank per role, with unscripted probes on the candidate's own claims.
- Role-play scenarios as tenant-authored, versioned content, with per-dimension rubrics. This is the asset a customer will not want to leave behind.
- **Video as an alternative medium for the L2**, vendor-delivered behind your own stage adapter, selected per role family in the pipeline definition — not an extra round. Voice fallback on the same rubric is mandatory. Transcript, scores and media land in your storage. Section 13 has the build-versus-buy argument and the switch triggers.
- Dimension-level scoring with cited evidence, and a comparison view across candidates on the same requisition.
- Human interview stage as a first-class stage type: panel assignment, structured scorecard, same event log. Some tenants will insist on it regardless of L2 quality. The video link comes from the calendar event P2 already creates — the tenant's own Meet, Teams or Zoom, no video platform to integrate.
- Recruiter-visible score history and the full decision trail per candidate.

**Gate** Hiring managers accept L2 output as sufficient basis to move to HR without re-interviewing. The validation that really counts — whether L2 scores predict on-the-job performance — arrives in P8, which is what makes that phase worth more than it first appears.

**P5 — 6 weeks**

### Offer

- Versioned comp plans: ordered components, fixed or percentage-of or slab lookup. Statutory components — PF, gratuity, ESI, state professional tax — as first-class slabs.
- For the v1 roles specifically: incentive and commission structures, shift allowances, and target-linked variable pay. Simpler than an engineering CTC in absolute terms, but the variable side carries more of the total, so it needs its own components rather than a footnote in the letter.
- Band validation against the requisition, approval chain enforced before any letter renders, escalation on breach.
- Negotiation log — every number offered and countered, timestamped and attributed.
- Letter templating with resolved values, PDF generation, stored hash, e-signature integration.
- Golden-file tests per comp plan. This is the money path; it gets real tests.

**Gate** Finance reconciles ten generated letters against their own model with zero discrepancies.

**P6 — 5 weeks**

### Accept to joining

- Document checklist per role and location, upload with completeness and tamper checks, verification via DigiLocker, PAN and UAN employment history.
- BGV and medical as parallel branches behind vendor adapters — independent status, one blocked branch does not stall the rest.
- The hardest orchestration in the product — parallel branches, multi-week waits, human approvals, flaky vendor retries — but no new engine work, because Temporal and the interpreter landed in P0. This phase is where that decision pays for itself.
- Renege-risk score driving engagement intensity, not a fixed drip. Voice check-ins at the moments that matter.
- Joining confirmation and HRIS handoff — the point at which a candidate becomes an employee record elsewhere.

**Gate** Joining rate on offers accepted through the platform beats the manual baseline.

**P7 — 4 weeks**

### Proof and hardening

- Funnel analytics from the event log: time-to-fill, stage conversion, source effectiveness, cost per hire, recruiter productivity.
- AI-human agreement tracking per role family, over time, as a standing report.
- Adverse-impact analysis across the funnel and a documented bias-audit process.
- Per-tenant usage and cost rollup, and the onboarding library that makes a new customer productive on day one rather than facing a blank system.
- Load, failure and recovery testing on the voice and integration paths. Security review of the document store, and the security questionnaire answers enterprise buyers will ask for.

**Gate** You can state, with numbers, how much recruiter time per hire the platform removed.

**P8 — 4 weeks**

### Ramp, training and the outcome loop

The first phase that is not required for the core promise — everything through P7 already delivers requisition to joining. This is additive, which makes it the natural thing to ship after a v1 launch rather than before one. Section 14 is why it is worth building regardless.

- Training tracks as versioned content in the pipeline definition: short mobile-first modules across days 1–90, delivered through the P2 outbox. WhatsApp is the channel — these hires have phones, not desks.
- Quiz engine: auto-scored knowledge checks, retryable, unproctored. This is learning, not assessment; do not drag the P3 integrity machinery into it.
- AI practice role-play calls at day 7 and day 21, reusing the L2 scenarios, the voice stack and the same rubric — so ramp progress is measured on the same dimensions you hired against.
- Certification gates where the role needs one: product or compliance sign-off before an agent takes live calls, pitch certification before a seller carries a target. Results push to the HRIS.
- Manager view — ramp progress, quiz scores and practice scores per new hire, with whoever is falling behind surfaced rather than buried.
- The outcome loop: L2 dimension scores against quiz results, practice scores and 30/60/90 retention.

**Gate** You can answer, with data, whether your AI interview scores predict who is still there at ninety days. Every earlier claim in this plan about assessment quality rests on that number.

## 08 · Not building

Each of these is a product in its own right. Every one has a named replacement — a decision not to build something is incomplete until you can say what fills the hole.

| Not building | Instead |
|----|----|
| Own proctoring stack | An embeddable proctoring SDK, with the cheap integrity signals built in-house. The AI video interview itself runs on your own WebRTC stack — section 13. |
| Own calendar | Google Calendar and Microsoft Graph sync, built in P2. |
| Own e-signature | Aadhaar eSign or DocuSign behind an adapter, P5. |
| Own speech models | The Nurix first-party voice stack. |
| Own BGV or medical operations | Vendor adapters, P6. You orchestrate and hold the record; they do the field work. |
| Own identity verification | An Indian identity-verification vendor — document capture, face match, passive liveness — behind the same adapter pattern. |
| Own SSO | OIDC against whatever the tenant already runs. |
| Resume-parser vendor | LLM extraction into a structured schema, P1. Cheaper and more adaptable than the incumbents. |
| Visual workflow designer | The versioned pipeline definition, edited as ordinary forms. Section 12 — same power, none of the canvas. |
| Chatbot builder UI | Versioned message templates in the P2 outbox. |
| Mobile apps | A responsive career site. On the candidate side WhatsApp already is the app. |
| Data warehouse | Postgres, reading the event log, until it measurably hurts. |
| Separate vector database | pgvector in the same Postgres. |
| Microservices | A modular monolith. |
| A learning management system | Ramp content as versioned data plus a quiz engine, P8 — not SCORM, course authoring, video hosting or a catalogue. Section 14 draws the line. |
| Payroll, HR system of record, L&D past 90 days | The HRIS handoff in P6. Certification results push into it; it stays the record. |

Not building · and what fills the gap

### On video specifically

"Video interviewing" bundles three unrelated requirements. Bought as one platform you pay for all three and fit none of them well.

#### 1. The human interview round → the tenant's own Meet, Teams or Zoom

You are already creating calendar events in P2 to book interviewer time. Both Google Calendar and Microsoft Graph attach a conferencing link as a property of the event you are *already writing* — so the video link is a field, not an integration. Enterprise customers run Workspace or M365 already, will not adopt a second video tool, and their IT will not whitelist one.

What you give up in v1: no recording or transcript of the human round, so it has thinner evidence than your AI rounds. The structured scorecard in P4 covers the decision. **Upgrade trigger:** when hiring managers start asking what the candidate actually said, pull the cloud recording and transcript that Meet, Teams and Zoom all expose, and attach it to the application.

#### 2. Identity and liveness → a verification vendor, as a pre-call step

This is the part people mean by "we need video", and it is a commodity in India — document capture, selfie-to-document face match, passive liveness, from any of several established vendors. You call it, you store pass or fail with confidence and the artifacts.

Crucially it is **not in the call**. Your L1 and L2 are telephony, so identity happens beforehand: a link over WhatsApp or SMS, candidate captures ID and selfie, verification binds to their phone number, and the call is then attributable to a verified person. Better than in-call video anyway — it keeps a verification flow out of a six-minute screening conversation, and it can be reused for the P6 document verification.

#### 3. In-call integrity → voice, not video

Impersonation during the call is caught with what you already have: **speaker verification across calls** — the voice on the L2 call matched against the voice on the L1 call, which is a strong signal for the friend-sits-the-interview case — plus the latency and prosody anomalies from the first-party stack's per-turn timing. No camera required.

Two caveats. A voice print is biometric data, so it needs its own consent purpose and retention rule in the P0 consent table. And speaker verification over Indian telephony audio is not precise enough to be a verdict — it is a flag for the human review queue, which is what section 05 already requires of every integrity signal.

#### 4. The AI video interview → buy it now, build it when the numbers say so

An AI-led video round is in scope by decision, and since the Nurix stack already does WebRTC, it is a build rather than a buy — with proctoring rented as an embeddable SDK. Section 13 has the argument, the vendor criteria, and where the round should sit in the funnel.

#### What stays out regardless: scoring the face

Use the camera for identity, presence and proctoring. Never as an input to the score. Facial and appearance analysis has no credible evidence of predicting job performance, it is an adverse-impact problem with no upside, and it is separately regulated as biometric processing in several jurisdictions you may sell into. **Score what the candidate says, not how they look.**

## 09 · Measuring the actual goal

The stated goal is reducing recruiter headcount. That has to be measurable per phase, or the project will be judged on features shipped instead. Baseline every one of these before P0 ends — you cannot show improvement against a number you never took.

| Metric | Why it matters | From |
|----|----|----|
| Recruiter minutes per screened candidate | The headline number. Everything else is a means to it. | P1 |
| Share of candidates reaching a scored decision with no human touch | Direct measure of automation depth. | P1 |
| Application to first contact, median | Speed is the main reason candidates pick one employer over another. | P2 |
| AI-recruiter decision agreement, per role family | Gates how much you are allowed to automate. Track it permanently, not once. | P1 |
| Cost per screened candidate and per AI interview | Voice minutes and tokens are the unit economics. Watch them from the first call. | P2 |
| Integrity flag rate and confirmed-fraud rate | If this is near zero you are probably not detecting, not clean. | P3 |
| Offer accept rate, renege rate, joining rate | The end of the funnel, and where the largest recoverable losses sit. | P5 |
| Time to fill, and cost per hire | The numbers the business already tracks. Speak in them. | P7 |
| Ramp completion and time to certification | Whether new hires reach productive work, and how fast. Operations managers care about this more than anything upstream of it. | P8 |
| 30 / 60 / 90-day retention | For volume roles this is the real cost centre — an early leaver costs more than a candidate who never joined. | P8 |
| L2 score against 90-day retention | The only honest validation of the whole assessment stack. Everything else is a proxy. | P8 |

Illustrative targets — replace with your own baselines

## 10 · What the four decisions changed

Two of them made the plan easier. One added a week. One reshaped phases 1 through 4 more than anything else in this document.

| Decision | What it changes |
|----|----|
| Multi-tenant SaaS | Adds a week to P0 for tenant isolation via row-level security, a credential vault, and per-tenant cost metering. **Partly de-risks board access** — customers bring their own Naukri and LinkedIn accounts, so partnership becomes a growth lever rather than a launch blocker. Everything configurable becomes tenant-scoped data seeded from a shared library: stage templates, rubrics, comp plans, document checklists, letter templates, role-play scenarios. |
| Nurix first-party voice | Adds a P0 spike — one real twenty-minute call before any voice estimate is trusted. In exchange you get per-turn timing in the transcript, which makes the phase-3 integrity signals nearly free instead of a separate build, plus real control over per-minute cost, which is the unit economics of the whole product. New dependency to manage: an internal platform team's roadmap is now on your critical path. |
| India now, global later | Cheapest of the four. Build no second jurisdiction, leave one seam: a `jurisdiction` field on tenant, requisition, comp plan, document checklist, consent and retention policy, with statutory comp components and verification vendors as rows rather than code. No abstraction layer, no second implementation. |
| High-volume sales, support, ops | The biggest reshape. Resume scoring drops to a coarse pre-filter because a CV barely predicts these roles — so P1 shrinks in ambition. The intent call and L1 merge into one qualify-and-screen call, saving a dial and a week. L2 becomes a scored role-play, which is where a voice-first product genuinely beats every text-based ATS. And the volume means engagement, no-show recovery, and bad-phone-number handling stop being polish and become core paths. |

Decision, and its consequence in the plan

### Still open

#### Is there a first design-partner customer?

Building multi-tenant SaaS without one named customer hiring volume roles right now means guessing at every configuration boundary — and configuration boundaries are the expensive thing to get wrong in SaaS.

**Recommendation** Name one before P1 starts. Nurix's own hiring counts, if the volume is real.

#### Is the voice stack cleared for a separate product, and who operates it?

A first-party dependency is only an advantage if you can get changes made and get paged appropriately. If interview-shaped calls need work on their side, that is someone else's sprint, not yours.

**Recommendation** Settle ownership, support expectations and internal cost-per-minute in week 1, alongside the spike.

#### Billing model — per hire, per seat, or per minute?

Decides what you meter and what you cap. Per-hire pricing means voice overruns eat your margin; per-minute means the customer feels every retry and will ask why you called a dead number four times.

**Recommendation** Decide before P2 ships metering, so the meter matches the invoice.

#### Data residency, and who holds the sensitive documents?

Verification documents are the most sensitive data in the system, and enterprise customers will ask where they live and how they are deleted. The answer shapes the phase-6 document store.

**Recommendation** India region, single encrypted store with field-level masking and per-view access logging. Revisit only if a customer contract demands otherwise.

## 11 · The twelve added modules, scoped

All twelve are in scope. Each is sized here in engineer-weeks, with the version that ships in v1 and the trigger that justifies building the fuller one. Where a gap has an obviously lazier form that covers the real need, that is the v1 build — three of them do.

#### This moves the timeline, and pretending otherwise would be dishonest

These twelve add roughly **21 engineer-weeks**. At four engineers that is about five calendar weeks of perfectly parallel work, but most of it serializes behind its own phase's core build, so in practice it lands as **+7 calendar weeks: 31 becomes 38**. Building the fuller version of every gap instead of the v1 version puts it nearer 42.

The alternative is not a cheaper plan — it is the same plan discovering these in month five, when the schema is set and the retrofit costs more than the build.

| Module | Phase | What ships in v1 | Eng-wk | Build the fuller version when |
|----|----|----|----|----|
| Requisition approval, headcount & band | P0 | Approver list on the requisition, band min / mid / max, posting blocked until approved. Sequential approval only. | 1.5 | Parallel or conditional routing — when a customer's org chart needs it. |
| Consent, retention & AI decision audit | P0 | Consent rows per candidate, purpose and channel. Retention policy per data class with a deletion job that actually reaches object storage and transcripts. Immutable decision log on every score and stage transition. | 3 | A candidate-facing privacy portal for self-serve export and deletion — when a customer's data agreement requires it. |
| Career site & hosted apply form | P1 | Tenant-branded job list, job page, apply form with resume upload and field prefill. Server-rendered, no single-page app. | 3 | Custom domains and full theme control — when a customer objects to sitting on your subdomain. |
| Employee referrals | P1 | A referral form reusing the apply path, plus a referrer field and source attribution on the application. | 0.5 | Bonus tracking and payout status — when finance asks for it. |
| Identity verification & interview integrity | P2 & P3 | Identity check before the assessed portion of the P2 call. Liveness, unscripted claim probes, latency and prosody anomaly flags, human review queue with the flagged audio segment attached. | 4 | Voice-clone detection as a distinct model — when you have a confirmed case, not on speculation. |
| Agency & vendor submissions | P2 | **Lazy version:** a tagged email address per agency. Submissions land through the inbox ingest you already built in P1; attribution comes from the tag. No portal, no logins, no new auth scope. | 0.5 | A real portal — when an agency asks for submission visibility, or duplicate-candidate fee disputes start. |
| Usage metering & billing rollup | P2 | Cost per event in the event log — voice minutes, tokens, vendor calls. Per-call and per-requisition caps. Per-tenant rollup. | 2 | Invoicing integration — when you have paying customers rather than design partners. |
| Human interview stage & scorecards | P4 | A stage type with panel assignment and a structured scorecard, writing to the same event log as the AI stages. | 2 | Interviewer calibration and inter-rater reporting — when panel disagreement becomes a complaint. |
| Offer approval chain | P5 | Required approvals before the letter renders; a band breach escalates a level. Reuses the P0 approval primitive rather than inventing a second one. | 2 | Delegation, out-of-office and time-bound auto-escalation — when approvals start blocking offers. |
| Renege-risk scoring & pre-boarding engagement | P6 | **Rules, not a model:** notice period, competing-offer flag from the P2 call, comp gap against stated expectation, days since last contact. Drives engagement intensity on top of the P2 outbox. | 1.5 | A learned model — only once a few hundred labelled joining outcomes exist. Before that there is nothing to train on. |
| HRIS handoff on joining | P6 | **Lazy version:** a mapped CSV export per target system. Every HRIS on the market imports CSV. | 0.25 | A real API integration per system — when a customer's joining volume makes the manual import genuinely painful. |
| Tenant onboarding & config library | P7 | Stage templates, rubrics, comp plans, document checklists and role-play scenarios seeded from fixtures and cloned on tenant creation. Editing happens in the admin screens that already exist. | 1 | A guided onboarding wizard — when you go self-serve rather than sales-led. |

Committed scope · engineer-weeks are rough

Three of these are deliberately thin — agency submissions, the HRIS handoff, and the onboarding library — and each names the signal that should make you build the real thing. The other nine are built properly the first time, because they are either governance primitives that cannot be retrofitted or the integrity work that makes every score in the system trustworthy.

## 12 · Process as data, orchestrated by Temporal

Temporal is the right engine for this system. But the obvious way to use it — express the hiring process as workflow code — is the one way to guarantee you cannot change the process easily. The requirement and the naive implementation point in opposite directions.

#### Why the naive version defeats the goal

Temporal workflows are durable because they **replay their history deterministically**. That is the whole trick, and it is also the constraint: changing a running workflow's code breaks replay unless you version every edit behind a patch marker, or drain onto a new task queue, or terminate and restart.

Now apply that to recruiting, where a single candidate's workflow runs for **weeks to months**. At any given moment you have thousands of in-flight workflows started under older code. This is the worst case for Temporal versioning — and it means "change a process nuance" would translate to a code edit, a patch marker, a deploy, and a growing thicket of version branches that nobody can delete for a year. The opposite of ease of effort.

#### The version that actually delivers it

**Keep the workflow code thin and effectively frozen; put the process in versioned data.** The Temporal workflow becomes a generic interpreter: read the next step from the pipeline definition, run it as an Activity, record the event, set timers, wait for signals, repeat. It does not know what an interview is.

Everything that counts as a "nuance" then lives in a **pipeline definition** — rows in Postgres, tenant-scoped, versioned, editable in the admin UI. Changing the process is an insert, not a deploy. The workflow code changes perhaps twice a year, which is exactly the rate Temporal's versioning story is designed for.

### What becomes editable data

| Knob | Example change, done as data | Governance |
|----|----|----|
| Stage sequence | Insert a human technical round between L2 and HR for one requisition family. | Open |
| Stage owner | Move document collection from the candidate to an ops user. | Open |
| Stage medium | Deliver the L2 as video instead of voice for client-facing role families — same rubric, one field. See section 13. | Open |
| Branch conditions | Skip L1 when the candidate was referred; add a human round when the offer exceeds band mid. | Open |
| Rubric & rubric version per stage | Point the L1 stage at rubric v4 for new applicants. | Open |
| Voice agent script & persona version | Shorten the qualify-and-screen script; swap the L2 role-play scenario set. | Open |
| Reminder cadence & channel | Two WhatsApp nudges before a voice call instead of one. | Open |
| SLA timers & escalation targets | Escalate to the hiring manager if a stage sits 72 hours. | Open |
| Document checklist per stage | Add a shift-willingness declaration for night-shift support roles. | Open |
| Approval requirements | Require two approvers on offers above a threshold. | Open |
| Auto-advance thresholds | Raise the L1 auto-advance score for a role family. | `Approval` |
| Auto-reject thresholds | Any change at all to automated negative decisions. | `Approval + log` |
| Integrity rules | Any change to identity, liveness or anomaly handling. | `Approval + log` |

Pipeline definition · all tenant-scoped and versioned

The last three are deliberately not free to edit. A dynamic process is a feature; a silently-loosened auto-reject threshold or a quietly-disabled identity check is an incident. Those knobs require approval and write an immutable record of who changed what, from what, to what — the same decision log from P0.

### The rules that keep it working

- **Each application pins the pipeline version it started under.** Editing a definition creates a new version; in-flight candidates continue on theirs. Migrating them to a newer version is an explicit, audited action with a preview of who is affected — never a silent consequence of saving a form. This is the single most important rule in this section.
- **Nothing non-deterministic inside workflow code.** No LLM calls, no database reads, no clock, no randomness. Every one of those is an Activity with its own timeout and retry policy. This is not style — violating it corrupts replay.
- **Activities are idempotent, keyed on the application.** Temporal retries by design, and a retried activity must not send a second WhatsApp message, place a second call, or charge a second vendor request. Workflow ID derived from the application ID also gives you free deduplication against double-starts.
- **Temporal is orchestration, not your database.** Activities write to Postgres; the dashboard, analytics and every read path go to Postgres. Querying Temporal for application state is a trap that couples your product to your scheduler.
- **Child workflow per stage, continue-as-new on the parent.** A months-long hire with reminders, calls and vendor polls will otherwise accumulate an event history that runs into Temporal's limits. Structure for it up front — it is nearly free now and a rewrite later.
- **Human decisions are signals; state is a query.** Recruiter advance or reject, HR approval, candidate offer acceptance — all signals into the running workflow, all also recorded as events in Postgres.

### Cost of the change

**Net neutral on the timeline.** P0 grows from five weeks to six for the Temporal setup and the interpreter, so first usable release moves to week 6. P6 drops from six to five, because the orchestration work that phase was carrying is already built. The rest is a straight win — the reminder and SLA machinery in P2, and the parallel BGV and medical branches in P6, both get materially simpler.

One operational decision to make in P0 alongside the voice spike: **Temporal Cloud or self-hosted.** Self-hosting means running the cluster, its datastore, and its visibility store — real ops burden for a four-engineer team. Cloud is the lazy and probably correct answer; the thing to check first is region availability against your India data-residency answer, since HR data is the sensitive kind and enterprise buyers will ask.

## 13 · The AI video interview

Build the interview, rent the proctoring. But the placement question matters more than the build-versus-buy question, and it has a less obvious answer.

#### First: make it an alternative L2, not a fourth hurdle

Every added round costs completion. After a qualify-and-screen call and a voice deep-dive, a third synchronous round for a support or telesales candidate will visibly cost you completion rate — and these are exactly the candidates with several live processes running who drop the one with the most steps.

So make video a **medium the L2 can be delivered in**, not a level after it. Same rubric, same dimensions, same scoring contract; voice or video chosen per role family in the pipeline definition. Section 12 makes that a single field. Tenants who want video get video, funnel length does not grow, and you can measure whether the video medium actually produces better decisions than the voice one on comparable candidates — which is the question you would otherwise never be able to answer.

If the reason for video is commercial — buyers expect to see it, competitors demo it — that is a legitimate reason and this shape serves it fully. If you genuinely want it as an additional gate for senior or client-facing roles, gate it on the role family rather than applying it to everyone.

### Build or buy

You already own the expensive half, and more of it than first assumed: **the Nurix stack already does WebRTC.** Real-time turn-taking, barge-in, low-latency speech and now browser media transport are all in hand — which removes the genuinely risky part of this build, not just some of the effort. What remains is adding a camera track and video recording to an existing session, playback and transcript alignment, device and network hardening for Indian conditions, and proctoring.

That puts the build at roughly **10 engineer-weeks rather than 16**, and the residual work is conventional rather than exploratory. Ship the AI side as an audio agent with a static card and a waveform; a synthetic avatar adds latency, cost and uncanny-valley risk for no measured assessment value.

| Consideration | Buy | Build |
|----|----|----|
| Time to a scored video round | Days, behind your stage adapter. | Roughly 10 engineer-weeks, now that WebRTC is not part of the estimate. |
| Proctoring maturity | Years of adversarial investment: tab and focus switching, second-screen and multiple-face detection, gaze-away, virtual-camera and deepfake checks. **Available separately — see the middle path below.** | Browser events and on-device face detection are days of work and cover most of the realistic threat. Deepfake and sophisticated-collusion detection is the part that is genuinely hard. |
| Unit economics at volume | **The strongest argument to build.** Per-interview vendor pricing against thousands of volume-role interviews a month is a margin sandwich you are reselling. | Marginal cost is compute and minutes on infrastructure you already run. |
| Strategic position | Your deepest assessment level — the thing you sell — is someone else's product, priced by them, and several of these vendors sell directly to your buyers. | It is your product. |
| Data and validation | Only workable if you can export transcripts, scores and evidence. Otherwise you cannot run the agreement analysis this plan depends on, and cannot leave. | Transcripts, scores and joining outcomes accumulate as your own evaluation asset. |
| Candidate-side reliability | Handled — devices, browsers, bandwidth. Thankless and endless work. | Yours to own, and Indian network conditions make it real work. |

The honest ledger

### Three options, not two

#### A · Full white-label AI interview SaaS

`Fastest`

A vendor runs the interview and the proctoring; you embed it. Several are built specifically for platforms rather than employers, with REST APIs, white-labelling, multi-tenancy and usage-based pricing.

**Cost of it**You rent the deepest thing you sell, at per-interview pricing, against volume-role economics — and your rubric has to fit their scoring model rather than the reverse.

#### B · Build the interview, rent the proctoring

`Recommended`

Run the interview on your own WebRTC stack; buy integrity as an embeddable JavaScript SDK. That category exists and is designed exactly for this — candidates stay on your domain and inside your assessment flow, and the SDK returns integrity events and scores.

**Why this one**You own the rubric, the scenarios, the transcript, the data and the marginal cost. You rent only the adversarial layer, which is the one place vendor investment genuinely compounds.

#### C · Build everything, proctoring included

`Later`

Defensible eventually, wrong first. Deepfake and virtual-camera detection is a moving adversarial target and not where a four-engineer team should spend its first year.

**Path to it**Option B converges here naturally: build integrity signals in as you learn which ones matter, and drop the SDK when it stops earning its fee.

**Take option B.** With WebRTC already available, the case for renting the whole interview is much weaker than it was — you would be paying per interview for the part you already have the hardest ingredient of. What you genuinely lack is proctoring maturity, and that is separately purchasable.

#### And be honest about the threat model

For high-volume sales, support and ops hiring in India, the realistic attack is a friend answering the call or a candidate reading from a phone — not a GAN-generated face. That threat is largely covered by things that are cheap to build: focus and visibility events, fullscreen exit, copy and paste, multiple-display detection, on-device face presence and face count, plus the cross-call speaker verification P3 already gives you.

So a bought SDK is buying you the tail: sophisticated collusion, virtual cameras, synthetic video. Worth having, and worth naming in an enterprise security review — but do not let the fear of the tail talk you into renting the whole interview.

### Vendor evaluation, whichever option

- **Full export or no deal.** Transcript, per-dimension scores, evidence citations and media, into your Postgres and object storage, on your schedule. Verify it during evaluation, not after signature.
- **Your rubric runs, or you score the transcript yourself.** An opaque vendor model is a black box you must defend to candidates and regulators.
- **India data residency and a real security posture** — Indian enterprise HR data, and buyers who will ask.
- **Indian languages and code-switching** at the quality your candidate mix needs, tested on your own recordings rather than their demo.
- **No facial or appearance scoring**, and the ability to turn it off if the product includes it. Several incumbents built their reputation on exactly this.
- **Pricing that survives volume.** Model it at your design partner's real monthly interview count, not a pilot's.

### Non-negotiables whichever way you go

- **The stage is an adapter, and the switch is a config change.** Section 12's interpreter already gives you this: an AI-video stage is a stage whose work is an external activity. Nothing upstream or downstream should know which implementation answered.
- **Transcript, per-dimension scores, evidence citations and media land in your Postgres and your object storage** — not only in the vendor's dashboard. Make full export a hard vendor-selection requirement and verify it during evaluation, not after signature. Without it you have no agreement analysis, no bias audit, and no exit.
- **Your rubric, not theirs.** If the vendor scores against its own opaque model you have bought a black box you must defend to candidates and regulators. Prefer vendors that will run your dimensions, or that hand back a transcript you score yourself.
- **Camera for identity, presence and proctoring only — never for scoring.** And note that AI-analysed video interviews carry their own notice, consent and deletion duties in some jurisdictions, so the P0 consent purposes need a video-specific entry.
- **Always offer a voice fallback.** A candidate with a poor connection, no camera, or an accessibility need must be able to complete the round by voice on the same rubric. At volume in India this is a routine path, not an accommodation edge case.

### Timeline — one open scheduling choice

Option B is about **10 engineer-weeks**: roughly 6 for the video session, recording, playback and device hardening, 2 for the cheap integrity signals, 1.5 for the proctoring SDK, and the rest for scoring integration. P4 as originally scoped was four calendar weeks and already full, so it does not fit inside it.

**Taken: extend P4 to seven weeks and build it there.** The video round goes live when the rest of L2 does, nothing is built twice, and no vendor gets introduced only to be removed. That is what the phase table now reflects.

The alternative remains open and is worth revisiting if a customer commitment needs the video round sooner: run a vendor in P4 and build your own in a parallel track landing in the P5–P6 window, where the team's work is integration-heavy rather than media-heavy. It buys earlier availability at the cost of doing the integration twice.

**Resolved:** the earlier open question about whether the Nurix stack could be driven over a browser WebRTC session — it can. The P0 spike no longer needs to answer it, though it should still confirm behaviour on a long interview-shaped session over Indian consumer bandwidth.

## 14 · Post-joining ramp, training and quizzes

This crosses the boundary the plan drew at day one, which is a real change and worth naming. It is also cheaper than it looks and strategically stronger than it looks, for the same underlying reason: it is the machinery you already built, pointed at a person whose status changed.

#### The one real cost: you now hold employee data

Until now every person in the system was a candidate. Past joining they are an employee, and that is a different legal basis, a different retention class, and a standing sync boundary with the customer's HRIS. Handle it in the P0 tables rather than discovering it in P8: a person's status is a field, employment is a separate consent purpose with its own retention rule, and **the HRIS stays the system of record** — you hold ramp progress and push results, you do not become a second source of employee truth.

Everything else about this addition is upside.

#### Why it is cheap: nothing here is structurally new

Post-joining ramp is **more stages in the same Temporal pipeline**, running past the joining event instead of stopping at it. A quiz is a stage type. A practice role-play call is the existing voice stage with a different rubric and a shorter script. Ramp modules are versioned content in the pipeline definition, exactly like rubrics and role-play scenarios. Delivery is the P2 outbox. Reminders are the timers you already have.

That is why thirteen or so engineer-weeks buys a whole product surface here, where it would buy a fraction of one earlier in the plan. The P0 decision to make the process a versioned data structure and the section 12 decision to run it through a generic interpreter are both paying off a second time.

#### Why it is strategically strong, not just adjacent

For high-volume sales, support and ops hiring, **early attrition is the dominant cost**. Someone who joins and leaves at week three costs more than someone who never joined at all — you paid to source, screen, interview, verify and onboard them, and you got nothing. Any credible claim to have automated recruiting has to survive that number, so a plan that stops at joining is measuring the wrong end of the funnel.

And you can do something here that a learning platform structurally cannot: **you know why this person was hired and where they were weak.** The L2 role-play scored them per dimension. The engagement history says how responsive they are. The renege signals say how committed they were. Ramp content targeted from that is a different product from a course catalogue everyone works through identically — and it is defensible precisely because the hiring data never leaves your system.

It also closes the loop the rest of this plan leans on. Section 09 promises that L2 scores get validated against on-the-job performance; quiz results, practice-call scores and 90-day retention *are* those labels. Without P8 that validation has no data source and the claim stays aspirational.

#### Where the line is: this is not an LMS

Learning management is a large, crowded, mature category, and every HRIS ships one. Competing there means losing. Stay narrow and the boundary holds:

**In:** role-specific ramp tracks across the first ninety days, short auto-scored knowledge checks, AI practice calls on the hiring rubric, certification gates, manager visibility, and the correlation back to hiring scores.

**Out:** SCORM, a course-authoring studio, video hosting, learning paths and catalogues, skills taxonomies, compliance record-keeping as system of record, and anything past day ninety. If a customer wants those, they have an LMS already — integrate rather than compete.

### Cost and sequencing

Roughly **13 engineer-weeks**, landing as a four-week P8: about 3 for the content model and quiz engine, 2 for mobile-first delivery, 1.5 for track assignment through the existing pipeline, 2 for practice calls, 2 for the manager view, 1.5 for certification gates and the HRIS push, and 1.5 for the outcome reporting. A further 2 weeks of pre-joining ramp content folds into P6, where engagement already lives.

With the AI video build now inside an extended P4, the plan runs to **45 weeks**. P8 is the one phase nothing else depends on, so it is also the cleanest thing to cut, defer, or ship immediately after a v1 launch — the platform is sellable at the end of P7. The argument for doing it anyway is that it is the only phase that tells you whether the eight before it actually worked.

hrX build plan · drafted 27 August 2026 · multi-tenant SaaS, Nurix first-party voice, Temporal orchestration with the process held as versioned data, India-first, volume non-technical roles as design partner · 36 modules across 9 phases, requisition through the ninetieth day · 45 weeks for a four-engineer team — planning estimates, not commitments · targets in section 09 are illustrative until baselined
