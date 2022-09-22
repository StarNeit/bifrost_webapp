Cypress.Commands.add('getSearchStandardElements', (): any => {
  // Search by name components
  cy.get('[data-testid="search-standard-name-input"]').as('SearchByStandardNameInputField');
  cy.get('[data-testid="search-standard-button"]').as('SearchForStandrdsButton');

  // Filter components
  cy.get('[data-testid="search-standards-filters-from-date"]').as('StandardSearchFilterStartDate');
  cy.get('[data-testid="search-standards-filters-to-date"]').as('StandardSearchFilterEndDate');
  // cy.get('[]').as('');

  // Color Search components
  cy.get('[data-testid="sscs-clear-button"]').as('ClearResultsButton');
  cy.get('[data-testid="sscs-measure-button"]').as('MeasureStandardButton');
  cy.get('[data-testid="sscs-de-tolerance"]').as('ColorSearchDeTolerance');

  // Search Results components
  cy.get('[data-testid="search-standards-result-table"]').as('SearchResultTable');
  cy.get('[data-testid="select-standard-button"]').as('SelectStandrdButton');
});
