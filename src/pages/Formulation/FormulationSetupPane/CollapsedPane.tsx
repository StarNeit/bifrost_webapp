import { makeStyles } from '@material-ui/core/styles';
import {
  Assortment,
  SubIndustry,
  Substrate,
} from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';

import {
  OpacityMode,
  ThicknessOption,
  CombinatorialMode,
  FormulationComponent,
  SearchAndCorrectMode,
} from '../../../types/formulation';
import { Component } from '../../../types/component';
import { Body, Tiny } from '../../../components/Typography';
import { getCalibrationEngineClass, getCSSColorString, useDefaultPrecision } from '../../../utils/utils';
import config from '../../../config';
import { getOpacityModeLabel, getRecipeOutputModeLabel } from '../../common/utilsFormulation';
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
  colorSquare: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
}));

type Props = {
  assortment?: Assortment,
  calibrationConditionId?: string,
  substrate?: Substrate,
  recipeOutputMode: RecipeOutputMode,
  selectedClear?: FormulationComponent,
  components?: FormulationComponent[],
  selectedComponentIds: string[],
  opacityMode: OpacityMode,
  opacityMinPercent: number;
  opacityMaxPercent: number;
  thicknessSelection: ThicknessOption,
  minThicknessPercent: number;
  maxThicknessPercent: number;
  combinatorialMode: CombinatorialMode,
  searchAndCorrected: SearchAndCorrectMode[],
}

const CollapsedPane: Component<Props> = ({
  assortment,
  calibrationConditionId,
  substrate,
  recipeOutputMode,
  selectedClear,
  opacityMode,
  minThicknessPercent,
  maxThicknessPercent,
  combinatorialMode,
  searchAndCorrected,
  components,
  selectedComponentIds,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { round } = useDefaultPrecision();

  const assortmentType = assortment?.subIndustry ? `${assortment?.industry} (${assortment?.subIndustry})` : assortment?.industry;

  const calibrationCondition = assortment?.calibrationConditions.find(
    ({ id }) => id === calibrationConditionId,
  );
  const engineClass = getCalibrationEngineClass(calibrationCondition);

  const isIFS = (engineClass === config.ENGINE_IFS);
  // const isEFX = (engineClass === config.ENGINE_EFX);
  const isCurrentlyHidden = false;
  const canUseViscosity = (isIFS && assortment?.subIndustry === SubIndustry.Flexo);

  const selectedComponents = components?.filter(
    ({ id }) => selectedComponentIds.includes(id),
  ) || [];
  const rgbByIndex = selectedComponents.map(({ previewColor }) => previewColor);

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Body className={classes.title}>{t('labels.assortment')}</Body>
        <Tiny className={classes.value}>{assortment?.name}</Tiny>
        <Tiny className={classes.value}>{assortmentType}</Tiny>
      </div>

      <div className={classes.row}>
        <Body>{t('labels.substrate')}</Body>
        <Tiny className={classes.value}>{substrate?.name}</Tiny>
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

      {assortment && (
        <>
          <div className={classes.row}>
            <Body>{t('labels.clear')}</Body>
            <Tiny className={classes.value}>{selectedClear?.name}</Tiny>
          </div>

          <div className={classes.row}>
            <Body>{t('labels.components')}</Body>
            <div className={classes.components}>
              {
                selectedComponents?.map((colorant, index) => (
                  <div
                    key={colorant.id}
                    className={classes.colorSquare}
                    style={{ backgroundColor: getCSSColorString(rgbByIndex[index]) }}
                  >
                    <Tiny>{colorant.name}</Tiny>
                  </div>
                ))
              }
            </div>
          </div>
          <div className={classes.row}>
            <Body>{t('labels.filmThickness')}</Body>
            <Tiny className={classes.value}>{`${t('labels.min')}: ${round(minThicknessPercent)} %`}</Tiny>
            <Tiny className={classes.value}>{`${t('labels.max')}: ${round(maxThicknessPercent)} %`}</Tiny>
          </div>
          {isIFS && (
            <>
              <div className={classes.row}>
                <Body>{t('labels.opacityControl')}</Body>
                <Tiny className={classes.value}>{t(getOpacityModeLabel(opacityMode))}</Tiny>
              </div>
              <div className={classes.row}>
                <Body>{t('labels.searchAndCorrected')}</Body>
                {searchAndCorrected.map((mode) => (
                  <Tiny className={classes.value}>{t(`labels.${mode}`)}</Tiny>
                ))}
              </div>
            </>
          )}
          {canUseViscosity && (
            <>
              <div className={classes.row}>
                <Body>{t('labels.viscosity')}</Body>
                <Tiny className={classes.value}>50%</Tiny>
              </div>
              <div className={classes.row}>
                <Body>{t('labels.calculationOptions')}</Body>
                <Tiny className={classes.value}>{combinatorialMode}</Tiny>
              </div>
            </>
          )}
        </>
      )}

      {isCurrentlyHidden && (
        <>
          <div className={classes.row}>
            <Body>{t('labels.calculationOptions')}</Body>
            <Tiny className={classes.value}>
              {searchAndCorrected
                ? t('labels.enabled')
                : t('labels.disabled')}
            </Tiny>
          </div>
        </>
      )}
    </div>
  );
};

export default CollapsedPane;
