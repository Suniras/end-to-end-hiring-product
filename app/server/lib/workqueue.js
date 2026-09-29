/* ============================================================================
   workqueue.js  ·  the one list a store manager opens

   THE RULE IS ONE RULE. A row exists when something is owned by a NAMED HUMAN
   and is not done. That single sweep is the whole queue. The specification
   enumerated six sources instead, and the review proved that enumeration missed
   three of the things that actually cost a hire: an offer about to lapse, an
   onboarding task nobody picked up, and a statutory clock a person owns. A list
   built from a list of sources misses whatever nobody thought to add.

   RANKED BY COST OF DELAY, NOT BY AGE. Every row carries a `loseBy` instant and
   the queue sorts ascending on it. Age is not a cost. An offer expiring in seven
   hours outranks a decision that has waited five days, because one of them is
   still recoverable tomorrow and the other is not. The review found the top of
   the age-sorted list was a candidate who had waited 127 hours while the person
   the store was about to lose sat below the fold.

   WHAT EACH ROW SAYS, and it is deliberately not a state name. Who, what verb,
   and what it costs to leave it. "Screening in progress" tells a manager
   nothing. "Interview them, they applied 4 days ago" tells them everything.

   ONE ROW PER PERSON. Deduped by application, with the reasons collected, so
   somebody with a rehire hold and a decision pending appears once carrying both
   rather than twice competing with themselves.
   ============================================================================ */

import { STATES, ownerOf, label as stateLabel, actability } from '../../domain/states.js';
import { HOUR, DAY } from './clock.js';

/* What it costs to leave a thing. Ordered, and the order is the argument.
   A hire you lose is worse than a delay you can still recover from. */
const COST = {
  violation:  { rank: 0, says: 'a statutory deadline' },
  lost_hire:  { rank: 1, says: 'the hire' },
  premium:    { rank: 2, says: 'premium pay' },
  blocked:    { rank: 3, says: 'somebody is stopped' },
  delay:      { rank: 4, says: 'time' }
};

function within(ctx, storeId) {
  const ids = (ctx.scope && ctx.scope.storeIds) || [];
  return !ids.length || ids.indexOf(storeId) >= 0;
}

/**
 * The queue.
 *
 * Every branch below answers the same question: is a named human the current
 * owner, and is it not done. Nothing is added because it is interesting.
 */
