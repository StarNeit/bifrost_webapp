import clsx from 'clsx';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';

import { ClassNameProps, Component } from '../../types/component';
import { ReflectanceCondition } from '../../types/layout';
import { makeSafeSelector } from '../../utils/test-utils';

const labels = {
  [ReflectanceCondition.R]: 'R',
  [ReflectanceCondition.DeltaR]: 'ΔR',
  [ReflectanceCondition.KS]: 'K/S',
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: theme.spacing(0.25),
    backgroundColor: theme.palette.surface[2],
    maxWidth: 360,
    height: theme.spacing(4),
  },
  chipRoot: {
    marginRight: theme.spacing(0.25),
    backgroundColor: 'transparent',
    color: theme.palette.text.disabled,
    fontSize: theme.spacing(1.5),
    borderRadius: theme.spacing(0.5),
    height: 'unset',

    '&:focus': {
      backgroundColor: theme.palette.action.active,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.active,
    },
  },
  chipLabel: {
    padding: theme.spacing(0.75),
    color: 'inherit',
  },
  selected: {
    backgroundColor: theme.palette.action.active,
    color: theme.palette.primary.main,
  },
}));

type Props = ClassNameProps & {
  dataTestId?: string;
  isMulti: boolean;
  allowMultiSingleSample?: boolean,
  values: ReflectanceCondition[];
  options: ReflectanceCondition[];
  onChange(values: ReflectanceCondition[]): void;
};

const ReflectanceConditionControls: Component<Props> = ({
  dataTestId,
  className,
  isMulti,
  allowMultiSingleSample,
  options,
  onChange,
  values,
}) => {
  const classes = useStyles();

  const handleChip = (key: ReflectanceCondition): void => {
    if (values?.includes(key)) {
      return onChange(values.filter((item) => item !== key));
    }
    if (allowMultiSingleSample) {
      return onChange([...values, key]);
    }
    return onChange(isMulti ? [...values, key] : [key]);
  };

  return (
    <Paper
      data-testid={dataTestId}
      className={clsx(classes.root, className)}
    >
      {options?.map((data) => (
        <Chip
          data-testid={`${dataTestId}-${makeSafeSelector(labels[data])}`}
          data-test-is-selected={values?.includes(data)}
          key={data}
          label={labels[data]}
          classes={{
            root: classes.chipRoot,
            label: classes.chipLabel,
          }}
          className={values?.includes(data) ? classes.selected : ''}
          onClick={() => handleChip(data)}
        />
      ))}
    </Paper>
  );
};

export default ReflectanceConditionControls;
