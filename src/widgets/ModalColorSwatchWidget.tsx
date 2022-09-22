import { useEffect, useState } from 'react';

import { MeasurementSample } from '@xrite/cloud-formulation-domain-model';
import { Component } from '../types/component';
import ColorSwatch from './ColorSwatch';
import Actions from '../pages/common/Actions';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import Select from '../components/Select';
import { ROOT_ELEMENT_ID } from '../config';
import { makeShortName } from '../../cypress/support/util/selectors';
import {
  getColorSwatchData,
  getTransformedDataForModalWidget,
  SampleInfo,
  toColorSwatchDataTransform,
} from './utils';
import { DescribedMeasurementCondition } from '../types/measurement';
import { ModalWidgetProps } from './WidgetLayout/types';

const ColorSwatchWidget: Component<ModalWidgetProps> = ({
  dataTestId,
  settings,
  onChange,
  measurement,
  widgetSelect,
  measurementName,
}) => {
  const transformFunc = (
    condition: DescribedMeasurementCondition,
    standardName?: string,
    standardSample?: MeasurementSample,
    sampleInfo?: SampleInfo,
    sampleSample?: MeasurementSample,
  ) => toColorSwatchDataTransform(
    condition,
    standardName,
    standardSample,
    sampleSample,
    sampleInfo,
  );
  const colorSwatchData = getTransformedDataForModalWidget(
    measurement, transformFunc, measurementName,
  );
  const isMultiAngleStandard = colorSwatchData?.availableMeasurementConditions.includes('45as45');
  const { swatchColors, sampleNames, sampleConditions } = getColorSwatchData(
    colorSwatchData?.data, settings.measurementConditions, measurementName,
  );
  // use first measurement condition if no valid selected
  useEffect(() => {
    const hasValidMeasurementCondition = settings.measurementConditions.some(
      (cond) => colorSwatchData?.availableMeasurementConditions.includes(cond),
    );
    if (!hasValidMeasurementCondition && colorSwatchData?.availableMeasurementConditions.length) {
      onChange({ measurementConditions: [colorSwatchData.availableMeasurementConditions[0]] });
    }
  }, [settings.measurementConditions, colorSwatchData?.availableMeasurementConditions]);

  const [showColorSetupModal, setShowColorSetupModal] = useState<boolean>(false);

  const onClickColorSetup = () => {
    setShowColorSetupModal(!showColorSetupModal);
  };

  return (
    <>
      <WidgetPanel
        dataTestId={dataTestId}
        headerLeft={widgetSelect}
        headerRight={<Actions dataTestId={`${makeShortName(dataTestId)}-options`} onClickColorSetup={onClickColorSetup} />}
        footerRight={(
          <Select<string>
            id={`${makeShortName(dataTestId)}-select-measurements-data`}
            isMulti
            isFullWidth
            menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
            data={colorSwatchData?.availableMeasurementConditions}
            value={settings.measurementConditions}
            onChange={(newMeasurementConditions) => onChange({
              measurementConditions: newMeasurementConditions,
            })}
          />
        )}
      >
        <ColorSwatch
          swatchColors={swatchColors}
          sampleNames={sampleNames}
          sampleConditions={sampleConditions}
          isMultiAngleStandard={isMultiAngleStandard}
          isMultiSample={false}
          isColorSetupModalOpen={showColorSetupModal}
          onCloseModal={onClickColorSetup}
        />
      </WidgetPanel>
    </>
  );
};

export default ColorSwatchWidget;
