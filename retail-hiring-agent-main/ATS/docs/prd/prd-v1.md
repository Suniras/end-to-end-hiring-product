# Product Requirements Document — HireAgent v1

**Version:** 0.1 (Draft)
**Date:** 2026-05-17
**Author:** Anuj Jain
**Status:** In Progress

---

## 1. Problem Statement

Hiring is broken at the handoff between hiring managers and recruiters.

Today, when a hiring manager needs to fill a role, the process looks like this:

1. **The intake loop burns weeks.** The HM describes the role to a recruiter — often vaguely. The recruiter interprets it, sources candidates, presents a batch. The HM rejects most of them ("not what I meant"). They recalibrate. The recruiter tries again. This loop repeats 2-4 times over 2-3 weeks before a single candidate is screened.

2. **The recruiter becomes a translation layer, not a value-add.** Most of the recruiter's time goes into decoding what the HM actually wants, reformatting it into Boolean searches, and shuttling feedback back and forth. The actual recruiting work — selling the role to strong candidates, managing the pipeline, closing offers — gets squeezed.

3. **Candidates experience silence and slow responses.** While the HM and recruiter iterate internally, applicants wait days or weeks for any signal. Strong candidates drop off. The ones who remain self-select for desperation, not quality.

4. **Shortlisting is a black box.** When a recruiter passes on a candidate, the HM rarely knows why. When a HM rejects a recruiter's pick, the reasoning is informal ("not a fit"). Neither side builds a shared, explicit model of what "good" looks like — so the same miscalibration repeats on the next role.

5. **Interview prep is an afterthought.** Interviewers receive a resume and a calendar invite. No structured rubric. No tailored questions. No alignment on what they're evaluating. The result: inconsistent assessments, redundant questions across rounds, and decisions driven by gut feel rather than evidence.

The tools that exist today — traditional ATS platforms (Greenhouse, Workday) and AI overlays (Eightfold, Findem, Maki) — address pieces of this:

- **Traditional ATS** systems are workflow tools for recruiters. They track candidates through stages but don't reduce the intake loop, don't auto-shortlist, and require manual work at every step. The HM's interaction is limited to "thumbs up/down" on candidates the recruiter surfaces.
- **AI overlays** (Eightfold, Findem) add better search and matching on top of the ATS, but they still operate within the recruiter's workflow. The HM never touches these tools. The intake loop remains human-to-human. And the downstream steps (interview prep, evaluation) are untouched.
- **AI screening tools** (Maki, HeyMilo) automate assessments but sit at a single stage (screening or interviewing), don't own the candidate pipeline, and still depend on a recruiter to feed them the right candidates.

No existing tool gives the hiring manager direct control over defining, calibrating, and monitoring the hiring pipeline — with AI handling the translation, shortlisting, and coordination work that currently consumes recruiter time.

---

## 2. Key Objectives

### 2.1 Primary Objective

Build an AI agent that lets a hiring manager go from "I need to hire someone" to "here are calibrated, interview-ready candidates" — with minimal recruiter involvement and no multi-week intake loop.

### 2.2 North Star Metric

**Time-to-close:** The elapsed time from the decision to hire for a role to the candidate accepting the offer — without compromising on candidate quality.

Everything we build should compress this timeline. Every feature decision should be tested against: "Does this reduce time-to-close, or does it add process?"

### 2.3 Specific Goals

1. **Compress the intake-to-shortlist cycle from weeks to hours.**
   Replace the HM-recruiter back-and-forth with an AI-guided role definition conversation that produces a calibrated scoring rubric in a single session (~30 minutes). Candidates are scored against this rubric as they apply.

2. **Make the hiring manager the primary user, not a passive approver.**
   The HM defines the role, calibrates the spec against sample profiles, reviews categorised candidates with full reasoning, and provides feedback that improves future scoring. The tool works for the HM, not the recruiter.

3. **Automate shortlisting with transparent, auditable reasoning.**
   Every candidate is categorised (Hot / Warm / Cold) with a written rationale tied to the role spec. No black-box scores. The HM sees exactly why each candidate landed where they did — and can override with a single action.

4. **Keep a human in the loop where it matters.**
   The TA/recruiter retains two high-value roles: (a) top-of-funnel candidate attraction and sourcing, and (b) warm outreach to shortlisted candidates (selling the role, answering questions). The AI handles the middle — scoring, categorising, scheduling, prep.

