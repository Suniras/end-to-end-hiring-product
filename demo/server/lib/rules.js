/* ============================================================================
   rules.js  ·  deterministic eligibility, and the rehire lookup

   No model runs in this file, deliberately. Age, right to work and availability
   are yes-or-no questions against values we already hold. A model here would add
   no capability and would pull the product into automated employment decision
   rules that a deterministic engine avoids.

   Every rule returns the inputs it used. "Failed on availability" is not an
   answer anybody can act on. "Needs Sat and Sun evenings, offered Sat only" is.

   THE REHIRE LOOKUP READS ONE CUSTOMER'S OWN RECORDS AND NOTHING ELSE.
   store.all() will not return another tenant's rows, so this cannot be widened
   by accident. Pooling employment history across customers and answering
   questions from the pool is what a consumer reporting agency does, and that is
   a different company under a different licence. The tenancy is the boundary,
   not the scoring and not the model.
   ============================================================================ */

'use strict';

const YEAR = 365.2425 * 86400000;

/* ------------------------------------------------------------ the rules --- */

function ageOn(dobISO, atMs) {
  const dob = new Date(dobISO), at = new Date(atMs);
  let a = at.getUTCFullYear() - dob.getUTCFullYear();
  const m = at.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && at.getUTCDate() < dob.getUTCDate())) a--;
  return a;
}

/** Hours a candidate offers that the requisition actually needs. */
function availabilityOverlap(candidateAvail, requiredSlots) {
  const have = new Set(candidateAvail || []);
  const missing = (requiredSlots || []).filter((s) => !have.has(s));
  return { required: requiredSlots || [], missing, covered: (requiredSlots || []).length - missing.length };
}

const RULES = [
  {
    key: 'min_age',
    name: 'Minimum age for the role',
    run(ctx) {
      const age = ageOn(ctx.candidate.dob, ctx.now);
      return {
        passed: age >= ctx.requisition.minAge,
        basis: 'Age ' + age + ' against a minimum of ' + ctx.requisition.minAge + ' for ' + ctx.requisition.title + '.',
        values: { age, minAge: ctx.requisition.minAge },
        law: ctx.requisition.minAge > 16
          ? 'Federal child labour rules and the state alcohol or equipment restriction the role carries.'
          : null
      };
    }
  },
  {
    key: 'right_to_work',
    name: 'Right to work declared',
    run(ctx) {
      const d = ctx.application.rightToWorkDeclared;
      return {
        passed: d === true,
        basis: d === true
          ? 'Declared on the application. Not verified here: verification is the I-9 and E-Verify at step 11 and 12.'
          : 'Not declared on the application.',
        values: { declared: d },
        law: 'A declaration only. Asking for documents before an offer is an unfair documentary practice.'
      };
    }
  },
  {
    key: 'availability',
    name: 'Availability covers the shift pattern',
    run(ctx) {
      const o = availabilityOverlap(ctx.application.availability, ctx.requisition.requiredSlots);
      return {
        passed: o.missing.length === 0,
        basis: o.missing.length === 0
          ? 'Covers all ' + o.required.length + ' required slots.'
          : 'Needs ' + o.required.join(', ') + '. Not offered: ' + o.missing.join(', ') + '.',
        values: o
      };
    }
  },
  {
    key: 'distance',
    name: 'Within the commute band the store set',
    run(ctx) {
      const d = ctx.application.distanceMiles;
      const max = ctx.requisition.maxDistanceMiles;
      return {
        passed: d <= max,
        basis: d + ' miles from ' + ctx.store.name + ', against a band of ' + max + '.',
        values: { distanceMiles: d, maxDistanceMiles: max },
        advisory: true
      };
    }
  },
  {
    key: 'rehire_eligibility',
    name: 'Rehire eligibility on this retailer\'s own records',
    run(ctx) {
      const m = ctx.rehire;
      if (!m || !m.matched) {
        return {
          passed: true,
          basis: 'No prior employment record at ' + ctx.tenantName + '.',
          values: { matched: false }
        };
      }
      if (m.rehireEligible === false) {
        return {
          passed: false,
          basis: 'Prior separation on ' + m.record.separatedOn.slice(0, 10) + ' at ' + m.record.storeName +
                 ' is marked not eligible for rehire. Reason held on the record: ' + m.record.separationReason + '.',
          values: { matched: true, rehireEligible: false, priorEmployeeId: m.record.employeeId },
          holdForPerson: true
        };
      }
      return {
        passed: true,
        basis: 'Previously employed as ' + m.record.role + ' at ' + m.record.storeName + ', ' +
               m.record.startedOn.slice(0, 10) + ' to ' + m.record.separatedOn.slice(0, 10) + '. Eligible for rehire.',
        values: { matched: true, rehireEligible: true, priorEmployeeId: m.record.employeeId }
      };
    }
  }
];

/* -------------------------------------------------------- the evaluation --- */

/**
 * Runs every rule and returns the whole result, including the rules that
 * passed. A screen that shows only the failure cannot answer "what did you
 * actually check".
 */
