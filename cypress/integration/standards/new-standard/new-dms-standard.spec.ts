/// <reference types='Cypress' />

describe('New standard from DMS import feature', () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('standard', 'new');
  });

  it('should be able to import data from DMS and create a standard', () => {
    cy.populateDialogAndValidate(
      'standard',
      'dms',
      'Testing standard creation with DMS',
      {
        acl: '`test',
      },
    );
  });

  afterEach(() => {
    // Remove the newly created standard
    cy.deleteExistingOption('standard');
  });
});
