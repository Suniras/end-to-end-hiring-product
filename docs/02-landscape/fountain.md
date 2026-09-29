---
AUTHOR: Claude
SOURCE: the teardown at 00-context/hiring platform/fountain/, plus its comparison and synthesis docs
DATE: 10 Aug 2026
---

# Fountain

## How much to trust this

The teardown is far better sourced than anything web search produced. It reassembled 1,962 files from
Fountain's own production source maps, which were shipping unauthenticated on every chunk checked. So claims
about what Fountain has *built* are strong.

Three limits that matter:

- **Nobody logged in.** No authenticated session, no wire observed. Everything about how the product
  *behaves* is inferred from what it ships, not from watching it run.
- **No browser was available.** Zero features were walked. Every "where does this live" claim is
  reconstructed from static files.
- **Every user-complaint claim is capped at tentative.** Fountain has no public issue tracker, roadmap,
  forum or feedback board. So "customers complain about X" cannot be raised above tentative from this
  corpus, and web review sites turned out to be contaminated when I tried them separately.

The run scored itself 82.5 out of 100 and, in its third iteration, retired four of its own over-claims and
revised its own coverage number downward. That behaviour is a reason to trust it more, not less.

---

## What Fountain actually is

**Not an ATS.** That is the single most important correction for this project.

Fountain publishes 575 endpoints across 14 prefixes. The legacy Hire applicant tracking system is 108 of
them, under a quarter. The twelve post-hire Worker Experience services carry roughly 467. One service,
`serviceattendance`, is 81 endpoints on its own, three quarters the size of the entire ATS API.

Its own internal navigation names about twenty top-level products: Cue, Talent Agents, Home, Hire, Hire Go,
Source, Onboard, I-9 Center, Compliance, Communicate, Pool, Pulse, Referrals, Shift, Assist, Pay, Support,
Learn, Reach.

**So a v1 scoped as applicant tracking will be compared against the wrong thing and lose on the right
thing.** Fountain is a suite whose post-hire half is four times its hiring half, built over twelve years.

Founded 2014. Legal entity is OnboardIQ, Inc., and the old name is still load-bearing in production. Roughly
$219M raised, per third-party aggregators at medium confidence.

---

## Three weaknesses that hold up

These replace the three I had in the meeting pack, which came from web research and were weaker. See the
corrections section below.

### 1. They published the category's trust problem in their own name, then failed to answer it

Fountain commissioned and published a survey of 1,014 US frontline workers in June 2026. It found **62% of
applicants report being ghosted**, with **unexplained AI screening rejections** among the top complaints.

Against that, their dedicated ethical-AI page names **zero** compliance frameworks, zero methodology, zero
audit cadence, and no third-party bias auditor. Their stated mitigations, explainable scoring and opt-in
human review, have **no corresponding endpoint** in 575 published paths, 766 application paths, or 127 live
agent tools.

This is the strongest available criticism of Fountain because every part of it is their own material. You are
not asserting they have a trust problem. You are quoting their survey and then noting the absence.

### 2. No certified integration with the systems retailers actually run on

Their marketing names ADP, Workday, UKG and SAP. Their documentation covers HRIS synchronisation as a
**two-paragraph do-it-yourself webhook pattern**, with no named or certified connector anywhere in a
593-page documentation index. The teardown struck the word "certified" from its own findings for lack of any
evidence.

For retail this matters more than it sounds. The applicant tracking system is the system of record, and
"build your own webhook" is not an answer a retailer's IT function accepts.

By contrast the integrations that *are* solidly evidenced are operational rather than HR: job distribution,
scheduling, e-signature, background checks, employment verification, telephony, learning, analytics.

### 3. Gartner placed them in the lowest quadrant

The 2026 Magic Quadrant inclusion that gets promoted heavily is a **Niche Player** placement. First-ever
inclusion, lowest of the four quadrants.

Worth noting because CLAUDE.md currently says "recognised in the 2026 Gartner MQ" without saying where in
it, and Nishant may have the same impression.

---

## Other findings worth having

**Their AI is real, and the model vendor is disclosed nowhere a customer can see.** A single unauthenticated
fetch of a separately-deployed micro-frontend surfaced a model-selection configuration naming Claude Opus and
Sonnet through AWS Bedrock, inside a provider list whose default is OpenAI. Around it sits a governance audit
log built specifically for AI-made changes, and a draft, test, then human-publish lifecycle.

Two things follow. The plumbing describes human approval, not the autonomy the marketing claims. And for a
category making automated decisions about employment, naming no model vendor on any marketing, security,
ethical-AI or trust page is a governance gap sitting in the open.

**Their real customer base is much larger and differently shaped than their logo wall.** Fifteen customers
are named publicly. Certificate transparency logs surface 144 subdomains with paired sandbox twins, including
Amazon, DoorDash, Staples, BrandSafway, OnTrac and CeraCare, none of which appear on the site. Any competitive
map built from their marketing understates where they are installed.

**Security posture findings.** Their content security policy is report-only rather than enforcing. The leaked
source maps exposed internal ticket identifiers, named enterprise tenants, and a source comment stating that
one dashboard is only used for sales demonstrations and is not the dashboard customers use. Two live agent
tool servers, 133 tools between them, answer anonymous requests and are documented nowhere in 593 reference
pages.

**Four marketed modules had no routes in the application that was mapped.** Shift, Onboard, Pulse and
Compliance, roughly 197 endpoints, appear to live in a second application. So "Frontline OS" ships as at
least two products.

---

## What this means for us

**Do not compete on breadth.** Nineteen or more microservice families spanning hire through retain, built
over twelve years. Five or six products each with its own state machine.

**Do not compete on their advertising engine.** A 52-path sourcing spend surface with budget recommendations,
channel statistics and historical conversion tracking across a claimed 91 million applicants. The software is
tractable; the accumulated conversion data is not. This independently supports D-009, our decision to drop
attract.

**Their integration weakness is the opening, not their AI.** Fountain has the deeper product and the better
developer portal and no certified connector to the systems of record. That is a gap engineering effort can
close, but certification takes multiple quarters and cannot be compressed.

**Their audit log concept is worth understanding but not copying as a differentiator.** They ship a
governance trail for AI-made changes and have pointed it inward. Per D-011 a pattern any competitor can copy
is not an advantage. What is interesting is that they built it and did not turn it outward.

---

## Corrections to what I told you earlier

Three claims I put in the meeting pack came from web research and do not survive contact with this teardown.
All three are now withdrawn or downgraded.

| What I said | Status now |
|---|---|
| Fountain resells its AI Recruiter from another company, with that vendor's liability capped | **Withdrawn.** Not supported by the teardown, which finds Cue's own shipped model configuration and a 2023 acquisition of a conversational AI company. Do not say this. |
| The workflow engine is strictly linear and per-opening, with customers asking for parallel stages since 2018 | **Downgraded to tentative.** Came from review sites. Fountain is community-dark, so every user-pain claim from that route is capped at tentative, and my review search returned results contaminated with another product. |
| Billing meters applicants, hires and locations with a 10% overage and guaranteed 5% renewal increases | **Downgraded to tentative.** The teardown verified zero published pricing across six or more locations. This may be true from a contract, but it is not publicly verifiable and should not be stated as fact. |
