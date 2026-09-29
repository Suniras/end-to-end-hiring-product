---
AUTHOR: Claude records the decisions. Suniras makes them. Every entry is his answer to a question asked in
  chat, in his words where he gave them
WHAT THIS IS: the single running log of every decision made for the 20 September retail demo, backend reality
  first and then UX page by page. Appended to as we go
WHAT THIS IS NOT: a questionnaire. Questions are asked in the Claude Code chat and only answers land here.
  Nothing in this file is a proposal
STARTED: 6 September 2026
LAST UPDATED: 7 September 2026
---

# 20 September demo decisions

## How this file works

Two parts. **Backend reality** decides what is actually happening underneath. **UX** decides how the user
experiences it. Backend reality comes first where it affects implementation, because a page cannot be designed
around a capability whose truth level is undecided.

Each decision records the choice, the reason in Suniras's words where he gave one, and the implementation
consequence. Where a decision changes something previously settled, it says so.

**IDs never change, so they are not always in order.** Other documents cite them. Five sections were first
written up as summary paragraphs and expanded on 7 and 8 September, and the decisions recovered in those
expansions took the next free numbers rather than renumbering the ones already cited. So U-70 to U-75 sit
inside page 8, U-76 to U-81 inside page 9, U-82 and U-83 inside page 10, U-84 to U-95 in the candidate-facing
surfaces and U-96 to U-108 in the visual language. Read by section, not by number. Nothing is collapsed into a
range any more: every decision has its own entry.

**The reality levels.** Agreed vocabulary, so a row means the same thing every time.

| Level | Meaning |
|---|---|
| **REAL** | The capability actually executes. A real external call, or real application logic producing the real result |
| **SIMULATED** | Our workflow and data path execute genuinely. The external dependency does not, and the interface says so |
| **SEEDED** | The result already exists as synthetic data and is displayed |
| **DETERMINISTIC** | Real application logic computes the result, with no external model or provider involved |
| **DEFERRED** | Not in the 20 September demo |

---

## Part 1: backend reality

### Decided

**B-01. Screening evaluation: REAL.**
A live model call during the demo, producing a structured recommendation with cited evidence.

*Consequences.* The live model path has never been exercised end to end against a real provider, only against
its error paths, so proving it works with a key set is a demo blocker rather than a later task. A key has to be
present on the day; `LLM_API_KEY` is currently empty and every one of the 30 recorded evaluations in the current
data is the deterministic rubric. Today a failed model call surfaces as a visible error rather than degrading to
the rubric, which was deliberate; whether that changes under a live-model demo is not yet decided.

**B-02. Screening conversation: REAL.**
A live outbound call during the demo. Suniras: an application comes in carrying our own contact details, an
outbound call goes out to us, and it is a live call.

*Consequences.* This is the spine of the demo rather than one feature in it. The candidate on the call is a
person in the room. The transcript the evaluation runs on is what that person actually said, so B-01 and B-02
are one continuous live path rather than two independent choices.

**B-03. Voice transport: REAL, direct to agentX.**
We place the call through agentX and agentX returns the result. Suniras: agentX has voice agents and also has
post-call analysis, so the agent can place the call and return an analysis.

*Consequences.* No Mozart workflow hop, so none of the workspace, API base and workflow base alignment that the
IndiGo build lists as a failure mode. No inbound webhook to a laptop, so no tunnel running during the demo. The
firewall problem that broke IndiGo's direct path applies to cloud egress addresses and not to a demo served from
a laptop.

**B-04. Application intake: REAL.**
Follows from B-02 rather than being chosen separately. A real phone number has to reach a real application row
for the call to go anywhere.

*Consequences.* **Nothing in the codebase creates an application at runtime.** All 36 exist because the seed
writes them. So intake moves out of later platform work and into the demo spine. Whether the submission is shown
as a form the audience watches being filled in, or simply appears as an arrival, is a UX decision and is not
settled here.

**B-05. Screening scoring: REAL, and scored twice.**
agentX post-call analysis produces a score, and our own model scores the same transcript independently. The two
cross-verify. Suniras: PCA should provide a sufficiently good score, and along with it we also have our model
scoring and cross-verifying, in case PCA is not trustable enough.

*Consequences.* This is the AI-to-AI agreement analysis that both the hrX plan and the IndiGo roadmap say a
scoring product eventually needs, arrived at independently. Everything the settled decisions protect stays
protected, because our own evaluation still runs against that requisition's criteria, still cites evidence, and
still writes a decision record with a prompt version we own. Two consequences to design for: the screening record
now holds two scores rather than one, and disagreement between them is a state the product has to have an answer
for. The scoring policy Suniras described is in B-06.

**B-06. Nobody is rejected by either model.**
Suniras, describing how the Unifi build already works: we do not reject anyone, we score them and it goes to
human review. A low score is marked in review and moves forward. A good score in both models moves to the next
step.

*Consequences.* Consistent with D-016 and with the recommendation enum having no reject value. What "moves to
the next step" means is settled in B-07: it means the decide queue, and a person still approves.

**B-07. The human always decides, and a disagreement between the two models blocks progress.**
Revised by Suniras on 7 September after the Unifi disclosure surfaced. Both models scoring well means the
candidate arrives in the decide queue ready to approve, and a person still approves. A disagreement between the
two models raises an exception that stops automatic progress until a person resolves it.

*What this replaces.* An earlier answer to the same question advanced strong-agreement candidates past the human
decision, which would have amended D-016 and needed its own DECISIONS.md entry. **That version was withdrawn
before anything was built. D-016 stands intact and needs no amendment.** Recorded rather than deleted so the
reversal is traceable.

*Implementation consequence.* No new transition is needed and no actor list widens. `DECISION_PENDING → APPROVED`
stays `by: ['human']`, and the test that tries to pass it as an agent, as the system, as an external actor and as
the assistant confirming on its own behalf keeps protecting every candidate. The new work is one exception kind
following the rehire-hold pattern exactly: `blocksProgress: true`, `severity: crit`, `owner: 'human'`, two
human-only exits, and a reason required whichever way it goes. The cross-verification becomes visible in the
product rather than a field nobody reads.

*Consequence for the demo.* If the live call produces a disagreement, the flow parks at an exception rather than
running through. It is resolvable in a click, and it is arguably the better story.

**B-08. Both call methods, browser first.**
Suniras: list browser call first, then also list outbound call. The NuPlay platform and agentX are reliable
enough for outbound, but safety first.

*Consequence.* Matches what the Unifi product already offers, so neither path is novel. Browser is the primary
demo route and outbound is available, which means a carrier problem on 20 September costs seconds rather than
the centrepiece.

**B-09. An outbound call failure shows the actual failure on screen.**
Suniras: if an outbound call fails we need an error log on screen showing what actually failed, if this is
retrievable from agentX, otherwise skip it.

*Consequence.* The mechanism exists. `connectorCalls` already records `error`, `retryable` and `attempt` on every
attempt whether it succeeded or not, so the surface is a rendering job rather than a new capability. What is not
yet known is how much detail agentX returns on a failed call. If it returns a reason, it goes on screen verbatim.
If it returns nothing useful, the screen says the call failed and does not invent a cause.

**B-11. Application intake: REAL, via a hosted apply form.**
Suniras: for the demo we show a form the candidate fills with all their details, the outbound call is triggered
to the number they filled in, and if the number is not reachable we send them an email.

*Consequences.* A candidate-facing apply page is a twelfth surface that is not among the current eleven routes.
Filling it in writes a real application and starts the workflow, so the audience watches a real record being
created and then a phone in the room rings. This is the strongest single beat available to the demo.

*The tension, recorded once because it is real.* D-020 makes us a connector layer rather than the system of
record, and Nishant's own framing was that applicants arrive through a direct connector from the job portals. A
form we host is us owning intake. It is defensible: step 1 stayed in scope on his instruction, and a retailer's
careers page posting into an intake endpoint is exactly a connector calling us rather than us replacing them.
Worth knowing that the demo shows the form and the product's position is the endpoint behind it.

**B-12. An unreachable number falls back to email.**
Suniras: if the number is not reachable we send them an email.

*Consequences.* This closes a loop rather than adding a branch. The email carries the browser-call link, which
is the Unifi pattern of a link bearing a person id and a job id, so the fallback lands the candidate on the
browser call from B-08 instead of the outbound call. The recovery path therefore uses a method already chosen
rather than needing a new one. What the email actually says is a UX decision and is not settled here. Whether the
email genuinely sends is B-13.

**B-13. Email: REAL, sent by an agentX post-call workflow.**
Suniras: actually send emails. agentX has an email sending option, and if the person does not pick up or says
they are not available, the agent can run a post-call workflow to send them that email.

*Consequences, and this is better than anything I proposed.* No SMTP credential on our side, no new dependency
in our stack, and the trigger is the call disposition that agentX already holds rather than something we have to
infer. Confirmed against the Mozart skill: `POST_CONVERSATION` is a first-class workflow type, and a `SWITCH`
node branching on the disposition to an email path is the shape it is built for. So the fallback is
configuration on a platform Nurix already runs.

*Open, and it is B-14.* Whether SMS is also real, or stays simulated. Nothing in the storyline depends on a text
arriving, and our offer flow currently sends both an email and an SMS.

*One thing not to lose.* Even with agentX sending it, the message should still be recorded in our
`communications` table so the product's own history shows what was sent and when. Otherwise the audit trail has
a hole exactly where a candidate was contacted.

**B-14. Result delivery: PUSH to a hosted demo.**
Suniras took the recommendation. The demo runs on a real host with a real URL for the period around 20
September, and agentX pushes the call disposition, transcript and PCA result to an endpoint on it.

*Why push rather than poll.* This is the pattern the Unifi build actually ships: Nurix does not hold a score for
anyone to fetch, it pushes a disposition into whoever is the system of record. In our demo that is us. Polling
was my earlier suggestion and it is not the proven pattern.

*Why hosted rather than a tunnel.* Removes the only inbound network dependency from demo day, and it separately
fixes something unrelated: today nobody can look at the demo unless Suniras's laptop is running. Deployment is a
small amount of infrastructure and sits inside "proportionate to the demo".

**B-15. SMS: SIMULATED. Taken on recommendation, not explicitly chosen.**
Recorded under "go with the recommended options" rather than as a direct answer, so it is flagged for
correction. Nothing in the storyline depends on a text arriving, and a real SMS provider would add a second
telephony dependency for no demo gain. Messages are composed and recorded in `communications` with template,
recipient and body, and labelled simulated on screen. **Say the word and this flips to real.**

**B-16. The voice agent owns its own phone number.**
Suniras: everything can be assigned to the agent itself, the agent will have a phone number assigned to it and
it is capable of making outbound calls. agentX already has many live deployments for CX and outbound sales.

*Consequences.* Closes the outbound-number question. Unlike the Unifi build, where the customer procured Twilio,
a Nurix-run demo uses the agent's own assigned number, so there is no trunk to arrange and no customer
dependency. The transport is not novel for us.

**B-17. Downstream of the hire decision: communications REAL, vendors SIMULATED.**
Suniras chose C. The offer email and the chase messages genuinely arrive. Every downstream external system stays
simulated behind an honest adapter.

*What this settles in one answer.* Background check ordering and return, I-9, E-Verify, payroll, systems access,
uniform and badge, training assignment, first shift scheduling and the tenure marks are all **SIMULATED**. No
vendor sandbox, no new credential, and no vendor relationship to start fourteen days out. The workflow, the
dependency graph, the statutory clocks and the audit trail all still genuinely execute; only the far end does
not, and the interface says so.

*What it buys.* The candidate in the room experiences the journey rather than watching it on a screen. The
person who took the live call also receives the real offer email, which means the demo's realness extends past
the decision without adding an integration.

*The demo claim this implies.* Application to decision is real end to end. Everything after it is genuinely
orchestrated, genuinely timed and genuinely audited, with simulated vendors. That is a truthful sentence and it
should be the sentence used.

**B-18. Assistant: REAL model, plus per-page predicted questions.**
Suniras: use the real LLM key, and have a set of FAQs or predicted questions based on each page.

*Consequences.* The model route is what runs by default once a key is set, so the first half needs no change.
The second half is new: every page carries its own set of suggested questions rather than the assistant being a
blank box the user has to guess at.

*Why the second half matters more than it looks.* A blank assistant on stage depends on somebody phrasing a
question well. Suggested questions per page make the input predictable, which makes the output predictable. It
is the cheapest reliability improvement available to the assistant and it is a UX feature rather than an
integration.

*Where the suggested questions should come from, and this is a recommendation rather than a decision.* The
classifier already has 133 training and 32 held-out phrasings that are known to resolve correctly, plus 57
safety cases that are known to be refused correctly. **The per-page suggestions should be drawn from that
corpus rather than written fresh**, so every suggested question is one we have already proven works. Writing a
new list invents phrasings nobody has tested.

*Safety is unaffected either way.* Both routes end at the same tool registry, and the tools are the only thing
that can change data. The 57 safety cases hold whichever route asked.

**B-19. A clicked suggestion resolves locally. Free typing goes to the model.**
Suniras chose B.

*Consequences.* The most-used assistant interaction becomes instant and immune to a network problem, while free
typing keeps the full model coverage from B-18. Both paths already exist, so this is routing rather than new
capability. It also keeps the suggestions and the test corpus honest with each other: if a suggested question
ever stopped resolving locally a test would fail, which is what makes B-18's recommendation about drawing
suggestions from the corpus enforceable rather than aspirational.

**B-20. Reality matrix APPROVED, 7 September 2026.**
Locked. Not reopened during the UX phase. Where a page needs a capability the matrix calls simulated, the
question asked is how the simulation is communicated, never whether it can be made to look real.

**B-21. Sourcing: a mocked retailer careers page fronts the apply form. LinkedIn is DEPICTED only.**
Suniras: show a potential LinkedIn integrator, and in the meanwhile a custom integrator with a form. Maybe show
the careers page of a mocked retailer with an apply button, which takes us to the form, and the form on
submission creates a record in our system.

*Consequences.* Amends the matrix row that had sourcing DEFERRED under D-009. Two new surfaces: a fictional
retailer careers page, and a LinkedIn integrator shown as available rather than connected. The careers page is
the front door to the apply form from B-11, which makes the intake story complete: a candidate finds a job,
applies, and a record appears.

