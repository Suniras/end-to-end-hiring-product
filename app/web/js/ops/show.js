/* ============================================================================
   ops/show.js  ·  MODE 3, SHOW. The argument, for a buyer

   NOT IN THE STORE MANAGER'S NAV. The duration-shaped funnel, the actor split,
   the per-store table and the connector list are all good and none of them is
   the manager's. Their page opens on their list. This mode exists for the
   person deciding whether to buy, and for field HR, whose own job is the
   report rather than the till.

   THE FUNNEL IS DURATION-SHAPED, NOT COUNT-SHAPED. A funnel drawn by how many
   people are at each step says the process is fine. Drawn by how long each
   step takes, the same data says seventeen of nineteen classifiable steps are
   waits or handoffs, and that ratio is the whole product argument. So the bar
   length is time, split into recorded work and derived waiting, and the eye
   reads the distribution rather than a headcount.

   EVERY MEDIAN RENDERS WITH ITS n, AND A MEDIAN OF ONE OBSERVATION SAYS SO.
   This is not a style preference. The project has twice put a number in front
   of somebody that turned out to rest on one or three observations, and once
   put a payroll vendor's blog figure into a document. A median with no sample
   size beside it is a claim nobody can check, so this file has exactly one way
   to print a number and it always carries n.

   NOTHING HERE IS COMPUTED IN THE BROWSER. Every median, share and count comes
   off /api/funnel, /api/metrics/stores and /api/sources. A second arithmetic
   in a client is how a strip and a list start disagreeing.
   ============================================================================ */

import { el, put, band, foldBand, empty, dur, durLong, pct, atStoreFull, cap,
         ownerChip, toneChip, simBadge, glyph } from './dom.js';
import * as API from './api.js';

/* ONE SECTION PER PAGE, not four sections behind one word.

   This used to render everything at once under a single route called `show`,
   which meant the funnel, the per-store report and the connector map had no
   name a person could navigate to and no heading of their own. They are now
   four rail entries, and each one reads only the endpoints it needs. A page
   that fetches four payloads to render one of them is also three requests a
   store manager waits for.

   `pageOf` carries the heading, the one-line description and what to fetch, so
   the page header and the content cannot disagree about which page this is. */
const PAGES = {
  pipeline: {
    h1: 'Pipeline',
    lede: 'Every one of the twenty steps, shaped by how long it takes rather than by how ' +
          'many people are in it. The argument this product rests on is that most of the ' +
          'elapsed time is waiting and handing over, not working.'
  },
  store: {
    h1: 'Stores',
    lede: 'Where each store loses time. Queue share is the share of elapsed time nobody was ' +
          'working, and it is derived from recorded events.'
  },
  sources: {
    h1: 'Sources',
    lede: 'What is connected, what could be, and what failed. Every adapter here is ' +
          'simulated and says so. This is a configuration surface, not a league table.'
  },
  compliance: {
    h1: 'Compliance',
    lede: 'Statutory clocks and background checks. A clock a person owns is separated from ' +
          'one nobody can act on, because most of them are the second kind.'
  },
  screening: {
    h1: 'Screening',
    lede: 'Step 3 of the twenty. Where an application sits between the rules passing and a ' +
          'person deciding, which is the one stretch nobody at the store is waiting on.'
  }
};

/* The three states an application is in while the screening call is the thing
   that has not happened yet. They are the engine's own names, read from the
   applications list rather than counted here. */
const SCREENING_STATES = ['SCREENING_PENDING', 'SCREENING_IN_PROGRESS', 'SCREENING_COMPLETE'];

