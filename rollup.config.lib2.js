import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';

export default {
	external: [ 'three', 'numericjs' ],
	globals: {
		'three': 'THREE',
		'numericjs': 'numeric',
	},
	input: 'src/js/planetlib2.js',
	output: [
		{
			format: 'umd',
			name: 'DOGULEAN',
			file: 'js/planetlib2.umd.js'
		},
	],
	plugins: [
		eslint({
			exclude: [
				'src/styles/**',
			]
		}),
		babel({
			exclude: 'node_modules/**',
		}),
		(process.env.NODE_ENV === 'production' && uglify()),
	],
};
