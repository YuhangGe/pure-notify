import babel from 'rollup-plugin-babel';
const pkg = require('./package.json');

export default {
  entry: './src/index.js',
  format: 'umd',
  moduleName: 'PureNotify',
  sourceMap: true,
  banner: `/*\n * @preserve\n * pure-notify v${pkg.version}, https://github.com/YuhangGe/pure-notify\n */`,
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