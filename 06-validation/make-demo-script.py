#!/usr/bin/env python3
"""
Builds 06-validation/DEMO-SCRIPT.docx: the read-aloud script for the frontline
hiring demo.

Format follows the NuAnchor demo pack, which is the house standard: scene by
scene, with what to click, what to say word for word, and the one number to
land in each scene.

Run:  python3 06-validation/make-demo-script.py
Needs only python-docx, which is already installed.
"""

import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# NuAnchor palette, so the document matches the product it describes.
INK      = RGBColor(0x10, 0x18, 0x2B)
MUTED    = RGBColor(0x4B, 0x59, 0x6D)
FAINT    = RGBColor(0x6B, 0x79, 0x8B)
ACCENT   = RGBColor(0x24, 0x5A, 0xE2)
AGENT    = RGBColor(0x60, 0x29, 0xBC)
GOOD     = RGBColor(0x06, 0x71, 0x32)
CRIT     = RGBColor(0xA8, 0x1B, 0x2E)
WARN     = RGBColor(0x8C, 0x4A, 0x11)

SHADE_SAY   = "F4F0FE"   # agent soft
SHADE_DO    = "F1F5FA"   # surface 2
SHADE_LAND  = "EBF1FA"   # accent soft
SHADE_CRIT  = "FDEDEF"
SHADE_GOOD  = "EAF7EE"
SHADE_HEAD  = "10182B"


def shade(cell, hexcolor):
    tc = cell._tc.get_or_add_tcPr()
    el = OxmlElement("w:shd")
    el.set(qn("w:val"), "clear")
    el.set(qn("w:color"), "auto")
    el.set(qn("w:fill"), hexcolor)
    tc.append(el)


def no_borders(table):
    tbl = table._tbl
    pr = tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement("w:" + edge)
        e.set(qn("w:val"), "nil")
        borders.append(e)
    pr.append(borders)


def run(p, text, size=10.5, bold=False, italic=False, color=INK, font="Calibri", caps=False):
    r = p.add_run(text)
    r.bold = bold
    r.italic = italic
    r.font.size = Pt(size)
    r.font.color.rgb = color
    r.font.name = font
    if caps:
        r.font.all_caps = True
    return r


