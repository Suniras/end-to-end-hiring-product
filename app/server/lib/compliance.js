/* ============================================================================
   compliance.js  ·  the statutory clocks, the notice sequences, and the bar

   THIS IS THE FILE WHERE A WRONG NUMBER IS A LEGAL EXPOSURE.

   Not one deadline here is a stored value. Each is derived from a date on the
   record plus a rule that carries its own citation, so moving a start date
   moves every clock that depends on it and nothing goes quietly stale.

   Every duration and every citation below was carried across from the module
   this replaces, or taken from the domain specification, or taken from a
   verification round already recorded in the project evidence file. Where a
   rule is real and its section number is not in our records, the row says so
   in `source` rather than showing a number nobody can trace. Where a figure is
   a generalisation across several city ordinances rather than one rule, the row
   says that too.

   That `source` field is new, and it is the reason a page can refuse to render
   something as law when it is not law. The previous build held one flat `law`
   string per clock with no tier beside it, so a vendor manual, a city ordinance
   summary and a federal regulation all looked identical on screen. `source`
   says how well we know the citation. `authority` says what kind of thing the
   rule is, and `isLaw` follows from `authority` and cannot disagree with it.

   SEVEN THINGS THIS FILE FIXES. Each one was a defect in the module it replaces.

   1. The business-day caveat lived in the view layer as a single page-level
      string, remote from the arithmetic it described. Anybody editing a clock
      could leave it behind, and it qualified clocks it did not apply to. It is
      now a field on each clock it actually qualifies, and this file refuses to
      load if the units and the caveats ever disagree.
   2. `clocksFor` returned an empty array whenever the application had no
      `startedAt`, so no clock could exist before the first day of work for pay.
      The candidate-facing disclosure gate needs one that can: the ten business
      days of notice New York City requires run BEFORE an automated screening
      tool is used, not after a start date. Every clock now declares where it
      starts from, and a pre-start clock is an ordinary row in the table.
   3. A waiting period was not distinguished from a deadline. Painting "ten days
      of notice still to run" onto the deadline colour scale turns a lawful and
      healthy wait into an emergency. Each clock declares a polarity and the
      tone follows from that.
   4. `unit` was overwritten with the string 'done' when a clock completed. The
      unit is load bearing, because it is what the caveat qualifies and it is
      the difference between three business days and three calendar days. It now
      always states the real unit and completion is reported by `done`.
   5. The bar was E-Verify only. The workflow engine also refuses an adverse
      move while an FCRA pre-adverse notice is open, so a screen could show no
      bar at all while the product was refusing the move. Both grounds are
      reported now, and kept apart, because the five prohibited actions come
      from E-Verify and FCRA does not enumerate anything.
   6. Six clocks carried `source: 'old-module'`, which means carried across from
      the module this replaces and NOT checked. Employment counsel read the file
      and could not check a single E-Verify duration, because all four cited
      "section 2" of a manual whose section 2 runs to dozens of pages. Every
      citation here has now been read against its own source, the section
      numbers below come from those readings rather than from anybody's memory,
      and `old-module` is gone. The file refuses to load if it comes back.
   7. `allCases` returned one flat list of every application carrying any
      compliance surface at all. Measured on the seeded tenant: 36 rows, 28 of
      them carrying only the notice clock, which nobody owns and nobody can act
      on, against exactly one human-owned clock anywhere in the tenant that is
      not done. A work list where 28 rows in 36 are noise is not a work list.
      Each case now says whether a person has to act and why, and
      `casesNeedingAPerson` returns only the ones where somebody does.

   THE BAR IS NOT A CLOCK. It is a prohibition and it outranks everything else
   in the product. It also names three actions this product cannot intercept,
   because they happen in the retailer's own payroll, scheduling and learning
   systems, which we connect to rather than own. A refusal-only design says
   nothing about those three, so they are exported as their own list and the
   interface has to show them.
   ============================================================================ */

import { DAY, addBusinessDays, fmtDay, fmtDur } from './clock.js';

/* -------------------------------------------------- the verification pass ---
   Read on 8 September 2026. Primary text in every case except the one noted,
   and the section numbers in the rows below come from those readings.

     8 CFR 274a.1 and .2    eCFR full-text API, title 8 part 274a, edition
                            2026-01-01. Paragraphs 274a.2(b)(1)(i)(A),
                            (b)(1)(ii), (b)(2)(i)(A) and (c)(1)(i), plus the
                            definition of "hire" at 274a.1(c).
     E-Verify User Manual   M-775, current as of May 2025, e-verify.gov.
                            Sections 2.2, 3.2, 3.3.1 and 3.3.2.
     NYC Local Law 144      NYC Admin. Code 20-871(b)(1) carries the ten
                            business days. 6 RCNY 5-303(c) and 5-303(e) carry
                            what the notice has to contain, read at
                            rules.cityofnewyork.us.
     FCRA                   15 U.S.C. 1681b(b)(2)(A), (b)(3)(A) and (b)(3)(B).
                            uscode.house.gov refused the connection during the
                            pass, so the statutory text was read at
                            law.cornell.edu. That is a faithful reproduction of
                            the United States Code and it is not the primary
                            publication, which is why the rows say so.
     FTC gap guidance       Advisory opinion to Weisberg, 27 June 1997, on
                            ftc.gov.
     Cal. Gov. Code 12952   Subdivision (a) paragraphs (1) and (2), read at
                            leginfo.legislature.ca.gov.

   WHAT COULD NOT BE PINNED, and is therefore still marked unpinned below. The
   California four year retention of the inputs to an automated decision system.
   The Civil Rights Council's final regulation text is a scanned PDF that would
   not extract and no first-party HTML copy was reachable. So this file does not
   restate that number as law. It reads the date off the consent record, where
   the number already lives, and says where it came from.
   -------------------------------------------------------------------------- */

/* --------------------------------------------------------------- the units ---
   Named constants rather than loose strings, so a mistyped unit fails the
   consistency check at the bottom of the declarations instead of silently
   losing its caveat.
   -------------------------------------------------------------------------- */

export const BUSINESS_DAYS = 'business days';
export const FEDERAL_WORKING_DAYS = 'federal working days';
export const CALENDAR_DAYS = 'calendar days';

/**
 * The caveat that travels with the three federal-working-day clocks.
 *
 * Our arithmetic is Monday to Friday and does not exclude federal holidays.
 * Real E-Verify deadlines run in federal government working days, which do
 * exclude them, so our computed deadline can sit LATER than the real one. That
 * is said out loud on the clock it qualifies, because getting it wrong in a
 * real deployment is a compliance event rather than a rounding error.
 */
export const WORKING_DAY_CAVEAT =
  'Counted Monday to Friday. Federal holidays are not excluded, and real ' +
  'federal government working days do exclude them, so this deadline can be ' +
  'later than the true one. Treat it as the outer bound and act earlier.';

/* ------------------------------------------------------- how well we know it ---
   `source` answers one question and only one: how well do we know the citation
   on this row. It says nothing about whether the rule is real.

   `old-module` used to be a fourth value here, meaning carried across from the
   module this file replaces. It looked like a tier and it was an absence, and
   six rows sat on it while employment counsel read them as checked. It is gone
   and the check below refuses to load the file if it returns.
   -------------------------------------------------------------------------- */

export const SOURCES = {
  verified: 'The source text was read and the reading is recorded in the header of this file.',
  unpinned: 'The rule is real. The section number behind it is not in our records, so none is shown.',
  assumption: 'A generalisation across several separate rules rather than one rule.'
};

/* ------------------------------------------------------- what kind of thing ---
   The second question a reader needs answered, and the one the product has got
   wrong before: is this law, or is it somebody's policy.

   A duration set by a customer and a duration set by Congress render the same
   way on a screen unless the row itself carries the difference. `isLaw` is
   derived from `authority` by the table below and the check refuses any row
   where the two disagree, so a caller can trust one field without reading both.

   `program-agreement` is the awkward one and it is worth its own value. The
   E-Verify deadlines are published in a user manual, which is not law, and they
   bind the employer anyway through the memorandum of understanding it signed to
   join the programme. Calling them law overstates them. Calling them guidance
   understates the consequence.
   -------------------------------------------------------------------------- */

export const AUTHORITIES = {
  'federal-regulation': { isLaw: true,  what: 'A federal regulation. Breach is an enforcement matter.' },
  'state-regulation':   { isLaw: true,  what: 'A state regulation. It binds only where the employer operates in that state.' },
  'city-law':           { isLaw: true,  what: 'A city law. Breach is an enforcement matter in that city.' },
  'program-agreement':  { isLaw: false, what: 'Published in a government programme manual and binding through the agreement the employer signed to join the programme.' },
  'generalisation':     { isLaw: false, what: 'A generalisation across several city and county ordinances. Not one rule, and the ordinance for each location has to be read.' },
  'tenant-policy':      { isLaw: false, what: 'This customer\'s own policy. No statute sets the number.' }
};

/** The one place `isLaw` is decided, so no row can assert it for itself. */
export function isLawFor(authority) {
  const a = AUTHORITIES[authority];
  return a ? a.isLaw : false;
}

/* --------------------------------------------------------- day arithmetic ---
   clock.js exports addBusinessDays and no counting function, and it belongs to
   another part of the build, so the counts live here beside the clocks that use
   them. Behaviour is carried across from the module this replaces: both counts
   are signed, both are taken on UTC midnight boundaries, and both count the
   days strictly after the earlier boundary up to and including the later one.
   -------------------------------------------------------------------------- */

const isWorkday = (d) => { const w = d.getUTCDay(); return w !== 0 && w !== 6; };

export function businessDaysBetween(a, b) {
  let s = new Date(a), e = new Date(b), sign = 1;
  if (e < s) { const t = s; s = e; e = t; sign = -1; }
  s.setUTCHours(0, 0, 0, 0); e.setUTCHours(0, 0, 0, 0);
  let c = 0;
  const x = new Date(s);
  while (x < e) { x.setUTCDate(x.getUTCDate() + 1); if (isWorkday(x)) c++; }
  return c * sign;
}

export function calendarDaysBetween(a, b) {
  const s = new Date(a), e = new Date(b);
  s.setUTCHours(0, 0, 0, 0); e.setUTCHours(0, 0, 0, 0);
  return Math.round((e.getTime() - s.getTime()) / DAY);
}

