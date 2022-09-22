import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

import { Component } from '../../types/component';
import Page from '../../components/Page';
import { useCorrectionPageConfiguration } from '../../data/configurations';
import LoadingContainer from '../../components/LoadingContainer';
import WidgetLayout from '../../widgets/WidgetLayout';
import CorrectionSetupPane from './CorrectionSetupPane';
import NavigationPane from '../common/NavigationPane';
import SaveAppearanceSample from '../common/SaveAppearanceSample';
import { WidgetType } from '../../widgets/WidgetLayout/types';
import { useWidgetTypeLabels } from '../Formulation/utils';
import { PageConfiguration } from '../../data/api/uss/pages/types';
import { DEFAULT_PAGE_CONFIGURATION_NAME } from '../../data/api/uss/pages';

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
  WidgetType.RecipeDisplay,
  WidgetType.CorrectionResult,
];

const Correction: Component = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    configuration,
    debouncedSetConfiguration: setConfiguration,
  } = useCorrectionPageConfiguration();

  const selectedPageConfiguration = configuration?.[0];

  const widgetTypeLabels = useWidgetTypeLabels();

  return (
    <Page title={t('labels.correction')}>
      <NavigationPane className={classes.pane} />
      <CorrectionSetupPane className={classes.pane} />

      <div className={classes.wrapper}>
        <LoadingContainer fetching={!configuration}>
          {selectedPageConfiguration && (
            <WidgetLayout
              dataTestId="correction-widget"
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

        <SaveAppearanceSample dataTestId="correction-save-sample" isCorrectionSample />
      </div>
    </Page>
  );
};

export default Correction;
