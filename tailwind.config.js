/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#1F355C',
        gold: '#EFB400',
        sky: '#5798C7',
        coral: '#FF6B6B',
        sage: '#88C9A1',
        lavender: '#E6E6FA',
        teal: '#2D7A7A',
      },
    },
  },
  plugins: [],
};
