/* ============================================================================
   app.js  ·  the operator surface. ONE surface, THREE modes, ONE drawer

   WHAT THIS FILE IS. The session, the three modes and the routing between
   them. It draws no rows of its own: work.js, person.js and show.js each own
   one mode and drawer.js owns every write.

   WHAT IT REPLACED. A specification with twelve surfaces, of which ten did not
   exist and /app returned 503. The flow review dismantled that shape with
   counts off the live data: a store manager at #0417 Ridgeway has eleven
   things that need them, and building twelve pages for eleven items is the
   wrong unit. Twelve pages learned separately, against one row shape learned
   once.

   THE THREE MODES, AND WHY THERE ARE THREE.

     Work    the queue. The default, and about ninety five per cent of use.
     Person  one human being, the twenty step journey and the audit trail.
             Reached by tapping any name anywhere, or by searching one.
     Show    the argument, for a buyer. NOT in a store manager's tabs.

   SHOW IS HIDDEN FROM A STORE MANAGER ON PURPOSE. The duration-shaped funnel,
   the actor split and the connector list are all good and none of them is
   theirs. Field HR, whose job is the report, gets the tab. The route still
   works for anybody who types it, because hiding a URL is not a permission and
   the API is what enforces scope.

   THE HASH IS THE ROUTE, so a mode survives a reload and a person can be sent
   a link to one candidate. #/work, #/person/app_0006, #/find, #/show.

   PHONE FIRST. 390 by 844 is the reference and the tabs sit at the bottom
   where a thumb is. Nothing here has a desktop-only control.
   ============================================================================ */

import { el, put, clear, band, empty, atStore, atStoreFull, dur, STORE_ZONE } from './ops/dom.js';
import * as API from './ops/api.js';
import * as DRAWER from './ops/drawer.js';
import * as WORK from './ops/work.js';
import * as PERSON from './ops/person.js';
import * as SHOW from './ops/show.js';

/* The demo token. It is the operator token this server prints at boot and it
   is not a secret: the server binds to loopback, the cookie it sets is
   HttpOnly and SameSite=Strict, and the whole point of a demo session is that
   somebody in the room can become the manager without being handed a password.
   A deployment with a domain replaces this with a real sign-in. */
const DEMO_TOKEN = 'sunfield-demo';

/* THE VIEWER LIST IS NOT TYPED HERE. `GET /api/session` returns every viewer
   the seed defines, with the real name, the real role and the number of stores
   each one holds, so nobody in this file has to know or guess a person's name.
   Two of the keys the server offers are aliases for two of the others, added so
   a demo can ask for "the manager" without knowing the seed's key names, and
   they are deduped by name below rather than presented as extra people. */
const shell = { viewer: null, actor: null, scope: null, seeded: null, tenant: null,
                viewers: [], mode: 'work',
                /* The queue tells the tab its own count, so the two cannot
                   disagree about how many things need somebody. */
                onCount: (n) => setWorkCount(n) };

const dom = {};

/* ---------------------------------------------------------------- routing --- */

/* THE NAVIGATION IS THE ROUTE TABLE, and every entry is backed by a real
   endpoint. `Show` used to bundle the funnel, the connectors and the per-store
   report behind one word, which meant three genuine surfaces had no name a
   person could navigate to. They are separate entries now, each reading the
   endpoint it is named after, and nothing here is a route that does not answer.

   NINE ENTRIES, AND TWO THINGS THE BRIEF ASKS FOR ARE DELIBERATELY ABSENT.

   There is no Assistant. It does not exist: there is no assistant endpoint, no
   thread, no tool table and no safety suite behind one on this build. A rail
   item that opens a panel apologising for itself teaches a buyer that half the
   navigation is scenery, and it would be the one place in this product where
   something is claimed that is not there.

   There is no separate Home. Operations IS the overview: it opens on the four
   numbers and the queue, for the person whose screen this is. A second page
   above it, summarising the page below it, is the generic dashboard pattern
   this pass exists to remove.

   Decide and Screening are new and both read endpoints that already answer.
   Decide is /api/work narrowed to the rows whose acting reason is a decision,
   which is the one thing a store manager is uniquely allowed to do. Screening
   is /api/applications narrowed to the three screening states, which is where
   an application sits while the call has not happened yet, and it was the only
   part of the twenty steps with no surface of its own. */
