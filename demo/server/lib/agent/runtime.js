/* ============================================================================
   agent/runtime.js  ·  one turn of the assistant

   Two ways in, one way through.

     No LLM key   the local classifier picks an intent and the intent maps to a
                  tool. Twenty-seven intents, three case suites, and it runs
                  entirely in this process with no network call.
     LLM key set  the model is given the same tool schemas and picks for itself.

   Both routes end at the SAME tool registry, and the tools are the only thing
   that can change data. That is the point of the design. A safety rule written
   into a prompt is a request. A safety rule written into the tool layer holds
   whichever route asked, and it holds when the model is wrong.

   What the model is never allowed to do:
     - execute a write without a confirmation from a person
     - produce the numbers in an answer. The tool result is rendered by the
       client from structured data, and the model's prose sits above it. If the
       two ever disagree, the data is what is on screen.
     - state that an action happened. Only a tool result can say that, and only
       when the backend returned ok.

   Every turn writes an agentActions row whether it succeeded, was refused, was
   only asked about, or was cancelled.
   ============================================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const T = require('./tools');
const LLM = require('./../llm');
const EV = require('./../events');
const STEPS = require('./../../../js/steps.js');

/* ------------------------------------------------- the local classifier --- */

/* nlu.js is a browser file with no module system, on purpose, so it can be
   loaded from a script tag and from the test harness unchanged. Evaluating it
   in a small shim is how this process gets at the same classifier the three
   case suites test, rather than a second copy that could drift from it. */
const NLU = (function loadNLU() {
  const shim = { window: {} };
  shim.window.STEPS = STEPS;
  const src = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'js', 'nlu.js'), 'utf8');
  const fn = new Function('window', src + '\nreturn window.NLU;');
  return fn(shim.window);
})();

/** Names the classifier can resolve, built from the live database. */
function buildRoster(store, ctx) {
  const out = [], seen = {};
  const add = (name, kind, row) => {
    if (!name || seen[name]) return;
    seen[name] = 1;
    out.push({ name, kind, row, first: String(name).split(' ')[0].toLowerCase() });
  };
  store.all('candidates', ctx.tenantId).forEach((c) => {
    const a = store.where('applications', ctx.tenantId, (x) => x.candidateId === c.id)[0];
    const st = a ? a.state : '';
    // The classifier uses kind to imply a concept: naming somebody whose case
    // is an E-Verify mismatch is asking a compliance question by implication.
    const kind = st === 'DECISION_PENDING' ? 'decision'
      : st === 'ELIGIBILITY_REVIEW' ? 'flagged'
      : st.indexOf('BACKGROUND_CHECK') === 0 ? 'check'
      : (a && a.everify) ? 'newhire'
      : (st === 'FIRST_SHIFT_SCHEDULED' || st === 'READY_FOR_SHIFT') ? 'start'
      : st === 'SCREENING_PENDING' ? 'review' : 'candidate';
    add(c.name, kind, c);
  });
  const tenant = store.allGlobal('tenants').find((t) => t.id === ctx.tenantId);
  if (tenant) Object.keys(tenant.people).forEach((k) => add(tenant.people[k].name, 'user', tenant.people[k]));
  store.all('stores', ctx.tenantId).forEach((s) => add(s.manager, 'user', s));
  return out;
}

/* -------------------------------------------- intent to tool, and its args -

   The classifier answers "what did they mean". This table answers "so what do
   we run". Keeping them apart is what let the classifier keep its three test
   suites while the tools underneath were rebuilt.
   ------------------------------------------------------------------------- */

const NUM = (norm) => { const m = norm.match(/\b(\d{1,3})\b/); return m ? Number(m[1]) : null; };
const HOURS = (norm) => {
  let m = norm.match(/(\d+)\s*(hour|hr)/);
  if (m) return Number(m[1]);
  m = norm.match(/(\d+)\s*day/);
  if (m) return Number(m[1]) * 24;
  if (/\btwo days\b/.test(norm)) return 48;
  if (/\bthree days\b/.test(norm)) return 72;
  return null;
};

