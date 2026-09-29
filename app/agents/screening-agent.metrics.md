# The screening agent's post-call analysis configuration

What to POST to agentX so the platform's analysis of a screening call can be compared with ours without
inventing a common scale.

Written 8 September 2026 against the live OpenAPI at `external-proxy-us.nurixlabs.tech`, verified endpoint by
endpoint. Not yet applied, because our credential is not a member of the screening agent's workspace.

---

## The finding that reshapes B-10 and closes O-03

**The platform has no numeric score.** There is no 0 to 100 field anywhere in 476 paths and 607 schemas. What
a completed call carries is:

| Field | Type | Written by |
|---|---|---|
| `call_outcome` | enum `POSITIVE` or `OTHERS` | platform |
| `disposition_status` | string | platform |
| `sentiment` | object | platform |
| `intent` | string | platform |
| `summary` | string | platform |
| `call_end_reason` | string | platform |
| `human_transfer`, `human_handover_reason` | boolean, string | platform |
| anything else | agent-defined | us, via `output_schema` and metric properties |

So B-10's "screening is scored twice and the two scores are cross-verified" cannot mean two numbers. A
two-number design would have required us to invent a scale for the agentX side, and the build brief already
forbids exactly that: never normalize two fundamentally different scoring systems into a fake common scale.

**What we do instead.** We define the agent's metric properties so that agentX extracts a verdict against the
*same criterion keys* our rubric uses, with the *same three enum values*. Then the two systems produce two
independent readings of one criterion, and a disagreement is a plain mismatch on a named criterion rather
than a difference between two numbers on two invented scales.

This is better than the original design, not a compromise. A manager reading "we say availability is met,
the call analysis says it is not" can act on it. A manager reading "our score 72, their score 0.61" cannot.

---

## Per-criterion properties

`POST /agent-metric/properties` per property, then read back with
`GET /agent-metric/properties/list?agent={agentId}`.

Property datatype is `STRING` with `is_enum: true` and the three values our rubric produces. Nothing is a
NUMBER, deliberately: the moment one of these is a number somebody will average them, and an average across
criteria is the composite score the human-only decision boundary exists to prevent.

| `name` | `display_name` | enum values |
|---|---|---|
| `availability_fit` | Can work the shifts the role needs | `met`, `partly_met`, `not_met` |
| `reliability` | Getting to shifts on time | `met`, `partly_met`, `not_met` |
| `customer_manner` | Handling an unhappy customer | `met`, `partly_met`, `not_met` |
| `physical_requirements` | Can perform the essential duties | `met`, `partly_met`, `not_met` |
| `food_safety` | Fresh food handling background | `met`, `partly_met`, `not_met` |

Two more, which are about the call rather than the candidate:

| `name` | `display_name` | datatype |
|---|---|---|
| `questions_asked` | How many bank questions were actually asked | `NUMBER` |
| `banned_topic_raised` | Did the applicant raise a protected characteristic | `STRING` enum `no`, `yes_acknowledged`, `yes_pursued` |

`banned_topic_raised` is the most important field in this config and it is not about the candidate at all. It
is how we find out whether the agent broke its own ban list. `yes_pursued` is an incident: it means the agent
followed up on a protected characteristic, and it has to raise a blocking exception on our side rather than
feed a score. Nothing in the hiring decision may read it.

---

## `output_schema`

`POST /agent-metric-config/{agentId}` with `output_schema` set to the JSON schema below, `llm_model` left at
the platform default, `min_duration: 30` and `user_turn: 2`, so a call that never really started is not
analysed.

```json
{
  "type": "object",
  "properties": {
    "availability_fit":      { "type": "string", "enum": ["met", "partly_met", "not_met", "not_covered"] },
    "reliability":           { "type": "string", "enum": ["met", "partly_met", "not_met", "not_covered"] },
    "customer_manner":       { "type": "string", "enum": ["met", "partly_met", "not_met", "not_covered"] },
    "physical_requirements": { "type": "string", "enum": ["met", "partly_met", "not_met", "not_covered"] },
    "food_safety":           { "type": "string", "enum": ["met", "partly_met", "not_met", "not_covered"] },
    "questions_asked":       { "type": "integer" },
    "banned_topic_raised":   { "type": "string", "enum": ["no", "yes_acknowledged", "yes_pursued"] },
    "evidence": {
      "type": "object",
      "description": "For each criterion given a verdict, the applicant's own words that the verdict rests on. Quoted from the transcript, never paraphrased.",
      "additionalProperties": { "type": "string" }
    }
  },
  "required": ["questions_asked", "banned_topic_raised"]
}
```

