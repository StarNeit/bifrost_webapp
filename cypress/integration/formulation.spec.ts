/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types='Cypress' />

import metadata from '../fixtures/metadata.json';

const formulationTestData = metadata.formulations
  .filter((test) => test.containsFormulation);

describe('Formulation Page', () => {
  Cypress._.range(0, formulationTestData.length).forEach((index) => {
    it(`should validate a formulation using ${formulationTestData[index].name}`, () => {
      const currentFormulationData = formulationTestData[index].name;
      cy.fixture(`formulations/${currentFormulationData}`).then((testData: BifrostTestData) => {
        cy.log(`Formulating ${testData.selectedStandard.label}`);
        cy.login();
        cy.log(`Formulating ${testData.selectedStandard.label}`);
        cy.formulate(testData);

        cy.sortRowBy('formulation-result-table', 'name', 'asc');
        cy.verifyRecipeResults(
          testData,
          testData.formulationResultData,
          'Formulation',
        );
        cy.log(`Done formulating ${testData.selectedStandard.label}`);
      });
    });
  });
});
