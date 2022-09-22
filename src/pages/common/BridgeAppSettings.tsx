import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { useState } from 'react';

import Button from '../../components/Button';
import { Component } from '../../types/component';
import { Body, Caption } from '../../components/Typography';
import InputField from '../../components/InputField';
import ValidationInput from '../../components/ValidationInput';
import { BridgeAppConfiguration } from '../../data/api/bridgeApp/types';
import { DmsDataMode } from '../../types/dms';
import Select from '../../components/Select';

const useStyles = makeStyles((theme) => ({
  body: {
    margin: theme.spacing(2),
    display: 'table',
    width: 'auto',
    border: 'none',
  },
  settingRow: {
    display: 'table-row',
    width: 'auto',
  },
  settingValue: {
    paddingTop: theme.spacing(1),
    display: 'table-cell',
    width: 'auto',
  },
  settingName: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    display: 'table-cell',
    whiteSpace: 'nowrap',
    width: '1px',
    verticalAlign: 'middle',
  },
}));

type Props = {
  configuration: BridgeAppConfiguration;
  onSave: (newSettings: BridgeAppConfiguration) => void;
}

const ALL_DATA_MODES = ['ma9x', 'mat', 'byk', 'ma3_5', 'xrga'] as DmsDataMode[];

const BridgeAppSettings: Component<Props> = ({
  configuration,
  onSave,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [config, setConfig] = useState(configuration);

  const selectedDataModeOptions = ALL_DATA_MODES.filter(
    (mode) => config?.dataModes.includes(mode),
  );

  const setHostName = (hostName: string) => {
    setConfig({
      ...config,
      hostName,
    });
  };

  const setNumSamples = (valueString: string) => {
    const numberOfAveragingSamples = Number(valueString);
    setConfig({
      ...config,
      numberOfAveragingSamples,
    });
  };

  const onChangeDataModes = (newSelectedOptions?: DmsDataMode[]) => {
    setConfig({
      ...config,
      dataModes: newSelectedOptions || [],
    });
  };

  const store = () => {
    onSave(config);
  };

  return (
    <div className={classes.body}>
      <div className={classes.settingRow}>
        <Caption>{t('titles.BridgeApp')}</Caption>
      </div>
      <div className={classes.settingRow}>
        <div className={classes.settingName}>
          <Body>{t('labels.hostname')}</Body>
        </div>
        <div className={classes.settingValue}>
          <InputField
            value={config.hostName}
            onChange={setHostName}
          />
        </div>
      </div>
      <div className={classes.settingRow}>
        <div className={classes.settingName}>
          <Body>{t('labels.numberSamples')}</Body>
        </div>
        <div className={classes.settingValue}>
          <ValidationInput
            type="number"
            min={1}
            value={`${config.numberOfAveragingSamples}`}
            onChange={setNumSamples}
          />
        </div>
      </div>
      <div className={classes.settingRow}>
        <div className={classes.settingName}>
          <Body>{t('labels.dataMode')}</Body>
        </div>
        <div className={classes.settingValue}>
          <Select
            data={ALL_DATA_MODES}
            value={selectedDataModeOptions}
            isFullWidth
            isMulti
            onChange={(selection) => onChangeDataModes(selection)}
          />
        </div>
      </div>
      <div className={classes.settingRow}>
        <Button onClick={store}>
          {t('labels.store')}
        </Button>
      </div>
    </div>
  );
};

export default BridgeAppSettings;
