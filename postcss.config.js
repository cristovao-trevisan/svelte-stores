/* eslint-disable @typescript-eslint/no-var-requires */
const autoprefixer = require('autoprefixer');
const tailwind = require('tailwindcss');

module.exports = {
  plugins: [
    autoprefixer(),
    tailwind('./tailwind.config.js'),
  ],
};
