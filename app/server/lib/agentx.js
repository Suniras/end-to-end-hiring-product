/* ============================================================================
   agentx.js  ·  the voice transport

   The ONLY place this application talks to agentX. Every contract below was
   read from the live OpenAPI at external-proxy-us.nurixlabs.tech on
   8 September 2026, or from the shipped IVR navigator build that uses it. None
   of it is guessed, and where something is unconfirmed it says so.

   HONESTY, which is the rule this file exists to keep. `mode()` resolves to
   'live' only when the pinned provider host and a full credential are both
   there, to 'fixture' against a recorded stand-in on this machine, and to
   'simulated' when there is nothing to call. Every record carries the mode it
   ran under, so nothing can describe a fixture or a simulation as a real call.
   Two things were needed to make that true rather than stated: the host is
   pinned, and a placed call is only a placed call when the provider returns the
   fields that make one.

   WHAT IS VERIFIED AND WHAT IS NOT
   Verified live: the host, header-only auth, the two call-placement contracts,
   the five result endpoints, the transcript item shapes, the error shapes.
   Verified from the shipped build: the LiveKit text-stream mechanism for a live
   transcript, including that RoomEvent.TranscriptionReceived never fires for
   these agents and the 2 second dedupe is required.
   NOT verified: the webhook callback body, because registering one needs an
   agent we own. Programmatic hangup has no confirmed endpoint: the one the
   shipped build calls returns 404 and is absent from the spec.

   NO PUBLIC ADDRESS IS NEEDED. The result is collected by polling the call
   record until its status is terminal and then reading five endpoints. That
   means the demo works from anywhere that can make outbound HTTPS requests,
   and the webhook is an optimisation rather than a prerequisite. This settles
   the hosting question in the direction of "less infrastructure".

   A CALL ID IS A SECRET. The transcript endpoint answers with no auth at all,
   verified, so anybody holding a call id can read that call's words. Call ids
   stay server side. Nothing in this file returns one to a candidate-facing
   payload, and `publicStatus` exists because the operator status object carries
   the vendor host and the agent id and was being served to anonymous
   applicants.
   ============================================================================ */

/* external-proxy-us is the entry point that answers. The other host that
   resolves, agentx-us, TCP times out on every one of its IPs from here, so this
   is the host the product uses. The variable exists so a fixture can stand in
   for the provider during a test, and `resolveTarget` below decides what any
   given value is allowed to be. */
const BASE = process.env.AGENTX_BASE || 'https://external-proxy-us.nurixlabs.tech';

/* THE CREDENTIAL IS THREE PLAIN HEADERS AND IT IS SHAPED LIKE CONFIGURATION,
   which is the problem. A workspace id, an email address and a three digit user
   id spend money at the provider, and there is no bearer token, no signature and
   no expiry, so there is nothing to rotate. Things named "workspace id" and
   "user email" get pasted into tickets, screenshots and chat by everybody who
   handles them.

   ALL THREE OF THESE ARE CREDENTIAL MATERIAL and are handled like a key: they
   are read here, they are never logged, they never reach a response body and
   they are only ever sent to the pinned host. AGENTX_WORKSPACE_SECRET is the
   name to use, and the old AGENTX_WORKSPACE_ID is still read so that renaming
   it in the environment is not one change that has to land at the same instant.

   The real fix is not ours. This needs a rotatable per-integration token with a
   scope and an expiry before a retailer signs a data processing agreement, and
   the provider's transcript endpoint needs auth at all. Both are questions for
   whoever owns agentX. */
const WORKSPACE = process.env.AGENTX_WORKSPACE_SECRET || process.env.AGENTX_WORKSPACE_ID || null;
const AGENT     = process.env.AGENTX_AGENT_ID || null;
const USER_EMAIL = process.env.AGENTX_USER_EMAIL || null;
const USER_ID    = process.env.AGENTX_USER_ID || null;

