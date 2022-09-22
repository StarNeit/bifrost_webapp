/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ObsoleteWebpackPlugin = require('obsolete-webpack-plugin');
const path = require('path');
const { LicensesWebpack4Plugin } = require('@xrite/licenses-credits');

const paths = require('./paths');
const { getCommitCount, getLastCommitHash } = require('./gitUtils');

module.exports = async (env = {}) => {
  const HOST_PROD = '/';
  const HOST_UAT = '/';
  const HOST_DEV = '/';
  const HOST_LOCAL = 'http://localhost:3000/';

  const DMS_URL_DEV = 'https://6yxz33f7nbegroadl4khejkjzy.appsync-api.eu-west-1.amazonaws.com/graphql';
  const DMS_API_KEY_DEV = 'da2-dr5y2lcv7raebh7fkrkwdirszi';
  const DMS_URL_UAT = DMS_URL_DEV;
  const DMS_API_KEY_UAT = DMS_API_KEY_DEV;
  const DMS_URL_PROD = 'https://2qfy3yhfojh33e7ldrvgb2alhy.appsync-api.us-east-1.amazonaws.com/graphql';
  const DMS_API_KEY_PROD = 'da2-osbjlahgizcrnlg3pzt5seoh5e';

  const CFE_URL_DEV = 'wss://wpj7rklnnk.execute-api.eu-west-1.amazonaws.com/dev';
  const CFE_URL_UAT = CFE_URL_DEV;
  const CFE_URL_PROD = 'wss://cfe.xrite.com/production';

  const USS_URL_DEV = 'https://ufuv93n75i.execute-api.eu-west-1.amazonaws.com/development';
  const USS_URL_PROD = 'https://cm7dka7ms9.execute-api.us-east-1.amazonaws.com/production';

  const FMS_URL_UAT = 'https://8uj3rk4at0.execute-api.us-east-2.amazonaws.com/Prod/api';
  const FMS_URL_PROD = 'https://z1l22k3f3e.execute-api.us-east-1.amazonaws.com/Prod/api';

  const REPORTING_SERVICE_URL_DEV = 'https://vaxysawv8h.execute-api.eu-west-1.amazonaws.com/development';
  const REPORTING_SERVICE_URL_PROD = 'https://6t8blscjeg.execute-api.us-east-1.amazonaws.com/production';

  const APPEARANCE_DATA_EXPORT_SERVICE_URL_DEV = 'https://c9fpl6503j.execute-api.eu-west-1.amazonaws.com/development';
  const APPEARANCE_DATA_EXPORT_SERVICE_URL_PROD = 'https://iqqc384ds0.execute-api.us-east-1.amazonaws.com/production';

  const CDIS_REST_URL_DEV = 'https://092xuqeeog.execute-api.eu-west-1.amazonaws.com/dev';
  const CDIS_WS_URL_DEV = 'wss://qmtcyc9z4d.execute-api.eu-west-1.amazonaws.com/dev/';
  const CDIS_REST_URL_PROD = 'https://15hw5ghryc.execute-api.us-east-1.amazonaws.com/production';
  const CDIS_WS_URL_PROD = 'wss://wkr6p1ay8c.execute-api.us-east-1.amazonaws.com/production/';

  const CFDB_URL_UAT = 'https://jjtd7rcmsrcanhgrjw7rmat2j4.appsync-api.eu-west-1.amazonaws.com/graphql';
  const CFDB_API_KEY_UAT = 'da2-nnha2og2araptc3zbtyyvphwpi';
  const CFDB_URL_PROD = 'https://gq45sssyczgilepsqcpaj3gvcm.appsync-api.us-east-1.amazonaws.com/graphql';
  const CFDB_API_KEY_PROD = 'da2-rakqkdfqj5ecxn2slb2uu2tbba';
  // const CFDB_URL_DEV = 'https://nbm2xogelzagbgx45qvcsj5yvi.appsync-api.eu-west-1.amazonaws.com/graphql';
  // const CFDB_API_KEY_DEV = 'da2-wqjdlvntcva5jhljnpoyztqlpm';

  const CREATE_USER_URL_DEV = 'https://devicedashboard-uat.xrite.com/Admin/UsersAndLocations';
  const CREATE_USER_URL_PROD = 'https://devicedashboard.xrite.com/Admin/UsersAndLocations';

  const FORGOT_PASSWORD_URL_PROD = 'https://account.xrite.com/Account/PasswordReset';
  const FORGOT_PASSWORD_URL_DEV = 'https://account-uat.xrite.com/Account/PasswordReset';

  let HOST;
  let DMS_URL;
  let DMS_API_KEY;
  let CFE_URL;
  let FMS_URL;
  let REPORTING_SERVICE_URL;
  let APPEARANCE_DATA_EXPORT_SERVICE_URL;
  let CDIS_REST_URL;
  let CDIS_WS_URL;
  let CFDB_URL;
  let CFDB_API_KEY;
  let CREATE_USER_URL;
  let DB_USE_CREDENTIALS = 'true';
  let GOOGLE_ANALYTICS_ID = 'G-328M4XE48S';
  let HOTJAR_ID = '2397352';
  let FORGOT_PASSWORD_URL;
  let ENABLE_TEST_DATA_EXTRACTION = false;
  let USS_URL;

  const { API_ENV, NODE_ENV, npm_package_version: VERSION } = process.env;

  if (API_ENV === 'PROD') {
    HOST = HOST_PROD;
    DMS_URL = DMS_URL_PROD;
    DMS_API_KEY = DMS_API_KEY_PROD;
    CFE_URL = CFE_URL_PROD;
    FMS_URL = FMS_URL_PROD;
    REPORTING_SERVICE_URL = REPORTING_SERVICE_URL_PROD;
    APPEARANCE_DATA_EXPORT_SERVICE_URL = APPEARANCE_DATA_EXPORT_SERVICE_URL_PROD;
    CDIS_REST_URL = CDIS_REST_URL_PROD;
    CDIS_WS_URL = CDIS_WS_URL_PROD;
    CFDB_URL = CFDB_URL_PROD;
    CFDB_API_KEY = CFDB_API_KEY_PROD;
    GOOGLE_ANALYTICS_ID = 'G-X7DLC8JJ0Y';
    HOTJAR_ID = '2395220';
    CREATE_USER_URL = CREATE_USER_URL_PROD;
    FORGOT_PASSWORD_URL = FORGOT_PASSWORD_URL_PROD;
    ENABLE_TEST_DATA_EXTRACTION = false;
    USS_URL = USS_URL_PROD;
  } else if (API_ENV === 'UAT') {
    HOST = HOST_UAT;
    DMS_URL = DMS_URL_UAT;
    DMS_API_KEY = DMS_API_KEY_UAT;
    CFE_URL = CFE_URL_UAT;
    FMS_URL = FMS_URL_UAT;
    APPEARANCE_DATA_EXPORT_SERVICE_URL = APPEARANCE_DATA_EXPORT_SERVICE_URL_DEV;
    REPORTING_SERVICE_URL = REPORTING_SERVICE_URL_DEV;
    CDIS_REST_URL = CDIS_REST_URL_DEV;
    CDIS_WS_URL = CDIS_WS_URL_DEV;
    CFDB_URL = CFDB_URL_UAT;
    CFDB_API_KEY = CFDB_API_KEY_UAT;
    CREATE_USER_URL = CREATE_USER_URL_DEV;
    FORGOT_PASSWORD_URL = FORGOT_PASSWORD_URL_DEV;
    ENABLE_TEST_DATA_EXTRACTION = true;
    USS_URL = USS_URL_DEV;
  } else if (API_ENV === 'DEV') {
    HOST = HOST_DEV;
    DMS_URL = DMS_URL_DEV;
    DMS_API_KEY = DMS_API_KEY_DEV;
    CFE_URL = CFE_URL_DEV;
    FMS_URL = FMS_URL_UAT;
    REPORTING_SERVICE_URL = REPORTING_SERVICE_URL_DEV;
    APPEARANCE_DATA_EXPORT_SERVICE_URL = APPEARANCE_DATA_EXPORT_SERVICE_URL_DEV;
    CDIS_REST_URL = CDIS_REST_URL_DEV;
    CDIS_WS_URL = CDIS_WS_URL_DEV;
    CFDB_URL = CFDB_URL_UAT;
    CFDB_API_KEY = CFDB_API_KEY_UAT;
    CREATE_USER_URL = CREATE_USER_URL_DEV;
    FORGOT_PASSWORD_URL = FORGOT_PASSWORD_URL_DEV;
    ENABLE_TEST_DATA_EXTRACTION = true;
    USS_URL = USS_URL_DEV;
  } else {
    HOST = HOST_LOCAL;
    DMS_URL = DMS_URL_DEV;
    DMS_API_KEY = DMS_API_KEY_DEV;
    CFE_URL = CFE_URL_DEV;
    FMS_URL = FMS_URL_UAT;
    REPORTING_SERVICE_URL = REPORTING_SERVICE_URL_DEV;
    APPEARANCE_DATA_EXPORT_SERVICE_URL = APPEARANCE_DATA_EXPORT_SERVICE_URL_DEV;
    DB_USE_CREDENTIALS = (env.ifsdb) ? 'false' : 'true';
    CDIS_REST_URL = CDIS_REST_URL_DEV;
    CDIS_WS_URL = CDIS_WS_URL_DEV;
    CFDB_URL = CFDB_URL_UAT;
    CFDB_API_KEY = CFDB_API_KEY_UAT;
    CREATE_USER_URL = CREATE_USER_URL_DEV;
    FORGOT_PASSWORD_URL = FORGOT_PASSWORD_URL_DEV;
    ENABLE_TEST_DATA_EXTRACTION = true;
    USS_URL = USS_URL_DEV;
  }

  const GA_ENABLED = API_ENV === 'PROD';

  const COMMIT_COUNT = await getCommitCount();
  const LAST_COMMIT_HASH = await getLastCommitHash();

  const plugins = [
    new LicensesWebpack4Plugin(),
    new HtmlWebpackPlugin({
      template: 'src/templates/index.html',
      templateData: {
        mode: 'mode="SEARCH_AND_CORRECT"',
      },
    }),
    new ObsoleteWebpackPlugin(),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(`${VERSION}.c${COMMIT_COUNT}.${LAST_COMMIT_HASH}`),
      __GA_ENABLED__: GA_ENABLED,
      __HOST__: JSON.stringify(HOST),
      __DMS_URL__: JSON.stringify(DMS_URL),
      __DMS_API_KEY__: JSON.stringify(DMS_API_KEY),
      __CFE_URL__: JSON.stringify(CFE_URL),
      __DB_USE_CREDENTIALS__: JSON.stringify(DB_USE_CREDENTIALS),
      __FMS_URL__: JSON.stringify(FMS_URL),
      __REPORTING_SERVICE_URL__: JSON.stringify(REPORTING_SERVICE_URL),
      __APPEARANCE_DATA_EXPORT_SERVICE_URL__: JSON.stringify(APPEARANCE_DATA_EXPORT_SERVICE_URL),
      __USS_URL__: JSON.stringify(USS_URL),
      __CFDB_URL__: JSON.stringify(CFDB_URL),
      __CFDB_API_KEY__: JSON.stringify(CFDB_API_KEY),
      __CDIS_URL__: JSON.stringify(CDIS_REST_URL),
      __CDIS_WS_URL__: JSON.stringify(CDIS_WS_URL),
      __GOOGLE_ANALYTICS_ID__: JSON.stringify(GOOGLE_ANALYTICS_ID),
      __HOTJAR_ID__: JSON.stringify(HOTJAR_ID),
      __CREATE_USER_URL__: JSON.stringify(CREATE_USER_URL),
      __FORGOT_PASSWORD_URL__: JSON.stringify(FORGOT_PASSWORD_URL),
      __ENABLE_TEST_DATA_EXTRACTION__: JSON.stringify(ENABLE_TEST_DATA_EXTRACTION),
    }),
  ];

  const devtool = NODE_ENV === 'production' ? false : 'eval-source-map';

  return {
    entry: ['react-hot-loader/patch', './src/index.tsx'],
    output: {
      path: path.resolve(__dirname, paths.dist),
      filename: 'bifrost-web-app.js',
    },
    devServer: {
      contentBase: './src',
      port: env.devport || 9000,
      hot: true,
      open: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        }, {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        }, {
          test: /\.(woff(2)?|ttf|eot|svg|jpe?g|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
            loader: 'file-loader',
          }],
        }, {
          test: /\.wasm$/,
          type: 'javascript/auto',
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        }, {
          test: /config.json$/,
          type: 'javascript/auto',
          include: [
            path.resolve(__dirname, './../src/reports'),
          ],
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      ],
    },
    plugins,
    resolve: {
      alias: {
        'react-dom': '@hot-loader/react-dom',
      },
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
    },
    node: {
      fs: 'empty',
    },
    devtool,
  };
};