*The honesty constraint on the LinkedIn element.* It must read as an integrator that could be configured, never
as a connection that exists. The adapter registry has no vendor field precisely so a connected claim cannot be
written by accident, and that protection has to extend to this screen. LinkedIn's job posting API is closed to
new partners, verified from their own page, so the depiction must not imply access we could not obtain.

**B-22. Medical checks: DEFERRED.** Confirmed. No such step exists in the retail funnel.

**B-23. Document upload: IN SCOPE, modelled on the IndiGo pattern.**
Suniras: document upload can be stolen from IndiGo and how they do it.

*What that pattern is.* Named document slots on one table distinguished by a slot-name prefix, per-slot OCR
verdicts of green, amber or red, and a gate that auto-approves only when every slot is green and no screening
flag fired. Anything amber, red or flagged waits for a human, and nothing in it ever auto-rejects. That last
property is why the pattern is safe to adopt: it already matches our own human-only rule.

*Not an import of an airline concept.* Document collection with OCR verdicts is a generic capability. The
locked product boundary forbids importing IndiGo domain concepts, meaning medical, travel, itinerary and their
roles. This is not one of those.

*Scope note.* This is new capability rather than a labelling decision, and it needs the real model path for OCR.

**B-24. Video interview: open.** Suniras raised skipping it or showing it for high scorers who passed. Asked as
Q13 rather than assumed either way.

**B-25. "Auto pass" means auto-advance to the decision, not auto-hire. B-07 CONFIRMED.**
Suniras initially said high scorers go straight to the next step with no approval needed, citing a colleague on
the Unifi build: "we just write back a 'pass' in the overall result field that is updated in their crm." He
noted himself that Unifi was screening-only and we are end to end. Asked which he meant, he chose auto-advance
to the decision.

*Why the Unifi evidence supports B-07 rather than contradicting it.* At Unifi, "Overall Result: Pass" moves the
candidate out of screening into a human recruiter's queue inside Avature. A person at Unifi still hires. That is
why their candidate-facing page can truthfully say a human always makes the final decision. The pass is an
advance, not a hire.

*And we already do it.* `SCREENING_COMPLETE → DECISION_PENDING` is automatic and the agent is permitted to take
it. A high-scoring candidate already reaches the next step with nobody involved. What stays human is the
decision at that step.

*Recorded because the reasoning matters more than the answer.* A screening-only product can auto-advance safely
because there is always a human downstream. An end-to-end product that auto-advances through the decision has no
human downstream at all. The analogy does not transfer, and this is the second time the Unifi build has been
read as licence for something it does not do.

**B-10. Thresholds are undecided.**
What counts as a good score and what counts as a disagreement exist nowhere in the code or the documents. Both
are Suniras's. Under B-07 as revised they gate whether an exception fires rather than whether somebody is hired,
which lowers the stakes but does not remove the need. Best answered once the PCA score scale is known.

### Reference: how Unifi actually scores and returns a result

From `00-context/unifi/.../Nurix AI Evaluation Overview.docx` and `Unifi - Nurix Scope & Solution.docx`, read
7 September. This is the shipped pattern rather than a proposal, so it is the strongest reference available.

**The scoring model is binary, not numeric.** Every question is worth one point. A candidate must score 100 per
cent to be marked satisfactory. Anything less is a review, with four review sub-statuses: Review Incomplete,
Review Block, Review Unsatisfactory, Review Does Not Meet Min Qualifications. The scope document states the
outcome as **"Pass" or "In review"** and nothing else. **Nobody is ever rejected by the agent.** This
independently confirms B-06 from the shipped product rather than from recollection.

**The scoring method is a phrase bank.** Each question carries a list of positive indicator keywords, plus
explicit instructions to ignore grammar, accent and filler words, to handle negation and double negation, to
accept diverse phrasing, to not penalise slang, and to score profanity negatively even alongside positive
indicators. A developer note directs the use of modifier-plus-verb pairings such as "never late" and "don't
help" so negation flips meaning correctly.

**This reframes our own deterministic rubric.** Our fallback matches answers against a phrase bank the client
owns and can edit, which is architecturally the same approach the shipped Unifi product uses for real. The
fallback is not a lesser imitation of the real thing; it is the same technique. That is worth knowing before
anybody describes it as a stopgap.

**The result is PUSHED to the system of record, not pulled from the agent.** The disposition goes to Avature as
a flat form via `PUT .../people/{personId}/links/{linkId}/form_{formId}`, carrying Job ID, Workspace ID,
Conversation ID, Knock Out, Interview Status, Accommodation Needed, Overall Result, Conversation Summary,
Entity, Call Version, date and time of completion, ten pairs of question status and question detail, and the
transcript. Audio goes separately through a file upload endpoint typed "Virtual Screen Audio File". A GET on the
same form reads it back, and a further GET reports whether the interview is complete.

**The call is triggered by a webhook into Nurix.** Unifi sends an SMS from Avature, the candidate replies, Unifi
authenticates them in a screening portal, then Unifi calls a Nurix webhook with the Avature candidate id, name,
phone number and requisition id. Nurix places the outbound call. Twilio is procured by Unifi, not by Nurix. The
documented trigger is a POST to a Nurix campaign-manager call endpoint carrying a candidate id and a job id
against an API key.

**The browser path is embedded JavaScript.** Nurix provides the agent as an embeddable script that the customer
hosts on their own page, and the customer passes a unique identifier which Nurix uses to fetch candidate details
from the ATS. So the in-browser call is a Nurix widget rather than something a customer builds.

**Security finding, not a decision.** `Avature APIs.docx` contains live REST API keys in plain text, including
one labelled production. They were not used and are recorded nowhere. Worth rotating, and worth knowing the file
is tracked.

### Reference: the Unifi screening product

Both URLs were opened on Suniras's authorisation, 7 September. They are the same product at production and
sandbox. What is on the page:

- A candidate-facing entry page reached by a link carrying a person id and a job id.
- A stated call length of **three to five minutes**, which corroborates the figure in the Unifi case-study slide
  from the product itself rather than from marketing.
- **Two call methods: "Start call in browser" and "Call me via phone."** Browser calling is built and offered
  first.
- A disclosure to the candidate: *"Our virtual screening agent helps our hiring team review your application
  more efficiently. A human always makes the final decision."*
- Privacy policy acknowledgement on continue. No separate recording-consent language visible on the entry page.
- Nothing about scoring shown to the candidate.

**The disclosure is consistent with B-07 as revised.** A live Nurix product tells candidates a human always
makes the final decision. Raising it with Suniras is what led him to revise B-07, so the retail product and the
Unifi product now say the same thing to a candidate and both are true.

### Verified during this process

**The Unifi screening agent is real.** Suniras confirmed from first-hand knowledge that Nurix built a candidate
virtual screening agent for Unifi, and named the deployment. This closes a claim that had been flagged twice as
unverified, because the "Nurix has shipped a live voice screening agent" line in `demo/README.md` and
`connectors/index.js` could previously only be traced to the self-contradictory Unifi case-study slide. The line
in both files stands as written. **Verified on Suniras's own account, 7 September 2026.**

Two live URLs were shared as reference. They were **not** fetched when first shared, on the instruction not to
test anything, and were opened later the same day once Suniras authorised it. What is on the page is recorded
below.

**Still outstanding, and needed for implementation:** the shape of the PCA result. Field names, the score scale,
whether it returns a per-criterion breakdown, and whether it cites the transcript. One sample payload or a schema
is worth more than the screens.

### Four decisions taken 7 September, closing three of the open items

**B-26. Jurisdiction: strict states, both disclosures, in two places.**
Sunfield hires in a footprint that deliberately includes New York City and California. The **recording
disclosure is spoken in the call**; the **AI disclosure sits on the entry page**. This is the Unifi pattern,
where the call opens with a recording notice and the entry page says "our virtual screening agent helps our
hiring team review your application".

*Why this was the harder choice and the right one.* Handling those regimes is the product's differentiator.
Avoiding them would have sidestepped the exact rules the compliance layer was built for.

*What it puts in scope, and this is the consequence to see.* NYC requires a **published bias audit** and **ten
business days of candidate notice**. California, since 1 October 2025, covers any system that merely
facilitates a human decision and requires **four years of retention of system inputs**. That last one lands
directly on the consent and retention gap, which has no implementation at all: `store.js` has no delete method,
there is no consent table, no retention class and no data-class field. **Choosing this footprint makes that gap
a demo-visible obligation rather than a background debt.**

*What it keeps out of scope.* All-party recording consent still applies in roughly a dozen states, which the
call disclosure satisfies. Illinois and Maryland do not bite, because both statutes concern AI analysing video
and facial recognition, and B-27 removes video.

**B-27. Video interview: SKIPPED. Closes O-01.**
Suniras: there is no point showing the video interview in a demo, it is just a human interviewing another
human, so it makes no sense to show.

*One clarification, stated rather than assumed.* This removes any **video** representation. It does **not**
remove funnel steps 4 and 5, the scheduled manager interview and the interview itself, which already exist,
already run where a requisition sets `requiresManagerInterview`, and are in scope under D-013. Those stay as
they are.

*Secondary effect.* Keeps Illinois and Maryland out of scope, which simplifies B-26.

**B-28. The offer email is a realistic retail offer email. Closes O-02.**
Suniras: a generic email of the kind retail companies send to people being offered a job.

*What that means concretely.* The details in the body, rate, hours, store, start date, written the way a
retailer writes them. **Not** a generated PDF and not primarily a link. It needs accept and decline links,
because funnel step 8 is offer accepted or goes quiet and the response has to be capturable.

*What is deliberately not built.* Offer letter document generation, template rendering with a stored hash, and
any comp or pay-band calculation. None of it exists today and none of it is now required.

**B-29. Dara Simmons moves to a Ridgeway requisition in the seed. P1 closed.**
So the FCRA pre-adverse sequence is visible to Marcus Hale, the default acting viewer.

*Why the seed edit rather than a viewer switch.* One line, and it keeps the live demo script shorter. A viewer
switch mid-demo is a stronger moment and one more thing to go wrong on stage.

*Watch for.* Moving her changes which store carries the adverse case, so any seeded medians that were
per-store shift slightly. The suite should be re-run after the edit.

### Still open on the backend side

Three, and none of them blocks UX design or the deck.

**O-01. The video interview. CLOSED by B-27, skipped.** B-24. Raised by Suniras as either skipped or shown for high scorers who passed,
then moved past without an answer. Four options were put to him: skip entirely, depict only, a real workflow
step with a simulated vendor, or real video. **Needs an answer before the pipeline and timeline pages**, because
it decides whether a twenty-first state exists.

**O-02. The offer document. CLOSED by B-28, a realistic retail offer email.** No offer letter generation exists anywhere in the code; an offer is a row carrying
a rate and a template id. Under B-17 the offer email genuinely arrives, so the open question is what it carries:
a generated document, a link back into the product, or a summary in the body. Needs an answer before the offer
surfaces are designed.

**O-03. Thresholds.** B-10. What counts as a good score and what counts as a disagreement between the two
scorers. Best answered once agentX's PCA score scale is known, so it can wait, but it gates when the U-04
disagreement drawer fires.

### Closed by other answers, recorded so nobody re-asks

Candidate and resume processing: no resume in the flow, the apply form captures details directly. Sourcing and
job boards: B-21. Background verification, I-9, E-Verify, HRIS, payroll, onboarding provisioning: all simulated
under B-17, settled in one answer. Communications: B-13 and B-15. Rehire: real logic over seeded records, no
decision needed. Workflow orchestration, metrics and the audit trail: all real and already working, no decision
needed. Assistant actions: B-18 and B-19.

### Outstanding inputs needed from elsewhere

The **PCA result shape** from the Unifi or agentX side: field names, score scale, whether it returns a
per-criterion breakdown, whether it cites the transcript. Asked for on 7 September, not yet supplied. It gates
O-03 and the shape of the screening record.

---

## Part 2: UX

Page order agreed: deck or landing, decide, candidate, flag or exceptions, screening, pipeline or funnel,
compliance or checks, sources, store, assistant.

Questions are asked in the VS Code picker from 7 September onward, at Suniras's request, with the reasoning in
the message and the choice in the picker.

### Page 1: deck / landing

**U-01. Purpose: command center and overnight report together. REVISED 7 September, candidate section dropped.**
Originally recorded as command center plus overnight report plus a small candidate section. Suniras revised it
the same session: he had taken the candidate section to mean a pipeline summary, and given the metrics strip in
U-05 he judged it unnecessary.

*The page is therefore three things:* the fused overnight line, the merged attention queue as the body, and the
thin metrics strip. Nothing else.

*Consequence.* This serves the clutter constraint better than the original three-purpose version, and it removes
the only element on the page that would have duplicated what the metrics already say.

**U-02. One fused statement leads the page.**
Suniras chose C. A single computed line does the work of both headline purposes: how many arrived, how many were
handled without a person, how many need one. Then the queue. Then the small candidate list.

*Consequence.* The manual-work metric, one of the three locked ones, becomes the first line of the product. The
line is computed from the existing deck payload over real arrival times rather than written. What it costs: the
individual overnight figures stop being separately scannable, so seeing who was knocked out becomes a drill-down
rather than a tile.

---

**U-03. Attention queue: one merged list, ranked.**
Every item that needs a person appears in one list, each row labelled with the kind of attention it needs.
Urgency and age both influence order rather than either dictating it.

*Consequence.* Six sources feed one list: a decision waiting, a rehire hold, a day-one risk, a failed screening
evaluation, a blocking exception, and a score disagreement. All six already exist separately in the deck payload
with an age on each, so this is a merge and a rank rather than new computation. It also survives the clutter
constraint from U-01, which grouping would not have.

**U-04. A queue row opens a drawer. The manager acts without leaving the deck.**
A panel over the deck carries exactly what that item needs: the two scores and the cited evidence for a
decision, the prior record for a rehire hold, the shift and the notice window for a day-one risk. Approve,
resolve, next.

