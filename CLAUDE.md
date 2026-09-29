# CLAUDE.md

Instructions for any Claude Code session working in this repository. Read this file first, then docs/CONTEXT.md,
then docs/TODO.md. That is enough to start.

Written 27 August 2026. This file replaces an earlier version that went missing from the repository root.

---

## What this project is

Suniras Rapelli is building a frontline hiring platform for large US retailers, meaning retailers above roughly
two billion dollars in revenue. The product hires, onboards and activates hourly frontline staff at volume.

He reports to Nishant Yadav, who owns NuAnchor and NuAisle at NuPlay. Nishant is the audience for most
documents in this repository.

Suniras is learning product management by doing this. That fact drives the most important rule below, so do
not treat it as background colour.

The project runs on phase gates, from P0 ingest through P7, then S1 to S8 for the build. It has moved out of
diagnosis and into strategy. It is not in build.

---

## The rule that overrides everything else

**Suniras does the thinking. You do not produce judgement work he has not drafted first.**

Never write, for him or in his voice: a problem statement, a persona or persona list, a competitive teardown, a
positioning statement, a metric tree, acceptance criteria, or a PRD.

If he asks for one of those, say so once in a sentence or two, then follow his instruction. He can waive his
own rule. He did exactly that for the PRD on 27 August, and the PRD records who wrote which part.

What you may write freely:

Research and research synthesis where he set the question. File scaffolding and empty templates. Reformatting
or assembling material he has already produced. Summaries of documents. Verification of claims. Code, including
the demo. Records of decisions he has made, in his own words wherever possible.

The distinction that matters: you inventory what exists and verify what is claimed. He decides what it means.

When you find a gap in his thinking, ask the question that exposes it. Ask one question at a time and wait.
Do not stack three questions and do not answer your own.

---

## How to write

Plain simple English. Short sentences. Everyday words. Define a term the first time it appears.

No em dashes. This is a hard rule, not a preference. Check before you finish: `grep -c '—' file.md` should
return zero. The only permitted exceptions are inside a verbatim quote of somebody else's words.

Use bold rarely. A page where every third phrase is bold reads as sales copy. If more than about one line in
five is bold, cut some.

READMEs and documents need real context and detail. Suniras rejected a whole set of documents as unreadable on
9 August and asked for a rewrite. He also told Claude on 27 August that a PRD full of internal decision
references was useless to anybody reading it cold. Both corrections point the same way: write for the reader
who has the document and nothing else.

Nishant has twice complained about writing that sounded machine-generated, once calling it randomly
constructed. Anything going to him gets read aloud before it is sent.

**When you write code to a file, do not paste that code back into the chat.** Describe in plain English what it
does and why. This is a standing instruction from the user's global config.

---

## Evidence discipline

This is the second most important section. The project has been wrong in public more than once and the
discipline exists because of it.

Tag every claim as verified, assumption or unknown.

Verified means a regulation, a court, a government dataset, a filing, or a named first-party source states it.
Cite it.

Assumption means it is probably true, has not been checked, and the way to check it is written down.

Unknown means we do not know, and it is logged in docs/OPEN-QUESTIONS.md.

Four standing rules, all of which have caught a real error:

**Anything a competitor says in its own marketing is an assumption, never verified.** A vendor saying its
product cut hiring time by 30% tells you what the vendor claims.

**Never invent** customer quotes, interview findings, market sizes, competitor pricing, win rates, or named
accounts. If a number is needed and we do not have it, say so and say where it would come from.

**An analogy is not evidence.** Where a claim rests on resemblance to NuAnchor or the Unifi build, check which
direction it came from. Far more material exists about those two than about retail hiring, so a resemblance
noticed now probably comes from what was at hand rather than from the problem.

**Nothing in 00-context is evidence about hiring.** Six of seven sources are about retail buying and the
seventh is about aviation.

### Never write credentials or workspace passwords into repository files

A sandbox API key exists at `docs/00-context/unifi/Unifi - Abrightlabs 10.40.18/Docs Shared by Client/Nurix Test API
key - Sandbox.txt`. It has never been opened and its contents are recorded nowhere. Keep it that way.

---

## The five files at the root, and what each is for

These are working records. They are appended to constantly, they contradict earlier versions on purpose, and
they keep withdrawn claims visible so a reversal can be traced. Keep all five current without being asked.

**docs/CONTEXT.md** is the state of the project. Where we are, who everybody is, the vocabulary, unresolved
conflicts, and withdrawn claims kept visible. A new session reads this second. It has a reading order for the
whole repository near the top. It is meant to stay under about 250 lines and is currently over, so it needs a
trim.

**docs/DECISIONS.md** holds every decision, newest first, numbered D-001 upward. Each one has the date, what was
decided, why, what it costs, and a line saying what would change our mind. That last line is not optional. It
is the only way to tell months later whether a decision still holds or the world moved. Thirty decisions as of
27 August. D-020 reverses D-015 and matters more than any other single entry.

**docs/OPEN-QUESTIONS.md** holds everything we do not know, numbered Q-001 upward, with a person's name against each
one. Read the index at the top before anything else: it lists what is blocking, what shapes the build, and what
is merely tracked. Question numbers never change, because other documents cite them. Answered questions stay in
the file as a record. Forty-two as of 27 August.