/**
 * A date with its year on it.
 *
 * clock.js formats a weekday, a day and a month and no year, which is right for
 * a funnel that lives inside one week and wrong for a retention date three
 * years out: 13 August 2029 comes back as "Monday 13 Aug", which a reader takes
 * for a date this month and possibly one already past. Anything that can land
 * in another year is stamped here instead.
 */
function stamp(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * The same instant this many whole calendar years later.
 *
 * Not a multiplication. Three hundred and sixty five days times three
 * undercounts by every leap day in the window, and on a retention floor the
 * breach is deleting EARLY, so an undercount is the dangerous direction.
 */
function addYears(ms, years) {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), d.getUTCDate(),
                  d.getUTCHours(), d.getUTCMinutes(), 0);
}

/**
 * A count with its unit, singular where the count is one.
 *
 * All three units end in "days", so this is a suffix swap rather than a
 * grammar library. It exists because "1 business days" and "-1 federal working
 * days" both used to appear on the compliance screen.
 */
function unitCount(n, unit) {
  return n === 1 ? n + ' ' + String(unit).replace(/days$/, 'day') : n + ' ' + unit;
}

/** Which counter a unit uses. The unit is the authority, never the caller. */
function daysLeft(now, dueAt, unit) {
  return unit === CALENDAR_DAYS ? calendarDaysBetween(now, dueAt)
                                : businessDaysBetween(now, dueAt);
}

function dueFrom(startedAt, days, unit) {
  if (days == null) return null;
  return unit === CALENDAR_DAYS ? startedAt + days * DAY
                                : addBusinessDays(startedAt, days);
}

/**
 * Tone from days remaining. Carried across unchanged, including the thresholds,
 * which are per clock rather than global because one working day left on an
 * I-9 signature is an emergency and three days left on a government review is
 * not.
 */
export function toneFor(left, warn, crit) {
  if (left == null) return 'clock';
  if (left <= crit) return 'crit';
  if (left <= warn) return 'warn';
  return 'clock';
}

/* ------------------------------------------------------------ record reads ---
   Small readers, so a clock declaration says which date it runs from without
   also carrying the shape of the record.
   -------------------------------------------------------------------------- */

/**
 * A finished onboarding task.
 *
 * Both 'done' and 'complete' are in use across this codebase: the onboarding
 * tasks in the module this replaces used 'done', and the engine's pre-shift
 * guard tests for 'complete'. Until one wins, a compliance clock that reads
 * only one of them reports a signed I-9 as outstanding, which is a false breach
 * alarm on the one screen that must never cry wolf.
 */
function taskDone(t) {
  return !!(t && (t.status === 'done' || t.status === 'complete'));
}

function taskDoneAt(store, ctx, app, key) {
  const t = store.first('onboardingTasks', ctx.tenantId,
    (x) => x.applicationId === app.id && x.key === key);
  if (!taskDone(t)) return null;
  return t.doneAt != null ? t.doneAt : t.completedAt != null ? t.completedAt : null;
}

function task(store, ctx, app, key) {
  return store.first('onboardingTasks', ctx.tenantId,
    (x) => x.applicationId === app.id && x.key === key);
}

/**
 * The disclosure the candidate was shown, which is what the New York City
 * notice period runs from. Preference goes to a consent recorded as an input to
 * an automated decision, because that is the one the notice is about. Where the
 * class was not set, the earliest consent on the application is the disclosure
 * gate, since nothing else is shown before the form.
 */
function noticeConsent(store, ctx, app) {
  const rows = store.where('consents', ctx.tenantId, (c) => c.applicationId === app.id);
  if (!rows.length) return null;
  const sorted = rows.slice().sort((a, b) => a.at - b.at);
  return sorted.find((c) => c.dataClass === 'aedt_input') || sorted[0];
}

/**
 * When the automated screening tool actually ran on this application, or null.
 *
 * This is the fact the notice clock is about, and until now nothing read it. A
 * clock that reports how much notice is left, with no idea whether the tool has
 * already run, cannot tell a healthy wait from a breach that cannot be undone.
 *
 * The call screening is the tool. A manager interview is a person and is not.
 *
 * Only a STARTED call counts. A scheduled one has not been used yet, and
 * counting it would report a breach against somebody nothing has happened to.
 */
function toolRanAt(store, ctx, app) {
  const rows = store.where('screenings', ctx.tenantId,
    (s) => s.applicationId === app.id && s.kind === 'call');
  const times = rows.map((s) => s.startedAt).filter((t) => t != null);
  return times.length ? Math.min.apply(null, times) : null;
}

function firstShift(store, ctx, app) {
  const rows = store.where('shifts', ctx.tenantId, (s) => s.applicationId === app.id);
  if (!rows.length) return null;
  return rows.find((s) => s.kind === 'first_shift') ||
         rows.slice().sort((a, b) => a.startsAt - b.startsAt)[0];
}

function backgroundCheck(store, ctx, app) {
  return store.first('backgroundChecks', ctx.tenantId, (c) => c.applicationId === app.id);
}

function openException(store, ctx, app, kind) {
  return store.first('exceptions', ctx.tenantId,
    (e) => e.applicationId === app.id && e.kind === kind && !e.resolvedAt);
}

/* =========================================================================
   THE CLOCKS

   One declarative row per statutory clock. Each row states what starts it, how
   long it runs, in WHICH UNIT, under which citation, what it is waiting on, and
   what happens at breach. Nothing about a clock is written anywhere else.

   `trigger` is a function on the row rather than a name in a registry
   elsewhere. That is deliberate: the whole point of this file is that a rule
   sits next to the date it runs from, and putting the lookup in another table
   is precisely how the two drift apart.

   `polarity` has three values and they are not decoration.

     deadline        something must happen by the due date. Late is a breach.
     waiting-period  something may not happen until the due date. Running is
                     lawful and healthy, and colouring it like a deadline is a
                     lie about the state of the case.
     notice-period   notice was either long enough or it was not. Falling short
                     is not unlawful in the covered cities, it is chargeable, so
                     it reports a premium rather than a breach.

   `owner` and `actor` are two different questions and the file used to answer
   only the first. `owner` says which part of this product has to move: a
   person, the system, or nothing at all. `actor` says which PARTY actually
   does the thing: the employer, the employee, the candidate, a government
   department, or nobody. They come apart on the E-Verify rows, where a person
   here has to chase somebody who does not work here, and a queue built on
   `owner` alone cannot tell that from work of our own.
   ========================================================================= */

