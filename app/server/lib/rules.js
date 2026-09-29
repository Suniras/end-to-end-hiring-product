/* ============================================================================
   rules.js  ·  deterministic eligibility, and the rehire lookup

   NO MODEL RUNS IN THIS FILE, and the property has to stay provable by reading
   the source. Step 6 already produces a score that a person acts on, which is
   what makes this product a regulated automated employment decision tool in
   New York City and California. Age, right to work, availability, a commute
   band and a rehire flag are yes-or-no questions against values we already
   hold, so a model here would add no capability and would widen the regulated
   surface for nothing.

   Four things a test may grep this source for, and none of them appears, not
   even inside a comment: an import of the model module, a network call, a
   random source, and a read of the wall clock. The only present this file
   reads is the one on ctx, which the caller injects. Given the same inputs it
   returns the same bytes, and that is the property that lets an audit re-run a
   recorded decision three years later and get the recorded answer back.

   IT ALSO NEVER WRITES. No events, no exceptions, no state. The caller that
   owns the transition writes the work event, the audit entry and the rehire
   hold. Keeping the scoring free of side effects is why it can be re-run for
   an audit without changing anything.

   EVERY RULE RETURNS THE INPUTS IT USED. "Failed on availability" is not an
   answer anybody can act on. "Needs Saturday evening and Sunday evening, not
   offered Sunday evening" is.

   THE REHIRE LOOKUP READS ONE CUSTOMER'S OWN RECORDS AND NOTHING ELSE. There
   is exactly one read of the priorEmployment table in this file and it passes
   ctx.tenantId, which the store refuses to work without. Pooling employment
   history across customers and answering questions from the pool is what a
   consumer reporting agency does under 15 U.S.C. 1681a(f), and that is a
   different company with a different licence. D-030. The tenancy is the
   boundary, not the scoring and not the model.

   ---------------------------------------------------------------------------
   WHAT WAS WRONG IN THE PREVIOUS BUILD, and is fixed here. Each of these is a
   real defect in demo/server/lib/rules.js, not a preference.

   1. The reuse map measured training expiry against the wall clock while the
      rest of the product ran on the injected clock. Winding the demo clock
      forward three years could not expire a course. The instant is now an
      argument and its absence throws.
   2. `advisory` and `holdForPerson` came out of each rule's own branch, so
      whether a failure stopped somebody depended on which branch ran. They are
      now declared on the rule, and a branch can only choose whether this
      evaluation holds, never whether the rule is capable of holding.
   3. A missing input refused a person with a sentence containing "undefined":
      no minAge on the requisition, no date of birth on the record, a required
      slot that is not one of the thirteen. The refusals stay refusals, because
      failing closed is right, but the basis now names the requisition or the
      record as the fault rather than the applicant.
   4. A prior employment row with no separation date threw inside the rule, so
      the application ended up with no eligibility result at all.
   5. The hold sentence a manager reads did not say the match was partial. A
      partial match is name and date of birth with the phone digits dropped, so
      it may not be that person's record, and the manager deciding has to be
      told that in the sentence they are reading.
   6. The three-year Form I-9 window was computed with a mean Gregorian year of
      365.2425 days. It is now calendar arithmetic, because the rule names a
      date three years on rather than a span of days. The mean lands hours away
      from that date in either direction depending on where the leap day falls:
      measured on a 17 August execution it closed the window 6h 32m early, and
      across a span with no leap day in it the same formula runs about
      seventeen hours long. Either side of the line is a paperwork violation.
   7. Two rows sharing one identity key were resolved by array order. One
      person rehired once has two rows, so array order was deciding somebody's
      rehire eligibility. The row carrying a do-not-rehire flag now governs,
      and otherwise the most recent spell does.
   8. The reuse map's keys did not line up with the onboarding task keys, so
      training marked carry-forward was still created as work to do. Each entry
      now carries the task key it applies to, and `canSkipTask` answers the
      question the onboarding fan-out actually asks.
   9. THE ONE THAT WAS A LEGAL EXPOSURE AND NOT A BUG. `min_age.law()` returned
      "Federal child labour rules and the state alcohol or equipment restriction
      the role carries" for any minimum above 16, with no ceiling. Called
      directly, law(18), law(21) and law(40) all returned it, and that string
      was written into the eligibility result and from there into the audit
      record. Federal child labour law reaches minors under 18 and stops. There
      is no child labour basis for a minimum of 21 and none at all for 40, which
      is a facially unlawful age bar under the ADEA, and the product would have
      printed a legal justification for it. The clause about a state alcohol or
      equipment restriction was invented outright for every role: none of the
      eight seeded requisitions carries one.

      A computed sentence was the wrong shape. The basis for a minimum age is a
      fact about the role, so it is now a field on the requisition, and nothing
      is asserted above 18 unless the requisition names it. See the law()
      function below for what is still said in the sixteen to eighteen band and
      why that much is safe.

   ---------------------------------------------------------------------------
   THE VERIFICATION PASS behind the citations in this file. Read 8 September
   2026, primary text in each case.

     8 CFR 274a.2(c)(1)(i)     eCFR full-text API, title 8 part 274a, edition
                               2026-01-01. The three year rehire window runs
                               from the initial execution of the previous form.
     29 CFR 570 subpart E      eCFR structure and full text, title 29 part 570.
                               570.61(a) covers wholesale, retail and service
                               establishments and applies to minors between 16
                               and 18. 570.61(a)(4) names meat slicers.
     15 U.S.C. 1681a(f)        The definition of a consumer reporting agency.
     8 U.S.C. 1324b(a)(6)      Document abuse, and note what it actually says.
     E-Verify User Manual      M-775, current as of May 2025, section 2.2.

   uscode.house.gov refused the connection during the pass, so the two United
   States Code sections were read at law.cornell.edu. That is a faithful
   reproduction and not the primary publication, and it is recorded that way.
   ============================================================================ */

