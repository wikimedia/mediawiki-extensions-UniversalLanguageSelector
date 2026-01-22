'use strict';

const resolve = require( '@rollup/plugin-node-resolve' );

module.exports = {
	input: 'resources/ext.uls.rewrite/lib/floating-ui.js',
	output: {
		file: 'resources/ext.uls.rewrite/dist/floating-ui.js',
		format: 'cjs',
		exports: 'named'
	},
	external: [ 'vue' ],
	plugins: [
		resolve()
	]
};
