/**
 * Row <-> domain mappers. JSON-shaped fields are serialized to TEXT columns.
 * Keeping these in one place means the column order used for inserts stays in
 * sync with the parsing on reads.
 */
import type {
  Activity,
  Assignment,
  Child,
  FamilySettings,
  JournalEntry,
  Streak,
  WeeklyChallengeProgress,
} from '@/types/domain';

const j = (v: unknown) => JSON.stringify(v);
const p = <T>(s: string | null | undefined, fallback: T): T =>
  s ? (JSON.parse(s) as T) : fallback;

// ---- Activities -----------------------------------------------------------

export const ACTIVITY_COLUMNS = [
  'id',
  'source',
  'status',
  'premium_pack',
  'title',
  'story_intro',
  'mission',
  'objective',
  'steps',
  'safety_tips',
  'learning_explanation',
  'reflection_questions',
  'parent_tip',
  'category',
  'skills',
  'min_age',
  'max_age',
  'min_time',
  'max_time',
  'materials_required',
  'indoor_outdoor',
  'weather_tags',
  'energy_level',
  'difficulty',
  'created_at',
] as const;

export function activityToRow(a: Activity): unknown[] {
  return [
    a.id,
    a.source,
    a.status,
    a.premiumPack ?? null,
    a.title,
    a.storyIntro,
    a.mission,
    a.objective,
    j(a.steps),
    j(a.safetyTips),
    a.learningExplanation,
    j(a.reflectionQuestions),
    a.parentTip ?? null,
    a.category,
    j(a.skills),
    a.minAge,
    a.maxAge,
    a.minTime,
    a.maxTime,
    j(a.materialsRequired),
    a.indoorOutdoor,
    j(a.weatherTags),
    a.energyLevel,
    a.difficulty,
    a.createdAt,
  ];
}

export interface ActivityRow {
  id: string;
  source: string;
  status: string;
  premium_pack: string | null;
  title: string;
  story_intro: string;
  mission: string;
  objective: string;
  steps: string;
  safety_tips: string;
  learning_explanation: string;
  reflection_questions: string;
  parent_tip: string | null;
  category: string;
  skills: string;
  min_age: number;
  max_age: number;
  min_time: number;
  max_time: number;
  materials_required: string;
  indoor_outdoor: string;
  weather_tags: string;
  energy_level: string;
  difficulty: string;
  created_at: string;
}

export function rowToActivity(r: ActivityRow): Activity {
  return {
    id: r.id,
    source: r.source as Activity['source'],
    status: r.status as Activity['status'],
    premiumPack: r.premium_pack,
    title: r.title,
    storyIntro: r.story_intro,
    mission: r.mission,
    objective: r.objective,
    steps: p(r.steps, []),
    safetyTips: p(r.safety_tips, []),
    learningExplanation: r.learning_explanation,
    reflectionQuestions: p(r.reflection_questions, []),
    parentTip: r.parent_tip ?? undefined,
    category: r.category as Activity['category'],
    skills: p(r.skills, []),
    minAge: r.min_age,
    maxAge: r.max_age,
    minTime: r.min_time,
    maxTime: r.max_time,
    materialsRequired: p(r.materials_required, []),
    indoorOutdoor: r.indoor_outdoor as Activity['indoorOutdoor'],
    weatherTags: p(r.weather_tags, []),
    energyLevel: r.energy_level as Activity['energyLevel'],
    difficulty: r.difficulty as Activity['difficulty'],
    createdAt: r.created_at,
  };
}

// ---- Children -------------------------------------------------------------

export interface ChildRow {
  id: string;
  family_id: string;
  name: string;
  age: number;
  avatar_key: string | null;
  interests: string;
  favorite_colors: string;
  learning_goals: string;
  energy_default: string;
}

export function childToRow(c: Child): unknown[] {
  return [
    c.id,
    c.familyId,
    c.name,
    c.age,
    c.avatarKey ?? null,
    j(c.interests),
    j(c.favoriteColors),
    j(c.learningGoals),
    c.energyDefault,
  ];
}

export function rowToChild(r: ChildRow): Child {
  return {
    id: r.id,
    familyId: r.family_id,
    name: r.name,
    age: r.age,
    avatarKey: r.avatar_key ?? undefined,
    interests: p(r.interests, []),
    favoriteColors: p(r.favorite_colors, []),
    learningGoals: p(r.learning_goals, []),
    energyDefault: r.energy_default as Child['energyDefault'],
  };
}

// ---- Settings -------------------------------------------------------------

export interface SettingsRow {
  family_id: string;
  materials: string;
  environment: string;
  default_time_minutes: number;
  indoor_outdoor_pref: string;
  notify_hour: number;
}

export function settingsToRow(s: FamilySettings): unknown[] {
  return [
    s.familyId,
    j(s.materials),
    s.environment,
    s.defaultTimeMinutes,
    s.indoorOutdoorPref,
    s.notifyHour,
  ];
}

export function rowToSettings(r: SettingsRow): FamilySettings {
  return {
    familyId: r.family_id,
    materials: p(r.materials, []),
    environment: r.environment as FamilySettings['environment'],
    defaultTimeMinutes: r.default_time_minutes,
    indoorOutdoorPref: r.indoor_outdoor_pref as FamilySettings['indoorOutdoorPref'],
    notifyHour: r.notify_hour,
  };
}

// ---- Assignments ----------------------------------------------------------

export interface AssignmentRow {
  id: string;
  child_id: string;
  activity_id: string;
  date: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export function rowToAssignment(r: AssignmentRow): Assignment {
  return {
    id: r.id,
    childId: r.child_id,
    activityId: r.activity_id,
    date: r.date,
    status: r.status as Assignment['status'],
    startedAt: r.started_at,
    completedAt: r.completed_at,
  };
}

// ---- Streaks --------------------------------------------------------------

export interface StreakRow {
  family_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  explorer_level: number;
  xp: number;
}

export function rowToStreak(r: StreakRow): Streak {
  return {
    familyId: r.family_id,
    currentStreak: r.current_streak,
    longestStreak: r.longest_streak,
    lastCompletedDate: r.last_completed_date,
    explorerLevel: r.explorer_level,
    xp: r.xp,
  };
}

// ---- Weekly challenges -----------------------------------------------------

export interface ChallengeProgressRow {
  family_id: string;
  week_key: string;
  challenge_id: string;
  count: number;
  target: number;
  completed_at: string | null;
}

export function challengeProgressToRow(p: WeeklyChallengeProgress): unknown[] {
  return [p.familyId, p.weekKey, p.challengeId, p.count, p.target, p.completedAt];
}

export function rowToChallengeProgress(r: ChallengeProgressRow): WeeklyChallengeProgress {
  return {
    familyId: r.family_id,
    weekKey: r.week_key,
    challengeId: r.challenge_id,
    count: r.count,
    target: r.target,
    completedAt: r.completed_at,
  };
}

// ---- Journal --------------------------------------------------------------

export interface JournalRow {
  id: string;
  assignment_id: string | null;
  child_id: string;
  activity_id: string;
  before_photo_key: string | null;
  after_photo_key: string | null;
  child_comment: string | null;
  learning_note: string | null;
  created_at: string;
}

export function rowToJournal(r: JournalRow): JournalEntry {
  return {
    id: r.id,
    assignmentId: r.assignment_id,
    childId: r.child_id,
    activityId: r.activity_id,
    beforePhotoKey: r.before_photo_key,
    afterPhotoKey: r.after_photo_key,
    childComment: r.child_comment,
    learningNote: r.learning_note,
    createdAt: r.created_at,
  };
}
