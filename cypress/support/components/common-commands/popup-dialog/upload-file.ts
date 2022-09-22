Cypress.Commands.add('uploadFileForImportInDialogAndValidate', (
  fileName: string,
  newItemName: string,
): any => {
  cy.get('[data-testid="file-upload-button-attach-file"] input').attachFile(`standards/${fileName}`);

  // Verify fields before upload
  cy.get('[data-testid="uploaded-file-name"').should('have.text', fileName);
  cy.get('[data-testid="file-browser-colorant-header-title"]').should('have.text', 'Sample');
  cy.get('[data-testid="file-browser-colorant-search"] input').should('have.attr', 'placeholder', 'Search...');
  cy.get('[data-testid="fbct-header-name"]').should('have.text', 'Name');

  // Verify fields after upload
  cy.get('[data-testid="file-upload-loading-spinner"]').should('not.be.exist');
  cy.get('#notistack-snackbar').should('have.text', 'File uploaded successfully!');
  cy.get('[data-testid="close-snackbar"]').should('have.attr', 'data-test-variant', 'success').click();

  // Validate each row from the imported file
  cy.get('[data-testid="file-browser-colorants-table-rows"]').children().then((rows) => {
    rows.each((index, row) => {
      const selector = row.attributes.getNamedItem('data-testid').textContent;
      cy.get(`[data-testid="${selector}"]`).click();

      const name = row.children[2];
      cy.get(`[data-testid="new-${newItemName}-name"] input`).should('have.value', name.textContent);
    });
  });
});