export const CLOCKS = [

  /* ---------------------------------------------------------------------- */
  {
    key: 'aedt_notice',
    title: 'Ten business days of notice before an automated screening tool runs',
    polarity: 'waiting-period',
    owner: 'clock',
    actor: 'nobody',
    days: 10,
    unit: BUSINESS_DAYS,
    caveat: null,
    startsFrom: 'the disclosure the candidate was shown and accepted',
    rule: 'No less than ten business days before the tool is used, to each candidate or employee who resides in the city.',
    citation: 'NYC Admin. Code section 20-871(b)(1), added by NYC Local Law 144 of 2021',
    authority: 'city-law',
    source: 'verified',
    /* The old wording here was "the notice must allow a request for an
       alternative selection process or an accommodation", which is a
       paraphrase and it is wrong in the direction that matters. The rules
       require the notice to carry INSTRUCTIONS for making the request, and
       they say in terms that nothing requires the employer to provide an
       alternative. A product that reads the paraphrase builds a right it does
       not have to grant, and skips the instructions it does have to publish. */
    mustInclude: [
      { what: 'Instructions for how to request an alternative selection process or an accommodation.',
        citation: '6 RCNY section 5-303(c)', authority: 'city-law', source: 'verified' },
      /* Cited at the subdivision and not at the paragraph. The code library
         refused the request for the section text, so subdivision (a) is as
         deep as this pass actually read. A paragraph number nobody checked is
         worse than a subdivision that somebody did. */
      { what: 'A summary of the most recent bias audit, published on the employer\'s website before the tool is used.',
        citation: 'NYC Admin. Code section 20-871(a)', authority: 'city-law', source: 'verified' }
    ],
    mustNotImply: '6 RCNY section 5-303(e) says nothing in the subchapter requires an employer to provide an alternative selection process. So the notice owes instructions for asking, and a promise to grant one is a promise the product then has to keep on its own account.',
    waitingOn: 'the notice period itself. Nobody can compress it and nothing the candidate does shortens it.',
    breach: 'Screening inside the ten days is use of an automated employment decision tool without lawful notice. A screening cannot be unrun, so this clock gates the tool rather than reporting on it afterwards.',
    /* Gating, not reporting. This is the one clock the product reads before it
       acts rather than after. */
    gates: 'the automated screening at step 3',
    trigger(store, ctx, app) {
      const c = noticeConsent(store, ctx, app);
      return c ? c.at : null;
    },
    state(store, ctx, app, live) {
      if (live.done) return 'The notice period elapsed ' + fmtDay(live.dueAt) + '. The tool may run.';
      return 'Running. The tool may not be used until ' + fmtDay(live.dueAt) + ', which is ' +
             fmtDur(live.dueAt - live.now) + ' away.';
    }
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'i9_s1',
    title: 'Form I-9, Section 1 completed',
    polarity: 'deadline',
    owner: 'system',
    actor: 'candidate',
    /* Zero is the rule and not a chosen number. "On or before the first day of
       work for pay" makes the first day itself the deadline. */
    days: 0,
    unit: CALENDAR_DAYS,
    caveat: null,
    startsFrom: 'the first day of work for pay',
    rule: 'On or before the first day of work for pay. The regulation says "at the time of hire", and hire is defined at 8 CFR 274a.1(c) as the actual commencement of employment for wages, so the two say the same thing.',
    citation: '8 CFR 274a.2(b)(1)(i)(A)',
    authority: 'federal-regulation',
    source: 'verified',
    waitingOn: 'the candidate, who completes it themselves',
    breach: 'Late the moment the first day of work for pay begins without it. Section 2 cannot be signed until Section 1 exists, so a late Section 1 also eats into the three business days below.',
    warnAt: 1, critAt: 0,
    trigger: (store, ctx, app) => app.startedAt || null,
    completedAt: (store, ctx, app) => taskDoneAt(store, ctx, app, 'i9_s1'),
    state(store, ctx, app, live) {
      const t = task(store, ctx, app, 'i9_s1');
      if (!t) return 'No Form I-9 task exists on this application yet.';
      return live.breached ? 'Outstanding, and the first day of work for pay has begun.'
                           : 'Outstanding. With the candidate.';
    }
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'i9_s2',
    title: 'Form I-9, Section 2 examined and signed',
    polarity: 'deadline',
    owner: 'human',
    actor: 'employer',
    days: 3,
    unit: BUSINESS_DAYS,
    caveat: null,
    startsFrom: 'the first day of work for pay',
    rule: 'Within three business days of the hire. A named person physically examines the documentation and completes section 2.',
    citation: '8 CFR 274a.2(b)(1)(ii)',
    authority: 'federal-regulation',
    source: 'verified',
    waitingOn: 'a named person at the store, who signs under penalty of perjury',
    breach: 'A paperwork violation, and the task does not become optional once it is late. It never auto-completes and no model can sign it, so the only correct behaviour at breach is to escalate to a person and keep escalating.',
    note: 'For hires of fewer than three business days, Section 2 must be completed no later than the first day of employment. Form I-9 instructions, edition 01/20/25, page 1. That case is not detected here because the product does not hold a planned end date.',
    warnAt: 1, critAt: 0,
    trigger: (store, ctx, app) => app.startedAt || null,
    completedAt: (store, ctx, app) => taskDoneAt(store, ctx, app, 'i9_s2'),
    state(store, ctx, app, live) {
      const s1 = taskDoneAt(store, ctx, app, 'i9_s1');
      if (s1 == null) return 'Outstanding, and blocked: Section 1 has not been completed yet.';
      return live.breached ? 'Outstanding and past the third business day.'
                           : 'Outstanding. A person has to examine the documents.';
    }
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'everify_case',
    title: 'E-Verify case created',
    polarity: 'deadline',
    owner: 'system',
    actor: 'employer',
    days: 3,
    unit: BUSINESS_DAYS,
    caveat: null,
    startsFrom: 'the first day of work for pay',
    /* Business days here and federal government working days on the three rows
       below. That is not an inconsistency in this file, it is the manual's own
       wording: section 2.2 says business days and section 3.3 says federal
       government working days. Making them agree would be us overriding the
       source. */
    rule: 'No later than the third business day after the employee starts work for pay.',
    citation: 'E-Verify User Manual M-775, current as of May 2025, section 2.2 Create A Case',
    authority: 'program-agreement',
    source: 'verified',
    waitingOn: 'Form I-9 Section 2, which the case is built from',
    breach: 'A late case is a violation of the E-Verify memorandum of understanding rather than of the I-9 regulation, and it is visible to the government the moment the case is opened, because the case carries the hire date.',
    warnAt: 1, critAt: 0,
    trigger: (store, ctx, app) => app.startedAt || null,
    completedAt: (store, ctx, app) => (app.everify && app.everify.createdAt) || null,
    state(store, ctx, app) {
      const t = task(store, ctx, app, 'everify');
      if (t && t.blockedBy) return 'Waiting on ' + t.blockedBy + '.';
      if (taskDoneAt(store, ctx, app, 'i9_s2') == null) {
        return 'Not yet created. Waiting on Form I-9 Section 2.';
      }
      return 'Not yet created.';
    }
  },

  /* ------------------------------------------------------------------------
     TWO ROWS, NOT ONE, and this was a real defect. There used to be a single
     `tnc_decision` row holding the employer's obligation and the employee's in
     one ten day window, with a sentence explaining that they shared it.

     They do share the window. They are not the same obligation. The employer
     has to notify the employee and refer the case, and missing that is the
     employer's own breach of the programme agreement whatever the employee
     does. The employee has to say whether they will take action, and missing
     that is not the employer's breach at all: it means the employer closes the
     case. One row could not report a met employer obligation beside an unmet
     employee one, and it showed a single owner for two different parties.
     ------------------------------------------------------------------------ */
  {
    key: 'tnc_notify',
    title: 'Notify the employee of the mismatch, and refer the case',
    polarity: 'deadline',
    owner: 'human',
    actor: 'employer',
    days: 10,
    unit: FEDERAL_WORKING_DAYS,
    caveat: WORKING_DAY_CAVEAT,
    startsFrom: 'the moment the mismatch was issued',
    rule: 'The employee must be notified as soon as possible and within 10 federal government working days after E-Verify issued the mismatch. The notice is reviewed with them in private.',
    citation: 'E-Verify User Manual M-775, current as of May 2025, section 3.3.1 Notify Employee Of Mismatch',
    authority: 'program-agreement',
    source: 'verified',
    waitingOn: 'the employer, who has to give the Further Action Notice privately and then refer the case',
    breach: 'The employer\'s own breach of the programme agreement, and it is separate from whatever the employee does. Missing it does not make anything adverse lawful: that stays barred until the case reaches a Final Nonconfirmation.',
    warnAt: 3, critAt: 1,
    trigger: (store, ctx, app) => (app.everify && app.everify.tncIssuedAt) || null,
    /* The referral is the act that closes the employer's half, so it is what
       completion is read from. Where a writer records the notification itself,
       that is preferred, because the notification is the obligation and the
       referral is the step after it. */
    completedAt: (store, ctx, app) => {
      const ev = app.everify || {};
      return ev.notifiedAt != null ? ev.notifiedAt : (ev.referredAt != null ? ev.referredAt : null);
    },
    state: () => 'Outstanding. The employee has to be notified privately and the case referred.'
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'tnc_employee_decision',
    title: 'Employee says whether they will take action on the mismatch',
    polarity: 'deadline',
    /* Owner human because a person here has to chase it, actor employee
       because the person who has to act does not work here. */
    owner: 'human',
    actor: 'employee',
    days: 10,
    unit: FEDERAL_WORKING_DAYS,
    caveat: WORKING_DAY_CAVEAT,
    startsFrom: 'the moment the mismatch was issued',
    rule: 'The employee decides whether to take action. If they have not said by the end of the tenth federal government working day after the mismatch was issued, the employer closes the case.',
    citation: 'E-Verify User Manual M-775, current as of May 2025, section 3.3.2 Confirm Employee Decision',
    authority: 'program-agreement',
    source: 'verified',
    waitingOn: 'the employee, who decides whether to contest the mismatch',
    breach: 'Not the employer\'s breach. The consequence is that the employer closes the case, and nothing adverse becomes lawful before a Final Nonconfirmation.',
    warnAt: 3, critAt: 1,
    trigger: (store, ctx, app) => (app.everify && app.everify.tncIssuedAt) || null,
    completedAt: (store, ctx, app) => (app.everify && app.everify.decisionAt) || null,
    state: () => 'Outstanding. The employee has not said whether they will take action.'
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'employee_resolve',
    title: 'Employee contacts SSA or DHS to resolve',
    polarity: 'deadline',
    owner: 'human',
    actor: 'employee',
    days: 8,
    unit: FEDERAL_WORKING_DAYS,
    caveat: WORKING_DAY_CAVEAT,
    startsFrom: 'the referral',
    rule: 'An employee has eight federal government working days to take action, meaning to visit an SSA field office or contact DHS.',
    citation: 'E-Verify User Manual M-775, current as of May 2025, section 3.3.2 Confirm Employee Decision',
    authority: 'program-agreement',
    source: 'verified',
    /* Eight is a default, not a constant, so the row is overridable and a real
       deployment must be able to set it per case.

       The reason used to be stated as fact: that E-Verify publishes an
       extension for some mismatch types. Section 3.3.2 states the eight days
       and the verification pass on 8 September 2026 did not find the extension
       anywhere in it, so the claim is recorded as unverified rather than
       repeated. The overridability stands on its own: a window carried across
       from a manual that is revised, against a case type this product does not
       classify, is not a number to hardcode. */
    overridable: true,
    overrideNote: 'Unverified: the previous version of this row said E-Verify publishes a longer window for some mismatch types. Section 3.3.2 was read and does not say so. Treat eight as the published default and confirm the case type before relying on it.',
    waitingOn: 'the employee, who has to visit an SSA field office or telephone DHS',
    breach: 'Not the employer\'s breach. The consequence lands on the employee, and it still does not licence any adverse action before a Final Nonconfirmation.',
    warnAt: 4, critAt: 2,
    trigger: (store, ctx, app) => (app.everify && app.everify.referredAt) || null,
    /* Completion is read from an explicit contact timestamp and never inferred
       from the case status. Case in Continuance is supposed to mean the employee
       has been in touch, but the seeded mismatch carries that status while the
       SSA appointment is still in the future, so inferring from status would
       report a resolved clock for somebody who has not been yet. */
    completedAt: (store, ctx, app) => (app.everify && app.everify.contactedAt) || null,
    state(store, ctx, app) {
      const ev = app.everify || {};
      return 'Referred ' + fmtDay(ev.referredAt) + '. ' + (ev.appointment || '');
    }
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'gov_update',
    title: 'DHS and SSA update the case result',
    polarity: 'deadline',
    owner: 'clock',
    actor: 'government',
    days: 10,
    unit: FEDERAL_WORKING_DAYS,
    caveat: WORKING_DAY_CAVEAT,
    startsFrom: 'the referral',
    rule: 'DHS and SSA have 10 federal government working days from the date the case was referred to update the case result in E-Verify.',
    citation: 'E-Verify User Manual M-775, current as of May 2025, section 3.3.2 Confirm Employee Decision',
    authority: 'program-agreement',
    source: 'verified',
    waitingOn: 'a government department, which is nobody in this product',
    breach: 'Nothing anyone here can do. This is the government\'s own window and it cannot be escalated.',
    /* Carried across and NOT verified in the 8 September pass. It is the reason
       the connector polls instead of waiting, so it is worth keeping visible,
       and it is worth being honest that section 3.3.2 was read for the ten days
       and not for this. */
    note: 'The product polls this rather than waiting to be told, on the carried-across understanding that E-Verify publishes no notification when a case result changes. That understanding is unverified. Confirm it against the programme documentation before a real deployment depends on the polling interval.',
    warnAt: 3, critAt: 1,
    trigger: (store, ctx, app) => (app.everify && app.everify.referredAt) || null,
    completedAt: (store, ctx, app) => (app.everify && app.everify.resolvedAt) || null,
    state(store, ctx, app, live) {
      const ev = app.everify || {};
      return 'Last polled ' + fmtDay(ev.lastPolledAt != null ? ev.lastPolledAt : live.now) +
             '. Still ' + (ev.status || 'unknown') + '. ' + (ev.note || '');
    }
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'fair_workweek',
    title: 'Advance notice before the first shift',
    polarity: 'notice-period',
    owner: 'clock',
    actor: 'nobody',
    authority: 'generalisation',
    days: 14,
    unit: CALENDAR_DAYS,
    caveat: null,
    startsFrom: 'the moment the shift was written to the schedule',
    rule: 'Around fourteen days of advance schedule notice in covered cities, with a premium payable to change a schedule inside that window. A first shift is not ours to place freely.',
    /* No citation, deliberately. There is no single rule here. Oregon has the
       only statewide law and the rest are city and county ordinances whose
       notice periods differ, and the list we hold came from vendor compliance
       material rather than primary law text. Naming a citation would make a
       generalisation look like a statute. */
    citation: null,
    source: 'assumption',
    sourceNote: 'A generalisation across covered cities, not one rule. Oregon is the only statewide predictive scheduling law. The city and county list we hold came from vendor compliance material rather than primary text, so the ordinance for each store location has to be read before this figure is relied on.',
    waitingOn: 'nobody. The notice was either long enough or it was not.',
    breach: 'Not a breach. Inside the window the change is permitted and a premium becomes payable, so this reports a cost rather than a violation. It becomes a violation only where an ordinance forbids the change outright, which is why the ordinance per location has to be named.',
    trigger(store, ctx, app) {
      const sh = firstShift(store, ctx, app);
      if (!sh || sh.startsAt == null) return null;
      /* Notice ran from the moment the shift was written. Where the writer
         recorded that instant, use it. Otherwise reconstruct it from the notice
         days the shift row carries, which is what the scheduling connector
         computed at write time. */
      if (sh.noticeAt != null) return sh.noticeAt;
      if (typeof sh.noticeDays === 'number') return sh.startsAt - sh.noticeDays * DAY;
      return null;
    },
    state(store, ctx, app, live) {
      const sh = firstShift(store, ctx, app);
      const given = live.given;
      if (live.satisfied) {
        return 'Notice of ' + given + ' days given for a shift on ' + fmtDay(sh.startsAt) +
               '. The advance notice requirement is satisfied.';
      }
      return 'Only ' + given + ' days of notice for a shift on ' + fmtDay(sh.startsAt) +
             '. Inside the window, so a premium is payable in a covered city.';
    }
  },

  /* ---------------------------------------------------------------------- */
  {
    key: 'i9_retention',
    title: 'Form I-9 retained for the full period',
    polarity: 'waiting-period',
    owner: 'system',
    actor: 'employer',
    /* Two numbers and a maximum, so this row computes its own due date rather
       than declaring a single duration. */
    days: null,
    unit: CALENDAR_DAYS,
    caveat: null,
    startsFrom: 'the hire date, and the separation date where there is one',
    rule: 'Three years after the date of the hire, or one year after the date the individual\'s employment is terminated, whichever is later.',
    /* PINNED on 8 September 2026. This row used to carry citation null and a
       note saying the section had not been found, which was true and was also
       a gap on the one screen a customer's counsel reads first. The section was
       read in the eCFR full text: 274a.2(b)(2)(i)(A) carries the retention
       period for an employer, in the words above. */
    citation: '8 CFR 274a.2(b)(2)(i)(A)',
    authority: 'federal-regulation',
    source: 'verified',
    waitingOn: 'nothing. It is a floor on deletion rather than a task.',
    breach: 'Deleting early is the breach, not keeping too long. Nothing in this build deletes an I-9, so the risk today is the opposite one: retaining past the period with no deletion path.',
    /* Declared and not driven. Saying so on the row is the only way the gap is
       visible rather than absent. */
    implemented: false,
    /* The only clock here whose due date lands in another year. The house day
       formatter carries no year, so a surface that formats this one the way it
       formats the others prints a 2029 date as a day in August and the reader
       takes it for last week. The flag tells the surface to show the year. */
    spansYears: true,
    trigger: (store, ctx, app) => app.startedAt || null,
    due(store, ctx, app, startedAt) {
      const hirePlusThree = addYears(startedAt, 3);
      const ended = app.closedAt || app.terminatedAt || null;
      if (ended == null) return hirePlusThree;
      return Math.max(hirePlusThree, addYears(ended, 1));
    },
    state(store, ctx, app, live) {
      const ended = app.closedAt || app.terminatedAt || null;
      const which = ended != null && addYears(ended, 1) > addYears(live.startedAt, 3)
        ? 'one year after employment ended'
        : 'three years after the hire date';
      return 'Retain until ' + stamp(live.dueAt) + ', which is ' + which +
             '. No deletion path is wired yet, so this is a declared obligation and not a driven one.';
    }
  }
];

