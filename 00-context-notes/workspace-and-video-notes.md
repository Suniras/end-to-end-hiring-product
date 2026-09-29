---
AUTHOR: Suniras
STATUS: partly done. Video summary received 8 Aug 2026. Full transcript received 9 Aug 2026.
NOTE: never write the workspace password into this file or any other file in this repo.
---

# Things I cannot see, that you need to tell me

Two gaps. The demo workspace needs a password, so I have no access. And the video file cannot be read
on this machine, because there is no video tool installed. Everything below has to come from you.

---

## Already given: your video summary, 8 Aug 2026

Recorded in capability-inventory.md.

Three things it added that no document mentions: a second dashboard for a sourcing person called Dev,
the phrase "one typed chain," and the "$3.4M at stake" figure.

Two things it contradicted: which countries the suppliers are in, and whether Walmart is a target
customer.

**How much weight it carries.** Updated 9 Aug 2026 after the full transcript arrived: **your summary
was accurate.** The presenter really does say Vietnam and China, and really does name Walmart.

I had recorded that your summary crossed two figures. It did not. The recording disagrees with the
product, which is a different and more serious problem. The correction is written up in D-003 in
DECISIONS.md.

What the transcript added beyond your summary: the presenter also names **Target**, claims the agents
"sit on the existing client ERP systems" when the team deck says there are no such connections, and
never mentions either the human approval gate or tariffs. See Q-021.

---

## Already answered by the screenshots, so skip these

I pulled the eight screenshots out of the walkthrough document and read them directly. These four
questions are now closed.

| Question | Answer | Source |
|---|---|---|
| Vietnam and India, or Vietnam and China? | Vietnam and India. Saigon Performance Mills, 4,326 units, $267,347. Madras Knitwear Co., 1,854 units, $122,568 | image4 |
| How does the workspace turn 84 decisions into 3? | Named group cards. Each shows its own money at risk, a plain-language reason, the biggest items listed out, a priority badge, and three buttons: accept all, reject all, or go through them one by one | image8 |
| What is in the audit line? | Who approved, exact timestamp, quantity, cost, a snapshot of the reasoning, and where it went next | image7 |
| Is the reasoning display structured or just text? | Structured. Four entry types: AGENT, INSIGHT, YOU, EXECUTED | image3 and image7 |

---

## Still needed: four things, most useful first

### 1. The autonomy setting

Autonomy here means how much the agent is allowed to decide by itself without asking a person.

This is the most valuable gap, because every source asserts it exists and no source shows it. The
demo script says autonomy is "a dial the client sets, not a switch we flip." The workspace shows a
tile reading "Agent handled: 2." But there is no screenshot of the screen where you set it.

- Where does a customer set it, and what exactly do they set? A confidence level? A maximum money
  value? Rules per product category? Something else?
- Is it set per person, per job role, or for the whole company account?
- What did those two decisions the agent made alone have in common, that let it act without asking?

<!-- write here -->

### 2. Dev's sourcing dashboard

No screenshot of this exists anywhere.

- What is on it, and how is it laid out?
- Does it read the same calculated numbers as Priya's screen, or is it worked out separately? The app
  claims "same numbers, any persona." Is that literally one shared calculation, or two screens that
  happen to agree?
- Can Dev re-split an order that Priya has already approved? If so, who wins?

<!-- write here -->

### 3. "Click any number and it tells you why"

Both decks lead with this line, and no screenshot captures it.

- What appears when you click? A tooltip, a side panel, a full trace?
- How far back does it go? Just the last calculation, or all the way to the row in the uploaded file?
- Does it work on the workspace screens too, or only during the live run?

<!-- write here -->

### 4. The downloadable audit file

The audit line on screen is one sentence. The download is a spreadsheet, which is a different thing.

- What columns does it have?
- Does "reasoning snapshot" mean a paragraph of prose, or the actual inputs each step used?
- Could someone reconstruct why a decision was made six months later, using only that file and no
  access to the app?

<!-- write here -->

---

## Anything else on screen that the documents never mention

Your summary already caught three things. There are probably more. The documents describe eight
scenes, but the app also has navigation, an "Ask the agent" button, and a reset control that the
documents barely cover.

<!-- write here -->