import * as SLOT_TABLE from '../../web/js/slots.js';
import { ONBOARDING_TASKS } from '../../domain/states.js';
import { HOUR } from './clock.js';

/* The canonical thirteen slots. Resolved once so no slot key is ever parsed in
   this file: the apply form's grid, the availability question the voice agent
   reads and this rule all have to agree, and a second description of one shift
   pattern is exactly how they drifted apart twice in two days. */
const SLOTS = SLOT_TABLE.KEYS ? SLOT_TABLE : (SLOT_TABLE.default || SLOT_TABLE);

/** "Saturday evening", falling back to the raw key so a label gap never hides
    which slot is missing. */
function slotLabel(key) {
  const l = typeof SLOTS.label === 'function' ? SLOTS.label(key) : null;
  return l || String(key);
}

/* A missing validity helper must not turn every slot into a data fault, so the
   absence of the check reads as "no opinion" rather than as "all wrong". */
function slotValid(key) {
  return typeof SLOTS.valid === 'function' ? SLOTS.valid(key) : true;
}

/* Named at module load so renaming a task in states.js is a loud failure here
   rather than a reuse entry that quietly stops matching anything. */
const TASK_KEYS = ONBOARDING_TASKS.map((t) => t.key);
function taskKey(k) {
  if (TASK_KEYS.indexOf(k) < 0) {
    throw new Error('rules.js names onboarding task "' + k + '", which is not in ONBOARDING_TASKS.');
  }
  return k;
}
const T_I9_S1 = taskKey('i9_s1');
const T_TRAINING = taskKey('training');
const T_PAYROLL = taskKey('payroll');
const T_EVERIFY = taskKey('everify');

export const ENGINE = 'deterministic-rules';

/* ------------------------------------------------- law against not-law ---
   Every rule that says anything legal says what KIND of thing it is saying, in
   the same two fields the compliance module uses, so a screen can refuse to
   render a policy or an unnamed basis as law.

     lawAuthority   what kind of rule it is, or null where there is no rule
     lawSource      how well we know the citation on it
     lawGap         why there is no basis, where there is none. An audit record
                    showing an absence is worth more than one showing silence.
   ------------------------------------------------------------------------- */

export const LAW_AUTHORITIES = ['federal-statute', 'federal-regulation', 'program-agreement', 'tenant-policy'];
export const LAW_SOURCES = ['verified', 'requisition', 'unnamed', 'unpinned'];

/* Identifies the RULE SET, and it is written into every audit entry. The five
   rules and their pass conditions are unchanged from the previous build, so
   the version is unchanged with them. Bump it when a pass condition changes,
   never when a sentence does. */
export const VERSION = 'rules-1.0.0';

/* ------------------------------------------------------------- small tools --- */

/** A number, or null. Accepts a numeric string, because a requisition edited
    through a form arrives as text and the previous build's `>=` coerced it. */
function num(v) {
  if (typeof v === 'number') return isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v))) return Number(v);
  return null;
}

/** Milliseconds from an ISO date, or null. Never NaN, which compares false
    against everything and so reads as a quiet failure. */
function ms(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return isNaN(t) ? null : t;
}

/** The date part, for a sentence a person reads. */
function day(iso) {
  return iso ? String(iso).slice(0, 10) : 'an unrecorded date';
}

function joinList(xs) {
  return xs.join(', ');
}

/** A fragment that is about to have a full stop appended. The previous build
    printed "Ended for cause. Note on file.." on the one sentence a manager
    reads before deciding whether to override a do-not-rehire flag. */
function clause(s) {
  const v = String(s == null ? '' : s).trim();
  return v.replace(/\.+$/, '');
}

/**
 * Calendar years, in UTC.
 *
 * The Form I-9 rehire window is a date three years on, not a span of days. A
 * 29 February execution normalises to 1 March, which is what Date does and
 * what leaves nobody outside the window by a day they cannot see.
 */
function addYearsUTC(at, years) {
  const d = new Date(at);
  return Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), d.getUTCDate(),
                  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
}

/**
 * Age on a given instant, calendar correct.
 *
 * Returns null rather than NaN for an unreadable date of birth. NaN >= 18 is
 * false, so the previous build reported somebody with a broken record as too
 * young and printed NaN in the sentence explaining it.
 */
export function ageOn(dobISO, atMs) {
  const born = ms(dobISO);
  if (born == null || atMs == null) return null;
  const dob = new Date(born), at = new Date(atMs);
  let a = at.getUTCFullYear() - dob.getUTCFullYear();
  const m = at.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && at.getUTCDate() < dob.getUTCDate())) a--;
  return a;
}

/**
 * Which required shifts the applicant offered, and which they did not.
 *
 * `unknown` is new: a requiredSlot that is not one of the thirteen cannot
 * appear on the apply form, so nobody can ever offer it and every applicant
 * fails forever. It still counts as missing, because the requisition genuinely
 * is not covered, but it is reported separately so the sentence can say whose
 * fault it is.
 */
export function availabilityOverlap(offered, required) {
  const have = new Set(offered || []);
  const req = (required || []).slice();
  const missing = req.filter((s) => !have.has(s));
  return {
    required: req,
    missing,
    covered: req.length - missing.length,
    unknown: req.filter((s) => !slotValid(s))
  };
}

/* ---------------------------------------------------- the age basis field ---
   A minimum age is a fact about the role, so the reason for it belongs on the
   requisition beside the number. This is the field, and it is the fix for the
   fabricated child labour assertion recorded as defect 9 in the header.

   Shape on the requisition:

     minAgeBasis: {
       citation:  '29 CFR 570.61(a)(4)',
       rule:      'Under-18s may not operate power-driven meat slicers.',
       authority: 'federal-regulation'
     }

   A plain string is accepted as the rule with no citation, because a customer
   typing a sentence into a form is the likely case and losing it would be
   worse than storing it unpinned.
   -------------------------------------------------------------------------- */