5. **Prepare candidates and interviewers for better conversations.**
   Auto-generate interview briefs (candidate summary against role spec, tailored questions, evaluation rubric) so that every interview is structured, non-redundant, and produces comparable assessments.

---

## 3. What We Are Building (High-Level)

An AI-powered hiring agent that serves the hiring manager as its primary user. The system covers the hiring lifecycle from role definition through interview preparation, with the recruiter/TA handling candidate attraction and warm outreach.

### 3.1 System Overview

The product is composed of five core components that map to the hiring lifecycle:

```
[1. Role Definition Agent] → [2. Job Distribution] → [3. Smart Shortlisting Engine] → [4. Candidate Communication & Scheduling] → [5. Interview Prep Agent]
```

### 3.2 Component Summary

#### Component 1 — Role Definition Agent
**Primary user:** Hiring Manager
**What it does:** Conversational AI that guides the HM through role definition. Instead of filling out a static form, the HM has a structured conversation where the agent asks targeted questions (90-day goals, ideal career trajectory, dealbreakers, compensation band). The agent produces a **role spec** — a machine-readable scoring rubric — and validates it by showing sample candidate profiles for the HM to calibrate against ("Are these the right ballpark?"). This replaces the recruiter intake loop.

**Key outputs:**
- Calibrated role spec (scoring rubric with weighted criteria)
- Auto-generated job description (derived from the spec, not the other way around)
- Calibration record (which sample profiles the HM approved/rejected and why)

#### Component 2 — Job Distribution
**Primary user:** TA/Recruiter (configuration); Automated (execution)
**What it does:** Once the HM approves the role spec and generated JD, the system auto-posts to configured channels — LinkedIn, company career page, internal job board, and any integrated job boards. The TA can adjust distribution channels, boost specific postings, or add sourcing campaigns on top.

**Key outputs:**
- Published job postings across configured channels
- Tracking of application source and volume per channel

#### Component 3 — Smart Shortlisting Engine
**Primary user:** Hiring Manager (review); Automated (scoring)
**What it does:** As applications come in, the engine scores each candidate against the calibrated role spec and categorises them into three tiers:

| Tier | Definition | AI Confidence | Action |
|------|-----------|---------------|--------|
| **Hot** | Clear match against role spec criteria | High | TA initiates outreach + scheduling |
| **Warm** | Partial match; specific uncertainties flagged | Medium | HM or TA reviews, moves to Hot or Cold |
| **Cold** | Does not meet key criteria | High (negative) | Decline email sent after grace period |

Every categorisation includes a written rationale: which criteria the candidate met, which they didn't, and what's uncertain (for Warm). When a HM recategorises a candidate (e.g., Warm → Hot), that feedback is captured as calibration signal to improve future scoring on this role.

**Key behaviours:**
- If >60% of applicants land in Warm, the agent flags the role spec as too broad and prompts the HM to tighten specific criteria
- First batch of Cold candidates requires human review before decline emails are sent (compliance checkpoint)
- After first-batch approval, subsequent Cold candidates are auto-declined with configurable grace period (default: 5 days)
- Personalized decline emails are respectful and do not state rejection reasons (internal notes only)

#### Component 4 — Candidate Communication & Scheduling
**Primary user:** Candidate (self-service); TA (warm outreach)
**What it does:** Manages all candidate-facing communication from shortlist through interview booking.

For **Hot** candidates:
- TA receives notification with candidate brief for warm outreach call
- Candidate receives email with role context and self-scheduling link
- Auto-send scheduling email if no TA action within configurable window (default: 48 hours)

For **Cold** candidates:
- Personalized decline email sent after grace period
- Email is respectful, does not disclose specific rejection reasons

Scheduling:
- Syncs with HM/panel calendars (Google Calendar, Outlook)
- Candidate self-books from available slots
- Automated reminders, rescheduling, and no-show follow-up

#### Component 5 — Interview Prep Agent
**Primary user:** Hiring Manager, Interview Panel
**What it does:** Before each interview, generates a structured prep package for the interviewer(s):

- **Candidate brief:** Structured summary of the candidate's profile mapped against the role spec — not a resume dump, but a "here's what matches, here's what's uncertain, here's what to probe"
- **Tailored questions:** Interview questions generated based on this specific candidate's profile gaps, strengths, and the criteria assigned to this interview round
- **Evaluation rubric:** Scorecard aligned to the role spec criteria, so every interviewer evaluates against the same framework

