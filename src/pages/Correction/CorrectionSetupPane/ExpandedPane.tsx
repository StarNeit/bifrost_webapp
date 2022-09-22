import { useState } from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import { Assortment, Colorant, Substrate } from '@xrite/cloud-formulation-domain-model';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { Component } from '../../../types/component';
import { FormulationComponent, ConcentrationPercentages } from '../../../types/formulation';
import { Body } from '../../../components/Typography';
import CollapseArrow from '../../../components/CollapseArrow';
import { clickable } from '../../../theme/components';
import PercentageInput from '../../../components/PercentageInput';
import ToggleableSection from '../../../components/ToggleableSection';
import { getCalibrationEngineClass } from '../../../utils/utils';
import Switch from '../../../components/Switch';
import { getRecipeOutputModeLabel } from '../../common/utilsFormulation';
import SelectFormulationComponents from '../../../components/SelectFormulationComponents';
import {
  toggleCorrectionMode as toggleCorrectionModeAction,
  toggleColorantMode as toggleColorantModeAction,
  setMaxAddPercentage as setMaxAddPercentAction,
  selectComponents as selectComponentsAction,
  setTotalMode as setTotalModeAction,
} from '../../../data/reducers/correction';
import ComponentsModal from '../../common/ComponentsModal';
import { TotalMode, RecipeOutputMode } from '../../../types/recipe';
import { storeTestData } from '../../../utils/test-utils';

const useStyles = makeStyles((theme) => ({
  label: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: theme.spacing(2),
    },
  },
  value: {
    textAlign: 'right',
  },
  w100: {
    width: '100%',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    minWidth: theme.spacing(30),
  },
  recipe: {
    paddingLeft: theme.spacing(3),
  },
  subRow: {
    paddingLeft: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    background: theme.palette.action.active,
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1),
    '& svg': {
      color: theme.palette.text.primary,
      fontSize: theme.spacing(2),
    },

    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  ...clickable(),
}));

