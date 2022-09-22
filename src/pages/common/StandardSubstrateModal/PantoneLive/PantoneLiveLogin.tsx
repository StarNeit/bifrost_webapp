import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { createHash } from 'crypto';

import InputField from '../../../../components/InputField';
import Button from '../../../../components/Button';
import { Component } from '../../../../types/component';
import { usePantoneLiveConnection } from '../../../../data/pantone';
import PantoneLiveIcon from '../../../../assets/PantoneLiveIcon';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: theme.spacing(6),
    width: '100%',
  },
  form: {
    width: theme.spacing(32),
    marginBottom: theme.spacing(2),
  },
  pantoneLogo: {
    width: theme.spacing(16.25),
    height: theme.spacing(17.25),
    borderRadius: 5,
    backgroundColor: theme.palette.surface[4],
    marginBottom: theme.spacing(3.75),
  },
  button: {
    marginTop: theme.spacing(1),
    alignSelf: 'center',
    textTransform: 'capitalize',
    height: theme.spacing(5.25),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.surface[2],
    padding: theme.spacing(0.25),
    fontSize: theme.spacing(1.75),
    '&:hover': {
      backgroundColor: theme.palette.surface[3],
    },
  },
}));

const PantoneLiveLogin: Component = () => {
  const { t } = useTranslation();

  const classes = useStyles();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, skipLogin, status } = usePantoneLiveConnection();

  const onLogin = () => {
    const passwordHash = createHash('md5').update(password).digest('base64');
    login(username, passwordHash);
  };

  return (
    <Fade in>
      <div className={classes.root}>
        <span className={classes.pantoneLogo}>
          <PantoneLiveIcon />
        </span>

        <InputField
          className={classes.form}
          placeholder={t('labels.username')}
          value={username}
          onChange={setUsername}
        />

        <InputField
          className={classes.form}
          placeholder={t('labels.password')}
          type="password"
          value={password}
          onChange={setPassword}
        />

        <Button
          color="primary"
          className={clsx(classes.button, classes.form)}
          showSpinner={status === 'connecting-authenticated'}
          disabled={status === 'connecting-public'}
          onClick={onLogin}
        >
          {t('labels.login')}
        </Button>

        <Button
          color="primary"
          className={clsx(classes.button, classes.form)}
          showSpinner={status === 'connecting-public'}
          disabled={status === 'connecting-authenticated'}
          onClick={skipLogin}
        >
          {t('labels.continueWithPublicAccess')}
        </Button>
      </div>
    </Fade>
  );
};

export default PantoneLiveLogin;
