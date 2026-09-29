#!/bin/sh
# Every test in the build. From the demo folder:  sh tools/test.sh
#
# Three parts, in the order they are worth reading:
#
#   1. The server suite. Data, workflow, the model boundary, the assistant, and
#      safety. Node's own test runner, no packages.
#   2. The end-to-end walk. Starts a real server on a real port and takes one
#      candidate from application to first shift, then restarts the process to
#      prove the state survived.
#   3. The assistant's three case suites.
#        cases-training.json  regenerated from the intent table. In sample, so
#                             100% is the floor, not an achievement.
#        cases-heldout.json   paraphrases that appear nowhere in the intent
#                             table. The only number that measures generalisation.
#        cases-safety.json    must-not-fire cases. Out-of-scope requests,
#                             questions about an action, undo, exclusions, bulk
#                             reject, two names against a singular action,
#                             firing, negation, pronoun-only subjects, and
#                             instruction-override attempts. Four cases in here
#                             expect a real intent, to catch over-blocking.
#
# The browser layer is covered separately by tools/e2e.spec.js, which needs
# Playwright. See the note at the top of that file.
set -e
cd "$(dirname "$0")/.."

echo "== server suite =="
node --test server/test/data.test.js server/test/workflow.test.js \
             server/test/llm.test.js server/test/agent.test.js \
             server/test/safety.test.js server/test/fairness.test.js \
             server/test/intake.test.js 2>&1 | grep -E '^(✔|✖|ℹ (tests|pass|fail))' || true

echo
echo "== end to end, against a running server =="
node --test server/test/e2e.test.js 2>&1 | grep -E '^(✔|✖|ℹ (tests|pass|fail))' || true

echo
echo "== assistant case suites =="
node tools/gen-training.js
for f in training heldout safety; do
  node tools/nlu-harness.js "tools/cases-$f.json" | python3 -c "
import sys,json
d=json.load(sys.stdin); n='$f'
print(('%-9s %3d/%-3d %5.1f%%' % (n, d['pass'], d['total'], d['rate'])))
for x in d['fails']:
    print('          MISS', repr(x['text']), 'want', x['expect'], 'got', x['got'])
"
done