/* ------------------------------------------------------ where we may talk ---
   THE HOST IS PINNED, and this is a defect fix rather than tidiness. The base
   was read straight out of an environment variable with no check, so a review
   pointed the product at a host of their own and the product sent it all three
   credential headers in cleartext. Anything not on this list gets no request
   and no header, the transport reports itself off, and the reason says which
   host was refused.

   Only the host that has actually been verified is pinned. The loopback
   addresses are allowed because the failure paths have to be testable against a
   fixture without placing a real call, and a fixture NEVER reports itself as
   live: `mode()` returns 'fixture' for it, so no record can describe a fixture
   call as a real one.

   The scheme is checked too. The credential is three plain headers with no
   signature and no expiry, so sending it over http would put it on the wire in
   clear. Loopback is exempt because it never leaves the machine.
   -------------------------------------------------------------------------- */

const PINNED_HOST = 'external-proxy-us.nurixlabs.tech';
const LOOPBACK = ['127.0.0.1', 'localhost', '[::1]', '::1'];

const TARGET = resolveTarget(BASE);

function resolveTarget(raw) {
  let u = null;
  try { u = new URL(String(raw)); } catch (e) {
    return { kind: 'refused', host: null, why: 'AGENTX_BASE is not a URL, so no request was ever attempted.' };
  }
  const host = u.hostname;
  if (host === PINNED_HOST) {
    if (u.protocol !== 'https:') {
      return { kind: 'refused', host,
        why: 'AGENTX_BASE names the provider over ' + u.protocol.replace(':', '') +
             '. The credential is three plain headers with no signature, so it is only ever sent over https.' };
    }
    return { kind: 'provider', host, why: null };
  }
  if (LOOPBACK.indexOf(host) >= 0) {
    return { kind: 'fixture', host,
      why: 'AGENTX_BASE points at this machine, so this is a recorded fixture and not the provider. ' +
           'Every stage is stamped fixture and nothing may read it as a live call.' };
  }
  return { kind: 'refused', host,
    why: 'AGENTX_BASE names ' + host + ', which is not the voice provider. The only allowed host is ' +
         PINNED_HOST + ', and no credential header is sent anywhere else.' };
}

/**
 * 'live' with the provider and a full credential. 'fixture' against a local
 * recorded stand-in. 'simulated' when there is nothing to call.
 */
function mode() {
  if (TARGET.kind === 'refused') return 'simulated';
  if (!(WORKSPACE && AGENT && USER_EMAIL)) return 'simulated';
  return TARGET.kind === 'fixture' ? 'fixture' : 'live';
}

/**
 * What an OPERATOR interface may say about the transport. Written here so no
 * page can invent a friendlier sentence.
 *
 * NOT FOR A CANDIDATE. This carries the vendor host, the agent id and the names
 * of the environment variables the server reads. It was being served on a
 * candidate-facing route to anonymous applicants, which published one third of
 * the provider's identity triplet, and the provider's transcript endpoint takes
 * no auth at all. `publicStatus` below is the shape a candidate may see.
 */
function status() {
  const m = mode();
  const missing = [];
  if (!WORKSPACE) missing.push('AGENTX_WORKSPACE_SECRET');
  if (!AGENT) missing.push('AGENTX_AGENT_ID');
  if (!USER_EMAIL) missing.push('AGENTX_USER_EMAIL');
  return {
    mode: m,
    configured: m !== 'simulated',
    base: BASE,
    target: TARGET.kind,
    agentId: m !== 'simulated' ? AGENT : null,
    missing,
    note: m === 'live'
      ? 'Voice runs through agentX. The transcript and the post-call analysis are read back from the provider after the call ends.'
      : m === 'fixture'
        ? TARGET.why
        : (TARGET.kind === 'refused' ? TARGET.why
          : 'No voice transport is configured, so no call is placed and the provider returns nothing. Every stage is recorded as simulated and stays that way.')
  };
}

