/* ============================================================================
   tools/make-brand.js  ·  the brand assets, drawn rather than downloaded

   WHY THIS EXISTS. The product had no favicon, so every browser asked for
   /favicon.ico on every page load and got a 404 in the console and a blank
   square in the tab. That is one of the cheapest tells that nobody finished a
   website. It also had no social image, so a link to it pasted anywhere
   unfurled as a bare URL.

   WHY IT IS GENERATED RATHER THAN CHECKED IN AS ART. There is no design file
   and no image library on this machine, and inventing an unrelated icon was
   ruled out. The mark this draws is the one already on screen: the letter S in
   a rounded square, which is what the operator rail has rendered since the
   shell was built. So the asset and the interface come from one definition,
   and changing the brand blue in tokens.css and re-running this keeps them
   together.

   THE GEOMETRY IS ONE DEFINITION, USED TWICE. The S is two arcs of 225 degrees
   each, on two circles that touch, so the tangents match at the join and the
   letterform is a real S rather than a font glyph we do not have a licence to
   rasterise. `MARK` below is read by the SVG writer and by the rasteriser, so
   the vector favicon and the PNG cannot drift apart.

   NO DEPENDENCIES. PNG is written with node:zlib and a CRC32 table. ICO is the
   container format, holding a PNG, which every browser since Vista reads.

   Run:  node tools/make-brand.js
   ============================================================================ */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'web', 'brand');

/* --- the one definition ---------------------------------------------------
   A 64 unit box. Two circles of radius R whose centres are 2R apart, so they
   touch at (CX, CY_TOP + R). Each bowl is 225 degrees, which puts the
   terminals at the upper right and the lower left, which is what makes it
   read as an S rather than as a figure eight. */
const MARK = {
  box: 64,
  radius: 14,              /* the rounded square */
  cx: 32,
  cyTop: 24.5,
  cyBot: 41.5,
  r: 8.5,
  stroke: 7,
  /* Angles in degrees, 0 east, 90 south, measured on a y-down canvas. */
  topFrom: 315, topTo: 90,     /* counterclockwise */
  botFrom: 270, botTo: 495     /* clockwise */
};

const BRAND = '#245AE2';       /* --accent in tokens.css */
const ON_BRAND = '#FFFFFF';    /* --on-accent */
const PAPER = '#F4F7FB';       /* --bg */
const INK = '#10182B';         /* --ink */

const rad = (d) => (d * Math.PI) / 180;
const at = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

/* --- the vector form ------------------------------------------------------ */

function markPath() {
  const m = MARK;
  const a = at(m.cx, m.cyTop, m.r, m.topFrom);
  const j = at(m.cx, m.cyTop, m.r, m.topTo);
  const b = at(m.cx, m.cyBot, m.r, m.botTo);
  const n = (x) => Math.round(x * 100) / 100;
  /* large-arc is 1 on both because each bowl is 225 degrees. The sweep flag is
     0 for the counterclockwise bowl and 1 for the clockwise one. */
  return 'M' + n(a[0]) + ' ' + n(a[1]) +
         'A' + m.r + ' ' + m.r + ' 0 1 0 ' + n(j[0]) + ' ' + n(j[1]) +
         'A' + m.r + ' ' + m.r + ' 0 1 1 ' + n(b[0]) + ' ' + n(b[1]);
}

function markSVG(size, opts) {
  const o = opts || {};
  const m = MARK;
  const bg = o.ground === false ? '' :
    '<rect width="' + m.box + '" height="' + m.box + '" rx="' + m.radius + '" fill="' + (o.bg || BRAND) + '"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + m.box + ' ' + m.box + '"' +
         (size ? ' width="' + size + '" height="' + size + '"' : '') +
         ' role="img" aria-label="Sunfield Markets">' + bg +
         '<path d="' + markPath() + '" fill="none" stroke="' + (o.fg || ON_BRAND) +
         '" stroke-width="' + m.stroke + '" stroke-linecap="round"/></svg>';
}

/* --- the raster form ------------------------------------------------------
   Signed distance, supersampled. Coverage rather than a hard test, so the
   curve has real antialiasing at 16px where a favicon lives or dies. */

function sdRoundRect(px, py, w, h, r) {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - r;
}

/** Distance from a point to an arc of a circle, clamped to its endpoints. */
function sdArc(px, py, cx, cy, r, from, to) {
  const dx = px - cx, dy = py - cy;
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const lo = Math.min(from, to), hi = Math.max(from, to);
  /* Bring the angle into the window the arc actually occupies, which may run
     past 360, then decide whether the point is beside the arc or past an end. */
  while (ang < lo) ang += 360;
  if (ang <= hi) return Math.abs(Math.sqrt(dx * dx + dy * dy) - r);
  const e1 = at(cx, cy, r, from), e2 = at(cx, cy, r, to);
  const d1 = Math.hypot(px - e1[0], py - e1[1]);
  const d2 = Math.hypot(px - e2[0], py - e2[1]);
  return Math.min(d1, d2);
}

function sdMark(px, py) {
  const m = MARK;
  return Math.min(
    sdArc(px, py, m.cx, m.cyTop, m.r, m.topTo, m.topFrom),
    sdArc(px, py, m.cx, m.cyBot, m.r, m.botFrom, m.botTo)
  ) - m.stroke / 2;
}

