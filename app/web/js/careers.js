/* ============================================================================
   careers.js  ·  the behaviour of pages 11 and 12

   WHAT THIS FILE IS FOR. It is the only thing in the build that starts an
   application. It draws the job list from the eight real requisitions, takes a
   person through the disclosure gate, collects the minimum the five
   eligibility rules need, posts it, and then branches on what eligibility
   said. Four phases of one visit, held in memory so the consent id and a
   half-filled form survive moving between them.

   WHAT BREAKS WITHOUT IT. The live spine has no beginning. The thirty-six
   seeded applications start at step 2 and nothing on demo day creates a
   thirty-seventh, so the audience watches a recording rather than a product.

   THE SIX RULES THIS FILE EXISTS TO KEEP, every one a decision rather than a
   preference:

   U-55  The demonstration marker is rendered from `org.fictional`. It is never
         a string in this file. Removing it means editing the tenant record.
   U-84  The store filter defaults to whatever the server calls
         `defaultStoreId`. That id is never written here, because five of the
         eight open requisitions belong to stores the rest of the demo cannot
         show being worked, and a store id hard-coded in a browser file is how
         that default quietly rots.
   U-85  This page renders only what the public projection sends. It never asks
         for a requisition row and has no code path that could print criteria,
         screening questions or scoring phrases, because it never holds them.
   U-86  The gate comes before the form STRUCTURALLY, not just visually. The
         form is not built until `POST /api/public/consent` has returned a
         consent id, so there is no ordering left to get wrong.
   U-87  Every constraint the requisition puts on an applicant is printed next
         to the input it governs. The minimum age beside the date of birth, the
         required shifts marked in the grid, the commute band beside the band.
   U-92  Both call methods, browser first. The outbound button is rendered
         disabled with its reason, never hidden, because a button that is not
         there teaches nobody that a phone call is part of this product.

   THE REFERENCE VIEWPORT IS 390 BY 844. Every screen here is judged on a phone
   before it is judged anywhere else, because that is the only device this
   page's user has. Four things were measured wrong on 8 September 2026 and all
   four are fixed below, each with the defect named at the fix:

     1. The gate ran to 2,631px of scroll, about three screens, and said the
        same thing twice. It now opens short and the six statutory paragraphs
        are one labelled tap away, never removed.
     2. The two shift boxes the Deli role REQUIRES sat off the right edge of
        the phone. Ticking the three that were visible got the application
        refused. The shifts a role needs are now full-width rows above the
        grid, and the grid is optional.
     3. A person's own missed tick was printed as a timestamped monospace
        server error headed "The application was not accepted."
     4. Engineer words, several of them in capitals, arrived as the reward for
        answering a question.

   TWO ERROR VOICES, and mixing them is the defect above. `failBlock` carries a
   timestamp and the provider's own message, and it is for things the PRODUCT
   got wrong, where the demo audience is the reader. `fixBlock` has no
   timestamp, no monospace and no verdict, and it is for things the PERSON can
   fix. A missed tick is never a refusal.

   TWO THINGS THIS FILE WILL NOT DO, both enforced by what it does not contain
   rather than by a comment.

   It never renders a call id or a participant token. A call id alone reads
   that call's transcript out of the provider with no authentication at all,
   which is why `publicview.js` bans the field outright. The token is what the
   voice client joins the room with and it goes to the client, never the DOM.

   It never invents a transport state. If the server says a method is
   unavailable, the server's sentence appears verbatim. If the server has said
   nothing, the page says it has not been told rather than guessing, which is
   the same rule that makes the model boundary print "No model ran".

   NO INNER HTML ANYWHERE. Everything is built through `el()`, whose only way
   in for content is `text`. Job titles, store names and disclosure paragraphs
   are rows out of a database, and a page that assembles markup out of database
   text is one edit away from being an injection.
   ============================================================================ */

import * as SLOTS from './slots.js';
import { glyph } from './glyphs.js';

/* ------------------------------------------------------------ the routes ---
   Exactly the six the server exposes, in one place, so a renamed route is one
   edit rather than a search.
   ------------------------------------------------------------------------- */

export const ROUTES = {
  careers: (q) => '/api/public/careers' + query(q),
  job: (requisitionId) => '/api/public/job' + query({ requisitionId }),
  disclosure: () => '/api/public/disclosure',
  consent: () => '/api/public/consent',
  apply: () => '/api/public/apply',
  call: () => '/api/public/call',
  /* Asked before the confirmation renders. Without it the page had no idea
     whether a phone call could be placed, so it printed forty-three invented
     words guessing that it could not. The server knows, in one sentence, and
     says so. */
  callMethods: () => '/api/public/call/methods'
};

/* Where a copied livekit UMD build is looked for. careers.html script-tags
   this path; it is named here so the two cannot drift. */
export const VOICE_CLIENT_PATH = '/vendor/livekit-client.umd.js';

function query(o) {
  const parts = [];
  Object.keys(o || {}).forEach((k) => {
    const v = o[k];
    if (v == null || v === '') return;
    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
  });
  return parts.length ? '?' + parts.join('&') : '';
}

/**
 * One request. Never throws.
 *
 * A dropped connection and a 500 are both things this page has to render
 * rather than crash on, because the person in front of it is a candidate and
 * the person behind it is watching a demo. Whatever reason came back travels
 * to the screen unchanged.
 */
async function ask(url, body) {
  try {
    const res = await fetch(url, body === undefined
      ? { headers: { accept: 'application/json' } }
      : { method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(body) });
    let payload = null;
    const text = await res.text();
    try { payload = text ? JSON.parse(text) : null; } catch (e) { payload = { raw: text }; }
    if (!res.ok) {
      return { ok: false, status: res.status, body: payload,
               error: (payload && (payload.error || payload.reason)) ||
                      ('The server answered ' + res.status + ' and gave no reason.'),
               problems: (payload && payload.problems) || [] };
    }
    /* The server wraps every reply as { ok, now, simNow, data }, so `data` is
       the payload and `now` is the simulated present. Unwrapped here, in one
       place, so no caller has to know about the envelope.

       THE ENVELOPE'S OWN `ok` IS FOLDED INTO res.ok, and that is the important
       half. A 200 carrying ok:false is a failure, and a 200 carrying a payload
       is a success whose payload has no `ok` field of its own. A caller that
       tested res.body.ok after this unwrap saw undefined and told a candidate
       their application had been REFUSED when it had in fact been created. So
       `ok` means one thing, it is computed once, and callers test res.ok and
       nothing else. */
    const envelope = payload && typeof payload === 'object' && 'data' in payload;
    const declared = payload && typeof payload === 'object' && 'ok' in payload
      ? payload.ok !== false : true;
    return { ok: declared, status: res.status,
             body: envelope ? payload.data : payload,
             now: (payload && payload.now) || null,
             error: declared ? null
               : ((payload && (payload.error || payload.reason)) || 'The server refused it and gave no reason.'),
             problems: (payload && payload.problems) || [] };
  } catch (e) {
    return { ok: false, status: 0, body: null,
             error: 'The request to ' + url + ' did not complete. ' + String((e && e.message) || e) };
  }
}

/* --------------------------------------------------------------- the DOM ---
   One helper, and `text` is the only door content comes through.
   ------------------------------------------------------------------------- */

export function el(tag, props, kids) {
  const n = document.createElement(tag);
  const p = props || {};
  Object.keys(p).forEach((k) => {
    const v = p[k];
    if (v == null || v === false) return;
    if (k === 'class') { n.className = v; return; }
    if (k === 'text') { n.textContent = String(v); return; }
    if (k.length > 2 && k.slice(0, 2) === 'on' && typeof v === 'function') {
      n.addEventListener(k.slice(2).toLowerCase(), v);
      return;
    }
    /* Property AND attribute. The property is what the browser reads back on
       submit; the attribute is what `.btn[disabled]` in app.css and any test
       harness can see. Setting only one of the two has bitten this build. */
    if (k === 'disabled' || k === 'checked' || k === 'selected' || k === 'required') {
      n[k] = true;
      n.setAttribute(k, '');
      return;
    }
    if (k === 'value') { n.value = v; n.setAttribute('value', String(v)); return; }
    n.setAttribute(k, v === true ? '' : String(v));
  });
  add(n, kids);
  return n;
}

function add(host, kids) {
  if (kids == null || kids === false) return host;
  if (Array.isArray(kids)) { kids.forEach((k) => add(host, k)); return host; }
  if (typeof kids === 'string' || typeof kids === 'number') {
    host.appendChild(document.createTextNode(String(kids)));
    return host;
  }
  host.appendChild(kids);
  return host;
}

function clear(host) {
  while (host.firstChild) host.removeChild(host.firstChild);
  return host;
}

function put(host, node) { clear(host); return add(host, node); }

function enable(node, on) {
  node.disabled = !on;
  if (on) node.removeAttribute('disabled'); else node.setAttribute('disabled', '');
}

/* -------------------------------------------------------------- the words ---
   Every instant is printed in UTC. The compliance deadlines are computed in
   UTC, and rendering the same instant in the viewer's local time has already
   put an opening screen of this product in the wrong hour of the working day
   once.
   ------------------------------------------------------------------------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];

function pad(n) { return (n < 10 ? '0' : '') + n; }

export function fmtDay(ms) {
  if (ms == null) return null;
  const d = new Date(ms);
  return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

export function fmtTime(ms) {
  if (ms == null) return null;
  const d = new Date(ms);
  return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' UTC';
}

/* `countdown` was here. It formatted the notice clock, the notice clock is off
   this surface, and a countdown formatter with no caller is the kind of dead
   export somebody wires back up. */

function plural(n, one, many) { return n === 1 ? one : many; }

/* ------------------------------------------------------------- the pieces --- */

/** An owner chip: hue, glyph and word together, so colour is never alone. */
function ownerChip(actor, text) {
  return el('span', { class: 'chip own-' + (actor === 'external' ? 'system' : actor) },
    [glyph(actor, { size: 10 }), el('span', { text })]);
}

/** The dashed badge that means "not the real thing" throughout this build. */
function simBadge(text) { return el('span', { class: 'sim', text }); }

/** A tone chip, and it never travels without its number. U-101. */
function toneChip(tone, n, text) {
  return el('span', { class: 'chip is-' + tone },
    [el('span', { class: 'v', text: String(n) }), el('span', { text })]);
}

function chipRow(kids) { return el('div', { class: 'chiprow' }, kids); }

/**
 * A card.
 *
 * A NULL TITLE IS A CARD WITH NO HEADER, and that is the point of it. The page
 * has an h1 naming its subject now, so a card immediately below it headed with
 * the same words in an h2 was the same sentence twice at two weights. Where the
 * card IS the subject it keeps its heading; where the page already said it, the
 * header goes and the border stays.
 */
function card(title, sub, body, opts) {
  const o = opts || {};
  return el('div', { class: 'card' }, [
    title
      ? el('div', { class: 'card-hd' }, [
          el('h2', { text: title }),
          sub ? el('span', { class: 'sub', text: sub }) : null
        ])
      : null,
    el('div', { class: 'card-bd' + (o.flush ? ' flush' : '') }, body)
  ]);
}

/**
 * THE PRODUCT'S VOICE. Something we got wrong: what, when, the real message,
 * who owns it. The timestamp and the monospace are deliberate, because the
 * reader of this block is whoever has to go and fix it.
 *
 * It must never carry a person's own mistake. See `fixBlock`.
 */
function failBlock(what, message, owner) {
  const now = Date.now();
  return el('div', { class: 'fail' }, [
    el('div', { class: 'fail-what', text: what }),
    el('div', { class: 'fail-when', text: fmtDay(now) + ', ' + fmtTime(now) }),
    message ? el('pre', { class: 'fail-err', text: String(message) }) : null,
    owner ? el('div', { class: 'small muted prose', text: owner }) : null
  ]);
}

/**
 * THE PERSON'S VOICE. Something they can change, said the way somebody says it
 * out loud.
 *
 * THE DEFECT THIS EXISTS TO KILL. Submitting with no shift ticked used to
 * render `failBlock`, so a missed tick came back as a red box headed "The
 * application was not accepted.", stamped "8 September 2026, 12:13 UTC", with
 * the reason in a monospace pre. A person reads "not accepted" as rejected,
 * and a timestamp on their own typo reads as a fault log. They had not been
 * rejected: nothing had been sent.
 *
 * So: no timestamp, no monospace, no verdict, and the sentence says what to do
 * rather than why the rule exists.
 */
