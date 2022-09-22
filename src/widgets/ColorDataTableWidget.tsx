import { useEffect, useMemo } from 'react';
import { Column } from 'react-table';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { MeasurementSample } from '@xrite/cloud-formulation-domain-model';
import { useSelector } from 'react-redux';

import { Component } from '../types/component';
import ColorDataTable, { TableData } from './ColorDataTable';
import SingleMultiSwitch from '../pages/common/SingleMultiSwitch';
import ViewingConditionControls from '../pages/common/ViewingConditionControls';
import { SampleMode, WidgetProps } from './WidgetLayout/types';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import {
  useSamplesDataMainPages,
  toColorDataTableTransform,
  getColorTableData,
  SampleInfo,
  SampleData,
} from './utils';
import Select from '../components/Select';
import config, { ROOT_ELEMENT_ID } from '../config';
import { storeTestData } from '../utils/test-utils';
import { makeShortName } from '../../cypress/support/util/selectors';
import { useColorimetricConfiguration } from '../data/configurations';
import { getViewingConditions, getStandardId } from '../data/common';
import { useStandard } from '../data/api';
import { ViewingCondition } from '../types/layout';
import { useDefaultPrecision } from '../utils/utils';
import { getColorimetricStandardColorSpec, isColorimetricStandard } from '../utils/utilsStandard';
import { DescribedMeasurementCondition } from '../types/measurement';
import { getTableHeaderMenuProperties } from '../pages/common/Table/HeaderCell';
import DeltaECell from './ColorDataTable/DeltaECell';
import NumberCell from '../pages/common/Table/NumberCell';

const useStyles = makeStyles((theme) => ({
  viewingConditionsSwitch: {
    marginLeft: theme.spacing(1),
  },
  headerCell: {
    padding: theme.spacing(1, 0),
  },
}));