/**
 * What a CANDIDATE may see. Two fields, and neither of them names the vendor,
 * the agent or our configuration.
 */
function publicStatus() {
  const m = mode();
  return {
    available: m !== 'simulated',
    why: m === 'simulated' ? 'The screening call is not available right now.' : null
  };
}

/* Header-only auth. Verified: with no workspace-id the API returns 422 naming
   it as the missing field. No bearer token and no admin key are used, and the
   admin endpoints that need one are deliberately not called.

   The credential is only ever assembled for an allowed host. A refused base
   gets the content headers and nothing else, so a bad environment value cannot
   put the credential on the wire. */
function headers(extra) {
  const h = { 'content-type': 'application/json', 'accept': 'application/json' };
  if (TARGET.kind === 'refused') return Object.assign(h, extra || {});
  if (WORKSPACE) h['workspace-id'] = WORKSPACE;
  if (USER_EMAIL) h['user-email'] = USER_EMAIL;
  if (USER_ID) h['user-id'] = String(USER_ID);
  return Object.assign(h, extra || {});
}

/**
 * One request. Returns { ok, status, body, error } and never throws, because a
 * provider failure is a thing the interface has to render rather than a crash.
 *
 * Two error shapes were confirmed live and both are handled: a missing header
 * gives 422 with an `errors` array, and a missing object gives an envelope with
 * `success: false` and a `message`.
 */
async function call(path, opts) {
  const o = opts || {};
  /* A refused host gets no request at all, not a request without headers. */
  if (TARGET.kind === 'refused') {
    return { ok: false, status: 0, body: null, error: TARGET.why };
  }
  const url = BASE + path;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), o.timeoutMs || 20000);
  try {
    const res = await fetch(url, {
      method: o.method || 'GET',
      headers: headers(o.headers),
      body: o.body ? JSON.stringify(o.body) : undefined,
      signal: ctl.signal
    });
    let body = null;
    const text = await res.text();
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = { raw: text }; }
    if (!res.ok) {
      return { ok: false, status: res.status, body, error: readError(res.status, body) };
    }
    return { ok: true, status: res.status, body, error: null };
  } catch (e) {
    /* An aborted fetch and a DNS failure both land here. The message is passed
       through as it is: inventing a friendlier reason for a failed call is the
       specific dishonesty this product forbids. */
    return { ok: false, status: 0, body: null,
             error: e.name === 'AbortError'
               ? 'The request to the voice provider timed out after ' + ((o.timeoutMs || 20000) / 1000) + ' seconds.'
               : String(e.message || e) };
  } finally {
    clearTimeout(timer);
  }
}

/** The provider's own words for what went wrong, never ours. */
function readError(httpStatus, body) {
  if (body && Array.isArray(body.errors) && body.errors.length) {
    return body.errors.map((x) => (x.loc ? x.loc.join('.') + ': ' : '') + (x.msg || '')).join('; ');
  }
  if (body && body.message) return String(body.message);
  if (body && body.detail) return String(body.detail);
  return 'The voice provider returned HTTP ' + httpStatus + ' and no reason.';
}

/* ------------------------------------------------------- placing a call --- */

/**
 * A browser call. Returns the LiveKit connection details the page needs.
 *
 * POST /voice/web/call, verified. Body { agent_id, overide_previous_context,
 * custom_dynamic_variables_config }. The misspelling of "override" is the
 * platform's and has to be sent exactly as it is.
 *
 * Returns ConnectionDetails { serverUrl, roomName, participantToken,
 * participantName, call_id }, all five required by the schema.
 *
 * `variables` is how the five prompt variables reach the agent:
 * candidate_first_name, role_title, store_name, shift_pattern, question_bank.
 */