const NAV = [
  { key: 'work',       hash: '#/work',       label: 'Operations', group: 'Work',    live: true,
    title: 'Operations' },
  { key: 'decide',     hash: '#/decide',     label: 'Decide',     group: 'Work',
    title: 'Decisions' },
  { key: 'find',       hash: '#/find',       label: 'Candidates', group: 'Work',
    title: 'Candidates' },
  { key: 'screening',  hash: '#/screening',  label: 'Screening',  group: 'Work',
    title: 'Screening' },
  { key: 'exceptions', hash: '#/exceptions', label: 'Flags',      group: 'Work',
    title: 'Flags' },
  { key: 'compliance', hash: '#/compliance', label: 'Compliance', group: 'Oversight',
    title: 'Compliance' },
  { key: 'pipeline',   hash: '#/pipeline',   label: 'Pipeline',   group: 'Oversight',
    title: 'Pipeline' },
  { key: 'store',      hash: '#/store',      label: 'Stores',     group: 'Oversight',
    title: 'Stores' },
  { key: 'sources',    hash: '#/sources',    label: 'Sources',    group: 'Oversight',
    title: 'Sources' }
];

function route() {
  const h = String(location.hash || '').replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  if (!parts.length) return { mode: 'work' };
  if (parts[0] === 'person' && parts[1]) return { mode: 'person', id: parts[1] };
  if (NAV.some((n) => n.key === parts[0])) return { mode: parts[0] };
  /* `show` was the old bundle. Kept as a redirect rather than a dead link, so
     a URL somebody wrote down still lands somewhere. */
  if (parts[0] === 'show') return { mode: 'pipeline' };
  return { mode: 'work' };
}

function go(hash) {
  if (location.hash === hash) draw();
  else location.hash = hash;
}

export function openPerson(id) { go('#/person/' + id); }

/* ------------------------------------------------------------------ paint --- */

function draw() {
  const r = route();
  /* THE DRAWER DOES NOT SURVIVE A NAVIGATION. Seen on screen: opening a case
     from the queue and then pressing Screening in the rail left the case panel
     open over a different page, with its Close button acting on a row that was
     no longer in the list behind it. A modal belongs to the surface that
     opened it. */
  const moved = shell.mode !== r.mode;
  shell.mode = r.mode;
  /* The mode is set FIRST, because close() calls back into onClose, which calls
     draw(). With the assignment after the close this recursed once and painted
     the page twice. */
  if (moved) DRAWER.close();
  rail();
  setDocTitle(r);
  const host = dom.main;
  if (r.mode === 'person') { PERSON.render(host, shell, r.id); return; }
  if (r.mode === 'find') { PERSON.renderSearch(host, shell, openPerson); return; }
  /* The oversight surfaces share one module, which reads whichever endpoint the
     section names. Splitting the nav did not mean splitting the code: SHOW
     already fetched all of them and rendered them as sections. */
  if (['compliance', 'pipeline', 'store', 'sources', 'screening'].indexOf(r.mode) >= 0) {
    SHOW.render(host, shell, r.mode); return;
  }
  /* THE THIRD ARGUMENT WAS BEING DROPPED. `WORK.render` took (host, shell) and
     this line has always passed a third, so Flags rendered the whole queue and
     was an exact copy of Operations with a different word in the rail. Found by
     clicking it. */
  if (r.mode === 'exceptions') { WORK.render(host, shell, { only: 'exception' }); return; }
  if (r.mode === 'decide') { WORK.render(host, shell, { only: 'decide' }); return; }
  WORK.render(host, shell);
}

/* THE TAB SAYS WHICH PAGE THIS IS. Nine surfaces shared one title, so every
   window, history entry and bookmark of this application read "Hiring
   operations". The server writes the first one; this keeps it right after a
   navigation the server never sees, which is all of them. */
function setDocTitle(r) {
  const org = shell.tenant || 'Hiring';
  const entry = NAV.find((n) => n.key === r.mode);
  const what = r.mode === 'person' ? 'Candidate' : (entry ? entry.title : 'Operations');
  document.title = what + ' · ' + org + ' hiring';
}

/* The count on the Work tab, set from the queue itself so the tab and the list
   cannot disagree. Null until the first reply lands, and a tab with no number
   prints nothing rather than a nought it has not measured. */
let workCount = null;
export function setWorkCount(n) { workCount = n; rail(); }