*Consequence, and it reshapes another page.* This makes **decide** a bulk and comparison surface rather than a
per-candidate one. The deck is where you clear the two items that cannot wait; decide is where you work through
fifteen at once and compare them. Recorded here because it constrains the decide page before we design it.

*Why it was chosen.* Fewest actions per item of the four options, and manual work is one of the three locked
metrics, so the page that most reduces clicks is the one that best demonstrates the thesis.

*Safety unchanged.* Acting in a drawer does not weaken any gate. An approval from the drawer is the same
human-only transition, recorded against a named person, as an approval from anywhere else.

**U-05. The three locked metrics get one thin strip.**
Time to hire, people involved and manual work as three numbers in a single row. No charts, no trend. Clicking
one opens the breakdown.

*Why not a trend.* A sparkline over seeded data implies a measured history we do not have. The seed is
thirty-six people over a few weeks, so a trend line would be the most misleading element on the page.

*One honesty note carried forward.* Of the three, manual work is the thinnest. It is a handoff count plus a sum
of recorded work durations, and those durations are largely constants in the seed rather than measured effort.
Time to hire and people involved are both fully defensible. The strip should not imply the three are equally
well measured.

**U-06. The landing page is scoped to one store, always.**
The store manager's own store. Cross-store and district comparison lives on the separate store page.

*Why.* D-031 named the store manager as the user and its second half restricts the designed workspace to that
one persona: the buyer gets a report, the champion an argument, the blocker an audit trail. A district view on
this page would be the buyer's report leaking into the user's workspace, which is what that decision was written
to prevent.

*Demo consequence.* Both audiences still appear, on two screens rather than one. Switching the acting viewer
during the demo is a stronger moment than a filter control, and the mechanism already exists.

**U-07. The small candidate section is dropped.** See the revision recorded in U-01.

**U-08. Empty queue: the argument, stated.**
When nothing needs a person, the queue area is replaced by what the platform did instead: how much was handled
without anybody, the hours not spent, what is progressing on its own.

*Why.* Under the product thesis an empty queue is the result rather than an absence, and this is the one screen
that states the argument without needing a metric. It is also what an audience is looking at if the last item
gets cleared on stage. Computable from the existing payload rather than being written copy.

**U-09. The assistant is a summoned sidebar, on every page. GLOBAL DECISION.**
Suniras, refining the offered option: a summoned sidebar rather than an overlay, because an overlay might block
the entire screen with no view of the page.

*Consequence, and it is worth more than the space it costs.* The page stays visible while the assistant works,
so a user can ask it to do something and watch the queue change behind it. An overlay would have hidden exactly
the thing the action affects. For a demo this is the difference between being told an action happened and seeing
it happen.

*Implementation note.* Every page layout has to hold up at the narrower width when the sidebar is open. This
applies to all ten pages, not just the deck.

*Carried from B-18 and B-19.* Each page supplies its own suggested questions, drawn from the 133 training and 32
held-out phrasings already proven to resolve. A clicked suggestion resolves locally and instantly; free typing
goes to the model.

**U-10. Metrics strip sits below the fused line and above the queue.**
Stated as an assumption in chat rather than asked, and recorded as such so it is visible and correctable. The
queue stays the largest element on the page.

**U-11. Deck page APPROVED 7 September. Implementation deliberately held.**
Suniras approved the design and chose to keep designing pages before any code is written, so the whole product
can be reviewed before implementation starts. **No code has been written for this page or any other.**

*Two constraints this page places on later pages, repeated here because they are easy to lose.* Decide is a bulk
and comparison surface rather than a per-candidate one, because per-candidate decisions happen in the deck
drawer. And every page layout must hold up at the narrower width with the assistant sidebar open.

### Page 2: decide

**U-12. Purpose: triage.**
The page sorts candidates by how much judgement each one needs, rather than treating them as equivalent. Clear
cases go quickly; ambiguous ones get real attention.

*Why not the alternatives.* Batch treats every candidate the same and the product argument is that they are
not. Compare is the better tool when choosing between people for one opening, which is a different situation.
Queue would duplicate the deck drawer.

*Constrained by U-04.* Single decisions happen in the deck drawer, so this page exists for volume. If it were
another one-at-a-time surface it would duplicate the drawer.

**U-13. Three triage lanes.**
Ready. Low score, needs review. Carries context, meaning a rehire match or an eligibility warning worth reading
before deciding. Each lane can be acted on as a set.

*What is deliberately not a lane here.* Score disagreements. Under B-07 a disagreement raises a blocking
exception, which stops the automatic advance, so a disagreeing candidate never reaches this page directly. They
park at screening-complete, appear in the deck queue as an exception, and arrive here only after a person has
resolved it in the drawer.

*Why lanes rather than one sorted list.* Lane-level bulk action. Clearing a lane of agreed candidates in one
confirmed action is the clearest demonstration of the manual-work metric anywhere in the product, and bulk
approval already exists as a tool with a human-decision gate.

**U-14. Bulk approve, single reject.**
A whole lane approves in one confirmed action. Rejecting is one candidate at a time with a reason required.

*The asymmetry that decided it.* An approval that turns out wrong is recoverable, because the candidate is still
in the funnel and a person sees them again at the offer, the check and every gate after. A rejection ends it and
the candidate never learns why. `reject_batch` was deliberately never built and there is a test asserting it
does not exist; that stays true.

**U-15. A row shows both scores plus per-criterion marks.**
Name, both scores, the agreement state, and a compact row of marks showing which of the requisition's criteria
were met. Evidence quotes are behind the expand.

*Why not a bare number.* Step 6 producing a score is what makes this a regulated automated employment decision
tool in New York City and California. A manager approving twelve people off twelve bare numbers is a human in
the loop only nominally, which is precisely what those rules address. Criterion marks are the only option of the
four that a manager can compare down a column and honestly say they looked.

**U-16. After approving a lane, rows vanish and the count drops.**
A brief confirmation, the lane empties.

*Consequence to carry forward.* This was not my recommendation and the difference matters. An approval is not an
ending in this product: it creates an offer, and acceptance fans out into the background check and the
eleven-task onboarding graph at once. Approving twelve sets off twelve parallel fan-outs. Under this choice that
happens off-screen. **The parallelisation story therefore has no home on the decide page and must land on the
candidate or pipeline page instead.** Raised there rather than left to chance.

**U-17. Expanding a row is inline, and shows evidence only.**
The row grows to show quoted evidence behind each criterion, both scores with their provenance, the eligibility
result rule by rule, and a link to the full transcript. Deliberately lighter than the deck drawer.

*Why not the deck drawer.* U-04 made the drawer the per-candidate decision surface. Reusing it here would make
decide a second route to the same thing, and its distinctness would rest only on the lanes. Inline also keeps
the lane intact, which is the point of a triage page, and lets two candidates be expanded and read against each
other.

**U-18. The human and AI boundary statement appears in the expand only.**
Alongside the evidence, at the moment a manager is weighing the model's output. Not while scanning.

*Why not persistent.* A standing banner is read for a week and then ignored, and it spends vertical space on
every visit. The audience that most needs the boundary documented is employment counsel and IT security, whom
D-031 names as the two blockers, and that decision already says their artefact is an audit trail rather than a
screen.

**U-19. Decide page APPROVED 7 September. Implementation still held.**

*Two items deliberately left open, to be asked rather than chosen:* what the page shows when all three lanes are
empty, and whether lanes can be sorted or filtered internally.

### Page 3: candidate

**U-20. Organised around the twenty-step journey.**
The funnel is the spine. Every step in order, where this person is, what happened at each, how long each took,
with steps we do not control visibly present and marked as such.

*Why.* It is the spanning-view claim from D-013 made concrete on one real person, and it is the only option that
keeps visible the steps nobody owns, which is the harder half of the argument to demonstrate.

**U-21. Parallel steps are shown as time bars.**
Each step gets a horizontal bar positioned by its real entered-at and completed-at. Overlap is visible because
the bars overlap. The split between work time and elapsed time is drawn inside each bar, so waiting is visible
in the same picture.

*Why this matters more than a layout choice.* U-16 left the parallelisation story without a home when the decide
page chose a clean post-approval state. This page now carries it. Time bars are the only option where the
overlap and the waiting are one visual, and waiting is what seventeen of nineteen steps are made of. It turns
queue share from a percentage into something a person can point at.

*Fully computable.* The timeline payload already carries entered-at, completed-at, elapsed and work per step.
Nothing here is illustrative.

*Cost.* The most work of the four options considered.

**U-22. Step detail expands inline beneath the bar.**
Clicking a step opens its detail directly under it, full width, with the journey still visible above and below.

*A pattern now deliberate rather than accidental.* **Drawers are where you act. Inline expansion is where you
read.** The deck uses a drawer because you approve in it. Decide and candidate expand inline because you are
reading evidence. Worth holding to across the remaining pages.

*Why not a side panel.* U-09 gives the assistant a sidebar that takes width when open. A master-detail layout
would make three columns, and time bars need horizontal room to be legible.

**U-23. Above the timeline: identity and status only.**
Name, the role applied for, the store, pay rate and hours, current state, and how long they have been in it.
No metrics strip at the top.

*Why.* The time bars already show elapsed and queue visually, so a numbers strip would restate in digits what
the bars say in space. Keeping the header to identity gets the timeline high on a page whose whole point is the
timeline. Per-candidate numbers can summarise at the foot instead.

*One caution recorded for whoever builds the foot summary.* The parallelism figure is two estimates over the
same task set with the same constants, so its ratio does not vary between candidates. It is honest arithmetic
about the shape of the work and it is not a measurement of this person's hire. It must not be presented as one.

**U-24. Actions live at the step, except the hire decision.**
Each expanded step exposes the actions belonging to it: order the check at step nine, send the offer at step
seven, resolve a hold at step two, schedule a shift at step fifteen. The timeline is a control surface, not just
a record.

*The carve-out, and it is deliberate.* **Approving and rejecting stay on the deck drawer and decide only.**
Putting an employment decision in a third place makes it harder to reason about who may do what and where it was
recorded. Everything else is safe to act on where it belongs in the journey.

*Rule refined rather than broken.* Drawers act on a queue item; inline expansion reads, and acts on the thing it
is showing. The rule's purpose was to stop drawers becoming general-purpose containers, not to forbid action
elsewhere.

**U-25. Simulation: badge at rest, full connector detail on expand.**
Each simulated step carries a marker in the timeline. Expanding shows the actual connector record: adapter,
operation, external reference, recorded latency, and mode.

*Why this shape.* The only option where the disclosure sits next to the claim and is also verifiable. Detail
only on expand would leave a viewer who does not expand believing a check ran, which is the exact failure the
locked rule addresses. Audit-trail-only puts the disclosure furthest from the claim.

*Nearly free to build.* Every connector call already records adapter, operation, reference, latency and
simulated mode. The page shows what is already stored.

*Which steps this applies to on this page.* Six are simulated: the background check, E-Verify, payroll, systems
access, uniform ordering and training assignment. Everything else about them is real, including the recorded
call, the external reference, the statutory clocks computed from real dates, and the waiting itself. What did
not happen is an agency running a search.

**U-26. Audit trail at the foot, messages woven into the steps.**
Messages appear at the step that triggered them. The audit trail stays whole at the foot of the page.

*Why the split.* Messages genuinely belong to steps: the offer email belongs to the offer, the chase belongs to
the wait. The audit trail does not, and its value is that it reads as one unbroken sequence **including the
actions that were refused**. Splitting it across twenty expansions would destroy the property that makes it
useful.

*Who this is for.* D-031 named employment counsel and IT security as the two blockers who can quietly stop an
enterprise purchase, and said the blocker's artefact is an audit trail rather than a workspace. This page is
where that artefact gets shown to them, which is why it stays contiguous.

**U-27. Candidate page APPROVED 7 September. Implementation still held.**

*The U-16 consequence is resolved here.* The parallelisation story had no home after the decide page chose a
clean post-approval state. U-21's time bars carry it, and carry the queue-versus-work split in the same visual.

*Items deliberately left open, to be asked rather than chosen:* which candidate the page defaults to when no id
is given, whether there is navigation between candidates, what the foot summary of per-candidate numbers
contains, and the empty and error states.

### Page 4: flag / exceptions

**U-28. Purpose: the whole exception register, open and closed.**
Every exception ever raised, including resolved ones with who resolved them, which way, and on what stated
reason.

*Why the page exists at all.* U-03 put every open exception into the merged deck queue and U-04 made them
resolvable there, so a flag page risked being a filtered copy of the deck. This purpose is structurally
different: the deck covers urgency, the register covers time. Nothing else in the product answers "what have we
overridden, and on what grounds", which is exactly what an employment lawyer asks about a rehire override or an
adverse action. D-031 already says the blocker's artefact is an audit trail.

*Eight kinds it holds.* Rehire holds, adverse reviews after a check returns a record, screening concerns, failed
evaluations, check delays, E-Verify mismatches, quiet offers, and the score disagreement introduced by B-07.

**U-29. Open first, resolved below, filterable by kind.**
One page. Outstanding at the top, closed history beneath, a filter for when somebody asks to see every rehire
override.

*Why this axis.* Two audiences want different structures and D-031 settles which wins: the store manager is the
user, counsel and IT security are blockers who get an artefact rather than a workspace. So the default serves
the manager and the filter serves counsel on request. Grouping by kind would suit the class question a lawyer
asks and would scatter a manager's three open items across three sections.

**U-30. Resolving summons the deck drawer. One component, three entry points.**
The drawer from U-04 is the resolve experience. The register, the deck and the candidate page are all entry
points to it.

*Why not a second inline implementation.* A resolution is precisely the kind of action where two
implementations would eventually diverge in what they record, and the reason field is the entire accountability
payload. Building it once means the reason is captured identically wherever the resolution happened.

*Rule extended.* Drawers act. They can now be summoned from more than the deck, which is a widening of U-04
rather than a contradiction of it.

**U-31. A resolved entry shows the decision and the reason at rest.**
Which way it went, who decided, when, and the reason they typed. Everything else, including the prior
employment record, on expand.

*Why the reason is not hidden.* A reason held one click away is a reason nobody reads, and an override without a
visible justification is indistinguishable from an override with a bad one. There is also a useful secondary
effect: if a reason will sit on a page a lawyer might read, people write better reasons.