**docs/EVIDENCE.md** holds every claim we treat as true with its tier and source, numbered E-001 upward, plus a list
of circulating numbers that must not be used. That list is load-bearing. Read it before quoting any figure.

**docs/TODO.md** holds things only Suniras can do: decisions that are his, and answers that have to come from a
person. Newest section at the top. If something moves to docs/DECISIONS.md, take it off this list.

---

## The folders

The numbered folders follow the phase model. Each has a README saying what belongs in it.

`00-context` holds source material, read only. Never edit anything in here.

`00-context-notes` holds anything derived from that source material. Every file opens with an AUTHOR line, so
the rule about who writes what is enforced by the structure rather than by memory.

`01-diagnosis` holds the funnel map, the compliance explainer, and every research and verification round. The
funnel map is the single most cited document in the project: twenty steps from application to day ninety, with
each step classified. Seventeen of nineteen classifiable steps are waits or handoffs. That ratio is the
foundation of the product argument.

`02-landscape` holds competitor work. Fountain, Paradox, the gap claims, and a long assessment of a PRD written
by Anuj Jain at NuPlay.

`03-discovery` is for talking to real people. It has `raw/` for verbatim notes, `synthesis/` for what they mean,
and `raw/internal/` for conversations with colleagues. The split between raw and synthesis is not tidiness:
interpretation drifts over months and raw notes do not, and when a finding gets challenged you need the actual
words. The gate for this phase is five people who do not work at Nurix. **That count is zero.** Nothing in
`raw/internal/` counts toward it.

`04-segmentation` holds the field structure work on district managers and field HR.

`05-strategy` holds the scope decisions, the automation breakdown, the connector map, the integration surface
map, the exception register, the first thirty days, the problem statement scaffold, and a review of the
visibility framing.

`06-validation` holds the demo and its read-aloud script. See below.

`07-prd` holds the PRD. Version 0.1 as of 27 August, deliberately incomplete in two sections.

`08-architecture` through `14-operate` are scaffolded and empty.

`shared` holds documents written for somebody outside this repository: the status document for Nishant, the
call agenda, the question lists, and meeting records. Each is a dated snapshot and starts going stale
immediately, because the working records keep moving underneath it. **Check the date at the top before sending
anything from there.**

`retail-hiring-agent-main` is Anuj Jain's work, handed over by Nishant. Read it, do not modify it.

---

## The demo

**Rebuilt 29 August 2026.** It used to be eleven browser screens over a seed
file, running from `file://`. It now has a backend. What changed and why is in
`docs/UPDATE_29_AUG.md`, and the operating detail is in `demo/README.md`. Read
one of those before touching it.

Run it:

```
cd demo
node server/index.js
```

Then `http://localhost:4173`. `index.html` is the overview page and `app.html`
is the product, eleven screens.

**It no longer opens from `file://` and cannot.** The browser holds no data of
its own and the API key has to live where a browser cannot reach it.

Still true, and still a hard rule: no bundler, no framework, no package manager,
no `node_modules`. The server is Node's own `http` module and the browser code is
plain JavaScript in classic script tags. The whole product fits inside what Node
already ships. Keep it that way.

### How it is put together

`demo/server/` holds the backend. The parts worth knowing before you change
anything:

`lib/schema.js` is the state machine. Twenty-six states and forty-eight
transitions, each carrying who is allowed to make it. `APPROVED` and `REJECTED`
are `by: ['human']` and there is a test that tries to get past that as an agent,
as the system, as an external actor, and as the assistant confirming on its own
behalf.

`lib/workflow.js` is the only way an application changes state. A refused move
returns a reason and writes an audit entry. It never silently does nothing.

`lib/rules.js` is deterministic eligibility and the rehire lookup. No model runs
in it and there is a test that reads the source to check. The rehire lookup reads
one customer's own records, enforced in the query layer rather than by the
callers.

`lib/metrics.js` derives every duration the product reports from recorded events.
Nothing is stored. There is a test that deletes an application's events and
checks the numbers change.

`lib/llm.js` is the only place a model is called. The key is read here and never
appears in any response. With no key the product still runs, on a deterministic
rubric that is stamped `mode: deterministic-fallback` and prints "No model ran"
on every screen that shows it. **Never let a fallback be described as a model.**

`lib/agent/` is the assistant. Both routes, the local classifier and the model,
end at the same seventeen tools, and the tools are the only thing that can change
data. That is what makes the safety rules hold when the model is wrong.

`lib/seed.js` creates thirty-six people by **replaying them through the workflow
engine** with the clock wound back, not by writing down where they ended up. If
you change a candidate's pace, every reported median moves, because there is no
second copy of it.

`demo/js/steps.js` is the canonical twenty-step table, read by the server, the
browser and the test harness. One copy on purpose.

### The clock