This ensures interviews are structured, non-redundant across rounds, and produce comparable, evidence-based assessments.

---

### 3.3 What We Are NOT Building (v1 Scope Boundaries)

- **Not a full ATS replacement.** We are not building offer management, onboarding, compliance tracking, or requisition approval workflows. We integrate with existing ATS where needed.
- **Not a sourcing engine.** We are not building a candidate database, scraping LinkedIn, or competing with Findem/Eightfold on talent data. Candidates come through job postings and recruiter-driven sourcing via existing tools.
- **Not an AI interviewer.** We generate interview prep and rubrics, but we do not conduct autonomous AI interviews in v1. The interview itself is human-led.
- **Not a resume parser.** We use structured data from applications and integrate with ATS-parsed profiles. Building a competitive resume parser is not a v1 goal.

---

### 3.4 User Roles

| Role | Primary Interactions | Tool Relationship |
|------|---------------------|-------------------|
| **Hiring Manager** | Defines role (via conversation), calibrates spec, reviews Hot/Warm/Cold candidates, provides feedback, receives interview prep | **Primary user.** The tool is built for them. |
| **TA / Recruiter** | Configures job distribution channels, makes warm outreach calls to Hot candidates, reviews first batch of Cold for compliance, manages sourcing campaigns externally | **Supporting user.** High-value tasks only. |
| **Interview Panel** | Receives interview prep package (candidate brief, questions, rubric), submits structured evaluation | **Downstream user.** Consumes agent output. |
| **Candidate** | Applies via job posting, receives status communications, self-schedules interviews | **End user.** Experiences the system through emails and scheduling. |

---

### 3.5 Key Principles

1. **Reasoning is visible.** Every AI decision (categorisation, scoring, question generation) comes with a written rationale. No black-box scores.
2. **Humans override, AI adapts.** When a user disagrees with the AI's categorisation, the override is easy (one click) and the system treats it as calibration signal.
3. **Fail toward human review, not auto-action.** When the AI is uncertain, candidates go to Warm (human reviews), not Hot or Cold. When in doubt, slow down, don't auto-reject.
4. **The HM's time is the constraint we optimise for.** Every design decision should reduce the total hours a hiring manager spends to make a hire, without sacrificing quality.
5. **Compliance by default.** Human-in-the-loop checkpoints at every irreversible action (rejections, external communications). Audit trail on every decision.

---

---

## 4. Detailed Component Specs

### 4.1 Component 1 — Role Definition Agent

**Purpose:** Replace the multi-week HM-recruiter intake loop with a single AI-guided session that produces a calibrated, machine-readable role spec.

**Primary user:** Hiring Manager

#### 4.1.1 How It Works

The HM initiates a new role by starting a conversation with the agent. This is not a form — it's a structured dialogue. The agent leads the HM through a series of questions designed to extract what they actually need, not just what they think they want.

**Phase A — Role Discovery (Conversational)**

The agent asks questions across five dimensions:

| Dimension | Example Questions | Why It Matters |
|-----------|------------------|----------------|
| **Impact** | "What will this person own in their first 90 days?" / "What does success look like at 6 months?" | Grounds the role in outcomes, not title/keyword matching |
| **Career Trajectory** | "Describe the ideal candidate's last 3 years." / "What kind of company should they be coming from?" | Enables trajectory-based matching (scaling exp, 0→1 builds, domain transitions) |
| **Dealbreakers** | "What would make you reject a candidate in 10 seconds?" / "Are there any non-negotiable skills or experiences?" | Creates hard filters — the Cold criteria |
| **Tradeoffs** | "If you had to choose: deep domain expertise or strong generalist who learns fast?" / "Remote OK or on-site required?" | Forces prioritisation — prevents the spec from becoming a wish list |
| **Compensation & Logistics** | "What's the compensation band?" / "What level is this role (IC/Lead/Manager)?" / "Timeline — when do you need someone started?" | Practical constraints that affect candidate pool size |

The agent doesn't ask all questions linearly. It adapts: if the HM says "I need someone to build our data platform from scratch," the agent infers 0→1 experience matters and skips basic seniority questions.

**Phase B — Spec Generation**

From the conversation, the agent generates a **Role Spec** — a structured, machine-readable document with:

1. **Scoring criteria** — a list of 5-10 weighted criteria, each with:
   - Criterion name (e.g., "Scaling experience — took a product from 1K to 100K users")
   - Weight (High / Medium / Low)
   - Assessment method (resume signal, project evidence, interview probe)
   - What "strong" vs "weak" looks like for this criterion
2. **Hard filters** — binary pass/fail requirements (e.g., "Must have work authorisation in India," "Minimum 5 years experience")
3. **Soft preferences** — nice-to-haves that boost a candidate's score but aren't required (e.g., "Startup experience preferred," "ML background is a plus")

**Phase C — Calibration**

This is the critical step that replaces the recruiter's "show a batch, get rejected, recalibrate" loop.

The agent presents **3-5 sample candidate profiles** (anonymised, drawn from public professional data or synthetic examples built to match the spec) and asks the HM to react:

- "This profile matches 7/10 of your criteria. Would you interview this person?"
- "This one hits your dealbreaker on years of experience but has strong 0→1 signals. Still a no?"

The HM's reactions refine the spec:
- If HM accepts a profile that the spec would score low → a criterion is weighted too heavily, adjust
- If HM rejects a profile that scores high → something is missing from the spec, probe what
- If HM is uncertain → the criterion is a Warm signal, not a filter

After calibration, the agent shows the updated spec and asks for confirmation: "Here's your finalised role spec. Candidates will be scored against these criteria. Ready to go live?"

**Phase D — Job Description Generation**

Once the spec is approved, the agent auto-generates a job description **derived from the spec**. This is intentionally reversed from the typical flow (where the JD is written first and the spec is vague or nonexistent).

The JD is:
- Written for candidates (clear, honest, no jargon inflation)
- Structured: role summary, key responsibilities (from Impact dimension), requirements (from Hard Filters), nice-to-haves (from Soft Preferences), compensation range, logistics
- Editable by the HM before publishing

#### 4.1.2 Role Spec Data Model (Conceptual)

```
RoleSpec:
  role_id: uuid
  created_by: user_id (HM)
  created_at: timestamp
  status: draft | calibrating | active | paused | closed

  title: string
  team: string
  level: string (IC4, Lead, Manager, etc.)
  location: string
  remote_policy: on-site | hybrid | remote
  compensation_band: { min, max, currency }
  target_start_date: date
  urgency: low | medium | high

  hard_filters:
    - { criterion: string, type: boolean, required_value: any }
    # e.g., { criterion: "Work authorisation in India", type: boolean, required_value: true }

  scoring_criteria:
    - { criterion: string, weight: high|medium|low, strong_signal: string, weak_signal: string }
    # e.g., { criterion: "0-to-1 build experience", weight: high, strong_signal: "Built and shipped a product from scratch to 10K+ users", weak_signal: "Joined a team post-product-market-fit, maintained existing product" }

  soft_preferences:
    - { criterion: string, bonus_weight: float }
    # e.g., { criterion: "ML/AI background", bonus_weight: 0.1 }

  calibration_record:
    - { profile_id: string, hm_reaction: accept|reject|uncertain, hm_notes: string, spec_adjustment: string }

  generated_jd: text (markdown)
  jd_approved: boolean
  jd_approved_at: timestamp
```

#### 4.1.3 Edge Cases & Safeguards

| Scenario | Agent Behaviour |
|----------|----------------|
| HM is vague ("I need a strong engineer") | Agent pushes for specifics: "Strong in what context? Building systems for scale? Working with messy data? Leading a team?" Does not proceed to spec generation until at least Impact and Dealbreakers dimensions have concrete answers. |
| HM creates an impossibly narrow spec | Agent warns with data: "A spec this narrow matches ~50 professionals nationally. Typical roles at this level attract 100-300 applicants. Consider relaxing [X]." |
| HM wants to skip calibration | Agent allows it but flags: "Without calibration, scoring accuracy will be lower. The first batch of candidates will include more Warm categorisations for you to review." |
| HM changes their mind after going live | Spec can be re-opened for editing. Any candidates already scored are re-scored against the updated spec. The change is logged in the audit trail. |
| HM creates a duplicate/similar role | Agent detects and asks: "You created a similar role (Senior Backend Engineer) 3 months ago. Want to start from that spec, or create a fresh one?" |