function rail() {
  const groups = [];
  NAV.forEach((n) => {
    let g = groups.find((x) => x.name === n.group);
    if (!g) { g = { name: n.group, items: [] }; groups.push(g); }
    g.items.push(n);
  });

  put(dom.rail, groups.map((g) => el('div', { class: 'ops-rail-group' }, [
    el('div', { class: 'lab', text: g.name }),
    /* ANCHORS, NOT BUTTONS. These are navigations to addresses that exist, so
       they get an href: a middle click opens Compliance in a second tab, the
       browser shows the destination on hover, and a screen reader calls them
       links rather than buttons. The handler stays for the one case an href
       cannot serve, which is pressing the item you are already on and wanting
       the page re-read. */
    ...g.items.map((n) => el('a', {
      class: 'ops-nav', href: n.hash,
      'aria-current': shell.mode === n.key ? 'page' : null,
      'data-nav': n.key,
      onclick: (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(n.hash);
      }
    }, [
      NAVICON(n.key),
      el('span', { class: 'n', text: n.label }),
      /* Only the queue carries a count, and only when it has been measured.
         A nought the product has not counted is a claim. */
      (n.live && workCount != null)
        ? el('span', { class: 'c' + (workCount > 0 ? ' is-live' : ''), text: String(workCount) })
        : null
    ]))
  ])).concat([
    /* The person and their scope, at the foot, separated from navigation by a
       rule. The brief asked for the store and user context down here rather
       than competing with the nav. */
    el('div', { class: 'ops-rail-foot' }, [
      el('button', { class: 'ops-who', type: 'button', id: 'who',
                     title: 'Act as somebody else',
                     onclick: () => sheet(viewerSheet()) }, [
        el('span', { class: 'av', text: initialsOf(shell.actor) }),
        el('span', { class: 'col tight' }, [
          el('span', { class: 'who-n', text: shell.actor ? shell.actor.name : 'No session' }),
          el('span', { class: 'who-s',
                       text: shell.actor
                         ? shell.actor.role + ' · ' + (shell.scope ? shell.scope.label : '')
                         : '' })
        ]),
        el('span', { class: 'chev', text: '⌄' })
      ])
    ])
  ]));
}

function initialsOf(actor) {
  if (!actor || !actor.name) return '?';
  return actor.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
}

/* One glyph per rail item, drawn rather than fetched, because this has to load
   on a laptop with no network. Sixteen by sixteen, stroked with currentColor so
   the active state colours the icon with no extra rule. */
const PATHS = {
  work:       ['M3 4.5h10M3 8h10M3 11.5h6'],
  find:       ['M7.2 2.8a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Z', 'M10.6 10.6 13.4 13.4'],
  exceptions: ['M8 2.6 14 13H2L8 2.6Z', 'M8 6.6v3.1', 'M8 11.3v.1'],
  compliance: ['M8 2.4 13.2 4v4.2c0 2.7-2 4.6-5.2 5.4-3.2-.8-5.2-2.7-5.2-5.4V4L8 2.4Z', 'M5.9 8.1 7.4 9.6l2.8-2.9'],
  pipeline:   ['M2.6 4h10.8', 'M4.2 8h7.6', 'M6 12h4'],
  store:      ['M2.6 6.2 8 2.8l5.4 3.4', 'M3.8 6.9v6.3h8.4V6.9', 'M6.6 13.2V9.4h2.8v3.8'],
  sources:    ['M8 2.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Z', 'M2.6 8h10.8', 'M8 2.6c1.5 1.5 2.3 3.4 2.3 5.4S9.5 11.9 8 13.4C6.5 11.9 5.7 10 5.7 8S6.5 4.1 8 2.6Z'],
  /* A tick inside a box: the one move only a person may make. */
  decide:     ['M3 3.6h10v8.8H3z', 'M5.6 8.2 7.2 9.8l3.2-3.4'],
  /* A handset. The screening step is a phone call and nothing else. */
  screening:  ['M5.4 2.9 6.9 5.6 5.6 7a7.5 7.5 0 0 0 3.4 3.4l1.4-1.3 2.7 1.5v2.2c0 .5-.4.9-.9.8A11 11 0 0 1 2.6 3.7c0-.5.3-.8.8-.8h2Z']
};

function NAVICON(key) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  (PATHS[key] || PATHS.work).forEach((d) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
  });
  const w = el('span', { class: 'ico' });
  w.appendChild(svg);
  return w;
}