function fixBlock(what, detail) {
  return el('div', { class: 'fixme' }, [
    el('div', { class: 'fixme-what', text: what }),
    detail ? el('div', { class: 'fixme-why prose', text: detail }) : null
  ]);
}

/* -------------------------------------------------------- kept on the phone ---
   A frontline applicant fills this in on a bus. A call arrives, or the browser
   reclaims the tab, and twenty-three controls of typing are gone with no
   warning. So the answers are written to this device as they are typed.

   THE DATE OF BIRTH IS DELIBERATELY NOT KEPT. It is a protected characteristic
   and it is also the identity key `rules.js` searches prior employment on, and
   this form is filled in on borrowed and in-store devices. One field retyped
   is a fair price for not leaving that on a shared phone.

   Every read and write is wrapped. A private window throws on access rather
   than returning null, and a page that cannot render because storage is off is
   worse than one that forgets.
   ------------------------------------------------------------------------- */

const KEPT_PREFIX = 'frontline.apply.';
const KEPT_SKIP = ['dateOfBirth'];

function keptKey(requisitionId) { return KEPT_PREFIX + (requisitionId || 'unknown'); }

export function keptRead(requisitionId) {
  try {
    const raw = window.localStorage.getItem(keptKey(requisitionId));
    if (!raw) return null;
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : null;
  } catch (e) { return null; }
}

export function keptWrite(requisitionId, values) {
  try {
    const out = {};
    Object.keys(values || {}).forEach((k) => {
      if (KEPT_SKIP.indexOf(k) >= 0) return;
      const v = values[k];
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
      out[k] = v;
    });
    if (!Object.keys(out).length) { keptClear(requisitionId); return false; }
    window.localStorage.setItem(keptKey(requisitionId), JSON.stringify(out));
    return true;
  } catch (e) { return false; }
}

export function keptClear(requisitionId) {
  try { window.localStorage.removeItem(keptKey(requisitionId)); return true; }
  catch (e) { return false; }
}

/* ============================================================================
   U-55.  THE DEMONSTRATION MARKER

   Rendered from `org.fictional`, in three cases rather than two, and the third
   one was found by running the page against a server that was not answering.

     the flag is false        no marker at all
     the flag is true         the record's own sentence, or one derived from it
     no record arrived        a marker that says we could not read the record

   The third case matters both ways round. It has to keep the marker, because
   somebody who believes an unmarked page is a real employer is the worse of
   the two mistakes. But it must not print "the record says", because we never
   read the record. Asserting a property of a row we could not load is the
   quiet kind of dishonesty this build has already been caught by once.
   ============================================================================ */

export function renderMarker(org) {
  if (org == null) {
    return el('div', { class: 'sim-note' }, [
      simBadge('Demonstration'), ' ',
      el('span', { text: 'This page could not read who it belongs to, so it is treated as a ' +
                         'demonstration. Do not assume an application here reaches a real employer.' })
    ]);
  }
  if (org.fictional === false) return null;
  /* The fallback wording is the page's, the FACT is the record's. It used to
     read "The organisation behind this page is marked fictional in the record
     it comes from", which is the build describing its own data model to
     somebody applying for a job, and in British spelling on a US careers
     page. Same fact, said the way a person says it. */
  const words = org.marker ||
    ((org.name ? org.name + ' is not a real company' : 'This is not a real company') +
     ', and no application here reaches a real employer.');
  return el('div', { class: 'sim-note' }, [simBadge('Demonstration'), ' ', el('span', { text: words })]);
}

/* ============================================================================
   THE RAIL

   Four phases named, with the one you are on marked. Not a progress bar: a bar
   claims a proportion and nobody measured one.
   ============================================================================ */

const PHASES = [
  { key: 'list', label: 'Open roles' },
  { key: 'gate', label: 'How this works' },
  { key: 'form', label: 'Your details' },
  { key: 'sent', label: 'Sent' }
];

export function renderRail(phase, opts) {
  const o = opts || {};
  const at = PHASES.findIndex((p) => p.key === phase);
  /* A step nobody is on is not a step. The 404 has no place in this sequence
     and drawing it there put a person on a four step journey they had not
     started. */
  if (at < 0) return null;
  const kids = [];
  PHASES.forEach((p, i) => {
    if (i) kids.push(el('span', { class: 'sep faint', 'aria-hidden': 'true', text: '/' }));
    /* A step already passed is a way back. Everything ahead is a word, because
       a link to a phase that has not been reached is a link that cannot work:
       the form does not exist before the notice has been accepted. */
    if (i < at && o.back) {
      kids.push(el('button', {
        class: 'done', type: 'button', text: p.label,
        onclick: () => o.back(p.key)
      }));
      return;
    }
    kids.push(el('span', {
      class: i === at ? 'at' : 'ahead',
      'aria-current': i === at ? 'step' : null,
      text: p.label
    }));
  });
  return el('nav', { class: 'rail', 'aria-label': 'Where you are in this application' }, kids);
}

/* ============================================================================
   THE PAGE HEADER

   ONE OBVIOUS PRIMARY HEADING PER PAGE, and it is an h1.

   THE DEFECT. Every candidate screen opened with a card whose header was an
   h2, so the page's own name was the same size and weight as the name of a box
   inside it, and on the role page the largest words on screen were "Before you
   apply" rather than the job somebody had just clicked. A person landing from a
   link could not tell what they were looking at.
   ============================================================================ */

export function pubHead(h1, lede, meta) {
  return el('header', { class: 'pub-head' }, [
    el('h1', { text: h1 }),
    lede ? el('p', { class: 'pub-lede prose measure', text: lede }) : null,
    (meta && meta.length) ? el('div', { class: 'pub-meta' }, meta) : null
  ]);
}

/* ============================================================================
   U-84.  THE FILTERS

   Two selects over one border. The store list, the role list and the default
   store all come from the payload.
   ============================================================================ */

export function renderFilters(careers, filters, onChange) {
  const c = careers || {};
  const f = filters || {};

  const storeSel = el('select', {
    id: 'f-store',
    onchange: (e) => onChange({ storeId: e.target.value, role: f.role || '' })
  }, [el('option', { value: '', text: 'Every store' })].concat(
    (c.stores || []).map((s) => el('option', Object.assign({
      value: s.id,
      text: s.name + (s.city ? ', ' + s.city : '') + (s.state ? ' ' + s.state : '')
    }, s.id === f.storeId ? { selected: true } : {})))
  ));

  const roleSel = el('select', {
    id: 'f-role',
    onchange: (e) => onChange({ storeId: f.storeId || '', role: e.target.value })
  }, [el('option', { value: '', text: 'Every role' })].concat(
    (c.roles || []).map((r) => el('option', Object.assign(
      { value: r, text: r }, r === f.role ? { selected: true } : {})))
  ));

  const shown = (c.jobs || []).length;
  const total = c.total != null ? c.total : shown;

  return el('div', { class: 'filters' }, [
    el('label', { class: 'field f-store', for: 'f-store' },
      [el('span', { class: 'lab', text: 'Store' }), storeSel]),
    el('label', { class: 'field f-role', for: 'f-role' },
      [el('span', { class: 'lab', text: 'Role' }), roleSel]),
    el('div', { class: 'f-count micro faint',
      text: shown + ' of ' + total + ' ' + plural(total, 'open role', 'open roles') })
  ]);
}

/**
 * Why the list starts narrowed, said to a candidate rather than to the build.
 *
 * U-84 defaults the store filter because five of the eight open requisitions
 * belong to stores whose work surfaces this demonstration does not carry.
 *
 * IT USED TO SAY SO IN THOSE WORDS: "The rest of this demonstration is scoped
 * to that store, so an application to any other one cannot be followed through
 * it." Demonstration, scoped and followed through are the build talking about
 * itself on the one page a real applicant reads, and the permanent marker at
 * the top of every phase already says this is a demonstration. So the note
 * keeps the fact a candidate needs, which is that a filter is on and how to
 * take it off, and drops the rest.
 */
export function renderDefaultNote(careers, filters, onClear) {
  const c = careers || {};
  const f = filters || {};
  if (!c.defaultStoreId || f.storeId !== c.defaultStoreId) return null;
  const home = (c.stores || []).find((s) => s.id === c.defaultStoreId);
  const total = c.total != null ? c.total : (c.jobs || []).length;
  return el('p', { class: 'copy small muted' }, [
    el('span', { text: 'Showing roles at ' + (home ? home.name : 'one store') + '. ' }),
    el('button', { class: 'btn sm', type: 'button', onclick: () => onClear(),
                   text: 'Show all ' + total + ' roles' })
  ]);
}

/* ============================================================================
   THE JOB LIST

   Eight jobs, ONE border. Rows differ in height because the requisitions
   differ in how many shifts they need, which is U-105 satisfied by the data
   rather than by decoration.
   ============================================================================ */

export function renderJobList(careers, onPick) {
  const c = careers || {};
  const jobs = c.jobs || [];
  if (!jobs.length) return renderNoJobs(c);

  const rows = jobs.map((j) => el('button', {
    class: 'job', type: 'button', onclick: () => onPick(j.id)
  }, [
    el('div', {}, [
      el('div', { class: 'job-t', text: j.title }),
      el('div', { class: 'job-where', text: whereOf(j) })
    ]),
    el('div', { class: 'job-pay' }, [
      /* THE UNIT IS NOT A NUMBER. `rate` arrives as "$16.50 an hour" and the
         whole string was set in the monospace face at heavy weight, so "an
         hour" rendered as though it were data. The figure keeps the mono; the
         words do not. */
      rateParts(j.rate),
      el('span', { class: 'job-hrs',
        text: j.hoursPerWeek != null ? j.hoursPerWeek + ' hours a week' : 'Hours not set' })
    ]),
    el('div', { class: 'job-shifts' }, [
      j.openings != null
        ? el('span', { class: 'chip' }, [el('span', { class: 'v', text: String(j.openings) }),
                                         el('span', { text: plural(j.openings, 'opening', 'openings') })])
        : null,
      (j.slotLabels || []).map((s) => el('span', { class: 'chip', text: s })),
      j.managerInterview ? ownerChip('human', 'Manager interview') : null
    ])
  ]));

  return card(null, null, el('div', { class: 'joblist' }, rows), { flush: true });
}

/** The figure in the numeric face, the unit in the reading face. */
function rateParts(rate) {
  if (!rate) return el('span', { class: 'job-rate', text: 'Rate not set' });
  const m = String(rate).match(/^(\S+)\s+(.*)$/);
  if (!m) return el('span', { class: 'job-rate', text: String(rate) });
  return el('span', {}, [
    el('span', { class: 'job-rate', text: m[1] }),
    el('span', { class: 'job-per', text: ' ' + m[2] })
  ]);
}

function whereOf(j) {
  const s = j && j.store;
  if (!s) return 'Store not named';
  return s.name + (s.city ? ', ' + s.city + (s.state ? ' ' + s.state : '') : '');
}

/** An empty state that says what the system did, never "No data". */
function renderNoJobs(c) {
  const total = c.total != null ? c.total : 0;
  return card(null, null, el('div', { class: 'empty' }, [
    el('div', { class: 'empty-title', text: 'Nothing open on those two filters' }),
    el('div', { class: 'empty-body prose',
      text: 'Both filters were applied to the open requisitions and no role matched both of them. ' +
            'Widening either one brings roles back.' }),
    el('div', { class: 'empty-stat',
      text: total + ' ' + plural(total, 'role is', 'roles are') + ' open in total' })
  ]));
}

/* ============================================================================
   U-87.  THE JOB, AND WHAT IT WILL MEASURE

   The facts a retailer prints, plus the three things eligibility is about to
   check: the shifts, the minimum age and the commute band. They are here above
   the form, and again beside the inputs they govern.
   ============================================================================ */

/**
 * Two sizes, and the reason is measured.
 *
 * The full head is 350px on a 390px phone. Above the gate that 350px pushed
 * the consent tick box a further third of a screen down, on a screen that is
 * about the process rather than about the job, and the same block is rendered
 * again above the form where U-87 actually wants the constraints. So the gate
 * gets `{ compact: true }`, which is the title, the store, the pay and the
 * hours, and the form gets the whole thing.
 */
