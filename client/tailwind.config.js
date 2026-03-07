/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        co: {
          blue:  '#003DA5',
          red:   '#BF0A30',
          gold:  '#FFC72C',
          sky:   '#4A90D9',
          snow:  '#F0F4FF',
          pine:  '#1B4332',
          stone: '#6B7280',
          peak:  '#1E293B',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      backgroundImage: {
        'mountain-gradient': 'linear-gradient(180deg, #0a1628 0%, #1a2d4f 40%, #2d4a6b 70%, #1B4332 100%)',
        'sky-gradient': 'linear-gradient(180deg, #0a1628 0%, #1a3a6b 50%, #4A90D9 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
