import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { AppearanceSample } from '@xrite/cloud-formulation-domain-model';
import { useState, useEffect, useMemo } from 'react';
import keyBy from 'lodash/keyBy';

import { Component } from '../types/component';
import Actions from '../pages/common/Actions';
import { WidgetProps } from './WidgetLayout/types';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import FormulationResultTable from './FormulationResultTable';
import { useFormulation } from '../data/cfe';
import { useAssortment, useColorants, useStandard } from '../data/api';
import { Body } from '../components/Typography';
import { selectSampleId } from '../data/reducers/common';
import { getResultTableData } from './utils';
import { storeTestData } from '../utils/test-utils';
import { ResultType } from '../data/reducers/formulation';
import { useColorimetricConfiguration, useFormulationConfiguration } from '../data/configurations';
import { getViewingConditions } from '../data/common';

const useStyles = makeStyles((theme) => ({
  noDataMessage: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
}));

type Sample = {
  sample: AppearanceSample, score: number, type?: ResultType,
};

const FormulationResultWidget: Component<WidgetProps> = ({
  dataTestId,
  widgetSelect,
  onChange,
  tableSettings,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const classes = useStyles();
  const [samples, setSamples] = useState<Sample[]>();

  const { result } = useFormulation();
  const workingAppearanceSamples = useSelector((state) => state.common.workingAppearanceSamples);
  const selectedSampleId = useSelector((state) => state.common.selectedSampleId);
  const {
    configuration: formulationConfiguration,
  } = useFormulationConfiguration();

  useEffect(() => {
    const workingSamplesByParentId = keyBy(workingAppearanceSamples, 'parentAppearanceSampleId');

    const mappedResults = [
      ...(result?.formulationResults ?? []),
      ...(result?.searchResults ?? []),
    ].map((formulationResult) => {
      const workingSample = workingSamplesByParentId[formulationResult.sample.id];
      const workingSampleIsTrial = !!workingSample?.measurements;
      if (workingSample && workingSampleIsTrial) {
        return {
          ...formulationResult,
          sample: AppearanceSample.parse({
            ...formulationResult.sample,
            measurements: workingSample.measurements,
          }),
        };
      }
      return formulationResult;
    });
    setSamples(mappedResults);
  }, [result, workingAppearanceSamples, result]);

  const onRowSelect = (id?: string) => dispatch(selectSampleId(id || ''));
  const standardId = result?.parameters.standardId;
  const {
    result: standard,
  } = useStandard({ id: standardId || '' });
  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const viewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration), [colorimetricConfiguration],
  );
  const assortmentId = result?.formulationResults?.length
    ? result.formulationResults[0].sample.formula?.assortmentId : undefined;
  const {
    result: colorants,
  } = useColorants(assortmentId);
  const {
    result: assortment,
  } = useAssortment(assortmentId);

  // use the primary illuminant and observer from the colorimetric settings
  // compile the result data
  const resultTableData = useMemo(
    () => {
      if (
        !result
        || !standard
        || !samples
        || !viewingConditions?.[0]
        || !formulationConfiguration
      ) return undefined;
      return getResultTableData({
        standardMeasurements: standard.measurements,
        results: samples,
        illuminant: viewingConditions[0].illuminant,
        observer: viewingConditions[0].observer,
        colorants,
        assortment,
        parameters: {
          kc: colorimetricConfiguration?.metric.cRatio ?? 1,
          kl: colorimetricConfiguration?.metric.lRatio ?? 1,
          kh: colorimetricConfiguration?.metric.hRatio ?? 1,
        },
        isFormulation: true,
        sortingCriteria: formulationConfiguration.sortingCriteria,
      });
    },
    [result, standard, samples, formulationConfiguration, colorimetricConfiguration],
  );

  storeTestData('formulationResultData', resultTableData);

  return (
    <WidgetPanel
      dataTestId={dataTestId}
      headerLeft={widgetSelect}
      headerRight={<Actions />}
    >
      {resultTableData !== undefined ? (
        <FormulationResultTable
          dataTestId="formulation-result-table"
          data={resultTableData}
          selectedRowId={selectedSampleId}
          onRowSelect={onRowSelect}
          onChange={onChange}
          tableSettings={tableSettings}
        />
      ) : (
        <Body className={classes.noDataMessage}>{t('messages.noFormulationResults')}</Body>
      )}
    </WidgetPanel>
  );
};

export default FormulationResultWidget;
