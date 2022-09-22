import { Column, TableState } from 'react-table';
import { TableSettings } from '../../widgets/WidgetLayout/types';

export function getHiddenColumns<
  T extends Record<string, unknown>
>(
  columns: Column<T>[],
  initialActiveColumnIds: string[] = [],
) {
  return columns
    .filter(
      (column) => (typeof column.id === 'string' && !initialActiveColumnIds.includes(column.id)),
    )
    .map<string>(((column) => column.id as string));
}

type GenericTableSettings = TableSettings & {activeColumnIds?: string[]};

export function getInitialTableSettings(
  tableSettings: GenericTableSettings,
  defaultTableSettings?: GenericTableSettings,
) {
  const state: Partial<TableState<Record<string, unknown>> & {
    activeColumnIds: string[];
  }> = {};

  if (defaultTableSettings?.activeColumnIds) {
    state.activeColumnIds = defaultTableSettings.activeColumnIds;
  }
  if (tableSettings.activeColumnIds) {
    state.activeColumnIds = tableSettings.activeColumnIds;
  }

  if (defaultTableSettings?.sizing) state.columnResizing = defaultTableSettings.sizing;
  if (tableSettings.sizing) state.columnResizing = tableSettings.sizing;

  if (defaultTableSettings?.sizing) state.columnResizing = defaultTableSettings.sizing;
  if (tableSettings.sizing) state.columnResizing = tableSettings.sizing;

  // if the default table settings sortBy is default (empty array), use the default one
  if (defaultTableSettings?.sortBy) state.sortBy = defaultTableSettings.sortBy;
  if (tableSettings.sortBy?.length) state.sortBy = tableSettings.sortBy;

  if (defaultTableSettings?.order) state.columnOrder = defaultTableSettings.order;
  if (tableSettings.order) state.columnOrder = tableSettings.order;

  return state;
}
