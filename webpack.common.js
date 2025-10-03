/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './js/app.js',
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: './icon.png',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: '_headers', to: '_headers', toType: 'file' },
        { from: 'netlify.toml', to: 'netlify.toml', toType: 'file' },
        { from: 'vercel.json', to: 'vercel.json', toType: 'file' },
        { from: 'robots.txt', to: 'robots.txt', toType: 'file' },
        { from: 'site.webmanifest', to: 'site.webmanifest', toType: 'file' },
        { from: 'CNAME', to: 'CNAME', toType: 'file' },
        { from: '404.html', to: '404.html', toType: 'file' },
        { from: 'icon.svg', to: 'icon.svg', toType: 'file' },
        { from: 'icon.png', to: 'icon.png', toType: 'file' },
        { from: 'css', to: 'css' },
        { from: 'img', to: 'img' },
        { from: 'js/vendor', to: 'js/vendor' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
};
