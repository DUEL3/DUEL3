/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        main: "#06330D",
        btn: "#FBFBFD",
        btntext: "#21212E",
        darkgray: "#242446",
      },
      fontFamily: {
        montserrat: ["Montserrat"],
      },
    },
  },
  plugins: [],
};
