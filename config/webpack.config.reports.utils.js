/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const updateConfig = (config, reportName) => {
  const newConfig = { ...config };
  newConfig.plugins = config.plugins || [];

  const pluginsToRemove = [
    'ObsoleteWebpackPlugin',
    'HtmlWebpackPlugin',
  ];

  newConfig.plugins = newConfig.plugins
    .filter((plugin) => !pluginsToRemove.includes(plugin.constructor.name));

  newConfig.plugins.push(
    new HtmlWebpackPlugin({
      template: 'src/templates/report.html',
    }),
  );

  newConfig.resolve.alias.Report$ = path.resolve(__dirname, '..', 'src', 'reports', reportName, 'index.tsx');
  return newConfig;
};

module.exports = {
  updateConfig,
};
