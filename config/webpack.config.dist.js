/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require('copy-webpack-plugin');

const sharedConfig = require('./webpack.config.shared');

module.exports = async (env) => {
  const config = await sharedConfig(env);

  config.mode = 'production';
  config.plugins.push(new CopyWebpackPlugin({
    patterns: [{
      from: 'src/assets/favicon/*',
      to: 'assets/favicon/[name].[ext]',
    }],
  }));

  return config;
};