export function renderJobHead(job, opts) {
  const j = job || {};
  const o = opts || {};

  /* THE COMPACT FORM is a context bar, not a smaller card. It sits above the
     form to say which role is being applied for, in one line, because by that
     point the person has read the role page and is filling in boxes. A second
     card of facts there was 350px of scroll between them and the first input. */
  if (o.compact) {
    return el('div', { class: 'pub-ctx' }, [
      el('span', { class: 'ctx-t', text: j.title || 'This role' }),
      j.store ? el('span', { class: 'ctx-s', text: whereOf(j) }) : null,
      j.rate ? el('span', { class: 'ctx-v', text: j.rate }) : null,
      j.hoursPerWeek != null
        ? el('span', { class: 'ctx-v', text: j.hoursPerWeek + ' hours a week' }) : null
    ]);
  }

  /* THE ROLE PAGE HEADER. The six questions a candidate has, answered above
     the fold and in this order: what is this, where is it, what does it pay,
     how many hours, what shifts does it need, what happens when I apply. The
     last of those is the section below this one. */
  const facts = [
    ['Pay', j.rate, 'v-rate'],
    ['Hours', j.hoursPerWeek != null ? j.hoursPerWeek + ' a week' : null, null],
    ['Minimum age', j.minAge != null ? String(j.minAge) : null, null],
    ['Commute band', j.maxDistanceMiles != null ? 'Within ' + j.maxDistanceMiles + ' miles' : null, null],
    ['Posted', j.postedAt != null ? fmtDay(j.postedAt) : null, null]
  ].filter((f) => f[1]);

  return el('div', { class: 'jobhead' }, [
    pubHead(j.title || 'This role', null,
      j.store ? [el('span', { class: 'where', text: whereOf(j) })] : null),
    j.summary ? el('p', { class: 'copy prose measure lead', text: j.summary }) : null,
    el('div', { class: 'facts' }, facts.map((f) => el('div', { class: 'fact' }, [
      el('span', { class: 'k', text: f[0] }),
      f[2] === 'v-rate'
        ? el('span', { class: 'v v-rate' }, rateParts(f[1]))
        : el('span', { class: 'v', text: f[1] })
    ]))),
    (j.slotLabels || []).length
      ? el('div', { class: 'needshifts' }, [
          el('div', { class: 'micro faint', text: 'Shifts this role needs' }),
          el('div', { class: 'job-shifts' }, j.slotLabels.map((s) => ownerChip('human', s)))
        ])
      : null,
    /* ONLY WHEN THE ROLE'S OWN SUMMARY HAS NOT ALREADY SAID IT. On the Deli
       Associate the requisition reads "A manager interview is required for
       fresh food roles" and this line printed the same fact again four
       sentences later. */
    (j.managerInterview && !/manager interview/i.test(String(j.summary || '')))
      ? el('p', { class: 'copy small muted prose afternote',
          text: 'A manager interview follows the screening call for this role.' })
      : null
  ]);
}

/* ============================================================================
   U-86.  THE DISCLOSURE GATE

   Before the form. It applies the strictest rule tenant-wide and says that it
   does. It carries the published bias audit link, and it is where the consent
   and retention record begins.

   THE DEFECT THIS SHAPE FIXES, and it is the worst thing that was on this page.

   Measured on 8 September 2026 at 390 by 844, the gate phase came to 2,631px
   of document, about three and an eighth screens, with the tick box 2,215px
   down. It said the same thing twice: three actor rows with a sentence each,
   then six paragraphs restating those same three facts in statutory language.
   Two demonstration markers were on screen at once, the page's own and the
   disclosure's. And a running countdown in large monospace inside an amber box
   was the loudest thing a candidate saw, reading 0d 00h 00m 00s.

   Somebody applying on a bus does not scroll three screens to find a tick box.

   SO: PROGRESSIVE DISCLOSURE, AND THE LINE IT MUST NOT CROSS.

   What is on screen by default is the plain summary: who does what, what is
   kept and for how long, and the published audit link. What is one tap away is
   the full statutory notice, all six paragraphs, each still carrying the law
   that requires it.

   The tap is not a hint. It is a bordered full-width control that names what is
   behind it and counts the paragraphs, it sits directly above the tick box so
   it cannot be scrolled past, and the tick box's own line says the person is
   agreeing to that notice. Hiding a statutory notice behind a control nobody
   opens would be worse than the wall of text. Making it reachable in one
   labelled tap is not hiding it.

   WHAT WAS TAKEN OFF THIS SCREEN, AND WHERE IT WENT.

   The ten business day notice countdown. It is an operator control, not a
   notice: NYC Local Law 144 requires the candidate be TOLD, at least ten
   business days ahead, that an automated tool will be used and how to ask for
   an alternative. Paragraph three does that and it is still here. The clock
   that proves the period ran is what the store needs, and `compliance.js`
   already computes it as `aedt_notice` with the same title and the same
   citation, so nothing is lost by removing the copy that was on the phone.

   It was also wrong. `renderClock` read `clock.now` for its offset, and no
   payload has ever carried that field: the server's present arrives on the
   envelope and `ask()` returns it as `res.now`. With the offset silently zero
   the countdown was measured against the browser's real clock, and because the
   demo's present is wound back to 17 August the due date was already in the
   past, so it floored at zero. A statutory notice period that has not started
   was printing as fully elapsed, on a candidate's phone, in the largest type
   on the page.
   ============================================================================ */

/* The one sentence on this page that is not in the payload. U-86 requires the
   gate to state that the strictest rule is applied everywhere, and the
   disclosure record has no field for it yet, so it is written here and read
   from `disclosure.scopeNote` the moment the server carries one.

   It says the rules are applied at every store. It does NOT say this store is
   in New York City or in California, because none of the five is, and implying
   a jurisdiction we do not have is the thing U-86 refuses. */
const SCOPE_SENTENCE =
  'The rules below come from New York City and from California. This retailer applies them at ' +
  'every store, including this one, rather than only where they are the law.';

/* Who does what, in the same three actors the rest of the product uses. Every
   claim is a restatement of a paragraph the server sent or of a property of the
   code: the rules module runs no model, and the approve and reject moves in the
   state machine are marked as a person's alone. */
const ACTORS = [
  { actor: 'agent', who: 'An AI voice assistant asks the questions',
    what: 'It calls you, asks the questions this role asks everybody, and writes down what you said.' },
  { actor: 'human', who: 'A named person at the store decides',
    what: 'The assistant cannot hire you and it cannot reject you. Somebody reads what you said and makes the decision.' },
  { actor: 'system', who: 'Fixed rules check the basics',
    what: 'Your age for the role, whether you can work in the United States, the shifts you tick, and how far away you are. No AI model runs on any of those.' }
];

/**
 * The full statutory notice, behind one labelled control.
 *
 * Everything that used to be printed inline is here, unchanged, including the
 * basis label on every paragraph. The summary counts them, so the control
 * cannot read as an optional aside, and the scope sentence is the first thing
 * inside because it is the frame the six paragraphs are read in.
 */
function renderFullNotice(d) {
  const paras = d.paragraphs || [];
  return el('details', { class: 'notice' }, [
    el('summary', { class: 'notice-sum' }, [
      el('span', { class: 'notice-sum-t', text: 'Read the full notice' }),
      el('span', { class: 'notice-sum-n', text: paras.length
        ? paras.length + ' ' + plural(paras.length, 'paragraph', 'paragraphs') + ', and the law each one comes from'
        : 'and the law each part comes from' })
    ]),
    el('div', { class: 'notice-bd' }, [
      el('p', { class: 'copy prose measure', text: d.scopeNote || SCOPE_SENTENCE }),
      el('div', { class: 'measure' }, paras.map((p) => el('div', { class: 'para' }, [
        p.basis ? el('span', { class: 'basis', text: p.basis }) : null,
        el('div', { class: 'text prose', text: p.text })
      ]))),
      d.id
        ? el('p', { class: 'copy small faint prose',
            text: 'This is notice ' + d.id + ', version ' +
                  (d.version != null ? d.version : 'not stated') + '.' })
        : null
    ])
  ]);
}

export function renderGate(disclosure, opts) {
  const d = disclosure || {};
  const o = opts || {};

  /* The primary control, and it starts refused. The reason it is refused is
     printed beside it rather than left for somebody to work out from a pale
     button, which is what a disabled control with no explanation is. */
  const go = el('button', {
    class: 'btn primary lg', type: 'button', disabled: true,
    onclick: () => o.onAccept && o.onAccept(),
    text: 'Continue to the form'
  });
  const why = el('span', { class: 'ctahint', text: 'Tick the box above first.' });

  const box = el('input', {
    type: 'checkbox', id: 'consent',
    onchange: (e) => {
      const on = !!e.target.checked;
      enable(go, on);
      why.textContent = on ? 'Nothing is sent yet. The next screen is the form.'
                           : 'Tick the box above first.';
    }
  });

  /* The disclosure's own demoNote is NOT rendered. `renderMarker` already puts
     the tenant's marker at the top of every phase, and the two sentences said
     the same thing eight lines apart. Two markers do not make a page twice as
     honest, they make the first one look like decoration. The marker that
     survives is the one U-55 requires, read from `org.fictional`. */

  /* The sub-heading only when the server has NOT sent a title, because the one
     it sends is "Before you apply, how this hiring process works" and adding a
     sub to that printed the second half of the sentence twice. */
  return card(d.title || 'Before you apply', d.title ? null : 'How this hiring process works', [
    /* THREE STEPS, NUMBERED. They were three rows with a glyph each, which read
       as three unrelated facts. They are a sequence: the call happens, the
       fixed rules run, a named person decides, and the numbering is what says
       so. The glyph and the hue still carry the actor, because colour is never
       the only carrier here. */
    el('ol', { class: 'actors' }, ACTORS.map((a, i) => el('li', { class: 'actor own-' + a.actor }, [
      el('span', { class: 'actor-n', 'aria-hidden': 'true', text: String(i + 1) }),
      el('div', { class: 'actor-b' }, [
        el('div', { class: 'who' }, [glyph(a.actor), el('span', { text: a.who })]),
        el('div', { class: 'what prose', text: a.what })
      ])
    ]))),

    /* The one fact out of the six paragraphs that a person asks about
       unprompted. It is a restatement of the retention paragraph, not a new
       claim, and the paragraph itself is a tap away. */
    el('p', { class: 'copy small muted prose measure',
      text: 'What you tell us is kept for four years and then deleted. You can ask for a copy of ' +
            'it, or ask us to delete it sooner, by replying to the email you are about to get.' }),

    /* NYC Local Law 144 requires the bias audit to be published, so the link
       stays on the default view rather than going behind the control. */
    d.auditUrl
      ? el('p', { class: 'copy' }, el('a', {
          href: d.auditUrl, target: '_blank', rel: 'noopener noreferrer',
          text: 'Read the published independent bias audit of this tool'
        }))
      /* It used to say "No bias audit link came back from the server, so none
         is shown here. A link to one is not invented." Server and invented are
         not words in a conversation with an employer. The rule holds and the
         link is still never guessed. */
      : el('p', { class: 'copy small muted prose measure',
          text: 'The independent bias audit of this tool is published, but no link to it reached ' +
                'this page. You can ask for it by replying to the email you are about to get.' }),

    renderFullNotice(d),

    el('label', { class: 'checkline measure', for: 'consent' }, [
      box,
      el('span', { class: 't' }, [
        el('span', { class: 'checkline-main',
          text: 'I have read the notice above and I want to apply.' }),
        /* `small`, not `micro`. app.css puts text-transform: uppercase on
           `.micro`, so this sentence shouted twenty-two words of record-keeping
           detail at somebody in the middle of ticking a box. */
        el('span', { class: 'small faint sub-line',
          text: 'This records which version you were shown, and when.' })
      ])
    ]),

    el('div', { class: 'form-ft' }, [
      go,
      el('button', { class: 'btn', type: 'button', text: 'Back to open roles',
                     onclick: () => o.onBack && o.onBack() }),
      why
    ])
  ]);
}

