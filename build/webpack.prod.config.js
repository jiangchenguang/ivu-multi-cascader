const wpBaseConfig = require('./webpack.base.config');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

process.env.NODE_ENV = 'production';

module.exports = merge(wpBaseConfig, {
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: './',
    filename: 'bomc.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '敏捷管理中心',
      template: 'src/template/index.html'
    }),
  ]
})