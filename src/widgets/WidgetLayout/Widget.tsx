import { Measurement } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../../types/component';
import {
  SampleMode,
  WidgetType,
  WidgetUpdate,
  TableSettings,
} from './types';
import ColorSwatchWidget from '../ColorSwatchWidget';
import ColorDataTableWidget from '../ColorDataTableWidget';
import ColorPlotWidget from '../ColorPlotWidget';
import SpectralGraphWidget from '../SpectralGraphWidget';
import RecipeDisplayWidget from '../RecipeDisplayWidget';
import { ViewingCondition, ReflectanceCondition } from '../../types/layout';
import FormulationResultWidget from '../FormulationResultWidget';
import CorrectionResultWidget from '../CorrectionResultWidget';
import Select from '../../components/Select';

type Props = {
  id: string;
  type: WidgetType;
  sampleMode: SampleMode;
  viewingConditions: ViewingCondition[];
  reflectanceConditions: ReflectanceCondition[];
  measurementConditions: string[];
  tableSettings?: TableSettings,
  onChange: (id: string, update: WidgetUpdate) => void;
  newStandardMeasurement?: Measurement;
  availableWidgetTypes: WidgetType[];
  widgetTypeLabels: Partial<Record<WidgetType, string>>;
};

const Widget: Component<Props> = ({
  id,
  type,
  onChange,
  availableWidgetTypes,
  widgetTypeLabels,
  ...options
}) => {
  let dataTestId = '';

  switch (type) {
    case WidgetType.ColorData: // Color-Data
      dataTestId = 'widget-color-data-table';
      break;
    case WidgetType.SpectralGraph: // Spectral Graph
      dataTestId = 'widget-spectral-graph';
      break;
    case WidgetType.ColorSwatch: // Color Swatch
      dataTestId = 'widget-color-swatch';
      break;
    case WidgetType.RecipeDisplay: // Recipe-Display
      dataTestId = 'widget-recipe-display';
      break;
    case WidgetType.FormulationResult: // Formulation Result
      dataTestId = 'widget-formulation-result';
      break;
    case WidgetType.CorrectionResult: // Correction Result
      dataTestId = 'widget-correction-result';
      break;
    case WidgetType.ColorPlot: // Color Plot
      dataTestId = 'widget-color-plot';
      break;
    default:
      break;
  }
  dataTestId += `-${id}`;
  const onWidgetChange = (update: WidgetUpdate) => onChange(id, update);

  const widgetSelect = (
    <Select<WidgetType>
      id={`select-widget-type-${id}`}
      data={availableWidgetTypes}
      value={type}
      labelProp={(widgetType: WidgetType) => widgetTypeLabels[widgetType] || ''}
      isMulti={false}
      isClearable={false}
      onChange={(widgetType) => onWidgetChange({ type: widgetType, tableSettings: undefined })}
    />
  );

  switch (type) {
    case WidgetType.ColorSwatch:
      return (
        <ColorSwatchWidget
          {...options}
          onChange={onWidgetChange}
          widgetSelect={widgetSelect}
          dataTestId={dataTestId}
        />
      );

    case WidgetType.ColorData:
      return (
        <ColorDataTableWidget
          {...options}
          onChange={onWidgetChange}
          widgetSelect={widgetSelect}
          dataTestId={dataTestId}
        />
      );

    case WidgetType.ColorPlot:
      return (
        <ColorPlotWidget
          {...options}
          onChange={onWidgetChange}
          widgetSelect={widgetSelect}
          dataTestId={dataTestId}
        />
      );

    case WidgetType.RecipeDisplay:
      return (
        <RecipeDisplayWidget
          {...options}
          onChange={onWidgetChange}
          widgetSelect={widgetSelect}
          dataTestId={dataTestId}
        />
      );

    case WidgetType.SpectralGraph:
      return (
        <SpectralGraphWidget
          {...options}
          onChange={onWidgetChange}
          widgetSelect={widgetSelect}
          dataTestId={dataTestId}
        />
      );

    case WidgetType.FormulationResult:
      return (
        <FormulationResultWidget
          {...options}
          onChange={onWidgetChange}
          widgetSelect={widgetSelect}
          dataTestId={dataTestId}
        />
      );

    default:
    case WidgetType.CorrectionResult:
      return (
        <CorrectionResultWidget
          {...options}
          onChange={onWidgetChange}
          widgetSelect={widgetSelect}
          dataTestId={dataTestId}
        />
      );
  }
};

export default Widget;
