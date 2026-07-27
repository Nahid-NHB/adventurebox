import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { activitiesRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { useEntitlement } from '@/hooks/useEntitlement';
import { Chip } from '@/components/ui/Chip';
import { Pill } from '@/components/ui/Pill';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CATEGORY_COLOR, CATEGORY_EMOJI } from '@/theme/tokens';
import { CATEGORIES, type Category, type Activity } from '@/types/domain';
import { categoryLabel, DIFFICULTY_LABELS } from '@/lib/labels';

export default function LibraryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const { data: entitlement } = useEntitlement();
  const { data: activities } = useQuery({
    queryKey: qk.activities(),
    queryFn: () => activitiesRepo.getAllActivities(),
  });

  const filtered = useMemo(() => {
    const list = activities ?? [];
    return filter === 'all' ? list : list.filter((a) => a.category === filter);
  }, [activities, filter]);

  const isLocked = (a: Activity) =>
    Boolean(a.premiumPack) && entitlement?.tier !== 'premium';

  const renderItem = ({ item }: { item: Activity }) => {
    const color = CATEGORY_COLOR[item.category];
    const locked = isLocked(item);
    return (
      <Pressable
        onPress={() => (locked ? router.push('/paywall') : router.push(`/activity/${item.id}`))}
        className="mb-3 flex-row items-center gap-3 rounded-card bg-surface p-3 active:opacity-80"
      >
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Text style={{ fontSize: 28 }}>{CATEGORY_EMOJI[item.category]}</Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {locked ? '🔒 ' : ''}
            {item.title}
          </Text>
          <View className="flex-row gap-2">
            <Pill label={`${item.minTime}–${item.maxTime} min`} />
            <Pill label={DIFFICULTY_LABELS[item.difficulty]} color={color} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="px-5 pt-2">
        <Text className="text-2xl font-bold text-ink">Library</Text>
      </View>
      <View className="py-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 gap-2"
          data={['all', ...CATEGORIES] as const}
          keyExtractor={(c) => c}
          renderItem={({ item }) => (
            <Chip
              label={item === 'all' ? 'All' : categoryLabel(item)}
              selected={filter === item}
              onPress={() => setFilter(item as Category | 'all')}
            />
          )}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        contentContainerClassName="px-5 pb-8"
        ListEmptyComponent={<EmptyState title="Nothing here yet" emoji="📚" />}
      />
    </SafeAreaView>
  );
}
