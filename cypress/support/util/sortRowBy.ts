/* eslint-disable @typescript-eslint/no-explicit-any */
Cypress.Commands.add('sortRowBy', (
  tableID: string,
  cellName: string,
  sortingOrder: string,
): any => {
  const name = cellName.toLowerCase();

  cy.window().then((currentState) => {
    const selector = `[data-testid="${tableID}-header-${name}"] [data-sortedby="${sortingOrder}"]`;
    const currentHeader = currentState.document.querySelector(selector);

    cy.get(`[data-testid="${tableID}-header-${name}"]`).scrollIntoView().should('be.visible');
    if (currentHeader === null) {
      cy.get(`[data-testid="${tableID}-header-${name}"]`).click();
      cy.sortRowBy(tableID, cellName, sortingOrder);
    }
  });
});
