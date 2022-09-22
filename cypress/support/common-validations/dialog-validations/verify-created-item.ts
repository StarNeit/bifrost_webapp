/* eslint-disable @typescript-eslint/no-explicit-any */
import { typeOptions } from '../../components/substrate/substrate-options';

Cypress.Commands.add('verifyCreatedData', (
  selector: string,
  data: any,
): any => {
  cy.openDialogFor(selector, 'edit');
  cy.get(`#${selector}-select`).then((element) => {
    const validationText = element.text();
    cy.get(`[data-testid="edit-${selector}-name"] input`).should('have.value', validationText);
  });

  cy.get('#edit-acl-select').contains(data.acl);

  if (selector === 'substrate') {
    switch (data.type) {
      case typeOptions[1]:
        cy.get('#substrate-type-select').contains(data.type);
        cy.get('#substrate-quality-select').contains(data.quality);
        break;
      case typeOptions[2]:
        cy.get('#substrate-type-select').contains(data.type);
        cy.get('#substrate-quality-select').contains(data.quality);
        cy.get('[data-testid="selectedRoughnessPercent"] input').should('have.value', data.roughness);
        break;
      default:
        cy.get('#substrate-type-select').contains(data.type);
        break;
    }
  }

  cy.get('[data-testid="slide-exit-button"]').click();
});
