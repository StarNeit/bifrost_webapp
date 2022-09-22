/* eslint-disable max-len */
import {
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import i18next from 'i18next';
import {
  AppearanceSample,
  Colorant,
  FormulaLayer,
  Formula,
  FormulaComponent,
  IlluminantType,
  Measurement,
  Substrate,
} from '@xrite/cloud-formulation-domain-model';
import { useClient } from 'urql';
import { v4 as uuid } from 'uuid';
import sortBy from 'lodash/sortBy';
import inRange from 'lodash/inRange';

import {
  FormulationResults,
  FormulationParameters,
  CorrectionParameters,
  PredictionResults,
  PredictionParameters,
  CalibrationParameters,
  CalibrationResults,
  EngineBaseParameters,
  EngineType,
} from '../types/cfe';
import CFEClientManager from './api/cfe/CFEClientManager';
import { useSession } from './authentication';
import config from '../config';
import {
  isFormulationResults,
  getEngineType,
  convertFormulationResultsToAppearanceSamples,
  convertPredictionResultsToAppearanceSamples,
  createFormulationInput,
  createCorrectionInput,
  isIFSEngine,
  isPredictionResults,
  createPredictionInput,
  createCalibrationInput,
  convertCalibrationResultsToColorants,
  isCalibrationResults,
} from './cfeUtils';
import { Unvalidated } from '../types/utils';
import { setFormulationResult, setFormulationResultData } from './reducers/formulation';
import useToast from './useToast';
import { setCorrectionResults } from './reducers/correction';
import { refreshSessionExpiration, setSession } from './reducers/authentication';
import { selectSampleId, setWorkingAppearanceSamples } from './reducers/common';
import { UnauthorizedError } from './api/ws/utils';
import {
  parseArray,
  useStandard,
} from './api';
import { getViewingConditions, useStandardId } from './common';
import {
  FormulationSettings,
  SearchAndCorrectMode,
} from '../types/formulation';
import {
  useSampleCorrection,
} from './cfeCorection';
import {
  GetAppearanceSampleDocument, GetAppearanceSampleQuery, GetAppearanceSampleQueryVariables, GetSubstrateDocument, GetSubstrateQuery, GetSubstrateQueryVariables,
} from './api/graphql/generated';
import { deltaE2000, getAverageDeltaE2000, getAverageDeltaE76 } from '../utils/colorimetry';
import { useColorimetricConfiguration } from './configurations';
import { getCalibrationParameterScalarValue, isColorantAClear } from '../utils/utils';
import { computeCanSizeFromComponents, defaultGravimetricUnit, getOutputRecipe } from '../utils/utilsRecipe';
import CFEClient from './api/cfe/CFEClient';
import { getSubstrateCalibrationInformation } from '../pages/common/StandardSubstrateModal/utils';
import { assembleMeasurementSamplesByCondition2 } from '../widgets/utils';
import store from '../store';

type ResultWithType = {
  sample: AppearanceSample;
  score: number;
  type: 'search' | 'formulation' | 'correction';
}

let connectionManagerInstance: CFEClientManager | undefined;
function getConnectionManager(token: string) {
  if (connectionManagerInstance?.token !== token) {
    connectionManagerInstance?.close();
    connectionManagerInstance = new CFEClientManager(token, config.CFE_URL);
  }
  return connectionManagerInstance;
}

function getConnection(token: string, engineType: EngineType) {
  const connectionManager = getConnectionManager(token);
  return connectionManager.get(engineType, {
    onNewConnection: () => store.dispatch(refreshSessionExpiration()),
  });
}

// const for adding extra +/-10% thickness range
const ADDITIONAL_THICKNESS_RANGE = 0.1;
const ROUGHNESS_MAX_DIFFERENCE_PERCENTAGE = 10;
const DELTAE_MAX_SAMPLE_DIFFERENCE = 2;
const ALLOWED_SAMPLE_VISCOSITY_RANGE = 1;

const rePredictFormula = (
  formula: Formula,
  parameters: EngineBaseParameters,
  connection: CFEClient,
): Promise<Measurement[] | undefined> => {
  return new Promise<Measurement[] | undefined>((resolve, reject) => {
    const predictParams: PredictionParameters = {
      ...parameters,
      formula,
    };
    const predictInput = createPredictionInput(predictParams);
    const handleErrorPredict = (error: Error) => {
      reject(error);
    };

    const handleResultsPredict = (resultsData: Unvalidated<PredictionResults>) => {
      if (isPredictionResults(resultsData)) {
        const convertedResults = convertPredictionResultsToAppearanceSamples({
          results: resultsData,
          ...parameters,
        });
        resolve(convertedResults);
      } else {
        reject(new Error('Invalid prediction result data'));
      }
    };

    connection.predict(
      predictInput,
      {
        error: handleErrorPredict,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        progress: () => {},
        results: handleResultsPredict,
      },
    );
  });
};

const modifyRecipeForAdditives = async (
  { sample, score }: { sample: AppearanceSample, score: number },
  parameters: EngineBaseParameters,
  connection: CFEClient,
  originalFormula?: Formula,
) => {
  if (!sample.formula) {
    return {
      sample,
      score,
    };
  }

  const calibrationConditionId = parameters.calibrationCondition.id;
  const assortmentViscosity = (parameters.assortment && calibrationConditionId)
    ? getCalibrationParameterScalarValue(
      parameters.assortment,
      calibrationConditionId,
      'calibrationViscosity',
    ) || 0
    : 0.0;

  const outputRecipe = getOutputRecipe({
    assortmentViscosity,
    colorants: parameters.colorants,
    recipeOutputMode: parameters.recipeOutputMode,
    formula: sample.formula,
    originalFormula,
    solvent: parameters.assortment.solvent,
    calibrationConditionId,
    recipeUnit: defaultGravimetricUnit,
    canUnit: defaultGravimetricUnit,
    totalMode: parameters.totalMode,
  });
  const changesNeeded = outputRecipe.layers.some((layer) => layer.changeWasRequiredForAdditives);

  if (!changesNeeded) {
    return {
      sample,
      score,
    };
  }

  const newFormula = new Formula({
    ...sample.formula,
    formulaLayers: sample.formula?.formulaLayers.map((layer) => new FormulaLayer({
      ...layer,
      formulaComponents: layer.formulaComponents.map((component) => new FormulaComponent({
        ...component,
      })),
    })),
  });
  const newSample = new AppearanceSample({
    ...sample,
    formula: newFormula,
  });

  outputRecipe.layers.forEach((outputLayer, layerIndex) => {
    if (outputLayer.requiredClearMassAmountToAdd <= 0) return;
    const formulaLayer = newFormula.formulaLayers[layerIndex];
    if (!formulaLayer) return;
    const clearColorant = parameters.colorants.find(({ id, components }) => id === parameters.clearId
      || components.some(({ basicMaterial }) => basicMaterial.id === parameters.clearId))
    || parameters.colorants.find(isColorantAClear)
    || parameters.assortment.colorants.find(isColorantAClear);
    if (!clearColorant) return;
    const clearComponent = formulaLayer.formulaComponents.find((comp) => comp.colorant.id === clearColorant.id);
    if (clearComponent) {
      clearComponent.massAmount += outputLayer.requiredClearMassAmountToAdd;
    } else {
      // there is no clear component, so need to create it
      const newClearComponent = new FormulaComponent({
        colorant: { id: clearColorant.id },
        massAmount: outputLayer.requiredClearMassAmountToAdd,
      });
      formulaLayer.formulaComponents.push(newClearComponent);
    }

    const oldSums = computeCanSizeFromComponents(
      sample.formula?.formulaLayers[layerIndex]?.formulaComponents || [],
      parameters.viscosity,
      parameters.colorants,
      parameters.calibrationCondition.id,
      parameters.totalMode,
      parameters.assortment.solvent,
    );

    // rescale
    const scaleFactor = oldSums.massSum
      / (oldSums.massSum + outputLayer.requiredClearMassAmountToAdd);
    const scaledComponents = formulaLayer.formulaComponents.map(
      (comp) => new FormulaComponent({
        ...comp,
        massAmount: comp.massAmount * scaleFactor,
      }),
    );
    newFormula.formulaLayers[layerIndex] = new FormulaLayer({
      ...formulaLayer,
      formulaComponents: scaledComponents,
    });
  });

  const newPredictions = await rePredictFormula(newFormula, parameters, connection);
  if (newPredictions) newFormula.predictionMeasurements = newPredictions;

  return {
    sample: newSample,
    score,
  };
};

const getMeasurementWithNewId = (measurement: Measurement) => Measurement.parse({
  ...measurement,
  id: uuid(),
});

export const useFormulation = () => {
  const client = useClient();
  const session = useSession();
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const [progress, setProgress] = useState<number>();
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { selectedStandardId } = useStandardId();
  const {
    result: selectedStandard,
  } = useStandard({ id: selectedStandardId });

  const { correctSample } = useSampleCorrection();
  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const viewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration), [colorimetricConfiguration],
  );
  const {
    result,
    searchAndCorrectModes: selectedSearchAndCorrectModes,
  } = useSelector((state) => state.formulation);

  const handleError = (error: Error) => {
    showToast(error.message, 'error');
    setProgress(undefined);
    if (error instanceof UnauthorizedError) {
      dispatch(setSession());
    }
  };

  const clearResults = () => {
    dispatch(setFormulationResult(undefined));
    dispatch(selectSampleId(''));
  };

  const search = async (parameters: FormulationParameters) => {
    if (!selectedStandard) throw new Error('No standard selected');

    const variables = {
      colorFilter: {
        measurementSample:
          selectedStandard.measurements[0].measurementSamples[0],
        lTolerance: 5,
        aTolerance: 5,
        bTolerance: 5,
        // cTolerance: 5,
        // hTolerance: 5,
      },
    };

    const { data } = await client.query(
      GetAppearanceSampleDocument,
      variables,
      { requestPolicy: 'network-only' },
    ).toPromise();

    const trials = parseArray(AppearanceSample, data.getAppearanceSample);

    const getFormulaAppearanceSample = async (trial: AppearanceSample): Promise<AppearanceSample | undefined> => {
      if (trial.formula) return trial;
      if (!trial.parentAppearanceSampleId) return undefined;
      const { data: parentData } = await client.query<GetAppearanceSampleQuery, GetAppearanceSampleQueryVariables>(
        GetAppearanceSampleDocument,
        { id: trial.parentAppearanceSampleId },
        { requestPolicy: 'network-only' }, // S&C search results should not be cached
      ).toPromise();
      const parentSampleData = parentData?.getAppearanceSample?.[0];
      if (!parentSampleData) return undefined;
      const parentSample = AppearanceSample.parse(parentSampleData);
      return getFormulaAppearanceSample(parentSample);
    };
    const getSubstrate = async (substrateId: string | undefined): Promise<Substrate | undefined> => {
      if (!substrateId) return undefined;
      const queryResult = await client.query<GetSubstrateQuery, GetSubstrateQueryVariables>(
        GetSubstrateDocument,
        { id: substrateId },
      ).toPromise();
      const substrateData = queryResult?.data?.getSubstrate?.[0];
      if (!substrateData) return undefined;
      return Substrate.parse(substrateData);
    };

    const trialsWithFormulasResults = await Promise.allSettled(trials
      .filter((trial) => trial?.parentAppearanceSampleId) // Edge case, no parent
      .map(async (trial) => {
        const formulaSample = await getFormulaAppearanceSample(trial);
        const formula = formulaSample?.formula;
        if (!formula || !formulaSample) return undefined;

        const formulaSubstrate = await getSubstrate(formulaSample.substrateId);
        if (!formulaSubstrate) return undefined;

        const comparisonData = assembleMeasurementSamplesByCondition2(parameters.substrate.measurements, formulaSubstrate.measurements);
        if (comparisonData.length === 0) return undefined;
        const formulaSubstrateInfo = getSubstrateCalibrationInformation(formulaSubstrate);
        const selectedSubstrateInfo = getSubstrateCalibrationInformation(parameters.substrate);

        if (viewingConditions) {
          const sumDeltaE = comparisonData.reduce((acc, sampleData) => {
            return acc + deltaE2000(
              sampleData.standardMeasurementSample,
              sampleData.sampleMeasurementSample,
              viewingConditions[0].illuminant,
              viewingConditions[0].observer,
              { kc: 1, kl: 1, kh: 1 },
            );
          }, 0);

          const roughnessDifference = (formulaSubstrateInfo.roughnessPercentage || 0) - (selectedSubstrateInfo.roughnessPercentage || 0);
          const isRoughnessOutOfLimit = Math.abs(roughnessDifference) > ROUGHNESS_MAX_DIFFERENCE_PERCENTAGE;

          const averageDeltaE = sumDeltaE / comparisonData.length;
          if (averageDeltaE > DELTAE_MAX_SAMPLE_DIFFERENCE || isRoughnessOutOfLimit) {
            return undefined;
          }
        }
        const newSampleId = uuid();
        return [
          // This is the original trial with/without formula
          AppearanceSample.parse({
            ...trial,
            id: uuid(),
            parentAppearanceSampleId: newSampleId,
            standardId: selectedStandardId,
            measurements: trial.measurements.map(getMeasurementWithNewId),
            formula: trial.formula // the trial has it's own formula, then we keep it
              ? Formula.parse({
                ...trial.formula,
                id: uuid(),
                predictionMeasurements: trial.formula.predictionMeasurements.map(getMeasurementWithNewId),
              })
              : undefined,
          }),
          // This is the newly created parent formula
          AppearanceSample.parse({
            ...trial,
            id: newSampleId,
            measurements: [],
            parentAppearanceSampleId: undefined,
            standardId: selectedStandardId,
            formula: formula && Formula.parse({
              ...formula,
              id: uuid(),
              predictionMeasurements: formula.predictionMeasurements.map(getMeasurementWithNewId),
            }),
          }),
        ];
      }));

    trialsWithFormulasResults.forEach((promiseResult) => {
      if (promiseResult.status === 'rejected') {
        showToast(promiseResult.reason?.message, 'error');
      }
    });

    const trialsWithFormulas = trialsWithFormulasResults
      .filter((promiseResult): promiseResult is PromiseFulfilledResult<AppearanceSample[]> => promiseResult.status === 'fulfilled' && Boolean(promiseResult.value))
      .map((promiseResult) => promiseResult.value);

    // todo: this should be replaced when appropriate query for filtering is available
    // filter trials by key parameters
    const filteredResults = trialsWithFormulas.filter(([, newSample]) => {
      if (!newSample.formula?.formulaLayers[0]) return false;

      const { viscosity, relativeThickness } = newSample.formula.formulaLayers[0];
      if (
        newSample.formula.assortmentId !== parameters.assortment.id
        || newSample.substrateId !== parameters.substrate.id
        || !inRange(
          viscosity ?? 0,
          parameters.viscosity - ALLOWED_SAMPLE_VISCOSITY_RANGE,
          parameters.viscosity + ALLOWED_SAMPLE_VISCOSITY_RANGE + 0.0001, // end is exclusive
        )
        || !inRange(
          relativeThickness,
          parameters.relativeThicknessMin - ADDITIONAL_THICKNESS_RANGE,
          parameters.relativeThicknessMax + ADDITIONAL_THICKNESS_RANGE + 0.0001, // end is exclusive
        )
      ) { return false; }

      return true;
    });

    const originalTrials = filteredResults.map(([trial]) => trial);
    dispatch(setWorkingAppearanceSamples(originalTrials));

    return filteredResults;
  };

  const autoCorrectSamples = async (
    {
      samplesToCorrect,
      allAssortmentColorants,
      parameters,
    }: {
      samplesToCorrect: AppearanceSample[][];
      parameters: FormulationParameters;
      allAssortmentColorants: Colorant[];
    },
  ) => {
    const correctedSamplePromises = samplesToCorrect.map(async ([trial, sample]) => {
      const { formula } = sample;
      if (!formula) return undefined;
      const firstLayer = formula.formulaLayers[0];
      if (!firstLayer) return undefined;

      const isColorantPresent = (colorant: Colorant) => formula.formulaLayers.some(
        (layer) => layer.formulaComponents.some(
          (component) => component.colorant.id === colorant.id,
        ),
      );

      const formulaClears = allAssortmentColorants
        .filter(isColorantAClear)
        .filter(isColorantPresent);

      const clear = formulaClears.length > 0
        ? formulaClears[0]
        : allAssortmentColorants.find(({ id }) => id === parameters.clearId);
      if (!clear) return undefined;

      const colorants = allAssortmentColorants.filter(isColorantPresent);

      return correctSample(
        {
          formula,
          sample: trial,
          assortment: parameters.assortment,
          standard: selectedStandard,
          substrate: parameters.substrate,
          colorants,
          clear,
        },
        {
          allowRemoveColorantsForCorrection: true,
          correctionMode: 'New',
          maxAddPercentage: 100,
          opacityMaxPercent: parameters.opacityMaxPercent,
          opacityMinPercent: parameters.opacityMinPercent,
          opacityMode: parameters.opacityMode,
          recipeOutputMode: parameters.recipeOutputMode,
          relativeThicknessMax: parameters.relativeThicknessMax,
          relativeThicknessMin: parameters.relativeThicknessMin,
          targetViscosity: firstLayer.viscosity || 0,
          totalMode: parameters.totalMode,
          fixedColorantIds: [],
          additives: parameters.additives,
        },
      );
    });

    const correctedSamplePromiseResults = await Promise.allSettled(correctedSamplePromises);

    correctedSamplePromiseResults.forEach((promiseResult) => {
      if (promiseResult.status === 'rejected') {
        showToast(promiseResult.reason?.message, 'error');
      }
    });

    const correctedSamples = correctedSamplePromiseResults
      .filter((promiseResult): promiseResult is PromiseFulfilledResult<{ score: number, sample: AppearanceSample }> => (
        promiseResult.status === 'fulfilled'
      ))
      .filter((promiseResult) => promiseResult.value)
      .map((promiseResult) => ({
        ...promiseResult.value,
        sample: promiseResult.value.sample,
      }));

    return correctedSamples;
  };

  const selectBestResult = (results: ResultWithType[], trials?: AppearanceSample[]) => {
    if (!selectedStandard || !colorimetricConfiguration?.illuminants.primary || !colorimetricConfiguration?.observers.primary) return;

    const deltaE = colorimetricConfiguration?.metric.deltaE === 'dE76' ? getAverageDeltaE76 : getAverageDeltaE2000;
    const transformedResults = results.map((initialResult) => {
      const trial = trials?.find(({ parentAppearanceSampleId }) => initialResult.sample.id === parentAppearanceSampleId);
      const hasTrial = Boolean(trial?.measurements.length);

      if (!hasTrial || !trial) return initialResult;

      return {
        ...initialResult,
        sample: AppearanceSample.parse({
          ...initialResult.sample,
          measurements: trial.measurements,
        }),
      };
    });

    // make sure all the results have prediction measurements
    const filteredResults = transformedResults
      .map((r) => ({
        id: r.sample.id,
        predictionMeasurement: r.sample.measurements[0] ?? r.sample?.formula?.predictionMeasurements[0],
      }))
      .filter((r): r is { id: string, predictionMeasurement: Measurement } => r.predictionMeasurement !== null);

    const bestResult = sortBy(filteredResults, ({ predictionMeasurement }) => deltaE(
      selectedStandard?.measurements[0],
      predictionMeasurement,
      colorimetricConfiguration.illuminants.primary as IlluminantType,
      colorimetricConfiguration.observers.primary,
      { kc: 1, kl: 1, kh: 1 },
    ))[0];

    if (bestResult) dispatch(selectSampleId(bestResult.id));
  };

  const formulate = async (parameters: FormulationParameters) => {
    try {
      clearResults();
      setIsSearching(true);
      const {
        calibrationCondition, standard, substrate,
      } = parameters;

      const engineType = getEngineType(calibrationCondition.engineId);
      const connection = await getConnection(session.token, engineType);
      const formulationInput = createFormulationInput(parameters);

      const resultsMap: {
        searchResults?: {
          results: ResultWithType[],
          trials: AppearanceSample[]
        },
        correctedResults?: ResultWithType[],
        formulationResults?: ResultWithType[]
      } = {};

      const handleFormulationResults = async (resultsData: Unvalidated<FormulationResults>) => {
        setIsProcessing(true);
        setProgress(undefined);
        if (isFormulationResults(resultsData)) {
          // the formulation settings to be stored alongside with the CFDM Formula object
          const formulationSettings: FormulationSettings = {
            recipeOutputMode: parameters.recipeOutputMode,
            calibrationConditionId: calibrationCondition.id,
            engineId: calibrationCondition.engineId,
            targetViscosity: parameters.viscosity,
            totalMode: parameters.totalMode,
            selectedColorantIds: parameters.colorants.map(({ id }) => id),
            colorantRestrictions: parameters.colorants.map(
              ({ id, minConcentrationPercentage, maxConcentrationPercentage }) => ({
                id,
                minConcentrationPercentage,
                maxConcentrationPercentage,
              }),
            ),
            requiredColorantIds: parameters.requiredColorantIds,
            metricType: parameters.metricType,
            colorimetricSettings: parameters.colorimetricSettings,
            relativeThicknessMin: parameters.relativeThicknessMin,
            relativeThicknessMax: parameters.relativeThicknessMax,
            opacityMode: parameters.opacityMode,
            opacityMinPercent: parameters.opacityMinPercent,
            opacityMaxPercent: parameters.opacityMaxPercent,
            additives: parameters.additives,
            clearId: parameters.clearId,
            correctionMode: undefined,
          };
          const initialConvertedResults = convertFormulationResultsToAppearanceSamples({
            name: i18next.t('labels.recipe'),
            results: resultsData,
            assortmentId: parameters.assortment.id,
            standardId: standard.id,
            substrateId: substrate.id,
            calibrationCondition,
            formulationSettings,
            colorants: parameters.colorants,
            assortment: parameters.assortment,
            totalMode: parameters.totalMode,
            canSize: parameters.canSize,
            canUnit: parameters.canUnit,
          });

          // try to add additives to all recipes and see whether we need to change any entry
          const formulationResultsWithAdditiveChanges = await Promise.allSettled(
            initialConvertedResults.map(
              (initialResult) => modifyRecipeForAdditives(initialResult, parameters, connection),
            ),
          );

          const predictionErrors = formulationResultsWithAdditiveChanges.filter(
            (promiseResult): promiseResult is PromiseRejectedResult => promiseResult.status === 'rejected',
          ).map((promiseResult) => promiseResult.reason);

          if (predictionErrors.length) showToast(predictionErrors[0].message, 'error');
          if (predictionErrors.some((error) => error instanceof UnauthorizedError)) {
            dispatch(setSession());
          }

          const formulationResults = formulationResultsWithAdditiveChanges
            .filter((promiseResult): promiseResult is PromiseFulfilledResult<
                { score: number, sample: AppearanceSample }
              > => promiseResult.status === 'fulfilled')
            .map((promiseResult) => ({
              ...promiseResult.value,
              type: 'formulation' as const,
            }));

          resultsMap.formulationResults = formulationResults;

          const areAllResultsFinished = Object.keys(resultsMap).length === selectedSearchAndCorrectModes.length;
          if (areAllResultsFinished) {
            const searchResults = (resultsMap.searchResults || resultsMap.correctedResults)
              ? [
                ...(resultsMap.searchResults?.results || []),
                ...(resultsMap.correctedResults || []),
              ] : undefined;

            dispatch(setFormulationResultData({
              parameters: {
                assortmentId: parameters.assortment.id,
                substrateId: parameters.substrate.id,
                standardId: parameters.standard.id,
                recipeOutputMode: parameters.recipeOutputMode,
                targetViscosity: parameters.viscosity,
              },
              formulationResults,
              searchResults,
            }));

            selectBestResult(
              [
                ...formulationResults,
                ...(searchResults || []),
              ],
              resultsMap.searchResults?.trials,
            );
          }
          setIsProcessing(false);
        } else {
          showToast('Invalid formulation results data', 'error');
        }
      };

      if (selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.Off)) {
        setProgress(0.0001);

        connection.formulate(
          formulationInput,
          {
            error: handleError,
            progress: setProgress,
            results: handleFormulationResults,
          },
        );
      }

      let searchResultData: AppearanceSample[][] | undefined;

      if (selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.Search)) {
        searchResultData = await search(parameters);

        const searchResults = searchResultData.map(([, newSample]) => ({
          sample: newSample,
          score: 0,
          type: 'search' as const,
        }));
        const trials = searchResultData.map(([trial]) => trial);

        resultsMap.searchResults = {
          results: searchResults,
          trials,
        };
      }

      if (selectedSearchAndCorrectModes.includes(SearchAndCorrectMode.SearchAndCorrect)) {
        if (!searchResultData) searchResultData = await search(parameters);

        const correctedSamples = await autoCorrectSamples({
          samplesToCorrect: searchResultData,
          allAssortmentColorants: parameters.assortment.colorants,
          parameters,
        });

        const correctedResults = correctedSamples
          .filter((s): s is { score: number; sample: AppearanceSample; } => !!s)
          .map((correction) => ({
            ...correction,
            type: 'correction' as const,
          }));

        resultsMap.correctedResults = correctedResults;
      }

      const allResultsFinished = Object.keys(resultsMap).length === selectedSearchAndCorrectModes.length;
      if (allResultsFinished && (resultsMap.searchResults || resultsMap.correctedResults)) {
        const searchResults = [
          ...(resultsMap.searchResults?.results || []),
          ...(resultsMap.correctedResults || []),
        ];
        const formulationResults = resultsMap.formulationResults ? resultsMap.formulationResults : undefined;

        dispatch(setFormulationResultData({
          parameters: {
            assortmentId: parameters.assortment.id,
            substrateId: parameters.substrate.id,
            standardId: parameters.standard.id,
            recipeOutputMode: parameters.recipeOutputMode,
            targetViscosity: parameters.viscosity,
          },
          searchResults,
          formulationResults,
        }));

        selectBestResult(
          [
            ...searchResults,
            ...(resultsMap.formulationResults || []),
          ],
          resultsMap.searchResults?.trials,
        );
      }
    } catch (e) {
      showToast(`Error in formulation: ${e instanceof Error ? e.message : e}`, 'error');
    } finally {
      setProgress(undefined);
      setIsSearching(false);
      setIsProcessing(false);
    }
  };

  return {
    formulate,
    clearResults,
    progress: progress ?? 0,
    fetching: typeof progress !== 'undefined' || isSearching || isProcessing,
    result,
  };
};

