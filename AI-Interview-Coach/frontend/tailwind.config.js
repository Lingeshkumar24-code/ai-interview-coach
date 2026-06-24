/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#06B6D4",
        bg: "#0F172A",
        card: "#1E293B",
        cardborder: "#2A3B52",
        ink: "#F8FAFC",
        muted: "#94A3B8",
        excellent: "#22C55E",
        ready: "#06B6D4",
        improve: "#F59E0B",
        beginner: "#EF4444",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(6, 182, 212, 0.15), transparent 45%)",
        "card-glass":
          "linear-gradient(135deg, rgba(30, 41, 59, 0.75), rgba(30, 41, 59, 0.35))",
      },
      boxShadow: {
        glow: "0 0 40px rgba(37, 99, 235, 0.25)",
        "glow-cyan": "0 0 40px rgba(6, 182, 212, 0.25)",
        card: "0 8px 32px rgba(0,0,0,0.35)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.3)", opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
