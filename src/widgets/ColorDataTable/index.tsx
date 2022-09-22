/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Column,
  SortingRule,
  useBlockLayout,
  useColumnOrder,
  useExpanded,
  useResizeColumns,
  useSortBy,
  useTable,
} from 'react-table';
import {
  makeStyles,
  Table,
  TableHead,
  TableCell,
  PopoverPosition,
} from '@material-ui/core';
import isEqual from 'lodash/isEqual';

import clsx from 'clsx';
import { ColorData, SampleData, StandardDataEntry } from '../utils';
import { Component } from '../../types/component';
import { scrollbars } from '../../theme/components';
import { ViewingCondition } from '../../types/layout';
import { getViewingConditionLabel } from '../../utils/utils';
import ExpanderRow from './ExpanderCell';
import { TableSettings, WidgetUpdate } from '../WidgetLayout/types';
import MemoizedTableBody from './MemoizedTableBody';
import DraggableHeader from '../../components/Table/DraggableHeader';
import { getHiddenColumns, getInitialTableSettings } from '../../components/Table/utils';
import SortIndicator from '../../components/Table/Controls/SortIndicator';
import OptionsMenu, { getTableHeaderOptions } from '../../components/Table/Controls/OptionsMenu';

const useStyles = makeStyles((theme) => ({
  table: {
    ...scrollbars(theme),
    '& .MuiTableCell-sizeSmall': {
      paddingRight: theme.spacing(2),
    },
  },
  tableHead: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  tableColumnCell: {
    backgroundColor: 'inherit',
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    justifySelf: 'center',
    alignSelf: 'center',
    margin: theme.spacing(7, 3),
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    columnGap: theme.spacing(0.75),
    flex: 1,
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(0.75),
    borderBottom: 'none',
    padding: theme.spacing(0, 0.75),
  },
  numericCell: {
    justifyContent: 'flex-end',
  },
  // resizer style
  resizerTableCell: {
    '& > div:last-child': {
      background: 'transparent',
    },
    '&:hover': {
      '& > div:last-child': {
        background: theme.palette.surface[4],
      },
    },
  },
  resizierInProgress: {
    userSelect: 'none',
    pointerEvents: 'none',
    '& > div:last-child': {
      background: theme.palette.surface[4],
    },
  },
  resizer: {
    pointerEvents: 'auto',
    background: theme.palette.surface[4],
    width: '2px',
    height: '85%',
    position: 'absolute',
    right: '2px',
    top: 0,
    bottom: 0,
    margin: 'auto',
  },
  hidden: {
    visibility: 'hidden',
  },
}));

export type TableData = {
  label: string;
  subRows: {
    label: string;
    subRows: (StandardDataEntry | SampleData)[];
  }[];
};

type Props = {
  isMulti?: boolean,
  viewingConditions?: ViewingCondition[],
  measurementModes?: string[],
  columns: (Column<TableData> & { disableToggleHide?: boolean })[],
  data?: ColorData,
  activeColumnIds: string[],
  onChange: (update: WidgetUpdate) => void,
  tableSettings?: TableSettings,
};

const defaultColumn = {
  width: 150,
  minWidth: 64,
};

