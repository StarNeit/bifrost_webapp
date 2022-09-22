import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Component } from '../../types/component';
import Page from '../../components/Page';
import { useQCPageConfiguration } from '../../data/configurations';
import LoadingContainer from '../../components/LoadingContainer';
import WidgetLayout from '../../widgets/WidgetLayout';
import NavigationPane from '../common/NavigationPane';
import QCContextWrapper from '../../data/contexts/QC';
import { WidgetType } from '../../widgets/WidgetLayout/types';
import { useWidgetTypeLabels } from '../Formulation/utils';
import { PageConfiguration } from '../../data/api/uss/pages/types';
import { DEFAULT_PAGE_CONFIGURATION_NAME } from '../../data/api/uss/pages';
import SaveAppearanceSampleQC from '../common/SaveAppearanceSampleForQC';

const useStyles = makeStyles((theme) => ({
  pane: {
    marginRight: theme.spacing(3),
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
}));

const availableWidgetTypes = [
  WidgetType.ColorSwatch,
  WidgetType.ColorData,
  WidgetType.ColorPlot,
  WidgetType.SpectralGraph,
];

const QC: Component = () => {
  const { t } = useTranslation();

  const {
    configuration,
    debouncedSetConfiguration: setConfiguration,
  } = useQCPageConfiguration();
  const selectedPageConfiguration = configuration?.[0];

  const classes = useStyles();

  const widgetTypeLabels = useWidgetTypeLabels();

  return (
    <QCContextWrapper>
      <Page title={t('labels.qc')}>
        <NavigationPane className={classes.pane} />
        <div className={classes.wrapper}>
          <LoadingContainer fetching={!configuration}>
            {selectedPageConfiguration && (
              <WidgetLayout
                configuration={selectedPageConfiguration.widgetSettingsCollection}
                setConfiguration={(newConfiguration: PageConfiguration[]) => setConfiguration([{
                  name: DEFAULT_PAGE_CONFIGURATION_NAME,
                  widgetSettingsCollection: newConfiguration[0].widgetSettingsCollection,
                }])}
                availableWidgetTypes={availableWidgetTypes}
                widgetTypeLabels={widgetTypeLabels}
              />
            )}
          </LoadingContainer>

          <SaveAppearanceSampleQC dataTestId="qc-save-sample" />
        </div>
      </Page>
    </QCContextWrapper>
  );
};

export default QC;
