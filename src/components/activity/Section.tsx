import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  emoji?: string;
  children: ReactNode;
}

/** Labelled block used throughout the activity detail screen. */
export function Section({ title, emoji, children }: Props) {
  return (
    <View className="gap-3">
      <Text className="text-lg font-bold text-ink">
        {emoji ? `${emoji}  ` : ''}
        {title}
      </Text>
      {children}
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View className="gap-2">
      {items.map((it, i) => (
        <View key={i} className="flex-row gap-2">
          <Text className="text-ink-faint">•</Text>
          <Text className="flex-1 text-base leading-6 text-ink-soft">{it}</Text>
        </View>
      ))}
    </View>
  );
}
