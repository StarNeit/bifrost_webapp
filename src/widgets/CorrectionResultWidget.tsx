import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { useMemo } from 'react';

import { Component } from '../types/component';
import Actions from '../pages/common/Actions';
import { WidgetProps } from './WidgetLayout/types';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import FormulationResultTable from './FormulationResultTable';
import { useCorrection } from '../data/cfe';
import { useStandard } from '../data/api';
import { Body } from '../components/Typography';
import { selectSampleId } from '../data/reducers/common';
import { storeTestData } from '../utils/test-utils';
import { getResultTableData } from './utils';
import { useColorimetricConfiguration } from '../data/configurations';
import { getViewingConditions } from '../data/common';

const useStyles = makeStyles((theme) => ({
  noDataMessage: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
}));

const CorrectionResultWidget: Component<WidgetProps> = ({
  dataTestId,
  widgetSelect,
  onChange,
  tableSettings,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const classes = useStyles();

  const { results } = useCorrection();
  // Sample
  const selectedSampleId = useSelector((state) => state.common.selectedSampleId);
  const onRowSelect = (id?: string) => dispatch(selectSampleId(id || ''));

  const standardId = useSelector((state) => state.common.selectedStandardId);
  const {
    result: standard,
  } = useStandard({ id: standardId || '' });
  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const viewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration), [colorimetricConfiguration],
  );

  // use the primary illuminant and observer from the colorimetric settings
  // compile the result data
  const resultTableData = useMemo(() => (
    results && standard && viewingConditions?.[0]
      ? getResultTableData(
        {
          standardMeasurements: standard.measurements,
          results,
          illuminant: viewingConditions[0].illuminant,
          observer: viewingConditions[0].observer,
        },
      )
      : undefined),
  [results, standard]);

  if (resultTableData) {
    storeTestData('correctionResultData', resultTableData);
  }

  return (
    <WidgetPanel
      dataTestId={dataTestId}
      headerLeft={widgetSelect}
      headerRight={<Actions />}
    >
      {resultTableData !== undefined ? (
        <FormulationResultTable
          dataTestId="correction-result-table"
          data={resultTableData}
          selectedRowId={selectedSampleId}
          onRowSelect={onRowSelect}
          onChange={onChange}
          tableSettings={tableSettings}
        />
      ) : (
        <Body className={classes.noDataMessage}>{t('messages.noCorrectionResults')}</Body>
      )}
    </WidgetPanel>
  );
};

export default CorrectionResultWidget;
