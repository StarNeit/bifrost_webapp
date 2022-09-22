/// <reference types='Cypress' />

import { emptyWorkspaceSelector } from '../../support/components/page-elements/invisible-element-selectors/database-import/database-import-selectors';

describe('Database Import Page', () => {
  beforeEach(() => {
    cy.login();
    cy.goToPage('Import');
    cy.getNavBarElements();
    cy.getDatabaseImportElements();
  });

  it('initial state of the page should be verified', () => {
    cy.verifyNavBarItems('Database Import');

    cy.clearPreviouslyImportedData();
    cy.get('@DataImportUploadTitle').should('have.text', 'Please select a file');
    cy.get('@DataImportFileUploadButton').should('be.enabled');
    cy.get('@DataImportClearButton').should('be.disabled');
    cy.get(emptyWorkspaceSelector).should('have.text', 'Your workspace is empty. Please upload a file!');
  });
});
