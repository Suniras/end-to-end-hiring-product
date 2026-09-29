/* ============================================================================
   index.js  ·  the server

   Express, static files, and the API. Small on purpose: the interesting code is
   in lib, and this file only routes, authorises and shapes responses.

   Run it:   npm start        then http://localhost:4173
   Reseed:   POST /api/reset  or delete data/state.json and restart

   FOUR THINGS THIS FILE IS RESPONSIBLE FOR.

   1. THE ENGINE IS THE ONLY WAY ANYTHING MOVES. Every write route ends in
      WF.transition, WF.settle or an events.js writer. Nothing here sets
      `app.state` and nothing here writes a decision, an offer or a shift by
      hand. A route that moved a row itself would be a second workflow engine
      with none of the guards, and the guards are the product.

      Until 8 September there was no write route at all. Fifty transitions
      existed and none of them was reachable over HTTP, so eight applications
      sat in DECISION_PENDING that no interface could approve or reject. All
      eight reviewers found it. That is what the section marked THE WRITES is.

   2. WHO IS ASKING IS NOT A QUERY PARAMETER. It used to be: `?role=fieldhr`
      returned Dana Whitfield and `?role=district` returned a person who is not
      in the tenant record at all. The engine refuses APPROVED and REJECTED to
      anything but `actor.type === 'human'`, so the one control this product is
      sold on was about to be enforced against a string the caller supplied.
      Identity now comes from a session cookie minted against a token that only
      somebody who can read the server console has. Scope comes from the same
      place, because a store manager reading another store's candidate is the
      same problem in a quieter shape.

   3. THE VOICE PROVIDER'S KEY MATERIAL NEVER REACHES THE BROWSER. The browser
      asks US for a call, we ask the provider, and we hand back only the LiveKit
      server and its participant token, which is scoped to one room. The shipped
      playground this integration was read from talks to the provider directly
      from the browser and its own comment admits that ships a workspace id to
      the client. We do not repeat that.

      A call id is a secret: the provider's transcript endpoint needs NO AUTH,
      verified live, so anybody holding a call id can read that call's words.
      Call ids live server side. The room name and the participant name are
      withheld for the same reason, one step further out: either may be derived
      from the call id and there is no recorded example proving otherwise.
      publicview.js bans all three so the guard catches an accident.

   4. NOTHING OPEN COSTS MONEY OR CHANGES THE WORLD. POST /api/public/call
      reaches a paid vendor and used to take an application id and nothing else,
      on ids handed out sequentially by a list route that was also open. The
      capability is now an opaque single-use token in an HttpOnly cookie, the
      workflow state is part of the gate, and every open route is rate limited
      per address. The clock and the reseed are operator routes, and the server
      binds to loopback unless somebody names a host.
   ============================================================================ */

import express from 'express';
import compression from 'compression';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { Store } from './lib/store.js';
import { makeClock, freshAnchors, fmtDur, HOUR } from './lib/clock.js';
import * as WF from './lib/engine.js';
import './lib/effects.js';                 // importing registers them and checks the table
import * as EV from './lib/events.js';
import * as PUB from './lib/publicview.js';
import * as WQ from './lib/workqueue.js';
import * as INTAKE from './lib/intake.js';
import * as AGENTX from './lib/agentx.js';
import * as M from './lib/metrics.js';
import * as COMPLY from './lib/compliance.js';
import * as CONN from './lib/connectors.js';
import * as LIVE from './lib/livecall.js';
import * as SCREEN from './lib/screening.js';
import * as PAGEMETA from './lib/pagemeta.js';
import { ONBOARDING_TASKS, PRE_SHIFT_TASKS } from '../domain/states.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const WEB = path.join(ROOT, 'web');
const DB_FILE = process.env.DEMO_DB_FILE || path.join(ROOT, 'data', 'state.json');
const PORT = Number(process.env.PORT || 4173);

/* LOOPBACK BY DEFAULT. `app.listen(PORT)` binds every interface, so on demo day
   the laptop's whole wifi network could move the clock four months or reseed the
   database. Widening it is now a deliberate act with a name on it. */
const HOST = process.env.HOST || '127.0.0.1';

/* ------------------------------------------------------------- the world --- */

const store = new Store(DB_FILE);
const loaded = store.load();
if (!store.db.meta.anchors) store.db.meta.anchors = freshAnchors();
const clock = makeClock(() => store.db.meta.anchors);

let TENANT = null, TENANT_NAME = null, SEED = null;
async function boot() {
  if (!loaded || !store.db.meta.seededAt) {
    const seed = await loadSeed();
    if (seed) {
      store.reset();
      store.db.meta.anchors = freshAnchors();
      await seed.seed(store, { clock });
      store.db.meta.seededAt = Date.now();
      store.flushNow();
    }
  }
  if (!SEED) await loadSeed();
  const t = store.db.tenants[0];
  TENANT = t ? t.id : null;
  TENANT_NAME = t ? t.name : null;
  buildViewers();
}

async function loadSeed() {
  if (SEED) return SEED;
  try { SEED = await import('./lib/seed.js'); return SEED; }
  catch (e) {
    console.log('  no seed module yet (' + String(e.message).slice(0, 60) + '). Serving an empty database.');
    return null;
  }
}

/* ============================================================================
   WHO IS ASKING

   The hiring decision is human-only in the transition table, the audit trail is
   the only evidence that a person made it, and both defences rest entirely on
   the record. So the record's actor may not be asserted by the caller.

   HOW THE DEMO STAYS ONE COMMAND. The token is read from DEMO_TOKEN, or minted
   at boot and printed on the console. The presenter's browser posts it once to
   /api/session and holds an HttpOnly SameSite=Strict cookie after that. Nothing
   about the demo changes; the difference is that somebody else on the wifi
   cannot drive it.

   WHAT THIS IS NOT. It is a demonstration gate, not a sign-in system. There is
   one shared secret, no passwords, no lockout and no per-person credential. A
   real deployment needs a badge number and a PIN for a store, a thirty minute
   idle timeout because the back office machine is unattended half the day, and
   both the real identity and the assumed one stamped on every audit row.
   ============================================================================ */

const OPERATOR_TOKEN = process.env.DEMO_TOKEN || crypto.randomBytes(16).toString('hex');
const TOKEN_IS_GENERATED = !process.env.DEMO_TOKEN;
const SESSION_COOKIE = 'fh_session';
const SESSION_TTL_MS = 12 * HOUR;

/* In memory on purpose. A restart signs everybody out, which for a demo is the
   right direction of failure. */
const sessions = new Map();

/**
 * The people who can act, derived from the tenant record rather than written
 * here.
 *
 * WHY DERIVED. This file used to hand-write three viewers, one of whom, a
 * district manager called Priya Raman, appears nowhere in the tenant and shared
 * a name with a store manager in the decision rows, so the same person held two
 * job titles on two screens at once. Now every viewer is somebody the record
 * names, with the role the record gives them, and there is no district viewer
 * because the record names no district manager. An invented viewer is an
 * invented person.
 */
let VIEWERS = {};
function buildViewers() {
  VIEWERS = {};
  if (!TENANT) return;
  const tenant = store.all('tenants', TENANT)[0] || {};
  const people = tenant.people || {};
  const stores = store.all('stores', TENANT);
  const home = stores.find((s) => s.home) || stores[0] || null;

  Object.keys(people).forEach((key) => {
    const p = people[key];
    if (!p || !p.name) return;
    /* A store manager sees one store. Field HR sees the stores that name them,
       which is real data on the store row rather than a district invented to
       give them something to hold. */
    const scoped = p.storeId ? [p.storeId]
      : stores.filter((s) => s.fieldHR === p.name).map((s) => s.id);
    VIEWERS[key] = {
      key,
      actor: { type: 'human', name: p.name, role: p.role },
      storeIds: scoped,
      scopeLabel: p.scope || (scoped.length === 1 ? scoped[0] : scoped.length + ' stores')
    };
  });

  /* Two aliases, so the demo can ask for "the manager" and "field HR" without
     knowing the seed's key names. */
  if (home && people[home.key]) VIEWERS.manager = VIEWERS[home.key];
  const homeHr = Object.keys(VIEWERS).find((k) => {
    const v = VIEWERS[k];
    return v.actor.role === 'Field HR' && home && v.storeIds.indexOf(home.id) >= 0;
  });
  if (homeHr) VIEWERS.fieldhr = VIEWERS[homeHr];
}

function readCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function setCookie(res, name, value, maxAgeMs) {
  /* HttpOnly so no script can read it, SameSite=Strict so no other site can
     make the browser spend a call or approve a candidate on the viewer's
     behalf. Not Secure, because the demo runs on http://localhost and a Secure
     cookie would silently never be set. Add it when there is a domain. */
  res.append('Set-Cookie', name + '=' + encodeURIComponent(value) +
    '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + Math.round(maxAgeMs / 1000));
}

function clearCookie(res, name) {
  res.append('Set-Cookie', name + '=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
}

function sessionOf(req) {
  const id = readCookies(req)[SESSION_COOKIE] || req.headers['x-demo-session'] || null;
  if (!id) return null;
  const s = sessions.get(id);
  if (!s) return null;
  if (Date.now() > s.expiresAt) { sessions.delete(id); return null; }
  return s;
}

/**
 * The actor and the scope, from the session and from nowhere else.
 *
 * `scope` travels with the context because every producer needs it and because
 * a producer that takes a store id from the request is a producer a client can
 * point at another store. U-06 and U-43.
 */
function contextFor(req) {
  const s = sessionOf(req);
  const v = (s && VIEWERS[s.viewer]) || null;
  return {
    tenantId: TENANT, tenantName: TENANT_NAME, clock,
    actor: v ? v.actor : { type: 'human', name: null, role: null },
    viewer: v ? v.key : null,
    scope: {
      storeIds: v ? v.storeIds : [],
      /* A viewer holding every store in the tenant is reported as tenant scope,
         so a page can say which it is showing rather than guessing. */
      kind: v && v.storeIds.length === 1 ? 'store' : 'stores',
      label: v ? v.scopeLabel : null
    }
  };
}

/** A context with no person attached, for candidate-facing routes. */
function publicContext() {
  return { tenantId: TENANT, tenantName: TENANT_NAME, clock,
           actor: { type: 'external', name: 'Careers page' },
           scope: { storeIds: [], kind: 'none', label: null } };
}

/** A context for work the product does to itself, like the retention sweep. */
function systemContext(name) {
  return { tenantId: TENANT, tenantName: TENANT_NAME, clock,
           actor: { type: 'system', name: name || 'Retention sweep' },
           scope: { storeIds: [], kind: 'tenant', label: null } };
}

/** Is this row inside the acting viewer's scope. */
function inScope(ctx, row) {
  if (!row) return false;
  if (!ctx.scope || !ctx.scope.storeIds.length) return false;
  return ctx.scope.storeIds.indexOf(row.storeId) >= 0;
}

/* ---------------------------------------------------------------- the app --- */

const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '256kb' }));

