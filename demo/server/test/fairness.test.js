/* What the screening bank is not allowed to score.

   This file exists because the same defect was introduced three times. Family
   status was in a concern list on 7 September. Two hours after it was removed
   from the source it was still live in thirty-four stored screening records.
   And on 8 September the physical question was found still scoring the
   accommodation disclosure that its own rephrasing had invited.

   Every test here asserts a property of the data rather than a line of code, so
   a future change to how the bank is built cannot pass by moving the problem.
   None of them read a hardcoded expected count. */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { fresh } = require('./helper');
const SEED = require('../lib/seed');

/* Words that describe a person rather than the hours they can offer or the
   duties they can perform. None may appear in any scored phrase bank.

   These are regular expressions rather than substrings on purpose. A plain
   substring check for "age" matches inside "find a manager", which is a
   legitimate customer-service phrase, and a test that cries wolf gets muted. */
const PROTECTED = [
  /childcare/, /child care/, /\bkids?\b/, /\bchildren\b/, /\bfamily\b/, /pregnan/,
  /maternity/, /\bmy back\b/, /disab/, /i would struggle/, /medication/, /therapy/,
  /\bdoctor\b/, /\bchurch\b/, /\bmosque\b/, /\bsabbath\b/, /\bpraying\b/,
  /\bvisa\b/, /\baccent\b/, /green card/, /\bmarried\b/, /single (mother|mom|parent)/,
  /\bmy age\b/, /\btoo (young|old)\b/, /\bwheelchair\b/, /\banxiety\b/, /\bdepress/
];

function banks(store, tenantId) {
  const out = [];
  store.all('requisitions', tenantId).forEach((r) => {
    (r.screeningQuestions || []).forEach((q) => out.push({ where: 'requisition ' + r.key, req: r, q }));
  });
  store.all('screenings', tenantId).forEach((s) => {
    (s.questions || []).forEach((q) => out.push({ where: 'screening ' + s.id, req: null, q }));
  });
  return out;
}

test('no scored phrase anywhere describes a protected characteristic', async () => {
  const env = await fresh();
  const found = [];
  banks(env.store, env.TENANT).forEach((b) => {
    [].concat(b.q.positivePhrases || [], b.q.concernPhrases || []).forEach((p) => {
      PROTECTED.forEach((bad) => {
        if (bad.test(String(p).toLowerCase())) found.push(b.where + ': "' + p + '" matches ' + bad);
      });
    });
  });
  assert.deepEqual(found, [], 'protected characteristics in a scored phrase bank:\n' + found.join('\n'));
});

test('a screening record never carries a stale copy of its requisition question', async () => {
  const env = await fresh();
  const drift = [];
  env.store.all('screenings', env.TENANT).forEach((s) => {
    const app = env.store.byId('applications', env.TENANT, s.applicationId);
    if (!app) return;
    const req = env.store.byId('requisitions', env.TENANT, app.requisitionId);
    if (!req) return;
    (s.questions || []).forEach((q) => {
      const live = (req.screeningQuestions || []).find((x) => x.key === q.key);
      if (!live) return;
      if (live.text !== q.text) drift.push(s.id + ' ' + q.key + ': text differs from ' + req.key);
      if ((live.concernPhrases || []).join('|') !== (q.concernPhrases || []).join('|')) {
        drift.push(s.id + ' ' + q.key + ': concern phrases differ from ' + req.key);
      }
    });
  });
  assert.deepEqual(drift, [], 'stored screenings snapshot a bank their requisition no longer has:\n' + drift.join('\n'));
});

test('availability is only scored against hours the requisition actually needs', async () => {
  const env = await fresh();
  const WEEKEND = ['sat', 'sun'];
  const bad = [];
  env.store.all('requisitions', env.TENANT).forEach((r) => {
    const q = (r.screeningQuestions || []).find((x) => x.key === 'availability');
    if (!q) return;
    const days = (r.requiredSlots || []).map((s) => s.split('_')[0]);
    const parts = (r.requiredSlots || []).map((s) => s.split('_')[1]);
    const needsWeekend = WEEKEND.some((d) => days.indexOf(d) >= 0);
    // A phrase about a part of the week the role does not want cannot score it.
    (q.positivePhrases || []).forEach((p) => {
      if (!needsWeekend && p.indexOf('weekend') >= 0) bad.push(r.key + ': positive "' + p + '" but no weekend slot');
      if (parts.indexOf('evening') < 0 && p.indexOf('evening') >= 0) bad.push(r.key + ': positive "' + p + '" but no evening slot');
      if (parts.indexOf('night') < 0 && p.indexOf('overnight') >= 0) bad.push(r.key + ': positive "' + p + '" but no overnight slot');
    });
    (q.concernPhrases || []).forEach((p) => {
      if (!needsWeekend && p.indexOf('cannot do weekends') >= 0) bad.push(r.key + ': concern "' + p + '" but no weekend slot');
      if (parts.indexOf('evening') < 0 && p.indexOf('evenings') >= 0) bad.push(r.key + ': concern "' + p + '" but no evening slot');
    });
  });
  assert.deepEqual(bad, [], 'availability scored against hours the role does not need:\n' + bad.join('\n'));
});

