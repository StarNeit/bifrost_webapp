import { makeStyles } from '@material-ui/core';
import { Measurement } from '@xrite/cloud-formulation-domain-model';
import { useTranslation } from 'react-i18next';
import { makeShortName } from '../../../../../../cypress/support/util/selectors';

import Button from '../../../../../components/Button';
import { Body, Caption } from '../../../../../components/Typography';
import ValidationInput from '../../../../../components/ValidationInput';
import ModalWidget from '../../../../../widgets/ModalWidget';
import { ModalWidgetSettings } from '../../../../../widgets/WidgetLayout/types';

const useStyles = makeStyles((theme) => ({
  widget: {
    width: '95%',
    height: theme.spacing(32),
    marginLeft: 'auto',
    '& > div': {
      height: '100%',
    },
  },
  title: {
    textTransform: 'uppercase',
  },
  field: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tolerance: {
    marginLeft: theme.spacing(1),
    width: theme.spacing(12),
  },
  toleranceRow: {
    marginLeft: 'auto',
    width: '95%',
    display: 'flex',
    alignItems: 'center',
  },
  smallButton: {
    textTransform: 'capitalize',
    height: theme.spacing(4.25),
    fontSize: theme.spacing(1.25),
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

interface ColorSearchProps {
  dataTestId?: string;
  widgetConfiguration?: ModalWidgetSettings;
  setWidgetConfiguration: (newConfiguration: ModalWidgetSettings) => Promise<void>;
  handleMeasure(): void;
  handleClearMeasure(): void;
  measurement: Measurement | undefined;
  loading?: boolean;
  disabled?: boolean;
  deTolerance: number;
  setDeTolerance(newValue: number): void;
}

const ColorSearch: React.FC<ColorSearchProps> = ({
  dataTestId,
  widgetConfiguration,
  setWidgetConfiguration,
  handleMeasure,
  handleClearMeasure,
  measurement,
  loading,
  disabled,
  deTolerance,
  setDeTolerance,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <div className={classes.field}>
        <Caption className={classes.title}>
          {`${t('labels.color')} ${t('labels.search')}`}
        </Caption>
        <div className={classes.buttonContainer}>
          <Button
            data-testid={`${makeShortName(dataTestId)}-clear-button`}
            variant="primary"
            className={classes.smallButton}
            onClick={handleClearMeasure}
            disabled={loading || disabled}
          >
            {t('labels.clear')}
          </Button>
          <Button
            data-testid={`${makeShortName(dataTestId)}-measure-button`}
            variant="primary"
            className={classes.smallButton}
            onClick={handleMeasure}
            showSpinner={loading}
            disabled={disabled}
          >
            {t('labels.measure')}
          </Button>
        </div>
      </div>

      {/*  widget */}
      {widgetConfiguration
      && (
      <>
        <div className={classes.widget}>
          { widgetConfiguration && (
            <ModalWidget
              dataTestId="color-search"
              configuration={widgetConfiguration}
              setConfiguration={setWidgetConfiguration}
              measurement={measurement}
            />
          )}
        </div>
        <div className={classes.toleranceRow}>
          <Body>{t('labels.deTolerance')}</Body>

          <ValidationInput
            dataTestId={`${makeShortName(dataTestId)}-de-tolerance`}
            className={classes.tolerance}
            type="number"
            value={deTolerance}
            min={0}
            max={5}
            onChange={(input: string) => setDeTolerance(Number(input))}
          />
        </div>
      </>
      )}
    </>
  );
};

export default ColorSearch;
