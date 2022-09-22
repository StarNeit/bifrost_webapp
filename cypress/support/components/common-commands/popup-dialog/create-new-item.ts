import format from 'date-fns/format';

Cypress.Commands.add('createNewItem', (
  nameOfItem: string,
  selector: string,
): any => {
  const date = new Date();
  const newItemName = nameOfItem.concat(` - ${format(date, 'dd-MM-yyyy HH:mm:ss')}`);
  cy.get(`[data-testid="new-${selector}-name"]`).clear().type(newItemName);
  cy.pickSelectItem('#acl-select', '`test', { searchable: true, exact: true });
  cy.get(`[data-testid="save-new-${selector}-button"]`).click();

  if (selector === 'substrate') {
    cy.pickSelectItem('#standard-select', 'HKS10E', { searchable: true, exact: true });
    cy.pickSelectItem('#assortment-select', 'Flexo', { searchable: true, exact: false });
  }

  cy.pickSelectItem(`#${selector}-select`, newItemName, { searchable: true, exact: false });
});
