/* ============================================================================
   motion.js  ·  springs, counters and small DOM helpers

   Springs rather than fixed-duration easing, because a spring animates from
   whatever the current on-screen value is and can be retargeted mid-flight
   without a visible jump. Parameterised the way Apple parameterises them:
   damping ratio and response, not mass, stiffness and damping.

     damping 1.0  critically damped, no overshoot. The default for UI.
     damping 0.8  a little overshoot. Only when a gesture carried momentum.
     response     how quickly it reaches the target, in seconds. Not a
                  duration: a spring has no fixed duration.

   Everything here honours prefers-reduced-motion by settling immediately
   rather than by removing the feedback.
   ============================================================================ */

window.M = (function () {
  'use strict';

  var reduce = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  function prefersReduce() { return !!reduce.matches; }

  /* ------------------------------------------------------------- spring --- */

  /**
   * Integrate a damped spring toward a target.
   * Returns a handle with .to(newTarget) so the same spring can be retargeted
   * in flight, carrying its velocity through instead of hard-cutting it.
   */
  function spring(opts) {
    var from = opts.from || 0;
    var target = opts.to;
    var v = opts.velocity || 0;
    var zeta = opts.damping == null ? 1 : opts.damping;
    var response = opts.response == null ? 0.34 : opts.response;
    var onUpdate = opts.onUpdate || function () {};
    var onDone = opts.onDone || function () {};

    var x = from;
    var raf = null;
    var last = null;
    var done = false;

    if (prefersReduce()) {
      onUpdate(target);
      onDone();
      return { to: function (t) { target = t; onUpdate(target); }, stop: function () {}, value: function () { return target; } };
    }

    var omega = (2 * Math.PI) / response;
    var restX = 0.0015;
    var restV = 0.0015;

    function frame(now) {
      if (last == null) last = now;
      // Clamp dt so a backgrounded tab does not launch the value into orbit.
      var dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      // Sub-step for stability at low response values.
      var steps = 4, h = dt / steps;
      for (var i = 0; i < steps; i++) {
        var a = -omega * omega * (x - target) - 2 * zeta * omega * v;
        v += a * h;
        x += v * h;
      }

      var span = Math.max(Math.abs(target), 1);
      if (Math.abs(x - target) / span < restX && Math.abs(v) / span < restV) {
        x = target; v = 0; done = true;
        onUpdate(x);
        onDone();
        return;
      }
      onUpdate(x);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return {
      to: function (t) {
        target = t;
        if (done) { done = false; last = null; raf = requestAnimationFrame(frame); }
      },
      stop: function () { if (raf) cancelAnimationFrame(raf); done = true; },
      value: function () { return x; }
    };
  }

  /* ------------------------------------------------------- number ticker ---
     Counts a number up on first paint. Tabular figures mean the width does
     not jitter while it runs.
  ------------------------------------------------------------------------- */

  function countUp(node, to, opts) {
    opts = opts || {};
    var dp = opts.dp == null ? 0 : opts.dp;
    var from = opts.from == null ? 0 : opts.from;
    var suffix = opts.suffix || '';
    var prefix = opts.prefix || '';
    var group = opts.group !== false;

    function paint(val) {
      var v = dp ? val.toFixed(dp) : String(Math.round(val));
      if (group && !dp) v = Number(v).toLocaleString('en-US');
      if (group && dp) {
        var parts = v.split('.');
        parts[0] = Number(parts[0]).toLocaleString('en-US');
        v = parts.join('.');
      }
      node.textContent = prefix + v + suffix;
    }

    if (prefersReduce()) { paint(to); return; }
    paint(from);
    spring({
      from: from, to: to, damping: 1, response: opts.response == null ? 0.62 : opts.response,
      onUpdate: paint,
      onDone: function () { paint(to); }
    });
  }

  /* ------------------------------------------------------- bar grow-in --- */

  function growBar(node, pct) {
    if (prefersReduce()) { node.style.width = pct + '%'; return; }
    node.style.width = '0%';
    spring({
      from: 0, to: pct, damping: 1, response: 0.5,
      onUpdate: function (v) { node.style.width = Math.max(0, v) + '%'; },
      onDone: function () { node.style.width = pct + '%'; }
    });
  }

  /* ------------------------------------------------------------- sheets ---
     A sheet enters from the right and leaves to the right. Same path both
     ways, so the spatial relationship holds.
  ------------------------------------------------------------------------- */

  function openSheet(sheet, scrim) {
    scrim.hidden = false; sheet.hidden = false;
    // Force a frame so the transition has a start value to animate from.
    void sheet.offsetWidth;
    scrim.classList.add('is-open');
    sheet.classList.add('is-open');
    var focusable = sheet.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus({ preventScroll: true });
  }

  function closeSheet(sheet, scrim) {
    scrim.classList.remove('is-open');
    sheet.classList.remove('is-open');
    var ms = prefersReduce() ? 120 : 440;
    window.setTimeout(function () {
      if (!sheet.classList.contains('is-open')) { sheet.hidden = true; scrim.hidden = true; }
    }, ms);
  }

  /* ------------------------------------------------------------- toasts --- */

  function toast(msg, kind, ms) {
    var host = document.getElementById('toasts');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' is-' + kind : '');
    el.setAttribute('role', 'status');
    var bar = document.createElement('span');
    bar.className = 'bar';
    var txt = document.createElement('span');
    txt.innerHTML = msg;
    el.appendChild(bar); el.appendChild(txt);
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    host.appendChild(el);

    if (prefersReduce()) {
      el.style.opacity = '1'; el.style.transform = 'none';
    } else {
      el.animate(
        [{ opacity: 0, transform: 'translateY(8px) scale(0.98)' }, { opacity: 1, transform: 'none' }],
        { duration: 300, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' }
      );
    }

    window.setTimeout(function () {
      if (prefersReduce()) { el.remove(); return; }
      var a = el.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' }],
        { duration: 240, easing: 'cubic-bezier(0.7,0,0.84,0)', fill: 'forwards' }
      );
      a.onfinish = function () { el.remove(); };
    }, ms || 3600);
  }

  /* -------------------------------------------------------- DOM helpers --- */

  /**
   * el('div.card', {id:'x'}, [child, 'text'])
   *
   * The spec is tolerant on purpose. It accepts a tag with dot classes and a
   * hash id, and it also accepts space-separated extra classes, because
   * callers build specs by concatenating a variant string that may itself hold
   * more than one class. A stricter parser silently produced unstyled divs
   * with no keyboard focus, which is a horrible failure mode: the page looks
   * broken and nothing throws.
   */
  function el(spec, attrs, kids) {
    var tokens = String(spec == null ? '' : spec).trim().split(/\s+/).filter(Boolean);
    var cls = [];
    var idVal = null;
    var tag = null;

    function readSelectors(str) {
      str.replace(/([.#])([\w-]+)/g, function (_, k, v) {
        if (k === '.') cls.push(v); else idVal = v;
        return '';
      });
    }

    tokens.forEach(function (tok, i) {
      var m = /^([a-zA-Z][a-zA-Z0-9-]*)?((?:[.#][\w-]+)*)$/.exec(tok);
      if (m) {
        if (i === 0 && m[1]) tag = m[1];
        else if (m[1]) cls.push(m[1]);   // bare word in a later token is a class
        readSelectors(m[2] || '');
      } else {
        readSelectors(tok);
      }
    });

    var node = document.createElement(tag || 'div');
    if (idVal) node.id = idVal;
    if (cls.length) node.className = cls.join(' ');

    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') { node.className = (node.className ? node.className + ' ' : '') + v; }
        else if (k === 'html') { node.innerHTML = v; }
        else if (k === 'text') { node.textContent = v; }
        else if (k === 'style' && typeof v === 'object') { Object.assign(node.style, v); }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') { node.addEventListener(k.slice(2), v); }
        else if (k === 'data' && typeof v === 'object') { Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; }); }
        else if (v === true) { node.setAttribute(k, ''); }
        else { node.setAttribute(k, v); }
      });
    }

    append(node, kids);
    return node;
  }

  function append(node, kids) {
    if (kids == null || kids === false) return node;
    if (Array.isArray(kids)) { kids.forEach(function (k) { append(node, k); }); return node; }
    if (typeof kids === 'string' || typeof kids === 'number') {
      node.appendChild(document.createTextNode(String(kids)));
      return node;
    }
    if (kids.nodeType) node.appendChild(kids);
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  /** Inline SVG from a 16x16 path set. */
  function icon(paths, size) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', size || 16);
    svg.setAttribute('height', size || 16);
    (Array.isArray(paths) ? paths : [paths]).forEach(function (d) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke', 'currentColor');
      p.setAttribute('stroke-width', '1.5');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(p);
    });
    return svg;
  }

  return {
    spring: spring, countUp: countUp, growBar: growBar,
    openSheet: openSheet, closeSheet: closeSheet, toast: toast,
    el: el, append: append, clear: clear, icon: icon,
    prefersReduce: prefersReduce
  };
})();
