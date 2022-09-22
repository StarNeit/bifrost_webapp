import { useSelector } from 'react-redux';
import {
  AppearanceSample,
  BackingType,
  Colorant,
  IlluminantType,
  Measurement,
  MeasurementSample,
  ObserverType,
  Assortment,
  Standard,
  SpectralSampling,
} from '@xrite/cloud-formulation-domain-model';
import type { CombinedError } from '@urql/core';
import { v4 as uuid } from 'uuid';
import isString from 'lodash/isString';
import { RGB } from '@xrite/colorimetry-js';

import { ReflectanceCondition, ViewingCondition } from '../types/layout';
import { useAppearanceSample, useStandard, useSubstrate } from '../data/api/cfdb';
import { getCustomSortingNumber, useStandardId } from '../data/common';
import {
  calculateLabCh,
  calculatePreviewRGB,
  deltaE2000 as getDeltaE2000,
  deltaE76 as getDeltaE76,
  getAverageDeltaE2000,
  getAverageDeltaE76,
  getLabchValues,
  isMeasurementSampleSupported,
} from '../utils/colorimetry';
import {
  computeDeltaReflectance,
  toSpectralData,
  transformToKS,
  getAllWavelengths,
  getViewingConditionLabel,
  getCalibrationParameterScalarValue,
  getCurrencySymbol,
  isMeasurementMultiAngle,
  isRecipeOutputMode,
} from '../utils/utils';
import { SwatchSet } from '../types/formulation';
import { EmptyObject } from '../types/component';
import { defaultGravimetricUnit, getOutputRecipe } from '../utils/utilsRecipe';
import { RecipeOutputMode } from '../types/recipe';
import { ResultType } from '../data/reducers/formulation';
import { useSelectedAppearanceSample } from '../utils/utilsSamples';
import {
  deriveDefaultSampleFromSamples,
  getAllSamplesFromMeasurements,
  getMeasurementConditionDescription,
  getPreviewMeasurement,
  getSampleForCondition,
  getSampleForConditionFromMeasurements,
} from '../utils/utilsMeasurement';
import { DescribedMeasurementCondition, SamplesDataForCondition } from '../types/measurement';
import { SortingCriterion } from '../data/api/uss/formulation/types';

export type SampleInfo = {
  id: string,
  name: string,
};

type SamplesData = {
  sampleInfos: SampleInfo[],
  data: SamplesDataForCondition[],
}

export function assembleMeasurementSamplesByCondition(
  standardMeasurements: Measurement[] | undefined,
  appearanceSamples?: AppearanceSample[],
  noOverBlack?: boolean,
): SamplesData {
  const sampleInfos = appearanceSamples?.reduce((acc, sample) => {
    return [...acc, { id: sample?.id, name: sample?.name }];
  }, [] as {
    id: string,
    name: string,
  }[]);

  // retrieve list of possible measurement conditions from the standards measurements
  const standardMeasurementSamples = getAllSamplesFromMeasurements(
    standardMeasurements,
    noOverBlack,
  );

  const measurementConditions = standardMeasurementSamples
    .reduce((acc: DescribedMeasurementCondition[],
      sample: MeasurementSample): DescribedMeasurementCondition[] => {
      const condition = sample.measurementCondition;
      const description = getMeasurementConditionDescription(condition);
      if (!condition) return acc;
      return [...acc, { description, condition }];
    }, [] as DescribedMeasurementCondition[]);

  // now cycle through the measurement conditions
  // and collect standard and samples measurement samples
  // that are compatible with the respective condition
  const data = measurementConditions.reduce(
    (acc: SamplesDataForCondition[], namedCondition): SamplesDataForCondition[] => {
      const standardMeasurementSample = getSampleForCondition(
        standardMeasurementSamples,
        namedCondition.condition,
      );
      if (!standardMeasurementSample) return acc;
      const samplesMeasurementSamples = appearanceSamples?.reduce(
        (acc2, appearanceSample): MeasurementSample[] => {
          const sampleMeasurements = ((appearanceSample.measurements?.[0]
            ? appearanceSample.measurements
            : appearanceSample?.formula?.predictionMeasurements)) || [];
          const sampleMeasurementsNoOverBlack = sampleMeasurements
            .filter((measurement) => measurement.backing !== BackingType.Black);
          const samplesMeasurementSample = getSampleForConditionFromMeasurements(
            sampleMeasurementsNoOverBlack,
            namedCondition.condition,
          );

          if (!samplesMeasurementSample) return acc2;
          return [...acc2, samplesMeasurementSample];
        },
        [] as MeasurementSample[],
      ) ?? [];
      const dataForCond = {
        condition: namedCondition,
        standardMeasurementSample,
        samplesMeasurementSamples,
      };
      return [...acc, dataForCond];
    },
    [] as SamplesDataForCondition[],
  );

  return { sampleInfos: sampleInfos ?? [], data };
}

