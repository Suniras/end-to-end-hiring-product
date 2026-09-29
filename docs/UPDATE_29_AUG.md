# Update, 29 August 2026

What changed today, why, what is genuinely working, and what is still simulated.

Written for somebody who has the document and nothing else. If you only read one
section, read "What is real and what is not" near the bottom, because that is the
part it would be easy to get wrong in a meeting.

---

## The short version

The demo stopped being eleven screens over a seed file and became a product with
a backend.

Before today, every number on every screen was typed into `js/data.js` and every
button changed a variable in the browser. A refresh put it all back. There was no
model anywhere, no persistence, and the assistant answered from handlers that
read the same seed file the screens read.

Now there is a server. It holds a real domain model, a twenty-six state workflow
engine, a deterministic rules engine, an event log, an audit trail, an
integration boundary, and a tool layer the assistant reaches through. Thirty-six
candidates are seeded by replaying them through that engine, not by writing down
where they ended up. Every duration the product reports is computed from the
recorded events. State survives a refresh. The screening evaluation runs through
a real model when a key is set, and says plainly that no model ran when one is
not.

The target is the internal demo around 20 September.

---

## Why it needed a server at all

Three reasons, and only the third is about the model.

**Rules a browser owns are suggestions.** The rule that only a named person can
approve a hire was, until today, a function in `engine.js`. Anybody with the
console open could call something else. It is now a `by: ['human']` entry in a
transition table, checked on every move, with a test that tries to get past it as
an agent, as the system, as an external actor, and as the assistant confirming on
its own behalf. All four are refused.

**A demo that resets on refresh is a demo you cannot interrupt.** Somebody asks a
question in the meeting, you reload to show them something, and the state you
built up is gone.

**A key cannot live in a browser.** Not in a file it loads, not in local storage,
not anywhere. It is read in the server process and never appears in any response.

---

## What was built

### The domain model

Twenty-one tables with real identifiers and relationships, rather than candidate
details copied into each screen's object: stores, requisitions, candidates,
applications, prior employment, screenings, decisions, offers, background checks,
onboarding tasks, shifts, workflow events, agent actions, notifications, audit
events, communications, connector calls, exceptions, pending actions and model
calls.

Persistence is one JSON file, written atomically. Not a database engine, because
the dataset is a few hundred rows and this repository has a standing rule against
adding a package manager or a runtime. A JSON file needs neither and has the
property that matters most for something you have to trust: you can open it and
read it.

### The state machine

Twenty-six states from `APPLICATION_RECEIVED` to `DAY_90`, plus `WITHDRAWN` and
`TERMINATED`. Forty-eight transitions, each carrying who is allowed to make it.

Some transitions run automatically as soon as their preconditions are met. Most
do not. The two that matter most, `APPROVED` and `REJECTED`, are reserved for a
person and nothing else.

`TERMINATED` was added late in the day for a reason worth recording. The adverse
action bar lists termination first among the things that are unlawful while an
E-Verify mismatch is contested, and the machine had no way to represent one. So
the most important thing the bar forbids was not a move anybody could make, which
meant the rule looked enforced and was not being tested. It is now.

### Eligibility, and what a model is not for

Age, right to work declared, availability against the shift pattern, commute
band, and rehire eligibility. All deterministic, no model, and every rule returns
the values it used. "Failed on availability" is not something a person can act
on. "Needs Saturday evening, Sunday evening and Wednesday opening, and they
offered Saturday only" is.

### The rehire path

Matches an applicant against **this retailer's own employment records and nothing
else**. Two kinds of match, and the difference is on screen rather than hidden:
exact, where name, date of birth and the last four phone digits all agree, and
partial, where the phone number has changed, which is a suggestion for a person
to confirm rather than a fact.

When a match is inside the three-year window that 8 CFR 274a.2(c)(1)(i) opens,
running from the initial execution of the previous Form I-9 rather than from the
separation date, the product says which onboarding steps do not have to be done
twice, and which do. A new E-Verify case is always required and the screen says
so.

A match against a do-not-rehire record does **not** reject anybody. It stops the
application where it stands and puts it in front of a person, because the record
may be wrong and the only way to find out is to ask somebody who was there. Both
ways out require a reason and are recorded against whoever chose.

Tenant isolation is enforced in the query layer, not in the callers. Every read
requires a customer identifier and a read without one throws. There is a test
that plants a rival retailer's record for the same person and checks the lookup
cannot see it. This is not tidiness: pooling employment history across customers
and answering questions from the pool is what a consumer reporting agency does,
which is a different company under a different licence.

### Screening, and the model boundary

The conversation is synthetic, because we obviously do not have a real retailer's
applicants to ring up. Everything done to that conversation is real: the
transcript is assembled and stored, sent to whichever model is configured,
validated against a schema before anybody sees it, and the whole call written to
the audit trail with its prompt version, model, latency and any error.

The evaluation returns an overall recommendation, a verdict per criterion with
the candidate's own words quoted as evidence, concerns with severity, the
questions that went unanswered, a confidence, and a recommended next action.

