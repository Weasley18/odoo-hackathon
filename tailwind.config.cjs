/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#34D399', // Green for eco-friendly theme
          dark: '#059669',
          light: '#A7F3D0',
        },
        secondary: {
          DEFAULT: '#60A5FA', // Blue
          dark: '#3B82F6',
          light: '#BFDBFE',
        },
      },
    },
  },
  plugins: [],
}
