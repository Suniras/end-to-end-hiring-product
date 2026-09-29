---
AUTHOR: Suniras
STATUS: complete 9 Aug 2026
SOURCE: the 47-file delivery archive. The case study slide is not a source, per Q-015.
NOTE: section 3 is Suniras's words, transcribed from conversation on 9 Aug 2026.
      Anything labelled "Claude's reaction" is not Suniras's and carries no authority.
---

# Unifi: what it proves about NuPlay, and what doesn't carry over

## 1. What was actually built

From the delivery archive, established in EVIDENCE.md E-016 to E-038.

Three behavioural questions on safety, reliability and teamwork, 90 seconds each, delivered by voice. The
outcome is Pass or In-Review. The agent can pass a candidate forward but never reject one. Results push to
Avature, the applicant tracking system, with a transcript, a recording, a summary and the reasoning.

Judgement is deliberately kept out of the AI. Eligibility is yes/no rules from the client's own procedures.
Open answers are matched against a phrase bank the client supplies and Nurix version-controls, highlighted
green and red, and shown to a human who makes every final call on flagged candidates.

Capacity is 20 concurrent calls, 50 at seasonal peak. English only. It went live, with go-live readiness
scheduled for late January 2026.

## 2. What it proves about NuPlay

Verified, and stronger than the case study slide suggested: Nurix can build and deliver a US frontline
hiring voice agent, integrated with a real applicant tracking system, with a worked compliance framework
behind it, tested by the client's own people who logged real failures.

Not proven, and the case study slide is not admissible for it: any outcome number. The 20% time reduction
and the 500-plus hours a month appear nowhere in 47 files of delivery documentation. See Q-015 and Q-016.

---

## 3. What does not carry over to US retail

Suniras, 9 Aug 2026:

> "when i said i wanted to see how similar the usecases are, i am now realising i was looking at how
> similar the solutions could be. its my fault that i was reasoning solution first. problem statements are
> a bit similar (high volume hiring) but scenarios are vastly different. in aviation, they have some major
> airports with majority of the volume and many minor ones with very limited staff. in retail, while we do
> have a large number of stores as well, the concentration is sort of more even (especially in the US) or
> it might be slightly affected by pupolation of the area in which each store is. so similar problem to be
> solved, vastly different in multiple variables"

The archive supports the concentration claim with numbers. Unifi has 200-plus airport stations and the
internal notes record that the top 20 stations account for about 50% of recruiting.

**Claude's reaction: this is the strongest structural observation made in this project so far**, and it
matters more than the two differences already noted in CLAUDE.md.

It is also the kind of observation that has consequences the person making it has not drawn yet.
Concentration is what makes central control workable. Where half the volume sits at twenty sites, a
central team can own it, a pilot at one site proves something at real volume, and tooling investment pays
back where the volume is. Remove the concentration and each of those three things stops being true.

What that does to who the buyer is, and whether a central talent acquisition team can hold this at all, is
the open question put to Suniras on 9 Aug 2026. It is not answered here.

**Other variables worth checking, since the observation is about "multiple variables" and only one has
been worked through:**

- English only, with Spanish a contractual future right rather than a delivered feature. Seasonal retail
  cannot wait for that.
- 20 concurrent calls, 50 at peak. US retail peak hiring is a different order of magnitude.
- The improvement loop is manual and monthly and runs on keyword lists the client writes. Would a store
  manager or a central team actually do that work every month?
- Aviation requires 18 and over. Seasonal retail hires 16 and 17 year olds, which brings separate rules.
- The Unifi deal was won on an internal champion, recorded as such in the sales handover, not on product.
- The buyer was unusually sophisticated, writing roughly 90 evaluation questions and a set of fairness
  requirements most vendors would struggle with. A store operations budget holder may ask none of that,
  which is a different problem rather than an easier one.

---

## 4. The compliance work

The most transferable thing in the archive, and it is knowledge rather than code.

A named lawyer's memo from June 2025 covering TCPA, the FCC's 2024 ruling on AI voices, Illinois BIPA,
Texas voiceprint consent, California and Colorado bias rules, and Mobley v. Workday on whether a vendor
can be liable. Plus a clause-by-clause map of NYC Local Law 144, California FEHA and Colorado SB 24-205
against what Nurix committed to do.

Two things to carry forward, and both are uncomfortable.

The compliance spreadsheet's own internal notes admit open gaps: ISO 42001 not held, nobody had answered
how discrimination would be detected, nobody owned the impact assessment.

And Nurix's answer to the buyer on adverse impact analysis was "not directly." Adverse impact is the one
measurement US regulators actually care about, and it is the one not offered. Whether that division of
responsibility with a customer is right is deferred to Phase 7 per D-007, not settled.

---

## 5. What I need to find out

Deliberately short. Suniras's instruction is that Unifi is not the focus and the case study slide is not a
source. Live items sit in TODO.md. Nothing Unifi-specific is blocking.
