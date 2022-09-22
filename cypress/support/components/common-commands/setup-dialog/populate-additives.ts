/* eslint-disable @typescript-eslint/no-explicit-any */
Cypress.Commands.add('populateAdditives', (data: any): any => {
  if (data.state.selectedAdditiveIds && data.state.selectedAdditiveIds.length > 0) {
    const additivesData = {
      selectedElementIds: data.state.selectedAdditiveIds,
      selectedPrintApplication: data.selectedPrintApplication,
      colorants: data.colorants,
      state: data.state,
      concentrationPercentages: data.state.concentrationPercentages,
    };

    cy.selectComponentsForTransferList('additives', additivesData);
    cy.populateConcentrationPercentages('additives', additivesData);
  }
});
