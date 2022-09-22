import { makeStyles } from '@material-ui/core';
import { MeasurementSample } from '@xrite/cloud-formulation-domain-model';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Component } from '../types/component';
import SingleMultiSwitch from '../pages/common/SingleMultiSwitch';
import ViewingConditionControls from '../pages/common/ViewingConditionControls';
import { SampleMode, WidgetProps } from './WidgetLayout/types';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import {
  SampleInfo,
  useSamplesDataMainPages,
} from './utils';
import Select from '../components/Select';
import { ROOT_ELEMENT_ID } from '../config';
import { useColorimetricConfiguration } from '../data/configurations';
import ColorPlot, { ColorPlotEntry } from './ColorPlot';
import {
  calculateLabCh,
  isMeasurementSampleSupported,
} from '../utils/colorimetry';
import { ViewingCondition } from '../types/layout';
import Actions from '../pages/common/Actions';
import ColorPlotSetupModal from './ColorPlot/ColorPlotSetupModal';
import { getViewingConditions, getStandardId, useSampleId } from '../data/common';
import { useStandard } from '../data/api';
import { getColorimetricStandardColorSpec, isColorimetricStandard } from '../utils/utilsStandard';
import { DescribedMeasurementCondition } from '../types/measurement';

const useStyles = makeStyles((theme) => ({
  viewingConditionsSwitch: {
    marginLeft: theme.spacing(1),
  },
}));

const toColorPlotTransform = (
  condition: DescribedMeasurementCondition,
  viewingCondition?: ViewingCondition,
  standardName?: string,
  standardSample?: MeasurementSample,
  sampleInfo?: SampleInfo,
  sampleSample?: MeasurementSample,
): {
  L: number,
  a: number,
  b: number,
  C: number,
  h: number,
  standardName?: string,
  sampleName?: string,
  sampleId?: string,
} | undefined => {
  if (!viewingCondition) return undefined;

  if (standardSample && !sampleSample) {
    if (!isMeasurementSampleSupported(standardSample)) return undefined;
    const labch = calculateLabCh(
      standardSample,
      viewingCondition.illuminant,
      viewingCondition.observer,
    );
    return {
      L: labch.lab[0],
      a: labch.lab[1],
      b: labch.lab[2],
      C: labch.C,
      h: labch.h,
    };
  }
  if (sampleSample) {
    if (!isMeasurementSampleSupported(sampleSample)) return undefined;
    const labch = calculateLabCh(
      sampleSample,
      viewingCondition.illuminant,
      viewingCondition.observer,
    );
    return {
      L: labch.lab[0],
      a: labch.lab[1],
      b: labch.lab[2],
      C: labch.C,
      h: labch.h,
      standardName,
      sampleName: sampleInfo?.name,
      sampleId: sampleInfo?.id,
    };
  }
  return undefined;
};