export const useCorrection = () => {
  const [progress, setProgress] = useState<number>();
  const session = useSession();
  const results = useSelector((state) => state.correction.results);
  const { showToast } = useToast();

  const dispatch = useDispatch();

  const clearResults = () => {
    dispatch(setCorrectionResults(undefined));
  };

  const correct = async (parameters: CorrectionParameters): Promise<{
    score: number;
    sample: AppearanceSample;
  }[] | undefined> => {
    try {
      clearResults();
      setProgress(0.0001);

      const {
        calibrationCondition, standard, substrate, assortment,
      } = parameters;
      const engineType = getEngineType(calibrationCondition.engineId);
      const connection = await getConnection(session.token, engineType);
      const correctionInput = createCorrectionInput(parameters);
      const isIFS = isIFSEngine(engineType);
      const isIFSAdditionMode = isIFS && (parameters.correctionMode === 'Add');

      const result = new Promise<{
        score: number;
        sample: AppearanceSample;
      }[] | undefined>((resolve, reject) => {
        const handleError = (error: Error) => {
          setProgress(undefined);
          reject(error);
        };
        const handleResults = async (resultsData: Unvalidated<FormulationResults>) => {
          setProgress(undefined);
          if (isFormulationResults(resultsData)) {
            // the formulation settings to be stored alongside with the CFDM Formula object
            const formulationSettings: FormulationSettings = {
              recipeOutputMode: parameters.recipeOutputMode,
              calibrationConditionId: calibrationCondition.id,
              engineId: calibrationCondition.engineId,
              targetViscosity: parameters.viscosity,
              totalMode: parameters.totalMode,
              selectedColorantIds: parameters.colorants.map(({ id }) => id),
              colorantRestrictions: parameters.colorants.map(
                ({ id, minConcentrationPercentage, maxConcentrationPercentage }) => ({
                  id,
                  minConcentrationPercentage,
                  maxConcentrationPercentage,
                }),
              ),
              metricType: parameters.metricType,
              colorimetricSettings: parameters.colorimetricSettings,
              requiredColorantIds: parameters.fixedColorantIds,
              relativeThicknessMin: parameters.relativeThicknessMin,
              relativeThicknessMax: parameters.relativeThicknessMax,
              opacityMode: parameters.opacityMode,
              opacityMinPercent: parameters.opacityMinPercent,
              opacityMaxPercent: parameters.opacityMaxPercent,
              additives: parameters.additives,
              clearId: parameters.clearId,
              correctionMode: parameters.correctionMode,
            };
            const initialConvertedResults: {
              score: number;
              sample: AppearanceSample;
            }[] = convertFormulationResultsToAppearanceSamples({
              results: resultsData,
              name: i18next.t('labels.correction'),
              standardId: standard.id,
              parentAppearanceSampleId: parameters.trialSample.id,
              substrateId: substrate.id,
              calibrationCondition,
              assortmentId: assortment.id,
              additionFormula: isIFSAdditionMode
                ? parameters.formula
                : undefined,
              formulationSettings,
              colorants: parameters.colorants,
              assortment: parameters.assortment,
              totalMode: parameters.totalMode,
              canSize: parameters.canSize,
              canUnit: parameters.canUnit,
            });

            // try to add additives to all recipes and see whether we need to change any entry
            const correctionResultsWithAdditiveChanges = await Promise.allSettled(
              initialConvertedResults.map(
                (convertedResult) => modifyRecipeForAdditives(
                  convertedResult,
                  parameters,
                  connection,
                  isIFSAdditionMode ? parameters.formula : undefined,
                ),
              ),
            );

            const predictionErrors = correctionResultsWithAdditiveChanges.filter(
              (promiseResult): promiseResult is PromiseRejectedResult => promiseResult.status === 'rejected',
            ).map((promiseResult) => promiseResult.reason);

            if (predictionErrors.length) showToast(predictionErrors[0].message, 'error');
            if (predictionErrors.some((error) => error instanceof UnauthorizedError)) {
              dispatch(setSession());
            }

            const convertedResults = correctionResultsWithAdditiveChanges
              .filter((promiseResult): promiseResult is PromiseFulfilledResult<
                  { score: number, sample: AppearanceSample }
                > => promiseResult.status === 'fulfilled')
              .map((promiseResult) => ({
                ...promiseResult.value,
                type: 'formulation' as const,
              }));

            const topResult = convertedResults[0].sample;
            dispatch(selectSampleId(topResult.id));

            resolve(convertedResults);
          } else {
            reject(new Error('Invalid correction results data'));
          }
        };

        connection.correct(
          correctionInput,
          {
            error: handleError,
            progress: setProgress,
            results: handleResults,
          },
        );
      });
      return result;
    } catch (e) {
      showToast(`Error in correction: ${e instanceof Error ? e.message : e}`, 'error');
    }
    return undefined;
  };

  return {
    correct,
    clearResults,
    progress: progress ?? 0,
    fetching: typeof progress !== 'undefined',
    results,
  };
};