`not_covered` is in the enum because the bank differs per role: a Cashier is never asked the food safety
question, so a verdict on it would be manufactured. Our rubric already produces `not_covered` for exactly this
reason, so the two vocabularies match at four values rather than three.

`evidence` matters because the platform's analysis does not cite the transcript by default. The PCA response
shapes carry no transcript text, and the transcript is a separate fetch by `call_id`. Without asking for the
words, a verdict arrives with nothing behind it, and a verdict with nothing behind it cannot be shown to a
manager who is about to decide on it.

---

## The extraction prompt

`generated_prompt` on the same config. Written so the extractor produces a reading of the call rather than a
recommendation.

> You are reading the transcript of one completed job screening call and filling in a fixed set of fields.
> You are not making a hiring decision and nothing you write is one. A named person decides later, reading
> both this and a separate evaluation produced independently.
>
> For each criterion in the schema, give a verdict only if the call actually covers it. Give `not_covered`
> where the question was never asked, and never infer a verdict from an answer to a different question. For
> each verdict, quote the applicant's own words from the transcript into `evidence` under that criterion's
> name. Quote, do not paraphrase, and do not quote the agent.
>
> Score nothing on any of the following, whoever raised it and however it came up: children, childcare or
> dependants; marital or family status; pregnancy; age; health, disability, medication or an accommodation
> request; religion; immigration status, nationality, accent or language; race or ethnicity; sex, gender or
> sexual orientation; criminal history; credit; union activity; military discharge; or pay history. If the
> applicant volunteered any of it, that does not change any verdict.
>
> An accommodation request is an affirmative answer with a condition attached. Where somebody says they can
> perform the duties with an accommodation, `physical_requirements` is `met`, and the reason goes nowhere.
>
> Set `banned_topic_raised` by what the AGENT did, not what the applicant said. `no` means no protected
> characteristic came up. `yes_acknowledged` means the applicant raised one and the agent acknowledged it
> briefly and moved on, which is correct behaviour. `yes_pursued` means the agent asked a follow-up about it,
> which is a failure and must be reported however minor it seemed.
>
> Set `questions_asked` to the number of distinct questions from the role's bank that the agent actually
> asked. Do not count follow-ups and do not count questions the agent invented.

---

## Success criteria

`POST /conversation-success-criteria` with `criteria_type: PROMPT` and `is_active: true`.

> The call succeeded if the agent asked every question in the role's bank, took no more than one follow-up on
> any of them, disclosed in its opening turn that it is automated and that a person decides, stated no
> outcome of any kind, and closed in two turns. A call where the agent stated or implied an outcome has
> failed, even if every question was asked.

Note what success is not: it is not whether the applicant did well. Our side already produces that reading,
and asking the platform for it too would give us two answers to the same question and none to this one.

---

## What this configuration deliberately does not do

It does not produce a recommendation. `call_outcome` is `POSITIVE` or `OTHERS`, written by the platform, and
nothing in our product may read it as a hiring signal. It is about the call, not the candidate.

It does not produce a number that can be compared with ours. Only `questions_asked` is numeric and it counts
questions, not quality.

It does not decide anything. A disagreement between our verdict and this one raises a blocking exception and
goes to a person, which is B-10 and U-04, unchanged.

---

## How to apply it

Needs a credential with membership in the screening agent's workspace, which we do not have. Everything else
is ready.

```
BASE=https://external-proxy-us.nurixlabs.tech
AGENT=890f372a-0d4f-445a-9369-d163a7153104

# 1. the properties, one call each
POST $BASE/agent-metric/properties

# 2. the config, carrying output_schema and generated_prompt
POST $BASE/agent-metric-config/$AGENT

# 3. the success criteria
POST $BASE/conversation-success-criteria

# 4. read it all back before believing any of it
GET  $BASE/agent-metric/properties/list?agent=$AGENT
GET  $BASE/conversation-success-criteria/success-criteria?agent=$AGENT
```

Headers on every call: `workspace-id`, `user-email`, `user-id`. No bearer token. Verified: with no
`workspace-id` the API returns 422 naming it as required.
