import { useDispatch, useSelector } from 'react-redux';

import { RootState } from './reducers';
import { setSelectedStandardId, selectSampleId, clearWorkingAppearanceSamples } from './reducers/common';
import { ColorimetricConfiguration } from './api/uss/colorimetric/types';
import { SortingCriterion, SortingCriterionColumn } from './api/uss/formulation/types';

export const getStandardId = (state: RootState): string => state.common.selectedStandardId;

export const useStandardId = () => {
  const dispatch = useDispatch();
  const selectedStandardId = useSelector(getStandardId);

  const setStandardId = (standardId: string) => {
    // todo: create a modal that warns a user that he has unsaved changes
    dispatch(clearWorkingAppearanceSamples());

    dispatch(setSelectedStandardId(standardId));
  };

  return {
    selectedStandardId,
    setStandardId,
  };
};

export const getSampleId = (state: RootState): string => state.common.selectedSampleId;

export const useSampleId = () => {
  const dispatch = useDispatch();
  const selectedSampleId = useSelector(getSampleId);

  const setSampleId = (sampleId: string) => {
    dispatch(selectSampleId(sampleId));
  };

  return {
    selectedSampleId,
    setSampleId,
  };
};

export const getViewingConditions = (configuration?: ColorimetricConfiguration) => {
  if (!configuration) return undefined;

  const { illuminants } = configuration;
  const { observers } = configuration;

  return [{
    illuminant: illuminants.primary,
    observer: observers.primary,
  }, {
    illuminant: illuminants.secondary,
    observer: observers.secondary,
  }, {
    illuminant: illuminants.tertiary,
    observer: observers.tertiary,
  }];
};

export const getCustomSortingNumber = (
  criteria: SortingCriterion[],
  data: {
    score: number,
    componentCount: number,
    price: number,
    deltaE2000: number,
    deltaE76: number,
  },
) => criteria.reduce(
  (sum, { column, weight }) => {
    switch (column) {
      case SortingCriterionColumn.Score: return sum + data.score * weight;
      case SortingCriterionColumn.ComponentCount: return sum + data.componentCount * weight;
      case SortingCriterionColumn.Price: return sum + data.price * weight;
      case SortingCriterionColumn.DeltaE2000: return sum + data.deltaE2000 * weight;
      case SortingCriterionColumn.DeltaE76: return sum + data.deltaE76 * weight;
      default: return sum;
    }
  },
  0,
);