/* ------------------------------------------------- the consistency checks ---
   The defect this replaces was a caveat that lived away from the clocks it
   qualified, where it could drift. Now it cannot: the file will not load if the
   set of clocks counted in federal working days is not exactly the set carrying
   the caveat. A loud failure at import beats a quiet mismatch on a screen.

   The second check is new and it is there because six rows shipped tagged
   `old-module`, which reads as a tier and means nobody looked. A row now has to
   declare which kind of thing its rule is, and a row claiming to be law has to
   carry the citation for it. Neither of those can be forgotten quietly.
   -------------------------------------------------------------------------- */

(function checkEveryRowSaysWhatItIs() {
  const bad = [];
  const ACTORS = ['employer', 'employee', 'candidate', 'government', 'nobody'];
  CLOCKS.forEach((c) => {
    if (!AUTHORITIES[c.authority]) {
      bad.push(c.key + ': authority "' + c.authority + '" is not one of ' +
               Object.keys(AUTHORITIES).join(', '));
    }
    if (!SOURCES[c.source]) {
      bad.push(c.key + ': source "' + c.source + '" is not one of ' + Object.keys(SOURCES).join(', ') +
               '. "old-module" was removed on purpose: it meant carried across and not checked, ' +
               'and it read on screen as a tier.');
    }
    if (ACTORS.indexOf(c.actor) < 0) {
      bad.push(c.key + ': actor "' + c.actor + '" is not one of ' + ACTORS.join(', ') +
               '. A clock has to say which party acts, because owner only says which part of ' +
               'this product has to move.');
    }
    /* The failure this catches: a row that says it is law and shows nothing a
       reader could check. That is the shape counsel objected to. */
    if (isLawFor(c.authority) && !c.citation) {
      bad.push(c.key + ': authority "' + c.authority + '" is law and the row carries no citation.');
    }
    if (c.source === 'verified' && !c.citation && isLawFor(c.authority)) {
      bad.push(c.key + ': marked verified with no citation to have verified.');
    }
  });
  if (bad.length) {
    throw new Error('a compliance clock does not say what kind of rule it is:\n  ' + bad.join('\n  '));
  }
})();

(function checkCaveatsTravelWithUnits() {
  const working = CLOCKS.filter((c) => c.unit === FEDERAL_WORKING_DAYS).map((c) => c.key);
  const caveated = CLOCKS.filter((c) => !!c.caveat).map((c) => c.key);
  const same = working.length === caveated.length && working.every((k) => caveated.indexOf(k) >= 0);
  if (!same) {
    throw new Error(
      'the federal working day caveat has drifted from the clocks it qualifies. ' +
      'Counted in federal working days: ' + working.join(', ') + '. ' +
      'Carrying the caveat: ' + caveated.join(', ') + '. ' +
      'These must be the same set, because the caveat is about federal holidays ' +
      'and only those clocks are counted in federal government working days.'
    );
  }
})();

/* =========================================================================
   THE LIVE CLOCKS
   ========================================================================= */

/**
 * Every live compliance clock on one application.
 *
 * A clock appears when its trigger date exists on the record and not before, so
 * the tentative nonconfirmation clocks arrive as the case advances without a
 * chain of early returns deciding it. A clock that starts at consent shows up
 * before the first day of work for pay, which the module this replaces could
 * not express at all.
 */
export function clocksFor(store, ctx, application) {
  if (!application) return [];
  const now = ctx.clock.now();
  const out = [];
  for (const c of CLOCKS) {
    const startedAt = c.trigger(store, ctx, application);
    if (startedAt == null) continue;
    out.push(liveClock(store, ctx, application, c, startedAt, now));
  }
  return out;
}

