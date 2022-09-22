import { ComponentProps, CSSProperties } from 'react';
import { makeStyles, TableRow } from '@material-ui/core';
import clsx from 'clsx';

import { Component, ClassNameProps } from '../../types/component';
import { Column, Data } from './index';
import Cell from './Cell';
import HeaderCell from './HeaderCell';

type Props = ClassNameProps & ComponentProps<typeof TableRow> & {
  testId?: string,
  index: number,
  sortedBy?: string,
  isSelected?: boolean,
  hasFixedHeight?: boolean,
  rowStyle?: CSSProperties,
  sortOrder?: 'desc' | 'asc',
  sortBy?: (arg: string) => void,
  onRowClick?: (data: Data, index: number) => void,
  data: Data[],
  staticColumns?: Column[],
  initialColumns: Column[],
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  selected: {
    backgroundColor: `${theme.palette.action.active} !important`,
    '&:hover': {
      backgroundColor: `${theme.palette.action.hover} !important`,
    },
  },
  odd: {
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },
  staticColumns: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    height: 'auto',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
  },
  column: {
    display: 'flex',
    flexDirection: 'row',
  },
  header: {
    flex: '0 0 140px',
    minWidth: '140px',
    height: 'auto',
    borderRight: `1px solid ${theme.palette.divider}`,
    margin: `0 ${theme.spacing(0.5)}px`,
  },
  data: {
    cursor: 'pointer',
    flexGrow: 1,
    height: 'auto',
    margin: `0 ${theme.spacing(0.5)}px`,
  },
  fixedHeight: {
    overflow: 'hidden',
  },
}));

const MobileRow: Component<Props> = (props) => {
  const {
    testId,
    staticColumns,
    hasFixedHeight, // virtualized tables have fixed height
    initialColumns,
    data,
    index,
    rowStyle,
    sortBy,
    sortedBy,
    onRowClick,
    sortOrder = 'desc',
    isSelected = false,
  } = props;
  const classes = useStyles(props);

  return (
    <div
      data-testid={testId}
      className={clsx({
        [classes.root]: true,
        [classes.odd]: !!(index % 2),
      })}
      style={rowStyle}
    >
      {staticColumns
        && (
        <TableRow
          hover
          component="div"
          onClick={onRowClick ? () => onRowClick(data[index], index) : undefined}
          role="checkbox"
          aria-checked={isSelected}
          selected={isSelected}
          tabIndex={-1}
          classes={{
            root: classes.staticColumns,
            selected: classes.selected,
          }}
        >
          {staticColumns.map((column) => (
            <Cell
              key={column.id}
              column={column}
              data={data}
              index={index}
            />
          ))}
        </TableRow>
        )}
      <TableRow
        hover
        component="div"
        onClick={onRowClick ? () => onRowClick(data[index], index) : undefined}
        role="checkbox"
        aria-checked={isSelected}
        selected={isSelected}
        tabIndex={-1}
        classes={{
          root: clsx({
            [classes.row]: true,
            [classes.fixedHeight]: hasFixedHeight,
          }),
          selected: classes.selected,
        }}
      >
        {initialColumns.map((column) => (
          <div
            key={column.id}
            className={clsx({
              [classes.column]: true,
              [classes.fixedHeight]: hasFixedHeight,
            })}
          >
            <HeaderCell
              column={column}
              sortBy={sortBy}
              sortedBy={sortedBy}
              sortOrder={sortOrder}
              className={classes.header}
              ignoreCustomWidth
            />
            <Cell
              column={column}
              data={data}
              index={index}
              className={classes.data}
            />
          </div>
        ))}
      </TableRow>
    </div>
  );
};

export default MobileRow;
