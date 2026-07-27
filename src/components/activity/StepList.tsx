import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  steps: string[];
}

/** Checkable step list. Local check state only (no persistence needed). */
export function StepList({ steps }: Props) {
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));

  return (
    <View className="gap-3">
      {steps.map((step, i) => (
        <Pressable
          key={i}
          onPress={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done[i] }}
          accessibilityLabel={`Step ${i + 1}: ${step}`}
          className="flex-row items-start gap-3 active:opacity-70"
        >
          <View
            className={`mt-0.5 h-7 w-7 items-center justify-center rounded-full ${
              done[i] ? 'bg-teal' : 'bg-black/5'
            }`}
          >
            <Text className={`text-sm font-bold ${done[i] ? 'text-white' : 'text-ink-faint'}`}>
              {done[i] ? '✓' : i + 1}
            </Text>
          </View>
          <Text
            className={`flex-1 text-base leading-6 ${
              done[i] ? 'text-ink-faint line-through' : 'text-ink'
            }`}
          >
            {step}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