function liveClock(store, ctx, app, c, startedAt, now) {
  const dueAt = c.due ? c.due(store, ctx, app, startedAt) : dueFrom(startedAt, c.days, c.unit);

  const live = {
    key: c.key,
    title: c.title,
    polarity: c.polarity,
    owner: c.owner,
    /* Which party acts, beside which part of the product has to move. A caller
       ranking work by owner alone cannot tell chasing an employee at the SSA
       from signing a form in the back office. */
    actor: c.actor,
    rule: c.rule,
    citation: c.citation || null,
    /* Both halves of the provenance travel with every clock. `authority` is the
       kind of rule, `isLaw` is derived from it in one place, and `source` is how
       well we know the citation. A surface can then refuse to render a policy
       number as law without having to know anything about this file. */
    authority: c.authority,
    isLaw: isLawFor(c.authority),
    authorityNote: AUTHORITIES[c.authority] ? AUTHORITIES[c.authority].what : null,
    source: c.source,
    sourceNote: c.sourceNote || null,
    mustInclude: c.mustInclude || null,
    mustNotImply: c.mustNotImply || null,
    overrideNote: c.overrideNote || null,
    /* The unit always states the real unit, even when the clock is finished.
       The old build wrote 'done' into this field, which took the unit away from
       the caveat that qualifies it. */
    unit: c.unit,
    days: c.days,
    caveat: c.caveat || null,
    startsFrom: c.startsFrom,
    startedAt,
    dueAt,
    waitingOn: c.waitingOn,
    breach: c.breach,
    note: c.note || null,
    overridable: !!c.overridable,
    implemented: c.implemented !== false,
    spansYears: !!c.spansYears,
    gates: c.gates || null,
    now
  };

  if (c.polarity === 'notice-period') {
    /* Notice is measured against the shift, not against the present. Days
       remaining would answer a question nobody asked. */
    const sh = firstShift(store, ctx, app);
    const given = sh ? calendarDaysBetween(startedAt, sh.startsAt) : null;
    live.given = given;
    live.required = c.days;
    live.satisfied = given != null && given >= c.days;
    live.premiumPayable = given != null && given < c.days;
    live.done = !!live.satisfied;
    live.left = given != null ? given - c.days : null;
    live.leftLabel = given != null ? given + ' of ' + c.days + ' ' + c.unit + ' given' : null;
    live.leftMs = null;
    live.breached = false;
    live.tone = live.satisfied ? 'good' : 'warn';
    live.completedAt = null;
    live.state = c.state ? c.state(store, ctx, app, live) : null;
    return live;
  }

  if (c.polarity === 'waiting-period') {
    /* A running wait is lawful and healthy. It gets the neutral tone, never the
       deadline scale, and it turns good when it elapses rather than urgent as
       it approaches. */
    const elapsed = now >= dueAt;
    live.done = elapsed;
    live.elapsed = elapsed;
    live.left = elapsed ? 0 : daysLeft(now, dueAt, c.unit);
    live.leftLabel = elapsed ? 'elapsed' : unitCount(live.left, c.unit);
    live.leftMs = Math.max(0, dueAt - now);
    live.breached = false;
    live.tone = elapsed ? 'good' : 'clock';
    live.completedAt = elapsed ? dueAt : null;
    live.state = c.state ? c.state(store, ctx, app, live) : null;
    return live;
  }

  const completedAt = c.completedAt ? c.completedAt(store, ctx, app) : null;
  if (completedAt != null) {
    live.done = true;
    live.left = 0;
    live.leftLabel = 'done';
    live.leftMs = 0;
    live.breached = false;
    live.tone = 'good';
    live.completedAt = completedAt;
    live.state = 'Completed ' + fmtDay(completedAt) + '.';
    return live;
  }

  const left = daysLeft(now, dueAt, c.unit);
  live.done = false;
  live.left = left;
  /* A past deadline used to render as "-1 federal working days", which is the
     numeric truth and is not a sentence anybody should read aloud on a
     compliance screen. `left` stays signed for arithmetic and the label says
     overdue. Winding the demo clock past a deadline is how this was found. */
  live.leftLabel = left < 0 ? 'overdue by ' + unitCount(-left, c.unit)
                            : unitCount(left, c.unit);
  live.leftMs = dueAt - now;
  live.breached = now > dueAt;
  live.tone = toneFor(left, c.warnAt, c.critAt);
  live.completedAt = null;
  live.state = c.state ? c.state(store, ctx, app, live)
                       : (live.breached ? 'Overdue since ' + fmtDay(dueAt) + '.'
                                        : 'Outstanding. Due ' + fmtDay(dueAt) + '.');
  return live;
}

/**
 * May an automated screening tool run on this application yet.
 *
 * The candidate-facing disclosure gate needs an answer before it acts, not a
 * report afterwards, because a screening cannot be unrun. This is the same
 * clock the compliance screen shows, read as a gate.
 */
export function noticeGate(store, ctx, application) {
  const decl = CLOCKS.find((c) => c.key === 'aedt_notice');
  const startedAt = decl.trigger(store, ctx, application);
  const ranAt = application ? toolRanAt(store, ctx, application) : null;
  if (startedAt == null) {
    return {
      ok: false, clock: null, usedAt: ranAt, usedInsideNotice: ranAt != null,
      reason: 'No disclosure has been recorded for this application, so the ten business days of notice have not started.',
      breach: ranAt != null
        ? 'The tool has already run and no notice is recorded at all. That cannot be undone.'
        : null
    };
  }
  const clock = liveClock(store, ctx, application, decl, startedAt, ctx.clock.now());

  /* THE FACT THE GATE EXISTED TO CATCH, and it was not being reported. A gate
     that only answers "may it run" cannot say whether it already did. Measured
     on the seeded tenant on 8 September 2026: the tool had run on 30
     applications and all 30 ran inside the notice period. Reporting that is the
     difference between a compliance surface and a decoration. */
  const usedInsideNotice = ranAt != null && ranAt < clock.dueAt;

  return {
    ok: clock.done,
    clock,
    usedAt: ranAt,
    usedInsideNotice,
    reason: clock.done ? null
      : 'The ten business days of notice run until ' + fmtDay(clock.dueAt) + '. ' + decl.rule + ' ' + decl.citation + '.',
    breach: usedInsideNotice
      ? 'The tool ran ' + fmtDay(ranAt) + ', inside the notice period that runs until ' + fmtDay(clock.dueAt) +
        '. ' + decl.breach
      : null
  };
}

/**
 * The notice clock as it WOULD run for somebody who has not applied yet.
 *
 * The disclosure gate is shown before any application or consent exists, so
 * there is nothing for `noticeGate` to read and no clock to report. The gate
 * still has to say how long the period is and when it would end, and the route
 * serving it was hand-rolling an object with its own field names: `label`,
 * `required`, `startsAt`, `elapsedWorkingDays`, `satisfied`. Nothing that
 * renders a clock reads any of those, so the number arrived and could not be
 * drawn.
 *
 * This returns the same shape every other clock in the product has, from the
 * same declaration, so there is one clock shape and not two. It is a projection
 * and it says so: `projected` is true and `startedAt` is the instant asked
 * about rather than a recorded consent.
 */
export function projectedNoticeClock(now) {
  const decl = CLOCKS.find((c) => c.key === 'aedt_notice');

  /* Built by the ordinary clock builder with no records behind it, rather than
     assembled field by field here. A second hand-written copy of the shape is
     exactly the defect this function exists to remove, so it must not create
     one. That is only safe while this row reads nothing off the store, so the
     conditions are checked rather than assumed. */
  if (decl.due || decl.completedAt || decl.polarity !== 'waiting-period') {
    throw new Error('the notice clock declaration now reads records, so it can no longer be projected ' +
                    'without them. Give projectedNoticeClock a store and a context, or drop it.');
  }
  const clock = liveClock(null, null, null, decl, now, now);
  clock.projected = true;
  clock.startedAtIsProjected = true;
  clock.state = 'Not started. It would run from the moment the disclosure is accepted until ' +
                fmtDay(clock.dueAt) + '.';
  return clock;
}

/**
 * The notice gate across the whole tenant, which is the number counsel asks for
 * first: how many people are inside the notice period, and how many of those
 * have already been screened anyway.
 *
 * It is a rollup and not a page. It exists here because the arithmetic belongs
 * with the clock, and because a surface computing it for itself would be a
 * second copy of the one number in this product whose breach cannot be undone.
 */
export function noticeGateSummary(store, ctx) {
  const apps = store.all('applications', ctx.tenantId);
  const out = {
    applications: apps.length,
    noNoticeRecorded: 0,
    running: 0,
    elapsed: 0,
    toolRan: 0,
    ranInsideNotice: 0,
    ranInsideNoticeIds: [],
    rule: CLOCKS.find((c) => c.key === 'aedt_notice').rule,
    citation: CLOCKS.find((c) => c.key === 'aedt_notice').citation,
    authority: 'city-law',
    isLaw: true
  };
  apps.forEach((a) => {
    const g = noticeGate(store, ctx, a);
    if (!g.clock) out.noNoticeRecorded++;
    else if (g.clock.done) out.elapsed++;
    else out.running++;
    if (g.usedAt != null) out.toolRan++;
    if (g.usedInsideNotice) { out.ranInsideNotice++; out.ranInsideNoticeIds.push(a.id); }
  });
  out.state = out.ranInsideNotice === 0
    ? 'No application has been screened inside its notice period.'
    : out.ranInsideNotice + ' of ' + out.toolRan + ' screenings ran inside the ten business days of notice. ' +
      'A screening cannot be unrun, so these are not recoverable by acting now.';
  return out;
}

/* =========================================================================
   THE FCRA NOTICE SEQUENCE

   Two separate rules and they are constantly confused with each other. One
   governs the document the candidate signs before the report is pulled. The
   other governs what has to happen before anything adverse is done with it.
   ========================================================================= */

/** The standalone disclosure, at the point the check is authorised. */
export const FCRA_DISCLOSURE = {
  citation: 'FCRA 15 U.S.C. 1681b(b)(2)(A)',
  authority: 'federal-regulation',
  source: 'verified',
  isLaw: true,
  /* Read on 8 September 2026. The statute's own words are "a clear and
     conspicuous disclosure has been made in writing to the consumer at any time
     before the report is procured or caused to be procured, in a document that
     consists solely of the disclosure". Both halves of the timing line below
     come straight out of that: at any time before, and solely. */
  rule: 'The disclosure must be clear and conspicuous, in writing, made at any time before the report is procured, and in a document that consists solely of the disclosure.',
  consequence: 'Two documents and not one page: the disclosure, and separately the written authorisation. It cannot share a page or a signature with an application, an at-will acknowledgement or a liability release.',
  /* Worth stating on the record, because the belief that FCRA forces the check
     to sit after acceptance is common and wrong, and it costs days on the
     critical path. What forces the ordering is fair-chance law, not FCRA. */
  /* Read 8 September 2026. Paragraph (a)(1) is the question on the application
     form. Paragraph (a)(2) is the wider one: to inquire into OR CONSIDER
     conviction history at all until after a conditional offer. Running the
     check is inquiring, so (a)(2) and not (a)(1) is what moves the check down
     the funnel in California. */
  timing: 'At any time before the report is procured. Federal consumer report law imposes no offer-relative restriction at all. The rule that puts the check after a conditional offer is state and city fair-chance law: California Gov. Code 12952(a)(2) bars inquiring into or considering conviction history until after a conditional offer, which reaches the conduct of the check itself and not only the question on the form.',
  timingCitation: 'California Gov. Code 12952(a)(2)',
  timingSource: 'verified'
};

