<!-- source: https://www.paradox.ai/products/* · captured_at: 2026-08-09 · method: crawl-clip -->

# Product pages — the "Conversational X" family

13 distinct product URLs under `/products/`: `campus-events`, `candidate-experience-agent`,
`conversational-apply`, `conversational-ats`, `conversational-career-sites`, `conversational-crm`,
`conversational-events`, `conversational-scheduling`, `onboarding`, `screening`, `surveys`, `text-apply`,
`video`.

**Finding — `<title>` tag collision.** `/products/conversational-apply` serves a `<title>` of
"Automated candidate screening — Paradox" — identical framing to `/products/screening`. Both pages'
verbatim content centers on the same capability (chat/text-based candidate screening + apply flow), with
near-identical stat blocks (80% conversion, 50% decrease in time-to-hire, 40,000 hrs/week). This suggests
"Conversational Apply" and "Screening" are UI/marketing labels over the **same underlying capability**,
not two independently engineered products — corroborating the recon-plan hypothesis that the whole
"Conversational X" family sits on one conversational engine (Olivia) with per-surface skins. (Title tags
confirmed via direct `curl` fetch, not just the WebFetch summarizer.)

| Product URL | `<title>` | Headline pitch (verbatim) |
| --- | --- | --- |
| conversational-ats | Conversational ATS | "Hire faster with the ATS that reimagines recruiting." |
| candidate-experience-agent | (Candidate Experience Agent) | "Better for candidates, smarter for hiring teams" / "the always-on, AI agent that turns clunky processes into simple, human conversations." |
| conversational-career-sites | (Career Sites) | "The career site that (actually) converts." |
| conversational-apply | Automated candidate screening | "Eliminate friction, increase conversion. Reduce drop-off by making it simple for candidates to apply in minutes." |
| screening | Candidate Screening Software | "Eliminate friction, increase conversion..." (near-duplicate of conversational-apply) |
| text-apply | Text to Apply Application Screening Software | "Transform your hiring strategy with text recruiting... apply in minutes where they're most comfortable: their phones." |
| conversational-scheduling | Interview Scheduling Automation | "The smartest assistant for interview scheduling." / "Our conversational AI navigates every scheduling challenge for candidates, recruiters and hiring managers — getting any type of interview booked in minutes." |
| conversational-events | Hiring Events Platform | "Make hiring events your competitive advantage. With conversational AI, your team can handle more events (and candidates) with fewer resources." |
| campus-events | Campus Recruiting Events | "Be the employer students choose first." |
| conversational-crm | Candidate Relationship Management | "More candidates, less management" / "A CRM that actually drives action" |
| onboarding | Post-Hire Onboarding Software | "Simple, fast onboarding built for first-day success stories." |
| surveys | Applicant Surveys | "Know exactly how every candidate feels — in real-time." |
| video | Video Interview Software | "Simple, seamless video to bring hiring to life." |

## Feature claims per product

### Conversational ATS
Automated Event Management · Text-to-Apply (SMS/WhatsApp/Messenger, no forms) · Interview Scheduling
("scheduled within 10 mins") · Candidate Q&A 24/7/365 · Job Management (mobile app) · Candidate Management
(mobile, for frontline managers) · Offer Management (automated text offer letters) · Automatic Onboarding
(I-9, handbooks, day-1 reminders) · Campaign (templated text/email messaging) · Indeed Apply integration ·
accessibility features · open API integrations.

Stats: 300% increase in applicant activity (Pacific Seafood, month 1) · 35,000 hrs saved (Checkers &
Rally's) · interview scheduling 9 days → <4 min (Checkers & Rally's) · time-to-hire 9→<5 days, -50%
(7-Eleven) · 40,000+ hrs/week saved for store leaders (7-Eleven) · 200,000+ interviews scheduled (Hamra
Enterprises) · scheduling 26 hrs → 18 min (Cielo) · 190,000+ candidate Qs answered, 10,000+ interview
requests scheduled, 89% application completion (Compass Group) · "174 countries, 17 languages" (Compass
Group) · 50+ seasonal hires (Pacific Seafood).

### Candidate Experience Agent
Job Management · Text-to-Apply · Hiring Goals (auto on/off by volume) · Panel/Group Interview scheduling ·
Automated Self-Scheduling · Rescheduling & Reminders · 24/7 Candidate Q&A · multilingual (30+ languages
stated here, "100+ languages" elsewhere — see reconciliation note) · Offer Management · Automatic
Onboarding · Indeed Apply · Personalization (customizable voice/tone/photo) · Surveys & Interview Feedback ·
Analytics ("1,000+ metrics tracked") · Fairness & Compliance · Accessibility · Global/Localization ·
Events management · Security & open API · SEO optimization.

