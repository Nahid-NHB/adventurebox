import { View } from 'react-native';

interface Props {
  total: number;
  current: number; // zero-based
}

export function ProgressDots({ total, current }: Props) {
  return (
    <View className="flex-row items-center gap-2" accessibilityLabel={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-2 rounded-pill ${i === current ? 'w-6 bg-primary' : 'w-2 bg-black/15'}`}
        />
      ))}
    </View>
  );
}
