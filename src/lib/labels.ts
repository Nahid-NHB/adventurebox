/** Human-readable labels for enum values shown in the UI. */
import type {
  Category,
  Difficulty,
  Interest,
  LearningGoal,
  Material,
  Skill,
} from '@/types/domain';

export const MATERIAL_LABELS: Record<Material, string> = {
  paper: 'Paper',
  tape: 'Tape',
  glue: 'Glue',
  lego: 'LEGO',
  markers: 'Markers',
  boxes: 'Boxes',
  water: 'Water',
  balloons: 'Balloons',
  kitchen: 'Kitchen items',
  scissors: 'Scissors',
  string: 'String',
  containers: 'Containers',
};

export const INTEREST_LABELS: Record<Interest, string> = {
  dinosaurs: 'Dinosaurs',
  animals: 'Animals',
  science: 'Science',
  space: 'Space',
  art: 'Art',
  sports: 'Sports',
  music: 'Music',
  reading: 'Reading',
  nature: 'Nature',
  building: 'Building',
  cooking: 'Cooking',
  vehicles: 'Vehicles',
};

export const GOAL_LABELS: Record<LearningGoal, string> = {
  confidence: 'Confidence',
  reading: 'Reading',
  stem: 'STEM',
  creativity: 'Creativity',
  problem_solving: 'Problem solving',
  social: 'Social skills',
  language: 'Language',
  motor: 'Motor skills',
};

export const SKILL_LABELS: Record<Skill, string> = {
  confidence: 'Confidence',
  reading: 'Reading',
  stem: 'STEM',
  creativity: 'Creativity',
  problem_solving: 'Problem solving',
  social: 'Social',
  language: 'Language',
  motor: 'Motor',
  engineering: 'Engineering',
  physics: 'Physics',
  observation: 'Observation',
  focus: 'Focus',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Challenge',
};

export function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function categoryLabel(c: Category): string {
  return titleCase(c);
}
