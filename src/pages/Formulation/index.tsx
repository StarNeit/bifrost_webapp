import { useTranslation } from 'react-i18next';
import {
  makeStyles,
} from '@material-ui/core/styles';

import { Component } from '../../types/component';
import Page from '../../components/Page';
import NavigationPane from '../common/NavigationPane';
import FormulationSetupPane from './FormulationSetupPane';
import LoadingContainer from '../../components/LoadingContainer';
import WidgetLayout from '../../widgets/WidgetLayout';
import { useFormulationPageConfiguration } from '../../data/configurations';
import SaveAppearanceSample from '../common/SaveAppearanceSample';
import { WidgetType } from '../../widgets/WidgetLayout/types';
import { useWidgetTypeLabels } from './utils';
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
  WidgetType.SpectralGraph,
  WidgetType.RecipeDisplay,
  WidgetType.FormulationResult,
  WidgetType.ColorPlot,
];

const Formulation: Component = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    configuration,
    debouncedSetConfiguration: setConfiguration,
  } = useFormulationPageConfiguration();
  const selectedPageConfiguration = configuration?.[0];

  const widgetTypeLabels = useWidgetTypeLabels();

  return (
    <Page title={t('labels.formulation')}>
      <NavigationPane className={classes.pane} />

      <FormulationSetupPane className={classes.pane} />

      <div className={classes.wrapper}>
        <LoadingContainer fetching={!configuration}>
          {selectedPageConfiguration && (
            <WidgetLayout
              dataTestId="formulation-widget"
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

        <SaveAppearanceSample dataTestId="formulation-save-sample" />
      </div>
    </Page>
  );
};

export default Formulation;