**U-32. Flag page APPROVED 7 September. Implementation still held.**

*Items deliberately left open, to be asked rather than chosen:* what an OPEN exception row shows at rest,
since only the resolved row was settled; the empty state; and whether this page is store-scoped like the deck
under U-06 or tenant-wide. **The current payload takes no store filter, which is an inconsistency with U-06 and
needs a decision rather than an inheritance.**

### Page 5: screening

**U-33. Purpose: review and queue normally, live view takes over when a call is happening.**
On an ordinary day the page reviews completed screenings and manages the queue. When a call is live it becomes
the live view and reverts afterwards.

*Why all three rather than one.* Under the matrix this page is where the demo actually occurs: real application,
real outbound call, real person answering in the room, real transcript pushed back, real model scoring it. Every
other page shows consequences. But a page built only for the live moment is empty most of the time, and a page
with no live view would bury the centrepiece in a queue.

*Cost, stated plainly.* The most stateful page in the product, and the states do not exist yet. Screening status
today is only pending or complete.

**U-34. The live view shows stages, not content.**
Invited, opened, connected, in progress with a running timer, ended, scoring, scored. No transcript until it
lands. Suniras: least amount of text, most signal.

*Why this over streaming turns.* It is the only option definitely buildable without knowing whether agentX
streams mid-call. It gives the screen a job during the three to five minutes without competing with the
conversation the room can hear. The two scores landing at the end remains the reveal.

*One upgrade worth taking if available.* If agentX reports progress through the script mid-call, a stage can
carry "answered three of five" against the requisition's own questions. Less text than a stage name and more
signal, because it ties progress to the criteria rather than the machinery. Same unconfirmed dependency as
streaming, so build stages and add this if it exists.

*New states required.* Screening status must extend beyond pending and complete to express the live sequence.
This is a data-model change, not just a view.

**U-35. A completed screening is laid out criteria first.**
Each criterion with its verdict and the quoted evidence directly beneath it. The transcript is available but not
on screen by default.

*Why.* The question this page answers is whether a judgement was sound, and criteria-first puts each verdict
next to the evidence supporting it, which is the smallest unit of that question. It is also the narrowest
option, which matters because U-09's assistant sidebar takes width.

**U-36. Both scores shown in their own terms, with the difference in kind visible.**
Ours numeric against the requisition's criteria. agentX's as whatever verdict it actually produces. The
agreement stated as a conclusion rather than computed as a subtraction.

*The difficulty this avoids.* The Unifi scoring model is binary, pass or in review, so agentX's output may not
be a number at all. Normalising the two onto one scale would manufacture a precision neither system provides,
and putting them side by side as two numbers would invent a comparison that does not exist. This was the
tempting option and it is the one that would have put a fabricated figure on the page.

*Blocked on an outstanding input.* Cannot be finalised until the PCA result shape arrives: field names, score
scale, whether it returns a per-criterion breakdown, whether it cites the transcript. Still owed from the agentX
or Unifi side.

**U-37. The screening call triggers automatically, with a manual trigger available.**
Eligibility passes, the screening is created, the invitation goes out with nobody involved. A pending screening
can also be started by hand.

*Why both.* The automatic path is what the product should do and what the thesis claims. The manual trigger
costs almost nothing because `schedule_screening` already exists as a tool with a confirmation, and it means a
mistimed form submission on demo day does not cost the centrepiece.

**U-38. Screening page APPROVED 7 September. Implementation still held.**

*Items deliberately left open, to be asked rather than chosen:* what the queue portion shows and how it is
ordered, where the step 3 boundary text and the step 2 no-model-on-eligibility explanation appear, and the empty
state.

### Page 6: pipeline and funnel, merged

**U-39. Pipeline and funnel become one page.**
The twenty-step spine appears once, with counts, durations, owner, bottleneck and the product argument all
hanging off each row.

*Why.* The two routes existed because they were built at different times rather than because a user needs them
apart, and the duplication is real: both call the same funnel computation and both render the same twenty rows.
Pipeline added the step definitions on top; funnel added the rollup, the actor split and the bottleneck. A step
showing its count, its median duration, its owner and what the agent does there is more useful than either page
alone, and it is the clearest possible statement of the seventeen-of-nineteen ratio because the argument and the
evidence sit on the same row.

*One overlap already resolved elsewhere.* Funnel's per-store rollups are cross-store comparison, which U-06 sent
to the store page. That part does not come here.

*Cost.* The densest page in the product.

**U-40. The page is shaped by time, not by volume.**
Each step sized by its median duration, so long waits are visibly long and the nine deterministic steps are
visibly thin. Drop-off is present as a number rather than as the shape.

*Why this is the argument rather than a layout.* A conventional funnel narrows by volume and tells a conversion
story, which is the story every competitor tells and the one where we are not differentiated. Our claim is that
seventeen of nineteen classifiable steps are a wait or a handoff and the loss is time rather than people. A view
shaped by duration says that. A view shaped by volume cannot.

*Cost.* An unfamiliar shape that needs one sentence of explanation the first time somebody sees it.

*Honesty note carried forward.* The underlying durations are largely seeded constants. The shape is truthful
about the structure of the funnel and it is not a measurement of any real retailer, and the page must not imply
otherwise.

**U-41. Unowned steps are marked, and show what the platform does during the wait.**
Each clock-owned step says who is being waited on, the agency or the government, and also what the platform does
inside that wait: chasing, polling, surfacing the delay, keeping the candidate warm, running parallel work.

*Why this version of the claim.* The weak version is "we show you the waiting", which is passive. The true
version is that during a five-day check the platform is polling the vendor, surfacing the delay as a warning
that does not block, and running eleven onboarding tasks alongside it. Showing that inside the unowned steps is
the difference between a viewer and an operator.

*Deliberately kept off this page.* The competitor coverage note, recorded per step, which says whether the
incumbents sell into it. That is positioning aimed at a buyer rather than operational information for the person
working the funnel. Held for the sources or store page.

**U-42. The actor split is the only thing on the page besides the twenty rows.**
One chart showing what proportion of the work each actor type did: agent, human, deterministic software, clock.

*Why it earns the space.* It is the manual-work metric with its workings shown, and manual work is one of the
three locked metrics. Nothing else in the product exposes it.

*Why the bottleneck is not called out.* On a page sized by duration the longest bar is the bottleneck, so a
label would restate what the shape already says. If the longest bar ever stopped being the bottleneck, that
would mean the shape was misleading, which is a reason to fix the shape rather than add a caption.

**U-43. Store scope rule: work surfaces one store, analysis surfaces tenant-wide, each labelled.**
Deck, decide, screening and flag are the manager's own store. Pipeline and sources cover the whole tenant.
Every analysis page states its scope on the page so its numbers cannot be misread as the manager's own.

*Why the split.* D-031 is respected where the manager works. And the seeded data is thirty-six candidates
across five stores, so a duration distribution over one store rests on about seven people, which is noise. The
argument page needs the volume to mean anything.

*Resolves an existing inconsistency.* The deck was locked to one store, `flag` took no store filter at all, and
`pipeline` took an optional one. Three pages, three behaviours. Now one rule.

### Page 7: compliance and checks

**Decided by an independent agent under P-01. No recommendation was supplied to it.** The agent probed the
seeded data rather than reasoning from the option text, and three of its findings were verified independently
before being recorded here.

**U-44. One page, two clearly divided sections.**
Statutory clocks in one section, background checks in the other, visibly different from each other.

*The structural fact that decided it, verified.* The two datasets are **disjoint in time by construction**.
`clocksFor` returns an empty array without `startedAt`, so clocks only exist post-start at steps 11 and 12. A
background check is steps 9 and 10, pre-start. Measured: six applications can carry clocks, zero checks are
currently open, and zero applications could hold both. So a row organised per person would have one half
structurally empty for every person, always.

*Why not two pages.* `adverseProcess` already computes the FCRA notice sequence by reading `backgroundChecks`
and returns it inside the **compliance** payload. Two pages would put the pre-adverse notice on one page and
the report that must legally accompany it on another, at the exact moment a sequence that cannot be collapsed
is being run.

*Why divided rather than merged into one list.* A statutory clock has a due date, a citation and days
remaining. A county search has an elapsed time against an expected duration and no legal deadline at all. One
undifferentiated list invites the eye to read those as the same kind of obligation, which is this page's
sharpest honesty risk.

**U-45. Organised by deadline urgency, with who-is-being-waited-on as a per-row label.**

*Why urgency.* A missed statutory deadline is an enforcement event, so proximity to breach is the only axis
that ranks by consequence. It is also what the data model already asserts: `allCases` sorts ascending by the
soonest unmet clock, and `toneFor` derives critical and warning from days remaining.

*Why not by obligation type.* Kayla Brennan-Ross's five clocks would scatter across four groups, and her
tentative nonconfirmation window, employee resolution and government update are one interlocking story sharing
a single ten-day window.

*Honesty constraint this creates.* The checks section has no statutory deadlines. Its `overdue` flag compares
elapsed time against `expectedMs`, **a seeded constant**. Under the locked rule that no seeded constant may be
presented as a measurement, "overdue" in the checks section must get visibly weaker treatment than "due
tomorrow" in the statutory section, and the row must say the expectation is ours rather than the vendor's or
the law's.

**U-46. The adverse action bar gets both a row marker and a refusal when attempted.**

*The reason refusal-only is unsafe, and it is a good one.* The bar covers five things and the product can
intercept two. `adverseActionBlock` guards state transitions and `blockShiftRemoval` guards scheduling.
**Delaying training, lowering pay and suspending somebody happen in the retailer's other systems, which we
connect to rather than own.** A refusal-only design says nothing at all about the majority of the barred
actions, so the warning has to exist before the attempt.

*Consequence for the data model.* `adverseBar` is currently reachable only through `compliance.allCases`. It
needs to move onto the candidate brief so **every** surface that renders that person's name can render the bar.
The `attempts` array, which already records actor and reason per attempt, goes in the expand.

**U-47. The business-day caveat goes on expand, next to each affected clock.**

*Why per-clock rather than page-level.* The caveat does not apply to every clock and the code already knows
which. The three clocks whose `unit` is `working days` are the generous ones. `i9_s2` genuinely runs in
business days under 8 CFR 274a.2(b)(1)(ii). A page-level statement over-applies the caveat to two clocks it
does not qualify, which is its own small inaccuracy.

*Consequence for the data model.* The note is currently one string in `views.js`, remote from the arithmetic in
`compliance.js` that it describes. It should become a per-clock field applied where the working-days rule is
applied, so the caveat cannot drift from the clock it qualifies. There is also a free at-rest signal already
present: the differing `unit` strings let a row read "4 working days" against "2 business days" with no extra
copy.

**U-48. A user can act on everything relevant here, including the notice sequence, through the drawer.**

*Why not read-only.* It would make this the only surface in the product that displays an obligation with no way
to discharge it, which inverts the thesis about waits and handoffs. Two of the five clocks are owned by a human
and that human is the store manager: there is nobody to chase on an I-9, the action is to book it and sign it.

*Why the notice sequence specifically belongs here.* This is the only surface holding the report, the searches
that returned a record, the required gap and the statutory rule together. An interface that shows the gap as
uncollapsible while offering the two notices in order is the only design that stops it being collapsed.

*Carve-out, following U-24.* Approve and reject stay on the deck drawer and decide. **Nothing on this page
decides employment.** Actions run through the single drawer component from U-30, making this a fourth entry
point rather than a second implementation of the reason field.

*Three tools that do not exist yet.* Send a pre-adverse notice, send an adverse notice, re-poll a check. Each
needs to be a write tool with confirmation and a required reason. **And one new safety case:** the notice tools
must consult `adverseActionBlock` before sending, not only the state transition that follows, because sending
an adverse action notice to somebody contesting an E-Verify mismatch is precisely the back door the bar exists
to close.

*One correction to the agent's report.* It said the tool registry holds seventeen tools. Verified count is
**twenty-five**: fourteen read and eleven write. The figure seventeen appears in CLAUDE.md and is stale.

### DEMO BLOCKER found by the same pass, verified

**Store-scoping this page hides the FCRA beat from the person the demo is driven as.**

Verified against the data. Dara Simmons is the only candidate whose check returned a record, and she is at
**#0501 Stonewell under Ruth Delgado**. The default acting viewer is **Marcus Hale at #0417 Ridgeway**. Under
U-43 this is a work surface and therefore one store, so the pre-adverse sequence is invisible to Marcus.

**The refinement that matters, and it cuts the other way.** Kayla Brennan-Ross, the only candidate contesting
an E-Verify mismatch and therefore the entire adverse-action-bar story, **is at #0417 Ridgeway under Marcus
Hale.** So the bar demonstrates correctly under store scoping and only the FCRA notice beat does not.

*Two fixes, and the choice is Suniras's.* Move Dara to a Ridgeway requisition in the seed, or switch acting
viewer at that point in the demo. The first is a seed edit and makes the demo simpler. The second is a stronger
moment and adds a step to the script.

*Classification.* **P1.** It does not break anything; it makes one planned beat unreachable on the default
viewer.

### THREE MORE DEFECTS, 7 September, all verified. Two are spoken aloud on a live call.

Found by the independent agent deciding the candidate-facing surfaces, and confirmed against the data.

**D-A. The availability question is wrong for seven of the eight requisitions. P0.**

The question text is byte-identical across all eight and says "The role needs weekend evenings and one early
opening a week." That is true of exactly one requisition, the Ridgeway Cashier, whose `requiredSlots` are
`sat_evening, sun_evening, wed_open`. Measured against the others:

| Requisition | Actually needs | The question says |
|---|---|---|
| Overnight Stocker | mon, tue, thu **nights** | weekend evenings |
| Deli Associate | sat, sun **openings** | weekend evenings |
| Bakery Assistant | mon, wed, fri **openings** | weekend evenings |
| Meat Clerk | tue, thu, sat openings | weekend evenings |

*Why this is worse than a copy error.* The agent asks a candidate about hours that are not the job's hours,
and then eligibility scores their answer against `requiredSlots`, which are different. A candidate can
truthfully answer yes about weekend evenings and be assessed against Monday nights. Spoken on a live call it is
a **misstatement of the terms of employment to the candidate**, and it produces a score that means nothing.

