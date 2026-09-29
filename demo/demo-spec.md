---
AUTHOR: Suniras. Claude wrote the questions, the craft notes and the constraints list, nothing else
WHAT THIS IS: the specification for the demo that goes to Nishant. Six questions only Suniras can answer
WHAT HAPPENS AFTER: Claude builds it. The demo is code, and code is explicitly Claude's to write
STATUS: EMPTY
DATE STARTED: 17 Aug 2026
---

# The demo

## Why a spec before screens

A demo has a script before it has screens. The NuAnchor demo, which is the house standard per D-002, was eight
scenes with verbatim narration for each. That is the bar: not a tour of features, a story with a beginning and
an ask.

Answer the six questions below in order. The first one is the question this project has dodged twice, and a
demo makes it unavoidable, because scene 1 opens on somebody's screen.

## The craft bar, from what Nurix has already shipped

These are form references, not content to copy. D-011 stands: nothing from NuAnchor transfers at product level.
But the demo form is craft, and the craft is recorded:

- Eight scenes, each with narration written out word for word.
- A volume surface: 355 reviewed overnight, 271 handled, 84 needing judgement, bundled into three moves. The
  hiring equivalent of that screen is what a Monday morning should look like in our product.
- A per-step boundary label: what the agent owns, what the human decides. On screen, per step.
- The human gate as the only exit. Click any number and it tells you why.
- File in, artifact out, runnable on the prospect's own data.

## Constraints already decided, so the spec does not rediscover them

- All twenty steps appear in the pipeline view, including the human-owned ones. That is the claim. D-013.
- Step 6 shows a score, and a human still decides. D-016.
- The instrumentation is visible: time per step, drop-off per step, who acted. D-012 requires it in v1, so the
  demo should show it as a live surface rather than promise it.
- Every external system is simulated: payroll, workforce management, identity, screening agency, E-Verify,
  learning. D-018. Simulated honestly, told to Nishant as simulated.
- No pricing anywhere, and nothing framed per hire. D-018.
- No real company names in the seed data. A fictional retailer only.

---

## 1. Whose screen is scene 1?

One named role. Not a list. The test from v1-slice question 2 still applies: whose week gets measurably worse
if this product disappears on Monday?

*The choice space, from what we know: a central talent acquisition recruiter has the volume but no authority
over stores. A store manager has authority but low volume. A field or district HR person sits between, and
Q-027 says that level splits into a district manager who owns the money and a field HR partner who owns the
hourly hiring process. Whoever you pick, the demo is designed around their day and everyone else gets a view.*

**Answer:**
HR / Hiring manager. If we want to demo a product, why not use the person who is most probable to use it. This way, we also have a clear idea about where we are headed. But just so that we can show variety, if we are also able to demo as a store manager who manages all the hiring process a lot more closely, the demo would land a lot better. 

---

## 2. The scene list

Six to ten scenes, one line each, in order. Each scene is one moment on one screen. The NuAnchor bar is eight
scenes with narration, so aim there.

*A shape that would cover the claim, offered as a prompt rather than a script: a candidate applies and the
pipeline lights up. The agent interviews them and a score arrives. A human decides. The offer goes out and gets
chased automatically. The background check wait is visible instead of silent. Onboarding paperwork completes
with the clocks on screen. Day one is confirmed by a nudge the product sent itself. The pipeline view shows
twenty steps with nothing hidden.*

**Answer:**
If we can show every capability that is baked in, its fine. Since we're doing end to end hiring, it is acceptable even if the demo goes to 10 minutes long, which it probably will since we are showing 8-10 scenes. 

---

## 3. The sit-up moment

The one scene where Nishant stops checking his phone. Pick it deliberately, because the demo is built backwards
from it.

*Candidates, from what is already decided and evidenced: the voice interview happening live with the score
arriving at the end. The twenty-step pipeline filling itself while the narration talks. The E-Verify mismatch
scene, where the product blocks a store from quietly dropping a contested new hire, which is compliance depth
neither incumbent shows. A returning applicant caught by an imported do-not-hire flag. The day-one save, where
the product notices silence before the no-show happens.*

**Answer:**
Maybe do-not-hire flag and e-verify mismatch. 

---

## 4. What is live and what is seeded

Everything external is simulated by D-018. The question is what is live inside our own product on the day.
Does the voice agent actually run in front of Nishant, or is it a recording? Is the chat real? Is the score
computed or staged?

*Live is riskier and lands harder. NuAnchor demoed live on the prospect's own file. Unifi's agent was tested
live by the client. A recording is safer and it is also a video, not a demo.*

**Answer:**
Since what we are doing for Unifi is already a live voice agent, we know the capability exists. And in our case, we can skip it as for a single candidate, we might have to make multiple calls. So instead of showing each and every call made, if we just show a log of a call that happened, that would work.

---

## 5. The seed story

One fictional retailer: name, size, store count. One named fictional candidate we follow from application to
day 90. Which other roles appear on screen.

*The candidate is the spine. A demo that follows one person end to end proves the claim in a way a dashboard
tour cannot.*

**Answer:**
Pick one from any walmart store. I can't give you any numbers, since i'll have to go and do some research on what is to be done. 

---

## 6. The ask

What Nishant is asked for when the demo ends. A reaction? Engineering headcount? An introduction to a design
partner? Budget for the real build? A demo without an ask is a screening, not a pitch.

**Answer:**
Feedback, and a lot of it. Is this what he was looking for, which other parts of hiring do we need to cover? is there any part that we shouldn't cover. Most importantly is this what he expected when he said end to end hiring?


---

## When this is filled

Claude builds the demo against it. Scenes get reviewed against this spec, not against taste. When it goes to
Nishant, the defence pack for every decision behind it is DECISIONS.md, D-009 to D-018, each with reasons and a
reversal condition already written.
