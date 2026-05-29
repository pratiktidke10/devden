/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        den: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#21262d',
          border2: '#30363d',
          text: '#e6edf3',
          muted: '#8b949e',
          faint: '#484f58',
          blue: '#58a6ff',
          green: '#3fb950',
          amber: '#d29922',
          purple: '#8957e5',
          red: '#da3633',
        }
      }
    },
  },
  plugins: [],
}

