/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#F0F4FF",
          200: "#D9E2FF",
          300: "#A6C1FF",
          400: "#598BFF",
          500: "#3366FF",
          600: "#274BDB",
          700: "#1A34B8",
          800: "#102694",
          900: "#091A7A",
        },
        dark: {
          100: "#d1d2d3",
          200: "#a3a5a7",
          300: "#74787c",
          400: "#464b50",
          500: "#181e24",
          600: "#13181d",
          700: "#0e1216",
          800: "#0a0c0e",
          900: "#050607"
        }
      },
    },
  },
  plugins: [
    require('@mertasan/tailwindcss-variables'),
  ],
};
