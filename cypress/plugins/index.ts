/* eslint-disable import/first */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

import { S3 } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import WebSocket from 'ws';
import JSZip from 'jszip';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import webpackOptions from '../webpack.config';
import { fetchEnvironmentalVariables } from '../support/util/fetch-env-variables';
import { buildZipFromDirectory, downloadData, streamToString } from './helpers';

export default (on: any, config: any) => {
  // Make sure env variables from .env are available when tests are executed locally
  config.env = fetchEnvironmentalVariables('./.env');

  on('file:preprocessor', webpackPreprocessor({ webpackOptions }));

  on('before:run', () => {
    const directory = './cypress/downloads';

    if (fs.existsSync(directory)) {
      rimraf.sync(directory);
      fs.mkdirSync(directory);
    }
  });

  on('after:run', async () => {
    const zip = new JSZip();
    const configFolder = JSON.parse(fs.readFileSync('./cypress.json').toString());
    const directoryPath = configFolder.coveragesFolder.split('/');
    const zipName = directoryPath[directoryPath.length - 1].concat('.zip');

    console.log('Begin zipping of report files');
    buildZipFromDirectory('./coverage/lcov-report', zip);
    console.log('Report files have been successfully zipped');

    const zipFile = await zip.generateAsync({
      type: 'nodebuffer',
      compressionOptions: {
        level: 9,
      },
    });

    console.log('Downloading zip file: ', zipName);
    fs.writeFileSync(configFolder.coveragesFolder.concat('.zip'), zipFile);
    console.log('Download complete');
  });

  on('task', {
    ...require('@cypress/code-coverage/task')(on, config),
    readdir(dirPath: string) {
      return fs.readdirSync(`./cypress/${dirPath}`);
    },

    getDataFromSocket() {
      return new Promise<void>((resolve) => {
        const url = 'ws://localhost';
        const webSocket = new WebSocket(url);
        webSocket.onopen = () => {
          webSocket.onmessage = (event) => {
            const json = event.data.toString();
            console.log(json);
            const parsedData = JSON.parse(json);
            resolve(parsedData);
            webSocket.close();
          };
        };
      });
    },

    sendMockDataToBridge(data: any) {
      return new Promise<void>((resolve) => {
        const url = 'ws://localhost';
        const webSocket = new WebSocket(url);
        webSocket.onopen = () => {
          console.log('Sending data to socket');
          webSocket.send(JSON.stringify(data));
          console.log('Done');
          webSocket.close();
          console.log('Resolving');
          resolve(null);
        };
      });
    },

    readFilesFromS3(subPrefix = '') {
      const bucket = config.env.fixtureBucket;
      const prefix = config.env.fixturePrefix + subPrefix;
      const region = config.env.fixtureRegion;

      const s3Client = new S3({ region });
      return s3Client
        .listObjects({
          Bucket: bucket,
          Prefix: prefix,
        })
        .then((objects) => {
          const promises = objects.Contents.filter((x) => x.Size > 0).map(
            (obj) => s3Client.getObject({ Bucket: bucket, Key: obj.Key })
              .then((x) => streamToString(x.Body as Readable))
              .then((x) => JSON.parse(x)),
          );

          return Promise.all(promises);
        });
    },
    downloadFilesFromS3(subPrefix = '') {
      return downloadData(subPrefix, 'cypress/fixtures', config);
    },

    readJSONFiles(fixtureDir: string) {
      const dirPath = `./cypress/${fixtureDir}`;

      const files = fs.readdirSync(dirPath);
      const jsonFiles = files.filter((x: string) => x.indexOf('.json') >= 0);

      const result = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const file of jsonFiles) {
        const fullPath = path.join(dirPath, file);
        const content = fs.readFileSync(fullPath).toString();
        result.push(JSON.parse(content));
      }

      return result;
    },
  });

  return config;
};
