/// <reference types='Cypress' />

const username = Cypress.env('username');
const password = Cypress.env('password');

describe('Login Page', { requestTimeout: 30000 }, () => {
  it('should fail to log in with the wrong credentials.', () => {
    cy.visit('/#/search');

    cy.get('[data-testid="email-input"]')
      .click()
      .clear()
      .type('dummy@example.com');

    cy.get('[data-testid="password-input"]')
      .click()
      .clear()
      .type('wrongpass');

    cy.get('[data-testid="login-button"]').click();

    cy.contains('Email or password is invalid').should('be.visible');
  });

  it('should login with the right credentials', () => {
    cy.visit('/#/search');

    cy.get('[data-testid="email-input"]')
      .click()
      .clear()
      .type(username);

    cy.get('[data-testid="password-input"]')
      .click()
      .clear()
      .type(password);

    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="password-input"]').should('not.exist');
  });

  it('should log out on clicking logout menu item', () => {
    cy.login();

    cy.get('[data-testid="user-menu-button"]')
      .click();
    cy.get('[data-testid="user-menu-logout-menu-item"]').should('be.visible').click();

    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="user-menu-button"]').should('not.exist');
  });

  it('should log out on clicking logout menu item and then log back in', () => {
    cy.login();

    cy.get('[data-testid="user-menu-button"]')
      .click();
    cy.get('[data-testid="user-menu-logout-menu-item"]').should('be.visible').click();

    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="user-menu-button"]').should('not.exist');

    cy.get('[data-testid="email-input"]')
      .click()
      .clear()
      .type(username);

    cy.get('[data-testid="password-input"]')
      .click()
      .clear()
      .type(password);

    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="password-input"]').should('not.exist');
  });
});
