/* ============================================================================
   ops/person.js  ·  MODE 2, PERSON. One human being

   REACHED BY CLICKING ANY NAME ANYWHERE, or by searching one. Second most used
   mode, and it is also the artefact a candidate's lawyer asks for: what
   happened to this person, in order, with who did each thing and why.

   THE TWENTY STEP JOURNEY IS THE SPINE, ON ONE SHARED TIME AXIS. Every bar is
   positioned by its own instants against a single scale that runs from the
   application to now, so where two steps overlap the overlap is visible. That
   is the whole reason the bars exist: a list of twenty durations one under the
   other says nothing about whether the product was doing two things at once or
   nothing at all.

   SOLID IS RECORDED WORK, HATCHED IS WAITING, and both come from app.css so
   this is the same encoding the funnel uses. Not a lighter tint: with the fill
   set from var(--owner) a tint puts --system-line beside --system, and where
   two bars overlap one bar's tinted wait and another's solid work land at
   similar luminance and read as one shape.

   THE SPLIT INSIDE A STEP IS A PROPORTION, NOT A SEQUENCE, and the caption
   says so. The payload gives workMs and queueMs for a step but not when
   within the step the work happened, so drawing the solid part first would
   assert an order the data does not hold. Saying which of the two it is costs
   one line of caption and buys a chart nobody has to be warned about.

   EVERY UNOBSERVED THING IS MARKED. Where a step's end was inferred from a
   later step rather than recorded, it carries the dashed badge and names the
   step it was inferred from. Where the screening was replayed from the seed
   rather than dialled, it says so in the payload's own words. A fallback is
   never described as a model.

   THE AUDIT TRAIL IS CONTIGUOUS AT THE FOOT, and the why is never dropped.
   Where the record holds no reason the row says so rather than leaving a gap,
   because a blank in a compliance artefact reads as an omission by whoever is
   holding it.
   ============================================================================ */

import { el, put, band, foldBand, empty, dur, durLong, pct, atStore, atStoreFull,
         atUTC, cap, ownerChip, toneChip, simBadge, simNote, glyph } from './dom.js';
import * as API from './api.js';
import * as DRAWER from './drawer.js';
/* One page header component for the whole operator side, so the h1, the store
   line and the manager line cannot differ from page to page. */
import { pageHeader } from './show.js';

export async function render(host, shell, applicationId) {
  put(host, band('Reading the record', null,
    el('p', { class: 'copy muted', text: 'Twenty steps, every event, and the audit trail.' })));

  const r = await API.get(API.ROUTES.application(applicationId));
  if (!r.ok) {
    put(host, el('div', { class: 'fail' }, [
      el('div', { class: 'fail-what', text: 'That record did not load.' }),
      el('pre', { class: 'fail-err', text: r.error })
    ]));
    return;
  }
  paint(host, r.data, shell);
}

