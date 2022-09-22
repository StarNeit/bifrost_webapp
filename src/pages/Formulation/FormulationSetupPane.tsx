import { useMemo, useState } from 'react';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import {
  Assortment,
} from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import CollapsedPane from './FormulationSetupPane/CollapsedPane';
import ExpandedPane from './FormulationSetupPane/ExpandedPane';
import AnimationContainer from '../../components/AnimationContainer';
import { ClassNameProps, Component } from '../../types/component';
import { useFormulation } from '../../data/cfe';
import SubstrateModal from '../common/StandardSubstrateModal/SubstrateModal';
import Button from '../../components/Button';
import { trackEvent } from '../../data/analytics';
import { scrollbars } from '../../theme/components';
import {
  getFormulationInputColorants, useAutoSelectFormulationSettings, useFormulationSetup,
} from './utils';
import { useBasicMaterial } from '../../data/api';
import { AddSubstrateMutationVariables } from '../../data/api/graphql/generated';
import { useColorimetricConfiguration } from '../../data/configurations';
import { useFormulationDefaults } from '../../data/api/formulationDefaults';
import { FormulationParameters } from '../../types/cfe';
import { RecipeOutputMode } from '../../types/recipe';
import { MetricType, SearchAndCorrectMode } from '../../types/formulation';
import SubstrateEditModal from '../common/StandardSubstrateModal/SubstrateEditModal';
import { getViewingConditions } from '../../data/common';
import { getColorimetricStandardColorSpec, isColorimetricStandard } from '../../utils/utilsStandard';
import { isCompatibleWithCondition } from '../../utils/utilsMeasurement';

const useStyles = makeStyles((theme) => ({
  content: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    ...scrollbars(theme),
  },
  buttonContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    background: theme.palette.background.paper,
    width: '94%',
    overflow: 'hidden',
    bottom: theme.spacing(1.2),
    marginTop: theme.spacing(2),
  },
  smallButtonContainer: {
    width: '85%',
  },
  fadeContent: {
    position: 'absolute',
    left: theme.spacing(1.5),
    right: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
  },
  buttonMargin: {
    margin: theme.spacing(1.5, 0),
  },
  button: {
    fontSize: theme.spacing(1.5),
    letterSpacing: theme.spacing(0.25),
    height: theme.spacing(5.25),
    textTransform: 'capitalize',
  },
  // Overwrite classes for the animation container
  expandedContainer: {
    padding: 0,
    paddingTop: theme.spacing(1.5),
  },
  expandedBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedTitle: {
    width: '100%',
    height: 'auto',
  },
}));

type Props = ClassNameProps;

