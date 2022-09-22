/// <reference types='Cypress' />

import { qualityMetallizedOptions, qualityPCOOptions, typeOptions } from '../../../support/components/substrate/substrate-options';

describe('New Substrate from Measurement feature', { retries: 1 }, () => {
  beforeEach(() => {
    cy.login();
    cy.openDialogFor('substrate', 'new');
  });

  it(`should import data from Measurement, with Substrate Type: ${typeOptions[0]}`, () => {
    cy.get('[data-testid="measure-bridge-button"]').click();
    cy.pickSelectItem('#substrate-type-select', typeOptions[0], { searchable: true, exact: true });
    cy.get('#substrate-type-select').contains(typeOptions[0]);
    cy.verifyModalWidgets('new-substrate');
    cy.createNewItem('Testing substrate creation with measurement', 'substrate');
    cy.verifyCreatedData('substrate', {
      acl: '`test',
      type: typeOptions[0],
    });
  });

  qualityMetallizedOptions.forEach((option) => {
    it(`should import data from Measurement, with Substrate Type: ${typeOptions[1]} and Substrate Quality: ${option}`, () => {
      cy.get('[data-testid="measure-bridge-button"]').click();
      cy.pickSelectItem('#substrate-type-select', typeOptions[1], { searchable: true, exact: true });
      cy.get('#substrate-type-select').contains(typeOptions[1]);
      cy.pickSelectItem('#substrate-quality-select', option, { searchable: true, exact: true });
      cy.get('#substrate-quality-select').contains(option);
      cy.verifyModalWidgets('new-substrate');
      cy.createNewItem('Testing substrate creation with measurement', 'substrate');
      cy.verifyCreatedData('substrate', {
        acl: '`test',
        type: typeOptions[1],
        quality: option,
      });
    });
  });

  qualityPCOOptions.forEach((option) => {
    it(`should import data from Measurement, with Substrate Type: ${typeOptions[2]} and Substrate Quality: ${option}`, () => {
      cy.get('[data-testid="measure-bridge-button"]').click();
      cy.pickSelectItem('#substrate-type-select', typeOptions[2], { searchable: true, exact: true });
      cy.get('#substrate-type-select').contains(typeOptions[2]);
      cy.pickSelectItem('#substrate-quality-select', option, { searchable: true, exact: true });
      cy.get('#substrate-quality-select').contains(option);
      if (option === 'User Defined') {
        cy.replaceNumberValue('[data-testid="selectedRoughnessPercent"] input', 10);
      }
      cy.verifyModalWidgets('new-substrate');
      cy.createNewItem('Testing substrate creation with measurement', 'substrate');

      let roughness = 0;
      if (option === 'Uncoated') {
        roughness = 25;
      } else if (option === 'User Defined') {
        roughness = 10;
      }

      cy.verifyCreatedData('substrate', {
        acl: '`test',
        type: typeOptions[2],
        quality: option,
        roughness,
      });
    });
  });

  afterEach(() => {
    cy.deleteExistingOption('substrate');
  });
});
