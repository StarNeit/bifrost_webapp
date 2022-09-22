import { useTranslation } from 'react-i18next';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { MenuItem } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import ButtonMenu from './ButtonMenu';
import { Component } from '../types/component';
import { setSession } from '../data/reducers/authentication';

const UserMenu: Component = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(setSession());
  };

  return (
    <ButtonMenu
      type="icon"
      dataTestIdButton="user-menu-button"
      dataTestIdMenu="user-menu-container"
      icon={<AccountCircleIcon />}
    >
      <MenuItem data-testid="user-menu-logout-menu-item" onClick={logout}>
        {t('labels.logout')}
      </MenuItem>
    </ButtonMenu>
  );
};

export default UserMenu;
