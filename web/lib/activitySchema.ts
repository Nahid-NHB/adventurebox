import { z } from 'zod';
import {
  CATEGORIES, SKILLS, MATERIALS, INDOOR_OUTDOOR, ENERGY_LEVELS,
  DIFFICULTIES, WEATHER_TAGS, ACTIVITY_STATUS,
} from './enums';

// Server-side validation for the activity editor. Mirrors ActivityDraftSchema in
// the app (src/types/domain.ts) so what the CMS writes is exactly what the app
// expects to read. Curated activities authored here are the same shape the seed
// library ships.

export const activityInput = z.object({
  id: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/, 'lowercase, digits and dashes only'),
  title: z.string().min(3).max(80),
  storyIntro: z.string().min(10).max(600),
  mission: z.string().min(5).max(300),
  objective: z.string().min(3).max(200),
  steps: z.array(z.string().min(3).max(300)).min(1).max(12),
  safetyTips: z.array(z.string().min(3).max(200)).max(6),
  learningExplanation: z.string().min(10).max(600),
  reflectionQuestions: z.array(z.string().min(5).max(200)).min(1).max(6),
  parentTip: z.string().max(300).optional().nullable(),
  category: z.enum(CATEGORIES),
  skills: z.array(z.enum(SKILLS)).min(1).max(6),
  minAge: z.number().int().min(2).max(14),
  maxAge: z.number().int().min(2).max(16),
  minTime: z.number().int().min(5).max(120),
  maxTime: z.number().int().min(5).max(180),
  materialsRequired: z.array(z.enum(MATERIALS)).max(8),
  indoorOutdoor: z.enum(INDOOR_OUTDOOR),
  weatherTags: z.array(z.enum(WEATHER_TAGS)).min(1),
  energyLevel: z.enum(ENERGY_LEVELS),
  difficulty: z.enum(DIFFICULTIES),
  status: z.enum(ACTIVITY_STATUS),
  premiumPack: z.string().max(40).optional().nullable(),
}).refine((v) => v.maxAge >= v.minAge, {
  message: 'maxAge must be >= minAge', path: ['maxAge'],
}).refine((v) => v.maxTime >= v.minTime, {
  message: 'maxTime must be >= minTime', path: ['maxTime'],
});

export type ActivityInput = z.infer<typeof activityInput>;

// snake_case DB row <-> camelCase form. The app's sync layer uses the same
// mapping (src/services/sync/supabase.ts toRow), kept consistent here.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToInput(r: any): ActivityInput {
  return {
    id: r.id,
    title: r.title,
    storyIntro: r.story_intro,
    mission: r.mission,
    objective: r.objective,
    steps: r.steps ?? [],
    safetyTips: r.safety_tips ?? [],
    learningExplanation: r.learning_explanation,
    reflectionQuestions: r.reflection_questions ?? [],
    parentTip: r.parent_tip ?? null,
    category: r.category,
    skills: r.skills ?? [],
    minAge: r.min_age,
    maxAge: r.max_age,
    minTime: r.min_time,
    maxTime: r.max_time,
    materialsRequired: r.materials_required ?? [],
    indoorOutdoor: r.indoor_outdoor,
    weatherTags: r.weather_tags ?? [],
    energyLevel: r.energy_level,
    difficulty: r.difficulty,
    status: r.status,
    premiumPack: r.premium_pack ?? null,
  };
}

export function inputToRow(v: ActivityInput): Record<string, unknown> {
  return {
    id: v.id,
    // Curated rows are public (family_id null). The CMS only authors curated
    // library content; AI rows come from the generation pipeline.
    family_id: null,
    source: 'curated',
    status: v.status,
    premium_pack: v.premiumPack || null,
    title: v.title,
    story_intro: v.storyIntro,
    mission: v.mission,
    objective: v.objective,
    steps: v.steps,
    safety_tips: v.safetyTips,
    learning_explanation: v.learningExplanation,
    reflection_questions: v.reflectionQuestions,
    parent_tip: v.parentTip || null,
    category: v.category,
    skills: v.skills,
    min_age: v.minAge,
    max_age: v.maxAge,
    min_time: v.minTime,
    max_time: v.maxTime,
    materials_required: v.materialsRequired,
    indoor_outdoor: v.indoorOutdoor,
    weather_tags: v.weatherTags,
    energy_level: v.energyLevel,
    difficulty: v.difficulty,
  };
}

// Parse a form submission (all string/array fields) into typed input.
export function parseForm(fd: FormData): ActivityInput {
  const arr = (name: string): string[] => fd.getAll(name).map(String).filter(Boolean);
  const lines = (name: string): string[] =>
    String(fd.get(name) ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
  const num = (name: string): number => Number(fd.get(name));

  return activityInput.parse({
    id: String(fd.get('id') ?? '').trim(),
    title: String(fd.get('title') ?? '').trim(),
    storyIntro: String(fd.get('storyIntro') ?? '').trim(),
    mission: String(fd.get('mission') ?? '').trim(),
    objective: String(fd.get('objective') ?? '').trim(),
    steps: lines('steps'),
    safetyTips: lines('safetyTips'),
    learningExplanation: String(fd.get('learningExplanation') ?? '').trim(),
    reflectionQuestions: lines('reflectionQuestions'),
    parentTip: String(fd.get('parentTip') ?? '').trim() || null,
    category: fd.get('category'),
    skills: arr('skills'),
    minAge: num('minAge'),
    maxAge: num('maxAge'),
    minTime: num('minTime'),
    maxTime: num('maxTime'),
    materialsRequired: arr('materialsRequired'),
    indoorOutdoor: fd.get('indoorOutdoor'),
    weatherTags: arr('weatherTags'),
    energyLevel: fd.get('energyLevel'),
    difficulty: fd.get('difficulty'),
    status: fd.get('status'),
    premiumPack: String(fd.get('premiumPack') ?? '').trim() || null,
  });
}
