/** @type {import('tailwindcss').Config} */
// Design tokens are the single source of truth in src/theme/tokens.ts.
// Keep this palette in sync with that file (JS can't import TS here cleanly).
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Calm, warm, premium palette
        canvas: '#FAF7F2', // warm off-white background
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#26221D', // near-black warm
          soft: '#6B6459',
          faint: '#A69F93',
        },
        primary: {
          DEFAULT: '#4C6FE0', // soft indigo
          fg: '#FFFFFF',
          soft: '#E7ECFC',
        },
        teal: { DEFAULT: '#2FB6A3', soft: '#DCF3EF' },
        coral: { DEFAULT: '#F2765C', soft: '#FCE4DD' },
        sand: { DEFAULT: '#E9C46A', soft: '#FBF1D6' },
        // dark mode surfaces
        night: { canvas: '#16130F', surface: '#211C16' },
        // category accents
        cat: {
          science: '#4C6FE0',
          engineering: '#2FB6A3',
          art: '#F2765C',
          nature: '#57A65A',
          math: '#8A6DE0',
          reading: '#E0995A',
          physical: '#E05A87',
          outdoor: '#3FA7C9',
          sensory: '#C97BD6',
          music: '#D6A73F',
        },
      },
      borderRadius: {
        card: '24px',
        pill: '999px',
      },
      fontFamily: {
        display: ['System'],
        body: ['System'],
      },
    },
  },
  plugins: [],
};
