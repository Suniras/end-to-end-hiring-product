/* ============================================================================
   ops/api.js  ·  the routes, and ONE fetch helper

   THE ENVELOPE, ONCE. Every reply is wrapped as { ok, now, simNow, data } and
   the payload is in `data`. A refusal is NOT wrapped the same way: `bad()` on
   the server answers { ok:false, error } with no `data` at all, and it hangs
   its extras at the TOP LEVEL, so a 409 carries `allowed` and `bar` beside
   `ok` rather than inside a payload.

   Three separate blockers in this project came from one client reading one
   response shape wrongly. The worst of them told a candidate their
   application had been REFUSED when it had in fact been created, because the
   caller tested `body.ok` after the unwrap and saw undefined. So:

     `ok` MEANS ONE THING, IT IS COMPUTED ONCE HERE, AND NO CALLER TESTS
     ANYTHING ELSE.

   It folds the HTTP status and the envelope's own declared `ok` together. A
   200 carrying ok:false is a failure. A 200 carrying a payload with no `ok`
   field of its own is a success. Callers read `r.ok`, `r.data` and `r.error`.

   THE REFUSAL IS THE PRODUCT'S BEST COPY AND IT TRAVELS VERBATIM. "Check
   returned cannot move to Rejected. The legal moves from here are: Onboarding
   ready to start, Withdrew." No client-side rewrite, no friendlier sentence,
   no "Something went wrong".

   THE BODY KEY ON A TRANSITION IS `to`, NOT `state`. Measured against the
   running server on 9 September 2026: posting { state: "REJECTED" } returns
   "Which state to move it to has to be named." The written contract said
   `state`. It is `to`. That is exactly the class of mistake the paragraph
   above is about, so the key is named in one place here and nowhere else.
   ============================================================================ */

export const ROUTES = {
  session:      () => '/api/session',
  sessionEnd:   () => '/api/session/end',
  health:       () => '/api/health',
  work:         () => '/api/work',
  applications: () => '/api/applications',
  application:  (id) => '/api/applications/' + encodeURIComponent(id),
  transition:   (id) => '/api/applications/' + encodeURIComponent(id) + '/transition',
  taskComplete: (id, key) => '/api/applications/' + encodeURIComponent(id) +
                             '/tasks/' + encodeURIComponent(key) + '/complete',
  exceptions:   () => '/api/exceptions',
  resolve:      (id) => '/api/exceptions/' + encodeURIComponent(id) + '/resolve',
  screening:    (id) => '/api/screening/' + encodeURIComponent(id),
  compliance:   () => '/api/compliance',
  funnel:       () => '/api/funnel',
  metrics:      () => '/api/metrics',
  metricStores: () => '/api/metrics/stores',
  sources:      () => '/api/sources',
  advance:      () => '/api/sim/advance'
};

/* The simulated present, kept from the last reply. Every reply carries `now`
   and it is the demo's own clock, which advances in real time from an anchor
   in August 2026. Nothing here ever calls Date.now() for a business instant:
   a countdown measured against the reader's machine would be four months out. */
let SIM_NOW = null;
let SIM_READ_AT = null;

/** The simulated present, carried forward in real time between replies. */
export function now() {
  if (SIM_NOW == null) return Date.now();
  return SIM_NOW + (Date.now() - SIM_READ_AT);
}

export function haveClock() { return SIM_NOW != null; }

/**
 * One request. Never throws.
 *
 * A dropped connection, a 401, a 409 refusal and a 500 are all things a
 * surface has to render rather than crash on.
 */
export async function ask(url, body, method) {
  let res, text;
  try {
    res = await fetch(url, body === undefined && !method
      ? { headers: { accept: 'application/json' }, credentials: 'same-origin' }
      : { method: method || 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          credentials: 'same-origin',
          body: body === undefined ? undefined : JSON.stringify(body) });
    text = await res.text();
  } catch (e) {
    return { ok: false, status: 0, data: null, allowed: [], problems: [],
             error: 'The request to ' + url + ' did not complete. ' +
                    String((e && e.message) || e) };
  }

  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch (e) { payload = { raw: text }; }
  const obj = payload && typeof payload === 'object' ? payload : {};

  /* The clock, from whichever reply arrived last. */
  if (typeof obj.now === 'number') { SIM_NOW = obj.now; SIM_READ_AT = Date.now(); }

  const declared = 'ok' in obj ? obj.ok !== false : true;
  const good = res.ok && declared;
  return {
    ok: good,
    status: res.status,
    /* `data` when the envelope has one. A refusal has none, and a caller
       reading `.data` on a refusal gets null rather than a lie. */
    data: 'data' in obj ? obj.data : (good ? payload : null),
    now: typeof obj.now === 'number' ? obj.now : null,
    error: good ? null
      : (obj.error || obj.reason ||
         'The server answered ' + res.status + ' and gave no reason.'),
    /* Top-level extras on a refusal. `allowed` is a list of objects, each
       { to, label, needs, needsReason }, not a list of strings. */
    allowed: Array.isArray(obj.allowed) ? obj.allowed : [],
    bar: obj.bar || null,
    problems: Array.isArray(obj.problems) ? obj.problems : [],
    hint: obj.hint || null
  };
}

/* ============================================================================
   ONE RETRY WHEN THE SESSION HAS GONE

   THE DEFECT, SEEN ON SCREEN. The operator session lives in the server's
   memory. Restart the process, or leave the tab open past the session's life,
   and the cookie the browser still holds means nothing. The next thing a
   person pressed painted a red box reading "The queue did not load." over
   "This route needs an operator session. POST the demo token to
   /api/session." That is the server's own sentence, correctly rendered, and it
   is addressed to a developer rather than to a store manager.

   So a 401 is recoverable exactly once per request: the shell is asked to sign
   in again and the same call is made a second time. If that fails, the refusal
   renders as it always did, because at that point something is genuinely
   wrong and hiding it would be worse.

   The handler is registered by app.js rather than living here, because the
   token and the acting viewer belong to the shell and this module must not
   know either. */
let recover = null;
let recovering = null;

export function onUnauthorized(fn) { recover = fn; }

async function askOnce(url, body, method) {
  const first = await ask(url, body, method);
  if (first.status !== 401 || !recover) return first;
  /* One sign-in at a time. Four surfaces firing at once would otherwise mint
     four sessions and race over the cookie. */
  if (!recovering) recovering = Promise.resolve(recover()).finally(() => { recovering = null; });
  const ok2 = await recovering;
  if (!ok2) return first;
  return ask(url, body, method);
}

export function get(url) { return askOnce(url); }
export function post(url, body) { return askOnce(url, body || {}); }

/** Move one application. The key is `to`. See the header. */
export function move(applicationId, to, reason) {
  const b = { to };
  if (reason) b.reason = reason;
  return post(ROUTES.transition(applicationId), b);
}

export function completeTask(applicationId, key, reason) {
  const b = {};
  if (reason) b.reason = reason;
  return post(ROUTES.taskComplete(applicationId, key), b);
}

export function resolveException(exceptionId, reason, resolution) {
  return post(ROUTES.resolve(exceptionId), { reason, resolution });
}