Two things the schema makes impossible rather than discouraged. There is no
reject value in the recommendation enum, so an evaluation cannot end an
application. And a criterion the job requirements did not ask for is rejected at
validation, because a model inventing a criterion reads as a real assessment of
something nobody asked about.

Chain of thought is neither requested nor stored.

### Parallel work, measured rather than claimed

When a candidate accepts, eleven onboarding tasks are created at once and every
one with no unmet dependency starts immediately. Two of them genuinely cannot
start before the first day of work for pay, and the interface says which and why:
Form I-9 Section 2 needs a person to examine original documents, and the E-Verify
case cannot exist before there is an employment to verify.

The claim is stated as arithmetic. Sequential cost, meaning every task waiting
for the one before it, against the critical path, meaning the longest chain of
tasks that genuinely depend on each other. Both are sums of the same estimates,
so the difference between them is a real number rather than a slogan. Observed
wall clock is reported separately and labelled as not comparable, because it
includes waiting on people.

An earlier version of this screen subtracted observed wall clock from the
sequential estimate and reported the result as a saving. That was mixing
estimated minutes with elapsed days. It was caught and removed.

### The assistant

Twenty-seven intents, seventeen tools, and one rule that makes the rest work:
**both routes into the assistant end at the same tool registry, and the tools are
the only thing that can change data.**

With no key, a local classifier picks the intent. With a key, the model is given
the same tool schemas and picks for itself. Either way, a safety rule written
into the tool layer holds when the model is wrong, which a safety rule written
into a prompt does not.

Three confirmation levels. Reading answers and stops. Anything that changes
something or sends something outside the building says what it is about to do, to
whom, and waits. A hiring decision does the same, except that the confirmation
*is* the human act and is recorded as one: the named person approved, via the
assistant, at this time.

There is no bulk reject tool and that is not an oversight. A wrong bulk approval
is fixed by a conversation. A wrong bulk rejection is not fixable at all.

### Measurement

Nothing on any screen is a duration somebody typed in. Every stage change writes
an event carrying the actor, the actor type, whether ownership changed hands, and
how long the work took. Everything else is derived: application to offer, offer
to acceptance, acceptance to first shift, queue time against work time, handoffs,
people involved, and the funnel.

The current dataset reports a queue share of about 92%. That figure is not
flattering and it is not adjusted. It is what the events say.

There is a test that deletes an application's events and checks the reported
numbers change. If they had not, they were stored rather than measured.

### Time

The demo carries its own present, anchored at Monday 17 August 2026, 07:04, which
then advances in real time while you use it. A candidate who has been waiting
forty minutes has genuinely been waiting forty minutes.

The sidebar has a control that winds the present forward by four hours, a day or
three days. It does not fake anything. It moves the clock, and then the ordinary
ticker runs: a county court returns because its expected time genuinely passed, an
offer expires because three days genuinely went by. It is the most useful control
in the product for a demo and it is honest, which is a rare combination.

---

## What is real and what is not

**Real, and running:**

- Persistence. A refresh, or a server restart, does not lose the workflow.
- The workflow engine, its guards, and the actor rules on every transition.
- Eligibility. Deterministic, and it names the rule that failed with its inputs.
- The rehire lookup, the three-year I-9 window, and tenant isolation.
- Every duration and every count, computed from recorded events.
- The compliance clocks, derived from dates on the record against cited rules.
- The adverse action bar, which refuses the product's own user, with the reason.
- The audit trail, including refusals and everything the assistant did.
- The assistant's tools, running against the live database.
- The model call, when a key is configured.

**Synthetic, which is different from mocked:** the retailer, the five stores,
the eight requisitions and all thirty-six people are invented. Sunfield Markets
does not exist. The data is made up. What happens to it is not.

**Simulated, and labelled as such on screen:** every connector. Job boards, the
screening agency, I-9 and E-Verify, payroll, the identity directory, scheduling
and training. None holds a credential and none names a vendor we have integrated.
The adapter registry has no vendor field to fill in, which is what makes
"Connected to Workday" impossible rather than merely discouraged.

**Development adapters:** email and SMS. Messages are composed, recorded with a
provider reference and a delivery status, and never leave the machine. Outbound
voice is an interface rather than a running integration, and the record says so.

**Fallback rather than a model:** with no key set, screening evaluations come
from a deterministic match against the phrase bank the customer owns. That is a
real feature, and it is not a model. Every one of them carries `mode:
deterministic-fallback` and prints "No model ran." Its confidence is capped at
0.62 on purpose, because a rubric that has not read anything should not report
the confidence of something that has.

---

## Testing

Everything runs with `sh tools/test.sh` from the `demo` folder.