#### 4.1.4 Success Criteria (Component 1)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Time from "start role creation" to "live spec" | < 1 hour | Median time across all roles |
| HM satisfaction with generated spec | > 4/5 | Post-creation rating |
| Spec revision rate after going live | < 20% of roles need spec changes after first candidate batch | Tracking spec edits post-activation |
| Calibration completion rate | > 80% of HMs complete the calibration step | Funnel tracking |

---

### 4.2 Component 2 — Job Distribution

**Purpose:** Automatically publish the approved job description to configured channels. Remove the manual copy-paste-reformat step.

**Primary user:** TA/Recruiter (configuration); Automated (execution)

#### 4.2.1 How It Works

Once the HM approves the generated JD from Component 1, the system distributes it.

**Supported channels (v1):**
- Company career page (hosted or embedded widget)
- LinkedIn (via LinkedIn Job Posting API)
- Internal job board / employee referral portal

**Future channels (post-v1):**
- Indeed, Glassdoor, Naukri, other regional job boards
- Slack / Teams internal notification ("New role open in [team]")

**Workflow:**
1. HM approves JD → system checks which distribution channels are configured for this team/org
2. JD is formatted per channel requirements (LinkedIn has character limits, career page has templates)
3. Posts are created automatically. Each gets a tracking link to attribute application source.
4. TA can optionally: adjust channels, add boost/sponsorship, enable sourcing campaigns via external tools
5. Application volume per channel is tracked and visible on the role dashboard

#### 4.2.2 Integration Requirements

| Channel | Integration Type | Auth | Notes |
|---------|-----------------|------|-------|
| Career page | Embedded widget or API | API key | We host a job board widget that customers embed, or expose an API for their existing career site |
| LinkedIn | LinkedIn Job Posting API | OAuth 2.0 | Requires company page admin. Supports organic and sponsored posts. |
| Internal portal | Webhook / API push | API key | Push job data to customer's internal systems (intranet, Slack, Teams) |

#### 4.2.3 Edge Cases & Safeguards

| Scenario | Behaviour |
|----------|-----------|
| LinkedIn API rate limit or auth failure | Queue the post, retry with backoff, notify TA. Role is still live on other channels. |
| HM edits JD after posting | Updated JD is re-pushed to all channels. Previous version is archived. |
| Role is paused or closed | All active postings are pulled down automatically. Candidates who already applied are unaffected. |
| No distribution channels configured | Block posting, prompt TA to configure at least one channel before the role can go live. |

#### 4.2.4 Success Criteria (Component 2)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Time from JD approval to live posting | < 5 minutes (automated channels) | System timestamp delta |
| Channel attribution accuracy | 100% of applications have source tracked | Application source field populated |
| Manual TA intervention required | < 10% of postings need TA adjustment | Tracking TA edits post-auto-publish |

---

### 4.3 Component 3 — Smart Shortlisting Engine

**Purpose:** Score every applicant against the calibrated role spec and categorise them into Hot / Warm / Cold with transparent reasoning.

**Primary user:** Hiring Manager (review); Automated (scoring)

#### 4.3.1 How Scoring Works

When a candidate applies, the system:

1. **Parses the application** — extracts structured data from the resume/profile (education, work history, skills, projects). In v1, we rely on structured fields from the application form + basic resume parsing. We don't need best-in-class parsing — the scoring model works on whatever structured data is available.

2. **Evaluates against hard filters** — binary pass/fail. If a candidate fails any hard filter, they're categorised Cold immediately. The rationale names the specific filter failed.

3. **Scores against weighted criteria** — each criterion in the role spec is evaluated:
   - The AI assesses whether the candidate's profile shows evidence for each criterion
   - Each criterion gets a signal rating: Strong / Moderate / Weak / No Evidence
   - Weighted scores are combined into an overall score

4. **Applies soft preferences** — bonus points for nice-to-haves. These can move a borderline candidate from Warm to Hot but can't rescue a candidate who fails scoring criteria.

5. **Categorises into tier:**

| Score Range | Tier | Meaning |
|-------------|------|---------|
| Top quartile + no weak signals on High-weight criteria | **Hot** | Clear match. Strong evidence across key criteria. |
| Middle range OR strong overall but weak on 1-2 High-weight criteria | **Warm** | Potential match. Specific uncertainties flagged for human review. |
| Bottom quartile OR fails hard filter OR weak on 3+ High-weight criteria | **Cold** | Does not match. Specific criteria failures documented. |

