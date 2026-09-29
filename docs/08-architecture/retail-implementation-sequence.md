---
AUTHOR: Claude. The sequencing and the exit criteria are engineering. The three questions in "What this
  sequence assumes" are Suniras's, and the sequence cannot be started until they are answered
WHAT THIS IS: the recommended order for implementing the frozen architecture, with prerequisites and exit
  criteria per phase, and the definition of the page-by-page UX process for phases 3 and 4
WHAT THIS IS NOT: a schedule, an estimate, or a commitment. No dates. Nothing here is started, and no code
  was changed to produce it
DATE: 2 September 2026
COMPANIONS: retail-implementation-decision-register.md is what has to be frozen before phase 0 closes.
  retail-demo-vs-platform-boundary.md is what phases 3 to 5 are allowed to simulate
---

# Implementation sequence

## What this sequence assumes, and none of it is mine to assume

Three answers change the shape of everything below. They are in the decision register as open items owned by
Suniras, and they are repeated here because the sequence is not startable without them.

**Is the internal demo still targeted at 20 September?** That date came from the P0 and P1 brief and has not
been mentioned since. Today is 2 September. If it holds, **phases 1 and 2 do not fit inside it**, and the
sequence has to fork: a demo track that touches no architecture, and a platform track that runs after. If it has
moved, the sequence below runs in order as written.

**Does the zero-dependency rule survive?** Phase 1 cannot be done without breaking it. One JSON file cannot
carry versioned tenant-scoped definitions, and it cannot carry a second tenant's ids because three of our id
namespaces are not tenant-qualified. That rule is what makes the demo runnable by anybody with Node and no
credentials, so it needs an explicit decision rather than a quiet erosion.

**Are we asking Srikanth's team for the two contract extensions before or after we build?** Asking first costs
calendar time and gets one shared vocabulary. Asking after gets a fork we then have to reconcile.

---

## Phase 0. Architecture and contract freeze

Nothing is built. The purpose is that every later phase can point at a decision instead of relitigating one.

**Prerequisites**

- The three artifacts from 2 September exist: the workflow definition, the contract gaps, the mapping.
- The decision register exists and Suniras has read it.

**Work**

1. Suniras rules on every row in the register's open table, or explicitly defers it with a guardrail the way
   Q-030 was deferred.
2. The three questions above are answered.
3. The two contract extension requests go to Srikanth's team, or are explicitly held back: named conditions,
   and a dependency-aware parallel region. Plus the `STAFF_TASK` rename.
4. The "do not change" list is agreed as binding rather than advisory.
5. The demo versus platform boundary is agreed, because it decides what phase 5 is allowed to pass.

**Exit criteria**

- Zero rows in the register's open table without either a decision or a dated deferral with an owner.
- The contract delta is a fixed list. Discovering a third genuine extension after this point reopens phase 0
  rather than being absorbed.
- Every item on the do-not-change list has a citation to a decision, a law, or a test that enforces it.

**What phase 0 must not do.** Decide any UX. Write any code. Reopen a settled decision because it is
inconvenient to implement.

---

## Phase 1. Foundational workflow changes

The smallest set of changes that makes the definition meaningful. Everything here is invisible on screen, which
is why it goes first and why it is the phase most at risk of being skipped under date pressure.

**Prerequisites**

- Phase 0 closed.
- The zero-dependency question answered, because step 2 below depends on it.
- The two live defects fixed first, as a warm-up that touches nothing structural: the undefined `checkCard` call
  that breaks the candidate screen for fifteen of thirty-six candidates, and the invariant `savedPct`.

**Work, in dependency order**

1. **Consent, retention class, data class, and a deletion path.** First, because it is the only item where
   waiting is strictly more expensive: adding it later means reprocessing every record already touched. It is
   also a gap against our own PRD, which commits to four years of retention of system inputs in California.
   `store.js` currently has no delete method at all.
2. **Real persistence, with the tenant gate carried over verbatim.** The gate is the part that must survive
   unchanged: `all()` and `insert()` throwing without a tenantId is what makes D-030 structural rather than
   conventional. Fix the three non-tenant-qualified id namespaces in the same pass.
3. **Authentication and a real actor type.** Small, and it converts the human-only rules from asserted to
   enforced. Today every HTTP request builds `actor.type: 'human'`, so `by: ['human']` protects against the seed
   replay and the test suite rather than against a live agent caller.
4. **One stage-execution contract.** Collapse the four current execution paths into one activity interface
   resolved from a registry, the way guards and effects already resolve. This is the prerequisite for a
   definition being able to name anything.
