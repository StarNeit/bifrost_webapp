import { makeShortName } from '../../util/selectors';

// TODO: Refactor to have in depth validations of the three modal-widgets
Cypress.Commands.add('verifyModalWidgets', (idPrefix: string): any => {
  const prefix = makeShortName(idPrefix);

  cy.pickSelectItem(`#${idPrefix}-select-widget-type`, 'Spectral Graph', { searchable: true, exact: true });
  cy.get(`[data-testid="${prefix}mwsg-options"]`).should('be.visible');

  cy.get(`[data-testid="${prefix}mwsg-rcc-R"]`).should('be.visible').should('have.attr', 'data-test-is-selected', 'true');

  cy.get(`[data-testid="${prefix}mwsg-rcc-K_S"]`).should('be.visible').should('have.attr', 'data-test-is-selected', 'false');

  cy.get(`#${prefix}mwsg-select-measurements-data`).should('have.text', 'M0');

  // Change data representation to 'Color Swatch' and verify visible fields
  cy.pickSelectItem(`#${idPrefix}-select-widget-type`, 'Color Swatch', { searchable: true, exact: true });
  cy.get(`#${prefix}mwcs-select-measurements-data`).should('have.text', 'M0');

  // Change data representation to 'Color Data' and verify visible fields
  cy.pickSelectItem(`#${idPrefix}-select-widget-type`, 'Color Data', { searchable: true, exact: true });

  cy.get(`[data-testid="${prefix}mwcdt-vcc-D50-2"]`).should('have.attr', 'data-test-is-selected', 'true');
  cy.get(`[data-testid="${prefix}mwcdt-vcc-A-2"]`).should('have.attr', 'data-test-is-selected', 'false');
  cy.get(`[data-testid="${prefix}mwcdt-vcc-FL12-2"]`).should('have.attr', 'data-test-is-selected', 'false');

  cy.get(`#${prefix}mwcdt-select-measurements-data`).should('have.text', 'M0');
});