const ROUTES = {
  approve_candidate:  (r) => ({ tool: 'approve_candidate', args: { name: person(r) } }),
  reject_candidate:   (r) => ({ tool: 'reject_candidate', args: { name: person(r) } }),
  approve_batch:      (r) => ({ tool: 'approve_batch',
                                args: { recommendationIs: 'advance', minConfidence: null,
                                        scoreOver: NUM(r.norm) } }),
  send_offer:         (r) => ({ tool: 'send_offer', args: { name: person(r) } }),
  start_check:        (r) => ({ tool: 'initiate_background_check', args: { name: person(r) } }),
  run_screening:      (r) => ({ tool: 'schedule_screening',
                                args: /\b(all|every|everyone|eligible)\b/.test(r.norm)
                                  ? { allEligible: true } : { name: person(r) } }),
  assign_candidate:   (r) => ({ tool: 'assign_candidate', args: { name: person(r) } }),
  remove_shift:       (r) => ({ tool: 'remove_shift', args: { name: person(r) } }),

  queue_summary:      () => ({ tool: 'get_attention_queue', args: {} }),
  pending_decisions:  () => ({ tool: 'get_pending_decisions', args: {} }),
  recent_activity:    () => ({ tool: 'get_audit', args: { limit: 12 } }),
  waiting_long:       (r) => ({ tool: 'search_candidates',
                                args: { waitingLongerThanHours: HOURS(r.norm) || 48, limit: 12 } }),
  explain_flag:       () => ({ tool: 'get_blocked_candidates', args: {} }),
  compliance_status:  () => ({ tool: 'get_compliance', args: {} }),
  slow_checks:        () => ({ tool: 'get_slow_checks', args: {} }),
  day_one_risk:       () => ({ tool: 'get_day_one_risk', args: {} }),
  confirm_signal:     () => ({ tool: 'get_day_one_risk', args: {} }),
  explain_stage:      (r) => ({ tool: 'get_pipeline', args: {}, focusStep: r.entities.step ? r.entities.step.n : null }),
  review_held:        () => ({ tool: 'get_screening_queue', args: {} }),
  screening_done:     () => ({ tool: 'get_screening_queue', args: { completedOnly: true } }),
  candidate_status:   (r) => ({ tool: 'get_candidate', args: { name: person(r) } }),
  candidate_timeline: (r) => ({ tool: 'get_candidate_timeline', args: { name: person(r) } }),
  report_metric:      () => ({ tool: 'get_store_metrics', args: {} }),
  store_bottleneck:   () => ({ tool: 'get_bottleneck', args: {} })
};

/** Intents the client owns. Nothing on the server changes. */
const CLIENT_ONLY = {
  nav_goto: 'navigate', reset_demo: 'reset', set_theme: 'theme', help: 'help'
};

function person(r) { return r.entities.person ? r.entities.person.name : null; }

/* ------------------------------------------------------------- one turn --- */

async function handle(store, ctx, input) {
  const text = String(input.text || '').trim();
  if (!text) return { ok: false, reply: 'Say something and I will look it up.' };

  const cfg = LLM.config();
  const useLLM = cfg.hasKey && input.route !== 'nlu';
  return useLLM ? llmTurn(store, ctx, text) : nluTurn(store, ctx, text);
}

/* ------------------------------------------------------- the local route -- */

