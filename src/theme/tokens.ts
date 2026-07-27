/**
 * Design tokens — the single source of truth for the visual system. The Tailwind
 * config mirrors these colours for NativeWind class names; import from here in
 * TS when you need a raw value (charts, Lottie tint, category accents).
 */
import type { Category } from '@/types/domain';

export const colors = {
  canvas: '#FAF7F2',
  surface: '#FFFFFF',
  ink: '#26221D',
  inkSoft: '#6B6459',
  inkFaint: '#A69F93',
  primary: '#4C6FE0',
  primarySoft: '#E7ECFC',
  teal: '#2FB6A3',
  coral: '#F2765C',
  sand: '#E9C46A',
  night: { canvas: '#16130F', surface: '#211C16', ink: '#F3EFE8' },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 12, md: 16, lg: 20, card: 24, pill: 999 } as const;

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  title: 20,
  h2: 28,
  h1: 34,
} as const;

/** Accent colour per activity category, used on cards and chips. */
export const CATEGORY_COLOR: Record<Category, string> = {
  science: '#4C6FE0',
  engineering: '#2FB6A3',
  art: '#F2765C',
  nature: '#57A65A',
  cooking: '#E0995A',
  math: '#8A6DE0',
  reading: '#E0995A',
  writing: '#8A6DE0',
  physical: '#E05A87',
  outdoor: '#3FA7C9',
  sensory: '#C97BD6',
  music: '#D6A73F',
  storytelling: '#E0995A',
  teamwork: '#2FB6A3',
  mindfulness: '#57A65A',
  problem_solving: '#4C6FE0',
  recycling: '#57A65A',
  diy: '#2FB6A3',
  photography: '#3FA7C9',
  logic: '#8A6DE0',
};

/** Friendly emoji per category for the illustration placeholder. */
export const CATEGORY_EMOJI: Record<Category, string> = {
  science: '🔬',
  engineering: '🌉',
  art: '🎨',
  nature: '🍃',
  cooking: '🍳',
  math: '🔢',
  reading: '📖',
  writing: '✏️',
  physical: '🤸',
  outdoor: '🌳',
  sensory: '🖐️',
  music: '🎵',
  storytelling: '📚',
  teamwork: '🤝',
  mindfulness: '🧘',
  problem_solving: '🧩',
  recycling: '♻️',
  diy: '🛠️',
  photography: '📷',
  logic: '🧠',
};