async function startWebCall(variables) {
  if (mode() === 'simulated') {
    return { ok: false, mode: 'simulated', error: status().note, status: status() };
  }
  const r = await call('/voice/web/call', {
    method: 'POST',
    body: {
      agent_id: AGENT,
      /* True, so a second screening for the same person does not inherit the
         first one's context. A screening has to be its own conversation. */
      overide_previous_context: true,
      custom_dynamic_variables_config: variables || {}
    }
  });
  if (!r.ok) return { ok: false, mode: mode(), error: r.error, httpStatus: r.status };
  const d = r.body || {};

  /* SUCCESS IS THE FIVE FIELDS, NOT HTTP 200, and this is the worst defect this
     file has had. A review pointed the product at a host serving a maintenance
     page. It answered 200 with HTML, `res.ok` was true, and the product wrote a
     live screening call into the audit trail under the agent's name with no
     call id and no room. Nothing had been placed. One demonstrated false audit
     row is enough to stop a reviewer trusting the whole audit table. */
  const need = { call_id: d.call_id, serverUrl: d.serverUrl, roomName: d.roomName,
                 participantToken: d.participantToken };
  const missing = Object.keys(need).filter((k) => !need[k]);
  if (missing.length) {
    return { ok: false, mode: mode(), httpStatus: r.status,
             error: 'The provider answered HTTP ' + r.status + ' without ' + missing.join(', ') +
                    ', so no call was placed.',
             providerBody: describeBody(r.body) };
  }

  return {
    ok: true, mode: mode(),
    callId: d.call_id,
    serverUrl: d.serverUrl,
    roomName: d.roomName,
    token: d.participantToken,
    participantName: d.participantName
  };
}

/** What came back, in enough detail to debug and not enough to leak. */
function describeBody(body) {
  if (body == null) return 'an empty body';
  if (typeof body.raw === 'string') {
    return 'a non-JSON body of ' + body.raw.length + ' characters starting "' +
           body.raw.trim().slice(0, 40).replace(/\s+/g, ' ') + '"';
  }
  if (typeof body === 'object') {
    const keys = Object.keys(body);
    return keys.length ? 'a JSON object with keys: ' + keys.join(', ') : 'an empty JSON object';
  }
  return 'a ' + typeof body;
}

/**
 * An outbound phone call. POST /voice/outbound-call, verified.
 * Body { agent_id, number, overide_previous_context,
 * custom_dynamic_variables_config }. The destination goes in `number` in E.164.
 * Returns SIPCallResponse { call_id, status, message, cloud_fallback_call_id }.
 *
 * A trunk and a provisioned number have to exist on the workspace. There is no
 * way to check that from here without listing the trunk, so a workspace with
 * no trunk fails at this call and the provider's reason is passed through.
 */
async function startPhoneCall(number, variables) {
  if (mode() === 'simulated') {
    return { ok: false, mode: 'simulated', error: status().note, status: status() };
  }
  if (!/^\+[1-9]\d{7,14}$/.test(String(number || ''))) {
    return { ok: false, mode: mode(), error: 'That is not an E.164 phone number, so no call was attempted.' };
  }
  const r = await call('/voice/outbound-call', {
    method: 'POST',
    body: {
      agent_id: AGENT,
      number: String(number),
      overide_previous_context: true,
      custom_dynamic_variables_config: variables || {}
    }
  });
  if (!r.ok) return { ok: false, mode: mode(), error: r.error, httpStatus: r.status };
  const d = r.body || {};
  /* Same rule as the browser call. No call id means no call, whatever the HTTP
     status said. */
  if (!d.call_id) {
    return { ok: false, mode: mode(), httpStatus: r.status,
             error: 'The provider answered HTTP ' + r.status + ' without a call id, so no call was placed.',
             providerBody: describeBody(r.body) };
  }
  return { ok: true, mode: mode(), callId: d.call_id, providerStatus: d.status,
           providerMessage: d.message || null, fallbackCallId: d.cloud_fallback_call_id || null };
}