/* ============================================================================
   WHERE THE NOTICE CLOCK WENT

   `renderClock` was here and it is gone on purpose, so nobody puts it back by
   reflex. Read the note on the gate above for why: it is an operator control
   rather than a notice, `compliance.js` already computes the same
   `aedt_notice` clock with the same citation for the surface whose reader
   needs it, and the copy on the phone was printing a statutory notice period
   as fully elapsed when it had not started.

   If a candidate-facing countdown is ever wanted again, the server's present
   has to travel with it. It arrives on the envelope and `ask()` hands it back
   as `res.now`; it has never been a field on the clock, which is the bug that
   made the old one read zero.
   ============================================================================ */

/* ============================================================================
   U-89.  THE SHIFT GRID

   Three parts of the day down, seven days across, thirteen boxes. The other
   eight cells do not exist, because this rota does not run those shifts and
   inventing them would put a tick box on the form that no requisition could
   ever require.

   The cells this requisition needs are marked in colour AND in words, which is
   the whole of U-98 in one component.
   ============================================================================ */

export function renderSlotGrid(slotGrid, requiredSlots, chosen, onToggle) {
  const grid = (slotGrid && slotGrid.length) ? slotGrid : SLOTS.grid();
  const need = requiredSlots || [];
  const have = chosen || [];
  const days = ((grid[0] && grid[0].cells) || []).map((c) => c.day);
  const inputs = {};

  const head = el('tr', {}, [el('th', { class: 'part-h', scope: 'col', text: 'Shift' })].concat(
    days.map((d) => el('th', { class: 'd', scope: 'col', title: d.name, text: d.short }))
  ));

  const body = grid.map((row) => el('tr', {}, [
    el('th', { class: 'part', scope: 'row' }, [
      el('span', { class: 'p', text: row.part.label }),
      row.part.hours ? el('span', { class: 'hrs', text: row.part.hours }) : null
    ])
  ].concat(row.cells.map((cell) => {
    if (!cell.exists) {
      return el('td', {}, el('div', { class: 'cell off' }, el('span', { class: 'none', text: 'No shift' })));
    }
    const required = need.indexOf(cell.key) >= 0;
    const label = SLOTS.label(cell.key) || cell.key;
    const input = el('input', Object.assign({
      type: 'checkbox', name: 'availability', value: cell.key,
      'aria-label': label + (required ? ', needed for this role' : ''),
      onchange: (e) => onToggle(cell.key, !!e.target.checked)
    }, have.indexOf(cell.key) >= 0 ? { checked: true } : {}));
    inputs[cell.key] = input;
    return el('td', {}, el('label', { class: 'cell' + (required ? ' need own-human' : ''), title: label },
      [input, required ? el('span', { class: 'req', text: 'Needed' }) : null]));
  }))));

  const node = el('div', {}, [
    /* ABOVE the grid, not below it. Somebody reads this before they scroll
       rather than after they have already missed Saturday. A grid of empty
       boxes with no cue that it scrolls is half of why the required weekend
       boxes went unseen; the other half was the required boxes being in here
       at all, and they are not any more. */
    el('div', { class: 'slothint', text: 'The week scrolls sideways to Sunday.' }),
    el('div', { class: 'slotwrap' },
      el('table', { class: 'slots' }, [el('thead', {}, head), el('tbody', {}, body)])),
    el('div', { class: 'legend',
      text: 'Cells reading no shift are days and times this store does not roster.' })
  ]);

  /* The same slot can be answered in two places now, here and on a required
     row above. The array is shared but the two sets of controls are not, so a
     caller reflects a change made elsewhere through this. */
  node.reflect = function (key, on) {
    const input = inputs[key];
    if (!input) return;
    input.checked = !!on;
    if (on) input.setAttribute('checked', ''); else input.removeAttribute('checked');
  };
  return node;
}

/* ============================================================================
   U-87 AND U-98.  THE SHIFTS THIS ROLE NEEDS

   THE DEFECT. Measured on a 390px phone: the grid wrapper is 324px wide and
   the table is 435px. Saturday's column starts at x=319 and Sunday's at x=377,
   so on the Deli Associate role BOTH shifts the requisition requires were off
   the right edge, inside a sideways scroll nested in a vertically scrolling
   page. What a candidate sees is a grid of empty boxes with no sign that the
   answer the role needs is somewhere to the right. Six of the eight open
   requisitions require a Saturday or a Sunday slot.

   Reproduced end to end: ticking the three boxes that WERE visible submitted,
   and eligibility answered "This role needs shifts that are not among the ones
   you ticked." A person was refused a job because two tick boxes were off the
   edge of their phone.

   SO the shifts a role requires are asked first, as full-width rows, one per
   shift, with Yes and No. Nothing horizontal, nothing to discover. The grid
   stays for anybody who wants to offer more, and it is optional and folded.

   WHY YES AND NO RATHER THAN A TICK. An untouched tick box and "no I cannot
   work Saturdays" are different answers and the second one deserves a reply.
   Answering No prints the constraint next to the row, which is U-87 done at
   the input rather than in a refusal afterwards. It does not block the
   submission: the rule is the server's and a person is allowed to apply to a
   role they do not fit.
   ============================================================================ */

export function renderRequiredShifts(requiredSlots, chosen, onToggle) {
  const need = (requiredSlots || []).filter(SLOTS.valid);
  if (!need.length) return null;
  const have = chosen || [];
  const rows = {};

  const list = need.map((key) => {
    const part = SLOTS.partOf(key);
    const note = el('div', { class: 'nshift-note' });
    const name = 'need_' + key;

    function pick(yes) {
      clear(note);
      if (!yes) {
        add(note, el('span', {
          text: 'This role needs this shift covered. You can still apply, and somebody at the ' +
                'store will see your answer.'
        }));
      }
      onToggle(key, yes);
    }

    /* Only Yes is ever pre-selected, and only from a restored answer. `chosen`
       records the shifts somebody CAN work, so a restored No is
       indistinguishable from a question nobody has reached yet. Rather than
       guess, the row comes back unanswered and asks again. */
    const opt = (v) => el('label', { class: 'nshift-opt' }, [
      el('input', Object.assign({
        type: 'radio', name: name, value: v,
        'aria-label': (SLOTS.label(key) || key) + ', ' + v,
        onchange: () => pick(v === 'yes')
      }, v === 'yes' && have.indexOf(key) >= 0 ? { checked: true } : {})),
      el('span', { text: v === 'yes' ? 'Yes' : 'No' })
    ]);

    const row = el('div', { class: 'nshift own-human' }, [
      el('div', { class: 'nshift-t' }, [
        el('span', { class: 'd', text: SLOTS.label(key) || key }),
        part && part.hours ? el('span', { class: 'h', text: part.hours }) : null
      ]),
      el('div', { class: 'nshift-a' }, [opt('yes'), opt('no')]),
      note
    ]);
    rows[key] = row;
    return row;
  });

  const node = el('div', { class: 'nshifts' }, list);
  /* Unanswered is not the same as No, so the form can mark the rows that were
     skipped rather than one error at the bottom of the page. */
  node.unanswered = function () {
    return need.filter((key) => !rows[key].querySelector('input:checked'));
  };

  /* Whether marking is switched on at all. Rows are never marked before
     somebody has pressed send, because marking a question they have not
     reached yet is telling them off for nothing. */
  let marking = false;

  node.mark = function (keys) {
    const list2 = keys || [];
    marking = list2.length > 0;
    need.forEach((key) => rows[key].classList.remove('bad'));
    list2.forEach((key) => { if (rows[key]) rows[key].classList.add('bad'); });
  };

  /**
   * Re-mark whatever is STILL unanswered.
   *
   * Answering one row used to clear every mark, so on a role needing two
   * shifts, answering the first one took the mark off the second while its
   * error sentence stayed on screen. A row keeps its mark until it is answered
   * and no longer.
   */
  node.refresh = function () {
    if (!marking) return;
    const left = node.unanswered();
    need.forEach((key) => rows[key].classList.remove('bad'));
    left.forEach((key) => rows[key].classList.add('bad'));
    marking = left.length > 0;
  };
  node.firstControl = function (key) {
    const r = rows[key] || rows[need[0]];
    return r ? r.querySelector('input') : null;
  };
  return node;
}

/* ============================================================================
   U-87.  THE FORM

   Only what the five rules need, plus an email address and one line about
   experience. No social security number: nothing in the rules reads one, the
   Form I-9 that does comes after an offer, and collecting it here would start
   a retention obligation for no purpose.

   The field list is the SERVER's, so what is collected is a reviewable record
   rather than markup and adding a field is a change to a list.

   The returned node carries three methods, because a rejected application must
   not cost somebody a filled form on demo day:
     form.showProblems(message, problems, mine)  errors onto their own fields
     form.setBusy(on)                            stops a second submission
     form.isDirty()                              has anything been typed yet
   ============================================================================ */