function paint(host, d, shell) {
  const app = d.application || {};
  const c = d.candidate || {};
  const q = d.requisition || {};
  const steps = d.steps || [];
  const m = d.metrics || {};
  const parts = [];

  /* Who, and where they are. */
  parts.push(el('div', { class: 'who' }, [
    el('span', { class: 'who-disc', 'aria-hidden': 'true', text: c.initials || '?' }),
    el('div', { class: 'who-mid' }, [
      /* AN h1. This page is about one person and their name is its heading, so
         it has to be the heading element as well as the largest words. Every
         other operator surface opens with an h1 and this one opened with a
         div, which is a page a screen reader cannot announce the subject of. */
      el('h1', { class: 'who-name', text: c.name || app.id }),
      el('div', { class: 'who-sub',
                  text: [q.title, c.city && c.state ? c.city + ', ' + c.state : null]
                    .filter(Boolean).join('  ·  ') }),
      el('div', { class: 'chiprow' }, [
        el('span', { class: 'chip', text: app.label || app.state }),
        el('span', { class: 'chip' }, [
          el('span', { class: 'v', text: String(app.step) }), el('span', { text: 'of 20' })
        ]),
        app.assignedTo ? ownerChip('human', app.assignedTo) : null
      ])
    ])
  ]));

  /* The one line of arithmetic worth putting at the top: how much of this
     person's life in the funnel was waiting. It is derived from events, and
     the caveat travels with it rather than sitting in a footnote. */
  if (m.measured) {
    parts.push(el('div', { class: 'stats' }, [
      stat(dur(m.elapsedMs), 'in the process so far',
           'Since ' + atStoreFull(m.milestones && m.milestones.appliedAt)),
      stat(pct(m.queueShare), 'of it waiting',
           dur(m.queueMs) + ' waiting against ' + dur(m.workMs) + ' of recorded work'),
      stat(String(m.people ? m.people.handoffs : 0), 'handoffs',
           (m.people ? m.people.handoffsByHuman : 0) + ' by a person, ' +
           (m.people ? m.people.handoffsByMachine : 0) + ' by software')
    ]));
    if (m.manual && m.manual.isFloor && m.manual.caveat) {
      parts.push(el('div', { class: 'band' },
        el('div', { class: 'band-note', text: m.manual.caveat })));
    }
  }

  /* Anything about this record that is not the real thing, said once, at the
     top, in the payload's own words. */
  const sims = simFacts(d);
  if (sims.length) parts.push(el('div', { class: 'band' },
    el('div', { class: 'band-bd' }, sims.map((t) => simNote(t)))));

  /* The spine. */
  parts.push(band('The twenty steps', app.step + ' of 20', spine(steps, m), { flush: true }));

  /* What is open on this person right now, each opening the same drawer the
     queue opens. */
  const open = openThings(d);
  if (open.length) parts.push(band('Open on this person', open.length,
    el('div', { class: 'rows' }, open), { flush: true }));

  /* The clocks, the bar and the notice sequence, folded because they are long
     and they are not what most visits are for. */
  if ((d.clocks || []).length) {
    parts.push(foldBand('Statutory clocks', d.clocks.length, () => clocks(d.clocks)));
  }
  if (d.fcra) parts.push(foldBand('The notice sequence', d.fcra.stage, () => fcra(d.fcra)));
  if (d.retention) parts.push(foldBand('Retention', null, () => retention(d.retention)));

  /* THE AUDIT TRAIL, CONTIGUOUS, AT THE FOOT. */
  parts.push(band('Who did what, and why', (d.audit || []).length, audit(d.audit), { flush: true }));

  put(host, el('div', {}, parts));
}

function stat(value, label, sub) {
  return el('div', { class: 'stat' }, [
    el('span', { class: 'stat-val', text: value == null ? 'not measured' : String(value) }),
    el('span', { class: 'stat-lab', text: label }),
    sub ? el('span', { class: 'stat-sub', text: sub }) : null
  ]);
}

/* ---------------------------------------------------------------- the spine --- */

function spine(steps, m) {
  /* ONE SHARED AXIS. From the first instant anything was recorded to now, so
     every bar is comparable and overlap is real rather than implied. */
  const stamped = steps.filter((s) => s.enteredAt != null);
  if (!stamped.length) {
    return empty('No step has an instant on it yet.',
                 'The twenty steps are below as soon as the first event lands.');
  }
  const t0 = Math.min.apply(null, stamped.map((s) => s.enteredAt));
  const t1 = Math.max(API.now(), Math.max.apply(null, stamped.map((s) =>
    s.completedAt != null ? s.completedAt : s.enteredAt)));
  const span = Math.max(1, t1 - t0);

  const rows = [];
  let stage = null;
  steps.forEach((s) => {
    if (s.stage !== stage) { stage = s.stage; rows.push(el('div', { class: 'stage', text: stage })); }
    rows.push(stepRow(s, t0, span));
  });

  return el('div', { class: 'spine' }, [
    el('div', { class: 'axis' }, [
      el('span', { text: atStoreFull(t0) }),
      el('span', { text: dur(span) + ' wide' }),
      el('span', { text: atStore(t1) })
    ]),
    el('div', { class: 'legend' }, [
      el('span', { class: 'k' }, [el('span', { class: 'sw work', 'aria-hidden': 'true' }),
                                  el('span', { text: 'recorded work' })]),
      el('span', { class: 'k' }, [el('span', { class: 'sw hatch', 'aria-hidden': 'true' }),
                                  el('span', { text: 'waiting' })])
    ]),
    el('div', { class: 'spine-cap',
                text: 'Each bar sits where the step actually ran, so overlap is real. Inside one bar ' +
                      'the split between work and waiting is a proportion of the recorded numbers, ' +
                      'not a sequence: the record does not say when in the step the work happened.' }),
    el('div', {}, rows)
  ]);
}

