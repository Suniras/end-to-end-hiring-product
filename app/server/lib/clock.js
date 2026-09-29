/* ============================================================================
   clock.js  ·  the demo carries its own present

   The product is a story about duration, so it needs a present that sits in the
   middle of a running funnel rather than at the moment somebody opened it. The
   clock is anchored at Monday 17 August 2026, 07:04 UTC, and it advances in
   real time from there.

   The controls move the present. They DO NOT fake data. Winding forward three
   days makes a county court return because its expected time has genuinely
   passed and an offer expire because three days have genuinely gone by.
   Everything that happens next happened for the real reason, and the copy on
   screen says so.

   Everything is formatted in UTC. The compliance deadlines are computed in UTC,
   and rendering the same instant in the viewer's local time put the opening
   screen in a different hour of the working day depending on where it was
   opened.
   ============================================================================ */

export const MIN = 60000;
export const HOUR = 3600000;
export const DAY = 86400000;

/** Monday 17 August 2026, 07:04 UTC. A Monday morning, mid-funnel. */
export const ANCHOR = Date.UTC(2026, 7, 17, 7, 4, 0);

export function freshAnchors() {
  return { sim: ANCHOR, real: Date.now() };
}

/**
 * `getAnchors` is a function rather than a value so the clock reads the live
 * anchors out of the database. Winding the clock forward writes to the database
 * and every reader sees it, including one that was already holding a clock.
 */
export function makeClock(getAnchors) {
  return {
    now() {
      const a = getAnchors();
      return a.sim + (Date.now() - a.real);
    },
    /** Move the present. Returns the new simulated now. */
    advance(hours) {
      const a = getAnchors();
      a.sim += hours * HOUR;
      a.real = Date.now();
      return a.sim;
    },
    iso() { return new Date(this.now()).toISOString(); }
  };
}

/* ------------------------------------------------------------- formatting --- */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtTime(ms) {
  const d = new Date(ms);
  return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
}

export function fmtDate(ms) {
  const d = new Date(ms);
  return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
}

export function fmtDay(ms) {
  const d = new Date(ms);
  return DAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ', ' + fmtTime(ms);
}

/**
 * A duration a person can read. Deliberately coarse above an hour, because a
 * median of "3 days 4 hours 12 minutes" implies a precision the sample size
 * does not support.
 */
export function fmtDur(ms) {
  if (ms == null) return null;
  const neg = ms < 0;
  const v = Math.abs(ms);
  let out;
  if (v < MIN) out = Math.round(v / 1000) + 's';
  else if (v < HOUR) out = Math.round(v / MIN) + 'm';
  else if (v < DAY) {
    const h = Math.floor(v / HOUR), m = Math.round((v % HOUR) / MIN);
    out = m ? h + 'h ' + m + 'm' : h + 'h';
  } else {
    const d = Math.floor(v / DAY), h = Math.round((v % DAY) / HOUR);
    out = h ? d + 'd ' + h + 'h' : d + 'd';
  }
  /* A negative duration is a defect, not a value, and it has been shipped once
     already. It is rendered with its sign so it cannot hide. */
  return neg ? '-' + out : out;
}

/** Business days, which several statutory clocks are counted in. */
export function addBusinessDays(from, days) {
  let t = from, left = days;
  while (left > 0) {
    t += DAY;
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) left--;
  }
  return t;
}

export function nextMonday(from) {
  const d = new Date(from);
  const dow = d.getUTCDay();
  const add = dow === 1 ? 7 : (8 - dow) % 7 || 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + add, 6, 0, 0);
}
