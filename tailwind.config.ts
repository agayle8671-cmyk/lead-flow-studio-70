import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
      },
      colors: {
        // Superlist Core Obsidian Palette
        background: "#000000",
        foreground: "#FFFFFF",
        
        // Card - Translucent for glassmorphism
        card: {
          DEFAULT: "rgba(26, 26, 28, 0.4)",
          foreground: "#E5E5E5",
          hover: "rgba(38, 38, 40, 0.6)",
        },
        
        // Superlist Signature Accents
        primary: {
          DEFAULT: "#0099FF", // Azure Radiance
          foreground: "#FFFFFF",
          hover: "#00AAFF",
        },
        
        destructive: {
          DEFAULT: "#DC2626", // Alizarin Crimson
          foreground: "#FFFFFF",
        },
        
        accent: {
          DEFAULT: "#6DBDF2", // Malibu Blue
          foreground: "#000000",
        },
        
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          foreground: "#888888",
        },
        
        // Extended palette
        border: "rgba(255, 255, 255, 0.05)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "#0099FF",
        
        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          foreground: "#FFFFFF",
        },
        
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#000000",
        },
        
        popover: {
          DEFAULT: "rgba(26, 26, 28, 0.95)",
          foreground: "#FFFFFF",
        },
        
        sidebar: {
          DEFAULT: "#000000",
          foreground: "#888888",
          primary: "#0099FF",
          "primary-foreground": "#FFFFFF",
          accent: "rgba(255, 255, 255, 0.08)",
          "accent-foreground": "#FFFFFF",
          border: "rgba(255, 255, 255, 0.05)",
          ring: "#0099FF",
        },
      },
      borderRadius: {
        'sm': '4px',   // Superlist tight corners
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',  // Superlist "Notebook" feel
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-md)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glass': 'var(--shadow-glass)',
        'glow-primary': 'var(--glow-primary)',
        'glow-success': 'var(--glow-success)',
        'glow-critical': 'var(--glow-critical)',
      },
      backdropBlur: {
        '3xl': '40px',
        '4xl': '60px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "border-trace": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 153, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 153, 255, 0.5)" },
        },
        "pulse-critical": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(220, 38, 38, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(220, 38, 38, 0.4)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out forwards",
        "fade-up": "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-up": "slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "border-trace": "border-trace 2s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "pulse-critical": "pulse-critical 2s ease-in-out infinite",
        "haptic-pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
