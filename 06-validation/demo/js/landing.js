/* ============================================================================
   landing.js  ·  the dynamic parts of the landing page

   Five moving things, and each one is doing a job:
     1. a serpentine of twenty nodes with a candidate travelling through it
     2. an activity ticker that decays, so the page reads as live without
        becoming a log pane
     3. the owner chainband, which advances and counts its numbers up
     4. a four stage explainer that plays itself and can be paused
     5. numbers that count when they scroll into view

   Everything uses M.spring from motion.js, so motion starts from the current
   on-screen value and is interruptible. Nothing here uses a fixed-duration
   keyframe for anything a person can interrupt.
   ============================================================================ */

(function () {
  'use strict';

  var el = M.el;
  var reduce = M.prefersReduce;

  /* ---------------------------------------------------------------- theme --- */

  var themeBtn = document.getElementById('themeBtn');

  function themeMode() { return document.documentElement.getAttribute('data-theme') || 'system'; }

  function paintTheme() {
    var m = themeMode();
    themeBtn.textContent = m === 'system' ? 'Auto' : (m === 'dark' ? 'Dark' : 'Light');
    themeBtn.setAttribute('aria-label', 'Theme, currently ' + m + '. Click to change.');
  }

  try {
    var saved = window.localStorage.getItem('demo-theme');
    if (saved && saved !== 'system') document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* file:// can refuse localStorage */ }

  themeBtn.addEventListener('click', function () {
    var order = ['system', 'light', 'dark'];
    var next = order[(order.indexOf(themeMode()) + 1) % 3];
    if (next === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', next);
    try { window.localStorage.setItem('demo-theme', next); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  /* ------------------------------------------------------------------ nav --- */

  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------- reveal on scroll in --- */

  var io = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          if (en.target.dataset.count != null) {
            M.countUp(en.target, parseFloat(en.target.dataset.count), { dp: en.target.dataset.dp ? 1 : 0 });
          }
          io.unobserve(en.target);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' })
    : null;

  function watch(node) {
    if (!node) return;
    if (!io) { node.classList.add('is-in'); if (node.dataset.count != null) node.textContent = node.dataset.count; return; }
    io.observe(node);
  }

  document.querySelectorAll('[data-reveal]').forEach(watch);
  document.querySelectorAll('[data-count]').forEach(watch);
  document.querySelectorAll('.lp-what, .lp-how-head, .moments-grid, .seat-grid, .lp-final, .chain-card')
    .forEach(function (n) { n.classList.add('sec-in'); watch(n); });

  /* =========================================== 1. the twenty step lattice ===
     A serpentine, because the funnel really is one path that folds. Row one is
     the ten hire steps left to right, row two the six onboard steps folding
     back, row three the four activate steps. Node colour is the owner.
  ------------------------------------------------------------------------- */

  var OWNERS = [
    'system', 'system', 'agent', 'system', 'agent', 'human', 'system', 'agent', 'system', 'clock',
    'system', 'clock', 'system', 'system', 'system', 'agent',
    'human', 'human', 'agent', 'clock'
  ];

  var HUE = {
    system: 'var(--system)', agent: 'var(--agent)',
    human: 'var(--accent)', clock: 'var(--clock)', good: 'var(--good)'
  };

  var STAGE_LABEL = [
    { text: 'Hire', x: 30, y: 30 },
    { text: 'Onboard', x: 430, y: 120, anchor: 'end' },
    { text: 'Activate', x: 208, y: 210 }
  ];

  function latticePositions() {
    var gap = 400 / 9, pos = [];
    for (var i = 0; i < 10; i++) pos.push({ x: 30 + i * gap, y: 62 });           // 1..10
    for (var j = 0; j < 6; j++) pos.push({ x: 430 - j * gap, y: 152 });          // 11..16
    for (var k = 0; k < 4; k++) pos.push({ x: 208 + k * gap, y: 242 });          // 17..20
    return pos;
  }

  function buildLattice() {
    var svg = document.getElementById('lattice');
    if (!svg) return;
    var NS = 'http://www.w3.org/2000/svg';
    var pos = latticePositions();

    function mk(tag, attrs) {
      var n = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }

    // The path, drawn as one polyline through every node plus the two folds.
    var d = 'M' + pos[0].x + ' ' + pos[0].y;
    d += ' L' + pos[9].x + ' ' + pos[9].y;
    d += ' Q' + (pos[9].x + 18) + ' ' + pos[9].y + ' ' + (pos[9].x + 18) + ' ' + ((pos[9].y + pos[10].y) / 2);
    d += ' Q' + (pos[9].x + 18) + ' ' + pos[10].y + ' ' + pos[10].x + ' ' + pos[10].y;
    d += ' L' + pos[15].x + ' ' + pos[15].y;
    d += ' Q' + (pos[15].x - 18) + ' ' + pos[15].y + ' ' + (pos[15].x - 18) + ' ' + ((pos[15].y + pos[16].y) / 2);
    d += ' Q' + (pos[15].x - 18) + ' ' + pos[16].y + ' ' + pos[16].x + ' ' + pos[16].y;
    d += ' L' + pos[19].x + ' ' + pos[19].y;

    svg.appendChild(mk('path', { d: d, stroke: 'var(--line)', 'stroke-width': 1.5, fill: 'none', 'stroke-linejoin': 'round' }));

    STAGE_LABEL.forEach(function (s) {
      var t = mk('text', {
        x: s.x, y: s.y, fill: 'var(--faint)',
        'font-size': 9, 'font-weight': 660, 'letter-spacing': 1.2,
        'text-anchor': s.anchor || 'start'
      });
      t.textContent = s.text.toUpperCase();
      svg.appendChild(t);
    });

    var rings = [];
    pos.forEach(function (p, i) {
      var hue = HUE[OWNERS[i]];
      var g = mk('g', {});
      var ring = mk('circle', { cx: p.x, cy: p.y, r: 6.5, fill: 'var(--surface)', stroke: hue, 'stroke-width': 1.6, opacity: 0.42 });
      g.appendChild(ring);
      svg.appendChild(g);
      rings.push(ring);
    });

    // The candidate: one token that travels the whole path.
    var token = mk('circle', { cx: pos[0].x, cy: pos[0].y, r: 3.4, fill: 'var(--accent)' });
    var halo = mk('circle', { cx: pos[0].x, cy: pos[0].y, r: 11, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1, opacity: 0.22 });
    svg.appendChild(halo);
    svg.appendChild(token);

    if (reduce()) {
      rings.forEach(function (r) { r.setAttribute('opacity', 1); });
      token.setAttribute('opacity', 0);
      halo.setAttribute('opacity', 0);
      return;
    }

    // X and Y get independent springs. One spring on a 2D distance desyncs
    // whenever the two axes have different velocities.
    var i = 0, sx = null, sy = null;

    function step() {
      var p = pos[i];
      var hue = HUE[OWNERS[i]];
      token.setAttribute('fill', hue);
      halo.setAttribute('stroke', hue);

      function paint() {
        var x = sx ? sx.value() : p.x, y = sy ? sy.value() : p.y;
        token.setAttribute('cx', x); token.setAttribute('cy', y);
        halo.setAttribute('cx', x); halo.setAttribute('cy', y);
      }

      if (!sx) {
        sx = M.spring({ from: p.x, to: p.x, damping: 1, response: 0.44, onUpdate: paint });
        sy = M.spring({ from: p.y, to: p.y, damping: 1, response: 0.44, onUpdate: paint });
      } else {
        sx.to(p.x); sy.to(p.y);
      }

      rings[i].setAttribute('opacity', 1);
      rings[i].setAttribute('fill', hue);
      rings[i].setAttribute('r', 6.5);

      i++;
      if (i >= pos.length) {
        window.setTimeout(function () {
          rings.forEach(function (r) { r.setAttribute('opacity', 0.42); r.setAttribute('fill', 'var(--surface)'); });
          i = 0;
          step();
        }, 1900);
        return;
      }
      window.setTimeout(step, 420);
    }
    window.setTimeout(step, 700);
  }

  /* ================================================= 2. the activity ticker ===
     Recency decay. It is meant to read as work happening, not to be read.
  ------------------------------------------------------------------------- */

  var FEED = [
    ['agent', 'screening call placed', 'Ridgeway · cashier'],
    ['agent', 'answer matched to phrase bank', 'availability confirmed'],
    ['system', 'eligibility cleared on rules', '18 or over · right to work'],
    ['agent', 'interview reminder sent', '24 h before slot'],
    ['human', 'hire decision recorded', 'M. Iyer · not the model'],
    ['system', 'offer generated from template', '$16.75 · 28 hrs'],
    ['agent', 'silence detected, following up', 'offer open 20 h'],
    ['clock', 'county search still open', 'Cole County · 8.2 d'],
    ['system', 'I-9 section 2 due in 1 business day', 'a person must sign it'],
    ['clock', 'E-Verify mismatch contested', '8 working days left'],
    ['human', 'shift removal refused', 'adverse action barred'],
    ['agent', 'day one confirmation opened', 'knows the door'],
    ['system', 'badge and till login provisioned', 'store 0417'],
    ['agent', 'day 30 check-in, no risk flagged', 'cashier · 0417'],
    ['clock', 'day 90 reached, still employed', 'baseline recorded'],
    ['agent', 'held for a person, bank had no match', 'not guessed at']
  ];

  function buildTicker() {
    var host = document.getElementById('ticker');
    if (!host) return;
    var idx = 0, lines = [];

    function push() {
      var f = FEED[idx % FEED.length]; idx++;
      var line = el('div.ticker-line.k-' + f[0], null, [
        el('span.t', null, String(10 + (idx % 12)).slice(-2) + ':' + String(10 + (idx * 7) % 50).slice(-2)),
        el('span.w', null, f[1]),
        el('span.t', null, f[2])
      ]);
      line.style.opacity = '0';
      host.insertBefore(line, host.firstChild);
      lines.unshift(line);

      if (!reduce()) {
        line.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }],
          { duration: 260, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' });
      } else {
        line.style.opacity = '1';
      }

      // Decay with age, then unmount. Never a scrollback.
      lines.forEach(function (l, i) {
        var o = [1, 0.62, 0.34, 0.16][i];
        if (o == null) { l.remove(); }
        else if (i > 0) { l.style.opacity = String(o); }
      });
      lines = lines.filter(function (l) { return l.isConnected; });
    }

    push(); push(); push();
    if (!reduce()) window.setInterval(push, 2100);
  }

  /* ==================================================== 3. the chainband === */

  var CHAIN = [
    { k: 'system', n: '01', t: 'Software',        v: 2847, u: 'applications', c: 'Read, deduplicated, rule-checked' },
    { k: 'agent',  n: '02', t: 'Screening agent', v: 2209, u: 'conversations', c: 'Asked, matched, held what it could not judge' },
    { k: 'clock',  n: '03', t: 'Fixed waits',     v: 4.8,  u: 'days', dp: 1, c: 'County courts and federal clocks' },
    { k: 'good',   n: '04', t: 'Your call',       v: 421,  u: 'decisions', c: 'A person decides. Every time.', final: true }
  ];

  function buildChain() {
    var rail = document.getElementById('chainRail');
    if (!rail) return;

    var nodes = CHAIN.map(function (c, i) {
      var valNode = el('span.tick', null, '0');
      var node = el('div.chain-node.k-' + c.k + (c.final ? '.is-final' : ''), null, [
        el('span.chain-ring', null, el('i')),
        el('span.chain-n', null, c.n + (c.final ? ' · YOU' : '')),
        el('span.chain-t', null, c.t),
        el('span.chain-v', null, [valNode, el('span.u', null, c.u)]),
        el('span.chain-c', null, c.c)
      ]);
      // A segment takes the hue of the node it ARRIVES at, so the final leg
      // into the human step reads green, exactly as NuAnchor does it.
      if (i < CHAIN.length - 1) {
        node.style.setProperty('--seg', 'color-mix(in oklab, ' + HUE[CHAIN[i + 1].k] + ' 40%, transparent)');
      }
      rail.appendChild(node);
      return { node: node, valNode: valNode, c: c, counted: false };
    });

    var active = 0;
    function light() {
      nodes.forEach(function (n, i) { n.node.classList.toggle('is-on', i === active); });
      var n = nodes[active];
      if (!n.counted) {
        n.counted = true;
        M.countUp(n.valNode, n.c.v, { dp: n.c.dp || 0 });
      }
      active = (active + 1) % nodes.length;
    }

    // Only start once it is on screen, so the numbers are not already counted.
    var started = false;
    function start() {
      if (started) return; started = true;
      if (reduce()) {
        nodes.forEach(function (n) { n.valNode.textContent = n.c.dp ? n.c.v.toFixed(1) : n.c.v.toLocaleString('en-US'); n.node.classList.add('is-on'); });
        return;
      }
      light();
      window.setInterval(light, 1650);
    }

    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { start(); o.disconnect(); } });
      }, { threshold: 0.35 });
      o.observe(rail);
    } else { start(); }
  }

  /* ================================================== 4. how it works ====== */

  var STAGES = [
    {
      k: 'system', n: '01', t: 'Everything arrives in one place', short: 'One place',
      pts: [
        ['Every application', 'career site, job boards, walk-ins'],
        ['Checked against every prior one', 'under the retention window'],
        ['One list read from their own system', 'the do-not-hire list, and only that']
      ],
      detail: null,
      call: null,
      link: ['See the queue', 'app.html#/deck']
    },
    {
      k: 'agent', n: '02', t: 'The agent screens, and holds what it cannot judge', short: 'The agent screens',
      pts: [
        ['A real conversation', 'voice or message, in their own words'],
        ['Matched to a phrase bank', 'written and owned by the retailer'],
        ['Held, not guessed', 'anything the bank does not cover goes to a person']
      ],
      detail: [
        ['01', 'SCREENED THIS WEEKEND', '213'],
        ['02', 'PASSED FORWARD', '194'],
        ['03', 'HELD FOR A PERSON', '19']
      ],
      call: ['The agent can never reject anybody', 'it passes forward, or it holds for a person'],
      link: ['See the call', 'app.html#/screening']
    },
    {
      k: 'human', n: '03', t: 'Your call', short: 'Your call',
      pts: [
        ['A score, and a band', 'because one number to two decimals would be a lie'],
        ['The reasoning under it', 'every point traceable to something said'],
        ['A name on the record', 'yours, not the model\'s']
      ],
      detail: [
        ['01', 'AGENT SCORE', '82'],
        ['02', 'BAND', '74 to 88'],
        ['03', 'DECIDED BY', 'a person']
      ],
      call: null,
      link: ['See the decision desk', 'app.html#/decide']
    },
    {
      k: 'good', n: '04', t: 'It measures itself', short: 'It measures itself',
      pts: [
        ['Time in every step', 'and which of them is a legal clock'],
        ['Where people drop', 'per step, not per funnel'],
        ['Who acted', '71% agent, 22% rules, 6.7% a person']
      ],
      detail: null,
      call: ['Nobody publishes where the time goes', 'we looked twice, so the first deployment produces it'],
      link: ['See the instrumentation', 'app.html#/funnel']
    }
  ];

  function buildHow() {
    var cardsHost = document.getElementById('howCards');
    var tabsHost = document.getElementById('howTabs');
    var pill = document.getElementById('howPill');
    var toggle = document.getElementById('howToggle');
    var toggleLabel = document.getElementById('howToggleLabel');
    if (!cardsHost) return;

    var cards = [], tabs = [];

    STAGES.forEach(function (s, i) {
      var body = [
        el('div.how-hd', null, [el('span.n', null, s.n), el('span.t', null, s.t)]),
        el('div.how-pts', null, s.pts.map(function (p) {
          return el('div.how-pt', null, el('div', null, [
            el('div.pt-t', null, p[0]),
            el('div.pt-s', null, p[1])
          ]));
        }))
      ];
      var detailWrap = el('div.how-detail');
      body.push(detailWrap);
      if (s.call) {
        body.push(el('div.how-call', null, [
          el('div.ct', null, s.call[0]),
          el('div.cs', null, s.call[1])
        ]));
      }
      body.push(el('a.lp-link.how-foot', { href: s.link[1] }, [s.link[0], el('span', { 'aria-hidden': 'true' }, '→')]));

      var card = el('button.how-card.k-' + s.k, {
        type: 'button', 'aria-label': 'Stage ' + s.n + ', ' + s.t,
        onclick: function () { pause(); show(i); }
      }, body);
      cardsHost.appendChild(card);
      cards.push({ card: card, detailWrap: detailWrap, s: s, filled: false });

      var tab = el('button.how-tab.k-' + s.k, {
        type: 'button', role: 'tab', 'aria-selected': i === 0 ? 'true' : 'false',
        onclick: function () { pause(); show(i); }
      }, [el('span.n', null, s.n), el('span', null, s.short || s.t)]);
      tabsHost.appendChild(tab);
      tabs.push(tab);
    });

    var cur = -1;

    function show(i) {
      if (i === cur) return;
      cur = i;
      cards.forEach(function (c, j) {
        c.card.classList.toggle('is-on', j === i);
        // The detail rows only exist on the active card, so an inactive card
        // stays a summary rather than a wall.
        M.clear(c.detailWrap);
        if (j === i && c.s.detail) {
          c.s.detail.forEach(function (r, ri) {
            var row = el('div.how-row', null, [
              el('span.rn', null, r[0]),
              el('div', null, [el('div.rk', null, r[1]), el('div.rv', null, r[2])])
            ]);
            if (!reduce()) {
              row.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }],
                { duration: 300, delay: ri * 55, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'both' });
            }
            c.detailWrap.appendChild(row);
          });
        }
      });
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); });

      var s = STAGES[i];
      pill.className = 'how-pill k-' + s.k;
      M.clear(pill);
      pill.appendChild(el('span.n', null, s.n));
      pill.appendChild(el('span', null, s.t));
      placePill(i);
    }

    // Slide the pill to sit over the active card. Animate a real transform,
    // measured from the card, so it lands on the card and not on page centre.
    var pillSpring = null;
    function placePill(i) {
      var host = cardsHost.getBoundingClientRect();
      var card = cards[i].card.getBoundingClientRect();
      if (!host.width || !card.width) return;
      // The pill row is centred, so offset is from the row's own centre.
      var target = (card.left + card.width / 2) - (host.left + host.width / 2);
      if (reduce()) { pill.style.transform = 'translateX(' + target + 'px)'; return; }
      if (!pillSpring) {
        pillSpring = M.spring({
          from: target, to: target, damping: 1, response: 0.42,
          onUpdate: function (v) { pill.style.transform = 'translateX(' + v + 'px)'; }
        });
      } else {
        pillSpring.to(target);
      }
    }
    window.addEventListener('resize', function () { if (cur >= 0) placePill(cur); }, { passive: true });

    var timer = null;
    function play() {
      if (reduce()) return;
      toggle.setAttribute('aria-pressed', 'true');
      toggleLabel.textContent = 'Playing';
      toggle.classList.add('is-playing');
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () { show((cur + 1) % STAGES.length); }, 4200);
    }
    function pause() {
      toggle.setAttribute('aria-pressed', 'false');
      toggleLabel.textContent = 'Paused';
      toggle.classList.remove('is-playing');
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    toggle.addEventListener('click', function () { timer ? pause() : play(); });

    show(0);

    if ('IntersectionObserver' in window && !reduce()) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { play(); } else { if (timer) { window.clearInterval(timer); timer = null; toggleLabel.textContent = 'Paused'; } } });
      }, { threshold: 0.25 });
      o.observe(cardsHost);
    } else if (reduce()) {
      toggleLabel.textContent = 'Paused';
      toggle.setAttribute('aria-pressed', 'false');
    }
  }

  /* ------------------------------------------------------------------ boot --- */

  buildLattice();
  buildTicker();
  buildChain();
  buildHow();
})();
