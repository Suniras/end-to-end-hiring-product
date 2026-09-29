/* ============================================================================
   chat.js  ·  the assistant panel

   The panel is the same. What is behind it changed completely on 29 August
   2026: every reply now comes from the server, where a tool ran against the
   real database, rather than from a handler in this file that read a seed
   object.

   That matters for one reason above all others. This file cannot make the
   assistant claim something happened. It renders what the server returned. If
   the workflow engine refused, the refusal is what appears, in the engine's own
   words. If a tool returned ok, an action really was recorded.

   Three rules, unchanged, now enforced a layer down rather than here:
     1. An action that changes something asks first.
     2. An action the law forbids is refused with the reason, not ignored.
     3. Every reply can show its working.
   ============================================================================ */

window.Chat = (function () {
  'use strict';

  var el = M.el;
  var refs = {}, open = false, history = [];

  /* ------------------------------------------------------------- helpers --- */

  function kvBlock(rows) {
    return el('div.ch-kv', null, rows.filter(Boolean).map(function (r) {
      return el('div', null, [el('span.k', null, r[0]), el('span.v' + (r[2] ? '.is-' + r[2] : ''), null, r[1])]);
    }));
  }

  function lines(items) {
    return el('ul.ch-list', null, items.map(function (t) { return el('li', null, t); }));
  }

  function rows(items, onPick) {
    return el('div.ch-rows', null, items.map(function (it) {
      var node = el(onPick ? 'button.ch-row' : 'div.ch-row.is-static' +
        (it.tone ? '.is-' + it.tone : ''), onPick ? {
          type: 'button',
          onclick: function () { onPick(it); }
        } : null, [
        el('span', null, it.label),
        el('span', null, it.value)
      ]);
      return node;
    }));
  }

  function ago(ms) { return E.coarse(ms); }

  /* ------------------------------------------------- rendering one result --
     One renderer per tool, so the numbers on screen come from the tool result
     and never from prose. If a tool is added and no renderer exists, the
     summary line is shown on its own rather than something invented.
     ------------------------------------------------------------------------ */

  var R = {};

  R.get_attention_queue = function (d) {
    var blocks = [];
    if (d.needsPerson.length) {
      blocks.push(el('div.ch-note', null, 'Waiting on you'));
      blocks.push(rows(d.needsPerson.slice(0, 6).map(function (b) {
        return { label: b.name + ' · ' + b.stateLabel, value: ago(b.waitingMs),
                 tone: b.blockedBy ? 'crit' : '', app: b.applicationId };
      }), openRow));
    }
    if (d.waitingExternal.length) {
      blocks.push(el('div.ch-note', null, 'Waiting on somebody outside, and not ours to move'));
      blocks.push(rows(d.waitingExternal.slice(0, 4).map(function (b) {
        return { label: b.name + ' · ' + (b.waitingOn || 'external'), value: ago(b.waitingMs), app: b.applicationId };
      }), openRow));
    }
    return blocks;
  };

  R.search_candidates = function (d) {
    if (!d.candidates.length) return [el('div.ch-note', null, 'Nobody matches.')];
    return [rows(d.candidates.map(function (b) {
      return { label: b.name + ' · ' + b.stateLabel, value: ago(b.waitingMs), app: b.applicationId };
    }), openRow)];
  };

  R.get_pending_decisions = R.search_candidates;

  R.get_blocked_candidates = function (d) {
    if (!d.items.length) return [el('div.ch-note', null, 'Nothing is blocked.')];
    return d.items.slice(0, 5).map(function (x) {
      return el('div.col.tight', { style: { marginTop: '6px' } }, [
        el('div.ch-warn', null, x.title),
        el('div.ch-note', null, (x.candidate ? x.candidate.name + '. ' : '') + (x.detail || '')),
        el('div.ch-note', null, 'Next: ' + (x.nextAction || 'not specified')),
        x.candidate ? el('button.ch-chip', { type: 'button',
          onclick: function () { openRow({ app: x.candidate.applicationId }); } }, 'Open ' + x.candidate.name) : null
      ]);
    });
  };

  R.get_candidate = function (d) {
    var b = d.brief, m = d.metrics;
    return [
      kvBlock([
        ['Role', b.role + ', ' + b.store],
        ['Stage', b.stateLabel + ' (step ' + b.step + ' of 20)'],
        ['In this stage', ago(b.waitingMs)],
        ['Since applying', E.dur(m.elapsedMs)],
        ['Of that, queued', E.dur(m.queueMs) + ', ' + E.pct(m.queueShare * 100)],
        ['People involved', String(m.peopleInvolved.length)],
        b.recommendation ? ['Screening', b.recommendation.replace(/_/g, ' ') +
          (b.confidence != null ? ', ' + Math.round(b.confidence * 100) + '% confident' : '')] : null,
        b.evaluationMode && b.evaluationMode !== 'llm' ? ['Evaluated by', 'the phrase bank rubric, not a model'] : null
      ]),
      d.exceptions.length ? el('div.ch-warn', null, d.exceptions[0].title) : null,
      el('button.ch-chip', { type: 'button', onclick: function () { openRow({ app: b.applicationId }); } },
        'Open the full record')
    ];
  };

  R.get_candidate_timeline = function (d) {
    var tl = d.timeline;
    var done = tl.steps.filter(function (s) { return s.status === 'done'; });
    var cur = tl.steps.filter(function (s) { return s.isCurrent; })[0];
    return [
      kvBlock([
        ['Steps done', done.length + ' of 20'],
        ['Now at', cur ? cur.n + '. ' + cur.name : tl.state],
        ['Owner of that step', cur ? E.ownerLabel(cur.owner) : '--'],
        ['Time in it', cur && cur.elapsedMs != null ? ago(cur.elapsedMs) : '--'],
        ['Total queue', E.dur(d.metrics.queueMs)],
        ['Total work', E.dur(d.metrics.workMs)]
      ]),
      cur && cur.nextAction ? el('div.ch-note', null, cur.nextAction) : null,
      el('button.ch-chip', { type: 'button',
        onclick: function () { openRow({ app: tl.applicationId }); } }, 'Open the timeline')
    ];
  };

  R.get_screening_queue = function (d) {
    var out = [];
    if (d.completed.length) {
      out.push(el('div.ch-note', null, 'Screened'));
      out.push(rows(d.completed.slice(0, 6).map(function (c) {
        return { label: c.name + ' · ' + c.recommendation.replace(/_/g, ' '),
                 value: Math.round(c.confidence * 100) + '%',
                 tone: c.recommendation === 'advance' ? 'good' : 'warn', app: c.applicationId };
      }), openRow));
      if (d.completed.some(function (c) { return !c.isModel; })) {
        out.push(el('div.ch-note', null, 'Some of those were evaluated by the phrase bank rubric rather than a model, because no key is configured.'));
      }
    }
    if (d.waiting.length) {
      out.push(el('div.ch-note', null, d.waiting.length + ' still waiting for a screening'));
      out.push(rows(d.waiting.slice(0, 5).map(function (b) {
        return { label: b.name, value: ago(b.waitingMs), app: b.applicationId };
      }), openRow));
    }
    return out;
  };

  R.get_compliance = function (d) {
    return d.cases.slice(0, 3).map(function (c) {
      return el('div.col.tight', { style: { marginTop: '6px' } }, [
        el('div.ch-note', null, c.name + ' · ' + c.store),
        rows(c.clocks.map(function (k) {
          return { label: k.title, value: k.done ? 'done' : k.left + ' ' + k.unit,
                   tone: k.tone === 'crit' ? 'crit' : (k.tone === 'warn' ? 'warn' : (k.done ? 'good' : '')) };
        })),
        c.adverseBar ? el('div.ch-refuse', null,
          'Adverse actions barred: ' + c.adverseBar.barred.join(', ') + '. ' + c.adverseBar.rule) : null
      ]);
    });
  };

  R.get_slow_checks = function (d) {
    if (!d.checks.length) return [el('div.ch-note', null, 'No checks are open.')];
    return [
      rows(d.checks.map(function (c) {
        return { label: c.name + (c.slowest ? ' · ' + c.slowest : ''), value: ago(c.openForMs),
                 app: c.applicationId };
      }), openRow),
      el('div.ch-note', null, 'The wait is the county court, not the agency and not us. There is nothing to chase.')
    ];
  };

  R.get_day_one_risk = function (d) {
    if (!d.shifts.length) return [el('div.ch-note', null, 'No first shifts are booked.')];
    return [
      rows(d.shifts.map(function (s) {
        return { label: s.name + ' · ' + E.fmtDay(s.startsAt), value: s.confirmState === 'confirmed' ? 'confirmed' : 'no reply',
                 tone: s.confirmState === 'confirmed' ? 'good' : 'warn', app: s.applicationId };
      }), openRow),
      el('div.ch-note', null, d.shifts[0].signal)
    ];
  };

  R.get_pipeline = function (d) {
    var live = d.steps.filter(function (s) { return s.inFlight; });
    return [rows(live.map(function (s) {
      return { label: s.n + '. ' + s.name, value: String(s.inFlight) };
    }))];
  };

  R.get_store_metrics = function (d) {
    if (d.stores) {
      return [rows(d.stores.map(function (s) {
        return { label: s.storeName, value: s.spans.applicationToOffer.median == null ? 'no data'
          : E.dur(s.spans.applicationToOffer.median) };
      }))];
    }
    return [kvBlock([
      ['Applications', String(d.applications)],
      ['Still open', String(d.open)],
      ['Reached a first day', String(d.started)],
      ['Application to offer', d.spans.applicationToOffer.median == null ? 'no data'
        : E.dur(d.spans.applicationToOffer.median) + ' (n=' + d.spans.applicationToOffer.n + ')'],
      ['Application to first shift', d.spans.applicationToFirstShift.median == null ? 'no data'
        : E.dur(d.spans.applicationToFirstShift.median) + ' (n=' + d.spans.applicationToFirstShift.n + ')'],
      ['Of elapsed time, queued', E.pct(d.queue.queueShare * 100)],
      ['Handoffs, median', String(d.handoffs.median)]
    ])];
  };

  R.get_bottleneck = function (d) {
    return [rows(d.steps.map(function (s) {
      return { label: s.n + '. ' + s.name, value: E.dur(s.queueMs),
               tone: s.actability === 'external' ? 'warn' : '' };
    })), el('div.ch-note', null, 'Amber is time we cannot compress. The rest is queue in front of somebody.')];
  };

  R.get_audit = function (d) {
    return [rows(d.entries.slice(0, 8).map(function (e) {
      return { label: e.action + ' · ' + (e.actor || ''), value: E.fmtDateTime(e.at),
               tone: e.outcome === 'refused' ? 'crit' : '' };
    }))];
  };

  /* action results */

  R.approve_candidate = R.reject_candidate = R.send_offer = R.assign_candidate =
  R.initiate_background_check = R.update_candidate_stage = R.resolve_rehire_hold = function (d) {
    if (!d || !d.brief) return [];
    return [
      kvBlock([['Now at', d.brief.stateLabel], ['Step', String(d.brief.step) + ' of 20']]),
      d.communications ? el('div.ch-note', null,
        d.communications.length + ' messages recorded: ' +
        d.communications.map(function (c) { return c.channel + ' to ' + c.to; }).join(', ') +
        '. Development adapters, nothing left this machine.') : null,
      el('button.ch-chip', { type: 'button',
        onclick: function () { openRow({ app: d.brief.applicationId }); } }, 'Open the record')
    ];
  };

  R.approve_batch = function (d) {
    return [
      d.approved.length ? lines(d.approved.map(function (x) { return x.name + ' approved'; })) : null,
      d.excluded.length ? el('div.ch-warn', null, 'Excluded: ' +
        d.excluded.map(function (e) { return e.name + ' (' + e.why + ')'; }).join('; ')) : null,
      d.failed.length ? el('div.ch-refuse', null, 'Refused: ' +
        d.failed.map(function (e) { return e.name + ': ' + e.error; }).join('; ')) : null
    ];
  };

  R.schedule_screening = function (d) {
    return [lines(d.results.map(function (r) {
      if (!r.ok) return r.name + ': ' + r.error;
      var ev = r.evaluations && r.evaluations[0];
      return r.name + ': ' + (ev
        ? ev.recommendation.replace(/_/g, ' ') + ', ' + Math.round(ev.confidence * 100) + '% confident' +
          (ev.isModel ? ' from ' + ev.model : ', from the phrase bank rubric')
        : 'screened');
    }))];
  };

  R.remove_shift = function (d) {
    if (d && d.barred) {
      return [el('div.ch-refuse', null, 'Barred while the case is contested: ' + d.barred.join(', ') + '.')];
    }
    return [];
  };

  function openRow(it) {
    if (!it || !it.app) return;
    E.ui.focusApplication = it.app;
    App.go('candidate');
    close();
  }

  /* ------------------------------------------------------------ rendering --- */

  function bubble(who, node, meta) {
    var wrap = el('div.ch-msg.is-' + who, null, [el('div.ch-bub', null, node), meta || null]);
    refs.log.appendChild(wrap);
    if (!M.prefersReduce()) {
      wrap.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 260, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'both' });
    }
    refs.log.scrollTop = refs.log.scrollHeight;
    return wrap;
  }

  /** The audit trail for a reply. It can be checked rather than trusted. */
  function working(w) {
    if (!w) return null;
    return el('details.ch-why', null, [
      el('summary', null, [
        el('span', null, w.intent || w.tool || w.route || 'working'),
        w.confidence != null ? el('span.pct', null, Math.round(w.confidence * 100) + '%') : null
      ]),
      el('div.ch-why-bd', null, [
        kvBlock([
          w.route ? ['Route', w.route === 'llm' ? 'model chose the tool' : 'local classifier, no network call'] : null,
          w.intent ? ['Intent', w.intent] : null,
          w.tool ? ['Tool', w.tool] : null,
          w.confidence != null ? ['Confidence', Math.round(w.confidence * 100) + '%' +
            (w.margin != null ? ', margin ' + Math.round(w.margin * 100) + '%' : '')] : null,
          w.person ? ['Person resolved', w.person] : null,
          w.concepts && w.concepts.length ? ['Concepts', w.concepts.slice(0, 6).join(', ')] : null,
          w.flags && w.flags.length ? ['Flags', w.flags.join(', ')] : null,
          w.outOfScope ? ['Out of scope', String(w.outOfScope)] : null,
          w.latencyMs != null ? ['Latency', w.latencyMs + ' ms'] : null
        ].filter(Boolean)),
        w.note ? el('div.ch-note', null, w.note) : null
      ])
    ]);
  }

  function renderResponse(res) {
    var body = el('div.col.tight');

    if (res.degraded) body.appendChild(el('div.ch-warn', null, res.degraded));

    if (res.needsConfirmation) {
      body.appendChild(el('div.ch-t', null, res.confirmPrompt || 'This changes something. Confirm?'));
      if (res.humanDecisionNote) body.appendChild(el('div.ch-refuse', null, res.humanDecisionNote));
      body.appendChild(el('div.ch-acts', null, [
        el('button.btn.is-primary.is-sm', {
          type: 'button',
          onclick: function (ev) {
            var host = ev.target.closest('.ch-acts');
            if (host) host.remove();
            confirmAction(res.pendingId, true);
          }
        }, res.confirmLabel || 'Yes, do it'),
        el('button.btn.is-ghost.is-sm', {
          type: 'button',
          onclick: function (ev) {
            var host = ev.target.closest('.ch-acts');
            if (host) host.remove();
            confirmAction(res.pendingId, false);
          }
        }, 'No')
      ]));
      bubble('agent', body, working(res.working));
      return;
    }

    if (res.clientAction) { runClientAction(res.clientAction, body); return; }

    if (res.reply) body.appendChild(el('div.ch-t', null, res.reply));

    if (res.error || res.refused) {
      body.appendChild(el('div.ch-refuse', null, res.error || 'Refused.'));
    } else if (res.summary) {
      body.appendChild(el('div.ch-t' + (res.kind === 'write' ? '.is-good' : ''), null, res.summary));
    }

    var render = R[res.tool];
    if (render && res.data) {
      var blocks = render(res.data) || [];
      (Array.isArray(blocks) ? blocks : [blocks]).filter(Boolean).forEach(function (b) { body.appendChild(b); });
    }

    if (!res.reply && !res.summary && !res.error) {
      body.appendChild(el('div.ch-t', null, 'Nothing came back for that.'));
    }

    bubble('agent', body, working(res.working));
    if (res.kind === 'write') { App.render(E.ui.route); App.refreshCounts(); }
  }

  function runClientAction(action, body) {
    if (action === 'help') { greet(); return; }
    if (action === 'reset') {
      body.appendChild(el('div.ch-t', null, 'Reseeding the whole demo.'));
      bubble('agent', body);
      App.reset();
      return;
    }
    if (action === 'theme') {
      body.appendChild(el('div.ch-t', null, 'Theme changed.'));
      bubble('agent', body);
      document.documentElement.setAttribute('data-theme',
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      return;
    }
    if (action === 'navigate') {
      body.appendChild(el('div.ch-t', null, 'Opening it.'));
      bubble('agent', body);
      return;
    }
  }

  function confirmAction(pendingId, approve) {
    bubble('me', el('div.ch-t', null, approve ? 'Yes' : 'No'));
    API.post('/agent/confirm?as=' + E.ui.role, { pendingId: pendingId, approve: approve })
      .then(function (r) {
        var body = el('div.col.tight');
        if (r.cancelled) {
          body.appendChild(el('div.ch-t', null, 'Nothing changed.'));
          bubble('agent', body);
          return;
        }
        if (!r.ok) {
          body.appendChild(el('div.ch-refuse', null, r.error || 'Refused.'));
          bubble('agent', body);
          App.render(E.ui.route);
          return;
        }
        body.appendChild(el('div.ch-t.is-good', null, r.summary));
        body.appendChild(el('div.ch-note', null,
          'Recorded against ' + r.confirmedBy + ' at ' + E.fmtDateTime(r.confirmedAt) + '. It is on the audit trail.'));
        var render = R[r.tool];
        if (render && r.data) {
          (render(r.data) || []).filter(Boolean).forEach(function (b) { body.appendChild(b); });
        }
        bubble('agent', body);
        App.render(E.ui.route);
        App.refreshCounts();
      });
  }

  /* ---------------------------------------------------------------- input --- */

  function submit(text) {
    if (!text || !String(text).trim()) return;
    bubble('me', el('div.ch-t', null, text));
    history.push(text);
    refs.input.value = '';
    refs.input.focus();

    var thinking = bubble('agent', el('div.ch-t.muted', null, 'Looking'));

    API.post('/agent/message?as=' + E.ui.role, { text: text }).then(function (res) {
      thinking.remove();
      renderResponse(res);
    }).catch(function (err) {
      thinking.remove();
      bubble('agent', el('div.ch-refuse', null,
        'The assistant could not reach the server: ' + (err && err.message || err)));
    });
  }

  var SUGGEST = [
    'Who needs my attention today',
    'Show me candidates waiting more than 48 hours',
    'Which candidates have completed screening',
    'What is slowing down this store',
    'Why is Trevor blocked',
    'Show me all blocked candidates',
    'How long left on Kayla’s case',
    'Which background checks are slow',
    'Take Kayla Brennan-Ross off the rota',
    'Approve Ines Duarte',
    'Send the offer to Owen Castellano',
    'Clear everyone scoring over 70'
  ];

  /* ----------------------------------------------------------------- open --- */

  function toggle() { open ? close() : show(); }

  function show() {
    open = true;
    refs.panel.hidden = false;
    void refs.panel.offsetWidth;
    refs.panel.classList.add('is-open');
    refs.fab.setAttribute('aria-expanded', 'true');
    refs.fab.classList.add('is-open');
    if (!refs.log.children.length) greet();
    window.setTimeout(function () { refs.input.focus(); }, 120);
    resumePending();
  }

  function close() {
    open = false;
    refs.panel.classList.remove('is-open');
    refs.fab.setAttribute('aria-expanded', 'false');
    refs.fab.classList.remove('is-open');
    window.setTimeout(function () { if (!open) refs.panel.hidden = true; }, M.prefersReduce() ? 100 : 380);
  }

  /**
   * Anything that was waiting on a confirmation when the page was refreshed is
   * still waiting. It is on the server, not in this tab, so it neither
   * disappeared nor quietly went ahead.
   */
  function resumePending() {
    E.loadPending().then(function (list) {
      list.forEach(function (p) {
        renderResponse({
          needsConfirmation: true, pendingId: p.id, level: p.level,
          confirmPrompt: 'Still waiting from earlier: "' + p.utterance + '". ' + (p.consequence || ''),
          confirmLabel: p.level === 'human_decision' ? 'Yes, and record it against me' : 'Yes, do it',
          humanDecisionNote: p.level === 'human_decision'
            ? 'This is a hiring decision. Confirming it records ' + E.person().name + ' as the person who made it.' : null,
          working: { route: p.route, tool: p.tool, note: 'Parked on the server since ' + E.fmtDateTime(p.at) + '.' }
        });
      });
    });
  }

  function greet() {
    var s = E.llm();
    var body = el('div.col.tight', null, [
      el('div.ch-t', null, 'I read the live database and I can change a few things with your confirmation. Ask in your own words, or pick one.'),
      el('div.ch-chips', null, SUGGEST.map(function (t) {
        return el('button.ch-chip', { type: 'button', onclick: function () { submit(t); } }, t);
      })),
      el('div.ch-note', null, s && s.configured
        ? 'Routing through ' + s.model + '. Every number below a reply comes from a tool that ran against the database, not from the model.'
        : 'No model key is configured, so intent matching runs on the server with a keyword and fuzzy-match classifier. Every answer still comes from the live database.')
    ]);
    bubble('agent', body);
  }

  /* ----------------------------------------------------------------- boot --- */

  function build() {
    refs.log = el('div.ch-log', { id: 'chatLog', role: 'log', 'aria-live': 'polite' });
    refs.input = el('input.ch-input', {
      type: 'text', placeholder: 'Ask, or tell me to do something', 'aria-label': 'Message the assistant',
      autocomplete: 'off',
      onkeydown: function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(refs.input.value); }
        if (e.key === 'Escape') { e.preventDefault(); close(); refs.fab.focus(); }
      }
    });

    var s = E.llm();
    refs.panel = el('section.ch-panel', {
      id: 'chatPanel', hidden: true, role: 'dialog', 'aria-label': 'Assistant'
    }, [
      el('header.ch-hd', null, [
        el('span.ch-dot', { 'aria-hidden': 'true' }),
        el('div.col', { style: { gap: 0 } }, [
          el('div.ch-title', null, 'Assistant'),
          el('div.ch-sub', null, s && s.configured ? s.model : 'Local classifier, no model configured')
        ]),
        el('span', { style: { flex: '1 1 auto' } }),
        UI.btn('', { cls: 'is-ghost is-sm', icon: 'close', aria: 'Close assistant', onClick: close })
      ]),
      refs.log,
      el('div.ch-ft', null, [
        refs.input,
        UI.btn('', { cls: 'is-primary is-sm', icon: 'arrow', aria: 'Send',
                     onClick: function () { submit(refs.input.value); } })
      ])
    ]);

    refs.fab = el('button.ch-fab', {
      type: 'button', 'aria-expanded': 'false', 'aria-controls': 'chatPanel',
      'aria-label': 'Open the assistant', title: 'Assistant  (C)', onclick: toggle
    }, [
      el('span.ch-fab-ico', null, UI.ico('chat')),
      el('span.ch-fab-x', null, UI.ico('close'))
    ]);

    document.getElementById('app').appendChild(refs.panel);
    document.getElementById('app').appendChild(refs.fab);

    window.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key && e.key.toLowerCase() === 'c') { e.preventDefault(); toggle(); }
    });
  }

  return {
    boot: build, open: show, close: close, toggle: toggle,
    submit: submit, renderers: R, suggestions: SUGGEST
  };
})();
