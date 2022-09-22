import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';

import { Component } from '../../types/component';
import FormulaIcon from '../../assets/FormulaIcon';
import CorrectionIcon from '../../assets/CorrectionIcon';
import { Body } from '../../components/Typography';
import { ResultType } from '../../data/reducers/formulation';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    height: '100%',
  },
  icon: {
    fontSize: '1.3rem',
  },
}));

type SvgIcon = typeof FormulaIcon | typeof SearchIcon;

type Props = {
  value: ResultType | undefined;
}

const TypeCell: Component<Props> = ({
  value,
}) => {
  const classes = useStyles();

  let Icon: SvgIcon | undefined;
  switch (value) {
    case 'formulation':
      Icon = FormulaIcon;
      break;

    case 'correction':
      Icon = CorrectionIcon;
      break;

    case 'search':
      Icon = SearchIcon;
      break;

    default:
      Icon = undefined;
      break;
  }

  return (
    <Body data-testid="type" className={classes.root}>
      {Icon && <Icon className={classes.icon} />}
    </Body>
  );
};

export default TypeCell;
