import { useRouter } from 'expo-router';
import { StepScaffold } from '@/components/onboarding/StepScaffold';
import { SelectableGrid } from '@/components/ui/SelectableGrid';
import { useOnboardingStore } from '@/store/onboarding';
import { MATERIALS, type Material } from '@/types/domain';
import { MATERIAL_LABELS } from '@/lib/labels';

const OPTIONS = MATERIALS.map((v) => ({ value: v, label: MATERIAL_LABELS[v] }));

export default function MaterialsStep() {
  const router = useRouter();
  const { materials, update } = useOnboardingStore();

  const toggle = (v: Material) =>
    update({
      materials: materials.includes(v)
        ? materials.filter((x) => x !== v)
        : [...materials, v],
    });

  return (
    <StepScaffold
      step={2}
      total={6}
      title="What's at home?"
      subtitle="We only suggest activities you can actually do."
      onContinue={() => router.push('/(onboarding)/goals')}
    >
      <SelectableGrid options={OPTIONS} selected={materials} onToggle={toggle} />
    </StepScaffold>
  );
}
