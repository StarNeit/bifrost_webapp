import { defineCommonIDs } from '../page-elements/invisible-element-selectors/database-import/define-database-import-common-ids';

Cypress.Commands.add('importAvailableData', (
  tableName: string,
): any => {
  const {
    data,
    subtitle,
    empty,
    dataTable,
    dataTableRows,
    dataTableHeaderPrefix,
    tableCells,
  } = defineCommonIDs(tableName);

  const defineTableHeaderId = (element: string) => {
    return `[data-testid="${dataTableHeaderPrefix}-header-${element}"]`;
  };

  // Verify that the current table is visible in the workspace
  cy.get(data).scrollIntoView().should('be.visible');

  // Verify that the current table's name is correct
  cy.get(subtitle).scrollIntoView().should('have.text', tableName.toUpperCase());

  cy.get('body').then((bodyElements) => {
    const totalRowsOfElement = bodyElements.find(dataTableRows).children().length;
    if (totalRowsOfElement > 0) {
      cy.get(dataTable).should('be.visible');

      // Verify that the current table has all the needed cells
      tableCells.forEach((header) => {
        const dataTestId = defineTableHeaderId(header);
        cy.get(dataTestId).scrollIntoView().should('be.visible');
      });

      // Import all of the available data from the table
      cy.get(dataTableRows).children().each((row, index) => {
        const nameCell: string = row.find('[data-testid="cell-name"]').text();
        const dataTestId = dataTableRows.replace('rows', `row-${index}`);
        const nameContainsSubstring = ['M1', 'M2', 'M3', 'D8E'].some(
          (viewingCondition) => nameCell.toUpperCase().includes(viewingCondition),
        );
        if (['recipes'].includes(tableName)) {
          if (!nameContainsSubstring) {
            // temporary solution until we implement the recipe
            // validations in the automation tests
            const substrateCell: string = row.find('[data-testid="cell-substrate"]').text();
            const standardsFromSubstrates = new Map<string, string>(
              JSON.parse(localStorage.getItem('standardSubstrateRelations')),
            );
            standardsFromSubstrates.set(substrateCell, nameCell);

            localStorage.setItem(
              'standardSubstrateRelations',
              JSON.stringify(Array.from(standardsFromSubstrates.entries())),
            );
          }
        } else {
          const dataKey = `${tableName}Data`;
          cy.get(dataTestId)
            .find('[data-testid="import-button"]')
            .scrollIntoView()
            .click()
            .should('have.text', 'Imported')
            .should('be.disabled');

          const currentData: string[] = localStorage.getItem(dataKey)
            ? [...JSON.parse(localStorage.getItem(dataKey))].concat(nameCell)
            : new Array(nameCell);
          localStorage.setItem(dataKey, JSON.stringify(currentData));
        }
      });
    } else {
      // Verify that there is a message when no data is imported
      cy.verifyNoAvailableDataForSection(tableName, empty);
    }
  });
});