/* No caching on the API, and content-hashed filenames on the built assets.
   Browser caching produced false measurements repeatedly on the previous build
   and the README warned about it for weeks before it caught somebody again. */
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

const ok = (res, data, extra) =>
  res.json(Object.assign({ ok: true, now: clock.now(), simNow: new Date(clock.now()).toISOString() },
                         extra || {}, { data }));
const bad = (res, code, error, extra) =>
  res.status(code).json(Object.assign({ ok: false, error }, extra || {}));

/* ------------------------------------------------------------ rate limit ---
   A fixed window per address per bucket. Small and in memory, which is the
   right size for one process serving one demonstration.

   THE NUMBERS ARE PRODUCT CHOICES WITH NO SOURCE. They are set so a person
   filling in a form never meets them and a script walking ids does. The call
   bucket is the tightest because it is the one that spends money, and it is
   the second control rather than the first: a call needs a grant, and a script
   cannot get one.

   BEHIND A PROXY EVERY CALLER SHARES ONE BUCKET, because the forwarded address
   header is not trusted and must not be: a limit a caller can reset by writing
   a header is not a limit. If the demo goes behind a load balancer, that is
   the thing to fix, deliberately, by naming the proxy.
   -------------------------------------------------------------------------- */

const LIMITS = {
  call:    { max: 8,   windowMs: 10 * 60 * 1000 },
  apply:   { max: 20,  windowMs: 10 * 60 * 1000 },
  consent: { max: 40,  windowMs: 10 * 60 * 1000 },
  signin:  { max: 10,  windowMs: 10 * 60 * 1000 },
  read:    { max: 240, windowMs: 60 * 1000 }
};
const buckets = new Map();

function addressOf(req) {
  /* No proxy header is trusted. An X-Forwarded-For a caller can write is a rate
     limit a caller can reset. */
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : 'unknown';
}

function limited(req, res, name) {
  const cfg = LIMITS[name];
  if (!cfg) return false;
  const key = name + '|' + addressOf(req);
  const now = Date.now();
  /* Swept when it grows, so a scan cannot turn the limiter itself into the
     leak. Expired windows carry no information worth keeping. */
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => { if (now >= v.resetAt) buckets.delete(k); });
  }
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) { b = { n: 0, resetAt: now + cfg.windowMs }; buckets.set(key, b); }
  b.n++;
  if (b.n <= cfg.max) return false;
  const waitS = Math.ceil((b.resetAt - now) / 1000);
  res.setHeader('Retry-After', String(waitS));
  bad(res, 429, 'Too many requests from this address. Try again in ' + waitS + ' seconds.');
  return true;
}

/* --------------------------------------------------------------- the gate ---
   FAIL CLOSED BY DEFAULT. Everything under /api needs a session except the
   candidate surface and the two routes that exist to get one. A route added
   anywhere else inherits the gate rather than remembering to ask for it, which
   is the only arrangement that survives ten new pages.
   -------------------------------------------------------------------------- */

const OPEN_ROUTES = ['/api/health', '/api/session'];

app.use('/api', (req, res, next) => {
  /* The mount point is stripped off `req.path` inside a mounted middleware, so
     this has to put it back. Reading `req.path` alone matched nothing and gated
     the candidate surface as well, which is the right direction to fail in and
     still wrong. */
  const p = (req.baseUrl || '') + req.path;
  if (p.indexOf('/api/public/') === 0 || OPEN_ROUTES.indexOf(p) >= 0) return next();
  const s = sessionOf(req);
  if (!s) {
    return bad(res, 401, 'This route needs an operator session. POST the demo token to /api/session.',
               { hint: TOKEN_IS_GENERATED ? 'The token was printed on the server console at boot.' : null });
  }
  if (!VIEWERS[s.viewer]) {
    return bad(res, 403, 'That viewer no longer exists in the tenant record. Sign in again.');
  }
  if (req.method === 'GET' && limited(req, res, 'read')) return;
  next();
});

/* -------------------------------------------------------------- sessions --- */

/**
 * The scope, with the places in it.
 *
 * The operator page header has to read "#0417 Ridgeway, Ridgeway OH" and the
 * scope carried a label and a list of ids, so the browser had a store number
 * and no town. Field HR holds several stores, so this is a list and the header
 * prints the one store when there is one and the count when there are more.
 */
function scopeOf(v) {
  const stores = (v.storeIds || [])
    .map((id) => (TENANT ? store.byId('stores', TENANT, id) : null))
    .filter(Boolean)
    .map((s) => ({ id: s.id, name: s.name, city: s.city || null, state: s.state || null,
                   manager: s.manager || null }));
  return { storeIds: v.storeIds, label: v.scopeLabel, stores };
}

/** The tenant, named once, so no surface hard-codes the retailer. */
function orgHead() {
  const t = store.db.tenants[0];
  return { name: (t && t.org && t.org.name) || (t && t.name) || null };
}

app.post('/api/session', (req, res) => {
  if (limited(req, res, 'signin')) return;
  const b = req.body || {};
  const given = String(b.token || '');
  /* Constant time, so the token cannot be guessed a character at a time. */
  const a = Buffer.from(given);
  const want = Buffer.from(OPERATOR_TOKEN);
  const good = a.length === want.length && crypto.timingSafeEqual(a, want);
  if (!good) {
    /* Recorded, because a run of refusals from one address is the only signal
       this gate produces. It needs a tenant to write against, and with an empty
       database there is none, so the refusal is still a refusal. */
    if (TENANT) {
      EV.auditEvent(store, systemContext(), {
        action: 'session.refused', actorType: 'external', actor: addressOf(req),
        why: 'The demo token did not match.', outcome: 'refused', source: 'ui'
      });
      store.flushNow();
    }
    return bad(res, 401, 'That token is not right.');
  }
  const viewer = VIEWERS[b.viewer] ? String(b.viewer) : 'manager';
  if (!VIEWERS[viewer]) return bad(res, 503, 'There are no viewers yet, because the database is empty.');
  const id = crypto.randomBytes(24).toString('base64url');
  sessions.set(id, { viewer, at: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS });
  setCookie(res, SESSION_COOKIE, id, SESSION_TTL_MS);
  const v = VIEWERS[viewer];
  EV.auditEvent(store, systemContext(), {
    action: 'session.opened', actorType: 'system', actor: v.actor.name,
    why: 'Signed in as ' + v.actor.name + ', ' + v.actor.role + '.',
    detail: { viewer, storeIds: v.storeIds }, source: 'ui'
  });
  store.flushNow();
  ok(res, { viewer, actor: v.actor, scope: scopeOf(v), org: orgHead() });
});

app.get('/api/session', (req, res) => {
  const ctx = contextFor(req);
  ok(res, { viewer: ctx.viewer, actor: ctx.actor,
            scope: ctx.viewer && VIEWERS[ctx.viewer] ? scopeOf(VIEWERS[ctx.viewer]) : ctx.scope,
            org: orgHead(),
            viewers: Object.keys(VIEWERS).map((k) => ({
              key: k, name: VIEWERS[k].actor.name, role: VIEWERS[k].actor.role,
              stores: VIEWERS[k].storeIds.length
            })) });
});

app.post('/api/session/end', (req, res) => {
  const id = readCookies(req)[SESSION_COOKIE];
  if (id) sessions.delete(id);
  clearCookie(res, SESSION_COOKIE);
  ok(res, { signedOut: true });
});

/* -------------------------------------------------------------- health --- */

/* OPEN, AND THEREFORE THIN. It used to publish the whole database's row counts,
   the voice vendor's host, the agent id and the names of the environment
   variables the server reads, to anybody who could reach the port. */
app.get('/api/health', (req, res) => {
  ok(res, {
    seeded: !!store.db.meta.seededAt,
    tenant: TENANT_NAME,
    voice: AGENTX.publicStatus(),
    states: Object.keys(WF.STATES).length,
    transitions: WF.TRANSITIONS.length
  });
});

/* The operator half of the same question, behind the gate. */
app.get('/api/view/health', (req, res) => {
  const ctx = contextFor(req);
  ok(res, { sizes: store.sizes(ctx.tenantId), voice: AGENTX.status(),
            model: { states: Object.keys(WF.STATES).length, transitions: WF.TRANSITIONS.length },
            sessions: sessions.size });
});

app.get('/api/voice/status', (req, res) => ok(res, AGENTX.status()));

/* ------------------------------------------------- candidate facing reads --- */

app.get('/api/public/careers', (req, res) => {
  try { ok(res, PUB.careers(store, publicContext(), req.query)); }
  catch (e) { bad(res, 500, String(e.message)); }
});

app.get('/api/public/job', (req, res) => {
  try {
    const out = PUB.applyForm(store, publicContext(), { requisitionId: req.query.requisitionId });
    if (out.ok === false) return bad(res, 404, out.error);
    ok(res, out);
  } catch (e) { bad(res, 500, String(e.message)); }
});

app.get('/api/public/disclosure', (req, res) => {
  /* FLAT, like every other route. This used to return { disclosure, clock },
     which was the only nested payload in the API, and it broke three things at
     once: the client read `id` off the wrapper so the consent POST sent
     undefined and was refused, and it read `paragraphs` off the wrapper so all
     six statutory notice paragraphs rendered empty. The candidate then accepted
     a notice they had never been shown, or rather could not accept it at all.

     Six independent reviewers found this as the top blocker. One inconsistent
     envelope was worth more damage than any missing feature.

     THE CLOCK IS THE COMPLIANCE MODULE'S, not a fourth hand-written copy of the
     shape. There were three sets of field names for one clock: this route sent
     startsAt, required, label and citation, the client read dueAt, leftMs, days
     and title, and compliance.js computed the real thing under a fifth name. */
  ok(res, Object.assign({}, PUB.DISCLOSURE, {
    digest: PUB.disclosureDigest(),
    clock: COMPLY.projectedNoticeClock(clock.now())
  }));
});

