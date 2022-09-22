import {
  assortmentsTableCells,
  dataImportCommonTableCells,
  recipesTableCells,
  substratesTableCells,
  trialsTableCells,
  workspaceParentSelector,
} from './database-import-selectors';

export function defineCommonIDs(
  typeOfData: string,
) {
  const data = `[data-testid="${workspaceParentSelector}-${typeOfData}"]`;
  const subtitle = data.replace(typeOfData, `${typeOfData}-subtitle`);
  const empty = data.replace(typeOfData, `${typeOfData}-empty`);

  const dataTable = data.replace(typeOfData, `${typeOfData}-table`);
  const dataTableRows = data.replace(typeOfData, `${typeOfData}-table-rows`);
  const dataTableHeaderPrefix = `${workspaceParentSelector}-${typeOfData}-table`;

  let tableCells = [];
  switch (typeOfData) {
    case 'assortments':
      tableCells = dataImportCommonTableCells.concat(assortmentsTableCells);
      break;
    case 'recipes':
      tableCells = dataImportCommonTableCells.concat(recipesTableCells);
      break;
    case 'substrates':
      tableCells = dataImportCommonTableCells.concat(substratesTableCells);
      break;
    case 'trials':
      tableCells = dataImportCommonTableCells.concat(trialsTableCells);
      break;
    default:
      tableCells = dataImportCommonTableCells;
      break;
  }

  return {
    data,
    subtitle,
    empty,
    dataTable,
    dataTableRows,
    dataTableHeaderPrefix,
    tableCells,
  };
}