/** The trunk and number a workspace can dial out on, so the page can say
    whether an outbound call is possible before offering the button. */
async function outboundReady() {
  if (mode() === 'simulated') return { ready: false, why: status().note };
  const r = await call('/voice/sip-trunk');
  if (!r.ok) return { ready: false, why: r.error };
  const rows = Array.isArray(r.body) ? r.body : (r.body && r.body.data) || [];
  const usable = rows.filter((t) => t && (t.phone_number || t.number));
  return {
    ready: usable.length > 0,
    trunks: usable.map((t) => ({ id: t.id || t.trunk_id || null, name: t.name || null,
                                 provider: t.provider || null, number: t.phone_number || t.number || null })),
    why: usable.length ? null : 'The workspace has no outbound trunk with a number, so a phone call cannot be placed.'
  };
}

/* ------------------------------------------------- collecting the result --- */

/* CallStatus, from the spec: RNR, CONNECTED, INITIATED, QUEUED, FAILED,
   IN_PROGRESS. Two of those are ends. */
const TERMINAL = ['FAILED', 'RNR'];
const DONE_ISH = ['CONNECTED'];

function isTerminalStatus(s) {
  const v = String(s || '').toUpperCase();
  return TERMINAL.indexOf(v) >= 0 || DONE_ISH.indexOf(v) >= 0;
}

/** The call record. 42 fields. GET /voice/call/{call_id}, verified. */
async function getCall(callId) {
  const r = await call('/voice/call/' + encodeURIComponent(callId));
  if (!r.ok) return { ok: false, error: r.error, httpStatus: r.status };
  const d = r.body || {};
  return {
    ok: true,
    callId: d.call_id || callId,
    status: d.status || null,
    duration: d.duration != null ? d.duration : null,
    startTime: d.start_time || null,
    endTime: d.end_time || null,
    disposition: d.disposition_status || null,
    endReason: d.call_end_reason || null,
    humanTransfer: d.human_transfer_status || null,
    recordingUrl: d.recording_url || null,
    transcriptUrl: d.transcript_url || null,
    raw: d
  };
}

/**
 * The transcript, the tool calls, and the extracted variables in one read.
 * GET /voice/web/transcript/{call_id}?include_tool_calls=true, verified live
 * (it answers with no auth at all, and returns an `error` string rather than a
 * 404 when the call is unknown).
 *
 * Three item shapes come back, and the third is the valuable one:
 *   TranscriptItem          speaker, content, timestamps, interrupted, confidence
 *   FunctionCall            what the agent called and what came back
 *   DerivedVariableCapture  key, value, prior_value, capture_mode, and
 *                           user_turn_index, which is the turn the value came
 *                           from. That is provenance for free, and a regulated
 *                           hiring record needs exactly that.
 */
async function getTranscript(callId) {
  const r = await call('/voice/web/transcript/' + encodeURIComponent(callId) + '?include_tool_calls=true');
  if (!r.ok) return { ok: false, error: r.error, httpStatus: r.status };
  const d = r.body || {};
  if (d.error && (!d.transcript || !d.transcript.length)) {
    return { ok: false, error: String(d.error), notReady: true };
  }
  const items = Array.isArray(d.transcript) ? d.transcript : [];
  const turns = [], tools = [], captures = [];
  items.forEach((it) => {
    if (!it || typeof it !== 'object') return;
    if (it.type === 'derived_variable' || it.key !== undefined) {
      captures.push({ key: it.key, value: it.value, priorValue: it.prior_value,
                      captureMode: it.capture_mode, turnIndex: it.user_turn_index });
      return;
    }
    if (it.function_name) {
      tools.push({ name: it.function_name, args: it.args, output: it.output,
                   isError: !!it.is_error,
                   calledAt: it.call_timestamp_epoch, returnedAt: it.return_timestamp_epoch });
      return;
    }
    turns.push({ speaker: it.speaker, text: it.content,
                 normalized: it.normalized_content || null,
                 at: it.timestamp_epoch || it.timestamp || null,
                 interrupted: !!it.interrupted,
                 confidence: it.transcript_confidence != null ? it.transcript_confidence : null });
  });
  return { ok: true, turns, tools, captures, count: items.length };
}

