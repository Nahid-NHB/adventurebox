import { Pressable, Text } from 'react-native';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

/** Selectable pill used for interests, materials, goals, and tags. */
export function Chip({ label, selected, onPress, color }: Props) {
  const selectable = Boolean(onPress);
  return (
    <Pressable
      accessibilityRole={selectable ? 'checkbox' : 'text'}
      accessibilityState={selectable ? { checked: selected } : undefined}
      accessibilityLabel={label}
      onPress={onPress}
      className={`rounded-pill border px-4 py-2 ${
        selected
          ? 'border-primary bg-primary-soft'
          : 'border-black/10 bg-surface'
      } ${selectable ? 'active:opacity-70' : ''}`}
      style={color && selected ? { borderColor: color } : undefined}
    >
      <Text
        className={`text-sm font-medium ${selected ? 'text-primary' : 'text-ink-soft'}`}
        style={color && selected ? { color } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}
