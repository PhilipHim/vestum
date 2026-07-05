/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        rosemist: {
          DEFAULT: '#D7A5B9',
          dark: '#9E6D81',
          hover: '#E4B8CA',
        },
        surface: {
          dark: '#111111',
          card: '#171717',
          elevated: '#1A1A1A',
        },
        muted: '#7A7A7A',
      },
    },
  },
  plugins: [],
};
