import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
} from 'react-table';
import {
  CircularProgress,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  withStyles,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import InputField from './InputField';
import { Body } from './Typography';

const Cell = withStyles((theme) => ({
  root: {
    backgroundColor: 'transparent',
  },
  head: {
    padding: theme.spacing(0.875, 1.5),
    fontSize: theme.spacing(1.5),
    color: theme.palette.text.secondary,
  },
  body: {
    padding: theme.spacing(1.5, 1.5),
    color: theme.palette.text.primary,
  },
}))(TableCell);

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.surface[2],
    borderRadius: theme.spacing(0.75),
  },
  selected: {
    background: theme.palette.action.hover,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing(1.5),
  },
  search: {
    width: theme.spacing(16),
    height: theme.spacing(3),
    '& input': {
      fontSize: theme.spacing(1.5),
      height: theme.spacing(3),
      padding: theme.spacing(0, 1),
    },
  },
  icon: {
    fontSize: theme.spacing(2.25),
    marginLeft: theme.spacing(0.875),
  },
  row: {
    cursor: 'pointer',
  },
  tableHead: {
    height: theme.spacing(5.25),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  tableHeader: {
    textAlign: 'left',
    paddingLeft: theme.spacing(1.5),
    color: theme.palette.text.secondary,
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
}));

type Props<T> = {
  title: string;
  data: T[] | undefined | null;
  columns: Column[];
  onSelect?: (row: T) => void;
  loading?: boolean;
  selected?: T | T[] | ((row: T) => boolean) | null;
};

export default function SearchableTable<T>({
  title,
  columns,
  data,
  loading,
  onSelect,
  selected,
}: Props<T>) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = useTable(
    { columns, data: data ?? [] },
    useGlobalFilter,
  );

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Body>{title}</Body>
        <InputField
          className={classes.search}
          value={search}
          onChange={(value) => {
            setSearch(value);
            onChange(value);
          }}
          startAdornment={<SearchIcon className={classes.icon} />}
          placeholder={`${t('labels.search')}...`}
        />
      </div>
      <Table {...getTableProps()}>
        <TableHead className={classes.tableHead}>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell
                  className={classes.tableHeader}
                  {...column.getHeaderProps({
                    style: {
                      minWidth: column.minWidth,
                      width: column.width,
                      maxWidth: column.maxWidth,
                    },
                  })}
                >
                  {column.render('Header')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {!loading && data && (
            rows.map((row) => {
              prepareRow(row);
              const isSelected = Array.isArray(selected)
                ? selected?.includes(row.original as T)
                : (selected as ((row: T) => boolean))?.(row.original as T)
                || selected === row.original;
              return (
                <TableRow
                  {...row.getRowProps()}
                  onClick={() => onSelect?.(row.original as T)}
                  hover
                  className={clsx(
                    classes.row,
                    {
                      [classes.selected]: isSelected,
                    },
                  )}
                >
                  {
                    row.cells.map((cell) => {
                      return (
                        <Cell {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </Cell>
                      );
                    })
                  }
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {loading && (
        <div className={classes.spinner}>
          <CircularProgress variant="indeterminate" />
        </div>
      )}
    </div>
  );
}