export async function render(host, shell, section) {
  const which = PAGES[section] ? section : 'pipeline';
  const page = PAGES[which];

  put(host, [
    pageHeader(page.h1, page.lede, shell),
    el('div', { class: 'ops-sec' }, el('p', { class: 'copy muted', text: 'Reading recorded events.' }))
  ]);

  const parts = [];

  if (which === 'pipeline') {
    const [funnel, metrics] = await Promise.all([
      API.get(API.ROUTES.funnel()), API.get(API.ROUTES.metrics())
    ]);
    if (metrics.ok) parts.push(headline(metrics.data, shell));
    else parts.push(fail('The rollup did not load.', metrics.error));
    if (funnel.ok) {
      parts.push(bottleneck(funnel.data.bottleneck));
      parts.push(band('Every step, by how long it takes', (funnel.data.steps || []).length,
        funnelBody(funnel.data.steps, funnel.data.bottleneck), { flush: true }));
      parts.push(band('Who does the work', (funnel.data.actors || []).length,
        actors(funnel.data.actors), { flush: true }));
    } else {
      parts.push(fail('The funnel did not load.', funnel.error));
    }
  }

  if (which === 'store') {
    const [stores, metrics] = await Promise.all([
      API.get(API.ROUTES.metricStores()), API.get(API.ROUTES.metrics())
    ]);
    if (metrics.ok) parts.push(headline(metrics.data, shell));
    if (stores.ok) {
      parts.push(band('By store', (stores.data || []).length, storeBody(stores.data), { flush: true }));
    } else {
      parts.push(fail('The store rollups did not load.', stores.error));
    }
  }

  if (which === 'screening') {
    const a = await API.get(API.ROUTES.applications());
    if (a.ok) parts.push(screeningBody(a.data, shell));
    else parts.push(fail('The applications did not load.', a.error));
  }

  if (which === 'sources') {
    const sources = await API.get(API.ROUTES.sources());
    if (sources.ok) parts.push(connectors(sources.data));
    else parts.push(fail('The connector map did not load.', sources.error));
  }

  if (which === 'compliance') {
    const c = await API.get(API.ROUTES.compliance ? API.ROUTES.compliance() : '/api/compliance');
    if (c.ok) parts.push(complianceBody(c.data));
    else parts.push(fail('The compliance cases did not load.', c.error));
  }

  put(host, [pageHeader(page.h1, page.lede, shell), el('div', {}, parts)]);
}

function fail(what, why) {
  return el('div', { class: 'fail' }, [
    el('div', { class: 'fail-what', text: what }),
    el('pre', { class: 'fail-err', text: String(why) })
  ]);
}

/** A number, and its sample size, together. The ONLY way this file prints a
    duration that came from a distribution. */
function withN(summary, fmt) {
  if (!summary || summary.n == null || summary.n === 0 || summary.median == null) {
    return 'not measured yet';
  }
  const f = fmt || durLong;
  return f(summary.median) + ', n = ' + summary.n + (summary.smallSample ? ', a small sample' : '');
}

function headline(m, shell) {
  const t = m.timeToHire || {};
  const h = t.headline || {};
  const q = m.queue || {};
  return el('div', {}, [
    el('div', { class: 'stats' }, [
      el('div', { class: 'stat' }, [
        el('span', { class: 'stat-val', text: withN(h.summary || t.toStarted) }),
        el('span', { class: 'stat-lab', text: h.label || 'Application to first shift worked' }),
        el('span', { class: 'stat-sub', text: h.note || '' })
      ]),
      el('div', { class: 'stat' }, [
        el('span', { class: 'stat-val',
                     text: pct(q.headline ? q.headline.share : q.queueShareOfElapsed) }),
        el('span', { class: 'stat-lab', text: 'of the elapsed time is waiting' }),
        el('span', { class: 'stat-sub',
                     text: (q.headline ? 'n = ' + q.headline.n + '. ' + q.headline.basis : '') })
      ]),
      el('div', { class: 'stat' }, [
        el('span', { class: 'stat-val', text: String(m.applications) }),
        el('span', { class: 'stat-lab', text: 'applications in scope' }),
        el('span', { class: 'stat-sub',
                     text: m.open + ' still moving, ' + m.started + ' worked a first shift, ' +
                           m.lost + ' lost' })
      ])
    ]),
    h.definition ? el('div', { class: 'band' }, el('div', { class: 'band-note', text: h.definition })) : null,
    q.caveat ? el('div', { class: 'band' }, el('div', { class: 'band-note', text: q.caveat })) : null,
    m.people ? el('div', { class: 'band' }, el('div', { class: 'band-note',
      text: 'Distinct members of staff who touched any of these: ' + m.people.distinct +
            '. Handoffs per application, median ' + (m.people.handoffsPerApplication || {}).median +
            ' over n = ' + (m.people.handoffsPerApplication || {}).n + '.' })) : null
  ]);
}