function evaluateEligibility(ctx) {
  const results = RULES.map((r) => {
    const out = r.run(ctx);
    return { key: r.key, name: r.name, passed: !!out.passed, basis: out.basis,
             values: out.values || null, law: out.law || null,
             advisory: !!out.advisory, holdForPerson: !!out.holdForPerson };
  });
  const failed = results.filter((r) => !r.passed && !r.advisory);
  const hold = results.filter((r) => r.holdForPerson);
  return {
    at: ctx.now,
    engine: 'deterministic-rules',
    version: 'rules-1.0.0',
    results,
    passed: failed.length === 0,
    failedKeys: failed.map((r) => r.key),
    // A do-not-rehire record does not auto-reject. It stops the application and
    // puts it in front of a person, because the record may be wrong and the only
    // way to find out is to ask somebody who was there.
    holdForPerson: hold.length > 0,
    holdReason: hold.length ? hold[0].basis : null
  };
}

/* ----------------------------------------------------- the rehire lookup --- */

/**
 * The identity key. Normalised name plus date of birth plus the last four
 * digits of the phone number.
 *
 * It is deliberately not a social security number. The product does not hold
 * one at application time and should not ask for one: an I-9 does not require
 * an SSN unless the employer uses E-Verify, and collecting one earlier than
 * necessary creates a custody problem for no gain.
 */
function identityKey(person) {
  const name = (person.lastName + '|' + person.firstName)
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z|]/g, '');
  const dob = String(person.dob).slice(0, 10);
  const last4 = String(person.phone || '').replace(/\D/g, '').slice(-4);
  return name + '#' + dob + '#' + last4;
}

/**
 * Looks a candidate up against this retailer's own employment records.
 *
 * Two ways to match, and the difference is on screen rather than hidden:
 *   exact  name, date of birth and the last four phone digits all agree
 *   partial name and date of birth agree, the phone number has changed
 * A partial match is a suggestion for a person to confirm, not a fact.
 */
function matchPriorEmployment(store, tenantId, candidate, nowMs) {
  const key = identityKey(candidate);
  const rows = store.all('priorEmployment', tenantId);

  let record = rows.find((r) => r.identityKey === key) || null;
  let confidence = record ? 'exact' : null;

  if (!record) {
    const softKey = key.split('#').slice(0, 2).join('#');
    const soft = rows.filter((r) => r.identityKey.split('#').slice(0, 2).join('#') === softKey);
    if (soft.length === 1) { record = soft[0]; confidence = 'partial'; }
  }

  if (!record) return { matched: false, scope: 'this customer\'s own records only' };

  /* Form I-9 reuse. 8 CFR 274a.2(c)(1)(i): where a person is rehired within
     three years of the date of the INITIAL EXECUTION of their previous Form
     I-9, the employer may either complete a new form or update and reverify the
     previous one. Three years from initial execution, not from separation, and
     getting that wrong in either direction is a paperwork violation. */
  const i9Executed = record.i9ExecutedOn ? new Date(record.i9ExecutedOn).getTime() : null;
  const i9WindowEnds = i9Executed != null ? i9Executed + 3 * YEAR : null;
  const i9Reusable = i9WindowEnds != null && nowMs < i9WindowEnds;

  return {
    matched: true,
    confidence,
    scope: 'this customer\'s own records only',
    record,
    rehireEligible: record.rehireEligible,
    i9: {
      executedOn: record.i9ExecutedOn,
      windowEndsAt: i9WindowEnds,
      reusable: i9Reusable,
      rule: '8 CFR 274a.2(c)(1)(i). Three years from the initial execution of the previous form, not from the separation date.',
      effect: i9Reusable
        ? 'Section 1 can be updated and reverified rather than completed from scratch.'
        : 'Outside the three-year window. A new Form I-9 is required.'
    },
    reusable: reusableSteps(record, i9Reusable)
  };
}

/** What genuinely does not have to be done twice, and what does. */
function reusableSteps(record, i9Reusable) {
  const out = [];
  if (i9Reusable) {
    out.push({ key: 'i9_s1', name: 'Form I-9, Section 1', reuse: 'update-and-reverify',
               why: 'Within three years of the initial execution of the previous form.' });
  }
  (record.training || []).forEach((t) => {
    const stillValid = !t.expiresOn || new Date(t.expiresOn).getTime() > Date.now();
    out.push({ key: 'training:' + t.code, name: t.name,
               reuse: stillValid ? 'carry-forward' : 'retake',
               why: stillValid
                 ? 'Completed ' + t.completedOn.slice(0, 10) + (t.expiresOn ? ', valid to ' + t.expiresOn.slice(0, 10) : ', no expiry') + '.'
                 : 'Expired ' + t.expiresOn.slice(0, 10) + '. Has to be retaken.' });
  });
  if (record.employeeId) {
    out.push({ key: 'payroll', name: 'Payroll record', reuse: 'reactivate',
               why: 'Employee ID ' + record.employeeId + ' already exists in payroll.' });
  }
  // Things that are never reused, said out loud so nobody assumes otherwise.
  out.push({ key: 'everify', name: 'E-Verify case', reuse: 'never',
             why: 'A new case is required for every new hire. E-Verify User Manual, section 2.' });
  out.push({ key: 'bgcheck', name: 'Background check', reuse: 'fresh-order',
             why: 'FCRA sets no shelf life, so a prior report is not unusable. This customer\'s policy says order fresh, and policy is the constraint here, not the law.' });
  return out;
}

module.exports = { RULES, evaluateEligibility, matchPriorEmployment, identityKey, ageOn, availabilityOverlap };
