/* ============================================================================
   app.js  ·  shell, router, presenter mode

   The router is asynchronous now. Every route change fetches that screen from
   the API and then paints it, because the browser holds no data of its own.
   There is a loading state and there is an error state, and the error state
   prints what actually went wrong rather than an empty screen.
   ============================================================================ */

window.App = (function () {
  'use strict';

  var el = M.el, D = window.DEMO;

  var NAV = [
    { label: 'Work queue', items: ['deck', 'decide', 'screening'] },
    { label: 'Pipeline', items: ['pipeline', 'candidate', 'sources', 'funnel'] },
    { label: 'Checks and compliance', items: ['flag', 'compliance', 'checks'] },
    { label: 'Views', items: ['store'] }
  ];

  var ORDER = ['deck', 'decide', 'screening', 'pipeline', 'candidate', 'funnel',
               'flag', 'compliance', 'checks', 'sources', 'store'];

  var refs = {};
  var counts = {};      // nav badges, refreshed with the deck payload

  /* ---------------------------------------------------------------- theme --- */

  function themeMode() { return document.documentElement.getAttribute('data-theme') || 'system'; }

  function setTheme(mode) {
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    try { window.localStorage.setItem('demo-theme', mode); } catch (e) { /* ignore */ }
    paintThemeBtn();
  }

  function cycleTheme() {
    var order = ['system', 'light', 'dark'];
    setTheme(order[(order.indexOf(themeMode()) + 1) % order.length]);
    M.toast('Theme: <b>' + themeMode() + '</b>', 'agent', 1600);
  }

  function paintThemeBtn() {
    if (!refs.themeBtn) return;
    var mode = themeMode();
    M.clear(refs.themeBtn);
    refs.themeBtn.appendChild(UI.ico(mode === 'dark' ? 'moon' : 'sun'));
    refs.themeBtn.appendChild(el('span', null, mode === 'system' ? 'Auto' : (mode === 'dark' ? 'Dark' : 'Light')));
    refs.themeBtn.setAttribute('aria-label', 'Theme, currently ' + mode + '. Click to change.');
  }

  /* --------------------------------------------------------------- router --- */

  function routeFromHash() {
    var h = (window.location.hash || '').replace(/^#\/?/, '');
    return VIEWS[h] ? h : 'deck';
  }

  function go(route) {
    if (!VIEWS[route]) route = 'deck';
    if (window.location.hash !== '#/' + route) window.location.hash = '#/' + route;
    else render(route);
  }

  var renderToken = 0;

  function render(route) {
    var v = VIEWS[route];
    if (!v) return Promise.resolve();
    E.ui.route = route;
    var token = ++renderToken;

    M.clear(refs.title);
    refs.title.appendChild(el('h1.h3', null, v.title));
    refs.title.appendChild(el('div.small.faint', null, v.sub));
    document.title = v.title + ' · Frontline hiring';
    paintNav();

    M.clear(refs.view);
    refs.view.appendChild(el('div.load', null, 'Loading ' + v.title.toLowerCase()));

    return E.load(route).then(function () {
      // A slower earlier request must not paint over a newer one.
      if (token !== renderToken) return;
      paint(route);
    }).catch(function (err) {
      if (token !== renderToken) return;
      M.clear(refs.view);
      refs.view.appendChild(UI.card({
        title: 'This screen could not load',
        body: el('div.col.tight', null, [
          el('div.small', null, 'The API did not answer. The server may not be running.'),
          el('pre.small.mono', { style: { whiteSpace: 'pre-wrap', color: 'var(--crit)' } }, String(err && err.message || err)),
          el('div.small.muted', null, 'Start it with: node server/index.js  from the demo folder.')
        ])
      }));
      if (window.console) window.console.error('load failed:', route, err);
    });
  }

  function paint(route) {
    var v = VIEWS[route];
    M.clear(refs.view);
    var node;
    try {
      node = v.render();
    } catch (err) {
      node = UI.card({
        title: 'This view failed to render',
        body: el('div.col.tight', null, [
          el('div.small', null, 'Something in the demo broke rather than pretending it did not.'),
          el('pre.small.mono', { style: { whiteSpace: 'pre-wrap', color: 'var(--crit)' } }, String(err && err.stack || err))
        ])
      });
      if (window.console) window.console.error('View render failed:', route, err);
    }
    node.classList.add('rise');
    refs.view.appendChild(node);
    paintClock();
    refreshCounts();
    paintPresenter();
    refs.scroller.scrollTop = 0;
    if (refs.sidebar) refs.sidebar.classList.remove('is-open');
  }

  /* ------------------------------------------------------------------ nav --- */

  /* Badge counts come from one small read rather than from each screen, so the
     sidebar is right even when you are looking at something else. */
  function refreshCounts() {
    return API.view('deck', { as: E.ui.role }).then(function (r) {
      var d = r.data;
      counts = {
        deck: { n: d.queue.needsPerson.length, alert: false },
        decide: { n: d.decisions.count, alert: false },
        screening: { n: d.screening.waiting.length, alert: false },
        flag: { n: d.blocked.blocking, alert: d.blocked.blocking > 0 },
        compliance: { n: 0, alert: false }
      };
      paintNav();
    }).catch(function () { /* the screen already reported the failure */ });
  }

  function paintNav() {
    if (!refs.nav) return;
    M.clear(refs.nav);
    NAV.forEach(function (g) {
      var group = el('div.nav-group', null, [el('div.nav-label', null, g.label)]);
      g.items.forEach(function (route) {
        var v = VIEWS[route];
        var c = counts[route];
        group.appendChild(el('button.nav-item', {
          type: 'button',
          'aria-current': E.ui.route === route ? 'page' : null,
          onclick: function () { go(route); }
        }, [
          el('span.nav-ico', null, UI.ico(v.icon)),
          el('span', null, v.title),
          c && c.n ? el('span.nav-count' + (c.alert ? '.is-alert' : ''), null, String(c.n)) : null
        ]));
      });
      refs.nav.appendChild(group);
    });
  }

  /* ------------------------------------------------------------ presenter --- */

  function scene() {
    var s = E.ui.scene;
    return D.scenes[Math.max(0, Math.min(D.scenes.length - 1, s - 1))];
  }

  function gotoScene(n) {
    E.ui.scene = Math.max(1, Math.min(D.scenes.length, n));
    go(D.scenes[E.ui.scene - 1].route);
  }

  function togglePresenter() {
    var on = !E.ui.presenter;
    E.ui.presenter = on;
    refs.presenter.hidden = !on;
    measurePresenter();
    if (refs.presBtn) refs.presBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) gotoScene(E.ui.scene);
    paintPresenter();
    M.toast(on ? 'Presenter notes on. <b>&larr;</b> and <b>&rarr;</b> move between scenes.' : 'Presenter notes off.', 'agent', 2400);
  }

  function measurePresenter() {
    var h = (!refs.presenter || refs.presenter.hidden)
      ? 0 : Math.ceil(refs.presenter.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--presenter-h', h + 'px');
  }

  function paintPresenter() {
    if (!refs.presenter || refs.presenter.hidden) { measurePresenter(); return; }
    var sc = scene();
    M.clear(refs.pInner);
    refs.pInner.appendChild(el('div.p-scene', null, [
      el('div.n', null, String(sc.id)), el('div.of', null, 'of ' + D.scenes.length)
    ]));
    refs.pInner.appendChild(el('div.p-say', null, [
      el('div.k', null, [sc.t, ' · say this · land ', el('span', { style: { color: 'var(--accent)' } }, sc.land)]),
      el('div.v', null, sc.say),
      el('div.k', { style: { marginTop: '4px' } }, ['do: ',
        el('span', { style: { textTransform: 'none', letterSpacing: 0, color: 'var(--muted)', fontWeight: 400 } }, sc.act)])
    ]));
    refs.pInner.appendChild(el('div.p-nav', null, [
      UI.btn('', { cls: 'is-ghost', icon: 'chev', aria: 'Previous scene', onClick: function () { gotoScene(sc.id - 1); } }),
      el('span.small.mono.faint', null, sc.secs + 's'),
      UI.btn('Next', { cls: 'is-primary', onClick: function () { gotoScene(sc.id + 1); } })
    ]));
    var first = refs.pInner.querySelector('.p-nav .btn svg');
    if (first) first.style.transform = 'scaleX(-1)';
    requestAnimationFrame(measurePresenter);
  }

  /* ----------------------------------------------------------------- role --- */

  function paintRole() {
    if (!refs.roleSeg) return;
    Array.prototype.forEach.call(refs.roleSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.dataset.role === E.ui.role ? 'true' : 'false');
    });
    if (refs.who) {
      var p = E.person();
      M.clear(refs.who);
      refs.who.appendChild(el('div.brand-name', { style: { fontSize: '0.8125rem' } }, p.name));
      refs.who.appendChild(el('div.brand-sub', null, p.role + ' · ' + p.scope));
    }
  }

  function setRole(role) {
    E.ui.role = role;
    paintRole();
    render(E.ui.route);
  }

  /* ---------------------------------------------------------------- sheet --- */

  function openSheetWith(o) {
    M.clear(refs.sheetHd);
    refs.sheetHd.appendChild(el('div.col.tight', { style: { flex: '1 1 auto', minWidth: 0 } }, [
      o.eyebrow ? UI.eyebrow(o.eyebrow, o.eyebrowKind) : null,
      el('div.h2', null, o.title),
      o.chipNode || null
    ]));
    refs.sheetHd.appendChild(UI.btn('', { cls: 'is-ghost', icon: 'close', aria: 'Close', onClick: closeSheet }));
    M.clear(refs.sheetBd);
    M.append(refs.sheetBd, o.body);
    M.openSheet(refs.sheet, refs.scrim);
  }

  function closeSheet() { M.closeSheet(refs.sheet, refs.scrim); }

  /* ------------------------------------------------------------ the clock --- */

  /* The sidebar is built once, before any screen has loaded, so the simulated
     present was not known yet and it showed today's real date instead. It is
     repainted after every load. */
  function paintClock() {
    var node = document.getElementById('sim-now');
    if (node) node.textContent = E.fmtDay(E.now()) + ', ' + E.fmtDateTime(E.now()).split(', ')[1];
  }

  /**
   * The most useful control in the product for a demo, and the most honest.
   * It does not fake anything. It moves the simulated present, and then the
   * ordinary ticker runs: a county returns because its expected time genuinely
   * passed, an offer expires because three days genuinely went by.
   */
  function advance(hours) {
    M.toast('Winding the clock forward ' + hours + ' hours', 'agent', 1600);
    return E.advanceClock(hours).then(function (r) {
      var kinds = {};
      (r.changes || []).forEach(function (c) { kinds[c.kind] = (kinds[c.kind] || 0) + 1; });
      var summary = Object.keys(kinds).map(function (k) {
        return kinds[k] + ' ' + k.replace(/_/g, ' ');
      }).join(', ');
      M.toast(summary ? 'Now ' + E.fmtDay(r.now) + '. ' + summary + '.' : 'Now ' + E.fmtDay(r.now) + '. Nothing was due.',
        'agent', 5200);
      return render(E.ui.route);
    });
  }

  /* ------------------------------------------------------------- keyboard --- */

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'Escape') {
      if (!refs.sheet.hidden) { closeSheet(); e.preventDefault(); }
      else if (refs.sidebar.classList.contains('is-open')) refs.sidebar.classList.remove('is-open');
      return;
    }
    if (e.key === 'ArrowRight' && E.ui.presenter) { gotoScene(E.ui.scene + 1); e.preventDefault(); return; }
    if (e.key === 'ArrowLeft' && E.ui.presenter) { gotoScene(E.ui.scene - 1); e.preventDefault(); return; }

    var k = e.key.toLowerCase();
    if (k === 'c') return;                       // chat.js owns this
    if (k === 'p') { togglePresenter(); e.preventDefault(); return; }
    if (k === 't') { cycleTheme(); e.preventDefault(); return; }
    if (k === 'r') { doReset(); e.preventDefault(); return; }
    if (k === '?') { showHelp(); e.preventDefault(); return; }

    if (/^[1-9]$/.test(e.key)) {
      var idx = parseInt(e.key, 10) - 1;
      if (ORDER[idx]) { go(ORDER[idx]); e.preventDefault(); }
      return;
    }
    if (e.key === '0') { go(ORDER[9]); e.preventDefault(); }
  }

  function showHelp() {
    var s = E.llm();
    openSheetWith({
      eyebrow: 'Keyboard', title: 'Driving the demo without the mouse',
      body: [
        UI.card({
          flush: true,
          body: el('div.tw', null, el('table.t', null, [
            el('thead', null, el('tr', null, [el('th', null, 'Key'), el('th', null, 'Does')])),
            el('tbody', null, [
              ['P', 'Presenter notes on or off'],
              ['&larr; &rarr;', 'Previous or next scene, when presenter notes are on'],
              ['1 to 0', 'Jump straight to a screen, in sidebar order'],
              ['C', 'Open the assistant'],
              ['T', 'Cycle theme: auto, light, dark'],
              ['R', 'Reseed the whole demo from scratch'],
              ['Esc', 'Close a panel'],
              ['?', 'This list']
            ].map(function (r) {
              var td = el('td.mono');
              td.innerHTML = r[0];
              return el('tr', null, [td, el('td', null, r[1])]);
            }))
          ]))
        }),
        UI.card({
          eyebrow: 'What is running', title: 'The honest version',
          body: UI.card ? el('dl.deflist', null, [
            el('dt', null, 'Data'), el('dd', null, 'Persisted on the server. A refresh does not lose it.'),
            el('dt', null, 'Model'), el('dd', null, s && s.configured ? s.model + ' via ' + s.provider
              : 'None configured. Screening uses the deterministic phrase bank rubric and says so on screen.'),
            el('dt', null, 'Connectors'), el('dd', null, 'All simulated. None holds a credential.'),
            el('dt', null, 'Email and SMS'), el('dd', null, 'Development adapters. Nothing leaves this machine.')
          ]) : null
        }),
        UI.card({
          eyebrow: 'Before you present', title: 'Three things worth doing',
          body: el('div.col.tight', null, [
            el('div.small', null, '1. Press R to reseed. A half-run demo is the one thing that looks broken.'),
            el('div.small', null, '2. Window at 1440 by 900, nothing else on screen, notifications off.'),
            el('div.small', null, '3. Turn presenter notes off before you share your screen, unless you want them seen.')
          ])
        })
      ]
    });
  }

  function doReset() {
    M.toast('Reseeding', 'agent', 1400);
    E.reseed().then(function () {
      E.ui.focusApplication = null;
      E.ui.storeId = null;
      go('deck');
      render('deck');
      M.toast('Reseeded from scratch. 36 candidates, replayed through the workflow engine.', 'good', 3200);
    });
  }

  /* ----------------------------------------------------------------- boot --- */

  function build() {
    var app = document.getElementById('app');
    M.clear(app);

    refs.nav = el('div.col', { style: { gap: 'var(--s5)' } });
    refs.who = el('div.col', { style: { gap: 0 } });

    var boot = E.boot();
    var llm = E.llm();

    refs.sidebar = el('aside.sidebar', { id: 'sidebar' }, [
      el('a.brand', { href: 'index.html', title: 'Back to the overview' }, [
        el('span.brand-mark', null, M.icon(['M8 2.6l5.4 5.4L8 13.4 2.6 8z'])),
        el('div.col', { style: { gap: 0 } }, [
          el('div.brand-name', null, 'Frontline'),
          el('div.brand-sub', null, boot.org.name)
        ])
      ]),
      refs.nav,
      el('div.sidebar-foot', null, [
        el('div.col.tight', null, [UI.eyebrow('Signed in as'), refs.who]),
        el('div.col.tight', null, [
          UI.eyebrow('Simulated present'),
          el('div.small.mono', { id: 'sim-now' }, E.fmtDay(E.now())),
          el('div.row', { style: { gap: '4px' } }, [
            UI.btn('+4h', { cls: 'is-ghost is-sm', onClick: function () { advance(4); }, title: 'Move the present forward four hours' }),
            UI.btn('+1d', { cls: 'is-ghost is-sm', onClick: function () { advance(24); } }),
            UI.btn('+3d', { cls: 'is-ghost is-sm', onClick: function () { advance(72); } })
          ]),
          el('div.small.faint', null, 'Moves the clock, never the data. Whatever happens next happened for the real reason.')
        ]),
        UI.simBanner(llm && llm.configured
          ? 'Every external system: job boards, the screening agency, E-Verify, payroll, scheduling and training. The model is real and is ' + llm.model + '.'
          : 'Every external system, and the screening evaluation, which falls back to a deterministic rubric because no LLM_API_KEY is set.'),
        el('div.row', { style: { gap: '6px' } }, [
          UI.btn('Reseed', { cls: 'is-ghost is-sm', icon: 'reset', onClick: doReset, title: 'Reseed the demo (R)' }),
          UI.btn('Keys', { cls: 'is-ghost is-sm', onClick: showHelp, title: 'Keyboard shortcuts (?)' })
        ])
      ])
    ]);

    refs.title = el('div.topbar-title');
    refs.themeBtn = el('button.btn.is-ghost.is-sm', { type: 'button', onclick: cycleTheme });

    refs.roleSeg = el('div.seg', { role: 'group', 'aria-label': 'Whose screen' }, [
      el('button', { type: 'button', 'data-role': 'marcus', 'aria-pressed': 'true',
        onclick: function () { setRole('marcus'); } }, 'Store'),
      el('button', { type: 'button', 'data-role': 'dana', 'aria-pressed': 'false',
        onclick: function () { setRole('dana'); } }, 'Field HR')
    ]);

    refs.presBtn = el('button.btn.is-ghost.is-sm', {
      type: 'button', 'aria-pressed': 'false', onclick: togglePresenter, title: 'Presenter notes (P)'
    }, [UI.ico('notes'), el('span', null, 'Notes')]);

    var topbar = el('header.topbar', null, [
      el('button.btn.is-ghost.menu-btn', {
        type: 'button', 'aria-label': 'Menu',
        onclick: function () { refs.sidebar.classList.toggle('is-open'); }
      }, UI.ico('menu')),
      refs.title,
      el('div.topbar-spacer'),
      el('div.topbar-tools', null, [refs.roleSeg, refs.presBtn, refs.themeBtn])
    ]);

    refs.view = el('div.content', { id: 'view' });
    refs.pInner = el('div.p-inner');
    refs.presenter = el('div.presenter', { id: 'presenter', hidden: true }, refs.pInner);

    refs.scroller = el('div.panel-scroll', null, [
      topbar, el('div.scroll-edge', { 'aria-hidden': 'true' }), refs.view
    ]);
    refs.panel = el('div.panel', null, [refs.scroller, refs.presenter]);
    refs.deck = el('div.main', null, refs.panel);

    refs.sheetHd = el('div.sheet-hd');
    refs.sheetBd = el('div.sheet-bd');
    refs.sheet = el('aside.sheet', { id: 'sheet', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Detail' },
      [refs.sheetHd, refs.sheetBd]);
    refs.scrim = el('div.scrim', { id: 'scrim', hidden: true, onclick: closeSheet });

    app.appendChild(el('div.shell', null, [refs.sidebar, refs.deck]));
    app.appendChild(refs.scrim);
    app.appendChild(refs.sheet);
    app.appendChild(el('div.toasts', { id: 'toasts', 'aria-live': 'polite' }));
  }

  function fatal(err) {
    var app = document.getElementById('app');
    M.clear(app);
    app.appendChild(el('div.center-col', { style: { padding: '48px', maxWidth: '62ch' } }, [
      el('h1.h2', null, 'The server is not answering'),
      el('p.small', null, 'This build has a backend. The browser holds no data of its own, so there is nothing to show until it can reach the API.'),
      el('pre.small.mono', { style: { whiteSpace: 'pre-wrap', color: 'var(--crit)' } }, String(err && err.message || err)),
      el('p.small.muted', null, 'From the demo folder, run:  node server/index.js  then open http://localhost:4173/app.html')
    ]));
  }

  function boot() {
    try {
      var saved = window.localStorage.getItem('demo-theme');
      if (saved && saved !== 'system') document.documentElement.setAttribute('data-theme', saved);
    } catch (e) { /* ignore */ }

    return E.bootstrap().then(function () {
      build();
      paintThemeBtn();
      paintRole();

      E.sub(function () { paint(E.ui.route); });

      window.addEventListener('hashchange', function () { render(routeFromHash()); });
      window.addEventListener('keydown', onKey);
      window.addEventListener('resize', measurePresenter, { passive: true });
      if (window.ResizeObserver && refs.presenter) new ResizeObserver(measurePresenter).observe(refs.presenter);

      if (window.Chat) window.Chat.boot();

      if (!window.location.hash) window.location.hash = '#/deck';
      return render(routeFromHash());
    }).catch(fatal);
  }

  return {
    boot: boot, go: go, render: render, sheet: openSheetWith, closeSheet: closeSheet,
    reset: doReset, togglePresenter: togglePresenter, advance: advance,
    refreshCounts: refreshCounts
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { window.App.boot(); });
} else {
  window.App.boot();
}