function bottleneck(b) {
  if (!b || !b.worst) return null;
  const w = b.worst;
  return el('div', { class: 'band' }, [
    el('div', { class: 'band-hd' }, [
      el('h2', { text: 'The worst step is step ' + w.n }),
      ownerChip(w.owner, cap(w.owner))
    ]),
    el('div', { class: 'band-bd' }, [
      el('div', { class: 'ev-t', text: w.name }),
      el('div', { class: 'ev-d',
                  text: 'Waiting, median ' + withN(w.queue) + '. That is ' +
                        pct(w.totalQueueMs / b.totalQueueMs) +
                        ' of all the waiting recorded across every step.' }),
      el('div', { class: 'ev-cite', text: b.basis })
    ])
  ]);
}

/* ------------------------------------------------------- the funnel body ---
   Twenty rows, one shared scale, so the distribution is the picture. The
   38px density from app.css is right here: these rows are read, not tapped.
   ------------------------------------------------------------------------- */

function funnelBody(steps, b) {
  const rows = steps || [];
  const worst = b && b.worst ? b.worst.n : null;
  const scale = Math.max.apply(null, rows.map((s) =>
    (s.elapsed && s.elapsed.median) || 0).concat([1]));

  const out = [];
  let stage = null;
  rows.forEach((s) => {
    if (s.stage !== stage) { stage = s.stage; out.push(el('div', { class: 'stage', text: stage })); }
    out.push(funnelRow(s, scale, s.n === worst));
  });
  return el('div', { class: 'fun' }, [
    el('div', { class: 'legend' }, [
      el('span', { class: 'k' }, [el('span', { class: 'sw work', 'aria-hidden': 'true' }),
                                  el('span', { text: 'recorded work' })]),
      el('span', { class: 'k' }, [el('span', { class: 'sw hatch', 'aria-hidden': 'true' }),
                                  el('span', { text: 'waiting' })]),
      el('span', { class: 'k', text: 'bar length is the median time in the step, on one scale' })
    ]),
    el('div', {}, out)
  ]);
}

function funnelRow(s, scale, isWorst) {
  const owner = 'own-' + (s.owner === 'external' ? 'system' : s.owner);
  const med = (s.elapsed && s.elapsed.median) || 0;
  const width = med ? Math.max(0.5, (med / scale) * 100) : 0;
  const total = Math.max(1, ((s.work && s.work.median) || 0) + ((s.queue && s.queue.median) || 0));
  const workPart = (((s.work && s.work.median) || 0) / total) * width;

  return el('div', { class: 'fun-r ' + owner + (isWorst ? ' is-worst' : '') }, [
    el('span', { class: 'step-n', text: String(s.n) }),
    el('div', { class: 'fun-b name-col' }, [
      el('div', { class: 'fun-top' }, [
        glyph(s.owner, { size: 10 }),
        el('span', { class: 'fun-name', text: s.name }),
        s.lawClock ? el('span', { class: 'chip', text: 'law' }) : null
      ]),
      el('div', { class: 'step-sub',
                  text: s.entered + ' entered, ' + s.inFlight + ' in flight' +
                        (s.lostHere ? ', ' + s.lostHere + ' lost here' : '') +
                        (s.endNotRecorded ? '. End inferred, not ranked.' : '') })
    ]),
    el('div', { class: 'fun-b bar-col' }, [
      med
        ? el('div', { class: 'fun-track' }, [
            el('div', { class: 'bar wait', style: 'left:0;width:' + width + '%' }),
            workPart > 0 ? el('div', { class: 'bar work', style: 'left:0;width:' + workPart + '%' }) : null
          ])
        : el('div', { class: 'fun-none', text: 'nothing recorded in this step yet' }),
      el('div', { class: 'fun-num', text: med ? withN(s.elapsed) : 'n = 0' })
    ])
  ]);
}

/* ----------------------------------------------------------- actor split --- */

function actors(list) {
  const rows = list || [];
  if (!rows.length) return empty('No events are attributed yet.', 'Every recorded event carries an actor type.');
  const total = rows.reduce((a, r) => a + (r.events || 0), 0) || 1;
  const scale = Math.max.apply(null, rows.map((r) => r.events || 0).concat([1]));
  return el('div', { class: 'fun' }, rows.map((r) => el('div', {
    class: 'fun-r own-' + (r.actorType === 'external' ? 'system' : r.actorType)
  }, [
    el('span', { class: 'step-n', 'aria-hidden': 'true' }, glyph(r.actorType, { size: 10 })),
    el('div', { class: 'fun-b name-col' }, [
      el('div', { class: 'fun-top' }, [
        el('span', { class: 'fun-name', text: labelFor(r.actorType) })
      ]),
      el('div', { class: 'step-sub',
                  text: r.events + ' events, ' + pct(r.events / total) + ' of all of them' +
                        (r.applicantEvents ? '. ' + r.applicantEvents + ' were the applicant themselves' : '') })
    ]),
    el('div', { class: 'fun-b bar-col' }, [
      el('div', { class: 'fun-track' },
        el('div', { class: 'bar work', style: 'left:0;width:' + ((r.events / scale) * 100) + '%' })),
      el('div', { class: 'fun-num', text: 'recorded work ' + (r.recordedMs ? dur(r.recordedMs) : 'none') })
    ])
  ])));
}