/**
 * The gap between the pre-adverse notice and the adverse action.
 *
 * THE STATUTE SETS NO NUMBER. It requires a reasonable period. So the number is
 * tenant policy, it is labelled tenant policy everywhere it appears, and
 * nothing in this product may present it as law.
 *
 * The module this replaces held no number at all, which meant the gap could not
 * be measured and the bar had nothing to lift on. Five business days comes from
 * the only official figure that exists, an FTC staff advisory, and it is
 * carried here as the product default that a customer overrides with its own
 * policy.
 */
export const FCRA_GAP = {
  days: 5,
  unit: BUSINESS_DAYS,
  basis: 'tenant-policy',
  authority: 'tenant-policy',
  isLaw: false,
  statute: 'FCRA 15 U.S.C. 1681b(b)(3)(A) sets no number. It requires a copy of the report and the written summary of rights before the adverse action, and names no period at all.',
  statuteCitation: 'FCRA 15 U.S.C. 1681b(b)(3)(A)',
  citation: 'FTC Advisory Opinion to Weisberg, 27 June 1997',
  source: 'verified',
  /* Read on 8 September 2026, and worth quoting exactly, because the shape of
     the letter is the whole point. The FTC did not set five days. Somebody
     asked whether five business days would do and staff said it appeared
     reasonable while saying the section is silent.

     Note which half is ours. "Business" days came from the request the letter
     blessed, not from the letter's own conclusion, which says "the five day
     period". So even the unit on this number is inherited from a proposal. */
  why: 'The letter says the section "is silent" on the period, records that the requester "suggest[ed] a period of five business days from the date of the notice", and concludes that "although the facts of any particular employment situation may require a different time, the five day period that you proposed appears reasonable". That is staff guidance about what is reasonable, not a deadline, so five business days is held as the product default and labelled as policy everywhere it appears.',
  /* A real trap. The three-day count does appear in the statute, and it is not
     this rule. Anybody reading the section quickly will find it and use it. */
  doNotUse: 'The three business day count that appears in the statute belongs solely to the transportation carve-out at 15 U.S.C. 1681b(b)(3)(B), which reaches positions regulated by the Secretary of Transportation where every dealing with the applicant was remote. It is not a general FCRA gap and must never be used as one.'
};

/**
 * The gap in force for this customer. Returns the same shape whether it came
 * from the customer or from the product default, with `isDefault` and `setBy`
 * saying which, so an interface can always tell the reader whether the number
 * on screen is theirs.
 */
export function fcraGap(store, ctx) {
  const tenant = store.all('tenants', ctx.tenantId)[0] || null;
  const set = tenant && tenant.policy ? tenant.policy.fcraGapDays : null;
  if (typeof set === 'number' && set > 0) {
    return Object.assign({}, FCRA_GAP, {
      days: set,
      isDefault: false,
      setBy: ctx.tenantName || 'this customer',
      why: 'Set by ' + (ctx.tenantName || 'this customer') + ' as its own policy. The statute still sets no number, so this remains policy and not law.'
    });
  }
  return Object.assign({}, FCRA_GAP, { isDefault: true, setBy: 'product default' });
}

/**
 * The three steps, in order. `basis` is the field that lets an interface say
 * which step is law and which is policy, which is the whole point: a reader who
 * cannot tell the difference will defend the wrong one.
 */
export const FCRA_SEQUENCE = [
  { n: 1, key: 'pre_adverse', owner: 'human', basis: 'statute',
    authority: 'federal-regulation', isLaw: true, source: 'verified',
    name: 'Pre-adverse notice, with a copy of the report and the summary of rights',
    citation: 'FCRA 15 U.S.C. 1681b(b)(3)(A)', automated: false },
  /* The one step in the sequence that is not law, sitting between two that are.
     It carries isLaw false on the row itself so a renderer walking the three
     steps cannot paint them the same. */
  { n: 2, key: 'gap', owner: 'clock', basis: 'tenant-policy',
    authority: 'tenant-policy', isLaw: false, source: 'verified',
    name: 'A gap for the person to respond',
    citation: null, automated: false,
    note: 'No number of days in the statute. Whatever is reasonable, and it cannot be collapsed.' },
  /* Citation deliberately null. The pre-adverse duty at 1681b(b)(3)(A) was read
     on 8 September 2026 and it governs step 1. The duty to give the adverse
     action notice itself sits in a different section which that pass did not
     read, and the row this replaces printed 1681b(b)(3) for both steps, which
     is the wrong section for this one. An empty citation a reader can see is
     better than a confident one nobody checked. */
  { n: 3, key: 'adverse', owner: 'human', basis: 'statute',
    authority: 'federal-regulation', isLaw: true, source: 'unpinned',
    name: 'Adverse action notice',
    citation: null, automated: false,
    sourceNote: 'The obligation is real and its section is not in our records. It is not 1681b(b)(3)(A), which is the pre-adverse step above. Pin it before a customer reads this row.' }
];

/**
 * The live notice sequence for one application, or null when no check has come
 * back with anything on it.
 *
 * `automated: false` is a field and not a comment. Nothing adverse happens by
 * itself here and no notice leaves the building without a person sending it.
 */
export function fcraSequence(store, ctx, application) {
  const chk = backgroundCheck(store, ctx, application);
  if (!chk || !chk.adverseProcess) return null;
  const ap = chk.adverseProcess;
  const gap = fcraGap(store, ctx);
  const now = ctx.clock.now();

  /* Written by whoever sends the notice. Until it exists the gap has not
     started, and the adverse action cannot be taken for that reason alone. */
  const sentAt = ap.preAdverseSentAt != null ? ap.preAdverseSentAt : null;
  const gapEndsAt = sentAt != null ? addBusinessDays(sentAt, gap.days) : null;
  const gapElapsed = gapEndsAt != null && now >= gapEndsAt;

  const steps = FCRA_SEQUENCE.map((s) => {
    if (s.key === 'pre_adverse') {
      return Object.assign({}, s, { done: sentAt != null, at: sentAt,
        state: sentAt != null ? 'Sent ' + fmtDay(sentAt) + '.' : 'Not sent. A person has to send it.' });
    }
    if (s.key === 'gap') {
      return Object.assign({}, s, {
        done: gapElapsed, at: gapEndsAt,
        days: gap.days, unit: gap.unit, isLaw: false, setBy: gap.setBy, isDefault: gap.isDefault,
        state: sentAt == null ? 'Not started. The pre-adverse notice has not been sent.'
             : gapElapsed ? 'Elapsed ' + fmtDay(gapEndsAt) + '.'
             : 'Running until ' + fmtDay(gapEndsAt) + ', which is ' + fmtDur(gapEndsAt - now) + ' away.'
      });
    }
    return Object.assign({}, s, {
      done: ap.adverseSentAt != null, at: ap.adverseSentAt || null,
      state: ap.adverseSentAt != null ? 'Sent ' + fmtDay(ap.adverseSentAt) + '.'
           : gapElapsed ? 'Available. A person has to decide and send it.'
           : 'Not available yet.'
    });
  });

  return {
    checkId: chk.id,
    stage: ap.stage || null,
    rule: ap.rule ||
      'FCRA 15 U.S.C. 1681b(b)(3). Pre-adverse notice with a copy of the report and the summary of rights, a reasonable gap, then the adverse notice.',
    owner: ap.owner || 'human',
    automated: false,
    searches: (chk.searches || []).filter((s) => s.result === 'record_found').map((s) => s.name || s.kind),
    gap,
    gapEndsAt,
    gapElapsed,
    /* The one boolean a caller actually wants, with the reason attached, so a
       surface never has to reassemble the rule from three fields. */
    mayTakeAdverseAction: sentAt != null && gapElapsed,
    whyNot: sentAt == null
      ? 'The pre-adverse notice has not been sent, so the person has had no chance to dispute the report.'
      : gapElapsed ? null
      : 'The pre-adverse notice was sent ' + fmtDay(sentAt) + ' and the gap runs until ' + fmtDay(gapEndsAt) +
        '. The statute sets no number, so this gap is ' + gap.setBy + ' policy of ' + gap.days + ' ' + gap.unit + '.',
    steps
  };
}

/* =========================================================================
   THE ADVERSE ACTION BAR

   Not a clock. A prohibition, and it outranks everything else in the product.
   ========================================================================= */

/**
 * The five things that may not happen to somebody contesting an E-Verify
 * mismatch, and which of them this product can actually stop.
 *
 * Two of five. The other three happen in the retailer's payroll, scheduling and
 * learning systems, which we connect to rather than own, so no refusal here
 * reaches them. That is why the bar has to be VISIBLE before anybody acts
 * rather than only refused when they try: a design that only refuses says
 * nothing at all about the majority of the barred actions.
 */
export const PROHIBITED_ACTIONS = [
  { key: 'termination', name: 'Termination', guarded: true,
    guardedBy: 'the workflow engine, which refuses a move to REJECTED or TERMINATED while the bar is up',
    happensIn: 'this product' },

  { key: 'suspension', name: 'Suspension', guarded: false,
    guardedBy: null,
    happensIn: 'the retailer\'s workforce management system',
    whyNot: 'A suspension is entered where the rota is owned. We can see the shift pattern change afterwards and we can warn, but we cannot refuse it.' },

  { key: 'pay', name: 'Withholding or lowering pay', guarded: false,
    guardedBy: null,
    happensIn: 'the retailer\'s payroll system',
    whyNot: 'Pay is changed in payroll, which is the system of record. We are a connector layer and we do not hold the pay rate.' },

  { key: 'training', name: 'Delaying training', guarded: false,
    guardedBy: null,
    happensIn: 'the retailer\'s learning management system',
    whyNot: 'Training is assigned through the learning system. An assignment quietly not made leaves no event for us to refuse.' },

  { key: 'shift_removal', name: 'Removing scheduled shifts', guarded: true,
    guardedBy: 'the shift removal check, which the scheduling action and the remove_shift tool both call',
    happensIn: 'this product, for shifts this product wrote',
    note: 'Holding back a first shift counts. This is the quiet version of the violation: a manager who does not understand a mismatch simply stops scheduling the person.' }
];