**D-B. The physical question has no accommodation clause. P0, ADA exposure.**

Verbatim: *"The role involves being on your feet for a full shift and lifting up to 25 pounds. Is that something
you can do?"*

"Is that something you can do" is an ability question. The locked rule, from Suniras's own prompt brief,
requires physical requirements to be phrased as essential job functions **with the accommodation clause built
in**, never as a health question. This is spoken aloud to a live candidate.

**D-C. Criteria and questions do not line up on three requisitions. P1, correctness.**

Deli Associate, Bakery Assistant and Meat Clerk each declare `reliability` as a criterion with **no question
mapped to it**, while their availability question maps to `availability_fit`, which is **not** in their declared
criteria. Since `rubric()` walks the declared criteria to find their questions, availability is collected and
scored nowhere on those three, and reliability returns not-covered despite being declared.

*All three block the agent prompt* rather than merely being untidy, because D-A and D-B are the words the agent
speaks and D-C is what the score is computed against.

### Page 8: sources

**Decided by an independent agent under P-01. No recommendation was supplied to it.** It answered two
questions, on what the page is for and on how the unreliability is presented, and it argued from the seeded
database rather than from the option text. Written up in full on 7 September, after a first write-up
compressed nine decisions into two entries. Every figure below was recomputed against the current
`state.json` before it was recorded here, and four of the agent's supporting claims did not survive that. The
corrections are at the end of the section.

**U-49. Sources is an integrator surface, not a performance report.**
The page shows what is connected, what could be connected, and what the depicted LinkedIn integrator would
do. It does not show which source produces hires.

*Why, from the data.* 36 applications across 8 sources produced **6 hires**, distributed 3, 1, 1, 1, 0, 0, 0,
0. Three sources have exactly one hire and four have none, so seven of the eight carry one hire or none. No
caveat rescues a performance report built on that. Configuration and connection status is the one thing on
this page that is genuinely observed, so it becomes the page.

*Why not a compliance record surface, retained and exportable.* Invalidated by what does not exist. There is
no consent table, no retention class, no `dataClass` field and no delete method anywhere in `server/lib`, so
"retained" has nothing behind it. `export`, `csv`, `excel`, `spreadsheet`, `download` and `print` are all in
the `OUT_OF_SCOPE` list in `demo/js/nlu.js`, so the assistant actively refuses the export that option
promises. It would also duplicate the blocker artefact U-26 already put on the candidate page.

*Why not delete the page and fold source into the candidate record.* It contradicts B-21, which deliberately
put sourcing back in scope and created the depicted LinkedIn integrator. Deleting the page leaves that
integrator homeless, because the careers page and the apply form are candidate-facing and are not among the
eleven routes.

**U-50. No rankings, no best-source claim. Counts of what was declared, labelled as a declaration.**

*Why it is nearly free.* Once the page is an integrator surface there is no reason to rank sources at all.

*Why the per-store view settles it.* Lakeside has 3 applications across 1 source. Brookfield has 2
applications across 2 sources and 0 hires. Stonewell has 3 across 2. A store-scoped source ranking would put
one source first out of one.

*Why not a confidence figure per row.* There is no input for it. `applications` carries only `source` and
`sourceKind`, and no agreement or confidence field exists anywhere. Stamping the 17 per cent agreement figure
from the 15,276 candidate study onto our own counts would be fabricating a number about a different dataset.

**U-70. The five outbound destination rows stop being post counts and become configuration rows, each
carrying a status.**
The agent named four statuses in its own words: the careers site fronted by us, Google for Jobs and free
aggregator feeds available but not built, LinkedIn closed and why, and the paid boards. It did not write the
copy for any of them and did not name the row fields beyond a status.

*Why.* A count of simulated calls reads as a listing that is live on a board we cannot reach. The agent called
the block "the page's biggest liability rather than its content". A status that says what is ours, what is
available but unbuilt, what is closed and what needs a contract is true of every row.

*Consequence.* The view must expose a per-row status instead of a count, and the copy for each status still
has to be written. `mode: 'simulated'` is still hardcoded in the view at `views.js:365` rather than read from
the connector call, so the honesty label is asserted by the view rather than reported by the call it
describes.

**U-71. Every row uses the register the LinkedIn closed row already uses. LinkedIn stays as one of the
destination rows.**
The register is a status, a reason, and a citation where one exists.

*Why.* The LinkedIn row is the only row on the page that already says plainly what is true, why, and on what
authority. The agent's words: it "already carries the LinkedIn row in exactly the right register, with a
verified citation and a reason, and that is the register every row on this page should be in". So the other
rows come up to it rather than that row being softened down.

*What was not decided.* The agent did not rewrite the note, did not quote its wording, and did not say whether
it sits at the top, the bottom or inline with the other destinations. There is also no recorded decision about
the order the eight sources appear in. The code sorts inbound by application count and outbound by accepted
count, but that is the code, not a decision.

**U-72. The failed Jooble post and its retry stay on screen, with the error text shown as it is.**
The string is "HTTP 502 from the aggregator. Feed rejected, no listing created."

*Why.* This is B-09's honesty pattern applied to sourcing. The agent called the row "the most valuable thing
in the block", because a failure that shows what actually failed is the one event on the block that is
observed rather than asserted. Collapsing the ten attempts into a success count, which is what the block did
before, hides it.

*Consequence.* The row renders the attempt history and the error string, not a rolled up total.

**U-73. The identity and rehire block stays, reframed as the records connector rather than as a source.**
It keeps its three parts: 3 prior employment records, 3 exact matches, and the tenant isolation sentence,
which the agent called "the strongest honesty statement in the codebase".

*Why.* On an integrator surface the rehire lookup is an integration, so it belongs. Calling it a source puts
it in the same frame as the job boards, which is wrong, because it reads one customer's own employment records
rather than bringing in new applicants.

*Consequence.* The label and the framing change. The contents do not.

**U-74. `advanced` and `hired` stay computed in `bySource` and neither renders as a column.**

*Why.* Both numbers are real, so they are not deleted from the view. But with 6 hires across 8 sources a hire
column is a ranking whether or not it is labelled as one, which is the same failure the U-49 and U-50
rejections rest on.

*Consequence.* The view keeps the fields. The page template must not print them.

**U-75. Sources is an operator and IT surface, so the per-step competitor coverage note does not go on it.**

*Why.* The coverage note is positioning written for whoever is buying. This page is about connectors and
configuration and is read by the people who run and connect the systems. U-41 held the note for a
buyer-facing page without saying which one. It goes to store instead, recorded as U-79.

*Four corrections to the agent's report, found when its claims were rechecked.* Its choice survives each time.
Its stated reasons do not.

It said we have "no integration with Indeed, Adzuna or Jooble and no route to one", and called them paid
boards needing the retailer's own agreement. Our own verification round says otherwise.
`01-diagnosis/verification-2026-08-26b.md:303-306` records Adzuna first-party offering to advertise organic
jobs free from an XML feed, with Jooble taking the same feed through a support ticket at zero cost. Lines
313-320 record the Indeed Job Sync API as free in fees, needing a signed developer agreement and about six
weeks. So three routes are documented, the agreement Indeed wants is ours as an integrator rather than the
retailer's, and LinkedIn Apply Connect is the one route where the customer must hold a paid licence, E-102.

It said job board distribution is out of scope. Q-041, whether D-009 has to be amended, is still open and
marked RAISED. The free unilateral tier is a recommendation awaiting Suniras in the decision register, not an
agreed exception. The correct statement is that distribution is an open question against a standing non-goal.

It cited a locked constraint saying never imply an external system executed something it did not. No such text
exists in the repository. The nearest real rule is in `connectors/index.js:14-16`. The rule at
`agent/runtime.js:224` is about the assistant's account of its own writes, not about external systems.

And it described the `byDest` row as carrying a `live` count. That was true when it looked and is not true
now. See the two new defects at the end of this section.

### Page 9: store

**Decided by the same agent under P-01, from two questions: the audience, and the primary content.** Its
output instruction was a letter plus two to four sentences per question, so it decided the purpose and the
content axis and never laid the page out. What it did not decide is stated as not decided below rather than
filled in. Its figures were computed against a copy of `state.json` taken before the nine defect fixes landed,
so most of them have moved. The current values are used here.

**U-51. Store is the buyer's report D-031 promised, and it is a report rather than a workspace.**
It is the product's only cross-store and district surface, so cross-store comparison lives here. It does not
adapt to whoever is acting.

*Why.* D-031 promised the buyer a report. U-43 already makes tenant-wide surfaces analysis surfaces that state
their scope, and a report is by definition not a workspace.

*Why not the store manager comparing their own store against others.* It reintroduces one page over exactly
what U-06 was written to prevent. The manager already has the deck for their own store, and comparing against
other stores is not their job.

*Why not field HR over a district.* The tenant record says District 12 has 18 stores and the database holds
**5**, so the label and the data contradict each other. A district view is also a workspace, which the second
half of D-031 reserves for the store manager.

*Why not all three audiences, adapting to the viewer.* There is no scope model to adapt with. Building one
means changing `tenant.people`, `contextFor` and every view default, and it triples the states of this page
thirteen days out.

*Consequence.* This page carries the cross-store and district comparison for the whole product, and under U-43
it states its scope on the page. Nothing changes in `contextFor`, `tenant.people` or the view defaults,
because the viewer-adaptive option was rejected.

*One correction.* The agent said no surface currently delivers a buyer's report. A store screen already
exists, registered at `demo/js/views.js:1494`, and its District card at `:1359-1361` is subtitled "The one
screen in this product aimed at somebody other than the person doing the hiring." D-031 itself says the screen
built on 27 August survives and changes audience. So this is a rebuild of an existing surface rather than the
filling of a hole, and the work is smaller than the entry implied.

**U-76. The page is organised around where each store is losing time. It is the per-store version of the
pipeline argument.**

*Why consistency is the point.* Queue share barely varies: **93.4, 93.1, 97.9, 87.4 and 95.9 per cent**
against 94.4 tenant-wide. For a ranking that consistency is a weakness. For the argument that the loss is
structural rather than one badly run store it is the whole point. It is the only option where a small sample
helps.

*Why not the three primary metrics ranked per store.* The page would display a defect. Time to hire per store
has n = 3, 1, 1, 0, 1, Brookfield has no median at all, and when this was decided two stores had a negative
median. Ranking five stores on medians of one person is not a report.

*Why not open requisitions and fill progress.* "Open 35 days" was a seeded constant rendered as a
measurement, and fill progress is a nearly complete binary.

*Why not exceptions and risk per store.* It duplicates two existing surfaces, under-reported because of a null
field, and is too small to be a report. The register holds 5 rows.

*What was not decided.* The sections, what any row shows, the order the five stores appear in, what the page
opens with, and whether a store can be opened for a drilldown. The word drilldown never appears in the agent's
output. It never had to decide an empty state either, because both figures it chose exist for Brookfield, at
87.4 per cent and 17 handoffs.

*One correction, and it matters for what a later change could break.* The agent chose these two figures partly
because it believed queue share and handoff totals are both sums over recorded events rather than subtractions
between two spans, which is what made them safe from the negative median defect. Handoffs are a sum, counted
at `metrics.js:277` and `:340`. Queue share is not. `metrics.js:249` sums `durationMs` into work, `:252` sets
elapsed from applied to closed, and `:273` subtracts one from the other. What protects it is the
`Math.max(0, ...)` clamp on that line, not the absence of a subtraction. Naming the real guard matters, because
a clamp is the kind of thing a later change removes.

**U-77. The two figures that carry the page are queue share and the handoff count. There is no per-store
bottleneck label.**
Current handoff totals are 75, 39, 15, 7 and 17, against a tenant total of 153.

*Why no bottleneck column.* The per-store bottleneck mostly repeats the tenant-level answer, and where it
differs it rests on one or two people. So the column is either redundant or unsupported.

*Consequence.* The bottleneck story stays where it already is, on the funnel and pipeline surfaces and in the
assistant's answer.

**U-78. Three of the store view's blocks come off this page: openings, restrictions and shifts.**

*Why.* All three are workspace parts and this page is a report. Restrictions should not be here in any case,
because U-46 moves the adverse action bar onto the candidate brief.

*Consequence.* The openings and restrictions material has no home on this page. The shifts block was
permanently empty when this was decided. That was fixed on 7 September as defect 8, and the fix has since
produced a new defect of its own, recorded at the end of this section.

*One correction.* The agent said the page loses three of six blocks. `storeView` returns seven top-level keys:
`store`, `stores`, `openings`, `restrictions`, `metrics`, `shifts` and `comparison`. The three it named are
unambiguous, so the choice stands and the fraction was wrong.

**U-79. The per-step competitor coverage note lands on the store page. This closes the item U-41 held open.**

*Why.* The note is positioning aimed at a buyer and this is the buyer-facing surface. Sources was decided in
the same run to be an operator and IT surface, so the note does not belong there.

**U-80. The page is built before the buyer is named as a person, and that cost is accepted rather than
deferred.**

*Why.* The agent's words: "the buyer is not named as a person, but a report has no persona-specific
interaction, so it is the one artefact that can be built before the person is named."

*Consequence.* This page can ship for 20 September with the persona gap still open. The gap stays open for
every other buyer-facing choice, and Q-027 stays open with it.

**U-81. Any per-store grouping of exceptions joins through the application. It never reads
`exceptions.storeId`.**

*Why.* When this was decided the field was null on more than half the register, and every null was a runtime
raise, so a grouping keyed on it silently dropped rows while looking complete.

*Consequence, and the state of it now.* The underlying defect was fixed on 7 September as defect 7, with a
shared `storeOf` helper applied in `raiseException` and `workflowEvent`. All 5 exception rows now carry a
store. The rule stays anyway, because `get_blocked_candidates` at `agent/tools.js:247` still filters on
`e.storeId` directly, so the fix in `events.js` is what protects that caller rather than caller discipline.

