/* eslint-disable */
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
      watch: true,
    },
    hot: true,
    open: true,
    compress: true,
    port: 3000,
    historyApiFallback: true
  }
});
