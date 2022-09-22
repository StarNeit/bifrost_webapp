import { IconButton, makeStyles } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Component } from '../../../types/component';
import ButtonMenu from '../../../components/ButtonMenu';

const useStyles = makeStyles((theme) => ({
  button: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.spacing(0.75),
    color: theme.palette.common.white,
  },
}));

type Props = Omit<ComponentProps<typeof IconButton>, 'type'> & {
  openNewSubstrateModal(): void,
  openEditSubstrateModal(): void,
  onSubstrateDeleteClick(): void,
  disableEdit?: boolean,
};

const SubstrateMenu: Component<Props> = ({
  openNewSubstrateModal,
  openEditSubstrateModal,
  onSubstrateDeleteClick,
  disableEdit,
  ...buttonProps
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <ButtonMenu
      dataTestIdButton="substrate-actions-options-button"
      dataTestIdMenu="substrate-actions-options-menu"
      type="icon"
      className={classes.button}
      icon={<MoreHorizIcon />}
      {...buttonProps}
    >
      <MenuItem data-testid="substrate-actions-new-item" onClick={openNewSubstrateModal}>{t('labels.new')}</MenuItem>
      <MenuItem data-testid="substrate-actions-edit-item" disabled={disableEdit} onClick={openEditSubstrateModal}>{t('labels.edit')}</MenuItem>
      <MenuItem data-testid="substrate-actions-export-item" disabled>{t('labels.export')}</MenuItem>
      <MenuItem data-testid="substrate-actions-delete-item" onClick={onSubstrateDeleteClick}>{t('labels.delete')}</MenuItem>
    </ButtonMenu>
  );
};

export default SubstrateMenu;
