---
AUTHOR: Claude for the frame and the two competitor columns. Suniras for every judgement column.
WHAT THIS IS: the twenty steps between a person applying and that person still being employed at day 90
WHAT THIS IS NOT: a recommendation about which steps v1 should cover. That is yours, at Phase 5
DATE: 14 Aug 2026
---

# The funnel, step by step

## Why this file exists

You cannot choose what to build until the whole thing is written down in one place. Right now "end to end
hiring" is three words standing in for about twenty separate pieces of work, done by four or five different
people, across two or three systems.

This file lays those pieces out. It does not say which one to attack.

## Read this before using any of it

**The time column is nearly empty, and that is the real finding.**

Every published number about where time goes in frontline hiring traces back to vendor marketing with no
baseline. They are listed in section D of [research-inputs.md](research-inputs.md) under the heading numbers
not to use. So this file does not guess. Where we do not know, it says we do not know.

That means you are going to pick a slice without measured evidence. That is fine, as long as it is written
down as an assumption rather than dressed up as a finding, and as long as v1 collects the number you could
not get.

## How to fill this in

Three columns are mine and already filled. Two are yours and blank.

- **Time evidence.** What we can actually defend about how long this step takes. Mine.
- **Fountain** and **Paradox.** Whether each already sells something here. Mine, from the teardown at
  00-context/hiring platform/. Marked *sold* if it is on their marketing, *shipped, unmarketed* if the
  teardown found it in the product but not on the website, and *no* if neither.
- **Who does the work.** The human who spends the time. Yours.
- **Kind.** Whether the step is a decision, a handoff between people or systems, or a wait. Yours, and it
  matters more than it looks. See the note under the table.

---

## Hire

| # | Step | Time evidence | Fountain | Paradox | Who does the work | Kind |
|---|---|---|---|---|---|---|
| 1 | Application captured | none traceable | sold | sold, incl. Indeed Apply embed | This is an attract feature, and we are not bothered with how the application was captured | Ig it comes under handoff, since if someone has applied for a role, then that information might go from a marketing/hiring team to human resources/whoever is concerned with actually hiring the individaul who applied |
| 2 | Eligibility screened on hard rules: age, right to work, availability | none traceable | sold | sold | People who screen applications (might depend from company to company on who does this. I don't think any company which doesn't use AI has this process automated. Hence why fountain and paradox have them as products.) | Wait. Once a person applies, the people who actually interview are waiting for the eligibility check to pass before they interview. |
| 3 | Behavioural or fit screening | none traceable | sold, Cue, Apr 2026 | sold | Person hiring/HR/store manager | Decision I believe, but there is the tedious process of interviewing lots of candidates and then screening them. AI can help automate this. |
| 4 | Interview scheduled | none traceable | sold, Shift module | sold, their best known feature | Logistics people | Handoff b/w people and systems.  |
| 5 | Interview happens, or the candidate does not show | no-show figures exist but none is traceable | no | no | Person hiring | Dependent on the candidate. Nobody from the company side is involved. But our product can be such that it is sending reminders based on the interview timing, and also maybe call the person before the interview day reminding them to attend the interview.  |
| 6 | Hire or reject decision | none traceable | partial, scoring | partial, Pass or review | Person in charge of hiring | decision |
| 7 | Offer made | none traceable | sold | sold | Once interview and all other steps are done, an offer is made by HR | handoff b/w people and wait from the candidate's side |
| 8 | Offer accepted, or goes quiet | none traceable | no | no | Candidate | Wait |
| 9 | Background check and drug screen ordered | none traceable | sold via partners | sold via partners | A team of people who deal purely with bg verifications | Wait and handoff b/w systems |
| 10 | Background check comes back clear | none traceable | no | no | Next step is onboarding, which has different people doing the onnboarding depending on the roles.  | Handoff |

## Onboard

