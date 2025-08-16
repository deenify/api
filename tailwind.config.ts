import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: "--font-syne",
        Raleway: "--font-raleway",
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "992px",
        xl: "1170px",
        "2xl": "1280px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        xs: "3px",
        sm: "6px",
        md: "9px",
        lg: "12px",
        full: "100%",
      },
    },
  },

  plugins: [
    plugin(function ({ addUtilities }) {
      const fontUtilities = {
        ".font-12-400": {
          fontSize: "12px",
          fontWeight: "500",
          fontFamily: "var(--font-syne)",
          lineHeight: "110%",
        },
        ".font-12-500": {
          fontSize: "12px",
          fontWeight: "500",
          fontFamily: "var(--font-raleway)",
          lineHeight: "110%",
        },
      };

      addUtilities(fontUtilities);
    }),
  ],
};

export default config;
