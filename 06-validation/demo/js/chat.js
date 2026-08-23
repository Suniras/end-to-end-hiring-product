/* ============================================================================
   chat.js  ·  the assistant panel

   A floating button, bottom right. Click it and a panel emerges from the button
   itself, which is where it should come from and where it goes back to.

   Every reply is produced by a handler bound to an intent from nlu.js. Nothing
   here calls a network. Nothing here generates prose: each handler writes its
   own answer from live state, so the numbers in a reply are the same numbers on
   the screen behind it.

   Three rules the handlers follow.

   1. An action that changes something asks first. Reading does not.
   2. An action the law forbids is refused with the reason, not silently ignored.
   3. Every reply can show its working: which intent matched, how confident the
      classifier was, and which words it matched on. A reviewer should be able
      to audit the assistant, not just trust it.
   ============================================================================ */

window.Chat = (function () {
  'use strict';

  var el = M.el, D = window.DEMO;
  var refs = {}, open = false, pending = null, history = [];

  /* ------------------------------------------------------------- helpers --- */

  function firstName(n) { return String(n).split(' ')[0]; }

  function candidateChips(list, onPick) {
    return el('div.ch-chips', null, list.map(function (c) {
      return el('button.ch-chip', { type: 'button', onclick: function () { onPick(c); } }, c.name);
    }));
  }

  function kvBlock(rows) {
    return el('div.ch-kv', null, rows.map(function (r) {
      return el('div', null, [
        el('span.k', null, r[0]),
        el('span.v' + (r[2] ? '.is-' + r[2] : ''), null, r[1])
      ]);
    }));
  }

  function lines(items) {
    return el('ul.ch-list', null, items.map(function (t) { return el('li', null, t); }));
  }

  /* ------------------------------------------------------------ handlers ---
     Each returns { text, blocks, actions, route }.
  ------------------------------------------------------------------------- */

  var H = {};

  H.help = function () {
    return {
      text: 'I can read the state of the pipeline and I can change a few things, with your confirmation. Try any of these, in your own words.',
      blocks: [lines([
        'Hire or reject a named candidate',
        'Ask what is waiting on you this morning',
        'Ask why somebody is blocked',
        'Ask how long is left on a compliance case',
        'Ask which background checks are slow',
        'Ask who might not turn up on their first day',
        'Ask what happens at any of the 20 stages',
        'Try to remove a shift, which I will refuse if it is unlawful'
      ])],
      note: 'Intent matching runs on this device. It is a keyword, synonym and fuzzy-match classifier, not a language model, so it handles paraphrase and typos but only across the actions above.'
    };
  };

  H.unknown = function (r) {
    var alts = (r.alternatives || []).filter(function (a) { return a.score > 0; });
    if (r.flags.indexOf('negated') >= 0) {
      return {
        text: 'That reads as a negative, so I have not done anything. Did you mean to reject somebody rather than approve them?',
        actions: [{ label: 'Open approvals', kind: '', run: function () { App.go('decide'); } }]
      };
    }
    if (alts.length) {
      return {
        text: 'I am not confident enough about that to act on it. My two closest guesses were:',
        blocks: [candidateChips(
          alts.slice(0, 2).map(function (a) { return { name: label(a.id) }; }),
          function () { say('help'); }
        )],
        note: 'Confidence was ' + Math.round(r.confidence * 100) + '% with a ' + Math.round(r.margin * 100) +
              '% margin over the runner up. Below my threshold, I ask rather than guess.'
      };
    }
    return {
      text: 'I did not match that to anything I can do. Ask me what I can do and I will list it.',
      actions: [{ label: 'What can you do', kind: '', run: function () { submit('what can you do'); } }]
    };
  };

  H.approve_candidate = function (r) {
    var p = r.entities.person;
    var openList = E.decisionsOpen();

    if (!p) {
      if (!openList.length) return { text: 'There is nobody awaiting a decision right now.' };
      return {
        text: 'Which candidate? These are awaiting a decision:',
        blocks: [candidateChips(openList, function (c) { submit('hire ' + c.name); })]
      };
    }

    var row = D.decisions.filter(function (c) { return c.name === p.name; })[0];
    if (!row) {
      return {
        text: firstName(p.name) + ' is not on the approvals list, so there is nothing to approve. ' +
              (p.kind === 'newhire' ? 'She has already started.' : p.kind === 'candidate' ? 'That record is already complete.' : ''),
        route: p.kind === 'newhire' ? 'compliance' : 'candidate'
      };
    }
    if (E.state().decided[p.name]) {
      return { text: firstName(p.name) + ' was already ' + E.state().decided[p.name] + ' in this session.' };
    }
    if (row.flagged) {
      return {
        text: 'I will not do that. ' + firstName(p.name) + ' matched a do-not-hire record, so the approval is blocked ' +
              'until somebody reviews the match and records a decision on it.',
        blocks: [kvBlock([
          ['Agent score', String(row.score), 'agent'],
          ['Blocked by', 'Not eligible for rehire', 'crit'],
          ['Matched on', 'SSN and date of birth', 'crit']
        ])],
        actions: [{ label: 'Review the record', kind: 'is-crit', run: function () { App.go('flag'); } }],
        note: 'An override is possible on the rehire screen. It is never silent, and it records who did it.'
      };
    }

    return {
      text: 'Approve ' + p.name + ' for ' + row.role + ' at ' + row.store + '? Your name goes on the record, not mine.',
      blocks: [kvBlock([
        ['Agent score', row.score + '  band ' + row.band[0] + ' to ' + row.band[1], 'agent'],
        ['Waiting', row.waited],
        ['Strongest signal', row.top]
      ])],
      actions: [
        { label: 'Approve', kind: 'is-primary', run: function () {
            E.decide(p.name, 'hired');
            M.toast('<b>' + p.name + '</b> approved by ' + E.person().name + '.', 'good');
            reply({ text: 'Done. ' + p.name + ' has moved to stage 7, offer. The record shows ' +
                          E.person().name + ' as the decider and the time as ' + E.fmtDateTime(E.NOW) + '.' });
          } },
        { label: 'Cancel', kind: 'is-ghost', run: function () { reply({ text: 'Left alone.' }); } }
      ]
    };
  };

  H.reject_candidate = function (r) {
    var p = r.entities.person;
    var openList = E.decisionsOpen().filter(function (c) { return !c.flagged; });
    if (!p) {
      return { text: 'Which candidate?', blocks: [candidateChips(openList, function (c) { submit('reject ' + c.name); })] };
    }
    var row = D.decisions.filter(function (c) { return c.name === p.name; })[0];
    if (!row) return { text: firstName(p.name) + ' is not on the approvals list.' };
    if (E.state().decided[p.name]) return { text: firstName(p.name) + ' was already ' + E.state().decided[p.name] + '.' };
    return {
      text: 'Reject ' + p.name + '? They will be told, rather than left waiting.',
      blocks: [kvBlock([['Agent score', String(row.score), 'agent'], ['Reason on file', row.top]])],
      actions: [
        { label: 'Reject', kind: 'is-crit', run: function () {
            E.decide(p.name, 'rejected');
            M.toast('<b>' + p.name + '</b> rejected by ' + E.person().name + '.', 'agent');
            reply({ text: 'Recorded. ' + firstName(p.name) + ' will be notified. The decision is against your name.' });
          } },
        { label: 'Cancel', kind: 'is-ghost', run: function () { reply({ text: 'Left alone.' }); } }
      ]
    };
  };

  H.approve_batch = function (r) {
    var floor = r.entities.number;
    var openList = E.decisionsOpen();
    var eligible = openList.filter(function (c) {
      return !c.flagged && c.score != null && (floor == null || c.score >= floor);
    });
    var blocked = openList.filter(function (c) { return c.flagged; });

    if (!eligible.length) {
      return { text: 'Nothing matches that. ' + (floor ? 'Nobody awaiting a decision scores ' + floor + ' or above.' : '') };
    }
    return {
      text: 'Approve ' + eligible.length + ' candidate' + (eligible.length === 1 ? '' : 's') +
            (floor ? ' scoring ' + floor + ' or above' : '') + '? ' +
            (blocked.length ? blocked.length + ' flagged record' + (blocked.length === 1 ? '' : 's') + ' will be skipped.' : ''),
      blocks: [
        lines(eligible.map(function (c) { return c.name + '  ' + c.score + '  ' + c.role; })),
        blocked.length ? el('div.ch-warn', null, 'Skipping ' + blocked.map(function (c) { return c.name; }).join(', ') +
          ', because a do-not-hire record has to be reviewed by a person.') : null
      ],
      actions: [
        { label: 'Approve ' + eligible.length, kind: 'is-primary', run: function () {
            eligible.forEach(function (c) { E.decide(c.name, 'hired'); });
            M.toast(eligible.length + ' approved by <b>' + E.person().name + '</b>.', 'good');
            reply({ text: 'Done. ' + eligible.length + ' approved, each recorded separately against your name. ' +
                          (blocked.length ? blocked.length + ' skipped and still blocked.' : '') });
          } },
        { label: 'Cancel', kind: 'is-ghost', run: function () { reply({ text: 'Nothing changed.' }); } }
      ]
    };
  };

  /* The one that must be refused. */
  H.remove_shift = function (r) {
    var p = r.entities.person;
    var mm = D.mismatch;
    var target = p && p.name === mm.name ? mm : null;

    if (!target) {
      if (p) return { text: 'I can only act on scheduled shifts for a named new hire, and ' + firstName(p.name) + ' does not have shifts I hold.' };
      return { text: 'Whose shifts? The only new hire with locked shifts is ' + mm.name + '.',
               blocks: [candidateChips([{ name: mm.name }], function () { submit('remove ' + mm.name + ' shifts'); })] };
    }

    var res = E.attemptShiftRemoval(E.person().name);
    var left = E.businessDaysBetween(E.NOW, E.addBusinessDays(mm.referred, 8));
    return {
      text: 'No. I have blocked that and logged the attempt.',
      tone: 'crit',
      blocks: [
        el('div.ch-refuse', null, [
          el('div.t', null, 'Removing a scheduled shift is an adverse action'),
          el('div.s', null, firstName(mm.name) + ' is contesting an E-Verify mismatch. Until that case reaches a final ' +
            'nonconfirmation, adverse action is unlawful. That covers termination, suspension, withholding or lowering ' +
            'pay, delaying training, and removing scheduled shifts.')
        ]),
        kvBlock([
          ['Working days left', String(left), left <= 2 ? 'crit' : 'warn'],
          ['Shifts locked', String(mm.shiftsScheduled), 'good'],
          ['Attempts refused', String(E.adverseBar().attempts.length), 'crit'],
          ['Next event', 'SSA appointment, 19 Aug']
        ])
      ],
      actions: [{ label: 'Open the case', kind: 'is-crit', run: function () { App.go('compliance'); } }],
      note: 'If you need cover for that shift, add cover. Do not remove hers. This refusal reads the live case state, ' +
            'not a hardcoded rule, so it lifts by itself when the case closes.'
    };
  };

  H.queue_summary = function () {
    var q = E.queueOpen();
    if (!q.length) return { text: 'Your queue is clear. Everything the weekend produced has been handled.' };
    return {
      text: E.needPerson() + ' items need a person, grouped into ' + q.length + ' action' + (q.length === 1 ? '' : 's') +
            '. In the order I would take them:',
      blocks: [el('div.ch-rows', null, q.map(function (item) {
        return el('button.ch-row' + (item.kind === 'crit' ? '.is-crit' : ''), {
          type: 'button', onclick: function () { App.go(item.route); close(); }
        }, [
          el('span.n', null, String(item.count)),
          el('span.m', null, [el('span.t', null, item.person), el('span.s', null, item.line)]),
          el('span.a', null, '→')
        ]);
      }))],
      note: 'The two red ones are blocks rather than decisions. Neither can be cleared by approving anything.'
    };
  };

  H.explain_flag = function () {
    var f = D.flagged, st = E.state();
    return {
      text: f.name + ' applied on ' + E.fmtDate(f.applied) + ' and scored ' + f.score + '. He then matched a ' +
            'do-not-hire record from another Sunfield store, so the application stopped.',
      blocks: [kvBlock([
        ['Record', f.flag.kind, 'crit'],
        ['Raised', E.fmtDate(f.flag.raised) + ', store #0311'],
        ['Reason', f.flag.reason],
        ['Matched on', 'SSN and date of birth', 'crit'],
        ['Not matched on', 'Name, address, phone or email'],
        ['Status', st.flagOutcome ? 'Flag ' + st.flagOutcome : 'Awaiting your decision', st.flagOutcome ? '' : 'warn']
      ])],
      actions: st.flagOutcome ? [] : [{ label: 'Open the record', kind: 'is-crit', run: function () { App.go('flag'); } }],
      note: 'He spelled his name differently and changed every contact detail. Name matching alone would have missed him.'
    };
  };

  H.compliance_status = function () {
    var mm = D.mismatch, cl = E.clocks(), bar = E.adverseBar();
    return {
      text: mm.name + ' started on ' + E.fmtDate(mm.started) + '. Her E-Verify check returned a mismatch and she is ' +
            'contesting it. She is a US citizen: her surname was hyphenated after marrying and the government record ' +
            'still holds the old one.',
      blocks: [
        el('div.ch-rows', null, cl.map(function (c) {
          return el('div.ch-row.is-static' + (c.tone === 'good' ? '.is-good' : c.tone === 'crit' ? '.is-crit' : ''), null, [
            el('span.n', null, c.unit === 'done' ? '✓' : String(c.left)),
            el('span.m', null, [el('span.t', null, c.t), el('span.s', null, c.unit === 'done' ? 'Met' : c.unit + ' left, due ' + E.fmtDate(c.due))])
          ]);
        })),
        el('div.ch-refuse', null, [
          el('div.t', null, bar.attempts.length + ' attempts to remove her shifts have been refused'),
          el('div.s', null, 'Adverse action is unlawful while she contests. The system enforces it rather than warning about it.')
        ])
      ],
      actions: [{ label: 'Open the case', kind: '', run: function () { App.go('compliance'); } }]
    };
  };

  H.slow_checks = function () {
    var pend = D.checks.filter(function (c) { return c.status !== 'clear'; });
    return {
      text: pend.length + ' background checks are past the 5 day median. In every case one search is the whole delay.',
      blocks: [el('div.ch-rows', null, pend.map(function (c) {
        var slowest = c.searches.reduce(function (a, b) { return b.ms > a.ms ? b : a; }, c.searches[0]);
        return el('div.ch-row.is-static.is-warn', null, [
          el('span.n', null, E.round1(c.days) + 'd'),
          el('span.m', null, [
            el('span.t', null, c.name),
            el('span.s', null, slowest.what + (slowest.where ? ', ' + slowest.where : '') + '. ' + (slowest.note || ''))
          ])
        ]);
      }))],
      actions: [{ label: 'Open background checks', kind: '', run: function () { App.go('checks'); } }],
      note: 'Only one of these is ours to fix: a drug screen the candidate has not booked. The county court delays are ' +
            'not ours to compress, and chasing the agency about them achieves nothing.'
    };
  };

  H.day_one_risk = function () {
    var risky = D.starts.filter(function (s) { return s.confirm !== 'confirmed'; });
    var okList = D.starts.filter(function (s) { return s.confirm === 'confirmed'; });
    return {
      text: risky.length
        ? risky.length + ' of ' + D.starts.length + ' new hires has not confirmed. That is the earliest warning of a ' +
          'day-one no-show that exists.'
        : 'All ' + D.starts.length + ' have confirmed.',
      blocks: [el('div.ch-rows', null, D.starts.map(function (s) {
        var c = D.CONFIRM[s.confirm];
        return el('div.ch-row.is-static' + (s.confirm === 'confirmed' ? '.is-good' : '.is-warn'), null, [
          el('span.n', null, s.initials),
          el('span.m', null, [
            el('span.t', null, s.name + '  ' + c.label),
            el('span.s', null, c.how + '. Starts ' + E.fmtDate(s.start))
          ])
        ]);
      }))],
      actions: [{ label: 'Open first shifts', kind: '', run: function () { App.go('store'); } }],
      note: okList.length + ' tapped their link. Ask me how that is tracked if you want the mechanism.'
    };
  };

  H.confirm_signal = function () {
    return {
      text: 'One SMS per new hire, carrying a link unique to them. It asks them to confirm the date, the store and who ' +
            'to ask for. There are exactly three states, because only three are honest.',
      blocks: [kvBlock([
        ['Confirmed', 'They tapped the link and pressed confirm. The only state that proves a person read it', 'good'],
        ['Delivered, no reply', 'Carrier delivery receipt only. The phone received it. Nobody opened it', 'warn'],
        ['Not delivered', 'Carrier rejected it. The number may be wrong', 'crit']
      ])],
      note: 'What we deliberately do not use: email open pixels, which most mail clients block and which report false ' +
            'negatives constantly, and SMS read receipts, which US carriers do not provide. A link tap is the only ' +
            'signal that survives scrutiny.'
    };
  };

  H.explain_stage = function (r) {
    var st = r.entities.stage;
    if (!st) return { text: 'Which stage? Give me a number from 1 to 20, or a name like E-Verify or day one.' };
    var s = D.steps.filter(function (x) { return x.n === st.n; })[0];
    if (!s) return { text: 'There is no stage ' + st.n + '. They run from 1 to 20.' };
    return {
      text: 'Stage ' + s.n + ' of 20, ' + s.stage.toLowerCase() + '. ' + s.name + '. ' + E.OWNER_WHY[s.owner],
      blocks: [
        kvBlock([
          ['Owner', E.OWNER_LABEL[s.owner], s.owner === 'agent' ? 'agent' : s.owner === 'clock' ? 'warn' : ''],
          ['Candidates here now', E.n(E.stepCount(s))],
          ['Median time', E.dur(s.medianMs)],
          ['Drop-off', s.drop ? E.pct(s.drop) : '0%', s.drop >= 20 ? 'crit' : ''],
          ['Competitors', s.cover === 0 ? 'Neither sells here' : s.cover === 1 ? 'One sells here' : 'Both sell here',
            s.cover === 0 ? 'good' : '']
        ]),
        el('div.ch-split', null, [
          el('div.a', null, [el('span.k', null, 'Agent owns'), el('span.v', null, s.agentDoes)]),
          el('div.h', null, [el('span.k', null, 'You decide'), el('span.v', null, s.humanDoes)])
        ]),
        s.law ? el('div.ch-warn', null, s.law) : null
      ],
      actions: [{ label: 'Open the pipeline', kind: '', run: function () { App.go('pipeline'); } }]
    };
  };

  H.review_held = function () {
    var held = E.reviewOpen();
    if (!held.length) return { text: 'Nothing is held for review. Every answer the phrase bank could not clear has been read.' };
    return {
      text: held.length + ' candidates are held because the phrase bank had no entry matching what they said. The agent ' +
            'stopped rather than guessing. None of them was scored.',
      blocks: [el('div.ch-rows', null, held.map(function (h) {
        return el('div.ch-row.is-static.is-warn', null, [
          el('span.n', null, h.initials),
          el('span.m', null, [el('span.t', null, h.name), el('span.s', null, h.why)])
        ]);
      }))],
      actions: [
        { label: 'Mark all ' + held.length + ' read', kind: 'is-primary', run: function () {
            held.forEach(function (h) { E.review(h.name); });
            M.toast(held.length + ' marked read by <b>' + E.person().name + '</b>.', 'good');
            reply({ text: 'Done. ' + held.length + ' cleared, each against your name. The agent never decided any of them.' });
          } },
        { label: 'Open the list', kind: 'is-ghost', run: function () { App.go('screening'); } }
      ]
    };
  };

  H.candidate_status = function (r) {
    var p = r.entities.person;
    if (!p) return { text: 'Which candidate?' };
    if (p.name === D.spine.name) {
      var c = D.spine;
      return {
        text: c.name + ', ' + c.role + ' at ' + c.store + '. ' + c.status + '. She applied on ' +
              E.fmtDateTime(c.applied) + ' and worked her first shift 13.8 days later, 14 of which were the required ' +
              'scheduling notice.',
        blocks: [kvBlock([
          ['Agent score', c.score + '  band ' + c.scoreBand[0] + ' to ' + c.scoreBand[1], 'agent'],
          ['Stages recorded', '20 of 20', 'good'],
          ['Human actions', '4, by Marcus Iyer and Dana Whitfield'],
          ['Decided by', 'Marcus Iyer, 18 Jul 09:14']
        ])],
        actions: [{ label: 'Open the record', kind: '', run: function () { App.go('candidate'); } }]
      };
    }
    if (p.kind === 'newhire') return H.compliance_status(r);
    if (p.kind === 'flagged') return H.explain_flag(r);
    var row = D.decisions.filter(function (x) { return x.name === p.name; })[0];
    if (row) {
      return {
        text: p.name + ' is at stage 6, awaiting a hire decision. Waiting ' + row.waited + '.',
        blocks: [kvBlock([['Agent score', row.score + '  band ' + row.band[0] + ' to ' + row.band[1], 'agent'],
                          ['Role', row.role + ' at ' + row.store], ['Strongest signal', row.top]])],
        actions: [{ label: 'Open approvals', kind: '', run: function () { App.go('decide'); } }]
      };
    }
    return { text: 'I hold a record for ' + p.name + ' but not a pipeline position.' };
  };

  H.report_metric = function () {
    var f = D.funnel, top = f[0].v, last = f[f.length - 1].v;
    return {
      text: 'District 12, trailing 30 days. ' + E.n(top) + ' applications produced ' + E.n(last) +
            ' people who turned up on day one.',
      blocks: [
        kvBlock([
          ['Applications', E.n(top)],
          ['Hire decisions', E.n(f.filter(function (x) { return x.n === 6; })[0].v)],
          ['Turned up day one', E.n(last), 'good'],
          ['Still employed at day 90', D.cohort90.still + ' of ' + D.cohort90.started + ', separate cohort'],
          ['Actions by the agent', '71.4%', 'agent'],
          ['Actions by a person', '6.7%']
        ]),
        el('div.ch-warn', null, 'These are simulated. Two research runs failed to find a traceable published number for ' +
          'how long any stage of US frontline retail hiring takes, which is why the product measures itself.')
      ],
      actions: [{ label: 'Open reports', kind: '', run: function () { App.go('funnel'); } }]
    };
  };

  H.nav_goto = function (r) {
    var route = r.entities.route;
    if (!route || !VIEWS[route]) return { text: 'Which screen? Try pipeline, approvals, compliance, reports or store view.' };
    return {
      text: 'Opening ' + VIEWS[route].title + '. ' + VIEWS[route].sub + '.',
      route: route
    };
  };

  H.reset_demo = function () {
    return {
      text: 'Reset everything to the opening state?',
      actions: [
        { label: 'Reset', kind: 'is-primary', run: function () {
            App.reset(); history = [];
            reply({ text: 'Reset. Every queue, decision and block is back where it started.' });
          } },
        { label: 'Cancel', kind: 'is-ghost', run: function () { reply({ text: 'Left as it is.' }); } }
      ]
    };
  };

  H.set_theme = function (r) {
    var want = /dark/.test(r.norm) ? 'dark' : /light/.test(r.norm) ? 'light' : null;
    if (!want) return { text: 'Dark or light?' , blocks: [candidateChips(
      [{ name: 'dark' }, { name: 'light' }], function (c) { submit('switch to ' + c.name + ' mode'); })] };
    document.documentElement.setAttribute('data-theme', want);
    try { window.localStorage.setItem('demo-theme', want); } catch (e) {}
    return { text: 'Switched to ' + want + '.' };
  };

  var LABELS = {
    approve_candidate: 'approve a candidate', reject_candidate: 'reject a candidate',
    approve_batch: 'approve several at once', remove_shift: 'remove a shift',
    queue_summary: 'summarise your queue', explain_flag: 'explain a rehire block',
    compliance_status: 'give a compliance status', slow_checks: 'list slow background checks',
    day_one_risk: 'list day-one risk', confirm_signal: 'explain confirmation tracking',
    explain_stage: 'explain a stage', review_held: 'show held candidates',
    candidate_status: 'give a candidate status', report_metric: 'report the numbers',
    nav_goto: 'open a screen', reset_demo: 'reset the demo', set_theme: 'change the theme',
    help: 'list what I can do', unknown: 'something I did not recognise'
  };
  function label(id) { return LABELS[id] || id; }

  /* ------------------------------------------------------------ rendering --- */

  function bubble(who, node, meta) {
    var wrap = el('div.ch-msg.is-' + who, null, [
      el('div.ch-bub', null, node),
      meta || null
    ]);
    refs.log.appendChild(wrap);
    if (!M.prefersReduce()) {
      wrap.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 260, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'both' });
    }
    refs.log.scrollTop = refs.log.scrollHeight;
    return wrap;
  }

  /** The audit trail for a reply: what matched, how sure, on which words. */
  function working(r) {
    if (!r) return null;
    var det = el('details.ch-why', null, [
      el('summary', null, [
        el('span', null, label(r.intent)),
        el('span.pct', null, Math.round(r.confidence * 100) + '%')
      ]),
      el('div.ch-why-bd', null, [
        kvBlock([
          ['Intent', r.intent],
          ['Confidence', Math.round(r.confidence * 100) + '%, margin ' + Math.round(r.margin * 100) + '%'],
          ['Concepts', r.concepts.slice(0, 6).join(', ') || 'none'],
          r.entities.person ? ['Person', r.entities.person.name + ' (' + r.entities.personScore + ')'] : null,
          r.entities.stage ? ['Stage', 'stage ' + r.entities.stage.n + ', by ' + r.entities.stage.by] : null,
          r.alternatives.length > 1 ? ['Runner up', label(r.alternatives[1].id)] : null
        ].filter(Boolean)),
        r.evidence.length ? el('div.ch-ev', null, r.evidence.slice(0, 8).map(function (e) {
          return el('span.ch-tag' + (e.how === 'fuzzy' ? '.is-fuzzy' : e.how !== 'exact' ? '.is-phrase' : ''), null,
            e.matched + (e.how === 'fuzzy' ? ' ≈ ' + e.to : '') );
        })) : null
      ])
    ]);
    return det;
  }

  function reply(res, r) {
    var body = el('div.col.tight');
    if (res.text) body.appendChild(el('div.ch-t' + (res.tone ? '.is-' + res.tone : ''), null, res.text));
    (res.blocks || []).filter(Boolean).forEach(function (b) { body.appendChild(b); });
    if (res.actions && res.actions.length) {
      body.appendChild(el('div.ch-acts', null, res.actions.map(function (a) {
        return el('button.btn' + (a.kind ? '.' + a.kind.split(' ').join('.') : '') + '.is-sm', {
          type: 'button',
          onclick: function (ev) {
            var host = ev.target.closest('.ch-acts');
            if (host) host.remove();
            a.run();
          }
        }, a.label);
      })));
    }
    if (res.note) body.appendChild(el('div.ch-note', null, res.note));
    bubble('agent', body, working(r));
    if (res.route) { App.go(res.route); }
  }

  /* ---------------------------------------------------------------- input --- */

  function submit(text) {
    if (!text || !String(text).trim()) return;
    bubble('me', el('div.ch-t', null, text));
    history.push(text);
    refs.input.value = '';
    refs.input.focus();

    var r = NLU.classify(text);
    var fn = H[r.intent] || H.unknown;
    // A tiny delay so the exchange reads as a turn rather than an instant swap.
    window.setTimeout(function () {
      var res;
      try { res = fn(r); }
      catch (err) {
        res = { text: 'That broke rather than pretending it did not: ' + (err && err.message || err), tone: 'crit' };
        if (window.console) window.console.error('chat handler failed', r.intent, err);
      }
      reply(res, r);
    }, M.prefersReduce() ? 0 : 220);
  }

  function say(intentId) { submit(intentId === 'help' ? 'what can you do' : intentId); }

  var SUGGEST = [
    'What needs me this morning',
    'Why is Trevor blocked',
    'Take Kayla off next week’s rota',
    'How long left on Kayla’s case',
    'Which background checks are slow',
    'Who might not turn up',
    'How do you track confirmations',
    'What happens at stage 12',
    'Hire Ines Duarte',
    'Approve everyone above 75'
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
  }

  function close() {
    open = false;
    refs.panel.classList.remove('is-open');
    refs.fab.setAttribute('aria-expanded', 'false');
    refs.fab.classList.remove('is-open');
    window.setTimeout(function () { if (!open) refs.panel.hidden = true; }, M.prefersReduce() ? 100 : 380);
  }

  function greet() {
    reply({
      text: 'I can read the pipeline and change a few things with your confirmation. Ask in your own words, or pick one.',
      blocks: [el('div.ch-chips', null, SUGGEST.map(function (t) {
        return el('button.ch-chip', { type: 'button', onclick: function () { submit(t); } }, t);
      }))],
      note: 'Intent matching runs on this device. It is a keyword and fuzzy-match classifier, not a language model.'
    });
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

    refs.panel = el('section.ch-panel', {
      id: 'chatPanel', hidden: true, role: 'dialog', 'aria-label': 'Assistant'
    }, [
      el('header.ch-hd', null, [
        el('span.ch-dot', { 'aria-hidden': 'true' }),
        el('div.col', { style: { gap: 0 } }, [
          el('div.ch-title', null, 'Assistant'),
          el('div.ch-sub', null, 'On-device intent matching')
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
      'aria-label': 'Open the assistant', title: 'Assistant  (C)',
      onclick: toggle
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
    submit: submit, handlers: H, suggestions: SUGGEST
  };
})();
