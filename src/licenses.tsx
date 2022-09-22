import { ReactNode } from 'react';
import { Link } from '@material-ui/core';

const mitLicenseText = ` Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export const getLicenseText = (license: string): ReactNode => {
  switch (license) {
    case 'MIT':
      return mitLicenseText;
    case 'Apache License V2':
      return (
        <Link target="_blank" rel="noopener noreferrer" href="http://www.apache.org/licenses/LICENSE-2.0">
          http://www.apache.org/licenses/LICENSE-2.0
        </Link>
      );
    default:
      return '';
  }
};

const licenses = {
  '@babel/polyfill': {
    licenses: 'MIT',
    repository: 'https://github.com/babel/babel/tree/master/packages/babel-polyfill',
  },
  '@babel/runtime': {
    licenses: 'MIT',
    repository: 'https://github.com/babel/babel/tree/master/packages/babel-runtime',
  },
  '@hot-loader/react-dom': {
    licenses: 'MIT',
    repository: 'https://github.com/hot-loader/react-dom',
  },
  '@material-ui/core': {
    licenses: 'MIT',
    repository: 'https://github.com/mui-org/material-ui',
  },
  '@material-ui/icons': {
    licenses: 'MIT',
    repository: 'https://github.com/mui-org/material-ui',
  },
  '@material-ui/styles': {
    licenses: 'MIT',
    repository: 'https://github.com/mui-org/material-ui',
  },
  '@mdi/js': {
    licenses: 'Apache License V2',
    repository: 'https://github.com/Templarian/MaterialDesign-JS',
  },
  '@mdi/react': {
    licenses: 'MIT',
    repository: 'https://github.com/Templarian/MaterialDesign-React',
  },
  '@types/jest': {
    licenses: 'MIT',
    repository: 'https://github.com/DefinitelyTyped/DefinitelyTyped',
  },
  axios: {
    licenses: 'MIT',
    repository: 'https://github.com/axios/axios',
  },
  classnames: {
    licenses: 'MIT',
    repository: 'https://github.com/JedWatson/classnames',
  },
  'connected-react-router': {
    licenses: 'MIT',
    repository: 'https://github.com/supasate/connected-react-router',
  },
  'date-fns': {
    licenses: 'MIT',
    repository: 'https://github.com/date-fns/date-fns',
  },
  'date-time': {
    licenses: 'MIT',
    repository: 'https://github.com/sindresorhus/date-time',
  },
  'echarts-for-react': {
    licenses: 'MIT',
    repository: 'https://github.com/hustcc/echarts-for-react',
  },
  echarts: {
    licenses: 'Apache License V2',
    repository: 'https://github.com/apache/incubator-echarts',
  },
  'file-saver': {
    licenses: 'MIT',
    repository: 'https://github.com/eligrey/FileSaver.js',
  },
  formik: {
    licenses: 'MIT',
    repository: 'https://github.com/jaredpalmer/formik',
  },
  history: {
    licenses: 'MIT',
    repository: 'https://github.com/ReactTraining/history',
  },
  i18next: {
    licenses: 'MIT',
    repository: 'https://github.com/i18next/i18next',
  },
  'js-sha256': {
    licenses: 'MIT',
    repository: 'https://github.com/emn178/js-sha256',
  },
  'memoize-one': {
    licenses: 'MIT',
    repository: 'https://github.com/alexreardon/memoize-one',
  },
  'obsolete-webpack-plugin': {
    licenses: 'MIT',
    repository: 'https://github.elenet.me/fe/obsolete-webpack-plugin',
  },
  'prop-types': {
    licenses: 'MIT',
    repository: 'https://github.com/facebook/prop-types',
  },
  'query-string': {
    licenses: 'MIT',
    repository: 'https://github.com/sindresorhus/query-string',
  },
  'react-dom': {
    licenses: 'MIT',
    repository: 'https://github.com/facebook/react',
  },
  'react-hot-loader': {
    licenses: 'MIT',
    repository: 'https://github.com/gaearon/react-hot-loader',
  },
  'react-i18next': {
    licenses: 'MIT',
    repository: 'https://github.com/i18next/react-i18next',
  },
  'react-redux': {
    licenses: 'MIT',
    repository: 'https://github.com/reduxjs/react-redux',
  },
  'react-router-dom': {
    licenses: 'MIT',
    repository: 'https://github.com/ReactTraining/react-router',
  },
  'react-select': {
    licenses: 'MIT',
    repository: 'https://github.com/JedWatson/react-select',
  },
  'react-to-print': {
    licenses: 'MIT',
    repository: 'https://github.com/gregnb/react-to-print',
  },
  'react-window': {
    licenses: 'MIT',
    repository: 'https://github.com/bvaughn/react-window',
  },
  'react-zoom-pan-pinch': {
    licenses: 'MIT',
    repository: 'https://github.com/prc5/react-zoom-pan-pinch',
  },
  react: {
    licenses: 'MIT',
    repository: 'https://github.com/facebook/react',
  },
  'redux-saga': {
    licenses: 'MIT',
    repository: 'https://github.com/redux-saga/redux-saga',
  },
  redux: {
    licenses: 'MIT',
    repository: 'https://github.com/reduxjs/redux',
  },
  'regenerator-runtime': {
    licenses: 'MIT',
    repository: 'https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime',
  },
  reselect: {
    licenses: 'MIT',
    repository: 'https://github.com/reduxjs/reselect',
  },
  'shallow-equal': {
    licenses: 'MIT',
    repository: 'https://github.com/moroshko/shallow-equal',
  },
  'socket.io-client': {
    licenses: 'MIT',
    repository: 'https://github.com/Automattic/socket.io-client',
  },
  uuid: {
    licenses: 'MIT',
    repository: 'https://github.com/uuidjs/uuid',
  },
};

export default licenses;
