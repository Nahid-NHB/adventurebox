import { Text, View } from 'react-native';

interface Props {
  label: string;
  tone?: 'neutral' | 'accent';
  color?: string;
}

/** Small static badge (time, difficulty). */
export function Pill({ label, tone = 'neutral', color }: Props) {
  return (
    <View
      className={`rounded-pill px-3 py-1 ${tone === 'accent' ? '' : 'bg-black/5'}`}
      style={color ? { backgroundColor: `${color}22` } : undefined}
    >
      <Text
        className="text-xs font-semibold text-ink-soft"
        style={color ? { color } : undefined}
      >
        {label}
      </Text>
    </View>
  );
}
