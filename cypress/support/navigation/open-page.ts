Cypress.Commands.add('goToPage', (page): any => {
  cy.get('[data-testid="loading-nav-pane"]').should('not.be.exist');
  cy.get('[data-testid="loading-spinner"]').should('not.be.exist');

  const pageId = page.split(' ')[0].toLowerCase();

  cy.getNavBarElements();
  cy.get('@HamburgerButton').click();
  cy.get('@HamburgerContainer').should('be.visible');
  cy.get(`[data-testid="hamburger-${pageId}-menu-item"]`)
    .click();
});