const FormulationSetupPane: Component<Props> = ({ className }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFolded, setIsFolded] = useState(false);

  const [isNewSubstratePopupVisible, setIsNewSubstratePopupVisible] = useState<boolean>(false);
  const [isEditSubstratePopupVisible, setIsEditSubstratePopupVisible] = useState<boolean>(false);

  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const viewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration), [colorimetricConfiguration],
  );
  const [defaults] = useFormulationDefaults();

  const {
    standard,
    assortments,
    selectedAssortmentId,
    selectedAssortment,
    setSelectedAssortmentId,
    calibrationConditionId,
    calibrationCondition,
    substrates,
    selectedSubstrate,
    selectedSubstrateId,
    setSelectedSubstrateId,
    createSubstrate,
    colorants,
    components,
    selectedComponents,
    selectedComponentIds,
    setSelectedComponentIds,
    selectedAdditiveIds,
    setSelectedAdditiveIds,
    clearComponents,
    selectedClear,
    selectedClearId,
    setSelectedClearId,
    thicknessRatioOptions,
    selectedThicknessRatio,
    setThicknessRatio,
    availableRecipeOutputModes,
    selectedRecipeOutputMode,
    setSelectedRecipeOutputMode,
    availableOpacityModes,
    selectedOpacityMode,
    opacityMinPercent,
    opacityMaxPercent,
    setOpacitySettings,
    minThicknessPercent,
    maxThicknessPercent,
    technicalVarnishes,
    setThicknessPercent,
    canUseViscosity,
    viscosity,
    setViscosity,
    selectedCombinatorialMode,
    setCombinatorialMode,
    selectedThickness,
    setSelectedThickness,
    selectedSearchAndCorrectModes,
    setSearchAndCorrect,
    deleteSubstrate,
    totalMode,
    setTotalMode,
    isFetching,
    updateSubstrate,
  } = useFormulationSetup();
  const { isAutoSelecting } = useAutoSelectFormulationSettings();

  const { concentrationPercentages, requiredComponentIds } = useSelector(
    (state) => ({
      concentrationPercentages: state.formulation.concentrationPercentages,
      requiredComponentIds: state.formulation.requiredComponentIds,
    }),
  );

  const {
    formulate,
    clearResults: clearFormulationResults,
    fetching: formulationRunning,
  } = useFormulation();

  const { colorantsMaxCount } = useSelector((state) => state.formulation);

  const selectAssortment = (id?: string) => {
    // clear current formulation results
    clearFormulationResults();
    setSelectedAssortmentId(id);
    // select the default substrate if present
    const newAssortment = assortments?.find((x) => x.id === id);
    if (newAssortment?.defaultSubstrate?.id) {
      setSelectedSubstrateId(newAssortment?.defaultSubstrate?.id);
    }
  };

  const handleFold = () => {
    setIsFolded(!isFolded);
  };
  const handleNewSubstratePopup = () => {
    setIsNewSubstratePopupVisible(!isNewSubstratePopupVisible);
  };
  const handleEditSubstratePopup = () => {
    setIsEditSubstratePopupVisible(!isEditSubstratePopupVisible);
  };

  const canRunFormulation = Boolean(
    selectedAssortment
    && selectedSubstrate
    && standard
    && !formulationRunning
    && calibrationCondition
    && selectedComponents.length
    && isCompatibleWithCondition(standard, calibrationCondition)
    && isCompatibleWithCondition(selectedSubstrate, calibrationCondition)
    && Object.keys(errors).length === 0
    && selectedSearchAndCorrectModes.length,
  );

  const { basicMaterials } = useBasicMaterial();
  const handleFormulate = () => {
    if (!(
      selectedAssortment
      && selectedClearId
      && selectedSubstrate
      && standard
      && calibrationCondition
      && isCompatibleWithCondition(standard, calibrationCondition)
      && isCompatibleWithCondition(selectedSubstrate, calibrationCondition)
      && defaults
      && viewingConditions
      && viewingConditions.length >= 2
    )) return;

    const { formulationColorants, fixedColorantIds } = getFormulationInputColorants(
      selectedRecipeOutputMode,
      colorants,
      selectedComponentIds,
      selectedClearId,
      concentrationPercentages,
      requiredComponentIds,
    );

    if (formulationColorants.length === 0) return;
    const relativeThicknessMin = minThicknessPercent / 100.0;
    const relativeThicknessMax = maxThicknessPercent / 100.0;

    let { observer, illuminant } = viewingConditions[0];
    let illuminant2 = viewingConditions[1].illuminant;

    if (standard && isColorimetricStandard(standard)) {
      const colorSpecification = getColorimetricStandardColorSpec(standard);
      observer = colorSpecification.observer || observer;
      illuminant = colorSpecification.illuminant || illuminant;
      // for colorimetric standards only the illuminant of the standard makes sense
      illuminant2 = illuminant;
    }

    const basicMaterialAdditives = (selectedRecipeOutputMode === RecipeOutputMode.BasicMaterial)
      ? basicMaterials.filter((basicMaterial) => {
        const { id } = basicMaterial;
        if (!id) return false;
        return selectedAdditiveIds.includes(id);
      })
      : [];

    const additives = basicMaterialAdditives.map((additive) => {
      const { id } = additive;
      if (!id) return ({ ...additive, concentrationPercentage: 0 });
      const concentrationPercentage = concentrationPercentages?.[id]?.maxConcentrationPercentage
        ?? 0;
      return ({ ...additive, concentrationPercentage });
    });

    const parameters: FormulationParameters = {
      assortment: new Assortment({
        ...selectedAssortment,
        colorants,
      }),
      calibrationCondition,
      substrate: selectedSubstrate,
      standard,
      clearId: selectedClearId,
      colorants: formulationColorants,
      requiredColorantIds: components.filter((component) => requiredComponentIds.includes(
        component.colorantId ?? component.id,
      )).map((component) => component.colorantId ?? component.id),
      relativeThicknessMin,
      relativeThicknessMax,
      combinatorialMode: selectedCombinatorialMode,
      opacityMode: selectedOpacityMode,
      opacityMinPercent,
      opacityMaxPercent,
      recipeOutputMode: selectedRecipeOutputMode,
      viscosity,
      fixedColorantIds,
      totalMode,
      additives,
      // feed the selected illuminants into the engine settings in the same way as IFS does it
      // will need to change this in case we also support the EFX engine
      metricType: MetricType.Colorimetric,
      colorimetricSettings: {
        illuminants: [
          { illuminant, weight: 1.0 },
          { illuminant: illuminant2, weight: 1.0 },
          { illuminant: illuminant2, weight: 0.0 },
        ],
        observer,
        deltaE2000Weights: {
          kl: colorimetricConfiguration?.metric.lRatio || 1,
          kc: colorimetricConfiguration?.metric.cRatio || 1,
          kh: colorimetricConfiguration?.metric.hRatio || 1,
        },
      },
      canUnit: defaults.defaultCanUnit,
      canSize: defaults.defaultCanSize,
      maxNumberOfColorants: colorantsMaxCount,
    };

    formulate(parameters);

    trackEvent('Start Formulation');
  };

  const onError = (key?: string, message?: string) => {
    setErrors((existing) => {
      const newErrors = { ...existing };

      if (!message) {
        delete newErrors[key ?? ''];
      } else {
        newErrors[key ?? ''] = message;
      }

      return newErrors;
    });
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const content = event.target as HTMLDivElement;
    const activeElement = document?.activeElement;
    const isReactSelect = document?.activeElement?.id.includes('react-select');

    if (
      !activeElement
      || !isReactSelect
      || !content.contains(activeElement)
      || !(document.activeElement instanceof HTMLElement)
    ) return;

    (activeElement as HTMLElement).blur();
  };

  return (
    <AnimationContainer
      header={t('titles.FormulationSetup')}
      size="medium"
      isFolded={isFolded}
      onChangeFold={handleFold}
      className={className}
      isLoading={isFetching || isAutoSelecting}
      onExpandedClasses={{
        expanded: classes.expandedContainer,
        body: classes.expandedBody,
        titleOpen: classes.expandedTitle,
      }}
    >
      <div className={classes.content} onScroll={handleScroll}>
        {
          isFolded && (
            <Fade in={isFolded} timeout={{ enter: 500, exit: 400 }}>
              <div className={classes.fadeContent}>
                <CollapsedPane
                  assortment={selectedAssortment}
                  calibrationConditionId={calibrationConditionId}
                  substrate={selectedSubstrate}
                  recipeOutputMode={selectedRecipeOutputMode}
                  selectedClear={selectedClear}
                  components={components}
                  selectedComponentIds={selectedComponentIds}
                  opacityMode={selectedOpacityMode}
                  opacityMinPercent={opacityMinPercent}
                  opacityMaxPercent={opacityMaxPercent}
                  thicknessSelection={selectedThickness}
                  minThicknessPercent={minThicknessPercent}
                  maxThicknessPercent={maxThicknessPercent}
                  combinatorialMode={selectedCombinatorialMode}
                  searchAndCorrected={selectedSearchAndCorrectModes}
                />
              </div>
            </Fade>
          )
        }

        <Fade in={!isFolded} timeout={{ enter: 1000, exit: 300 }}>
          <div className={classes.fadeContent}>
            <ExpandedPane
              onError={onError}
              isFetching={isFetching}
              calibrationConditionId={calibrationConditionId}
              // colorants / components
              components={components}
              colorants={colorants}
              selectedComponentIds={selectedComponentIds}
              onSelectComponents={setSelectedComponentIds}
              selectedAdditiveIds={selectedAdditiveIds}
              onSelectAdditives={setSelectedAdditiveIds}
              // assortment
              assortments={assortments}
              selectedAssortmentId={selectedAssortmentId}
              assortment={selectedAssortment}
              onChangeAssortment={(data) => selectAssortment(data?.id)}
              canUseViscosity={canUseViscosity}
              // technical varnishes
              technicalVarnishes={technicalVarnishes}
              totalMode={totalMode}
              onChangeTotalMode={setTotalMode}
              // clear
              selectedClearId={selectedClearId}
              clearBases={clearComponents}
              onChangeClear={setSelectedClearId}
              // color application device
              thicknessRatios={thicknessRatioOptions}
              selectedThicknessRatio={selectedThicknessRatio}
              onChangeThicknessRatio={setThicknessRatio}
              // substrate
              substrates={substrates}
              selectedSubstrateId={selectedSubstrateId}
              onChangeSubstrate={setSelectedSubstrateId}
              deleteSubstrate={deleteSubstrate}
              selectedSubstrate={selectedSubstrate}
              // recipe output mode
              recipeOutputModes={availableRecipeOutputModes}
              recipeOutputMode={selectedRecipeOutputMode}
              onChangeRecipeOutputMode={setSelectedRecipeOutputMode}
              // opacity mode
              opacityModes={availableOpacityModes}
              opacityMode={selectedOpacityMode}
              opacityMinPercent={opacityMinPercent}
              opacityMaxPercent={opacityMaxPercent}
              onChangeOpacitySettings={setOpacitySettings}
              // thickness
              thicknessSelection={selectedThickness}
              minThicknessPercent={minThicknessPercent}
              maxThicknessPercent={maxThicknessPercent}
              onChangeThickness={setSelectedThickness}
              onChangeThicknessPercent={setThicknessPercent}
              // viscosity
              viscosity={viscosity}
              onChangeViscosity={setViscosity}
              // combinatorial mode
              combinatorialMode={selectedCombinatorialMode}
              onChangeCombinatorialMode={setCombinatorialMode}
              searchAndCorrected={selectedSearchAndCorrectModes}
              onChangeSearchAndCorrected={setSearchAndCorrect}
              openNewSubstrateModal={handleNewSubstratePopup}
              openEditSubstrateModal={handleEditSubstratePopup}
            />
          </div>
        </Fade>
      </div>
      <div className={clsx({
        [classes.buttonContainer]: true,
        [classes.smallButtonContainer]: isFolded,
      })}
      >
        <Button
          data-testid="formulate-btn"
          data-test-is-loading={formulationRunning}
          color="primary"
          className={clsx(classes.button, classes.buttonMargin)}
          onClick={handleFormulate}
          disabled={!canRunFormulation}
          showSpinner={formulationRunning}
        >
          {/* in case where only match is selected or nothing is selected */}
          {((selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.Off)
            && selectedSearchAndCorrectModes.length === 1) || !selectedSearchAndCorrectModes.length) && t('labels.formulate')}

          {/* in case where search only or search and correct is selected */}
          {
            !selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.Off)
            && (
              selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.Search)
              || selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.SearchAndCorrect)
            ) && t('labels.search')
          }

          {/* in case where search only or search and correct is selected together with match */}
          {
            selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.Off)
            && (
              selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.Search)
              || selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.SearchAndCorrect)
            )
            && t('labels.formulateAndSearch')
          }
        </Button>
      </div>
      <SubstrateModal
        isOpen={isNewSubstratePopupVisible}
        closeModal={handleNewSubstratePopup}
        createSubstrate={async (newSubstrate: AddSubstrateMutationVariables) => {
          const { data } = await createSubstrate(newSubstrate);

          setSelectedSubstrateId(data?.addSubstrate?.id ?? undefined);
          handleNewSubstratePopup();
        }}
      />
      <SubstrateEditModal
        closeModal={handleEditSubstratePopup}
        isOpen={isEditSubstratePopupVisible}
        updateSubstrate={updateSubstrate}
        selectedSubstrate={selectedSubstrate}
      />
    </AnimationContainer>
  );
};

export default FormulationSetupPane;
