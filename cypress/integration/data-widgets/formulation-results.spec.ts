/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types='Cypress' />

import metadata from '../../fixtures/metadata.json';
import {
  compare,
  orderList,
  testColumns,
  toNumber,
  toPrecisePrice,
} from '../../support/components/data-widgets/formulation-results/helpers';
import { toPrecise } from '../../support/util/selectors';

let listExpectedResults: any[];

describe('Formulation Result Widget', { retries: 1 }, () => {
  let standardName = '';
  before(() => {
    const currentFormulationData = metadata.formulations
      .find((test) => test.containsFormulation).name;

    cy.fixture(`formulations/${currentFormulationData}`).then((testData: BifrostTestData) => {
      listExpectedResults = testData.formulationResultData.map((entry) => {
        return {
          id: entry.id,
          type: entry.type,
          name: entry.name,
          score: entry.score,
          colors: entry.colors,
          numComponents: String(entry.numberOfComponents),
          price: entry.price,
          deltae76: entry.deltaE76,
          deltae: Cypress._.round(toNumber(entry.deltaE2000), 2).toFixed(2),
        };
      });
      standardName = testData.selectedStandard.label;
      cy.login();
      cy.log(`Formulating ${standardName}`);
      cy.waitForFormulationPageToLoad();
      cy.pickSelectItem('#standard-select', standardName, { searchable: true, exact: true });
      cy.waitForFormulationPageToLoad();
      cy.pickSelectItem('#sample-select', 'Recipe 1', { searchable: true, exact: true });
      cy.waitForFormulationPageToLoad();
      cy.get('[data-testid="formulate-btn"]').click().should('be.disabled');

      cy.get('[data-testid="formulation-result-table-header-name"]').rightclick({ force: true });
      testColumns.forEach((column) => {
        cy.get(`[data-testid="facm-${column.toLowerCase()}-checkbox"]`).find('input').scrollIntoView().check();
      });
      cy.clickAway();
    });
  });

  Cypress._.each(testColumns, (columnName) => {
    const column = columnName.toLowerCase();

    it(`should check that sorting by descending and then ascending for the ${columnName} is working`, () => {
      const listExpectedResultsDesc = listExpectedResults.sort((a, b) => {
        if (['name', 'price'].includes(columnName)) {
          return compare(b[columnName], a[columnName]);
        }

        // If two values are the same, sort by deltae. Sort of a "multisort"
        return b[columnName] - a[columnName]
          || b.deltae - a.deltae
          || b.deltae76 - a.deltae76;
      });

      const listExpectedResultsAsc = [...listExpectedResultsDesc];
      listExpectedResultsAsc.reverse();

      const columnSelector = (colName: string) => (colName === 'name'
        ? '[data-testid="cell-name"] span'
        : `[data-testid="cell-${colName}"] p`);

      Cypress._.each(orderList, (order) => {
        cy.clickAway();
        cy.sortRowBy('formulation-result-table', column, order);
        cy.get('[data-testid="formulation-result-table-rows"]').children()
          .get(columnSelector(column)).each((el, index) => {
            const currentRow = order === 'desc'
              ? listExpectedResultsDesc[index]
              : listExpectedResultsAsc[index];

            let expectedValue: string;
            if (['name', 'numComponents'].includes(columnName)) {
              expectedValue = currentRow[columnName];
            } else if (columnName === 'price') {
              expectedValue = toPrecisePrice(currentRow.price.toString());
            } else {
              expectedValue = toPrecise(currentRow[columnName]);
            }

            expect(el.text()).to.eq(expectedValue);
            cy.get(`[data-testid="formulation-result-table-row-${index}"]`)
              .should('have.text',
                currentRow.name
                + toPrecise(currentRow.deltae76)
                + toPrecise(currentRow.score)
                + currentRow.numComponents
                + toPrecisePrice(currentRow.price.toString()));
          });
      });
    });

    // can't deactivate name
    if (columnName !== 'name') {
      it(`should check that removing and adding column ${columnName} works`, () => {
        cy.clickAway();

        cy.get(`[data-testid="formulation-result-table-header-${column}"]`).rightclick();
        cy.get(`[data-testid="facm-${column}-checkbox"]`).find('input').scrollIntoView().uncheck();
        cy.clickAway();
        cy.get(`[data-testid="formulation-result-table-header-${column}"]`).should('not.exist');

        cy.get('[data-testid="formulation-result-table-header-name"]').rightclick();
        cy.get(`[data-testid="facm-${column}-checkbox"]`).find('input').scrollIntoView().check();
        cy.clickAway();
        cy.get(`[data-testid="formulation-result-table-header-${column}"]`).should('exist');
      });
    }
  });

  after(() => {
    cy.get('[data-testid="formulation-result-table-header-name"]').rightclick();
    cy.get('[data-testid="facm-price-checkbox"]').find('input').scrollIntoView().uncheck();
  });
});
