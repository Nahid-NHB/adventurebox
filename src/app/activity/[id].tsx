import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActivity } from '@/hooks/useActivity';
import { useActiveChild } from '@/hooks/useChildren';
import { useCompleteActivity } from '@/hooks/useCompleteActivity';
import { StepList } from '@/components/activity/StepList';
import { Section, BulletList } from '@/components/activity/Section';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { CATEGORY_COLOR, CATEGORY_EMOJI } from '@/theme/tokens';
import { DIFFICULTY_LABELS, SKILL_LABELS, categoryLabel } from '@/lib/labels';

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: activity, isLoading } = useActivity(id);
  const child = useActiveChild();
  const complete = useCompleteActivity();
  const [done, setDone] = useState(false);

  if (isLoading || !activity) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <Text className="text-ink-faint">{isLoading ? 'Loading…' : 'Activity not found'}</Text>
      </SafeAreaView>
    );
  }

  const color = CATEGORY_COLOR[activity.category];

  const onComplete = async () => {
    if (child) {
      await complete.mutateAsync({ childId: child.id, activityId: activity.id });
    }
    setDone(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-70"
        >
          <Text className="text-xl text-ink">‹</Text>
        </Pressable>
        <Pill label={categoryLabel(activity.category)} color={color} />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-8 gap-6">
        {/* Hero */}
        <View
          className="h-40 items-center justify-center rounded-card"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Text style={{ fontSize: 64 }}>{CATEGORY_EMOJI[activity.category]}</Text>
        </View>

        <View className="gap-2">
          <Text className="text-3xl font-bold text-ink">{activity.title}</Text>
          <View className="flex-row gap-2">
            <Pill label={`⏱ ${activity.minTime}–${activity.maxTime} min`} />
            <Pill label={DIFFICULTY_LABELS[activity.difficulty]} color={color} />
          </View>
        </View>

        {/* Story */}
        <View
          className="rounded-card p-4"
          style={{ backgroundColor: `${color}12` }}
        >
          <Text className="text-base italic leading-6 text-ink-soft">{activity.storyIntro}</Text>
        </View>

        <Section title="The Mission" emoji="🎯">
          <Text className="text-base leading-6 text-ink">{activity.mission}</Text>
          <View className="rounded-2xl bg-teal/10 p-4">
            <Text className="text-sm font-semibold text-teal">Goal</Text>
            <Text className="text-base text-ink">{activity.objective}</Text>
          </View>
        </Section>

        <Section title="Steps" emoji="🪜">
          <StepList steps={activity.steps} />
        </Section>

        {activity.safetyTips.length > 0 ? (
          <Section title="Stay Safe" emoji="🦺">
            <BulletList items={activity.safetyTips} />
          </Section>
        ) : null}

        <Section title="Why This Matters" emoji="🧠">
          <Text className="text-base leading-6 text-ink-soft">{activity.learningExplanation}</Text>
          <View className="flex-row flex-wrap gap-2 pt-1">
            {activity.skills.map((s) => (
              <Pill key={s} label={SKILL_LABELS[s]} color={color} />
            ))}
          </View>
        </Section>

        {activity.parentTip ? (
          <View className="rounded-card bg-sand/20 p-4">
            <Text className="text-sm font-bold text-ink">💡 Parent Tip</Text>
            <Text className="text-base leading-6 text-ink-soft">{activity.parentTip}</Text>
          </View>
        ) : null}

        <Section title="Talk About It" emoji="💬">
          <BulletList items={activity.reflectionQuestions} />
        </Section>

        {done ? (
          <View className="items-center gap-2 rounded-card bg-teal/10 p-6">
            <Text style={{ fontSize: 44 }}>🎉</Text>
            <Text className="text-lg font-bold text-ink">Adventure complete!</Text>
            <Text className="text-center text-sm text-ink-soft">
              Great exploring together. Come back tomorrow for a new one.
            </Text>
            <View className="mt-2 w-full gap-2">
              <Button
                label="📸 Add photo memory"
                onPress={() => router.replace(`/add-memory?activityId=${activity.id}`)}
              />
              <Button label="Back to Today" variant="secondary" onPress={() => router.back()} />
            </View>
          </View>
        ) : (
          <Button
            label={complete.isPending ? 'Saving…' : 'Mark Complete'}
            onPress={onComplete}
            disabled={complete.isPending}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
