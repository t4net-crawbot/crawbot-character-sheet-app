/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tov: {
          bg: '#0d0d14',
          surface: '#1a1033',
          card: '#2D1B69',
          cardHover: '#3D2B7D',
          interactive: '#4D3B8D',
          gold: '#D4AF37',
          goldLight: '#F0E68C',
          goldDark: '#B8860B',
          teal: '#1B4D5C',
          tealLight: '#2B6D7C',
          border: '#374151',
          text: '#F3F4F6',
          textMuted: '#9CA3AF',
          error: '#EF4444',
          success: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(212,175,55,0.35)',
        'gold-lg': '0 0 30px rgba(212,175,55,0.5)',
      },
    },
  },
  plugins: [],
}
