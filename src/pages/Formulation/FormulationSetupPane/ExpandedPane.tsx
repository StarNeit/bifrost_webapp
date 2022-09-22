import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import {
  Box, Checkbox, IconButton, makeStyles,
} from '@material-ui/core';
import {
  Assortment, Colorant, SubIndustry, Substrate,
} from '@xrite/cloud-formulation-domain-model';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import { Component } from '../../../types/component';
import {
  OpacityMode,
  ThicknessOption,
  CombinatorialMode,
  FormulationComponent,
  SearchAndCorrectMode,
} from '../../../types/formulation';
import {
  AssortmentData,
  ColorApplicationDeviceThicknessRatio,
  SubstratesData,
} from '../../../data/api/cfdb';
import { Body } from '../../../components/Typography';
import SubstrateMenu from './SubstrateMenu';
import ViscosityInput from './ViscosityInput';
import FormulaIcon from '../../../assets/FormulaIcon';
import CorrectionIcon from '../../../assets/CorrectionIcon';
import IFSCombinatorialModeSwitch from './IFSCombinatorialModeSwitch';
import CollapseArrow from '../../../components/CollapseArrow';
import { clickable } from '../../../theme/components';
import PercentageInput from '../../../components/PercentageInput';
import ToggleableSection from '../../../components/ToggleableSection';
import { getCalibrationEngineClass } from '../../../utils/utils';
import Select from '../../../components/Select';
import SelectFormulationComponents from '../../../components/SelectFormulationComponents';
import { getOpacityModeLabel, getRecipeOutputModeLabel } from '../../common/utilsFormulation';
import ComponentsModal from '../../common/ComponentsModal';
import { setConcentration, setRequiredComponentIds } from '../../../data/reducers/formulation';
import { RecipeOutputMode, TotalMode } from '../../../types/recipe';
import MinMax from '../../../components/MinMax';
import ColorantGroupSelect from '../../common/ComponentsModal/ColorantGroupSelect';
import MinMaxWeight from '../../../components/MinMaxWeight';

const useStyles = makeStyles((theme) => ({
  label: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: theme.spacing(2),
    },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    minWidth: theme.spacing(48.625),
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  w100: {
    width: '100%',
  },
  medium: {
    width: theme.spacing(32.875),
  },
  mark: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.disabled,
  },
  small: {
    width: theme.spacing(20.25),
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
    minWidth: theme.spacing(45.625),
  },
  searchAndCorrectRow: {
    paddingBottom: 0,
  },
  slider: {
    paddingBottom: theme.spacing(0.5),
  },
  offsetAssortment: {
    marginBottom: theme.spacing(1),
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
  calculationOptionsIcon: {
    marginRight: theme.spacing(1),
  },
  thicknessField: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  thicknessMinMax: {
    width: theme.spacing(12.5),
  },
  ...clickable(),
}));

