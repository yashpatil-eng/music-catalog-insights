/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12131a',
        surface: '#1b1d29',
        accent: '#7c5cff',
        accent2: '#3ddc97',
      },
    },
  },
  plugins: [],
};
