import {
  AppearanceSample,
  Measurement,
  Formula,
} from '@xrite/cloud-formulation-domain-model';
import { useSelector } from 'react-redux';
import { useAppearanceSample, useStandard } from '../data/api';
import { useCorrection, useFormulation } from '../data/cfe';
import { useSampleId, useStandardId } from '../data/common';
import CorrectionIcon from '../assets/CorrectionIcon';
import FormulaIcon from '../assets/FormulaIcon';
import TrialIcon from '../assets/TrialIcon';
import SampleIcon from '../assets/SampleIcon';

// look up as many levels as it needs to find the original formula
const findParentSampleWithFormula = (
  searchedSampleId?: string,
  appearanceSamples?: AppearanceSample[],
): AppearanceSample | undefined => {
  const searchedSample = appearanceSamples?.find((sample) => sample.id === searchedSampleId);

  if (searchedSample?.formula || !searchedSample?.parentAppearanceSampleId) return searchedSample;

  return findParentSampleWithFormula(searchedSample.parentAppearanceSampleId, appearanceSamples);
};

const assembleFormulaAppearanceSamples = (
  selectedSample: AppearanceSample,
  allSamples?: AppearanceSample[],
) => {
  const parentSampleWithFormula = findParentSampleWithFormula(
    selectedSample.parentAppearanceSampleId,
    allSamples,
  );
  return {
    selectedSample,
    formulaSample: selectedSample,
    originalFormulaSample: parentSampleWithFormula?.id === selectedSample.id
      ? undefined
      : parentSampleWithFormula,
    fetching: false,
  };
};

