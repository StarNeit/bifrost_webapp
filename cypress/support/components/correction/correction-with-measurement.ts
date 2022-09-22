Cypress.Commands.add('correctWithMeasurement', (
  testData: BifrostTestData,
  trialPrefix: string,
  skipValidations: boolean,
): any => {
  // Start test with doing a formulation
  cy.log(`Formulating ${testData.selectedStandard.label}`);
  cy.formulate(testData);
  cy.sortRowBy('formulation-result-table', 'name', 'asc');
  cy.get('[data-testid="formulation-result-table-row-0"]').click();

  // Make a measurement using the mock data
  cy.log('Should take a measurement');
  cy.task('sendMockDataToBridge', testData.formulationMeasurement).then(() => {
    cy.get('[data-testid="measure-btn"]').click().should('be.enabled');
  });

  // Save the first recipe from the results along with the trial
  cy.log('Should save the recipe and trial');
  cy.get('[data-testid="fss-input-name"]')
    .find('input')
    .type(' w Trial');
  cy.get('[data-testid="fss-button"]').click();

  cy.get('[data-testid="fss-proceed"]').should('be.visible');
  cy.get('#sample-select').should('have.text', 'Recipe 1 w Trial');

  // Proceed to the Correction page and do a correction with automatic mode
  cy.log('Should proceed to the Correction page');
  cy.get('[data-testid="fss-proceed"]').click();

  cy.log('Correction Setup Mode should be automatic');

  cy.getCorrectionSetupWidgetElements();

  cy.get('@CorrectionSettingsMode').find('input').check();
  cy.get('@CorrectButton').click();

  cy.log('Should validate the results from the correction');
  cy.sortRowBy('correction-result-table', 'name', 'asc');

  if (!skipValidations) {
    // Do a validation of the correction results
    cy.verifyRecipeResults(
      testData,
      testData.correctionResultData,
      'Correction',
    );

    // Delete the newly created sample trial
    cy.log('Should remove the newly saved sample');
    cy.openSampleTreeAndSelect(
      true,
      trialPrefix,
      {
        selectedSample: testData.selectedSample,
        selectedSampleTrials: testData.selectedSampleTrials,
      },
    );
    cy.deleteExistingOption('sample');
  }
});
