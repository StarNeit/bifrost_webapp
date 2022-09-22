/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  makeStyles,
  PopoverPosition,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import {
  useTable,
  useSortBy,
  SortingRule,
  TableState,
  Column,
  useBlockLayout,
  useResizeColumns,
  useColumnOrder,
} from 'react-table';
import clsx from 'clsx';
import isEqual from 'lodash/isEqual';

import { scrollbars } from '../../theme/components';
import { replaceSpaceInSelector } from '../../../cypress/support/util/selectors';
import { Sort } from './types';
import { TableSizing } from '../../widgets/WidgetLayout/types';
import DraggableHeader from './DraggableHeader';
import { getHiddenColumns } from './utils';
import { ClassNameProps } from '../../types/component';

const useStyles = makeStyles((theme) => ({
  table: {
    width: 'auto',
    border: `1px solid ${theme.palette.surface[2]}`,
  },
  row: {
    '&:hover': {
      backgroundColor: `${theme.palette.action.hover} !important`,
    },
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
  },
  pointer: {
    cursor: 'pointer',
  },
  container: {
    height: '100%',
    ...scrollbars(theme),
  },
  tableRow: {
    '&$selected, &$selected:hover': {
      backgroundColor: theme.palette.surface[3],
    },
  },
  selected: {},
  // Classes used for overwriting default MUI style
  headerCell: {
    paddingBottom: 0,
    paddingTop: 0,
    borderBottom: `1px solid ${theme.palette.surface[3]}`,
  },
  cell: {
    paddingBottom: 0,
    paddingTop: 0,
    borderBottom: 'none',
  },
  borderedCell: {
    borderBottom: `1px solid ${theme.palette.surface[3]}`,
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
  resizingInProgress: {
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

type BifrostTableInitialState<T extends { id: string }> = Partial<TableState<T> & {
  activeColumnIds?: string[];
}>;
export type BifrostTableColumn<T extends { id: string }> = Column<T> & {
  disableReorder?: boolean;
};

type Props<T extends { id: string }> = {
  className?: string,
  dataTestId?: string;
  data: T[],
  columns: BifrostTableColumn<T>[],
  onRowClick?: (values: T) => void,
  selectedRowId?: string | string[],
  initialState?: BifrostTableInitialState<T>;
  onActiveColumnChange?: (newIds: string[]) => void;
  onSortChange?: (sort: SortingRule<string>[]) => void;
  onColumnWidthChange?: (sizing: TableSizing) => void;
  onColumnOrderChange?: (newColumnOrder: string[]) => void;
  withBorders?: boolean;
  renderHeaderMenu?: (
    args: {
      sorted: Sort;
      canSort: boolean;
      columnId: string;
    }
  ) => void;
  renderHeaderOptionsMenu?: (
    args: {
      handleColumnChecked: (columnId: string) => void;
      handleColumnUnchecked: (columnId: string) => void;
      menuPosition: PopoverPosition;
      visibleColumnIds: string[];
      onClose: () => void;
    }
  ) => void;
};

const defaultColumn = {
  width: 150,
  minWidth: 64,
};

// Generic prop types aren't possible with our Component<Props> syntax.
// Inline parameter and return value types allow us to use generic prop types.
const BifrostTable = <T extends ClassNameProps & { id: string }>({
  className,
  data,
  columns,
  onRowClick,
  selectedRowId,
  dataTestId,
  initialState,
  onActiveColumnChange,
  onSortChange,
  onColumnWidthChange,
  onColumnOrderChange,
  withBorders = true,
  renderHeaderMenu,
  renderHeaderOptionsMenu,
}: Props<T>): ReactElement => {
  const selectedRowsId = Array.isArray(selectedRowId) ? selectedRowId : [selectedRowId];
  const classes = useStyles();

  const memoizedColumns = useMemo(() => columns, []);
  const disabledReorderColumnIds = useMemo(() => columns
    .filter((column) => column.disableReorder && typeof column.id === 'string')
    .map(({ id }) => id as string),
  []);

  const [optionsMenuPosition, setOptionsMenuPosition] = useState<PopoverPosition>();

  const {
    state,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    toggleHideColumn,
    visibleColumns,
    setSortBy,
    allColumns,
    setColumnOrder,
  } = useTable(
    {
      columns: memoizedColumns,
      data,
      defaultColumn,
      initialState: {
        ...initialState,
        hiddenColumns: initialState?.activeColumnIds
          ? getHiddenColumns(columns, initialState.activeColumnIds)
          : initialState?.hiddenColumns || [],
      },
    },
    useSortBy,
    useColumnOrder,
    useBlockLayout,
    useResizeColumns,
  );

  // effect for calling prop callback when column resize happens
  useEffect(() => {
    if (!onColumnWidthChange) return;

    const resizingState = state.columnResizing;

    const resizingIsDone = !resizingState.isResizingColumn;
    const resizingStateExists = Boolean(Object.keys(resizingState.columnWidths).length);
    const resizingStateIsNew = initialState?.columnResizing
      ? !isEqual(resizingState.columnWidths, initialState.columnResizing.columnWidths)
      : true;

    if (
      resizingIsDone
      && resizingStateExists
      && resizingStateIsNew
    ) {
      onColumnWidthChange({
        columnWidth: resizingState.columnWidth,
        columnWidths: resizingState.columnWidths,
        headerIdWidths: resizingState.headerIdWidths,
      });
    }
  }, [state.columnResizing.isResizingColumn]);

  const handleColumnChecked = useCallback((columnId: string) => {
    const visibleColumnIds = visibleColumns.map((column) => column.id);

    onActiveColumnChange?.(visibleColumnIds.concat(columnId));

    toggleHideColumn(columnId, false);
  }, [visibleColumns]);

  const handleColumnUnchecked = useCallback((columnId: string) => {
    const visibleColumnIds = visibleColumns.map((column) => column.id);

    onActiveColumnChange?.(visibleColumnIds.filter((id) => columnId !== id));

    toggleHideColumn(columnId, true);
  }, [visibleColumns]);

  const handleOptionsMenuClose = useCallback(() => setOptionsMenuPosition(undefined), []);

  const visibleColumnIds = useMemo(() => visibleColumns.map(({ id }) => id), [visibleColumns]);

  // toggles between asc, desc and none
  const handleSort = (columnId: string) => {
    const sortRuleExists = state.sortBy.some(({ id }) => id === columnId);

    let sortRule: SortingRule<string>[];
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
    onSortChange?.(sortRule);
  };

  const columnIds = useMemo(() => allColumns.map(({ id }) => id), [allColumns]);
  return (
    <TableContainer className={clsx(className, classes.container)}>
      <Table
        data-testid={dataTestId}
        classes={{
          root: classes.table,
        }}
        {...getTableProps()}
      >

        <TableHead>
          {headerGroups.map((headerGroup) => (
            <DraggableHeader
              key={headerGroup.getHeaderGroupProps().key}
              columnIds={columnIds}
              disabledReorderColumnIds={disabledReorderColumnIds}
              headerGroup={headerGroup}
              onOrderChange={setColumnOrder}
              onOrderChangeDone={() => onColumnOrderChange?.(state.columnOrder)}
              renderCell={({ draggableProvided, draggableSnapshot, column }) => (
                <TableCell
                  data-testid={`${dataTestId}-header-${column.id.toLowerCase()}`}
                  classes={{
                    root: clsx(classes.headerCell, {
                      [classes.resizerTableCell]: !column.disableResizing,
                      [classes.resizingInProgress]: column.isResizing,
                    }),
                  }}
                  {...column.getHeaderProps()}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setOptionsMenuPosition({
                      top: event.pageY,
                      left: event.pageX,
                    });
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

                    {renderHeaderMenu?.({
                      sorted: (!column.isSorted && 'none') || (column.isSortedDesc ? 'desc' : 'asc'),
                      canSort: column.canSort,
                      columnId: column.id,
                    })}

                  </div>

                  {!column.disableResizing && (
                  <div
                    {...column.getResizerProps()}
                    className={clsx(
                      classes.resizer,
                      { [classes.hidden]: draggableSnapshot.isDragging },
                    )}
                  />
                  )}
                </TableCell>
              )}
            />
          ))}

          {optionsMenuPosition && renderHeaderOptionsMenu?.({
            menuPosition: optionsMenuPosition,
            handleColumnChecked,
            handleColumnUnchecked,
            visibleColumnIds,
            onClose: handleOptionsMenuClose,
          })}
        </TableHead>

        <TableBody data-testid={`${dataTestId}-rows`} {...getTableBodyProps()}>
          {rows.map((row, rowIndex) => {
            prepareRow(row);
            return (
              <TableRow
                data-testid={`${dataTestId}-row-${rowIndex}`}
                {...row.getRowProps()}
                onClick={() => onRowClick?.(row.original)}
                className={clsx(row.original.className, {
                  [classes.tableRow]: Boolean(onRowClick),
                })}
                selected={selectedRowsId.includes(row.original.id)}
                classes={{
                  root: clsx({
                    [classes.row]: Boolean(onRowClick),
                    [classes.pointer]: Boolean(onRowClick),
                  }),
                  selected: classes.selected,
                }}
              >
                {row.cells.map((cell) => {
                  return (
                    <TableCell
                      data-testid={`cell-${replaceSpaceInSelector(cell.column.id?.toString())}`}
                      classes={{
                        root: clsx(classes.cell, {
                          [classes.borderedCell]: withBorders,
                        }),
                      }}
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>

      </Table>
    </TableContainer>
  );
};

export default BifrostTable;