export function queue(store, ctx, opts) {
  const o = opts || {};
  const now = ctx.clock.now();
  const rows = new Map();

  const add = (app, r) => {
    if (!app || !within(ctx, app.storeId)) return;
    const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
    const st = store.byId('stores', ctx.tenantId, app.storeId);
    /* The ROLE. A queue row without it says who and what but not what for, and
       a manager hiring a cashier and an overnight stocker at once needs to know
       which is which before they open anything. The first version of the table
       fell back to the workflow state in this column, which duplicated the
       urgency and told nobody anything. */
    const req = store.byId('requisitions', ctx.tenantId, app.requisitionId);
    const key = app.id;
    if (!rows.has(key)) {
      rows.set(key, {
        applicationId: app.id, candidateId: app.candidateId,
        name: cand ? cand.name : null, initials: cand ? cand.initials : null,
        role: req ? req.title : null,
        requisitionId: app.requisitionId || null,
        storeId: app.storeId, storeName: st ? st.name : null,
        state: app.state, stateLabel: stateLabel(app.state),
        step: STATES[app.state] ? STATES[app.state].step : null,
        assignedTo: app.assignedTo || null,
        appliedAt: app.appliedAt || null,
        waitingMs: app.stateSince ? now - app.stateSince : null,
        reasons: []
      });
    }
    rows.get(key).reasons.push(r);
  };

  const apps = store.all('applications', ctx.tenantId);

  /* 1. The application itself is sitting on a person. */
  apps.forEach((app) => {
    const s = STATES[app.state];
    if (!s || s.terminal) return;
    if (ownerOf(app.state) !== 'human') return;
    if (actability(app.state) !== 'person') return;

    /* An offer waiting on the candidate is NOT a row: the manager cannot make
       somebody accept. An offer that has not been SENT is, because that is the
       manager's to send and it is the commonest way a hire is lost quietly. */
    const offer = app.offerId ? store.byId('offers', ctx.tenantId, app.offerId) : null;

    if (app.state === 'DECISION_PENDING') {
      add(app, {
        kind: 'decide', verb: 'Decide on them',
        cost: 'lost_hire',
        loseBy: (app.stateSince || now) + 3 * DAY,
        because: 'They finished screening and are waiting on you.'
      });
      return;
    }
    if (offer && !offer.sentAt) {
      add(app, {
        kind: 'send_offer', verb: 'Send the offer',
        cost: 'lost_hire',
        loseBy: (offer.createdAt || now) + 1 * DAY,
        because: 'The offer is written and has not gone out.'
      });
      return;
    }
    add(app, {
      kind: 'move', verb: verbFor(app.state), cost: 'delay',
      loseBy: (app.stateSince || now) + 3 * DAY,
      because: stateLabel(app.state) + ', and it is yours.'
    });
  });

  /* 2. An offer that is out and about to lapse. The candidate owns the answer,
        so the manager cannot decide it, but they CAN ring them, and the review
        found this was the single most expensive thing the queue omitted. */
  apps.forEach((app) => {
    if (!app.offerId) return;
    const offer = store.byId('offers', ctx.tenantId, app.offerId);
    if (!offer || offer.status !== 'sent' || !offer.expiresAt) return;
    if (offer.expiresAt < now) return;
    if (offer.expiresAt - now > 2 * DAY) return;
    add(app, {
      kind: 'chase_offer', verb: 'Ring them, the offer is about to lapse',
      cost: 'lost_hire', loseBy: offer.expiresAt,
      because: 'Sent ' + hoursAgo(now, offer.sentAt) + ' and it expires on its own.'
    });
  });

  /* 3. An open exception a person owns. */
  store.all('exceptions', ctx.tenantId).forEach((e) => {
    if (e.resolvedAt) return;
    if ((e.owner || 'human') !== 'human') return;
    const app = e.applicationId ? store.byId('applications', ctx.tenantId, e.applicationId) : null;
    add(app, {
      kind: 'exception', exceptionId: e.id, verb: e.nextAction || 'Look at this',
      cost: e.blocksProgress ? 'blocked' : 'delay',
      loseBy: e.blocksProgress ? now : (e.at || now) + 2 * DAY,
      because: e.title
    });
  });

  /* 4. An onboarding task a person owns, which is eligible now. This is the
        band the review found entirely missing: four badge and till tasks at
        Ridgeway that nobody could see. */
  store.all('onboardingTasks', ctx.tenantId).forEach((t) => {
    if (t.status === 'complete' || t.status === 'carried_forward') return;
    if ((t.owner || '') !== 'human') return;
    if (t.eligibleAt == null || t.eligibleAt > now) return;
    const app = store.byId('applications', ctx.tenantId, t.applicationId);
    if (!app) return;
    const shift = app.firstShiftId ? store.byId('shifts', ctx.tenantId, app.firstShiftId) : null;
    add(app, {
      kind: 'task', taskKey: t.key, verb: t.name,
      /* A pre-shift task loses the first shift, which loses the hire. */
      cost: t.preShift && shift ? 'lost_hire' : 'delay',
      loseBy: shift && shift.startsAt ? shift.startsAt : (t.eligibleAt + 2 * DAY),
      because: t.preShift ? 'Needed before their first shift.' : 'Onboarding, and it is yours.'
    });
  });

  /* 5. A statutory clock a person owns and has not met. A violation outranks
        everything, which is why it is the only cost above a lost hire. */
  (o.clocks || []).forEach((c) => {
    if (!c || c.done || c.satisfied) return;
    if ((c.owner || '') !== 'human') return;
    const app = c.applicationId ? store.byId('applications', ctx.tenantId, c.applicationId) : null;
    add(app, {
      kind: 'clock', clockKey: c.key, verb: c.nextAction || ('Meet the ' + (c.title || c.key)),
      cost: 'violation',
      loseBy: c.dueAt != null ? c.dueAt : now + 1 * DAY,
      because: (c.title || c.key) + (c.citation ? '. ' + c.citation : '')
    });
  });

  /* Collapse to one row per person, taking the worst cost and the soonest
     lose-by across that person's reasons. */
  const out = Array.from(rows.values()).map((r) => {
    const worst = r.reasons.reduce((a, b) =>
      (COST[b.cost] || COST.delay).rank < (COST[a.cost] || COST.delay).rank ? b : a, r.reasons[0]);
    const soonest = r.reasons.reduce((a, b) => (b.loseBy < a.loseBy ? b : a), r.reasons[0]);
    return Object.assign(r, {
      verb: worst.verb,
      because: worst.because,
      cost: worst.cost,
      costSays: (COST[worst.cost] || COST.delay).says,
      loseBy: soonest.loseBy,
      loseByMs: soonest.loseBy - now,
      overdue: soonest.loseBy <= now,
      alsoNeeds: r.reasons.length - 1
    });
  });

  /* COST FIRST, THEN THE DEADLINE. Sorting on the deadline alone put an overdue
     badge task above a statutory violation and above a hire lapsing in eleven
     hours, because everything overdue floats. That is the age-sorting mistake
     wearing a different hat: it ranks by how long something has been late
     rather than by what being late costs. A violation outranks a lost hire,
     which outranks premium pay, which outranks a person being stopped, which
     outranks time. Within one cost, soonest first. */
  out.sort((a, b) => {
    const ra = (COST[a.cost] || COST.delay).rank;
    const rb = (COST[b.cost] || COST.delay).rank;
    if (ra !== rb) return ra - rb;
    return a.loseBy - b.loseBy;
  });

  return {
    rows: out,
    count: out.length,
    scope: ctx.scope,
    /* The three numbers and the one sentence. Everything here is counted off
       the rows above rather than computed a second way, so the strip and the
       list cannot disagree. */
    strip: {
      needsYou: out.length,
      overdue: out.filter((r) => r.overdue).length,
      losingAHire: out.filter((r) => r.cost === 'lost_hire').length,
      worst: out.length ? sentenceFor(out[0], now) : null
    },
    /* What the platform owes, so a manager can see their signature is not their
       fault yet. The review found nothing in the twelve surfaces had a home for
       this. */
    waitingOnUs: waitingOnUs(store, ctx, now)
  };
}