5. **Named conditions.** Formalise `GUARDS` as an addressable, reusable condition map, and put
   `noAdverseActionBar` on the four adverse enforcement slots. All twenty-five adverse transitions have an empty
   guard slot today.
6. **Definitions into versioned rows, with a per-application binding and version pinning.** The seed drives the
   definition rather than walking the sequence in straight-line code, and `tick.js` loses its private successor
   map, so the graph has one source of truth instead of three.
7. **A dependency-aware parallel region**, so the eleven-task graph with its four dependency edges is expressed
   rather than smuggled inside a node.

**Exit criteria**

- Two applications on two different definition versions run correctly at the same time, and editing a published
  definition does nothing.
- A second tenant, added to the store, is correctly isolated: its own rows resolve, the first tenant's do not,
  and the existing rival-retailer test still passes.
- The full suite passes at or above the baseline: server 62 of 62, end to end 2 of 2, assistant training 133 of
  133, held out 32 of 32, safety 57 of 57. **A reduction is a failure, not a trade.**
- New tests exist for: definition validation refusing an unknown node or unregistered activity; version pinning;
  the adverse bar refusing at all four slots and writing an audit entry at each; the dependency region ordering
  the eleven tasks correctly.
- A deletion request reaches every table.
- Nothing on screen has changed. If a screen changed in phase 1, something was built that did not belong here.

---

## Phase 2. Retail domain and workflow implementation

The parts of the definition that are `provenance: neither`, meaning nobody has built them on either side.

**Prerequisites**

- Phase 1 exit criteria met, all of them.

**Work**

1. **The FCRA branch as a path rather than an exception.** Today an adverse check result is stopped by a
   blocking `adverse_review` exception, which works and is invisible in the graph. Express it as the four nodes
   the definition specifies, with the gap duration as tenant policy because the statute sets no number.
2. **An application intake writer.** Nothing creates an application at runtime today; they exist because the
   seed writes them. Until this exists, "the same person applies twice" is unreachable rather than handled, and
   step 1 is a schema with no code path.
3. **Approval as an entity**, with the pay-rate-above-band case at step 7 as its first producer. Note that the
   reference implementation has the entity and no producer, so we would be ahead of it here.
4. **A distinguished override path**, audited as an override rather than as normal progression. Restated in
   graph terms: an edge taken with a failing guard, or an edge the definition does not contain.
5. **Interview scheduling**, which exists on neither side.
6. **An outbox**, if and only if a connector has become real. It is pointless while every adapter is a pure
   function that cannot fail except on request.

**Exit criteria**

- Every activity in the definition is either implemented or still honestly marked `provenance: neither` on
  screen as well as in the file.
- A background check that returns a record walks the FCRA path with a person at both notice steps, and cannot
  reach a rejection without them.
- A refusal writes a workflow event as well as an audit entry, closing the gap where a refused action is
  currently invisible to metrics and to the funnel.
- The twenty-step funnel is unchanged. Same twenty steps, same owners, same classification.

---

## Phase 3. Demo UX specification

No code. The output is a written specification per page, approved before anything is touched.

**Prerequisites**

- Phase 2 exit criteria met, or an explicit decision that a given page will be specified against phase 1
  behaviour and revisited.
- The demo versus platform boundary agreed, so a question about a screen has a settled answer about what is
  allowed to be simulated behind it.

**The protocol, and it is the point of this phase**

One page at a time. For each page, in order:

1. **I inventory the page.** Every section, component, metric, table, column, filter, action, state and
   transition that exists today, with file and line. No proposals.
2. **I ask multiple-choice questions.** Every meaningful component, behaviour, state and interaction. Each
   question carries two to four concrete options plus "Other or none of these" wherever a fifth answer is
   plausible. The tool takes at most four questions per batch, so a page is several batches.
3. **Suniras answers.**
4. **I summarise the decisions** back, in his words where he gave them.
5. **Suniras approves the page specification.**
6. Only then does phase 4 touch that page.

**The rule this phase exists to enforce.** I never silently infer a UX decision where more than one reasonable
choice exists. Where I have a recommendation I put it first and mark it, and it is still a question.

**One tension worth naming.** There is a standing instruction to ask one question at a time and wait, which
exists so a question that exposes a gap in the thinking does not get buried in a batch. That still applies to
that kind of question. These are different: an enumerated choice between known options is not a gap-exposing
question, and batching four of them is what makes a page tractable. If a question turns out to expose a gap
rather than offer a choice, it comes out of the batch and gets asked alone.

**The question checklist.** Applied per page, and only where relevant. A page with no table gets no table
questions.

*Purpose and audience:* page purpose; target user, given that the store manager is the decided user under D-031
and the buyer is not yet a person; what the page is for in the demo narrative.