async function nluTurn(store, ctx, text) {
  NLU.provide({ roster: () => buildRoster(store, ctx), steps: STEPS });
  const r = NLU.classify(text);

  if (CLIENT_ONLY[r.intent]) {
    EV.agentAction(store, ctx, { utterance: text, route: 'nlu', intent: r.intent,
      confidence: r.confidence, outcome: 'ok', actor: ctx.actor.name,
      resultSummary: 'Client action: ' + CLIENT_ONLY[r.intent] });
    return { ok: true, route: 'nlu', intent: r.intent, confidence: r.confidence,
             clientAction: CLIENT_ONLY[r.intent], reply: null, working: working(r) };
  }

  const route = ROUTES[r.intent];
  if (!route) {
    EV.agentAction(store, ctx, { utterance: text, route: 'nlu', intent: 'unknown',
      confidence: r.confidence, outcome: 'refused', actor: ctx.actor.name,
      resultSummary: r.outOfScope ? ('out of scope: ' + r.outOfScope) : 'no intent matched' });
    return {
      ok: false, route: 'nlu', intent: 'unknown', confidence: r.confidence,
      reply: notUnderstood(r), working: working(r),
      alternatives: (r.alternatives || []).filter((a) => a.score > 0).slice(0, 2)
    };
  }

  const picked = route(r);
  return execute(store, ctx, {
    tool: picked.tool, args: picked.args || {}, utterance: text,
    route: 'nlu', intent: r.intent, confidence: r.confidence,
    working: working(r), focusStep: picked.focusStep || null
  });
}

function working(r) {
  return {
    intent: r.intent, confidence: r.confidence, margin: r.margin,
    concepts: r.concepts, matched: (r.tokens || []).slice(0, 12),
    person: r.entities && r.entities.person ? r.entities.person.name : null,
    flags: r.flags || [], outOfScope: r.outOfScope || null,
    note: 'Classified in this process. No model was called.'
  };
}

function notUnderstood(r) {
  if (r.outOfScope) {
    if (String(r.outOfScope).indexOf('undo') === 0) {
      return 'There is no undo. Everything here is an employment record, so a change is corrected by making another one that says who changed it and why, not by erasing the first.';
    }
    if (String(r.outOfScope).indexOf('exclusion') === 0) {
      return 'I will not act on "everyone except". Naming the exception is safer than trusting me to work out who is left.';
    }
    if (/ignore|disregard|forget|system prompt|you are now|new instructions|override|act as/.test(String(r.outOfScope))) {
      return 'No. I have a fixed set of actions and no configuration surface, so there is nothing in me to reconfigure.';
    }
    return 'That is outside what I do. I work on candidates, screenings, decisions, offers, checks, onboarding and the compliance clocks.';
  }
  /* Order matters. A bulk rejection also trips the no-person flag, and
     answering "which person?" to "reject everyone who scored below 60" invites
     the user to name one, which is not the objection at all. */
  if ((r.flags || []).indexOf('bulk-reject-unsupported') >= 0) return 'I do not do bulk rejections, and there is no tool behind me that could. A wrong bulk approval is fixed by a conversation. A wrong bulk rejection is not fixable at all. Name them one at a time, or open the approvals screen.';
  if ((r.flags || []).indexOf('multiple-people') >= 0) return 'That names more than one person and it is a single action, so I would have to pick one of them. Ask me once for each.';
  if ((r.flags || []).indexOf('asked-not-instructed') >= 0) return 'That reads as a question about the action rather than an instruction to do it. If you want it done, tell me plainly.';
  if ((r.flags || []).indexOf('order-without-subject') >= 0) return 'That reads as an instruction, but it does not say who for. Name them and I will do it.';
  if ((r.flags || []).indexOf('no-person') >= 0) return 'Which person? Name them and I will do it.';
  if ((r.flags || []).indexOf('negated') >= 0) return 'That reads as an instruction NOT to do something, so I have done nothing.';
  return 'I did not follow that with enough confidence to act on it.';
}

/* --------------------------------------------------------- the LLM route -- */

const SYSTEM = [
  'You are the assistant inside a frontline hiring product used by store managers at a US retailer.',
  '',
  'Answer from the tools. Never state a number, a name, a count or a status that did not come back from a tool call in this turn.',
  'If you have not called a tool, you do not know the answer.',
  '',
  'You may never say that an action has been carried out. Write-tools return to the user through a confirmation step you do not control, and the product renders the outcome itself. Describe what WILL happen, not what has happened.',
  '',
  'You cannot approve or reject anybody. A named person makes hiring decisions. You can put somebody in front of them with the evidence.',
  '',
  'Keep replies to a few short sentences of plain English. The structured detail is rendered under your reply, so do not repeat lists of numbers in prose.',
  'No em dashes.'
].join('\n');

