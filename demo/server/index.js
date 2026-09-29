#!/usr/bin/env node
/* ============================================================================
   server/index.js  ·  the backend

   Node's own http module and nothing else. No framework, no bundler, no
   package manager, no node_modules. That is a deliberate constraint carried
   over from the browser-only build: this repository has a standing rule against
   adding a runtime or a dependency manager, and the whole product fits inside
   what Node already ships.

   What the server exists for, beyond serving files:

   1. THE API KEY LIVES HERE AND NOWHERE ELSE. It is read from the environment
      in this process, used in this process, and never appears in any response.
      /api/llm/status returns whether one is configured and which model would
      run. It does not return the key, a prefix of it, or its length.

   2. WORKFLOW MUTATION HAPPENS HERE. The browser cannot change a candidate's
      state. It asks, the workflow engine decides, and a refusal comes back with
      a reason. Moving that logic to the client would make every rule in it a
      suggestion.

   3. STATE SURVIVES A REFRESH. Everything is written to a JSON file, so
      reloading the page picks the demo up exactly where it was.

   Run it:   node server/index.js
   Then:     http://localhost:4173
   ============================================================================ */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const { Store } = require('./lib/store');
const { makeClock, freshAnchors } = require('./lib/clock');
const { seed, TENANT, TENANT_NAME } = require('./lib/seed');
const { tick } = require('./lib/tick');
const WF = require('./lib/workflow');
const SC = require('./lib/screening');
const LLM = require('./lib/llm');
const EV = require('./lib/events');
const V = require('./lib/views');
const AGENT = require('./lib/agent/runtime');
/* The candidate-facing side. PUB is an allowlist projection and INTAKE is the
   only thing that creates an application. LIVE owns the seven call stages. */
const PUB = require('./lib/public');
const INTAKE = require('./lib/intake');
const LIVE = require('./lib/livecall');
const TOOLS = require('./lib/agent/tools');
const M = require('./lib/metrics');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';

/* ----------------------------------------------------------------- env ---
   A .env file next to the server, if there is one. Two lines of parsing rather
   than a dependency. Values already in the environment win, so an inline
   LLM_API_KEY=... on the command line overrides the file.
   ------------------------------------------------------------------------ */

(function loadEnv() {
  const file = path.join(__dirname, '.env');
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch (e) { return; }
  raw.split('\n').forEach((line) => {
    const s = line.trim();
    if (!s || s[0] === '#') return;
    const i = s.indexOf('=');
    if (i < 0) return;
    const k = s.slice(0, i).trim();
    let v = s.slice(i + 1).trim();
    if ((v[0] === '"' && v.slice(-1) === '"') || (v[0] === "'" && v.slice(-1) === "'")) v = v.slice(1, -1);
    if (process.env[k] == null || process.env[k] === '') process.env[k] = v;
  });
})();

/* --------------------------------------------------------------- state --- */

const store = new Store();
store.load();
const clock = makeClock(() => store.db.meta.anchors || (store.db.meta.anchors = freshAnchors()));

/** Who the request is acting as. A person, unless it says otherwise. */
function contextFor(query) {
  const tenant = store.allGlobal('tenants').find((t) => t.id === TENANT);
  const people = tenant ? tenant.people : {};
  const key = query.as && people[query.as] ? query.as : 'marcus';
  const p = people[key] || { name: 'Store manager', role: 'Store manager' };
  return {
    tenantId: TENANT, tenantName: TENANT_NAME, clock,
    // The browser is being driven by a person, so the actor type is human.
    // That is what makes a confirmation a genuine human act rather than a
    // machine confirming its own request.
    actor: { type: 'human', name: p.name, role: p.role, key }
  };
}

let ticking = false;
function advanceWorld() {
  if (ticking) return [];
  ticking = true;
  try {
    return tick(store, { tenantId: TENANT, tenantName: TENANT_NAME, clock,
                         actor: { type: 'external', name: 'External system' } });
  } finally { ticking = false; }
}

/* ------------------------------------------------------------- plumbing --- */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

function send(res, code, body, headers) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  res.writeHead(code, Object.assign({
    'Content-Length': buf.length,
    // The demo is developed against a moving target and browsers cache hard
    // from localhost. That produced false measurements repeatedly during the
    // browser-only build, so nothing here is cacheable.
    'Cache-Control': 'no-store, max-age=0'
  }, headers || {}));
  res.end(buf);
}