| Suite | What it covers | Result |
|---|---|---|
| Server, data | Seed, persistence, filtering, tenant isolation, metrics, timelines | 8 of 8 |
| Server, workflow | Eligibility, rehire, screening, decisions, offers, checks, onboarding, first shift | 16 of 16 |
| Server, model | Configuration, fallback, malformed replies, provider errors, timeouts, audit | 9 of 9 |
| Server, agent | Reading, acting, confirming, refusing, unknown and ambiguous names | 15 of 15 |
| Server, safety | Fourteen rules that have to hold when the model is wrong | 14 of 14 |
| End to end | A real server, one candidate application to first shift, then a restart | 2 of 2 |
| Assistant, training | Regenerated from the intent table. In sample, so 100% is the floor | 133 of 133 |
| Assistant, held out | Paraphrases that appear nowhere in the intent table | 32 of 32 |
| Assistant, safety | Must-not-fire cases, plus four that must fire, to catch over-blocking | 57 of 57 |

Baseline before today was 91 of 91, 31 of 32 and 43 of 43.

The one held-out miss, `clear everyone scoring over 70`, is fixed. It resolves to
a batch approval now, which lists all six names and asks before doing anything.

The safety suite grew from 43 cases to 57, and **two of the new cases found real
holes**. `send the offer to owen and ines` performed a single send against one of
them, because the block on naming two people for a singular action covered only
approve and reject. And `clear out everyone under 50` resolved to a bulk
*approval* of the weakest candidates, which is the worst available reading of
that sentence. Both are now blocked, the second by a general rule: a batch
approval qualified downwards is a rejection request wearing approve vocabulary.

The browser layer was walked with Playwright during the build. All eleven screens
render from live data with exactly one heading each and zero console errors, and
the full assistant loop was exercised: ask, confirm, execute, and read the audit
trail. `tools/e2e.spec.js` holds that walk as a committed spec. It needs
Playwright, which this repository does not install, so it is opt in. The
dependency-free equivalent, `server/test/e2e.test.js`, runs as part of the normal
test command and covers the same journey through the API.

---

## Things that were wrong and got fixed

Recorded because the pattern matters more than the individual bugs.

**Steps that finished out of order reported negative durations.** Onboarding
steps 11 to 14 run in parallel, so a later-numbered step routinely finishes
first. Reading "when the next step started" as "when this step ended" produced
negative times that then clamped to zero, which looked like instant work.

**A step reported itself done while a task nobody had done was still open.** Step
14 was showing complete while the badge and till access sat on the critical path,
because three of its four tasks had finished and no later step had started.

**Form I-9 Section 2 parked every candidate at step 11.** It cannot legally
happen before the first day of work for pay, and counting a future obligation as
outstanding work buried whatever was actually holding somebody up.

**A candidate could be in two places at once.** The state mapped to a step, that
step was finished, and the interface reported both "done" and "here now".

**Dependency chains only advanced one level per clock jump.** Winding forward ten
days finished what had started, unblocked the next level, and stopped. Ten days
now resolve as ten days.

**The seed replayed a candidate who was seventeen when she applied.** The age rule
evaluates on the application date, not today, and a candidate sitting exactly on
the boundary now was under it four months ago. The rule was right, so the seed
moved rather than the rule. The same happened to the rehire persona, whose
previous I-9 was three and a half years old, which correctly answered no to a
three-year window.

**Every date rendered in the viewer's local time.** The opening screen read
"Monday 17 August, 12:35" on a machine five and a half hours ahead of UTC, which
is a different hour of the working day from the one the compliance clocks were
counted against. Everything is formatted in UTC now.

**A hyphenated surname defeated the ambiguity check.** "Brennan-Ross" normalised
to one token, so a request naming "Brennan" matched only Cody Brennan and looked
unambiguous. A near miss that resolves to the wrong person is the worst failure
this product has, because it looks like a success.

**And one that is worth remembering separately, because the repository already
warns about it.** A stale cached `app.js` in the browser made a fix look broken
for twenty minutes. The README has warned about this since the browser-only
build. It caught us anyway.

---

## What is still open

**Nothing here is a bug. These are decisions or gaps.**

Steps 17 and 18, week one on the floor and the ramp to working unsupervised, are
tracked rather than instrumented. The product records that they began and who
owns them. It does not measure what happens inside them, because we have no
signal that would.

Badge and till provisioning is still the one part of the map with no public
vendor documentation anywhere, and it sits on the critical path to day one. In
this build it is a task a person marks done, and the ticker will never do it for
them, which is the honest representation.

The model path has been exercised against the error cases, the timeout, the
malformed reply and the schema validation. It has not been run against a live
provider, because there is no key. Add one to `demo/server/.env` and run a
screening; nothing else about the product changes.

The demo dataset reports an application-to-first-shift figure of around
seventeen days. That is the current state of the world in this dataset, not a
target, and the product's argument is the 92% of it that is queue.

---

## Running it

```
cd demo
node server/index.js
```

Then `http://localhost:4173`.

The overview page is at `/index.html` and the product at `/app.html`. `R`
reseeds, `C` opens the assistant, `P` toggles presenter notes.

To use a model, copy `demo/server/.env.example` to `demo/server/.env` and set
`LLM_API_KEY`. Everything runs without one.
