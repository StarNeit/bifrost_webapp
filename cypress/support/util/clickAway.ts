Cypress.Commands.add('clickAway', (): any => {
  // Remove focus from current element
  cy.get('body').click(0, 0);
});