*The agent's own defect ranking, kept because it refused the easier option.* It ranked the six approvals
recorded before screening completed as P1 and said to fix them in the seed regardless of what this page
renders, because U-05's metrics strip and the decide page could both reach the span. It explicitly refused the
argument that the store page no longer showing it was enough. Fixed as defect 6.

*One correction to that reasoning.* Only one surface renders `screeningToDecision` today, the funnel screen at
`demo/js/views.js:1199`. The deck payload can reach the value because `views.js:88` returns the whole rollup,
but nothing on the deck renders it, and the decide payload cannot reach it at all: `views.js:116-117` returns
candidates, count and boundary, and each row comes from `brief`, which carries `waitingMs` and `totalMs` and no
spans. The fix was right. The reason given for it was overstated.

### Page 10: the assistant

**Decided by the same agent under P-01, from three questions: the opening state, how a write is confirmed, and
what is said after it acts.** This agent ran in the background and the session compacted before its answer
arrived, so its output never entered the main transcript and the only copy is in its own subagent record. The
first write-up here compressed three decisions into one paragraph and carried one claim that is wrong. Both
are corrected below.

**U-52. The sidebar opens with a short statement of what it can and cannot do, plus that page's suggested
questions.**
Two things before anything is typed: a capability statement with a can half and a cannot half, and under it
the suggested questions for the page the user is on. The cannot half must include export.

*Why not a bare input.* B-18 exists precisely because a blank box on stage depends on somebody phrasing a
question well.

*Why not suggestions plus recent conversation history.* There is no conversation history anywhere. See U-53.

*Why the capability statement earns its place.* On a regulated automated employment decision tool, the
assistant saying up front that it cannot decide is the disclosure at first contact. Export belongs in the
cannot half because export is refused by design and is the most likely first thing a user tries.

*Consequence.* `SUGGEST` at `demo/js/chat.js:456` is one global list, so per-page suggestion sets are new work.
They are entirely a client concern, because `handle()` receives no page context, so the server needs no change
for them. The capability statement does not duplicate U-18, which put the human and AI boundary statement in
the decide expand only.

*One correction, and it changes what has to be built.* The earlier write-up said `help` routes to a client
action the interface never renders, which made the capability statement an existing unimplemented action. That
is wrong. `chat.js:360` dispatches `clientAction`, `chat.js:385` maps `help` to `greet()`, `greet()` at
`:515-527` renders a capability sentence plus the suggestion chips, and it already runs on first open of the
panel at `:482`. So an opening state already ships. What U-52 changes is its content: `greet()` today has no
cannot half at all, and the chips are the one global list. This is an edit to shipped copy, not a first render.

**U-53. The sidebar renders no conversation history, and `agentActions` is never shown as one.**

*Why it cannot be built.* `llmTurn` sends a single message with no prior turns, and `handle` reads only
`input.text` and `input.route`. There is no history to render. `agentActions` is the nearest table and it is
read tenant-wide with no per-user or per-session filter at `views.js:423`, and it carries no session or thread
id, so rendering it as recent conversation would show another actor's turns and imply a continuity the model
does not have.

*The consequence the agent named and did not solve.* A user's first follow-up resolves against nothing. Its
example was "and hers?". Nothing in the product tells a user that the assistant does not remember the previous
turn. The agent chose no copy and named no place for such a statement, so this is a decided absence with an
open gap attached, not a decision that the absence is disclosed. Whoever builds the opening state has to decide
whether the cannot half says so.

*One correction.* The earlier write-up said `agentActions` holds 7 rows and mixes seeded turns from 29 August
with live ones. It holds **0 rows**, and there are no seeded turns at all: `seed.js` never calls `agentAction`,
and the only writer is the live runtime. Nothing in it could be dated 29 August either, because the simulated
clock is anchored at 17 August. The two parts that do hold are the ones the decision rests on, the tenant-wide
read and the missing session id, so the decision itself is unaffected.

**U-54. A write is confirmed inline in the conversation thread. Not a drawer, not a modal, not a handoff.**
The assistant states in the thread what it will do and to whom, and a confirm control appears beneath that
statement. The block is assembled from what `execute()` already returns: `needsConfirmation`, `pendingId`,
`level`, `confirmPrompt`, `confirmLabel` and `humanDecisionNote`. The control carries the label the level gives
it, "Yes, and record it against me" at `human_decision` and "Yes, do it" at `confirm`. The sentence naming the
person comes from the tool's own `consequence()`.

*Why inline.* The contract is already built and already conversational, so inline is what the backend already
returns. It keeps U-09's reason for choosing a sidebar intact, which is that the page stays visible behind so
the user can watch the queue change. U-22's rule that drawers are where you act and inline expansion is where
you read holds unamended, because the thread is acting on the thing it is showing.

*Why not the shared drawer over the page.* A `pendingActions` row carries `tool`, `args`, `level`, `utterance`
and a consequence string. The U-04 drawer renders a queue item, and U-04's own text is three mutually exclusive
payloads rather than one: two scores and cited evidence for a decision, the prior record for a rehire hold, the
shift and the notice window for a day-one risk. None of that is reachable from a pending tool call without
assembling a different payload, and a drawer over the page breaks U-09's stated reason for a sidebar. A modal
breaks the same rule more bluntly.

*Why not hand off by navigating the page behind.* Recorded with its reasoning corrected, because the agent got
this one backwards. It said `nav_goto` is a tool, and that only 3 of 10 confirmable tools have a surface to
hand off to. `nav_goto` is not in the registry at all: it is an NLU intent at `js/nlu.js:390` mapped to a
client action at `runtime.js:131`, handled at `chat.js:399-403` where it prints "Opening it." and changes no
route. And 8 of the 10 confirmable tools do have a surface that performs the same act. The two without are
`approve_batch`, which has no bulk UI anywhere, and `assign_candidate`. So the real reason to reject a handoff
is not that there is nowhere to send people. It is that the mechanism does not exist: the thing the agent
called a navigation tool does not navigate.

*Consequence.* The pending row is persisted in `pendingActions`, so a refresh in the middle of a confirmation
neither loses the action nor executes it. One defect had to be fixed for the block to be safe:
`update_candidate_stage`'s consequence could render "to UNDEFINED", and in a sidebar that string is the entire
confirmation. Guarded on 7 September.

**U-82. The inline confirmation block scrolls rather than clamps, because `approve_batch` names every person
and those names cannot be shortened.**
Never truncated, never elided, never counted instead of listed, never hidden behind a show-more control.

*Why.* Naming the people is the safety property, so it is the one part that cannot be cut. The assistant safety
suite grew to 57 cases after a bulk action resolved to the wrong set. This makes `approve_batch` the longest
confirmation in the product, sitting in the narrowest column in the product, so something has to give and it
cannot be the names.

*Consequence.* The block needs an internal scroll region at the narrowest column width in the product. With no
filter it currently names **8** people, not the 7 the agent counted: 8 applications sit in `DECISION_PENDING`
and none is held by a blocking exception.

*One qualification on the pattern, not on the decision.* The earlier write-up implied every confirmable tool's
consequence names a person. Ten of the 25 tools are confirmable and all ten carry a `consequence()`, but three
branches name nobody: `approve_batch` with a filter matching nobody returns "Nothing matches, so there is
nothing to confirm.", `schedule_screening` with `allEligible` returns a count, and any tool given an
unresolvable name returns the resolver error instead. So the scroll region has to handle a one-line block as
well as the longest one.

**U-83. After it acts, the assistant reports the result plus what that action set in motion downstream.**
Two parts: what happened, and what it started that the user cannot see. The downstream sentence comes from the
tool result and describes only what the backend did on this turn.

*Why this rather than a plain confirmation.* A plain confirmation is this with the part the tool already
computes deleted. Two shapes already exist: a recorded live turn reads "Ines Duarte approved. State is now
Offer ready to send", and `approve_candidate`'s consequence already says "An offer is generated straight
afterwards but is not sent until you confirm that separately."

*Why a refusal is a downstream statement too.* The workflow engine never silently does nothing and a refusal
returns a reason, so showing nothing after a refusal is the worst outcome available. `remove_shift` blocked by
`adverseActionBlock` shows the engine's reason as it is.

*The honesty rule this carries.* Vendors are simulated under B-17, so "the check is ordered" must not become
"the agency is searching", and `send_offer` must not imply an email arrived if the connector recorded a
simulated call.

*Why not the result plus a link to the audit entry.* Not available as written. `confirm()` calls
`EV.auditEvent(...)` and discards the return, so no id reaches the client even though `auditEvent` does return
the row with its id. It is a one line change, but it is the weaker half of this decision anyway, because
`get_audit` exists, `recent_activity` is a proven intent, and U-26 put the contiguous trail on the candidate
page for the audience that reads it.

*Why not restate the page state that moved.* The page already updates behind the sidebar by design, so
restating it in text repeats what the user can see. That is the reasoning U-23 used against the candidate
header metrics strip.

*Consequence.* No backend change is needed for the downstream sentence. This is the third home for the fan-out
story, after U-16 sent it off decide and U-21 gave it the candidate timeline.

### TWO NEW DEFECTS, found 7 September while rechecking these three pages. Both are mine.

Both were introduced by fixes 8 and 9 in the nine-defect table. Each fixed the server and left the browser
saying the old thing.

| # | Defect | Where |
|---|---|---|
| 10 | The outbound table still heads a column "Live" and still reads `o.live`, which no longer exists. The value is `undefined`, so the page prints the word "undefined" in all five rows | `demo/js/views.js:1394` and `:1401` |
| 11 | Removing the shifts window filter made two labels false. The tile says "First shifts this week" and the card says "N in the next seven days", while the payload is now every shift ever recorded at that store. Ridgeway shows 4, three of them in the past, one from 22 June | `demo/js/views.js:1300` and `:1342` |

Defect 10 is worse than the one it replaced. The old field name overstated a simulated call. The current code
prints a literal "undefined" on the page U-49 makes an honesty surface. Defect 11 is the server comment at
`views.js:330-334` being taken at its word: it says the view decides what is upcoming, and the view does not
decide, it prints everything under a seven-day label.

Neither is fixed yet. They are recorded rather than fixed quietly, because the pattern is the one worth naming:
a rename or a filter removal on the server is not finished until the browser that reads it changes in the same
pass.

### Pages 11 and 12: the candidate-facing surfaces

**Decided by an independent agent under P-01, from seven questions.** Expanded in full on 8 September. These
are new surfaces rather than redesigns, and they are the front of the live demo spine, so the candidate in the
room meets these two pages before anybody sees the product.

**U-55. The careers page is a working job list built from the eight real requisitions, with a permanent
demonstration marker.**
Real requisitions, real titles, real rates, real hours. The marker is rendered from `org.fictional` rather
than written into the page copy, so it cannot be removed by editing a template.

*Why a working list rather than a mock-up.* It is the entry to the live spine. A candidate applies through it
during the demo, so it has to work.

**U-84. Filterable by store and role. The store filter defaults to Ridgeway.**

*Why, and this is a real risk rather than a nicety.* Under U-43 the deck, decide, screening and flag surfaces
are scoped to Marcus Hale's #0417 Ridgeway. Only 3 of the 8 requisitions are Ridgeway: `req_cashier_ridgeway`,
`req_stocker_ridgeway` and `req_deli_ridgeway`. So five of eight browsable jobs lead to an application the
demo's own work surfaces cannot display. Defaulting the filter to Ridgeway closes that. Entering on a direct
link to `req_cashier_ridgeway` is the alternative and both are acceptable.

**U-85. A public projection of a requisition, stripping four fields.**
`criteria`, `screeningQuestions`, `positivePhrases` and `concernPhrases` never leave the building.

*Why this is not tidiness.* Rendering a requisition raw on a candidate-facing page publishes the store's
scoring answer key. Every phrase that scores the interview would be readable by the person about to be scored.

**U-86. The disclosure gate sits before the form, applies the strictest rule tenant-wide, and says that it
does.**
It is also the home of three things nothing else owns: the consent and retention record, the NYC published
bias-audit link, and the NYC notice clock.

*Why the strictest rule everywhere.* B-26 asserts a footprint including New York City and California. All five
seeded stores are elsewhere: Ridgeway, Northgate and Lakeside in Ohio, Brookfield in Indiana, Stonewell in
Kentucky. Applying the strictest rule tenant-wide is defensible. Implying a store in a jurisdiction we do not
have is not.

*What the gate owns, and what has to be built for it.* The consent table, the retention class and the data
class do not exist, and `store.js` has no delete method. California's four-year retention of system inputs
starts at this gate, so the gate is where those records begin. The NYC ten business days of notice cannot
elapse inside a demo, so it renders as a running clock rather than a satisfied tick. That makes it the
product's first pre-start clock and a change to `compliance.js`, because `clocksFor` returns an empty array
without `startedAt`.

**U-87. The apply form collects the minimum the five eligibility rules need, plus email and the experience
line. No SSN.**
It shows the requisition's own required slots, its age minimum and its commute band next to the inputs, rather
than validating after submission.

*Why show the constraints rather than validate afterwards.* U-37 gates the screening invitation on eligibility
passing. A person in the room who mis-ticks the availability grid, or whose date of birth misses the minimum
age, kills the live spine before the call is placed. The minimum age is 18 on five requisitions and 16 on
three, so it genuinely varies. And 35 of the 36 seeded applications offer all 13 slots, so availability almost
never fails in the seeded data and a live grid is the first real test of it.

*Why no SSN.* Nothing in the eligibility rules needs it, and I-9 section 1 is post-offer. Collecting it at
intake creates a retention obligation for no purpose.

**U-88. `distanceMiles` comes from a declared stub carrying a simulated badge.**

*Why it cannot be presented as a computed distance.* There is no ZIP, address, geocoding, latitude or
longitude anywhere in `server/lib`, and the five towns are fictional. Under the locked rule that a simulated
integration is always visibly simulated, a distance we did not compute cannot render as one. `rules.js` reads
`application.distanceMiles` against the requisition's `maxDistanceMiles`, and that rule is already marked
`advisory: true`.

**U-89. The 13 availability slot keys get one canonical shared copy with a label map.**
`mon_open`, `mon_night`, `tue_open`, `tue_night`, `wed_open`, `thu_open`, `thu_night`, `fri_open`,
`fri_evening`, `sat_open`, `sat_evening`, `sun_open`, `sun_evening`.

