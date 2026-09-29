---
AUTHOR: Claude
WHAT THIS IS: a list of facts about what has been built
WHAT THIS IS NOT: any opinion about what we should reuse for hiring
---

# What NuAnchor can actually do

Written 8 Aug 2026, updated 9 Aug. Based on the seven source files in ../00-context/.

## How to read this file

This file separates four different things that are easy to confuse:

- **Section A. Proven.** I can point at a screenshot of the working product, or at words spoken over
  a number that is visible on screen.
- **Section B. Claimed.** Someone says it works this way, but no source shows it. It might all be
  true. Nothing here backs it up yet.
- **Section C. Missing.** Things the sales pack's own argument implies should exist, but which appear
  nowhere.
- **Section D. Contradictions.** Places where two sources disagree with each other.

Then two extra sections: how Nurix packages and sells a product (section E), and the Unifi hiring
slide on its own (section F).

**This file deliberately stops short of saying what any of it means for hiring.** That judgement is
Suniras's and belongs in nuanchor-one-pager.md next door. If you find a sentence here that says "we
should therefore build...", that is a mistake and it should be deleted.

---

## A. Proven

### A1. Three agent steps that pass structured results to each other

Verified. Screenshot image7 shows the app's own words: "Three agent layers, demand, buy, sourcing,
each hands the next a typed artifact."

"Typed artifact" means the handover is a structured object with defined fields, not a paragraph of
text the next step has to interpret. That word is the app's, not marketing paraphrase.

| Step | What it does | What it looks at |
|---|---|---|
| 1. Demand | Works out how much will sell, and gives a range rather than a single number | Search interest, social media, last season's sales |
| 2. Buy | Subtracts stock already held, checks against the budget | Current stock, sales plan, remaining budget |
| 3. Sourcing | Prices and shortlists factories | Cost including shipping and duties, current import taxes, delivery times, factory minimum order sizes, how much sits in one country |

Screenshot image3 shows step 3 reporting itself: "Layer 3, Sourcing, weighed 3 options on landed
cost, live tariffs, lead times, MOQs, concentration."

### A2. The agent's reasoning appears as a labelled log

Verified. Screenshots image3 and image7.

The log is not loose text. Every entry has a type:

- AGENT. A step reporting what it just did and which factors it weighed.
- INSIGHT. A recommendation with the trade-off priced in money. Example: "Recommending the 70/30
  split: $389,914 landed, risk 68 to 52, a $7,990 premium buys the derisking."
- YOU. Current state written as if to the user. Example: "PO staged: 6,180 units, $389,914 landed.
  Nothing is ordered until a human approves."
- EXECUTED. An action that has completed.

### A3. The output is a document the buyer already recognises

Verified. Screenshot image4.

The product does not end with a dashboard or a score. It ends with a draft purchase order, which is
the actual document a buyer already sends to a factory. It carries the style and category, the
demand estimate with its range, the quantity, the order-by and in-store dates, both suppliers with
their country and their share of units and cost, the total cost, and how much the risk score
improved and what that cost.

The status field reads "awaiting your approval."

### A4. A person must approve, and the approval is recorded

Verified. Screenshot image7.

Approving flips the order to "approved" and writes this line:

`AUDIT  Approved by NuStack field demo, 2026-07-31T06:55:20.112Z, Handed off to Operations.`

The activity log adds: "audit entry written: 6,180 units, $389,914 landed, with the reasoning
snapshot."

So the audit record holds six things: who approved it, the exact time, the quantity, the cost, a
snapshot of the reasoning, and where it went next.

What we still don't know is what the downloadable audit spreadsheet contains beyond that one line.
That is Q-007.

### A5. Change one assumption and everything recalculates

Verified. Screenshot image7 and demo script scene 5.

Two examples are shown:

- Demand 15% higher. The estimate moves from 7,480 to 8,602 units, the order from 6,180 to 7,302,
  and the cost from $389,914 to $460,706. Every tile updates at once and shows its own change against
  the original plan.
