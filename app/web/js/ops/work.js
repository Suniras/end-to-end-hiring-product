/* ============================================================================
   ops/work.js  ·  MODE 1, WORK. The first screen, and ninety five per cent of
                   the use of this product

   THE FIRST SCREEN IS THE QUEUE, NOT A DECK. It opens on "11 need you at
   #0417 Ridgeway". The old shape led with a computed sentence about how many
   arrivals were handled without a person, then a strip of three metrics, and
   only then the name that had to be rung in the next hour. That ordering is
   for the person buying the product. The manager is the one with ninety
   seconds.

   ONE ROW SHAPE FOR ALL ELEVEN ROWS, WHATEVER PRODUCED THEM. A decision, an
   offer about to lapse, a background-check flag, a badge nobody issued and a
   statutory clock all render as: who, the verb, what it costs and when. The
   server ranks them by cost of delay and this file does not re-rank them,
   because a second opinion about the order held in a browser is how the queue
   and the strip start disagreeing.

   A STATE NAME IS NEVER THE PRIMARY TEXT. "Screening in progress" tells a
   manager nothing. `verb` is what renders, and `stateLabel` only ever appears
   as a quiet second line.

   THE SECOND BAND IS THE PLATFORM'S OWN WORK LIST. Nineteen things we owe, of
   which three are blocking a signature the manager owns. Nothing in the old
   ten surfaces had a home for that, and it is the honest half of the argument:
   a manager waiting on a signature can see the hold-up is ours.

   THE THIRD BAND IS WHAT THIS VISIT CHANGED. It exists because an approval
   moves somebody to "Offer ready to send", and the queue as the server builds
   it does not carry that state at all, so without this band the loop the
   manager just opened closes off screen. Every line in it is read out of the
   write's own response.
   ============================================================================ */

import { el, clear, put, band, foldBand, empty, dur, rel, atStore, atStoreFull,
         sameStoreDay, plural, ownerChip, toneChip, glyph, tick } from './dom.js';
import * as API from './api.js';
import * as DRAFT from './draft.js';
import * as DRAWER from './drawer.js';
/* The row's shape lives in ONE place. See ops/rows.js: `kind` is on the reason
   and the cost and the deadline have to come from the same reason. */
import { acting, primaryReason, COST_SAYS, COST_TAG, toneOf } from './rows.js';

/* Selection for the batch, and the filter. Module state rather than a store,
   because it is two values and it dies with the tab. */
let picked = [];
let filter = 'all';
let selecting = false;
const done = [];   /* What this visit changed, newest first. */

export function recordDone(item, result, sentence) {
  done.unshift({
    at: API.now(),
    name: item.batch ? 'Approve ' + item.batch.length : (item.name || item.applicationId),
    applicationId: item.applicationId || null,
    what: sentence
  });
  picked = [];
  selecting = false;
}

/* ------------------------------------------------------------------ paint --- */

/* THREE SURFACES, ONE QUEUE, and the narrowing is the caller's.

   Operations is everything. Decide is the rows whose acting reason is a
   decision, which is the one move only a person may make. Flags is the rows
   raised as exceptions. All three read /api/work and none of them re-ranks it,
   because a second opinion about the order held in a browser is how a list and
   the strip above it start disagreeing.

   THE THIRD ARGUMENT USED TO BE DROPPED. app.js has always passed
   `{ only: 'exception' }` for Flags and this function took two parameters, so
   Flags rendered the whole queue and was Operations with a different word in
   the rail. */
const VIEWS = {
  all: {
    h1: 'Operations',
    lede: 'Everything a named person owns, in one list, ordered by what it costs to leave it ' +
          'rather than by how long it has sat.',
    section: 'Needs your attention',
    match: null
  },
  decide: {
    h1: 'Decisions',
    lede: 'Applications where screening is finished and the next move is yours. Approving and ' +
          'rejecting are the two things in this product that only a person may do.',
    section: 'Waiting on your decision',
    match: (row) => hasDecide(row)
  },
  exception: {
    h1: 'Flags',
    lede: 'Everything that stopped and raised a flag: a background check result, a contested ' +
          'E-Verify case, a connector that failed. Each one names what raised it.',
    section: 'Flagged',
    match: (row) => (row.reasons || []).some((r) => r.kind === 'exception')
  }
};