export type SampleDataForCondition = {
  condition: DescribedMeasurementCondition,
  standardMeasurementSample: MeasurementSample,
  sampleMeasurementSample: MeasurementSample,
};

export function assembleMeasurementSamplesByCondition2(
  standardMeasurements: Measurement[] | undefined,
  sampleMeasurements: Measurement[] | undefined,
): SampleDataForCondition[] {
  // retrieve list of possible measurement conditions from the standards measurements
  const standardMeasurementSamples = getAllSamplesFromMeasurements(
    standardMeasurements,
    false,
  );

  const measurementConditions = standardMeasurementSamples
    .reduce((acc: DescribedMeasurementCondition[],
      sample: MeasurementSample): DescribedMeasurementCondition[] => {
      const condition = sample.measurementCondition;
      const description = getMeasurementConditionDescription(condition);
      if (!condition) return acc;
      return [...acc, { description, condition }];
    }, [] as DescribedMeasurementCondition[]);

  return measurementConditions.reduce(
    (acc: SampleDataForCondition[], namedCondition): SampleDataForCondition[] => {
      const standardMeasurementSample = getSampleForCondition(
        standardMeasurementSamples,
        namedCondition.condition,
      );
      if (!standardMeasurementSample) return acc;
      const sampleMeasurementSample = getSampleForConditionFromMeasurements(
        sampleMeasurements,
        namedCondition.condition,
      );
      if (!sampleMeasurementSample) return acc;
      const dataForCond = {
        condition: namedCondition,
        standardMeasurementSample,
        sampleMeasurementSample,
      };
      return [...acc, dataForCond];
    },
    [] as SampleDataForCondition[],
  );
}

export type SampleTransform<Result> = (
  condition: DescribedMeasurementCondition,
  standardName: string,
  standardSample: MeasurementSample,
  sampleInfo?: SampleInfo,
  sampleSample?: MeasurementSample) => Result | undefined;

export type TransformedSamplesDataForCondition<Result> = {
  condition: DescribedMeasurementCondition,
  standardData?: Result,
  samplesData: Result[],
}

export type AvailableMeasurementConditions = {
  measurementConditions: string[] | undefined,
  standardFetching: boolean,
  standardError?: CombinedError | Error,
}

export type TransformedSamplesData<Result> = {
  sampleInfos: SampleInfo[],
  data: TransformedSamplesDataForCondition<Result>[],
  availableMeasurementConditions: string[],
  selectedStandard?: Standard,
  standardFetching: boolean,
  standardError?: CombinedError | Error,
}

export type TransformedNewStandardData<Result> = {
  data: TransformedSamplesDataForCondition<Result>[],
  availableMeasurementConditions: string[],
}

export type StandardDataEntry = {
  name: string,
  id?: string,
  L?: number,
  a?: number,
  b?: number,
  C?: number,
  h?: number,
}

export type StandardData = Array<StandardDataEntry>;

export type SampleData = Partial<StandardDataEntry> & {
  dL?: number,
  dA?: number,
  dB?: number,
  dC?: number,
  dH?: number,
  dE00?: number,
  dE76?: number,
};

export type ViewingConditions = Record<
  string, Array<StandardDataEntry | SampleData>
>;
export type Conditions = Record<string, StandardData | SampleData>;

export type ColorData = Record<string, ViewingConditions>

type ViewingConditionSample = Record<string, SampleData>;
type ViewingConditionStandard = Record<string, StandardData>