test('the physical question asks about the essential duty and scores only the answer to it', async () => {
  const env = await fresh();
  env.store.all('requisitions', env.TENANT).forEach((r) => {
    const q = (r.screeningQuestions || []).find((x) => x.key === 'physical');
    if (!q) return;
    // The accommodation clause is what makes this an essential-function
    // question rather than a health question.
    assert.ok(/with or without reasonable accommodation/i.test(q.text),
      r.key + ': the physical question has lost its accommodation clause');
    // A concern may only be a statement of not performing the duty.
    (q.concernPhrases || []).forEach((p) => {
      assert.ok(/^i cannot/i.test(p),
        r.key + ': physical concern "' + p + '" is not a statement of inability to perform the duty');
    });
  });
});

test('no positive phrase is a substring of a concern phrase, because the rubric matches by substring', async () => {
  const env = await fresh();
  const collide = [];
  banks(env.store, env.TENANT).forEach((b) => {
    (b.q.positivePhrases || []).forEach((p) => {
      (b.q.concernPhrases || []).forEach((n) => {
        if (String(n).toLowerCase().indexOf(String(p).toLowerCase()) >= 0) {
          collide.push(b.where + ' ' + b.q.key + ': positive "' + p + '" inside concern "' + n + '"');
        }
      });
    });
  });
  assert.deepEqual(collide, [], 'a refusal would score as an affirmation:\n' + collide.join('\n'));
});

test('there is no default availability question to fall back to', () => {
  // The wrong sentence survived one fix as a default value. A requisition built
  // at runtime with no slots must ask an open question and score nothing,
  // rather than inheriting a shift pattern that belongs to another role.
  const q = SEED.availabilityQuestion([]);
  assert.equal(SEED.slotPhrase([]), null);
  assert.ok(!/weekend|evening|opening|overnight/i.test(q.text), 'empty slots produced a shift pattern: ' + q.text);
  assert.deepEqual(q.positivePhrases, []);
  assert.deepEqual(q.concernPhrases, []);
});

test('every requisition names its own hours in its own availability question', async () => {
  const env = await fresh();
  env.store.all('requisitions', env.TENANT).forEach((r) => {
    const q = (r.screeningQuestions || []).find((x) => x.key === 'availability');
    if (!q) return;
    const phrase = SEED.slotPhrase(r.requiredSlots);
    assert.ok(phrase, r.key + ' has no slot phrase');
    assert.ok(q.text.indexOf(phrase) >= 0,
      r.key + ': the question does not name its own hours.\n  asks: ' + q.text + '\n  needs: ' + phrase);
  });
});

test('a candidate is not marked down for declining shifts the role does not require', async () => {
  const env = await fresh();
  // Overnight Stocker runs Monday, Tuesday and Thursday overnights. Somebody
  // who can only work weekdays covers all three.
  const r = env.store.all('requisitions', env.TENANT).find((x) => x.key === 'stocker_ridgeway');
  assert.ok(r, 'the overnight stocker requisition is gone');
  const q = (r.screeningQuestions || []).find((x) => x.key === 'availability');
  const answer = 'i can only do weekdays really';
  const hits = (q.concernPhrases || []).filter((p) => answer.indexOf(p) >= 0);
  assert.deepEqual(hits, [], 'declining weekends is a concern on a job with no weekend shift');
});

test('an accommodation request is not scored as a failure to meet the requirement', async () => {
  const env = await fresh();
  const answer = 'i am not sure. my back is not great and i would struggle with a full shift standing.';
  const withPhysical = env.store.all('requisitions', env.TENANT)
    .map((r) => ({ r, q: (r.screeningQuestions || []).find((x) => x.key === 'physical') }))
    .filter((x) => x.q);
  assert.ok(withPhysical.length, 'no requisition asks the physical question at all');
  withPhysical.forEach(({ r, q }) => {
    const hits = (q.concernPhrases || []).filter((p) => answer.indexOf(p) >= 0);
    assert.deepEqual(hits, [], r.key + ': an impairment disclosure is scored as a concern');
  });
});

test('every required slot is one the apply form actually offers', async () => {
  const env = await fresh();
  const SLOTS = require('../../js/slots');
  const bad = [];
  env.store.all('requisitions', env.TENANT).forEach((r) => {
    (r.requiredSlots || []).forEach((s) => {
      if (!SLOTS.valid(s)) bad.push(r.key + ' requires "' + s + '", which is not in the canonical slot table');
    });
  });
  assert.deepEqual(bad, [], 'a requisition needs hours the form cannot collect:\n' + bad.join('\n'));
});

test('the canonical slot table is the only copy of the day and part names', () => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '..', 'lib');
  const offenders = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const full = path.join(d, e.name);
      if (e.isDirectory()) return walk(full);
      if (!e.name.endsWith('.js')) return;
      const src = fs.readFileSync(full, 'utf8');
      // A second day-name map is the thing that caused the drift.
      if (/mon:\s*'Monday'/.test(src) && !/require\(.*slots.*\)/.test(src)) {
        offenders.push(full + ' declares its own day names');
      }
    });
  })(dir);
  assert.deepEqual(offenders, [], offenders.join('\n'));
});
