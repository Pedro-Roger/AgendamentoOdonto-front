import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#F7FBFD",
          100: "#EEF6FA",
          200: "#DDEDF4",
        },
        sage: {
          50: "#EEF8FB",
          100: "#D6EDF5",
          200: "#A8DCEC",
          300: "#6CC4DE",
          400: "#2BA8CC",
          500: "#1B8AAB",
          600: "#136E89",
        },
        peach: {
          50: "#EFF6FE",
          100: "#DCEAFB",
          200: "#B6D2F5",
          300: "#84B3EC",
          400: "#5B95E0",
          500: "#3A77C7",
        },
        rose: {
          50: "#FBF1F0",
          100: "#FAD9D6",
          200: "#F4B0A8",
          300: "#E68479",
          400: "#D45F50",
        },
        ink: {
          400: "#6D7B86",
          500: "#4E5C68",
          600: "#2F3A45",
          700: "#1A2530",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -8px rgba(19, 110, 137, 0.18)",
        card: "0 8px 32px -12px rgba(19, 110, 137, 0.22)",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
