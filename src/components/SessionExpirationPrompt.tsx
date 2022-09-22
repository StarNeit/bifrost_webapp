import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { useSelector } from 'react-redux';

import { Component } from '../types/component';
import { Body, Title } from './Typography';
import Button from './Button';
import { useSessionRefresh } from '../data/authentication';
import config from '../config';

const useStyles = makeStyles((theme) => ({
  paper: {
    minWidth: theme.spacing(60),
  },
}));

const SessionExpirationPrompt: Component = () => {
  const { t } = useTranslation();
  const { showExpirationWarning } = useSelector((state) => state.authentication);
  const [secondsLeft, setSecondsLeft] = useState(config.SESSION_WARNING_COUNTDOWN_TIME / 1000);
  const classes = useStyles();
  const { refresh, waiting } = useSessionRefresh();

  useEffect(() => {
    if (showExpirationWarning) {
      setSecondsLeft(config.SESSION_WARNING_COUNTDOWN_TIME / 1000);
      const decrementSecondsLeft = () => setSecondsLeft((previous) => previous - 1);
      const intervalId = setInterval(decrementSecondsLeft, 1000);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [showExpirationWarning]);

  const formatTimeLeft = (s: number) => `0:${s.toString().padStart(2, '0')}`;

  return (
    <Dialog
      open={showExpirationWarning}
      data-testid="session-expiration-modal"
      classes={classes}
    >
      <DialogTitle disableTypography>
        <Title>
          {t('labels.warning')}
        </Title>
      </DialogTitle>
      <DialogContent>
        <Body>
          {t('messages.sessionExpirationTime', { time: formatTimeLeft(secondsLeft) })}
        </Body>
        <Body>
          {t('messages.sessionExpirationContinue')}
        </Body>
      </DialogContent>
      <DialogActions>
        <Button
          data-testid="session-expiration-modal-continue"
          variant="primary"
          color="primary"
          onClick={refresh}
          showSpinner={waiting}
        >
          {t('labels.continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpirationPrompt;
