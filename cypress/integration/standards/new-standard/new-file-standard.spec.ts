/// <reference types='Cypress' />

import metadata from '../../../fixtures/metadata.json';

const standardFiles = metadata.standards;

describe('New standard from file import feature', () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('standard', 'new');
  });

  Cypress._.range(0, standardFiles.length).forEach((i) => {
    const fileName = standardFiles[i];
    const typeOfFile = fileName.split('.')[1].toUpperCase();
    it(`should be able to import data from a ${typeOfFile} file and create standard`, () => {
      cy.populateDialogAndValidate(
        'standard',
        'file',
        ' - Testing File Upload',
        {
          numberOfIterations: i,
          fileName,
          acl: '`test',
        },
      );

      cy.$$('[data-testid="standard-colors"]').each((index, element) => {
        const colors = element.getAttribute('colors');
        assert.isAtLeast(colors.length, 1, 'Colors have been added');
      });
    });
  });

  afterEach(() => {
    // Remove the newly created standard
    cy.deleteExistingOption('standard');
  });
});
