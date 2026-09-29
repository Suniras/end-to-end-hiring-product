/* Shared setup. Every test file gets its own seeded database in a temp file, so
   nothing a test does can reach the demo state on disk or another test's. */
'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');

let n = 0;
async function fresh(opts) {
  const file = path.join(os.tmpdir(), 'frontline-test-' + process.pid + '-' + (++n) + '.json');
  try { fs.unlinkSync(file); } catch (e) { /* not there */ }
  process.env.DEMO_DB_FILE = file;

  const { Store } = require('../lib/store');
  const { seed, TENANT, TENANT_NAME } = require('../lib/seed');
  const { makeClock } = require('../lib/clock');

  const store = new Store(file);
  await seed(store, opts);
  const clock = makeClock(() => store.db.meta.anchors);

  const ctx = (actor) => ({
    tenantId: TENANT, tenantName: TENANT_NAME, clock,
    actor: actor || { type: 'human', name: 'Marcus Hale', role: 'Store manager' }
  });

  return { store, clock, ctx, file, TENANT, TENANT_NAME };
}

/** Find an application by the candidate's name. */
function byName(store, tenantId, name) {
  const c = store.all('candidates', tenantId).find((x) => x.name === name);
  if (!c) throw new Error('no candidate called ' + name);
  return { candidate: c, application: store.where('applications', tenantId, (a) => a.candidateId === c.id)[0] };
}

function inState(store, tenantId, state) {
  return store.where('applications', tenantId, (a) => a.state === state);
}

module.exports = { fresh, byName, inState };
