# Product Requirements Document — Retail Frontline Hiring Agent

**Version:** 0.1 (Draft)
**Date:** 2026-05-20
**Author:** Anuj Jain
**Status:** In Progress

---

## 1. Market Context

### 1.1 Target Industry

US grocery/supermarket industry as GTM beachhead, with architecture designed to expand to QSR, apparel, convenience stores, and other frontline segments.

**Grocery is the GTM, not the product constraint.** The product should work across frontline segments but we sell into grocery first because:
- Highest structural complexity (departments, certifications, unions) — if we solve grocery, other segments are simpler subsets
- Mid-market (100-500 stores) is underserved — too small for Workday+Paradox, too big for Indeed+spreadsheets
- Regional chains are concentrated geographically — easier to pilot and expand
- Hiring is perpetual (not seasonal) — year-round revenue, not seasonal spikes

### 1.2 Market Size

**US Grocery Industry:**
- ~45,000 supermarket stores (FMI definition)
- ~2.88 million total employees; ~2.3-2.4 million frontline/hourly (80-85%)
- $883B total industry revenue (2025)
- 55-70% of grocery employees are part-time
- Annual frontline turnover: 60-76%

**Target Segment — Mid-Market Grocery (50-500 stores):**
- ~55-85 grocery chains
- ~7,500-12,000 stores
- ~300-500K frontline employees
- ~$115-195M in annual recruiting spend
- **SAM: ~$120-200M**

**Key mid-market chains (non-union, 100-500 stores):**

| Company | Stores | Revenue | Notes |
|---------|--------|---------|-------|
| Wegmans | ~110 | ~$12.5B | Northeast, private |
| WinCo Foods | ~142 | ~$9.8B | Western US, employee-owned |
| Hy-Vee | ~280 | ~$10.1B | Midwest, employee-owned |
| Sprouts Farmers Market | ~480 | ~$8.8B | Natural/specialty, public |
| Stater Bros. | ~169 | ~$3.8B | Southern California |
| Schnucks | ~115 | ~$2.1B | MO/IL/IN/WI |

**Expansion TAM (all US frontline):** $1-3B+ across grocery, QSR, apparel, convenience, healthcare, warehousing.

### 1.3 Competitive Landscape

| Platform | Focus | Positioning | Gap |
|----------|-------|------------|-----|
| **Paradox/Olivia (Workday)** | Enterprise conversational AI | 24/7 SMS screening + scheduling. Acquired by Workday Oct 2025. | $25K-$100K+/yr, slow to configure, requires support tickets for changes. Enterprise-only. |
| **Fountain** | Enterprise frontline hiring | 1.2M+ workers/year, 78 countries, AI voice interviews | Enterprise-focused, less accessible for mid-market |
| **Workstream** | QSR/hourly hiring | 46 of top 50 QSR brands, fast setup, combined HR/payroll | Narrower outside restaurant/QSR |
| **Snagajob** | Hourly job marketplace | Large hourly candidate network | Marketplace, limited workflow automation |
| **iCIMS** | Enterprise ATS + SMS | 4,300+ customers, frontline features | Legacy ATS with bolt-on features, not purpose-built for speed |
| **Traditional ATS (Taleo, Workday)** | Enterprise HR | Installed base at large chains | Hostile to mobile, slow, recruiter-centric |

**Mid-market gap:** No purpose-built, AI-first hiring tool for 50-500 store grocery/retail chains. They either overpay for enterprise tools or cobble together Indeed + phone calls + spreadsheets.

---

## 2. Problem Statement

### 2.1 The Core Problem

Grocery companies don't have a candidate supply problem — they have a candidate conversion problem. The funnel is full; the pipe leaks.

Applications-per-hire nearly doubled from 46 (2021) to 95 (2025). Yet the average time-to-hire for frontline grocery roles is 21-30 days. Best-in-class (Paradox customers) achieve 3.5 days. The best candidates are off the market within 48 hours. If your process takes 21 days, you're hiring the people nobody else wanted.

### 2.2 The Hiring Funnel — Where Candidates Die

```
100 people click a job ad
  → 6 complete the application                    [94% lost — form friction]
  → 0.5 get screened                              [92% of applicants never screened]
  → 0.18 get to interview                         [37% screen-to-interview]
  → 0.09 get an offer                             [47.5% interview-to-offer]
  → 0.06 accept and show up                       [69% offer acceptance]
```

### 2.3 Why Candidates Drop Off

| Drop-off Point | % of All Dropout | Root Cause |
|----------------|-----------------|------------|
| **Application abandonment** | 14% | Form too long (50%), no pay transparency (31%), uncertain about qualifications (35%) |
| **Scheduling** | 20% | Too slow. 42% of candidates withdraw because scheduling took too long |
| **Interview no-show** | 32% (biggest leak) | Candidate already took another job. Best candidates gone in 48 hours; avg process takes 21-30 days |
| **Onboarding dropout** | 18% | 12% no-show on day 1. 43% of frontline workers leave within 90 days |
| **Poor communication** | 22% (cross-cutting) | 34% of candidates assume they've been ghosted after just one week of silence |

### 2.4 The Store Manager Burden

The store manager is the de facto hiring manager for frontline roles, but they are running a store — not a recruiting operation.

- **3-10+ hours/week** on shift scheduling alone (58% of managers)
- **3-10+ hours/week** on time-and-attendance (52% of managers)
- Interview scheduling, phone screens, and hiring admin stack on top
- **64% of managers** say they'd reinvest freed-up time in coaching and operations

The store manager's only high-value contribution to hiring is a 15-minute in-person conversation with a pre-qualified candidate. Everything else — posting, screening, scheduling, communicating, paperwork — should be automated.

### 2.5 The Cost of the Problem

For a grocery chain with 10,000 frontline workers at 76% annual turnover:

| Metric | Value |
|--------|-------|
| Hires needed per year | ~7,600 |
| Direct cost per hire | ~$480 ($320 job boards + $160 manager time) |
| Direct recruiting cost per year | ~$3.6M |
| Total turnover cost per year (incl. training, lost productivity) | ~$40M |
| Cost lost before employees even contribute | ~$18M (45% of total) |
| Average turnover cost per store | ~$67,000/year |

### 2.6 What Existing Tools Don't Solve

- **Traditional ATS (Taleo, Workday Recruiting):** Desktop-oriented, recruiter-centric, hostile to mobile applicants. Not designed for speed or store manager use.
- **AI overlays (Paradox, Fountain):** Proven at enterprise scale but priced out of mid-market ($25K-$100K+/yr). Require dedicated TA teams to configure and maintain.
- **Job boards (Indeed, Snagajob):** Solve top-of-funnel only. Once a candidate applies, the job board's job is done. The post-application black hole is untouched.
- **None of them solve the perpetual hiring problem.** Every tool treats hiring as episodic (open req → fill → close). With 60-76% annual turnover, grocery hiring is continuous — the system should always have pre-qualified candidates ready.

---

## 3. Key Objectives

### 3.1 North Star Metric

**Time-to-hire:** The elapsed time from a candidate applying to their first day on the job.

Target: **< 5 days** from application to start date (vs. 21-30 day industry average).

Everything we build should compress this timeline. Every feature decision should be tested against: "Does this reduce time-to-hire, or does it add process?"

