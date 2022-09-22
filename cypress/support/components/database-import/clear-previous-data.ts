import { dataImportWorkspaceBrowserLoader } from '../page-elements/invisible-element-selectors/database-import/database-import-selectors';

Cypress.Commands.add('clearPreviouslyImportedData', (): any => {
  cy.getDatabaseImportElements();
  cy.get(dataImportWorkspaceBrowserLoader).should('not.exist');
  cy.get('@DataImportClearButton').then((element) => {
    if (!element.attr('disabled')) {
      cy.get('@DataImportClearButton')
        .click()
        .should('be.disabled');
    }
  });
});
