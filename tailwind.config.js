const production = process.env.NODE_ENV === 'production'; 

module.exports = {
  purge: {
    content: [
      './src/**/*.css',
      './src/**/*.svelte',
    ], 
    enabled: production,
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
