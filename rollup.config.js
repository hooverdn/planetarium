import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';
import cleanup from 'rollup-plugin-cleanup';

export default {
	external: [ 'three', 'Detector', 'numericjs' ],
	globals: {
		'three': 'THREE',
		'Detector': 'Detector',
		'numericjs': 'numeric',
	},
	input: 'src/js/planetarium.js',
	output: [
		{
			format: 'umd',
			name: 'DOGULEAN',
			file: 'js/planetarium.min.js'
		},
		{
			file: 'js/planetarium.module.js',
			format: 'es',
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
		cleanup(),
		(process.env.NODE_ENV === 'production' && uglify()),
	],
};