type Props = {
  assortments?: AssortmentData[],
  isFetching: boolean,
  assortment?: Assortment,
  selectedAssortmentId?: string,
  onChangeAssortment(arg?: AssortmentData): void,
  calibrationConditionId?: string,
  clearBases?: FormulationComponent[];
  selectedClearId?: string;
  onChangeClear(arg?: string): void;
  components?: FormulationComponent[],
  colorants?: Colorant[],
  technicalVarnishes?: FormulationComponent[],
  selectedComponentIds: string[],
  selectedAdditiveIds: string[],
  onSelectComponents(arg: string[]): void,
  onSelectAdditives(additiveIds: string[]): void,
  selectedSubstrateId?: string;
  selectedSubstrate?: Substrate;
  substrates?: SubstratesData[];
  thicknessRatios?: ColorApplicationDeviceThicknessRatio[];
  selectedThicknessRatio?: ColorApplicationDeviceThicknessRatio;
  onChangeThicknessRatio(deviceId: string, ratio?: number): void;
  onChangeSubstrate(arg?: string): void;
  onChangeThickness(arg: ThicknessOption): void;
  onChangeThicknessPercent(arg: {
    value: number, type: 'min' | 'max' | 'minAndMax'
  } | { type: 'default' }): void;
  onChangeViscosity(arg: number): void;
  onChangeSearchAndCorrected(arg: SearchAndCorrectMode): void;
  openNewSubstrateModal(): void;
  openEditSubstrateModal(): void;
  deleteSubstrate: (arg: { id: UUID[] }) => void;
  recipeOutputModes: RecipeOutputMode[],
  recipeOutputMode: RecipeOutputMode,
  onChangeRecipeOutputMode(arg: RecipeOutputMode): void,
  opacityModes: OpacityMode[],
  opacityMode: OpacityMode,
  opacityMinPercent: number,
  opacityMaxPercent: number,
  onChangeOpacitySettings(mode: OpacityMode, minPercent: number, maxPercent: number): void,
  thicknessSelection: ThicknessOption,
  minThicknessPercent: number,
  maxThicknessPercent: number,
  canUseViscosity: boolean,
  viscosity: number,
  combinatorialMode: CombinatorialMode,
  searchAndCorrected: SearchAndCorrectMode[],
  onChangeCombinatorialMode(arg: CombinatorialMode): void,
  totalMode: TotalMode,
  onChangeTotalMode: (mode: TotalMode) => void,
  onError: (key?: string, message?: string) => void;
};

