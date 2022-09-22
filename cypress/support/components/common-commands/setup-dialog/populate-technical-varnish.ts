/* eslint-disable @typescript-eslint/no-explicit-any */
import { getColorantAssortment } from '../../../util/find';

Cypress.Commands.add('populateTechnicalVarnish', (data: any): any => {
  if (data.isFormulation) {
    const selectedTechnicalVarnishes = data.state.selectedComponentIds.filter(
      (colorant) => getColorantAssortment(
        colorant,
        data.colorants,
      ).type === 'TechnicalVarnish',
    );

    if (selectedTechnicalVarnishes.length > 0) {
      if (data.technicalVarnishMode) {
        cy.get('[data-testid="selectedTechnicalVarnishMode"]')
          .find('input')
          .check();
      } else {
        cy.get('[data-testid="selectedTechnicalVarnishMode"]')
          .find('input')
          .uncheck();
      }

      const technicalVarnishData = {
        selectedElementIds: selectedTechnicalVarnishes,
        colorants: data.colorants,
        concentrationPercentages: data.state.concentrationPercentages,
      };

      cy.selectComponentsForTransferList('technical-varnish', technicalVarnishData);
      cy.populateConcentrationPercentages('technical-varnish', technicalVarnishData);
    }
  } else {
    // Technical Varnish should be visible, but disabled for corrections
    cy.get('[data-testid="technical-varnish-transfer-list-unselected"]')
      .find('button')
      .each((buttonElement) => {
        cy.log(`${buttonElement.val} should be disabled`);
        buttonElement.hasClass('disabled');
      });

    cy.get('[data-testid="tvtl-unselect"]').should('be.disabled');
    cy.get('[data-testid="tvtl-unselect-all"]').should('be.disabled');
    cy.get('[data-testid="tvtl-select-all"]').should('be.disabled');
    cy.get('[data-testid="tvtl-select"]').should('be.disabled');
  }
});
