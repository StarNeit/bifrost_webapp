/* eslint-disable @typescript-eslint/no-var-requires */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const distConfig = require('./webpack.config.dist');

module.exports = async (env) => {
  const config = await distConfig(env);
  config.devtool = false;

  config.plugins = config.plugins || [];
  config.plugins.push(new BundleAnalyzerPlugin());

  return config;
};
