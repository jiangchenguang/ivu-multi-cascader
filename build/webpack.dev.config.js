const wpBaseConfig = require('./webpack.base.config');
const merge = require('webpack-merge');
const path = require('path');

module.exports = merge(wpBaseConfig, {
  devtool: '#source-map',
  output: {
    publicPath: '/dist/',
    filename: 'multi-cascader.js',
    library: 'multiCascader',
    libraryTarget: 'umd',
  },
})

