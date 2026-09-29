# Questions for Nishant, 10 Aug 2026

Ordered by how much the answer changes what happens next. If the meeting runs short, the first four are the
ones that matter.

Each question says why it is being asked, so the answer can be recorded against something.

---

## The four that change the plan

### 1. If store managers say their constraint is payroll hours and not hiring speed, are we solving the wrong problem?

**Why this is first.** Today's research found that central talent acquisition and store managers describe
different problems. TA describes candidates being hired down the street before they could call. Store
managers describe not being given enough payroll hours to hire at all, and pay levels that make roles
unfillable. None of the store manager evidence complains about application speed.

Every vendor in this category sells speed. If speed is not the binding constraint at store level, the whole
category may be optimising a number nobody is short of.

**What I need from you.** Whether you have seen this pattern in Nurix's own conversations, and whether it
changes what you think we should be building. If it is true, it does not kill the project, but it moves where
the value would have to come from.

### 2. Is there a level between store manager and central TA that owns both volume and authority?

**Why.** This is the open question I owe you an answer on and cannot yet answer.

Aviation concentrates half its recruiting in twenty of two hundred stations, so a central team can own it.
US retail spreads volume roughly evenly across hundreds of stores. So a store manager has authority but
almost no volume, and central TA has volume but no authority over how a store actually hires. Nobody holds
both.

If a district or regional level holds both, that is our buyer and our pilot site. If no such level exists,
the product has to earn its place with someone who has authority and very little volume, which is a
materially harder design problem.

**What I need from you.** Whether you know how retailers structure field management, and whether Nurix has
any relationship at that level anywhere.

### 3. Can you get me five people who hire retail staff in the US and do not work at Nurix?

**Why.** This is the single biggest risk to the project and it has been open for two days with no date
against it.

Phase 1 is running on public evidence by choice, so it is not blocked. Phase 3 cannot run without these
conversations, and the gate is literally that the same specific pain is heard from five people outside
Nurix. Everything in the diagnosis carries an assumption label until then.

Note the specific problem this would solve: today's research found that the independent evidence base for
this question is close to empty. Every source with genuine retail frontline specificity turned out to be
vendor marketing, analyst opinion without market data, or single reviews. Desk research has a ceiling here
and we have nearly hit it.

**What I need from you.** Names, or a route to names, or a clear answer that there is no route so I can plan
around it deliberately rather than hope.

### 4. If NuAisle does not sell to big-box or mass retail, where does a hiring product sit?

**Why.** You confirmed NuAisle skips big-box and mass retail. High-volume frontline hiring concentrates in
exactly that segment.

So either this product sits outside NuAisle as its own line, or its target is mid-market retail with a few
hundred stores rather than a few thousand. Those are different products. A retailer with 400 stores has less
central recruiting capacity, no dedicated hiring team per region, and a store manager doing more of the work
personally.

**What I need from you.** Which of those two you intend, because Phase 4 and Phase 5 both inherit it.

---

## Scope and direction

### 5. Which team did you mean by "those teams" on attract, and is it at Nurix or at the customer?

**Why.** You said the advertising and publishing side belongs to other teams and enabling them is a
dimension we address. That adds a stakeholder we have not named.

At a retailer that function may sit under HR, under marketing, or be outsourced to an agency entirely. Those
are three different buyers with three different budgets and one of them is not an employee.

We have taken attract out of scope for v1, with reasons in the pack. This question is about the horizon
rather than v1.

### 6. Should re-engaging candidates already in the customer's system count as attract or as hire?

**Why.** It is the one piece of attract that survives our own test for dropping attract.

We dropped attract because we would have no data anyone else lacks. But candidates already sitting in the
customer's applicant tracking system are people we can reach without buying any advertising, using data that
is inside the flow rather than outside it. That is a genuine edge case in the decision.

Worth deciding deliberately rather than letting it drift in.

### 7. Is onboarding a bigger part of this than it looks?

**Why.** I initially treated onboarding and activation as thin single flows. On decomposition they are not.
Onboarding spans I-9 verification, tax forms, background clearance, training, system access and work permits
for 16 and 17 year olds, and it covers the point where an accepted offer either becomes a person at work or
evaporates.

If the largest leak in hourly hiring sits between offer and day one, onboarding is where the money is rather
than a small stage after the interesting part. I cannot yet prove that, because we have no funnel numbers we
trust.

### 8. Do we have a route to real hiring funnel numbers?

**Why.** The PRD needs baselines: interview no-show rate, application completion rate, day-one no-show rate,
90-day retention.

Desk research produced dozens of these figures and not one with a traceable source. They circulate on vendor
blogs citing each other. They are recorded in the repo as numbers we will not use.

Without real baselines we cannot say whether anything improved, which means we cannot write success metrics
that mean anything.

---

## Commercial and risk

### 9. How was Unifi actually won, and does that tell us how a retail deal gets won?

**Why.** Your own sales handover says it: agility, repeated conversations, follow-up, and most importantly an
internal champion. Not the product.

If that is how these deals get won, it changes what matters. It would mean the first retail deal depends on
finding a champion more than on shipping a feature, and that has consequences for how we spend the next
three months.

### 10. Is the TalentOS arrangement a template for how we go to market in retail?

**Why.** The Unifi contract is with TalentOS, who own the customer relationship and intend to resell.

If partner-led is the model, a retail product needs different things built than a direct product does. It is
also a risk worth naming: a partner who owns the customer also owns the learning.

### 11. What is our position on adverse impact measurement?

**Why.** Not asking for a compliance review, and I understand the sequencing argument for settling the
problem first.

But one thing from the archive is worth your attention now rather than later. Nurix's answer to Unifi's
evaluation on adverse impact analysis was "not directly." Adverse impact is the one measurement US regulators
actually care about, and it is the one not offered.

Today's research also found that enforcement is weaker than the statutes suggest, with few published audits
and one state repealing its duty before it took effect. So this is not urgent. It is the kind of thing that
becomes a requirement rather than a review item, and at Unifi it shaped the product rather than following it.

### 12. What does a NuAisle product normally cost and how long does it take to stand up?

**Why.** Only as a precedent. NuAnchor's whole competitive argument is that rivals take 12 to 24 months and
cost around $175K a year, but its own numbers appear in no document.

If products on the shelf have a standard commercial shape, a hiring product inherits it, and that constrains
what v1 can be.

---

## One thing to tell him rather than ask

The project's own premise is under challenge and it came from our own research rather than from outside. The
seasonal surge that CLAUDE.md names as a core driver has shrunk: NRF recorded 438,000 seasonal retail hires
in 2024 and forecast 265,000 to 365,000 for 2025, while holiday sales passed a trillion dollars for the first
time. Retailers did more volume with fewer temporary staff.

It is not a straight decline. It rose in 2023, fell in 2024, and is forecast lower for 2025. One more data
point decides whether it is a trend, and the 2026 forecast usually publishes in September or October.

Worth saying out loud so it is not discovered later.
