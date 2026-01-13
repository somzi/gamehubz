/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Background colors - dark blue tones matching web
        background: "hsl(222 47% 6%)",
        foreground: "hsl(210 40% 98%)",

        // Card colors
        card: "hsl(222 40% 10%)",
        "card-foreground": "hsl(210 40% 98%)",
        "card-elevated": "hsl(222 35% 14%)",

        // Popover
        popover: "hsl(222 40% 10%)",
        "popover-foreground": "hsl(210 40% 98%)",

        // Primary - Teal (matching web)
        primary: "hsl(185 75% 45%)",
        "primary-foreground": "hsl(222 47% 6%)",

        // Secondary
        secondary: "hsl(222 30% 18%)",
        "secondary-foreground": "hsl(210 40% 98%)",

        // Muted
        muted: "hsl(222 25% 22%)",
        "muted-foreground": "hsl(220 15% 55%)",

        // Accent - Gold (matching web)
        accent: "hsl(45 90% 55%)",
        "accent-foreground": "hsl(222 47% 6%)",

        // Status colors
        destructive: "hsl(0 72% 51%)",
        "destructive-foreground": "hsl(210 40% 98%)",
        success: "hsl(142 70% 45%)",
        "success-foreground": "hsl(210 40% 98%)",
        live: "hsl(0 85% 60%)",
        "live-foreground": "hsl(210 40% 98%)",

        // Border and input
        border: "hsl(222 25% 18%)",
        input: "hsl(222 25% 18%)",
        ring: "hsl(185 75% 45%)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}
