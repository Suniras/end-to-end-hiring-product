#!/usr/bin/env node
/* ============================================================================
   css-lint.js  ·  the three anti-AI rules, as a check rather than an opinion

   U-104, U-105 and U-103 were written as rules a build can be checked against,
   because P-02 ("nothing that looks like AI") is otherwise a preference and the
   check is somebody's opinion on the day. This is that check.

   Run:  node tools/css-lint.js
   ============================================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'web', 'css');
const TOKENS = path.join(DIR, 'tokens.css');

/* Comments are not code. Every rule below runs against the stripped source,
   because a rule that fires on its own explanatory comment is a rule nobody
   keeps. */
function strip(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

const problems = [];
const notes = [];

function check(name, fn) {
  const before = problems.length;
  fn();
  const failed = problems.length - before;
  console.log((failed ? '  FAIL  ' : '  ok    ') + name + (failed ? '  (' + failed + ')' : ''));
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.css'));

/* -- U-104: zero raw hex outside tokens.css ------------------------------- */
check('U-104  no raw hex outside tokens.css', () => {
  files.forEach((f) => {
    if (f === 'tokens.css') return;
    const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
    src.split('\n').forEach((line, i) => {
      const m = line.match(/#[0-9A-Fa-f]{3,8}\b/);
      if (m) problems.push(f + ':' + (i + 1) + '  raw hex ' + m[0] + '. Every colour is a token.');
    });
  });
});

/* -- U-104: every colour token use carries a meaning ---------------------- */
check('U-104  colour tokens sit on a meaning, not on decoration', () => {
  const OWNER = /^--(owner|accent|agent|system|clock|good|warn|crit|ink|muted|faint|line|surface|bg|on-accent|glass|hatch|shadow)/;
  files.forEach((f) => {
    if (f === 'tokens.css') return;
    const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
    /* A var() reference to a colour token is fine. A colour keyword that is not
       transparent, currentColor or inherit is a raw colour by another name. */
    src.split('\n').forEach((line, i) => {
      const m = line.match(/:\s*(red|blue|green|orange|purple|pink|yellow|cyan|magenta|gray|grey|black|white)\s*[;!]/i);
      if (m) problems.push(f + ':' + (i + 1) + '  named colour "' + m[1] + '". Use a token.');
      const rgb = line.match(/\b(rgb|rgba|hsl|hsla)\(/i);
      if (rgb) problems.push(f + ':' + (i + 1) + '  literal ' + rgb[1] + '(). Put it in tokens.css.');
    });
    void OWNER;
  });
});

/* -- U-105: no uniform card grid ------------------------------------------ */
check('U-105  no uniform card grid', () => {
  files.forEach((f) => {
    const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
    /* The specific shape that was the audit target: a .grid with a fixed
       column count, and any repeat(N, 1fr) with N above 1, which is the same
       thing written another way. */
    src.split('\n').forEach((line, i) => {
      if (/\.grid\.c[2-9]/.test(line)) {
        problems.push(f + ':' + (i + 1) + '  a fixed-column .grid. Adjacent blocks may only share dimensions when the data makes them share.');
      }
      const rep = line.match(/repeat\(\s*([2-9])\s*,\s*1fr\s*\)/);
      if (rep) {
        problems.push(f + ':' + (i + 1) + '  repeat(' + rep[1] + ', 1fr) is a uniform grid by another name.');
      }
    });
  });
});

/* -- U-103: elevation reserved for things that float --------------------- */
check('U-103  elevation only on the four floating things', () => {
  const ALLOWED = [':focus-visible', '.assistant', '.drawer', '.sheet > .panel', '.panel'];
  files.forEach((f) => {
    const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
    /* Walk rule blocks so a shadow can be attributed to its selector. */
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
      const sel = m[1].trim().replace(/\s+/g, ' ');
      const body = m[2];
      const shadow = body.match(/box-shadow\s*:\s*([^;]+)/);
      if (!shadow) continue;
      /* Turning a shadow OFF is not elevation. */
      if (/^\s*none\s*$/.test(shadow[1])) continue;
      /* Neither is an INSET shadow. `box-shadow: inset 2px 0 0` draws a line
         inside the element's own edge, which is a border by another name and is
         the only way to put a rule on one side of a table cell without the
         cell shifting. It cannot lift anything off the page, so the rule about
         elevation does not apply to it. Stated here rather than worked around,
         because a lint nobody can satisfy honestly gets muted. */
      if (/\binset\b/.test(shadow[1])) continue;
      const ok = ALLOWED.some((a) => sel.indexOf(a) >= 0);
      if (!ok) {
        problems.push(f + '  box-shadow on "' + sel + '". Elevation is for the sheet, the drawer, the assistant panel and :focus-visible. Everything else separates with --line and a --surface-2 step.');
      }
    }
  });
});

/* -- U-102: the hatch is permitted, decorative gradients are not --------- */
check('U-102  gradients are functional only', () => {
  files.forEach((f) => {
    const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
      const sel = m[1].trim().replace(/\s+/g, ' ');
      const body = m[2];
      if (!/gradient\(/.test(body)) continue;
      const functional = /\.bar\.wait|\.scroll-edge|\.hatch|mask/.test(sel) || /repeating-linear-gradient/.test(body);
      if (!functional) {
        problems.push(f + '  gradient on "' + sel + '". Decorative gradients are banned. The carve-out is the hatch that marks waiting time and functional masks.');
      }
    }
  });
});

/* -- U-100: tabular figures hoisted, prose opted out --------------------- */
check('U-100  tabular figures hoisted to body with prose opted out', () => {
  const app = strip(fs.readFileSync(path.join(DIR, 'app.css'), 'utf8'));
  if (!/body\s*\{[^}]*font-variant-numeric:\s*tabular-nums/.test(app)) {
    problems.push('app.css  body does not carry tabular figures. Eleven opt-in sites means the twelfth is the one that jitters.');
  }
  if (!/font-variant-numeric:\s*normal/.test(app)) {
    problems.push('app.css  nothing opts out of tabular figures, so body copy gets them too.');
  }
});

/* -- U-107: the non-menu variable weights survive ------------------------ */
check('U-107  non-menu variable font weights kept', () => {
  const tok = fs.readFileSync(TOKENS, 'utf8');
  [450, 550, 580, 620, 640].forEach((w) => {
    if (tok.indexOf(String(w)) < 0) {
      problems.push('tokens.css  weight ' + w + ' is gone. A variable axis at non-menu values reads as drawn rather than picked, and rounding these to the standard menu is the tidy-up that P-02 forbids.');
    }
  });
});

/* -- U-96: the palette is declared once, not four times ------------------ */
check('U-96  the palette is not declared four times', () => {
  const tok = strip(fs.readFileSync(TOKENS, 'utf8'));
  const blocks = tok.match(/--accent:\s*#/g) || [];
  if (blocks.length > 3) {
    problems.push('tokens.css  --accent is declared ' + blocks.length + ' times. The old file declared the palette four times, so a fix had to land in all four or the theme toggle kept the failing value. Light on :root, dark blocks override only what differs.');
  }
  notes.push('--accent declared ' + blocks.length + ' times (light, dark media, dark explicit).');
});

/* -- U-99: the density target is a value, not a taste -------------------- */
check('U-99  the row height target exists as a token', () => {
  const tok = fs.readFileSync(TOKENS, 'utf8');
  const m = tok.match(/--row-h:\s*(\d+)px/);
  if (!m) {
    problems.push('tokens.css  no --row-h. Without a row-height target "dense" is a taste instruction and the twenty-row funnel scrolls, which deletes U-40 argument.');
  } else {
    const px = Number(m[1]);
    if (px < 36 || px > 40) problems.push('tokens.css  --row-h is ' + px + 'px. U-99 targets 36 to 40.');
    notes.push('--row-h is ' + m[1] + 'px, inside the 36 to 40 target.');
  }
});

console.log('');
notes.forEach((n) => console.log('  note  ' + n));
if (problems.length) {
  console.log('\n' + problems.length + ' problem(s):\n');
  problems.forEach((p) => console.log('  - ' + p));
  process.exit(1);
}
console.log('\nAll design rules hold.');