const ColorPlotWidget: Component<WidgetProps> = ({
  dataTestId,
  sampleMode,
  viewingConditions: savedViewingConditions,
  measurementConditions,
  onChange,
  widgetSelect,
}) => {
  const classes = useStyles();
  const [setupModalOpened, setSetupModalOpened] = useState(false);
  const [coloredBackground, setColoredBackground] = useState(false);

  // standard
  const standardId = useSelector(getStandardId);
  const { result: standard } = useStandard({ id: standardId });
  const isStandardColorimetric = standard && isColorimetricStandard(standard);

  // sample selection
  const { selectedSampleId, setSampleId } = useSampleId();

  // config
  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const configurationViewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration),
    [colorimetricConfiguration],
  );

  const labViewingCondition = useMemo(() => {
    if (standard && isStandardColorimetric) {
      const colorSpecification = getColorimetricStandardColorSpec(standard);
      if (colorSpecification.illuminant && colorSpecification.observer) {
        return ({
          illuminant: colorSpecification.illuminant,
          observer: colorSpecification.observer,
        });
      }
    }
    return undefined;
  }, [standard]);

  const availableViewingConditions = useMemo(() => (
    labViewingCondition ? [labViewingCondition] : configurationViewingConditions
  ), [configurationViewingConditions, labViewingCondition]);

  const viewingConditions = useMemo(() => (
    (isStandardColorimetric && labViewingCondition) ? [labViewingCondition] : savedViewingConditions
  ), [savedViewingConditions, labViewingCondition]);

  useEffect(() => {
    if (!availableViewingConditions) return;

    const hasValidViewingCondition = viewingConditions.some(
      (cond) => availableViewingConditions.some(
        (cond2) => (cond.observer === cond2.observer && cond.illuminant === cond2.illuminant),
      ),
    );

    // use first viewing condition if no valid selected
    if (!hasValidViewingCondition && availableViewingConditions.length) {
      onChange({ viewingConditions: [availableViewingConditions[0]] });
    }

    // use only the conditions available in the colorimetric settings
    const validViewingConditions = viewingConditions.filter((viewingCondition) => {
      return Boolean(availableViewingConditions.find(
        (availableViewingCondition) => (
          availableViewingCondition.illuminant === viewingCondition.illuminant
        )
          && (availableViewingCondition.observer === viewingCondition.observer),
      ));
    });

    if (validViewingConditions.length !== viewingConditions.length) {
      onChange({
        viewingConditions: validViewingConditions,
      });
    }
  }, [viewingConditions, availableViewingConditions]);

  const isMultiSample = (sampleMode === SampleMode.Multi);

  const transformFunc = (
    condition: DescribedMeasurementCondition,
    standardName?: string,
    standardSample?: MeasurementSample,
    sampleInfo?: SampleInfo,
    sampleSample?: MeasurementSample,
  ) => toColorPlotTransform(
    condition,
    viewingConditions[0],
    standardName,
    standardSample,
    sampleInfo,
    sampleSample,
  );

  const allColorData = useSamplesDataMainPages(isMultiSample, transformFunc);

  // use first measurement condition if no valid selected
  useEffect(() => {
    const hasValidMeasurementCondition = measurementConditions.some(
      (cond) => allColorData?.availableMeasurementConditions.includes(cond),
    );
    if (!hasValidMeasurementCondition && allColorData?.availableMeasurementConditions.length) {
      onChange({ measurementConditions: [allColorData.availableMeasurementConditions[0]] });
    }
  }, [measurementConditions, allColorData?.availableMeasurementConditions]);

  const standardColors: ColorPlotEntry[] = [];
  const samples = allColorData.sampleInfos.map(({ id, name }) => ({
    id,
    name,
    colors: [] as ColorPlotEntry[],
  }));

  allColorData.data.forEach((data) => {
    if (!data.standardData) return;
    const name = data.condition.description;
    if (!measurementConditions.includes(name)) return;
    standardColors.push({
      name,
      ...data.standardData,
    });
    data.samplesData.forEach((sampleData, index) => {
      samples[index].colors.push({
        name,
        ...sampleData,
      });
    });
  });

  const tolerances = allColorData.selectedStandard?.tolerances || [];

  return (
    <>
      <WidgetPanel
        dataTestId={dataTestId}
        headerLeft={widgetSelect}
        headerRight={<Actions onClickColorSetup={() => setSetupModalOpened(true)} />}
        footerLeft={(
          <>
            <SingleMultiSwitch
              isMulti={sampleMode === SampleMode.Multi}
              onChange={(isMulti) => {
                const newSampleMode = isMulti ? SampleMode.Multi : SampleMode.Single;
                onChange({ sampleMode: newSampleMode });
              }}
            />

            <ViewingConditionControls
              className={classes.viewingConditionsSwitch}
              isMulti={false}
              options={availableViewingConditions || []}
              values={viewingConditions}
              onChange={(newViewingConditions) => onChange({
                viewingConditions: newViewingConditions,
              })}
            />
          </>
        )}
        footerRight={(
          <Select
            id="color-plot-measurement-mode-select"
            inputId="color-plot-measurement-mode-select-input"
            isMulti={false}
            isFullWidth
            menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
            data={allColorData.availableMeasurementConditions}
            value={measurementConditions[0]}
            isFetching={!allColorData.availableMeasurementConditions}
            onChange={(newMeasurementCondition) => onChange({
              measurementConditions: [newMeasurementCondition],
            })}
          />
        )}
      >
        <ColorPlot
          standardColors={standardColors}
          samples={samples}
          tolerances={tolerances}
          shouldUseColoredBackground={coloredBackground}
          selectedStandardName={allColorData.selectedStandard?.name}
          selectedStandardId={allColorData.selectedStandard?.id}
          selectedSampleId={selectedSampleId}
          setSelectedId={setSampleId}
        />
      </WidgetPanel>
      <ColorPlotSetupModal
        isOpenModal={setupModalOpened}
        closeModal={() => setSetupModalOpened(false)}
        coloredBackground={coloredBackground}
        onColoredBackgroundChange={setColoredBackground}
      />
    </>
  );
};

export default ColorPlotWidget;