### 3.2 Specific Goals

1. **Compress apply-to-interview from days to minutes.** Candidate applies via SMS/mobile in <2 minutes. AI screens instantly. Qualified candidates get a scheduling link within minutes, not days.

2. **Take hiring off the store manager's plate.** The manager's only job is a 15-minute conversation with a pre-qualified, pre-scheduled candidate. Everything else — posting, screening, scheduling, communication, paperwork — is automated.

3. **Eliminate the communication black hole.** Every candidate gets instant acknowledgment, real-time status updates, and a definitive outcome (yes/no) within 48 hours. No ghosting. No silence.

4. **Match on availability and fit before anything else.** Don't waste time screening a candidate who can't work the shifts you need. Shift availability matching is the first filter, not the last.

5. **Build a perpetual talent pool.** Stop treating every hire as a new search. Former employees, past applicants, and nearby candidates are always in the pool — pre-qualified and ready to be activated when a spot opens.

---

## 4. Grocery-Specific Requirements

These features are needed for grocery but designed as configurable modules that can be turned off for simpler segments (QSR, apparel, c-stores).

### 4.1 Department-Level Role Taxonomy

Grocery stores hire across 8-10 departments, each with distinct requirements:

| Department | Example Roles | Special Requirements |
|------------|--------------|---------------------|
| Front-end | Cashier, bagger, customer service | Age 16+ for register, basic math |
| Grocery/Stocking | Stocker, receiver, overnight crew | Physical requirements (lifting 50+ lbs), early morning/overnight shifts |
| Deli | Deli clerk, food prep | Food handler permit, age 18+ (slicer operation) |
| Bakery | Baker, cake decorator | Food handler permit, early morning shifts (4-5am start) |
| Meat/Seafood | Butcher, meat cutter, seafood clerk | Food handler permit, age 18+ (equipment), specialized skills |
| Produce | Produce clerk | Food handler permit in some states |
| Pharmacy | Pharmacy tech, pharmacy clerk | State pharmacy tech license, background check |
| Floral | Floral designer | Minimal requirements |
| Online/Pickup | Personal shopper, delivery driver | Driver's license for delivery roles |

The system must:
- Allow store managers to post by department, not just "store associate"
- Track which certifications each role requires (by state)
- Enforce age restrictions per department
- Match candidates to departments based on their qualifications and availability

### 4.2 Certification Tracking

| Certification | Required For | Typical Requirement |
|---------------|-------------|-------------------|
| Food handler permit | Deli, bakery, meat, produce, prepared foods | Within 14-60 days of hire (varies by state) |
| Alcohol sales certification | Any role selling alcohol | Required in states like UT, OR, WA; recommended everywhere |
| Pharmacy technician license | Pharmacy | State-issued, pre-hire requirement |
| Forklift certification | Warehouse/receiving | OSHA requirement, can be trained post-hire |

The system should:
- Flag which certs a candidate already has (self-reported at application)
- Track cert expiration dates for existing employees
- Warn if a candidate is being placed in a role requiring a cert they don't have
- Surface candidates who already have relevant certs (faster to deploy)

### 4.3 Age Restriction Rules

- Minors (under 18) cannot operate: meat slicers, balers, compactors, forklifts, bakery ovens (in some jurisdictions)
- Work hour limits for minors vary by state (e.g., max 8 hrs/day on school days in CA)
- System must: prevent scheduling minors in restricted departments or shifts, flag age-related compliance issues

### 4.4 Union Considerations (v2)

For v1, target non-union chains. For v2:
- Seniority-based scheduling rules (UFCW contracts)
- Union pay scale compliance
- Grievance procedure documentation
- Posting requirements (internal posting periods before external)

---

## 5. What We Are Building (High-Level)

*To be defined — see Section 6 for detailed component specs.*

### 5.1 Scope Boundaries

**What we ARE building (v1 — phased across MVP through Production, see Section 10 for phasing):**

MVP (Phase 1):
- SMS/mobile-first application (sub-2-minute)
- AI-powered instant screening (availability, eligibility, department match)
- Self-service interview scheduling
- Automated candidate communication (every stage, no silence)
- Store manager dashboard (review pre-qualified candidates, confirm hires)
- Phone-based candidate identity resolution (match returning applicants by phone number)

Phase 2 (Production):
- Perpetual talent pool (former employees, past applicants, warm candidates)
- Boomerang detection via HRIS integration
- HRIS-based identity resolution (cross-reference former employee records)
- LLM-powered conversational screening

**What we are NOT building (v1):**
- Job board / candidate sourcing — candidates come from Indeed, career pages, walk-ins, referrals
- Payroll or HRIS — we integrate with existing systems (ADP, UKG, Dayforce)
- Shift scheduling / workforce management — we match availability at hire time, not ongoing scheduling
- Onboarding workflows — we hand off to existing onboarding systems post-hire
- Union rule engine — v2 feature

### 5.2 User Roles

| Role | Primary Interactions | Tool Relationship |
|------|---------------------|-------------------|
| **Store Manager** | Reviews pre-qualified candidates, does 15-min conversation, confirms hire | **Primary user.** Tool takes hiring off their plate. |
| **Regional/District Manager** | Views hiring metrics across stores, approves new headcount reqs (if configured), escalation for unfilled roles | **Approval + dashboard user.** Monitors, approves when required. |
| **Corporate TA/HR** | Configures role templates, compliance rules, job distribution, approval workflows. Monitors metrics. | **Admin user.** Sets up once, monitors ongoing. |
| **Candidate** | Applies via SMS/mobile, answers screening questions, self-schedules, receives status updates | **End user.** Experiences the system through SMS and a lightweight web flow. |

### 5.3 Product Model

**Enterprise B2B hiring tool**, sold directly to grocery chain HR/TA leadership.

- We are NOT building a worker marketplace or talent network
- Candidate data belongs to the employer (per-tenant isolation)
- Revenue model: per-store or per-hire SaaS pricing, sold to corporate HR
- Candidates authenticate via phone number + OTP — no password, no account creation, no login wall
- Company employees (store managers, corporate HR) authenticate via Google SSO

**Why not a marketplace:** Frontline workers have no intrinsic motivation to build profiles on a platform (unlike LinkedIn for knowledge workers). A marketplace requires solving a chicken-and-egg cold start problem ($2-5M, 12-18 months) before generating revenue. An enterprise tool has a clear buyer (VP HR), clear value prop (reduce time-to-hire, save store manager time), and generates revenue in 3-6 months.

**Future optionality:** If we later see value in cross-employer talent sharing, the data model should not preclude it — but we are not designing for it or promising it. That's a different product with a different GTM.

---

## 6. System Components

Eight components, each designed around a single principle: **compress time-to-hire from 21 days to <5 days.**

### 6.0 Candidate Identity & History (Single View)

**Purpose:** Every person who ever interacts with the system — applicant, former employee, declined candidate, no-show — has ONE canonical record. When someone applies, the system instantly matches them against all historical data and presents a unified view.

**Why This Is Foundational:**
- A person might apply to Store #12 as a cashier, get declined, then apply to Store #47 for deli 3 months later. Without identity resolution, that's two strangers. With it, that's one person with context.
- Former employees re-applying should not go through the full process again. The system already knows their work history, performance, departure reason, and rehire eligibility.
- Store managers making a hire/pass decision need the full picture — not just this application in isolation.

