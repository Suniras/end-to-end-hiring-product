/* ============================================================================
   connectors.js  ·  the integration boundary

   EVERY ADAPTER IN THIS FILE IS SIMULATED. Nothing here talks to a vendor and
   nothing here holds a credential. What is real is the SHAPE: a call goes out,
   it takes time, it comes back with a reference the vendor would own, it can
   fail, and a failure is retryable or it is not. Swapping a simulated adapter
   for a real one means writing a transport, not rewriting the product.

   THE PROPERTY THIS FILE IS BUILT AROUND, and it is structural rather than a
   promise. THERE IS NO VENDOR FIELD ANYWHERE IN THE REGISTRY. There is nowhere
   to write "Connected to Workday", so nobody can. Naming a vendor we have not
   integrated is the one dishonesty this module exists to make impossible, and a
   field holding null today is one edit away from holding a name. The old
   module's `inventory()` did emit `vendor: null` on every row. That is gone for
   the same reason: a status row says what is true of the route, and it has no
   slot for who is on the other end of it.

   SIX MECHANISMS, each of which stops a specific lie.

   1. `mode` is derived, written on the call row, and returned in every result.
      THE DEFECT THIS FIXES. In the previous build the view layer hardcoded
      `mode: 'simulated'` on its own output rows (views.js:365, recorded under
      U-70), so the honesty label was ASSERTED BY THE PAGE rather than reported
      by the thing it described. If the connector had ever gone live the page
      would have kept saying simulated, and if it had gone the other way the
      page could have said live over a simulator. Now the only place mode comes
      from is `modeOf`, it is on the row, and a page can only read it.
   2. Latency comes from an FNV-1a hash of the payload, never from a random
      number. The same order takes the same time on every run, because a product
      that produces different numbers every run cannot be tested.
   3. Every call is recorded in `connectorCalls` whether it succeeded or failed,
      with the request, the response, the external reference, the latency, and
      whether a failure is retryable.
   4. `redact` runs on every payload before it is written.
   5. Failure is CONFIGURED PER OP rather than special-cased at the call site.
      The one real error string we have is a Jooble feed rejection, and U-72
      keeps it on screen with its text shown as it is, because it is the one
      event on that block that was observed rather than asserted. It now lives
      on the op that can produce it.
   6. `unimplemented` is a first-class response field. A transport that exists
      and is not wired up says so in the record rather than being drawn as a
      live integration.

   WHAT THIS FILE DOES NOT DO. It writes no audit event and raises no exception.
   Placing a call is a decision, and the decision belongs to the caller that
   made it, so the audit row and the `connector_error` exception are the
   caller's to write. This module records the call itself and nothing else.

   THE STATUS REGISTER IS NEW. U-70 and U-71 turned the sources page from a
   count of successful simulated calls into an integrator surface, where every
   row is a status, a reason, and a citation where one exists. A count of
   simulated calls reads as a listing that is live on a board we cannot reach.
   So the registry carries, per adapter, whether a real route is known to exist
   and what that route would require, and `statusOf` hands that to the page.
   Every route sentence below is carried from our own research documents and
   cited to them. None of it is a vendor relationship, none of it was invented
   here, and where the research found nothing the row says so rather than
   filling the gap in. The tier is desk research with an adversarial pass over
   it, so `routeKnown` means a route is documented and reachable. It never means
   built, tested or agreed.

   IT IMPORTS NOTHING, and that is deliberate rather than an oversight. This is
   the boundary. It writes one table, derives a store id, and holds no view of
   the workflow, so pulling in the state machine or the event writers would give
   it reach it has no use for. The old module imported the clock only to
   re-export MIN, HOUR and DAY for callers, which is a re-export nobody needs
   now that everything is an ES module and can import the clock itself.
   ============================================================================ */

/* ------------------------------------------------------------- the hash ---
   FNV-1a, carried across unchanged. Same input, same latency, every run.
   ------------------------------------------------------------------------- */

