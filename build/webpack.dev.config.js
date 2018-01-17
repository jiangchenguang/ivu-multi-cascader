const wpBaseConfig = require('./webpack.base.config');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(wpBaseConfig, {
  devtool: '#source-map',
  output: {
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '敏捷管理中心',
      template: 'src/template/index.html'
    }),
  ]
})

