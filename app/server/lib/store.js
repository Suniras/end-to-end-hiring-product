/* ============================================================================
   store.js  · persistence, and the tenant boundary

   THE TENANT BOUNDARY IS THE POINT OF THIS FILE. Identity matching reads one
   customer's own employment records and never pools across customers, because
   pooling would make this a consumer reporting agency under 15 U.S.C. 1681a(f),
   which is a different company with a different licence. D-030.

   That rule is enforced HERE, in the query layer, and not by the callers. Every
   read and every write takes a tenant id and throws without one. A caller that
   forgets is a crash, not a leak.

   THREE HOLES A SECURITY REVIEW FOUND ON 8 SEPTEMBER 2026, all on the write
   side, while this header claimed reads and writes were equally protected. Do
   not reintroduce any of them.

   1. `_tenant` only rejected falsy values, so `true`, `1`, `{}`, `[]` and
      `'tn_a '` all passed and returned zero rows. A wrong tenant that reads as
      an empty database is worse than a crash, because an empty screen looks
      like a customer with no applications.
   2. `insert` took no tenant, so a caller holding tenant A could plant a row
      tagged tenant B and tenant B would read it. The row's own tenantId was
      the only thing checked, and the row is what the caller wrote.
   3. `update` merged the patch straight in, so a patch carrying `tenantId`
      relocated a row into another customer's tenant and a patch carrying `id`
      rewrote the key. Both were demonstrated live.

   WHAT IS STILL NOT FIXED, stated because an unstated gap is the one that
   bites. `nextId` counts per prefix across the whole file rather than per
   tenant, so with two customers in one database the sequence gaps let one of
   them infer the other's application volume. It stays that way for now because
   the id format is load bearing in the seed, which proves itself by replaying
   to a byte-identical database, and in every recorded id in the review. The fix
   is per-tenant counters or random ids, and it is a change every caller of
   nextId has to see.

   Persistence is a single JSON file. That is a deliberate choice rather than a
   limitation: the whole dataset is about forty rows per table and a few hundred
   events, the previous build proved a file is enough, and node:sqlite is still
   flagged experimental on this runtime. Reliability on 20 September beats
   elegance, and a file cannot have a migration go wrong on the day.
   ============================================================================ */

import fs from 'node:fs';
import path from 'node:path';

export const TABLES = [
  'tenants', 'stores', 'requisitions', 'candidates', 'applications',
  'priorEmployment', 'screenings', 'evaluations', 'decisions', 'offers',
  'backgroundChecks', 'onboardingTasks', 'shifts',
  'workflowEvents', 'auditEvents', 'agentActions', 'communications',
  'connectorCalls', 'exceptions', 'notifications', 'pendingActions',
  'llmCalls', 'consents'
];

export function emptyDb() {
  const db = { meta: { version: 1, seededAt: null, anchors: null } };
  TABLES.forEach((t) => { db[t] = []; });
  return db;
}

export class Store {
  constructor(file) {
    this.file = file;
    this.db = null;
    this.dirty = false;
    this.counters = {};
    this._flushTimer = null;
  }

