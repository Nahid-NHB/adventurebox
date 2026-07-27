import { View } from 'react-native';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/** Rounded, soft-shadowed surface used across the app. */
export function Card({ children, className = '' }: Props) {
  return (
    <View
      className={`rounded-card bg-surface p-5 ${className}`}
      style={{
        shadowColor: '#26221D',
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}
