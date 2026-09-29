/* ============================================================================
   ops/drawer.js  ·  ONE drawer, ONE fixed frame, and the only place a write
                     happens

   THE FRAME IS FIXED AND IT IS FIVE BLOCKS, ALWAYS IN THIS ORDER:

     1  WHO THIS IS          name, store, role, where they are
     2  WHY IT IS HERE       every reason the queue collected, not just the worst
     3  THE EVIDENCE         the only block that changes per kind
     4  THE ACTION           with its reason, chips first
     5  WHAT HAPPENS NEXT    the moves the engine says this actor may make

   That is ONE frame with seven evidence blocks behind it, not fourteen
   components. The specification needed fourteen payload shapes from a
   component it had specified three of.

   WHY EVERY WRITE IS HERE. A row is tapped in a hurry, on a phone, by somebody
   who will be interrupted. One place a person says yes means the reason field,
   the refusal rendering and the confirmation exist once rather than five
   times, and it means a bulk approval names every person in the set in the
   same frame a single approval uses.

   REASONS: CHIPS FIRST, TYPING AS THE FALLBACK, AND THE CHIPS ARE MADE OF
   THAT CANDIDATE'S OWN EVIDENCE. Nineteen of the twenty-one decisions in the
   seed carry the identical sentence "Screening evidence supports it and the
   shift pattern matches", including one candidate whose screening recommended
   review with two criteria only partly met. That is what a required free-text
   box buys at 7pm on a Friday: an audit trail with no information in it. So
   every chip below is a restatement of a field in that person's own payload,
   which is why "Reliability partly met" can appear for one person and not for
   the next.

   THE REASON IS REQUIRED BECAUSE THE ENGINE REQUIRES IT, and the requirement
   is the engine's own sentence rather than a rule of ours. Measured: posting
   an approval with no reason returns "This move needs a reason in writing, and
   none was given. It goes on the record against Marcus Hale and it is what the
   decision has to be explained by later. At least 12 characters." The review
   asked for the reason to be optional on approve. The engine is the record and
   the engine wins, so the button says what it needs instead of failing on
   press.

   A REFUSAL IS RENDERED VERBATIM. It is the best copy in the product and it is
   never replaced by a sentence of ours.
   ============================================================================ */

import { el, clear, put, atStore, atStoreFull, atUTC, dur, rel, cap, pct,
         ownerChip, toneChip, simBadge, glyph, tick } from './dom.js';
import * as API from './api.js';
import * as DRAFT from './draft.js';
/* The row's shape lives in ONE place, because the queue and the drawer have to
   agree about which reason is being acted on. See ops/rows.js. */
import { acting, primaryReason, COST_SAYS, toneOf } from './rows.js';

let host = null;      /* The scrim and the panel, built once and reused. */
let current = null;   /* The item on screen, or null. */
let handlers = {};    /* onDone and onOpenPerson, supplied by the shell. */

export function init(opts) { handlers = opts || {}; }

/* ------------------------------------------------------------- the shell --- */

