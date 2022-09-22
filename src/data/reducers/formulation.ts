/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { AppearanceSample, Colorant, Formula } from '@xrite/cloud-formulation-domain-model';

import { convertColorantsToComponents } from '../../pages/Formulation/utils';
import {
  CombinatorialMode,
  ConcentrationPercentages,
  FormulationSettings,
  OpacityMode,
  SearchAndCorrectMode,
} from '../../types/formulation';
import { RecipeOutputMode, TotalMode } from '../../types/recipe';

export type ResultType = 'search' | 'formulation' | 'correction'
export interface Result {
  sample: AppearanceSample;
  score: number;
  type?: ResultType;
}

export interface ConcentrationPayload {
  componentId: string;
  minConcentrationPercentage?: number;
  maxConcentrationPercentage?: number;
}

export interface RequiredPayload {
  componentId: string;
  operation: 'add' | 'remove';
}

export interface FormulationResult {
  searchResults?: Result[];
  formulationResults?: Result[];
  parameters: {
    assortmentId: string;
    substrateId: string;
    standardId: string;
    recipeOutputMode?: RecipeOutputMode;
    targetViscosity?: number;
  };
}

const initialState: {
  result?: FormulationResult;
  selectedAssortmentId?: string;
  selectedSubstrateId?: string;
  selectedClearId?: string;
  selectedThicknessRatioId?: string;
  selectedComponentIds: string[];
  selectedAdditiveIds: string[];
  recipeOutputMode: RecipeOutputMode;
  targetViscosity?: number;
  opacityMode: OpacityMode;
  opacityMinPercent: number;
  opacityMaxPercent: number;
  relativeMinThicknessPercent: number;
  relativeMaxThicknessPercent: number;
  combinatorialMode: CombinatorialMode;
  searchAndCorrectModes: SearchAndCorrectMode[];
  totalMode: TotalMode;
  concentrationPercentages: ConcentrationPercentages;
  requiredComponentIds: string[];
  colorantsMaxCount: number;
} = {
  result: undefined,
  selectedAssortmentId: undefined,
  selectedSubstrateId: undefined,
  selectedClearId: undefined,
  selectedThicknessRatioId: undefined,
  selectedComponentIds: [],
  selectedAdditiveIds: [],
  recipeOutputMode: RecipeOutputMode.ProductionReady,
  targetViscosity: undefined,
  opacityMode: OpacityMode.None,
  opacityMinPercent: 0,
  opacityMaxPercent: 100,
  relativeMinThicknessPercent: 100,
  relativeMaxThicknessPercent: 100,
  combinatorialMode: CombinatorialMode.Full,
  searchAndCorrectModes: [SearchAndCorrectMode.Off],
  totalMode: 'Total',
  concentrationPercentages: {},
  requiredComponentIds: [],
  colorantsMaxCount: 0,
};

