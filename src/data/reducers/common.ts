/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { AppearanceSample, Formula, Measurement } from '@xrite/cloud-formulation-domain-model';
import uniq from 'lodash/uniq';

const initialState: {
  selectedStandardId: string,
  selectedSampleId: string,
  defaultRealNumbersPrecision: number,
  // samples added when formula is edited or measured samples
  workingAppearanceSamples: AppearanceSample[],
  expandedSampleTreeIds: string[],
  isNewSamplePopupVisible: boolean,
} = {
  selectedStandardId: '',
  selectedSampleId: '',
  defaultRealNumbersPrecision: 2,
  workingAppearanceSamples: [],
  expandedSampleTreeIds: [],
  isNewSamplePopupVisible: false,
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setSelectedStandardId(state, action: { payload: string }) {
      state.selectedStandardId = action.payload;
    },
    selectSampleId(state, action: { payload: string }) {
      state.selectedSampleId = action.payload;
    },
    setWorkingAppearanceSample(state, action: { payload: AppearanceSample }) {
      const sampleIndex = state.workingAppearanceSamples.findIndex(
        ({ id }) => id === action.payload.id,
      );

      const sampleExists = sampleIndex !== -1;

      if (sampleExists) {
        state.workingAppearanceSamples[sampleIndex] = action.payload;
        return;
      }

      state.workingAppearanceSamples.push(action.payload);
    },
    setWorkingAppearanceSamples(state, action: { payload: AppearanceSample[] }) {
      const ids = action.payload.map((sample) => sample.id);

      const existingWorkingSamples: Record<string, number> = {};
      state.workingAppearanceSamples
        .forEach(
          ({ id }, index) => {
            if (ids.includes(id)) existingWorkingSamples[id] = index;
          },
        );

      action.payload.forEach((sample) => {
        const isWorkingSample = existingWorkingSamples[sample.id] !== undefined;
        // if it exists, just replace it
        if (isWorkingSample) {
          const index = existingWorkingSamples[sample.id];
          state.workingAppearanceSamples[index] = sample;
        } else {
          state.workingAppearanceSamples.push(sample);
        }
      });
    },
    removeWorkingAppearanceSample(state, action: { payload: string }) {
      const sampleId = action.payload;
      state.workingAppearanceSamples = state.workingAppearanceSamples.filter(
        (sample) => sample.id !== sampleId,
      );
    },
    // removes the working sample and the related child/parent
    removeRelatedWorkingAppearanceSamples(state, action: {
      payload: {
        sampleId: string,
        parentSampleId?: string
      }
    }) {
      const { sampleId, parentSampleId } = action.payload;
      state.workingAppearanceSamples = state.workingAppearanceSamples.filter(
        (sample) => (
          sample.id !== sampleId // remove the working sample itself
          && sample.parentAppearanceSampleId !== sampleId // remove the working child
          && sample.id !== parentSampleId // remove the working parent
        ),
      );
    },
    setWorkingAppearanceSampleFormula(state, action: {
      payload: { sampleId: string, formula: Formula },
    }) {
      const sampleToUpdateIndex = state.workingAppearanceSamples?.findIndex(
        (sample) => sample.id === action.payload.sampleId,
      );

      const sampleToUpdateExists = sampleToUpdateIndex !== -1;

      if (!sampleToUpdateExists) return;

      state.workingAppearanceSamples[sampleToUpdateIndex] = AppearanceSample.parse({
        ...state.workingAppearanceSamples[sampleToUpdateIndex],
        formula: Formula.parse({ ...action.payload.formula }),
      });
    },
    updateWorkingTrialMeasurement(state, action: {
      payload: { sampleId: string, measurements: Measurement[] },
    }) {
      const sampleIndex = state.workingAppearanceSamples.findIndex(
        ({ id }) => id === action.payload.sampleId,
      );

      const sampleExists = sampleIndex !== -1;

      if (sampleExists) {
        const sample = state.workingAppearanceSamples[sampleIndex];
        state.workingAppearanceSamples[sampleIndex] = {
          ...sample,
          measurements: action.payload.measurements,
        };
      }
    },
    clearWorkingAppearanceSamples(state) {
      state.workingAppearanceSamples = [];
    },
    updateFormulaAmountOfWorkingAppearanceSample(state, action: {
      payload: {
        // only updating of a child is present
        parentSampleId?: string,
        formula: Formula,
      }
    }) {
      const {
        parentSampleId,
        formula,
      } = action.payload;

      const sampleIndex = state.workingAppearanceSamples.findIndex(
        ({ parentAppearanceSampleId }) => parentAppearanceSampleId === parentSampleId,
      );

      if (sampleIndex === -1) return;

      const existingSample = state.workingAppearanceSamples[sampleIndex];

      const changedSample = AppearanceSample.parse(existingSample);

      changedSample.formula = formula;

      state.workingAppearanceSamples[sampleIndex] = changedSample;
    },
    setExpandedSampleTreeIds(state, action: { payload: { ids: string[], persist?: boolean } }) {
      if (action.payload.persist) {
        state.expandedSampleTreeIds = uniq(state.expandedSampleTreeIds.concat(action.payload.ids));

        return;
      }

      state.expandedSampleTreeIds = action.payload.ids;
    },
    setIsNewSamplePopupVisible(state, action: { payload: boolean }) {
      state.isNewSamplePopupVisible = action.payload;
    },
  },
});

export const {
  setSelectedStandardId,
  selectSampleId,
  setWorkingAppearanceSample,
  setWorkingAppearanceSamples,
  removeRelatedWorkingAppearanceSamples,
  removeWorkingAppearanceSample,
  setWorkingAppearanceSampleFormula,
  updateFormulaAmountOfWorkingAppearanceSample,
  updateWorkingTrialMeasurement,
  clearWorkingAppearanceSamples,
  setExpandedSampleTreeIds,
  setIsNewSamplePopupVisible,
} = commonSlice.actions;

export default commonSlice.reducer;