export const GUARDED_ACTIONS = PROHIBITED_ACTIONS.filter((a) => a.guarded);
export const UNGUARDED_ACTIONS = PROHIBITED_ACTIONS.filter((a) => !a.guarded);

/**
 * The manual's own words, quoted because the list above is not a quotation.
 *
 * THE FIVE ARE OURS AND THE SENTENCE IS THEIRS. The manual bars adverse action
 * generally and gives examples inside a bracket. Our five are that sentence
 * expanded into the actions this product can either refuse or see, which is a
 * useful thing to have and is not an enumeration in the source. A reader who
 * takes the five for the manual's list will also take it for a closed list, and
 * it is open: "or take any other adverse action".
 *
 * Read at e-verify.gov on 8 September 2026, sections 3.2 and 3.3.
 */
export const PROHIBITION_SOURCE_TEXT =
  'Employers may not terminate or take any other adverse action against an employee (such as ' +
  'denying work, delaying training, withholding pay, or otherwise assuming that he or she is not ' +
  'authorized to work).';

export const PROHIBITION_LIST_NOTE =
  'The five actions listed are this product\'s expansion of the manual\'s sentence into things it can ' +
  'refuse or observe. The manual\'s own wording bars any other adverse action too, so treat the five ' +
  'as a floor and not as the boundary.';

export const EVERIFY_BAR_RULE =
  'Nothing adverse until Final Nonconfirmation. Contesting an E-Verify mismatch is not a basis for any of the above.';

/**
 * Is anything barred on this application right now, and why.
 *
 * Two grounds, kept apart on purpose. The five enumerated actions come from
 * E-Verify. FCRA enumerates nothing: it bars the adverse action itself until
 * the person has had a reasonable period to dispute the report. Merging the two
 * would put five prohibitions in front of a reader on the authority of a
 * statute that lists none.
 *
 * The module this replaced looked only at the E-Verify decision field, so a
 * screen showed no bar at all while an FCRA pre-adverse notice was open, even
 * though the engine was refusing the move. A refusal with no visible bar is the
 * failure this whole section exists to prevent.
 */
export function adverseBar(store, ctx, application) {
  const a = application;
  const grounds = [];

  const ev = a.everify || null;
  const evException = openException(store, ctx, a, 'everify_mismatch');
  /* The exception is checked as well as the record field because the engine
     refuses on the exception. If the two ever disagree, the bar must show
     whichever one is stopping the move. */
  if ((ev && ev.decision === 'contesting') || evException) {
    grounds.push({
      kind: 'everify_mismatch',
      since: (ev && ev.tncIssuedAt) || (evException ? evException.at : null),
      rule: EVERIFY_BAR_RULE,
      citation: 'E-Verify User Manual M-775, current as of May 2025, sections 3.2 and 3.3',
      authority: 'program-agreement',
      isLaw: false,
      source: 'verified',
      sourceText: PROHIBITION_SOURCE_TEXT,
      barred: PROHIBITED_ACTIONS,
      liftsWhen: 'the case reaches a Final Nonconfirmation. Only then may the employer terminate.',
      likelyCause: (ev && ev.likelyCause) || null,
      note: (ev && ev.note) ||
        'There is no E-Verify case status that means contesting, so the product holds that itself.'
    });
  }

  const fcraException = openException(store, ctx, a, 'adverse_review');
  const seq = fcraSequence(store, ctx, a);
  if (fcraException || (seq && !seq.mayTakeAdverseAction)) {
    grounds.push({
      kind: 'adverse_review',
      /* When there is no exception row, the bar has been up since the
         pre-adverse notice went out, because that is the act that starts the
         period the person is owed. */
      since: fcraException ? fcraException.at
           : (seq && seq.steps[0].at != null ? seq.steps[0].at : null),
      rule: 'The adverse action may not be taken until the person has had a copy of the report, the summary of rights, and a reasonable period to dispute it. FCRA enumerates no list of actions: what is barred is the adverse action itself.',
      citation: 'FCRA 15 U.S.C. 1681b(b)(3)(A)',
      authority: 'federal-regulation',
      isLaw: true,
      source: 'verified',
      barred: [{ key: 'adverse_action', name: 'The adverse action itself, meaning a decision not to hire based on the report', guarded: true,
                 guardedBy: 'the workflow engine, which refuses a move to REJECTED while the pre-adverse gap is open',
                 happensIn: 'this product' }],
      liftsWhen: seq ? (seq.whyNot || 'the gap has elapsed') : 'the pre-adverse notice has been sent and the gap has elapsed',
      gap: seq ? seq.gap : fcraGap(store, ctx)
    });
  }

  if (!grounds.length) return null;

  /* Carried across: the refused attempts are the demonstration. A bar nobody
     tested is a claim. The old version read detail.attempted, which the engine
     never writes, so every attempt rendered as the bare action name. The engine
     records the move it refused as detail.from and detail.to, so that is what
     is read here. */
  const attempts = store.all('auditEvents', ctx.tenantId)
    .filter((e) => e.applicationId === a.id && e.outcome === 'refused')
    .sort((x, y) => y.at - x.at)
    .map((e) => ({
      at: e.at,
      who: e.actor || e.actorType,
      what: describeAttempt(e),
      why: e.why || null
    }));

  const barred = [];
  grounds.forEach((g) => g.barred.forEach((b) => {
    if (!barred.some((x) => x.key === b.key)) barred.push(b);
  }));

  return {
    active: true,
    grounds,
    /* The union of what the active grounds bar, never the five by default. */
    barred,
    /* The full E-Verify set and the split, exported on the payload as well as
       from the module, so a surface rendering the bar cannot show only the two
       it can refuse. */
    everifyProhibitions: PROHIBITED_ACTIONS,
    guarded: GUARDED_ACTIONS,
    unguarded: UNGUARDED_ACTIONS,
    unguardedWarning: 'Three of the five barred actions happen in systems this product does not own, so they cannot be refused here. They have to be shown to whoever might take them.',
    /* The quotation and the caveat travel with the payload, not just with the
       module, so a surface rendering five neat rows cannot present them as the
       manual's own list. */
    prohibitionSourceText: PROHIBITION_SOURCE_TEXT,
    prohibitionListNote: PROHIBITION_LIST_NOTE,
    attempts
  };
}

function describeAttempt(e) {
  if (e.detail && e.detail.attempted) return e.detail.attempted;
  if (e.detail && e.detail.to) {
    return 'move to ' + e.detail.to + (e.detail.from ? ' from ' + e.detail.from : '');
  }
  return e.action;
}

/* =========================================================================
   RETENTION, WHICH IS SEVERAL FLOORS AND NOT ONE DATE

   The candidate is told what we keep and for how long. The product holds at
   least two floors under that promise and they do not agree, which nothing
   noticed until employment counsel read the file.

   The disclosure says four years and then deletion. The Form I-9 has to be kept
   three years after the hire or one year after the employment ends, whichever is
   later, and for anybody with more than three years of service that runs PAST
   four. Both cannot be honoured by a single date, and today the product honours
   neither, because nothing deletes anything.

   So retention is computed as a set of floors, each naming its own rule and its
   own authority, and the governing date is the latest of them. Deleting to the
   wrong floor is the breach in either direction: early on the I-9, late on the
   four year promise.
   ========================================================================= */

/**
 * Every deletion floor that applies to one application, and which one governs.
 *
 * The four year figure is READ OFF THE CONSENT RECORD rather than recomputed
 * here. That is deliberate. The number lives where the consent is written, this
 * file could not pin the regulation section behind it during the verification
 * pass, and a second copy of an unpinned number is the worst of both. So the
 * floor is reported as declared by the consent record, with its own basis text,
 * and it is marked unpinned until somebody pins it.
 */
export function retentionFloor(store, ctx, application) {
  const app = application;
  const floors = [];

  const decl = CLOCKS.find((c) => c.key === 'i9_retention');
  if (app.startedAt) {
    const at = decl.due(store, ctx, app, app.startedAt);
    floors.push({
      key: 'i9', at,
      rule: decl.rule,
      citation: decl.citation,
      authority: decl.authority,
      isLaw: isLawFor(decl.authority),
      source: decl.source,
      runsFrom: 'the hire date, and the separation date where there is one'
    });
  }

  const cs = noticeConsent(store, ctx, app);
  if (cs && cs.deleteAfter != null) {
    floors.push({
      key: 'ads_input', at: cs.deleteAfter,
      rule: 'The inputs to an automated decision system are retained for four years from collection, then deleted.',
      citation: null,
      authority: 'state-regulation',
      isLaw: true,
      source: 'unpinned',
      sourceNote: 'Declared on consent record ' + cs.id + ' as retention class ' +
                  (cs.retentionClass || 'unset') + '. The California regulation section behind the four ' +
                  'years could not be pinned on 8 September 2026: the Civil Rights Council final text is a ' +
                  'scanned PDF that would not extract and no first-party HTML copy was reachable. ' +
                  'Pin it before a customer reads this.',
      declaredBasis: cs.basis || null,
      runsFrom: 'the moment the disclosure was accepted'
    });
  }

  /* Declared and not driven, like the retention clock itself. A legal hold
     outranks every floor above and there is nowhere in this build to put one,
     so the absence is stated rather than left to be discovered. */
  floors.push({
    key: 'legal_hold', at: null,
    rule: 'A litigation or agency hold suspends deletion for as long as it runs, whatever the floors above say.',
    citation: null, authority: 'tenant-policy', isLaw: false, source: 'unpinned',
    implemented: false,
    sourceNote: 'There is no legal hold field anywhere in this build, so nothing can be put on hold and nothing can be released. Any deletion sweep written before that exists will delete records that should have been kept.'
  });

  const dated = floors.filter((f) => f.at != null);
  const latest = dated.length ? dated.reduce((a, b) => (b.at > a.at ? b : a)) : null;

  return {
    floors,
    governs: latest ? latest.key : null,
    deleteNotBefore: latest ? latest.at : null,
    /* The whole reason this function exists. A surface promising a single date
       has to be able to say when the promise it prints is not the governing
       one. */
    disagree: dated.length > 1,
    note: latest == null
      ? 'No dated retention floor applies to this application yet.'
      : 'Nothing may be deleted before ' + stamp(latest.at) + ', which is the ' + latest.key +
        ' floor. Nothing in this build deletes anything, so this is a declared obligation and not a driven one.'
  };
}

