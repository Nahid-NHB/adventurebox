import type { Config } from 'tailwindcss';

// Palette echoes the app's calm design tokens (soft indigo primary, warm canvas).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F6F2',
        surface: '#FFFFFF',
        ink: '#1F2430',
        'ink-soft': '#5B6472',
        'ink-faint': '#9AA3B2',
        primary: '#4C6FE0',
        'primary-soft': '#EAF0FF',
        good: '#2E9E6B',
        warn: '#C9821A',
        bad: '#D6493B',
        line: '#E7E5DF',
      },
      borderRadius: {
        card: '18px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
