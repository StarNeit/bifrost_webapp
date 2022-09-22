import {
  IlluminantType,
  ObserverType,
} from '@xrite/cloud-formulation-domain-model';

import {
  SampleMode,
  WidgetType,
} from '../../../../widgets/WidgetLayout/types';
import { ReflectanceCondition, ViewingCondition } from '../../../../types/layout';

export const defaultSpectralGraphSettings = {
  type: WidgetType.SpectralGraph,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  measurementConditions: ['M0', 'M1'],
  reflectanceConditions: [ReflectanceCondition.R],
};

export const defaultColorTableSettings = {
  type: WidgetType.ColorData,
  sampleMode: SampleMode.Single,
  viewingConditions: [{
    illuminant: IlluminantType.D50,
    observer: ObserverType.TwoDegree,
  } as ViewingCondition],
  measurementConditions: ['M0', 'M1'],
  reflectanceConditions: [],
};

export const defaultColorSwatchSettings = {
  type: WidgetType.ColorSwatch,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  measurementConditions: ['M0', 'M1'],
  reflectanceConditions: [],
};

export const defaultFormulationResultSettings = {
  type: WidgetType.FormulationResult,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  measurementConditions: [],
  reflectanceConditions: [],
};

export const defaultRecipeDisplaySettings = {
  type: WidgetType.RecipeDisplay,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  measurementConditions: [],
  reflectanceConditions: [],
};

export const defaultCorrectionResultSettings = {
  type: WidgetType.CorrectionResult,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  measurementConditions: [],
  reflectanceConditions: [],
};
