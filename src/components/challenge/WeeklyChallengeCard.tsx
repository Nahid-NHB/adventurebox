import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { WeeklyChallengeProgress } from '@/types/domain';
import type { WeeklyChallengeDef } from '@/lib/weeklyChallenge';
import { isChallengeComplete } from '@/lib/weeklyChallenge';

interface Props {
  def: WeeklyChallengeDef;
  progress: WeeklyChallengeProgress;
}

/**
 * Compact weekly-goal card for Home and Family. Shows the theme, a gentle
 * progress bar, and a completed state. No countdown timers or pressure.
 */
export function WeeklyChallengeCard({ def, progress }: Props) {
  const done = isChallengeComplete(progress);
  const pct = Math.min(1, progress.count / progress.target);

  return (
    <Card>
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              This week's challenge
            </Text>
            <Text className="mt-0.5 text-lg font-bold text-ink">
              {def.reward} {def.title}
            </Text>
            <Text className="text-sm text-ink-soft">{def.description}</Text>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-primary">
              {progress.count}/{progress.target}
            </Text>
            {done ? (
              <Text className="text-xs font-semibold text-primary">Done! +{def.bonusXp} XP</Text>
            ) : null}
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-2.5 overflow-hidden rounded-pill bg-black/5">
          <View
            className={`h-full rounded-pill ${done ? 'bg-primary' : 'bg-primary/70'}`}
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </View>
      </View>
    </Card>
  );
}
