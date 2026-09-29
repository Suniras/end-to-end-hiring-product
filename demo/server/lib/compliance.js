/* ============================================================================
   compliance.js  ·  the clocks, computed

   Not one deadline in this file is a stored number. Each is derived from a date
   on the record and a rule with a citation next to it, so editing a start date
   moves every clock that depends on it and nothing goes quietly stale.

   The deadlines were verified against primary government text: eCFR,
   e-verify.gov, uscis.gov and the Federal Register. The durations around them,
   how long a real employer actually takes, are published by nobody, which is
   why the product measures those rather than asserting them.

   Business days here are Monday to Friday and ignore federal holidays. Real
   E-Verify deadlines run in federal government working days, which do exclude
   holidays, so this is slightly generous. Said out loud rather than hidden,
   because getting it wrong in the real product is a compliance event.

   The bar at the bottom is not a clock. It is a prohibition, and it outranks
   everything else in the product.
   ============================================================================ */

'use strict';

const { addBusinessDays, businessDaysBetween, DAY } = require('./clock');

const THREE_YEARS = 3 * 365.2425 * 86400000;

function toneFor(left, warn, crit) {
  if (left == null) return 'clock';
  if (left <= crit) return 'crit';
  if (left <= warn) return 'warn';
  return 'clock';
}

/** Every live compliance clock on one application. */
function clocksFor(store, ctx, a) {
  const now = ctx.clock.now();
  const out = [];
  if (!a.startedAt) return out;

  const tasks = store.where('onboardingTasks', ctx.tenantId, (t) => t.applicationId === a.id);
  const i9s2 = tasks.find((t) => t.key === 'i9_s2');
  const evTask = tasks.find((t) => t.key === 'everify');

  /* Form I-9 Section 2. Within three business days of the first day of work for
     pay. A named person examines the original documents and signs it under
     penalty of perjury. No model can sign that. */
  const i9Due = addBusinessDays(a.startedAt, 3);
  const i9Left = businessDaysBetween(now, i9Due);
  out.push({
    key: 'i9_s2',
    title: 'Form I-9, Section 2 examined and signed',
    rule: 'Within 3 business days of the first day of work for pay. A named person examines the original documents.',
    law: '8 CFR 274a.2(b)(1)(ii)',
    dueAt: i9Due,
    left: i9s2 && i9s2.status === 'done' ? 0 : i9Left,
    unit: i9s2 && i9s2.status === 'done' ? 'done' : 'business days',
    done: !!(i9s2 && i9s2.status === 'done'),
    owner: 'human',
    tone: (i9s2 && i9s2.status === 'done') ? 'good' : toneFor(i9Left, 1, 0),
    state: i9s2 && i9s2.status === 'done'
      ? 'Signed ' + new Date(i9s2.doneAt).toISOString().slice(0, 16).replace('T', ' ') + '.'
      : 'Outstanding. Booked with the store manager.'
  });

  /* E-Verify case creation. No later than the third business day after the
     employee starts work for pay. */
  const evDue = addBusinessDays(a.startedAt, 3);
  const created = a.everify && a.everify.createdAt;
  out.push({
    key: 'everify_case',
    title: 'E-Verify case created',
    rule: 'No later than the third business day after the employee starts work for pay.',
    law: 'E-Verify User Manual, section 2',
    dueAt: evDue,
    left: created ? 0 : businessDaysBetween(now, evDue),
    unit: created ? 'done' : 'business days',
    done: !!created,
    owner: 'system',
    tone: created ? 'good' : toneFor(businessDaysBetween(now, evDue), 1, 0),
    state: created
      ? 'Created ' + new Date(created).toISOString().slice(0, 16).replace('T', ' ') + '.'
      : (evTask && evTask.blockedBy ? 'Waiting on ' + evTask.blockedBy + '.' : 'Not yet created.')
  });

  if (!a.everify || !a.everify.tncIssuedAt) return out;

  /* Mismatch. Ten federal working days from issuance. This window is SHARED:
     the employer must notify the employee and complete the referral inside it,
     and the employee's decision falls due on the same tenth day. */
  const tncDue = addBusinessDays(a.everify.tncIssuedAt, 10);
  out.push({
    key: 'tnc_decision',
    title: 'Notify, refer, and take the employee decision',
    rule: '10 federal working days from issuance. One shared window: the employer notifies and refers inside it, and the employee decision falls due on the same tenth day.',
    law: 'E-Verify, tentative nonconfirmation',
    dueAt: tncDue,
    left: a.everify.decisionAt ? 0 : businessDaysBetween(now, tncDue),
    unit: a.everify.decisionAt ? 'done' : 'working days',
    done: !!a.everify.decisionAt,
    owner: 'human',
    tone: a.everify.decisionAt ? 'good' : toneFor(businessDaysBetween(now, tncDue), 3, 1),
    state: a.everify.decisionAt
      ? 'Notified and referred the same day. Decision to contest given ' +
        new Date(a.everify.decisionAt).toISOString().slice(0, 16).replace('T', ' ') + '.'
      : 'Outstanding.'
  });

  if (!a.everify.referredAt) return out;

  /* After referral, the employee gets eight federal working days to contact DHS
     or visit SSA. E-Verify notes this window has been extended for some
     mismatch types, so a hardcoded value would be wrong. */
  const refDue = addBusinessDays(a.everify.referredAt, 8);
  const refLeft = businessDaysBetween(now, refDue);
  out.push({
    key: 'employee_resolve',
    title: 'Employee contacts SSA or DHS to resolve',
    rule: '8 federal working days after the case is referred. E-Verify notes this window has been extended for some mismatch types, so a fixed number would be wrong.',
    law: 'E-Verify, referral',
    dueAt: refDue, left: refLeft, unit: 'working days', done: false, owner: 'human',
    tone: toneFor(refLeft, 4, 2),
    state: 'Referred ' + new Date(a.everify.referredAt).toISOString().slice(0, 16).replace('T', ' ') + '. ' +
           (a.everify.appointment || '')
  });

  /* DHS and SSA get their own ten working days from referral to update the
     result. E-Verify publishes no notification and instructs employers to check
     periodically, so this is polled rather than pushed. Anything in the design
     waiting for a webhook here waits forever. */
  const govDue = addBusinessDays(a.everify.referredAt, 10);
  const govLeft = businessDaysBetween(now, govDue);
  out.push({
    key: 'gov_update',
    title: 'DHS and SSA update the case result',
    rule: '10 federal working days from referral. E-Verify publishes no notification and instructs employers to check periodically, so this is polled rather than pushed.',
    law: 'E-Verify, referral',
    dueAt: govDue, left: govLeft, unit: 'working days', done: false, owner: 'clock',
    tone: toneFor(govLeft, 3, 1),
    state: 'Last polled ' + new Date(a.everify.lastPolledAt || now).toISOString().slice(0, 16).replace('T', ' ') +
           '. Still ' + a.everify.status + '. ' + (a.everify.note || '')
  });

  return out;
}

