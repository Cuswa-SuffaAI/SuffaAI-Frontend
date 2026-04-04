// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      spacing: {
        '76': '19rem',
      },
      width: {
        '8/9': '88.888%',
      },
      maxWidth: {
        '8/9': '88.888%',
      },
    },
  },
  plugins: [],
}