/* eslint-disable @typescript-eslint/no-explicit-any */
import { getColorantAssortment } from '../../../util/find';

Cypress.Commands.add('populateColorants', (data: any): any => {
  const isROMBasicMaterial = data.recipeOutputMode.includes('Materials');
  const keys: string[] = data.state.requiredComponentIds;
  const selectedElementIds = data.state.selectedComponentIds.filter(
    (colorant) => getColorantAssortment(
      colorant,
      data.colorants,
    ).type !== 'TechnicalVarnish',
  );

  // set data for the colorants
  cy.populateConcentrationPercentages('colorants', {
    isROMBasicMaterial,
    keys,
    selectedElementIds,
    colorants: data.colorants,
    requiredComponentIds: data.state.requiredComponentIds,
    concentrationPercentages: data.state.concentrationPercentages,
  });
});