export const AGE_BASIS_FIELD = 'minAgeBasis';

/* The two edges of the only band where this file asserts a basis on its own,
   and they are not chosen numbers. 29 CFR 570.61(a) declares the occupations it
   covers "particularly hazardous for the employment of minors between 16 and 18
   years of age", read verbatim on 8 September 2026, and every order in the
   subpart is framed the same way. Below sixteen there is nothing role-specific
   to name. Above eighteen no federal rule about minors reaches at all. */
export const FEDERAL_MINOR_FLOOR = 16;
export const FEDERAL_MINOR_CEILING = 18;

/**
 * What can honestly be said for a minimum of 17 or 18 with nothing named.
 *
 * The subpart, not an order. Naming an order would be picking one of seventeen
 * for a role whose hazard nobody recorded, which is how the sentence this
 * replaces came to assert a state alcohol restriction for a cashier.
 */
export const UNNAMED_MINOR_BASIS =
  'A minimum in this band can rest on the federal hazardous occupation orders for minors, ' +
  'which bar 16 and 17 year olds from named occupations including in retail establishments. ' +
  '29 CFR part 570 subpart E. Which order applies to this role is not recorded on the requisition, ' +
  'so this names the subpart and not a rule.';

/**
 * The requisition's own basis, normalised, or null.
 *
 * `authority` is passed through and NOT defaulted. A customer typing a sentence
 * into a form has told us the reason and has not told us what kind of rule it
 * is, and defaulting that to a federal regulation is the same class of mistake
 * as the sentence this whole field replaces.
 */
function namedAgeBasis(requisition) {
  const raw = requisition ? requisition[AGE_BASIS_FIELD] : null;
  if (!raw) return null;
  if (typeof raw === 'string') {
    const t = clause(raw);
    return t ? { rule: t, citation: null, authority: null } : null;
  }
  const rule = clause(raw.rule || '');
  const citation = clause(raw.citation || '');
  if (!rule && !citation) return null;
  return {
    rule: rule || 'The requisition states a basis for its minimum age',
    citation: citation || null,
    authority: raw.authority || null
  };
}

/** One sentence, with the citation on the end when there is one. */
function ageBasisSentence(named) {
  return named.citation ? named.rule + '. ' + named.citation + '.' : named.rule + '.';
}

/* ------------------------------------------------------------- the rules --- */

/**
 * The five, as data.
 *
 * `advisory` and `holdsForPerson` are declared here rather than returned by
 * run(), because they decide whether somebody is auto-refused or put in front
 * of a manager and that must be a property of the rule rather than of the
 * branch it happened to take.
 *
 *   advisory        a failure is recorded and shown, and stops nothing
 *   holdsForPerson  a failure can stop the application without refusing it
 *
 * `candidateSentence` is what the applicant is told. It used to live in
 * intake.js keyed by rule key, one file away from the keys it was keyed on.
 * Three of the four state something the applicant just typed, so saying it
 * back is not a disclosure. `rehire_eligibility` has none on purpose: telling
 * somebody a prior employment record stopped their application discloses an
 * employment history to whoever is standing next to them, and under a partial
 * match it may not even be theirs.
 */
