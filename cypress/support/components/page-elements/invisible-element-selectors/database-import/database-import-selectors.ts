import { makeShortName } from '../../../../util/selectors';

// Notification selectors
export const dataImportSuccessNotification = '#notistack-snackbar';
export const dataImportCloseNotification = '[data-testid="close-snackbar"]';

// File upload selectors
export const dataImportUploadingFileLoader = '[data-testid="file-upload-loading-spinner"]';
export const dataImportUploadedFileName = '[data-testid="uploaded-file-name"]';
export const dataImportWorkspaceBrowserLoader = '[data-testid="data-import-workspace-browser-loading"]';

// Workspace object parent selector
export const workspaceParentSelector = makeShortName('data-import-workspace-browser-objects');
export const emptyWorkspaceSelector = '[data-testid="data-import-workspace-browser-empty"]';

// Tables that are available in the workspace
export const dataImportTables = [
  'substrates',
  'assortments',
  'standards',
  'recipes',
  'trials',
];

// Cells that are common for all of the data import tables
export const dataImportCommonTableCells = [
  'name',
  'buttons',
  'creationdatetime',
  'info',
  'erpid',
  'owner',
  'ownergroup',
];

// Assortments table additional cells
export const assortmentsTableCells = ['industry', 'subindustry', 'substrate', 'type'];

// Recipes table additional cells
export const recipesTableCells = ['assortment', 'substrate'];

// Substrates table additional cells
export const substratesTableCells = ['type'];

// Trials table additional cells
export const trialsTableCells = ['substrate'];
