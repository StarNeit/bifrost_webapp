/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { toPrecise } from '../../util/selectors';

Cypress.Commands.add('verifyRecipeResults', (
  testData: BifrostTestData,
  testResultsData: FormulationResultData[],
  typeOfResults: string,
): any => {
  cy.get(`[data-testid="${typeOfResults.toLowerCase()}-result-table-rows"]`)
    .find('tr')
    .should('have.length', testResultsData.length);

  cy.get('[data-testid="score"]')
    .then((scores) => ({ scores }))
    .then((data) => cy.get('[data-testid="deltae"]').then((deltaEs76) => ({ ...data, deltaEs76 })))
    .then((data) => {
      const { scores, deltaEs76 } = data;
      const resultsValidationLimit = Number(Cypress.env('resultsValidationLimit'));
      const resultsMaxLimit = resultsValidationLimit < 35 ? resultsValidationLimit : 35;
      const iterationLimit = testData.state.formulation.combinatorialMode === 'Full'
        && testResultsData.length < resultsMaxLimit
        ? testResultsData.length
        : resultsMaxLimit;

      expect(scores.length).to.eq(deltaEs76.length);

      for (let i = 0; i < iterationLimit; i += 1) {
        const makeMismatchMessage = (item: string) => `${testData.selectedStandard.label} Recipe Result No. ${i + 1} ${item} is`;
        const scoreEl = scores[i];
        const deltaEl76 = deltaEs76[i];

        expect(scoreEl.innerText, makeMismatchMessage('Score')).to.equal(
          toPrecise(testResultsData[i].score),
        );

        expect(deltaEl76.innerText, makeMismatchMessage('DeltaE')).to.equal(
          toPrecise(testResultsData[i].deltaE76),
        );

        cy.log(i.toString());
        const isFormulation = typeOfResults.toLowerCase() === 'formulation';

        const recipeData = isFormulation
          ? testData.formulationRecipeResults[i].data
          : testData.correctionRecipeResults[i].data;

        cy.get(
          `[data-testid="${typeOfResults.toLowerCase()}-result-table-row-${i}"]`,
        ).click({ force: true });

        if (isFormulation) {
          cy.verifyRecipeDisplay(
            recipeData.layers[0],
            `${testData.selectedStandard.label} Recipe Result No. ${i + 1}`,
            true,
          );
        } else {
          cy.verifyRecipeDisplay(
            recipeData.layers[0],
            `${testData.selectedStandard.label} Recipe Result No. ${i + 1}`,
            false,
            testData.state.correction.correctionMode.toLowerCase() === 'add',
          );
        }

        const colorDataTable = isFormulation
          ? testData.formulationColorDataTableEntries[i]
          : testData.correctionColorDataTableEntries[i];
        cy.verifyColorDataTable(colorDataTable);
      }
    });
});