**Identity Resolution:**

```
New application received
  │
  ├─ [Step 1] Phone number match (primary key) ← MVP (Phase 1)
  │   - Phone number is the strongest identifier for frontline candidates
  │   - Exact match → link to existing candidate record
  │
  ├─ [Step 2] Fuzzy match (if no phone match) ← MVP (Phase 1)
  │   - Name + zip code + age combination
  │   - Catches: new phone number, applied via different channel
  │   - Low-confidence matches flagged, not auto-merged
  │
  ├─ [Step 3] HRIS cross-reference ← Phase 2 (requires HRIS integration)
  │   - Match against imported former employee records (ADP, UKG, Dayforce)
  │   - Match by: phone, email, SSN last-4 (if available from HRIS), name + DOB
  │   - Positive match → tag as "Former Employee" with employment history
  │
  └─ [Output] Candidate record is either:
      - LINKED to existing record (all history preserved)
      - NEW (first-time applicant, no prior history)
```

**Phasing Note:** In MVP, identity resolution uses only phone number and fuzzy matching against candidates already in our system (prior applicants). HRIS cross-referencing for former employee detection requires the Phase 2 HRIS integration.

**What Gets Stored on the Canonical Record:**

| Data | Source | Persists Across |
|------|--------|----------------|
| All past applications (role, store, date, outcome) | System | All applications |
| Screening results and scores per application | System | All applications |
| Interview history (scheduled, attended, no-showed) | System | All applications |
| Manager decisions and notes | System | All applications |
| Employment history with this chain (dates, department, separation reason, rehire eligibility) | HRIS import | Employment + applications |
| Certifications (self-reported + verified) | Application + HRIS | All applications — no need to re-collect |
| Availability (latest stated) | Most recent application | Updated each time |
| Communication history (all SMS/email sent and received) | System | All interactions |

**Single View — What the Store Manager Sees:**

When a manager opens a candidate card, they see the full history at a glance:

```
┌──────────────────────────────────────────────────┐
│  Maria Garcia                                     │
│  📱 (585) 555-0147 │ Rochester, NY 14620         │
│  Age: 24 │ Food handler cert ✓ (exp: 2027-03)    │
├──────────────────────────────────────────────────┤
│                                                   │
│  ⚡ CURRENT APPLICATION                           │
│  Deli Clerk — Store #47 │ Applied: May 30, 2026  │
│  Score: 87 │ Status: HOT — scheduling link sent   │
│  Availability: Mon-Fri mornings                   │
│                                                   │
│  📋 HISTORY WITH WEGMANS                          │
│  ┌────────────────────────────────────────────┐   │
│  │ 🟢 Employed: Store #12 │ Cashier           │   │
│  │    Mar 2024 – Jan 2026 (1 yr 10 mo)       │   │
│  │    Left: Voluntary (relocated)              │   │
│  │    Rehire eligible: Yes                     │   │
│  │    Manager note: "Reliable, always on time" │   │
│  ├────────────────────────────────────────────┤   │
│  │ 🔵 Applied: Store #23 │ Produce Clerk      │   │
│  │    Oct 2025 │ Score: 71 │ WARM → Declined  │   │
│  │    Reason: No availability overlap          │   │
│  └────────────────────────────────────────────┘   │
│                                                   │
│  [Schedule Interview]  [Pass]                     │
│                                                   │
└──────────────────────────────────────────────────┘
```

**How This Changes the Screening Pipeline:**

Identity resolution runs BEFORE any screening filters. The pipeline becomes:

```
Application received
  │
  ├─ [Step 0] Identity Resolution (NEW — see above)
  │   - Match against all prior candidates + HRIS records
  │   - If former employee in good standing → BOOMERANG FAST-TRACK
  │   - If prior applicant → enrich with historical data
  │   - Attach full history to candidate record
  │
  ├─ [Filter 1] Hard Disqualifiers ...
  ├─ [Filter 2] Availability Match ...
  ├─ [Filter 3] Qualification Scoring ...
  │   - Historical data now feeds scoring:
  │     • Prior employment → +15 points (on top of boomerang bonus)
  │     • Previously interviewed → +5 points (showed commitment)
  │     • Prior no-show → -10 points (risk flag)
  │     • Previously declined by manager → flag for review (WARM, not auto-HOT)
  │
  └─ [Output] Candidate Categorization (HOT / WARM / COLD)
```

**Re-Application Fast Paths:**

| Scenario | What Happens | Time Saved |
|----------|-------------|------------|
| Former employee, good standing, rehire eligible | Skip screening entirely. Manager gets notification with full history. One-tap to schedule. | ~95% — hire in hours, not days |
| Prior applicant, previously WARM/HOT, new role | Skip data collection (already have info). Re-screen against new role only. | ~60% — no SMS conversation needed |
| Prior applicant, previously COLD (availability mismatch) | Re-screen with updated availability. Prior data pre-filled. | ~40% — shorter conversation |
| Prior no-show | Flag for manager review. Not auto-rejected, but manager sees the history. | N/A — manager decides |

**Data Isolation (Multi-Tenancy):**
- Candidate history is scoped to the tenant (grocery chain). Wegmans cannot see that Maria also applied to Hy-Vee.
- Within a tenant, history spans all stores. Store #47 can see that Maria worked at Store #12.
- This is an enterprise tool, not a marketplace — no cross-employer data sharing.

### 6.1 Conversational Application Flow

**Purpose:** Replace the 15-minute desktop application form with a sub-2-minute conversational flow.

**Channel Architecture:**

The application flow is channel-agnostic. The conversation logic, data collection, and screening pipeline are the same regardless of channel. The admin configures which channels are active per tenant.

| Channel | Status | When to Use |
|---------|--------|-------------|
| **SMS** | Default for v1 | Primary channel for US grocery. 97% phone ownership, 98% open rate. |
| **WhatsApp** | Phase 2 | Higher engagement for Hispanic/Latino workforce (~25% of grocery frontline). International expansion. |
| **Web chat** | MVP (fallback) | Embedded on career page. Same conversational flow, rendered as chat widget. |
| **Email** | MVP (outbound only) | Backup for longer content (offer details, onboarding docs). Not used for application. |

**Why SMS is the default (not an app):**
- 97% of Americans own a cellphone; SMS works on every phone, no download
- Frontline candidates are applying from their phone, often between shifts or on a bus
- SMS open rates: 98% (vs. 20% for email)
- Paradox proved this model works — their highest-converting flow is SMS-based

**Candidate Journey:**

```
1. Candidate sees job posting (Indeed, career page, in-store QR code, referral link)
2. Clicks link or texts keyword to shortcode (e.g., "TEXT JOBS to 55555")
3. System sends first message: "Hi! Thanks for your interest in [Store Name]. 
   Let's get you started — this takes about 2 minutes. What's your first name?"
4. Conversational flow collects:
   - Name
   - Age (for compliance — not screening bias)
   - Location / zip code
   - Availability (days + time slots: morning/afternoon/evening/overnight)
   - Department interest (if multiple openings)
   - Relevant certifications (food handler, etc.)
   - Work authorization (yes/no)
   - Prior grocery/retail experience (optional)
5. System confirms: "Got it, [Name]! You're applying for [Role] at [Store]. 
   We'll review your info and get back to you shortly."
6. → Triggers instant screening (Section 6.2)
```

