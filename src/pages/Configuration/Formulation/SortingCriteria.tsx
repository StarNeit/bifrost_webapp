import { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import AddIcon from '@material-ui/icons/Add';

import CriterionItem from './CriterionItem';
import { Body, Caption } from '../../../components/Typography';
import IconSquareButton from '../../../components/IconSquareButton';
import Button from '../../../components/Button';
import { Component } from '../../../types/component';
import { SortingCriterion, SortingCriterionColumn } from '../../../data/api/uss/formulation/types';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  row: {
    display: 'flex',
    marginBottom: theme.spacing(3.25),
  },
  criterion: {
    maxWidth: theme.spacing(55.75),
    width: '100%',
    marginTop: theme.spacing(2.75),
  },
  label: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  },
  addBtn: {
    padding: theme.spacing(1.25, 1.5),
  },
  submitWrapper: {
    marginTop: theme.spacing(2.75),
  },
  submit: {
    border: `1px solid ${theme.palette.surface[4]}`,
    textTransform: 'capitalize',
    padding: theme.spacing(1.125, 2.625),
    fontWeight: 'normal',
  },
}));

type Props = {
  criteria?: SortingCriterion[],
  saveCriteria: (criteria: SortingCriterion[]) => void,
  isLoading: boolean,
}

const SortingCriteria: Component<Props> = ({
  criteria: savedCriteria,
  saveCriteria,
  isLoading,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [criteria, setCriteria] = useState<SortingCriterion[]>([]);

  const updateCriterion = (index: number, criterion: SortingCriterion) => {
    const newCriteria = criteria.map((c, i) => (i === index ? criterion : c));
    setCriteria(newCriteria);
  };

  const deleteCriterion = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
  };

  const addCriterion = () => {
    const newCriterion = { column: SortingCriterionColumn.Score, weight: 0 };
    const newCriteria = [...criteria, newCriterion];
    setCriteria(newCriteria);
  };

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

  useEffect(() => {
    if (savedCriteria) setCriteria(savedCriteria);
  }, [savedCriteria]);

  const preview: string = useMemo(() => {
    return criteria.map((item) => (`${getColumnLabel(item.column)} * ${item.weight}`)).join(' + ');
  }, [criteria]);

  return (
    <div className={classes.root}>
      <Caption>{t('labels.customSorting')}</Caption>
      <Body className={classes.label}>{`${t('labels.formula')}:`}</Body>
      <Body>
        {preview}
      </Body>

      <div className={classes.criterion}>
        {criteria.map((criterion, index) => (
          <CriterionItem
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            criterion={criterion}
            onChange={(c) => updateCriterion(index, c)}
            onDelete={() => deleteCriterion(index)}
            disabled={isLoading}
          />
        ))}
      </div>

      <IconSquareButton
        className={classes.addBtn}
        icon={AddIcon}
        onClick={addCriterion}
        disabled={isLoading}
      />

      <div className={classes.submitWrapper}>
        <Button
          size="small"
          className={classes.submit}
          type="submit"
          variant="primary"
          onClick={() => saveCriteria(criteria)}
          disabled={savedCriteria === criteria}
          showSpinner={isLoading}
        >
          {t('labels.saveChanges')}
        </Button>
      </div>
    </div>
  );
};

export default SortingCriteria;