export async function render(host, shell, opts) {
  const view = VIEWS[(opts && opts.only) || 'all'] || VIEWS.all;
  put(host, el('div', {}, [
    band('Reading your queue', null,
      el('p', { class: 'copy muted',
                text: 'One sweep of everything a named person owns at ' +
                      (shell.scope ? shell.scope.label : 'your stores') + '.' }))
  ]));

  const r = await API.get(API.ROUTES.work());
  if (!r.ok) {
    put(host, el('div', { class: 'fail' }, [
      el('div', { class: 'fail-what', text: 'The queue did not load.' }),
      el('pre', { class: 'fail-err', text: r.error })
    ]));
    return;
  }
  if (shell.onCount) shell.onCount((r.data && r.data.count) || 0);
  /* The chip filter is per visit, not per surface. Landing on Decide with
     "Overdue" still pressed from Operations is a count that does not match the
     list, which is the one thing this queue may not do. */
  if (view !== lastView) { filter = 'all'; lastView = view; }
  paint(host, r.data, shell, view);
}

let lastView = VIEWS.all;

function paint(host, w, shell, view) {
  const v = view || VIEWS.all;
  const all = w.rows || [];
  /* The surface narrows first, then the chip narrows what is left, so the
     counts on the chips are counts of THIS page rather than of the whole queue. */
  const rows = v.match ? all.filter(v.match) : all;
  const strip = w.strip || {};
  const owe = w.waitingOnUs || { rows: [], count: 0, blockingAHuman: 0 };

  const week = API.now() + 7 * 86400000;
  const shown = rows.filter((row) =>
    filter === 'all' ? true :
    filter === 'overdue' ? row.overdue :
    filter === 'losing' ? row.cost === 'lost_hire' :
    filter === 'due' ? (!row.overdue && row.loseBy <= week) :
    filter === 'owed' ? false : true);

  const parts = [];

  parts.push(pageHead(v, shell));

  /* THE METRICS BELONG TO OPERATIONS AND NOWHERE ELSE.

     They are the server's counts of the WHOLE queue. On Flags that put "11
     Need your attention" directly above a list of 7 and a chip reading "All
     7", which is three numbers on one screen describing two different sets. A
     narrowed surface carries its own counts on the chips and nothing else: the
     alternative is a second arithmetic in the browser, and a strip and a list
     that disagree is exactly what this queue may not do. */
  if (v === VIEWS.all) parts.push(el('div', { class: 'ops-stats' }, [
    statBtn(strip.needsYou, 'Need your attention', 'all',
            'Everything below, whoever it is waiting on', null, host, w, shell, v),
    statBtn(strip.overdue, 'Past their deadline', 'overdue',
            'Already late, ranked by what it costs', strip.overdue ? 'is-crit' : 'is-good',
            host, w, shell, v),
    statBtn(strip.losingAHire, 'Losing a hire', 'losing',
            'An offer lapsing or a decision nobody made', strip.losingAHire ? 'is-warn' : 'is-good',
            host, w, shell, v),
    statBtn(owe.count, 'Waiting on us', 'owed',
            (owe.blockingAHuman || 0) + ' of them are blocking you', null, host, w, shell, v)
  ]));


  /* The worst thing, in the server's own sentence, so the line and the ranking
     cannot disagree. */
  if (v === VIEWS.all && filter === 'all' && strip.worst) {
    parts.push(el('p', { class: 'copy muted', text: strip.worst }));
  }

  /* THE QUEUE. */
  const decideRows = rows.filter(hasDecide);
  /* `.btn.sm`, not `.ops-ico`. That class is for an icon-only control and this
     is a two word text button, so the queue had one button shaped unlike every
     other button on the page. */
  const selectBtn = decideRows.length > 1 ? el('button', {
    class: 'btn sm', type: 'button', 'aria-pressed': String(selecting),
    text: selecting ? 'Done selecting' : 'Select decisions',
    onclick: () => { selecting = !selecting; if (!selecting) picked = []; paint(host, w, shell, v); }
  }) : null;

  /* THE FILTERS, above the queue and not inside it. */
  parts.push(filterChips(rows, owe, host, w, shell, v));

  /* THE QUEUE, as a real table with columns that carry different weight. The
     review's complaint was that everything in a row had the same visual
     weight, so nothing could be scanned. Six columns: who, the role, what
     needs doing, how urgent, when, and the action. The name is the strongest
     thing, the verb is the descriptive content, and the deadline is mono so a
     column of them reads down. It reflows to stacked rows on a phone. */
  if (filter === 'owed') {
    parts.push(el('section', { class: 'ops-sec' }, [
      el('div', { class: 'ops-sec-hd' }, [
        el('h2', { text: 'Waiting on us' }),
        el('span', { class: 'n', text: String(owe.count) }),
        el('span', { class: 'say',
                     text: owe.blockingAHuman
                       ? owe.blockingAHuman + ' of these are blocking something you own'
                       : 'None of these is blocking you' })
      ]),
      el('p', { class: 'lede prose',
                text: 'Work the software owns and has not done. These are not yours. They are ' +
                      'here so that a signature you are waiting to give is visibly not your ' +
                      'fault yet.' }),
      el('div', { class: 'ops-owed' }, oweBody(owe))
    ]));
  } else {
    parts.push(el('section', { class: 'ops-sec' }, [
      el('div', { class: 'ops-sec-hd' }, [
        el('h2', { text: v.section }),
        el('span', { class: 'n',
                     text: shown.length === rows.length ? String(rows.length)
                                                        : shown.length + ' of ' + rows.length }),
        selectBtn ? el('span', { class: 'say' }, selectBtn) : null
      ]),
      el('p', { class: 'lede prose',
                text: 'Sorted by what it costs to leave it: a statutory deadline first, then a ' +
                      'hire you could lose, then somebody who is blocked, then time.' }),
      shown.length
        ? el('div', { class: 'ops-q' }, queueTable(shown, host, w, shell, v))
        : el('div', { class: 'ops-q' }, rows.length
            ? empty('Nothing matches that filter.',
                    'The other ' + (rows.length - shown.length) + ' rows are still there. ' +
                    'Pick All to see them.')
            : (v === VIEWS.all ? emptyQueue(owe) : emptyView(v, owe)))
    ]));
  }

  /* WAITING ON US, folded, unless the filter has already made it the subject.
     A visibly different band, because it is a different claim about who owns
     what. Sunken rather than raised: this is not work the reader can pick up. */
  if (v === VIEWS.all && filter !== 'owed' && owe.count) {
    parts.push(el('section', { class: 'ops-sec' }, [
      el('div', { class: 'ops-sec-hd' }, [
        el('h2', { text: 'Waiting on us' }),
        el('span', { class: 'n', text: String(owe.count) }),
        el('span', { class: 'say', text: owe.blockingAHuman
          ? owe.blockingAHuman + ' blocking something you own' : 'None blocking you' })
      ]),
      el('div', { class: 'ops-owed' }, [
        el('div', { class: 'ops-owed-hd' }, [
          el('div', { class: 't', text: 'The software owns these, not you.' }),
          el('div', { class: 's',
                      text: 'They are listed so a signature you are waiting to give is visibly ' +
                            'not your fault yet.' })
        ]),
        oweBody(owe)
      ])
    ]));
  }

  if (done.length) {
    parts.push(band('What you changed just now', done.length,
      el('div', { class: 'rows' }, done.map((d) => el('div', { class: 'did' }, [
        el('div', { class: 'did-mid' }, [
          el('div', { class: 'did-name', text: d.name }),
          el('div', { class: 'did-what', text: d.what || 'Recorded.' })
        ]),
        el('span', { class: 'owe-age', text: atStore(d.at) })
      ]))),
      { flush: true }));
  }

  put(host, el('div', {}, parts));

  /* THE BATCH BAR, sticky above the thumb bar so the count never scrolls away
     from the thing it counts. */
  const old = document.getElementById('batchbar');
  if (old) old.remove();
  if (picked.length) {
    /* The batch carries the ROW OBJECTS, not the ids, because the drawer draws
       every name from them and a batch that cannot name its members is a batch
       nobody checked. U-82. */
    const chosen = picked.map((id) => rows.find((x) => x.applicationId === id)).filter(Boolean);
    document.body.appendChild(el('div', { class: 'batch', id: 'batchbar' }, [
      el('span', { class: 't', text: chosen.map((r) => r.name).join(', ') }),
      el('button', {
        class: 'btn primary', type: 'button', text: 'Approve ' + chosen.length,
        onclick: () => DRAWER.open({ batch: chosen, kind: 'batch-decide' })
      })
    ]));
  }
}

