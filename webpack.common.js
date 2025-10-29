/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

const CSP_NONCE = 'portfolio2025';

class HtmlNoncePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlNoncePlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap('HtmlNoncePlugin', (data) => {
        const applyNonce = (tag) => {
          if (!tag || !tag.tagName) return;
          const needsNonce =
            tag.tagName === 'script' ||
            (tag.tagName === 'link' && tag.attributes && tag.attributes.rel === 'stylesheet');
          if (!needsNonce) return;

          // eslint-disable-next-line no-param-reassign
          tag.attributes = {
            ...tag.attributes,
            nonce: CSP_NONCE,
          };
        };

        data.headTags.forEach(applyNonce);
        data.bodyTags.forEach(applyNonce);
        return data;
      });
    });
  }
}

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
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
      { from: 'img', to: 'img' },
      { from: 'js/vendor', to: 'js/vendor' },
    ],
  }),
];

plugins.push(new HtmlNoncePlugin());

if (isProduction) {
  plugins.push(
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
    new SubresourceIntegrityPlugin({
      hashFunction: 'sha384',
    })
  );
}

module.exports = {
  entry: './js/app.js',
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    crossOriginLoading: 'anonymous',
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
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: !isProduction,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !isProduction,
            },
          },
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
  plugins,
  resolve: {
    extensions: ['.js'],
  },
};
