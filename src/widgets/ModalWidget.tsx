import { Measurement } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../types/component';
import SpectralGraphWidget from './ModalSpectralGraphWidget';
import StandardCreationColorSwatchWidget from './ModalColorSwatchWidget';
import ColorDataTableWidget from './ModalColorDataTableWidget';
import { ModalWidgetSettings, WidgetType, WidgetUpdate } from './WidgetLayout/types';
import Select from '../components/Select';
import { useWidgetTypeLabels } from '../pages/Formulation/utils';

type Props = {
  dataTestId?: string;
  configuration: ModalWidgetSettings;
  setConfiguration: (newConfiguration: ModalWidgetSettings) => Promise<void>;
  measurement?: Measurement;
  measurementName?: string;
};

const ModalWidget: Component<Props> = ({
  dataTestId,
  configuration,
  setConfiguration,
  measurement,
  measurementName,
}) => {
  let testId = '';
  switch (configuration.type) {
    case WidgetType.SpectralGraph:
      testId = `${dataTestId}-modal-widget-spectral-graph`;
      break;
    case WidgetType.ColorSwatch:
      testId = `${dataTestId}-modal-widget-color-swatch`;
      break;
    case WidgetType.ColorData:
      testId = `${dataTestId}-modal-widget-color-data-table`;
      break;
    default:
      break;
  }

  const availableWidgetTypes = [
    WidgetType.ColorData,
    WidgetType.SpectralGraph,
    WidgetType.ColorSwatch,
  ];

  const widgetTypeLabels = useWidgetTypeLabels();

  const onWidgetChange = (update: WidgetUpdate) => {
    setConfiguration({
      ...configuration,
      ...update,
    });
  };

  const widgetSelect = (
    <Select<WidgetType>
      id={`${dataTestId}-select-widget-type`}
      data={availableWidgetTypes}
      value={configuration.type}
      labelProp={(widgetType: WidgetType) => widgetTypeLabels[widgetType] || ''}
      isMulti={false}
      isClearable={false}
      onChange={(widgetType: WidgetType) => onWidgetChange({ type: widgetType })}
    />
  );

  switch (configuration.type) {
    case WidgetType.SpectralGraph:
      return (
        <SpectralGraphWidget
          dataTestId={testId}
          settings={configuration}
          onChange={onWidgetChange}
          measurement={measurement}
          widgetSelect={widgetSelect}
          measurementName={measurementName}
        />
      );

    case WidgetType.ColorSwatch:
      return (
        <StandardCreationColorSwatchWidget
          dataTestId={testId}
          settings={configuration}
          onChange={onWidgetChange}
          measurement={measurement}
          widgetSelect={widgetSelect}
          measurementName={measurementName}
        />
      );

    default:
    case WidgetType.ColorData:
      return (
        <ColorDataTableWidget
          dataTestId={testId}
          settings={configuration}
          onChange={onWidgetChange}
          measurement={measurement}
          widgetSelect={widgetSelect}
          measurementName={measurementName}
        />
      );
  }
};

export default ModalWidget;