Stats: up to 80% conversion rate · 35,000 hrs saved/yr (Checkers & Rally's) · 75% decrease time-to-hire
(Chipotle) · $2M saved via automated scheduling (General Motors) · 50% decrease time-to-hire (7-Eleven) ·
40,000 hrs/wk recovered (7-Eleven) · "100+ languages" · "1,000+ metrics."

### Conversational Career Sites
Dynamic Content matching candidate interest · Advanced Search (military-skills translator, commute-time
calculator) · mobile-responsive · Talent Community nurture w/ automated SMS job alerts · 24/7 conversational
assistant ("concierge") · White Glove Service (Paradox designs/builds/manages the site) · multilingual
(100+ languages via NLP) · Resume Matching w/ AI role recommendations ("Olivia can't read minds — but she
can read a resume") · Internal Career Sites w/ SSO for internal mobility · Indeed Apply · Personalization ·
Surveys · Fairness/compliance · Accessibility · Analytics (1,000+ metrics) · Global compliance/localization ·
Event automation · Security certifications · Open API · SEO.

Stats: "increase the overall likelihood of your job being clicked by 21%" (an Indeed-integration stat
reused across many product pages — treat as one shared claim, not independent per-product evidence).

### Conversational Apply / Screening (near-duplicate content — see title-collision finding above)
Chat & Text-to-Apply (SMS/WhatsApp/Messenger) · Automated Screening ("screen candidates in minutes") ·
Candidate Sourcing via QR codes/SMS shortcodes · 1:1 recruiter texting · Chat-to-CRM lead capture ·
Employee Referrals automation · multilingual (100+ languages) · recorded video screening questions · Indeed
Apply · Personalization · Surveys · Analytics (1,000+ metrics) · Accessibility · security/compliance certs ·
API integrations with major ATS platforms.

Stats: 80% conversion rate · 50% decrease time-to-hire (7-Eleven) · 40,000 hrs/wk saved · 6 hrs/wk saved
(franchise owners) · "one third of interactions happen outside business hours" · 21% Indeed-click increase ·
5x application-conversion increase (sourcing) · "160,000 workers hired/yr with 20 recruiters" (Compass
Group) · 75% decrease time-to-hire (Chipotle) · 63% reduction in time-to-apply · 30% increase in hiring for
hard-to-fill roles · 96% interview-acceptance rate · 91% same-day scheduled (screening page specifically).

### Text-to-Apply
QR code / text-keyword initiation · conversational application <3 min · automatic screening against
customizable job requirements · Indeed integration · 100+ languages · integrates with Workday, SAP
SuccessFactors, ADP, Taleo, Cornerstone (explicit ATS name-drop) · video interviewing · onboarding · surveys
· campus events.

Stats: 30% increase in hard-to-fill hiring · 63% reduction time-to-apply · industry baseline "<20% of
candidates complete the application process" vs "more than 50%" completion with Olivia · "99% say it's a
positive experience."

### Conversational Scheduling
Panel/Group interviews · Automated Self-Scheduling · Rescheduling & Reminders · Interview Feedback ·
Interview Prep/Q&A · Candidate Surveys · Browser Extension · Calendar Negotiation ("Coming Soon" — a
disclosed roadmap item) · Recorded Interviews · 30+ languages/time-zones · Indeed Apply · Personalization ·
100+ languages (see reconciliation) · Analytics · Global compliance · Hiring Events automation · Security
certs · Open API.

Stats: "30M+ interviews scheduled annually" (platform-wide, not per-customer) · 35,000 hrs saved/yr ·
40% decrease in no-shows · 3 min avg. time-to-schedule · 21% Indeed-click increase · 26 hrs → 18 min
(Cielo).

### Conversational Events / Campus Events
Event Creation (few clicks) · Virtual or In-Person · flexible for seasonal/campus events · Campaigns
(re-engage past-event candidates) · Nurture Pipeline · Engagement/Reminders automation · real-time Candidate
Evaluations · Analytics · Registration with no forms/passwords · (campus-specific) Student Talent
Communities, mobile app for students, instant post-meeting tagging.

Stats: 300% more applicants (Events) · 75% decrease in event costs · 60% decrease cost-per-applicant ·
21% Indeed-click increase · 100+ languages · 1,000+ metrics (campus).

### Conversational CRM
Campaigns · Career Interest Assessments (RIASEC model named explicitly) · Talent Communities · Job Alerts ·
Find (pre-CRM lead screening via text/chat) · Organize (dynamic segmentation) · Convert · Measure (1,000+
metrics, dynamic dashboards) · Optimize (**AI-assisted campaign copywriting** — "an assistant that writes
campaigns") · LinkedIn Connect (1-click candidate export from LinkedIn) · Indeed Apply · Personalization ·
Surveys · 100+ languages · Analytics w/ secure sFTP export · Security certs · Open API · SEO.

### Onboarding
Customized offer letters · mobile-friendly onboarding forms · AI-guided onboarding end-to-end · 24/7 Q&A
and reminders · sharing tax forms/background-check documents/company docs · automated workflows synced to
new-hire position/location · "pre-boarding, post-hire, and beyond" framing. No stats disclosed on this page.

### Surveys
Feedback collection post-application and post-interview · real-time hiring-manager notes via text ·
multi-channel delivery (SMS, email, widget, WhatsApp, Facebook) · 100+ languages · customizable question
types (ratings/emoji/list-select/open-ended) · automated scheduling of prompts by role/stage · dashboard
reporting.

### Video
Recorded video responses (in application or as follow-up) · in-browser virtual interviews, no
login/download required · video woven into event conversations · integrations named explicitly: **Zoom,
Skype, BlueJeans, Microsoft Teams, Webex**.

## Cross-product reconciliation notes

- **"100+ languages" vs "30+ languages"** — most product pages state "100+ languages"; Candidate
  Experience Agent and Conversational Scheduling each cite "30+ languages" in one spot alongside "100+" in
  another. Read as marketing-copy inconsistency (possibly 30+ for live conversational Q&A vs 100+ for
  translated career-site/job content), not a hard contradiction — flagged for evaluation.
- **The Indeed "21% increase in likelihood of a job being clicked"** and **"1,000+ metrics tracked"**
  stats recur verbatim across nearly every product page — these are platform-wide claims restated per page,
  not independent per-product evidence. Count them once in any rollup.
- **No pricing, no plan tiers, no "Enterprise/Pro/Starter" language anywhere** across all 13 product pages.
