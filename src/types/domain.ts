/**
 * Domain model — the single source of truth for AdventureBox entities.
 * Zod schemas double as runtime validators (AI output, form input, DB rows)
 * and as the origin of our TypeScript types via z.infer.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enumerations (kept as const arrays so UIs can iterate them)
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  'science',
  'engineering',
  'art',
  'nature',
  'cooking',
  'math',
  'reading',
  'writing',
  'physical',
  'outdoor',
  'sensory',
  'music',
  'storytelling',
  'teamwork',
  'mindfulness',
  'problem_solving',
  'recycling',
  'diy',
  'photography',
  'logic',
] as const;

export const SKILLS = [
  'confidence',
  'reading',
  'stem',
  'creativity',
  'problem_solving',
  'social',
  'language',
  'motor',
  'engineering',
  'physics',
  'observation',
  'focus',
] as const;

export const MATERIALS = [
  'paper',
  'tape',
  'glue',
  'lego',
  'markers',
  'boxes',
  'water',
  'balloons',
  'kitchen',
  'scissors',
  'string',
  'containers',
] as const;

export const LEARNING_GOALS = [
  'confidence',
  'reading',
  'stem',
  'creativity',
  'problem_solving',
  'social',
  'language',
  'motor',
] as const;

export const INTERESTS = [
  'dinosaurs',
  'animals',
  'science',
  'space',
  'art',
  'sports',
  'music',
  'reading',
  'nature',
  'building',
  'cooking',
  'vehicles',
] as const;

export const ENVIRONMENTS = ['apartment', 'garden', 'park'] as const;
export const INDOOR_OUTDOOR = ['indoor', 'outdoor', 'either'] as const;
export const ENERGY_LEVELS = ['calm', 'medium', 'active'] as const;
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const WEATHER_TAGS = ['sunny', 'rainy', 'cold', 'windy', 'hot', 'any'] as const;
export const TIME_BUDGETS = [10, 20, 30, 45, 60] as const;
export const ACTIVITY_SOURCES = ['curated', 'ai'] as const;
export const ACTIVITY_STATUS = ['draft', 'approved', 'rejected'] as const;
export const ASSIGNMENT_STATUS = ['suggested', 'started', 'completed', 'skipped'] as const;

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const CategorySchema = z.enum(CATEGORIES);
export const SkillSchema = z.enum(SKILLS);
export const MaterialSchema = z.enum(MATERIALS);
export const LearningGoalSchema = z.enum(LEARNING_GOALS);
export const InterestSchema = z.enum(INTERESTS);
export const EnvironmentSchema = z.enum(ENVIRONMENTS);
export const IndoorOutdoorSchema = z.enum(INDOOR_OUTDOOR);
export const EnergySchema = z.enum(ENERGY_LEVELS);
export const DifficultySchema = z.enum(DIFFICULTIES);
export const WeatherTagSchema = z.enum(WEATHER_TAGS);

/**
 * ActivityDraft is what the AI must return. It is the human-authored activity
 * shape minus system fields (id/source/status/timestamps). The safety gate and
 * matching engine both operate on the full Activity.
 */
export const ActivityDraftSchema = z.object({
  title: z.string().min(3).max(80),
  storyIntro: z.string().min(10).max(600),
  mission: z.string().min(5).max(300),
  objective: z.string().min(3).max(200),
  steps: z.array(z.string().min(3).max(300)).min(1).max(12),
  safetyTips: z.array(z.string().min(3).max(200)).max(6),
  learningExplanation: z.string().min(10).max(600),
  reflectionQuestions: z.array(z.string().min(5).max(200)).min(1).max(6),
  parentTip: z.string().max(300).optional(),
  category: CategorySchema,
  skills: z.array(SkillSchema).min(1).max(6),
  minAge: z.number().int().min(2).max(14),
  maxAge: z.number().int().min(2).max(16),
  minTime: z.number().int().min(5).max(120),
  maxTime: z.number().int().min(5).max(180),
  materialsRequired: z.array(MaterialSchema).max(8),
  indoorOutdoor: IndoorOutdoorSchema,
  weatherTags: z.array(WeatherTagSchema).min(1),
  energyLevel: EnergySchema,
  difficulty: DifficultySchema,
});

export const ActivitySchema = ActivityDraftSchema.extend({
  id: z.string(),
  source: z.enum(ACTIVITY_SOURCES),
  status: z.enum(ACTIVITY_STATUS),
  premiumPack: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const ChildSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  name: z.string().min(1).max(40),
  age: z.number().int().min(2).max(14),
  avatarKey: z.string().optional(),
  interests: z.array(InterestSchema),
  favoriteColors: z.array(z.string()),
  learningGoals: z.array(LearningGoalSchema),
  energyDefault: EnergySchema,
});

export const FamilySettingsSchema = z.object({
  familyId: z.string(),
  materials: z.array(MaterialSchema),
  environment: EnvironmentSchema,
  defaultTimeMinutes: z.number().int(),
  indoorOutdoorPref: IndoorOutdoorSchema,
  notifyHour: z.number().int().min(0).max(23).default(9),
});

export const AssignmentSchema = z.object({
  id: z.string(),
  childId: z.string(),
  activityId: z.string(),
  date: z.string(), // YYYY-MM-DD
  status: z.enum(ASSIGNMENT_STATUS),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export const StreakSchema = z.object({
  familyId: z.string(),
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  lastCompletedDate: z.string().nullable(),
  explorerLevel: z.number().int(),
  xp: z.number().int(),
});

export const JournalEntrySchema = z.object({
  id: z.string(),
  assignmentId: z.string().nullable(),
  childId: z.string(),
  activityId: z.string(),
  beforePhotoKey: z.string().nullable(),
  afterPhotoKey: z.string().nullable(),
  childComment: z.string().nullable(),
  learningNote: z.string().nullable(),
  createdAt: z.string(),
});

/**
 * A weekly challenge is a gentle, family-scoped goal ("do 3 outdoor adventures
 * this week"). The definitions are curated and static (see lib/weeklyChallenge);
 * only the per-week progress is persisted and synced.
 */
export const WeeklyChallengeProgressSchema = z.object({
  familyId: z.string(),
  weekKey: z.string(), // e.g. "2026-W30"
  challengeId: z.string(),
  count: z.number().int().min(0),
  target: z.number().int().min(1),
  completedAt: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Category = z.infer<typeof CategorySchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type LearningGoal = z.infer<typeof LearningGoalSchema>;
export type Interest = z.infer<typeof InterestSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type IndoorOutdoor = z.infer<typeof IndoorOutdoorSchema>;
export type Energy = z.infer<typeof EnergySchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type WeatherTag = z.infer<typeof WeatherTagSchema>;

export type ActivityDraft = z.infer<typeof ActivityDraftSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Child = z.infer<typeof ChildSchema>;
export type FamilySettings = z.infer<typeof FamilySettingsSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type Streak = z.infer<typeof StreakSchema>;
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type WeeklyChallengeProgress = z.infer<typeof WeeklyChallengeProgressSchema>;

/** Context passed to both the matching engine and the AI generation pipeline. */
export interface GenContext {
  child: Pick<Child, 'age' | 'interests' | 'learningGoals' | 'energyDefault'>;
  materials: Material[];
  environment: Environment;
  timeBudget: number;
  weather: WeatherTag;
  indoorOutdoorPref: IndoorOutdoor;
  /** Fingerprints of recently served activities, to avoid repeats. */
  recentFingerprints: string[];
  /** Rolling completion success 0..1, used to nudge difficulty. */
  successRate: number;
}
