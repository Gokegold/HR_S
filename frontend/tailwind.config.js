module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#edfdf6",
          100: "#d6fbec",
          500: "#0f8554"
        },
        accent: {
          500: "#0ea5e9"
        }
      }
    }
  },
  plugins: []
};