import {
  TextField,
  Link,
  InputLabel,
  makeStyles,
} from '@material-ui/core';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '../data/authentication';
import config from '../config';
import { Component } from '../types/component';
import ErrorBox from '../components/ErrorBox';
import Button from '../components/Button';
import Page from '../components/Page';
import Panel from '../components/Panel';
import { AuturaLogo, XriteLogo } from '../components/Logo';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: theme.spacing(60),
    padding: theme.spacing(4),
    margin: 'auto',
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  textField: {
    margin: theme.spacing(2, 0),
  },
  logo: {
    alignSelf: 'center',
    marginBottom: theme.spacing(4),
    height: theme.spacing(5),
  },
  xriteLogo: {
    position: 'fixed',
    width: theme.spacing(24),
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
  forgotPasswordLink: {
    textAlign: 'right',
    marginBottom: theme.spacing(2),
  },
  errorBox: {
    marginBottom: theme.spacing(2),
  },
}));

const Login: Component = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    login,
    error,
    pending,
  } = useAuthentication();

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showInvalidUsernameWarning, setShowInvalidUsernameWarning] = useState(false);
  const [showInvalidPasswordWarning, setShowInvalidPasswordWarning] = useState(false);

  const handleUsernameInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowInvalidUsernameWarning(false);
    setUsername(event.target.value);
  };
  const handlePasswordInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowInvalidPasswordWarning(false);
    setPassword(event.target.value);
  };

  const submit = () => {
    const usernameIsValid = username.length > 0;
    const passwordIsValid = password.length > 0;

    if (!usernameIsValid) setShowInvalidUsernameWarning(true);
    if (!passwordIsValid) setShowInvalidPasswordWarning(true);

    if (usernameIsValid && passwordIsValid) {
      login(username, password);
    }
  };

  const handleUsernameKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter') return;
    passwordInputRef.current?.focus();
  };
  const handlePasswordKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter') return;
    submit();
  };

  const currentUrl = window.location.toString();
  const forgotPasswordUrl = `${config.FORGOT_PASSWORD_URL}?refer=${encodeURI(currentUrl)}`;

  return (
    <Page showHeader={false}>
      <Panel component="form" className={classes.form}>
        <AuturaLogo className={classes.logo} />
        <XriteLogo className={classes.xriteLogo} />

        <InputLabel>{t('labels.email')}</InputLabel>
        <TextField
          autoFocus
          className={classes.textField}
          type="email"
          data-testid="email-input"
          autoComplete="email"
          error={showInvalidUsernameWarning}
          helperText={showInvalidUsernameWarning && t('messages.validEmail')}
          disabled={pending}
          value={username}
          onChange={handleUsernameInput}
          onKeyPress={handleUsernameKeyPress}
        />

        <InputLabel>{t('labels.password')}</InputLabel>
        <TextField
          className={classes.textField}
          type="password"
          data-testid="password-input"
          autoComplete="current-password"
          error={showInvalidPasswordWarning}
          helperText={showInvalidPasswordWarning && t('messages.validPassword')}
          inputRef={passwordInputRef}
          disabled={pending}
          value={password}
          onChange={handlePasswordInput}
          onKeyPress={handlePasswordKeyPress}
        />

        {forgotPasswordUrl && (
          <Link className={classes.forgotPasswordLink} href={forgotPasswordUrl}>
            {t('labels.forgotPassword')}
          </Link>
        )}

        {error && <ErrorBox message={t('messages.invalidLogin')} className={classes.errorBox} />}

        <Button
          color="primary"
          data-testid="login-button"
          onClick={submit}
          showSpinner={pending}
        >
          {t('labels.login')}
        </Button>
      </Panel>
    </Page>
  );
};

export default Login;