function build() {
  if (host) return host;
  const scrim = el('div', { class: 'scrim', onclick: close });
  const bd = el('div', { class: 'drawer-bd', id: 'drawer-bd' });
  const ft = el('div', { class: 'drawer-ft', id: 'drawer-ft' });
  /* A THIN BAR, not a second title. The identity block inside the panel owns
     the name, the role, the store and the step. This header used to repeat the
     name and the store directly above it, so the panel opened with the same
     two facts twice. It keeps an id for aria-labelledby and a screen reader,
     and shows the name only on a phone where the identity block scrolls. */
  const title = el('div', { class: 'drawer-title' }, [
    el('div', { class: 'dr-kicker', text: 'Case' }),
    el('div', { class: 'dr-hd-name', id: 'drawer-name', text: '' })
  ]);
  const panel = el('aside', {
    class: 'drawer', role: 'dialog', 'aria-modal': 'true',
    'aria-labelledby': 'drawer-name', id: 'drawer'
  }, [
    el('span', { class: 'drawer-grab', 'aria-hidden': 'true' }),
    el('div', { class: 'drawer-hd' }, [
      title,
      el('button', { class: 'ops-ico x', type: 'button', text: 'Close',
                     'aria-label': 'Close', onclick: close })
    ]),
    bd, ft
  ]);
  host = { scrim, panel, bd, ft,
           name: title.lastChild, sub: null };
  document.body.appendChild(scrim);
  document.body.appendChild(panel);

  /* ------------------------------------------------------------ the focus ---
     THIS IS A MODAL AND IT SAID SO WITHOUT BEHAVING LIKE ONE. `role="dialog"`
     and `aria-modal="true"` were on the panel while focus stayed wherever it
     was, so a keyboard user pressed Tab and walked the queue BEHIND an open
     drawer, pressing rows they could not see. Three things fix it and all
     three are the minimum: focus moves in on open, Tab cycles inside, and it
     goes back to the control that opened it on close.
     ----------------------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (!current) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const list = focusable();
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    const here = document.activeElement;
    if (!panel.contains(here)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && here === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && here === last) { e.preventDefault(); first.focus(); }
  });
  return host;
}

/** Everything inside the panel a person can reach, in document order. */
function focusable() {
  if (!host) return [];
  return Array.prototype.filter.call(
    host.panel.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'),
    (n) => n.offsetParent !== null || n === document.activeElement);
}

/* What had focus before the drawer opened, so closing puts it back rather than
   dropping the keyboard at the top of the document. */
let returnTo = null;

export function close() {
  if (!host) return;
  host.scrim.classList.remove('open');
  host.panel.classList.remove('open');
  const was = current;
  current = null;
  /* The draft is NOT dropped here. That is the whole point of it.

     AND THE LIST BEHIND IS REPAINTED, so the row this drawer came from shows
     that a draft is being kept for it. Seen on screen: a half-typed rejection
     survived the close, which is the requirement, and nothing on the queue
     said so, which makes a kept draft a thing a manager has to remember rather
     than a thing they can see. The repaint also re-reads the clock. */
  if (was && handlers.onClose) handlers.onClose(was);

  /* BACK WHERE IT CAME FROM, AND AFTER THE REPAINT.

     A close that leaves focus on a hidden panel sends the next Tab to the top
     of the document, which on this surface is the search box, several sections
     above the row somebody was working on. Restoring it before `onClose` did
     not work either: that handler re-reads the queue and rebuilds every row, so
     the button this drawer was opened from is no longer in the document by the
     time focus lands on it. So the row is found again by its application id,
     and the node captured on open is only the fallback. */
  restoreFocus(was);
}

/**
 * Put the keyboard back on the row this drawer came from.
 *
 * WHY IT RETRIES. `onClose` re-reads the queue, and that starts by replacing
 * the table with a loading band, so at the instant the drawer closes there is
 * no row to focus at all: the first attempt found nothing and focus stayed on
 * a heading inside a panel that is no longer on screen. So it waits for the
 * row to come back, for about half a second, and gives up quietly after that
 * rather than stealing focus from wherever the reader has got to.
 */
function restoreFocus(was) {
  const id = was && was.applicationId;
  const fallback = returnTo && returnTo.isConnected ? returnTo : null;
  returnTo = null;
  let tries = 0;

  const put1 = (node) => {
    if (!node || !node.focus) return false;
    /* Only if nothing else has taken the keyboard in the meantime. */
    if (document.activeElement && document.activeElement !== document.body &&
        !host.panel.contains(document.activeElement)) return true;
    try { node.focus(); } catch (e) { /* not focusable any more */ }
    return true;
  };

  const attempt = () => {
    if (current) return;                      /* another case opened, leave it alone */
    const row = id
      ? document.querySelector('[data-app="' + cssEscape(id) + '"] td.c-act button')
      : null;
    if (row) { put1(row); return; }
    tries += 1;
    if (tries < 30) { window.requestAnimationFrame(attempt); return; }
    put1(fallback);
  };
  attempt();
}

/** Application ids are ours and are plain, but a selector is a selector. */
function cssEscape(v) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(String(v));
  return String(v).replace(/["\\]/g, '\\$&');
}

/* --------------------------------------------------------------- opening --- */

/**
 * Open the drawer on one item.
 *
 * `item` is a queue row, or a synthetic one for a batch. It arrives with
 * enough to draw blocks 1 and 2 immediately, because a manager on a phone
 * should see the name and the reason before any second request lands. The
 * evidence fills in when it arrives.
 */
export async function open(row) {
  const item = acting(row);
  const h = build();
  if (!current) returnTo = document.activeElement;
  current = item;
  h.scrim.classList.add('open');
  h.panel.classList.add('open');
  /* Focus moves into the panel immediately, so the trap has somewhere to hold
     it while the record loads. `settle` moves it onto the heading once there is
     one. Focusing the heading here instead landed on the Close button every
     time, because the identity block does not exist until the payload arrives. */
  focusPanel();

  if (item.batch) {
    h.name.textContent = 'Approve ' + item.batch.length;
    if (h.sub) h.sub.textContent = 'Every name is listed below.';
  } else {
    h.name.textContent = item.name || 'This application';
    if (h.sub) h.sub.textContent = [item.storeName, item.stateLabel].filter(Boolean).join('  ·  ');
  }

  put(h.bd, frame(item, null));
  put(h.ft, el('span', { class: 'small faint', text: 'Reading the record.' }));

  if (item.batch) {
    const loaded = await Promise.all(item.batch.map((r) => loadFull(r, true)));
    if (current !== item) return;
    item.loaded = loaded;
    settle(h, item, null);
    return;
  }

  const full = await loadFull(item, item.kind === 'decide');
  if (current !== item) return;
  item.full = full;
  settle(h, item, full);
}

/**
 * THE ACTION BLOCK GOES IN THE BODY, THE BUTTONS GO IN THE FOOTER.
 *
 * Measured on screen at 390 by 844: with the chips, the reason box and the
 * buttons all inside `.drawer-ft`, the footer stood about 230px tall and sat on
 * top of the evidence it was asking a person to act on. A footer is a place for
 * the press, not for the form. So block 4 of the fixed frame is the last thing
 * in the scrolling body and the footer holds buttons and nothing else.
 */
/* Which tab is showing. Kept on the module rather than in the DOM so a
   repaint after a write does not throw the reader back to Overview. */
let tab = 'overview';

function settle(h, item, full) {
  const a = actionsFor(item, full);
  tab = 'overview';
  paintDrawer(h, item, full, a);
  /* Only if the reader has not already moved. Stealing focus from somebody who
     started tabbing while the record loaded is worse than starting them one
     control further in. */
  if (h.panel.contains(document.activeElement) &&
      (document.activeElement === h.panel || document.activeElement === document.body)) {
    focusPanel();
  }
}

/** Focus the case's name if it has painted, and the panel itself if not. */
function focusPanel() {
  if (!host) return;
  const target = host.panel.querySelector('.dr-id h2') || host.panel;
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  try { target.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
}

function paintDrawer(h, item, full, a) {
  const tabs = [
    { key: 'overview', label: 'Overview' },
    /* The count is the number of things that HAVE happened. It used to be
       `full.moves.length`, which is the number of moves still available. */
    { key: 'timeline', label: 'Timeline',
      n: full ? ((full.events || []).length || null) : null },
    { key: 'evidence', label: 'Evidence' }
  ];

  const body = [];

  /* The identity block, above the tabs, so it never scrolls away from the case
     it names. Who, what role, which store, and where in the twenty steps. */
  if (!item.batch) body.push(identity(item, full));

  body.push(el('div', { class: 'dr-tabs', role: 'tablist' }, tabs.map((x) => el('button', {
    class: 'dr-tab', type: 'button', role: 'tab',
    'aria-selected': String(tab === x.key), 'data-tab': x.key,
    onclick: () => { tab = x.key; paintDrawer(h, item, full, a); }
  }, [
    el('span', { text: x.label }),
    x.n != null ? el('span', { class: 'c', text: String(x.n) }) : null
  ]))));

  if (item.batch) {
    body.push(batchFrame(item));
  } else if (tab === 'overview') {
    /* The four sections the brief names, in order, and the action is one of
       them rather than something to hunt for at the foot. */
    /* Three sections here, and the action is NOT one of them: actionsFor()
       already returns it as `a.body` and appends it below, so adding one here
       printed "What needs your attention" twice in the same panel. Seen on
       screen rather than reasoned about. */
    body.push(sec('Who this is', who(item, full)));
    body.push(sec('Why it is here', whyHere(item)));
    body.push(sec('What happens next', next(item, full)));
  } else if (tab === 'timeline') {
    body.push(sec('Everything that has happened', timelineBody(full)));
  } else {
    body.push(sec('The evidence', evidence(item, full)));
  }

  put(h.bd, [body, a.body || null]);
  /* NO SECOND CLOSE. The header already has one, and a footer whose only
     control was another Close put two of them on screen at once. Where a case
     has nothing to press, the footer says so. */
  put(h.ft, a.foot || el('span', { class: 'small faint',
    text: 'Nothing to press on this one. It is here so you know it is running.' }));
}

function identity(item, full) {
  const app = full && full.app;
  const cand = full && full.candidate;
  const req = full && full.requisition;
  const name = (cand && cand.name) || item.name || item.applicationId;
  const initials = (cand && cand.initials) || item.initials ||
    name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  const step = app && app.step != null ? app.step : item.step;
  return el('div', { class: 'dr-id' }, [
    el('div', { class: 'dr-id-top' }, [
      el('span', { class: 'av', text: initials }),
      el('div', { class: 'col tight' }, [
        el('h2', { text: name }),
        el('div', { class: 'sub',
                    text: [(req && req.title) || item.role, item.storeName || (full && full.storeName)]
                      .filter(Boolean).join(' · ') })
      ])
    ]),
    el('div', { class: 'step' }, [
      el('span', { class: 'chip', text: (app && app.label) || item.stateLabel || 'In progress' }),
      step != null ? el('span', { class: 'n', text: 'step ' + step + ' of 20' }) : null
    ])
  ]);
}

/* ============================================================================
   THE TIMELINE

   WHAT WAS WRONG WITH IT, and it is the kind of thing only looking finds.

   It read `full.moves`. On the application payload `moves` is the list of
   transitions this actor MAY MAKE NEXT, each `{ to, label, needs,
   needsReason }`. It is not history. So every row rendered `m.state` (absent),
   `m.at` (absent), `m.actor` (absent) and `m.detail` (absent), and the tab
   printed two or three rows reading "Moved" with an empty date under them,
   headed "Every move on this application", counted in the tab. It described
   the future as the past and then printed neither.

   What has actually happened is `events`, the workflow events: each carries an
   instant, the state it entered, the step number, who did it and what kind of
   actor they were. `audit` carries the same instants from the other side, with
   the reason a person typed. The two are merged here, newest first, because a
   decision and the reason for it are one line in a person's head.

   THE ACTOR TYPE IS ON THE ROW, not just the name. A move made by the engine
   and a move made by Marcus Hale are the distinction the New York City and
   California rules turn on, and this is the record that proves which it was.
   ============================================================================ */

function timelineBody(full) {
  const events = (full && full.events) || [];
  const audit = (full && full.audit) || [];

  if (!events.length && !audit.length) {
    return el('div', { class: 'small muted',
                       text: 'Nothing is recorded against this application yet.' });
  }

  /* One entry per instant. An audit row within a few seconds of a workflow
     event is the reason for that event rather than a second thing that
     happened, so it is folded into it. */
  const rows = events.map((e, i) => ({
    seq: i,
    at: e.at,
    what: e.state ? words(e.state) : (e.kind ? words(e.kind) : 'Moved'),
    step: e.step,
    who: e.actor || null,
    type: e.actorType || e.owner || 'system',
    why: null,
    detail: e.detail && typeof e.detail === 'string' ? e.detail : null
  }));

  audit.forEach((a) => {
    const near = rows.find((r) => Math.abs((r.at || 0) - (a.at || 0)) < 5000);
    if (near && a.why && !near.why) { near.why = a.why; if (!near.who) near.who = a.actor; return; }
    if (near) return;
    rows.push({ seq: rows.length, at: a.at, what: words(a.action || 'Recorded'), step: null,
                who: a.actor || null, type: a.actorType || 'system',
                why: a.why || null, detail: null });
  });

  /* Newest first, and the tie-break is the order they were RECORDED in.
     Entering a state and the three events that describe the entry share one
     instant, so a sort on the instant alone left "Decision pending", which is
     where this application actually is, three rows down its own timeline. The
     server stores events oldest first, so a higher index is later. */
  rows.sort((x, y) => (y.at || 0) - (x.at || 0) || (y.seq || 0) - (x.seq || 0));

  /* THE STATE NAME IS PRINTED ONCE PER RUN OF IT.

     Several events can record the same state: entering SCREENING_COMPLETE
     produces one from the rubric, one from the screening agent and one from
     the assistant, each with a different actor and a different sentence. All
     three printed "SCREENING COMPLETE" in bold, so the timeline read as the
     same thing happening three times when it is three different things
     happening at one step. The heading now belongs to the first of a run and
     the rest carry their own sentence, which was always the part that
     differed. */
  rows.forEach((r, i) => {
    const prev = rows[i - 1];
    r.repeat = !!(prev && prev.what === r.what && prev.step === r.step);
  });

  return el('ol', { class: 'dr-tl' }, rows.map((r) => el('li', {
    class: 'dr-tl-i own-' + (r.type === 'external' ? 'system' : r.type) + (r.repeat ? ' rep' : '')
  }, [
    el('span', { class: 'dot', 'aria-hidden': 'true' }),
    el('div', { class: 'b' }, [
      r.repeat ? null : el('div', { class: 't' }, [
        el('span', { text: cap(r.what) }),
        r.step != null ? el('span', { class: 'st', text: 'step ' + r.step } ) : null
      ]),
      el('div', { class: 'm' }, [
        glyph(r.type === 'external' ? 'system' : r.type, { size: 10 }),
        el('span', { text: r.who || ACTOR_WORD[r.type] || 'the system' }),
        el('span', { class: 'at', text: r.at ? atStoreFull(r.at) : '' })
      ]),
      r.why ? el('div', { class: 'why', text: r.why }) : null,
      r.detail ? el('div', { class: 'why', text: r.detail }) : null
    ])
  ])));
}

const ACTOR_WORD = { human: 'a person', agent: 'the AI assistant',
                     system: 'the software', external: 'an outside system' };

/**
 * The person payload, plus the screening evaluation where one is wanted.
 *
 * THE FLAG IS EXPLICIT because the caller knows and the row does not. The
 * first version asked `row.kind === 'decide'`, and a row out of /api/work has
 * no `kind` at all, so a batch of three decisions loaded three payloads with no
 * screening in any of them and the drawer said "no reading attached" three
 * times over evidence that was sitting one request away. Seen on screen.
 */
async function loadFull(row, wantScreening) {
  const r = await API.get(API.ROUTES.application(row.applicationId));
  if (!r.ok) return { error: r.error, row };
  const d = r.data || {};
  const out = { row, app: d.application, candidate: d.candidate, requisition: d.requisition,
                moves: d.moves || [], exceptions: d.exceptions || [], tasks: d.tasks || [],
                clocks: d.clocks || [], fcra: d.fcra, adverseBar: d.adverseBar,
                steps: d.steps || [], audit: d.audit || [], metrics: d.metrics,
                /* WHAT HAS HAPPENED, which is not the same list as what MAY
                   happen. See `timelineBody`. */
                events: d.events || [],
                screenings: d.screenings || [] };
  const scr = out.screenings.find((s) => s.status === 'complete') || out.screenings[0];
  if (scr && wantScreening) {
    const s = await API.get(API.ROUTES.screening(scr.id));
    if (s.ok) out.screening = s.data;
  }
  return out;
}

/* ----------------------------------------------------------- the 5 blocks --- */

/* A drawer section. The label is uppercase and small, the content is not, so
   the eye can find WHY THIS IS HERE without reading the whole panel. That was
   the review's specific complaint: every block had the same weight. */
function sec(head, body, of, cls) {
  return el('section', { class: 'dr-sec' + (cls ? ' ' + cls : '') }, [
    el('div', { class: 'lab' }, [head, of ? el('span', { class: 'of', text: ' ' + of }) : null]),
    body
  ]);
}

function frame(item, full) {
  if (item.batch) return batchFrame(item);
  return [
    sec('Who this is', who(item, full)),
    sec('Why it is here', whyHere(item)),
    sec('The evidence', evidence(item, full)),
    sec('What happens next', next(item, full))
  ];
}

/** Block 4 of the frame, wrapped the same way the other four are. */
function actionSec(body, of) { return sec('What needs your attention', body, of, 'is-act'); }

/* 1. WHO THIS IS */
function who(item, full) {
  const c = full && full.candidate;
  const q = full && full.requisition;
  const rows = [];
  rows.push(el('div', { class: 'ev-t' }, [
    el('span', { text: item.name || 'Unknown' }),
    item.assignedTo ? ownerChip('human', item.assignedTo) : null
  ]));
  const bits = [];
  if (item.storeName) bits.push(item.storeName);
  if (q && q.title) bits.push(q.title + ' at ' + (q.rateCents != null
    ? '$' + (q.rateCents / 100).toFixed(2) + ' an hour' : 'an unstated rate'));
  if (item.stateLabel) bits.push(item.stateLabel + ', step ' + item.step + ' of 20');
  rows.push(el('div', { class: 'ev-d', text: bits.join('. ') + '.' }));
  if (c && (c.phone || c.email)) {
    rows.push(el('div', { class: 'chiprow' }, [
      c.phone ? el('a', { class: 'btn sm', href: 'tel:' + c.phone, text: c.phone }) : null,
      c.email ? el('a', { class: 'btn sm', href: 'mailto:' + c.email, text: c.email }) : null
    ]));
  }
  rows.push(el('button', {
    class: 'btn sm', type: 'button', text: 'Open the whole journey',
    onclick: () => { close(); if (handlers.onOpenPerson) handlers.onOpenPerson(item.applicationId); }
  }));
  return el('div', { class: 'ev' }, rows);
}

/* 2. WHY IT IS HERE. Every reason, not only the worst, because a person with a
      rehire hold and a decision pending is one row carrying two and acting on
      one of them does not clear the other. */
function whyHere(item) {
  const rs = item.reasons || [];
  if (!rs.length) return el('div', { class: 'ev' }, el('div', { class: 'ev-d', text: item.because || 'No reason recorded.' }));
  return rs.map((r) => el('div', { class: 'ev' }, [
    el('div', { class: 'ev-t' }, [
      el('span', { text: r.verb }),
      costChip(r)
    ]),
    el('div', { class: 'ev-d', text: r.because }),
    el('div', { class: 'ev-cite', text: deadlineWords(r.loseBy) })
  ]));
}

/** The cost, as a word and a number together. Never colour alone, and never a
    tone without a value beside it. U-98 and U-101. */
export function costChip(r) {
  const left = r.loseBy - API.now();
  const tone = toneOf(r.cost);
  const value = left <= 0 ? 'past' : dur(left);
  const says = COST_SAYS[r.cost] || 'time';
  if (!tone) {
    return el('span', { class: 'chip' }, [
      el('span', { class: 'v', text: value }), el('span', { text: says })
    ]);
  }
  return toneChip(tone, value, says);
}

function deadlineWords(loseBy) {
  if (loseBy == null) return '';
  const left = loseBy - API.now();
  const when = atStoreFull(loseBy);
  return left <= 0 ? 'Was due ' + when + ', ' + rel(left)
                   : 'Due ' + when + ', ' + rel(left);
}

/* 3. THE EVIDENCE. The only block that changes. Seven kinds, each supplying
      what a person needs in front of them and nothing else. */
function evidence(item, full) {
  if (!full) return el('div', { class: 'ev' }, el('div', { class: 'ev-d', text: 'Reading the record.' }));
  if (full.error) return el('div', { class: 'fail' }, [
    el('div', { class: 'fail-what', text: 'The record did not load.' }),
    el('pre', { class: 'fail-err', text: full.error })
  ]);

  const out = [];
  if (item.kind === 'decide') out.push(screeningEvidence(full));
  if (item.kind === 'chase_offer' || item.kind === 'send_offer') out.push(offerEvidence(item, full));
  if (item.kind === 'exception') out.push(exceptionEvidence(item, full));
  if (item.kind === 'task') out.push(taskEvidence(item, full));
  if (item.kind === 'clock') out.push(clockEvidence(item, full));
  if (item.kind === 'move') out.push(stateEvidence(full));

  /* A bar in force is evidence on every kind, because it changes what may be
     done at all and it is the one thing that must never be discovered after
     the press. */
  if (full.adverseBar && full.adverseBar.active) out.push(barEvidence(full.adverseBar));
  /* An exception the queue did not raise is still evidence about this person. */
  (full.exceptions || []).forEach((e) => {
    if (e.resolvedAt) return;
    if (item.exceptionId === e.id) return;
    out.push(el('div', { class: 'ev' }, [
      el('div', { class: 'ev-t' }, [el('span', { text: e.title }), simBadge('also open')]),
      el('div', { class: 'ev-d', text: e.detail || '' })
    ]));
  });
  return out.filter(Boolean).length ? out : el('div', { class: 'ev' },
    el('div', { class: 'ev-d', text: 'Nothing beyond the record above.' }));
}

/** The two readings, and the model boundary printed as the payload states it.
    A deterministic fallback is NEVER described as a model. */
function screeningEvidence(full) {
  const s = full.screening;
  if (!s || !s.readings) {
    return el('div', { class: 'ev' }, [
      el('div', { class: 'ev-t', text: 'No screening reading is attached' }),
      el('div', { class: 'ev-d', text: 'The decision is yours on the record above.' })
    ]);
  }
  const r = s.readings.ours || {};
  const kids = [
    el('div', { class: 'ev-t' }, [
      el('span', { text: 'Screening reading' }),
      ownerChip(r.isModel ? 'agent' : 'system', r.isModel ? 'A model read this' : 'No model ran'),
      r.recommendation ? el('span', { class: 'chip', text: r.recommendation }) : null
    ]),
    r.note ? el('div', { class: 'ev-d', text: r.note }) : null,
    r.summary ? el('div', { class: 'ev-d', text: r.summary }) : null
  ];
  (r.criteria || []).forEach((c) => {
    kids.push(el('div', { class: 'ev-cite', text: cap(words(c.name)) + ': ' + words(c.verdict) }));
    if (c.evidence) kids.push(el('div', { class: 'ev-q', text: '"' + c.evidence + '"' }));
  });
  if (s.live && s.live.replayed && s.live.note) {
    kids.push(el('div', { class: 'ev-cite' }, [simBadge('replayed'), el('span', { text: ' ' + s.live.note })]));
  }
  if (s.readings.theirsWhy) kids.push(el('div', { class: 'ev-cite', text: s.readings.theirsWhy }));
  return el('div', { class: 'ev' }, kids);
}

function offerEvidence(item, full) {
  const st = (full.steps || []).find((x) => x.n === 8) || {};
  return el('div', { class: 'ev' }, [
    el('div', { class: 'ev-t' }, [
      el('span', { text: 'The offer' }),
      el('span', { class: 'chip', text: full.app ? full.app.label : '' })
    ]),
    el('div', { class: 'ev-d', text: item.because || '' }),
    item.loseBy != null ? el('div', { class: 'ev-cite',
      text: 'It lapses on its own at ' + atStoreFull(item.loseBy) + ', which is ' + atUTC(item.loseBy) + '.' }) : null,
    st.enteredAt ? el('div', { class: 'ev-cite',
      text: 'Step 8 started ' + atStoreFull(st.enteredAt) + ' and has been waiting ' + dur(API.now() - st.enteredAt) + '.' }) : null,
    el('div', { class: 'ev-d', text: 'This surface does not place the call. The number is above and it dials from the phone.' })
  ]);
}

function exceptionEvidence(item, full) {
  const e = (full.exceptions || []).find((x) => x.id === item.exceptionId);
  if (!e) return null;
  const kids = [
    el('div', { class: 'ev-t' }, [
      el('span', { text: e.title }),
      e.blocksProgress ? toneChip('warn', 'stopped', 'progress') : null
    ]),
    el('div', { class: 'ev-d', text: e.detail || '' }),
    el('div', { class: 'ev-cite', text: 'Raised ' + atStoreFull(e.at) + '. Owner: ' + (e.owner || 'unstated') + '.' })
  ];
  if (e.dueBy != null) {
    kids.push(el('div', { class: 'ev-cite',
      text: 'Target ' + atStoreFull(e.dueBy) + '. ' + (e.dueByNote || '') }));
  }
  const out = [el('div', { class: 'ev' }, kids)];
  /* The FCRA sequence, in order, with the gap's own basis stated. This is the
     whole beat the review wanted in one drawer instead of three pages. */
  if (full.fcra) out.push(fcraEvidence(full.fcra));
  return out;
}

function fcraEvidence(f) {
  const kids = [
    el('div', { class: 'ev-t' }, [
      el('span', { text: 'The notice sequence' }),
      f.mayTakeAdverseAction ? toneChip('good', 'open', 'may act')
                             : toneChip('crit', 'shut', 'may not act')
    ]),
    el('div', { class: 'ev-d', text: f.rule })
  ];
  (f.steps || []).forEach((s) => {
    kids.push(el('div', { class: 'ev-cite' }, [
      el('span', { text: s.n + '. ' + s.name + '. ' + (s.state || '') }),
      s.isLaw ? el('span', { class: 'chip', text: 'law' })
              : el('span', { class: 'chip', text: s.basis || 'policy' })
    ]));
    if (s.note) kids.push(el('div', { class: 'ev-d', text: s.note }));
    if (s.sourceNote) kids.push(el('div', { class: 'ev-cite', text: s.sourceNote }));
  });
  if (f.whyNot) kids.push(el('div', { class: 'ev-d', text: f.whyNot }));
  if (f.searches && f.searches.length) {
    kids.push(el('div', { class: 'ev-cite', text: 'Searches that returned something: ' + f.searches.join(', ') }));
  }
  return el('div', { class: 'ev' }, kids);
}

function taskEvidence(item, full) {
  const t = (full.tasks || []).find((x) => x.key === item.taskKey);
  if (!t) return null;
  const open = (t.needs || []).filter((k) => {
    const d = (full.tasks || []).find((x) => x.key === k);
    return !d || d.status !== 'complete';
  });
  return el('div', { class: 'ev' }, [
    el('div', { class: 'ev-t' }, [
      el('span', { text: t.name }),
      ownerChip(t.owner === 'human' ? 'human' : 'system', t.owner === 'human' ? 'Yours' : 'Ours'),
      t.preShift ? el('span', { class: 'chip', text: 'before the first shift' }) : null
    ]),
    el('div', { class: 'ev-d', text: 'Step ' + t.step + '. Eligible since ' + atStoreFull(t.eligibleAt) + '.' }),
    open.length ? el('div', { class: 'ev-d', text: 'Waiting on ' + open.join(' and ') + ' first.' }) : null,
    el('div', { class: 'ev-cite', text: (full.tasks || []).filter((x) => x.status !== 'complete').length +
      ' of ' + (full.tasks || []).length + ' tasks on this person are still open.' })
  ]);
}

/** A statutory clock, with the citation, the caveat and whose breach it is
    not. Everything here is the payload's own words. */
function clockEvidence(item, full) {
  const c = (full.clocks || []).find((x) => x.key === item.clockKey) || (full.clocks || [])[0];
  if (!c) return null;
  const kids = [
    el('div', { class: 'ev-t' }, [
      el('span', { text: c.title }),
      ownerChip(c.owner === 'human' ? 'human' : c.owner === 'clock' ? 'clock' : 'system',
                c.actor === 'nobody' ? 'Nobody owns this wait' : cap(String(c.owner))),
      c.isLaw ? el('span', { class: 'chip is-crit' }, [
        el('span', { class: 'v', text: String(c.days != null ? c.days : '') }),
        el('span', { text: c.unit || 'days' })
      ]) : null
    ]),
    el('div', { class: 'ev-d', text: c.rule || '' }),
    c.state ? el('div', { class: 'ev-d', text: c.state }) : null,
    c.leftLabel ? el('div', { class: 'ev-t', text: c.leftLabel + ' left' }) : null,
    c.dueAt != null ? el('div', { class: 'ev-cite',
      text: 'Due ' + atStoreFull(c.dueAt) + ', which is ' + atUTC(c.dueAt) +
            '. The count is made in UTC and printed here in store time.' }) : null,
    c.waitingOn ? el('div', { class: 'ev-d', text: 'Waiting on ' + c.waitingOn }) : null,
    c.caveat ? el('div', { class: 'ev-d', text: c.caveat }) : null,
    c.breach ? el('div', { class: 'ev-d', text: c.breach }) : null,
    c.citation ? el('div', { class: 'ev-cite', text: c.citation +
      (c.authorityNote ? '. ' + c.authorityNote : '') }) : null,
    c.mustNotImply ? el('div', { class: 'ev-cite', text: c.mustNotImply }) : null
  ];
  return el('div', { class: 'ev' }, kids);
}

function barEvidence(bar) {
  const kids = [
    el('div', { class: 'ev-t' }, [
      el('span', { text: 'A bar is in force' }),
      toneChip('crit', String((bar.barred || []).length), 'actions barred')
    ])
  ];
  (bar.grounds || []).forEach((g) => {
    kids.push(el('div', { class: 'ev-d', text: g.rule }));
    if (g.citation) kids.push(el('div', { class: 'ev-cite', text: g.citation }));
    if (g.liftsWhen) kids.push(el('div', { class: 'ev-d', text: g.liftsWhen }));
  });
  /* GUARDED AND UNGUARDED, SPLIT. Three of the five barred actions happen in
     systems this product does not own, so they cannot be refused here and the
     person who might take them has to see that. */
  (bar.guarded || []).forEach((b) => {
    kids.push(el('div', { class: 'ev-cite' }, [
      el('span', { class: 'chip is-good' }, [el('span', { class: 'v', text: '1' }), el('span', { text: 'refused here' })]),
      el('span', { text: ' ' + b.name })
    ]));
  });
  (bar.unguarded || []).forEach((b) => {
    kids.push(el('div', { class: 'ev-cite' }, [
      el('span', { class: 'chip is-warn' }, [el('span', { class: 'v', text: '0' }), el('span', { text: 'we cannot refuse' })]),
      el('span', { text: ' ' + b.name + '. ' + (b.whyNot || '') })
    ]));
  });
  if (bar.unguardedWarning) kids.push(el('div', { class: 'ev-d', text: bar.unguardedWarning }));
  (bar.attempts || []).forEach((a) => {
    kids.push(el('div', { class: 'ev-cite', text: 'Tried ' + atStoreFull(a.at) + ' by ' + a.who + ': ' + a.what + '. Refused: ' + a.why }));
  });
  return el('div', { class: 'ev' }, kids);
}

function stateEvidence(full) {
  const cur = (full.steps || []).find((s) => s.status === 'current');
  if (!cur) return null;
  return el('div', { class: 'ev' }, [
    el('div', { class: 'ev-t' }, [
      el('span', { text: 'Step ' + cur.n + ': ' + cur.name }),
      ownerChip(cur.owner, cap(cur.owner))
    ]),
    el('div', { class: 'ev-d', text: 'Entered ' + atStoreFull(cur.enteredAt) + ', ' + dur(API.now() - cur.enteredAt) + ' ago.' }),
    cur.queueMs != null ? el('div', { class: 'ev-cite',
      text: dur(cur.queueMs) + ' of that is waiting and ' + dur(cur.workMs || 0) + ' is recorded work.' }) : null
  ]);
}

/* 5. WHAT HAPPENS NEXT. The engine's own list for this actor. */
function next(item, full) {
  if (!full) return el('div', { class: 'ev' }, el('div', { class: 'ev-d', text: 'Reading the record.' }));
  const ms = full.moves || [];
  if (!ms.length) {
    return el('div', { class: 'ev' }, el('div', { class: 'ev-d',
      text: 'The engine offers no move out of ' + (full.app ? full.app.label : 'this state') +
            ' for you. Whatever comes next belongs to somebody else, or to the clock.' }));
  }
  /* The engine's transition table and the statutory bar are two different
     checks. A move can be legal in the table and still be refused by the bar,
     which is why "Employment ended" appears here for somebody whose
     termination is unlawful today. Saying so is cheaper than a person finding
     out by pressing it. */
  const barred = full.adverseBar && full.adverseBar.active;
  return el('div', { class: 'ev' }, [
    el('div', { class: 'ev-t', text: 'The moves the engine allows you' }),
    el('div', { class: 'chiprow' }, ms.map((m) => el('span', { class: 'chip' }, [
      el('span', { text: m.label }),
      m.needsReason ? el('span', { class: 'v', text: 'reason' }) : null
    ]))),
    barred ? el('div', { class: 'ev-d',
      text: 'A bar is in force on this person, so some of these will be refused whatever the ' +
            'table says. The bar and its grounds are in the evidence above.' }) : null
  ]);
}

/* ------------------------------------------------------- the action block --- */

function words(s) { return String(s || '').replace(/_/g, ' '); }

/**
 * The chips, and every one of them is a restatement of a field in this
 * person's own payload. Where nothing can be derived there are no chips and
 * the free text stands alone, which is honest rather than a menu of guesses.
 */
function chipsFor(item, full, intent) {
  /* A BATCH ONLY OFFERS GROUNDS THAT ARE TRUE OF EVERY MEMBER.
     One reason goes on all the records, so a chip that is true of the first
     person and false of the third is a false record on two of them. The first
     version took the chips from whichever payload loaded first, and on the
     seeded batch that was Jerome Kettleworth at one of three criteria met
     offering "Reliability partly met" as the ground for Ines Duarte and
     Marisol Ferreira, both of whom met all three. Seen on screen.

     Where the intersection is empty, there is nothing to tap, and the block
     says why. That is the honest outcome: if the grounds are not the same, the
     batch is not one decision. */
  if (item.batch) {
    const sets = (item.loaded || []).map((f) => chipsFor({ kind: 'decide' }, f, intent));
    if (!sets.length) return [];
    return sets.reduce((keep, one) => keep.filter((c) => one.indexOf(c) >= 0), sets[0]);
  }

  const out = [];
  if (item.kind === 'decide') {
    const c = full && full.screening && full.screening.readings && full.screening.readings.ours;
    const crit = (c && c.criteria) || [];
    const allMet = crit.length && crit.every((x) => x.verdict === 'met');
    if (allMet) out.push('All ' + crit.length + ' criteria the store set were met');
    crit.forEach((x) => out.push(cap(words(x.name)) + ' ' + words(x.verdict)));
    if (c && c.recommendation) out.push('The screening reading recommended ' + c.recommendation);
    if (c && c.isModel === false) out.push('No model ran on this screening and I read the evidence myself');
  }
  if (item.kind === 'exception') {
    const e = full && (full.exceptions || []).find((x) => x.id === item.exceptionId);
    if (e && e.kind === 'rehire_flag') {
      out.push('Not the same person as the prior record');
      out.push('The same person, and the record still stands');
      out.push('The same person, and the record does not bear on this role');
    }
    if (e && e.kind === 'adverse_review') {
      out.push('The record does not bear on the role');
      out.push('Sending the pre-adverse notice with the report and the summary of rights');
    }
  }
  if (item.kind === 'task') {
    const t = full && (full.tasks || []).find((x) => x.key === item.taskKey);
    if (t) out.push('Done at the store: ' + t.name);
  }
  if (intent === 'reject') {
    const c = full && full.screening && full.screening.readings && full.screening.readings.ours;
    ((c && c.criteria) || []).forEach((x) => {
      if (x.verdict !== 'met') out.push('Not hiring on ' + words(x.name) + ', which was ' + words(x.verdict));
    });
  }
  /* Deduped, because two branches can derive the same clause and a chip that
     appears twice reads as a bug. */
  return out.filter((v, i) => out.indexOf(v) === i);
}

/**
 * The action block. Chips, then free text, then the buttons, and the buttons
 * say what they need rather than failing on press.
 */
function actionBlock(item, full, spec) {
  const draft = DRAFT.read(item);
  const chips = chipsFor(item, full, spec.intent);
  const need = spec.needsReason;

  const area = el('textarea', {
    placeholder: need ? 'Anything the chips do not cover. This goes on the record.'
                      : 'Optional. It goes on the record.',
    'aria-label': 'The reason, in your own words'
  });
  area.value = draft.text;

  const state = el('div', { class: 'rkept' });
  const chipHost = el('div', { class: 'rchips' });

  function refresh() {
    DRAFT.write(item, draft);
    const s = DRAFT.sentence(draft);
    const short = need && s.length > 0 && s.length < 12;
    state.textContent = !s.length
      ? (need ? 'A reason is required on this move.' : 'No reason yet. It is optional here.')
      : short ? 'The engine needs at least 12 characters. This is ' + s.length + '.'
              : 'Kept for this person until you send it. ' + s.length + ' characters.';
    state.className = 'rkept' + (need && (!s.length || short) ? ' rreq' : '');
    spec.sentence = s;
    spec.ready = need ? s.length >= 12 : true;
    (spec.subs || []).forEach((f) => f());
  }

  chips.forEach((text) => {
    const on = draft.chips.indexOf(text) >= 0;
    const b = el('button', {
      class: 'rchip', type: 'button', 'aria-pressed': String(on), text,
      onclick: () => {
        const i = draft.chips.indexOf(text);
        if (i >= 0) draft.chips.splice(i, 1); else draft.chips.push(text);
        b.setAttribute('aria-pressed', String(i < 0));
        refresh();
      }
    });
    chipHost.appendChild(b);
  });

  area.addEventListener('input', () => { draft.text = area.value; refresh(); });
  refresh();

  const noChips = item.batch
    ? 'These ' + item.batch.length + ' people do not share a ground. Nothing here is true of ' +
      'all of them, so a one-tap reason would be a false record on some. Type one, or go back ' +
      'and do them one at a time.'
    : 'Nothing in this record turns into a one-tap reason, so it is typed.';

  return el('div', {}, [
    chips.length ? chipHost : el('div', { class: 'rkept', text: noChips }),
    area,
    state
  ]);
}

/* ---------------------------------------------------------- the footer ---
   The buttons. What is offered comes from `moves`, which is the engine's own
   list for this actor type, so a button that cannot work is never drawn.
   ------------------------------------------------------------------------- */

function actionsFor(item, full) {
  if (item.batch) return batchFooter(item);
  if (!full || full.error) {
    return { body: null, foot: el('span', { class: 'small faint', text: 'No action until the record loads.' }) };
  }

  const moves = full.moves || [];
  const has = (to) => moves.find((m) => m.to === to);

  if (item.kind === 'task') return taskFooter(item, full);
  if (item.kind === 'exception') return exceptionFooter(item, full);
  if (item.kind === 'clock') return clockFooter(item, full);

  if (item.kind === 'decide' && has('APPROVED')) return decideFooter(item, full);
  if (moves.length) return moveFooter(item, full, moves);
  return { body: null, foot: el('span', { class: 'small faint',
    text: 'There is nothing here for you to press. The record above says who it is waiting on.' }) };
}

/**
 * A spec is one draft shared by every button in the block.
 *
 * THE SUBSCRIBER LIST IS NOT DECORATION. An approve and a reject sit over the
 * SAME reason field, so a single `onDraft` slot meant whichever button was
 * built last owned the callback and the other one stayed disabled for ever.
 * Two buttons, one draft, both told.
 */
function makeSpec(needsReason, intent) {
  return { needsReason: !!needsReason, intent: intent || null,
           subs: [], sentence: '', ready: !needsReason };
}

/** One button, one write, one place the reason is read from. */
function pressable(label, cls, spec, run) {
  const btn = el('button', { class: 'btn ' + cls, type: 'button', text: label });
  const sync = () => {
    btn.disabled = !spec.ready;
    if (spec.ready) btn.removeAttribute('disabled'); else btn.setAttribute('disabled', '');
  };
  spec.subs.push(sync);
  sync();
  btn.addEventListener('click', async () => {
    if (!spec.ready) return;
    btn.disabled = true; btn.setAttribute('disabled', '');
    btn.textContent = 'Sending';
    report(await run(spec.sentence), label);
  });
  return btn;
}

function decideFooter(item, full) {
  /* ONE spec, so approve and reject sit over the same reason and both learn
     when it becomes long enough. The buttons are built first and the block
     second, because the block publishes the initial state to whatever has
     subscribed by then. */
  const spec = makeSpec(true, 'approve');
  const aBtn = pressable('Approve', 'primary', spec,
    (reason) => API.move(item.applicationId, 'APPROVED', reason));
  const rBtn = pressable('Reject', 'danger', spec,
    (reason) => API.move(item.applicationId, 'REJECTED', reason));
  return {
    body: actionSec(actionBlock(item, full, spec)),
    foot: el('div', { class: 'chiprow' }, [aBtn, rBtn])
  };
}

function moveFooter(item, full, moves) {
  const needs = moves.some((m) => m.needsReason);
  const spec = makeSpec(needs, null);
  const body = actionBlock(item, full, spec);
  /* Every move here reads the SAME draft, so a reason typed once serves
     whichever one is pressed. A move that needs no reason is never disabled by
     the absence of one, which is why the readiness is per button. */
  const row = el('div', { class: 'chiprow' }, moves.map((m, i) => {
    if (!m.needsReason) {
      const b = el('button', { class: 'btn ' + (i === 0 ? 'primary' : ''), type: 'button', text: m.label });
      b.addEventListener('click', async () => {
        b.disabled = true; b.setAttribute('disabled', ''); b.textContent = 'Sending';
        report(await API.move(item.applicationId, m.to, spec.sentence || null), m.label);
      });
      return b;
    }
    return pressable(m.label, i === 0 ? 'primary' : '', spec,
      (reason) => API.move(item.applicationId, m.to, reason));
  }));
  return { body: actionSec(body), foot: row };
}

function taskFooter(item, full) {
  const t = (full.tasks || []).find((x) => x.key === item.taskKey);
  const spec = makeSpec(false, null);
  const body = actionBlock(item, full, spec);
  const btn = pressable(t ? 'Mark it done' : 'No such task', 'primary', spec,
    (reason) => API.completeTask(item.applicationId, item.taskKey, reason));
  return { body: actionSec(body), foot: el('div', { class: 'chiprow' }, btn) };
}

function exceptionFooter(item, full) {
  const spec = makeSpec(true, null);
  const body = actionBlock(item, full, spec);
  const btn = pressable('Resolve it', 'primary', spec, (reason) =>
    /* `resolution` is a free string on the server and defaults to "resolved",
       so the word is the server's own and the substance is in the reason. */
    API.resolveException(item.exceptionId, reason, 'resolved'));
  return { body: actionSec(body), foot: el('div', { class: 'chiprow' }, btn) };
}

/** A clock nobody here can shorten. There is no write and saying so is the
    honest action. */
function clockFooter(item, full) {
  const c = (full.clocks || []).find((x) => x.key === item.clockKey);
  const waiting = c && c.waitingOn ? c.waitingOn : 'somebody outside this product';
  return {
    body: actionSec(el('div', { class: 'ev' }, [
      el('div', { class: 'ev-t', text: 'There is nothing to press.' }),
      el('div', { class: 'ev-d', text: 'This clock is waiting on ' + waiting +
        '. No move in the engine shortens it, so the product will not offer you one.' }),
      c && c.overridable === false
        ? el('div', { class: 'ev-cite', text: 'The record marks this clock as not overridable.' })
        : null
    ])),
    /* NO SECOND CLOSE. The panel header already carries one, and a footer
       whose only control was another Close put two of them on screen at the
       same time, three inches apart. Where a case has nothing to press, the
       footer says so instead. */
    foot: el('span', { class: 'small faint',
      text: 'Nothing to press. This one is here so you know it is running.' })
  };
}

/* ------------------------------------------------------------ the batch ---
   Multi-select in the queue gives bulk approve with a header that reads
   "Approve 3", so no second page is needed. THE NAMES SCROLL AND NEVER CLAMP.
   U-82. A batch that says "and 2 others" is a batch nobody checked.
   ------------------------------------------------------------------------- */

function batchFrame(item) {
  const loaded = item.loaded || [];
  return [
    sec('Who this is', el('div', {}, [
      el('div', { class: 'names' }, item.batch.map((r) => {
        const f = loaded.find((x) => x.row && x.row.applicationId === r.applicationId);
        const ours = f && f.screening && f.screening.readings && f.screening.readings.ours;
        return el('div', { class: 'n' }, [
          el('span', { text: r.name }),
          el('span', { class: 's', text: ours ? ours.summary : (f ? 'no reading attached' : 'reading') })
        ]);
      })),
      el('div', { class: 'rkept', text: 'Every name in the set is listed. Nothing here is summarised as "and others".' })
    ])),
    sec('Why it is here', el('div', { class: 'ev' }, [
      el('div', { class: 'ev-t', text: 'All ' + item.batch.length + ' finished screening and are waiting on you.' }),
      el('div', { class: 'ev-d', text: 'One reason goes on all ' + item.batch.length +
        ' records. If the ground is not the same for each of them, do them one at a time.' })
    ])),
    sec('The evidence', el('div', {}, loaded.map((f) => {
      if (!f || f.error) return null;
      const ours = f.screening && f.screening.readings && f.screening.readings.ours;
      if (!ours) return null;
      return el('div', { class: 'ev' }, [
        el('div', { class: 'ev-t' }, [
          el('span', { text: f.candidate ? f.candidate.name : f.row.name }),
          el('span', { class: 'chip', text: ours.recommendation || '' }),
          ownerChip(ours.isModel ? 'agent' : 'system', ours.isModel ? 'A model read this' : 'No model ran')
        ]),
        el('div', { class: 'ev-d', text: ours.summary || '' }),
        el('div', { class: 'ev-cite', text: (ours.criteria || [])
          .map((c) => words(c.name) + ' ' + words(c.verdict)).join(', ') })
      ]);
    }))),
    sec('What happens next', el('div', { class: 'ev' }, [
      el('div', { class: 'ev-t', text: 'Each approval creates an offer for that person.' }),
      el('div', { class: 'ev-d', text: 'The engine moves an approved application straight to "Offer ready to send", so after this there are ' +
        item.batch.length + ' offers to send. Each one is a separate move and it is confirmed rather than automatic.' })
    ]))
  ];
}

function batchFooter(item) {
  const spec = makeSpec(true, 'approve');
  /* The item carries every loaded payload, and chipsFor intersects them, so
     only a ground true of the whole set is offered. */
  const body = actionBlock(item, null, spec);
  const btn = pressable('Approve ' + item.batch.length, 'primary', spec, async (reason) => {
    const results = [];
    for (const r of item.batch) {
      /* Sequential on purpose. Each approval fans out effects on the server
         and a refusal on one must not be lost inside a race. */
      const res = await API.move(r.applicationId, 'APPROVED', reason);
      results.push({ row: r, res });
    }
    const bad = results.filter((x) => !x.res.ok);
    return {
      ok: !bad.length,
      error: bad.length ? bad.map((x) => x.row.name + ': ' + x.res.error).join('\n') : null,
      data: { batch: results }
    };
  });
  return {
    body: actionSec(body, 'one reason, all ' + item.batch.length + ' records'),
    foot: el('div', { class: 'chiprow' }, btn)
  };
}

/* --------------------------------------------------------- the aftermath ---
   A refusal is rendered VERBATIM with whatever the engine offered instead. A
   success says what moved and what the engine did next, because an approval
   silently becomes "Offer ready to send" and a manager who is not told that
   thinks the job is finished.
   ------------------------------------------------------------------------- */

/** The move every member of a finished batch has in common, or null. Read out
    of the replies, so a move nobody was offered is never proposed. */
function commonMove(batch) {
  const lists = batch.map((x) => ((x.res.data && x.res.data.moves) || []));
  if (!lists.length || lists.some((l) => !l.length)) return null;
  return lists[0].find((m) => lists.every((l) => l.some((n) => n.to === m.to))) || null;
}

/**
 * A BATCH FOLLOW-ON IS OFFERED ONCE AND THEN NEVER AGAIN.
 *
 * Approving three people creates three offers, and sending those three is
 * bookkeeping on one decision a person already made, so it belongs in the same
 * frame. What came next on screen was "Offer accepted, all 3", because the
 * engine lets a human record an acceptance and the chain kept going. Three
 * acceptances are three different people's answers, and a one-tap way to
 * record all three is a one-tap way to invent them.
 *
 * So the chain is one deep. After that the manager goes back to the queue and
 * the offers come back as rows, one person at a time.
 */
function report(r, label, depth) {
  const h = build();
  if (!r.ok) {
    put(h.bd, [
      el('div', { class: 'refuse' }, [
        el('div', { class: 'refuse-t', text: label + ' was refused.' }),
        el('div', { class: 'refuse-d', text: r.error })
      ]),
      r.allowed && r.allowed.length ? el('div', { class: 'dsec' }, [
        el('div', { class: 'h', text: 'What you could do instead' }),
        el('div', { class: 'chiprow' }, r.allowed.map((m) => el('span', { class: 'chip' }, [
          el('span', { text: m.label }),
          m.needsReason ? el('span', { class: 'v', text: 'reason' }) : null
        ])))
      ]) : null,
      el('div', { class: 'rkept', text: 'Your reason is still kept. Nothing was sent.' })
    ]);
    /* One control, and it is the useful one. The panel header already has a
       Close; a second one beside "Back to the record" made the way out look
       like the way forward. */
    put(h.ft, el('div', { class: 'chiprow' }, [
      el('button', { class: 'btn', type: 'button', text: 'Back to the record',
                     onclick: () => { const it = current; if (it) open(it); } })
    ]));
    return;
  }

  /* Done. The draft has served its purpose and is dropped, which is the only
     place it is dropped. */
  const item = current;
  DRAFT.drop(item);
  const d = r.data || {};
  const lines = [];
  if (d.batch) {
    /* One sentence each, ended. Joined with a space and no full stop, three
       names ran together as "Jerome Kettleworth is now Offer ready to send Ines
       Duarte is now Offer ready to send". Seen on screen. */
    d.batch.forEach((x) => lines.push(x.row.name + ' is now ' +
      ((x.res.data && x.res.data.label) || 'unchanged, and the refusal is above') + '.'));
  } else {
    if (d.from && d.to) lines.push('Moved from ' + d.from + ' to ' + d.to + '.');
    if (d.label) lines.push('They are now: ' + d.label + '.');
    if (d.task) lines.push(d.task.name + ' is done.');
    if (d.exception) lines.push('The flag is resolved and the reason is on the record.');
    if (d.remaining && d.remaining.length) lines.push(d.remaining.length + ' tasks still open on this person.');
    if (d.autoMoves && d.autoMoves.length) lines.push('The engine then moved it on by itself: ' + d.autoMoves.join(', ') + '.');
    if (d.stoppedBecause) lines.push(d.stoppedBecause);
  }
  /* THE FOLLOW-ON MOVE, FOR A BATCH TOO. An approval becomes "Offer ready to
     send", and the queue as the server builds it does not carry that state at
     all, so without this the three offers a manager just created would be
     invisible until somebody searched for them. The move offered is the one
     every member of the set has in common, read out of each write's own reply
     rather than assumed. */
  const shared = d.batch && !depth ? commonMove(d.batch) : null;

  put(h.bd, [
    el('div', { class: 'done-ok' }, [
      el('div', { class: 't', text: label + ' went through.' }),
      el('div', { class: 'd', text: lines.join(' ') })
    ]),
    shared ? el('div', { class: 'dsec' }, [
      el('div', { class: 'h', text: 'And the next move is yours, on all ' + d.batch.length }),
      el('div', { class: 'chiprow' }, (() => {
        const b = el('button', { class: 'btn primary', type: 'button',
                                 text: shared.label + ', all ' + d.batch.length });
        b.addEventListener('click', async () => {
          b.disabled = true; b.setAttribute('disabled', ''); b.textContent = 'Sending';
          const results = [];
          for (const x of d.batch) {
            results.push({ row: x.row,
              res: await API.move(x.row.applicationId, shared.to,
                shared.needsReason ? 'Following on from ' + label + '.' : null) });
          }
          const bad = results.filter((y) => !y.res.ok);
          report({ ok: !bad.length, data: { batch: results },
                   error: bad.length ? bad.map((y) => y.row.name + ': ' + y.res.error).join('\n') : null },
                 shared.label, (depth || 0) + 1);
        });
        return b;
      })())
    ]) : null,
    /* One person's chain runs two moves deep at most: approve, then send the
       offer. Recording one candidate's own answer afterwards is a real thing a
       manager does off a phone call, and walking the whole state machine
       inside one drawer is not. Past that, the queue is the way. */
    d.moves && d.moves.length && (depth || 0) < 2 ? el('div', { class: 'dsec' }, [
      el('div', { class: 'h', text: 'And the next move is yours' }),
      el('div', { class: 'chiprow' }, d.moves.map((m, i) => {
        const b = el('button', { class: 'btn ' + (i === 0 ? 'primary' : ''), type: 'button', text: m.label });
        b.addEventListener('click', async () => {
          b.disabled = true; b.setAttribute('disabled', ''); b.textContent = 'Sending';
          report(await API.move(item.applicationId, m.to,
            m.needsReason ? 'Following on from ' + label + '.' : null),
            m.label, (depth || 0) + 1);
        });
        return b;
      }))
    ]) : null
  ]);
  put(h.ft, el('div', { class: 'chiprow' }, [
    el('button', { class: 'btn primary', type: 'button', text: 'Back to the queue',
                   onclick: () => { close(); if (handlers.onDone) handlers.onDone(item, r); } })
  ]));
  if (handlers.onRecorded) handlers.onRecorded(item, r, lines.join(' '));
}
