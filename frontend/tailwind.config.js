/** @type {import('tailwindcss').Config} */

/**
 * FILE: frontend/tailwind.config.js
 * PURPOSE: Tailwind CSS configuration for the TE-01 Tactile Console design system.
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':    'var(--bg-primary)',
        'bg-secondary':  'var(--bg-secondary)',
        'bg-glass':      'var(--bg-glass)',
        'text-primary':  'var(--text-primary)',
        'text-muted':    'var(--text-muted)',
        'accent-amber':  'var(--accent-amber)',
        'accent-green':  'var(--accent-green)',
        'accent-crimson':'var(--accent-crimson)',
        'chassis':       '#111318',
        'panel':         '#171a21',
        'keycap':        '#232834',
        'recessed':      '#0c0e13',
        'bone':          '#f2ece1',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        game: ['Nunito', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 12s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%':   { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(10px, -15px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}
