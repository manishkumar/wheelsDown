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
        sky: "#E8F4FD",
        cloud: "#FAFAF8",
        tarmac: "#2C2C2C",
        amber: {
          DEFAULT: "#E8A020",
          light: "#FDF0D5",
        },
        stripe: "#1A5276",
        green: "#1A7A4A",
        red: "#B03A2E",
        gray: {
          DEFAULT: "#8A8A8A",
          light: "#E8E8E8",
          input: "#F5F7FA",
          border: "#E0E0E0",
        },
        whatsapp: "#25D366",
        // shadcn compatibility
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
        display: ["Playfair Display", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fly-across": {
          "0%": { transform: "translateX(-120px)" },
          "100%": { transform: "translateX(calc(100vw + 120px))" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "pulse-amber": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(232, 160, 32, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(232, 160, 32, 0)" },
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
        "contrail": {
          "0%": { width: "0px", opacity: "0.6" },
          "70%": { width: "200px", opacity: "0.3" },
          "100%": { width: "250px", opacity: "0" },
        },
      },
      animation: {
        "fly-across": "fly-across 20s linear infinite",
        "float": "float 2s ease-in-out infinite",
        "pulse-amber": "pulse-amber 1.5s ease-in-out infinite",
        "scale-tick": "scale-tick 300ms ease-in-out",
        "fade-in-up": "fade-in-up 400ms ease-out",
        "fade-in-up-delay-1": "fade-in-up 400ms ease-out 150ms both",
        "fade-in-up-delay-2": "fade-in-up 400ms ease-out 300ms both",
      },
    },
  },
  plugins: [],
};
export default config;