export const RULES = [
  {
    key: 'min_age',
    name: 'Minimum age for the role',
    reads: ['candidate.dob', 'requisition.minAge'],
    passesWhen: 'Their age on the day they applied is at or above the minimum the role carries.',
    advisory: false,
    holdsForPerson: false,
    candidateSentence: 'This role has a minimum age and the date of birth you gave is below it.',
    /**
     * The legal basis for this role's minimum age, or nothing.
     *
     * THE DEFECT THIS REPLACES. The old version returned a fixed sentence
     * asserting "federal child labour rules and the state alcohol or equipment
     * restriction the role carries" for every minimum above 16, with no
     * ceiling, so law(21) and law(40) both returned it. Federal child labour
     * law reaches minors under 18. A minimum of 40 is an unlawful age bar and
     * the product was printing a justification for it into an audit record.
     *
     * Three bands now, and the reason for each.
     *
     * At or below sixteen, nothing is asserted. The federal floor for
     * non-agricultural work is the general rule, not something this role
     * carries, and naming a restriction that does not apply would be inventing
     * one.
     *
     * Above eighteen, nothing is asserted unless the requisition names it. No
     * federal rule about minors can reach a minimum of 19 or more, so a basis
     * there is a fact about the state or the role that only whoever wrote the
     * requisition knows. The row reports the absence instead of filling it.
     *
     * Between the two, one thing can be said and it is said carefully. The
     * hazardous occupation orders in 29 CFR part 570 subpart E do bar minors
     * between 16 and 18 from named occupations in retail establishments, so a
     * minimum of 17 or 18 CAN rest on them. Whether it rests on them for THIS
     * role depends on which order applies, and only the requisition can say.
     * So the sentence names the subpart and says the specific order is not
     * recorded. The seeded deli minimum of 18 is a real example: 570.61(a)(4)
     * names meat slicers and 570.61(a) covers retail establishments, which is
     * exactly the citation that belongs in the requisition field.
     */
    law(f) {
      const named = namedAgeBasis(f.requisition);
      if (named) return ageBasisSentence(named);
      const min = num(f.requisition && f.requisition.minAge);
      if (min == null || min <= FEDERAL_MINOR_FLOOR) return null;
      if (min <= FEDERAL_MINOR_CEILING) return UNNAMED_MINOR_BASIS;
      return null;
    },
    lawAuthority(f) {
      const named = namedAgeBasis(f.requisition);
      if (named) return named.authority;
      const min = num(f.requisition && f.requisition.minAge);
      if (min == null || min <= FEDERAL_MINOR_FLOOR) return null;
      return min <= FEDERAL_MINOR_CEILING ? 'federal-regulation' : null;
    },
    lawSource(f) {
      const named = namedAgeBasis(f.requisition);
      if (named) return 'requisition';
      const min = num(f.requisition && f.requisition.minAge);
      if (min == null || min <= FEDERAL_MINOR_FLOOR) return null;
      return min <= FEDERAL_MINOR_CEILING ? 'unnamed' : null;
    },
    /* The absence, said out loud. Above eighteen this is the only thing on the
       record about the basis, and it names the field that would fix it. */
    lawGap(f) {
      const named = namedAgeBasis(f.requisition);
      if (named) {
        return named.citation ? null
          : 'The requisition names a reason for its minimum age and no citation for it, so the basis is ' +
            'recorded as stated and not as checked.';
      }
      const min = num(f.requisition && f.requisition.minAge);
      if (min == null || min <= FEDERAL_MINOR_FLOOR) return null;
      if (min <= FEDERAL_MINOR_CEILING) {
        return 'The requisition does not name which hazardous occupation order its minimum of ' + min +
               ' rests on, so the basis is the subpart and not a rule. Set ' + AGE_BASIS_FIELD +
               ' on the requisition.';
      }
      return 'No legal basis is asserted for a minimum age of ' + min + '. Federal rules about minors ' +
             'stop at 18, so nothing here can support this and no sentence is invented. A minimum at or ' +
             'above 40 is an age bar the ADEA reaches. Set ' + AGE_BASIS_FIELD + ' on the requisition ' +
             'with the statute it rests on, or lower the minimum.';
    },
    run(f) {
      const min = num(f.requisition && f.requisition.minAge);
      const age = ageOn(f.candidate && f.candidate.dob, f.at);
      if (min == null) {
        return {
          passed: false,
          basis: 'No minimum age is set on ' + roleName(f) + ', so the age bar cannot be scored. ' +
                 'That is a fault on the requisition, not on the applicant.',
          values: { age, minAge: null }
        };
      }
      if (age == null) {
        return {
          passed: false,
          basis: 'No usable date of birth on this record, so age cannot be scored against a minimum of ' + min + '.',
          values: { age: null, minAge: min }
        };
      }
      return {
        passed: age >= min,
        basis: 'Age ' + age + ' against a minimum of ' + min + ' for ' + roleName(f) + '.',
        values: { age, minAge: min }
      };
    }
  },

  {
    key: 'right_to_work',
    name: 'Right to work declared',
    reads: ['application.rightToWorkDeclared'],
    passesWhen: 'They declared it on the application. Strictly true, never merely truthy.',
    advisory: false,
    holdsForPerson: false,
    candidateSentence: 'This role needs authorisation to work in the United States.',
    /* CORRECTED, and the old sentence was wrong twice. It said "asking for
       documents before an offer is an unfair documentary practice", which is
       not what the section says. 8 U.S.C. 1324b(a)(6) reaches a request for
       MORE OR DIFFERENT documents than the Form I-9 requires, or a refusal to
       honour documents that reasonably appear genuine, and only where done with
       the purpose or intent of discriminating. Timing is not the violation.
       Read 8 September 2026. */
    law: 'A declaration at this stage and nothing more. Verification is the Form I-9 at step 11. ' +
         'Requesting more or different documents than that form requires, or refusing documents that ' +
         'reasonably appear genuine, is an unfair immigration-related employment practice where done ' +
         'with intent to discriminate. 8 U.S.C. 1324b(a)(6).',
    lawAuthority: 'federal-statute',
    lawSource: 'verified',
    run(f) {
      const d = f.application ? f.application.rightToWorkDeclared : undefined;
      return {
        passed: d === true,
        basis: d === true
          ? 'Declared on the application. Not verified here: verification is the Form I-9 at step 11 and the E-Verify case at step 12.'
          : 'Not declared on the application.',
        /* Normalised, because JSON.stringify drops an undefined value and the
           stored row then lost the field entirely, so a screen could not tell
           "not answered" from "we never asked". */
        values: { declared: d === true ? true : (d === false ? false : null) }
      };
    }
  },

  {
    key: 'availability',
    name: 'Availability covers the shift pattern',
    reads: ['application.availability', 'requisition.requiredSlots'],
    passesWhen: 'Every required slot is one they offered.',
    advisory: false,
    holdsForPerson: false,
    candidateSentence: 'This role needs shifts that are not among the ones you ticked.',
    law: null,
    run(f) {
      const o = availabilityOverlap(
        f.application && f.application.availability,
        f.requisition && f.requisition.requiredSlots
      );
      if (!o.required.length) {
        return { passed: true, values: o,
                 basis: 'This requisition names no required shifts, so there is nothing to score.' };
      }
      /* The slots are named rather than counted. "Covers all 3 required slots"
         cannot answer which three, which is the only thing a person reading it
         wants to know. */
      const needs = 'Needs ' + joinList(o.required.map(slotLabel));
      if (!o.missing.length) return { passed: true, values: o, basis: needs + '. All of them are offered.' };

      let basis = needs + '. Not offered: ' + joinList(o.missing.map(slotLabel)) + '.';
      if (o.unknown.length) {
        basis += ' ' + joinList(o.unknown) + (o.unknown.length === 1 ? ' is' : ' are') +
                 ' not on the apply form, so nobody could have offered ' +
                 (o.unknown.length === 1 ? 'it' : 'them') + '. Fix the requisition.';
      }
      return { passed: false, values: o, basis };
    }
  },

  {
    key: 'distance',
    name: 'Within the commute band the store set',
    reads: ['application.distanceMiles', 'requisition.maxDistanceMiles'],
    passesWhen: 'The distance is inside the band, or there is no distance to score.',
    /* Advisory, and it is the only one. A long commute is a reason to talk to
       somebody, not a reason to refuse them. */
    advisory: true,
    holdsForPerson: false,
    candidateSentence: 'This store is further away than the role allows.',
    law: null,
    run(f) {
      const d = num(f.application && f.application.distanceMiles);
      const max = num(f.requisition && f.requisition.maxDistanceMiles);
      const where = f.storeRow && f.storeRow.name ? f.storeRow.name : 'the store';
      /* An unknown value is not a failure. An advisory rule that fails on
         missing data teaches people to ignore the advisory rules. */
      if (d == null || max == null) {
        return {
          passed: true,
          basis: d == null
            ? 'No distance on the application, so the commute band was not scored.'
            : 'No commute band on this requisition, so distance was not scored.',
          values: { distanceMiles: d, maxDistanceMiles: max }
        };
      }
      return {
        passed: d <= max,
        basis: d + ' miles from ' + where + ', against a band of ' + max + '.',
        values: { distanceMiles: d, maxDistanceMiles: max }
      };
    }
  },

  {
    key: 'rehire_eligibility',
    name: "Rehire eligibility on this retailer's own records",
    reads: ['the rehire match against priorEmployment for this tenant'],
    passesWhen: 'There is no match, or the matched record is not marked not-eligible.',
    advisory: false,
    /* THE ONE THAT HOLDS. A do-not-rehire record does not refuse anybody. It
       stops the application and puts it in front of a person, because the
       record may be wrong and the only way to find out is to ask somebody who
       was there. */
    holdsForPerson: true,
    candidateSentence: null,
    law: 'Read from one customer\'s own employment records. 15 U.S.C. 1681a(f) defines a consumer ' +
         'reporting agency as anyone who, for fees or on a cooperative basis, regularly assembles or ' +
         'evaluates information on consumers to furnish reports to third parties. Pooling employment ' +
         'history across customers and answering questions from the pool is that activity.',
    lawAuthority: 'federal-statute',
    lawSource: 'verified',
    run(f) {
      const m = f.rehire;
      if (!m || !m.matched) {
        return { passed: true, values: { matched: false, confidence: null },
                 basis: 'No prior employment record at ' + tenantName(f) + '.' };
      }
      const r = m.record || {};
      const soft = m.confidence === 'partial'
        ? ' This is a partial match: the name and date of birth agree and the phone number on the record ' +
          'is different, so it may not be the same person. Confirm it before acting on it.'
        : '';
      if (m.rehireEligible === false) {
        return {
          passed: false,
          hold: true,
          basis: 'Prior separation on ' + day(r.separatedOn) + ' at ' + (r.storeName || 'an unnamed store') +
                 ' is marked not eligible for rehire. Reason held on the record: ' +
                 (clause(r.separationReason) || 'none recorded') + '.' + soft,
          values: { matched: true, confidence: m.confidence || null, rehireEligible: false,
                    priorEmployeeId: r.employeeId || null }
        };
      }
      return {
        passed: true,
        basis: 'Previously employed as ' + (r.role || 'staff') + ' at ' + (r.storeName || 'an unnamed store') +
               ', ' + day(r.startedOn) + ' to ' + day(r.separatedOn) + '. Eligible for rehire.' + soft,
        values: { matched: true, confidence: m.confidence || null, rehireEligible: true,
                  priorEmployeeId: r.employeeId || null }
      };
    }
  }
];

