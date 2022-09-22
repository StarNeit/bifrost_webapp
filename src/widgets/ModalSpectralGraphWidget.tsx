import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { MeasurementSample } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../types/component';
import { ReflectanceCondition } from '../types/layout';
import Actions from '../pages/common/Actions';
import ReflectanceConditionControls from '../pages/common/ReflectanceConditionControls';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import GraphSetupModal from './SpectralGraph/GraphSetupModal';
import SpectralGraph from './SpectralGraph/index';
import { WIDGET_NON_DRAGGABLE_CLASS } from '../utils/constants';
import Select from '../components/Select';
import { ROOT_ELEMENT_ID } from '../config';
import {
  getSpectralGraphData,
  toSpectralDataTransform,
  getStandardDataNewStandard,
} from './utils';
import { makeShortName } from '../../cypress/support/util/selectors';
import { DescribedMeasurementCondition } from '../types/measurement';
import { ModalWidgetProps } from './WidgetLayout/types';

const availableReflectanceConditions = [
  ReflectanceCondition.R,
  ReflectanceCondition.KS,
];

const useStyles = makeStyles((theme) => ({
  viewingConditionsSwitch: {
    marginLeft: theme.spacing(1),
  },
}));

const SpectralGraphWidget: Component<ModalWidgetProps> = ({
  dataTestId,
  settings,
  onChange,
  measurement,
  widgetSelect,
  measurementName,
}) => {
  const classes = useStyles();

  const [showGraphSetupModal, setShowGraphSetupModal] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [scaleYaxis, setScaleYaxis] = useState<boolean>(true);

  const transformFunc = (
    condition: DescribedMeasurementCondition,
    standardName?: string,
    standardSample?: MeasurementSample,
  ) => toSpectralDataTransform(
    condition,
    settings.reflectanceConditions[0],
    standardName,
    standardSample,
  );

  const spectralData = getStandardDataNewStandard(measurement, transformFunc, measurementName);

  const data = spectralData
    ? getSpectralGraphData(spectralData.data, settings.measurementConditions)
    : undefined;

  // use first measurement condition if no valid selected
  useEffect(() => {
    const hasValidMeasurementCondition = settings.measurementConditions.some(
      (cond) => spectralData?.availableMeasurementConditions.includes(cond),
    );
    if (!hasValidMeasurementCondition && spectralData?.availableMeasurementConditions.length) {
      onChange({ measurementConditions: [spectralData.availableMeasurementConditions[0]] });
    }
  }, [settings.measurementConditions, spectralData?.availableMeasurementConditions]);

  // use first reflectance condition if no valid selected
  useEffect(() => {
    const hasValidReflectanceCondition = settings.reflectanceConditions.some(
      (cond) => availableReflectanceConditions.includes(cond),
    );
    if (!hasValidReflectanceCondition && availableReflectanceConditions.length) {
      onChange({ reflectanceConditions: [availableReflectanceConditions[0]] });
    }
  }, [settings.reflectanceConditions]);

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
        className={WIDGET_NON_DRAGGABLE_CLASS}
        headerLeft={widgetSelect}
        headerRight={<Actions dataTestId={`${makeShortName(dataTestId)}-options`} onClickColorSetup={onClickGraphSetup} />}
        footerLeft={(
          <ReflectanceConditionControls
            dataTestId={`${makeShortName(dataTestId)}-${makeShortName('reflectnace-condition-controls')}`}
            className={classes.viewingConditionsSwitch}
            isMulti={false}
            options={availableReflectanceConditions}
            values={settings.reflectanceConditions}
            onChange={(newReflectanceConditions) => onReflectanceChange(newReflectanceConditions)}
          />
        )}
        footerRight={(
          <Select<string>
            id={`${makeShortName(dataTestId)}-select-measurements-data`}
            isMulti
            isFullWidth
            menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
            data={spectralData?.availableMeasurementConditions}
            value={settings.measurementConditions}
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
          spectralData={data?.allSpectralCurves}
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
