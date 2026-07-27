/**
 * Persistent sync outbox. Local writes append here; the sync service flushes
 * when online. Ordering/coalescing/idempotency logic lives in lib/syncQueue
 * (pure + unit-tested); this module just persists and reads.
 */
import { getDb } from '../client';
import { uuid } from '@/lib/id';
import { coalesce, markSynced as markSyncedPure, type SyncItem, type SyncOp } from '@/lib/syncQueue';

interface QueueRow {
  id: string;
  entity: string;
  entity_id: string;
  op: string;
  payload: string | null;
  created_at: number;
  synced: number;
}

function rowToItem(r: QueueRow): SyncItem {
  return {
    id: r.id,
    entity: r.entity,
    entityId: r.entity_id,
    op: r.op as SyncOp,
    payload: r.payload ? JSON.parse(r.payload) : null,
    createdAt: r.created_at,
    synced: r.synced === 1,
  };
}

/** Append an operation to the outbox. Called by every local mutation. */
export async function enqueue(
  entity: string,
  entityId: string,
  op: SyncOp,
  payload: unknown,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO sync_queue (id, entity, entity_id, op, payload, created_at, synced) VALUES (?, ?, ?, ?, ?, ?, 0);',
    [uuid(), entity, entityId, op, JSON.stringify(payload ?? null), Date.now()],
  );
}

/** Pending operations, coalesced to the minimal set, oldest first. */
export async function getPendingCoalesced(): Promise<SyncItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<QueueRow>(
    'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC;',
  );
  return coalesce(rows.map(rowToItem));
}

/** Mark the given outbox ids as synced. */
export async function markSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(', ');
  await db.runAsync(
    `UPDATE sync_queue SET synced = 1 WHERE id IN (${placeholders});`,
    ids,
  );
}

/** Test/util helper mirroring the pure marker over an in-memory list. */
export { markSyncedPure };
