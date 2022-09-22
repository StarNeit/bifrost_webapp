Cypress.Commands.add('formulate', (data: BifrostTestData): any => {
  const waitForSpinner = () => cy.get('[data-testid="loading-spinner"]').should('not.be.exist');
  // react-select lists are virtualized,
  // so we have to search in order to get the item rendered into DOM
  cy.waitForFormulationPageToLoad();

  cy.pickSelectItem('#standard-select', data.selectedStandard.label, { exact: true, searchable: true });
  waitForSpinner();

  cy.pickSelectItem('#assortment-select', data.selectedAssortment.label, { exact: true, searchable: true });
  waitForSpinner();

  cy.pickSelectItem('#substrate-select', data.selectedSubstrate.label, { exact: true, searchable: true });
  waitForSpinner();

  cy.pickSelectItem('#recipe-output-mode-select', data.selectedRecipeOutput.label, { exact: true, searchable: true });
  waitForSpinner();

  cy.pickSelectItem('#clear-select', data.selectedClearCoat.name, { exact: true, searchable: true });
  waitForSpinner();

  cy.pickSelectItems('#colorant-select', data.selectedComponents.map((x) => x.label));
  waitForSpinner();

  const dialogData = {
    isFormulation: true,
    recipeOutputMode: data.selectedRecipeOutput.label,
    colorants: data.assortmentColorants,
    clearCoat: data.selectedClearCoat,
    technicalVarnishMode: data.selectedTechnicalVarnishMode,
    state: data.state.formulation,
    selectedPrintApplication: data.selectedPrintApplication?.label,
  };

  cy.populateSetupDialog(dialogData);

  if (data.selectedAssortment.value.subIndustry === 'Offset') {
    cy.changeToDefaultInputValue('selectedThicknessMin', 'Minimum Thickness', data.selectedThicknessMin);
    cy.changeToDefaultInputValue('selectedThicknessMax', 'Maximum Thickness', data.selectedThicknessMax);
  } else {
    cy.changeToDefaultInputValue('selectedThickness', 'Thickness', data.selectedThickness);
  }

  if (data.selectedRecipeOutput.label.includes('Basic')) {
    cy.changeToDefaultInputValue('selectedViscosity', 'Viscosity', data.selectedViscosity);
  } else {
    cy.get('[data-testid="selectedViscosity"] input').should('be.disabled');
  }

  cy.pickSelectItem('#opacity-select', data.selectedOpacityMode.label, { exact: true, searchable: true });

  if (data.selectedOpacityMode.label.includes('Opacity')) {
    cy.changeToDefaultInputValue('selectedOpacityMin', 'Minimum Opacity', data.selectedOpacityMin);
  } else {
    cy.get('[data-testid="selectedOpacityMin"] input').should('not.exist');
  }

  cy.get('[data-testid="formulate-btn"]').click().should('be.enabled');
});
