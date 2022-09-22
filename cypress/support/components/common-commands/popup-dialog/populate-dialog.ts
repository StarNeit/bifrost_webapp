/* eslint-disable @typescript-eslint/no-explicit-any */
import { typeOptions } from '../../substrate/substrate-options';

Cypress.Commands.add('populateDialogAndValidate', (
  dialogItemName: string,
  importOptionSelector: string,
  newItemName: string,
  data: any,
): any => {
  cy.get(`[data-testid="${importOptionSelector}-button"]`).click();

  switch (importOptionSelector) {
    case 'dms':
      cy.pickSelectItem('#dms-browser-select-device', 'VS3200-000530', { searchable: true, exact: true });

      cy.get('[data-testid="dms-browser-jobs-table-rows"]').children().then((rows) => {
        rows.each((index, row) => {
          const selector = row.attributes.getNamedItem('data-testid').textContent;
          cy.get(`[data-testid="${selector}"]`).click();

          const name = row.children[1];
          cy.get(`[data-testid="new-${dialogItemName}-name"] input`).should('not.have.value', name.textContent);
        });
      });
      break;

    case 'file':
      cy.get('[data-testid="loading-existing-files"]').should('not.exist');

      if (data.numberOfIterations > 0) {
        cy.get('[data-testid="file-browser-colorants-table-rows"]')
          .children().then((rows) => {
            if (rows.length > 0) {
              cy.log('The data from the last uploaded file has been loaded');
            }
          });
      }

      cy.uploadFileForImportInDialogAndValidate(data.fileName, dialogItemName);
      break;

    default: break;
  }

  if (dialogItemName === 'substrate') {
    cy.pickSelectItem('#substrate-type-select', data.type, { searchable: true, exact: true });
    cy.get('#substrate-type-select').contains(data.type);

    if ([typeOptions[1], typeOptions[2]].includes(data.type)) {
      cy.pickSelectItem('#substrate-quality-select', data.quality, { searchable: true, exact: true });
      cy.get('#substrate-quality-select').contains(data.quality);
      if (data.quality === 'User Defined') {
        cy.replaceNumberValue('[data-testid="selectedRoughnessPercent"] input', 10);
      }
    }
  }

  cy.verifyModalWidgets(`new-${dialogItemName}`);
  cy.createNewItem(newItemName, dialogItemName);
  cy.verifyCreatedData(dialogItemName, data);
});
