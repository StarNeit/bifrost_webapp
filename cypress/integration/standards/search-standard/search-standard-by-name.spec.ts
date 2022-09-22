/// <reference types='Cypress' />

import {
  inputDates,
  measurementStandardName,
  standardFullName,
  standardNonExistingName,
} from '../../../support/components/search-standard/search-standard-validation-data';
import { formatDate } from '../../../support/util/selectors';

describe('Search standard by: name feature', () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('standard', 'search');
    cy.getSearchStandardElements();
  });

  it('should validate table cells for standard search by name', () => {
    cy.get('@SearchByStandardNameInputField').clear().type(standardFullName.substr(0, 3));
    cy.get('@SearchForStandrdsButton').click().should('be.enabled');

    cy.get('[data-testid="search-standards-result-table-loading-container"]')
      .should('not.be.exist');

    cy.get('@SearchResultTable').find('th').its('length').should('be.eq', 3);
    cy.get('[data-testid="search-standards-result-table-header-preview"]').should('exist');
    cy.get('[data-testid="search-standards-result-table-header-name"]').should('exist');
    cy.get('[data-testid="search-standards-result-table-header-creationdatetime"]').should('exist');
  });

  it("should try to find a standard through a standard's full name (without a filter)", () => {
    cy.get('@SearchByStandardNameInputField').clear().type(standardFullName);
    cy.get('@SearchForStandrdsButton').click().should('be.enabled');

    cy.get('[data-testid="search-standards-result-table-loading-container"]')
      .should('not.be.exist');

    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.eq', 1);

    const prefix = '[data-testid="search-standards-result-table-row-0"]';
    cy.get(prefix).find('[data-testid="cell-name"]').then(
      (el) => {
        expect(el.text()).to.eq(standardFullName);
      },
    );
  });

  it("should try to find a standard through a standard's full name (with a filter)", () => {
    cy.get('@SearchByStandardNameInputField').clear().type(measurementStandardName);
    cy.get('@StandardSearchFilterStartDate').type(inputDates[0]);
    cy.get('@StandardSearchFilterEndDate').clear();
    cy.get('@SearchForStandrdsButton').click().should('be.enabled');

    cy.get('[data-testid="search-standards-result-table-loading-container"]')
      .should('not.be.exist');

    cy.get('[data-testid="search-standards-result-table-rows"]')
      .its('length')
      .should('be.eq', 1);

    const prefix = '[data-testid="search-standards-result-table-row-0"]';
    cy.get(prefix).find('[data-testid="cell-name"]').then(
      (el) => {
        expect(el.text()).to.eq(measurementStandardName);
        cy.get(prefix).find('[data-testid="cell-creationdatetime"]').invoke('text').then((value) => {
          const currentStandardDate = formatDate(value);
          const fromDateFilterValidation = new Date(inputDates[0]);

          expect(currentStandardDate).to.be.gte(fromDateFilterValidation);
        });
      },
    );
  });

  it("should try to find a standard through a standard's substring (without a filter)", () => {
    const standardSubstring = standardFullName.substr(4, 3);

    cy.get('@SearchByStandardNameInputField').clear().type(`   ${standardSubstring} `);
    cy.get('@SearchForStandrdsButton').click().should('be.enabled');

    cy.get('[data-testid="search-standards-result-table-loading-container"]').should('not.be.exist');
    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.gte', 1);

    cy.get('[data-testid="search-standards-result-table-rows"]').children().each((row, index) => {
      const prefix = `[data-testid="search-standards-result-table-row-${index}"]`;
      cy.get(prefix).find('[data-testid="cell-name"]').then(
        (el) => {
          expect(el.text().toUpperCase()).to.contain(standardSubstring);
        },
      );
    });
  });

  it("should try to find a standard through a standard's substring (with a filter)", () => {
    const standardSubstring = standardFullName.substr(0, 3);

    cy.get('@SearchByStandardNameInputField').clear().type(standardSubstring);
    cy.get('@StandardSearchFilterStartDate').type(inputDates[0]);
    cy.get('@StandardSearchFilterEndDate').type(inputDates[1]);
    cy.get('@SearchForStandrdsButton').click().should('be.enabled');

    cy.get('[data-testid="search-standards-result-table-loading-container"]')
      .should('not.be.exist');

    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.gte', 1);

    cy.get('[data-testid="search-standards-result-table-rows"]').children().each((row, index) => {
      const prefix = `[data-testid="search-standards-result-table-row-${index}"]`;

      cy.get(prefix).find('[data-testid="cell-name"]').then(
        (el) => {
          expect(el.text().toUpperCase()).to.contain(standardSubstring);
          cy.get(prefix).find('[data-testid="cell-creationdatetime"]').invoke('text').then((value) => {
            const currentStandardDate = formatDate(value);
            const fromFilterDate = new Date(inputDates[0]);
            const toFilterDate = new Date(inputDates[1]);

            expect(currentStandardDate).to.be.within(
              fromFilterDate,
              toFilterDate,
            );
          });
        },
      );
    });
  });

  it('should try to find a standard through a non-existent standard name', () => {
    cy.get('@SearchByStandardNameInputField').clear().type(standardNonExistingName);
    cy.get('@SearchForStandrdsButton').click().should('be.enabled');

    cy.get('[data-testid="search-standards-result-table-loading-container"]')
      .should('not.be.exist');

    cy.get('[data-testid="search-standards-result-table-rows"] tr').should('not.exist');

    cy.get('[data-testid="no-search-standards-message"]')
      .find('h6')
      .should('have.text', 'No standards. Please search by name or use the measure feature');
  });

  it('should not be able to search for a standard in the same time with name and then a measurement ', () => {
    cy.get('@SearchByStandardNameInputField').clear().type(measurementStandardName);
    cy.get('@MeasureStandardButton').click();

    cy.get('[data-testid="search-standards-result-table-loading-container"]')
      .should('not.be.exist');

    cy.get('@SearchByStandardNameInputField').should('not.have.text');
  });

  it('should not be able to search for a standard with the following filter: the start date that is bigger than the end date ', () => {
    const standardSubstring = standardFullName.substr(0, 3);

    cy.get('@SearchByStandardNameInputField').clear().type(standardSubstring);
    cy.get('@StandardSearchFilterStartDate').type(inputDates[1]);
    cy.get('@StandardSearchFilterEndDate').type(inputDates[0]);
    cy.get('@SearchForStandrdsButton').click().should('be.enabled');

    cy.get('[data-testid="search-standards-result-table-loading-container"]')
      .should('not.be.exist');

    cy.get('@SearchByStandardNameInputField').should('not.have.text');
  });
});
