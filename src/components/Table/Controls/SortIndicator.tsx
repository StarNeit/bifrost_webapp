import { makeStyles } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { Component } from '../../../types/component';
import { Sort } from '../types';

type Props = {
  sort: Sort;
  hideIndicator?: boolean;
}

const useStyles = makeStyles((theme) => ({
  icon: {
    width: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

const SortIndicator: Component<Props> = ({ sort, hideIndicator }) => {
  const classes = useStyles();

  if (hideIndicator) return null;

  if (sort === 'asc') {
    return <KeyboardArrowDownIcon data-sortedby="asc" className={classes.icon} />;
  }
  if (sort === 'desc') {
    return <KeyboardArrowUpIcon data-sortedby="desc" className={classes.icon} />;
  }

  return <span data-sortedby="default" className={classes.icon} />;
};

export default SortIndicator;
