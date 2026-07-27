import { getDb } from '../client';
import { enqueue } from './syncQueue';

export async function getFavoriteIds(familyId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ activity_id: string }>(
    'SELECT activity_id FROM favorites WHERE family_id = ?;',
    [familyId],
  );
  return rows.map((r) => r.activity_id);
}

export async function toggleFavorite(
  familyId: string,
  activityId: string,
): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ activity_id: string }>(
    'SELECT activity_id FROM favorites WHERE family_id = ? AND activity_id = ?;',
    [familyId, activityId],
  );
  if (existing) {
    await db.runAsync(
      'DELETE FROM favorites WHERE family_id = ? AND activity_id = ?;',
      [familyId, activityId],
    );
    await enqueue('favorites', `${familyId}:${activityId}`, 'delete', { familyId, activityId });
    return false;
  }
  await db.runAsync(
    'INSERT INTO favorites (family_id, activity_id, created_at) VALUES (?, ?, ?);',
    [familyId, activityId, new Date().toISOString()],
  );
  await enqueue('favorites', `${familyId}:${activityId}`, 'insert', {
    familyId,
    activityId,
    createdAt: new Date().toISOString(),
  });
  return true;
}
