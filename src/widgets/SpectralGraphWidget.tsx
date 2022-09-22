import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { MeasurementSample } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../types/component';
import { ReflectanceCondition } from '../types/layout';
import Actions from '../pages/common/Actions';
import SingleMultiSwitch from '../pages/common/SingleMultiSwitch';
import ReflectanceConditionControls from '../pages/common/ReflectanceConditionControls';
import { SampleMode, WidgetProps } from './WidgetLayout/types';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import GraphSetupModal from './SpectralGraph/GraphSetupModal';
import SpectralGraph from './SpectralGraph/index';
import Select from '../components/Select';
import { ROOT_ELEMENT_ID } from '../config';
import {
  useSamplesDataMainPages,
  toSpectralDataTransform,
  getSpectralGraphData,
  SampleInfo,
} from './utils';
import { useSampleId } from '../data/common';
import { DescribedMeasurementCondition } from '../types/measurement';

const availableReflectanceConditions = [
  ReflectanceCondition.R,
  ReflectanceCondition.DeltaR,
  ReflectanceCondition.KS,
];

const useStyles = makeStyles((theme) => ({
  viewingConditionsSwitch: {
    marginLeft: theme.spacing(1),
  },
}));

const SpectralGraphWidget: Component<WidgetProps> = ({
  dataTestId,
  sampleMode,
  reflectanceConditions,
  measurementConditions,
  onChange,
  widgetSelect,
}) => {
  const classes = useStyles();

  const [showGraphSetupModal, setShowGraphSetupModal] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [scaleYaxis, setScaleYaxis] = useState<boolean>(true);

  // get the sample data (standard and appearance samples)
  const isMultiSample = (sampleMode === SampleMode.Multi);
  const transformFunc = (
    condition: DescribedMeasurementCondition,
    standardName?: string,
    standardSample?: MeasurementSample,
    sampleInfo?: SampleInfo,
    sampleSample?: MeasurementSample,
  ) => toSpectralDataTransform(
    condition,
    reflectanceConditions[0],
    standardName,
    standardSample,
    sampleInfo,
    sampleSample,
  );
  const {
    data,
    availableMeasurementConditions,
  } = useSamplesDataMainPages(isMultiSample, transformFunc);
  const { selectedSampleId } = useSampleId();
  const {
    allSpectralCurves,
    legendData,
  } = getSpectralGraphData(data, measurementConditions, selectedSampleId);

  // use first measurement condition if no valid selected
  useEffect(() => {
    const hasValidMeasurementCondition = measurementConditions.some(
      (cond) => availableMeasurementConditions.includes(cond),
    );
    if (!hasValidMeasurementCondition && availableMeasurementConditions.length) {
      onChange({ measurementConditions: [availableMeasurementConditions[0]] });
    }
  }, [measurementConditions, availableMeasurementConditions]);

  // use first reflectance condition if no valid selected
  useEffect(() => {
    const hasValidReflectanceCondition = reflectanceConditions.some(
      (cond) => availableReflectanceConditions.includes(cond),
    );
    if (!hasValidReflectanceCondition && availableReflectanceConditions.length) {
      onChange({ reflectanceConditions: [availableReflectanceConditions[0]] });
    }
  }, [reflectanceConditions]);

  const onReflectanceChange = (newReflectanceConditions: number[]) => {
    if (newReflectanceConditions.length) {
      onChange({ reflectanceConditions: newReflectanceConditions });
    }
  };

  const onClickGraphSetup = () => {
    setShowGraphSetupModal(!showGraphSetupModal);
  };

  return (
    <>
      <WidgetPanel
        dataTestId={dataTestId}
        headerLeft={widgetSelect}
        headerRight={<Actions onClickColorSetup={onClickGraphSetup} />}
        footerLeft={(
          <>
            <SingleMultiSwitch
              isMulti={isMultiSample}
              onChange={(isMulti) => {
                const newSampleMode = isMulti ? SampleMode.Multi : SampleMode.Single;
                onChange({ sampleMode: newSampleMode });
              }}
            />

            <ReflectanceConditionControls
              className={classes.viewingConditionsSwitch}
              isMulti={false}
              options={availableReflectanceConditions}
              values={reflectanceConditions}
              onChange={(newReflectanceConditions) => onReflectanceChange(newReflectanceConditions)}
            />
          </>
        )}
        footerRight={(
          <Select
            isMulti
            isFullWidth
            menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
            data={availableMeasurementConditions}
            isFetching={!availableMeasurementConditions}
            value={measurementConditions}
            onChange={(newMeasurementConditions) => {
              onChange({
                measurementConditions: newMeasurementConditions,
              });
            }}
          />
        )}
      >
        <SpectralGraph
          showLegend={showLegend}
          scaleYaxis={scaleYaxis}
          spectralData={allSpectralCurves}
          legendData={legendData}
        />
      </WidgetPanel>

      <GraphSetupModal
        isOpenModal={showGraphSetupModal}
        closeModal={onClickGraphSetup}
        showLegend={showLegend}
        scaleYaxis={scaleYaxis}
        changeYaxis={setScaleYaxis}
        changeLegend={setShowLegend}
      />
    </>
  );
};

export default SpectralGraphWidget;
