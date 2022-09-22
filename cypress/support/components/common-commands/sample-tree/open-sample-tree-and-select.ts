/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { replaceSpaceInSelector } from '../../../util/selectors';

Cypress.Commands.add('openSampleTreeAndSelect', (
  isRecipe: boolean,
  trialPrefix: string,
  sampleData: any,
): any => {
  const selectedKey = sampleData.selectedSample;
  const selectedSample = sampleData.selectedSampleTrials.find(
    (trial: any) => trial.children[0].id === selectedKey,
  );

  const prefix = `${trialPrefix.toLowerCase()}ss-${replaceSpaceInSelector(selectedSample.parentName)}`;
  cy.get(`[data-testid="${prefix}"]`)
    .first()
    .click();

  if (!isRecipe) {
    const selectedTrial = replaceSpaceInSelector(
      selectedSample.children
        .find((trial: any) => trial.id === selectedKey)
        .name,
    );
    cy.get(`[data-testid="${prefix}-${selectedTrial}"]`)
      .first()
      .click();
  }
});
