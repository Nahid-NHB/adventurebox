import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useJournal } from '@/hooks/useJournal';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { JournalEntry } from '@/types/domain';

function TimelineItem({ entry }: { entry: JournalEntry }) {
  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return (
    <View className="mb-3 flex-row gap-3">
      <View className="items-center">
        <View className="h-3 w-3 rounded-full bg-primary" />
        <View className="w-0.5 flex-1 bg-black/10" />
      </View>
      <View className="flex-1 rounded-card bg-surface p-4">
        <Text className="text-xs text-ink-faint">{date}</Text>
        {entry.childComment ? (
          <Text className="mt-1 text-base text-ink">“{entry.childComment}”</Text>
        ) : (
          <Text className="mt-1 text-base text-ink">Completed an adventure 🎉</Text>
        )}
        {entry.learningNote ? (
          <Text className="mt-1 text-sm text-ink-soft">{entry.learningNote}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function JournalScreen() {
  const { data: entries } = useJournal();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="flex-row items-start justify-between px-5 pt-2">
        <View>
          <Text className="text-2xl font-bold text-ink">Journal</Text>
          <Text className="text-sm text-ink-soft">Your family's adventure memories.</Text>
        </View>
        <Pressable
          onPress={() => router.push('/add-memory')}
          accessibilityRole="button"
          accessibilityLabel="Add a memory"
          className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80"
        >
          <Text className="text-xl text-white">+</Text>
        </Pressable>
      </View>
      <FlatList
        data={entries ?? []}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <TimelineItem entry={item} />}
        contentContainerClassName="px-5 pt-5 pb-8"
        ListEmptyComponent={
          <EmptyState
            emoji="📸"
            title="No memories yet"
            subtitle="Complete an adventure and add a note to start your journal."
          />
        }
      />
    </SafeAreaView>
  );
}
