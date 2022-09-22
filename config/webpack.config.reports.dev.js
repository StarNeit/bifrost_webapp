/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const devConfig = require('./webpack.config.dev');
const { updateConfig } = require('./webpack.config.reports.utils');

module.exports = async (env) => {
  const { reportName } = env;

  if (!reportName) {
    throw new Error('Missing "reportName". Please launch the command as: "npm run start-report -- --env reportName=formulation"');
  }
  let config = await devConfig(env);
  config.entry = ['react-hot-loader/patch', './src/reports/index.tsx'];
  config.devServer.port = 9001;

  config = updateConfig(config, reportName);

  const testDataFileContent = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'reports', reportName, 'testData.json'), 'utf8');

  config.plugins.push(
    new webpack.DefinePlugin({
      XRITE_REPORTING_SERVICE: testDataFileContent,
    }),
  );
  return config;
};
