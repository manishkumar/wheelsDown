import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "board-ink": "#0C1016",
        "board-well": "#05070A",
        "board-panel": "#12161D",
        "flap-amber": "#FFB01A",
        "flap-green": "#33D17A",
        "flap-red": "#FF4D4F",
        chalk: "#F2F3F5",
        mist: "#8992A3",
        hairline: "rgba(242,243,245,0.08)",
        whatsapp: "#25D366",
        // shadcn compatibility (left in place; not used by restyled components)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "pulse-amber": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 176, 26, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(255, 176, 26, 0)" },
        },
        "scale-tick": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "flap-flip": {
          "0%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(-90deg)" },
          "51%": { transform: "rotateX(90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
        "text-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-amber": "pulse-amber 1.5s ease-in-out infinite",
        "scale-tick": "scale-tick 300ms ease-in-out",
        "fade-in-up": "fade-in-up 400ms ease-out",
        "fade-in-up-delay-1": "fade-in-up 400ms ease-out 150ms both",
        "fade-in-up-delay-2": "fade-in-up 400ms ease-out 300ms both",
        "flap-flip": "flap-flip 380ms ease-in",
        "text-pulse": "text-pulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