function labelFor(t) {
  const M = { human: 'A person', agent: 'An AI model', system: 'Deterministic software',
              external: 'An outside system or the candidate' };
  return M[t] || t;
}

/* ------------------------------------------------------------- by store --- */

function storeBody(rows) {
  const list = rows || [];
  if (!list.length) return empty('No store is in your scope.', 'A store rollup only appears for a store you hold.');
  return el('div', { class: 'def' }, list.map((s) => {
    const t = s.timeToHire || {};
    const h = t.headline || {};
    const w = s.byWaitedOn || {};
    return el('div', { class: 'def-r' }, [
      el('div', { class: 'def-t' }, [
        el('span', { text: s.storeName }),
        s.manager ? ownerChip('human', s.manager) : null,
        el('span', { class: 'chip' }, [
          el('span', { class: 'v', text: String(s.applications) }), el('span', { text: 'applications' })
        ])
      ]),
      el('div', { class: 'kv' }, [
        el('span', { class: 'k', text: h.label || 'application to first shift' }),
        el('span', { class: 'v', text: withN(h.summary) }),
        el('span', { class: 'k', text: 'waiting' }),
        el('span', { class: 'v', text: pct(s.queueShareOfHiring) + ', n = ' + s.queueShareN +
                                       (s.smallSample ? ', a small sample' : '') })
      ]),
      el('div', { class: 'def-d',
                  text: 'Of the waiting, ' + pct(w.productShare) + ' is on the product, ' +
                        pct(w.personShare) + ' on a named person and ' +
                        pct(w.externalShare) + ' on the outside world.' }),
      w.note ? el('div', { class: 'ev-cite', text: w.note }) : null
    ]);
  }));
}

/* ----------------------------------------------------------- connectors ---
   Nine adapters, every one of them simulated, and it says so on each row. The
   route column is the honest half: what is documented, what is partly
   documented and what nobody has checked.
   ------------------------------------------------------------------------- */

function connectors(s) {
  const ads = s.adapters || [];
  const live = ads.filter((a) => a.connected).length;
  return el('div', {}, [
    band('The connectors', ads.length + ' adapters, ' + live + ' connected',
      el('div', { class: 'def' }, ads.map((a) => el('div', { class: 'def-r' }, [
        el('div', { class: 'def-t' }, [
          el('span', { text: a.label }),
          a.connected ? toneChip('good', '1', 'connected') : simBadge(a.mode || 'simulated'),
          a.routeKnown === true ? toneChip('good', '1', 'route documented')
            : a.routeKnown === 'partial' ? toneChip('warn', '1', 'route partly documented')
            : toneChip('crit', '0', 'route unknown')
        ]),
        el('div', { class: 'def-d',
                    text: a.ops.join(', ') + '. ' + (s.byAdapter
                      ? countFor(s.byAdapter, a.key) + ' calls recorded in this dataset.' : '') }),
        a.route ? el('div', { class: 'def-d', text: a.route }) : null,
        a.requires ? el('div', { class: 'ev-cite', text: 'Needs: ' + a.requires }) : null,
        a.citation ? el('div', { class: 'ev-cite', text: a.citation }) : null,
        a.whatWouldMakeItLive ? el('div', { class: 'ev-cite',
          text: 'What would make it live: ' + a.whatWouldMakeItLive }) : null
      ]))), { flush: false }),

    (s.knownFailures || []).length
      ? band('Failures this dataset carries', s.knownFailures.length,
          el('div', { class: 'def' }, s.knownFailures.map((f) => el('div', { class: 'def-r' }, [
            el('div', { class: 'def-t' }, [
              el('span', { text: f.adapter + '.' + f.op }),
              toneChip('crit', '1', f.failure),
              f.retryable ? el('span', { class: 'chip', text: 'retryable' }) : null
            ]),
            el('div', { class: 'def-d', text: f.error })
          ]))))
      : null,

    foldBand('Where a job posting can go', Object.keys(s.destinations || {}).length,
      () => el('div', { class: 'def' }, Object.keys(s.destinations || {}).map((name) => {
        const d = s.destinations[name];
        return el('div', { class: 'def-r' }, [
          el('div', { class: 'def-t' }, [
            el('span', { text: name }),
            el('span', { class: 'chip', text: d.status })
          ]),
          el('div', { class: 'def-d', text: d.reason }),
          d.cost ? el('div', { class: 'ev-cite', text: 'Cost: ' + d.cost }) : null,
          d.citation ? el('div', { class: 'ev-cite', text: d.citation }) : null
        ]);
      })), { flush: false }),

    el('div', { class: 'band' }, el('div', { class: 'band-note',
      text: 'Every adapter above is simulated. ' + (s.calls != null ? s.calls : 0) +
            ' connector calls are recorded in this dataset and none of them left the machine.' }))
  ]);
}

