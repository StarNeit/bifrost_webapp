import { Toolbar, AppBar, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import NavigationMenu from './NavigationMenu';
import LanguageMenu from './LanguageMenu';
import HelpMenu from './HelpMenu';
import { Component } from '../types/component';
import { Caption, TinyBold } from './Typography';
import TestDataButton from './TestDataButton';
import UserMenu from './UserMenu';
import Button from './Button';
import config from '../config';
import { AuturaLogo, XriteLogo } from './Logo';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1.5),
    position: 'relative',
  },
  button: {
    padding: theme.spacing(1, 1.5),
    textTransform: 'capitalize',
    margin: theme.spacing(0, 1),
  },
  auturaLogo: {
    width: theme.spacing(12),
    position: 'absolute',
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  xriteLogo: {
    width: theme.spacing(24),
    marginRight: theme.spacing(2),
    marginLeft: 'auto',
  },
}));

type Props = { title?: string, dataTestId?: string };

const openFeedbackPage = () => window.open(config.FEEDBACK_URL, '_blank', 'noopener, noreferrer');

const HeaderBar: Component<Props> = ({ title, dataTestId }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar} disableGutters>
        <NavigationMenu />
        <Caption data-testid={dataTestId}>{title}</Caption>

        <AuturaLogo className={classes.auturaLogo} />
        <XriteLogo className={classes.xriteLogo} />
        <div>
          <Button
            data-testid="feedback-button"
            variant="primary"
            className={clsx(classes.button)}
            onClick={openFeedbackPage}
          >
            <TinyBold>{t('labels.leaveFeedback')}</TinyBold>
          </Button>
          <LanguageMenu />
          {config.ENABLE_TEST_DATA_EXTRACTION && <TestDataButton />}
          <UserMenu />
          {config.HELP_URL && (
            <HelpMenu />
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderBar;
