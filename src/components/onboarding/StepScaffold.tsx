import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Button } from '@/components/ui/Button';

interface Props {
  step: number; // zero-based
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

/** Shared full-bleed onboarding step layout: progress, prompt, body, CTA. */
export function StepScaffold({
  step,
  total,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <View className="px-6 pt-4">
        <ProgressDots total={total} current={step} />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-8 pb-6 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-ink">{title}</Text>
          {subtitle ? <Text className="text-base text-ink-soft">{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
      <View className="px-6 pb-2">
        <Button label={continueLabel} onPress={onContinue} disabled={continueDisabled} />
      </View>
    </SafeAreaView>
  );
}
