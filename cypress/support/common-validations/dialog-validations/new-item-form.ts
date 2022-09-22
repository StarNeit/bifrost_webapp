Cypress.Commands.add('verifyNewItemForm', (currentItemName: string): any => {
  // Verify the fields on the left side of the dialog (Item name definition, ACL selection)
  cy.get(`[data-testid="new-${currentItemName}-name"] input`)
    .should('be.visible')
    .should('be.enabled');

  cy.get('#acl-select').should('exist');
  cy.get('#acl-select').find('input').should('be.enabled');
  cy.get(`[data-testid="save-new-${currentItemName}-button"]`).should('be.visible').should('be.disabled');
});
