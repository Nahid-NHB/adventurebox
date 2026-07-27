import { describe, expect, it } from '@jest/globals';
import { coalesce, markSynced, pendingItems, type SyncItem } from '../syncQueue';

function item(over: Partial<SyncItem>): SyncItem {
  return {
    id: 'i1',
    entity: 'assignment',
    entityId: 'a1',
    op: 'insert',
    payload: {},
    createdAt: 1,
    synced: false,
    ...over,
  };
}

describe('pendingItems', () => {
  it('returns unsynced items oldest first', () => {
    const q = [
      item({ id: 'b', createdAt: 3 }),
      item({ id: 'a', createdAt: 1 }),
      item({ id: 'c', createdAt: 2, synced: true }),
    ];
    expect(pendingItems(q).map((i) => i.id)).toEqual(['a', 'b']);
  });
});

describe('coalesce', () => {
  it('merges insert + update into a single insert with latest payload', () => {
    const q = [
      item({ id: 'a', op: 'insert', payload: { v: 1 }, createdAt: 1 }),
      item({ id: 'b', op: 'update', payload: { v: 2 }, createdAt: 2 }),
    ];
    const out = coalesce(q);
    expect(out).toHaveLength(1);
    expect(out[0].op).toBe('insert');
    expect(out[0].payload).toEqual({ v: 2 });
    expect(out[0].id).toBe('a'); // keeps idempotency key
  });

  it('drops an insert entirely if a delete follows before sync', () => {
    const q = [
      item({ id: 'a', op: 'insert', createdAt: 1 }),
      item({ id: 'b', op: 'delete', createdAt: 2 }),
    ];
    expect(coalesce(q)).toHaveLength(0);
  });

  it('keeps a delete for an already-persisted row', () => {
    const q = [
      item({ id: 'a', op: 'update', createdAt: 1 }),
      item({ id: 'b', op: 'delete', createdAt: 2 }),
    ];
    const out = coalesce(q);
    expect(out).toHaveLength(1);
    expect(out[0].op).toBe('delete');
    expect(out[0].id).toBe('a');
  });

  it('keeps operations on different rows separate', () => {
    const q = [
      item({ id: 'a', entityId: 'row1', createdAt: 1 }),
      item({ id: 'b', entityId: 'row2', createdAt: 2 }),
    ];
    expect(coalesce(q)).toHaveLength(2);
  });
});

describe('markSynced', () => {
  it('marks only the given ids', () => {
    const q = [item({ id: 'a' }), item({ id: 'b' })];
    const out = markSynced(q, ['a']);
    expect(out.find((i) => i.id === 'a')?.synced).toBe(true);
    expect(out.find((i) => i.id === 'b')?.synced).toBe(false);
  });
});