/* ------------------------------------------------ candidate facing writes --- */

app.post('/api/public/consent', (req, res) => {
  if (limited(req, res, 'consent')) return;
  const b = req.body || {};
  if (b.accepted !== true) return bad(res, 400, 'The disclosure has to be accepted before the form opens.');
  if (b.disclosureId !== PUB.DISCLOSURE.id) return bad(res, 400, 'Unknown disclosure.');
  const ctx = publicContext();
  const cs = EV.recordConsent(store, ctx, {
    disclosureId: PUB.DISCLOSURE.id,
    disclosureVersion: b.disclosureVersion || PUB.DISCLOSURE.version,
    /* The digest of the words, computed here rather than accepted from the
       client, because a client that can name the notice it showed can name one
       it did not. */
    disclosureDigest: PUB.disclosureDigest(),
    accepted: true,
    /* This is an input to an automated decision system, which is what sets the
       four year retention rather than the one year an application would get. */
    dataClass: 'aedt_input',
    retentionClass: 'aedt_4y',
    basis: 'Shown before the form and accepted. California FEHA, four years from collection.'
  });
  store.flushNow();
  ok(res, { consentId: cs.id, deleteAfter: cs.deleteAfter, retentionClass: cs.retentionClass,
            disclosureDigest: cs.disclosureDigest });
});

app.post('/api/public/apply', async (req, res) => {
  if (limited(req, res, 'apply')) return;
  const b = req.body || {};
  if (!b.consentId) return bad(res, 400, 'The disclosure has to be accepted before an application can be created.');
  const ctx = publicContext();
  const cs = store.byId('consents', ctx.tenantId, b.consentId);
  if (!cs || !cs.accepted) return bad(res, 400, 'That consent record does not exist.');
  try {
    const out = INTAKE.apply(store, ctx, {
      requisitionId: b.requisitionId, form: b.form, formMs: b.formMs, consentId: b.consentId
    });
    store.flushNow();
    if (!out.ok) return bad(res, 400, out.error, { problems: out.problems || [] });

    /* THE CAPABILITY IS THE COOKIE, NOT THE ID. `applicationId` is sequential,
       the list route that published every id was open, and the comment that
       used to sit here said the id was random and unguessable. It is neither. A
       script walking app_0001 upward was a vendor bill and a stack of phone
       calls to real people. The browser now holds an opaque single-use token
       that names one application, and the call route accepts nothing else. */
    const grant = grantCall(out.applicationId);
    setCookie(res, CALL_COOKIE, grant, 2 * HOUR);

    const payload = {
      applicationId: out.applicationId,
      /* Six characters somebody can read out. The id is a row count and tells
         anybody looking over their shoulder how many people applied here. */
      reference: out.reference || null,
      firstName: out.firstName,
      state: out.state, stateLabel: out.stateLabel,
      duplicate: !!out.duplicate,
      eligibility: out.eligibility,
      job: out.job,
      /* Saved round trip on the demo's critical path: the confirmation needs to
         know which call methods exist and used to ask a second time. Same shape
         as /call/methods, so the page reads one thing either way. */
      transport: methodsPayload(await outboundNow()),
      /* THE QUESTION EVERY APPLICANT ASKS, answered from the measurement rather
         than from a promise. Null where there is not enough data to say, and
         the surface prints nothing rather than a number nobody measured. */
      whenWeCall: whenWeCall(ctx)
    };
    /* Through the guard, which it was not before. `heldForPerson` used to ride
       out of here as a working do-not-rehire lookup for anybody with a name and
       a birthday. */
    PUB.assertClean(payload, 'apply');
    ok(res, payload);
  } catch (e) { bad(res, 500, String(e.message)); }
});

/* ------------------------------------------------------- the two methods ---
   WHY THIS IS CACHED. The outbound answer is a live read of the workspace's SIP
   trunks, and the apply response carries it so the confirmation does not have
   to ask a second time on the demo's critical path. An application must never
   be held up by a provider that is slow, so the read has a deadline and the
   answer is reused for a minute.

   The timeout is a product choice with no source. It is set at the point where
   a person filling in a form would notice the wait.
   -------------------------------------------------------------------------- */

const OUTBOUND_TTL_MS = 60 * 1000;
const OUTBOUND_DEADLINE_MS = 1200;
let outboundCache = null;

async function outboundNow() {
  if (outboundCache && Date.now() - outboundCache.at < OUTBOUND_TTL_MS) return outboundCache.value;
  const timeout = new Promise((resolve) => {
    const t = setTimeout(() => resolve({
      ready: false, timedOut: true,
      why: 'The voice provider did not answer in time, so whether a phone call can be placed is not known.'
    }), OUTBOUND_DEADLINE_MS);
    if (t && t.unref) t.unref();
  });
  const value = await Promise.race([AGENTX.outboundReady(), timeout]);
  /* A timeout is not cached. It says nothing about the workspace and caching it
     would turn one slow response into a minute of wrong answers. */
  if (!value.timedOut) outboundCache = { at: Date.now(), value };
  return value;
}

/** The two call methods, in the one shape both routes answer with. */
function methodsPayload(out) {
  const st = AGENTX.publicStatus();
  return {
    browser: { available: st.available, why: st.why },
    outbound: {
      available: !!(st.available && out && out.ready),
      /* The provider's own sentence wherever there is one. This route used to
         prefix its own copy of the same words, so a candidate read "No voice
         transport is configured. No voice transport is configured, so..." */
      why: !st.available ? st.why
        : (out && out.ready ? null
          : (out && out.why ? out.why : 'The workspace has no outbound number.'))
    },
    /* {available, why} and nothing else. It used to publish the vendor host, the
       agent id and the names of the environment variables the server reads, on a
       route under /api/public/ that an applicant's browser calls. */
    transport: st
  };
}

/**
 * When we will call, from the measurement rather than from a promise.
 *
 * Null under the reportable sample size, and the surface then prints nothing.
 * "Nobody tells me when I will be called" was the candidate reviewer's first
 * finding, and the product already computed the answer for operators only.
 */
function whenWeCall(ctx) {
  try {
    const roll = M.rollup(store, ctx, {});
    const span = roll && roll.spans && roll.spans.appliedToScreen;
    if (!span || span.n == null || span.n < M.MIN_REPORTABLE_N || span.median == null) return null;
    return { medianMs: span.median, n: span.n, label: fmtDur(span.median),
             note: 'The middle of ' + span.n + ' applications already screened at this retailer. ' +
                   'Yours may be quicker or slower.' };
  } catch (e) { return null; }
}

/* --------------------------------------------------------- the live call ---
   U-92. BOTH methods are offered, browser first and outbound second. The
   outbound leg needs a SIP trunk on the workspace and there is not one yet, so
   it is rendered and disabled with the real reason rather than hidden.
   -------------------------------------------------------------------------- */

const CALL_COOKIE = 'fh_apply';
const grants = new Map();

/** A one-time capability for one application. */
function grantCall(applicationId) {
  const t = crypto.randomBytes(24).toString('base64url');
  grants.set(t, { applicationId, at: Date.now(), used: false });
  return t;
}

app.get('/api/public/call/methods', async (req, res) => {
  ok(res, methodsPayload(await outboundNow()));
});