| # | Step | Time evidence | Fountain | Paradox | Who does the work | Kind |
|---|---|---|---|---|---|---|
| 11 | I-9, W-4, direct deposit, policy sign-offs | none traceable | sold, Onboard module | sold | whoever is taking care of onboarding | wait |
| 12 | E-Verify submitted and cleared | none traceable | sold, and it fails open on timeout | not evidenced | whoever is taking care of onboarding | wait for verifcation to pass |
| 13 | Required training and certifications | none traceable | sold | shipped, unmarketed, microlearning | whoever is taking care of onboarding and training | wait |
| 14 | Uniform, badge, systems access, payroll record created | none traceable | no | shipped, unmarketed, employer tax info | whoever is taking care of onboarding and training | wait |
| 15 | First shift scheduled | none traceable | sold, Shift module | not evidenced | whoever is taking care of onboarding and training | wait |
| 16 | Day one: shows up, or does not | figures exist, none traceable | no | no | whoever is taking care of onboarding and training | wait |

## Activate

| # | Step | Time evidence | Fountain | Paradox | Who does the work | Kind |
|---|---|---|---|---|---|---|
| 17 | Week one training on the floor | none traceable | sold, Pulse | shipped, unmarketed | in store managers/training team | wait |
| 18 | Ramp to working unsupervised | none traceable | no | no | once training is done | wait |
| 19 | 30, 60, 90 day check-ins | none traceable | sold | shipped, unmarketed, recognition and rewards | mnagers | waiting periods of 30 60 and 90 days |
| 20 | Still employed at day 90 | Korn Ferry: 75.8% annual hourly turnover in 2022, easing in 2023, nothing since | claimed by neither | claimed by neither | a person who is in charge of hiring efficiencies and such | idk |

---

## Three things the filled columns already tell us

**Steps 5, 8, 10, 16, 18 and 20 are unoccupied by both companies.** Look at what they have in common. Every
one is a step where the software is waiting on a human to do something outside the system. Show up. Say yes.
Come back clear. Turn up on Monday. Stay.

Both incumbents own the steps that happen inside their own product and neither owns the gaps between them.
Whether that is an opportunity or just the nature of software is your call. It is worth noticing that these
are also the steps where the candidate drops out.

**The activate stage is occupied but hidden.** Fountain's post-hire surface is four times its hiring surface.
Paradox has unmarketed routes for microlearning, recognition, rewards and employee chat. So activate is not
open ground, but neither company is selling it yet. Being early is not the same as being alone.

**Nobody claims step 20.** Not one case study metric at either company is retention or 90-day attrition.
Found independently by two different research methods, which makes it the strongest finding in this project.
It is unclaimed because it is genuinely hard to prove. Opening and trap at once.

## Why the Kind column matters

When you mark each step as a decision, a handoff or a wait, a pattern usually appears: the time is not in
the decisions. It is in the handoffs and the waits.

A decision takes a person two minutes. A handoff between a recruiter and a store manager can take two days,
because it depends on somebody opening an email. A wait for a background check takes as long as it takes.

If that holds here, then a product that makes decisions faster is solving the cheap part. That is worth
knowing before you pick, not after. But do not take my word for the pattern, mark the column and see.

## What has to be true before this file is finished

- Every step has a named role against it, even if the role is a guess. A step nobody owns is a step we do
  not understand.
- Every step is marked decision, handoff or wait.
- Any step you think is missing is added. Twenty is my count from what is recorded in this repo, not a
  standard. Retail-specific steps like availability matching against a shift pattern may deserve their own
  row.

Then the slice decision is possible, and it belongs in 05-strategy/.

---

# Reading back what Suniras filled in

**AUTHOR of this section: Claude, 16 Aug 2026.** This counts what is in the Kind column above and says what it
adds up to. It does not say which steps v1 should cover.

## Two decisions out of nineteen

**Updated 16 Aug.** Steps 13 to 16 were filled in: same owner as the rest of onboard, and wait for all four.
That leaves step 20, where idk is the correct answer because 20 is an outcome rather than a step.