function countFor(byAdapter, key) {
  let n = 0;
  Object.keys(byAdapter || {}).forEach((k) => { if (k.indexOf(key + '.') === 0) n += byAdapter[k]; });
  return n;
}

/* ---------------------------------------------------------- the screening ---
   WHY THIS PAGE EXISTS. Step 3 was the only one of the twenty with no surface
   of its own. An application in it is not in the work queue, because nothing
   about it needs a person: the call is the agent's and the rules are the
   software's. So a manager asking "where did the four people who applied
   yesterday go" had nowhere to look and the answer was "screening", which is a
   word rather than a screen.

   NOTHING IS COMPUTED HERE THAT THE SERVER DOES NOT SEND. The states, the
   labels and the step numbers are the engine's. This groups them and counts
   them, which is arithmetic over a list the caller already has.

   NO SCORE, AND THERE IS NOT ONE TO SHOW. The screening platform returns an
   outcome, a disposition and a summary, and no numeric score exists anywhere in
   this product. A column of numbers here would be invented.
   ------------------------------------------------------------------------- */

function screeningBody(d, shell) {
  const rows = (d.applications || []).filter((a) => SCREENING_STATES.indexOf(a.state) >= 0);
  const byState = SCREENING_STATES.map((st) => ({
    state: st,
    /* The engine's own label when a row carries one, and the state name read
       back as words when the group is empty. `cap` because the empty groups
       were printing "screening in progress" in lower case beside "Screening
       queued" from a row, so the same strip had two casings in it. */
    label: (rows.find((r) => r.state === st) || {}).label || cap(words(st)),
    rows: rows.filter((r) => r.state === st)
  }));
  const waiting = rows.length;

  return el('div', {}, [
    el('div', { class: 'ops-stats' }, byState.map((g) => stat(
      g.rows.length, g.label,
      g.state === 'SCREENING_PENDING' ? 'The call has not started'
        : g.state === 'SCREENING_IN_PROGRESS' ? 'On a call now'
        : 'Read and waiting to move on',
      null)).concat([
      stat(waiting, 'In screening', 'Out of ' + (d.count || 0) + ' applications in your scope', null)
    ])),

    waiting
      ? el('div', {}, byState.filter((g) => g.rows.length).map((g) => band(
          g.label, g.rows.length,
          el('div', { class: 'rows' }, g.rows
            .slice()
            .sort((x, y) => (x.stateSince || 0) - (y.stateSince || 0))
            .map((a) => el('button', {
              class: 'hit', type: 'button',
              onclick: () => { location.hash = '#/person/' + a.id; }
            }, [
              el('span', { class: 'hit-mid' }, [
                el('span', { class: 'hit-name', text: a.name || a.id }),
                el('span', { class: 'hit-sub',
                             text: 'Step ' + a.step + ' of 20' +
                                   (a.stateSince ? ', here since ' + atStoreFull(a.stateSince) : '') })
              ]),
              a.assignedTo ? ownerChip('human', a.assignedTo) : null
            ]))),
          { flush: true })))
      : el('div', { class: 'band' }, el('div', { class: 'band-bd' }, empty(
          'Nobody is in screening.',
          'Every application at your stores is either earlier than step 3 or past it. ' +
          'This page fills as new applications clear the eligibility rules.',
          (d.count || 0) + ' applications are in your scope'))),

    el('div', { class: 'band' }, el('div', { class: 'band-note',
      text: 'The screening platform returns an outcome, a disposition and a written summary. ' +
            'There is no numeric score anywhere in this product, so there is no column of them ' +
            'here.' }))
  ]);
}