function roleName(f) {
  return (f.requisition && f.requisition.title) || 'this role';
}

function tenantName(f) {
  return f.tenantName || 'this retailer';
}

function lawOf(rule, facts, out) {
  if (out && out.law) return out.law;
  return typeof rule.law === 'function' ? (rule.law(facts) || null) : (rule.law || null);
}

/**
 * Read a field that may be a value or a function of the facts.
 *
 * `law` was already allowed to be either and the three fields beside it have to
 * follow, or a rule computing its basis per requisition would be unable to say
 * what kind of basis it had computed.
 */
function fieldOf(rule, name, facts) {
  const v = rule[name];
  return typeof v === 'function' ? (v(facts) || null) : (v || null);
}

/**
 * The record refuses to claim a tier it cannot support.
 *
 * If a rule ends up with no basis sentence, it gets no authority and no source
 * either. Any other combination is how the string "federal child labour rules"
 * came to sit beside a minimum of 40 with a tier that made it look checked.
 */
function tierOf(rule, facts, law) {
  if (!law) return { lawAuthority: null, lawSource: null };
  const authority = fieldOf(rule, 'lawAuthority', facts);
  const source = fieldOf(rule, 'lawSource', facts);
  return {
    lawAuthority: LAW_AUTHORITIES.indexOf(authority) >= 0 ? authority : null,
    lawSource: LAW_SOURCES.indexOf(source) >= 0 ? source : null
  };
}

/* -------------------------------------------------------- the evaluation --- */

/**
 * Run all five rules over one application.
 *
 * `o` carries { application, candidate, requisition, storeRow, rehire, at }
 * and only `application` is required. Everything else is looked up from the
 * application if the caller does not pass it, because the previous build made
 * every caller assemble seven fields and remember to run the rehire lookup
 * first, and two call sites assembling the same thing is how they diverge.
 *
 * The retail store row is `storeRow` rather than `store`, because `store` is
 * the persistence layer in this signature and one word with two meanings in
 * one call is how a caller passes the wrong object.
 *
 * Returns every rule, including the ones that passed. A screen showing only
 * the failure cannot answer "what did you actually check".
 */