function sentenceFor(row, now) {
  if (row.overdue) return row.name + ' is already past ' + row.costSays + '.';
  const h = Math.round((row.loseBy - now) / HOUR);
  return row.name + ': ' + row.costSays + ' goes in ' + (h <= 1 ? 'under an hour' : h + ' hours') + '.';
}

/**
 * The tasks the platform owns, is eligible to do, and has not done. Shown
 * because it is the honest half of the argument: a manager waiting on a
 * signature can see that the thing blocking it is ours, not theirs.
 */
function waitingOnUs(store, ctx, now) {
  const rows = [];
  store.all('onboardingTasks', ctx.tenantId).forEach((t) => {
    if (t.status === 'complete' || t.status === 'carried_forward') return;
    if ((t.owner || '') === 'human') return;
    if (t.eligibleAt == null || t.eligibleAt > now) return;
    const app = store.byId('applications', ctx.tenantId, t.applicationId);
    if (!app || !within(ctx, app.storeId)) return;
    const cand = store.byId('candidates', ctx.tenantId, app.candidateId);
    rows.push({
      applicationId: app.id, name: cand ? cand.name : null,
      key: t.key, task: t.name, owner: t.owner,
      waitingMs: now - t.eligibleAt,
      /* Whether a human task is stuck behind this one, which is the only reason
         a manager cares about our work list. */
      blocksAHuman: store.where('onboardingTasks', ctx.tenantId,
        (x) => x.applicationId === app.id && (x.needs || []).indexOf(t.key) >= 0 && x.owner === 'human').length > 0
    });
  });
  rows.sort((a, b) => b.waitingMs - a.waitingMs);
  return { rows, count: rows.length, blockingAHuman: rows.filter((r) => r.blocksAHuman).length };
}

/** The verb for a state a person owns. Never a state name. */
function verbFor(state) {
  const V = {
    ELIGIBILITY_REVIEW: 'Check their eligibility',
    INTERVIEW_PENDING: 'Interview them',
    DECISION_PENDING: 'Decide on them',
    OFFER_READY: 'Send the offer',
    READY_FOR_SHIFT: 'Put them on a shift',
    STARTED: 'Check they turned up'
  };
  return V[state] || ('Move them on from ' + stateLabel(state).toLowerCase());
}

function hoursAgo(now, then) {
  if (!then) return 'a while ago';
  const h = Math.round((now - then) / HOUR);
  return h < 1 ? 'just now' : h < 48 ? h + ' hours ago' : Math.round(h / 24) + ' days ago';
}
