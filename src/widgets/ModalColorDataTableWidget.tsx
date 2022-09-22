import { Column } from 'react-table';
import { useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ColorSpaceType, MeasurementSample } from '@xrite/cloud-formulation-domain-model';

import { Component } from '../types/component';
import ColorDataTable, { TableData } from './ColorDataTable';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import ViewingConditionControls from '../pages/common/ViewingConditionControls';
import {
  getStandardDataNewStandard,
  getColorTableData,
  toColorDataTableTransform,
  SampleInfo,
  SampleData,
} from './utils';
import { WIDGET_NON_DRAGGABLE_CLASS } from '../utils/constants';
import Select from '../components/Select';
import { ROOT_ELEMENT_ID } from '../config';
import { useColorimetricConfiguration } from '../data/configurations';
import { makeShortName } from '../../cypress/support/util/selectors';
import { getViewingConditions } from '../data/common';
import { useDefaultPrecision } from '../utils/utils';
import { DescribedMeasurementCondition } from '../types/measurement';
import { ModalWidgetProps } from './WidgetLayout/types';
import NumberCell from '../pages/common/Table/NumberCell';

const useStyles = makeStyles((theme) => ({
  viewingConditionsSwitch: {
    marginLeft: theme.spacing(1),
  },
}));

const ColorDataTableWidget: Component<ModalWidgetProps> = ({
  dataTestId,
  settings,
  onChange,
  measurement,
  widgetSelect,
  measurementName,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { round, toString } = useDefaultPrecision();
  const { measurementConditions, viewingConditions, tableSettings } = settings;

  const labViewingCondition = useMemo(() => {
    const colorSpecification = measurement?.measurementSamples[0].colorSpecification;

    if (colorSpecification && colorSpecification.illuminant && colorSpecification.observer
      && colorSpecification?.colorSpace === ColorSpaceType.CIELab) {
      return ({
        illuminant: colorSpecification.illuminant,
        observer: colorSpecification.observer,
      });
    }
    return undefined;
  }, [measurement]);

  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const configurationViewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration),
    [colorimetricConfiguration],
  );

  const availableViewingConditions = useMemo(() => (
    labViewingCondition ? [labViewingCondition] : configurationViewingConditions
  ), [configurationViewingConditions, labViewingCondition]);

  const [activeColumnIds, columns] = useMemo(() => {
    const defaultActiveColumnIds = ['L', 'a', 'b', 'C', 'h'];
    const cols: (Column<TableData> & { disableToggleHide?: boolean })[] = [
      {
        id: 'L',
        accessor: (row) => round((row as SampleData).L, toString),
        Header: t<string>('labels.lab.L'),
        disableToggleHide: true,
        disableSortBy: true,
        Cell: NumberCell,
      },
      {
        id: 'a',
        accessor: (row) => round((row as SampleData).a, toString),
        Header: t<string>('labels.lab.a'),
        disableToggleHide: true,
        disableSortBy: true,
        Cell: NumberCell,
      },
      {
        id: 'b',
        accessor: (row) => round((row as SampleData).b, toString),
        Header: t<string>('labels.lab.b'),
        disableToggleHide: true,
        disableSortBy: true,
        Cell: NumberCell,
      },
      {
        id: 'C',
        accessor: (row) => round((row as SampleData).C, toString),
        Header: t<string>('labels.Ch.C'),
        disableToggleHide: true,
        disableSortBy: true,
        Cell: NumberCell,
      },
      {
        id: 'h',
        accessor: (row) => round((row as SampleData).h, toString),
        Header: t<string>('labels.Ch.h'),
        disableToggleHide: true,
        disableSortBy: true,
        Cell: NumberCell,
      },
    ];
    return [tableSettings?.activeColumnIds || defaultActiveColumnIds, cols];
  }, [tableSettings]);

  // use first viewing condition if no valid selected
  useEffect(() => {
    if (!availableViewingConditions) return;

    const hasValidViewingCondition = viewingConditions.some(
      (cond) => availableViewingConditions.some(
        (cond2) => (cond.observer === cond2.observer && cond.illuminant === cond2.illuminant),
      ),
    );
    if (!hasValidViewingCondition && availableViewingConditions.length) {
      onChange({ viewingConditions: [availableViewingConditions[0]] });
    }

    // use only the conditions available in the colorimetric settings
    const validViewingConditions = viewingConditions.filter((viewingCondition) => {
      return Boolean(availableViewingConditions.find(
        (availableViewingCondition) => (
          availableViewingCondition.illuminant === viewingCondition.illuminant
        )
          && availableViewingCondition.observer === viewingCondition.observer,
      ));
    });

    if (validViewingConditions.length !== viewingConditions.length) {
      onChange({
        viewingConditions: validViewingConditions,
      });
    }
  }, [viewingConditions, availableViewingConditions]);

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

  const allColorData = getStandardDataNewStandard(measurement, transformFunc, measurementName);

  // use first measurement condition if no valid selected
  useEffect(() => {
    const hasValidMeasurementCondition = measurementConditions.some(
      (cond) => allColorData?.availableMeasurementConditions.includes(cond),
    );
    if (!hasValidMeasurementCondition && allColorData?.availableMeasurementConditions.length) {
      onChange({ measurementConditions: [allColorData.availableMeasurementConditions[0]] });
    }
  }, [measurementConditions, allColorData?.availableMeasurementConditions]);

  const colorData = allColorData
    ? getColorTableData(
      allColorData.data,
      measurementConditions,
      viewingConditions,
    ) : undefined;

  const selectedMeasurementConditions = measurementConditions
    ?.filter((option) => allColorData?.availableMeasurementConditions.includes(option));

  return (
    <WidgetPanel
      dataTestId={dataTestId}
      className={WIDGET_NON_DRAGGABLE_CLASS}
      headerLeft={widgetSelect}
      footerLeft={(
        <ViewingConditionControls
          dataTestId={`${makeShortName(dataTestId)}-${makeShortName('viewing-condition-controls')}`}
          className={classes.viewingConditionsSwitch}
          isMulti
          options={availableViewingConditions || []}
          values={viewingConditions}
          onChange={(newViewingConditions) => onChange({
            viewingConditions: newViewingConditions,
          })}
        />
      )}
      footerRight={(
        <Select<string>
          id={`${makeShortName(dataTestId)}-select-measurements-data`}
          inputId="color-data-measurement-mode-select-input"
          isMulti
          isFullWidth
          menuPortalTarget={document.getElementById(ROOT_ELEMENT_ID)}
          value={measurementConditions}
          data={allColorData?.availableMeasurementConditions}
          onChange={(newMeasurementConditions) => onChange({
            measurementConditions: newMeasurementConditions,
          })}
        />
      )}
    >
      <ColorDataTable
        viewingConditions={viewingConditions}
        measurementModes={selectedMeasurementConditions}
        data={colorData}
        columns={columns}
        activeColumnIds={activeColumnIds}
        onChange={onChange}
        tableSettings={tableSettings}
      />
    </WidgetPanel>
  );
};

export default ColorDataTableWidget;
