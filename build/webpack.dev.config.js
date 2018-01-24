const wpBaseConfig = require('./webpack.base.config');
const merge = require('webpack-merge');
const path = require('path');

module.exports = merge(wpBaseConfig, {
  devtool: '#source-map',
  entry: {
    main: path.resolve(__dirname, '../src/index.js'),
  },
  output: {
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
})

