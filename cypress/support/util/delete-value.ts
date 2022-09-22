/* eslint-disable cypress/no-unnecessary-waiting */
import { dataImportSuccessNotification } from '../components/page-elements/invisible-element-selectors/database-import/database-import-selectors';

Cypress.Commands.add('deleteExistingOption', (
  prefix: string,
): any => {
  cy.get(`[data-testid="${prefix}-actions-options-button"]`).click({ force: true });
  cy.get(`[data-testid="${prefix}-actions-delete-item"]`).click({ force: true });
  if (['sample', 'standard'].includes(prefix)) {
    cy.get('[data-testid="confirmation-popover-confirm"]').click({ force: true });
  }
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
  cy.wait(3000);
  cy.get(dataImportSuccessNotification).should('not.exist');
});
