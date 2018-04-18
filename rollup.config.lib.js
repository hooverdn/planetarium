import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';

export default {
	external: [ 'three', ],
	globals: {
		'three': 'THREE',
	},
	input: 'src/js/planetlib.js',
	output: [
		{
			format: 'umd',
			name: 'DOGULEAN',
			file: 'js/planetlib.umd.js'
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