const ColorDataTable: Component<Props> = ({
  viewingConditions = [],
  measurementModes,
  data,
  columns,
  activeColumnIds,
  onChange,
  tableSettings,
}) => {
  const classes = useStyles();
  const collapsedRowsRef = useRef<Set<string>>(new Set([]));

  const [optionsMenuPosition, setOptionsMenuPosition] = useState<PopoverPosition>();

  const expander: (Column<TableData> & { disableToggleHide?: boolean }) = {
    id: 'expander',
    Cell: ExpanderRow,
  };

  const memoizedColumns = useMemo(() => [
    { ...expander },
    ...columns,
  ], []);

  const [tableData, expanded] = useMemo(() => {
    if (!data || !measurementModes) return [[], {}];

    const presetTableData = measurementModes?.map((measurementMode) => ({
      label: measurementMode,
      subRows: viewingConditions.map((viewingCondition) => {
        const viewingConditionLabel = getViewingConditionLabel(viewingCondition);
        return {
          label: viewingConditionLabel,
          // eslint-disable-next-line max-len
          subRows: data[measurementMode] ? data[measurementMode][getViewingConditionLabel(viewingCondition)] : [],
        };
      }),
    }));

    // get all row ids
    const initiallyExpandedRows: Record<string, boolean> = {};
    measurementModes?.forEach((_, index) => {
      const firstTierRowId = index;
      const secondTierRowId = viewingConditions.map((__, id) => id);

      initiallyExpandedRows[firstTierRowId] = true;

      secondTierRowId.forEach((id) => {
        initiallyExpandedRows[`${firstTierRowId}.${id}`] = true;
      });
    });

    // filter out previously collapsed row ids
    collapsedRowsRef.current.forEach((rowId) => {
      initiallyExpandedRows[rowId] = false;
    });

    return [presetTableData, initiallyExpandedRows];
  }, [measurementModes, viewingConditions, data]);

  const initialTableSettings = useMemo(() => {
    const initSettings = getInitialTableSettings(tableSettings || {}, { activeColumnIds });
    initSettings.hiddenColumns = getHiddenColumns(columns, initSettings.activeColumnIds);
    initSettings.expanded = expanded;

    return initSettings;
  }, [expanded]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setSortBy,
    state,
    allColumns,
    setColumnOrder,
    toggleHideColumn,
    visibleColumns,
  } = useTable<TableData>(
    {
      columns: memoizedColumns,
      data: tableData,
      defaultColumn,
      initialState: initialTableSettings,
      autoResetHiddenColumns: false,
    },
    useColumnOrder,
    useSortBy,
    useExpanded,
    useBlockLayout,
    useResizeColumns,
  );

  const visibleColumnIds = useMemo(() => visibleColumns.map(({ id }) => id), [visibleColumns]);
  const availableColumns = useMemo(() => getTableHeaderOptions(memoizedColumns), [memoizedColumns]);
  const columnIds = useMemo(() => allColumns.map(({ id }) => id), [allColumns]);

  // effect for calling prop callback when column resize happens
  useEffect(() => {
    const resizingState = state.columnResizing;

    const resizingIsDone = !resizingState.isResizingColumn;
    const resizingStateExists = Boolean(Object.keys(resizingState.columnWidths).length);
    const resizingStateIsNew = tableSettings?.sizing
      ? !isEqual(resizingState.columnWidths, tableSettings.sizing.columnWidths)
      : true;

    if (
      resizingIsDone
      && resizingStateExists
      && resizingStateIsNew
    ) {
      onChange({
        tableSettings: {
          ...tableSettings,
          sizing: {
            columnWidth: resizingState.columnWidth,
            columnWidths: resizingState.columnWidths,
            headerIdWidths: resizingState.headerIdWidths,
          },
        },
      });
    }
  }, [state.columnResizing.isResizingColumn]);

  const handleColumnChecked = useCallback((columnId: string) => {
    toggleHideColumn(columnId, false);
    onChange({
      tableSettings: {
        ...tableSettings,
        activeColumnIds: [...visibleColumnIds, columnId],
      },
    });
  }, [tableSettings, visibleColumnIds]);

  const handleColumnUnchecked = useCallback((columnId: string) => {
    toggleHideColumn(columnId, true);

    onChange({
      tableSettings: {
        ...tableSettings,
        activeColumnIds: visibleColumnIds.filter((id) => id !== columnId),
      },
    });
  }, [visibleColumns, tableSettings]);

  const handleReorderColumnChange = () => {
    onChange({
      tableSettings: {
        ...tableSettings,
        order: state.columnOrder,
      },
    });
  };

  const handleSort = (columnId: string) => {
    const sortRuleExists = state.sortBy.some(({ id }) => id === columnId);

    let sortRule: SortingRule<string>[] | undefined;
    if (sortRuleExists) {
      const isDesc = state.sortBy.some(({ id, desc }) => id === columnId && desc);

      // if is descending toggle it to none
      if (isDesc) {
        sortRule = [];
      } else {
      // if is ascending toggle it to descending
        sortRule = [{
          id: columnId,
          desc: true,
        }];
      }
    } else {
    // initially set it to asc
      sortRule = [{
        id: columnId,
        desc: false,
      }];
    }

    setSortBy(sortRule);
    // this causes cycle of re-renders and the app lags a bit
    onChange({
      tableSettings: {
        ...tableSettings,
        sortBy: sortRule,
      },
    });
  };

  return (
    <Table size="small" stickyHeader className={classes.table} {...getTableProps()}>
      <TableHead>
        {headerGroups.map((headerGroup) => (
          <DraggableHeader<TableData>
            key={headerGroup.getHeaderGroupProps().key}
            columnIds={columnIds}
            headerGroup={headerGroup}
            onOrderChange={setColumnOrder}
            onOrderChangeDone={handleReorderColumnChange}
            renderCell={({ column, draggableProvided, draggableSnapshot }) => (
              <TableCell
                {...column.getHeaderProps()}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setOptionsMenuPosition({
                    top: event.pageY,
                    left: event.pageX,
                  });
                }}
                classes={{
                  root: clsx(classes.tableColumnCell, {
                    [classes.resizerTableCell]: !column.disableResizing,
                    [classes.resizierInProgress]: column.isResizing,
                  }),
                }}
                ref={draggableProvided.innerRef}
                {...draggableProvided.draggableProps}
                style={{
                  ...column.getHeaderProps().style,
                  ...draggableProvided.draggableProps.style,
                }}
                component={draggableSnapshot.isDragging ? 'div' : undefined}
              >
                <div
                  className={classes.tableCell}
                  onClick={() => column.canSort && handleSort(column.id)}
                  {...draggableProvided.dragHandleProps}
                >
                  {column.render('Header')}
                  {column.id !== 'expander' && (
                    <SortIndicator
                      sort={(!column.isSorted && 'none') || (column.isSortedDesc ? 'desc' : 'asc')}
                      hideIndicator={!column.canSort}
                    />
                  )}
                </div>

                {/* resizer  */}
                <div
                  {...column.getResizerProps()}
                  className={clsx(
                    classes.resizer,
                    { [classes.hidden]: draggableSnapshot.isDragging },
                  )}
                />
              </TableCell>
            )}
          />
        ))}

        <OptionsMenu
          menuPosition={optionsMenuPosition}
          availableColumns={availableColumns}
          handleColumnChecked={handleColumnChecked}
          handleColumnUnchecked={handleColumnUnchecked}
          onClose={() => setOptionsMenuPosition(undefined)}
          visibleColumnIds={visibleColumnIds}
        />
      </TableHead>
      <MemoizedTableBody
        collapsedRowsRef={collapsedRowsRef}
        getTableBodyProps={getTableBodyProps}
        isResizing={Boolean(state.columnResizing.isResizingColumn)}
        prepareRow={prepareRow}
        rows={rows}
      />
    </Table>
  );
};

export default ColorDataTable;
