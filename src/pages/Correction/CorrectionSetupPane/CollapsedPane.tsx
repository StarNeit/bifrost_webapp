import { makeStyles } from '@material-ui/core/styles';
import { Assortment } from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';

import { Component } from '../../../types/component';
import { Body, Tiny } from '../../../components/Typography';
import { getCalibrationEngineClass } from '../../../utils/utils';
import config from '../../../config';
import { getRecipeOutputModeLabel } from '../../common/utilsFormulation';
import { RecipeOutputMode } from '../../../types/recipe';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1.75, 0.5, 0.5, 0.5),
  },
  row: {
    paddingBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
  title: {
    marginBottom: theme.spacing(0.5),
  },
  value: {
    paddingLeft: theme.spacing(1.5),
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  components: {
    paddingLeft: theme.spacing(4.125),
  },
}));

type Props = {
  assortment?: Assortment,
  calibrationConditionId?: string,
  recipeOutputMode: RecipeOutputMode,
  maxAddPercent: number,
}

const CollapsedPane: Component<Props> = ({
  assortment,
  calibrationConditionId,
  recipeOutputMode,
  maxAddPercent,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const assortmentType = assortment?.subIndustry ? `${assortment?.industry} (${assortment?.subIndustry})` : assortment?.industry;

  const calibrationCondition = assortment?.calibrationConditions.find(
    ({ id }) => id === calibrationConditionId,
  );
  const engineClass = getCalibrationEngineClass(calibrationCondition);

  const isIFS = (engineClass === config.ENGINE_IFS);

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Body className={classes.title}>{t('labels.assortment')}</Body>
        <Tiny className={classes.value}>{assortment?.name}</Tiny>
        <Tiny className={classes.value}>{assortmentType}</Tiny>
      </div>

      {isIFS && assortment && (
        <>
          <div className={classes.row}>
            <Body>{t('labels.recipeOutput')}</Body>
            <Tiny className={classes.value}>
              {t(getRecipeOutputModeLabel(recipeOutputMode, assortment.industry))}
            </Tiny>
          </div>
        </>
      )}

      <>
        <div className={classes.row}>
          <Body>{t('labels.components')}</Body>
          <div className={classes.components} />
        </div>

        <div className={classes.row}>
          <Body>{t('labels.maxAdd')}</Body>
          <Tiny className={classes.value}>{maxAddPercent}</Tiny>
        </div>
      </>

    </div>
  );
};

export default CollapsedPane;
