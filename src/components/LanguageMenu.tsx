import LanguageIcon from '@material-ui/icons/Language';
import { MenuItem } from '@material-ui/core';
import ButtonMenu from './ButtonMenu';
import languageNames from '../i18n/languages.json';
import { Component, ClassNameProps } from '../types/component';
import { changeLanguage } from '../i18n';

const names = languageNames as { [code: string]: string };
const codes = Object.keys(names);

const LanguageMenu: Component<ClassNameProps> = ({ className }) => {
  return (
    <ButtonMenu
      type="icon"
      dataTestIdButton="languange-menu-button"
      dataTestIdMenu="languange-menu-container"
      className={className}
      icon={<LanguageIcon />}
    >
      {codes.map((code) => (
        <MenuItem key={code} onClick={() => changeLanguage(code)}>
          {names[code]}
        </MenuItem>
      ))}
    </ButtonMenu>
  );
};

export default LanguageMenu;
