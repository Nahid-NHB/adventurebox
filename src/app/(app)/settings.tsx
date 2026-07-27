import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntitlement, useToggleEntitlement } from '@/hooks/useEntitlement';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { kv } from '@/services/kv';
import { getNotificationService } from '@/services/notifications';

function SettingRow({
  label,
  hint,
  right,
}: {
  label: string;
  hint?: string;
  right: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-3">
      <View className="flex-1">
        <Text className="text-base font-medium text-ink">{label}</Text>
        {hint ? <Text className="text-xs text-ink-soft">{hint}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: entitlement } = useEntitlement();
  const toggleEntitlement = useToggleEntitlement();
  const isPremium = entitlement?.tier === 'premium';

  const [notify, setNotify] = useState(kv.getString('notifyEnabled') !== 'false');
  const onToggleNotify = async (value: boolean) => {
    setNotify(value);
    await kv.set('notifyEnabled', value ? 'true' : 'false');
    await getNotificationService().scheduleDaily({ hour: 9, enabled: value });
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-2 pb-8 gap-5">
        <Text className="text-2xl font-bold text-ink">Settings</Text>

        {/* Subscription */}
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Subscription
          </Text>
          <Card>
            <SettingRow
              label={isPremium ? 'AdventureBox Premium' : 'Free plan'}
              hint={
                isPremium
                  ? 'Unlimited AI adventures + all themed packs'
                  : 'Curated library + limited weekly AI'
              }
              right={
                <Switch
                  value={isPremium}
                  onValueChange={() => toggleEntitlement.mutate()}
                  accessibilityLabel="Toggle premium (demo)"
                />
              }
            />
            {!isPremium ? (
              <View className="mt-2">
                <Button label="See Premium" variant="secondary" onPress={() => router.push('/paywall')} />
              </View>
            ) : null}
          </Card>
          <Text className="px-1 text-xs text-ink-faint">
            Demo build: the switch simulates a subscription. Real billing uses RevenueCat.
          </Text>
        </View>

        {/* Reminders */}
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Reminders
          </Text>
          <Card>
            <SettingRow
              label="Daily adventure reminder"
              hint="One gentle nudge at 9am. Nothing pushy."
              right={
                <Switch
                  value={notify}
                  onValueChange={onToggleNotify}
                  accessibilityLabel="Toggle daily reminder"
                />
              }
            />
          </Card>
        </View>

        {/* Privacy */}
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Privacy & Safety
          </Text>
          <Card>
            <SettingRow label="No ads, ever" right={<Text>✅</Text>} />
            <SettingRow label="No child accounts" hint="COPPA-aware by design" right={<Text>✅</Text>} />
            <SettingRow label="Works offline" right={<Text>✅</Text>} />
            <SettingRow label="No chat or social" right={<Text>✅</Text>} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