def para(doc, space_before=0, space_after=4, align=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    if align:
        p.alignment = align
    return p


def eyebrow(doc, text, color=FAINT, space_before=10):
    p = para(doc, space_before=space_before, space_after=2)
    r = run(p, text.upper(), size=8, bold=True, color=color)
    r.font.name = "Calibri"
    return p


def block(doc, label, body, shade_hex, label_color, body_size=11, body_bold=False, body_italic=False):
    """A one cell shaded panel with a small label above the body text."""
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    no_borders(t)
    c = t.cell(0, 0)
    shade(c, shade_hex)
    c.width = Inches(6.5)

    p0 = c.paragraphs[0]
    p0.paragraph_format.space_after = Pt(3)
    run(p0, label.upper(), size=8, bold=True, color=label_color)

    p1 = c.add_paragraph()
    p1.paragraph_format.space_after = Pt(2)
    run(p1, body, size=body_size, bold=body_bold, italic=body_italic, color=INK)

    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def kv_table(doc, rows, col_w=(1.5, 5.0)):
    t = doc.add_table(rows=0, cols=2)
    no_borders(t)
    for k, v in rows:
        cells = t.add_row().cells
        cells[0].width = Inches(col_w[0])
        cells[1].width = Inches(col_w[1])
        p = cells[0].paragraphs[0]
        p.paragraph_format.space_after = Pt(3)
        run(p, k.upper(), size=8, bold=True, color=FAINT)
        p2 = cells[1].paragraphs[0]
        p2.paragraph_format.space_after = Pt(3)
        run(p2, v, size=10, color=MUTED)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def bullets(doc, items, color=MUTED, size=10):
    for it in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(2)
        if isinstance(it, tuple):
            run(p, it[0], size=size, bold=True, color=INK)
            run(p, " " + it[1], size=size, color=color)
        else:
            run(p, it, size=size, color=color)


# ---------------------------------------------------------------- the scenes ---

SCENES = [
    dict(
        n="0", t="The overview page", secs=35, screen="index.html",
        land="Twenty steps, four owners",
        say=(
            "Before I open the product, this is the one line version. Twenty steps, from somebody "
            "applying to that same person still being on the shop floor at day ninety. The colour "
            "coding on this page is the whole idea, so it is worth thirty seconds. Purple is the AI "
            "agent. Blue is a person deciding. Grey is plain deterministic software with no judgement "
            "in it. Amber is a wait that nobody can compress, like a county court. Watch the chain in "
            "the middle of the page cycle once. Most of this product is not AI, and that is deliberate."
        ),
        do=(
            "Land on the overview page. Let the four node chain cycle once, all the way to the green "
            "step on the right. Do not scroll yet. Then click Open the demo."
        ),
        note=None,
    ),
    dict(
        n="1", t="Monday morning", secs=40, screen="Command deck",
        land="65 of 312",
        say=(
            "This is Dana. She runs hourly hiring across eighteen stores for a mid market grocery "
            "chain. It is Monday, just after seven, and over the weekend three hundred and twelve "
            "people applied. Two hundred and forty seven of them moved through without her touching "
            "anything. Sixty five need a person. And the product has already sorted those sixty five "
            "into four things to do, rather than sixty five items to read."
        ),
        do="Land on the deck. Let the four numbers count up before you say anything. Do not click yet.",
        note=(
            "Every row in that queue is either a judgement the agent refused to make, or a block the "
            "law requires. Nothing in it was decided by a model. Say that line if the room looks sceptical."
        ),
    ),
    dict(
        n="2", t="All twenty steps", secs=70, screen="Pipeline",
        land="20 steps, four owners",
        say=(
            "Here is the whole thing on one screen. Twenty steps, grouped into hire, onboard and "
            "activate. Every step is coloured by who owns it. Purple is the agent. Blue is a person "
            "deciding. Grey is plain software. Amber is a fixed wait. Now notice how much of this is "
            "grey. Nine of the twenty steps are deterministic software and a model would only make "
            "them worse. Five is where a model genuinely earns its place. Three need a person, two of "
            "those by law. And three are waits nobody can shorten. Look at the right hand column: six "
            "of the twenty are sold by neither company in this market, and almost every one of those "
            "six is a wait."
        ),
        do=(
            "Hover a couple of rows so the room sees the colour rail on the left. Then click step 6, "
            "hire or reject, and read the boundary panel out loud: what the agent owns, and what you decide."
        ),
        note=(
            "If somebody asks why the waits are grey rather than a brand colour: because nobody owns "
            "them. A background check does not come back faster because you bought software."
        ),
    ),
    dict(
        n="3", t="One person, end to end", secs=60, screen="Candidate",
        land="19 days, 20 steps",
        say=(
            "This is one person through all twenty steps, with a timestamp and a name against every "
            "one. Alicia applied on a Saturday night at twenty to eight. She was screened three hours "
            "later, interviewed on the Thursday, decided on the Friday, and she is still there at day "
            "ninety. Nineteen days from application to first shift, and fourteen of those nineteen "
            "were the advance notice rule on the schedule, which we are not allowed to compress. Every "
            "entry says who acted. Where it says the agent, it says exactly what the agent was allowed "
            "to do."
        ),
        do=(
            "Scroll the timeline slowly. Stop on step 6 and read that note out loud, the one that ends "
            "'his name is on the record, not the model's'."
        ),
        note=(
            "This screen is the audit record. In US hiring, being able to reconstruct a decision "
            "months later without the app is a legal requirement, not a feature."
        ),
    ),
    dict(
        n="4", t="The call, and the phrase bank", secs=75, screen="Screening",
        land="Pass or hold, never reject",
        say=(
            "This is the screening call. Six minutes twelve. Read the first thing the agent says: it "
            "tells her it is an assistant and not a person, that a person makes the decision, and that "
            "she can ask for a human or a written version instead. That is not optional and it is not "
            "marketing. Then three behavioural questions. Every answer is matched against a phrase "
            "bank that the retailer writes and owns, not us. And here is the line that matters most in "
            "this whole demo: the agent can pass somebody forward, and it can never reject anybody. "
            "Nineteen people this weekend gave an answer the phrase bank did not cover, and every "
            "single one went to a person instead of being guessed at."
        ),
        do=(
            "Read the opening disclosure line out loud. Then point at a green phrase bank match under "
            "an answer. Then scroll down to the nineteen held for a person."
        ),
        note=(
            "The voice call is shown as a log, not dialled live. Nurix already shipped a live voice "
            "screening agent on the aviation build, so the capability exists. Say that plainly if asked."
        ),
    ),
    dict(
        n="5", t="The score, and who decides", secs=60, screen="Decisions",
        land="82, band 74 to 88",
        say=(
            "Here is the score. Eighty two, with a band of seventy four to eighty eight, because a "
            "single number to two decimal places would be a lie. Under it is the reasoning, and every "
            "point of it traces back to something she actually said. And the only way out of this "
            "screen is a person clicking. Watch what happens when I approve. Her name leaves the "
            "queue, the pipeline count moves, and the record gains an entry with my name on it, not "
            "the model's."
        ),
        do="Click Hire on Alicia. Point at the queue count dropping, and read the toast that names who decided.",
        note=(
            "Worth being straight here: both competitors already score. This is parity, not our edge. "
            "The edge, if there is one, is the next two scenes."
        ),
    ),
    dict(
        n="6", t="The one nobody catches", secs=80, screen="Rehire flag",
        land="Matched on SSN, not on name",
        say=(
            "Now the first of the two I actually want your opinion on. Trevor applied on Monday "
            "morning and scored seventy nine. Good candidate on paper, interviews well. He was also "
            "terminated for cause at another store in this same chain in 2024, and marked not eligible "
            "for rehire. He spelled his name differently this time and every contact detail is new. To "
            "any system that started clean, he is a brand new applicant. We caught him because when a "
            "retailer leaves their old system, we import exactly one list. The do not hire list. "
            "We connect to what they already run rather than replacing it. That one flag we cannot work without, because it exists "
            "specifically to catch a new application. Screen faster with no imported flag and you "
            "rehire this man faster."
        ),
        do=(
            "Open the flag. Read the matched on line: social security number and date of birth, not "
            "the name. Then let the room sit with it for a beat before you move."
        ),
        note=(
            "If somebody asks whether the flag can be overridden: yes, and there is a button for it. "
            "An override is allowed. It is never silent, and it is recorded against the person who did it."
        ),
    ),
    dict(
        n="7", t="The one that keeps them out of court", secs=95, screen="Compliance",
        land="8 working days, 2 blocks",
        say=(
            "And the second one. Kayla started on the thirteenth. Her E-Verify check came back with a "
            "mismatch, which sounds alarming and almost never is. She is a US citizen. She got married "
            "in March, hyphenated her surname, and the government record still has the old one. She is "
            "contesting it, which she is entitled to do. Now here is the part that matters. While she "
            "contests it, the law says the employer cannot take any adverse action. Not fire her, not "
            "suspend her, not withhold pay, not delay her training, and not quietly leave her off next "
            "week's rota. Her store manager tried to drop her shifts. Twice. The product stopped him "
            "both times and told him exactly why. Nobody was being malicious. He just did not know "
            "what a mismatch means. That is precisely how retailers break this law."
        ),
        do=(
            "Show the four clocks and point out which are legal and which is already done. Then press "
            "the red button, Try to remove her from next week's rota, and read the refusal out loud. "
            "It is the single most convincing thing in this demo."
        ),
        note=(
            "The two numbers to get right, because vendor material gets them wrong constantly: ten "
            "federal working days from issuance for the employee to give the employer their decision, "
            "and eight federal working days after referral to actually contact the agency. Different "
            "clocks, different starting points."
        ),
    ),
    dict(
        n="8", t="Making the wait visible", secs=55, screen="Background checks",
        land="One county, 8.2 days",
        say=(
            "This one is honest rather than clever. A background check takes as long as the slowest "
            "county court, and there is no national criminal database an employer can read. We cannot "
            "make this faster and I am not going to pretend otherwise. What we can do is stop it being "
            "a black hole. Sasha has been waiting eight days and it is one county that needs a person "
            "to physically walk into a courthouse. Two things follow from just showing that. Nobody "
            "chases the agency about something the agency cannot fix. And Sasha gets told. Right now, "
            "in this market, she waits eight days in silence, takes another job, and nobody ever "
            "records why."
        ),
        do="Expand Sasha's check. Point at the single highlighted row that is the entire delay.",
        note=(
            "We never perform a check. We place the order with whichever agency the customer already "
            "contracts with. That is recorded as a decision, D-014."
        ),
    ),
    dict(
        n="9", t="It measures itself", secs=60, screen="Instrumentation",
        land="71% agent, 6.7% a person",
        say=(
            "Last screen before the ask. Every number in this product came out of the product. Time in "
            "each step, where people drop, and who acted. Seventy one percent of actions were the "
            "agent, twenty two percent were plain rules, and just under seven percent were a person. "
            "Every hire decision is inside that seven percent. And the reason this screen exists at "
            "all is that nobody publishes where the time goes in frontline retail hiring. We looked "
            "hard, twice, under strict sourcing rules, and found nothing traceable. So the first "
            "deployment has to produce the number rather than quote somebody else's."
        ),
        do=(
            "Point at the day ninety card and say out loud that it is deliberately a different cohort, "
            "because the current one has not had ninety days yet. Then switch the toggle to the store "
            "seat to show the same data from Marcus's side."
        ),
        note=(
            "If asked about retention: the best public retention disclosure in US retail excludes "
            "anyone with under a year of service, which is exactly where the churn sits. A customer may "
            "have no baseline to hold us to, so the first contract has to establish one."
        ),
    ),
    dict(
        n="10", t="The assistant", secs=70, screen="Any screen, bottom right",
        land="It refuses, and it shows its working",
        say=(
            "One last thing, bottom right corner. This is not a language model and I am not going to pretend "
            "it is. It is an intent classifier running on this machine: no network call, no API key, nothing "
            "to bill. It knows eighteen things and it does those eighteen things. Watch two of them. First I "
            "ask it to hire somebody. Notice it asks before it acts, and it puts my name on the record rather "
            "than its own. Now I ask it to take Kayla off next week's rota, in my own words, and it refuses. "
            "It tells me which law, how many working days are left, and it logs the attempt in the same "
            "refusal log the store manager's attempts appear in. And under every single reply there is a line "
            "you can open showing exactly which words it matched and how confident it was. You should be able "
            "to audit it, not just trust it."
        ),
        do=(
            "Open it with the button, or press C. Type 'hire ines duarte' and press Approve. Then type 'take "
            "kayla off next weeks rota' and let it refuse. Then open the working line underneath that refusal."
        ),
        note=(
            "If somebody asks whether it is an LLM: no, and say so plainly. It is keyword, synonym and "
            "fuzzy matching, which is why it handles typos and paraphrase but only across those eighteen "
            "actions. Anything outside them it declines rather than guessing."
        ),
    ),
    dict(
        n="11", t="The ask", secs=45, screen="Store view",
        land="Feedback, not approval",
        say=(
            "That is the demo. To be completely clear about what is real: the product logic, the "
            "clocks, the queues and the refusals are all real and running in front of you. Everything "
            "outside our own product is simulated and labelled as simulated. There is no live payroll, "
            "no live scheduling, no live E-Verify and no live screening agency. What I want from you is "
            "feedback, and a lot of it."
        ),
        do="Stop clicking. Ask the four questions below, and write down the answers rather than defending.",
        note=None,
    ),
]

ASK = [
    "Is this what you meant when you said end to end hiring?",
    "Which parts of the funnel have I got wrong, or in the wrong order?",
    "Is there anything here we should not be doing at all?",
    "What did you expect to see that is not here?",
]

INTERRUPTS = [
    ("Where did the score come from?",
     "The interview the agent conducted, matched against a phrase bank the retailer wrote. It is a "
     "band rather than a point because the underlying signal does not support a point. And it is a "
     "suggestion: a person decides, and their name goes on the record."),
    ("Are you not just doing what Fountain and Paradox do?",
     "On most of the twenty steps, yes, and we should be judged on doing those properly. Two things "
     "are different. Neither of them sells anything at the six steps that are waits, which is where "
     "people actually disappear. And neither claims anything about whether the person you hired "
     "stayed."),
    ("Why is so little of this AI?",
     "Because a model on 'are you eighteen' adds nothing and drags a deterministic step into "
     "automated decision rules. The five steps where a model earns its place are almost all the same "
     "capability: a conversation with somebody about whether they are going to turn up or stay."),
    ("What happens if the AI gets it wrong?",
     "It cannot reject anybody. The worst it can do is hold somebody for a person to look at, which "
     "is what it does nineteen times a weekend. The failure mode is a slower queue, not a wrongly "
     "rejected candidate."),
    ("Is this legal?",
     "The clocks and the rules in the demo are verified against primary government sources, and the "
     "sources are in the repo. It still needs counsel sign off before anything is built. Two things "
     "we already know we owe: an annual independent bias audit, because a score that assists a hiring "
     "decision is a regulated tool in New York City, and an alternative path for candidates who "
     "cannot do a voice interview."),
    ("Is that chat thing an LLM?",
     "No, and I would rather say that than let you assume it. It is an intent classifier running in the "
     "browser: keyword matching, a synonym table, and fuzzy matching for typos. That is why it copes with "
     "paraphrase and misspelling but only across eighteen fixed actions. Anything outside those it declines "
     "instead of guessing, which is the behaviour I actually want from something that can approve a hire."),
    ("How long would this take to build?",
     "I do not have an estimate and I would rather not invent one. What I do have is the integration "
     "count: six to eight external systems per customer, and the two that gate the schedule, payroll "
     "and E-Verify, publish no timeline at all. That is the honest answer to the question."),
]

DO_NOT_SAY = [
    ("Any turnover or funnel percentage from a vendor blog.",
     "None of them has a traceable source. The list is in the repo under numbers not to use."),
    ("Stable scheduling improves retention.",
     "The one US retail randomised trial that tested it came back as a null on aggregate turnover."),
    ("Certification with payroll or Workday takes N weeks.",
     "No such figure is published by any of them. Every number in circulation is unsourced."),
    ("We will improve quality of hire.",
     "We dropped it as a metric on purpose, and it is genuinely hard to prove. Do not promise it."),
    ("The E-Verify final nonconfirmation issues after ten days from referral.",
     "Wrong number and wrong starting point. Ten days runs from issuance of the mismatch. Eight runs "
     "from referral."),
    ("Any price, or anything per hire.",
     "Pricing is deliberately unresolved, and a price shown in a demo anchors. Say it is open."),
]

DECISIONS = [
    ("D-009", "Attract is out of scope. We have no way to hold outcome data nobody else has."),
    ("D-010", "Management roles are a non-goal for v1. One flow."),
    ("D-011", "Nothing from NuAnchor transfers at product level. The demo form is craft, not product."),
    ("D-012", "The premise question is closed by CEO mandate. The cost is that v1 must instrument itself."),
    ("D-013", "All twenty steps. Parity is the ticket, the spanning view is the claim."),
    ("D-014", "We never perform a background check. We order it and we show its state."),
    ("D-015", "We are the system of record. All applicants come to us."),
    ("D-016", "Step 6 produces a score. A human still decides. This is parity, not an edge."),
    ("D-017", "Success is time to hire and number of hires. Quality of hire is dropped."),
    ("D-018", "A demo comes before the product. Everything external is simulated."),
]


def build(path):
    doc = Document()

    # Page and base style
    for s in doc.sections:
        s.top_margin = Inches(0.85)
        s.bottom_margin = Inches(0.85)
        s.left_margin = Inches(0.9)
        s.right_margin = Inches(0.9)

    base = doc.styles["Normal"]
    base.font.name = "Calibri"
    base.font.size = Pt(10.5)
    base.font.color.rgb = INK

    # ---------------------------------------------------------------- cover ---
    eyebrow(doc, "Internal · demo script · frontline hiring", ACCENT, space_before=0)

    p = para(doc, space_after=6)
    run(p, "How to demo frontline hiring in about ten minutes", size=24, bold=True, color=INK)

    p = para(doc, space_after=10)
    run(p, "Twelve scenes, what to click, what to say word for word, and the one number to land in "
            "each. Written so that if you can read it out loud, you can give this demo. No product "
            "background needed.", size=11, color=MUTED)

    kv_table(doc, [
        ("Runs in", "About 11 to 12 minutes at a normal talking pace"),
        ("Scenes", "One overview page, ten screens, then the assistant"),
        ("Audience", "Nishant Yadav. Internal review, not a customer"),
        ("The ask", "Feedback. Not approval, not budget"),
        ("Opens at", "06-validation/demo/index.html"),
    ])

    # ------------------------------------------------------------ before you ---
    eyebrow(doc, "Before you present", ACCENT)
    p = para(doc, space_after=6)
    run(p, "Five minutes of setup saves a retake", size=14, bold=True)

    bullets(doc, [
        ("Reset it.", "Press R, or click Reset in the sidebar. A half run demo is the one thing that "
                      "looks broken. If you have been rehearsing, reset again."),
        ("Window at 1440 by 900.", "Nothing else on screen. Notifications off, Slack closed, bookmarks "
                                   "bar hidden. Browser zoom at 100 percent, because the numbers are "
                                   "the point and they need to be readable."),
        ("Decide on presenter notes.", "Press P to toggle them. They are useful while rehearsing and "
                                       "distracting on a shared screen. Off for the real thing."),
        ("Pick a theme and leave it.", "Press T to cycle auto, light, dark. Switching mid demo looks "
                                       "like a glitch."),
        ("Know the two moments.", "Scenes 6 and 7 are the reason this demo exists. Everything before "
                                  "them is setting them up. If you are running short, cut scene 3 or "
                                  "scene 8, never 6 or 7."),
    ])

    p = para(doc, space_before=6, space_after=4)
    run(p, "Keyboard, once you are in the product", size=11, bold=True)
    kv_table(doc, [
        ("P", "Presenter notes on or off"),
        ("Left / Right", "Previous or next scene, when notes are on"),
        ("1 to 0", "Jump straight to a screen, in sidebar order"),
        ("T", "Cycle theme"),
        ("R", "Reset to the opening state"),
        ("Esc", "Close a panel"),
    ], col_w=(1.1, 5.4))

    p = para(doc, space_before=8, space_after=2)
    run(p, "One thing to be honest about, up front", size=11, bold=True, color=WARN)
    p = para(doc, space_after=8)
    run(p, "Every number in this demo is invented, and every external system is simulated. What is "
            "real is the product logic: the twenty steps, the four owners, the legal clocks, the "
            "refusals and the audit trail. The legal deadlines are verified against primary government "
            "sources. Say all of that in scene 10 rather than hoping nobody asks.", size=10.5, color=MUTED)

    doc.add_page_break()

    # ---------------------------------------------------------------- scenes ---
    eyebrow(doc, "The script, scene by scene", ACCENT, space_before=0)
    p = para(doc, space_after=10)
    run(p, "Twelve scenes", size=18, bold=True)

    for i, sc in enumerate(SCENES):
        # scene header strip
        t = doc.add_table(rows=1, cols=1)
        no_borders(t)
        c = t.cell(0, 0)
        shade(c, SHADE_HEAD)
        ph = c.paragraphs[0]
        ph.paragraph_format.space_after = Pt(1)
        run(ph, "SCENE " + sc["n"] + "   ", size=9, bold=True, color=RGBColor(0x7F, 0xA6, 0xFF))
        run(ph, sc["t"], size=13, bold=True, color=RGBColor(0xFF, 0xFF, 0xFF))
        pm = c.add_paragraph()
        pm.paragraph_format.space_after = Pt(1)
        run(pm, sc["screen"] + "  ·  about " + str(sc["secs"]) + " seconds  ·  land: " + sc["land"],
            size=8.5, bold=True, color=RGBColor(0x9D, 0xAA, 0xBE))
        para(doc, space_after=3)

        block(doc, "Say this", sc["say"], SHADE_SAY, AGENT, body_size=11)
        block(doc, "Do this", sc["do"], SHADE_DO, MUTED, body_size=10)
        if sc["note"]:
            block(doc, "If it comes up", sc["note"], SHADE_LAND, ACCENT, body_size=10, body_italic=True)

        if i in (3, 6, 8, 10):
            doc.add_page_break()

    # ------------------------------------------------------------- the ask ---
    doc.add_page_break()
    eyebrow(doc, "The ask", ACCENT, space_before=0)
    p = para(doc, space_after=6)
    run(p, "Four questions, and then stop talking", size=18, bold=True)
    p = para(doc, space_after=8)
    run(p, "A demo without an ask is a screening, not a pitch. Ask these in order, write the answers "
            "down, and resist defending anything.", size=10.5, color=MUTED)
    for i, q in enumerate(ASK, 1):
        p = para(doc, space_after=5)
        run(p, str(i) + ".  ", size=11, bold=True, color=ACCENT)
        run(p, q, size=11.5, bold=True)

    # -------------------------------------------------------- interruptions ---
    eyebrow(doc, "If someone interrupts", ACCENT, space_before=16)
    p = para(doc, space_after=6)
    run(p, "The six questions this demo invites", size=14, bold=True)
    p = para(doc, space_after=8)
    run(p, "An interruption is the demo working. Answer in one or two sentences, then get back to the "
            "scene you were in.", size=10.5, color=MUTED)
    for q, a in INTERRUPTS:
        p = para(doc, space_before=6, space_after=2)
        run(p, q, size=11, bold=True, color=INK)
        p = para(doc, space_after=2)
        run(p, a, size=10, color=MUTED)

    # ---------------------------------------------------------- do not say ---
    doc.add_page_break()
    eyebrow(doc, "Do not say", CRIT, space_before=0)
    p = para(doc, space_after=6)
    run(p, "Six claims we cannot support", size=18, bold=True)
    p = para(doc, space_after=8)
    run(p, "Each of these has been checked and killed. A claim you cannot back is worse than no "
            "claim, and this room will check.", size=10.5, color=MUTED)

    tbl = doc.add_table(rows=1, cols=2)
    tbl.style = "Table Grid"
    hdr = tbl.rows[0].cells
    for cell, text in zip(hdr, ("The claim", "Why not")):
        shade(cell, SHADE_CRIT)
        pp = cell.paragraphs[0]
        pp.paragraph_format.space_after = Pt(2)
        run(pp, text.upper(), size=8, bold=True, color=CRIT)
    hdr[0].width = Inches(2.6)
    hdr[1].width = Inches(3.9)
    for claim, why in DO_NOT_SAY:
        cells = tbl.add_row().cells
        cells[0].width = Inches(2.6)
        cells[1].width = Inches(3.9)
        p1 = cells[0].paragraphs[0]
        p1.paragraph_format.space_after = Pt(2)
        run(p1, claim, size=9.5, bold=True)
        p2 = cells[1].paragraphs[0]
        p2.paragraph_format.space_after = Pt(2)
        run(p2, why, size=9.5, color=MUTED)

    # -------------------------------------------------------- the decisions ---
    eyebrow(doc, "The defence pack", ACCENT, space_before=16)
    p = para(doc, space_after=6)
    run(p, "Every decision behind the demo, with a reason", size=14, bold=True)
    p = para(doc, space_after=8)
    run(p, "If a choice in the demo gets challenged, it is written down with a reason and a reversal "
            "condition in DECISIONS.md. Short form here.", size=10.5, color=MUTED)

    t2 = doc.add_table(rows=0, cols=2)
    no_borders(t2)
    for code, text in DECISIONS:
        cells = t2.add_row().cells
        cells[0].width = Inches(0.8)
        cells[1].width = Inches(5.7)
        p1 = cells[0].paragraphs[0]
        p1.paragraph_format.space_after = Pt(3)
        run(p1, code, size=9.5, bold=True, color=ACCENT, font="Consolas")
        p2 = cells[1].paragraphs[0]
        p2.paragraph_format.space_after = Pt(3)
        run(p2, text, size=10, color=MUTED)

    # ------------------------------------------------------------- closing ---
    p = para(doc, space_before=16, space_after=4)
    run(p, "What is still open, if he asks", size=11, bold=True)
    bullets(doc, [
        ("Pricing.", "Deliberately unresolved. Q-030. Nothing in the demo is framed per hire."),
        ("E-Verify posture.", "Own it, embed a vendor, or leave it out. Q-033, decided at S1."),
        ("The do-not-hire export.", "Whether each applicant tracking vendor can export that one list. "
                                    "Q-032, answerable by one call to a vendor sales engineer."),
        ("Build order.", "Twenty steps is a roadmap. Something ships first and that is undecided."),
        ("Practitioner access.", "Q-001. Still the biggest unmanaged risk in the project, and the demo "
                                 "is the best door opener we have had."),
    ])

    doc.save(path)
    return path


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "DEMO-SCRIPT.docx")
    build(out)
    print("wrote", out, os.path.getsize(out), "bytes")