| Kind | Steps | Count |
|---|---|---|
| Decision | 3, 6 | **2** |
| Wait | 2, 5, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19 | 12 |
| Handoff | 1, 4, 10 | 3 |
| Both wait and handoff | 7, 9 | 2 |

So seventeen of the nineteen steps you marked are a wait or a handoff, and two are decisions.

I said before you started that the time usually sits in the handoffs and the waits rather than the decisions,
and that a product which makes decisions faster is solving the cheap part. **Do not treat that as confirmed
just because your column agrees with it.** You read that sentence before you filled in the column, so the
column is not independent of it. What it does confirm is that when you thought about each step properly, you
did not find decisions. That is worth something. It is not a measurement.

## The part that is independent, and it is the interesting one

Cross the Kind column against the two competitor columns, which were filled from the teardown before you
touched the file.

**Both incumbents sell into both of the steps you called decisions.** Step 3, behavioural screening, is where
Fountain launched Cue in April 2026 and where Paradox sells. Step 6, the hire or reject call, is partial at
both.

**Every unoccupied step you answered is a wait or a handoff.** The six steps neither company sells into are 5,
8, 10, 16, 18 and 20. You marked 5, 8 and 18 as waits, 10 as a handoff, left 16 blank and said idk to 20. Not
one is a decision.

That is not something either of us arranged. Two independently produced columns line up: the industry has built
into the decisions, and the steps it has left alone are the ones where somebody is waiting.

Whether that is an opening or just a description of what software can and cannot do is yours to judge. A wait
for a background check does not get shorter because you bought software.

## The onboard blanks, now filled

**Answered 16 Aug.** All four are owned by whoever runs onboarding and training, and all four are waits.

That makes the whole onboard stage, steps 11 to 16, one owner and six consecutive waits. No decision anywhere
in it. If that is right, onboarding is not a judgement problem at all. It is six things queueing behind each
other with one person chasing them, and two of those waits have legal clocks that nobody can compress.

Worth flagging one consequence. **Step 16 is day-one no-show**, one of the largest single drops anyone claims,
and a step neither incumbent occupies. Calling it a wait owned by the onboarding person is a real answer, and
it means nobody is actively doing anything between the paperwork clearing and the person either turning up or
not.

## Three smaller things

**Step 1, and this one matters.** You wrote that application capture is an attract feature and we are not
bothered how the application arrived. The boundary may well be right. The reason is not quite.

Attract is making somebody want to apply, which is what D-009 rules out, for the good reason that we have no
way to get outcome data nobody else has. Capture is the form itself and where it lands. Those are different.
Paradox embeds into Indeed Apply so that applications complete inside Indeed rather than on a career site, and
that is capture, not attract.

It matters because a boundary drawn for the wrong reason moves the first time somebody pushes on it. If step 1
is out, it should be out because we choose to start from an application that already exists, not because it got
filed under attract.

**Step 5 is the first product idea you have written down.** Reminders timed off the interview, and possibly a
call the day before. Three things sit on top of each other there and you should see them together before you
decide anything: it is a step neither incumbent sells into, you reached for it unprompted, and Nurix has already
shipped outbound voice for exactly this population at Unifi.

That convergence is real. It is also the exact shape of reasoning that produced the two solution-first moments
you caught earlier in this project, once by me and once by you. Both can be true. Note it, do not build on it
yet.

**Step 20 is my error, not yours.** Still employed at day 90 is an outcome you measure, not a step somebody
performs. Idk was the right answer and the row was badly designed.

## What this section deliberately does not do

It does not name a slice. Counting your column tells you where the work is not, which is in the decisions. It
does not tell you which of thirteen waits and handoffs is worth a product, whether anyone would pay to remove
it, or whether removing it is even possible.

That is step 2, it lives in [05-strategy/v1-slice.md](../05-strategy/v1-slice.md), and per CLAUDE.md it is
yours.
