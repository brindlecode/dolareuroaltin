/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A56DB',
          dark: '#1E429F',
        },
        gold: {
          DEFAULT: '#D4A017',
          light: '#FEF3C7',
        },
        up: {
          DEFAULT: '#059669',
          bg: '#ECFDF5',
        },
        down: {
          DEFAULT: '#DC2626',
          bg: '#FEF2F2',
        },
        usd: '#2563EB',
        eur: '#7C3AED',
        gbp: '#0891B2',
        ticker: '#1B2A4A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