export function renderForm(payload, opts) {
  const p = payload || {};
  const job = p.job || {};
  const o = opts || {};
  const bands = p.commuteBands || [];
  const chosen = [];
  const errSlots = {};
  const fieldNodes = {};
  const kept = o.kept || null;
  let needShifts = null;
  let grid = null;

  /* NOT `.micro`. app.css puts text-transform: uppercase on it, so the moment
     somebody answered the distance question they were handed twenty-five words
     of capitals reading SIMULATED DISTANCE SCORED AS 8 MILES, WHICH IS THE
     MIDDLE OF THE BAND YOU PICKED. NOTHING HERE MEASURES A REAL DISTANCE AND
     NO ADDRESS IS COLLECTED. Shouting at somebody for answering a question
     teaches them to stop answering. */
  const bandNote = el('span', { class: 'bandnote' });
  const formErr = el('div', { class: 'formerr' });

  function setBandNote(key) {
    const band = bands.find((b) => b.key === key);
    clear(bandNote);
    if (!band) return;
    /* THE SIMULATED BADGE IS GONE ON PURPOSE, and it is not laxity.
       U-88 was written expecting a stub distance, and a stub gets a badge under
       the rule that a simulated integration is always visibly simulated. What
       was built is better than the decision: the candidate STATES a band, and a
       number somebody told us is a declaration rather than a simulated
       measurement. Badging a person's own answer as simulated says we faked it.

       The honesty that does matter is kept: the sentence says the figure is the
       middle of the band rather than a measured distance, and nothing on this
       page ever asks for an address. The label the operator side needs is
       "distance as stated by the applicant", and it belongs there. */
    add(bandNote, el('span', {
      text: 'Counted as about ' + band.miles + ' miles, the middle of that band.'
    }));
  }

  function slot(key) {
    const s = el('span', { class: 'err' });
    errSlots[key] = s;
    return s;
  }

  /** One shift answered, from either set of controls. */
  function take(key, on) {
    const i = chosen.indexOf(key);
    if (on && i < 0) chosen.push(key);
    if (!on && i >= 0) chosen.splice(i, 1);
    saveKept();
  }

  /* -------------------------------------------------- kept while they type ---
     Written on every change. See `keptWrite` for why the date of birth is left
     out of it. */

  let dirty = false;

  function saveKept() {
    dirty = true;
    if (!job.id) return;
    keptWrite(job.id, readForm(form, chosen));
  }

  /* The ticked shifts are seeded BEFORE the fields are built, because the grid
     and the required rows read `chosen` to decide what comes back checked. */
  if (kept && Array.isArray(kept.availability)) {
    kept.availability.forEach((key) => {
      if (SLOTS.valid(key) && chosen.indexOf(key) < 0) chosen.push(key);
    });
  }

  function restore(node) {
    if (!kept) return;
    Object.keys(kept).forEach((k) => {
      if (k === 'availability') return;
      const v = kept[k];
      if (k === 'rightToWork') {
        const r = node.querySelector('[name="rightToWork"][value="' + (v === true ? 'yes' : 'no') + '"]');
        if (r) { r.checked = true; r.setAttribute('checked', ''); }
        return;
      }
      const e = node.querySelector('[name="' + k + '"]');
      if (e && typeof v === 'string') {
        e.value = v;
        if (k === 'commuteBand') setBandNote(v);
      }
    });
  }

  /* OPTIONAL IS MARKED, REQUIRED IS NOT. Eight of the ten questions are
     required, so an asterisk on eight of them is noise and the two that are
     not are the information. The page says so once, above the form. */
  function optTag(f) {
    return f.required ? null : el('span', { class: 'opt', text: 'Optional' });
  }

  function labelled(f, control, chips) {
    const node = el('label', { class: 'field', for: 'f-' + f.key }, [
      el('span', { class: 'labrow' },
        [el('span', { class: 'lab', text: f.label }), optTag(f)].concat(chips || [])),
      f.why ? el('span', { class: 'why', text: f.why }) : null,
      control,
      slot(f.key)
    ]);
    fieldNodes[f.key] = node;
    return node;
  }

  function grouped(f, inner, chips) {
    const node = el('fieldset', { class: 'field' }, [
      el('legend', { class: 'lab', text: f.label }),
      ((chips && chips.length) || !f.required)
        ? el('div', { class: 'labrow' }, [optTag(f)].concat(chips || [])) : null,
      f.why ? el('span', { class: 'why', text: f.why }) : null,
      inner,
      slot(f.key)
    ]);
    fieldNodes[f.key] = node;
    return node;
  }

  function fieldOf(f) {
    if (f.type === 'boolean') {
      /* Two radios rather than one tick box. The rule passes on strictly true,
         so "not answered" and "answered no" have to be different states and an
         unticked box cannot express that difference. */
      return grouped(f, el('div', { class: 'yesno' }, ['yes', 'no'].map((v) =>
        el('label', {}, [
          el('input', { type: 'radio', name: f.key, value: v, required: f.required || null }),
          el('span', { text: v === 'yes' ? 'Yes' : 'No' })
        ]))));
    }

    if (f.type === 'slots') {
      const n = (job.slotLabels || []).length;
      const chips = n
        ? [el('span', { class: 'chip own-human' }, [el('span', { class: 'v', text: String(n) }),
            el('span', { text: plural(n, 'shift needed', 'shifts needed') })])]
        : [];

      grid = renderSlotGrid(p.slotGrid, p.requiredSlots, chosen, take);
      needShifts = renderRequiredShifts(p.requiredSlots, chosen, (key, on) => {
        take(key, on);
        /* Both sets of controls answer the same slot, so the grid follows the
           row rather than contradicting it. */
        if (grid && grid.reflect) grid.reflect(key, on);
        if (needShifts) needShifts.refresh();
      });

      /* The grid is folded when the role's own shifts have already been asked
         above it, and open when there is nothing above it to ask. A folded
         control is fine for "anything else you could work"; it would not be
         fine for the only place the required answer lives, which is what it
         used to be. */
      const extra = needShifts
        ? el('details', { class: 'moreshifts' }, [
            el('summary', { class: 'moreshifts-sum' }, [
              el('span', { class: 'moreshifts-sum-t', text: 'Add any other shifts you could work' }),
              el('span', { class: 'moreshifts-sum-n', text: 'Optional. The whole week, thirteen shifts' })
            ]),
            el('div', { class: 'moreshifts-bd' }, grid)
          ])
        : grid;

      return grouped(f, el('div', {}, [needShifts, extra]), chips);
    }

    if (f.type === 'band') {
      const sel = el('select', {
        id: 'f-' + f.key, name: f.key, required: f.required || null,
        onchange: (e) => setBandNote(e.target.value)
      }, [el('option', { value: '', text: 'Pick a distance' })].concat(
        bands.map((b) => el('option', { value: b.key, text: b.label }))));
      const chips = job.maxDistanceMiles != null
        ? [el('span', { class: 'chip' }, [el('span', { class: 'v', text: String(job.maxDistanceMiles) }),
            el('span', { text: 'mile band' })])]
        : [];
      return labelled(f, el('div', {}, [
        el('div', { class: 'bandrow' }, sel),
        el('div', { class: 'fieldnote' }, bandNote)
      ]), chips);
    }

    if (f.type === 'textarea') {
      /* No placeholder. It said "A sentence is plenty." under a label ending in
         Optional, under a group note that already said the same thing. */
      return labelled(f, el('textarea', { id: 'f-' + f.key, name: f.key, rows: '3' }));
    }

    if (f.type === 'select') {
      return labelled(f, el('select', { id: 'f-' + f.key, name: f.key },
        [el('option', { value: '', text: 'Rather not say' })].concat(
          (p.sources || []).map((s) => el('option', { value: s, text: s })))));
    }

    /* text, email, tel, date. The minimum age sits beside the date of birth
       and nowhere else, because that is the input it governs.

       The input is deliberately NOT capped with a `max` date. U-87 asks for
       the constraint to be VISIBLE, not for the failure to be unreachable, and
       silently refusing a date is worse than printing the bar and letting the
       honest branch run. */
    const chips = (f.key === 'dateOfBirth' && job.minAge != null)
      ? [el('span', { class: 'chip' }, [el('span', { class: 'v', text: String(job.minAge) }),
          el('span', { text: 'minimum age' })])]
      : [];

    if (f.key === 'dateOfBirth') {
      /* THE HINT, AND WHY IT IS A HINT.

         This is a three-wheel spinner on a phone that starts at today, so
         reaching 1994 means rolling the year wheel back thirty-two years while
         standing up. It is the slowest field on the form and it exists to
         answer one threshold question.

         Two typos were measured against the API: 2026-05-01 is refused with
         "This role has a minimum age and the date of birth you gave is below
         it", which gives no clue it was a slip of the year wheel, and
         1894-05-01 sails through, because nothing checks the other direction.

         So the year is checked HERE, before the submit, and the answer is a
         hint rather than a block. The cap stays off the input for the reason
         above, the rule stays the server's, and somebody is still allowed to
         send an application the rules will refuse. The only number used is the
         requisition's own minAge. There is no upper bound because this file
         has no sourced figure for one, and inventing "nobody is over 120" to
         put on a candidate's screen is not worth it. */
      const hint = el('div', { class: 'hint' });
      const input = el('input', {
        id: 'f-' + f.key, name: f.key, type: 'date', required: f.required || null,
        /* A phone can fill this from the contact card, which is the only way
           this field gets faster without changing what is collected. */
        autocomplete: 'bday',
        onchange: (e) => {
          clear(hint);
          const v = String(e.target.value || '');
          const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (!m) return;
          const born = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
          if (born > Date.now()) {
            add(hint, el('span', { text: 'That date is in the future. Check the year.' }));
            return;
          }
          if (job.minAge == null) return;
          const bar = Date.UTC(Number(m[1]) + job.minAge, Number(m[2]) - 1, Number(m[3]));
          if (bar > Date.now()) {
            add(hint, el('span', {
              text: 'Check the year. This role needs you to be ' + job.minAge + ' or over.'
            }));
          }
        }
      });
      return labelled(f, el('div', {}, [input, hint]), chips);
    }

    return labelled(f, el('input', {
      id: 'f-' + f.key, name: f.key, type: f.type || 'text',
      required: f.required || null,
      autocomplete: f.key === 'email' ? 'email'
        : (f.key === 'phone' ? 'tel'
        : (f.key === 'firstName' ? 'given-name'
        : (f.key === 'lastName' ? 'family-name' : null)))
    }), chips);
  }

  const send = el('button', { class: 'btn primary', type: 'submit', text: 'Send my application' });

  /* The restore line. It is a statement, not a question, because somebody who
     has just come back to a half-filled form wants the form, and it carries
     the way out for anybody on a shared phone. */
  const keptLine = kept
    ? el('div', { class: 'keptline' }, [
        el('span', { text: 'We kept what you typed on this phone, apart from your date of birth.' }),
        el('button', { class: 'btn sm', type: 'button', text: 'Start again',
          onclick: () => { keptClear(job.id); if (o.onReset) o.onReset(); } })
      ])
    : null;

  /* ---------------------------------------------------------- the groups ---
     FOUR SECTIONS, NOT TEN BOXES IN A COLUMN. The grouping and its wording are
     the SERVER's, on `fieldGroups`, for the same reason the field list is:
     what is collected and how it is explained to a candidate is a reviewable
     record rather than markup. A field whose group the payload does not
     describe still renders, in source order, under no heading, so an older
     server cannot make a question disappear. */
  const groups = p.fieldGroups || [];
  const fields = p.fields || [];
  const used = {};
  const sections = groups.map((g) => {
    const mine = fields.filter((f) => f.group === g.key);
    if (!mine.length) return null;
    mine.forEach((f) => { used[f.key] = true; });
    return el('section', { class: 'fgroup' }, [
      el('div', { class: 'fgroup-hd' }, [
        el('h3', { text: g.label }),
        g.note ? el('p', { class: 'fgroup-note prose', text: g.note }) : null
      ]),
      el('div', { class: 'fgroup-bd' }, mine.map(fieldOf))
    ]);
  }).filter(Boolean);
  const ungrouped = fields.filter((f) => !used[f.key]);
  if (ungrouped.length) sections.push(el('div', { class: 'fgroup-bd' }, ungrouped.map(fieldOf)));

  const form = el('form', { novalidate: null }, [
    keptLine,
    el('div', { class: 'fgroups' }, sections),
    formErr,
    el('div', { class: 'form-ft' }, [
      send,
      el('button', { class: 'btn', type: 'button', text: 'Back', onclick: () => o.onBack && o.onBack() }),
      el('span', { class: 'note', text: 'No social security number is asked for here, and none is needed.' })
    ])
  ]);

  restore(form);

  /* ONE delegated listener rather than a handler per field. Ten fields wired
     one at a time is ten chances to forget the eleventh. */
  form.addEventListener('input', saveKept);
  form.addEventListener('change', saveKept);

  form.isDirty = function () { return dirty; };

  form.clearProblems = function () {
    clear(formErr);
    Object.keys(errSlots).forEach((k) => {
      clear(errSlots[k]);
      if (fieldNodes[k] && fieldNodes[k].classList) fieldNodes[k].classList.remove('bad');
    });
    if (needShifts) needShifts.mark([]);
  };

  /**
   * Errors onto the fields they belong to, in one of the two voices.
   *
   * `mine` true means the person can fix it, and that is the default because
   * it is the common case. It gets `fixBlock`: no timestamp, no monospace, no
   * "not accepted". `mine` false means the product or the server failed, and
   * that gets `failBlock` with everything the audience needs.
   *
   * Then it SCROLLS TO THE FIRST BAD FIELD AND FOCUSES IT. The message used to
   * be printed 847px below the field it was about, on a page that does not
   * scroll on submit, so a person could read "the fields above say what to
   * change" with no idea which one.
   */
  form.showProblems = function (message, problems, mine) {
    const ownFault = mine !== false;
    form.clearProblems();
    const list = problems || [];
    list.forEach((x) => {
      const s = errSlots[x.field];
      if (s) {
        s.textContent = x.why || 'This needs a change.';
        if (fieldNodes[x.field] && fieldNodes[x.field].classList) fieldNodes[x.field].classList.add('bad');
      }
    });
    const orphans = list.filter((x) => !errSlots[x.field]);
    put(formErr, [
      ownFault
        ? fixBlock(list.length === 1 ? 'One thing to change before this can go'
                                     : 'A few things to change before this can go',
                   message || null)
        : failBlock('The application did not reach the hiring system.', message,
                    'Nothing was saved and nothing you typed is lost. Sending again is safe.'),
      orphans.length
        ? el('ul', { class: 'reasons prose measure' }, orphans.map((x) =>
            el('li', { text: x.why || 'This needs a change.' })))
        : null
    ]);
    focusFirstBad(list);
  };

  function focusFirstBad(list) {
    const first = (list || []).map((x) => x.field).find((k) => fieldNodes[k]);
    const node = first ? fieldNodes[first] : formErr;
    if (!node || !node.scrollIntoView) return;
    node.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const control = first === 'availability' && needShifts
      ? needShifts.firstControl()
      : node.querySelector('input, select, textarea');
    if (control && control.focus) control.focus({ preventScroll: true });
  }

  form.setBusy = function (on) {
    enable(send, !on);
    send.textContent = on ? 'Sending' : 'Send my application';
  };

  form.addEventListener('submit', (e) => {
    if (e && e.preventDefault) e.preventDefault();
    /* The ONE rule this page checks for itself, because a checkbox grid and a
       set of radio rows cannot carry the native required attribute and nothing
       else would stop an empty availability answer reaching the server.
       Everything past this is native validation or the server's own list of
       problems, because two implementations of one rule is how the two drift.

       The required shifts are checked FIRST and named individually. Under the
       old grid the only possible message was "Pick at least one shift", which
       does not say which shift, on a control where the answer that mattered
       was off the side of the screen. */
    const missing = needShifts ? needShifts.unanswered() : [];
    if (missing.length) {
      form.showProblems(null, [{ field: 'availability',
        why: missing.length === 1
          ? 'Answer yes or no to the ' + (SLOTS.label(missing[0]) || 'shift') + ' shift.'
          : 'Answer yes or no to each of the ' + missing.length + ' shifts this role needs.' }]);
      /* AFTER, not before. `showProblems` starts by clearing, and clearing
         resets these marks, so marking first left both rows unhighlighted with
         an error above them pointing at nothing. */
      needShifts.mark(missing);
      return;
    }
    if (!chosen.length) {
      form.showProblems(null, [{ field: 'availability',
        why: 'Tick at least one shift you can work.' }]);
      return;
    }
    form.clearProblems();
    if (o.onSubmit) o.onSubmit(readForm(form, chosen), form);
  });

  return form;
}