function words(s) { return String(s || '').toLowerCase().replace(/_/g, ' '); }

/* THE PAGE HEADER. An h1 that is an h1, then the description, then the scope
   as metadata. The review's complaint was that a store number was doing the
   job of a heading, so a reader could not tell which page they were on. */
export function pageHeader(h1, lede, shell) {
  const scope = (shell && shell.scope) || {};
  const places = scope.stores || [];
  const one = places.length === 1 ? places[0] : null;
  const where = one
    ? one.name + (one.city ? ', ' + one.city + (one.state ? ' ' + one.state : '') : '')
    : (places.length ? places.length + ' stores, ' + scope.label : scope.label || null);

  return el('div', { class: 'ops-hd' }, [
    el('div', { class: 'ops-hd-top' }, [
      el('div', { class: 'col tight' }, [
        el('h1', { text: h1 }),
        where ? el('p', { class: 'where', text: where }) : null,
        (one && one.manager)
          ? el('p', { class: 'who', text: 'Store manager: ' + one.manager })
          : (shell && shell.actor
              ? el('p', { class: 'who', text: shell.actor.role + ': ' + shell.actor.name })
              : null)
      ])
    ]),
    lede ? el('p', { class: 'lede prose', text: lede }) : null
  ]);
}

/* Compliance, split the way the data actually divides. Measured on the seeded
   tenant: 38 cases, of which 2 need a person and 31 carry only a clock nobody
   owns. Showing all 38 in one list is what made this page unusable as a work
   list, so the two that need somebody come first and the rest are folded. */
function complianceBody(d) {
  const need = d.needsAPerson || [];
  const all = d.everyCase || [];
  const c = d.counts || {};
  return el('div', {}, [
    el('div', { class: 'ops-stats' }, [
      stat(c.needAPerson, 'Need a person', 'Somebody has to act', need.length ? 'is-crit' : 'is-good'),
      stat(c.unmetDeadlines, 'Unmet deadlines', 'Not yet breached', c.unmetDeadlines ? 'is-warn' : 'is-good'),
      stat(c.barsUp, 'Adverse action bars up', 'Five actions barred while contested', c.barsUp ? 'is-warn' : null),
      stat(c.onlyClocksNobodyOwns, 'Waiting periods', 'Nobody can act on these', null)
    ]),
    band('Needs a person', need.length,
      need.length ? el('div', { class: 'rows' }, need.map(caseRow))
        : el('div', { class: 'empty' }, [
            el('div', { class: 'empty-title', text: 'Nothing needs a person right now.' }),
            el('div', { class: 'empty-body prose',
                        text: 'Every statutory clock that a named human owns is met. ' +
                              (c.onlyClocksNobodyOwns || 0) + ' cases carry only a waiting ' +
                              'period, which nobody can shorten.' })
          ]), { flush: true }),
    d.filterNote ? el('p', { class: 'copy muted prose', text: d.filterNote }) : null,
    band('Every case', all.length, el('div', { class: 'rows' }, all.slice(0, 40).map(caseRow)),
      { flush: true })
  ]);
}

function stat(v, label, sub, tone) {
  return el('div', { class: 'ops-stat' + (tone ? ' ' + tone : '') }, [
    el('div', { class: 'top' }, el('span', { class: 'v', text: v == null ? '0' : String(v) })),
    el('div', { class: 'l', text: label }),
    el('div', { class: 's', text: sub })
  ]);
}

function caseRow(c) {
  const clocks = c.clocks || [];
  const worst = clocks.filter((k) => !k.done && !k.satisfied)
    .sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0))[0] || null;
  return el('div', { class: 'hit' }, [
    el('span', { class: 'hit-mid' }, [
      el('span', { class: 'hit-name', text: c.name || c.applicationId }),
      el('span', { class: 'hit-sub',
                   text: worst ? (worst.title || worst.key) + (worst.citation ? '. ' + worst.citation : '')
                               : (clocks.length + ' clock' + (clocks.length === 1 ? '' : 's') + ', all met') })
    ]),
    worst && worst.owner === 'human'
      ? el('span', { class: 'chip is-crit' }, el('span', { class: 'v', text: 'yours' }))
      : el('span', { class: 'chip', text: 'waiting' })
  ]);
}
