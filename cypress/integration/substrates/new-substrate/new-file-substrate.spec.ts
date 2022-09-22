/// <reference types='Cypress' />

import { qualityMetallizedOptions, qualityPCOOptions, typeOptions } from '../../../support/components/substrate/substrate-options';
import metadata from '../../../fixtures/metadata.json';

const files = metadata.standards.filter((name) => name.includes('ifrx'));

Cypress._.range(0, files.length).forEach((i) => {
  const fileName = files[i];
  const typeOfFile = fileName.split('.')[1].toUpperCase();

  describe(`New Substrate from a ${typeOfFile} file feature`, { retries: 1 }, () => {
    beforeEach(() => {
      cy.login();
      cy.openDialogFor('substrate', 'new');
    });

    it(`should import data from a ${typeOfFile} file, with Substrate Type: ${typeOptions[0]}`, () => {
      cy.populateDialogAndValidate(
        'substrate',
        'file',
        `${fileName} - Testing substrate creation with File`,
        {
          acl: '`test',
          type: typeOptions[0],
          numberOfIterations: i,
          fileName,
        },
      );
    });

    qualityMetallizedOptions.forEach((option) => {
      it(`should import data from a ${typeOfFile} file, with Substrate Type: ${typeOptions[1]} and Substrate Quality: ${option}`, () => {
        cy.populateDialogAndValidate(
          'substrate',
          'file',
          `${fileName} - Testing substrate creation with File`,
          {
            acl: '`test',
            type: typeOptions[1],
            quality: option,
            numberOfIterations: i,
            fileName,
          },
        );
      });
    });

    qualityPCOOptions.forEach((option) => {
      it(`should import data from a ${typeOfFile} file, with Substrate Type: ${typeOptions[2]} and Substrate Quality: ${option}`, () => {
        let roughness = 0;

        if (option === 'Uncoated') {
          roughness = 25;
        } else if (option === 'User Defined') {
          roughness = 10;
        }

        cy.populateDialogAndValidate(
          'substrate',
          'file',
          `${fileName} - Testing substrate creation with File`,
          {
            acl: '`test',
            type: typeOptions[2],
            quality: option,
            numberOfIterations: i,
            fileName,
            roughness,
          },
        );
      });
    });

    afterEach(() => {
      cy.deleteExistingOption('substrate');
    });
  });
});
