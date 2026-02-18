import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        doctor: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#06b6d4',
          dark: '#0f172a',
          darker: '#020617',
          surface: '#1e293b',
          border: '#334155',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          orphan: '#ef4444',
          active: '#22c55e',
          lazy: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