/**
 * The form as `POST /api/public/apply` wants it.
 *
 * Exported because this is the only place field names become the intake
 * contract, and a test should be able to reach it without a browser.
 */
export function readForm(form, chosen) {
  const val = (name) => {
    const n = form.querySelector ? form.querySelector('[name="' + name + '"]') : null;
    return n ? String(n.value == null ? '' : n.value).trim() : '';
  };
  const radio = (name) => {
    const list = (form.querySelectorAll ? form.querySelectorAll('[name="' + name + '"]') : []) || [];
    for (let i = 0; i < list.length; i += 1) if (list[i].checked) return list[i].value;
    return '';
  };
  const rtw = radio('rightToWork');
  return {
    firstName: val('firstName'),
    lastName: val('lastName'),
    email: val('email'),
    phone: val('phone'),
    dateOfBirth: val('dateOfBirth'),
    /* A real boolean, and null for not answered, because the rule tells an
       answer of no apart from no answer and a coerced false would not. */
    rightToWork: rtw === 'yes' ? true : (rtw === 'no' ? false : null),
    availability: (chosen || []).slice(),
    commuteBand: val('commuteBand'),
    experience: val('experience') || null,
    source: val('source') || null
  };
}

/* ============================================================================
   U-91.  THE CONFIRMATION, WHICH BRANCHES

   Three outcomes, and they are genuinely different pages.

   Passed        the call is next, and both methods are offered
   Held          one sentence, no reason, no call. The rehire rule is the only
                 thing that reaches this branch, and naming it would disclose
                 somebody's employment record to whoever is standing there.
                 Under a partial match it may not even be theirs.
   Not a match   every rule that failed, in the applicant's own terms

   The held branch prints no state name, no rule name, no reference and no chip
   that hints at one. It is short on purpose.
   ============================================================================ */

export function renderConfirmation(result, transport, opts) {
  const r = result || {};
  const e = r.eligibility || {};
  const o = opts || {};
  const first = r.firstName || null;

  if (e.heldForPerson) {
    return [pubHead('Application sent', null), card(null, null, [
      chipRow([ownerChip('human', 'With the hiring team')]),
      el('p', { class: 'copy prose measure',
        text: (first ? 'Thank you, ' + first + '. ' : '') +
              (e.reason || 'Your application is with the hiring team at this store. They will be in touch.') }),
      el('p', { class: 'copy small muted prose measure',
        text: 'Anything further arrives by email. There is no page here to come back to.' }),
      el('div', { class: 'form-ft' }, el('button', {
        class: 'btn', type: 'button', text: 'Back to open roles',
        onclick: () => o.onBack && o.onBack()
      }))
    ])];
  }

  if (!e.passed) {
    const reasons = (e.reasons || []).filter(Boolean);
    return [pubHead('This role is not a match', null), card(null, null, [
      chipRow([reasons.length
        ? toneChip('warn', reasons.length, plural(reasons.length, 'requirement not met', 'requirements not met'))
        : ownerChip('system', 'Checked against the role')]),
      reasons.length
        ? el('ul', { class: 'reasons prose measure' }, reasons.map((t) => el('li', { text: t })))
        : el('p', { class: 'copy prose measure',
            text: e.reason || 'This role has a requirement your application does not meet.' }),
      el('p', { class: 'copy small muted prose measure',
        text: 'Those checks are fixed rules run by software. No AI model was involved in them. The ' +
              'hiring team at the store can still look at your application.' }),
      el('div', { class: 'form-ft' }, el('button', {
        class: 'btn primary', type: 'button', text: 'Look at other roles',
        onclick: () => o.onBack && o.onBack()
      }))
    ])];
  }

  return [pubHead('You are through to the screening call', null), card(null, null, [
    chipRow([
      ownerChip('system', 'Rules checked'),
      r.job && r.job.title ? el('span', { class: 'chip', text: r.job.title }) : null
    ]),
    el('p', { class: 'copy prose measure',
      text: (first ? 'Thank you, ' + first + '. ' : '') +
            'Everything the role requires is met. The next step is a short call with the AI ' +
            'assistant, which asks the questions this role asks everybody. It decides nothing: a ' +
            'named person at the store reads it afterwards.' }),
    el('p', { class: 'copy small muted prose measure',
      text: 'Those checks are fixed rules run by software. No AI model was involved in them.' }),
    renderCalls(r.applicationId, transport, o),
    el('div', { class: 'kv' }, [
      r.applicationId ? el('span', { class: 'k', text: 'Your reference' }) : null,
      r.applicationId ? el('span', { class: 'v', text: r.applicationId }) : null,
      r.stateLabel ? el('span', { class: 'k', text: 'Where it is' }) : null,
      r.stateLabel ? el('span', { class: 'v', text: r.stateLabel }) : null
    ]),
    /* U-93. There is no candidate status page and the reason is specific. The
       soft identity match is a last name, a first name and a date of birth, so
       a page anybody could return to would let somebody who knows a name and a
       birthday read a stranger's employment record. */
    el('p', { class: 'copy small muted prose measure afternote',
      text: 'There is no status page to come back to, on purpose. A page that could be opened with ' +
            'a name and a date of birth could show one person another person\'s record. Everything ' +
            'after this call arrives by email.' })
  ])];
}

/* ============================================================================
   U-92.  BOTH CALL METHODS. BROWSER FIRST, OUTBOUND SECOND.

   The outbound button is present and disabled, with its reason underneath it.
   Never hidden. On 20 September the script presses it so a phone in the room
   rings, which means a carrier problem costs one click rather than the
   centrepiece, and a button that is not on screen teaches nobody that a phone
   call is part of this product.

   Availability comes from the server or it comes from nowhere. This page never
   decides that a transport is up.

   TWO DEFECTS FIXED HERE ON 8 SEPTEMBER 2026.

   1. NEITHER REASON WAS THE REAL ONE. The apply payload carries no transport
      block at all, so `transport` arrived null and the page printed the
      forty-three word fallback below, guessing that no number could be dialled
      and explaining the guess in the language of workspaces and trunks. The
      server has always known, and says it in one sentence: "The workspace has
      no outbound trunk with a number, so a phone call cannot be placed."
      `/api/public/call/methods` is now asked before this renders.

   2. PRESSING THE BROWSER BUTTON PROVISIONED A PAID ROOM AND CONNECTED
      NOTHING. `voiceClient()` returns null unless a livekit build is on the
      page, and there is none in the repository. The old sequence called the
      API first, so a room and a participant token were issued at the provider
      and then abandoned, and the candidate read a sentence saying nothing was
      connected. Now the button is disabled BEFORE anything is spent, with that
      as its stated reason, and it becomes live the moment the build is served.

   Both of those are the same mistake twice: the page guessing at a transport
   state instead of either asking or checking.
   ============================================================================ */

export function renderCalls(applicationId, transport, opts) {
  const t = transport || {};
  const o = opts || {};
  const browser = t.browser || {};
  const outbound = t.outbound || {};
  const result = el('div');
  const client = voiceClient();

  /* Three ways the browser call can be unavailable, and each says which one it
     is. The server's own sentence wins where it has one. */
  const browserBlocked = browser.available === false || !client;
  const browserWhy = browser.available === false
    ? (browser.why || 'A call in this browser is not available right now.')
    : (!client
      /* Short, and it does not tell them to press the other button, because
         the other button may be disabled too. The joint case is said once,
         below, rather than twice as two dead ends. */
      ? 'A call in this browser is not set up on this page yet. Nothing was started.'
      : browser.why || null);

  const outboundBlocked = outbound.available !== true;

  /* U-92 keeps the browser call first, and it stays first. But the primary
     style comes OFF when it is disabled: a dead control has no business being
     the loudest thing on a screen, and a pale blue button that does nothing
     was the first thing the eye landed on. */
  const b1 = el('button', Object.assign({
    class: 'btn call-1' + (browserBlocked ? '' : ' primary'), type: 'button',
    text: 'Start the call in this browser'
  }, browserBlocked ? { disabled: true } : {}));

  /* Only pressable on an explicit yes, because pressing it costs a real dial. */
  const b2 = el('button', Object.assign({
    class: 'btn call-2' + (browserBlocked && !outboundBlocked ? ' primary' : ''), type: 'button',
    text: 'Call my phone instead'
  }, outboundBlocked ? { disabled: true } : {}));

  async function start(method, btn) {
    enable(btn, false);
    put(result, el('p', { class: 'copy small muted',
      text: method === 'browser' ? 'Asking for the connection to this call.'
                                 : 'Asking the voice provider to dial your number.' }));
    const res = await ask(ROUTES.call(), { applicationId, method });
    const body = res.body || {};
    put(result, renderCallResult(method, res.ok ? body
      : Object.assign({ ok: false, error: res.error }, body)));
    if (o.onCall) o.onCall(method, body);
    /* Left disabled after an attempt. A second invitation on one screening is
       refused by the call sequence anyway, and a button that can be pressed
       twice in a demo is a button that will be. */
  }

  b1.addEventListener('click', () => start('browser', b1));
  b2.addEventListener('click', () => start('outbound', b2));

  return el('div', { class: 'callblock' }, [
    el('div', { class: 'calls' }, [b1, b2]),
    browserWhy ? el('p', { class: 'callwhy prose', text: browserWhy }) : null,
    outboundBlocked ? el('p', { class: 'callwhy prose',
      /* The server's sentence, or a short one. Never the old paragraph about
         what this page has and has not been told. */
      text: outbound.why || 'A call to your phone is not available right now.' }) : null,

    /* THE JOINT CASE, and it is the one the page used to handle worst. With
       both methods down a candidate read two separate refusals and was told by
       one of them to press the other. This says the thing that is actually
       true: the application exists and the store has it. Nothing here promises
       a call back, because this page cannot know that. */
    browserBlocked && outboundBlocked
      ? el('p', { class: 'callwhy prose',
          text: 'So there is nothing for you to press here. Your application is in and the store ' +
                'has it, and anything further comes by email.' })
      : null,
    t.note
      ? el('div', { class: 'sim-note' },
          [t.mode === 'live' ? ownerChip('agent', 'Live transport') : simBadge('Simulated'), ' ',
           el('span', { text: t.note })])
      : null,
    result
  ]);
}

/**
 * What came back from a call attempt.
 *
 * Never prints a call id and never prints a token. A call id alone reads that
 * call's transcript out of the provider with no authentication, and the token
 * belongs to the voice client rather than to the page.
 */