app.post('/api/public/call', async (req, res) => {
  if (limited(req, res, 'call')) return;
  const b = req.body || {};
  const ctx = publicContext();

  /* THE GRANT, FIRST. Nothing about the application is read until the caller has
     proved it is the browser that created it. */
  const token = readCookies(req)[CALL_COOKIE] || null;
  const g = token ? grants.get(token) : null;
  if (!g) {
    return bad(res, 401, 'A call can only be started from the browser that made the application.');
  }
  if (g.used) {
    return bad(res, 409, 'A call has already been started for this application.');
  }
  if (b.applicationId && b.applicationId !== g.applicationId) {
    return bad(res, 403, 'That is not the application this browser applied for.');
  }
  const app0 = store.byId('applications', ctx.tenantId, g.applicationId);
  if (!app0) return bad(res, 404, 'No such application.');

  /* THE STATE IS PART OF THE GATE. Eligibility alone let a call be placed to
     somebody already rejected, already withdrawn, or ninety days into the job:
     34 of the 36 seeded applications passed the old gate. A screening call
     belongs to one state and this is it. */
  if (app0.state !== 'SCREENING_PENDING') {
    return bad(res, 409, 'This application is at ' + WF.label(app0.state) +
                         ', which is not the screening call.');
  }

  /* The screening invitation is gated on eligibility passing. Offering a call
     to somebody who failed would be wrong, and offering one to somebody held
     for a person would pre-empt the person. U-37 and U-91. */
  const elig = app0.eligibility || {};
  if (!elig.passed || elig.holdForPerson) {
    return bad(res, 409, 'This application is not at a screening call.');
  }

  const cand = store.byId('candidates', ctx.tenantId, app0.candidateId);
  const req0 = store.byId('requisitions', ctx.tenantId, app0.requisitionId);
  const st0 = store.byId('stores', ctx.tenantId, app0.storeId);
  const scr = store.first('screenings', ctx.tenantId,
    (s) => s.applicationId === app0.id && s.kind === 'call');
  if (!scr) return bad(res, 409, 'No screening exists on this application yet.');
  if (scr.call) return bad(res, 409, 'A call has already been placed on this screening.');

  /* THE NOTICE GATE, which is the one clock in this product that gates rather
     than reports, and it was computed and never consulted. Screening inside the
     ten business days is use of an automated employment decision tool without
     lawful notice, and a screening cannot be unrun.

     WHY IT RECORDS BY DEFAULT INSTEAD OF REFUSING, and this is a real conflict
     rather than a soft option. compliance.js starts the clock at the recorded
     consent, and the consent is taken seconds before the application, so NO
     candidate can ever satisfy ten business days: the gate refuses everybody,
     including the person in the room on 20 September. Refusing everybody is not
     enforcement, it is an outage. Reporting nothing would be the defect the
     reviewer found.

     So every call consults it, and every call inside the period writes an audit
     row carrying the gate's own sentence, which is the document counsel would
     produce. Set NOTICE_GATE=refuse and it refuses instead, which is one
     variable away.

     THE REAL FIX IS NOT HERE. Start the clock at the requisition's openedAt and
     serve the notice on the job posting, which is where the ten days can
     actually run: the seed already guarantees ten business days between every
     posting and every application to it. That is a change in compliance.js and
     it is handed off. */
  const gateMode = process.env.NOTICE_GATE === 'refuse' ? 'refuse' : 'record';
  const gate = COMPLY.noticeGate(store, ctx, app0);
  if (gate.ok === false) {
    const why = gate.breach || gate.reason || 'The notice period has not run.';
    if (gateMode === 'refuse') {
      return bad(res, 409, why, { noticeGate: { ok: false, reason: gate.reason || null,
                                                breach: gate.breach || null } });
    }
    EV.auditEvent(store, ctx, {
      action: 'screening.notice_gate.inside_period', actorType: 'external', actor: 'Careers page',
      subjectType: 'application', subjectId: app0.id,
      applicationId: app0.id, candidateId: app0.candidateId,
      why: why, outcome: 'refused', source: 'ui',
      detail: { mode: gateMode,
                note: 'The call was placed inside the notice period. The clock starts at the consent ' +
                      'and the consent is the moment of application, so in this build the period ' +
                      'cannot elapse for anybody. Recorded rather than hidden.' }
    });
  }

  /* The five variables the prompt declares. Nothing else is sent: no score, no
     threshold, no criterion, no phrase bank, no prior record. The agent cannot
     steer somebody toward a passing answer if it has never been told what one
     is, and it cannot leak a record it was never given. */
  const variables = {
    candidate_first_name: cand ? cand.firstName : '',
    role_title: req0 ? req0.title : '',
    store_name: st0 ? st0.name : '',
    shift_pattern: slotSentence(req0),
    question_bank: (scr.questions || []).map((q) => q.text).join('\n')
  };

  const method = b.method === 'outbound' ? 'outbound' : 'browser';
  const r = method === 'outbound'
    ? await AGENTX.startPhoneCall(cand && cand.phone, variables)
    : await AGENTX.startWebCall(variables);

  if (!r.ok) {
    /* The provider's own reason, passed through. Inventing a friendlier one is
       the specific dishonesty this product forbids, and the brief says that if
       there is no useful provider error we say only that the call failed. */
    EV.auditEvent(store, ctx, {
      action: 'screening.call.failed', actorType: 'system', actor: 'agentX',
      applicationId: app0.id, candidateId: app0.candidateId,
      why: r.error || 'The call failed and the provider gave no reason.',
      outcome: 'failed', source: 'connector'
    });
    store.flushNow();
    return bad(res, 502, r.error || 'The call failed and the provider gave no reason.',
               { mode: r.mode || AGENTX.mode(), method });
  }

  /* Spent, whatever happens next. A grant that survived a placed call is a
     second call to the same phone. */
  g.used = true;

  /* The call id is stored here and NEVER returned. The provider's transcript
     endpoint takes no auth, so a call id in the browser is a readable
     transcript for anybody who sees it. */
  scr.call = Object.assign(scr.call || {}, {
    method, transport: r.mode, providerCallId: r.callId,
    roomName: r.roomName, startedAt: clock.now()
  });
  store.markDirty();

  /* THE STAGE MACHINE WRITES THE EVENT, not this route. Setting scr.status by
     hand and writing a workflow event beside it produced two events for one
     stage and a status that the seven-stage sequence knew nothing about.

     AND IT IS THE PRODUCT'S MOVE, NOT THE CANDIDATE'S. The invited stage is
     by: ['system', 'agent', 'human'], and this route's own context is external
     because a candidate is holding it. Passing that context refused the move
     and wrote nothing, which is the silent-no-op shape this codebase keeps
     finding: the candidate pressed a button, the provider placed a call, and
     the timeline would have shown neither. The candidate's press is recorded on
     the application's audit trail; the invitation is the product asking the
     provider, so the system makes it. The agent gets the conversation, which is
     the stages after this one. */
  const placed = LIVE.advance(store, systemContext('agentX voice caller'), scr, 'invited', {
    transport: r.mode,
    detail: 'Screening call invited by ' + method + '.'
  });
  if (placed && placed.ok === false) {
    /* The call is already placed at the provider, so this cannot refuse the
       request. It can refuse to be quiet about it. */
    EV.auditEvent(store, ctx, {
      action: 'screening.stage.refused', actorType: 'system', actor: 'agentX voice caller',
      subjectType: 'screening', subjectId: scr.id,
      applicationId: app0.id, candidateId: app0.candidateId,
      why: placed.reason || 'The live call stage machine refused the invited stage.',
      outcome: 'refused', source: 'connector'
    });
  }

  /* AND SOMETHING READS THE RESULT BACK. Every collector in agentx.js had zero
     callers, so a live applicant took a real call and then never appeared
     anywhere: no transcript, no evaluation, no state change. This returns
     immediately and polls in the background until the provider says the call is
     over, then evaluates and lets the engine settle. */
  SCREEN.watchCall(store, systemContext('agentX result reader'), scr, {});
  store.flushNow();

  const payload = {
    /* `ok` inside the payload, because the confirmation screen tests
       `body.ok === true` before it will describe a call as connected, and the
       envelope's ok is one level up. Without it a placed call rendered as "The
       browser call did not open." */
    ok: true,
    screeningId: scr.id,
    method, mode: r.mode,
    /* Only what the browser genuinely needs to join the room. The room name and
       the participant name are withheld: either may be derived from the call id
       and the token already carries its own room grant. */
    serverUrl: r.serverUrl || null,
    token: r.token || null
  };
  PUB.assertClean(payload, 'call');
  ok(res, payload);
});

/**
 * The shift pattern, in the words the careers page uses.
 *
 * It used to be a regular expression over the screening question's own text,
 * with a fallback that joined the raw slot keys. The regular expression worked
 * only while the question was worded exactly as generated, and the fallback
 * would have had the voice agent tell a live candidate that the role needs
 * "sat_evening, sun_evening, wed_open". One function describes one shift
 * pattern. U-89.
 */
function slotSentence(req0) {
  if (!req0 || !req0.requiredSlots || !req0.requiredSlots.length) return '';
  /* No seed module means no requisitions either, so there is nothing to
     describe rather than something to guess at. */
  if (!SEED || !SEED.slotPhrase) return '';
  return SEED.slotPhrase(req0.requiredSlots) || '';
}

/* -------------------------------------------------------- the bias audit ---
   The link the statutory notice promises. It was a 404 for as long as the
   notice promised it, and the page then printed an honesty fallback saying no
   link had come back from the server, which was itself wrong.
   -------------------------------------------------------------------------- */

app.get('/public/bias-audit', (req, res) => {
  const a = PUB.BIAS_AUDIT;
  res.type('html').send(
    '<!doctype html><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(a.title) + '</title>' +
    '<style>body{font:16px/1.6 system-ui,sans-serif;max-width:34em;margin:0 auto;padding:32px 20px;' +
    'color:#1a1a1a;background:#fbfbfa}h1{font-size:1.4rem;line-height:1.3}' +
    'p{margin:0 0 1em}.m{color:#666;font-size:.85rem}</style>' +
    '<h1>' + esc(a.title) + '</h1>' +
    a.paragraphs.map((p) => '<p>' + esc(p) + '</p>').join('') +
    '<p class="m">' + esc(a.requirement) + ' ' + esc(a.citation) + '. Page updated ' +
    esc(a.updated) + '.</p>');
});

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ============================================================================
   THE READS

   Every one is scoped from the session. A store id in the query is honoured
   only where it names a store the viewer already holds, so a client cannot
   point a payload at somebody else's store by editing a URL.
   ============================================================================ */

/** The filter every analysis producer takes, built from the scope and the query. */
function filterFor(ctx, q) {
  const want = q && q.storeId ? String(q.storeId) : null;
  if (want && ctx.scope.storeIds.indexOf(want) < 0) return { error: 'That store is not in your scope.' };
  return {
    storeId: want || (ctx.scope.storeIds.length === 1 ? ctx.scope.storeIds[0] : null),
    requisitionId: q && q.requisitionId ? String(q.requisitionId) : null,
    storeIds: want ? [want] : ctx.scope.storeIds.slice()
  };
}

/* One place that turns a filter error into a refusal, so no route forgets. */
function scoped(req, res) {
  const ctx = contextFor(req);
  const f = filterFor(ctx, req.query);
  if (f.error) { bad(res, 403, f.error); return null; }
  return { ctx, f, extra: { scope: ctx.scope, scopeNote: scopeNote(ctx, f) } };
}

/**
 * What the numbers actually cover, said on every analysis payload.
 *
 * The producers in metrics.js take one `storeId` or none, so a viewer holding
 * three of the tenant's five stores cannot be expressed as a filter and gets
 * the whole tenant. That is a number wider than the viewer's scope, and a page
 * that prints it as "your stores" would be wrong. So it is labelled here until
 * metrics.js takes a store set, which is handed off.
 */
function scopeNote(ctx, f) {
  const held = ctx.scope.storeIds.length;
  const all = store.all('stores', ctx.tenantId).length;
  if (f.storeId) return null;
  if (held >= all) return null;
  return 'These figures cover all ' + all + ' stores in this retailer, not the ' + held +
         ' you hold. The producers behind them take one store or all of them and nothing in ' +
         'between. Ask for one store with ?storeId= to narrow it.';
}