export function getSamplesDataWithTransform<Result>(
  standardName: string | undefined,
  standardMeasurements: Measurement[] | undefined,
  appearanceSamples: AppearanceSample[],
  transform: SampleTransform<Result>,
): {
  sampleInfos: SampleInfo[],
  data: TransformedSamplesDataForCondition<Result>[],
} {
  // first get the data per condition
  const rawData = assembleMeasurementSamplesByCondition(
    standardMeasurements,
    appearanceSamples,
  );

  // now transform the data per condition
  const data = rawData.data.reduce(
    (acc, dataForCondition): TransformedSamplesDataForCondition<Result>[] => {
      // the data for the standard is transformed without a sample
      const standardData = transform(
        dataForCondition.condition,
        standardName ?? 'Standard',
        dataForCondition.standardMeasurementSample,
      );
      // then for every sample the standard is also passed to the transform
      // so that it can compute any kind of difference
      const samplesData = dataForCondition.samplesMeasurementSamples.map(
        (sample, index) => transform(
          dataForCondition.condition,
          standardName ?? 'Standard',
          dataForCondition.standardMeasurementSample,
          rawData.sampleInfos[index],
          sample,
        ),
      );
      // if any sample failed to compute we dismiss the full condition
      if (samplesData.some((x) => !x)) return acc;
      // otherwise add the transformed data to the final result
      const transformedData = {
        condition: dataForCondition.condition,
        standardData,
        samplesData: samplesData as Result[],
      };
      return transformedData ? [...acc, transformedData] : acc;
    },
    [] as TransformedSamplesDataForCondition<Result>[],
  );

  return {
    sampleInfos: rawData.sampleInfos,
    data,
  };
}

export function getAvailableMeasurementConditions<Result = EmptyObject>(
  data: (SamplesDataForCondition | TransformedSamplesDataForCondition<Result>)[],
) {
  return data.reduce((acc, d): string[] => {
    if (!d?.condition?.description) return acc;
    if (acc.includes(d.condition.description)) return acc;
    return [...acc, d.condition.description];
  }, [] as string[]);
}

function getSingleSample(
  selectedSampleId?: string,
  savedAppearanceSamples?: AppearanceSample[],
  mergedFormulationAppearanceSamples?: AppearanceSample[],
  mergedCorrectionAppearanceSamples?: AppearanceSample[],
) {
  const selectedSavedAppearanceSample = savedAppearanceSamples
    ?.find(({ id }) => (id === selectedSampleId));
  const selectedFormulationAppearanceSample = mergedFormulationAppearanceSamples
    ?.find(({ parentAppearanceSampleId, id }) => (
      parentAppearanceSampleId === selectedSampleId || id === selectedSampleId));
  const selectedCorrectionAppearanceSample = mergedCorrectionAppearanceSamples
    ?.find(({ parentAppearanceSampleId, id }) => (
      parentAppearanceSampleId === selectedSampleId || id === selectedSampleId));

  if (selectedSavedAppearanceSample) {
    return [selectedSavedAppearanceSample];
  }
  if (selectedFormulationAppearanceSample) {
    return [selectedFormulationAppearanceSample];
  }
  if (selectedCorrectionAppearanceSample) {
    return [selectedCorrectionAppearanceSample];
  }
  return [] as AppearanceSample[];
}

function getMultiSample(
  selectedSampleId?: string,
  savedAppearanceSamples?: AppearanceSample[],
  mergedFormulationAppearanceSamples?: AppearanceSample[],
  mergedCorrectionAppearanceSamples?: AppearanceSample[],
) {
  const selectedFormulationAppearanceSample = mergedFormulationAppearanceSamples
    ?.find(({ parentAppearanceSampleId, id }) => (
      parentAppearanceSampleId === selectedSampleId || id === selectedSampleId));
  const selectedCorrectionAppearanceSample = mergedCorrectionAppearanceSamples
    ?.find(({ parentAppearanceSampleId, id }) => (
      parentAppearanceSampleId === selectedSampleId || id === selectedSampleId));

  if (mergedFormulationAppearanceSamples && selectedFormulationAppearanceSample) {
    return mergedFormulationAppearanceSamples;
  }
  if (mergedCorrectionAppearanceSamples && selectedCorrectionAppearanceSample) {
    return mergedCorrectionAppearanceSamples;
  }
  if (savedAppearanceSamples) {
    return savedAppearanceSamples;
  }
  return [] as AppearanceSample[];
}

