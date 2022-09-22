import { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import {
  ColorSpaceType,
  ColorSpecification,
  IlluminantType,
  Measurement,
  MeasurementSample,
  ObserverType,
} from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import DataCube from '@xrite/cloud-formulation-domain-model/measurement/DataCube';

import { Component } from '../../../types/component';
import { getNewMeasurementCondition } from '../../../utils/colorimetry';
import Select from '../../../components/Select';
import { Body } from '../../../components/Typography';
import ObserverSwitch from '../../Configuration/Colorimetric/ObserverSwitch';
import ColorInput from '../../../components/ColorInput';
import { MeasurementAvailableCondition } from '../../../types/formulation';
import { getMeasurementConditionDescription } from '../../../utils/utilsMeasurement';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3.5),
  },
  label: {
    minWidth: theme.spacing(17.5),
  },
}));

type Props = {
  onManualUpdated(newMeasurement: Measurement): void;
  initialMeasurement?: Measurement;
};

type ColorimetricMeasurementData = {
  lEntry: number,
  aEntry: number,
  bEntry: number,
  illuminant: IlluminantType,
  observer: ObserverType,
  measurementCondition: MeasurementAvailableCondition,
}

const allSupportedMeasurementConditions = ['M0', 'M1', 'M2', 'M3', 'D8spin', 'D8spex'] as MeasurementAvailableCondition[];

const ManualConfigForStandard: Component<Props> = ({ onManualUpdated, initialMeasurement }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const initialSample = initialMeasurement?.measurementSamples[0];
  const initialSampleData = initialSample?.data?.data?.length === 3
    ? initialSample?.data?.data
    : [50, 0, 0];
  const initialColorSpec = initialSample?.colorSpecification;
  const initialMeasCondDescr = initialSample?.measurementCondition
    ? getMeasurementConditionDescription(initialSample?.measurementCondition)
    : undefined;

  const filteredIlluminants = useMemo(() => {
    return Object.values(IlluminantType).filter((type) => type !== IlluminantType.E);
  }, []);

  const [measurementData, setMeasurementData] = useState<ColorimetricMeasurementData>({
    lEntry: initialSampleData[0],
    aEntry: initialSampleData[1],
    bEntry: initialSampleData[2],
    illuminant: initialColorSpec?.illuminant || IlluminantType.D50,
    observer: initialColorSpec?.observer || ObserverType.TwoDegree,
    measurementCondition: allSupportedMeasurementConditions.find(
      (cond) => cond === initialMeasCondDescr,
    ) || 'M0',
  });

  const createNewMeasurementFromManualEntry = (data: ColorimetricMeasurementData) => {
    const id = uuid();
    const creationDateTime = (new Date()).toISOString();

    const colorSpecification = new ColorSpecification({
      colorSpace: ColorSpaceType.CIELab,
      illuminant: data.illuminant,
      observer: data.observer,
    });

    const dataCube = new DataCube({
      data: [data.lEntry, data.aEntry, data.bEntry],
    });

    const newMeasurementSample = new MeasurementSample({
      measurementCondition: getNewMeasurementCondition(data.measurementCondition),
      colorSpecification,
      data: dataCube,
    });

    return new Measurement({
      id,
      creationDateTime,
      measurementSamples: [newMeasurementSample],
    });
  };

  const transferColorToStandard = (data: ColorimetricMeasurementData) => {
    const newMeasurement = createNewMeasurementFromManualEntry(data);
    onManualUpdated(newMeasurement);
  };

  const updateData = (updatedVariables: Partial<ColorimetricMeasurementData>) => {
    const newData = { ...measurementData, ...updatedVariables };
    setMeasurementData(newData);
    transferColorToStandard(newData);
  };

  useEffect(() => transferColorToStandard(measurementData), []);

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Body className={classes.label}>{t('labels.illuminant')}</Body>
        <Select<IlluminantType>
          isFullWidth
          id="illuminant-select"
          instanceId="illuminant-select"
          isMulti={false}
          value={measurementData.illuminant}
          data={filteredIlluminants}
          labelProp={(option: IlluminantType) => option}
          onChange={(illuminant) => updateData({ illuminant })}
        />
      </div>
      <div className={classes.row}>
        <Body className={classes.label}>{t('labels.observer')}</Body>
        <ObserverSwitch
          handleToggle={(observer) => updateData({ observer })}
          value={measurementData.observer}
        />
      </div>
      <div className={classes.row}>
        <Body className={classes.label}>
          L*: a*: b*
        </Body>
        <ColorInput
          aValue={String(measurementData.lEntry)}
          bValue={String(measurementData.aEntry)}
          cValue={String(measurementData.bEntry)}
          aValueRange={{ min: 0, max: 100 }}
          bValueRange={{ min: -150, max: 150 }}
          cValueRange={{ min: -150, max: 150 }}
          aLabel="L*"
          bLabel="a*"
          cLabel="b*"
          handleAValueChange={(lEntry) => {
            updateData({ lEntry });
          }}
          handleBValueChange={(aEntry) => {
            updateData({ aEntry });
          }}
          handleCValueChange={(bEntry) => {
            updateData({ bEntry });
          }}
          disabled={false}
        />
      </div>
      <div className={classes.row}>
        <Body className={classes.label}>
          {t('labels.measurementCondition')}
        </Body>
        <Select<MeasurementAvailableCondition>
          isFullWidth
          id="measurementCondition-select"
          instanceId="measurementCondition-select"
          isMulti={false}
          value={measurementData.measurementCondition}
          data={allSupportedMeasurementConditions}
          onChange={(measurementCondition) => updateData({ measurementCondition })}
        />
      </div>
    </div>
  );
};

export default ManualConfigForStandard;
