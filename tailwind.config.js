/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '360px',
      },
      colors: {
        pearl: {
          DEFAULT: '#F5F7FC',
          50: '#FFFFFF',
          100: '#F5F7FC',
          200: '#EBF0FA',
          300: '#DCE4F2',
        },
        royal: {
          DEFAULT: '#2446A8',
          light: '#3B5FD1',
          dark: '#1B3685',
          soft: '#EEF2FC',
        },
        brandTeal: {
          DEFAULT: '#13A89E',
          light: '#2BC2B8',
          dark: '#0D857D',
          soft: '#E6F8F7',
        },
        lavender: {
          DEFAULT: '#A58BEA',
          light: '#C2AFF2',
          dark: '#8566D6',
          soft: '#F4F0FE',
        },
        warmgold: {
          DEFAULT: '#E7A94B',
          light: '#F1C174',
          dark: '#C7882C',
          soft: '#FDF6E8',
        },
        deepnavy: {
          DEFAULT: '#17233C',
          light: '#243558',
          dark: '#0E172A',
        },
        slategray: {
          DEFAULT: '#718096',
          light: '#94A3B8',
          dark: '#4A5568',
        },
        softred: {
          DEFAULT: '#E45B68',
          light: '#F0838E',
          dark: '#C93D4B',
          soft: '#FDF0F1',
        },
        /* Backward-compatible semantic aliases updated to new palette */
        ivory: {
          DEFAULT: '#F5F7FC',
          50: '#FFFFFF',
          100: '#F5F7FC',
          200: '#EBF0FA',
        },
        sage: {
          DEFAULT: '#13A89E',
          light: '#2BC2B8',
          dark: '#0D857D',
        },
        navy: {
          DEFAULT: '#17233C',
          dark: '#0E172A',
          light: '#2446A8',
        },
        gold: {
          DEFAULT: '#E7A94B',
          light: '#F1C174',
          dark: '#C7882C',
        },
        charcoal: {
          DEFAULT: '#17233C',
        },
        crimson: {
          DEFAULT: '#E45B68',
          hover: '#C93D4B',
          light: '#F0838E',
          bg: '#FDF0F1',
        },
        finance: {
          navy: '#17233C',
          dark: '#0E172A',
          primary: '#2446A8',
          secondary: '#13A89E',
          accent: '#A58BEA',
          highlight: '#E7A94B',
          muted: '#718096',
          border: '#E2E8F4',
          card: '#FFFFFF',
          bg: '#F5F7FC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        num: ['Plus Jakarta Sans', 'Inter', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        tamilSerif: ['Noto Serif Tamil', 'Noto Sans Tamil', 'Georgia', 'serif'],
        tamilSans: ['Noto Sans Tamil', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(23, 35, 60, 0.07), 0 2px 6px -1px rgba(36, 70, 168, 0.04)',
        'card-hover': '0 16px 34px -10px rgba(36, 70, 168, 0.13), 0 4px 12px -2px rgba(19, 168, 158, 0.08)',
        premium: '0 20px 44px -14px rgba(23, 35, 60, 0.16), 0 4px 14px -2px rgba(36, 70, 168, 0.10)',
        'bottom-nav': '0 -8px 28px -6px rgba(23, 35, 60, 0.10)',
      },
    },
  },
  plugins: [],
};
