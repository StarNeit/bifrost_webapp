/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types='Cypress' />

import path from 'path';
import metadata from '../../fixtures/metadata.json';

describe.skip('Extracting test data', { retries: 1 }, () => {
  context('Should extract data for all predefined standards', () => {
    const formulationTestData = metadata.formulations
      .filter((test) => test.containsFormulation)
      .filter((test) => !test.containsCorrection);

    Cypress._.range(0, formulationTestData.length).forEach((index) => {
      it(`Extracting data for the formulation ${formulationTestData[index].name}`, () => {
        const currentFormulationData = formulationTestData[index].name;
        cy.fixture(`formulations/${currentFormulationData}`).then((testData: BifrostTestData) => {
          cy.log(`Formulating ${testData.selectedStandard.label}`);
          cy.login();
          cy.formulate(testData);
          cy.sortRowBy('formulation-result-table', 'name', 'asc');
          cy.get('[data-testid="extract-test-data"]').click();
          cy.readFile(path.join('./cypress/downloads', currentFormulationData), { timeout: 60000 })
            .should('exist');
          cy.log(`Data extracted for ${testData.selectedStandard.label}`);
        });
      });
    });
  });
});
