import { useTranslation } from 'react-i18next';
import HelpIcon from '@material-ui/icons/Help';
import { MenuItem } from '@material-ui/core';
import ButtonMenu from './ButtonMenu';
import config from '../config';
import { Component } from '../types/component';

const HelpMenu: Component = () => {
  const { t } = useTranslation();

  const openHelpUrl = () => {
    window.open(config.HELP_URL, '_blank', 'noopener, noreferrer');
  };

  return (
    <ButtonMenu
      type="icon"
      dataTestIdButton="help-menu-button"
      dataTestIdMenu="help-menu-container"
      icon={<HelpIcon />}
    >

      <MenuItem onClick={openHelpUrl}>
        {t('labels.help')}
      </MenuItem>

    </ButtonMenu>
  );
};

export default HelpMenu;
