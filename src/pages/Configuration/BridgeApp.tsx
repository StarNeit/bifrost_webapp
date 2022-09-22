import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useConfiguration as useBridgeAppConfiguration } from '../../data/api/bridgeAppConfiguration';
import { Title } from '../../components/Typography';
import BridgeAppSettings from '../common/BridgeAppSettings';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}));

const BridgeApp = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [bridgeAppConfig, setBridgeAppConfig] = useBridgeAppConfiguration();

  return (
    <div className={classes.root}>
      <Title>{t('labels.configuration')}</Title>
      {bridgeAppConfig && (
        <BridgeAppSettings configuration={bridgeAppConfig} onSave={setBridgeAppConfig} />
      )}
    </div>
  );
};

export default BridgeApp;
