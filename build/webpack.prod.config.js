const wpBaseConfig = require('./webpack.base.config');
const merge = require('webpack-merge');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

process.env.NODE_ENV = 'production';

module.exports = merge(wpBaseConfig, {
  entry: {
    main: path.resolve(__dirname, '../src/export.js'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bomc.js',
    library: 'multiCascader',
    libraryTarget: 'umd',
  },
  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue'
    }
  },
  plugins: [
    new UglifyJsPlugin(),
  ]
})