export function renderCallResult(method, res) {
  const r = res || {};
  const mode = r.mode || null;
  const badge = mode === 'live' ? ownerChip('agent', 'Live transport')
              : (mode ? simBadge('Simulated') : null);
  const connected = r.ok === true && (r.roomName || r.serverUrl || r.providerStatus);

  if (!connected) {
    return el('div', {}, [
      failBlock(method === 'outbound' ? 'The phone call was not placed.'
                                      : 'The browser call did not open.',
        r.error || r.reason || 'The server returned neither connection details nor a reason.',
        'Whatever the voice provider said is above, unchanged.'),
      r.status && r.status.note
        ? el('div', { class: 'sim-note' },
            [badge || simBadge('Simulated'), ' ', el('span', { text: r.status.note })])
        : null
    ]);
  }

  if (method === 'outbound') {
    return el('div', {}, [
      chipRow([badge]),
      el('p', { class: 'copy prose', text: 'The voice provider accepted the call. Your phone should ring.' }),
      el('div', { class: 'kv' }, [
        r.providerStatus ? el('span', { class: 'k', text: 'Provider status' }) : null,
        r.providerStatus ? el('span', { class: 'v', text: String(r.providerStatus) }) : null
      ]),
      r.providerMessage ? el('p', { class: 'copy small muted prose', text: String(r.providerMessage) }) : null
    ]);
  }

  /* The browser call. The connection details are here; whether anything
     connects depends on a voice client being on the page.

     THE SEAM. When Vite bundles this, one line changes: `voiceClient()` grows
     an `await import('livekit-client')`. Until then a UMD build published on
     the page as `window.LivekitClient` is picked up, and with neither present
     the page says nothing connected rather than implying a call is running. */
  const client = voiceClient();
  return el('div', {}, [
    chipRow([badge]),
    el('div', { class: 'kv' }, [
      r.roomName ? el('span', { class: 'k', text: 'Room' }) : null,
      r.roomName ? el('span', { class: 'v', text: String(r.roomName) }) : null,
      r.participantName ? el('span', { class: 'k', text: 'You are' }) : null,
      r.participantName ? el('span', { class: 'v', text: String(r.participantName) }) : null
    ]),
    client
      ? el('p', { class: 'copy prose',
          text: 'Connecting. Allow the microphone when the browser asks and the assistant speaks first.' })
      : el('p', { class: 'copy prose',
          text: 'The connection was issued but no voice client is loaded on this page, so nothing ' +
                'is connected yet and no audio is running.' })
  ]);
}

/**
 * The voice client, if one has been put on the page. Null is an answer, and it
 * is now an answer that is CHECKED BEFORE the call API is touched rather than
 * after: see the note on `renderCalls`. careers.html script-tags
 * VOICE_CLIENT_PATH, so this returns a client the moment that build exists.
 */
function voiceClient() {
  if (typeof window === 'undefined') return null;
  return window.LivekitClient || window.LiveKit || null;
}

/* ============================================================================
   THE VISIT

   Four phases in memory. The hash carries the job so a direct link to one
   requisition works, which U-84 names as the acceptable alternative to the
   default filter, and both are in.

   THE HASH STILL DOES NOT CARRY THE FORM OR THE CONFIRMATION, and that part of
   the old note was right: reloading onto a half-filled form would restore a
   form with no consent behind it, and the gate coming before the form is the
   one ordering on this page that has to hold. U-93 rules out a confirmation
   anybody could reopen, because the soft identity match is a name and a date
   of birth.

   WHAT WAS WRONG WITH IT. Nothing was saved anywhere, so a phone call arriving
   mid form took twenty-three controls of typing with it, and there was no way
   back from a screen that had gone wrong: tapping the same #/job/ link again
   fires no hashchange, so the page never re-rendered and the dead screen
   stayed. Both are fixed without touching the ordering:

     the ANSWERS are kept on the device and the form comes back filled, while
     the gate is still passed again, which is correct rather than a workaround,
     because the notice version somebody was shown has to be recorded again

     every failure card carries Try again and Back to open roles, so no screen
     on this page is a dead end
   ============================================================================ */

export const state = {
  phase: 'list',
  org: null,
  careers: null,
  filters: { storeId: '', role: '' },
  job: null,
  disclosure: null,
  consentId: null,
  result: null,
  transport: null,
  ticks: []
};

function host(id) { return document.getElementById(id); }

function stopTicks() {
  if (typeof clearInterval === 'function') state.ticks.forEach((id) => clearInterval(id));
  state.ticks = [];
}

/** Any clock a phase rendered registers its ticker so it stops on the way out. */
function collectTicks(node) {
  if (!node) return;
  if (Array.isArray(node)) { node.forEach(collectTicks); return; }
  if (node.tickId) state.ticks.push(node.tickId);
  const kids = node.childNodes || [];
  for (let i = 0; i < kids.length; i += 1) collectTicks(kids[i]);
}

function show(node) {
  const view = host('view');
  if (!view) return;
  stopTicks();
  /* The chrome reads the phase, so it is refreshed here rather than only when
     the org lands: the footer differs on the page that does not exist. */
  chrome();
  put(view, node);
  const rail = host('rail');
  if (rail) {
    put(rail, renderRail(state.phase, {
      /* A step already passed is a way back to it. Only two of the four can be
         behind you, and both have an address. */
      back: (key) => {
        const id = state.job && state.job.job && state.job.job.id;
        if (key === 'list' || !id) nav(PATHS.list());
        else if (key === 'gate') nav(PATHS.role(id));
        else if (key === 'form') nav(PATHS.form(id));
      }
    }));
  }
  collectTicks(node);
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
}

function chrome() {
  const org = state.org;
  const brand = host('brand');
  const top = host('topnote');
  const marker = host('marker');
  const foot = host('foot');
  /* The masthead is the way home, on every phase, which is the one link a
     candidate looks for and the page did not have. An anchor rather than a
     button, because it is a navigation to a real address and a middle click
     should open it in a tab. */
  if (brand) {
    put(brand, el('a', {
      class: 'brandlink', href: PATHS.list(),
      onclick: (e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); nav(PATHS.list()); } }
    }, [
      el('span', { class: 'brandmark', 'aria-hidden': 'true', text: 'S' }),
      el('span', { text: (org && org.name) ? org.name : 'Careers' })
    ]));
  }
  /* THE COUNT WAS ON SCREEN THREE TIMES: here, in the page header, and on the
     filter strip as "3 of 8 open roles". The filter strip is the one that
     changes with what is being shown, so it is the one that stays, and this
     says what the site is instead. */
  if (top) put(top, el('span', { text: 'Hourly roles' }));
  if (marker) put(marker, renderMarker(org));
  /* The footer is a statement about what the FORM collects, so it belongs on
     the phases that have one. On a page that does not exist it was a promise
     about a form nobody is looking at. */
  if (foot) {
    put(foot, state.phase === 'notfound' ? null : el('span', {
      text: 'This page collects only what the role\'s own requirements are checked against. ' +
            'No social security number, no address and no photograph.'
    }));
  }
  /* THE TITLE IS NOT SET HERE. `setTitle` owns it, per phase, and this used to
     overwrite it with one word for all four: chrome() runs on every paint, so
     whichever ran last won and it was usually this one. */
}

/**
 * The org and the default store, fetched once.
 *
 * This runs before ANY phase, including a direct link straight to one job,
 * because U-55's demonstration marker has to be on screen whichever door
 * somebody came through and the marker lives on this payload.
 */
async function ensureOrg() {
  if (state.org) return;
  const res = await ask(ROUTES.careers({}));
  if (!res.ok) { state.orgError = res.error; chrome(); return; }
  state.careers = res.body || {};
  state.org = state.careers.org || {};
  /* U-84. The default comes from the server. Writing a store id here is the
     thing that would rot. */
  if (state.careers.defaultStoreId && !state.filters.storeId) {
    state.filters.storeId = state.careers.defaultStoreId;
  }
  chrome();
}

/* ------------------------------------------------------------ the phases --- */

async function goList() {
  state.phase = 'list';
  state.job = null;
  state.consentId = null;
  state.result = null;
  await ensureOrg();
  setTitle('list');

  const res = await ask(ROUTES.careers(state.filters));
  if (!res.ok) {
    show(card('Open roles', null, [
      failBlock('The job list did not load.', res.error,
        'Nothing is invented in its place.'),
      wayOut(() => goList())
    ]));
    return;
  }
  state.careers = res.body || {};
  state.org = state.careers.org || state.org;
  chrome();

  show([
    pubHead('Open roles',
      'Hourly roles at our stores. Every one of them says what it pays, how many hours it is and ' +
      'which shifts it needs before you apply.'),
    renderFilters(state.careers, state.filters, (f) => {
      state.filters = { storeId: f.storeId || '', role: f.role || '' };
      goList();
    }),
    renderDefaultNote(state.careers, state.filters, () => {
      state.filters = { storeId: '', role: state.filters.role || '' };
      goList();
    }),
    renderJobList(state.careers, (id) => nav(PATHS.role(id)))
  ]);
}

/**
 * The way out of every failure card on this page.
 *
 * THE DEFECT. When the consent step failed, the error card offered nothing.
 * The state is in memory and the hash never changes, so tapping the same link
 * again fired no hashchange and the same broken screen came back. The only
 * exit was closing the tab, which is what a candidate does.
 */
function wayOut(retry) {
  return el('div', { class: 'form-ft' }, [
    retry ? el('button', { class: 'btn primary', type: 'button', text: 'Try again',
                           onclick: () => retry() }) : null,
    el('button', { class: 'btn', type: 'button', text: 'Back to open roles',
      /* `nav` re-renders when the path is already the list, so this is never
         the dead control it used to be when the fragment had not changed. */
      onclick: () => nav(PATHS.list()) })
  ]);
}

async function goGate(requisitionId) {
  state.phase = 'gate';
  state.consentId = null;
  state.result = null;
  await ensureOrg();

  const [jobRes, discRes] = await Promise.all([
    ask(ROUTES.job(requisitionId)),
    ask(ROUTES.disclosure())
  ]);

  if (!jobRes.ok || (jobRes.body && jobRes.body.ok === false)) {
    /* WHICH VOICE, again. A 404 is a role that has been filled or a link that
       was mistyped, and neither is something the product got wrong, so it gets
       the not-found page rather than a red box with a timestamp in it. A 500
       or a dropped connection IS ours and keeps the failure voice. */
    const gone = jobRes.status === 404 ||
                 /no such job/i.test(String(jobRes.error || (jobRes.body && jobRes.body.error) || ''));
    if (gone) { goNotFound(location.pathname); return; }
    show(card('That role', null, [
      failBlock('The role did not load.',
        jobRes.error || (jobRes.body && jobRes.body.error),
        'The open roles are still on the list.'),
      wayOut(() => goGate(requisitionId))
    ]));
    return;
  }
  state.job = jobRes.body || {};
  state.disclosure = discRes.ok ? (discRes.body || {}) : null;
  setTitle('gate', state.job.job);

  show([
    /* The role, in full, at the top of its own page. It used to be the compact
       head here on the argument that this screen is about the process rather
       than the job, which read as a role page that would not say what the role
       was: no minimum age, no commute band, no shift pattern, on the one URL a
       candidate is given a link to. The process is below it, where it belongs,
       and the form repeats the constraints beside the inputs they govern. */
    renderJobHead(state.job.job),
    state.disclosure
      ? renderGate(state.disclosure, {
          onAccept: () => consentThenForm(),
          onBack: () => nav(PATHS.list())
        })
      : card('Before you apply', null, [
          failBlock('The disclosure did not load.', discRes.error,
            'The form is not shown without it. What this process does with your answers has to be ' +
            'on screen before you fill anything in.'),
          wayOut(() => goGate(requisitionId))
        ])
  ]);
}

/**
 * U-86 as a structure rather than as a layout. The consent is recorded first
 * and the form is not built until the server has handed back a consent id, so
 * there is no order of operations left to get wrong later.
 */
async function consentThenForm() {
  const d = state.disclosure || {};
  const res = await ask(ROUTES.consent(), {
    disclosureId: d.id, disclosureVersion: d.version, accepted: true
  });
  if (!res.ok || !(res.body && res.body.consentId)) {
    show(card('Before you apply', null, [
      failBlock('The consent was not recorded.',
        res.error || 'The server returned no consent id.',
        'The form is not shown without it. The record of what you were shown is what starts the ' +
        'four year retention this notice describes.'),
      /* Try again re-runs the consent post, not the whole gate, because the
         tick box has already been ticked and asking somebody to read a notice
         twice to retry a failed write is punishing them for our fault. */
      wayOut(() => consentThenForm())
    ]));
    return;
  }
  state.consentId = res.body.consentId;
  /* The form has an address now, so accepting the notice navigates to it. The
     ordering is still structural: `goForm` refuses to render without the
     consent id this line just recorded. */
  nav(PATHS.form((state.job && state.job.job && state.job.job.id) || ''));
}

/**
 * The form.
 *
 * U-86 IS ENFORCED HERE AND NOT BY THE ADDRESS. The form has a URL, which
 * means somebody can type it, bookmark it or arrive at it from a search
 * result. None of those is a consent. So this refuses to render without a
 * consent id recorded in THIS visit and sends the visitor to the role page to
 * read the notice, which is the same order the gate has always enforced, now
 * stated where it cannot be routed around.
 */
