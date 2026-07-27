/**
 * Onboarding draft store. Buffers the multi-step answers before we commit them
 * to SQLite in one write at the end. Kept separate from session so an abandoned
 * onboarding leaves no partial rows.
 */
import { create } from 'zustand';
import type {
  Energy,
  Environment,
  IndoorOutdoor,
  Interest,
  LearningGoal,
  Material,
} from '@/types/domain';

export interface OnboardingDraft {
  childName: string;
  age: number;
  interests: Interest[];
  favoriteColors: string[];
  materials: Material[];
  environment: Environment;
  indoorOutdoorPref: IndoorOutdoor;
  learningGoals: LearningGoal[];
  defaultTimeMinutes: number;
  energyDefault: Energy;
}

interface OnboardingState extends OnboardingDraft {
  update: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

const initial: OnboardingDraft = {
  childName: '',
  age: 5,
  interests: [],
  favoriteColors: [],
  materials: ['paper', 'tape', 'markers'],
  environment: 'apartment',
  indoorOutdoorPref: 'either',
  learningGoals: [],
  defaultTimeMinutes: 20,
  energyDefault: 'medium',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  update: (patch) => set(patch),
  reset: () => set(initial),
}));
