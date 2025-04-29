/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#0f172a",
          secondary: "#1e293b",
          accent: "#38bdf8",
        },
        backgroundImage: {
          "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
          "gradient-conic": "conic-gradient(var(--tw-gradient-stops))",
        },
      },
    },
    plugins: [],
  }