The thresholds are not static — they're relative to the applicant pool for this specific role. If all applicants are strong, the bar rises. This prevents a situation where a weak talent pool produces many Hot candidates.

#### 4.3.2 Candidate Card (What the HM Sees)

For each candidate, the HM sees a card with:

```
┌─────────────────────────────────────────────────────┐
│  [HOT]  Priya Sharma — Senior Backend Engineer      │
│                                                     │
│  Match Summary:                                     │
│  ✅ 0-to-1 build experience (High) — Built payment  │
│     service from scratch at [Company], scaled to     │
│     50K TPS in 18 months                            │
│  ✅ Distributed systems (High) — 4 years designing   │
│     event-driven architectures at [Company]         │
│  ⚠️  Team leadership (Medium) — Led 3-person team;  │
│     role asks for 5+. Moderate signal.              │
│  ✅ Startup experience (Soft Pref) — 2 startups,    │
│     both Series A-B stage                           │
│                                                     │
│  Hard Filters: ✅ All passed                         │
│  Overall: Strong match on core criteria.            │
│  Uncertainty: Team size leadership is below spec.   │
│                                                     │
│  [Move to Warm] [Move to Cold] [View Full Profile]  │
└─────────────────────────────────────────────────────┘
```

Key design decisions:
- **Criteria are listed in weight order** (High first), not alphabetically
- **Evidence is specific** — not "has relevant experience" but "built X at Y, scaled to Z"
- **Uncertainties are called out explicitly** — the HM can immediately see what the AI isn't sure about
- **Override is one click** — no confirmation dialog, no "are you sure". Speed matters.

#### 4.3.3 Calibration Feedback Loop

When the HM moves a candidate between tiers, the system captures this as calibration signal:

- **Warm → Hot:** HM valued something the AI underweighted. Agent asks (optional, non-blocking): "You moved this candidate to Hot. Was it because of [specific criterion] or something else?"
- **Warm → Cold:** HM rejected on something the AI missed. Same optional prompt.
- **Hot → Cold or Cold → Hot:** Strong disagreement. Agent flags: "This is a significant override — the candidate scored [high/low] on your spec. Want to adjust the spec, or is this an exception?"

Over time (across candidates within a role), the scoring weights drift toward the HM's revealed preferences. The HM doesn't need to manually adjust the spec — their actions calibrate it.

#### 4.3.4 Safeguards

| Scenario | Agent Behaviour |
|----------|----------------|
| >60% of applicants are Warm | Flags to HM: "Most applicants are landing in Warm. Your spec may be too broad on [X]. Tighten criteria or review Warm batch manually?" |
| >80% of applicants are Cold | Flags to HM: "Very few candidates match your spec. The criteria may be too narrow. Consider relaxing [X] or expanding to adjacent profiles." |
| HM hasn't reviewed Warm candidates in 5+ days | Nudge notification: "You have 12 Warm candidates awaiting review for [Role]. Candidates may lose interest." |
| First batch of Cold candidates | Held for human review (TA or HM) before any decline emails are sent. This is the compliance checkpoint. |
| HM overrides >50% of AI categorisations | Agent flags: "You've overridden a majority of the AI's categorisations. The role spec may need recalibration. Want to revisit it?" |

#### 4.3.5 Success Criteria (Component 3)

| Metric | Target | How Measured |
|--------|--------|-------------|
| HM override rate (across all tiers) | < 15% of candidates are moved between tiers | Override actions / total candidates |
| Hot→Hired conversion rate | > 40% of Hot candidates receive an offer | Tracking candidates through funnel |
| Time from application to categorisation | < 5 minutes | System timestamp |
| Warm bucket size | < 30% of total applicants per role | Tier distribution tracking |
| HM satisfaction with shortlist quality | > 4/5 | Post-review rating |

---

### 4.4 Component 4 — Candidate Communication & Scheduling

**Purpose:** Handle all candidate-facing communication from categorisation through interview booking. No candidate should wonder "what's happening with my application."

**Primary user:** Candidate (self-service); TA (warm outreach for Hot candidates)

#### 4.4.1 Communication Flows

**Hot Candidates:**

