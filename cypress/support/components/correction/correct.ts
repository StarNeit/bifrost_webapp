import { findBasicMaterial, getColorantAssortment } from '../../util/find';

Cypress.Commands.add('correctManually', (data: BifrostTestData): any => {
  const waitForSpinner = () => cy.get('[data-testid="loading-spinner"]').should('not.be.exist');
  cy.getCorrectionSetupWidgetElements();

  cy.get('@CorrectionSettingsMode').find('input').uncheck();

  // Verify that the labels have the correct data
  cy.get('@CorrectionAssortment').should('have.text', data.correctionSelectedAssortment.label);

  const assortmentValue = data.correctionSelectedAssortment.value;
  const type = `${assortmentValue.industry} (${assortmentValue.subIndustry})`;
  cy.get('@CorrectionType').should('have.text', type);

  const isCorrectionModeNew = data.state.correction.correctionMode.toLowerCase() === 'new';
  const isColorantModeAutomatic = data.state.correction.colorantMode.toLowerCase() === 'automatic';

  // Populate the fields with the test data
  if (isCorrectionModeNew) {
    cy.get('@CorrectionMode').find('input').uncheck();
  } else {
    cy.get('@CorrectionMode').find('input').check();

    if (isColorantModeAutomatic) {
      cy.get('@NewColorantsMode').find('input').uncheck();
    } else {
      cy.get('@NewColorantsMode').find('input').check();
    }

    cy.replaceNumberValue(
      '[data-testid="selectedMaxAddPercent"] input',
      data.state.correction.maxAddPercentage,
    );
  }

  cy.log('Should pick items');
  if (isCorrectionModeNew || (!isCorrectionModeNew && !isColorantModeAutomatic)) {
    cy.log('Picking');
    waitForSpinner();
    cy.clearSelectItems('#colorant-select');

    const correctionColorantValues = data.state.correction.selectedComponentIds
      .filter((x) => getColorantAssortment(
        x,
        data.assortmentColorants,
      ).type !== 'TechnicalVarnish')
      .map(
        (x) => {
          const assortmentOfColorant = getColorantAssortment(
            x,
            data.assortmentColorants,
          );

          return !assortmentOfColorant.name.toLowerCase().includes('leftover')
            && data.selectedRecipeOutput.label === 'Basic Materials'
            ? findBasicMaterial(x, data.assortmentColorants).name
            : assortmentOfColorant.name;
        },
      );

    cy.pickSelectItems('#colorant-select', correctionColorantValues);
    waitForSpinner();

    const dialogData = {
      isFormulation: false,
      recipeOutputMode: data.selectedRecipeOutput.label,
      colorants: data.assortmentColorants,
      clearCoat: data.selectedClearCoat,
      technicalVarnishMode: data.selectedTechnicalVarnishMode,
      state: data.state.correction,
      selectedPrintApplication: data.selectedPrintApplication?.label,
    };

    cy.populateSetupDialog(dialogData);
  }

  cy.get('@CorrectButton').click();
  cy.get('[data-testid="correct-button"][data-correctionrunning="false"]');
});
