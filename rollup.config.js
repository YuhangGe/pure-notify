import babel from 'rollup-plugin-babel';

export default {
  entry: './src/index.js',
  format: 'umd',
  moduleName: 'PureNotify',
  sourceMap: true,
  plugins: [
    babel({
    	babelrc: false,
    	presets: [
				[
		      "es2015",
		      {
		        "modules": false
		      }
    		]
    	]
    })
  ],
  dest: 'dist/pure-notify.js'
};