function useAppearanceSamples(multiSample: boolean, selectedStandardId?: string) {
  const formulationResults = useSelector(
    (state) => state.formulation.result?.formulationResults,
  ) || [];
  const searchResults = useSelector(
    (state) => state.formulation.result?.searchResults,
  ) || [];
  const mergedFormulationResults = [...searchResults, ...formulationResults];
  const correctionResults = useSelector((state) => state.correction.results) || [];
  const selectedSampleId = useSelector((state) => state.common.selectedSampleId);
  const {
    result: savedAppearanceSamples,
  } = useAppearanceSample({ query: { parentId: selectedStandardId } });
  const workingAppearanceSamples = useSelector((state) => state.common.workingAppearanceSamples);

  const formulationAppearanceSamples = mergedFormulationResults.map(({ sample }) => sample);
  const correctionAppearanceSamples = correctionResults.map(({ sample }) => sample);

  const appearanceSamples = multiSample
    ? getMultiSample(
      selectedSampleId,
      savedAppearanceSamples,
      formulationAppearanceSamples,
      correctionAppearanceSamples,
    )
    : getSingleSample(
      selectedSampleId,
      savedAppearanceSamples,
      formulationAppearanceSamples,
      correctionAppearanceSamples,
    );

  const combinedSavedSamples = appearanceSamples?.map((savedSample) => {
    const workingSample = workingAppearanceSamples.find(
      ({ id }) => (
        id === savedSample.id
      ),
    );
    return (
      workingSample && workingSample?.formula?.predictionMeasurements?.length
    ) ? workingSample : savedSample;
  });

  return combinedSavedSamples;
}

export function useSamplesDataForSwatch(
  multiSample: boolean,
) {
  // get standard
  const { selectedStandardId } = useStandardId();
  const {
    result: selectedStandard,
    fetching: standardFetching,
    error: standardError,
  } = useStandard({ id: selectedStandardId });

  const appearanceSamples = useAppearanceSamples(multiSample, selectedStandardId);

  const rawData = assembleMeasurementSamplesByCondition(
    selectedStandard?.measurements,
    appearanceSamples,
  );

  const availableMeasurementConditions = getAvailableMeasurementConditions(rawData.data);

  const swatchColors: SwatchSet[] = rawData.data.filter(
    ({ standardMeasurementSample }) => isMeasurementSampleSupported(standardMeasurementSample),
  ).map(
    (item) => ({
      colorOfStandard: calculatePreviewRGB(item.standardMeasurementSample),
      colorOfRecipe: item.samplesMeasurementSamples[0]
        ? calculatePreviewRGB(item.samplesMeasurementSamples[0])
        : undefined,
      condition: item.condition.description,
    }),
  );

  return {
    sampleInfos: rawData.sampleInfos,
    data: rawData.data,
    swatchColors,
    availableMeasurementConditions,
    standardFetching,
    standardError,
  };
}

export function useSubstrateDataForSwatch() {
  const { selectedSample } = useSelectedAppearanceSample();

  const {
    result: selectedSubstrate,
    fetching: substrateFetching,
    error: substrateError,
  } = useSubstrate(selectedSample?.substrateId);

  const rawData = assembleMeasurementSamplesByCondition(
    selectedSubstrate?.measurements,
  );

  const availableMeasurementConditions = getAvailableMeasurementConditions(rawData.data);

  const swatchColors = rawData.data.filter(
    ({ standardMeasurementSample }) => isMeasurementSampleSupported(standardMeasurementSample),
  ).map(
    (item) => ({
      colorOfSubstrate: calculatePreviewRGB(item.standardMeasurementSample),
      condition: item.condition.description,
    }),
  );

  return {
    sampleInfos: rawData.sampleInfos,
    data: rawData.data,
    swatchColors,
    availableMeasurementConditions,
    substrateFetching,
    substrateError,
  };
}

