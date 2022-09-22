import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import {
  makeStyles, withStyles,
} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@material-ui/core';

import Action from './Action';
import InputField from '../../../components/InputField';
import { Body } from '../../../components/Typography';
import CreatingTool from './CreatingTool';
import { isNumericValue } from '../../../utils/utilsTable';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'transparent',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(0.75),
  },
  headerTool: {
    display: 'flex',
    alignItems: 'center',
  },
  createBtn: {
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.spacing(1.5),
    marginRight: theme.spacing(2.5),
    '& svg': {
      fontSize: theme.spacing(2),
      marginLeft: theme.spacing(1),
    },
  },
  title: {
    flexGrow: 1,
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
  tool: {
    borderBottom: '1px solid rgba(81, 81, 81, 1)',
    padding: theme.spacing(1.375),
  },
  tableRow: {
    cursor: 'pointer',
  },
  selectedRow: {
    backgroundColor: theme.palette.action.active,
  },
  numericCell: {
    textAlign: 'right',
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
}));

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

type Row = {
  id: string,
  name: string,
  size?: number,
};
export interface Column {
  field: keyof Row,
  label: string,
  size?: number,
}

type SelectProps<T> = {
  type: 'select',
  onCreate: (value: T) => void,
  options: T[] | undefined,
  label: ((element: T | undefined) => string),
}

type TextProps = {
  type: 'text',
  onCreate: (value: string) => void,
}

type BaseProps = {
  title: string,
  columns: Column[],
  data: Row[],
  confirmMessage: string,
  onDelete: (id: string) => void,
  isFetching?: boolean,
  isShowCreateUser?: boolean,
  selectGroup?: (id: string | number) => void,
  selectedId?: string,
}

type CreatingToolProps<T> = (TextProps | SelectProps<T>);

type Props<T> = CreatingToolProps<T> & BaseProps;

const UserTable = <T extends { id: string }>({
  title,
  columns,
  data,
  confirmMessage,
  onDelete,
  isFetching,
  isShowCreateUser,
  selectGroup,
  selectedId,
  ...creatingToolProps
}: Props<T>) => {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [isCreatable, setIsCreatable] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isCreatable && !isFetching) setIsCreatable(false);
  }, [isFetching]);

  const filteredData = useMemo(
    () => {
      const filterString = search.toLowerCase();
      return data.filter((entry) => {
        const dataValues = Object.values(entry);
        return dataValues.some((value) => `${value}`.toLowerCase().includes(filterString));
      });
    },
    [search, data],
  );

  const handleCreatable = (status: boolean) => {
    setIsCreatable(status);
  };

  return (
    <TableContainer
      className={classes.root}
      component={Paper}
    >
      <div className={classes.header}>
        <Body className={classes.title}>{title}</Body>
        <div className={classes.headerTool}>
          {isShowCreateUser && (
            <Body className={classes.createBtn}>
              {t('labels.createUser')}
              <OpenInNewIcon />
            </Body>
          )}
          <InputField
            className={classes.search}
            value={search}
            onChange={setSearch}
            startAdornment={<SearchIcon className={classes.icon} />}
            placeholder={`${t('labels.search')}...`}
          />
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <Cell
                key={column.field}
                className={clsx({
                  [classes.numericCell]: isNumericValue(data?.[0]?.[column.field]),
                })}
              >
                {column.label}
              </Cell>
            ))}
            <Cell>Action</Cell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!isFetching && filteredData.map((item) => (
            <TableRow
              hover
              key={item.id}
              className={clsx(classes.tableRow, {
                [classes.selectedRow]: item.id === selectedId,
              })}
              classes={{ selected: classes.selectedRow }}
              onClick={() => selectGroup?.(item.id)}
            >
              {columns.map((column) => (
                <Cell
                  key={column.field}
                  className={clsx({
                    [classes.numericCell]: isNumericValue(item[column.field]),
                  })}
                  style={{ width: column.size }}
                >
                  {item[column.field]}
                </Cell>
              ))}
              <Cell>
                <Action
                  message={confirmMessage}
                  onConfirm={() => onDelete(item.id as string)}
                />
              </Cell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isFetching && (
        <div className={classes.spinner}>
          <CircularProgress variant="indeterminate" />
        </div>
      )}
      <div className={classes.tool}>
        {creatingToolProps.type === 'select' ? (
          <CreatingTool<T>
            type={creatingToolProps.type}
            onCheck={creatingToolProps.onCreate}
            options={creatingToolProps.options}
            label={creatingToolProps.label}
            placeholder={`${t('labels.groupName')}...`}
            isFetching={isFetching}
            isEditable={isCreatable}
            onSetEditable={handleCreatable}
          />
        ) : (
          <CreatingTool<T>
            type={creatingToolProps.type}
            onCheck={creatingToolProps.onCreate}
            placeholder={`${t('labels.groupName')}...`}
            isFetching={isFetching}
            isEditable={isCreatable}
            onSetEditable={handleCreatable}
          />
        )}
      </div>
    </TableContainer>
  );
};

export default UserTable;
