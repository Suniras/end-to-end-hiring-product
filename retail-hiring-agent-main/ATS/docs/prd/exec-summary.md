# Frontline Hiring Agent — Executive Summary

**Date:** June 2026
**Author:** Anuj Jain

---

## The Opportunity

US grocery chains employ ~2.4 million frontline workers. These workers turn over at 60-76% annually. That means a chain with 10,000 employees needs to hire ~7,600 people every year — roughly one hire per store per week, perpetually. The direct recruiting cost alone is ~$3.6M/year; the total cost of turnover (training, lost productivity, unfilled shifts) is ~$40M.

Despite this volume, the hiring process is broken. Not at the top of the funnel — applications per hire have nearly doubled to 95. The problem is *after* someone applies. 94% of applicants abandon the application form. Of those who complete it, 92% are never screened. 42% withdraw because scheduling took too long. 32% no-show their interview because they already took another job. The average time-to-hire is 21-30 days. The best candidates are off the market in 48 hours.

The store manager — who is running a $30M operation — spends 3-10 hours per week on hiring admin: phone screens, scheduling calls, chasing no-shows. Their actual contribution to a good hire is a 15-minute in-person conversation. Everything else is wasted time.

**Our target market is mid-market grocery chains (50-500 stores).** These companies are too large for Indeed + spreadsheets but too small to justify $25K-$100K/year for Paradox or Workday Recruiting. There are ~55-85 such chains representing $120-200M in annual recruiting spend. No purpose-built solution exists for them today.

Grocery is our beachhead, not our ceiling. If we solve grocery — the most structurally complex frontline segment (departments, certifications, age restrictions, unions) — every other segment (QSR, apparel, convenience, warehousing) is a simpler subset. The expansion TAM across all US frontline hiring is $1-3B+.

---

## What We're Building

An AI-powered hiring system that compresses time-to-hire from 21 days to under 5 days. The system handles everything from application to offer — the store manager's only job is a 15-minute conversation with a candidate we've already qualified, screened, and scheduled.

**How it works, from the candidate's perspective:**

A candidate sees a job posting (Indeed, QR code in-store, career page) and texts a keyword or clicks a link. An AI-powered SMS conversation collects their information in under 2 minutes — name, availability, location, certifications. No app download, no login, no 15-minute form.

Within 5 minutes, the system screens them against the store's actual needs: shift availability overlap, age compliance, certifications, commute distance. Qualified candidates get an instant link to book a 15-minute slot with the store manager. The candidate picks a time, gets automated reminders, shows up. After the conversation, the manager taps "Hire" or "Decline" — one button. If hired, the candidate gets an offer via SMS with role, pay, schedule, and start date.

Every candidate — hired or not — gets a definitive outcome within 48 hours. No ghosting. No silence.

**How it works, from the store manager's perspective:**

They open a mobile dashboard and see: today's scheduled interviews with candidate summary cards, any candidates needing their review, and their store's hiring metrics. They make two types of decisions: (1) should I meet this person, and (2) should I hire this person. That's it. They don't post jobs, screen resumes, make phone calls, schedule interviews, send messages, or update spreadsheets.

**What makes it defensible:**

Every candidate who flows through the system builds a persistent record — past applications, screening results, interview history, employment records. When someone re-applies (33% of retail hires are returning employees), the system already knows them. A former employee in good standing can be re-hired in hours, not weeks. Over time, each chain builds a perpetual talent pool of pre-qualified candidates who can be activated instantly when a position opens — no job posting required.

---

## Why AI-First, Not AI-Added

This is not a traditional ATS with AI features bolted on. The architecture inverts the model:

- **Traditional:** Recruiter reviews applications → screens → calls to schedule → interviews → makes offer. AI helps at some steps.
- **Ours:** AI handles the entire pipeline autonomously. Human (store manager) intervenes at exactly one point — the in-person conversation. AI is not an assistant; it is the operator.

Three types of intelligence run the system. A **rules engine** handles compliance (age restrictions, certifications, work authorization) — no AI needed, just boolean checks. An **LLM** handles language — parsing a candidate's text message ("yeah I can do mornings and some weekends") into structured availability data, and generating natural-sounding messages. A **scoring model** ranks candidates by fit. Each tool is used where it's the right tool — we don't use a $0.03 LLM call where a boolean check works.

The AI never makes a hiring decision. It structures data, enforces compliance rules, scores fit, and routes candidates. The hiring decision is always human.

---

## Go-To-Market

**Buyer:** VP HR or Director of Talent Acquisition at mid-market grocery chains.

**Value prop:** Reduce time-to-hire from 21 days to under 5. Give store managers 5+ hours/week back. Stop losing good candidates to faster-moving competitors.

**Revenue model:** Per-store SaaS pricing.

**Phasing:**

| Phase | Timeline | Goal |
|-------|----------|------|
| MVP | Months 1-4 | Pilot with one chain (3-5 stores). SMS apply, rules-based screening, self-service scheduling, automated communication, store manager dashboard. Prove time-to-hire compression. |
| Production | Months 5-8 | Scale to full chain (50-200 stores). Add talent pool, boomerang detection, HRIS integration, LLM-powered conversational screening. |
| Scale | Months 9-12 | Second and third chain customers. Multi-language (Spanish), background check integration, analytics. |
| Expansion | Months 12+ | Cross-segment expansion (QSR, apparel). Union support. Workforce planning integration. |

---

## Key Risks

1. **SMS deliverability and compliance (TCPA).** Our entire candidate experience runs on SMS. Carrier filtering, consent management, and message volume limits are operational risks that need to be solved from day one.

2. **Mid-market sales cycle.** These chains are regional, private, and relationship-driven. There's no inbound funnel. Sales will require direct outreach and pilots. The first 2-3 customers will be founder-sold.

3. **Paradox/Workday moving downmarket.** Workday acquired Paradox in late 2025. If they package a mid-market offering, our pricing and speed-to-deploy advantages narrow. We need to be established in 3-5 chains before that happens.

4. **Store manager adoption.** The tool only works if store managers use it. If they ignore notifications and keep doing phone screens, the system's value collapses. Mobile-first, zero-training UX is critical.
