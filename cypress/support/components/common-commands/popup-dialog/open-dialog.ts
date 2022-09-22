Cypress.Commands.add('openDialogFor', (name: string, option: string): any => {
  cy.get(`[data-testid="${name}-actions-options-button"]`).click();
  cy.get(`[data-testid="${name}-actions-${option}-item"]`).click();
  cy.get('[data-testid="full-screen-modal"]').should('be.visible');
});
