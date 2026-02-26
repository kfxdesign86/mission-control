import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        'background-secondary': '#0d0d0d',
        card: 'rgba(26, 26, 26, 0.8)',
        'card-solid': '#1a1a1a',
        'card-hover': 'rgba(32, 32, 32, 0.9)',
        accent: '#f97316',
        'accent-glow': 'rgba(249, 115, 22, 0.4)',
        border: 'rgba(255, 255, 255, 0.06)',
        'border-hover': 'rgba(249, 115, 22, 0.3)',
        muted: '#737373',
        'muted-foreground': '#a3a3a3',
        success: '#22c55e',
        danger: '#ef4444',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'stat': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(249, 115, 22, 0.15)',
        'glow': '0 0 20px rgba(249, 115, 22, 0.25)',
        'glow-lg': '0 0 40px rgba(249, 115, 22, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.25)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.25)',
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px -4px rgba(0, 0, 0, 0.5)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'accent-gradient': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'hero-gradient': 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #f97316 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
