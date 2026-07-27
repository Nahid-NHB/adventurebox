/**
 * SQLite schema. JSON-shaped fields are stored as TEXT and parsed in the
 * repositories. Migrations run in order; `schema_migrations` tracks applied
 * versions so upgrades are additive and safe.
 */

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial',
    sql: `
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY NOT NULL,
        source TEXT NOT NULL,
        status TEXT NOT NULL,
        premium_pack TEXT,
        title TEXT NOT NULL,
        story_intro TEXT NOT NULL,
        mission TEXT NOT NULL,
        objective TEXT NOT NULL,
        steps TEXT NOT NULL,
        safety_tips TEXT NOT NULL,
        learning_explanation TEXT NOT NULL,
        reflection_questions TEXT NOT NULL,
        parent_tip TEXT,
        category TEXT NOT NULL,
        skills TEXT NOT NULL,
        min_age INTEGER NOT NULL,
        max_age INTEGER NOT NULL,
        min_time INTEGER NOT NULL,
        max_time INTEGER NOT NULL,
        materials_required TEXT NOT NULL,
        indoor_outdoor TEXT NOT NULL,
        weather_tags TEXT NOT NULL,
        energy_level TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_activities_filter
        ON activities (category, min_age, max_age, indoor_outdoor);

      CREATE TABLE IF NOT EXISTS children (
        id TEXT PRIMARY KEY NOT NULL,
        family_id TEXT NOT NULL,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        avatar_key TEXT,
        interests TEXT NOT NULL,
        favorite_colors TEXT NOT NULL,
        learning_goals TEXT NOT NULL,
        energy_default TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS family_settings (
        family_id TEXT PRIMARY KEY NOT NULL,
        materials TEXT NOT NULL,
        environment TEXT NOT NULL,
        default_time_minutes INTEGER NOT NULL,
        indoor_outdoor_pref TEXT NOT NULL,
        notify_hour INTEGER NOT NULL DEFAULT 9
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY NOT NULL,
        child_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_assignments_date
        ON assignments (date, status);

      CREATE TABLE IF NOT EXISTS streaks (
        family_id TEXT PRIMARY KEY NOT NULL,
        current_streak INTEGER NOT NULL,
        longest_streak INTEGER NOT NULL,
        last_completed_date TEXT,
        explorer_level INTEGER NOT NULL,
        xp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS favorites (
        family_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (family_id, activity_id)
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        assignment_id TEXT,
        child_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        before_photo_key TEXT,
        after_photo_key TEXT,
        child_comment TEXT,
        learning_note TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        op TEXT NOT NULL,
        payload TEXT,
        created_at INTEGER NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
    `,
  },
  {
    version: 2,
    name: 'weekly_challenges',
    sql: `
      CREATE TABLE IF NOT EXISTS weekly_challenge_progress (
        family_id TEXT NOT NULL,
        week_key TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        target INTEGER NOT NULL,
        completed_at TEXT,
        PRIMARY KEY (family_id, week_key)
      );
    `,
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
