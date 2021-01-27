/* eslint-disable @typescript-eslint/no-var-requires */
const sveltePreprocess = require('svelte-preprocess');
const postcss = require('./postcss.config');

module.exports = {
  preprocess: sveltePreprocess({
    postcss,
    defaults: {
			style: 'postcss',
    },
  }),
};
