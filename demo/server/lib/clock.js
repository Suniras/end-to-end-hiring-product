/* ============================================================================
   clock.js  ·  the simulated present

   The compliance clocks only make sense against a fixed present. A demo shown
   in October must still read "3 business days left", so the product carries its
   own now.

   How it works: the store records two anchors at seed time, one simulated and
   one real. now() is the simulated anchor plus however much real time has
   passed since. So the present starts at Monday 17 August 2026, 07:04 and then
   advances in real time while you use it. A candidate who has been waiting 40
   minutes has genuinely been waiting 40 minutes.

   Reset re-anchors. That is what the R key is for, and why a half-run demo
   should always be reset before it is shown again.
   ============================================================================ */

'use strict';

/** The Monday the demo opens on. A Monday because the opening screen is about
    everything that arrived over a weekend. */
const SIM_ANCHOR_ISO = '2026-08-17T07:04:00.000Z';

function freshAnchors() {
  return { sim: new Date(SIM_ANCHOR_ISO).getTime(), real: Date.now() };
}

function makeClock(getAnchors) {
  function now() {
    const a = getAnchors();
    return a.sim + (Date.now() - a.real);
  }
  return {
    now,
    nowISO: () => new Date(now()).toISOString(),
    /** Milliseconds the demo has been running since it was last reset. */
    elapsed: () => Date.now() - getAnchors().real
  };
}

/* --------------------------------------------------- business day maths ---
   Monday to Friday, federal holidays ignored. Real E-Verify deadlines run in
   federal government working days, which DO exclude holidays, so this is
   slightly generous. Called out rather than hidden, because getting it wrong in
   the real product is a compliance event. Same caveat as the original demo.
   ------------------------------------------------------------------------ */

const isWorkday = (d) => { const w = d.getUTCDay(); return w !== 0 && w !== 6; };

function addBusinessDays(from, count) {
  const x = new Date(from);
  let added = 0;
  while (added < count) {
    x.setUTCDate(x.getUTCDate() + 1);
    if (isWorkday(x)) added++;
  }
  return x.getTime();
}

function businessDaysBetween(a, b) {
  let s = new Date(a), e = new Date(b), sign = 1;
  if (e < s) { const t = s; s = e; e = t; sign = -1; }
  s.setUTCHours(0, 0, 0, 0); e.setUTCHours(0, 0, 0, 0);
  let c = 0;
  const x = new Date(s);
  while (x < e) { x.setUTCDate(x.getUTCDate() + 1); if (isWorkday(x)) c++; }
  return c * sign;
}

const MIN = 60000, HOUR = 3600000, DAY = 86400000;

module.exports = {
  SIM_ANCHOR_ISO, freshAnchors, makeClock,
  isWorkday, addBusinessDays, businessDaysBetween,
  MIN, HOUR, DAY
};
