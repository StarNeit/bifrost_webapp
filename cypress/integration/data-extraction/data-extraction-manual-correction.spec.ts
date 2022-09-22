/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types='Cypress' />

import path from 'path';
import metadata from '../../fixtures/metadata.json';
import { replaceSpaceInSelector } from '../../support/util/selectors';

describe.skip('Extracting test data', { retries: 1 }, () => {
  context('Should extract for each of the predefined trials with Correction Settings: Manual', () => {
    const correctionTestData = metadata.formulations
      .filter((test) => test.correctionSetupMode === 'manual')
      .map((test) => test.name);

    Cypress._.range(0, correctionTestData.length).forEach((index) => {
      it(`Extracting data for the formulation ${correctionTestData[index]}`, () => {
        const currentFormulationData = correctionTestData[index];
        const hasFormulation = metadata.formulations
          .find((test) => test.name === currentFormulationData && test.containsFormulation);
        cy.fixture(`formulations/${currentFormulationData}`).then((testData: BifrostTestData) => {
          cy.login();

          if (hasFormulation) {
            cy.log(`Formulating ${testData.selectedStandard.label}`);
            cy.formulate(testData);

            if (testData.formulationMeasurement) {
              cy.log('Should take a measurement');
              cy.task('sendMockDataToBridge', testData.formulationMeasurement).then(() => {
                cy.get('[data-testid="measure-btn"]').click().should('be.enabled');
              });

              cy.log('Should save the recipe and trial');
              cy.get('[data-testid="fss-input-name"]')
                .find('input')
                .type(' w Trial');
              cy.get('[data-testid="fss-button"]').click();
            }

            cy.goToPage('Correction');
          } else {
            cy.goToPage('Correction');

            const { label } = testData.selectedStandard;
            cy.pickSelectItem(
              '#standard-select',
              label,
              { exact: true, searchable: true },
            );
          }

          const selectedKey = testData.selectedSample;
          const selectedSample = testData.selectedSampleTrials.find(
            (trial) => trial.children[0].id === selectedKey,
          );

          const prefix = `${currentFormulationData[0].toLowerCase()}ss-${replaceSpaceInSelector(selectedSample.parentName)}`;
          const selectedTrial = selectedSample.children
            .find((trial) => trial.id === selectedKey)
            .name;

          cy.get(`[data-testid="${prefix}-${replaceSpaceInSelector(selectedTrial)}"]`)
            .first()
            .click();

          cy.correctManually(testData);
          cy.sortRowBy('correction-result-table', 'name', 'asc');

          cy.get('[data-testid="extract-test-data"]').click();
          cy.readFile(path.join('./cypress/downloads', currentFormulationData), { timeout: 60000 })
            .should('exist');
          cy.log(`Data extracted for ${testData.selectedStandard.label}`);
        });
      });
    });
  });
});