  load() {
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      this.db = JSON.parse(raw);
      /* A table added after a file was written must not be undefined, or the
         first read of it throws in a place that has nothing to do with it. */
      TABLES.forEach((t) => { if (!Array.isArray(this.db[t])) this.db[t] = []; });
      if (!this.db.meta) this.db.meta = { version: 1, seededAt: null, anchors: null };
      this._rebuildCounters();
      return true;
    } catch (e) {
      this.db = emptyDb();
      return false;
    }
  }

  reset() {
    this.db = emptyDb();
    this.counters = {};
    this.dirty = true;
  }

  _rebuildCounters() {
    this.counters = {};
    TABLES.forEach((t) => {
      this.db[t].forEach((row) => {
        const m = String(row && row.id || '').match(/^([a-z]+)_(\d+)$/);
        if (!m) return;
        const n = Number(m[2]);
        if (!this.counters[m[1]] || this.counters[m[1]] < n) this.counters[m[1]] = n;
      });
    });
  }

  nextId(prefix) {
    this.counters[prefix] = (this.counters[prefix] || 0) + 1;
    return prefix + '_' + String(this.counters[prefix]).padStart(4, '0');
  }

  markDirty() {
    this.dirty = true;
    /* Debounced, because a settle() can touch a dozen rows and writing the file
       a dozen times in one request is the only thing in here that could ever be
       slow. */
    if (this._flushTimer) return;
    this._flushTimer = setTimeout(() => { this._flushTimer = null; this.flushNow(); }, 120);
  }

  flushNow() {
    if (!this.dirty) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    /* Written to a temp file and renamed, so a process killed mid-write leaves
       the previous state rather than half a file. */
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.db));
    fs.renameSync(tmp, this.file);
    this.dirty = false;
  }

  /* ------------------------------------------------------ the boundary --- */

  _table(name) {
    if (!this.db) throw new Error('the store has not been loaded');
    if (!Array.isArray(this.db[name])) throw new Error('no such table: ' + name);
    return this.db[name];
  }

  /* A tenant id is a non-empty string of the id alphabet. The shape is checked
     and not just the truthiness, because `true`, `1`, `{}` and a trailing space
     used to get through here and every one of them returned zero rows, which
     reads on a screen as a customer who has no applications. */
  _tenant(tenantId, where) {
    if (typeof tenantId !== 'string' || !/^[A-Za-z0-9_-]+$/.test(tenantId)) {
      throw new Error(
        'a tenant id is required for ' + where + ', as a string, and ' +
        JSON.stringify(tenantId) + ' is not one. Reading across customers would make this ' +
        'a consumer reporting agency under 15 U.S.C. 1681a(f), so the query layer refuses ' +
        'rather than trusting the caller.'
      );
    }
    return tenantId;
  }

  /** Every row of a table belonging to one tenant. */
  all(name, tenantId) {
    const t = this._tenant(tenantId, 'all(' + name + ')');
    return this._table(name).filter((r) => r.tenantId === t);
  }

  /** One row by id, and only if it belongs to this tenant. */
  byId(name, tenantId, id) {
    if (!id) return null;
    const t = this._tenant(tenantId, 'byId(' + name + ')');
    return this._table(name).find((r) => r.id === id && r.tenantId === t) || null;
  }

  where(name, tenantId, fn) {
    return this.all(name, tenantId).filter(fn);
  }

  first(name, tenantId, fn) {
    return this.all(name, tenantId).find(fn) || null;
  }

  count(name, tenantId, fn) {
    const rows = this.all(name, tenantId);
    return fn ? rows.filter(fn).length : rows.length;
  }

  /**
   * Add a row.
   *
   * `expectTenantId` is the tenant the CALLER holds, and where it is given the
   * row's own tenantId has to equal it. That is the only way this layer can
   * catch a caller planting a row in somebody else's tenant, because the row is
   * written by the caller and cannot vouch for itself. It is optional so the
   * hundred existing call sites keep working, and every one of them should pass
   * `ctx.tenantId` as it is touched.
   */
  insert(name, row, expectTenantId) {
    if (!row || !row.tenantId) {
      throw new Error('insert(' + name + ') needs a tenantId on the row. A row with no tenant is a row ' +
                      'every tenant can read.');
    }
    this._tenant(row.tenantId, 'insert(' + name + ')');
    if (expectTenantId !== undefined) {
      const held = this._tenant(expectTenantId, 'insert(' + name + ')');
      if (row.tenantId !== held) {
        throw new Error('insert(' + name + ') was called by a caller holding ' + held +
                        ' with a row tagged ' + row.tenantId + '. Writing into another customer\'s ' +
                        'tenant is the same offence as reading from it.');
      }
    }
    this._table(name).push(row);
    this.markDirty();
    return row;
  }

  /**
   * Update in place. Returns the row, or null if it is not this tenant's.
   *
   * THE PATCH MAY NOT CARRY `tenantId` OR `id`. A patch with tenantId in it
   * relocated a row into another customer's tenant, and a patch with id in it
   * rewrote the key, both demonstrated by a reviewer against a two-tenant
   * database. Neither is a legitimate update: a row does not change customer
   * and it does not change identity.
   */
  update(name, tenantId, id, patch) {
    const p = patch || {};
    ['tenantId', 'id'].forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(p, k)) {
        throw new Error('update(' + name + ') refused a patch carrying "' + k + '". A row does not ' +
                        'change customer and it does not change identity, so this is either a bug or ' +
                        'an attempt to move a row across the tenant boundary.');
      }
    });
    const row = this.byId(name, tenantId, id);
    if (!row) return null;
    Object.assign(row, p);
    this.markDirty();
    return row;
  }

  /**
   * Delete one row. This exists because California requires a deletion path and
   * the previous build had none, which made every claim about retention
   * unbacked. It refuses without a tenant like everything else, and it returns
   * what it removed so the deletion itself can be recorded.
   */
  remove(name, tenantId, id) {
    const t = this._tenant(tenantId, 'remove(' + name + ')');
    const rows = this._table(name);
    const i = rows.findIndex((r) => r.id === id && r.tenantId === t);
    if (i < 0) return null;
    const [gone] = rows.splice(i, 1);
    this.markDirty();
    return gone;
  }

  /**
   * Row counts per table for ONE tenant.
   *
   * It used to take no tenant at all and was wired to two open routes, so an
   * anonymous caller read the whole database's shape. A count is not a row, but
   * it is still one customer's volume.
   */
  sizes(tenantId) {
    const t = this._tenant(tenantId, 'sizes()');
    const out = {};
    TABLES.forEach((name) => {
      out[name] = this._table(name).filter((r) => r.tenantId === t).length;
    });
    return out;
  }

  /**
   * Row counts across every tenant. For the boot log and for an operator route
   * behind authentication, and for nothing that is served to a candidate.
   */
  sizesAllTenants() {
    const out = {};
    TABLES.forEach((name) => { out[name] = this._table(name).length; });
    return out;
  }
}

export function open(file) {
  const s = new Store(file);
  s.load();
  return s;
}