export function evaluateEligibility(store, ctx, o) {
  const input = o || {};
  const application = input.application;
  if (!application) {
    throw new Error('evaluateEligibility needs an application. A missing one is a crash here rather ' +
                    'than an empty pass somewhere downstream.');
  }

  const candidate = input.candidate || store.byId('candidates', ctx.tenantId, application.candidateId);
  const requisition = input.requisition || store.byId('requisitions', ctx.tenantId, application.requisitionId);
  const storeRow = input.storeRow || store.byId('stores', ctx.tenantId, application.storeId);

  /* Age is scored on the day they APPLIED. The previous build passed the
     present instead, which gave the same answer only because the seed replays
     with the clock wound back. Run against a real application from last year
     and the two differ, and a recorded decision that cannot be reproduced is
     not auditable. */
  const at = input.at != null ? input.at
    : (application.appliedAt != null ? application.appliedAt : ctx.clock.now());

  /* Falsy rather than undefined on purpose: a caller who passes nothing, or
     null, still gets the lookup. The rehire check must not be skippable by
     omission. The lookup itself runs against the present, because whether the
     previous Form I-9 can be reused is a question about today. */
  const rehire = input.rehire || matchPriorEmployment(store, ctx, candidate, ctx.clock.now());

  const facts = { at, application, candidate, requisition, storeRow, rehire, tenantName: ctx.tenantName };

  const results = RULES.map((rule) => {
    const out = rule.run(facts) || {};
    const law = lawOf(rule, facts, out);
    const tier = tierOf(rule, facts, law);
    return {
      key: rule.key,
      name: rule.name,
      passed: out.passed === true,
      basis: out.basis || null,
      values: out.values || null,
      law,
      /* The three fields that make the audit record readable years later: what
         kind of rule the basis is, how well the citation is known, and where
         there is no basis at all, why not. */
      lawAuthority: tier.lawAuthority,
      lawSource: tier.lawSource,
      lawGap: fieldOf(rule, 'lawGap', facts),
      advisory: rule.advisory === true,
      holdForPerson: rule.holdsForPerson === true && out.hold === true
    };
  });

  const failed = results.filter((r) => !r.passed && !r.advisory);
  const held = results.filter((r) => r.holdForPerson);

  return {
    at,
    engine: ENGINE,
    version: VERSION,
    results,
    /* Advisory failures are ignored here. Distance can fail without stopping
       anything, which is the whole reason it is advisory. */
    passed: failed.length === 0,
    failedKeys: failed.map((r) => r.key),
    holdForPerson: held.length > 0,
    holdReason: held.length ? held[0].basis : null
  };
}

/* ----------------------------------------------------- the rehire lookup --- */

/** On every match, so no reader has to assume it. */
export const MATCH_SCOPE = "this customer's own records only";

/**
 * The identity key. Normalised name, plus date of birth, plus the last four
 * digits of the phone number.
 *
 * IT IS DELIBERATELY NOT A SOCIAL SECURITY NUMBER. Nothing in the five rules
 * needs one, so collecting it at intake creates a custody problem for no gain.
 *
 * WHAT THIS DOES NOT MEAN, and the candidate-facing copy has it wrong. This
 * employer is enrolled in E-Verify, so an SSN IS required later: the Form I-9
 * at step 11 requires one for an E-Verify employer, and every hired candidate
 * will be asked. "None is needed" is true only of applying, and a sentence that
 * drops the scope is a misstatement of the law to the candidate. The background
 * check sentence next to it scopes itself correctly with "only if you are
 * offered the job" and the SSN sentence has to do the same.
 *
 * The diacritic strip is written as an escaped code point range. The previous
 * build had the same range as literal combining characters, which are
 * invisible in most editors, so a stray keystroke inside it would have changed
 * identity matching with nothing to see in the diff.
 */
export function identityKey(person) {
  const p = person || {};
  const name = String((p.lastName || '') + '|' + (p.firstName || ''))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z|]/g, '');
  const dob = String(p.dob || '').slice(0, 10);
  const last4 = String(p.phone || '').replace(/\D/g, '').slice(-4);
  return name + '#' + dob + '#' + last4;
}

/** Name and date of birth, with the phone digits dropped. */
function softOf(key) {
  return String(key).split('#').slice(0, 2).join('#');
}

/**
 * Which spell governs when one person has several.
 *
 * A row marked not eligible for rehire wins, whatever its date. That is the
 * conservative direction and it is the right one: the outcome of a hold is a
 * person looking at the record, so surfacing the flag costs a review and
 * burying it costs a rehire nobody chose to make. Otherwise the most recent
 * separation governs.
 */
function governingSpell(rows) {
  const flagged = rows.filter((r) => r.rehireEligible === false);
  const pool = flagged.length ? flagged : rows;
  return pool.slice().sort((a, b) => (ms(b.separatedOn) || 0) - (ms(a.separatedOn) || 0))[0];
}

/**
 * Look a candidate up against this retailer's own employment records.
 *
 * Two ways to match, and the difference is carried on the result rather than
 * hidden:
 *   exact    name, date of birth and the last four phone digits all agree
 *   partial  name and date of birth agree, the phone number has changed
 *
 * A partial match is a suggestion for a person to confirm, never a fact, and
 * every sentence built from one says so.
 *
 * `atMs` is the instant the reusability questions are answered at. It is on the
 * result, because the previous build stored the match and read `i9.reusable`
 * off it months later with no way to tell when it had been true.
 */