/* THE PAGE HEADER.

   The brief asks for this shape and it is the right one:

     Operations
     #0417 Ridgeway, Ridgeway OH
     Store manager: Marcus Hale

   WHAT IT REPLACES. A store number was doing the job of a heading, so a reader
   could not tell which page they were on, and the store's town was nowhere at
   all because the session carried a label and a list of ids and no places. It
   does now.

   Field HR holds five stores rather than one, so the second line counts them
   instead of naming one, and the third line drops: there is no single manager
   of five stores and inventing one would be the same class of mistake this
   product is built to avoid. */
function pageHead(v, shell) {
  const scope = shell.scope || {};
  const places = scope.stores || [];
  const one = places.length === 1 ? places[0] : null;
  const where = one
    ? one.name + (one.city ? ', ' + one.city + (one.state ? ' ' + one.state : '') : '')
    : (places.length ? places.length + ' stores, ' + scope.label : scope.label || null);

  return el('div', { class: 'ops-hd' }, [
    el('div', { class: 'ops-hd-top' }, [
      el('div', { class: 'col tight' }, [
        el('h1', { text: v.h1 }),
        where ? el('p', { class: 'where', text: where }) : null,
        (one && one.manager)
          ? el('p', { class: 'who', text: 'Store manager: ' + one.manager })
          : (shell.actor ? el('p', { class: 'who',
              text: shell.actor.role + ': ' + shell.actor.name }) : null)
      ])
    ]),
    el('p', { class: 'lede prose', text: v.lede }),
    el('div', { class: 'meta' }, [
      /* Only when the signed-in person is NOT the manager named above. At
         #0417 Ridgeway they are the same person and the header printed
         "Marcus Hale" twice, three lines apart. */
      (shell.actor && !(one && one.manager === shell.actor.name))
        ? el('span', {}, [document.createTextNode('Signed in as '),
                          el('b', { text: shell.actor.name }),
                          document.createTextNode(', ' + shell.actor.role)])
        : null,
      el('span', {}, [document.createTextNode('Store time '),
                      el('b', { text: atStoreFull(API.now()) })])
    ])
  ]);
}