export function useSamplesDataMainPages<Result>(
  multiSample: boolean,
  transform: SampleTransform<Result>,
): TransformedSamplesData<Result> {
  // get standard
  const { selectedStandardId } = useStandardId();
  const {
    result: selectedStandard,
    fetching: standardFetching,
    error: standardError,
  } = useStandard({ id: selectedStandardId });

  const appearanceSamples = useAppearanceSamples(multiSample, selectedStandardId);
  const workingSamples = useSelector((state) => state.common.workingAppearanceSamples);

  const transformedSamples = appearanceSamples.map((sample) => {
    const workingSample = workingSamples.find(
      ({ parentAppearanceSampleId }) => parentAppearanceSampleId === sample.id,
    );
    const hasTrial = Boolean(workingSample?.measurements.length);
    const hasEditedFormula = Boolean(workingSample?.formula);

    if (hasTrial && workingSample) {
      // if recipe has trial add the measurements from that trial
      return AppearanceSample.parse({
        ...sample,
        measurements: workingSample.measurements,
      });
    }
    if (hasEditedFormula && workingSample) {
      // if there is an edited recipe, include the prediction for it
      return AppearanceSample.parse({
        ...sample,
        formula: workingSample.formula,
      });
    }
    return sample;
  });

  const transformedData = getSamplesDataWithTransform<Result>(
    selectedStandard?.name,
    selectedStandard?.measurements,
    transformedSamples,
    transform,
  );

  const availableMeasurementConditions = getAvailableMeasurementConditions(transformedData.data);

  return {
    ...transformedData,
    availableMeasurementConditions,
    selectedStandard,
    standardFetching,
    standardError,
  };
}

export function getTransformedDataForModalWidget<Result>(
  newStandardMeasurement: Measurement | undefined,
  transform: SampleTransform<Result>,
  newStandardName?: string,
) {
  if (!newStandardMeasurement) return undefined;
  const appearanceSamples = [] as AppearanceSample[];

  const transformedData = getSamplesDataWithTransform<Result>(
    newStandardName,
    [newStandardMeasurement],
    appearanceSamples,
    transform,
  );

  const availableMeasurementConditions = getAvailableMeasurementConditions(transformedData.data);

  return {
    ...transformedData,
    availableMeasurementConditions,
  };
}

export function getStandardDataNewStandard<Result>(
  newStandardMeasurement: Measurement | undefined,
  transform: SampleTransform<Result>,
  newStandardName?: string,
) {
  if (!newStandardMeasurement) return undefined;
  // TODO remove sample...allows functions to work since they need a sample
  const appearanceSamples = [] as AppearanceSample[];

  const transformedData = getSamplesDataWithTransform<Result>(
    newStandardName,
    [newStandardMeasurement],
    appearanceSamples,
    transform,
  );

  const availableMeasurementConditions = getAvailableMeasurementConditions(transformedData.data);

  return {
    ...transformedData,
    availableMeasurementConditions,
  };
}

export function getStandardDataSearchStandard<Result>(
  newStandard: Standard,
  targetMeasurementSamples: MeasurementSample[],
  transform: SampleTransform<Result>,
): ViewingConditionSample | undefined {
  const newStandardMeasurementsSamples = getAllSamplesFromMeasurements(
    newStandard.measurements, false,
  );

  const defaultMeasurementSample = deriveDefaultSampleFromSamples(newStandardMeasurementsSamples);

  const targetMeasurementSample = deriveDefaultSampleFromSamples(targetMeasurementSamples);

  const condition = {
    condition: targetMeasurementSample.measurementCondition,
    description: getMeasurementConditionDescription(targetMeasurementSample.measurementCondition),
  };

  return transform(condition, newStandard.name, targetMeasurementSample, { id: '', name: '' } as SampleInfo, defaultMeasurementSample) as ViewingConditionSample | undefined;
}

