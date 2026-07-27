import type { Activity } from '@/types/domain';
import { getDb } from '../client';
import {
  ACTIVITY_COLUMNS,
  activityToRow,
  rowToActivity,
  type ActivityRow,
} from '../mappers';
import { enqueue } from './syncQueue';

export async function getAllActivities(): Promise<Activity[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActivityRow>(
    "SELECT * FROM activities WHERE status = 'approved';",
  );
  return rows.map(rowToActivity);
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ActivityRow>(
    'SELECT * FROM activities WHERE id = ?;',
    [id],
  );
  return row ? rowToActivity(row) : null;
}

/** Insert (or replace) an activity — used by the AI pipeline and seeding. */
export async function upsertActivity(a: Activity): Promise<void> {
  const db = await getDb();
  const placeholders = ACTIVITY_COLUMNS.map(() => '?').join(', ');
  await db.runAsync(
    `INSERT OR REPLACE INTO activities (${ACTIVITY_COLUMNS.join(', ')}) VALUES (${placeholders});`,
    activityToRow(a),
  );
  // Only AI/user activities sync; curated ships with the app.
  if (a.source === 'ai') await enqueue('activities', a.id, 'insert', a);
}
