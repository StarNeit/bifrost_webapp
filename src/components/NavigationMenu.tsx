import { useTranslation } from 'react-i18next';
import MenuIcon from '@material-ui/icons/Menu';
import { MenuItem, makeStyles } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

import ButtonMenu from './ButtonMenu';
import RoutePathname from '../constants/route';
import { useNavigation } from '../data/navigation';
import { ClassNameProps, Component } from '../types/component';

const useStyles = makeStyles((theme) => ({
  iconButton: {
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.action.active,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const NavigationMenu: Component<ClassNameProps> = ({ className }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const location = useLocation();
  const classes = useStyles();

  return (
    <ButtonMenu
      type="icon"
      dataTestIdButton="hamburger-menu-button"
      dataTestIdMenu="hamburger-menu-container"
      icon={<MenuIcon />}
      className={clsx(classes.iconButton, className)}
    >
      <MenuItem
        data-testid="hamburger-qc-menu-item"
        onClick={navigation.goToQC}
        disabled={location.pathname === RoutePathname.QC}
      >
        {t('labels.qc')}
      </MenuItem>
      <MenuItem
        data-testid="hamburger-formulation-menu-item"
        onClick={navigation.goToFormulation}
        disabled={location.pathname === RoutePathname.Formulation}
      >
        {t('labels.formulation')}
      </MenuItem>
      <MenuItem
        data-testid="hamburger-correction-menu-item"
        onClick={navigation.goToCorrection}
        disabled={location.pathname === RoutePathname.Correction}
      >
        {t('labels.correction')}
      </MenuItem>
      {/*
      <MenuItem
        data-testid="hamburger-search-menu-item"
        onClick={navigation.goToSearch}
        disabled={location.pathname === RoutePathname.Search}
      >
        {t('labels.searchAndCorrect')}
      </MenuItem>
      */}
      <MenuItem
        data-testid="hamburger-import-menu-item"
        onClick={navigation.goToImport}
        disabled={location.pathname === RoutePathname.Import}
      >
        {t('labels.dbImport')}
      </MenuItem>
      <MenuItem
        data-testid="hamburger-configuration-menu-item"
        onClick={navigation.goToConfiguration}
        disabled={location.pathname === RoutePathname.Configuration}
      >
        {t('labels.configuration')}
      </MenuItem>
    </ButtonMenu>
  );
};

export default NavigationMenu;
