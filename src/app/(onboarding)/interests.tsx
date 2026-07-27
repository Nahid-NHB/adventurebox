import { useRouter } from 'expo-router';
import { StepScaffold } from '@/components/onboarding/StepScaffold';
import { SelectableGrid } from '@/components/ui/SelectableGrid';
import { useOnboardingStore } from '@/store/onboarding';
import { INTERESTS, type Interest } from '@/types/domain';
import { INTEREST_LABELS } from '@/lib/labels';

const OPTIONS = INTERESTS.map((v) => ({ value: v, label: INTEREST_LABELS[v] }));

export default function InterestsStep() {
  const router = useRouter();
  const { interests, update } = useOnboardingStore();

  const toggle = (v: Interest) =>
    update({
      interests: interests.includes(v)
        ? interests.filter((x) => x !== v)
        : [...interests, v],
    });

  return (
    <StepScaffold
      step={1}
      total={6}
      title="What do they love?"
      subtitle="Pick a few. Adventures lean into these."
      onContinue={() => router.push('/(onboarding)/materials')}
    >
      <SelectableGrid options={OPTIONS} selected={interests} onToggle={toggle} />
    </StepScaffold>
  );
}
