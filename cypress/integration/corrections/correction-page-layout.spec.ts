/// <reference types='Cypress' />

describe('Correction Page', () => {
  beforeEach(() => {
    cy.login();
    cy.goToPage('Correction');
    cy.getNavBarElements();
    cy.getNavPaneElements();
    cy.getCorrectionSetupWidgetElements();
  });

  it('initial state of the page should be verified', () => {
    cy.verifyNavBarItems('Correction');
    cy.verifyNaviagationPaneElements();

    // Verify initial state of the Correction Setup widget
    cy.get('[data-testid="correction-setup-ac-title"]').should('have.text', 'CORRECTION SETUP');
    cy.get('[data-testid="ecs-label"]').should('have.text', 'Corrections Settings');
    cy.get('@CorrectionSettingsMode').find('input').should('be.checked');
    cy.get('@CorrectionSettingsMode').should('have.text', 'Automatic');
    cy.get('[data-testid="ecs-manual"]').should('not.exist');
    cy.get('@CorrectButton').should('be.disabled');
    cy.get('@MeasureCorrectionButton').should('be.disabled');

    // Switch to manual correction
    cy.get('@CorrectionSettingsMode').find('input').uncheck();
    cy.get('@CorrectionSettingsMode').should('have.text', 'Manual');
    cy.get('@ExpandManualCorrectionSettings').should('be.visible');
    cy.get('[data-testid="ecs-manual"]').should('be.visible');

    cy.get('[data-testid="ecs-assortment-label"]').should('have.text', 'Assortment');
    cy.get('[data-testid="ecs-assortment-value"]').should('be.empty');
    cy.get('[data-testid="ecs-type-label"]').should('have.text', 'Type');
    cy.get('[data-testid="ecs-type-value"]').should('be.empty');
    cy.get('[data-testid="ecs-recipe-output" ]').should('not.exist');

    cy.get('[data-testid="ecs-correction-mode-label"]').should('have.text', 'Correction Mode');
    cy.get('@CorrectionMode').find('input').should('not.be.checked');
    cy.get('@CorrectionMode').should('have.text', 'Basic Recipe');
    cy.get('[data-testid="ecs-addition-mode"]').should('not.exist');

    // Hide manual settings
    cy.get('@ExpandManualCorrectionSettings').click();
    cy.get('[data-testid="ecs-manual"]').should('not.exist');

    // Show manual settings
    cy.get('@ExpandManualCorrectionSettings').click();
    cy.get('[data-testid="ecs-manual"]').should('be.visible');

    // Switch to addition mode
    cy.get('@CorrectionMode').find('input').check();
    cy.get('@CorrectionMode').should('have.text', 'Addition');
    cy.get('[data-testid="ecs-addition-mode"]').should('be.visible');

    cy.get('[data-testid="ecs-new-colorant-label"]').should('have.text', 'New Colorants');
    // TODO switch validation (functionality not implemented)

    cy.get('[data-testid="ecs-max-add-label"]').should('have.text', 'Maximum Add');
    cy.get('@MaximumAdd').find('input').should('have.value', '50');

    // Verify that there are 4 widgets on the page
    cy.get('[data-testid="correction-widget-1"]').should('be.visible');
    cy.get('[data-testid="correction-widget-2"]').should('be.visible');
    cy.get('[data-testid="correction-widget-3"]').should('be.visible');
    cy.get('[data-testid="correction-widget-4"]').should('be.visible');

    // Verify that there is a save sample section
    cy.get('[data-testid="correction-save-sample"]').should('be.visible');
    cy.get('[data-testid="css-label"]').should('have.text', 'Sample Name');
    cy.get('[data-testid="css-button"]').should('be.disabled').should('have.text', '');

    // Hide the Navigation Pane
    cy.get('@CloseNavigationPane').click();
    cy.get('[data-testid="nav-pane-loading-container"]').should('be.hidden');

    // Show the Navigation Pane
    cy.get('@CloseNavigationPane').click();
    cy.get('[data-testid="nav-pane-loading-container"]').should('be.visible');

    // Hide the Correction Setup Pane
    cy.get('[data-testid="cs-hide-container-content-button"]').click();
    cy.get('[data-testid="expanded-correction-pane"]').should('be.hidden');

    // Show the Correction Setup Pane
    cy.get('[data-testid="cs-hide-container-content-button"]').click();
    cy.get('[data-testid="expanded-correction-pane"]').should('be.visible');
  });
});