*Why.* They currently appear nowhere outside `server/lib/seed.js` and there is no label map at all. The apply
form's slot grid and eligibility scoring have to agree on them, and `demo/js/steps.js` is the pattern for a
single copy read by the server, the browser and the tests. Two independent descriptions of one shift pattern
is how the availability question and `requiredSlots` drifted apart in the first place.

**U-90. Intake is a new engine entry point. It creates a candidate and an application at
`APPLICATION_RECEIVED` and lets the existing transition carry it on.**

*Why a new entry point is needed at all.* Nothing creates an application today. `workflow.js` exports
`transition`, `settle` and `runEligibility` and no create function, and the seed writes rows directly.

*Why no new transition.* `APPLICATION_RECEIVED` to `ELIGIBILITY_REVIEW` already exists in `schema.js` at line
86, as `by: ['system'], auto: true`. So intake writes two rows and calls `settle()`. No bespoke path.

**U-91. Eligibility runs synchronously on submit. The confirmation branches on the result. It never states the
reason when the rehire rule is what held it.**

*Why synchronous.* U-37 gates the screening invitation on eligibility passing, so the confirmation cannot be
rendered until the result is known.

*Why the rehire reason is withheld.* Telling a candidate that a prior employment record held their
application discloses somebody's employment history to whoever is standing there, and under a partial match
it may not even be theirs. See U-93.

*Dependency.* It needs the `invited` and `opened` stages from U-34, which do not exist yet.

**U-92. The confirmation carries both call methods. Browser call first, outbound call second.**

*Why both, and this is what makes B-08 real.* The demo script clicks the outbound button so the phone in the
room rings. A carrier problem on 20 September then costs one click rather than the centrepiece. It is the same
two-button shape as the live Unifi entry page, arriving at the moment eligibility has just passed.

**U-93. No candidate-facing status page.**

*Why, and the reason is specific rather than general caution.* All three `priorEmployment` rows match `exact`
in the seed, so the `partial` branch of `matchPriorEmployment` in `rules.js` is completely unexercised, and a
live form is the first thing that can produce one. The soft key is last name, first name and date of birth
with the phone digits dropped. So typing Trevor Boone's name and date of birth with any other phone number
matches his row, which carries `rehireEligible: false`. A status page the candidate could return to would then
show a stranger a do-not-rehire flag belonging to somebody else. That is the discrimination complaint the
under-merge tuning exists to prevent, not a bug.

**U-94. A live candidate is never given an `answers` object.**

*Why.* `runConversation` assembles a transcript from a seeded `answers` map. Handing one to a live applicant
would let the product manufacture a synthetic transcript for the person who just took a real call, which is
the single worst thing that could happen on stage.

**U-95. The screening questions are not pre-answered on the form.**
Rejected on four independent grounds: it duplicates the interview the voice agent is about to conduct, it
gives the candidate the question bank in writing, it produces a written answer that no scoring path reads, and
it lengthens the one form the live spine depends on.

### The visual language

**Decided by an independent agent under P-01, from eight questions, 7 September.** Expanded with its chosen
values on 8 September, because the first write-up recorded the reasoning and the measurements and none of the
values, so it could not be built from. Every contrast figure below was measured independently and all of them
were exact.

**U-62. Keep the primary and the four owner hues. Rebuild the neutrals.**
Measured on their own surfaces the hues all pass: `--accent` 5.78:1 light and 7.29:1 dark, `--agent` 8.27 and
7.47, `--system` 6.20 and 7.29, `--clock` 6.27 and 8.83.

*Why the hues stay.* The tokens header claims this is the same house design language rather than an imitation
of it. Retuning the hues breaks that claim, and they pass anyway.

*What this does change.* D-019 records that NuAnchor's exact token names and values are in `css/tokens.css`.
That stops being true for the neutrals. The hues stay NuAnchor's, which is why the same-house claim survives.
D-019's own reversal condition is Nishant asking for a live integration or a design direction of his own, so
this does not fire it.

**U-96. The neutral values, and all four declaration copies move together.**
Light `--faint` moves from `#6B798B`, measured 4.44:1 on `--surface` and 4.05:1 on `--surface-2` and used at
36 sites mostly at 11px, to about `#5F6D80`, measured 5.27 and 4.81. Dark `--faint` `#7E8B9E` measures 5.03:1
and does not change. `--line-soft` moves from `#EDF1F7` light and `#1B2436` dark, measured 1.13:1 and 1.12:1,
to about `#E0E6EF` light and `#26324B` dark, measured 1.26 and 1.36.

*The trap.* `tokens.css` declares the palette four times, so each token appears in four places. `--faint` at
lines 37, 145, 182 and 218. `--line-soft` at 39, 147, 184 and 220. All four copies have to move together or
the explicit theme toggle keeps the failing value.

*Why `--line-soft` matters more than its contrast ratio suggests.* At 1.13:1 it is not a visible divider at
all, and it is the row rule on twenty funnel rows. Density does not work without it.

**U-97. Three new semantic tokens, and zero raw hex outside `tokens.css`.**
Add `--good-line`, because `.chip.is-good` is the only chip that borders with the full-strength hue where
every other chip uses a `-line` token. Add `--on-accent` and `--on-accent-ink` to retire the six raw hex
values in `app.css`: `#fff` at lines 144, 314 and 319, and `#0B111E` at 149, 317 and 321.

*Scope boundary, which is the part that stops a rebuild becoming a repaint.* No hues change. No scale steps
change.

**U-98. Colour plus a distinct glyph for the four actor types, never colour alone.**
Four silhouettes, one per actor type, legible at 10px, rendered through the existing `icon(paths, size)`
helper in `js/motion.js` so the glyph inherits the owner hue with no extra rule. They replace the 6px
`.chip .dot`. No emoji, and the helper makes emoji structurally hard.

*Why this is a correctness fix and not a preference.* Reduced to luminance the hues collapse. In dark theme
`--accent` against `--system` is **1.000**, exactly identical, and that pair is a named human against
deterministic software, which is the one distinction the NYC and California rules turn on.

*Why not glyph alone.* It discards a hue system the tokens file calls the analysis itself. Position and
typography were also refused because they do not fit: `.step::before` is a 3px rail and `.chip .dot` is a 6px
dot.

**U-99. One density everywhere, targeting 36 to 40px rows.**
Four specific changes in `app.css`, with no new scale step, because the space scale already reaches `--s1` at
4px on a 4px rem grid. `.step` and `.qitem` block padding from `--s3` to `--s2`. `table.t th` and `table.t td`
from `--s3 --s4` to `--s2 --s3`. `.card-bd` from `--s5` to `--s4`. And `.step-name .s` moves into the expand
rather than holding a permanent second line.

*Why the target is a number.* `.step` is currently about a 62px row. Twenty of those plus stage headers
exceeds 1240px, so the merged funnel cannot be one view, and U-40 only reads as an argument if the whole
distribution is visible at once.

*Dependency.* This only works alongside U-96's `--line-soft` fix. Density without a visible rule is a wall.

*Why not two densities, and why not a user control.* A two-density split puts the densest surfaces in the
comfortable half. A user control doubles the states to verify.

**U-100. Inter and Geist Mono confirmed. Tabular figures hoisted to `body`, with prose opted out.
`--t-num` comes down from 1.75rem.**

*Why hoist rather than opt in.* At this density every number sits in a column, and eleven opt-in sites means
the twelfth is the one that jitters. Prose has to opt out, or body copy gets tabular figures too.

*Why `--t-num` drops.* A 28px `.metric-val` is a hero number inside what U-05 specifies as a thin strip. The
deciding agent set no replacement value, so that one is still to pick.

**U-101. Colour plus an explicit numeric value for every tone.**
No element carries `is-warn` or `is-crit` without a sibling number saying how warm or how critical.

**U-102. Work bars are solid `var(--owner)`. Wait bars are hatched, at 45 degrees on a fixed 6px pitch.**

*Why hatching rather than a tint.* The fill is set from `var(--owner)`, so a tint puts `--system-line`
`#D5DEEA` beside `--system` `#52627A`, and where two bars overlap one bar's tinted wait and another's solid
work land at similar luminance and read as one shape. U-21 puts twenty overlapping time bars on the candidate
page, so overlap is the test. Hatching survives overlap, greyscale, print and any colour vision.

*Why not a boundary marker.* Four minutes of work inside a five-day wait puts the marker flush against the
left cap, which is most deterministic steps.

*The gradient ban is narrowed, not reversed, and the deciding agent asked in terms for this to be recorded.*
`demo/README.md` line 231 bans gradients. That ban is about decorative gradients, meaning the purple-to-blue
wash a verification pass previously confirmed at zero. A `repeating-linear-gradient` carrying a data
distinction is permitted. There is precedent already: `.scroll-edge` uses `linear-gradient` as a functional
mask and is the only gradient in the CSS today. This is written down so the next verification pass does not
read a gradient count above zero as a reversal and strip the hatch, taking U-21's overlap encoding with it.

*A convention this extends.* `.sim-note` uses `1px dashed var(--line)`, so a non-solid treatment already means
not the real thing in this build.

**U-103. Elevation is reserved for things that genuinely float, and the glass saturation comes down.**
`box-shadow` survives in four places: the sheet, the drawer, the assistant panel and `:focus-visible`, plus
the `@supports color-mix` hairline that stands in for a border. Everything else, `.card` and every hover
included, separates with `--line` and a `--surface-2` step. There are 13 `box-shadow` declarations and 9
`--glass-*` uses in `app.css` today.

*The blur.* Keep `blur(20px)` on the topbar and sidebar, where it signals content passing behind. Drop
`saturate(180%)` to about 115%, because the saturation boost is the part that reads as glassmorphism rather
than as depth. The value is `tokens.css` line 120. Line 251 already sets `--glass-blur: none` under
`prefers-reduced-transparency` and stays as it is.

*Why this one rule earns its place.* It removes drop shadows on everything and glassmorphism's main crutch
together.

**U-104. Anti-AI rule 1. Every colour is traceable to a nameable meaning, and there is zero raw hex outside
`tokens.css`.**
A hue applied for emphasis, section-keying or visual interest fails the rule. The check: every colour token
use sits on a class encoding an owner (`own-*`), a tone (`is-good`, `is-warn`, `is-crit`) or an interaction
state, and `grep -c '#[0-9A-Fa-f]\{3,6\}' css/app.css` returns 0. It currently returns 6.

**U-105. Anti-AI rule 2. No two adjacent blocks share dimensions unless the data makes them share.**
This is the anti-card-grid rule stated so a builder can check it. `.stats` is the pattern to follow rather
than the exception: four numbers in one bordered strip, with the comment already in `app.css` reading "Same
information, one border instead of four".

*The audit target.* The seven `.grid.c2/c3/c4` declarations in `app.css`, three base rules at lines 387 to 389
and four responsive overrides at 944, 951, 958 and 967. A uniform card grid is the single most recognisable
AI-generated layout and the build currently has seven of them.

*Where it is free.* On the funnel page U-40 enforces this by itself, because rows sized by median duration
cannot be equal height.

**U-106. Borrow the operations-console conventions that are about information. Reject enterprise HR SaaS, and
reject the ops-console tells too.**
Taken: the density, the tabular numerals, the status-forward rows, the minimal chrome.

*Why reject HR SaaS.* Fountain and Paradox are the category's visual default, so resembling them reads as the
cheaper version of them. Their conventions are also volume-shaped and conversion-funnel-shaped, while U-40
explicitly refuses a volume-shaped funnel. Wearing the visual language of a volume story while showing a
duration story is a mismatch a buyer feels without naming.

*Refused ops-console tells, named because a design tool returns exactly these when asked.* Orbitron and
JetBrains Mono, a `text-shadow: 0 0 10px` glow, dark-only, and `#22C55E` status green. Terminal cosplay, and
the light theme is the one a retailer's counsel reads. The green is off-palette and already banned by the
no-decorative-green line in `demo/README.md`.

*A fifth refusal.* The genuine ops convention of using colour decoratively for panel wayfinding. All four
owner hues and three tone steps are spoken for, there is no spare colour, and that constraint is an asset.

**U-107. Keep the non-menu variable font weights already in use: 450, 550, 560, 580, 620 and 640.**

*Why.* A variable axis set at non-menu values reads as drawn rather than picked, which serves the anti-AI
rules. This forbids a tidy-up pass that snaps them to 400, 500, 600 and 700. The file also uses 500, 600 and
700 in places, so the rule is to leave the odd values alone rather than to avoid menu values.

**U-108. The assistant becomes a `.shell` grid column. It stops being a floating overlay.**
This is neither a tokens change nor a CSS-only change. It is structural.

*Why it is required rather than preferred.* U-09 makes the assistant a summoned sidebar that takes width. It
is currently `position: fixed` with `transform-origin` set to its trigger. `.content` already declares
`container-type: inline-size` with `container-name: pane` and three `@container pane` breakpoints at 62rem,
46rem and 32rem. If the assistant becomes a grid column, every page holds at the narrower width with no new
breakpoints. If it stays an overlay the container never narrows, the container queries never fire, and U-09 is
unmet on all ten pages.

### NINE DEFECTS FIXED 7 September. Suite green at baseline throughout.

| # | Defect | Fix |
|---|---|---|
| 1 | Childcare scored as a concern in 8 requisitions | Removed from `seed.js` |
| 2 | The same phrase live in **34 of 41 screening records**, which my first fix missed | Stripped, full recursive sweep now returns zero |
| 3 | Availability question wrong for **7 of 8** requisitions, spoken aloud | Generated per requisition from its own `requiredSlots` |
| 4 | Physical question had **no accommodation clause**, spoken aloud, ADA exposure | Rephrased as an essential job function with the clause built in |
| 5 | Criteria and questions misaligned on 3 requisitions | Reconciled, zero mismatches |
| 6 | **Six approvals recorded 12 to 16 hours before screening completed**, producing negative store medians | `decideAt` now follows the actual last screening event rather than a fixed offset. All five store medians positive |
| 7 | `exceptions.storeId` null on runtime raises | Shared `storeOf` helper, applied in `raiseException` and `workflowEvent` |
| 8 | `storeView.shifts` returned zero rows for every store, permanently | Window filter removed |
| 9 | `byDest.live` read as a live listing on job boards we have no integration with | Renamed `accepted`, `connected: false` explicit per row |

