import { View } from 'react-native';
import { Chip } from './Chip';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  single?: boolean;
}

/** Wrapping grid of selectable chips for multi- or single-select onboarding. */
export function SelectableGrid<T extends string>({
  options,
  selected,
  onToggle,
}: Props<T>) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          selected={selected.includes(o.value)}
          onPress={() => onToggle(o.value)}
        />
      ))}
    </View>
  );
}
