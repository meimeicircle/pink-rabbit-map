
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
      },
      colors: {
        pink: {
          50: '#fff0f5', 
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        // Forest / Morandi Palette (Restored)
        night: {
          900: '#2F3832', // --bg-page (Deep Forest Green)
          800: '#E6DEDC', // --bg-card (Warm Greige / Sand) - User Request
          700: '#CFC5C2', // --bg-card-active (Darker Greige)
          600: '#728A7A', // --tag-bg (Sage Green) - User Request
          400: '#7D7975', // --text-disabled
          300: '#5C5855', // --text-muted
          200: '#2A2628', // --text-main (Dark text for light cards)
          100: '#F0F0F0', // --text-primary (Light text for dark backgrounds)
          pink: {
            primary: '#728A7A',   // --pink-primary (Sage Green)
            secondary: '#5E7164', // --pink-secondary (Darker Sage)
          }
        }
      }
    },
  },
  plugins: [],
}