Plus two cosmetic ones: the stage-change confirmation could render "to UNDEFINED", now guarded; and all eight
requisitions shared one `openedAt`, now spread deterministically.

**Two corrections to my own work, recorded because they matter more than the fixes.** I claimed the childcare
fix was verified complete when it had missed 34 records; the claim was withdrawn and the fix redone. And my
`storeId` fix initially landed in `workflowEvent` rather than `raiseException`, because a pattern matched an
earlier occurrence. Both were caught by checking rather than by assuming, and the first was caught by an agent
rather than by me.

---

## PROCESS CHANGE, 7 September 2026

**P-01. Options are evaluated by an independent agent, not by Suniras choosing from my recommendation.**
Suniras: have a separate agent evaluate all the options and choose the best one, for impartiality, and do not
give that agent my recommendation.

*How this is applied.* I generate the options with their real tradeoffs. The options go to a separate agent
**with no recommendation attached and no indication of which I favour**. That agent's choice is the decision and
it is recorded as such. Applies to remaining page-structure decisions and to every visual and design decision.

*What this changes about this file.* Entries from here on record the deciding agent's reasoning rather than
Suniras's words. Earlier entries record his own choices and stay as they are.

**P-02. Visual design constraints.**
Suniras: nothing that looks like AI. A sophisticated look for each page. Competitor styling may be used as a
reference for the look of a page. **The design language stays NuPlay colours.**

*Consequence.* Competitor work is a reference for styling only. Palette, type and the design language remain
NuPlay's. This is also a constraint on the independent agent's brief rather than a preference it may weigh away.

---

## DEFECT FOUND 7 September: family status is scored as a negative

**Not a design decision. A live discrimination exposure in the seeded data.**

Every one of the eight requisitions carries `"depends on childcare"` in the `concernPhrases` of its
availability question. A candidate who answers the availability question by mentioning childcare is scored
**down** for it.

*Why this is serious rather than untidy.* Family status and childcare responsibility are protected
characteristics in US employment. Scoring on them is the exposure that the whole human-only decision structure
exists to avoid, and it sits underneath a score a manager is being asked to approve on. The screening prompt
brief Suniras supplied names it explicitly: childcare and family status are on the flat ban list, and the rule
is that if an applicant volunteers one, the agent acknowledges once, neutrally, and **never records it**.

*Why it matters for 20 September specifically.* The demo has a live candidate answering a live availability
question. If they mention childcare, the product marks them down on stage.

*The fix is small.* Remove the phrase from all eight requisitions. Availability can be assessed on the hours
offered without recording the reason they are unavailable. The three other flagged phrases scanned are
legitimate: "find a manager" is a positive customer-service phrase, and the food handler card question is a
genuine occupational requirement.

*Classification.* **P0, demo blocker.** A data fix rather than an engine change.

### FIXED 7 September 2026

**CORRECTED 7 September, later the same day.** The first fix reached `seed.js` and all eight requisitions and
**missed 34 of 41 screening records**, which snapshot the question bank at the moment they are created. The
claim logged here that "zero occurrences remain in any scored phrase bank" was false for live state and is
withdrawn. Found by an independent agent probing the data, not by me.

*Why scoring was not actually affected, which is luck rather than design.* `rubric()` re-reads
`requisition.screeningQuestions` at screening.js lines 231, 234, 263 and 274, so the stale copy never fed a
score. But `runConversation` reads `screening.questions` at line 43, so the phrase was live in 34 stored
records and would have been read by anything using the screening's own question list.

*Now actually fixed.* 34 occurrences stripped across 34 rows. A full recursive sweep of `state.json` returns
zero instances of the phrase anywhere. Suite re-run green at baseline.

**Two seeded answers still contain the words, and that is correct.** Shantel Ruiz and Casey Mbeki both answer
"I can only do weekdays really. I cannot do weekends because of childcare and no evenings after six." Their own
words stay in the transcript. Editing what a person said would be falsifying a record, and the rule was never
that a candidate may not say it. The rule is that the agent must not ask and the system must not score it.

**No evaluation moved, which is the ideal outcome.** Both answers also contain "only weekdays", "cannot do
weekends" and "no evenings", all legitimate availability concerns. Casey's availability verdict is still
`not_met` and the recommendation is still `review`, now resting entirely on the hours offered rather than
partly on the reason. Verified after the change.

Full suite green at baseline: server 62/62, end to end 2/2, training 133/133, held out 32/32, safety 57/57.

---

## BUILD LOG 8 September. The spine is up.

Recorded here rather than in a separate plan, because a build record is a record.

**The candidate side of the spine runs end to end against the real engine.** A job browsed on the careers
page leads to a form, the form creates a real candidate and a real application, and the existing workflow
engine carries it to `SCREENING_PENDING` on its own auto edge. Verified through the HTTP API, not only in
tests: `app_0037` was created from a POST and arrived at Screening queued with eligibility passed.

**Four new modules, each with one job.**

`js/slots.js` is the canonical availability table, thirteen keys with a label map, read by the server, the
browser and the tests. U-89. `seed.js` now reads it instead of declaring its own day and part names, and a
test fails if any module under `server/lib` declares a second copy. An unknown slot key is now dropped rather
than rendered raw, which it was until today, so a typo could reach a live candidate's ear.

`server/lib/public.js` is the candidate-facing projection. U-85. It is an allowlist rather than a set of
deletions, and `assertClean` walks every payload on the way out and throws if a banned field name appears at
any depth. A raw requisition row cannot survive it. Verified: the careers and apply payloads contain no
scoring vocabulary and no candidate name.

`server/lib/intake.js` is the only thing in the build that creates an application. U-90. It writes the two
rows at `APPLICATION_RECEIVED` and calls `settle()`, so an application from the careers page takes exactly the
same twenty steps as the thirty-six that were seeded. No new transition. It refuses to write an `answers` map
onto a live applicant, with a thrown error rather than a comment, which is U-94.

`server/lib/livecall.js` owns U-34's seven stages. It is **not** a second workflow engine and says so in its
header: the 27-state machine is untouched and step 3 still has three application states. Illegal moves are
refused with a reason and an audit entry, every stage writes a `workflowEvent` so the timeline and the metrics
see the call, and every stage is stamped with the transport that actually ran.

**On the transport, which is the honesty question.** B-08 makes the voice call real and agentX the transport.
No credentials exist yet, so `transportMode()` resolves to `simulated` and every stage carries that stamp
permanently. This follows `llm.js` exactly: with a key it is a model, without one it prints that no model ran.
When credentials arrive the mode flips to `live` with no interface change and no rewrite. Nothing in the build
can label a simulated call live.

**Two things the live payload deliberately does not carry.** No transcript while the call is running, because
U-34 says the transcript only appears if the provider genuinely streams one and ours does not. And the
sequence includes the stages not yet reached, so a live call says what it is waiting for rather than showing
an empty row.

**The rehire withholding path is now exercised for the first time.** The `partial` branch of
`matchPriorEmployment` had never run, because all three seeded records match exactly. Applying with a known
name and date of birth and a different phone number now holds the application at `ELIGIBILITY_REVIEW` for a
person and tells the applicant only that their application is with the hiring team. The payload contains no
mention of a prior record and no name from the records table. U-91 and U-93, verified rather than asserted.

**A candidate is now told which rule failed, and every rule that failed.** One sentence per rule, written in
this build rather than derived from the rule's own basis, which is written for the store. Three of the four
are things the applicant just typed, so stating them discloses nothing. `rehire_eligibility` is absent from
that map on purpose.

**Suite: server 90 of 90, end to end 2 of 2, training 133, held out 32, safety 57.** The server suite went
from 62 to 90. Twenty-eight new tests across `fairness.test.js` and `intake.test.js`, both wired into
`tools/test.sh`.

**Still to build, in order.** The careers page and apply form interfaces, which is the browser half of what
went in today. The visual language, U-96 to U-108, including the assistant becoming a grid column. The
sources and store page restatements. The ten pages against their entries. The three missing tools and the new
safety case from U-48. Dara Simmons moved to a Ridgeway requisition, B-29. The screening agent prompt and the
Mozart workflow.

**Two inputs owed from elsewhere, both with external lead time.** agentX credentials and a workspace id,
without which the prompt and the workflow can be written as files but cannot be landed on the platform. And
the hosting target, because the brief rules out a laptop and the provider has to be able to push a
disposition, a transcript and a PCA result back to a reachable address.

---

## SAFETY FIXES 8 September. Two of the nine fixes of 7 September were half-done.

Found by an independent sweep of the repository against this log, not by me. Both were reintroductions of a
defect this file had already classified P0, and in both cases the 7 September fix changed the question and left
the thing that scores the answer alone.

**S-01. The physical question invited an accommodation disclosure and the scorer marked it down. ADA.**
Fix 4 rephrased the question to "Can you perform those duties, with or without reasonable accommodation?" and
left the concern phrases as `['not sure', 'my back', 'maybe not', 'i would struggle']`. A single hit forces
`not_met` and forces the whole recommendation to `review`, quoting the disclosure on screen as the evidence for
the downgrade. So the product asked a candidate to raise an accommodation need and then scored them down for
raising it.

*Why it was invisible.* Zero of the thirty stored evaluations carry a physical concern, and no seeded answer
contains the words. It would have fired first on a live candidate on 20 September.

*The fix.* The criterion is now scored on one thing: whether the person affirms they can perform the essential
duties. A concern fires only on an unambiguous statement that they cannot, and never on the reason. An unclear
answer scores `partly_met` and goes to a person, which is what the accommodation conversation is. `'i can'`
was also removed as a positive phrase, because `rubric()` matches by substring and it matched inside
`'i cannot'`.

*Verified.* The seeded difficult answer now scores `partly_met` with no concern raised and nothing quoted as
adverse evidence. "Yes but I would need a stool for part of the shift" also raises no concern. A plain refusal
to perform the duty still scores `not_met`.

**S-02. The availability question was per requisition and the phrase bank that scores it was global.**
Fix 3 generated the question text from each requisition's own `requiredSlots` and left one shared bank of
weekend and evening phrases behind it. The consequence was measurable and went both ways.

*Scored too well.* Eleven of thirty evaluations scored `availability_fit` as `met` on a requisition needing no
weekend and no evening, because the answer said "weekends work". On the Overnight Stocker, which runs Monday,
Tuesday and Thursday overnights, an answer of "Weekends work fine for me, evenings especially" scored `met`
against a question asking about overnights.

*Scored too harshly, which is the worse half.* An answer of "I can only do weekdays" hit the global concern
phrase `'only weekdays'` and was forced to `not_met` on that same overnight job. The candidate was marked down
for declining shifts the role never required.

*The fix.* The phrase bank is generated from `requiredSlots` alongside the text. A phrase only enters the bank
if the requisition actually needs that part of the week, so no requisition can score an answer about hours it
does not want. Weekend and weekday language enters only when that half of the week is genuinely required.
Nothing in the bank records the reason a person is unavailable, which is the rule that removed childcare from
this list on 7 September.

*Verified.* All 17 remaining `met` verdicts are supported by two or more phrases from that requisition's own
bank, and none uses weekend language on a role with no weekend slot. The Cashier, which genuinely needs weekend
evenings, still records its concern on legitimate grounds and not on childcare.

**S-03. The defective sentence survived as a default value.**
`Q.availability.text` still held the P0 sentence, "The role needs weekend evenings and one early opening a
week", byte identical to the one this file classified P0. Any requisition built without the override got it
straight back, and U-90 makes requisitions creatable at runtime rather than only in the seed.

*The fix.* There is no default. `availabilityQuestion(slots)` builds the whole question, and a requisition with
no slots asks "What days and times are you able to work?" and scores nothing, because there is no shift
pattern to score against. `slotPhrase([])` returns null rather than rendering "The role needs , plus
undefined." Both `slotPhrase` and `availabilityQuestion` are now exported, so the careers page and the apply
form describe the same hours from the same function, which is what U-89 requires.

**S-04. Defects 10 and 11, the two browser regressions, are fixed.**
The outbound table now heads its column "Accepted", reads the field that exists, and marks every row not
connected, because `accepted` counts simulated calls rather than live listings. The shifts tile and card now
count what is actually ahead of the present instead of claiming a seven-day window the payload no longer has,
and each row says which side of the present it is on.

**A new test suite exists so this cannot happen a third time.**
`server/test/fairness.test.js`, nine tests, wired into `tools/test.sh`. Every one asserts a property of the
data rather than a line of code, so moving the problem does not pass. It checks that no scored phrase anywhere
matches a protected characteristic, that no stored screening carries a stale copy of its requisition's bank,
that availability is only scored against hours the role needs, that the physical question keeps its
accommodation clause and scores only inability to perform, that no positive phrase is a substring of a concern
phrase, and that there is no default availability question to fall back to.

*Mutation checked.* Putting childcare back fails one test. Putting the impairment phrases back fails three.
Making the availability bank global again fails four.

**New suite baseline: server 71 of 71, end to end 2 of 2, training 133, held out 32, safety 57.**

---

## Locked before this file started

Carried from the decision register and the three locked decisions of 6 September, so nothing here reopens them.

**Metrics.** Time to hire, number of people involved, manual work. Not 90-day retention as the primary product
metric. Computed from the event log where possible.

**Architecture.** The zero-dependency rule is retired as a platform requirement. Infrastructure stays
proportionate to a demo. One workflow engine, never two.

**Deadline.** 20 September. Demo track takes priority over platform completeness.

**Product boundary.** US retail and JustDial stay separate products. Shared primitives are fine, shared UX is
not required. No airline or India concepts enter retail.

**Safety and honesty, none of it reopenable here.** Human hiring decisions stay human. AI never directly
approves or rejects. No model on eligibility. No invented criteria. No chain of thought stored. A deterministic
fallback is never represented as a model. External checks are ordered and tracked, never performed by us, unless
Suniras explicitly chooses a genuine integration. A simulated integration is always visibly simulated. Tenant
data stays isolated. All twenty funnel steps stay represented.
