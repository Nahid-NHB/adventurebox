import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Activity } from '@/types/domain';
import { CATEGORY_COLOR, CATEGORY_EMOJI } from '@/theme/tokens';
import { Pill } from '@/components/ui/Pill';
import { DIFFICULTY_LABELS, SKILL_LABELS, MATERIAL_LABELS, categoryLabel } from '@/lib/labels';

interface Props {
  activity: Activity;
}

/** The hero "Today's Adventure" card. Large illustration, title, quick facts. */
export function AdventureCard({ activity }: Props) {
  const color = CATEGORY_COLOR[activity.category];
  const time =
    activity.minTime === activity.maxTime
      ? `${activity.minTime} min`
      : `${activity.minTime}–${activity.maxTime} min`;

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <View
        className="overflow-hidden rounded-card bg-surface"
        style={{
          shadowColor: '#26221D',
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        }}
      >
        {/* Illustration band */}
        <View
          className="h-44 items-center justify-center"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Text style={{ fontSize: 72 }}>{CATEGORY_EMOJI[activity.category]}</Text>
          <View className="absolute right-3 top-3">
            <Pill label={categoryLabel(activity.category)} color={color} />
          </View>
        </View>

        <View className="gap-3 p-5">
          <Text className="text-2xl font-bold leading-tight text-ink">
            {activity.title}
          </Text>

          <View className="flex-row items-center gap-2">
            <Pill label={`⏱ ${time}`} />
            <Pill label={DIFFICULTY_LABELS[activity.difficulty]} color={color} />
          </View>

          <Text className="text-sm text-ink-soft">
            <Text className="font-semibold text-ink-soft">Skills: </Text>
            {activity.skills.map((s) => SKILL_LABELS[s]).join(' · ')}
          </Text>

          <Text className="text-sm text-ink-soft">
            <Text className="font-semibold text-ink-soft">Need: </Text>
            {activity.materialsRequired.length === 0
              ? 'Nothing but curiosity'
              : activity.materialsRequired.map((m) => MATERIAL_LABELS[m]).join(', ')}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