async function llmTurn(store, ctx, text) {
  const res = await LLM.chat(SYSTEM, [{ role: 'user', content: text }], T.schemas());

  if (!res.ok) {
    EV.agentAction(store, ctx, { utterance: text, route: 'llm', outcome: 'failed',
      error: res.error, actor: ctx.actor.name });
    // Falling back is better than failing, and saying so is better than hiding it.
    const local = await nluTurn(store, ctx, text);
    local.degraded = 'The model call failed (' + res.error + '), so this answer came from the local classifier instead.';
    return local;
  }

  if (!res.toolCalls || !res.toolCalls.length) {
    EV.agentAction(store, ctx, { utterance: text, route: 'llm', outcome: 'ok',
      actor: ctx.actor.name, resultSummary: 'answered without a tool call' });
    return { ok: true, route: 'llm', reply: res.text, model: res.model,
             working: { note: 'Answered by ' + res.model + ' with no tool call, so there is no data behind it.',
                        route: 'llm', latencyMs: res.latencyMs } };
  }

  const call = res.toolCalls[0];
  return execute(store, ctx, {
    tool: call.name, args: call.args || {}, utterance: text,
    route: 'llm', intent: call.name, prose: res.text, model: res.model,
    working: { note: 'Tool chosen by ' + res.model + '. The numbers below came from the tool, not the model.',
               route: 'llm', tool: call.name, args: call.args, latencyMs: res.latencyMs }
  });
}

/* -------------------------------------------------------------- execute --- */

/**
 * Runs a tool, or parks it for confirmation first.
 *
 * A parked action is written to the database rather than held in memory, so
 * refreshing the browser mid-confirmation does not lose it and does not
 * silently execute it either.
 */
async function execute(store, ctx, o) {
  const tool = T.BY_NAME[o.tool];
  if (!tool) {
    EV.agentAction(store, ctx, { utterance: o.utterance, route: o.route, intent: o.intent,
      tool: o.tool, outcome: 'failed', error: 'no such tool', actor: ctx.actor.name });
    return { ok: false, reply: 'I tried to use a tool that does not exist, which is my fault rather than yours.', working: o.working };
  }

  if (tool.confirm !== 'none') {
    const consequence = tool.consequence ? tool.consequence(store, ctx, o.args) : null;
    const pending = {
      id: store.nextId('pen'),
      tenantId: ctx.tenantId,
      at: ctx.clock.now(),
      tool: tool.name,
      args: o.args,
      level: tool.confirm,
      utterance: o.utterance,
      route: o.route,
      requestedBy: ctx.actor.name,
      consequence,
      status: 'pending'
    };
    store.insert('pendingActions', pending);
    EV.agentAction(store, ctx, { utterance: o.utterance, route: o.route, intent: o.intent,
      confidence: o.confidence, tool: tool.name, args: o.args, needsConfirmation: true,
      outcome: 'pending', actor: ctx.actor.name, resultSummary: consequence });

    return {
      ok: true, route: o.route, intent: o.intent, confidence: o.confidence,
      needsConfirmation: true,
      pendingId: pending.id,
      level: tool.confirm,
      reply: o.prose || null,
      confirmPrompt: consequence,
      // The wording changes with the level because the two are not the same act.
      confirmLabel: tool.confirm === 'human_decision' ? 'Yes, and record it against me' : 'Yes, do it',
      humanDecisionNote: tool.confirm === 'human_decision'
        ? 'This is a hiring decision. Confirming it records ' + ctx.actor.name + ' as the person who made it.'
        : null,
      working: o.working
    };
  }

  const result = await Promise.resolve(tool.run(store, ctx, o.args));
  EV.agentAction(store, ctx, { utterance: o.utterance, route: o.route, intent: o.intent,
    confidence: o.confidence, tool: tool.name, args: o.args,
    outcome: result.ok ? 'ok' : (result.refused ? 'refused' : 'failed'),
    error: result.error || null, actor: ctx.actor.name, resultSummary: result.summary || result.error });

  return {
    ok: result.ok, route: o.route, intent: o.intent, confidence: o.confidence,
    tool: tool.name, kind: tool.kind,
    reply: o.prose || null,
    summary: result.summary || null,
    error: result.error || null,
    refused: result.refused || null,
    data: result.data || null,
    focusStep: o.focusStep || null,
    working: o.working
  };
}

