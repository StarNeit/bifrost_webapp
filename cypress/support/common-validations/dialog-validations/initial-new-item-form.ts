import { makeShortName } from '../../util/selectors';

// For reusability in other test cases
Cypress.Commands.add('verifyInitNewItemForm', (
  newItemNameFieldId: string,
  saveNewItemButtonId: string,
  idPrefix: string,
): any => {
  const nameInputFieldId = `[data-testid=${newItemNameFieldId}]`;
  const saveItemButtonId = `[data-testid=${saveNewItemButtonId}]`;
  const prefix = makeShortName(idPrefix);

  // Verify 'Import from' options
  cy.get('[data-testid="measure-bridge-button"]')
    .should('not.be.disabled')
    .should('have.text', 'Measure');

  // Find the dynamic class name value using a data-testid value for the given element
  cy.get('[data-testid="measure-bridge-button"]')
    .should('have.attr', 'data-test-is-selected', 'false');

  // Commented out since the button will be hidden until the feature is implemented
  // cy.get('[data-testid="pantone-live-button"]')
  //   .should('have.attr', 'data-test-is-selected', 'false')
  //   .should('have.text', 'PantoneLIVE');

  cy.get('[data-testid="dms-button"]')
    .should('not.be.disabled')
    .should('have.attr', 'data-test-is-selected', 'false')
    .should('have.text', 'DMS');

  cy.get('[data-testid="file-button"]')
    .should('have.attr', 'data-test-is-selected', 'false')
    .should('not.be.disabled')
    .should('have.text', 'File');

  // Verify save new item fields
  cy.get(`${nameInputFieldId} input`).should('not.be.disabled')
    .should('have.attr', 'placeholder', 'Enter name');

  cy.get(saveItemButtonId).should('be.disabled').should('have.text', 'Save');

  // Verify data representation fields
  cy.get('[data-testid="new-standard-modal-widget"]').should('not.exist');
  cy.get(`[data-testid="${prefix}mwsg-rcc"]`).should('be.visible');
  cy.get(`#${idPrefix}-select-widget-type`).should('have.text', 'Spectral Graph');
  cy.get(`[data-testid="${prefix}mwsg-options"]`).should('be.visible');

  cy.get(`[data-testid="${prefix}mwsg-rcc-R"]`)
    .should('be.visible')
    .should('have.attr', 'data-test-is-selected', 'true');

  cy.get(`[data-testid="${prefix}mwsg-rcc-K_S"]`)
    .should('have.attr', 'data-test-is-selected', 'false')
    .should('be.visible');

  cy.get(`#${prefix}mwsg-select-measurements-data`).should('have.text', 'Select...');

  // Change data representation to 'Color Swatch' and verify visible fields
  cy.pickSelectItem(`#${idPrefix}-select-widget-type`, 'Color Swatch', { searchable: true, exact: true });
  cy.get(`[data-testid="${prefix}mwcs-rcc"]`).should('not.exist');
  cy.get(`[data-testid="${prefix}mwcdt-vcc"]`).should('not.exist');
  cy.get(`[data-testid="${prefix}mwcs-options"]`).should('be.visible');
  cy.get(`#${prefix}mwcs-select-measurements-data`).should('have.text', 'Select...');

  // Change data representation to 'Color Data' and verify visible fields
  cy.pickSelectItem(`#${idPrefix}-select-widget-type`, 'Color Data', { searchable: true, exact: true });
  cy.get(`[data-testid="${prefix}mwcdt-vcc"]`).should('be.visible');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-D50-2"]`)
    .should('have.attr', 'data-test-is-selected', 'true')
    .should('be.visible');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-A-2"]`)
    .should('have.attr', 'data-test-is-selected', 'false')
    .should('be.visible');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-FL12-2"]`)
    .should('have.attr', 'data-test-is-selected', 'false')
    .should('be.visible');

  cy.get(`#${prefix}mwcdt-select-measurements-data`).should('have.text', 'Select...');

  // Verify that one viewing condition should always be selected
  cy.get(`[data-testid="${prefix}mwcdt-vcc-A-2"]`)
    .click()
    .should('have.attr', 'data-test-is-selected', 'true');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-D50-2"]`)
    .click()
    .should('have.attr', 'data-test-is-selected', 'false');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-FL12-2"]`)
    .click()
    .should('have.attr', 'data-test-is-selected', 'true');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-A-2"]`)
    .click()
    .should('have.attr', 'data-test-is-selected', 'false');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-FL12-2"]`)
    .click()
    .should('have.attr', 'data-test-is-selected', 'false');

  cy.get(`[data-testid="${prefix}mwcdt-vcc-D50-2"]`).should('have.attr', 'data-test-is-selected', 'true');

  // Verify fields are initially hidden
  cy.get('[data-testid="dms-browser"]').should('not.exist');
  cy.get('[data-testid="file-browser"]').should('not.exist');

  // Verify exit button confimation window
  cy.get('[data-testid="slide-exit-button"]').should('have.text', 'Exit').click();
  cy.get('[data-testid="confirmation-popover"]').should('be.visible');
  cy.get('[data-testid="confirmation-popover-message"]').should('have.text', 'There are unsaved changes');
  cy.get('[data-testid="confirmation-popover-cancel"]').should('be.visible');
  cy.get('[data-testid="confirmation-popover-confirm"]').should('be.visible');

  // Verify that clicking the cancel button doesn't close the dialog
  cy.get('[data-testid="confirmation-popover-cancel"]').click();
  cy.get('[data-testid="confirmation-popover"]').should('not.exist');
  cy.get('[data-testid="full-screen-modal"]').should('be.visible');

  // Verify that clicking the confirm button closes the dialog
  cy.get('[data-testid="slide-exit-button"]').click();
  cy.get('[data-testid="confirmation-popover-confirm"]').click();
  cy.get('[data-testid="full-screen-modal"]').should('not.exist');
});
