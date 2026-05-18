/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        florencia: {
          gold: '#B0A06E', // Based on the image header color
          dark: '#5F6042',
          cream: '#FDFCF8',
          old: '#8F8B5B',
          redwine: '#440E03',
          brujas: '#E66C2C',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        narrow: ['"Roboto Condensed"', 'sans-serif-condensed', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