The demo carries its own present, anchored at Monday 17 August 2026, 07:04, which
advances in real time while you use it. The sidebar has **+4h**, **+1d**, **+3d**
controls. They move the clock and let the ordinary ticker run. **They do not fake
data**, and the copy on screen says so. Everything is formatted in UTC, because
the compliance deadlines are computed in UTC and rendering the same instant in
the viewer's local time put the opening screen in a different hour of the working
day.

### Testing

```
cd demo && sh tools/test.sh
```

Server suite 62 of 62. End to end 2 of 2. Assistant: training 133 of 133, held
out 32 of 32, safety 57 of 57.

**Run them after any change to the workflow engine, the tools or `nlu.js`.**

The safety suites exist because they keep finding real holes. Growing the
assistant's suite from 43 cases to 57 during the rebuild found two: a singular
send acting on one of two named people, and "clear out everyone under 50"
resolving to a bulk *approval* of the weakest candidates.

Three traps recorded so nobody rediscovers them:

- Lowering the fuzzy-match threshold on concepts costs nine cases, because
  "fire" is one edit away from "hire".
- A person-name fuzzy match landing just under the gate approves **nobody**
  rather than the wrong person, which looks like a pass and is not.
- A runner-up intent that could never fire, because it needs a person and none
  was named, used to eat the margin and take a valid question down with it.

Browser coverage is `demo/tools/e2e.spec.js`, which needs Playwright and is
therefore opt in. `demo/server/test/e2e.test.js` walks the same journey through
the API with no dependencies.

**Browser caching produced false measurements repeatedly during the rebuild, and
the README has warned about it since the browser-only build. It still caught us.
Hard reload before you believe a change did not take.**

## What is settled, so you do not reopen it

All twenty funnel steps are in scope. No slice, no wedge.

We are a connector layer, not the system of record. This reversed an earlier decision and it is the most
consequential entry in docs/DECISIONS.md.

Step 6 produces a score and a human still decides. That makes the product a regulated automated employment
decision tool in New York City and California.

We never perform background checks. We order them, track them and run the notice sequence.

I-9 and E-Verify go through an embedded vendor that must expose the E-Verify case state.

Advertising and attraction is out. Management-role hiring is out for version 1. Nothing from NuAnchor transfers
at product level.

Identity matching reads one customer's own records only. Pooling across customers makes us a consumer reporting
agency, which is a different company. Enforce tenant isolation at the data layer.

Desk research is closed. Four rounds. The remaining unknowns became things the first deployment has to measure.
Three verification rounds since have confirmed the pattern: legal deadlines are all published, operating
durations are published by nobody.

---

## What is open, and the two that block

**Who the primary user is.** Owed since 16 August. There is no level in a retailer's org chart where hiring
volume and hiring authority both sit, so this cannot be found, only chosen. The comparison table is in Q-027.

**Which success metrics win.** An earlier decision says time to hire and number of hires. The goals as stated
on 26 August are time to hire, number of people involved, and least manual work. They conflict and the metric
tree depends on which is true.

Also open: pricing, deferred deliberately. Job board distribution. Contingent staffing. And practitioner
access, which is the oldest unmanaged risk in the project.

---

## How this project has gone wrong, so you can avoid it

Every item here actually happened.

**A research round was written up before its verification pass finished.** Thirteen claims that had already
reached four documents were then killed, including one that was the sole independent support for a build order.
**Never publish a research round before its verify pass completes.**

**A figure from a payroll vendor's blog was put in front of Suniras and nearly went into a PRD.** It said 19% of
grocery hires were returning workers. The real figure from Census data is 8.9% and retail is below the
all-industry average. **Check what is behind a number before repeating it, especially a convenient one.**

**A claim that Paradox achieves a 72 hour hire was believed by both Suniras and Claude.** It has no source
anywhere. **When a number feels widely known but you cannot find who said it, that is the tell.**

**A conflict between two colleagues was invented by misreading one of them.** Anuj said the store manager is
buried because of a 12 to 14 hour day. That is a claim about capacity. It was read as a claim about application
volume and written up as a contradiction with Joy that never existed. **Read what a claim is actually about
before deciding it contradicts another one.**

**Three duplicate evidence IDs existed in two sections of docs/EVIDENCE.md at once.** Check the highest existing ID
before adding one.

**Verification agents have died four times because the machine went to sleep mid run.** When that happens, say
which sections had one pass instead of two, and label them in the file. Do not let an absence read as a clean
result.

**Findings from research agents have quoted text that does not exist on the page they cited.** Five fabrications
in one run. This is why every finding gets an adversarial pass instructed to refute rather than confirm, with a
rule that a law firm blog is not primary for a rule of law and a vendor's claim about its own results is never
verified.

---

## Practical notes

Do not install software on this machine without asking. No Homebrew, no new runtimes, no daemons. Prefer what
is already there.

Use the scratchpad directory for temporary files, not `/tmp`.

Workflows and deep research are available but only when Suniras asks for them, unless a session reminder says
otherwise. They are the right tool for verifying a batch of factual claims and the wrong tool for writing prose.

When a document changes a decision, update docs/DECISIONS.md in the same pass. A decision that lives only in a
document nobody reads is not a decision.

Keep the phase folders honest. If work belongs in `03-discovery` do not put it in `05-strategy` because that
folder is where you happen to be working.
