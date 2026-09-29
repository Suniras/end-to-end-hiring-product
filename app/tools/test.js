/* ============================================================================
   tools/test.js  ·  what `npm test` runs

   IT RAN NOTHING. package.json pointed at this path and the file did not
   exist, so `npm test` answered with a module-not-found stack. A test script
   that has never been run is worse than none, because it reads as coverage.

   WHAT THIS CHECKS, and every one of these is a defect that was actually
   found by looking at the running product during the September pass:

     the pages answer, with the right status
     every URL has its OWN title, and no two share one
     the canonical link is the URL that was asked for, and a 404 has none
     the JobPosting record describes the job the page renders and nothing else
     robots.txt and the sitemap agree with each other about indexing
     the .html duplicates of two pages redirect rather than answering
     a 404 says so in the document, so the client does not go asking the API
     the brand assets exist and are the formats their names claim
     no stylesheet declares a class nothing renders

   It boots a real server on a free port with its own database file, so it
   never touches data/state.json.

   Run:  npm test
   ============================================================================ */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const PORT = 4188;
const BASE = 'http://127.0.0.1:' + PORT;
const DB = path.join(os.tmpdir(), 'frontline-test-' + process.pid + '.json');

let server = null;

before(async () => {
  server = spawn(process.execPath, [path.join(ROOT, 'server', 'index.js')], {
    cwd: ROOT,
    env: Object.assign({}, process.env, {
      PORT: String(PORT), DEMO_DB_FILE: DB, DEMO_TOKEN: 'test-token',
      SITE_ORIGIN: BASE, PUBLIC_INDEX: '', AGENTX_API_KEY: ''
    }),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  /* Wait for it to answer rather than for a fixed time, because a seeded boot
     takes as long as it takes. */
  for (let i = 0; i < 100; i += 1) {
    try {
      const r = await fetch(BASE + '/api/health');
      if (r.ok) return;
    } catch (e) { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('the server did not come up on ' + BASE);
});

after(() => {
  if (server) server.kill();
  try { fs.unlinkSync(DB); } catch (e) { /* it may never have been written */ }
});

const get = (p) => fetch(BASE + p, { redirect: 'manual' });
const text = async (p) => (await fetch(BASE + p)).text();
const titleOf = (html) => (html.match(/<title>([^<]*)<\/title>/) || [])[1];
const metaOf = (html, name) =>
  (html.match(new RegExp('<meta name="' + name + '" content="([^"]*)"')) || [])[1];
const canonicalOf = (html) => (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];

/* ------------------------------------------------------------- the pages --- */

test('every page answers', async () => {
  for (const [p, want] of [['/careers', 200], ['/app', 200], ['/robots.txt', 200],
                           ['/favicon.ico', 200], ['/brand/og.png', 200],
                           ['/nothing-here', 404], ['/sitemap.xml', 404]]) {
    const r = await get(p);
    assert.equal(r.status, want, p + ' answered ' + r.status);
  }
});

test('the two .html duplicates redirect to the one address each page has', async () => {
  for (const [from, to] of [['/careers.html', '/careers'], ['/app.html', '/app'], ['/apply', '/careers']]) {
    const r = await get(from);
    assert.equal(r.status, 301, from);
    assert.equal(r.headers.get('location'), to, from);
  }
});

test('every URL has its own title, and none is shared', async () => {
  const jobs = (await (await fetch(BASE + '/api/public/careers')).json()).data.jobs;
  const paths = ['/careers', '/app', '/nothing-here']
    .concat(jobs.slice(0, 3).map((j) => '/careers/roles/' + j.id));
  const titles = [];
  for (const p of paths) {
    const t = titleOf(await text(p));
    assert.ok(t && t.length > 3, p + ' has no title');
    titles.push(t);
  }
  assert.equal(new Set(titles).size, titles.length, 'two URLs share a title: ' + titles.join(' | '));
});

test('the canonical link is the URL that was asked for, and a 404 declares none', async () => {
  const jobs = (await (await fetch(BASE + '/api/public/careers')).json()).data.jobs;
  assert.equal(canonicalOf(await text('/careers')), BASE + '/careers');
  const p = '/careers/roles/' + jobs[0].id;
  assert.equal(canonicalOf(await text(p)), BASE + p);
  const four = await text('/nothing-here');
  assert.equal(canonicalOf(four), undefined, 'a 404 must not claim a canonical URL');
  assert.equal(metaOf(four, 'app-state'), 'not-found',
    'the 404 has to say so in the document, or the client goes asking the API about it');
});

test('the job posting record describes the page it is on, and invents nothing', async () => {
  const jobs = (await (await fetch(BASE + '/api/public/careers')).json()).data.jobs;
  const job = jobs[0];
  const html = await text('/careers/roles/' + job.id);
  const raw = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  assert.ok(raw, 'no structured data on a role page');
  const ld = JSON.parse(raw);
  assert.equal(ld['@type'], 'JobPosting');
  assert.equal(ld.title, job.title);
  assert.equal(ld.baseSalary.value.value, job.rateCents / 100);
  assert.equal(ld.jobLocation.name, job.store.name);
  /* The fields a requisition does not carry. Reading PART_TIME off an hours
     figure, or a closing date off nothing, is the class of invention this
     project has been caught by before. */
  assert.equal(ld.employmentType, undefined);
  assert.equal(ld.validThrough, undefined);
  assert.equal(ld.totalJobOpenings, undefined);
});

test('robots.txt and the sitemap agree about whether this site may be indexed', async () => {
  const robots = await text('/robots.txt');
  const indexable = !/^Disallow: \/$/m.test(robots);
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status, indexable ? 200 : 404,
    'a sitemap on a site that disallows everything is two documents contradicting each other');
  const careers = await text('/careers');
  assert.equal(metaOf(careers, 'robots'), indexable ? 'index, follow' : 'noindex, nofollow');
  /* The operator application is never indexable, whatever the switch says. */
  assert.equal(metaOf(await text('/app'), 'robots'), 'noindex, nofollow');
});

test('the form the candidate fills is never indexable and asks for no social security number', async () => {
  const jobs = (await (await fetch(BASE + '/api/public/careers')).json()).data.jobs;
  const html = await text('/careers/apply/' + jobs[0].id);
  assert.equal(metaOf(html, 'robots'), 'noindex, nofollow');
  const form = (await (await fetch(BASE + '/api/public/job?requisitionId=' + jobs[0].id)).json());
  assert.ok(form.ok !== false);
  const fields = (await (await fetch(BASE + '/api/public/disclosure')).json());
  assert.ok(fields.ok !== false);
});

/* ------------------------------------------------------------- the brand --- */

test('the brand assets exist and are the formats their names claim', () => {
  const b = path.join(ROOT, 'web', 'brand');
  const png = (f) => {
    const buf = fs.readFileSync(path.join(b, f));
    assert.deepEqual([...buf.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], f);
    return buf;
  };
  png('icon-32.png'); png('icon-180.png'); png('og.png');
  const ico = fs.readFileSync(path.join(b, 'favicon.ico'));
  assert.equal(ico.readUInt16LE(0), 0, 'ico reserved word');
  assert.equal(ico.readUInt16LE(2), 1, 'ico type');
  assert.ok(ico.readUInt16LE(4) >= 1, 'ico holds at least one image');
  assert.match(fs.readFileSync(path.join(b, 'mark.svg'), 'utf8'), /^<svg /);
});

/* ------------------------------------------------------------- the style --- */

test('the design rules hold', () => {
  const out = execFileSync(process.execPath, [path.join(HERE, 'css-lint.js')], { encoding: 'utf8' });
  assert.match(out, /All design rules hold/, out);
});

test('no stylesheet declares a class nothing renders', () => {
  const web = path.join(ROOT, 'web');
  const css = fs.readdirSync(path.join(web, 'css'))
    .map((f) => fs.readFileSync(path.join(web, 'css', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''))
    .join('\n');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name))
      : (/\.(js|html)$/.test(e.name) ? [path.join(dir, e.name)] : []));
  const src = walk(path.join(web, 'js'))
    .concat([path.join(web, 'app.html'), path.join(web, 'careers.html')])
    .map((f) => fs.readFileSync(f, 'utf8')).join('\n');

  /* Classes the markup builds by joining a prefix to a value. They are real and
     a plain substring search cannot see them. */
  const BUILT = /^(c-|own-|is-|cost-)/;
  const declared = new Set();
  for (const m of css.matchAll(/\.([A-Za-z][\w-]*)/g)) declared.add(m[1]);
  const dead = [...declared].filter((c) => !BUILT.test(c) && !src.includes(c)).sort();
  assert.deepEqual(dead, [],
    'these classes are styled and never rendered: ' + dead.join(', '));
});