function header() {
  /* THE RETAILER'S NAME, AND IT WAS NOT THERE. `shell.tenant` was read here and
     never written anywhere, so the brand block read "Hiring" on every screen of
     a product whose whole point is that it is somebody's hiring operation. The
     session carries `org.name` now and `boot` puts it on the shell. The letter
     in the mark is the tenant's own initial for the same reason. */
  const name = shell.tenant || 'Hiring';
  put(dom.brand, [
    el('span', { class: 'mark', text: name.charAt(0).toUpperCase() }),
    el('span', { class: 'col tight' }, [
      el('span', { class: 'name', text: name }),
      el('span', { class: 'sub', text: 'Hiring operations' })
    ])
  ]);
  /* The store's own clock, labelled. Everything used to print UTC, so the
     anchor the code calls "a Monday morning" read as 03:04 at an Ohio store. */
  /* TWO FORMS, ONE INSTANT, AND CSS PICKS. The long one is "Sun 23 Aug, 21:18
     EDT", which at 390px left no room for the clock control beside it and
     pushed it 21px off the right edge of the screen. The short one is the time
     alone; the date is in the page header's own meta line either way. Rendered
     together rather than measured, because a resize listener that re-renders
     the chrome is a listener somebody has to remember exists. */
  put(dom.clockline, [
    el('span', { class: 't long', text: atStoreFull(API.now()) }),
    el('span', { class: 't short', text: atStore(API.now()) }),
    el('span', { class: 'z', text: 'store time' })
  ]);
  rail();
}

/* The demo clock, and it is honest about what it is. It moves the simulated
   present and lets the ordinary ticker run. It does not fabricate data: an
   offer that lapses when the clock passes its expiry lapses because the engine
   ticked, and the row changes for that reason. */
async function advance(hours) {
  dom.clock.disabled = true;
  dom.clock.textContent = 'moving';
  const r = await API.post(API.ROUTES.advance(), { hours });
  dom.clock.disabled = false;
  dom.clock.removeAttribute('disabled');
  dom.clock.textContent = '+4h';
  if (!r.ok) {
    put(dom.main, el('div', { class: 'fail' }, [
      el('div', { class: 'fail-what', text: 'The clock would not move.' }),
      el('pre', { class: 'fail-err', text: r.error })
    ]));
    return;
  }
  header();
  draw();
}

/* ---------------------------------------------------------- the session ---
   Operator routes 401 without one. The switcher is here rather than on a
   settings page because showing a second acting viewer is the fastest way to
   demonstrate that scope comes from the actor and not from a query parameter.
   ------------------------------------------------------------------------- */

async function startSession(viewer) {
  /* `ask` rather than `post`, deliberately. `post` retries a 401 by calling
     the recovery handler, which is this function, and sign-in is the one call
     that must not be able to recurse into itself. */
  const r = await API.ask(API.ROUTES.session(), { token: DEMO_TOKEN, viewer });
  if (!r.ok) return r;
  shell.viewer = r.data.viewer;
  shell.actor = r.data.actor;
  shell.scope = r.data.scope;
  if (r.data.org && r.data.org.name) shell.tenant = r.data.org.name;
  return r;
}

function viewerSheet() {
  const panel = el('div', { class: 'panel' }, [
    el('div', { class: 'card-hd' }, [el('h2', { text: 'Act as somebody else' })]),
    el('div', { class: 'card-bd' }, [
      el('p', { class: 'copy muted',
                text: 'Scope comes from the person, not from the address bar. A store manager ' +
                      'holds one store and field HR holds the stores that name them, so the same ' +
                      'queue is a different length for each of them.' }),
      el('div', { class: 'rows' }, people().map((v) => el('button', {
        class: 'hit', type: 'button', 'data-viewer': v.key,
        onclick: async () => {
          const r = await startSession(v.key);
          sheet(null);
          if (!r.ok) {
            put(dom.main, el('div', { class: 'fail' }, [
              el('div', { class: 'fail-what', text: 'That viewer was refused.' }),
              el('pre', { class: 'fail-err', text: r.error })
            ]));
            return;
          }
          header();
          go('#/work');
          draw();
        }
      }, [
        el('span', { class: 'hit-mid' }, [
          el('span', { class: 'hit-name', text: v.name }),
          el('span', { class: 'hit-sub',
                       text: v.role + ', ' + v.stores + (v.stores === 1 ? ' store' : ' stores') })
        ]),
        isNow(v) ? el('span', { class: 'chip', text: 'now' }) : null
      ])))
    ]),
    el('div', { class: 'drawer-ft' },
      el('button', { class: 'btn', type: 'button', text: 'Close', onclick: () => sheet(null) }))
  ]);
  return panel;
}

/** The viewers, deduped by person. Two of the server's keys are aliases for
    two of the others and a person listed twice reads as two people. */
function people() {
  const seen = [];
  (shell.viewers || []).forEach((v) => {
    if (seen.some((x) => x.name === v.name && x.role === v.role)) return;
    seen.push(v);
  });
  return seen;
}

function isNow(v) {
  return shell.viewer === v.key ||
    (shell.actor && shell.actor.name === v.name && shell.actor.role === v.role);
}

