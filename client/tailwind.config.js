/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pure black base
        surface: {
          DEFAULT: '#000000',
          elevated: 'rgba(255, 255, 255, 0.05)',
          hover: 'rgba(255, 255, 255, 0.08)',
        },
        // Status colors - Apple-like
        status: {
          blue: '#3B82F6',
          orange: '#F59E0B',
          green: '#10B981',
          purple: '#8B5CF6',
          pink: '#EC4899',
        },
        // Accent - Skype Blue
        accent: {
          DEFAULT: '#00AFF0',
          hover: '#33BFFF',
          dim: 'rgba(0, 175, 240, 0.15)',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
