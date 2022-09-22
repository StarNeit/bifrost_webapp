const standardsOptions = ['New', 'Delete', 'Edit', 'Search', 'Report'];

Cypress.Commands.add('verifyNaviagationPaneElements', (): any => {
  // Validation of the elements in the Navigation Pane
  cy.get('@NavigationPaneTitle').should('have.text', 'Project');

  // Validation of the elements for the Standard settings
  cy.get('@StandardsTitle').should('have.text', 'Standard');
  cy.get('@StandardsDropdownList').should('have.text', 'Select...');
  cy.get('@StandardsOptionsButton').click();

  standardsOptions.filter((option) => !['Edit', 'Report'].includes(option)).forEach((option) => {
    cy.get('@StandardsOptionsContainer').find('li').contains(option);
  });

  // Remove focus from current element
  cy.clickAway();

  cy.get('[data-testid="standard-colors"]').should('not.exist');

  // Validation of the elements for the Sample settings
  cy.get('@SampleTitle').should('have.text', 'Data');
  cy.get('@SampleOptionsButton').click();

  standardsOptions.filter((option) => !['Edit', 'Search', 'Report'].includes(option)).forEach((option) => {
    cy.get('@SampleOptionsContainer').find('li').contains(option);
  });

  // Remove focus from current element
  cy.clickAway();

  cy.get('[data-testid="standard-samples"]').should('not.exist');
});
