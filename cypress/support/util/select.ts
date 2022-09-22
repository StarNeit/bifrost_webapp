/* eslint-disable @typescript-eslint/no-explicit-any */
import { removeExtraSpaces } from './selectors';

Cypress.Commands.add(
  'pickSelectItem',
  (
    selector: string,
    value: string,
    options: SelectValueOptions = {
      clearPreviousValue: true,
      searchable: false,
      exact: true,
    },
  ): any => {
    cy.waitForFormulationPageToLoad();
    // react-select lists are virtualized,
    // so we have to search in order to get the item rendered into DOM
    cy.get(selector).click();

    if (options.searchable) {
      cy.get(`${selector} input`).focus().type(value, { force: true });
    }

    cy.contains('[role=menuitem]', value, { matchCase: false })
      .as('SearchInputValue');

    if (options.exact) {
      cy.get(`${selector} input`).focus().type('{enter}', { force: true });
    } else {
      cy.get('@SearchInputValue').first().click({ force: true });
    }

    cy.waitForFormulationPageToLoad();
    cy.get(selector).contains(value, { matchCase: false });
  },
);

Cypress.Commands.add(
  'pickSelectItems',
  (
    selector: string,
    values: string[],
  ): any => {
    // react-select lists are virtualized,
    // so we have to search in order to get the item rendered into DOM
    cy.get(selector).click('right');

    values.forEach((value) => {
      cy.get(`${selector} input`).focus().type(value, { force: true });
      cy.contains('[role=menuitem]', removeExtraSpaces(value)).click();
    });

    cy.get(`${selector} input`).blur();
  },
);

Cypress.Commands.add(
  'clearSelectItems',
  (
    selector: string,
  ): any => {
    cy.get(`${selector} [data-testid="indicator-container-icons"]`)
      .find('svg')
      .first()
      .click();
  },
);
