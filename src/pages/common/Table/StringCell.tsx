import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Cell } from 'react-table';

import { Body } from '../../../components/Typography';
import { Component } from '../../../types/component';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  cellValue: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

type Props = {
  value?: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell?: Cell<any>;
  dataTestId?: string;
};

const StringCell: Component<Props> = ({
  className, value, cell, dataTestId,
}) => {
  const classes = useStyles();

  if (value === undefined) return null;

  return (
    <Body data-testid={dataTestId ?? cell?.column.id} className={clsx(classes.root, className)}>
      <span className={classes.cellValue}>
        {value}
      </span>
    </Body>
  );
};

export default StringCell;
