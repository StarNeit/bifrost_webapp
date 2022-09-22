Cypress.Commands.add('waitForFormulationPageToLoad', (): any => {
  cy.get('[data-testid="page-title"]').should('be.visible');
  cy.get('#standard-select').should('be.visible');
  cy.get('[data-testid="loading-spinner"]').should('not.be.exist');
  cy.get('[data-testid="loading-nav-pane"]').should('not.be.exist');
});
