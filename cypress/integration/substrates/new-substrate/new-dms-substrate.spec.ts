/// <reference types='Cypress' />

import { qualityMetallizedOptions, qualityPCOOptions, typeOptions } from '../../../support/components/substrate/substrate-options';

describe('New Substrate from DMS feature', { retries: 1 }, () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('substrate', 'new');
  });

  it(`should import data from DMS, with Substrate Type: ${typeOptions[0]}`, () => {
    cy.populateDialogAndValidate(
      'substrate',
      'dms',
      'Testing substrate creation with DMS',
      {
        acl: '`test',
        type: typeOptions[0],
      },
    );
  });

  qualityMetallizedOptions.forEach((option) => {
    it(`should import data from DMS, with Substrate Type: ${typeOptions[1]} and Substrate Quality: ${option}`, () => {
      cy.populateDialogAndValidate(
        'substrate',
        'dms',
        'Testing substrate creation with DMS',
        {
          acl: '`test',
          type: typeOptions[1],
          quality: option,
        },
      );
    });
  });

  qualityPCOOptions.forEach((option) => {
    it(`should import data from DMS, with Substrate Type: ${typeOptions[2]} and Substrate Quality: ${option}`, () => {
      let roughness = 0;
      if (option === 'Uncoated') {
        roughness = 25;
      } else if (option === 'User Defined') {
        roughness = 10;
      }

      cy.populateDialogAndValidate(
        'substrate',
        'dms',
        'Testing substrate creation with DMS',
        {
          acl: '`test',
          type: typeOptions[2],
          quality: option,
          roughness,
        },
      );
    });
  });

  afterEach(() => {
    cy.deleteExistingOption('substrate');
  });
});
