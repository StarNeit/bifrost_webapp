import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

import Button from '../../components/Button';
import { Component } from '../../types/component';

const useStyles = makeStyles((theme) => ({
  panel: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  message: {
    marginRight: theme.spacing(2),
  },
  progress: {
    marginRight: theme.spacing(2),
  },
  button: {
    fontSize: theme.spacing(1.5),
    height: theme.spacing(4.25),
    textTransform: 'capitalize',
  },
}));

type Props = {
  isRequestInProgress: boolean;
  cancelRequest: () => void;
}

const BridgeAppControlPanel: Component<Props> = ({
  isRequestInProgress,
  cancelRequest,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!isRequestInProgress) return null;

  return (
    <div className={classes.panel}>
      <div className={classes.message}>
        {t('messages.bridgeApp.waitingForMeasurement')}
      </div>

      <div>
        <CircularProgress size={24} color="inherit" className={classes.progress} />
      </div>

      <Button
        color="primary"
        onClick={cancelRequest}
        className={classes.button}
      >
        {t('labels.cancel')}
      </Button>
    </div>
  );
};

export default BridgeAppControlPanel;
