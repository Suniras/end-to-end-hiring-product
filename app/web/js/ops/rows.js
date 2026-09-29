/* ============================================================================
   ops/rows.js  ·  what a queue row is actually shaped like

   ONE PLACE, because the queue and the drawer have to agree about which of a
   row's reasons is the one being acted on. Two answers to that question is how
   a list and the thing it opens start disagreeing.

   `kind` IS ON THE REASON, NOT ON THE ROW. Measured against the running
   server. A row from /api/work carries:

     applicationId, candidateId, name, initials, storeId, storeName, state,
     stateLabel, step, assignedTo, appliedAt, waitingMs, reasons[], verb,
     because, cost, costSays, loseBy, loseByMs, overdue, alsoNeeds

   and no field named `kind` at all. Each entry in `reasons` has one. Reading
   `row.kind` gave undefined on all eleven rows, every drawer fell through to
   the generic list of engine moves, and the first thing this surface offered
   on a candidate whose E-Verify case is contested was "Employment ended". That
   was found by looking at the screen, not by reading the code.

   THE COST AND THE DEADLINE MUST COME FROM THE SAME REASON. The server
   collapses a row by taking `cost` from the WORST reason and `loseBy` from the
   SOONEST, and those are not always the same reason. Kayla Brennan-Ross
   carries a statutory clock due in three days and an exception whose working
   target passed four days ago, so her collapsed row reads "past a statutory
   deadline" when the statutory deadline has not passed. Of all the rows this
   product draws, the one that must not misstate a legal deadline is the one
   about a legal deadline. So the acting reason supplies both, and the sooner
   thing is still visible as "and 1 more".

   THE SORT ORDER IS NOT TOUCHED HERE. The server ranks the queue and this file
   never re-ranks it. A second opinion about the order, held in a browser, is
   the same class of mistake in a quieter place.
   ============================================================================ */

/* Ordered, and the order is the argument. A hire you lose is worse than a
   delay you can still recover from. These ranks are the server's own, in
   lib/workqueue.js, and they are here so the collapse can be reproduced rather
   than guessed. */
export const COST_RANK = { violation: 0, lost_hire: 1, premium: 2, blocked: 3, delay: 4 };

/* The words the product uses for each cost. The server sends `costSays` on the
   row for the winning cost only, and a row shows a cost per reason, so the
   full map is needed here. The strings match the server's. */
/* What is lost, in a sentence, for prose. */
export const COST_SAYS = {
  violation: 'a statutory deadline',
  lost_hire: 'the hire',
  premium: 'premium pay',
  blocked: 'somebody is stopped',
  delay: 'time'
};

/* The same thing as a COLUMN LABEL. One or two words, because the sentence
   form overflowed a table cell and bled across into the deadline beside it.
   Measured at 1440 wide: "A STATUTORY DEADLINE" ran past its column. */
export const COST_TAG = {
  violation: 'Statutory',
  lost_hire: 'The hire',
  premium: 'Premium pay',
  blocked: 'Blocked',
  delay: 'Time'
};

export function rankOf(cost) {
  return COST_RANK[cost] == null ? 4 : COST_RANK[cost];
}

/** Crit for the two costs you cannot recover from, warn for the two you can,
    and no tone for time. A tone is never the only carrier: the word is always
    beside it. */
export function toneOf(cost) {
  if (cost === 'violation' || cost === 'lost_hire') return 'crit';
  if (cost === 'premium' || cost === 'blocked') return 'warn';
  return null;
}

/**
 * The reason the row is really about: the lowest cost rank, ties to the first.
 * That reproduces the server's own choice of `verb` and `cost`.
 */
export function primaryReason(row) {
  const rs = (row && row.reasons) || [];
  if (!rs.length) {
    /* A row assembled elsewhere in this surface already names its own kind. */
    return { kind: (row && row.kind) || 'move', verb: row && row.verb,
             because: row && row.because, cost: row && row.cost,
             loseBy: row && row.loseBy,
             exceptionId: row && row.exceptionId, taskKey: row && row.taskKey,
             clockKey: row && row.clockKey };
  }
  return rs.reduce((a, b) => (rankOf(b.cost) < rankOf(a.cost) ? b : a), rs[0]);
}

/**
 * The row, with the acting reason's kind and keys hoisted onto it, so one
 * lookup serves the row, the drawer and the draft key.
 */
export function acting(row) {
  if (!row || row.batch) return row;
  const p = primaryReason(row);
  return Object.assign({}, row, {
    kind: p.kind,
    exceptionId: p.exceptionId || null,
    taskKey: p.taskKey || null,
    clockKey: p.clockKey || null,
    cost: p.cost || row.cost,
    loseBy: p.loseBy != null ? p.loseBy : row.loseBy,
    verb: p.verb || row.verb,
    because: p.because || row.because,
    /* Kept, so a row can still say that something else on this person is due
       sooner than the thing being acted on. */
    soonestLoseBy: row.loseBy
  });
}
