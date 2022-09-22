# Bifrost WebApp

# Development setup and prerequisites

This app uses private X-Rite packages hosted on AWS CodeArtifact.
To do this, you need to have AWS CLI set up with the appropriate [AWS IAM Credentials](https://console.aws.amazon.com/iam/home?region=eu-west-1#/security_credentials), follow the instructions for installing [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) and configuring [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html).

If everything is configured okay and you have the correct permissions, then as a `preinstall` step npm should log into CodeArtifact and get you a working token.

If you have any issues, you can try a `dry-run` by executing: `npm run preinstall -- --dry-run` if everything is okay you sould see three commands an the final one containing an access token, then you should be good to go. If not, then use the error information for further debugging or contact IT for support.

If the installation is successful, the next step is to setup [husky](https://typicode.github.io/husky/#/) by running `npm run prepare`. If you are doing your git pushes/commits using VsCode or different IDE you have to create `~/.huskyrc` file and add:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## Status

- develop-new branch
  ![Build Status](https://codebuild.eu-west-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiRnlLYStmcDlWditZKzdkSHFLQnZmR082VGVpVWxCYjJSQzJna25tMU5WQmNWL1NoNUJSNjdjNWJCdVZLRmV5WGNIc09IemlaRDJvdjVoZTJJVEM3SFRBPSIsIml2UGFyYW1ldGVyU3BlYyI6InhTZlcvVUd4Y2pvMk9obzEiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=develop-new)

- develop-new branch URL: https://d27b7xf5gle4m7.cloudfront.net

- release branch
  ![Build Status](https://codebuild.eu-west-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoienM1TzNDUldZZ09YcHdIQ3dxQjRjbjhxN1B3cS8yYVV1dXJBTXBQYWVteG53RmovdEJIL2h5aW45ek9mcTNsN2c0c2lBaVE0ZDVrOE5uRWdHaEVzRndjPSIsIml2UGFyYW1ldGVyU3BlYyI6IlYyYnpxVEhjMEdER2plSWQiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=release)

- release branch URL: https://dhfoaohha11g2.cloudfront.net

## Reports

Launch development of a report: npm run start-report -- --env reportName=formulation

Create a distribution version of reports (in the "dist-reports" folder): npm run dist-reports

Serve a distribution version of a report: npx serve dist-reports/bifrost/formulation
(can't pass payload though)

Launch integration test of a report: npm run dist-reports -- --env reportName=formulation && npm run test-report -- formulation

- Creates the distribution version of a report, uploads it on AWS and invokes the Reporting Service API to generate the report
- PDF file is saved in "dist-reports"

The API endpoint is below with the body that must be sent to print the recipe display table (POST Request).

<https://vaxysawv8h.execute-api.eu-west-1.amazonaws.com/development/report>

```
  {
    templateName: 'bifrost/formulation',
    payload: ReportProps;
  }
```
