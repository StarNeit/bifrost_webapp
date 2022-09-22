Cypress.Commands.add('getNavBarElements', (): any => {
  cy.get('[data-testid="hamburger-menu-button"]').as('HamburgerButton');
  cy.get('[data-testid="hamburger-menu-container"]').as('HamburgerContainer');

  cy.get('[data-testid="feedback-button"]').as('FeedbackButton');

  cy.get('[data-testid="languange-menu-button"]').as('LanguageButton');
  cy.get('[data-testid="languange-menu-container"]').as('LanguageContainer');

  cy.get('[data-testid="user-menu-button"]').as('UserButton');
  cy.get('[data-testid="user-menu-container"]').as('UserContainer');
});
