import { shadcnPreset } from "shadcn/tailwind-preset";
import animate from "tailwindcss-animate";

export default {
  presets: [shadcnPreset()],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rosePine: {
          base: "#191724",
          surface: "#1f1d2e",
          overlay: "#26233a",
          muted: "#6e6a86",
          subtle: "#908caa",
          text: "#e0def4",
          highlight: "#2a273f",
          highlightLow: "#21202e",
          highlightMed: "#403d52",
          highlightHigh: "#524f67",
          love: "#eb6f92",
          gold: "#f6c177",
          rose: "#ebbcba",
          pine: "#31748f",
          foam: "#9ccfd8",
          iris: "#c4a7e7",
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
    },
  },
  plugins: [animate],
};
