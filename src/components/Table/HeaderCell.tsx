import { ComponentProps } from 'react';
import { makeStyles, TableSortLabel, Tooltip } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import clsx from 'clsx';
import { Component, ClassNameProps } from '../../types/component';
import { Column } from './index';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    fontSize: '0.75rem',
    fontWeight: 500,
    textAlign: 'left',
    verticalAlign: 'inherit',
    minWidth: 0,
    flexBasis: 0,
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  headerButton: {
    overflow: 'hidden',
  },
  headerText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.text.secondary,
  },
  disabledSort: {
    cursor: 'auto',
  },
  icon: {
    fontSize: theme.spacing(1.8),
    margin: 0,
  },
}));

type Props = ClassNameProps & ComponentProps<typeof TableSortLabel> & {
  dataTestId?: string;
  sortBy?: (arg: string) => void,
  sortedBy?: string,
  sortOrder?: 'desc' | 'asc',
  ignoreCustomWidth?: boolean,
  column: Column,
};

const HeaderCell: Component<Props> = ({
  dataTestId,
  column,
  className,
  sortBy,
  sortedBy,
  sortOrder = 'desc',
  ignoreCustomWidth = false,
}) => {
  const classes = useStyles();

  const onClick = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    if (!column.sortFunction || !sortBy) {
      return;
    }
    sortBy(column.id);
  };

  return (
    <div
      className={clsx(classes.root, className)}
      style={ignoreCustomWidth
        ? undefined
        : { minWidth: column.minWidth, flexGrow: column.flexGrow, ...column.inlineStyle }}
    >
      <Tooltip
        title={column.sortFunction ? 'Sort' : ''}
        placement="bottom-start"
        enterDelay={300}
      >
        <TableSortLabel
          active={sortedBy === column.id}
          hideSortIcon={!column.sortFunction}
          direction={sortOrder}
          onClick={onClick}
          className={clsx({
            [classes.headerButton]: true,
            [classes.disabledSort]: !column.sortFunction,
          })}
          classes={{
            icon: classes.icon,
          }}
          IconComponent={KeyboardArrowDownIcon}
        >
          <span data-testid={dataTestId} className={classes.headerText}>
            {column.headerText}
          </span>
        </TableSortLabel>
      </Tooltip>
    </div>
  );
};

export default HeaderCell;
