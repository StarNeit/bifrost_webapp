import {
  useCallback,
  useEffect,
  useState,
  CSSProperties,
} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

import { Component, ClassNameProps } from '../../types/component';
import HeaderCell from './HeaderCell';
import MobileRow from './MobileRow';
import Filter from './Filter';
import Row from './Row';
import { makeShortName } from '../../../cypress/support/util/selectors';

const useStyles = makeStyles((theme) => ({
  table: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  header: {
    height: 'auto',
    flexShrink: 0,
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.4, 0.5),
  },
  filterContainer: {
    padding: theme.spacing(1),
  },
  body: {
    height: '100%',
    overflow: 'auto',
  },
}));

type Values = string | number | boolean | unknown[];

export type Data<T=Values> = Record<string, T>;

export interface Column {
  id: string,
  headerText: string,
  accessor?: <T>(rowData: T, index: number, data: Data[]) => T,
  minWidth?: number,
  flexGrow?: number,
  secondaryCellStyle?: boolean,
  inlineStyle?: CSSProperties,
  cellComponent?: Component,
  sortFunction?: <T>(a: T, b: T) => number,
}

type Props = ClassNameProps & {
  testId?: string,
  initialColumns: Column[],
  data: Data[],
  selectedRowId?: string,
  onRowClick?: (data: Data, index: number) => void,
  filterFunction?: <T>(rowData: T, filterText: string) => T,
  mobileColumns?: string[],
  condensed?: boolean,
  staticColumns?: Column[],
  initialSortOrder?: 'desc' | 'asc',
  initialSortBy?: string,
  rowStyle?: CSSProperties,
  isNoRowStyle?: boolean,
}

const Table: Component<Props> = ({
  testId,
  data,
  selectedRowId,
  onRowClick,
  filterFunction,
  condensed = false,
  staticColumns,
  className,
  initialColumns,
  initialSortOrder = 'desc',
  initialSortBy,
  rowStyle,
  isNoRowStyle = true,
}) => {
  const classes = useStyles();
  const [filterText, setFilterText] = useState('');
  const [sortedBy, setSortedBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [columns, setColumns] = useState(initialColumns);
  const [sortedData, setSortedData] = useState(data);

  useEffect(() => {
    const newColumnsData = staticColumns ? [...staticColumns, ...columns] : columns;
    setColumns(newColumnsData);
  }, [staticColumns, initialColumns, data]);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const sortData = useCallback((
    sortColumn: Column,
  ) => {
    const filteredData = filterFunction
      ? sortedData.filter((rowData) => filterFunction(rowData, filterText))
      : sortedData;

    if (!sortColumn?.sortFunction) {
      return filteredData;
    }
    const { sortFunction } = sortColumn;

    const ascending = sortOrder === 'asc';
    const sign = ascending ? 1 : -1;
    return filteredData.slice().sort((a, b) => {
      return sign * sortFunction(a, b);
    });
  }, [sortedData, sortOrder]);

  const sortBy = (inputSortBy: string) => {
    const newSortedBy = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortedBy);
    setSortedBy(inputSortBy);
  };

  const filterBy = (inputFilterText: string) => {
    setFilterText(inputFilterText.toLowerCase());
  };

  useEffect(() => {
    const allColumns = staticColumns ? [...staticColumns, ...columns] : columns;
    const sortColumn = allColumns.find((c) => c.id === sortedBy);
    if (sortColumn) {
      const newSortedData = sortData(sortColumn);
      setSortedData([...newSortedData]);
    }
  }, [data, filterText, filterFunction, initialColumns, sortedBy, sortOrder]);

  return (
    <div data-testid={testId} className={clsx(classes.table, className)}>
      <Filter
        filterFunction={filterFunction}
        filterBy={filterBy}
        filterText={filterText}
      />
      <div className={classes.header}>
        {condensed
          ? (staticColumns && staticColumns.map((column) => (
            <HeaderCell
              dataTestId={`${makeShortName(testId)}-header-${column.headerText.toLocaleLowerCase()}`}
              key={column.id}
              column={column}
              sortBy={sortBy}
              sortedBy={sortedBy}
              sortOrder={sortOrder}
            />
          ))
          )
          : (columns.map((column) => (
            <HeaderCell
              dataTestId={`${makeShortName(testId)}-header-${column.headerText.toLocaleLowerCase()}`}
              key={column.id}
              column={column}
              sortBy={sortBy}
              sortedBy={sortedBy}
              sortOrder={sortOrder}
            />
          ))
          )}
      </div>
      <div data-testid={`${testId}-rows`} className={classes.body}>
        {condensed
          ? (sortedData.map((rowData, index) => (
            <MobileRow
              key={rowData.id as string}
              staticColumns={staticColumns}
              initialColumns={columns}
              data={sortedData}
              index={index}
              onRowClick={onRowClick}
              isSelected={rowData.id === selectedRowId}
              sortBy={sortBy}
              sortedBy={sortedBy}
              sortOrder={sortOrder}
            />
          ))
          )
          : (sortedData.map((rowData, index) => (
            <Row
              key={(rowData.id as string) || index}
              index={index}
              testId={`${testId}-row-${index}`}
              initialColumns={columns}
              data={sortedData}
              onRowClick={onRowClick}
              rowStyle={rowStyle}
              isSelected={rowData.id === selectedRowId}
              isNoRowStyle={isNoRowStyle}
            />
          ))
          )}
      </div>
    </div>
  );
};

export default Table;
