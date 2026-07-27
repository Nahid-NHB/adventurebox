// Mirrors src/types/domain.ts on the app side. Kept in sync by hand; these are
// the controlled vocabularies the activity form and filters use. If the app
// enums change, update these too.

export const CATEGORIES = [
  'science', 'engineering', 'art', 'nature', 'cooking', 'math', 'reading',
  'writing', 'physical', 'outdoor', 'sensory', 'music', 'storytelling',
  'teamwork', 'mindfulness', 'problem_solving', 'recycling', 'diy',
  'photography', 'logic',
] as const;

export const SKILLS = [
  'confidence', 'reading', 'stem', 'creativity', 'problem_solving', 'social',
  'language', 'motor', 'engineering', 'physics', 'observation', 'focus',
] as const;

export const MATERIALS = [
  'paper', 'tape', 'glue', 'lego', 'markers', 'boxes', 'water', 'balloons',
  'kitchen', 'scissors', 'string', 'containers',
] as const;

export const INDOOR_OUTDOOR = ['indoor', 'outdoor', 'either'] as const;
export const ENERGY_LEVELS = ['calm', 'medium', 'active'] as const;
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const WEATHER_TAGS = ['sunny', 'rainy', 'cold', 'windy', 'hot', 'any'] as const;
export const ACTIVITY_SOURCES = ['curated', 'ai'] as const;
export const ACTIVITY_STATUS = ['draft', 'approved', 'rejected'] as const;

export type Category = (typeof CATEGORIES)[number];
export type ActivitySource = (typeof ACTIVITY_SOURCES)[number];
export type ActivityStatus = (typeof ACTIVITY_STATUS)[number];
