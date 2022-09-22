/* eslint-disable @typescript-eslint/no-explicit-any */
import { findBasicMaterial } from '../../../util/find';
import { makeShortName, replaceSpaceInSelector } from '../../../util/selectors';

Cypress.Commands.add('selectComponentsForTransferList', (
  sectionName: string,
  data: any,
): any => {
  const transferListPrefix = makeShortName(sectionName.concat('-transfer-list'));
  const selectedElements = data.selectedElementIds;

  // reset values
  cy.get(`[data-testid="${transferListPrefix}-unselect-all"]`).click();

  if (selectedElements.length > 0) {
    if (sectionName === 'additives' && data.selectedPrintApplication) {
      cy.pickSelectItem(
        '#print-application-select',
        data.selectedPrintApplication,
        { searchable: true, exact: false },
      );
    } else {
      // select the components according to the test data
      selectedElements.forEach((element: string) => {
        const basicMaterial = findBasicMaterial(element, data.colorants);
        const prefix = replaceSpaceInSelector(basicMaterial.name);

        cy.get(`[data-testid="${prefix}-label-unselected"]`).first().dblclick();
      });
    }
  }
});
