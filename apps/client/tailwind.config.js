/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        beige: {
          50: "#FDFBF9",
          100: "#F7F3EB",
          200: "#EAE1D3",
          300: "#D5C3A8",
        },
      },
      animation: {
        "float-complex": "float-complex 8s ease-in-out infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
        "float-reverse": "float-reverse 10s ease-in-out infinite",
        "reveal-up": "reveal-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2.5s infinite",
        "spin-slow": "spin-slow 25s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
      keyframes: {
        "float-complex": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "33%": { transform: "translateY(-12px) rotate(2deg) scale(1.02)" },
          "66%": { transform: "translateY(8px) rotate(-1deg) scale(0.98)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-20px) translateX(10px)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0) translateX(0) rotate(0deg)" },
          "50%": {
            transform: "translateY(15px) translateX(-15px) rotate(-2deg)",
          },
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "spin-slow": {
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};
