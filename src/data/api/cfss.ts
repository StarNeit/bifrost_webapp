import {
  IlluminantType,
  ObserverType,
} from '@xrite/cloud-formulation-domain-model';
import { BridgeAppConfiguration } from './bridgeApp/types';
import {
  SampleMode,
  WidgetConfiguration,
  WidgetSettings,
  WidgetType,
} from '../../widgets/WidgetLayout/types';
import { ReflectanceCondition, ViewingCondition } from '../../types/layout';
import { FormulationDefaults } from '../../types/formulation';
import { defaultGravimetricUnit } from '../../utils/utilsRecipe';

const STORAGE_KEY = 'widgetConfiguration/7';
const STORAGE_KEY_BRIDGEAPP = 'bridgeAppConfiguration/2';
const STORAGE_KEY_FORMULATION = 'formulation/1';

const defaultSpectralGraphSettings = {
  type: WidgetType.SpectralGraph,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  measurementConditions: ['M0', 'M1'],
  reflectanceConditions: [ReflectanceCondition.R],
};

const defaultColorTableSettings = {
  type: WidgetType.ColorData,
  sampleMode: SampleMode.Single,
  viewingConditions: [{
    illuminant: IlluminantType.D50,
    observer: ObserverType.TwoDegree,
  } as ViewingCondition],
  measurementConditions: ['M0', 'M1'],
  reflectanceConditions: [],
};

const defaultColorSwatchSettings = {
  type: WidgetType.ColorSwatch,
  sampleMode: SampleMode.Single,
  viewingConditions: [],
  measurementConditions: ['M0', 'M1'],
  reflectanceConditions: [],
};

const defaultWidgetSettings: WidgetSettings[] = [
];

const defaultFormulationWidgetConfiguration: WidgetSettings[] = [
  {
    id: '1',
    type: WidgetType.FormulationResult,
    sampleMode: SampleMode.Single,
    viewingConditions: [],
    measurementConditions: [],
    reflectanceConditions: [],
    layout: {
      i: '1', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2,
    },
  },
  {
    id: '2',
    type: WidgetType.RecipeDisplay,
    sampleMode: SampleMode.Single,
    viewingConditions: [],
    measurementConditions: [],
    reflectanceConditions: [],
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

const defaultCorrectionWidgetConfiguration: WidgetSettings[] = [
  {
    id: '1',
    type: WidgetType.CorrectionResult,
    sampleMode: SampleMode.Single,
    viewingConditions: [],
    measurementConditions: [],
    reflectanceConditions: [],
    layout: {
      i: '1', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2,
    },
  },
  {
    id: '2',
    type: WidgetType.RecipeDisplay,
    sampleMode: SampleMode.Single,
    viewingConditions: [],
    measurementConditions: [],
    reflectanceConditions: [],
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

const defaultQCWidgetConfiguration: WidgetSettings[] = [
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

const defaultWidgetConfiguration: WidgetConfiguration = {
  formulation: defaultFormulationWidgetConfiguration,
  correction: defaultCorrectionWidgetConfiguration,
  search: defaultWidgetSettings,
  qc: defaultQCWidgetConfiguration,
};

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export async function storeWidgetConfiguration(configuration: WidgetConfiguration): Promise<void> {
  const serializedConfiguration = JSON.stringify(configuration);
  localStorage.setItem(STORAGE_KEY, serializedConfiguration);
  await delay(100);
}

export async function loadWidgetConfiguration(): Promise<WidgetConfiguration> {
  const serializedConfiguration = localStorage.getItem(STORAGE_KEY);
  await delay(100);

  if (!serializedConfiguration) {
    return defaultWidgetConfiguration;
  }

  try {
    const configuration = JSON.parse(serializedConfiguration);
    return configuration as WidgetConfiguration;
  } catch (error) {
    throw new Error('Could not retrieve widget configuration');
  }
}

const defaultBridgeAppConfiguration: BridgeAppConfiguration = {
  hostName: '127.0.0.1',
  numberOfAveragingSamples: 2,
  dataModes: ['xrga', 'ma9x'],
};

export async function storeBridgeAppConfiguration(
  configuration: BridgeAppConfiguration,
): Promise<void> {
  const serializedConfiguration = JSON.stringify(configuration);
  localStorage.setItem(STORAGE_KEY_BRIDGEAPP, serializedConfiguration);
  await delay(100);
}

export async function loadBridgeAppConfiguration(): Promise<BridgeAppConfiguration> {
  const serializedConfiguration = localStorage.getItem(STORAGE_KEY_BRIDGEAPP);
  await delay(100);

  if (!serializedConfiguration) {
    return defaultBridgeAppConfiguration;
  }

  try {
    const configuration = JSON.parse(serializedConfiguration);
    return configuration as BridgeAppConfiguration;
  } catch (error) {
    throw new Error('Could not retrieve Bridge App configuration');
  }
}

const defaultFormulationDefaults: FormulationDefaults = {
  defaultCanSize: 100,
  defaultCanUnit: defaultGravimetricUnit,
};

export async function storeFormulationDefaults(
  configuration: FormulationDefaults,
): Promise<void> {
  const serializedConfiguration = JSON.stringify(configuration);
  localStorage.setItem(STORAGE_KEY_FORMULATION, serializedConfiguration);
  await delay(100);
}

export async function loadFormulationDefaults(): Promise<FormulationDefaults> {
  const serializedConfiguration = localStorage.getItem(STORAGE_KEY_FORMULATION);
  await delay(100);

  if (!serializedConfiguration) {
    return defaultFormulationDefaults;
  }

  try {
    const configuration = JSON.parse(serializedConfiguration);
    return configuration as FormulationDefaults;
  } catch (error) {
    throw new Error('Could not retrieve formulation configuration');
  }
}