export function toColorDataTableTransform(
  condition: DescribedMeasurementCondition,
  viewingConditions: ViewingCondition[],
  standardName?: string,
  standardSample?: MeasurementSample,
  sampleInfo?: SampleInfo,
  sampleSample?: MeasurementSample,
) {
  if (standardSample && !isMeasurementSampleSupported(standardSample)) return undefined;
  if (!sampleSample && standardSample && condition?.description) {
    return viewingConditions.reduce((acc, viewingCondition): ViewingConditionStandard => {
      const labch = calculateLabCh(
        standardSample,
        viewingCondition.illuminant,
        viewingCondition.observer,
      );
      const label = getViewingConditionLabel(viewingCondition);
      acc[label] = [{
        name: standardName ?? 'Standard',
        id: uuid(),
        L: labch.lab[0],
        a: labch.lab[1],
        b: labch.lab[2],
        C: labch.C,
        h: labch.h,
      }];
      return acc;
    }, {} as ViewingConditionStandard);
  }

  if (sampleSample && standardSample) {
    if (!isMeasurementSampleSupported(sampleSample)) return undefined;
    return viewingConditions.reduce((acc, viewingCondition): ViewingConditionSample => {
      const labch = getLabchValues(
        sampleSample,
        standardSample,
        viewingCondition.illuminant,
        viewingCondition.observer,
      );
      const dE00 = getDeltaE2000(
        standardSample,
        sampleSample,
        viewingCondition.illuminant,
        viewingCondition.observer,
        { kc: 1, kh: 1, kl: 1 },
      );
      const dE76 = getDeltaE76(
        standardSample,
        sampleSample,
        viewingCondition.illuminant,
        viewingCondition.observer,
      );
      if (!labch && !dE00) return acc;
      const label = getViewingConditionLabel(viewingCondition);
      acc[label] = {
        name: sampleInfo?.name,
        id: uuid(),
        L: labch?.l,
        a: labch?.a,
        b: labch?.b,
        C: labch?.C,
        h: labch?.h,
        dL: labch?.dL,
        dA: labch?.dA,
        dB: labch?.dB,
        dC: labch?.dC,
        dH: labch?.dH,
        dE00,
        dE76,
      };
      return acc;
    }, {} as ViewingConditionSample);
  }

  return undefined;
}

export function getColorTableData(
  allColorData:
    TransformedSamplesDataForCondition<Conditions>[],
  measurementConditions: string[],
  viewingConditions: ViewingCondition[],
) {
  const filteredColorData = allColorData?.filter(
    (dataEntry) => measurementConditions.find((x) => x === dataEntry.condition.description),
  );

  return filteredColorData.reduce((colorData, measureConditionData): ColorData => {
    const measureCondition = measureConditionData.condition.description;
    if (!measureConditionData?.standardData) return colorData;

    // eslint-disable-next-line no-param-reassign
    colorData[measureCondition] = {
      ...measureConditionData.standardData,
    } as ViewingConditionStandard;

    if (measureConditionData?.samplesData) {
      measureConditionData.samplesData?.forEach((sampleData) => {
        viewingConditions.forEach((viewingCondition) => {
          const currentViewingCondition = getViewingConditionLabel(viewingCondition);
          const sample = sampleData[currentViewingCondition] as ViewingConditionSample;
          const viewingConditionList = colorData[measureCondition][currentViewingCondition];
          viewingConditionList.push(sample);
        });
      });
    }

    return colorData;
  }, {} as ColorData);
}

type SpectralData = {
  id?: string;
  name: string;
  spectralValues: number[];
  sampling: SpectralSampling;
};

type ColorSwatchData = {
  id?: string;
  name?: string;
  sample: MeasurementSample;
};

export function toColorSwatchDataTransform(
  condition: DescribedMeasurementCondition,
  standardName?: string,
  standardSample?: MeasurementSample,
  sampleSample?: MeasurementSample,
  sampleInfo?: SampleInfo,
) {
  if (sampleSample) return { sample: sampleSample, name: sampleInfo?.name, id: sampleInfo?.id };
  if (standardSample) return { sample: standardSample, name: `${standardName}-${condition.description}`, id: sampleInfo?.id };
  return undefined;
}

