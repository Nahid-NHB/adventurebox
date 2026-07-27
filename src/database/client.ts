/**
 * SQLite client. Wraps expo-sqlite behind a tiny async interface (`Db`) so the
 * repositories don't depend on Expo directly and can be pointed at a fake in
 * tests. Runs migrations and seeds the curated library on first launch.
 */
import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';
import { CURATED_ACTIVITIES } from './seed/activities';
import { activityToRow, ACTIVITY_COLUMNS } from './mappers';

export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: unknown[]): Promise<{ changes: number }>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
}

let dbPromise: Promise<Db> | null = null;

async function open(): Promise<Db> {
  const sqlite = await SQLite.openDatabaseAsync('adventurebox.db');
  await sqlite.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  return {
    execAsync: (sql) => sqlite.execAsync(sql),
    runAsync: async (sql, params = []) => {
      const r = await sqlite.runAsync(sql, params as SQLite.SQLiteBindValue[]);
      return { changes: r.changes };
    },
    getAllAsync: (sql, params = []) =>
      sqlite.getAllAsync(sql, params as SQLite.SQLiteBindValue[]),
    getFirstAsync: (sql, params = []) =>
      sqlite.getFirstAsync(sql, params as SQLite.SQLiteBindValue[]),
  };
}

async function migrate(db: Db): Promise<void> {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, name TEXT, applied_at TEXT);',
  );
  const rows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations;',
  );
  const applied = new Set(rows.map((r) => r.version));
  for (const m of MIGRATIONS) {
    if (applied.has(m.version)) continue;
    await db.execAsync(m.sql);
    await db.runAsync(
      'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);',
      [m.version, m.name, new Date().toISOString()],
    );
  }
}

async function seedIfEmpty(db: Db): Promise<void> {
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM activities WHERE source = 'curated';",
  );
  if (row && row.n > 0) return;

  const placeholders = ACTIVITY_COLUMNS.map(() => '?').join(', ');
  const sql = `INSERT OR REPLACE INTO activities (${ACTIVITY_COLUMNS.join(', ')}) VALUES (${placeholders});`;
  for (const a of CURATED_ACTIVITIES) {
    await db.runAsync(sql, activityToRow(a));
  }
}

/** Get the singleton DB, initializing (migrate + seed) on first call. */
export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await open();
      await migrate(db);
      await seedIfEmpty(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Test hook: inject a fake Db and skip Expo entirely. */
export function __setDbForTests(db: Db): void {
  dbPromise = Promise.resolve(db);
}
