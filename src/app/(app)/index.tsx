import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveChild } from '@/hooks/useChildren';
import { useTodaysAdventure } from '@/hooks/useTodaysAdventure';
import { useBackgroundGeneration } from '@/hooks/useBackgroundGeneration';
import { useStreak } from '@/hooks/useStreak';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { useSessionStore } from '@/store/session';
import { AdventureCard } from '@/components/activity/AdventureCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { greeting } from '@/lib/date';

function IconAction({
  emoji,
  label,
  active,
  onPress,
}: {
  emoji: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-1 items-center gap-1 py-2 active:opacity-60"
    >
      <Text style={{ fontSize: 22, opacity: active ? 1 : 0.85 }}>{emoji}</Text>
      <Text className={`text-xs ${active ? 'text-primary' : 'text-ink-soft'}`}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const child = useActiveChild();
  useBackgroundGeneration(child);
  const { data: activity, isLoading } = useTodaysAdventure(child);
  const { data: streak } = useStreak();
  const { data: favorites } = useFavorites();
  const toggleFav = useToggleFavorite();
  const nextPick = useSessionStore((s) => s.nextPick);

  const isFav = activity ? favorites?.includes(activity.id) : false;

  const onShare = () => {
    if (!activity) return;
    void Share.share({
      message: `Today's adventure from AdventureBox: "${activity.title}" — ${activity.mission}`,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-8 pt-2 gap-5">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-ink-soft">{greeting()}</Text>
            <Text className="text-2xl font-bold text-ink">
              {child ? child.name : 'Explorer'} 👋
            </Text>
          </View>
          {streak && streak.currentStreak > 0 ? (
            <View className="rounded-pill bg-coral/15 px-4 py-2">
              <Text className="text-sm font-bold text-coral">🔥 {streak.currentStreak}d</Text>
            </View>
          ) : null}
        </View>

        <Text className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Today's Adventure
        </Text>

        {isLoading ? (
          <View className="h-80 items-center justify-center rounded-card bg-black/5">
            <Text className="text-ink-faint">Finding the perfect adventure…</Text>
          </View>
        ) : activity ? (
          <>
            <Pressable onPress={() => router.push(`/activity/${activity.id}`)}>
              <AdventureCard activity={activity} />
            </Pressable>

            <Button
              label="Start Adventure"
              onPress={() => router.push(`/activity/${activity.id}`)}
              accessibilityHint="Opens the step-by-step instructions"
            />

            <View className="flex-row rounded-card bg-surface px-2 py-1">
              <IconAction
                emoji={isFav ? '⭐' : '☆'}
                label="Favorite"
                active={isFav}
                onPress={() => toggleFav.mutate(activity.id)}
              />
              <IconAction emoji="🔗" label="Share" onPress={onShare} />
              <IconAction emoji="🔄" label="Another" onPress={nextPick} />
            </View>
          </>
        ) : (
          <EmptyState
            title="No adventure yet"
            subtitle="Add a child in the Family tab to get started."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