**Design Principles:**
- **Conversational, not form-based.** Each question is one message. Candidate replies naturally. LLM parses responses (handles "yeah I can do mornings and weekends" → availability slots).
- **No login, no account, no app.** Candidate's phone number is their identity.
- **Graceful fallback.** If candidate prefers web, the same flow renders as a mobile-optimized web form (same questions, same data captured).
- **Multi-language support (Phase 3).** Spanish at minimum for grocery — 25%+ of frontline grocery workers are Hispanic/Latino.

**Key Metrics:**
- Application completion rate (target: >80%, vs. 6% industry average)
- Time to complete (target: <2 minutes)
- Drop-off point tracking (which question causes abandonment)

---

### 6.2 AI Screening Engine

**Purpose:** Instantly evaluate every applicant against role requirements and store needs. No human touches the process unless the AI is uncertain.

**Screening is NOT "AI interviewing."** We're not asking behavioral questions or evaluating personality. We're matching structured data — does this candidate's availability, location, age, and certifications fit the open role at this specific store?

**Screening Pipeline:**

```
Application received
  │
  ├─ [Step 0] Identity Resolution (see Section 6.0)
  │   - Match against all prior candidates + HRIS records
  │   - If former employee in good standing → BOOMERANG FAST-TRACK (skip to scheduling)
  │   - If prior applicant → enrich with historical data, pre-fill known fields
  │   - Attach full history to candidate record
  │
  ├─ [Filter 1] Hard Disqualifiers (rules-based, no AI)
  │   - Under minimum age for role (e.g., 18+ for deli)
  │   - Outside commute radius (>30 min / configurable per store)
  │   - No work authorization
  │   - Missing pre-hire certification (pharmacy tech license)
  │   → REJECT with reason. Immediate, kind decline message.
  │
  ├─ [Filter 2] Availability Match (rules-based)
  │   - Compare candidate's stated availability to store's open shifts
  │   - Score: % overlap between candidate availability and unfilled shifts
  │   - <20% overlap → REJECT (can't work when we need them)
  │   - 20-50% overlap → FLAG for review (partial fit)
  │   - >50% overlap → PASS
  │   → This is the highest-signal filter. Eliminates ~40% of otherwise-qualified candidates.
  │
  ├─ [Filter 3] Qualification Scoring (LLM-assisted)
  │   - Department fit: does experience/interest match the department?
  │   - Certification status: has relevant certs vs. needs to obtain
  │   - Experience: prior retail/grocery experience (weighted, not required)
  │   - Historical signals (from identity resolution):
  │     • Prior employment with this chain → +15 points
  │     • Previously interviewed (showed up) → +5 points
  │     • Prior no-show → -10 points (risk flag)
  │     • Previously declined by manager → route to WARM (not auto-HOT)
  │   → Produces a 0-100 fit score per candidate per role
  │
  └─ [Output] Candidate Categorization
      - HOT (score ≥80, passes all filters): Auto-send scheduling link
      - WARM (score 50-79, or flagged): Surface to store manager for review
      - COLD (score <50, or hard disqualified): Decline with respectful message
```

**Boomerang Detection:**
- 33% of retail new hires are returning employees
- Boomerangs have 5.7% turnover vs. 65% for new hires — 11x better retention
- System checks incoming phone number / name against the employer's past employee records
- Former employees in good standing are auto-flagged as HOT regardless of score
- Configurable: employer sets rehire eligibility rules (e.g., "left voluntarily, no write-ups")