function stepRow(s, t0, span) {
  const owner = 'own-' + (s.owner === 'external' ? 'system' : s.owner);
  const reached = s.enteredAt != null;
  const end = s.completedAt != null ? s.completedAt : (reached ? API.now() : null);
  const left = reached ? ((s.enteredAt - t0) / span) * 100 : 0;
  const width = reached ? Math.max(0.6, ((end - s.enteredAt) / span) * 100) : 0;
  const total = Math.max(1, (s.workMs || 0) + (s.queueMs || 0));
  const workPart = ((s.workMs || 0) / total) * width;

  const bars = reached ? el('div', { class: 'step-track ' + owner }, [
    /* The wait sits under the whole span and the work sits on the left of it.
       The caption above says the split is a proportion. */
    el('div', { class: 'bar wait', style: 'left:' + left + '%;width:' + width + '%' }),
    workPart > 0
      ? el('div', { class: 'bar work', style: 'left:' + left + '%;width:' + workPart + '%' })
      : null
  ]) : null;

  const sub = [];
  if (reached) {
    sub.push(atStoreFull(s.enteredAt));
    if (s.elapsedMs != null) sub.push(dur(s.elapsedMs) + ' in step');
    if (s.queueMs != null && s.workMs != null) {
      sub.push(dur(s.queueMs) + ' waiting, ' + dur(s.workMs) + ' work');
    }
  } else {
    sub.push('Not reached');
  }

  return el('div', { class: 'step ' + owner + (s.status === 'current' ? ' is-now' : '') }, [
    el('span', { class: 'step-n', text: String(s.n) }),
    el('div', { class: 'step-b name-col' }, [
      el('div', { class: 'step-name' }, [
        glyph(s.owner, { size: 10 }),
        el('span', { class: 't', text: s.name }),
        s.status === 'current' ? el('span', { class: 'chip', text: 'here now' }) : null,
        /* MARKED, not silently smoothed over. */
        s.completionSource === 'inferred_from_later_step'
          ? simBadge('end inferred') : null
      ]),
      el('div', { class: 'step-sub', text: sub.join('  ·  ') +
        (s.inferredFromStep ? '. End taken from step ' + s.inferredFromStep + '.' : '') })
    ]),
    el('div', { class: 'step-b bar-col' }, bars || el('div', { class: 'fun-none', text: 'no instants recorded' }))
  ]);
}

/* -------------------------------------------------------- what is open ---
   Every one of these opens THE drawer, the same one the queue opens, so a
   person reached by search can be acted on without going back to the queue.
   ------------------------------------------------------------------------- */

function openThings(d) {
  const app = d.application || {};
  const c = d.candidate || {};
  const out = [];
  const base = {
    applicationId: app.id, candidateId: app.candidateId, name: c.name,
    initials: c.initials, storeId: app.storeId, storeName: null,
    state: app.state, stateLabel: app.label, step: app.step,
    assignedTo: app.assignedTo, appliedAt: app.appliedAt
  };

  (d.exceptions || []).forEach((e) => {
    if (e.resolvedAt) return;
    out.push(openRow(Object.assign({}, base, {
      kind: 'exception', exceptionId: e.id, verb: e.nextAction || 'Look at this',
      cost: e.blocksProgress ? 'blocked' : 'delay',
      loseBy: e.dueBy != null ? e.dueBy : API.now(), because: e.title,
      reasons: [{ kind: 'exception', exceptionId: e.id, verb: e.nextAction || 'Look at this',
                  cost: e.blocksProgress ? 'blocked' : 'delay',
                  loseBy: e.dueBy != null ? e.dueBy : API.now(), because: e.title }]
    })));
  });
  (d.tasks || []).forEach((t) => {
    if (t.status === 'complete' || t.status === 'carried_forward') return;
    if ((t.owner || '') !== 'human') return;
    out.push(openRow(Object.assign({}, base, {
      kind: 'task', taskKey: t.key, verb: t.name, cost: t.preShift ? 'lost_hire' : 'delay',
      loseBy: t.eligibleAt != null ? t.eligibleAt : API.now(),
      because: t.preShift ? 'Needed before their first shift.' : 'Onboarding, and it is yours.',
      reasons: [{ kind: 'task', taskKey: t.key, verb: t.name,
                  cost: t.preShift ? 'lost_hire' : 'delay',
                  loseBy: t.eligibleAt != null ? t.eligibleAt : API.now(),
                  because: t.preShift ? 'Needed before their first shift.' : 'Onboarding, and it is yours.' }]
    })));
  });
  if ((d.moves || []).length) {
    out.push(openRow(Object.assign({}, base, {
      kind: app.state === 'DECISION_PENDING' ? 'decide' : 'move',
      verb: app.state === 'DECISION_PENDING' ? 'Decide on them'
            : 'Move them on from ' + String(app.label || '').toLowerCase(),
      cost: 'delay', loseBy: API.now(), because: app.label + ', and the engine offers you a move.',
      reasons: []
    })));
  }
  return out;
}

