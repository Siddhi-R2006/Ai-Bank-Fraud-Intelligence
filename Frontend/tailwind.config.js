/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6B21A8",
          dark: "#3B0A5A",
          light: "#FCE7F3",
        },
        accent: "#C2185B",
        danger: "#E53935",
        warning: "#F59E0B",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(59, 10, 90, 0.18)",
        glow: "0 0 30px rgba(107, 33, 168, 0.35)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3B0A5A 0%, #6B21A8 60%, #C2185B 100%)",
        "gradient-soft": "linear-gradient(135deg, #FCE7F3 0%, #FAF5FF 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
