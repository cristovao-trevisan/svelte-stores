/* eslint-disable @typescript-eslint/no-var-requires */
const autoprefixer = require('autoprefixer');
const tailwind = require('tailwindcss');
const atImport = require('postcss-import');

module.exports = {
  plugins: [
    atImport(),
    autoprefixer(),
    tailwind('./tailwind.config.js'),
  ],
};
