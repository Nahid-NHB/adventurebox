/**
 * Offline sync outbox logic (pure). The app always writes locally first and
 * appends an operation here; when connectivity returns we flush in order. These
 * helpers are pure so ordering/idempotency/coalescing is unit-tested without a
 * real network or DB.
 */

export type SyncOp = 'insert' | 'update' | 'delete';

export interface SyncItem {
  id: string; // client-generated UUID (idempotency key)
  entity: string; // e.g. "assignment"
  entityId: string;
  op: SyncOp;
  payload: unknown;
  createdAt: number; // epoch ms
  synced: boolean;
}

/** Items still needing a push, oldest first (stable FIFO). */
export function pendingItems(queue: SyncItem[]): SyncItem[] {
  return queue.filter((i) => !i.synced).sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Coalesce multiple ops on the same entity row into the minimal set:
 * - insert then update -> single insert (with latest payload)
 * - anything then delete -> single delete (drop earlier ops)
 * - update then update -> latest update
 * Keeps the earliest id as the idempotency key for the surviving op.
 */
export function coalesce(items: SyncItem[]): SyncItem[] {
  const byRow = new Map<string, SyncItem>();
  for (const item of pendingItems(items)) {
    const key = `${item.entity}:${item.entityId}`;
    const existing = byRow.get(key);
    if (!existing) {
      byRow.set(key, { ...item });
      continue;
    }
    if (item.op === 'delete') {
      // A delete supersedes everything; if it was a never-synced insert, both drop.
      if (existing.op === 'insert') {
        byRow.delete(key);
      } else {
        byRow.set(key, { ...item, id: existing.id });
      }
    } else if (existing.op === 'insert') {
      // insert + update => still an insert, latest payload.
      byRow.set(key, { ...existing, payload: item.payload });
    } else {
      // update + update => latest update.
      byRow.set(key, { ...item, id: existing.id });
    }
  }
  return [...byRow.values()].sort((a, b) => a.createdAt - b.createdAt);
}

/** Mark the given ids as synced, returning a new queue (immutable). */
export function markSynced(queue: SyncItem[], ids: string[]): SyncItem[] {
  const done = new Set(ids);
  return queue.map((i) => (done.has(i.id) ? { ...i, synced: true } : i));
}
