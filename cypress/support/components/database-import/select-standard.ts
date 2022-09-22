Cypress.Commands.add('selectStandardForSubstrate', (substrate: string): any => {
  const measurementModes = ['M0', 'D8I'];
  const standardsFromSubstrates = new Map<string, string>(
    JSON.parse(localStorage.getItem('standardSubstrateRelations')),
  );

  const standards = JSON.parse(localStorage.getItem('standardsData'));
  const standard = standardsFromSubstrates.get(substrate);

  if (standard && standards.includes(standard)) {
    cy.log('Selecting a standard: ', standard);
    cy.pickSelectItem(
      '#standard-select',
      standard,
      {
        searchable: true,
        exact: false,
      },
    );

    cy.log('Selecting a Flexo assortment');
    cy.pickSelectItem(
      '#assortment-select',
      'Flexo',
      {
        searchable: true,
        exact: false,
      },
    );

    cy.log('Selecting substrate: ', substrate);
    cy.pickSelectItem(
      '#substrate-select',
      substrate,
      {
        searchable: true,
        exact: false,
      },
    );

    cy.deleteExistingOption('substrate');
    standardsFromSubstrates.delete(substrate);
    localStorage.setItem(
      'standardSubstrateRelations',
      JSON.stringify(Array.from(standardsFromSubstrates.entries())),
    );
  } else {
    cy.wrap(measurementModes).each((measurementMode: string) => {
      if (substrate.toUpperCase().includes(measurementMode)) {
        cy.log('Selecting a standard: ', measurementMode);
        cy.pickSelectItem(
          '#standard-select',
          measurementMode,
          {
            searchable: true,
            exact: false,
          },
        );

        cy.log('Selecting a Flexo assortment');
        cy.pickSelectItem(
          '#assortment-select',
          'Flexo',
          {
            searchable: true,
            exact: false,
          },
        );

        cy.log('Selecting substrate: ', substrate);
        cy.pickSelectItem(
          '#substrate-select',
          substrate,
          {
            searchable: true,
            exact: false,
          },
        );
        cy.deleteExistingOption('substrate');
      }
    });
  }
});