export const usePrediction = () => {
  const [progress, setProgress] = useState<number>();
  const session = useSession();
  const { showToast } = useToast();

  const dispatch = useDispatch();

  const predict = async (parameters: PredictionParameters) => {
    const {
      calibrationCondition,
    } = parameters;

    const engineType = getEngineType(calibrationCondition.engineId);
    const connection = await getConnection(session.token, engineType);

    return new Promise<Measurement[] | undefined>((resolve, reject) => {
      const predictInput = createPredictionInput(parameters);
      setProgress(0.0001);
      const handleError = (error: Error) => {
        showToast(error.message, 'error');
        setProgress(undefined);
        if (error instanceof UnauthorizedError) {
          dispatch(setSession());
        }
      };

      const handleResults = (resultsData: Unvalidated<PredictionResults>) => {
        if (isPredictionResults(resultsData)) {
          const convertedResults = convertPredictionResultsToAppearanceSamples({
            results: resultsData,
            ...parameters,
          });
          resolve(convertedResults);
        } else {
          reject(showToast('Invalid prediction data', 'error'));
        }
      };

      connection.predict(
        predictInput,
        {
          error: handleError,
          progress: setProgress,
          results: handleResults,
        },
      );
    });
  };

  return {
    predict,
    progress: progress ?? 0,
    fetching: typeof progress !== 'undefined',
  };
};

