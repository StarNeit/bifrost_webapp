/// <reference types='Cypress' />

import metadata from '../../fixtures/metadata.json';

const correctionTestData = metadata.formulations
  .filter((test) => test.containsCorrection === true)
  .filter((test) => test.correctionSetupMode === 'automatic')
  .map((test) => test.name);

describe('Correction Page', () => {
  Cypress._.range(0, correctionTestData.length).forEach((index) => {
    it(`should validate correction [Correction Settings: Automatic] for ${correctionTestData[index]}`, () => {
      const currentFormulationData = correctionTestData[index];

      cy.fixture(`formulations/${currentFormulationData}`).then((testData: BifrostTestData) => {
        cy.login();

        if (testData.formulationMeasurement) {
          cy.correctWithMeasurement(
            testData,
            currentFormulationData[0],
            false,
          );
        } else {
          cy.correctWithExistingTrial(
            testData,
            currentFormulationData[0],
            'automatic',
            false,
          );
        }
      });
    });
  });
});
