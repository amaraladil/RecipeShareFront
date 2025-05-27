module.exports = {
  content: [
    "./components/**/*.{vue,js}",
    "./layouts/**/*.{vue,js}",
    "./pages/**/*.{vue,js}",
    "./app.vue",
    "./assets/css/**/*.{css,scss}",
  ],
  safelist: [
    "px-2",
    "py-2",
    "rounded-md",
    "bg-blue-500",
    "text-white",
    "hover:bg-blue-600",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