async function goForm(requisitionId) {
  const wanted = requisitionId || (state.job && state.job.job && state.job.job.id);
  if (!state.consentId || !state.job || !state.job.job || state.job.job.id !== wanted) {
    nav(PATHS.role(wanted), { replace: true });
    return;
  }
  state.phase = 'form';
  const p = state.job;
  const id = p.job.id;
  setTitle('form', p.job);
  const form = renderForm(p, {
    kept: keptRead(id),
    onBack: () => nav(PATHS.role(id)),
    /* Start again clears the device and rebuilds the form empty. The consent
       already recorded stands, because it records what was shown and when, and
       that did happen. */
    onReset: () => goForm(id),
    onSubmit: (values, node) => submit(values, node)
  });
  /* Held so a rejected application lands its errors on the SAME form node and
     nobody has to type their details a second time on stage. */
  state.formNode = form;
  show([
    renderJobHead(p.job, { compact: true }),
    pubHead('Your details',
      'Only what this role\'s own requirements are checked against. Everything is needed unless ' +
      'it says optional, and no social security number is asked for.'),
    card(null, null, form)
  ]);
}

/**
 * Availability of the two call methods, asked rather than guessed.
 *
 * The apply payload carries no transport block, so this used to arrive null
 * and `renderCalls` printed a paragraph of invented reasoning. Flattened here
 * because `/call/methods` nests the transport status one level down and
 * `renderCalls` reads `mode` and `note` off the top.
 */
async function fetchTransport() {
  const res = await ask(ROUTES.callMethods());
  if (!res.ok || !res.body) return null;
  const b = res.body;
  const st = b.transport || {};
  return { browser: b.browser || {}, outbound: b.outbound || {},
           mode: st.mode || null, note: st.note || null };
}

async function submit(values, form) {
  const p = state.job || {};
  const id = p.job && p.job.id;
  form.setBusy(true);
  const res = await ask(ROUTES.apply(), {
    requisitionId: id, consentId: state.consentId, form: values
  });

  /* res.ok is the only success test. It already folds the HTTP status and the
     envelope's own ok, so there is nothing else to check and no way to read a
     success as a refusal. */
  if (!res.ok) {
    form.setBusy(false);
    /* WHICH VOICE. A 400 carrying a list of problems is the person's own form
       coming back to them. A network failure, a 500, or a refusal with nothing
       to point at is ours, and that one keeps the timestamp and the provider's
       message because the reader is whoever has to fix it. */
    const theirs = (res.problems || []).length > 0 && res.status >= 400 && res.status < 500;
    form.showProblems(theirs ? null : res.error, res.problems || [], theirs);
    return;
  }

  /* Kept only until it is sent. Leaving a filled form on the device after the
     application exists means the next person on that phone reads it. */
  keptClear(id);

  /* THE CONSENT IS SPENT. It recorded which notice version this person was
     shown and it has now produced an application. Leaving it set meant the
     breadcrumb's "Your details" step still led back to a working form, so a
     second press made a second application for the same person. `goForm`
     refuses without one, so clearing it sends anybody going back to the role
     page to read the notice again, which is the correct order. */
  state.consentId = null;

  state.result = res.body;
  state.transport = res.body.transport || res.body.call || await fetchTransport();
  form.setBusy(false);
  /* REDIRECT rather than repaint. `route()` renders the confirmation from
     state.result, and the address bar now holds the reference. */
  state.phase = 'sent';
  /* REPLACE, not push. The form is gone the moment it succeeds, and a back
     button that lands on a form whose consent has been spent and whose answers
     have been cleared is a way to apply twice. */
  nav(PATHS.sent(res.body.applicationId), { replace: true });
}

/* ============================================================================
   THE ROUTING

   FOUR PHASES, FOUR ADDRESSES, AND THEY ARE PATHS NOW.

     /careers                    the open roles
     /careers/roles/<id>         this role, and how the process works
     /careers/apply/<id>         the form
     /careers/sent/<id>          the confirmation

   WHY NOT THE FRAGMENT IT USED TO BE. A fragment is invisible to the server,
   so every one of those URLs was served with the same title, the same
   description and no canonical, and a role could not be linked, shared,
   crawled or given a JobPosting record. The server now builds the head for
   each path in lib/pagemeta.js, which is also the only way any of that is true
   for something that does not run JavaScript.

   THE GATE STILL COMES BEFORE THE FORM, STRUCTURALLY. /careers/apply/<id> is
   an address, not a bypass: `goForm` refuses to render without a consent id
   from this visit and sends the visitor back to the role page to read the
   notice. U-86 is a property of the code rather than of which link was clicked.

   THE SENT PAGE IS ITS OWN ROUTE, and it has to be. A submitted application
   used to render the confirmation while the address bar still read the job, so
   a pull to refresh on a phone re-ran the form route, offered the form again
   and let somebody apply twice. The review found exactly that. Now the
   reference is in the URL, a refresh lands back on the confirmation, and the
   form is no longer the route so it cannot be resubmitted.
   ============================================================================ */

/* Read once. `route()` runs again on every popstate and the tag belongs to the
   document the server sent, not to wherever the visitor has navigated since. */
let firstPaint = true;
function served404() {
  if (!firstPaint) return false;
  firstPaint = false;
  if (typeof document === 'undefined') return false;
  const m = document.querySelector('meta[name="app-state"]');
  return !!(m && m.getAttribute('content') === 'not-found');
}

export const PATHS = {
  list: () => '/careers',
  role: (id) => '/careers/roles/' + encodeURIComponent(id),
  form: (id) => '/careers/apply/' + encodeURIComponent(id),
  sent: (id) => '/careers/sent/' + encodeURIComponent(id)
};

/**
 * Go somewhere, and render it.
 *
 * `replace` is for the one case where the visitor must not be able to go back:
 * an application that has been sent. Everything else pushes, so the browser's
 * own back button walks the phases in the order they were visited.
 */
export function nav(path, opts) {
  const o = opts || {};
  if (typeof history === 'undefined' || !history.pushState) {
    location.href = path;
    return;
  }
  if (location.pathname === path && !o.force) { route(); return; }
  if (o.replace) history.replaceState({}, '', path);
  else history.pushState({}, '', path);
  route();
}

/* The tab, the history entry and the bookmark. The server writes the title for
   the URL it served; this keeps it right after a navigation the server never
   saw, which is every navigation after the first. The words match
   lib/pagemeta.js on purpose: two places writing different titles for one page
   is the defect this replaced, in a quieter form. */
function setTitle(phase, job) {
  if (typeof document === 'undefined') return;
  const name = (state.org && state.org.name) || 'Careers';
  const t = job && job.title;
  const words =
    phase === 'gate' ? (t || 'Role') :
    phase === 'form' ? ('Apply' + (t ? ' for ' + t : '')) :
    phase === 'sent' ? 'Application sent' :
    phase === 'notfound' ? 'Page not found' : 'Open roles';
  document.title = name + ' · ' + words;
}

function route() {
  const path = (typeof location !== 'undefined' && location.pathname) || '/careers';

  /* THE SERVER ALREADY ANSWERED 404 AND SAID SO IN THE DOCUMENT. Without this
     the client saw a path shaped like a role, asked the API for a requisition
     that does not exist, and painted "The role did not load. / No such job."
     in the product's own failure voice, timestamped, at somebody who mistyped
     a URL. Read once, on the first paint only: a navigation inside the visit
     is the client's own and the flag no longer applies. */
  if (served404()) { goNotFound(path); return; }

  const sent = path.match(/^\/careers\/sent\/([^/]+)\/?$/);
  if (sent) { goSent(decodeURIComponent(sent[1])); return; }

  const form = path.match(/^\/careers\/apply\/([^/]+)\/?$/);
  if (form) { goForm(decodeURIComponent(form[1])); return; }

  const role = path.match(/^\/careers\/roles\/([^/]+)\/?$/);
  if (role) { goGate(decodeURIComponent(role[1])); return; }

  if (path === '/careers' || path === '/careers/' || path === '/') { goList(); return; }
  goNotFound(path);
}

/**
 * The confirmation, reached by its own address.
 *
 * `state.result` is there when this follows a submit in the same visit. On a
 * refresh it is not, and rather than re-post anything the page says what it
 * knows: the reference from the URL, and where to go next. It deliberately does
 * NOT look the application up. There is no candidate-facing status route and
 * there will not be one: a page openable with a reference could show one person
 * another person's record.
 */
function goSent(applicationId) {
  state.phase = 'sent';
  setTitle('sent');
  if (state.result && state.result.applicationId === applicationId) {
    show([renderConfirmation(state.result, state.transport,
      { onBack: () => nav(PATHS.list()) })]);
    return;
  }
  show([
    pubHead('Application sent', null),
    card(null, null, el('div', { class: 'col' }, [
    el('p', { class: 'copy prose measure',
              text: 'It reached the hiring system. Somebody at the store reads it and decides. ' +
                    'Everything after that arrives by email.' }),
    el('div', { class: 'kv' }, [
      el('span', { class: 'k', text: 'Your reference' }),
      el('span', { class: 'v mono', text: applicationId })
    ]),
    el('p', { class: 'copy muted prose measure',
              text: 'There is no status page to come back to, on purpose. A page that could be ' +
                    'opened with a name and a date of birth could show one person another ' +
                    "person's record." }),
    el('div', { class: 'form-ft' },
      el('button', { class: 'btn', type: 'button', text: 'Back to open roles',
                     onclick: () => nav(PATHS.list()) }))
  ]))]);
}

/**
 * A page that does not exist.
 *
 * It is the candidate document, so it keeps the masthead, the footer and the
 * type of everything else, and it offers the two doors that do exist. It never
 * prints the path back as markup and it never prints anything about the
 * server: Express's own 404 used to answer here with a JSON envelope, and
 * before the error middleware existed a malformed request answered with a
 * stack trace carrying the developer's home directory.
 */
async function goNotFound(path) {
  state.phase = 'notfound';
  /* The org first, for two reasons: U-55's demonstration marker is rendered
     from the tenant record and has to be on screen whichever door somebody came
     through, and the title this sets would otherwise overwrite the server's
     correct "Sunfield Markets · Page not found" with "Careers · Page not
     found" a moment after the document loaded. */
  await ensureOrg();
  setTitle('notfound');
  show([
    pubHead('Page not found', null),
    card(null, null, el('div', { class: 'col' }, [
    el('p', { class: 'copy prose measure',
              text: 'There is nothing at that address. It may have been a role that has since ' +
                    'been filled, or a link that was cut short somewhere.' }),
    el('p', { class: 'copy small muted prose measure',
              text: 'The open roles are the way in. Nothing you were part way through is lost: ' +
                    'what you had typed is kept on this device.' }),
    el('div', { class: 'form-ft' }, [
      el('button', { class: 'btn primary', type: 'button', text: 'Back to open roles',
                     onclick: () => nav(PATHS.list()) }),
      /* Somebody who mistyped an operator address is not looking for a job.
         The door is offered, and it is the only place on the candidate side
         that names the operator application at all. */
      /^\/app(\/|$)/.test(String(path || ''))
        ? el('a', { class: 'btn', href: '/app', text: 'Back to operations' })
        : null
    ])
  ]))]);
}

function boot() {
  /* popstate, not hashchange. The phases are paths now. A click on the
     browser's own back button walks them in the order they were visited. */
  window.addEventListener('popstate', route);
  /* The answers are already on the device by the time this fires, so this is a
     second net rather than the only one. It is here because storage can be off
     or full and the failure is silent when it is. Only while the form is being
     filled: a browser ignores this outside a real interaction anyway, and
     asking somebody to confirm leaving a confirmation screen is noise. */
  window.addEventListener('beforeunload', (e) => {
    if (state.phase !== 'form') return;
    const f = state.formNode;
    if (!f || !f.isDirty || !f.isDirty()) return;
    e.preventDefault();
    e.returnValue = '';
  });
  route();
}

/* Only in a browser holding this page's mount point. Importing this module in
   Node, which is how the render functions are tested, must not start a visit. */
if (typeof document !== 'undefined' && document.getElementById && document.getElementById('view')) {
  boot();
}