/** The platform's post-call analysis. GET /voice/post_call/call/{call_id}. */
async function getPostCall(callId) {
  const r = await call('/voice/post_call/call/' + encodeURIComponent(callId));
  if (!r.ok) return { ok: false, error: r.error, httpStatus: r.status, notReady: r.status === 404 };
  const d = r.body || {};
  return {
    ok: true,
    /* Passed through with the platform's own names, deliberately. Renaming
       call_outcome to something that sounds like a score is how a POSITIVE on
       a call turns into a recommendation about a person. */
    callOutcome: d.call_outcome || null,
    disposition: d.disposition_status || null,
    sentiment: d.sentiment || null,
    intent: d.intent || null,
    summary: d.summary || null,
    scope: d.scope || null,
    endReason: d.call_end_reason || null,
    humanTransfer: d.human_transfer != null ? d.human_transfer : null,
    handoverReason: d.human_handover_reason || null,
    language: d.language || d.primary_language || null,
    raw: d
  };
}

/** The shorter summary. GET /voice/call/call-summary/{call_id}. */
async function getSummary(callId) {
  const r = await call('/voice/call/call-summary/' + encodeURIComponent(callId));
  if (!r.ok) return { ok: false, error: r.error, notReady: r.status === 404 };
  const d = r.body || {};
  return { ok: true, summary: d.summary || null, disposition: d.disposition_status || null,
           sentiment: d.sentiment || null, intent: d.intent || null, language: d.language || null };
}

/**
 * The agent-defined extraction, which is where our per-criterion verdicts land.
 * GET /post-conversation-data/{conversation_id}/pca-variables?agent_id={id},
 * verified live (returns input_variables and runtime_variables).
 */
async function getExtracted(conversationId) {
  if (!AGENT) return { ok: false, error: 'No agent is configured.' };
  const r = await call('/post-conversation-data/' + encodeURIComponent(conversationId) +
                       '/pca-variables?agent_id=' + encodeURIComponent(AGENT));
  if (!r.ok) return { ok: false, error: r.error, notReady: r.status === 404 };
  const d = r.body || {};
  return { ok: true, input: d.input_variables || {}, runtime: d.runtime_variables || {} };
}

/**
 * Everything about a finished call, in one pass.
 *
 * Ordered so a partial result is still useful: the call record first because it
 * says whether the call even connected, then the transcript because that is
 * what a person reads, then the analysis. A failure in any one of them is
 * recorded and does not stop the others, because a call whose analysis has not
 * been written yet still has a transcript worth showing.
 */
async function collect(callId, conversationId) {
  const out = { callId, mode: mode(), at: Date.now(), errors: [] };

  const rec = await getCall(callId);
  out.call = rec.ok ? rec : null;
  if (!rec.ok) out.errors.push({ part: 'call', error: rec.error });

  const tr = await getTranscript(callId);
  out.transcript = tr.ok ? tr : null;
  if (!tr.ok) out.errors.push({ part: 'transcript', error: tr.error, notReady: !!tr.notReady });

  const pc = await getPostCall(callId);
  out.postCall = pc.ok ? pc : null;
  if (!pc.ok) out.errors.push({ part: 'postCall', error: pc.error, notReady: !!pc.notReady });

  if (!pc.ok) {
    const sm = await getSummary(callId);
    out.summary = sm.ok ? sm : null;
    if (!sm.ok) out.errors.push({ part: 'summary', error: sm.error, notReady: !!sm.notReady });
  }

  if (conversationId) {
    const ex = await getExtracted(conversationId);
    out.extracted = ex.ok ? ex : null;
    if (!ex.ok) out.errors.push({ part: 'extracted', error: ex.error, notReady: !!ex.notReady });
  }

  /* The analysis is written some seconds after the call ends, so "not ready" is
     a normal state and is reported as such rather than as a failure. Anything
     that reads this has to be able to say "the call is done, the analysis has
     not arrived yet" without implying something broke. */
  out.complete = !!(out.transcript && out.postCall);
  out.pending = out.errors.filter((e) => e.notReady).map((e) => e.part);
  return out;
}