function hex(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/**
 * The icon, at any size. Returns raw RGBA.
 *
 * `inset` is how much of the canvas the rounded square leaves as margin, in
 * canvas units, which is what lets the same routine draw a tight favicon and a
 * social card with the mark floating in the middle of it.
 */
function drawIcon(size, opts) {
  const o = opts || {};
  const S = 4;                                  /* 4 by 4 supersample */
  const scale = MARK.box / size;
  const ground = o.ground ? hex(o.ground) : null;
  const tile = hex(o.tile || BRAND);
  const fg = hex(o.fg || ON_BRAND);
  const buf = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let cTile = 0, cMark = 0;
      for (let sy = 0; sy < S; sy += 1) {
        for (let sx = 0; sx < S; sx += 1) {
          const px = (x + (sx + 0.5) / S) * scale;
          const py = (y + (sy + 0.5) / S) * scale;
          if (sdRoundRect(px, py, MARK.box, MARK.box, MARK.radius) <= 0) cTile += 1;
          if (sdMark(px, py) <= 0) cMark += 1;
        }
      }
      const n = S * S;
      const tileA = cTile / n, markA = cMark / n;
      let rgb = ground || [0, 0, 0];
      let alpha = ground ? 1 : tileA;
      if (ground) rgb = mix(ground, tile, tileA);
      else rgb = tile.slice();
      rgb = mix(rgb, fg, markA);
      const i = (y * size + x) * 4;
      buf[i] = Math.round(rgb[0]); buf[i + 1] = Math.round(rgb[1]);
      buf[i + 2] = Math.round(rgb[2]); buf[i + 3] = Math.round(alpha * 255);
    }
  }
  return buf;
}

/* --- PNG ------------------------------------------------------------------ */

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(rgba, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y += 1) {
    raw[y * (w * 4 + 1)] = 0;                    /* filter: none */
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/** An ICO holding PNGs. One directory entry per size. */
function ico(entries) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach((e, i) => {
    const o = i * 16;
    dir[o] = e.size >= 256 ? 0 : e.size;
    dir[o + 1] = e.size >= 256 ? 0 : e.size;
    dir[o + 2] = 0; dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(e.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.data.length;
  });
  return Buffer.concat([head, dir].concat(entries.map((e) => e.data)));
}

/* --- the social card ------------------------------------------------------
   1200 by 630, the size every unfurler crops to. Graphic only: there is no
   font on this machine we can rasterise, and blocky hand-drawn type would look
   worse than no type. A brand ground, the mark, and a rule. */

function ogCard(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  const brand = hex(BRAND), on = hex(ON_BRAND);
  /* Full bleed brand, one large knockout mark. No text: there is no font on
     this machine to rasterise and hand-drawn blocky type would read as worse
     than none. The words are carried by og:title and og:description, which is
     what every unfurler renders beside the image anyway. */
  const markSize = 300;
  const mx = Math.round((w - markSize) / 2);
  const my = Math.round((h - markSize) / 2);
  const glyph = drawIcon(markSize, { tile: BRAND, fg: ON_BRAND });

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      buf[i] = brand[0]; buf[i + 1] = brand[1]; buf[i + 2] = brand[2]; buf[i + 3] = 255;
    }
  }
  /* The mark is drawn without its tile, so the letter itself is the knockout
     and the brand ground shows through the counters. */
  for (let y = 0; y < markSize; y += 1) {
    for (let x = 0; x < markSize; x += 1) {
      const s = (y * markSize + x) * 4;
      /* The tile is the same colour as the ground here, so only the letter
         differs from it. Coverage is how far the pixel is from the ground. */
      const d = ((my + y) * w + (mx + x)) * 4;
      const a = Math.max(0, Math.min(1,
        (Math.abs(glyph[s] - brand[0]) + Math.abs(glyph[s + 1] - brand[1]) +
         Math.abs(glyph[s + 2] - brand[2])) /
        (Math.abs(on[0] - brand[0]) + Math.abs(on[1] - brand[1]) + Math.abs(on[2] - brand[2]))));
      if (!a) continue;
      buf[d] = Math.round(brand[0] * (1 - a) + on[0] * a);
      buf[d + 1] = Math.round(brand[1] * (1 - a) + on[1] * a);
      buf[d + 2] = Math.round(brand[2] * (1 - a) + on[2] * a);
    }
  }
  return buf;
}

/* --- write ---------------------------------------------------------------- */

fs.mkdirSync(OUT, { recursive: true });

fs.writeFileSync(path.join(OUT, 'mark.svg'), markSVG(null));
fs.writeFileSync(path.join(OUT, 'mark-plain.svg'), markSVG(null, { ground: false, fg: INK }));

const p32 = png(drawIcon(32), 32, 32);
const p16 = png(drawIcon(16), 16, 16);
fs.writeFileSync(path.join(OUT, 'icon-32.png'), p32);
fs.writeFileSync(path.join(OUT, 'icon-180.png'), png(drawIcon(180), 180, 180));
fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico([{ size: 16, data: p16 }, { size: 32, data: p32 }]));
fs.writeFileSync(path.join(OUT, 'og.png'), png(ogCard(1200, 630), 1200, 630));

console.log('brand assets written to web/brand:');
fs.readdirSync(OUT).sort().forEach((f) => {
  console.log('  ' + f.padEnd(16) + fs.statSync(path.join(OUT, f)).size + ' bytes');
});
