import fs from 'fs';
import path from 'path';
import axios from 'axios';
import open from 'open';
import { S3 } from 'aws-sdk';

import paths from '../../config/paths';
import { s3Bucket, namespace, apiReportEndpoint } from '../../config/reports';

const s3 = new S3();

const downloadFile = async (destinationPath: string, reportName: string) => {
  const testDataPath = path.resolve(__dirname, reportName, 'testData.json');
  const testDataContent = fs.readFileSync(testDataPath, 'utf8');
  const testData = JSON.parse(testDataContent);

  const response = await axios({
    method: 'POST',
    url: apiReportEndpoint,
    responseType: 'stream',
    data: {
      templateName: `${namespace}/${reportName}`,
      payload: testData,
    },
    headers: {
      // TODO: change this to the lambda env variable
      'xr-trustcode': 'vP@bF^PcxSTL#xZ',
    },
  });
  response.data.pipe(fs.createWriteStream(destinationPath));

  return new Promise((resolve, reject) => {
    response.data.on('end', () => resolve(destinationPath));
    response.data.on('error', () => reject());
  });
};

const test = async () => {
  const reportName = process.argv[2];
  if (!reportName) throw new Error('Missing "reportName". Please launch the command as: "npm run test-report -- formulation"');

  const templateId = `${namespace}/${reportName}`;
  const templateFilename = `${templateId}.zip`;
  const templateFilePath = path.join(paths.distReports, templateFilename);
  const reportFilePath = path.join(paths.distReports, `${templateId}.pdf`);

  console.log('Uploading template to S3...');
  await s3.upload({
    Key: templateFilename,
    Body: fs.createReadStream(templateFilePath),
    Bucket: s3Bucket,
    ContentType: 'application/pdf',
  }).promise();

  console.log('Downloading report from API...');
  await downloadFile(reportFilePath, reportName);
  console.log(`Report downloaded successfully at the following path: ${reportFilePath}`);

  console.log('Opening report with default application...');
  open(reportFilePath);

  console.log('Test completed.');
};

test();
