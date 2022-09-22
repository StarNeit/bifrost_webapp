import { useState } from 'react';
import { MeasurementSample } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../types/component';
import Actions from '../pages/common/Actions';
import SingleMultiSwitch from '../pages/common/SingleMultiSwitch';
import { SampleMode, WidgetProps } from './WidgetLayout/types';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import {
  getColorSwatchData, SampleInfo, toColorSwatchDataTransform,
  useSamplesDataMainPages,
} from './utils';
import Select from '../components/Select';
import { ROOT_ELEMENT_ID } from '../config';
import ColorSwatch from './ColorSwatch';
import { useStandard } from '../data/api';
import { useStandardId } from '../data/common';
import { DescribedMeasurementCondition } from '../types/measurement';

const ColorSwatchWidget: Component<WidgetProps> = ({
  dataTestId,
  sampleMode,
  measurementConditions,
  onChange,
  widgetSelect,
}) => {
  const [showColorSetupModal, setShowColorSetupModal] = useState<boolean>(false);

  // get the sample data (standard and appearance samples)
  const isMultiSample = (sampleMode === SampleMode.Multi);
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
  const colorSwatchData = useSamplesDataMainPages(isMultiSample, transformFunc);
  const isMultiAngleStandard = colorSwatchData.availableMeasurementConditions.includes('45as45');
  const { selectedStandardId } = useStandardId();
  const { result } = useStandard({ id: selectedStandardId });
  const {
    swatchColors, sampleNames, sampleConditions, sampleIds,
  } = getColorSwatchData(
    colorSwatchData.data, measurementConditions, result?.name,
  );
  const onClickColorSetup = () => {
    setShowColorSetupModal(!showColorSetupModal);
  };

  return (
    <>
      <WidgetPanel
        dataTestId={dataTestId}
        headerLeft={widgetSelect}
        headerRight={<Actions onClickColorSetup={onClickColorSetup} />}
        footerLeft={(
          <SingleMultiSwitch
            isMulti={sampleMode === SampleMode.Multi}
            onChange={(isMulti) => {
              const newSampleMode = isMulti ? SampleMode.Multi : SampleMode.Single;
              onChange({ sampleMode: newSampleMode });
            }}
          />
        )}
        footerRight={(
          <Select
            isMulti
            isFullWidth
            menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
            data={colorSwatchData.availableMeasurementConditions}
            value={measurementConditions}
            onChange={(newMeasurementConditions) => onChange({
              measurementConditions: newMeasurementConditions,
            })}
          />
        )}
      >
        <ColorSwatch
          swatchColors={swatchColors}
          sampleNames={sampleNames}
          sampleIds={sampleIds}
          sampleConditions={sampleConditions}
          isMultiAngleStandard={isMultiAngleStandard}
          isMultiSample={isMultiSample}
          isColorSetupModalOpen={showColorSetupModal}
          onCloseModal={onClickColorSetup}
        />

      </WidgetPanel>

    </>
  );
};

export default ColorSwatchWidget;