export function toSpectralDataTransform(
  condition: DescribedMeasurementCondition,
  reflectanceCondition: number,
  standardName?: string,
  standardSample?: MeasurementSample,
  sampleInfo?: SampleInfo,
  sampleSample?: MeasurementSample,
): SpectralData | undefined {
  switch (reflectanceCondition) {
    case ReflectanceCondition.R: {
      if (sampleSample) {
        const result = toSpectralData(sampleSample, `${sampleInfo?.name || ''}-${condition.description}`);
        if (result) {
          return {
            ...result,
            id: sampleInfo?.id,
          };
        }
        break;
      }
      if (standardSample) return toSpectralData(standardSample, `${standardName}-${condition.description}`);
      break;
    }
    case ReflectanceCondition.KS: {
      if (sampleSample) {
        const result = transformToKS(toSpectralData(sampleSample, `${sampleInfo?.name || ''}-${condition.description}`));
        if (result) {
          return {
            ...result,
            id: sampleInfo?.id,
          };
        }
        break;
      }
      if (standardSample) return transformToKS(toSpectralData(standardSample, `${standardName}-${condition.description}`));
      break;
    }

    case ReflectanceCondition.DeltaR: {
      if (standardSample && sampleSample) {
        const standardData = toSpectralData(standardSample, `${standardName}-${condition.description}`);
        const sampleData = toSpectralData(sampleSample, `${sampleInfo?.name || ''}-${condition.description}`);
        if (standardData && sampleData) {
          const delta = computeDeltaReflectance(
            standardData.spectralValues,
            standardData.sampling,
            sampleData.spectralValues,
            sampleData.sampling,
          );

          return {
            id: sampleInfo?.id,
            name: sampleData.name,
            spectralValues: delta.spectrum,
            sampling: delta.sampling,
          };
        }
      }
      break;
    }

    default:
      break;
  }
  return undefined;
}

type CurveData = {
  id?: string;
  name: string,
  wavelengths: number[],
  spectralValues: number[],
};

export function getSpectralGraphData(
  spectralData: TransformedSamplesDataForCondition<SpectralData>[],
  measurementConditions: string[],
  selectedSampleId?: string,
) {
  const filteredSpectralData = spectralData.filter(
    (dataEntry) => measurementConditions.find((x) => x === dataEntry.condition.description),
  );

  const legendData: { name: string }[] = [];

  const allSpectralCurves = filteredSpectralData.reduce(
    (acc: CurveData[], data: TransformedSamplesDataForCondition<SpectralData>): CurveData[] => {
      if (data.standardData) {
        acc.push({
          ...data.standardData,
          wavelengths: getAllWavelengths(data.standardData.sampling),
        });
        legendData.push({ name: data.standardData.name });
      }
      data.samplesData.forEach((sampleData) => {
        acc.push({
          ...sampleData,
          wavelengths: getAllWavelengths(sampleData.sampling),
        });
        if (sampleData.id === selectedSampleId) {
          legendData.push({ name: sampleData.name });
        }
      });
      return acc;
    },
    [] as CurveData[],
  );

  return { allSpectralCurves, legendData };
}

export type FormulationResultsTableRowData = {
  id: string,
  type?: ResultType,
  name: string,
  score: number,
  colors?: RGB[],
  deltaE76?: number,
  deltaE2000?: number,
  numberOfComponents: number,
  price: number,
  currency: string,
  custom?: number,
}

export function getColorSwatchData(
  colorSwatchData?: TransformedSamplesDataForCondition<ColorSwatchData>[],
  measurementConditions?: string[],
  selectedStandardName?: string,
) {
  const filteredSwatchData = colorSwatchData?.filter(
    (dataEntry) => measurementConditions?.find((x) => x === dataEntry.condition.description),
  ) || [];
  const recipeIds: string[] = [selectedStandardName ?? 'Standard'];
  const recipeNames: string[] = [selectedStandardName ?? 'Standard'];
  const conditions: string[] = [];
  filteredSwatchData.forEach((item) => {
    item.samplesData.forEach((sampleData) => {
      if (sampleData?.id && !recipeIds.includes(sampleData?.id)) {
        recipeIds.push(sampleData?.id);
        recipeNames.push(sampleData?.name || '');
      }
    });
  });
  const colorPixelData = new Array(filteredSwatchData.length);
  filteredSwatchData.forEach((item, index) => {
    colorPixelData[index] = [];
    colorPixelData[index].push(
      item.standardData ? calculatePreviewRGB(item.standardData.sample) : undefined,
    );
    recipeIds.slice(1).forEach((recipeId) => {
      let colorSample;
      item.samplesData.forEach((sampleData) => {
        if (sampleData.id === recipeId) {
          colorSample = sampleData.sample;
        }
      });
      colorPixelData[index].push(
        colorSample ? calculatePreviewRGB(colorSample) : undefined,
      );
    });
    conditions.push(item.condition.description);
  });
  return {
    sampleConditions: conditions,
    sampleNames: recipeNames,
    sampleIds: recipeIds,
    swatchColors: colorPixelData,
  };
}

