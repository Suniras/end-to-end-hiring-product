/* ============================================================================
   ops/dom.js  ·  one el(), one clock, one set of words

   NO INNER HTML ANYWHERE, the same rule careers.js keeps. `text` is the only
   door content comes through, because candidate names, store names, refusal
   sentences and statutory citations are all rows out of a database, and a page
   that assembles markup out of database text is one edit away from being an
   injection. The refusal strings in particular are the best copy in this
   product and they go on screen verbatim, which is exactly the case where
   escaping has to be structural rather than remembered.

   THE CLOCK, AND WHY THERE ARE TWO OF THEM ON SCREEN.

   Everything in this build computes in UTC, because the compliance deadlines
   are computed in UTC and a business-day count that drifts with the reader's
   machine is a count nobody can audit. That is correct arithmetic and it was
   also, until now, the only thing printed. The cost was measured: the demo's
   anchor is Monday 17 August 2026, 07:04 UTC, described in the code as "a
   Monday morning", and at #0417 Ridgeway in Ohio that instant is 03:04, which
   is the middle of the night. A manager reading their own queue was being
   shown a clock from a different continent.

   So the arithmetic stays in UTC and the PRINTING is local. Two functions,
   never mixed: `atStore` for anything a person reads as a time of day, `atUTC`
   for anything that is a legal deadline, and the drawer prints both side by
   side wherever a statutory clock is the subject.

   THE ZONE IS A PLACEHOLDER AND IT IS THE ONLY ONE IN THIS SURFACE.
   No route in the API carries a store timezone. `/api/work` gives a store id
   and a store name, `/api/metrics/stores` gives a manager, and the store row
   itself holds city, state and county but is not exposed anywhere. So the zone
   below cannot be read from the API today, and rather than scatter a guess it
   sits in one named constant with the offset and the abbreviation COMPUTED by
   the browser for each instant, so daylight saving is right even though the
   zone is assumed. A `timezone` field on the store row, surfaced on
   `/api/work`'s scope and rows, replaces this constant and nothing else.
   ============================================================================ */

import { glyph } from '../glyphs.js';

/* The one placeholder. See the header. Every seeded store sits in Ohio,
   Indiana or Kentucky and all three of those counties observe Eastern time, so
   this is right for this dataset and wrong the moment a customer has a store
   in Phoenix. That is why it is a handoff and not a fix. */
export const STORE_ZONE = 'America/New_York';

/* ------------------------------------------------------------------ the DOM --- */

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
    /* Property AND attribute, both. The property is what the browser reads
       back; the attribute is what `.btn[disabled]` in app.css and a Playwright
       selector can see. Setting one of the two has bitten this build. */
    if (k === 'disabled' || k === 'checked' || k === 'required') {
      n[k] = true; n.setAttribute(k, ''); return;
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

export function clear(host) {
  while (host && host.firstChild) host.removeChild(host.firstChild);
  return host;
}

export function put(host, node) { clear(host); return add(host, node); }

/* ------------------------------------------------------------------ time --- */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n) { return (n < 10 ? '0' : '') + n; }

/* The abbreviation for THIS instant in the store's zone, computed rather than
   typed, so EDT becomes EST on the right date with no second constant. */
function zoneWord(ms) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: STORE_ZONE, timeZoneName: 'short'
    }).formatToParts(new Date(ms));
    const z = parts.find((p) => p.type === 'timeZoneName');
    return z ? z.value : 'store time';
  } catch (e) { return 'store time'; }
}