/* =========================================================================
   THE TENANT VIEW
   ========================================================================= */

/**
 * Does anybody have to do anything about this case, and what.
 *
 * THE DEFECT THIS FIXES, measured on the seeded tenant on 8 September 2026.
 * `allCases` returned 36 rows. 28 of them carried exactly one clock,
 * `aedt_notice`, whose owner is the clock itself and whose `actor` is nobody, so
 * there was no person to act and nothing to act on. Across the whole tenant
 * exactly one human-owned clock was not done, and exactly one case had an unmet
 * deadline. A list sorted by urgency where 28 rows in 36 are the same lawful
 * wait is not a work list, and it was the only shape the compliance data came
 * in.
 *
 * So the ownership question is answered here, once, and both the everything list
 * and the work list are built from the same answer. Four things put a person on
 * the hook and nothing else does.
 */
function actionFor(clocks, bar, fcra) {
  const reasons = [];

  clocks.forEach((k) => {
    /* Undone and a person owns it. This is the ordinary case and it is the one
       that found nothing in 35 of 36 applications. */
    if (k.owner === 'human' && !k.done && k.implemented) {
      reasons.push({ kind: 'clock', key: k.key, why: k.title, actor: k.actor,
                     dueAt: k.dueAt, leftLabel: k.leftLabel, tone: k.tone, breached: k.breached });
      return;
    }
    /* Breached and nobody was going to fix it by waiting. A system-owned clock
       past its date means the automation has stalled and somebody has to chase
       it. A clock owned by the clock itself is excluded on purpose: gov_update
       is the government's own window and its own row says nobody here can do
       anything about it, so putting it on a work list teaches people to ignore
       the list. */
    if (k.breached && k.owner !== 'clock' && !k.done && k.implemented) {
      reasons.push({ kind: 'breach', key: k.key, why: k.title + ', past its date', actor: k.actor,
                     dueAt: k.dueAt, leftLabel: k.leftLabel, tone: 'crit', breached: true });
    }
  });

  /* A prohibition in force is not a task and it still needs a person, because
     the whole point of the bar is that somebody is about to do the barred
     thing. It carries no due date, which is why it is a separate reason kind
     rather than a clock. */
  if (bar) {
    bar.grounds.forEach((g) => {
      reasons.push({ kind: 'bar', key: g.kind, why: 'Adverse action is barred: ' + g.kind.replace(/_/g, ' '),
                     actor: 'employer', dueAt: null, leftLabel: null, tone: 'crit', breached: false });
    });
  }

  /* The notice sequence, where the next step is a person's and it is available.
     Nothing sends itself here, so a sequence sitting at step 1 with nobody
     told is a person's job by definition. */
  if (fcra) {
    const next = fcra.steps.find((s) => !s.done);
    if (next && next.owner === 'human') {
      reasons.push({ kind: 'notice', key: next.key, why: next.name, actor: 'employer',
                     dueAt: null, leftLabel: null, tone: next.key === 'pre_adverse' ? 'crit' : 'warn',
                     breached: false });
    }
  }

  return {
    required: reasons.length > 0,
    reasons,
    /* Ranked here so no caller has to. A breach outranks a bar, a bar outranks
       an approaching deadline, and inside those the soonest date wins. */
    worst: reasons.length ? reasons.slice().sort(rankReasons)[0] : null
  };
}

const REASON_ORDER = { breach: 0, bar: 1, clock: 2, notice: 3 };

function rankReasons(a, b) {
  if (a.breached !== b.breached) return a.breached ? -1 : 1;
  const ra = REASON_ORDER[a.kind], rb = REASON_ORDER[b.kind];
  if (ra !== rb) return ra - rb;
  const da = a.dueAt == null ? Infinity : a.dueAt;
  const db = b.dueAt == null ? Infinity : b.dueAt;
  return da - db;
}

/**
 * Every application with a live compliance surface, worst first.
 *
 * Ranked by the soonest unmet deadline, because proximity to breach is the only
 * axis that ranks by consequence. Two changes from the module this replaces.
 *
 * It sorts on the due INSTANT rather than on a count of days. The old sort took
 * the minimum `left` across a case, which compared business days against
 * calendar days as though they were the same number, and collapsed everything
 * due today into one bucket with no order inside it. An instant needs no unit.
 *
 * And it ranks deadlines only. A running notice period is not a pending breach,
 * so counting it would push a perfectly healthy case to the top of a screen
 * whose whole purpose is to show what is about to go wrong.
 */
export function allCases(store, ctx) {
  return store.all('applications', ctx.tenantId)
    .map((a) => {
      const clocks = clocksFor(store, ctx, a);
      const bar = adverseBar(store, ctx, a);
      const fcra = fcraSequence(store, ctx, a);
      if (!clocks.length && !bar && !fcra) return null;

      /* Missing rows are survived rather than thrown on. The old version read
         c.id and st.name straight off the lookup, so one absent candidate row
         took the entire compliance screen down. */
      const c = store.byId('candidates', ctx.tenantId, a.candidateId);
      const st = store.byId('stores', ctx.tenantId, a.storeId);

      const pending = clocks.filter((k) => k.polarity === 'deadline' && !k.done);
      const soonest = pending.length ? Math.min.apply(null, pending.map((k) => k.dueAt)) : null;

      return {
        applicationId: a.id,
        candidateId: a.candidateId,
        name: c ? c.name : null,
        initials: c ? c.initials : null,
        store: st ? st.name : null,
        storeId: a.storeId || null,
        state: a.state,
        startedAt: a.startedAt || null,
        everify: a.everify ? {
          caseRef: a.everify.caseRef, status: a.everify.status, source: a.everify.source,
          decision: a.everify.decision, likelyCause: a.everify.likelyCause, note: a.everify.note
        } : null,
        clocks,
        adverseBar: bar,
        fcra,
        /* Precomputed so every surface ranks and colours the same way. A page
           that recomputes urgency will eventually disagree with this list. */
        soonestDeadlineAt: soonest,
        unmetDeadlines: pending.length,
        breached: pending.filter((k) => k.breached).length,
        worstTone: worstTone(clocks),
        /* Whether a person is on the hook, and why. Computed once here so the
           work list and the everything list cannot disagree about it. */
        action: actionFor(clocks, bar, fcra),
        /* The count that made the old shape useless, carried on the row so a
           surface can say what it is filtering out rather than just hiding it. */
        ownerlessClocks: clocks.filter((k) => k.owner === 'clock' && !k.done).length
      };
    })
    .filter(Boolean)
    .sort((x, y) => {
      const xs = x.soonestDeadlineAt == null ? Infinity : x.soonestDeadlineAt;
      const ys = y.soonestDeadlineAt == null ? Infinity : y.soonestDeadlineAt;
      if (xs !== ys) return xs - ys;
      /* A tie goes to the case with a bar up, because a prohibition in force
         outranks a deadline that has not been missed. */
      return (y.adverseBar ? 1 : 0) - (x.adverseBar ? 1 : 0);
    });
}

/**
 * Only the cases where a person has to act, worst first.
 *
 * This is the list a work surface wants and the one the module could not
 * produce. Measured on the seeded tenant on 8 September 2026 it returns 2 rows
 * out of 36, carrying 3 reasons between them: the E-Verify mismatch with a
 * running federal deadline and its bar, and the FCRA case with its bar. One row
 * per application with every reason on it, because the person reading it is
 * going to open one case and needs all of it.
 *
 * Two rows is the honest size of the compliance work list in this tenant, and
 * it is a better thing to put on a screen than 36 rows that are mostly the same
 * lawful wait repeated.
 *
 * Ranked by consequence and not by date, because a bar in force and a deadline
 * three days out are different kinds of thing and the date cannot compare them.
 */
export function casesNeedingAPerson(store, ctx) {
  return allCases(store, ctx)
    .filter((k) => k.action.required)
    .sort((x, y) => rankReasons(x.action.worst, y.action.worst));
}

/**
 * Both lists and the counts that reconcile them.
 *
 * The counts are the point. A page that filters 33 rows out of sight and says
 * nothing looks like a page hiding something, so the numbers travel with the
 * data: how many cases exist, how many need a person, and how many carry
 * nothing but a clock nobody owns.
 */
export function complianceView(store, ctx) {
  const every = allCases(store, ctx);
  const needsAPerson = every
    .filter((k) => k.action.required)
    .sort((x, y) => rankReasons(x.action.worst, y.action.worst));

  const ownerlessOnly = every.filter((k) => !k.action.required && k.clocks.length > 0 &&
    k.clocks.every((c) => c.owner === 'clock' || c.done));

  return {
    needsAPerson,
    everyCase: every,
    notice: noticeGateSummary(store, ctx),
    counts: {
      cases: every.length,
      needAPerson: needsAPerson.length,
      nothingToDo: every.length - needsAPerson.length,
      onlyClocksNobodyOwns: ownerlessOnly.length,
      unmetDeadlines: every.reduce((n, k) => n + k.unmetDeadlines, 0),
      breached: every.reduce((n, k) => n + k.breached, 0),
      barsUp: every.filter((k) => k.adverseBar).length
    },
    /* Said in words as well as numbers, because this sentence is what stops
       the filter reading as concealment. */
    filterNote: 'Every case is in `everyCase`. `needsAPerson` is the subset where a named person owes an ' +
      'action, a prohibition is in force, or a deadline has passed. The rest carry only clocks nobody ' +
      'owns, which are lawful waits and are still shown on request.'
  };
}

const TONE_ORDER = { crit: 3, warn: 2, clock: 1, good: 0 };

/**
 * The worst tone on a case, computed once here so no two surfaces disagree.
 *
 * A clock the product declares but does not drive is left out. Retention is
 * declared and nothing deletes yet, so counting it would hold every finished
 * case at the neutral clock tone forever and no case would ever read as clear.
 */
function worstTone(clocks) {
  let worst = 'good';
  clocks.forEach((k) => {
    if (!k.implemented) return;
    if (TONE_ORDER[k.tone] > TONE_ORDER[worst]) worst = k.tone;
  });
  return worst;
}
