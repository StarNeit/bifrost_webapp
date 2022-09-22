import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { memo } from 'react';
import { Cell } from 'react-table';

import { Body } from '../../../components/Typography';
import { Component } from '../../../types/component';
import { useDefaultPrecision } from '../../../utils/utils';
import { TotalRowData } from '../../../widgets/RecipeDisplay/RecipeDisplayTable';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    flex: '1',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cellValue: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

type Props = {
  value?: number;
  shouldRound?: boolean;
  cell?: Cell<TotalRowData>;
  dataTestId?: string;
};

const NumberCell: Component<Props> = ({
  shouldRound = true, value, cell, dataTestId,
}) => {
  const classes = useStyles();
  const { round, toString } = useDefaultPrecision();

  if (value === undefined) return null;

  return (
    <Body data-testid={dataTestId ?? cell?.column.id} className={clsx(classes.root)}>
      <span className={classes.cellValue}>
        {shouldRound ? round(value, toString) : value}
      </span>
    </Body>
  );
};

export default memo(NumberCell, (prev, next) => prev.value === next.value);
