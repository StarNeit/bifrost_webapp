/* eslint-disable no-console */
import * as fs from 'fs';
import format from 'date-fns/format';

let emailTemplate = fs.readFileSync('./cypress/results/reports/temp/mailTemplate.html').toString();

const testReport = JSON.parse(fs.readFileSync('./cypress/results/reports/temp/testReport.json').toString());
const codeCoverageReport = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json').toString());
const configFile = JSON.parse(fs.readFileSync('./cypress.json').toString());

console.log('Generating email template');
['start', 'end'].forEach((date) => {
  emailTemplate = emailTemplate.replace(
    `{{${date}OfTests}}`,
    format(
      new Date(testReport.stats[date]),
      'yyyy-MM-dd HH:mm:ss',
    ),
  );
});

emailTemplate = emailTemplate.replace(
  '{{testSuites}}',
  testReport.stats.suites,
);

['passes', 'failures', 'skipped', 'pending'].forEach((status) => {
  emailTemplate = emailTemplate.replace(
    `{{${status}Tests}}`,
    testReport.stats[status],
  );
});

['Lines', 'Statements', 'Functions', 'Branches'].forEach((coverage) => {
  emailTemplate = emailTemplate.replace(
    `{{total${coverage}}}`,
    codeCoverageReport.total[coverage.toLowerCase()].total,
  ).replace(
    `{{covered${coverage}}}`,
    codeCoverageReport.total[coverage.toLowerCase()].covered,
  ).replace(
    `{{skipped${coverage}}}`,
    codeCoverageReport.total[coverage.toLowerCase()].skipped,
  ).replace(
    `{{percentage${coverage}}}`,
    codeCoverageReport.total[coverage.toLowerCase()].pct,
  );
});

const coverageFilePath = configFile.coveragesFolder.split('/');
const coverageFileName = coverageFilePath[coverageFilePath.length - 1];
emailTemplate = emailTemplate.replace(
  '{{codeCoverageReport}}',
  coverageFileName,
);

fs.writeFileSync(
  './cypress/results/reports/latestMailTemplate.html',
  emailTemplate,
);
console.log('Email template successfully generated');
