/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sfu-light-red': '#CC0633', 
        'sfu-dark-red': '#A6192E',
      }
    }
  },
  plugins: [],
}