function json(res, code, obj) {
  send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const chunks = [];
    req.on('data', (c) => {
      n += c.length;
      if (n > 1e6) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error('body is not JSON')); }
    });
    req.on('error', reject);
  });
}

/* ---------------------------------------------------------------- static -- */

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.join(ROOT, rel);
  // Nothing outside the demo folder is servable, whatever the path says.
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return send(res, 403, 'No.');
  if (file.indexOf(path.join(ROOT, 'server')) === 0) return send(res, 403, 'The server directory is not servable.');
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'Not found: ' + rel);
    send(res, 200, buf, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  });
}

/* ------------------------------------------------------------------ api --- */

const READ_VIEWS = {
  bootstrap: V.bootstrap, deck: V.deck, decide: V.decide, screening: V.screening,
  pipeline: V.pipeline, candidate: V.candidate, flag: V.flag, compliance: V.compliance,
  checks: V.checks, funnel: V.funnel, store: V.store, sources: V.sources, audit: V.audit
};

async function api(req, res, pathname, query) {
  const ctx = contextFor(query);
  const seg = pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  /* ---------- status: safe to expose, and deliberately thin ---------- */
  if (seg[0] === 'llm' && seg[1] === 'status') return json(res, 200, LLM.publicStatus());

  if (seg[0] === 'health') {
    return json(res, 200, {
      ok: true, now: clock.now(), simNow: new Date(clock.now()).toISOString(),
      seeded: !!store.db.meta.seededAt,
      candidates: store.db.candidates.length, applications: store.db.applications.length,
      llm: LLM.publicStatus()
    });
  }

  /* ---------- the world moves before every read ---------- */
  if (req.method === 'GET') {
    advanceWorld();

    /* ---------- candidate-facing reads ----------
       Served to somebody who is not logged in. Every payload comes from
       lib/public.js, which is an allowlist and throws rather than emit an
       internal field. Nothing here takes a candidate identifier, because
       U-93 refuses a candidate-facing status surface. */
    if (seg[0] === 'public' && seg[1] === 'careers') {
      return json(res, 200, { ok: true, now: clock.now(),
        data: PUB.careers(store, ctx, query) });
    }
    if (seg[0] === 'public' && seg[1] === 'job') {
      const out = PUB.applyForm(store, ctx, { requisitionId: query.requisitionId });
      return json(res, out.ok === false ? 404 : 200,
        { ok: out.ok !== false, now: clock.now(), data: out });
    }
    if (seg[0] === 'public' && seg[1] === 'voice' && seg[2] === 'status') {
      return json(res, 200, { ok: true, data: LIVE.transportStatus() });
    }

    if (seg[0] === 'view' && READ_VIEWS[seg[1]]) {
      const out = READ_VIEWS[seg[1]](store, ctx, query);
      return json(res, 200, { ok: true, now: clock.now(), actor: ctx.actor, data: out });
    }
    if (seg[0] === 'pending') {
      return json(res, 200, { ok: true, pending: AGENT.pending(store, ctx) });
    }
    if (seg[0] === 'tools') {
      return json(res, 200, { ok: true, tools: TOOLS.TOOLS.map((t) => ({
        name: t.name, kind: t.kind, confirm: t.confirm, description: t.description })) });
    }
    return json(res, 404, { ok: false, error: 'No such read endpoint: ' + pathname });
  }

  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' });

  const body = await readBody(req);

  /* ---------- wind the simulated clock forward ----------
     Honest, and the most useful control in the product for a demo. It does not
     fake any data: it moves the present, and then the ordinary ticker runs. A
     county court returns because its expected time has genuinely passed, an
     offer expires because three days have genuinely gone by. Everything that
     happens next happened for the real reason.
     ------------------------------------------------------------------------ */
  if (seg[0] === 'sim' && seg[1] === 'advance') {
    const hours = Math.max(0, Math.min(24 * 120, Number(body.hours) || 24));
    store.db.meta.anchors.sim += hours * 3600000;
    store.markDirty();
    const changed = advanceWorld();
    store.flushNow();
    return json(res, 200, {
      ok: true, advancedHours: hours, now: clock.now(),
      simNow: new Date(clock.now()).toISOString(),
      changes: changed,
      note: 'The clock moved. Nothing was faked: every change below happened because its expected time passed.'
    });
  }

  /* ---------- candidate-facing writes ----------
     This is the front of the live demo spine. An application created here goes
     through the same twenty steps as the thirty-six that were seeded. */
  if (seg[0] === 'public' && seg[1] === 'apply') {
    advanceWorld();
    const out = INTAKE.apply(store, ctx, {
      requisitionId: body.requisitionId, form: body.form, formMs: body.formMs
    });
    store.flushNow();
    return json(res, out.ok ? 200 : 400, out);
  }

  /* ---------- the live screening call ----------
     U-34's seven stages. The application state machine is untouched: these are
     the transport's stages inside step 3. */
  if (seg[0] === 'screenings' && seg[2] === 'call') {
    advanceWorld();
    const sc = store.byId('screenings', ctx.tenantId, seg[1]);
    if (!sc) return json(res, 404, { ok: false, error: 'No such screening.' });
    const stage = String(body.stage || '').toLowerCase();
    const out = stage === 'invite' || !stage
      ? LIVE.invite(store, ctx, sc, { method: body.method })
      : LIVE.advance(store, ctx, sc, stage, {
          detail: body.detail || null, error: body.error || null,
          providerRef: body.providerRef || null,
          actorType: body.actorType || null, actor: body.actor || null
        });
    store.flushNow();
    return json(res, out.ok ? 200 : 409,
      Object.assign({ now: clock.now() }, out,
        out.ok ? { call: LIVE.publicCall(sc, clock.now()) } : {}));
  }

  /* ---------- reseed ---------- */
  if (seg[0] === 'reset') {
    const out = await seed(store);
    return json(res, 200, { ok: true, reseeded: out, now: clock.now() });
  }

  /* ---------- workflow ---------- */
  if (seg[0] === 'applications' && seg[2] === 'transition') {
    advanceWorld();
    const t = WF.transition(store, ctx, seg[1], String(body.state || '').toUpperCase(), {
      reason: body.reason || null, source: 'ui',
      startsAt: body.startsAt || null, proposedStartAt: body.proposedStartAt || null,
      workMs: body.workMs || null
    });
    store.flushNow();
    return json(res, t.ok ? 200 : 409, t);
  }

  if (seg[0] === 'applications' && seg[2] === 'screen') {
    advanceWorld();
    const out = await SC.runFullScreening(store, ctx, seg[1], { source: 'ui', includeInterview: !!body.includeInterview });
    store.flushNow();
    return json(res, out.ok ? 200 : 409, out);
  }

  if (seg[0] === 'applications' && seg[2] === 'task') {
    // A person completing the task only a person can complete.
    const t = store.byId('onboardingTasks', ctx.tenantId, body.taskId);
    if (!t || t.applicationId !== seg[1]) return json(res, 404, { ok: false, error: 'No such task.' });
    if (t.status === 'done') return json(res, 200, { ok: true, alreadyDone: true });
    if (t.status === 'blocked') return json(res, 409, { ok: false, error: 'Still blocked by: ' + t.blockedBy });
    t.status = 'done';
    t.doneAt = clock.now();
    store.markDirty();
    EV.workflowEvent(store, ctx, {
      applicationId: t.applicationId, candidateId: t.candidateId, kind: 'work',
      step: t.step, owner: t.owner, actorType: 'human', actor: ctx.actor.name,
      durationMs: t.startedAt ? Math.min(t.estMs, clock.now() - t.startedAt) : t.estMs,
      detail: t.name + ' completed by ' + ctx.actor.name + '.'
    });
    EV.auditEvent(store, ctx, {
      action: 'onboarding.task.completed', actorType: 'human', actor: ctx.actor.name,
      applicationId: t.applicationId, candidateId: t.candidateId,
      subjectType: 'onboardingTask', subjectId: t.id,
      why: t.law ? 'Required: ' + t.law : 'Onboarding task completed.'
    });
    WF.settle(store, ctx, t.applicationId);
    store.flushNow();
    return json(res, 200, { ok: true, task: t, state: store.byId('applications', ctx.tenantId, t.applicationId).state });
  }

  if (seg[0] === 'exceptions' && seg[2] === 'resolve') {
    const e = store.byId('exceptions', ctx.tenantId, seg[1]);
    if (!e) return json(res, 404, { ok: false, error: 'No such exception.' });
    e.resolvedAt = clock.now();
    e.resolution = body.resolution || 'Resolved.';
    e.resolvedBy = ctx.actor.name;
    store.markDirty();
    EV.auditEvent(store, ctx, {
      action: 'exception.resolved', actorType: 'human', actor: ctx.actor.name,
      applicationId: e.applicationId, candidateId: e.candidateId,
      subjectType: 'exception', subjectId: e.id, why: e.resolution
    });
    if (e.applicationId) WF.settle(store, ctx, e.applicationId);
    store.flushNow();
    return json(res, 200, { ok: true, exception: e });
  }

  /* ---------- the assistant ---------- */
  if (seg[0] === 'agent' && seg[1] === 'message') {
    advanceWorld();
    const out = await AGENT.handle(store, ctx, { text: body.text, route: body.route });
    store.flushNow();
    return json(res, 200, out);
  }

  if (seg[0] === 'agent' && seg[1] === 'confirm') {
    const out = await AGENT.confirm(store, ctx, body.pendingId, body.approve !== false);
    store.flushNow();
    return json(res, out.ok ? 200 : 409, out);
  }

  if (seg[0] === 'agent' && seg[1] === 'tool') {
    /* Direct tool invocation, used by the tests and by the UI where a button
       and an assistant request should do exactly the same thing. Write tools
       still refuse without a confirmation, so this is not a side door. */
    const tool = TOOLS.BY_NAME[body.tool];
    if (!tool) return json(res, 404, { ok: false, error: 'No such tool.' });
    if (tool.confirm !== 'none' && !body.confirmed) {
      return json(res, 428, { ok: false, needsConfirmation: true, level: tool.confirm,
        consequence: tool.consequence ? tool.consequence(store, ctx, body.args || {}) : null,
        error: 'This tool changes something, so it needs a confirmation.' });
    }
    const out = await Promise.resolve(tool.run(store, ctx, body.args || {}));
    store.flushNow();
    return json(res, out.ok ? 200 : 409, out);
  }

  return json(res, 404, { ok: false, error: 'No such endpoint: ' + pathname });
}

