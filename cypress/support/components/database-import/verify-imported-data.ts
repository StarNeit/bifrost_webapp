import { makeShortName, replaceSpaceInSelector } from '../../util/selectors';

Cypress.Commands.add('verifyImportedData', (
  file: string,
  tables: string[],
): any => {
  tables
    .filter((table) => localStorage.getItem(`${table}Data`) && table !== 'trials')
    .forEach((table) => {
      if (table === 'substrates') {
        const substrates: string[] = JSON.parse(localStorage.getItem('substratesData'));
        substrates.forEach((value: string) => {
          cy.selectStandardForSubstrate(value);
        });
      } else {
        const standards: string[] = JSON.parse(localStorage.getItem('standardsData'));
        const trials: string[] = JSON.parse(localStorage.getItem('trialsData'));

        standards.forEach((value: string) => {
          cy.pickSelectItem(
            '#standard-select',
            value,
            {
              searchable: true,
              exact: false,
            },
          );

          if (file.includes('.mif') && trials && trials.length > 0) {
            cy.get('[data-testid="sample-collapsable-button"]').click();

            cy.wrap(trials).each((trial: string) => {
              const prefix = `${makeShortName(value.toLowerCase())}ss`;
              const standardTestId = `${prefix}-${replaceSpaceInSelector(trial.toLowerCase())}`;
              cy.get(`[data-testid="${standardTestId}"]`)
                .should('have.text', trial);
            }).then(() => cy.deleteExistingOption('standard'));
          } else {
            cy.deleteExistingOption('standard');
          }
        });
      }
    });
});