const formulationSlice = createSlice({
  name: 'formulation',
  initialState,
  reducers: {
    setFormulationResult(state, action: { payload: FormulationResult | undefined }) {
      state.result = action.payload;
    },
    setFormulationResultData(state, action: { payload: FormulationResult | undefined }) {
      if (!state.result) {
        state.result = action.payload;
        return;
      }
      state.result.searchResults = state.result.searchResults ?? action.payload?.searchResults;
      state.result.formulationResults = state.result.formulationResults
        ?? action.payload?.formulationResults;
    },
    setFormulationResultFormula(state, action: { payload: { id: string, formula: Formula } }) {
      const resultEntry = state.result?.formulationResults?.find(
        ({ sample }) => sample.id === action.payload.id,
      );
      if (resultEntry) {
        resultEntry.sample = AppearanceSample.parse({
          ...resultEntry.sample,
          formula: action.payload.formula,
        });
      }
    },
    selectAssortment(state, action: { payload: string | undefined }) {
      if (state.selectedAssortmentId !== action.payload) {
        state.selectedAssortmentId = action.payload;
        state.selectedClearId = undefined;
        state.selectedComponentIds = [];
        state.selectedAdditiveIds = [];
        state.targetViscosity = undefined;
      }
    },
    selectSubstrate(state, action: { payload: string | undefined }) {
      state.selectedSubstrateId = action.payload;
    },
    selectClear(state, action: { payload: string | undefined }) {
      state.selectedClearId = action.payload;
    },
    selectThicknessRatio(state, action: { payload: { deviceId: string, ratio?: number} }) {
      state.selectedThicknessRatioId = action.payload.deviceId;
      if (action.payload.ratio !== undefined) {
        state.relativeMaxThicknessPercent = action.payload.ratio * 100;
        state.relativeMinThicknessPercent = action.payload.ratio * 100;
      }
    },
    selectComponents(state, action: { payload: string[] }) {
      state.selectedComponentIds = action.payload;
    },
    selectAdditives(state, action: { payload: string[] }) {
      state.selectedAdditiveIds = action.payload;
    },
    selectRecipeOutputMode(state, action: { payload: RecipeOutputMode }) {
      state.recipeOutputMode = action.payload;
    },
    setTargetViscosity(state, action: { payload: number }) {
      state.targetViscosity = action.payload;
    },
    setColorantsMaxCount(state, action: { payload: number }) {
      state.colorantsMaxCount = action.payload;
    },
    setRelativeThicknessPercent(state, action: { payload: {value: number, type: 'min' | 'max' | 'minAndMax' } | { type: 'default' } }) {
      switch (action.payload.type) {
        case 'min':
          state.relativeMinThicknessPercent = action.payload.value;
          break;

        case 'max':
          state.relativeMaxThicknessPercent = action.payload.value;
          break;

        case 'minAndMax':
          state.relativeMaxThicknessPercent = action.payload.value;
          state.relativeMinThicknessPercent = action.payload.value;
          break;

        default:
          state.relativeMinThicknessPercent = 100;
          state.relativeMaxThicknessPercent = 100;
          break;
      }
    },
    setOpacitySettings(
      state,
      action: { payload: { mode: OpacityMode, minPercent: number, maxPercent: number } },
    ) {
      state.opacityMode = action.payload.mode;
      state.opacityMinPercent = action.payload.minPercent;
      state.opacityMaxPercent = action.payload.maxPercent;
    },
    setCombinatorialMode(state, action: { payload: CombinatorialMode }) {
      state.combinatorialMode = action.payload;
    },
    setSearchAndCorrectModes(state, action: { payload: SearchAndCorrectMode }) {
      const { payload: mode } = action;

      // remove mode if it exists and it's not the last mode
      if (state.searchAndCorrectModes.includes(mode)) {
        state.searchAndCorrectModes = state.searchAndCorrectModes.filter((m) => m !== mode);
        return;
      }

      // add mode
      state.searchAndCorrectModes.push(mode);
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
        Object.assign(
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
    setFormulationSettings(state, action: { payload: {
      formulationSettings: FormulationSettings;
      assortmentId: string;
      substrateId: string;
      colorants: Colorant[];
    }}) {
      const {
        payload: {
          formulationSettings, assortmentId, substrateId, colorants,
        },
      } = action;

      state.selectedAssortmentId = assortmentId;
      state.selectedSubstrateId = substrateId;

      Object.assign(state, formulationSettings);

      const {
        recipeOutputMode,
        selectedColorantIds = [],
        calibrationConditionId,
        additives = [],
        colorantRestrictions = [],
        requiredColorantIds = [],
      } = formulationSettings;

      const selectedColorants = colorants.filter(
        (colorant) => selectedColorantIds.includes(colorant.id),
      );

      const {
        pigments: sampleComponents,
        clears,
        technicalVarnishes: selectedTVs,
      } = convertColorantsToComponents(
        recipeOutputMode,
        selectedColorants,
        calibrationConditionId,
      );

      const selectedComponentIds = [...sampleComponents.map(
        (component) => component.id,
      ), ...selectedTVs.map((varnish) => varnish.id)];

      const concentrationPercentages: ConcentrationPercentages = {};
      [...sampleComponents, ...selectedTVs, ...clears].forEach((component) => {
        const colorantId = component.colorantId ?? component.id;

        const restriction = colorantRestrictions.find(
          (colorantRestriction) => colorantRestriction.id === colorantId,
        );

        concentrationPercentages[component.id] = {
          maxConcentrationPercentage: restriction?.maxConcentrationPercentage ?? 100,
          minConcentrationPercentage: restriction?.minConcentrationPercentage ?? 0,
        };
      });

      state.selectedComponentIds = selectedComponentIds;
      state.selectedClearId = clears[0].id;
      state.requiredComponentIds = requiredColorantIds;

      const selectedSampleAdditiveIds = additives.map(
        (additive) => {
          if (additive.id) {
            concentrationPercentages[additive.id] = {
              maxConcentrationPercentage: additive?.concentrationPercentage ?? 0,
              minConcentrationPercentage: additive?.concentrationPercentage ?? 0,
            };
          }
          return additive.id ?? '';
        },
      );

      state.selectedAdditiveIds = selectedSampleAdditiveIds;
      state.concentrationPercentages = concentrationPercentages;
    },
  },
});

export const {
  setFormulationResult,
  setFormulationResultData,
  setFormulationResultFormula,
  selectAssortment,
  selectSubstrate,
  selectClear,
  selectComponents,
  selectAdditives,
  selectRecipeOutputMode,
  setTargetViscosity,
  setOpacitySettings,
  setRelativeThicknessPercent,
  setCombinatorialMode,
  setTotalMode,
  setConcentration,
  setRequiredComponentIds,
  setSearchAndCorrectModes,
  setFormulationSettings,
  setColorantsMaxCount,
  selectThicknessRatio,
} = formulationSlice.actions;

export default formulationSlice.reducer;
