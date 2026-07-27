import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { getSubscriptionService } from '@/services/subscription';
import { qk } from '@/api/queryKeys';
import { Button } from '@/components/ui/Button';

const PERKS = [
  { emoji: '♾️', title: 'Unlimited AI adventures', sub: 'Fresh, personalized every day' },
  { emoji: '🚀', title: 'Themed packs', sub: 'Space, Ocean, Dinosaur, Montessori, STEM' },
  { emoji: '🧳', title: 'Travel & Camping modes', sub: 'Adventures for anywhere' },
  { emoji: '🖨️', title: 'Printable worksheets', sub: 'Extend the play off-screen' },
  { emoji: '🍎', title: 'Teacher mode', sub: 'Classroom-ready activity sets' },
];

export default function Paywall() {
  const router = useRouter();
  const qc = useQueryClient();

  const subscribe = async () => {
    await getSubscriptionService().purchase();
    qc.invalidateQueries({ queryKey: qk.entitlement() });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="px-6 pt-6 pb-6 gap-6">
        <Text
          onPress={() => router.back()}
          className="self-end text-base text-ink-soft"
          accessibilityRole="button"
        >
          Close
        </Text>

        <View className="items-center gap-2">
          <Text style={{ fontSize: 56 }}>✨</Text>
          <Text className="text-center text-3xl font-bold text-ink">AdventureBox Premium</Text>
          <Text className="text-center text-base text-ink-soft">
            Everything you need to raise a curious kid, screen-free.
          </Text>
        </View>

        <View className="gap-3">
          {PERKS.map((p) => (
            <View key={p.title} className="flex-row items-center gap-3 rounded-card bg-surface p-4">
              <Text style={{ fontSize: 26 }}>{p.emoji}</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink">{p.title}</Text>
                <Text className="text-sm text-ink-soft">{p.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="gap-2 px-6 pb-2">
        <Button label="Start free trial" onPress={subscribe} />
        <Text className="text-center text-xs text-ink-faint">
          Then $6.99/mo. Cancel anytime. No ads, no tracking of your child.
        </Text>
      </View>
    </SafeAreaView>
  );
}
