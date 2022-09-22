Cypress.Commands.add('getCorrectionSetupWidgetElements', (): any => {
  cy.get('[data-testid="ecs-switch"]').as('CorrectionSettingsMode');

  cy.get('@CorrectionSettingsMode').find('input').uncheck();
  cy.get('[data-testid="expanded-correction-settings"]').as('ExpandManualCorrectionSettings');
  cy.get('[data-testid="ecs-correction-mode-switch"]').as('CorrectionMode');
  cy.get('[data-testid="ecs-assortment-value"]').as('CorrectionAssortment');
  cy.get('[data-testid="ecs-type-value"]').as('CorrectionType');

  cy.get('@CorrectionMode').find('input').check();
  cy.get('[data-testid="selectedColorantMode"]').as('NewColorantsMode');
  cy.get('[data-testid="selectedMaxAddPercent"]').as('MaximumAdd');
  cy.get('@CorrectionMode').find('input').uncheck();
  cy.get('@CorrectionSettingsMode').find('input').check();

  cy.get('[data-testid="correct-button"]').as('CorrectButton');
  cy.get('[data-testid="measure-button"]').as('MeasureCorrectionButton');
});
