import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  accessibilityHint?: string;
}

const base =
  'flex-row items-center justify-center rounded-pill px-6 py-4 min-h-[52px]';

const styles: Record<Variant, { box: string; text: string }> = {
  primary: { box: 'bg-primary', text: 'text-white' },
  secondary: { box: 'bg-primary-soft', text: 'text-primary' },
  ghost: { box: 'bg-transparent', text: 'text-ink-soft' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  accessibilityHint,
}: Props) {
  const s = styles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      className={`${base} ${s.box} ${disabled ? 'opacity-40' : 'active:opacity-80'}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#4C6FE0'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`text-base font-semibold ${s.text}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
