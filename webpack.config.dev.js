/* eslint-disable */
process.env.NODE_ENV = 'development';

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
    historyApiFallback: true,
    headers: {
      // Security Headers - Enterprise Grade Configuration for Development
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-portfolio2025' 'unsafe-inline' 'unsafe-eval'; script-src-attr 'none'; style-src 'self' 'nonce-portfolio2025' 'unsafe-inline'; style-src-attr 'none'; font-src 'self'; img-src 'self' data: https: blob:; connect-src 'self' ws: wss:; media-src 'self'; object-src 'none'; child-src 'none'; frame-src 'none'; worker-src 'self' blob:; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self'; upgrade-insecure-requests; block-all-mixed-content; trusted-types default; require-trusted-types-for 'script'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), clipboard-read=(), clipboard-write=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), hid=(), interest-cohort=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Origin-Agent-Cluster': '?1',
      'X-XSS-Protection': '1; mode=block',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'X-Download-Options': 'noopen',
      'X-DNS-Prefetch-Control': 'off'
    }
  }
});
