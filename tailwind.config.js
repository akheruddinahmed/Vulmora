/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vulmora: {
          blue: {
            50: '#f0f5ff',
            100: '#e0ebff',
            200: '#bad4fe',
            500: '#2563eb',
            600: '#1d4ed8',
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#0f2b8f',
            950: '#07164a',
          },
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
          },
          magenta: {
            50: '#fdf4ff',
            100: '#fae8ff',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
          }
        },
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#bad4fe',
          500: '#1d4ed8',
          600: '#0f2b8f',
          700: '#0b2374',
          800: '#07164a',
          900: '#040d2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(15, 43, 143, 0.07), 0 2px 4px -2px rgba(15, 43, 143, 0.05)',
        'float': '0 10px 25px -5px rgba(15, 43, 143, 0.12), 0 8px 10px -6px rgba(15, 43, 143, 0.06)',
      }
    },
  },
  plugins: [],
}
