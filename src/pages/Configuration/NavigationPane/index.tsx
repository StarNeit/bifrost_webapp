import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import { useTranslation } from 'react-i18next';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ColorizeIcon from '@material-ui/icons/Colorize';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import GroupIcon from '@material-ui/icons/Group';
import HttpsIcon from '@material-ui/icons/Https';
import TvIcon from '@material-ui/icons/Tv';
import InfoIcon from '@material-ui/icons/Info';
import FormulaIcon from '../../../assets/FormulaIcon';

import Panel from '../../../components/Panel';
import NavigationItem from './NavigationItem';
import { Component } from '../../../types/component';
import { ConfigRoutePath } from '../../../types/configuration';
import { Subtitle } from '../../../components/Typography';
import { useSession } from '../../../data/authentication';

const useStyles = makeStyles((theme) => ({
  root: {
    width: theme.spacing(40),
    height: '100%',
  },
  title: {
    color: theme.palette.text.secondary,
    lineHeight: `${theme.spacing(2.75)}px`,
  },
  nav: {
    paddingTop: theme.spacing(0.75),
  },
}));

const NavigationPane: Component = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const session = useSession();

  const navigationItems = [
    {
      key: ConfigRoutePath.Colorimetric,
      icon: VisibilityIcon,
      label: t('labels.colorimetry'),
    },
    {
      key: ConfigRoutePath.Assortment,
      icon: ColorizeIcon,
      label: t('labels.assortmentsAndColorants'),
    },
    {
      key: ConfigRoutePath.Formulation,
      icon: FormulaIcon,
      label: t('labels.formulation'),
    },
    {
      key: ConfigRoutePath.Users,
      icon: AccountCircleIcon,
      label: t('labels.users'),
      disabled: !session.hasAdminAccess,
    },
    {
      key: ConfigRoutePath.Groups,
      icon: GroupIcon,
      label: t('labels.groups'),
      disabled: !session.hasAdminAccess,
    },
    {
      key: ConfigRoutePath.AccessControl,
      icon: HttpsIcon,
      label: t('labels.accessControl'),
    },
    {
      key: ConfigRoutePath.BridgeApp,
      icon: TvIcon,
      label: t('labels.bridgeApp'),
    },
    {
      key: ConfigRoutePath.About,
      icon: InfoIcon,
      label: t('labels.about'),
    },
  ];

  return (
    <Panel className={classes.root}>
      <Subtitle className={classes.title}>
        {t('labels.navigation')}
      </Subtitle>

      <List
        className={classes.nav}
        component="nav"
      >
        {navigationItems.map((navigationItem) => {
          if (navigationItem.disabled) return null;
          return (
            <NavigationItem
              key={navigationItem.key}
              icon={navigationItem.icon}
              label={navigationItem.label}
              path={navigationItem.key}
            />
          );
        })}
      </List>
    </Panel>
  );
};

export default NavigationPane;
