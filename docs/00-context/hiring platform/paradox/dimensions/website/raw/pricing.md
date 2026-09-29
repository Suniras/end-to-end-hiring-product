<!-- source: multiple · captured_at: 2026-08-09 · method: crawl-clip -->

# Pricing — CONFIRMED not disclosed (multiple independent checks)

Per the batch-learned lesson to verify "no pricing" via multiple plausible locations rather than one page,
the following were checked:

| Check | Method | Result |
| --- | --- | --- |
| Homepage nav/CTA | crawl | Only CTAs are "Request demo" and "Log in" — no "Pricing" nav item |
| `/pricing` | `curl -I` | **HTTP 301 → redirects to `/` (homepage)** — the URL exists as a redirect stub, not a live page |
| `/plans` | `curl` | 404 |
| `/plans-pricing` | `curl` | 404 |
| `/get-started` | `curl` | 404 |
| `/book-a-demo` | `curl` | 404 |
| All 13 product pages (`/products/*`) | crawl-clip | Zero pricing/plan/tier language on any page |
| All 8 industry solution pages | crawl-clip | Zero pricing language |
| Partner pages (Workday/SAP/Indeed/integrations) | crawl-clip | Zero pricing language |
| Case studies (6 fetched) | crawl-clip | Zero pricing language — only outcome stats |
| `/why-paradox` | crawl-clip | Zero pricing language |

**Conclusion:** Paradox discloses no pricing, tiers, or packaging anywhere on the public marketing site.
Every surface routes to "Request a demo" — this is a fully sales-assisted / enterprise-quote model, typical
for a platform selling into large multi-thousand-employee accounts (all named case-study customers are
20,000-500,000+ employee enterprises). This corroborates Discovery's original finding at higher confidence
(single-source website crawl → now cross-checked at 9+ distinct locations, still zero disclosure).

No plan names (e.g. "Starter/Pro/Enterprise"), no per-seat or per-hire unit-economics language, no
usage-based/consumption pricing language (e.g. "per conversation," "per SMS") found anywhere on the public
site.
