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
        primary: {
          DEFAULT: '#8A2BE2', // Neon Purple
          light: '#A251FF',
          dark: '#6A1CB1',
        },
        secondary: {
          DEFAULT: '#00BFFF', // Electric Blue
          light: '#33D6FF',
          dark: '#0099CC',
        },
        accent: {
          DEFAULT: '#FF6F61', // Coral
          light: '#FF8F84',
          dark: '#CC594E',
        },
        dark: {
          DEFAULT: '#121212',
          lighter: '#1A1A1A',
          card: '#1E1E1E',
          border: '#2A2A2A',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-lexend)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(138, 43, 226, 0.5)',
        'glow-blue': '0 0 15px rgba(0, 191, 255, 0.5)',
        'glow-coral': '0 0 15px rgba(255, 111, 97, 0.5)',
        'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 15s ease infinite',
        'typing': 'typing 3.5s steps(40, end), blink-caret .75s step-end infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: 'rgba(138, 43, 226, 0.75)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;