import { makeStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useTranslation } from 'react-i18next';
import Select from '../../../components/Select';
import ValidationInput from '../../../components/ValidationInput';
import IconSquareButton from '../../../components/IconSquareButton';
import { Component } from '../../../types/component';
import { SortingCriterion, SortingCriterionColumn } from '../../../data/api/uss/formulation/types';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing(1.5),
  },
  select: {
    flexGrow: 1,
    marginRight: theme.spacing(1.5),
  },
  weight: {
    width: theme.spacing(10),
    marginRight: theme.spacing(1.5),
  },
  delete: {
    backgroundColor: theme.palette.surface[1],
    padding: theme.spacing(1.2, 1.5),
  },
}));

type Props = {
  criterion: SortingCriterion,
  onChange: (criterion: SortingCriterion) => void,
  onDelete: () => void,
  disabled: boolean,
}

const options = Object.values(SortingCriterionColumn);

const CriterionItem: Component<Props> = ({
  criterion,
  onChange,
  onDelete,
  disabled,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const getColumnLabel = (column: SortingCriterionColumn) => {
    switch (column) {
      case SortingCriterionColumn.Score: return t('labels.score');
      case SortingCriterionColumn.Price: return t('labels.price');
      case SortingCriterionColumn.ComponentCount: return t('labels.numberOfComponentsHeader');
      case SortingCriterionColumn.DeltaE2000: return t('labels.dE.dE00');
      case SortingCriterionColumn.DeltaE76: return t('labels.dE.dE76');
      default: return column;
    }
  };

  const handleColumnChange = (column: SortingCriterionColumn) => {
    onChange({ ...criterion, column });
  };

  const handleWeightChange = (weight: string) => {
    onChange({ ...criterion, weight: parseFloat(weight) });
  };

  return (
    <div className={classes.root}>
      <div className={classes.select}>
        <Select
          isFullWidth
          data={options}
          isMulti={false}
          value={criterion.column}
          labelProp={getColumnLabel}
          onChange={handleColumnChange}
          disabled={disabled}
        />
      </div>
      <ValidationInput
        className={classes.weight}
        type="number"
        min={0}
        max={Number.MAX_SAFE_INTEGER}
        value={criterion.weight}
        onChange={handleWeightChange}
        disabled={disabled}
      />
      <div>
        <IconSquareButton
          className={classes.delete}
          icon={DeleteIcon}
          onClick={onDelete}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CriterionItem;
