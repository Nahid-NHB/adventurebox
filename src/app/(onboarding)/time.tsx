import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { StepScaffold } from '@/components/onboarding/StepScaffold';
import { Chip } from '@/components/ui/Chip';
import { useOnboardingStore } from '@/store/onboarding';
import { TIME_BUDGETS, ENVIRONMENTS, INDOOR_OUTDOOR, ENERGY_LEVELS } from '@/types/domain';
import { titleCase } from '@/lib/labels';

export default function TimeStep() {
  const router = useRouter();
  const {
    defaultTimeMinutes,
    environment,
    indoorOutdoorPref,
    energyDefault,
    update,
  } = useOnboardingStore();

  return (
    <StepScaffold
      step={4}
      total={6}
      title="How's today looking?"
      subtitle="You can change any of this later."
      onContinue={() => router.push('/(onboarding)/review')}
    >
      <View className="gap-3">
        <Text className="text-sm font-semibold text-ink-soft">Time available</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {TIME_BUDGETS.map((t) => (
            <Chip
              key={t}
              label={`${t}${t === 60 ? '+' : ''} min`}
              selected={defaultTimeMinutes === t}
              onPress={() => update({ defaultTimeMinutes: t })}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm font-semibold text-ink-soft">Where you are</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {ENVIRONMENTS.map((e) => (
            <Chip
              key={e}
              label={titleCase(e)}
              selected={environment === e}
              onPress={() => update({ environment: e })}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm font-semibold text-ink-soft">Indoor or outdoor</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {INDOOR_OUTDOOR.map((io) => (
            <Chip
              key={io}
              label={titleCase(io)}
              selected={indoorOutdoorPref === io}
              onPress={() => update({ indoorOutdoorPref: io })}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm font-semibold text-ink-soft">Energy level</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {ENERGY_LEVELS.map((en) => (
            <Chip
              key={en}
              label={titleCase(en)}
              selected={energyDefault === en}
              onPress={() => update({ energyDefault: en })}
            />
          ))}
        </View>
      </View>
    </StepScaffold>
  );
}
