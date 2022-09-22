import { WidgetSettings } from '../../../../widgets/WidgetLayout/types';
import {
  defaultSpectralGraphSettings,
  defaultColorTableSettings,
  defaultColorSwatchSettings,
  defaultCorrectionResultSettings,
  defaultFormulationResultSettings,
  defaultRecipeDisplaySettings,
} from '../common/widgetsDefaults';

export const defaultWidgetSettings: WidgetSettings[] = [
];

export const defaultFormulationWidgetSettingsCollection: WidgetSettings[] = [
  {
    id: '1',
    ...defaultFormulationResultSettings,
    layout: {
      i: '1', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2,
    },
  },
  {
    id: '2',
    ...defaultRecipeDisplaySettings,
    layout: {
      i: '2', x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2,
    },
  },
  {
    id: '3',
    ...defaultSpectralGraphSettings,
    layout: {
      i: '3', x: 0, y: 3, w: 2, h: 3, minW: 2, minH: 2,
    },
  },
  {
    id: '4',
    ...defaultColorTableSettings,
    layout: {
      i: '4', x: 3, y: 4, w: 3, h: 2, minW: 2, minH: 2,
    },
  },
];

export const defaultCorrectionWidgetSettingsCollection: WidgetSettings[] = [
  {
    id: '1',
    ...defaultCorrectionResultSettings,
    layout: {
      i: '1', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2,
    },
  },
  {
    id: '2',
    ...defaultRecipeDisplaySettings,
    layout: {
      i: '2', x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2,
    },
  },
  {
    id: '3',
    ...defaultSpectralGraphSettings,
    layout: {
      i: '3', x: 0, y: 3, w: 2, h: 3, minW: 2, minH: 2,
    },
  },
  {
    id: '4',
    ...defaultColorTableSettings,
    layout: {
      i: '4', x: 3, y: 4, w: 3, h: 2, minW: 2, minH: 2,
    },
  },
];

export const defaultQCWidgetSettingsCollection: WidgetSettings[] = [
  {
    id: '1',
    ...defaultColorTableSettings,
    layout: {
      i: '1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2,
    },
  },
  {
    id: '2',
    ...defaultColorSwatchSettings,
    layout: {
      i: '2', x: 4, y: 0, w: 2, h: 2, minW: 2, minH: 2,
    },
  },
  {
    id: '3',
    ...defaultSpectralGraphSettings,
    layout: {
      i: '3', x: 0, y: 3, w: 2, h: 2, minW: 2, minH: 2,
    },
  },
];