function statBtn(value, label, mode, sub, tone, host, w, shell, v) {
  /* ONE NUMBER LIT AT MOST, AND NONE WHEN NOTHING IS NARROWED.

     Two arrangements were wrong before this one. Lighting the "all" number
     whenever no filter was on made the strip read as already filtered. Lighting
     it whenever a filter WAS on, as a way back, put two cells in the pressed
     state at once: pressing Overdue lit both "Past their deadline" and "Need
     your attention", and a person cannot tell from that which one they pressed.

     So the three narrowing numbers light when they are the narrowing, and the
     first one never lights. The way back is the All chip below, which does show
     its own state correctly. */
  const on = mode !== 'all' && filter === mode;
  return el('button', {
    class: 'ops-stat' + (tone ? ' ' + tone : ''), type: 'button',
    'aria-pressed': String(on), 'data-filter': mode,
    onclick: () => { filter = filter === mode ? 'all' : mode; paint(host, w, shell, v); }
  }, [
    el('span', { class: 'top' }, el('span', { class: 'v', text: value == null ? '0' : String(value) })),
    el('span', { class: 'l', text: label }),
    el('span', { class: 's', text: sub || '' })
  ]);
}

/* The filters, as chips with an unambiguous pressed state. The brief asked for
   these by name. `due` is anything inside seven days that is not already late,
   which is the only one of the five that is not already a field on the row. */
function filterChips(rows, owe, host, w, shell, v) {
  const week = API.now() + 7 * 86400000;
  const defs = [
    { key: 'all',     label: 'All',            n: rows.length },
    { key: 'overdue', label: 'Overdue',        n: rows.filter((r) => r.overdue).length },
    { key: 'losing',  label: 'Losing a hire',  n: rows.filter((r) => r.cost === 'lost_hire').length },
    { key: 'due',     label: 'Due this week',  n: rows.filter((r) => !r.overdue && r.loseBy <= week).length }
  ];
  /* Waiting on us is the whole queue's second band, not a narrowing of this
     one. On Flags it offered a chip reading 19 that turned a list of 7 flagged
     rows into a list of 19 tasks the software owns, which is a different page. */
  if (v === VIEWS.all) defs.push({ key: 'owed', label: 'Waiting on us', n: owe.count });
  return el('div', { class: 'ops-filters' }, defs.map((d) => el('button', {
    class: 'ops-chip', type: 'button',
    'aria-pressed': String(filter === d.key),
    'data-filter': d.key,
    onclick: () => { filter = d.key; paint(host, w, shell, v); }
  }, [
    el('span', { text: d.label }),
    el('span', { class: 'c', text: String(d.n) })
  ])));
}

function hasDecide(row) {
  return (row.reasons || []).some((r) => r.kind === 'decide');
}

