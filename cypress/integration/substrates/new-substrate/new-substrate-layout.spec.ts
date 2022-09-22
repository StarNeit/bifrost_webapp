/// <reference types='Cypress' />

describe('New Substrate feature', () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('substrate', 'new');
  });

  it('should check initial state of the "New Substrate" dialog', () => {
    cy.get('[data-testid="slide-title"]').should('have.text', 'New Substrate');
    cy.verifyInitNewItemForm('new-substrate-name', 'save-new-substrate-button', 'new-substrate');
  });

  it('should verify the initial state of the Substrate Options fields', () => {
    cy.verifySubstrateOptions();
  });

  it('should check initial state of "Import data from Measurement" form', () => {
    cy.get('[data-testid="dms-browser"]').should('not.exist');
    cy.get('[data-testid="file-browser"]').should('not.exist');
    cy.verifyNewItemForm('substrate');
  });

  it('should check initial state of "Import data from DMS" form', () => {
    cy.get('[data-testid="file-browser"]').should('not.exist');
    cy.verifyNewDMSItemInitialState('substrate');
  });

  it('should check initial state of "Import data from file" form', () => {
    cy.get('[data-testid="dms-browser"]').should('not.exist');
    cy.verifyNewFileItemInitialState('substrate');
  });
});
