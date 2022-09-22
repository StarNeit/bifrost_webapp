import { makeStyles } from '@material-ui/core';
import { Measurement } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBridgeApp } from '../../../data/api/bridgeApp/bridgeAppHook';
import { Component } from '../../../types/component';
import BridgeAppControlPanel from '../BridgeAppControlPanel';
import { Subtitle } from '../../../components/Typography';
import Button from '../../../components/Button';
import { IMPORT_SOURCE } from '../../../constants/ui';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  labelImport: {
    fontSize: theme.spacing(2.5),
    marginRight: theme.spacing(4),
  },
  bridgeAppPanel: {
    marginRight: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  button: {
    height: theme.spacing(5.25),
    background: theme.palette.surface[3],
    fontSize: theme.spacing(1.5),
    fontWeight: 'bold',
    color: theme.palette.text.primary,
    marginRight: theme.spacing(1),
    '&:hover': {
      background: theme.palette.surface[4],
    },
    textTransform: 'capitalize',
  },
  activeButton: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      background: theme.palette.info.main,
    },
  },
}));

type Props = {
  importSource?: IMPORT_SOURCE;
  onImportSourceChange(importSource: IMPORT_SOURCE): void;
  onMeasurementChange(measurement?: Measurement): void;
  bridgeImportEnabled?: boolean;
  pantoneImportEnabled?: boolean;
  dmsImportEnabled?: boolean;
  fileImportEnabled?: boolean;
  manualImportEnabled?: boolean;
};

const Header: Component<Props> = ({
  importSource,
  onImportSourceChange,
  onMeasurementChange,
  bridgeImportEnabled = true,
  pantoneImportEnabled = true,
  dmsImportEnabled = true,
  fileImportEnabled = true,
  manualImportEnabled = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    requestMeasurements,
    cancelRequest,
    isRequestInProgress,
    measurement,
  } = useBridgeApp();

  useEffect(() => {
    onMeasurementChange(measurement);
  }, [measurement]);

  return (
    <div className={classes.header}>
      <Subtitle className={classes.labelImport}>IMPORT FROM</Subtitle>

      {bridgeImportEnabled && (
        <Button
          data-testid="measure-bridge-button"
          data-test-is-selected={importSource === IMPORT_SOURCE.BRIDGE}
          className={
            clsx(classes.button, importSource === IMPORT_SOURCE.BRIDGE && classes.activeButton)
          }
          disabled={isRequestInProgress}
          onClick={() => {
            onImportSourceChange(IMPORT_SOURCE.BRIDGE);
            requestMeasurements();
          }}
        >
          {t('labels.measure')}
        </Button>
      )}

      {pantoneImportEnabled && (
        <Button
          data-testid="pantone-live-button"
          data-test-is-selected={importSource === IMPORT_SOURCE.PANTONE}
          className={
            clsx(classes.button, importSource === IMPORT_SOURCE.PANTONE && classes.activeButton)
          }
          onClick={() => {
            onImportSourceChange(IMPORT_SOURCE.PANTONE);
          }}
        >
          {t('labels.pantoneLive')}
        </Button>
      )}

      {dmsImportEnabled && (
        <Button
          data-testid="dms-button"
          data-test-is-selected={importSource === IMPORT_SOURCE.DMS}
          className={clsx(classes.button, {
            [classes.activeButton]: importSource === IMPORT_SOURCE.DMS,
          })}
          disabled={isRequestInProgress}
          onClick={() => {
            onImportSourceChange(IMPORT_SOURCE.DMS);
          }}
        >
          {t('labels.dms')}
        </Button>
      )}

      {fileImportEnabled && (
        <Button
          data-testid="file-button"
          data-test-is-selected={importSource === IMPORT_SOURCE.FILE}
          className={
            clsx(classes.button, importSource === IMPORT_SOURCE.FILE && classes.activeButton)
          }
          disabled={isRequestInProgress}
          onClick={() => {
            onImportSourceChange(IMPORT_SOURCE.FILE);
          }}
        >
          {t('labels.file')}
        </Button>
      )}

      {manualImportEnabled && (
        <Button
          data-testid="manual-button"
          data-test-is-selected={importSource === IMPORT_SOURCE.MANUAL}
          className={
            clsx(classes.button, importSource === IMPORT_SOURCE.MANUAL && classes.activeButton)
          }
          disabled={isRequestInProgress}
          onClick={() => {
            onImportSourceChange(IMPORT_SOURCE.MANUAL);
          }}
        >
          {t('labels.manual')}
        </Button>
      )}

      <div className={classes.bridgeAppPanel}>
        {importSource === IMPORT_SOURCE.BRIDGE && (
          <BridgeAppControlPanel
            isRequestInProgress={isRequestInProgress}
            cancelRequest={cancelRequest}
          />
        )}
      </div>

    </div>
  );
};

export default Header;