function openRow(row) {
  return el('button', {
    class: 'row cost-' + row.cost, type: 'button', 'data-app': row.applicationId,
    onclick: () => DRAWER.open(row)
  }, [
    el('span', { class: 'row-disc', 'aria-hidden': 'true', text: row.initials || '?' }),
    el('span', { class: 'row-mid' }, [
      el('span', { class: 'row-name', text: row.verb }),
      el('span', { class: 'row-verb', text: row.because })
    ])
  ]);
}

/* -------------------------------------------------------------- the rest --- */

function clocks(list) {
  return el('div', { class: 'def' }, list.map((c) => el('div', { class: 'def-r' }, [
    el('div', { class: 'def-t' }, [
      el('span', { text: c.title }),
      ownerChip(c.owner === 'human' ? 'human' : c.owner === 'clock' ? 'clock' : 'system',
                c.actor === 'nobody' ? 'nobody owns this' : cap(String(c.owner))),
      c.isLaw ? el('span', { class: 'chip is-crit' }, [
        el('span', { class: 'v', text: String(c.days != null ? c.days : '') }),
        el('span', { text: c.unit || 'days' })
      ]) : el('span', { class: 'chip', text: 'policy' })
    ]),
    el('div', { class: 'def-d', text: c.state || c.rule || '' }),
    c.dueAt != null ? el('div', { class: 'ev-cite',
      text: 'Due ' + atStoreFull(c.dueAt) + ', which is ' + atUTC(c.dueAt) + '.' }) : null,
    c.citation ? el('div', { class: 'ev-cite', text: c.citation }) : null,
    c.waitingOn ? el('div', { class: 'def-d', text: 'Waiting on ' + c.waitingOn }) : null
  ])));
}

function fcra(f) {
  return el('div', { class: 'def' }, [
    el('div', { class: 'def-r' }, [
      el('div', { class: 'def-t' }, [
        el('span', { text: 'Where it is' }),
        f.mayTakeAdverseAction ? toneChip('good', 'open', 'may act')
                               : toneChip('crit', 'shut', 'may not act')
      ]),
      el('div', { class: 'def-d', text: f.whyNot || f.rule })
    ])
  ].concat((f.steps || []).map((s) => el('div', { class: 'def-r' }, [
    el('div', { class: 'def-t' }, [
      el('span', { text: s.n + '. ' + s.name }),
      s.isLaw ? el('span', { class: 'chip is-crit' }, [
        el('span', { class: 'v', text: '1' }), el('span', { text: 'law' })
      ]) : el('span', { class: 'chip', text: s.basis || 'policy' }),
      s.done ? toneChip('good', '1', 'done') : null
    ]),
    el('div', { class: 'def-d', text: s.state || '' }),
    s.note ? el('div', { class: 'def-d', text: s.note }) : null,
    s.citation ? el('div', { class: 'ev-cite', text: s.citation }) : null,
    s.sourceNote ? el('div', { class: 'ev-cite', text: s.sourceNote }) : null
  ]))));
}

function retention(r) {
  return el('div', { class: 'def' }, [
    el('div', { class: 'def-r' }, [
      el('div', { class: 'def-t', text: 'The governing floor is ' + (r.governs || 'unstated') }),
      el('div', { class: 'def-d', text: r.note || '' })
    ])
  ].concat((r.floors || []).map((f) => el('div', { class: 'def-r' }, [
    el('div', { class: 'def-t', text: f.key || f.governs || 'a floor' }),
    el('div', { class: 'def-d', text: f.note || f.rule || '' })
  ]))));
}

/** Who did what and why. The why is never dropped. */
function audit(list) {
  const rows = list || [];
  if (!rows.length) {
    return empty('Nothing is on the audit record yet.',
                 'Every move, every evaluation and every resolved flag writes one line here.');
  }
  return el('div', { class: 'aud' }, rows.map((a) => el('div', { class: 'aud-e' }, [
    el('span', { class: 'aud-at', text: atStoreFull(a.at) }),
    el('div', {}, [
      el('div', { class: 'aud-act' }, [
        glyph(a.actorType || 'system', { size: 10 }),
        el('span', { text: a.action }),
        el('span', { class: 'faint', text: a.actor || 'unnamed' }),
        a.outcome && a.outcome !== 'ok'
          ? toneChip('warn', '1', String(a.outcome)) : null
      ]),
      a.why
        ? el('div', { class: 'aud-why', text: a.why })
        /* The gap is NAMED rather than left blank. A blank in a compliance
           artefact reads as an omission by whoever is holding it, and the
           engine writes null on its own automatic moves. */
        : el('div', { class: 'aud-why none', text: 'No reason is recorded on this line.' })
    ])
  ])));
}

