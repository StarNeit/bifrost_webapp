Cypress.Commands.add('verifyNewDMSItemInitialState', (currentItemName: string): any => {
  cy.get('[data-testid="dms-button"]')
    .click()
    .should('have.attr', 'data-test-is-selected', 'true');

  // Verify the fields on the left side of the dialog (Item name definition, ACL selection)
  cy.verifyNewItemForm(currentItemName);

  // Verify the fields in the header of the DMS browser widget
  cy.get('[data-testid="dms-browser"]').should('be.visible');
  cy.get('[data-testid="dms-browser-header-title"]').should('have.text', 'Devices');
  cy.get('#dms-browser-select-device').should('have.text', 'Select...');

  // Verify the fields in the body of the DMS browser widget
  cy.get('[data-testid="dms-browser-jobs"]').should('be.visible');
  cy.get('[data-testid="dms-browser-jobs-header-title"').should('have.text', 'Sample');
  cy.get('[data-testid="dms-browser-jobs-search"] input').should('have.attr', 'placeholder', 'Search...');

  cy.get('[data-testid="no-selections-label"]')
    .should('have.text', 'No jobs available for this selection');
});
