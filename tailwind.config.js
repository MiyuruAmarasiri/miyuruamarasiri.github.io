/* eslint-disable */
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './js/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        display: ['DM Serif Display', 'Fraunces', ...defaultTheme.fontFamily.serif]
      },
      colors: {
        ink: '#111322',
        mist: '#EFF4FF',
        midnight: '#080D1F',
        aurora: '#6366F1',
        bloom: '#F472B6',
        glow: '#C4B5FD',
        blush: '#FEE2F2'
      },
      boxShadow: {
        float: '0 20px 45px rgba(99, 102, 241, 0.22)',
        veil: '0 28px 90px rgba(17, 19, 34, 0.18)',
        subtle: '0 10px 30px rgba(17, 19, 34, 0.08)'
      },
      backgroundImage: {
        'grid-light': "radial-gradient(circle at 20% 20%, rgba(144, 172, 255, 0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255, 167, 213, 0.1), transparent 40%)",
        'glow-fade': 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(244, 114, 182, 0.14))'
      },
      keyframes: {
        'float-orbit': {
          '0%, 100%': { transform: 'scale(0.96)', opacity: '0.4' },
          '50%': { transform: 'scale(1.02)', opacity: '0.7' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        orbit: 'float-orbit 28s linear infinite',
        'orbit-delayed': 'float-orbit 36s linear infinite',
        'fade-up': 'fade-up 0.6s ease forwards'
      }
    }
  },
  plugins: []
};
