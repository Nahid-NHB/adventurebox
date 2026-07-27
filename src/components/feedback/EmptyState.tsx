import { Text, View } from 'react-native';

interface Props {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji = '🧭', title, subtitle }: Props) {
  return (
    <View className="items-center justify-center gap-2 px-8 py-16">
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text className="text-center text-lg font-semibold text-ink">{title}</Text>
      {subtitle ? (
        <Text className="text-center text-sm text-ink-soft">{subtitle}</Text>
      ) : null}
    </View>
  );
}