/**
 * The adverse action bar. Not a clock, a prohibition.
 *
 * While a mismatch is being contested, nothing adverse is lawful until the case
 * reaches a Final Nonconfirmation. The five things listed are the five the
 * product actively blocks, and the blocked attempts are on the record.
 */
function adverseBar(store, ctx, a) {
  if (!a.everify || a.everify.decision !== 'contesting') return null;
  const attempts = store.all('auditEvents', ctx.tenantId)
    .filter((e) => e.applicationId === a.id && e.outcome === 'refused')
    .sort((x, y) => y.at - x.at);
  return {
    active: true,
    since: a.everify.tncIssuedAt,
    barred: ['Termination', 'Suspension', 'Withholding or lowering pay',
             'Delaying training', 'Removing scheduled shifts'],
    rule: 'Nothing adverse until Final Nonconfirmation. Contesting an E-Verify mismatch is not a basis for any of the above.',
    likelyCause: a.everify.likelyCause,
    attempts: attempts.map((e) => ({ at: e.at, who: e.actor, what: e.detail && e.detail.attempted || e.action, why: e.why }))
  };
}

/** The FCRA process when a check comes back with something on it. */
function adverseProcess(store, ctx, a) {
  const chk = store.where('backgroundChecks', ctx.tenantId, (c) => c.applicationId === a.id)[0];
  if (!chk || !chk.adverseProcess) return null;
  return Object.assign({}, chk.adverseProcess, {
    checkId: chk.id,
    searches: chk.searches.filter((s) => s.result === 'record_found').map((s) => s.name),
    steps: [
      { key: 'pre_adverse', name: 'Pre-adverse notice, with a copy of the report and the summary of rights',
        owner: 'human', done: false },
      { key: 'gap', name: 'A reasonable gap for the person to respond', owner: 'clock', done: false,
        note: 'No fixed number of days in the statute. Whatever is reasonable, and it cannot be collapsed.' },
      { key: 'adverse', name: 'Adverse action notice', owner: 'human', done: false }
    ]
  });
}

/** Rehire and the three-year I-9 window, where one applies. */
function rehireWindow(a) {
  if (!a.rehire || !a.rehire.matched) return null;
  return Object.assign({ candidateMatched: true }, a.rehire.i9, {
    scope: a.rehire.scope,
    confidence: a.rehire.confidence,
    reusable: a.rehire.reusable
  });
}

/** Every application with a live compliance surface. */
function allCases(store, ctx) {
  return store.all('applications', ctx.tenantId)
    .map((a) => {
      const clocks = clocksFor(store, ctx, a);
      const bar = adverseBar(store, ctx, a);
      const adverse = adverseProcess(store, ctx, a);
      if (!clocks.length && !bar && !adverse) return null;
      const c = store.byId('candidates', ctx.tenantId, a.candidateId);
      const st = store.byId('stores', ctx.tenantId, a.storeId);
      return {
        applicationId: a.id, candidateId: c.id, name: c.name, initials: c.initials,
        store: st.name, storeId: st.id, state: a.state,
        startedAt: a.startedAt,
        everify: a.everify ? {
          caseRef: a.everify.caseRef, status: a.everify.status, source: a.everify.source,
          decision: a.everify.decision, likelyCause: a.everify.likelyCause,
          note: a.everify.note
        } : null,
        clocks, adverseBar: bar, adverseProcess: adverse, rehire: rehireWindow(a)
      };
    })
    .filter(Boolean)
    .sort((x, y) => {
      const xu = Math.min.apply(null, x.clocks.filter((c) => !c.done).map((c) => c.left).concat([99]));
      const yu = Math.min.apply(null, y.clocks.filter((c) => !c.done).map((c) => c.left).concat([99]));
      return xu - yu;
    });
}

module.exports = { clocksFor, adverseBar, adverseProcess, rehireWindow, allCases, THREE_YEARS };