/* THE POLLING LOOP IS NOT HERE ANY MORE, and that is deliberate. This file used
   to carry `waitAndCollect`, which polled the call record and then collected
   once at the end. It had zero callers for as long as it existed, and a loop
   that only speaks at the end cannot move the seven live-call stages that the
   screening page renders while the call is running. The loop now lives in
   `screening.js` as `watchCall`, one poll at a time through `getCall` and
   `collect` above, so every tick can advance a stage. One loop, in the place
   that has something to do on each tick. */

/* ---------------------------------------------------------- the webhook --- */

/**
 * Registering a callback. POST /voice/webhook-manager, schema verified:
 * { webhook_url, agent_id, headers, response_metadata }, where
 * response_metadata carries six booleans that all default to true:
 * pass_transcript, pass_disposition, pass_call_context, pass_duration,
 * pass_start_time, pass_end_time.
 *
 * THE BODY THIS SENDS IS UNKNOWN. Registering one needs an agent we own, so
 * nobody has seen a callback yet. It is an optimisation and not a dependency:
 * polling needs no public address, which is why the demo does not need to be
 * publicly reachable to work.
 *
 * A SHARED SECRET IS REQUIRED, and refusing without one is the point. B-14
 * would put this product on a public URL with an endpoint that accepts a
 * transcript and a disposition and writes them into a hiring record. With no
 * secret on it, anybody could post a transcript for any call id. The secret is
 * registered here in the provider's own headers slot, which existed and was
 * being sent empty, and whatever route receives the callback has to check it
 * and has to check that the call id belongs to a screening this tenant owns.
 */
async function registerWebhook(url, secret, extraHeaders) {
  if (mode() === 'simulated') return { ok: false, error: status().note };
  if (!secret || String(secret).length < 24) {
    return { ok: false, error: 'A webhook needs a shared secret of at least 24 characters. ' +
      'Without one, the callback endpoint accepts a transcript for any call id from anybody.' };
  }
  if (!/^https:\/\//.test(String(url || ''))) {
    return { ok: false, error: 'A webhook url has to be https. The callback carries a transcript.' };
  }
  const r = await call('/voice/webhook-manager', {
    method: 'POST',
    body: {
      webhook_url: url,
      agent_id: AGENT,
      headers: Object.assign({ 'x-callback-secret': String(secret) }, extraHeaders || {}),
      response_metadata: {
        pass_transcript: true, pass_disposition: true, pass_call_context: true,
        pass_duration: true, pass_start_time: true, pass_end_time: true
      }
    }
  });
  return r.ok ? { ok: true, body: r.body } : { ok: false, error: r.error, httpStatus: r.status };
}

/* Hanging a call up programmatically has NO confirmed endpoint. The one the
   shipped build calls, POST /voice/calls/{call_id}/end, is absent from the spec
   and returns 404, and that build swallows the error. So this is not
   implemented rather than implemented wrongly: an interface that offers a hang
   up button which silently does nothing is worse than one that does not offer
   it. The browser can always leave the LiveKit room, which ends its own side. */

export {
  mode, status, publicStatus, headers, call,
  startWebCall, startPhoneCall, outboundReady,
  getCall, getTranscript, getPostCall, getSummary, getExtracted,
  collect, registerWebhook,
  isTerminalStatus, BASE, PINNED_HOST
};
