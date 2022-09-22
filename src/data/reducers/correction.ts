/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { AppearanceSample, Formula } from '@xrite/cloud-formulation-domain-model';
import { ConcentrationPercentages } from '../../types/formulation';
import { TotalMode } from '../../types/recipe';
import { ResultType } from './formulation';

export interface ConcentrationPayload {
  componentId: string;
  minConcentrationPercentage?: number;
  maxConcentrationPercentage?: number;
}

export interface Result {
  sample: AppearanceSample;
  score: number;
  type?: ResultType;
}

export interface RequiredPayload {
  componentId: string;
  operation: 'add' | 'remove';
}

const initialState: {
  results?: Result[];
  selectedResultId?: string;
  selectedAssortmentId?: string;
  correctionSettings: 'automatic' | 'manual';
  correctionMode: 'New' | 'Add';
  colorantMode: 'automatic' | 'new';
  maxAddPercentage: number;
  selectedClearIds: string[];
  selectedComponentIds: string[];
  totalMode: TotalMode;
  concentrationPercentages: ConcentrationPercentages;
  requiredComponentIds: string[];
} = {
  results: undefined,
  selectedResultId: undefined,
  selectedAssortmentId: undefined,
  correctionSettings: 'automatic',
  correctionMode: 'New',
  colorantMode: 'automatic',
  maxAddPercentage: 50,
  selectedClearIds: [],
  selectedComponentIds: [],
  totalMode: 'Total',
  concentrationPercentages: {},
  requiredComponentIds: [],
};

const commonSlice = createSlice({
  name: 'correction',
  initialState,
  reducers: {
    selectAssortment(state, action: { payload: string | undefined }) {
      state.selectedAssortmentId = action.payload;
    },
    selectCorrectionResult(state, action: { payload: string | undefined }) {
      state.selectedResultId = action.payload;
    },
    setCorrectionResults(state, action: { payload: Result[] | undefined }) {
      state.results = action.payload;
      state.selectedResultId = undefined;
    },
    setCorrectionResultFormula(state, action: { payload: { id: string, formula: Formula } }) {
      const resultEntry = state.results?.find(({ sample }) => sample.id === action.payload.id);
      if (resultEntry) {
        resultEntry.sample = AppearanceSample.parse({
          ...resultEntry.sample,
          formula: action.payload.formula,
        });
      }
    },
    toggleCorrectionSettings(state) {
      state.correctionSettings = state.correctionSettings === 'automatic' ? 'manual' : 'automatic';
    },
    toggleCorrectionMode(state) {
      state.correctionMode = state.correctionMode === 'New' ? 'Add' : 'New';
    },
    toggleColorantMode(state) {
      state.colorantMode = state.colorantMode === 'automatic' ? 'new' : 'automatic';
    },
    setMaxAddPercentage(state, action: { payload: number }) {
      state.maxAddPercentage = action.payload;
    },
    selectClears(state, action: { payload: string[] }) {
      state.selectedClearIds = action.payload;
    },
    selectComponents(state, action: { payload: string[] }) {
      state.selectedComponentIds = action.payload;
    },
    setTotalMode(state, action: { payload: TotalMode }) {
      state.totalMode = action.payload;
    },
    setConcentration(state, action: { payload: ConcentrationPayload }) {
      const { payload } = action;
      const { componentId, minConcentrationPercentage, maxConcentrationPercentage } = payload;
      if (payload) {
        if (!state.concentrationPercentages[componentId]) {
          state.concentrationPercentages[componentId] = {};
        }
        state.concentrationPercentages[componentId] = Object.assign(
          state.concentrationPercentages[componentId],
          {
            minConcentrationPercentage: minConcentrationPercentage
              ?? state.concentrationPercentages[componentId].minConcentrationPercentage,
            maxConcentrationPercentage: maxConcentrationPercentage
              ?? state.concentrationPercentages[componentId].maxConcentrationPercentage,
          },
        );
      }
    },
    setRequiredComponentIds(state, action: { payload: RequiredPayload }) {
      const { componentId, operation } = action.payload;
      if (operation === 'add') {
        state.requiredComponentIds.push(componentId);
        return;
      }

      // remove required id
      state.requiredComponentIds = state.requiredComponentIds.filter(
        (id) => id !== componentId,
      );
    },
  },
});

export const {
  selectAssortment,
  selectCorrectionResult,
  setCorrectionResults,
  setCorrectionResultFormula,
  toggleCorrectionSettings,
  toggleCorrectionMode,
  toggleColorantMode,
  setMaxAddPercentage,
  selectComponents,
  selectClears,
  setTotalMode,
  setConcentration,
  setRequiredComponentIds,
} = commonSlice.actions;

export default commonSlice.reducer;
