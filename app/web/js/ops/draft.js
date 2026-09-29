/* ============================================================================
   ops/draft.js  ·  the half-typed reason that survives being called to a till

   THE SINGLE MOST RETAIL-SPECIFIC REQUIREMENT IN THE REVIEW. A store manager
   is interrupted. They are not at a desk, they do not have a hiring hour, and
   the person who starts a task is often not the person who finishes it. So the
   unit of this interface is a task with a persisted state rather than a page
   with a scroll position, and a per-item note has to outlive the drawer
   closing.

   KEYED BY ITEM, not by page and not by one global draft. A manager can open
   Trevor Boone, start typing why the prior record does not stand, get called
   away, come back and open Dara Simmons instead. Two drafts, both kept, and
   neither overwrites the other.

   sessionStorage rather than localStorage, deliberately. A rejection reason is
   about a named person and this runs on shared back-office machines. It should
   not still be on the device tomorrow for whoever opens the browser next. The
   tab's own life is the right length.

   EVERY READ AND WRITE IS WRAPPED. A private window throws on access rather
   than returning null, and a surface that cannot render because storage is off
   is worse than one that forgets a draft.
   ============================================================================ */

const PREFIX = 'ops.draft.';

/**
 * The key for one item. It has to be stable across a drawer closing and
 * reopening, and distinct per reason on the same person, because somebody with
 * a rehire hold and a decision pending is one queue row carrying two actions
 * and the reasons for those two are not the same sentence.
 */
export function keyFor(item) {
  if (!item) return PREFIX + 'none';
  const parts = [item.applicationId || 'app', item.kind || 'kind'];
  if (item.exceptionId) parts.push(item.exceptionId);
  if (item.taskKey) parts.push(item.taskKey);
  if (item.clockKey) parts.push(item.clockKey);
  if (item.batch) parts.push('batch', item.batch.join('+'));
  return PREFIX + parts.join('.');
}

export function read(item) {
  const empty = { chips: [], text: '' };
  try {
    const raw = window.sessionStorage.getItem(keyFor(item));
    if (!raw) return empty;
    const v = JSON.parse(raw);
    return {
      chips: Array.isArray(v.chips) ? v.chips : [],
      text: typeof v.text === 'string' ? v.text : ''
    };
  } catch (e) { return empty; }
}

export function write(item, draft) {
  try {
    const v = { chips: draft.chips || [], text: draft.text || '' };
    if (!v.chips.length && !v.text.trim()) { drop(item); return; }
    window.sessionStorage.setItem(keyFor(item), JSON.stringify(v));
  } catch (e) { /* Storage off. The draft is lost on close and nothing breaks. */ }
}

export function drop(item) {
  try { window.sessionStorage.removeItem(keyFor(item)); } catch (e) { /* as above */ }
}

/** Whether anything is kept for this item, so a row can say so without
    opening it. */
export function has(item) {
  const d = read(item);
  return !!(d.chips.length || d.text.trim());
}

/**
 * The sentence that goes on the record.
 *
 * Chips join into one sentence and free text is appended, so a manager who
 * taps two chips and adds a clause gets all three on the audit record rather
 * than whichever the code happened to prefer. The engine requires at least 12
 * characters on a decision, which is why a single short chip is checked
 * against that rather than assumed to pass.
 */
export function sentence(draft) {
  const chips = (draft.chips || []).filter(Boolean);
  const text = (draft.text || '').trim();
  const parts = [];
  if (chips.length) parts.push(chips.join('. ') + '.');
  if (text) parts.push(text);
  return parts.join(' ').trim();
}
