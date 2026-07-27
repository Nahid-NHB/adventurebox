import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { StepScaffold } from '@/components/onboarding/StepScaffold';
import { Card } from '@/components/ui/Card';
import { useOnboardingStore } from '@/store/onboarding';
import { useCompleteOnboarding } from '@/hooks/useCompleteOnboarding';
import { INTEREST_LABELS, GOAL_LABELS, MATERIAL_LABELS } from '@/lib/labels';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4 py-1.5">
      <Text className="text-sm text-ink-soft">{label}</Text>
      <Text className="flex-1 text-right text-sm font-medium text-ink">{value || '—'}</Text>
    </View>
  );
}

export default function ReviewStep() {
  const router = useRouter();
  const draft = useOnboardingStore();
  const complete = useCompleteOnboarding();

  const finish = async () => {
    await complete.mutateAsync();
    router.replace('/(app)');
  };

  return (
    <StepScaffold
      step={5}
      total={6}
      title="Ready to explore?"
      subtitle="Here's the plan. Adventures start now."
      onContinue={finish}
      continueLabel={complete.isPending ? 'Setting up…' : "Let's go"}
      continueDisabled={complete.isPending}
    >
      <Card>
        <Row label="Explorer" value={`${draft.childName || 'Explorer'}, age ${draft.age}`} />
        <Row label="Loves" value={draft.interests.map((i) => INTEREST_LABELS[i]).join(', ')} />
        <Row label="Goals" value={draft.learningGoals.map((g) => GOAL_LABELS[g]).join(', ')} />
        <Row label="Materials" value={draft.materials.map((m) => MATERIAL_LABELS[m]).join(', ')} />
        <Row label="Daily time" value={`${draft.defaultTimeMinutes} min`} />
        <Row label="Setting" value={`${draft.environment} · ${draft.indoorOutdoorPref}`} />
      </Card>
      <Text className="px-1 text-center text-xs text-ink-faint">
        No ads. No child accounts. Everything works offline.
      </Text>
    </StepScaffold>
  );
}
