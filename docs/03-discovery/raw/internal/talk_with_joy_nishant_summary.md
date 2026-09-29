# Research Inputs: Anuj and Joy

- Anuj’s PRD framing (from his US client visits):
  - Two candidate personas in frontline hiring: fresh graduates/young workers and 40-50+ workers, both applying broadly and indiscriminately
  - Store manager is the key hiring persona: 8-10 hour days, high cognitive load from screening via calls, texts, emails
  - AI opportunity: automated screening with a predetermined scorecard, surfacing top 3 candidates for final call
  - Cycle time benchmark: 5-7 days is viable; 40 days is current norm
- Joy’s inputs (more technical/feature-oriented):
  - Resume parsing into a skill graph/taxonomy, matched against JD skill trees, then scored for fit
  - Years of experience carries high weightage in retail (seniority signal)
  - Candidate reputation/credentialing layer: past work references, punctuality, conduct, especially relevant in medical/nursing but debated for cashier roles
  - Some players claim 72-hour close via pre-sourced talent pools, not just tooling speed
  - Job board integration: US market is organized (LinkedIn, Greenhouse); Europe is fragmented with niche boards (e.g., barberjobs.com)
  - Covid-era theme: Uber-style on-demand/contingent staffing marketplaces
  - Cost to track: source-per-minute call pricing, lead conversion per resume, third-party integration costs
  - Commission model: 4-8% of annual CTC standard; some players charge 14-15% by bundling insurance (Zenefits-style)

# Key Debates and Clarifications

- Competitor landscape noted: Eightfold AI, Fountain, Greenhouse, Paradox, Himilo; Greenhouse is an aggregator/ATS, not a direct competitor
  - Paradox case study: 12-day to 4-day hire cycle (flagged as sales-y, not a hard proof point)
- LLM vs. classic ML for resume parsing: classic ML likely sufficient for skill graph extraction; LLM would be overkill
- B2B vs. B2C tension: Joy’s research skews B2C; current product direction is B2B (big-box retail); mixing both is inadvisable
- Contingent hiring flagged as a key area to double-click on: how the industry evolved pre/post-COVID, Vline AI mentioned as a reference startup
- Rehire as edge case: Fountain has an optional rehire layer; agreed it’s not a priority to solve now
- Job board integration goal: primarily a candidate pipeline/visibility play, not a core build priority yet
- Demo authenticity: current demos use synthetic data with simulated connectors; live integration not required for proof-of-concept, but space should be left for it in the product design

# Direction and Next Steps

- No immediate build decisions: still in exploration/discovery phase
- Goal for Suniras: absorb the Anuj + Joy inputs over the next 24-48 hours, form a clear problem statement and persona definition
- Check-in plan: tomorrow evening if progress is made, otherwise Thursday
- End state for discovery: aligned on problem statement, target personas, and scope before moving to specs, data model, and build
- Demo benchmark: smoke-and-mirrors + live demo page with sample files; output should change when input changes; voice agent screening with scoring is the target capability

# Next Steps

- **Synthesize research into a problem statement and persona definition** (Suniras)
- **Check in on discovery progress** (Nishant)