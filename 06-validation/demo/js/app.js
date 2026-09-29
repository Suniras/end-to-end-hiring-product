/* ============================================================================
   app.js  ·  shell, router, presenter mode
   Classic script. No modules, so this runs from file:// by double-click.
   ============================================================================ */

window.App = (function () {
  'use strict';

  var el = M.el, D = window.DEMO;

  var NAV = [
    { label: 'Work queue', items: ['deck', 'decide', 'screening'] },
    { label: 'Pipeline', items: ['pipeline', 'candidate', 'funnel'] },
    { label: 'Checks and compliance', items: ['flag', 'compliance', 'checks'] },
    { label: 'Views', items: ['store'] }
  ];

  var ORDER = ['deck', 'decide', 'screening', 'pipeline', 'candidate', 'funnel', 'flag', 'compliance', 'checks', 'store'];

  var refs = {};

  /* ---------------------------------------------------------------- theme --- */

  function themeMode() {
    return document.documentElement.getAttribute('data-theme') || 'system';
  }

  function setTheme(mode) {
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    try { window.localStorage.setItem('demo-theme', mode); } catch (e) { /* file:// can refuse */ }
    paintThemeBtn();
  }

  function cycleTheme() {
    var order = ['system', 'light', 'dark'];
    var i = order.indexOf(themeMode());
    setTheme(order[(i + 1) % order.length]);
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
    if (window.location.hash !== '#/' + route) {
      window.location.hash = '#/' + route;
    } else {
      render(route);
    }
  }

  function render(route) {
    var v = VIEWS[route];
    if (!v) return;
    E.state().route = route;

    // Topbar
    M.clear(refs.title);
    refs.title.appendChild(el('div.h3', null, v.title));
    refs.title.appendChild(el('div.small.faint', null, v.sub));

    // Body
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
      // Surface it rather than swallowing it.
      if (window.console) window.console.error('View render failed:', route, err);
    }
    node.classList.add('rise');
    refs.view.appendChild(node);

    paintNav();
    paintPresenter();
    refs.scroller.scrollTop = 0;
    document.title = v.title + ' · Sunfield Markets hiring';
    if (refs.sidebar) refs.sidebar.classList.remove('is-open');
  }

  /* ------------------------------------------------------------------ nav --- */

  function navCount(route) {
    if (route === 'decide') return { n: E.decisionsOpen().length, alert: false };
    if (route === 'screening') return { n: E.reviewOpen().length, alert: false };
    if (route === 'flag') return { n: E.state().flagOutcome ? 0 : 1, alert: !E.state().flagOutcome };
    if (route === 'compliance') return { n: E.adverseBar().attempts.length, alert: true };
    if (route === 'deck') return { n: E.queueOpen().length, alert: false };
    return null;
  }

  function paintNav() {
    if (!refs.nav) return;
    M.clear(refs.nav);
    NAV.forEach(function (g) {
      var group = el('div.nav-group', null, [el('div.nav-label', null, g.label)]);
      g.items.forEach(function (route) {
        var v = VIEWS[route];
        var c = navCount(route);
        var isCur = E.state().route === route;
        group.appendChild(el('button.nav-item', {
          type: 'button',
          'aria-current': isCur ? 'page' : null,
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
    var s = E.state().scene;
    return D.scenes[Math.max(0, Math.min(D.scenes.length - 1, s - 1))];
  }

  function gotoScene(n) {
    var total = D.scenes.length;
    var next = Math.max(1, Math.min(total, n));
    E.state().scene = next;
    var sc = D.scenes[next - 1];
    if (sc.route === 'store') E.state().role = 'marcus';
    else if (E.state().role === 'marcus' && sc.route !== 'store') E.state().role = 'dana';
    paintRole();
    go(sc.route);
  }

  function togglePresenter() {
    var on = !E.state().presenter;
    E.state().presenter = on;
    refs.presenter.hidden = !on;
    measurePresenter();
    if (refs.presBtn) refs.presBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) { gotoScene(E.state().scene); }
    paintPresenter();
    M.toast(on ? 'Presenter notes on. <b>←</b> and <b>→</b> move between scenes.' : 'Presenter notes off.', 'agent', 2400);
  }

  /**
   * Publish the presenter bar's real height as a custom property, so the
   * assistant button can sit clear of it. A fixed offset does not work: the bar
   * grows and shrinks with the length of the narration for each scene.
   */
  function measurePresenter() {
    var h = (!refs.presenter || refs.presenter.hidden)
      ? 0
      : Math.ceil(refs.presenter.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--presenter-h', h + 'px');
  }

  function paintPresenter() {
    if (!refs.presenter || refs.presenter.hidden) { measurePresenter(); return; }
    var sc = scene();
    M.clear(refs.pInner);
    refs.pInner.appendChild(el('div.p-scene', null, [
      el('div.n', null, String(sc.id)),
      el('div.of', null, 'of ' + D.scenes.length)
    ]));
    refs.pInner.appendChild(el('div.p-say', null, [
      el('div.k', null, [sc.t, ' · say this · land ', el('span', { style: { color: 'var(--accent)' } }, sc.land)]),
      el('div.v', null, sc.say),
      el('div.k', { style: { marginTop: '4px' } }, ['do: ', el('span', { style: { textTransform: 'none', letterSpacing: 0, color: 'var(--muted)', fontWeight: 400 } }, sc.act)])
    ]));
    refs.pInner.appendChild(el('div.p-nav', null, [
      UI.btn('', { cls: 'is-ghost', icon: 'chev', aria: 'Previous scene', onClick: function () { gotoScene(sc.id - 1); } }),
      el('span.small.mono.faint', null, sc.secs + 's'),
      UI.btn('Next', { cls: 'is-primary', iconAfter: 'arrow', onClick: function () { gotoScene(sc.id + 1); } })
    ]));
    // The back chevron should point back.
    var first = refs.pInner.querySelector('.p-nav .btn svg');
    if (first) first.style.transform = 'scaleX(-1)';

    // Narration length changes the bar height, so remeasure after paint.
    requestAnimationFrame(measurePresenter);
  }

  /* ----------------------------------------------------------------- role --- */

  function paintRole() {
    if (!refs.roleSeg) return;
    var cur = E.state().role;
    Array.prototype.forEach.call(refs.roleSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.dataset.role === cur ? 'true' : 'false');
    });
    if (refs.who) {
      var p = E.person();
      M.clear(refs.who);
      refs.who.appendChild(el('div.brand-name', { style: { fontSize: '0.8125rem' } }, p.name));
      refs.who.appendChild(el('div.brand-sub', null, p.role + ' · ' + p.scope));
    }
  }

  function setRole(role) {
    E.state().role = role;
    paintRole();
    if (role === 'marcus') go('store');
    else if (E.state().route === 'store') go('deck');
    else render(E.state().route);
  }

  /* ---------------------------------------------------------------- sheet --- */

  function openSheetWith(o) {
    M.clear(refs.sheetHd);
    refs.sheetHd.appendChild(el('div.col.tight', { style: { flex: '1 1 auto', minWidth: 0 } }, [
      o.eyebrow ? UI.eyebrow(o.eyebrow, o.eyebrowKind) : null,
      el('div.h2', null, o.title),
      o.chipNode || null
    ]));
    refs.sheetHd.appendChild(UI.btn('', {
      cls: 'is-ghost', icon: 'close', aria: 'Close', onClick: closeSheet
    }));
    M.clear(refs.sheetBd);
    M.append(refs.sheetBd, o.body);
    M.openSheet(refs.sheet, refs.scrim);
  }

  function closeSheet() { M.closeSheet(refs.sheet, refs.scrim); }

  /* ------------------------------------------------------------- keyboard --- */

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'Escape') {
      if (!refs.sheet.hidden) { closeSheet(); e.preventDefault(); }
      else if (refs.sidebar.classList.contains('is-open')) { refs.sidebar.classList.remove('is-open'); }
      return;
    }
    if (e.key === 'ArrowRight' && E.state().presenter) { gotoScene(E.state().scene + 1); e.preventDefault(); return; }
    if (e.key === 'ArrowLeft' && E.state().presenter) { gotoScene(E.state().scene - 1); e.preventDefault(); return; }

    var k = e.key.toLowerCase();
    if (k === 'c') { return; }   // handled by chat.js
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
    openSheetWith({
      eyebrow: 'Keyboard', title: 'Driving the demo without the mouse',
      body: [
        UI.card({
          flush: true,
          body: el('div.tw', null, el('table.t', null, [
            el('thead', null, el('tr', null, [el('th', null, 'Key'), el('th', null, 'Does')])),
            el('tbody', null, [
              ['P', 'Presenter notes on or off'],
              ['← →', 'Previous or next scene, when presenter notes are on'],
              ['1 to 0', 'Jump straight to a screen, in sidebar order'],
              ['T', 'Cycle theme: auto, light, dark'],
              ['R', 'Reset the demo to its opening state'],
              ['Esc', 'Close a panel'],
              ['?', 'This list']
            ].map(function (r) {
              return el('tr', null, [el('td.mono', null, r[0]), el('td', null, r[1])]);
            }))
          ]))
        }),
        UI.card({
          eyebrow: 'Before you present', title: 'Three things worth doing',
          body: el('div.col.tight', null, [
            el('div.small', null, '1. Press R to reset. A half-run demo is the one thing that looks broken.'),
            el('div.small', null, '2. Window at 1440 by 900, nothing else on screen, notifications off.'),
            el('div.small', null, '3. Turn presenter notes off before you share your screen, unless you want them seen.')
          ])
        })
      ]
    });
  }

  function doReset() {
    E.reset();
    E.state().presenter = refs.presenter.hidden ? false : true;
    go('deck');
    M.toast('Demo reset to its opening state.', 'good', 2000);
  }

  /* ----------------------------------------------------------------- boot --- */

  function build() {
    var app = document.getElementById('app');
    M.clear(app);

    /* sidebar */
    refs.nav = el('div.col', { style: { gap: 'var(--s5)' } });
    refs.who = el('div.col', { style: { gap: 0 } });

    refs.sidebar = el('aside.sidebar', { id: 'sidebar' }, [
      el('a.brand', { href: 'index.html', title: 'Back to the overview' }, [
        el('span.brand-mark', null, M.icon(['M8 2.6l5.4 5.4L8 13.4 2.6 8z'])),
        el('div.col', { style: { gap: 0 } }, [
          el('div.brand-name', null, 'Frontline'),
          el('div.brand-sub', null, D.org.name)
        ])
      ]),
      refs.nav,
      el('div.sidebar-foot', null, [
        el('div.col.tight', null, [UI.eyebrow('Signed in as'), refs.who]),
        UI.simBanner('Every external system: payroll, scheduling, identity, the screening agency, E-Verify and training.'),
        el('div.row', { style: { gap: '6px' } }, [
          UI.btn('Reset', { cls: 'is-ghost is-sm', icon: 'reset', onClick: doReset, title: 'Reset the demo (R)' }),
          UI.btn('Keys', { cls: 'is-ghost is-sm', onClick: showHelp, title: 'Keyboard shortcuts (?)' })
        ])
      ])
    ]);

    /* topbar */
    refs.title = el('div.topbar-title');
    refs.themeBtn = el('button.btn.is-ghost.is-sm', { type: 'button', onclick: cycleTheme });

    refs.roleSeg = el('div.seg', { role: 'group', 'aria-label': 'Whose screen' }, [
      el('button', { type: 'button', 'data-role': 'dana', 'aria-pressed': 'true', onclick: function () { setRole('dana'); } }, 'Field HR'),
      el('button', { type: 'button', 'data-role': 'marcus', 'aria-pressed': 'false', onclick: function () { setRole('marcus'); } }, 'Store')
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

    /* main */
    refs.view = el('div.content', { id: 'view' });
    refs.pInner = el('div.p-inner');
    refs.presenter = el('div.presenter', { id: 'presenter', hidden: true }, refs.pInner);

    // The panel floats in a tinted deck. Separation is the two surface colours,
    // so there is no border and no shadow anywhere on it.
    refs.scroller = el('div.panel-scroll', null, [
      topbar,
      el('div.scroll-edge', { 'aria-hidden': 'true' }),
      refs.view
    ]);
    refs.panel = el('div.panel', null, [refs.scroller, refs.presenter]);
    refs.deck = el('div.main', null, refs.panel);

    /* sheet */
    refs.sheetHd = el('div.sheet-hd');
    refs.sheetBd = el('div.sheet-bd');
    refs.sheet = el('aside.sheet', { id: 'sheet', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Detail' }, [refs.sheetHd, refs.sheetBd]);
    refs.scrim = el('div.scrim', { id: 'scrim', hidden: true, onclick: closeSheet });

    app.appendChild(el('div.shell', null, [refs.sidebar, refs.deck]));
    app.appendChild(refs.scrim);
    app.appendChild(refs.sheet);
    app.appendChild(el('div.toasts', { id: 'toasts', 'aria-live': 'polite' }));
  }

  function boot() {
    try {
      var saved = window.localStorage.getItem('demo-theme');
      if (saved && saved !== 'system') document.documentElement.setAttribute('data-theme', saved);
    } catch (e) { /* ignore */ }

    build();
    paintThemeBtn();
    paintRole();

    // Re-render on state change so counts and queues stay honest.
    E.sub(function () { render(E.state().route); });

    window.addEventListener('hashchange', function () { render(routeFromHash()); });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', measurePresenter, { passive: true });
    if (window.ResizeObserver && refs.presenter) {
      new ResizeObserver(measurePresenter).observe(refs.presenter);
    }

    if (window.Chat) window.Chat.boot();

    render(routeFromHash());
    if (!window.location.hash) window.location.hash = '#/deck';
  }

  return { boot: boot, go: go, sheet: openSheetWith, closeSheet: closeSheet, reset: doReset, togglePresenter: togglePresenter };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { window.App.boot(); });
} else {
  window.App.boot();
}
