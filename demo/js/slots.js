/* ============================================================================
   slots.js  ·  the thirteen availability slots, and how to say them

   THE canonical slot table, in the manner of steps.js. The server requires it,
   the browser script-tags it, the tests require it. One copy on purpose.

   Why this file exists. Until 8 September 2026 the thirteen keys appeared in
   exactly one place, inside server/lib/seed.js, with no label map anywhere. The
   apply form's slot grid, the availability question the voice agent reads out,
   and the eligibility rule that scores the answer all have to agree on them,
   and a second description of one shift pattern is precisely how the screening
   question and requiredSlots drifted apart in the first place. That drift was a
   P0 defect twice in two days.

   Each slot is a day and a part of the day. The three parts are the ones a
   retail rota actually uses:

     open     the shift that opens the store
     evening  the shift that closes it
     night    the overnight shift, mostly stocking

   `label` is what a person reads. `short` is what fits in a grid cell.
   ============================================================================ */

(function (root, factory) {
  var v = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = v;
  if (root) root.SLOTS = v;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var DAYS = [
    { key: 'mon', name: 'Monday',    short: 'Mon', weekend: false },
    { key: 'tue', name: 'Tuesday',   short: 'Tue', weekend: false },
    { key: 'wed', name: 'Wednesday', short: 'Wed', weekend: false },
    { key: 'thu', name: 'Thursday',  short: 'Thu', weekend: false },
    { key: 'fri', name: 'Friday',    short: 'Fri', weekend: false },
    { key: 'sat', name: 'Saturday',  short: 'Sat', weekend: true  },
    { key: 'sun', name: 'Sunday',    short: 'Sun', weekend: true  }
  ];

  var PARTS = [
    { key: 'open',    noun: 'opening',   label: 'Opening',   short: 'Open',  hours: '6am to 2pm' },
    { key: 'evening', noun: 'evening',   label: 'Evening',   short: 'Eve',   hours: '2pm to 10pm' },
    { key: 'night',   noun: 'overnight', label: 'Overnight', short: 'Night', hours: '10pm to 6am' }
  ];

  /* The thirteen that exist. Not every day carries every part, because the
     seeded rota does not: there is no Tuesday evening shift in this dataset and
     inventing one would put a tick box on the apply form that no requisition
     can ever require. */
  var KEYS = [
    'mon_open', 'mon_night',
    'tue_open', 'tue_night',
    'wed_open',
    'thu_open', 'thu_night',
    'fri_open', 'fri_evening',
    'sat_open', 'sat_evening',
    'sun_open', 'sun_evening'
  ];

  function dayOf(key)  { return DAYS.find(function (d) { return d.key === String(key).split('_')[0]; }) || null; }
  function partOf(key) { return PARTS.find(function (p) { return p.key === String(key).split('_')[1]; }) || null; }

  /** "Saturday evening". Returns null for a key that is not one of the thirteen. */
  function label(key) {
    var d = dayOf(key), p = partOf(key);
    if (!d || !p) return null;
    return d.name + ' ' + p.noun;
  }

  /** "Sat Eve", for a grid cell. */
  function short(key) {
    var d = dayOf(key), p = partOf(key);
    if (!d || !p) return String(key);
    return d.short + ' ' + p.short;
  }

  function isWeekend(key) { var d = dayOf(key); return !!(d && d.weekend); }
  function valid(key)     { return KEYS.indexOf(String(key)) >= 0; }

  /** The grid the apply form draws: one row per part, one column per day. */
  function grid() {
    return PARTS.map(function (p) {
      return {
        part: p,
        cells: DAYS.map(function (d) {
          var key = d.key + '_' + p.key;
          return { day: d, key: key, exists: KEYS.indexOf(key) >= 0 };
        })
      };
    });
  }

  return { DAYS: DAYS, PARTS: PARTS, KEYS: KEYS, label: label, short: short,
           dayOf: dayOf, partOf: partOf, isWeekend: isWeekend, valid: valid, grid: grid };
});
