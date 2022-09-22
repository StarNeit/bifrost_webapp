/// <reference types='Cypress' />

import { inputDates } from '../../../support/components/search-standard/search-standard-validation-data';
import data from '../../../support/mockup/data.json';
import { formatDate } from '../../../support/util/selectors';

// TODO after EFXW-2481 is merged into develop a few other tests should be included
describe('Search standard by: measurement (Color Search) feature', () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('standard', 'search');
    cy.getSearchStandardElements();
  });

  it('should validate table cells for Color Search', () => {
    cy.log('Should take a measurement');
    cy.task('sendMockDataToBridge', data).then(() => {
      cy.get('@MeasureStandardButton').click();
    });
    cy.get('@ClearResultsButton').should('be.enabled');
    cy.get('@SearchForStandrdsButton').click();

    cy.get('@SearchResultTable').find('th').its('length').should('be.eq', 6);
    cy.get('[data-testid="search-standards-result-table-header-preview"]').should('exist');
    cy.get('[data-testid="search-standards-result-table-header-name"]').should('exist');
    cy.get('[data-testid="search-standards-result-table-header-creationdatetime"]').should('exist');
    cy.get('[data-testid="search-standards-result-table-header-dl"]').should('exist');
    cy.get('[data-testid="search-standards-result-table-header-da"]').should('exist');
    cy.get('[data-testid="search-standards-result-table-header-db"]').should('exist');
  });

  it('should measure a color and search for standards with default De Tolerance = 2', () => {
    cy.task('sendMockDataToBridge', data).then(() => {
      cy.get('@MeasureStandardButton').click();
    });
    cy.get('@ClearResultsButton').should('be.enabled');

    cy.verifyModalWidgets('color-search');
    cy.get('@ColorSearchDeTolerance')
      .find('input')
      .should('be.enabled')
      .should('have.value', 2);

    cy.get('@SearchForStandrdsButton').click();

    cy.get('[data-testid="search-standards-result-table-loading-container"]').should('not.be.exist');
    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.gte', 1);

    cy.verifyColorSearchResults(2);
  });

  it('should measure a color and search for standards with De Tolerance = 0', () => {
    cy.task('sendMockDataToBridge', data).then(() => {
      cy.get('@MeasureStandardButton').click();
    });
    cy.get('@ClearResultsButton').should('be.enabled');

    cy.verifyModalWidgets('color-search');
    cy.replaceNumberValue('[data-testid="sscs-de-tolerance"] input', 0);

    cy.get('@SearchForStandrdsButton').click();

    cy.get('[data-testid="search-standards-result-table-loading-container"]').should('not.be.exist');
    cy.get('@SearchByStandardNameInputField').should('not.have.text');
  });

  it('should measure a color and search for standards with De Tolerance = 5', () => {
    cy.task('sendMockDataToBridge', data).then(() => {
      cy.get('@MeasureStandardButton').click();
    });
    cy.get('@ClearResultsButton').should('be.enabled');

    cy.verifyModalWidgets('color-search');
    cy.replaceNumberValue('[data-testid="sscs-de-tolerance"] input', 5);

    cy.get('@SearchForStandrdsButton').click();

    cy.get('[data-testid="search-standards-result-table-loading-container"]').should('not.be.exist');
    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.gte', 1);

    cy.verifyColorSearchResults(5);
  });

  it('should measure a color and search for standards with default De Tolerance and standard name', () => {
    cy.task('sendMockDataToBridge', data).then(() => {
      cy.get('@MeasureStandardButton').click();
    });
    cy.get('@ClearResultsButton').should('be.enabled');

    cy.verifyModalWidgets('color-search');
    cy.get('@ColorSearchDeTolerance')
      .find('input')
      .should('be.enabled')
      .should('have.value', 2);

    cy.get('@SearchByStandardNameInputField').type('Measurement');

    cy.get('@SearchForStandrdsButton').click();

    cy.get('[data-testid="search-standards-result-table-loading-container"]').should('not.be.exist');
    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.gte', 1);

    cy.get('[data-testid="search-standards-result-table-rows"]').children().each((row, index) => {
      const prefix = `[data-testid="search-standards-result-table-row-${index}"]`;
      cy.get(prefix).find('[data-testid="cell-name"]').then(
        (el) => {
          expect(el.text().toLowerCase()).to.contain('measurement');
        },
      );
    });

    cy.verifyColorSearchResults(2);
  });

  it('should measure a color and search for standards with default De Tolerance and date filters', () => {
    cy.task('sendMockDataToBridge', data).then(() => {
      cy.get('@MeasureStandardButton').click();
    });
    cy.get('@ClearResultsButton').should('be.enabled');

    cy.verifyModalWidgets('color-search');
    cy.get('@ColorSearchDeTolerance')
      .find('input')
      .should('be.enabled')
      .should('have.value', 2);

    cy.get('@StandardSearchFilterStartDate').type(inputDates[0]);
    cy.get('@StandardSearchFilterEndDate').type(inputDates[2]);

    cy.get('@SearchForStandrdsButton').click();

    cy.get('[data-testid="search-standards-result-table-loading-container"]').should('not.be.exist');
    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.gte', 1);

    cy.get('[data-testid="search-standards-result-table-rows"]').children().each((row, index) => {
      const prefix = `[data-testid="search-standards-result-table-row-${index}"]`;
      cy.get(prefix).find('[data-testid="cell-creationdatetime"]').invoke('text').then((value) => {
        const currentStandardDate = formatDate(value);
        const fromFilterDate = new Date(inputDates[0]);
        const toFilterDate = new Date(inputDates[2]);

        expect(currentStandardDate).to.be.within(
          fromFilterDate,
          toFilterDate,
        );
      });
    });

    cy.verifyColorSearchResults(2);
  });

  it('should measure a color and search for standards with default De Tolerance, standard name and date filters', () => {
    cy.task('sendMockDataToBridge', data).then(() => {
      cy.get('@MeasureStandardButton').click();
    });
    cy.get('@ClearResultsButton').should('be.enabled');

    cy.verifyModalWidgets('color-search');
    cy.get('@ColorSearchDeTolerance')
      .find('input')
      .should('be.enabled')
      .should('have.value', 2);

    cy.get('@SearchByStandardNameInputField').type('Measurement');
    cy.get('@StandardSearchFilterStartDate').type(inputDates[0]);

    cy.get('@SearchForStandrdsButton').click();

    cy.get('[data-testid="search-standards-result-table-loading-container"]').should('not.be.exist');
    cy.get('[data-testid="search-standards-result-table-rows"]')
      .find('tr')
      .its('length')
      .should('be.gte', 1);

    cy.get('[data-testid="search-standards-result-table-rows"]').children().each((row, index) => {
      const prefix = `[data-testid="search-standards-result-table-row-${index}"]`;
      cy.get(prefix).find('[data-testid="cell-name"]').then(
        (el) => {
          expect(el.text().toLowerCase()).to.contain('measurement');
        },
      );
      cy.get(prefix).find('[data-testid="cell-creationdatetime"]').invoke('text').then((value) => {
        const currentStandardDate = formatDate(value);
        const fromDateFilterValidation = new Date(inputDates[0]);

        expect(currentStandardDate).to.be.gte(
          fromDateFilterValidation,
        );
      });
    });

    cy.verifyColorSearchResults(2);
  });
});