```
Candidate applies
  → Immediate: acknowledgment email ("Application received")
  → Scored as Hot
  → TA notified with candidate brief for warm outreach
  → IF TA acts within 48hrs: TA calls candidate, sends personalised scheduling link
  → IF TA doesn't act within 48hrs: auto-send scheduling email with link
  → Candidate self-books interview slot from HM/panel calendar availability
```

**Warm Candidates:**

```
Candidate applies
  → Immediate: acknowledgment email ("Application received")
  → Scored as Warm
  → Sits in HM/TA review queue
  → IF moved to Hot: follows Hot flow above
  → IF moved to Cold: follows Cold flow below
  → IF no action in 7 days: auto-nudge to HM ("12 Warm candidates need review")
  → IF no action in 14 days: auto-send "still under review" email to candidate
```

**Cold Candidates:**

```
Candidate applies
  → Immediate: acknowledgment email ("Application received")
  → Scored as Cold
  → IF first batch for this role: held for human review (compliance checkpoint)
  → IF post-first-batch: enters grace period (default 5 days)
  → After grace period (or after human confirms first batch): personalised decline email sent
  → Decline email: respectful, mentions the specific role, does NOT state rejection reasons
  → Internal notes: full rejection rationale preserved for audit trail
```

#### 4.4.2 Scheduling

**Self-service scheduling flow:**
1. Hot candidate receives email with scheduling link
2. Link shows available slots from the interviewer's calendar (HM or panel member, depending on interview round)
3. Candidate selects a slot → interview is booked on both calendars
4. Automated reminders: 24hrs before (candidate + interviewer), 1hr before (candidate)
5. If candidate needs to reschedule: link allows one self-service reschedule. Further changes go through TA.
6. No-show handling: if candidate doesn't join within 10 minutes, system sends "missed you" email with rebooking link. Flags to TA.

**Calendar integration (v1):**
- Google Calendar (API)
- Microsoft Outlook / Office 365 (Microsoft Graph API)

**Scheduling rules:**
- Respect interviewer's working hours and existing meetings
- Buffer time between interviews (configurable, default 15 min)
- Maximum interviews per day per interviewer (configurable, default 4)
- Time zone detection and display for remote candidates

#### 4.4.3 Email Design Principles

- **Acknowledgment email:** Sent within seconds of application. Brief. Sets expectation on timeline. ("We'll review your application and get back to you within [X] days.")
- **Scheduling email:** Clear CTA. One link. Role context as refresher. No login required to book.
- **Decline email:** Personalised with candidate name and role title. Respectful tone. Encourages future applications. Does NOT include AI-generated reasons (legal risk). Example: "After careful review, we've decided to move forward with other candidates for the [Role] position. We were impressed by your background and encourage you to apply for future roles that match your experience."
- **Still under review email:** Honest. "Your application is still being reviewed. We expect to have an update within [X] days."

#### 4.4.4 Edge Cases & Safeguards

| Scenario | Behaviour |
|----------|-----------|
| Candidate applies to multiple open roles | Each role scores independently. Candidate receives one acknowledgment per role. If rejected for one and shortlisted for another, they only receive the positive communication. Decline for the other role is held until the active process concludes. |
| Interview slot is no longer available when candidate clicks | Show next 3 available slots. Don't send them back to an empty calendar. |
| HM's calendar has no availability in next 2 weeks | Alert TA and HM: "No interview slots available for [Role] in the next 14 days. Candidates are waiting." |
| Candidate withdraws | Log the withdrawal. Stop all automated communication. Optionally ask for reason (brief, optional survey). |

#### 4.4.5 Success Criteria (Component 4)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Time from Hot categorisation to interview booked | < 3 days | System timestamps |
| Candidate response rate to scheduling email | > 70% | Click + book tracking |
| No-show rate | < 10% | Calendar + join tracking |
| Candidate NPS on communication experience | > 50 | Post-process survey |
| Decline email sent within SLA | 100% of Cold candidates receive decline within grace period + 1 day | System tracking |

---

### 4.5 Component 5 — Interview Prep Agent

**Purpose:** Ensure every interviewer walks into every interview with a structured brief, tailored questions, and a scoring rubric — so interviews produce comparable, evidence-based assessments rather than gut-feel opinions.

**Primary user:** Hiring Manager, Interview Panel

#### 4.5.1 What Gets Generated

**24 hours before each scheduled interview**, the agent generates and sends an **Interview Prep Package** to the interviewer(s):

**A. Candidate Brief**

Not a resume forward — a structured summary mapped to the role spec:

