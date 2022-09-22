Cypress.Commands.add('changeToDefaultInputValue', (
  selector: string,
  name: string,
  expectedValue: number,
): any => {
  cy.get(`[data-testid="${selector}"] input`)
    .then((element) => {
      const currentValue = Number(element.val());
      if (currentValue !== expectedValue) {
        cy.replaceNumberValue(
          `[data-testid="${selector}"] input`,
          expectedValue,
        );
      } else {
        expect(currentValue, `${name} should be equal to`).to.be.equal(expectedValue);
      }
    });
});
