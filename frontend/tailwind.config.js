/** @type {import('tailwindcss').Config} */

/**
 * FILE: frontend/tailwind.config.js
 * PURPOSE: Tailwind CSS configuration.
 *
 * content: tells Tailwind which files to scan for class names when purging
 *   unused CSS in production. Must include all JSX and JS files.
 *
 * theme.extend: custom extensions to Tailwind's default design system.
 *   - colors: maps CSS variable names (defined in index.css :root) to
 *     Tailwind utility classes. e.g. `bg-bg-primary`, `text-text-muted`
 *   - fontFamily: custom fonts from Google Fonts
 *   - animation/keyframes: custom animations used in the app
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':   'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-glass':     'var(--bg-glass)',
        'text-primary': 'var(--text-primary)',
        'text-muted':   'var(--text-muted)',
        'accent-blue':  'var(--accent-blue)',
        'accent-purple':'var(--accent-purple)',
        'accent-green': 'var(--accent-green)',
      },
      fontFamily: {
        sans:  ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        game:  ['Nunito', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
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