**What the AI Does NOT Do:**
- No resume parsing (most frontline candidates don't have resumes)
- No personality assessment or behavioral scoring
- No demographic-based screening (age is used only for legal compliance, not preference)
- No "culture fit" scoring — that's the store manager's job in the 15-minute conversation

**Key Metrics:**
- Screen-to-schedule rate (target: >60% of qualified candidates get a scheduling link within 10 minutes)
- False rejection rate (candidates rejected by AI who would have been hired — tracked via manager overrides)
- Time from application to first screening result (target: <5 minutes)

---

### 6.3 Self-Service Interview Scheduling

**Purpose:** Qualified candidates book their own interview slot immediately — no phone tag, no "we'll call you back," no 5-day scheduling delay.

**Why This Matters:**
- 42% of candidates withdraw because scheduling took too long
- The best candidates are off the market within 48 hours
- Phone tag between store manager and candidate is the #1 time waster

**How It Works:**

**Auto-Schedule Setting (configurable per tenant):**
- **Enabled (default):** HOT candidates receive scheduling link automatically — no manager approval needed.
- **Disabled:** HOT candidates are surfaced to the manager first (like WARM candidates), manager approves before scheduling link is sent. Recommended for the first 30 days of a new deployment while the scoring model calibrates.

```
Candidate categorized as HOT (auto-schedule enabled)
  │
  ├─ System sends SMS: "Great news, [Name]! [Store Manager] would like 
  │   to meet you. Pick a time that works: [link]"
  │
  ├─ Link opens a mobile-optimized calendar showing:
  │   - Store manager's available 15-minute slots (synced from their calendar)
  │   - Next 5-7 days only (urgency — don't let it drift)
  │   - Candidate picks a slot, confirms
  │
  ├─ System confirms to both parties:
  │   - Candidate gets: confirmation SMS + calendar reminder
  │   - Manager gets: notification with candidate summary card
  │
  └─ Automated reminders:
      - 24 hours before: SMS to candidate ("See you tomorrow at [Store] at [time]!")
      - 2 hours before: SMS to candidate ("Quick reminder — your meeting with [Manager] is at [time] today")
      - Day-of morning: notification to manager with day's interview schedule
```

**WARM Candidates:**
- Not auto-scheduled. Surfaced to store manager with candidate card.
- Manager reviews and either: (a) approves → candidate gets scheduling link, or (b) declines → candidate gets respectful decline message.

**Intelligent Escalation (no auto-decline):**

The system never auto-rejects a candidate on the manager's behalf. Instead, it sends increasingly specific reminders with AI-generated reasoning to help the manager decide faster:

| Time Since Flagged | Action |
|-------------------|--------|
| 0h | Candidate card surfaced to manager with fit summary |
| 12h | Reminder: "Maria G. (score 87, food handler cert, Mon-Fri mornings) is waiting for your review. She matches your open Deli Clerk shift." |
| 24h | Urgent reminder: "[X] candidates waiting for review. Top match: [Name] — [1-line reason why they're a good fit]." |
| 48h | Escalate to district manager: "Store #47 has [X] candidates pending review for [Y] days." District manager can approve/decline on behalf. |
| 72h | Candidate receives honest status update: "We're still reviewing your application — we haven't forgotten you." |

The system keeps candidates informed but never closes the door without a human decision.

**Calendar Integration:**
- v1: Store manager sets availability blocks in our system (e.g., "I interview Tue/Thu 2-4pm")
- v1.1: Google Calendar / Outlook sync (read-only — pull busy times, don't push events)
- Slots are 15 minutes — this is a quick conversation, not a formal interview panel

**No-Show Mitigation:**
- Interview no-shows are the biggest leak (32% of all dropout)
- Reminders at 24h and 2h reduce no-shows by 25-30%
- If candidate doesn't confirm reminder, system flags and optionally backfills the slot
- Track no-show rates per candidate source (Indeed vs. referral vs. walk-in) to optimize sourcing

**Key Metrics:**
- Time from screening to scheduled interview (target: <1 hour for HOT candidates)
- Interview no-show rate (target: <20%, vs. 30%+ industry average)
- Scheduling completion rate (% of candidates sent a link who book a slot)

---

### 6.4 Automated Candidate Communication

**Purpose:** No candidate is ever left in silence. Every applicant gets a definitive outcome — yes, no, or "we're reviewing" — within 48 hours.

**The Problem We're Solving:**
- 34% of candidates assume they've been ghosted after just one week of silence
- 22% of all dropout is attributed to poor communication
- Most ATS tools send one confirmation email and then nothing until a human acts

**Communication Timeline:**

| Trigger | Message | Channel | Timing |
|---------|---------|---------|--------|
| Application received | "Thanks [Name]! We received your application for [Role] at [Store]. We'll review and get back to you shortly." | SMS | Instant |
| HOT — passed screening | "Great news! [Manager] wants to meet you. Book a time: [link]" | SMS | Within 10 minutes |
| WARM — needs review | "Your application is being reviewed by the team at [Store]. We'll have an update within 24 hours." | SMS | Within 10 minutes |
| COLD — declined | "Thanks for your interest in [Store], [Name]. Unfortunately, we don't have a match right now for your availability. We'll keep you in mind for future openings." | SMS | Within 1 hour (delayed — not instant rejection) |
| Interview scheduled | Confirmation + calendar details | SMS | Instant |
| Interview reminder (24h) | "See you tomorrow at [Store] at [time]!" | SMS | T-24h |
| Interview reminder (2h) | "Quick reminder — [time] today at [Store]" | SMS | T-2h |
| Post-interview — hired | "[Manager] wants to bring you on board! Here's your offer: [link]" | SMS + email | Within 4 hours of manager decision |
| Post-interview — not hired | "Thanks for coming in, [Name]. We've decided to go with another candidate for this role, but we'd love to keep you in mind for future openings." | SMS | Within 24 hours |
| WARM — no manager action after 48h | Escalate to district manager + send candidate status update ("still reviewing") | SMS + push notification | 48 hours after flagged |

**Design Principles:**
- **Every message is personalized** (candidate name, store name, role, manager name)
- **No message reads like a system notification.** Tone is warm, direct, human-sounding.
- **Decline messages are kind but definitive.** No "we'll keep your resume on file" unless we actually will (talent pool eligible).
- **SMS is primary channel.** Email is backup for longer content (offer details, onboarding docs).
- **Cold declines are delayed by 1 hour.** Instant rejection feels bad. A short delay feels like someone actually reviewed it.

**Key Metrics:**
- Candidate NPS / satisfaction (post-process survey via SMS)
- Time to first response (target: <10 minutes)
- Time to definitive outcome (target: <48 hours for all candidates)
- Ghosting rate (% of candidates who never receive a final yes/no — target: 0%)

---

### 6.5 Store Manager Dashboard

**Purpose:** Give the store manager a dead-simple interface to review candidates, confirm hires, and see hiring status — without any admin work.

**Design Philosophy:**
- The store manager is running a store. They have 5 minutes between tasks, not 30 minutes at a desk.
- **Mobile-first.** The dashboard must work on a phone. Most store managers don't have a desk computer.
- **Zero training required.** If it needs a tutorial, it's too complex.
- **The system does the work. The manager makes decisions.** No data entry, no form filling, no status updates.

**What the Manager Sees:**

```
┌─────────────────────────────────────────────┐
│  🏪 Wegmans #47 — Rochester, NY            │
│  Hiring Dashboard                           │
├─────────────────────────────────────────────┤
│                                             │
│  TODAY'S INTERVIEWS (2)                     │
│  ┌──────────────────────────────────────┐   │
│  │ Maria G. — Deli Clerk                │   │
│  │ 2:00 PM │ Food handler ✓ │ Score: 87│   │
│  │ Avail: Mon-Fri mornings              │   │
│  │ [View Details]                       │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ James T. — Cashier                   │   │
│  │ 3:15 PM │ Age 17 │ Score: 72         │   │
│  │ Avail: Evenings + weekends           │   │
│  │ [View Details]                       │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  NEEDS YOUR REVIEW (3 warm candidates)      │
│  ┌──────────────────────────────────────┐   │
│  │ Sarah K. — Bakery │ Score: 64        │   │
│  │ Flag: No food handler cert yet       │   │
│  │ [Schedule Interview] [Pass]          │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  OPEN ROLES (5)                             │
│  Deli Clerk (1) · Cashier (2) ·             │
│  Stocker - overnight (1) · Produce (1)      │
│                                             │
│  THIS WEEK: 4 applied · 2 scheduled ·       │
│  1 hired · Avg time-to-hire: 3.2 days       │
│                                             │
└─────────────────────────────────────────────┘
```

**Manager Actions (exhaustive list — this is ALL they can do):**
1. **Review WARM candidates** → Schedule interview or Pass
2. **Post-interview decision** → Hire (with start date + department) or Decline (with optional reason)
3. **Set availability blocks** for interviews (e.g., "Tue/Thu 2-4pm")
4. **View candidate detail card** before an interview (summary, availability, certs, flags)
5. **View store hiring metrics** (open roles, pipeline, time-to-hire)

**What the Manager Does NOT Do:**
- Post jobs (done by corporate TA/HR via templates)
- Screen candidates (done by AI)
- Schedule interviews (done by candidate self-service)
- Send messages to candidates (done by system)
- Enter data into forms (nothing to fill out)
- Update candidate status (system tracks automatically based on manager actions)

**Notifications:**
- New WARM candidate needs review → push notification
- Interview in 30 minutes → push notification
- Candidate no-showed → notification with option to reschedule or pass
- Role unfilled for >7 days → nudge with pipeline summary

**Key Metrics:**
- Manager time spent on hiring per week (target: <30 minutes, vs. 3-10+ hours)
- WARM candidate review time (target: <24 hours from notification)
- Manager adoption rate (% of managers actively using dashboard weekly)

---

### 6.6 Requisition & Offer Workflows

**Purpose:** Define how positions are created and how the hire/offer step works end-to-end. These are the bookends of the pipeline — requisition opens it, offer closes it.

#### How Requisitions Work Today (Current State)

There are three triggers for a new requisition. Each follows a different path through the organization:

**Trigger 1: Backfill (~90% of all reqs)**

Someone quit, was fired, no-showed permanently, or transferred. This is the overwhelming majority given 60-76% annual turnover.

| Step | Who | What Happens | Time |
|------|-----|-------------|------|
| 1. Departure | Employee | Quits, is terminated, or stops showing up | Day 0 |
| 2. Gap recognized | Store Manager | Realizes they're short on a shift. Covers it themselves or scrambles. | Day 0 |
| 3. Decision to backfill | Store Manager | Decides to replace. Most chains give blanket authority for replacement hires; some require district manager sign-off. | Day 0-2 |
| 4. Approval (if needed) | District Manager | Email, phone call, or conversation. Not urgent to them — they manage 10-15 stores. | Day 1-5 |
| 5. Job posted | Store Manager or HR | Logs into Indeed, types up a posting, or puts a sign in the window. No template, no system. | Day 3-7 |
| 6. Hiring begins | Store Manager | Phone screens, scheduling, interviews — all manual | Day 7+ |

**Result:** 3-7 days from departure to first candidate in pipeline. Store is understaffed the entire time.

**Trigger 2: New Headcount (~5-8% of reqs)**

Store needs additional staff — not replacing someone, but adding positions. New department, expanded hours, volume increase.

| Step | Who | What Happens | Time |
|------|-----|-------------|------|
| 1. Need identified | Store Manager or District Manager | "We need another deli clerk — volume is up 20%" | Week 1 |
| 2. Justification | Store Manager | Writes up a case (email, spreadsheet, or conversation) | Week 1-2 |
| 3. Approval chain | District Manager → Regional VP or Corporate HR | Budget approval required. Often slow — multiple meetings, competing priorities. | Week 2-4 |
| 4. Job posted | Same as backfill | | Week 4-6 |

**Result:** 2-6 weeks before first candidate. This is acceptable — new headcount isn't urgent like backfill.

**Trigger 3: Seasonal / Planned (~2-5% of reqs)**

Holiday rush, summer, back-to-school. Predictable and planned at corporate/regional level.

| Step | Who | What Happens | Time |
|------|-----|-------------|------|
| 1. Planning | Corporate HR + Regional Managers | Headcount targets set per store based on historical volume | 4-8 weeks before season |
| 2. Allocation | Regional Manager | "Store #47 needs 5 seasonal hires for summer" | 4-6 weeks before |
| 3. Bulk posting | Corporate HR or Store Managers | Reqs created en masse | 3-4 weeks before |

**Result:** Most organized trigger, but still mostly manual.

**Core Problems With Current Process:**
- 3-7 day lag between departure and posting for backfills — the store is understaffed the entire time
- No system of record at most mid-market chains — the "req" is an email, a conversation, or an Indeed posting
- Store manager is the bottleneck for every step — they feel the pain, initiate the req, post the job, AND run the hiring process
- No visibility across the chain — no one can see: how many open positions, how long they've been open, which stores are most understaffed

#### Requisition Creation (Our System)

**Design principle:** For backfills (90% of all reqs), the time from "someone left" to "candidates are being screened" should be under 1 hour, not under 1 week.

**Role Templates (set up by Corporate TA/HR):**

Corporate HR creates role templates for each department. Templates contain everything the system needs to screen candidates.

**Template access is admin-configurable:** Corporate HR decides whether store managers can only select from pre-defined templates, or also create/edit their own. Default: store managers pick from corporate templates only. Chains that want more store-level autonomy can enable manager template editing.

| Field | Source | Example |
|-------|--------|---------|
| Role name | Corporate-defined | "Deli Clerk" |
| Department | Corporate-defined | Deli |
| Pay range | Corporate-defined (per region) | $15-17/hr |
| Certifications required | Corporate-defined (per state) | Food handler (within 30 days of hire) |
| Age restriction | Corporate-defined | 18+ |
| Physical requirements | Corporate-defined | Standing 8 hrs, lifting 30 lbs |
| Default shift options | Corporate-defined | Morning (6am-2pm), Afternoon (2pm-10pm) |

**Requisition Triggers — What Our System Does:**

| Trigger | How It Works | Approval | Phase |
|---------|-------------|----------|-------|
| **Backfill (manual)** | Manager opens dashboard → taps "New Req" → picks department → picks role template → selects shift need → confirms. Total: 3 taps, <30 seconds. | No approval needed — replacing existing headcount. Req is instantly `Open`. | MVP |
| **Backfill (auto-detected)** | HRIS reports a separation. System auto-creates a draft req from the matching role template. Manager gets notification: "Looks like [Name] left the deli team. Backfill? [Yes / Not now]." One tap to activate. | Manager confirms with one tap. No upward approval. | Phase 2 |
| **New headcount** | Same creation flow as manual backfill, but manager selects "New position" instead of "Replacement." | Routes to District Manager for approval. DM gets push notification, approves/declines from phone. If no action in 48h, system sends reminder. | MVP |
| **Seasonal (bulk)** | Corporate HR sets seasonal hiring targets per store and date range. System auto-creates reqs at the configured time. Store managers get notification with their targets. | Pre-approved by corporate. Store manager can adjust headcount within range. | Phase 3 |

**What a Requisition Contains:**

| Field | Source | Example |
|-------|--------|---------|
| Role template | Corporate-defined | "Deli Clerk" |
| Store | Manager's assigned store | Store #47 — Rochester, NY |
| Department | From template | Deli |
| Headcount | Manager input | 1 |
| Shift needs | Manager input (from predefined options) | Mornings, Mon-Fri |
| Pay range | Corporate-defined (per template, per region) | $15-17/hr |
| Certifications required | From template | Food handler (within 30 days of hire) |
| Age restriction | From template | 18+ |
| Req type | System-set | Backfill / New headcount / Seasonal |
| Status | System-managed | Draft → Open → Filled → Closed |
| Target start date | Manager input (optional) | "ASAP" or specific date |

**Requisition Lifecycle:**
- `Draft` → auto-created by system, awaiting manager confirmation (Phase 2 only)
- `Pending Approval` → new headcount req waiting for district manager sign-off
- `Open` → actively accepting and screening candidates. If talent pool has matches, they're activated immediately.
- `Filled` → manager confirmed a hire; stop screening new applicants, decline remaining pipeline
- `Closed` → position no longer needed (cancelled by manager or corporate)

**What Happens When a Req Opens:**

```
Requisition status → Open
  │
  ├─ [Immediate] Talent pool scan
  │   - System checks talent pool for candidates matching this role's
  │     requirements (location, availability, certs, department experience)
  │   - Matched candidates get re-engagement SMS (see Section 6.7)
  │   - Former employees get boomerang fast-track (Phase 2)
  │
  ├─ [Immediate] Job distribution
  │   - Posting auto-published to: company career page, Indeed (via API)
  │   - Store manager does NOT manually post anywhere
  │
  ├─ [Ongoing] Incoming candidates screened against this req
  │   - New applications flow through screening pipeline (Section 6.2)
  │   - HOT candidates auto-scheduled, WARM surfaced to manager
  │
  └─ [Monitoring] Unfilled req alerts
      - Day 3: system nudges manager if no interviews scheduled
      - Day 7: escalation to district manager — "Store #47 has had 
        Deli Clerk open for 7 days, 0 interviews scheduled"
      - Day 14: corporate HR visibility — flagged in chain-wide dashboard
```

#### Offer & Hire Workflow

```
Manager taps "Hire" on candidate card (post-interview)
  │
  ├─ System prompts manager for:
  │   - Start date (default: next available Monday, or ASAP)
  │   - Department + role (pre-filled from requisition)
  │   - Scheduled hours / shift (from available shift slots)
  │   - Pay rate (pre-filled from template range, manager can adjust within range)
  │
  ├─ System generates offer and sends to candidate:
  │   - SMS: "Great news, [Name]! [Store] is offering you the [Role] position. 
  │     $[rate]/hr, starting [date]. View details and confirm: [link]"
  │   - Link opens mobile page with: role, pay, schedule, start date, 
  │     store address, what to bring on day 1
  │   - Candidate taps "Accept" or "Decline"
  │
  ├─ If candidate accepts:
  │   - Manager notified: "[Name] accepted! Starting [date]."
  │   - Requisition status → Filled (if headcount met)
  │   - New hire record pushed to HRIS (Phase 2) or available as CSV export (MVP)
  │   - Onboarding handoff triggered (Phase 3)
  │   - Remaining pipeline candidates for this req → auto-declined with message
  │
  ├─ If candidate declines:
  │   - Manager notified with reason (if provided)
  │   - Requisition stays Open
  │   - Candidate moved to talent pool (if eligible)
  │   - Next HOT/WARM candidate in pipeline surfaced to manager
  │
  └─ If no response within 48 hours:
      - Reminder SMS sent at 24h
      - At 48h, offer expires. Manager notified. Req stays Open.
      - Candidate added to talent pool.
```

**Offer Letter Generation & Onboarding Handoff:**

| Capability | Phase | How |
|------------|-------|-----|
| **Lightweight offer confirmation** (role, pay, schedule, start date via SMS + web page) | MVP | Built-in — no integration needed |
| **Formal offer letter generation** (branded PDF with legal language, e-signature) | Phase 2 | Integration with DocuSign, PandaDoc, or BambooHR. System auto-populates template with candidate + role data. Candidate signs from phone. |
| **Onboarding handoff** (push new hire record to onboarding system, trigger training assignments, I-9/tax forms) | Phase 2 | Integration with HRIS (ADP, UKG, Dayforce) and/or onboarding tools (BambooHR, Paycom). New hire record pushed automatically on offer acceptance. |
| **Background check initiation** | Phase 3 | Integration with Checkr, Sterling, or similar. Auto-triggered for roles requiring checks (pharmacy, etc.). |

**MVP offer is intentionally lightweight** — confirmation of intent, not a legal document. Phase 2 closes the gap between "candidate accepted" and "candidate is in the employer's HR system" by automating offer letter generation and HRIS push.

---

### 6.7 Perpetual Talent Pool

**Purpose:** Stop treating every hire as a cold start. Maintain a warm pool of pre-qualified candidates who can be activated instantly when a position opens.

**Why This Matters:**
- With 60-76% annual turnover, grocery stores are always hiring. Yet every hire starts from scratch — post on Indeed, wait for applications, screen from zero.
- 33% of retail hires are boomerang employees (returning workers). These people are already known quantities.
- The average grocery store has ~100 employees and needs to replace ~65 per year. That's more than one hire per week, perpetually.

**Pool Sources:**

| Source | How They Enter | Signal Strength |
|--------|---------------|-----------------|
| **Declined candidates (COLD/WARM)** | Automatically added after decline. Opted in via decline message. | Medium — didn't match THIS role, might match another |
| **Former employees** | Imported from HRIS/payroll (ADP, UKG). Matched by phone/email. | High — known quantity, especially if left in good standing |
| **Interview no-shows** | Automatically added. Some had conflicts, not disinterest. | Low — but worth one re-engagement attempt |
| **Candidates who withdrew** | Tracked with withdrawal reason | Medium — timing was wrong, not interest |
| **Employee referrals** | Referred by current employees via SMS link | High — referrals have 2-3x retention |

**How Activation Works:**

```
New position opens (or turnover detected)
  │
  ├─ System scans talent pool for matches:
  │   - Location within commute radius
  │   - Availability overlaps with open shifts
  │   - Qualifications match department requirements
  │   - Not currently employed at this chain (check against active roster)
  │
  ├─ Matched candidates receive re-engagement SMS:
  │   "Hi [Name], [Store] has a new [Role] opening that matches 
  │    your availability. Interested? Reply YES to get started."
  │
  ├─ Candidate replies YES → enters screening pipeline at Filter 2
  │   (skip application — we already have their info)
  │
  └─ Candidate replies NO or doesn't respond → stays in pool, 
      marked as "contacted [date]", not contacted again for 90 days
```

**Pool Hygiene:**
- Candidates age out after 12 months of no engagement (configurable)
- Candidates can opt out at any time ("Reply STOP")
- Contact frequency cap: no more than 1 outreach per 90 days per candidate
- TCPA compliance: all SMS requires prior consent, which is captured at application

**Boomerang Fast-Track:**
- Former employees in good standing skip screening entirely
- System auto-sends: "Hi [Name], [Store] misses you! We have a [Role] opening. Want to come back? [scheduling link]"
- Manager gets notification: "[Name] is interested in returning. They worked here [dates], department: [X], left: [reason]."
- Manager approves or declines. No screening needed.

**Key Metrics:**
- Pool size per store (target: 3-5x annual hires — enough to fill any opening without a job posting)
- Activation rate (% of pool candidates who respond to re-engagement)
- Pool-sourced hires as % of total hires (target: >30% within 12 months of launch)
- Time-to-hire for pool candidates vs. new applicants (target: 50% faster)

---

## 7. AI Architecture

### 7.1 Where AI Adds Value (and Where It Doesn't)

Not everything needs AI. The system uses three types of logic:

| Type | Used For | Examples |
|------|----------|---------|
| **Rules engine** (deterministic) | Hard compliance checks, age restrictions, shift matching | "Under 18 → cannot work deli." "Availability <20% overlap → reject." |
| **LLM** (language understanding) | Parsing conversational SMS responses, generating natural-sounding messages, extracting structured data from unstructured input | Candidate texts "yeah I can do mornings and some weekends" → {morning: true, afternoon: false, evening: false, weekend: partial} |
| **Scoring model** (lightweight ML/heuristics) | Candidate-role fit scoring, pool candidate ranking | Weighted combination of availability overlap, experience, certifications, commute distance, boomerang status |

**Principle: Use the simplest tool that works.** Rules for compliance. LLM for language. Scoring model for ranking. Don't use a $0.03 LLM call where a boolean check suffices.

### 7.2 Conversational AI (SMS Agent)

The SMS screening flow is powered by an LLM, but it is **NOT a chatbot.** It's a structured conversation with a defined goal (collect application data) and guardrails.

**What the LLM handles:**
- Parsing natural language responses into structured fields (availability, experience, etc.)
- Generating contextually appropriate follow-up questions
- Handling unexpected inputs gracefully ("I have a question about pay" → provide info, then redirect)
- Multi-language detection and response (v1.1)

**What the LLM does NOT handle:**
- Screening decisions (rules engine + scoring model)
- Compliance checks (rules engine)
- Any decision that could create legal liability

**Guardrails:**
- LLM output is always parsed into structured data before any screening logic runs
- No screening decision is made by the LLM — it only extracts and structures data
- All LLM-generated candidate-facing messages go through a template system with approved language
- Conversation is bounded: max 10 exchanges. If data isn't collected by then, hand off to web form.
- Fallback: if LLM can't parse a response after 2 attempts, offer structured options ("Reply 1 for mornings, 2 for afternoons...")

### 7.3 Screening Logic

```
Input: Structured candidate data (from SMS agent or web form)
  │
  ├── Rules Engine (deterministic)
  │   ├── Age check (per role, per state)
  │   ├── Work authorization
  │   ├── Required pre-hire certifications
  │   ├── Commute radius
  │   └── → Pass/Fail per rule, with reason codes
  │
  ├── Availability Matcher (algorithmic)
  │   ├── Candidate availability slots vs. store's unfilled shifts
  │   ├── Output: % overlap score (0-100)
  │   └── Configurable thresholds per store
  │
  ├── Fit Scorer (weighted heuristic, upgradeable to ML)
  │   ├── Department experience match (0-25 points)
  │   ├── Certification status (0-20 points)
  │   ├── Availability overlap (0-30 points)
  │   ├── Commute distance (0-15 points)
  │   ├── Boomerang bonus (+15 points if former employee in good standing)
  │   └── Output: composite score 0-100
  │
  └── Categorizer
      ├── Any hard-fail rule → COLD
      ├── Score ≥80 and no flags → HOT
      ├── Score 50-79 or soft flags → WARM
      └── Score <50 → COLD
```

**Calibration:**
- When a store manager overrides the AI (schedules a COLD candidate or declines a HOT one), the system logs the override with reason
- Monthly calibration report: "AI recommended X, manager did Y, outcome was Z"
- Scoring weights are adjustable per chain (corporate TA sets these, not store managers)
- No automated weight adjustment in v1 — manual tuning based on calibration data

---

## 8. Integration Requirements

### 8.1 Inbound (Data We Consume)

| System | Data | Priority | Method |
|--------|------|----------|--------|
| **Indeed / job boards** | Incoming applications (name, phone, basic info) | P0 — v1 | Indeed Apply API or webhook |
| **Career page** | Applications from company website | P0 — v1 | Embedded widget / hosted apply page |
| **HRIS / Payroll (ADP, UKG, Dayforce)** | Former employee records, current roster (for boomerang detection and dedup) | P1 — Phase 2 | API (read-only) |
| **Google Calendar / Outlook** | Manager availability for scheduling | P1 — Phase 2 | Calendar API (read-only) |

### 8.2 Outbound (Data We Push)

| System | Data | Priority | Method |
|--------|------|----------|--------|
| **Messaging gateway (Twilio / bandwidth.com)** | SMS messages (default channel) | P0 — MVP | API |
| **WhatsApp Business API** | WhatsApp messages (additional channel) | P1 — Phase 2 | Meta Business API via Twilio |
| **HRIS / Payroll** | New hire record (name, role, start date, store) | P1 — MVP (CSV), Phase 2 (API) | API or CSV export |
| **E-signature / offer letter (DocuSign, PandaDoc)** | Auto-generated branded offer letter for candidate signature | P1 — Phase 2 | API |
| **Onboarding system (BambooHR, Paycom)** | Hired candidate handoff (docs, training assignments) | P1 — Phase 2 | Webhook or API |
| **Background check provider (Checkr, Sterling)** | Candidate info for roles requiring checks (pharmacy, etc.) | P2 — Phase 3 | API |

### 8.3 What We Don't Integrate With (v1)

- LinkedIn (irrelevant for frontline hiring; API blocked for new partners anyway)
- Shift scheduling systems (WFM tools like Legion, Reflexis) — we match availability at hire, not ongoing scheduling
- Learning management systems (training is post-hire, out of scope)

---

## 9. Success Metrics

### 9.1 Primary Metrics (North Star + Supporting)

| Metric | Current State | Target (6 months post-launch) | How Measured |
|--------|--------------|-------------------------------|--------------|
| **Time-to-hire** (application → start date) | 21-30 days | < 5 days | System timestamps |
| **Application completion rate** | ~6% | > 80% | Completed apps / started apps |
| **Time to first screening result** | Days (manual) | < 5 minutes | System timestamps |
| **Screen-to-schedule rate** (HOT candidates) | N/A | > 60% within 10 min | System timestamps |
| **Interview no-show rate** | 30-40% | < 20% | Scheduled vs. attended |
| **Ghosting rate** (candidates who never get a yes/no) | 50%+ | 0% | Candidates without final status after 48h |

### 9.2 Operational Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Manager time on hiring per week | < 30 minutes | Self-reported + system activity |
| WARM candidate review time | < 24 hours | Time from notification to action |
| Pool-sourced hires (% of total) | > 30% within 12 months | Source tracking |
| AI screening accuracy (manager override rate) | < 15% overrides | Manager actions vs. AI recommendation |
| Candidate satisfaction (NPS) | > 50 | Post-process SMS survey |

### 9.3 Business Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Cost per hire reduction | > 40% reduction | Customer-reported vs. baseline |
| Store manager retention (indirect) | Measurable improvement | Customer HR data |
| 90-day new hire retention | > 65% (vs. ~57% industry) | Customer HR data |

---

## 10. Phasing / Roadmap

### Phase 1 — MVP (Months 1-4)

**Goal:** One pilot chain (3-5 stores), prove time-to-hire compression.

- Requisition creation (manual — store manager creates from role template, 3 taps)
- Role templates (corporate HR configures per department)
- New headcount approval routing (to district manager)
- SMS application flow (text-to-apply)
- Rules-based screening (hard filters + availability matching)
- Basic fit scoring (weighted heuristics, not ML)
- Self-service scheduling (manager sets availability blocks in system)
- Automated SMS communication (full lifecycle)
- Offer workflow (SMS-based offer, candidate accept/decline)
- Store manager dashboard (mobile web)
- Indeed integration (inbound applications)
- Job auto-posting to career page + Indeed when req opens

**Not in MVP:** Talent pool, boomerang detection, auto-detected backfill reqs, calendar sync, HRIS integration, multi-language, seasonal bulk reqs

### Phase 2 — Production (Months 5-8)

**Goal:** Scale to full chain (50-200 stores), add talent pool, close the offer-to-onboarding gap.

- Perpetual talent pool (declined candidates + pool activation)
- Boomerang detection (HRIS integration for former employee matching)
- Auto-detected backfill reqs (HRIS separation → draft req → manager confirms)
- Formal offer letter generation (e-signature integration — DocuSign / PandaDoc)
- Onboarding handoff (push new hire to HRIS / onboarding system on offer acceptance)
- WhatsApp as additional candidate channel
- LLM-powered conversational screening (replace structured SMS with natural conversation)
- Calendar sync (Google/Outlook read-only)
- Corporate admin dashboard (multi-store metrics, role templates)
- Career page widget (embedded application flow)
- Reporting and analytics

### Phase 3 — Scale (Months 9-12)

**Goal:** Second and third grocery chain customers, cross-segment readiness.

- Multi-language support (Spanish)
- Seasonal bulk requisitions (corporate sets targets, system auto-creates reqs)
- Background check integration
- Advanced analytics (source effectiveness, retention prediction)
- Configuration system for non-grocery segments (QSR, apparel, c-store templates)
- API for custom integrations

### Phase 4 — Expansion (Months 12+)

- Union rule engine (v2 feature — seniority, posting requirements)
- Workforce planning integration (connect to WFM for shift-level demand forecasting)
- Employee referral program (SMS-based referral tracking + incentives)
- Cross-segment templates (QSR, apparel, c-store)

---

*Sections to follow: Data model, technical architecture, security & compliance, pricing model.*
