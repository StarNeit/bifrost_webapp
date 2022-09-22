/// <reference types='Cypress' />

describe('New standard feature', () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('standard', 'new');
  });

  it('should check initial state of the "New Standard" dialog', () => {
    cy.get('[data-testid="slide-title"]').should('have.text', 'New Standard');
    cy.verifyInitNewItemForm('new-standard-name', 'save-new-standard-button', 'new-standard');
  });

  it('should check initial state of "Import data from DMS" form', () => {
    cy.verifyNewDMSItemInitialState('standard');
  });

  it('should check initial state of "Import data from file" form', () => {
    cy.verifyNewFileItemInitialState('standard');
  });
});