export const useSelectedAppearanceSample = (): {
  selectedStandardId: string,
  selectedSample: AppearanceSample | undefined,
  formulaSample: AppearanceSample | undefined,
  originalFormulaSample: AppearanceSample | undefined,
  fetching: boolean,
  type?: 'correctionEntry' | 'formulationEntry' | 'trialEntry' | 'formulaEntry' | 'searchEntry',
} => {
  const { selectedSampleId } = useSampleId();
  const { selectedStandardId } = useStandardId();
  const {
    result: savedAppearanceSamples,
    fetching: fetchingSavedSamples,
  } = useAppearanceSample({ query: { parentId: selectedStandardId } });

  const { result: formulationResult, fetching: formulationRunning } = useFormulation();
  const { results: correctionResult, fetching: correctionRunning } = useCorrection();

  const mergedFormulationResults = [
    ...formulationResult?.formulationResults || [],
    ...formulationResult?.searchResults || [],
  ];
  const selectedFormulationResult = mergedFormulationResults
    .find(({ sample: { id } }) => id === selectedSampleId);
  const selectedCorrectionResult = correctionResult
    ?.find(({ sample: { id } }) => id === selectedSampleId);
  const selectedSavedAppearanceSample = savedAppearanceSamples
    ?.find(({ id }) => (id === selectedSampleId));

  // Assemble all AppearanceSamples into one list.
  // It is important that this comes first to give saved data priority over on-the-fly data
  // with the same ID (a saved recipe over the recipe currently in the formulation
  // or correction results list)
  const allAppearanceSamples = [
    ...(savedAppearanceSamples || []),
    ...mergedFormulationResults.map((result) => result.sample),
    ...(correctionResult?.map((result) => result.sample) || []),
  ];

  if (selectedFormulationResult && !selectedSavedAppearanceSample) {
    return {
      selectedStandardId,
      ...assembleFormulaAppearanceSamples(
        selectedFormulationResult.sample,
        allAppearanceSamples,
      ),
      type: (selectedFormulationResult.type === 'formulation' && 'formulationEntry')
      || (selectedFormulationResult.type === 'correction' && 'correctionEntry')
      || (selectedFormulationResult.type === 'search' && 'searchEntry')
      || 'formulationEntry',
    };
  }

  if (selectedCorrectionResult?.type === 'correction' && !selectedSavedAppearanceSample) {
    return {
      selectedStandardId,
      ...assembleFormulaAppearanceSamples(
        selectedCorrectionResult.sample,
        allAppearanceSamples,
      ),
      type: 'correctionEntry',
    };
  }

  // is this a trial/sample entry ?
  const parentSample = savedAppearanceSamples
    ?.find(({ id }) => (id === selectedSavedAppearanceSample?.parentAppearanceSampleId));
  const isTrialSample = selectedSavedAppearanceSample?.measurements?.length
    || (parentSample && !parentSample.measurements?.length);

  if (isTrialSample && selectedSavedAppearanceSample) {
    if (selectedSavedAppearanceSample.formula) { // does it carry it's own formula? then use it
      return {
        selectedStandardId,
        selectedSample: selectedSavedAppearanceSample,
        formulaSample: selectedSavedAppearanceSample,
        originalFormulaSample: undefined,
        fetching: false,
        type: 'trialEntry',
      };
    }
    // otherwise look for the parent sample, it should contain a formula
    // (if not the selected sample is directly to the standard and we cannot show anything)
    if (parentSample?.formula) {
      return {
        selectedStandardId,
        selectedSample: selectedSavedAppearanceSample,
        formulaSample: findParentSampleWithFormula(
          selectedSavedAppearanceSample.id,
          savedAppearanceSamples,
        ),
        originalFormulaSample: undefined,
        fetching: false,
        type: 'trialEntry',
      };
    }
  }

  if (selectedSavedAppearanceSample?.formula) { // this is a formula entry
    return {
      selectedStandardId,
      ...assembleFormulaAppearanceSamples(
        selectedSavedAppearanceSample,
        allAppearanceSamples,
      ),
      type: 'formulaEntry',
    };
  }

  // indicate the we are still fetching data after the user selects a sample in the nav tree
  if (selectedSampleId && !selectedSavedAppearanceSample) {
    return {
      selectedStandardId,
      selectedSample: undefined,
      formulaSample: undefined,
      originalFormulaSample: undefined,
      fetching: fetchingSavedSamples,
    };
  }

  return {
    selectedStandardId,
    selectedSample: undefined,
    formulaSample: undefined,
    originalFormulaSample: undefined,
    fetching: formulationRunning || correctionRunning,
  };
};

export const useSelectedStandard = () => {
  const selectedStandardId = useSelector((state) => state.common.selectedStandardId);

  const standardData = useStandard({ id: selectedStandardId });

  return standardData;
};

const isTrial = (
  measurements: Measurement[],
  parentAppearanceSampleId?: string,
) => (parentAppearanceSampleId && measurements.length > 0);

const isCorrection = (
  measurements: Measurement[],
  parentAppearanceSample?: AppearanceSample,
) => ((parentAppearanceSample?.measurements?.length || 0) > 0
    && measurements.length === 0);

const isFormula = (
  formula: Formula | undefined,
  measurements: Measurement[],
) => (formula && measurements.length === 0);

const isSample = (
  measurements: Measurement[],
  parentAppearanceSampleId?: string,
) => (!parentAppearanceSampleId && measurements.length > 0);

export const getAppearanceSampleIcon = (
  sample: AppearanceSample,
  parentSample: AppearanceSample | undefined,
  hasTrialAsAncestor: boolean,
) => {
  if (isTrial(sample.measurements, parentSample?.id)) {
    return TrialIcon;
  }
  if (isCorrection(sample.measurements, parentSample)
    || (isFormula(sample.formula, sample.measurements) && hasTrialAsAncestor)) {
    return CorrectionIcon;
  }
  if (isSample(sample.measurements, parentSample?.id)) {
    return SampleIcon;
  }
  return FormulaIcon;
};

export const sampleHasMeasurements = (
  {
    measurements,
  }:
  {
  measurements: Measurement[],
  },
) => measurements.length > 0;
