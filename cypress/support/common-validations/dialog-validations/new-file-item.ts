Cypress.Commands.add('verifyNewFileItemInitialState', (
  currentItemName: string,
): any => {
  cy.get('[data-testid="file-button"]').click().should('have.attr', 'data-test-is-selected', 'true');

  // Verify the fields on the left side of the dialog (Item name definition, ACL selection)
  cy.verifyNewItemForm(currentItemName);

  // Verify the fields in the header of the File browser widget
  cy.get('[data-testid="file-browser"]').should('be.visible');
  cy.get('[data-testid="file-upload-title"]').should('have.text', 'Please select a file');
  cy.get('[data-testid="file-upload-button"]').should('be.enabled').should('have.text', 'Select file');

  // Verify the fields of the body of the File browser widget
  cy.get('[data-testid="file-browser-colorant-header-title"]').should('have.text', 'Sample');
  cy.get('[data-testid="file-browser-colorant-search"] input').should('have.attr', 'placeholder', 'Search...');
  cy.get('[data-testid="fbct-header-name"]').should('have.text', 'Name');
});