/* ---------------------------------------------------------------- server -- */

const server = http.createServer((req, res) => {
  // WHATWG URL rather than url.parse, which Node now deprecates.
  const parsed = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const query = Object.fromEntries(parsed.searchParams);
  if (parsed.pathname.indexOf('/api') === 0) {
    api(req, res, parsed.pathname, query).catch((err) => {
      // Surface it rather than swallowing it. A demo that fails silently is
      // worse than one that fails loudly.
      console.error('[api] ' + req.method + ' ' + parsed.pathname + ': ' + (err && err.stack || err));
      json(res, 500, { ok: false, error: String(err && err.message || err) });
    });
    return;
  }
  serveStatic(req, res, parsed.pathname);
});

async function boot() {
  if (!store.db.meta.seededAt || process.env.RESEED === '1') {
    const out = await seed(store);
    console.log('[seed] ' + out.candidates + ' candidates, ' + out.applications +
                ' applications, ' + out.events + ' workflow events');
  } else {
    console.log('[state] loaded ' + store.db.candidates.length + ' candidates from ' + store.file);
  }
  advanceWorld();
  store.flushNow();

  // The outside world keeps moving while nobody is looking.
  const timer = setInterval(() => { advanceWorld(); store.markDirty(); }, 15000);
  if (timer.unref) timer.unref();

  server.listen(PORT, HOST, () => {
    const s = LLM.publicStatus();
    console.log('');
    console.log('  Frontline hiring, running at  http://' + HOST + ':' + PORT);
    console.log('  Overview page                 http://' + HOST + ':' + PORT + '/index.html');
    console.log('  The product                   http://' + HOST + ':' + PORT + '/app.html');
    console.log('');
    console.log('  Model:  ' + (s.configured
      ? s.model + ' via ' + s.provider
      : 'none configured. Screening falls back to the deterministic phrase bank rubric.'));
    console.log('  State:  ' + store.file);
    console.log('');
  });
}

process.on('SIGINT', () => { store.flushNow(); process.exit(0); });
process.on('SIGTERM', () => { store.flushNow(); process.exit(0); });

if (require.main === module) boot();

module.exports = { server, store, boot, contextFor, advanceWorld };