*Structure:* layout; sections and their order; what is above the fold; what collapses.

*Data:* metrics and which are derived versus stored; tables; columns and fields; filters; search; sorting;
default sort; pagination or not; row density.

*Interaction:* actions; buttons and their placement; modals; drawers; inline editing; bulk actions and whether
any are permitted at all on this page.

*AI and automation:* which AI outputs appear; how a recommendation is presented; how evidence and citation are
shown; how a deterministic fallback is labelled; what automation runs in the background and whether it is
visible.

*Human decisions:* which decisions are taken on this page; what confirmation each requires; what reason is
required; what cannot be done here.

*Exceptions and state:* how an exception appears; whether it blocks; notifications; loading, empty, error and
success states; what an aged item looks like.

*Governance:* permissions and what a different role sees; audit information shown on the page.

*Edges:* edge cases; transitions to other pages; deep links; what backend behaviour each action triggers and
what gets recorded.

**Page order, and the reasoning.** Order by which page's decisions constrain the others, not by importance.

1. **deck** first. It defines the work-queue idiom that decide, screening and flag all reuse, and it is the
   exception-based operating model made concrete.
2. **decide**. The human decision surface, and the most regulatorily loaded page in the product.
3. **candidate**. The deepest page, and the one with the live defect.
4. **flag**. The exception queue, and the most portable screen we have.
5. **screening**. Where AI output and its provenance labelling get settled.
6. **pipeline**, **funnel**. The spanning view, which is the claim under D-013.
7. **compliance**, **checks**. Jurisdiction-rendered surfaces.
8. **sources**, **store**. Reporting, and the buyer's surface, which is the persona slot still not a person.
9. **The assistant panel**, which is not a route but is the most transferable asset we hold.
10. **The overview page** at `index.html`, which currently makes zero API calls and shows invented figures with
    no label, and therefore needs a decision rather than a design.

**Exit criteria**

- Every page has an approved specification.
- No specification contains a component whose data source is undecided.
- Every simulated element in every specification is matched to a row in the boundary document.

---

## Phase 4. Page-by-page implementation

**Prerequisites**

- That page's specification approved in phase 3. Not the whole set: a page can be built as soon as its own
  specification is approved.

**Work, per page**

1. Implement to the specification and nothing beyond it.
2. Where the specification turns out to be under-specified, stop and ask rather than choose.
3. Hard reload before believing a change did not take. Browser caching produced false measurements repeatedly
   during the August rebuild and the README has warned about it since.

**Exit criteria, per page**

- Renders from live data with exactly one page heading and zero console errors.
- Every action records something. A button that changes from Send to Sent without an audit entry is a
  regression, and that specific failure is named in the standing brief.
- Every simulated element is labelled as simulated on screen.
- No decorative metric. No number on screen that is not either derived from recorded events or explicitly
  labelled as an estimate.
- The suite still passes at baseline.

---

## Phase 5. End-to-end validation

**Prerequisites**

- All pages implemented.

**Work**

1. The full suite, all five parts.
2. The twenty-seven-step demo scenario walked end to end in a real browser.
3. A restart mid-scenario, to prove state survived, which is what the existing two-case end-to-end walk already
   does at the API level.
4. The honesty sweep: every screen checked against the boundary document. Anything simulated says so, no
   fallback is described as a model, no vendor is named that we have not integrated.
5. The Playwright spec run, which is opt in because Playwright is not installed in the repo.

**Exit criteria**

- Suite at or above baseline on all five parts.
- The scenario completes without a manual database edit.
- A reader who knows nothing about the build cannot find a screen that overstates what the product does.
- Every number on screen traces to either an event or a labelled estimate.

**What phase 5 must not do.** Pass a screen because the demo is soon. The boundary document exists so that
"good enough for the demo" is a decision somebody made in advance rather than one made under pressure at the
end.

---

## The fork, if the demo date holds

If 20 September is live, phases 1 and 2 do not fit. The honest split, and it is Suniras's call rather than mine:

**Demo track, touches no architecture.** Fix the two defects. Adopt the resolved-mode adapter reporting, which
is one file and strictly better than what we have. Run phase 3 and phase 4 against the current engine. Phase 5
as written.

**Platform track, after the demo.** Phases 1 and 2 in order.

**What the fork costs.** Every page specified against the current engine is a page that may need revisiting when
definitions move into rows, because a screen that reads a state name is coupled to states being code. The way to
limit that is a phase 3 rule: no specification depends on where the process definition lives. That is achievable
and it needs saying up front rather than discovering it at page seven.

**What the fork buys.** A working demo on the date, and a platform migration that is not being done in a hurry
next to a UX rebuild.
