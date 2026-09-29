/* ============================================================================
   glyphs.js  ·  the four actor silhouettes, and why they are shapes

   U-98. Colour plus a distinct glyph for the four actor types, never colour
   alone. This is a correctness fix rather than a preference, and the measured
   reason is worth keeping next to the code.

   Reduced to relative luminance the four owner hues collapse into each other
   THREE TIMES in light theme and THREE TIMES in dark:

     light   --accent vs --system   1.073
             --accent vs --clock    1.086
             --system vs --clock    1.012
     dark    --accent vs --agent    1.025
             --accent vs --system   1.000   exactly identical
             --agent  vs --system   1.025

   The dark --accent against --system pair is a named human against
   deterministic software, which is the one distinction the New York City and
   California automated-employment-decision rules turn on. A viewer with any
   degree of colour vision deficiency, a greyscale screenshot in a deck, or a
   printed page cannot tell those two apart by hue. So the hue is never the
   only carrier.

   WHY THESE FOUR SHAPES. Each has to stay distinguishable at 10px, which rules
   out internal detail: a gear, a clock face or a robot head are all mush at
   that size. What survives is the OUTLINE, so the four differ in silhouette
   rather than in ornament.

     human   a head over a shoulder arc     round and organic
     agent   a diamond                      rotated square, four points
     system  a square                       flat sides, square corners
     clock   an hourglass                   pinched in the middle

   Round, pointed, square, pinched. No two share a silhouette, and none of them
   is an AI sparkle, which P-02 bans outright.

   Every path is stroked with currentColor, so the glyph inherits the owner hue
   from the .own-* class with no extra rule and no per-actor CSS.
   ============================================================================ */

export const ACTORS = {
  human: {
    key: 'human',
    label: 'A person',
    /* Head and shoulders. The only round silhouette in the set.

       Redrawn 8 Sep 2026 after looking at it. The first version had a 2.1
       radius head and a shallow arc, and rendered it measured against the
       other three: the diamond, the square and the hourglass all read cleanly
       at 10px and the person nearly vanished, which is backwards, because a
       named human against deterministic software is the distinction the New
       York City and California rules turn on. The head is now 2.9 and the
       shoulders are a deeper, wider arc that closes into the body, so the
       silhouette survives the size it matters at. */
    paths: [
      'M8 2.9a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8Z',
      'M2.5 14.1v-.7C2.5 11.1 5 9.7 8 9.7s5.5 1.4 5.5 3.7v.7Z'
    ],
    fill: [true, true]
  },
  agent: {
    key: 'agent',
    label: 'An AI model',
    /* A diamond. Four points, no curves, nothing that reads as a spark. */
    paths: ['M8 2.4 13.6 8 8 13.6 2.4 8 8 2.4Z'],
    fill: [false]
  },
  system: {
    key: 'system',
    label: 'Deterministic software',
    /* A square. Flat sides and square corners, the plainest shape available,
       which is the right register for something that exercises no judgement. */
    paths: ['M3.2 3.2h9.6v9.6H3.2V3.2Z'],
    fill: [false]
  },
  clock: {
    key: 'clock',
    label: 'A wait nobody owns',
    /* An hourglass. Pinched in the middle, which no other shape here is, and
       it means elapsed time rather than a device that measures it. */
    paths: ['M4.2 2.6h7.6M4.2 13.4h7.6M4.9 2.6c0 2.7 3.1 4.1 3.1 5.4s-3.1 2.7-3.1 5.4M11.1 2.6c0 2.7-3.1 4.1-3.1 5.4s3.1 2.7 3.1 5.4'],
    fill: [false]
  }
};

/* The workflow uses 'external' for something outside our control that is not a
   clock, such as a vendor or a candidate. It reads as software we do not own,
   so it borrows the system silhouette and is distinguished by hue and label
   rather than by a fifth shape. Adding a fifth silhouette would cost more in
   legibility at 10px than it buys. */
ACTORS.external = {
  key: 'external',
  label: 'An outside system',
  paths: ACTORS.system.paths,
  fill: ACTORS.system.fill
};

const NS = 'http://www.w3.org/2000/svg';

/**
 * One glyph, as an inline SVG. `size` is 16 by default and 10 for the dense
 * case, which is the smallest size U-98 requires to stay legible.
 */
export function glyph(actor, opts) {
  const o = opts || {};
  const spec = ACTORS[actor] || ACTORS.system;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  spec.paths.forEach((d, i) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    if (spec.fill[i]) {
      p.setAttribute('fill', 'currentColor');
    } else {
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', 'currentColor');
      /* 1.5 holds its weight at 16px and does not close up at 10px. */
      p.setAttribute('stroke-width', o.size === 10 ? '1.7' : '1.5');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
    }
    svg.appendChild(p);
  });

  const wrap = document.createElement('span');
  wrap.className = 'glyph' + (o.size === 10 ? ' glyph-sm' : '');
  /* The label is the accessible name. A glyph that only means something to
     somebody who can see it is the failure this whole file exists to avoid. */
  if (o.labelled !== false) {
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', spec.label);
  }
  wrap.appendChild(svg);
  return wrap;
}

/** The word for an actor, for anywhere a glyph will not fit. */
export function actorLabel(actor) {
  return (ACTORS[actor] || ACTORS.system).label;
}

/** The owner class that carries the hue. */
export function ownerClass(actor) {
  return 'own-' + (ACTORS[actor] ? (actor === 'external' ? 'system' : actor) : 'system');
}
