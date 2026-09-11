/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bidsure: {
          primary: '#0B2545',
          deep: '#071A33',
          blue: '#1677FF',
          cyan: '#00D9FF',
          softCyan: '#67E8F9',
          bg: '#F4F8FC',
          surface: '#FFFFFF',
          slate: '#475569',
          textPrimary: '#17202A',
          textSecondary: '#5B6775',
          border: '#D9E0E7',
        },
        gem: {
          navy: '#0B2545',
          deep: '#071A33',
          steel: '#134074',
          accent: '#1677FF',
          cyan: '#00D9FF',
          light: '#EEF4F8',
          bg: '#F4F8FC',
          saffron: '#E65100',
          success: '#16A34A',
          danger: '#DC2626',
          warning: '#D97706',
          info: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass-subtle': '0 4px 20px -2px rgba(11, 37, 69, 0.05), 0 2px 6px -1px rgba(11, 37, 69, 0.03)',
        'glass-elevated': '0 12px 36px -4px rgba(11, 37, 69, 0.12), 0 4px 12px -2px rgba(11, 37, 69, 0.06)',
        'glass-intelligence': '0 0 25px -3px rgba(0, 217, 255, 0.25), 0 10px 30px -5px rgba(7, 26, 51, 0.5)',
        'ai-glow': '0 0 15px rgba(0, 217, 255, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ambient-float': 'ambientFloat 25s ease-in-out infinite alternate',
      },
      keyframes: {
        ambientFloat: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '100%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}
