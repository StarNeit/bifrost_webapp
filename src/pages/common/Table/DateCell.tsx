import { makeStyles } from '@material-ui/core';
import { Timestamp, toDate } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';

import { Body } from '../../../components/Typography';
import { getDateDisplayString } from '../../../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  cellValue: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

function DateCell<T extends {value?: Timestamp}>({ value }: T) {
  const classes = useStyles();

  if (!value) return null;

  const dateValue = getDateDisplayString(toDate(value));

  return (
    <Body className={clsx(classes.root)}>
      <span className={classes.cellValue}>
        {dateValue}
      </span>
    </Body>
  );
}

export default DateCell;
