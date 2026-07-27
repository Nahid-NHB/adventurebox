import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { StepScaffold } from '@/components/onboarding/StepScaffold';
import { useOnboardingStore } from '@/store/onboarding';

export default function ChildStep() {
  const router = useRouter();
  const { childName, age, update } = useOnboardingStore();

  return (
    <StepScaffold
      step={0}
      total={6}
      title="Who's the explorer?"
      subtitle="We'll personalize every adventure for them."
      onContinue={() => router.push('/(onboarding)/interests')}
      continueDisabled={childName.trim().length === 0}
    >
      <View className="gap-3">
        <Text className="text-sm font-semibold text-ink-soft">Child's name</Text>
        <TextInput
          value={childName}
          onChangeText={(t) => update({ childName: t })}
          placeholder="e.g. Mia"
          placeholderTextColor="#A69F93"
          className="rounded-2xl border border-black/10 bg-surface px-4 py-4 text-lg text-ink"
          autoFocus
          returnKeyType="done"
        />
      </View>

      <View className="gap-3">
        <Text className="text-sm font-semibold text-ink-soft">Age: {age}</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {Array.from({ length: 11 }, (_, i) => i + 2).map((a) => (
            <Pressable
              key={a}
              onPress={() => update({ age: a })}
              accessibilityRole="button"
              accessibilityLabel={`Age ${a}`}
              className={`h-12 w-12 items-center justify-center rounded-full ${
                age === a ? 'bg-primary' : 'bg-surface border border-black/10'
              }`}
            >
              <Text className={`text-base font-semibold ${age === a ? 'text-white' : 'text-ink-soft'}`}>
                {a}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </StepScaffold>
  );
}