export const useCalibration = () => {
  const [progress, setProgress] = useState<number>();
  const session = useSession();
  const dispatch = useDispatch();

  const { showToast } = useToast();

  const calibrate = async (parameters: CalibrationParameters) => {
    const engineType = getEngineType(parameters.calibrationCondition.engineId);
    const connection = await getConnection(session.token, engineType);

    const result = new Promise<Colorant[] | undefined>((resolve, reject) => {
      const calibrationInput = createCalibrationInput(parameters);
      setProgress(0.0001);
      const handleError = (error: Error) => {
        showToast(error.message, 'error');
        setProgress(undefined);
        if (error instanceof UnauthorizedError) {
          dispatch(setSession());
        }
      };

      const handleResults = (resultsData: Unvalidated<CalibrationResults>) => {
        if (isCalibrationResults(resultsData)) {
          const convertedResults = convertCalibrationResultsToColorants({
            calibrationResults: resultsData,
            ...parameters,
          });
          resolve(convertedResults);
        } else {
          reject(showToast('Invalid calibration data', 'error'));
        }
      };

      connection.calibrate(
        calibrationInput,
        {
          error: handleError,
          progress: setProgress,
          results: handleResults,
        },
      );
    });

    return result;
  };

  return {
    calibrate,
    progress: progress ?? 0,
    fetching: typeof progress !== 'undefined',
  };
};
