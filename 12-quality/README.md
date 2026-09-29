# 12-quality: testing, plus what an AI hiring product specifically needs

Phase S5. Normal software testing applies, and then there is a second layer that exists because this is
AI making decisions about people's jobs.

## An eval harness

A fixed set of example conversations with known correct outcomes, run automatically on every change, so
you can see quality move. A good demo is not evidence. A demo is one conversation that went well,
chosen after the fact.

## Adverse impact testing

Adverse impact means the tool rejecting one group of people at a much higher rate than another. Testing
for this across protected groups is a legal obligation in several US places, not a fairness extra.

Build it in from the start. Do not schedule it for just before launch, because if you find a problem
then, the choice is delay the launch or ship something indefensible.

## Adversarial testing

Candidates who try to game it, who lie, who go off script, or who feed it instructions. Assume someone
will post a guide to beating your screening agent, because for anything widely used, someone does.

## Real-world conditions

Bad phone lines, noise on a shop floor, a range of accents, people switching languages mid-sentence,
cheap phones, and Spanish-speaking candidates. A model that performs well in a quiet room with a
standard accent is not tested.

## Human handover

Does escalation actually fire when it should? Test it, rather than assuming the code path works.

## Regression when the model changes

When the underlying model updates, quality shifts, sometimes in ways nobody predicted. You want to know
before the customer does, which means re-running the eval harness on every model change.

## The gate

Do you have a number for agent quality that you actually trust, and does it hold up under stress?
