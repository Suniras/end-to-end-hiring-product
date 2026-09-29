<!-- source: https://www.paradox.ai/solutions/* · captured_at: 2026-08-09 · method: crawl-clip -->

# Use-case / Solutions pages

11 URLs under `/solutions/`: `candidates`, `financial-services`, `franchise-hiring`, `healthcare`,
`hospitality`, `managers`, `manufacturing`, `recruiters`, `restaurant`, `retail`, `trucking-logistics`.
Split into **industry pages** (retail/restaurant/franchise/healthcare/manufacturing/financial-
services/hospitality/trucking) and **persona pages** (candidates/recruiters/managers).

## Industry pages

| Industry | Headline (verbatim) | Key stats | Named customers |
| --- | --- | --- | --- |
| Retail | "Convert customers to candidates with a conversation" | 58% ↓ time-to-apply · 40% ↓ interview no-shows · 40,000 hrs/wk saved · 48% ↓ time-to-apply (dupe stat, two figures given) | Tractor Supply, 7-Eleven, Ace Hardware, Burlington, Sobeys, American Tire Distributors |
| Restaurant | "Schedule in minutes, hire in days." | 35,000 hrs/yr saved · 75% ↓ time-to-hire (12d→4d) · 38% ↓ hourly turnover · 2+ hrs/wk saved per manager · 91% of hires made virtually (First Watch) · "serves 50,000+ quick-service restaurants globally" | Chipotle, Wendy's, Checkers & Rally's, First Watch, Captain D's, Flynn Group |
| Franchise Hiring | "You keep running your business. Paradox will handle the recruiting." | 3 min avg. SMS application time · 92% interviews scheduled within 30 min · 2-day avg. app-to-onboard · "50,000+ locations" supported | Checkers & Rally's, Southern Rock Restaurants, Sobeys, Regis Corp, Wendy's (HAZA Foods franchisee), Ace Hardware — quote: "We had to turn Mia off because we were getting so many applications." — Brad Williams, VP of Franchise Restaurants (**"Mia" = a customer-specific branded name for the Olivia assistant — see branding note below**) |
| Healthcare | "Treat your candidates like you treat your patients." | 97% ↓ interview-scheduling time (Essentia Health) · 7 hrs/wk saved (Autism Learning Partners) · 44% ↓ cost-per-hire (The Good Care Group) · 22% ↓ cost-per-hire (MultiCare) · 60% of candidates scheduled after-hours (Houston Methodist) | Houston Methodist, Essentia Health, Autism Learning Partners, The Good Care Group, MultiCare, MJHS, Medtronic, Christus Health, UnitingCare |
| Trucking/Logistics | "Fast-track qualified drivers without lifting a finger." | 90% ↓ hiring cost · 2,000 annual hires via conversational AI · 20 hrs/wk saved per recruiter · 99.95% positive candidate-experience rating · <3 min auto-scheduling | U.S. Xpress, Koch Trucking, Extra Space Storage (logistics division) |
| Manufacturing | "Keep your hiring humming like a well-oiled machine" (automate up to 100% of hiring) | $2M/yr saved (GM) · candidate response 10 hrs→10 min (Johnson Controls) · scheduling 7 days→4.5 min (Medtronic) · 313% increase in hiring volume (American Tire Distributors) | General Motors, Johnson Controls, Medtronic, Nestlé, Pacific Seafood, Kerry Group, REV Group |
| Financial Services | "A hiring experience you can take to the bank" | 9 sec to schedule interviews (UOB) · 89% improved interview-schedule rate (DFCU Financial) · "automate 90% of hiring process" (Workday-integration claim) | UOB, DFCU Financial, Royal London |
| Hospitality | "Deliver a five-star candidate experience, every time." | $700K/yr reduction in recruitment marketing (Great Wolf Lodge) · 300,000 applications in <90 days (Fontainebleau Las Vegas) · 400% increase in candidate flow (Great Wolf Lodge) · "automate up to 90% of hiring process" | Great Wolf Lodge, Marriott International, Fontainebleau Las Vegas, IHG Hotels & Resorts, Schnucks |

## Persona pages

- **Candidates** (`/solutions/candidates`) — pitch: "search for jobs, apply, and get scheduled quickly and
  simply" via conversation with Olivia, 24/7, mobile/text-first. **No privacy/data-rights disclosure, no
  opt-out mechanism, no data-use explanation on this page** — only generic footer links to Privacy
  Policy/Terms. This is a notable gap given SMS-based recruiting's known phishing-vector profile (see
  `raw/legal-security-fraud.md`).
- **Recruiters** (`/solutions/recruiters`) — pitch: Olivia absorbs admin work so recruiters focus on
  relationship-building. Stats: "72% of recruiters are more likely to stay at their job with the use of
  conversational AI" · 50% reduction in time on recruiting admin tasks. Quote (VP of Talent Management,
  Essentia Health): "This actually means less work... recruiters have the opportunity to do things they
  want to do, spend less time doing administrative tasks." Explicitly pitches Olivia as working *with*
  existing systems (Workday, SAP, ADP, Greenhouse, etc.) rather than replacing them.
- **Managers** — not separately fetched this pass (URL present in sitemap, lower priority; recommend a
  follow-up pass if manager-specific claims matter to synthesis).

## Express Care (`/express-care`) — a named sub-offering, not in main nav

Positioned for high-volume service-business hiring (restaurants/franchise). Uses an AI assistant branded
**"Becky"** (yet another customer/segment-specific persona name — see branding note). Features: mobile
apply via text/chat/social, automated interview scheduling, 24/7 candidate Q&A (benefits/pay/logistics),
one-click customized offer letters. Stats: 124% increase in monthly hires · 63% reduction in time-to-hire ·
80% reduction in time-to-apply. Reads as a packaged/vertical SKU of the core platform rather than a
separate product line.

## Branding note — Olivia is a white-labeled persona, not a fixed product name

Across case studies and use-case pages, customers deploy the assistant under **their own custom name**:
Chipotle → "Ava Cado," 7-Eleven → "Rita," General Motors → "Ev-e," a franchise customer → "Mia," the
Express Care SKU → "Becky." "Olivia" is Paradox's own default/marketing name for the assistant, but the
product's "Personalization" feature (customizable voice/tone/photo, cited on nearly every product page)
extends to a fully custom name/persona per deployment. This is a real, corroborated finding (5 independent
pages) worth carrying into product-features/competitive-positioning evaluation — it's a soft-branding
layer over one conversational engine.
