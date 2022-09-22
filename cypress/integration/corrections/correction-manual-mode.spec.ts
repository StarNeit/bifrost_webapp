/// <reference types='Cypress' />

import metadata from '../../fixtures/metadata.json';

const correctionTestData = metadata.formulations
  .filter((test) => test.correctionSetupMode === 'manual')
  .map((test) => test.name);

describe('Correction Page', () => {
  Cypress._.range(0, correctionTestData.length).forEach((index) => {
    it(`should validate correction [Correction Settings: Manual] for ${correctionTestData[index]}`, () => {
      const currentFormulationData = correctionTestData[index];
      cy.fixture(`formulations/${currentFormulationData}`).then((testData: BifrostTestData) => {
        cy.login();
        cy.correctWithExistingTrial(
          testData,
          currentFormulationData[0],
          'manual',
          false,
        );
      });
    });
  });
});
