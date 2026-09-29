/* ============================================================================
   store.js  ·  persistence

   One JSON file on disk, written atomically. That is the whole database.

   Why not SQLite: the dataset is a few hundred rows and the repository has a
   standing rule against adding a package manager or a runtime. A JSON file
   needs neither, and it has the property that matters most for a demo you have
   to trust: you can open it and read it.

   Atomic write means the file is written to a temporary name and then renamed
   over the target. rename() is atomic on the same filesystem, so a crash
   half-way through a save leaves the previous state intact rather than a
   truncated file.

   TENANT ISOLATION IS ENFORCED HERE, not in the callers. Every row carries a
   tenantId, and every read goes through a query helper that requires one. This
   is a deliberate architectural boundary, not tidiness: matching a person
   against one customer's own employment records is a service provider doing a
   lookup. Pooling those records across customers would make the company a
   consumer reporting agency under FCRA, which is a different company with a
   different licence. The tenancy is the boundary.
   ============================================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_FILE = path.join(__dirname, '..', 'data', 'state.json');

/** Every table in the database. Order is only for readability of the file. */
const TABLES = [
  'tenants', 'stores', 'requisitions', 'candidates', 'applications',
  'priorEmployment', 'screenings', 'decisions', 'offers', 'backgroundChecks',
  'onboardingTasks', 'shifts', 'workflowEvents', 'agentActions',
  'notifications', 'auditEvents', 'communications', 'connectorCalls',
  'exceptions', 'pendingActions', 'llmCalls'
];

function emptyDb() {
  const db = { meta: { version: 3, anchors: null, seededAt: null }, seq: {} };
  TABLES.forEach((t) => { db[t] = []; });
  return db;
}

class Store {
  constructor(file) {
    this.file = file || process.env.DEMO_DB_FILE || DEFAULT_FILE;
    this.db = null;
    this._writeTimer = null;
    this._writing = false;
    this._dirty = false;
  }

  /* ------------------------------------------------------------- lifecycle */

  load() {
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      const parsed = JSON.parse(raw);
      // Add any table introduced after this file was written, so an older
      // state.json still boots instead of throwing on an undefined array.
      TABLES.forEach((t) => { if (!Array.isArray(parsed[t])) parsed[t] = []; });
      if (!parsed.seq) parsed.seq = {};
      this.db = parsed;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        // A corrupt file is worth saying out loud rather than silently
        // reseeding over somebody's demo state.
        console.error('[store] could not read ' + this.file + ': ' + err.message);
        console.error('[store] starting from an empty database');
      }
      this.db = emptyDb();
    }
    return this.db;
  }

  replace(db) { this.db = db; this.markDirty(); return this.db; }

  reset() { this.db = emptyDb(); this.markDirty(); return this.db; }

  /** Coalesce writes: a burst of mutations produces one flush, not twenty. */
  markDirty() {
    this._dirty = true;
    if (this._writeTimer) return;
    this._writeTimer = setTimeout(() => { this._writeTimer = null; this.flush(); }, 25);
    if (this._writeTimer.unref) this._writeTimer.unref();
  }

  flush() {
    if (!this._dirty || this._writing) return;
    this._writing = true;
    this._dirty = false;
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const tmp = this.file + '.' + process.pid + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this.db, null, 1));
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error('[store] write failed: ' + err.message);
      this._dirty = true;
    } finally {
      this._writing = false;
    }
  }

  /** Used by the tests and by anything that must know the write landed. */
  flushNow() { this._dirty = true; this.flush(); }

  /* ------------------------------------------------------------------ ids */

  /** Readable, stable, and sortable: cand_0007 rather than a uuid. */
  nextId(prefix) {
    const n = (this.db.seq[prefix] || 0) + 1;
    this.db.seq[prefix] = n;
    return prefix + '_' + String(n).padStart(4, '0');
  }

  /* -------------------------------------------------------------- queries */

  table(name) {
    if (!this.db[name]) throw new Error('no such table: ' + name);
    return this.db[name];
  }

  /**
   * Every read is tenant-scoped. Passing no tenantId is a programming error and
   * throws, rather than quietly returning every customer's rows.
   */
  all(name, tenantId) {
    if (!tenantId) throw new Error('all(' + name + ') requires a tenantId');
    return this.table(name).filter((r) => r.tenantId === tenantId);
  }

  where(name, tenantId, pred) {
    return this.all(name, tenantId).filter(pred);
  }

  find(name, tenantId, pred) {
    const fn = typeof pred === 'function' ? pred : (r) => r.id === pred;
    return this.all(name, tenantId).find(fn) || null;
  }

  /** By id, still tenant-checked. Returns null across a tenant boundary. */
  byId(name, tenantId, id) {
    const row = this.table(name).find((r) => r.id === id);
    if (!row) return null;
    if (row.tenantId !== tenantId) return null;
    return row;
  }

  insert(name, row) {
    if (!row.tenantId) throw new Error('insert(' + name + ') requires a tenantId');
    this.table(name).push(row);
    this.markDirty();
    return row;
  }

  update(name, tenantId, id, patch) {
    const row = this.byId(name, tenantId, id);
    if (!row) return null;
    Object.assign(row, patch);
    this.markDirty();
    return row;
  }

  /** Tables that are global rather than per-customer. Only tenants qualifies. */
  allGlobal(name) { return this.table(name); }
}

module.exports = { Store, TABLES, emptyDb, DEFAULT_FILE };
