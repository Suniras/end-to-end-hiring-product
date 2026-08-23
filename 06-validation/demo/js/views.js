/* ============================================================================
   views.js  ·  the ten screens
   Each view is a function returning a DOM node. No view reads the DOM.
   ============================================================================ */

window.VIEWS = (function () {
  'use strict';

  var el = M.el, D = window.DEMO;
  var chip = UI.chip, card = UI.card, btn = UI.btn, metric = UI.metric;

  function sheet(o) { if (window.App) window.App.sheet(o); }
  function go(route) { if (window.App) window.App.go(route); }

  function ownerLegend() {
    return el('div.row.wrap', { style: { gap: '10px' } }, [
      UI.chip('Agent', 'own-agent', true),
      UI.chip('A person', 'own-human', true),
      UI.chip('Software', 'own-system', true),
      UI.chip('Fixed wait', 'own-clock', true)
    ]);
  }

  /* ================================================================ deck === */

  function deck() {
    var o = D.overnight;
    var open = E.queueOpen();

    var tiles = el('div.grid.c4', null, [
      card({ flush: true, body: metric({ value: o.read, label: 'Applications received', sub: o.window }) }),
      card({ flush: true, body: metric({ value: o.autoAdvanced, label: 'Screened without human review',
        sub: o.agentScreened + ' by the screening agent, ' + o.ruleCleared + ' cleared on rules alone', tone: 'agent' }) }),
      card({ flush: true, body: metric({ value: E.needPerson(), label: 'Held for a person to review',
        sub: 'The agent would not decide these', tone: 'accent' }) }),
      card({ flush: true, body: metric({ value: open.length, label: 'Actions in your queue',
        sub: E.needPerson() + ' items grouped into ' + open.length, tone: 'good' }) })
    ]);

    var list = el('div.qlist');
    if (!open.length) {
      list.appendChild(UI.empty('Queue clear', 'Everything the weekend produced has been handled.'));
    } else {
      var lastBucket = null;
      open.forEach(function (q) {
        if (q.bucket !== lastBucket) {
          lastBucket = q.bucket;
          list.appendChild(el('div', {
            style: { padding: '10px 16px 6px', borderTop: '1px solid var(--line-soft)', background: 'var(--surface-2)' }
          }, UI.eyebrow(q.bucket)));
        }
        list.appendChild(queueRow(q));
      });
    }

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.row.wrap', null, [
        el('div.col.tight', null, [
          UI.eyebrow('Monday ' + E.fmtDate(E.NOW) + ' · 07:04', 'accent'),
          el('h1.display', null, [
            '247 applications were ',
            el('span', { style: { color: 'var(--agent)' } }, 'screened automatically'),
            ' overnight.'
          ]),
          el('div.small.muted', { style: { maxWidth: '66ch' } },
            E.n(o.read) + ' people applied between Friday evening and this morning. The screening agent ' +
            'handled ' + E.n(o.agentScreened) + ' of them end to end and deterministic rules cleared another ' +
            o.ruleCleared + ', with no human review at any point. The remaining ' + E.n(E.needPerson()) +
            ' are grouped below into ' + open.length + (open.length === 1 ? ' action.' : ' actions.'))
        ])
      ]),
      tiles,
      card({
        eyebrow: 'Action queue', title: 'Waiting on you', flush: true,
        sub: 'Grouped by the action required, not listed one candidate at a time',
        tools: ownerLegend(),
        body: list,
        foot: 'The agent decided none of these. Each row is either a judgement it refused to make, or an action the law blocks.'
      })
    ]);
  }

  function queueRow(q) {
    var row = el('div.qitem' + (q.kind === 'crit' ? '.is-crit' : q.kind === 'warn' ? '.is-warn' : '.own-human'), null, [
      UI.avatar(q.initials, q.kind === 'crit' ? 'crit' : null),
      el('div.qmain', null, [
        el('div.qtop', null, [
          el('span.qname', null, q.person),
          chip(q.chip, q.chipKind)
        ]),
        el('div.small.faint', null, q.sub),
        el('div.qsub', null, q.line)
      ]),
      el('div.qact', null, [
        btn(q.act, { cls: q.kind === 'crit' ? 'is-crit' : '', iconAfter: 'arrow', onClick: function () { go(q.route); } }),
        btn('', { cls: 'is-ghost is-sm', icon: 'close', aria: 'Dismiss ' + q.person, title: 'Clear from the queue',
          onClick: function () {
            row.classList.add('is-leaving');
            window.setTimeout(function () { E.resolveQueue(q.id); }, 200);
          } })
      ])
    ]);
    return row;
  }

  /* ============================================================ pipeline === */

  function pipeline() {
    var stages = E.stagesOf();
    var total = E.totalInFlight();

    var body = el('div');
    stages.forEach(function (st) {
      var atStage = st.steps.reduce(function (a, s) { return a + E.stepCount(s); }, 0);
      body.appendChild(el('div.stage-hd', {
        style: { padding: '12px 16px', background: 'var(--surface-2)', borderTop: '1px solid var(--line)' }
      }, [
        el('span.h3', null, st.name),
        el('span.stage-n', null, st.steps.length + ' steps'),
        el('span.spacer', { style: { flex: '1 1 auto' } }),
        el('span.stage-n', null, E.n(atStage) + ' people here now')
      ]));
      var steps = el('div.steps');
      steps.appendChild(stepHead());
      st.steps.forEach(function (s) { steps.appendChild(stepRow(s, total)); });
      body.appendChild(steps);
    });

    var uncovered = D.steps.filter(function (s) { return s.cover === 0; });

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.col.tight', null, [
        UI.eyebrow('Hiring pipeline', 'accent'),
        el('h1.h1', null, 'All 20 stages, including the ones nothing automates'),
        el('div.small.muted', { style: { maxWidth: '74ch' } },
          'Colour is who owns the step. Purple is the agent, blue is a person deciding, grey is deterministic software with no ' +
          'judgement in it, and amber is a wait nobody can compress. ' + uncovered.length + ' of the twenty are sold by neither ' +
          'incumbent, and almost all of those are waits.')
      ]),
      el('div.grid.c4', null, [
        card({ flush: true, body: metric({ value: 9, label: 'Automated by rules', sub: 'No model involved, and none should be', tone: 'accent' }) }),
        card({ flush: true, body: metric({ value: 5, label: 'Handled by the agent', sub: 'Four of the five are the same conversation', tone: 'agent' }) }),
        card({ flush: true, body: metric({ value: 3, label: 'Require a named person', sub: 'Two of the three by law' }) }),
        card({ flush: true, body: metric({ value: 3, label: 'Fixed waits', sub: 'A court, a federal check and the calendar', tone: 'crit' }) })
      ]),
      card({
        eyebrow: 'Live counts', title: E.n(total) + ' candidates in progress',
        sub: 'District 12. Click any stage for what automates it, what the law requires, and who sells there',
        flush: true, tools: ownerLegend(), body: body,
        foot: 'Median times are simulated. Two independent research attempts failed to find a traceable published number for how long any stage of US frontline retail hiring takes, so the first real deployment has to produce them.'
      })
    ]);
  }

  function stepHead() {
    return el('div.step.is-head', { 'aria-hidden': 'true' }, [
      el('span.step-num', null, ''),
      el('span.step-name', null, el('span.k', null, 'step')),
      el('span.step-cell.step-at', null, el('span.k', null, 'here now')),
      el('span.step-cell.step-time', null, el('span.k', null, 'median')),
      el('span.step-cell.step-drop', null, el('span.k', null, 'drop')),
      el('span.step-cell.step-cover', null, el('span.k', null, 'incumbents'))
    ]);
  }

  function stepRow(s, total) {
    var at = E.stepCount(s);
    var share = total ? (at / total) * 100 : 0;
    var loadFill = el('span', { style: { width: '0%' } });
    requestAnimationFrame(function () { M.growBar(loadFill, Math.min(100, share * 3.2)); });

    var coverCls = s.cover === 0 ? '.is-open' : '';
    var coverLab = s.cover === 0 ? 'Neither' : (s.cover === 1 ? 'One sells' : 'Both sell');

    var row = el('button.step.' + E.ownerClass(s.owner), {
      type: 'button',
      'aria-label': 'Step ' + s.n + ', ' + s.name,
      onclick: function () { openStep(s); }
    }, [
      el('span.step-num', null, s.n < 10 ? '0' + s.n : String(s.n)),
      el('span.step-name', null, [
        el('span.t', null, s.name),
        el('span.s', null, [
          E.OWNER_LABEL[s.owner],
          s.clock ? ' · legal clock' : ''
        ])
      ]),
      el('span.step-cell.step-at', null, [
        el('span.v', null, E.n(at)),
        el('span.load', null, loadFill)
      ]),
      el('span.step-cell.step-time', null,
        el('span.v' + (s.medianMs > 3 * D.DAY ? '.is-warn' : ''), null, E.dur(s.medianMs))),
      el('span.step-cell.step-drop', null,
        el('span.v' + (s.drop >= 20 ? '.is-crit' : s.drop >= 8 ? '.is-warn' : '.is-faint'), null, s.drop ? E.pct(s.drop) : '0%')),
      el('span.step-cell.step-cover', null,
        el('span.cover' + coverCls, null, [
          el('i' + (s.cover >= 1 ? '.on' : '')),
          el('i' + (s.cover >= 2 ? '.on' : '')),
          el('span.lab', null, coverLab)
        ]))
    ]);
    return row;
  }

  function openStep(s) {
    sheet({
      eyebrow: 'Step ' + s.n + ' of 20 · ' + s.stage,
      title: s.name,
      chipNode: UI.ownerChip(s.owner),
      body: [
        el('div.small.muted', null, E.OWNER_WHY[s.owner]),
        UI.boundary(s.agentDoes, s.humanDoes),
        card({ eyebrow: 'What is automated', body: el('div.small', null, s.software) }),
        s.law ? card({
          eyebrow: 'Legal or calendar requirement', eyebrowKind: 'accent',
          body: el('div.small', null, s.law),
          foot: 'Verified against primary government text on 16 Aug 2026. Counsel sign-off still required before a PRD.'
        }) : null,
        card({ eyebrow: 'Competitor coverage', body: el('div.small', null, s.coverNote) }),
        el('div.grid.c3', null, [
          card({ flush: true, body: metric({ value: E.stepCount(s), label: 'Candidates here now' }) }),
          card({ flush: true, body: el('div.metric', null, [
            el('div.metric-val', null, E.dur(s.medianMs)),
            el('div.metric-lab', null, 'Median time in stage'),
            el('div.metric-sub', null, 'Simulated')
          ]) }),
          card({ flush: true, body: el('div.metric' + (s.drop >= 20 ? '.is-crit' : ''), null, [
            el('div.metric-val', null, s.drop ? E.pct(s.drop) : '0%'),
            el('div.metric-lab', null, 'Drop-off at this stage'),
            el('div.metric-sub', null, 'Simulated')
          ]) })
        ])
      ]
    });
  }

  /* =========================================================== candidate === */

  function candidate() {
    var c = D.spine;
    var byStep = {};
    D.steps.forEach(function (s) { byStep[s.n] = s; });

    var tl = el('div.tl');
    c.events.slice().sort(function (a, b) { return a.step - b.step; }).forEach(function (ev) {
      var s = byStep[ev.step];
      tl.appendChild(el('div.tl-item.is-done.' + E.ownerClass(ev.owner), null, [
        el('div.tl-node', null, String(ev.step)),
        el('div.tl-bd', null, [
          el('div.tl-top', null, [
            el('span.tl-t', null, ev.title),
            el('span.tl-when', null, E.fmtDateTime(ev.at)),
            UI.chip(E.OWNER_LABEL[ev.owner], 'own-' + ev.owner, true)
          ]),
          el('div.tl-who', null, ['Acted: ', el('span.strong', null, ev.who), s ? ' · step ' + s.n + ', ' + s.stage.toLowerCase() : '']),
          el('div.tl-note', null, ev.note)
        ])
      ]));
    });

    var applied = new Date(c.applied);
    var firstShift = new Date('2026-07-28T14:51');
    var days = (firstShift - applied) / D.DAY;

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.row.wrap', null, [
        UI.avatar(c.initials),
        el('div.col.tight', null, [
          el('div.row', null, [el('span.h1', null, c.name), UI.chip(c.status, 'is-good')]),
          el('div.small.muted', null, c.role + ' · ' + c.store + ' · ' + c.req + ' · applied ' + E.fmtDateTime(c.applied) + ' from ' + c.source)
        ])
      ]),
      el('div.grid.c4', null, [
        card({ flush: true, body: metric({ value: days, dp: 1, unit: 'days', label: 'Application to first shift', sub: '14 of those were the required scheduling notice', tone: 'accent' }) }),
        card({ flush: true, body: metric({ value: c.score, label: 'Agent score', sub: 'Band ' + c.scoreBand[0] + ' to ' + c.scoreBand[1], tone: 'agent', range: c.scoreBand }) }),
        card({ flush: true, body: metric({ value: 20, label: 'Stages recorded', sub: 'Each with a timestamp and a named actor' }) }),
        card({ flush: true, body: metric({ value: 4, label: 'Human actions', sub: 'Marcus Iyer 3, Dana Whitfield 1', tone: 'good' }) })
      ]),
      card({
        eyebrow: 'Activity history', title: 'All 20 stages, with who acted and when',
        sub: 'This is the audit record. In US hiring, reconstructing a decision months later without the app is a legal requirement, not a feature.',
        body: tl
      })
    ]);
  }

  /* =========================================================== screening === */

  function screening() {
    var c = D.spine;
    var turns = el('div.turns');
    c.transcript.forEach(function (t) {
      turns.appendChild(el('div.turn' + (t.side === 'agent' ? '.is-agent' : ''), null, [
        el('div.turn-who', null, t.side === 'agent' ? 'Agent' : c.name.split(' ')[0]),
        el('div', null, [
          el('div.turn-txt', null, t.text),
          t.match ? el('div.turn-tag' + (t.matchKind === 'good' ? '' : '.is-warn'), null, ['✓ ', t.match]) : null
        ])
      ]));
    });

    var review = E.reviewOpen();
    var reviewList = el('div.qlist');
    if (!review.length) {
      reviewList.appendChild(UI.empty('All nineteen cleared', 'Every held answer has been read by a person.'));
    } else {
      review.forEach(function (r) {
        var row = el('div.qitem.is-warn', null, [
          UI.avatar(r.initials),
          el('div.qmain', null, [
            el('div.qtop', null, [
              el('span.qname', null, r.name),
              chip(r.score == null ? 'Not scored' : 'Held at ' + r.score, r.score == null ? 'is-plain' : 'is-warn')
            ]),
            el('div.small.faint', null, r.role + ' · ' + r.store),
            el('div.qsub', null, r.why)
          ]),
          el('div.qact', null, [
            btn('Mark read', { cls: 'is-sm', onClick: function () {
              row.classList.add('is-leaving');
              window.setTimeout(function () {
                E.review(r.name);
                M.toast('<b>' + r.name + '</b> read by ' + E.person().name + '. The agent never decided this one.', 'good');
              }, 200);
            } })
          ])
        ]);
        reviewList.appendChild(row);
      });
    }

    var step3 = D.steps[2];

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.col.tight', null, [
        UI.eyebrow('Stage 3 · screening call', 'agent'),
        el('h1.h1', null, 'The agent can advance a candidate. It cannot reject one.'),
        el('div.small.muted', { style: { maxWidth: '76ch' } },
          'Answers are matched against a phrase bank the client writes and owns. Anything the bank does not cover is held for a person ' +
          'rather than guessed at. This is the design that passed a client\'s legal review on the aviation build.')
      ]),
      el('div.grid.c4', null, [
        card({ flush: true, body: el('div.metric', null, [
          el('div.metric-val', null, ['6:12', el('span.unit', null, 'duration')]),
          el('div.metric-lab', null, 'Call length'), el('div.metric-sub', null, 'Answered on the second attempt')
        ]) }),
        card({ flush: true, body: metric({ value: 3, label: 'Questions asked', sub: 'Written by Sunfield, not by us', tone: 'agent' }) }),
        card({ flush: true, body: metric({ value: 3, label: 'Answers matched', sub: 'All three matched a positive entry', tone: 'good' }) }),
        card({ flush: true, body: metric({ value: E.reviewOpen().length, label: 'Sent to a person', sub: 'Out of 213 screened this weekend', tone: 'crit' }) })
      ]),
      el('div.grid.split', null, [
        card({
          eyebrow: 'Transcript', title: 'Screening call, 6 min 12 s',
          sub: 'Recorded 14 Jul 22:55. Retained for the statutory period',
          body: turns,
          foot: 'The opening disclosure is not optional. Candidates are told it is an assistant, that a person decides, and that they can ask for a human or a written path instead.'
        }),
        el('div.col', { style: { gap: 'var(--s5)' } }, [
          card({ eyebrow: 'Automation limits', title: 'What the agent may and may not do', body: UI.boundary(step3.agentDoes, step3.humanDoes) }),
          card({
            eyebrow: 'Design note', title: 'Why eligibility uses rules, not a model',
            body: el('div.small', null,
              'Step 2 checks age, right to work and availability. Those have one right answer each, so a rules engine does it and the ' +
              'rule trace is stored. A model there would add nothing and would drag a deterministic step into automated-decision rules.'),
            foot: 'Since step 6 now produces a score, we are inside those rules anyway. That argument is spent and eligibility is worth revisiting on its merits.'
          }),
          UI.simBanner('The voice call is a log, not a live call. Nurix has shipped a live voice screening agent on the aviation build, so the capability exists. Showing one call log is the honest way to demo it without dialling.')
        ])
      ]),
      card({
        eyebrow: 'Held for review', title: E.reviewOpen().length + ' the agent would not score', flush: true,
        sub: 'The phrase bank had no matching entry, so the agent stopped rather than guessing',
        body: reviewList
      })
    ]);
  }

  /* ============================================================== decide === */

  function decide() {
    var open = E.decisionsOpen();
    var step6 = D.steps[5];
    var list = el('div.qlist');

    if (!open.length) {
      list.appendChild(UI.empty('Every decision made', 'The queue is empty and every record carries a person\'s name.'));
    } else {
      open.forEach(function (c) {
        list.appendChild(decisionRow(c));
      });
    }

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.col.tight', null, [
        UI.eyebrow('Stage 6 · hire decision', 'accent'),
        el('h1.h1', null, 'Every candidate here needs a named person to decide'),
        el('div.small.muted', { style: { maxWidth: '74ch' } },
          'The band is there because a single number to two decimal places would be a lie. The name recorded against the outcome is ' +
          'yours, not the model\'s.')
      ]),
      card({ eyebrow: 'Automation limits', title: 'What the agent may and may not do', body: UI.boundary(step6.agentDoes, step6.humanDoes) }),
      card({
        eyebrow: 'Awaiting decision', title: E.decisionsOpen().length + ' candidates', flush: true,
        sub: 'Shown in submitted order. The oldest has been waiting 2 days 4 hours',
        body: list,
        foot: 'Approving moves the candidate to stage 7, updates the pipeline count, and records your name against the decision.'
      })
    ]);
  }

  function decisionRow(c) {
    var row = el('div.qitem' + (c.flagged ? '.is-crit' : '.own-human'), null, [
      UI.avatar(c.initials, c.flagged ? 'crit' : null),
      el('div.qmain', null, [
        el('div.qtop', null, [
          el('span.qname', null, c.name),
          c.score != null ? chip(String(c.score) + ' · band ' + c.band[0] + '-' + c.band[1], c.flagged ? 'is-crit' : 'own-agent') : null,
          c.flagged ? chip('Blocked', 'is-crit') : null,
          el('span.small.faint', null, 'waiting ' + c.waited)
        ]),
        el('div.small.faint', null, c.role + ' · ' + c.store),
        el('div.qsub', null, c.top),
        c.score != null ? el('div', { style: { maxWidth: '260px', marginTop: '4px' } }, UI.rangeBar(c.band[0], c.band[1], c.score)) : null
      ]),
      el('div.qact', null, c.flagged ? [
        btn('Why blocked', { cls: 'is-crit', iconAfter: 'arrow', onClick: function () { go('flag'); } })
      ] : [
        btn('Hire', { cls: 'is-primary', onClick: function () { finish(row, c, 'hired'); } }),
        btn('Reject', { cls: 'is-ghost is-sm', onClick: function () { finish(row, c, 'rejected'); } })
      ])
    ]);
    return row;
  }

  function finish(row, c, outcome) {
    row.classList.add('is-leaving');
    window.setTimeout(function () {
      E.decide(c.name, outcome);
      M.toast(
        '<b>' + c.name + '</b> ' + (outcome === 'hired' ? 'moved to offer' : 'rejected') +
        '. Decided by ' + E.person().name + ', ' + E.person().role + '. The model did not decide this.',
        outcome === 'hired' ? 'good' : 'agent'
      );
    }, 200);
  }

  /* ================================================================ flag === */

  function flag() {
    var f = D.flagged, st = E.state();
    var outcome = st.flagOutcome;

    var actions = outcome
      ? el('div.row', null, [
          chip(outcome === 'upheld' ? 'Flag upheld, application closed' : 'Flag overridden, and logged', outcome === 'upheld' ? 'is-crit' : 'is-warn'),
          el('span.small.muted', null, 'Recorded against ' + E.person().name + ' at ' + E.fmtDateTime(E.NOW) + '.')
        ])
      : el('div.row.wrap', null, [
          btn('Uphold the flag', { cls: 'is-crit', onClick: function () {
            E.setFlagOutcome('upheld');
            E.resolveQueue('q-flag');
            M.toast('Flag upheld. <b>' + f.name + '</b> closed, and the reason is on the record.', 'crit');
          } }),
          btn('Override, with a reason', { cls: 'is-ghost', onClick: function () {
            E.setFlagOutcome('overridden');
            E.resolveQueue('q-flag');
            M.toast('Override logged against <b>' + E.person().name + '</b>. An override is allowed. It is never silent.', 'agent');
          } })
        ]);

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.col.tight', null, [
        UI.eyebrow('Stage 6 · blocked', 'accent'),
        el('h1.display', null, ['Scored 79, and ', el('span', { style: { color: 'var(--crit)' } }, 'flagged not eligible for rehire'), '.']),
        el('div.small.muted', { style: { maxWidth: '76ch' } },
          'This is the reason we import one list from the system a customer leaves behind. Everything else can start clean from a ' +
          'connector that only reads. This one cannot be skipped, because a do-not-hire list exists precisely to ' +
        'catch a new application.')
      ]),
      el('div.grid.split', null, [
        card({
          eyebrow: 'Do-not-hire record', title: 'Why this application stopped', cls: '',
          sub: 'Raised ' + E.fmtDate(f.flag.raised) + ' at another Sunfield store',
          body: el('div.col', null, [
            el('div.clock.is-crit', null, [
              el('div.clock-main', null, [
                el('div.clock-t', null, f.flag.kind),
                el('div.clock-s', null, f.flag.reason)
              ]),
              el('div.clock-v', null, '2024')
            ]),
            el('div.grid.c2', { style: { gap: 'var(--s4)' } }, [
              UI.kv('Raised by', f.flag.raisedBy),
              UI.kv('Came from', f.flag.source)
            ]),
            card({
              eyebrow: 'How the match was made', eyebrowKind: 'accent',
              body: el('div.small', null, f.flag.matchedOn),
              foot: 'Name matching alone would have missed him. That is the point.'
            }),
            el('div.hr'),
            el('div.col.tight', null, [UI.eyebrow('Your decision'), actions])
          ])
        }),
        el('div.col', { style: { gap: 'var(--s5)' } }, [
          card({
            eyebrow: 'Applicant', title: f.name,
            body: el('div.col', null, [
              el('div.row', null, [UI.avatar(f.initials, 'crit'), el('div.col.tight', null, [
                el('div.strong', null, f.role + ' · ' + f.store),
                el('div.small.muted', null, 'Applied ' + E.fmtDateTime(f.applied))
              ])]),
              el('div.hr'),
              el('div.col.tight', null, [
                UI.eyebrow('Agent score, recorded before the match'),
                el('div.row', null, [
                  el('span.metric-val', { style: { fontSize: '1.5rem', color: 'var(--agent)' } }, String(f.score)),
                  el('span.small.muted', null, 'band ' + f.scoreBand[0] + ' to ' + f.scoreBand[1])
                ]),
                UI.rangeBar(f.scoreBand[0], f.scoreBand[1], f.score)
              ]),
              el('div.small.muted', null, 'He interviews well. That is exactly why speed on its own is dangerous.')
            ])
          }),
          card({
            eyebrow: 'Why this check exists', title: 'Speed makes this failure more likely, not less',
            body: el('div.small', null,
              'Every incumbent claim in this category is about time to hire. None is about who you hired. Screen faster with no ' +
              'imported flag and you rehire a man who was terminated for cause, faster.'),
            foot: 'This is the one read we insist on. We connect to the retailer\'s existing systems rather than replacing them, and this is the one flag we cannot work without.'
          })
        ])
      ])
    ]);
  }

  /* ========================================================== compliance === */

  function compliance() {
    var mm = D.mismatch, bar = E.adverseBar(), cl = E.clocks();

    var clockNodes = el('div.col', null, cl.map(function (c) {
      return el('div.clock.is-' + c.tone, null, [
        el('div.clock-main', null, [
          el('div.clock-t', null, c.t),
          el('div.clock-s', null, c.s),
          el('div.clock-s', { style: { color: 'var(--muted)', marginTop: '3px' } }, c.state)
        ]),
        el('div.col.tight', { style: { alignItems: 'flex-end' } }, [
          el('div.clock-v', null, c.unit === 'done' ? 'Done' : String(c.left)),
          el('div.clock-law', null, c.unit === 'done' ? E.fmtDate(c.due) : c.unit + ' left'),
          el('div.clock-law', { style: { opacity: 0.75 } }, 'due ' + E.fmtDate(c.due))
        ])
      ]);
    }));

    var attempts = el('div.qlist');
    bar.attempts.forEach(function (a) {
      attempts.appendChild(el('div.qitem.is-crit', null, [
        UI.avatar('✕', 'crit'),
        el('div.qmain', null, [
          el('div.qtop', null, [el('span.qname', null, a.what), chip(a.outcome, 'is-crit')]),
          el('div.small.faint', null, a.who + ' · ' + E.fmtDateTime(a.at)),
          el('div.qsub', null, 'The product refused and explained why. Nobody here was being malicious. They did not know.')
        ])
      ]));
    });

    var tryBtn = btn('Try to remove her from next week\'s rota', {
      cls: 'is-crit', icon: 'lock',
      onClick: function () {
        var r = E.attemptShiftRemoval(D.people.marcus.name);
        if (!r.allowed) {
          sheet({
            eyebrow: 'Action blocked', title: 'Removing a scheduled shift is unlawful right now',
            chipNode: chip('Refused', 'is-crit'),
            body: [
              el('div.clock.is-crit', null, [
                el('div.clock-main', null, [
                  el('div.clock-t', null, 'Removing a scheduled shift'),
                  el('div.clock-s', null, r.reason)
                ])
              ]),
              card({
                eyebrow: 'Prohibited until the case closes', eyebrowKind: 'accent',
                body: el('div.col.tight', null, bar.barred.map(function (b) {
                  return el('div.row', null, [chip('Barred', 'is-crit'), el('span.small', null, b)]);
                }))
              }),
              card({
                eyebrow: 'What you can do instead',
                body: el('div.small', null,
                  'Nothing about her employment changes while the case is open. If you need cover for a shift, add cover. Do not ' +
                  'remove hers. She has an SSA appointment on the 19th and the case should close after it.')
              }),
              UI.simBanner('E-Verify itself is faked here. In a real build this is either an integration we own with DHS, or a vendor we embed. That decision is open and recorded as Q-033.')
            ]
          });
          M.toast('Blocked. Removing a shift is an adverse action while a mismatch is contested.', 'crit');
        }
      }
    });

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.col.tight', null, [
        UI.eyebrow('Stages 11 and 12 · compliance', 'accent'),
        el('h1.display', null, ['E-Verify mismatch, ', el('span', { style: { color: 'var(--good)' } }, 'contested'), '. Adverse action is barred.']),
        el('div.small.muted', { style: { maxWidth: '78ch' } },
          mm.name + ' is a US citizen. ' + mm.likelyCause)
      ]),
      el('div.grid.c4', null, [
        card({ flush: true, body: el('div.metric.is-crit', null, [
          el('div.metric-val', null, String(E.businessDaysBetween(E.NOW, E.addBusinessDays(mm.referred, 8)))),
          el('div.metric-lab', null, 'Working days left to resolve'),
          el('div.metric-sub', null, '8 from referral, per E-Verify')
        ]) }),
        card({ flush: true, body: metric({ value: mm.shiftsScheduled, label: 'Shifts locked', sub: 'Cannot be changed while the case is open', tone: 'good' }) }),
        card({ flush: true, body: metric({ value: bar.attempts.length, label: 'Attempts refused', sub: 'Each with an on-screen explanation', tone: 'crit' }) }),
        card({ flush: true, body: metric({ value: 5, label: 'Actions prohibited', sub: 'Listed in full on the right' }) })
      ]),
      el('div.grid.split', null, [
        card({
          eyebrow: 'Deadlines', title: 'Five clocks on this case',
          sub: 'Computed from the case dates. Four are statutory, and the last one is polled because E-Verify sends no notification',
          body: clockNodes,
          foot: 'Verified against e-verify.gov and 8 CFR 274a.2 on 16 Aug 2026. Business days here count Monday to Friday and ignore federal holidays. Real E-Verify deadlines are in federal working days, which exclude them.'
        }),
        el('div.col', { style: { gap: 'var(--s5)' } }, [
          card({
            eyebrow: 'Restrictions in force', title: 'Five actions are unlawful until this case closes',
            body: el('div.col', null, [
              el('div.small.muted', null,
                'While an employee contests a mismatch, the employer may not terminate, suspend, withhold or lower pay, delay ' +
                'training, or remove scheduled shifts. Most people who break this have never heard of it.'),
              el('div.hr'),
              tryBtn,
              el('div.small.faint', null, 'The refusal is real. It reads the case state, not a hardcoded flag.')
            ])
          }),
          card({
            eyebrow: 'Employee', title: mm.name,
            body: el('div.col.tight', null, [
              el('div.row', null, [UI.avatar(mm.initials, 'crit'), el('div.col.tight', null, [
                el('div.strong', null, mm.role + ' · ' + mm.store),
                el('div.small.muted', null, 'Started ' + E.fmtDate(mm.started) + ' · ' + mm.decision)
              ])]),
              UI.kv('Mismatch issued', E.fmtDateTime(mm.tncIssued) + ' by ' + mm.tncSource),
              UI.kv('Her decision', 'Contesting, given ' + E.fmtDateTime(mm.decisionAt))
            ])
          })
        ])
      ]),
      card({
        eyebrow: 'Blocked actions', title: bar.attempts.length + ' attempts refused', flush: true,
        sub: 'Each recorded with who tried it and when',
        body: attempts,
        foot: 'A silent refusal teaches nobody anything. Each of these came with an explanation on the manager\'s screen.'
      })
    ]);
  }

  /* ============================================================== checks === */

  function checks() {
    var body = el('div');
    D.checks.forEach(function (c) {
      var slowest = c.searches.reduce(function (a, b) { return b.ms > a.ms ? b : a; }, c.searches[0]);
      var rows = el('div');
      c.searches.forEach(function (s) {
        var isSlow = s === slowest;
        rows.appendChild(el('div', {
          style: {
            display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 96px 92px',
            gap: 'var(--s3)', alignItems: 'center',
            padding: '9px 16px', borderTop: '1px solid var(--line-soft)',
            background: isSlow ? 'var(--clock-soft)' : 'transparent'
          }
        }, [
          el('div.col.tight', null, [
            el('div.small' + (isSlow ? '.strong' : ''), null, s.what + (s.where ? ' · ' + s.where : '')),
            s.note ? el('div.small.faint', null, s.note) : null
          ]),
          el('div.small.mono', { style: { textAlign: 'right', color: isSlow ? 'var(--clock)' : 'var(--muted)', fontWeight: isSlow ? 600 : 400 } }, E.dur(s.ms)),
          el('div', { style: { textAlign: 'right' } }, chip(s.done ? 'Returned' : 'Pending', s.done ? 'is-good' : 'is-warn'))
        ]));
      });

      body.appendChild(card({
        cls: '', flush: true,
        eyebrow: 'Ordered ' + E.fmtDate(c.ordered) + ' · ' + c.searches.length + ' searches',
        title: c.name,
        sub: c.status === 'clear' ? 'Returned clear in ' + c.days + ' days' : 'Still open after ' + c.days + ' days',
        tools: chip(c.status === 'clear' ? 'Clear' : 'Pending', c.status === 'clear' ? 'is-good' : 'is-warn'),
        body: rows,
        foot: 'The highlighted row is the longest-running search. It accounts for the whole delay on this order.'
      }));
    });

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.col.tight', null, [
        UI.eyebrow('Stages 9 and 10 · background checks', 'accent'),
        el('h1.h1', null, 'Order status, broken down by search and by county'),
        el('div.small.muted', { style: { maxWidth: '78ch' } },
          'There is no national criminal database available to US employers. The real records sit in county courts, and some of those ' +
          'need a person to physically walk in. The wait is geography, not inefficiency.')
      ]),
      el('div.grid.c3', null, [
        card({ flush: true, body: metric({ value: 4.8, dp: 1, unit: 'days', label: 'Median turnaround', sub: 'District 12, trailing 30 days', tone: 'accent' }) }),
        card({ flush: true, body: metric({ value: 8.2, dp: 1, unit: 'days', label: 'Longest open order', sub: 'Cole County, records not digitised', tone: 'crit' }) }),
        card({ flush: true, body: metric({ value: 1, label: 'Delays we can act on', sub: 'One drug screen not yet booked', tone: 'good' }) })
      ]),
      el('div.col', { style: { gap: 'var(--s5)' } }, [body]),
      card({
        eyebrow: 'Why the breakdown matters', title: 'What a county-level view changes',
        body: el('div.col.tight', null, [
          el('div.small', null, '1. Nobody chases the agency about something the agency cannot fix.'),
          el('div.small', null, '2. The candidate gets told. Right now, in this market, a candidate waiting eight days in silence goes and takes another job, and nobody records why.')
        ]),
        foot: 'Neither incumbent sells anything at step 10. This is a wait, and a wait is not a feature, which is exactly why it is unoccupied.'
      }),
      UI.simBanner('The screening agency is faked. In a real build we place the order with whichever agency the customer already contracts, and we never perform a check ourselves. Recorded as D-014.')
    ]);
  }

  /* ============================================================== funnel === */

  function funnel() {
    var top = D.funnel[0].v;
    var bars = el('div.bars');
    var byStep = {};
    D.steps.forEach(function (s) { byStep[s.n] = s; });

    D.funnel.forEach(function (f, i) {
      var s = byStep[f.n];
      var prev = i ? D.funnel[i - 1].v : f.v;
      var lost = prev - f.v;
      var colour = s ? 'var(--' + (s.owner === 'human' ? 'accent' : s.owner) + ')' : null;
      bars.appendChild(UI.bar({
        label: (f.n < 10 ? '0' + f.n : f.n) + '  ' + f.label,
        pct: (f.v / top) * 100,
        value: E.n(f.v),
        color: colour
      }));
      if (lost > 0) {
        bars.appendChild(el('div', {
          style: { display: 'grid', gridTemplateColumns: '176px minmax(0,1fr)', gap: 'var(--s3)', margin: '-2px 0 2px' }
        }, [
          el('div'),
          el('div.small.faint', null, '↓ ' + E.n(lost) + ' lost here, ' + E.pct((lost / prev) * 100))
        ]));
      }
    });

    var actorRows = el('div.bars');
    D.actors.forEach(function (a) {
      actorRows.appendChild(UI.bar({
        label: a.who, pct: a.share, value: E.pct(a.share),
        color: 'var(--' + (a.kind === 'human' ? 'accent' : a.kind) + ')'
      }));
    });

    var timeRows = el('tbody');
    D.steps.forEach(function (s) {
      timeRows.appendChild(el('tr', null, [
        el('td.mono', { style: { color: 'var(--faint)' } }, s.n < 10 ? '0' + s.n : String(s.n)),
        el('td', null, [el('div', null, s.name), el('div.small.faint', null, E.OWNER_LABEL[s.owner] + (s.clock ? ' · legal clock' : ''))]),
        el('td.num', null, E.dur(s.medianMs)),
        el('td.num', null, s.drop ? E.pct(s.drop) : '0%'),
        el('td.num', null, E.n(E.stepCount(s)))
      ]));
    });

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.col.tight', null, [
        UI.eyebrow('Reports', 'accent'),
        el('h1.h1', null, 'Time in stage, drop-off, and who acted'),
        el('div.small.muted', { style: { maxWidth: '78ch' } },
          'We looked twice for a published figure on where time goes in US frontline retail hiring, under strict rules, and found ' +
          'nothing traceable. Every figure in this market is a vendor quoting another vendor. So the first deployment has to produce ' +
          'the number rather than borrow one.')
      ]),
      el('div.grid.split', null, [
        card({
          eyebrow: 'Funnel', title: 'District 12, trailing 30 days',
          sub: 'Bar colour shows what handles each stage',
          body: bars,
          foot: 'Simulated. This is the shape the instrumentation produces, not a measured claim about any real retailer.'
        }),
        el('div.col', { style: { gap: 'var(--s5)' } }, [
          card({
            eyebrow: 'Actions by actor', title: '12,488 recorded actions',
            sub: 'Every action attributable to the agent, a rule, or a named person',
            body: actorRows,
            foot: 'Just under seven percent of actions were a person. Every hire decision is inside that seven percent.'
          }),
          card({
            eyebrow: '90-day retention', title: 'Measured on a separate cohort',
            body: el('div.col', null, [
              el('div.row', null, [
                el('div.metric', { style: { padding: 0 } }, [
                  el('div.metric-val', { style: { color: 'var(--good)' } }, [E.n(D.cohort90.still), el('span.unit', null, 'of ' + D.cohort90.started)]),
                  el('div.metric-lab', null, 'Still employed at day 90')
                ])
              ]),
              el('div.small.muted', null, D.cohort90.window + '. It cannot be the same cohort as the funnel above, because that cohort has not had 90 days yet.'),
              el('div.small.faint', null,
                'Worth knowing: the best public retention disclosure in US retail excludes anyone with under a year of service, ' +
                'which is exactly where the churn sits. A customer may have no baseline to hold us to, so the first contract has to ' +
                'establish one.')
            ])
          })
        ])
      ]),
      card({
        eyebrow: 'Stage detail', title: 'All 20 stages', flush: true,
        body: el('div.tw', null, el('table.t', null, [
          el('thead', null, el('tr', null, [
            el('th', null, '#'), el('th', null, 'Stage'),
            el('th.num', null, 'Median'), el('th.num', null, 'Drop'), el('th.num', null, 'Here now')
          ])),
          timeRows
        ]))
      })
    ]);
  }

  /* =============================================================== store === */

  function store() {
    var sv = D.storeView, mm = D.mismatch;

    var openings = el('div');
    sv.openings.forEach(function (o) {
      openings.appendChild(el('div.qitem.own-human', null, [
        UI.avatar(String(o.open)),
        el('div.qmain', null, [
          el('div.qtop', null, [el('span.qname', null, o.role), chip(o.req, 'is-plain')]),
          el('div.qsub', null, o.stage)
        ]),
        el('div.qact', null, [btn('Open', { cls: 'is-sm', onClick: function () { go('decide'); } })])
      ]));
    });

    // A row that just says "warning" makes the reader guess. Each row states
    // the restriction as an instruction, then why it exists, then when it lifts.
    var week = el('div');
    sv.thisWeek.forEach(function (w) {
      var crit = w.kind === 'crit';
      week.appendChild(el('div.qitem' + (crit ? '.is-crit' : ''), null, [
        UI.avatar(w.name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2), crit ? 'crit' : null),
        el('div.qmain', null, [
          el('div.qtop', null, [
            el('span.qname', null, w.name),
            chip(crit ? 'Shifts locked' : 'No action needed', crit ? 'is-crit' : 'is-good'),
            el('span.small.faint', null, w.role + ' · ' + w.since)
          ]),
          el('div', {
            style: {
              fontSize: 'var(--t-body)', fontWeight: '600',
              color: crit ? 'var(--crit)' : 'var(--good)', marginTop: '2px'
            }
          }, w.restriction),
          el('div.qsub', null, w.why),
          w.until ? el('div.small.faint', null, w.until) : null
        ])
      ]));
    });

    var starts = el('div');
    D.starts.forEach(function (s) {
      var c = D.CONFIRM[s.confirm];
      var risk = s.state === 'risk';
      starts.appendChild(el('div.qitem' + (risk ? '.is-warn' : ''), null, [
        UI.avatar(s.initials, risk ? 'crit' : null),
        el('div.qmain', null, [
          el('div.qtop', null, [
            el('span.qname', null, s.name),
            chip(c.label, c.tone),
            el('span.small.faint', null, s.role + ' · first shift ' + E.fmtDate(s.start))
          ]),
          // How we know, stated on every row rather than assumed.
          el('div.small.faint', null, [
            c.how,
            s.tappedAt ? ' · ' + E.fmtDateTime(s.tappedAt) : '',
            ' · ' + s.sent + (s.sent === 1 ? ' message sent' : ' messages sent')
          ]),
          el('div.qsub', null, s.note)
        ])
      ]));
    });

    return el('div.col', { style: { gap: 'var(--s5)' } }, [
      el('div.row.wrap', null, [
        UI.avatar(D.people.marcus.initials),
        el('div.col.tight', null, [
          el('div.h1', null, 'Store ' + D.org.store + ', week of 17 Aug'),
          el('div.small.muted', null,
            'The same records as the district view, filtered to this store, and ordered by what needs doing today.')
        ])
      ]),
      el('div.grid.c3', null, [
        card({ flush: true, body: metric({ value: 35, label: 'Open positions', sub: 'Across 3 roles. 12 filled so far', tone: 'accent' }) }),
        card({ flush: true, body: metric({ value: sv.asks, label: 'Awaiting your decision', sub: '2 candidates interviewed and scored', tone: 'good' }) }),
        card({ flush: true, body: metric({ value: 1, label: 'Employee with locked shifts', sub: mm.name + ', until her E-Verify case closes', tone: 'crit' }) })
      ]),
      el('div.grid.split', null, [
        card({ eyebrow: 'Requisitions', title: 'Open positions at this store', flush: true, body: openings, foot: 'Counts are positions, not candidates. A requisition can carry many openings.' }),
        card({
          eyebrow: 'Employment restrictions', title: 'Rules in force at this store', flush: true, body: week,
          foot: 'These are constraints on what you may do, not notifications. The system enforces each one and will refuse the action rather than warn you afterwards.'
        })
      ]),
      card({
        eyebrow: 'First shifts', title: '4 new hires starting in the next 7 days', flush: true,
        sub: 'Each was sent an SMS with a link unique to them, asking them to confirm the date, the store and who to ask for',
        body: starts,
        foot: 'A tapped link is the only signal that proves a person read the message. Carrier delivery receipts prove the phone received it and nothing more, and email open tracking is unreliable enough that we do not use it. Dax Whitmore has had two messages delivered and has opened neither, which is the earliest warning of a day-one no-show that exists.'
      })
    ]);
  }

  return {
    deck: { title: 'Today', sub: 'Applications and actions waiting on you', icon: 'deck', render: deck },
    pipeline: { title: 'Pipeline', sub: 'All 20 stages, with live counts', icon: 'pipeline', render: pipeline },
    candidate: { title: 'Candidate record', sub: 'Alicia Reyes, full activity history', icon: 'person', render: candidate },
    screening: { title: 'Screening calls', sub: 'Transcripts and the scoring rules', icon: 'chat', render: screening },
    decide: { title: 'Approvals', sub: 'Candidates awaiting a hire decision', icon: 'decide', render: decide },
    flag: { title: 'Rehire check', sub: 'Applicant matched to a do-not-hire record', icon: 'flag', render: flag },
    compliance: { title: 'Compliance', sub: 'I-9, E-Verify and adverse action deadlines', icon: 'shield', render: compliance },
    checks: { title: 'Background checks', sub: 'Order status by search and county', icon: 'clock', render: checks },
    funnel: { title: 'Reports', sub: 'Time in stage, drop-off and who acted', icon: 'chart', render: funnel },
    store: { title: 'Store view', sub: 'Sunfield #0417 Ridgeway', icon: 'store', render: store }
  };
})();
