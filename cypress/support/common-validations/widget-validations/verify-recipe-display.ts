/* eslint-disable @typescript-eslint/no-explicit-any */
import { findElementText, makeMismatchMessage, toPrecise } from '../../util/selectors';

Cypress.Commands.add('verifyRecipeDisplay', (
  layer: Layer,
  mismatchMessage: string,
  isFormulation: boolean,
  correctionModeAdd?: boolean,
): any => {
  let index = 0;
  const additionalTableInformation = ['Total Basic Ink:', 'Total:'];

  // Sort the table component (except for the Solvent) by the default setting
  // (sorted by the percentage values in desc order)
  const tableComponents = layer.components
    .filter((component) => component.id !== 'the-solvent-id')
    .sort((c1, c2) => {
      return c2.percentage - c1.percentage;
    });

  // If there is a solvent, add it at the end of the array
  const hasSolvent = layer.components.find((component) => component.id === 'the-solvent-id');
  if (hasSolvent) {
    tableComponents.push(hasSolvent);
  }

  cy.sortRowBy('widget-recipe-display-2', 'name', 'default');
  cy.log('Verify recipe results for the regular component data');
  cy.get('[data-testid="widget-recipe-display-2-rows"]').children().each((row) => {
    const componentName = findElementText(row, 'name');

    if (!additionalTableInformation.includes(componentName)) {
      expect(componentName, makeMismatchMessage(mismatchMessage, 'Name')).to.eq(tableComponents[index].name);

      expect(findElementText(row, 'percentage'), makeMismatchMessage(mismatchMessage, `Colorant ${tableComponents[index].name} Formula Percentage`))
        .to.eq(toPrecise(tableComponents[index].percentage));

      expect(findElementText(row, 'amount'), makeMismatchMessage(mismatchMessage, `Colorant ${tableComponents[index].name} Amount`))
        .to.eq(toPrecise(tableComponents[index].amount));

      if (isFormulation) {
        expect(findElementText(row, 'cumulativeamount'), makeMismatchMessage(mismatchMessage, `Colorant ${tableComponents[index].name} Cumulative Amount`))
          .to.eq(toPrecise(tableComponents[index].cumulativeAmount));

        expect(findElementText(row, 'cumulativepercentage'), makeMismatchMessage(mismatchMessage, `Colorant ${tableComponents[index].name} Cumulative Percentage`))
          .to.eq(toPrecise(tableComponents[index].cumulativePercentage));
      } else {
        if (correctionModeAdd) {
          expect(findElementText(row, 'addamount'), makeMismatchMessage(mismatchMessage, `Colorant ${tableComponents[index].name} Formula Percentage`))
            .to.eq(toPrecise(tableComponents[index].addAmount));
        }

        expect(findElementText(row, 'originalamount'), makeMismatchMessage(mismatchMessage, `Colorant ${tableComponents[index].name} Original Amount`))
          .to.eq(toPrecise(tableComponents[index].originalAmount));
      }

      index += 1;
    }
  });
});
