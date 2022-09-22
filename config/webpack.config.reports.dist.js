/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const ZipPlugin = require('zip-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const distConfig = require('./webpack.config.dist');
const { updateConfig } = require('./webpack.config.reports.utils');
const paths = require('./paths');
const { namespace } = require('./reports');

let filepaths = glob.sync('./src/reports/*/index.tsx');

module.exports = async (env) => {
  const { reportName } = env;

  const config = await distConfig(env);

  config.devtool = false;

  if (reportName) filepaths = [`./src/reports/${reportName}/index.tsx`];

  const configurations = filepaths.map((filepath) => {
    let newConfig = { ...config };
    const folderName = path.basename(path.dirname(filepath));
    const reportTemplateName = `${namespace}/${folderName}`;
    const destinationPath = path.resolve(__dirname, paths.distReports, reportTemplateName);
    newConfig.entry = './src/reports/index.tsx';
    newConfig.output = {
      path: destinationPath,
      filename: 'report.js',
    };

    newConfig = updateConfig(newConfig, folderName);

    newConfig.plugins.push(
      new ZipPlugin({
        path: path.resolve(__dirname, paths.distReports, namespace),
        filename: `${folderName}.zip`,
      }),
      new webpack.DefinePlugin({
        XRITE_REPORTING_SERVICE: JSON.stringify({}),
      }),
      new CopyPlugin(
        {
          patterns: [
            { from: `src/reports/${folderName}/config.json`, to: './' },
          ],
        },
      ),
    );
    return newConfig;
  });

  return configurations;
};
