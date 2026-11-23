/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F3EA',
        paper: '#EFE9DB',
        ink: '#24211E',
        // Accessible warm brass with >= 4.5:1 contrast on ivory (#F7F3EA)
        brass: '#855F26',
        burgundy: '#612E32',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
        gujarati: ['"Noto Serif Gujarati"', 'serif'],
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};
