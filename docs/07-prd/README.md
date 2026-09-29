# 07-prd: the document engineering builds from

Phase 7. The output of the whole first half of this project.

## What it has to contain

**Scope, and non-goals right next to it.** The non-goals are as load-bearing as the scope, because
they are what stops the build sprawling.

**Requirements** specific enough that two engineers reading them would build the same thing.

**Success metrics with starting numbers and targets.** Business metrics, not feature metrics. A
feature metric describes the product: "screening call takes 3 to 5 minutes." A business metric
describes what changed for the customer: how long a role stays open, what a hire costs, how many
applicants finish the form, how many turn up to interview, how many turn up on day one, how many are
still there after 90 days. Without a starting number you cannot tell later whether anything improved.

**An instrumentation plan, written now.** Instrumentation means deciding what the software logs so you
can measure it later. Written now, not after launch, because "we'll add tracking later" means you never
find out whether it worked.

**A risk register including regulation.** US rules on AI in hiring are real and they change what gets
built, so they belong here and not in a legal review at the end. New York City requires a yearly bias
audit of automated hiring tools and telling candidates they are being used. Illinois has rules on AI
video interviews. The EEOC can act if a tool rejects one group at a much higher rate than another. The
ADA means you need a path that does not require voice. There is I-9 employment eligibility paperwork.
And seasonal retail hires 16 and 17 year olds, which brings separate child labour rules.

Several of those change the specification. Treat them as inputs.

## The gate

Could an engineer start on Monday? And would you know within 90 days whether it worked?