- Import duty on Vietnam jumps 12 points. Same number of units, but cost rises from $389,914 to
  $415,351, which is $25,437 more. The country split and the risk score do not move, because the
  order was already spread across two countries.

### A6. A screen for handling high volume, which is the most developed idea in the pack

Verified. Screenshot image8.

The workspace opens on a page headed "Decisions, Priya's morning" with "Good morning, Priya" and a
badge saying "bundled into 3 moves." The agent introduces itself in the first person:

> "I reviewed 355 options overnight, 271 on plan, handled. The 84 that need you, I bundled into 3
> moves below, act in a pass, or open any move to review."

Three tiles: 84 need you, $3.4M at stake, 271 on plan (74% of the buy).

Each of the three groups is a card carrying:

- a name and a count, for example "Markdown-exposed, 69 styles"
- its own money at risk, $2.5M for that one
- the agent's reason in plain words: "Weak tail, no rising signal and sub-65% sell-through. Drop the
  tail to free OTB before it marks down"
- the largest individual items listed out, then "+66 more"
- a priority badge reading "act first"
- three buttons: drop all 69, keep all, or review each one

The 84 add up: 69 at risk of discounting, 14 below the factory's minimum order size, and 1 to trim.

Two abbreviations appear in the quotes above. MOQ means minimum order quantity, the smallest batch a
factory will make. OTB means open-to-buy, the money a retailer has left to spend on stock this
season.

### A7. You can ask it questions in plain words

Verified. Screenshot image8 has an "Ask the agent" button. Screenshot image7 shows a typed question
in the log: "You: what if a +12pt duty shock hits the incumbent country?"

So scenarios can arrive as questions, not only as preset buttons. The written documents describe
scene 5 only as clicking a button, so the screenshots show more than the documents do.

### A8. The app admits its own data is fake

Verified. Screenshot image7 footer: "Synthetic demo data, every figure derives live from the same
engines as the workspace (the replay and the app can never disagree). Illustrative until it runs on
your history."

### A9. Three demo pages

Verified across all sources. One where you upload a file and watch it run, one fixed replay that
needs no file, and the workspace showing a planner's day. The workspace is password protected.

### A10. A second persona screen, called a control tower

Verified from the full transcript, 9 Aug 2026. Previously this sat in section B as a claim.

The presenter navigates to a second screen for a sourcing role called Dev, describes it as "the control
tower," and says it shows where inventory is currently being bought from, what the right decision
should look like, and gives "real-time control of changing the decisions on the fly."

So two role-specific screens over the same underlying work do exist. Whether they read from one shared
calculation is still open, and is Q-006.

---

## B. Claimed but never shown

These are a weaker tier than section A. They may all be true.

| Claim | Where it comes from | What is missing |
|---|---|---|
| "Same numbers, any persona," meaning one calculation feeds several role-specific views | App text in image7, plus the footer claim that the replay and app "can never disagree" | Strongly implied, never shown side by side |
| Customers can set how much the agent decides alone | Demo script scene 7, and a tile reading "Agent handled: 2" | No settings screen appears in any source. The setting is asserted, never displayed |
| Click any number and it tells you why | Both decks, and the release note | The drill-down is never captured. "Review each" is the only visible way in |
| It gets better the more you use it, because each season is scored against what actually sold | Team deck row 6, which the deck itself calls "the whole argument" | No mechanism shown anywhere. This is the deck's main selling point and its least supported claim |

---

## C. Missing entirely

Things the pack's own argument implies, but which appear in no source.

- **Connections to other systems.** The team deck says plainly: "Direct ERP connections, not yet.
  CSV today." No list of integrations, no login model.
- **Security, data separation between customers, where data is stored, SOC 2.** Not mentioned once
  across seven sources.
- **How long setup takes.** The whole competitive argument is that rivals take 12 to 24 months.
  NuAnchor never says its own number.
- **Price.** Competitors' prices are estimated in detail. NuAnchor's own price appears nowhere.
- **Evidence of scale.** The biggest number shown is 355 options across 8 product styles. No claim
  about speed, load, or many users at once.