/* Everything about this record that is not the real thing, in the payload's
   own words. A fallback is never described as a model. */
function simFacts(d) {
  const out = [];
  (d.screenings || []).forEach((s) => {
    if (s.replayed || s.note) out.push(s.note || 'This screening was replayed from the seeded dataset.');
  });
  const ours = d.evaluation || null;
  if (ours && ours.isModel === false && ours.note) out.push(ours.note);
  return out;
}

/* ---------------------------------------------------------------- search ---
   The way into this mode when there is no row to tap. It reads the whole
   application list, which is also the only place a person in a state the queue
   cannot carry is findable at all.
   ------------------------------------------------------------------------- */

export async function renderSearch(host, shell, onPick) {
  const input = el('input', { type: 'text', placeholder: 'A name, or part of one',
                              'aria-label': 'Search for a person', id: 'q' });
  const results = el('div', { class: 'band-bd flush', id: 'hits' });
  const count = el('span', { class: 'n', text: '' });

  put(host, el('div', {}, [
    /* A PAGE HEADING, which this surface did not have. Every other operator
       page opens with an h1 naming it; Candidates opened with a text box, so
       the only thing telling a reader which page they were on was the rail
       item they had just pressed. */
    pageHeader('Candidates',
      'Every application in your scope, whatever state it is in, including the ones the queue ' +
      'does not carry because nothing about them needs a person.', shell),
    el('div', { class: 'search-f' }, [input, el('button', { class: 'btn sm', type: 'button', text: 'Clear',
      onclick: () => { input.value = ''; input.dispatchEvent(new Event('input')); input.focus(); } })]),
    el('section', { class: 'band' }, [
      el('div', { class: 'band-hd' }, [el('h2', { text: 'Everybody at your stores' }), count]),
      results
    ])
  ]));

  const r = await API.get(API.ROUTES.applications());
  if (!r.ok) {
    put(results, el('div', { class: 'fail' }, [
      el('div', { class: 'fail-what', text: 'The list did not load.' }),
      el('pre', { class: 'fail-err', text: r.error })
    ]));
    return;
  }
  const all = (r.data && r.data.applications) || [];
  count.textContent = String(all.length);

  /* A CHIP ON EVERY ROW IS NOT A CHIP. At a single store every application is
     the manager's, so "yours" was printed 21 times out of 21 and carried no
     information at all. It only marks anything when the list is mixed, which
     is what field HR holding several stores sees, so it appears only then and
     the single-store case says it once in the heading instead. */
  const mine = all.filter((a) => a.yours).length;
  const mixed = mine > 0 && mine < all.length;
  if (!mixed && mine === all.length && all.length) {
    count.textContent = String(all.length);
    count.title = 'All of them are assigned to you';
  }

  function draw() {
    const q = input.value.trim().toLowerCase();
    const hits = q ? all.filter((a) => String(a.name || '').toLowerCase().indexOf(q) >= 0) : all;
    count.textContent = q ? hits.length + ' of ' + all.length : String(all.length);
    if (!hits.length) {
      put(results, empty('Nobody at your stores matches that.',
        'The list is every application in your scope, whatever state it is in, including the ones the queue cannot carry.'));
      return;
    }
    put(results, el('div', { class: 'rows' }, hits.map((a) => el('button', {
      class: 'hit', type: 'button', 'data-app': a.id, onclick: () => onPick(a.id)
    }, [
      el('span', { class: 'row-disc', 'aria-hidden': 'true',
                   text: initialsOf(a.name) }),
      el('span', { class: 'hit-mid' }, [
        el('span', { class: 'hit-name', text: a.name }),
        el('span', { class: 'hit-sub',
                     text: a.label + '  ·  step ' + a.step + '  ·  applied ' + atStoreFull(a.appliedAt) })
      ]),
      (mixed && a.yours) ? ownerChip('human', 'yours') : null
    ]))));
  }
  input.addEventListener('input', draw);
  draw();
  input.focus();
}

/** Initials for a row that carries none. The payload gives them on a candidate
    and not on the flat application list. */
function initialsOf(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