```
Candidate: [Name]
Role: [Role Title]
Interview Round: [Round 1 — Technical Depth]

Criteria Assessment (from role spec):
  ✅ 0-to-1 build experience — Built payments infra at [Co], 0→50K TPS
  ✅ Distributed systems — 4 years event-driven arch at [Co]
  ⚠️  Leadership — Led 3-person team (spec asks for 5+)
  ❓ Cross-functional collaboration — No clear evidence; probe in interview

Key things to explore:
  1. Leadership gap: Have they managed larger teams informally?
     Does their 0→1 experience show cross-team influence?
  2. [Company] tenure was 11 months — what happened?
  3. No public evidence of [specific skill] — worth validating

What NOT to re-ask (covered in other rounds):
  - Coding ability (covered in Round 2 — technical assessment)
  - Culture fit (covered in Round 3 — HM conversation)
```

**B. Tailored Questions**

5-7 questions generated specifically for this candidate × this role × this interview round:

- Questions are mapped to specific criteria from the role spec
- Each question includes the intent ("This probes their scaling experience") and what a strong vs weak answer looks like
- Questions adapt to the candidate: if the brief shows a gap, there's a question designed to explore it
- Questions avoid redundancy with other interview rounds

**C. Evaluation Rubric**

A scorecard the interviewer fills out during or after the interview:

```
Criteria                    | Rating (1-5) | Evidence / Notes
----------------------------|-------------|------------------
0-to-1 build experience     |     [ ]     |
Distributed systems depth   |     [ ]     |
Leadership & team scaling   |     [ ]     |
Communication clarity       |     [ ]     |
[Custom criterion]          |     [ ]     |

Overall recommendation: [ Strong Hire / Hire / No Hire / Strong No Hire ]
Key concern (if any): _______________
```

The rubric is the same structure across all candidates for a role, ensuring comparability. Ratings are defined (what does "4" mean for "leadership"?) to reduce subjective interpretation.

#### 4.5.2 Interview Round Configuration

When the role is created, the HM defines the interview process:

| Setting | Options | Default |
|---------|---------|---------|
| Number of rounds | 1-5 | 3 |
| Round type | Technical / Behavioural / HM Conversation / Culture / Case Study | — |
| Interviewer per round | Assigned from team | HM for final round |
| Criteria per round | Which role spec criteria are evaluated in this round | Auto-distributed to avoid redundancy |
| Duration per round | 30 / 45 / 60 min | 45 min |

The agent auto-distributes criteria across rounds to prevent the same thing being evaluated multiple times. The HM can override this.

#### 4.5.3 Post-Interview

After each interview:
1. Interviewer submits the evaluation rubric (in-app or via email link)
2. The agent aggregates scores across all completed rounds into a **Candidate Scorecard**
3. After all rounds are complete, the HM sees a summary:
   - Aggregated scores per criterion (across interviewers)
   - Where interviewers agreed and disagreed
   - The agent's recommendation (Hire / No Hire) with reasoning — but clearly labeled as a recommendation, not a decision
4. HM makes the final call

#### 4.5.4 Edge Cases & Safeguards

| Scenario | Behaviour |
|----------|-----------|
| Interviewer doesn't submit evaluation within 24hrs | Reminder notification. After 48hrs, escalate to HM. |
| Interviewers strongly disagree (one says Strong Hire, another Strong No Hire) | Agent flags the disagreement explicitly and suggests a debrief conversation before final decision. |
| Candidate is interviewing for multiple roles | Each role has its own prep package and rubric. No cross-contamination. |
| HM wants to add an ad-hoc interview round | Supported. Agent generates prep for the new round based on what's already been covered. |
| Interview is rescheduled | Prep package is regenerated if the candidate pool or role spec changed since the original was sent. |

#### 4.5.5 Success Criteria (Component 5)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Interviewers who read the prep package before the interview | > 80% | Email open + in-app view tracking |
| Evaluation rubric completion rate | > 90% | Submitted rubrics / completed interviews |
| Inter-interviewer score variance (same candidate, same criteria) | Decreasing over time | Standard deviation of scores |
| HM satisfaction with prep quality | > 4/5 | Post-hire survey |
| Time from final interview to decision | < 2 days | System timestamps |

---

*Sections to follow: Integration architecture, data model, technical requirements, success metrics (system-level), phasing/roadmap.*
