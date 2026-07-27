import type { Streak } from '@/types/domain';
import { getDb } from '../client';
import { rowToStreak, type StreakRow } from '../mappers';
import { emptyStreak, applyCompletion } from '@/lib/streak';
import { todayKey } from '@/lib/date';
import { enqueue } from './syncQueue';

const COLS =
  'family_id, current_streak, longest_streak, last_completed_date, explorer_level, xp';

async function save(db: Awaited<ReturnType<typeof getDb>>, s: Streak): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO streaks (${COLS}) VALUES (?, ?, ?, ?, ?, ?);`,
    [s.familyId, s.currentStreak, s.longestStreak, s.lastCompletedDate, s.explorerLevel, s.xp],
  );
}

export async function getStreak(familyId: string): Promise<Streak> {
  const db = await getDb();
  const row = await db.getFirstAsync<StreakRow>(
    'SELECT * FROM streaks WHERE family_id = ?;',
    [familyId],
  );
  if (row) return rowToStreak(row);
  const fresh = emptyStreak(familyId);
  await save(db, fresh);
  return fresh;
}

/** Apply a completion and persist. Returns the updated streak. */
export async function completeForStreak(
  familyId: string,
  day: string = todayKey(),
): Promise<Streak> {
  const db = await getDb();
  const current = await getStreak(familyId);
  const next = applyCompletion(current, day);
  await save(db, next);
  await enqueue('streaks', next.familyId, 'update', next);
  return next;
}
