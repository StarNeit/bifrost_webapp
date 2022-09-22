/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable dot-notation */
import * as fs from 'fs';
import { format } from 'date-fns';
import { downloadData } from './plugins/helpers';
import { fetchEnvironmentalVariables } from './support/util/fetch-env-variables';

console.log('Fetch environmental variables for S3 fixtures');
const env = fetchEnvironmentalVariables('../.env');

const pathPrefix = format(new Date(), 'dd-MM-yyyy_HH-mm-ssa').toUpperCase();
const coveragesDirectory = `./cypress/results/coverages/${pathPrefix}_coverage_report`;
const screenshotDirectory = `results/screenshots/${pathPrefix}_screenshots_results`;

console.log('Creating test result directories');

[
  './results/coverages',
  screenshotDirectory,
].forEach((path: string) => {
  fs.mkdir(
    path,
    { recursive: true },
    (err) => {
      if (err) {
        console.log(err);
      }
    },
  );
});

const configFolder = JSON.parse(fs.readFileSync('../cypress.json').toString());
Object.assign(configFolder, {
  coveragesFolder: coveragesDirectory,
  screenshotsFolder: `./cypress/${screenshotDirectory}`,
});

fs.writeFileSync('../cypress.json', JSON.stringify(configFolder, null, 2));
console.log('Test result directories created');

console.log('Downloading standards from S3');
downloadData('standards/', 'fixtures', { env });
console.log('Standards successfully downloaded from S3');

console.log('Downloading data-import files from S3');
downloadData('data-import/', 'fixtures', { env });
console.log('Data-import files successfully downloaded from S3');

console.log('Downloading formulation files from S3');
downloadData('formulations/', 'fixtures', { env })
  .then((testData) => {
    setTimeout(() => {
      console.log('Formulation files successfully downloaded from S3');
      console.log('Generating metadata file for downloaded files');
      const formulations = [];
      testData.forEach((test) => {
        const testFile = fs.readFileSync(`./fixtures/formulations/${test}`);
        const currentTestFile = JSON.parse(testFile.toString());
        const formulationData = currentTestFile.formulationResultData !== undefined;
        const correctionsData = currentTestFile.correctionResultData !== undefined;
        const correctionSetupMode = currentTestFile.state.correction.correctionSettings;
        formulations.push({
          name: test,
          containsFormulation: formulationData,
          containsCorrection: correctionsData,
          correctionSetupMode,
        });
      });

      const standards = fs.readdirSync('./fixtures/standards/');
      const dataImports = fs.readdirSync('./fixtures/data-import/');
      fs.writeFileSync('./fixtures/metadata.json', JSON.stringify({ formulations, standards, dataImports }, null, 4));
      console.log('A metadata file has been successfully generated');
    }, 5000);
  });
