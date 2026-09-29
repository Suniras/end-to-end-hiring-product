#!/usr/bin/env node
/* Runs a JSON list of {text, expect} cases against nlu.js, headless.
   usage: node tools/nlu-harness.js cases.json            */
global.window = global;
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'js/nlu.js'), 'utf8'));

// nav_goto to the reports screen and report_metric are the same destination.
const SAME = { report_metric: ['nav_goto'], nav_goto: ['report_metric'],
               candidate_status: ['compliance_status','explain_flag'] };
const okEq = (got, want) => got === want || (SAME[want] || []).indexOf(got) >= 0;

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
