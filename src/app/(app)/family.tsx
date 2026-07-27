import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChildren } from '@/hooks/useChildren';
import { useStreak } from '@/hooks/useStreak';
import { useSessionStore } from '@/store/session';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { INTEREST_LABELS } from '@/lib/labels';

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl bg-surface p-4">
      <Text className="text-2xl font-bold text-primary">{value}</Text>
      <Text className="text-xs text-ink-soft">{label}</Text>
    </View>
  );
}

export default function FamilyScreen() {
  const { data: children } = useChildren();
  const { data: streak } = useStreak();
  const { activeChildId, setActiveChild } = useSessionStore();

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-2 pb-8 gap-5">
        <Text className="text-2xl font-bold text-ink">Family</Text>

        {/* Streak + level */}
        <View className="flex-row gap-3">
          <StatBox value={`🔥 ${streak?.currentStreak ?? 0}`} label="Day streak" />
          <StatBox value={`L${streak?.explorerLevel ?? 1}`} label="Explorer level" />
          <StatBox value={streak?.xp ?? 0} label="Curiosity XP" />
        </View>

        <Text className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Explorers
        </Text>

        {(children ?? []).map((c) => {
          const active = c.id === activeChildId;
          return (
            <Card key={c.id} className={active ? 'border-2 border-primary' : ''}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-bold text-ink">{c.name}</Text>
                  <Text className="text-sm text-ink-soft">Age {c.age}</Text>
                  <View className="mt-1 flex-row flex-wrap gap-1.5">
                    {c.interests.slice(0, 3).map((i) => (
                      <Pill key={i} label={INTEREST_LABELS[i]} />
                    ))}
                  </View>
                </View>
                {active ? (
                  <Pill label="Active" color="#4C6FE0" />
                ) : (
                  <Text
                    onPress={() => setActiveChild(c.id)}
                    className="text-sm font-semibold text-primary"
                  >
                    Select
                  </Text>
                )}
              </View>
            </Card>
          );
        })}

        <Text className="px-1 text-center text-xs text-ink-faint">
          Cooperative and sibling activities unlock when you add more explorers.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
