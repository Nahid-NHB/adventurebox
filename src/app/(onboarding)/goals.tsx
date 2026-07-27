import { useRouter } from 'expo-router';
import { StepScaffold } from '@/components/onboarding/StepScaffold';
import { SelectableGrid } from '@/components/ui/SelectableGrid';
import { useOnboardingStore } from '@/store/onboarding';
import { LEARNING_GOALS, type LearningGoal } from '@/types/domain';
import { GOAL_LABELS } from '@/lib/labels';

const OPTIONS = LEARNING_GOALS.map((v) => ({ value: v, label: GOAL_LABELS[v] }));

export default function GoalsStep() {
  const router = useRouter();
  const { learningGoals, update } = useOnboardingStore();

  const toggle = (v: LearningGoal) =>
    update({
      learningGoals: learningGoals.includes(v)
        ? learningGoals.filter((x) => x !== v)
        : [...learningGoals, v],
    });

  return (
    <StepScaffold
      step={3}
      total={6}
      title="What should they grow?"
      subtitle="Adventures nudge these skills over time."
      onContinue={() => router.push('/(onboarding)/time')}
    >
      <SelectableGrid options={OPTIONS} selected={learningGoals} onToggle={toggle} />
    </StepScaffold>
  );
}