- **A single actual customer.** Knitwell, Kohler and Jomashop are described as targets, "first three
  accounts." Nobody has deployed it.
- **Voice.** NuPlay is a real-time voice product, but NuAnchor is entirely screen based.

---

## D. Where sources disagree

| ID | The disagreement | Resolved? |
|---|---|---|
| D1 | The demo recording says the suppliers are in Vietnam and China. The product shows Vietnam and India | **Settled, but not the way I first recorded it.** Screenshot image4 shows Saigon Performance Mills in Vietnam and Madras Knitwear Co. in India. The full transcript confirms the presenter really does say China, so Suniras's summary was accurate and the **narration disagrees with the product** |
| D2 | The recording names Walmart **and Target** as having this problem in its opening line. Both decks list Walmart under "not built for" | **Open, and sharper than first logged.** This is the framing the whole demo opens on, not a passing mention. See Q-002 |
| D5 | The recording says the agents "sit on the existing client ERP systems." The team deck says "Direct ERP connections, not yet. CSV today" | **Open.** An integration claim made out loud that the product does not support |
| D6 | The recording never mentions the human approval gate. The written script devotes scene 6 to it and calls the gate "the spine" | **Open.** The trust argument is missing from the actual demo |
| D7 | The recording never mentions tariffs, duties or landed cost. The written script calls the tariff lever "the most differentiated fifteen seconds we have" | **Open.** The differentiator is missing from the actual demo |
| D3 | Three different taglines across three surfaces: the live app, the team deck, and the client deck | **Open.** Minor, but worth noticing |
| D4 | The Unifi slide's headline says the entire hiring process. Its own quote says the first stage only | **Open.** See Q-004 |

---

## E. How Nurix packages and sells a product

Recorded because Suniras said the demo is a style reference. Still facts, not recommendations.

1. **A first version shipped with the whole sales pack attached.** Product, two decks, script,
   walkthrough and recording all dated within four days of each other.
2. **Internal and external versions kept properly separate.** Competitor prices, target company
   names and competitor names appear only in the internal deck.
3. **A written list of who not to sell to,** with named example companies on both sides.
4. **Honesty built into the documents themselves.** Statistics are credited inline. Benefit ranges
   are footnoted as "directional impact, not a guaranteed result." Salespeople are told to say "this
   is the size of the prize, not a promise." Competitor prices are marked as never to be presented as
   official quotes, and if a customer has their own quote, use theirs.
5. **A table of phrases to use and avoid,** trading internal language for customer language. Say "it
   shows its work" instead of "glass-box explainability." Say "a person says yes" instead of
   "human-in-the-loop approval gate."
6. **Objections written down in advance,** including the good advice: don't sell accuracy you can
   only prove a season later, sell what a customer can check today.
7. **A jargon-free explanation and a glossary,** so someone new to retail can run the demo.
8. **A scene built purely to kill one objection.** Scene 2 exists only to prove the demo is not a
   pre-recorded video: download the file, open it, drag it back in.
9. **Written recovery instructions for four ways the demo can fail on camera.**
10. **One named owner and one channel on every document.**

---

## F. The Unifi hiring slide

Kept separate because it is the only source about hiring, and it is a single image.

**What it establishes:** there is a $1B+ aviation ground services company hiring more than 70,000
people a year. AI agents run a screening or qualification step and flag concerns for a human to
review. A business lead there is willing to be quoted anonymously.

**What it does not establish:** which company, which country, what "100% regulatory compliance"
actually means, the starting number behind "20% time reduction," the starting number behind "500+
hours every month," which parts of hiring are covered, and whether this is live, a pilot, or still
being built. The badge says "In Progress," which does not sit comfortably with being described
elsewhere as deployed and live.

**One note on its headline number.** "3 to 5 minute screening conversations" measures how long
something takes. It does not measure whether hiring got better. CLAUDE.md uses this exact figure as
its example of a feature metric pretending to be a business metric.
