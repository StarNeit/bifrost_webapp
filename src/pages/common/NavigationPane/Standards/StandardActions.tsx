import { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useTranslation } from 'react-i18next';

import { Component } from '../../../../types/component';
import ButtonMenu from '../../../../components/ButtonMenu';
import ConfirmationPopover from '../../../../components/ConfirmationPopover';

const menuOptions = [
  {
    option: 'new',
    testId: 'standard-actions-new-item',
  },
  {
    option: 'delete',
    testId: 'standard-actions-delete-item',
  },
  {
    option: 'edit',
    testId: undefined,
  },
  {
    option: 'search',
    testId: undefined,
  },
  // {
  //   option: 'report',
  //   testId: undefined,
  // },
] as const;

export type StandardMenuOption = (typeof menuOptions)[number]['option'];

const useStyles = makeStyles((theme) => ({
  button: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    padding: 0,
    borderRadius: theme.spacing(0.75),
  },
  menuItem: {
    width: theme.spacing(17),
  },
}));

type Props = {
  onOptionSelect(option: StandardMenuOption): void,
  disableEdit?: boolean,
};

const StandardActions: Component<Props> = ({ onOptionSelect, disableEdit }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [openConfirmationPopover, setOpenConfirmationPopover] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleDelete = () => {
    setOpenConfirmationPopover(true);
  };

  const handleConfirm = () => {
    setOpenConfirmationPopover(false);
    onOptionSelect('delete');
  };

  return (
    <>
      <ButtonMenu
        type="icon"
        dataTestIdButton="standard-actions-options-button"
        dataTestIdMenu="standard-actions-options-container"
        className={classes.button}
        ref={anchorRef}
        icon={<MoreHorizIcon />}
      >
        {menuOptions.map((option) => (
          <MenuItem
            key={option.option}
            data-testid={`standard-actions-${option.option.toLowerCase()}-item`}
            className={classes.menuItem}
            disabled={option.option === 'edit' && disableEdit}
            onClick={() => {
              if (option.option === 'delete') {
                handleDelete();
              } else {
                onOptionSelect(option.option);
              }
            }}
          >
            {t(`labels.${option.option}`)}
          </MenuItem>
        ))}
      </ButtonMenu>
      <ConfirmationPopover
        isDestructive
        onClose={() => setOpenConfirmationPopover(false)}
        message={t('labels.deleteStandardConfirmation')}
        open={openConfirmationPopover}
        anchorEl={anchorRef.current}
        cancelText={t('labels.cancel')}
        confirmText={t('labels.delete')}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default StandardActions;