function sheet(node) {
  const old = document.getElementById('sheet');
  if (old) old.remove();
  const scrim = document.getElementById('sheet-scrim');
  if (scrim) scrim.remove();
  if (!node) return;
  const s = el('div', { class: 'scrim open', id: 'sheet-scrim', onclick: () => sheet(null) });
  document.body.appendChild(s);
  document.body.appendChild(el('div', { class: 'sheet', id: 'sheet' }, node));
}

/* ------------------------------------------------------------------ boot --- */

async function boot() {
  dom.main = document.getElementById('main');
  dom.brand = document.getElementById('brand');
  dom.rail = document.getElementById('rail');
  dom.clockline = document.getElementById('clockline');
  dom.clock = document.getElementById('clock');
  dom.find = document.getElementById('find');

  DRAWER.init({
    onOpenPerson: openPerson,
    /* The queue is re-read after every write rather than patched in place. The
       server ranks the rows and a browser that edits one row in a list it did
       not rank is a second opinion about the order. */
    onDone: () => draw(),
    /* A close with no write still repaints, so a row can show that a draft is
       kept for it. */
    onClose: () => draw(),
    onRecorded: (item, r, sentence) => WORK.recordDone(item, r, sentence)
  });

  /* Search in the chrome, so finding one person works from any surface. */
  if (dom.find) {
    dom.find.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = dom.find.value.trim();
      go(q ? '#/find?q=' + encodeURIComponent(q) : '#/find');
    });
  }
  dom.clock.addEventListener('click', () => advance(4));
  window.addEventListener('hashchange', draw);

  /* A dropped session signs back in and the call is made again. See
     ops/api.js: without this, a restarted server or an expired session put the
     server's own "POST the demo token to /api/session" in front of a store
     manager as a red failure. */
  API.onUnauthorized(async () => {
    const again = await startSession(shell.viewer || 'manager');
    if (again.ok) { header(); return true; }
    return false;
  });

  const h = await API.get(API.ROUTES.health());
  if (h.ok && h.data) shell.seeded = !!h.data.seeded;

  /* An existing cookie first, so a reload does not need the token again.
     A REPLY WITH A NULL VIEWER IS NOT A SESSION. `GET /api/session` answers
     ok:true whether or not a cookie was sent, with viewer null and a nameless
     actor, so testing `ok` alone left the surface signed out and every
     operator route came back 401. Measured on the first load of this page. */
  let s = await API.get(API.ROUTES.session());
  if (s.ok && s.data && Array.isArray(s.data.viewers)) shell.viewers = s.data.viewers;
  const signedIn = s.ok && s.data && s.data.viewer;
  if (signedIn) {
    shell.viewer = s.data.viewer; shell.actor = s.data.actor; shell.scope = s.data.scope;
    if (s.data.org && s.data.org.name) shell.tenant = s.data.org.name;
  } else {
    /* The home store's manager, because that is the one store the whole demo
       can show being worked. The server resolves the alias to a real person. */
    const started = await startSession('manager');
    if (!started.ok) s = started;
    if (!shell.viewers.length) {
      const again = await API.get(API.ROUTES.session());
      if (again.ok && again.data) shell.viewers = again.data.viewers || [];
    }
  }

  if (!shell.actor || !shell.actor.name) {
    put(dom.main, el('div', { class: 'fail' }, [
      el('div', { class: 'fail-what', text: 'No operator session could be started.' }),
      el('pre', { class: 'fail-err', text: s.error || 'The server gave no reason.' }),
      el('div', { class: 'small muted prose',
                  text: 'Every operator route needs one. The server prints its own token at boot.' })
    ]));
    return;
  }

  header();

  /* Said once, at the top, and never again: this is a seeded dataset and the
     clock is simulated. A fallback is never described as a model and a
     simulation is never described as live. */
  if (shell.seeded) marker(false);

  draw();
}

/* ONE LINE, AND THE REST ONE TAP AWAY. The first version of this was six lines
   of dashed disclaimer above the first number on a phone, which is the review's
   own complaint about the old deck rebuilt somewhere else. */
function marker(full) {
  const host = document.getElementById('marker');
  if (!host) return;
  if (full) {
    put(host, el('button', { class: 'sim-note full', type: 'button',
      onclick: () => marker(false),
      text: 'A demonstration. Every person, store and requisition here is invented. The ' +
            'present is simulated, anchored in August 2026, and it advances in real time. ' +
            'Times are printed in the store clock, ' + STORE_ZONE.replace('_', ' ') +
            ', and every legal deadline is counted in UTC. Tap to fold this away.' }));
    return;
  }
  put(host, el('button', { class: 'sim-note', type: 'button',
    onclick: () => marker(true),
    text: 'A demonstration. Invented people, a simulated clock. Read the detail.' }));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

export { shell, STORE_ZONE };
