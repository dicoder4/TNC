/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["Manrope", "sans-serif"],
      },
      // The Naach Company brand palette (sampled from the logo).
      colors: {
        tnc: {
          teal: "#0E393A", // primary · typography
          "teal-deep": "#0A2B2C", // darker teal for layered dark sections
          pink: "#AD2451", // secondary · festive accents
          burgundy: "#81153B", // rich contrast · premium accents
          gold: "#CF9F42", // antique gold · decorative highlights
          "gold-soft": "#DCB46C", // muted gold · secondary highlights
          beige: "#D8CBB7", // warm neutral · subtle details
          tan: "#AD8A6C", // warm neutral · illustrations
          brown: "#532C20", // outlines · earthy accents
          ivory: "#F3F0E1", // background
          cream: "#EBE5D2", // slightly deeper ivory for alternating sections
        },
      },
    },
  },
  plugins: [],
};