const ExpandedPane: Component<Props> = ({
  assortments,
  assortment,
  selectedAssortmentId,
  onChangeAssortment,
  calibrationConditionId,
  clearBases,
  selectedClearId,
  onChangeClear,
  colorants,
  components,
  technicalVarnishes,
  selectedComponentIds,
  selectedAdditiveIds,
  onSelectComponents,
  onSelectAdditives,
  substrates,
  selectedSubstrateId,
  selectedSubstrate,
  onChangeSubstrate,
  recipeOutputModes,
  recipeOutputMode,
  opacityModes,
  opacityMode,
  opacityMinPercent,
  opacityMaxPercent,
  onChangeOpacitySettings,
  minThicknessPercent,
  maxThicknessPercent,
  canUseViscosity,
  viscosity,
  onChangeRecipeOutputMode,
  onChangeThickness,
  onChangeThicknessPercent,
  onChangeViscosity,
  deleteSubstrate,
  combinatorialMode,
  searchAndCorrected,
  onChangeCombinatorialMode,
  onChangeSearchAndCorrected,
  openNewSubstrateModal,
  openEditSubstrateModal,
  totalMode,
  onChangeTotalMode,
  thicknessRatios: colorApplicationDevices,
  selectedThicknessRatio: selectedColorApplicationDevice,
  onChangeThicknessRatio: onChangeColorApplicationDevice,
  isFetching,
  onError,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();

  const [weightPerAreaScaled, setWeightPerAreaScaled] = useState<{ min: number, max: number }>();
  const [showComponentsModal, setShowComponentsModal] = useState(false);
  const [showComponents, setShowComponents] = useState(true);
  const [showViscosity, setShowViscosity] = useState(true);
  const [showCalculationOptions, setShowCalculationOptions] = useState(true);

  const disableCustomThickness = Boolean(
    colorApplicationDevices
    && selectedColorApplicationDevice?.deviceId !== 'custom',
  );

  const weightPerAreaConstant = assortment?.subIndustry === SubIndustry.Offset
    ? assortment?.weightPerArea?.amount
    : undefined;
  const weightPerAreaUnit = assortment?.subIndustry === SubIndustry.Offset
    ? assortment?.weightPerArea?.unit
    : undefined;

  useEffect(() => {
    if (assortment?.subIndustry === SubIndustry.Offset && weightPerAreaConstant) {
      setWeightPerAreaScaled({
        min: (weightPerAreaConstant * (minThicknessPercent / 100)),
        max: (weightPerAreaConstant * (maxThicknessPercent / 100)),
      });
    }
  }, [assortment, minThicknessPercent, maxThicknessPercent]);

  // this effect sets both thickness to the maximum thickness percentage when SubIndustry is changed
  useEffect(() => {
    if (assortment?.subIndustry === SubIndustry.Offset
      || minThicknessPercent === maxThicknessPercent) return;

    onChangeThicknessPercent({ type: 'minAndMax', value: maxThicknessPercent });
  }, [assortment?.subIndustry]);

  const opacity = opacityMode === OpacityMode.OpacityMinimum
    || opacityMode === OpacityMode.OpacityFixed;
  const contrast = opacityMode === OpacityMode.ContrastRatioFixed
    || opacityMode === OpacityMode.ContrastRatioMinimum;

  const assortmentType = assortment?.subIndustry
    ? `${assortment?.industry} (${assortment?.subIndustry})`
    : assortment?.industry;

  const calibrationCondition = assortment?.calibrationConditions.find(
    ({ id }) => id === calibrationConditionId,
  );
  const engineClass = getCalibrationEngineClass(calibrationCondition);

  const isIFS = engineClass === 'IFS';
  const isCurrentlyHidden = false;

  const selectedClear = clearBases?.find(({ id }) => id === selectedClearId);
  const selectedAssortmentData = assortments?.find(({ id }) => id === selectedAssortmentId);
  const selectedSubstrateData = substrates?.find(({ id }) => id === selectedSubstrateId);

  const { concentrationPercentages, requiredComponentIds } = useSelector(
    (state) => state.formulation,
  );

  const quickSelectComponents = (newIds: string[]) => {
    const technicalVarnishIds = technicalVarnishes
      ?.filter(({ id }) => selectedComponentIds.includes(id))
      .map(({ id }) => id) || [];
    const combinedIds = [...newIds, ...technicalVarnishIds];
    onSelectComponents(combinedIds);
  };

  const selectOpacityMode = (
    mode: OpacityMode,
  ) => onChangeOpacitySettings(mode, opacityMinPercent, opacityMaxPercent);

  const setOpacityMinPercent = (
    value: number,
  ) => onChangeOpacitySettings(opacityMode, value, opacityMaxPercent);

  const handleConcentrationChange = (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => {
    dispatch(setConcentration({
      componentId,
      minConcentrationPercentage,
      maxConcentrationPercentage,
    }));
  };

  const handleRequired = (componentId: string, checked: boolean) => {
    dispatch(setRequiredComponentIds({ componentId, operation: checked ? 'add' : 'remove' }));
  };

  return (
    <>
      {/* Assortment */}
      <div className={classes.row}>
        <Body color="textPrimary" className={classes.label}>
          {t('labels.assortment')}
        </Body>
        <Select
          instanceId="assortment-select"
          id="assortment-select"
          dataTestId="selectedAssortment"
          className={classes.medium}
          data={assortments}
          isMulti={false}
          labelProp="name"
          idProp="id"
          value={selectedAssortmentData}
          onChange={onChangeAssortment}
          disabled={isFetching}
        />
      </div>

      {/* Type */}
      <div className={classes.row}>
        <Body color="textPrimary" className={classes.label}>{t('labels.type')}</Body>
        <Body>{assortmentType}</Body>
      </div>

      {/* Substrate */}
      <div className={classes.row}>
        <Body color="textPrimary" className={classes.label}>
          {t('labels.substrate')}
        </Body>
        <div className={clsx(classes.wrapper, classes.medium)}>
          <Select
            instanceId="substrate-select"
            id="substrate-select"
            dataTestId="selectedSubstrate"
            className={classes.w100}
            value={selectedSubstrateData}
            data={substrates}
            isMulti={false}
            idProp="id"
            labelProp="name"
            onChange={(substrate: SubstratesData) => onChangeSubstrate(substrate.id)}
            disabled={isFetching}
          />
          <div className={classes.mark}>
            <SubstrateMenu
              disableEdit={!selectedSubstrateId}
              openEditSubstrateModal={openEditSubstrateModal}
              openNewSubstrateModal={openNewSubstrateModal}
              onSubstrateDeleteClick={() => selectedSubstrateId
                && deleteSubstrate({ id: [selectedSubstrateId] })}
            />
          </div>
        </div>
      </div>

      {isIFS && assortment && (
        <>
          {/* Recipe */}
          <div className={classes.row}>
            <Body color="textPrimary" className={classes.label}>
              {t('labels.recipeOutput')}
            </Body>
            <Select
              id="recipe-output-mode-select"
              instanceId="recipe-output-mode-select"
              dataTestId="selectedRecipeOutput"
              className={classes.small}
              data={recipeOutputModes}
              value={recipeOutputMode}
              isMulti={false}
              onChange={onChangeRecipeOutputMode}
              disabled={isFetching}
              labelProp={
                (mode: RecipeOutputMode) => t(getRecipeOutputModeLabel(mode, assortment.industry))
              }
            />
          </div>
        </>
      )}

      {assortment && (
        <>
          {/* Clear */}
          <div className={classes.recipe}>
            <div className={classes.subRow}>
              <Body color="textPrimary" className={classes.label}>
                {t('labels.clear')}
              </Body>
              <Select
                id="clear-select"
                instanceId="clear-select"
                dataTestId="selectedClearCoat"
                className={classes.small}
                value={selectedClear}
                data={clearBases}
                idProp="id"
                labelProp="name"
                isMulti={false}
                onChange={(clear?: FormulationComponent) => onChangeClear(clear?.id)}
                disabled={isFetching}
              />
            </div>

            {/* Components */}
            <div className={classes.subRow}>
              <Body
                onClick={() => setShowComponents(!showComponents)}
                color="textSecondary"
                className={clsx(classes.label, classes.clickable)}
              >
                {t('labels.components')}
                <CollapseArrow isCollapsed={showComponents} />
              </Body>
              <ColorantGroupSelect
                colorants={colorants}
                components={components}
                selectedComponentIds={selectedComponentIds}
                onSelectComponents={onSelectComponents}
                showDelete={false}
                showCreate={false}
                showSelectAll
              />
              <IconButton
                data-testid="open-components-modal"
                className={classes.iconButton}
                disabled={isFetching}
                onClick={() => setShowComponentsModal(true)}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
              <ComponentsModal
                headerTitle={t('titles.FormulationSetup')}
                dataTestId="components-modal"
                isFetching={isFetching}
                isOpen={showComponentsModal}
                closeModal={() => setShowComponentsModal(false)}
                clearBases={clearBases}
                selectedClear={selectedClear}
                onChangeClear={onChangeClear}
                components={components}
                colorants={colorants}
                assortment={assortment}
                calibrationCondition={calibrationCondition}
                substrate={selectedSubstrate}
                technicalVarnishes={technicalVarnishes}
                selectedComponentIds={selectedComponentIds}
                onSelectComponents={onSelectComponents}
                selectedAdditiveIds={selectedAdditiveIds}
                onSelectAdditives={onSelectAdditives}
                technicalVarnishMode={totalMode}
                onChangeTechnicalVarnishMode={onChangeTotalMode}
                concentrationPercentages={concentrationPercentages}
                onChangeConcentrationPercentages={handleConcentrationChange}
                requiredComponentIds={requiredComponentIds}
                onChangeColorantsRequired={handleRequired}
                selectedAssortmentId={selectedAssortmentId}
                recipeOutputMode={recipeOutputMode}
              />
            </div>

            <ToggleableSection show={showComponents}>
              <div className={classes.subRow}>
                <SelectFormulationComponents
                  isMulti
                  className={classes.w100}
                  components={components}
                  onSelectComponents={quickSelectComponents}
                  selectedIds={selectedComponentIds}
                  isDisabled={isFetching}
                />
              </div>
            </ToggleableSection>
          </div>
          <div className={classes.row}>
            <Body color="textSecondary" className={classes.label}>
              {t('labels.thickness')}
            </Body>
            {colorApplicationDevices && (
              <Select
                id="thicknessObject-select"
                instanceId="thicknessObject-select"
                dataTestId="selectedThicknessObject"
                className={classes.small}
                value={selectedColorApplicationDevice}
                data={colorApplicationDevices}
                idProp="deviceId"
                labelProp={(x) => x.deviceName || ''}
                isMulti={false}
                onChange={({ deviceId, ratio }) => onChangeColorApplicationDevice(deviceId, ratio)}
                disabled={false}
              />
            )}
          </div>

          <div className={classes.subRow}>
            <div>
              {assortment.subIndustry === SubIndustry.Offset && weightPerAreaConstant && (
                <Body color="textPrimary" className={classes.label}>
                  {t('labels.weightPerArea')}
                </Body>
              )}
              <Body color="textPrimary" className={classes.label}>
                {t('labels.percentCalibration')}
              </Body>
            </div>
            {assortment.subIndustry === SubIndustry.Offset
              ? (
                <div>
                  {weightPerAreaConstant && (
                    <div className={classes.offsetAssortment}>
                      <MinMaxWeight
                        id="thickness-minmax"
                        dataTestId="selectedThickness"
                        minLimit={0}
                        maxLimit={weightPerAreaConstant * 100}
                        min={weightPerAreaScaled?.min ?? weightPerAreaConstant}
                        max={weightPerAreaScaled?.max ?? weightPerAreaConstant}
                        onMinChange={(value) => onChangeThicknessPercent({ value: ((value / weightPerAreaConstant) * 100), type: 'min' })}
                        onMaxChange={(value) => onChangeThicknessPercent({ value: ((value / weightPerAreaConstant) * 100), type: 'max' })}
                        onError={onError}
                        disabled={disableCustomThickness}
                        unit={weightPerAreaUnit}
                      />
                    </div>
                  )}
                  <MinMax
                    id="thickness-minmax"
                    dataTestId="selectedThickness"
                    minLimit={20}
                    maxLimit={500}
                    min={minThicknessPercent}
                    max={maxThicknessPercent}
                    onMinChange={(value) => onChangeThicknessPercent({ value, type: 'min' })}
                    onMaxChange={(value) => onChangeThicknessPercent({ value, type: 'max' })}
                    onError={onError}
                    disabled={!!weightPerAreaConstant}
                  />
                </div>
              ) : (
                <PercentageInput
                  id="thickness-percentage"
                  dataTestId="selectedThickness"
                  value={maxThicknessPercent}
                  onChange={(value) => {
                    onChangeThicknessPercent({ value, type: 'minAndMax' });
                  }}
                  min={20}
                  max={500}
                  onError={onError}
                  className={classes.thicknessMinMax}
                  alwaysShowControls
                  disabled={disableCustomThickness}
                />
              )}
          </div>

          {canUseViscosity && (
            <>
              <div className={classes.row}>
                <Body
                  onClick={() => setShowViscosity(!showViscosity)}
                  color="textSecondary"
                  className={clsx(classes.label, classes.clickable)}
                >
                  {t('labels.viscosity')}
                  <CollapseArrow isCollapsed={showViscosity} />
                </Body>
              </div>

              <ToggleableSection show={showViscosity}>
                <div className={classes.subRow}>
                  <Body>{t('labels.viscosityValue')}</Body>
                  <ViscosityInput
                    id="viscosity"
                    value={viscosity}
                    dataTestId="selectedViscosity"
                    onChange={onChangeViscosity}
                    disabled={recipeOutputMode === RecipeOutputMode.ProductionReady}
                    min={0}
                    onError={onError}
                  />
                </div>
              </ToggleableSection>
            </>
          )}

          {(opacityModes.length > 0) && (
            <>
              {/* Opacity */}
              <div className={classes.row}>
                <Body color="textSecondary" className={classes.label}>
                  {t('labels.opacityControl')}
                </Body>
                <Select
                  id="opacity-select"
                  instanceId="opacity-select"
                  dataTestId="selectedOpacityMode"
                  disabled={isFetching}
                  isMulti={false}
                  className={classes.small}
                  value={opacityMode}
                  data={opacityModes}
                  onChange={selectOpacityMode}
                  labelProp={(mode: OpacityMode) => t(getOpacityModeLabel(mode))}
                />
              </div>
              {opacity && (
                <div className={clsx(classes.subRow, classes.slider)}>
                  <Body>{`${t('labels.opacity')}:`}</Body>
                  <PercentageInput
                    id="opacity"
                    value={opacityMinPercent}
                    dataTestId="selectedOpacityMin"
                    onChange={setOpacityMinPercent}
                    onError={onError}
                    alwaysShowControls
                  />
                </div>
              )}
              {contrast && (
                <div className={clsx(classes.subRow, classes.slider)}>
                  <Body>{`${t('labels.contrastRatio')}:`}</Body>
                  <PercentageInput
                    id="contrastRatio"
                    dataTestId="selectedOpacityMin"
                    value={opacityMinPercent}
                    onChange={setOpacityMinPercent}
                    onError={onError}
                    alwaysShowControls
                  />
                </div>
              )}
            </>
          )}

          <div className={classes.row}>
            <Body
              color="textSecondary"
              onClick={() => setShowCalculationOptions(!showCalculationOptions)}
              className={clsx(classes.label, classes.clickable)}
            >
              {t('labels.calculationOptions')}
              <CollapseArrow isCollapsed={showCalculationOptions} />
            </Body>
            <div />
          </div>
          <ToggleableSection show={showCalculationOptions}>
            <div className={classes.subRow}>
              <Box display="flex" alignItems="center">
                <FormulaIcon className={classes.calculationOptionsIcon} />
                <Body>{t('labels.combinatorialMode')}</Body>
              </Box>
              {isIFS && (
                <IFSCombinatorialModeSwitch
                  isChecked={combinatorialMode === CombinatorialMode.Full}
                  onChange={(checked: boolean) => onChangeCombinatorialMode(checked
                    ? CombinatorialMode.Full
                    : CombinatorialMode.FastMatch)}
                />
              )}
            </div>
            {(Object.values(SearchAndCorrectMode).map((mode) => (
              <div key={mode} className={clsx(classes.subRow, classes.searchAndCorrectRow)}>
                <Box display="flex" alignItems="center">
                  <CorrectionIcon className={classes.calculationOptionsIcon} />
                  <Body>{t(`labels.${mode}`)}</Body>
                </Box>
                <Checkbox
                  color="primary"
                  checked={searchAndCorrected.includes(mode)}
                  onChange={() => onChangeSearchAndCorrected(mode)}
                />
              </div>
            )))}
          </ToggleableSection>
        </>
      )}

      {isCurrentlyHidden && (
        <>
          <div className={classes.row}>
            <Body color="textSecondary" className={classes.label}>
              {t('labels.filmThickness')}
            </Body>
            <div className={clsx(classes.wrapper, classes.small)}>
              <Select
                className={classes.w100}
                isMulti={false}
                data={[ThicknessOption.None, ThicknessOption.Thickness]}
                // labelProp={(option: ThicknessOption) => ThicknessLabel[option]}
                onChange={onChangeThickness}
                disabled={isFetching}
              />
              <div className={classes.mark}>
                <IconButton
                  disableRipple
                  className={classes.iconButton}
                  disabled={isFetching}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ExpandedPane;
