const path = require('path'); //Built in node module, easier to work with file and directory paths
const webpack = require('webpack');

module.exports = {
	entry: './src/index.js', // where webpack will look for main starting file
	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: '/build/',
		filename: 'project.bundle.js',
	},
	module: {
		// specify how to handle different filetypes
		rules: [
			{
				test: [/\.vert$/, /\.frag$/], // regex to tell webpack type of file
				use: 'raw-loader', // use raw-loader for .vert and .frag files
			},
		],
	},
	plugins: [
		// specify which plugins to use for additional functionality
		new webpack.DefinePlugin({
			// specify to webpack to bundle these with phaser
			CANVAS_RENDERER: JSON.stringify(true),
			WEBGL_RENDERER: JSON.stringify(true),
		}),
	],
	devServer: {
		publicPath: '/build/',
	},
};
