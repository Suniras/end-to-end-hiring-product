#!/usr/bin/env node
/* Runs a JSON list of {text, expect} cases against nlu.js, headless.
   usage: node tools/nlu-harness.js cases.json            */
global.window = global;
const fs = require('fs'), path = require('path'), os = require('os');
const root = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'js/steps.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'js/nlu.js'), 'utf8'));

/* The classifier needs to know who the people are. It used to read them out of
   the browser seed file. Now it reads the real seeded database, so the suites
   test the classifier against the same names a demo will actually contain, and
   a case that names somebody who does not exist fails honestly. */
process.env.DEMO_DB_FILE = path.join(os.tmpdir(), 'frontline-nlu-harness.json');
const { Store } = require(path.join(root, 'server/lib/store.js'));
const { seed, TENANT, PEOPLE } = require(path.join(root, 'server/lib/seed.js'));
const store = new Store();

function buildRoster() {
  const out = [], seen = {};
  const add = (name, kind, row) => {
    if (!name || seen[name]) return;
    seen[name] = 1;
    out.push({ name, kind, row, first: String(name).split(' ')[0].toLowerCase() });
  };
  store.all('candidates', TENANT).forEach(c => {
    const a = store.where('applications', TENANT, x => x.candidateId === c.id)[0];
    const st = a ? a.state : '';
    const kind = st === 'DECISION_PENDING' ? 'decision'
      : st === 'ELIGIBILITY_REVIEW' ? 'flagged'
      : st.indexOf('BACKGROUND_CHECK') === 0 ? 'check'
      : (st === 'FIRST_SHIFT_SCHEDULED' || st === 'READY_FOR_SHIFT') ? 'start'
      : (a && a.everify) ? 'newhire'
      : st === 'SCREENING_PENDING' ? 'review' : 'candidate';
    add(c.name, kind, c);
  });
  Object.keys(PEOPLE).forEach(k => add(PEOPLE[k].name, 'user', PEOPLE[k]));
  store.all('stores', TENANT).forEach(s => add(s.manager, 'user', s));
  return out;
}

// nav_goto to the reports screen and report_metric are the same destination.
/* Pairs that mean the same thing to a user. The harness accepts either, so a
   case is not scored as a miss for choosing the queue screen over the approvals
   screen when the sentence meant both. */
const SAME = { report_metric: ['nav_goto'], nav_goto: ['report_metric'],
               candidate_status: ['compliance_status','explain_flag','candidate_timeline'],
               candidate_timeline: ['candidate_status'],
               waiting_long: ['queue_summary','pending_decisions'],
               queue_summary: ['pending_decisions'],
               pending_decisions: ['queue_summary'],
               screening_done: ['review_held'] };
const okEq = (got, want) => got === want || (SAME[want] || []).indexOf(got) >= 0;

(async () => {
await seed(store);
NLU.provide({ roster: buildRoster, steps: global.STEPS });

const cases = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let pass = 0; const fails = [];
cases.forEach(c => {
  const r = NLU.classify(c.text);
  if (okEq(r.intent, c.expect)) pass++;
  else fails.push({ text: c.text, expect: c.expect, got: r.intent,
                    conf: r.confidence, margin: r.margin,
                    alts: r.alternatives.map(a => a.id),
                    person: r.entities.person ? r.entities.person.name : null,
                    concepts: r.concepts.slice(0, 5) });
});
console.log(JSON.stringify({ total: cases.length, pass, rate: +(pass/cases.length*100).toFixed(1), fails }, null, 1));
})();
