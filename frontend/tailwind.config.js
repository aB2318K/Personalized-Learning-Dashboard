/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Custom CSS variables
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;