const defaultActiveColumnIds = ['L', 'a', 'b', 'C', 'h', 'dE', 'dL', 'dA'];
const ColorDataTableWidget: Component<WidgetProps> = ({
  dataTestId,
  sampleMode,
  viewingConditions: savedViewingConditions,
  measurementConditions,
  onChange,
  widgetSelect,
  tableSettings,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { round } = useDefaultPrecision();

  // standard
  const standardId = useSelector(getStandardId);
  const { result: standard } = useStandard({ id: standardId });

  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const configurationViewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration),
    [colorimetricConfiguration],
  );

  const isStandardColorimetric = standard && isColorimetricStandard(standard);

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
  ) => toColorDataTableTransform(
    condition,
    viewingConditions,
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

  const colorData = useMemo(() => getColorTableData(
    allColorData.data,
    measurementConditions,
    viewingConditions,
  ), [allColorData, measurementConditions, viewingConditions]);

  const [activeColumnIds, columns] = useMemo(() => {
    const enabledDeltaEId = colorimetricConfiguration?.metric.deltaE || 'dE00';

    let cols: (Column<TableData> & { disableToggleHide?: boolean })[] = [
      {
        id: 'L',
        accessor: (row) => round((row as SampleData).L),
        ...getTableHeaderMenuProperties(t<string>('labels.lab.L'), true, classes.headerCell),
        Cell: NumberCell,
      },
      {
        id: 'a',
        accessor: (row) => round((row as SampleData).a),
        ...getTableHeaderMenuProperties(t<string>('labels.lab.a'), true, classes.headerCell),
        Cell: NumberCell,
      },
      {
        id: 'b',
        accessor: (row) => round((row as SampleData).b),
        ...getTableHeaderMenuProperties(t<string>('labels.lab.b'), true, classes.headerCell),
        Cell: NumberCell,
      },
      {
        id: 'C',
        accessor: (row) => round((row as SampleData).C),
        ...getTableHeaderMenuProperties(t<string>('labels.Ch.C'), true, classes.headerCell),
        Cell: NumberCell,
      },
      {
        id: 'h',
        accessor: (row) => round((row as SampleData).h),
        ...getTableHeaderMenuProperties(t<string>('labels.Ch.h'), true, classes.headerCell),
        Cell: NumberCell,
      },
    ];

    if (allColorData.sampleInfos.length > 0) {
      cols = [
        ...cols,
        {
          id: 'dL',
          ...getTableHeaderMenuProperties(t<string>('labels.lab.DL'), true, classes.headerCell),
          accessor: (row) => round((row as SampleData).dL),
          Cell: NumberCell,
        },
        {
          id: 'dA',
          ...getTableHeaderMenuProperties(t<string>('labels.lab.Da'), true, classes.headerCell),
          accessor: (row) => round((row as SampleData).dA),
          Cell: NumberCell,
        },
        {
          id: 'dB',
          ...getTableHeaderMenuProperties(t<string>('labels.lab.Db'), true, classes.headerCell),
          accessor: (row) => round((row as SampleData).dB),
          Cell: NumberCell,
        },
        {
          id: 'dC',
          ...getTableHeaderMenuProperties(t<string>('labels.Ch.DC'), true, classes.headerCell),
          accessor: (row) => round((row as SampleData).dC),
          Cell: NumberCell,
        },
        {
          id: 'dH',
          ...getTableHeaderMenuProperties(t<string>('labels.Ch.DH'), true, classes.headerCell),
          accessor: (row) => round((row as SampleData).dH),
          Cell: NumberCell,
        },
      ];

      if (enabledDeltaEId === 'dE00') {
        cols.push({
          id: 'dE',
          ...getTableHeaderMenuProperties(t<string>('labels.dE.dE00'), true, classes.headerCell),
          accessor: (row) => (row as SampleData).dE00?.toFixed(2),
          Cell: DeltaECell,
        });
      } else {
        cols.push({
          id: 'dE',
          ...getTableHeaderMenuProperties(t<string>('labels.dE.dE76'), true, classes.headerCell),
          accessor: (row) => (row as SampleData).dE76?.toFixed(2),
          Cell: DeltaECell,
        });
      }
    }

    return [tableSettings?.activeColumnIds || defaultActiveColumnIds, cols];
  }, [allColorData, tableSettings, colorimetricConfiguration]);

  if (config.ENABLE_TEST_DATA_EXTRACTION) {
    const testTransformFunc = (
      condition: DescribedMeasurementCondition,
      standardName?: string,
      standardSample?: MeasurementSample,
      sampleInfo?: SampleInfo,
      sampleSample?: MeasurementSample,
    ) => toColorDataTableTransform(
      condition,
      availableViewingConditions || [],
      standardName,
      standardSample,
      sampleInfo,
      sampleSample,
    );
    const allTestColorData = useSamplesDataMainPages(isMultiSample, testTransformFunc);
    const transformedColorData = getColorTableData(
      allTestColorData.data,
      allTestColorData.availableMeasurementConditions,
      availableViewingConditions || [],
    );
    const testData = {
      colorData,
      combinedColorData: transformedColorData,
      measurementConditions,
      viewingConditions: availableViewingConditions,
    };
    storeTestData('colorDataTable', testData);
  }

  const selectedMeasurementConditions = measurementConditions
    ?.filter((option) => allColorData.availableMeasurementConditions.includes(option));

  const handleViewingConditionChange = (newViewingConditions: ViewingCondition[]) => {
    if (isStandardColorimetric) return;
    onChange({
      viewingConditions: newViewingConditions,
    });
  };

  return (
    <WidgetPanel
      dataTestId={dataTestId}
      headerLeft={widgetSelect}
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
            dataTestId={`${makeShortName(dataTestId)}-viewing-condition-controls`}
            className={classes.viewingConditionsSwitch}
            isMulti
            options={availableViewingConditions || []}
            values={viewingConditions}
            onChange={handleViewingConditionChange}
          />
        </>
      )}
      footerRight={(
        <Select
          id="color-data-measurement-mode-select"
          inputId="color-data-measurement-mode-select-input"
          isMulti
          isFullWidth
          menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
          data={allColorData.availableMeasurementConditions}
          value={measurementConditions}
          isFetching={!allColorData.availableMeasurementConditions}
          onChange={(newMeasurementConditions) => onChange({
            measurementConditions: newMeasurementConditions,
          })}
        />
      )}
    >
      {Object.keys(colorData).length > 0 && (
        <ColorDataTable
          key={`${allColorData.sampleInfos.length}${colorimetricConfiguration?.metric.deltaE}`}
          viewingConditions={viewingConditions}
          measurementModes={selectedMeasurementConditions}
          data={colorData}
          columns={columns}
          activeColumnIds={activeColumnIds}
          onChange={onChange}
          tableSettings={tableSettings}
        />
      )}
    </WidgetPanel>
  );
};

export default ColorDataTableWidget;
