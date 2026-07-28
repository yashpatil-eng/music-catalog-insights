/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
