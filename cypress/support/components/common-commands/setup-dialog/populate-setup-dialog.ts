/* eslint-disable @typescript-eslint/no-explicit-any */
Cypress.Commands.add('populateSetupDialog', (
  data: any,
): any => {
  cy.get('[data-testid="open-components-modal"]').click().then(() => {
    cy.get('[data-testid="components-modal"]').should('be.visible');
    const keys: string[] = data.state.requiredComponentIds;

    // set data for the clear fields
    cy.get('[data-testid="components-modal"] #clear-select')
      .should('have.text', data.clearCoat.name);

    cy.changeToDefaultInputValue('clear-coat-min-value', 'Minimum Clear Coat', Number(data.clearCoat.minConcentrationPercentage));
    cy.changeToDefaultInputValue('clear-coat-max-value', 'Maximum Clear Coat', Number(data.clearCoat.maxConcentrationPercentage));

    if (keys && keys.length > 0 && keys.includes(data.clearCoat.id)) {
      cy.get('[data-testid="clear-coat-required"]')
        .find('input')
        .check()
        .should('be.checked');
    } else {
      cy.get('[data-testid="clear-coat-required"]')
        .find('input')
        .uncheck()
        .should('not.be.checked');
    }

    cy.populateColorants(data);

    if (data.recipeOutputMode.includes('Basic')) {
      cy.populateTechnicalVarnish(data);

      if (data.recipeOutputMode.includes('Materials') && data.isFormulation) {
        cy.populateAdditives(data);
      }
    }
  });

  // Close dialog after everything has been
  cy.get('[data-testid="slide-exit-button"]').click();
});
