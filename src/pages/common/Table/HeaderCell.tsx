import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { Body } from '../../../components/Typography';
import { Component } from '../../../types/component';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  numericCell: {
    textAlign: 'right',
    flex: 1,
  },
}));

type Props = {
  value: string,
  isNumeric?: boolean,
  className?: string,
};

const HeaderCell: Component<Props> = ({ value, isNumeric, className }) => {
  const classes = useStyles();

  return (
    <Body className={clsx(classes.root, className, {
      [classes.numericCell]: isNumeric,
    })}
    >
      {value}
    </Body>
  );
};

export const renderHeaderCell = (label: string, isNumeric = false, className?: string) => (
  <HeaderCell value={label} isNumeric={isNumeric} className={className} />
);

export const getTableHeaderMenuProperties = (
  label: string,
  isNumeric = false,
  className?: string,
) => (
  {
    Header: () => renderHeaderCell(label, isNumeric, className),
    headerMenuValue: label,
  }
);

export default HeaderCell;
