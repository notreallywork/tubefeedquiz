/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
      },
      colors: {
        // Brand Primary Colors
        blue: {
          DEFAULT: '#007DB9',
          light: '#7FBEDC',
          extralight: '#E5F2F8',
        },
        green: {
          DEFAULT: '#64DCB4',
          light: '#B1EDD9',
          extralight: '#E0F8F0',
        },
        orange: {
          DEFAULT: '#FF7300',
          light: '#FFD0CF',
          extralight: '#FFF5ED',
        },
        // Accent Colors
        red: '#FF2800',
        yellow: '#FFAF00',
        // Neutral Colors
        white: '#FFFFFF',
        'grey-extralight': '#F5F5F5',
        'grey-light': '#E5E5E5',
        'grey-dark': '#BBBBBB',
        'grey-extradark': '#888888',
        black: '#000000',
        // shadcn variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 4px 24px rgba(0,0,0,0.08)",
        'card-hover': "0 8px 32px rgba(0,0,0,0.12)",
        button: "0 4px 16px rgba(255,115,0,0.4)",
        modal: "0 8px 32px rgba(0,0,0,0.2)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "breathe": {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.02)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.03)", opacity: "1" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "scroll-ticker": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "timer-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-10px)" },
          "40%": { transform: "translateX(10px)" },
          "60%": { transform: "translateX(-10px)" },
          "80%": { transform: "translateX(10px)" },
        },
        "ekg": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bar-grow": {
          "0%": { width: "0%" },
          "100%": { width: "var(--target-width)" },
        },
        "ripple": {
          "0%": { transform: "translate(-50%, -50%) scale(0)", opacity: "0.6" },
          "100%": { transform: "translate(-50%, -50%) scale(4)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 20s linear infinite",
        "scroll-ticker": "scroll-ticker 30s linear infinite",
        "timer-pulse": "timer-pulse 0.6s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "ekg": "ekg 3s linear infinite",
        "count-up": "count-up 0.3s ease-out",
        "bar-grow": "bar-grow 0.8s ease-out forwards",
        "ripple": "ripple 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
