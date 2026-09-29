/* ============================================================================
   ui.js  ·  shared components
   Small pure builders. Every one returns a DOM node.
   ============================================================================ */

window.UI = (function () {
  'use strict';

  var el = M.el, icon = M.icon;

  var ICON = {
    deck:     ['M2.25 2.25h4.5v4.5h-4.5z', 'M9.25 2.25h4.5v4.5h-4.5z', 'M2.25 9.25h4.5v4.5h-4.5z', 'M9.25 9.25h4.5v4.5h-4.5z'],
    pipeline: ['M2 4h12', 'M2 8h12', 'M2 12h7'],
    person:   ['M8 7.75a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8z', 'M3.25 13.75c0-2.4 2.1-3.9 4.75-3.9s4.75 1.5 4.75 3.9'],
    chat:     ['M13.75 8.4c0 2.4-2.6 4.35-5.75 4.35-.75 0-1.5-.1-2.2-.3L3.1 13.6l.75-2.2C2.85 10.6 2.25 9.55 2.25 8.4c0-2.4 2.6-4.35 5.75-4.35s5.75 1.95 5.75 4.35z'],
    decide:   ['M8 13.9A5.9 5.9 0 108 2.1a5.9 5.9 0 000 11.8z', 'M5.6 8.1l1.7 1.7 3.1-3.5'],
    flag:     ['M4 2.25v11.5', 'M4 3.1h8L10.6 5.6 12 8.1H4'],
    shield:   ['M8 2.1l4.9 1.95V8c0 2.95-1.95 5.1-4.9 5.9C5.05 13.1 3.1 10.95 3.1 8V4.05L8 2.1z'],
    clock:    ['M8 13.9A5.9 5.9 0 108 2.1a5.9 5.9 0 000 11.8z', 'M8 5.1v3.15l2.15 1.35'],
    chart:    ['M2.6 13.4V8.2', 'M6.5 13.4V3.6', 'M10.4 13.4V9.6', 'M13.9 13.4V6.1'],
    store:    ['M2.25 6l1.5-3.1h8.5L13.75 6', 'M3.2 6v7.75h9.6V6', 'M6.4 13.75V9.9h3.2v3.85'],
    sun:      ['M8 10.6a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2z', 'M8 1.5v1.4', 'M8 13.1v1.4', 'M1.5 8h1.4', 'M13.1 8h1.4', 'M3.4 3.4l1 1', 'M11.6 11.6l1 1', 'M12.6 3.4l-1 1', 'M4.4 11.6l-1 1'],
    moon:     ['M13 9.9A5.6 5.6 0 016.1 3a5.9 5.9 0 106.9 6.9z'],
    reset:    ['M13.2 8a5.2 5.2 0 11-1.6-3.75', 'M13.4 2.6v2.9h-2.9'],
    notes:    ['M3.25 2.5h9.5v11h-9.5z', 'M5.6 5.6h4.8', 'M5.6 8h4.8', 'M5.6 10.4h3'],
    menu:     ['M2.5 4.5h11', 'M2.5 8h11', 'M2.5 11.5h11'],
    close:    ['M4 4l8 8', 'M12 4l-8 8'],
    arrow:    ['M3 8h10', 'M9.2 4.2L13 8l-3.8 3.8'],
    chev:     ['M6 4l4 4-4 4'],
    lock:     ['M4.25 7.25h7.5v6h-7.5z', 'M5.9 7.25V5.4a2.1 2.1 0 014.2 0v1.85'],
    globe:    ['M8 13.9A5.9 5.9 0 108 2.1a5.9 5.9 0 000 11.8z', 'M2.3 8h11.4', 'M8 2.1c1.6 1.6 2.4 3.6 2.4 5.9S9.6 12.3 8 13.9', 'M8 2.1C6.4 3.7 5.6 5.7 5.6 8s.8 4.3 2.4 5.9'],
    bell:     ['M8 2.4a3.6 3.6 0 00-3.6 3.6c0 3.2-1.15 4.2-1.15 4.2h9.5S11.6 9.2 11.6 6A3.6 3.6 0 008 2.4z', 'M6.6 12.4a1.6 1.6 0 002.8 0']
  };

  function ico(name, size) { return icon(ICON[name] || ICON.deck, size); }

  /* --------------------------------------------------------------- atoms --- */

  function chip(text, kind, withDot) {
    return el('span.chip' + (kind ? '.' + kind : ''), null, [
      withDot ? el('span.dot') : null,
      text
    ]);
  }

  /* The owner labels moved to the server with everything else, so this reads
     E.ownerLabel() rather than a constant that used to live in engine.js. */
  function ownerChip(owner) {
    var map = { agent: 'own-agent', human: 'own-human', system: 'own-system', clock: 'own-clock' };
    return chip(E.ownerLabel(owner), map[owner] || 'is-plain', true);
  }

  function avatar(initials, kind) {
    return el('span.avatar' + (kind ? '.is-' + kind : ''), { 'aria-hidden': 'true' }, initials);
  }

  function eyebrow(text, kind) {
    return el('div.eyebrow' + (kind ? '.is-' + kind : ''), null, text);
  }

  /** A big number that counts up. */
  function metric(o) {
    var valNode = el('span.tick', null, '0');
    var node = el('div.metric' + (o.tone ? '.is-' + o.tone : ''), null, [
      el('div.metric-val', null, [valNode, o.unit ? el('span.unit', null, o.unit) : null]),
      el('div.metric-lab', null, o.label),
      o.sub ? el('div.metric-sub', null, o.sub) : null,
      o.range ? rangeBar(o.range[0], o.range[1], o.value) : null
    ]);
    // Count up once the node is in the document.
    requestAnimationFrame(function () {
      M.countUp(valNode, o.value, { dp: o.dp || 0, prefix: o.prefix || '', suffix: o.suffix || '' });
    });
    return node;
  }

  function rangeBar(lo, hi, mark) {
    var span = hi - lo;
    var fill = el('span.range-fill', { style: { left: '0%', width: '100%' } });
    var m = el('span.range-mark', { style: { left: (span ? ((mark - lo) / span) * 100 : 50) + '%' } });
    return el('div.range-bar', { title: 'Band ' + lo + ' to ' + hi, 'aria-label': 'band ' + lo + ' to ' + hi }, [fill, m]);
  }

  function card(o) {
    var head = null;
    if (o.title || o.tools) {
      head = el('div.card-hd', null, [
        el('div.col.tight', null, [
          o.eyebrow ? eyebrow(o.eyebrow, o.eyebrowKind) : null,
          o.title ? el('div.h2', null, o.title) : null,
          o.sub ? el('div.small.muted', null, o.sub) : null
        ]),
        el('div.spacer'),
        o.tools || null
      ]);
    }
    return el('section.card' + (o.cls ? '.' + o.cls : ''), o.attrs || null, [
      head,
      el('div.card-bd' + (o.flush ? '.is-flush' : ''), null, o.body),
      o.foot ? el('div.card-ft', null, o.foot) : null
    ]);
  }

  /** What the agent owns, what you decide. Per step, on screen. */
  function boundary(agentDoes, humanDoes) {
    return el('div.boundary', null, [
      el('div.b-agent', null, [el('div.b-k', null, 'Agent owns'), el('div.b-v', null, agentDoes)]),
      el('div.b-human', null, [el('div.b-k', null, 'You decide'), el('div.b-v', null, humanDoes)])
    ]);
  }

  function btn(label, o) {
    o = o || {};
    return el('button.btn' + (o.cls ? '.' + o.cls : ''), {
      type: 'button',
      onclick: o.onClick,
      disabled: o.disabled,
      'aria-label': o.aria || null,
      title: o.title || null
    }, [
      o.icon ? ico(o.icon) : null,
      label ? el('span', null, label) : null,
      o.iconAfter ? ico(o.iconAfter) : null
    ]);
  }

  function bar(o) {
    var fill = el('span.bar-fill', { style: { width: '0%', background: o.color || null } });
    requestAnimationFrame(function () { M.growBar(fill, o.pct); });
    return el('div.bar-row', null, [
      el('div.bar-lab', { title: o.label }, o.label),
      el('div.bar-track', null, fill),
      el('div.bar-val', null, o.value)
    ]);
  }

  function empty(title, sub) {
    return el('div.empty', null, [
      el('div.h3', null, title),
      sub ? el('div.small', null, sub) : null
    ]);
  }

  function kv(k, v) {
    return el('div.col.tight', null, [el('div.eyebrow', null, k), el('div.small', null, v)]);
  }

  /** A simulated-system banner. Honest labelling. */
  function simBanner(what) {
    return el('div.sim-note', null, [el('b', null, 'Simulated: '), what]);
  }

  return {
    ICON: ICON, ico: ico, chip: chip, ownerChip: ownerChip, avatar: avatar,
    eyebrow: eyebrow, metric: metric, rangeBar: rangeBar, card: card,
    boundary: boundary, btn: btn, bar: bar, empty: empty, kv: kv, simBanner: simBanner
  };
})();
