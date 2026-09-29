/* ============================================================================
   connectors/index.js  ·  the integration boundary

   EVERY ADAPTER IN THIS FILE IS SIMULATED. None of them talks to a real vendor
   and none of them holds a credential. mode is 'simulated' on every call and
   every response, the API returns that field, and the interface prints it.

   What is real is the SHAPE. A call goes out, it takes time, it comes back with
   an external reference the vendor owns, it can fail, and a failure is
   retryable or it is not. All of that is recorded in the connectorCalls table
   whether it succeeded or not. Swapping a simulated adapter for a real one
   means writing a transport, not rewriting the product.

   There is no "Connected to Workday" anywhere in this product. Naming a vendor
   we have not integrated is the specific dishonesty this file is designed to
   make impossible: the adapter registry has no vendor field to fill in.

   Latency is derived from a hash of the payload rather than from a random
   number, so the same order takes the same time on every run. A demo that
   produces different numbers each time cannot be tested.
   ============================================================================ */

'use strict';

const { MIN, HOUR, DAY } = require('../clock');

/** Small deterministic hash. Same input, same latency, every run. */
function hash(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

/** A value in [lo, hi] chosen deterministically from a key. */
function spread(key, lo, hi) { return lo + (hash(key) % Math.max(1, (hi - lo + 1))); }

function ref(prefix, key) { return prefix + '-' + String(hash(key)).padStart(10, '0').slice(0, 8); }

/* ------------------------------------------------------------- adapters --- */

const ADAPTERS = {

  /* Where applications arrive from and where openings are posted to. In the
     real product this is the customer's existing applicant tracking system and
     whichever boards they already buy. */
  ats: {
    label: 'Applicant tracking and job distribution',
    ops: {
      post_opening: (p) => ({ externalRef: ref('POST', p.requisitionId + p.destination),
                              latencyMs: spread(p.destination, 400, 3200),
                              data: { destination: p.destination, live: true } }),
      pull_applications: (p) => ({ externalRef: ref('PULL', p.since),
                                   latencyMs: spread(String(p.since), 600, 2400),
                                   data: { count: p.count || 0 } })
    }
  },

  /* The screening agency. The product orders and tracks. It never performs a
     background check and it is not a consumer reporting agency. */
  background_check: {
    label: 'Background screening agency',
    ops: {
      order: (p) => ({ externalRef: ref('ORD', p.applicationId),
                       latencyMs: spread(p.applicationId, 900, 2600),
                       data: { searches: p.searches, orderedAt: p.at } }),
      poll: (p) => ({ externalRef: p.externalRef,
                      latencyMs: spread(p.externalRef + 'poll', 200, 900),
                      data: { status: p.status } })
    }
  },

  /* I-9 and E-Verify go through an embedded vendor. The one requirement that
     decides whether a vendor is usable at all is that it exposes the E-Verify
     case state, because a product that cannot see the case state cannot drive
     the clocks or enforce the adverse action bar. */
  everify: {
    label: 'I-9 and E-Verify vendor',
    requires: 'The vendor must expose the E-Verify case state. Without it the clocks and the adverse action bar cannot be driven.',
    ops: {
      create_case: (p) => ({ externalRef: ref('EV', p.applicationId),
                             latencyMs: spread(p.applicationId + 'ev', 1200, 4000),
                             data: { caseStatus: p.caseStatus || 'EMPLOYMENT_AUTHORIZED' } }),
      poll_case: (p) => ({ externalRef: p.externalRef,
                           latencyMs: spread(p.externalRef + 'pc', 300, 1100),
                           data: { caseStatus: p.caseStatus } })
    }
  },

  hris: {
    label: 'Payroll and human resources system of record',
    ops: {
      create_employee: (p) => ({ externalRef: ref('EMP', p.candidateId),
                                 latencyMs: spread(p.candidateId + 'emp', 1500, 5000),
                                 data: { employeeId: p.employeeId } }),
      reactivate_employee: (p) => ({ externalRef: ref('EMP', p.priorEmployeeId),
                                     latencyMs: spread(p.priorEmployeeId + 'react', 700, 2000),
                                     data: { employeeId: p.priorEmployeeId, reactivated: true } })
    }
  },

  scheduling: {
    label: 'Workforce management and scheduling',
    ops: {
      /* Fair workweek rules in covered cities require roughly fourteen days of
         advance schedule notice, with a premium payable to change inside that
         window. So a first shift is not ours to place freely, and the adapter
         reports the constraint rather than silently writing the shift. */
      write_shift: (p) => ({ externalRef: ref('SHF', p.applicationId + p.startsAt),
                             latencyMs: spread(p.applicationId + 'shf', 500, 1800),
                             data: { startsAt: p.startsAt, noticeDays: p.noticeDays,
                                     premiumPayable: p.noticeDays < 14 } }),
      remove_shift: (p) => ({ externalRef: ref('SHF', p.shiftId),
                              latencyMs: spread(p.shiftId + 'rm', 300, 900),
                              data: { removed: true } })
    }
  },

  identity: {
    label: 'Identity directory and store systems access',
    ops: {
      provision: (p) => ({ externalRef: ref('IDN', p.candidateId),
                           latencyMs: spread(p.candidateId + 'idn', 2000, 7000),
                           data: { account: p.account } })
    }
  },

  learning: {
    label: 'Learning management system',
    ops: {
      assign: (p) => ({ externalRef: ref('LRN', p.candidateId + (p.courses || []).join(',')),
                        latencyMs: spread(p.candidateId + 'lrn', 800, 2500),
                        data: { courses: p.courses } })
    }
  },

  /* Email and SMS. Development adapters: they record the message and mark it
     delivered. Nothing leaves this machine. Voice is an interface only, because
     the honest thing to demonstrate is the screening intelligence rather than
     an afternoon spent on telephony. */
  messaging: {
    label: 'Email, SMS and voice',
    ops: {
      email: (p) => ({ externalRef: ref('EML', p.to + p.templateId),
                       latencyMs: spread(p.to + 'eml', 120, 700),
                       data: { to: p.to, subject: p.subject } }),
      sms:   (p) => ({ externalRef: ref('SMS', p.to + p.templateId),
                       latencyMs: spread(p.to + 'sms', 80, 400),
                       data: { to: p.to } }),
      voice: (p) => ({ externalRef: ref('VOX', p.to + (p.script || '')),
                       latencyMs: spread(p.to + 'vox', 900, 2400),
                       data: { to: p.to, durationS: p.durationS || null },
                       unimplemented: 'Outbound voice is an interface here, not a running integration. Nurix has shipped a live voice screening agent on another build, so this is a transport that exists and is not wired up in this demo.' })
    }
  }
};

/* ------------------------------------------------------------- the call --- */

/**
 * Every adapter call goes through here, so every one of them is recorded.
 *
 * Failure injection is deterministic and narrow: an op can be told to fail by
 * the caller passing `failWith`. Seeded data uses it so at least one connector
 * error and its retry are visible on screen. Nothing fails at random.
 */
function call(store, ctx, adapterKey, op, payload, opts) {
  opts = opts || {};
  const adapter = ADAPTERS[adapterKey];
  if (!adapter) throw new Error('no such adapter: ' + adapterKey);
  const fn = adapter.ops[op];
  if (!fn) throw new Error('adapter ' + adapterKey + ' has no op ' + op);

  const at = opts.at != null ? opts.at : ctx.clock.now();
  const row = {
    id: store.nextId('con'),
    tenantId: ctx.tenantId,
    adapter: adapterKey,
    adapterLabel: adapter.label,
    op,
    mode: 'simulated',
    at,
    requestedAt: at,
    respondedAt: null,
    latencyMs: null,
    status: 'pending',
    externalRef: null,
    request: redact(payload),
    response: null,
    error: null,
    retryable: null,
    attempt: opts.attempt || 1,
    applicationId: payload.applicationId || null,
    candidateId: payload.candidateId || null
  };
  store.insert('connectorCalls', row);

  if (opts.failWith) {
    Object.assign(row, {
      status: 'failed',
      latencyMs: opts.failLatencyMs != null ? opts.failLatencyMs : spread(adapterKey + op, 200, 1200),
      respondedAt: at + (opts.failLatencyMs || 800),
      error: opts.failWith,
      retryable: opts.retryable !== false
    });
    store.markDirty();
    return { ok: false, call: row, error: opts.failWith, retryable: row.retryable, mode: 'simulated' };
  }

  const out = fn(payload);
  Object.assign(row, {
    status: 'ok',
    latencyMs: out.latencyMs,
    respondedAt: at + out.latencyMs,
    externalRef: out.externalRef,
    response: out.data,
    unimplemented: out.unimplemented || null
  });
  store.markDirty();
  return { ok: true, call: row, externalRef: out.externalRef, data: out.data,
           latencyMs: out.latencyMs, mode: 'simulated', unimplemented: out.unimplemented || null };
}

/** Nothing sensitive should be in a payload, and this makes sure of it. */
function redact(payload) {
  const out = {};
  Object.keys(payload || {}).forEach((k) => {
    if (/ssn|password|secret|token|apikey|api_key/i.test(k)) { out[k] = '[redacted]'; return; }
    const v = payload[k];
    out[k] = (typeof v === 'string' && v.length > 400) ? v.slice(0, 400) + '…' : v;
  });
  return out;
}

/** For the integrations screen. What exists, what it would be, what it is now. */
function inventory() {
  return Object.keys(ADAPTERS).map((k) => ({
    key: k,
    label: ADAPTERS[k].label,
    ops: Object.keys(ADAPTERS[k].ops),
    mode: 'simulated',
    vendor: null,
    requires: ADAPTERS[k].requires || null
  }));
}

module.exports = { ADAPTERS, call, inventory, hash, spread, ref, MIN, HOUR, DAY };
