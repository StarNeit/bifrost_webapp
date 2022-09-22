import { Measurement } from '@xrite/cloud-formulation-domain-model/measurement';
import { ReactNode } from 'react';
import { Layout } from 'react-grid-layout';
import { SortingRule } from 'react-table';

import { ViewingCondition, ReflectanceCondition } from '../../types/layout';

export enum WidgetType {
  ColorData = 1,
  SpectralGraph = 2,
  ColorSwatch = 3,
  RecipeDisplay = 4,
  FormulationResult = 5,
  CorrectionResult = 6,
  ColorPlot = 7,
}

export enum SampleMode {
  Single,
  Multi,
}

export type TableSizing = {
  columnWidth: number;
  headerIdWidths: Record<string, number>;
  columnWidths: {
    [columnId: string]: number;
  };
};

export interface TableSettings {
  activeColumnIds?: string[],
  sortBy?: SortingRule<string>[],
  sizing?: TableSizing,
  order?: string[],
}

export interface WidgetUpdate {
  type?: WidgetType,
  sampleMode?: SampleMode,
  reflectanceConditions?: ReflectanceCondition[];
  viewingConditions?: ViewingCondition[];
  measurementConditions?: string[];
  tableSettings?: TableSettings,
}

export interface WidgetSettings {
  id: string;
  layout: Layout;
  type: WidgetType;
  sampleMode: SampleMode;
  viewingConditions: ViewingCondition[];
  measurementConditions: string[];
  reflectanceConditions: ReflectanceCondition[];
  tableSettings?: TableSettings,
}

export interface WidgetProps {
  dataTestId?: string;
  sampleMode: SampleMode;
  reflectanceConditions: ReflectanceCondition[];
  viewingConditions: ViewingCondition[];
  measurementConditions: string[];
  onChange: (update: WidgetUpdate) => void;
  newStandardMeasurement?: Measurement;
  widgetSelect: ReactNode;
  tableSettings?: TableSettings,
}

export interface WidgetConfiguration {
  [key: string]: WidgetSettings[];
}

export interface ModalWidgetSettings {
  type: WidgetType;
  sampleMode: SampleMode;
  viewingConditions: ViewingCondition[];
  measurementConditions: string[];
  reflectanceConditions: ReflectanceCondition[];
  tableSettings?: TableSettings,
}

export type ModalWidgetProps = {
  dataTestId?: string;
  settings: ModalWidgetSettings;
  onChange: (update: Partial<ModalWidgetSettings>) => void;
  measurement?: Measurement;
  widgetSelect: ReactNode;
  measurementName?: string;
};
