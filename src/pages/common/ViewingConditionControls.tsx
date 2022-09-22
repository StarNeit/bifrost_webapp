import clsx from 'clsx';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';

import { ClassNameProps, Component } from '../../types/component';
import { ViewingCondition } from '../../types/layout';
import { getViewingConditionLabel } from '../../utils/utils';
import { makeSafeSelector } from '../../utils/test-utils';

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
  values: ViewingCondition[];
  options: ViewingCondition[];
  onChange(values: ViewingCondition[]): void;
};

const isSameViewingCondition = (
  c1: ViewingCondition,
  c2: ViewingCondition,
) => (c1.illuminant === c2.illuminant) && (c1.observer === c2.observer);

const ViewingConditionControls: Component<Props> = ({
  dataTestId,
  className,
  isMulti,
  allowMultiSingleSample,
  options,
  onChange,
  values,
}) => {
  const classes = useStyles();

  const handleChip = (key: ViewingCondition) => {
    if (values.some((item) => isSameViewingCondition(item, key))) {
      onChange(values.filter((item) => !isSameViewingCondition(item, key)));
    } else if (allowMultiSingleSample) {
      onChange([...values, key]);
    } else {
      onChange(isMulti ? [...values, key] : [key]);
    }
  };

  return (
    <Paper
      data-testid={dataTestId}
      className={clsx(classes.root, className)}
    >
      {options?.map((data) => {
        const label = getViewingConditionLabel(data);
        const isSelected = values.some((item) => isSameViewingCondition(item, data));
        return (
          <Chip
            key={label}
            data-testid={`${dataTestId}-${makeSafeSelector(label)}`}
            data-test-is-selected={isSelected.toString()}
            label={label}
            classes={{
              root: classes.chipRoot,
              label: classes.chipLabel,
            }}
            className={isSelected ? classes.selected : ''}
            onClick={() => handleChip(data)}
          />
        );
      })}
    </Paper>
  );
};

export default ViewingConditionControls;
