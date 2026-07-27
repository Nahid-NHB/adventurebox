import type { Assignment } from '@/types/domain';
import { getDb } from '../client';
import { rowToAssignment, type AssignmentRow } from '../mappers';
import { uuid } from '@/lib/id';
import { enqueue } from './syncQueue';

export async function getAssignment(
  childId: string,
  date: string,
): Promise<Assignment | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<AssignmentRow>(
    'SELECT * FROM assignments WHERE child_id = ? AND date = ? ORDER BY started_at DESC LIMIT 1;',
    [childId, date],
  );
  return row ? rowToAssignment(row) : null;
}

export async function recordAssignment(input: {
  childId: string;
  activityId: string;
  date: string;
  status: Assignment['status'];
}): Promise<Assignment> {
  const db = await getDb();
  const now = new Date().toISOString();
  const assignment: Assignment = {
    id: uuid(),
    childId: input.childId,
    activityId: input.activityId,
    date: input.date,
    status: input.status,
    startedAt: input.status === 'started' ? now : null,
    completedAt: input.status === 'completed' ? now : null,
  };
  await db.runAsync(
    'INSERT INTO assignments (id, child_id, activity_id, date, status, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [
      assignment.id,
      assignment.childId,
      assignment.activityId,
      assignment.date,
      assignment.status,
      assignment.startedAt,
      assignment.completedAt,
    ],
  );
  await enqueue('assignments', assignment.id, 'insert', assignment);
  return assignment;
}

/** Fingerprintable recent history: activity ids served/completed lately. */
export async function getRecentActivityIds(
  childId: string,
  limit = 20,
): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ activity_id: string }>(
    'SELECT activity_id FROM assignments WHERE child_id = ? ORDER BY date DESC LIMIT ?;',
    [childId, limit],
  );
  return rows.map((r) => r.activity_id);
}

/** Rolling success rate = completed / (completed + skipped) over recent items. */
export async function getSuccessRate(childId: string, limit = 15): Promise<number> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ status: string }>(
    "SELECT status FROM assignments WHERE child_id = ? AND status IN ('completed','skipped') ORDER BY date DESC LIMIT ?;",
    [childId, limit],
  );
  if (rows.length === 0) return 0.5; // neutral prior
  const completed = rows.filter((r) => r.status === 'completed').length;
  return completed / rows.length;
}