app.get('/api/applications', (req, res) => {
  const s = scoped(req, res);
  if (!s) return;
  const { ctx, f } = s;
  /* THE TICK BEFORE THE LIST. Every time-guarded edge is followed here rather
     than only when somebody moves the clock, so an offer that expired
     overnight reads as expired the first time anybody opens the list. It is
     idempotent and it raises each warning once. A GET that writes is unusual
     and it is the honest arrangement: the alternative is a list that disagrees
     with the clock beside it. */
  WF.tick(store, ctx);
  /* SCOPED, AND IT WAS NOT. `?storeId=` was accepted and ignored, so all 36 rows
     came back whatever was passed, and the manager actor carried no store at
     all. The label on DECISION_PENDING reads "Awaiting your decision", so the
     product said that about five candidates at three other stores. */
  const rows = store.all('applications', ctx.tenantId)
    .filter((a) => f.storeIds.indexOf(a.storeId) >= 0)
    .map((a) => {
      const c = store.byId('candidates', ctx.tenantId, a.candidateId);
      return {
        id: a.id, name: c ? c.name : null, state: a.state, label: WF.label(a.state),
        step: WF.stepOf(a.state), storeId: a.storeId, appliedAt: a.appliedAt,
        /* Whose decision it is, so a list of eight can be read by somebody who
           owns three of them. */
        assignedTo: a.assignedTo || null,
        yours: !!(a.assignedTo && ctx.actor.name && a.assignedTo === ctx.actor.name),
        stateSince: a.stateSince || null
      };
    });
  ok(res, { count: rows.length, applications: rows, actor: ctx.actor, scope: ctx.scope });
});

/**
 * One candidate, everything a timeline needs.
 *
 * Assembled from the producers rather than computed here, because a second copy
 * of any of these numbers is a second answer to the same question.
 */
app.get('/api/applications/:id', (req, res) => {
  const ctx = contextFor(req);
  const a = store.byId('applications', ctx.tenantId, req.params.id);
  if (!a) return bad(res, 404, 'No such application.');
  if (!inScope(ctx, a)) return bad(res, 403, 'That application is at a store you do not hold.');
  const c = store.byId('candidates', ctx.tenantId, a.candidateId);
  const r = store.byId('requisitions', ctx.tenantId, a.requisitionId);
  try {
    ok(res, {
      application: {
        id: a.id, reference: a.reference || null, state: a.state, label: WF.label(a.state),
        step: WF.stepOf(a.state), storeId: a.storeId, assignedTo: a.assignedTo || null,
        appliedAt: a.appliedAt, stateSince: a.stateSince, closedAt: a.closedAt || null,
        disclosureId: a.disclosureId || null, disclosureVersion: a.disclosureVersion || null,
        disclosureDigest: a.disclosureDigest || null
      },
      candidate: c ? { id: c.id, name: c.name, initials: c.initials, email: c.email,
                       phone: c.phone, city: c.city, state: c.state } : null,
      requisition: r ? { id: r.id, key: r.key, title: r.title, openings: r.openings,
                         status: r.status, rateCents: r.rateCents } : null,
      /* What the viewer may do next, from the table, with the reason each move
         needs, so a surface can ask for the reason before offering the button. */
      moves: WF.movesFor(a.state, ctx.actor.type)
        .map((t) => ({ to: t.to, label: WF.label(t.to), needs: t.guard || null,
                       needsReason: !!t.needsReason })),
      metrics: M.applicationMetrics(store, ctx, a.id),
      steps: M.stepDurations(store, ctx, a.id),
      clocks: COMPLY.clocksFor(store, ctx, a),
      adverseBar: COMPLY.adverseBar(store, ctx, a),
      fcra: COMPLY.fcraSequence(store, ctx, a),
      retention: COMPLY.retentionFloor(store, ctx, a),
      exceptions: store.where('exceptions', ctx.tenantId, (x) => x.applicationId === a.id),
      screenings: store.where('screenings', ctx.tenantId, (x) => x.applicationId === a.id)
        .map((x) => ({ id: x.id, kind: x.kind, status: x.status, required: !!x.required })),
      tasks: store.where('onboardingTasks', ctx.tenantId, (x) => x.applicationId === a.id),
      /* The audit trail, which is the whole point of having one. */
      audit: store.where('auditEvents', ctx.tenantId, (x) => x.applicationId === a.id)
        .map((x) => ({ id: x.id, at: x.at, action: x.action, actor: x.actor,
                       actorType: x.actorType, why: x.why, outcome: x.outcome })),
      events: store.where('workflowEvents', ctx.tenantId, (x) => x.applicationId === a.id)
        .map((x) => ({ id: x.id, at: x.at, kind: x.kind, state: x.state, step: x.step,
                       owner: x.owner, actor: x.actor, actorType: x.actorType,
                       handoff: x.handoff, durationMs: x.durationMs, detail: x.detail }))
    });
  } catch (e) { bad(res, 500, String(e.message)); }
});

/**
 * One screening, live.
 *
 * The seven stages and the two readings. Neither payload contains a provider
 * call id, which is checked rather than trusted: the guard runs over the whole
 * thing before it goes out.
 */
app.get('/api/screening/:id', (req, res) => {
  const ctx = contextFor(req);
  const scr = store.byId('screenings', ctx.tenantId, req.params.id);
  if (!scr) return bad(res, 404, 'No such screening.');
  const a = store.byId('applications', ctx.tenantId, scr.applicationId);
  if (!inScope(ctx, a)) return bad(res, 403, 'That screening is at a store you do not hold.');
  try {
    ok(res, { live: LIVE.sequence(store, ctx, scr), readings: SCREEN.readings(store, ctx, scr) });
  } catch (e) { bad(res, 500, String(e.message)); }
});

/** Ask the provider once, from a route, for a surface that would rather poll. */
app.post('/api/screening/:id/poll', async (req, res) => {
  const ctx = contextFor(req);
  const scr = store.byId('screenings', ctx.tenantId, req.params.id);
  if (!scr) return bad(res, 404, 'No such screening.');
  const a = store.byId('applications', ctx.tenantId, scr.applicationId);
  if (!inScope(ctx, a)) return bad(res, 403, 'That screening is at a store you do not hold.');
  try {
    const r = await SCREEN.pollCall(store, ctx, scr);
    store.flushNow();
    ok(res, { poll: r, live: LIVE.sequence(store, ctx, scr) });
  } catch (e) { bad(res, 500, String(e.message)); }
});

/* ------------------------------------------------------------- the numbers --- */

app.get('/api/metrics', (req, res) => {
  const s = scoped(req, res);
  if (!s) return;
  /* WF.tick first, so an offer that expired while nobody was looking has
     expired by the time it is counted. It is idempotent and it raises each
     warning once. */
  try {
    WF.tick(store, s.ctx);
    ok(res, M.rollup(store, s.ctx, s.f), s.extra);
  } catch (e) { bad(res, 500, String(e.message)); }
});

/* The five producers that had no route at all, so the store page, the funnel
   page and the buyer's fill figures could not be built. */
const METRIC_ROUTES = {
  /* `storeRollups` takes no filter, so the scope is applied to the rows it
     returns. Without this a field HR person covering three stores read the two
     stores in the other district as well, which is the same leak as the
     unfiltered application list in a quieter place. */
  stores:     (st, ctx, f) => M.storeRollups(st, ctx)
                .filter((row) => f.storeIds.indexOf(row.storeId) >= 0),
  steps:      (st, ctx, f) => M.stepMedians(st, ctx, f),
  bottleneck: (st, ctx, f) => M.bottleneck(st, ctx, f),
  actors:     (st, ctx, f) => M.actorSplit(st, ctx, f),
  fill:       (st, ctx, f) => M.fill(st, ctx, f)
};
Object.keys(METRIC_ROUTES).forEach((name) => {
  app.get('/api/metrics/' + name, (req, res) => {
    const s = scoped(req, res);
    if (!s) return;
    /* The store rollups are filtered row by row above, so they genuinely cover
       the viewer's scope and must not carry the note that says otherwise. */
    const extra = name === 'stores' ? { scope: s.ctx.scope } : s.extra;
    try { ok(res, METRIC_ROUTES[name](store, s.ctx, s.f), extra); }
    catch (e) { bad(res, 500, String(e.message)); }
  });
});

/** The funnel page, which is three producers on one screen. */
app.get('/api/funnel', (req, res) => {
  const s = scoped(req, res);
  if (!s) return;
  try {
    ok(res, {
      steps: M.stepMedians(store, s.ctx, s.f),
      bottleneck: M.bottleneck(store, s.ctx, s.f),
      actors: M.actorSplit(store, s.ctx, s.f)
    }, s.extra);
  } catch (e) { bad(res, 500, String(e.message)); }
});

/* --------------------------------------------------------- compliance --- */

app.get('/api/compliance', (req, res) => {
  const ctx = contextFor(req);
  try { ok(res, COMPLY.complianceView(store, ctx)); }
  catch (e) { bad(res, 500, String(e.message)); }
});

/** The attention queue, ranked by consequence rather than by table shape. */
/* THE OPERATOR'S FIRST SCREEN. One rule, one list, ranked by what it costs to
   leave a thing rather than by how long it has sat. See lib/workqueue.js for
   why the specification's six enumerated sources were replaced by one sweep. */
app.get('/api/work', (req, res) => {
  const ctx = contextFor(req);
  try {
    /* The statutory clocks come from the compliance module rather than being
       recomputed here, so there is one arithmetic for a deadline. */
    let clocks = [];
    try {
      const cases = COMPLY.casesNeedingAPerson(store, ctx) || [];
      cases.forEach((c) => (c.clocks || []).forEach((k) => {
        if (k && (k.owner === 'human')) clocks.push(Object.assign({ applicationId: c.applicationId }, k));
      }));
    } catch (e) { clocks = []; }
    return ok(res, WQ.queue(store, ctx, { clocks }));
  } catch (e) {
    return bad(res, 500, String(e.message));
  }
});

app.get('/api/queue', (req, res) => {
  const ctx = contextFor(req);
  try {
    const cases = COMPLY.casesNeedingAPerson(store, ctx)
      .filter((row) => {
        /* Scoped through the application rather than through the row's own
           storeId, so a row whose store field is wrong cannot walk out. A case
           with no application at all is tenant level and belongs to
           everybody. */
        const a = store.byId('applications', ctx.tenantId, row.applicationId || row.id);
        return a ? inScope(ctx, a) : true;
      });
    ok(res, { cases, count: cases.length, notice: COMPLY.noticeGateSummary(store, ctx) });
  } catch (e) { bad(res, 500, String(e.message)); }
});

app.get('/api/exceptions', (req, res) => {
  const ctx = contextFor(req);
  const open = String(req.query.open || 'true') !== 'false';
  const rows = store.where('exceptions', ctx.tenantId, (x) => {
    if (open && x.resolvedAt) return false;
    if (!x.storeId) return true;
    return ctx.scope.storeIds.indexOf(x.storeId) >= 0;
  });
  ok(res, { count: rows.length, exceptions: rows });
});