export function hash(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

/** A value in [lo, hi] chosen deterministically from a key. Carried across. */
export function spread(key, lo, hi) { return lo + (hash(key) % Math.max(1, (hi - lo + 1))); }

/**
 * A reference the vendor would own.
 *
 * DEFECT FIXED. The old version was `String(hash(key)).padStart(10, '0').slice(0, 8)`,
 * which pads a short decimal hash with leading zeros and then keeps the FIRST
 * eight characters, throwing away the last digits of every hash below one
 * hundred million. Hashes 123450 and 123459 both came out as "00001234". Two
 * different applications could therefore share one order reference, and any
 * page keyed on the reference would merge them. Eight hex digits carry the
 * whole 32-bit hash, need no padding at all, and keep the same PREFIX-8 shape.
 */
export function ref(prefix, key) {
  return prefix + '-' + hash(key).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * A stable string for any payload, so the latency key does not depend on the
 * order the caller happened to build the object in.
 *
 * DEFECT FIXED. The old module computed latency inside each of the fifteen ops,
 * and three of them keyed it on one field instead of the payload. `post_opening`
 * keyed on the destination alone, so all eight requisitions posting to Indeed
 * took an identical number of milliseconds and the sources page printed the same
 * duration eight times. This is the same shape of defect as the shared
 * `openedAt` that made "open for 26 days" a constant printed eight times. The
 * key is now built here, from the whole payload, and an op cannot forget.
 */
function stableKey(v, depth) {
  const d = depth || 0;
  if (v === null || v === undefined) return 'null';
  if (d > 6) return '"deep"';
  if (Array.isArray(v)) return '[' + v.map((x) => stableKey(x, d + 1)).join(',') + ']';
  if (typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stableKey(v[k], d + 1)).join(',') + '}';
  }
  return JSON.stringify(v);
}

/* ------------------------------------------------------------- the mode ---
   A live transport would be a module of its own with an async signature. There
   are none, and this file deliberately holds no way to register one, because a
   registry that can be filled in is a registry that can report live while the
   simulator runs, which is the exact lie the header is about. So the map is
   frozen and empty, every adapter resolves to 'simulated', and no branch in
   this file returns anything else. `modeOf` stays a function and its answer
   stays on every row, because the point is that the page READS the mode rather
   than printing one of its own.
   ------------------------------------------------------------------------- */

const TRANSPORTS = Object.freeze({});

export function modeOf(adapterKey) {
  return Object.prototype.hasOwnProperty.call(TRANSPORTS, adapterKey) ? 'live' : 'simulated';
}

/* ---------------------------------------------------------- the adapters ---
   Eight adapters, fifteen ops, carried across. Each op declares its latency
   range, the fields it cannot work without, how its reference is formed, and
   the failures it is able to produce. The op itself only builds the response
   body, so nothing about determinism, recording or honesty is left to it.
   ------------------------------------------------------------------------- */

export const ADAPTERS = {

  /* Where applications arrive from and where openings are posted to. In the
     real product this is the customer's existing applicant tracking system and
     whichever boards they already buy. */
  ats: {
    label: 'Applicant tracking and job distribution',
    routeKnown: 'partial',
    route: 'Outbound distribution has documented routes and they differ per destination, so they are held per row in DESTINATIONS rather than rolled into one answer for the adapter. Inbound is the gap: nothing was verified about bulk export formats, disposition data or attachment export for Workday Recruiting, iCIMS, Oracle Taleo, Oracle Recruiting Cloud, UKG, ADP or Avature, because every one of those documentation sets is behind a login or rendered by JavaScript that fetchers cannot read.',
    citation: 'docs/05-strategy/integration-surface-map.md',
    requires: 'A read of new applications as they arrive, which is all step 1 needs, and a write of the disposition back at step 6 so the retailer\'s own system stays the record. What a retailer can actually export from their existing applicant tracking system is the biggest single unknown in the integration map.',
    note: 'Job board distribution is an open question against a standing non-goal. Q-041 asks whether D-009 has to be amended and is still open, so these rows say what a route would cost, not that we intend to build one.',
    ops: {
      post_opening: {
        latency: [400, 3200],
        needs: ['requisitionId', 'destination'],
        refPrefix: 'POST',
        refKey: (p) => p.requisitionId + '|' + p.destination,
        /* `accepted`, not `live`. Defect 9 in the previous build was that a
           counter called `live` read as a live listing on boards we have no
           integration with. It was renamed in the view and the word was left
           sitting inside the simulated response for the next page to find. */
        data: (p) => ({ destination: p.destination, accepted: true }),
        failures: {
          feed_rejected: {
            error: 'HTTP 502 from the aggregator. Feed rejected, no listing created.',
            retryable: true,
            latency: [200, 1200]
          }
        }
      },
      pull_applications: {
        latency: [600, 2400],
        needs: ['since'],
        refPrefix: 'PULL',
        refKey: (p) => String(p.since),
        data: (p) => ({ count: p.count || 0 })
      }
    }
  },

  /* The screening agency. The product orders and tracks. It never performs a
     background check and it is not a consumer reporting agency. */
  background_check: {
    label: 'Background screening agency',
    routeKnown: true,
    route: 'Checkr and Accurate publish full public references. Checkr decomposes a report into child searches including a per-county array, so a pending report can be resolved to which county is outstanding, which is what step 10 needs to say why a check is slow. Accurate publicly documents verification-attempt and estimated-completion endpoints. Sterling publishes public docs but issues credentials only after an email request and documents no status enumeration. First Advantage points developers at Sterling\'s docs. HireRight has no reachable documentation at all.',
    citation: 'docs/05-strategy/integration-surface-map.md',
    requires: 'The retailer normally holds the agency contract, so this is a write of the order and a read of the status against an account they already have. The per-search breakdown is the part that matters and only some agencies expose it.',
    ops: {
      order: {
        latency: [900, 2600],
        needs: ['applicationId', 'searches'],
        refPrefix: 'ORD',
        refKey: (p) => p.applicationId,
        /* `orderedAt` comes from the call's own timestamp. The old op read
           `p.at` out of the payload while `call` computed its own `at`, so the
           two could disagree, and a caller that left `at` off the payload wrote
           `orderedAt: undefined` into the record. */
        data: (p, meta) => ({ searches: p.searches, orderedAt: meta.at })
      },
      poll: {
        latency: [200, 900],
        needs: ['externalRef'],
        echoRef: true,
        data: (p) => ({ status: p.status })
      }
    }
  },

  /* I-9 and E-Verify go through an embedded vendor. The one requirement that
     decides whether a vendor is usable at all is that it exposes the E-Verify
     case state, because a product that cannot see the case state cannot drive
     the clocks or enforce the adverse action bar. */
  everify: {
    label: 'I-9 and E-Verify vendor',
    routeKnown: 'partial',
    route: 'Web services access is open to both employers and E-Verify employer agents, but it is gated by enrolment plus a technical certification test, and the Interface Control Agreement, which is the actual technical specification, is issued only to enrolled participants and is not published. On the vendor side, only WorkBright publicly documents both a readable deadline and a readable tentative-nonconfirmation action. Symmetry I-9 is the same product white-labelled. Equifax Guardian exposes a due date and nothing about the contest. Checkr, Sterling, First Advantage, HireRight and Fragomen keep it inside their own interface.',
    citation: 'docs/05-strategy/connector-map.md, docs/05-strategy/integration-surface-map.md',
    /* Carried across verbatim from the old module, and it is a procurement
       requirement rather than a code detail. */
    requires: 'The vendor must expose the E-Verify case state. Without it the clocks and the adverse action bar cannot be driven.',
    note: 'No vendor publishes an event telling us somebody is contesting with days remaining, and DHS\'s own instruction is to check periodically, so this connector polls by design rather than by omission. There is also no case result that means "contesting": E-Verify publishes six results and none is a countdown, so we record the contest ourselves and watch for Case in Continuance.',
    ops: {
      create_case: {
        latency: [1200, 4000],
        needs: ['applicationId'],
        refPrefix: 'EV',
        refKey: (p) => p.applicationId,
        /* The default is a simulation convenience and it is the generous one. A
           real transport must never default a case result: not knowing the
           answer and being authorised are different states, and only one of
           them lets somebody start work. */
        data: (p) => ({ caseStatus: p.caseStatus || 'EMPLOYMENT_AUTHORIZED' })
      },
      poll_case: {
        latency: [300, 1100],
        needs: ['externalRef'],
        echoRef: true,
        data: (p) => ({ caseStatus: p.caseStatus })
      }
    }
  },

  hris: {
    label: 'Payroll and human resources system of record',
    routeKnown: true,
    route: 'This is the best-documented target in the map and the most heavily gated. ADP\'s own partner guide requires an executed agreement before the integration can be completed, two marketplace listings rather than one, mutual TLS on all API calls to its gateway, SSO integration, and one project per ADP system integrated with. It sizes Workforce Now at fifty to three thousand employees and directs larger businesses to separately named products, so integrating with ADP is not one integration for a retailer with tens of thousands of frontline staff. Workday\'s Staffing operation reference is static HTML served without a login and documents hiring a pre-hire through the Hire Employee business process, which models our funnel closely, but Workday publishes no certification criteria, cost or timeline in public.',
    citation: 'docs/05-strategy/integration-surface-map.md',
    requires: 'A write into the system finance depends on, which is the hardest posture in the map, plus a read of employment status for step 20 because that is the number the finance side believes. No total calendar time is published by ADP or Workday anywhere, so do not quote one.',
    ops: {
      create_employee: {
        latency: [1500, 5000],
        needs: ['candidateId'],
        refPrefix: 'EMP',
        refKey: (p) => p.candidateId,
        data: (p) => ({ employeeId: p.employeeId })
      },
      reactivate_employee: {
        latency: [700, 2000],
        needs: ['priorEmployeeId'],
        refPrefix: 'EMP',
        refKey: (p) => p.priorEmployeeId,
        data: (p) => ({ employeeId: p.priorEmployeeId, reactivated: true })
      }
    }
  },

  scheduling: {
    label: 'Workforce management and scheduling',
    routeKnown: true,
    route: 'Documented and public at UKG Pro WFM, which publishes schedule write operations readable without a login, including a multi-employee schedule update. An earlier round of our own research concluded that writing a shift was documented nowhere, and that was wrong at exactly the vendor most likely to be running a retailer\'s stores. Not documented at Legion, whose only integration call to action is a demo request. Blue Yonder\'s developer portal sits on a legacy host that was never read, and Zebra\'s Workcloud scheduling page is live with no API docs found.',
    citation: 'docs/05-strategy/integration-surface-map.md',
    requires: 'A write of the shift, and the local advance-notice rule respected before it is written. The same system holds the time and attendance punch, which is the evidence for step 16.',
    ops: {
      /* Fair workweek rules in covered cities require roughly fourteen days of
         advance schedule notice, with a premium payable to change inside that
         window. So a first shift is not ours to place freely, and the adapter
         REPORTS the constraint rather than silently writing the shift. */
      write_shift: {
        latency: [500, 1800],
        /* `noticeDays` is required rather than optional. The old op computed
           `premiumPayable: p.noticeDays < 14`, and `undefined < 14` is false,
           so a caller that forgot the field got a confident "no premium
           payable". That is the wrong answer in the direction that costs the
           retailer money, and it would have been silent. */
        needs: ['applicationId', 'startsAt', 'noticeDays'],
        refPrefix: 'SHF',
        refKey: (p) => p.applicationId + '|' + p.startsAt,
        data: (p) => ({ startsAt: p.startsAt, noticeDays: p.noticeDays,
                        premiumPayable: p.noticeDays < 14 })
      },
      remove_shift: {
        latency: [300, 900],
        needs: ['shiftId'],
        refPrefix: 'SHF',
        refKey: (p) => p.shiftId,
        data: () => ({ removed: true })
      }
    }
  },

  identity: {
    label: 'Identity directory and store systems access',
    routeKnown: 'partial',
    route: 'This is the integration most likely to be under-estimated, because "we will just use SCIM" sounds solved and is not. SCIM\'s direction of travel is an identity provider pushing users into an application, and we need the opposite. For Microsoft Entra ID the inbound path is not a plain SCIM user create but a Microsoft Graph bulk upload endpoint that accepts a SCIM-schema payload, is asynchronous so you submit and then poll a provisioning logs API, requires the customer\'s IT administrator to install a provisioning application per data source and grant two specific permissions, requires an Entra ID P1, P2 or Governance licence, and on P1 and P2 is throttled to forty calls per five seconds and two thousand calls per twenty-four hours per tenant. Okta\'s equivalent path was not verified. Badge and point of sale provisioning returned nothing at all, from any source.',
    citation: 'docs/05-strategy/integration-surface-map.md, docs/05-strategy/connector-map.md',
    requires: 'A per-customer, admin-gated, licence-dependent write into the retailer\'s directory. The daily cap is a live operational risk at peak-season hiring volume. Badge and till access has no public vendor documentation anywhere and it sits on the critical path to day one, which in practice means it is email and a phone call today.',
    ops: {
      provision: {
        latency: [2000, 7000],
        needs: ['candidateId'],
        refPrefix: 'IDN',
        refKey: (p) => p.candidateId,
        data: (p) => ({ account: p.account })
      }
    }
  },

  learning: {
    label: 'Learning management system',
    /* Said as a hole rather than filled in. Six research angles and thirteen
       audit agents checked no learning system API, so the honest status is that
       we do not know, and a row that guessed here would be the first invented
       route on the page. */
    routeKnown: false,
    route: null,
    citation: null,
    requires: 'Unknown. No learning system API was checked in any research angle, so nothing is documented either way. Steps 13 and 17 need a read of completion status and we assign nothing the retailer does not already assign, which is the cheapest posture, but that is a design intention rather than a verified route.',
    ops: {
      assign: {
        latency: [800, 2500],
        needs: ['candidateId', 'courses'],
        refPrefix: 'LRN',
        refKey: (p) => p.candidateId + '|' + (p.courses || []).join(','),
        data: (p) => ({ courses: p.courses })
      }
    }
  },

  /* Email and SMS. Development adapters: they record the message and mark it
     delivered. Nothing leaves this machine. Voice is an interface only, because
     the honest thing to demonstrate is the screening intelligence rather than
     an afternoon spent on telephony. */
  messaging: {
    label: 'Email, SMS and voice',
    routeKnown: true,
    route: 'These are vendors licensed once and embedded rather than negotiated per customer, and their APIs are public. Fountain runs two messaging vendors in parallel, Twilio and Bird, monitored across five and four regions respectively, so plan for two rather than one. Paradox\'s binding sub-processor list names Twilio and SendGrid.',
    citation: 'docs/05-strategy/integration-surface-map.md',
    requires: 'An account and a key that we hold as the platform, not the retailer. Nothing in this build holds one, which is why every message here is recorded and marked delivered without leaving the machine.',
    ops: {
      email: {
        latency: [120, 700],
        needs: ['to'],
        refPrefix: 'EML',
        refKey: (p) => p.to + '|' + (p.templateId || ''),
        data: (p) => ({ to: p.to, subject: p.subject })
      },
      sms: {
        latency: [80, 400],
        needs: ['to'],
        refPrefix: 'SMS',
        refKey: (p) => p.to + '|' + (p.templateId || ''),
        data: (p) => ({ to: p.to })
      },
      voice: {
        latency: [900, 2400],
        needs: ['to'],
        refPrefix: 'VOX',
        refKey: (p) => p.to + '|' + (p.script || ''),
        data: (p) => ({ to: p.to, durationS: p.durationS || null }),
        unimplemented: 'Outbound voice is an interface here, not a running integration. Nurix has shipped a live voice screening agent on another build, so this is a transport that exists and is not wired up in this build.'
      }
    }
  }
};

/* ------------------------------------------------------- the destinations ---
   The outbound rows on the sources page are destinations, not adapters, and
   their routes differ so sharply that one answer for the ats adapter would be
   useless. U-70 replaced the post counts with configuration rows carrying a
   status, and U-71 put every row in the register the LinkedIn row already used:
   a status, a reason, and a citation where one exists.

   Four statuses, and they are the four the decision named. `ours` means no
   external route exists to build. `available` means documented, free, and not
   built. `needs_agreement` means the route is open but somebody has to sign
   something first. `closed` means it is not ours to open.

   These are routes our own research documented. None of them is a relationship
   and none of them is built.
   ------------------------------------------------------------------------- */

export const DESTINATIONS = {
  'Careers site': {
    key: 'careers_site',
    status: 'ours',
    reason: 'The careers page and the apply form are ours, so there is no external route to build and nobody to negotiate with.',
    citation: null,
    cost: 'None.'
  },
  'Google for Jobs': {
    key: 'google_jobs',
    status: 'available',
    reason: 'Entered by emitting schema.org JobPosting JSON-LD on each single job page with five required fields, publishing an XML sitemap, and optionally calling the Indexing API. No contract and no approval for eligibility. Two traps: the structured data must sit on the single job page rather than a listing page, and expiry has to be implemented or the site risks a manual action.',
    citation: 'docs/01-diagnosis/verification-2026-08-26b.md',
    cost: 'Zero in fees. Roughly one to three developer weeks.'
  },
  'Adzuna': {
    key: 'adzuna',
    status: 'available',
    reason: 'Adzuna states it first party: provide an XML feed of all the organic jobs on your platform and it advertises them for free.',
    citation: 'docs/01-diagnosis/verification-2026-08-26b.md',
    cost: 'Zero in fees for organic placement. About one developer week for the feed and a day of admin.'
  },
  'Jooble': {
    key: 'jooble',
    status: 'available',
    reason: 'Jooble takes the same XML feed as Adzuna, through a support ticket, at zero cost.',
    citation: 'docs/01-diagnosis/verification-2026-08-26b.md',
    cost: 'Zero in fees. A day of admin on top of the feed built for Adzuna.'
  },
  'Indeed': {
    key: 'indeed',
    status: 'needs_agreement',
    reason: 'The Job Sync API is free in call fees but needs a signed developer agreement and a formal partner application, and Indeed states about six weeks. The agreement is ours to sign as an integrator rather than the retailer\'s. Single-source feeds went sponsored-only on 31 March 2026 and are being switched off through 2026 wherever an integrated applicant tracking system exists, so being an integrated system is now the only route to free organic placement at scale.',
    citation: 'E-108, docs/01-diagnosis/verification-2026-08-26b.md',
    cost: 'Zero in API fees. Employer ad spend is separate and unpublished.'
  },
  'LinkedIn': {
    key: 'linkedin',
    status: 'closed',
    reason: 'Reading applications in and scoring them against job criteria through Apply Connect requires the CUSTOMER to hold a paid Recruiter Corporate or Recruiter Professional Services licence, so this route is theirs to open and not ours. A free XML feed route for Basic Jobs exists, but LinkedIn explicitly refuses to guarantee ingestion, there is no external test environment, and feed-ingested Basic Jobs get materially worse distribution than paid Job Slots.',
    citation: 'E-102, E-103',
    cost: 'A paid licence held by the retailer.'
  }
};

/** One destination row, with the status the page prints. */
export function destinationStatus(name) {
  const d = DESTINATIONS[name];
  if (!d) {
    /* An unknown destination is not given a neutral default. A row with no
       documented route is exactly the row that must not read as available. */
    return { destination: name, key: null, status: 'unknown',
             reason: 'No route to this destination is documented anywhere in our own research.',
             citation: null, cost: null, connected: false };
  }
  return Object.assign({ destination: name, connected: false }, d);
}

/* ------------------------------------------------------------ the status ---
   Per adapter: simulated or live, what would make it live, and what it would
   need. This replaces `inventory()`, which returned the op list, a hardcoded
   `mode: 'simulated'` and a hardcoded `vendor: null`. The name changed because
   the row is a status rather than a stock list, and the vendor field is gone
   because a null vendor is one edit away from a named one.
   ------------------------------------------------------------------------- */

export function statusOf(adapterKey) {
  const a = ADAPTERS[adapterKey];
  if (!a) return null;
  const mode = modeOf(adapterKey);
  return {
    key: adapterKey,
    label: a.label,
    ops: Object.keys(a.ops),
    mode,
    /* Said out loud rather than left to be inferred from the mode, because
       "simulated" is a word somebody can read past. */
    connected: mode === 'live',
    /* Whether a real route is KNOWN TO EXIST. This is a fact about published
       documentation. It is not a claim that we have one. */
    routeKnown: a.routeKnown,
    route: a.route || null,
    citation: a.citation || null,
    requires: a.requires || null,
    note: a.note || null,
    whatWouldMakeItLive: mode === 'live'
      ? 'It is live.'
      : 'A transport module for this adapter, and a credential held by whoever the route belongs to. Neither exists, and this file holds no way to register one, so nothing here can report live over a simulator.',
    /* Only the ats adapter has per-destination rows, because only outbound
       distribution has routes that differ by where it is going. */
    destinations: adapterKey === 'ats' ? Object.keys(DESTINATIONS).map(destinationStatus) : null,
    /* Which failures this adapter can produce at all, so the page can say what
       an error on this row would mean rather than waiting to be surprised. */
    knownFailures: Object.keys(a.ops).reduce((acc, op) => {
      Object.keys(a.ops[op].failures || {}).forEach((f) => acc.push({ op, failure: f }));
      return acc;
    }, [])
  };
}

/** Every adapter's status, for the integrator surface. */
export function statuses() {
  return Object.keys(ADAPTERS).map(statusOf);
}

/* ------------------------------------------------------------ redaction ---
   Nothing sensitive should be in a payload, and this makes sure of it.

   DEFECT FIXED. The old version checked top-level keys only, so a payload
   shaped `{ candidate: { ssn: '...' } }` was written into the record verbatim.
   It now walks nested objects and arrays. The depth cap is there because a
   payload with a cycle in it would otherwise hang the request, and a hung
   request is a worse outcome than a truncated record.
   ------------------------------------------------------------------------- */

const SENSITIVE = /ssn|password|secret|token|apikey|api_key|credential|dob|date_of_birth/i;

export function redact(value, depth) {
  const d = depth || 0;
  if (value === null || value === undefined) return value;
  if (d > 6) return '[too deep to record]';
  if (Array.isArray(value)) return value.map((v) => redact(v, d + 1));
  if (typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach((k) => {
      if (SENSITIVE.test(k)) { out[k] = '[redacted]'; return; }
      out[k] = redact(value[k], d + 1);
    });
    return out;
  }
  if (typeof value === 'string' && value.length > 400) return value.slice(0, 400) + '…';
  return value;
}

/* -------------------------------------------------------------- storeId ---
   Which store a row belongs to, so the connector log can be grouped per store.

   Derived the way events.js derives it, and for the reason its header gives:
   in the previous build only the seed passed a store id, so every runtime write
   put null there and any per-store grouping silently dropped those rows while
   looking complete. events.js keeps its helper private, so this is a second
   copy of three lines. It is a second copy on purpose and it should collapse
   into one the moment that helper is exported.

   It goes one step further than events.js does, because it has to. Most
   connector calls carry an application, but `post_opening` carries only a
   requisition, and without the requisition fallback every outbound posting row
   would group to null. That is the same defect, on the one op most likely to be
   read per store.
   ------------------------------------------------------------------------- */

function storeOf(store, ctx, payload, given) {
  if (given) return given;
  if (payload.applicationId) {
    const app = store.byId('applications', ctx.tenantId, payload.applicationId);
    if (app) return app.storeId;
  }
  if (payload.requisitionId) {
    const req = store.byId('requisitions', ctx.tenantId, payload.requisitionId);
    if (req) return req.storeId;
  }
  return null;
}

/* ------------------------------------------------------------- the call ---
   Every adapter call goes through here, so every one of them is recorded.
   ------------------------------------------------------------------------- */

/**
 * Place one simulated call.
 *
 * opts:
 *   at            when it was requested. Defaults to the clock.
 *   attempt       1 unless this is a retry.
 *   retryOf       the id of the call being retried.
 *   fail          the name of a failure CONFIGURED ON THE OP. Preferred.
 *   failWith      an ad-hoc error string, for a caller with an error the op
 *                 does not know about. `retryable` must then be passed too,
 *                 because a failure whose retryability nobody stated is a
 *                 failure nobody can act on.
 *   retryable     only with failWith.
 *   storeId       overrides the derived one.
 *
 * Returns { ok, mode, call, ... }. `mode` is on the result and on the row, and
 * both come from `modeOf`, never from a literal at a call site.
 */
export function call(store, ctx, adapterKey, opName, payload, opts) {
  const o = opts || {};
  const p = payload || {};

  const adapter = ADAPTERS[adapterKey];
  if (!adapter) throw new Error('no such adapter: ' + adapterKey);
  const op = adapter.ops[opName];
  if (!op) throw new Error('adapter ' + adapterKey + ' has no op ' + opName);

  /* Required fields are checked generically off the op's own `needs` list,
     the way engine.js checks the actor allowlist off the transition's `by`
     list, so an op added later is protected without anybody remembering. A
     missing field is a throw and not a null in the record: a reference or a
     premium flag quietly derived from `undefined` is a wrong record that reads
     as a right one, and that is worse than a crash in development. */
  (op.needs || []).forEach((k) => {
    if (p[k] === undefined || p[k] === null) {
      throw new Error(adapterKey + '.' + opName + ' needs "' + k + '" and it was not passed. ' +
                      'Recording the call without it would put a reference or a flag derived from ' +
                      'undefined into the log, which reads as a real answer.');
    }
  });

  const mode = modeOf(adapterKey);
  const at = o.at != null ? o.at : ctx.clock.now();
  const attempt = o.attempt || 1;
  const request = redact(p);

  /* One key per call, from the whole payload plus the adapter, the op and the
     attempt. The attempt is in it so a retry gets its own latency and its own
     reference: a vendor issues a new reference for a new submission, and the
     old module gave the failed Jooble post and its successful retry the same
     reference because the payload was identical. */
  const key = adapterKey + '.' + opName + '|a' + attempt + '|' + stableKey(request);

  const row = {
    id: store.nextId('con'),
    tenantId: ctx.tenantId,
    adapter: adapterKey,
    adapterLabel: adapter.label,
    op: opName,
    /* Reported, never asserted. This is the field the page reads. */
    mode,
    at,
    requestedAt: at,
    respondedAt: null,
    latencyMs: null,
    status: 'pending',
    externalRef: null,
    request,
    response: null,
    error: null,
    retryable: null,
    attempt,
    retryOf: o.retryOf || null,
    applicationId: p.applicationId || null,
    candidateId: p.candidateId || null,
    /* Promoted out of the request blob. The old sources page joined postings to
       requisitions by reading `call.request.requisitionId`, which is a join
       through a field that redaction and truncation are both allowed to change. */
    requisitionId: p.requisitionId || null,
    storeId: storeOf(store, ctx, p, o.storeId),
    unimplemented: null
  };
  /* Inserted before the outcome is known, so a process that dies mid-call
     leaves a pending row rather than no evidence that a call was ever made. */
  store.insert('connectorCalls', row);

  const failure = resolveFailure(op, o);
  if (failure) {
    const latencyMs = o.failLatencyMs != null
      ? o.failLatencyMs
      : spread(key + '|fail', failure.latency[0], failure.latency[1]);
    Object.assign(row, {
      status: 'failed',
      latencyMs,
      /* DEFECT FIXED. The old module set `latencyMs` from the hash and
         `respondedAt` from `at + (failLatencyMs || 800)`, so whenever the
         caller passed no explicit failure latency the two disagreed and any
         page measuring the gap between the timestamps got a different number
         from the one in the latency field. There is one number now. */
      respondedAt: at + latencyMs,
      error: failure.error,
      retryable: failure.retryable
    });
    store.markDirty();
    return { ok: false, mode, call: row, error: failure.error,
             retryable: failure.retryable, latencyMs };
  }

  const latencyMs = spread(key, op.latency[0], op.latency[1]);
  const externalRef = op.echoRef
    ? p.externalRef
    : ref(op.refPrefix, op.refKey(p) + '|a' + attempt);
  const data = op.data(p, { at, adapter: adapterKey, op: opName, attempt });

  Object.assign(row, {
    status: 'ok',
    latencyMs,
    respondedAt: at + latencyMs,
    externalRef,
    response: data,
    unimplemented: op.unimplemented || null
  });
  store.markDirty();

  return { ok: true, mode, call: row, externalRef, data, latencyMs,
           unimplemented: op.unimplemented || null };
}

/**
 * Which failure, if any, this call is being told to produce.
 *
 * Failure is configured on the op rather than special-cased at the call site.
 * The one real error string we hold, a Jooble feed rejection, was written into
 * the seed in the old build, so the only place that knew the shape of an ats
 * feed error was a fixture. It now lives on `ats.post_opening`, which is the
 * only thing that can produce it, and the seed asks for it by name.
 *
 * Nothing fails at random, and nothing fails unless a caller asked.
 */
function resolveFailure(op, o) {
  if (o.fail) {
    const f = (op.failures || {})[o.fail];
    if (!f) {
      throw new Error('this op has no failure called "' + o.fail + '". The failures it can produce are: ' +
                      (Object.keys(op.failures || {}).join(', ') || 'none') + '. ' +
                      'Inventing an error string a vendor has never returned to us is the thing this ' +
                      'registry exists to stop.');
    }
    return { error: f.error, retryable: f.retryable !== false, latency: f.latency || [200, 1200] };
  }
  if (o.failWith) {
    /* An ad-hoc string is allowed, because a caller may know about an error the
       op does not. It has to state retryability, because a failed row whose
       retryability is null tells whoever reads it nothing about what to do. */
    if (o.retryable === undefined) {
      throw new Error('failWith needs `retryable` passed with it. A failure nobody classified is a ' +
                      'failure nobody can act on. If this error is one the op should know about, ' +
                      'configure it on the op and pass `fail` instead.');
    }
    return { error: o.failWith, retryable: !!o.retryable, latency: [200, 1200] };
  }
  return null;
}

/** Every failure any adapter can produce, so a test can walk them all. */
export function knownFailures() {
  const out = [];
  Object.keys(ADAPTERS).forEach((a) => {
    Object.keys(ADAPTERS[a].ops).forEach((op) => {
      const f = ADAPTERS[a].ops[op].failures || {};
      Object.keys(f).forEach((name) => {
        out.push({ adapter: a, op, failure: name, error: f[name].error,
                   retryable: f[name].retryable !== false });
      });
    });
  });
  return out;
}
