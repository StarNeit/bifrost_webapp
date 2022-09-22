/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');

const sharedConfig = require('./webpack.config.shared');

module.exports = async (env) => {
  const config = await sharedConfig(env);

  config.mode = 'development';
  config.devtool = 'eval-source-map';

  config.plugins = config.plugins || [];
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: 'src/templates/index.html',
    }),
    new HotModuleReplacementPlugin(),
  );

  return config;
};
