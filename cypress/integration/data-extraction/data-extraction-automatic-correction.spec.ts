/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types='Cypress' />

import path from 'path';
import metadata from '../../fixtures/metadata.json';

describe.skip('Extracting test data', { retries: 1 }, () => {
  context('Should extract for each of the predefined trials with Correction Settings: Automatic', () => {
    const correctionTestData = metadata.formulations
      .filter((test) => test.containsCorrection === true)
      .filter((test) => test.correctionSetupMode === 'automatic')
      .map((test) => test.name);

    Cypress._.range(0, correctionTestData.length).forEach((index) => {
      it(`Extracting data for the formulation ${correctionTestData[index]}`, () => {
        const currentFormulationData = correctionTestData[index];
        cy.fixture(`formulations/${currentFormulationData}`).then((testData: BifrostTestData) => {
          cy.login();

          if (testData.formulationMeasurement) {
            cy.correctWithMeasurement(
              testData,
              currentFormulationData[0],
              true,
            );
          } else {
            cy.correctWithExistingTrial(
              testData,
              currentFormulationData[0],
              'automatic',
              true,
            );
          }

          cy.get('@CorrectButton').click({ force: true });
          cy.get('[data-testid="correct-button"][data-correctionrunning="false"]');

          cy.get('[data-testid="extract-test-data"]').click();
          cy.readFile(path.join('./cypress/downloads', currentFormulationData), { timeout: 60000 })
            .should('exist');
          cy.log(`Data extracted for ${testData.selectedStandard.label}`);
        });
      });
    });
  });
});
