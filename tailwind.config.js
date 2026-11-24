/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: {
          DEFAULT: '#F9EAD7',
          50: '#FDF9F5',
          100: '#FAF2E9',
          200: '#F9EAD7',
          300: '#F2D3B3',
          400: '#EAB88F',
          500: '#DD9563',
        },
        lime: {
          DEFAULT: '#BFE23A',
          hover: '#adc934',
          light: '#d4eb71',
          dark: '#9bb828'
        },
        crimson: {
          DEFAULT: '#E10600',
          hover: '#c20500',
          light: '#ff4d47',
          bg: '#FEF2F2'
        },
        finance: {
          navy: '#0F172A',
          dark: '#1E293B',
          muted: '#64748B',
          border: '#E2E8F0',
          card: '#FFFFFF',
          bg: '#F9EAD7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        premium: '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
