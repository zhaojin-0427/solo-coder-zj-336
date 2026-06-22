/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1C1A17",
          50: "#F7F5F1",
          100: "#EDE9E1",
          200: "#D9D2C4",
          300: "#B8AE9B",
          400: "#8C8270",
          500: "#5C5446",
          600: "#3D382E",
          700: "#2A2620",
          800: "#1C1A17",
          900: "#100F0D",
        },
        paper: {
          DEFAULT: "#F4ECDD",
          light: "#FAF5EA",
          dark: "#E8DFC9",
        },
        tea: {
          DEFAULT: "#7C8C5E",
          light: "#A8B687",
          dark: "#566340",
        },
        cinnabar: {
          DEFAULT: "#B23A2E",
          light: "#D45D4F",
          dark: "#8A2A20",
        },
        gold: {
          DEFAULT: "#B8924A",
          light: "#D4B26E",
          dark: "#8C6D34",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        'ink': '0 2px 8px rgba(28, 26, 23, 0.08)',
        'ink-lg': '0 8px 24px rgba(28, 26, 23, 0.12)',
        'paper': '0 4px 16px rgba(184, 146, 74, 0.12)',
      },
      backgroundImage: {
        'paper-texture': "radial-gradient(circle at 20% 30%, rgba(184,146,74,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(124,140,94,0.04) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
};