/** Where the product's integration traffic went, and to what. */
app.get('/api/sources', (req, res) => {
  const s = scoped(req, res);
  if (!s) return;
  const { ctx, f } = s;
  const calls = store.where('connectorCalls', ctx.tenantId, (c) => {
    if (!c.storeId) return true;
    return f.storeIds.indexOf(c.storeId) >= 0;
  });
  ok(res, {
    adapters: CONN.statuses(),
    destinations: CONN.DESTINATIONS,
    knownFailures: CONN.knownFailures(),
    calls: calls.length,
    byAdapter: calls.reduce((acc, c) => {
      const k = c.adapter + '.' + c.op;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  }, s.extra);
});

/* ============================================================================
   THE WRITES

   Every one of them goes through the engine. There is no route that sets a
   state, writes a decision or fills a task by hand, because a second path into
   the data is a path with none of the guards on it.

   WHAT THE CALLER MAY SEND. Only `reason`, `notes`, `scheduledAt` and
   `startsAt`. Not `at`, because a caller who can choose the timestamp can
   backdate a decision and every duration this product reports is derived from
   event times. Not `auto`, because that is the audit trail's word for "no
   person did this". Not `workMs`, because the manual-work figure is a claim
   about staff time and a client should not be able to inflate it.
   ============================================================================ */

const ALLOWED_OPTS = ['reason', 'notes', 'scheduledAt', 'startsAt'];

function optsFrom(body) {
  const o = {};
  ALLOWED_OPTS.forEach((k) => { if (body[k] !== undefined) o[k] = body[k]; });
  o.source = 'ui';
  return o;
}

/**
 * Move one application.
 *
 * This is the route that did not exist. Approving, rejecting, sending the offer,
 * extending it, closing it, booking the interview, recording the no-show,
 * placing the first shift and reopening an ineligibility are all this one route,
 * because they are all one thing in the table and the table is what decides who
 * may make each move.
 *
 * A refusal comes back verbatim with the engine's `allowed` list, so a surface
 * can render what the viewer may do instead. It is a 409 rather than a 403: the
 * request was understood and the workflow said no.
 */
app.post('/api/applications/:id/transition', (req, res) => {
  const ctx = contextFor(req);
  const b = req.body || {};
  const a = store.byId('applications', ctx.tenantId, req.params.id);
  if (!a) return bad(res, 404, 'No such application.');
  if (!inScope(ctx, a)) return bad(res, 403, 'That application is at a store you do not hold.');
  if (!b.to) return bad(res, 400, 'Which state to move it to has to be named.');

  const r = WF.transition(store, ctx, a.id, String(b.to), optsFrom(b));
  if (!r.ok) {
    store.flushNow();
    return bad(res, 409, r.reason, { allowed: r.allowed || [], bar: r.bar || null });
  }
  /* And then the automatic edges, because a person's move usually unlocks
     several of the system's. An approval creates the offer; an acceptance fans
     out the parallel work. */
  const settled = WF.settle(store, ctx, a.id);
  const fresh = store.byId('applications', ctx.tenantId, a.id);
  store.flushNow();
  ok(res, {
    from: r.from, to: r.to, state: fresh.state, label: WF.label(fresh.state),
    autoMoves: (settled.moved || []).map((m) => m.to),
    stoppedBecause: settled.stoppedBecause || null,
    moves: WF.movesFor(fresh.state, ctx.actor.type)
      .map((t) => ({ to: t.to, label: WF.label(t.to), needs: t.guard || null,
                     needsReason: !!t.needsReason }))
  });
});

/**
 * Resolve an exception.
 *
 * THE SETTLE AFTERWARDS IS NOT OPTIONAL. Nothing else re-runs the automatic
 * edges, so a resolved score disagreement would leave the candidate parked at
 * SCREENING_COMPLETE for ever, which is the shape of failure this product is
 * meant to remove rather than produce.
 */
app.post('/api/exceptions/:id/resolve', (req, res) => {
  const ctx = contextFor(req);
  const b = req.body || {};
  const ex = store.byId('exceptions', ctx.tenantId, req.params.id);
  if (!ex) return bad(res, 404, 'No such exception.');
  if (ex.storeId && ctx.scope.storeIds.indexOf(ex.storeId) < 0) {
    return bad(res, 403, 'That exception is at a store you do not hold.');
  }
  const r = EV.resolveException(store, ctx, ex.id, {
    reason: b.reason, resolution: b.resolution, source: 'ui'
  });
  if (!r.ok) { store.flushNow(); return bad(res, 409, r.reason); }

  const settled = ex.applicationId ? WF.settle(store, ctx, ex.applicationId) : { moved: [] };
  const fresh = ex.applicationId ? store.byId('applications', ctx.tenantId, ex.applicationId) : null;
  store.flushNow();
  ok(res, {
    exception: { id: ex.id, resolution: ex.resolution, resolvedBy: ex.resolvedBy,
                 resolvedAt: ex.resolvedAt, reason: ex.resolutionReason },
    autoMoves: (settled.moved || []).map((m) => m.to),
    state: fresh ? fresh.state : null,
    label: fresh ? WF.label(fresh.state) : null,
    stoppedBecause: settled.stoppedBecause || null
  });
});

/**
 * Complete one onboarding task.
 *
 * The task row is not a workflow state, so this is not a transition. What makes
 * it safe is what comes after: the settle, because ONBOARDING_IN_PROGRESS to
 * READY_FOR_SHIFT is guarded on the pre-shift tasks being done, so finishing the
 * last one moves the application by itself.
 *
 * The `needs` list is enforced. The seed refuses to complete a task whose
 * dependencies are open and throws a sentence saying the table has been
 * reordered; a route that did not check the same thing would let a person sign
 * an I-9 section 2 before section 1 exists.
 */
app.post('/api/applications/:id/tasks/:key/complete', (req, res) => {
  const ctx = contextFor(req);
  const b = req.body || {};
  const a = store.byId('applications', ctx.tenantId, req.params.id);
  if (!a) return bad(res, 404, 'No such application.');
  if (!inScope(ctx, a)) return bad(res, 403, 'That application is at a store you do not hold.');

  const rows = store.where('onboardingTasks', ctx.tenantId, (t) => t.applicationId === a.id);
  const task = rows.find((t) => t.key === req.params.key || t.id === req.params.key);
  if (!task) return bad(res, 404, 'No such task on this application.');
  if (task.status === 'complete') return bad(res, 409, task.name + ' is already complete.');

  const open = (task.needs || []).filter((k) => {
    const dep = rows.find((x) => x.key === k);
    return !dep || dep.status !== 'complete';
  });
  if (open.length) {
    const names = open.map((k) => {
      const dep = rows.find((x) => x.key === k);
      return dep ? dep.name : k;
    });
    return bad(res, 409, task.name + ' cannot be completed until ' + names.join(' and ') +
                         ' is done, because that is the order the paperwork has to happen in.');
  }

  const at = clock.now();
  task.status = 'complete';
  task.startedAt = task.startedAt || at;
  task.completedAt = at;
  store.markDirty();

  EV.workflowEvent(store, ctx, {
    applicationId: a.id, candidateId: a.candidateId, storeId: a.storeId,
    at, kind: 'work', state: a.state, step: task.step, owner: task.owner,
    actorType: ctx.actor.type, actor: ctx.actor.name,
    detail: task.name + ' completed.' + (b.reason ? ' ' + String(b.reason).trim() : ''),
    ref: task.id
  });
  EV.auditEvent(store, ctx, {
    action: 'onboarding.task.completed', at,
    actorType: ctx.actor.type, actor: ctx.actor.name,
    subjectType: 'onboardingTask', subjectId: task.id,
    applicationId: a.id, candidateId: a.candidateId,
    why: b.reason ? String(b.reason).trim() : null,
    detail: { key: task.key, step: task.step }, source: 'ui'
  });

  const settled = WF.settle(store, ctx, a.id);
  const fresh = store.byId('applications', ctx.tenantId, a.id);
  store.flushNow();
  ok(res, {
    task: { id: task.id, key: task.key, name: task.name, status: task.status,
            completedAt: task.completedAt },
    remaining: rows.filter((t) => t.status !== 'complete').map((t) => t.key),
    autoMoves: (settled.moved || []).map((m) => m.to),
    state: fresh.state, label: WF.label(fresh.state),
    stoppedBecause: settled.stoppedBecause || null
  });
});

/** The eleven task definitions, so a surface can render a task that has no row yet. */
app.get('/api/tasks/definitions', (req, res) =>
  ok(res, { onboarding: ONBOARDING_TASKS, preShift: PRE_SHIFT_TASKS }));

/* ============================================================================
   RETENTION, ACCESS AND DELETION

   The notice promises four years and then deletion. `store.remove` existed with
   no caller, `deleteAfter` was written on every consent and read by nothing, and
   there was no access route and no erasure route, so three promises to the
   candidate had nothing behind them.

   THE SWEEP REFUSES MORE OFTEN THAN IT DELETES, and that is correct. A hard
   deletion at four years collides with obligations that run longer: the I-9 runs
   three years from hire or one year from separation, whichever is later, and a
   litigation hold outranks every schedule. So the sweep asks compliance.js for
   the governing floor and deletes only what is past all of them.
   ============================================================================ */

function sweepRetention(ctx) {
  const now = clock.now();
  const out = { considered: 0, deleted: [], held: [] };
  store.all('consents', ctx.tenantId).forEach((cs) => {
    if (cs.deleteAfter == null || cs.deleteAfter > now) return;
    out.considered++;
    const a = cs.applicationId ? store.byId('applications', ctx.tenantId, cs.applicationId) : null;
    const floor = a ? COMPLY.retentionFloor(store, ctx, a) : null;
    if (a && a.legalHold) {
      out.held.push({ consentId: cs.id, why: 'A legal hold is on this application.' });
      return;
    }
    if (floor && floor.deleteNotBefore != null && floor.deleteNotBefore > now) {
      out.held.push({ consentId: cs.id, why: floor.note, governs: floor.governs });
      return;
    }
    store.remove('consents', ctx.tenantId, cs.id);
    out.deleted.push(cs.id);
    EV.auditEvent(store, ctx, {
      action: 'retention.deleted', actorType: 'system', actor: 'Retention sweep',
      subjectType: 'consent', subjectId: cs.id,
      applicationId: cs.applicationId, candidateId: cs.candidateId,
      why: 'The four year retention on this consent record elapsed and no longer floor applied.',
      detail: { deleteAfter: cs.deleteAfter, governedBy: floor ? floor.governs : null },
      source: 'workflow'
    });
  });
  if (out.deleted.length || out.held.length) store.flushNow();
  return out;
}

app.post('/api/retention/sweep', (req, res) => {
  const ctx = contextFor(req);
  ok(res, Object.assign(sweepRetention(ctx), {
    note: 'A record past its four years is deleted only when every other floor has also passed. ' +
          'A legal hold on the application stops it whatever the floors say. There is no screen for ' +
          'putting one on, so the field is honoured wherever it is set and is normally empty, which ' +
          'is stated rather than left to be discovered.'
  }));
});

/**
 * Subject access. What is held about one application, and until when.
 *
 * Behind the operator gate on purpose. A route a candidate could open with a
 * name and a date of birth is the disclosure U-93 removed the status page to
 * prevent, and it does not become safe by being about retention.
 */
app.get('/api/data-subject/:id', (req, res) => {
  const ctx = contextFor(req);
  const a = store.byId('applications', ctx.tenantId, req.params.id);
  if (!a) return bad(res, 404, 'No such application.');
  if (!inScope(ctx, a)) return bad(res, 403, 'That application is at a store you do not hold.');
  const c = store.byId('candidates', ctx.tenantId, a.candidateId);
  ok(res, {
    application: { id: a.id, reference: a.reference || null, appliedAt: a.appliedAt,
                   state: a.state, storeId: a.storeId, legalHold: a.legalHold || null },
    candidate: c ? { name: c.name, email: c.email, phone: c.phone, dob: null,
                     dobHeld: !!c.dob, experience: c.experience } : null,
    heldBecause: 'The date of birth is held and not returned here. It is an input to the rehire ' +
                 'lookup and to the age rule, and printing it back is how a record about one person ' +
                 'gets read by another.',
    consents: store.where('consents', ctx.tenantId, (x) => x.applicationId === a.id)
      .map((x) => ({ id: x.id, at: x.at, disclosureId: x.disclosureId,
                     disclosureVersion: x.disclosureVersion, disclosureDigest: x.disclosureDigest,
                     retentionClass: x.retentionClass, deleteAfter: x.deleteAfter })),
    retention: COMPLY.retentionFloor(store, ctx, a),
    communications: store.where('communications', ctx.tenantId, (x) => x.applicationId === a.id)
      .map((x) => ({ id: x.id, at: x.at, channel: x.channel, subject: x.subject,
                     status: x.status, mode: x.mode }))
  });
});

/** Erasure, refused where a floor still runs. The refusal is the useful half. */
app.post('/api/data-subject/:id/erase', (req, res) => {
  const ctx = contextFor(req);
  const b = req.body || {};
  const a = store.byId('applications', ctx.tenantId, req.params.id);
  if (!a) return bad(res, 404, 'No such application.');
  if (!inScope(ctx, a)) return bad(res, 403, 'That application is at a store you do not hold.');
  if (!b.reason || String(b.reason).trim().length < 12) {
    return bad(res, 400, 'A reason is required, and it goes on the record against ' +
                         (ctx.actor.name || 'you') + '.');
  }
  const floor = COMPLY.retentionFloor(store, ctx, a);
  const now = clock.now();
  if (a.legalHold) {
    return bad(res, 409, 'A legal hold is on this application, and a hold outranks a deletion request.');
  }
  if (floor.deleteNotBefore != null && floor.deleteNotBefore > now) {
    EV.auditEvent(store, ctx, {
      action: 'retention.erase.refused', actorType: ctx.actor.type, actor: ctx.actor.name,
      subjectType: 'application', subjectId: a.id, applicationId: a.id,
      why: floor.note, outcome: 'refused', source: 'ui'
    });
    store.flushNow();
    return bad(res, 409, floor.note, { retention: floor });
  }
  const gone = store.where('consents', ctx.tenantId, (x) => x.applicationId === a.id)
    .map((x) => store.remove('consents', ctx.tenantId, x.id))
    .filter(Boolean).map((x) => x.id);
  EV.auditEvent(store, ctx, {
    action: 'retention.erased', actorType: ctx.actor.type, actor: ctx.actor.name,
    subjectType: 'application', subjectId: a.id, applicationId: a.id, candidateId: a.candidateId,
    why: String(b.reason).trim(), detail: { consents: gone }, source: 'ui'
  });
  store.flushNow();
  ok(res, { erased: gone, note: 'The consent records were deleted. The application row and its events ' +
                                'are kept, because the employment record and the audit trail have their ' +
                                'own obligations and this route does not decide those.' });
});

/* -------------------------------------------------------------- the clock ---
   BEHIND THE GATE. A reviewer moved a copy of this demo from 17 August to 15
   December with one unauthenticated request, and the only way back was the
   reseed route, which was also open.
   -------------------------------------------------------------------------- */

app.post('/api/sim/advance', (req, res) => {
  const ctx = contextFor(req);
  const hours = Math.max(0, Math.min(24 * 120, Number((req.body || {}).hours) || 24));
  store.db.meta.anchors.sim += hours * 3600000;
  store.markDirty();
  /* THE TICK, which nothing called. The offer window, the chase warning and the
     day 30, 60 and 90 edges are all guarded on elapsed time, so moving the clock
     without ticking left three offers reading OFFER_SENT thirty hours after they
     expired. */
  const ticked = WF.tick(store, ctx);
  store.flushNow();
  EV.auditEvent(store, ctx, {
    action: 'sim.clock.advanced', actorType: ctx.actor.type, actor: ctx.actor.name,
    why: 'The demonstration clock was moved forward ' + hours + ' hours.', source: 'ui'
  });
  store.flushNow();
  ok(res, { advancedHours: hours, ticked: ticked || null,
    note: 'The clock moved. Nothing was faked: whatever happens next happens because its expected time passed.' });
});

app.post('/api/reset', async (req, res) => {
  const b = req.body || {};
  /* A confirmation, because this is the one route that destroys everything and
     it is one word away from a mistyped URL. */
  if (b.confirm !== 'reseed') {
    return bad(res, 400, 'Reseeding throws the whole database away. Send { "confirm": "reseed" }.');
  }
  const seed = await loadSeed();
  if (!seed) return bad(res, 500, 'There is no seed module to reseed from.');
  store.reset();
  store.db.meta.anchors = freshAnchors();
  await seed.seed(store, { clock });
  store.db.meta.seededAt = Date.now();
  store.flushNow();
  await boot();
  /* Every capability minted against the old database is meaningless now. */
  grants.clear();
  ok(res, { reseeded: true, sizes: store.sizes(TENANT) });
});

/* ============================================================================
   THE STATIC FILES, THE PAGES, AND WHAT A CRAWLER IS TOLD

   THREE THINGS CHANGED HERE AND EACH ONE WAS A DEFECT YOU COULD SEE.

   1. EVERY URL HAD THE SAME TITLE. Both surfaces are single-page applications
      and the title was a line in the HTML, so eight job pages, the form and
      the confirmation all read "Careers" in a tab, in history and in a
      bookmark. The head is now built per URL in lib/pagemeta.js and spliced in
      here, which also makes the canonical link and the job posting record true
      without the page having to run.

   2. THE CANDIDATE FLOW HAD NO ADDRESSES. It was one URL with a fragment, so
      a role could not be linked, shared, indexed or given a canonical. The
      four phases are four paths now: /careers, /careers/roles/:id,
      /careers/apply/:id and /careers/sent/:id, served by the same document.

   3. TWO URLS SERVED ONE PAGE. express.static happily answered /careers.html
      and /app.html beside /careers and /app, which is a duplicate of every
      page with no canonical between them. Both now redirect to the real path.

   INDEXING IS ONE SWITCH. PUBLIC_INDEX is off by default because this is a
   demonstration environment for a retailer that does not exist, so every page
   says noindex, robots.txt disallows everything and there is no sitemap. With
   it on, the candidate pages become indexable, robots.txt allows exactly those
   and keeps the operator application and the API out, and the sitemap lists
   the public candidate routes and nothing else. The two halves are never
   mixed.
   ============================================================================ */

const SITE = PAGEMETA.siteConfig(process.env);

/* ONE PAGE, ONE URL, AND THIS HAS TO COME BEFORE THE STATIC MIDDLEWARE.
   express.static answers any file under web/, so /careers.html and /app.html
   were a second address for two pages that already have one, with no canonical
   between them. Registered after static they never fired, because static had
   already replied. */
app.get('/careers.html', (req, res) => res.redirect(301, '/careers'));
app.get('/app.html', (req, res) => res.redirect(301, '/app'));

/* Built assets when they exist, source when they do not, so the app runs with
   or without a build step. */
const DIST = path.join(ROOT, 'dist');
if (fs.existsSync(DIST)) app.use(express.static(DIST, { maxAge: '1y', index: false }));

/* The brand assets are immutable and fingerprinted by content, so they get a
   long cache. Everything else is revalidated, because this is a demo somebody
   edits while it is running and a stale stylesheet is a wasted rehearsal. */
app.use('/brand', express.static(path.join(WEB, 'brand'), { maxAge: '30d', immutable: true }));
app.use(express.static(WEB, { etag: true, lastModified: true, index: false,
                              setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));

app.get('/favicon.ico', (req, res) => res.sendFile(path.join(WEB, 'brand', 'favicon.ico')));

/* --------------------------------------------------------- the candidate --- */

function orgOf() {
  const t = store.db.tenants[0];
  return (t && t.org) ? t.org : (t ? { name: t.name } : null);
}

app.get('/', (req, res) => res.redirect('/careers'));

app.get('/careers', (req, res) => {
  const total = TENANT
    ? store.where('requisitions', TENANT, (r) => r.status === 'open').length : 0;
  sendPage(res, 'careers.html', PAGEMETA.careersList(orgOf(), total));
});

/* The role page, which is the disclosure and the process. Its head carries the
   JobPosting record, built from the same public projection the browser
   renders. An id that is not an open requisition is a 404 rather than a page
   that loads and then says it could not find anything. */
app.get('/careers/roles/:id', (req, res) => {
  const req0 = TENANT ? store.byId('requisitions', TENANT, req.params.id) : null;
  if (!req0 || req0.status !== 'open') return sendNotFound(req, res);
  const j = PUB.job(store, { tenantId: TENANT }, req0);
  sendPage(res, 'careers.html', PAGEMETA.rolePage(orgOf(), j));
});

app.get('/careers/apply/:id', (req, res) => {
  const req0 = TENANT ? store.byId('requisitions', TENANT, req.params.id) : null;
  if (!req0 || req0.status !== 'open') return sendNotFound(req, res);
  const j = PUB.job(store, { tenantId: TENANT }, req0);
  sendPage(res, 'careers.html', PAGEMETA.applyPage(orgOf(), j));
});

app.get('/careers/sent/:id', (req, res) =>
  sendPage(res, 'careers.html', PAGEMETA.sentPage(orgOf())));

/* The old address. Kept as a redirect rather than a dead link, because it was
   printed on the demo script and somebody will have it written down. */
app.get('/apply', (req, res) => res.redirect(301, '/careers'));

/* --------------------------------------------------------- the operator --- */

app.get('/app', (req, res) => sendPage(res, 'app.html', PAGEMETA.operatorPage(orgOf(), 'work')));

/* ------------------------------------------------- what a crawler is told --- */

app.get('/robots.txt', (req, res) => {
  const lines = ['# ' + (orgOf() || {}).name + ' hiring'];
  if (!SITE.indexable) {
    lines.push('# This is a demonstration environment. The retailer does not exist and no');
    lines.push('# application here reaches a real employer, so nothing on it should be indexed.');
    lines.push('# Set PUBLIC_INDEX=1 on a real deployment to open the candidate pages.');
    lines.push('', 'User-agent: *', 'Disallow: /');
  } else {
    lines.push('# The candidate pages are public. The operator application and the API are not.');
    lines.push('', 'User-agent: *',
      'Allow: /careers',
      'Disallow: /app',
      'Disallow: /api/',
      /* A half-finished application and somebody else's confirmation are not
         pages a crawler has any business on, and the confirmation carries an
         application reference. */
      'Disallow: /careers/apply/',
      'Disallow: /careers/sent/',
      '', 'Sitemap: ' + SITE.origin + '/sitemap.xml');
  }
  res.type('text/plain').send(lines.join('\n') + '\n');
});

/* The sitemap exists only when the site is indexable, because a sitemap on a
   site whose robots.txt disallows everything is two documents contradicting
   each other. It lists the open roles and nothing else: no operator route, no
   application form, no confirmation, no candidate id. */
app.get('/sitemap.xml', (req, res) => {
  if (!SITE.indexable) return sendNotFound(req, res);
  const reqs = TENANT ? store.where('requisitions', TENANT, (r) => r.status === 'open') : [];
  const urls = [{ loc: SITE.origin + '/careers', pri: '1.0' }].concat(reqs.map((r) => ({
    loc: SITE.origin + '/careers/roles/' + encodeURIComponent(r.id),
    mod: r.openedAt ? new Date(r.openedAt).toISOString().slice(0, 10) : null,
    pri: '0.8'
  })));
  res.type('application/xml').send(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => '  <url>\n    <loc>' + u.loc + '</loc>\n' +
      (u.mod ? '    <lastmod>' + u.mod + '</lastmod>\n' : '') +
      '    <priority>' + u.pri + '</priority>\n  </url>').join('\n') +
    '\n</urlset>\n');
});

/* llms.txt, AND THE REASON IT IS GATED THE SAME WAY THE SITEMAP IS.

   It is here because there is one thing an agent reading this site genuinely
   needs to be told and cannot work out: there is no status page and no way to
   look an application up, on purpose, because the identity match is a name and
   a date of birth and a page anybody could reopen would show one person another
   person's record. An agent that assumes a tracking URL exists will invent one
   for somebody.

   It is NOT here to be fashionable, and it is not served at all when the site
   is not indexable, for the same reason the sitemap is not: a file inviting a
   reader on a site whose robots.txt disallows everything is two documents
   contradicting each other. It names no private route and no internal id. */
app.get('/llms.txt', (req, res) => {
  if (!SITE.indexable) return sendNotFound(req, res);
  const org = (orgOf() || {}).name || 'This retailer';
  const reqs = TENANT ? store.where('requisitions', TENANT, (r) => r.status === 'open') : [];
  res.type('text/plain').send([
    '# ' + org + ' careers',
    '',
    '> Hourly frontline roles. Each posting states the pay, the hours and the shifts the role',
    '> requires. Applying takes one form and no account.',
    '',
    '## What is here',
    '',
    '- [Open roles](' + SITE.origin + '/careers): every open role, filterable by store and by title.',
    '- A page per role at /careers/roles/<id>, carrying the pay, the hours, the shifts it needs,',
    '  and a plain statement of how the hiring process works. ' + reqs.length + ' are open now.',
    '',
    '## What is not here, and will not be',
    '',
    '- There is no application status page and no way to look an application up. Identity in this',
    '  system is matched on a name and a date of birth, so a page that could be reopened with a',
    "  reference could show one person another person's record. Everything after an application",
    '  is sent arrives by email.',
    '- The form at /careers/apply/<id> cannot be completed without first accepting the notice on',
    '  the role page, which is recorded. Linking straight to it does not skip that.',
    '',
    '## How a decision is made',
    '',
    '- An AI voice assistant asks the questions the role asks everybody and writes down the answers.',
    '- Fixed rules check age, right to work, the shifts ticked and the distance band. No model runs',
    '  on any of those.',
    '- A named person at the store makes the hiring decision. The assistant cannot hire or reject.',
    ''
  ].join('\n'));
});

/* ----------------------------------------------------------- the sending --- */

/* Read once and cached, because the head splice runs on every page request and
   re-reading a file per request to interpolate four lines is silly. */
const PAGE_CACHE = new Map();

function pageSource(file) {
  if (!PAGE_CACHE.has(file)) {
    const p = path.join(WEB, file);
    PAGE_CACHE.set(file, fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
  }
  return PAGE_CACHE.get(file);
}

function sendPage(res, file, meta) {
  const html = pageSource(file);
  if (html == null) {
    return res.status(503).type('html').send(
      '<pre style="font:14px ui-monospace;padding:32px;line-height:1.6">' +
      file + ' has not been built yet.\n\nThe server is up and the API works. Try:\n\n' +
      '  /api/health\n  /api/public/careers\n  /api/public/disclosure\n  /api/public/call/methods\n</pre>');
  }
  /* The whole fallback head is replaced, not prepended to. Two title elements
     in one document is the browser reading the first and a validator reading a
     defect. */
  const out = meta
    ? html.replace(/<!--HEAD-->[\s\S]*?<!--\/HEAD-->/, PAGEMETA.head(meta, SITE))
    : html;
  res.status(meta && meta.status ? meta.status : 200).type('html').send(out);
}

/* ------------------------------------------------------------ not found ---
   A 404 that belongs to the product rather than to Express. It is the candidate
   document with a page mount that careers.js fills, so it carries the same
   masthead, the same footer and the same type as everything else, and it offers
   the two doors that exist rather than a stack trace.

   THE API KEEPS ITS JSON. A fetch that gets HTML where it expected an envelope
   fails in a way nobody can read, and /api is where a caller is a program. */
function sendNotFound(req, res) {
  if (req.path.indexOf('/api/') === 0) {
    return bad(res, 404, 'No such route: ' + req.path);
  }
  const meta = PAGEMETA.notFound(orgOf());
  meta.status = 404;
  sendPage(res, 'careers.html', meta);
}

app.use(sendNotFound);

/* ------------------------------------------------------------- the errors ---
   ONE ENVELOPE, NO STACK. Malformed JSON on the candidate route used to return
   Express's development error page, which carried the whole stack including the
   developer's home directory, the framework and every dependency path, to an
   anonymous caller on the first route an applicant hits.

   It is a middleware rather than NODE_ENV=production, because a deployment that
   forgets the variable should still not leak, and because the JSON envelope is
   what every other route answers with.
   -------------------------------------------------------------------------- */

app.use((err, req, res, next) => {
  const isBodyParse = err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError);
  const tooBig = err && err.type === 'entity.too.large';
  console.error('  ' + req.method + ' ' + req.path + ' failed: ' + (err && err.message));
  if (res.headersSent) return;
  if (isBodyParse) return bad(res, 400, 'The request body was not valid JSON.');
  if (tooBig) return bad(res, 413, 'That request body is too large.');
  bad(res, 500, 'Something went wrong on the server. The detail is in the server log.');
});

/* ---------------------------------------------------------------- listen --- */

boot().then(() => {
  /* The sweep runs at boot as well as on demand, because a record whose four
     years elapsed while the process was down is still past its date. */
  if (TENANT) sweepRetention(systemContext());
  app.listen(PORT, HOST, () => {
    const v = AGENTX.status();
    console.log('');
    console.log('  Frontline hire  ->  http://' + (HOST === '0.0.0.0' ? 'localhost' : HOST) + ':' + PORT);
    console.log('  Tenant:   ' + (TENANT_NAME || 'none, the database is empty'));
    console.log('  Present:  ' + new Date(clock.now()).toISOString() + '  (simulated, advances in real time)');
    console.log('  Rows:     ' + JSON.stringify(store.sizesAllTenants()).replace(/[{}"]/g, '').slice(0, 120));
    console.log('  Voice:    ' + v.mode + (v.configured ? '  agent ' + v.agentId : '  missing ' + v.missing.join(', ')));
    console.log('  State:    ' + DB_FILE);
    console.log('  Viewers:  ' + Object.keys(VIEWERS).join(', '));
    console.log('  Bind:     ' + HOST + (HOST === '127.0.0.1' ? '  (loopback. set HOST to widen it)' : '  (WIDE OPEN to this network)'));
    console.log('  Operator token: ' + OPERATOR_TOKEN +
                (TOKEN_IS_GENERATED ? '   (generated. set DEMO_TOKEN to fix it)' : '   (from DEMO_TOKEN)'));
    console.log('    POST /api/session  { "token": "...", "viewer": "manager" }  to act as somebody.');
    console.log('');
  });
});
