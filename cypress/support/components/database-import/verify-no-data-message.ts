Cypress.Commands.add('verifyNoAvailableDataForSection', (
  tableName: string,
  emptyTableID: string,
): any => {
  // Verify that there is a message when no data is imported
  const capitalizedTableName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
  cy.get(emptyTableID).should('have.text', `${capitalizedTableName} are empty`);
});