/* --------------------------------------------------------------- the row ---
   Four things: who, the verb, what it costs and when. Nothing else at rest.
   ------------------------------------------------------------------------- */

function queueRow(raw, host, w, shell, v) {
  /* The acting reason supplies BOTH the cost and the deadline, so a row never
     prints one reason's cost against another reason's clock. See ops/rows.js. */
  const row = acting(raw);
  const left = row.loseBy - API.now();
  const selectable = selecting && hasDecide(row);
  const on = picked.indexOf(row.applicationId) >= 0;
  const kept = DRAFT.has(row);

  const openIt = () => {
    if (selectable) {
      const i = picked.indexOf(row.applicationId);
      if (i >= 0) picked.splice(i, 1); else picked.push(row.applicationId);
      paint(host, w, shell, v);
      return;
    }
    DRAWER.open(raw);
  };

  return el('tr', {
    'data-app': row.applicationId,
    'data-cost': row.cost,
    'aria-selected': selectable ? String(on) : null,
    onclick: openIt
  }, [
    /* WHO. The strongest thing in the row. */
    cell('c-who', el('div', { class: 'q-who' }, [
      selectable
        ? el('span', { class: 'row-box' + (on ? ' on' : ''), 'aria-hidden': 'true' }, on ? tick() : null)
        : el('span', { class: 'q-av', text: row.initials || '?' }),
      el('div', { class: 'col tight' }, [
        el('div', { class: 'q-name', text: row.name || row.applicationId }),
        kept ? el('div', { class: 'q-also', text: 'draft kept' }) : null
      ])
    ])),

    /* THE ROLE, which is what they applied for. Secondary weight. The store is
       added underneath only when the viewer holds more than one, because for
       field HR the store is what distinguishes two otherwise identical rows and
       for a store manager it is the same word on every row. */
    cell('c-role', el('div', {}, [
      el('div', { class: 'q-role', text: row.role || '' }),
      (shell.scope && shell.scope.storeIds && shell.scope.storeIds.length > 1)
        ? el('div', { class: 'q-also', text: row.storeName || '' }) : null
    ])),

    /* WHAT. The main descriptive content, and it is a verb rather than a state
       name. "Screening in progress" tells a manager nothing. */
    cell('c-what', el('div', {}, [
      el('div', { class: 'q-verb', text: row.verb }),
      row.because ? el('div', { class: 'q-why', text: row.because }) : null,
      row.alsoNeeds > 0
        ? el('div', { class: 'q-also', text: 'and ' + row.alsoNeeds + ' more on this person' })
        : null
    ])),

    /* STATUS. What it costs to leave this, as a word and a colour together,
       and under it where the application actually is in the twenty steps. The
       cost word is never on its own and the colour is never on its own. */
    cell('c-cost', el('div', { class: 'col tight' }, [
      el('span', { class: 'q-cost c-' + row.cost }, COST_TAG[row.cost] || 'Time'),
      row.stateLabel ? el('span', { class: 'q-state', text: row.stateLabel }) : null
    ])),

    /* WHEN. Mono and tabular, so a column of deadlines reads down. */
    cell('c-due', el('div', { class: 'q-due' + (left <= 0 ? ' is-over' : '') }, [
      el('span', { class: 'rel', text: left <= 0 ? 'past' : dur(left) }),
      el('span', { class: 'abs', text: whenWords(row.loseBy, left) })
    ])),

    /* THE ACTION, AS A REAL BUTTON.

       It was a span styled as one inside a row carrying tabindex, so the only
       keyboard affordance on the queue was a table row that no screen reader
       announces as pressable. The row still opens on click, because that is
       what a person does with a mouse, and the button is the tab stop and the
       accessible name. */
    cell('c-act', el('button', {
      class: 'btn sm', type: 'button',
      'aria-label': (selectable ? (on ? 'Deselect ' : 'Select ') : 'Take action on ') +
                    (row.name || row.applicationId),
      onclick: (e) => { e.stopPropagation(); openIt(); }
    }, selectable ? (on ? 'Chosen' : 'Choose') : 'Take action'))
  ]);
}

function costChip(cost, left) {
  const tone = toneOf(cost);
  const value = left <= 0 ? 'past' : dur(left);
  const says = COST_SAYS[cost] || 'time';
  if (!tone) {
    return el('span', { class: 'chip' }, [
      el('span', { class: 'v', text: value }), el('span', { text: says })
    ]);
  }
  return toneChip(tone, value, says);
}

/** The deadline itself, next to the cost, in store time. A countdown with no
    instant beside it cannot be checked against anything. */
