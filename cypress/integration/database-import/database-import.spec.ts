/* eslint-disable array-callback-return */
/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types='Cypress' />

import metadata from '../../fixtures/metadata.json';
import {
  dataImportCloseNotification,
  dataImportSuccessNotification,
  dataImportTables,
  dataImportUploadedFileName,
  dataImportUploadingFileLoader,
  dataImportWorkspaceBrowserLoader,
  emptyWorkspaceSelector,
} from '../../support/components/page-elements/invisible-element-selectors/database-import/database-import-selectors';

const databaseImportTestFiles = metadata.dataImports.filter((data) => ![
  'AT-Assortment.ifsx',
  'AT-BasicMaterials.ifgx',
  'AT-ThicknessObjects.iftx',
].includes(data));

const tables = dataImportTables
  .filter((tableName) => !['assortments'].includes(tableName));

describe('Database Import Page', () => {
  beforeEach(() => {
    cy.login();
    cy.goToPage('Import');
    cy.clearPreviouslyImportedData();
  });

  Cypress._.range(0, databaseImportTestFiles.length).forEach((i) => {
    const fileName = databaseImportTestFiles[i];
    const filteredTable = tables
      .filter((tableName) => tableName !== 'trials'
        || (tableName === 'trials' && fileName.includes('.mif')));

    it(`should be able to import the data from the following file: ${fileName.toUpperCase()}`, () => {
      cy.get('@DataImportAttachFile').find('input').attachFile(`data-import/${fileName}`);

      // Verify fields before upload
      cy.get(dataImportUploadedFileName).should('have.text', fileName);

      // Verify fields after upload
      cy.get(dataImportUploadingFileLoader).should('not.be.exist');
      cy.get(dataImportSuccessNotification).should('have.text', 'File uploaded successfully!');
      cy.get(dataImportCloseNotification).should('have.attr', 'data-test-variant', 'success').click();
      cy.get(dataImportWorkspaceBrowserLoader).should('not.exist');

      // Import each of the tables in the workspace
      filteredTable.forEach((tableName) => {
        cy.get('body').then((body) => {
          if (body.find(emptyWorkspaceSelector).length === 0) {
            cy.importAvailableData(tableName);
          } else {
            cy.get(emptyWorkspaceSelector)
              .should('have.text', 'Your workspace is empty. Please upload a file!');
          }

          if (filteredTable.indexOf(tableName) === filteredTable.length - 1) {
            cy.goToPage('Formulation');
            cy.reload(); // temporary step until bugfix is resolved
            cy.waitForFormulationPageToLoad();
            cy.verifyImportedData(fileName, filteredTable);
          }
        });
      });
    });
  });

  afterEach(() => {
    tables.forEach((table) => {
      const key = `${table}Data`;
      localStorage.removeItem(key);
    });

    if (localStorage.getItem('standardSubstrateRelations')) {
      localStorage.removeItem('standardSubstrateRelations');
    }
  });
});
