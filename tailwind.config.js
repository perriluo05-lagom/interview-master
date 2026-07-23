/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'zhongsong': ['STZhongsong', 'Songti SC', 'SimSun', 'serif'],
      },
      backdropBlur: {
        '3xl': '20px',
      },
      colors: {
        'glass': {
          'bg': 'rgba(255, 255, 255, 0.1)',
          'border': 'rgba(255, 255, 255, 0.2)',
        }
      }
    },
  },
  plugins: [],
}