/* -------------------------------------------------------------- confirm --- */

async function confirm(store, ctx, pendingId, approve) {
  const p = store.byId('pendingActions', ctx.tenantId, pendingId);
  if (!p) return { ok: false, error: 'That request is no longer waiting for an answer.' };
  if (p.status !== 'pending') return { ok: false, error: 'That was already ' + p.status + '.' };

  if (!approve) {
    p.status = 'cancelled';
    p.resolvedAt = ctx.clock.now();
    store.markDirty();
    EV.agentAction(store, ctx, { utterance: p.utterance, route: p.route, tool: p.tool,
      args: p.args, needsConfirmation: true, confirmed: false, outcome: 'cancelled',
      actor: ctx.actor.name, resultSummary: 'Cancelled before anything ran.' });
    return { ok: true, cancelled: true, summary: 'Nothing changed.' };
  }

  /* The confirmation is the human act. A hiring decision runs with the actor
     set to the person who pressed the button, and the workflow engine still
     checks by:['human'] underneath, so this cannot be forged by an agent
     calling confirm on its own behalf. */
  if (p.level === 'human_decision' && ctx.actor.type !== 'human') {
    EV.agentAction(store, ctx, { utterance: p.utterance, route: p.route, tool: p.tool,
      args: p.args, needsConfirmation: true, confirmed: false, outcome: 'refused',
      actor: ctx.actor.name, error: 'confirmation must come from a person' });
    return { ok: false, error: 'A hiring decision has to be confirmed by a person. This request came from a ' + ctx.actor.type + '.' };
  }

  const tool = T.BY_NAME[p.tool];
  const result = await Promise.resolve(tool.run(store, ctx, p.args));

  p.status = result.ok ? 'executed' : 'failed';
  p.resolvedAt = ctx.clock.now();
  p.result = { ok: result.ok, summary: result.summary || null, error: result.error || null };
  store.markDirty();

  EV.agentAction(store, ctx, { utterance: p.utterance, route: p.route, tool: p.tool,
    args: p.args, needsConfirmation: true, confirmed: true,
    outcome: result.ok ? 'ok' : (result.refused ? 'refused' : 'failed'),
    error: result.error || null, actor: ctx.actor.name,
    resultSummary: result.summary || result.error });
  EV.auditEvent(store, ctx, {
    action: 'assistant.' + p.tool, actorType: ctx.actor.type, actor: ctx.actor.name,
    applicationId: (result.data && result.data.brief && result.data.brief.applicationId) || null,
    candidateId: (result.data && result.data.brief && result.data.brief.candidateId) || null,
    outcome: result.ok ? 'ok' : (result.refused ? 'refused' : 'failed'),
    why: 'Requested through the assistant as "' + p.utterance + '", confirmed by ' + ctx.actor.name + '.',
    detail: { tool: p.tool, args: p.args, level: p.level }, source: 'assistant'
  });

  return {
    ok: result.ok, tool: p.tool, summary: result.summary || null,
    error: result.error || null, refused: result.refused || null,
    data: result.data || null,
    confirmedBy: ctx.actor.name, confirmedAt: p.resolvedAt
  };
}

/** Anything still waiting for an answer, so a refresh can pick it back up. */
function pending(store, ctx) {
  return store.where('pendingActions', ctx.tenantId, (p) => p.status === 'pending')
    .sort((a, b) => b.at - a.at);
}

module.exports = { handle, confirm, pending, buildRoster, NLU, ROUTES, SYSTEM };