export function matchPriorEmployment(store, ctx, candidate, atMs) {
  if (!candidate) {
    return { matched: false, scope: MATCH_SCOPE, reason: 'No candidate record to match on.' };
  }
  const at = atMs != null ? atMs : ctx.clock.now();
  const key = identityKey(candidate);

  /* THE ONLY READ. It passes ctx.tenantId, and the store throws without one.
     There is no code path in this file that can reach another tenant's rows,
     and adding one would make this a consumer reporting agency under
     15 U.S.C. 1681a(f). */
  const rows = store.all('priorEmployment', ctx.tenantId);

  let hits = rows.filter((r) => r.identityKey === key);
  let confidence = hits.length ? 'exact' : null;

  if (!hits.length) {
    const [namePart, dobPart] = key.split('#');
    /* A blank name or a blank date of birth would soft match everybody else
       who is also blank, so there is nothing to match on and we do not try. */
    if (namePart.replace(/\|/g, '') && dobPart) {
      const soft = rows.filter((r) => softOf(r.identityKey) === softOf(key));
      /* Counted on DISTINCT identity keys, not on rows. Two people who share a
         surname, a forename and a birthday cannot be told apart without the
         phone, and guessing would attach one person's employment history to
         another. One person with two spells is still one person, which a row
         count got wrong. */
      const people = new Set(soft.map((r) => r.identityKey));
      if (people.size === 1) {
        hits = soft;
        confidence = 'partial';
      }
    }
  }

  if (!hits.length) return { matched: false, scope: MATCH_SCOPE };

  const record = governingSpell(hits);

  const i9Executed = ms(record.i9ExecutedOn);
  const i9WindowEnds = i9Executed != null ? addYearsUTC(i9Executed, I9_REHIRE_YEARS) : null;
  const i9Reusable = i9WindowEnds != null && at < i9WindowEnds;

  return {
    matched: true,
    confidence,
    scope: MATCH_SCOPE,
    at,
    spells: hits.length,
    record,
    rehireEligible: record.rehireEligible,
    i9: {
      executedOn: record.i9ExecutedOn || null,
      windowEndsAt: i9WindowEnds,
      reusable: i9Reusable,
      rule: I9_RULE,
      effect: i9Reusable
        ? 'Section 1 can be updated and reverified rather than completed from scratch.'
        : 'Outside the three-year window. A new Form I-9 is required.'
    },
    reusable: reuseMap(record, { i9Reusable, at })
  };
}

/* ------------------------------------------------- what a rehire reuses --- */

export const I9_REHIRE_YEARS = 3;

/* 8 CFR 274a.2(c)(1)(i). Where a person is rehired within three years of the
   date of the INITIAL EXECUTION of their previous Form I-9, the employer may
   either complete a new form or update and reverify the previous one. Three
   years from initial execution, not from separation, and getting that wrong in
   either direction is a paperwork violation. */
export const I9_RULE = '8 CFR 274a.2(c)(1)(i). Three years from the initial execution of the previous ' +
  'form, not from the separation date.';

/* Read on 8 September 2026 in the eCFR full text. The paragraph says the
   previously executed form is sufficient if the individual is hired within
   three years of the date of the initial execution. */
export const I9_RULE_AUTHORITY = 'federal-regulation';
export const I9_RULE_SOURCE = 'verified';

/** The reuse values that mean the onboarding task is already satisfied. */
export const REUSE_DONE = ['carry-forward', 'reactivate'];

/**
 * The two that are never reused, said out loud so nobody assumes otherwise.
 * These rows exist to stop a future optimisation quietly skipping them, and
 * the second one is a policy constraint rather than a legal one, which is
 * stated because the difference decides who can change it.
 */
export const NEVER_REUSED = [
  /* Pinned to the subsection on 8 September 2026. It used to cite "section 2",
     which runs to dozens of pages and is not a citation anybody can check. */
  { key: 'everify', taskKey: T_EVERIFY, name: 'E-Verify case', reuse: 'never',
    why: 'A case is created for each newly hired employee, no later than the third business day after ' +
         'they start work for pay, so a prior case is not reusable.',
    citation: 'E-Verify User Manual M-775, current as of May 2025, section 2.2 Create A Case',
    lawAuthority: 'program-agreement', lawSource: 'verified' },
  { key: 'bgcheck', taskKey: null, name: 'Background check', reuse: 'fresh-order',
    why: 'FCRA sets no shelf life, so a prior report is not unusable. This customer\'s policy says ' +
         'order fresh, and policy is the constraint here, not the law.',
    citation: null, lawAuthority: 'tenant-policy', lawSource: 'unpinned' }
];

/**
 * What genuinely does not have to be done twice, and what does.
 *
 * Every entry carries `taskKey`, the onboarding task it applies to, or null
 * where it applies to no task. Without it `training:FS-101` never matched the
 * task named `training`, so a course marked carry-forward was still created as
 * work to do.
 *
 * `at` is required. The previous build read the wall clock here while the whole
 * product ran on the injected clock, so winding the demo forward could not
 * expire a course. Throwing is right: a silently wrong expiry is worse than a
 * crash on the call that forgot to say when.
 */
export function reuseMap(record, opts) {
  const o = opts || {};
  if (o.at == null) {
    throw new Error('reuseMap needs `at`, the instant it is being computed at. Training expiry depends ' +
                    'on it and reading a wall clock here was a defect in the previous build.');
  }
  const out = [];

  /* Inside the window the previous form is updated and reverified, which is
     still a person examining documents. It is NOT already done, so it is
     deliberately not one of the REUSE_DONE values. */
  if (o.i9Reusable) {
    out.push({ key: 'i9_s1', taskKey: T_I9_S1, name: 'Form I-9, Section 1',
               reuse: 'update-and-reverify',
               why: 'Within three years of the initial execution of the previous form.' });
  }

  ((record && record.training) || []).forEach((t) => {
    const expires = ms(t.expiresOn);
    const stillValid = expires == null || expires > o.at;
    out.push({
      key: 'training:' + t.code,
      taskKey: T_TRAINING,
      name: t.name,
      reuse: stillValid ? 'carry-forward' : 'retake',
      why: stillValid
        ? 'Completed ' + day(t.completedOn) + (t.expiresOn ? ', valid to ' + day(t.expiresOn) : ', no expiry') + '.'
        : 'Expired ' + day(t.expiresOn) + '. Has to be retaken.'
    });
  });

  if (record && record.employeeId) {
    out.push({ key: 'payroll', taskKey: T_PAYROLL, name: 'Payroll record', reuse: 'reactivate',
               why: 'Employee ID ' + record.employeeId + ' already exists in payroll.' });
  }

  /* Copied, so a caller editing an entry cannot edit the shared constant. */
  return out.concat(NEVER_REUSED.map((e) => Object.assign({}, e)));
}

