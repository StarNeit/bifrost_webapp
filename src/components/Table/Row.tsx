import { ComponentProps, CSSProperties } from 'react';
import { makeStyles, TableRow } from '@material-ui/core';
import clsx from 'clsx';
import { Component, ClassNameProps } from '../../types/component';
import { Column, Data } from './index';
import Cell from './Cell';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: theme.spacing(0, 1),
    '&:hover': {
      backgroundColor: `${theme.palette.action.hover} !important`,
    },
  },
  selected: {
    backgroundColor: `${theme.palette.action.active} !important`,
    '&:hover': {
      backgroundColor: `${theme.palette.action.hover} !important`,
    },
  },
  odd: {
    backgroundColor: `${theme.palette.surface[3]} !important`,
  },
  pointer: {
    cursor: 'pointer',
  },
}));

type Props = ClassNameProps & ComponentProps<typeof TableRow> & {
    testId?: string,
    index: number,
    isSelected?: boolean,
    rowStyle?: CSSProperties,
    data: Data[],
    initialColumns: Column[],
    onRowClick?: (data: Data, index: number) => void,
    isNoRowStyle?: boolean,
};

const Row: Component<Props> = ({
  testId,
  initialColumns,
  data,
  index,
  rowStyle,
  onRowClick = undefined,
  isSelected = false,
  isNoRowStyle = false,
}) => {
  const classes = useStyles();

  return (
    <TableRow
      data-testid={testId}
      hover
      component="div"
      onClick={!isSelected && onRowClick ? () => onRowClick(data[index], index) : undefined}
      role="checkbox"
      aria-checked={isSelected}
      selected={isSelected}
      tabIndex={-1}
      classes={{
        root: clsx({
          [classes.root]: true,
          [classes.pointer]: !!onRowClick,
        }),
        selected: classes.selected,
      }}
      className={clsx({ [classes.odd]: !!(index % 2) && !isNoRowStyle })}
      style={rowStyle}
    >
      {initialColumns.map((column) => (
        <Cell
          key={column.id}
          column={column}
          data={data}
          index={index}
        />
      ))}
    </TableRow>
  );
};

export default Row;
