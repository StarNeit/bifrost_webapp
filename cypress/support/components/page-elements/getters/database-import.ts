Cypress.Commands.add('getDatabaseImportElements', (): any => {
  // Import file elements
  cy.get('[data-testid="file-upload-title"]').as('DataImportUploadTitle');
  cy.get('[data-testid="file-upload-button"]').as('DataImportFileUploadButton');
  cy.get('[data-testid="file-upload-button-attach-file"]').as('DataImportAttachFile');
  cy.get('[data-testid="data-import-clear-button"]').as('DataImportClearButton');

  // Workspace elements
  cy.get('[data-testid="data-import-workspace-browser"]').as('DataImportWorkspaceBrowser');
  cy.get('[data-testid="data-import-workspace-browser-objects"]').as('DataImportWorkspaceObjects');
});
