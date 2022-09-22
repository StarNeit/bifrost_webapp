Cypress.Commands.add('getNavPaneElements', (): any => {
  cy.get('[data-testid="nav-pane-ac-title"]').as('NavigationPaneTitle');
  cy.get('[data-testid="np-hide-container-content-button"]').as('CloseNavigationPane');

  cy.get('[data-testid="standards-title"]').as('StandardsTitle');
  cy.get('#standard-select').as('StandardsDropdownList');
  cy.get('[data-testid="standard-actions-options-button"]').as('StandardsOptionsButton');

  cy.get('@StandardsOptionsButton').click();
  cy.get('[data-testid="standard-actions-options-container"]').as('StandardsOptionsContainer');
  cy.clickAway();

  cy.get('[data-testid="sample-header-title"]').as('SampleTitle');
  cy.get('[data-testid="sample-actions-options-button"]').as('SampleOptionsButton');

  cy.get('@SampleOptionsButton').click();
  cy.get('[data-testid="sample-actions-options-container"]').as('SampleOptionsContainer');
  cy.clickAway();
});
