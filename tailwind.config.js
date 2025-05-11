/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        typing: "typing 2s steps(20), blink 1s infinite"
      },
      keyframes: {
        typing: {
          "0%": {
            width: "0",
          },
          "100%": {
            width: "100%",
          },
        },
        blink: {
          "0%": {
            "border-right-color": "rgb(168 85 247)",
          },
          "100%": {
            "border-right-color": "transparent",
          },
        },
      },
    },
  },
  plugins: [],
};
