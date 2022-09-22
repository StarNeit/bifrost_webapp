const hamburgerOptions = ['QC', 'Formulation', 'Correction', 'Database Import', 'Configuration'];
const languageOptions = [
  'Arabic', 'Chinese', 'German', 'Greek', 'English', 'Spanish', 'French',
  'Italian', 'Japanese', 'Korean', 'Polish', 'Portuguese', 'Russian', 'Turkish',
];

Cypress.Commands.add('verifyNavBarItems', (pageTitle: string): any => {
  // Validation of the top menu bar of the "Correction Page"
  cy.get('@HamburgerButton').should('be.visible').should('be.enabled');
  cy.get('@HamburgerContainer').should('be.hidden');
  cy.get('[data-testid="page-title"]').should('have.text', pageTitle);

  cy.get('@FeedbackButton').should('be.visible').should('be.enabled');

  cy.get('@LanguageButton').should('be.visible').should('be.enabled');
  cy.get('@LanguageContainer').should('be.hidden');

  cy.get('@UserButton').should('be.visible').should('be.enabled');
  cy.get('@UserContainer').should('be.hidden');

  // Verify that each of the options are visible when the hamburger button is clicked
  cy.get('@HamburgerButton').click();
  cy.get('@HamburgerContainer').should('be.visible').find('li').should('have.length', 5);

  hamburgerOptions.forEach((option) => {
    const isActive = pageTitle.toLowerCase().includes(option) ? 'have.attr' : 'not.have.attr';
    cy.get('@HamburgerContainer').find('li')
      .contains(option).should(isActive, 'aria-disabled', true);
  });

  // Remove focus from current element
  cy.clickAway();
  cy.get('@HamburgerContainer').should('be.hidden');

  // Verify that each of the language options are available when the language menu button is clicked
  cy.get('@LanguageButton').click();
  cy.get('@LanguageContainer').should('be.visible').find('li').should('have.length', 14);

  // Verify that the Language menu contains all of the languages
  languageOptions.forEach((language) => {
    cy.get('@LanguageContainer').find('li').contains(language);
  });

  // Remove focus from current element
  cy.clickAway();
  cy.get('@LanguageContainer').should('be.hidden');

  // Verify that each of the user options are available when the user menu button is clicked
  cy.get('@UserButton').click();
  cy.get('@UserContainer').should('be.visible')
    .find('li').should('have.length', 1)
    .should('have.text', 'Logout');

  // remove focus from current element
  cy.clickAway();
  cy.get('@UserContainer').should('be.hidden');
});