/**
 * Which reuse entry governs one onboarding task.
 *
 * A task can have several entries against it, because a returning worker can
 * have several courses. The conservative one wins: any entry that is not a
 * clean reuse decides, so one expired course cannot be hidden behind three
 * valid ones.
 */
export function reuseForTask(reuse, key) {
  const rows = (reuse || []).filter((r) => r.taskKey === key);
  if (!rows.length) return null;
  return rows.find((r) => REUSE_DONE.indexOf(r.reuse) < 0) || rows[0];
}

/**
 * The question the onboarding fan-out asks: may this task be written straight
 * to done for a returning worker, and what is the sentence explaining it.
 */
export function canSkipTask(reuse, key) {
  const row = reuseForTask(reuse, key);
  if (!row) return { skip: false, why: null, row: null };
  return { skip: REUSE_DONE.indexOf(row.reuse) >= 0, why: row.why, row };
}

/* ------------------------------------ background check scope, and counties --- */

/*
   This scope did not live in the previous build's rules.js. It was inline in
   workflow.js where the check was ordered, which put the one deterministic
   part of a background check inside the module that also does the ordering,
   the polling and the adverse process. It is derived from the candidate's own
   counties with no judgement in it, so it belongs with the rules, and the
   compliance module needs the same list to reason about notices.

   The expected durations are the previous build's demo expectations, carried
   unchanged. They are NOT measured court turnaround. Legal deadlines are all
   published and operating durations are published by nobody, which is exactly
   why the demo has to label its own numbers as its own.

   That label used to live only in this comment, where no screen could read it,
   and a screen showing "18 hours expected" beside a statutory deadline gives
   the two the same weight. Every row below now carries `durationSource`, so a
   surface can say which numbers came from a rule and which came from us. It is
   the same distinction the compliance module draws between law and policy,
   applied to durations instead of to obligations.
*/

/** On every expected duration this file produces. There is no source for these
    numbers and the rows say so rather than implying one. */
export const DEMO_EXPECTATION = 'demo-expectation';

export const DEMO_EXPECTATION_NOTE =
  'An expectation chosen for the demonstration, not a measurement and not a vendor commitment. ' +
  'No public dataset of county court turnaround exists to derive it from.';

/** Mandatory on the national scan, because the scan is the thing people
    mistake for a search. */
export const NATIONAL_DB_NOTE = 'A scan, not a search. There is no national criminal database available ' +
  'to employers, so anything it surfaces has to be confirmed at the county.';

export const NATIONAL_SEARCHES = [
  { key: 'ssn_trace', name: 'SSN trace and address history', venue: 'National', expectedMs: 4 * HOUR,
    durationSource: DEMO_EXPECTATION },
  { key: 'natl_db', name: 'National criminal database scan', venue: 'National', expectedMs: 6 * HOUR,
    durationSource: DEMO_EXPECTATION, note: NATIONAL_DB_NOTE },
  { key: 'sex_offender', name: 'Sex offender registry', venue: 'National', expectedMs: 3 * HOUR,
    durationSource: DEMO_EXPECTATION }
];

/**
 * The band a county search is expected to land in, in hours.
 *
 * UNSOURCED, and the row that carries it says so through `durationSource`.
 * There is no public dataset of county court turnaround to derive it from, so
 * these two numbers are the demo's own expectation carried across from the
 * previous build. The spread inside the band is the connector's to compute.
 */
export const COUNTY_EXPECTED_HOURS = [18, 132];

/**
 * Every search one background check covers: three national, plus one per
 * county on the candidate's record.
 *
 * `expectedMsFor(county)` is optional. The deterministic spread lives in the
 * connector module that owns the hash, so passing it in keeps one copy of that
 * function rather than a second one here. Without it the county rows carry the
 * band instead of a time, and the caller can see it has to fill one in.
 *
 * A candidate with no county still gets one county row. An empty search list
 * would let a check come back clear having searched nothing at all.
 */
export function backgroundSearchScope(candidate, expectedMsFor) {
  const counties = (candidate && candidate.counties && candidate.counties.length)
    ? candidate.counties
    : [{ name: 'Unknown', state: '--' }];

  const national = NATIONAL_SEARCHES.map((s) => Object.assign({}, s));
  const county = counties.map((co, i) => ({
    key: 'county_' + i,
    name: 'County criminal, ' + co.name + ', ' + co.state,
    venue: co.name + ', ' + co.state,
    county: co.name,
    state: co.state,
    expectedMs: typeof expectedMsFor === 'function' ? expectedMsFor(co) : null,
    expectedHours: COUNTY_EXPECTED_HOURS.slice(),
    /* Travels on the row, not in a comment, so a surface cannot render this
       beside a statutory deadline as though the two were the same kind of
       number. There is no legal deadline on a county search at all. */
    durationSource: DEMO_EXPECTATION,
    durationNote: DEMO_EXPECTATION_NOTE,
    statutoryDeadline: null
  }));
  return national.concat(county);
}
