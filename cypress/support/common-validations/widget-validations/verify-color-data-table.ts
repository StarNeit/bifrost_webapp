/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeSafeSelector, toPrecise } from '../../util/selectors';

/* eslint-disable no-empty */
Cypress.Commands.add('verifyColorDataTable', (testData: ColorDataTableEntry): any => {
  // const keys = Object.keys(testData.colorDataTableEntries);
  const extractValues = (x: JQuery<HTMLElement>) => Array.from(x).map(
    (el: HTMLElement) => el.innerHTML,
  );

  const measurementModes = Object.keys(testData.combinedColorData).filter((x) => x !== 'M0');
  cy.clearSelectItems('#color-data-measurement-mode-select');
  cy.pickSelectItems('#color-data-measurement-mode-select', measurementModes);

  cy.wrap(Object.keys(testData.combinedColorData)).each((mode: string) => {
    const viewingConditions = Object.keys(testData.combinedColorData[mode]);

    cy.wrap(viewingConditions).each((condition: string) => {
      const escapedCondition = makeSafeSelector(condition);
      const sel = `[data-testid="wcdt4-viewing-condition-controls-${escapedCondition}"][data-test-is-selected="false"]`;

      if (cy.$$(sel).length > 0) {
        cy.get(sel).click();
      }

      cy.get(`[data-testid="${mode}-${escapedCondition}-rows"] [data-testid="cell-l"] span`)
        .then((lElements) => ({ lValues: extractValues(lElements) }))
        .then((data) => cy.get(`[data-testid="${mode}-${escapedCondition}-rows"] [data-testid="cell-a"] span`).then((aValues) => ({ ...data, aValues: extractValues(aValues) })))
        .then((data) => cy.get(`[data-testid="${mode}-${escapedCondition}-rows"] [data-testid="cell-b"] span`).then((bValues) => ({ ...data, bValues: extractValues(bValues) })))
        .then((data) => {
          const expectedData = testData.combinedColorData[mode][condition] as MeasurementSample[];
          const expectedLValues = expectedData.map((x) => toPrecise(x.L));
          const expectedAValues = expectedData.map((x) => toPrecise(x.a));
          const expectedBValues = expectedData.map((x) => toPrecise(x.b));

          expect(data.lValues).to.deep.eq(expectedLValues);
          expect(data.aValues).to.deep.eq(expectedAValues);
          expect(data.bValues).to.deep.eq(expectedBValues);
        });
    });
  });
});