type Props = {
  assortment?: Assortment,
  substrate?: Substrate,
  selectedClear?: FormulationComponent,
  calibrationConditionId?: string,
  isFetching: boolean,
  components?: FormulationComponent[],
  colorants?: Colorant[],
  technicalVarnishes?: FormulationComponent[],
  recipeOutputMode: RecipeOutputMode,
  totalMode: TotalMode,
  concentrationPercentages: ConcentrationPercentages;
  onChangeConcentrationPercentages: (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => void;

  requiredComponentIds: string[];
  onChangeColorantsRequired: (componentId: string, required: boolean) => void;
  onChangeCorrectionSettings: (checked: boolean) => void;
  enableTechnicalVarnishSelection?: boolean;
};

const ExpandedPane: Component<Props> = ({
  assortment,
  substrate,
  calibrationConditionId,
  selectedClear,
  components,
  colorants,
  technicalVarnishes,
  recipeOutputMode,
  isFetching,
  totalMode,
  concentrationPercentages,
  onChangeConcentrationPercentages,
  requiredComponentIds,
  onChangeColorantsRequired,
  onChangeCorrectionSettings,
  enableTechnicalVarnishSelection,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const classes = useStyles();
  const [showSettings, setShowSettings] = useState(true);
  const [showComponentsModal, setShowComponentsModal] = useState(false);

  const correctionSettings = useSelector((state) => state.correction.correctionSettings);
  const correctionMode = useSelector((state) => state.correction.correctionMode);
  const toggleCorrectionMode = () => { dispatch(toggleCorrectionModeAction()); };
  const colorantMode = useSelector((state) => state.correction.colorantMode);
  const toggleColorantMode = () => { dispatch(toggleColorantModeAction()); };
  const maxAddPercent = useSelector((state) => state.correction.maxAddPercentage);
  const setMaxAddPercent = (value: number) => { dispatch(setMaxAddPercentAction(value)); };
  const selectedComponentIds = useSelector((state) => state.correction.selectedComponentIds);
  const selectComponents = (ids: string[]) => { dispatch(selectComponentsAction(ids)); };
  const setTotalMode = (mode: TotalMode) => dispatch(setTotalModeAction(mode));

  const assortmentType = assortment?.subIndustry ? `${assortment?.industry} (${assortment?.subIndustry})` : assortment?.industry;

  const calibrationCondition = assortment?.calibrationConditions.find(
    ({ id }) => id === calibrationConditionId,
  );
  const engineClass = getCalibrationEngineClass(calibrationCondition);
  const isIFS = (engineClass === 'IFS');

  const quickSelectComponents = (newIds: string[]) => {
    const technicalVarnishIds = technicalVarnishes
      ?.filter(({ id }) => selectedComponentIds.includes(id))
      .map(({ id }) => id) || [];
    const combinedIds = [...newIds, ...technicalVarnishIds];
    selectComponents(combinedIds);
  };

  if (assortment !== undefined) {
    storeTestData('selectedRecipeOutput', {
      value: recipeOutputMode,
      label: t(getRecipeOutputModeLabel(recipeOutputMode, assortment.industry)),
    });
  }

  return (
    <>
      {/* Correction Settings */}
      <div data-testid="expanded-correction-pane" className={classes.row}>
        <Body data-testid="ecs-label" color="textPrimary" className={classes.label}>{t('labels.correctionSettings')}</Body>
        <Switch
          dataTestId="ecs-switch"
          isChecked={correctionSettings === 'automatic'}
          onChange={onChangeCorrectionSettings}
          uncheckedElement="Manual"
          checkedElement="Automatic"
          width={13}
        />
      </div>
      <ToggleableSection show={correctionSettings === 'manual'}>
        {/* Settings */}
        <div className={classes.row}>
          <Body
            data-testid="expanded-correction-settings"
            color="textPrimary"
            className={classes.label}
            onClick={() => setShowSettings(!showSettings)}
          >
            {t('labels.settings')}
            <CollapseArrow isCollapsed={showSettings} />
          </Body>
        </div>

        <ToggleableSection show={showSettings}>
          <div data-testid="ecs-manual" className={classes.recipe}>
            {/* Assortment */}
            <div className={classes.row}>
              <Body data-testid="ecs-assortment-label" color="textPrimary" className={classes.label}>{t('labels.assortment')}</Body>
              <Body data-testid="ecs-assortment-value" className={classes.value}>{assortment?.name}</Body>
            </div>

            {/* Type */}
            <div className={classes.row}>
              <Body data-testid="ecs-type-label" color="textPrimary" className={classes.label}>{t('labels.type')}</Body>
              <Body data-testid="ecs-type-value" className={classes.value}>{assortmentType}</Body>
            </div>

            {/* Substrate */}
            {isIFS && assortment && (
              <div className={classes.row}>
                <Body color="textPrimary" className={classes.label}>{t('labels.substrate')}</Body>
                <Body className={classes.value}>{substrate?.name}</Body>
              </div>
            )}

            {/* Recipe Output */}
            {isIFS && assortment && (
              <div data-testid="ecs-recipe-output" className={classes.row}>
                <Body data-testid="ecs-recipe-output-label" color="textPrimary" className={classes.label}>{t('labels.recipeOutput')}</Body>
                <Body data-testid="ecs-recipe-output-value" className={classes.value}>
                  {t(getRecipeOutputModeLabel(recipeOutputMode, assortment.industry))}
                </Body>
              </div>
            )}

            {/* Correction Mode */}
            <div className={classes.row}>
              <Body data-testid="ecs-correction-mode-label" color="textPrimary" className={classes.label}>{t('labels.correctionMode')}</Body>
              <Switch
                dataTestId="ecs-correction-mode-switch"
                isChecked={correctionMode === 'Add'}
                onChange={toggleCorrectionMode}
                uncheckedElement="Basic Recipe"
                checkedElement="Addition"
                width={13}
              />
            </div>

            <ToggleableSection show={correctionMode === 'Add'}>
              <div data-testid="ecs-addition-mode" className={classes.recipe}>
                {/* New Colorants */}
                <div className={classes.row}>
                  <Body data-testid="ecs-new-colorant-label" color="textPrimary" className={classes.label}>{t('labels.newColorants')}</Body>
                  <Switch
                    dataTestId="selectedColorantMode"
                    isChecked={colorantMode === 'new'}
                    onChange={toggleColorantMode}
                    uncheckedElement="Automatic"
                    checkedElement="Selected"
                    width={13}
                  />
                </div>

                {/* Maximum Add */}
                <div className={classes.row}>
                  <Body data-testid="ecs-max-add-label" color="textPrimary" className={classes.label}>{t('labels.maximumAdd')}</Body>
                  <PercentageInput
                    dataTestId="selectedMaxAddPercent"
                    value={maxAddPercent}
                    onChange={setMaxAddPercent}
                    alwaysShowControls
                  />
                </div>
              </div>
            </ToggleableSection>
            <ToggleableSection show={correctionMode === 'New' || colorantMode === 'new'}>
              {/* Components / Groups */}
              <div className={classes.row}>
                <Body color="textPrimary" className={classes.label}>{t('labels.componentsGroups')}</Body>
                <IconButton
                  data-testid="open-components-modal"
                  disableRipple
                  className={classes.iconButton}
                  disabled={isFetching}
                  onClick={() => setShowComponentsModal(true)}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </div>
              <ComponentsModal
                headerTitle={t('titles.CorrectionSetup')}
                dataTestId="components-modal"
                isFetching={isFetching}
                isOpen={showComponentsModal}
                closeModal={() => setShowComponentsModal(false)}
                clearBases={selectedClear ? [selectedClear] : []}
                selectedClear={selectedClear}
                onChangeClear={() => {
                  // user cannot change clear
                }}
                components={components}
                colorants={colorants}
                assortment={assortment}
                calibrationCondition={calibrationCondition}
                substrate={substrate}
                technicalVarnishes={technicalVarnishes}
                selectedComponentIds={selectedComponentIds}
                onSelectComponents={selectComponents}
                technicalVarnishMode={totalMode}
                onChangeTechnicalVarnishMode={setTotalMode}
                concentrationPercentages={concentrationPercentages}
                onChangeConcentrationPercentages={onChangeConcentrationPercentages}
                requiredComponentIds={requiredComponentIds}
                onChangeColorantsRequired={onChangeColorantsRequired}
                disableTechnicalVarnishes={!enableTechnicalVarnishSelection}
              />
              <div className={classes.row}>
                <Body color="textPrimary" className={classes.label}>{t('labels.clear')}</Body>
                <Body className={classes.value}>{selectedClear?.name}</Body>
              </div>
              {/* Select Colorants */}
              <div className={classes.subRow}>
                <SelectFormulationComponents
                  className={classes.w100}
                  components={components}
                  onSelectComponents={quickSelectComponents}
                  selectedIds={selectedComponentIds}
                  isDisabled={isFetching}
                />
              </div>
            </ToggleableSection>
          </div>
        </ToggleableSection>
      </ToggleableSection>
    </>
  );
};

export default ExpandedPane;