function storeParts(ms) {
  try {
    const f = new Intl.DateTimeFormat('en-GB', {
      timeZone: STORE_ZONE, weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date(ms));
    const g = (t) => (f.find((p) => p.type === t) || {}).value || '';
    return { day: g('weekday'), date: g('day'), month: g('month'),
             hour: g('hour'), minute: g('minute') };
  } catch (e) {
    const d = new Date(ms);
    return { day: DAYS[d.getUTCDay()], date: String(d.getUTCDate()),
             month: MONTHS[d.getUTCMonth()], hour: pad(d.getUTCHours()),
             minute: pad(d.getUTCMinutes()) };
  }
}

/** "14:12 EDT". What a person reads as a time of day. */
export function atStore(ms) {
  if (ms == null) return null;
  const p = storeParts(ms);
  return p.hour + ':' + p.minute + ' ' + zoneWord(ms);
}

/** "Mon 17 Aug, 14:12 EDT". The same clock, with the day, for anything older
    than today. */
export function atStoreFull(ms) {
  if (ms == null) return null;
  const p = storeParts(ms);
  return p.day + ' ' + p.date + ' ' + p.month + ', ' + p.hour + ':' + p.minute + ' ' + zoneWord(ms);
}

/** "17 Aug, 07:04 UTC". For a legal deadline, beside the local reading. */
export function atUTC(ms) {
  if (ms == null) return null;
  const d = new Date(ms);
  return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ', ' +
         pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' UTC';
}

/** Is this instant the same store day as `now`. Decides whether a time needs
    its date printed. */
export function sameStoreDay(a, b) {
  if (a == null || b == null) return false;
  const x = storeParts(a), y = storeParts(b);
  return x.date === y.date && x.month === y.month;
}

const MIN = 60000, HOUR = 3600000, DAY = 86400000;

/** A duration, short. "4d 6h", "7h", "12m". Never a decimal. */
export function dur(ms) {
  if (ms == null) return null;
  const m = Math.abs(ms);
  if (m < MIN) return Math.round(m / 1000) + 's';
  if (m < HOUR) return Math.round(m / MIN) + 'm';
  if (m < DAY) {
    const h = Math.floor(m / HOUR), mm = Math.round((m % HOUR) / MIN);
    return h + 'h' + (mm && h < 6 ? ' ' + mm + 'm' : '');
  }
  const d = Math.floor(m / DAY), h = Math.round((m % DAY) / HOUR);
  return d + 'd' + (h && d < 10 ? ' ' + h + 'h' : '');
}

/** "in 7h" or "7h ago". The sign carries the meaning, so it is a word. */
export function rel(ms) {
  if (ms == null) return null;
  return ms >= 0 ? 'in ' + dur(ms) : dur(ms) + ' ago';
}

/** A duration for a median, in the unit the number deserves. */
export function durLong(ms) {
  if (ms == null) return null;
  if (ms < HOUR) return Math.round(ms / MIN) + ' min';
  if (ms < 2 * DAY) return (Math.round(ms / HOUR * 10) / 10) + ' hours';
  return (Math.round(ms / DAY * 10) / 10) + ' days';
}

export function pct(x) {
  if (x == null) return null;
  return Math.round(x * 100) + '%';
}

export function plural(n, one, many) { return n === 1 ? one : many; }

/** First letter capital, and nothing else touched. The API's sentences are
    already written; this is only for a phrase used as a label. */
export function cap(s) {
  if (!s) return s;
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

/* ------------------------------------------------------------- the pieces --- */

/** An owner chip: hue, glyph and word together, so colour is never alone.
    U-98. */
export function ownerChip(actor, text) {
  return el('span', { class: 'chip own-' + (actor === 'external' ? 'system' : actor) },
    [glyph(actor, { size: 10 }), el('span', { text })]);
}

/** A tone chip, and it never travels without its number. U-101. */
export function toneChip(tone, value, text) {
  return el('span', { class: 'chip is-' + tone },
    [el('span', { class: 'v', text: String(value) }), el('span', { text })]);
}

/** The dashed badge that means "not the real thing" throughout this build. */
export function simBadge(text) { return el('span', { class: 'sim', text }); }

export function simNote(text) { return el('div', { class: 'sim-note', text }); }

/** A titled band. Not a card in a grid of equal cards: bands are different
    sizes because the things in them are. U-105. */
export function band(title, count, body, opts) {
  const o = opts || {};
  return el('section', { class: 'band' + (o.class ? ' ' + o.class : '') }, [
    el('div', { class: 'band-hd' }, [
      el('h2', { text: title }),
      count != null ? el('span', { class: 'n', text: String(count) }) : null,
      o.action || null
    ]),
    el('div', { class: 'band-bd' + (o.flush ? ' flush' : '') }, body)
  ]);
}

/** A band whose header is the disclosure control. Used where the body is long
    and secondary, which on a phone is most secondary things. */
export function foldBand(title, count, bodyFn, opts) {
  const o = opts || {};
  let open = !!o.open;
  const bd = el('div', { class: 'band-bd' + (o.flush ? ' flush' : '') });
  const caret = el('span', { class: 'n', text: open ? 'hide' : 'show' });
  const hd = el('button', {
    class: 'band-hd', type: 'button', 'aria-expanded': String(open),
    onclick: () => {
      open = !open;
      hd.setAttribute('aria-expanded', String(open));
      caret.textContent = open ? 'hide' : 'show';
      bd.hidden = !open;
      if (open && !bd.firstChild) add(bd, bodyFn());
    }
  }, [
    el('h2', { text: title }),
    count != null ? el('span', { class: 'n', text: String(count) }) : null,
    caret
  ]);
  bd.hidden = !open;
  if (open) add(bd, bodyFn());
  return el('section', { class: 'band' }, [hd, bd]);
}

/** An empty state that says what the system did, never "No data". */
export function empty(title, body, stat) {
  return el('div', { class: 'empty' }, [
    el('div', { class: 'empty-title', text: title }),
    body ? el('div', { class: 'empty-body', text: body }) : null,
    stat ? el('div', { class: 'empty-stat', text: stat }) : null
  ]);
}

/** The product's own failure voice: what, when, the real message. Never used
    for something a person can fix. */
export function failBlock(what, message) {
  const now = Date.now();
  return el('div', { class: 'fail' }, [
    el('div', { class: 'fail-what', text: what }),
    el('div', { class: 'fail-when', text: atStoreFull(now) }),
    message ? el('pre', { class: 'fail-err', text: String(message) }) : null
  ]);
}

/** A loading state that keeps its context. Never "Loading...". */
export function loadingBand(title, what) {
  return band(title, null, el('p', { class: 'copy muted', text: what }));
}

/** A tick, for a checkbox that is on. Drawn rather than a font character, so
    it cannot arrive as a missing glyph box. */
export function tick() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 18 18');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', 'M3.5 9.5 7 13l7.5-8');
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', '2.2');
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(p);
  return svg;
}

export { glyph };
