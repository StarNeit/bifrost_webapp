/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep } from 'lodash';
import { Row } from 'react-table';
import config from '../config';
import { TableData } from '../widgets/ColorDataTable';

export const makeSafeSelector = (selector: string) => selector?.replace(/\//gm, '_');

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function storeTestData(key?: string, data?: unknown, append = false) {
  if (!key || !config.ENABLE_TEST_DATA_EXTRACTION) {
    return;
  }

  if (!window.xrtestDataStore) {
    window.xrtestDataStore = {};
  }

  const dataCopy = cloneDeep(data);
  if (append) {
    if (!window.xrtestDataStore[key] || !window.xrtestDataStore[key].length) {
      window.xrtestDataStore[key] = [];
    }

    window.xrtestDataStore[key].push(dataCopy);
  } else {
    window.xrtestDataStore[key] = dataCopy;
  }
}

export function getRowTestIds(
  currentRow: Row<TableData>,
  parentRows: Row<TableData>[],
): string {
  let id: string;
  let parentRow: any;
  let measurement: string | undefined;
  let viewingCondition: string | undefined;

  switch (currentRow?.depth) {
    case 0:
      id = `color-data-measurement-${currentRow?.original.label}`;
      break;

    case 1:
      id = `color-data-viewing-condition-${currentRow?.original.label}`;
      break;

    default:
      parentRow = parentRows.find((row) => row.subRows
        .find((measurementSubRow: { subRows: any[]; }) => measurementSubRow.subRows
          .find((viewingConditionSubRow: { id: string }) => {
            return viewingConditionSubRow.id === currentRow?.id;
          })));
      measurement = parentRow?.original.label;
      viewingCondition = parentRow?.subRows.find((row: { subRows: any[]; }) => row.subRows
        .find((subRow: any) => subRow.id === currentRow?.id
          && subRow.original.name === (currentRow?.original as any).name))?.original.label;

      id = `${measurement}-${viewingCondition}-rows`;
      break;
  }

  return id;
}

export const extractTestDataFromPage = async (table: string) => {
  const tableEl = document.querySelector(`[data-testid=${table}-result-table]`);
  if (tableEl) {
    const resultsPrefix = table === 'correction' ? 'Correction' : 'Recipe';
    const recipeResultTable = [];
    const colorDataTableEntries = [];

    const recipeRows = tableEl.querySelectorAll(`[data-testid=${table}-result-table-rows] tr`) as NodeListOf<HTMLElement>;
    // eslint-disable-next-line no-restricted-syntax
    for (let index = 1; index <= Array.from(recipeRows).length; index += 1) {
      const row = Array
        .from(document.querySelectorAll('[data-testid="cell-name"] span'))
        .find((el) => el.textContent === `${resultsPrefix} ${index}`) as HTMLElement;
      row.click();
      // eslint-disable-next-line no-await-in-loop
      await wait(100);
      if (window.xrtestDataStore.recipeResultTable) {
        recipeResultTable.push(
          window.xrtestDataStore.recipeResultTable,
        );
      }
      if (window.xrtestDataStore.colorDataTable) {
        colorDataTableEntries.push(
          window.xrtestDataStore.colorDataTable,
        );
      }
    }

    storeTestData(`${table}RecipeResults`, recipeResultTable);
    storeTestData(`${table}ColorDataTableEntries`, colorDataTableEntries);
  }
};

// Used to check if the child id belongs to one of the children of the current sample
const elementIsChildOfSampleTree = (sample: any, childId: string): boolean => sample.children.some(
  (child: any) => child.id === childId,
);

export const storeSelectedSample = (
  currentSample: any,
  selectedId: string,
) => {
  let foundSampleElement = false;
  const sampleTrials: any[] = window.xrtestDataStore.selectedSampleTrials;
  const selectedIdPartOfSampleTree = sampleTrials && sampleTrials.length > 0
    ? elementIsChildOfSampleTree(sampleTrials[0], selectedId)
    : false;

  // Used to check if the sample belongs to the sample tree
  const elementIsPartOfSampleTree = (sample: any) => {
    return (sample.parentId === selectedId && selectedIdPartOfSampleTree)
      || (elementIsChildOfSampleTree(sample, selectedId)
        && elementIsChildOfSampleTree(sampleTrials[0], sample.parentId));
  };

  // Check if the standard has changed by comparing the currentSample data with
  // the first value in sampleTrials
  // (first value in sampleTrials contains the data for all parent recipes in the tree)
  const standardHasChanged = sampleTrials && !currentSample.parentId
    && JSON.stringify(currentSample) !== JSON.stringify(sampleTrials[0]);

  if (sampleTrials && !standardHasChanged) {
    // Check if the currently selected sample is part of the stored sample tree
    const currentSamplePartOfSampleTree = elementIsPartOfSampleTree(currentSample);

    // Check if the current sample has already been stored?
    const hasElement: boolean = sampleTrials.filter((sample: any) => sample.parentId)
      .some((sample: any) => elementIsPartOfSampleTree(sample));

    if (currentSample.parentId && currentSamplePartOfSampleTree && !hasElement) {
      sampleTrials.push(currentSample);
      storeTestData('selectedSampleTrials', sampleTrials);
    }

    // Check if the selected id is a child of one of the parent recipes in the sample tree
    const selectedIdIsChildOfRecipe = sampleTrials.some(
      (sample: any) => elementIsChildOfSampleTree(sample, selectedId)
        && elementIsChildOfSampleTree(sampleTrials[0], sample.parentId),
    );

    if (selectedId && (selectedIdPartOfSampleTree || selectedIdIsChildOfRecipe)) {
      foundSampleElement = true;
    }
  } else {
    storeTestData('selectedSampleTrials', new Array(currentSample));
    foundSampleElement = true;
  }

  if (foundSampleElement) {
    storeTestData('selectedSample', selectedId);
  }
};
