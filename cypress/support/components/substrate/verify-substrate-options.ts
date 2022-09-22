import { qualityMetallizedOptions, qualityPCOOptions, typeOptions } from './substrate-options';

Cypress.Commands.add('verifySubstrateOptions', (): any => {
  cy.log('Verify initial state of Substrate options');

  cy.get('#substrate-type-select')
    .should('be.visible')
    .contains('Select...');

  cy.get('#substrate-type-select').click();
  typeOptions.forEach((type) => {
    cy.contains('[role="menuitem"] ', type);
  });
  cy.clickAway();

  cy.get('#substrate-quality-select')
    .should('be.visible')
    .contains('Select...')
    .as('InitialSubstrateQualityState');

  cy.get('#substrate-quality-select').click();
  cy.contains('No options');
  cy.clickAway();

  cy.get('[data-testid="selectedRoughnessPercent"]')
    .should('not.exist')
    .as('HiddenRoughnessPercent');

  cy.log('Verify state of Substrate options with Substrate Type: Transparent Film');

  cy.pickSelectItem('#substrate-type-select', 'Transparent film', { searchable: true, exact: true });
  cy.get('#substrate-type-select').contains('Transparent film').as('TransparetSubstrateType');
  cy.get('#substrate-quality-select').should('not.exist').as('HiddenSubstrateQuality');
  cy.get('[data-testid="selectedRoughnessPercent"]').should('not.exist');

  cy.log('Verify state of Substrate options with Substrate Type: Metallized');

  cy.pickSelectItem('#substrate-type-select', 'Metallized', { searchable: true, exact: true });
  cy.get('#substrate-type-select').contains('Metallized').as('MetallizedSubstrateType');

  cy.get('@InitialSubstrateQualityState');

  cy.get('#substrate-quality-select').click();
  qualityMetallizedOptions.forEach((quality) => {
    cy.contains('[role="menuitem"] ', quality);
  });
  cy.clickAway();

  cy.get('@HiddenRoughnessPercent');

  qualityMetallizedOptions.forEach((quality) => {
    cy.pickSelectItem('#substrate-quality-select', quality, { searchable: true, exact: true });
    cy.get('@MetallizedSubstrateType');
    cy.get('#substrate-quality-select').contains(quality);
    cy.get('@HiddenRoughnessPercent');
  });

  cy.log('Verify that Substrate Quality would be hidden if we reselect Substrate Type: Transparent Film');
  cy.pickSelectItem('#substrate-type-select', 'Transparent film', { searchable: true, exact: true });
  cy.get('@TransparetSubstrateType');
  cy.get('@HiddenSubstrateQuality');
  cy.get('@HiddenRoughnessPercent');

  cy.log('Verify state of Substrate options with Substrate Type: Paper, cardboard, opaque film');

  cy.pickSelectItem('#substrate-type-select', 'Paper, cardboard, opaque film', { searchable: true, exact: true });
  cy.get('#substrate-type-select').contains('Paper, cardboard, opaque film').as('PCOSubstrateType');
  cy.get('@InitialSubstrateQualityState');

  cy.get('#substrate-quality-select').click();
  qualityPCOOptions.forEach((quality) => {
    cy.contains('[role="menuitem"] ', quality);
  });
  cy.clickAway();

  cy.pickSelectItem('#substrate-quality-select', 'Coated', { searchable: true, exact: true });
  cy.get('#substrate-quality-select').contains('Coated');
  cy.get('[data-testid="selectedRoughnessPercent"] input')
    .should('be.visible')
    .should('be.disabled')
    .should('have.value', 0);

  cy.pickSelectItem('#substrate-quality-select', 'Uncoated', { searchable: true, exact: true });
  cy.get('@PCOSubstrateType');
  cy.get('#substrate-quality-select').contains('Uncoated');
  cy.get('[data-testid="selectedRoughnessPercent"] input')
    .should('be.visible')
    .should('be.disabled')
    .should('have.value', 25);

  cy.pickSelectItem('#substrate-quality-select', 'User Defined', { searchable: true, exact: true });
  cy.get('@PCOSubstrateType');
  cy.get('#substrate-quality-select').contains('User Defined');
  cy.get('[data-testid="selectedRoughnessPercent"] input')
    .should('be.visible')
    .should('be.enabled');

  cy.log('Verify that Roughness would be hidden if we reselect Substrate Type: Metallized');

  cy.pickSelectItem('#substrate-type-select', 'Metallized', { searchable: true, exact: true });
  cy.get('@MetallizedSubstrateType');
  cy.get('@InitialSubstrateQualityState');
  cy.get('@HiddenRoughnessPercent');

  cy.log('Reselect Substrate Type: Paper, cardboard, opaque film and then verify that Substrate Quality and Roughness would be hidden if we reselect Substrate Type: Transparent film');

  cy.pickSelectItem('#substrate-type-select', 'Paper, cardboard, opaque film', { searchable: true, exact: true });
  cy.get('@PCOSubstrateType');

  cy.pickSelectItem('#substrate-type-select', 'Transparent film', { searchable: true, exact: true });
  cy.get('@TransparetSubstrateType');
  cy.get('@HiddenSubstrateQuality');
  cy.get('@HiddenRoughnessPercent');
});
