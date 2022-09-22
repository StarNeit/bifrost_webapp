import clsx from 'clsx';
import { memo } from 'react';
import {
  makeStyles,
  TableBody,
  TableCell,
  TableRow,
} from '@material-ui/core';
import {
  Row,
  TableBodyPropGetter,
  TableBodyProps,
} from 'react-table';

import { TableData } from '.';
import { isNumericValue } from '../../utils/utilsTable';
import { getRowTestIds } from '../../utils/test-utils';

type MemoizedBodyProps = {
  getTableBodyProps: (propGetter?: TableBodyPropGetter<TableData> | undefined) => TableBodyProps;
  rows: Row<TableData>[];
  collapsedRowsRef: React.MutableRefObject<Set<string>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareRow: any;
  isResizing: boolean;
}

const useStyles = makeStyles((theme) => ({
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
}));

const MemoizedTableBody: React.FC<MemoizedBodyProps> = ({
  getTableBodyProps,
  rows,
  collapsedRowsRef,
  prepareRow,
}) => {
  const classes = useStyles();
  const parentRows: Row<TableData>[] = rows.filter((row) => row.depth === 0);

  return (
    <TableBody {...getTableBodyProps()}>
      {rows.map((row) => {
        prepareRow(row);

        if (row.isExpanded === true) {
          collapsedRowsRef.current.delete(row.id);
        } else {
          collapsedRowsRef.current.add(row.id);
        }

        return (
          <TableRow
            data-testid={getRowTestIds(row, parentRows)}
            {...row.getRowProps()}
          >
            {row.cells.map((cell) => (
              <TableCell
                data-testid={`cell-${cell.column.id.toString().toLowerCase()}`}
                className={clsx(classes.cell, {
                  [classes.numericCell]: isNumericValue(cell.value),
                })}
                {...cell.getCellProps()}
              >
                {cell.render('Cell')}
              </TableCell>
            ))}
          </TableRow>
        );
      })}

    </TableBody>
  );
};

export default memo(MemoizedTableBody, (_, nextProps) => {
  return nextProps.isResizing;
});
