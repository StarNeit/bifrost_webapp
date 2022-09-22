/* eslint-disable @typescript-eslint/no-explicit-any */
import { findBasicMaterial, getColorantAssortment } from '../../../util/find';
import { replaceSpaceInSelector } from '../../../util/selectors';

Cypress.Commands.add('populateConcentrationPercentages', (
  sectionName: string,
  data: any,
): any => {
  if (data.selectedElementIds && data.selectedElementIds.length > 0) {
    data.selectedElementIds.forEach((element: string) => {
      const assortmentOfColorant = getColorantAssortment(
        element,
        data.colorants,
      );

      const isColorantSection = sectionName === 'colorants';
      const isConcentratedColorant = !assortmentOfColorant.isLeftover && data.isROMBasicMaterial;

      const basicMaterial = !isColorantSection || isConcentratedColorant
        ? findBasicMaterial(element, data.colorants)
        : assortmentOfColorant;

      const prefix = replaceSpaceInSelector(basicMaterial.name);
      const minConcentrationPercentageId = isColorantSection
        ? 'minConcentrationPercentage'
        : 'selectedConcentrationPercentage';

      const concentrationPercentages = data.concentrationPercentages[element];

      const minConcentrationPercentage: number = concentrationPercentages !== undefined
        && concentrationPercentages.minConcentrationPercentage !== undefined
        ? concentrationPercentages.minConcentrationPercentage
        : assortmentOfColorant.minConcentrationPercentage;

      cy.changeToDefaultInputValue(
        `${prefix}-${minConcentrationPercentageId}`,
        `${basicMaterial.name}'s minimum concentration percentage'`,
        minConcentrationPercentage,
      );

      if (isColorantSection) {
        const keys: string[] = data.requiredComponentIds;

        const maxConcentrationPercentage: number = concentrationPercentages !== undefined
          && concentrationPercentages.maxConcentrationPercentage !== undefined
          ? concentrationPercentages.maxConcentrationPercentage
          : assortmentOfColorant.maxConcentrationPercentage;

        cy.changeToDefaultInputValue(
          `${prefix}-selectedMaxConcentrationPercentage`,
          `${basicMaterial.name}'s maximum concentration percentage'`,
          maxConcentrationPercentage,
        );

        if (assortmentOfColorant.isLeftover) {
          // should be checked bu default
          cy.get(`[data-testid="${prefix}-checkbox"] input`)
            .should('have.attr', 'checked');

          // make sure that leftovers stay checked
          cy.get(`[data-testid="${prefix}-checkbox"] input`)
            .uncheck({ force: true })
            .should('be.checked');
        } else if (keys && keys.length > 0 && keys.includes(basicMaterial.id)) {
          cy.get(`[data-testid="${prefix}-checkbox"] input`)
            .check({ force: true })
            .should('be.checked');
        } else {
          cy.get(`[data-testid="${prefix}-checkbox"] input`)
            .uncheck({ force: true })
            .should('not.be.checked');
        }
      }
    });
  }
});
