#!/usr/bin/env node
/* The training suite is the intent table's own examples, so it is generated
   rather than stored by hand: an example added to nlu.js is tested by the next
   run without anybody remembering to copy it across. */
global.window = global;
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'js/nlu.js'), 'utf8'));
const cases = NLU.examples();
fs.writeFileSync(path.join(root, 'tools/cases-training.json'), JSON.stringify(cases, null, 1));
