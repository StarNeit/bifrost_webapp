Cypress.Commands.add('verifyColorSearchResults', (deTolerance?: number): any => {
  const valuesOfMeasurement = [];
  const values = ['L', 'a', 'b'];

  values.forEach((columnName) => {
    cy.get(`[data-testid="M0-D50-2-rows"] [data-testid="cell-${columnName.toLowerCase()}"]`)
      .invoke('text')
      .then((value) => {
        valuesOfMeasurement.push(value);
      });
  });

  // Select the L*, a*, b* and dE2000 cells to be visible in the search results table
  cy.get('[data-testid="search-standards-result-table-header-name"]').rightclick({ force: true });
  [...values, 'dE00'].forEach((columnName) => {
    cy.get(`[data-testid="sacm-${columnName.toLowerCase()}-checkbox"]`)
      .scrollIntoView()
      .find('input')
      .check();
  });

  cy.clickAway();
  cy.log('Starting the search result validations for each of the rows');
  cy.get('[data-testid="search-standards-result-table-rows"]').find('tr').each((row, index) => {
    cy.log(`Validating row ${index}`);
    const prefix = `[data-testid="search-standards-result-table-row-${index}"]`;
    values.forEach((columnName, columnIndex) => {
      // Compare the L* value from Color Data and the subtraction value of L* and delta L*
      // in the search results
      cy.get(`${prefix} [data-testid="cell-${columnName.toLowerCase()}"]`)
        .invoke('text')
        .then((resultL) => {
          cy.get(`${prefix} [data-testid="cell-d${columnName.toLowerCase()}"]`)
            .invoke('text')
            .then((resultDeltaL) => {
              const differenceOfValues = Number(resultL) - Number(resultDeltaL);
              const actualResult = Number(parseFloat(differenceOfValues.toString()).toFixed(2));
              const expectedResult = Number(
                parseFloat(valuesOfMeasurement[columnIndex]).toFixed(2),
              );
              expect(actualResult).to.be.lte(expectedResult);
            });
        });

      // Verify that the delta e value is less than the defined De Tolerance
      // should be modified after EFXW-2481 is merged into develop
      cy.get(`${prefix} [data-testid="cell-de00"]`)
        .invoke('text')
        .then((value) => {
          expect(Number(value)).to.be.lt(deTolerance);
        });
    });
  });
});
