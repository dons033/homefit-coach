/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        timer: ["9rem", { lineHeight: "1" }],
        "timer-sm": ["6rem", { lineHeight: "1" }],
      },
    },
  },
  plugins: [],
};
