Cypress.Commands.add('correctWithExistingTrial', (
  testData: BifrostTestData,
  trialPrefix: string,
  setupMode: string,
  skipValidations: boolean,
): any => {
  cy.goToPage('Correction');
  cy.log('Correction Setup Mode should be automatic');

  cy.getCorrectionSetupWidgetElements();
  cy.pickSelectItem(
    '#standard-select',
    testData.selectedStandard.label,
    {
      exact: true,
      searchable: true,
    },
  );
  cy.waitForFormulationPageToLoad();

  cy.openSampleTreeAndSelect(
    false,
    trialPrefix,
    {
      selectedSample: testData.selectedSample,
      selectedSampleTrials: testData.selectedSampleTrials,
    },
  );

  if (setupMode === 'automatic') {
    cy.get('@CorrectionSettingsMode').find('input').check();
    cy.get('@CorrectButton').click();
  } else {
    cy.correctManually(testData);
  }

  cy.log('Should validate the results from the correction');
  cy.sortRowBy('correction-result-table', 'name', 'asc');

  if (!skipValidations) {
    // Do a validation of the correction results
    cy.verifyRecipeResults(
      testData,
      testData.correctionResultData,
      'Correction',
    );
  }
});
