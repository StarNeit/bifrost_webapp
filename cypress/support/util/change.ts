Cypress.Commands.add(
  'replaceNumberValue',
  (
    selector: string,
    value: number,
  ): any => {
    cy.get(selector)
      .scrollIntoView()
      .click({ force: true })
      .type(`{selectall}${value}`);
  },
);
