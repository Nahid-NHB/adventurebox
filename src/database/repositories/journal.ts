import type { JournalEntry } from '@/types/domain';
import { getDb } from '../client';
import { rowToJournal, type JournalRow } from '../mappers';
import { uuid } from '@/lib/id';
import { enqueue } from './syncQueue';

const COLS =
  'id, assignment_id, child_id, activity_id, before_photo_key, after_photo_key, child_comment, learning_note, created_at';

export async function getJournal(familyChildIds: string[]): Promise<JournalEntry[]> {
  const db = await getDb();
  if (familyChildIds.length === 0) return [];
  const placeholders = familyChildIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<JournalRow>(
    `SELECT * FROM journal_entries WHERE child_id IN (${placeholders}) ORDER BY created_at DESC;`,
    familyChildIds,
  );
  return rows.map(rowToJournal);
}

export async function addJournalEntry(
  input: Omit<JournalEntry, 'id' | 'createdAt'>,
): Promise<JournalEntry> {
  const db = await getDb();
  const entry: JournalEntry = {
    ...input,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO journal_entries (${COLS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      entry.id,
      entry.assignmentId,
      entry.childId,
      entry.activityId,
      entry.beforePhotoKey,
      entry.afterPhotoKey,
      entry.childComment,
      entry.learningNote,
      entry.createdAt,
    ],
  );
  await enqueue('journal_entries', entry.id, 'insert', entry);
  return entry;
}
