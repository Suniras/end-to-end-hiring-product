# 08-architecture: does this survive contact with a real system

Phase S1, the first build phase. Feasibility confirmed, not assumed.

## What this phase produces

**Integration contracts.** Exactly how data moves between us and the customer's recruiting system,
field by field, including what happens when their system is down or returns something unexpected.

**A data model, and a decision about personal data.** Hiring data is sensitive. Candidate names, phone
numbers, recordings, and screening scores all carry obligations. Decide what we store, for how long,
and who can see it.

**Reuse decisions, made explicitly** against NuAnchor, NuPlay and NuStack. Written down as decisions
with reasons, not assumed because something already exists.

**A latency budget.** Latency means delay. Real-time voice has a hard ceiling: past roughly a second of
silence a conversation stops feeling like a conversation. Every component gets a share of that budget,
and the shares have to add up.

**A security and data location review.** Where data physically sits matters legally, and customers will
ask.

## The gate

Does someone senior in engineering agree this survives contact with a real recruiting system?