type DEParameters = {
  kc: number;
  kh: number;
  kl: number;
}

export const getResultTableData = (
  {
    illuminant,
    observer,
    results,
    standardMeasurements,
    assortment,
    colorants,
    isFormulation,
    parameters,
    sortingCriteria,
  }: {
    standardMeasurements: Measurement[];
    results: {
      sample: AppearanceSample;
      score: number;
      type?: ResultType;
    }[];
    illuminant: IlluminantType;
    observer: ObserverType;
    colorants?: Colorant[];
    assortment?: Assortment;
    parameters?: DEParameters,
    isFormulation?: boolean;
    sortingCriteria?: SortingCriterion[],
  },
) => results.map((result) => {
  const { id, name, formula } = result.sample;

  const standardMeasurement = getPreviewMeasurement(standardMeasurements);

  const hasMeasurements = Boolean(result.sample.measurements.length);
  const sampleMeasurement = getPreviewMeasurement(
    (hasMeasurements && isFormulation)
      ? result.sample.measurements
      : result.sample.formula?.predictionMeasurements,
  );

  let deltaE76;
  let deltaE2000;
  if (sampleMeasurement && standardMeasurement) {
    deltaE76 = isMeasurementMultiAngle(sampleMeasurement)
      ? getAverageDeltaE76(
        standardMeasurement,
        sampleMeasurement,
        illuminant,
        observer,
      ) : getDeltaE76(
        standardMeasurement.measurementSamples[0],
        sampleMeasurement.measurementSamples[0],
        illuminant,
        observer,
      );
    deltaE2000 = isMeasurementMultiAngle(sampleMeasurement)
      ? getAverageDeltaE2000(
        standardMeasurement,
        sampleMeasurement,
        illuminant,
        observer,
        parameters ?? { kc: 1, kl: 1, kh: 1 },
      ) : getDeltaE2000(
        standardMeasurement.measurementSamples[0],
        sampleMeasurement.measurementSamples[0],
        illuminant,
        observer,
        parameters ?? { kc: 1, kl: 1, kh: 1 },
      );
  }

  const rowData: FormulationResultsTableRowData = {
    id,
    type: result.type,
    name,
    score: result.score,
    colors: sampleMeasurement
      ? sampleMeasurement.measurementSamples.map(calculatePreviewRGB)
      : undefined,
    deltaE76,
    deltaE2000,
    numberOfComponents: formula?.formulaLayers[0].formulaComponents.length || 0,
    price: 0,
    currency: '',
  };

  if (formula && assortment && colorants) {
    const settings = formula.formulationSettings;
    const calibrationConditionId = isString(settings?.calibrationConditionId)
      ? settings?.calibrationConditionId || ''
      : assortment.calibrationConditions[0]?.id;
    const recipeOutputMode = isRecipeOutputMode(settings?.recipeOutputMode)
      ? settings?.recipeOutputMode || RecipeOutputMode.ProductionReady
      : RecipeOutputMode.ProductionReady;
    const assortmentViscosity = (assortment && calibrationConditionId)
      ? getCalibrationParameterScalarValue(
        assortment,
        calibrationConditionId,
        'calibrationViscosity',
      ) || 0 : 0.0;
    const outputRecipe = getOutputRecipe({
      solvent: assortment.solvent,
      formula,
      colorants,
      recipeOutputMode,
      assortmentViscosity,
      calibrationConditionId,
      canUnit: defaultGravimetricUnit,
      recipeUnit: defaultGravimetricUnit,
      totalMode: 'Total',
    });
    rowData.numberOfComponents = outputRecipe.layers[0]?.components.length;
    rowData.price = outputRecipe.price;
    rowData.currency = getCurrencySymbol(outputRecipe.currencyCode);
  }

  if (sortingCriteria) {
    rowData.custom = getCustomSortingNumber(
      sortingCriteria,
      {
        score: result.score,
        componentCount: rowData.numberOfComponents,
        price: rowData.price,
        deltaE2000: deltaE2000 ?? 0,
        deltaE76: deltaE76 ?? 0,
      },
    );
  }

  return rowData;
});
