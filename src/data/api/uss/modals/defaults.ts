import { ReflectanceCondition } from '../../../../types/layout';
import { ModalWidgetSettings, SampleMode, WidgetType } from '../../../../widgets/WidgetLayout/types';

export const defaultStandardModalWidgetSettings: ModalWidgetSettings = {
  type: WidgetType.SpectralGraph,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  reflectanceConditions: [ReflectanceCondition.R],
  measurementConditions: [],
};

export const defaultSampleModalWidgetSettings: ModalWidgetSettings = {
  type: WidgetType.SpectralGraph,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  reflectanceConditions: [ReflectanceCondition.R],
  measurementConditions: [],
};

export const defaultSubstrateModalWidgetSettings: ModalWidgetSettings = {
  type: WidgetType.SpectralGraph,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  reflectanceConditions: [ReflectanceCondition.R],
  measurementConditions: [],
};

export const defaultColorSearchModalWidgetSettings: ModalWidgetSettings = {
  type: WidgetType.ColorData,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  reflectanceConditions: [ReflectanceCondition.R],
  measurementConditions: [],
};

export const defaultLeftoversModalWidgetSettings: ModalWidgetSettings = {
  type: WidgetType.ColorData,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  reflectanceConditions: [],
  measurementConditions: [],
};
