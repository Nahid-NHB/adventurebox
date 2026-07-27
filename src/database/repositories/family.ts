import type { Child, FamilySettings } from '@/types/domain';
import { getDb } from '../client';
import {
  childToRow,
  rowToChild,
  settingsToRow,
  rowToSettings,
  type ChildRow,
  type SettingsRow,
} from '../mappers';
import { enqueue } from './syncQueue';

const CHILD_COLUMNS =
  'id, family_id, name, age, avatar_key, interests, favorite_colors, learning_goals, energy_default';

export async function getChildren(familyId: string): Promise<Child[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ChildRow>(
    'SELECT * FROM children WHERE family_id = ? ORDER BY name;',
    [familyId],
  );
  return rows.map(rowToChild);
}

export async function upsertChild(c: Child): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO children (${CHILD_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    childToRow(c),
  );
  await enqueue('children', c.id, 'update', c);
}

const SETTINGS_COLUMNS =
  'family_id, materials, environment, default_time_minutes, indoor_outdoor_pref, notify_hour';

export async function getSettings(familyId: string): Promise<FamilySettings | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SettingsRow>(
    'SELECT * FROM family_settings WHERE family_id = ?;',
    [familyId],
  );
  return row ? rowToSettings(row) : null;
}

export async function upsertSettings(s: FamilySettings): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO family_settings (${SETTINGS_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?);`,
    settingsToRow(s),
  );
  await enqueue('family_settings', s.familyId, 'update', s);
}