function whenWords(loseBy, left) {
  if (loseBy == null) return '';
  const same = sameStoreDay(loseBy, API.now());
  const when = same ? atStore(loseBy) : atStoreFull(loseBy);
  return left <= 0 ? 'was due ' + when : 'by ' + when;
}

/* --------------------------------------------------------- waiting on us --- */

function oweBody(owe) {
  const rows = owe.rows || [];
  if (!rows.length) {
    return empty('The platform owes nothing here.',
                 'Every task the software owns and could start has been started.');
  }
  /* One entry per person, with the blocking task named. */
  const byApp = new Map();
  rows.forEach((t) => {
    if (!byApp.has(t.applicationId)) {
      byApp.set(t.applicationId, { name: t.name, applicationId: t.applicationId,
                                   tasks: [], blocking: [], oldest: 0 });
    }
    const g = byApp.get(t.applicationId);
    g.tasks.push(t);
    if (t.blocksAHuman) g.blocking.push(t);
    if (t.waitingMs > g.oldest) g.oldest = t.waitingMs;
  });
  const groups = Array.from(byApp.values()).sort((a, b) => b.oldest - a.oldest);
  return el('div', {}, [
    el('div', { class: 'rows' }, groups.map((g) => el('div', { class: 'owe' }, [
      glyph('system'),
      el('div', { class: 'owe-mid' }, [
        el('div', { class: 'owe-name', text: g.name || g.applicationId }),
        el('div', { class: 'owe-what',
                    text: g.tasks.length + ' ' + plural(g.tasks.length, 'thing', 'things') +
                          ' the software owns and has not done: ' +
                          g.tasks.map((t) => t.task).join(', ') + '.' }),
        g.blocking.length
          ? el('div', { class: 'owe-blocks',
                        text: g.blocking.map((t) => t.task).join(' and ') +
                              ' is holding up a task that is yours.' })
          : null
      ]),
      el('span', { class: 'owe-age', text: dur(g.oldest) })
    ]))),
    el('div', { class: 'band-note',
                text: 'These are ours, not yours. They are here so a signature you are waiting to give ' +
                      'is visibly not your fault yet. ' + owe.count + ' in total, ' +
                      owe.blockingAHuman + ' of them blocking a person.' })
  ]);
}

/** A narrowed page with nothing in it says what the narrowing was. */
function emptyView(v, owe) {
  return empty(
    v === VIEWS.decide ? 'No decision is waiting on you.' : 'Nothing is flagged.',
    v === VIEWS.decide
      ? 'Every application that has finished screening has already been decided. New ones arrive '
        + 'here as calls complete.'
      : 'No background check, E-Verify case or connector has stopped anything at your stores.',
    owe.count + ' things are running without you right now');
}

/** An empty queue says what the platform did instead. U-08. */
function emptyQueue(owe) {
  return empty(
    'Nothing needs you.',
    'Every application at your stores is either moving on its own or waiting on somebody who is not you.',
    owe.count + ' things are running without you right now, ' +
    owe.blockingAHuman + ' of which will come back to you when they finish.');
}

/* --------------------------------------------------------------- the table ---
   Six columns, six different weights. On a phone the header is hidden and each
   row becomes a small stack, which is why every cell carries a class naming
   what it is rather than relying on its position.
   ------------------------------------------------------------------------- */

function queueTable(shown, host, w, shell, v) {
  return el('table', {}, [
    /* A colgroup rather than widths on the cells, so a width is declared once
       for the column and not repeated on every row. */
    el('colgroup', {}, ['w-who', 'w-role', 'w-what', 'w-cost', 'w-due', 'w-act']
      .map((c) => el('col', { class: c }))),
    el('thead', {}, el('tr', {}, [
      el('th', { scope: 'col', text: 'Candidate' }),
      el('th', { scope: 'col', text: 'Role' }),
      el('th', { scope: 'col', text: 'What needs your attention' }),
      /* STATUS, not URGENCY. The cell carries both: the cost word, which is
         what makes the ranking legible, and the workflow state under it, which
         is where in the twenty steps this person actually is. They answer
         different questions and the column used to answer only the first. */
      el('th', { scope: 'col', text: 'Status' }),
      el('th', { scope: 'col', text: 'Due' }),
      el('th', { scope: 'col', text: 'Action' })
    ])),
    el('tbody', {}, shown.map((row) => queueRow(row, host, w, shell, v)))
  ]);
}

function cell(cls, kids) { return el('td', { class: cls }, kids); }
